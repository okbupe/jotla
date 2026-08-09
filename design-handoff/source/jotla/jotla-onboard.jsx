// jotla-onboard.jsx: Add a child (blank-record onboarding) + a guided app tour.
const { useState: useStateO } = React;

const ONBOARD_GLYPHS = ['person', 'heart', 'star', 'leaf', 'sparkle', 'shield', 'bell', 'hand', 'today', 'note'];

// ---------------- Add a child ----------------
// Creates a brand-new, empty record and switches to it, then hands off to the tour.
function AddChildScreen({ nav }) {
  const J = window.JOTLA;
  const [name, setName] = useStateO('');
  const [school, setSchool] = useStateO('');
  const [year, setYear] = useStateO('');
  const [glyph, setGlyph] = useStateO('person');
  const [figure, setFigure] = useStateO('#3A7BD4');
  const [photo, setPhoto] = useStateO(null);
  const [cropSrc, setCropSrc] = useStateO(null);
  // The adults around the child (teachers, TAs, helpers), gathered here so the
  // record knows the care circle from day one and the child's own question
  // cards can offer these names as one-tap chips (founder spec, 12 Jul 2026).
  const [adults, setAdults] = useStateO([]);
  const [adultDraft, setAdultDraft] = useStateO('');
  const Cropper = window.PhotoCropper;

  const addAdult = () => {
    const n = adultDraft.trim();
    if (!n) return;
    if (!adults.some(a => a.toLowerCase() === n.toLowerCase())) setAdults([...adults, n]);
    setAdultDraft('');
  };
  const removeAdult = (n) => setAdults(adults.filter(a => a !== n));

  const preview = { name: name.trim() || 'New child', glyph, figure, photo };
  const canSave = name.trim().length > 0;

  const create = () => {
    if (!canSave) return;
    // A name still sitting in the box counts: parents tap Create expecting it.
    const pendingAdult = adultDraft.trim();
    const allAdults = pendingAdult && !adults.some(a => a.toLowerCase() === pendingAdult.toLowerCase())
      ? [...adults, pendingAdult]
      : adults;
    nav.addChild({ name: name.trim(), school: school.trim(), year: year.trim(), glyph, figure, photo, adults: allAdults });
    nav.go('tour');
  };

  return (
    <div className="j-screen">
      <PushHeader title="Add a child" subtitle="A fresh, blank record" onClose={() => nav.home()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 150 }}>
          {/* live preview */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <ChildAvatar profile={preview} size={88} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(22px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>{preview.name}</p>
              <p className="j-sm" style={{ marginTop: 2 }}>{[year.trim(), school.trim()].filter(Boolean).join(' · ') || 'Their details, in a moment'}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <label className="j-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 12,
                cursor: 'pointer', background: 'var(--tint-blue)', color: 'var(--blue)', fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500 }}>
                <Icon name="camera" size={17} color="var(--blue)" /> {photo ? 'Change photo' : 'Upload a photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files && e.target.files[0]; if (f) window.fileToDataURL(f, url => setCropSrc(url)); e.target.value = ''; }} />
              </label>
              {photo && (
                <button className="j-press" onClick={() => setPhoto(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--chip-border)',
                  color: 'var(--muted)', fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500 }}>
                  <Icon name="close" size={16} color="var(--muted)" /> Remove
                </button>
              )}
            </div>
          </div>

          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 22, textAlign: 'center', fontSize: 'calc(15.5px * var(--tscale, 1))' }}>
            Each child keeps their own private record on this phone. Nothing is shared, and you can switch between children any time from the avatar at the top.
          </p>

          <FieldLabel>Their name</FieldLabel>
          <input className="j-input" value={name} onChange={e => setName(e.target.value)} placeholder="First name or nickname" style={{ marginBottom: 18 }} autoFocus />

          <FieldLabel>School or setting</FieldLabel>
          <input className="j-input" value={school} onChange={e => setSchool(e.target.value)} placeholder="Optional" style={{ marginBottom: 18 }} />

          <FieldLabel>Year group</FieldLabel>
          <input className="j-input" value={year} onChange={e => setYear(e.target.value)} placeholder="Optional" style={{ marginBottom: 22 }} />

          <FieldLabel>The adults around them</FieldLabel>
          <p className="j-sm" style={{ marginTop: -4, marginBottom: 10 }}>
            Optional. Their teacher, TA or club leader. When {preview.name === 'New child' ? 'your child' : preview.name} is asked who was with them, these names become one-tap answers.
          </p>
          {adults.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {adults.map(a => (
                <button key={a} className="j-press" onClick={() => removeAdult(a)} aria-label={'Remove ' + a}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--chip-border)',
                    background: 'var(--card)', borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
                    fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--ink)' }}>
                  {a} <Icon name="close" size={14} color="var(--faint)" />
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22, alignItems: 'stretch' }}>
            <input className="j-input" value={adultDraft} onChange={e => setAdultDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAdult(); } }}
              placeholder="Mrs Price, Mr Okafor the TA..." aria-label="Add an adult" style={{ flex: 1, minWidth: 0 }} />
            <button className="j-btn j-btn-soft" onClick={addAdult} disabled={!adultDraft.trim()}
              style={{ width: 'auto', flexShrink: 0, padding: '0 22px', ...(adultDraft.trim() ? {} : { opacity: 0.5, cursor: 'default' }) }}>
              Add
            </button>
          </div>

          <FieldLabel>Pick an avatar</FieldLabel>
          <p className="j-sm" style={{ marginTop: -4, marginBottom: 12 }}>{photo ? 'Shown if you remove the photo.' : 'Used unless you upload a photo above.'}</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {ONBOARD_GLYPHS.map(g => {
              const on = glyph === g;
              return (
                <button key={g} onClick={() => setGlyph(g)} className="j-press" aria-label={'Avatar ' + g}
                  style={{ width: 56, height: 56, borderRadius: 16, cursor: 'pointer',
                    border: on ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                    background: on ? 'var(--tint-blue)' : 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChildAvatar profile={{ glyph: g, figure }} size={40} ring={false} />
                </button>
              );
            })}
          </div>

          <FieldLabel>Pick a colour</FieldLabel>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {J.AVATAR_COLOURS.map(c => {
              const on = figure === c.figure;
              return (
                <button key={c.key} onClick={() => setFigure(c.figure)} className="j-press" aria-label={'Colour ' + c.key}
                  style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', background: c.figure,
                    border: '3px solid var(--card)', boxShadow: on ? '0 0 0 2.5px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <button className="j-btn j-btn-primary j-btn-lg" disabled={!canSave} onClick={create}
          style={!canSave ? { opacity: 0.5, cursor: 'default' } : {}}>
          <Icon name="check" size={22} color="#fff" /> {canSave ? `Create ${name.trim()}'s record` : 'Add a name to continue'}
        </button>
      </div>
      {cropSrc && <Cropper src={cropSrc} onDone={url => { setPhoto(url); setCropSrc(null); }} onCancel={() => setCropSrc(null)} />}
    </div>
  );
}

// ---------------- App tour ----------------
// A calm, swipe-through walkthrough. Also reachable from Settings, so a reviewer can
// learn the whole app in a minute.
const TOUR_STEPS = (name) => [
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'heart',
    illo: 'tourWelcome', title: 'Welcome to Jotla',
    body: `This is ${name}'s record, and right now it is completely blank. That is exactly how it should start. You will fill it one ordinary day at a time.` },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'today',
    illo: 'tourToday', title: 'Start on Today',
    body: `This is the screen you open first. It shows how ${name}'s day is going, and the round plus button in the corner is where every kind of note begins.` },
  // Rewritten 16 Jul 2026: the old line ("one moment... under thirty seconds")
  // described the quick log as it was before the dynamic day log shipped, so the
  // tour was contradicting the screen's own subtitle.
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'plus',
    illo: 'tourLog', title: 'A line is plenty',
    body: 'Tap the round plus button and choose Quick Log. Add as many moments as you like, a tap each, then save them all in one go. One line about each is plenty.' },
  // The six questions are listed in the order GATE_QUESTIONS actually asks them.
  // Two places count them in prose (here, and the Dysregulation card's "Six gentle
  // questions"); boot-assert holds both to GATE_QUESTIONS.length so they cannot drift.
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'note',
    illo: 'tourGate', title: 'Dysregulation',
    body: `When a hard moment happens, Jotla asks you six simple questions: what happened, where and when, who was there, how ${name} seemed, what led up to it, and what helped. Most answers are a tap.` },
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'heart', face: true,
    illo: 'tourChild', title: 'Their day,\nin their words',
    body: `Tap the plus and choose Child's Day: ${name} can show how school felt with friendly faces and simple scenes, no typing. Do it together, or hand the phone over.` },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'calendar',
    illo: 'tourPattern', title: 'Spot the pattern',
    body: 'Over time, Month and Find turn single days into a picture, so you can see when the hard days happen and pull out the exact notes you need when someone asks for proof.' },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'shield',
    illo: 'tourPrivate', title: 'Nothing leaves\nyour phone',
    body: 'No account, and nothing leaves this phone. Documents, letters and reports live in one place, and your record stays yours, always.' },
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'check',
    illo: 'tourReady', title: 'You are ready',
    body: `That is the whole app. Start whenever you like with a single line about ${name}'s day.` },
];

function TourScreen({ nav, profile }) {
  const name = (profile && profile.name) || 'your child';
  const steps = TOUR_STEPS(name);
  // Same skeleton as Tips, from StoryDeck: the picture, heading and paragraph land
  // in the same place on both decks, and the closing button below lines up with the
  // Tips say pills (founder, 17 Jul). The tour carries no note of its own; the foot
  // still reserves one so the dots sit where the Tips dots do.
  return (
    <StoryDeck
      label="Tour"
      slides={steps}
      onSkip={() => nav.home()}
      labelFor={(s2, k) => 'Step ' + (k + 1) + ' of ' + steps.length + ': ' + s2.title.replace(/\n/g, ' ')}
      renderSlide={(step, k) => (
        <React.Fragment>
          {/* brand-style scene illustration (build 1.8.0); icon disc kept as the fallback */}
          {step.illo
            ? <span className="j-illo-slot" style={{ marginBottom: 20 }}>
                <StoryIllo scene={step.illo} width={300} dark={nav.dark} />
              </span>
            : <div style={{ width: 134, height: 134, borderRadius: '50%', background: step.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30, flexShrink: 0 }}>
                {step.face ? <Face mood="good" size={92} /> : <Icon name={step.icon} size={58} color={step.color} stroke={1.9} />}
              </div>}
          {/* The copy block carries the reserve; the heading sits at its top on
              every slide and the paragraph rides up under a one-line title. */}
          <div className="j-illo-copy">
            <h1 className="j-h1 j-illo-title" style={{ marginBottom: 12, maxWidth: 320 }}>{step.title}</h1>
            <p className="j-body j-illo-body" style={{ color: 'var(--muted)', fontSize: 'calc(16.5px * var(--tscale, 1))', lineHeight: 1.5, maxWidth: 332 }}>{step.body}</p>
            {k === steps.length - 1 && (
              <div className="j-illo-tail">
                <button className="j-btn j-btn-primary j-btn-inline" onClick={() => nav.home()}>
                  <Icon name="check" size={20} color="#fff" /> Start the record
                </button>
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    />
  );
}

Object.assign(window, { AddChildScreen, TourScreen });
