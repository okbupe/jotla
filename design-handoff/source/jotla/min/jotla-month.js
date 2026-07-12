function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// jotla-month.jsx — Month calendar (tab) and Day detail (push).
const {
  useState: useStateM
} = React;
function TabTitle({
  title,
  sub,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
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
  }, sub)), right);
}

// Plus: the shown month as the same bar graph the Today page draws, five bars
// since 12 Jul 2026: Good / Mixed / Hard days in the static mood colours, then
// Gate and Dysregulation moments in their own colours (Dysregulation LAST with
// its label tucked to the right edge, exactly as the Today strip), and the
// plain summary sentence. The counting rule lives with kindBarBlocks in
// jotla-ui.jsx: mood bars count DAYS, the two new bars count MOMENTS,
// mutually exclusive by type.
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
  const dys = monthEntries.filter(e => e.type !== 'handover' && e.category === 'Incidents').length;
  const gate = monthEntries.filter(e => e.type === 'handover').length;
  const blocks = window.kindBarBlocks({
    good,
    ok,
    hard,
    gate,
    dys
  });
  const maxN = Math.max(good, ok, hard, gate, dys, 1);
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
  }, top[0]), " entries come up most often as the hard moments.") : hardCount === 0 ? dys > 0
  // Dysregulation moments can carry a good or mixed mood, so
  // "no hard moments" alone would sit dishonestly next to a
  // plum bar with a count in it.
  ? `${dys} dysregulation ${dys === 1 ? 'moment' : 'moments'} logged, none marked as a hard moment.` : 'No hard moments logged. Long may it last.'
  // Hard moments with no theme tagged: saying "no hard moments"
  // here would be a false claim, so count them honestly.
  : `${hardCount} hard ${hardCount === 1 ? 'moment' : 'moments'} logged, not tagged to a theme.`) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Nothing logged in ", J.MONTH_NAMES[month], "."), " Swipe the calendar to move between months.")));
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
  // Always exactly six week rows (42 cells), whatever the month's shape: the
  // tail fills with the same blanks as the lead-in, so the calendar card
  // never resizes and nothing below it ever moves when the month changes
  // (12 Jul 2026).
  const monthMeta = off => {
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
      cells.push({
        d,
        iso,
        mood: J.dayMood(dayEntries),
        count: dayEntries.length,
        future: d > todayNum,
        isToday: d === todayNum
      });
    }
    while (cells.length < 42) cells.push(null);
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
  const adopt = target => {
    targetRef.current = target;
    setOffset(o => {
      if (target === o) return o;
      nav.remember({
        monthOffset: target
      });
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
  const dows = J.DOW_MON; // Mon Tue Wed Thu Fri Sat Sun

  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 14,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(TabTitle, {
    title: monthLabel,
    sub: "Tap any day to read it back.",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, monthNavBtn('prev'), monthNavBtn('next'))
  }), !nav.plus && /*#__PURE__*/React.createElement(PlusLockedCard, {
    onClick: () => nav.go('unlock'),
    style: {
      marginBottom: 18
    },
    title: "Month patterns",
    text: "The mood graph, counts and hard-day patterns for each month. Part of Plus."
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 14,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 6,
      marginBottom: 8
    }
  }, dows.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      fontSize: 'calc(12px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--faint)'
    }
  }, d))), /*#__PURE__*/React.createElement("div", _extends({
    ref: pagerRef,
    onScroll: onPagerScroll,
    className: "j-pager"
  }, pagerKeyProps(pagerRef, 'Calendar months'), {
    style: {
      display: 'flex',
      overflowX: 'auto',
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
      if (!c) return /*#__PURE__*/React.createElement("div", {
        key: 'blank-' + idx,
        style: {
          aspectRatio: '1 / 1'
        }
      });
      const tint = c.mood ? window.moodTint(c.mood) : 'transparent';
      const ink = c.mood ? window.MOOD_COLOURS[c.mood] : c.future ? 'var(--line)' : 'var(--faint)';
      // Every past day and today opens the Day view, notes or
      // not (12 Jul 2026); only future days stay inert.
      const tappable = !c.future;
      return /*#__PURE__*/React.createElement("button", {
        key: c.d,
        onClick: () => tappable && nav.go('day', {
          date: c.iso
        }),
        className: tappable ? 'j-press' : '',
        disabled: !tappable,
        "aria-label": c.future ? `${c.d} ${J.MONTH_NAMES[m.month]} ${m.year}, in the future` : `${c.d} ${J.MONTH_NAMES[m.month]} ${m.year}, ${c.count > 0 ? c.count + (c.count === 1 ? ' note' : ' notes') : 'no note'}`,
        style: {
          aspectRatio: '1 / 1',
          borderRadius: 12,
          cursor: tappable ? 'pointer' : 'default',
          border: 'none',
          boxShadow: c.isToday ? 'inset 0 0 0 2px var(--blue)' : 'none',
          background: tint,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          opacity: c.future ? 0.55 : 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "'Outfit', system-ui",
          fontWeight: c.isToday ? 600 : 500,
          fontSize: 'calc(15px * var(--tscale, 1))',
          color: c.isToday ? 'var(--blue)' : ink
        }
      }, c.d), c.mood && /*#__PURE__*/React.createElement(MoodDot, {
        mood: c.mood,
        size: 6
      }));
    }));
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 0,
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--faint)',
      opacity: 0.75
    }
  }, "\u2039  swipe left and right  \u203A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginTop: 12
    }
  }, [['good', 'Good day'], ['ok', 'Up and down'], ['hard', 'Hard day'], ['none', 'No note']].map(([k, l]) => /*#__PURE__*/React.createElement("span", {
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
  }), " ", l))), nav.plus && /*#__PURE__*/React.createElement(MonthMoodGraph, {
    entries: entries,
    year: year,
    month: month
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
  }, mood === 'good' ? 'A good day overall' : mood === 'ok' ? 'Up and down' : 'A hard day')), list.length === 0 ? /*#__PURE__*/React.createElement("div", {
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
  }, "You can still add one now.")) : list.map(e => /*#__PURE__*/React.createElement(EntryCard, {
    key: e.id,
    entry: e,
    onClick: () => nav.go('entry', {
      id: e.id
    })
  })), canAdd && /*#__PURE__*/React.createElement("button", {
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
function EditEntrySheet({
  entry,
  onSave,
  onClose
}) {
  const J = window.JOTLA;
  const [summary, setSummary] = React.useState(entry.summary);
  const [mood, setMood] = React.useState(entry.mood);
  const [category, setCategory] = React.useState(entry.category);
  const [setting, setSetting] = React.useState(entry.setting);
  const changed = summary.trim() !== entry.summary || mood !== entry.mood || category !== entry.category || setting !== entry.setting;
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
  }, "The original date and time stay as they are, and the earlier wording is kept on the record. Honest edits only."), /*#__PURE__*/React.createElement("textarea", {
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
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "How the moment felt"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 12
    }
  }, J.MOODS.map(m => /*#__PURE__*/React.createElement("button", {
    key: m.key,
    "aria-pressed": mood === m.key,
    className: 'j-chip' + (mood === m.key ? ' j-chip-on' : ''),
    onClick: () => setMood(m.key)
  }, /*#__PURE__*/React.createElement(MoodDot, {
    mood: m.key,
    size: 11
  }), " ", m.label))), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "Theme"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 12
    }
  }, J.CATEGORIES.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    "aria-pressed": category === c,
    className: 'j-chip' + (category === c ? ' j-chip-on' : ''),
    onClick: () => setCategory(c)
  }, c))), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "Where"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 16
    }
  }, J.SETTINGS.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    "aria-pressed": setting === s,
    className: 'j-chip' + (setting === s ? ' j-chip-on' : ''),
    onClick: () => setSetting(s)
  }, s))), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    disabled: !summary.trim(),
    style: {
      opacity: summary.trim() ? 1 : 0.5
    },
    onClick: () => {
      if (changed && summary.trim()) onSave({
        summary: summary.trim(),
        mood,
        category,
        setting
      });
      onClose();
    }
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
  }, e.time, " at ", e.setting.toLowerCase()), /*#__PURE__*/React.createElement("p", {
    className: "j-meta"
  }, J.fmtLong(e.date), " \xB7 ", e.category))), /*#__PURE__*/React.createElement("span", {
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
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-body"
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
      gap: 20
    }
  }, e.handover.duration && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
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
  }, h.summary)))), /*#__PURE__*/React.createElement("div", {
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
      if (window.confirm('Delete this note from the record? This cannot be undone.')) {
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