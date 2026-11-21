const KEY = 'your-advent-calendar.v1';
const TEACHER_NAME_KEY = KEY + '.teacher-name';
const DEFAULT_TEACHER_NAME = 'Tatiana';
export const TEACHER_NAME_MAX_LENGTH = 60;
const MAX_PROFILES = 500;
const data = { active: null, profiles: [], music: { enabled: false, volume: 0.15 }, motion:true };
const teacherNameChanges = new EventTarget();
let storageError = false;
let lastStored = null;
let timer;
let status = () => {};

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const validText = (value, limit) => typeof value === 'string' && value.length <= limit;

export function getTeacherName() {
  try {
    const name = localStorage.getItem(TEACHER_NAME_KEY)?.trim();
    if (name && validText(name, TEACHER_NAME_MAX_LENGTH)) return name;
  } catch {
    // The default is available even when browser storage is blocked.
  }
  return DEFAULT_TEACHER_NAME;
}

export function saveTeacherName(name) {
  const trimmed = name.trim();
  if (!trimmed || !validText(trimmed, TEACHER_NAME_MAX_LENGTH)) return false;
  try {
    localStorage.setItem(TEACHER_NAME_KEY, trimmed);
  } catch {
    return false;
  }
  teacherNameChanges.dispatchEvent(new Event('change'));
  return true;
}

export function watchTeacherName(update, signal) {
  teacherNameChanges.addEventListener('change', update, { signal });
  window.addEventListener('storage', event => {
    if (event.key === TEACHER_NAME_KEY || event.key === null) update();
  }, { signal });
}

const validAnswers = (answers) => {
  if (!record(answers) || Object.keys(answers).length > 200) return false;
  return Object.entries(answers).every(([key, value]) => {
    if (!/^[a-zA-Z0-9_-]{1,60}$/.test(key) || Object.hasOwn(Object.prototype, key) || key === 'prototype')
      return false;
    if (key === 'stage') return Number.isInteger(value) && value >= 0 && value <= 4;
    if (key === 'appleStage' || key === 'amazonStage')
      return Number.isInteger(value) && value >= 0 && value <= 3;
    if (key === 'revealSantaLaugh' || /^reveal[0-5]$/.test(key)) return typeof value === 'boolean';
    if (['matchOrder', 'sequence'].includes(key)) {
      const max = key === 'matchOrder' ? 8 : 6;
      return (
        Array.isArray(value) &&
        value.length <= max &&
        new Set(value).size === value.length &&
        value.every((i) => Number.isInteger(i) && i >= 0 && i < max)
      );
    }
    if (['heard', 'favourites', 'changes'].includes(key))
      return (
        Array.isArray(value) &&
        value.length <= (key === 'favourites' ? 3 : 8) &&
        value.every((entry) => validText(entry, 120))
      );
    return validText(value, 20000);
  });
};
const validProfile = (p) =>
  record(p) &&
  typeof p.id === 'string' &&
  /^[a-zA-Z0-9_-]{1,80}$/.test(p.id) &&
  validText(p.name, 60) &&
  p.name.trim() &&
  ['A2', 'B1'].includes(p.level) &&
  [4, 6].includes(p.goal) &&
  ['apple', 'amazon'].includes(p.video) &&
  record(p.lessons) &&
  Object.entries(p.lessons).every(
    ([key, l]) =>
      /^[1-8]$/.test(key) &&
      record(l) &&
      ['closed', 'started', 'complete'].includes(l.state) &&
      validText(l.notes, 20000) &&
      record(l.answers) &&
      validAnswers(l.answers),
  ) &&
  (p.prediction === null ||
    (record(p.prediction) &&
      validText(p.prediction.text, 600) &&
      p.prediction.text.trim() &&
      validText(p.prediction.date, 30) &&
      Number.isFinite(Date.parse(p.prediction.date))));

function validateProfiles(profiles) {
  return (
    Array.isArray(profiles) &&
    profiles.length <= MAX_PROFILES &&
    profiles.every(validProfile) &&
    new Set(profiles.map((p) => p.id)).size === profiles.length
  );
}

export function init(onStatus) {
  status = onStatus;
  try {
    const saved = localStorage.getItem(KEY);
    lastStored = saved;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version !== 1 || !validateProfiles(parsed.profiles)) throw new Error('Unreadable data');
      data.profiles = parsed.profiles;
      data.motion = parsed.motion !== false;
      data.active = data.profiles.some((p) => p.id === parsed.active)
        ? parsed.active
        : (data.profiles[0]?.id ?? null);
      data.music = {
        enabled: parsed.music?.enabled === true,
        volume:
          typeof parsed.music?.volume === 'number' ? Math.max(0, Math.min(1, parsed.music.volume)) : 0.15,
      };
    }
    localStorage.setItem(KEY + '.test', '1');
    localStorage.removeItem(KEY + '.test');
    status(saved ? 'Saved on this device' : '');
  } catch {
    storageError = true;
    status('Browser storage unavailable. Export a backup before leaving.');
  }
  window.addEventListener('pagehide', flushPending);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPending();
  });
  return data;
}

function persist(profiles, active) {
  clearTimeout(timer);
  timer = undefined;
  try {
    if (storageError) throw new Error('Storage unavailable');
    if (localStorage.getItem(KEY) !== lastStored) {
      status('Another tab changed the calendar. Export your work and reload before continuing.');
      return false;
    }
    const next = JSON.stringify({ version: 1, ...data, profiles, active });
    localStorage.setItem(KEY, next);
    lastStored = next;
    status('Saved on this device');
    return true;
  } catch {
    status('Save failed. Export a backup before leaving.');
    return false;
  }
}
export function flush() {
  return persist(data.profiles, data.active);
}

export function flushPending() {
  if (timer) flush();
}

export function scheduleSave() {
  clearTimeout(timer);
  status(storageError ? 'Browser storage unavailable. Export a backup before leaving.' : 'Saving…');
  timer = setTimeout(flush, 400);
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  'student-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
export const current = () => data.profiles.find((p) => p.id === data.active);
export const completed = (p) =>
  Object.keys(p?.lessons ?? {})
    .filter((id) => p.lessons[id].state === 'complete')
    .map(Number);
export function addProfile(name, level, goal, video) {
  const profile = { id: newId(), name, level, goal, video, lessons: {}, prediction: null };
  if (!validProfile(profile) || data.profiles.length >= MAX_PROFILES)
    throw new Error('Не удалось создать профиль.');
  data.profiles.push(profile);
  selectProfile(profile.id);
}
export function selectProfile(id) {
  if (!data.profiles.some((p) => p.id === id)) return;
  flushPending();
  data.active = id;
  flush();
}
export function removeProfile(id) {
  data.profiles = data.profiles.filter((p) => p.id !== id);
  if (data.active === id) data.active = data.profiles[0]?.id ?? null;
  flush();
}
export function resetAchievements(id) {
  const student = current();
  if (!student || student.id !== id) return false;
  const lessons = Object.fromEntries(
    Object.entries(student.lessons).map(([key, lesson]) => [key, { ...lesson, state: 'closed' }]),
  );
  const reset = { ...student, lessons, prediction: null };
  const profiles = data.profiles.map(profile => profile === student ? reset : profile);
  if (!persist(profiles, data.active)) return false;
  data.profiles = profiles;
  return true;
}
export function openLesson(profile, id) {
  const lesson = (profile.lessons[id] ??= { state: 'closed', answers: {}, notes: '' });
  if (lesson.state === 'closed') {
    lesson.state = 'started';
    flush();
  }
  return lesson;
}
export function makeBackup(single) {
  return { version: 1, profiles: single ? [single] : data.profiles };
}
export function chooseFilm(student, video) {
  if (student.video === video || !['apple', 'amazon'].includes(video)) return;
  const answers = student.lessons[8]?.answers;
  if (answers) {
    answers[student.video + 'Stage'] = answers.stage ?? 0;
    answers.stage = answers[video + 'Stage'] ?? 0;
  }
  student.video = video;
}
export async function readBackup(file) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Размер копии превышает 10 МБ.');
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('Не удалось прочитать JSON.');
  }
  if (!parsed || parsed.version !== 1 || !validateProfiles(parsed.profiles) || !parsed.profiles.length) {
    throw new Error('Неверная структура копии или неподдерживаемая версия.');
  }
  return parsed.profiles;
}
export function importProfiles(profiles, choices) {
  const result = [...data.profiles];
  for (const entry of profiles) {
    const index = result.findIndex((p) => p.id === entry.id);
    if (index < 0) result.push(entry);
    else if (choices.get(entry.id) === 'replace') result[index] = entry;
    else result.push({ ...entry, id: newId() });
  }
  if (!validateProfiles(result))
    throw new Error('Импорт превышает лимит профилей или содержит некорректные данные.');
  const active = data.active ?? result[0]?.id ?? null;
  if (!persist(result, active)) throw new Error('Импорт не сохранён. Экспортируйте текущую работу и проверьте статус сохранения перед повторной попыткой.');
  data.profiles = result;
  data.active = active;
}
