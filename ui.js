export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name.startsWith('on') && typeof value === 'function') node.addEventListener(name.slice(2), value);
    else if (value !== undefined && value !== null && value !== false) node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...children.flat(Infinity).filter(child => child != null && child !== false));
  return node;
}

export const button = (label, onClick, attrs = {}) => el('button', { type: 'button', onclick: onClick, ...attrs }, label);
export const actions = (...items) => el('div', { class: 'actions' }, items);
export const section = (title, ...items) => el('section', {}, el('h3', {}, title), items);
export const details = (title, ...items) => el('details', {}, el('summary', {}, title), items);
export const p = (text, attrs) => el('p', attrs, text);
export const item = index => el('span', { class: 'item', 'aria-hidden': 'true', style: '--col:' + index % 4 + ';--row:' + Math.floor(index / 4) });

export function select(options, value, change, attrs = {}) {
  const field = el('select', { ...attrs, onchange: event => change?.(event.target.value) },
    options.map(option => {
      const [key, label] = Array.isArray(option) ? option : [option, option];
      return el('option', { value: key }, label);
    }));
  field.value = String(value ?? '');
  return field;
}

export function field(label, input) {
  return el('label', { class: 'field' }, label, input);
}

export function textField(label, value, change, attrs = {}) {
  const input = el('textarea', { maxlength: 20000, oninput: event => change(event.target.value), ...attrs });
  input.value = typeof value === 'string' ? value : '';
  return field(label, input);
}

export function checks(options, chosen, update) {
  const values = new Set(Array.isArray(chosen) ? chosen.filter(v => options.includes(v)) : []);
  return el('div', {}, options.map(option => el('label', { class: 'field' }, el('input', {
    type: 'checkbox', checked: values.has(option),
    onchange: event => {
      if (event.target.checked) values.add(option);
      else values.delete(option);
      update([...values]);
    },
  }), ' ', option)));
}

export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
