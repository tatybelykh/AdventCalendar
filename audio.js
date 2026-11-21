const background = new Audio('./The_Midnight_Advent.mp3');
background.loop = true;
background.preload = 'none';
background.volume = 0;
const treasureSound = new Audio('./magic-treasure.mp3');
const letterSound = new Audio('./magic-letter.mp3');
const EFFECT_VOLUME_SCALE = 0.8;
let preferences;
let activated = false;
let fade;
let active;
let external = false;
let warning = '';
const disposals = new Set();

export function setupAudio(settings) {
  preferences = settings;
  background.addEventListener('error', () => {
    warning = 'The_Midnight_Advent.mp3 could not be played.';
    report();
  });
  const activate = (event) => {
    if (!event.isTrusted) return;
    activated = true;
    document.removeEventListener('click', activate, true);
    updateMusic();
  };
  document.addEventListener('click', activate, true);
  window.addEventListener('blur', syncExternalVideo);
  window.addEventListener('focus', syncExternalVideo);
  document.addEventListener('visibilitychange', syncExternalVideo);
  report();
}

function report() {
  const control = document.querySelector('#music');
  control.setAttribute('aria-pressed', String(preferences.enabled));
  control.title = warning || (preferences.enabled ? 'Music on · settings' : 'Music off · settings');
  const status = document.querySelector('#audio-status');
  if (status) status.textContent = warning;
}

function updateEffectVolume(sound) {
  const volume = preferences.enabled ? preferences.volume * EFFECT_VOLUME_SCALE : 0;
  sound.volume = volume;
  if (volume === 0) sound.pause();
  return volume;
}

function playEffect(sound) {
  if (updateEffectVolume(sound) === 0) return;
  sound.currentTime = 0;
  return sound.play();
}

export const playTreasureSound = () => playEffect(treasureSound)?.catch(() => {});

export function playLetterSound() {
  const playback = playEffect(letterSound);
  if (!playback) return;
  return new Promise(resolve => {
    const listeners = new AbortController();
    const finish = () => {
      clearTimeout(timeout);
      listeners.abort();
      resolve();
    };
    const timeout = setTimeout(() => {
      letterSound.pause();
      finish();
    }, 5000);
    for (const event of ['ended', 'pause', 'error']) {
      letterSound.addEventListener(event, finish, { signal: listeners.signal });
    }
    playback.catch(finish);
  });
}

export function updateMusic() {
  report();
  updateEffectVolume(treasureSound);
  updateEffectVolume(letterSound);
  if (!activated) return;
  const playing = preferences.enabled && !active && (!external || calendarIsFocused());
  cancelAnimationFrame(fade);
  if (playing && background.paused) {
    background.volume = 0;
    background.play().catch((error) => {
      if (error.name === 'AbortError') return;
      warning = 'Music could not start. Try turning it on again.';
      report();
    });
  }
  const from = background.volume;
  const target = playing ? preferences.volume : 0;
  const start = performance.now();
  const animate = (now) => {
    const t = Math.min(1, (now - start) / 280);
    background.volume = Math.max(0, Math.min(1, from + (target - from) * t));
    if (t < 1) fade = requestAnimationFrame(animate);
    else if (!playing) background.pause();
  };
  fade = requestAnimationFrame(animate);
}

function quiet() {
  cancelAnimationFrame(fade);
  background.pause();
  background.volume = 0;
}

export function pauseForExternalVideo(event) {
  external = true;
  if (event.ctrlKey || event.metaKey) return;
  active?.stop();
  quiet();
  requestAnimationFrame(syncExternalVideo);
}

function calendarIsFocused() {
  return !document.hidden && document.hasFocus();
}

function syncExternalVideo() {
  if (!external) return;
  if (calendarIsFocused()) updateMusic();
  else quiet();
}

function take(token) {
  quiet();
  if (active === token) return;
  const previous = active;
  active = token;
  previous?.stop();
}
function release(token) {
  if (active !== token) return;
  active = undefined;
  updateMusic();
}
export function stopMedia() {
  const previous = active;
  active = undefined;
  previous?.stop();
  for (const dispose of disposals) dispose();
  disposals.clear();
  external = false;
  updateMusic();
}
export function register(media, onError) {
  const token = { stop: () => media.pause() };
  media.addEventListener('play', () => take(token));
  for (const event of ['ended', 'pause', 'error']) media.addEventListener(event, () => release(token));
  media.addEventListener('error', () => {
    if (media.getAttribute('src')) onError();
  });
  disposals.add(() => {
    media.pause();
    media.removeAttribute('src');
    media.load();
  });
}
