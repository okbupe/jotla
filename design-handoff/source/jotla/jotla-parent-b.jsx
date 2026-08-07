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
  // The search field hides behind the corner magnifier (founder, 7 Aug): the
  // title row carries a bare search icon top right; tapping it summons the field.
  const [showQ, setShowQ] = useStateB(!!saved.q);
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
          {/* DECLUTTER (founder, 4 Aug 2026; mirrored from native FindScreen):
              "Search across everything you have noted." is gone. The screen was
              explaining itself four times over: a title reading Find, this line,
              a magnifying glass, and the field's own "Search your notes"
              placeholder, which is the one that survives because it sits inside
              the thing it describes. */}
          <TabTitle title="Find" right={
            <button className="j-iconbtn" aria-label="Search your notes" onClick={() => setShowQ(v => { if (v) setQ(''); return !v; })}>
              <Icon name="search" size={22} color={showQ ? 'var(--blue)' : 'var(--muted)'} />
            </button>} />

          {/* the field appears when the corner magnifier is tapped */}
          {showQ && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card-2)', border: '1.5px solid var(--chip-border)',
              borderRadius: 14, padding: '0 14px', height: 52, marginBottom: 16 }}>
              <Icon name="search" size={20} color="var(--faint)" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search your notes" autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Outfit', system-ui", fontSize: 'calc(16px * var(--tscale, 1))', color: 'var(--ink)', background: 'transparent' }} />
            </div>
          )}

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
            <PlusLockedCard onClick={() => nav.go('unlock')} style={{ marginBottom: 18 }} icon="filter"
              title="Filters" text={<>Theme, mood, place and dates.<br />Keyword search is always free.</>} />
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
          {/* colour-coded type pill (6 Aug): Plan blue, Letter amber, Email green, the rest quiet grey */}
          <span className={'j-tag ' + ({ Plan: 'j-tag-plan', Letter: 'j-tag-letter', Email: 'j-tag-email' }[doc.type] || 'j-tag-grey')}>{doc.type}</span>
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
  // lands the parent back on the Documents list where they left it.
  const saved = (navView && navView.ev) || {};
  const [view, setView] = useStateB(saved.tab || 'documents'); // documents leads (founder, 6 Aug)
  // Corner search (founder, 7 Aug): the magnifier sits top right and summons a
  // field that filters the document list by title, sender or type.
  const [docQ, setDocQ] = useStateB('');
  const [showDocQ, setShowDocQ] = useStateB(false);
  const docsShown = docQ.trim()
    ? docs.filter(d => (d.title + ' ' + d.from + ' ' + d.type).toLowerCase().includes(docQ.trim().toLowerCase()))
    : docs;
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
      {/* Documents is a TAB now (6 Aug): its own big title, no back, no subtitle,
          and the old green banner is gone: both explained a screen that already
          shows what it is. */}
      <div className="j-scroll j-fade" ref={scrollRef}>
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
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
                {/* the add affordance is a dashed row under the list (6 Aug), not a bottom bar */}
                <button className="j-press" onClick={() => nav.go('adddoc')}
                  style={{ border: '1px dashed var(--chip-border)', background: 'none', borderRadius: 14, padding: '13px 16px',
                    display: 'flex', alignItems: 'center', gap: 12, color: 'var(--blue)', cursor: 'pointer',
                    fontFamily: "'Outfit', system-ui", fontWeight: 500, fontSize: 'calc(15.5px * var(--tscale, 1))' }}>
                  <Icon name="plus" size={20} color="var(--blue)" stroke={2.2} /> Add a document
                </button>
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
          <PlusLockedCard icon="attach" title="Add the document itself" text="Keep the letter with its details. Part of Plus."
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

// The money model (decisions/log.md, 2026-08-06, Bupe's money gate; supersedes
// the 14 Jul annual-only rule):
//   Free      £0 forever.
//   Plus      £29 for 1 month, £49 for 6 months, £79 for a year (Best value).
//             The £29 month is the anchor: two months (£58) already beats the
//             6-month term, so the monthly door cannot be gamed. Family Sync is
//             inside Plus and sells as launch-state (decisions 2026-08-06).
//   Jotla AI  coming 2027, INDICATIVE ladder £59 / £99 / £149 with Plus
//             included (£149 in total, not £79 + £149). Visible on the paywall
//             with no buy button until it exists.
// There is no one-time price and no lifetime buyout of any kind. The old
// buy-once copy (pay once, yours to keep, no subscription, no timers) is
// retired with it and must not come back.
const MONTH_PRICE = '£29';
const PLUS_PRICE = '£79';
const PLUS_PERIOD = 'a year';
const TERM_PRICE = '£49';
const TERM_PERIOD = 'for 6 months';
const AI_PRICE = '£149';

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
// the honest-marketing lock. Pricing decided 6 Aug: £29 / £49 / £79, and the
// indicative AI ladder £59 / £99 / £149 with Plus included.
const PLUS_SLIDES = [
  { t: 'Patterns and Month View', c: 'A calendar of green and amber days. Tap any day to read what happened behind it.', img: 'art/plus-1.jpg' },
  { t: 'PDF Evidence Pack', c: 'Turn any stretch of the record into one dated PDF, ready to hand over.', img: 'art/plus-2.jpg' },
  { t: 'Family Sync', c: "The record on every grown-up's phone. One of you logs it, both of you have it.", img: 'art/plus-3.jpg' },
  { t: 'Photos and Videos on Notes', c: 'Add the photo or the video to the note, so the day is shown as well as told.', img: 'art/plus-4.jpg' },
  { t: 'Dysregulation Mode', c: 'Five gentle questions in the hard moment, so nothing important is lost.', img: 'art/plus-5.jpg' },
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

function UnlockScreen({ nav }) {
  const [tier, setTier] = useStateB('plus'); // plus | ai
  const [slide, setSlide] = useStateB(0);
  const slides = tier === 'ai' ? AI_SLIDES : PLUS_SLIDES;
  const s = slides[Math.min(slide, slides.length - 1)];
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
        <div className="j-pad" style={{ paddingTop: 12, paddingBottom: 30, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

          {/* header: crown disc, the tier selector, X */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: PLUS_GRAD, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -6px rgba(60,42,114,0.5)' }}>
              <Icon name="crown" size={18} color="#EBBA4D" />
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 4, padding: 3, borderRadius: 999, background: 'var(--tag-grey-bg)' }}>
              {seg('plus', 'Jotla Plus')}{seg('ai', 'Jotla AI')}
            </div>
            <button onClick={() => nav.back()} aria-label="Close" className="j-press" style={{ width: 44, height: 44, marginRight: -10,
              border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={22} color="var(--muted)" />
            </button>
          </div>

          {/* the wordmark lockup and carousel float centred in the middle space */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, padding: '14px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <h1 style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 400, fontSize: 'calc(31px * var(--tscale, 1))', color: 'var(--ink)', margin: 0 }}>
                Jotla {tier === 'ai'
                  ? <em style={{ fontStyle: 'italic', color: 'var(--aigold)', fontSize: 'calc(20px * var(--tscale, 1))', position: 'relative', top: -7 }}>AI</em>
                  : <em style={{ fontStyle: 'italic', color: 'var(--plus-ink)', fontSize: 'calc(20px * var(--tscale, 1))', position: 'relative', top: -7 }}>+Plus</em>}
              </h1>
              <p className="j-sm" style={{ marginTop: 6, lineHeight: 1.4 }}>
                {tier === 'ai' ? <>The deadlines, the rights and the letters,<br />kept current on your side.</>
                  : <>The tools to spot patterns<br />and make your case.</>}
              </p>
            </div>

            <div style={{ width: 300, maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
              <img src={s.img} alt="" style={{ width: '100%', height: 158, objectFit: 'cover', borderRadius: 12, display: 'block', background: 'var(--tag-grey-bg)' }} />
              <p style={{ fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(15.5px * var(--tscale, 1))', color: 'var(--ink)', margin: '11px 0 0' }}>{s.t}</p>
              <p style={{ fontSize: 'calc(13px * var(--tscale, 1))', color: 'var(--muted)', lineHeight: 1.45, margin: '4px 0 0' }}>{s.c}</p>
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
                  <TermCard label="1 Month" price="£29" per="a month" />
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
                  Plus renews automatically at the end of its term: £29 a month, £49 every 6 months or £79 a year, charged to your Google Play
                  account until you cancel. Cancel any time in Subscriptions on Google Play, at least 24 hours before the term ends, and Plus
                  stays on until the day it runs out. A subscription only ever switches off the paid tools.
                </p>
              </div>
            )
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 10 }}>
                <TermCard label="1 Month" price="£59" per="a month" gold />
                <TermCard label="6 Months" price="£99" per="for 6 months" gold />
                <TermCard label="One Year" price="£149" per={<>less than<br />£13 a month</>} sel gold badge="Best value" />
              </div>
              <button className="j-btn j-btn-lg" onClick={() => alert('Jotla AI arrives in 2027. Nothing is charged before it exists.')}
                style={{ marginTop: 12, background: 'linear-gradient(135deg,#14294A,#1E5099)', color: '#fff',
                  boxShadow: '0 14px 28px -10px rgba(20,41,74,0.6)' }}>
                <Icon name="sparkle" size={20} color="#E6B85C" /> Get Jotla AI
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--blue)',
                fontSize: 'calc(13px * var(--tscale, 1))', fontWeight: 500, margin: '10px 0 0' }}>
                <Icon name="check" size={15} color="var(--blue)" stroke={2.2} /> Jotla Plus is included in every term.
              </p>
              <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 'calc(11.5px * var(--tscale, 1))', lineHeight: 1.45, margin: '8px 0 0' }}>
                Jotla AI arrives in 2027 and renews automatically at the end of its term: £59 a month, £99 every 6 months or £149 a year,
                charged to your Google Play account until you cancel. Cancel any time in Subscriptions on Google Play, at least 24 hours
                before the term ends. One price with Plus included, never one on top of another, and a subscription only ever switches off
                the paid tools.
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
        <InfoP>Jotla Plus adds the tools to help you spot patterns and make your case: photos and videos kept with your notes, patterns and the Month view, deep filtering, Dysregulation Mode, and the PDF evidence pack. Family Sync, when it arrives, is part of Plus too. Plus is {MONTH_PRICE} for 1 month, {TERM_PRICE} {TERM_PERIOD} or {PLUS_PRICE} for a year, through Google Play, and it stays on until the day a term runs out.</InfoP>
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
function MRow({ icon, iconEl, title, sub, onClick, trailing, danger, style }) {
  return (
    <button className="j-card j-press" onClick={onClick} style={{ width: '100%', textAlign: 'left',
      cursor: onClick ? 'pointer' : 'default', padding: '14px 16px', display: 'flex', gap: 14,
      alignItems: 'center', marginBottom: 10, ...(style || {}) }}>
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
            alignItems: 'center', gap: 12, padding: '13px 2px', background: 'none', border: 'none',
            borderBottom: i < options.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: '2px solid ' + (activeKey === o.key ? 'var(--blue)' : 'var(--faint)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeKey === o.key && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue)' }} />}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 500, color: 'var(--ink)',
                fontSize: o.size || 'calc(15.5px * var(--tscale, 1))' }}>{o.label}</span>
              {o.sub && <span style={{ display: 'block', fontSize: 'calc(12.5px * var(--tscale, 1))', color: 'var(--muted)', marginTop: 1 }}>{o.sub}</span>}
            </span>
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
        <div className="j-pad" style={{ paddingTop: 14, paddingBottom: 120 }}>
          {/* the title IS the child; the cog opens Settings (the Todoist pattern) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <button className="j-press" onClick={() => nav.go('childprofile')} aria-label={'Open ' + profile.name + "'s profile"}
              style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              <ChildAvatar profile={profile} size={36} />
              <h1 className="j-h1" style={{ fontSize: 'calc(26px * var(--tscale, 1))' }}>{profile.name}</h1>
            </button>
            <button className="j-iconbtn" aria-label="Settings" onClick={() => nav.go('appsettings')}>
              <Icon name="settings" size={23} color="var(--muted)" />
            </button>
          </div>

          {/* Jotla Plus: the one unique surface, the paywall's own gradient with
              the solid gold crown (the app's only solid icon, its only gold) */}
          <button className="j-press" onClick={() => nav.go('unlock')} style={{ width: '100%', textAlign: 'left', border: 'none',
            cursor: 'pointer', background: PLUS_GRAD, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center',
            gap: 14, boxShadow: '0 10px 22px -8px rgba(38,24,84,0.5)', marginBottom: 14 }}>
            <Icon name="crown" size={28} color="#EBBA4D" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: "'Outfit', system-ui", fontWeight: 600, fontSize: 'calc(16.5px * var(--tscale, 1))', color: '#fff' }}>Jotla Plus</span>
              <span style={{ display: 'block', fontSize: 'calc(13px * var(--tscale, 1))', color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>
                {nav.plus ? 'Active. Your record is always yours.' : 'Get the best experience.'}</span>
            </span>
          </button>

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

// ---------------- SETTINGS (behind the cog) ----------------
function AppSettingsScreen({ nav }) {
  const J = window.JOTLA;
  const [sheet, setSheet] = useStateB(null); // null | 'theme' | 'size' | 'reminder'
  const [customTime, setCustomTime] = useStateB('20:00');
  const [remCustom, setRemCustom] = useStateB(false);
  const themeLabel = nav.theme === 'system' ? 'System' : (nav.theme === 'dark' ? 'Dark' : 'Light');
  const sizeLabel = ({ '0.9': 'Small', '1': 'Standard', '1.12': 'Large', '1.25': 'Extra large' })[String(nav.tscale)] || 'Standard';
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

          <SectionLabel>Privacy</SectionLabel>
          <MRow icon="lock" title="App lock" sub={nav.appLock && nav.appLock.on ? 'On' : 'Off'} onClick={() => nav.go('applock')} />

          <SectionLabel>Reminders</SectionLabel>
          <MRow icon="bell" title="Daily reminder" sub={nav.reminder || 'Off'} onClick={() => { setRemCustom(false); setSheet('reminder'); }} />

          <SectionLabel>Help and about</SectionLabel>
          <MRow icon="play" title="Take the tour" onClick={() => nav.go('tour')} />
          <MRow icon="help" title="Help" onClick={() => nav.go('help')} />
          <MRow icon="info" title="About Jotla" onClick={() => nav.go('infoabout')} />
          <MRow icon="heart" title="Tell us what you think" onClick={() => window.location.assign(FEEDBACK_HREF)} />

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
  const colourKey = (fig) => { const c = (J.AVATAR_COLOURS || []).find(x => x.figure === fig); return c ? c.key.charAt(0).toUpperCase() + c.key.slice(1) : 'Sky'; };
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
          <MRow icon="restart" danger title="Reset this child" sub={'Clear all logs and documents, keep ' + profile.name + "'s profile"}
            onClick={() => setDangerMode('reset')} />
          {canDelete && <MRow icon="trash" danger title="Delete this child" sub={'Permanently remove ' + profile.name + "'s record"}
            onClick={() => setDangerMode('delete')} />}
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
  const crown = <Icon name="crown" size={20} color="var(--gold)" style={{ flexShrink: 0 }} />;
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
    ['What does Plus cost?', '£29 for 1 month, £49 for 6 months or £79 for a year, through Google Play.'],
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
  AppSettingsScreen, ChildrenScreen, ChildProfileScreen, AppLockScreen, BackupScreen, HelpScreen, SupportScreen, MRow, RadioSheet });
