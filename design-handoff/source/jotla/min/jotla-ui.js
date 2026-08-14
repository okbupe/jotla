function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// jotla-ui.jsx: shared layout atoms used across screens.
const {
  useState,
  useRef,
  useEffect,
  useLayoutEffect
} = React;

// The single source of the visible build number. It MUST equal sw.js VERSION,
// and the suite asserts that, because asking a person to remember is what got
// us here: this said 2.0.4 for fourteen builds while the service worker said
// 2.0.18, so the one number a tester can actually read was the one lying.
window.JOTLA_BUILD = '2.0.27';

// The app's data epoch: the earliest day a log can land on (Quick log's own
// minimum day, and how far back the Month calendar pages). One home here, on
// purpose: jotla-data.jsx is swapped wholesale by the private-edition build,
// so app logic never lives there.
const MIN_LOG_DAY = '2019-09-01';
window.MIN_LOG_DAY = MIN_LOG_DAY;

// Keyboard alternative for every swipe pager (build 1.8.0, WCAG 2.1.1): the pager
// becomes focusable and Left/Right arrows page it, so nothing in the app is
// swipe-only. Spread the result onto the pager div alongside ref/onScroll.
function pagerKeyProps(ref, label) {
  return {
    tabIndex: 0,
    role: 'group',
    'aria-label': label + '. Use the left and right arrow keys to move between pages.',
    onKeyDown: e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const el = ref.current;
      if (!el || !el.clientWidth) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      el.scrollTo({
        left: el.scrollLeft + dir * el.clientWidth,
        behavior: 'smooth'
      });
    }
  };
}

/* One skeleton for BOTH story decks, the tour and Tips (founder, 17 Jul: "the
   positioning of image and heading and paragraph is perfect on tips and tour
   should just use that", and the closing button on each must line up with the Tips
   say pills). Built separately they drifted apart exactly there: different copy
   reserves, different header heights, a foot on one and not the other, so the
   tour's heading sat ~150px lower and its button ran into the bottom of the phone.
   The skeleton lives here once and both decks wear it, so they cannot drift again.

     head  the deck's name and count, and Skip. The subtitle line is reserved even
           when a deck has none, so both start their picture at the same height.
     card  the illustration slot, which flexes, above a copy block of fixed height:
           the heading never moves and the paragraph rides up under a short one.
     foot  the dots, centred between the copy block and the note, then the note,
           which reserves its two lines even when empty for the same reason.

   ONE reserve serves both decks, deliberately. The tour needs less (238px against
   Tips' 347 at the largest text), but giving it its own would put its closing
   button on a different line from the Tips pills, which is the thing being fixed. */
const DECK_COPY_RESERVE = '17.2em';
function StoryDeck({
  label,
  sub,
  note,
  slides,
  labelFor,
  onSkip,
  renderSlide
}) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const onScroll = () => {
    const el = ref.current;
    if (!el || !el.clientWidth) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i) setI(k);
  };
  const goTo = k => {
    const el = ref.current;
    if (el) el.scrollTo({
      left: k * el.clientWidth,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen",
    style: {
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-deck-head"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-eyebrow"
  }, label, " \xB7 ", i + 1, " of ", slides.length), /*#__PURE__*/React.createElement("p", {
    className: "j-meta j-deck-sub"
  }, sub || '')), /*#__PURE__*/React.createElement("button", {
    onClick: onSkip,
    className: "j-press",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--faint)',
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500,
      padding: 4,
      flexShrink: 0
    }
  }, "Skip")), /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    onScroll: onScroll,
    className: "j-pager"
  }, pagerKeyProps(ref, label), {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
      outline: 'none'
    }
  }), slides.map((s, k) =>
  /*#__PURE__*/
  /* overflowY auto is the valve, not the plan: the illustration gives way
     first (see .j-illo-slot), so this only ever fires on the smallest phone
     at the largest text, where the words alone fill the screen. It beats
     clipping the say pill off the bottom. */
  React.createElement("div", {
    key: k,
    style: {
      flex: '0 0 100%',
      width: '100%',
      height: '100%',
      scrollSnapAlign: 'start',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-deck-card",
    style: {
      '--illo-copy': DECK_COPY_RESERVE
    }
  }, renderSlide(s, k))))), /*#__PURE__*/React.createElement("div", {
    className: "j-deck-foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-deck-dots"
  }, slides.map((s, k) => /*#__PURE__*/React.createElement("button", {
    key: k,
    "aria-label": labelFor(s, k),
    "aria-current": i === k,
    onClick: () => goTo(k),
    style: {
      width: i === k ? 18 : 7,
      height: 7,
      borderRadius: 99,
      transition: 'all .2s ease',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      background: i === k ? 'var(--blue)' : 'var(--chip-border)'
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "j-meta j-deck-note"
  }, note || '')));
}

/* ---- CalendarSheet + DateField (12 Jul 2026) ----
   Typing a whole date to backdate a log is hostile, so every date in the app
   is picked from a calendar instead. Shaped like the Month view: the same
   Monday-first grid maths, 6px-gap week rows, square 12-radius cells, the
   blue ring on today. The selected day fills brand blue with white text; the
   lead-in and tail of the neighbouring months sit dimmed. minDate/maxDate
   mirror the calling field's own rule (this sheet invents none): days outside
   the bounds sit greyed and untappable. Always exactly six week rows (42
   cells), so paging between month shapes never resizes the sheet. onClear,
   when given, keeps "no date" reachable for fields that allow it. */
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
function monthIndexOf(iso) {
  const [y, m] = iso.split('-').map(Number);
  return y * 12 + (m - 1);
}
function calCellsFor(year, month) {
  const J = window.JOTLA;
  const pad2 = n => String(n).padStart(2, '0');
  const isoOf = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = J.weekLead(new Date(year, month, 1)); // follows the week-start setting
  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const dt = new Date(year, month, -i); // day 0 is the previous month's last day
    cells.push({
      d: dt.getDate(),
      iso: isoOf(dt),
      inMonth: false
    });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({
    d,
    iso: `${year}-${pad2(month + 1)}-${pad2(d)}`,
    inMonth: true
  });
  let next = 1;
  while (cells.length < 42) {
    cells.push({
      d: next,
      iso: isoOf(new Date(year, month + 1, next)),
      inMonth: false
    });
    next++;
  }
  return cells;
}
function CalendarSheet({
  onClose,
  value,
  onSelect,
  minDate,
  maxDate,
  onClear,
  clearLabel = 'Clear the date'
}) {
  const J = window.JOTLA;
  const today = J.TODAY_ISO;
  const anchor = value && ISO_RE.test(value) ? value : today;

  // Item 43 (13 Jul 2026): the day grid swipes between months and follows the
  // finger, exactly like the Month tab. Same flash-free technique: one fixed
  // timeline of same-size month panels, so a settled swipe never rebuilds or
  // recentres anything. The timeline simply ENDS at the bound months, so a
  // swipe clamps exactly where the chevrons do; an open-ended bound gets a
  // ten-year timeline end. Only the shown month's near neighbours materialise
  // their cells; the rest are empty same-size panels.
  const minIdx = minDate ? monthIndexOf(minDate) : null;
  const maxIdx = maxDate ? monthIndexOf(maxDate) : null;
  const anchorIdx = monthIndexOf(anchor);
  const startIdx = minIdx !== null ? minIdx : anchorIdx - 120;
  const endIdx = maxIdx !== null ? maxIdx : anchorIdx + 120;
  const [shown, setShown] = useState(() => Math.max(startIdx, Math.min(endIdx, anchorIdx)));
  const year = Math.floor(shown / 12),
    month = shown % 12;
  const canPrev = shown > startIdx;
  const canNext = shown < endIdx;
  const monthIdxs = [];
  for (let i = startIdx; i <= endIdx; i++) monthIdxs.push(i);
  const pagerRef = useRef(null);
  const settleRef = useRef(null);
  const targetRef = useRef(shown); // where the pager is headed, for rapid chevrons
  useLayoutEffect(() => {
    // Park the pager on the anchor month before the first paint; never again
    // from a render (a live gesture must never have the grid moved under it).
    const el = pagerRef.current;
    if (el && el.clientWidth) el.scrollLeft = (targetRef.current - startIdx) * el.clientWidth;
    // Re-align on a real resize: a paging scroller holds its pixel offset
    // across a resize, which would otherwise wedge it between two months.
    const realign = () => {
      const el2 = pagerRef.current;
      if (el2 && el2.clientWidth) el2.scrollLeft = (targetRef.current - startIdx) * el2.clientWidth;
    };
    window.addEventListener('resize', realign);
    return () => window.removeEventListener('resize', realign);
  }, []);
  const adopt = target => {
    targetRef.current = target;
    setShown(s => target === s ? s : target);
  };
  // Title and chevrons follow the settle; the scroll is the single source of
  // movement.
  const onPagerScroll = () => {
    clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const el = pagerRef.current;
      if (!el || !el.clientWidth) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      adopt(Math.max(startIdx, Math.min(endIdx, startIdx + i)));
    }, 90);
  };
  const move = delta => {
    const el = pagerRef.current;
    const next = Math.max(startIdx, Math.min(endIdx, targetRef.current + delta));
    if (next === targetRef.current || !el || !el.clientWidth) return;
    targetRef.current = next;
    el.scrollTo({
      left: (next - startIdx) * el.clientWidth,
      behavior: 'smooth'
    });
  };
  const pick = iso => {
    onSelect(iso);
    onClose();
  };
  const chevron = dir => {
    const enabled = dir === 'prev' ? canPrev : canNext;
    return /*#__PURE__*/React.createElement("button", {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose,
    style: {
      zIndex: 45
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14
    }
  }, chevron('prev'), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, J.MONTH_NAMES[month], " ", year), chevron('next')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 6,
      marginBottom: 8
    }
  }, J.dowLabels().map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
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
  }), monthIdxs.map(idx => {
    if (Math.abs(idx - shown) > 2) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        "aria-hidden": "true",
        style: {
          flex: '0 0 100%',
          width: '100%',
          scrollSnapAlign: 'start'
        }
      });
    }
    const py = Math.floor(idx / 12),
      pm = idx % 12;
    // Only the settled month is exposed to assistive tech and the tab
    // order; the materialised neighbours are visual-only until adopted.
    const hot = idx === shown;
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      "aria-hidden": hot ? undefined : 'true',
      style: {
        flex: '0 0 100%',
        width: '100%',
        scrollSnapAlign: 'start',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6,
        alignContent: 'start'
      }
    }, calCellsFor(py, pm).map(c => {
      const disabled = minDate !== undefined && c.iso < minDate || maxDate !== undefined && c.iso > maxDate;
      const selected = value !== null && value !== undefined && c.iso === value;
      const isToday = c.iso === today;
      const ink = selected ? '#fff' : disabled ? 'var(--line)' : isToday ? 'var(--blue)' : c.inMonth ? 'var(--ink)' : 'var(--faint)';
      const [cy, cm] = c.iso.split('-').map(Number);
      return /*#__PURE__*/React.createElement("button", {
        key: c.iso,
        onClick: () => !disabled && pick(c.iso),
        disabled: disabled,
        tabIndex: hot ? undefined : -1,
        "aria-label": `${c.d} ${J.MONTH_NAMES[cm - 1]} ${cy}`,
        "aria-pressed": selected,
        className: disabled ? '' : 'j-press',
        style: {
          aspectRatio: '1 / 1',
          borderRadius: 12,
          border: 'none',
          cursor: disabled ? 'default' : 'pointer',
          background: selected ? 'var(--blue)' : 'transparent',
          boxShadow: isToday && !selected ? 'inset 0 0 0 2px var(--blue)' : 'none',
          opacity: disabled ? 0.55 : c.inMonth ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "'Outfit', system-ui",
          fontWeight: selected || isToday ? 600 : 500,
          fontSize: 'calc(15px * var(--tscale, 1))',
          color: ink
        }
      }, c.d));
    }));
  })), onClear && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClear();
      onClose();
    },
    className: "j-press",
    style: {
      display: 'block',
      margin: '16px auto 0',
      minHeight: 44,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: 'calc(16px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--blue)'
    }
  }, clearLabel), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    onClick: onClose,
    style: {
      marginTop: onClear ? 10 : 16
    }
  }, "Cancel")));
}

// A read-only field wearing the j-input look exactly, that opens a
// CalendarSheet instead of a keyboard. The keyboard never opens for a date
// again. The consumer passes the date already formatted the way the app shows
// dates elsewhere, so the field never invents a format.
function DateField({
  value,
  placeholder,
  label,
  onClick,
  compact = false,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: "j-press",
    "aria-label": `${label}, ${value || placeholder || 'no day chosen'}, opens a calendar`,
    style: {
      width: '100%',
      borderRadius: 14,
      border: '1.5px solid var(--chip-border)',
      background: 'var(--card-2)',
      padding: compact ? '11px 12px' : '13px 14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textAlign: 'left',
      ...(style || {})
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: "'Outfit', system-ui",
      fontSize: `calc(${compact ? 15 : 16}px * var(--tscale, 1))`,
      color: value ? 'var(--ink)' : 'var(--faint)'
    }
  }, value || placeholder || ''), /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 18,
    color: "var(--faint)"
  }));
}

// THE CROWN GATE (founder, 6 Aug, app-wide): in the FREE app a Plus-tier row
// shows the solid gold crown in place of its control, with no "Plus" pill and
// no lecture: the crown is the whole sentence. Tapping a crowned row ALWAYS
// opens the Jotla Plus page. In the paid app the row renders its real control
// instead (callers branch on nav.plus). Replaces the old dashed locked card.
function PlusLockedCard({
  title,
  text,
  onClick,
  style,
  icon = 'lock'
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      padding: '14px 16px',
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      ...(style || {})
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    color: "var(--blue)",
    style: {
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, title), text && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 2
    }
  }, text)), /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 20,
    color: "var(--gold)",
    style: {
      flexShrink: 0
    }
  }));
}

// A document's display label honours the parent's own name for an Other type
// (founder, 9 Aug): canonical d.type stays underneath for colours and filters.
const docTypeLabel = d => d && d.typeOther ? d.typeOther : d ? d.type : '';

// Top bar for pushed (non-tab) screens
function PushHeader({
  title,
  subtitle,
  onBack,
  onClose,
  accent = '#1A56A8',
  bg = 'transparent'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px 10px',
      background: bg,
      position: 'sticky',
      top: 0,
      zIndex: 5
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      marginLeft: -10,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 23,
    color: "var(--muted)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 400,
      fontSize: 'calc(28px * var(--tscale, 1))',
      color: 'var(--ink)',
      lineHeight: 1.1
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      marginRight: -10,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 22,
    color: "var(--muted)"
  })));
}
function moodTint(mood) {
  return mood === 'good' ? 'var(--tint-green)' : mood === 'hard' ? 'var(--tint-red)' : 'var(--tint-amber)';
}

// ---- date range ----
// "Today" for range maths is always the real device date (was a stale hardcode).
const RANGE_TODAY = window.JOTLA.TODAY_ISO;
function isoMinusDays(iso, n) {
  const d = window.JOTLA.parseISO(iso);
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// returns {from, to} ISO strings or nulls (null = unbounded). preset 'Custom' uses the passed from/to.
function rangeBounds(preset, from, to) {
  switch (preset) {
    case 'This week':
      return {
        from: isoMinusDays(RANGE_TODAY, 4),
        to: RANGE_TODAY
      };
    // Mon 8 -> Fri 12
    case 'Last 2 weeks':
      return {
        from: isoMinusDays(RANGE_TODAY, 13),
        to: RANGE_TODAY
      };
    case 'Last 3 weeks':
      return {
        from: isoMinusDays(RANGE_TODAY, 20),
        to: RANGE_TODAY
      };
    case 'This month':
      return {
        from: RANGE_TODAY.slice(0, 8) + '01',
        to: RANGE_TODAY
      };
    case 'Custom':
      return {
        from: from || null,
        to: to || null
      };
    default:
      return {
        from: null,
        to: null
      };
    // Any time / This term / All time
  }
}
function inDateRange(iso, b) {
  if (!b) return true;
  if (b.from && iso < b.from) return false;
  if (b.to && iso > b.to) return false;
  return true;
}

// presets is an array; value = { preset, from, to }; onChange(next).
// The custom ends are picked from a CalendarSheet (12 Jul 2026: no typed
// dates anywhere). Either end can stay open: the sheet's clear puts it back.
function DateRangeControl({
  presets,
  value,
  onChange
}) {
  const J = window.JOTLA;
  const set = patch => onChange({
    ...value,
    ...patch
  });
  const [openFor, setOpenFor] = useState(null); // 'from' | 'to' | null
  const dateInput = which => {
    const raw = (value[which] || '').trim();
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'block',
        fontSize: 'calc(12.5px * var(--tscale, 1))',
        color: 'var(--faint)',
        fontWeight: 500,
        marginBottom: 6
      }
    }, which === 'from' ? 'From' : 'To'), /*#__PURE__*/React.createElement(DateField, {
      compact: true,
      value: ok ? `${J.fmtShort(raw)} ${raw.slice(0, 4)}` : null,
      placeholder: which === 'from' ? 'Start' : 'Today',
      label: which === 'from' ? 'From date' : 'To date',
      onClick: () => setOpenFor(which)
    }));
  };
  const openRaw = openFor ? (value[openFor] || '').trim() : '';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, presets.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    "aria-pressed": value.preset === p,
    className: 'j-chip' + (value.preset === p ? ' j-chip-on' : ''),
    onClick: () => set({
      preset: p
    })
  }, p))), value.preset === 'Custom' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 10
    }
  }, dateInput('from'), dateInput('to')), openFor && /*#__PURE__*/React.createElement(CalendarSheet, {
    onClose: () => setOpenFor(null),
    value: /^\d{4}-\d{2}-\d{2}$/.test(openRaw) ? openRaw : null,
    onSelect: iso => set({
      [openFor]: iso
    }),
    onClear: () => set({
      [openFor]: ''
    })
  }));
}

// Attached-photo tile inside an entry. With a real image (src) it renders it;
// otherwise it falls back to the caption tile.
function PhotoAttachment({
  caption = 'Photo attached',
  src
}) {
  if (src) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--photo-bg)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: caption || 'Attached photo',
      style: {
        display: 'block',
        width: '100%',
        maxHeight: 280,
        objectFit: 'cover'
      }
    }), caption && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 12px',
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: 'var(--faint)'
      }
    }, caption));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderRadius: 14,
      background: 'var(--photo-bg)',
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 20,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--faint)',
      fontWeight: 500
    }
  }, caption));
}

// Read an image file, downscale it, and hand back a compact JPEG data URL.
// Keeps attached photos small enough to live in on-device storage.
function fileToImageDataURL(file, maxDim, quality, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
window.fileToImageDataURL = fileToImageDataURL;

// ---- a child-mode day, laid out to be read (founder, 14 Aug) ----
// The child's walk saves as structured lines ("Place: Question? Answer"), and
// rendering them as one paragraph made a wall of words no tired parent, or a
// parent with dyslexia, should have to fight. One home for the layout: the
// note detail and every card read the same shape. Anything that does not
// parse cleanly falls back to the plain text with its line breaks kept, so
// the child's words are never lost or misfiled.
function isChildDayEntry(entry) {
  return !!entry && (entry.childMode === true || /shared their day in child mode/.test(String(entry.summary || '')));
}
function parseChildDay(summary) {
  const lines = String(summary || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length === 0 || !/shared their day in child mode/i.test(lines[0])) return null;
  // "Sam shared their day in child mode: felt ok in the classroom; felt happy in the lunch hall."
  // Any piece that does not parse cleanly bails the WHOLE note back to plain
  // text (arena catch, 14 Aug round 5: a partial parse silently dropped the
  // child's words; all-or-nothing never loses a word).
  const colon = lines[0].indexOf(':');
  const intro = (colon > -1 ? lines[0].slice(0, colon) : lines[0]).replace(/\.\s*$/, '') + '.';
  const places = [];
  const at = {};
  const groupOf = label => {
    const k = label.toLowerCase();
    if (!(k in at)) {
      at[k] = places.length;
      places.push({
        label,
        feeling: null,
        qa: []
      });
    }
    return places[at[k]];
  };
  if (colon > -1) {
    for (const bit of lines[0].slice(colon + 1).replace(/\.\s*$/, '').split(';')) {
      const m = bit.trim().match(/^felt (.+?) in the (.+)$/i);
      if (!m) return null;
      groupOf(m[2].charAt(0).toUpperCase() + m[2].slice(1)).feeling = m[1];
    }
  }
  // "Classroom: Who was there? Teachers, Mr Makombe" -> place, question, answer.
  // Every real question the walk asks ends in "?", so a line whose text after
  // the colon holds no "?" is NOT a new place: it is part of the previous
  // answer (e.g. legacy typed text like "Mum: picked me up"), and it stays
  // with the question it answered (arena catch, 14 Aug round 5: it used to
  // become a fabricated place heading).
  let lastQA = null;
  for (const line of lines.slice(1)) {
    const c = line.indexOf(': ');
    const q = c > 0 ? line.indexOf('?', c) : -1;
    if (c > 0 && q > -1) {
      lastQA = {
        question: line.slice(c + 2, q + 1),
        answer: line.slice(q + 1).trim()
      };
      groupOf(line.slice(0, c)).qa.push(lastQA);
    } else if (lastQA) {
      lastQA.answer = (lastQA.answer ? lastQA.answer + ' ' : '') + line;
    } else {
      return null; // an unexpected shape: hand back to plain text
    }
  }
  return {
    intro,
    places
  };
}
function ChildDaySummary({
  entry,
  compact
}) {
  const parsed = parseChildDay(entry.summary);
  if (!parsed) {
    return /*#__PURE__*/React.createElement("p", {
      className: "j-body",
      style: {
        whiteSpace: 'pre-line',
        fontSize: compact ? 'calc(16.5px * var(--tscale, 1))' : undefined,
        lineHeight: 1.4
      }
    }, entry.summary);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? 10 : 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, parsed.intro), parsed.places.map(pl => /*#__PURE__*/React.createElement("div", {
    key: pl.label
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14px * var(--tscale, 1))',
      color: 'var(--blue)',
      marginBottom: pl.qa.length ? 5 : 0
    }
  }, pl.label, pl.feeling ? ` · felt ${pl.feeling}` : ''), pl.qa.map((qa, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: i < pl.qa.length - 1 ? 8 : 0
    }
  }, qa.question && /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginBottom: 1
    }
  }, qa.question), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    }
  }, qa.answer || 'No answer given'))))));
}

// The solid kind pill: the tag shape with the kind colour as its ground, so
// the kind reads at a glance where the pale metadata tags stay quiet. Text
// and icon use the page colour, crisp on the kind colour in both palettes.
function KindPill({
  label,
  color,
  icon
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      background: color,
      padding: '5px 11px',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      whiteSpace: 'nowrap',
      lineHeight: 1,
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(13.5px * var(--tscale, 1))',
      color: 'var(--bg)'
    }
  }, icon, label);
}

// Entry card: clock time left, mood dot, setting chip, category chip, summary, optional photo.
//
// Kind colour (rewritten 16 Jul 2026): a dysregulation capture reads as its own
// kind at a glance. It is either a guided note (type 'handover') or a quick log
// in the Incidents category; both are the same thing to a parent, so both carry
// the left accent stripe and one solid plum kind pill reading "Dysregulation".
// It was two kinds in two colours (plum vs gate blue) until the tile was renamed
// to Dysregulation, which left the blue one wearing a name no screen used.
// Standard day logs keep their mood colours untouched.
function EntryCard({
  entry,
  onClick,
  showDate = false
}) {
  const J = window.JOTLA;
  const isHandover = entry.type === 'handover';
  const isDysreg = !isHandover && entry.category === 'Incidents';
  // Both are dysregulation captures and now read as one kind (founder, 16 Jul
  // 2026): a guided record and a quick Incidents note differ only in how much
  // was typed, which is Jotla's business, not something a parent should have to
  // decode. They wear the palette's own --dysreg plum, not the gate blue.
  const isDysregKind = isHandover || isDysreg;
  const kindColor = isDysregKind ? 'var(--dysreg)' : null;
  const timeLabel = entry.clock || entry.time;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      padding: 16,
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: kindColor ? 'hidden' : 'visible'
    }
  }, kindColor && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      background: kindColor
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 46,
      flexShrink: 0,
      paddingTop: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      letterSpacing: '0.01em'
    }
  }, timeLabel), showDate && /*#__PURE__*/React.createElement("span", {
    className: "j-meta",
    style: {
      marginTop: 1
    }
  }, J.fmtShort(entry.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MoodDot, {
    mood: entry.mood,
    size: 13
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-tag j-tag-grey"
  }, entry.setting), !isDysregKind && /*#__PURE__*/React.createElement("span", {
    className: "j-tag j-tag-blue"
  }, entry.categoryOther || entry.category), isDysregKind && /*#__PURE__*/React.createElement(KindPill, {
    label: "Dysregulation",
    color: "var(--dysreg)",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "note",
      size: 13,
      color: "var(--bg)"
    })
  }))), isChildDayEntry(entry) ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(ChildDaySummary, {
    entry: entry,
    compact: true
  })) : /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(16.5px * var(--tscale, 1))',
      marginTop: 10,
      lineHeight: 1.4
    }
  }, entry.summary), (entry.photo || entry.photoData) && /*#__PURE__*/React.createElement(PhotoAttachment, {
    caption: entry.photo,
    src: entry.photoData
  }))));
}

// One saved log (founder call, 16 Jul 2026): a Save session banks several
// moments at once, and the parent wants to read back the thing they just saved
// as ONE tidy log, not as scattered cards. The moments stay atomic underneath
// (each its own dated entry, so Find, the graph and the PDF pack still work);
// this is purely how a log is READ. Entries written in one Save share a logId.
function groupByLog(list) {
  const out = [];
  const at = {}; // logId -> index in out
  list.forEach(e => {
    if (!e.logId) {
      out.push([e]);
      return;
    }
    if (at[e.logId] === undefined) {
      at[e.logId] = out.length;
      out.push([e]);
    } else out[at[e.logId]].push(e);
  });
  return out;
}

// A log, organised by the part of day it happened in.
function LogCard({
  group,
  onOpen,
  showDate = false
}) {
  const J = window.JOTLA;
  const byTime = J.TIMES.map(t => [t, group.filter(e => e.time === t)]).filter(([, l]) => l.length > 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, group.length, " moments"), /*#__PURE__*/React.createElement("span", {
    className: "j-meta"
  }, showDate ? J.fmtShort(group[0].date) + ' · ' : '', "logged ", group[0].clock)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, byTime.map(([t, list]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 7
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, list.map(e => {
    const isH = e.type === 'handover';
    const isDysKind = isH || !isH && e.category === 'Incidents';
    return /*#__PURE__*/React.createElement("button", {
      key: e.id,
      onClick: () => onOpen(e),
      className: "j-press",
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        background: 'var(--card-2)',
        borderRadius: 12,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        paddingTop: 3,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(MoodDot, {
      mood: e.mood,
      size: 11
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "j-chiprow",
      style: {
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "j-tag j-tag-grey"
    }, e.setting), !isDysKind && /*#__PURE__*/React.createElement("span", {
      className: "j-tag j-tag-blue"
    }, e.categoryOther || e.category), isDysKind && /*#__PURE__*/React.createElement(KindPill, {
      label: "Dysregulation",
      color: "var(--dysreg)",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "note",
        size: 13,
        color: "var(--bg)"
      })
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(15px * var(--tscale, 1))',
        color: 'var(--body)',
        lineHeight: 1.4,
        whiteSpace: 'pre-line'
      }
    }, e.summary)));
  }))))));
}

// A day's entries, read as logs: a multi-moment Save becomes one LogCard, a
// lone note stays the plain card it always was.
function LogList({
  list,
  nav,
  showDate = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, groupByLog(list).map((group, i) => group.length > 1 ? /*#__PURE__*/React.createElement(LogCard, {
    key: group[0].logId || i,
    group: group,
    showDate: showDate,
    onOpen: e => nav.go('entry', {
      id: e.id
    })
  }) : /*#__PURE__*/React.createElement(EntryCard, {
    key: group[0].id,
    entry: group[0],
    showDate: showDate,
    onClick: () => nav.go('entry', {
      id: group[0].id
    })
  })));
}

// labelled section heading inside scroll areas
function SectionLabel({
  children,
  right
}) {
  /* Neutral shell (6 Aug): section headers are small, semibold and accent-coloured,
     no longer uppercase-faint. One component restyles every screen's sections. */
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      margin: '0 0 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(13px * var(--tscale, 1))',
      letterSpacing: '0.02em',
      color: 'var(--blue)'
    }
  }, children), right);
}

// The five count blocks shared by the Today strip and the Month graph
// (12 Jul 2026): Good / Mixed / Hard days, then Gate and Dysregulation
// moments in their own colours. Dysregulation sits LAST, and the row is
// JUSTIFIED (founder, 12 Jul 2026 fourth pass, native parity): every column
// shrink-wraps its content (no flex weighting; the old 2.2 on Dysregulation
// is gone) and the row spreads them space-between, so the gaps are even, the
// first column sits flush left and the last flush right (which keeps the
// long Dysregulation label tucked to the card edge, labelEnd). The bars
// share one slim width so the counts compare honestly. Columns keep
// minWidth: 0 so the nowrap labels can still ellipsize rather than overflow
// on the tightest dial-and-width mixes. The Gate label stays "Gate": "Gate
// notes" would clip on narrow screens at the larger text dials.
//
// Counting rule (stated once, applied to both graphs): the three mood bars
// count DAYS, dayMood folding every entry's mood in, so a dysregulation
// capture's hard mood still colours its day. The fourth bar counts MOMENTS:
// every dysregulation capture, however it was recorded.
//
// ONE Dysregulation bar since 16 Jul 2026 (founder). It was two, Gate (guided,
// type 'handover') beside Dysregulation (a quick Incidents log), which left two
// bars meaning the same thing to a parent and, after the tile was renamed to
// Dysregulation, two different names for one feature. They are summed here, so
// no moment is lost or double counted, and the split by how-it-was-typed stays
// where it belongs: inside the entry.
// `color` paints the bar and the count; `ink` carries the label. They are the same
// hue, but the vivid bar colours are 2.1-3.7:1 on white and cannot legally carry
// text, so the label takes the -ink variant the palette already keeps for exactly
// this (founder, 16 Jul: "make the text for each graph bar same colour as the
// graph bar" (same colour, still readable).
function kindBarBlocks({
  good,
  ok,
  hard,
  dysreg
}) {
  return [{
    key: 'good',
    label: 'Good',
    n: good,
    color: window.MOOD_COLOURS.good,
    ink: 'var(--green-ink)'
  }, {
    key: 'ok',
    label: 'Mixed',
    n: ok,
    color: window.MOOD_COLOURS.ok,
    ink: 'var(--amber-ink)'
  }, {
    key: 'hard',
    label: 'Hard',
    n: hard,
    color: window.MOOD_COLOURS.hard,
    ink: 'var(--red-ink)'
  }, {
    key: 'dysreg',
    label: 'Dysregulation',
    n: dysreg,
    color: 'var(--dysreg)',
    ink: 'var(--dysreg-ink)'
  }];
}
function KindBars({
  blocks,
  maxN
}) {
  return (
    /*#__PURE__*/
    // Equal columns (flex: 1), not content-width ones (founder, 16 Jul: "align
    // them justify"). Sizing each column to its own label made the Dysregulation
    // column 78px against ~30px for the others, so the bars sat at 54/134/212/312:
    // even gaps of ~79px, then a 100px jump. Equal columns space them evenly and
    // the old labelEnd right-align hack is no longer needed.
    React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4,
        alignItems: 'flex-end',
        minHeight: 92
      }
    }, blocks.map(b => {
      const h = 22 + b.n / maxN * 54; // taller bar for a higher count
      return /*#__PURE__*/React.createElement("div", {
        key: b.key,
        style: {
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "'Outfit', system-ui",
          fontWeight: 600,
          fontSize: 'calc(16px * var(--tscale, 1))',
          color: b.color,
          lineHeight: 1
        }
      }, b.n), /*#__PURE__*/React.createElement("div", {
        style: {
          width: 36,
          height: h,
          borderRadius: 18,
          background: b.color
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 'calc(12px * var(--tscale, 1))',
          fontWeight: 500,
          color: b.ink,
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, b.label));
    }))
  );
}

// Month summary: the four count blocks + a plain trend line.
function MiniMonthStrip({
  entries,
  onOpen
}) {
  const J = window.JOTLA;
  let good = 0,
    ok = 0,
    hard = 0;
  const _my = J.TODAY_ISO.slice(0, 4),
    _mm = J.TODAY_ISO.slice(5, 7);
  const _dim = new Date(Number(_my), Number(_mm), 0).getDate();
  for (let d = 1; d <= _dim; d++) {
    const iso = `${_my}-${_mm}-${String(d).padStart(2, '0')}`;
    const m = J.dayMood(entries.filter(e => e.date === iso));
    if (m === 'good') good++;else if (m === 'ok') ok++;else if (m === 'hard') hard++;
  }
  const monthEntries = entries.filter(e => e.date.startsWith(`${_my}-${_mm}-`));
  const dysreg = monthEntries.filter(e => e.type === 'handover' || e.category === 'Incidents').length;
  const blocks = kindBarBlocks({
    good,
    ok,
    hard,
    dysreg
  });
  const maxN = Math.max(good, ok, hard, dysreg, 1);
  const _hc = {};
  entries.forEach(e => {
    if (e.mood === 'hard') _hc[e.category] = (_hc[e.category] || 0) + 1;
  });
  const _top = Object.entries(_hc).sort((a, b) => b[1] - a[1])[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card j-press",
    onClick: onOpen,
    style: {
      padding: 18,
      cursor: 'pointer'
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
  }, "This month"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--blue)',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, "Open Month view ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement(KindBars, {
    blocks: blocks,
    maxN: maxN
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 16
    }
  }, _top ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, _top[0]), " entries come up most often as the hard moments. Tap Find to see them gathered.") : dysreg > 0
  // Dysregulation moments can carry a good or mixed mood, so "no hard
  // moments" alone would sit dishonestly next to a plum bar with a count.
  ? `${dysreg} dysregulation ${dysreg === 1 ? 'moment' : 'moments'} logged this month, none marked as a hard moment.` : 'No hard moments logged so far. Long may it last.'));
}
Object.assign(window, {
  PushHeader,
  EntryCard,
  LogCard,
  LogList,
  groupByLog,
  KindPill,
  SectionLabel,
  MiniMonthStrip,
  kindBarBlocks,
  KindBars,
  moodTint,
  PhotoAttachment,
  DateRangeControl,
  rangeBounds,
  inDateRange,
  PlusLockedCard,
  pagerKeyProps,
  StoryDeck,
  CalendarSheet,
  DateField,
  isChildDayEntry,
  parseChildDay,
  ChildDaySummary
});