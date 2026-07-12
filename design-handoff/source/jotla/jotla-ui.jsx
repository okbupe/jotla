// jotla-ui.jsx — shared layout atoms used across screens.
const { useState, useRef, useEffect } = React;

// The single source of the visible build number. Bump this every release
// (and keep sw.js VERSION in step) so the Settings footer can never lie.
window.JOTLA_BUILD = '1.9.0';

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
  const [shown, setShown] = useState(() => monthIndexOf(anchor));
  const year = Math.floor(shown / 12), month = shown % 12;

  // Paging past the bounds would show a fully-disabled month, so the chevrons
  // clamp at the bound months.
  const minIdx = minDate ? monthIndexOf(minDate) : null;
  const maxIdx = maxDate ? monthIndexOf(maxDate) : null;
  const canPrev = minIdx === null || shown > minIdx;
  const canNext = maxIdx === null || shown < maxIdx;

  const cells = calCellsFor(year, month);
  const pick = (iso) => { onSelect(iso); onClose(); };

  const chevron = (dir) => {
    const enabled = dir === 'prev' ? canPrev : canNext;
    return (
      <button onClick={() => enabled && setShown(s => s + (dir === 'prev' ? -1 : 1))} disabled={!enabled}
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
        {/* day grid: today ringed, the chosen day filled blue, out-of-rule days
            greyed and untappable, neighbour-month days dimmed */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells.map(c => {
            const disabled = (minDate !== undefined && c.iso < minDate) || (maxDate !== undefined && c.iso > maxDate);
            const selected = value !== null && value !== undefined && c.iso === value;
            const isToday = c.iso === today;
            const ink = selected ? '#fff' : disabled ? 'var(--line)' : isToday ? 'var(--blue)' : c.inMonth ? 'var(--ink)' : 'var(--faint)';
            const [cy, cm] = c.iso.split('-').map(Number);
            return (
              <button key={c.iso} onClick={() => !disabled && pick(c.iso)} disabled={disabled}
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

// A calm, honest locked card for Plus features in the free app: the feature is
// visible and named, never hidden, and one tap shows what Plus is.
function PlusLockedCard({ title, text, onClick, style }) {
  return (
    <button className="j-card j-press" onClick={onClick} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: 14,
      display: 'flex', gap: 12, alignItems: 'center', border: '1px dashed var(--chip-border)', background: 'var(--card-2)', ...(style || {}) }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--tag-grey-bg)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={18} color="var(--muted)" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)' }}>{title}
          <span className="j-pillbadge" style={{ marginLeft: 8, background: 'var(--tint-blue)', color: 'var(--blue)' }}>Plus</span>
        </span>
        <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 2 }}>{text}</span>
      </span>
      <Icon name="chevronRight" size={16} color="var(--faint)" />
    </button>
  );
}

// Top bar for pushed (non-tab) screens
function PushHeader({ title, subtitle, onBack, onClose, accent = '#1A56A8', bg = 'transparent' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 10px',
      background: bg, position: 'sticky', top: 0, zIndex: 5,
    }}>
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="j-press" style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--blue)',
          boxShadow: '0 10px 22px -8px rgba(26,86,168,0.7)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="chevronLeft" size={22} color="#fff" /></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(19px * var(--tscale, 1))', color: 'var(--ink)', lineHeight: 1.1 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Close" className="j-press" style={{
          width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--blue)',
          boxShadow: '0 10px 22px -8px rgba(26,86,168,0.7)', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name="close" size={20} color="#fff" /></button>
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
// Kind colours (12 Jul 2026): a dysregulation log and a gate note must each
// read as their own kind at a glance. A dysregulation log is a quick log in
// the Incidents category (the record's only dysregulation marker); a gate
// note is type 'handover' (the guided Dysregulation Mode capture, always
// blue-family). Each kinded card carries a left accent stripe and a solid
// kind pill in its colour: plum for dysregulation, blue for the gate. The two
// kinds are mutually exclusive, exactly as they are on the This month bars,
// and standard day logs keep their mood colours untouched.
function EntryCard({ entry, onClick, showDate = false }) {
  const J = window.JOTLA;
  const isHandover = entry.type === 'handover';
  const isDysreg = !isHandover && entry.category === 'Incidents';
  const kindColor = isHandover ? 'var(--blue)' : isDysreg ? 'var(--dysreg)' : null;
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
              {/* On a dysregulation log the kind pill IS the category, renamed
                  to the word SEND parents actually hear; gate notes keep their
                  category tag under the gate pill. */}
              {!isDysreg && <span className="j-tag j-tag-blue">{entry.category}</span>}
              {isDysreg && <KindPill label="Dysregulation" color="var(--dysreg)" />}
              {isHandover && <KindPill label="Gate note" color="var(--blue)" icon={<Icon name="note" size={13} color="var(--bg)" />} />}
            </div>
          </div>
          <p className="j-body" style={{ fontSize: 'calc(16.5px * var(--tscale, 1))', marginTop: 10, lineHeight: 1.4 }}>{entry.summary}</p>
          {(entry.photo || entry.photoData) && <PhotoAttachment caption={entry.photo} src={entry.photoData} />}
        </div>
      </div>
    </div>
  );
}

// labelled section heading inside scroll areas
function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 10px' }}>
      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(13px * var(--tscale, 1))', letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--faint)' }}>{children}</span>
      {right}
    </div>
  );
}

// The five count blocks shared by the Today strip and the Month graph
// (12 Jul 2026): Good / Mixed / Hard days, then Gate and Dysregulation
// moments in their own colours. Dysregulation sits LAST with its label
// tucked to the right edge (the long word hugs the card edge instead of
// isolating the middle columns; its column is wider so the full label keeps
// its line, while the bars share one slim width so the counts compare
// honestly). The Gate label stays "Gate": "Gate notes" cannot hold one line
// in a flex-1 column at the larger text dials.
//
// Counting rule (stated once, applied to both graphs): the three mood bars
// count DAYS, dayMood folding every entry's mood in, so a gate note's hard
// mood still colours its day. The two new bars count MOMENTS: Gate = guided
// gate notes (type 'handover'), Dysregulation = quick logs in the Incidents
// category. A gate note is itself a dysregulation capture, so the pair is
// kept mutually exclusive by type: each entry lands in exactly one of the
// two moment bars, and no moment is ever counted twice across them.
function kindBarBlocks({ good, ok, hard, gate, dys }) {
  return [
    { key: 'good', label: 'Good', n: good, color: window.MOOD_COLOURS.good, flex: 1 },
    { key: 'ok', label: 'Mixed', n: ok, color: window.MOOD_COLOURS.ok, flex: 1 },
    { key: 'hard', label: 'Hard', n: hard, color: window.MOOD_COLOURS.hard, flex: 1 },
    { key: 'gate', label: 'Gate', n: gate, color: 'var(--blue)', flex: 1 },
    { key: 'dysreg', label: 'Dysregulation', n: dys, color: 'var(--dysreg)', flex: 2.2, labelEnd: true },
  ];
}
function KindBars({ blocks, maxN }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', minHeight: 92 }}>
      {blocks.map(b => {
        const h = 22 + (b.n / maxN) * 54; // taller bar for a higher count
        return (
          <div key={b.key} style={{ flex: b.flex, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16px * var(--tscale, 1))', color: b.color, lineHeight: 1 }}>{b.n}</span>
            <div style={{ width: 26, height: h, borderRadius: 13, background: b.color }} />
            <span style={{ fontSize: 'calc(12.5px * var(--tscale, 1))', fontWeight: 500, color: 'var(--muted)',
              whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
              ...(b.labelEnd ? { alignSelf: 'flex-end', textAlign: 'right' } : {}) }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Month summary: the five count blocks + a plain trend line.
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
  const dys = monthEntries.filter(e => e.type !== 'handover' && e.category === 'Incidents').length;
  const gate = monthEntries.filter(e => e.type === 'handover').length;
  const blocks = kindBarBlocks({ good, ok, hard, gate, dys });
  const maxN = Math.max(good, ok, hard, gate, dys, 1);
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
          : dys > 0
            // Dysregulation moments can carry a good or mixed mood, so "no hard
            // moments" alone would sit dishonestly next to a plum bar with a count.
            ? `${dys} dysregulation ${dys === 1 ? 'moment' : 'moments'} logged this month, none marked as a hard moment.`
            : 'No hard moments logged so far. Long may it last.'}
      </p>
    </div>
  );
}

Object.assign(window, { PushHeader, EntryCard, KindPill, SectionLabel, MiniMonthStrip, kindBarBlocks, KindBars, moodTint, PhotoAttachment, DateRangeControl, rangeBounds, inDateRange, PlusLockedCard, pagerKeyProps, CalendarSheet, DateField });
