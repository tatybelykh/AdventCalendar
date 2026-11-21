import { actions, button, details, el, field, item, p, section, select, textField } from './ui.js';
import {
  completed,
  chooseFilm,
  current,
  flush,
  flushPending,
  init,
  openLesson,
  scheduleSave,
  selectProfile,
} from './profiles.js?v=teacher-name';
import { beforeTheEnding, clips, lessons, speakingPrompts } from './lessons.js?v=tasks-47';
import { activity, stages, pageCounts, pageUnits, roomThemes, winterReasons } from './activities.js?v=cinema-youtube';
import { playTreasureSound, setupAudio, stopMedia } from './audio.js?v=playback-9';
import { musicPanel, profileForm, settings, teacherNameForm } from './admin.js?v=cinema-youtube';
import { gift } from './gift.js?v=teacher-name';

const $ = (id) => document.getElementById(id);
const dialog = $('panel');
const status = $('save-status');
const data = init((message) => {
  status.textContent = message;
  const echo = dialog.querySelector('.save-echo');
  if (echo) echo.textContent = message;
});
setupAudio(data.music);
document.documentElement.dataset.motion = data.motion ? 'on' : 'off';
let returnFocus;
let opening;
let initialGoal = 4;
const app = { data, panel, close: () => dialog.close(), draw, create: () => profileForm(app, initialGoal), editTeacherName };

function preparePanel(title, kicker, ...children) {
  stopMedia();
  flushPending();
  dialog.classList.remove('lesson-room');
  delete dialog.dataset.room;
  if (!dialog.open) returnFocus = document.activeElement;
  dialog.replaceChildren($('panel-frame').content.cloneNode(true));
  $('panel-title').textContent = title;
  $('panel-kicker').textContent = kicker;
  dialog.querySelector('.panel-body').append(...children.filter(Boolean));
  dialog.querySelector('.panel-close').onclick = app.close;
}

function showPanel() {
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  $('panel-title').focus({ preventScroll: true });
}

function panel(title, kicker, ...children) {
  preparePanel(title, kicker, ...children);
  showPanel();
}
dialog.addEventListener('close', () => {
  stopMedia();
  flushPending();
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
dialog.addEventListener('click', (e) => {
  if (e.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)
    dialog.close();
});

function toolSheet(title, ...children) {
  const sheet = el('dialog', { class: 'tool-sheet', 'aria-label': title });
  const opener = document.activeElement;
  sheet.append(el('div', {class:'sheet-heading'}, el('h2', {}, title),
    button('×', () => sheet.close(), {'aria-label':'Close '+title, class:'panel-close'})),
    el('div', {class:'sheet-body'}, children));
  document.body.append(sheet);
  sheet.addEventListener('close', () => { flushPending(); sheet.remove(); if (opener?.isConnected) opener.focus(); }, {once:true});
  sheet.showModal();
  return sheet;
}

function editTeacherName() {
  const form = teacherNameForm(() => sheet.close());
  form.classList.add('panel-body');
  const sheet = toolSheet('Teacher settings', form);
  form.querySelector('input').focus();
}

function showPastTenses() {
  toolSheet(
    'Past tenses for telling a story',
    el('div', { class: 'past-tenses' },
      section(
        'Past Simple',
        p('Use it for the main events.'),
        p('Form — verb + -ed or irregular past form'),
        p(['I ', el('strong', {}, 'missed'), ' the bus.']),
      ),
      section(
        'Past Continuous',
        p('Use it for an action that was in progress when something else happened.'),
        p('Form — was / were + verb-ing'),
        p([
          'I ', el('strong', {}, 'was waiting'), ' for the next bus when I ',
          el('strong', {}, 'ran into'), ' an old friend.',
        ]),
      ),
      section(
        'Past Perfect',
        p('Use it for something that happened before another moment in the past.'),
        p('Form — had + past participle'),
        p(['When we got to the ice rink, it ', el('strong', {}, 'had already closed'), '.']),
      ),
    ),
  );
}

function fitWinterReasons() {
  const reasons = dialog.querySelector('.winter-reasons');
  if (!dialog.open || !reasons) return;
  reasons.hidden = false;
  reasons.hidden = dialog.scrollHeight > dialog.clientHeight;
}
new ResizeObserver(fitWinterReasons).observe(dialog, { box: 'border-box' });

const taskMetadata = new Set(['stage', 'pageInStep', 'appleStage', 'amazonStage', 'matchOrder']);
function hasTaskAnswers(answers) {
  return Object.entries(answers).some(([key, value]) => {
    if (taskMetadata.has(key)) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value === true;
  });
}

function lessonScreen(id, displayStage) {
  const student = current();
  const lesson = openLesson(student,id);
  const [title, intro, , language, a2, b1] = lessons[id-1];
  const labels = stages[id-1];
  const counts = pageCounts[id-1];
  const stage = displayStage ?? lesson.answers.stage;
  let step = labels[stage] ? stage : 0;
  // Resume the new final part if an older profile was on the former part three.
  if (id === 2 && stage === 2) step = 1;
  const savedPage = Number(lesson.answers.pageInStep);
  const part = Number.isInteger(savedPage) && savedPage >= 0 ? Math.min(savedPage, counts[step]-1) : 0;
  const position = counts.slice(0,step).reduce((s,n)=>s+n,0)+part;
  const total = counts.reduce((s,n)=>s+n,0);
  const room = roomThemes[id-1];
  const save = (key,value,typed=false) => {
    lesson.answers[key]=value;
    (typed ? scheduleSave : flush)();
  };
  const go = (target, page=0) => {
    lesson.answers.stage=target;
    lesson.answers.pageInStep=String(page);
    flush();
    lessonScreen(id);
  };
  const reset = () => {
    const answers = lesson.answers;
    if (hasTaskAnswers(answers) && !window.confirm('Start this task again? Your answers for this task will be cleared.')) return;
    lesson.answers = {};
    if (!flush()) {
      lesson.answers = answers;
      return;
    }
    lessonScreen(id);
  };
  const early = id===5 && step<3 ? beforeTheEnding.story : id===8 && step<2 ? beforeTheEnding[student.video] : null;
  const prompts = early ?? (id===8 ? clips[student.video] : speakingPrompts[id-1]);
  const support = {
    A2:['A2 · Sentence starters', early ? 'Describe what you notice, then make a guess.' : a2,prompts.a2],
    B1:['B1 · Go further', early ? 'Give one reason for your prediction.' : b1,prompts.b1],
  };
  const sortingWinterList = id === 1 && step === 1;
  const notes = () => toolSheet('Teacher notes',textField('Private lesson notes',lesson.notes,value=>{lesson.notes=value;scheduleSave();}));
  const help = () => {
    const [heading,hint,model]=support[student.level];
    const [other,tip,sample]=support[student.level==='A2'?'B1':'A2'];
    toolSheet('Useful language',sortingWinterList && winterReasons(),
      el('ul',{class:'phrase-bank'},(early?.language || language || clips[student.video].language).split(' · ').map(s=>el('li',{},s))),
      el('h3',{},heading),p(hint),p(model),details(other,p(tip),p(sample)));
  };
  const collectedLabel = 'Treasure collected ✓';
  const collected = lesson.state === 'complete';
  const collectButton = button(collected ? collectedLabel : 'Complete & collect', finish, {
    disabled: collected,
    hidden: id === 2 && !collected && position < total - 1,
    class: 'collect-button',
  });
  function finish() {
    if (lesson.state === 'complete') return;
    lesson.state = 'complete';
    const saved = flush();
    draw();
    const count = completed(student).length;
    panel(
      lessons[id - 1][2],
      'Treasure collected',
      el('div', { class: 'envelope' },
        item(id - 1),
        p(count + ' of ' + student.goal + ' treasures collected.'),
        count >= student.goal && !student.prediction && p('Your gift is ready to open in the village.'),
        actions(button('Back to the village', app.close, { class: 'primary' })),
      ),
    );
    if (saved) playTreasureSound();
  }
  preparePanel(title,'Window '+id+' · '+student.level);
  dialog.classList.add('lesson-room');
  dialog.dataset.room=room;
  const head=dialog.querySelector('.panel-head');
  const page=dialog.querySelector('.panel-body');
  const paper=el('div',{class:'lesson-paper'});
  const scene=el('div',{class:'room-backdrop','aria-hidden':'true'});
  const effects=el('div',{class:'room-effects','aria-hidden':'true'},
    el('span',{class:'lamp-light'}),el('span',{class:'garland-light'}));
  const steps=el('nav',{'aria-label':'Lesson parts',class:'lesson-nav'},
    labels.map((name,n)=>button(String(n+1),()=>go(n),{
      'aria-label':'Part '+(n+1)+': '+name, title:name,'aria-current':n===step?'step':null,
      disabled:(id===5 || id===8) && n>step,
    })));
  const filmChoice=id===8 && select(Object.entries(clips).map(([code,film])=>[code,film.title]),student.video,value=>{
    chooseFilm(student,value);
    flush();
    // Keep the opening and viewing steps visible when switching films.
    lessonScreen(id, step < 2 ? step : undefined);
  },{'aria-label':'Film for this student',class:'film-select'});
  const tools = el('div', { class: 'lesson-head-tools' },
    filmChoice,
    button('Useful language', help, { class: 'lang-button' }),
    id === 2 && step === 0 && button('Past tenses', showPastTenses, { 'aria-haspopup': 'dialog' }),
  );
  head.insertBefore(tools, head.lastElementChild);
  const content=el('div',{class:'activity','data-step':step,'data-part':part});
  page.replaceChildren(el('div',{class:'lesson-stage'},el('div',{},el('h3',{class:'stage-title'},
    el('span',{class:'part-label'},'Part '+(step+1)+' · '), labels[step]),
    position===0 && p(intro,{class:'lesson-intro'})),steps),content);
  const next = position<total-1 ? button('Next',()=>part+1<counts[step]?go(step,part+1):go(step+1),{class:'next primary'})
    : button('Back to the village',app.close,{class:'next'});
  const back=button('Back',()=>position===0?app.close():part>0?go(step,part-1):go(step-1,counts[step-1]-1));
  const progressLabel = el('span', { class: 'part-progress', role: 'status', hidden: true });
  const showProgress = (unit, index, count) => {
    progressLabel.textContent = unit + ' ' + index + ' of ' + count;
    progressLabel.hidden = false;
  };
  if (counts[step] > 1) showProgress(pageUnits[room]?.[step] ?? 'Page', part + 1, counts[step]);
  const resetTask = button('Reset task', reset, { class:'reset-button' });
  const foot=el('div',{class:'lesson-foot'},button('Teacher notes',notes,{class:'notes-button'}),
    el('div',{class:'page-controls'},back,progressLabel,next,resetTask),
    collectButton);
  paper.append(head,page,foot,el('small',{class:'save-echo',role:'status'},status.textContent));
  dialog.replaceChildren(el('div',{class:'room-scenery','aria-hidden':'true'},
    el('div',{class:'room-environment'},scene,effects)),paper);
  content.append(activity(id,step,student,lesson,save,part,toolSheet,showProgress));
  showPanel();
  if (sortingWinterList) {
    fitWinterReasons();
    document.fonts.ready.then(fitWinterReasons);
  }
}

const snowflakeCount = 72;
document.querySelector('.snow').append(...Array.from({ length: snowflakeCount }, (_, index) => {
  const duration = 12 + Math.random() * 12;
  const startX = (index + Math.random()) * 100 / snowflakeCount;
  return el('span', {
    class: 'snowflake',
    style: [
      '--flake-x:' + startX + '%',
      '--flake-size:' + (1.5 + Math.random() * 3) + 'px',
      '--flake-opacity:' + (0.25 + Math.random() * 0.55),
      '--flake-drift:' + ((Math.random() - 0.5) * 80) + 'px',
      '--flake-duration:' + duration + 's',
      '--flake-delay:' + (-Math.random() * duration) + 's',
    ].join(';'),
  });
}));

const xs = [17.82, 39.85, 61.52, 82.8];
const windowButtons = lessons.map((lesson, i) => {
  const id = i + 1;
  const x = xs[Math.floor(i / 2)];
  const y = i % 2 === 0 ? 33.3 : 51.8;
  const b = button(
    [
      el('span', {
        class: 'lit',
        style: '--inside-x:' + (Math.floor(i / 2) * 100) / 3 + '%;--inside-y:' + (i % 2) * 100 + '%',
      }),
      el('span', { class: 'shutter left' }),
      el('span', { class: 'shutter right' }),
      el('span', { class: 'plaque' }, String(id)),
      el('span', { class: 'window-check', 'aria-hidden': 'true' }, '✓'),
      el('span', { class: 'window-name' }),
    ],
    () => {
      if (!current()) return profileForm(app, initialGoal, () => start(id));
      start(id);
    },
    {
      class: 'window',
      'data-id': id,
      style:
        'left:' + x + '%;top:' + y + '%;--shutter-x:' + (x - 5) / 0.9 + '%;--shutter-y:' + y / 0.862 + '%',
    },
  );
  $('windows').append(b);
  return b;
});

function start(id) {
  clearTimeout(opening);
  const student = current();
  const wasClosed = (student.lessons[id]?.state ?? 'closed') === 'closed';
  const target = windowButtons[id - 1];
  target.focus({ preventScroll: true });
  openLesson(student, id);
  draw();
  target.classList.add('opening');
  opening = setTimeout(
    () => {
      target.classList.remove('opening');
      if (current() === student && !dialog.open) lessonScreen(id);
    },
    wasClosed && data.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 520 : 0,
  );
}

const startButton = button('Enter the village', () => profileForm(app, initialGoal), {
  id: 'welcome',
  class: 'welcome',
});
document.querySelector('.hero').append(startButton);
function draw() {
  const student = current();
  const goal = student?.goal ?? initialGoal;
  const collection = completed(student);
  startButton.hidden = Boolean(student);
  const names = new Map();
  for (const profile of data.profiles) names.set(profile.name, (names.get(profile.name) || 0) + 1);
  $('students').replaceChildren(
    ...(data.profiles.length
      ? data.profiles.map((profile) =>
          el(
            'option',
            { value: profile.id },
            'Student: ' + profile.name + (names.get(profile.name) > 1 ? ' · ' + profile.id.slice(-5) : ''),
          ),
        )
      : [el('option', { value: '' }, 'Choose student'), el('option', { value: 'new' }, 'Add student…')]),
  );
  $('students').value = student?.id ?? '';
  $('goal').value = String(goal);
  windowButtons.forEach((b, i) => {
    const state = student?.lessons[i + 1]?.state ?? 'closed';
    const name = state === 'closed' ? '' : lessons[i][0];
    if (state === 'closed') b.classList.remove('opening');
    b.dataset.state = state;
    b.querySelector('.window-name').textContent = name;
    b.setAttribute('aria-label', 'Window ' + (i + 1) + (name ? ' · ' + name : '') + ' · ' + state);
  });
  const total = Math.max(collection.length, goal);
  $('treasures').replaceChildren(
    ...Array.from({ length: total }, (_, i) => {
      const id = collection[i];
      const label = id ? lessons[id - 1][2] : 'Empty treasure space';
      return el(
        'li',
        { class: id ? 'collected' : 'empty', title: label, 'aria-label': label },
        id ? item(id - 1) : null,
      );
    }),
  );
  $('progress').textContent = collection.length + ' of ' + goal + ' collected';
  const unlocked = student && (student.prediction || collection.length >= goal);
  $('gift').classList.toggle('ready', Boolean(unlocked));
  $('gift-caption').textContent = student?.prediction
    ? 'Read your winter wish'
    : unlocked
      ? 'Open your gift'
      : 'A surprise is waiting';
}
$('add').onclick = () => app.create();
$('settings').onclick = () => settings(app);
$('music').onclick = () => musicPanel(app);
$('gift').onclick = () => gift(app);
$('students').onchange = (e) => {
  if (!data.profiles.length) {
    draw();
    app.create();
    return;
  }
  stopMedia();
  selectProfile(e.target.value);
  draw();
};
$('goal').onchange = (e) => {
  if (!current()) {
    initialGoal = Number(e.target.value);
    draw();
    return;
  }
  current().goal = Number(e.target.value);
  flush();
  draw();
};
draw();
