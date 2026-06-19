// jotla-parent-a.jsx — Today, Quick log, Handover (Dysregulation).
const { useState: useStateA, useRef: useRefA } = React;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// soft tappable tile used on Today
function ActionTile({ icon, title, sub, tint, ink, onClick }) {
  return (
    <button onClick={onClick} className="j-press" style={{
      flex: 1, textAlign: 'left', border: 'none', cursor: 'pointer', background: tint,
      borderRadius: 16, padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
      minHeight: 56,
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--card)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -8px rgba(20,40,80,0.4)' }}>
        {icon}
      </span>
      <span>
        <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 16, color: ink, lineHeight: 1.1 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  );
}

// ---------------- Today ----------------
function TodayScreen({ nav, entries, today, profile }) {
  const J = window.JOTLA;
  const todays = entries.filter(e => e.date === today);
  const childName = (profile && profile.name) || 'Sam';
  const isEmpty = entries.length === 0;
  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 28 }}>
          <p className="j-eyebrow" style={{ marginBottom: 6 }}>{J.fmtLong(today)}</p>
          <h1 className="j-h1" style={{ marginBottom: 4 }}>{greeting()}.</h1>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 20 }}>{isEmpty
            ? `${childName}'s record is brand new. Add the first line whenever you are ready.`
            : `Here is how ${childName}'s day is looking. Nothing to catch up on.`}</p>

          {/* two tiles first, then the graph below */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <ActionTile
              icon={<Icon name="heart" size={20} color="var(--green)" />}
              title="Your day" sub={'Hand the phone to ' + childName} tint="var(--tint-green)" ink="var(--green-ink)"
              onClick={() => nav.go('child')} />
            <ActionTile
              icon={<Icon name="note" size={20} color="var(--blue)" />}
              title="At the gate?" sub="Capture what happened" tint="var(--tint-blue)" ink="var(--blue)"
              onClick={() => nav.go(nav.plus ? 'handover' : 'gateintro')} />
          </div>

          {isEmpty ? (
            <div className="j-card" style={{ padding: 22, marginBottom: 22, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <span style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--tint-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="leaf" size={30} color="var(--blue)" /></span>
              </div>
              <p className="j-h3" style={{ marginBottom: 6 }}>A fresh, blank record</p>
              <p className="j-sm" style={{ marginBottom: 16 }}>The picture builds itself one ordinary day at a time. New to Jotla?</p>
              <button className="j-btn j-btn-ghost" onClick={() => nav.go('tour')}><Icon name="hand" size={18} color="var(--blue)" /> Take the quick tour</button>
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <MiniMonthStrip entries={entries} onOpen={() => nav.setTab('month')} />
            </div>
          )}

          <SectionLabel>{childName}'s day so far</SectionLabel>
          {todays.length === 0 ? (
            <div className="j-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Face mood="good" size={56} /></div>
              <p className="j-h3" style={{ marginBottom: 6 }}>Nothing logged yet today</p>
              <p className="j-sm">A single line is plenty.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {todays.map(e => <EntryCard key={e.id} entry={e} onClick={() => nav.go('entry', { id: e.id })} />)}
            </div>
          )}

          <button className="j-btn j-btn-primary j-btn-lg" style={{ marginTop: 16 }} onClick={() => nav.go('quicklog')}>
            <Icon name="plus" size={22} color="#fff" stroke={2.2} /> Add to today
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- shared form atoms ----------------
function ChipGroup({ options, value, onChange, multi = false, green = false }) {
  const isOn = (o) => multi ? value.includes(o) : value === o;
  const toggle = (o) => {
    if (multi) onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o]);
    else onChange(o);
  };
  return (
    <div className="j-chiprow">
      {options.map(o => (
        <button key={o} className={'j-chip' + (isOn(o) ? (green ? ' j-chip-on-green' : ' j-chip-on') : '')} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

function MoodFacePicker({ value, onChange }) {
  const J = window.JOTLA;
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
      {J.MOODS.map(m => {
        const on = value === m.key;
        return (
          <button key={m.key} onClick={() => onChange(m.key)} className="j-press" style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 7, padding: '4px 0',
          }}>
            <span style={{ borderRadius: '50%', padding: 4,
              boxShadow: on ? `0 0 0 3px ${window.MOOD_COLOURS[m.key]}` : '0 0 0 2px transparent',
              transition: 'box-shadow .15s ease' }}>
              <Face mood={m.key} size={48} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: on ? 'var(--ink)' : 'var(--faint)' }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 16, color: 'var(--ink)', margin: '0 0 10px' }}>{children}</p>;
}

// Take or attach photo, with a result tile
function PhotoPicker() {
  const [photo, setPhoto] = useStateA(null); // null | 'taken' | 'attached'
  if (photo) {
    return (
      <div style={{ borderRadius: 14, background: 'var(--photo-bg)', minHeight: 96, padding: 14,
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={22} color="var(--blue)" />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Photo attached (sample)</span>
          <span style={{ display: 'block', fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>{photo === 'taken' ? 'Taken just now' : 'Chosen from your photos'}</span>
        </span>
        <button onClick={() => setPhoto(null)} aria-label="Remove photo" className="j-press" style={{ width: 36, height: 36, borderRadius: 10,
          border: 'none', background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={18} color="var(--muted)" />
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={() => setPhoto('taken')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="camera" size={24} color="var(--blue)" />
        <span style={{ fontSize: 14.5, fontWeight: 500 }}>Take photo</span>
      </button>
      <button onClick={() => setPhoto('attached')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="download" size={24} color="var(--blue)" />
        <span style={{ fontSize: 14.5, fontWeight: 500 }}>Attach image</span>
      </button>
    </div>
  );
}

// Attach media (image/video from library) or Capture (take photo / record video). Prototype mock.
function MediaPicker() {
  const [mode, setMode] = useStateA('idle'); // idle | capture | attach
  const [media, setMedia] = useStateA(null);  // null | { source, kind }

  if (media) {
    const isVideo = media.kind === 'video';
    const sourceLabel = media.source === 'capture'
      ? (isVideo ? 'Recorded just now · saved to your phone' : 'Taken just now · saved to your phone')
      : (isVideo ? 'Video chosen from your library' : 'Image chosen from your library');
    return (
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ position: 'relative', minHeight: 150, background: 'var(--photo-bg)',
          backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 11px, rgba(20,40,80,0.05) 11px 12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isVideo ? (
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px -8px rgba(20,40,80,0.5)', paddingLeft: 4 }}>
              <Icon name="play" size={26} color="var(--blue)" fill={true} />
            </span>
          ) : (
            <Icon name="camera" size={30} color="var(--faint)" />
          )}
          <button onClick={() => { setMedia(null); setMode('idle'); }} aria-label="Remove media" className="j-press"
            style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.92)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={17} color="var(--muted)" />
          </button>
          {isVideo && <span style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 11.5, fontWeight: 600, color: '#fff',
            background: 'rgba(20,40,80,0.6)', padding: '3px 8px', borderRadius: 8 }}>0:14</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', background: 'var(--card)' }}>
          <Icon name={isVideo ? 'video' : 'camera'} size={17} color="var(--blue)" />
          <span style={{ fontSize: 13.5, color: 'var(--faint)' }}>{sourceLabel}</span>
        </div>
      </div>
    );
  }

  const optBtn = (label, icon, onClick, primary) => (
    <button onClick={onClick} className="j-press" style={{ flex: 1, minHeight: 52, borderRadius: 12, cursor: 'pointer',
      border: primary ? 'none' : '1px solid var(--chip-border)', background: primary ? 'var(--tint-blue)' : 'var(--card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--blue)', fontSize: 14.5, fontWeight: 500 }}>
      <Icon name={icon} size={19} color="var(--blue)" /> {label}
    </button>
  );

  if (mode === 'capture' || mode === 'attach') {
    const cap = mode === 'capture';
    return (
      <div>
        <div style={{ display: 'flex', gap: 10 }}>
          {optBtn(cap ? 'Take photo' : 'Choose image', 'camera', () => { setMedia({ source: cap ? 'capture' : 'attach', kind: 'photo' }); }, true)}
          {optBtn(cap ? 'Record video' : 'Choose video', 'video', () => { setMedia({ source: cap ? 'capture' : 'attach', kind: 'video' }); }, true)}
        </div>
        <button onClick={() => setMode('idle')} className="j-press" style={{ marginTop: 10, width: '100%', background: 'none',
          border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: 13.5, fontWeight: 500, padding: 4 }}>Cancel</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={() => setMode('capture')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="camera" size={24} color="var(--blue)" />
        <span style={{ fontSize: 14.5, fontWeight: 500 }}>Capture</span>
        <span style={{ fontSize: 12, color: 'var(--faint)' }}>Photo or video</span>
      </button>
      <button onClick={() => setMode('attach')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="attach" size={24} color="var(--blue)" />
        <span style={{ fontSize: 14.5, fontWeight: 500 }}>Attach media</span>
        <span style={{ fontSize: 12, color: 'var(--faint)' }}>Image or video</span>
      </button>
    </div>
  );
}

function QuickLogScreen({ nav, today }) {
  const J = window.JOTLA;
  const [setting, setSetting] = useStateA('School');
  const [time, setTime] = useStateA('Afternoon');
  const [cat, setCat] = useStateA('Transitions');
  const [text, setText] = useStateA('');
  const [mood, setMood] = useStateA('good');
  const [dayMode, setDayMode] = useStateA('today'); // today | yesterday | custom
  const minus1 = (iso) => { const d = J.parseISO(iso); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const [customDate, setCustomDate] = useStateA(minus1(minus1(today)));
  const logDate = dayMode === 'today' ? today : dayMode === 'yesterday' ? minus1(today) : customDate;

  const nowClock = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const save = () => {
    const entry = {
      id: 'n' + Date.now(), date: logDate, time, clock: nowClock(), setting, category: cat, mood,
      kind: 'contemporaneous', type: 'quick',
      summary: text.trim() || `${cat} at ${setting.toLowerCase()}. ${time} went ${mood === 'good' ? 'well' : mood === 'ok' ? 'up and down' : 'hard'}.`,
    };
    nav.addEntry(entry);
    nav.back();
  };

  return (
    <div className="j-screen">
      <PushHeader title="Quick log" subtitle="Takes under 30 seconds" onClose={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingBottom: 120, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <FieldLabel>Which day?</FieldLabel>
            <div className="j-chiprow">
              <button className={'j-chip' + (dayMode === 'today' ? ' j-chip-on' : '')} onClick={() => setDayMode('today')}>Today</button>
              <button className={'j-chip' + (dayMode === 'yesterday' ? ' j-chip-on' : '')} onClick={() => setDayMode('yesterday')}>Yesterday</button>
              <button className={'j-chip' + (dayMode === 'custom' ? ' j-chip-on' : '')} onClick={() => setDayMode('custom')}>Another day</button>
            </div>
            {dayMode === 'custom' && (
              <input type="date" className="j-input" min="2026-01-01" max={today} value={customDate}
                onChange={e => setCustomDate(e.target.value)} style={{ marginTop: 12, fontSize: 15, colorScheme: 'light dark', padding: '11px 12px' }} />
            )}
            <p className="j-sm" style={{ marginTop: 8, color: 'var(--faint)' }}>Saving to <span className="j-strong" style={{ color: 'var(--muted)' }}>{J.fmtLong(logDate)}</span></p>
          </div>
          <div><FieldLabel>Where?</FieldLabel><ChipGroup options={J.SETTINGS} value={setting} onChange={setSetting} /></div>
          <div><FieldLabel>When?</FieldLabel><ChipGroup options={J.TIMES} value={time} onChange={setTime} /></div>
          <div><FieldLabel>What kind of moment?</FieldLabel><ChipGroup options={J.CATEGORIES} value={cat} onChange={setCat} /></div>
          <div>
            <FieldLabel>What happened?</FieldLabel>
            <textarea className="j-input" value={text} onChange={e => setText(e.target.value)} rows={3}
              placeholder="A line is plenty. You can always add more later." />
          </div>
          <div><FieldLabel>Add a photo or video</FieldLabel><MediaPicker /></div>
          <div><FieldLabel>How did it feel?</FieldLabel><MoodFacePicker value={mood} onChange={setMood} /></div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <button className="j-btn j-btn-primary j-btn-lg" onClick={save}>
          <Icon name="check" size={22} color="#fff" /> Save
        </button>
      </div>
    </div>
  );
}

// ---------------- Gate note (guided capture) ----------------
// Child-centred, supportive questions. Not a witness statement.
const GATE_QUESTIONS = (name) => [
  'What happened?',
  'Where and when was this?',
  `How did ${name} seem?`,
  'What seemed to lead up to it?',
  'What helped, or what happened next?',
];

function Stepper({ value, onChange, unit = 'mins' }) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);
  const btn = (label, fn) => (
    <button onClick={fn} className="j-press" style={{ width: 52, height: 52, borderRadius: 14, border: '1.5px solid var(--chip-border)',
      background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {btn(<span style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>-</span>, dec)}
      <div style={{ minWidth: 96, textAlign: 'center' }}>
        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 26, color: 'var(--ink)' }}>{value}</span>
        <span style={{ fontSize: 15, color: 'var(--faint)', marginLeft: 6 }}>{unit}</span>
      </div>
      {btn(<span style={{ fontSize: 24, fontWeight: 400, lineHeight: 1 }}>+</span>, inc)}
    </div>
  );
}

function PhaseField({ label, hint, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 15, color: 'var(--blue)' }}>{hint}</span>
        <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{label}</span>
      </div>
      <textarea className="j-input" style={{ fontSize: 15.5 }} value={value} onChange={e => onChange(e.target.value)} rows={2}
        placeholder="Type a few words, or tap chips below." />
    </div>
  );
}

function HandoverScreen({ nav, today, profile }) {
  const J = window.JOTLA;
  const school = (profile && profile.school) || 'Oakfield Primary';
  const childName = (profile && profile.name) || 'Sam';
  const [behaviours, setBehaviours] = useStateA([]);
  const [before, setBefore] = useStateA('');
  const [during, setDuring] = useStateA('');
  const [after, setAfter] = useStateA('');
  const [duration, setDuration] = useStateA(10);
  const [helped, setHelped] = useStateA('');
  const [nudge, setNudge] = useStateA(false);
  const [draft, setDraft] = useStateA(
    `Hi,\n\nThank you for letting me know about ${childName} this afternoon. When you have a moment, would you mind sending me a quick email with what was discussed? It really helps to have the same picture at home and school.\n\nThank you so much.`
  );

  const save = () => {
    const entry = {
      id: 'h' + Date.now(), date: today, time: 'Afternoon', clock: '15:30', setting: 'School', category: 'Transitions',
      mood: 'hard', kind: 'contemporaneous', type: 'handover',
      summary: during.trim() ? during.trim() : 'Hard moment captured at the gate.',
      handover: { behaviours, before, during, after, duration: duration + ' mins', helped },
    };
    nav.addEntry(entry);
    setNudge(true);
  };
  const finish = () => { setNudge(false); nav.back(); };

  return (
    <div className="j-screen" style={{ background: 'var(--bg)' }}>
      <PushHeader title="Gate note" subtitle="One calm screen. Minimal typing." onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingBottom: 150, paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* auto-attached context */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="j-pillbadge" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}><Icon name="clock" size={14} color="var(--muted)" /> Afternoon, 3:20pm</span>
            <span className="j-pillbadge" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}><Icon name="today" size={14} color="var(--muted)" /> {school}</span>
          </div>

          {/* read-aloud question list */}
          <div className="j-card" style={{ padding: 16, background: 'var(--tint-blue)', border: 'none' }}>
            <p className="j-eyebrow" style={{ marginBottom: 4 }}>Ask the teacher</p>
            <p className="j-sm" style={{ marginBottom: 12, color: 'var(--blue)' }}>Five gentle questions. Read them out, tap the answers below.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GATE_QUESTIONS(childName).map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--card)', color: 'var(--blue)',
                    fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 15.5, color: 'var(--ink)', fontWeight: 400, lineHeight: 1.4 }}>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* behaviours */}
          <div>
            <FieldLabel>What did you see? Tap what fits.</FieldLabel>
            <div className="j-chiprow">
              {J.BEHAVIOURS.map(b => (
                <button key={b} className={'j-chip' + (behaviours.includes(b) ? ' j-chip-on' : '')}
                  onClick={() => setBehaviours(v => v.includes(b) ? v.filter(x => x !== b) : [...v, b])}>{b}</button>
              ))}
              <button className="j-chip" style={{ borderStyle: 'dashed' }}><Icon name="plus" size={15} color="var(--faint)" /> Add your own</button>
            </div>
          </div>

          {/* before / during / after */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PhaseField label="Before" hint="What led up to it" value={before} onChange={setBefore} />
            <PhaseField label="During" hint="What actually happened" value={during} onChange={setDuring} />
            <PhaseField label="After" hint="How it ended" value={after} onChange={setAfter} />
          </div>

          {/* duration */}
          <div>
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 15, color: 'var(--blue)', margin: '0 0 10px' }}>How long did it last?</p>
            <Stepper value={duration} onChange={setDuration} />
          </div>

          {/* what helped */}
          <div>
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 15, color: 'var(--blue)', margin: '0 0 10px' }}>What helped them settle?</p>
            <textarea className="j-input" style={{ fontSize: 15.5 }} value={helped} onChange={e => setHelped(e.target.value)} rows={2}
              placeholder="The thing that worked, however small." />
          </div>

          {/* photo at the gate */}
          <div>
            <FieldLabel>Add a photo or video</FieldLabel>
            <MediaPicker />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--fade-grad)', display: 'flex', gap: 12 }}>
        <button className="j-btn j-btn-ghost" style={{ flex: '0 0 38%' }} onClick={() => nav.back()}>Finish later</button>
        <button className="j-btn j-btn-primary" style={{ flex: 1 }} onClick={save}><Icon name="check" size={20} color="#fff" /> Save note</button>
      </div>

      {/* optional, skippable nudge after saving. Never auto-sends. */}
      {nudge && (
        <div className="j-sheet-scrim" onClick={finish}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--tint-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={26} color="var(--green)" />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>Saved to {childName}'s record</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              Want to drop the teacher a quick line? It helps to have the same picture at home and school.
            </p>
            <textarea className="j-input" value={draft} onChange={e => setDraft(e.target.value)} rows={6}
              style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 10 }} />
            <p className="j-meta" style={{ marginBottom: 16 }}>Nothing is sent for you. This just opens your own email with the words ready, so you can change them or not send at all.</p>
            <button className="j-btn j-btn-primary" onClick={finish}><Icon name="arrowRight" size={20} color="#fff" /> Open in email</button>
            <button className="j-btn j-btn-ghost" style={{ marginTop: 10 }} onClick={finish}>Not now</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- "At the gate?" explainer (shown before capture when there is no Plus) ----------------
function GateIntroScreen({ nav, profile }) {
  const childName = (profile && profile.name) || 'Sam';
  const reasons = [
    ['In the moment', `You know what to ask, so you do not walk away with just "a hard afternoon" and nothing you can use.`],
    ['Over time', 'Because it records what came before and what helped, the patterns become easy to find.'],
    ['When it counts', 'It reads as a calm, factual note rather than a vent. The kind of note made on the day that helps at an EHCP assessment, an annual review, or a tribunal.'],
  ];
  return (
    <div className="j-screen">
      <PushHeader title="At the gate?" onClose={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 150 }}>
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: 'var(--tint-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="note" size={26} color="var(--blue)" /></span>
          </div>
          <h1 className="j-h1" style={{ marginBottom: 10 }}>A gate note, not just a log</h1>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 14 }}>
            A quick log captures that something happened, and how it felt. A line is plenty. A gate note captures what actually happened, while you are still standing there.
          </p>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 22 }}>
            It gives you the five questions to ask the teacher, takes the answers as plain notes, and puts them in order: what led up to it, what happened, and what helped. The time and place add themselves.
          </p>

          <SectionLabel>Why it is worth it</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 8 }}>
            {reasons.map(([h, b]) => (
              <div key={h} className="j-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--tint-green)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Icon name="check" size={17} color="var(--green)" /></span>
                <div>
                  <p className="j-h3" style={{ marginBottom: 4 }}>{h}</p>
                  <p className="j-sm">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--fade-grad)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('unlock')}>
          <Icon name="sparkle" size={20} color="#fff" /> See what Plus adds
        </button>
        <button className="j-btn j-btn-ghost" onClick={() => nav.go('quicklog')}>Just log it quickly instead</button>
      </div>
    </div>
  );
}

Object.assign(window, { TodayScreen, QuickLogScreen, HandoverScreen, GateIntroScreen, ChipGroup, FieldLabel, PhotoPicker, MediaPicker, greeting });
