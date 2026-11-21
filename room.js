import { el } from './ui.js';

// Anchors use the bottom centre of each object in the 1536 × 1024 photograph.
function prop(name, x, y, width, height, angle = 0) {
  const node = el('img', {
    class: 'room-prop',
    src: new URL('./assets/room/' + name + '.webp', import.meta.url).href,
    alt: '',
    draggable: 'false',
  });
  Object.assign(node.style, {
    left: x + '%', bottom: (100 - y) + '%', width: width + '%', height: height + '%',
    transform: 'translateX(-50%) rotate(' + angle + 'deg)',
    transformOrigin: 'center bottom',
  });
  return node;
}

function snowyTrail() {
  const src = new URL('./assets/room/snowy-trail.png', import.meta.url).href;
  return el('div', { class: 'room-trail', 'aria-hidden': 'true' },
    ['hearth', 'floor', 'window'].map(part => el('img', {
      class: 'room-trail-' + part, src, alt: '', draggable: 'false',
    })),
  );
}

export function roomScene(after = false) {
  const label = after
    ? 'Evening room. An open book, an unlit candle and a green parcel are on the coffee table. The red scarf lies on the rug. Snowy footprints lead from the window to the fireplace.'
    : 'Evening room. A blue mug, a closed book and a lit candle sit on the coffee table. A red scarf rests on the armchair.';
  return el('div', { class: 'room', role: 'img', 'aria-label': label },
    after && snowyTrail(),
    after ? prop('scarf', 81.5, 90, 11.5, 9, -10) : prop('scarf', 64, 55, 12, 10, -7),
    !after && prop('mug', 23, 77.5, 7, 11),
    after ? prop('open-book', 42, 80, 16, 8.5, 4) : prop('closed-book', 42, 80, 10, 8.5, 4),
    after && prop('gift', 64, 77.5, 9.3, 13.5),
    after ? prop('unlit-candle', 31.5, 73.5, 6, 8.7) : prop('lit-candle', 31.5, 73.5, 6, 10.6),
  );
}
