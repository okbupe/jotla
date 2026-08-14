// jotla-parent-b.jsx: Find, Evidence (records + document vault), Add document, Doc detail, Unlock, Settings.
const { useState: useStateB, useRef: useRefB, useEffect: useEffectB } = React;

const THEME_TO_CAT = new Proxy({}, { get: (_, k) => k });

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
const FIND_RANGE_DEFAULT = { preset: 'Any time', from: '', to: '' };
// Documents keeps its place the same way (founder, 14 Aug round 7)
const EV_KEEPS = {};

function FindScreen({ nav, entries, view }) {
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
  const [dq, setDq] = useStateB(saved.dq !== undefined ? saved.dq : (saved.q || ''));
  const [dthemes, setDthemes] = useStateB(saved.dthemes || saved.themes || []);
  const [dmoods, setDmoods] = useStateB(saved.dmoods || saved.moods || []);
  const [dsetting, setDsetting] = useStateB(saved.dsetting || saved.setting || 'Any');
  const [drange, setDrange] = useStateB(saved.drange || saved.range || FIND_RANGE_DEFAULT);
  // f: the drawer, 0 tucked behind the bar, 1 fully out, anywhere in between
  // while it tracks the finger (the physics of Jotla, same as the calendar).
  const [f, setF] = useStateB(typeof saved.f === 'number' ? saved.f : 0);
  const fRef = useRefB(0); fRef.current = f;
  const fOpen = f > 0.5;
  const scrollRef = useRefB(null);
  useEffectB(() => {
    Object.assign(FIND_KEEP, { q, themes, moods, setting, range, dq, dthemes, dmoods, dsetting, drange, f: fOpen ? 1 : 0 });
  }, [q, themes, moods, setting, range, dq, dthemes, dmoods, dsetting, drange, fOpen]);
  // the + FAB steps aside while the drawer is out (arena catch, 14 Aug round
  // 4: it floated over the panel's lower chips); the view carries the state
  // up to the app shell, the Day-records pattern
  useEffectB(() => { nav.remember({ findDrawer: fOpen }); }, [fOpen]);
  useEffectB(() => { if (typeof saved.scrollY === 'number' && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY; }, []);
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
  const openEntry = (id) => {
    stashScroll();
    sealRef.current = true;
    nav.go('entry', { id });
  };

  const toggle = (setter) => (val) => setter(v => v.includes(val) ? v.filter(x => x !== val) : [...v, val]);

  // The settle after a release is the only animation on f, and it runs in JS
  // because it starts wherever the finger left it (the calendar's tween).
  const tweenRef = useRefB(null);
  const tween = (set, from, to) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { set(to); return; }
    let t0 = null;
    const step = (ts) => {
      if (t0 === null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 240);
      const e = 1 - Math.pow(1 - k, 3);
      set(from + (to - from) * e);
      if (k < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  };
  useEffectB(() => () => { if (tweenRef.current) cancelAnimationFrame(tweenRef.current); }, []);

  // The drawer's height is measured off its real content, like the graph's,
  // so the fold is right at every text size and tier. The panel is CAPPED to
  // the space between the bar and the tab bar, and its filter body scrolls
  // inside, so the Search and Cancel pills can never slide behind the tab
  // bar or off a short screen (arena catch, 14 Aug round 4: at full height
  // the pills sat under the tab bar and a Search tap changed tabs).
  const [drawerH, setDrawerH] = useStateB(0);
  const [capH, setCapH] = useStateB(0);
  // whether the filters area genuinely scrolls (the large-text safety net):
  // when it does, its touch-action stays pan-y and the swipe-to-close hands
  // the vertical pans back to the browser; when it fits, the panel owns them
  const [innerScrolls, setInnerScrolls] = useStateB(false);
  const innerScrollsRef = useRefB(false); innerScrollsRef.current = innerScrolls;
  const drawerInnerRef = useRefB(null);
  React.useLayoutEffect(() => {
    const el = drawerInnerRef.current;
    if (!el) return;
    const h = el.getBoundingClientRect().height;
    if (h && Math.abs(h - drawerH) > 0.25) setDrawerH(h);
    const fl = el.querySelector('[data-find-filters]');
    if (fl) {
      const s = fl.scrollHeight > fl.clientHeight + 1;
      if (s !== innerScrolls) setInnerScrolls(s);
    }
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
  // a committed mood filter must show on the bar too (arena catch, 14 Aug
  // round 8: a mood-only search read as "all dates", an apparent no-op)
  queryBits.push(...moods.map(k => { const m = J.FIND_MOODS.find(x => x.key === k); return m ? m.label : k; }));
  if (setting !== 'Any') queryBits.push(setting);
  const rangeLabel = range.preset === 'Custom'
    ? ((range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today'))
    : (range.preset === 'Any time' ? 'all dates' : range.preset.toLowerCase());
  queryBits.push(rangeLabel);

  // the corner rewind clears everything applied AND drafted, and greys out
  // when there is nothing to clear
  const isClear = !q.trim() && themes.length === 0 && moods.length === 0
    && setting === 'Any' && range.preset === 'Any time' && !range.from && !range.to;
  const isDraftClear = !dq.trim() && dthemes.length === 0 && dmoods.length === 0
    && dsetting === 'Any' && drange.preset === 'Any time' && !drange.from && !drange.to;
  const resetAll = () => {
    setQ(''); setThemes([]); setMoods([]); setSetting('Any'); setRange(FIND_RANGE_DEFAULT);
    setDq(''); setDthemes([]); setDmoods([]); setDsetting('Any'); setDrange(FIND_RANGE_DEFAULT);
  };
  // the drawer's own rewind clears the DRAFT; Search then makes it real
  const resetDraft = () => {
    setDq(''); setDthemes([]); setDmoods([]); setDsetting('Any'); setDrange(FIND_RANGE_DEFAULT);
  };

  // EVERY WAY OUT COMMITS, EXCEPT CANCEL (founder, 14 Aug round 8: "I can
  // swipe the window up and it will be the same result as pressing search.
  // only cancel leaves the previous filters"). Search, a swipe up, a bar
  // tap, a tap on the dimmed record: all of them apply the draft; Cancel
  // alone puts the last search back.
  const commitDraft = () => {
    setQ(dq); setThemes(dthemes); setMoods(dmoods); setSetting(dsetting); setRange(drange);
  };
  // the gesture effects mount once, so they reach the LIVE draft through a
  // ref, never a stale first-render closure
  const commitRef = useRefB(null); commitRef.current = commitDraft;
  const applyDraft = () => {
    commitDraft();
    tween(setF, fRef.current, 0);
  };
  const cancelDraft = () => {
    setDq(q); setDthemes(themes); setDmoods(moods); setDsetting(setting); setDrange(range);
    tween(setF, fRef.current, 0);
  };
  const toggleDrawer = () => {
    if (fOpen) { applyDraft(); return; }
    // opening always begins from what is applied, never a stale draft
    setDq(q); setDthemes(themes); setDmoods(moods); setDsetting(setting); setDrange(range);
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
  const drawerHRef = useRefB(0); drawerHRef.current = drawerH;
  useEffectB(() => {
    const el = barRef.current;
    if (!el) return undefined;
    let from = null;
    const down = (ev) => {
      // a grab holds the drawer where it is: a settle still in flight is
      // cancelled, and the drag continues from the live value
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
      try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      from = { y: ev.clientY, f0: fRef.current, span: Math.max(160, drawerHRef.current || 320),
        lastY: ev.clientY, lastT: performance.now(), prevY: ev.clientY, prevT: performance.now() };
    };
    const move = (ev) => {
      if (!from) return;
      const dy = ev.clientY - from.y;
      if (Math.abs(dy) > 4) barDraggedRef.current = true;   // a drag must not also read as a tap
      from.prevY = from.lastY; from.prevT = from.lastT;
      from.lastY = ev.clientY; from.lastT = performance.now();
      setF(Math.max(0, Math.min(1, from.f0 + dy / from.span)));
    };
    const up = () => {
      if (!from) return;
      const wasOpen = from.f0 > 0.5;
      const dt = from.lastT - from.prevT;
      // a finger that PAUSES before letting go is not flicking: past 100ms
      // of stillness the release is positional, whatever the last move did
      const idle = performance.now() - from.lastT;
      const v = (idle > 100 || dt <= 0) ? 0 : (from.lastY - from.prevY) / dt;
      from = null;
      const now = fRef.current;
      // release velocity wins (arena catch, 14 Aug round 8): with the bar
      // resting near the top while the window is open, position alone could
      // never close it from here; a flick can
      const target = v < -0.4 ? 0 : v > 0.4 ? 1 : (now > 0.5 ? 1 : 0);
      // a drag that closes the open window commits, exactly like Search
      // (founder, 14 Aug round 8); a wiggle from closed just settles
      if (target === 0 && wasOpen) commitRef.current();
      tween(setF, now, target);
      // the guard outlives the release just long enough to swallow the
      // click the browser fires after a drag, then a real tap works again
      setTimeout(() => { barDraggedRef.current = false; }, 60);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, []);

  // THE WINDOW ITSELF SWIPES SHUT (founder, 14 Aug round 8): drag anywhere
  // on the open panel and it follows the finger up, the same physics as the
  // bar, and a settle to closed COMMITS like Search. The gesture only
  // engages after a clearly vertical upward slop, so chip taps and the
  // search field stay untouched, and the pointer is captured only at that
  // moment, never at the down (a capture at down would eat the chips'
  // clicks). While the filters area genuinely scrolls (large text), the
  // browser keeps the pans and this gesture stands down.
  const drawerZoneRef = useRefB(null);
  const panelDraggedRef = useRefB(false);
  useEffectB(() => {
    const el = drawerZoneRef.current;
    if (!el) return undefined;
    let from = null;      // pointer down, watching for the slop
    let live = false;     // engaged: the drawer is following the finger
    const down = (ev) => {
      if (fRef.current < 0.95 || innerScrollsRef.current) return;
      // a CalendarSheet riding the drawer owns its own touches (arena catch,
      // 14 Aug round 8: a swipe on the sheet dragged the drawer shut under
      // it and stranded the sheet)
      if (ev.target && ev.target.closest && ev.target.closest('.j-sheet-scrim')) return;
      from = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, f0: fRef.current, span: Math.max(160, drawerHRef.current || 320),
        lastY: ev.clientY, lastT: performance.now(), prevY: ev.clientY, prevT: performance.now() };
      live = false;
    };
    const move = (ev) => {
      if (!from) return;
      const dx = ev.clientX - from.x, dy = ev.clientY - from.y;
      if (!live) {
        if (dy > -8 || Math.abs(dy) <= Math.abs(dx)) { if (Math.abs(dx) > 12) from = null; return; }
        live = true; panelDraggedRef.current = true;
        if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
        try { el.setPointerCapture(from.id); } catch (e) {}
      }
      from.prevY = from.lastY; from.prevT = from.lastT;
      from.lastY = ev.clientY; from.lastT = performance.now();
      setF(Math.max(0, Math.min(1, from.f0 + dy / from.span)));
    };
    const up = () => {
      if (!from) return;
      const engaged = live;
      const dt = from.lastT - from.prevT;
      // px per ms, + is down; a pause before release means no flick
      const idle = performance.now() - from.lastT;
      const v = (idle > 100 || dt <= 0) ? 0 : (from.lastY - from.prevY) / dt;
      from = null; live = false;
      if (!engaged) return;
      const now = fRef.current;
      // a FLICK closes or reopens in its own direction, however short the
      // travel (arena catch, 14 Aug round 8: every sheet a parent knows
      // honours release velocity, and a bounced-back flick reads as broken);
      // a slow release still settles to its nearest half
      const target = v < -0.4 ? 0 : v > 0.4 ? 1 : (now > 0.5 ? 1 : 0);
      if (target === 0) commitRef.current();
      tween(setF, now, target);
      setTimeout(() => { panelDraggedRef.current = false; }, 60);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    };
  }, []);

  // Every filter lives in the drawer (founder, 14 Aug): search first, then
  // the Plus filter groups, or the locked card on free. All of it edits the
  // draft; nothing lands on the results until Search.
  const filtersBody = (
    <>
      {/* everything below is sized so the whole drawer fits a phone screen
          with no inner scroll, the permanent From/To row included (founder,
          14 Aug rounds 5 + 8): a 46px search field, 36px chips, 10px gaps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card-2)', border: '1.5px solid var(--chip-border)',
        borderRadius: 14, padding: '0 14px', height: 46, marginBottom: 6 }}>
        <Icon name="search" size={20} color="var(--faint)" />
        <input value={dq} onChange={e => setDq(e.target.value)} placeholder="Search your notes"
          style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', background: 'transparent' }} />
      </div>
      {nav.plus ? (
        <>
          <SectionLabel>Themes</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 10 }}>
            {J.FIND_THEMES.map(t => (
              <button key={t} aria-pressed={dthemes.includes(t)} className={'j-chip' + (dthemes.includes(t) ? ' j-chip-on' : '')} onClick={() => toggle(setDthemes)(t)}>{t}</button>
            ))}
          </div>
          <SectionLabel>Mood</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 10 }}>
            {J.FIND_MOODS.map(m => {
              const on = dmoods.includes(m.key);
              return (
                <button key={m.key} aria-pressed={on} className={'j-chip' + (on ? ' j-chip-on' : '')} onClick={() => toggle(setDmoods)(m.key)}>
                  <MoodDot mood={m.key} size={11} /> {m.label}
                </button>
              );
            })}
          </div>
          <SectionLabel>Where</SectionLabel>
          <div className="j-chiprow" style={{ marginBottom: 10 }}>
            {['Any', 'School', 'Home', 'Club'].map(s => (
              <button key={s} aria-pressed={dsetting === s} className={'j-chip' + (dsetting === s ? ' j-chip-on' : '')} onClick={() => setDsetting(s)}>{s}</button>
            ))}
          </div>
          <SectionLabel>When</SectionLabel>
          <div>
            {/* no Custom pill (founder, 14 Aug round 8): From and To sit
                here permanently, and picking a date IS choosing custom */}
            <DateRangeControl inlineCustom presets={['Any time', 'This week', 'Last 2 weeks']} value={drange} onChange={setDrange} />
          </div>
        </>
      ) : (
        <PlusLockedCard onClick={() => nav.go('unlock')} icon="filter"
          title="Filters" text={<>Theme, mood, place and dates.<br />Keyword search is always free.</>} />
      )}
    </>
  );

  return (
    <div className="j-screen">
      {/* the record holds still while the filter window is out (founder,
          14 Aug round 7: "the background is not suppose to scroll when the
          window is open"); the lock rides f so a drag-open freezes it too */}
      <div className="j-scroll j-fade" ref={scrollRef} onScroll={stashScroll}
        style={f > 0.05 ? { overflowY: 'hidden' } : undefined}>
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 120 }}>
          {/* the corner rewind clears the search and every filter */}
          <TabTitle title="Find" right={
            <button className="j-iconbtn" data-find-rewind disabled={isClear}
              aria-label="Clear the search and filters" onClick={resetAll}
              style={{ opacity: isClear ? 0.35 : 1, cursor: isClear ? 'default' : 'pointer' }}>
              <Icon name="rewind" size={21} color={isClear ? 'var(--faint)' : 'var(--muted)'} />
            </button>} />

          {/* THE STICKY UNIT (founder, 14 Aug): the blue bar, OPAQUE so the
              notes never show through it, with the whole filter drawer folded
              behind it. Tap the bar or drag it and the drawer untucks with
              the finger; the soft 22px gradient sits under whatever is open
              so a note dissolves before it slides behind. */}
          <div className="j-findstick" data-find-stick>
            <div className="j-findbar" data-find-bar ref={barRef} role="button" tabIndex={0}
              aria-expanded={fOpen} aria-label="Search and filters"
              onClick={() => { if (barDraggedRef.current) { barDraggedRef.current = false; return; } toggleDrawer(); }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDrawer(); } }}>
              <Icon name="filter" size={18} color="var(--blue)" />
              <p className="j-body" style={{ flex: 1, fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)', fontWeight: 500 }}>{queryBits.join(', ')}</p>
              <span className={'j-calarrow' + (fOpen ? ' j-open' : '')} aria-hidden="true">
                <Icon name="chevronRight" size={17} color="var(--blue)" />
              </span>
            </div>
            {/* the drawer: every filter the old magnifier held, untucking from
                underneath the bar; height follows f, content slides with it */}
            <div className="j-finddrawer" data-find-drawer ref={drawerZoneRef}
              onClickCapture={e => { if (panelDraggedRef.current) { e.preventDefault(); e.stopPropagation(); } }}
              style={{ height: drawerH ? drawerH * f : (f > 0.5 ? undefined : 0) }}>
              {/* the 10px gap is padding INSIDE the measured content, so the
                  fold's height maths stays true (founder, 14 Aug round 6:
                  space between the bar and the floating panel) */}
              <div ref={drawerInnerRef} style={{ paddingTop: 10, transform: `translateY(${drawerH ? -((1 - f) * drawerH) : 0}px)` }}>
                <div className="j-finddrawer-in" style={{ maxHeight: capH || undefined, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexShrink: 0 }}>
                    <h2 className="j-h2">Filters</h2>
                    <button className="j-iconbtn" data-drawer-rewind disabled={isDraftClear}
                      aria-label="Clear the search and filters" onClick={resetDraft}
                      style={{ opacity: isDraftClear ? 0.35 : 1, cursor: isDraftClear ? 'default' : 'pointer' }}>
                      <Icon name="rewind" size={20} color={isDraftClear ? 'var(--faint)' : 'var(--muted)'} />
                    </button>
                  </div>
                  {/* the filters scroll INSIDE the capped panel; the pills stay pinned */}
                  <div data-find-filters style={{ overflowY: 'auto', flex: '1 1 auto', minHeight: 0, WebkitOverflowScrolling: 'touch',
                    // fitting content hands its pans to the swipe-to-close;
                    // genuinely scrolling content (large text) keeps them
                    touchAction: innerScrolls ? 'pan-y' : 'none' }}>
                    {filtersBody}
                  </div>
                  {/* Search commits, Cancel keeps the last search (founder, 14 Aug) */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10, flexShrink: 0 }}>
                    <button className="j-btn j-btn-primary" data-find-search style={{ flex: 1, minHeight: 46 }} onClick={applyDraft}>Search</button>
                    <button className="j-btn j-btn-ghost" data-find-cancel style={{ flex: 1, minHeight: 46 }} onClick={cancelDraft}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* the record softens out of the way while the window is out, the
              quick log's own idiom (founder, 14 Aug round 8: "blur that
              background of notes when filter is open"); a tap on it commits
              and tucks, because every way out commits except Cancel */}
          {/* clip-path pens the blur in (founder catch, 14 Aug round 9): a
              blur bleeds outward past its own box, and a note's accent
              stripe was ghosting into the page gutter beside the bar */}
          <div data-find-results onClick={fOpen ? applyDraft : undefined}
            style={{ transition: 'filter .18s ease, opacity .18s ease', ...(fOpen ? { filter: 'blur(4px)', opacity: 0.4, clipPath: 'inset(0)' } : {}) }}>
           <div style={fOpen ? { pointerEvents: 'none' } : undefined}>
            {/* clear of the stick's 28px breathing gradient, which otherwise
                shaves this label at rest (arena catch, 14 Aug round 5) */}
            <p className="j-meta" style={{ margin: '30px 0 10px' }}>{matched.length} {matched.length === 1 ? 'note' : 'notes'} found</p>

            {matched.length === 0 ? (
              <div className="j-card" style={{ padding: 22, textAlign: 'center' }}>
                <p className="j-sm">Nothing matches those filters yet. Try removing one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matched.map(e => <EntryCard key={e.id} entry={e} showDate onClick={() => openEntry(e.id)} />)}
              </div>
            )}
           </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Evidence: records pack + document vault ----------------
// Build a clean, printable day record in a new tab. The browser's own
// Print, then Save as PDF, turns it into the family's PDF. Nothing is uploaded.
function openPrintPack(childLabel, rangeLabel, list) {
  const J = window.JOTLA;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const badge = k => k === 'contemporaneous'
    ? '<span style="background:#e7f6ee;color:#1e7a45;border-radius:99px;padding:2px 10px;font-size:11px;">Same day</span>'
    : '<span style="background:#fdf3e0;color:#a06b12;border-radius:99px;padding:2px 10px;font-size:11px;">Added later</span>';
  const rows = list.map(e => {
    let extra = '';
    if (e.type === 'handover' && e.handover) {
      const h = e.handover;
      const part = (l, v) => v ? '<p style="margin:4px 0;"><strong>' + esc(l) + ':</strong> ' + esc(v) + '</p>' : '';
      extra = '<div style="margin-top:6px;padding:8px 12px;background:#f5f7fb;border-radius:8px;">'
        + (h.behaviours && h.behaviours.length ? '<p style="margin:4px 0;"><strong>Seen:</strong> ' + esc(h.behaviours.join(', ')) + '</p>' : '')
        + (h.who && h.who.length ? part('Who was there', h.who.join(', ')) : '') + part('Where', h.where)
        + part('Before', h.before) + part('During', h.during) + part('After', h.after)
        + part('Lasted', h.duration) + part('What helped', h.helped) + '</div>';
    }
    return '<div style="padding:10px 0;border-bottom:1px solid #dde3ee;page-break-inside:avoid;">'
      + '<p style="margin:0 0 4px;font-size:12px;color:#1A56A8;"><strong>' + esc(J.fmtShort(e.date)) + ' ' + esc(e.date.slice(0, 4))
      + ', ' + esc(e.clock || e.time) + '</strong> &nbsp; ' + esc(e.setting) + ' · ' + esc(e.categoryOther || e.category) + ' &nbsp; ' + badge(e.kind)
      + (e.editedOn ? ' <span style="color:#8892a6;font-size:10.5px;">edited ' + esc(J.fmtShort(e.editedOn)) + '</span>' : '') + '</p>'
      + '<p style="margin:0;font-size:13px;line-height:1.45;white-space:pre-line;">' + esc(e.summary) + '</p>' + extra + '</div>';
  }).join('');
  const w = window.open('', '_blank');
  if (!w) { alert('Your browser blocked the new tab. Allow pop-ups for this page and try again.'); return false; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jotla day record</title></head>'
    + '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#14223b;max-width:720px;margin:24px auto;padding:0 16px;">'
    + '<p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8892a6;margin:0 0 6px;">Day record · Jotla</p>'
    + '<h1 style="font-size:22px;margin:0 0 2px;">' + esc(childLabel) + '</h1>'
    + '<p style="font-size:12.5px;margin:0 0 14px;color:#5b6780;">' + esc(rangeLabel) + ' · ' + list.length + ' dated entries · Prepared ' + esc(J.fmtShort(J.TODAY_ISO)) + ' ' + esc(J.TODAY_ISO.slice(0, 4)) + '</p>'
    + rows
    + '<p style="font-size:10.5px;color:#8892a6;line-height:1.5;margin-top:14px;padding-top:12px;border-top:1px dashed #dde3ee;">'
    + 'Each entry shows when it was written. "Same day" means it was logged on the day it happened. "Added later" means it was written up afterwards. Prepared by the family using their own Jotla record.</p>'
    + '</body></html>');
  w.document.close(); w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
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
  if (!w) { alert('Your browser blocked the new tab. Allow pop-ups for this page and try again.'); return false; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Jotla document record</title></head>'
    + '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#14223b;max-width:720px;margin:24px auto;padding:0 16px;">'
    + '<p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8892a6;margin:0 0 6px;">Document record · Jotla</p>'
    + '<h1 style="font-size:22px;margin:0 0 2px;">' + esc(d.title) + '</h1>'
    + '<p style="font-size:12.5px;margin:0 0 14px;color:#5b6780;">' + esc(docTypeLabel(d)) + ' · from ' + esc(d.from)
    + ' · Prepared ' + esc(J.fmtShort(J.TODAY_ISO)) + ' ' + esc(J.TODAY_ISO.slice(0, 4)) + '</p>'
    + row('Received', J.fmtLong(d.received) + ' ' + d.received.slice(0, 4))
    + row('About', d.about) + row('Action needed', d.action)
    + (d.editedOn ? '<p style="margin:6px 0;font-size:11.5px;color:#8892a6;">Details last edited ' + esc(J.fmtShort(d.editedOn)) + '. Earlier details stay on the record below.</p>' : '')
    + (d.history && d.history.length ? '<div style="margin-top:10px;padding:10px 14px;background:#f5f7fb;border-radius:8px;">'
      + '<p style="margin:0 0 4px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#8892a6;">What it said before</p>'
      + d.history.map(h => '<p style="margin:4px 0;font-size:12px;">Until ' + esc(J.fmtShort(h.on)) + ' ' + esc(h.on.slice(0, 4)) + ': '
        + esc(h.title) + (h.about ? ' · ' + esc(h.about) : '') + (h.action ? ' · Action: ' + esc(h.action) : '') + '</p>').join('') + '</div>' : '')
    + (files.length ? '<p style="margin:12px 0 0;font-size:12px;color:#5b6780;">Attached file' + (files.length > 1 ? 's' : '') + ' (open from the document in Jotla): '
      + files.map(m => esc(m.name || 'File')).join(', ') + '</p>' : '')
    + photos.map(m => '<img src="' + m.dataUrl + '" style="display:block;width:100%;margin-top:14px;border-radius:8px;page-break-inside:avoid;" alt="Photo of the document">').join('')
    + '</body></html>');
  w.document.close(); w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
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
    Letter: { icon: 'mail', bg: 'var(--tint-amber)', fg: 'var(--amber)' },
    Email: { icon: 'at', bg: 'var(--tint-green)', fg: 'var(--green-ink)' },
    Plan: { icon: 'clipboard', bg: 'var(--tint-blue)', fg: 'var(--blue)' },
    Report: { icon: 'doc', bg: 'var(--tag-grey-bg)', fg: 'var(--muted)' },
    Assessment: { icon: 'chart', bg: 'var(--tag-grey-bg)', fg: 'var(--muted)' },
  }[type] || { icon: 'folder', bg: 'var(--tag-grey-bg)', fg: 'var(--muted)' };
}

function DocCard({ doc, onClick }) {
  const J = window.JOTLA;
  const attached = docAttachedCount(doc);
  const ts = docTypeStyle(doc.type);
  return (
    <div className="j-card j-press" onClick={onClick} style={{ padding: 14, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 46, height: 46, borderRadius: 12, background: ts.bg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={ts.icon} size={22} color={ts.fg} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {/* colour-coded type pill (6 Aug): Plan blue, Letter amber, Email green, the rest quiet grey */}
          <span className={'j-tag ' + ({ Plan: 'j-tag-plan', Letter: 'j-tag-letter', Email: 'j-tag-email' }[doc.type] || 'j-tag-grey')}>{docTypeLabel(doc)}</span>
          <span className="j-meta" style={{ whiteSpace: 'nowrap' }}>{J.fmtShort(doc.received)} {doc.received.slice(0, 4)}</span>
          {attached > 0 && (
            <span aria-label={attached + ' attached'} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="attach" size={13} color="var(--faint)" />
              <span className="j-meta">{attached}</span>
            </span>
          )}
        </div>
        <p className="j-strong" style={{ fontSize: 'calc(16px * var(--tscale, 1))', lineHeight: 1.25, marginBottom: 3 }}>{doc.title}</p>
        <p className="j-sm" style={{ fontSize: 'calc(13.5px * var(--tscale, 1))' }}>From {doc.from}</p>
        {doc.action && (
          <span className="j-pillbadge" style={{ marginTop: 8, background: 'var(--tint-amber)', color: 'var(--amber)' }}>
            <Icon name="bell" size={13} color="var(--amber)" /> {doc.action}
          </span>
        )}
      </div>
      {/* no trailing arrow: rows are tappable as a whole (6 Aug, app-wide) */}
    </div>
  );
}

function EvidenceScreen({ nav, entries, docs, profile, navView }) {
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
  const saved = { ...EV_KEEP, ...((navView && navView.ev) || {}) };
  const [view, setView] = useStateB(saved.tab || 'documents'); // documents leads (founder, 6 Aug)
  // Corner search (founder, 7 Aug): the magnifier sits top right and summons a
  // field that filters the document list by title, sender or type.
  const [docQ, setDocQ] = useStateB(saved.docQ || '');
  const [showDocQ, setShowDocQ] = useStateB(!!saved.showDocQ);
  const docsShown = docQ.trim()
    ? docs.filter(d => (d.title + ' ' + d.from + ' ' + d.type + ' ' + (d.typeOther || '')).toLowerCase().includes(docQ.trim().toLowerCase()))
    : docs;
  const [range, setRange] = useStateB(saved.range || { preset: 'Last 3 weeks', from: '', to: '' });
  const [themes, setThemes] = useStateB(saved.themes || []);
  const [done, setDone] = useStateB(false);
  const scrollRef = useRefB(null);
  useEffectB(() => {
    Object.assign(EV_KEEP, { tab: view, docQ, showDocQ, range, themes });
    nav.remember({ ev: { tab: view, range, themes } });
  }, [view, docQ, showDocQ, range, themes]);
  useEffectB(() => { if (saved.scrollY && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY; }, []);
  // the scroll keep, sealed on push like Find's (the 14 Aug round-4 lesson:
  // the outgoing scroller fires one last detached scroll that clobbers it)
  const sealRef = useRefB(false);
  const stashScroll = () => {
    const el = scrollRef.current;
    if (sealRef.current || !el || !el.isConnected || el.scrollHeight === 0) return;
    EV_KEEP.scrollY = el.scrollTop;
  };
  const openDoc = (id) => {
    stashScroll();
    sealRef.current = true;
    nav.remember({ ev: { tab: view, range, themes, scrollY: scrollRef.current ? scrollRef.current.scrollTop : 0 } });
    nav.go('doc', { id });
  };
  const childLabel = profile ? `${profile.name}, ${profile.school}` : 'Sam, Oakfield Primary';

  const bounds = window.rangeBounds(range.preset, range.from, range.to);
  const rangeLabel = range.preset === 'Custom'
    ? ((range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today'))
    : range.preset;
  const inPack = entries
    .filter(e => (themes.length === 0 || themes.includes(e.category)) && window.inDateRange(e.date, bounds))
    .sort((a, b) => a.date < b.date ? -1 : 1);
  const toggleTheme = (t) => setThemes(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t]);

  const Seg = ({ id, label }) => (
    <button onClick={() => setView(id)} style={{ flex: 1, minHeight: 44, borderRadius: 999, border: 'none', cursor: 'pointer',
      fontFamily: "'Outfit', system-ui", fontSize: 'calc(15px * var(--tscale, 1))', fontWeight: 500,
      background: view === id ? 'var(--card)' : 'transparent', color: view === id ? 'var(--blue)' : 'var(--muted)',
      boxShadow: view === id ? '0 4px 12px -8px rgba(20,40,80,0.4)' : 'none' }}>{label}</button>
  );

  return (
    <div className="j-screen">
      {/* Documents is a TAB now (6 Aug): its own big title, no back, no subtitle,
          and the old green banner is gone: both explained a screen that already
          shows what it is. */}
      <div className="j-scroll j-fade" ref={scrollRef} onScroll={stashScroll}>
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 120 }}>
          <TabTitle title="Documents" right={
            <button className="j-iconbtn" aria-label="Search documents"
              onClick={() => { setView('documents'); setShowDocQ(v => { if (v) setDocQ(''); return !v; }); }}>
              <Icon name="search" size={22} color={showDocQ ? 'var(--blue)' : 'var(--muted)'} />
            </button>} />

          {showDocQ && view === 'documents' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card-2)', border: '1.5px solid var(--chip-border)',
              borderRadius: 14, padding: '0 14px', height: 52, marginBottom: 16 }}>
              <Icon name="search" size={20} color="var(--faint)" />
              <input value={docQ} onChange={e => setDocQ(e.target.value)} placeholder="Search documents" autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', background: 'transparent' }} />
            </div>
          )}

          {/* segmented switch: Documents leads (founder, 6 Aug) */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--tag-grey-bg)', marginBottom: 20 }}>
            <Seg id="documents" label="Documents" />
            <Seg id="records" label="Day records" />
          </div>

          {view === 'records' && (
            <>
              <SectionLabel>Date range</SectionLabel>
              <div style={{ marginBottom: 14 }}>
                <DateRangeControl presets={['Last 3 weeks', 'This month', 'All time', 'Custom']} value={range} onChange={setRange} />
              </div>
              <SectionLabel>Include themes</SectionLabel>
              <div className="j-chiprow" style={{ marginBottom: 18 }}>
                {J.CATEGORIES.map(t => (
                  <button key={t} aria-pressed={themes.includes(t)} className={'j-chip' + (themes.includes(t) ? ' j-chip-on' : '')} onClick={() => toggleTheme(t)}>{t}</button>
                ))}
              </div>

              <SectionLabel>Preview</SectionLabel>
              <div style={{ borderRadius: 14, background: 'var(--card)', border: '1px solid var(--line)',
                boxShadow: '0 18px 40px -24px rgba(20,40,80,0.45)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)' }}>
                  <p style={{ fontSize: 'calc(12px * var(--tscale, 1))', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--faint)', margin: '0 0 8px' }}>Day record</p>
                  <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(20px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>{childLabel}</p>
                  <p className="j-meta" style={{ marginTop: 4 }}>{rangeLabel} · {inPack.length} dated entries · Prepared {J.fmtShort(J.TODAY_ISO)} {J.TODAY_ISO.slice(0, 4)}</p>
                </div>
                <div style={{ padding: '8px 20px 16px' }}>
                  {inPack.slice(0, 6).map((e, i) => (
                    <div key={e.id} style={{ padding: '12px 0', borderBottom: i < Math.min(inPack.length, 6) - 1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 'calc(13px * var(--tscale, 1))', fontWeight: 500, color: 'var(--blue)', whiteSpace: 'nowrap' }}>{J.fmtShort(e.date)} {e.date.slice(0, 4)}, {e.clock || e.time}</span>
                        <span style={{ flex: 1 }} />
                        <span className="j-pillbadge" style={{ fontSize: 'calc(10.5px * var(--tscale, 1))', padding: '2px 8px',
                          background: e.kind === 'contemporaneous' ? 'var(--tint-green)' : 'var(--tint-amber)',
                          color: e.kind === 'contemporaneous' ? 'var(--green-ink)' : 'var(--amber)' }}>
                          {e.kind === 'contemporaneous' ? 'Same day' : 'Added later'}
                        </span>
                      </div>
                      <p style={{ fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--body)', margin: 0, lineHeight: 1.4 }}>{e.summary}</p>
                    </div>
                  ))}
                  <p style={{ fontSize: 'calc(11.5px * var(--tscale, 1))', color: 'var(--faint)', lineHeight: 1.5, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--line)' }}>
                    Each entry shows when it was written. "Same day" means it was logged on the day it happened. "Added later" means it was written up afterwards. Any edits keep the original date and time.
                  </p>
                </div>
              </div>
            </>
          )}

          {view === 'documents' && (
            <>
              <SectionLabel right={<span className="j-meta">{docsShown.length} {docQ.trim() ? 'found' : 'saved'}</span>}>Your documents</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docsShown.length === 0
                  ? <div className="j-card" style={{ padding: 22, textAlign: 'center' }}><p className="j-sm">{docQ.trim() ? 'Nothing matches that search.' : 'No documents yet. Add the first letter or report and never lose it again.'}</p></div>
                  : docsShown.map(d => <DocCard key={d.id} doc={d} onClick={() => openDoc(d.id)} />)}
                {/* the dashed add-row RETIRED (founder, 8 Aug evening): adding a
                    document is the + speed dial's Document option now, one door
                    for every kind of capture */}
              </div>
            </>
          )}
        </div>
      </div>

      {view === 'records' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(96px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
          {nav.plus
            ? <button className="j-btn j-btn-primary j-btn-lg" onClick={() => { if (openPrintPack(childLabel, rangeLabel, inPack)) setDone(true); }}><Icon name="doc" size={20} color="#fff" /> Create PDF</button>
            /* crown gate (founder, 6 Aug): a Plus-tier control wears the solid gold crown and opens the Jotla Plus page */
            : <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('unlock')}><Icon name="crown" size={20} color="#EBBA4D" /> Create PDF is part of Plus</button>}
        </div>
      )}

      {done && (
        <div className="j-sheet-scrim" onClick={() => setDone(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={28} color="var(--green)" />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>Your day record is ready</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              It opened in a new tab. Use Print, then Save as PDF, to keep, print or share it. Nothing is uploaded anywhere.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => openPrintPack(childLabel, rangeLabel, inPack)}><Icon name="download" size={20} color="#fff" /> Open it again</button>
            <button className="j-btn j-btn-ghost" style={{ marginTop: 10 }} onClick={() => setDone(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
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
    const r = { id: m.id, kind: m.kind };
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
    const mime = ((m.dataUrl.slice(0, comma).match(/^data:([^;]+)/) || [])[1]) || 'application/octet-stream';
    const bin = atob(m.dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
    const w = window.open(url, '_blank');
    if (!w) {
      const a = document.createElement('a');
      a.href = url; a.download = m.name || 'document';
      document.body.appendChild(a); a.click(); a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) { alert('Sorry, this file could not be opened on this device.'); }
}

// One kept-file row: the doc glyph, the original filename, an honest sub-line.
// Pending picks get a remove x; on the document page the row opens the file.
function DocFileTile({ name, sub, onOpen, onRemove }) {
  const inner = (
    <React.Fragment>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="doc" size={20} color="var(--blue)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        <span style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{sub}</span>
      </span>
    </React.Fragment>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, border: '1px solid var(--line)',
      background: 'var(--card)', padding: 10 }}>
      {onOpen ? (
        <button className="j-press" onClick={onOpen} aria-label={'Open the file ' + name}
          style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none',
            cursor: 'pointer', textAlign: 'left', padding: 0 }}>
          {inner}
        </button>
      ) : (
        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>{inner}</span>
      )}
      {onRemove && (
        <button className="j-press" onClick={onRemove} aria-label={'Remove file ' + name} style={{ width: 36, height: 36, borderRadius: 10,
          border: 'none', background: 'var(--tag-grey-bg)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={16} color="var(--muted)" />
        </button>
      )}
    </div>
  );
}

// The video note row. Web reality, same as the note picker: the video itself
// is never copied, so the vault keeps an honest note of it instead.
const VIDEO_NOTE_SUB = 'The video itself stays safely in your photo library.';
function VideoNoteTile({ onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, border: '1px solid var(--line)',
      background: 'var(--card)', padding: 10 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="video" size={20} color="var(--blue)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--ink)' }}>Video noted</span>
        <span style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{VIDEO_NOTE_SUB}</span>
      </span>
      {onRemove && (
        <button className="j-press" onClick={onRemove} aria-label="Remove video note" style={{ width: 36, height: 36, borderRadius: 10,
          border: 'none', background: 'var(--tag-grey-bg)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={16} color="var(--muted)" />
        </button>
      )}
    </div>
  );
}

// Capture / attach / pick the document itself: the note picker's two tiles
// plus a third, Pick a file, for the PDFs and other files letters actually
// arrive as. Everything picked waits as a pending tile with a remove x and is
// only written to the record on Save, so closing the screen discards it
// cleanly. Only picks from the FILE picker carry a usable name and date, and
// only those feed the mechanical prefill (a camera capture's generated
// filename says nothing about the letter).
let _docMediaSeq = 0;
function DocMediaPicker({ items, onAdd, onRemove }) {
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
      if (tooBig) setHint('"' + tooBig + '" is over 2 MB, more than this browser\'s storage can safely keep with the record. A photo of the letter works well instead.');
      else if (readFail) setHint('That file could not be read just now. You can try again, or capture a photo of it instead.');
    };
    files.forEach((f, idx) => {
      const id = 'dm' + Date.now() + '-' + (_docMediaSeq++);
      const meta = fromFilePicker ? { name: f.name, lastModified: f.lastModified } : {};
      const type = f.type || '';
      if (type.indexOf('video/') === 0) { out[idx] = { id, kind: 'video', ...meta }; return; }
      if (type.indexOf('image/') === 0) {
        waiting++;
        window.fileToImageDataURL(f, 1280, 0.75, url => { out[idx] = { id, kind: 'photo', dataUrl: url, ...meta }; waiting--; done(); });
        return;
      }
      if (f.size > DOC_FILE_CAP) { tooBig = f.name; return; }
      waiting++;
      const r = new FileReader();
      r.onload = () => { out[idx] = { id, kind: 'file', dataUrl: r.result, name: f.name, lastModified: f.lastModified }; waiting--; done(); };
      r.onerror = () => { readFail = true; waiting--; done(); };
      r.readAsDataURL(f);
    });
    done();
  };

  {/* the caption hugs its label (founder, 9 Aug): 2px label-to-caption, 7px
      below the icon, matching the moment editor's tiles */}
  const tile = (label, sub, icon, inputProps) => (
    <label className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
      <Icon name={icon} size={24} color="var(--blue)" />
      <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500, marginTop: 7 }}>{label}</span>
      <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 2 }}>{sub}</span>
      <input type="file" style={{ display: 'none' }} {...inputProps} />
    </label>
  );

  const photoItems = items.map((m, i) => ({ m, i })).filter(({ m }) => m.kind === 'photo');
  const rowItems = items.map((m, i) => ({ m, i })).filter(({ m }) => m.kind !== 'photo');

  return (
    <div>
      {/* the note picker's pair, then the vault's own third way in */}
      <div style={{ display: 'flex', gap: 12 }}>
        {tile('Capture', 'Photo or video', 'camera', { accept: 'image/*,video/*', capture: 'environment',
          onChange: e => { takeFiles(e.target.files, false); e.target.value = ''; } })}
        {tile('Attach', 'From your photos', 'attach', { accept: 'image/*,video/*', multiple: true,
          onChange: e => { takeFiles(e.target.files, false); e.target.value = ''; } })}
      </div>
      <div style={{ display: 'flex', marginTop: 12 }}>
        {tile('Pick a file', 'A PDF or any other file', 'doc', {
          accept: 'application/pdf,.pdf,.doc,.docx,.odt,.rtf,.txt,.csv,image/*,video/*', multiple: true,
          onChange: e => { takeFiles(e.target.files, true); e.target.value = ''; } })}
      </div>
      {hint && <p style={{ fontSize: 'calc(13px * var(--tscale, 1))', lineHeight: 1.4, color: 'var(--muted)', margin: '8px 0 0' }}>{hint}</p>}
      {photoItems.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {photoItems.map(({ m, i }) => (
            <span key={m.id} style={{ position: 'relative', width: 86, height: 86, borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--line)', background: 'var(--photo-bg)', display: 'block' }}>
              <img src={m.dataUrl} alt="Photo of the document, waiting to be saved" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
              <button className="j-press" onClick={() => onRemove(i)} aria-label="Remove photo" style={{ position: 'absolute', top: 4, right: 4,
                width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.92)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={14} color="#51607A" />
              </button>
            </span>
          ))}
        </div>
      )}
      {rowItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {rowItems.map(({ m, i }) => m.kind === 'video'
            ? <VideoNoteTile key={m.id} onRemove={() => onRemove(i)} />
            : <DocFileTile key={m.id} name={m.name || 'File'} sub="Chosen from your files" onRemove={() => onRemove(i)} />)}
        </div>
      )}
    </div>
  );
}

// ---------------- Add document (onboarding questions) ----------------
function AddDocScreen({ nav }) {
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
  const onAddMedia = (picked) => {
    setDocMedia(v => [...v, ...picked]);
    const source = picked.find(p => p.name);
    if (!source) return;
    if (title.trim() === '') {
      const fromName = titleFromFilename(source.name);
      if (fromName) { setTitle(fromName); setTitlePrefilled(true); }
    }
    if (!dateSet) {
      const fromDate = receivedFromFileDate(source.lastModified, J.TODAY_ISO);
      if (fromDate) { setReceived(fromDate); setDatePrefilled(true); setDateSet(true); }
    }
  };

  const save = () => {
    const doc = {
      id: 'doc' + Date.now(), title: title.trim() || 'Untitled document',
      type, typeOther: type === 'Other' ? typeOther.trim() : '',
      from: from === 'Other' && fromOther.trim() ? fromOther.trim() : from,
      received: /^\d{4}-\d{2}-\d{2}$/.test(received.trim()) ? received.trim() : J.TODAY_ISO,
      about: about.trim(), action: action.trim(), mood: 'good',
    };
    if (docMedia.length) doc.media = keptDocMedia(docMedia);
    nav.addDoc(doc);
    nav.back();
  };

  return (
    <div className="j-screen">
      <PushHeader title="Add a document" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 120, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* The document itself, in the old "The file" spot. Adding is part
              of Plus (the same honest locked card the note pickers use);
              viewing and removing saved files never gate. */}
          {nav.plus ? (
            <div>
              <FieldLabel>The document itself</FieldLabel>
              <DocMediaPicker items={docMedia} onAdd={onAddMedia}
                onRemove={(i) => setDocMedia(v => v.filter((_, x) => x !== i))} />
            </div>
          ) : (
            <PlusLockedCard icon="attach" title="Add the document itself" text="Keep the letter with its details. Part of Plus."
              onClick={() => nav.go('unlock')} />
          )}

          <div>
            <FieldLabel>What is it?</FieldLabel>
            <input className="j-input" value={title}
              onChange={e => {
                // The parent's own typing always wins; the prefill hint goes
                // the moment the words are theirs.
                setTitle(e.target.value); setTitlePrefilled(false);
              }} placeholder="Give it a name, e.g. EHC plan draft" />
            {titlePrefilled && (
              <p style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--faint)', margin: '4px 0 0' }}>
                Filled from the file name. Check it matches the letter.
              </p>
            )}
            <div className="j-chiprow" style={{ marginTop: 12 }}>
              {J.DOC_TYPES.map(t => <button key={t} aria-pressed={type === t} className={'j-chip' + (type === t ? ' j-chip-on' : '')} onClick={() => setType(t)}>{t}</button>)}
            </div>
            {type === 'Other' && (
              <input className="j-input" style={{ marginTop: 10 }} value={typeOther} onChange={e => setTypeOther(e.target.value)}
                placeholder="Say what it is, e.g. Tribunal bundle" aria-label="Say what kind of document this is" />
            )}
          </div>

          <div>
            <FieldLabel>Who is it from?</FieldLabel>
            <div className="j-chiprow">
              {J.DOC_SOURCES.map(s => <button key={s} aria-pressed={from === s} className={'j-chip' + (from === s ? ' j-chip-on' : '')} onClick={() => setFrom(s)}>{s}</button>)}
            </div>
            {from === 'Other' && (
              <input className="j-input" style={{ marginTop: 10 }} value={fromOther} onChange={e => setFromOther(e.target.value)}
                placeholder="Say who, e.g. Speech therapist" aria-label="Say who this document is from" />
            )}
          </div>

          <div>
            <FieldLabel>When did you receive it?</FieldLabel>
            <DateField value={/^\d{4}-\d{2}-\d{2}$/.test(received) ? J.fmtLong(received) + ' ' + received.slice(0, 4) : null}
              placeholder="Left blank, today's date is used" label="When did you receive it"
              onClick={() => setDatePickerOpen(true)} />
            {/* The helper line stays honest about where a filled date came from. */}
            {datePrefilled && (
              <p style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--faint)', margin: '4px 0 0' }}>
                Filled from the file's own date. Check it matches the letter.
              </p>
            )}
          </div>

          <div>
            <FieldLabel>What is it about?</FieldLabel>
            <textarea className="j-input" value={about} onChange={e => setAbout(e.target.value)} rows={3} placeholder="A line so future-you remembers what is inside." />
          </div>

          <div>
            <FieldLabel>Does it need a reply or action?</FieldLabel>
            <input className="j-input" value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. Reply by 30 June. Leave blank if not." />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <button className="j-btn j-btn-primary j-btn-lg" onClick={save}><Icon name="check" size={22} color="#fff" /> Save document</button>
      </div>
      {/* No bounds, mirroring the field's own rule exactly: any real calendar
          date is accepted here, so no day is disabled. A day the parent picks
          themselves always wins over (and retires) the prefill. */}
      {datePickerOpen && (
        <CalendarSheet onClose={() => setDatePickerOpen(false)}
          value={/^\d{4}-\d{2}-\d{2}$/.test(received) ? received : null}
          onSelect={(iso) => { setReceived(iso); setDateSet(true); setDatePrefilled(false); }} />
      )}
    </div>
  );
}

// ---------------- Document detail ----------------
// Edit a document's details honestly: corrections are welcome, and the earlier
// details stay visible on the record. The document itself can be added here
// too (part of Plus, the web's own post-save door the native build defers);
// added files only commit on Save, and no prefill runs here, because every
// field already holds the parent's own value and a set value is never
// overwritten. Removing existing attachments lives on the document's page and
// never gates.
function EditDocSheet({ doc, plus, onSave, onAddMedia, onUnlock, onClose }) {
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
  const inputStyle = { width: '100%', boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid var(--chip-border)', background: 'var(--card-2)',
    padding: '10px 12px', fontFamily: "'Outfit', system-ui", fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', marginBottom: 12 };
  const changed = title.trim() !== doc.title || type !== doc.type || typeOther.trim() !== (doc.typeOther || '')
    || from.trim() !== doc.from || received !== doc.received
    || about.trim() !== (doc.about || '') || action.trim() !== (doc.action || '');
  return (
    <div className="j-sheet-scrim" onClick={onClose}>
      <div className="j-sheet" onClick={ev => ev.stopPropagation()} style={{ maxHeight: '88%', overflowY: 'auto' }}>
        <div className="j-sheet-grab" />
        <h2 className="j-h2" style={{ marginBottom: 4 }}>Edit this document</h2>
        <p className="j-sm" style={{ marginBottom: 14 }}>Corrections are fine. The earlier details are kept on the record.</p>
        <p className="j-sm" style={{ marginBottom: 6 }}>Title</p>
        <input value={title} onChange={ev => setTitle(ev.target.value)} style={inputStyle} />
        <p className="j-sm" style={{ marginBottom: 6 }}>What it is</p>
        <div className="j-chiprow" style={{ marginBottom: 12 }}>
          {J.DOC_TYPES.map(t => (
            <button key={t} aria-pressed={type === t} className={'j-chip' + (type === t ? ' j-chip-on' : '')} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
        {type === 'Other' && (
          <input value={typeOther} onChange={ev => setTypeOther(ev.target.value)} style={inputStyle}
            placeholder="Say what it is, e.g. Tribunal bundle" aria-label="Say what kind of document this is" />
        )}
        <p className="j-sm" style={{ marginBottom: 6 }}>From</p>
        <input value={from} onChange={ev => setFrom(ev.target.value)} style={inputStyle} />
        <p className="j-sm" style={{ marginBottom: 6 }}>Date received</p>
        <DateField compact value={/^\d{4}-\d{2}-\d{2}$/.test(received) ? J.fmtLong(received) + ' ' + received.slice(0, 4) : null}
          placeholder="Pick the date" label="Date received" onClick={() => setDatePickerOpen(true)}
          style={{ marginBottom: 12 }} />
        <p className="j-sm" style={{ marginBottom: 6 }}>About</p>
        <textarea value={about} onChange={ev => setAbout(ev.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        <p className="j-sm" style={{ marginBottom: 6 }}>Action needed (leave empty if none)</p>
        <input value={action} onChange={ev => setAction(ev.target.value)} style={{ ...inputStyle, marginBottom: 16 }} />
        {/* The document itself: adding gates on Plus; what is already attached
            is viewed and removed on the document's page, never gated. */}
        <p className="j-sm" style={{ marginBottom: 6 }}>The document itself</p>
        {plus ? (
          <div style={{ marginBottom: 16 }}>
            {alreadyAttached > 0 && (
              <p className="j-meta" style={{ marginBottom: 8 }}>
                {alreadyAttached} already attached. View or remove them on the document's page.
              </p>
            )}
            <DocMediaPicker items={newMedia} onAdd={(p) => setNewMedia(v => [...v, ...p])}
              onRemove={(i) => setNewMedia(v => v.filter((_, x) => x !== i))} />
          </div>
        ) : (
          <PlusLockedCard icon="attach" title="Add the document itself" text="Keep the letter with its details. Part of Plus."
            onClick={onUnlock} style={{ marginBottom: 16 }} />
        )}
        <button className="j-btn j-btn-primary" disabled={!title.trim()} style={{ opacity: title.trim() ? 1 : 0.5 }}
          onClick={() => {
            const rec = /^\d{4}-\d{2}-\d{2}$/.test(received) ? received : doc.received;
            if (changed && title.trim()) onSave({ title: title.trim(), type, typeOther: type === 'Other' ? typeOther.trim() : '', from: from.trim(), received: rec, about: about.trim(), action: action.trim() });
            if (newMedia.length) onAddMedia(keptDocMedia(newMedia));
            onClose();
          }}>
          Save the change
        </button>
        <button className="j-btn j-btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
      </div>
      {/* No bounds, the same rule as adding the document. */}
      {datePickerOpen && (
        <CalendarSheet onClose={() => setDatePickerOpen(false)}
          value={/^\d{4}-\d{2}-\d{2}$/.test(received) ? received : null}
          onSelect={setReceived} />
      )}
    </div>
  );
}

function DocScreen({ nav, docs, id }) {
  const J = window.JOTLA;
  const d = docs.find(x => x.id === id);
  const [editing, setEditing] = useStateB(false);
  if (!d) return <div className="j-screen"><PushHeader title="Document" onBack={() => nav.back()} /></div>;
  // The document itself: the media rows plus the older single "scan" photo
  // earlier builds kept, shown the same way. Viewing and removing never gate:
  // saved data is never held hostage, whatever the tier.
  const attachments = [
    ...(d.scan ? [{ id: '__scan', kind: 'photo', dataUrl: d.scan }] : []),
    ...(d.media || []),
  ];
  // Removing one attachment sits behind its own confirm, like every delete.
  const removeMedia = (m) => {
    const msg = m.kind === 'video'
      ? 'Remove this video note? It comes off this document. The video itself was never copied from your photo library.'
      : 'Remove this ' + (m.kind === 'photo' ? 'photo' : 'file') + "? It comes off this document and Jotla's copy is deleted from this device. This cannot be undone.";
    if (window.confirm(msg)) nav.removeDocMedia(d.id, m.id);
  };
  const Row = ({ label, value }) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      <span className="j-sm" style={{ flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 'calc(15px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  ) : null;
  return (
    <div className="j-screen">
      <PushHeader title="Document" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: docTypeStyle(d.type).bg, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={docTypeStyle(d.type).icon} size={26} color={docTypeStyle(d.type).fg} /></span>
            <div>
              <p className="j-h3" style={{ fontSize: 'calc(19px * var(--tscale, 1))' }}>{d.title}</p>
              <p className="j-meta" style={{ marginTop: 2 }}>{docTypeLabel(d)} · from {d.from}</p>
              {d.editedOn && (
                <span className="j-pillbadge" style={{ marginTop: 6, background: 'var(--tag-grey-bg)', color: 'var(--muted)' }}>
                  <Icon name="note" size={13} color="var(--muted)" /> Edited {J.fmtShort(d.editedOn)}
                </span>
              )}
            </div>
          </div>

          {/* The document itself, in the old scan spot: photos show in full
              (the web's own inline viewer), a kept file opens with a tap, a
              video carries its honest never-copied note. With nothing attached
              the section simply is not there; adding lives on Add and Edit. */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attachments.map(m => m.kind === 'photo' ? (
                <div key={m.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--photo-bg)' }}>
                  <img src={m.dataUrl} alt="Photo of the document" style={{ display: 'block', width: '100%' }} />
                  <button className="j-press" onClick={() => removeMedia(m)} aria-label="Remove photo"
                    style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 10, border: 'none',
                      background: 'rgba(255,255,255,0.92)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="close" size={17} color="#51607A" />
                  </button>
                </div>
              ) : m.kind === 'video' ? (
                <VideoNoteTile key={m.id} onRemove={() => removeMedia(m)} />
              ) : (
                <DocFileTile key={m.id} name={m.name || 'File'} sub="Chosen from your files. Tap to open."
                  onOpen={() => openDocFile(m)} onRemove={() => removeMedia(m)} />
              ))}
            </div>
          )}

          {d.action && (
            <div className="j-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', background: 'var(--tint-amber)', border: 'none' }}>
              <Icon name="bell" size={20} color="var(--amber)" style={{ flexShrink: 0 }} />
              <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--ink)' }}><span className="j-strong">Action:</span> {d.action}</p>
            </div>
          )}

          <div className="j-card j-card-pad">
            <Row label="What it is" value={docTypeLabel(d)} />
            <Row label="From" value={d.from} />
            <Row label="Received" value={J.fmtLong(d.received) + ' ' + d.received.slice(0, 4)} />
            {d.about && (
              <div style={{ paddingTop: 12 }}>
                <span className="j-sm">About</span>
                <p className="j-body" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))', marginTop: 4 }}>{d.about}</p>
              </div>
            )}
          </div>

          {d.history && d.history.length > 0 && (
            <div className="j-card j-card-pad" style={{ background: 'var(--card-2)' }}>
              <p className="j-sm" style={{ marginBottom: 8, color: '#6C9BD9', fontStyle: 'italic' }}>What it said before</p>
              {d.history.map((h, i) => (
                <div key={i} style={{ padding: '8px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                  <p className="j-meta" style={{ marginBottom: 3 }}>Until {J.fmtShort(h.on)} {h.on.slice(0, 4)}</p>
                  <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))' }}>{h.title}{h.about ? ' · ' + h.about : ''}{h.action ? ' · Action: ' + h.action : ''}</p>
                </div>
              ))}
            </div>
          )}

          {/* the way back OUT: one tap turns the record into a printable page
              (Print, then Save as PDF). Free on every tier, like all viewing. */}
          <button className="j-btn j-btn-ghost" style={{ color: 'var(--blue)' }} onClick={() => openPrintDoc(d, attachments)}>
            <Icon name="download" size={18} color="var(--blue)" /> Print or save as PDF
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: 'var(--blue)' }} onClick={() => setEditing(true)}>
              <Icon name="note" size={18} color="var(--blue)" /> Edit
            </button>
            <button className="j-btn j-btn-ghost" style={{ flex: 1, color: '#C0392B' }} onClick={() => {
              if (window.confirm('Move this document to the Bin? You can restore it for 30 days from Settings.')) { nav.deleteDoc(d.id); nav.back(); }
            }}><Icon name="close" size={18} color="#C0392B" /> Delete</button>
          </div>
        </div>
      </div>
      {editing && <EditDocSheet doc={d} plus={nav.plus}
        onSave={(patch) => nav.updateDoc(d.id, patch)}
        onAddMedia={(items) => nav.addDocMedia(d.id, items)}
        onUnlock={() => { setEditing(false); nav.go('unlock'); }}
        onClose={() => setEditing(false)} />}
    </div>
  );
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
const PLUS_SLIDES = [
  { t: 'Patterns and Month View', c: 'A calendar of green and amber days. Tap any day to read what happened behind it.', img: 'art/plus-1.jpg' },
  { t: 'PDF Evidence Pack', c: 'Turn any stretch of the record into one dated PDF, ready to hand over.', img: 'art/plus-2.jpg' },
  { t: 'Family Sync', c: "The record on every grown-up's phone. One of you logs it, both of you have it.", img: 'art/plus-3.jpg' },
  { t: 'Photos and Videos on Notes', c: 'Add the photo or the video to the note, so the day is shown as well as told.', img: 'art/plus-4.jpg' },
  { t: 'Dysregulation Mode', c: 'Five gentle questions in the hard moment, so nothing important is lost.', img: 'art/plus-5.jpg' },
  // Slide 6 (founder, 8-9 Aug): Emojis. Bupe's Higgsfield render (landed 9 Aug,
  // nano_banana_2, same vector recipe as slides 1-5).
  { t: 'Emojis', c: 'Swap the faces for the sticker look, everywhere a face shows.', img: 'art/plus-6.jpg' },
];
const AI_SLIDES = [
  { t: 'EHCP and SEND deadline tracker', c: 'Every deadline tracked, with what to do about a gap.', img: 'art/ai-1.jpg' },
  { t: 'On-device AI help', c: 'Ask about the record or the process. Answers stay on the phone.', img: 'art/ai-2.jpg' },
  { t: 'Current letter templates', c: 'The right letter for the moment, kept current with the law.', img: 'art/ai-3.jpg' },
  { t: 'Rights kept current', c: 'What you are entitled to, updated as the rules change.', img: 'art/ai-4.jpg' },
  { t: 'Voice capture', c: 'Say what happened and Jotla writes it down.', img: 'art/ai-5.jpg' },
];

function TermCard({ label, price, per, sel, gold, badge }) {
  return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 14, padding: '13px 10px 11px', textAlign: 'center', position: 'relative',
      background: sel ? (gold ? 'rgba(230,184,92,0.12)' : 'var(--plus-tint)') : 'var(--card)',
      border: '1.5px solid ' + (sel ? (gold ? '#C9912F' : '#6E54D6') : 'var(--line)') }}>
      {badge && <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', background: '#EBBA4D',
        color: '#3A2A0C', fontSize: 'calc(10.5px * var(--tscale, 1))', fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{badge}</span>}
      <div style={{ fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 400, fontSize: 'calc(26px * var(--tscale, 1))', color: 'var(--ink)', marginTop: 3 }}>{price}</div>
      <div style={{ fontSize: 'calc(11.5px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{per}</div>
    </div>
  );
}

function UnlockScreen({ nav, initialTier }) {
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
  const swipe = useRefB({ x: 0, y: 0, horiz: null, on: false, dx: 0, t: 0 });
  const onDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY, horiz: null, on: true, dx: 0, t: e.timeStamp };
    setDragging(true); setDrag(0);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {}
  };
  const onMove = (e) => {
    const s = swipe.current;
    if (!s.on) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (s.horiz === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) s.horiz = Math.abs(dx) > Math.abs(dy);
    if (!s.horiz) return;
    // past either end the rail resists instead of scrolling into nothing
    const atEdge = (slide === 0 && dx > 0) || (slide === slides.length - 1 && dx < 0);
    s.dx = atEdge ? dx * 0.35 : dx;
    setDrag(s.dx);
  };
  const onUp = (e) => {
    const s = swipe.current;
    if (!s.on) return;
    s.on = false;
    setDragging(false);
    // a long pull or a short sharp flick both count as intent
    const flick = Math.abs(s.dx) > 18 && (e.timeStamp - s.t) < 250;
    if (Math.abs(s.dx) > 55 || flick) setSlide(v => Math.max(0, Math.min(slides.length - 1, v + (s.dx < 0 ? 1 : -1))));
    setDrag(0);
  };
  const seg = (id, label) => {
    const on = tier === id;
    return (
      <button key={id} onClick={() => { setTier(id); setSlide(0); }} style={{ flex: 1, minHeight: 32, borderRadius: 999, border: 'none',
        cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', fontWeight: 600,
        background: on ? (id === 'ai' ? 'linear-gradient(135deg,#14294A,#1E5099)' : PLUS_GRAD) : 'transparent',
        color: on ? (id === 'ai' ? '#E6B85C' : '#fff') : 'var(--muted)' }}>{label}</button>
    );
  };
  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 30, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

          {/* header: crown disc, the tier selector, X */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* the corner crown wears the open tier's colours (founder, 7 Aug) */}
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: tier === 'ai' ? PREMIUM_GRAD : PLUS_GRAD, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: tier === 'ai' ? '0 6px 14px -6px rgba(20,41,74,0.5)' : '0 6px 14px -6px rgba(60,42,114,0.5)' }}>
              <Icon name="crown" size={18} color={tier === 'ai' ? '#E6B85C' : '#EBBA4D'} />
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 4, padding: 3, borderRadius: 999, background: 'var(--tag-grey-bg)' }}>
              {seg('plus', 'Jotla Plus')}{seg('ai', 'Jotla AI')}
            </div>
            <button onClick={() => nav.back()} aria-label="Close" className="j-press" style={{ width: 44, height: 44, marginRight: -10,
              border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={22} color="var(--muted)" />
            </button>
          </div>

          {/* The lockup, caption, rail and dots hold FIXED positions (founder,
              7 Aug): anchored from the top, never re-centred, so nothing shifts
              when a tier or slide changes. Every variable-height text below
              them carries a two-line floor for the same reason. */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0, padding: '14px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <h1 style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 400, fontSize: 'calc(31px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>
                Jotla {tier === 'ai'
                  ? <em style={{ fontStyle: 'italic', color: 'var(--aigold)', fontSize: 'calc(20px * var(--tscale, 1))', position: 'relative', top: -7 }}>AI</em>
                  : <em style={{ fontStyle: 'italic', color: 'var(--plus-ink)', fontSize: 'calc(20px * var(--tscale, 1))', position: 'relative', top: -7 }}>+Plus</em>}
              </h1>
              <p className="j-sm" style={{ marginTop: 6, lineHeight: 1.4, minHeight: 'calc(37px * var(--tscale, 1))' }}>
                {tier === 'ai' ? <>The deadlines, the rights and the letters,<br />kept current on your side.</>
                  : <>The tools to spot patterns<br />and make your case.</>}
              </p>
            </div>

            <div style={{ width: 300, maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
              <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                style={{ overflow: 'hidden', touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab',
                  userSelect: 'none', WebkitUserSelect: 'none' }}>
                <div style={{ display: 'flex', transform: 'translateX(calc(' + (-slide * 100) + '% + ' + drag + 'px))',
                  transition: dragging ? 'none' : 'transform .3s cubic-bezier(.25,.8,.35,1)' }}>
                  {slides.map((x, i) => (
                    <div key={i} style={{ flex: '0 0 100%', minWidth: 0 }}>
                      <img src={x.img} alt="" draggable={false} style={{ width: '100%', height: 158, objectFit: 'cover', borderRadius: 12, display: 'block', background: 'var(--tag-grey-bg)' }} />
                      <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', margin: '11px 0 0' }}>{x.t}</p>
                      <p style={{ fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--muted)', lineHeight: 1.45, margin: '4px 0 0', minHeight: 'calc(38px * var(--tscale, 1))' }}>{x.c}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                {slides.map((x, i) => (
                  <button key={i} onClick={() => setSlide(i)} aria-label={'Slide ' + (i + 1)} style={{ width: i === slide ? 18 : 7, height: 7,
                    borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
                    background: i === slide ? (tier === 'ai' ? 'var(--aigold)' : 'var(--plus-ink)') : 'var(--line)' }} />
                ))}
              </div>
            </div>
          </div>

          {tier === 'plus' ? (
            nav.plus ? (
              <div>
                <div className="j-card" style={{ padding: 16, textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>Plus is active on this phone.</p>
                  <p className="j-sm" style={{ marginTop: 4 }}>Your record is always yours, with or without it.</p>
                </div>
                <button onClick={() => nav.dropPlus()} style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none',
                  color: 'var(--faint)', fontSize: 'calc(12.5px * var(--tscale, 1))', cursor: 'pointer', fontFamily: "'Outfit', system-ui" }}>
                  Switch Plus off (test build)
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <TermCard label="6 Months" price="£49" per="for 6 months" />
                  <TermCard label="One Year" price="£79" per={<>less than<br />£7 a month</>} sel badge="Best value" />
                </div>
                <button className="j-btn j-btn-lg" onClick={() => { nav.buyPlus(); nav.back(); }} style={{ marginTop: 12, background: PLUS_GRAD,
                  color: '#fff', boxShadow: '0 14px 28px -10px rgba(60,42,114,0.6)' }}>
                  <Icon name="crown" size={20} color="#EBBA4D" /> Get Jotla Plus
                </button>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--blue)',
                  fontSize: 'calc(13px * var(--tscale, 1))', fontWeight: 500, margin: '10px 0 0' }}>
                  <Icon name="check" size={15} color="var(--blue)" stroke={2.2} /> Everything in Free is included, always.
                </p>
                <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 'calc(11.5px * var(--tscale, 1))', lineHeight: 1.45, margin: '8px 0 0' }}>
                  Plus renews automatically at the end of its term: £49 every 6 months or £79 a year, charged to your Google Play
                  account until you cancel. Cancel any time in Subscriptions on Google Play, and Plus stays on until the end of the
                  time you have paid for. A subscription only ever switches off the paid tools.<br />It never touches your history.
                </p>
              </div>
            )
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 10 }}>
                <TermCard label="6 Months" price="£89" per="for 6 months" gold />
                <TermCard label="One Year" price="£149" per={<>less than<br />£13 a month</>} sel gold badge="Best value" />
              </div>
              <button className="j-btn j-btn-lg" onClick={() => alert('Jotla AI arrives in 2027. Nothing is charged before it exists.')}
                style={{ marginTop: 12, background: 'linear-gradient(135deg,#14294A,#1E5099)', color: '#fff',
                  boxShadow: '0 14px 28px -10px rgba(20,41,74,0.6)' }}>
                <Icon name="sparkles" size={20} color="#E6B85C" /> Get Jotla AI
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--blue)',
                fontSize: 'calc(13px * var(--tscale, 1))', fontWeight: 500, margin: '10px 0 0' }}>
                <Icon name="check" size={15} color="var(--blue)" stroke={2.2} /> Jotla Plus is included in every term.
              </p>
              <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 'calc(11.5px * var(--tscale, 1))', lineHeight: 1.45, margin: '8px 0 0' }}>
                Jotla AI arrives in 2027. Nothing can be bought before it exists, and these prices are indicative until they are set
                at launch. When it arrives it will renew automatically at the end of its term: £89 every 6 months or £149 a year,
                charged to your Google Play account until you cancel, any time, in Subscriptions on Google Play. One price with Plus
                included, never one on top of another, and a subscription only ever switches off the paid tools.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12,
            color: 'var(--faint)', fontSize: 'calc(12.5px * var(--tscale, 1))' }}>
            <button onClick={() => nav.go('infoabout')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontSize: 'inherit', padding: 0 }}>Terms</button>·
            <button onClick={() => nav.go('infoabout')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontSize: 'inherit', padding: 0 }}>Privacy</button>·
            <button onClick={() => alert('On the phone build this restores a Google Play purchase.')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontSize: 'inherit', padding: 0 }}>Restore</button>·
            <button onClick={() => nav.go('help')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontSize: 'inherit', padding: 0 }}>Help</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPage({ nav, title, subtitle, children }) {
  return (
    <div className="j-screen">
      <PushHeader title={title} subtitle={subtitle} onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// One explainer card: icon disc, Cal Sans heading, optional status pill on
// the right, then paragraphs.
function InfoBlock({ icon, title, pill, children }) {
  return (
    <div className="j-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color="var(--blue)" />
        </span>
        <span className="j-h3" style={{ flexShrink: 1 }}>{title}</span>
        {pill}
      </div>
      {children}
    </div>
  );
}

// A body paragraph inside a block, muted exactly like the old info sheets.
function InfoP({ children, last = false }) {
  return <p className="j-body" style={{ color: 'var(--muted)', marginBottom: last ? 0 : 10 }}>{children}</p>;
}

// The grey status pill the Settings rows use for not-yet features.
function PlannedPill({ label = 'Planned' }) {
  return <span className="j-pillbadge" style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)' }}>{label}</span>;
}

// One planned-feature row on the About page: title beside its status pill,
// then a one-line note.
function PlanRow({ title, note, pill = 'Planned' }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)' }}>{title}</span>
        <PlannedPill label={pill} />
      </div>
      <p className="j-sm" style={{ marginTop: 2 }}>{note}</p>
    </div>
  );
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

function InfoAboutScreen({ nav }) {
  const FEEDBACK_HREF = 'mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla prototype feedback')
    + '&body=' + encodeURIComponent('What I was trying to do:\n\nWhat I think, or what happened:\n\nWhich screen:\n\nMy phone / browser:\n');
  return (
    <InfoPage nav={nav} title="About Jotla" subtitle="What it is, how it protects you, what is coming">
      <InfoBlock icon="star" title="Jotla">
        <InfoP><span className="j-strong">Jotla by SEN Help.</span> Early test build {window.JOTLA_BUILD}.</InfoP>
        <InfoP>Designed and built by SEN Help (sen.help).</InfoP>
        <InfoP last>Jotla is a private, on-device record for parents of children with special educational needs: log the moments, the moods and the school handoffs, keep the details of every letter and report, and export the record when someone needs to see it.</InfoP>
      </InfoBlock>

      <InfoBlock icon="heart" title="What Jotla is for">
        <InfoP>Every SEN parent is told to document everything. Nobody gives them the tool. Jotla is that tool.</InfoP>
        <InfoP>When it matters, at an EHCP assessment, an annual review or a tribunal, your record is already organised, dated and ready to share. Take it into a review to show the year as it really was, not as memory serves it. Bring dated notes to a school meeting so the conversation starts from what happened. And when you write to the Local Authority, the dates and details are already in one place.</InfoP>
        <InfoP last>One honest line: Jotla keeps the record, it does not give legal advice. What you can control is walking in with the facts ready.</InfoP>
      </InfoBlock>

      <InfoBlock icon="check" title="What is live now">
        <InfoP>This early build already does the everyday job: quick daily logging with moods, dysregulation notes for the hard moments, photos and videos kept with a note (part of Plus), a vault for letters and reports that can keep the document itself, as a photo or the file (adding it is part of Plus), and keyword search of your own notes.</InfoP>
        <InfoP last>Around that: the month calendar (its mood patterns are part of Plus), the printable day record (part of Plus), the tips deck for hard moments, the child check-in with its follow-up questions (the questions are part of Plus), dark mode, larger text sizes, a free export of the whole record, and restore from an export.</InfoP>
      </InfoBlock>

      <InfoBlock icon="clock" title="Why the dates can be trusted">
        <InfoP>Every note carries an honest label: <span className="j-strong">Same day</span> when it was logged on the day it happened, <span className="j-strong">Added later</span> when it was not.</InfoP>
        <InfoP last>The label is decided once, when the note is first saved, and it never changes. Editing the wording later does not rewrite it, and the note keeps its history of earlier wordings. Hours later is fine; a record that is straight about when things were written is worth more when someone else reads it.</InfoP>
      </InfoBlock>

      <InfoBlock icon="edit" title="What makes a strong record">
        <InfoP>Log facts: what happened, when, and who was there. What you write can end up in front of other people when you choose to share it; that is the record doing its job. So keep other children out of what you write and what you photograph where you can.</InfoP>
        <InfoP>Little and often beats perfect. The quick log takes seconds, and a plain sentence written today is worth more than a polished page written next month.</InfoP>
        <InfoP last>After a hard handover, open Dysregulation. It asks you the right questions in the right order while everything is still fresh.</InfoP>
      </InfoBlock>

      <InfoBlock icon="shield" title="Private by how it is built">
        <InfoP><span className="j-strong">We never send your record anywhere.</span> Jotla works without an account, a login or a cloud. Everything you write about your child stays on this device, and so does every photo you keep with a note and every document file you keep in the vault (adding them is part of Jotla Plus).</InfoP>
        <InfoP last>We never receive or access your data; there is nothing for us to read, lose or sell. This is not a policy we promise to follow, it is how the app is built: there is no upload in Jotla, so your record has nowhere to go except where you choose to send it.</InfoP>
      </InfoBlock>

      <InfoBlock icon="clock" title="Where the record lives">
        <InfoP>On this device, in this browser's own storage for Jotla. That is why the app works anywhere once it has loaded: no account, no login and no internet connection needed. It also means this browser holds the record, so the copies that exist are the ones you make with Export my data.</InfoP>
        <InfoP>One honest limit: browser storage is not for ever. Clearing this site's data in the browser's settings removes the record with it, and a browser can clear site data itself if the device runs very low on space. Storage also has a size limit, and photos and document files grow the record fastest: a very large file is refused kindly the moment you pick it (over 2 MB), and if a save ever cannot fit, Jotla warns you the moment it happens rather than losing anything quietly.</InfoP>
        <InfoP>If this device is lost or broken and you have an export file saved somewhere safe, <span className="j-strong">Restore from an export</span> (live in this build, in Settings) brings the record back on a new device, the child included. Anything already on the device stays: the restore adds what the file holds and never doubles up a note it already has.</InfoP>
        <InfoP last>If there is no export, the record is gone with the device. That is the honest trade of a record that never leaves your hands, and why a saved copy every few weeks is good insurance.</InfoP>
      </InfoBlock>

      <InfoBlock icon="arrowRight" title="What leaves this device">
        <InfoP>Nothing leaves this device unless you send it yourself. The app has exactly three doors out, and you open every one:</InfoP>
        <InfoP><span className="j-strong">Export my data</span> (in Settings, and offered again before you delete a child's record) saves one file to your device holding the whole of a child's record: every note with its date, its mood and what you wrote, the photos you kept with notes, the document files you kept in the vault, and the details of every letter and report, in a form the app can read straight back in. You choose where that file lives from there: your files, your own cloud drive, an email to yourself. It is free, and it stays free. Videos are never inside it: Jotla notes that a video exists but never copies the file, so the video itself stays in your own photo library.</InfoP>
        <InfoP><span className="j-strong">Create PDF</span> (the day record, part of Plus) opens a printable page in a new tab. It carries your words, never your photos, and it goes nowhere until you print or save it yourself.</InfoP>
        <InfoP><span className="j-strong">Email this to the teacher</span> (after a dysregulation note) opens your own email app with the note typed in for you. Nothing goes anywhere until you press send.</InfoP>
        <InfoP>Who can see the record? On this device: anyone you hand it to unlocked, in this browser, so your device's own lock is the front door. The child check-in screen is safe by design: leaving it takes a deliberate grown-up press-and-hold, never a stray tap, so a curious child cannot land in your notes. And once you share a copy, that copy is out of your hands: whoever you send it to can read it, keep it and pass it on. Share with people you trust, when it serves your child.</InfoP>
        <InfoP last>One honest detail: Jotla can only know that an export was run. It cannot see whether the file was saved or sent, or where it ended up. Keeping that copy safe is in your hands too.</InfoP>
      </InfoBlock>

      <InfoBlock icon="edit" title="Deleting things">
        <InfoP>Delete a note or a document from its own page. Every delete sits behind a confirm, and cannot be undone.</InfoP>
        <InfoP>Remove a whole child's record from their details sheet (hold the avatar, or tap the child's card in Settings). It is deliberately hard to do by accident: you confirm what will go, you are offered a backup file first, and you type DELETE to finish. The last child cannot be removed: the app always keeps at least one record.</InfoP>
        <InfoP last>Deleting in Jotla deletes from this device. There is no copy on our side to linger, because there never was one. Copies you exported earlier stay wherever you put them.</InfoP>
      </InfoBlock>

      <InfoBlock icon="clock" title="What is coming">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PlanRow title="Encrypted export" note="Your own locked copy, only you hold the key. Until then, keep exports somewhere private, like your own cloud drive." />
          <PlanRow title="Lock the app" note="A fingerprint, face, or PIN on this device. Until then, your device's own lock protects the record, and phones can also lock or pin individual apps." />
          <PlanRow title="Cloud backup to Google Drive" note="Part of Jotla Plus: save a copy to your own Google Drive on its own. It moves a copy off the phone, so it is being built carefully and is not switched on yet." pill="Coming soon" />
          <PlanRow title="Family Sync" note="Part of Jotla Plus: the record on every grown-up's phone." pill="Coming soon" />
          <InfoP last>Planned means exactly that: none of the above is switched on yet, and nothing in this app pretends to be.</InfoP>
        </div>
      </InfoBlock>

      <InfoBlock icon="sparkle" title="Jotla Plus">
        <InfoP>The record itself is free, forever: logging, your timeline, search and export never cost anything, never expire, and stay yours.</InfoP>
        <InfoP>Jotla Plus adds the tools to help you spot patterns and make your case: photos and videos kept with your notes, patterns and the Month view, deep filtering, Dysregulation Mode, and the PDF evidence pack. Family Sync, when it arrives, is part of Plus too. Plus is {TERM_PRICE} {TERM_PERIOD} or {PLUS_PRICE} for a year, through Google Play, and it stays on until the day a term runs out.</InfoP>
        <InfoP><span className="j-strong">If your year ends, you keep everything.</span> Your record is never held to ransom. If Plus ends, for any reason at all, whether you cancel, let it lapse, or a card quietly expires, you lose nothing you have written. Every entry stays. Your full timeline stays. Plain keyword search stays. Raw export stays. You can still make the PDF of everything you have already logged. Appeal-deadline safety reminders keep coming, with or without a subscription. A subscription only ever switches off the paid tools. It never touches your history.</InfoP>
        <InfoP>Jotla AI is coming in 2027: {AI_PRICE} {PLUS_PERIOD}, with Jotla Plus included, so it is {AI_PRICE} in total and not one price on top of another.</InfoP>
        <InfoP>Two of the emoji packs use open artwork, with thanks to their makers: Bold is Twemoji (CC BY 4.0) and Sticker is Microsoft Fluent Emoji (MIT licence). The other eight were drawn for Jotla. Full notices ship inside the app's moods folder.</InfoP>
        <button className="j-btn j-btn-soft" onClick={() => nav.go('unlock')}>
          <Icon name="sparkle" size={18} color="var(--blue)" /> See what Plus adds
        </button>
      </InfoBlock>

      <InfoBlock icon="heart" title="Tell us what you think">
        <InfoP>This is an early test, and your feedback shapes it.</InfoP>
        <button className="j-btn j-btn-primary" onClick={() => { window.location.assign(FEEDBACK_HREF); }}>
          <Icon name="heart" size={18} color="#fff" /> Tell us what you think
        </button>
        <p className="j-meta" style={{ textAlign: 'center', marginTop: 8 }}>Opens your email.</p>
      </InfoBlock>
    </InfoPage>
  );
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
function SettingsRow({ icon, title, sub, onClick, right, last }) {
  return (
    <button onClick={onClick} className={onClick ? 'j-press' : ''} style={{ width: '100%', textAlign: 'left', border: 'none',
      background: 'none', cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)' }}>{title}</span>
        {sub && <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{sub}</span>}
      </span>
      {right || (onClick && <Icon name="chevronRight" size={18} color="var(--faint)" />)}
    </button>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={!!on} aria-label={label || 'Toggle'} style={{ width: 52, height: 31, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? 'var(--green)' : 'var(--chip-border)', position: 'relative', transition: 'background .2s ease', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 24 : 3, width: 25, height: 25, borderRadius: '50%', background: '#fff',
        transition: 'left .2s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.25)' }} />
    </button>
  );
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
      if (k && k.indexOf('jotla_') === 0) n += ((localStorage.getItem(k) || '').length * 2);
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

const FEEDBACK_HREF = 'mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla prototype feedback')
  + '&body=' + encodeURIComponent('What I was trying to do:\n\nWhat I think, or what happened:\n\nWhich screen:\n\nMy phone / browser:\n');

// A standalone menu row: one flat card per row, no trailing arrow (rows are
// tappable as a whole, 6 Aug). `trailing` carries a live value, a toggle, a
// count, or the gold crown.
// ONE row height for the whole system (founder, 14 Aug: "make each option
// height the same height as the tab"): a row without a sub-line used to sit
// ~20px shorter than one with (Take the tour, Help, About, Backup...), so
// every row and every sheet option now reserves the two-line height and
// centres inside it.
const ROW_MIN_H = 'calc(45px * var(--tscale, 1) + 28px)';
function MRow({ icon, iconEl, title, sub, onClick, trailing, danger, style }) {
  return (
    <button className="j-card j-press" onClick={onClick} style={{ width: '100%', textAlign: 'left',
      cursor: onClick ? 'pointer' : 'default', padding: '14px 16px', display: 'flex', gap: 14,
      minHeight: ROW_MIN_H, alignItems: 'center', marginBottom: 10, ...(style || {}) }}>
      {iconEl || (icon ? <Icon name={icon} size={22} color={danger ? 'var(--red)' : 'var(--blue)'} style={{ flexShrink: 0 }} /> : null)}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500,
          fontSize: 'calc(16px * var(--tscale, 1))', color: danger ? 'var(--red)' : 'var(--ink)' }}>{title}</span>
        {sub && <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 2 }}>{sub}</span>}
      </span>
      {trailing}
    </button>
  );
}

// Picker sheet: radio rows, a tap applies instantly (no confirm button on pickers).
function RadioSheet({ title, subtitle, options, activeKey, onPick, onClose, footer }) {
  return (
    <div className="j-sheet-scrim" onClick={onClose}>
      <div className="j-sheet" onClick={e => e.stopPropagation()}>
        <div className="j-sheet-grab" />
        <h2 className="j-h2" style={{ marginBottom: subtitle ? 4 : 10 }}>{title}</h2>
        {subtitle && <p className="j-sm" style={{ marginBottom: 8 }}>{subtitle}</p>}
        {options.map((o, i) => (
          <button key={o.key} onClick={() => onPick(o.key)} className="j-press" role="radio" aria-checked={activeKey === o.key}
            aria-label={o.label} style={{ width: '100%', display: 'flex',
            // sheet options stand as tall as the settings rows they came from
            // (founder, 14 Aug: "the options height look thinner")
            minHeight: ROW_MIN_H, alignItems: 'center', gap: 12, padding: '13px 2px', background: 'none', border: 'none',
            borderBottom: i < options.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: '2px solid ' + (activeKey === o.key ? 'var(--blue)' : 'var(--faint)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeKey === o.key && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue)' }} />}
            </span>
            {o.iconEl || null}
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, color: 'var(--ink)',
                fontSize: o.size || 'calc(15.5px * var(--tscale, 1))' }}>{o.label}</span>
              {o.sub && <span style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 1 }}>{o.sub}</span>}
            </span>
            {o.trailing || null}
          </button>
        ))}
        {footer}
      </div>
    </div>
  );
}

// A quiet footnote line with a small leading icon (the honesty line pattern).
function FootNote({ icon = 'lock', children }) {
  return (
    <p style={{ display: 'flex', gap: 7, alignItems: 'flex-start', color: 'var(--faint)',
      fontSize: 'calc(12.5px * var(--tscale, 1))', lineHeight: 1.45, margin: '4px 2px 0' }}>
      <Icon name={icon} size={14} color="var(--faint)" style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </p>
  );
}

// ---------------- THE MENU TAB ----------------
// Route name stays 'settings' so saved navigation states never strand; the
// screen itself is the redesigned Menu.
function SettingsScreen({ nav, profile, entries = [], docs = [], binCount = 0 }) {
  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 10, paddingBottom: 120 }}>
          {/* the title IS the child; the cog opens Settings (the Todoist
              pattern). The cog rides a capped box so the row's top stays on
              the app-wide title line (founder, 7 Aug). */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <button className="j-press" onClick={() => nav.go('childprofile')} aria-label={'Open ' + profile.name + "'s profile"}
              style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              <ChildAvatar profile={profile} size={36} />
              <h1 className="j-h1" style={{ fontSize: 'calc(26px * var(--tscale, 1))' }}>{profile.name}</h1>
            </button>
            <div style={{ height: 36, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <button className="j-iconbtn" aria-label="Settings" onClick={() => nav.go('appsettings')}>
                <Icon name="settings" size={23} color="var(--muted)" />
              </button>
            </div>
          </div>

          {/* The ticket slot sells the NEXT tier up, and only one that can be
              acted on (founder, 8 Aug night, refining the 7 Aug rule): Free
              sees the purple Jotla Plus ticket; a Plus owner sees NOTHING until
              Jotla AI actually exists (AI_AVAILABLE), when the navy AI ticket
              takes the slot. A paid-up Menu carries no advertising. */}
          {!nav.plus ? (
            <button className="j-press" onClick={() => nav.go('unlock')} style={{ width: '100%', textAlign: 'left', border: 'none',
              cursor: 'pointer', background: PLUS_GRAD, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center',
              gap: 14, boxShadow: '0 10px 22px -8px rgba(38,24,84,0.5)', marginBottom: 14 }}>
              <Icon name="crown" size={28} color="#EBBA4D" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16.5px * var(--tscale, 1))', color: '#fff' }}>Jotla Plus</span>
                <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>
                  Get the best experience.</span>
              </span>
            </button>
          ) : AI_AVAILABLE ? (
            <button className="j-press" onClick={() => nav.go('unlock', { tier: 'ai' })} style={{ width: '100%', textAlign: 'left', border: 'none',
              cursor: 'pointer', background: PREMIUM_GRAD, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center',
              gap: 14, boxShadow: '0 10px 22px -8px rgba(20,41,74,0.5)', marginBottom: 14 }}>
              <Icon name="sparkles" size={28} color="#E6B85C" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16.5px * var(--tscale, 1))', color: '#fff' }}>Jotla AI</span>
                <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>
                  Here now, with Plus included.</span>
              </span>
            </button>
          ) : null}

          {/* THE CHILD'S HUB (founder, 14 Aug round 10: "the menu page has
              practically nothing... what else could we put in there that
              parents will find useful"). Five pages about the child, not the
              app. What helped and Important dates are Plus (his tier calls:
              What helped is born from Dysregulation, itself a Plus surface). */}
          <SectionLabel>For {profile.name}</SectionLabel>
          <MRow icon="heart" title={'All about ' + profile.name} sub="One page to hand to anyone new"
            onClick={() => nav.go('aboutchild')} />
          <MRow icon="leaf" title="What helped" sub="Your own strategies, from your own record"
            onClick={() => nav.plus ? nav.go('whathelped') : nav.go('unlock')}
            trailing={nav.plus ? null : <span data-crown-gate style={{ display: 'flex', flexShrink: 0 }}><Icon name="crown" size={20} color="var(--gold)" /></span>} />
          <MRow icon="person" title="Key contacts" sub="SENCO, teacher, case officer"
            onClick={() => nav.go('contacts')} />
          <MRow icon="calendar" title="Important dates" sub="Reviews and meetings, with a countdown"
            onClick={() => nav.plus ? nav.go('dates') : nav.go('unlock')}
            trailing={nav.plus ? null : <span data-crown-gate style={{ display: 'flex', flexShrink: 0 }}><Icon name="crown" size={20} color="var(--gold)" /></span>} />
          <MRow icon="star" title="Wins" sub="The good days, all in one place"
            onClick={() => nav.go('wins')} />

          <SectionLabel>Your record</SectionLabel>
          <MRow icon="cloudup" title="Backup and Restore" onClick={() => nav.go('backup')} />
          <MRow icon="trash" title="Recycle Bin" sub="Kept for 30 days" onClick={() => nav.go('bin')}
            trailing={binCount > 0 ? <span className="j-pillbadge" style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)' }}>{binCount}</span> : null} />

          <p className="j-meta" style={{ textAlign: 'center', marginTop: 26 }}>Jotla by SEN Help · Test build {window.JOTLA_BUILD}</p>
        </div>
      </div>
    </div>
  );
}
/* SectionLabel needs a little air above it on this screen */

/* ==================== THE CHILD'S HUB PAGES (round 10, 14 Aug) ==================== */

// Every "what helped" the record holds, grouped and counted: the parent's own
// playbook, distilled from their dysregulation notes. One home for the maths;
// the What helped page and the About print both read it.
function helpedStrategies(entries) {
  const at = {}; const out = [];
  for (const e of entries) {
    const h = e.type === 'handover' && e.handover && (e.handover.helped || '').trim();
    if (!h) continue;
    const k = h.toLowerCase();
    if (!(k in at)) { at[k] = out.length; out.push({ text: h, count: 0, last: e.date }); }
    const s = out[at[k]];
    s.count += 1;
    if (e.date > s.last) s.last = e.date;
  }
  return out.sort((a, b) => b.count - a.count || (a.last < b.last ? 1 : -1));
}

// The About page, taken out: one clean printable page through the same
// print-to-PDF door the day record uses. Nothing is uploaded.
function openPrintAboutChild(profile, about, helped) {
  const J = window.JOTLA;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const sec = (label, text) => (text || '').trim()
    ? '<div style="margin:0 0 14px;"><p style="margin:0 0 3px;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#1A56A8;font-weight:600;">' + esc(label) + '</p>'
      + '<p style="margin:0;font-size:14px;line-height:1.55;white-space:pre-line;">' + esc(text.trim()) + '</p></div>' : '';
  const w = window.open('', '_blank');
  if (!w) { alert('Your browser blocked the new tab. Allow pop-ups for this page and try again.'); return false; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>All about ' + esc(profile.name) + '</title></head>'
    + '<body style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#14223b;max-width:720px;margin:24px auto;padding:0 16px;">'
    + '<p style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8892a6;margin:0 0 6px;">All about · Jotla</p>'
    + '<h1 style="font-size:24px;margin:0 0 2px;">' + esc(profile.name) + '</h1>'
    + '<p style="font-size:12.5px;margin:0 0 18px;color:#5b6780;">' + esc([profile.year, profile.school].filter(Boolean).join(' · '))
    + ' · Prepared ' + esc(J.fmtShort(J.TODAY_ISO)) + ' ' + esc(J.TODAY_ISO.slice(0, 4)) + '</p>'
    + sec('What calms ' + profile.name, about.calms)
    + sec('What makes things hard', about.hard)
    + sec('How ' + profile.name + ' communicates', about.talk)
    + sec('Key needs', about.needs)
    + sec('What ' + profile.name + ' loves', about.loves)
    + ((profile.adults || []).length ? sec('The adults ' + profile.name + ' knows', (profile.adults || []).join(', ')) : '')
    + ((helped || []).length ? '<div style="margin:0 0 14px;"><p style="margin:0 0 3px;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#1A56A8;font-weight:600;">What has helped before</p>'
      + helped.map(s => '<p style="margin:0 0 3px;font-size:14px;line-height:1.55;">' + esc(s.text) + (s.count > 1 ? ' <span style="color:#8892a6;font-size:12px;">(worked ' + s.count + ' times)</span>' : '') + '</p>').join('') + '</div>' : '')
    + '<p style="font-size:10.5px;color:#8892a6;line-height:1.5;margin-top:18px;padding-top:12px;border-top:1px dashed #dde3ee;">'
    + 'Written by ' + esc(profile.name) + '\'s family using their own Jotla record.</p>'
    + '</body></html>');
  w.document.close(); w.focus();
  setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
  return true;
}

// ---- All about [child]: the one-page handover card (free) ----
// Every new teacher, club and supply gets the same re-explanation from
// scratch; this page carries it once, in the family's own words, printable
// through the print-to-PDF door. Fields live on the child (per child, on
// this phone), edited live like the profile page's details.
function AboutChildScreen({ nav, profile, entries }) {
  const about = profile.about || {};
  const setAbout = (patch) => nav.setChild({ about: { ...about, ...patch } });
  const field = (key, label, placeholder) => (
    <>
      <FieldLabel>{label}</FieldLabel>
      <textarea className="j-input" rows={2} value={about[key] || ''} placeholder={placeholder}
        onChange={e => setAbout({ [key]: e.target.value })} style={{ marginBottom: 14, resize: 'vertical' }} />
    </>
  );
  const helped = nav.plus ? helpedStrategies(entries).slice(0, 5) : [];
  const anyContent = ['calms', 'hard', 'talk', 'needs', 'loves'].some(k => (about[k] || '').trim()) || (profile.adults || []).length > 0;
  return (
    <div className="j-screen">
      <PushHeader title={'All about ' + profile.name} onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
          <p className="j-sm" style={{ marginBottom: 16 }}>The page you would hand to a new teacher, a club, or anyone meeting {profile.name} for the first time. In your words.</p>
          <div className="j-card" style={{ padding: 16, marginBottom: 10 }}>
            {field('calms', 'What calms ' + profile.name, 'Deep pressure, the blue blanket, counting down from five...')}
            {field('hard', 'What makes things hard', 'Loud rooms, sudden changes, being rushed...')}
            {field('talk', 'How ' + profile.name + ' communicates', 'Short sentences work best. Signs for more and finished...')}
            {field('needs', 'Key needs', 'Ear defenders for assembly, sits near the door...')}
            <FieldLabel>What {profile.name} loves</FieldLabel>
            <textarea className="j-input" rows={2} value={about.loves || ''} placeholder="Trains, drawing, the sensory room..."
              onChange={e => setAbout({ loves: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <SectionLabel>The adults around {(profile.name || '').trim() || 'them'}</SectionLabel>
          <AdultsEditor profile={profile} onChange={nav.setChild} />
          <button className="j-btn j-btn-ghost" data-print-about disabled={!anyContent} style={{ marginTop: 6, ...(anyContent ? {} : { opacity: 0.5, cursor: 'default' }) }}
            onClick={() => anyContent && openPrintAboutChild(profile, about, helped)}>
            <Icon name="doc" size={18} color="var(--blue)" /> Print or save as PDF
          </button>
          <FootNote>Everything here stays on this phone until you choose to print or share it.</FootNote>
        </div>
      </div>
    </div>
  );
}

// ---- What helped: the strategy bank (Plus, born from Dysregulation) ----
function WhatHelpedScreen({ nav, entries }) {
  const J = window.JOTLA;
  const list = helpedStrategies(entries);
  return (
    <div className="j-screen">
      <PushHeader title="What helped" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
          {!nav.plus ? (
            <PlusLockedCard icon="leaf" title="Your own strategies"
              text={<>Every dysregulation note asks what helped.<br />This page gathers those answers into your own playbook. Part of Plus.</>}
              onClick={() => nav.go('unlock')} />
          ) : (
            <>
              <p className="j-sm" style={{ marginBottom: 16 }}>Every time you note a hard moment, Jotla asks what helped. These are your own answers, gathered from your own record.</p>
              {list.length === 0 ? (
                <div className="j-card" style={{ padding: 22, textAlign: 'center' }}>
                  <p className="j-sm">Nothing here yet. When a dysregulation note says what helped, it lands on this page.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {list.map((s, i) => (
                    <div key={i} className="j-card" data-helped-row style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span className="j-pillbadge" style={{ background: 'var(--tint-green)', color: 'var(--green-ink)', flexShrink: 0 }}>
                        {s.count > 1 ? 'x' + s.count : 'once'}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="j-body" style={{ display: 'block' }}>{s.text}</span>
                        <span className="j-meta" style={{ display: 'block', marginTop: 3 }}>Last on {J.fmtShort(s.last)} {s.last.slice(0, 4)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <FootNote icon="leaf">The more honestly the hard moments are logged, the sharper this page gets.</FootNote>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Key contacts: the people a stressed parent calls at the gate (free) ----
function ContactsScreen({ nav, profile }) {
  const contacts = profile.contacts || [];
  const [name, setName] = useStateB('');
  const [role, setRole] = useStateB('');
  const [phone, setPhone] = useStateB('');
  const [email, setEmail] = useStateB('');
  const add = () => {
    const n = name.trim();
    if (!n) return;
    nav.setChild({ contacts: [...contacts, { id: 'c' + contacts.length + '_' + n.length + n.charCodeAt(0), name: n, role: role.trim(), phone: phone.trim(), email: email.trim() }] });
    setName(''); setRole(''); setPhone(''); setEmail('');
  };
  const iconLink = (href, icon, label) => (
    <a href={href} aria-label={label} className="j-press" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tint-blue)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>
      <Icon name={icon} size={18} color="var(--blue)" />
    </a>
  );
  return (
    <div className="j-screen">
      <PushHeader title="Key contacts" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
          <p className="j-sm" style={{ marginBottom: 16 }}>The people around {profile.name}: SENCO, class teacher, case officer, club leader. One tap to call or email.</p>
          {contacts.map(c => (
            <div key={c.id} className="j-card" data-contact-row style={{ padding: 16, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="j-strong" style={{ display: 'block', fontSize: 'calc(16px * var(--tscale, 1))' }}>{c.name}</span>
                {c.role && <span className="j-meta" style={{ display: 'block', marginTop: 2 }}>{c.role}</span>}
              </span>
              {c.phone && iconLink('tel:' + c.phone, 'bell', 'Call ' + c.name)}
              {c.email && iconLink('mailto:' + c.email, 'mail', 'Email ' + c.name)}
              <button onClick={() => nav.setChild({ contacts: contacts.filter(x => x.id !== c.id) })} aria-label={'Remove ' + c.name}
                className="j-press" style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--tag-grey-bg)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="close" size={16} color="var(--muted)" />
              </button>
            </div>
          ))}
          <SectionLabel>Add someone</SectionLabel>
          <div className="j-card" style={{ padding: 16 }}>
            <FieldLabel>Name</FieldLabel>
            <input className="j-input" value={name} onChange={e => setName(e.target.value)} placeholder="Mrs Price" style={{ marginBottom: 12 }} />
            <FieldLabel>Role</FieldLabel>
            <input className="j-input" value={role} onChange={e => setRole(e.target.value)} placeholder="SENCO at Oakfield" style={{ marginBottom: 12 }} />
            <FieldLabel>Phone</FieldLabel>
            <input className="j-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="School office or direct line" style={{ marginBottom: 12 }} />
            <FieldLabel>Email</FieldLabel>
            <input className="j-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="senco@school.org.uk" style={{ marginBottom: 14 }} />
            <button className="j-btn j-btn-soft" onClick={add} disabled={!name.trim()} style={name.trim() ? {} : { opacity: 0.5, cursor: 'default' }}>Add</button>
          </div>
          <FootNote>Contacts stay on this phone. Calling or emailing uses your own phone and your own email.</FootNote>
        </div>
      </div>
    </div>
  );
}

// ---- Important dates: reviews and meetings with a countdown (Plus) ----
// The parent's OWN dates, listed and counted down. Jotla never calculates a
// legal deadline for them: a wrong week number in an app is a real harm, so
// that stays out until it can be verified properly (founder + Vision, 14 Aug).
function DatesScreen({ nav, profile }) {
  const J = window.JOTLA;
  const dates = profile.dates || [];
  const [label, setLabel] = useStateB('');
  const [iso, setIso] = useStateB('');
  const [pickerOpen, setPickerOpen] = useStateB(false);
  const daysTo = (d) => Math.round((J.parseISO(d) - J.parseISO(J.TODAY_ISO)) / 86400000);
  const countdown = (d) => { const n = daysTo(d); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 1 ? 'In ' + n + ' days' : n === -1 ? 'Yesterday' : (-n) + ' days ago'; };
  const add = () => {
    const l = label.trim();
    if (!l || !iso) return;
    nav.setChild({ dates: [...dates, { id: 'd' + dates.length + '_' + iso, label: l, iso }].sort((a, b) => a.iso < b.iso ? -1 : 1) });
    setLabel(''); setIso('');
  };
  return (
    <div className="j-screen">
      <PushHeader title="Important dates" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
          {!nav.plus ? (
            <PlusLockedCard icon="calendar" title="Reviews and meetings, counted down"
              text={<>The annual review, the next school meeting, the date you must reply by.<br />Kept per child, with a countdown. Part of Plus.</>}
              onClick={() => nav.go('unlock')} />
          ) : (
            <>
              <p className="j-sm" style={{ marginBottom: 16 }}>{profile.name}'s reviews, meetings and dates to hold, with a countdown. Your dates, in your hands.</p>
              {dates.map(d => {
                const past = daysTo(d.iso) < 0;
                return (
                  <div key={d.id} className="j-card" data-date-row style={{ padding: 16, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center', opacity: past ? 0.55 : 1 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="j-strong" style={{ display: 'block', fontSize: 'calc(16px * var(--tscale, 1))' }}>{d.label}</span>
                      <span className="j-meta" style={{ display: 'block', marginTop: 2 }}>{J.fmtLong(d.iso)} {d.iso.slice(0, 4)}</span>
                    </span>
                    <span className="j-pillbadge" style={{ background: past ? 'var(--tag-grey-bg)' : 'var(--tint-blue)', color: past ? 'var(--muted)' : 'var(--blue)', flexShrink: 0 }}>{countdown(d.iso)}</span>
                    <button onClick={() => nav.setChild({ dates: dates.filter(x => x.id !== d.id) })} aria-label={'Remove ' + d.label}
                      className="j-press" style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--tag-grey-bg)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="close" size={16} color="var(--muted)" />
                    </button>
                  </div>
                );
              })}
              <SectionLabel>Add a date</SectionLabel>
              <div className="j-card" style={{ padding: 16 }}>
                <FieldLabel>What is it?</FieldLabel>
                <input className="j-input" value={label} onChange={e => setLabel(e.target.value)} placeholder="Annual review" style={{ marginBottom: 12 }} />
                <FieldLabel>When</FieldLabel>
                <DateField value={iso ? `${J.fmtShort(iso)} ${iso.slice(0, 4)}` : null} placeholder="Pick a day" label="The date"
                  onClick={() => setPickerOpen(true)} style={{ marginBottom: 14 }} />
                <button className="j-btn j-btn-soft" onClick={add} disabled={!label.trim() || !iso}
                  style={label.trim() && iso ? {} : { opacity: 0.5, cursor: 'default' }}>Add</button>
              </div>
              <FootNote>Jotla lists your dates; it never works out legal deadlines for you. For those, check with IPSEA or your own advisor.</FootNote>
            </>
          )}
        </div>
      </div>
      {pickerOpen && (
        <CalendarSheet onClose={() => setPickerOpen(false)} value={iso || null}
          onSelect={(d) => { setIso(d); }} onClear={() => setIso('')} />
      )}
    </div>
  );
}

// ---- Wins: the good days in one stream (free) ----
// The record leans hard because hard is what needs evidencing; this page is
// the other half of the story, for the parent on a bad night.
function WinsScreen({ nav, entries }) {
  const wins = entries.filter(e => e.mood === 'good' || ['Wins', 'New words'].includes(e.category));
  return (
    <div className="j-screen">
      <PushHeader title="Wins" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 40 }}>
          <p className="j-sm" style={{ marginBottom: 16 }}>{wins.length === 0 ? 'Every good day, win and new word will gather here.' : wins.length + ' bright ' + (wins.length === 1 ? 'moment' : 'moments') + ', straight from your own record.'}</p>
          {wins.length === 0 ? (
            <div className="j-card" style={{ padding: 22, textAlign: 'center' }}>
              <p className="j-sm">Nothing yet. The first good day lands here on its own.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {wins.map(e => <EntryCard key={e.id} entry={e} showDate onClick={() => nav.go('entry', { id: e.id })} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------- SETTINGS (behind the cog) ----------------
function AppSettingsScreen({ nav }) {
  const J = window.JOTLA;
  const [sheet, setSheet] = useStateB(null); // null | 'theme' | 'size' | 'reminder' | 'weekstart'
  const [customTime, setCustomTime] = useStateB('20:00');
  const [remCustom, setRemCustom] = useStateB(false);
  const themeLabel = nav.theme === 'system' ? 'System' : (nav.theme === 'dark' ? 'Dark' : 'Light');
  const sizeLabel = ({ '0.9': 'Small', '1': 'Standard', '1.12': 'Large', '1.25': 'Extra large' })[String(nav.tscale)] || 'Standard';
  const weekStartLabel = J.DOW_LONG[typeof nav.weekStart === 'number' ? nav.weekStart : 1];
  const kids = (nav.profiles || []).map(p => p.name).join(', ');
  return (
    <div className="j-screen">
      <PushHeader title="Settings" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>

          {/* Children leads, un-labelled, the way the old settings led with the child card */}
          <MRow iconEl={<ChildAvatar profile={(nav.profiles || [])[0]} size={26} />} title="Children" sub={kids}
            onClick={() => nav.go('children')} />

          <SectionLabel>Appearance</SectionLabel>
          <MRow icon="palette" title="Theme" sub={themeLabel} onClick={() => setSheet('theme')} />
          <MRow icon="textsize" title="Text size" sub={sizeLabel} onClick={() => setSheet('size')} />
          {/* Emojis (founder, 9 Aug): a full page of real emoji packs, Bold
              free, Sticker on Plus (crown gate on the page itself) */}
          <MRow iconEl={<Face mood="happy" size={24} />} title="Emojis" sub={FACE_PACK_LABEL(nav.faceStyle)} onClick={() => nav.go('moodstyle')} />

          <SectionLabel>Calendar</SectionLabel>
          {/* the week starts where the parent says (founder, 14 Aug); every
              calendar surface follows through J.weekLead / J.dowLabels */}
          <MRow icon="calendar" title="Start of the week" sub={weekStartLabel} onClick={() => setSheet('weekstart')} />

          <SectionLabel>Privacy</SectionLabel>
          <MRow icon="lock" title="App lock" sub={nav.appLock && nav.appLock.on ? 'On' : 'Off'} onClick={() => nav.go('applock')} />

          <SectionLabel>Reminders</SectionLabel>
          <MRow icon="bell" title="Daily reminder" sub={nav.reminder || 'Off'} onClick={() => { setRemCustom(false); setSheet('reminder'); }} />

          <SectionLabel>Help and about</SectionLabel>
          <MRow icon="play" title="Take the tour" onClick={() => nav.go('tour')} />
          <MRow icon="help" title="Help" onClick={() => nav.go('help')} />
          <MRow icon="info" title="About Jotla" onClick={() => nav.go('infoabout')} />
          <MRow icon="heart" title="Tell us what you think" onClick={() => window.location.assign(FEEDBACK_HREF)} />

          {/* An owned tier lives at the VERY BOTTOM as a quiet status row
              (founder, 8 Aug night: membership is a receipt, not a feature;
              moved down from under Children). The crown stays: it is the
              tier's emblem here, not a locked-feature marker. */}
          {nav.plus && (
            <>
              <SectionLabel>Membership</SectionLabel>
              <MRow iconEl={<Icon name="crown" size={22} color="var(--gold)" style={{ flexShrink: 0 }} />}
                title="Jotla Plus" sub="Everything unlocked on this phone"
                trailing={<span className="j-pillbadge" style={{ background: 'var(--tint-green)', color: 'var(--green-ink)', border: '1px solid var(--green)' }}>Active</span>}
                onClick={() => nav.go('unlock')} />
            </>
          )}

          <FootNote>No account, and nothing leaves the phone. Jotla works without a login: everything stays on this device, and there is no cloud we can read.</FootNote>
        </div>
      </div>

      {sheet === 'theme' && (
        <RadioSheet title="Theme" activeKey={nav.theme} onClose={() => setSheet(null)}
          options={[{ key: 'light', label: 'Light' }, { key: 'dark', label: 'Dark' }, { key: 'system', label: 'System', sub: 'Follows your phone' }]}
          onPick={(k) => { nav.setTheme(k); setSheet(null); }} />
      )}
      {sheet === 'size' && (
        <RadioSheet title="Text size" activeKey={String(nav.tscale)} onClose={() => setSheet(null)}
          options={[
            { key: '0.9', label: 'Small', size: '13px' },
            { key: '1', label: 'Standard', size: '15.5px' },
            { key: '1.12', label: 'Large', size: '17.5px' },
            { key: '1.25', label: 'Extra large', size: '19.5px' },
          ]}
          onPick={(k) => { nav.setTscale(parseFloat(k)); setSheet(null); }} />
      )}
      {sheet === 'weekstart' && (
        <RadioSheet title="Start of the week" activeKey={String(typeof nav.weekStart === 'number' ? nav.weekStart : 1)}
          onClose={() => setSheet(null)}
          options={[1, 2, 3, 4, 5, 6, 0].map(d => ({ key: String(d), label: J.DOW_LONG[d] }))}
          onPick={(k) => { nav.setWeekStart(Number(k)); setSheet(null); }} />
      )}
      {sheet === 'reminder' && (
        <RadioSheet title="Daily reminder" subtitle="A gentle nudge to write the day down."
          activeKey={remCustom ? 'custom' : (['Off', 'Morning · 08:00', 'Evening · 20:00'].includes(nav.reminder) ? nav.reminder : 'custom')}
          onClose={() => setSheet(null)}
          options={[
            { key: 'Off', label: 'Off' },
            { key: 'Morning · 08:00', label: 'Morning · 08:00' },
            { key: 'Evening · 20:00', label: 'Evening · 20:00' },
            { key: 'custom', label: 'Choose a time' },
          ]}
          onPick={(k) => { if (k === 'custom') { setRemCustom(true); return; } nav.setReminder(k); setSheet(null); }}
          footer={remCustom ? (
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <input type="time" className="j-input" value={customTime} onChange={e => setCustomTime(e.target.value)} style={{ flex: 1 }} />
              <button className="j-btn j-btn-primary" style={{ width: 'auto', minHeight: 48, padding: '0 22px' }}
                onClick={() => { nav.setReminder(customTime); setSheet(null); }}>Set</button>
            </div>
          ) : null} />
      )}
    </div>
  );
}

// ---------------- MOOD STYLE (the pack picker page, 9 Aug) ----------------
// A full page, not a sheet (founder: "a new page showing you how they look"):
// every pack shows its five moods in a row; the active pack wears the blue
// tick; on free every pack but the free default wears the crown and a tap opens
// the Jotla Plus page (the crown gate). Owners tap to apply instantly, app-wide.
// The page is driven by FACE_PACK_ORDER, so a new pack needs no change here.
function MoodStyleScreen({ nav }) {
  const active = FACE_PACKS[nav.faceStyle] ? nav.faceStyle : FACE_PACK_DEFAULT;
  const moods = ['happy', 'ok', 'sad', 'worried', 'angry'];
  return (
    <div className="j-screen">
      {/* named Emojis, no subtitle (founder, 9 Aug: "dont call it Mood style,
          call it Emojis. remove that grey comment") */}
      <PushHeader title="Emojis" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          {FACE_PACK_ORDER.map(k => {
            const locked = k !== FACE_PACK_DEFAULT && !nav.plus;
            const on = active === k;
            return (
              <button key={k} className="j-card j-press" role="radio" aria-checked={on} aria-label={FACE_PACK_LABEL(k)}
                onClick={() => { if (locked) { nav.go('unlock'); return; } nav.setFaceStyle(k); }}
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: '14px 16px', marginBottom: 10,
                  border: '1.5px solid ' + (on ? 'var(--blue)' : 'var(--line)') }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)' }}>{FACE_PACK_LABEL(k)}</span>
                  {locked
                    ? <span data-crown-gate style={{ display: 'flex', flexShrink: 0 }}><Icon name="crown" size={20} color="var(--gold)" /></span>
                    : (on ? <Icon name="check" size={20} color="var(--blue)" stroke={2.4} /> : null)}
                </span>
                <span style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'space-between' }}>
                  {moods.map(m => <Face key={m} mood={m} size={40} styleName={k} />)}
                </span>
              </button>
            );
          })}
          <FootNote>Bold is part of Free. The other nine are part of Plus, and the whole record changes together: Today, the Month, and the child's own screens.</FootNote>
        </div>
      </div>
    </div>
  );
}

// ---------------- CHILDREN ----------------
function ChildrenScreen({ nav }) {
  const list = nav.profiles || [];
  return (
    <div className="j-screen">
      <PushHeader title="Children" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          <SectionLabel>On this phone</SectionLabel>
          {list.map(p => (
            <MRow key={p.id} iconEl={<ChildAvatar profile={p} size={34} />} title={p.name}
              sub={[p.year, p.school].filter(Boolean).join(' · ') || null}
              onClick={() => { nav.pickChild(p.id); nav.go('childprofile'); }}
              trailing={p.id === nav.profileId ? <Icon name="check" size={20} color="var(--blue)" stroke={2.2} /> : null} />
          ))}
          <button className="j-press" onClick={() => nav.go('addchild')}
            style={{ width: '100%', border: '1px dashed var(--chip-border)', background: 'none', borderRadius: 14,
              padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--blue)', cursor: 'pointer',
              fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(15.5px * var(--tscale, 1))' }}>
            <Icon name="plus" size={20} color="var(--blue)" stroke={2.2} /> Add another child
          </button>
          <FootNote>Each child keeps their own private record on this phone. The tick shows whose record the app is on.</FootNote>
        </div>
      </div>
    </div>
  );
}

// ---------------- THE CHILD PROFILE (a page, not a drawer) ----------------
function ChildProfileScreen({ nav, profile, entries = [], docs = [] }) {
  const J = window.JOTLA;
  const [dangerMode, setDangerMode] = useStateB(null); // null | 'reset' | 'delete'
  const [cropSrc, setCropSrc] = useStateB(null);
  const [avSheet, setAvSheet] = useStateB(false);
  const [pvFigure, setPvFigure] = useStateB(null); // preview values while the edit sheet is open
  const [pvGlyph, setPvGlyph] = useStateB(null);
  const Cropper = window.PhotoCropper;
  const canDelete = (nav.profiles || []).length > 1;
  const shown = { ...profile, figure: pvFigure || profile.figure, glyph: pvGlyph || profile.glyph };
  const openSheet = () => { setPvFigure(profile.figure); setPvGlyph(profile.glyph || 'initial'); setAvSheet(true); };
  return (
    <div className="j-screen">
      <PushHeader title="" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 0, paddingBottom: 40 }}>

          {/* the identity block: the child's image big and central */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 6 }}>
            <ChildAvatar profile={avSheet ? shown : profile} size={88} />
            <h1 className="j-h2" style={{ fontFamily: "'Cal Sans', system-ui", fontSize: 'calc(26px * var(--tscale, 1))', marginTop: 10 }}>{profile.name}</h1>
            <p className="j-sm" style={{ marginTop: 2 }}>{[profile.year, profile.school].filter(Boolean).join(' · ')}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <label className="j-press" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999,
                cursor: 'pointer', background: 'var(--tint-blue)', border: '1px solid rgba(26,86,168,0.30)', color: 'var(--blue)',
                fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500 }}>
                <Icon name="camera" size={17} color="var(--blue)" /> {profile.photo ? 'Change photo' : 'Upload a photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files && e.target.files[0]; if (f) window.fileToDataURL(f, url => setCropSrc(url)); e.target.value = ''; }} />
              </label>
              {profile.photo && (
                <button className="j-press" onClick={() => nav.setChild({ photo: null })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 999, cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--chip-border)',
                  color: 'var(--muted)', fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500 }}>
                  <Icon name="close" size={16} color="var(--muted)" /> Remove
                </button>
              )}
            </div>
          </div>

          <SectionLabel>Details</SectionLabel>
          <div className="j-card" style={{ padding: 16, marginBottom: 10 }}>
            <FieldLabel>Name</FieldLabel>
            <input className="j-input" value={profile.name} onChange={e => nav.setChild({ name: e.target.value })} style={{ marginBottom: 14 }} />
            <FieldLabel>School or setting</FieldLabel>
            <input className="j-input" value={profile.school} onChange={e => nav.setChild({ school: e.target.value })} style={{ marginBottom: 14 }} />
            <FieldLabel>Year group</FieldLabel>
            <input className="j-input" value={profile.year} onChange={e => nav.setChild({ year: e.target.value })} />
          </div>
          <MRow icon="palette" title="Colour and Avatar" onClick={openSheet} />

          <SectionLabel>The adults around {(profile.name || '').trim() || 'them'}</SectionLabel>
          <AdultsEditor profile={profile} onChange={nav.setChild} />

          <SectionLabel><span style={{ color: 'var(--red)' }}>Careful</span></SectionLabel>
          {/* No sub-lines on the two Careful rows (Bupe, 7 Aug): the titles say it,
              and the guarded sheet spells out the consequences in full. */}
          <MRow icon="restart" danger title="Reset this child" onClick={() => setDangerMode('reset')} />
          {canDelete && <MRow icon="trash" danger title="Delete this child" onClick={() => setDangerMode('delete')} />}
          <FootNote>Both offer a backup first and need a clear confirm. {profile.name}'s record never leaves this phone without you.</FootNote>
        </div>
      </div>

      {/* the colour and avatar edit sheet: live preview, Done commits, Cancel reverts */}
      {avSheet && (
        <div className="j-sheet-scrim" onClick={() => setAvSheet(false)}>
          <div className="j-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '86%', overflowY: 'auto' }}>
            <div className="j-sheet-grab" />
            <h2 className="j-h2" style={{ marginBottom: 10 }}>Colour and avatar</h2>
            <SectionLabel>Colour</SectionLabel>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              {(J.AVATAR_COLOURS || []).map(c => (
                <button key={c.key} onClick={() => setPvFigure(c.figure)} aria-label={'Colour ' + c.key} className="j-press"
                  style={{ width: 37, height: 37, borderRadius: '50%', cursor: 'pointer', background: c.figure,
                    border: '3px solid var(--card)', boxShadow: pvFigure === c.figure ? '0 0 0 2px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />
              ))}
            </div>
            <SectionLabel>Avatar</SectionLabel>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
              {CHILD_GLYPHS.map(g => (
                <button key={g} onClick={() => setPvGlyph(g)} aria-label={'Avatar ' + g} className="j-press"
                  style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', padding: 0, border: 'none',
                    background: 'transparent', boxShadow: pvGlyph === g ? '0 0 0 2px var(--ink)' : 'none' }}>
                  <ChildAvatar profile={{ ...profile, figure: pvFigure || profile.figure, glyph: g, photo: null }} size={44} ring={false} />
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="j-btn j-btn-ghost" style={{ flex: 1 }} onClick={() => setAvSheet(false)}>Cancel</button>
              <button className="j-btn j-btn-primary" style={{ flex: 1 }}
                onClick={() => { nav.setChild({ figure: pvFigure, glyph: pvGlyph }); setAvSheet(false); }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {dangerMode && <DeleteChildSheet mode={dangerMode} profile={profile} entries={entries} docs={docs}
        onClose={() => setDangerMode(null)}
        onConfirm={() => { const m = dangerMode; setDangerMode(null);
          if (m === 'reset') { nav.resetChild(nav.profileId); }
          else { nav.deleteChild(nav.profileId); nav.setTab('settings'); } }} />}
      {cropSrc && <Cropper src={cropSrc} onDone={url => { nav.setChild({ photo: url }); setCropSrc(null); }} onCancel={() => setCropSrc(null)} />}
    </div>
  );
}

// the adults chip editor, lifted from the old details sheet
function AdultsEditor({ profile, onChange }) {
  const [draft, setDraft] = useStateB('');
  const adults = profile.adults || [];
  const add = () => {
    const n = draft.trim();
    if (!n) return;
    if (!adults.some(a => a.toLowerCase() === n.toLowerCase())) onChange({ adults: [...adults, n] });
    setDraft('');
  };
  return (
    <div className="j-card" style={{ padding: 16, marginBottom: 10 }}>
      {adults.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {adults.map(a => (
            <button key={a} className="j-press" onClick={() => onChange({ adults: adults.filter(x => x !== a) })} aria-label={'Remove ' + a}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--chip-border)',
                background: 'var(--card)', borderRadius: 999, padding: '8px 14px', cursor: 'pointer',
                fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--ink)' }}>
              {a} <Icon name="close" size={14} color="var(--faint)" />
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <input className="j-input" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Mrs Price, Mr Okafor the TA..." aria-label="Add an adult" style={{ flex: 1, minWidth: 0 }} />
        <button className="j-btn j-btn-soft" onClick={add} disabled={!draft.trim()}
          style={{ width: 'auto', flexShrink: 0, padding: '0 22px', ...(draft.trim() ? {} : { opacity: 0.5, cursor: 'default' }) }}>Add</button>
      </div>
    </div>
  );
}

// ---------------- APP LOCK (free: privacy is never paywalled) ----------------
// The web prototype holds the parent's choices; the real lock screen, pattern
// entry and biometrics are native-build work.
function AppLockScreen({ nav }) {
  const al = nav.appLock || { on: false, method: 'Pattern', bio: false, question: false };
  const [methodSheet, setMethodSheet] = useStateB(false);
  const [qSheet, setQSheet] = useStateB(false);
  const [qDraft, setQDraft] = useStateB('');
  const [aDraft, setADraft] = useStateB('');
  const set = (patch) => nav.setAppLock({ ...al, ...patch });
  return (
    <div className="j-screen">
      <PushHeader title="App lock" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          <MRow icon="lock" title="App lock" sub="Asked for every time Jotla opens"
            onClick={() => set({ on: !al.on })}
            trailing={<Toggle on={al.on} onChange={() => set({ on: !al.on })} label="App lock" />} />

          <SectionLabel>Unlock with</SectionLabel>
          <MRow icon="dots9" title="Pattern or PIN" sub={al.method} onClick={() => setMethodSheet(true)} />
          <MRow icon="finger" title="Fingerprint or face" sub="When your phone can"
            onClick={() => set({ bio: !al.bio })}
            trailing={<Toggle on={al.bio} onChange={() => set({ bio: !al.bio })} label="Fingerprint or face" />} />

          <SectionLabel>If you forget</SectionLabel>
          <MRow icon="help" title="Security question" sub={al.question ? 'Set' : 'Not set yet'} onClick={() => setQSheet(true)} />

          <FootNote>The lock, the pattern and your answer stay on this phone and are checked nowhere else. Jotla cannot reset a lock for you, so set the question.</FootNote>
        </div>
      </div>

      {methodSheet && (
        <RadioSheet title="Unlock with" activeKey={al.method} onClose={() => setMethodSheet(false)}
          options={[{ key: 'Pattern', label: 'Pattern', sub: 'Join the dots' }, { key: 'PIN', label: 'PIN', sub: 'Four digits or more' }]}
          onPick={(k) => { set({ method: k }); setMethodSheet(false); }} />
      )}
      {qSheet && (
        <div className="j-sheet-scrim" onClick={() => setQSheet(false)}>
          <div className="j-sheet" onClick={e => e.stopPropagation()}>
            <div className="j-sheet-grab" />
            <h2 className="j-h2" style={{ marginBottom: 4 }}>Security question</h2>
            <p className="j-sm" style={{ marginBottom: 14 }}>The answer is checked on this phone only. Pick something only you would answer the same way every time.</p>
            <FieldLabel>Question</FieldLabel>
            <input className="j-input" value={qDraft} onChange={e => setQDraft(e.target.value)} placeholder="For example: my first teacher's surname" style={{ marginBottom: 14 }} />
            <FieldLabel>Answer</FieldLabel>
            <input className="j-input" value={aDraft} onChange={e => setADraft(e.target.value)} style={{ marginBottom: 18 }} />
            <button className="j-btn j-btn-primary" disabled={!qDraft.trim() || !aDraft.trim()}
              style={(!qDraft.trim() || !aDraft.trim()) ? { opacity: 0.5, cursor: 'default' } : {}}
              onClick={() => { if (qDraft.trim() && aDraft.trim()) { set({ question: true }); setQSheet(false); } }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- BACKUP AND RESTORE ----------------
function BackupScreen({ nav, profile, entries = [], docs = [] }) {
  const J = window.JOTLA;
  const [meta, setMeta] = useStateB(() => {
    try { return JSON.parse(localStorage.getItem(BACKUP_META_KEY)) || null; } catch (e) { return null; }
  });
  const [expSheet, setExpSheet] = useStateB(false);
  const [period, setPeriod] = useStateB('all'); // all | 7 | 30 | custom
  const [fromD, setFromD] = useStateB('');
  const [toD, setToD] = useStateB('');
  const daysAgoISO = (n) => {
    const d = new Date(J.TODAY_ISO + 'T12:00:00'); d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const doExport = () => {
    let from = null, to = null;
    if (period === '7') from = daysAgoISO(6);
    else if (period === '30') from = daysAgoISO(29);
    else if (period === 'custom') { from = fromD || null; to = toD || null; }
    try {
      const inR = (d) => d && (!from || d >= from) && (!to || d <= to);
      const es = period === 'all' ? entries : entries.filter(e => inR(e.date));
      const ds = period === 'all' ? docs : docs.filter(d => inR(d.received));
      const payload = { app: 'Jotla', exportedAt: new Date().toISOString(), child: profile, entries: es, documents: ds };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'jotla-' + ((profile && profile.name) || 'record').replace(/\s+/g, '-').toLowerCase() + '-export.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      const stamp = { lastExportAt: new Date().toISOString() };
      try { localStorage.setItem(BACKUP_META_KEY, JSON.stringify(stamp)); } catch (e) {}
      setMeta(stamp); setExpSheet(false);
    } catch (e) { alert('Sorry, the export could not be created on this device.'); }
  };
  const onImportFile = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { nav.importBackup(JSON.parse(r.result)); } catch (err) { alert('That file could not be read as a Jotla backup.'); } };
    r.readAsText(f);
  };
  const lastExport = meta && meta.lastExportAt
    ? 'Last export ' + J.fmtShort(meta.lastExportAt.slice(0, 10)) + ' ' + meta.lastExportAt.slice(0, 4)
    : 'Not exported yet';
  // The crown gate marks what Plus WOULD unlock, so it exists only in the free
  // app: an owner's rows carry no crowns (founder, 8 Aug night). The wrapper
  // carries a data hook so the suite can count crowns per tier.
  const crown = nav.plus ? null
    : <span data-crown-gate style={{ display: 'flex', flexShrink: 0 }}><Icon name="crown" size={20} color="var(--gold)" /></span>;
  return (
    <div className="j-screen">
      <PushHeader title="Backup and Restore" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          <SectionLabel>On this phone</SectionLabel>
          <MRow icon="download" title="Export my data" sub={lastExport} onClick={() => setExpSheet(true)} />
          <label className="j-card j-press" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: '14px 16px',
            display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10 }}>
            <Icon name="upload" size={22} color="var(--blue)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)' }}>Restore from an export</span>
            </span>
            <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onImportFile} />
          </label>

          {/* the parent's own cloud, all Plus: the crown gate opens the paywall */}
          <SectionLabel>Google Drive</SectionLabel>
          <MRow icon="cloudup" title="Back up to your Drive" sub="Not backed up yet" onClick={() => nav.go('unlock')} trailing={crown} />
          <MRow icon="clouddown" title="Restore from your Drive" onClick={() => nav.go('unlock')} trailing={crown} />

          <SectionLabel>Dropbox</SectionLabel>
          <MRow icon="cloudup" title="Back up to Dropbox" sub="Not backed up yet" onClick={() => nav.go('unlock')} trailing={crown} />
          <MRow icon="clouddown" title="Restore from Dropbox" onClick={() => nav.go('unlock')} trailing={crown} />

          <SectionLabel>Automatic</SectionLabel>
          <MRow icon="clock" title="Auto backup" sub="Backs up when the record changes" onClick={() => nav.go('unlock')} trailing={crown} />
          <MRow icon="bell" title="Backup reminder" sub="Every week" onClick={() => nav.go('unlock')} trailing={crown} />

          <FootNote>Backups live in your own Google Drive or Dropbox, in a space only the app can read. Jotla has no servers and never sees your record.</FootNote>
        </div>
      </div>

      {expSheet && (
        <RadioSheet title="Export my data" subtitle="Saves a file on this phone." activeKey={period} onClose={() => setExpSheet(false)}
          options={[
            { key: 'all', label: 'The whole record' },
            { key: '7', label: 'Last 7 days' },
            { key: '30', label: 'Last 30 days' },
            { key: 'custom', label: 'Choose dates' },
          ]}
          onPick={(k) => setPeriod(k)}
          footer={(
            <div>
              {period === 'custom' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <label style={{ flex: 1 }}>
                    <span className="j-meta" style={{ display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 'calc(10.5px * var(--tscale, 1))' }}>From</span>
                    <input type="date" className="j-input" value={fromD} onChange={e => setFromD(e.target.value)} />
                  </label>
                  <label style={{ flex: 1 }}>
                    <span className="j-meta" style={{ display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 'calc(10.5px * var(--tscale, 1))' }}>To</span>
                    <input type="date" className="j-input" value={toD} onChange={e => setToD(e.target.value)} />
                  </label>
                </div>
              )}
              <button className="j-btn j-btn-primary" style={{ marginTop: 14 }} onClick={doExport}>Export</button>
            </div>
          )} />
      )}
    </div>
  );
}

// ---------------- HELP ----------------
const HELP_QA = [
  ['The record', [
    ['Where does the record live?', 'On this phone. There is no account and no cloud copy unless you back up to your own Google Drive or Dropbox.'],
    ['How do backups work?', 'Automatic backups go to your own Drive or Dropbox, in a space only the app can read. A manual export file is always free.'],
    ['How do I move to a new phone?', 'Back up on the old phone, install Jotla on the new one, then restore from your Drive, Dropbox or the export file.'],
    ['I deleted something. Can I get it back?', 'Deleted logs and documents wait in the Recycle Bin for 30 days. After that they clear themselves.'],
  ]],
  ['Plus', [
    ['What does Plus cost?', '£49 for 6 months or £79 for a year, through Google Play.'],
    ['How do I cancel?', 'In Subscriptions on Google Play, any time. Plus stays on until the day it runs out.'],
    ['What happens if I stop paying?', 'You keep every entry, the timeline, search, the export and the PDF of what you already logged. A subscription only switches off the paid tools.'],
  ]],
  ['Privacy', [
    ['How do I lock the app?', 'Settings, then App lock. A pattern or PIN, with fingerprint or face if your phone can.'],
  ]],
];

function HelpScreen({ nav }) {
  const [open, setOpen] = useStateB({ 'The record:0': true });
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));
  return (
    <div className="j-screen">
      <PushHeader title="Help" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          {HELP_QA.map(([section, qas]) => (
            <React.Fragment key={section}>
              <SectionLabel>{section}</SectionLabel>
              {qas.map(([q, a], i) => {
                const k = section + ':' + i;
                return (
                  <button key={k} className="j-card j-press" onClick={() => toggle(k)} style={{ width: '100%', textAlign: 'left',
                    cursor: 'pointer', padding: '14px 16px', marginBottom: 10, display: 'block' }}>
                    <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)' }}>{q}</span>
                    {open[k] && <span style={{ display: 'block', fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--muted)', lineHeight: 1.5, marginTop: 8 }}>{a}</span>}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
          <SectionLabel>Still stuck</SectionLabel>
          <MRow icon="mail" title="Contact support" onClick={() => nav.go('support')} />
        </div>
      </div>
    </div>
  );
}

// ---------------- SUPPORT ----------------
function SupportScreen({ nav }) {
  return (
    <div className="j-screen">
      <PushHeader title="Support" onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: 40 }}>
          <MRow icon="mail" title="Email us" sub="hello@sen.help" onClick={() => window.location.assign('mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla'))} />
          <MRow icon="heart" title="Tell us what you think" onClick={() => window.location.assign(FEEDBACK_HREF)} />
          <FootNote icon="mail">Replies come from a real person at SEN Help.</FootNote>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FindScreen, EvidenceScreen, AddDocScreen, DocScreen, UnlockScreen, SettingsScreen, InfoAboutScreen,
  AppSettingsScreen, ChildrenScreen, ChildProfileScreen, AppLockScreen, BackupScreen, HelpScreen, SupportScreen, MRow, RadioSheet,
  AboutChildScreen, WhatHelpedScreen, ContactsScreen, DatesScreen, WinsScreen, helpedStrategies });
