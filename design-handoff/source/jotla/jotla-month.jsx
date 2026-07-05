// jotla-month.jsx — Month calendar (tab) and Day detail (push).
const { useState: useStateM } = React;

function TabTitle({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h1 className="j-h1" style={{ fontSize: 28 }}>{title}</h1>
        {sub && <p className="j-sm" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function MonthScreen({ nav, entries, view }) {
  const J = window.JOTLA;
  const today = J.parseISO(J.TODAY_ISO);
  // months back from the current month; remembered on the view so Back returns
  // to the month the parent was reading, not the latest month
  const [offset, setOffset] = React.useState((view && view.monthOffset) || 0);
  const move = (delta) => setOffset(o => { const n = o + delta; nav.remember({ monthOffset: n }); return n; });
  // Swipe between months (left = later, right = earlier), like a photo album.
  const touchRef = React.useRef(null);
  const onTouchStart = (ev) => { const t = ev.touches && ev.touches[0]; if (t) touchRef.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (ev) => {
    const s = touchRef.current; touchRef.current = null;
    const t = ev.changedTouches && ev.changedTouches[0];
    if (!s || !t) return;
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) < 56 || Math.abs(dy) > 48) return;
    if (dx < 0) { if (offset !== 0) move(1); } else { if (canBackRef.current) move(-1); }
  };
  const canBackRef = React.useRef(true);
  const shown = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = shown.getFullYear();
  const month = shown.getMonth(); // 0-based
  const isCurrent = offset === 0;
  const todayNum = isCurrent ? today.getDate() : 99; // no today ring or future dimming off the current month
  const earliest = entries.length ? entries.reduce((a, e) => (e.date < a ? e.date : a), entries[0].date) : J.TODAY_ISO;
  const canBack = `${year}-${String(month + 1).padStart(2, '0')}-01` > earliest.slice(0, 8) + '01';
  canBackRef.current = canBack;
  const monthLabel = `${J.MONTH_NAMES[month]} ${year}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
  // build calendar cells for the real current month, with leading blanks for alignment
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEntries = entries.filter(e => e.date === iso);
    cells.push({ d, iso, mood: J.dayMood(dayEntries), count: dayEntries.length, future: d > todayNum, isToday: d === todayNum });
  }
  const dows = J.DOW_MON; // Mon Tue Wed Thu Fri Sat Sun

  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 100 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}><TabTitle title={monthLabel} sub="Tap any day to read it back." /></div>
            <button className="j-chip" style={{ opacity: canBack ? 1 : 0.35, minWidth: 44 }} aria-label="Earlier month"
              onClick={() => canBack && move(-1)}>{'‹'}</button>
            <button className="j-chip" style={{ opacity: isCurrent ? 0.35 : 1, minWidth: 44 }} aria-label="Later month"
              onClick={() => !isCurrent && move(1)}>{'›'}</button>
          </div>

          {/* plain trend: month patterns are a Plus feature */}
          {nav.plus ? (
            <div className="j-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18,
              background: 'var(--tint-amber)', border: 'none' }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="leaf" size={20} color="var(--amber)" />
              </span>
              <p className="j-body" style={{ fontSize: 15.5 }}>{(() => {
                const pre = `${year}-${String(month + 1).padStart(2, '0')}-`;
                const me = entries.filter(e => e.date.startsWith(pre));
                const h = me.filter(e => e.mood === 'hard').length;
                if (!me.length) return (<><span className="j-strong">Nothing logged in {J.MONTH_NAMES[month]}.</span> Use the arrows to move between months.</>);
                return (<><span className="j-strong">{me.length} {me.length === 1 ? 'entry' : 'entries'} this month{h ? `, ${h} on hard days` : ''}.</span> Tap a tinted day to read it back.</>);
              })()}</p>
            </div>
          ) : (
            <PlusLockedCard onClick={() => nav.go('unlock')} style={{ marginBottom: 18 }}
              title="Month patterns" text="Counts, hard-day patterns and what they line up with. Part of Plus." />
          )}

          {/* calendar (swipe left and right to change month) */}
          <div className="j-card" style={{ padding: 14, touchAction: 'pan-y' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              {dows.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: 'var(--faint)' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {cells.map((c, idx) => {
                if (!c) return <div key={'blank-' + idx} />;
                const tint = c.mood ? window.moodTint(c.mood) : 'transparent';
                const ink = c.mood ? window.MOOD_COLOURS[c.mood] : (c.future ? 'var(--line)' : 'var(--faint)');
                const tappable = c.count > 0;
                return (
                  <button key={c.d} onClick={() => tappable && nav.go('day', { date: c.iso })}
                    className={tappable ? 'j-press' : ''}
                    style={{ aspectRatio: '1 / 1', borderRadius: 12, cursor: tappable ? 'pointer' : 'default',
                      border: 'none', boxShadow: c.isToday ? 'inset 0 0 0 2px var(--blue)' : 'none',
                      background: tint, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                      opacity: c.future ? 0.55 : 1 }}>
                    <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: c.isToday ? 600 : 500, fontSize: 15, color: c.isToday ? 'var(--blue)' : ink }}>{c.d}</span>
                    {c.mood && <MoodDot mood={c.mood} size={6} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
            {[['good', 'Good day'], ['ok', 'Up and down'], ['hard', 'Hard day'], ['none', 'No note']].map(([k, l]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--faint)' }}>
                <MoodDot mood={k} size={9} /> {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Day detail ----------------
function DayScreen({ nav, entries, date }) {
  const J = window.JOTLA;
  const list = entries.filter(e => e.date === date);
  const mood = J.dayMood(list);
  return (
    <div className="j-screen">
      <PushHeader title={J.fmtLong(date)} subtitle={list.length + (list.length === 1 ? ' note' : ' notes')} onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mood && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 999, background: window.moodTint(mood) }}>
              <MoodDot mood={mood} size={10} />
              <span style={{ fontSize: 14, fontWeight: 500, color: window.MOOD_COLOURS[mood] }}>
                {mood === 'good' ? 'A good day overall' : mood === 'ok' ? 'Up and down' : 'A hard day'}
              </span>
            </div>
          )}
          {list.map(e => <EntryCard key={e.id} entry={e} onClick={() => nav.go('entry', { id: e.id })} />)}
        </div>
      </div>
    </div>
  );
}

// ---------------- Single entry detail ----------------
// Edit a note honestly: the wording can change, the original date and time
// cannot, and the previous wording stays visible on the record.
function EditEntrySheet({ entry, onSave, onClose }) {
  const J = window.JOTLA;
  const [summary, setSummary] = React.useState(entry.summary);
  const [mood, setMood] = React.useState(entry.mood);
  const [category, setCategory] = React.useState(entry.category);
  const [setting, setSetting] = React.useState(entry.setting);
  const changed = summary.trim() !== entry.summary || mood !== entry.mood || category !== entry.category || setting !== entry.setting;
  return (
    <div className="j-sheet-scrim" onClick={onClose}>
      <div className="j-sheet" onClick={ev => ev.stopPropagation()} style={{ maxHeight: '88%', overflowY: 'auto' }}>
        <div className="j-sheet-grab" />
        <h2 className="j-h2" style={{ marginBottom: 4 }}>Edit this note</h2>
        <p className="j-sm" style={{ marginBottom: 14 }}>The original date and time stay as they are, and the earlier wording is kept on the record. Honest edits only.</p>
        <textarea value={summary} onChange={ev => setSummary(ev.target.value)} rows={4}
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, border: '1.5px solid var(--chip-border)', background: 'var(--card-2)',
            padding: 12, fontFamily: "'Outfit', system-ui", fontSize: 16, color: 'var(--ink)', resize: 'vertical', marginBottom: 14 }} />
        <p className="j-sm" style={{ marginBottom: 6 }}>How the moment felt</p>
        <div className="j-chiprow" style={{ marginBottom: 12 }}>
          {J.MOODS.map(m => (
            <button key={m.key} className={'j-chip' + (mood === m.key ? ' j-chip-on' : '')} onClick={() => setMood(m.key)}>
              <MoodDot mood={m.key} size={11} /> {m.label}
            </button>
          ))}
        </div>
        <p className="j-sm" style={{ marginBottom: 6 }}>Theme</p>
        <div className="j-chiprow" style={{ marginBottom: 12 }}>
          {J.CATEGORIES.map(c => (
            <button key={c} className={'j-chip' + (category === c ? ' j-chip-on' : '')} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <p className="j-sm" style={{ marginBottom: 6 }}>Where</p>
        <div className="j-chiprow" style={{ marginBottom: 16 }}>
          {J.SETTINGS.map(s => (
            <button key={s} className={'j-chip' + (setting === s ? ' j-chip-on' : '')} onClick={() => setSetting(s)}>{s}</button>
          ))}
        </div>
        <button className="j-btn j-btn-primary" disabled={!summary.trim()} style={{ opacity: summary.trim() ? 1 : 0.5 }}
          onClick={() => { if (changed && summary.trim()) onSave({ summary: summary.trim(), mood, category, setting }); onClose(); }}>
          Save the change
        </button>
        <button className="j-btn j-btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function EntryScreen({ nav, entries, id }) {
  const J = window.JOTLA;
  const e = entries.find(x => x.id === id);
  const [editing, setEditing] = React.useState(false);
  if (!e) return <div className="j-screen"><PushHeader title="Note" onBack={() => nav.back()} /></div>;
  const isH = e.type === 'handover';
  return (
    <div className="j-screen">
      <PushHeader title="Note" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Face mood={e.mood} size={44} />
              <div>
                <p className="j-h3">{e.time} at {e.setting.toLowerCase()}</p>
                <p className="j-meta">{J.fmtLong(e.date)} · {e.category}</p>
              </div>
            </div>
            <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="j-pillbadge" style={{ background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
                color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)' }}>
                <Icon name="clock" size={13} color={e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)'} />
                {e.kind === 'contemporaneous' ? 'Same day' : 'Added later'}
              </span>
              {e.editedOn && (
                <span className="j-pillbadge" style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)' }}>
                  <Icon name="note" size={13} color="var(--muted)" /> Edited {J.fmtShort(e.editedOn)}
                </span>
              )}
            </span>
          </div>

          <div className="j-card j-card-pad">
            <p className="j-body">{e.summary}</p>
            {(e.photo || e.photoData) && <PhotoAttachment caption={e.photo} src={e.photoData} />}
          </div>

          {isH && e.handover && (
            <div className="j-card j-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {e.handover.behaviours && e.handover.behaviours.length > 0 && (
                <div className="j-chiprow">
                  {e.handover.behaviours.map(b => <span key={b} className="j-chip j-chip-on" style={{ pointerEvents: 'none', minHeight: 36 }}>{b}</span>)}
                </div>
              )}
              {[['Before', e.handover.before], ['During', e.handover.during], ['After', e.handover.after]].map(([l, v]) => v && (
                <div key={l}>
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 14, color: 'var(--blue)', marginBottom: 3 }}>{l}</p>
                  <p className="j-body" style={{ fontSize: 15.5 }}>{v}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 20 }}>
                {e.handover.duration && <div><p className="j-meta">Lasted</p><p className="j-strong" style={{ fontSize: 16 }}>{e.handover.duration}</p></div>}
              </div>
              {e.handover.helped && (
                <div style={{ background: 'var(--tint-green)', borderRadius: 12, padding: 12 }}>
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 14, color: 'var(--green-ink)', marginBottom: 3 }}>What helped</p>
                  <p className="j-body" style={{ fontSize: 15.5 }}>{e.handover.helped}</p>
                </div>
              )}
            </div>
          )}

          {e.history && e.history.length > 0 && (
            <div className="j-card j-card-pad" style={{ background: 'var(--card-2)' }}>
              <p className="j-sm" style={{ marginBottom: 8 }}>What it said before (kept for honesty)</p>
              {e.history.map((h, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                  <p className="j-meta" style={{ marginBottom: 3 }}>Until {J.fmtShort(h.on)} {h.on.slice(0, 4)}</p>
                  <p className="j-body" style={{ fontSize: 15 }}>{h.summary}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: 'var(--blue)' }} onClick={() => setEditing(true)}>
              <Icon name="note" size={18} color="var(--blue)" /> Edit
            </button>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: '#C0392B' }}
              onClick={() => { if (window.confirm('Delete this note from the record? This cannot be undone.')) { nav.deleteEntry(e.id); nav.back(); } }}>
              <Icon name="close" size={18} color="#C0392B" /> Delete
            </button>
          </div>
        </div>
      </div>
      {editing && <EditEntrySheet entry={e} onSave={(patch) => nav.updateEntry(e.id, patch)} onClose={() => setEditing(false)} />}
    </div>
  );
}

Object.assign(window, { MonthScreen, DayScreen, EntryScreen, TabTitle });
