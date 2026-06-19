// jotla-onboard.jsx — Add a child (blank-record onboarding) + a guided app tour.
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
  const Cropper = window.PhotoCropper;

  const preview = { name: name.trim() || 'New child', glyph, figure, photo };
  const canSave = name.trim().length > 0;

  const create = () => {
    if (!canSave) return;
    nav.addChild({ name: name.trim(), school: school.trim(), year: year.trim(), glyph, figure, photo });
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
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 22, color: 'var(--ink)', margin: 0 }}>{preview.name}</p>
              <p className="j-sm" style={{ marginTop: 2 }}>{[year.trim(), school.trim()].filter(Boolean).join(' · ') || 'Their details, in a moment'}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <label className="j-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 12,
                cursor: 'pointer', background: 'var(--tint-blue)', color: 'var(--blue)', fontSize: 14, fontWeight: 500 }}>
                <Icon name="camera" size={17} color="var(--blue)" /> {photo ? 'Change photo' : 'Upload a photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files && e.target.files[0]; if (f) window.fileToDataURL(f, url => setCropSrc(url)); e.target.value = ''; }} />
              </label>
              {photo && (
                <button className="j-press" onClick={() => setPhoto(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--chip-border)',
                  color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>
                  <Icon name="close" size={16} color="var(--muted)" /> Remove
                </button>
              )}
            </div>
          </div>

          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 22, textAlign: 'center', fontSize: 15.5 }}>
            Each child keeps their own private record on this phone. Nothing is shared, and you can switch between children any time from the avatar at the top.
          </p>

          <FieldLabel>Their name</FieldLabel>
          <input className="j-input" value={name} onChange={e => setName(e.target.value)} placeholder="First name or nickname" style={{ marginBottom: 18 }} autoFocus />

          <FieldLabel>School or setting</FieldLabel>
          <input className="j-input" value={school} onChange={e => setSchool(e.target.value)} placeholder="Optional" style={{ marginBottom: 18 }} />

          <FieldLabel>Year group</FieldLabel>
          <input className="j-input" value={year} onChange={e => setYear(e.target.value)} placeholder="Optional" style={{ marginBottom: 22 }} />

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
    title: 'Welcome to Jotla',
    body: `This is ${name}'s record, and right now it is completely blank. That is exactly how it should start. You will fill it one ordinary day at a time.` },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'today',
    title: 'Today is home',
    body: 'The Today screen is where you land. It shows how the day is going and gives you two calm shortcuts: hand the phone to your child, or capture what happened at the gate.' },
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'plus',
    title: 'A line is plenty',
    body: 'Tap the round plus button any time to log a moment. Where, when, what kind, how it felt. It takes under thirty seconds, and one line is enough.' },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'note',
    title: 'At the gate',
    body: 'On a hard day, Jotla helps you ask the right things while you are still standing there. Five gentle questions, tapped answers, put in order: what led up to it, what happened, what helped.' },
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'heart', face: true,
    title: 'Their day, in their words',
    body: `Tap "Your day" to hand the phone to ${name}. Friendly faces and simple scenes let them show how school felt, with no typing.` },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'calendar',
    title: 'See the shape of it',
    body: 'Over time, Month and Find turn single days into a picture. The hard moments gather, the patterns show, and you can pull the exact entries that prove a point.' },
  { tint: 'var(--tint-blue)',  color: 'var(--blue)',  icon: 'shield',
    title: 'Private by default',
    body: 'No account, and nothing leaves this phone. Documents, letters and reports live in one place, and your record stays yours, always.' },
  { tint: 'var(--tint-green)', color: 'var(--green)', icon: 'check',
    title: 'You are ready',
    body: `That is the whole app. Start whenever you like with a single line about ${name}'s day.` },
];

function TourScreen({ nav, profile }) {
  const name = (profile && profile.name) || 'your child';
  const steps = TOUR_STEPS(name);
  const [i, setI] = useStateO(0);
  const step = steps[i];
  const last = i === steps.length - 1;
  const next = () => last ? nav.home() : setI(i + 1);
  const back = () => i === 0 ? nav.home() : setI(i - 1);

  return (
    <div className="j-screen" style={{ background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 4px' }}>
        <span className="j-eyebrow">Tour · {i + 1} of {steps.length}</span>
        <button onClick={() => nav.home()} className="j-press" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 14.5, fontWeight: 500, padding: 4 }}>Skip</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px' }}>
        <div style={{ width: 134, height: 134, borderRadius: '50%', background: step.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          {step.face ? <Face mood="good" size={92} /> : <Icon name={step.icon} size={58} color={step.color} stroke={1.9} />}
        </div>
        <h1 className="j-h1" style={{ marginBottom: 12, maxWidth: 320 }}>{step.title}</h1>
        <p className="j-body" style={{ color: 'var(--muted)', fontSize: 16.5, lineHeight: 1.5, maxWidth: 332 }}>{step.body}</p>
      </div>

      <div style={{ padding: '12px 20px calc(18px + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {steps.map((_, k) => (
            <span key={k} style={{ width: k === i ? 18 : 7, height: 7, borderRadius: 99, transition: 'all .2s ease', background: k === i ? 'var(--blue)' : 'var(--chip-border)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="j-btn j-btn-ghost" style={{ flex: '0 0 34%' }} onClick={back}>{i === 0 ? 'Close' : 'Back'}</button>
          <button className="j-btn j-btn-primary" style={{ flex: 1 }} onClick={next}>
            {last
              ? <React.Fragment><Icon name="check" size={20} color="#fff" /> Start the record</React.Fragment>
              : <React.Fragment>Next <Icon name="arrowRight" size={20} color="#fff" /></React.Fragment>}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AddChildScreen, TourScreen });
