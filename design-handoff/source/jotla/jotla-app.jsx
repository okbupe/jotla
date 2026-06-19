// jotla-app.jsx — shell: router, persistent header, tab bar, dark mode, profiles, persistence, scaling.
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp, useCallback } = React;

const TAB_DEFS = [
  ['today', 'Today', 'today'],
  ['month', 'Month', 'calendar'],
  ['__log', 'Log', 'plus'],
  ['find', 'Find', 'search'],
  ['settings', 'Settings', 'settings'],
];
const TAB_NAMES = ['today', 'month', 'find', 'settings'];
const NAV_KEY = 'jotla_nav_v2';
const ENTRIES_KEY = 'jotla_entries_v3';
const DOCS_KEY = 'jotla_docs_v1';
const PREF_KEY = 'jotla_prefs_v1';

function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

// ---------- persistent app header ----------
// Tap the avatar to switch child; press and hold to open that child's options.
function AppHeader({ profile, plus, onProfile, onOptions, onEvidence }) {
  const holdRef = useRefApp(null);
  const longRef = useRefApp(false);
  const startHold = () => { longRef.current = false; holdRef.current = setTimeout(() => { longRef.current = true; onOptions(); }, 500); };
  const clearHold = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const handleClick = () => { if (longRef.current) { longRef.current = false; return; } onProfile(); };
  return (
    <div className="j-appheader">
      <Wordmark size={26} color="var(--blue)" subColor="var(--faint)" plus={plus} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="j-iconbtn j-iconbtn-plain" aria-label="Documents" onClick={onEvidence}>
          <Icon name="doc" size={23} color="var(--blue)" />
        </button>
        <button className="j-avatar" aria-label="Switch child, or hold to edit" title="Tap to switch child, hold to edit"
          onClick={handleClick} onPointerDown={startHold} onPointerUp={clearHold} onPointerLeave={clearHold} onPointerCancel={clearHold}
          style={{ background: 'transparent', padding: 0, overflow: 'hidden', touchAction: 'none' }}>
          <ChildAvatar profile={profile} size={44} />
        </button>
      </div>
    </div>
  );
}

// ---------- tab bar with central round Log button ----------
function TabBar({ active, onTab, onLog }) {
  return (
    <div className="j-tabbar">
      {TAB_DEFS.map(([name, label, icon]) => {
        if (name === '__log') {
          return (
            <button key="log" className="j-tab-log" onClick={onLog} aria-label="Quick log">
              <span className="j-logfab"><Icon name="plus" size={28} color="#fff" stroke={2.4} /></span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--blue)' }}>{label}</span>
            </button>
          );
        }
        const on = active === name;
        return (
          <button key={name} className={'j-tab' + (on ? ' j-tab-on' : '')} onClick={() => onTab(name)}>
            <Icon name={icon} size={24} color={on ? 'var(--blue)' : 'var(--faint)'} stroke={on ? 2.2 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- profile switcher sheet ----------
function ProfileSheet({ profiles, activeId, onPick, onAddChild, onClose }) {
  return (
    <div className="j-sheet-scrim" onClick={onClose}>
      <div className="j-sheet" onClick={e => e.stopPropagation()}>
        <div className="j-sheet-grab" />
        <h2 className="j-h2" style={{ marginBottom: 4 }}>Whose day is this?</h2>
        <p className="j-sm" style={{ marginBottom: 18 }}>Switch between the children you keep a record for.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {profiles.map(p => {
            const on = p.id === activeId;
            return (
              <button key={p.id} className="j-press" onClick={() => onPick(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 14,
                padding: 14, borderRadius: 16, border: on ? '1.5px solid var(--blue)' : '1px solid var(--line)',
                background: on ? 'var(--tint-blue)' : 'var(--card)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ flexShrink: 0 }}><ChildAvatar profile={p} size={46} /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 18, color: 'var(--ink)' }}>{p.name}</span>
                  <span style={{ display: 'block', fontSize: 13.5, color: 'var(--faint)', marginTop: 1 }}>{p.year} · {p.school}</span>
                </span>
                {on && <Icon name="check" size={20} color="var(--blue)" />}
              </button>
            );
          })}
          <button className="j-press" onClick={onAddChild} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14,
            borderRadius: 16, border: '1.5px dashed var(--chip-border)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--tint-blue)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={22} color="var(--blue)" /></span>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--blue)' }}>Add a child</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- child options / details sheet ----------
const CHILD_GLYPHS = ['person', 'heart', 'star', 'leaf', 'sparkle', 'shield', 'bell', 'hand', 'today', 'note'];
function ChildOptionsSheet({ profile, entries = [], docs = [], canDelete = true, onChange, onDelete, onClose }) {
  const J = window.JOTLA;
  const [delOpen, setDelOpen] = useStateApp(false);
  const [cropSrc, setCropSrc] = useStateApp(null);
  const Cropper = window.PhotoCropper;
  return (
    <div className="j-sheet-scrim" onClick={onClose}>
      <div className="j-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90%', overflowY: 'auto' }}>
        <div className="j-sheet-grab" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <ChildAvatar profile={profile} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="j-h2" style={{ marginBottom: 2 }}>{profile.name}'s details</h2>
            <p className="j-sm">Update anything that changes over time.</p>
          </div>
        </div>

        <FieldLabel>Photo</FieldLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <ChildAvatar profile={profile} size={60} />
          <div style={{ flex: 1, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label className="j-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderRadius: 12,
              cursor: 'pointer', background: 'var(--tint-blue)', color: 'var(--blue)', fontSize: 14.5, fontWeight: 500 }}>
              <Icon name="camera" size={18} color="var(--blue)" /> {profile.photo ? 'Change photo' : 'Upload a photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files && e.target.files[0]; if (f) window.fileToDataURL(f, url => setCropSrc(url)); e.target.value = ''; }} />
            </label>
            {profile.photo && (
              <button className="j-press" onClick={() => onChange({ photo: null })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--chip-border)',
                color: 'var(--muted)', fontSize: 14.5, fontWeight: 500 }}>
                <Icon name="close" size={17} color="var(--muted)" /> Remove
              </button>
            )}
          </div>
        </div>
        <p className="j-sm" style={{ marginBottom: 20 }}>{profile.photo
          ? 'Using a photo. If you remove it, the avatar below is shown instead.'
          : 'Add a real photo for a personal touch, or pick an avatar below.'}</p>

        <FieldLabel>Avatar</FieldLabel>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {CHILD_GLYPHS.map(g => {
            const on = (profile.glyph || 'person') === g;
            return (
              <button key={g} onClick={() => onChange({ glyph: g })} aria-label={'Avatar ' + g} className="j-press"
                style={{ width: 56, height: 56, borderRadius: 16, cursor: 'pointer',
                  border: on ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                  background: on ? 'var(--tint-blue)' : 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChildAvatar profile={{ ...profile, glyph: g, photo: null }} size={40} ring={false} />
              </button>
            );
          })}
        </div>

        <FieldLabel>Colour</FieldLabel>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {J.AVATAR_COLOURS.map(c => {
            const on = profile.figure === c.figure;
            return (
              <button key={c.key} onClick={() => onChange({ figure: c.figure })} aria-label={'Colour ' + c.key} className="j-press"
                style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', background: c.figure,
                  border: '3px solid var(--card)', boxShadow: on ? '0 0 0 2.5px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
            );
          })}
        </div>

        <FieldLabel>Name</FieldLabel>
        <input className="j-input" value={profile.name} onChange={e => onChange({ name: e.target.value })} style={{ marginBottom: 16 }} />

        <FieldLabel>School or setting</FieldLabel>
        <input className="j-input" value={profile.school} onChange={e => onChange({ school: e.target.value })} style={{ marginBottom: 16 }} />

        <FieldLabel>Year group</FieldLabel>
        <input className="j-input" value={profile.year} onChange={e => onChange({ year: e.target.value })} style={{ marginBottom: 22 }} />

        <button className="j-btn j-btn-primary" onClick={onClose}><Icon name="check" size={20} color="#fff" /> Done</button>

        {/* danger zone */}
        <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 13, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: '#C0392B', margin: '0 0 10px' }}>Danger zone</p>
          {canDelete ? (
            <button className="j-press" onClick={() => setDelOpen(true)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
              border: '1.5px solid rgba(231,76,60,0.4)', background: 'rgba(231,76,60,0.06)', borderRadius: 14, padding: '13px 14px',
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(231,76,60,0.12)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={18} color="#E74C3C" /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 15.5, fontWeight: 500, color: '#C0392B' }}>Delete this child</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--faint)', marginTop: 1 }}>Permanently remove {profile.name}'s record</span>
              </span>
              <Icon name="chevronRight" size={18} color="#E74C3C" />
            </button>
          ) : (
            <p className="j-sm" style={{ color: 'var(--faint)' }}>This is your only child record, so it cannot be deleted. Add another child first if you want to remove this one.</p>
          )}
        </div>
      </div>

      {delOpen && <DeleteChildSheet profile={profile} entries={entries} docs={docs}
        onClose={() => setDelOpen(false)} onConfirm={() => { setDelOpen(false); onClose(); onDelete && onDelete(); }} />}
      {cropSrc && <Cropper src={cropSrc} onDone={url => { onChange({ photo: url }); setCropSrc(null); }} onCancel={() => setCropSrc(null)} />}
    </div>
  );
}

// ---------- delete child: guarded, multi-step, with a backup escape hatch ----------
function DeleteChildSheet({ profile, entries, docs, onConfirm, onClose }) {
  const [stage, setStage] = useStateApp('warn'); // warn | confirm
  const [backedUp, setBackedUp] = useStateApp(false);
  const [ack, setAck] = useStateApp(false);
  const [typed, setTyped] = useStateApp('');
  const RED = '#E74C3C', RED_DEEP = '#C0392B', RED_TINT = 'rgba(231,76,60,0.10)';
  const name = profile.name;
  const nEntries = entries.length, nDocs = docs.length;
  const ready = ack && typed.trim().toUpperCase() === 'DELETE';

  const backup = () => {
    try {
      const payload = { app: 'Jotla', exportedAt: new Date().toISOString(), child: profile, entries, documents: docs };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'jotla-' + name.replace(/\s+/g, '-').toLowerCase() + '-backup.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {}
    setBackedUp(true);
  };

  const consequences = [
    [nEntries + (nEntries === 1 ? ' logged moment' : ' logged moments'), 'Every quick log and gate note you have written.'],
    [nDocs + (nDocs === 1 ? ' saved document' : ' saved documents'), 'Letters, reports and plans kept in the vault.'],
    [name + "'s profile", 'Their name, avatar, colour and settings.'],
  ];

  return (
    <div className="j-sheet-scrim" onClick={onClose} style={{ zIndex: 40 }}>
      <div className="j-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '92%', overflowY: 'auto' }}>
        <div className="j-sheet-grab" />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: RED_TINT,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield" size={28} color={RED} />
          </span>
        </div>

        {stage === 'warn' ? (
          <React.Fragment>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>Delete {name}'s record?</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              This permanently erases everything below. It cannot be undone, and because nothing leaves this phone there is no copy we can restore for you.
            </p>

            <div style={{ border: '1px solid rgba(231,76,60,0.3)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              {consequences.map(([h, b], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'flex-start',
                  borderBottom: i < consequences.length - 1 ? '1px solid var(--line)' : 'none', background: i === 0 ? RED_TINT : 'transparent' }}>
                  <Icon name="close" size={18} color={RED} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 15, color: 'var(--ink)', margin: 0 }}>{h}</p>
                    <p className="j-sm" style={{ marginTop: 1 }}>{b}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* backup escape hatch */}
            <div style={{ background: 'var(--tint-blue)', borderRadius: 16, padding: 14, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: backedUp ? 12 : 0 }}>
                <Icon name="download" size={20} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p className="j-body" style={{ fontSize: 14.5, color: 'var(--blue)' }}>
                  <span style={{ fontWeight: 600 }}>Back up first.</span> Save a copy of {name}'s record to your phone before you delete. You can keep it, or reimport it later.
                </p>
              </div>
              {backedUp
                ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green-ink)', fontSize: 14, fontWeight: 500 }}>
                    <Icon name="check" size={18} color="var(--green)" /> Backup saved to your device. You can re-save it.
                    <button onClick={backup} className="j-press" style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: 13.5, fontWeight: 600 }}>Save again</button>
                  </div>
                : <button className="j-btn j-btn-soft" onClick={backup} style={{ marginTop: 12, minHeight: 48 }}>
                    <Icon name="download" size={19} color="var(--blue)" /> {'Back up ' + name + "'s record"}
                  </button>}
            </div>

            <button className="j-btn j-btn-lg" style={{ background: RED, color: '#fff', marginBottom: 10, boxShadow: '0 10px 22px -10px rgba(231,76,60,0.6)' }}
              onClick={() => setStage('confirm')}>
              <Icon name="arrowRight" size={20} color="#fff" /> Continue to delete
            </button>
            <button className="j-btn j-btn-ghost" onClick={onClose}>Keep this record</button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>Last check</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              {backedUp ? 'Your backup is saved. ' : 'You have not made a backup. '}To finish, confirm you understand and type DELETE.
            </p>

            <button className="j-press" onClick={() => setAck(a => !a)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
              border: ack ? '1.5px solid ' + RED : '1.5px solid var(--line)', background: ack ? RED_TINT : 'var(--card)', borderRadius: 14,
              padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, border: ack ? 'none' : '1.5px solid var(--chip-border)',
                background: ack ? RED : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ack && <Icon name="check" size={16} color="#fff" />}
              </span>
              <span style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>I understand this permanently deletes {name}'s record and everything in it.</span>
            </button>

            <input className="j-input" value={typed} onChange={e => setTyped(e.target.value)} placeholder='Type DELETE to confirm'
              autoCapitalize="characters" style={{ marginBottom: 18, textAlign: 'center', letterSpacing: '0.12em', fontWeight: 600 }} />

            <button className="j-btn j-btn-lg" disabled={!ready} onClick={() => ready && onConfirm()}
              style={{ background: RED, color: '#fff', marginBottom: 10, opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'default',
                boxShadow: ready ? '0 10px 22px -10px rgba(231,76,60,0.6)' : 'none' }}>
              <Icon name="close" size={20} color="#fff" /> {'Delete ' + name + "'s record permanently"}
            </button>
            <button className="j-btn j-btn-ghost" onClick={() => setStage('warn')}>Back</button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function App({ appMode }) {
  const J = window.JOTLA;
  const [entries, setEntries] = useStateApp(() => loadJSON(ENTRIES_KEY, J.SEED_ENTRIES));
  const [docs, setDocs] = useStateApp(() => loadJSON(DOCS_KEY, J.SEED_DOCS));
  const prefs0 = loadJSON(PREF_KEY, { dark: false, profileId: 'sam', plus: false, childCfg: {}, customProfiles: [], deletedIds: [] });
  const [dark, setDark] = useStateApp(!!prefs0.dark);
  const [plus, setPlus] = useStateApp(!!prefs0.plus);
  const [childCfg, setChildCfg] = useStateApp(prefs0.childCfg || prefs0.avatarCols || {});
  const [customProfiles, setCustomProfiles] = useStateApp(prefs0.customProfiles || []);
  const [deletedIds, setDeletedIds] = useStateApp(prefs0.deletedIds || []);
  const [profileId, setProfileId] = useStateApp(prefs0.profileId || 'sam');
  const [profileOpen, setProfileOpen] = useStateApp(false);
  const [childOptOpen, setChildOptOpen] = useStateApp(false);

  const initNav = loadJSON(NAV_KEY, { view: { name: 'today' }, history: [], tab: 'today' });
  const [view, setView] = useStateApp(initNav.view || { name: 'today' });
  const [history, setHistory] = useStateApp(initNav.history || []);
  const [tab, setTab] = useStateApp(initNav.tab || 'today');

  useEffectApp(() => { saveJSON(NAV_KEY, { view, history, tab }); }, [view, history, tab]);
  useEffectApp(() => { saveJSON(ENTRIES_KEY, entries); }, [entries]);
  useEffectApp(() => { saveJSON(DOCS_KEY, docs); }, [docs]);
  useEffectApp(() => { saveJSON(PREF_KEY, { dark, profileId, plus, childCfg, customProfiles, deletedIds }); }, [dark, profileId, plus, childCfg, customProfiles, deletedIds]);

  const profiles = [...J.PROFILES, ...customProfiles]
    .filter(p => !deletedIds.includes(p.id))
    .map(p => ({ ...p, ...(childCfg[p.id] || {}) }));
  const profile = profiles.find(p => p.id === profileId) || profiles[0];

  const nav = {
    go: (name, params = {}) => { setHistory(h => [...h, view]); setView({ name, ...params }); },
    back: () => setHistory(h => { if (h.length) { setView(h[h.length - 1]); return h.slice(0, -1); } setView({ name: tab }); return h; }),
    setTab: (name) => { setTab(name); setView({ name }); setHistory([]); },
    home: () => { setTab('today'); setView({ name: 'today' }); setHistory([]); },
    addEntry: (entry) => setEntries(es => [{ ...entry, childId: profileId }, ...es]),
    addDoc: (doc) => setDocs(ds => [{ ...doc, childId: profileId }, ...ds]),
    toggleDark: () => setDark(d => !d),
    dark,
    plus,
    buyPlus: () => setPlus(true),
    dropPlus: () => setPlus(false),
    addChild: (data) => {
      const id = 'c' + Date.now();
      const fig = data.figure || '#3A7BD4';
      const np = { id, name: (data.name || 'New child'), school: data.school || '', year: data.year || '',
        initial: (data.name || 'N').charAt(0).toUpperCase(), tint: fig, faceBg: '#EAF1FB', figure: fig, glyph: data.glyph || 'person', photo: data.photo || null };
      setCustomProfiles(list => [...list, np]);
      setProfileId(id);
      return id;
    },
    setChild: (patch) => setChildCfg(m => ({ ...m, [profileId]: { ...(m[profileId] || {}), ...patch } })),
    editChild: () => setChildOptOpen(true),
    deleteChild: (id) => {
      const remaining = [...J.PROFILES, ...customProfiles].filter(p => p.id !== id && !deletedIds.includes(p.id));
      if (!remaining.length) return; // never delete the last record
      setEntries(es => es.filter(e => e.childId !== id));
      setDocs(ds => ds.filter(d => d.childId !== id));
      setChildCfg(m => { const n = { ...m }; delete n[id]; return n; });
      if (customProfiles.some(p => p.id === id)) setCustomProfiles(list => list.filter(p => p.id !== id));
      else setDeletedIds(s => s.includes(id) ? s : [...s, id]);
      setProfileId(remaining[0].id);
      setTab('today'); setView({ name: 'today' }); setHistory([]);
    },
  };

  // Keep the Android / browser Back gesture inside the app instead of closing it.
  // The router is state-based, so we trap popstate and run an in-app "back" ourselves.
  const backRef = useRefApp(null);
  backRef.current = () => {
    if (childOptOpen) { setChildOptOpen(false); return; }
    if (profileOpen) { setProfileOpen(false); return; }
    if (history.length) { nav.back(); return; }
    if (!TAB_NAMES.includes(view.name)) { nav.home(); return; }
    if (tab !== 'today') { nav.setTab('today'); return; }
    // already at the Today root: stay in the app (use the system home gesture to leave)
  };
  useEffectApp(() => {
    window.history.pushState({ jotla: true }, '');
    const onPop = () => { if (backRef.current) backRef.current(); window.history.pushState({ jotla: true }, ''); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const isTab = TAB_NAMES.includes(view.name);
  const isChild = view.name === 'child';
  const isFullscreen = isChild || view.name === 'addchild' || view.name === 'tour';
  const today = J.TODAY_ISO;

  // scope to active child
  const myEntries = [...entries].filter(e => e.childId === profileId).sort((a, b) => (a.date === b.date ? (a.clock < b.clock ? 1 : -1) : (a.date < b.date ? 1 : -1)));
  const myDocs = docs.filter(d => d.childId === profileId);

  let screen = null;
  switch (view.name) {
    case 'today': screen = <TodayScreen nav={nav} entries={myEntries} today={today} profile={profile} />; break;
    case 'month': screen = <MonthScreen nav={nav} entries={myEntries} profile={profile} />; break;
    case 'find': screen = <FindScreen nav={nav} entries={myEntries} />; break;
    case 'evidence': screen = <EvidenceScreen nav={nav} entries={myEntries} docs={myDocs} profile={profile} />; break;
    case 'adddoc': screen = <AddDocScreen nav={nav} />; break;
    case 'settings': screen = <SettingsScreen nav={nav} profile={profile} />; break;
    case 'quicklog': screen = <QuickLogScreen nav={nav} today={today} />; break;
    case 'gateintro': screen = <GateIntroScreen nav={nav} profile={profile} />; break;
    case 'handover': screen = <HandoverScreen nav={nav} today={today} profile={profile} />; break;
    case 'child': screen = <ChildScreen nav={nav} profile={profile} />; break;
    case 'addchild': screen = <AddChildScreen nav={nav} />; break;
    case 'tour': screen = <TourScreen nav={nav} profile={profile} />; break;
    case 'unlock': screen = <UnlockScreen nav={nav} />; break;
    case 'day': screen = <DayScreen nav={nav} entries={myEntries} date={view.date} />; break;
    case 'entry': screen = <EntryScreen nav={nav} entries={myEntries} id={view.id} />; break;
    case 'doc': screen = <DocScreen nav={nav} docs={myDocs} id={view.id} />; break;
    default: screen = <TodayScreen nav={nav} entries={myEntries} today={today} profile={profile} />;
  }

  return (
    <div className={'jotla-root' + (dark ? ' j-dark' : '') + (appMode ? ' j-app' : '')} style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: appMode ? 'max(env(safe-area-inset-top), 12px)' : 50, background: isChild ? '#FFF6EC' : 'var(--bg)' }}>
      {!isFullscreen && <AppHeader profile={profile} plus={plus} onProfile={() => setProfileOpen(true)} onOptions={() => setChildOptOpen(true)} onEvidence={() => nav.go('evidence')} />}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div key={view.name + (view.id || view.date || '') + profileId} style={{ position: 'absolute', inset: 0 }}>{screen}</div>
      </div>
      {isTab && <TabBar active={tab} onTab={nav.setTab} onLog={() => nav.go('quicklog')} />}
      {profileOpen && <ProfileSheet profiles={profiles} activeId={profileId}
        onPick={(id) => { setProfileId(id); setProfileOpen(false); nav.home(); }}
        onAddChild={() => { setProfileOpen(false); nav.go('addchild'); }} onClose={() => setProfileOpen(false)} />}
      {childOptOpen && <ChildOptionsSheet profile={profile} entries={myEntries} docs={myDocs} canDelete={profiles.length > 1}
        onChange={nav.setChild} onDelete={() => nav.deleteChild(profileId)} onClose={() => setChildOptOpen(false)} />}
    </div>
  );
}

// ---- device + scaling stage ----
// On a real phone (or when launched from the home screen) the app fills the whole
// screen, the device itself is the frame. On a wide desktop we show the iPhone bezel
// so the design can be previewed in context.
function Stage() {
  const [scale, setScale] = useStateApp(1);
  const [mode, setMode] = useStateApp('desktop');
  useEffectApp(() => {
    const fit = () => {
      const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
      const phone = window.innerWidth <= 600;
      const app = standalone || phone;
      document.documentElement.classList.toggle('j-appmode', app);
      setMode(app ? 'app' : 'desktop');
      const margin = 48;
      const s = Math.min((window.innerWidth - margin) / 402, (window.innerHeight - margin) / 874, 1);
      setScale(s < 0.3 ? 0.3 : s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  if (mode === 'app') {
    return (
      <div style={{ position: 'fixed', inset: 0, width: '100%', height: '100dvh', background: '#F7F9FC', overflow: 'hidden' }}>
        <App appMode={true} />
      </div>
    );
  }
  return (
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #eef3fb 0%, #e4e9f2 70%, #dde3ee 100%)', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice>
          <App appMode={false} />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
