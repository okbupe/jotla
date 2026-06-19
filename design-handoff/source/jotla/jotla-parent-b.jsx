// jotla-parent-b.jsx — Find, Evidence (records + document vault), Add document, Doc detail, Unlock, Settings.
const { useState: useStateB, useRef: useRefB, useEffect: useEffectB } = React;

const THEME_TO_CAT = { 'Lunch hall': 'Lunch hall', 'Transitions': 'Transitions', 'Eating': 'Eating', 'Play': 'Play', 'Mornings': 'Mornings', 'Sleep': '__none__' };

// ---------------- Find ----------------
function FindScreen({ nav, entries }) {
  const J = window.JOTLA;
  const [q, setQ] = useStateB('');
  const [themes, setThemes] = useStateB(['Lunch hall', 'Transitions']);
  const [moods, setMoods] = useStateB([]);
  const [setting, setSetting] = useStateB('Any');
  const [range, setRange] = useStateB({ preset: 'Any time', from: '', to: '' });

  const toggle = (setter) => (val) => setter(v => v.includes(val) ? v.filter(x => x !== val) : [...v, val]);

  const bounds = window.rangeBounds(range.preset, range.from, range.to);
  const matched = entries.filter(e => {
    const cats = themes.map(t => THEME_TO_CAT[t]);
    const themeOk = themes.length === 0 || cats.includes(e.category);
    const moodOk = moods.length === 0 || moods.includes(e.mood);
    const setOk = setting === 'Any' || e.setting === setting;
    const dateOk = window.inDateRange(e.date, bounds);
    const text = (e.summary + ' ' + e.category).toLowerCase();
    const qOk = !q.trim() || text.includes(q.trim().toLowerCase());
    return themeOk && moodOk && setOk && dateOk && qOk;
  }).sort((a, b) => a.date < b.date ? 1 : -1);

  const queryBits = [...themes];
  if (setting !== 'Any') queryBits.push(setting);
  const rangeLabel = range.preset === 'Custom'
    ? ((range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today'))
    : (range.preset === 'Any time' ? 'all dates' : range.preset.toLowerCase());
  queryBits.push(rangeLabel);

  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 100 }}>
          <TabTitle title="Find" sub="Search across everything you have noted." />

          {/* search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card-2)', border: '1.5px solid var(--chip-border)',
            borderRadius: 14, padding: '0 14px', height: 52, marginBottom: 16 }}>
            <Icon name="search" size={20} color="var(--faint)" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your notes"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Outfit', system-ui", fontSize: 16, color: 'var(--ink)', background: 'transparent' }} />
          </div>

          {/* theme chips */}
          <SectionLabel>Themes</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 14 }}>
            {J.FIND_THEMES.map(t => (
              <button key={t} className={'j-chip' + (themes.includes(t) ? ' j-chip-on' : '')} onClick={() => toggle(setThemes)(t)}>{t}</button>
            ))}
          </div>

          {/* mood filter */}
          <SectionLabel>Mood</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 14 }}>
            {J.FIND_MOODS.map(m => {
              const on = moods.includes(m.key);
              return (
                <button key={m.key} className={'j-chip' + (on ? ' j-chip-on' : '')} onClick={() => toggle(setMoods)(m.key)}>
                  <MoodDot mood={m.key} size={11} /> {m.label}
                </button>
              );
            })}
          </div>

          <SectionLabel>Where</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 18 }}>
            {['Any', 'School', 'Home', 'Club'].map(s => (
              <button key={s} className={'j-chip' + (setting === s ? ' j-chip-on' : '')} onClick={() => setSetting(s)}>{s}</button>
            ))}
          </div>

          <SectionLabel>When</SectionLabel>
          <div style={{ marginBottom: 18 }}>
            <DateRangeControl presets={['Any time', 'This week', 'Last 2 weeks', 'Custom']} value={range} onChange={setRange} />
          </div>

          {/* standout query line + results */}
          <div className="j-card" style={{ padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--tint-blue)', border: 'none' }}>
            <Icon name="filter" size={18} color="var(--blue)" />
            <p className="j-body" style={{ fontSize: 15, color: 'var(--blue)', fontWeight: 500 }}>{queryBits.join(', ')}</p>
          </div>
          <p className="j-meta" style={{ marginBottom: 10 }}>{matched.length} {matched.length === 1 ? 'note' : 'notes'} found</p>

          {matched.length === 0 ? (
            <div className="j-card" style={{ padding: 22, textAlign: 'center' }}>
              <p className="j-sm">Nothing matches those filters yet. Try removing one.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {matched.map(e => <EntryCard key={e.id} entry={e} showDate onClick={() => nav.go('entry', { id: e.id })} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- Evidence: records pack + document vault ----------------
function evTime(i) {
  const mins = ['3:24pm', '9:12am', '1:05pm', '8:50am', '3:31pm', '12:40pm', '2:15pm'];
  return mins[i % mins.length];
}

// A document log card (file layout)
function DocCard({ doc, onClick }) {
  const J = window.JOTLA;
  return (
    <div className="j-card j-press" onClick={onClick} style={{ padding: 14, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="doc" size={22} color="var(--blue)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="j-tag j-tag-blue">{doc.type}</span>
          <span className="j-meta" style={{ whiteSpace: 'nowrap' }}>{J.fmtShort(doc.received)} 2026</span>
        </div>
        <p className="j-strong" style={{ fontSize: 16, lineHeight: 1.25, marginBottom: 3 }}>{doc.title}</p>
        <p className="j-sm" style={{ fontSize: 13.5 }}>From {doc.from}</p>
        {doc.action && (
          <span className="j-pillbadge" style={{ marginTop: 8, background: 'var(--tint-amber)', color: 'var(--amber)' }}>
            <Icon name="bell" size={13} color="var(--amber)" /> {doc.action}
          </span>
        )}
      </div>
      <Icon name="chevronRight" size={18} color="var(--faint)" style={{ marginTop: 4 }} />
    </div>
  );
}

function EvidenceScreen({ nav, entries, docs, profile }) {
  const J = window.JOTLA;
  const [view, setView] = useStateB('records'); // records | documents
  const [range, setRange] = useStateB({ preset: 'Last 3 weeks', from: '', to: '' });
  const [themes, setThemes] = useStateB(['Transitions', 'Lunch hall']);
  const [done, setDone] = useStateB(false);
  const childLabel = profile ? `${profile.name}, ${profile.school}` : 'Sam, Oakfield Primary';

  const bounds = window.rangeBounds(range.preset, range.from, range.to);
  const rangeLabel = range.preset === 'Custom'
    ? ((range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today'))
    : range.preset;
  const inPack = entries
    .filter(e => (themes.length === 0 || themes.includes(e.category)) && window.inDateRange(e.date, bounds))
    .sort((a, b) => a.date < b.date ? -1 : 1);
  const toggleTheme = (t) => setThemes(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t]);

  const Seg = ({ id, label }) => (
    <button onClick={() => setView(id)} style={{ flex: 1, minHeight: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: "'Outfit', system-ui", fontSize: 15, fontWeight: 500,
      background: view === id ? 'var(--card)' : 'transparent', color: view === id ? 'var(--blue)' : 'var(--muted)',
      boxShadow: view === id ? '0 4px 12px -8px rgba(20,40,80,0.4)' : 'none' }}>{label}</button>
  );

  return (
    <div className="j-screen">
      <PushHeader title="Documents and evidence" subtitle="A dated record of what you saw, when you saw it." onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: view === 'records' ? 120 : 120 }}>

          {/* segmented switch */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--tag-grey-bg)', marginBottom: 20 }}>
            <Seg id="records" label="Day records" />
            <Seg id="documents" label="Documents" />
          </div>

          {view === 'records' && (
            <>
              <SectionLabel>Date range</SectionLabel>
              <div style={{ marginBottom: 14 }}>
                <DateRangeControl presets={['Last 3 weeks', 'This month', 'All time', 'Custom']} value={range} onChange={setRange} />
              </div>
              <SectionLabel>Include themes</SectionLabel>
              <div className="j-chiprow" style={{ marginBottom: 18 }}>
                {J.CATEGORIES.map(t => (
                  <button key={t} className={'j-chip' + (themes.includes(t) ? ' j-chip-on' : '')} onClick={() => toggleTheme(t)}>{t}</button>
                ))}
              </div>

              <SectionLabel>Preview</SectionLabel>
              <div style={{ borderRadius: 14, background: 'var(--card)', border: '1px solid var(--line)',
                boxShadow: '0 18px 40px -24px rgba(20,40,80,0.45)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)', margin: '0 0 8px' }}>Day record</p>
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 20, color: 'var(--ink)', margin: 0 }}>{childLabel}</p>
                  <p className="j-meta" style={{ marginTop: 4 }}>{rangeLabel} · {inPack.length} dated entries · Prepared 12 June 2026</p>
                </div>
                <div style={{ padding: '8px 20px 16px' }}>
                  {inPack.slice(0, 6).map((e, i) => (
                    <div key={e.id} style={{ padding: '12px 0', borderBottom: i < Math.min(inPack.length, 6) - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue)', whiteSpace: 'nowrap' }}>{J.fmtShort(e.date)} 2026, {evTime(i)}</span>
                        <span style={{ flex: 1 }} />
                        <span className="j-pillbadge" style={{ fontSize: 10.5, padding: '2px 8px',
                          background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
                          color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)' }}>
                          {e.kind === 'contemporaneous' ? 'Same day' : 'Added later'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13.5, color: 'var(--body)', margin: 0, lineHeight: 1.4 }}>{e.summary}</p>
                    </div>
                  ))}
                  <p style={{ fontSize: 11.5, color: 'var(--faint)', lineHeight: 1.5, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--line)' }}>
                    Each entry shows when it was written. "Same day" means it was logged on the day it happened. "Added later" means it was written up afterwards. Any edits keep the original date and time.
                  </p>
                </div>
              </div>
            </>
          )}

          {view === 'documents' && (
            <>
              <div className="j-card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center',
                background: 'var(--tint-green)', border: 'none' }}>
                <Icon name="shield" size={20} color="var(--green-ink)" style={{ flexShrink: 0 }} />
                <p className="j-body" style={{ fontSize: 14.5, color: 'var(--green-ink)' }}>Keep every letter, report and plan in one place, so nothing important gets lost.</p>
              </div>

              <SectionLabel right={<span className="j-meta">{docs.length} saved</span>}>Your documents</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docs.length === 0
                  ? <div className="j-card" style={{ padding: 22, textAlign: 'center' }}><p className="j-sm">No documents yet. Add the first letter or report and never lose it again.</p></div>
                  : docs.map(d => <DocCard key={d.id} doc={d} onClick={() => nav.go('doc', { id: d.id })} />)}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        {view === 'records'
          ? <button className="j-btn j-btn-primary j-btn-lg" onClick={() => setDone(true)}><Icon name="doc" size={20} color="#fff" /> Create PDF</button>
          : <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('adddoc')}><Icon name="plus" size={22} color="#fff" /> Add document</button>}
      </div>

      {done && (
        <div className="j-sheet-scrim" onClick={() => setDone(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={28} color="var(--green)" />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>Your PDF is ready</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Saved to your phone. It is yours to keep, print, or share whenever you choose.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => setDone(false)}><Icon name="download" size={20} color="#fff" /> Open PDF</button>
            <button className="j-btn j-btn-ghost" style={{ marginTop: 10 }} onClick={() => setDone(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Add document (onboarding questions) ----------------
function AddDocScreen({ nav }) {
  const J = window.JOTLA;
  const [source, setSource] = useStateB(null); // 'taken' | 'attached'
  const [title, setTitle] = useStateB('');
  const [type, setType] = useStateB('Letter');
  const [from, setFrom] = useStateB('School');
  const [received, setReceived] = useStateB('');
  const [about, setAbout] = useStateB('');
  const [action, setAction] = useStateB('');

  const save = () => {
    nav.addDoc({
      id: 'doc' + Date.now(), title: title.trim() || 'Untitled document', type, from,
      received: received.trim() || '2026-06-12', about: about.trim(), action: action.trim(), mood: 'good',
    });
    nav.back();
  };

  return (
    <div className="j-screen">
      <PushHeader title="Add a document" subtitle="A few questions so it is easy to find later." onClose={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* the file */}
          <div>
            <FieldLabel>The file</FieldLabel>
            {source ? (
              <div style={{ borderRadius: 14, background: 'var(--photo-bg)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={22} color="var(--blue)" /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Document added (sample)</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>{source === 'taken' ? 'Photographed just now' : 'Chosen from your files'}</span>
                </span>
                <button onClick={() => setSource(null)} aria-label="Remove" className="j-press" style={{ width: 36, height: 36, borderRadius: 10,
                  border: 'none', background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={18} color="var(--muted)" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setSource('taken')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
                  border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
                  <Icon name="camera" size={24} color="var(--blue)" /><span style={{ fontSize: 14.5, fontWeight: 500 }}>Take photo</span>
                </button>
                <button onClick={() => setSource('attached')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
                  border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
                  <Icon name="download" size={24} color="var(--blue)" /><span style={{ fontSize: 14.5, fontWeight: 500 }}>Attach file</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <FieldLabel>What is it?</FieldLabel>
            <input className="j-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a name, e.g. EHC plan draft" />
            <div className="j-chiprow" style={{ marginTop: 12 }}>
              {J.DOC_TYPES.map(t => <button key={t} className={'j-chip' + (type === t ? ' j-chip-on' : '')} onClick={() => setType(t)}>{t}</button>)}
            </div>
          </div>

          <div>
            <FieldLabel>Who is it from?</FieldLabel>
            <div className="j-chiprow">
              {J.DOC_SOURCES.map(s => <button key={s} className={'j-chip' + (from === s ? ' j-chip-on' : '')} onClick={() => setFrom(s)}>{s}</button>)}
            </div>
          </div>

          <div>
            <FieldLabel>When did you receive it?</FieldLabel>
            <input className="j-input" value={received} onChange={e => setReceived(e.target.value)} placeholder="e.g. 12 June 2026" />
          </div>

          <div>
            <FieldLabel>What is it about?</FieldLabel>
            <textarea className="j-input" value={about} onChange={e => setAbout(e.target.value)} rows={3} placeholder="A line so future-you remembers what is inside." />
          </div>

          <div>
            <FieldLabel>Does it need a reply or action?</FieldLabel>
            <input className="j-input" value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Reply by 30 June. Leave blank if not." />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <button className="j-btn j-btn-primary j-btn-lg" onClick={save}><Icon name="check" size={22} color="#fff" /> Save document</button>
      </div>
    </div>
  );
}

// ---------------- Document detail ----------------
function DocScreen({ nav, docs, id }) {
  const J = window.JOTLA;
  const d = docs.find(x => x.id === id);
  if (!d) return <div className="j-screen"><PushHeader title="Document" onBack={() => nav.back()} /></div>;
  const Row = ({ label, value }) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="j-sm" style={{ flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  ) : null;
  return (
    <div className="j-screen">
      <PushHeader title="Document" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--tint-blue)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={26} color="var(--blue)" /></span>
            <div>
              <p className="j-h3" style={{ fontSize: 19 }}>{d.title}</p>
              <p className="j-meta" style={{ marginTop: 2 }}>{d.type} · from {d.from}</p>
            </div>
          </div>

          {/* preview placeholder */}
          <div style={{ borderRadius: 14, background: 'var(--photo-bg)', minHeight: 150, display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="doc" size={22} color="var(--faint)" />
            <span style={{ fontSize: 15, color: 'var(--faint)', fontWeight: 500 }}>Document scan (sample)</span>
          </div>

          {d.action && (
            <div className="j-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--tint-amber)', border: 'none' }}>
              <Icon name="bell" size={20} color="var(--amber)" style={{ flexShrink: 0 }} />
              <p className="j-body" style={{ fontSize: 15, color: 'var(--ink)' }}><span className="j-strong">Action:</span> {d.action}</p>
            </div>
          )}

          <div className="j-card j-card-pad">
            <Row label="What it is" value={d.type} />
            <Row label="From" value={d.from} />
            <Row label="Received" value={J.fmtLong(d.received) + ' 2026'} />
            {d.about && (
              <div style={{ paddingTop: 12 }}>
                <span className="j-sm">About</span>
                <p className="j-body" style={{ fontSize: 15.5, marginTop: 4 }}>{d.about}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Jotla Plus (the three-layer money model) ----------------

// Free is a calm, flat darker blue. Plus has its own purple identity. The coming-soon
// tier now wears the premium navy + gold look (and the sparkle) that Plus used to have.
const FREE_BLUE = '#1A56A8';
const PLUS_GRAD = 'linear-gradient(135deg, #3C2A72 0%, #6E54D6 100%)';
const PLUS_ACCENT = '#CDBBF7';
const PLUS_ACCENT_DEEP = '#6E54D6';
const LIVING_GRAD = 'linear-gradient(135deg, #14294A 0%, #1E5099 100%)';
const LIVING_GOLD = '#E6B85C';
const LIVING_GOLD_DEEP = '#C9912F';

// A simple check list used on each tier page.
function CheckList({ items, color, tint, dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {items.map(it => (
        <div key={it} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: tint, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Icon name="check" size={13} color={color} />
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, lineHeight: 1.4, color: dark ? 'rgba(255,255,255,0.92)' : 'var(--body)' }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

// A detailed Plus feature: a formal bottom-line sentence, then a plain "what it looks like" line.
function PlusFeature({ icon, title, formal, plain }) {
  return (
    <div className="j-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tint-blue)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <p className="j-h3">{title}</p>
      </div>
      <p className="j-body" style={{ fontSize: 15.5, marginBottom: 10 }}>{formal}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--tint-blue)', borderRadius: 12, padding: '10px 12px' }}>
        <Icon name="arrowRight" size={16} color="var(--blue)" style={{ marginTop: 2, flexShrink: 0 }} />
        <p className="j-sm" style={{ color: 'var(--blue)' }}>{plain}</p>
      </div>
    </div>
  );
}

const FREE_ITEMS = ['Daily logging and the quick log', 'The child walkthrough', 'Your basic timeline',
  'Plain keyword search of your own notes', 'Raw data export', 'Appeal-deadline safety reminders'];
const PLUS_ITEMS = ['Patterns and the Month view', 'Deep filtering', 'Dysregulation Mode',
  'PDF evidence pack', 'Promised vs delivered provision log'];
const LIVING_ITEMS = ['EHCP and SEND deadline tracker', 'What to do about a gap', 'Rights kept current',
  'Current letter templates', 'On-device AI help', 'Fresh scene and symbol packs', 'A document vault',
  'Voice capture', 'Multiple children'];

const PAGE_STYLE = { flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'start',
  overflowY: 'auto', overflowX: 'hidden' };

// ---- Page 1: Free ----
function FreePage() {
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        <span className="j-pillbadge" style={{ background: 'var(--tint-blue)', color: 'var(--blue)' }}>
          <Icon name="check" size={13} color="var(--blue)" /> Free, forever
        </span>
        <h1 className="j-h1" style={{ margin: '12px 0 8px' }}>Everything you need to keep a record</h1>
        <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 18 }}>
          No cost. No account. It never expires.
        </p>
        <div className="j-card" style={{ padding: 18, marginBottom: 16 }}>
          <CheckList items={FREE_ITEMS} color="var(--blue)" tint="var(--tint-blue)" />
        </div>
        <div style={{ background: 'var(--tint-blue)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="shield" size={22} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="j-body" style={{ fontSize: 15, color: 'var(--blue)' }}>
            <span style={{ fontWeight: 500 }}>Your record is yours.</span> Logging and export stay free forever, and anything you have saved stays yours even if you cancel.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Limited-time offer (set SALE.on = true to re-run the £29 promotion) ----
// Promotion setup preserved below — flip `on` back to true to relaunch it.
const SALE = { on: false, price: '£29', was: '£39', save: '£10', days: 3 };

// Counts down to a deadline kept in localStorage, so the timer survives a refresh.
function useSaleCountdown() {
  const [left, setLeft] = useStateB(null);
  useEffectB(() => {
    if (!SALE.on) return;
    const KEY = 'jotla_sale_deadline';
    let dl = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (!dl || dl < Date.now()) {
      dl = Date.now() + SALE.days * 86400000;
      localStorage.setItem(KEY, String(dl));
    }
    const tick = () => {
      const ms = Math.max(0, dl - Date.now());
      setLeft({ d: Math.floor(ms / 86400000), h: Math.floor((ms % 86400000) / 3600000),
        m: Math.floor((ms % 3600000) / 60000), s: Math.floor((ms % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

function SaleCountdown({ left }) {
  const pad = (n) => String(n).padStart(2, '0');
  const units = [['Days', left && left.d], ['Hrs', left && left.h], ['Min', left && left.m], ['Sec', left && left.s]];
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
      {units.map(([lbl, val]) => (
        <div key={lbl} style={{ flex: 1, borderRadius: 12, background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(230,184,92,0.45)', padding: '9px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 26, lineHeight: 1, color: LIVING_GOLD }}>
            {left ? pad(val) : '--'}
          </div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 5 }}>{lbl}</div>
        </div>
      ))}
    </div>
  );
}

// ---- Page 2: Jotla Plus (premium) ----
function PlusPage() {
  const left = useSaleCountdown();
  const sale = SALE.on;
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        {/* premium hero */}
        <div style={{ borderRadius: 20, padding: '22px 20px', background: PLUS_GRAD, color: '#fff',
          marginBottom: 18, boxShadow: '0 18px 38px -18px rgba(60,42,114,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
              background: 'rgba(205,187,247,0.18)', border: `1px solid ${PLUS_ACCENT}`, color: PLUS_ACCENT,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
              <Icon name="star" size={13} color={PLUS_ACCENT} /> JOTLA PLUS
            </span>
            {sale && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
                background: LIVING_GOLD, color: '#3A2A0C', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>
                <Icon name="clock" size={13} color="#3A2A0C" /> 3 DAYS ONLY
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 24, lineHeight: 1.14, margin: '14px 0 0' }}>
            The tools to help you spot patterns and make your case
          </p>
          {sale ? (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 40, color: LIVING_GOLD }}>{SALE.price}</span>
                <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', textDecoration: 'line-through' }}>{SALE.was}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)' }}>one-time</span>
                <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 700, color: '#3A2A0C', background: LIVING_GOLD,
                  padding: '4px 10px', borderRadius: 999 }}>Save {SALE.save}</span>
              </div>
              <SaleCountdown left={left} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="clock" size={13} color="rgba(255,255,255,0.72)" /> When the timer runs out the price goes back to {SALE.was}.
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16 }}>
                <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 40, color: PLUS_ACCENT }}>£39</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)' }}>one-time</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>Yours to keep. No subscription. No timers.</p>
            </React.Fragment>
          )}
        </div>

        {/* everything in free, included */}
        <div className="j-card" style={{ padding: 14, marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--tint-blue)', border: 'none' }}>
          <Icon name="check" size={18} color="var(--blue)" style={{ flexShrink: 0 }} />
          <p className="j-body" style={{ fontSize: 14.5, color: 'var(--blue)' }}>Everything in Free is included, always.</p>
        </div>

        <SectionLabel>What Plus adds</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PlusFeature icon={<Icon name="calendar" size={22} color="var(--blue)" />}
            title="Patterns and Month View"
            formal="See the shape of your child's months. Patterns and the Month view turn a year of single days into a clear picture of good days and hard days, so trends you could never spot across separate notes become obvious."
            plain="A calendar of green and amber days. Tap any day to read what happened behind it." />
          <PlusFeature icon={<Icon name="filter" size={22} color="var(--blue)" />}
            title="Deep Filtering"
            formal="Find the exact entries that prove your point. Combine theme, behaviour, setting and dates in one search, so you can pull together every relevant moment in seconds instead of reading back through months."
            plain="Pick 'lunch hall' plus 'running off' plus 'this term' and get just those days, in order." />
          <PlusFeature icon={<Icon name="note" size={22} color="var(--blue)" />}
            title="Dysregulation Mode"
            formal="Capture a hard moment as fact, while you are still standing there. It gives you the five questions to ask, takes the answers as plain notes, and puts them in order: what led up to it, what happened, and what helped. You walk away with a usable record, not just 'a hard afternoon'."
            plain="Teacher mentions a tough afternoon. You tap 'At the gate?', read the questions, tap the answers. Done in under two minutes." />
          <PlusFeature icon={<Icon name="doc" size={22} color="var(--blue)" />}
            title="PDF Evidence Pack"
            formal="Hand over a clean, dated record when it counts. The evidence pack lays out your chosen entries as a clear, dated document, each with the day it was logged and whether it was written the same day or added later. It is built around the formats tribunals and professionals already use."
            plain="Choose your dates and themes, and get a tidy PDF you can email or print for an assessment, review or tribunal." />
        </div>
      </div>
    </div>
  );
}

// ---- Page 3: Living Companion (coming soon) ----
function LivingPage() {
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        <div style={{ borderRadius: 20, padding: '22px 20px', background: LIVING_GRAD, color: '#fff',
          marginBottom: 18, boxShadow: '0 18px 38px -18px rgba(20,40,80,0.7)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
            background: 'rgba(230,184,92,0.16)', border: `1px solid ${LIVING_GOLD}`, color: LIVING_GOLD,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
            <Icon name="sparkle" size={13} color={LIVING_GOLD} /> Coming soon
          </span>
          <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 26, lineHeight: 1.12, color: '#fff', margin: '14px 0 6px' }}>
            Living Companion
          </p>
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.82)', margin: 0 }}>A monthly membership, coming with the membership.</p>
        </div>

        <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 18 }}>
          The things that keep working for you, current and maintained over time. The deadline tracker, the route guidance, the templates and the content all stay up to date, so you are never working from old information.
        </p>

        <div className="j-card" style={{ padding: 18, marginBottom: 16, borderColor: `${LIVING_GOLD}55` }}>
          <CheckList items={LIVING_ITEMS} color={LIVING_GOLD_DEEP} tint={`${LIVING_GOLD}26`} />
        </div>

        <div style={{ background: `${LIVING_GOLD}1F`, borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="leaf" size={22} color={LIVING_GOLD_DEEP} style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="j-body" style={{ fontSize: 15, color: 'var(--body)' }}>
            We will let you know when it arrives. Your free tools and anything you have bought stay exactly as they are.
          </p>
        </div>
      </div>
    </div>
  );
}

function UnlockScreen({ nav }) {
  const owned = nav.plus;
  const [bought, setBought] = useStateB(false);
  const [confirmPlus, setConfirmPlus] = useStateB(false);
  const [confirmFree, setConfirmFree] = useStateB(false);
  const [droppedFree, setDroppedFree] = useStateB(false);
  const [idx, setIdx] = useStateB(0);
  const pagerRef = useRefB(null);

  const goTo = (i) => {
    const el = pagerRef.current; if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setIdx(i);
  };
  const onScroll = () => {
    const el = pagerRef.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  const TABS = [
    { label: 'Free', onBg: FREE_BLUE, dotOn: FREE_BLUE },
    { label: 'Plus', onBg: PLUS_GRAD, dotOn: PLUS_ACCENT_DEEP },
    { label: 'Coming soon', onBg: LIVING_GRAD, dotOn: LIVING_GOLD_DEEP },
  ];

  return (
    <div className="j-screen">
      <PushHeader title="Jotla Plus" subtitle="Swipe to compare the three tiers." onClose={() => nav.back()} />

      {/* tier tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
        {TABS.map((t, i) => {
          const on = idx === i;
          return (
            <button key={t.label} onClick={() => goTo(i)} className="j-press" style={{ flex: 1, minHeight: 40, borderRadius: 999,
              border: 'none', cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 14,
              background: on ? t.onBg : 'var(--tag-grey-bg)', color: on ? '#fff' : 'var(--muted)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {i === 2 && <Icon name="sparkle" size={14} color={on ? LIVING_GOLD : 'var(--faint)'} />}{t.label}
            </button>
          );
        })}
      </div>

      {/* horizontal swipe pager */}
      <div ref={pagerRef} onScroll={onScroll} className="j-pager" style={{ flex: 1, minHeight: 0, display: 'flex',
        overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        <FreePage />
        <PlusPage />
        <LivingPage />
      </div>

      {/* dots + contextual CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px calc(14px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {TABS.map((t, i) => (
            <span key={i} style={{ width: idx === i ? 18 : 7, height: 7, borderRadius: 99, transition: 'all .2s ease',
              background: idx === i ? t.dotOn : 'var(--chip-border)' }} />
          ))}
        </div>
        {idx === 0 && (owned
          ? <button className="j-btn j-btn-lg" style={{ background: 'var(--card)', color: FREE_BLUE, border: `1.5px solid ${FREE_BLUE}` }} onClick={() => setConfirmFree(true)}>
              <Icon name="arrowLeft" size={20} color={FREE_BLUE} /> Switch back to Free
            </button>
          : <button className="j-btn j-btn-lg" style={{ background: FREE_BLUE, color: '#fff', boxShadow: '0 10px 22px -10px rgba(26,86,168,0.6)' }} onClick={() => goTo(1)}>
              See Jotla Plus <Icon name="arrowRight" size={20} color="#fff" />
            </button>
        )}
        {idx === 1 && (owned
          ? <button className="j-btn j-btn-lg" style={{ background: 'rgba(110,84,214,0.12)', color: PLUS_ACCENT_DEEP, border: `1.5px solid ${PLUS_ACCENT_DEEP}` }} onClick={() => nav.back()}>
              <Icon name="check" size={20} color={PLUS_ACCENT_DEEP} /> You have Jotla Plus
            </button>
          : <button className="j-btn j-btn-lg" style={{ background: PLUS_GRAD, color: '#fff', boxShadow: '0 14px 28px -10px rgba(60,42,114,0.6)' }} onClick={() => setConfirmPlus(true)}>
              <Icon name="star" size={18} color={PLUS_ACCENT} /> Get Jotla Plus, {SALE.on ? SALE.price : '£39'}
              {SALE.on && <span style={{ fontSize: 14, opacity: 0.6, textDecoration: 'line-through', marginLeft: 6 }}>{SALE.was}</span>}
            </button>)}
        {idx === 2 && (
          <button className="j-btn j-btn-lg" disabled style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)', cursor: 'default' }}>
            <Icon name="clock" size={18} color="var(--muted)" /> Coming with the membership
          </button>
        )}
      </div>

      {/* confirm: switch up to Plus */}
      {confirmPlus && (
        <div className="j-sheet-scrim" onClick={() => setConfirmPlus(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: PLUS_GRAD,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="star" size={26} color={PLUS_ACCENT} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>You are about to switch to Jotla Plus</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              This turns on Patterns, the Month view, Deep Filtering, Dysregulation Mode and the PDF Evidence Pack. Everything you have already saved stays exactly as it is.
            </p>
            <button className="j-btn j-btn-lg" style={{ background: PLUS_GRAD, color: '#fff', marginBottom: 10 }}
              onClick={() => { nav.buyPlus(); setConfirmPlus(false); setBought(true); }}>
              <Icon name="check" size={20} color="#fff" /> Confirm
            </button>
            <button className="j-btn j-btn-ghost" onClick={() => setConfirmPlus(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* confirm: switch back down to Free */}
      {confirmFree && (
        <div className="j-sheet-scrim" onClick={() => setConfirmFree(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrowLeft" size={26} color={FREE_BLUE} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>Switch back to Free?</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Are you sure? The Plus tools will be put away and the app goes back to the Free experience. Your record, and everything in it, stays yours and untouched.
            </p>
            <button className="j-btn j-btn-lg" style={{ background: FREE_BLUE, color: '#fff', marginBottom: 10 }}
              onClick={() => { nav.dropPlus(); setConfirmFree(false); setDroppedFree(true); goTo(0); }}>
              <Icon name="check" size={20} color="#fff" /> Yes, switch to Free
            </button>
            <button className="j-btn j-btn-ghost" onClick={() => setConfirmFree(false)}>Keep Jotla Plus</button>
          </div>
        </div>
      )}

      {/* gentle confirmation after going back to Free */}
      {droppedFree && (
        <div className="j-sheet-scrim" onClick={() => setDroppedFree(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--tint-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={26} color={FREE_BLUE} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>You are on Free</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              The app is back to the Free experience. You can switch to Jotla Plus again any time from here.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => setDroppedFree(false)}>Done</button>
          </div>
        </div>
      )}

      {bought && (
        <div className="j-sheet-scrim" onClick={() => { setBought(false); nav.back(); }}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: PLUS_GRAD,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="star" size={26} color={PLUS_ACCENT} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>You have Jotla Plus</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Thank you. Patterns, Deep Filtering, Dysregulation Mode and the PDF Evidence Pack are switched on. Your record stays yours, always.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => { setBought(false); nav.back(); }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Settings ----------------
function SettingsRow({ icon, title, sub, onClick, right, last }) {
  return (
    <button onClick={onClick} className={onClick ? 'j-press' : ''} style={{ width: '100%', textAlign: 'left', border: 'none',
      background: 'none', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
        {sub && <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>{sub}</span>}
      </span>
      {right || (onClick && <Icon name="chevronRight" size={18} color="var(--faint)" />)}
    </button>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} aria-label="Toggle" style={{ width: 52, height: 31, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--chip-border)', position: 'relative', transition: 'background .2s ease', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 24 : 3, width: 25, height: 25, borderRadius: '50%', background: '#fff',
        transition: 'left .2s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.25)' }} />
    </button>
  );
}

function SettingsScreen({ nav, profile }) {
  const J = window.JOTLA;
  const childName = (profile && profile.name) || 'Sam';
  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 100 }}>
          <TabTitle title="Settings" />

          {/* active profile */}
          <button className="j-card j-press" onClick={() => nav.editChild()} style={{ width: '100%', padding: 14, marginBottom: 20, display: 'flex',
            alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--line)' }}>
            <ChildAvatar profile={profile} size={48} />
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 18, color: 'var(--ink)' }}>{childName}</span>
              <span style={{ display: 'block', fontSize: 13.5, color: 'var(--faint)', marginTop: 1 }}>Edit name, school, colour and avatar</span>
            </span>
            <Icon name="chevronRight" size={18} color="var(--faint)" />
          </button>

          <SectionLabel>Jotla Plus</SectionLabel>
          <button className="j-press" onClick={() => nav.go('unlock')} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
            background: LIVING_GRAD, borderRadius: 18, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
            color: '#fff', boxShadow: '0 14px 30px -14px rgba(20,40,80,0.7)' }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(230,184,92,0.18)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={22} color={LIVING_GOLD} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 17, color: '#fff' }}>Patterns, filters and PDF pack</span>
              <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>
                {nav.plus ? 'Active. Yours to keep.' : 'See what Plus adds. Pay once.'}</span>
            </span>
            {nav.plus
              ? <span className="j-pillbadge" style={{ background: 'rgba(230,184,92,0.22)', color: LIVING_GOLD }}>Active</span>
              : <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.8)" />}
          </button>

          <SectionLabel>Backup and export</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <SettingsRow icon={<Icon name="shield" size={20} color="var(--blue)" />} title="Automatic backup"
              sub="Your backup goes to your own Google account, so your record survives a lost or broken phone. We never see it." onClick={() => {}} />
            <SettingsRow icon={<Icon name="download" size={20} color="var(--blue)" />} title="Export my data"
              sub="A plain copy of everything. Always free." onClick={() => {}}
              right={<span className="j-pillbadge" style={{ background: 'var(--tint-green)', color: 'var(--green-ink)' }}>Free</span>} />
            <SettingsRow icon={<Icon name="lock" size={20} color="var(--blue)" />} title="Encrypted export"
              sub="Your own locked copy, only you hold the key." onClick={() => {}} last />
          </div>

          <SectionLabel>Privacy</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <SettingsRow icon={<Icon name="lock" size={20} color="var(--blue)" />} title="Lock the app"
              sub="A fingerprint, face, or PIN on this device. Nothing leaves the phone." onClick={() => {}} />
            <SettingsRow icon={<Icon name="note" size={20} color="var(--blue)" />} title="How your data is kept"
              sub="The whole privacy promise, in plain words." onClick={() => {}} last />
          </div>

          {/* privacy reassurance: no account, local lock, plain trust copy */}
          <div style={{ background: 'var(--blue)', borderRadius: 18, padding: 20, marginBottom: 20, color: '#fff' }}>
            <Icon name="shield" size={26} color="#fff" style={{ marginBottom: 10 }} />
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 19, margin: '0 0 6px' }}>No account. Nothing leaves the phone.</p>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Jotla works without a login. Everything about your child stays on this device, behind your own lock. There is no cloud we can read, and we never receive or access your data.</p>
          </div>

          <SectionLabel>About</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <SettingsRow icon={<Icon name="hand" size={20} color="var(--blue)" />} title="Take the tour"
              sub="A one-minute walkthrough of the whole app." onClick={() => nav.go('tour')} />
            <SettingsRow icon={<Icon name="plus" size={20} color="var(--blue)" />} title="Add another child"
              sub="Start a fresh, blank record." onClick={() => nav.go('addchild')} />
            <SettingsRow icon={<Icon name="heart" size={20} color="var(--blue)" />} title="What Jotla is for" onClick={() => {}} />
            <SettingsRow icon={<Icon name="note" size={20} color="var(--blue)" />} title="Privacy, in plain words" onClick={() => {}} />
            <SettingsRow icon={<Icon name="star" size={20} color="var(--blue)" />} title="About and credits" onClick={() => {}} last />
          </div>

          <p className="j-meta" style={{ textAlign: 'center' }}>Jotla by SEN Help · Version 1.0</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FindScreen, EvidenceScreen, AddDocScreen, DocScreen, UnlockScreen, SettingsScreen });
