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

function MonthScreen({ nav, entries }) {
  const J = window.JOTLA;
  const today = J.parseISO(J.TODAY_ISO);
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const todayNum = today.getDate();
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
          <TabTitle title={monthLabel} sub="Tap any day to read it back." />

          {/* plain trend */}
          <div className="j-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18,
            background: 'var(--tint-amber)', border: 'none' }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="leaf" size={20} color="var(--amber)" />
            </span>
            <p className="j-body" style={{ fontSize: 15.5 }}><span className="j-strong">Afternoons have been harder this week.</span> The tricky moments keep landing just after lunch.</p>
          </div>

          {/* calendar */}
          <div className="j-card" style={{ padding: 14 }}>
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
function EntryScreen({ nav, entries, id }) {
  const J = window.JOTLA;
  const e = entries.find(x => x.id === id);
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
            <span className="j-pillbadge" style={{ background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
              color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)' }}>
              <Icon name="clock" size={13} color={e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)'} />
              {e.kind === 'contemporaneous' ? 'Same day' : 'Added later'}
            </span>
          </div>

          <div className="j-card j-card-pad">
            <p className="j-body">{e.summary}</p>
            {e.photo && <PhotoAttachment caption={e.photo} />}
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
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MonthScreen, DayScreen, EntryScreen, TabTitle });
