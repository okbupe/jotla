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

Object.assign(window, { Face, MoodDot, MOOD_COLOURS, Wordmark, JotlaLogo, ChildAvatar, SceneIllo, readAvatarPhoto, fileToDataURL, PhotoCropper });
