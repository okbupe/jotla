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
  // A fixed little journey through the day, staged like a story: meet each
  // place, pick a face, the face comes alive in the middle, walk on.
  const scenes = J.CHILD_SCENES;
  const [step, setStep] = useStateC('intro');   // intro | scene | pick | confirm | done
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

  // pick a face -> it takes centre stage; Next walks on to the following place
  const pickFace = (key) => {
    setSel(key);
    setPicks(ps => [...ps, { scene: scenes[idx].key, emotion: key }]);
    setStep('confirm');
  };
  const confirmNext = () => {
    if (idx >= scenes.length - 1) { finishDone(); return; }
    setIdx(idx + 1); setSel(null); setStep('scene');
  };
  const SCENE_LINES = ["Let's start with the classroom.", 'Now on to the lunch hall.', 'And finally, the playground.'];

  const sceneColours = {
    classroom: '#E7F1EC', lunch: '#EAF1FB', playground: '#FBEFE6',
  };

  // shared big-question header
  const Q = ({ children }) => (
    <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 32, color: '#5a4326',
      textAlign: 'center', margin: '0 0 28px', lineHeight: 1.1 }}>{children}</p>
  );
  // the one green pill button the whole journey runs on
  const PillBtn = ({ children, onClick }) => (
    <button onClick={onClick} className="j-press" style={{ minWidth: 220, minHeight: 62, borderRadius: 999, border: 'none',
      cursor: 'pointer', background: '#27AE60', color: '#fff', fontFamily: "'Cal Sans', system-ui", fontWeight: 500,
      fontSize: 22, boxShadow: '0 14px 28px -12px rgba(39,174,96,0.6)', padding: '0 36px' }}>{children}</button>
  );
  // where we are on the walk
  const Dots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
      {scenes.map((x, i) => (
        <span key={x.key} style={{ width: i === idx ? 20 : 8, height: 8, borderRadius: 99, transition: 'all .2s ease',
          background: i < idx ? '#27AE60' : i === idx ? '#E5A93D' : '#EAD9B8' }} />
      ))}
    </div>
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
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 36, color: '#5a4326', margin: '0 0 8px' }}>Hi {childName}</p>
              <p style={{ fontSize: 20, color: '#8a6f4e', margin: '0 0 34px' }}>How was your day?</p>
              <PillBtn onClick={() => { setIdx(0); setStep('scene'); }}>Start</PillBtn>
            </div>
          )}

          {step === 'scene' && (
            <div className="j-fade" key={'s' + idx} style={{ textAlign: 'center' }}>
              <Dots />
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <span style={{ width: 132, height: 132, borderRadius: 36, background: sceneColours[scenes[idx].key],
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SceneIllo scene={scenes[idx].key} size={94} />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 34, color: '#5a4326', margin: '0 0 8px' }}>{scenes[idx].label}</p>
              <p style={{ fontSize: 19, color: '#8a6f4e', margin: '0 0 32px' }}>{SCENE_LINES[idx]}</p>
              <PillBtn onClick={() => setStep('pick')}>Next</PillBtn>
            </div>
          )}

          {step === 'pick' && (
            <div className="j-fade" key={'p' + idx} style={{ textAlign: 'center' }}>
              <Dots />
              <Q>How did you feel in the {scenes[idx].label.toLowerCase()}?</Q>
              {/* bare faces, no card borders: just the face and its word */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 26px' }}>
                {J.CHILD_EMOTIONS.map(em => (
                  <button key={em.key} onClick={() => pickFace(em.key)} className="j-press"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, width: '28%', minWidth: 94 }}>
                    <Face mood={em.key} size={88} />
                    <span style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 19, color: '#5a4326' }}>{em.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'confirm' && sel && (
            <div className="j-fade" key={'c' + idx} style={{ textAlign: 'center' }}>
              <Dots />
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                {sel === 'happy' && <ConfettiBurst />}
                <span className={'j-anim-' + sel} style={{ display: 'inline-flex' }}>
                  <Face mood={sel} size={150} bg="#FFE6B8" />
                </span>
              </div>
              <p style={{ fontFamily: "'Cal Sans', system-ui", fontWeight: 500, fontSize: 32, color: '#5a4326', margin: '0 0 8px', lineHeight: 1.1 }}>
                {idx >= scenes.length - 1 ? "That's everything!" : idx === scenes.length - 2 ? 'Ready for the last one?' : 'Ready for the next one?'}
              </p>
              <p style={{ fontSize: 18, color: '#8a6f4e', margin: '0 0 32px' }}>
                {(J.CHILD_EMOTIONS.find(e => e.key === sel) || {}).label} in the {scenes[idx].label.toLowerCase()}.
              </p>
              <PillBtn onClick={confirmNext}>{idx >= scenes.length - 1 ? 'Finish' : 'Next'}</PillBtn>
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
            <button onClick={() => finishDone()} style={{ background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit', system-ui", fontSize: 15, color: '#b79a72', fontWeight: 500 }}>Skip</button>
          </div>
        )}
      </div>
    </div>
  );
}

// A brief, gentle confetti burst for a happy pick: happiness is worth marking,
// so the good days become the ones the child wants to collect. Deterministic
// (no Math.random) and it falls once, then it is gone. No sound, ever.
function ConfettiBurst() {
  const COLORS = ['#F4C95D', '#27AE60', '#5B8DEF', '#E8749E', '#9B7BD8'];
  return (
    <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, width: 240, height: 170,
      transform: 'translateX(-50%)', pointerEvents: 'none', overflow: 'visible' }}>
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="j-confetti" style={{
          position: 'absolute', left: ((i * 37) % 96) + '%', top: -8 - ((i * 23) % 26),
          width: 7 + (i % 3) * 3, height: 10 + (i % 4) * 3, borderRadius: 3,
          background: COLORS[i % COLORS.length],
          animationDelay: ((i % 7) * 0.09) + 's',
          animationDuration: (1.1 + (i % 5) * 0.16) + 's',
        }} />
      ))}
    </span>
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
