// jotla-illustrations.jsx — original placeholder illustrations.
// Friendly rounded faces (not emoji), simple scene emblems, wordmark, mood dots.
// Built from basic shapes only. Exported to window.

const FACE_FILL = '#F4C95D';   // warm butter
const FACE_LINE = '#4A3D1E';   // soft dark brown features
const FACE_STROKE = 6;

// mood/emotion keys: happy, ok, sad, worried, angry  (good->happy, hard->sad aliases)
function Face({ mood = 'happy', size = 64, bg = 'transparent' }) {
  const m = mood === 'good' ? 'happy' : mood === 'hard' ? 'sad' : mood;
  const eyeY = 44;
  const eyebrows = {
    worried: <g stroke={FACE_LINE} strokeWidth="4.5" strokeLinecap="round">
      <line x1="26" y1="34" x2="42" y2="30" />
      <line x1="74" y1="34" x2="58" y2="30" />
    </g>,
    angry: <g stroke={FACE_LINE} strokeWidth="4.5" strokeLinecap="round">
      <line x1="26" y1="30" x2="42" y2="36" />
      <line x1="74" y1="30" x2="58" y2="36" />
    </g>,
  };
  const mouths = {
    happy:   <path d="M32 60 Q50 80 68 60" />,
    ok:      <path d="M35 66 H65" />,
    sad:     <path d="M33 71 Q50 56 67 71" />,
    worried: <path d="M40 68 Q50 62 60 68" />,
    angry:   <path d="M34 70 Q50 60 66 70" />,
  };
  const eyeR = m === 'worried' ? 5 : 6;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block' }}>
      {bg !== 'transparent' && <circle cx="50" cy="50" r="50" fill={bg} />}
      <circle cx="50" cy="50" r="44" fill={FACE_FILL} />
      {eyebrows[m] || null}
      <circle cx="36" cy={eyeY} r={eyeR} fill={FACE_LINE} />
      <circle cx="64" cy={eyeY} r={eyeR} fill={FACE_LINE} />
      <g fill="none" stroke={FACE_LINE} strokeWidth={FACE_STROKE} strokeLinecap="round">
        {mouths[m]}
      </g>
    </svg>
  );
}

// Solid mood dot for timeline / calendar
const MOOD_COLOURS = { good: '#27AE60', ok: '#F39C12', hard: '#E74C3C', none: '#CBD5E1' };
function MoodDot({ mood = 'good', size = 12, ring = false }) {
  const c = MOOD_COLOURS[mood] || MOOD_COLOURS.none;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: c, flexShrink: 0,
      boxShadow: ring ? `0 0 0 4px ${c}22` : 'none',
    }} />
  );
}

// Jotla logo (the supplied horizontal wordmark, ~2.78:1). Inlined so it always renders
// and recolours with the palette (var(--blue) in light, the bright blue in dark).
const JOTLA_LOGO_RATIO = 1747.5 / 627.55; // ~2.785
function JotlaLogo({ height = 28, color = '#1A56A8', style = {} }) {
  return (
    <svg height={height} width={Math.round(height * JOTLA_LOGO_RATIO)} viewBox="0 0 1747.5 627.55"
      fill={color} role="img" aria-label="Jotla" style={{ display: 'block', ...style }}>
      <path d="M1634.32,177.37l.12,20.94c-35.13-20.71-75.42-31.08-120.9-31.08s-85.31,10.43-120.78,31.25c-35.47,20.84-63.21,48.71-83.2,83.62-19.99,34.92-29.98,73.48-29.98,115.71s9.99,80.66,29.98,115.29c19.98,34.63,47.72,62.37,83.2,83.2,35.47,20.82,75.73,31.25,120.78,31.25s86.01-10.43,121.2-31.25c.67-.4,1.32-.81,1.99-1.22l.12,21.49h110.65V177.37h-113.18ZM1618.69,460.32c-9.86,19.15-23.79,34.5-41.81,46.03-18.03,11.55-39.14,17.31-63.35,17.31s-45.33-5.77-63.35-17.31c-18.03-11.53-31.96-26.88-41.81-46.03-9.86-19.14-14.78-39.97-14.78-62.5s4.92-44.2,14.78-63.35c9.84-19.14,23.78-34.48,41.81-46.03,18.01-11.53,39.13-17.31,63.35-17.31s45.32,5.78,63.35,17.31c18.01,11.55,31.95,26.9,41.81,46.03,9.85,19.15,14.78,40.26,14.78,63.35s-4.94,43.37-14.78,62.5Z" />
      <path d="M1113.19,616.58V0h114.02v616.58h-114.02Z" />
      <path d="M1002.55,616.58c-43.37,0-76.58-10.69-99.67-32.1-23.1-21.39-34.63-56.02-34.63-103.89v-206.09h-61.66v-97.13h61.66v-88.69l114.02-11.82v100.51h92.91v97.13h-92.91v200.18c0,27.03,11.82,40.54,35.47,40.54h47.3v101.35h-62.5Z" />
      <path d="M575.18,627.55c-45.06,0-85.31-10.43-120.78-31.25-35.47-20.83-63.21-48.57-83.2-83.2-19.99-34.63-29.98-73.06-29.98-115.29s9.99-80.79,29.98-115.71c19.98-34.91,47.72-62.78,83.2-83.62,35.47-20.83,75.73-31.25,120.78-31.25s86.01,10.43,121.2,31.25c35.18,20.84,62.78,48.71,82.77,83.62,19.98,34.92,29.98,73.48,29.98,115.71s-10,80.66-29.98,115.29c-19.99,34.63-47.59,62.37-82.77,83.2-35.2,20.82-75.59,31.25-121.2,31.25ZM575.18,523.67c24.2,0,45.32-5.77,63.35-17.31,18.01-11.53,31.95-26.88,41.81-46.03,9.85-19.14,14.78-39.97,14.78-62.5s-4.94-44.2-14.78-63.35c-9.86-19.14-23.79-34.48-41.81-46.03-18.03-11.53-39.14-17.31-63.35-17.31s-45.33,5.78-63.35,17.31c-18.03,11.55-31.96,26.9-41.81,46.03-9.86,19.15-14.78,40.26-14.78,63.35s4.92,43.37,14.78,62.5c9.84,19.15,23.78,34.5,41.81,46.03,18.01,11.55,39.13,17.31,63.35,17.31Z" />
      <path d="M114.87,625.87c-23.1,0-45.06-1.98-65.88-5.91-20.84-3.93-37.16-9.57-48.99-16.89l44.77-97.13c12.38,9.01,30.41,13.51,54.06,13.51,19.7,0,36.17-4.92,49.41-14.78,13.22-9.84,19.85-26.32,19.85-49.41V25.34h118.25v434.14c0,38.3-7.47,69.68-22.38,94.18-14.93,24.5-35.2,42.65-60.81,54.48-25.63,11.82-55.05,17.74-88.26,17.74Z" />
    </svg>
  );
}

// Header lockup: the Jotla logo + the quiet "by SEN Help" sub-label.
// Sized to keep the same footprint as the old text wordmark so the header does not shift.
function Wordmark({ size = 30, color = '#1A56A8', sub = true, subColor, plus = false, plusColor = '#6E54D6' }) {
  const logoH = Math.round(size * 0.8);
  const drop = Math.round(logoH * 0.167); // the J descender hangs below the lowercase baseline
  const plusBase = logoH * 0.5;           // +PLUS cap height ≈ half the logo height
  const gapLogo = Math.round(logoH * 0.18); // +PLUS rides close to the logo
  const gapSub = Math.round(logoH * 0.37);  // original logo→sub distance, preserved
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 0 }}>
      <JotlaLogo height={logoH} color={color} style={{ marginBottom: -drop }} />
      {plus && (
        <span style={{ marginLeft: gapLogo, marginRight: gapSub, alignSelf: 'flex-start', display: 'inline-flex', position: 'relative', top: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline',
            fontFamily: "'Cal Sans', system-ui", fontWeight: 900,
            transform: 'skewX(-8deg)', transformOrigin: 'left bottom',
            letterSpacing: '0.12em', textTransform: 'uppercase', color: plusColor, lineHeight: 1,
          }}>
            <span style={{ fontSize: Math.round(plusBase * 1.18), marginRight: '0.04em' }}>+</span>
            <span style={{ fontSize: Math.round(plusBase) }}>PLUS</span>
          </span>
        </span>
      )}
      {sub && <span style={{
        fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: size * 0.42,
        color: subColor || 'rgba(15,23,42,0.45)', letterSpacing: '0.01em', whiteSpace: 'nowrap',
        marginLeft: plus ? 0 : gapSub,
      }}>by SEN Help</span>}
    </span>
  );
}

// Tint helper: a translucent version of a hex colour, so a disc adapts to light or dark behind it.
function jHexA(hex, a) {
  let h = (hex || '#3A7BD4').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Child avatar: a simple line-art glyph (person / heart / star / leaf) in the chosen brand hue.
// The disc is a translucent tint of that hue, so it follows light and dark mode automatically.
function ChildAvatar({ profile, size = 44, ring = true, style = {} }) {
  const line = (profile && profile.figure) || '#3A7BD4';
  const glyph = (profile && profile.glyph) || 'person';
  const photo = profile && profile.photo;
  if (photo) {
    return (
      <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'block',
        boxShadow: ring ? `inset 0 0 0 1.5px ${jHexA(line, 0.3)}` : 'none', ...style }}>
        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </span>
    );
  }
  const inner = glyph === 'person' ? (
      <svg width={Math.round(size * 0.6)} height={Math.round(size * 0.6)} viewBox="0 0 24 24" fill="none"
        stroke={line} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'block' }}>
        <circle cx="12" cy="8.6" r="3.7" />
        <path d="M5.5 19.5 C5.5 14.8 18.5 14.8 18.5 19.5" />
      </svg>
    ) : <Icon name={glyph} size={Math.round(size * 0.52)} color={line} stroke={1.9} />;
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: jHexA(line, 0.18), flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      boxShadow: ring ? `inset 0 0 0 1.5px ${jHexA(line, 0.3)}` : 'none', ...style }}>
      {inner}
    </span>
  );
}

// Scene emblems for child mode — simple friendly shapes on a soft disc
function SceneIllo({ scene = 'classroom', size = 96 }) {
  const emblems = {
    classroom: (
      <g>
        <rect x="22" y="26" width="56" height="38" rx="6" fill="#2E7D5B" />
        <rect x="22" y="26" width="56" height="38" rx="6" fill="none" stroke="#fff" strokeWidth="3" />
        <line x1="31" y1="38" x2="58" y2="38" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <line x1="31" y1="46" x2="64" y2="46" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <line x1="31" y1="54" x2="50" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <rect x="46" y="64" width="8" height="10" rx="2" fill="#8a5a2b" />
      </g>
    ),
    lunch: (
      <g>
        <circle cx="50" cy="50" r="24" fill="#fff" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="#1A56A8" strokeWidth="3" />
        <circle cx="50" cy="50" r="12" fill="#3A7BD4" opacity="0.25" />
        <rect x="20" y="34" width="4" height="32" rx="2" fill="#5B4636" />
        <rect x="76" y="34" width="4" height="32" rx="2" fill="#5B4636" />
        <rect x="74" y="34" width="8" height="4" rx="2" fill="#5B4636" />
      </g>
    ),
    playground: (
      <g>
        <circle cx="38" cy="34" r="12" fill="#F4C95D" />
        <g stroke="#F4C95D" strokeWidth="3" strokeLinecap="round">
          <line x1="38" y1="14" x2="38" y2="19" />
          <line x1="22" y1="34" x2="27" y2="34" />
          <line x1="24" y1="20" x2="28" y2="24" />
        </g>
        <path d="M58 30 L58 64 L80 64" fill="none" stroke="#E74C3C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="58" y1="46" x2="46" y2="64" stroke="#27AE60" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'block' }}>
      {emblems[scene] || emblems.classroom}
    </svg>
  );
}

// Read a user-picked image file, centre-crop it to a square and downscale, returning a
// compact JPEG data URL (so it fits comfortably in local storage).
function readAvatarPhoto(file, onDone) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const S = 320;
      const canvas = document.createElement('canvas');
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, S, S);
      try { onDone(canvas.toDataURL('image/jpeg', 0.85)); } catch (e) { onDone(reader.result); }
    };
    img.onerror = () => onDone(reader.result);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

// Read a user-picked image file straight to a data URL (no processing).
function fileToDataURL(file, onDone) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onDone(reader.result);
  reader.readAsDataURL(file);
}

// Square crop / position adjuster. Parent drags to pan and slides to zoom; the visible
// circle is exactly what the avatar will show. Exports a 320x320 JPEG data URL.
function PhotoCropper({ src, onDone, onCancel }) {
  const P = 280, O = 320; // display square / output square
  const [img, setImg] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const [off, setOff] = React.useState({ x: 0, y: 0 });
  const base = React.useRef(1);
  const drag = React.useRef(null);

  React.useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const b = Math.max(P / im.naturalWidth, P / im.naturalHeight);
      base.current = b;
      setOff({ x: (P - im.naturalWidth * b) / 2, y: (P - im.naturalHeight * b) / 2 });
      setZoom(1);
      setImg(im);
    };
    im.src = src;
  }, [src]);

  const s = base.current * zoom;
  const dw = img ? img.naturalWidth * s : P;
  const dh = img ? img.naturalHeight * s : P;
  const clamp = (x, y, w, h) => ({ x: Math.min(0, Math.max(P - w, x)), y: Math.min(0, Math.max(P - h, y)) });

  const setZoomC = (z) => {
    if (!img) { setZoom(z); return; }
    const oldS = base.current * zoom, newS = base.current * z, r = newS / oldS;
    setOff(o => {
      const cx = P / 2 - o.x, cy = P / 2 - o.y;
      return clamp(P / 2 - cx * r, P / 2 - cy * r, img.naturalWidth * newS, img.naturalHeight * newS);
    });
    setZoom(z);
  };

  const down = (e) => { if (!img) return; drag.current = { sx: e.clientX, sy: e.clientY, ox: off.x, oy: off.y }; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) {} };
  const move = (e) => { if (!drag.current || !img) return; setOff(clamp(drag.current.ox + (e.clientX - drag.current.sx), drag.current.oy + (e.clientY - drag.current.sy), dw, dh)); };
  const up = () => { drag.current = null; };

  const confirm = () => {
    if (!img) { onCancel(); return; }
    const k = O / P;
    const c = document.createElement('canvas'); c.width = O; c.height = O;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, O, O);
    ctx.drawImage(img, off.x * k, off.y * k, dw * k, dh * k);
    try { onDone(c.toDataURL('image/jpeg', 0.88)); } catch (e) { onDone(src); }
  };

  return (
    <div className="j-sheet-scrim" onClick={onCancel} style={{ zIndex: 50 }}>
      <div className="j-sheet" onClick={e => e.stopPropagation()}>
        <div className="j-sheet-grab" />
        <h2 className="j-h2" style={{ textAlign: 'center', marginBottom: 4 }}>Position the photo</h2>
        <p className="j-sm" style={{ textAlign: 'center', marginBottom: 18 }}>Drag to move, slide to zoom.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            style={{ position: 'relative', width: P, height: P, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--photo-bg)', touchAction: 'none', cursor: 'grab', boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.06)' }}>
            {img && <img src={src} alt="" draggable={false}
              style={{ position: 'absolute', left: off.x, top: off.y, width: dw, height: dh, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' }} />}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0 6px' }}>
          <Icon name="search" size={18} color="var(--faint)" />
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoomC(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--blue)' }} />
        </div>
        <button className="j-btn j-btn-primary" onClick={confirm} style={{ marginBottom: 10 }}><Icon name="check" size={20} color="#fff" /> Use photo</button>
        <button className="j-btn j-btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ---- StoryIllo (build 1.8.0): brand-style scene illustrations ----
   The SEN Help imagery system, translated to the app: semi-flat vector scenes in
   the brand palette, simple friendly rounded faces WITH expression, natural varied
   skin tones (brand colour lives in the clothing, never the skin), soft tinted
   ground, generous negative space. Used on the tour and the Tips deck; the same
   scenes carry into the native build. Hand-authored SVG so the app stays tiny
   and fully offline (no raster assets). */

const ILLO = {
  blue: '#1A56A8', bright: '#3A7BD4', green: '#27AE60', red: '#E74C3C',
  amber: '#F39C12', navy: '#22344F', cream: '#FDF9F2',
  tintBlue: 'rgba(58,123,212,0.14)', tintGreen: 'rgba(39,174,96,0.14)',
  tintAmber: 'rgba(243,156,18,0.16)', tintRed: 'rgba(231,76,60,0.12)',
  // natural skin tones, varied deliberately across the set (imagery-system lock)
  skin: { light: '#F1C7A4', tan: '#D9A374', medium: '#B37A50', brown: '#8A5A3A', deep: '#684430' },
  hair: { black: '#26211D', brown: '#544230', chestnut: '#7A4A26', darkgrey: '#3E3E42' },
};

// A simple friendly head: skin circle, soft hair cap behind, dot eyes (or closed
// arcs), a warm mouth. Expression is deliberate: calm | warm | gentle | closed.
function IHead(props) {
  // coerce: JSX attribute values arrive as strings, and string + number concatenates
  const cx = +props.cx, cy = +props.cy, r = +props.r;
  const { skin, hair, mood = 'warm', bun = false } = props;
  const eyeY = cy - r * 0.1, eyeDX = r * 0.4, eyeR = Math.max(1.7, r * 0.15);
  const line = '#332A20';
  const mw = Math.max(1.8, r * 0.16);
  const mouths = {
    warm:   <path d={`M ${cx - r * 0.36} ${cy + r * 0.36} Q ${cx} ${cy + r * 0.68} ${cx + r * 0.36} ${cy + r * 0.36}`} fill="none" stroke={line} strokeWidth={mw} strokeLinecap="round" />,
    calm:   <path d={`M ${cx - r * 0.28} ${cy + r * 0.44} Q ${cx} ${cy + r * 0.58} ${cx + r * 0.28} ${cy + r * 0.44}`} fill="none" stroke={line} strokeWidth={mw} strokeLinecap="round" />,
    gentle: <path d={`M ${cx - r * 0.22} ${cy + r * 0.46} H ${cx + r * 0.22}`} fill="none" stroke={line} strokeWidth={mw} strokeLinecap="round" />,
  };
  // hair = soft halo behind + a clean skull-cap fringe: one arc between two points
  // on the head circle, closed by the chord (no free-hand arcs, no artifacts)
  const fx = r * 0.94, fy = r * 0.34;
  return (
    <g>
      <circle cx={cx} cy={cy - r * 0.18} r={r * 1.07} fill={hair} />
      {bun && <circle cx={cx + r * 0.85} cy={cy - r * 1.05} r={r * 0.44} fill={hair} />}
      <circle cx={cx} cy={cy} r={r} fill={skin} />
      <path d={`M ${cx - fx} ${cy - fy} A ${r} ${r} 0 0 1 ${cx + fx} ${cy - fy} Z`} fill={hair} />
      {mood === 'closed'
        ? <g fill="none" stroke={line} strokeWidth={mw * 0.9} strokeLinecap="round">
            <path d={`M ${cx - eyeDX - eyeR} ${eyeY} q ${eyeR} ${eyeR * 1.2} ${eyeR * 2} 0`} />
            <path d={`M ${cx + eyeDX - eyeR} ${eyeY} q ${eyeR} ${eyeR * 1.2} ${eyeR * 2} 0`} />
          </g>
        : <g fill={line}>
            <circle cx={cx - eyeDX} cy={eyeY} r={eyeR} />
            <circle cx={cx + eyeDX} cy={eyeY} r={eyeR} />
          </g>}
      {mouths[mood === 'closed' ? 'calm' : mood]}
    </g>
  );
}

// Phone card used in several scenes: rounded body with three "entry" lines.
function IPhone(props) {
  const x = +props.x, y = +props.y, w = +(props.w || 34), h = +(props.h || 58);
  const lines = +(props.lines || 3), accent = props.accent || ILLO.bright;
  const pad = w * 0.18;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.2} fill="#fff" stroke={ILLO.navy} strokeWidth="2.4" />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + pad} y={y + h * 0.22 + i * h * 0.18} width={w - pad * 2 - (i === 1 ? w * 0.16 : 0)} height={h * 0.075} rx={h * 0.037}
          fill={i === 0 ? accent : 'rgba(34,52,79,0.25)'} />
      ))}
    </g>
  );
}

function StoryIllo({ scene = 'tourWelcome', width = 210 }) {
  const S = ILLO.skin, H = ILLO.hair;
  const scenes = {

    /* Tips 1: Start with you — parent kneeling, eyes closed, hand on chest. */
    tipCalm: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintGreen} />
        <path d="M92 128 q0 -34 20 -36 q22 -2 22 30 l0 6 q0 6 -6 6 l-30 0 q-6 0 -6 -6 Z" fill={ILLO.green} />
        <path d="M96 100 q-12 10 -8 24" fill="none" stroke={ILLO.green} strokeWidth="9" strokeLinecap="round" />
        <path d="M128 100 q6 10 -8 16" fill="none" stroke="#1F8B4D" strokeWidth="9" strokeLinecap="round" />
        <circle cx="118" cy="118" r="5" fill={S.brown} />
        <IHead cx="112" cy="78" r="15" skin={S.brown} hair={H.black} mood="closed" bun />
        <path d="M148 62 c0 -5 8 -5 8 0 c0 5 -8 9 -8 9 c0 0 -8 -4 -8 -9 c0 -5 8 -5 8 0 Z" transform="translate(-4,-6)" fill={ILLO.green} opacity="0.85" />
        <circle cx="66" cy="70" r="3" fill={ILLO.green} opacity="0.4" />
        <circle cx="160" cy="92" r="2.5" fill={ILLO.green} opacity="0.35" />
      </g>
    ),

    /* Tips 2: Fewer words, softer everything — adult crouched to the child's level. */
    tipSoft: (
      <g>
        <ellipse cx="110" cy="132" rx="82" ry="12" fill={ILLO.tintBlue} />
        {/* adult, crouched so heads are level */}
        <path d="M64 128 q-2 -30 18 -32 q20 -2 20 26 l0 2 q0 4 -4 4 l-30 0 q-4 0 -4 0 Z" fill={ILLO.blue} />
        <path d="M98 106 q10 6 16 12" fill="none" stroke={ILLO.blue} strokeWidth="8" strokeLinecap="round" />
        <circle cx="116" cy="120" r="4.5" fill={S.light} />
        <IHead cx="82" cy="82" r="14" skin={S.light} hair={H.darkgrey} mood="calm" />
        {/* child, sitting */}
        <path d="M130 128 q-2 -22 14 -23 q16 -1 15 20 l0 3 q0 0 -4 0 l-25 0 Z" fill={ILLO.bright} />
        <IHead cx="143" cy="90" r="11.5" skin={S.tan} hair={H.chestnut} mood="gentle" />
        {/* one soft, quiet word */}
        <g opacity="0.9">
          <path d="M60 38 h28 a7 7 0 0 1 7 7 v6 a7 7 0 0 1 -7 7 h-7 l-7 8 v-8 h-14 a7 7 0 0 1 -7 -7 v-6 a7 7 0 0 1 7 -7 Z" fill="#fff" stroke={ILLO.bright} strokeWidth="2" />
          <circle cx="67" cy="48" r="1.8" fill={ILLO.bright} />
          <circle cx="74" cy="48" r="1.8" fill={ILLO.bright} />
          <circle cx="81" cy="48" r="1.8" fill={ILLO.bright} />
        </g>
      </g>
    ),

    /* Tips 3: What makes it worse — why-questions and threats, gently struck out.
       Object-led on purpose: never a distressed child (imagery lock). */
    tipAvoid: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintRed} />
        <g>
          <path d="M52 44 h44 a9 9 0 0 1 9 9 v16 a9 9 0 0 1 -9 9 h-22 l-10 11 v-11 h-12 a9 9 0 0 1 -9 -9 v-16 a9 9 0 0 1 9 -9 Z" fill="#fff" stroke={ILLO.navy} strokeWidth="2.2" />
          <text x="74" y="68" textAnchor="middle" fontFamily="'Outfit', system-ui" fontWeight="600" fontSize="20" fill={ILLO.navy}>why?</text>
          <line x1="44" y1="86" x2="106" y2="42" stroke={ILLO.red} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        </g>
        <g>
          <path d="M124 64 h40 a9 9 0 0 1 9 9 v14 a9 9 0 0 1 -9 9 h-10 l-9 10 v-10 h-21 a9 9 0 0 1 -9 -9 v-14 a9 9 0 0 1 9 -9 Z" fill="#fff" stroke={ILLO.navy} strokeWidth="2.2" />
          <text x="144" y="86" textAnchor="middle" fontFamily="'Outfit', system-ui" fontWeight="700" fontSize="19" fill={ILLO.navy}>!!</text>
          <line x1="116" y1="104" x2="176" y2="58" stroke={ILLO.red} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        </g>
        {/* a settled pause beneath: the storm gets nothing to feed on */}
        <circle cx="96" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
        <circle cx="110" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
        <circle cx="124" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
      </g>
    ),

    /* Tips 4: Give it room to pass — child settled in a calm corner, lamp low,
       parent present but a step back. */
    tipRoom: (
      <g>
        <ellipse cx="110" cy="132" rx="82" ry="12" fill={ILLO.tintAmber} />
        {/* lamp */}
        <line x1="52" y1="128" x2="52" y2="76" stroke={ILLO.navy} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M40 76 h24 l-5 -14 h-14 Z" fill={ILLO.amber} />
        <path d="M52 82 q0 14 10 20" fill="none" stroke={ILLO.amber} strokeWidth="2.4" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="52" cy="129" rx="10" ry="3" fill={ILLO.navy} opacity="0.5" />
        {/* cushion + child, knees hugged, settling */}
        <ellipse cx="118" cy="124" rx="26" ry="8" fill={ILLO.amber} opacity="0.45" />
        <path d="M102 122 q-2 -20 16 -21 q18 -1 17 19 l0 2 q-1 3 -5 3 l-24 0 q-4 0 -4 -3 Z" fill={ILLO.bright} />
        <path d="M104 112 q14 -8 28 0 l0 8 q-14 6 -28 0 Z" fill={ILLO.blue} />
        <IHead cx="119" cy="88" r="12" skin={S.deep} hair={H.black} mood="calm" />
        {/* parent nearby, calm, giving space */}
        <path d="M172 128 q-2 -36 14 -37 q15 -1 14 37 Z" fill={ILLO.green} />
        <path d="M176 100 q-6 10 -4 20" fill="none" stroke="#1F8B4D" strokeWidth="8" strokeLinecap="round" />
        <IHead cx="186" cy="78" r="12.5" skin={S.tan} hair={H.brown} mood="calm" bun />
        <circle cx="86" cy="58" r="2.6" fill={ILLO.amber} opacity="0.45" />
        <circle cx="150" cy="48" r="3" fill={ILLO.amber} opacity="0.4" />
      </g>
    ),

    /* Tips 5: Afterwards, reconnect first — the hug. */
    tipReconnect: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintGreen} />
        {/* parent */}
        <path d="M80 128 q-4 -44 24 -45 q16 0 18 22 l2 23 Z" fill={ILLO.green} />
        {/* child leaning in */}
        <path d="M124 128 q0 -30 14 -31 q14 -1 14 31 Z" fill={ILLO.bright} />
        {/* parent's arm wrapping the child */}
        <path d="M96 96 q26 -2 38 14" fill="none" stroke="#1F8B4D" strokeWidth="9" strokeLinecap="round" />
        <circle cx="136" cy="112" r="5" fill={S.light} />
        {/* child's arm reaching back */}
        <path d="M140 106 q-10 6 -18 14" fill="none" stroke={ILLO.blue} strokeWidth="7" strokeLinecap="round" />
        <IHead cx="102" cy="72" r="14" skin={S.light} hair={H.chestnut} mood="closed" />
        <IHead cx="139" cy="86" r="11" skin={S.light} hair={H.brown} mood="warm" />
        <path d="M124 44 c0 -6 9 -6 9 0 c0 6 -9 10 -9 10 c0 0 -9 -4 -9 -10 c0 -6 9 -6 9 0 Z" fill={ILLO.green} />
      </g>
    ),

    /* Tips 6: Then write it down — settled now, one honest line into the record. */
    tipWrite: (
      <g>
        <ellipse cx="110" cy="132" rx="80" ry="12" fill={ILLO.tintBlue} />
        {/* sofa hint */}
        <path d="M56 128 l0 -22 q0 -8 8 -8 l30 0 q8 0 8 8 l0 22 Z" fill={ILLO.tintBlue} />
        {/* parent seated with phone */}
        <path d="M70 128 q-2 -30 18 -31 q18 -1 18 31 Z" fill={ILLO.blue} />
        <path d="M96 108 q8 4 12 10" fill="none" stroke={ILLO.blue} strokeWidth="8" strokeLinecap="round" />
        <circle cx="110" cy="120" r="4.5" fill={S.medium} />
        <IHead cx="87" cy="82" r="13.5" skin={S.medium} hair={H.black} mood="calm" />
        {/* the record, one fresh line ticked in */}
        <IPhone x="128" y="70" w="40" h="62" lines={3} accent={ILLO.green} />
        <circle cx="168" cy="72" r="11" fill={ILLO.green} />
        <path d="M163 72 l3.6 3.6 l6 -7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),

    /* Tour 1: Welcome — parent and child, side by side, starting out. */
    tourWelcome: (
      <g>
        <ellipse cx="110" cy="132" rx="82" ry="12" fill={ILLO.tintBlue} />
        <path d="M74 128 q-3 -44 20 -45 q22 -1 20 45 Z" fill={ILLO.blue} />
        <path d="M74 96 q-10 -8 -8 -20" fill="none" stroke={ILLO.blue} strokeWidth="9" strokeLinecap="round" />
        <circle cx="66" cy="74" r="5" fill={S.deep} />
        <IHead cx="94" cy="66" r="15" skin={S.deep} hair={H.black} mood="warm" />
        <path d="M126 128 q-2 -30 13 -31 q15 -1 14 31 Z" fill={ILLO.green} />
        <IHead cx="139" cy="84" r="11.5" skin={S.brown} hair={H.black} mood="warm" bun />
        {/* holding hands */}
        <path d="M112 102 q8 8 16 10" fill="none" stroke={ILLO.blue} strokeWidth="8" strokeLinecap="round" />
        <circle cx="128" cy="112" r="4.5" fill={S.deep} />
        <path d="M166 52 c0 -6 9 -6 9 0 c0 6 -9 10 -9 10 c0 0 -9 -4 -9 -10 c0 -6 9 -6 9 0 Z" fill={ILLO.red} opacity="0.7" />
      </g>
    ),

    /* Tour 2: Today is home — the day on one screen, morning light. */
    tourToday: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintBlue} />
        <circle cx="62" cy="56" r="16" fill={ILLO.amber} opacity="0.85" />
        <g stroke={ILLO.amber} strokeWidth="3" strokeLinecap="round" opacity="0.7">
          <line x1="62" y1="30" x2="62" y2="36" /><line x1="38" y1="56" x2="44" y2="56" />
          <line x1="45" y1="39" x2="49" y2="43" /><line x1="79" y1="43" x2="75" y2="39" transform="translate(4,-4)" />
        </g>
        <IPhone x="92" y="52" w="46" h="76" lines={4} accent={ILLO.bright} />
        <circle cx="150" cy="112" r="12" fill={ILLO.green} opacity="0.16" />
        <path d="M145 112 l3.6 3.6 l6.5 -7.5" fill="none" stroke={ILLO.green} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),

    /* Tour 3: A line is plenty — the plus button and one written line. */
    tourLog: (
      <g>
        <ellipse cx="110" cy="132" rx="76" ry="12" fill={ILLO.tintBlue} />
        <circle cx="86" cy="82" r="26" fill={ILLO.blue} />
        <g stroke="#fff" strokeWidth="5.5" strokeLinecap="round">
          <line x1="86" y1="70" x2="86" y2="94" /><line x1="74" y1="82" x2="98" y2="82" />
        </g>
        {/* one line, being written */}
        <rect x="122" y="78" width="52" height="9" rx="4.5" fill="rgba(34,52,79,0.22)" />
        <rect x="122" y="78" width="34" height="9" rx="4.5" fill={ILLO.bright} />
        <path d="M158 84 l14 -20 l6 4 l-14 20 l-7 3 Z" fill={ILLO.amber} />
        <path d="M172 64 l6 4 l3 -4 q1 -2 -1 -3.5 q-2 -1.5 -3.5 0 Z" fill={ILLO.navy} />
        <circle cx="130" cy="52" r="2.6" fill={ILLO.bright} opacity="0.5" />
        <circle cx="60" cy="118" r="3" fill={ILLO.blue} opacity="0.3" />
      </g>
    ),

    /* Tour 4: At the gate — the school gate, parent and child, hand in hand. */
    tourGate: (
      <g>
        <ellipse cx="110" cy="132" rx="84" ry="12" fill={ILLO.tintGreen} />
        {/* gate: two posts and railings */}
        <rect x="128" y="52" width="7" height="76" rx="3" fill={ILLO.navy} />
        <rect x="186" y="52" width="7" height="76" rx="3" fill={ILLO.navy} />
        <path d="M128 56 q30 -16 65 0" fill="none" stroke={ILLO.navy} strokeWidth="5" strokeLinecap="round" />
        {[144, 158, 172].map(x => <line key={x} x1={x} y1="64" x2={x} y2="126" stroke={ILLO.navy} strokeWidth="3.4" strokeLinecap="round" opacity="0.75" />)}
        {/* parent + child arriving */}
        <path d="M46 128 q-3 -40 18 -41 q20 -1 18 41 Z" fill={ILLO.green} />
        <IHead cx="64" cy="70" r="14" skin={S.tan} hair={H.brown} mood="calm" bun />
        <path d="M92 128 q-2 -26 12 -27 q13 -1 12 27 Z" fill={ILLO.bright} />
        <IHead cx="104" cy="88" r="10.5" skin={S.tan} hair={H.chestnut} mood="warm" />
        <path d="M80 102 q7 8 14 10" fill="none" stroke="#1F8B4D" strokeWidth="8" strokeLinecap="round" />
        <circle cx="94" cy="112" r="4" fill={S.tan} />
      </g>
    ),

    /* Tour 5: Their day, in their words — the child holds the phone, happy face up. */
    tourChild: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintGreen} />
        <path d="M84 128 q-3 -34 20 -35 q22 -1 20 35 Z" fill={ILLO.bright} />
        <IHead cx="104" cy="74" r="14.5" skin={S.light} hair={H.chestnut} mood="warm" />
        {/* both hands holding the phone out */}
        <path d="M88 100 q10 12 22 14" fill="none" stroke={ILLO.bright} strokeWidth="8" strokeLinecap="round" />
        <path d="M122 100 q-4 10 -10 14" fill="none" stroke={ILLO.blue} strokeWidth="8" strokeLinecap="round" />
        <rect x="100" y="106" width="30" height="44" rx="7" fill="#fff" stroke={ILLO.navy} strokeWidth="2.2" transform="rotate(-6 115 128)" />
        <g transform="rotate(-6 115 128)">
          <circle cx="115" cy="124" r="9" fill="#F4C95D" />
          <circle cx="112" cy="122.5" r="1.2" fill="#4A3D1E" />
          <circle cx="118" cy="122.5" r="1.2" fill="#4A3D1E" />
          <path d="M111 126 q4 4 8 0" fill="none" stroke="#4A3D1E" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <circle cx="152" cy="66" r="3" fill={ILLO.green} opacity="0.45" />
        <circle cx="66" cy="58" r="2.6" fill={ILLO.bright} opacity="0.4" />
      </g>
    ),

    /* Tour 6: See the shape of it — the month grid becoming a pattern. */
    tourPattern: (
      <g>
        <ellipse cx="110" cy="132" rx="78" ry="12" fill={ILLO.tintBlue} />
        <rect x="56" y="46" width="82" height="72" rx="10" fill="#fff" stroke={ILLO.navy} strokeWidth="2.4" />
        <rect x="56" y="46" width="82" height="16" rx="10" fill={ILLO.blue} />
        <rect x="56" y="54" width="82" height="8" fill={ILLO.blue} />
        {[
          ['#27AE60', '#27AE60', '#F39C12', '#27AE60'],
          ['#27AE60', '#E74C3C', '#F39C12', '#27AE60'],
          ['#F39C12', '#E74C3C', '#27AE60', '#27AE60'],
        ].map((row, r) => row.map((c, i) => (
          <circle key={r + '-' + i} cx={70 + i * 18} cy={76 + r * 16} r="4.5" fill={c} opacity="0.9" />
        )))}
        {/* the magnifier that finds the pattern */}
        <circle cx="146" cy="98" r="17" fill="rgba(58,123,212,0.12)" stroke={ILLO.bright} strokeWidth="3.4" />
        <line x1="158" y1="110" x2="170" y2="122" stroke={ILLO.bright} strokeWidth="5" strokeLinecap="round" />
      </g>
    ),

    /* Tour 7: Private by default — the record stays on the phone, behind the shield. */
    tourPrivate: (
      <g>
        <ellipse cx="110" cy="132" rx="76" ry="12" fill={ILLO.tintBlue} />
        <IPhone x="78" y="48" w="46" h="78" lines={3} accent={ILLO.bright} />
        <path d="M138 66 q14 -7 28 0 q2 22 -14 32 q-16 -10 -14 -32 Z" fill={ILLO.blue} />
        <path d="M146 80 l4.5 4.5 l8 -9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="60" cy="62" r="2.6" fill={ILLO.bright} opacity="0.4" />
        <circle cx="152" cy="116" r="3" fill={ILLO.blue} opacity="0.3" />
      </g>
    ),

    /* Tour 8: You are ready — off they go, together, forward. */
    tourReady: (
      <g>
        <ellipse cx="110" cy="132" rx="82" ry="12" fill={ILLO.tintGreen} />
        <circle cx="168" cy="52" r="14" fill={ILLO.amber} opacity="0.8" />
        {/* parent mid-stride */}
        <path d="M74 128 q-2 -42 20 -43 q21 -1 19 43 Z" fill={ILLO.blue} />
        <path d="M112 96 q12 -6 16 -16" fill="none" stroke={ILLO.blue} strokeWidth="9" strokeLinecap="round" />
        <circle cx="129" cy="79" r="5" fill={S.medium} />
        <IHead cx="93" cy="68" r="14.5" skin={S.medium} hair={H.darkgrey} mood="warm" />
        {/* child skipping ahead */}
        <path d="M134 124 q0 -28 13 -29 q13 -1 13 29 Z" fill={ILLO.green} />
        <IHead cx="146" cy="80" r="11" skin={S.medium} hair={H.black} mood="warm" />
        <path d="M52 66 q10 -4 16 4" fill="none" stroke={ILLO.green} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </g>
    ),
  };
  return (
    <svg width={width} height={Math.round(width * 150 / 220)} viewBox="0 0 220 150" aria-hidden="true" style={{ display: 'block' }}>
      {scenes[scene] || scenes.tourWelcome}
    </svg>
  );
}

Object.assign(window, { Face, MoodDot, MOOD_COLOURS, Wordmark, JotlaLogo, ChildAvatar, SceneIllo, StoryIllo, readAvatarPhoto, fileToDataURL, PhotoCropper });
