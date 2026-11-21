import { el, p, actions, button, field, select, download, details, section } from './ui.js';
import {
  addProfile,
  chooseFilm,
  current,
  flush,
  getTeacherName,
  importProfiles,
  makeBackup,
  readBackup,
  removeProfile,
  resetAchievements,
  saveTeacherName,
  TEACHER_NAME_MAX_LENGTH,
} from './profiles.js?v=teacher-name';
import { updateMusic } from './audio.js?v=playback-9';
const routes = [
  [4, 'Cozy Journey · 4 treasures'],
  [6, 'Winter Adventure · 6 treasures'],
];
const films = [
  ['apple', 'Misunderstood · Apple'],
  ['amazon', 'Joy Ride · Amazon'],
];

export function profileForm(app, initialGoal = 4, entered = null) {
  const name = el('input', {
    required: true,
    maxlength: 60,
    autocomplete: 'off',
    placeholder: 'Name or nickname',
  });
  const level = select(['A2', 'B1'], 'A2');
  const route = select(routes, initialGoal);
  const film = select(films, 'apple');
  const error = p('', { role: 'alert' });
  const add = (event) => {
    event.preventDefault();
    if (!name.value.trim()) {
      name.setCustomValidity('Enter a name or nickname.');
      name.reportValidity();
      return;
    }
    try {
      addProfile(name.value.trim(), level.value, Number(route.value), film.value);
    } catch (e) {
      error.textContent = e.message;
      return;
    }
    app.data.music.enabled = event.submitter?.value === 'music';
    flush();
    updateMusic();
    app.close();
    app.draw();
    entered?.();
  };
  name.oninput = () => name.setCustomValidity('');
  const form = el(
    'form',
    { onsubmit: add },
    p('Choose a route, then open any window. Each finished lesson adds a treasure to your collection.'),
    field('Student name', name),
    el('div', { class: 'columns' }, field('English level', level), field('Your route', route)),
    details('Cinema choice', field('Film for window 8', film)),
    error,
    actions(
      el('button', { type: 'submit', value: 'quiet', class: 'primary' }, 'Enter quietly'),
      el('button', { type: 'submit', value: 'music' }, 'Enter with music'),
    ),
  );
  app.panel('Welcome to the village', 'Your Advent Calendar', form);
}
export function musicPanel(app) {
  const music = app.data.music;
  const toggle = button(
    '',
    () => {
      music.enabled = !music.enabled;
      flush();
      updateMusic();
      paint();
    },
    { class: 'primary' },
  );
  const paint = () => {
    toggle.textContent = music.enabled ? 'Turn music off' : 'Turn music on';
    toggle.setAttribute('aria-pressed', String(music.enabled));
  };
  paint();
  const percentage = el('span', { 'aria-hidden': 'true' }, Math.round(music.volume * 100) + '%');
  const volume = el('input', {
    type: 'range',
    min: 0,
    max: 100,
    value: Math.round(music.volume * 100),
    oninput: (e) => {
      music.volume = Number(e.target.value) / 100;
      percentage.textContent = e.target.value + '%';
      updateMusic();
      flush();
    },
  });
  app.panel(
    'Music settings',
    'The Midnight Advent',
    actions(toggle),
    field(['Music and effects volume · ', percentage], volume),
    p('The music switch also controls sound effects. Lesson audio and video pause the music.'),
    p('', { id: 'audio-status', role: 'status' }),
  );
  updateMusic();
}
function backup(single) {
  const blob = new Blob([JSON.stringify(makeBackup(single), null, 2)], { type: 'application/json' });
  download(blob, 'advent-' + (single ? single.id : 'all-profiles') + '.json');
}
function backupPanel(app) {
  const message = p('', { role: 'alert' });
  const preview = el('div');
  let request = 0;
  const input = el('input', {
    type: 'file',
    accept: '.json,application/json',
    onchange: async (event) => {
      const turn = ++request;
      preview.replaceChildren();
      message.textContent = '';
      const file = event.target.files[0];
      if (!file) return;
      try {
        const profiles = await readBackup(file);
        if (turn !== request) return;
        const choices = new Map();
        const conflictFields = [];
        for (const incoming of profiles) {
          const existing = app.data.profiles.find((p) => p.id === incoming.id);
          if (!existing) continue;
          choices.set(incoming.id, 'both');
          conflictFields.push(
            field(
              'Конфликт с профилем «' + existing.name + '» (' + existing.id.slice(-6) + ')',
              select(
                [
                  ['both', 'Сохранить оба профиля'],
                  ['replace', 'Заменить этот профиль данными из копии'],
                ],
                'both',
                (v) => choices.set(incoming.id, v),
              ),
            ),
          );
        }
        preview.replaceChildren(
          p('Профилей в копии — ' + profiles.length + '.'),
          ...conflictFields,
          button(
            'Импортировать',
            () => {
              try {
                importProfiles(profiles, choices);
                app.draw();
                preview.replaceChildren();
                input.value = '';
                message.textContent = 'Профили импортированы.';
                settings(app, 'Профили импортированы.');
              } catch (e) {
                message.textContent = e.message;
              }
            },
            { class: 'primary' },
          ),
        );
      } catch (e) {
        if (turn === request) message.textContent = e.message;
      }
    },
  });
  return section(
    'Резервные копии',
    p('Прогресс хранится в этом браузере. Для другого устройства перенесите JSON-копию.'),
    actions(
      button('Экспорт всех профилей', () => backup(null), { disabled: !app.data.profiles.length }),
      button('Экспорт этого ученика', () => backup(current()), { disabled: !current() }),
    ),
    field('Открыть JSON-копию', input),
    preview,
    message,
  );
}
function confirmAchievementReset(app, student) {
  const message = p('', { role: 'alert' });
  app.panel(
    'Reset achievements?',
    'Настройки преподавателя',
    p([
      'Закрыть все окошки профиля ',
      el('strong', { style: 'overflow-wrap:anywhere' }, '«' + student.name + '»'),
      ' и сбросить его отметки о завершении, реликвии и предсказание?',
    ]),
    actions(
      button('Отмена', () => settings(app)),
      button('Подтвердить сброс', () => {
        if (!resetAchievements(student.id)) {
          message.textContent = 'Ошибка сохранения сброса. Проверьте статус в календаре.';
          return;
        }
        app.draw();
        app.close();
      }),
    ),
    message,
  );
}

export function teacherNameForm(onSave) {
  const message = p('', { role: 'status' });
  const name = el('input', {
    type: 'text',
    required: true,
    pattern: '.*\\S.*',
    maxlength: TEACHER_NAME_MAX_LENGTH,
    autocomplete: 'off',
    value: getTeacherName(),
    oninput: () => { message.textContent = ''; },
  });
  return el(
    'form',
    {
      onsubmit: event => {
        event.preventDefault();
        if (!saveTeacherName(name.value)) {
          message.textContent = 'Teacher name could not be saved.';
          return;
        }
        name.value = getTeacherName();
        message.textContent = 'Teacher name saved.';
        onSave?.();
      },
    },
    field('Teacher name', name),
    actions(el('button', { type: 'submit', class: 'primary' }, 'Save teacher name')),
    message,
  );
}

export function settings(app, status = '') {
  const student = current();
  const contents = [el('section', {}, teacherNameForm())];
  if (student) {
    const editName = el('input', { maxlength: 60, required: true, value: student.name });
    const lv = select(['A2', 'B1'], student.level);
    const route = select(routes, student.goal);
    const film = select(films, student.video);
    const form = el(
      'form',
      {
        onsubmit: (event) => {
          event.preventDefault();
          if (!editName.value.trim()) {
            editName.focus();
            return;
          }
          chooseFilm(student, film.value);
          Object.assign(student, {
            name: editName.value.trim(),
            level: lv.value,
            goal: Number(route.value),
          });
          flush();
          app.draw();
          settings(app, 'Изменения сохранены.');
        },
      },
      field('Имя ученика', editName),
      el('div', { class: 'columns' }, field('Уровень', lv), field('Маршрут', route)),
      field('Видео для окна 8', film),
      actions(
        el('button', { type: 'submit', class: 'primary' }, 'Сохранить изменения'),
        button('Reset achievements', () => confirmAchievementReset(app, student)),
        button('Удалить профиль', () => {
          app.panel(
            'Удалить профиль?',
            'Настройки преподавателя',
            p('Данные ученика «' + student.name + '» будут удалены из этого браузера.'),
            actions(
              button('Отмена', () => settings(app)),
              button('Подтвердить удаление', () => {
                removeProfile(student.id);
                app.draw();
                settings(app, 'Профиль удалён.');
              }),
            ),
          );
        }),
      ),
    );
    contents.push(section('Профиль ученика', form));
  } else contents.push(button('Создать профиль', () => profileForm(app)));
  contents.push(
    section('Оформление', el('label',{},el('input',{type:'checkbox',checked:app.data.motion,
      onchange:e=>{app.data.motion=e.target.checked;document.documentElement.dataset.motion=app.data.motion?'on':'off';flush();}
    }),' Мягкая анимация снега и огней')),
    backupPanel(app),
    details(
      'Справка для преподавателя',
      p(
        'Откройте любое окно. Ученик может отвечать устно. Нажмите Complete & collect, когда решите завершить задание. Можно вернуться к любому уроку.',
      ),
      p(
        'Подарок открывается вручную после четырёх или шести разных заданий. Смена маршрута сохраняет собранные сокровища и раскрытую карточку.',
      ),
      p(
        'Фоновая музыка — The Midnight Advent. Для коробочек используются файлы snow, paper, fire, mug, bells и wind в папке assets. В шаге Watch and predict выберите фильм и нажмите Open on YouTube под его названием. Ролик откроется в новой вкладке. К вопросу можно вернуться на вкладке календаря.',
      ),
      p(
        'Открывайте календарь в одной вкладке. Для сохранения важного прогресса регулярно экспортируйте копии.',
      ),
    ),
  );
  app.panel(
    'Настройки преподавателя',
    'Your Advent Calendar',
    status && p(status, { role: 'status' }),
    ...contents,
  );
}
