// jotla-ui.jsx: shared layout atoms used across screens.
const { useState, useRef, useEffect, useLayoutEffect } = React;

// The single source of the visible build number. Bump this every release
// (and keep sw.js VERSION in step) so the Settings footer can never lie.
window.JOTLA_BUILD = '2.0.4';

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
    onKeyDown: (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const el = ref.current; if (!el || !el.clientWidth) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      el.scrollTo({ left: el.scrollLeft + dir * el.clientWidth, behavior: 'smooth' });
    },
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

function StoryDeck({ label, sub, note, slides, labelFor, onSkip, renderSlide }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const onScroll = () => {
    const el = ref.current; if (!el || !el.clientWidth) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i) setI(k);
  };
  const goTo = (k) => {
    const el = ref.current; if (el) el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' });
  };
  return (
    <div className="j-screen" style={{ background: 'var(--bg)' }}>
      <div className="j-deck-head">
        <div style={{ minWidth: 0 }}>
          <p className="j-eyebrow">{label} · {i + 1} of {slides.length}</p>
          <p className="j-meta j-deck-sub">{sub || ''}</p>
        </div>
        <button onClick={onSkip} className="j-press" style={{ border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--faint)', fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500, padding: 4, flexShrink: 0 }}>Skip</button>
      </div>
      <div ref={ref} onScroll={onScroll} className="j-pager" {...pagerKeyProps(ref, label)}
        style={{ flex: 1, minHeight: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch', outline: 'none' }}>
        {slides.map((s, k) => (
          /* overflowY auto is the valve, not the plan: the illustration gives way
             first (see .j-illo-slot), so this only ever fires on the smallest phone
             at the largest text, where the words alone fill the screen. It beats
             clipping the say pill off the bottom. */
          <div key={k} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'start',
            overflowX: 'hidden', overflowY: 'auto' }}>
            <div className="j-deck-card" style={{ '--illo-copy': DECK_COPY_RESERVE }}>
              {renderSlide(s, k)}
            </div>
          </div>
        ))}
      </div>
      <div className="j-deck-foot">
        <div className="j-deck-dots">
          {slides.map((s, k) => (
            <button key={k} aria-label={labelFor(s, k)} aria-current={i === k} onClick={() => goTo(k)}
              style={{ width: i === k ? 18 : 7, height: 7, borderRadius: 99, transition: 'all .2s ease',
              border: 'none', padding: 0, cursor: 'pointer', background: i === k ? 'var(--blue)' : 'var(--chip-border)' }} />
          ))}
        </div>
        <p className="j-meta j-deck-note">{note || ''}</p>
      </div>
    </div>
  );
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
function monthIndexOf(iso) { const [y, m] = iso.split('-').map(Number); return y * 12 + (m - 1); }
function calCellsFor(year, month) {
  const J = window.JOTLA;
  const pad2 = n => String(n).padStart(2, '0');
  const isoOf = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first offset
  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const dt = new Date(year, month, -i); // day 0 is the previous month's last day
    cells.push({ d: dt.getDate(), iso: isoOf(dt), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, iso: `${year}-${pad2(month + 1)}-${pad2(d)}`, inMonth: true });
  let next = 1;
  while (cells.length < 42) { cells.push({ d: next, iso: isoOf(new Date(year, month + 1, next)), inMonth: false }); next++; }
  return cells;
}
function CalendarSheet({ onClose, value, onSelect, minDate, maxDate, onClear, clearLabel = 'Clear the date' }) {
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
  const year = Math.floor(shown / 12), month = shown % 12;
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
  const adopt = (target) => {
    targetRef.current = target;
    setShown(s => (target === s ? s : target));
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
  const move = (delta) => {
    const el = pagerRef.current;
    const next = Math.max(startIdx, Math.min(endIdx, targetRef.current + delta));
    if (next === targetRef.current || !el || !el.clientWidth) return;
    targetRef.current = next;
    el.scrollTo({ left: (next - startIdx) * el.clientWidth, behavior: 'smooth' });
  };

  const pick = (iso) => { onSelect(iso); onClose(); };

  const chevron = (dir) => {
    const enabled = dir === 'prev' ? canPrev : canNext;
    return (
      <button onClick={() => enabled && move(dir === 'prev' ? -1 : 1)} disabled={!enabled}
        aria-label={dir === 'prev' ? 'Previous month' : 'Next month'} className="j-press"
        style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'var(--chip-bg)',
          boxShadow: 'var(--card-shadow)', cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={dir === 'prev' ? 'chevronLeft' : 'chevronRight'} size={20} color={enabled ? 'var(--blue)' : 'var(--faint)'} />
      </button>
    );
  };

  return (
    <div className="j-sheet-scrim" onClick={onClose} style={{ zIndex: 45 }}>
      <div className="j-sheet" onClick={e => e.stopPropagation()}>
        <div className="j-sheet-grab" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          {chevron('prev')}
          <h2 className="j-h2" style={{ flex: 1, textAlign: 'center' }}>{J.MONTH_NAMES[month]} {year}</h2>
          {chevron('next')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
          {J.DOW_MON.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 500, color: 'var(--faint)' }}>{d}</div>
          ))}
        </div>
        {/* day grid pager: today ringed, the chosen day filled blue, out-of-rule
            days greyed and untappable, neighbour-month days dimmed; always
            exactly six week rows, so the sheet never resizes while paging */}
        <div ref={pagerRef} onScroll={onPagerScroll} className="j-pager" {...pagerKeyProps(pagerRef, 'Calendar months')}
          style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', outline: 'none' }}>
          {monthIdxs.map(idx => {
            if (Math.abs(idx - shown) > 2) {
              return <div key={idx} aria-hidden="true" style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start' }} />;
            }
            const py = Math.floor(idx / 12), pm = idx % 12;
            // Only the settled month is exposed to assistive tech and the tab
            // order; the materialised neighbours are visual-only until adopted.
            const hot = idx === shown;
            return (
              <div key={idx} aria-hidden={hot ? undefined : 'true'} style={{ flex: '0 0 100%', width: '100%', scrollSnapAlign: 'start',
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, alignContent: 'start' }}>
                {calCellsFor(py, pm).map(c => {
                  const disabled = (minDate !== undefined && c.iso < minDate) || (maxDate !== undefined && c.iso > maxDate);
                  const selected = value !== null && value !== undefined && c.iso === value;
                  const isToday = c.iso === today;
                  const ink = selected ? '#fff' : disabled ? 'var(--line)' : isToday ? 'var(--blue)' : c.inMonth ? 'var(--ink)' : 'var(--faint)';
                  const [cy, cm] = c.iso.split('-').map(Number);
                  return (
                    <button key={c.iso} onClick={() => !disabled && pick(c.iso)} disabled={disabled}
                      tabIndex={hot ? undefined : -1}
                      aria-label={`${c.d} ${J.MONTH_NAMES[cm - 1]} ${cy}`} aria-pressed={selected}
                      className={disabled ? '' : 'j-press'}
                      style={{ aspectRatio: '1 / 1', borderRadius: 12, border: 'none', cursor: disabled ? 'default' : 'pointer',
                        background: selected ? 'var(--blue)' : 'transparent',
                        boxShadow: isToday && !selected ? 'inset 0 0 0 2px var(--blue)' : 'none',
                        opacity: disabled ? 0.55 : c.inMonth ? 1 : 0.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: selected || isToday ? 600 : 500,
                        fontSize: 'calc(15px * var(--tscale, 1))', color: ink }}>{c.d}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {onClear && (
          <button onClick={() => { onClear(); onClose(); }} className="j-press"
            style={{ display: 'block', margin: '16px auto 0', minHeight: 44, border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 'calc(16px * var(--tscale, 1))', fontWeight: 500, color: 'var(--blue)' }}>
            {clearLabel}
          </button>
        )}
        <button className="j-btn j-btn-ghost" onClick={onClose} style={{ marginTop: onClear ? 10 : 16 }}>Cancel</button>
      </div>
    </div>
  );
}

// A read-only field wearing the j-input look exactly, that opens a
// CalendarSheet instead of a keyboard. The keyboard never opens for a date
// again. The consumer passes the date already formatted the way the app shows
// dates elsewhere, so the field never invents a format.
function DateField({ value, placeholder, label, onClick, compact = false, style }) {
  return (
    <button onClick={onClick} className="j-press" aria-label={`${label}, ${value || placeholder || 'no day chosen'}, opens a calendar`}
      style={{ width: '100%', borderRadius: 14, border: '1.5px solid var(--chip-border)', background: 'var(--card-2)',
        padding: compact ? '11px 12px' : '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        textAlign: 'left', ...(style || {}) }}>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: "'Outfit', system-ui", fontSize: `calc(${compact ? 15 : 16}px * var(--tscale, 1))`,
        color: value ? 'var(--ink)' : 'var(--faint)' }}>{value || placeholder || ''}</span>
      <Icon name="calendar" size={18} color="var(--faint)" />
    </button>
  );
}

// THE CROWN GATE (founder, 6 Aug, app-wide): in the FREE app a Plus-tier row
// shows the solid gold crown in place of its control, with no "Plus" pill and
// no lecture: the crown is the whole sentence. Tapping a crowned row ALWAYS
// opens the Jotla Plus page. In the paid app the row renders its real control
// instead (callers branch on nav.plus). Replaces the old dashed locked card.
function PlusLockedCard({ title, text, onClick, style, icon = 'lock' }) {
  return (
    <button className="j-card j-press" onClick={onClick} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: '14px 16px',
      display: 'flex', gap: 14, alignItems: 'center', ...(style || {}) }}>
      <Icon name={icon} size={22} color="var(--blue)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)' }}>{title}</span>
        {text && <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 2 }}>{text}</span>}
      </span>
      <Icon name="crown" size={20} color="var(--gold)" style={{ flexShrink: 0 }} />
    </button>
  );
}

// A document's display label honours the parent's own name for an Other type
// (founder, 9 Aug): canonical d.type stays underneath for colours and filters.
const docTypeLabel = (d) => ((d && d.typeOther) ? d.typeOther : (d ? d.type : ''));

// Top bar for pushed (non-tab) screens
function PushHeader({ title, subtitle, onBack, onClose, accent = '#1A56A8', bg = 'transparent' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 10px',
      background: bg, position: 'sticky', top: 0, zIndex: 5,
    }}>
      {/* bare chevron, no background, no shadow (founder, 7 Aug); title inline
          beside it at the pushed-page scale, Cal Sans Regular */}
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="j-press" style={{
          width: 44, height: 44, marginLeft: -10, border: 'none', background: 'none',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="chevronLeft" size={23} color="var(--muted)" /></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* pushed titles match the tab titles' 28px (founder, 7 Aug: "the
            Settings text should be the same size as all other text up there");
            the tiers page keeps its own small header by design */}
        {title && <div style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 400, fontSize: 'calc(28px * var(--tscale, 1))', color: 'var(--ink)', lineHeight: 1.1 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="j-press" style={{
          width: 44, height: 44, marginRight: -10, border: 'none', background: 'none',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="close" size={22} color="var(--muted)" /></button>
      )}
    </div>
  );
}

function moodTint(mood) {
  return mood === 'good' ? 'var(--tint-green)' : mood === 'hard' ? 'var(--tint-red)' : 'var(--tint-amber)';
}

// ---- date range ----
// "Today" for range maths is always the real device date (was a stale hardcode).
const RANGE_TODAY = window.JOTLA.TODAY_ISO;
function isoMinusDays(iso, n) {
  const d = window.JOTLA.parseISO(iso); d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// returns {from, to} ISO strings or nulls (null = unbounded). preset 'Custom' uses the passed from/to.
function rangeBounds(preset, from, to) {
  switch (preset) {
    case 'This week': return { from: isoMinusDays(RANGE_TODAY, 4), to: RANGE_TODAY };   // Mon 8 -> Fri 12
    case 'Last 2 weeks': return { from: isoMinusDays(RANGE_TODAY, 13), to: RANGE_TODAY };
    case 'Last 3 weeks': return { from: isoMinusDays(RANGE_TODAY, 20), to: RANGE_TODAY };
    case 'This month': return { from: RANGE_TODAY.slice(0, 8) + '01', to: RANGE_TODAY };
    case 'Custom': return { from: from || null, to: to || null };
    default: return { from: null, to: null }; // Any time / This term / All time
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
function DateRangeControl({ presets, value, onChange }) {
  const J = window.JOTLA;
  const set = (patch) => onChange({ ...value, ...patch });
  const [openFor, setOpenFor] = useState(null); // 'from' | 'to' | null
  const dateInput = (which) => {
    const raw = (value[which] || '').trim();
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--faint)', fontWeight: 500, marginBottom: 6 }}>{which === 'from' ? 'From' : 'To'}</label>
        <DateField compact value={ok ? `${J.fmtShort(raw)} ${raw.slice(0, 4)}` : null}
          placeholder={which === 'from' ? 'Start' : 'Today'}
          label={which === 'from' ? 'From date' : 'To date'}
          onClick={() => setOpenFor(which)} />
      </div>
    );
  };
  const openRaw = openFor ? (value[openFor] || '').trim() : '';
  return (
    <div>
      <div className="j-chiprow">
        {presets.map(p => (
          <button key={p} aria-pressed={value.preset === p} className={'j-chip' + (value.preset === p ? ' j-chip-on' : '')} onClick={() => set({ preset: p })}>{p}</button>
        ))}
      </div>
      {value.preset === 'Custom' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {dateInput('from')}
          {dateInput('to')}
        </div>
      )}
      {openFor && (
        <CalendarSheet onClose={() => setOpenFor(null)}
          value={/^\d{4}-\d{2}-\d{2}$/.test(openRaw) ? openRaw : null}
          onSelect={(iso) => set({ [openFor]: iso })}
          onClear={() => set({ [openFor]: '' })} />
      )}
    </div>
  );
}

// Attached-photo tile inside an entry. With a real image (src) it renders it;
// otherwise it falls back to the caption tile.
function PhotoAttachment({ caption = 'Photo attached', src }) {
  if (src) {
    return (
      <div style={{ marginTop: 12, borderRadius: 14, overflow: 'hidden', background: 'var(--photo-bg)' }}>
        <img src={src} alt={caption || 'Attached photo'} style={{ display: 'block', width: '100%', maxHeight: 280, objectFit: 'cover' }} />
        {caption && <div style={{ padding: '8px 12px', fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--faint)' }}>{caption}</div>}
      </div>
    );
  }
  return (
    <div style={{ marginTop: 12, borderRadius: 14, background: 'var(--photo-bg)', minHeight: 96,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 }}>
      <Icon name="camera" size={20} color="var(--faint)" />
      <span style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--faint)', fontWeight: 500 }}>{caption}</span>
    </div>
  );
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

// The solid kind pill: the tag shape with the kind colour as its ground, so
// the kind reads at a glance where the pale metadata tags stay quiet. Text
// and icon use the page colour, crisp on the kind colour in both palettes.
function KindPill({ label, color, icon }) {
  return (
    <span style={{ background: color, padding: '5px 11px', borderRadius: 999, display: 'inline-flex',
      alignItems: 'center', gap: 5, whiteSpace: 'nowrap', lineHeight: 1,
      fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--bg)' }}>
      {icon}{label}
    </span>
  );
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
function EntryCard({ entry, onClick, showDate = false }) {
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
  return (
    <div className="j-card j-press" onClick={onClick} style={{ padding: 16, cursor: onClick ? 'pointer' : 'default',
      position: 'relative', overflow: kindColor ? 'hidden' : 'visible' }}>
      {/* The kind's left accent stripe, clipped by the card's own corners. */}
      {kindColor && <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: kindColor }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 46, flexShrink: 0, paddingTop: 1 }}>
          <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', letterSpacing: '0.01em' }}>{timeLabel}</span>
          {showDate && <span className="j-meta" style={{ marginTop: 1 }}>{J.fmtShort(entry.date)}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MoodDot mood={entry.mood} size={13} />
            <div className="j-chiprow" style={{ gap: 8, flex: 1 }}>
              <span className="j-tag j-tag-grey">{entry.setting}</span>
              {/* On a dysregulation capture the kind pill IS the category (it is
                  always Incidents), so the category tag would only repeat it. */}
              {!isDysregKind && <span className="j-tag j-tag-blue">{entry.category}</span>}
              {isDysregKind && <KindPill label="Dysregulation" color="var(--dysreg)" icon={<Icon name="note" size={13} color="var(--bg)" />} />}
            </div>
          </div>
          <p className="j-body" style={{ fontSize: 'calc(16.5px * var(--tscale, 1))', marginTop: 10, lineHeight: 1.4 }}>{entry.summary}</p>
          {(entry.photo || entry.photoData) && <PhotoAttachment caption={entry.photo} src={entry.photoData} />}
        </div>
      </div>
    </div>
  );
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
    if (!e.logId) { out.push([e]); return; }
    if (at[e.logId] === undefined) { at[e.logId] = out.length; out.push([e]); }
    else out[at[e.logId]].push(e);
  });
  return out;
}

// A log, organised by the part of day it happened in.
function LogCard({ group, onOpen, showDate = false }) {
  const J = window.JOTLA;
  const byTime = J.TIMES.map(t => [t, group.filter(e => e.time === t)]).filter(([, l]) => l.length > 0);
  return (
    <div className="j-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)' }}>
          {group.length} moments
        </span>
        <span className="j-meta">{showDate ? J.fmtShort(group[0].date) + ' · ' : ''}logged {group[0].clock}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {byTime.map(([t, list]) => (
          <div key={t}>
            <p className="j-meta" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>{t}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {list.map(e => {
                const isH = e.type === 'handover';
                const isDysKind = isH || (!isH && e.category === 'Incidents');
                return (
                  <button key={e.id} onClick={() => onOpen(e)} className="j-press" style={{ display: 'flex', gap: 10,
                    alignItems: 'flex-start', textAlign: 'left', width: '100%', border: 'none', cursor: 'pointer',
                    background: 'var(--card-2)', borderRadius: 12, padding: '10px 12px' }}>
                    <span style={{ paddingTop: 3, flexShrink: 0 }}><MoodDot mood={e.mood} size={11} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="j-chiprow" style={{ gap: 6, marginBottom: 4 }}>
                        <span className="j-tag j-tag-grey">{e.setting}</span>
                        {!isDysKind && <span className="j-tag j-tag-blue">{e.category}</span>}
                        {isDysKind && <KindPill label="Dysregulation" color="var(--dysreg)" icon={<Icon name="note" size={13} color="var(--bg)" />} />}
                      </span>
                      <span style={{ display: 'block', fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--body)', lineHeight: 1.4 }}>{e.summary}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// A day's entries, read as logs: a multi-moment Save becomes one LogCard, a
// lone note stays the plain card it always was.
function LogList({ list, nav, showDate = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groupByLog(list).map((group, i) => (group.length > 1
        ? <LogCard key={group[0].logId || i} group={group} showDate={showDate} onOpen={e => nav.go('entry', { id: e.id })} />
        : <EntryCard key={group[0].id} entry={group[0]} showDate={showDate} onClick={() => nav.go('entry', { id: group[0].id })} />
      ))}
    </div>
  );
}

// labelled section heading inside scroll areas
function SectionLabel({ children, right }) {
  /* Neutral shell (6 Aug): section headers are small, semibold and accent-coloured,
     no longer uppercase-faint. One component restyles every screen's sections. */
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 8px' }}>
      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(13px * var(--tscale, 1))', letterSpacing: '0.02em',
        color: 'var(--blue)' }}>{children}</span>
      {right}
    </div>
  );
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
function kindBarBlocks({ good, ok, hard, dysreg }) {
  return [
    { key: 'good', label: 'Good', n: good, color: window.MOOD_COLOURS.good, ink: 'var(--green-ink)' },
    { key: 'ok', label: 'Mixed', n: ok, color: window.MOOD_COLOURS.ok, ink: 'var(--amber-ink)' },
    { key: 'hard', label: 'Hard', n: hard, color: window.MOOD_COLOURS.hard, ink: 'var(--red-ink)' },
    { key: 'dysreg', label: 'Dysregulation', n: dysreg, color: 'var(--dysreg)', ink: 'var(--dysreg-ink)' },
  ];
}
function KindBars({ blocks, maxN }) {
  return (
    // Equal columns (flex: 1), not content-width ones (founder, 16 Jul: "align
    // them justify"). Sizing each column to its own label made the Dysregulation
    // column 78px against ~30px for the others, so the bars sat at 54/134/212/312:
    // even gaps of ~79px, then a 100px jump. Equal columns space them evenly and
    // the old labelEnd right-align hack is no longer needed.
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', minHeight: 92 }}>
      {blocks.map(b => {
        const h = 22 + (b.n / maxN) * 54; // taller bar for a higher count
        return (
          <div key={b.key} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16px * var(--tscale, 1))', color: b.color, lineHeight: 1 }}>{b.n}</span>
            <div style={{ width: 36, height: h, borderRadius: 18, background: b.color }} />
            <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 500, color: b.ink,
              whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Month summary: the four count blocks + a plain trend line.
function MiniMonthStrip({ entries, onOpen }) {
  const J = window.JOTLA;
  let good = 0, ok = 0, hard = 0;
  const _my = J.TODAY_ISO.slice(0, 4), _mm = J.TODAY_ISO.slice(5, 7);
  const _dim = new Date(Number(_my), Number(_mm), 0).getDate();
  for (let d = 1; d <= _dim; d++) {
    const iso = `${_my}-${_mm}-${String(d).padStart(2, '0')}`;
    const m = J.dayMood(entries.filter(e => e.date === iso));
    if (m === 'good') good++; else if (m === 'ok') ok++; else if (m === 'hard') hard++;
  }
  const monthEntries = entries.filter(e => e.date.startsWith(`${_my}-${_mm}-`));
  const dysreg = monthEntries.filter(e => e.type === 'handover' || e.category === 'Incidents').length;
  const blocks = kindBarBlocks({ good, ok, hard, dysreg });
  const maxN = Math.max(good, ok, hard, dysreg, 1);
  const _hc = {};
  entries.forEach(e => { if (e.mood === 'hard') _hc[e.category] = (_hc[e.category] || 0) + 1; });
  const _top = Object.entries(_hc).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="j-card j-press" onClick={onOpen} style={{ padding: 18, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="j-h3">This month</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--blue)', fontSize: 'calc(14px * var(--tscale, 1))', fontWeight: 500 }}>
          Open Month view <Icon name="chevronRight" size={16} color="var(--blue)" />
        </span>
      </div>
      <KindBars blocks={blocks} maxN={maxN} />
      <p className="j-body" style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 16 }}>
        {_top
          ? (<><span className="j-strong">{_top[0]}</span> entries come up most often as the hard moments. Tap Find to see them gathered.</>)
          : dysreg > 0
            // Dysregulation moments can carry a good or mixed mood, so "no hard
            // moments" alone would sit dishonestly next to a plum bar with a count.
            ? `${dysreg} dysregulation ${dysreg === 1 ? 'moment' : 'moments'} logged this month, none marked as a hard moment.`
            : 'No hard moments logged so far. Long may it last.'}
      </p>
    </div>
  );
}

Object.assign(window, { PushHeader, EntryCard, LogCard, LogList, groupByLog, KindPill, SectionLabel, MiniMonthStrip, kindBarBlocks, KindBars, moodTint, PhotoAttachment, DateRangeControl, rangeBounds, inDateRange, PlusLockedCard, pagerKeyProps, StoryDeck, CalendarSheet, DateField });
