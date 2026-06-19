// jotla-ui.jsx — shared layout atoms used across screens.
const { useState, useRef, useEffect } = React;

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
        {title && <div style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 19, color: 'var(--ink)', lineHeight: 1.1 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13, color: 'var(--faint)', marginTop: 1 }}>{subtitle}</div>}
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
const RANGE_TODAY = '2026-06-12';
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
    case 'This month': return { from: '2026-06-01', to: RANGE_TODAY };
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

// presets is an array; value = { preset, from, to }; onChange(next)
function DateRangeControl({ presets, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const dateInput = (which) => (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 12.5, color: 'var(--faint)', fontWeight: 500, marginBottom: 6 }}>{which === 'from' ? 'From' : 'To'}</label>
      <input type="date" className="j-input" min="2026-01-01" max="2026-12-31"
        value={value[which] || ''} onChange={e => set({ [which]: e.target.value })}
        style={{ fontSize: 15, colorScheme: 'light dark', padding: '11px 12px' }} />
    </div>
  );
  return (
    <div>
      <div className="j-chiprow">
        {presets.map(p => (
          <button key={p} className={'j-chip' + (value.preset === p ? ' j-chip-on' : '')} onClick={() => set({ preset: p })}>{p}</button>
        ))}
      </div>
      {value.preset === 'Custom' && (
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {dateInput('from')}
          {dateInput('to')}
        </div>
      )}
    </div>
  );
}

// A sample attached-photo tile shown inside an entry
function PhotoAttachment({ caption = 'Photo attached (sample)' }) {
  return (
    <div style={{ marginTop: 12, borderRadius: 14, background: 'var(--photo-bg)', minHeight: 96,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 }}>
      <Icon name="camera" size={20} color="var(--faint)" />
      <span style={{ fontSize: 15, color: 'var(--faint)', fontWeight: 500 }}>{caption}</span>
    </div>
  );
}

// Entry card: clock time left, mood dot, setting chip, category chip, summary, optional photo.
function EntryCard({ entry, onClick, showDate = false }) {
  const J = window.JOTLA;
  const isHandover = entry.type === 'handover';
  const timeLabel = entry.clock || entry.time;
  return (
    <div className="j-card j-press" onClick={onClick} style={{ padding: 16, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 46, flexShrink: 0, paddingTop: 1 }}>
          <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 16, color: 'var(--ink)', letterSpacing: '0.01em' }}>{timeLabel}</span>
          {showDate && <span className="j-meta" style={{ marginTop: 1 }}>{J.fmtShort(entry.date)}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MoodDot mood={entry.mood} size={13} />
            <div className="j-chiprow" style={{ gap: 8, flex: 1 }}>
              <span className="j-tag j-tag-grey">{entry.setting}</span>
              <span className="j-tag j-tag-blue">{entry.category}</span>
              {isHandover && <span className="j-tag j-tag-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="note" size={13} color="var(--blue)" /> Gate note</span>}
            </div>
          </div>
          <p className="j-body" style={{ fontSize: 16.5, marginTop: 10, lineHeight: 1.4 }}>{entry.summary}</p>
          {entry.photo && <PhotoAttachment caption={entry.photo} />}
        </div>
      </div>
    </div>
  );
}

// labelled section heading inside scroll areas
function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 10px' }}>
      <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 13, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--faint)' }}>{children}</span>
      {right}
    </div>
  );
}

// Month summary: three count blocks (Good / Mixed / Hard) + a plain trend line.
function MiniMonthStrip({ entries, onOpen }) {
  const J = window.JOTLA;
  let good = 0, ok = 0, hard = 0;
  for (let d = 1; d <= 12; d++) {
    const iso = `2026-06-${String(d).padStart(2, '0')}`;
    const m = J.dayMood(entries.filter(e => e.date === iso));
    if (m === 'good') good++; else if (m === 'ok') ok++; else if (m === 'hard') hard++;
  }
  const blocks = [
    { key: 'good', label: 'Good', n: good },
    { key: 'ok',   label: 'Mixed', n: ok },
    { key: 'hard', label: 'Hard', n: hard },
  ];
  const maxN = Math.max(good, ok, hard, 1);
  return (
    <div className="j-card j-press" onClick={onOpen} style={{ padding: 18, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="j-h3">This month</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--blue)', fontSize: 14, fontWeight: 500 }}>
          Open Month view <Icon name="chevronRight" size={16} color="var(--blue)" />
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', minHeight: 92 }}>
        {blocks.map(b => {
          const c = window.MOOD_COLOURS[b.key];
          const h = 22 + (b.n / maxN) * 54; // taller bar for a higher count
          return (
            <div key={b.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 16, color: c, lineHeight: 1 }}>{b.n}</span>
              <div style={{ width: '100%', height: h, borderRadius: 14, background: c }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>{b.label}</span>
            </div>
          );
        })}
      </div>
      <p className="j-body" style={{ fontSize: 14.5, color: 'var(--muted)', marginTop: 16 }}>
        <span className="j-strong">Lunchtime transitions</span> are showing up as the hard moments. Tap Find to see them gathered.
      </p>
    </div>
  );
}

Object.assign(window, { PushHeader, EntryCard, SectionLabel, MiniMonthStrip, moodTint, PhotoAttachment, DateRangeControl, rangeBounds, inDateRange });
