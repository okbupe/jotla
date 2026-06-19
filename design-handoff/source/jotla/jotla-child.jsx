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
  const begin = () => { start.current = 0; raf.current = requestAnimationFrame(tick); };
  const cancel = (done) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null; start.current = 0; if (!done) setP(0);
  };
  return (
    <button
      onPointerDown={begin} onPointerUp={() => cancel(false)} onPointerLeave={() => cancel(false)} onPointerCancel={() => cancel(false)}
      style={{ position: 'relative', width: '100%', minHeight: 60, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: palette.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2, touchAction: 'none', WebkitTapHighlightColor: 'transparent',
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
  const [step, setStep] = useStateC('intro');   // intro | scene | emotion | more | done
  const [scene, setScene] = useStateC(null);
  const [emotion, setEmotion] = useStateC(null);
  const [rounds, setRounds] = useStateC(0);

  const exit = () => nav.home();

  const sceneColours = {
    classroom: '#E7F1EC', lunch: '#EAF1FB', playground: '#FBEFE6',
  };

  // shared big-question header
  const Q = ({ children }) => (
    <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 32, color: '#5a4326',
      textAlign: 'center', margin: '0 0 28px', lineHeight: 1.1 }}>{children}</p>
  );

  return (
    <div className="j-screen" style={{ background: CHILD_BG }}>
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
              <button onClick={() => setStep('scene')} className="j-press" style={{ width: '100%', minHeight: 72, borderRadius: 22,
                border: 'none', cursor: 'pointer', background: '#27AE60', color: '#fff', fontFamily: "'Cal Sans', system-ui",
                fontWeight: 500, fontSize: 24, boxShadow: '0 14px 28px -12px rgba(39,174,96,0.6)' }}>Start</button>
            </div>
          )}

          {step === 'scene' && (
            <div className="j-fade">
              <Q>Where?</Q>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {J.CHILD_SCENES.map(s => (
                  <button key={s.key} onClick={() => { setScene(s.key); setStep('emotion'); }} className="j-press"
                    style={{ display: 'flex', alignItems: 'center', gap: 18, minHeight: 96, borderRadius: 24, border: 'none',
                      cursor: 'pointer', background: sceneColours[s.key], padding: '0 20px', textAlign: 'left' }}>
                    <span style={{ width: 72, height: 72, borderRadius: 20, background: '#fff', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}><SceneIllo scene={s.key} size={56} /></span>
                    <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 26, color: '#5a4326' }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'emotion' && (
            <div className="j-fade">
              <Q>How did you feel?</Q>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {J.CHILD_EMOTIONS.map(em => (
                  <button key={em.key} onClick={() => { setEmotion(em.key); setStep('more'); }} className="j-press"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 8px',
                      minHeight: 132, borderRadius: 24, border: 'none', cursor: 'pointer', background: '#fff',
                      boxShadow: '0 8px 20px -14px rgba(120,90,50,0.5)' }}>
                    <Face mood={em.key} size={68} />
                    <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 21, color: '#5a4326' }}>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'more' && (
            <div className="j-fade" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                <Face mood="ok" size={112} bg="#FFE6B8" />
              </div>
              <Q>Anything else?</Q>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button onClick={() => { setRounds(r => r + 1); setScene(null); setEmotion(null); setStep(rounds >= 1 ? 'done' : 'scene'); }}
                  className="j-press" style={{ minHeight: 72, borderRadius: 22, border: '2px solid #E5C88A', cursor: 'pointer',
                    background: '#fff', color: '#5a4326', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 22 }}>Show another</button>
                <button onClick={() => setStep('done')} className="j-press" style={{ minHeight: 72, borderRadius: 22, border: 'none',
                  cursor: 'pointer', background: '#27AE60', color: '#fff', fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 22,
                  boxShadow: '0 14px 28px -12px rgba(39,174,96,0.6)' }}>All done</button>
              </div>
            </div>
          )}

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
            <button onClick={() => setStep('done')} style={{ background: 'none', border: 'none', cursor: 'pointer',
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
  const begin = () => { start.current = 0; raf.current = requestAnimationFrame(tick); };
  const stop = (done) => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; start.current = 0; if (!done) setP(0); };
  return (
    <button onPointerDown={begin} onPointerUp={() => stop(false)} onPointerLeave={() => stop(false)} onPointerCancel={() => stop(false)}
      style={{ position: 'relative', width: 'auto', height: 36, borderRadius: 999, border: '1.5px solid #ECD9B6', background: 'rgba(255,255,255,0.6)',
        overflow: 'hidden', cursor: 'pointer', touchAction: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 16px',
        WebkitTapHighlightColor: 'transparent' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: 'rgba(244,201,93,0.4)' }} />
      <span style={{ position: 'relative', fontFamily: "'Outfit', system-ui", fontSize: 12.5, fontWeight: 500, color: '#a98a5e', whiteSpace: 'nowrap' }}>Hold for grown-ups</span>
    </button>
  );
}

Object.assign(window, { ChildScreen, HoldButton, ChildExitPill });
