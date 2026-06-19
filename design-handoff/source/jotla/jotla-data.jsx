// jotla-data.jsx — seed content for the Jotla prototype.
// Children "Sam" and "Ava" (both invented); schools invented.
// ~3 weeks of entries; lunchtime transitions recur as the hard moments.
// UK spelling, plain parent language, no em dashes.

// ---- profiles (the avatar switches between these) ----
const PROFILES = [
  { id: 'sam', name: 'Sam', school: 'Oakfield Primary', year: 'Year 1', initial: 'S', tint: '#1A56A8', faceBg: '#EAF1FB', figure: '#3A7BD4' },
  { id: 'maria', name: 'Maria', school: 'Meadowbank Junior', year: 'Year 4', initial: 'M', tint: '#27AE60', faceBg: '#E7F6EE', figure: '#27AE60' },
];
const CHILD = PROFILES[0]; // default active

// mood: 'good' | 'ok' | 'hard'
// time: 'Morning' | 'Afternoon' ; clock: 'HH:MM'
// kind: 'contemporaneous' (logged same day) | 'recalled' (added later)
// type: 'quick' | 'handover'
// photo: optional caption string for a sample attached image
const SEED_ENTRIES = [
  // ===== Sam, Week 1 =====
  { id: 'e01', childId: 'sam', date: '2026-05-26', time: 'Morning',   clock: '08:42', setting: 'School', category: 'Play',        mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Settled well at drop-off, went straight to the construction table.' },
  { id: 'e02', childId: 'sam', date: '2026-05-26', time: 'Afternoon', clock: '15:18', setting: 'School', category: 'Transitions', mood: 'ok',   kind: 'contemporaneous', type: 'quick',
    summary: 'A bit wobbly lining up after lunch but a TA walked in with him.' },
  { id: 'e03', childId: 'sam', date: '2026-05-27', time: 'Afternoon', clock: '13:05', setting: 'School', category: 'Lunch hall',  mood: 'hard', kind: 'contemporaneous', type: 'quick',
    summary: 'Lunch hall was loud. Came out upset and would not line up.', photo: 'Note from the lunch supervisor' },
  { id: 'e04', childId: 'sam', date: '2026-05-28', time: 'Morning',   clock: '08:35', setting: 'School', category: 'Eating',      mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Ate a good breakfast at the breakfast club. Calm start.' },
  { id: 'e05', childId: 'sam', date: '2026-05-29', time: 'Afternoon', clock: '15:32', setting: 'School', category: 'Transitions', mood: 'hard', kind: 'contemporaneous', type: 'handover',
    summary: 'Difficult after lunch. Ran off when the bell went.',
    handover: {
      behaviours: ['Running off', 'Refusing', 'Crying'],
      before: 'The line-up bell went straight after lunch.',
      during: 'Ran to the cloakroom, refused to line up, cried for a few minutes.',
      after: 'Calmed down with the teaching assistant near the door.',
      duration: '8 mins',
      helped: 'Walking in at the back of the line, away from the crowd.',
    } },

  // ===== Sam, Week 2 =====
  { id: 'e06', childId: 'sam', date: '2026-06-01', time: 'Morning',   clock: '08:40', setting: 'School', category: 'Mornings',    mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Happy this morning. Showed the new book bag to the teacher.' },
  { id: 'e07', childId: 'sam', date: '2026-06-02', time: 'Afternoon', clock: '13:10', setting: 'School', category: 'Transitions', mood: 'hard', kind: 'contemporaneous', type: 'quick',
    summary: 'Same lunch-to-class change was hard again. Refused to come in.' },
  { id: 'e08', childId: 'sam', date: '2026-06-03', time: 'Morning',   clock: '07:55', setting: 'Home',   category: 'Eating',      mood: 'ok',   kind: 'recalled',        type: 'quick',
    summary: 'Slow breakfast at home, but got out of the door on time.' },
  { id: 'e09', childId: 'sam', date: '2026-06-03', time: 'Afternoon', clock: '15:26', setting: 'School', category: 'Play',        mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Good afternoon. Joined a small group game at choosing time.' },
  { id: 'e10', childId: 'sam', date: '2026-06-04', time: 'Afternoon', clock: '13:02', setting: 'School', category: 'Lunch hall',  mood: 'hard', kind: 'contemporaneous', type: 'quick',
    summary: 'Lunch hall too busy. Did not eat much and was tearful after.' },
  { id: 'e11', childId: 'sam', date: '2026-06-05', time: 'Morning',   clock: '09:15', setting: 'School', category: 'Transitions', mood: 'ok',   kind: 'contemporaneous', type: 'quick',
    summary: 'Carpet time was tricky but he managed with his fidget.' },
  { id: 'e12', childId: 'sam', date: '2026-06-05', time: 'Afternoon', clock: '16:20', setting: 'Club',   category: 'Play',        mood: 'good', kind: 'recalled',        type: 'quick',
    summary: 'After-school club went well. Came home cheerful.' },

  // ===== Sam, Week 3 =====
  { id: 'e13', childId: 'sam', date: '2026-06-08', time: 'Morning',   clock: '08:38', setting: 'School', category: 'Eating',      mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Calm drop-off. Sat with his key worker for breakfast.' },
  { id: 'e14', childId: 'sam', date: '2026-06-09', time: 'Afternoon', clock: '13:08', setting: 'School', category: 'Transitions', mood: 'hard', kind: 'contemporaneous', type: 'quick',
    summary: 'After-lunch line-up again. Stomped off and hid in the book corner.' },
  { id: 'e15', childId: 'sam', date: '2026-06-10', time: 'Morning',   clock: '08:44', setting: 'School', category: 'Play',        mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Lovely morning. Proud of his model and wanted to bring it home.' },
  { id: 'e16', childId: 'sam', date: '2026-06-10', time: 'Afternoon', clock: '14:05', setting: 'School', category: 'Other',       mood: 'ok',   kind: 'contemporaneous', type: 'quick',
    summary: 'Assembly was a lot of noise. Needed ear defenders but coped.' },
  // The completed Dysregulation Mode entry
  { id: 'e17', childId: 'sam', date: '2026-06-11', time: 'Afternoon', clock: '15:31', setting: 'School', category: 'Transitions', mood: 'hard', kind: 'contemporaneous', type: 'handover',
    summary: 'Hard again at the lunchtime move. Lay on the floor outside the hall, helped by going in five minutes early.',
    photo: 'Photo from the classroom door',
    handover: {
      behaviours: ['Running off', 'Refusing', 'Crying'],
      before: 'Line-up bell after lunch.',
      during: 'Ran to the book corner, refused to line up, cried for about 10 minutes.',
      after: 'Settled with the teaching assistant and a quiet job.',
      duration: '10 mins',
      helped: 'A 2-minute warning before the bell.',
    } },
  { id: 'e18', childId: 'sam', date: '2026-06-12', time: 'Morning',   clock: '08:40', setting: 'School', category: 'Mornings',    mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Bright start. Walked in holding his key worker\u2019s hand.' },
  { id: 'e19', childId: 'sam', date: '2026-06-12', time: 'Afternoon', clock: '15:22', setting: 'School', category: 'Transitions', mood: 'ok',   kind: 'contemporaneous', type: 'quick',
    summary: 'The 2-minute warning helped today. Lined up with a reminder.' },

  // ===== Maria (lighter record) =====
  { id: 'm01', childId: 'maria', date: '2026-06-09', time: 'Morning',   clock: '08:50', setting: 'School', category: 'Mornings',    mood: 'good', kind: 'contemporaneous', type: 'quick',
    summary: 'Good start. Talked happily about the science trip.' },
  { id: 'm02', childId: 'maria', date: '2026-06-10', time: 'Afternoon', clock: '14:40', setting: 'School', category: 'Transitions', mood: 'ok',   kind: 'contemporaneous', type: 'quick',
    summary: 'Found the move to maths tricky but settled with a timer.' },
  { id: 'm03', childId: 'maria', date: '2026-06-11', time: 'Afternoon', clock: '15:35', setting: 'Home',   category: 'Other',       mood: 'good', kind: 'recalled',        type: 'quick',
    summary: 'Calm afternoon at home. Read together before tea.' },
];

// ---- document vault (per child) ----
const SEED_DOCS = [
  { id: 'd01', childId: 'sam', title: 'EHC needs assessment decision', type: 'Letter', from: 'Local Authority',
    received: '2026-05-20', about: 'Agreement to carry out an EHC needs assessment.', action: 'Reply by 30 June', mood: 'good' },
  { id: 'd02', childId: 'sam', title: 'Occupational therapy report', type: 'Report', from: 'NHS Paediatric OT',
    received: '2026-06-02', about: 'Sensory profile and recommendations for the classroom.', action: '', mood: 'good' },
  { id: 'd03', childId: 'sam', title: 'Lunchtime support plan', type: 'Plan', from: 'Oakfield Primary',
    received: '2026-06-09', about: 'Agreed steps for the after-lunch transition.', action: 'Review at next meeting', mood: 'ok' },
  { id: 'd04', childId: 'maria', title: 'Annual review invitation', type: 'Letter', from: 'Meadowbank Junior',
    received: '2026-06-05', about: 'Date and agenda for the yearly review meeting.', action: 'Confirm attendance', mood: 'ok' },
];

const DOC_TYPES = ['Letter', 'Report', 'Plan', 'Assessment', 'Email', 'Other'];
const DOC_SOURCES = ['School', 'GP', 'Paediatrician', 'Occupational therapist', 'Local Authority', 'Other'];

// Avatar colours a parent can choose for each child: rainbow hues (no red, that is the alert colour).
const AVATAR_COLOURS = [
  { key: 'amber',  figure: '#F39C12' },
  { key: 'gold',   figure: '#D9A300' },
  { key: 'orange', figure: '#EE7B2D' },
  { key: 'lime',   figure: '#A0C81E' },
  { key: 'green',  figure: '#27AE60' },
  { key: 'teal',   figure: '#0FA3A3' },
  { key: 'sky',    figure: '#3A7BD4' },
  { key: 'indigo', figure: '#1A56A8' },
  { key: 'slate',  figure: '#607C97' },
  { key: 'violet', figure: '#7C5CE0' },
  { key: 'plum',   figure: '#A12FC0' },
  { key: 'pink',   figure: '#D6479B' },
];

// "Today" in the prototype is Friday 12 June 2026.
const TODAY_ISO = '2026-06-12';

const SETTINGS = ['School', 'Nursery', 'Home', 'Club'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const CATEGORIES = ['Mornings', 'Eating', 'Play', 'Transitions', 'Lunch hall', 'Other'];

const BEHAVIOURS = ['Crying', 'Hitting out', 'Running off', 'Refusing', 'Stomping', 'Withdrawing', 'Screaming'];

// Moods in order good -> hard for the face row
const MOODS = [
  { key: 'good', label: 'Good day' },
  { key: 'ok',   label: 'Up and down' },
  { key: 'hard', label: 'Hard day' },
];

// Child-mode scenes and emotions
const CHILD_SCENES = [
  { key: 'classroom',  label: 'Classroom' },
  { key: 'lunch',      label: 'Lunch hall' },
  { key: 'playground', label: 'Playground' },
];
const CHILD_EMOTIONS = [
  { key: 'happy',   label: 'Happy' },
  { key: 'ok',      label: 'Ok' },
  { key: 'sad',     label: 'Sad' },
  { key: 'worried', label: 'Worried' },
  { key: 'angry',   label: 'Angry' },
];

// Filter themes for Find
const FIND_THEMES = ['Lunch hall', 'Transitions', 'Eating', 'Play', 'Sleep', 'Mornings'];
const FIND_MOODS = [
  { key: 'good', label: 'Good' },
  { key: 'ok',   label: 'Mixed' },
  { key: 'hard', label: 'Hard' },
];

// ---- helpers ----
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DOW_MON = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; // calendar header order
const DOW_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtLong(iso) {
  const dt = parseISO(iso);
  return `${DOW_LONG[dt.getDay()]}, ${dt.getDate()} ${MONTH_NAMES[dt.getMonth()]}`;
}
function fmtShort(iso) {
  const dt = parseISO(iso);
  return `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()].slice(0,3)}`;
}
// Day-level mood: any hard -> hard; any ok / mixed -> ok; all good -> good; none -> null
function dayMood(entries) {
  if (!entries.length) return null;
  if (entries.some(e => e.mood === 'hard')) return 'hard';
  if (entries.every(e => e.mood === 'good')) return 'good';
  return 'ok';
}

Object.assign(window, {
  JOTLA: {
    PROFILES, CHILD, SEED_ENTRIES, SEED_DOCS, DOC_TYPES, DOC_SOURCES, AVATAR_COLOURS,
    TODAY_ISO, SETTINGS, TIMES, CATEGORIES, BEHAVIOURS,
    MOODS, CHILD_SCENES, CHILD_EMOTIONS, FIND_THEMES, FIND_MOODS,
    MONTH_NAMES, DOW_SHORT, DOW_MON, DOW_LONG, parseISO, fmtLong, fmtShort, dayMood,
  },
});
