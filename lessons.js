export const lessons = [
  ['My Kind of Winter', 'Build a winter bucket list that feels like you.', 'Golden fairy lights', 'I’d love to… · I might… if I have time. · …isn’t really my thing. · I’d rather…', 'Start with “I’d like to…” and add when or where.', 'Try “I’ve been meaning to…” or “I never seem to make time for…” and explain why.'],
  ['A Winter Day Gone Wrong', 'Open the cards and use the events to tell your own winter story.', 'Winter scarf', 'We were on our way to… · We realised that… · It turned out that… · Luckily… · In the end… · We ended up…', 'Use Past Simple and link events with first, then and finally.', 'Set the scene with Past Continuous and add reasons and reactions. Optional: “We realised we’d forgotten…”'],
  ['The Cosy Room Mystery', 'Look carefully. Six things have changed in this room.', 'Candle in a brass holder', 'There was… · There were… · Now there is… · The … was next to… · Someone moved… · I think… because…', 'Start with “Before, there was … Now …” and point to the objects.', 'Try “Someone might have…” and give a reason for your theory.'],
  ['Winter Hot Takes', 'Choose a position, explain it and hear another point of view.', 'Amber spark', 'For me… · It depends on… · I agree because… · I see your point, but… · I’d prefer… · For example…', 'Give one reason and one short example.', 'Think of an exception, then respond to the other point of view.'],
  ['A Little Winter Story', 'Look at the three clues. What do you think the story is about?', 'Bell of kindness', 'go missing · look everywhere for · follow someone · take care of · keep someone warm · give someone a home', 'Retell the story with first, then and finally. Use the pictures as clues.', 'Tell part of the story from the cat’s point of view. Use three phrases from the story.'],
  ['Let It Snow!', 'Listen to Dean Martin, then plan a cosy night in.', 'Musical snowflake', 'have a cosy night in · warm up with… · curl up with… · stay in · snow heavily', 'Say what you notice using “I heard…” and why you’d stay in with “I’d rather…”', 'Explain how the weather and the singer’s mood contrast. Use “Even though…”.'],
  ['The Winter Sound Box', 'Listen to six mystery sounds. Guess what’s making each one.', 'Crystal winter ornament', 'It sounds like… · I can hear… · Maybe someone is… · It reminds me of… · This sound makes me feel…', 'Describe whether a sound is soft, loud, fast or slow.', 'Give two possible explanations and say which one is more likely.'],
  ['Christmas Cinema', 'Make a prediction, watch a short film and talk about the ending.', 'Golden friendship ribbon', '', 'Say what you can see, then start your prediction with “I think they will…”', 'Explain what made you change your mind. Try “At first …, but then I realised …”.'],
];

export const chunks = [
  ['wrap up warm', 'and go for a walk', 'Let’s wrap up warm and go for a walk before dark.'],
  ['curl up', 'with a good book', 'I curl up with a good book on cold nights.'],
  ['warm up', 'with a hot chocolate', 'After skating, I warm up with a hot chocolate.'],
  ['put up', 'fairy lights', 'We put up fairy lights in the kitchen.'],
  ['bake something', 'to share', 'I bake something to share when friends come over.'],
  ['have a cosy night in', 'with a favourite film', 'Let’s have a cosy night in with a favourite film.'],
  ['pick out a present', 'for someone special', 'I like to pick out a present for someone special.'],
  ['make time', 'for people you care about', 'Try to make time for people you care about.'],
];

export const events = [
  ['A missed bus', 9], ['Forgotten gloves', 10], ['A closed ice rink', 11],
  ['A phone with a dead battery', 12], ['An unexpected meeting', 13], ['A warm café', 14],
];

// Bubble positions are percentages of the original 3:2 illustration.
export const winterScenes = [
  {
    id: 'missed-bus',
    alt: 'A girl watches a bus drive away from a snowy stop.',
    characters: [{ id: 'the-girl', name: 'The girl', x: 61, y: 8 }],
  },
  {
    id: 'forgotten-gloves',
    alt: 'A ginger cat looks at red gloves left on a bench.',
    characters: [{ id: 'the-cat', name: 'The cat', x: 63, y: 8 }],
  },
  {
    id: 'closed-ice-rink',
    alt: 'Santa holds his skates by the locked gate of the ice rink.',
    characters: [{ id: 'santa', name: 'Santa', x: 55, y: 6 }],
  },
  {
    id: 'dead-phone',
    alt: 'A girl holds up a phone with a black screen on a snowy street.',
    characters: [{ id: 'the-girl', name: 'The girl', x: 44, y: 10 }],
  },
  {
    id: 'unexpected-meeting',
    alt: 'Two friends spot each other on a snowy street.',
    characters: [
      { id: 'the-girl', name: 'The girl', x: 22, y: 12 },
      { id: 'her-friend', name: 'Her friend', x: 78, y: 12 },
    ],
  },
  {
    id: 'warm-cafe',
    alt: 'A girl holds a steaming mug in a café while a ginger cat looks on.',
    characters: [
      { id: 'the-girl', name: 'The girl', x: 26, y: 5 },
      { id: 'the-cat', name: 'The cat', x: 79, y: 20 },
    ],
  },
];

// Other natural completions that are accepted by Check.
export const otherWinterEndings = {
  'bake something': {
    'for someone special': 'I’d like to bake something for someone special this weekend.',
    'for people you care about': 'It feels good to bake something for people you care about.',
  },
  'pick out a present': {
    'for people you care about': 'You can pick out a present for people you care about to enjoy together.',
  },
  'make time': {
    'for someone special': 'I always try to make time for someone special during a busy week.',
  },
};

export const roomChanges = [
  ['The mug is gone', 'Look at the left end of the table.'],
  ['The scarf has moved', 'Check the chair and the rug.'],
  ['The book is open', 'Look at the middle of the table.'],
  ['There’s a gift on the table', 'Compare the right side of the table.'],
  ['The candle is out', 'Is there still a flame?'],
  ['There are snowy footprints', 'Look at the floor.'],
];

export const roomComparisonStarters = [
  'There was a …, but now it’s gone.',
  'There wasn’t a … before, but now there is.',
  'There weren’t any … before, but now there are.',
  'The … was on the …, but now it’s on the …',
  'The … was …, but now it’s …',
];

export const opinions = [
  ['The best winter plans involve staying at home.', ['A short walk in the cold can make a warm home feel even better.', 'Someone who works at home all week might really need a change of scene.', 'A quiet evening at home can be the best plan after a busy week.']],
  ['Surprise presents are a bad idea.', ['A small surprise can show you remember something they mentioned.', 'Some people love surprises, but others feel more comfortable choosing.', 'A surprise can make someone feel they have to pretend to like it.']],
  ['A handmade gift means more than an expensive one.', ['An expensive gift can be very thoughtful if it’s something they really need.', 'The time someone spent making it may matter more than what it cost.', 'A handmade gift can show that someone knows your taste.']],
  ['Winter holidays are better without a busy schedule.', ['If you don’t plan ahead, it can be harder to see everyone you want to see.', 'One or two fixed plans leave enough room for a lazy day.', 'Time without plans can be exactly what makes a holiday feel like a break.']],
  ['You’re never too old to play in the snow.', ['Some adults have good reasons to feel safer watching from indoors.', 'Making a snowball and skiing down a hill are very different things.', 'Playing in the snow can bring back a happy memory and make a new one.']],
  ['A celebration doesn’t need to be perfect to be special.', ['Planning a few details can help guests feel welcome.', 'Some things are worth planning carefully, but small mistakes can be funny.', 'The best part of a party might be the moment nobody planned.']],
];

export const story = [
  ['The missing things', 'On Monday, Nora’s woollen gloves went missing from the hall. On Tuesday, it was the soft blue cloth from her neighbour’s chair. By Wednesday, someone had taken an old cushion from a box by the stairs. Everyone began to look everywhere for the missing things. Then Nora saw an orange cat sitting on the wall. A corner of the blue cloth hung from his mouth. He looked straight at her, as if to say, “Yes, and what about it?” Then he jumped down into the snow.', 'What do you think happened to the other things?'],
  ['A trail in the snow', 'That evening, Nora left an old scarf near the door and waited. When the orange cat appeared, he picked it up and walked across the yard. Nora decided to follow him. He stopped twice to look back, and she tried very hard to look like someone who often stood behind bins in the snow. At the far end of the yard, he pushed open the door of a little wooden shed. From inside came a tiny sneeze. Nora was quite sure that the cat hadn’t made it.', 'Why is the cat taking these things? What will Nora find?'],
  ['Room for two', 'Inside the shed, a little puppy lay on the missing cushion, under the blue cloth. One of Nora’s gloves was tucked in beside him. The cat dropped the scarf and lay down close to keep him warm. The next day Nora and her neighbours took care of the puppy and put a sign up to look for his owner. No one came, so Nora decided to give him a home. The orange cat moved in too. He still takes her gloves sometimes, but now he brings them back.', 'Which detail from the ending made you smile?'],
];

export const glossary = [
  ['went missing', 'go missing: disappear or be impossible to find'],
  ['look everywhere for', 'try to find something in every possible place'],
  ['hung from', 'was held at one end, with the rest pointing down.'],
  ['picked it up', 'lifted it off the ground. Here, the cat used his mouth.'],
  ['follow him', 'follow someone: go after them'],
  ['stood behind bins', 'stood behind large containers for rubbish.'],
  ['From inside came a tiny sneeze.', 'Nora heard a quiet “achoo!” from inside the shed.'],
  ['was tucked in beside him', 'was put carefully right next to him.'],
  ['took care of', 'take care of: look after someone or something'],
  ['keep him warm', 'keep someone warm: help them stay at a comfortable temperature'],
  ['put a sign up to look for', 'put a written message where people could see it, to help find someone.'],
  ['give him a home', 'give someone a home: offer them a place to live'],
];

export const sounds = ['Footsteps in snow', 'Wrapping paper rustling', 'A crackling fireplace', 'A spoon stirring a drink in a mug', 'Sleigh bells', 'Santa laughing'];

// The teacher can open the other level's prompt during the same lesson.
export const speakingPrompts = [
  { a2: 'I’d love to … with … on Saturday. Which idea would you try first?', b1: 'What usually gets in the way of one of your wishes? “I’ve been meaning to …, but …”' },
  { a2: 'First we missed … Then we found … Who helped you in the end?', b1: 'What were you doing when things went wrong? “We were … when …” How did the surprise meeting change the day?' },
  { a2: 'Before, the … was on the … Now it’s … Where do you think the visitor went?', b1: 'Can two different visitors explain the same clues? “Someone might have … because …” Which theory fits better?' },
  { a2: 'For me, … is better because … What does your partner think?', b1: 'Under what circumstances would you change your answer? “I see your point, but …” Give a real-life example.' },
  { a2: 'First the gloves went missing. Then Nora … In the end she … Which person or animal would you like to help?', b1: 'At what point did you change your mind about the cat? “At first I assumed …, but when … I realised …”' },
  { a2: 'Outside it’s … Inside it feels … What would make your evening cosy?', b1: 'Would the evening feel as special in good weather? “Even though …, the singer seems …” What gives you that impression?' },
  { a2: 'I can hear a … sound. Maybe someone is … Which sound would you like at home?', b1: 'What else could make a similar sound? “At first it reminded me of …, but then I noticed …” Which detail helped you decide?' },
];

export const clips = {
  apple: {
    a2: 'He seems … His family might feel … because … What would you say to him?',
    b1: 'When can looking at a phone mean paying attention? “At first I thought …, but the moment when … changed my mind.”',
    title: 'Misunderstood · Apple (2013)', id: 'Og637tBf91s',
    before: 'A teenager spends a family holiday looking at his phone. What do you think he’s doing on his phone? How do you think his family feels?',
    still: {
      src: './assets/cinema-misunderstood.jpg',
      alt: 'A teenager in a knitted hat and red hood looks into the distance.',
    },
    discussionStill: {
      src: './Misunderstood.jpg',
      alt: 'Two family members hug during a holiday gathering.',
    },
    pause: 'Pause before the family sees what he’s been doing.',
    after: 'Did you change your mind about him? Was this a good present?',
    personal: 'Would you rather receive something expensive or something personal?',
    language: 'spend time together · seem bored · pay attention to · make something for someone · capture a moment',
  },
  amazon: {
    a2: 'They want to … together. It reminds them of … Who would you invite?',
    b1: 'Why might a familiar activity feel different years later? “I’d still give … a go, even if …”',
    title: 'Joy Ride · Amazon (2023)', id: 'iYXfgfKfHig',
    before: 'Three friends sit on a bench and watch children on a snowy hill. What do you think the women are thinking about?',
    still: {
      src: './assets/cinema-joy-ride.jpg',
      alt: 'Three women in winter coats sit together on a bench.',
    },
    discussionStill: {
      src: './Joy ride.jpg',
      alt: 'Three friends in helmets sledge down a snowy hill.',
    },
    pause: 'Pause before the women try out their plan.',
    after: 'Can you be too old for some activities? What do adults stop doing for no good reason?',
    afterSupport: {
      ideas: [
        'Some adults stop going sledging, building snowmen or having snowball fights.',
        'They might feel silly or worry about looking childish.',
        'Some people give up things they loved as kids, like drawing or dancing, because they feel they should do something more useful.',
        'Some activities get harder as we get older, but we can often find a way to join in.',
      ],
      starter: 'I don’t think you’re ever too old to …',
    },
    personal: 'Who would you take on a little winter adventure?',
    personalPhrases: [
      'I’d take … with me because …',
      'We always have a laugh together.',
      'We’d wrap up warm and … (go sledging / go for a walk in the snow).',
      'Afterwards, we could warm up with …',
      'It would be a chance to … (spend time together / make new memories).',
    ],
    language: 'give it a go · have fun together · bring back memories · feel like a kid again',
  },
};

// Prediction prompts come before the final chapter and the end of either film.
export const beforeTheEnding = {
  story: {
    language: 'go missing · look everywhere for · follow someone',
    a2: 'I can see … Maybe the cat … What do you think will happen next?',
    b1: 'My guess is … because … Which clue supports your idea?',
  },
  apple: {
    language: 'spend time together · seem bored · pay attention to',
    a2: 'I think he’s using his phone to … His family might feel …',
    b1: 'What makes you think he feels that way? “It looks as if … because …”',
  },
  amazon: {
    language: 'bring back memories · have fun together',
    a2: 'They can see … Maybe they remember …',
    b1: 'What might they do next? “One possibility is … because …”',
  },
};

