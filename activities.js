import { actions, button, checks, details, el, field, item, p, section, select, textField } from './ui.js';
import {
  chunks, clips, events, glossary, opinions, otherWinterEndings, roomChanges, roomComparisonStarters, sounds, story, winterScenes,
} from './lessons.js?v=tasks-47';
import { pauseForExternalVideo, register } from './audio.js?v=playback-9';
import { roomScene } from './room.js?v=snowy-trail';

export const stages = [
  ['Build the phrases', 'Sort your winter list', 'Your winter wishes'],
  ['Open the story cards', 'What’s on their mind?'],
  ['Look at the room', 'Find six changes', 'Solve the mystery'],
  ['Share your opinions'],
  ['Study the clues', 'Chapter one', 'Chapter two', 'Chapter three', 'Tell the story'],
  ['Picture the evening', 'Listen and notice', 'Listen again', 'Talk about the song', 'Plan your night in'],
  ['Listen to the boxes', 'Build your soundscape'],
  ['Before you watch', 'Watch and predict', 'After the film', 'Make it personal'],
];

function shuffled(values) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const roomThemes = ['fireside','atelier','mystery','window','library','song','sound','cinema'];
// Each group retains the original stage in saved profiles.
export const pageCounts = [[4,4,3],[1,winterScenes.length],[1,1,1],[6],[1,1,1,1,7],[1,1,1,1,1],[1,1],[1,1,1,1]];
export const pageUnits = {
  fireside: ['Page', 'Page', 'Wish'],
  atelier: ['Page', 'Scene'],
  window: ['Question'],
};
function picture(index, caption) {
  return el('figure', { class: 'clue' }, item(index), el('figcaption', {}, caption));
}
const instruction = (copy, tag = 'p') => el(tag, { class: 'step-instruction' }, copy);

function quiz(c, key, question, options, answer, explanation, {
  alternatives = {},
  formatSolution,
  retryMessage = 'Try again. Read the clue or question once more.',
} = {}) {
  const accepted = { ...alternatives, [answer]: explanation };
  const choice = select([['', 'Choose an answer'], ...options], c.a[key], (value) => {
    c.save(key, value);
    feedback.textContent = '';
  });
  const feedback = p('', { class: 'feedback', role: 'status' });
  const showSolution = (ending, prefix) => {
    const detail = accepted[ending];
    feedback.replaceChildren(formatSolution ? formatSolution(ending, detail) : prefix + detail);
  };
  return el(
    'div',
    { class: 'question' },
    field(question, choice),
    actions(
      button('Check', () => {
        const ending = choice.value;
        if (Object.hasOwn(accepted, ending)) {
          showSolution(ending, 'Yes. ');
        } else {
          feedback.textContent = ending ? retryMessage : 'Choose an answer first.';
        }
      }),
      button('Show answer', () => showSolution(answer, answer + '. ')),
    ),
    feedback,
  );
}

// Each rectangle is [x, y, width, height] on the Winter to do list poster.
const winterCrops = [
  [45, 141, 217, 237],
  [314, 821, 233, 181],
  [247, 633, 168, 187],
  [258, 55, 202, 126],
  [793, 632, 230, 241],
  [832, 949, 246, 252],
  [68, 1090, 209, 264],
  [548, 1218, 284, 213],
];

function winterPhrase(index, title) {
  const posterWidth = 1112;
  const posterHeight = 1542;
  const [x, y, width, height] = winterCrops[index];
  const side = Math.max(width, height);
  const crop = el('span', { class: 'winter-crop', style: [
    'width:' + (100 * width / side) + '%',
    'height:' + (100 * height / side) + '%',
    'background-size:' + (100 * posterWidth / width) + '% ' + (100 * posterHeight / height) + '%',
    'background-position:' + (100 * x / (posterWidth - width)) + '% ' + (100 * y / (posterHeight - height)) + '%',
  ].join(';') });
  return el('span', { class: 'winter-phrase' },
    el('span', { class: 'winter-illustration', 'aria-hidden': 'true' }, crop),
    title);
}

const winterCategories = [
  ['Definitely on my list', 'Definitely on my list', [
    'I’d love to do that because …',
    'That sounds like my kind of thing. I love …',
  ]],
  ['Maybe, if…', 'Maybe, if …', [
    'I might do that if …',
    'It depends on …',
  ]],
  ['Not really my thing', 'Not my thing', [
    'That’s not really my thing. I’d rather …',
    'I’m not a big fan of … because …',
  ]],
];
const winterCategoryOptions = winterCategories.map(([value, label]) => [value, label]);

export function winterReasons() {
  return el('aside', { class: 'winter-reasons', 'aria-label': 'Say why' },
    el('h4', {}, 'Say why'),
    el('div', { class: 'winter-reasons-groups' },
      winterCategories.map(([, label, starters]) => el('div', {},
        el('h5', {}, label),
        el('ul', {}, starters.map(starter => el('li', {}, starter))),
      )),
    ),
  );
}

function winter(c, step) {
  const first = 2 * c.part;
  if (step === 0) {
    const order = c.order('matchOrder', chunks.map((_, i) => i));
    return el(
      'div',
      {},
      instruction('Choose an ending for each phrase, then check your answer.'),
      chunks.slice(first, first + 2).map(([start, end, example], index) => {
        const i = first + index;
        return quiz(
          c,
          'pair' + i,
          winterPhrase(i, start + ' …'),
          order.map((j) => chunks[j][1]),
          end,
          example,
          {
            alternatives: otherWinterEndings[start],
            formatSolution: (ending, sentence) => el('span', { class: 'phrase-solution' },
              el('strong', {}, start + ' ' + ending), el('em', {}, sentence)),
            retryMessage: 'Try again.',
          },
        );
      }),
    );
  }
  if (step === 1)
    return el(
      'div',
      {},
      instruction('Choose a category for each activity and explain your choice.'),
      chunks.slice(first, first + 2).map(([a, b], i) =>
        c.choose('sort' + (first + i), winterPhrase(first + i, a + ' ' + b), winterCategoryOptions),
      ),
      winterReasons(),
    );
  const activities = chunks.map(([first, last]) => first + ' ' + last);
  const hasPreferences = activities.some((_, i) => c.a['sort' + i]);
  const shortlist = hasPreferences
    ? activities.filter((_, i) => ['Definitely on my list', 'Maybe, if…'].includes(c.a['sort' + i]))
    : activities;
  return el(
    'div',
    { class: 'winter-wishes' },
    instruction(
      'Pick an idea for each wish or write your own. Add who, where or when. You can also tell your teacher aloud.',
    ),
    ['One little treat for myself', 'One thing to do with someone', 'One thing I don’t usually do'].slice(c.part,c.part+1).map(
      (s) => {
        const i=c.part;
        const key = 'wishIdea' + i;
        const choices = [
          ...new Set([...shortlist, ...(c.a[key] ? [c.a[key]] : [])]),
        ];
        return section(
          s,
          field(
            'Idea for wish ' + (i + 1),
            select([['', 'My own idea'], ...choices], c.a[key], (v) => c.save(key, v)),
          ),
          textField(
            'Who, where or when? Add your own details.',
            c.a['wish' + i],
            (v) => c.save('wish' + i, v, true),
            { 'aria-label': s },
          ),
        );
      },
    ),
  );
}
function winterThoughts(c) {
  const scene = winterScenes[c.part];
  const picture = el('div', { class: 'thought-scene' },
    el('img', { src: './winter-thoughts/winter-scenes/' + scene.id + '.webp',
      alt: scene.alt, width: 1200, height: 800 }),
  );
  let activeBubble;
  const closeEditor = (restoreFocus = false) => {
    activeBubble?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) activeBubble?.focus({ preventScroll: true });
    activeBubble = undefined;
    editor.hidden = true;
    editor.replaceChildren();
  };
  const editor = el('form', {
    class: 'thought-editor', id: 'thought-editor', hidden: true,
    onsubmit: event => {
      event.preventDefault();
      closeEditor(true);
    },
    onkeydown: event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeEditor(true);
      }
    },
  });

  for (const character of scene.characters) {
    const key = 'thought-' + scene.id + '-' + character.id;
    const label = character.name + '’s thought';
    const text = el('span', { class: 'thought-copy' });
    const updateBubble = value => {
      const thought = value.trim();
      text.textContent = thought;
      bubble.title = thought;
      bubble.setAttribute('aria-label', thought ? label + '. ' + thought : label);
    };
    const bubble = button(text, () => {
      if (activeBubble === bubble) {
        closeEditor(true);
        return;
      }
      closeEditor();
      activeBubble = bubble;
      bubble.setAttribute('aria-expanded', 'true');
      const input = el('input', {
        type: 'text', maxlength: 20000,
        oninput: event => {
          const value = event.target.value;
          c.save(key, value, true);
          updateBubble(value);
        },
      });
      input.value = c.a[key] ?? '';
      editor.replaceChildren(field(label, input), el('button', { type: 'submit', class: 'primary' }, 'Done'));
      editor.hidden = false;
      input.focus();
    }, {
      class: 'thought-bubble', 'aria-expanded': 'false', 'aria-controls': editor.id,
      style: '--thought-x:' + character.x + '%;--thought-y:' + character.y + '%',
    });
    updateBubble(c.a[key] ?? '');
    picture.append(bubble);
  }

  return el('div', { class: 'thought-activity' },
    instruction('Look at the picture. What might each character be thinking? Tap a bubble and write one line for each character.'),
    picture,
    editor,
  );
}

function winterDay(c, step) {
  if (step === 1) return winterThoughts(c);
  const sequence = Array.isArray(c.a.sequence)
    ? [...new Set(c.a.sequence.filter((i) => Number.isInteger(i) && events[i]))]
    : [];
  const cards = el('div', { class: 'cards' });
  const paint = () => {
    cards.replaceChildren(
      ...events.map(([name, icon], i) => {
        const open = sequence.includes(i);
        return button(
          [item(open ? icon : 8), open ? name : 'Open card ' + (i + 1)],
          () => {
            if (!sequence.includes(i)) {
              sequence.push(i);
              c.save('sequence', [...sequence]);
              paint();
              cards.children[i].focus();
            }
          },
          { 'aria-pressed': String(open) },
        );
      }),
    );
  };
  paint();
  return el('div', {}, instruction('Choose cards in any order. Each new event joins your story.'), cards);
}

function mystery(c,step) {
  const compare=el('div',{class:'room-photo'});
  const view=el('div');
  const switches=actions();
  const show=after=>{
    view.replaceChildren(roomScene(after));
    [...switches.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===Number(after))));
  };
  compare.append(view,switches);
  if(step===1) {
    for(const value of ['Before','After']) switches.append(button(value,()=>{
      c.save('roomView',value.toLowerCase());show(value==='After');
    }));
  }
  show(step===2 || (step===1 && c.a.roomView!=='before'));
  let discussion;
  if(!step) discussion=instruction('Take a good look at the room. What can you see on the table and on the armchair?');
  if(step===2) discussion=[c.choose('theory',instruction('Who might have visited?', 'span'),['A neighbour came in to leave a surprise.','A friend came in from the snow.','I have a different theory.']),c.text('explain','What happened? Use two details from the room.')];
  if(step===1) {
    const key=roomChanges.map(change=>change[0]);
    const candidates=[key[1],'The fireplace is dark',key[3],key[0],'It has stopped snowing outside',key[4],key[2],key[5]];
    const feedback=p('',{role:'status'});
    discussion=[instruction('Mark the six changes you can see.'),checks(candidates,c.a.changes,value=>{c.save('changes',value);feedback.textContent='';}),
      actions(button('Check changes',()=>{
        const marked=new Set(c.a.changes || []);
        const count=key.filter(v=>marked.has(v)).length;
        feedback.textContent=marked.size===6 && count===6 ? 'Yes! You found all six changes.' :
          count===6 ? 'You found all six. Uncheck anything that stayed the same.' : count+' of six changes found. Compare the room again.';
      }),button('Clues',()=>c.tool('Clues',el('ul',{},roomChanges.map(v=>el('li',{},v[1]))))),
      button('Show answer',()=>c.tool('The six changes',el('ul',{},key.map(v=>el('li',{},v)))))),feedback];
  }
  return el('div', { class: 'room-comparison' }, compare,
    step === 1 && el('aside', { class: 'comparison-language', 'aria-label': 'Compare aloud' },
      el('h4', {}, 'Compare aloud'),
      el('ul', {}, roomComparisonStarters.map(starter => el('li', {}, starter))),
    ),
    el('div', { class: 'comparison-questions' }, discussion),
  );
}

function hotTakes(c) {
  const [statement, viewpoints] = opinions[c.part];
  const choices = ['Agree', 'It depends', 'Disagree'];
  const key = 'opinion' + c.part;
  const viewpoint = p('');
  const note = details('Another point of view', viewpoint);
  note.classList.add('opinion-note');

  const showViewpoint = (value) => {
    const index = choices.indexOf(value);
    note.hidden = index < 0;
    note.open = false;
    viewpoint.textContent = viewpoints[index] ?? '';
  };
  const position = el(
    'fieldset',
    { class: 'opinion-scale' },
    el('legend', {}, 'Your position'),
    choices.map((value) => el('label', {},
      el('input', {
        type: 'radio',
        name: key,
        value,
        checked: c.a[key] === value,
        onchange: () => {
          c.save(key, value);
          showViewpoint(value);
        },
      }),
      value,
    )),
  );
  showViewpoint(c.a[key]);

  return el(
    'div',
    { class: 'opinion-activity' },
    instruction('Pick a statement to discuss. You can change your mind after reading another view.'),
    el('section', { 'aria-labelledby': 'opinion-statement' },
      el('h3', { id: 'opinion-statement', class: 'opinion-statement' }, statement),
      el('div', { class: 'opinion-discussion' },
        el('div', { class: 'opinion-options' }, position, note),
        c.text('reason' + c.part, 'Why do you feel that way?'),
      ),
    ),
  );
}

function readStory(c, step) {
  const spread = (left,right) => el('div',{class:'book-spread'},el('div',{class:'book-page'},left),el('div',{class:'book-page'},right));
  if (!step) return spread(
    el('div', { class: 'clues' },
      el('figure', { class: 'clue clue-image' },
        el('img', { src: './assets/missing-gloves.png', alt: 'The missing gloves', width: 1054, height: 1492 })),
      picture(15, 'An orange cat'),
      picture(1, 'An old scarf')),
    c.text('prediction',instruction('What connects these three clues?', 'span')));
  const artwork = i => el('div',{class:'chapter-picture',role:'img','aria-label':[
    'Nora looks for a missing glove.','Nora follows the orange cat across the snowy yard.','The cat keeps a puppy warm in a wooden shed.'
  ][i],style:'--chapter:'+i});
  if (step<=3) {
    const [title,copy,question]=story[step-1];
    const para=p('',{class:'story-copy'});
    const meanings=new Map(glossary);
    const phrases = [...meanings.keys()].map(phrase => phrase.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'));
    const glossaryPattern = new RegExp('(' + phrases.join('|') + ')', 'g');
    for (const piece of copy.split(glossaryPattern)) {
      para.append(meanings.has(piece)?button(piece,()=>c.tool(piece,p(meanings.get(piece))),{class:'gloss'}):piece);
    }
    return spread([el('h3',{},title),para],[artwork(step-1),c.text('chapter'+step,instruction(question, 'span'))]);
  }
  const questions=[
    ['who','Who followed the cat?',['Nora','The puppy','A neighbour’s son'],'Nora','Nora waited by the door and followed him across the yard.'],
    ['why','Why did the cat take the soft things?',['To hide them in a bin','To keep a puppy warm','To make a toy'],'To keep a puppy warm','Nora found the puppy on a cushion under a cloth.'],
    ['home','Where did the animals live in the end?',['In Nora’s home','In the little shed','At the ice rink'],'In Nora’s home','Nora gave the puppy a home and the cat moved in too.'],
  ];
  if(c.part<3) {
    const [key, question, ...choices] = questions[c.part];
    return spread(artwork(c.part),quiz(c,key,instruction(question, 'span'),...choices));
  }
  if(c.part===3) return spread(
    c.choose('title', instruction('Which title would you choose?', 'span'), [
      // Keep the saved value for profiles that already selected this option.
      ['The Cat Who Stole Christmas', 'A Winter Mystery'],
      'The Warmest Corner',
      'A Very Unusual Neighbour',
    ]),
    c.text('titleReason', 'Why does your title fit?'),
  );
  if(c.part===4) return spread(quiz(c,'missingChunk',instruction('“Things began to … from the hall.”', 'span'),['take care of','go missing','follow someone'],'go missing','Nora could no longer find the things she had left there.'),
    quiz(c,'warmChunk',instruction('“The cat used my scarf to … the puppy … .”', 'span'),['look / for','keep / warm','give / a home'],'keep / warm','The scarf protected the little dog from the cold.'));
  if (c.part === 5) {
    const chapterPhrases = [
      ['went missing', 'look everywhere for …', 'saw an orange cat', 'hung from his mouth'],
      ['left an old scarf near the door', 'picked it up', 'decided to follow him', 'pushed open the door'],
      ['was tucked in beside him', 'keep him warm', 'took care of the puppy', 'give him a home'],
    ];
    const answerId = 'story-retelling';
    return spread(
      el('figure', { class: 'story-sequence' },
        el('img', { src: './assets/nora-story.webp', alt: 'Nora looks for her glove, follows the cat and finds the puppy.' }),
        el('figcaption', {}, 'What went missing? Where did Nora go? Who needed a home?'),
      ),
      [
        el('label', { class: 'step-instruction', for: answerId },
          'Tell the story in three or four sentences. Use at least three phrases from the chapters.',
        ),
        el('aside', { class: 'story-phrases', 'aria-labelledby': 'story-phrases-heading' },
          el('h4', { id: 'story-phrases-heading' }, 'Story phrases'),
          el('dl', {}, chapterPhrases.map((phrases, index) => [
            el('dt', {}, 'Chapter ' + (index + 1)),
            el('dd', {}, el('ul', {}, phrases.map(phrase => el('li', {}, phrase)))),
          ])),
        ),
        c.text('retell', null, { id: answerId }),
      ],
    );
  }
  return spread(artwork(2),c.text('animal',instruction('Have you ever helped an animal, or seen someone do so? What happened?', 'span')));
}

const songGaps = [
  ['the weather outside is _____', 'frightful'],
  ['the fire is so _____', 'delightful'],
  ['no _____ to go', 'place'],
  ["doesn't show signs of _____", 'stopping', "stoppin'"],
  ['some _____ for popping', 'corn'],
  ['The lights are turned way down _____', 'low'],
  ['kiss _____', 'goodnight', 'good night'],
  ['going out in the _____', 'storm'],
  ['hold me _____', 'tight'],
  ["All the way home I'll be _____", 'warm'],
];

const songPhrases = [
  'frightful weather for a walk',
  'sit by the fire',
  'a delightful evening indoors',
  'find a cosy place to sit',
  'pop some corn for movie night',
  'keep the lights low',
  'say goodnight at the door',
  'stay inside during a storm',
  'hug someone tight',
  'keep warm in a thick coat',
];

function songPhraseList(attrs) {
  return el('ul', { class: 'song-phrase-list', ...attrs }, songPhrases.map(phrase => el('li', {}, phrase)));
}

function songRecording() {
  const feedback = p('', { class: 'feedback', role: 'status' });
  const recording = el('audio', {
    class: 'song-audio',
    src: './Let It Snow, Let It Snow.mp3',
    controls: true,
    preload: 'metadata',
    'aria-label': 'Let It Snow, Let It Snow',
  });
  register(recording, () => (feedback.textContent = 'The song could not be played.'));
  return [recording, feedback];
}

function illustratedSongPlayer(src, alt) {
  return el('div', { class: 'media-station' },
    el('img', { class: 'song-scene-image', src, alt, width: 1672, height: 941 }),
    songRecording(),
  );
}

function songGapExercise(c) {
  const messages = { correct: 'Correct', retry: 'Try again', missing: 'Fill in the gap' };
  const rows = songGaps.map(([phrase, ...accepted], index) => {
    const number = index + 1;
    const key = 'songLyricGap' + number;
    const id = 'song-gap-' + number;
    const result = el('output', { class: 'song-gap-result', id: id + '-result', for: id });
    const input = el('input', {
      id,
      type: 'text',
      maxlength: 20000,
      spellcheck: 'false',
      autocapitalize: 'none',
      'aria-label': number + '. ' + phrase.replace('_____', 'blank'),
      'aria-describedby': result.id,
      oninput: event => {
        c.save(key, event.target.value, true);
        result.textContent = '';
        delete result.dataset.result;
        input.removeAttribute('aria-invalid');
      },
    });
    input.value = c.a[key] ?? '';
    const [before, after] = phrase.split('_____');
    return {
      item: el('li', {}, el('div', {}, el('label', {}, before, input, after), result)),
      check() {
        const answer = input.value.trim().toLowerCase();
        const grade = accepted.includes(answer) ? 'correct' : answer ? 'retry' : 'missing';
        result.dataset.result = grade;
        result.textContent = messages[grade];
        input.setAttribute('aria-invalid', String(grade !== 'correct'));
      },
    };
  });
  const examples = songPhraseList({ id: 'song-gap-examples', hidden: true });
  const learnMore = button('Learn more', () => {
    examples.hidden = !examples.hidden;
    learnMore.setAttribute('aria-expanded', String(!examples.hidden));
  }, { 'aria-controls': examples.id, 'aria-expanded': 'false' });
  return el(
    'form',
    {
      autocomplete: 'off',
      onsubmit: event => {
        event.preventDefault();
        rows.forEach(row => row.check());
      },
    },
    instruction('Listen again. Fill each gap with one word you hear in the song.'),
    el('ol', { class: 'song-gap-list' }, rows.map(row => row.item)),
    actions(el('button', { type: 'submit', class: 'primary' }, 'Check answers'), learnMore),
    examples,
  );
}

function song(c, step) {
  if (step === 0) {
    const scenes = [
      ['A snowy walk home', 'snowy-walk-home.png'],
      ['An evening by the fire', 'evening-by-the-fire.png'],
      ['A busy evening in town', 'busy-evening-in-town.png'],
    ];
    return el(
      'div',
      {},
      el(
        'fieldset',
        { class: 'song-scenes' },
        instruction('Choose a scene to imagine.', 'legend'),
        scenes.map(([label, image]) =>
          el(
            'label',
            {},
            el('img', { src: './' + image, alt: '', width: 1774, height: 887 }),
            el(
              'span',
              {},
              el('input', {
                type: 'radio',
                name: 'song-scene',
                value: label,
                checked: c.a.scene === label,
                onchange: () => c.save('scene', label),
              }),
              ' ',
              label,
            ),
          ),
        ),
      ),
      el('div', { class: 'media-station' },
        c.text('mood', 'What mood do you expect? Why?'),
        songRecording(),
      ),
    );
  }
  if (step === 1) {
    const present = ['Snow falling', 'A fire', 'Saying goodnight', 'The lights are low'];
    const options = [present[0], present[1], 'A phone call', present[2], 'A train journey', present[3]];
    const feedback = p('', { class: 'feedback', role: 'status' });
    const answer = 'The song describes snow outside, a fire, low lights and a couple saying goodnight.';
    return el(
      'div',
      {class:'song-player-grid'},
      illustratedSongPlayer(
        './let-it-snow-scene.png',
        'Two people beside a snowy window and a lit fireplace.',
      ),
      el('div',{},instruction('Mark the details you hear. Replay the song to check.'),
      checks(options, c.a.heard, (v) => {
        c.save('heard', v);
        feedback.textContent = '';
      }),
      actions(
        button('Check', () => {
          const marked = Array.isArray(c.a.heard) ? c.a.heard : [];
          feedback.textContent =
            present.every((v) => marked.includes(v)) && marked.length === present.length
              ? 'Yes. ' + answer
              : 'Listen again for the weather, the room and what the couple do at the end.';
        }),
        button('Show answer', () => (feedback.textContent = answer)),
      ),
      feedback),
    );
  }
  if (step === 2)
    return el(
      'div',
      { class: 'song-player-grid song-gap-layout' },
      illustratedSongPlayer(
        './let-it-snow-listen-again.png',
        'A woman reads a book beside a snowy window.',
      ),
      songGapExercise(c),
    );
  if (step === 3) {
    const discussion = [
      ['Is the bad weather really a problem for the singer?', 'No. He’s warm and happy by the fire.'],
      ['Does he want to leave?', 'No. He’d like to stay a little longer.'],
      ['What makes this evening special?', 'He’s with someone he loves, and it feels cosy inside.'],
    ];
    const answers = el('dl', { id: 'song-possible-answers', hidden: true },
      discussion.map(([question, answer]) => [
        el('dt', {}, question),
        el('dd', {}, answer),
      ]),
    );
    const toggle = button('🔑 Show possible answers', () => {
      const show = answers.hidden;
      answers.hidden = !show;
      toggle.textContent = show ? '🔑 Hide possible answers' : '🔑 Show possible answers';
      toggle.setAttribute('aria-expanded', String(show));
    }, { 'aria-expanded': 'false', 'aria-controls': answers.id });
    return el('div', {},
      c.text('discussion', instruction(discussion.map(([question]) => question).join(' '), 'span')),
      toggle,
      answers,
    );
  }
  return el(
    'div',
    { class: 'song-plan' },
    p('It’s snowing heavily. Your plans are cancelled. You’re staying in tonight! Tell your partner about the plan.'),
    el('div', { class: 'song-plan-choices' },
      c.choose('company', el('span', {}, 'Who’s there?'), ['Just me', 'A friend', 'My family']),
      c.choose('food', el('span', {}, 'What will you make?'), ['Hot chocolate', 'Soup and bread', 'Something to bake']),
      c.choose('activity', el('span', {}, 'How will you spend the evening?'), [
        'Curl up with a book',
        'Watch a favourite film',
        'Play a game',
      ]),
    ),
    el('blockquote', { class: 'song-plan-model' },
      '“I’d love to have a cosy night in with … We could warm up with …, then curl up with …”',
    ),
    el('div', { class: 'song-plan-layout' },
      el('section', { class: 'song-phrase-card', 'aria-labelledby': 'song-phrase-heading' },
        el('h3', { id: 'song-phrase-heading' },
          el('span', { 'aria-hidden': 'true' }, '❄\uFE0E'),
          'Useful phrases',
        ),
        songPhraseList(),
      ),
      c.text('plan', 'Describe your cosy night in. Add your own ideas.'),
    ),
  );
}

function soundBox(c,step) {
  const files = ['snow', 'paper', 'fire', 'mug', 'bells', 'santa-laugh'];
  const santaIndex = files.length - 1;
  const santaRevealKey = 'revealSantaLaugh';
  if(step) {
    const santa = sounds[santaIndex];
    const santaLabel = c.a[santaRevealKey] ? santa : 'A present from Santa';
    const saved = Array.isArray(c.a.favourites) ? c.a.favourites : [];
    const chosen = saved.map(value => [santa, 'Winter wind', 'Box 6'].includes(value) ? santaLabel : value);
    const group = checks([...sounds.slice(0, santaIndex), santaLabel], chosen,
      values => c.save('favourites', values.map(value => value === santaLabel ? santa : value)));
    const limit=()=>{const boxes=[...group.querySelectorAll('input')];const count=boxes.filter(b=>b.checked).length;boxes.forEach(b=>b.disabled=count>=3 && !b.checked);};
    group.addEventListener('change',limit);limit();
    return el('div', { class: 'study-split soundscape' },
      el('div', {}, instruction('Choose three sounds for your ideal winter evening.'), group),
      el('div', { class: 'soundscape-answer' },
        el('img', {
          src: './winter-soundscape-collage.png',
          width: 2172,
          height: 724,
          alt: 'Footprints in snow, a lit fireplace and a mug of hot chocolate.',
        }),
        c.text('explain', 'Describe your winter evening using all three sounds. What mood do they create?'),
      ),
    );
  }
  const boxes=el('div',{class:'box-shelf'});
  const controls=el('div',{class:'selected-box'});
  const media=el('audio',{controls:true,preload:'metadata','aria-label':'Mystery sound'});
  const info=p('',{class:'feedback',role:'status'});
  register(media,()=>{info.textContent='Sound unavailable. Check the lesson file in Teacher settings.';});
  function choose(i,remember) {
    media.pause();
    if(remember)c.save('soundBox',String(i));
    media.src='./assets/'+files[i]+'.mp3';
    media.load();
    c.showProgress('Sound', i + 1, files.length);
    info.textContent='';
    [...boxes.children].forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));
    const reveal=p('',{class:'sound-source',role:'status'});
    const revealKey = i === santaIndex ? santaRevealKey : 'reveal' + i;
    const toggle = button('', () => {
      c.save(revealKey, !c.a[revealKey]);
      paint();
    });
    function paint() {
      const open = Boolean(c.a[revealKey]);
      reveal.textContent = open ? sounds[i] : '';
      toggle.textContent = open ? 'Hide sound' : 'Reveal sound';
      toggle.setAttribute('aria-expanded', String(open));
    }
    paint();
    controls.replaceChildren(el('div',{},media,actions(button('Replay',async()=>{try{media.currentTime=0;await media.play();}catch{info.textContent='Playback unavailable.';}}),
      button('Stop',()=>{media.pause();media.currentTime=0;})),info),
      el('div',{},c.text('guess'+i,instruction('What do you think is inside box '+(i+1)+'?', 'span')),actions(toggle,reveal)));
  }
  files.forEach((_,i)=>boxes.append(button([el('span',{class:'parcel-image','aria-hidden':'true',
    style:'--col:'+i%3+';--row:'+Math.floor(i/3)}),el('span',{},'Box '+(i+1))],()=>choose(i,true),{class:'sound-gift'})));
  const index=Number(c.a.soundBox);
  choose(files[index]?index:0,false);
  return el('div',{},boxes,controls);
}

function filmDiscussionSupport(kind, items, starter) {
  const panel = el('div', { class: 'film-ideas', id: 'film-' + kind, hidden: true },
    el('ul', {}, items.map(text => el('li', {}, text))),
    starter && p(starter, { class: 'film-ideas-starter' }),
  );
  const toggle = button('🔑 Show ' + kind, () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
  }, { 'aria-controls': panel.id, 'aria-expanded': 'false' });
  return [toggle, panel];
}

function cinema(c,step) {
  const variant=c.profile.video;
  const film=clips[variant];
  const answer=(key,label)=>c.text(variant+key,label);
  const prompt=step===0?film.before:step===1?film.pause:step===2?film.after:film.personal;
  if (step !== 1) {
    const still = step === 0 ? film.still : film.discussionStill;
    return el('div', { class: 'cinema-layout' },
      el('div', { class: 'cinema-still' }, el('img', still)),
      el('div', { class: 'film-discussion' },
        answer(['before', null, 'after', 'personal'][step], instruction(prompt, 'span')),
        step === 2 && film.afterSupport &&
          filmDiscussionSupport('ideas', film.afterSupport.ideas, film.afterSupport.starter),
        step === 3 && film.personalPhrases && filmDiscussionSupport('phrases', film.personalPhrases),
      ),
    );
  }
  const openOnYouTube = el('a', {
    class: 'button-link primary',
    href: 'https://www.youtube.com/watch?v=' + film.id,
    target: '_blank',
    rel: 'noopener noreferrer',
    onclick: pauseForExternalVideo,
  }, 'Open on YouTube');
  return el('div', { class: 'cinema-layout cinema-watch-layout' },
    el('div', { class: 'film-watch' }, el('h4', {}, film.title), openOnYouTube),
    el('div', { class: 'cinema-still' }, el('img', { ...film.still, alt: '' })),
    el('div', { class: 'film-discussion' },
      instruction(prompt),
      answer('next', 'What do you think will happen next?'),
    ),
  );
}
export function activity(id, step, profile, lesson, save, part, tool, showProgress) {
  const a = lesson.answers;
  const c = {
    part, tool, showProgress,
    a,
    save,
    profile,
    text: (key, title, attrs) => textField(title, a[key], (v) => save(key, v, true), attrs),
    choose: (key, title, options) =>
      field(
        title,
        select([['', 'Choose…'], ...options], a[key], (v) => save(key, v)),
      ),
    order: (key, indices) => {
      const value = a[key];
      if (Array.isArray(value) && value.length === indices.length && indices.every((i) => value.includes(i)))
        return value;
      const order = shuffled(indices);
      save(key, order);
      return order;
    },
  };
  return [winter, winterDay, mystery, hotTakes, readStory, song, soundBox, cinema][id - 1](c, step);
}
