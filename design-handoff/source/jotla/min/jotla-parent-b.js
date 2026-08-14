function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// jotla-parent-b.jsx: Find, Evidence (records + document vault), Add document, Doc detail, Unlock, Settings.
const {
  useState: useStateB,
  useRef: useRefB,
  useEffect: useEffectB
} = React;
const THEME_TO_CAT = new Proxy({}, {
  get: (_, k) => k
});

// ---------------- Find ----------------
// Find keeps its place and its filters across tabs and pushes, like the
// calendar's keep (founder, 14 Aug); the rewind is the reset. Session-lifetime
// on purpose: a cold start begins clear. The drawer's draft and its open state
// ride along too, so leaving mid-edit and coming back loses nothing ("make it
// the same environment I left it").
// ONE KEEP PER CHILD (founder, 14 Aug round 7 follow-up: "make the keeps per
// child"): the modules hold maps keyed by profile, and each screen picks its
// own child's keep at mount (screens remount on a profile switch, keyed in
// the app shell). Session-lifetime as ever; a cold start begins clear.
const FIND_KEEPS = {};
const FIND_RANGE_DEFAULT = {
  preset: 'Any time',
  from: '',
  to: ''
};
// Documents keeps its place the same way (founder, 14 Aug round 7)
const EV_KEEPS = {};
function FindScreen({
  nav,
  entries,
  view
}) {
  const J = window.JOTLA;
  // this child's own keep; every FIND_KEEP reference below reads and writes it
  const FIND_KEEP = FIND_KEEPS[nav.profileId] || (FIND_KEEPS[nav.profileId] = {});
  const saved = FIND_KEEP;
  // APPLIED filters: what the blue bar names and the results obey.
  const [q, setQ] = useStateB(saved.q || '');
  const [themes, setThemes] = useStateB(saved.themes || []);
  const [moods, setMoods] = useStateB(saved.moods || []);
  const [setting, setSetting] = useStateB(saved.setting || 'Any');
  const [range, setRange] = useStateB(saved.range || FIND_RANGE_DEFAULT);
  // The DRAFT: what the drawer edits. Search commits it to the applied set;
  // Cancel (or a bar tap, or the scrim of leaving) drops it, so the results
  // stay at the last thing that was actually searched (founder, 14 Aug).
  const [dq, setDq] = useStateB(saved.dq !== undefined ? saved.dq : saved.q || '');
  const [dthemes, setDthemes] = useStateB(saved.dthemes || saved.themes || []);
  const [dmoods, setDmoods] = useStateB(saved.dmoods || saved.moods || []);
  const [dsetting, setDsetting] = useStateB(saved.dsetting || saved.setting || 'Any');
  const [drange, setDrange] = useStateB(saved.drange || saved.range || FIND_RANGE_DEFAULT);
  // f: the drawer, 0 tucked behind the bar, 1 fully out, anywhere in between
  // while it tracks the finger (the physics of Jotla, same as the calendar).
  const [f, setF] = useStateB(typeof saved.f === 'number' ? saved.f : 0);
  const fRef = useRefB(0);
  fRef.current = f;
  const fOpen = f > 0.5;
  const scrollRef = useRefB(null);
  useEffectB(() => {
    Object.assign(FIND_KEEP, {
      q,
      themes,
      moods,
      setting,
      range,
      dq,
      dthemes,
      dmoods,
      dsetting,
      drange,
      f: fOpen ? 1 : 0
    });
  }, [q, themes, moods, setting, range, dq, dthemes, dmoods, dsetting, drange, fOpen]);
  // the + FAB steps aside while the drawer is out (arena catch, 14 Aug round
  // 4: it floated over the panel's lower chips); the view carries the state
  // up to the app shell, the Day-records pattern
  useEffectB(() => {
    nav.remember({
      findDrawer: fOpen
    });
  }, [fOpen]);
  useEffectB(() => {
    if (typeof saved.scrollY === 'number' && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY;
  }, []);
  // Once a push begins, the keep's scroll is SEALED: the outgoing scroller
  // fires one last browser scroll (top 0, detached) about 60ms after the
  // tap, and it used to clobber the place openEntry had just stashed
  // (arena catch, 14 Aug round 4). The seal plus the detached guard on the
  // handler below cover every teardown path, tab-away included.
  const sealRef = useRefB(false);
  const stashScroll = () => {
    const el = scrollRef.current;
    if (sealRef.current || !el || !el.isConnected || el.scrollHeight === 0) return;
    FIND_KEEP.scrollY = el.scrollTop;
  };
  const openEntry = id => {
    stashScroll();
    sealRef.current = true;
    nav.go('entry', {
      id
    });
  };
  const toggle = setter => val => setter(v => v.includes(val) ? v.filter(x => x !== val) : [...v, val]);

  // The settle after a release is the only animation on f, and it runs in JS
  // because it starts wherever the finger left it (the calendar's tween).
  const tweenRef = useRefB(null);
  const tween = (set, from, to) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      set(to);
      return;
    }
    let t0 = null;
    const step = ts => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 240);
      const e = 1 - Math.pow(1 - k, 3);
      set(from + (to - from) * e);
      if (k < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  };
  useEffectB(() => () => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
  }, []);

  // The drawer's height is measured off its real content, like the graph's,
  // so the fold is right at every text size and tier. The panel is CAPPED to
  // the space between the bar and the tab bar, and its filter body scrolls
  // inside, so the Search and Cancel pills can never slide behind the tab
  // bar or off a short screen (arena catch, 14 Aug round 4: at full height
  // the pills sat under the tab bar and a Search tap changed tabs).
  const [drawerH, setDrawerH] = useStateB(0);
  const [capH, setCapH] = useStateB(0);
  const drawerInnerRef = useRefB(null);
  React.useLayoutEffect(() => {
    const el = drawerInnerRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h && Math.abs(h - drawerH) > 0.25) setDrawerH(h);
    const bar = barRef.current;
    const tb = document.querySelector('.j-tabbar');
    if (bar && tb) {
      // 22 = the panel's own 10px gap under the bar + 12px clear of the tab
      // bar (arena catch, 14 Aug round 6: the old -12 left the floating
      // panel 2px off the tab bar on a short phone with Custom open)
      const cap = Math.max(220, tb.getBoundingClientRect().top - bar.getBoundingClientRect().bottom - 22);
      if (Math.abs(cap - capH) > 0.25) setCapH(cap);
    }
  });
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

  // the applied keyword leads the bar's label (arena catch, 14 Aug round 4:
  // a committed search filtered the results with nothing on the bar naming
  // it, and on free the keyword is the ONLY filter there is)
  const queryBits = [];
  if (q.trim()) queryBits.push('“' + q.trim() + '”');
  queryBits.push(...themes);
  if (setting !== 'Any') queryBits.push(setting);
  const rangeLabel = range.preset === 'Custom' ? (range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today') : range.preset === 'Any time' ? 'all dates' : range.preset.toLowerCase();
  queryBits.push(rangeLabel);

  // the corner rewind clears everything applied AND drafted, and greys out
  // when there is nothing to clear
  const isClear = !q.trim() && themes.length === 0 && moods.length === 0 && setting === 'Any' && range.preset === 'Any time' && !range.from && !range.to;
  const isDraftClear = !dq.trim() && dthemes.length === 0 && dmoods.length === 0 && dsetting === 'Any' && drange.preset === 'Any time' && !drange.from && !drange.to;
  const resetAll = () => {
    setQ('');
    setThemes([]);
    setMoods([]);
    setSetting('Any');
    setRange(FIND_RANGE_DEFAULT);
    setDq('');
    setDthemes([]);
    setDmoods([]);
    setDsetting('Any');
    setDrange(FIND_RANGE_DEFAULT);
  };
  // the drawer's own rewind clears the DRAFT; Search then makes it real
  const resetDraft = () => {
    setDq('');
    setDthemes([]);
    setDmoods([]);
    setDsetting('Any');
    setDrange(FIND_RANGE_DEFAULT);
  };

  // Search commits the draft and tucks the drawer away; Cancel drops the
  // draft, so the results stay at the last thing actually searched.
  const applyDraft = () => {
    setQ(dq);
    setThemes(dthemes);
    setMoods(dmoods);
    setSetting(dsetting);
    setRange(drange);
    tween(setF, fRef.current, 0);
  };
  const cancelDraft = () => {
    setDq(q);
    setDthemes(themes);
    setDmoods(moods);
    setDsetting(setting);
    setDrange(range);
    tween(setF, fRef.current, 0);
  };
  const toggleDrawer = () => {
    if (fOpen) {
      cancelDraft();
      return;
    }
    // opening always begins from what is applied, never a stale draft
    setDq(q);
    setDthemes(themes);
    setDmoods(moods);
    setDsetting(setting);
    setDrange(range);
    tween(setF, fRef.current, 1);
  };

  // THE BAR IS THE HANDLE (founder, 14 Aug): drag it and the drawer follows
  // the finger, down to open, up to tuck; let go and it settles to its own
  // nearest half, the same physics as the calendar. A tap toggles. The bar
  // carries touch-action: none so the browser can never claim the drag as a
  // scroll mid-gesture (the 13 Aug pointercancel lesson).
  const barRef = useRefB(null);
  const barDraggedRef = useRefB(false);
  // The measured height rides a REF into the gesture (arena catch, 14 Aug
  // round 4): with drawerH in the effect's deps, the first drag's own
  // re-measure tore the listeners down mid-gesture and orphaned it, frozen
  // between states with no settle. The span is read at pointerdown instead,
  // and the listeners live for the screen's whole life.
  const drawerHRef = useRefB(0);
  drawerHRef.current = drawerH;
  useEffectB(() => {
    const el = barRef.current;
    if (!el) return undefined;
    let from = null;
    const down = ev => {
      // a grab holds the drawer where it is: a settle still in flight is
      // cancelled, and the drag continues from the live value
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      try {
        el.setPointerCapture(ev.pointerId);
      } catch (e) {}
      from = {
        y: ev.clientY,
        f0: fRef.current,
        span: Math.max(160, drawerHRef.current || 320)
      };
    };
    const move = ev => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      if (Math.abs(dy) > 4) barDraggedRef.current = true; // a drag must not also read as a tap
      setF(Math.max(0, Math.min(1, from.f0 + dy / from.span)));
    };
    const up = () => {
      if (!from) return;
      from = null;
      const now = fRef.current;
      tween(setF, now, now > 0.5 ? 1 : 0);
      // the guard outlives the release just long enough to swallow the
      // click the browser fires after a drag, then a real tap works again
      setTimeout(() => {
        barDraggedRef.current = false;
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
  }, []);

  // Every filter lives in the drawer (founder, 14 Aug): search first, then
  // the Plus filter groups, or the locked card on free. All of it edits the
  // draft; nothing lands on the results until Search.
  const filtersBody = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--card-2)',
      border: '1.5px solid var(--chip-border)',
      borderRadius: 14,
      padding: '0 14px',
      height: 46,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 20,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("input", {
    value: dq,
    onChange: e => setDq(e.target.value),
    placeholder: "Search your notes",
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      background: 'transparent'
    }
  })), nav.plus ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Themes"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 10
    }
  }, J.FIND_THEMES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    "aria-pressed": dthemes.includes(t),
    className: 'j-chip' + (dthemes.includes(t) ? ' j-chip-on' : ''),
    onClick: () => toggle(setDthemes)(t)
  }, t))), /*#__PURE__*/React.createElement(SectionLabel, null, "Mood"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 10
    }
  }, J.FIND_MOODS.map(m => {
    const on = dmoods.includes(m.key);
    return /*#__PURE__*/React.createElement("button", {
      key: m.key,
      "aria-pressed": on,
      className: 'j-chip' + (on ? ' j-chip-on' : ''),
      onClick: () => toggle(setDmoods)(m.key)
    }, /*#__PURE__*/React.createElement(MoodDot, {
      mood: m.key,
      size: 11
    }), " ", m.label);
  })), /*#__PURE__*/React.createElement(SectionLabel, null, "Where"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 10
    }
  }, ['Any', 'School', 'Home', 'Club'].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    "aria-pressed": dsetting === s,
    className: 'j-chip' + (dsetting === s ? ' j-chip-on' : ''),
    onClick: () => setDsetting(s)
  }, s))), /*#__PURE__*/React.createElement(SectionLabel, null, "When"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DateRangeControl, {
    presets: ['Any time', 'This week', 'Last 2 weeks', 'Custom'],
    value: drange,
    onChange: setDrange
  }))) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    onClick: () => nav.go('unlock'),
    icon: "filter",
    title: "Filters",
    text: /*#__PURE__*/React.createElement(React.Fragment, null, "Theme, mood, place and dates.", /*#__PURE__*/React.createElement("br", null), "Keyword search is always free.")
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade",
    ref: scrollRef,
    onScroll: stashScroll,
    style: f > 0.05 ? {
      overflowY: 'hidden'
    } : undefined
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 10,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(TabTitle, {
    title: "Find",
    right: /*#__PURE__*/React.createElement("button", {
      className: "j-iconbtn",
      "data-find-rewind": true,
      disabled: isClear,
      "aria-label": "Clear the search and filters",
      onClick: resetAll,
      style: {
        opacity: isClear ? 0.35 : 1,
        cursor: isClear ? 'default' : 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "rewind",
      size: 21,
      color: isClear ? 'var(--faint)' : 'var(--muted)'
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-findstick",
    "data-find-stick": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-findbar",
    "data-find-bar": true,
    ref: barRef,
    role: "button",
    tabIndex: 0,
    "aria-expanded": fOpen,
    "aria-label": "Search and filters",
    onClick: () => {
      if (barDraggedRef.current) {
        barDraggedRef.current = false;
        return;
      }
      toggleDrawer();
    },
    onKeyDown: e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDrawer();
      }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "filter",
    size: 18,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      flex: 1,
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--blue)',
      fontWeight: 500
    }
  }, queryBits.join(', ')), /*#__PURE__*/React.createElement("span", {
    className: 'j-calarrow' + (fOpen ? ' j-open' : ''),
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 17,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "j-finddrawer",
    "data-find-drawer": true,
    style: {
      height: drawerH ? drawerH * f : f > 0.5 ? undefined : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: drawerInnerRef,
    style: {
      paddingTop: 10,
      transform: `translateY(${drawerH ? -((1 - f) * drawerH) : 0}px)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-finddrawer-in",
    style: {
      maxHeight: capH || undefined,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "j-h2"
  }, "Filters"), /*#__PURE__*/React.createElement("button", {
    className: "j-iconbtn",
    "data-drawer-rewind": true,
    disabled: isDraftClear,
    "aria-label": "Clear the search and filters",
    onClick: resetDraft,
    style: {
      opacity: isDraftClear ? 0.35 : 1,
      cursor: isDraftClear ? 'default' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rewind",
    size: 20,
    color: isDraftClear ? 'var(--faint)' : 'var(--muted)'
  }))), /*#__PURE__*/React.createElement("div", {
    "data-find-filters": true,
    style: {
      overflowY: 'auto',
      flex: '1 1 auto',
      minHeight: 0,
      WebkitOverflowScrolling: 'touch'
    }
  }, filtersBody), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    "data-find-search": true,
    style: {
      flex: 1,
      minHeight: 46
    },
    onClick: applyDraft
  }, "Search"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    "data-find-cancel": true,
    style: {
      flex: 1,
      minHeight: 46
    },
    onClick: cancelDraft
  }, "Cancel")))))), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      margin: '30px 0 10px'
    }
  }, matched.length, " ", matched.length === 1 ? 'note' : 'notes', " found"), matched.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 22,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, "Nothing matches those filters yet. Try removing one.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, matched.map(e => /*#__PURE__*/React.createElement(EntryCard, {
    key: e.id,
    entry: e,
    showDate: true,
    onClick: () => openEntry(e.id)
  }))))));
}

// ---------------- Evidence: records pack + document vault ----------------
// Build a clean, printable day record in a new tab. The browser's own
// Print, then Save as PDF, turns it into the family's PDF. Nothing is uploaded.
function openPrintPack(childLabel, rangeLabel, list) {
  const J = window.JOTLA;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const badge = k => k === 'contemporaneous' ? '<span style="background:#e7f6ee;color:#1e7a45;border-radius:99px;padding:2px 10px;font-size:11px;">Same day</span>' : '<span style="background:#fdf3e0;color:#a06b12;border-radius:99px;padding:2px 10px;font-size:11px;">Added later</span>';
  const rows = list.map(e => {
    let extra = '';
    if (e.type === 'handover' && e.handover) {
      const h = e.handover;
      const part = (l, v) => v ? '<p style="margin:4px 0;"><strong>' + esc(l) + ':</strong> ' + esc(v) + '</p>' : '';
      extra = '<div style="margin-top:6px;padding:8px 12px;background:#f5f7fb;border-radius:8px;">' + (h.behaviours && h.behaviours.length ? '<p style="margin:4px 0;"><strong>Seen:</strong> ' + esc(h.behaviours.join(', ')) + '</p>' : '') + (h.who && h.who.length ? part('Who was there', h.who.join(', ')) : '') + part('Where', h.where) + part('Before', h.before) + part('During', h.during) + part('After', h.after) + part('Lasted', h.duration) + part('What helped', h.helped) + '</div>';
    }
    return '<div style="padding:10px 0;border-bottom:1px solid #dde3ee;page-break-inside:avoid;">' + '<p style="margin:0 0 4px;font-size:12px;color:#1A56A8;"><strong>' + esc(J.fmtShort(e.date)) + ' ' + esc(e.date.slice(0, 4)) + ', ' + esc(e.clock || e.time) + '</strong> &nbsp; ' + esc(e.setting) + ' · ' + esc(e.categoryOther || e.category) + ' &nbsp; ' + badge(e.kind) + (e.editedOn ? ' <span style="color:#8892a6;font-size:10.5px;">edited ' + esc(J.fmtShort(e.editedOn)) + '</span>' : '') + '</p>' + '<p style="margin:0;font-size:13px;line-height:1.45;white-space:pre-line;">' + esc(e.summary) + '</p>' + extra + '</div>';
  }).join('');
  const w = window.open('', '_blank');
  if (!w) {
    alert('Your browser blocked the new tab. Allow pop-ups for this page and try again.');
    return false;
  }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jotla day record</title></head>' + '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#14223b;max-width:720px;margin:24px auto;padding:0 16px;">' + '<p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8892a6;margin:0 0 6px;">Day record · Jotla</p>' + '<h1 style="font-size:22px;margin:0 0 2px;">' + esc(childLabel) + '</h1>' + '<p style="font-size:12.5px;margin:0 0 14px;color:#5b6780;">' + esc(rangeLabel) + ' · ' + list.length + ' dated entries · Prepared ' + esc(J.fmtShort(J.TODAY_ISO)) + ' ' + esc(J.TODAY_ISO.slice(0, 4)) + '</p>' + rows + '<p style="font-size:10.5px;color:#8892a6;line-height:1.5;margin-top:14px;padding-top:12px;border-top:1px dashed #dde3ee;">' + 'Each entry shows when it was written. "Same day" means it was logged on the day it happened. "Added later" means it was written up afterwards. Prepared by the family using their own Jotla record.</p>' + '</body></html>');
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch (e) {}
  }, 500);
  return true;
}

// One document as a clean printable record (founder question, 7 Aug: "what are
// they supposed to do with it?"). The answer: read it, edit it, and take it
// back out. This is the taking-out: the details, the action, the history and
// any photos on one page, through the same print-to-PDF door the day record
// uses. Attached FILES cannot ride a print page; they open full from the
// document's own page, so here they are listed by name. Free for every tier:
// saved data is never held hostage. Documents stay OUT of the day-record PDF
// on purpose until Bupe decides otherwise (open question, logged 7 Aug).
function openPrintDoc(d, attachments) {
  const J = window.JOTLA;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const row = (l, v) => v ? '<p style="margin:6px 0;font-size:13px;"><strong>' + esc(l) + ':</strong> ' + esc(v) + '</p>' : '';
  const photos = attachments.filter(m => m.kind === 'photo');
  const files = attachments.filter(m => m.kind === 'file');
  const w = window.open('', '_blank');
  if (!w) {
    alert('Your browser blocked the new tab. Allow pop-ups for this page and try again.');
    return false;
  }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jotla document record</title></head>' + '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#14223b;max-width:720px;margin:24px auto;padding:0 16px;">' + '<p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8892a6;margin:0 0 6px;">Document record · Jotla</p>' + '<h1 style="font-size:22px;margin:0 0 2px;">' + esc(d.title) + '</h1>' + '<p style="font-size:12.5px;margin:0 0 14px;color:#5b6780;">' + esc(docTypeLabel(d)) + ' · from ' + esc(d.from) + ' · Prepared ' + esc(J.fmtShort(J.TODAY_ISO)) + ' ' + esc(J.TODAY_ISO.slice(0, 4)) + '</p>' + row('Received', J.fmtLong(d.received) + ' ' + d.received.slice(0, 4)) + row('About', d.about) + row('Action needed', d.action) + (d.editedOn ? '<p style="margin:6px 0;font-size:11.5px;color:#8892a6;">Details last edited ' + esc(J.fmtShort(d.editedOn)) + '. Earlier details stay on the record below.</p>' : '') + (d.history && d.history.length ? '<div style="margin-top:10px;padding:10px 14px;background:#f5f7fb;border-radius:8px;">' + '<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#8892a6;">What it said before</p>' + d.history.map(h => '<p style="margin:4px 0;font-size:12px;">Until ' + esc(J.fmtShort(h.on)) + ' ' + esc(h.on.slice(0, 4)) + ': ' + esc(h.title) + (h.about ? ' · ' + esc(h.about) : '') + (h.action ? ' · Action: ' + esc(h.action) : '') + '</p>').join('') + '</div>' : '') + (files.length ? '<p style="margin:12px 0 0;font-size:12px;color:#5b6780;">Attached file' + (files.length > 1 ? 's' : '') + ' (open from the document in Jotla): ' + files.map(m => esc(m.name || 'File')).join(', ') + '</p>' : '') + photos.map(m => '<img src="' + m.dataUrl + '" style="display:block;width:100%;margin-top:14px;border-radius:8px;page-break-inside:avoid;" alt="Photo of the document">').join('') + '</body></html>');
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch (e) {}
  }, 500);
  return true;
}

// How many things ride a document row: the media attachments plus the older
// single "scan" photo earlier builds kept (still honoured, never migrated away
// silently).
function docAttachedCount(doc) {
  return (doc.media ? doc.media.length : 0) + (doc.scan ? 1 : 0);
}

// A document log card (file layout). When the document itself is kept (12 Jul
// 2026), a small paperclip count rides the meta row, so the parent can see
// which letters carry their file at a glance.
// One silhouette per document type (founder, 7 Aug: "make the icons match the
// document"), echoing the type pill's colour so a row reads at a glance.
function docTypeStyle(type) {
  return {
    Letter: {
      icon: 'mail',
      bg: 'var(--tint-amber)',
      fg: 'var(--amber)'
    },
    Email: {
      icon: 'at',
      bg: 'var(--tint-green)',
      fg: 'var(--green-ink)'
    },
    Plan: {
      icon: 'clipboard',
      bg: 'var(--tint-blue)',
      fg: 'var(--blue)'
    },
    Report: {
      icon: 'doc',
      bg: 'var(--tag-grey-bg)',
      fg: 'var(--muted)'
    },
    Assessment: {
      icon: 'chart',
      bg: 'var(--tag-grey-bg)',
      fg: 'var(--muted)'
    }
  }[type] || {
    icon: 'folder',
    bg: 'var(--tag-grey-bg)',
    fg: 'var(--muted)'
  };
}
function DocCard({
  doc,
  onClick
}) {
  const J = window.JOTLA;
  const attached = docAttachedCount(doc);
  const ts = docTypeStyle(doc.type);
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      padding: 14,
      cursor: 'pointer',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: ts.bg,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ts.icon,
    size: 22,
    color: ts.fg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: 'j-tag ' + ({
      Plan: 'j-tag-plan',
      Letter: 'j-tag-letter',
      Email: 'j-tag-email'
    }[doc.type] || 'j-tag-grey')
  }, docTypeLabel(doc)), /*#__PURE__*/React.createElement("span", {
    className: "j-meta",
    style: {
      whiteSpace: 'nowrap'
    }
  }, J.fmtShort(doc.received), " ", doc.received.slice(0, 4)), attached > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-label": attached + ' attached',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "attach",
    size: 13,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("span", {
    className: "j-meta"
  }, attached))), /*#__PURE__*/React.createElement("p", {
    className: "j-strong",
    style: {
      fontSize: 'calc(16px * var(--tscale, 1))',
      lineHeight: 1.25,
      marginBottom: 3
    }
  }, doc.title), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      fontSize: 'calc(13.5px * var(--tscale, 1))'
    }
  }, "From ", doc.from), doc.action && /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      marginTop: 8,
      background: 'var(--tint-amber)',
      color: 'var(--amber)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 13,
    color: "var(--amber)"
  }), " ", doc.action)));
}
function EvidenceScreen({
  nav,
  entries,
  docs,
  profile,
  navView
}) {
  const J = window.JOTLA;
  // Back restores this page as it was: the open sub-tab, filters and scroll
  // position are remembered on the view, so reading one document and returning
  // lands the parent back on the Documents list where they left it. Since
  // round 7 (founder, 14 Aug: "leave it exactly what I left it on, don't
  // reset anything") the keep also survives TAB SWITCHES, exactly like the
  // calendar's and Find's: EV_KEEP holds the session's state, and the
  // view-borne copy (a push's return trip) wins over it when both exist.
  // this child's own keep; every EV_KEEP reference below reads and writes it
  const EV_KEEP = EV_KEEPS[nav.profileId] || (EV_KEEPS[nav.profileId] = {});
  const saved = {
    ...EV_KEEP,
    ...(navView && navView.ev || {})
  };
  const [view, setView] = useStateB(saved.tab || 'documents'); // documents leads (founder, 6 Aug)
  // Corner search (founder, 7 Aug): the magnifier sits top right and summons a
  // field that filters the document list by title, sender or type.
  const [docQ, setDocQ] = useStateB(saved.docQ || '');
  const [showDocQ, setShowDocQ] = useStateB(!!saved.showDocQ);
  const docsShown = docQ.trim() ? docs.filter(d => (d.title + ' ' + d.from + ' ' + d.type + ' ' + (d.typeOther || '')).toLowerCase().includes(docQ.trim().toLowerCase())) : docs;
  const [range, setRange] = useStateB(saved.range || {
    preset: 'Last 3 weeks',
    from: '',
    to: ''
  });
  const [themes, setThemes] = useStateB(saved.themes || []);
  const [done, setDone] = useStateB(false);
  const scrollRef = useRefB(null);
  useEffectB(() => {
    Object.assign(EV_KEEP, {
      tab: view,
      docQ,
      showDocQ,
      range,
      themes
    });
    nav.remember({
      ev: {
        tab: view,
        range,
        themes
      }
    });
  }, [view, docQ, showDocQ, range, themes]);
  useEffectB(() => {
    if (saved.scrollY && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY;
  }, []);
  // the scroll keep, sealed on push like Find's (the 14 Aug round-4 lesson:
  // the outgoing scroller fires one last detached scroll that clobbers it)
  const sealRef = useRefB(false);
  const stashScroll = () => {
    const el = scrollRef.current;
    if (sealRef.current || !el || !el.isConnected || el.scrollHeight === 0) return;
    EV_KEEP.scrollY = el.scrollTop;
  };
  const openDoc = id => {
    stashScroll();
    sealRef.current = true;
    nav.remember({
      ev: {
        tab: view,
        range,
        themes,
        scrollY: scrollRef.current ? scrollRef.current.scrollTop : 0
      }
    });
    nav.go('doc', {
      id
    });
  };
  const childLabel = profile ? `${profile.name}, ${profile.school}` : 'Sam, Oakfield Primary';
  const bounds = window.rangeBounds(range.preset, range.from, range.to);
  const rangeLabel = range.preset === 'Custom' ? (range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today') : range.preset;
  const inPack = entries.filter(e => (themes.length === 0 || themes.includes(e.category)) && window.inDateRange(e.date, bounds)).sort((a, b) => a.date < b.date ? -1 : 1);
  const toggleTheme = t => setThemes(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t]);
  const Seg = ({
    id,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: () => setView(id),
    style: {
      flex: 1,
      minHeight: 44,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(15px * var(--tscale, 1))',
      fontWeight: 500,
      background: view === id ? 'var(--card)' : 'transparent',
      color: view === id ? 'var(--blue)' : 'var(--muted)',
      boxShadow: view === id ? '0 4px 12px -8px rgba(20,40,80,0.4)' : 'none'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade",
    ref: scrollRef,
    onScroll: stashScroll
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 10,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement(TabTitle, {
    title: "Documents",
    right: /*#__PURE__*/React.createElement("button", {
      className: "j-iconbtn",
      "aria-label": "Search documents",
      onClick: () => {
        setView('documents');
        setShowDocQ(v => {
          if (v) setDocQ('');
          return !v;
        });
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 22,
      color: showDocQ ? 'var(--blue)' : 'var(--muted)'
    }))
  }), showDocQ && view === 'documents' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--card-2)',
      border: '1.5px solid var(--chip-border)',
      borderRadius: 14,
      padding: '0 14px',
      height: 52,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 20,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("input", {
    value: docQ,
    onChange: e => setDocQ(e.target.value),
    placeholder: "Search documents",
    autoFocus: true,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      background: 'transparent'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 999,
      background: 'var(--tag-grey-bg)',
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Seg, {
    id: "documents",
    label: "Documents"
  }), /*#__PURE__*/React.createElement(Seg, {
    id: "records",
    label: "Day records"
  })), view === 'records' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Date range"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(DateRangeControl, {
    presets: ['Last 3 weeks', 'This month', 'All time', 'Custom'],
    value: range,
    onChange: setRange
  })), /*#__PURE__*/React.createElement(SectionLabel, null, "Include themes"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 18
    }
  }, J.CATEGORIES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    "aria-pressed": themes.includes(t),
    className: 'j-chip' + (themes.includes(t) ? ' j-chip-on' : ''),
    onClick: () => toggleTheme(t)
  }, t))), /*#__PURE__*/React.createElement(SectionLabel, null, "Preview"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      background: 'var(--card)',
      border: '1px solid var(--line)',
      boxShadow: '0 18px 40px -24px rgba(20,40,80,0.45)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 16px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--faint)',
      margin: '0 0 8px'
    }
  }, "Day record"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(20px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: 0
    }
  }, childLabel), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 4
    }
  }, rangeLabel, " \xB7 ", inPack.length, " dated entries \xB7 Prepared ", J.fmtShort(J.TODAY_ISO), " ", J.TODAY_ISO.slice(0, 4))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 20px 16px'
    }
  }, inPack.slice(0, 6).map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      padding: '12px 0',
      borderBottom: i < Math.min(inPack.length, 6) - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(13px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--blue)',
      whiteSpace: 'nowrap'
    }
  }, J.fmtShort(e.date), " ", e.date.slice(0, 4), ", ", e.clock || e.time), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      fontSize: 'calc(10.5px * var(--tscale, 1))',
      padding: '2px 8px',
      background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
      color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)'
    }
  }, e.kind === 'contemporaneous' ? 'Same day' : 'Added later')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(13.5px * var(--tscale, 1))',
      color: 'var(--body)',
      margin: 0,
      lineHeight: 1.4
    }
  }, e.summary))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(11.5px * var(--tscale, 1))',
      color: 'var(--faint)',
      lineHeight: 1.5,
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px dashed var(--line)'
    }
  }, "Each entry shows when it was written. \"Same day\" means it was logged on the day it happened. \"Added later\" means it was written up afterwards. Any edits keep the original date and time.")))), view === 'documents' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, {
    right: /*#__PURE__*/React.createElement("span", {
      className: "j-meta"
    }, docsShown.length, " ", docQ.trim() ? 'found' : 'saved')
  }, "Your documents"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, docsShown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 22,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, docQ.trim() ? 'Nothing matches that search.' : 'No documents yet. Add the first letter or report and never lose it again.')) : docsShown.map(d => /*#__PURE__*/React.createElement(DocCard, {
    key: d.id,
    doc: d,
    onClick: () => openDoc(d.id)
  })))))), view === 'records' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '12px 20px calc(96px + env(safe-area-inset-bottom))',
      background: 'var(--fade-grad)'
    }
  }, nav.plus ? /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary j-btn-lg",
    onClick: () => {
      if (openPrintPack(childLabel, rangeLabel, inPack)) setDone(true);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "doc",
    size: 20,
    color: "#fff"
  }), " Create PDF")
  /* crown gate (founder, 6 Aug): a Plus-tier control wears the solid gold crown and opens the Jotla Plus page */ : /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary j-btn-lg",
    onClick: () => nav.go('unlock')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 20,
    color: "#EBBA4D"
  }), " Create PDF is part of Plus")), done && /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: () => setDone(false)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "j-sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--tint-green)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 28,
    color: "var(--green)"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      textAlign: 'center',
      marginBottom: 8
    }
  }, "Your day record is ready"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginBottom: 20
    }
  }, "It opened in a new tab. Use Print, then Save as PDF, to keep, print or share it. Nothing is uploaded anywhere."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: () => openPrintPack(childLabel, rangeLabel, inPack)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 20,
    color: "#fff"
  }), " Open it again"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 10
    },
    onClick: () => setDone(false)
  }, "Done"))));
}

// ---------------- The document itself (12 Jul 2026, native Round 7 parity) ----------------
// The vault can keep the letter with its details, as part of Plus: capture a
// photo or video, attach from photos, or pick a file such as a PDF. Free sees
// the honest locked card in the same spot; viewing and removing saved files
// never gate. This build follows the web's own storage reality: photos are
// downscaled and kept inside the record, and picked files are kept inside the
// record too (so both travel inside Export my data); videos are never copied,
// exactly like the note picker, so the record keeps an honest note of them.

// The mechanical prefill (the native build's doc-prefill rules, mirrored
// exactly). The ONLY sources are the picked file's own name and its own
// modified date: nothing is read from the file's content (true auto-populate
// stays the future Jotla AI tier), and a value the parent has set is never
// overwritten.
const DOC_EXT_RE = /\.[A-Za-z0-9]{1,5}$/; // one trailing dot + 1-5 alphanumerics
function titleFromFilename(name) {
  const base = String(name || '').replace(DOC_EXT_RE, '');
  const words = base.replace(/[_\-.]+/g, ' ').replace(/\s+/g, ' ').trim();
  return words.length > 0 ? words : null;
}
// The file's own modified day, only when it is trustworthy: a stamp landing on
// today carries no information (today is already what an empty field means),
// and anything in the future or before 2000 is a wrong clock, not a letter.
function receivedFromFileDate(lastModified, today) {
  if (typeof lastModified !== 'number' || !Number.isFinite(lastModified) || lastModified <= 0) return null;
  const d = new Date(lastModified);
  const day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  if (day >= today) return null;
  if (day < '2000-01-01') return null;
  return day;
}

// Browser storage is the honest limit here: a photo is downscaled to fit, but
// a file cannot be shrunk, so a very large file is refused kindly at pick time
// (saveJSON's storage-full alert stays as the backstop, per the info pages).
const DOC_FILE_CAP = 2 * 1024 * 1024;

// The saved attachment row keeps only what the record needs, never the
// picker's transient prefill metadata.
function keptDocMedia(list) {
  return list.map(m => {
    const r = {
      id: m.id,
      kind: m.kind
    };
    if (m.dataUrl) r.dataUrl = m.dataUrl;
    if (m.name) r.name = m.name;
    return r;
  });
}

// Open a kept file (a PDF or anything else) with the browser's own machinery:
// a new tab where the browser can show it, or a download when the tab is
// blocked. Never a dead tile.
function openDocFile(m) {
  try {
    const comma = m.dataUrl.indexOf(',');
    const mime = (m.dataUrl.slice(0, comma).match(/^data:([^;]+)/) || [])[1] || 'application/octet-stream';
    const bin = atob(m.dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], {
      type: mime
    }));
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.download = m.name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    alert('Sorry, this file could not be opened on this device.');
  }
}

// One kept-file row: the doc glyph, the original filename, an honest sub-line.
// Pending picks get a remove x; on the document page the row opens the file.
function DocFileTile({
  name,
  sub,
  onOpen,
  onRemove
}) {
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'var(--tint-blue)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "doc",
    size: 20,
    color: "var(--blue)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--ink)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, sub)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: 14,
      border: '1px solid var(--line)',
      background: 'var(--card)',
      padding: 10
    }
  }, onOpen ? /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: onOpen,
    "aria-label": 'Open the file ' + name,
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      padding: 0
    }
  }, inner) : /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, inner), onRemove && /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: onRemove,
    "aria-label": 'Remove file ' + name,
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      border: 'none',
      background: 'var(--tag-grey-bg)',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16,
    color: "var(--muted)"
  })));
}

// The video note row. Web reality, same as the note picker: the video itself
// is never copied, so the vault keeps an honest note of it instead.
const VIDEO_NOTE_SUB = 'The video itself stays safely in your photo library.';
function VideoNoteTile({
  onRemove
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderRadius: 14,
      border: '1px solid var(--line)',
      background: 'var(--card)',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: 'var(--tint-blue)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "video",
    size: 20,
    color: "var(--blue)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, "Video noted"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, VIDEO_NOTE_SUB)), onRemove && /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: onRemove,
    "aria-label": "Remove video note",
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      border: 'none',
      background: 'var(--tag-grey-bg)',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16,
    color: "var(--muted)"
  })));
}

// Capture / attach / pick the document itself: the note picker's two tiles
// plus a third, Pick a file, for the PDFs and other files letters actually
// arrive as. Everything picked waits as a pending tile with a remove x and is
// only written to the record on Save, so closing the screen discards it
// cleanly. Only picks from the FILE picker carry a usable name and date, and
// only those feed the mechanical prefill (a camera capture's generated
// filename says nothing about the letter).
let _docMediaSeq = 0;
function DocMediaPicker({
  items,
  onAdd,
  onRemove
}) {
  const [hint, setHint] = useStateB(null);
  const takeFiles = (fileList, fromFilePicker) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setHint(null);
    const out = [];
    let waiting = 0;
    let tooBig = null;
    let readFail = false;
    const done = () => {
      if (waiting > 0) return;
      const picked = out.filter(Boolean);
      if (picked.length) onAdd(picked);
      if (tooBig) setHint('"' + tooBig + '" is over 2 MB, more than this browser\'s storage can safely keep with the record. A photo of the letter works well instead.');else if (readFail) setHint('That file could not be read just now. You can try again, or capture a photo of it instead.');
    };
    files.forEach((f, idx) => {
      const id = 'dm' + Date.now() + '-' + _docMediaSeq++;
      const meta = fromFilePicker ? {
        name: f.name,
        lastModified: f.lastModified
      } : {};
      const type = f.type || '';
      if (type.indexOf('video/') === 0) {
        out[idx] = {
          id,
          kind: 'video',
          ...meta
        };
        return;
      }
      if (type.indexOf('image/') === 0) {
        waiting++;
        window.fileToImageDataURL(f, 1280, 0.75, url => {
          out[idx] = {
            id,
            kind: 'photo',
            dataUrl: url,
            ...meta
          };
          waiting--;
          done();
        });
        return;
      }
      if (f.size > DOC_FILE_CAP) {
        tooBig = f.name;
        return;
      }
      waiting++;
      const r = new FileReader();
      r.onload = () => {
        out[idx] = {
          id,
          kind: 'file',
          dataUrl: r.result,
          name: f.name,
          lastModified: f.lastModified
        };
        waiting--;
        done();
      };
      r.onerror = () => {
        readFail = true;
        waiting--;
        done();
      };
      r.readAsDataURL(f);
    });
    done();
  };
  {/* the caption hugs its label (founder, 9 Aug): 2px label-to-caption, 7px
      below the icon, matching the moment editor's tiles */}
  const tile = (label, sub, icon, inputProps) => /*#__PURE__*/React.createElement("label", {
    className: "j-press",
    style: {
      flex: 1,
      minHeight: 84,
      borderRadius: 14,
      cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 24,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500,
      marginTop: 7
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 2
    }
  }, sub), /*#__PURE__*/React.createElement("input", _extends({
    type: "file",
    style: {
      display: 'none'
    }
  }, inputProps)));
  const photoItems = items.map((m, i) => ({
    m,
    i
  })).filter(({
    m
  }) => m.kind === 'photo');
  const rowItems = items.map((m, i) => ({
    m,
    i
  })).filter(({
    m
  }) => m.kind !== 'photo');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, tile('Capture', 'Photo or video', 'camera', {
    accept: 'image/*,video/*',
    capture: 'environment',
    onChange: e => {
      takeFiles(e.target.files, false);
      e.target.value = '';
    }
  }), tile('Attach', 'From your photos', 'attach', {
    accept: 'image/*,video/*',
    multiple: true,
    onChange: e => {
      takeFiles(e.target.files, false);
      e.target.value = '';
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginTop: 12
    }
  }, tile('Pick a file', 'A PDF or any other file', 'doc', {
    accept: 'application/pdf,.pdf,.doc,.docx,.odt,.rtf,.txt,.csv,image/*,video/*',
    multiple: true,
    onChange: e => {
      takeFiles(e.target.files, true);
      e.target.value = '';
    }
  })), hint && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(13px * var(--tscale, 1))',
      lineHeight: 1.4,
      color: 'var(--muted)',
      margin: '8px 0 0'
    }
  }, hint), photoItems.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 12
    }
  }, photoItems.map(({
    m,
    i
  }) => /*#__PURE__*/React.createElement("span", {
    key: m.id,
    style: {
      position: 'relative',
      width: 86,
      height: 86,
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--line)',
      background: 'var(--photo-bg)',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: m.dataUrl,
    alt: "Photo of the document, waiting to be saved",
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => onRemove(i),
    "aria-label": "Remove photo",
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 26,
      height: 26,
      borderRadius: 8,
      border: 'none',
      background: 'rgba(255,255,255,0.92)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14,
    color: "#51607A"
  }))))), rowItems.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 12
    }
  }, rowItems.map(({
    m,
    i
  }) => m.kind === 'video' ? /*#__PURE__*/React.createElement(VideoNoteTile, {
    key: m.id,
    onRemove: () => onRemove(i)
  }) : /*#__PURE__*/React.createElement(DocFileTile, {
    key: m.id,
    name: m.name || 'File',
    sub: "Chosen from your files",
    onRemove: () => onRemove(i)
  }))));
}

// ---------------- Add document (onboarding questions) ----------------
function AddDocScreen({
  nav
}) {
  const J = window.JOTLA;
  // The document itself, waiting for Save (Plus). Closing the screen discards it.
  const [docMedia, setDocMedia] = useStateB([]);
  const [title, setTitle] = useStateB('');
  const [type, setType] = useStateB('Letter');
  const [from, setFrom] = useStateB('School');
  // An Other pill gets named by the parent (founder, 9 Aug: "otherwise they
  // wont know what Other is"). The type keeps canonical 'Other' underneath for
  // colours and filters, with the name in typeOther; a named Other source goes
  // straight into from, which is free text everywhere downstream.
  const [typeOther, setTypeOther] = useStateB('');
  const [fromOther, setFromOther] = useStateB('');
  const [received, setReceived] = useStateB('');
  const [about, setAbout] = useStateB('');
  const [action, setAction] = useStateB('');
  const [datePickerOpen, setDatePickerOpen] = useStateB(false);
  // Prefill honesty flags: each shows its one small hint line, and each dies
  // the moment the parent touches the field it filled.
  const [titlePrefilled, setTitlePrefilled] = useStateB(false);
  const [datePrefilled, setDatePrefilled] = useStateB(false);
  // True once the parent has picked a day themselves OR a prefill has filled
  // it: either way the date field is no longer at its untouched default.
  const [dateSet, setDateSet] = useStateB(false);

  // The mechanical prefill: from the picked file's own name and own modified
  // date, nothing else. Only picks that carry a name can prefill (the file
  // picker's), only into fields the parent has not set, and never a second
  // time once a field holds anything.
  const onAddMedia = picked => {
    setDocMedia(v => [...v, ...picked]);
    const source = picked.find(p => p.name);
    if (!source) return;
    if (title.trim() === '') {
      const fromName = titleFromFilename(source.name);
      if (fromName) {
        setTitle(fromName);
        setTitlePrefilled(true);
      }
    }
    if (!dateSet) {
      const fromDate = receivedFromFileDate(source.lastModified, J.TODAY_ISO);
      if (fromDate) {
        setReceived(fromDate);
        setDatePrefilled(true);
        setDateSet(true);
      }
    }
  };
  const save = () => {
    const doc = {
      id: 'doc' + Date.now(),
      title: title.trim() || 'Untitled document',
      type,
      typeOther: type === 'Other' ? typeOther.trim() : '',
      from: from === 'Other' && fromOther.trim() ? fromOther.trim() : from,
      received: /^\d{4}-\d{2}-\d{2}$/.test(received.trim()) ? received.trim() : J.TODAY_ISO,
      about: about.trim(),
      action: action.trim(),
      mood: 'good'
    };
    if (docMedia.length) doc.media = keptDocMedia(docMedia);
    nav.addDoc(doc);
    nav.back();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Add a document",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 120,
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, nav.plus ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "The document itself"), /*#__PURE__*/React.createElement(DocMediaPicker, {
    items: docMedia,
    onAdd: onAddMedia,
    onRemove: i => setDocMedia(v => v.filter((_, x) => x !== i))
  })) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    icon: "attach",
    title: "Add the document itself",
    text: "Keep the letter with its details. Part of Plus.",
    onClick: () => nav.go('unlock')
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "What is it?"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: title,
    onChange: e => {
      // The parent's own typing always wins; the prefill hint goes
      // the moment the words are theirs.
      setTitle(e.target.value);
      setTitlePrefilled(false);
    },
    placeholder: "Give it a name, e.g. EHC plan draft"
  }), titlePrefilled && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      color: 'var(--faint)',
      margin: '4px 0 0'
    }
  }, "Filled from the file name. Check it matches the letter."), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginTop: 12
    }
  }, J.DOC_TYPES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    "aria-pressed": type === t,
    className: 'j-chip' + (type === t ? ' j-chip-on' : ''),
    onClick: () => setType(t)
  }, t))), type === 'Other' && /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    style: {
      marginTop: 10
    },
    value: typeOther,
    onChange: e => setTypeOther(e.target.value),
    placeholder: "Say what it is, e.g. Tribunal bundle",
    "aria-label": "Say what kind of document this is"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Who is it from?"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, J.DOC_SOURCES.map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    "aria-pressed": from === s,
    className: 'j-chip' + (from === s ? ' j-chip-on' : ''),
    onClick: () => setFrom(s)
  }, s))), from === 'Other' && /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    style: {
      marginTop: 10
    },
    value: fromOther,
    onChange: e => setFromOther(e.target.value),
    placeholder: "Say who, e.g. Speech therapist",
    "aria-label": "Say who this document is from"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "When did you receive it?"), /*#__PURE__*/React.createElement(DateField, {
    value: /^\d{4}-\d{2}-\d{2}$/.test(received) ? J.fmtLong(received) + ' ' + received.slice(0, 4) : null,
    placeholder: "Left blank, today's date is used",
    label: "When did you receive it",
    onClick: () => setDatePickerOpen(true)
  }), datePrefilled && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      color: 'var(--faint)',
      margin: '4px 0 0'
    }
  }, "Filled from the file's own date. Check it matches the letter.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "What is it about?"), /*#__PURE__*/React.createElement("textarea", {
    className: "j-input",
    value: about,
    onChange: e => setAbout(e.target.value),
    rows: 3,
    placeholder: "A line so future-you remembers what is inside."
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Does it need a reply or action?"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: action,
    onChange: e => setAction(e.target.value),
    placeholder: "e.g. Reply by 30 June. Leave blank if not."
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
      background: 'var(--fade-grad)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary j-btn-lg",
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 22,
    color: "#fff"
  }), " Save document")), datePickerOpen && /*#__PURE__*/React.createElement(CalendarSheet, {
    onClose: () => setDatePickerOpen(false),
    value: /^\d{4}-\d{2}-\d{2}$/.test(received) ? received : null,
    onSelect: iso => {
      setReceived(iso);
      setDateSet(true);
      setDatePrefilled(false);
    }
  }));
}

// ---------------- Document detail ----------------
// Edit a document's details honestly: corrections are welcome, and the earlier
// details stay visible on the record. The document itself can be added here
// too (part of Plus, the web's own post-save door the native build defers);
// added files only commit on Save, and no prefill runs here, because every
// field already holds the parent's own value and a set value is never
// overwritten. Removing existing attachments lives on the document's page and
// never gates.
function EditDocSheet({
  doc,
  plus,
  onSave,
  onAddMedia,
  onUnlock,
  onClose
}) {
  const J = window.JOTLA;
  const [title, setTitle] = useStateB(doc.title);
  const [type, setType] = useStateB(doc.type);
  const [typeOther, setTypeOther] = useStateB(doc.typeOther || ''); // the parent's own name for an Other type (9 Aug)
  const [from, setFrom] = useStateB(doc.from);
  const [received, setReceived] = useStateB(doc.received);
  const [about, setAbout] = useStateB(doc.about || '');
  const [action, setAction] = useStateB(doc.action || '');
  const [newMedia, setNewMedia] = useStateB([]); // pending adds, committed on Save
  const [datePickerOpen, setDatePickerOpen] = useStateB(false);
  const alreadyAttached = docAttachedCount(doc);
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 12,
    border: '1.5px solid var(--chip-border)',
    background: 'var(--card-2)',
    padding: '10px 12px',
    fontFamily: "'Outfit', system-ui",
    fontSize: 'calc(15.5px * var(--tscale, 1))',
    color: 'var(--ink)',
    marginBottom: 12
  };
  const changed = title.trim() !== doc.title || type !== doc.type || typeOther.trim() !== (doc.typeOther || '') || from.trim() !== doc.from || received !== doc.received || about.trim() !== (doc.about || '') || action.trim() !== (doc.action || '');
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
  }, "Edit this document"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 14
    }
  }, "Corrections are fine. The earlier details are kept on the record."), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "Title"), /*#__PURE__*/React.createElement("input", {
    value: title,
    onChange: ev => setTitle(ev.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "What it is"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      marginBottom: 12
    }
  }, J.DOC_TYPES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    "aria-pressed": type === t,
    className: 'j-chip' + (type === t ? ' j-chip-on' : ''),
    onClick: () => setType(t)
  }, t))), type === 'Other' && /*#__PURE__*/React.createElement("input", {
    value: typeOther,
    onChange: ev => setTypeOther(ev.target.value),
    style: inputStyle,
    placeholder: "Say what it is, e.g. Tribunal bundle",
    "aria-label": "Say what kind of document this is"
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "From"), /*#__PURE__*/React.createElement("input", {
    value: from,
    onChange: ev => setFrom(ev.target.value),
    style: inputStyle
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "Date received"), /*#__PURE__*/React.createElement(DateField, {
    compact: true,
    value: /^\d{4}-\d{2}-\d{2}$/.test(received) ? J.fmtLong(received) + ' ' + received.slice(0, 4) : null,
    placeholder: "Pick the date",
    label: "Date received",
    onClick: () => setDatePickerOpen(true),
    style: {
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "About"), /*#__PURE__*/React.createElement("textarea", {
    value: about,
    onChange: ev => setAbout(ev.target.value),
    rows: 3,
    style: {
      ...inputStyle,
      resize: 'vertical'
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "Action needed (leave empty if none)"), /*#__PURE__*/React.createElement("input", {
    value: action,
    onChange: ev => setAction(ev.target.value),
    style: {
      ...inputStyle,
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 6
    }
  }, "The document itself"), plus ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, alreadyAttached > 0 && /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginBottom: 8
    }
  }, alreadyAttached, " already attached. View or remove them on the document's page."), /*#__PURE__*/React.createElement(DocMediaPicker, {
    items: newMedia,
    onAdd: p => setNewMedia(v => [...v, ...p]),
    onRemove: i => setNewMedia(v => v.filter((_, x) => x !== i))
  })) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    icon: "attach",
    title: "Add the document itself",
    text: "Keep the letter with its details. Part of Plus.",
    onClick: onUnlock,
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    disabled: !title.trim(),
    style: {
      opacity: title.trim() ? 1 : 0.5
    },
    onClick: () => {
      const rec = /^\d{4}-\d{2}-\d{2}$/.test(received) ? received : doc.received;
      if (changed && title.trim()) onSave({
        title: title.trim(),
        type,
        typeOther: type === 'Other' ? typeOther.trim() : '',
        from: from.trim(),
        received: rec,
        about: about.trim(),
        action: action.trim()
      });
      if (newMedia.length) onAddMedia(keptDocMedia(newMedia));
      onClose();
    }
  }, "Save the change"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 8
    },
    onClick: onClose
  }, "Cancel")), datePickerOpen && /*#__PURE__*/React.createElement(CalendarSheet, {
    onClose: () => setDatePickerOpen(false),
    value: /^\d{4}-\d{2}-\d{2}$/.test(received) ? received : null,
    onSelect: setReceived
  }));
}
function DocScreen({
  nav,
  docs,
  id
}) {
  const J = window.JOTLA;
  const d = docs.find(x => x.id === id);
  const [editing, setEditing] = useStateB(false);
  if (!d) return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Document",
    onBack: () => nav.back()
  }));
  // The document itself: the media rows plus the older single "scan" photo
  // earlier builds kept, shown the same way. Viewing and removing never gate:
  // saved data is never held hostage, whatever the tier.
  const attachments = [...(d.scan ? [{
    id: '__scan',
    kind: 'photo',
    dataUrl: d.scan
  }] : []), ...(d.media || [])];
  // Removing one attachment sits behind its own confirm, like every delete.
  const removeMedia = m => {
    const msg = m.kind === 'video' ? 'Remove this video note? It comes off this document. The video itself was never copied from your photo library.' : 'Remove this ' + (m.kind === 'photo' ? 'photo' : 'file') + "? It comes off this document and Jotla's copy is deleted from this device. This cannot be undone.";
    if (window.confirm(msg)) nav.removeDocMedia(d.id, m.id);
  };
  const Row = ({
    label,
    value
  }) => value ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      padding: '12px 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-sm",
    style: {
      flexShrink: 0
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--ink)',
      textAlign: 'right'
    }
  }, value)) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Document",
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
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: docTypeStyle(d.type).bg,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: docTypeStyle(d.type).icon,
    size: 26,
    color: docTypeStyle(d.type).fg
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-h3",
    style: {
      fontSize: 'calc(19px * var(--tscale, 1))'
    }
  }, d.title), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 2
    }
  }, docTypeLabel(d), " \xB7 from ", d.from), d.editedOn && /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      marginTop: 6,
      background: 'var(--tag-grey-bg)',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 13,
    color: "var(--muted)"
  }), " Edited ", J.fmtShort(d.editedOn)))), attachments.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, attachments.map(m => m.kind === 'photo' ? /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid var(--line)',
      background: 'var(--photo-bg)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: m.dataUrl,
    alt: "Photo of the document",
    style: {
      display: 'block',
      width: '100%'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => removeMedia(m),
    "aria-label": "Remove photo",
    style: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 10,
      border: 'none',
      background: 'rgba(255,255,255,0.92)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 17,
    color: "#51607A"
  }))) : m.kind === 'video' ? /*#__PURE__*/React.createElement(VideoNoteTile, {
    key: m.id,
    onRemove: () => removeMedia(m)
  }) : /*#__PURE__*/React.createElement(DocFileTile, {
    key: m.id,
    name: m.name || 'File',
    sub: "Chosen from your files. Tap to open.",
    onOpen: () => openDocFile(m),
    onRemove: () => removeMedia(m)
  }))), d.action && /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 14,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      background: 'var(--tint-amber)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20,
    color: "var(--amber)",
    style: {
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Action:"), " ", d.action)), /*#__PURE__*/React.createElement("div", {
    className: "j-card j-card-pad"
  }, /*#__PURE__*/React.createElement(Row, {
    label: "What it is",
    value: docTypeLabel(d)
  }), /*#__PURE__*/React.createElement(Row, {
    label: "From",
    value: d.from
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Received",
    value: J.fmtLong(d.received) + ' ' + d.received.slice(0, 4)
  }), d.about && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-sm"
  }, "About"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      marginTop: 4
    }
  }, d.about))), d.history && d.history.length > 0 && /*#__PURE__*/React.createElement("div", {
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
  }, "What it said before"), d.history.map((h, i) => /*#__PURE__*/React.createElement("div", {
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
  }, h.title, h.about ? ' · ' + h.about : '', h.action ? ' · Action: ' + h.action : '')))), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      color: 'var(--blue)'
    },
    onClick: () => openPrintDoc(d, attachments)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 18,
    color: "var(--blue)"
  }), " Print or save as PDF"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
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
      if (window.confirm('Move this document to the Bin? You can restore it for 30 days from Settings.')) {
        nav.deleteDoc(d.id);
        nav.back();
      }
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: "#C0392B"
  }), " Delete")))), editing && /*#__PURE__*/React.createElement(EditDocSheet, {
    doc: d,
    plus: nav.plus,
    onSave: patch => nav.updateDoc(d.id, patch),
    onAddMedia: items => nav.addDocMedia(d.id, items),
    onUnlock: () => {
      setEditing(false);
      nav.go('unlock');
    },
    onClose: () => setEditing(false)
  }));
}

// ---------------- Jotla Plus (the three-layer money model) ----------------

// The money model (decisions/log.md, 2026-08-08, Bupe's call on the first
// /arena verdict; supersedes the 6 Aug three-term ladder):
//   Free      £0 forever.
//   Plus      £49 for 6 months, £79 for a year (Best value). NO monthly term:
//             the arena found the £29 month ran 4.4x the annual rate against a
//             verified 1.2-2.1x category band, the highest rate charged to the
//             parents least able to pay, and the only way to try Plus. Cut.
//             Family Sync stays inside Plus and sells as launch-state.
//   Jotla AI  coming 2027, INDICATIVE ladder £89 for 6 months / £149 a year
//             with Plus included (£149 in total, not £79 + £149). Visible on
//             the paywall, nothing buyable before it exists. The 6 Aug £199
//             was cut the same day the arena showed every live AI-inclusive
//             comparable at or under about £120/yr (record: sen-help
//             App/Jotla-Arena-Price-Ladder-2026-08-08.md).
// There is no one-time price and no lifetime buyout of any kind. The old
// buy-once copy (pay once, yours to keep, no subscription, no timers) is
// retired with it and must not come back.
const PLUS_PRICE = '£79';
const PLUS_PERIOD = 'a year';
const TERM_PRICE = '£49';
const TERM_PERIOD = 'for 6 months';
const AI_PRICE = '£149';
const AI_TERM_PRICE = '£89';
// Jotla AI does not exist yet. While false, a Plus owner's Menu sells NOTHING
// (founder, 8 Aug night: no banner once Plus is paid for); flipping this true
// when the tier ships brings the navy AI ticket back into that slot.
const AI_AVAILABLE = false;

// Free is a calm, flat darker blue. Plus has its own purple identity. The premium
// navy + gold look (and the sparkle) dresses Jotla AI and the Settings upsell card.
const FREE_BLUE = '#1A56A8';
const PLUS_GRAD = 'linear-gradient(135deg, #3C2A72 0%, #6E54D6 100%)';
const PLUS_ACCENT = '#CDBBF7';
const PLUS_ACCENT_DEEP = '#6E54D6';
const PREMIUM_GRAD = 'linear-gradient(135deg, #14294A 0%, #1E5099 100%)';
const PREMIUM_GOLD = '#E6B85C';
const PREMIUM_GOLD_DEEP = '#C9912F';

// ==================== THE PAYWALL (redesign, 6-7 Aug 2026) ====================
// Both tiers behind one selector: Jotla Plus (purple) and Jotla AI (navy+gold,
// coming 2027, real price tabs, NO buy button before it exists). Real carousel
// art rides each tier. No fake discounts, no strikethroughs, no invented trial:
// the honest-marketing lock. Pricing decided 8 Aug (post-arena): Plus £49 / £79
// with no monthly term, and the indicative AI ladder £89 / £149 with Plus included.
const PLUS_SLIDES = [{
  t: 'Patterns and Month View',
  c: 'A calendar of green and amber days. Tap any day to read what happened behind it.',
  img: 'art/plus-1.jpg'
}, {
  t: 'PDF Evidence Pack',
  c: 'Turn any stretch of the record into one dated PDF, ready to hand over.',
  img: 'art/plus-2.jpg'
}, {
  t: 'Family Sync',
  c: "The record on every grown-up's phone. One of you logs it, both of you have it.",
  img: 'art/plus-3.jpg'
}, {
  t: 'Photos and Videos on Notes',
  c: 'Add the photo or the video to the note, so the day is shown as well as told.',
  img: 'art/plus-4.jpg'
}, {
  t: 'Dysregulation Mode',
  c: 'Five gentle questions in the hard moment, so nothing important is lost.',
  img: 'art/plus-5.jpg'
},
// Slide 6 (founder, 8-9 Aug): Emojis. Bupe's Higgsfield render (landed 9 Aug,
// nano_banana_2, same vector recipe as slides 1-5).
{
  t: 'Emojis',
  c: 'Swap the faces for the sticker look, everywhere a face shows.',
  img: 'art/plus-6.jpg'
}];
const AI_SLIDES = [{
  t: 'EHCP and SEND deadline tracker',
  c: 'Every deadline tracked, with what to do about a gap.',
  img: 'art/ai-1.jpg'
}, {
  t: 'On-device AI help',
  c: 'Ask about the record or the process. Answers stay on the phone.',
  img: 'art/ai-2.jpg'
}, {
  t: 'Current letter templates',
  c: 'The right letter for the moment, kept current with the law.',
  img: 'art/ai-3.jpg'
}, {
  t: 'Rights kept current',
  c: 'What you are entitled to, updated as the rules change.',
  img: 'art/ai-4.jpg'
}, {
  t: 'Voice capture',
  c: 'Say what happened and Jotla writes it down.',
  img: 'art/ai-5.jpg'
}];
function TermCard({
  label,
  price,
  per,
  sel,
  gold,
  badge
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      borderRadius: 14,
      padding: '13px 10px 11px',
      textAlign: 'center',
      position: 'relative',
      background: sel ? gold ? 'rgba(230,184,92,0.12)' : 'var(--plus-tint)' : 'var(--card)',
      border: '1.5px solid ' + (sel ? gold ? '#C9912F' : '#6E54D6' : 'var(--line)')
    }
  }, badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -9,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#EBBA4D',
      color: '#3A2A0C',
      fontSize: 'calc(10.5px * var(--tscale, 1))',
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 999,
      whiteSpace: 'nowrap'
    }
  }, badge), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 400,
      fontSize: 'calc(26px * var(--tscale, 1))',
      color: 'var(--ink)',
      marginTop: 3
    }
  }, price), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'calc(11.5px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, per));
}
function UnlockScreen({
  nav,
  initialTier
}) {
  const [tier, setTier] = useStateB(initialTier === 'ai' ? 'ai' : 'plus'); // plus | ai
  const [slide, setSlide] = useStateB(0);
  const slides = tier === 'ai' ? AI_SLIDES : PLUS_SLIDES;
  // The feature rail follows the finger (founder, 7 Aug: dots alone are not a
  // carousel). Pointer events cover touch and mouse in one path; touch-action
  // pan-y leaves vertical scrolling with the page and the horizontal axis with
  // us. Drag is live px offset on top of the slide's own -100% step; release
  // snaps to the nearest slide, with a short throw counting as intent.
  // The live gesture rides a REF, never state closures: a fast flick lands
  // down-move-up inside one frame, before React re-renders, and handlers
  // reading state would see stale zeros and drop the swipe (found empirically,
  // 7 Aug). State only mirrors the ref for rendering the rail.
  const [drag, setDrag] = useStateB(0);
  const [dragging, setDragging] = useStateB(false);
  const swipe = useRefB({
    x: 0,
    y: 0,
    horiz: null,
    on: false,
    dx: 0,
    t: 0
  });
  const onDown = e => {
    swipe.current = {
      x: e.clientX,
      y: e.clientY,
      horiz: null,
      on: true,
      dx: 0,
      t: e.timeStamp
    };
    setDragging(true);
    setDrag(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (x) {}
  };
  const onMove = e => {
    const s = swipe.current;
    if (!s.on) return;
    const dx = e.clientX - s.x,
      dy = e.clientY - s.y;
    if (s.horiz === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) s.horiz = Math.abs(dx) > Math.abs(dy);
    if (!s.horiz) return;
    // past either end the rail resists instead of scrolling into nothing
    const atEdge = slide === 0 && dx > 0 || slide === slides.length - 1 && dx < 0;
    s.dx = atEdge ? dx * 0.35 : dx;
    setDrag(s.dx);
  };
  const onUp = e => {
    const s = swipe.current;
    if (!s.on) return;
    s.on = false;
    setDragging(false);
    // a long pull or a short sharp flick both count as intent
    const flick = Math.abs(s.dx) > 18 && e.timeStamp - s.t < 250;
    if (Math.abs(s.dx) > 55 || flick) setSlide(v => Math.max(0, Math.min(slides.length - 1, v + (s.dx < 0 ? 1 : -1))));
    setDrag(0);
  };
  const seg = (id, label) => {
    const on = tier === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => {
        setTier(id);
        setSlide(0);
      },
      style: {
        flex: 1,
        minHeight: 32,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: "'Outfit', system-ui",
        fontSize: 'calc(13px * var(--tscale, 1))',
        fontWeight: 600,
        background: on ? id === 'ai' ? 'linear-gradient(135deg,#14294A,#1E5099)' : PLUS_GRAD : 'transparent',
        color: on ? id === 'ai' ? '#E6B85C' : '#fff' : 'var(--muted)'
      }
    }, label);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 10,
      paddingBottom: 30,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      background: tier === 'ai' ? PREMIUM_GRAD : PLUS_GRAD,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: tier === 'ai' ? '0 6px 14px -6px rgba(20,41,74,0.5)' : '0 6px 14px -6px rgba(60,42,114,0.5)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 18,
    color: tier === 'ai' ? '#E6B85C' : '#EBBA4D'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      gap: 4,
      padding: 3,
      borderRadius: 999,
      background: 'var(--tag-grey-bg)'
    }
  }, seg('plus', 'Jotla Plus'), seg('ai', 'Jotla AI')), /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.back(),
    "aria-label": "Close",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      marginRight: -10,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 22,
    color: "var(--muted)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      minHeight: 0,
      padding: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 400,
      fontSize: 'calc(31px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: 0
    }
  }, "Jotla ", tier === 'ai' ? /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: 'var(--aigold)',
      fontSize: 'calc(20px * var(--tscale, 1))',
      position: 'relative',
      top: -7
    }
  }, "AI") : /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: 'var(--plus-ink)',
      fontSize: 'calc(20px * var(--tscale, 1))',
      position: 'relative',
      top: -7
    }
  }, "+Plus")), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 6,
      lineHeight: 1.4,
      minHeight: 'calc(37px * var(--tscale, 1))'
    }
  }, tier === 'ai' ? /*#__PURE__*/React.createElement(React.Fragment, null, "The deadlines, the rights and the letters,", /*#__PURE__*/React.createElement("br", null), "kept current on your side.") : /*#__PURE__*/React.createElement(React.Fragment, null, "The tools to spot patterns", /*#__PURE__*/React.createElement("br", null), "and make your case."))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      maxWidth: '100%',
      margin: '0 auto',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
    style: {
      overflow: 'hidden',
      touchAction: 'pan-y',
      cursor: dragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      transform: 'translateX(calc(' + -slide * 100 + '% + ' + drag + 'px))',
      transition: dragging ? 'none' : 'transform .3s cubic-bezier(.25,.8,.35,1)'
    }
  }, slides.map((x, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: '0 0 100%',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: x.img,
    alt: "",
    draggable: false,
    style: {
      width: '100%',
      height: 158,
      objectFit: 'cover',
      borderRadius: 12,
      display: 'block',
      background: 'var(--tag-grey-bg)'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: '11px 0 0'
    }
  }, x.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--muted)',
      lineHeight: 1.45,
      margin: '4px 0 0',
      minHeight: 'calc(38px * var(--tscale, 1))'
    }
  }, x.c))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      marginTop: 10
    }
  }, slides.map((x, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setSlide(i),
    "aria-label": 'Slide ' + (i + 1),
    style: {
      width: i === slide ? 18 : 7,
      height: 7,
      borderRadius: 99,
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      background: i === slide ? tier === 'ai' ? 'var(--aigold)' : 'var(--plus-ink)' : 'var(--line)'
    }
  }))))), tier === 'plus' ? nav.plus ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: 0
    }
  }, "Plus is active on this phone."), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 4
    }
  }, "Your record is always yours, with or without it.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.dropPlus(),
    style: {
      display: 'block',
      margin: '10px auto 0',
      background: 'none',
      border: 'none',
      color: 'var(--faint)',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui"
    }
  }, "Switch Plus off (test build)")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TermCard, {
    label: "6 Months",
    price: "\xA349",
    per: "for 6 months"
  }), /*#__PURE__*/React.createElement(TermCard, {
    label: "One Year",
    price: "\xA379",
    per: /*#__PURE__*/React.createElement(React.Fragment, null, "less than", /*#__PURE__*/React.createElement("br", null), "\xA37 a month"),
    sel: true,
    badge: "Best value"
  })), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-lg",
    onClick: () => {
      nav.buyPlus();
      nav.back();
    },
    style: {
      marginTop: 12,
      background: PLUS_GRAD,
      color: '#fff',
      boxShadow: '0 14px 28px -10px rgba(60,42,114,0.6)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 20,
    color: "#EBBA4D"
  }), " Get Jotla Plus"), /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: 'var(--blue)',
      fontSize: 'calc(13px * var(--tscale, 1))',
      fontWeight: 500,
      margin: '10px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    color: "var(--blue)",
    stroke: 2.2
  }), " Everything in Free is included, always."), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      color: 'var(--faint)',
      fontSize: 'calc(11.5px * var(--tscale, 1))',
      lineHeight: 1.45,
      margin: '8px 0 0'
    }
  }, "Plus renews automatically at the end of its term: \xA349 every 6 months or \xA379 a year, charged to your Google Play account until you cancel. Cancel any time in Subscriptions on Google Play, and Plus stays on until the end of the time you have paid for. A subscription only ever switches off the paid tools.", /*#__PURE__*/React.createElement("br", null), "It never touches your history.")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TermCard, {
    label: "6 Months",
    price: "\xA389",
    per: "for 6 months",
    gold: true
  }), /*#__PURE__*/React.createElement(TermCard, {
    label: "One Year",
    price: "\xA3149",
    per: /*#__PURE__*/React.createElement(React.Fragment, null, "less than", /*#__PURE__*/React.createElement("br", null), "\xA313 a month"),
    sel: true,
    gold: true,
    badge: "Best value"
  })), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-lg",
    onClick: () => alert('Jotla AI arrives in 2027. Nothing is charged before it exists.'),
    style: {
      marginTop: 12,
      background: 'linear-gradient(135deg,#14294A,#1E5099)',
      color: '#fff',
      boxShadow: '0 14px 28px -10px rgba(20,41,74,0.6)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 20,
    color: "#E6B85C"
  }), " Get Jotla AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: 'var(--blue)',
      fontSize: 'calc(13px * var(--tscale, 1))',
      fontWeight: 500,
      margin: '10px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    color: "var(--blue)",
    stroke: 2.2
  }), " Jotla Plus is included in every term."), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      color: 'var(--faint)',
      fontSize: 'calc(11.5px * var(--tscale, 1))',
      lineHeight: 1.45,
      margin: '8px 0 0'
    }
  }, "Jotla AI arrives in 2027. Nothing can be bought before it exists, and these prices are indicative until they are set at launch. When it arrives it will renew automatically at the end of its term: \xA389 every 6 months or \xA3149 a year, charged to your Google Play account until you cancel, any time, in Subscriptions on Google Play. One price with Plus included, never one on top of another, and a subscription only ever switches off the paid tools.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      color: 'var(--faint)',
      fontSize: 'calc(12.5px * var(--tscale, 1))'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.go('infoabout'),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blue)',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'inherit',
      padding: 0
    }
  }, "Terms"), "\xB7", /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.go('infoabout'),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blue)',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'inherit',
      padding: 0
    }
  }, "Privacy"), "\xB7", /*#__PURE__*/React.createElement("button", {
    onClick: () => alert('On the phone build this restores a Google Play purchase.'),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blue)',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'inherit',
      padding: 0
    }
  }, "Restore"), "\xB7", /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.go('help'),
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--blue)',
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'inherit',
      padding: 0
    }
  }, "Help")))));
}
function InfoPage({
  nav,
  title,
  subtitle,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: title,
    subtitle: subtitle,
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, children)));
}

// One explainer card: icon disc, Cal Sans heading, optional status pill on
// the right, then paragraphs.
function InfoBlock({
  icon,
  title,
  pill,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      background: 'var(--tint-blue)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--blue)"
  })), /*#__PURE__*/React.createElement("span", {
    className: "j-h3",
    style: {
      flexShrink: 1
    }
  }, title), pill), children);
}

// A body paragraph inside a block, muted exactly like the old info sheets.
function InfoP({
  children,
  last = false
}) {
  return /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)',
      marginBottom: last ? 0 : 10
    }
  }, children);
}

// The grey status pill the Settings rows use for not-yet features.
function PlannedPill({
  label = 'Planned'
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: 'var(--tag-grey-bg)',
      color: 'var(--muted)'
    }
  }, label);
}

// One planned-feature row on the About page: title beside its status pill,
// then a one-line note.
function PlanRow({
  title,
  note,
  pill = 'Planned'
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement(PlannedPill, {
    label: pill
  })), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 2
    }
  }, note));
}

// About Jotla: THE information page. Structure mirrors the native
// InfoAboutScreen (4ca5829); the copy is this build's own, merged and deduped
// from the three folded pages. Every claim traces to this build's code:
//  - Version: window.JOTLA_BUILD (jotla-ui.jsx), the same number the Settings
//    footer prints. No typeface credit line (dropped 12 Jul 2026, founder).
//  - Mission and dates blocks: the folded mission page's copy. "Same day" and
//    "Added later" are the exact rendered labels (EntryScreen, Day view, the
//    PDF pack legend); the kind is decided once at save and edits keep a
//    wording history (nav.updateEntry). No legal-advice claim is made
//    anywhere; the honest line says so plainly instead.
//  - "We never send your record anywhere": there is no upload in this source
//    (no fetch, no XMLHttpRequest, no sendBeacon, no sockets; verified before
//    this copy was written). The promise is about what WE do: the doors below
//    move copies only when the parent opens them.
//  - Where the record lives: localStorage under jotla_* keys (jotla-app.jsx
//    load/saveJSON); photos and vault files are data URLs inside it, so they
//    ride the export too. Clearing site data taking the record, the storage
//    limit, the 2 MB pick-time refusal (DOC_FILE_CAP) and the quota alert
//    (saveJSON) are all real code paths. No phone-backup claim: that story is
//    the native app's, not this browser build's.
//  - Exactly three record-content doors exist, all user-driven: the export
//    download (SettingsScreen exportData + the DeleteChildSheet backup), the
//    printable day record (openPrintPack, Plus), and the gate-note teacher
//    email (mailto draft). Videos are never copied in (the picker keeps a
//    caption, never the file); "Jotla can only know an export was run" is the
//    backup health line's own honesty.
//  - Restore from an export is LIVE in this build (nav.importBackup), so it
//    sits under Where the record lives, not on the coming board.
//  - Child mode: leaving it takes a deliberate grown-up press-and-hold
//    (HoldButton / ChildExitPill) and the system Back is swallowed while it
//    is open (the popstate handler re-arms), so "safe by design" is code truth.
//  - Deleting: entry and document deletes sit behind confirms and cannot be
//    undone; removing a child is the guarded backup-first type-DELETE flow,
//    and the last child can never be removed (nav.deleteChild).
//  - The live-now list names only what this build really contains; the
//    Planned rows mirror the Unlock screen honestly. Plus copy: the Unlock
//    screen's own hero line and price note, verbatim fragments.

function InfoAboutScreen({
  nav
}) {
  const FEEDBACK_HREF = 'mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla prototype feedback') + '&body=' + encodeURIComponent('What I was trying to do:\n\nWhat I think, or what happened:\n\nWhich screen:\n\nMy phone / browser:\n');
  return /*#__PURE__*/React.createElement(InfoPage, {
    nav: nav,
    title: "About Jotla",
    subtitle: "What it is, how it protects you, what is coming"
  }, /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "star",
    title: "Jotla"
  }, /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Jotla by SEN Help."), " Early test build ", window.JOTLA_BUILD, "."), /*#__PURE__*/React.createElement(InfoP, null, "Designed and built by SEN Help (sen.help)."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "Jotla is a private, on-device record for parents of children with special educational needs: log the moments, the moods and the school handoffs, keep the details of every letter and report, and export the record when someone needs to see it.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "heart",
    title: "What Jotla is for"
  }, /*#__PURE__*/React.createElement(InfoP, null, "Every SEN parent is told to document everything. Nobody gives them the tool. Jotla is that tool."), /*#__PURE__*/React.createElement(InfoP, null, "When it matters, at an EHCP assessment, an annual review or a tribunal, your record is already organised, dated and ready to share. Take it into a review to show the year as it really was, not as memory serves it. Bring dated notes to a school meeting so the conversation starts from what happened. And when you write to the Local Authority, the dates and details are already in one place."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "One honest line: Jotla keeps the record, it does not give legal advice. What you can control is walking in with the facts ready.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "check",
    title: "What is live now"
  }, /*#__PURE__*/React.createElement(InfoP, null, "This early build already does the everyday job: quick daily logging with moods, dysregulation notes for the hard moments, photos and videos kept with a note (part of Plus), a vault for letters and reports that can keep the document itself, as a photo or the file (adding it is part of Plus), and keyword search of your own notes."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "Around that: the month calendar (its mood patterns are part of Plus), the printable day record (part of Plus), the tips deck for hard moments, the child check-in with its follow-up questions (the questions are part of Plus), dark mode, larger text sizes, a free export of the whole record, and restore from an export.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "clock",
    title: "Why the dates can be trusted"
  }, /*#__PURE__*/React.createElement(InfoP, null, "Every note carries an honest label: ", /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Same day"), " when it was logged on the day it happened, ", /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Added later"), " when it was not."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "The label is decided once, when the note is first saved, and it never changes. Editing the wording later does not rewrite it, and the note keeps its history of earlier wordings. Hours later is fine; a record that is straight about when things were written is worth more when someone else reads it.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "edit",
    title: "What makes a strong record"
  }, /*#__PURE__*/React.createElement(InfoP, null, "Log facts: what happened, when, and who was there. What you write can end up in front of other people when you choose to share it; that is the record doing its job. So keep other children out of what you write and what you photograph where you can."), /*#__PURE__*/React.createElement(InfoP, null, "Little and often beats perfect. The quick log takes seconds, and a plain sentence written today is worth more than a polished page written next month."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "After a hard handover, open Dysregulation. It asks you the right questions in the right order while everything is still fresh.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "shield",
    title: "Private by how it is built"
  }, /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "We never send your record anywhere."), " Jotla works without an account, a login or a cloud. Everything you write about your child stays on this device, and so does every photo you keep with a note and every document file you keep in the vault (adding them is part of Jotla Plus)."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "We never receive or access your data; there is nothing for us to read, lose or sell. This is not a policy we promise to follow, it is how the app is built: there is no upload in Jotla, so your record has nowhere to go except where you choose to send it.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "clock",
    title: "Where the record lives"
  }, /*#__PURE__*/React.createElement(InfoP, null, "On this device, in this browser's own storage for Jotla. That is why the app works anywhere once it has loaded: no account, no login and no internet connection needed. It also means this browser holds the record, so the copies that exist are the ones you make with Export my data."), /*#__PURE__*/React.createElement(InfoP, null, "One honest limit: browser storage is not for ever. Clearing this site's data in the browser's settings removes the record with it, and a browser can clear site data itself if the device runs very low on space. Storage also has a size limit, and photos and document files grow the record fastest: a very large file is refused kindly the moment you pick it (over 2 MB), and if a save ever cannot fit, Jotla warns you the moment it happens rather than losing anything quietly."), /*#__PURE__*/React.createElement(InfoP, null, "If this device is lost or broken and you have an export file saved somewhere safe, ", /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Restore from an export"), " (live in this build, in Settings) brings the record back on a new device, the child included. Anything already on the device stays: the restore adds what the file holds and never doubles up a note it already has."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "If there is no export, the record is gone with the device. That is the honest trade of a record that never leaves your hands, and why a saved copy every few weeks is good insurance.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "arrowRight",
    title: "What leaves this device"
  }, /*#__PURE__*/React.createElement(InfoP, null, "Nothing leaves this device unless you send it yourself. The app has exactly three doors out, and you open every one:"), /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Export my data"), " (in Settings, and offered again before you delete a child's record) saves one file to your device holding the whole of a child's record: every note with its date, its mood and what you wrote, the photos you kept with notes, the document files you kept in the vault, and the details of every letter and report, in a form the app can read straight back in. You choose where that file lives from there: your files, your own cloud drive, an email to yourself. It is free, and it stays free. Videos are never inside it: Jotla notes that a video exists but never copies the file, so the video itself stays in your own photo library."), /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Create PDF"), " (the day record, part of Plus) opens a printable page in a new tab. It carries your words, never your photos, and it goes nowhere until you print or save it yourself."), /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "Email this to the teacher"), " (after a dysregulation note) opens your own email app with the note typed in for you. Nothing goes anywhere until you press send."), /*#__PURE__*/React.createElement(InfoP, null, "Who can see the record? On this device: anyone you hand it to unlocked, in this browser, so your device's own lock is the front door. The child check-in screen is safe by design: leaving it takes a deliberate grown-up press-and-hold, never a stray tap, so a curious child cannot land in your notes. And once you share a copy, that copy is out of your hands: whoever you send it to can read it, keep it and pass it on. Share with people you trust, when it serves your child."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "One honest detail: Jotla can only know that an export was run. It cannot see whether the file was saved or sent, or where it ended up. Keeping that copy safe is in your hands too.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "edit",
    title: "Deleting things"
  }, /*#__PURE__*/React.createElement(InfoP, null, "Delete a note or a document from its own page. Every delete sits behind a confirm, and cannot be undone."), /*#__PURE__*/React.createElement(InfoP, null, "Remove a whole child's record from their details sheet (hold the avatar, or tap the child's card in Settings). It is deliberately hard to do by accident: you confirm what will go, you are offered a backup file first, and you type DELETE to finish. The last child cannot be removed: the app always keeps at least one record."), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "Deleting in Jotla deletes from this device. There is no copy on our side to linger, because there never was one. Copies you exported earlier stay wherever you put them.")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "clock",
    title: "What is coming"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PlanRow, {
    title: "Encrypted export",
    note: "Your own locked copy, only you hold the key. Until then, keep exports somewhere private, like your own cloud drive."
  }), /*#__PURE__*/React.createElement(PlanRow, {
    title: "Lock the app",
    note: "A fingerprint, face, or PIN on this device. Until then, your device's own lock protects the record, and phones can also lock or pin individual apps."
  }), /*#__PURE__*/React.createElement(PlanRow, {
    title: "Cloud backup to Google Drive",
    note: "Part of Jotla Plus: save a copy to your own Google Drive on its own. It moves a copy off the phone, so it is being built carefully and is not switched on yet.",
    pill: "Coming soon"
  }), /*#__PURE__*/React.createElement(PlanRow, {
    title: "Family Sync",
    note: "Part of Jotla Plus: the record on every grown-up's phone.",
    pill: "Coming soon"
  }), /*#__PURE__*/React.createElement(InfoP, {
    last: true
  }, "Planned means exactly that: none of the above is switched on yet, and nothing in this app pretends to be."))), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "sparkle",
    title: "Jotla Plus"
  }, /*#__PURE__*/React.createElement(InfoP, null, "The record itself is free, forever: logging, your timeline, search and export never cost anything, never expire, and stay yours."), /*#__PURE__*/React.createElement(InfoP, null, "Jotla Plus adds the tools to help you spot patterns and make your case: photos and videos kept with your notes, patterns and the Month view, deep filtering, Dysregulation Mode, and the PDF evidence pack. Family Sync, when it arrives, is part of Plus too. Plus is ", TERM_PRICE, " ", TERM_PERIOD, " or ", PLUS_PRICE, " for a year, through Google Play, and it stays on until the day a term runs out."), /*#__PURE__*/React.createElement(InfoP, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, "If your year ends, you keep everything."), " Your record is never held to ransom. If Plus ends, for any reason at all, whether you cancel, let it lapse, or a card quietly expires, you lose nothing you have written. Every entry stays. Your full timeline stays. Plain keyword search stays. Raw export stays. You can still make the PDF of everything you have already logged. Appeal-deadline safety reminders keep coming, with or without a subscription. A subscription only ever switches off the paid tools. It never touches your history."), /*#__PURE__*/React.createElement(InfoP, null, "Jotla AI is coming in 2027: ", AI_PRICE, " ", PLUS_PERIOD, ", with Jotla Plus included, so it is ", AI_PRICE, " in total and not one price on top of another."), /*#__PURE__*/React.createElement(InfoP, null, "Two of the emoji packs use open artwork, with thanks to their makers: Bold is Twemoji (CC BY 4.0) and Sticker is Microsoft Fluent Emoji (MIT licence). The other eight were drawn for Jotla. Full notices ship inside the app's moods folder."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    onClick: () => nav.go('unlock')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 18,
    color: "var(--blue)"
  }), " See what Plus adds")), /*#__PURE__*/React.createElement(InfoBlock, {
    icon: "heart",
    title: "Tell us what you think"
  }, /*#__PURE__*/React.createElement(InfoP, null, "This is an early test, and your feedback shapes it."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: () => {
      window.location.assign(FEEDBACK_HREF);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 18,
    color: "#fff"
  }), " Tell us what you think"), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      textAlign: 'center',
      marginTop: 8
    }
  }, "Opens your email.")));
}

// ---------------- Settings ----------------
// The founder's sixth pass (12 Jul 2026) consolidated ALL informational
// content into the one About page: the old "Where your record is kept",
// "How your data is kept", "Privacy, in plain words" and "What Jotla is for"
// rows repeated the same promises (two of them even opened the same page),
// so they are gone and About Jotla is the single door. The planned-feature
// rows (Encrypted export, Lock the app) explain themselves on About's coming
// board instead of sitting here as dead rows. "Add another child" left too
// (the header avatar's profile sheet owns it); this build never had a
// hand-the-phone row, so there was nothing to remove there. Interactive
// things stay: export runs, Restore from an export really restores (live in
// this build, unlike native), the child editor opens, the feedback mail sends.
function SettingsRow({
  icon,
  title,
  sub,
  onClick,
  right,
  last
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: onClick ? 'j-press' : '',
    style: {
      width: '100%',
      textAlign: 'left',
      border: 'none',
      background: 'none',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      background: 'var(--tint-blue)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(16px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, sub)), right || onClick && /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 18,
    color: "var(--faint)"
  }));
}
function Toggle({
  on,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onChange,
    role: "switch",
    "aria-checked": !!on,
    "aria-label": label || 'Toggle',
    style: {
      width: 52,
      height: 31,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--chip-border)',
      position: 'relative',
      transition: 'background .2s ease',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 24 : 3,
      width: 25,
      height: 25,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left .2s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.25)'
    }
  }));
}

// Backup health: the one story that kills this product is data loss, so Settings
// shows when the record was last saved out, not just how to do it.
const BACKUP_META_KEY = 'jotla_backup_v1';
// Browser storage quotas vary; photos grow a record fastest, so warn well
// before a save can start failing (saveJSON already alerts if one does).
const BACKUP_SIZE_SOFT_CAP = 20 * 1024 * 1024;
function backupHealthLine(meta) {
  if (!meta || !meta.lastExportAt) return 'No saved copy from this app yet.';
  const days = Math.max(0, Math.floor((Date.now() - new Date(meta.lastExportAt).getTime()) / 86400000));
  if (days === 0) return 'Last saved copy: today.';
  if (days === 1) return 'Last saved copy: yesterday.';
  return 'Last saved copy: ' + days + ' days ago.';
}
function recordSizeBytes() {
  let n = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('jotla_') === 0) n += (localStorage.getItem(k) || '').length * 2;
    }
  } catch (e) {}
  return n;
}

/* ==================== THE MENU / SETTINGS SYSTEM (redesign, 6-7 Aug 2026) ====================
   Menu (the tab) holds what parents reach for: the child, Plus, Backup and
   Restore, the Recycle Bin. Everything else lives one page deep behind the cog:
   Settings > Children / Appearance / Privacy / Reminders / Help and about.
   The crown gate rules every paid row: in the free app the solid gold crown
   replaces the control and tapping opens the Jotla Plus page. */

const FEEDBACK_HREF = 'mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla prototype feedback') + '&body=' + encodeURIComponent('What I was trying to do:\n\nWhat I think, or what happened:\n\nWhich screen:\n\nMy phone / browser:\n');

// A standalone menu row: one flat card per row, no trailing arrow (rows are
// tappable as a whole, 6 Aug). `trailing` carries a live value, a toggle, a
// count, or the gold crown.
// ONE row height for the whole system (founder, 14 Aug: "make each option
// height the same height as the tab"): a row without a sub-line used to sit
// ~20px shorter than one with (Take the tour, Help, About, Backup...), so
// every row and every sheet option now reserves the two-line height and
// centres inside it.
const ROW_MIN_H = 'calc(45px * var(--tscale, 1) + 28px)';
function MRow({
  icon,
  iconEl,
  title,
  sub,
  onClick,
  trailing,
  danger,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: onClick ? 'pointer' : 'default',
      padding: '14px 16px',
      display: 'flex',
      gap: 14,
      minHeight: ROW_MIN_H,
      alignItems: 'center',
      marginBottom: 10,
      ...(style || {})
    }
  }, iconEl || (icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    color: danger ? 'var(--red)' : 'var(--blue)',
    style: {
      flexShrink: 0
    }
  }) : null), /*#__PURE__*/React.createElement("span", {
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
      color: danger ? 'var(--red)' : 'var(--ink)'
    }
  }, title), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 2
    }
  }, sub)), trailing);
}

// Picker sheet: radio rows, a tap applies instantly (no confirm button on pickers).
function RadioSheet({
  title,
  subtitle,
  options,
  activeKey,
  onPick,
  onClose,
  footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: subtitle ? 4 : 10
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 8
    }
  }, subtitle), options.map((o, i) => /*#__PURE__*/React.createElement("button", {
    key: o.key,
    onClick: () => onPick(o.key),
    className: "j-press",
    role: "radio",
    "aria-checked": activeKey === o.key,
    "aria-label": o.label,
    style: {
      width: '100%',
      display: 'flex',
      // sheet options stand as tall as the settings rows they came from
      // (founder, 14 Aug: "the options height look thinner")
      minHeight: ROW_MIN_H,
      alignItems: 'center',
      gap: 12,
      padding: '13px 2px',
      background: 'none',
      border: 'none',
      borderBottom: i < options.length - 1 ? '1px solid var(--line)' : 'none',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      borderRadius: '50%',
      flexShrink: 0,
      border: '2px solid ' + (activeKey === o.key ? 'var(--blue)' : 'var(--faint)'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, activeKey === o.key && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: 'var(--blue)'
    }
  })), o.iconEl || null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      color: 'var(--ink)',
      fontSize: o.size || 'calc(15.5px * var(--tscale, 1))'
    }
  }, o.label), o.sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 1
    }
  }, o.sub)), o.trailing || null)), footer));
}

// A quiet footnote line with a small leading icon (the honesty line pattern).
function FootNote({
  icon = 'lock',
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'flex-start',
      color: 'var(--faint)',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      lineHeight: 1.45,
      margin: '4px 2px 0'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14,
    color: "var(--faint)",
    style: {
      flexShrink: 0,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, children));
}

// ---------------- THE MENU TAB ----------------
// Route name stays 'settings' so saved navigation states never strand; the
// screen itself is the redesigned Menu.
function SettingsScreen({
  nav,
  profile,
  entries = [],
  docs = [],
  binCount = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 10,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => nav.go('childprofile'),
    "aria-label": 'Open ' + profile.name + "'s profile",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(ChildAvatar, {
    profile: profile,
    size: 36
  }), /*#__PURE__*/React.createElement("h1", {
    className: "j-h1",
    style: {
      fontSize: 'calc(26px * var(--tscale, 1))'
    }
  }, profile.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 36,
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-iconbtn",
    "aria-label": "Settings",
    onClick: () => nav.go('appsettings')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 23,
    color: "var(--muted)"
  })))), !nav.plus ? /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => nav.go('unlock'),
    style: {
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: PLUS_GRAD,
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 10px 22px -8px rgba(38,24,84,0.5)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 28,
    color: "#EBBA4D",
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
      fontWeight: 600,
      fontSize: 'calc(16.5px * var(--tscale, 1))',
      color: '#fff'
    }
  }, "Jotla Plus"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'rgba(255,255,255,0.82)',
      marginTop: 2
    }
  }, "Get the best experience."))) : AI_AVAILABLE ? /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => nav.go('unlock', {
      tier: 'ai'
    }),
    style: {
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: PREMIUM_GRAD,
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 10px 22px -8px rgba(20,41,74,0.5)',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 28,
    color: "#E6B85C",
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
      fontWeight: 600,
      fontSize: 'calc(16.5px * var(--tscale, 1))',
      color: '#fff'
    }
  }, "Jotla AI"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'rgba(255,255,255,0.82)',
      marginTop: 2
    }
  }, "Here now, with Plus included."))) : null, /*#__PURE__*/React.createElement(SectionLabel, null, "Your record"), /*#__PURE__*/React.createElement(MRow, {
    icon: "cloudup",
    title: "Backup and Restore",
    onClick: () => nav.go('backup')
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "trash",
    title: "Recycle Bin",
    sub: "Kept for 30 days",
    onClick: () => nav.go('bin'),
    trailing: binCount > 0 ? /*#__PURE__*/React.createElement("span", {
      className: "j-pillbadge",
      style: {
        background: 'var(--tag-grey-bg)',
        color: 'var(--muted)'
      }
    }, binCount) : null
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      textAlign: 'center',
      marginTop: 26
    }
  }, "Jotla by SEN Help \xB7 Test build ", window.JOTLA_BUILD))));
}
/* SectionLabel needs a little air above it on this screen */

// ---------------- SETTINGS (behind the cog) ----------------
function AppSettingsScreen({
  nav
}) {
  const J = window.JOTLA;
  const [sheet, setSheet] = useStateB(null); // null | 'theme' | 'size' | 'reminder' | 'weekstart'
  const [customTime, setCustomTime] = useStateB('20:00');
  const [remCustom, setRemCustom] = useStateB(false);
  const themeLabel = nav.theme === 'system' ? 'System' : nav.theme === 'dark' ? 'Dark' : 'Light';
  const sizeLabel = {
    '0.9': 'Small',
    '1': 'Standard',
    '1.12': 'Large',
    '1.25': 'Extra large'
  }[String(nav.tscale)] || 'Standard';
  const weekStartLabel = J.DOW_LONG[typeof nav.weekStart === 'number' ? nav.weekStart : 1];
  const kids = (nav.profiles || []).map(p => p.name).join(', ');
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Settings",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(MRow, {
    iconEl: /*#__PURE__*/React.createElement(ChildAvatar, {
      profile: (nav.profiles || [])[0],
      size: 26
    }),
    title: "Children",
    sub: kids,
    onClick: () => nav.go('children')
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Appearance"), /*#__PURE__*/React.createElement(MRow, {
    icon: "palette",
    title: "Theme",
    sub: themeLabel,
    onClick: () => setSheet('theme')
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "textsize",
    title: "Text size",
    sub: sizeLabel,
    onClick: () => setSheet('size')
  }), /*#__PURE__*/React.createElement(MRow, {
    iconEl: /*#__PURE__*/React.createElement(Face, {
      mood: "happy",
      size: 24
    }),
    title: "Emojis",
    sub: FACE_PACK_LABEL(nav.faceStyle),
    onClick: () => nav.go('moodstyle')
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Calendar"), /*#__PURE__*/React.createElement(MRow, {
    icon: "calendar",
    title: "Start of the week",
    sub: weekStartLabel,
    onClick: () => setSheet('weekstart')
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Privacy"), /*#__PURE__*/React.createElement(MRow, {
    icon: "lock",
    title: "App lock",
    sub: nav.appLock && nav.appLock.on ? 'On' : 'Off',
    onClick: () => nav.go('applock')
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Reminders"), /*#__PURE__*/React.createElement(MRow, {
    icon: "bell",
    title: "Daily reminder",
    sub: nav.reminder || 'Off',
    onClick: () => {
      setRemCustom(false);
      setSheet('reminder');
    }
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Help and about"), /*#__PURE__*/React.createElement(MRow, {
    icon: "play",
    title: "Take the tour",
    onClick: () => nav.go('tour')
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "help",
    title: "Help",
    onClick: () => nav.go('help')
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "info",
    title: "About Jotla",
    onClick: () => nav.go('infoabout')
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "heart",
    title: "Tell us what you think",
    onClick: () => window.location.assign(FEEDBACK_HREF)
  }), nav.plus && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SectionLabel, null, "Membership"), /*#__PURE__*/React.createElement(MRow, {
    iconEl: /*#__PURE__*/React.createElement(Icon, {
      name: "crown",
      size: 22,
      color: "var(--gold)",
      style: {
        flexShrink: 0
      }
    }),
    title: "Jotla Plus",
    sub: "Everything unlocked on this phone",
    trailing: /*#__PURE__*/React.createElement("span", {
      className: "j-pillbadge",
      style: {
        background: 'var(--tint-green)',
        color: 'var(--green-ink)',
        border: '1px solid var(--green)'
      }
    }, "Active"),
    onClick: () => nav.go('unlock')
  })), /*#__PURE__*/React.createElement(FootNote, null, "No account, and nothing leaves the phone. Jotla works without a login: everything stays on this device, and there is no cloud we can read."))), sheet === 'theme' && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Theme",
    activeKey: nav.theme,
    onClose: () => setSheet(null),
    options: [{
      key: 'light',
      label: 'Light'
    }, {
      key: 'dark',
      label: 'Dark'
    }, {
      key: 'system',
      label: 'System',
      sub: 'Follows your phone'
    }],
    onPick: k => {
      nav.setTheme(k);
      setSheet(null);
    }
  }), sheet === 'size' && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Text size",
    activeKey: String(nav.tscale),
    onClose: () => setSheet(null),
    options: [{
      key: '0.9',
      label: 'Small',
      size: '13px'
    }, {
      key: '1',
      label: 'Standard',
      size: '15.5px'
    }, {
      key: '1.12',
      label: 'Large',
      size: '17.5px'
    }, {
      key: '1.25',
      label: 'Extra large',
      size: '19.5px'
    }],
    onPick: k => {
      nav.setTscale(parseFloat(k));
      setSheet(null);
    }
  }), sheet === 'weekstart' && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Start of the week",
    activeKey: String(typeof nav.weekStart === 'number' ? nav.weekStart : 1),
    onClose: () => setSheet(null),
    options: [1, 2, 3, 4, 5, 6, 0].map(d => ({
      key: String(d),
      label: J.DOW_LONG[d]
    })),
    onPick: k => {
      nav.setWeekStart(Number(k));
      setSheet(null);
    }
  }), sheet === 'reminder' && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Daily reminder",
    subtitle: "A gentle nudge to write the day down.",
    activeKey: remCustom ? 'custom' : ['Off', 'Morning · 08:00', 'Evening · 20:00'].includes(nav.reminder) ? nav.reminder : 'custom',
    onClose: () => setSheet(null),
    options: [{
      key: 'Off',
      label: 'Off'
    }, {
      key: 'Morning · 08:00',
      label: 'Morning · 08:00'
    }, {
      key: 'Evening · 20:00',
      label: 'Evening · 20:00'
    }, {
      key: 'custom',
      label: 'Choose a time'
    }],
    onPick: k => {
      if (k === 'custom') {
        setRemCustom(true);
        return;
      }
      nav.setReminder(k);
      setSheet(null);
    },
    footer: remCustom ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "time",
      className: "j-input",
      value: customTime,
      onChange: e => setCustomTime(e.target.value),
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "j-btn j-btn-primary",
      style: {
        width: 'auto',
        minHeight: 48,
        padding: '0 22px'
      },
      onClick: () => {
        nav.setReminder(customTime);
        setSheet(null);
      }
    }, "Set")) : null
  }));
}

// ---------------- MOOD STYLE (the pack picker page, 9 Aug) ----------------
// A full page, not a sheet (founder: "a new page showing you how they look"):
// every pack shows its five moods in a row; the active pack wears the blue
// tick; on free every pack but the free default wears the crown and a tap opens
// the Jotla Plus page (the crown gate). Owners tap to apply instantly, app-wide.
// The page is driven by FACE_PACK_ORDER, so a new pack needs no change here.
function MoodStyleScreen({
  nav
}) {
  const active = FACE_PACKS[nav.faceStyle] ? nav.faceStyle : FACE_PACK_DEFAULT;
  const moods = ['happy', 'ok', 'sad', 'worried', 'angry'];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Emojis",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, FACE_PACK_ORDER.map(k => {
    const locked = k !== FACE_PACK_DEFAULT && !nav.plus;
    const on = active === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: "j-card j-press",
      role: "radio",
      "aria-checked": on,
      "aria-label": FACE_PACK_LABEL(k),
      onClick: () => {
        if (locked) {
          nav.go('unlock');
          return;
        }
        nav.setFaceStyle(k);
      },
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '14px 16px',
        marginBottom: 10,
        border: '1.5px solid ' + (on ? 'var(--blue)' : 'var(--line)')
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: "'Outfit', system-ui",
        fontWeight: 600,
        fontSize: 'calc(15.5px * var(--tscale, 1))',
        color: 'var(--ink)'
      }
    }, FACE_PACK_LABEL(k)), locked ? /*#__PURE__*/React.createElement("span", {
      "data-crown-gate": true,
      style: {
        display: 'flex',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "crown",
      size: 20,
      color: "var(--gold)"
    })) : on ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 20,
      color: "var(--blue)",
      stroke: 2.4
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 12,
        justifyContent: 'space-between'
      }
    }, moods.map(m => /*#__PURE__*/React.createElement(Face, {
      key: m,
      mood: m,
      size: 40,
      styleName: k
    }))));
  }), /*#__PURE__*/React.createElement(FootNote, null, "Bold is part of Free. The other nine are part of Plus, and the whole record changes together: Today, the Month, and the child's own screens."))));
}

// ---------------- CHILDREN ----------------
function ChildrenScreen({
  nav
}) {
  const list = nav.profiles || [];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Children",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "On this phone"), list.map(p => /*#__PURE__*/React.createElement(MRow, {
    key: p.id,
    iconEl: /*#__PURE__*/React.createElement(ChildAvatar, {
      profile: p,
      size: 34
    }),
    title: p.name,
    sub: [p.year, p.school].filter(Boolean).join(' · ') || null,
    onClick: () => {
      nav.pickChild(p.id);
      nav.go('childprofile');
    },
    trailing: p.id === nav.profileId ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 20,
      color: "var(--blue)",
      stroke: 2.2
    }) : null
  })), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => nav.go('addchild'),
    style: {
      width: '100%',
      border: '1px dashed var(--chip-border)',
      background: 'none',
      borderRadius: 14,
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      color: 'var(--blue)',
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 20,
    color: "var(--blue)",
    stroke: 2.2
  }), " Add another child"), /*#__PURE__*/React.createElement(FootNote, null, "Each child keeps their own private record on this phone. The tick shows whose record the app is on."))));
}

// ---------------- THE CHILD PROFILE (a page, not a drawer) ----------------
function ChildProfileScreen({
  nav,
  profile,
  entries = [],
  docs = []
}) {
  const J = window.JOTLA;
  const [dangerMode, setDangerMode] = useStateB(null); // null | 'reset' | 'delete'
  const [cropSrc, setCropSrc] = useStateB(null);
  const [avSheet, setAvSheet] = useStateB(false);
  const [pvFigure, setPvFigure] = useStateB(null); // preview values while the edit sheet is open
  const [pvGlyph, setPvGlyph] = useStateB(null);
  const Cropper = window.PhotoCropper;
  const canDelete = (nav.profiles || []).length > 1;
  const shown = {
    ...profile,
    figure: pvFigure || profile.figure,
    glyph: pvGlyph || profile.glyph
  };
  const openSheet = () => {
    setPvFigure(profile.figure);
    setPvGlyph(profile.glyph || 'initial');
    setAvSheet(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 0,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(ChildAvatar, {
    profile: avSheet ? shown : profile,
    size: 88
  }), /*#__PURE__*/React.createElement("h1", {
    className: "j-h2",
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontSize: 'calc(26px * var(--tscale, 1))',
      marginTop: 10
    }
  }, profile.name), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 2
    }
  }, [profile.year, profile.school].filter(Boolean).join(' · ')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 10,
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "j-press",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '9px 14px',
      borderRadius: 999,
      cursor: 'pointer',
      background: 'var(--tint-blue)',
      border: '1px solid rgba(26,86,168,0.30)',
      color: 'var(--blue)',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 17,
    color: "var(--blue)"
  }), " ", profile.photo ? 'Change photo' : 'Upload a photo', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      if (f) window.fileToDataURL(f, url => setCropSrc(url));
      e.target.value = '';
    }
  })), profile.photo && /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => nav.setChild({
      photo: null
    }),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '9px 14px',
      borderRadius: 999,
      cursor: 'pointer',
      background: 'var(--card)',
      border: '1px solid var(--chip-border)',
      color: 'var(--muted)',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16,
    color: "var(--muted)"
  }), " Remove"))), /*#__PURE__*/React.createElement(SectionLabel, null, "Details"), /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(FieldLabel, null, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.name,
    onChange: e => nav.setChild({
      name: e.target.value
    }),
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "School or setting"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.school,
    onChange: e => nav.setChild({
      school: e.target.value
    }),
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "Year group"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.year,
    onChange: e => nav.setChild({
      year: e.target.value
    })
  })), /*#__PURE__*/React.createElement(MRow, {
    icon: "palette",
    title: "Colour and Avatar",
    onClick: openSheet
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "The adults around ", (profile.name || '').trim() || 'them'), /*#__PURE__*/React.createElement(AdultsEditor, {
    profile: profile,
    onChange: nav.setChild
  }), /*#__PURE__*/React.createElement(SectionLabel, null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red)'
    }
  }, "Careful")), /*#__PURE__*/React.createElement(MRow, {
    icon: "restart",
    danger: true,
    title: "Reset this child",
    onClick: () => setDangerMode('reset')
  }), canDelete && /*#__PURE__*/React.createElement(MRow, {
    icon: "trash",
    danger: true,
    title: "Delete this child",
    onClick: () => setDangerMode('delete')
  }), /*#__PURE__*/React.createElement(FootNote, null, "Both offer a backup first and need a clear confirm. ", profile.name, "'s record never leaves this phone without you."))), avSheet && /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: () => setAvSheet(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation(),
    style: {
      maxHeight: '86%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: 10
    }
  }, "Colour and avatar"), /*#__PURE__*/React.createElement(SectionLabel, null, "Colour"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, (J.AVATAR_COLOURS || []).map(c => /*#__PURE__*/React.createElement("button", {
    key: c.key,
    onClick: () => setPvFigure(c.figure),
    "aria-label": 'Colour ' + c.key,
    className: "j-press",
    style: {
      width: 37,
      height: 37,
      borderRadius: '50%',
      cursor: 'pointer',
      background: c.figure,
      border: '3px solid var(--card)',
      boxShadow: pvFigure === c.figure ? '0 0 0 2px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.08)'
    }
  }))), /*#__PURE__*/React.createElement(SectionLabel, null, "Avatar"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, CHILD_GLYPHS.map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    onClick: () => setPvGlyph(g),
    "aria-label": 'Avatar ' + g,
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      cursor: 'pointer',
      padding: 0,
      border: 'none',
      background: 'transparent',
      boxShadow: pvGlyph === g ? '0 0 0 2px var(--ink)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(ChildAvatar, {
    profile: {
      ...profile,
      figure: pvFigure || profile.figure,
      glyph: g,
      photo: null
    },
    size: 44,
    ring: false
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      flex: 1
    },
    onClick: () => setAvSheet(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    style: {
      flex: 1
    },
    onClick: () => {
      nav.setChild({
        figure: pvFigure,
        glyph: pvGlyph
      });
      setAvSheet(false);
    }
  }, "Done")))), dangerMode && /*#__PURE__*/React.createElement(DeleteChildSheet, {
    mode: dangerMode,
    profile: profile,
    entries: entries,
    docs: docs,
    onClose: () => setDangerMode(null),
    onConfirm: () => {
      const m = dangerMode;
      setDangerMode(null);
      if (m === 'reset') {
        nav.resetChild(nav.profileId);
      } else {
        nav.deleteChild(nav.profileId);
        nav.setTab('settings');
      }
    }
  }), cropSrc && /*#__PURE__*/React.createElement(Cropper, {
    src: cropSrc,
    onDone: url => {
      nav.setChild({
        photo: url
      });
      setCropSrc(null);
    },
    onCancel: () => setCropSrc(null)
  }));
}

// the adults chip editor, lifted from the old details sheet
function AdultsEditor({
  profile,
  onChange
}) {
  const [draft, setDraft] = useStateB('');
  const adults = profile.adults || [];
  const add = () => {
    const n = draft.trim();
    if (!n) return;
    if (!adults.some(a => a.toLowerCase() === n.toLowerCase())) onChange({
      adults: [...adults, n]
    });
    setDraft('');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16,
      marginBottom: 10
    }
  }, adults.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10
    }
  }, adults.map(a => /*#__PURE__*/React.createElement("button", {
    key: a,
    className: "j-press",
    onClick: () => onChange({
      adults: adults.filter(x => x !== a)
    }),
    "aria-label": 'Remove ' + a,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: '1.5px solid var(--chip-border)',
      background: 'var(--card)',
      borderRadius: 999,
      padding: '8px 14px',
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, a, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14,
    color: "var(--faint)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        add();
      }
    },
    placeholder: "Mrs Price, Mr Okafor the TA...",
    "aria-label": "Add an adult",
    style: {
      flex: 1,
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    onClick: add,
    disabled: !draft.trim(),
    style: {
      width: 'auto',
      flexShrink: 0,
      padding: '0 22px',
      ...(draft.trim() ? {} : {
        opacity: 0.5,
        cursor: 'default'
      })
    }
  }, "Add")));
}

// ---------------- APP LOCK (free: privacy is never paywalled) ----------------
// The web prototype holds the parent's choices; the real lock screen, pattern
// entry and biometrics are native-build work.
function AppLockScreen({
  nav
}) {
  const al = nav.appLock || {
    on: false,
    method: 'Pattern',
    bio: false,
    question: false
  };
  const [methodSheet, setMethodSheet] = useStateB(false);
  const [qSheet, setQSheet] = useStateB(false);
  const [qDraft, setQDraft] = useStateB('');
  const [aDraft, setADraft] = useStateB('');
  const set = patch => nav.setAppLock({
    ...al,
    ...patch
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "App lock",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(MRow, {
    icon: "lock",
    title: "App lock",
    sub: "Asked for every time Jotla opens",
    onClick: () => set({
      on: !al.on
    }),
    trailing: /*#__PURE__*/React.createElement(Toggle, {
      on: al.on,
      onChange: () => set({
        on: !al.on
      }),
      label: "App lock"
    })
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Unlock with"), /*#__PURE__*/React.createElement(MRow, {
    icon: "dots9",
    title: "Pattern or PIN",
    sub: al.method,
    onClick: () => setMethodSheet(true)
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "finger",
    title: "Fingerprint or face",
    sub: "When your phone can",
    onClick: () => set({
      bio: !al.bio
    }),
    trailing: /*#__PURE__*/React.createElement(Toggle, {
      on: al.bio,
      onChange: () => set({
        bio: !al.bio
      }),
      label: "Fingerprint or face"
    })
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "If you forget"), /*#__PURE__*/React.createElement(MRow, {
    icon: "help",
    title: "Security question",
    sub: al.question ? 'Set' : 'Not set yet',
    onClick: () => setQSheet(true)
  }), /*#__PURE__*/React.createElement(FootNote, null, "The lock, the pattern and your answer stay on this phone and are checked nowhere else. Jotla cannot reset a lock for you, so set the question."))), methodSheet && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Unlock with",
    activeKey: al.method,
    onClose: () => setMethodSheet(false),
    options: [{
      key: 'Pattern',
      label: 'Pattern',
      sub: 'Join the dots'
    }, {
      key: 'PIN',
      label: 'PIN',
      sub: 'Four digits or more'
    }],
    onPick: k => {
      set({
        method: k
      });
      setMethodSheet(false);
    }
  }), qSheet && /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: () => setQSheet(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: 4
    }
  }, "Security question"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 14
    }
  }, "The answer is checked on this phone only. Pick something only you would answer the same way every time."), /*#__PURE__*/React.createElement(FieldLabel, null, "Question"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: qDraft,
    onChange: e => setQDraft(e.target.value),
    placeholder: "For example: my first teacher's surname",
    style: {
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "Answer"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: aDraft,
    onChange: e => setADraft(e.target.value),
    style: {
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    disabled: !qDraft.trim() || !aDraft.trim(),
    style: !qDraft.trim() || !aDraft.trim() ? {
      opacity: 0.5,
      cursor: 'default'
    } : {},
    onClick: () => {
      if (qDraft.trim() && aDraft.trim()) {
        set({
          question: true
        });
        setQSheet(false);
      }
    }
  }, "Save"))));
}

// ---------------- BACKUP AND RESTORE ----------------
function BackupScreen({
  nav,
  profile,
  entries = [],
  docs = []
}) {
  const J = window.JOTLA;
  const [meta, setMeta] = useStateB(() => {
    try {
      return JSON.parse(localStorage.getItem(BACKUP_META_KEY)) || null;
    } catch (e) {
      return null;
    }
  });
  const [expSheet, setExpSheet] = useStateB(false);
  const [period, setPeriod] = useStateB('all'); // all | 7 | 30 | custom
  const [fromD, setFromD] = useStateB('');
  const [toD, setToD] = useStateB('');
  const daysAgoISO = n => {
    const d = new Date(J.TODAY_ISO + 'T12:00:00');
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const doExport = () => {
    let from = null,
      to = null;
    if (period === '7') from = daysAgoISO(6);else if (period === '30') from = daysAgoISO(29);else if (period === 'custom') {
      from = fromD || null;
      to = toD || null;
    }
    try {
      const inR = d => d && (!from || d >= from) && (!to || d <= to);
      const es = period === 'all' ? entries : entries.filter(e => inR(e.date));
      const ds = period === 'all' ? docs : docs.filter(d => inR(d.received));
      const payload = {
        app: 'Jotla',
        exportedAt: new Date().toISOString(),
        child: profile,
        entries: es,
        documents: ds
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jotla-' + (profile && profile.name || 'record').replace(/\s+/g, '-').toLowerCase() + '-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      const stamp = {
        lastExportAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(BACKUP_META_KEY, JSON.stringify(stamp));
      } catch (e) {}
      setMeta(stamp);
      setExpSheet(false);
    } catch (e) {
      alert('Sorry, the export could not be created on this device.');
    }
  };
  const onImportFile = e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        nav.importBackup(JSON.parse(r.result));
      } catch (err) {
        alert('That file could not be read as a Jotla backup.');
      }
    };
    r.readAsText(f);
  };
  const lastExport = meta && meta.lastExportAt ? 'Last export ' + J.fmtShort(meta.lastExportAt.slice(0, 10)) + ' ' + meta.lastExportAt.slice(0, 4) : 'Not exported yet';
  // The crown gate marks what Plus WOULD unlock, so it exists only in the free
  // app: an owner's rows carry no crowns (founder, 8 Aug night). The wrapper
  // carries a data hook so the suite can count crowns per tier.
  const crown = nav.plus ? null : /*#__PURE__*/React.createElement("span", {
    "data-crown-gate": true,
    style: {
      display: 'flex',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "crown",
    size: 20,
    color: "var(--gold)"
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Backup and Restore",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "On this phone"), /*#__PURE__*/React.createElement(MRow, {
    icon: "download",
    title: "Export my data",
    sub: lastExport,
    onClick: () => setExpSheet(true)
  }), /*#__PURE__*/React.createElement("label", {
    className: "j-card j-press",
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      padding: '14px 16px',
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "upload",
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
  }, "Restore from an export")), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "application/json,.json",
    style: {
      display: 'none'
    },
    onChange: onImportFile
  })), /*#__PURE__*/React.createElement(SectionLabel, null, "Google Drive"), /*#__PURE__*/React.createElement(MRow, {
    icon: "cloudup",
    title: "Back up to your Drive",
    sub: "Not backed up yet",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "clouddown",
    title: "Restore from your Drive",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Dropbox"), /*#__PURE__*/React.createElement(MRow, {
    icon: "cloudup",
    title: "Back up to Dropbox",
    sub: "Not backed up yet",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "clouddown",
    title: "Restore from Dropbox",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(SectionLabel, null, "Automatic"), /*#__PURE__*/React.createElement(MRow, {
    icon: "clock",
    title: "Auto backup",
    sub: "Backs up when the record changes",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "bell",
    title: "Backup reminder",
    sub: "Every week",
    onClick: () => nav.go('unlock'),
    trailing: crown
  }), /*#__PURE__*/React.createElement(FootNote, null, "Backups live in your own Google Drive or Dropbox, in a space only the app can read. Jotla has no servers and never sees your record."))), expSheet && /*#__PURE__*/React.createElement(RadioSheet, {
    title: "Export my data",
    subtitle: "Saves a file on this phone.",
    activeKey: period,
    onClose: () => setExpSheet(false),
    options: [{
      key: 'all',
      label: 'The whole record'
    }, {
      key: '7',
      label: 'Last 7 days'
    }, {
      key: '30',
      label: 'Last 30 days'
    }, {
      key: 'custom',
      label: 'Choose dates'
    }],
    onPick: k => setPeriod(k),
    footer: /*#__PURE__*/React.createElement("div", null, period === 'custom' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "j-meta",
      style: {
        display: 'block',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: 'calc(10.5px * var(--tscale, 1))'
      }
    }, "From"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "j-input",
      value: fromD,
      onChange: e => setFromD(e.target.value)
    })), /*#__PURE__*/React.createElement("label", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "j-meta",
      style: {
        display: 'block',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: 'calc(10.5px * var(--tscale, 1))'
      }
    }, "To"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "j-input",
      value: toD,
      onChange: e => setToD(e.target.value)
    }))), /*#__PURE__*/React.createElement("button", {
      className: "j-btn j-btn-primary",
      style: {
        marginTop: 14
      },
      onClick: doExport
    }, "Export"))
  }));
}

// ---------------- HELP ----------------
const HELP_QA = [['The record', [['Where does the record live?', 'On this phone. There is no account and no cloud copy unless you back up to your own Google Drive or Dropbox.'], ['How do backups work?', 'Automatic backups go to your own Drive or Dropbox, in a space only the app can read. A manual export file is always free.'], ['How do I move to a new phone?', 'Back up on the old phone, install Jotla on the new one, then restore from your Drive, Dropbox or the export file.'], ['I deleted something. Can I get it back?', 'Deleted logs and documents wait in the Recycle Bin for 30 days. After that they clear themselves.']]], ['Plus', [['What does Plus cost?', '£49 for 6 months or £79 for a year, through Google Play.'], ['How do I cancel?', 'In Subscriptions on Google Play, any time. Plus stays on until the day it runs out.'], ['What happens if I stop paying?', 'You keep every entry, the timeline, search, the export and the PDF of what you already logged. A subscription only switches off the paid tools.']]], ['Privacy', [['How do I lock the app?', 'Settings, then App lock. A pattern or PIN, with fingerprint or face if your phone can.']]]];
function HelpScreen({
  nav
}) {
  const [open, setOpen] = useStateB({
    'The record:0': true
  });
  const toggle = k => setOpen(o => ({
    ...o,
    [k]: !o[k]
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Help",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, HELP_QA.map(([section, qas]) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: section
  }, /*#__PURE__*/React.createElement(SectionLabel, null, section), qas.map(([q, a], i) => {
    const k = section + ':' + i;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      className: "j-card j-press",
      onClick: () => toggle(k),
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '14px 16px',
        marginBottom: 10,
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: "'Outfit', system-ui",
        fontWeight: 500,
        fontSize: 'calc(15.5px * var(--tscale, 1))',
        color: 'var(--ink)'
      }
    }, q), open[k] && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: 'var(--muted)',
        lineHeight: 1.5,
        marginTop: 8
      }
    }, a));
  }))), /*#__PURE__*/React.createElement(SectionLabel, null, "Still stuck"), /*#__PURE__*/React.createElement(MRow, {
    icon: "mail",
    title: "Contact support",
    onClick: () => nav.go('support')
  }))));
}

// ---------------- SUPPORT ----------------
function SupportScreen({
  nav
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Support",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 2,
      paddingBottom: 40
    }
  }, /*#__PURE__*/React.createElement(MRow, {
    icon: "mail",
    title: "Email us",
    sub: "hello@sen.help",
    onClick: () => window.location.assign('mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla'))
  }), /*#__PURE__*/React.createElement(MRow, {
    icon: "heart",
    title: "Tell us what you think",
    onClick: () => window.location.assign(FEEDBACK_HREF)
  }), /*#__PURE__*/React.createElement(FootNote, {
    icon: "mail"
  }, "Replies come from a real person at SEN Help."))));
}
Object.assign(window, {
  FindScreen,
  EvidenceScreen,
  AddDocScreen,
  DocScreen,
  UnlockScreen,
  SettingsScreen,
  InfoAboutScreen,
  AppSettingsScreen,
  ChildrenScreen,
  ChildProfileScreen,
  AppLockScreen,
  BackupScreen,
  HelpScreen,
  SupportScreen,
  MRow,
  RadioSheet
});