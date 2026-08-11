// jotla-child.jsx: Child mode (screens 9-10). Softer, warmer, bigger, fewer words.
// No path back into parent notes. Sells nothing. Leaving needs a held parent action.
//
// On Plus the check-in is dynamic (12 Jul 2026): a More button under Next once
// a face is picked opens one swipeable card per question (chips + a type box,
// every card skippable), an "Anywhere else?" step follows the walk, and the
// child's answers land in the day's record in their own words. On Free the
// flow is exactly the walk, no More button, and never any selling in here.
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

/* ---- "Your day" question sets (Plus), plain data on purpose ----
   A later AI tier will read the day's dysregulation note and generate smarter
   follow-up questions; it slots in by producing more question values in this
   same shape, nothing else. No question is ever required: a card with no
   chips picked and no words typed saves nothing at all. Copy rules: reading
   age about 6 to 8, UK plain English, short words. The {feeling} token is
   replaced with the exact emotion word the child picked for that place.
   Kept here (not jotla-data.jsx) on purpose: the private-edition build swaps
   the data file wholesale, and these questions are app logic, not seed data. */
const FEELING_TOKEN = '{feeling}';
const PEOPLE_CHIPS = ['Teachers', 'Friends', 'Peers'];
const FEELING_CHIPS = ['Happy', 'Ok', 'Sad', 'Worried', 'Angry'];
const WRITE_HERE = 'You can write it here';
const TYPE_A_NAME = 'Type a name';

// The three places of the walk. Ids match the CHILD_SCENES keys so a scene
// maps straight to its question set.
// adultChips: adult-flavoured questions offer the child's own named adults
// (the circle: teachers, TAs, helpers, founder spec 12 Jul 2026) as chips in
// front of the generic words, so "who was with you" is one tap, not typing.
// The friends questions (sat with / played with) never carry it.
const WALK_PLACES = [
  { id: 'classroom', label: 'Classroom', questions: [
    { id: 'who', prompt: 'Who was there?', chips: PEOPLE_CHIPS, placeholder: TYPE_A_NAME, adultChips: true },
    { id: 'did', prompt: 'What did you do or learn?', placeholder: WRITE_HERE },
    { id: 'feeling-why', prompt: 'What made you feel ' + FEELING_TOKEN + '?', placeholder: WRITE_HERE },
    { id: 'else', prompt: 'Anything else?', placeholder: WRITE_HERE },
  ] },
  { id: 'lunch', label: 'Lunch hall', questions: [
    { id: 'ate', prompt: 'What did you eat?', placeholder: WRITE_HERE },
    { id: 'sat-with', prompt: 'Who did you sit with?', chips: ['Friends', 'Peers', 'By myself'], placeholder: TYPE_A_NAME },
    { id: 'feeling-why', prompt: 'What made you feel ' + FEELING_TOKEN + '?', placeholder: WRITE_HERE },
  ] },
  { id: 'playground', label: 'Playground', questions: [
    { id: 'played-with', prompt: 'Who did you play with?', chips: ['Friends', 'Peers', 'By myself'], placeholder: TYPE_A_NAME },
    { id: 'grown-ups', prompt: 'Which grown-ups were around?', chips: ['Teachers', 'Helpers', 'Nobody'], placeholder: TYPE_A_NAME, adultChips: true },
    { id: 'trouble', prompt: 'Any pushing or trouble from other children?', chips: ['No', 'Yes'], placeholder: 'What happened?' },
    { id: 'feeling-why', prompt: 'What made you feel ' + FEELING_TOKEN + '?', placeholder: WRITE_HERE },
  ] },
];

// The short generic set every extra place opens.
const GENERIC_QUESTIONS = [
  { id: 'who', prompt: 'Who was there?', chips: PEOPLE_CHIPS, placeholder: TYPE_A_NAME, adultChips: true },
  { id: 'what', prompt: 'What happened?', placeholder: WRITE_HERE },
  { id: 'felt', prompt: 'How did it feel?', chips: FEELING_CHIPS, placeholder: WRITE_HERE },
];

// The "Anywhere else?" options after the walk.
const EXTRA_PLACES = [
  { id: 'library', label: 'Library', questions: GENERIC_QUESTIONS },
  { id: 'pe', label: 'PE', questions: GENERIC_QUESTIONS },
  { id: 'assembly', label: 'Assembly', questions: GENERIC_QUESTIONS },
  { id: 'trip', label: 'Trip', questions: GENERIC_QUESTIONS },
  { id: 'music', label: 'Music', questions: GENERIC_QUESTIONS },
  { id: 'club', label: 'Club', questions: GENERIC_QUESTIONS },
];

// A place's questions with the child's own feeling word substituted. A
// question that needs the feeling word is dropped when there is none (it
// cannot be asked honestly without the child's own word), which never happens
// on the walk because More only appears after a face is picked. adultNames
// (the child's own circle, duplicates against the generic words removed) lead
// the chips on adult-flavoured questions so a named teacher is one tap.
function questionsFor(place, feelingWord, adultNames) {
  return place.questions
    .filter(q => feelingWord !== undefined || q.prompt.indexOf(FEELING_TOKEN) === -1)
    .map(q => {
      const prompt = q.prompt.split(FEELING_TOKEN).join(feelingWord || '');
      if (!q.adultChips || !adultNames || adultNames.length === 0) return { ...q, prompt };
      const generic = q.chips || [];
      const named = adultNames.filter(n => n.trim().length > 0 && !generic.some(g => g.toLowerCase() === n.trim().toLowerCase()));
      return { ...q, prompt, chips: [...named, ...generic] };
    });
}
function isAnswered(a) { return !!a && (a.chips.length > 0 || a.text.trim().length > 0); }

// Press-and-hold control. Calls onComplete after ~1.1s of holding.
function HoldButton({ label, sublabel, onComplete, tone = 'cream' }) {
  const [p, setP] = useStateC(0);
  const raf = useRefC(null);
  const start = useRefC(0);
  const DURATION = 1100;
  const palette = tone === 'cream'
    ? { bg: '#fff', ink: '#7a5a3a', fill: 'rgba(244,201,93,0.5)' }
    : { bg: 'rgba(255,255,255,0.18)', ink: 'rgba(255,255,255,0.85)', fill: 'rgba(255,255,255,0.3)' };

  const tick = (t) => {
    if (!start.current) start.current = t;
    const frac = Math.min(1, (t - start.current) / DURATION);
    setP(frac);
    if (frac >= 1) { cancel(true); onComplete(); }
    else raf.current = requestAnimationFrame(tick);
  };
  // Pointer capture keeps the hold alive if the finger drifts a little, and
  // user-select none stops a long press turning into a text highlight.
  const begin = (ev) => {
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    start.current = 0; raf.current = requestAnimationFrame(tick);
  };
  const cancel = (done) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null; start.current = 0; if (!done) setP(0);
  };
  return (
    <button
      onPointerDown={begin} onPointerUp={() => cancel(false)} onPointerLeave={() => cancel(false)} onPointerCancel={() => cancel(false)}
      onContextMenu={(ev) => ev.preventDefault()}
      style={{ position: 'relative', width: '100%', minHeight: 60, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: palette.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2, touchAction: 'none', WebkitTapHighlightColor: 'transparent',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        boxShadow: tone === 'cream' ? '0 6px 18px -12px rgba(120,90,50,0.5)' : 'none' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: palette.fill, transition: 'none' }} />
      <span style={{ position: 'relative', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(17px * var(--tscale, 1))', color: palette.ink }}>{label}</span>
      {sublabel && <span style={{ position: 'relative', fontSize: 'calc(12.5px * var(--tscale, 1))', color: palette.ink, opacity: 0.7 }}>{sublabel}</span>}
    </button>
  );
}

const CHILD_BG = '#FFF6EC';
const HEAD_INK = '#5a4326';
const SUB_INK = '#8a6f4e';

function ChildScreen({ nav, profile }) {
  const J = window.JOTLA;
  const childName = (profile && profile.name) || 'Sam';
  // A fixed little journey through the day, staged like a story: meet each
  // place, pick a face, the face comes alive in the middle, walk on. On Plus
  // the More button and the "Anywhere else?" step hang extra words off it.
  const scenes = J.CHILD_SCENES;
  const plus = !!nav.plus;
  const [step, setStep] = useStateC('intro');   // intro | scene | pick | confirm | questions | addAnother | done
  const [idx, setIdx] = useStateC(0);           // which scene of the journey
  const [sel, setSel] = useStateC(null);        // emotion picked on the current scene
  const [picks, setPicks] = useStateC([]);
  // The More answers, keyed "placeId.questionId". Only what the child
  // actually gave is ever saved; a skipped card never earns an entry here.
  const [answers, setAnswers] = useStateC({});
  const [qPlace, setQPlace] = useStateC(null);  // More is open for this place
  const [qIdx, setQIdx] = useStateC(0);         // which question card is showing
  const savedRef = useRefC(false);              // the day saves once, however the walk ends

  const emoLabel = k => { const em = J.CHILD_EMOTIONS.find(x => x.key === k); return em ? em.label : k; };
  const sceneLabel = k => { const s = J.CHILD_SCENES.find(x => x.key === k); return s ? s.label : 'school'; };
  const feelingWordFor = (placeId) => {
    const pick = picks.find(p => p.scene === placeId);
    return pick ? emoLabel(pick.emotion).toLowerCase() : undefined;
  };

  // Save the day once, for every tier, and only when the child actually gave
  // something. Free banks the one-line summary of the face picks; Plus adds
  // the More answers on top, each answered question its own line, so a parent
  // can read the child's own account against the dysregulation note (Day view, Find,
  // Evidence and the export all read the same plain summary).
  const saveWalk = (finalPicks) => {
    const picksNow = finalPicks || picks;
    const answered = [];
    for (const place of [...WALK_PLACES, ...EXTRA_PLACES]) {
      for (const q of questionsFor(place, feelingWordFor(place.id))) {
        const a = answers[place.id + '.' + q.id];
        if (isAnswered(a)) answered.push({ placeLabel: place.label, prompt: q.prompt, answer: a });
      }
    }
    if (savedRef.current || (picksNow.length === 0 && answered.length === 0)) return;
    savedRef.current = true; // one attempt, never a duplicate entry
    const lines = [];
    lines.push(picksNow.length
      ? childName + ' shared their day in child mode: ' + picksNow.map(p => 'felt ' + emoLabel(p.emotion).toLowerCase() + ' in the ' + sceneLabel(p.scene).toLowerCase()).join('; ') + '.'
      : childName + ' shared their day in child mode.');
    for (const item of answered) {
      const bits = [...item.answer.chips];
      const typed = item.answer.text.trim();
      if (typed) bits.push(typed);
      lines.push(item.placeLabel + ': ' + item.prompt + ' ' + bits.join(', '));
    }
    const keys = picksNow.map(p => p.emotion);
    const mood = keys.some(k => ['sad', 'worried', 'angry'].includes(k)) ? 'hard'
      : keys.length > 0 && keys.every(k => k === 'happy') ? 'good' : 'ok';
    const now = new Date();
    nav.addEntry({
      id: 'cm' + Date.now(), date: J.TODAY_ISO,
      time: now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening',
      clock: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      setting: 'School', category: 'Other', mood,
      kind: 'contemporaneous', type: 'quick', childMode: true,
      summary: lines.join('\n'),
    });
  };

  const finishDone = (finalPicks) => { saveWalk(finalPicks); setStep('done'); };
  // The grown-up exits also bank whatever the child already gave, so handing
  // the phone back mid-walk never loses the child's words.
  const exit = () => { saveWalk(); nav.home(); };

  // pick a face -> it takes centre stage; Next walks on to the following place
  const pickFace = (key) => {
    setSel(key);
    setPicks(ps => [...ps, { scene: scenes[idx].key, emotion: key }]);
    setStep('confirm');
  };
  const confirmNext = () => {
    if (idx >= scenes.length - 1) {
      // Plus gets the "Anywhere else?" step after the walk; Free finishes
      // here, exactly as it always has.
      if (plus) setStep('addAnother'); else finishDone();
      return;
    }
    setIdx(idx + 1); setSel(null); setStep('scene');
  };
  const SCENE_LINES = ["Let's start with the classroom.", 'Now on to the lunch hall.', 'And finally, the playground.'];

  const sceneColours = {
    classroom: '#E7F1EC', lunch: '#EAF1FB', playground: '#FBEFE6',
  };

  // ---- More: the "Your day" question cards (Plus only) ----
  // The child's own named adults (the circle, added at onboarding or in the
  // child editor) lead the who-chips on adult-flavoured cards, so "who was
  // with you" is one tap for the child (founder spec, 12 Jul 2026 sixth pass).
  const adultNames = (profile && profile.adults) || [];
  const qPagerRef = useRefC(null);
  const qList = qPlace ? questionsFor(qPlace, feelingWordFor(qPlace.id), adultNames) : [];
  const openQuestions = (place) => { setQPlace(place); setQIdx(0); setStep('questions'); };
  // Done goes back to where More was opened from: a walk place returns to its
  // confirm screen, an extra place returns to the "Anywhere else?" menu.
  const closeQuestions = () => {
    const fromWalk = qPlace ? WALK_PLACES.some(p => p.id === qPlace.id) : false;
    setQPlace(null);
    setStep(fromWalk ? 'confirm' : 'addAnother');
  };
  // Next and Skip both simply move on: answers stay exactly as given, and an
  // empty card saves nothing, so a child is never forced to answer. The
  // buttons are the primary path; swiping the cards is the bonus.
  const qAdvance = () => {
    const next = qIdx + 1;
    if (next >= qList.length) { closeQuestions(); return; }
    setQIdx(next);
    const el = qPagerRef.current;
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };
  const onQPagerScroll = () => {
    const el = qPagerRef.current; if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== qIdx && i >= 0 && i < qList.length) setQIdx(i);
  };
  const toggleChip = (key, chip) => {
    setAnswers(prev => {
      const cur = prev[key] || { chips: [], text: '' };
      const on = cur.chips.includes(chip);
      return { ...prev, [key]: { ...cur, chips: on ? cur.chips.filter(c => c !== chip) : [...cur.chips, chip] } };
    });
  };
  const setAnswerText = (key, text) => {
    setAnswers(prev => ({ ...prev, [key]: { ...(prev[key] || { chips: [], text: '' }), text } }));
  };
  const placeAnswered = (place) => place.questions.some(q => isAnswered(answers[place.id + '.' + q.id]));

  // shared big-question header
  const Q = ({ children }) => (
    <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(32px * var(--tscale, 1))', color: HEAD_INK,
      textAlign: 'center', margin: '0 0 28px', lineHeight: 1.1 }}>{children}</p>
  );
  // the one green pill button the whole journey runs on
  const PillBtn = ({ children, onClick }) => (
    <button onClick={onClick} className="j-press" style={{ minWidth: 220, minHeight: 62, borderRadius: 999, border: 'none',
      cursor: 'pointer', background: '#27AE60', color: '#fff', fontFamily: "'Cal Sans', system-ui", fontWeight: 500,
      fontSize: 'calc(22px * var(--tscale, 1))', boxShadow: '0 14px 28px -12px rgba(39,174,96,0.6)', padding: '0 36px' }}>{children}</button>
  );
  // where we are on the walk (or through a place's questions)
  const Dots = ({ count, at }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
      {Array.from({ length: count }, (x, i) => (
        <span key={i} style={{ width: i === at ? 20 : 8, height: 8, borderRadius: 99, transition: 'all .2s ease',
          background: i < at ? '#27AE60' : i === at ? '#E5A93D' : '#EAD9B8' }} />
      ))}
    </div>
  );
  const showSkip = step === 'scene' || step === 'pick' || step === 'confirm';

  return (
    <div className="j-screen" style={{ background: CHILD_BG, userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* quiet grown-up exit, always available */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px 0' }}>
        <ChildExitPill onComplete={exit} />
      </div>

      <div className="j-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '8px 24px 28px', minHeight: 560 }}>

          {step === 'intro' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              {/* no amber disc behind the face (founder, 11 Aug: "dont let it
                  have those round borders around them. it makes the sticker
                  look smaller. just leave it natural"). The disc also padded
                  the art to 82%, so dropping it is what makes the face bigger,
                  not the size bump. */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                <Face mood="happy" size={150} />
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(36px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 8px' }}>Hi {childName}</p>
              <p style={{ fontSize: 'calc(20px * var(--tscale, 1))', color: SUB_INK, margin: '0 0 34px' }}>How was your day?</p>
              <PillBtn onClick={() => { setIdx(0); setStep('scene'); }}>Start</PillBtn>
            </div>
          )}

          {step === 'scene' && (
            <div className="j-fade" key={'s' + idx} style={{ textAlign: 'center' }}>
              <Dots count={scenes.length} at={idx} />
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <span style={{ width: 132, height: 132, borderRadius: 36, background: sceneColours[scenes[idx].key],
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SceneIllo scene={scenes[idx].key} size={94} />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(34px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 8px' }}>{scenes[idx].label}</p>
              <p style={{ fontSize: 'calc(19px * var(--tscale, 1))', color: SUB_INK, margin: '0 0 32px' }}>{SCENE_LINES[idx]}</p>
              <PillBtn onClick={() => setStep('pick')}>Next</PillBtn>
            </div>
          )}

          {step === 'pick' && (
            <div className="j-fade" key={'p' + idx} style={{ textAlign: 'center' }}>
              <Dots count={scenes.length} at={idx} />
              <Q>How did you feel in the {scenes[idx].label.toLowerCase()}?</Q>
              {/* bare faces, no card borders: just the face and its word */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 26px' }}>
                {J.CHILD_EMOTIONS.map(em => (
                  <button key={em.key} onClick={() => pickFace(em.key)} className="j-press"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, width: '28%', minWidth: 94 }}>
                    <Face mood={em.key} size={88} />
                    <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(19px * var(--tscale, 1))', color: HEAD_INK }}>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'confirm' && sel && (
            <div className="j-fade" key={'c' + idx} style={{ textAlign: 'center' }}>
              <Dots count={scenes.length} at={idx} />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                {sel === 'happy' && <ConfettiBurst />}
                <span className={'j-anim-' + sel} style={{ display: 'inline-flex' }}>
                  <Face mood={sel} size={162} />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(32px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 8px', lineHeight: 1.1 }}>
                {idx >= scenes.length - 1 ? "That's everything!" : idx === scenes.length - 2 ? 'Ready for the last one?' : 'Ready for the next one?'}
              </p>
              <p style={{ fontSize: 'calc(18px * var(--tscale, 1))', color: SUB_INK, margin: '0 0 32px' }}>
                {emoLabel(sel)} in the {scenes[idx].label.toLowerCase()}.
              </p>
              {/* On Plus the last place walks on to "Anywhere else?", so its
                  button says Next; on Free it finishes here as it always has. */}
              <PillBtn onClick={confirmNext}>{idx >= scenes.length - 1 && !plus ? 'Finish' : 'Next'}</PillBtn>
              {/* Plus only: open the context questions for this place. On Free
                  this button does not exist, and nothing here ever sells. */}
              {plus && (
                <div style={{ marginTop: 14 }}>
                  <button className="j-press" aria-label={'More questions about the ' + scenes[idx].label.toLowerCase()}
                    onClick={() => { const place = WALK_PLACES.find(p => p.id === scenes[idx].key); if (place) openQuestions(place); }}
                    style={{ minWidth: 220, minHeight: 54, borderRadius: 999, border: '2px solid #ECD9B6',
                      background: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0 32px',
                      fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(19px * var(--tscale, 1))', color: '#7a5a3a' }}>
                    More
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Plus only: one swipeable card per question. Next and Skip are the
              primary path, the dots show where the child is, and every card
              is skippable. */}
          {step === 'questions' && qPlace && (
            <div className="j-fade" key={'q' + qPlace.id} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(22px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 12px' }}>{qPlace.label}</p>
              <Dots count={qList.length} at={qIdx} />
              <div ref={qPagerRef} onScroll={onQPagerScroll} className="j-pager" {...pagerKeyProps(qPagerRef, qPlace.label + ' questions')}
                style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch',
                  outline: 'none', margin: '0 -4px 24px' }}>
                {qList.map((q, i) => {
                  const key = qPlace.id + '.' + q.id;
                  const a = answers[key] || { chips: [], text: '' };
                  return (
                    <div key={q.id} style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start', padding: '0 4px' }}
                      aria-hidden={i !== qIdx}>
                      <p aria-label={'Question ' + (i + 1) + ' of ' + qList.length + '. ' + q.prompt}
                        style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(28px * var(--tscale, 1))',
                          lineHeight: 1.15, color: HEAD_INK, textAlign: 'center', margin: '0 0 18px' }}>{q.prompt}</p>
                      {q.chips && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                          {q.chips.map(chip => {
                            const on = a.chips.includes(chip);
                            return (
                              <button key={chip} onClick={() => toggleChip(key, chip)} aria-pressed={on} className="j-press"
                                style={{ minHeight: 52, padding: '0 20px', borderRadius: 999, cursor: 'pointer',
                                  border: on ? '2px solid #E5A93D' : '2px solid #ECD9B6',
                                  background: on ? '#FFE6B8' : 'rgba(255,255,255,0.75)',
                                  fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(18px * var(--tscale, 1))',
                                  color: on ? HEAD_INK : SUB_INK }}>{chip}</button>
                            );
                          })}
                        </div>
                      )}
                      <textarea value={a.text} onChange={e => setAnswerText(key, e.target.value)} rows={3}
                        placeholder={q.placeholder || WRITE_HERE} aria-label={'Type your answer. ' + q.prompt}
                        style={{ width: '100%', minHeight: 96, borderRadius: 20, border: '2px solid #ECD9B6', background: '#fff',
                          padding: '14px 16px', fontFamily: "'Outfit', system-ui", fontSize: 'calc(18px * var(--tscale, 1))',
                          color: HEAD_INK, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                    </div>
                  );
                })}
              </div>
              <PillBtn onClick={qAdvance}>{qIdx >= qList.length - 1 ? 'Done' : 'Next'}</PillBtn>
              <div style={{ marginTop: 16 }}>
                <button onClick={qAdvance} aria-label="Skip this question" style={{ background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Outfit', system-ui", fontSize: 'calc(15px * var(--tscale, 1))', color: '#b79a72', fontWeight: 500 }}>Skip</button>
              </div>
            </div>
          )}

          {/* Plus only: after the walk, a few more places the day may have
              held. Each opens the short generic card set; Finish ends the day. */}
          {step === 'addAnother' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(34px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 8px' }}>Anywhere else?</p>
              <p style={{ fontSize: 'calc(19px * var(--tscale, 1))', color: SUB_INK, margin: '0 0 26px' }}>Tap a place to say more, or finish.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 30 }}>
                {EXTRA_PLACES.map(p => {
                  const done = placeAnswered(p);
                  return (
                    <button key={p.id} onClick={() => openQuestions(p)} className="j-press"
                      aria-label={done ? p.label + ', answered. Open again' : 'Add ' + p.label}
                      style={{ width: '44%', minHeight: 56, borderRadius: 18, cursor: 'pointer',
                        border: done ? '2px solid #27AE60' : '2px solid #ECD9B6',
                        background: done ? 'rgba(231,246,238,0.9)' : 'rgba(255,255,255,0.75)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(19px * var(--tscale, 1))', color: HEAD_INK }}>
                      {done && <Icon name="check" size={17} color="#27AE60" stroke={2.6} />}{p.label}
                    </button>
                  );
                })}
              </div>
              <PillBtn onClick={() => finishDone()}>Finish</PillBtn>
            </div>
          )}

          {step === 'done' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', marginBottom: 24 }}>
                {/* gentle colour wash, no confetti, no sound */}
                <span style={{ position: 'absolute', inset: '-30px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(39,174,96,0.16), rgba(39,174,96,0) 70%)' }} />
                <span style={{ position: 'relative' }}><Face mood="happy" size={162} /></span>
                {/* soft tick */}
                <span style={{ position: 'absolute', right: 4, bottom: 4, width: 48, height: 48, borderRadius: '50%',
                  background: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 18px -8px rgba(39,174,96,0.6)', border: '3px solid #FFF6EC' }}>
                  <Icon name="check" size={24} color="#fff" stroke={2.6} />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(34px * var(--tscale, 1))', color: HEAD_INK, margin: '0 0 8px' }}>All done</p>
              <p style={{ fontSize: 'calc(19px * var(--tscale, 1))', color: SUB_INK, margin: '0 0 40px' }}>Thank you, {childName}.</p>
              <HoldButton label="Give the phone back" sublabel="Press and hold" onComplete={exit} />
            </div>
          )}
        </div>

        {/* quiet skip, single tap, never sells. Whatever the child already
            gave is kept before the goodbye. */}
        {showSkip && (
          <div style={{ textAlign: 'center', paddingBottom: 22 }}>
            <button onClick={() => finishDone()} style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', system-ui", fontSize: 'calc(15px * var(--tscale, 1))', color: '#b79a72', fontWeight: 500 }}>Skip</button>
          </div>
        )}
      </div>
    </div>
  );
}

// A brief, gentle confetti burst for a happy pick: happiness is worth marking,
// so the good days become the ones the child wants to collect. Deterministic
// (no Math.random) and it falls once, then it is gone. No sound, ever.
function ConfettiBurst() {
  const COLORS = ['#F4C95D', '#27AE60', '#5B8DEF', '#E8749E', '#9B7BD8'];
  return (
    <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, width: 240, height: 170,
      transform: 'translateX(-50%)', pointerEvents: 'none', overflow: 'visible' }}>
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="j-confetti" style={{
          position: 'absolute', left: ((i * 37) % 96) + '%', top: -8 - ((i * 23) % 26),
          width: 7 + (i % 3) * 3, height: 10 + (i % 4) * 3, borderRadius: 3,
          background: COLORS[i % COLORS.length],
          animationDelay: ((i % 7) * 0.09) + 's',
          animationDuration: (1.1 + (i % 5) * 0.16) + 's',
        }} />
      ))}
    </span>
  );
}

// small held pill at top to hand back to a grown-up
function ChildExitPill({ onComplete }) {
  const [p, setP] = useStateC(0);
  const raf = useRefC(null); const start = useRefC(0);
  const DURATION = 1000;
  const tick = (t) => {
    if (!start.current) start.current = t;
    const frac = Math.min(1, (t - start.current) / DURATION);
    setP(frac);
    if (frac >= 1) { stop(true); onComplete(); } else raf.current = requestAnimationFrame(tick);
  };
  const begin = (ev) => {
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    start.current = 0; raf.current = requestAnimationFrame(tick);
  };
  const stop = (done) => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; start.current = 0; if (!done) setP(0); };
  return (
    <button onPointerDown={begin} onPointerUp={() => stop(false)} onPointerLeave={() => stop(false)} onPointerCancel={() => stop(false)}
      onContextMenu={(ev) => ev.preventDefault()}
      style={{ position: 'relative', width: 'auto', height: 36, borderRadius: 999, border: '1.5px solid #ECD9B6', background: 'rgba(255,255,255,0.6)',
        overflow: 'hidden', cursor: 'pointer', touchAction: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 16px',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: 'rgba(244,201,93,0.4)' }} />
      <span style={{ position: 'relative', fontFamily: "'Outfit', system-ui", fontSize: 'calc(12.5px * var(--tscale, 1))', fontWeight: 500, color: '#a98a5e', whiteSpace: 'nowrap' }}>Hold for grown-ups</span>
    </button>
  );
}

Object.assign(window, { ChildScreen, HoldButton, ChildExitPill });
