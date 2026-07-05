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

// Plus: the shown month as the same bar graph the Today page draws.
function MonthMoodGraph({ entries, year, month }) {
  const J = window.JOTLA;
  const pre = `${year}-${String(month + 1).padStart(2, '0')}-`;
  let good = 0, ok = 0, hard = 0;
  const dim = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) {
    const m = J.dayMood(entries.filter(e => e.date === pre + String(d).padStart(2, '0')));
    if (m === 'good') good++; else if (m === 'ok') ok++; else if (m === 'hard') hard++;
  }
  const blocks = [
    { key: 'good', label: 'Good', n: good },
    { key: 'ok',   label: 'Mixed', n: ok },
    { key: 'hard', label: 'Hard', n: hard },
  ];
  const maxN = Math.max(good, ok, hard, 1);
  const hc = {};
  entries.forEach(e => { if (e.date.startsWith(pre) && e.mood === 'hard') hc[e.category] = (hc[e.category] || 0) + 1; });
  const top = Object.entries(hc).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="j-card" style={{ padding: 18, marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="j-h3">How {J.MONTH_NAMES[month]} looked</span>
        <span className="j-pillbadge" style={{ background: 'var(--tint-amber)', color: 'var(--amber)' }}>Plus</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', minHeight: 92 }}>
        {blocks.map(b => {
          const c = window.MOOD_COLOURS[b.key];
          const h = 22 + (b.n / maxN) * 54;
          return (
            <div key={b.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 16, color: c, lineHeight: 1 }}>{b.n}</span>
              <div style={{ width: '100%', height: h, borderRadius: 14, background: c }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>{b.label}</span>
            </div>
          );
        })}
      </div>
      <p className="j-body" style={{ fontSize: 14.5, color: 'var(--muted)', marginTop: 16 }}>
        {top
          ? (<><span className="j-strong">{top[0]}</span> entries come up most often as the hard moments this month.</>)
          : 'No hard moments logged this month. Long may it last.'}
      </p>
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
  const earliest = entries.length ? entries.reduce((a, e) => (e.date < a ? e.date : a), entries[0].date) : J.TODAY_ISO;

  // Month metadata + calendar cells for any offset from the current month.
  const monthMeta = (off) => {
    const shown = new Date(today.getFullYear(), today.getMonth() + off, 1);
    const year = shown.getFullYear();
    const month = shown.getMonth(); // 0-based
    const isCurrent = off === 0;
    const todayNum = isCurrent ? today.getDate() : 99; // no today ring or future dimming off the current month
    const canBack = `${year}-${String(month + 1).padStart(2, '0')}-01` > earliest.slice(0, 8) + '01';
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.date === iso);
      cells.push({ d, iso, mood: J.dayMood(dayEntries), count: dayEntries.length, future: d > todayNum, isToday: d === todayNum });
    }
    return { year, month, isCurrent, canBack, cells };
  };
  const cur = monthMeta(offset);
  const { year, month, isCurrent } = cur;
  const monthLabel = `${J.MONTH_NAMES[month]} ${year}`;

  // The calendar is a real swipe pager (same mechanism as the tier selector):
  // the neighbouring months sit either side and the grid follows the finger.
  const panelOffsets = [];
  if (cur.canBack) panelOffsets.push(offset - 1);
  panelOffsets.push(offset);
  if (!isCurrent) panelOffsets.push(offset + 1);
  const centerIdx = panelOffsets.indexOf(offset);
  const pagerRef = React.useRef(null);
  const settleRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = pagerRef.current;
    if (el) el.scrollLeft = centerIdx * el.clientWidth;
  }, [offset, panelOffsets.length]);
  const onPagerScroll = () => {
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const el = pagerRef.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      const target = panelOffsets[Math.max(0, Math.min(panelOffsets.length - 1, i))];
      if (target !== undefined && target !== offset) move(target - offset);
    }, 90);
  };
  const dows = J.DOW_MON; // Mon Tue Wed Thu Fri Sat Sun

  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
          <TabTitle title={monthLabel} sub="Tap any day to read it back." />

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
                if (!me.length) return (<><span className="j-strong">Nothing logged in {J.MONTH_NAMES[month]}.</span> Swipe the calendar to move between months.</>);
                return (<><span className="j-strong">{me.length} {me.length === 1 ? 'entry' : 'entries'} this month{h ? `, ${h} on hard days` : ''}.</span> Tap a tinted day to read it back.</>);
              })()}</p>
            </div>
          ) : (
            <PlusLockedCard onClick={() => nav.go('unlock')} style={{ marginBottom: 18 }}
              title="Month patterns" text="The mood graph, counts and hard-day patterns for each month. Part of Plus." />
          )}

          {/* calendar: swipe the grid itself between months, like the tier pager */}
          <div className="j-card" style={{ padding: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
              {dows.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: 'var(--faint)' }}>{d}</div>)}
            </div>
            <div ref={pagerRef} onScroll={onPagerScroll} className="j-pager" style={{ display: 'flex',
              overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
              {panelOffsets.map(off => {
                const m = off === offset ? cur : monthMeta(off);
                return (
                  <div key={off} style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start',
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignContent: 'start' }}>
                    {m.cells.map((c, idx) => {
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
                );
              })}
            </div>
          </div>

          {/* quiet swipe hint */}
          <p style={{ textAlign: 'center', marginTop: 10, marginBottom: 0, fontSize: 12.5, fontWeight: 500,
            color: 'var(--faint)', opacity: 0.75 }}>‹  swipe left and right  ›</p>

          {/* legend */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
            {[['good', 'Good day'], ['ok', 'Up and down'], ['hard', 'Hard day'], ['none', 'No note']].map(([k, l]) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--faint)' }}>
                <MoodDot mood={k} size={9} /> {l}
              </span>
            ))}
          </div>

          {/* Plus: the shown month, graphed like the Today page */}
          {nav.plus && <MonthMoodGraph entries={entries} year={year} month={month} />}
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
              <p className="j-sm" style={{ marginBottom: 8, color: '#6C9BD9', fontStyle: 'italic' }}>What it said before</p>
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
