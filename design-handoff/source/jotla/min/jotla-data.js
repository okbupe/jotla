// jotla-data.jsx: seed content for the Jotla prototype.
// Children "Sam" and "Maria" (both invented); schools invented.
// The sample record spans a school journey from early January to today:
// most of it comes from a deterministic generator (seeded PRNG, so every
// device sees the same demo), and the most recent weeks are hand-written.
// UK spelling, plain parent language, no em dashes.

// ---- profiles (the avatar switches between these) ----
const PROFILES = [{
  id: 'sam',
  name: 'Sam',
  school: 'Oakfield Primary',
  year: 'Year 1',
  initial: 'S',
  tint: '#1A56A8',
  faceBg: '#EAF1FB',
  figure: '#3A7BD4'
}, {
  id: 'maria',
  name: 'Maria',
  school: 'Meadowbank Junior',
  year: 'Year 4',
  initial: 'M',
  tint: '#27AE60',
  faceBg: '#E7F6EE',
  figure: '#27AE60'
}];
const CHILD = PROFILES[0]; // default active

// ---- the hand-written recent weeks (kept: richest content, nearest the anchor) ----
const HAND_ENTRIES = [{
  id: 'e01',
  childId: 'sam',
  date: '2026-05-26',
  time: 'Morning',
  clock: '08:42',
  setting: 'School',
  category: 'Play',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Settled well at drop-off, went straight to the construction table.'
}, {
  id: 'e02',
  childId: 'sam',
  date: '2026-05-26',
  time: 'Afternoon',
  clock: '15:18',
  setting: 'School',
  category: 'Transitions',
  mood: 'ok',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'A bit wobbly lining up after lunch but a TA walked in with him.'
}, {
  id: 'e03',
  childId: 'sam',
  date: '2026-05-27',
  time: 'Afternoon',
  clock: '13:05',
  setting: 'School',
  category: 'Lunch hall',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Lunch hall was loud. Came out upset and would not line up.',
  photo: 'Note from the lunch supervisor'
}, {
  id: 'e04',
  childId: 'sam',
  date: '2026-05-28',
  time: 'Morning',
  clock: '08:35',
  setting: 'School',
  category: 'Eating',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Ate a good breakfast at the breakfast club. Calm start.'
}, {
  id: 'e05',
  childId: 'sam',
  date: '2026-05-29',
  time: 'Afternoon',
  clock: '15:32',
  setting: 'School',
  category: 'Transitions',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'handover',
  summary: 'Difficult after lunch. Ran off when the bell went.',
  handover: {
    behaviours: ['Running off', 'Refusing', 'Crying'],
    who: ['Teachers', 'TA', 'Other children'],
    where: 'Corridor',
    before: 'The line-up bell went straight after lunch.',
    during: 'Ran to the cloakroom, refused to line up, cried for a few minutes.',
    after: 'Calmed down with the teaching assistant near the door.',
    duration: '8 mins',
    helped: 'Walking in at the back of the line, away from the crowd.'
  }
}, {
  id: 'e06',
  childId: 'sam',
  date: '2026-06-01',
  time: 'Morning',
  clock: '08:40',
  setting: 'School',
  category: 'Mornings',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Happy this morning. Showed the new book bag to the teacher.'
}, {
  id: 'e07',
  childId: 'sam',
  date: '2026-06-02',
  time: 'Afternoon',
  clock: '13:10',
  setting: 'School',
  category: 'Transitions',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Same lunch-to-class change was hard again. Refused to come in.'
}, {
  id: 'e08',
  childId: 'sam',
  date: '2026-06-03',
  time: 'Morning',
  clock: '07:55',
  setting: 'Home',
  category: 'Eating',
  mood: 'ok',
  kind: 'recalled',
  type: 'quick',
  summary: 'Slow breakfast at home, but got out of the door on time.'
}, {
  id: 'e09',
  childId: 'sam',
  date: '2026-06-03',
  time: 'Afternoon',
  clock: '15:26',
  setting: 'School',
  category: 'Play',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Good afternoon. Joined a small group game at choosing time.'
}, {
  id: 'e10',
  childId: 'sam',
  date: '2026-06-04',
  time: 'Afternoon',
  clock: '13:02',
  setting: 'School',
  category: 'Lunch hall',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Lunch hall too busy. Did not eat much and was tearful after.'
}, {
  id: 'e11',
  childId: 'sam',
  date: '2026-06-05',
  time: 'Morning',
  clock: '09:15',
  setting: 'School',
  category: 'Transitions',
  mood: 'ok',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Carpet time was tricky but he managed with his fidget.'
}, {
  id: 'e12',
  childId: 'sam',
  date: '2026-06-05',
  time: 'Afternoon',
  clock: '16:20',
  setting: 'Club',
  category: 'Play',
  mood: 'good',
  kind: 'recalled',
  type: 'quick',
  summary: 'After-school club went well. Came home cheerful.'
}, {
  id: 'e13',
  childId: 'sam',
  date: '2026-06-08',
  time: 'Morning',
  clock: '08:38',
  setting: 'School',
  category: 'Eating',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Calm drop-off. Sat with his key worker for breakfast.'
}, {
  id: 'e14',
  childId: 'sam',
  date: '2026-06-09',
  time: 'Afternoon',
  clock: '13:08',
  setting: 'School',
  category: 'Transitions',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'After-lunch line-up again. Stomped off and hid in the book corner.'
}, {
  id: 'e15',
  childId: 'sam',
  date: '2026-06-10',
  time: 'Morning',
  clock: '08:44',
  setting: 'School',
  category: 'Play',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Lovely morning. Proud of his model and wanted to bring it home.'
}, {
  id: 'e16',
  childId: 'sam',
  date: '2026-06-10',
  time: 'Afternoon',
  clock: '14:05',
  setting: 'School',
  category: 'Other',
  mood: 'ok',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Assembly was a lot of noise. Needed ear defenders but coped.'
}, {
  id: 'e17',
  childId: 'sam',
  date: '2026-06-11',
  time: 'Afternoon',
  clock: '15:31',
  setting: 'School',
  category: 'Transitions',
  mood: 'hard',
  kind: 'contemporaneous',
  type: 'handover',
  summary: 'Hard again at the lunchtime move. Lay on the floor outside the hall, helped by going in five minutes early.',
  photo: 'Photo from the classroom door',
  handover: {
    behaviours: ['Running off', 'Refusing', 'Crying'],
    who: ['TA', 'Other children'],
    where: 'Lunch hall',
    before: 'Line-up bell after lunch.',
    during: 'Ran to the book corner, refused to line up, cried for about 10 minutes.',
    after: 'Settled with the teaching assistant and a quiet job.',
    duration: '10 mins',
    helped: 'A 2-minute warning before the bell.'
  }
}, {
  id: 'e18',
  childId: 'sam',
  date: '2026-06-12',
  time: 'Morning',
  clock: '08:40',
  setting: 'School',
  category: 'Mornings',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Bright start. Walked in holding his key worker’s hand.'
}, {
  id: 'e19',
  childId: 'sam',
  date: '2026-06-12',
  time: 'Afternoon',
  clock: '15:22',
  setting: 'School',
  category: 'Transitions',
  mood: 'ok',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'The 2-minute warning helped today. Lined up with a reminder.'
}, {
  id: 'm01',
  childId: 'maria',
  date: '2026-06-09',
  time: 'Morning',
  clock: '08:50',
  setting: 'School',
  category: 'Mornings',
  mood: 'good',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Good start. Talked happily about the science trip.'
}, {
  id: 'm02',
  childId: 'maria',
  date: '2026-06-10',
  time: 'Afternoon',
  clock: '14:40',
  setting: 'School',
  category: 'Transitions',
  mood: 'ok',
  kind: 'contemporaneous',
  type: 'quick',
  summary: 'Found the move to maths tricky but settled with a timer.'
}, {
  id: 'm03',
  childId: 'maria',
  date: '2026-06-11',
  time: 'Afternoon',
  clock: '15:35',
  setting: 'Home',
  category: 'Other',
  mood: 'good',
  kind: 'recalled',
  type: 'quick',
  summary: 'Calm afternoon at home. Read together before tea.'
}];

// ---- generated history: January to late May, deterministic ----
// A seeded PRNG (not Math.random) so every device sees the same sample record.
function _mkRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
const _TPL = {
  Mornings: {
    good: ['Calm drop-off. Walked in with a smile.', 'Good start to the day, straight in with no fuss.', 'Happy at the gate and keen to show the teacher a drawing.', 'Left the house on time and chatted all the way to school.'],
    ok: ['A slow start but got there. Needed a countdown to leave the house.', 'Wobbly at the gate, went in holding a TA’s hand.', 'Took a while to settle at drop-off but managed.'],
    hard: ['Very hard drop-off. Clung on and cried at the gate.', 'Refused to get dressed for school. We were late and both worn out.', 'Would not go through the door. A TA helped after ten minutes.']
  },
  Eating: {
    good: ['Ate a good breakfast at the breakfast club. Calm start.', 'Tried a new food at tea without a fuss.', 'Finished most of the packed lunch today.'],
    ok: ['Picked at lunch but ate the sandwich at least.', 'Slow tea, needed the usual plate and spoon to get going.', 'Only ate the dry foods again, but stayed at the table.'],
    hard: ['Barely touched food all day. Said the hall smelled wrong.', 'Refused lunch completely. Came home very hungry and cross.', 'Got upset at tea when a new food touched the plate.']
  },
  Play: {
    good: ['Joined a small group game at choosing time.', 'Played alongside two children in the sandpit, lovely to see.', 'Built a big model and was proud to show it off.'],
    ok: ['Played alone most of playtime but seemed content.', 'Shared for a while, then needed space and took it.', 'Watched the game from the side and joined for the last bit.'],
    hard: ['Fell out with a friend over turn-taking and could not recover.', 'Playtime ended in tears, too many children too close.', 'Struggled to share at all today and hid the toys.']
  },
  Transitions: {
    good: ['Lined up first time after the 2-minute warning.', 'Moved between lessons calmly today.', 'Coped with a room change because the TA gave an early warning.'],
    ok: ['Needed two reminders to line up but got there.', 'The change to PE was tricky, settled once changed.', 'Hovered at the back of the line but stayed with the class.'],
    hard: ['Refused to come in after break. Took a long time to settle.', 'The move from carpet to tables ended in tears.', 'Ran off when the bell went and hid in the cloakroom.']
  },
  'Lunch hall': {
    good: ['Quieter hall today, ate well and came out smiling.', 'Sat with a buddy at the end table and managed the whole sitting.', 'Going in five minutes early worked, calm lunch.'],
    ok: ['Managed the hall with ear defenders but ate quickly to leave.', 'Coped with lunch but was flat for a while afterwards.', 'Ate a little in the hall then finished in the classroom.'],
    hard: ['Lunch hall was loud. Came out upset and would not line up.', 'Too busy in the hall, did not eat and was tearful after.', 'Covered ears and cried at lunch, had to leave the hall.']
  },
  Incidents: {
    good: ['A near-miss at break turned around by a quiet word early.'],
    ok: ['A shove in the line at break, sorted quickly and calmly.', 'Upset by a loud fire-bell test but recovered with support.'],
    hard: ['Big upset at break when the game changed suddenly.', 'A meltdown in the corridor after assembly overran.', 'Threw a chair when computer time ended, needed the quiet room.']
  },
  Other: {
    good: ['Assembly went fine with ear defenders on.', 'Lovely afternoon in the library corner.', 'Good session with the key worker this afternoon.'],
    ok: ['Assembly was a lot of noise but coped.', 'Tired after a busy afternoon, quiet on the way home.', 'Found the supply teacher unsettling but managed.'],
    hard: ['The fire alarm went off and it took an hour to recover.', 'School photo day, too much waiting and noise, very upset.', 'Slept badly and everything felt harder today.']
  }
};
const _HOME_TPL = {
  good: ['Calm afternoon at home. Played happily after school.', 'A lovely weekend morning, relaxed and giggly.', 'Good tea time, told us all about the day.'],
  ok: ['Tired and quiet after school, needed a blanket and some space.', 'A restless evening but settled at bedtime with the usual routine.', 'Up and down at home today, better after some time in the garden.'],
  hard: ['Held it together at school and let it all out at home.', 'A very hard evening, everything was wrong from the door.', 'Big meltdown at bath time, took a long while to settle.']
};
const _HAND_TPL = [{
  behaviours: ['Refusing', 'Crying'],
  before: 'The bell went for the end of lunch.',
  during: 'Refused to line up and cried by the fence.',
  after: 'Came in holding the TA’s hand once the line had gone.',
  duration: '6 mins',
  helped: 'Waiting for the corridor to clear first.'
}, {
  behaviours: ['Running off', 'Withdrawing'],
  before: 'A supply teacher was covering the afternoon.',
  during: 'Ran to the cloakroom and sat under the pegs.',
  after: 'Returned with a quiet job to carry to the office.',
  duration: '12 mins',
  helped: 'Being given a job instead of an instruction.'
}, {
  behaviours: ['Crying', 'Stomping'],
  before: 'PE was moved to the hall without warning.',
  during: 'Stomped and cried at the changed plan.',
  after: 'Settled after sitting out the first five minutes.',
  duration: '10 mins',
  helped: 'A visual timetable check-in before the change.'
}, {
  behaviours: ['Hitting out', 'Crying'],
  before: 'A busy wet-play classroom at lunchtime.',
  during: 'Hit out when the game got too close and loud.',
  after: 'Calmed in the book corner with the lights low.',
  duration: '9 mins',
  helped: 'Space, low light and no questions until calm.'
}];
const _PHOTO_CAPTIONS = ['Note from the class teacher', 'Photo of the visual timetable', 'Photo from the school gate', 'Note from the lunch supervisor'];
function _shiftStr(iso, days) {
  const p = iso.split('-').map(Number);
  const dt = new Date(p[0], p[1] - 1, p[2]);
  dt.setDate(dt.getDate() + days);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}
const _HOLIDAY_MONDAYS = ['2026-02-16', '2026-04-06', '2026-04-13']; // half term + Easter
function _inHoliday(iso) {
  return _HOLIDAY_MONDAYS.some(function (mon) {
    return iso >= mon && iso < _shiftStr(mon, 5);
  });
}
function _genHistory() {
  const rnd = _mkRng(20260105);
  const out = [];
  let n = 100;
  const pick = function (arr) {
    return arr[Math.floor(rnd() * arr.length)];
  };
  const clockIn = function (a, b) {
    const mins = Math.floor(a * 60 + rnd() * (b - a) * 60);
    return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
  };
  const moodPick = function (g, o) {
    const r = rnd();
    return r < g ? 'good' : r < g + o ? 'ok' : 'hard';
  };
  const kindPick = function () {
    return rnd() < 0.15 ? 'recalled' : 'contemporaneous';
  };
  const start = new Date(2026, 0, 5); // Mon 5 Jan 2026
  const end = new Date(2026, 4, 22); // Fri 22 May 2026 (the hand-written weeks follow)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const holiday = _inHoliday(iso);

    // ---- Sam ----
    if (weekend || holiday) {
      if (rnd() < 0.28) {
        const mood = moodPick(0.55, 0.3);
        out.push({
          id: 'e' + n++,
          childId: 'sam',
          date: iso,
          time: rnd() < 0.5 ? 'Morning' : 'Afternoon',
          clock: clockIn(9, 18),
          setting: 'Home',
          category: pick(['Play', 'Eating', 'Other']),
          mood: mood,
          kind: kindPick(),
          type: 'quick',
          summary: pick(_HOME_TPL[mood])
        });
      }
    } else {
      if (rnd() < 0.5) {
        const cat = pick(['Mornings', 'Mornings', 'Eating']);
        const mood = moodPick(0.55, 0.3);
        const e = {
          id: 'e' + n++,
          childId: 'sam',
          date: iso,
          time: 'Morning',
          clock: clockIn(7.6, 9.2),
          setting: rnd() < 0.85 ? 'School' : 'Home',
          category: cat,
          mood: mood,
          kind: kindPick(),
          type: 'quick',
          summary: pick(_TPL[cat][mood])
        };
        if (rnd() < 0.06) e.photo = pick(_PHOTO_CAPTIONS);
        out.push(e);
      }
      if (rnd() < 0.72) {
        const r = rnd();
        const cat = r < 0.3 ? 'Transitions' : r < 0.52 ? 'Lunch hall' : r < 0.7 ? 'Play' : r < 0.82 ? 'Other' : r < 0.92 ? 'Incidents' : 'Eating';
        const hardish = cat === 'Transitions' || cat === 'Lunch hall' || cat === 'Incidents';
        const mood = hardish ? moodPick(0.25, 0.32) : moodPick(0.55, 0.3);
        const isHand = hardish && mood === 'hard' && rnd() < 0.28;
        const e = {
          id: 'e' + n++,
          childId: 'sam',
          date: iso,
          time: 'Afternoon',
          clock: cat === 'Lunch hall' ? clockIn(12.9, 13.4) : clockIn(13, 16.5),
          setting: 'School',
          category: cat,
          mood: mood,
          kind: kindPick(),
          type: isHand ? 'handover' : 'quick',
          summary: pick(_TPL[cat][mood])
        };
        if (rnd() < 0.07) e.photo = pick(_PHOTO_CAPTIONS);
        if (isHand) e.handover = pick(_HAND_TPL);
        out.push(e);
      }
      if (dow === 5 && rnd() < 0.2) {
        const mood = moodPick(0.7, 0.25);
        out.push({
          id: 'e' + n++,
          childId: 'sam',
          date: iso,
          time: 'Afternoon',
          clock: clockIn(16, 17.5),
          setting: 'Club',
          category: 'Play',
          mood: mood,
          kind: kindPick(),
          type: 'quick',
          summary: pick(mood === 'good' ? ['After-school club went well. Came home cheerful.', 'Football club was a hit this week.'] : mood === 'ok' ? ['Club was busy, coped but came home tired.'] : ['Club was too much today, left early.'])
        });
      }
    }

    // ---- Maria (lighter record, starts February) ----
    if (!weekend && !holiday && iso >= '2026-02-02' && rnd() < 0.38) {
      const cat = pick(['Transitions', 'Play', 'Mornings', 'Other']);
      const mood = moodPick(0.6, 0.3);
      out.push({
        id: 'm' + n++,
        childId: 'maria',
        date: iso,
        time: rnd() < 0.4 ? 'Morning' : 'Afternoon',
        clock: clockIn(8.4, 15.7),
        setting: rnd() < 0.8 ? 'School' : 'Home',
        category: cat,
        mood: mood,
        kind: kindPick(),
        type: 'quick',
        summary: pick(_TPL[cat][mood])
      });
    }
  }
  return out;
}
const SEED_ENTRIES = _genHistory().concat(HAND_ENTRIES);

// ---- document vault (per child) ----
const SEED_DOCS = [{
  id: 'd05',
  childId: 'sam',
  title: 'Settling-in review meeting notes',
  type: 'Email',
  from: 'Oakfield Primary',
  received: '2026-01-09',
  about: 'Notes from the January settling-in review with the class teacher.',
  action: '',
  mood: 'good'
}, {
  id: 'd06',
  childId: 'sam',
  title: 'Request for an EHC needs assessment',
  type: 'Letter',
  from: 'Local Authority',
  received: '2026-01-14',
  about: 'Our request letter, sent recorded delivery. The 6-week clock starts here.',
  action: '',
  mood: 'good'
}, {
  id: 'd07',
  childId: 'sam',
  title: 'Acknowledgement of assessment request',
  type: 'Letter',
  from: 'Local Authority',
  received: '2026-01-21',
  about: 'The Local Authority confirming they received the request.',
  action: '',
  mood: 'good'
}, {
  id: 'd08',
  childId: 'sam',
  title: 'SEN support plan, spring term',
  type: 'Plan',
  from: 'Oakfield Primary',
  received: '2026-01-28',
  about: 'What the school says it will do this term and who does it.',
  action: 'Check it is happening half-termly',
  mood: 'ok'
}, {
  id: 'd09',
  childId: 'sam',
  title: 'GP referral to community paediatrics',
  type: 'Letter',
  from: 'GP',
  received: '2026-02-04',
  about: 'Referral following the January appointment.',
  action: '',
  mood: 'good'
}, {
  id: 'd10',
  childId: 'sam',
  title: 'Sensory checklist for home',
  type: 'Other',
  from: 'Occupational therapist',
  received: '2026-02-11',
  about: 'The checklist we filled in for the OT assessment.',
  action: '',
  mood: 'good'
}, {
  id: 'd11',
  childId: 'sam',
  title: 'Decision to assess',
  type: 'Letter',
  from: 'Local Authority',
  received: '2026-02-25',
  about: 'The Local Authority agreed to carry out the EHC needs assessment.',
  action: '',
  mood: 'good'
}, {
  id: 'd12',
  childId: 'sam',
  title: 'Parent advice form (our views)',
  type: 'Other',
  from: 'Local Authority',
  received: '2026-03-04',
  about: 'Our completed parental advice for the assessment, kept for reference.',
  action: '',
  mood: 'good'
}, {
  id: 'd13',
  childId: 'sam',
  title: 'Educational psychologist appointment',
  type: 'Letter',
  from: 'Local Authority',
  received: '2026-03-11',
  about: 'Date for the EP to observe Sam at school.',
  action: 'Confirm school knows',
  mood: 'ok'
}, {
  id: 'd14',
  childId: 'sam',
  title: 'Speech and language assessment report',
  type: 'Report',
  from: 'NHS Speech and Language',
  received: '2026-03-25',
  about: 'Assessment findings and a recommended programme.',
  action: '',
  mood: 'good'
}, {
  id: 'd15',
  childId: 'sam',
  title: 'Educational psychologist report',
  type: 'Report',
  from: 'Local Authority',
  received: '2026-04-22',
  about: 'The EP’s advice for the assessment, with recommendations.',
  action: '',
  mood: 'good'
}, {
  id: 'd16',
  childId: 'sam',
  title: 'Wet-play incident note',
  type: 'Email',
  from: 'Oakfield Primary',
  received: '2026-04-29',
  about: 'The school’s note about the lunchtime incident and what they changed.',
  action: '',
  mood: 'ok'
}, {
  id: 'd17',
  childId: 'sam',
  title: 'Occupational therapy report',
  type: 'Report',
  from: 'NHS Paediatric OT',
  received: '2026-05-06',
  about: 'Sensory profile and recommendations for the classroom.',
  action: '',
  mood: 'good'
}, {
  id: 'd01',
  childId: 'sam',
  title: 'EHC needs assessment decision',
  type: 'Letter',
  from: 'Local Authority',
  received: '2026-05-20',
  about: 'Agreement to issue an EHC plan; draft to follow.',
  action: 'Reply by 30 June',
  mood: 'good'
}, {
  id: 'd02',
  childId: 'sam',
  title: 'Draft EHC plan',
  type: 'Plan',
  from: 'Local Authority',
  received: '2026-06-02',
  about: 'The draft plan. 15 days to comment, so read Section F closely.',
  action: 'Comments due back',
  mood: 'ok'
}, {
  id: 'd03',
  childId: 'sam',
  title: 'Lunchtime support plan',
  type: 'Plan',
  from: 'Oakfield Primary',
  received: '2026-06-09',
  about: 'Agreed steps for the after-lunch transition.',
  action: 'Review at next meeting',
  mood: 'ok'
}, {
  id: 'd18',
  childId: 'maria',
  title: 'Autumn review meeting notes',
  type: 'Email',
  from: 'Meadowbank Junior',
  received: '2026-01-16',
  about: 'Notes from the autumn term review, filed for reference.',
  action: '',
  mood: 'good'
}, {
  id: 'd19',
  childId: 'maria',
  title: 'Reading intervention plan',
  type: 'Plan',
  from: 'Meadowbank Junior',
  received: '2026-02-06',
  about: 'Three sessions a week with the reading tutor this term.',
  action: '',
  mood: 'good'
}, {
  id: 'd20',
  childId: 'maria',
  title: 'Hearing test results',
  type: 'Report',
  from: 'GP',
  received: '2026-03-06',
  about: 'Hearing within the normal range; query settled.',
  action: '',
  mood: 'good'
}, {
  id: 'd21',
  childId: 'maria',
  title: 'Maths anxiety support note',
  type: 'Email',
  from: 'Meadowbank Junior',
  received: '2026-04-24',
  about: 'What the class teacher is trying for the move into maths.',
  action: '',
  mood: 'ok'
}, {
  id: 'd22',
  childId: 'maria',
  title: 'School trip arrangements letter',
  type: 'Letter',
  from: 'Meadowbank Junior',
  received: '2026-05-13',
  about: 'Adjustments agreed for the science museum trip.',
  action: '',
  mood: 'good'
}, {
  id: 'd04',
  childId: 'maria',
  title: 'Annual review invitation',
  type: 'Letter',
  from: 'Meadowbank Junior',
  received: '2026-06-05',
  about: 'Date and agenda for the yearly review meeting.',
  action: 'Confirm attendance',
  mood: 'ok'
}];
const DOC_TYPES = ['Letter', 'Report', 'Plan', 'Assessment', 'Email', 'Other'];
const DOC_SOURCES = ['School', 'GP', 'Paediatrician', 'Occupational therapist', 'Local Authority', 'Other'];

// Avatar colours a parent can choose for each child: rainbow hues (no red, that is the alert colour).
const AVATAR_COLOURS = [{
  key: 'amber',
  figure: '#F39C12'
}, {
  key: 'gold',
  figure: '#D9A300'
}, {
  key: 'orange',
  figure: '#EE7B2D'
}, {
  key: 'lime',
  figure: '#A0C81E'
}, {
  key: 'green',
  figure: '#27AE60'
}, {
  key: 'teal',
  figure: '#0FA3A3'
}, {
  key: 'sky',
  figure: '#3A7BD4'
}, {
  key: 'indigo',
  figure: '#1A56A8'
}, {
  key: 'slate',
  figure: '#607C97'
}, {
  key: 'violet',
  figure: '#7C5CE0'
}, {
  key: 'plum',
  figure: '#A12FC0'
}, {
  key: 'pink',
  figure: '#D6479B'
}];

// "Today" is the device's real current date, so the calendar always knows the day.
const _NOW = new Date();
_NOW.setHours(0, 0, 0, 0);
const _pad2 = n => String(n).padStart(2, '0');
const _isoOf = d => `${d.getFullYear()}-${_pad2(d.getMonth() + 1)}-${_pad2(d.getDate())}`;
const TODAY_ISO = _isoOf(_NOW);
// The sample record is anchored near today (shifted by whole weeks so weekdays stay put),
// so the seed data always looks recent whenever the prototype is opened.
const SEED_ANCHOR_ISO = '2026-06-12'; // the last seeded day in the original data

const SETTINGS = ['School', 'Nursery', 'Home', 'Club'];

/** True for the four Jotla suggests, false for a place the parent typed. */
function isNamedSetting(s) {
  return SETTINGS.includes(s);
}

/** A setting as it reads inside a sentence ("Play at school", "Play at Grandma's").
 *
 *  The four are common nouns and belong lowercase mid-sentence. A place the PARENT
 *  typed is theirs, capitals and all, and must survive verbatim.
 *
 *  This is not cosmetic. `jotla-parent-a.jsx` composes the entry summary from it when
 *  a moment carries no words of its own, and then STORES it: a summary is testimony,
 *  and Jotla never rewrites or back-fills one afterwards. A blanket toLowerCase() put
 *  "Play at grandma's." in the record permanently, and "at st mary's", and "at nanny
 *  jean's". Ported from native's settingInSentence (src/domain/types.ts), which fixed
 *  this first; the two must not drift. */
function settingInSentence(s) {
  return isNamedSetting(s) ? s.toLowerCase() : s;
}
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const CATEGORIES = ['Mornings', 'Eating', 'Play', 'Transitions', 'Lunch hall', 'School feedback', 'New words', 'Wins', 'Incidents', 'Other'];
const BEHAVIOURS = ['Crying', 'Hitting out', 'Running off', 'Refusing', 'Stomping', 'Withdrawing', 'Screaming'];

// Moods in order good -> hard for the face row
//
// ONE WORD FOR THE MIDDLE MOOD (founder, 4 Aug 2026; mirrored from native
// domain/types.ts): 'ok' was "Up and down" here and in the Month legend, but
// "Mixed" in FIND_MOODS below and in both graphs. One thing, two names, across
// the app. "Mixed" wins on the count and is the shorter word. Vocabulary only:
// the 'ok' mood itself is untouched, so every stored entry keeps its key.
const MOODS = [{
  key: 'good',
  label: 'Good day'
}, {
  key: 'ok',
  label: 'Mixed day'
}, {
  key: 'hard',
  label: 'Hard day'
}];

// Child-mode scenes and emotions
const CHILD_SCENES = [{
  key: 'classroom',
  label: 'Classroom'
}, {
  key: 'lunch',
  label: 'Lunch hall'
}, {
  key: 'playground',
  label: 'Playground'
}];
const CHILD_EMOTIONS = [{
  key: 'happy',
  label: 'Happy'
}, {
  key: 'ok',
  label: 'Ok'
}, {
  key: 'sad',
  label: 'Sad'
}, {
  key: 'worried',
  label: 'Worried'
}, {
  key: 'angry',
  label: 'Angry'
}];

// Filter themes for Find
const FIND_THEMES = ['Lunch hall', 'Transitions', 'Eating', 'Play', 'Mornings', 'Incidents'];
const FIND_MOODS = [{
  key: 'good',
  label: 'Good'
}, {
  key: 'ok',
  label: 'Mixed'
}, {
  key: 'hard',
  label: 'Hard'
}];

// ---- helpers ----
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // calendar header order
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
  return `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()].slice(0, 3)}`;
}
// Day-level mood: any hard -> hard; any ok / mixed -> ok; all good -> good; none -> null
function dayMood(entries) {
  if (!entries.length) return null;
  if (entries.some(e => e.mood === 'hard')) return 'hard';
  if (entries.every(e => e.mood === 'good')) return 'good';
  return 'ok';
}

// Anchor the seed near the real today (whole-week shift preserves weekdays).
function _isoShift(iso, days) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return _isoOf(d);
}
const _weekShift = Math.round((_NOW - parseISO(SEED_ANCHOR_ISO)) / 86400000 / 7) * 7;
const SEED_ENTRIES_LIVE = _weekShift ? SEED_ENTRIES.map(e => ({
  ...e,
  date: _isoShift(e.date, _weekShift)
})) : SEED_ENTRIES;
const SEED_DOCS_LIVE = _weekShift ? SEED_DOCS.map(d => ({
  ...d,
  received: _isoShift(d.received, _weekShift)
})) : SEED_DOCS;
Object.assign(window, {
  JOTLA: {
    PROFILES,
    CHILD,
    SEED_ENTRIES: SEED_ENTRIES_LIVE,
    SEED_DOCS: SEED_DOCS_LIVE,
    DOC_TYPES,
    DOC_SOURCES,
    AVATAR_COLOURS,
    SEED_SHIFTING: true,
    // sample data re-anchors near "today"; a real record sets this false
    TODAY_ISO,
    SETTINGS,
    TIMES,
    CATEGORIES,
    BEHAVIOURS,
    MOODS,
    CHILD_SCENES,
    CHILD_EMOTIONS,
    FIND_THEMES,
    FIND_MOODS,
    MONTH_NAMES,
    DOW_SHORT,
    DOW_MON,
    DOW_LONG,
    parseISO,
    fmtLong,
    fmtShort,
    dayMood,
    isNamedSetting,
    settingInSentence
  }
});