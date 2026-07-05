// jotla-child.jsx — Child mode (screens 9-10). Softer, warmer, bigger, fewer words.
// No path back into parent notes. Sells nothing. Leaving needs a held parent action.
const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

// Press-and-hold control. Calls onComplete after ~1.1s of holding.
function HoldButton({ label, sublabel, onComplete, tone = 'cream' }) {
  const [p, setP] = useStateC(0);
  const raf = useRefC(null);
  const start = useRefC(0);
  const DURATION = 1100;
  const palette = tone === 'cream'
    ? { bg: '#fff', ink: '#7a5a3a', fill: 'rgba(244,201,93,0.5)' }
    : { bg: 'rgba(255,255,255,0.18)', ink: 'rgba(255,255,255,0.85)', fill: 'rgba(255,255,255,0.3)' };

  const tick = (t) => {
    if (!start.current) start.current = t;
    const frac = Math.min(1, (t - start.current) / DURATION);
    setP(frac);
    if (frac >= 1) { cancel(true); onComplete(); }
    else raf.current = requestAnimationFrame(tick);
  };
  // Pointer capture keeps the hold alive if the finger drifts a little, and
  // user-select none stops a long press turning into a text highlight.
  const begin = (ev) => {
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    start.current = 0; raf.current = requestAnimationFrame(tick);
  };
  const cancel = (done) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null; start.current = 0; if (!done) setP(0);
  };
  return (
    <button
      onPointerDown={begin} onPointerUp={() => cancel(false)} onPointerLeave={() => cancel(false)} onPointerCancel={() => cancel(false)}
      onContextMenu={(ev) => ev.preventDefault()}
      style={{ position: 'relative', width: '100%', minHeight: 60, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: palette.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2, touchAction: 'none', WebkitTapHighlightColor: 'transparent',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        boxShadow: tone === 'cream' ? '0 6px 18px -12px rgba(120,90,50,0.5)' : 'none' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: palette.fill, transition: 'none' }} />
      <span style={{ position: 'relative', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 17, color: palette.ink }}>{label}</span>
      {sublabel && <span style={{ position: 'relative', fontSize: 12.5, color: palette.ink, opacity: 0.7 }}>{sublabel}</span>}
    </button>
  );
}

const CHILD_BG = '#FFF6EC';

function ChildScreen({ nav, profile }) {
  const J = window.JOTLA;
  const childName = (profile && profile.name) || 'Sam';
  // A fixed little journey through the day: classroom, lunch hall, playground, done.
  const scenes = J.CHILD_SCENES;
  const [step, setStep] = useStateC('intro');   // intro | journey | done
  const [idx, setIdx] = useStateC(0);           // which scene of the journey
  const [sel, setSel] = useStateC(null);        // emotion picked on the current scene
  const [picks, setPicks] = useStateC([]);
  const savedRef = useRefC(false);

  const exit = () => nav.home();

  // The child's picks become a real entry in the record (previously they were discarded).
  const finishDone = (finalPicks) => {
    const picksNow = finalPicks || picks;
    if (!savedRef.current && picksNow.length) {
      savedRef.current = true;
      const sceneLabel = k => { const s = J.CHILD_SCENES.find(x => x.key === k); return s ? s.label.toLowerCase() : 'school'; };
      const emoLabel = k => { const em = J.CHILD_EMOTIONS.find(x => x.key === k); return em ? em.label.toLowerCase() : k; };
      const keys = picksNow.map(p => p.emotion);
      const mood = keys.some(k => ['sad', 'worried', 'angry'].includes(k)) ? 'hard' : keys.every(k => k === 'happy') ? 'good' : 'ok';
      const now = new Date();
      nav.addEntry({
        id: 'cm' + Date.now(), date: J.TODAY_ISO,
        time: now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening',
        clock: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
        setting: 'School', category: 'Other', mood,
        kind: 'contemporaneous', type: 'quick', childMode: true,
        summary: childName + ' shared their day in child mode: ' + picksNow.map(p => 'felt ' + emoLabel(p.emotion) + ' in the ' + sceneLabel(p.scene)).join('; ') + '.',
      });
    }
    setStep('done');
  };

  // one scene done: keep the pick and walk on to the next place (or finish)
  const continueOn = () => {
    if (!sel) return;
    const next = [...picks, { scene: scenes[idx].key, emotion: sel }];
    setPicks(next); setSel(null);
    if (idx >= scenes.length - 1) finishDone(next);
    else setIdx(idx + 1);
  };

  const sceneColours = {
    classroom: '#E7F1EC', lunch: '#EAF1FB', playground: '#FBEFE6',
  };

  // shared big-question header
  const Q = ({ children }) => (
    <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 32, color: '#5a4326',
      textAlign: 'center', margin: '0 0 28px', lineHeight: 1.1 }}>{children}</p>
  );

  return (
    <div className="j-screen" style={{ background: CHILD_BG, userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* quiet grown-up exit, always available */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px 0' }}>
        <ChildExitPill onComplete={exit} />
      </div>

      <div className="j-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '8px 24px 28px', minHeight: 560 }}>

          {step === 'intro' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                <Face mood="happy" size={140} bg="#FFE6B8" />
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 36, color: '#5a4326', margin: '0 0 8px' }}>Your day</p>
              <p style={{ fontSize: 18, color: '#8a6f4e', margin: '0 0 32px' }}>Hi {childName}. Want to show me?</p>
              <button onClick={() => setStep('journey')} className="j-press" style={{ width: '100%', minHeight: 72, borderRadius: 22,
                border: 'none', cursor: 'pointer', background: '#27AE60', color: '#fff', fontFamily: "'Cal Sans', system-ui",
                fontWeight: 500, fontSize: 24, boxShadow: '0 14px 28px -12px rgba(39,174,96,0.6)' }}>Start</button>
            </div>
          )}

          {step === 'journey' && (() => {
            const s = scenes[idx];
            return (
              <div className="j-fade" key={s.key}>
                {/* where we are on the walk */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 18 }}>
                  {scenes.map((x, i) => (
                    <span key={x.key} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 99, transition: 'all .2s ease',
                      background: i < idx ? '#27AE60' : i === idx ? '#E5A93D' : '#EAD9B8' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 24,
                  background: sceneColours[s.key], padding: '14px 18px', marginBottom: 22 }}>
                  <span style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SceneIllo scene={s.key} size={50} /></span>
                  <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 27, color: '#5a4326' }}>{s.label}</span>
                </div>
                <Q>How did you feel here?</Q>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {J.CHILD_EMOTIONS.map(em => {
                    const on = sel === em.key;
                    return (
                      <button key={em.key} onClick={() => setSel(em.key)} className="j-press"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 8px',
                          minHeight: 124, borderRadius: 24, cursor: 'pointer', background: '#fff',
                          border: on ? '3px solid #27AE60' : '3px solid transparent',
                          boxShadow: on ? '0 10px 24px -12px rgba(39,174,96,0.55)' : '0 8px 20px -14px rgba(120,90,50,0.5)' }}>
                        <Face mood={em.key} size={62} />
                        <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 20, color: '#5a4326' }}>{em.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* the only way on is forward: Continue appears once a face is picked */}
                <button onClick={continueOn} className="j-press" disabled={!sel}
                  style={{ width: '100%', minHeight: 66, borderRadius: 22, border: 'none', marginTop: 20,
                    cursor: sel ? 'pointer' : 'default', background: sel ? '#27AE60' : '#EDE0C8',
                    color: sel ? '#fff' : '#C4AC85', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 22,
                    boxShadow: sel ? '0 14px 28px -12px rgba(39,174,96,0.6)' : 'none', transition: 'all .18s ease' }}>
                  Continue</button>
              </div>
            );
          })()}

          {step === 'done' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', marginBottom: 24 }}>
                {/* gentle colour wash, no confetti, no sound */}
                <span style={{ position: 'absolute', inset: '-30px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(39,174,96,0.16), rgba(39,174,96,0) 70%)' }} />
                <span style={{ position: 'relative' }}><Face mood="happy" size={150} bg="#FFE6B8" /></span>
                {/* soft tick */}
                <span style={{ position: 'absolute', right: 4, bottom: 4, width: 48, height: 48, borderRadius: '50%',
                  background: '#27AE60', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 18px -8px rgba(39,174,96,0.6)', border: '3px solid #FFF6EC' }}>
                  <Icon name="check" size={24} color="#fff" stroke={2.6} />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 34, color: '#5a4326', margin: '0 0 8px' }}>All done</p>
              <p style={{ fontSize: 19, color: '#8a6f4e', margin: '0 0 40px' }}>Thank you, {childName}.</p>
              <HoldButton label="Give the phone back" sublabel="Press and hold" onComplete={exit} />
            </div>
          )}
        </div>

        {/* quiet skip, single tap, never sells */}
        {step !== 'done' && step !== 'intro' && (
          <div style={{ textAlign: 'center', paddingBottom: 22 }}>
            <button onClick={() => finishDone()} style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', system-ui", fontSize: 15, color: '#b79a72', fontWeight: 500 }}>Skip</button>
          </div>
        )}
      </div>
    </div>
  );
}

// small held pill at top to hand back to a grown-up
function ChildExitPill({ onComplete }) {
  const [p, setP] = useStateC(0);
  const raf = useRefC(null); const start = useRefC(0);
  const DURATION = 1000;
  const tick = (t) => {
    if (!start.current) start.current = t;
    const frac = Math.min(1, (t - start.current) / DURATION);
    setP(frac);
    if (frac >= 1) { stop(true); onComplete(); } else raf.current = requestAnimationFrame(tick);
  };
  const begin = (ev) => {
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
    start.current = 0; raf.current = requestAnimationFrame(tick);
  };
  const stop = (done) => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; start.current = 0; if (!done) setP(0); };
  return (
    <button onPointerDown={begin} onPointerUp={() => stop(false)} onPointerLeave={() => stop(false)} onPointerCancel={() => stop(false)}
      onContextMenu={(ev) => ev.preventDefault()}
      style={{ position: 'relative', width: 'auto', height: 36, borderRadius: 999, border: '1.5px solid #ECD9B6', background: 'rgba(255,255,255,0.6)',
        overflow: 'hidden', cursor: 'pointer', touchAction: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 16px',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: 'rgba(244,201,93,0.4)' }} />
      <span style={{ position: 'relative', fontFamily: "'Outfit', system-ui", fontSize: 12.5, fontWeight: 500, color: '#a98a5e', whiteSpace: 'nowrap' }}>Hold for grown-ups</span>
    </button>
  );
}

Object.assign(window, { ChildScreen, HoldButton, ChildExitPill });
