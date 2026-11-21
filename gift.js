import { actions, button, download, el, item, p } from './ui.js';
import { completed, current, flush, getTeacherName, watchTeacherName } from './profiles.js?v=teacher-name';
import { playLetterSound } from './audio.js?v=playback-9';
import { predictions } from './predictions.js';

const POSTCARD_WIDTH = 1200;
const POSTCARD_HEIGHT = 800;
const TITLE = 'Your 2027 prediction';
const SIGNATURE_FONT = '47px "Pinyon Script", Georgia, serif';
const POSTCARD_SERIF = '"Cormorant Garamond", Georgia, serif';

function lines(ctx, text, width) {
  const rows = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    const candidate = line ? line + ' ' + word : word;
    if (ctx.measureText(candidate).width <= width) {
      line = candidate;
      continue;
    }
    if (line) rows.push(line);
    line = '';
    if (ctx.measureText(word).width <= width) {
      line = word;
      continue;
    }
    for (const character of word) {
      if (line && ctx.measureText(line + character).width > width) {
        rows.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) rows.push(line);
  return rows;
}

function fitLines(ctx, text, width, height, maxSize) {
  for (let size = maxSize; ; size -= 2) {
    ctx.font = '600 ' + size + 'px ' + POSTCARD_SERIF;
    const rows = lines(ctx, text, width);
    const leading = size * 1.16;
    if (rows.length * leading <= height || size <= 14) return { rows, leading };
  }
}

async function createPostcard(student, signature) {
  const village = document.querySelector('.village-image');
  const fir = new Image();
  fir.src = './fir-corner.png';
  await Promise.all([
    village.decode(),
    fir.decode(),
    document.fonts.load('62px Gloock', TITLE),
    document.fonts.load('600 52px "Cormorant Garamond"', student.name + ' ' + student.prediction.text),
    document.fonts.load(SIGNATURE_FONT, signature),
  ]);
  const canvas = el('canvas', { width: POSTCARD_WIDTH, height: POSTCARD_HEIGHT });
  const ctx = canvas.getContext('2d');
  const center = POSTCARD_WIDTH / 2;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(village, 0, 0, POSTCARD_WIDTH, POSTCARD_HEIGHT);
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, 'rgba(4,14,30,.08)');
  sky.addColorStop(.62, 'rgba(4,14,30,.56)');
  sky.addColorStop(1, 'rgba(4,14,30,0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, POSTCARD_WIDTH, 280);

  ctx.strokeStyle = '#e1b676';
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, POSTCARD_WIDTH - 50, POSTCARD_HEIGHT - 50);
  const branchWidth = 272;
  const branchHeight = branchWidth * fir.naturalHeight / fir.naturalWidth;
  for (const [x, y] of [[0, 0], [POSTCARD_WIDTH, 0], [0, POSTCARD_HEIGHT], [POSTCARD_WIDTH, POSTCARD_HEIGHT]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(x === 0 ? 1 : -1, y === 0 ? 1 : -1);
    ctx.drawImage(fir, 15, 15, branchWidth, branchHeight);
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe6b0';
  ctx.font = '62px Gloock, Georgia, serif';
  ctx.fillText(TITLE, center, 103);
  ctx.fillStyle = '#fff3d8';
  const name = fitLines(ctx, student.name, 760, 86, 48);
  name.rows.forEach((row, i) => ctx.fillText(row, center, 174 + i * name.leading));

  const wish = fitLines(ctx, student.prediction.text, 810, 270, 54);
  const wishHeight = wish.rows.length * wish.leading;
  const panelTop = 246;
  ctx.fillStyle = 'rgba(8,22,40,.87)';
  ctx.beginPath();
  ctx.roundRect(150, panelTop, 900, wishHeight + 101, 18);
  ctx.fill();
  ctx.fillStyle = '#fff5df';
  wish.rows.forEach((row, i) => ctx.fillText(row, center, panelTop + 20 + (i + .5) * wish.leading));
  ctx.font = SIGNATURE_FONT;
  ctx.fillStyle = '#efcb84';
  ctx.fillText(signature, center, panelTop + wishHeight + 64, 810);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Postcard encoding failed'));
    }, 'image/png');
  });
}

function showPostcard(app, student, view, effects, animate = false) {
  const dialog = view.closest('dialog');
  const lifetime = new AbortController();
  let previewUrl;
  let png;
  let requestedName;
  let renderVersion = 0;
  const downloadButton = button('Download PNG', () => download(png, 'your-2027-prediction.png'), { class: 'primary' });
  const controls = actions(
    downloadButton,
    button('Teacher settings', app.editTeacherName),
    button('Back to the village', app.close),
  );

  dialog.addEventListener('close', () => {
    lifetime.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, { once: true, signal: lifetime.signal });

  async function render(name) {
    const version = ++renderVersion;
    const isCurrent = () =>
      version === renderVersion && view.isConnected && dialog.open && !lifetime.signal.aborted;
    if (!isCurrent()) return;
    requestedName = name;
    view.setAttribute('aria-busy', 'true');
    downloadButton.disabled = true;
    let url;
    try {
      const signature = 'With warm wishes, ' + name;
      const [blob] = await Promise.all([createPostcard(student, signature), effects]);
      if (!isCurrent()) return;
      url = URL.createObjectURL(blob);
      const image = el('img', {
        class: 'prediction-postcard', src: url, width: POSTCARD_WIDTH, height: POSTCARD_HEIGHT, tabindex: -1,
        alt: [TITLE, student.name, student.prediction.text, signature].join('\n'),
      });
      await image.decode();
      if (!isCurrent()) return;

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = url;
      png = blob;
      downloadButton.disabled = false;
      const previousImage = view.querySelector('.prediction-postcard');
      if (previousImage) {
        const hadFocus = document.activeElement === previousImage;
        previousImage.replaceWith(image);
        if (hadFocus) image.focus({ preventScroll: true });
      } else {
        const opening = animate && view.querySelector('.prediction-mailbox');
        dialog.querySelector('#panel-title').parentElement.classList.add('sr-only');
        view.replaceChildren(el('div', { class: opening ? 'prediction-letter opening' : 'prediction-letter' }, image, controls));
        image.focus({ preventScroll: true });
      }
    } catch {
      if (!isCurrent()) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
      view.replaceChildren(el('div', { class: 'prediction-letter' },
        p('The postcard could not be created.', { class: 'prediction-status', role: 'status' }),
        p(student.prediction.text, { class: 'prediction-status' }),
        actions(
          button('Try again', () => render(getTeacherName()), { class: 'primary' }),
          button('Back to the village', app.close),
        ),
      ));
    } finally {
      if (url && url !== previewUrl) URL.revokeObjectURL(url);
      if (isCurrent()) view.removeAttribute('aria-busy');
    }
  }

  watchTeacherName(() => {
    const name = getTeacherName();
    if (name !== requestedName) render(name);
  }, lifetime.signal);
  render(getTeacherName());
}

function scatterSparks(mailbox) {
  const spread = Math.min(270, mailbox.clientWidth * .34);
  const count = 18;
  const burst = el('div', { class: 'prediction-sparks', 'aria-hidden': 'true' },
    Array.from({ length: count }, (_, i) => {
      const angle = (i * 2 * Math.PI) / count;
      const distance = spread * (.55 + (i % 5) * .11);
      return el('span', { class: 'prediction-spark', style: [
        '--spark-x:' + Math.round(Math.cos(angle) * distance) + 'px',
        '--spark-y:' + Math.round(Math.sin(angle) * distance * .58) + 'px',
        '--spark-size:' + (3 + (i % 4)) + 'px',
        '--spark-delay:' + ((i % 5) * 16) + 'ms',
      ].join(';') });
    }),
  );
  mailbox.append(burst);
  return Promise.allSettled(burst.getAnimations({ subtree: true }).map(animation => animation.finished))
    .then(() => burst.remove());
}

export function gift(app) {
  const student = current();
  if (!student) return app.create();
  const count = completed(student).length;
  if (!student.prediction && count < student.goal) {
    app.panel(
      'Your 2027 prediction',
      'A surprise is waiting',
      el(
        'div',
        { class: 'envelope' },
        item(8),
        p(
          'Collect ' +
            (student.goal - count) +
            ' more ' +
            (student.goal - count === 1 ? 'treasure' : 'treasures') +
            ' to open your gift.',
        ),
      ),
      actions(button('Back to the village', app.close)),
    );
    return;
  }
  const view = el('div', { class: 'prediction-view' });
  if (student.prediction) {
    view.append(p('Preparing your postcard…', { class: 'prediction-status', role: 'status' }));
    app.panel('A letter for ' + student.name, TITLE, view);
    showPostcard(app, student, view);
    return;
  }

  const mailbox = el('div', { class: 'prediction-mailbox' });
  const reveal = () => {
    if (student.prediction) return;
    student.prediction = {
      text: predictions[Math.floor(Math.random() * predictions.length)],
      date: new Date().toISOString(),
    };
    flush();
    app.draw();
    envelope.disabled = true;
    revealButton.disabled = true;
    const animate = app.data.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sparks = animate ? scatterSparks(mailbox) : undefined;
    const effects = Promise.all([sparks, playLetterSound()]);
    showPostcard(app, student, view, effects, animate);
  };
  const envelope = button(el('img', { src: './prediction-envelope.png', alt: '', width: 1542, height: 1020 }),
    reveal, { class: 'prediction-envelope', 'aria-label': 'Open the envelope' });
  const revealButton = button('Reveal my prediction', reveal, { class: 'primary' });
  mailbox.append(envelope);
  view.append(mailbox, el('div', { class: 'prediction-invitation' },
    p('A winter wish is tucked inside your gift'), revealButton,
  ));
  app.panel('A letter for ' + student.name, TITLE, view);
}
