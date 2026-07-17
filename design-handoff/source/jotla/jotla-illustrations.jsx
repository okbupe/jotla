// jotla-illustrations.jsx: the brand illustration layer.
// Friendly rounded faces (not emoji), scene emblems, wordmark, mood dots.
// The 14 StoryIllo tour and Tips scenes and the 3 child-mode SceneIllo
// emblems carry the illustration-grade vector art approved on the native
// build (12 Jul 2026, founder feedback: proper vector illustrations for the
// tours and walkthroughs), ported back here under the sync law. Same warm
// world, the app's own palette, one consistent visual language: layered
// tint discs and grounds, a shared character system (heads, torsos, limbs,
// one shoe colour), shared accent helpers (sparkle, leaf, heart), no text
// baked into the artwork. Hand-authored SVG so the app stays tiny and fully
// offline (no raster assets). The brand hues stay static in dark mode;
// every colour was checked against both the light (#F7F9FC) and dark
// (#0E1726) app backgrounds.

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

/* ---- Wordmark: the header lockup, corrected 12 Jul 2026 ----
   The logo, the +PLUS pill (once this device owns Plus), and the quiet
   "by SEN Help" endorsement resting on the logotype baseline.

   Alignment is computed from the artwork, not guessed. Measured from the SVG
   paths (viewBox 0 0 1747.5 627.55): the flat bottoms of the t and l stems
   sit at y = 616.58, which is the logotype baseline (0.9825 of the rendered
   height); the o, a and J bottoms overshoot to ~627.55 (round-letter
   overshoot, ~1.75% of the height, under half a pixel at header sizes). The
   artwork has NO descender below the baseline, so the old drop = 0.167 *
   logoH constant (a fictional "J descender") lifted the whole lockup 3-4 px
   above the true baseline and floated the sub-label and +PLUS high: the bug
   the founder flagged on device, fixed on native (Wordmark.tsx) and mirrored
   here.

   Mechanics: the row aligns items on the CSS baseline. The logo wrapper is
   cut to exactly baseline height with overflow hidden, so its synthesised
   baseline (its bottom edge) IS the logotype baseline; the sub-label is real
   text, so its glyph baseline lands on the same line with no magic numbers.
   The pill also clips (baseline = its bottom edge) and is then lifted with a
   relative top so its centre sits on the cap band's midline, level with the
   wordmark. The +PLUS itself: Cal Sans, skewX(-8deg) for the italic (the
   design truth; no italic cut ships), ZERO letter spacing (the old 0.12em
   tracking is gone), Plus violet pill colours from the tokens. */
const LOGO_BASELINE = 616.58 / 627.55;        // baseline, fraction of logo height
const LOGO_CAP = (616.58 - 25.34) / 627.55;   // cap band, fraction of logo height
function Wordmark({ size = 30, color = '#1A56A8', sub = true, subColor, plus = false }) {
  const logoH = Math.round(size * 0.8);
  const logoW = Math.round(logoH * JOTLA_LOGO_RATIO);
  const baseY = logoH * LOGO_BASELINE;        // logo top down to the baseline, px
  const capH = logoH * LOGO_CAP;              // baseline up to the J cap top, px
  const gapLogo = Math.round(logoH * 0.18);   // logo to pill
  const gapSub = Math.round(logoH * 0.37);    // into the sub-label
  const pillFont = logoH * 0.5;               // +PLUS keeps its old type size
  const pillH = pillFont * 1.78;              // Cal Sans box (1.3em) + 0.48em padding
  const pillLift = capH / 2 - pillH / 2;      // pill centre onto the cap band midline
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={{ display: 'inline-block', width: logoW, height: baseY, overflow: 'hidden' }}>
        <JotlaLogo height={logoH} color={color} />
      </span>
      {plus && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          marginLeft: gapLogo, height: pillH, padding: `0 ${pillFont * 0.62}px`, borderRadius: 999,
          background: 'var(--plus-tint)', position: 'relative', top: -pillLift,
        }}>
          <span style={{
            display: 'inline-block', fontFamily: "'Cal Sans', system-ui", fontWeight: 500,
            fontSize: pillFont, lineHeight: 1, letterSpacing: 0, color: 'var(--plus-ink)',
            transform: 'skewX(-8deg)',
          }}>+PLUS</span>
        </span>
      )}
      {sub && <span style={{
        fontFamily: "'Outfit', system-ui", fontWeight: 400, fontSize: size * 0.42,
        color: subColor || 'rgba(15,23,42,0.45)', letterSpacing: '0.01em', whiteSpace: 'nowrap',
        marginLeft: gapSub,
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

/* ------------------------------------------------------------------ */
/* The storybook system shared by SceneIllo and StoryIllo              */
/* (approved art, 12 Jul 2026; kept in step with the native build)     */
/* ------------------------------------------------------------------ */

const ILLO = {
  blue: '#1A56A8',
  bright: '#3A7BD4',
  deep: '#0F3D7A',   // trousers and the one shoe colour across the set
  green: '#27AE60',
  greenDeep: '#1F8B4D',
  amber: '#F39C12',
  amberDeep: '#D9820B',
  red: '#E74C3C',
  slate: '#46618C',  // structural ink that reads on light and dark grounds
  navy: '#22344F',   // details sitting on white surfaces
  cream: '#FDF9F2',
  white: '#FFFFFF',
  screen: '#EFF5FD', // device screen inset
  butter: '#F4C95D', // the Face fill (child-mode continuity)
  butterInk: '#4A3D1E',
  tintBlue: 'rgba(58,123,212,0.16)',
  tintGreen: 'rgba(39,174,96,0.16)',
  tintAmber: 'rgba(243,156,18,0.18)',
  tintRed: 'rgba(231,76,60,0.13)',
  shadow: 'rgba(20,30,50,0.16)',   // contact shadow, works on both grounds
  faintRow: 'rgba(34,52,79,0.22)', // quiet entry rows on white cards
  // natural skin tones, varied deliberately across the set (imagery-system lock)
  skin: { light: '#F1C7A4', tan: '#D9A374', medium: '#B37A50', brown: '#8A5A3A', deep: '#684430' },
  hair: { black: '#26211D', brown: '#544230', chestnut: '#7A4A26', darkgrey: '#3E3E42' },
  blush: 'rgba(226,110,80,0.30)',
  wood: '#8A5A2B',
};

// A simple friendly head: hair halo behind, skin circle, skull-cap fringe,
// blush cheeks, dot eyes (or closed arcs), a warm mouth. Expression is
// deliberate: warm | calm | gentle | closed (eyes shut, calm mouth) |
// joy (eyes shut, warm mouth). `tilt` leans the whole head in degrees.
function IHead({ cx, cy, r, skin, hair, mood = 'warm', bun = false, tilt = 0 }) {
  const eyeY = cy - r * 0.1, eyeDX = r * 0.4, eyeR = Math.max(1.7, r * 0.15);
  const line = '#332A20';
  const mw = Math.max(1.8, r * 0.16);
  const fx = r * 0.94, fy = r * 0.34;
  const mouths = {
    warm:   `M ${cx - r * 0.36} ${cy + r * 0.36} Q ${cx} ${cy + r * 0.68} ${cx + r * 0.36} ${cy + r * 0.36}`,
    calm:   `M ${cx - r * 0.28} ${cy + r * 0.44} Q ${cx} ${cy + r * 0.58} ${cx + r * 0.28} ${cy + r * 0.44}`,
    gentle: `M ${cx - r * 0.22} ${cy + r * 0.46} H ${cx + r * 0.22}`,
  };
  const mouthD = mood === 'warm' || mood === 'joy' ? mouths.warm : mood === 'gentle' ? mouths.gentle : mouths.calm;
  const closed = mood === 'closed' || mood === 'joy';
  const inner = (
    <g>
      <circle cx={cx} cy={cy - r * 0.18} r={r * 1.07} fill={hair} />
      {bun && <circle cx={cx + r * 0.85} cy={cy - r * 1.05} r={r * 0.44} fill={hair} />}
      <circle cx={cx} cy={cy} r={r} fill={skin} />
      <path d={`M ${cx - fx} ${cy - fy} A ${r} ${r} 0 0 1 ${cx + fx} ${cy - fy} Z`} fill={hair} />
      <circle cx={cx - r * 0.56} cy={cy + r * 0.22} r={r * 0.17} fill={ILLO.blush} />
      <circle cx={cx + r * 0.56} cy={cy + r * 0.22} r={r * 0.17} fill={ILLO.blush} />
      {closed
        ? <g fill="none" stroke={line} strokeWidth={mw * 0.9} strokeLinecap="round">
            <path d={`M ${cx - eyeDX - eyeR} ${eyeY} q ${eyeR} ${eyeR * 1.2} ${eyeR * 2} 0`} />
            <path d={`M ${cx + eyeDX - eyeR} ${eyeY} q ${eyeR} ${eyeR * 1.2} ${eyeR * 2} 0`} />
          </g>
        : <g fill={line}>
            <circle cx={cx - eyeDX} cy={eyeY} r={eyeR} />
            <circle cx={cx + eyeDX} cy={eyeY} r={eyeR} />
          </g>}
      <path d={mouthD} fill="none" stroke={line} strokeWidth={mw} strokeLinecap="round" />
    </g>
  );
  return tilt ? <g transform={`rotate(${tilt} ${cx} ${cy})`}>{inner}</g> : inner;
}

// Arch-top torso: soft shoulders, straight sides, flat hem.
function ITorso({ cx, top, hw, bottom, color }) {
  return (
    <path d={`M ${cx - hw} ${bottom} L ${cx - hw} ${top + 8} Q ${cx - hw} ${top} ${cx} ${top} Q ${cx + hw} ${top} ${cx + hw} ${top + 8} L ${cx + hw} ${bottom} Z`} fill={color} />
  );
}

// Trouser band under a torso: straight top, gently rounded hem.
function IBand({ cx, top, hw, depth, color }) {
  return (
    <path d={`M ${cx - hw} ${top} L ${cx + hw} ${top} L ${cx + hw} ${top + depth} Q ${cx} ${top + depth + 4} ${cx - hw} ${top + depth} Z`} fill={color} />
  );
}

// Round-capped limb stroke.
function ILimb({ d, color, w }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />;
}

// Hand circle.
function IHand({ x, y, r, skin }) {
  return <circle cx={x} cy={y} r={r} fill={skin} />;
}

// Shoe lozenge (optionally rotated). One shoe colour across the set.
function IShoe({ cx, cy, rx = 6, ry = 3.2, rot = 0 }) {
  const e = <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ILLO.deep} />;
  return rot ? <g transform={`rotate(${rot} ${cx} ${cy})`}>{e}</g> : e;
}

// Four-point sparkle.
function ISparkle({ x, y, s, color, op = 1 }) {
  const d =
    `M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3}` +
    ` L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`;
  return <path d={d} fill={color} opacity={op} />;
}

// Small leaf with a centre vein so it reads as a leaf, not a pebble.
function ILeaf({ x, y, s, color, rot = 0, op = 1 }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`} opacity={op}>
      <path d={`M ${x} ${y} Q ${x + s * 0.5} ${y - s * 0.62} ${x + s} ${y} Q ${x + s * 0.5} ${y + s * 0.62} ${x} ${y} Z`} fill={color} />
      <line x1={x + s * 0.16} y1={y} x2={x + s * 0.84} y2={y} stroke={ILLO.white}
        strokeWidth={Math.max(0.8, s * 0.1)} strokeLinecap="round" opacity="0.55" />
    </g>
  );
}

// Small heart.
function IHeart({ cx, cy, s, color, op = 1 }) {
  const d =
    `M ${cx} ${cy + s} C ${cx - 1.5 * s} ${cy - 0.34 * s} ${cx - 0.62 * s} ${cy - 1.1 * s} ${cx} ${cy - 0.38 * s}` +
    ` C ${cx + 0.62 * s} ${cy - 1.1 * s} ${cx + 1.5 * s} ${cy - 0.34 * s} ${cx} ${cy + s} Z`;
  return <path d={d} fill={color} opacity={op} />;
}

// Phone card: white body, slate stroke, screen inset, entry rows and an
// optional mood-dot row (the Jotla trio, green/amber/green).
function IPhone({ x, y, w = 34, h = 58, lines = 3, accent = ILLO.bright, moodRow = false }) {
  const pad = w * 0.16;
  const moodColours = [ILLO.green, ILLO.amber, ILLO.green];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={w * 0.18} fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.4" />
      <rect x={x + w * 0.09} y={y + h * 0.07} width={w * 0.82} height={h * 0.86} rx={w * 0.12} fill={ILLO.screen} />
      {Array.from({ length: lines }, (_, i) => (
        <rect key={i} x={x + pad} y={y + h * 0.22 + i * h * 0.16}
          width={w - pad * 2 - (i % 2 === 1 ? w * 0.18 : 0)} height={h * 0.068} rx={h * 0.034}
          fill={i === 0 ? accent : ILLO.faintRow} />
      ))}
      {moodRow ? moodColours.map((c, k) => (
        <circle key={'m' + k} cx={x + w / 2 + (k - 1) * 9} cy={y + h * 0.8} r="2.6" fill={c} />
      )) : null}
    </g>
  );
}

// Two-layer ground: the wide tint pool and the contact shadow under weight.
function IGround({ cx, rx, tint }) {
  return <ellipse cx={cx} cy="132" rx={rx} ry="11.5" fill={tint} />;
}
function IContact({ cx, rx }) {
  return <ellipse cx={cx} cy="129.5" rx={rx} ry="4" fill={ILLO.shadow} />;
}
function IDisc({ cx, cy, r, tint }) {
  return <circle cx={cx} cy={cy} r={r} fill={tint} />;
}

// Sun: soft halo, warm core, eight round rays.
function ISun({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 7} fill={ILLO.amber} opacity="0.18" />
      <circle cx={cx} cy={cy} r={r} fill={ILLO.amber} opacity="0.9" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
        return (
          <line key={i}
            x1={cx + Math.cos(a) * (r + 4.5)} y1={cy + Math.sin(a) * (r + 4.5)}
            x2={cx + Math.cos(a) * (r + 9)} y2={cy + Math.sin(a) * (r + 9)}
            stroke={ILLO.amber} strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        );
      })}
    </g>
  );
}

// Speech bubble with a soft tail ('bl' bottom-left, 'br' bottom-right).
function IBubble({ x, y, w, h, tail, fill, stroke }) {
  const tailD = tail === 'br'
    ? `M ${x + w - 22} ${y + h} l 7 9 l 3 -9 Z`
    : `M ${x + 15} ${y + h} l -4 9 l 11 -9 Z`;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="9" fill={fill} stroke={stroke} strokeWidth="2.2" />
      <path d={tailD} fill={fill} stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x={x + 2} y={y + h - 4} width={w - 4} height="6" rx="3" fill={fill} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* SceneIllo: scene emblems for child mode                             */
/* ------------------------------------------------------------------ */

// Friendly little places on the child-mode pastel panels: the board and
// desk, the lunch plate, the slide in the sun.
function SceneIllo({ scene = 'classroom', size = 96 }) {
  const emblems = {
    classroom: (
      <g>
        <line x1="26" y1="60" x2="21" y2="80" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <line x1="74" y1="60" x2="79" y2="80" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <rect x="16" y="16" width="68" height="46" rx="6" fill="#2E7D5B" />
        <rect x="16" y="16" width="68" height="46" rx="6" fill="none" stroke={ILLO.white} strokeWidth="3" />
        <line x1="26" y1="30" x2="58" y2="30" stroke={ILLO.white} strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="40" x2="70" y2="40" stroke={ILLO.white} strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="50" x2="46" y2="50" stroke={ILLO.white} strokeWidth="3" strokeLinecap="round" />
        <circle cx="64" cy="50" r="4" fill={ILLO.amber} />
        <rect x="28" y="70" width="44" height="7" rx="3.5" fill={ILLO.wood} />
        <line x1="35" y1="78" x2="35" y2="88" stroke={ILLO.wood} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="65" y1="78" x2="65" y2="88" stroke={ILLO.wood} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="40" cy="64" r="5.5" fill={ILLO.red} />
        <line x1="40" y1="58.5" x2="40" y2="55.5" stroke={ILLO.wood} strokeWidth="2" strokeLinecap="round" />
        <ILeaf x={40.5} y={56.5} s={5} color={ILLO.green} rot={-24} />
        <rect x="52" y="61" width="11" height="10" rx="2.5" fill={ILLO.bright} />
        <line x1="55.5" y1="61" x2="55.5" y2="53" stroke={ILLO.amber} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="60" y1="61" x2="60" y2="55" stroke={ILLO.green} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    ),
    lunch: (
      <g>
        <ellipse cx="50" cy="64" rx="38" ry="14" fill={ILLO.white} opacity="0.75" />
        <circle cx="44" cy="58" r="20" fill={ILLO.white} />
        <circle cx="44" cy="58" r="20" fill="none" stroke={ILLO.blue} strokeWidth="3" />
        <path d="M 33 63 L 55 63 L 44 48 Z" fill="#F0D9A6" />
        <line x1="35.5" y1="62" x2="52.5" y2="62" stroke={ILLO.green} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="53" cy="53" r="3.2" fill={ILLO.red} opacity="0.85" />
        <rect x="70" y="42" width="15" height="19" rx="4" fill={ILLO.bright} />
        <line x1="79" y1="42" x2="84" y2="30" stroke={ILLO.amber} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="14" y1="46" x2="14" y2="70" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <line x1="10.5" y1="38" x2="10.5" y2="46" stroke={ILLO.slate} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="14" y1="38" x2="14" y2="46" stroke={ILLO.slate} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="17.5" y1="38" x2="17.5" y2="46" stroke={ILLO.slate} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    ),
    playground: (
      <g>
        <circle cx="24" cy="22" r="9" fill={ILLO.amber} />
        <g stroke={ILLO.amber} strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <line x1="24" y1="7" x2="24" y2="11" />
          <line x1="9" y1="22" x2="13" y2="22" />
          <line x1="13" y1="11" x2="16" y2="14" />
          <line x1="35" y1="11" x2="32" y2="14" />
        </g>
        <line x1="70" y1="36" x2="70" y2="66" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <line x1="79" y1="36" x2="79" y2="66" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <line x1="70" y1="44" x2="79" y2="44" stroke={ILLO.slate} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="70" y1="52" x2="79" y2="52" stroke={ILLO.slate} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="70" y1="60" x2="79" y2="60" stroke={ILLO.slate} strokeWidth="2.4" strokeLinecap="round" />
        <rect x="60" y="30" width="24" height="7" rx="3.5" fill={ILLO.slate} />
        <path d="M 62 36 Q 48 40 40 54 Q 34 64 22 68" fill="none" stroke={ILLO.red} strokeWidth="6.5" strokeLinecap="round" />
        <circle cx="46" cy="76" r="7.5" fill={ILLO.bright} />
        <path d="M 39.5 74 Q 46 69 52.5 74" fill="none" stroke={ILLO.white} strokeWidth="2.6" strokeLinecap="round" />
        <g stroke={ILLO.green} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M 16 86 q 0 -5 2 -7" />
          <path d="M 21 86 q 0 -4 -1 -6" />
          <path d="M 72 88 q 0 -5 2 -7" />
          <path d="M 77 88 q 0 -4 -1 -6" />
        </g>
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

/* ------------------------------------------------------------------ */
/* StoryIllo: brand-style scene illustrations (tour + Tips deck)       */
/* ------------------------------------------------------------------ */

/* Generated illustration deck (build 1.9.0, candidate). Keys match the `scenes`
   map below one-for-one; a scene listed here renders as an image, a scene left
   out falls through to its hand-authored SVG. Both sets stay live until Bupe
   signs the images off: "dont delete them until we are satified about the
   images we replace them with" (16 Jul). Empty this map and the SVG deck is
   back, with nothing to restore.
   Provenance and prompts: Downloads/Tour/MANIFEST.md, Downloads/Tips/MANIFEST.md.

   Filenames carry a hash of their own bytes, and that is load-bearing, not tidy:
   sw.js caches webp CACHE-FIRST and matches with ignoreSearch: true, so a stable
   name is served from cache forever and a ?v= query cannot bust it. Re-using
   tourWelcome.webp for a new picture shipped the OLD image to every device that
   already had one, stretched into the new square box (16 Jul, founder: "they look
   like the old images... they also appear squished"). Content in the name means a
   changed image is a changed URL. Regenerate with the convert script, which prints
   this map; never hand-edit a hash. */
const STORY_IMAGES = {
  tourWelcome:  'illo/tourWelcome.8da0a563.webp',
  tourToday:    'illo/tourToday.3acd7efe.webp',
  tourLog:      'illo/tourLog.40ac0b56.webp',
  tourGate:     'illo/tourGate.e577cf3e.webp',
  tourChild:    'illo/tourChild.ede054f3.webp',
  tourPattern:  'illo/tourPattern.27d2d4a0.webp',
  tourPrivate:  'illo/tourPrivate.e5f30d36.webp',
  tourReady:    'illo/tourReady.da35eb9b.webp',
  tipCalm:      'illo/tipCalm.0aab1463.webp',
  tipSoft:      'illo/tipSoft.9d7eda0d.webp',
  tipAvoid:     'illo/tipAvoid.5ebc8852.webp',
  tipRoom:      'illo/tipRoom.5ec028be.webp',
  tipReconnect: 'illo/tipReconnect.7c285113.webp',
  tipWrite:     'illo/tipWrite.56985ff3.webp',
};
/* Square (1:1), founder call 16 Jul: the 3:2 deck rendered too small in the slot.
   The ratio is what matters here, not the number: `.j-illo-img` pins aspect-ratio
   in CSS, so a file that ships below 900 (tipAvoid at 755) still lays out right. */
const STORY_IMAGE_W = 900, STORY_IMAGE_H = 900;

function StoryIllo({ scene = 'tourWelcome', width = 210 }) {
  const S = ILLO.skin, H = ILLO.hair;
  const patternColours = [
    [ILLO.green, ILLO.green, ILLO.amber, ILLO.green],
    [ILLO.green, ILLO.red, ILLO.amber, ILLO.green],
    [ILLO.amber, ILLO.red, ILLO.green, ILLO.green],
  ];
  const scenes = {

    /* Tips 1: Start with you: seated, eyes closed, hand on chest, breath rising. */
    tipCalm: (
      <g>
        <IDisc cx={110} cy={78} r={58} tint={ILLO.tintGreen} />
        <circle cx="110" cy="90" r="34" fill="none" stroke={ILLO.green} strokeWidth="2" opacity="0.18" />
        <circle cx="110" cy="90" r="44" fill="none" stroke={ILLO.green} strokeWidth="2" opacity="0.1" />
        <IGround cx={110} rx={76} tint={ILLO.tintGreen} />
        <IContact cx={110} rx={42} />
        <path d="M 84 122 Q 86 108 110 108 Q 134 108 136 122 Q 136 126 130 126 L 90 126 Q 84 126 84 122 Z" fill={ILLO.greenDeep} />
        <IShoe cx={95} cy={123.5} rx={5.5} ry={3} rot={-16} />
        <IShoe cx={125} cy={123.5} rx={5.5} ry={3} rot={16} />
        <ITorso cx={110} top={84} hw={16} bottom={112} color={ILLO.green} />
        <ILimb d="M 96 92 Q 88 100 90 108" color={ILLO.green} w={8} />
        <IHand x={91} y={110} r={4.5} skin={S.brown} />
        <ILimb d="M 124 92 Q 122 98 114 99" color={ILLO.greenDeep} w={8} />
        <IHand x={112} y={99} r={4.5} skin={S.brown} />
        <IHead cx={110} cy={66} r={15} skin={S.brown} hair={H.black} mood="closed" bun />
        <IHeart cx={134} cy={40} s={4.5} color={ILLO.green} op={0.85} />
        <IHeart cx={143} cy={30} s={3} color={ILLO.green} op={0.5} />
        <ILeaf x={54} y={110} s={8} color={ILLO.green} rot={-18} op={0.45} />
        <ILeaf x={164} y={106} s={8} color={ILLO.green} rot={18} op={0.45} />
      </g>
    ),

    /* Tips 2: Fewer words, softer everything: crouched to their level, one soft word. */
    tipSoft: (
      <g>
        <IDisc cx={106} cy={80} r={58} tint={ILLO.tintBlue} />
        <IGround cx={108} rx={78} tint={ILLO.tintBlue} />
        <IContact cx={78} rx={34} />
        <IContact cx={134} rx={26} />
        <IBubble x={42} y={34} w={38} h={24} tail="br" fill={ILLO.white} stroke={ILLO.bright} />
        <circle cx="54" cy="46" r="1.9" fill={ILLO.bright} />
        <circle cx="61" cy="46" r="1.9" fill={ILLO.bright} />
        <circle cx="68" cy="46" r="1.9" fill={ILLO.bright} />
        {/* adult, crouched so heads are level: knees up in front */}
        <path d="M 62 120 Q 60 96 78 92 Q 94 89 96 106 L 96 120 Z" fill={ILLO.blue} />
        <circle cx="72" cy="115" r="8.5" fill={ILLO.deep} />
        <circle cx="88" cy="115" r="8.5" fill={ILLO.deep} />
        <IShoe cx={70} cy={126.5} rx={6} ry={3} />
        <IShoe cx={89} cy={126.5} rx={6} ry={3} />
        <ILimb d="M 68 98 Q 63 104 66 110" color={ILLO.blue} w={7.5} />
        <IHand x={67} y={111.5} r={4.2} skin={S.light} />
        <ILimb d="M 92 98 Q 106 100 116 103" color={ILLO.blue} w={7.5} />
        <IHand x={118} y={103.5} r={4.2} skin={S.light} />
        <IHead cx={80} cy={76} r={14} skin={S.light} hair={H.darkgrey} mood="calm" />
        {/* child, standing, teddy hugged in */}
        <ITorso cx={131} top={98} hw={9} bottom={118} color={ILLO.bright} />
        <IBand cx={131} top={116} hw={9} depth={7} color={ILLO.deep} />
        <ILimb d="M 127 123 L 127 127" color={ILLO.deep} w={5.5} />
        <ILimb d="M 135 123 L 135 127" color={ILLO.deep} w={5.5} />
        <IShoe cx={126.5} cy={129.5} rx={4.5} ry={2.6} />
        <IShoe cx={135.5} cy={129.5} rx={4.5} ry={2.6} />
        <circle cx="142.5" cy="100.5" r="2.6" fill={ILLO.amber} />
        <circle cx="150.5" cy="100.5" r="2.6" fill={ILLO.amber} />
        <circle cx="146.5" cy="105" r="6.2" fill={ILLO.amber} />
        <circle cx="146.5" cy="116" r="7.8" fill={ILLO.amber} />
        <circle cx="146.5" cy="107.5" r="3.1" fill={ILLO.butter} />
        <circle cx="144" cy="103.6" r="1" fill={ILLO.navy} />
        <circle cx="149" cy="103.6" r="1" fill={ILLO.navy} />
        <circle cx="146.5" cy="106.6" r="1.1" fill={ILLO.navy} />
        <ILimb d="M 138 103 Q 143 106 145 111" color={ILLO.bright} w={5.5} />
        <IHand x={146} y={112.5} r={3.6} skin={S.tan} />
        <IHead cx={131} cy={88} r={11} skin={S.tan} hair={H.chestnut} mood="gentle" />
        <ILeaf x={168} y={90} s={8} color={ILLO.green} rot={20} op={0.4} />
      </g>
    ),

    /* Tips 3: What makes it worse: the why and the threat, gently struck out.
       Object-led on purpose: never a distressed child (imagery lock). */
    tipAvoid: (
      <g>
        <IDisc cx={110} cy={74} r={56} tint={ILLO.tintRed} />
        <IGround cx={110} rx={74} tint={ILLO.tintRed} />
        <IBubble x={46} y={38} w={52} h={40} tail="bl" fill={ILLO.white} stroke={ILLO.slate} />
        <path d="M 65 55 Q 65 47 72 47 Q 79 47 79 53 Q 79 58 72 60 L 72 64" fill="none" stroke={ILLO.slate} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="72" cy="71" r="2.7" fill={ILLO.slate} />
        <line x1="40" y1="86" x2="102" y2="34" stroke={ILLO.red} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        <IBubble x={124} y={52} w={48} h={38} tail="bl" fill={ILLO.white} stroke={ILLO.slate} />
        <path d="M 148 60 L 148 74" fill="none" stroke={ILLO.slate} strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="148" cy="82" r="3" fill={ILLO.slate} />
        <line x1="118" y1="98" x2="178" y2="46" stroke={ILLO.red} strokeWidth="6" strokeLinecap="round" opacity="0.85" />
        {/* the settled pause underneath: the storm gets nothing to feed on */}
        <circle cx="94" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
        <circle cx="108" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
        <circle cx="122" cy="116" r="3" fill={ILLO.navy} opacity="0.28" />
        <ISparkle x={146} y={112} s={4} color={ILLO.green} op={0.75} />
      </g>
    ),

    /* Tips 4: Give it room to pass: lamp low, child settled on the cushion,
       parent present but a step back. */
    tipRoom: (
      <g>
        <IDisc cx={116} cy={78} r={58} tint={ILLO.tintAmber} />
        <path d="M 44 30 A 10 10 0 1 0 44 50 A 12.5 12.5 0 0 1 44 30 Z" fill={ILLO.amber} opacity="0.55" />
        <IGround cx={118} rx={80} tint={ILLO.tintAmber} />
        <path d="M 60 74 L 86 74 L 104 124 L 74 124 Z" fill="rgba(243,156,18,0.16)" />
        <line x1="73" y1="128" x2="73" y2="72" stroke={ILLO.slate} strokeWidth="3.4" strokeLinecap="round" />
        <ellipse cx="73" cy="128.5" rx="10" ry="3" fill={ILLO.slate} opacity="0.6" />
        <path d="M 59 74 L 87 74 L 80 56 L 66 56 Z" fill={ILLO.amber} />
        <IContact cx={126} rx={34} />
        <ellipse cx="126" cy="121" rx="27" ry="9" fill="#F5D9A6" />
        <ellipse cx="126" cy="124" rx="27" ry="6" fill="#E8C288" />
        <path d="M 112 118 Q 113 109 126 109 Q 139 109 140 118 Q 140 122 135 122 L 117 122 Q 112 122 112 118 Z" fill={ILLO.deep} />
        <IShoe cx={114} cy={119.5} rx={4} ry={2.2} rot={-18} />
        <IShoe cx={138} cy={119.5} rx={4} ry={2.2} rot={18} />
        <ITorso cx={126} top={90} hw={10} bottom={112} color={ILLO.bright} />
        <ILimb d="M 118 99 Q 116 105 120 110" color={ILLO.bright} w={6} />
        <IHand x={121} y={111} r={3.8} skin={S.deep} />
        <ILimb d="M 134 99 Q 136 105 132 110" color={ILLO.bright} w={6} />
        <IHand x={131} y={111} r={3.8} skin={S.deep} />
        <IHead cx={126} cy={79} r={11.5} skin={S.deep} hair={H.black} mood="calm" tilt={4} />
        {/* parent nearby, hands clasped, giving space */}
        <IContact cx={186} rx={22} />
        <ITorso cx={186} top={83} hw={12} bottom={108} color={ILLO.green} />
        <IBand cx={186} top={106} hw={12} depth={9} color={ILLO.greenDeep} />
        <ILimb d="M 180 115 L 180 124" color={ILLO.greenDeep} w={6.5} />
        <ILimb d="M 192 115 L 192 124" color={ILLO.greenDeep} w={6.5} />
        <IShoe cx={179} cy={127} rx={5.5} ry={3} />
        <IShoe cx={193} cy={127} rx={5.5} ry={3} />
        <ILimb d="M 177 91 Q 180 98 184 101" color={ILLO.green} w={7} />
        <ILimb d="M 195 91 Q 192 98 188 101" color={ILLO.green} w={7} />
        <IHand x={186} y={102} r={4.2} skin={S.tan} />
        <IHead cx={186} cy={71} r={12.5} skin={S.tan} hair={H.brown} mood="calm" bun />
        <ISparkle x={152} y={44} s={3.5} color={ILLO.amber} op={0.5} />
        <circle cx="96" cy="42" r="2.6" fill={ILLO.amber} opacity="0.4" />
      </g>
    ),

    /* Tips 5: Afterwards, reconnect first: the hug, heads together. */
    tipReconnect: (
      <g>
        <IDisc cx={110} cy={78} r={58} tint={ILLO.tintGreen} />
        <circle cx="110" cy="86" r="47" fill="none" stroke={ILLO.green} strokeWidth="2" opacity="0.12" />
        <IGround cx={110} rx={76} tint={ILLO.tintGreen} />
        <IContact cx={110} rx={44} />
        <path d="M 70 124 Q 68 92 92 84 Q 108 80 112 96 L 114 124 Z" fill={ILLO.green} />
        <path d="M 116 124 Q 114 98 130 96 Q 144 96 144 124 Z" fill={ILLO.bright} />
        <ILimb d="M 102 92 Q 124 96 138 108" color={ILLO.greenDeep} w={9} />
        <IHand x={140} y={110} r={4.5} skin={S.light} />
        <ILimb d="M 128 102 Q 112 106 104 114" color={ILLO.blue} w={7} />
        <IHand x={102} y={115} r={4} skin={S.light} />
        <IHead cx={92} cy={66} r={14} skin={S.light} hair={H.chestnut} mood="joy" tilt={10} />
        <IHead cx={128} cy={84} r={11} skin={S.light} hair={H.brown} mood="joy" tilt={-10} bun />
        <IHeart cx={118} cy={42} s={6} color={ILLO.red} op={0.9} />
        <ISparkle x={84} y={40} s={3} color={ILLO.green} op={0.6} />
        <ISparkle x={152} y={58} s={3.5} color={ILLO.green} op={0.6} />
      </g>
    ),

    /* Tips 6: Then write it down: the sofa, the tea, one honest line into the record. */
    tipWrite: (
      <g>
        <IDisc cx={112} cy={78} r={58} tint={ILLO.tintBlue} />
        <IGround cx={114} rx={82} tint={ILLO.tintBlue} />
        <IContact cx={110} rx={52} />
        <rect x="58" y="78" width="104" height="28" rx="12" fill="#D9E6F8" />
        <rect x="58" y="96" width="104" height="22" rx="10" fill="#C7D9F3" />
        <rect x="52" y="86" width="15" height="34" rx="7.5" fill="#D9E6F8" />
        <rect x="153" y="86" width="15" height="34" rx="7.5" fill="#D9E6F8" />
        <line x1="70" y1="120" x2="70" y2="127" stroke={ILLO.slate} strokeWidth="3.4" strokeLinecap="round" />
        <line x1="150" y1="120" x2="150" y2="127" stroke={ILLO.slate} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M 82 108 Q 84 98 100 98 Q 116 98 118 108 Q 118 112 112 112 L 88 112 Q 82 112 82 108 Z" fill={ILLO.deep} />
        <ITorso cx={100} top={78} hw={12} bottom={102} color={ILLO.blue} />
        <ILimb d="M 90 84 Q 84 92 88 98" color={ILLO.blue} w={7.5} />
        <IHand x={89} y={100} r={4.2} skin={S.medium} />
        <ILimb d="M 110 84 Q 118 90 121 95" color={ILLO.blue} w={7.5} />
        <IHead cx={100} cy={64} r={13.5} skin={S.medium} hair={H.black} mood="calm" />
        <g transform="rotate(-8 130 96)">
          <rect x="119" y="76" width="22" height="34" rx="4.5" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.2" />
          <rect x="123" y="84" width="14" height="4" rx="2" fill={ILLO.green} />
          <rect x="123" y="92" width="10" height="4" rx="2" fill={ILLO.faintRow} />
        </g>
        <IHand x={122} y={97} r={4.2} skin={S.medium} />
        <circle cx="152" cy="60" r="10" fill={ILLO.green} />
        <path d="M 147.5 60 l 3.4 3.4 l 6 -6.8" fill="none" stroke={ILLO.white} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="184" cy="97" rx="13" ry="4" fill={ILLO.wood} />
        <line x1="184" y1="100" x2="184" y2="126" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" />
        <rect x="177" y="84" width="13" height="10" rx="3" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2" />
        <path d="M 190 86.5 q 5 1.5 0 5" fill="none" stroke={ILLO.slate} strokeWidth="2" strokeLinecap="round" />
        <path d="M 181 79 q 2.5 -3 0 -6" fill="none" stroke={ILLO.slate} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <path d="M 186.5 79 q 2.5 -3 0 -6" fill="none" stroke={ILLO.slate} strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <ISparkle x={64} y={52} s={3.5} color={ILLO.bright} op={0.5} />
      </g>
    ),

    /* Tour 1: Welcome: parent and child hand in hand, the path ahead just beginning. */
    tourWelcome: (
      <g>
        <IDisc cx={110} cy={76} r={60} tint={ILLO.tintBlue} />
        <IGround cx={110} rx={82} tint={ILLO.tintBlue} />
        <IContact cx={96} rx={46} />
        <circle cx="168" cy="123" r="3" fill={ILLO.bright} opacity="0.5" />
        <circle cx="184" cy="116" r="2.6" fill={ILLO.bright} opacity="0.38" />
        <circle cx="197" cy="108" r="2.2" fill={ILLO.bright} opacity="0.26" />
        <ILimb d="M 78 86 Q 66 94 64 102" color={ILLO.blue} w={8} />
        <IHand x={64} y={104} r={4.5} skin={S.deep} />
        <ITorso cx={88} top={77} hw={15} bottom={104} color={ILLO.blue} />
        <IBand cx={88} top={102} hw={15} depth={10} color={ILLO.deep} />
        <ILimb d="M 81 112 L 81 124" color={ILLO.deep} w={7.5} />
        <ILimb d="M 95 112 L 95 124" color={ILLO.deep} w={7.5} />
        <IShoe cx={80} cy={128} rx={6.5} ry={3.2} />
        <IShoe cx={96} cy={128} rx={6.5} ry={3.2} />
        <IHead cx={88} cy={64} r={14} skin={S.deep} hair={H.black} mood="warm" />
        <ITorso cx={124} top={97} hw={9} bottom={116} color={ILLO.green} />
        <IBand cx={124} top={114} hw={9} depth={7} color={ILLO.greenDeep} />
        <ILimb d="M 120 121 L 120 126" color={ILLO.greenDeep} w={6} />
        <ILimb d="M 128 121 L 128 126" color={ILLO.greenDeep} w={6} />
        <IShoe cx={119.5} cy={129} rx={5} ry={2.8} />
        <IShoe cx={128.5} cy={129} rx={5} ry={2.8} />
        <ILimb d="M 100 84 Q 107 94 108 100" color={ILLO.blue} w={8} />
        <ILimb d="M 118 102 Q 113 103 110 103" color={ILLO.green} w={6} />
        <IHand x={108} y={102} r={4.5} skin={S.deep} />
        <ILimb d="M 131 102 Q 136 106 137 110" color={ILLO.green} w={6} />
        <IHand x={137.5} y={111} r={3.8} skin={S.brown} />
        <IHead cx={124} cy={86} r={11} skin={S.brown} hair={H.black} mood="warm" bun />
        <IHeart cx={164} cy={50} s={5} color={ILLO.red} op={0.75} />
        <ISparkle x={56} y={50} s={4} color={ILLO.bright} op={0.55} />
      </g>
    ),

    /* Tour 2: Start on Today: morning sun, the day on one screen, a plant by its side. */
    tourToday: (
      <g>
        <IDisc cx={118} cy={82} r={56} tint={ILLO.tintBlue} />
        <IGround cx={112} rx={78} tint={ILLO.tintBlue} />
        <ISun cx={50} cy={46} r={12} />
        <g opacity="0.9">
          <path d="M 156 40 q 4 -9 13 -8 q 3 -7 11 -5 q 8 2 8 9 q 7 1 6 8 q -1 6 -8 6 l -26 0 q -7 -1 -4 -10 Z"
            fill={ILLO.cream} stroke={ILLO.slate} strokeWidth="2" opacity="0.85" />
        </g>
        <IContact cx={118} rx={34} />
        <IPhone x={94} y={50} w={50} h={80} lines={3} accent={ILLO.bright} moodRow />
        <circle cx="147" cy="60" r="11" fill={ILLO.green} />
        <path d="M 142 60 l 3.6 3.6 l 6.5 -7.2" fill="none" stroke={ILLO.white} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="160" y1="118" x2="160" y2="105" stroke={ILLO.greenDeep} strokeWidth="2.4" strokeLinecap="round" />
        <ILeaf x={160} y={105} s={10} color={ILLO.green} rot={-148} op={0.95} />
        <ILeaf x={160} y={109} s={9} color={ILLO.green} rot={-28} op={0.9} />
        <path d="M 152 118 L 168 118 L 165.5 129 Q 160 131 154.5 129 Z" fill={ILLO.amberDeep} />
        <ISparkle x={70} y={78} s={3.5} color={ILLO.bright} op={0.5} />
      </g>
    ),

    /* Tour 3: A line is plenty: the plus button, one honest line, a crayon finishing it. */
    tourLog: (
      <g>
        <IDisc cx={104} cy={82} r={58} tint={ILLO.tintBlue} />
        <IGround cx={110} rx={78} tint={ILLO.tintBlue} />
        <IContact cx={114} rx={62} />
        <circle cx="74" cy="84" r="31" fill="none" stroke="rgba(58,123,212,0.3)" strokeWidth="3" />
        <circle cx="74" cy="84" r="25" fill={ILLO.blue} />
        <g stroke={ILLO.white} strokeWidth="5.5" strokeLinecap="round">
          <line x1="74" y1="72" x2="74" y2="96" />
          <line x1="62" y1="84" x2="86" y2="84" />
        </g>
        <rect x="114" y="56" width="72" height="56" rx="10" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.4" />
        <rect x="122" y="68" width="50" height="7" rx="3.5" fill={ILLO.faintRow} />
        <rect x="122" y="81" width="40" height="7" rx="3.5" fill={ILLO.faintRow} />
        <rect x="122" y="94" width="32" height="7" rx="3.5" fill={ILLO.bright} />
        <path d="M 152 100.5 L 158.5 97.5 L 155 91 Z" fill={ILLO.navy} />
        <ILimb d="M 158 92.5 L 172 78" color={ILLO.amber} w={7} />
        <circle cx="174.5" cy="75.5" r="3.6" fill={ILLO.amberDeep} />
        <ISparkle x={148} y={46} s={4.5} color={ILLO.amber} op={0.85} />
        <circle cx="130" cy="42" r="2.4" fill={ILLO.bright} opacity="0.45" />
      </g>
    ),

    /* Tour 4: At the gate: the railed school gate, the hedge, the school and
       its flag beyond, parent and child arriving hand in hand. */
    tourGate: (
      <g>
        <IDisc cx={120} cy={74} r={60} tint={ILLO.tintGreen} />
        <IGround cx={118} rx={84} tint={ILLO.tintGreen} />
        <IContact cx={140} rx={40} />
        <rect x="146" y="46" width="46" height="44" rx="3" fill={ILLO.cream} stroke={ILLO.slate} strokeWidth="2.2" />
        <path d="M 142 46 L 169 28 L 196 46 Z" fill={ILLO.bright} />
        <line x1="169" y1="28" x2="169" y2="18" stroke={ILLO.slate} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 169 18 L 180 21 L 169 24 Z" fill={ILLO.green} />
        <rect x="153" y="56" width="9" height="10" rx="2" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="1.8" />
        <rect x="176" y="56" width="9" height="10" rx="2" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="1.8" />
        <circle cx="150" cy="94" r="15" fill={ILLO.green} opacity="0.85" />
        <circle cx="174" cy="95" r="14" fill={ILLO.green} opacity="0.7" />
        <circle cx="196" cy="97" r="12" fill={ILLO.green} opacity="0.85" />
        <circle cx="130" cy="97" r="12" fill={ILLO.green} opacity="0.7" />
        {[121, 130, 139, 148].map(x => (
          <line key={x} x1={x} y1="80" x2={x} y2="124" stroke={ILLO.slate} strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        ))}
        <rect x="109" y="70" width="6" height="56" rx="3" fill={ILLO.slate} />
        <rect x="153" y="70" width="6" height="56" rx="3" fill={ILLO.slate} />
        <circle cx="112" cy="68" r="3.5" fill={ILLO.slate} />
        <circle cx="156" cy="68" r="3.5" fill={ILLO.slate} />
        <path d="M 112 72 Q 134 62 156 72" fill="none" stroke={ILLO.slate} strokeWidth="4" strokeLinecap="round" />
        <line x1="26" y1="88" x2="26" y2="116" stroke={ILLO.wood} strokeWidth="4" strokeLinecap="round" />
        <circle cx="26" cy="72" r="14" fill={ILLO.green} opacity="0.9" />
        <circle cx="17" cy="81" r="9.5" fill={ILLO.green} opacity="0.75" />
        <circle cx="35" cy="81" r="9.5" fill={ILLO.green} opacity="0.75" />
        <IContact cx={68} rx={36} />
        <ILimb d="M 44 84 Q 36 92 38 100" color={ILLO.green} w={8} />
        <IHand x={38} y={102} r={4.5} skin={S.tan} />
        <ITorso cx={54} top={77} hw={14} bottom={104} color={ILLO.green} />
        <IBand cx={54} top={102} hw={14} depth={10} color={ILLO.greenDeep} />
        <ILimb d="M 47 112 L 45 124" color={ILLO.greenDeep} w={7.5} />
        <ILimb d="M 61 112 L 63 124" color={ILLO.greenDeep} w={7.5} />
        <IShoe cx={44} cy={127.5} rx={6.5} ry={3.2} rot={-8} />
        <IShoe cx={64} cy={127.5} rx={6.5} ry={3.2} rot={8} />
        <IHead cx={54} cy={64} r={14} skin={S.tan} hair={H.brown} mood="calm" bun />
        <ITorso cx={84} top={98} hw={10} bottom={116} color={ILLO.bright} />
        <IBand cx={84} top={114} hw={10} depth={7} color={ILLO.deep} />
        <ILimb d="M 79 121 L 79 126" color={ILLO.deep} w={5.5} />
        <ILimb d="M 89 121 L 89 126" color={ILLO.deep} w={5.5} />
        <IShoe cx={78.5} cy={128.5} rx={4.5} ry={2.6} />
        <IShoe cx={89.5} cy={128.5} rx={4.5} ry={2.6} />
        <ILimb d="M 64 86 Q 70 96 72 100" color={ILLO.green} w={8} />
        <ILimb d="M 78 102 Q 76 102 74 102" color={ILLO.bright} w={5.5} />
        <IHand x={73} y={102} r={4} skin={S.tan} />
        <ILimb d="M 92 102 Q 99 96 103 89" color={ILLO.bright} w={5.5} />
        <IHand x={104} y={87} r={3.6} skin={S.tan} />
        <IHead cx={84} cy={86} r={10.5} skin={S.tan} hair={H.chestnut} mood="warm" />
        <ISparkle x={196} y={38} s={4} color={ILLO.amber} op={0.6} />
      </g>
    ),

    /* Tour 5: Their day, in their words: the child proudly holds the phone, happy face up. */
    tourChild: (
      <g>
        <IDisc cx={110} cy={78} r={58} tint={ILLO.tintGreen} />
        <IGround cx={110} rx={74} tint={ILLO.tintGreen} />
        <IContact cx={110} rx={38} />
        <ITorso cx={110} top={80} hw={16} bottom={112} color={ILLO.bright} />
        <IBand cx={110} top={110} hw={16} depth={9} color={ILLO.deep} />
        <ILimb d="M 101 119 L 101 125" color={ILLO.deep} w={7} />
        <ILimb d="M 119 119 L 119 125" color={ILLO.deep} w={7} />
        <IShoe cx={100} cy={128.5} rx={6} ry={3} />
        <IShoe cx={120} cy={128.5} rx={6} ry={3} />
        <ILimb d="M 97 84 Q 87 92 92 100" color={ILLO.bright} w={8} />
        <ILimb d="M 123 84 Q 133 92 128 100" color={ILLO.bright} w={8} />
        <IHead cx={110} cy={62} r={15} skin={S.light} hair={H.chestnut} mood="warm" />
        <g transform="rotate(-5 110 111)">
          <rect x="94" y="90" width="32" height="42" rx="6.5" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.4" />
          <rect x="97" y="93" width="26" height="36" rx="4.5" fill={ILLO.screen} />
          <circle cx="110" cy="105" r="8.5" fill={ILLO.butter} />
          <circle cx="107" cy="103.5" r="1.15" fill={ILLO.butterInk} />
          <circle cx="113" cy="103.5" r="1.15" fill={ILLO.butterInk} />
          <path d="M 106.5 107 q 3.5 3.6 7 0" fill="none" stroke={ILLO.butterInk} strokeWidth="1.5" strokeLinecap="round" />
          <rect x="101" y="118" width="18" height="4.5" rx="2.25" fill={ILLO.green} />
        </g>
        <IHand x={93.5} y={100} r={4.5} skin={S.light} />
        <IHand x={126.5} y={100} r={4.5} skin={S.light} />
        <ISparkle x={76} y={46} s={4.5} color={ILLO.amber} op={0.85} />
        <ISparkle x={146} y={40} s={5} color={ILLO.bright} op={0.7} />
        <circle cx="62" cy="70" r="2.6" fill={ILLO.green} opacity="0.45" />
        <circle cx="156" cy="66" r="3" fill={ILLO.green} opacity="0.4" />
      </g>
    ),

    /* Tour 6: Spot the pattern: the month grid under the glass, the pattern rising out. */
    tourPattern: (
      <g>
        <IDisc cx={106} cy={80} r={58} tint={ILLO.tintBlue} />
        <IGround cx={108} rx={76} tint={ILLO.tintBlue} />
        <IContact cx={104} rx={44} />
        <rect x="58" y="44" width="92" height="76" rx="10" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.4" />
        <path d="M 58 54 Q 58 44 68 44 L 140 44 Q 150 44 150 54 L 150 60 L 58 60 Z" fill={ILLO.blue} />
        <circle cx="80" cy="44" r="4.5" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.2" />
        <circle cx="128" cy="44" r="4.5" fill={ILLO.white} stroke={ILLO.slate} strokeWidth="2.2" />
        {patternColours.map((row, r) =>
          row.map((c, i) => (
            <circle key={r + '-' + i} cx={74 + i * 18} cy={72 + r * 16} r="4.5" fill={c} opacity="0.92" />
          ))
        )}
        {/* the magnifier finds the cluster */}
        <circle cx="126" cy="94" r="15.5" fill={ILLO.white} />
        <circle cx="121" cy="89" r="6" fill={ILLO.red} />
        <circle cx="132" cy="100" r="6" fill={ILLO.red} />
        <circle cx="133" cy="87" r="4" fill={ILLO.amber} />
        <circle cx="126" cy="94" r="17" fill="rgba(58,123,212,0.12)" stroke={ILLO.bright} strokeWidth="3.4" />
        <line x1="138" y1="106" x2="152" y2="120" stroke={ILLO.bright} strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="158" cy="72" r="2.4" fill={ILLO.bright} opacity="0.5" />
        <circle cx="166" cy="62" r="2.8" fill={ILLO.bright} opacity="0.65" />
        <ISparkle x={176} y={50} s={5} color={ILLO.amber} op={0.9} />
      </g>
    ),

    /* Tour 7: Nothing leaves your phone: the record on its phone, inside the shield's quiet orbit. */
    tourPrivate: (
      <g>
        <IDisc cx={108} cy={80} r={58} tint={ILLO.tintBlue} />
        <IGround cx={110} rx={72} tint={ILLO.tintBlue} />
        <IContact cx={106} rx={40} />
        <g transform="rotate(-12 110 88)">
          <ellipse cx="110" cy="88" rx="60" ry="36" fill="none" stroke={ILLO.bright} strokeWidth="2.2"
            strokeLinecap="round" strokeDasharray="0.5 9" opacity="0.55" />
        </g>
        <IPhone x={76} y={48} w={44} h={74} lines={3} accent={ILLO.bright} />
        <path d="M 137 64 C 145 68 152 69 158 68 C 160 88 153 102 137 110 C 121 102 114 88 116 68 C 122 69 129 68 137 64 Z" fill={ILLO.blue} />
        <path d="M 137 64 C 145 68 152 69 158 68 C 160 88 153 102 137 110 Z" fill={ILLO.bright} />
        <path d="M 128.5 86 l 5.5 5.5 l 10.5 -11.5" fill="none" stroke={ILLO.white} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <ISparkle x={58} y={44} s={3.5} color={ILLO.bright} op={0.5} />
        <circle cx="160" cy="120" r="3" fill={ILLO.blue} opacity="0.3" />
      </g>
    ),

    /* Tour 8: You are ready: off they go together, sun up, a bird ahead. */
    tourReady: (
      <g>
        <IDisc cx={112} cy={76} r={60} tint={ILLO.tintGreen} />
        <IGround cx={112} rx={80} tint={ILLO.tintGreen} />
        <ISun cx={174} cy={42} r={10} />
        <circle cx="150" cy="120" r="2.8" fill={ILLO.green} opacity="0.5" />
        <circle cx="166" cy="113" r="2.5" fill={ILLO.green} opacity="0.4" />
        <circle cx="180" cy="105" r="2.2" fill={ILLO.green} opacity="0.3" />
        {/* a little bird flying ahead */}
        <path d="M 134.5 58 L 128 61.5 L 133.5 60.5 Z" fill={ILLO.blue} />
        <ellipse cx="139" cy="57" rx="5.5" ry="4.5" fill={ILLO.bright} />
        <ILeaf x={134} y={55.5} s={7} color={ILLO.blue} rot={-32} />
        <path d="M 144.5 56 L 149.5 57.5 L 144.5 59 Z" fill={ILLO.amber} />
        <circle cx="141.5" cy="55.5" r="0.95" fill={ILLO.navy} />
        <IContact cx={84} rx={34} />
        <ILimb d="M 70 86 Q 63 94 66 102" color={ILLO.blue} w={8} />
        <IHand x={66.5} y={104} r={4.5} skin={S.medium} />
        <ITorso cx={84} top={77} hw={14} bottom={104} color={ILLO.blue} />
        <IBand cx={84} top={102} hw={14} depth={10} color={ILLO.deep} />
        <ILimb d="M 77 112 L 72 124" color={ILLO.deep} w={7.5} />
        <ILimb d="M 91 112 L 96 124" color={ILLO.deep} w={7.5} />
        <IShoe cx={71} cy={127.5} rx={6.5} ry={3.2} rot={-10} />
        <IShoe cx={97} cy={127.5} rx={6.5} ry={3.2} rot={10} />
        <ILimb d="M 96 84 Q 106 90 110 96" color={ILLO.blue} w={8} />
        <IHand x={111} y={97.5} r={4.5} skin={S.medium} />
        <IHead cx={84} cy={64} r={14} skin={S.medium} hair={H.darkgrey} mood="warm" />
        <IContact cx={128} rx={24} />
        <ITorso cx={127} top={96} hw={10} bottom={114} color={ILLO.green} />
        <IBand cx={127} top={112} hw={10} depth={7} color={ILLO.greenDeep} />
        <ILimb d="M 123 119 L 121 126" color={ILLO.greenDeep} w={6} />
        <ILimb d="M 131 119 L 135 125" color={ILLO.greenDeep} w={6} />
        <IShoe cx={120.5} cy={129} rx={5} ry={2.8} />
        <IShoe cx={137} cy={127.5} rx={5} ry={2.8} rot={14} />
        <ILimb d="M 133 99 Q 143 90 143.5 78" color={ILLO.green} w={6} />
        <IHand x={143.5} y={75.5} r={3.8} skin={S.medium} />
        <ILimb d="M 120 100 Q 115 104 114 108" color={ILLO.green} w={6} />
        <IHand x={113.5} y={109} r={3.8} skin={S.medium} />
        <IHead cx={127} cy={84} r={11} skin={S.medium} hair={H.black} mood="warm" />
        <ILeaf x={52} y={62} s={8} color={ILLO.green} rot={-30} op={0.5} />
        <ILeaf x={60} y={74} s={7} color={ILLO.green} rot={24} op={0.4} />
      </g>
    ),
  };
  /* Image deck first, SVG deck as the fallback. The intrinsic width/height
     attributes hand the browser the aspect ratio up front so the slide does not
     reflow as the image lands. */
  const imgSrc = STORY_IMAGES[scene];
  if (imgSrc) {
    // `width` is a MAX here, not a fixed size: a square illustration is much taller
    // than the old 3:2 one, so on a short phone at the largest text size a fixed
    // width would push the copy off the slide. Shrink to fit instead.
    return (
      <img src={imgSrc} alt="" aria-hidden="true" width={STORY_IMAGE_W} height={STORY_IMAGE_H}
        className="j-illo-img" style={{ maxWidth: width }} />
    );
  }
  return (
    <svg width={width} height={Math.round(width * 150 / 220)} viewBox="0 0 220 150" aria-hidden="true" style={{ display: 'block' }}>
      {scenes[scene] || scenes.tourWelcome}
    </svg>
  );
}

Object.assign(window, { Face, MoodDot, MOOD_COLOURS, Wordmark, JotlaLogo, ChildAvatar, SceneIllo, StoryIllo, STORY_IMAGES, readAvatarPhoto, fileToDataURL, PhotoCropper });
