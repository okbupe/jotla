// jotla-month.jsx: Month calendar (tab) and Day detail (push).
const { useState: useStateM } = React;

function TabTitle({ title, sub, right }) {
  // One top line app-wide (founder, 7 Aug): the title starts at the pad's own
  // top on every tab, never pushed down by the 44px corner button. The corner
  // slot is capped to the title's line height and the button centres inside
  // it, overflowing equally above and below (it is transparent, so the
  // overflow is invisible and the tap target stays full size).
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <h1 className="j-h1" style={{ fontSize: 'calc(28px * var(--tscale, 1))' }}>{title}</h1>
        {sub && <p className="j-sm" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
      {right && (
        <div style={{ height: 'calc(30px * var(--tscale, 1))', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {right}
        </div>
      )}
    </div>
  );
}

// Plus: the shown month as the same bar graph the Today page draws, four bars
// since 16 Jul 2026: Good / Mixed / Hard days in the static mood colours, then
// Dysregulation moments in their own plum (LAST, with its label tucked to the
// right edge, exactly as the Today strip), and the plain summary sentence. The
// counting rule lives with kindBarBlocks in jotla-ui.jsx: mood bars count DAYS,
// the Dysregulation bar counts MOMENTS.
function MonthMoodGraph({ entries, year, month }) {
  const J = window.JOTLA;
  const pre = `${year}-${String(month + 1).padStart(2, '0')}-`;
  let good = 0, ok = 0, hard = 0;
  const dim = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) {
    const m = J.dayMood(entries.filter(e => e.date === pre + String(d).padStart(2, '0')));
    if (m === 'good') good++; else if (m === 'ok') ok++; else if (m === 'hard') hard++;
  }
  const monthEntries = entries.filter(e => e.date.startsWith(pre));
  const dysreg = monthEntries.filter(e => e.type === 'handover' || e.category === 'Incidents').length;
  const blocks = window.kindBarBlocks({ good, ok, hard, dysreg });
  const maxN = Math.max(good, ok, hard, dysreg, 1);
  const hc = {};
  monthEntries.forEach(e => { if (e.mood === 'hard' && e.category) hc[e.category] = (hc[e.category] || 0) + 1; });
  const top = Object.entries(hc).sort((a, b) => b[1] - a[1])[0];
  const hardCount = monthEntries.filter(e => e.mood === 'hard').length;
  return (
    <div className="j-card" style={{ padding: 18, marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="j-h3">How {J.MONTH_NAMES[month]} looked</span>
        <span className="j-pillbadge" style={{ background: '#6E54D6', color: '#fff' }}>Plus</span>
      </div>
      <KindBars blocks={blocks} maxN={maxN} />
      <p className="j-body" style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 16 }}>
        {monthEntries.length
          ? (<><span className="j-strong">{monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'} this month{hardCount ? `, ${hardCount} on hard days` : ''}.</span>{' '}
              {top
                ? (<><span className="j-strong">{top[0]}</span> entries come up most often as the hard moments.</>)
                : hardCount === 0
                  ? (dysreg > 0
                      // Dysregulation moments can carry a good or mixed mood, so
                      // "no hard moments" alone would sit dishonestly next to a
                      // plum bar with a count in it.
                      ? `${dysreg} dysregulation ${dysreg === 1 ? 'moment' : 'moments'} logged, none marked as a hard moment.`
                      : 'No hard moments logged. Long may it last.')
                  // Hard moments with no theme tagged: saying "no hard moments"
                  // here would be a false claim, so count them honestly.
                  : `${hardCount} hard ${hardCount === 1 ? 'moment' : 'moments'} logged, not tagged to a theme.`}</>)
          : (<><span className="j-strong">Nothing logged in {J.MONTH_NAMES[month]}.</span> Swipe the calendar to move between months.</>)}
      </p>
    </div>
  );
}

// Free: the locked patterns preview (redesign, 6 Aug). The analytics SHAPE sits
// blurred behind a soft veil carrying the solid gold crown and the feature line;
// tapping anywhere opens the Jotla Plus page (the crown gate). The bars are a
// shape preview, unreadable by design, never presented as this month's data.
function PatternsLockedPreview({ onOpen }) {
  const bars = [['68%','var(--green)'],['40%','var(--green)'],['88%','var(--red)'],['52%','var(--amber)'],
    ['80%','var(--red)'],['44%','var(--green)'],['58%','var(--amber)'],['36%','var(--green)'],
    ['64%','var(--green)'],['84%','var(--red)'],['48%','var(--amber)'],['40%','var(--green)'],
    ['76%','var(--red)'],['56%','var(--green)']];
  const dys = ['40%','22%','78%','45%','95%','28%','55%','22%','70%','90%','35%','25%','82%','48%'];
  return (
    <button onClick={onOpen} className="j-press" aria-label="Month patterns, part of Jotla Plus"
      style={{ position: 'relative', width: '100%', border: '1px solid var(--line)', borderRadius: 16,
        overflow: 'hidden', background: 'var(--card)', marginTop: 18, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
      <div aria-hidden="true" style={{ filter: 'blur(7px)', opacity: 0.8, padding: '16px 16px 14px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 70 }}>
          {bars.map(([h, c], i) => <span key={i} style={{ flex: 1, height: h, background: c, borderRadius: 3 }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 34, marginTop: 8 }}>
          {dys.map((h, i) => <span key={i} style={{ flex: 1, height: h, background: 'var(--dysreg)', borderRadius: 3 }} />)}
        </div>
        <p style={{ fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 10, marginBottom: 0 }}>9 good · 4 mixed · 5 hard · 6 dysregulation</p>
      </div>
      <span className="j-patveil" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <Icon name="crown" size={22} color="var(--gold)" />
        <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 600, color: 'var(--ink)' }}>Month patterns</span>
        <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--muted)' }}>The mood graph, counts and hard-day patterns.</span>
      </span>
    </button>
  );
}

/* ==================== THE ADVANCED CALENDAR (Plus, 11 Aug 2026) ====================
   Founder's design, and the shape of it matters: the calendar's state is driven
   by DELIBERATE GESTURES and discrete modes, never by scroll offset. Scrolling
   only ever moves the record.

     Simple mode      the month grid with the graph under it. This is the whole
                      of the free app's Month tab, now and for good.
     Advanced mode    a single week strip pinned at the top, the graph tucked
                      underneath it, and the record streaming downwards.

   Swipe the graph UP (or tap the graph icon) to go advanced; pull the graph
   DOWN to come back. The graph icon opens and closes the graph in either mode.
   Tapping the month and year opens the full calendar over the stream; tapping a
   date there scrolls the stream to it, and the next scroll compresses it again.

   TODAY IS AT THE TOP AND SCROLLING DOWN GOES BACK IN TIME (founder, 11 Aug).
   That direction is not a preference, it falls out of the record: Jotla refuses
   future-dated entries, so the empty days a parent can tap and fill can only
   ever lie in the past. Spec: Vision `App/Jotla-Insights-and-Calendar-Plan-2026-08-11.md`. */
const STREAM_PAGE = 21;   // days paged in at a time
const STREAM_LEAD = 480;  // px from the end of the stream that triggers the next page

// The pinned week: seven real day buttons, Monday first, the anchor carrying
// the tint. Tapping one scrolls the record to that day.
function WeekStrip({ anchor, byDate, onPick }) {
  const J = window.JOTLA;
  const dt = J.parseISO(anchor);
  const monday = J.isoShift(anchor, -((dt.getDay() + 6) % 7));
  const days = [];
  for (let i = 0; i < 7; i++) days.push(J.isoShift(monday, i));
  return (
    <div className="j-weekstrip" role="group" aria-label="The week you are reading">
      {days.map((iso, i) => {
        const list = byDate[iso] || [];
        const mood = J.dayMood(list);
        const future = iso > J.TODAY_ISO;
        const on = iso === anchor;
        const d = J.parseISO(iso);
        return (
          <button key={iso} className="j-weekday j-press" disabled={future} onClick={() => !future && onPick(iso)}
            aria-current={on ? 'date' : undefined}
            aria-label={`${J.fmtLong(iso)}, ${list.length ? list.length + (list.length === 1 ? ' note' : ' notes') : 'no note'}`}
            style={{ opacity: future ? 0.4 : 1, cursor: future ? 'default' : 'pointer' }}>
            <span className="j-weekday-dow">{J.DOW_MON[i].slice(0, 1)}</span>
            <span className="j-weekday-num" style={{ color: on ? 'var(--blue)' : mood ? window.MOOD_COLOURS[mood] : 'var(--muted)' }}>{d.getDate()}</span>
            <MoodDot mood={mood || 'none'} size={5} />
          </button>
        );
      })}
    </div>
  );
}

// One day in the stream. A day with nothing on it is not a dead row: it offers
// the note, exactly as the Day screen does, preset to that date.
function StreamDay({ iso, list, nav, hostRef }) {
  const J = window.JOTLA;
  const mood = J.dayMood(list);
  const label = iso === J.TODAY_ISO ? 'Today'
    : iso === J.isoShift(J.TODAY_ISO, -1) ? 'Yesterday' : J.fmtLong(iso);
  return (
    <section className="j-daysec" data-day={iso} ref={hostRef}>
      <div className="j-daysec-head">
        <span className="j-h3" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))' }}>{label}</span>
        {mood && <MoodDot mood={mood} size={8} />}
        <span style={{ flex: 1 }} />
        {list.length > 0 && (
          <span className="j-meta">{list.length} {list.length === 1 ? 'note' : 'notes'}</span>
        )}
      </div>
      {list.length
        ? <LogList list={list} nav={nav} />
        : (
          <button className="j-emptyday j-press" onClick={() => nav.go('quicklog', { date: iso })}
            aria-label={'Add a note for ' + J.fmtLong(iso)}>
            <Icon name="plus" size={15} color="var(--faint)" /> Add a note
          </button>
        )}
    </section>
  );
}

function MonthScreen({ nav, entries, view }) {
  const J = window.JOTLA;
  const today = J.parseISO(J.TODAY_ISO);

  // How far back the calendar pages: the app's data epoch (Quick log's own
  // minimum day), whether or not anything is logged that far back
  // (12 Jul 2026): the past is freely browsable, so a parent can open any old
  // day and add to it from there.
  const [epochY, epochM] = window.MIN_LOG_DAY.split('-').map(Number);
  const epochMonthIndex = epochY * 12 + (epochM - 1);
  const minOffset = epochMonthIndex - (today.getFullYear() * 12 + today.getMonth());

  // Months back from the current month; remembered on the view so Back
  // returns to the month the parent was reading. Read defensively: only a
  // finite number counts, clamped between the epoch and the current month.
  const remembered = view && view.monthOffset;
  const [offset, setOffset] = React.useState(
    typeof remembered === 'number' && isFinite(remembered)
      ? Math.max(minOffset, Math.min(0, Math.trunc(remembered))) : 0
  );

  // Month metadata + calendar cells for any offset from the current month.
  // Always exactly six week rows (42 cells), whatever the month's shape: the
  // tail fills with the same blanks as the lead-in, so the calendar card
  // never resizes and nothing below it ever moves when the month changes
  // (12 Jul 2026).
  const monthMeta = (off) => {
    const shown = new Date(today.getFullYear(), today.getMonth() + off, 1);
    const year = shown.getFullYear();
    const month = shown.getMonth(); // 0-based
    const isCurrent = off === 0;
    const todayNum = isCurrent ? today.getDate() : 99; // no today ring or future dimming off the current month
    const canBack = year * 12 + month > epochMonthIndex;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEntries = entries.filter(e => e.date === iso);
      cells.push({ d, iso, mood: J.dayMood(dayEntries), count: dayEntries.length, future: d > todayNum, isToday: d === todayNum });
    }
    while (cells.length < 42) cells.push(null);
    return { year, month, isCurrent, canBack, cells };
  };
  const cur = monthMeta(offset);
  const { year, month, isCurrent } = cur;
  const monthLabel = `${J.MONTH_NAMES[month]} ${year}`;

  // The calendar is a real swipe pager, like the tier selector: the
  // neighbouring months sit either side and the grid follows the finger.
  // Under the swipe it is one fixed timeline of every month from the epoch to
  // now, every panel the same fixed six-row size, so a settled swipe never
  // rebuilds or recentres anything: it only updates the title and the cards
  // around the grid (12 Jul 2026: the old three-panel window recentred after
  // paint and visibly reshuffled). Only the shown month's near neighbours
  // materialise their cells; the rest are empty same-size panels, so the DOM
  // stays light without any layout shift.
  const monthOffsets = [];
  for (let o = minOffset; o <= 0; o++) monthOffsets.push(o);
  const pagerRef = React.useRef(null);
  const settleRef = React.useRef(null);
  const targetRef = React.useRef(offset); // where the pager is headed, for rapid chevrons
  React.useLayoutEffect(() => {
    // Park the pager on the shown month before the first paint; never again
    // from a render (a live gesture must never have the grid moved under it).
    const el = pagerRef.current;
    if (el && el.clientWidth) el.scrollLeft = (targetRef.current - minOffset) * el.clientWidth;
    // Re-align on a real resize: a paging scroller holds its pixel offset
    // across a resize, which would otherwise wedge it between two months.
    const realign = () => {
      const el2 = pagerRef.current;
      if (el2 && el2.clientWidth) el2.scrollLeft = (targetRef.current - minOffset) * el2.clientWidth;
    };
    window.addEventListener('resize', realign);
    return () => window.removeEventListener('resize', realign);
  }, []);
  const adopt = (target) => {
    targetRef.current = target;
    setOffset(o => {
      if (target === o) return o;
      nav.remember({ monthOffset: target });
      return target;
    });
  };
  const onPagerScroll = () => {
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const el = pagerRef.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      const target = monthOffsets[Math.max(0, Math.min(monthOffsets.length - 1, i))];
      if (target !== undefined) adopt(target);
    }, 90);
  };
  // Prev/next month controls (12 Jul 2026): the swipe pager stays, these make
  // the same moves visible and reachable without the gesture. The scroll is
  // the single source of movement: the settle handler adopts the month.
  const move = (delta) => {
    const el = pagerRef.current;
    const next = Math.max(minOffset, Math.min(0, targetRef.current + delta));
    if (next === targetRef.current || !el || !el.clientWidth) return;
    targetRef.current = next;
    el.scrollTo({ left: (next - minOffset) * el.clientWidth, behavior: 'smooth' });
  };
  const monthNavBtn = (dir) => {
    const enabled = dir === 'prev' ? cur.canBack : !isCurrent;
    return (
      <button key={dir} onClick={() => enabled && move(dir === 'prev' ? -1 : 1)} disabled={!enabled}
        aria-label={dir === 'prev' ? 'Previous month' : 'Next month'} className="j-press"
        style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'var(--chip-bg)',
          boxShadow: 'var(--card-shadow)', cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={dir === 'prev' ? 'chevronLeft' : 'chevronRight'} size={20} color={enabled ? 'var(--blue)' : 'var(--faint)'} />
      </button>
    );
  };
  const dows = J.DOW_MON; // Mon Tue Wed Thu Fri Sat Sun

  // ---- advanced mode (Plus). Free never leaves simple mode. ----
  // Mode, graph and place ride the VIEW, like the month pager's offset already
  // does, because opening a note from the record and coming back must not throw
  // the parent out of advanced mode and lose where they were reading.
  const backTo = (iso) => Math.round((J.parseISO(J.TODAY_ISO) - J.parseISO(iso)) / 86400000);
  const [adv, setAdv] = React.useState(!!(view && view.calAdv));
  const [graphOpen, setGraphOpen] = React.useState(view && typeof view.calGraph === 'boolean' ? view.calGraph : true);
  const [calOpen, setCalOpen] = React.useState(false);      // the full calendar always opens closed
  const [anchorISO, setAnchorISO] = React.useState(view && view.calAnchor ? view.calAnchor : J.TODAY_ISO);
  const [dayCount, setDayCount] = React.useState(() => (view && view.calAnchor
    ? Math.max(STREAM_PAGE, backTo(view.calAnchor) + 2 + STREAM_PAGE) : STREAM_PAGE));
  const streamRef = React.useRef(null);
  const dayEls = React.useRef({});
  const spyLock = React.useRef(0);      // a scroll WE caused must not feed back into the strip
  const pendingScroll = React.useRef(view && view.calAdv && view.calAnchor ? view.calAnchor : null);
  const advRef = React.useRef(false);
  const anchorRef = React.useRef(J.TODAY_ISO);
  const graphOpenRef = React.useRef(true);
  advRef.current = adv; graphOpenRef.current = graphOpen; anchorRef.current = anchorISO;

  const byDate = React.useMemo(() => {
    const m = {};
    entries.forEach(e => { (m[e.date] = m[e.date] || []).push(e); });
    return m;
  }, [entries]);

  // Today first, one day at a time backwards, stopping at the data epoch.
  const streamDates = React.useMemo(() => {
    const out = [];
    let iso = J.TODAY_ISO;
    for (let i = 0; i < dayCount && iso >= window.MIN_LOG_DAY; i++) { out.push(iso); iso = J.isoShift(iso, -1); }
    return out;
  }, [dayCount]);
  const atEpoch = streamDates.length < dayCount;

  const enterAdvanced = () => {
    setAdv(true); setGraphOpen(false); setCalOpen(false);
    setAnchorISO(J.TODAY_ISO); setDayCount(STREAM_PAGE);
    dayEls.current = {};
  };
  // Coming back to the month grid, land on the month the parent was READING,
  // not wherever the pager happened to be parked before they went advanced.
  const exitAdvanced = () => {
    const a = J.parseISO(anchorRef.current);
    const off = (a.getFullYear() * 12 + a.getMonth()) - (today.getFullYear() * 12 + today.getMonth());
    adopt(Math.max(minOffset, Math.min(0, off)));
    setAdv(false); setCalOpen(false); setGraphOpen(true);
  };

  const scrollToDate = (iso) => {
    const back = backTo(iso);
    if (back + 2 > dayCount) setDayCount(back + 2 + STREAM_PAGE);
    setAnchorISO(iso);
    spyLock.current = Date.now() + 600;
    pendingScroll.current = iso;
  };
  // runs after every render, so a date that needed paging in first still lands
  React.useEffect(() => {
    const iso = pendingScroll.current;
    if (!iso) return;
    const node = dayEls.current[iso];
    if (!node || !streamRef.current) return;
    streamRef.current.scrollTop = Math.max(0, node.offsetTop - 6);
    pendingScroll.current = null;
    spyLock.current = Date.now() + 400;
  });

  const onStreamScroll = (e) => {
    const el = e.currentTarget;
    if (!atEpoch && el.scrollTop + el.clientHeight > el.scrollHeight - STREAM_LEAD) {
      setDayCount(c => c + STREAM_PAGE);
    }
    if (Date.now() < spyLock.current) return;
    // any scroll of the parent's own making compresses the full calendar again
    if (calOpen) setCalOpen(false);
    const top = el.scrollTop + 14;
    let found = null;
    for (const iso of streamDates) {
      const node = dayEls.current[iso];
      if (!node) continue;
      if (node.offsetTop <= top) found = iso; else break;
    }
    if (found && found !== anchorISO) setAnchorISO(found);
  };

  // Stash the mode on the view so Back restores the page AS IT WAS.
  React.useEffect(() => {
    if (view && view.calAdv === adv && view.calGraph === graphOpen && view.calAnchor === anchorISO) return;
    nav.remember({ calAdv: adv, calGraph: graphOpen, calAnchor: anchorISO });
  }, [adv, graphOpen, anchorISO]);

  // The graph is the handle for both mode changes: up tucks it away and the
  // record streams in, down brings the month back. Refs, not state, inside the
  // listener: a gesture reading a stale closure drops fast flicks.
  const graphRef = React.useRef(null);
  React.useEffect(() => {
    const el = graphRef.current;
    if (!el || !nav.plus) return undefined;
    let y0 = null, x0 = null;
    const start = (ev) => { const t = ev.touches[0]; y0 = t.clientY; x0 = t.clientX; };
    const move = (ev) => {
      if (y0 === null) return;
      const t = ev.touches[0];
      const dy = t.clientY - y0, dx = t.clientX - x0;
      if (Math.abs(dy) < 44 || Math.abs(dx) > Math.abs(dy)) return;   // deliberate, and vertical
      y0 = null;
      if (dy < 0 && !advRef.current) { ev.preventDefault(); enterAdvanced(); }
      else if (dy > 0 && advRef.current && graphOpenRef.current) { ev.preventDefault(); exitAdvanced(); }
    };
    const end = () => { y0 = null; };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', end, { passive: true });
    el.addEventListener('touchcancel', end, { passive: true });
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', end);
      el.removeEventListener('touchcancel', end);
    };
  }, [nav.plus, adv]);

  const anchorDate = J.parseISO(anchorISO);
  const advLabel = `${J.MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  const openCal = () => {
    const off = (anchorDate.getFullYear() * 12 + anchorDate.getMonth()) - (today.getFullYear() * 12 + today.getMonth());
    adopt(Math.max(minOffset, Math.min(0, off)));
    setCalOpen(true);
  };
  const graphBtn = nav.plus ? (
    <button className="j-iconbtn" data-graph-toggle aria-pressed={graphOpen}
      aria-label={graphOpen ? 'Hide the graph' : 'Show the graph'}
      onClick={() => { if (!advRef.current) enterAdvanced(); else setGraphOpen(g => !g); }}>
      <Icon name="chart" size={22} color="var(--muted)" />
    </button>
  ) : null;
  // in advanced mode a calendar tap moves the record; in simple mode it opens the day
  const pickDay = (iso) => (advRef.current ? scrollToDate(iso) : nav.go('day', { date: iso }));

  const calendarCard = (
      <div className="j-card" style={{ padding: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {dows.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 500, color: 'var(--faint)' }}>{d}</div>)}
        </div>
        <div ref={pagerRef} onScroll={onPagerScroll} className="j-pager" {...pagerKeyProps(pagerRef, 'Calendar months')}
          style={{ display: 'flex',
          overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', outline: 'none' }}>
          {monthOffsets.map(off => {
            // Materialise cells only near the shown month; the far panels
            // stay as fixed-size placeholders (they stretch to the row's
            // height, so paging is always pixel-stable).
            if (Math.abs(off - offset) > 2) {
              return <div key={off} aria-hidden="true" style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start' }} />;
            }
            const m = off === offset ? cur : monthMeta(off);
            return (
              <div key={off} style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start',
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignContent: 'start' }}>
                {m.cells.map((c, idx) => {
                  if (!c) return <div key={'blank-' + idx} style={{ aspectRatio: '1 / 1' }} />;
                  const tint = c.mood ? window.moodTint(c.mood) : 'transparent';
                  const ink = c.mood ? window.MOOD_COLOURS[c.mood] : (c.future ? 'var(--line)' : 'var(--faint)');
                  // Every past day and today opens the Day view, notes or
                  // not (12 Jul 2026); only future days stay inert.
                  const tappable = !c.future;
                  return (
                    <button key={c.d} onClick={() => tappable && pickDay(c.iso)}
                      className={tappable ? 'j-press' : ''} disabled={!tappable}
                      aria-label={c.future
                        ? `${c.d} ${J.MONTH_NAMES[m.month]} ${m.year}, in the future`
                        : `${c.d} ${J.MONTH_NAMES[m.month]} ${m.year}, ${c.count > 0 ? c.count + (c.count === 1 ? ' note' : ' notes') : 'no note'}`}
                      style={{ aspectRatio: '1 / 1', borderRadius: '50%', cursor: tappable ? 'pointer' : 'default',
                        border: 'none', boxShadow: c.isToday ? 'inset 0 0 0 1.5px var(--blue)' : 'none',
                        background: tint, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                        opacity: c.future ? 0.55 : 1 }}>
                      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: c.isToday ? 600 : 500, fontSize: 'calc(15px * var(--tscale, 1))', color: c.isToday ? 'var(--blue)' : ink }}>{c.d}</span>
                      {c.mood && <MoodDot mood={c.mood} size={6} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
  );
  const legendRow = (
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
        {[['good', 'Good day'], ['ok', 'Mixed day'], ['hard', 'Hard day'], ['none', 'No note']].map(([k, l]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--faint)' }}>
            <MoodDot mood={k} size={9} /> {l}
          </span>
        ))}
      </div>
  );
  // The graph is both the panel and the handle. In advanced mode it shows the
  // month the parent is actually reading, which is the anchor's month, not the
  // month the pager happens to be parked on.
  const graphBlock = (
    <div ref={graphRef} className={'j-graphfold' + (graphOpen ? '' : ' j-folded')}>
      {nav.plus
        ? <MonthMoodGraph entries={entries} year={adv ? anchorDate.getFullYear() : year} month={adv ? anchorDate.getMonth() : month} />
        : <PatternsLockedPreview onOpen={() => nav.go('unlock')} />}
    </div>
  );

  // ---- ADVANCED: pinned chrome, then ONE scroller holding the record ----
  if (adv) {
    return (
      <div className="j-screen" data-cal-mode="advanced">
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <button className="j-press" data-cal-open onClick={() => (calOpen ? setCalOpen(false) : openCal())}
              aria-expanded={calOpen} aria-label={(calOpen ? 'Close' : 'Open') + ' the full calendar'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <h1 className="j-h1" style={{ fontSize: 'calc(28px * var(--tscale, 1))' }}>{advLabel}</h1>
              <span className={'j-calarrow' + (calOpen ? ' j-open' : '')} aria-hidden="true">
                <Icon name="chevronRight" size={20} color="var(--muted)" />
              </span>
            </button>
            <div style={{ height: 'calc(30px * var(--tscale, 1))', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{graphBtn}</div>
          </div>
          {calOpen ? calendarCard : <WeekStrip anchor={anchorISO} byDate={byDate} onPick={scrollToDate} />}
          {graphBlock}
        </div>
        <div className="j-scroll j-fade" ref={streamRef} onScroll={onStreamScroll} data-stream>
          <div className="j-pad" style={{ paddingBottom: 140 }}>
            {streamDates.map(iso => (
              <StreamDay key={iso} iso={iso} list={byDate[iso] || []} nav={nav}
                hostRef={el => { if (el) dayEls.current[iso] = el; }} />
            ))}
            {atEpoch && <p className="j-meta" style={{ textAlign: 'center', padding: '18px 0 4px' }}>That is as far back as Jotla goes.</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---- SIMPLE: the free app's Month tab, unchanged ----
  return (
    <div className="j-screen" data-cal-mode="simple">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 120 }}>
          <TabTitle title={monthLabel}
            right={<div style={{ display: 'flex', gap: 8 }}>{monthNavBtn('prev')}{monthNavBtn('next')}{graphBtn}</div>} />
          {calendarCard}
          {legendRow}
          {graphBlock}
        </div>
      </div>
    </div>
  );
}

// ---------------- Day detail ----------------
// Every day from the data epoch to today offers "Add a note", preset to this
// exact date (12 Jul 2026), so an empty day is an invitation rather than a
// dead end. The date rides the view to Quick log, so the day arrives pre-set
// there and nothing needs re-picking.
function DayScreen({ nav, entries, date }) {
  const J = window.JOTLA;
  const list = entries.filter(e => e.date === date);
  const mood = J.dayMood(list);
  const canAdd = !!date && date >= window.MIN_LOG_DAY && date <= J.TODAY_ISO;
  return (
    <div className="j-screen">
      <PushHeader title={J.fmtLong(date)} subtitle={list.length + (list.length === 1 ? ' note' : ' notes')} onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mood && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 999, background: window.moodTint(mood) }}>
              <MoodDot mood={mood} size={10} />
              <span style={{ fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500, color: window.MOOD_COLOURS[mood] }}>
                {mood === 'good' ? 'A good day overall' : mood === 'ok' ? 'A mixed day' : 'A hard day'}
              </span>
            </div>
          )}
          {list.length === 0 ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <p className="j-body" style={{ color: 'var(--muted)' }}>No notes on this day.</p>
              {canAdd && <p className="j-sm" style={{ color: 'var(--faint)', marginTop: 4 }}>You can still add one now.</p>}
            </div>
          ) : (
            <LogList list={list} nav={nav} />
          )}
          {canAdd && (
            <button className="j-btn j-btn-primary" aria-label={'Add a note for ' + J.fmtLong(date)}
              style={{ marginTop: list.length === 0 ? 0 : 6 }}
              onClick={() => nav.go('quicklog', { date })}>
              <Icon name="plus" size={20} color="#fff" /> Add a note
            </button>
          )}
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
            padding: 12, fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', resize: 'vertical', marginBottom: 14 }} />
        <p className="j-sm" style={{ marginBottom: 6 }}>How the moment felt</p>
        <div className="j-chiprow" style={{ marginBottom: 12 }}>
          {J.MOODS.map(m => (
            <button key={m.key} aria-pressed={mood === m.key} className={'j-chip' + (mood === m.key ? ' j-chip-on' : '')} onClick={() => setMood(m.key)}>
              <MoodDot mood={m.key} size={11} /> {m.label}
            </button>
          ))}
        </div>
        <p className="j-sm" style={{ marginBottom: 6 }}>Theme</p>
        <div className="j-chiprow" style={{ marginBottom: 12 }}>
          {J.CATEGORIES.map(c => (
            <button key={c} aria-pressed={category === c} className={'j-chip' + (category === c ? ' j-chip-on' : '')} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <p className="j-sm" style={{ marginBottom: 6 }}>Where</p>
        <div className="j-chiprow" style={{ marginBottom: 16 }}>
          {J.SETTINGS.map(s => (
            <button key={s} aria-pressed={setting === s} className={'j-chip' + (setting === s ? ' j-chip-on' : '')} onClick={() => setSetting(s)}>{s}</button>
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
                <p className="j-h3">{e.time} at {J.settingInSentence(e.setting)}</p>
                <p className="j-meta">{J.fmtLong(e.date)} · {e.categoryOther || e.category}</p>
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
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(14px * var(--tscale, 1))', color: 'var(--blue)', marginBottom: 3 }}>{l}</p>
                  <p className="j-body" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))' }}>{v}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {e.handover.who && e.handover.who.length > 0 && <div><p className="j-meta">Who was there</p><p className="j-strong" style={{ fontSize: 'calc(16px * var(--tscale, 1))' }}>{e.handover.who.join(', ')}</p></div>}
                {e.handover.where && <div><p className="j-meta">Where</p><p className="j-strong" style={{ fontSize: 'calc(16px * var(--tscale, 1))' }}>{e.handover.where}</p></div>}
                {e.handover.duration && <div><p className="j-meta">Lasted</p><p className="j-strong" style={{ fontSize: 'calc(16px * var(--tscale, 1))' }}>{e.handover.duration}</p></div>}
              </div>
              {e.handover.helped && (
                <div style={{ background: 'var(--tint-green)', borderRadius: 12, padding: 12 }}>
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(14px * var(--tscale, 1))', color: 'var(--green-ink)', marginBottom: 3 }}>What helped</p>
                  <p className="j-body" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))' }}>{e.handover.helped}</p>
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
                  <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))' }}>{h.summary}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: 'var(--blue)' }} onClick={() => setEditing(true)}>
              <Icon name="note" size={18} color="var(--blue)" /> Edit
            </button>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: '#C0392B' }}
              onClick={() => { if (window.confirm('Move this note to the Bin? You can restore it for 30 days from Settings.')) { nav.deleteEntry(e.id); nav.back(); } }}>
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
