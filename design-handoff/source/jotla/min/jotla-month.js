function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// jotla-month.jsx: Month calendar (tab) and Day detail (push).
const {
  useState: useStateM
} = React;
function TabTitle({
  title,
  sub,
  right
}) {
  // One top line app-wide (founder, 7 Aug): the title starts at the pad's own
  // top on every tab, never pushed down by the 44px corner button. The corner
  // slot is capped to the title's line height and the button centres inside
  // it, overflowing equally above and below (it is transparent, so the
  // overflow is invisible and the tap target stays full size).
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "j-h1",
    style: {
      fontSize: 'calc(28px * var(--tscale, 1))'
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 4
    }
  }, sub)), right && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'calc(30px * var(--tscale, 1))',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0
    }
  }, right));
}

// Plus: the shown month as the same bar graph the Today page draws, four bars
// since 16 Jul 2026: Good / Mixed / Hard days in the static mood colours, then
// Dysregulation moments in their own plum (LAST, with its label tucked to the
// right edge, exactly as the Today strip), and the plain summary sentence. The
// counting rule lives with kindBarBlocks in jotla-ui.jsx: mood bars count DAYS,
// the Dysregulation bar counts MOMENTS.
function MonthMoodGraph({
  entries,
  year,
  month
}) {
  const J = window.JOTLA;
  const pre = `${year}-${String(month + 1).padStart(2, '0')}-`;
  let good = 0,
    ok = 0,
    hard = 0;
  const dim = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) {
    const m = J.dayMood(entries.filter(e => e.date === pre + String(d).padStart(2, '0')));
    if (m === 'good') good++;else if (m === 'ok') ok++;else if (m === 'hard') hard++;
  }
  const monthEntries = entries.filter(e => e.date.startsWith(pre));
  const dysreg = monthEntries.filter(e => e.type === 'handover' || e.category === 'Incidents').length;
  const blocks = window.kindBarBlocks({
    good,
    ok,
    hard,
    dysreg
  });
  const maxN = Math.max(good, ok, hard, dysreg, 1);
  const hc = {};
  monthEntries.forEach(e => {
    if (e.mood === 'hard' && e.category) hc[e.category] = (hc[e.category] || 0) + 1;
  });
  const top = Object.entries(hc).sort((a, b) => b[1] - a[1])[0];
  const hardCount = monthEntries.filter(e => e.mood === 'hard').length;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 18,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-h3"
  }, "How ", J.MONTH_NAMES[month], " looked"), /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: '#6E54D6',
      color: '#fff'
    }
  }, "Plus")), /*#__PURE__*/React.createElement(KindBars, {
    blocks: blocks,
    maxN: maxN
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 16
    }
  }, monthEntries.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, monthEntries.length, " ", monthEntries.length === 1 ? 'entry' : 'entries', " this month", hardCount ? `, ${hardCount} on hard days` : '', "."), ' ', top ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, top[0]), " entries come up most often as the hard moments.") : hardCount === 0 ? dysreg > 0
  // Dysregulation moments can carry a good or mixed mood, so
  // "no hard moments" alone would sit dishonestly next to a
  // plum bar with a count in it.
  ? `${dysreg} dysregulation ${dysreg === 1 ? 'moment' : 'moments'} logged, none marked as a hard moment.` : 'No hard moments logged. Long may it last.'
  // Hard moments with no theme tagged: saying "no hard moments"
  // here would be a false claim, so count them honestly.
  : `${hardCount} hard ${hardCount === 1 ? 'moment' : 'moments'} logged, not tagged to a theme.`) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Nothing logged in ", J.MONTH_NAMES[month], "."), " Swipe the calendar to move between months.")));
}

// Free: the locked patterns preview (redesign, 6 Aug). The analytics SHAPE sits
// blurred behind a soft veil carrying the solid gold crown and the feature line;
// tapping anywhere opens the Jotla Plus page (the crown gate). The bars are a
// shape preview, unreadable by design, never presented as this month's data.
function PatternsLockedPreview({
  onOpen
}) {
  const bars = [['68%', 'var(--green)'], ['40%', 'var(--green)'], ['88%', 'var(--red)'], ['52%', 'var(--amber)'], ['80%', 'var(--red)'], ['44%', 'var(--green)'], ['58%', 'var(--amber)'], ['36%', 'var(--green)'], ['64%', 'var(--green)'], ['84%', 'var(--red)'], ['48%', 'var(--amber)'], ['40%', 'var(--green)'], ['76%', 'var(--red)'], ['56%', 'var(--green)']];
  const dys = ['40%', '22%', '78%', '45%', '95%', '28%', '55%', '22%', '70%', '90%', '35%', '25%', '82%', '48%'];
  return /*#__PURE__*/React.createElement("button", {
    onClick: onOpen,
    className: "j-press",
    "aria-label": "Month patterns, part of Jotla Plus",
    style: {
      position: 'relative',
      width: '100%',
      border: '1px solid var(--line)',
      borderRadius: 16,
      overflow: 'hidden',
      background: 'var(--card)',
      marginTop: 18,
      padding: 0,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      filter: 'blur(7px)',
      opacity: 0.8,
      padding: '16px 16px 14px',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 5,
      height: 70
    }
  }, bars.map(([h, c], i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: h,
      background: c,
      borderRadius: 3
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 5,
      height: 34,
      marginTop: 8
    }
  }, dys.map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: h,
      background: 'var(--dysreg)',
      borderRadius: 3
    }
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 10,
      marginBottom: 0
    }
  }, "9 good \xB7 4 mixed \xB7 5 hard \xB7 6 dysregulation")), /*#__PURE__*/React.createElement("span", {
    className: "j-patveil",
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 22,
    color: "var(--gold)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, "Month patterns"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      color: 'var(--muted)'
    }
  }, "The mood graph, counts and hard-day patterns.")));
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
const STREAM_PAGE = 21; // days paged in at a time
const STREAM_LEAD = 480; // px from the end of the stream that triggers the next page

// THE MONTH TAB COMES BACK EXACTLY AS IT WAS LEFT (founder, 14 Aug: "let it be
// how I left it always. I'll reset it myself if I must" - the rewind clock is
// that reset). This keep lives at module level, above the screen, so switching
// tabs, visiting Settings or changing the theme cannot lose the place; a cold
// start begins fresh at today, on purpose. ONE KEEP PER CHILD (founder, 14 Aug
// round 7 follow-up): the module holds a map keyed by profile, the screen
// picks its own child's keep at mount (screens remount on a profile switch,
// keyed in the app shell), so each child's Month is exactly as it was left.
const CAL_KEEPS = {};

// The compressed calendar IS the week strip: the same grid, folded down to the
// one row holding the anchor. A separate strip component was the first build
// and it is gone, because two components cannot stretch into each other while
// tracking a finger. The row height is measured from a real cell, never
// assumed, since cells are aspect-ratio squares in a 7-column grid and their
// size follows the screen and the parent's text-size setting.
// One day in the stream. A day with nothing on it is not a dead row: it offers
// the note, exactly as the Day screen does, preset to that date.
function StreamDay({
  iso,
  list,
  nav,
  hostRef
}) {
  const J = window.JOTLA;
  const mood = J.dayMood(list);
  const label = iso === J.TODAY_ISO ? 'Today' : iso === J.isoShift(J.TODAY_ISO, -1) ? 'Yesterday' : J.fmtLong(iso);
  return /*#__PURE__*/React.createElement("section", {
    className: 'j-daysec' + (list.length ? ' j-hasnotes' : ''),
    "data-day": iso,
    ref: hostRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-daysec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-h3",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    }
  }, label), mood && /*#__PURE__*/React.createElement(MoodDot, {
    mood: mood,
    size: 8
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), list.length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "j-meta"
  }, list.length, " ", list.length === 1 ? 'note' : 'notes')), list.length ? /*#__PURE__*/React.createElement(LogList, {
    list: list,
    nav: nav
  }) : /*#__PURE__*/React.createElement("button", {
    className: "j-emptyday j-press",
    onClick: () => nav.go('quicklog', {
      date: iso
    }),
    "aria-label": 'Add a note for ' + J.fmtLong(iso)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    color: "var(--faint)"
  }), " Add a note"));
}
function MonthScreen({
  nav,
  entries,
  view
}) {
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
  const [offset, setOffset] = React.useState(typeof remembered === 'number' && isFinite(remembered) ? Math.max(minOffset, Math.min(0, Math.trunc(remembered))) : 0);

  // Month metadata + calendar cells for any offset from the current month.
  // Always exactly six week rows (42 cells), whatever the month's shape, so
  // the calendar card never resizes and nothing below it ever moves when the
  // month changes (12 Jul 2026). The lead-in and tail hold the neighbouring
  // months' real days now (founder, 14 Aug): on Plus they render FADED, and
  // tapping one hands the selection to that month; on free they stay the
  // blanks they have always been (the 11 Aug lock). The first column follows
  // the week-start setting.
  const monthMeta = off => {
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
      return {
        d: dt.getDate(),
        iso,
        out,
        m: dt.getMonth(),
        y: dt.getFullYear(),
        mood: J.dayMood(dayEntries),
        count: dayEntries.length,
        future: iso > J.TODAY_ISO,
        isToday: iso === J.TODAY_ISO
      };
    };
    const cells = [];
    for (let i = firstDow - 1; i >= 0; i--) cells.push(cellOf(new Date(year, month, -i), true));
    for (let d = 1; d <= daysInMonth; d++) cells.push(cellOf(new Date(year, month, d), false));
    let nx = 1;
    while (cells.length < 42) {
      cells.push(cellOf(new Date(year, month + 1, nx), true));
      nx++;
    }
    return {
      year,
      month,
      isCurrent,
      canBack,
      cells
    };
  };
  const cur = monthMeta(offset);
  const {
    year,
    month,
    isCurrent
  } = cur;
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
  const adopt = target => {
    targetRef.current = target;
    setOffset(o => target === o ? o : target);
  };
  React.useEffect(() => {
    nav.remember({
      monthOffset: offset
    });
  }, [offset]);
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
  const move = delta => {
    const el = pagerRef.current;
    const next = Math.max(minOffset, Math.min(0, targetRef.current + delta));
    if (next === targetRef.current || !el || !el.clientWidth) return;
    targetRef.current = next;
    el.scrollTo({
      left: (next - minOffset) * el.clientWidth,
      behavior: 'smooth'
    });
  };
  const monthNavBtn = dir => {
    const enabled = dir === 'prev' ? cur.canBack : !isCurrent;
    return /*#__PURE__*/React.createElement("button", {
      key: dir,
      onClick: () => enabled && move(dir === 'prev' ? -1 : 1),
      disabled: !enabled,
      "aria-label": dir === 'prev' ? 'Previous month' : 'Next month',
      className: "j-press",
      style: {
        width: 44,
        height: 44,
        borderRadius: 14,
        border: 'none',
        background: 'var(--chip-bg)',
        boxShadow: 'var(--card-shadow)',
        cursor: enabled ? 'pointer' : 'default',
        opacity: enabled ? 1 : 0.4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: dir === 'prev' ? 'chevronLeft' : 'chevronRight',
      size: 20,
      color: enabled ? 'var(--blue)' : 'var(--faint)'
    }));
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
  const anchorDateOf = iso => J.parseISO(iso);
  const backTo = iso => Math.round((J.parseISO(J.TODAY_ISO) - J.parseISO(iso)) / 86400000);
  // this child's own keep; every CAL_KEEP reference below reads and writes it
  const CAL_KEEP = CAL_KEEPS[nav.profileId] || (CAL_KEEPS[nav.profileId] = {});
  const [t, setT] = React.useState(typeof CAL_KEEP.t === 'number' ? CAL_KEEP.t : 1);
  const [g, setG] = React.useState(typeof CAL_KEEP.g === 'number' ? CAL_KEEP.g : 1);
  const graphOpen = g > 0.5;
  const calOpen = t > 0.5;
  const [anchorISO, setAnchorISO] = React.useState(CAL_KEEP.anchor || J.TODAY_ISO);
  const [dayCount, setDayCount] = React.useState(() => Math.max(CAL_KEEP.dayCount || 0, CAL_KEEP.anchor ? Math.max(STREAM_PAGE, backTo(CAL_KEEP.anchor) + 2 + STREAM_PAGE) : STREAM_PAGE));
  const streamRef = React.useRef(null);
  const dayEls = React.useRef({});
  const spyLock = React.useRef(0); // a scroll WE caused must not feed back into the strip
  const pendingScroll = React.useRef(CAL_KEEP.anchor || null);
  // an exact pixel restore beats an anchor-top restore when coming back
  const pendingRestoreTop = React.useRef(typeof CAL_KEEP.scrollTop === 'number' ? CAL_KEEP.scrollTop : null);
  const anchorRef = React.useRef(J.TODAY_ISO);
  anchorRef.current = anchorISO;
  const byDate = React.useMemo(() => {
    const m = {};
    entries.forEach(e => {
      (m[e.date] = m[e.date] || []).push(e);
    });
    return m;
  }, [entries]);

  // Today first, one day at a time backwards, stopping at the data epoch.
  const streamDates = React.useMemo(() => {
    const out = [];
    let iso = J.TODAY_ISO;
    for (let i = 0; i < dayCount && iso >= window.MIN_LOG_DAY; i++) {
      out.push(iso);
      iso = J.isoShift(iso, -1);
    }
    return out;
  }, [dayCount]);
  const atEpoch = streamDates.length < dayCount;
  const scrollToDate = iso => {
    const back = backTo(iso);
    // functional and monotonic: this runs from gesture closures that can hold
    // a stale dayCount, and the stream must never shrink under the reader
    setDayCount(c => Math.max(c, back + 2 + STREAM_PAGE));
    setAnchorISO(iso);
    spyLock.current = Date.now() + 600;
    pendingRestoreTop.current = null; // a deliberate jump outranks a pixel restore
    pendingScroll.current = iso;
  };
  // runs after every render, so a date that needed paging in first still lands
  React.useEffect(() => {
    const iso = pendingScroll.current;
    if (!iso) return;
    const node = dayEls.current[iso];
    if (!node || !streamRef.current) return;
    // coming back to the tab restores the exact pixel, not just the day
    streamRef.current.scrollTop = pendingRestoreTop.current !== null ? pendingRestoreTop.current : Math.max(0, node.offsetTop - 6);
    pendingRestoreTop.current = null;
    pendingScroll.current = null;
    spyLock.current = Date.now() + 400;
  });
  const lastTop = React.useRef(0);
  const draggingRef = React.useRef(false);
  const onStreamScroll = e => {
    const el = e.currentTarget;
    // Stretching the calendar moves the record down, and the browser reports
    // that as a scroll. Treating it as one folded the month shut the instant it
    // opened. Only a real change of position counts, and never while a gesture
    // is live.
    const moved = Math.abs(el.scrollTop - lastTop.current);
    lastTop.current = el.scrollTop;
    CAL_KEEP.scrollTop = el.scrollTop; // the keep follows every scroll
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
      if (node.offsetTop <= top) found = iso;else break;
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
  // would cancel each other through the shared raf handle. onDone fires once
  // the settle lands (the week strip commits its page there).
  const tweenRef = React.useRef(null);
  const tween = (pairs, onDone) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      pairs.forEach(([set,, to]) => set(to));
      if (onDone) onDone();
      return;
    }
    let t0 = null;
    const step = ts => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 240);
      const e = 1 - Math.pow(1 - k, 3);
      pairs.forEach(([set, from, to]) => set(from + (to - from) * e));
      if (k < 1) tweenRef.current = requestAnimationFrame(step);else if (onDone) onDone();
    };
    tweenRef.current = requestAnimationFrame(step);
  };
  React.useEffect(() => () => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
  }, []);

  // THE GRAB LINE stretches and compresses the calendar, one to one, and ONLY
  // the calendar ("using the line can expand calendar or compress calendar
  // without graph", founder 14 Aug). A tap on it toggles the fold.
  const handleRef = React.useRef(null);
  const draggedRef = React.useRef(false);
  const tRef = React.useRef(0);
  tRef.current = t;
  // MEASURED HEIGHTS RIDE REFS INTO EVERY GESTURE (arena catch, 14 Aug round
  // 4): the gesture effects used to list fullH / rowH / graphH as deps, and a
  // mid-drag re-measure tore the listeners down and re-subscribed, orphaning
  // the live gesture with no settle. The spans are read at pointerdown from
  // these refs instead, and the effects re-run only when the surface itself
  // appears or goes.
  const fullHRef = React.useRef(0);
  fullHRef.current = fullH;
  const rowHRef = React.useRef(0);
  rowHRef.current = rowH;
  const graphHRef = React.useRef(0);
  graphHRef.current = graphH;
  React.useEffect(() => {
    const el = handleRef.current;
    if (!el || !nav.plus) return undefined;
    let from = null;
    const down = ev => {
      if (!fullHRef.current) return; // not measured yet, nothing to drive
      // a grab lands on the surface WHERE IT IS: a settle still in flight is
      // cancelled so the fold cannot slide out from under a held finger
      // (arena catch, 14 Aug round 4)
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      try {
        el.setPointerCapture(ev.pointerId);
      } catch (e) {}
      from = {
        y: ev.clientY,
        t0: tRef.current,
        span: Math.max(1, fullHRef.current - rowHRef.current)
      };
      draggingRef.current = true;
    };
    const move = ev => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      if (Math.abs(dy) > 4) draggedRef.current = true; // a drag must not also read as a tap
      setT(Math.max(0, Math.min(1, from.t0 + dy / from.span)));
    };
    const up = () => {
      if (!from) return;
      const now = tRef.current;
      from = null;
      tween([[setT, now, now > 0.5 ? 1 : 0]]);
      setTimeout(() => {
        draggingRef.current = false;
      }, 320);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [nav.plus]);

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
  const gRef = React.useRef(0);
  gRef.current = g;
  // Test hook for the boot-and-assert suite only (the CrashProbe precedent):
  // lets a probe read the live fold fractions when diagnosing a gesture,
  // because heights alone cannot tell a stuck tween from a refused pull.
  window.__monthDebug = () => ({
    t: tRef.current,
    g: gRef.current,
    dragging: draggingRef.current
  });
  const graphZoneRef = React.useRef(null);
  React.useEffect(() => {
    const el = graphZoneRef.current;
    if (!el || !nav.plus) return undefined;
    let from = null;
    const down = ev => {
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current); // a grab holds what it grabs
      try {
        el.setPointerCapture(ev.pointerId);
      } catch (e) {}
      from = {
        y: ev.clientY,
        g0: gRef.current,
        t0: tRef.current,
        span: Math.max(120, Math.max(graphHRef.current || 0, Math.max(1, fullHRef.current - rowHRef.current)))
      };
      draggingRef.current = true;
    };
    const move = ev => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      setG(Math.max(0, Math.min(1, from.g0 + dy / from.span)));
      setT(Math.max(0, Math.min(1, from.t0 + dy / from.span)));
    };
    const up = () => {
      if (!from) return;
      from = null;
      // THE PHYSICS OF JOTLA (founder, 14 Aug): on release, everything that
      // slides settles to its own nearest half, each axis for itself. The
      // first version restored the calendar to where the gesture began, and
      // dragging the graph down past halfway snapped the month shut again.
      tween([[setG, gRef.current, gRef.current > 0.5 ? 1 : 0], [setT, tRef.current, tRef.current > 0.5 ? 1 : 0]]);
      setTimeout(() => {
        draggingRef.current = false;
      }, 320);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [nav.plus]);

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
    let from = null;
    // breadcrumbs land ONLY when the suite has armed window.__ladderTrace;
    // in normal use this is a dead branch (test hook, CrashProbe precedent)
    const trace = m => {
      if (window.__ladderTrace) window.__ladderTrace.push(m);
    };
    const down = ev => {
      if (el.scrollTop > 0) {
        trace('down-refused scrollTop=' + el.scrollTop);
        return;
      }
      from = {
        y: ev.clientY,
        t0: tRef.current,
        g0: gRef.current,
        engaged: false,
        spanT: Math.max(120, fullHRef.current - rowHRef.current),
        spanG: Math.max(120, graphHRef.current || 160)
      };
      trace('down t0=' + from.t0.toFixed(3) + ' g0=' + from.g0.toFixed(3) + ' spanT=' + from.spanT.toFixed(1) + ' spanG=' + from.spanG.toFixed(1));
      draggingRef.current = true;
    };
    const move = ev => {
      if (!from) {
        trace('move-no-from');
        return;
      }
      const dy = ev.clientY - from.y;
      if (!from.engaged) {
        if (dy <= 0) {
          trace('move-disarm dy=' + dy.toFixed(1));
          from = null;
          draggingRef.current = false;
          return;
        } // ordinary scrolling
        if (dy <= 4) return;
        from.engaged = true;
        trace('engaged dy=' + dy.toFixed(1));
        // CAPTURE, like every other gesture here (the one that did not, 14
        // Aug round 9 catch): the pull's own first frame grows the pinned
        // block and slides the record down, and without capture a MOUSE
        // pointer is suddenly over the pinned area, the move stream stops,
        // and the pull dies a few pixels in. Touch never showed it (touch
        // captures implicitly); a desktop tester's mouse hit it every time
        // the layout committed mid-pull.
        try {
          el.setPointerCapture(ev.pointerId);
        } catch (e) {}
        // the pull owns the surface from here: a settle still in flight
        // stops where it is (arena catch, 14 Aug round 4)
        if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      }
      const d = Math.max(0, dy);
      const tNext = Math.max(from.t0, Math.min(1, from.t0 + d / from.spanT));
      const usedT = (tNext - from.t0) * from.spanT;
      setT(tNext);
      if (from.g0 < 1) {
        const gNext = Math.max(from.g0, Math.min(1, from.g0 + Math.max(0, d - usedT) / from.spanG));
        trace('drive d=' + d.toFixed(1) + ' g=' + gNext.toFixed(3));
        setG(gNext);
      }
    };
    const up = () => {
      if (!from) return;
      from = null;
      tween([[setT, tRef.current, tRef.current > 0.5 ? 1 : 0], [setG, gRef.current, gRef.current > 0.5 ? 1 : 0]]);
      setTimeout(() => {
        draggingRef.current = false;
      }, 320);
    };
    const claim = ev => {
      if (!from || !from.engaged || !ev.cancelable) return;
      ev.preventDefault();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('touchmove', claim, {
      passive: false
    });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('touchmove', claim);
    };
  }, [nav.plus]);

  // COMPRESSED, THE STRIP PAGES WEEK BY WEEK, AND IT FOLLOWS THE FINGER
  // (founder, 14 Aug round 4: "it just snaps to the next month... it suppose
  // to follow the same physics as when the calendar is fully extended"). The
  // strip is a live track: the neighbouring weeks ride either side as ghost
  // rows, the whole thing translates with the finger, and only on release
  // does it settle, to the next week past halfway, back home otherwise,
  // exactly the month pager's feel. The record follows a committed page. A
  // blocked direction (today's week, the epoch) drags heavy and always comes
  // home. The month pager underneath stays parked and silent while folded.
  const [wx, setWx] = React.useState(0);
  const wxRef = React.useRef(0);
  wxRef.current = wx;
  const weekDraggedRef = React.useRef(false);
  // A move is a real page only if it leaves the anchor's WEEK. Clamping +7 to
  // today used to land INSIDE the same week from a midweek anchor, so a
  // future swipe slid a duplicate of the week under the finger in as "next"
  // and committed a two-day move sold as a page (arena catch, round 4). The
  // same wall guards the epoch end.
  const weekStartOf = iso => {
    const d = J.parseISO(iso);
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - J.weekLead(d));
    return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`;
  };
  const weekTarget = dir => {
    let iso = J.isoShift(anchorRef.current, dir * 7);
    if (iso > J.TODAY_ISO) iso = J.TODAY_ISO;
    if (iso < window.MIN_LOG_DAY) iso = window.MIN_LOG_DAY;
    return weekStartOf(iso) === weekStartOf(anchorRef.current) ? null : iso;
  };
  // The strip settles on its OWN raf handle with its own pending commit. On
  // the shared handle, a second fast swipe's settle cancelled the first
  // swipe's landing before onDone ever fired, and a page silently vanished
  // (arena catch, round 4). A new grab flushes any pending page FIRST, so
  // no gesture can erase a committed one.
  const wkTweenRef = React.useRef(null);
  const wkPendingRef = React.useRef(null);
  const wkSettle = (fromX, toX, onDone) => {
    if (wkTweenRef.current) cancelAnimationFrame(wkTweenRef.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setWx(toX);
      if (onDone) onDone();
      return;
    }
    let t0 = null;
    const step = ts => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 240);
      const e = 1 - Math.pow(1 - k, 3);
      setWx(fromX + (toX - fromX) * e);
      if (k < 1) wkTweenRef.current = requestAnimationFrame(step);else if (onDone) onDone();
    };
    wkTweenRef.current = requestAnimationFrame(step);
  };
  const wkFlush = () => {
    if (wkTweenRef.current) cancelAnimationFrame(wkTweenRef.current);
    const fn = wkPendingRef.current;
    wkPendingRef.current = null;
    if (fn) {
      fn();
      return true;
    }
    return false;
  };
  React.useEffect(() => () => {
    if (wkTweenRef.current) cancelAnimationFrame(wkTweenRef.current);
  }, []);
  React.useEffect(() => {
    const el = foldRef.current;
    if (!el || !nav.plus) return undefined;
    let from = null;
    const down = ev => {
      if (tRef.current > 0.5) return;
      // a pending page lands NOW; a bounce still in flight stops where it
      // is and the new drag continues from the live value, so the strip can
      // never slide out from under a held finger (arena catches, round 4)
      const committed = wkFlush();
      from = {
        x: ev.clientX,
        y: ev.clientY,
        engaged: false,
        x0: committed ? 0 : wxRef.current,
        w: el.clientWidth || 1,
        pid: ev.pointerId
      };
    };
    const move = ev => {
      if (!from) return;
      const dx = ev.clientX - from.x,
        dy = ev.clientY - from.y;
      if (!from.engaged) {
        // a vertical move is a scroll, not ours; a clear horizontal one is
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          from = null;
          return;
        }
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        from.engaged = true;
        weekDraggedRef.current = true;
        try {
          el.setPointerCapture(from.pid);
        } catch (e) {}
      }
      const val = from.x0 + dx;
      const open = weekTarget(val < 0 ? 1 : -1);
      setWx(open ? val : val / 3); // a wall in that direction drags heavy
    };
    const up = () => {
      if (!from) return;
      const {
        w,
        engaged
      } = from;
      from = null;
      if (!engaged) {
        // a TAP that landed mid-settle cancelled the bounce at pointerdown;
        // send the track home and swallow the fall-through click, which
        // would land on a cell shifted under the finger and quietly move
        // the record (arena verify catch, round 4)
        if (wxRef.current !== 0) {
          weekDraggedRef.current = true;
          wkSettle(wxRef.current, 0);
          setTimeout(() => {
            weekDraggedRef.current = false;
          }, 60);
        }
        return;
      }
      const x = wxRef.current;
      const dir = x < 0 ? 1 : -1; // swiping left walks forward in time
      const target = weekTarget(dir);
      if (target && Math.abs(x) > w / 2) {
        // past halfway: finish the slide, then the page commits and the
        // track resets under the new week in one paint
        wkPendingRef.current = () => {
          scrollToDate(target);
          setWx(0);
        };
        wkSettle(x, dir === 1 ? -w : w, () => {
          const fn = wkPendingRef.current;
          wkPendingRef.current = null;
          if (fn) fn();
        });
      } else {
        wkSettle(x, 0);
      }
      setTimeout(() => {
        weekDraggedRef.current = false;
      }, 60);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
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
    const off = Math.max(minOffset, Math.min(0, a.getFullYear() * 12 + a.getMonth() - (today.getFullYear() * 12 + today.getMonth())));
    if (off !== targetRef.current) adopt(off);
  }, [nav.plus, calOpen, anchorISO]);
  const anchorDate = anchorDateOf(anchorISO);
  // Compressed, the title names the month being READ (the anchor's). Open, the
  // parent can swipe the grid to other months, and the title must follow the
  // grid it sits above, not the record underneath (13 Aug arena catch).
  const plusLabel = calOpen ? monthLabel : `${J.MONTH_NAMES[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  const toggleCal = () => {
    if (calOpen) {
      tween([[setT, t, 0]]);
      return;
    }
    const off = anchorDate.getFullYear() * 12 + anchorDate.getMonth() - (today.getFullYear() * 12 + today.getMonth());
    adopt(Math.max(minOffset, Math.min(0, off)));
    tween([[setT, t, 1]]);
  };
  // The graph icon (founder, 14 Aug): pressing it makes the graph come out for
  // the month you are on, the calendar staying as it is; pressing it while the
  // graph is out is "the same outcome" as the tuck swipe, so it hides the
  // graph AND compresses the calendar.
  const graphBtn = nav.plus ? /*#__PURE__*/React.createElement("button", {
    className: "j-iconbtn",
    "data-graph-toggle": true,
    "aria-pressed": graphOpen,
    "aria-label": graphOpen ? 'Hide the graph' : 'Show the graph',
    onClick: () => {
      if (gRef.current > 0.5) tween([[setG, gRef.current, 0], [setT, tRef.current, 0]]);else tween([[setG, gRef.current, 1]]);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bars",
    size: 22,
    color: "var(--muted)"
  })) : null;
  // The rewind clock (founder, 14 Aug): back to the default view, today at the
  // top, calendar open, graph out. Grey and inert while the parent is already
  // there; it wakes the moment the date, the month or the look moves.
  const atDefault = anchorISO === J.TODAY_ISO && calOpen && graphOpen && offset === 0;
  const jumpToToday = () => {
    adopt(0);
    scrollToDate(J.TODAY_ISO);
    tween([[setT, tRef.current, 1], [setG, gRef.current, 1]]);
  };
  const rewindBtn = nav.plus ? /*#__PURE__*/React.createElement("button", {
    className: "j-iconbtn",
    "data-rewind": true,
    disabled: atDefault,
    "aria-label": "Back to today",
    onClick: jumpToToday
    // snugged to the graph icon so the pair reads as one control group
    // (founder, 14 Aug: "it feels isolated on its own")
    ,
    style: {
      opacity: atDefault ? 0.35 : 1,
      cursor: atDefault ? 'default' : 'pointer',
      marginRight: -14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rewind",
    size: 21,
    color: atDefault ? 'var(--faint)' : 'var(--muted)'
  })) : null;
  // on Plus a calendar tap moves the record; on free it opens the day.
  // Tapping a FADED neighbour day hands the month over (founder, 14 Aug:
  // "until a date on that month is picked"): the pager pages to that month,
  // its days go full, and the month just left fades in its lead and tail.
  const pickDay = (iso, out) => {
    if (!nav.plus) {
      nav.go('day', {
        date: iso
      });
      return;
    }
    if (out) {
      const d = J.parseISO(iso);
      const off = d.getFullYear() * 12 + d.getMonth() - (today.getFullYear() * 12 + today.getMonth());
      adopt(Math.max(minOffset, Math.min(0, off)));
    }
    scrollToDate(iso);
  };
  const dowRow = /*#__PURE__*/React.createElement("div", {
    className: "j-caldows"
  }, dows.map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, d)));
  // One day cell, shared by the month grid and the week track's ghost rows,
  // so a ghost can never drift from the real look. A ghost is not
  // interactive (it exists only under a live finger) and highlights its own
  // week's landing day.
  const dayCellEl = (c, {
    key,
    anchor,
    interactive
  }) => {
    const isAnchor = nav.plus && c.iso === anchor;
    const tint = c.mood ? window.moodTint(c.mood) : 'transparent';
    const ink = isAnchor ? 'var(--blue)' : c.mood ? window.MOOD_COLOURS[c.mood] : c.future ? 'var(--line)' : 'var(--faint)';
    // Every past day and today opens the Day view, notes or
    // not (12 Jul 2026); only future days stay inert.
    const tappable = interactive && !c.future;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => tappable && pickDay(c.iso, c.out),
      className: 'j-daycell' + (tappable ? ' j-press' : ''),
      disabled: !tappable,
      "data-anchor": isAnchor ? 'true' : undefined,
      "data-out": c.out ? 'true' : undefined
      // the ring is a 1px-inset pseudo (j-daycell in jotla.css), never an
      // edge-drawn shadow the fold's or the pager's clip could shave
      ,
      "data-ring": c.isToday ? 'today' : isAnchor ? 'anchor' : undefined,
      "aria-label": c.future ? `${c.d} ${J.MONTH_NAMES[c.m]} ${c.y}, in the future` : `${c.d} ${J.MONTH_NAMES[c.m]} ${c.y}, ${c.count > 0 ? c.count + (c.count === 1 ? ' note' : ' notes') : 'no note'}`,
      style: {
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        cursor: tappable ? 'pointer' : 'default',
        border: 'none',
        background: tint,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        // a neighbouring month's day is a whisper, present but never
        // crowding the month being read (founder, 14 Aug round 5:
        // 0.38 still fought the real days)
        opacity: c.out ? 0.22 : c.future ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Outfit', system-ui",
        fontWeight: c.isToday ? 600 : 500,
        fontSize: 'calc(15px * var(--tscale, 1))',
        color: c.isToday || isAnchor ? 'var(--blue)' : ink
      }
    }, c.d), c.mood && /*#__PURE__*/React.createElement(MoodDot, {
      mood: c.mood,
      size: 6
    }));
  };
  // the seven days of the week holding a date, under the week-start setting;
  // days outside that date's month fade exactly as the grid's lead and tail
  const weekCellsFor = targetISO => {
    const td = anchorDateOf(targetISO);
    const start = new Date(td.getFullYear(), td.getMonth(), td.getDate() - J.weekLead(td));
    const pad2 = n => String(n).padStart(2, '0');
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      const dayEntries = entries.filter(e => e.date === iso);
      cells.push({
        d: dt.getDate(),
        iso,
        out: dt.getMonth() !== td.getMonth() || dt.getFullYear() !== td.getFullYear(),
        m: dt.getMonth(),
        y: dt.getFullYear(),
        mood: J.dayMood(dayEntries),
        count: dayEntries.length,
        future: iso > J.TODAY_ISO,
        isToday: iso === J.TODAY_ISO
      });
    }
    return cells;
  };
  // a ghost week row riding beside the strip while the finger drags it; its
  // top tracks the fold so it always lines up with the visible week
  const ghostWeekEl = side => {
    const target = weekTarget(side);
    if (!target) return null;
    return /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      "data-week-ghost": side === 1 ? 'next' : 'prev',
      style: {
        position: 'absolute',
        top: weekRow * (rowH + GAP) * t,
        left: side === 1 ? '100%' : '-100%',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: GAP,
        alignContent: 'start'
      }
    }, weekCellsFor(target).map((c, i) => dayCellEl(c, {
      key: 'g' + side + '-' + i,
      anchor: target,
      interactive: false
    })));
  };
  const pagerEl = /*#__PURE__*/React.createElement("div", _extends({
    ref: pagerRef,
    onScroll: onPagerScroll,
    className: "j-pager"
  }, pagerKeyProps(pagerRef, 'Calendar months'), {
    style: {
      display: 'flex',
      // folded on Plus, the native month swipe is parked: the strip pages
      // week by week through its own gesture instead (founder, 14 Aug)
      overflowX: nav.plus && !calOpen ? 'hidden' : 'auto',
      touchAction: nav.plus && !calOpen ? 'none' : undefined,
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
      outline: 'none'
    }
  }), monthOffsets.map(off => {
    // Materialise cells only near the shown month; the far panels
    // stay as fixed-size placeholders (they stretch to the row's
    // height, so paging is always pixel-stable).
    if (Math.abs(off - offset) > 2) {
      return /*#__PURE__*/React.createElement("div", {
        key: off,
        "aria-hidden": "true",
        style: {
          flex: '0 0 100%',
          width: '100%',
          scrollSnapAlign: 'start'
        }
      });
    }
    const m = off === offset ? cur : monthMeta(off);
    return /*#__PURE__*/React.createElement("div", {
      key: off,
      style: {
        flex: '0 0 100%',
        width: '100%',
        scrollSnapAlign: 'start',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
        alignContent: 'start'
      }
    }, m.cells.map((c, idx) => {
      // free keeps the blanks it has always had (the 11 Aug lock)
      if (c.out && !nav.plus) return /*#__PURE__*/React.createElement("div", {
        key: 'blank-' + idx,
        style: {
          aspectRatio: '1 / 1'
        }
      });
      // On Plus the day being read wears the accent, and it travels
      // with the record as the parent scrolls. The founder's 14 Aug
      // styling: a THIN stroke ring and the number in blue, nothing
      // filled, so the day keeps its mood tint and dot underneath.
      return dayCellEl(c, {
        key: c.iso,
        anchor: anchorISO,
        interactive: true
      });
    }));
  }));
  const calendarCard = /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 14,
      overflow: 'hidden'
    }
  }, dowRow, pagerEl);
  const legendRow = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginTop: 12
    }
  }, [['good', 'Good day'], ['ok', 'Mixed day'], ['hard', 'Hard day'], ['none', 'No note']].map(([k, l]) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--faint)'
    }
  }, /*#__PURE__*/React.createElement(MoodDot, {
    mood: k,
    size: 9
  }), " ", l)));

  // ---- PLUS: the one surface (founder, 14 Aug). The inset card ALWAYS, the
  // title on the page background, the grab line on the card, the legend and
  // the graph folding beneath it as their own layers, and the record
  // streaming under everything. Never a full-bleed panel. ----
  if (nav.plus) {
    const foldH = rowH ? rowH + (fullH - rowH) * t : undefined;
    return /*#__PURE__*/React.createElement("div", {
      className: "j-screen",
      "data-cal-mode": "unified"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0
      },
      "data-cal-pinned": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "j-pad",
      style: {
        paddingTop: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "j-press",
      "data-cal-open": true,
      onClick: toggleCal,
      "aria-expanded": calOpen,
      "aria-label": (calOpen ? 'Fold' : 'Open') + ' the calendar',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      className: "j-h1",
      style: {
        fontSize: 'calc(28px * var(--tscale, 1))'
      }
    }, plusLabel), /*#__PURE__*/React.createElement("span", {
      className: 'j-calarrow' + (calOpen ? ' j-open' : ''),
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 20,
      color: "var(--muted)"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 'calc(30px * var(--tscale, 1))',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0
      }
    }, rewindBtn, graphBtn)), /*#__PURE__*/React.createElement("div", {
      className: "j-card",
      "data-cal-card": true,
      style: {
        padding: '14px 14px 0',
        overflow: 'hidden'
      }
    }, dowRow, /*#__PURE__*/React.createElement("div", {
      className: "j-calfold",
      ref: foldRef,
      "data-cal-fold": true,
      style: {
        height: foldH
      },
      onClickCapture: e => {
        if (weekDraggedRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }, /*#__PURE__*/React.createElement("div", {
      "data-week-track": true,
      style: {
        transform: `translateX(${wx}px)`,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        transform: `translateY(${-(1 - t) * weekRow * (rowH + GAP)}px)`
      }
    }, pagerEl), wx !== 0 && ghostWeekEl(-1), wx !== 0 && ghostWeekEl(1))), /*#__PURE__*/React.createElement("button", {
      className: "j-calhandle",
      ref: handleRef,
      "data-cal-handle": true,
      "aria-label": calOpen ? 'Fold the calendar to one week' : 'Stretch the calendar to the month',
      onClick: () => {
        if (draggedRef.current) {
          draggedRef.current = false;
          return;
        }
        toggleCal();
      }
    }, /*#__PURE__*/React.createElement("span", null))), /*#__PURE__*/React.createElement("div", {
      "data-legend-fold": true,
      style: {
        height: legendH ? legendH * t : t > 0.5 ? undefined : 0,
        opacity: t,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: legendInnerRef,
      style: {
        overflow: 'hidden'
      }
    }, legendRow)), /*#__PURE__*/React.createElement("div", {
      className: "j-graphfold",
      "data-graph-fold": true,
      ref: graphZoneRef,
      style: {
        height: graphH ? graphH * g : g > 0.5 ? undefined : 0,
        opacity: 0.25 + 0.75 * g
      }
    }, /*#__PURE__*/React.createElement("div", {
      ref: graphInnerRef,
      style: {
        overflow: 'hidden',
        transform: `translateY(${graphH ? -((1 - g) * graphH) : 0}px)`
      }
    }, /*#__PURE__*/React.createElement(MonthMoodGraph, {
      entries: entries,
      year: anchorDate.getFullYear(),
      month: anchorDate.getMonth()
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "j-scroll j-fade j-streamfade",
      ref: streamRef,
      onScroll: onStreamScroll,
      "data-stream": true,
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "j-pad",
      style: {
        paddingBottom: 140
      }
    }, streamDates.map(iso => /*#__PURE__*/React.createElement(StreamDay, {
      key: iso,
      iso: iso,
      list: byDate[iso] || [],
      nav: nav,
      hostRef: el => {
        if (el) dayEls.current[iso] = el;
      }
    })), atEpoch && /*#__PURE__*/React.createElement("p", {
      className: "j-meta",
      style: {
        textAlign: 'center',
        padding: '18px 0 4px'
      }
    }, "That is as far back as Jotla goes."))));
  }

  // ---- FREE: the Month tab exactly as it has always been (the 11 Aug lock:
  // "in the free version how it is right now is unchanged"), chevrons and all ----
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen",
    "data-cal-mode": "simple"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 10,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(TabTitle, {
    title: monthLabel,
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, monthNavBtn('prev'), monthNavBtn('next'))
  }), calendarCard, legendRow, /*#__PURE__*/React.createElement(PatternsLockedPreview, {
    onOpen: () => nav.go('unlock')
  }))));
}

// ---------------- Day detail ----------------
// Every day from the data epoch to today offers "Add a note", preset to this
// exact date (12 Jul 2026), so an empty day is an invitation rather than a
// dead end. The date rides the view to Quick log, so the day arrives pre-set
// there and nothing needs re-picking.
function DayScreen({
  nav,
  entries,
  date
}) {
  const J = window.JOTLA;
  const list = entries.filter(e => e.date === date);
  const mood = J.dayMood(list);
  const canAdd = !!date && date >= window.MIN_LOG_DAY && date <= J.TODAY_ISO;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: J.fmtLong(date),
    subtitle: list.length + (list.length === 1 ? ' note' : ' notes'),
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, mood && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-start',
      padding: '8px 14px',
      borderRadius: 999,
      background: window.moodTint(mood)
    }
  }, /*#__PURE__*/React.createElement(MoodDot, {
    mood: mood,
    size: 10
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500,
      color: window.MOOD_COLOURS[mood]
    }
  }, mood === 'good' ? 'A good day overall' : mood === 'ok' ? 'A mixed day' : 'A hard day')), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)'
    }
  }, "No notes on this day."), canAdd && /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      color: 'var(--faint)',
      marginTop: 4
    }
  }, "You can still add one now.")) : /*#__PURE__*/React.createElement(LogList, {
    list: list,
    nav: nav
  }), canAdd && /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    "aria-label": 'Add a note for ' + J.fmtLong(date),
    style: {
      marginTop: list.length === 0 ? 0 : 6
    },
    onClick: () => nav.go('quicklog', {
      date
    })
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20,
    color: "#fff"
  }), " Add a note"))));
}

// ---------------- Single entry detail ----------------
// Edit a note honestly: the wording can change, the original date and time
// cannot, and the previous wording stays visible on the record.
// REVAMPED on the Quick Log's pattern (founder, 14 Aug round 6: "the edit
// note doesn't give you much options"): the moment's own face picker, the
// Other theme named by the parent, the parent's own places, and media on the
// note (Plus adds, everyone views and removes; same law as the quick log).
// What stays locked is the point: date and time never change, and the earlier
// wording is kept on the record.
function EditEntrySheet({
  entry,
  nav,
  onSave,
  onClose
}) {
  const J = window.JOTLA;
  const [summary, setSummary] = React.useState(entry.summary);
  const [mood, setMood] = React.useState(entry.mood);
  const [category, setCategory] = React.useState(entry.category);
  const [catOther, setCatOther] = React.useState(entry.categoryOther || '');
  const [setting, setSetting] = React.useState(entry.setting);
  const [placeOpen, setPlaceOpen] = React.useState(false);
  const [placeText, setPlaceText] = React.useState('');
  // the note's saved place may be one the parent typed; it stays an option
  const [places, setPlaces] = React.useState(J.SETTINGS.includes(entry.setting) ? [] : [entry.setting]);
  // What the note holds now: a stored photo edits like the quick log's; an
  // older caption-only photo (or a noted video) shows as itself with its own
  // remove, never silently re-encoded. media0 is built ONCE (lazy state) so
  // the media-changed test stays a pure identity check: a re-render can never
  // fake a change, and a no-op Save can never stamp "Edited" onto the record
  // (arena catch, 14 Aug round 6: a fresh literal every render made any save
  // on a photo entry read as an edit and rewrote the caption).
  const [media0] = React.useState(() => entry.photoData ? {
    source: 'attach',
    kind: 'photo',
    dataUrl: entry.photoData
  } : entry.photo ? {
    kind: 'legacy',
    caption: entry.photo
  } : null);
  const [media, setMedia] = React.useState(media0);
  const catOtherFinal = category === 'Other' ? catOther.trim() : '';
  const changed = summary.trim() !== entry.summary || mood !== entry.mood || category !== entry.category || setting !== entry.setting || catOtherFinal !== (entry.categoryOther || '') || media !== media0;
  const save = () => {
    if (changed && summary.trim()) {
      const patch = {
        summary: summary.trim(),
        mood,
        category,
        categoryOther: catOtherFinal,
        setting
      };
      if (media !== media0) {
        if (!media) {
          patch.photo = '';
          patch.photoData = '';
        } else if (media.kind === 'photo' && media.dataUrl) {
          patch.photoData = media.dataUrl;
          patch.photo = 'Photo from the day';
        } else if (media.kind === 'video') {
          patch.photo = 'Video noted (kept in your photo library)';
          patch.photoData = '';
        }
      }
      onSave(patch);
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: ev => ev.stopPropagation(),
    style: {
      maxHeight: '88%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: 4
    }
  }, "Edit this note"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 14
    }
  }, "The original date and time stay as they are, and the earlier wording is kept on the record. Honest edits only."), /*#__PURE__*/React.createElement(FieldLabel, null, "What happened?"), /*#__PURE__*/React.createElement("textarea", {
    value: summary,
    onChange: ev => setSummary(ev.target.value),
    rows: 4,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 14,
      border: '1.5px solid var(--chip-border)',
      background: 'var(--card-2)',
      padding: 12,
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      resize: 'vertical',
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "How did it feel?"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(MoodFacePicker, {
    value: mood,
    onChange: setMood
  })), /*#__PURE__*/React.createElement(FieldLabel, null, "Theme"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: category === 'Other' ? 10 : 14
    }
  }, J.CATEGORIES.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    "aria-pressed": category === c,
    className: 'j-chip' + (category === c ? ' j-chip-on' : ''),
    onClick: () => setCategory(c)
  }, c))), category === 'Other' && /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: catOther,
    onChange: e => setCatOther(e.target.value),
    placeholder: "Name it, e.g. Homework",
    "aria-label": "Name this moment yourself",
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "Where"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: placeOpen ? 10 : 14
    }
  }, [...J.SETTINGS, ...places].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    "aria-pressed": setting === s,
    className: 'j-chip' + (setting === s ? ' j-chip-on' : ''),
    onClick: () => setSetting(s)
  }, s)), /*#__PURE__*/React.createElement("button", {
    className: "j-chip",
    style: {
      borderStyle: 'dashed'
    },
    "aria-label": "Add your own place",
    onClick: () => setPlaceOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    color: "var(--faint)"
  }), " Other")), placeOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    style: {
      flex: 1,
      minWidth: 0
    },
    value: placeText,
    onChange: e => setPlaceText(e.target.value),
    "aria-label": "Add a place",
    placeholder: "Grandma's, the park, soft play..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      flex: '0 0 auto',
      width: 'auto',
      minHeight: 48,
      padding: '0 22px'
    },
    onClick: () => {
      const t = placeText.trim();
      if (!t) return;
      if (!J.SETTINGS.includes(t) && !places.includes(t)) setPlaces(p => [...p, t]);
      setSetting(t);
      setPlaceText('');
      setPlaceOpen(false);
    }
  }, "Add")), /*#__PURE__*/React.createElement(FieldLabel, null, "Photo or video"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, media && media.kind === 'legacy' ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      background: 'var(--photo-bg)',
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 20,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'calc(14px * var(--tscale, 1))',
      color: 'var(--muted)'
    }
  }, media.caption), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMedia(null),
    "aria-label": "Remove media",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      border: 'none',
      background: 'var(--card)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 17,
    color: "var(--muted)"
  }))) : nav.plus ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MediaPicker, {
    value: media,
    onChange: setMedia
  }), !media && media0 &&
  /*#__PURE__*/
  // a slip of the thumb must not be a trap (arena catch, 14 Aug
  // round 6): the removed photo can be put straight back
  React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      marginTop: 10,
      minHeight: 44
    },
    onClick: () => setMedia(media0)
  }, "Put back what was there")) : media ? /*#__PURE__*/React.createElement(MediaPicker, {
    value: media,
    onChange: setMedia
  }) : media0 ?
  /*#__PURE__*/
  // free never gates viewing or removing its own media, and a slip
  // of the thumb is not a trap here either (arena catch, round 6):
  // nothing changes until Save, and one tap restores it
  React.createElement("div", {
    style: {
      borderRadius: 14,
      border: '1.5px dashed var(--chip-border)',
      background: 'var(--card)',
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 'calc(14px * var(--tscale, 1))',
      color: 'var(--muted)'
    }
  }, "Removed. It comes off the note when you save."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      flex: '0 0 auto',
      width: 'auto',
      minHeight: 44,
      padding: '0 18px'
    },
    onClick: () => setMedia(media0)
  }, "Put it back")) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    icon: "camera",
    title: "Add photos and videos",
    text: "Keep a photo or video with the note. Sometimes the picture is the evidence. Part of Plus.",
    onClick: () => {
      onClose();
      nav.go('unlock');
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    disabled: !summary.trim(),
    style: {
      opacity: summary.trim() ? 1 : 0.5
    },
    onClick: save
  }, "Save the change"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 8
    },
    onClick: onClose
  }, "Cancel")));
}
function EntryScreen({
  nav,
  entries,
  id
}) {
  const J = window.JOTLA;
  const e = entries.find(x => x.id === id);
  const [editing, setEditing] = React.useState(false);
  if (!e) return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Note",
    onBack: () => nav.back()
  }));
  const isH = e.type === 'handover';
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Note",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 28,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Face, {
    mood: e.mood,
    size: 44
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-h3"
  }, e.time, " at ", J.settingInSentence(e.setting)), /*#__PURE__*/React.createElement("p", {
    className: "j-meta"
  }, J.fmtLong(e.date), " \xB7 ", e.categoryOther || e.category))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
      color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 13,
    color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)'
  }), e.kind === 'contemporaneous' ? 'Same day' : 'Added later'), e.editedOn && /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: 'var(--tag-grey-bg)',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 13,
    color: "var(--muted)"
  }), " Edited ", J.fmtShort(e.editedOn)))), /*#__PURE__*/React.createElement("div", {
    className: "j-card j-card-pad"
  }, window.isChildDayEntry(e) ? /*#__PURE__*/React.createElement(ChildDaySummary, {
    entry: e
  }) : /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      whiteSpace: 'pre-line'
    }
  }, e.summary), (e.photo || e.photoData) && /*#__PURE__*/React.createElement(PhotoAttachment, {
    caption: e.photo,
    src: e.photoData
  })), isH && e.handover && /*#__PURE__*/React.createElement("div", {
    className: "j-card j-card-pad",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, e.handover.behaviours && e.handover.behaviours.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, e.handover.behaviours.map(b => /*#__PURE__*/React.createElement("span", {
    key: b,
    className: "j-chip j-chip-on",
    style: {
      pointerEvents: 'none',
      minHeight: 36
    }
  }, b))), [['Before', e.handover.before], ['During', e.handover.during], ['After', e.handover.after]].map(([l, v]) => v && /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14px * var(--tscale, 1))',
      color: 'var(--blue)',
      marginBottom: 3
    }
  }, l), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      flexWrap: 'wrap'
    }
  }, e.handover.who && e.handover.who.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-meta"
  }, "Who was there"), /*#__PURE__*/React.createElement("p", {
    className: "j-strong",
    style: {
      fontSize: 'calc(16px * var(--tscale, 1))'
    }
  }, e.handover.who.join(', '))), e.handover.where && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-meta"
  }, "Where"), /*#__PURE__*/React.createElement("p", {
    className: "j-strong",
    style: {
      fontSize: 'calc(16px * var(--tscale, 1))'
    }
  }, e.handover.where)), e.handover.duration && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-meta"
  }, "Lasted"), /*#__PURE__*/React.createElement("p", {
    className: "j-strong",
    style: {
      fontSize: 'calc(16px * var(--tscale, 1))'
    }
  }, e.handover.duration))), e.handover.helped && /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--tint-green)',
      borderRadius: 12,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14px * var(--tscale, 1))',
      color: 'var(--green-ink)',
      marginBottom: 3
    }
  }, "What helped"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    }
  }, e.handover.helped))), e.history && e.history.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "j-card j-card-pad",
    style: {
      background: 'var(--card-2)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 8,
      color: '#6C9BD9',
      fontStyle: 'italic'
    }
  }, "What it said before"), e.history.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '8px 0',
      borderTop: i ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginBottom: 3
    }
  }, "Until ", J.fmtShort(h.on), " ", h.on.slice(0, 4)), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))'
    }
  }, h.summary), (h.categoryOther || h.photo) && /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 3
    }
  }, [h.categoryOther, h.photo].filter(Boolean).join(' · '))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      flex: 1,
      color: 'var(--blue)'
    },
    onClick: () => setEditing(true)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 18,
    color: "var(--blue)"
  }), " Edit"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      flex: 1,
      color: '#C0392B'
    },
    onClick: () => {
      if (window.confirm('Move this note to the Bin? You can restore it for 30 days from Settings.')) {
        nav.deleteEntry(e.id);
        nav.back();
      }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: "#C0392B"
  }), " Delete")))), editing && /*#__PURE__*/React.createElement(EditEntrySheet, {
    entry: e,
    nav: nav,
    onSave: patch => nav.updateEntry(e.id, patch),
    onClose: () => setEditing(false)
  }));
}
Object.assign(window, {
  MonthScreen,
  DayScreen,
  EntryScreen,
  TabTitle
});