// jotla-parent-b.jsx: Find, Evidence (records + document vault), Add document, Doc detail, Unlock, Settings.
const { useState: useStateB, useRef: useRefB, useEffect: useEffectB } = React;

const THEME_TO_CAT = new Proxy({}, { get: (_, k) => k });

// ---------------- Find ----------------
function FindScreen({ nav, entries, view }) {
  const J = window.JOTLA;
  // Back restores this page as it was: filters live on the view (nav.remember),
  // and the scroll position is captured when a note is opened, restored on return.
  const saved = (view && view.find) || {};
  const [q, setQ] = useStateB(saved.q || '');
  const [themes, setThemes] = useStateB(saved.themes || []);
  const [moods, setMoods] = useStateB(saved.moods || []);
  const [setting, setSetting] = useStateB(saved.setting || 'Any');
  const [range, setRange] = useStateB(saved.range || { preset: 'Any time', from: '', to: '' });
  const scrollRef = useRefB(null);
  useEffectB(() => { nav.remember({ find: { q, themes, moods, setting, range } }); }, [q, themes, moods, setting, range]);
  useEffectB(() => { if (saved.scrollY && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY; }, []);
  const openEntry = (id) => {
    nav.remember({ find: { q, themes, moods, setting, range, scrollY: scrollRef.current ? scrollRef.current.scrollTop : 0 } });
    nav.go('entry', { id });
  };

  const toggle = (setter) => (val) => setter(v => v.includes(val) ? v.filter(x => x !== val) : [...v, val]);

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

  const queryBits = [...themes];
  if (setting !== 'Any') queryBits.push(setting);
  const rangeLabel = range.preset === 'Custom'
    ? ((range.from ? J.fmtShort(range.from) : 'start') + ' to ' + (range.to ? J.fmtShort(range.to) : 'today'))
    : (range.preset === 'Any time' ? 'all dates' : range.preset.toLowerCase());
  queryBits.push(rangeLabel);

  return (
    <div className="j-screen">
      <div className="j-scroll j-fade" ref={scrollRef}>
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
          <TabTitle title="Find" sub="Search across everything you have noted." />

          {/* search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card-2)', border: '1.5px solid var(--chip-border)',
            borderRadius: 14, padding: '0 14px', height: 52, marginBottom: 16 }}>
            <Icon name="search" size={20} color="var(--faint)" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your notes"
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', background: 'transparent' }} />
          </div>

          {/* Filters are the Plus half of Find; plain keyword search stays free. */}
          {nav.plus ? (
            <>
              <SectionLabel>Themes</SectionLabel>
              <div className="j-chiprow" style={{ marginBottom: 14 }}>
                {J.FIND_THEMES.map(t => (
                  <button key={t} aria-pressed={themes.includes(t)} className={'j-chip' + (themes.includes(t) ? ' j-chip-on' : '')} onClick={() => toggle(setThemes)(t)}>{t}</button>
                ))}
              </div>

              <SectionLabel>Mood</SectionLabel>
              <div className="j-chiprow" style={{ marginBottom: 14 }}>
                {J.FIND_MOODS.map(m => {
                  const on = moods.includes(m.key);
                  return (
                    <button key={m.key} aria-pressed={on} className={'j-chip' + (on ? ' j-chip-on' : '')} onClick={() => toggle(setMoods)(m.key)}>
                      <MoodDot mood={m.key} size={11} /> {m.label}
                    </button>
                  );
                })}
              </div>

              <SectionLabel>Where</SectionLabel>
              <div className="j-chiprow" style={{ marginBottom: 18 }}>
                {['Any', 'School', 'Home', 'Club'].map(s => (
                  <button key={s} aria-pressed={setting === s} className={'j-chip' + (setting === s ? ' j-chip-on' : '')} onClick={() => setSetting(s)}>{s}</button>
                ))}
              </div>

              <SectionLabel>When</SectionLabel>
              <div style={{ marginBottom: 18 }}>
                <DateRangeControl presets={['Any time', 'This week', 'Last 2 weeks', 'Custom']} value={range} onChange={setRange} />
              </div>
            </>
          ) : (
            <PlusLockedCard onClick={() => nav.go('unlock')} style={{ marginBottom: 18 }}
              title="Filters" text="Combine theme, mood, place and dates to answer a question in seconds. Keyword search is always free." />
          )}

          {/* standout query line + results */}
          <div className="j-card" style={{ padding: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--tint-blue)', border: 'none' }}>
            <Icon name="filter" size={18} color="var(--blue)" />
            <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)', fontWeight: 500 }}>{queryBits.join(', ')}</p>
          </div>
          <p className="j-meta" style={{ marginBottom: 10 }}>{matched.length} {matched.length === 1 ? 'note' : 'notes'} found</p>

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
      + ', ' + esc(e.clock || e.time) + '</strong> &nbsp; ' + esc(e.setting) + ' · ' + esc(e.category) + ' &nbsp; ' + badge(e.kind)
      + (e.editedOn ? ' <span style="color:#8892a6;font-size:10.5px;">edited ' + esc(J.fmtShort(e.editedOn)) + '</span>' : '') + '</p>'
      + '<p style="margin:0;font-size:13px;line-height:1.45;">' + esc(e.summary) + '</p>' + extra + '</div>';
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

// How many things ride a document row: the media attachments plus the older
// single "scan" photo earlier builds kept (still honoured, never migrated away
// silently).
function docAttachedCount(doc) {
  return (doc.media ? doc.media.length : 0) + (doc.scan ? 1 : 0);
}

// A document log card (file layout). When the document itself is kept (12 Jul
// 2026), a small paperclip count rides the meta row, so the parent can see
// which letters carry their file at a glance.
function DocCard({ doc, onClick }) {
  const J = window.JOTLA;
  const attached = docAttachedCount(doc);
  return (
    <div className="j-card j-press" onClick={onClick} style={{ padding: 14, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--tint-blue)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="doc" size={22} color="var(--blue)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="j-tag j-tag-blue">{doc.type}</span>
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
      <Icon name="chevronRight" size={18} color="var(--faint)" style={{ marginTop: 4 }} />
    </div>
  );
}

function EvidenceScreen({ nav, entries, docs, profile, navView }) {
  const J = window.JOTLA;
  // Back restores this page as it was: the open sub-tab, filters and scroll
  // position are remembered on the view, so reading one document and returning
  // lands the parent back on the Documents list where they left it.
  const saved = (navView && navView.ev) || {};
  const [view, setView] = useStateB(saved.tab || 'records'); // records | documents
  const [range, setRange] = useStateB(saved.range || { preset: 'Last 3 weeks', from: '', to: '' });
  const [themes, setThemes] = useStateB(saved.themes || []);
  const [done, setDone] = useStateB(false);
  const scrollRef = useRefB(null);
  useEffectB(() => { nav.remember({ ev: { tab: view, range, themes } }); }, [view, range, themes]);
  useEffectB(() => { if (saved.scrollY && scrollRef.current) scrollRef.current.scrollTop = saved.scrollY; }, []);
  const openDoc = (id) => {
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
      <PushHeader title="Documents and evidence" subtitle="A dated record of what you saw, when you saw it." onBack={() => nav.back()} />
      <div className="j-scroll j-fade" ref={scrollRef}>
        <div className="j-pad" style={{ paddingTop: 2, paddingBottom: view === 'records' ? 120 : 120 }}>

          {/* segmented switch */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--tag-grey-bg)', marginBottom: 20 }}>
            <Seg id="records" label="Day records" />
            <Seg id="documents" label="Documents" />
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
              <div className="j-card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center',
                background: 'var(--tint-green)', border: 'none' }}>
                <Icon name="shield" size={20} color="var(--green-ink)" style={{ flexShrink: 0 }} />
                <p className="j-body" style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--green-ink)' }}>Keep every letter, report and plan in one place, so nothing important gets lost.</p>
              </div>

              <SectionLabel right={<span className="j-meta">{docs.length} saved</span>}>Your documents</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {docs.length === 0
                  ? <div className="j-card" style={{ padding: 22, textAlign: 'center' }}><p className="j-sm">No documents yet. Add the first letter or report and never lose it again.</p></div>
                  : docs.map(d => <DocCard key={d.id} doc={d} onClick={() => openDoc(d.id)} />)}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(16px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        {view === 'records'
          ? (nav.plus
            ? <button className="j-btn j-btn-primary j-btn-lg" onClick={() => { if (openPrintPack(childLabel, rangeLabel, inPack)) setDone(true); }}><Icon name="doc" size={20} color="#fff" /> Create PDF</button>
            : <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('unlock')}><Icon name="lock" size={18} color="#fff" /> Create PDF is part of Plus</button>)
          : <button className="j-btn j-btn-primary j-btn-lg" onClick={() => nav.go('adddoc')}><Icon name="plus" size={22} color="#fff" /> Add document</button>}
      </div>

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

  const tile = (label, sub, icon, inputProps) => (
    <label className="j-press" style={{ flex: 1, minHeight: 84, borderRadius: 14, cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)', background: 'var(--card)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 7, color: 'var(--muted)' }}>
      <Icon name={icon} size={24} color="var(--blue)" />
      <span style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 'calc(12px * var(--tscale, 1))', color: 'var(--faint)' }}>{sub}</span>
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
      id: 'doc' + Date.now(), title: title.trim() || 'Untitled document', type, from,
      received: /^\d{4}-\d{2}-\d{2}$/.test(received.trim()) ? received.trim() : J.TODAY_ISO,
      about: about.trim(), action: action.trim(), mood: 'good',
    };
    if (docMedia.length) doc.media = keptDocMedia(docMedia);
    nav.addDoc(doc);
    nav.back();
  };

  return (
    <div className="j-screen">
      <PushHeader title="Add a document" subtitle="A few questions so it is easy to find later." onClose={() => nav.back()} />
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
            <PlusLockedCard title="Add the document itself" text="Keep the letter with its details. Part of Plus."
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
          </div>

          <div>
            <FieldLabel>Who is it from?</FieldLabel>
            <div className="j-chiprow">
              {J.DOC_SOURCES.map(s => <button key={s} aria-pressed={from === s} className={'j-chip' + (from === s ? ' j-chip-on' : '')} onClick={() => setFrom(s)}>{s}</button>)}
            </div>
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
  const [from, setFrom] = useStateB(doc.from);
  const [received, setReceived] = useStateB(doc.received);
  const [about, setAbout] = useStateB(doc.about || '');
  const [action, setAction] = useStateB(doc.action || '');
  const [newMedia, setNewMedia] = useStateB([]); // pending adds, committed on Save
  const [datePickerOpen, setDatePickerOpen] = useStateB(false);
  const alreadyAttached = docAttachedCount(doc);
  const inputStyle = { width: '100%', boxSizing: 'border-box', borderRadius: 12, border: '1.5px solid var(--chip-border)', background: 'var(--card-2)',
    padding: '10px 12px', fontFamily: "'Outfit', system-ui", fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', marginBottom: 12 };
  const changed = title.trim() !== doc.title || type !== doc.type || from.trim() !== doc.from || received !== doc.received
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
          <PlusLockedCard title="Add the document itself" text="Keep the letter with its details. Part of Plus."
            onClick={onUnlock} style={{ marginBottom: 16 }} />
        )}
        <button className="j-btn j-btn-primary" disabled={!title.trim()} style={{ opacity: title.trim() ? 1 : 0.5 }}
          onClick={() => {
            const rec = /^\d{4}-\d{2}-\d{2}$/.test(received) ? received : doc.received;
            if (changed && title.trim()) onSave({ title: title.trim(), type, from: from.trim(), received: rec, about: about.trim(), action: action.trim() });
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
            <span style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--tint-blue)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={26} color="var(--blue)" /></span>
            <div>
              <p className="j-h3" style={{ fontSize: 'calc(19px * var(--tscale, 1))' }}>{d.title}</p>
              <p className="j-meta" style={{ marginTop: 2 }}>{d.type} · from {d.from}</p>
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
            <Row label="What it is" value={d.type} />
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

// The money model (decisions/log.md, 2026-07-14, Bupe's money gate):
//   Free      £0 forever.
//   Plus      £79 a year (Best value), or £49 for 6 months. No monthly plan.
//             Family Sync is inside it.
//   Jotla AI  £149 a year, coming 2027, and it INCLUDES Plus (£149 in total,
//             not £79 + £149). It replaces the old "Living Companion" tier.
// There is no one-time price and no lifetime buyout of any kind. The old
// buy-once copy (pay once, yours to keep, no subscription, no timers) is
// retired with it and must not come back.
const PLUS_PRICE = '£79';
const PLUS_PERIOD = 'a year';
const TERM_PRICE = '£49';
const TERM_PERIOD = 'for 6 months';
const AI_PRICE = '£149';
// Repriced 2026-07-17 (Bupe, money gate) from £49 Plus / £79 AI. The £49 six-
// month term is the low-commitment door that keeps the £79 annual affordable.

// Free is a calm, flat darker blue. Plus has its own purple identity. The premium
// navy + gold look (and the sparkle) dresses Jotla AI and the Settings upsell card.
const FREE_BLUE = '#1A56A8';
const PLUS_GRAD = 'linear-gradient(135deg, #3C2A72 0%, #6E54D6 100%)';
const PLUS_ACCENT = '#CDBBF7';
const PLUS_ACCENT_DEEP = '#6E54D6';
const PREMIUM_GRAD = 'linear-gradient(135deg, #14294A 0%, #1E5099 100%)';
const PREMIUM_GOLD = '#E6B85C';
const PREMIUM_GOLD_DEEP = '#C9912F';

// A simple check list used on each tier page.
function CheckList({ items, color, tint, dark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {items.map(it => (
        <div key={it} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: tint, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
            <Icon name="check" size={13} color={color} />
          </span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 'calc(15.5px * var(--tscale, 1))', lineHeight: 1.4, color: dark ? 'rgba(255,255,255,0.92)' : 'var(--body)' }}>{it}</span>
        </div>
      ))}
    </div>
  );
}

// A detailed Plus feature: a formal bottom-line sentence, then a plain "what it looks like" line.
function PlusFeature({ icon, title, formal, plain }) {
  return (
    <div className="j-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: PLUS_GRAD, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <p className="j-h3">{title}</p>
      </div>
      <p className="j-body" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))', marginBottom: 10 }}>{formal}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--plus-tint)', borderRadius: 12, padding: '10px 12px' }}>
        <Icon name="arrowRight" size={16} color="var(--plus-ink)" style={{ marginTop: 2, flexShrink: 0 }} />
        <p className="j-sm" style={{ color: 'var(--plus-ink)' }}>{plain}</p>
      </div>
    </div>
  );
}

const FREE_ITEMS = ['Daily logging and the quick log', 'The child walkthrough', 'Your basic timeline',
  'Plain keyword search of your own notes', 'Raw data export', 'Appeal-deadline safety reminders'];
// Jotla AI (2027) carries what the old third tier carried: the statutory
// content that has to be kept current, plus the on-device help.
// HONESTY (14 Jul 2026): "A document vault" and "Multiple children" were struck
// from this list. Both already ship today, so advertising them as a future paid
// feature would sell a parent something she already has. Nothing goes on this
// list that a parent can already use. Check that before adding to it.
const AI_ITEMS = ['EHCP and SEND deadline tracker', 'What to do about a gap', 'Rights kept current',
  'Current letter templates', 'On-device AI help', 'Fresh scene and symbol packs', 'Voice capture'];

// The no-ransom promise, in the parent's own words. Plus is now a yearly
// subscription, so this matters MORE, not less: a year ending must never cost
// a parent a single line of what they wrote. This list is what survives a
// lapse, always, and it is shown at the same weight as the price.
const NO_RANSOM_ITEMS = ['Every entry you have written', 'Your full timeline',
  'Plain keyword search', 'Raw export of everything', 'The PDF of everything you have already logged',
  'Appeal-deadline safety reminders, with or without a subscription'];

const PAGE_STYLE = { flex: '0 0 100%', width: '100%', height: '100%', scrollSnapAlign: 'start',
  overflowY: 'auto', overflowX: 'hidden' };

// ---- Page 1: Free ----
function FreePage() {
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        <span className="j-pillbadge" style={{ background: 'var(--tint-blue)', color: 'var(--blue)' }}>
          <Icon name="check" size={13} color="var(--blue)" /> Free, forever
        </span>
        <h1 className="j-h1" style={{ margin: '12px 0 8px' }}>Everything you need to keep a record</h1>
        <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 18 }}>
          No cost. No account. It never expires.
        </p>
        <div className="j-card" style={{ padding: 18, marginBottom: 16 }}>
          <CheckList items={FREE_ITEMS} color="var(--blue)" tint="var(--tint-blue)" />
        </div>
        <div style={{ background: 'var(--tint-blue)', borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="shield" size={22} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--blue)' }}>
            <span style={{ fontWeight: 500 }}>Your record is yours.</span> Logging and export stay free forever, and anything you have saved stays yours even if you cancel.
          </p>
        </div>
      </div>
    </div>
  );
}

// The back-to-school promotion kit was RETIRED 2026-07-17 (Bupe) when Plus moved
// to £79 a year plus a £49 six-month term. The term now does, honestly and
// permanently, the job a first-year discount did, so Jotla ships no dormant
// discount kit. The old kit is in git history if it is ever wanted again.

// ---- Page 2: Jotla Plus (premium) ----
// The no-ransom promise sits directly under the price, at the same visual
// weight, because it is the other half of the price. A parent has to be able
// to see, before they pay, that a year ending never costs them their record.
function PlusPage() {
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        {/* premium hero */}
        <div style={{ borderRadius: 20, padding: '22px 20px', background: PLUS_GRAD, color: '#fff',
          marginBottom: 18, boxShadow: '0 18px 38px -18px rgba(60,42,114,0.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
              background: 'rgba(205,187,247,0.18)', border: `1px solid ${PLUS_ACCENT}`, color: PLUS_ACCENT,
              fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 600, letterSpacing: '0.08em' }}>
              <Icon name="star" size={13} color={PLUS_ACCENT} /> JOTLA PLUS
            </span>
          </div>
          <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(24px * var(--tscale, 1))', lineHeight: 1.14, margin: '14px 0 0' }}>
            The tools to help you spot patterns and make your case
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(40px * var(--tscale, 1))', color: PLUS_ACCENT }}>{PLUS_PRICE}</span>
            <span style={{ fontSize: 'calc(14px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)' }}>{PLUS_PERIOD}</span>
            <span style={{ marginLeft: 'auto', fontSize: 'calc(12.5px * var(--tscale, 1))', fontWeight: 700, color: '#2A1E52', background: PLUS_ACCENT,
              padding: '4px 10px', borderRadius: 999 }}>Best value</span>
          </div>
          <p style={{ fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)', margin: '8px 0 0' }}>
            or {TERM_PRICE} {TERM_PERIOD}, if you would rather start with a shorter run.
          </p>
          <p style={{ fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>Paid up front, never monthly. Cancel any time. If it ever ends, you keep everything.</p>
        </div>

        {/* The no-ransom promise: the same weight as the price, right under it. */}
        <div className="j-card" style={{ padding: 18, marginBottom: 18, borderColor: 'var(--plus-ink)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--plus-tint)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="shield" size={22} color="var(--plus-ink)" />
            </span>
            <p className="j-h3">If your year ends, you keep everything</p>
          </div>
          <p className="j-body" style={{ fontSize: 'calc(15.5px * var(--tscale, 1))', marginBottom: 12 }}>
            Your record is never held to ransom. If Plus ends, for any reason at all, whether you cancel, let it lapse, or a card quietly expires, you lose nothing you have written.
          </p>
          <CheckList items={NO_RANSOM_ITEMS} color="var(--plus-ink)" tint="var(--plus-tint)" />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'var(--plus-tint)', borderRadius: 12, padding: '10px 12px', marginTop: 12 }}>
            <Icon name="arrowRight" size={16} color="var(--plus-ink)" style={{ marginTop: 2, flexShrink: 0 }} />
            <p className="j-sm" style={{ color: 'var(--plus-ink)' }}>A subscription only ever switches off the paid tools. It never touches your history.</p>
          </div>
        </div>

        {/* everything in free, included */}
        <div className="j-card" style={{ padding: 14, marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--tint-blue)', border: 'none' }}>
          <Icon name="check" size={18} color="var(--blue)" style={{ flexShrink: 0 }} />
          <p className="j-body" style={{ fontSize: 'calc(14.5px * var(--tscale, 1))', color: 'var(--blue)' }}>Everything in Free is included, always.</p>
        </div>

        <SectionLabel>What Plus adds</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PlusFeature icon={<Icon name="calendar" size={22} color="#fff" />}
            title="Patterns and Month View"
            formal="See the shape of your child's months. Patterns and the Month view turn a year of single days into a clear picture of good days and hard days, so trends you could never spot across separate notes become obvious."
            plain="A calendar of green and amber days. Tap any day to read what happened behind it." />
          <PlusFeature icon={<Icon name="filter" size={22} color="#fff" />}
            title="Deep Filtering"
            formal="Find the exact entries that prove your point. Combine theme, behaviour, setting and dates in one search, so you can pull together every relevant moment in seconds instead of reading back through months."
            plain="Pick 'lunch hall' plus 'running off' plus 'this term' and get just those days, in order." />
          <PlusFeature icon={<Icon name="note" size={22} color="#fff" />}
            title="Dysregulation Mode"
            formal="Capture a hard moment as fact, while you are still standing there. It gives you the five questions to ask, takes the answers as plain notes, and puts them in order: what led up to it, what happened, and what helped. You walk away with a usable record, not just 'a hard afternoon'."
            plain="Teacher mentions a tough afternoon. You tap 'Dysregulation', read the questions, tap the answers. Done in under two minutes." />
          <PlusFeature icon={<Icon name="attach" size={22} color="#fff" />}
            title="Photos and Videos on Notes"
            formal="Keep the picture with the fact. Capture a photo or video, or attach one from your library, and it stays with the note on this phone. Sometimes the picture is the evidence."
            plain="A mark at pick-up: capture it with a dysregulation note and it sits with that day's record, ready when you need it." />
          <PlusFeature icon={<Icon name="doc" size={22} color="#fff" />}
            title="PDF Evidence Pack"
            formal="Hand over a clean, dated record when it counts. The evidence pack lays out your chosen entries as a clear, dated document, each with the day it was logged and whether it was written the same day or added later. It is built around the formats tribunals and professionals already use."
            plain="Choose your dates and themes, and get a tidy PDF you can email or print for an assessment, review or tribunal." />
        </div>

        {/* Family Sync is part of Plus, and it is not built yet. Say so plainly. */}
        <div className="j-card" style={{ padding: 14, marginTop: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="clock" size={18} color="var(--muted)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="j-sm">Family Sync, the record on every grown-up's phone, is part of Plus too. It is not switched on yet, and nothing here pretends it is.</p>
        </div>
      </div>
    </div>
  );
}

// ---- Page 3: Jotla AI (2027, coming soon) ----
// This replaces the old "Living Companion" tier. It is £149 a year and it
// INCLUDES Plus: a parent on Jotla AI pays £149 in total, not £79 plus £149.
function AiPage() {
  return (
    <div style={PAGE_STYLE}>
      <div className="j-pad" style={{ paddingTop: 6, paddingBottom: 150 }}>
        <div style={{ borderRadius: 20, padding: '22px 20px', background: PREMIUM_GRAD, color: '#fff',
          marginBottom: 18, boxShadow: '0 18px 38px -18px rgba(20,40,80,0.7)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
            background: 'rgba(230,184,92,0.16)', border: `1px solid ${PREMIUM_GOLD}`, color: PREMIUM_GOLD,
            fontSize: 'calc(12px * var(--tscale, 1))', fontWeight: 600, letterSpacing: '0.08em' }}>
            <Icon name="sparkle" size={13} color={PREMIUM_GOLD} /> Coming in 2027
          </span>
          <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(26px * var(--tscale, 1))', lineHeight: 1.12, color: '#fff', margin: '14px 0 6px' }}>
            Jotla AI
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(40px * var(--tscale, 1))', color: PREMIUM_GOLD }}>{AI_PRICE}</span>
            <span style={{ fontSize: 'calc(14px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)' }}>{PLUS_PERIOD}</span>
          </div>
          <p style={{ fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)', margin: '4px 0 0' }}>
            Jotla Plus is included. {AI_PRICE} {PLUS_PERIOD} is the whole price, not one price on top of another.
          </p>
        </div>

        <p className="j-body" style={{ color: 'var(--muted)', marginBottom: 18 }}>
          The things that keep working for you, current and maintained over time. The deadline tracker, the route guidance, the templates and the content all stay up to date, so you are never working from old information.
        </p>

        <div className="j-card" style={{ padding: 18, marginBottom: 16, borderColor: `${PREMIUM_GOLD}55` }}>
          <CheckList items={AI_ITEMS} color={PREMIUM_GOLD_DEEP} tint={`${PREMIUM_GOLD}26`} />
        </div>

        <div style={{ background: `${PREMIUM_GOLD}1F`, borderRadius: 16, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="leaf" size={22} color={PREMIUM_GOLD_DEEP} style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="j-body" style={{ fontSize: 'calc(15px * var(--tscale, 1))', color: 'var(--body)' }}>
            We will let you know when it arrives. Nothing you have to do, nothing changes for you until then, and your free tools stay free.
          </p>
        </div>
      </div>
    </div>
  );
}

function UnlockScreen({ nav }) {
  const owned = nav.plus;
  const [bought, setBought] = useStateB(false);
  const [confirmPlus, setConfirmPlus] = useStateB(false);
  const [confirmFree, setConfirmFree] = useStateB(false);
  const [droppedFree, setDroppedFree] = useStateB(false);
  const [idx, setIdx] = useStateB(0);
  const pagerRef = useRefB(null);

  const goTo = (i) => {
    const el = pagerRef.current; if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setIdx(i);
  };
  const onScroll = () => {
    const el = pagerRef.current; if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  const TABS = [
    { label: 'Free', onBg: FREE_BLUE, dotOn: FREE_BLUE },
    { label: 'Plus', onBg: PLUS_GRAD, dotOn: PLUS_ACCENT_DEEP },
    { label: 'Jotla AI', onBg: PREMIUM_GRAD, dotOn: PREMIUM_GOLD_DEEP },
  ];

  return (
    <div className="j-screen">
      <PushHeader title="Jotla Plus" subtitle="Swipe to compare the three tiers." onClose={() => nav.back()} />

      {/* tier tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px' }}>
        {TABS.map((t, i) => {
          const on = idx === i;
          return (
            <button key={t.label} onClick={() => goTo(i)} className="j-press" style={{ flex: 1, minHeight: 40, borderRadius: 999,
              border: 'none', cursor: 'pointer', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(14px * var(--tscale, 1))',
              background: on ? t.onBg : 'var(--tag-grey-bg)', color: on ? '#fff' : 'var(--muted)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {i === 2 && <Icon name="sparkle" size={14} color={on ? PREMIUM_GOLD : 'var(--faint)'} />}{t.label}
            </button>
          );
        })}
      </div>

      {/* horizontal swipe pager */}
      <div ref={pagerRef} onScroll={onScroll} className="j-pager" {...pagerKeyProps(pagerRef, 'Jotla tiers')}
        style={{ flex: 1, minHeight: 0, display: 'flex',
        overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', outline: 'none' }}>
        <FreePage />
        <PlusPage />
        <AiPage />
      </div>

      {/* dots + contextual CTA */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 20px calc(14px + env(safe-area-inset-bottom))', background: 'var(--fade-grad)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {TABS.map((t, i) => (
            <button key={i} aria-label={'Tier ' + (i + 1) + ' of ' + TABS.length + ': ' + t.label} aria-current={idx === i}
              onClick={() => goTo(i)}
              style={{ width: idx === i ? 18 : 7, height: 7, borderRadius: 99, transition: 'all .2s ease', border: 'none', padding: 0, cursor: 'pointer',
              background: idx === i ? t.dotOn : 'var(--chip-border)' }} />
          ))}
        </div>
        {idx === 0 && (owned
          ? <button className="j-btn j-btn-lg" style={{ background: 'var(--card)', color: FREE_BLUE, border: `1.5px solid ${FREE_BLUE}` }} onClick={() => setConfirmFree(true)}>
              <Icon name="arrowLeft" size={20} color={FREE_BLUE} /> Switch back to Free
            </button>
          : <button className="j-btn j-btn-lg" style={{ background: FREE_BLUE, color: '#fff', boxShadow: '0 10px 22px -10px rgba(26,86,168,0.6)' }} onClick={() => goTo(1)}>
              See Jotla Plus <Icon name="arrowRight" size={20} color="#fff" />
            </button>
        )}
        {idx === 1 && (owned
          ? <button className="j-btn j-btn-lg" style={{ background: 'rgba(110,84,214,0.12)', color: PLUS_ACCENT_DEEP, border: `1.5px solid ${PLUS_ACCENT_DEEP}` }} onClick={() => nav.back()}>
              <Icon name="check" size={20} color={PLUS_ACCENT_DEEP} /> You have Jotla Plus
            </button>
          : <button className="j-btn j-btn-lg" style={{ background: PLUS_GRAD, color: '#fff', boxShadow: '0 14px 28px -10px rgba(60,42,114,0.6)' }} onClick={() => setConfirmPlus(true)}>
              <Icon name="star" size={18} color={PLUS_ACCENT} /> Get Jotla Plus, {PLUS_PRICE} {PLUS_PERIOD}
            </button>)}
        {idx === 2 && (
          <button className="j-btn j-btn-lg" disabled style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)', cursor: 'default' }}>
            <Icon name="clock" size={18} color="var(--muted)" /> Jotla AI is coming in 2027
          </button>
        )}
      </div>

      {/* confirm: switch up to Plus */}
      {confirmPlus && (
        <div className="j-sheet-scrim" onClick={() => setConfirmPlus(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: PLUS_GRAD,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="star" size={26} color={PLUS_ACCENT} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>You are about to switch to Jotla Plus</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              {PLUS_PRICE} {PLUS_PERIOD}. This turns on Patterns, the Month view, Deep Filtering, Dysregulation Mode, Photos and Videos on Notes, and the PDF Evidence Pack. Everything you have already saved stays exactly as it is, and it stays yours if your year ever ends.
            </p>
            <button className="j-btn j-btn-lg" style={{ background: PLUS_GRAD, color: '#fff', marginBottom: 10 }}
              onClick={() => { nav.buyPlus(); setConfirmPlus(false); setBought(true); }}>
              <Icon name="check" size={20} color="#fff" /> Confirm
            </button>
            <button className="j-btn j-btn-ghost" onClick={() => setConfirmPlus(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* confirm: switch back down to Free */}
      {confirmFree && (
        <div className="j-sheet-scrim" onClick={() => setConfirmFree(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--tint-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrowLeft" size={26} color={FREE_BLUE} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>Switch back to Free?</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Are you sure? The Plus tools will be put away and the app goes back to the Free experience. Your record, and everything in it, stays yours and untouched.
            </p>
            <button className="j-btn j-btn-lg" style={{ background: FREE_BLUE, color: '#fff', marginBottom: 10 }}
              onClick={() => { nav.dropPlus(); setConfirmFree(false); setDroppedFree(true); goTo(0); }}>
              <Icon name="check" size={20} color="#fff" /> Yes, switch to Free
            </button>
            <button className="j-btn j-btn-ghost" onClick={() => setConfirmFree(false)}>Keep Jotla Plus</button>
          </div>
        </div>
      )}

      {/* gentle confirmation after going back to Free */}
      {droppedFree && (
        <div className="j-sheet-scrim" onClick={() => setDroppedFree(false)}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--tint-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={26} color={FREE_BLUE} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 6 }}>You are on Free</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 18 }}>
              The app is back to the Free experience. You can switch to Jotla Plus again any time from here.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => setDroppedFree(false)}>Done</button>
          </div>
        </div>
      )}

      {bought && (
        <div className="j-sheet-scrim" onClick={() => { setBought(false); nav.back(); }}>
          <div onClick={e => e.stopPropagation()} className="j-sheet">
            <div className="j-sheet-grab" />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ width: 56, height: 56, borderRadius: '50%', background: PLUS_GRAD,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="star" size={26} color={PLUS_ACCENT} />
              </span>
            </div>
            <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 8 }}>You have Jotla Plus</h2>
            <p className="j-body" style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 20 }}>
              Thank you. Patterns, Deep Filtering, Dysregulation Mode, Photos and Videos on Notes, and the PDF Evidence Pack are switched on. Your record stays yours, always, whatever happens to your subscription.
            </p>
            <button className="j-btn j-btn-primary" onClick={() => { setBought(false); nav.back(); }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- The one information page (12 Jul 2026, sixth pass) ----------------
// The founder read the four info pages together and found them repeating the
// same promises, some verbatim (the on-device story was told in full four
// times, and two Settings rows opened the same page). His instruction: all
// informational content lives in the About section, each fact said once. So
// the mission, privacy and data-care pages fold into About Jotla below, and
// the three old pages are deleted (Supersession Law). Every claim stays
// checked against THIS build's own code (the web prototype), not the native
// app's: where the two builds genuinely differ (browser storage, a live
// restore, a live PDF pack, photos AND vault document files inside the export
// where the native app keeps files on the phone outside its export, videos
// never copied, the 2 MB pick-time cap) the copy says the web truth.

// The page shell: round blue Back, title and subtitle, then a scrolling
// column of blocks.
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
        <InfoP><span className="j-strong">Jotla by SEN Help.</span> Early test build {window.JOTLA_BUILD} (July 2026).</InfoP>
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
        <InfoP>Jotla Plus adds the tools to help you spot patterns and make your case: photos and videos kept with your notes, patterns and the Month view, deep filtering, Dysregulation Mode, and the PDF evidence pack. Family Sync, when it arrives, is part of Plus too. Plus is {PLUS_PRICE} {PLUS_PERIOD}, or {TERM_PRICE} {TERM_PERIOD}. It is paid up front, and there is no monthly plan.</InfoP>
        <InfoP><span className="j-strong">If your year ends, you keep everything.</span> Your record is never held to ransom. If Plus ends, for any reason at all, whether you cancel, let it lapse, or a card quietly expires, you lose nothing you have written. Every entry stays. Your full timeline stays. Plain keyword search stays. Raw export stays. You can still make the PDF of everything you have already logged. Appeal-deadline safety reminders keep coming, with or without a subscription. A subscription only ever switches off the paid tools. It never touches your history.</InfoP>
        <InfoP>Jotla AI is coming in 2027: {AI_PRICE} {PLUS_PERIOD}, with Jotla Plus included, so it is {AI_PRICE} in total and not one price on top of another.</InfoP>
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

function SettingsScreen({ nav, profile, entries = [], docs = [], binCount = 0 }) {
  const J = window.JOTLA;
  const childName = (profile && profile.name) || 'your child';
  const [backupMeta, setBackupMeta] = useStateB(() => {
    try { return JSON.parse(localStorage.getItem(BACKUP_META_KEY)) || null; } catch (e) { return null; }
  });
  const recordBytes = React.useMemo(recordSizeBytes, [entries, docs, backupMeta]);
  const exportDue = !backupMeta || !backupMeta.lastExportAt
    || (Date.now() - new Date(backupMeta.lastExportAt).getTime()) > 30 * 86400000;
  const FEEDBACK_HREF = 'mailto:hello@sen.help?subject=' + encodeURIComponent('Jotla prototype feedback')
    + '&body=' + encodeURIComponent('What I was trying to do:\n\nWhat I think, or what happened:\n\nWhich screen:\n\nMy phone / browser:\n');

  const feedbackCard = (
    <button className="j-press" onClick={() => { window.location.assign(FEEDBACK_HREF); }} style={{ width: '100%', textAlign: 'left',
      border: 'none', cursor: 'pointer', background: 'var(--tint-green)', borderRadius: 18, padding: 18, marginBottom: 20,
      display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--card)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="heart" size={22} color="var(--green)" />
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(17px * var(--tscale, 1))', color: 'var(--green-ink)' }}>Tell us what you think</span>
        <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 2 }}>This is an early test, and your feedback shapes it. Opens your email.</span>
      </span>
      <Icon name="chevronRight" size={18} color="var(--green-ink)" />
    </button>
  );
  const plusCard = (
    <>
      <SectionLabel>Jotla Plus</SectionLabel>
      <button className="j-press" onClick={() => nav.go('unlock')} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        background: PREMIUM_GRAD, borderRadius: 18, padding: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
        color: '#fff', boxShadow: '0 14px 30px -14px rgba(20,40,80,0.7)' }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(230,184,92,0.18)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={22} color={PREMIUM_GOLD} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(17px * var(--tscale, 1))', color: '#fff' }}>Patterns, filters and PDF pack</span>
          <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'rgba(255,255,255,0.78)', marginTop: 2 }}>
            {nav.plus ? 'Active. Your record is always yours.' : 'See what Plus adds. ' + PLUS_PRICE + ' ' + PLUS_PERIOD + '.'}</span>
        </span>
        {nav.plus
          ? <span className="j-pillbadge" style={{ background: 'rgba(230,184,92,0.22)', color: PREMIUM_GOLD }}>Active</span>
          : <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.8)" />}
      </button>
    </>
  );

  const exportData = () => {
    try {
      const payload = { app: 'Jotla', exportedAt: new Date().toISOString(), child: profile, entries, documents: docs };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'jotla-' + childName.replace(/\s+/g, '-').toLowerCase() + '-export.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      const meta = { lastExportAt: new Date().toISOString() };
      try { localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta)); } catch (e) {}
      setBackupMeta(meta);
    } catch (e) { alert('Sorry, the export could not be created on this device.'); }
  };
  const onImportFile = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { nav.importBackup(JSON.parse(r.result)); } catch (err) { alert('That file could not be read as a Jotla backup.'); } };
    r.readAsText(f);
  };

  return (
    <div className="j-screen">
      <div className="j-scroll j-fade">
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
          <TabTitle title="Settings" />

          {/* active profile */}
          <button className="j-card j-press" onClick={() => nav.editChild()} style={{ width: '100%', padding: 14, marginBottom: 20, display: 'flex',
            alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--line)' }}>
            <ChildAvatar profile={profile} size={48} />
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(18px * var(--tscale, 1))', color: 'var(--ink)' }}>{childName}</span>
              <span style={{ display: 'block', fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>Edit name, school, colour and avatar</span>
            </span>
            <Icon name="chevronRight" size={18} color="var(--faint)" />
          </button>

          {/* The upgrade card sits high only while there is a level to go up to.
              Once Plus is owned it moves to the bottom of Settings (and when the
              AI tier exists, that upsell will take this high slot). */}
          {!nav.plus && plusCard}

          <SectionLabel>Backup and export</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                background: exportDue ? '#F39C12' : 'var(--green)' }} />
              <span style={{ fontFamily: "'Outfit', system-ui", fontSize: 'calc(13.5px * var(--tscale, 1))', color: 'var(--muted)', lineHeight: 1.45 }}>
                {backupHealthLine(backupMeta)}
                {exportDue ? ' A copy every few weeks is good insurance.' : ''}
                {recordBytes > BACKUP_SIZE_SOFT_CAP
                  ? ' Your record is about ' + Math.round(recordBytes / 1048576) + ' MB. Big records can press against this browser\'s storage limit, so saved copies matter more now.'
                  : ''}
              </span>
            </div>
            {/* Where the record lives and the planned encrypted export both
                explain themselves on the About page now (founder consolidation,
                12 Jul 2026): this card keeps only the real actions. */}
            <SettingsRow icon={<Icon name="download" size={20} color="var(--blue)" />} title="Export my data"
              sub={'A plain copy of ' + childName + "'s whole record. Always free."} onClick={exportData}
              right={<span className="j-pillbadge" style={{ background: 'var(--tint-green)', color: 'var(--green-ink)' }}>Free</span>} />
            <label className="j-press" style={{ width: '100%', textAlign: 'left', border: 'none',
              background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px' }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="attach" size={20} color="var(--blue)" /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)' }}>Restore from an export</span>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>Bring back a record from an exported file.</span>
              </span>
              <Icon name="chevronRight" size={18} color="var(--faint)" />
              <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onImportFile} />
            </label>
          </div>

          <SectionLabel>Appearance</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="moon" size={20} color="var(--blue)" /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)' }}>Dark mode</span>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>Easier on the eyes at night.</span>
              </span>
              <Toggle on={nav.dark} onChange={() => nav.toggleDark()} label="Dark mode" />
            </div>
            {/* Text size: the whole app scales from this one dial (--tscale). The three
                sample "A"s stay fixed-size on purpose, so the choice reads even at Standard. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: '1px solid var(--line)' }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tint-blue)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 20, color: 'var(--blue)' }} aria-hidden="true">A</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', fontWeight: 500, color: 'var(--ink)' }}>Text size</span>
                <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--faint)', marginTop: 1 }}>Everything in the app follows it.</span>
              </span>
              <span role="radiogroup" aria-label="Text size" style={{ display: 'inline-flex', gap: 6 }}>
                {[{ v: 1, label: 'Standard text', fs: 14 }, { v: 1.12, label: 'Large text', fs: 17 }, { v: 1.25, label: 'Extra large text', fs: 20 }].map(o => {
                  const on = Math.abs((nav.tscale || 1) - o.v) < 0.01;
                  return (
                    <button key={o.v} role="radio" aria-checked={on} aria-label={o.label} onClick={() => nav.setTscale(o.v)}
                      className="j-press" style={{ width: 40, height: 40, borderRadius: 12, cursor: 'pointer',
                        border: on ? '1.5px solid var(--blue)' : '1.5px solid var(--chip-border)',
                        background: on ? 'var(--tint-blue)' : 'var(--chip-bg)',
                        color: on ? 'var(--blue)' : 'var(--muted)',
                        fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: o.fs,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>A</button>
                  );
                })}
              </span>
            </div>
          </div>

          {feedbackCard}

          {/* privacy reassurance: no account, local lock, plain trust copy */}
          <div style={{ background: 'var(--blue)', borderRadius: 18, padding: 20, marginBottom: 20, color: '#fff' }}>
            <Icon name="shield" size={26} color="#fff" style={{ marginBottom: 10 }} />
            <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 'calc(19px * var(--tscale, 1))', margin: '0 0 6px' }}>No account. Nothing leaves the phone.</p>
            <p style={{ fontSize: 'calc(15px * var(--tscale, 1))', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Jotla works without a login. Everything about your child stays on this device, behind your own lock. There is no cloud we can read, and we never receive or access your data.</p>
          </div>

          <SectionLabel>About</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <SettingsRow icon={<Icon name="hand" size={20} color="var(--blue)" />} title="Take the tour"
              sub="A one-minute walkthrough of the whole app." onClick={() => nav.go('tour')} />
            <SettingsRow icon={<Icon name="star" size={20} color="var(--blue)" />} title="About Jotla"
              sub="What it is, your privacy, where the record lives, what is coming." onClick={() => nav.go('infoabout')} last />
          </div>

          {/* The Bin sits right at the bottom (founder ask, 15 Jul 2026): a deleted
              log or document waits here 30 days before it clears itself. */}
          <SectionLabel>Bin</SectionLabel>
          <div className="j-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <SettingsRow icon={<Icon name="close" size={20} color="var(--blue)" />} title="Recently deleted"
              sub="Restore a deleted log or document, or empty the Bin." onClick={() => nav.go('bin')}
              right={binCount > 0 ? <span className="j-pillbadge" style={{ background: 'var(--tag-grey-bg)', color: 'var(--muted)' }}>{binCount}</span> : undefined} last />
          </div>

          {nav.plus && plusCard}

          <p className="j-meta" style={{ textAlign: 'center' }}>Jotla by SEN Help · Test build {window.JOTLA_BUILD}</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FindScreen, EvidenceScreen, AddDocScreen, DocScreen, UnlockScreen, SettingsScreen, InfoAboutScreen });
