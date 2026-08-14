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

// THE MONTH TAB COMES BACK EXACTLY AS IT WAS LEFT (founder, 14 Aug: "let it be
// how I left it always. I'll reset it myself if I must" - the rewind clock is
// that reset). This keep lives at module level, above the screen, so switching
// tabs, visiting Settings or changing the theme cannot lose the place; a cold
// start begins fresh at today, on purpose.
const CAL_KEEP = {};

// The compressed calendar IS the week strip: the same grid, folded down to the
// one row holding the anchor. A separate strip component was the first build
// and it is gone, because two components cannot stretch into each other while
// tracking a finger. The row height is measured from a real cell, never
// assumed, since cells are aspect-ratio squares in a 7-column grid and their
// size follows the screen and the parent's text-size setting.
// One day in the stream. A day with nothing on it is not a dead row: it offers
// the note, exactly as the Day screen does, preset to that date.
function StreamDay({ iso, list, nav, hostRef }) {
  const J = window.JOTLA;
  const mood = J.dayMood(list);
  const label = iso === J.TODAY_ISO ? 'Today'
    : iso === J.isoShift(J.TODAY_ISO, -1) ? 'Yesterday' : J.fmtLong(iso);
  return (
    <section className={'j-daysec' + (list.length ? ' j-hasnotes' : '')} data-day={iso} ref={hostRef}>
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
  // Always exactly six week rows (42 cells), whatever the month's shape, so
  // the calendar card never resizes and nothing below it ever moves when the
  // month changes (12 Jul 2026). The lead-in and tail hold the neighbouring
  // months' real days now (founder, 14 Aug): on Plus they render FADED, and
  // tapping one hands the selection to that month; on free they stay the
  // blanks they have always been (the 11 Aug lock). The first column follows
  // the week-start setting.
  const monthMeta = (off) => {
    const shown = new Date(today.getFullYear(), today.getMonth() + off, 1);
    const year = shown.getFullYear();
    const month = shown.getMonth(); // 0-based
    const isCurrent = off === 0;
    const canBack = year * 12 + month > epochMonthIndex;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = J.weekLead(shown);
    const pad2 = n => String(n).padStart(2, '0');
    const cellOf = (dt, out) => {
      const iso = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      const dayEntries = entries.filter(e => e.date === iso);
      return { d: dt.getDate(), iso, out, m: dt.getMonth(), y: dt.getFullYear(),
        mood: J.dayMood(dayEntries), count: dayEntries.length,
        future: iso > J.TODAY_ISO, isToday: iso === J.TODAY_ISO };
    };
    const cells = [];
    for (let i = firstDow - 1; i >= 0; i--) cells.push(cellOf(new Date(year, month, -i), true));
    for (let d = 1; d <= daysInMonth; d++) cells.push(cellOf(new Date(year, month, d), false));
    let nx = 1;
    while (cells.length < 42) { cells.push(cellOf(new Date(year, month + 1, nx), true)); nx++; }
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
  // A state updater must stay pure: remember() used to live inside this one,
  // and an updater re-runs on every re-render pass, so calling adopt from an
  // effect sent remember -> setView -> re-render -> remember round in a circle
  // until React's nested-update cap (#185, caught 13 Aug). The view is stashed
  // below, after the commit, where a write belongs.
  const adopt = (target) => {
    targetRef.current = target;
    setOffset(o => (target === o ? o : target));
  };
  React.useEffect(() => { nav.remember({ monthOffset: offset }); }, [offset]);
  const onPagerScroll = () => {
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const el = pagerRef.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      const target = monthOffsets[Math.max(0, Math.min(monthOffsets.length - 1, i))];
      if (target === undefined) return;
      // A settle that lands where the pager was already headed is one of our
      // own parks echoing back. A settle anywhere ELSE is the parent swiping
      // months, and on Plus that swipe carries the whole surface with it
      // (founder, 14 Aug): the graph follows the shown month and the record
      // moves to the first of it.
      const swiped = target !== targetRef.current;
      adopt(target);
      if (swiped && nav.plus) {
        const shown = new Date(today.getFullYear(), today.getMonth() + target, 1);
        let iso = `${shown.getFullYear()}-${String(shown.getMonth() + 1).padStart(2, '0')}-01`;
        if (iso < window.MIN_LOG_DAY) iso = window.MIN_LOG_DAY;
        scrollToDate(iso);
      }
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
  const dows = J.dowLabels(); // rotated to the week-start setting

  // ---- THE ONE SURFACE (Plus; rebuilt to the founder's 14 Aug correction) ----
  // There is no separate advanced mode any more. The Plus Month tab is always
  // the simple view's inset CARD (never a full-bleed panel, the title never on
  // a white background), with the grab line on the card, the graph in its OWN
  // card below (never inside the calendar area), and the record streaming
  // underneath. Two numbers drive it, both 0 to 1, both able to sit anywhere
  // in between because they follow the finger:
  //   t  the calendar, 0 = the anchor's week alone, 1 = the whole month
  //   g  the graph,    0 = tucked away behind the calendar, 1 = fully out
  // The graph swipe drives BOTH together (tuck + compress, nearest-state
  // bounce on release); the grab line drives t alone; the graph icon shows the
  // graph (t untouched) or hides it AND compresses. State rides the VIEW so a
  // note opened from the record comes Back to the page exactly as it was.
  const anchorDateOf = (iso) => J.parseISO(iso);
  const backTo = (iso) => Math.round((J.parseISO(J.TODAY_ISO) - J.parseISO(iso)) / 86400000);
  const [t, setT] = React.useState(typeof CAL_KEEP.t === 'number' ? CAL_KEEP.t : 1);
  const [g, setG] = React.useState(typeof CAL_KEEP.g === 'number' ? CAL_KEEP.g : 1);
  const graphOpen = g > 0.5;
  const calOpen = t > 0.5;
  const [anchorISO, setAnchorISO] = React.useState(CAL_KEEP.anchor || J.TODAY_ISO);
  const [dayCount, setDayCount] = React.useState(() => Math.max(
    CAL_KEEP.dayCount || 0,
    CAL_KEEP.anchor ? Math.max(STREAM_PAGE, backTo(CAL_KEEP.anchor) + 2 + STREAM_PAGE) : STREAM_PAGE));
  const streamRef = React.useRef(null);
  const dayEls = React.useRef({});
  const spyLock = React.useRef(0);      // a scroll WE caused must not feed back into the strip
  const pendingScroll = React.useRef(CAL_KEEP.anchor || null);
  // an exact pixel restore beats an anchor-top restore when coming back
  const pendingRestoreTop = React.useRef(typeof CAL_KEEP.scrollTop === 'number' ? CAL_KEEP.scrollTop : null);
  const anchorRef = React.useRef(J.TODAY_ISO);
  anchorRef.current = anchorISO;

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

  const scrollToDate = (iso) => {
    const back = backTo(iso);
    if (back + 2 > dayCount) setDayCount(back + 2 + STREAM_PAGE);
    setAnchorISO(iso);
    spyLock.current = Date.now() + 600;
    pendingRestoreTop.current = null;   // a deliberate jump outranks a pixel restore
    pendingScroll.current = iso;
  };
  // runs after every render, so a date that needed paging in first still lands
  React.useEffect(() => {
    const iso = pendingScroll.current;
    if (!iso) return;
    const node = dayEls.current[iso];
    if (!node || !streamRef.current) return;
    // coming back to the tab restores the exact pixel, not just the day
    streamRef.current.scrollTop = pendingRestoreTop.current !== null
      ? pendingRestoreTop.current
      : Math.max(0, node.offsetTop - 6);
    pendingRestoreTop.current = null;
    pendingScroll.current = null;
    spyLock.current = Date.now() + 400;
  });

  const lastTop = React.useRef(0);
  const draggingRef = React.useRef(false);
  const onStreamScroll = (e) => {
    const el = e.currentTarget;
    // Stretching the calendar moves the record down, and the browser reports
    // that as a scroll. Treating it as one folded the month shut the instant it
    // opened. Only a real change of position counts, and never while a gesture
    // is live.
    const moved = Math.abs(el.scrollTop - lastTop.current);
    lastTop.current = el.scrollTop;
    CAL_KEEP.scrollTop = el.scrollTop;   // the keep follows every scroll
    if (draggingRef.current || moved < 3) return;
    if (!atEpoch && el.scrollTop + el.clientHeight > el.scrollHeight - STREAM_LEAD) {
      setDayCount(c => c + STREAM_PAGE);
    }
    if (Date.now() < spyLock.current) return;
    // a scroll of the parent's own making folds the month back to the strip
    // (the graph is untouched: its state belongs to the swipe and the icon)
    if (tRef.current > 0) tween([[setT, tRef.current, 0]]);
    const top = el.scrollTop + 14;
    let found = null;
    for (const iso of streamDates) {
      const node = dayEls.current[iso];
      if (!node) continue;
      if (node.offsetTop <= top) found = iso; else break;
    }
    if (found && found !== anchorISO) setAnchorISO(found);
  };

  // ---- the gesture engine ----
  // Row height is MEASURED off a real cell, so the fold is right at every text
  // size and screen width. Until it is measured the fold stays auto, which
  // renders the whole month rather than a guessed sliver.
  const GAP = 6;
  const [rowH, setRowH] = React.useState(0);
  const [graphH, setGraphH] = React.useState(0);
  const [legendH, setLegendH] = React.useState(0);
  const foldRef = React.useRef(null);
  const graphInnerRef = React.useRef(null);
  const legendInnerRef = React.useRef(null);
  // Heights are kept FRACTIONAL end to end. Rounding the cell height clipped
  // the top of the day rings on the strip: the real cell is (width - gaps)/7,
  // e.g. 40.857px, and a rounded 41 makes the fold's translate overshoot by
  // the accumulated error, worse the lower the anchor's week sits in the month
  // (founder caught the shaved rings on his phone, 14 Aug). The 0.25px epsilon
  // stops sub-pixel measurement jitter re-rendering forever.
  React.useLayoutEffect(() => {
    if (!nav.plus) return;
    const cell = foldRef.current && foldRef.current.querySelector('button');
    if (cell) {
      const h = cell.getBoundingClientRect().height;
      if (h && Math.abs(h - rowH) > 0.25) setRowH(h);
    }
    const gh = graphInnerRef.current ? graphInnerRef.current.getBoundingClientRect().height : 0;
    if (gh && Math.abs(gh - graphH) > 0.25) setGraphH(gh);
    const lh = legendInnerRef.current ? legendInnerRef.current.getBoundingClientRect().height : 0;
    if (lh && Math.abs(lh - legendH) > 0.25) setLegendH(lh);
  });
  const fullH = rowH ? rowH * 6 + GAP * 5 : 0;
  const weekRow = (() => {
    const first = new Date(anchorDateOf(anchorISO).getFullYear(), anchorDateOf(anchorISO).getMonth(), 1);
    const lead = J.weekLead(first);
    return Math.floor((lead + anchorDateOf(anchorISO).getDate() - 1) / 7);
  })();

  // The settle after a release is the ONLY animation on these two numbers, and
  // it runs in JS because the value it starts from is wherever the finger left.
  // It takes PAIRS ([setter, from, to], ...) because the graph swipe and the
  // icon's hide both move g and t together in one bounce; two separate tweens
  // would cancel each other through the shared raf handle.
  const tweenRef = React.useRef(null);
  const tween = (pairs) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { pairs.forEach(([set, , to]) => set(to)); return; }
    let t0 = null;
    const step = (ts) => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 240);
      const e = 1 - Math.pow(1 - k, 3);
      pairs.forEach(([set, from, to]) => set(from + (to - from) * e));
      if (k < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  };
  React.useEffect(() => () => { if (tweenRef.current) cancelAnimationFrame(tweenRef.current); }, []);

  // THE GRAB LINE stretches and compresses the calendar, one to one, and ONLY
  // the calendar ("using the line can expand calendar or compress calendar
  // without graph", founder 14 Aug). A tap on it toggles the fold.
  const handleRef = React.useRef(null);
  const draggedRef = React.useRef(false);
  const tRef = React.useRef(0); tRef.current = t;
  React.useEffect(() => {
    const el = handleRef.current;
    if (!el || !nav.plus || !fullH) return undefined;
    let from = null;
    const span = Math.max(1, fullH - rowH);
    const down = (ev) => {
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      from = { y: ev.clientY, t0: tRef.current }; draggingRef.current = true;
    };
    const move = (ev) => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      if (Math.abs(dy) > 4) draggedRef.current = true;   // a drag must not also read as a tap
      setT(Math.max(0, Math.min(1, from.t0 + dy / span)));
    };
    const up = () => {
      if (!from) return;
      const now = tRef.current; from = null;
      tween([[setT, now, now > 0.5 ? 1 : 0]]);
      setTimeout(() => { draggingRef.current = false; }, 320);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, [nav.plus, fullH, rowH]);

  // Stash the state in the keep so the tab comes back AS IT WAS from
  // anywhere: a pushed note, another tab, Settings, a theme change.
  React.useEffect(() => {
    if (!nav.plus) return;
    CAL_KEEP.t = calOpen ? 1 : 0;
    CAL_KEEP.g = graphOpen ? 1 : 0;
    CAL_KEEP.anchor = anchorISO;
    CAL_KEEP.dayCount = dayCount;
  }, [calOpen, graphOpen, anchorISO, dayCount]);

  // THE GRAPH SWIPE (founder, 14 Aug): swiping the graph up begins to tuck it
  // behind the calendar WHILE the calendar compresses, both tracking the one
  // finger; let go and it bounces to the nearest state, hidden (the record
  // shows below the compressed calendar) or back out. The same drag downward
  // brings it back. One shared span so both land together. The zone carries
  // touch-action: none, so the browser can never claim the gesture mid-swipe
  // (the 13 Aug pointercancel lesson), and every release path unlatches
  // draggingRef (the 13 Aug latch lesson).
  const gRef = React.useRef(0); gRef.current = g;
  const graphZoneRef = React.useRef(null);
  React.useEffect(() => {
    const el = graphZoneRef.current;
    if (!el || !nav.plus) return undefined;
    const span = Math.max(120, Math.max(graphH || 0, Math.max(1, fullH - rowH)));
    let from = null;
    const down = (ev) => {
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      from = { y: ev.clientY, g0: gRef.current, t0: tRef.current }; draggingRef.current = true;
    };
    const move = (ev) => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      setG(Math.max(0, Math.min(1, from.g0 + dy / span)));
      setT(Math.max(0, Math.min(1, from.t0 + dy / span)));
    };
    const up = () => {
      if (!from) return;
      from = null;
      // THE PHYSICS OF JOTLA (founder, 14 Aug): on release, everything that
      // slides settles to its own nearest half, each axis for itself. The
      // first version restored the calendar to where the gesture began, and
      // dragging the graph down past halfway snapped the month shut again.
      tween([[setG, gRef.current, gRef.current > 0.5 ? 1 : 0], [setT, tRef.current, tRef.current > 0.5 ? 1 : 0]]);
      setTimeout(() => { draggingRef.current = false; }, 320);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, [nav.plus, graphH, fullH, rowH]);

  // THE PULL LADDER (founder, 14 Aug): at the very top of the record, pulling
  // the notes down opens the calendar with the finger; from an open calendar
  // the next pull begins to untuck the graph; one long pull chains through
  // both, the surplus flowing on. A pull only ever OPENS (closing is the
  // scroll, the tuck and the icon), and on release each axis settles to its
  // own nearest half. An upward move with nothing driven stays an ordinary
  // scroll. The touchmove claim keeps the browser's pan and pull-to-refresh
  // off a live pull (the 13 Aug pointercancel lesson), and every release
  // path unlatches draggingRef (the 13 Aug latch lesson).
  React.useEffect(() => {
    const el = streamRef.current;
    if (!el || !nav.plus) return undefined;
    const spanT = Math.max(120, fullH - rowH);
    const spanG = Math.max(120, graphH || 160);
    let from = null;
    const down = (ev) => {
      if (el.scrollTop > 0) return;
      from = { y: ev.clientY, t0: tRef.current, g0: gRef.current, engaged: false };
      draggingRef.current = true;
    };
    const move = (ev) => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      if (!from.engaged) {
        if (dy <= 0) { from = null; draggingRef.current = false; return; }   // ordinary scrolling
        if (dy <= 4) return;
        from.engaged = true;
      }
      const d = Math.max(0, dy);
      const tNext = Math.max(from.t0, Math.min(1, from.t0 + d / spanT));
      const usedT = (tNext - from.t0) * spanT;
      setT(tNext);
      if (from.g0 < 1) setG(Math.max(from.g0, Math.min(1, from.g0 + Math.max(0, d - usedT) / spanG)));
    };
    const up = () => {
      if (!from) return;
      from = null;
      tween([[setT, tRef.current, tRef.current > 0.5 ? 1 : 0], [setG, gRef.current, gRef.current > 0.5 ? 1 : 0]]);
      setTimeout(() => { draggingRef.current = false; }, 320);
    };
    const claim = (ev) => {
      if (!from || !from.engaged || !ev.cancelable) return;
      ev.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('touchmove', claim, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.removeEventListener('touchmove', claim);
    };
  }, [nav.plus, fullH, rowH, graphH]);

  // COMPRESSED, THE STRIP PAGES WEEK BY WEEK (founder, 14 Aug): a horizontal
  // swipe moves the record seven days, clamped to the epoch and today, and
  // the record follows. The month pager underneath is parked and silent while
  // the calendar is folded (its overflow goes hidden), so the gesture is ours
  // and a swipe can never jump a whole month from the strip.
  React.useEffect(() => {
    const el = foldRef.current;
    if (!el || !nav.plus) return undefined;
    let from = null;
    const down = (ev) => { if (tRef.current > 0.5) return; from = { x: ev.clientX, y: ev.clientY, done: false }; };
    const move = (ev) => {
      if (!from || from.done) return;
      const dx = ev.clientX - from.x, dy = ev.clientY - from.y;
      if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      from.done = true;
      const dir = dx < 0 ? 1 : -1;   // swiping left walks forward in time
      let iso = J.isoShift(anchorRef.current, dir * 7);
      if (iso > J.TODAY_ISO) iso = J.TODAY_ISO;
      if (iso < window.MIN_LOG_DAY) iso = window.MIN_LOG_DAY;
      if (iso !== anchorRef.current) scrollToDate(iso);
    };
    const up = () => { from = null; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, [nav.plus]);

  // THE PAGER MUST BE RE-PARKED whenever the shown offset moves under it
  // programmatically (11 Aug bug: a rebuilt scroller starts at panel zero,
  // September 2019, while the title says 2026).
  React.useLayoutEffect(() => {
    if (!nav.plus) return;
    const park = () => {
      const el = pagerRef.current;
      if (!el || !el.clientWidth) return false;
      el.scrollLeft = (targetRef.current - minOffset) * el.clientWidth;
      return true;
    };
    if (!park()) requestAnimationFrame(park);
  }, [nav.plus, calOpen, offset]);

  // THE STRIP SHOWS THE MONTH BEING READ (13 Aug arena catch). While the
  // calendar is compressed, the pager follows the anchor's month, so the week
  // on screen is always the week of the record's top. With the month open the
  // parent may swipe freely; folding it back re-syncs here. The park itself
  // happens in the effect above, which re-runs when the adopt lands.
  React.useLayoutEffect(() => {
    if (!nav.plus || calOpen) return;
    const a = anchorDateOf(anchorISO);
    const off = Math.max(minOffset, Math.min(0,
      (a.getFullYear() * 12 + a.getMonth()) - (today.getFullYear() * 12 + today.getMonth())));
    if (off !== targetRef.current) adopt(off);
  }, [nav.plus, calOpen, anchorISO]);

  const anchorDate = anchorDateOf(anchorISO);
  // Compressed, the title names the month being READ (the anchor's). Open, the
  // parent can swipe the grid to other months, and the title must follow the
  // grid it sits above, not the record underneath (13 Aug arena catch).
  const plusLabel = calOpen ? monthLabel : `${J.MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  const toggleCal = () => {
    if (calOpen) { tween([[setT, t, 0]]); return; }
    const off = (anchorDate.getFullYear() * 12 + anchorDate.getMonth()) - (today.getFullYear() * 12 + today.getMonth());
    adopt(Math.max(minOffset, Math.min(0, off)));
    tween([[setT, t, 1]]);
  };
  // The graph icon (founder, 14 Aug): pressing it makes the graph come out for
  // the month you are on, the calendar staying as it is; pressing it while the
  // graph is out is "the same outcome" as the tuck swipe, so it hides the
  // graph AND compresses the calendar.
  const graphBtn = nav.plus ? (
    <button className="j-iconbtn" data-graph-toggle aria-pressed={graphOpen}
      aria-label={graphOpen ? 'Hide the graph' : 'Show the graph'}
      onClick={() => {
        if (gRef.current > 0.5) tween([[setG, gRef.current, 0], [setT, tRef.current, 0]]);
        else tween([[setG, gRef.current, 1]]);
      }}>
      <Icon name="bars" size={22} color="var(--muted)" />
    </button>
  ) : null;
  // The rewind clock (founder, 14 Aug): back to the default view, today at the
  // top, calendar open, graph out. Grey and inert while the parent is already
  // there; it wakes the moment the date, the month or the look moves.
  const atDefault = anchorISO === J.TODAY_ISO && calOpen && graphOpen && offset === 0;
  const jumpToToday = () => {
    adopt(0);
    scrollToDate(J.TODAY_ISO);
    tween([[setT, tRef.current, 1], [setG, gRef.current, 1]]);
  };
  const rewindBtn = nav.plus ? (
    <button className="j-iconbtn" data-rewind disabled={atDefault}
      aria-label="Back to today" onClick={jumpToToday}
      // snugged to the graph icon so the pair reads as one control group
      // (founder, 14 Aug: "it feels isolated on its own")
      style={{ opacity: atDefault ? 0.35 : 1, cursor: atDefault ? 'default' : 'pointer', marginRight: -14 }}>
      <Icon name="rewind" size={21} color={atDefault ? 'var(--faint)' : 'var(--muted)'} />
    </button>
  ) : null;
  // on Plus a calendar tap moves the record; on free it opens the day.
  // Tapping a FADED neighbour day hands the month over (founder, 14 Aug:
  // "until a date on that month is picked"): the pager pages to that month,
  // its days go full, and the month just left fades in its lead and tail.
  const pickDay = (iso, out) => {
    if (!nav.plus) { nav.go('day', { date: iso }); return; }
    if (out) {
      const d = J.parseISO(iso);
      const off = (d.getFullYear() * 12 + d.getMonth()) - (today.getFullYear() * 12 + today.getMonth());
      adopt(Math.max(minOffset, Math.min(0, off)));
    }
    scrollToDate(iso);
  };

  const dowRow = (
    <div className="j-caldows">
      {dows.map((d, i) => <span key={i}>{d}</span>)}
    </div>
  );
  const pagerEl = (
        <div ref={pagerRef} onScroll={onPagerScroll} className="j-pager" {...pagerKeyProps(pagerRef, 'Calendar months')}
          style={{ display: 'flex',
          // folded on Plus, the native month swipe is parked: the strip pages
          // week by week through its own gesture instead (founder, 14 Aug)
          overflowX: (nav.plus && !calOpen) ? 'hidden' : 'auto',
          touchAction: (nav.plus && !calOpen) ? 'none' : undefined,
          overflowY: 'hidden', WebkitOverflowScrolling: 'touch', outline: 'none' }}>
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
                  // free keeps the blanks it has always had (the 11 Aug lock)
                  if (c.out && !nav.plus) return <div key={'blank-' + idx} style={{ aspectRatio: '1 / 1' }} />;
                  // On Plus the day being read wears the accent, and it travels
                  // with the record as the parent scrolls. The founder's 14 Aug
                  // styling: a THIN stroke ring and the number in blue, nothing
                  // filled, so the day keeps its mood tint and dot underneath.
                  const isAnchor = nav.plus && c.iso === anchorISO;
                  const tint = c.mood ? window.moodTint(c.mood) : 'transparent';
                  const ink = isAnchor ? 'var(--blue)' : (c.mood ? window.MOOD_COLOURS[c.mood] : (c.future ? 'var(--line)' : 'var(--faint)'));
                  // Every past day and today opens the Day view, notes or
                  // not (12 Jul 2026); only future days stay inert.
                  const tappable = !c.future;
                  return (
                    <button key={c.iso} onClick={() => tappable && pickDay(c.iso, c.out)}
                      className={tappable ? 'j-press' : ''} disabled={!tappable}
                      data-anchor={isAnchor ? 'true' : undefined}
                      data-out={c.out ? 'true' : undefined}
                      aria-label={c.future
                        ? `${c.d} ${J.MONTH_NAMES[c.m]} ${c.y}, in the future`
                        : `${c.d} ${J.MONTH_NAMES[c.m]} ${c.y}, ${c.count > 0 ? c.count + (c.count === 1 ? ' note' : ' notes') : 'no note'}`}
                      style={{ aspectRatio: '1 / 1', borderRadius: '50%', cursor: tappable ? 'pointer' : 'default',
                        border: 'none',
                        boxShadow: c.isToday ? 'inset 0 0 0 1.5px var(--blue)' : (isAnchor ? 'inset 0 0 0 1px var(--blue)' : 'none'),
                        background: tint, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                        // a neighbouring month's day is visible but clearly not
                        // the month being read (founder, 14 Aug: "not completely
                        // but enough to notice")
                        opacity: c.out ? 0.38 : (c.future ? 0.55 : 1) }}>
                      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: c.isToday ? 600 : 500, fontSize: 'calc(15px * var(--tscale, 1))', color: (c.isToday || isAnchor) ? 'var(--blue)' : ink }}>{c.d}</span>
                      {c.mood && <MoodDot mood={c.mood} size={6} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
  );
  const calendarCard = (
      <div className="j-card" style={{ padding: 14, overflow: 'hidden' }}>
        {dowRow}
        {pagerEl}
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

  // ---- PLUS: the one surface (founder, 14 Aug). The inset card ALWAYS, the
  // title on the page background, the grab line on the card, the legend and
  // the graph folding beneath it as their own layers, and the record
  // streaming under everything. Never a full-bleed panel. ----
  if (nav.plus) {
    const foldH = rowH ? rowH + (fullH - rowH) * t : undefined;
    return (
      <div className="j-screen" data-cal-mode="unified">
        <div style={{ flexShrink: 0 }} data-cal-pinned>
          <div className="j-pad" style={{ paddingTop: 10 }}>
            {/* month year > : the whole label is the fold toggle, and the arrow
                turns to point down while the calendar is open (founder, 14 Aug) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <button className="j-press" data-cal-open onClick={toggleCal}
                aria-expanded={calOpen} aria-label={(calOpen ? 'Fold' : 'Open') + ' the calendar'}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <h1 className="j-h1" style={{ fontSize: 'calc(28px * var(--tscale, 1))' }}>{plusLabel}</h1>
                <span className={'j-calarrow' + (calOpen ? ' j-open' : '')} aria-hidden="true">
                  <Icon name="chevronRight" size={20} color="var(--muted)" />
                </span>
              </button>
              <div style={{ height: 'calc(30px * var(--tscale, 1))', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                {rewindBtn}{graphBtn}
              </div>
            </div>
            <div className="j-card" data-cal-card style={{ padding: '14px 14px 0', overflow: 'hidden' }}>
              {dowRow}
              {/* the fold: the month, folded down to the anchor's week. The
                  grid inside slides so the week left standing is the one
                  being read. */}
              <div className="j-calfold" ref={foldRef} data-cal-fold style={{ height: foldH }}>
                <div style={{ transform: `translateY(${-(1 - t) * weekRow * (rowH + GAP)}px)` }}>
                  {pagerEl}
                </div>
              </div>
              {/* the grab line: on the card, always, and it is the control,
                  not decoration (founder, 11 + 14 Aug) */}
              <button className="j-calhandle" ref={handleRef} data-cal-handle
                aria-label={calOpen ? 'Fold the calendar to one week' : 'Stretch the calendar to the month'}
                onClick={() => { if (draggedRef.current) { draggedRef.current = false; return; } toggleCal(); }}><span /></button>
            </div>
            {/* the legend belongs to the full month view, so it folds with t */}
            <div data-legend-fold style={{ height: legendH ? legendH * t : (t > 0.5 ? undefined : 0), opacity: t, overflow: 'hidden' }}>
              <div ref={legendInnerRef} style={{ overflow: 'hidden' }}>{legendRow}</div>
            </div>
            {/* the graph: its OWN card, separate from the calendar area, and
                it tucks away upward behind it as g falls. Always the month
                being read (the anchor's). */}
            <div className="j-graphfold" data-graph-fold ref={graphZoneRef}
              style={{ height: graphH ? graphH * g : (g > 0.5 ? undefined : 0), opacity: 0.25 + 0.75 * g }}>
              <div ref={graphInnerRef} style={{ overflow: 'hidden', transform: `translateY(${graphH ? -((1 - g) * graphH) : 0}px)` }}>
                <MonthMoodGraph entries={entries} year={anchorDate.getFullYear()} month={anchorDate.getMonth()} />
              </div>
            </div>
          </div>
        </div>
        {/* position: relative makes the SCROLLER the offsetParent, so a day's
            offsetTop is its place in the record and nothing else. Without it,
            offsets were measured from the screen and silently included the
            pinned block's CURRENT height, so a tap overshot by that height and
            the strip's highlight drifted days off the true top whenever the
            calendar folded (14 Aug arena catch). */}
        <div className="j-scroll j-fade j-streamfade" ref={streamRef} onScroll={onStreamScroll} data-stream
          style={{ position: 'relative' }}>
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

  // ---- FREE: the Month tab exactly as it has always been (the 11 Aug lock:
  // "in the free version how it is right now is unchanged"), chevrons and all ----
  return (
    <div className="j-screen" data-cal-mode="simple">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 120 }}>
          <TabTitle title={monthLabel}
            right={<div style={{ display: 'flex', gap: 8 }}>{monthNavBtn('prev')}{monthNavBtn('next')}</div>} />
          {calendarCard}
          {legendRow}
          <PatternsLockedPreview onOpen={() => nav.go('unlock')} />
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
