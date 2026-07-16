// jotla-parent-a.jsx: Today, Quick log, Handover (Dysregulation).
const { useState: useStateA, useRef: useRefA } = React;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// soft tappable tile used on Today. It wears the same border and drop shadow as
// the cards (var(--line) + var(--card-shadow)) so the two tiles lift off the page
// and read as siblings of the cards below them, not flat patches (founder's
// seventh pass, item 39, 13 Jul 2026).
function ActionTile({ icon, title, sub, tint, ink, onClick }) {
  return (
    <button onClick={onClick} className="j-press" style={{
      flex: 1, textAlign: 'left', border: '1px solid var(--line)', cursor: 'pointer', background: tint,
      borderRadius: 16, padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8,
      minHeight: 56, boxShadow: 'var(--card-shadow)',
    }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--card)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -8px rgba(20,40,80,0.4)' }}>
        {icon}
      </span>
      <span>
        <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(16px * var(--tscale, 1))', color: ink, lineHeight: 1.1 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  );
}

// ---------------- Today ----------------
function TodayScreen({ nav, entries, today, profile }) {
  const J = window.JOTLA;
  const todays = entries.filter(e => e.date === today);
  const childName = (profile && profile.name) || 'Sam';
  const isEmpty = entries.length === 0;
  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
          <p className="j-eyebrow" style={{ marginBottom: 6 }}>{J.fmtLong(today)}</p>
          <h1 className="j-h1" style={{ marginBottom: 4 }}>{greeting()}.</h1>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 20 }}>{isEmpty
            ? `${childName}'s record is brand new. Add the first line whenever you are ready.`
            : `Here is how ${childName}'s day is looking. Nothing to catch up on.`}</p>

          {/* two tiles first, then the graph below */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {/* Founder call, 12 Jul 2026 (sixth pass): the check-in reads as
                working together on Plus (the guided questions are a two-of-you
                thing), hand-the-phone on Free. His confirm is batched. */}
            <ActionTile
              icon={<Icon name="heart" size={20} color="var(--green)" />}
              title="Your day" sub={nav.plus ? 'Do it together with ' + childName : 'Hand the phone to ' + childName}
              tint="var(--tint-green)" ink="var(--green-ink)"
              onClick={() => nav.go('child')} />
            {/* Named "Dysregulation", not "At the gate?" (founder, 16 Jul 2026):
                the handful of parents shown the app could not tell what "At the
                gate?" was without guessing, and asked for the mode to say what
                it is. Dysregulation is the word school uses at them all day. */}
            <ActionTile
              icon={<Icon name="note" size={20} color="var(--blue)" />}
              title="Dysregulation" sub="Capture what happened" tint="var(--tint-blue)" ink="var(--blue)"
              onClick={() => nav.go(nav.plus ? 'handover' : 'gateintro')} />
          </div>

          {isEmpty ? (
            <div className="j-card" style={{ padding: 22, marginBottom: 22, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <span style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--tint-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="leaf" size={30} color="var(--blue)" /></span>
              </div>
              <p className="j-h3" style={{ marginBottom: 6 }}>A fresh, blank record</p>
              <p className="j-sm" style={{ marginBottom: 16 }}>The picture builds itself one ordinary day at a time. New to Jotla?</p>
              <button className="j-btn j-btn-ghost" onClick={() => nav.go('tour')}><Icon name="hand" size={18} color="var(--blue)" /> Take the quick tour</button>
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <MiniMonthStrip entries={entries} onOpen={() => nav.setTab('month')} />
            </div>
          )}

          <SectionLabel>{childName}'s day so far</SectionLabel>
          {todays.length === 0 ? (
            <div className="j-card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Face mood="good" size={56} /></div>
              <p className="j-h3" style={{ marginBottom: 6 }}>Nothing logged yet today</p>
              <p className="j-sm">A single line is plenty.</p>
            </div>
          ) : (
            <LogList list={todays} nav={nav} />
          )}

          <button className="j-btn j-btn-primary j-btn-lg" style={{ marginTop: 16 }} onClick={() => nav.go('quicklog')}>
            <Icon name="plus" size={22} color="#fff" stroke={2.2} /> Add to today
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- shared form atoms ----------------
function ChipGroup({ options, value, onChange, multi = false, green = false }) {
  const isOn = (o) => multi ? value.includes(o) : value === o;
  const toggle = (o) => {
    if (multi) onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o]);
    else onChange(o);
  };
  return (
    <div className="j-chiprow">
      {options.map(o => (
        <button key={o} aria-pressed={isOn(o)} className={'j-chip' + (isOn(o) ? (green ? ' j-chip-on-green' : ' j-chip-on') : '')} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

function MoodFacePicker({ value, onChange }) {
  const J = window.JOTLA;
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
      {J.MOODS.map(m => {
        const on = value === m.key;
        return (
          <button key={m.key} onClick={() => onChange(m.key)} className="j-press" style={{
            flex: 1, border: 'none', background: 'none', cursor: 'pointer', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: 7, padding: '4px 0',
          }}>
            <span style={{ borderRadius: '50%', padding: 4,
              boxShadow: on ? `0 0 0 3px ${window.MOOD_COLOURS[m.key]}` : '0 0 0 2px transparent',
              transition: 'box-shadow .15s ease' }}>
              <Face mood={m.key} size={48} />
            </span>
            <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 500, color: on ? 'var(--ink)' : 'var(--faint)' }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', margin: '0 0 10px' }}>{children}</p>;
}

// Take or attach photo, with a result tile
function PhotoPicker() {
  const [photo, setPhoto] = useStateA(null); // null | 'taken' | 'attached'
  if (photo) {
    return (
      <div style={{ borderRadius: 14, background: 'var(--photo-bg)', minHeight: 96, padding: 14,
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="camera" size={22} color="var(--blue)" />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 'calc(15px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)' }}>Photo attached (sample)</span>
          <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>{photo === 'taken' ? 'Taken just now' : 'Chosen from your photos'}</span>
        </span>
        <button onClick={() => setPhoto(null)} aria-label="Remove photo" className="j-press" style={{ width: 36, height: 36, borderRadius: 10,
          border: 'none', background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={18} color="var(--muted)" />
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <button onClick={() => setPhoto('taken')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="camera" size={24} color="var(--blue)" />
        <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500 }}>Take photo</span>
      </button>
      <button onClick={() => setPhoto('attached')} className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
        border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
        <Icon name="download" size={24} color="var(--blue)" />
        <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500 }}>Attach image</span>
      </button>
    </div>
  );
}

// Attach media: real files. Photos are downscaled and stored with the entry; videos
// stay in the phone's own library and the entry keeps an honest note of them.
function MediaPicker({ value = null, onChange = () => {} }) {
  const media = value;
  const onFile = (e, source) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (f.type && f.type.startsWith('video')) { onChange({ source, kind: 'video', name: f.name }); return; }
    window.fileToImageDataURL(f, 1024, 0.72, url => onChange({ source, kind: 'photo', dataUrl: url }));
  };

  if (media) {
    const isVideo = media.kind === 'video';
    const sourceLabel = isVideo
      ? 'Video noted. The video itself stays safely in your photo library.'
      : (media.source === 'capture' ? 'Taken just now' : 'Chosen from your photos');
    return (
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ position: 'relative', minHeight: isVideo ? 110 : 0, background: 'var(--photo-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isVideo ? (
            <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px -8px rgba(20,40,80,0.5)', paddingLeft: 4 }}>
              <Icon name="play" size={26} color="var(--blue)" fill={true} />
            </span>
          ) : (
            <img src={media.dataUrl} alt="Attached photo" style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }} />
          )}
          <button onClick={() => onChange(null)} aria-label="Remove media" className="j-press"
            style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.92)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={17} color="var(--muted)" />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', background: 'var(--card)' }}>
          <Icon name={isVideo ? 'video' : 'camera'} size={17} color="var(--blue)" />
          <span style={{ fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--faint)' }}>{sourceLabel}</span>
        </div>
      </div>
    );
  }

  const tile = (label, sub, icon, capture) => (
    <label className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
      <Icon name={icon} size={24} color="var(--blue)" />
      <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--faint)' }}>{sub}</span>
      <input type="file" accept="image/*,video/*" {...(capture ? { capture: 'environment' } : {})} style={{ display: 'none' }}
        onChange={e => onFile(e, capture ? 'capture' : 'attach')} />
    </label>
  );
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {tile('Capture', 'Photo or video', 'camera', true)}
      {tile('Attach media', 'From your photos', 'attach', false)}
    </div>
  );
}

// The quick log is dynamic (founder + wife's insight, 15 Jul 2026): a real day
// holds several moments, each with its own time, place, kind and mood (a morning
// wobble in transition, a new word at lunch, an incident while eating). Rather
// than force a separate log per moment, the day and place are set once at the
// top, then each category pill is an "add" button: tap it, write the moment,
// Okay, and it banks with a count badge. Change When and the next tap stamps the
// new time. One Save writes every banked moment as its own dated entry, so each
// stays individually findable, filterable and printable, the way evidence must.
// Incidents opens the same pattern with a richer before/during/after box and
// saves as a gate note (type 'handover').
// The context row (founder, 16 Jul 2026): Day / Where / When sit side by side,
// but each keeps the shape the fields always had, a heading with its answer on a
// pill below it, rather than welding the two into one joined pill. Tapping a pill
// opens just its own options underneath and blurs the rest of the screen, so a
// tired parent looks at one question at a time. Picking an answer closes it.
function ContextField({ label, value, active, onClick }) {
  return (
    // the heading centres over its own pill (founder, 16 Jul 2026) so each
    // column reads as one unit, question sitting directly above its answer
    <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
      <FieldLabel>{label}</FieldLabel>
      {/* the pill reads only its answer; the heading above says which question,
          so the button carries both in its label for a screen reader */}
      <button onClick={onClick} aria-expanded={active} aria-label={label + ' ' + value}
        className={'j-chip' + (active ? ' j-chip-on' : '')}
        style={{ width: '100%', padding: '0 12px', justifyContent: 'center' }}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      </button>
    </div>
  );
}

function QuickLogScreen({ nav, today, view }) {
  const J = window.JOTLA;
  const [setting, setSetting] = useStateA('School');
  const [time, setTime] = useStateA('Morning');
  const [picker, setPicker] = useStateA(null);        // null | 'day' | 'where' | 'when'
  const [places, setPlaces] = useStateA([]);          // the parent's own places, added via Other
  const [placeOpen, setPlaceOpen] = useStateA(false);
  const [placeText, setPlaceText] = useStateA('');
  const minus1 = (iso) => { const d = J.parseISO(iso); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  // A date can arrive on the view (the Day view's "Add a note", 12 Jul 2026),
  // pre-setting the day chips so nothing needs re-picking.
  const preset = view && typeof view.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(view.date)
    && view.date >= window.MIN_LOG_DAY && view.date <= today ? view.date : null;
  const [dayMode, setDayMode] = useStateA(!preset || preset === today ? 'today' : preset === minus1(today) ? 'yesterday' : 'custom'); // today | yesterday | custom
  const [customDate, setCustomDate] = useStateA(preset && preset !== today && preset !== minus1(today) ? preset : minus1(minus1(today)));
  const [dayPickerOpen, setDayPickerOpen] = useStateA(false);
  const logDate = dayMode === 'today' ? today : dayMode === 'yesterday' ? minus1(today) : customDate;

  // the day's banked moments, and the one category whose editor is open
  const [moments, setMoments] = useStateA([]);
  const [openCat, setOpenCat] = useStateA(null);
  const [editKey, setEditKey] = useStateA(null); // set when reopening a banked moment
  const [eText, setEText] = useStateA('');
  const [eMood, setEMood] = useStateA('good');
  const [eBefore, setEBefore] = useStateA('');
  const [eDuring, setEDuring] = useStateA('');
  const [eAfter, setEAfter] = useStateA('');
  const [eMedia, setEMedia] = useStateA(null);
  const isInc = openCat === 'Incidents';

  const openEditor = (c) => {
    setPicker(null); setOpenCat(c); setEditKey(null);
    setEText(''); setEMood(c === 'Incidents' ? 'hard' : 'good');
    setEBefore(''); setEDuring(''); setEAfter(''); setEMedia(null);
  };
  // A banked moment reopens for changing (founder, 16 Jul 2026): something else
  // often comes back to you while you are still sitting there logging. It keeps
  // its own time and place; only what happened changes.
  const editMoment = (m) => {
    setPicker(null); setOpenCat(m.category); setEditKey(m.key);
    setEText(m.text); setEMood(m.mood);
    setEBefore(m.before); setEDuring(m.during); setEAfter(m.after); setEMedia(m.media);
  };
  const bankMoment = () => {
    const body = {
      category: openCat, mood: eMood, isIncident: openCat === 'Incidents',
      text: eText.trim(), before: eBefore.trim(), during: eDuring.trim(), after: eAfter.trim(), media: eMedia,
    };
    if (editKey) setMoments(ms => ms.map(m => m.key === editKey ? { ...m, ...body } : m));
    else setMoments(ms => [...ms, { ...body, key: 'm' + Date.now() + '_' + ms.length, time, setting }]);
    setOpenCat(null); setEditKey(null);
  };
  const removeMoment = (key) => {
    setMoments(ms => ms.filter(m => m.key !== key));
    if (editKey === key) { setOpenCat(null); setEditKey(null); }
  };
  const countFor = (c) => moments.filter(m => m.category === c).length;

  const nowClock = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const save = () => {
    if (!moments.length) return;
    const kind = dayMode === 'today' ? 'contemporaneous' : 'recalled';
    // One Save is one log (founder, 16 Jul 2026): the moments written together
    // share a logId and a clock, so the record reads back as the single log the
    // parent wrote. Each moment still lands as its own dated entry underneath,
    // which is what keeps Find, the month graph and the PDF pack working.
    const logId = 'L' + Date.now();
    const clock = nowClock();
    // addEntry prepends, so add in reverse to keep the order they were written
    [...moments].reverse().forEach(m => {
      const base = {
        id: (m.isIncident ? 'h' : 'n') + m.key, logId, date: logDate, time: m.time, clock,
        setting: m.setting, category: m.category, mood: m.mood, kind,
      };
      const entry = m.isIncident
        ? { ...base, type: 'handover', summary: m.during || m.text || 'Hard moment captured.',
            handover: { behaviours: [], before: m.before, during: m.during || m.text, after: m.after, duration: '', helped: '', who: [], where: '' } }
        : { ...base, type: 'quick',
            summary: m.text || `${m.category} at ${m.setting.toLowerCase()}. ${m.time} went ${m.mood === 'good' ? 'well' : m.mood === 'ok' ? 'up and down' : 'hard'}.` };
      if (m.media && m.media.dataUrl) { entry.photoData = m.media.dataUrl; entry.photo = 'Photo from the day'; }
      else if (m.media && m.media.kind === 'video') { entry.photo = 'Video noted (kept in your photo library)'; }
      nav.addEntry(entry);
    });
    nav.back();
  };

  const moodDot = (mk) => <span style={{ width: 9, height: 9, borderRadius: '50%', background: window.MOOD_COLOURS[mk], flexShrink: 0, marginTop: 6 }} />;
  // A day from another year has to say so (founder, 16 Jul 2026): the formatters
  // never print a year, so "10 Dec" alone leaves you guessing which December.
  // The year shows only when it is not the current one, so the common case stays short.
  const yearSuffix = J.parseISO(logDate).getFullYear() === J.parseISO(today).getFullYear()
    ? '' : ' ' + J.parseISO(logDate).getFullYear();
  const longDate = J.fmtLong(logDate) + yearSuffix;
  const dayLabel = dayMode === 'today' ? 'Today' : dayMode === 'yesterday' ? 'Yesterday' : J.fmtShort(logDate) + yearSuffix;
  const placeOptions = [...J.SETTINGS, ...places];
  // a reopened moment keeps its own stamp; a new one takes the row's current answers
  const editing = editKey ? moments.find(m => m.key === editKey) : null;
  const eTime = editing ? editing.time : time;
  const eSetting = editing ? editing.setting : setting;
  // while a question is open, the rest of the screen softens out of the way
  const dim = { transition: 'filter .18s ease, opacity .18s ease', ...(picker ? { filter: 'blur(4px)', opacity: 0.4 } : {}) };
  const pickerChip = (label, on, onPick) => (
    <button key={label} aria-pressed={on} className={'j-chip' + (on ? ' j-chip-on' : '')} onClick={onPick}>{label}</button>
  );

  return (
    <div className="j-screen">
      <PushHeader title="Quick log" subtitle="Log the whole day, one moment at a time" onClose={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingBottom: 130, paddingTop: 6 }}>
          {/* the three questions side by side, each a heading over its answer */}
          <div style={{ display: 'flex', gap: 8 }}>
            <ContextField label="Day?" value={dayLabel} active={picker === 'day'} onClick={() => setPicker(p => p === 'day' ? null : 'day')} />
            <ContextField label="Where?" value={setting} active={picker === 'where'} onClick={() => setPicker(p => p === 'where' ? null : 'where')} />
            <ContextField label="When?" value={time} active={picker === 'when'} onClick={() => setPicker(p => p === 'when' ? null : 'when')} />
          </div>

          {/* only the open question's options, right underneath it */}
          {picker && (
            <div style={{ marginTop: 12 }}>
              <div className="j-chiprow">
                {picker === 'day' && [
                  pickerChip('Today', dayMode === 'today', () => { setDayMode('today'); setPicker(null); }),
                  pickerChip('Yesterday', dayMode === 'yesterday', () => { setDayMode('yesterday'); setPicker(null); }),
                  pickerChip('Another day', dayMode === 'custom', () => { setDayMode('custom'); setDayPickerOpen(true); setPicker(null); }),
                ]}
                {picker === 'where' && [
                  ...placeOptions.map(s => pickerChip(s, setting === s, () => { setSetting(s); setPicker(null); })),
                  <button key="__other" className="j-chip" style={{ borderStyle: 'dashed' }} onClick={() => setPlaceOpen(v => !v)}>
                    <Icon name="plus" size={15} color="var(--faint)" /> Other
                  </button>,
                ]}
                {picker === 'when' && J.TIMES.map(t => pickerChip(t, time === t, () => { setTime(t); setPicker(null); }))}
              </div>
              {/* Other: the parent's own place, kept for the rest of the log */}
              {picker === 'where' && placeOpen && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <input className="j-input" style={{ flex: 1, minWidth: 0 }} value={placeText} onChange={e => setPlaceText(e.target.value)}
                    aria-label="Add a place" placeholder="Grandma's, the park, soft play..." />
                  <button className="j-btn j-btn-soft" style={{ flex: '0 0 auto', width: 'auto', minHeight: 48, padding: '0 22px' }} onClick={() => {
                    const t = placeText.trim(); if (!t) return;
                    if (!placeOptions.includes(t)) setPlaces(p => [...p, t]);
                    setSetting(t); setPlaceText(''); setPlaceOpen(false); setPicker(null);
                  }}>Add</button>
                </div>
              )}
            </div>
          )}

          {/* everything else softens, so one question is in focus at a time */}
          <div onClick={picker ? () => setPicker(null) : undefined} style={dim}>
           <div style={picker ? { pointerEvents: 'none' } : undefined}>
            <p className="j-sm" style={{ margin: '12px 0 0', color: 'var(--faint)' }}>Saving to <span className="j-strong" style={{ color: 'var(--muted)' }}>{longDate}</span></p>

          {/* the category pills are add-buttons. A count badge shows how many
              moments each holds today; change When above to stamp the next one. */}
          <div style={{ marginTop: 22 }}>
            <FieldLabel>What happened?</FieldLabel>
            <p className="j-sm" style={{ margin: '-4px 0 12px', color: 'var(--faint)' }}>Tap what happened. Add as many as you like, then Save once.</p>
            <div className="j-chiprow">
              {J.CATEGORIES.map(c => {
                const n = countFor(c);
                return (
                  <button key={c} className={'j-chip' + (n > 0 || openCat === c ? ' j-chip-on' : '')} onClick={() => openEditor(c)}>
                    {c}
                    {n > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 5px', borderRadius: 999, background: 'var(--blue)', color: '#fff', fontSize: 'calc(12px * var(--tscale, 1))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* the moment editor: one category at a time. Incidents gets the
              richer before/during/after box and banks as a gate note. */}
          {openCat && (
            <div className="j-card j-card-pad" style={{ marginTop: 22, border: '1.5px solid var(--blue)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(17px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>{openCat}</p>
                <p className="j-meta" style={{ marginTop: 2 }}>{eTime} · {eSetting} · {longDate}</p>
              </div>
              {isInc ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <PhaseField label="Before" hint="What led up to it" value={eBefore} onChange={setEBefore} />
                  <PhaseField label="During" hint="What actually happened" value={eDuring} onChange={setEDuring} />
                  <PhaseField label="After" hint="How it ended" value={eAfter} onChange={setEAfter} />
                </div>
              ) : (
                <textarea className="j-input" value={eText} onChange={e => setEText(e.target.value)} rows={3}
                  placeholder="A line is plenty. Their exact words, in quotes, are gold." />
              )}
              {/* Adding media is part of Jotla Plus (12 Jul 2026): Free sees the
                  honest locked card in the same spot; viewing saved media never
                  gates anywhere. Media rides the specific moment. */}
              {nav.plus ? (
                <div><FieldLabel>Add a photo or video</FieldLabel><MediaPicker value={eMedia} onChange={setEMedia} /></div>
              ) : (
                <PlusLockedCard title="Add photos and videos"
                  text="Keep a photo or video with the note. Sometimes the picture is the evidence. Part of Plus."
                  onClick={() => nav.go('unlock')} />
              )}
              <div><FieldLabel>How did it feel?</FieldLabel><MoodFacePicker value={eMood} onChange={setEMood} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="j-btn j-btn-ghost" style={{ flex: '0 0 38%', minHeight: 52 }} onClick={() => { setOpenCat(null); setEditKey(null); }}>Cancel</button>
                <button className="j-btn j-btn-primary" style={{ flex: 1, minHeight: 52 }} onClick={bankMoment}><Icon name="check" size={20} color="#fff" /> Okay</button>
              </div>
            </div>
          )}

          {/* the day taking shape: tap a moment to change it, x to drop it */}
          {moments.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <SectionLabel>Moments so far</SectionLabel>
              <div className="j-card" style={{ padding: '4px 16px' }}>
                {moments.map(m => (
                  <div key={m.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 0', borderTop: moments[0].key === m.key ? 'none' : '1px solid var(--line)' }}>
                    <button onClick={() => editMoment(m)} aria-label={'Edit the ' + m.category + ' moment'} className="j-press"
                      style={{ flex: 1, minWidth: 0, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left',
                        border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                      {moodDot(m.mood)}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="j-meta" style={{ display: 'block' }}>{m.time} · {m.setting} · {m.category}</span>
                        <span className="j-body" style={{ display: 'block', fontSize: 'calc(15px * var(--tscale, 1))', marginTop: 1 }}>{m.isIncident ? (m.during || m.text || 'Incident noted') : (m.text || 'Noted')}</span>
                      </span>
                    </button>
                    <button onClick={() => removeMoment(m.key)} aria-label="Remove moment" className="j-press" style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--tag-grey-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="close" size={16} color="var(--muted)" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="j-meta" style={{ marginTop: 8 }}>Tap a moment to change it. It all saves as one log.</p>
            </div>
          )}
           </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--fade-grad)', ...dim, ...(picker ? { pointerEvents: 'none' } : {}) }}>
        {moments.length > 0 && <p className="j-meta" style={{ textAlign: 'center', marginBottom: 8 }}>{moments.length} moment{moments.length === 1 ? '' : 's'} ready. Saves as one log.</p>}
        {/* Nothing to save yet reads as a solid, resting grey button rather than
            a see-through blue one (founder, 16 Jul 2026). It turns blue the
            moment there is something worth saving. */}
        <button className={'j-btn j-btn-lg' + (moments.length ? ' j-btn-primary' : '')} onClick={save}
          style={moments.length ? {} : { background: 'var(--tag-grey-bg)', color: 'var(--faint)', boxShadow: 'none', cursor: 'default' }}>
          <Icon name="check" size={22} color={moments.length ? '#fff' : 'var(--faint)'} /> Save
        </button>
      </div>
      {/* The same bounds as ever, now picked instead of typed: nothing before
          the app's epoch, nothing after today. Out-of-rule days are greyed
          and untappable. */}
      {dayPickerOpen && (
        <CalendarSheet onClose={() => setDayPickerOpen(false)} value={customDate}
          onSelect={setCustomDate} minDate={window.MIN_LOG_DAY} maxDate={today} />
      )}
    </div>
  );
}

// ---------------- Gate note (guided capture) ----------------
// Child-centred, supportive questions. Not a witness statement.
const GATE_QUESTIONS = (name) => [
  'What happened?',
  'Where and when was this?',
  `How did ${name} seem?`,
  'What seemed to lead up to it?',
  'What helped, or what happened next?',
];

// Who was with the child, and where it happened (founder ask, 15 Jul 2026): the
// gate note now captures the scene, not only the behaviours and the ABC phases.
const WHO_CHIPS = ['Teachers', 'TA', 'Other children', 'Other adults'];
const WHERE_CHIPS = ['Classroom', 'Playground', 'Corridor', 'Lunch hall', 'Outside', 'Toilets', 'Other'];

function Stepper({ value, onChange, unit = 'mins' }) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);
  const btn = (label, fn) => (
    <button onClick={fn} className="j-press" style={{ width: 52, height: 52, borderRadius: 14, border: '1.5px solid var(--chip-border)',
      background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {btn(<span style={{ fontSize: 'calc(26px * var(--tscale, 1))', fontWeight: 400, lineHeight: 1 }}>-</span>, dec)}
      <div style={{ minWidth: 96, textAlign: 'center' }}>
        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(26px * var(--tscale, 1))', color: 'var(--ink)' }}>{value}</span>
        <span style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--faint)', marginLeft: 6 }}>{unit}</span>
      </div>
      {btn(<span style={{ fontSize: 'calc(24px * var(--tscale, 1))', fontWeight: 400, lineHeight: 1 }}>+</span>, inc)}
    </div>
  );
}

function PhaseField({ label, hint, value, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)' }}>{hint}</span>
        <span style={{ fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--faint)' }}>{label}</span>
      </div>
      <textarea className="j-input" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))' }} value={value} onChange={e => onChange(e.target.value)} rows={2}
        placeholder="Type a few words, or tap chips below." />
    </div>
  );
}

function HandoverScreen({ nav, today, profile }) {
  const J = window.JOTLA;
  const school = (profile && profile.school) || 'Oakfield Primary';
  const childName = (profile && profile.name) || 'Sam';
  const [behaviours, setBehaviours] = useStateA([]);
  const [before, setBefore] = useStateA('');
  const [during, setDuring] = useStateA('');
  const [after, setAfter] = useStateA('');
  const [duration, setDuration] = useStateA(10);
  const [helped, setHelped] = useStateA('');
  const [who, setWho] = useStateA([]);         // who was with the child (multi-select)
  const [whereAt, setWhereAt] = useStateA(''); // where it happened (single-select)
  const [nudge, setNudge] = useStateA(false);
  const [media, setMedia] = useStateA(null);
  const [extras, setExtras] = useStateA([]);
  const [customOpen, setCustomOpen] = useStateA(false);
  const [customText, setCustomText] = useStateA('');
  const [draft, setDraft] = useStateA(
    `Hi,\n\nThank you for letting me know about ${childName} this afternoon. When you have a moment, would you mind sending me a quick email with what was discussed? It really helps to have the same picture at home and school.\n\nThank you so much.`
  );

  const save = () => {
    const now = new Date();
    const entry = {
      id: 'h' + Date.now(), date: today,
      time: now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening',
      clock: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      setting: 'School', category: 'Incidents',
      mood: 'hard', kind: 'contemporaneous', type: 'handover',
      summary: during.trim() ? during.trim() : 'Hard moment captured at the gate.',
      handover: { behaviours, before, during, after, duration: duration + ' mins', helped, who, where: whereAt },
    };
    if (media && media.dataUrl) { entry.photoData = media.dataUrl; entry.photo = 'Photo from the gate'; }
    else if (media && media.kind === 'video') { entry.photo = 'Video noted (kept in your photo library)'; }
    nav.addEntry(entry);
    setNudge(true);
  };
  const finish = () => { setNudge(false); nav.back(); };

  return (
    <div className="j-screen" style={{ background: 'var(--bg)' }}>
      <PushHeader title="Gate note" subtitle="Dysregulation Mode. One calm screen, minimal typing." onBack={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingBottom: 150, paddingTop: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* auto-attached context + the in-the-moment tips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="j-pillbadge" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}><Icon name="clock" size={14} color="var(--muted)" /> {(() => { const n = new Date(); return (n.getHours() < 12 ? 'Morning' : n.getHours() < 17 ? 'Afternoon' : 'Evening') + ', ' + String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'); })()}</span>
            <span className="j-pillbadge" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}><Icon name="today" size={14} color="var(--muted)" /> {school}</span>
          </div>

          {/* read-aloud question list */}
          <div className="j-card" style={{ padding: 16, background: 'var(--tint-blue)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="j-eyebrow" style={{ marginBottom: 4 }}>Ask the teacher</p>
                <p className="j-sm" style={{ margin: 0, color: 'var(--blue)' }}>Five gentle questions.<br />Read them out, tap the answers below.</p>
              </div>
              <button onClick={() => nav.go('tips')} className="j-press" style={{ border: 'none', cursor: 'pointer', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 15px', borderRadius: 999, marginTop: 2,
                background: '#6E54D6', color: '#fff', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(14px * var(--tscale, 1))',
                boxShadow: '0 8px 18px -8px rgba(110,84,214,0.7)' }}>
                <Icon name="star" size={16} color="#fff" /> TIPS</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GATE_QUESTIONS(childName).map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--card)', color: 'var(--blue)',
                    fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                  <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', fontWeight: 400, lineHeight: 1.4 }}>{q}</p>
                </div>
              ))}
            </div>
          </div>

          {/* behaviours */}
          <div>
            <FieldLabel>What did you see? Tap what fits.</FieldLabel>
            <div className="j-chiprow">
              {[...J.BEHAVIOURS, ...extras].map(b => (
                <button key={b} aria-pressed={behaviours.includes(b)} className={'j-chip' + (behaviours.includes(b) ? ' j-chip-on' : '')}
                  onClick={() => setBehaviours(v => v.includes(b) ? v.filter(x => x !== b) : [...v, b])}>{b}</button>
              ))}
              <button className="j-chip" style={{ borderStyle: 'dashed' }} onClick={() => setCustomOpen(v => !v)}><Icon name="plus" size={15} color="var(--faint)" /> Add your own</button>
            </div>
            {customOpen && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <input className="j-input" style={{ flex: 1, minWidth: 0 }} value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="Your own word for what you saw" />
                {/* .j-btn is full-width by default; this one must stay its own size */}
                <button className="j-btn j-btn-soft" style={{ flex: '0 0 auto', width: 'auto', minHeight: 48, padding: '0 22px' }} onClick={() => {
                  const t = customText.trim(); if (!t) return;
                  if (!extras.includes(t) && !J.BEHAVIOURS.includes(t)) setExtras(x => [...x, t]);
                  setBehaviours(v => v.includes(t) ? v : [...v, t]);
                  setCustomText(''); setCustomOpen(false);
                }}>Add</button>
              </div>
            )}
          </div>

          {/* who + where: the scene of the moment (founder ask, 15 Jul 2026) */}
          <div>
            <FieldLabel>Who was with {childName}?</FieldLabel>
            <div className="j-chiprow">
              {WHO_CHIPS.map(c => (
                <button key={c} aria-pressed={who.includes(c)} className={'j-chip' + (who.includes(c) ? ' j-chip-on' : '')}
                  onClick={() => setWho(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Where did it happen?</FieldLabel>
            <div className="j-chiprow">
              {WHERE_CHIPS.map(c => (
                <button key={c} aria-pressed={whereAt === c} className={'j-chip' + (whereAt === c ? ' j-chip-on' : '')}
                  onClick={() => setWhereAt(v => v === c ? '' : c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* before / during / after */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <PhaseField label="Before" hint="What led up to it" value={before} onChange={setBefore} />
            <PhaseField label="During" hint="What actually happened" value={during} onChange={setDuring} />
            <PhaseField label="After" hint="How it ended" value={after} onChange={setAfter} />
          </div>

          {/* duration */}
          <div>
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)', margin: '0 0 10px' }}>How long did it last?</p>
            <Stepper value={duration} onChange={setDuration} />
          </div>

          {/* what helped */}
          <div>
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)', margin: '0 0 10px' }}>What helped them settle?</p>
            <textarea className="j-input" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))' }} value={helped} onChange={e => setHelped(e.target.value)} rows={2}
              placeholder="The thing that worked, however small." />
          </div>

          {/* photo at the gate: adding media is part of Jotla Plus
              (12 Jul 2026); viewing saved media never gates anywhere */}
          {nav.plus ? (
            <div>
              <FieldLabel>Add a photo or video</FieldLabel>
              <MediaPicker value={media} onChange={setMedia} />
            </div>
          ) : (
            <PlusLockedCard title="Add photos and videos"
              text="Keep a photo or video with the note. Sometimes the picture is the evidence. Part of Plus."
              onClick={() => nav.go('unlock')} />
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--fade-grad)', display: 'flex', gap: 12 }}>
        <button className="j-btn j-btn-ghost" style={{ flex: '0 0 38%' }} onClick={() => {
          const touched = behaviours.length || who.length || whereAt || before.trim() || during.trim() || after.trim() || helped.trim() || media;
          if (!touched || window.confirm('Leave without saving this note? What you have entered here will be lost.')) nav.back();
        }}>Finish later</button>
        <button className="j-btn j-btn-primary" style={{ flex: 1 }} onClick={save}><Icon name="check" size={20} color="#fff" /> Save note</button>
      </div>

      {/* optional, skippable nudge after saving. Never auto-sends. */}
      {nudge && (
        <div className="j-sheet-scrim" onClick={finish}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--tint-green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={26} color="var(--green)" />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>Saved to {childName}'s record</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              Want to drop the teacher a quick line? It helps to have the same picture at home and school.
            </p>
            <textarea className="j-input" value={draft} onChange={e => setDraft(e.target.value)} rows={6}
              style={{ fontSize: 'calc(15px * var(--tscale, 1))', lineHeight: 1.5, marginBottom: 10 }} />
            <p className="j-meta" style={{ marginBottom: 16 }}>Nothing is sent for you. This just opens your own email with the words ready, so you can change them or not send at all.</p>
            <button className="j-btn j-btn-primary" onClick={() => {
              window.location.assign('mailto:?subject=' + encodeURIComponent('About ' + childName + ' today') + '&body=' + encodeURIComponent(draft));
              finish();
            }}><Icon name="arrowRight" size={20} color="#fff" /> Open in email</button>
            <button className="j-btn j-btn-ghost" style={{ marginTop: 10 }} onClick={finish}>Not now</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- "Dysregulation" explainer (shown before capture when there is no Plus) ----------------
// Deliberately uses the word "dysregulation": it is the word SEND parents hear
// constantly from school, and meeting them in their own vocabulary is the point.
function GateIntroScreen({ nav, profile }) {
  const childName = (profile && profile.name) || 'Sam';
  const reasons = [
    ['In the moment', `You know exactly what to ask, so "dysregulated" never goes into the record as one bare word with nothing behind it.`],
    ['Over time', 'Because it records what came before and what helped, the patterns become easy to find.'],
    ['When it counts', 'It reads as a calm, factual note rather than a vent. The kind of note made on the day that helps at an EHCP assessment, an annual review, or a tribunal.'],
  ];
  return (
    <div className="j-screen">
      <PushHeader title="Dysregulation" onClose={() => nav.back()} />
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 4, paddingBottom: 150 }}>
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: 'var(--tint-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="note" size={26} color="var(--blue)" /></span>
          </div>
          <h1 className="j-h1" style={{ marginBottom: 10 }}>For the days you hear "dysregulated"</h1>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 14 }}>
            A quick log captures that something happened, and how it felt. A line is plenty.
          </p>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 14 }}>
            A gate note is for the harder days. The teacher meets you at the gate, or the message home says {childName} was dysregulated, and you are left holding one word instead of a picture of what actually happened.
          </p>
          <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 22 }}>
            Dysregulation Mode walks you through it while you are still standing there. It knows the right questions to ask, and the right order to ask them in, and it turns the answers into a calm, dated note: what led up to it, what happened, and what helped. The time and place add themselves.
          </p>

          <SectionLabel>Why it is worth it</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
            {reasons.map(([h, b]) => (
              <div key={h} className="j-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--tint-green)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Icon name="check" size={17} color="var(--green)" /></span>
                <div>
                  <p className="j-h3" style={{ marginBottom: 4 }}>{h}</p>
                  <p className="j-sm">{b}</p>
                </div>
              </div>
            ))}
            <div className="j-card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--tint-amber)', border: 'none' }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--card)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}><Icon name="sparkle" size={17} color="var(--amber)" /></span>
              <div>
                <p className="j-h3" style={{ marginBottom: 4 }}>Tips come with it</p>
                <p className="j-sm">Short, calm guidance for the moment itself: how to steady yourself and {childName}, and what tends to do more harm than good.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
        background: 'var(--fade-grad)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('unlock')}>
          <Icon name="sparkle" size={20} color="#fff" /> See what Plus adds
        </button>
        <button className="j-btn j-btn-ghost" onClick={() => nav.go('quicklog')}>Just log it quickly instead</button>
      </div>
    </div>
  );
}

// ---------------- Tips (Plus): how to be, when your child is dysregulated ----------------
// A calm, swipeable deck rather than a wall of text. Widely accepted co-regulation
// practice in plain language; never medical advice, and it says so.
const DYSREG_TIPS = [
  { illo: 'tipCalm', icon: 'heart', tint: 'var(--tint-green)', ink: 'var(--green)', title: 'Start with you',
    body: 'Your calm is the tool. Take one slow breath before any words. A dysregulated child borrows their calm from the nearest steady adult; that is co-regulation, and you are the anchor.',
    say: '"I\'m here. You\'re safe."' },
  { illo: 'tipSoft', icon: 'hand', tint: 'var(--tint-blue)', ink: 'var(--blue)', title: 'Fewer words, softer everything',
    body: 'Keep it short and simple. Lower your voice, come down to their level, stand slightly side-on rather than face-on. No questions yet: in the storm the thinking part of the brain is offline, so reasoning cannot land.' },
  { illo: 'tipAvoid', icon: 'close', tint: 'rgba(216,72,72,0.12)', ink: '#C0392B', title: 'What makes it worse',
    body: 'Asking why. Threatening consequences. Crowding, holding or blocking the way unless safety truly demands it. Taking what is said in the storm personally. Dysregulation is not naughtiness, and mid-storm is never the teaching moment.' },
  { illo: 'tipRoom', icon: 'leaf', tint: 'var(--tint-amber)', ink: 'var(--amber)', title: 'Give it room to pass',
    body: 'Less noise, less light, less audience, if you can manage it. One steady presence beats a crowd. A storm passes faster when nothing feeds it.' },
  { illo: 'tipReconnect', icon: 'heart', tint: 'var(--tint-green)', ink: 'var(--green)', title: 'Afterwards, reconnect first',
    body: 'Repair before review. Let them know the storm did not change anything between you. Save the talking-through for later, once everyone is truly calm, and keep it free of blame.',
    say: '"That was hard. We\'re okay."' },
  { illo: 'tipWrite', icon: 'note', tint: 'var(--tint-blue)', ink: 'var(--blue)', title: 'Then write it down',
    body: 'Once things are settled, open a gate note. It asks you the right questions in the right order while everything is still fresh. Hours later is fine; the record keeps its timing honest.', cta: true },
];

function DysregTipsScreen({ nav }) {
  const [idx, setIdx] = useStateA(0);
  const pagerRef = useRefA(null);
  const onScroll = () => {
    const el = pagerRef.current; if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };
  return (
    <div className="j-screen">
      <PushHeader title="Tips" subtitle="How to be, when it is happening" onClose={() => nav.back()} />
      <div ref={pagerRef} onScroll={onScroll} className="j-pager j-fade" {...pagerKeyProps(pagerRef, 'Tips')}
        style={{ flex: 1, minHeight: 0, display: 'flex',
        overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', outline: 'none' }}>
        {DYSREG_TIPS.map((t, i) => (
          <div key={i} style={{ flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'start', overflowY: 'auto' }}>
            <div className="j-pad" style={{ paddingTop: 18, paddingBottom: 140, display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center' }}>
              {/* brand-style scene illustration (build 1.8.0); the old icon square is the fallback */}
              {t.illo
                ? <span style={{ marginBottom: 12 }}><StoryIllo scene={t.illo} width={210} /></span>
                : <span style={{ width: 76, height: 76, borderRadius: 24, background: t.tint, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon name={t.icon} size={36} color={t.ink} />
                  </span>}
              <p className="j-eyebrow" style={{ marginBottom: 6 }}>{i + 1} of {DYSREG_TIPS.length}</p>
              <h1 className="j-h1" style={{ marginBottom: 12 }}>{t.title}</h1>
              <p className="j-body" style={{ color: 'var(--muted)', fontSize: 'calc(16.5px * var(--tscale, 1))', lineHeight: 1.55, maxWidth: 330 }}>{t.body}</p>
              {t.say && (
                <span style={{ marginTop: 18, padding: '10px 18px', borderRadius: 999, background: t.tint, color: t.ink,
                  fontSize: 'calc(15.5px * var(--tscale, 1))', fontWeight: 500 }}>{t.say}</span>
              )}
              {t.cta && (
                <button className="j-btn j-btn-primary" style={{ marginTop: 22 }} onClick={() => nav.go('handover')}>
                  <Icon name="note" size={18} color="#fff" /> Open a gate note
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 20px calc(14px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          {DYSREG_TIPS.map((t, i) => (
            <button key={i} aria-label={'Tip ' + (i + 1) + ' of ' + DYSREG_TIPS.length + ': ' + t.title} aria-current={idx === i}
              onClick={() => { const el = pagerRef.current; if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' }); }}
              style={{ width: idx === i ? 18 : 7, height: 7, borderRadius: 99, transition: 'all .2s ease', border: 'none', padding: 0, cursor: 'pointer',
              background: idx === i ? 'var(--blue)' : 'var(--chip-border)' }} />
          ))}
        </div>
        <p className="j-meta" style={{ textAlign: 'center' }}>Swipe for the next one. Good general practice, not medical advice; you know your child best.</p>
      </div>
    </div>
  );
}

Object.assign(window, { TodayScreen, QuickLogScreen, HandoverScreen, GateIntroScreen, DysregTipsScreen, ChipGroup, FieldLabel, PhotoPicker, MediaPicker, greeting });
