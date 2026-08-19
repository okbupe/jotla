// jotla-app.jsx: shell: router, persistent header, tab bar, dark mode, profiles, persistence, scaling.
const {
  useState: useStateApp,
  useEffect: useEffectApp,
  useRef: useRefApp,
  useCallback
} = React;

// Redesign nav (locked 2026-08-06): five tabs, Find between Documents and Menu,
// no centre log button: the floating FAB is the one add affordance.
const TAB_DEFS = [['today', 'Today', 'today'], ['month', 'Month', 'calendar'], ['evidence', 'Documents', 'doc'], ['find', 'Find', 'search'], ['settings', 'Menu', 'menu']];
const TAB_NAMES = ['today', 'month', 'evidence', 'find', 'settings'];
const NAV_KEY = 'jotla_nav_v3'; // v3: history remembers the tab as well as the view
const ENTRIES_KEY = 'jotla_entries_v5'; // v5: the full every-area Monday joins the sample record (v4: the six-month generated history)
const DOCS_KEY = 'jotla_docs_v2';
const PREF_KEY = 'jotla_prefs_v2';
const SEED_ANCHOR_KEY = 'jotla_seed_anchor_v1';
// THE DEVICE TAG (Family Sync groundwork, founder go 15 Aug): every phone
// mints one short tag, once, and every new entry and document carries it,
// suffixed into the id (globally unique across a future paired family, no
// migration later) and stamped as `by` (the "Logged by" author when sync
// arrives). Costs nothing today; saves a painful migration in the native app.
const DEVICE = (() => {
  try {
    let d = localStorage.getItem('jotla_device_v1');
    if (!d) {
      d = Math.random().toString(36).slice(2, 8);
      localStorage.setItem('jotla_device_v1', d);
    }
    return d;
  } catch (e) {
    return 'local';
  }
})();
window.JOTLA_DEVICE = DEVICE;
function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    if (!window.__jotlaQuotaWarned) {
      window.__jotlaQuotaWarned = true;
      alert('Storage on this device is full, so the latest change could not be saved. Export your data from Settings, then remove some photos to free space.');
    }
  }
}

// ---------- error boundaries ----------
// One bad entry must never blank the whole record. The screen boundary keeps the
// header and tab bar alive so the parent can still reach Settings and export;
// the app boundary is the last-resort net if the shell itself fails.
class ScreenBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      broken: false
    };
  }
  static getDerivedStateFromError() {
    return {
      broken: true
    };
  }
  componentDidCatch(err) {
    try {
      console.error('Jotla screen error:', err);
    } catch (e) {}
  }
  render() {
    if (!this.state.broken) return this.props.children;
    return /*#__PURE__*/React.createElement("div", {
      className: "j-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "j-scroll"
    }, /*#__PURE__*/React.createElement("div", {
      className: "j-pad",
      style: {
        paddingTop: 48,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "'Cal Sans', system-ui",
        fontWeight: 500,
        fontSize: 'calc(20px * var(--tscale, 1))',
        color: 'var(--ink)',
        margin: '0 0 10px'
      }
    }, "This screen hit a problem"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "'Outfit', system-ui",
        fontSize: 'calc(15px * var(--tscale, 1))',
        color: 'var(--muted)',
        lineHeight: 1.55,
        margin: '0 0 8px'
      }
    }, "Your record is safe on this device. Nothing has been lost."), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "'Outfit', system-ui",
        fontSize: 'calc(15px * var(--tscale, 1))',
        color: 'var(--muted)',
        lineHeight: 1.55,
        margin: 0
      }
    }, "Try another tab. If this keeps happening, save a copy with Export my data in Settings, then tell us what you think."))));
  }
}
class AppBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      broken: false
    };
  }
  static getDerivedStateFromError() {
    return {
      broken: true
    };
  }
  componentDidCatch(err) {
    try {
      console.error('Jotla app error:', err);
    } catch (e) {}
  }
  render() {
    if (!this.state.broken) return this.props.children;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F9FC',
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 340,
        textAlign: 'center',
        fontFamily: "'Outfit', system-ui, sans-serif"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "'Cal Sans', system-ui",
        fontWeight: 500,
        fontSize: 'calc(22px * var(--tscale, 1))',
        color: '#14223b',
        margin: '0 0 10px'
      }
    }, "Jotla hit a problem opening"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'calc(15px * var(--tscale, 1))',
        color: '#4a5875',
        lineHeight: 1.55,
        margin: '0 0 16px'
      }
    }, "Your record is still safe on this device. Nothing has been lost."), /*#__PURE__*/React.createElement("button", {
      onClick: () => this.setState({
        broken: false
      }),
      style: {
        fontFamily: "'Outfit', system-ui",
        fontSize: 'calc(16px * var(--tscale, 1))',
        fontWeight: 500,
        color: '#fff',
        background: '#1A56A8',
        border: 'none',
        borderRadius: 999,
        padding: '12px 28px',
        cursor: 'pointer'
      }
    }, "Try again"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: '#8291ad',
        lineHeight: 1.5,
        margin: '16px 0 0'
      }
    }, "If this keeps happening, email hello@sen.help and we will help.")));
  }
}
// Test hook for the boot-and-assert suite only: lets the suite prove the screen
// boundary works without corrupting real data. Never set in normal use.
function CrashProbe() {
  throw new Error('Jotla test: deliberate screen crash');
}

// Sample data is anchored near "today" at first load; when the app is opened again
// weeks later, re-anchor the stored sample entries so the demo never goes stale.
// Real records (SEED_SHIFTING false) are never touched.
const SEED_ID_RE = /^(e|m|d)\d+$/;
function shiftISO(iso, days) {
  const d = window.JOTLA.parseISO(iso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function loadSeedAware(key, seeds, dateKey) {
  const J = window.JOTLA;
  const stored = loadJSON(key, null);
  if (!stored) return seeds;
  if (!J.SEED_SHIFTING) return stored;
  const anchor = loadJSON(SEED_ANCHOR_KEY, null);
  if (!anchor || anchor === J.TODAY_ISO) return stored;
  const shift = Math.round((J.parseISO(J.TODAY_ISO) - J.parseISO(anchor)) / 86400000 / 7) * 7;
  if (!shift) return stored;
  return stored.map(x => SEED_ID_RE.test(x.id) ? {
    ...x,
    [dateKey]: shiftISO(x[dateKey], shift)
  } : x);
}

// ---------- persistent app header ----------
// Tap the avatar to switch child; press and hold to open that child's options.
// The persistent app header is GONE (redesign, 6 Aug): no chrome above the
// screens. Each screen leads with its own big Cal Sans title; the wordmark's
// homes are the splash and About; the child lives as the Menu tab's title;
// Documents is a tab of its own.

// ---------- tab bar: five tabs, colour-only active state ----------
// Each icon answers the press with its OWN tiny animation before settling into
// the blue active state (founder, 8 Aug: "unique to the icon, even if subtle"):
// today breathes, the calendar flips a page, the document lifts, the magnifier
// sweeps, the menu pops. Keyframes live in jotla.css (j-nav-*); the pressed
// class rides React state and clears on animationend, and prefers-reduced-motion
// switches the whole thing off.
function TabBar({
  active,
  onTab
}) {
  const [pressed, setPressed] = useStateApp(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "j-tabbar"
  }, TAB_DEFS.map(([name, label, icon]) => {
    const on = active === name;
    return /*#__PURE__*/React.createElement("button", {
      key: name,
      className: 'j-tab' + (on ? ' j-tab-on' : ''),
      onClick: () => {
        setPressed(name);
        onTab(name);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: 'j-tab-ic' + (pressed === name ? ' j-nav-go-' + icon : ''),
      onAnimationEnd: () => setPressed(p => p === name ? null : p)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 24,
      color: on ? 'var(--blue)' : 'var(--faint)',
      stroke: on ? 2.2 : 2
    })), /*#__PURE__*/React.createElement("span", null, label));
  }));
}

// ---------- profile switcher sheet ----------
function ProfileSheet({
  profiles,
  activeId,
  onPick,
  onAddChild,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: 4
    }
  }, "Whose day is this?"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 18
    }
  }, "Switch between the children you keep a record for."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, profiles.map(p => {
    const on = p.id === activeId;
    return /*#__PURE__*/React.createElement("button", {
      key: p.id,
      className: "j-press",
      onClick: () => onPick(p.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: 16,
        border: on ? '1.5px solid var(--blue)' : '1px solid var(--line)',
        background: on ? 'var(--tint-blue)' : 'var(--card)',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(ChildAvatar, {
      profile: p,
      size: 46
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: "'Cal Sans', system-ui",
        fontWeight: 500,
        fontSize: 'calc(18px * var(--tscale, 1))',
        color: 'var(--ink)'
      }
    }, p.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: 'var(--faint)',
        marginTop: 1
      }
    }, p.year, " \xB7 ", p.school)), on && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 20,
      color: "var(--blue)"
    }));
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: onAddChild,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      borderRadius: 16,
      border: '1.5px dashed var(--chip-border)',
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: 'var(--tint-blue)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 22,
    color: "var(--blue)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(16px * var(--tscale, 1))',
      fontWeight: 500,
      color: 'var(--blue)'
    }
  }, "Add a child")))));
}

// ---------- child options / details sheet ----------
// Redesign (6 Aug): the initial leads as the default avatar, and moon, sun and
// music join the set: 14 avatars matching the 14 colours.
const CHILD_GLYPHS = ['initial', 'person', 'heart', 'star', 'leaf', 'shield', 'bell', 'hand', 'today', 'note', 'sun', 'music'];
function ChildOptionsSheet({
  profile,
  entries = [],
  docs = [],
  canDelete = true,
  onChange,
  onDelete,
  onReset,
  onResetAll,
  onClose
}) {
  const J = window.JOTLA;
  const [dangerMode, setDangerMode] = useStateApp(null); // null | 'delete' | 'reset' | 'resetAll'
  const [cropSrc, setCropSrc] = useStateApp(null);
  // The adults around the child (the circle): chips edit live like every other
  // field in this sheet, deduped case-insensitively. Done counts a name still
  // sitting in the box (parents tap Done expecting it), like onboarding's Create.
  const [adultDraft, setAdultDraft] = useStateApp('');
  const adults = profile.adults || [];
  const addAdult = () => {
    const n = adultDraft.trim();
    if (!n) return;
    if (!adults.some(a => a.toLowerCase() === n.toLowerCase())) onChange({
      adults: [...adults, n]
    });
    setAdultDraft('');
  };
  const done = () => {
    const pending = adultDraft.trim();
    if (pending && !adults.some(a => a.toLowerCase() === pending.toLowerCase())) onChange({
      adults: [...adults, pending]
    });
    onClose();
  };
  const Cropper = window.PhotoCropper;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation(),
    style: {
      maxHeight: '90%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(ChildAvatar, {
    profile: profile,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      marginBottom: 2
    }
  }, profile.name, "'s details"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, "Update anything that changes over time."))), /*#__PURE__*/React.createElement(FieldLabel, null, "Photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(ChildAvatar, {
    profile: profile,
    size: 60
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "j-press",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '10px 14px',
      borderRadius: 12,
      cursor: 'pointer',
      background: 'var(--tint-blue)',
      color: 'var(--blue)',
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 18,
    color: "var(--blue)"
  }), " ", profile.photo ? 'Change photo' : 'Upload a photo', /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      const f = e.target.files && e.target.files[0];
      if (f) window.fileToDataURL(f, url => setCropSrc(url));
      e.target.value = '';
    }
  })), profile.photo && /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => onChange({
      photo: null
    }),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '10px 14px',
      borderRadius: 12,
      cursor: 'pointer',
      background: 'var(--card)',
      border: '1px solid var(--chip-border)',
      color: 'var(--muted)',
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 17,
    color: "var(--muted)"
  }), " Remove"))), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 20
    }
  }, profile.photo ? 'Using a photo. If you remove it, the avatar below is shown instead.' : 'Add a real photo for a personal touch, or pick an avatar below.'), /*#__PURE__*/React.createElement(FieldLabel, null, "Avatar"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, CHILD_GLYPHS.map(g => {
    const on = (profile.glyph || 'person') === g;
    return /*#__PURE__*/React.createElement("button", {
      key: g,
      onClick: () => onChange({
        glyph: g
      }),
      "aria-label": 'Avatar ' + g,
      className: "j-press",
      style: {
        width: 56,
        height: 56,
        borderRadius: 16,
        cursor: 'pointer',
        border: on ? '2px solid var(--blue)' : '1.5px solid var(--line)',
        background: on ? 'var(--tint-blue)' : 'var(--card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(ChildAvatar, {
      profile: {
        ...profile,
        glyph: g,
        photo: null
      },
      size: 40,
      ring: false
    }));
  })), /*#__PURE__*/React.createElement(FieldLabel, null, "Colour"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, J.AVATAR_COLOURS.map(c => {
    const on = profile.figure === c.figure;
    return /*#__PURE__*/React.createElement("button", {
      key: c.key,
      onClick: () => onChange({
        figure: c.figure
      }),
      "aria-label": 'Colour ' + c.key,
      className: "j-press",
      style: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        cursor: 'pointer',
        background: c.figure,
        border: '3px solid var(--card)',
        boxShadow: on ? '0 0 0 2.5px var(--ink)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)'
      }
    });
  })), /*#__PURE__*/React.createElement(FieldLabel, null, "Name"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.name,
    onChange: e => onChange({
      name: e.target.value
    }),
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "School or setting"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.school,
    onChange: e => onChange({
      school: e.target.value
    }),
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "Year group"), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: profile.year,
    onChange: e => onChange({
      year: e.target.value
    }),
    style: {
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement(FieldLabel, null, "The adults around ", (profile.name || '').trim() || 'them'), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 10
    }
  }, "Their teacher, TA or club leader. One-tap answers when ", (profile.name || '').trim() || 'your child', " is asked who was with them."), adults.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10
    }
  }, adults.map(a => /*#__PURE__*/React.createElement("button", {
    key: a,
    className: "j-press",
    onClick: () => onChange({
      adults: adults.filter(x => x !== a)
    }),
    "aria-label": 'Remove ' + a,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: '1.5px solid var(--chip-border)',
      background: 'var(--card)',
      borderRadius: 999,
      padding: '8px 14px',
      cursor: 'pointer',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, a, " ", /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 14,
    color: "var(--faint)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 22,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: adultDraft,
    onChange: e => setAdultDraft(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addAdult();
      }
    },
    placeholder: "Mrs Price, Mr Okafor the TA...",
    "aria-label": "Add an adult",
    style: {
      flex: 1,
      minWidth: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    onClick: addAdult,
    disabled: !adultDraft.trim(),
    style: {
      width: 'auto',
      flexShrink: 0,
      padding: '0 22px',
      ...(adultDraft.trim() ? {} : {
        opacity: 0.5,
        cursor: 'default'
      })
    }
  }, "Add")), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: done
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 20,
    color: "#fff"
  }), " Done"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26,
      paddingTop: 20,
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(13px * var(--tscale, 1))',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#C0392B',
      margin: '0 0 10px'
    }
  }, "Danger zone"), (() => {
    const dangerBtn = (title, sub, onClick) => /*#__PURE__*/React.createElement("button", {
      key: title,
      className: "j-press",
      onClick: onClick,
      style: {
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        border: '1.5px solid rgba(231,76,60,0.4)',
        background: 'rgba(231,76,60,0.06)',
        borderRadius: 14,
        padding: '13px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(231,76,60,0.12)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 18,
      color: "#E74C3C"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: "'Outfit', system-ui",
        fontSize: 'calc(15.5px * var(--tscale, 1))',
        fontWeight: 500,
        color: '#C0392B'
      }
    }, title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(12.5px * var(--tscale, 1))',
        color: 'var(--faint)',
        marginTop: 1
      }
    }, sub)), /*#__PURE__*/React.createElement(Icon, {
      name: "chevronRight",
      size: 18,
      color: "#E74C3C"
    }));
    return canDelete ? [dangerBtn('Reset this child', 'Clear all logs and documents, keep ' + profile.name + "'s profile", () => setDangerMode('reset')), dangerBtn('Delete this child', 'Permanently remove ' + profile.name + "'s record", () => setDangerMode('delete'))] : [dangerBtn('Reset all data', 'Erase everything and start over from a blank app', () => setDangerMode('resetAll')), /*#__PURE__*/React.createElement("p", {
      key: "note",
      className: "j-sm",
      style: {
        color: 'var(--faint)',
        marginTop: 2
      }
    }, "This is your only child, so there is nothing else to switch to. Reset all data wipes the whole app back to the start.")];
  })())), dangerMode && /*#__PURE__*/React.createElement(DeleteChildSheet, {
    mode: dangerMode,
    profile: profile,
    entries: entries,
    docs: docs,
    onClose: () => setDangerMode(null),
    onConfirm: () => {
      const m = dangerMode;
      setDangerMode(null);
      onClose();
      if (m === 'reset') onReset && onReset();else if (m === 'resetAll') onResetAll && onResetAll();else onDelete && onDelete();
    }
  }), cropSrc && /*#__PURE__*/React.createElement(Cropper, {
    src: cropSrc,
    onDone: url => {
      onChange({
        photo: url
      });
      setCropSrc(null);
    },
    onCancel: () => setCropSrc(null)
  }));
}

// ---------- delete child: guarded, multi-step, with a backup escape hatch ----------
function DeleteChildSheet({
  profile,
  entries,
  docs,
  onConfirm,
  onClose,
  mode = 'delete'
}) {
  const [stage, setStage] = useStateApp('warn'); // warn | confirm
  const [backedUp, setBackedUp] = useStateApp(false);
  const [ack, setAck] = useStateApp(false);
  const [typed, setTyped] = useStateApp('');
  const RED = '#E74C3C',
    RED_DEEP = '#C0392B',
    RED_TINT = 'rgba(231,76,60,0.10)';
  const name = profile.name;
  const nEntries = entries.length,
    nDocs = docs.length;
  // One guarded journey, three modes (founder ask, 15 Jul 2026): delete a child,
  // reset a child (keep the profile, clear the data), or reset all data (full
  // wipe). Reset confirms on the word RESET; delete on DELETE.
  const isReset = mode === 'reset' || mode === 'resetAll';
  const keepsProfile = mode === 'reset';
  const WORD = isReset ? 'RESET' : 'DELETE';
  const ready = ack && typed.trim().toUpperCase() === WORD;
  const titleWarn = mode === 'reset' ? 'Reset ' + name + "'s record?" : mode === 'resetAll' ? 'Reset all data?' : 'Delete ' + name + "'s record?";
  const leadWarn = keepsProfile ? 'This erases everything logged for ' + name + ', but keeps their profile so you can start their record fresh. It cannot be undone, and there is no copy we can restore for you.' : 'This permanently erases everything below. It cannot be undone, and because nothing leaves this phone there is no copy we can restore for you.';
  const continueLabel = isReset ? 'Continue to reset' : 'Continue to delete';
  const cancelLabel = isReset ? 'Cancel, keep everything' : 'Keep this record';
  const ackLabel = keepsProfile ? 'I understand this permanently erases every log and document for ' + name + '.' : mode === 'resetAll' ? 'I understand this permanently erases every child, log and document in the app.' : 'I understand this permanently deletes ' + name + "'s record and everything in it.";
  const confirmLabel = mode === 'reset' ? 'Reset ' + name + "'s record" : mode === 'resetAll' ? 'Erase everything and start over' : 'Delete ' + name + "'s record permanently";
  const backup = () => {
    try {
      const payload = {
        app: 'Jotla',
        exportedAt: new Date().toISOString(),
        child: profile,
        entries,
        documents: docs
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jotla-' + name.replace(/\s+/g, '-').toLowerCase() + '-backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) {}
    setBackedUp(true);
  };
  const consequences = [[nEntries + (nEntries === 1 ? ' logged moment' : ' logged moments'), 'Every quick log and dysregulation note you have written.'], [nDocs + (nDocs === 1 ? ' saved document' : ' saved documents'), 'Letters, reports and plans kept in the vault.'], ...(keepsProfile ? [] : [[name + "'s profile", 'Their name, avatar, colour and settings.']])];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose,
    style: {
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation(),
    style: {
      maxHeight: '92%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: RED_TINT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 23,
    color: RED
  }))), stage === 'warn' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      textAlign: 'center',
      marginBottom: 4
    }
  }, titleWarn), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginBottom: 12
    }
  }, leadWarn), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid rgba(231,76,60,0.3)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12
    }
  }, consequences.map(([h, b], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      padding: '10px 14px',
      alignItems: 'flex-start',
      borderBottom: i < consequences.length - 1 ? '1px solid var(--line)' : 'none',
      background: i === 0 ? RED_TINT : 'transparent'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: RED,
    style: {
      flexShrink: 0,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: 0
    }
  }, h), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 1
    }
  }, b))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--tint-blue)',
      borderRadius: 16,
      padding: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginBottom: backedUp ? 12 : 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 20,
    color: "var(--blue)",
    style: {
      flexShrink: 0,
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--blue)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, "Back up first."), " Save a copy of ", name, "'s record to your phone before you continue. You can keep it, or reimport it later.")), backedUp ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--green-ink)',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: "var(--green)"
  }), " Backup saved to your device. You can re-save it.", /*#__PURE__*/React.createElement("button", {
    onClick: backup,
    className: "j-press",
    style: {
      marginLeft: 'auto',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--blue)',
      fontSize: 'calc(13.5px * var(--tscale, 1))',
      fontWeight: 600
    }
  }, "Save again")) : /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    onClick: backup,
    style: {
      marginTop: 10,
      minHeight: 48
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 19,
    color: "var(--blue)"
  }), " ", 'Back up ' + name + "'s record")), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-lg",
    style: {
      background: RED,
      color: '#fff',
      marginBottom: 10,
      boxShadow: '0 10px 22px -10px rgba(231,76,60,0.6)'
    },
    onClick: () => setStage('confirm')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowRight",
    size: 20,
    color: "#fff"
  }), " ", continueLabel), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    onClick: onClose
  }, cancelLabel)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, "Last check"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginBottom: 18
    }
  }, backedUp ? 'Your backup is saved. ' : 'You have not made a backup. ', "To finish, confirm you understand and type ", WORD, "."), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    onClick: () => setAck(a => !a),
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      border: ack ? '1.5px solid ' + RED : '1.5px solid var(--line)',
      background: ack ? RED_TINT : 'var(--card)',
      borderRadius: 14,
      padding: '13px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      borderRadius: 7,
      flexShrink: 0,
      border: ack ? 'none' : '1.5px solid var(--chip-border)',
      background: ack ? RED : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, ack && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, ackLabel)), /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    value: typed,
    onChange: e => setTyped(e.target.value),
    placeholder: 'Type ' + WORD + ' to confirm',
    autoCapitalize: "characters",
    style: {
      marginBottom: 18,
      textAlign: 'center',
      letterSpacing: '0.12em',
      fontWeight: 600
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-lg",
    disabled: !ready,
    onClick: () => ready && onConfirm(),
    style: {
      background: RED,
      color: '#fff',
      marginBottom: 10,
      opacity: ready ? 1 : 0.45,
      cursor: ready ? 'pointer' : 'default',
      boxShadow: ready ? '0 10px 22px -10px rgba(231,76,60,0.6)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    color: "#fff"
  }), " ", confirmLabel), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    onClick: () => setStage('warn')
  }, "Back"))));
}

// The Bin (founder ask, 15 Jul 2026): deleted logs and documents wait here for
// 30 days. Restore puts one back, Delete forever removes it now, Empty the Bin
// clears the lot. Deleting or resetting a CHILD never lands here: that stays a
// permanent erase, exactly as the danger zone warns.
function BinScreen({
  nav,
  entries = [],
  docs = [],
  today
}) {
  const J = window.JOTLA;
  const daysLeft = deletedAt => {
    try {
      const used = Math.floor((J.parseISO(today) - J.parseISO(deletedAt)) / 86400000);
      return Math.max(0, 30 - used);
    } catch (e) {
      return 30;
    }
  };
  const empty = entries.length === 0 && docs.length === 0;
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10
  };
  const titleStyle = {
    display: 'block',
    fontFamily: "'Outfit', system-ui",
    fontWeight: 500,
    fontSize: 'calc(15px * var(--tscale, 1))',
    color: 'var(--ink)'
  };
  const subStyle = {
    display: 'block',
    fontSize: 'calc(12.5px * var(--tscale, 1))',
    color: 'var(--faint)',
    marginTop: 1
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Recycle Bin",
    subtitle: "Deleted logs and documents, kept for 30 days",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 120
    }
  }, empty ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 20px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 30,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      marginTop: 10,
      color: 'var(--muted)'
    }
  }, "The Bin is empty."), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginTop: 4
    }
  }, "A log or document you delete waits here for 30 days, so a mis-tap is never the end of it.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 12
    }
  }, "Anything here is restored with one tap. After 30 days it clears itself."), entries.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    className: "j-card j-card-pad",
    style: rowStyle
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: titleStyle
  }, e.summary ? e.summary.length > 58 ? e.summary.slice(0, 56) + '...' : e.summary : 'A logged moment'), /*#__PURE__*/React.createElement("span", {
    style: subStyle
  }, J.fmtShort(e.date), " \xB7 note \xB7 ", daysLeft(e.deletedAt), " ", daysLeft(e.deletedAt) === 1 ? 'day' : 'days', " left")), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      width: 'auto',
      flexShrink: 0,
      minHeight: 40,
      padding: '0 14px'
    },
    onClick: () => nav.restoreEntry(e.id)
  }, "Restore"), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    "aria-label": "Delete forever",
    onClick: () => {
      if (window.confirm('Delete this note for good? This cannot be undone.')) nav.purgeEntry(e.id);
    },
    style: {
      flexShrink: 0,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: "#E74C3C"
  })))), docs.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.id,
    className: "j-card j-card-pad",
    style: rowStyle
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: titleStyle
  }, d.title || 'A document'), /*#__PURE__*/React.createElement("span", {
    style: subStyle
  }, d.typeOther || d.type || 'Document', " \xB7 document \xB7 ", daysLeft(d.deletedAt), " ", daysLeft(d.deletedAt) === 1 ? 'day' : 'days', " left")), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      width: 'auto',
      flexShrink: 0,
      minHeight: 40,
      padding: '0 14px'
    },
    onClick: () => nav.restoreDoc(d.id)
  }, "Restore"), /*#__PURE__*/React.createElement("button", {
    className: "j-press",
    "aria-label": "Delete forever",
    onClick: () => {
      if (window.confirm('Delete this document for good? This cannot be undone.')) nav.purgeDoc(d.id);
    },
    style: {
      flexShrink: 0,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: "#E74C3C"
  })))), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 10,
      color: '#C0392B'
    },
    onClick: () => {
      if (window.confirm('Empty the Bin? Everything in it is deleted for good. This cannot be undone.')) nav.emptyBin();
    }
  }, "Empty the Bin")))));
}

// The monthly backup nudge (founder ask, 15 Jul 2026): shown on the first open
// of a new month. Local and honest: it saves a copy to the phone and reminds
// the parent to keep their own device backup on. Jotla stays account-free.
function BackupReminder({
  childName,
  onExport,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: onClose,
    style: {
      zIndex: 45
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-grab"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: 'var(--tint-blue)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 26,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, "Time for a backup?"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginBottom: 18
    }
  }, "A quick monthly habit keeps ", childName, "'s record safe. Save a copy to your phone, and check your phone's own backup (Google or iCloud) is switched on. Jotla has no account and never sends your data anywhere."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: () => {
      onExport();
      onClose();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 20,
    color: "#fff"
  }), " Save a copy now"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 10
    },
    onClick: onClose
  }, "Maybe later")));
}
function App({
  appMode
}) {
  const J = window.JOTLA;
  const [entries, setEntries] = useStateApp(() => loadSeedAware(ENTRIES_KEY, J.SEED_ENTRIES, 'date'));
  const [docs, setDocs] = useStateApp(() => loadSeedAware(DOCS_KEY, J.SEED_DOCS, 'received'));
  const prefs0 = loadJSON(PREF_KEY, {
    dark: false,
    profileId: J.CHILD.id,
    plus: false,
    childCfg: {},
    customProfiles: [],
    deletedIds: []
  });
  // Theme (redesign, 6 Aug): Light / Dark / System. Old prefs carried a dark
  // boolean; it migrates to the explicit mode and keeps the parent's choice.
  const [themeMode, setThemeMode] = useStateApp(prefs0.theme || (prefs0.dark ? 'dark' : 'light'));
  const [sysDark, setSysDark] = useStateApp(() => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const dark = themeMode === 'dark' || themeMode === 'system' && sysDark;
  // Dynamic type: 1 / 1.12 / 1.25, applied as --tscale on the root so every
  // calc()-based font size in the app follows the one dial (build 1.8.0).
  const [tscale, setTscale] = useStateApp(prefs0.tscale || 1);
  // Mood style (founder, 9 Aug v3): Bold free and default, Sticker on Plus.
  // The Face component reads the global at render, so one state change reskins
  // every face in the app at once. Stale pack names from earlier rosters
  // (classic, cat, bubble...) migrate to the default.
  const [faceStyle, setFaceStyle] = useStateApp(FACE_PACKS[prefs0.faceStyle] ? prefs0.faceStyle : FACE_PACK_DEFAULT);
  window.JOTLA_FACE_STYLE = faceStyle;
  // Start of the week (founder, 14 Aug): a getDay() value, 1 = Monday default.
  // Every calendar surface reads it through J.weekLead / J.dowLabels, so the
  // global is set here, during render, before any of them draw.
  const [weekStart, setWeekStart] = useStateApp(typeof prefs0.weekStart === 'number' && prefs0.weekStart >= 0 && prefs0.weekStart <= 6 ? prefs0.weekStart : 1);
  window.WEEK_START = weekStart;
  const [fabOpen, setFabOpen] = useStateApp(false); // the + speed dial (8 Aug)
  // Double tap on the + goes straight to Quick Log, the most-used capture
  // (founder, 8 Aug night): the first tap opens the dial as normal, a second
  // tap inside 320ms fires Quick Log. A one-time tip teaches it and retires
  // FOREVER on the first successful double tap (persisted, never nags again).
  // The tap clock rides a REF, never state: two discrete taps land faster than
  // a re-render can be trusted (the 7 Aug swipe lesson).
  const fabLastTap = useRefApp(0);
  const [fabTip, setFabTip] = useStateApp(() => {
    try {
      return !localStorage.getItem('jotla_fabtip_v1');
    } catch (e) {
      return false;
    }
  });
  const fabClick = () => {
    const now = performance.now();
    if (fabOpen && now - fabLastTap.current < 320) {
      fabLastTap.current = 0;
      setFabOpen(false);
      setFabTip(false);
      try {
        localStorage.setItem('jotla_fabtip_v1', 'learned');
      } catch (e) {}
      nav.go('quicklog');
      return;
    }
    fabLastTap.current = now;
    setFabOpen(o => !o);
  };
  const [plus, setPlus] = useStateApp(!!prefs0.plus);
  const [childCfg, setChildCfg] = useStateApp(prefs0.childCfg || prefs0.avatarCols || {});
  const [customProfiles, setCustomProfiles] = useStateApp(prefs0.customProfiles || []);
  const [deletedIds, setDeletedIds] = useStateApp(prefs0.deletedIds || []);
  const [backupReminderMonth, setBackupReminderMonth] = useStateApp(prefs0.backupReminderMonth || '');
  // Redesign settings (6 Aug): App lock and the Daily reminder, both free. On the
  // web prototype these hold the parent's choice; enforcement and the real
  // notification are native-build work.
  const [appLock, setAppLock] = useStateApp(prefs0.appLock || {
    on: false,
    method: 'Pattern',
    bio: false,
    question: false
  });
  const [reminder, setReminder] = useStateApp(prefs0.reminder || 'Off');
  const [profileId, setProfileId] = useStateApp(prefs0.profileId || J.CHILD.id);
  const [profileOpen, setProfileOpen] = useStateApp(false);
  const [childOptOpen, setChildOptOpen] = useStateApp(false);
  const initNav = loadJSON(NAV_KEY, {
    view: {
      name: 'today'
    },
    history: [],
    tab: 'today'
  });
  const [view, setView] = useStateApp(initNav.view || {
    name: 'today'
  });
  const [history, setHistory] = useStateApp(initNav.history || []);
  const [tab, setTab] = useStateApp(initNav.tab || 'today');
  useEffectApp(() => {
    saveJSON(NAV_KEY, {
      view,
      history,
      tab
    });
  }, [view, history, tab]);
  useEffectApp(() => {
    if (J.SEED_SHIFTING) saveJSON(SEED_ANCHOR_KEY, J.TODAY_ISO);
  }, []);
  useEffectApp(() => {
    saveJSON(ENTRIES_KEY, entries);
  }, [entries]);
  useEffectApp(() => {
    saveJSON(DOCS_KEY, docs);
  }, [docs]);
  useEffectApp(() => {
    saveJSON(PREF_KEY, {
      theme: themeMode,
      dark,
      tscale,
      faceStyle,
      weekStart,
      profileId,
      plus,
      childCfg,
      customProfiles,
      deletedIds,
      backupReminderMonth,
      appLock,
      reminder
    });
  }, [themeMode, dark, tscale, faceStyle, weekStart, profileId, plus, childCfg, customProfiles, deletedIds, backupReminderMonth, appLock, reminder]);

  // The chrome outside the app root follows the theme too: the safe-area strip,
  // the desktop frame ground and the browser UI colour must all sit on the
  // locked warm dark grey in dark mode, never a light flash.
  useEffectApp(() => {
    const bgc = dark ? '#201F1D' : '#F7F5F2';
    try {
      document.documentElement.style.background = bgc;
      if (document.body) document.body.style.background = appMode ? bgc : dark ? '#161513' : '#EBE8E3';
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', bgc);
    } catch (e) {}
  }, [dark, appMode]);

  // System theme follows the phone live while the mode is 'system'.
  useEffectApp(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = e => setSysDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);else if (mq.addListener) mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);else if (mq.removeListener) mq.removeListener(onChange);
    };
  }, []);

  // On open: purge Bin items past 30 days, and once a month nudge a backup
  // (founder ask, 15 Jul 2026). The nudge shows on the first open of a new month;
  // a true 1st-of-the-month push arrives with the native build's notifications.
  const currentMonth = J.TODAY_ISO.slice(0, 7);
  const [reminderOpen, setReminderOpen] = useStateApp(false);
  useEffectApp(() => {
    const cd = J.parseISO(J.TODAY_ISO);
    cd.setDate(cd.getDate() - 30);
    const cutoff = cd.getFullYear() + '-' + String(cd.getMonth() + 1).padStart(2, '0') + '-' + String(cd.getDate()).padStart(2, '0');
    setEntries(es => es.filter(e => !(e.deletedAt && e.deletedAt < cutoff)));
    setDocs(ds => ds.filter(d => !(d.deletedAt && d.deletedAt < cutoff)));
    // First ever launch just sets the baseline month (no nudge on a brand-new,
    // empty record); the reminder then fires on the first open of the NEXT month.
    if (!backupReminderMonth) setBackupReminderMonth(currentMonth);else if (backupReminderMonth !== currentMonth) setReminderOpen(true);
  }, []);
  const profiles = [...J.PROFILES, ...customProfiles].filter(p => !deletedIds.includes(p.id)).map(p => ({
    ...p,
    ...(childCfg[p.id] || {})
  }));
  const profile = profiles.find(p => p.id === profileId) || profiles[0];

  // Back always returns to the previous page (including across tab switches),
  // instead of resetting to the tab root. History entries remember view + tab.
  // Screens stash their transient state (month shown, filters, sub-tab, scroll
  // position) on the view via nav.remember, so Back restores the page AS IT WAS.
  // viewRef keeps the latest view available synchronously, because a screen often
  // calls remember() and go() in the same tap and state updates are batched.
  const viewRef = useRefApp(view);
  viewRef.current = view;

  // The browser history is kept in lockstep with the in-app stack, so the
  // system Back gesture walks back through Jotla one step at a time instead
  // of closing the app. backNow/homeNow are the raw steps (no browser side
  // effects); the nav wrappers below add the mirroring.
  const depthRef = useRefApp(1); // how many entries we sit above the base slot
  const homeJumpRef = useRefApp(false);
  const pushDepth = () => {
    depthRef.current += 1;
    try {
      window.history.pushState({
        j: depthRef.current
      }, '');
    } catch (e) {}
  };
  const backNow = () => setHistory(h => {
    if (h.length) {
      const prev = h[h.length - 1];
      const pv = prev && prev.view ? prev.view : {
        name: 'today'
      };
      viewRef.current = pv;
      setView(pv);
      setTab(prev && prev.tab ? prev.tab : 'today');
      return h.slice(0, -1);
    }
    if (!TAB_NAMES.includes(view.name)) {
      const pv = {
        name: tab
      };
      viewRef.current = pv;
      setView(pv);
    }
    return h;
  });
  const homeNow = () => {
    setTab('today');
    const nv = {
      name: 'today'
    };
    viewRef.current = nv;
    setView(nv);
    setHistory([]);
  };
  const nav = {
    go: (name, params = {}) => {
      const cur = viewRef.current;
      setHistory(h => [...h.slice(-29), {
        view: cur,
        tab
      }]);
      const nv = {
        name,
        ...params
      };
      viewRef.current = nv;
      setView(nv);
      pushDepth();
    },
    remember: patch => {
      viewRef.current = {
        ...viewRef.current,
        ...patch
      };
      setView(viewRef.current);
    },
    // The in-app Back button goes through the browser too, so the two stacks
    // never drift apart; the popstate handler performs the actual step.
    back: () => {
      try {
        window.history.back();
      } catch (e) {
        backNow();
      }
    },
    setTab: name => {
      if (name === tab && view.name === name) return;
      const cur = viewRef.current;
      setHistory(h => [...h.slice(-29), {
        view: cur,
        tab
      }]);
      setTab(name);
      const nv = {
        name
      };
      viewRef.current = nv;
      setView(nv);
      pushDepth();
    },
    home: () => {
      const d = depthRef.current;
      if (d > 1) {
        homeJumpRef.current = true;
        try {
          window.history.go(1 - d);
          return;
        } catch (e) {
          homeJumpRef.current = false;
        }
      }
      homeNow();
    },
    addEntry: entry => setEntries(es => [{
      ...entry,
      id: entry.id + '-' + DEVICE,
      by: DEVICE,
      childId: profileId
    }, ...es]),
    addDoc: doc => setDocs(ds => [{
      ...doc,
      id: doc.id + '-' + DEVICE,
      by: DEVICE,
      childId: profileId
    }, ...ds]),
    // The Bin (founder ask, 15 Jul 2026): deleting a log or document no longer
    // erases it. It carries a deletedAt stamp and moves to the Bin, where it can
    // be restored for 30 days, deleted for good, or cleared with Empty bin. Only
    // logs and documents go to the Bin; deleting or resetting a CHILD stays a
    // permanent, immediate erase.
    deleteEntry: id => setEntries(es => es.map(e => e.id === id ? {
      ...e,
      deletedAt: J.TODAY_ISO
    } : e)),
    deleteDoc: id => setDocs(ds => ds.map(d => d.id === id ? {
      ...d,
      deletedAt: J.TODAY_ISO
    } : d)),
    restoreEntry: id => setEntries(es => es.map(e => {
      if (e.id !== id) return e;
      const n = {
        ...e
      };
      delete n.deletedAt;
      return n;
    })),
    restoreDoc: id => setDocs(ds => ds.map(d => {
      if (d.id !== id) return d;
      const n = {
        ...d
      };
      delete n.deletedAt;
      return n;
    })),
    purgeEntry: id => setEntries(es => es.filter(e => e.id !== id)),
    purgeDoc: id => setDocs(ds => ds.filter(d => d.id !== id)),
    emptyBin: () => {
      setEntries(es => es.filter(e => !(e.deletedAt && e.childId === profileId)));
      setDocs(ds => ds.filter(d => !(d.deletedAt && d.childId === profileId)));
    },
    // Honest editing: the change is applied, the original creation date/time is
    // never touched, and the previous wording is kept on the record (visible in
    // the app), so an edit can never quietly rewrite history.
    updateEntry: (id, patch) => setEntries(es => es.map(e => {
      if (e.id !== id) return e;
      // The snapshot carries everything the edit sheet can change (arena
      // catch, 14 Aug round 6: a renamed Other or a removed photo left no
      // trace). The photo is recorded by its CAPTION, never its pixel data:
      // re-copying a base64 image into history on every edit would balloon
      // the on-device store for nothing.
      const prior = {
        on: J.TODAY_ISO,
        summary: e.summary,
        mood: e.mood,
        category: e.category,
        categoryOther: e.categoryOther || '',
        setting: e.setting,
        photo: e.photo || ''
      };
      return {
        ...e,
        ...patch,
        editedOn: J.TODAY_ISO,
        history: [...(e.history || []), prior]
      };
    })),
    updateDoc: (id, patch) => setDocs(ds => ds.map(d => {
      if (d.id !== id) return d;
      const prior = {
        on: J.TODAY_ISO,
        title: d.title,
        type: d.type,
        typeOther: d.typeOther || '',
        from: d.from,
        received: d.received,
        about: d.about,
        action: d.action
      };
      return {
        ...d,
        ...patch,
        editedOn: J.TODAY_ISO,
        history: [...(d.history || []), prior]
      };
    })),
    // The document itself (12 Jul 2026): attachments ride the doc row. Adding
    // and removing are their own operations, never the edit-history path, so
    // a file coming on or off can never rewrite what the details said.
    // '__scan' removes the older single-photo field earlier builds kept.
    addDocMedia: (id, items) => setDocs(ds => ds.map(d => d.id === id ? {
      ...d,
      media: [...(d.media || []), ...items]
    } : d)),
    removeDocMedia: (id, mediaId) => setDocs(ds => ds.map(d => {
      if (d.id !== id) return d;
      if (mediaId === '__scan') {
        const n = {
          ...d
        };
        delete n.scan;
        return n;
      }
      return {
        ...d,
        media: (d.media || []).filter(m => m.id !== mediaId)
      };
    })),
    importBackup: payload => {
      try {
        if (!payload || payload.app !== 'Jotla' || !payload.child || !payload.child.id) {
          alert('That file does not look like a Jotla export.');
          return;
        }
        const child = payload.child;
        const known = [...J.PROFILES, ...customProfiles].some(p => p.id === child.id);
        if (!known) setCustomProfiles(list => [...list, child]);
        setDeletedIds(s => s.filter(x => x !== child.id));
        const newEntries = (payload.entries || []).filter(x => x && x.id);
        const newDocs = (payload.documents || []).filter(x => x && x.id);
        setEntries(es => {
          const have = new Set(es.map(e => e.id));
          return [...newEntries.filter(e => !have.has(e.id)), ...es];
        });
        setDocs(ds => {
          const have = new Set(ds.map(d => d.id));
          return [...newDocs.filter(d => !have.has(d.id)), ...ds];
        });
        setProfileId(child.id);
        alert('Restored ' + (child.name || 'the child') + "'s record: " + newEntries.length + ' moments and ' + newDocs.length + ' documents from the file.');
      } catch (err) {
        alert('Could not restore from that file.');
      }
    },
    theme: themeMode,
    setTheme: setThemeMode,
    toggleDark: () => setThemeMode(dark ? 'light' : 'dark'),
    dark,
    appLock,
    setAppLock,
    reminder,
    setReminder,
    profiles,
    profileId,
    pickChild: id => setProfileId(id),
    tscale,
    setTscale,
    faceStyle,
    setFaceStyle,
    weekStart,
    setWeekStart,
    plus,
    buyPlus: () => setPlus(true),
    dropPlus: () => setPlus(false),
    addChild: data => {
      const id = 'c' + Date.now();
      const fig = data.figure || '#3A7BD4';
      // adults: the circle around the child (teachers, TAs, helpers), named at
      // onboarding or in the child editor. It lives on the child object, so it
      // rides the export and restore like everything else about them.
      const np = {
        id,
        name: data.name || 'New child',
        school: data.school || '',
        year: data.year || '',
        initial: (data.name || 'N').charAt(0).toUpperCase(),
        tint: fig,
        faceBg: '#EAF1FB',
        figure: fig,
        glyph: data.glyph || 'person',
        photo: data.photo || null,
        adults: data.adults || []
      };
      setCustomProfiles(list => [...list, np]);
      setProfileId(id);
      return id;
    },
    setChild: patch => setChildCfg(m => ({
      ...m,
      [profileId]: {
        ...(m[profileId] || {}),
        ...patch
      }
    })),
    editChild: () => setChildOptOpen(true),
    // Reset a child: clear all their logs and documents but KEEP the profile,
    // so the record starts fresh (founder ask, 15 Jul 2026). Offered when there
    // are two or more children. A child's data never goes to the Bin.
    resetChild: id => {
      setEntries(es => es.filter(e => e.childId !== id));
      setDocs(ds => ds.filter(d => d.childId !== id));
      setTab('today');
      setView({
        name: 'today'
      });
      setHistory([]);
    },
    // Reset all data: the single-child danger option. A full wipe back to the
    // create-your-first-child screen (Bupe's choice, 15 Jul 2026): every log,
    // document, profile and setting goes, and the onboarding gate takes over.
    resetAll: () => {
      setEntries([]);
      setDocs([]);
      setCustomProfiles([]);
      setChildCfg({});
      setDeletedIds(J.PROFILES.map(p => p.id));
      setTab('today');
      setView({
        name: 'today'
      });
      setHistory([]);
    },
    deleteChild: id => {
      const remaining = [...J.PROFILES, ...customProfiles].filter(p => p.id !== id && !deletedIds.includes(p.id));
      if (!remaining.length) return; // never delete the last record
      setEntries(es => es.filter(e => e.childId !== id));
      setDocs(ds => ds.filter(d => d.childId !== id));
      setChildCfg(m => {
        const n = {
          ...m
        };
        delete n[id];
        return n;
      });
      if (customProfiles.some(p => p.id === id)) setCustomProfiles(list => list.filter(p => p.id !== id));else setDeletedIds(s => s.includes(id) ? s : [...s, id]);
      setProfileId(remaining[0].id);
      setTab('today');
      setView({
        name: 'today'
      });
      setHistory([]);
    }
  };

  // Keep the system Back gesture (Android back swipe, browser back) inside the
  // app. Every in-app navigation adds a real browser entry during the tap:
  // entries created OUTSIDE a user gesture are marked skippable by Android
  // Chrome, which is why the old single re-armed sentinel blew through and
  // closed the app mid-navigation. One back gesture now equals one in-app
  // step, always ending on the Today dashboard. There, the first back shows a
  // hint and only a second back within 2.2s really leaves. Child mode swallows
  // Back completely: the press-and-hold is the only door out.
  const [exitHint, setExitHint] = useStateApp(false);
  const exitArmRef = useRefApp(0);
  const exitHintTimer = useRefApp(null);
  const stateRef = useRefApp({});
  stateRef.current = {
    history,
    view,
    tab,
    profileOpen,
    childOptOpen
  };
  const backStepRef = useRefApp(null);
  backStepRef.current = () => {
    if (childOptOpen) {
      setChildOptOpen(false);
      return;
    }
    if (profileOpen) {
      setProfileOpen(false);
      return;
    }
    if (history.length) {
      backNow();
      return;
    }
    homeNow(); // nothing left to pop: settle on the dashboard
  };
  const homeNowRef = useRefApp(null);
  homeNowRef.current = homeNow;
  useEffectApp(() => {
    try {
      window.history.replaceState({
        j: 0
      }, '');
      window.history.pushState({
        j: 1
      }, '');
    } catch (e) {}
    depthRef.current = 1;
    const rearm = j => {
      depthRef.current = j;
      try {
        window.history.pushState({
          j
        }, '');
      } catch (e) {}
    };
    const onPop = ev => {
      const j = ev.state && typeof ev.state.j === 'number' ? ev.state.j : 0;
      depthRef.current = Math.max(0, j);
      if (homeJumpRef.current) {
        homeJumpRef.current = false;
        depthRef.current = Math.max(1, j);
        homeNowRef.current();
        return;
      }
      const s = stateRef.current;
      if (s.view && s.view.name === 'child') {
        rearm(j + 1);
        return;
      } // the hold is the only exit
      if (j > 0) {
        backStepRef.current();
        return;
      }
      const atRoot = !s.history.length && s.tab === 'today' && s.view && s.view.name === 'today' && !s.profileOpen && !s.childOptOpen;
      if (!atRoot) {
        rearm(1);
        backStepRef.current();
        return;
      }
      if (Date.now() - exitArmRef.current < 2200) {
        try {
          window.history.back();
        } catch (e) {}
        return;
      } // second back: really leave
      exitArmRef.current = Date.now();
      setExitHint(true);
      clearTimeout(exitHintTimer.current);
      exitHintTimer.current = setTimeout(() => setExitHint(false), 2200);
      rearm(1);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const isTab = TAB_NAMES.includes(view.name);
  const isChild = view.name === 'child';
  // Tips joins the tour as a full-bleed deck (founder, 17 Jul: "the top navbar
  // disappeared"). It is a story deck, not a screen inside the app: it carries its
  // own name, its own count and its own Skip, so the Jotla header above it was a
  // second lot of chrome competing with its own, and it cost the height the deck
  // needs to fit without scrolling.
  const isFullscreen = isChild || view.name === 'addchild' || view.name === 'tour' || view.name === 'tips';
  const today = J.TODAY_ISO;

  // scope to active child, and hide anything in the Bin (deletedAt set)
  const myEntries = [...entries].filter(e => e.childId === profileId && !e.deletedAt).sort((a, b) => a.date === b.date ? a.clock < b.clock ? 1 : -1 : a.date < b.date ? 1 : -1);
  const myDocs = docs.filter(d => d.childId === profileId && !d.deletedAt);
  // the Bin, scoped to the active child: logs and docs waiting out their 30 days
  const binEntries = entries.filter(e => e.childId === profileId && e.deletedAt).sort((a, b) => a.deletedAt < b.deletedAt ? 1 : -1);
  const binDocs = docs.filter(d => d.childId === profileId && d.deletedAt);
  const noChild = profiles.length === 0; // after a full reset: the onboarding gate takes over
  const appExport = () => {
    try {
      const payload = {
        app: 'Jotla',
        exportedAt: new Date().toISOString(),
        child: profile,
        entries: myEntries,
        documents: myDocs
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jotla-' + (profile && profile.name || 'record').replace(/\s+/g, '-').toLowerCase() + '-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      try {
        localStorage.setItem('jotla_backup_v1', JSON.stringify({
          lastExportAt: new Date().toISOString()
        }));
      } catch (e) {}
    } catch (e) {
      alert('Sorry, the export could not be created on this device.');
    }
  };
  let screen = null;
  switch (view.name) {
    case 'today':
      screen = /*#__PURE__*/React.createElement(TodayScreen, {
        nav: nav,
        entries: myEntries,
        today: today,
        profile: profile
      });
      break;
    case 'month':
      screen = /*#__PURE__*/React.createElement(MonthScreen, {
        nav: nav,
        entries: myEntries,
        profile: profile,
        view: view
      });
      break;
    case 'find':
      screen = /*#__PURE__*/React.createElement(FindScreen, {
        nav: nav,
        entries: myEntries,
        view: view
      });
      break;
    case 'evidence':
      screen = /*#__PURE__*/React.createElement(EvidenceScreen, {
        nav: nav,
        entries: myEntries,
        docs: myDocs,
        profile: profile,
        navView: view
      });
      break;
    case 'adddoc':
      screen = /*#__PURE__*/React.createElement(AddDocScreen, {
        nav: nav
      });
      break;
    case 'settings':
      screen = /*#__PURE__*/React.createElement(SettingsScreen, {
        nav: nav,
        profile: profile,
        entries: myEntries,
        docs: myDocs,
        binCount: binEntries.length + binDocs.length
      });
      break;
    // The settings system behind the cog (redesign, 6-7 Aug)
    case 'appsettings':
      screen = /*#__PURE__*/React.createElement(AppSettingsScreen, {
        nav: nav
      });
      break;
    case 'moodstyle':
      screen = /*#__PURE__*/React.createElement(MoodStyleScreen, {
        nav: nav
      });
      break;
    case 'children':
      screen = /*#__PURE__*/React.createElement(ChildrenScreen, {
        nav: nav
      });
      break;
    case 'childprofile':
      screen = /*#__PURE__*/React.createElement(ChildProfileScreen, {
        nav: nav,
        profile: profile,
        entries: myEntries,
        docs: myDocs
      });
      break;
    // the child's hub pages off the Menu tab (round 10, 14 Aug)
    case 'aboutchild':
      screen = /*#__PURE__*/React.createElement(AboutChildScreen, {
        nav: nav,
        profile: profile,
        entries: myEntries
      });
      break;
    // The three Plus-only hub routes re-check the gate at render time (arena,
    // 16 Aug): the Menu rows already route free users to the paywall, but a
    // saved back-stack entry survives Plus switching off and would otherwise
    // walk straight past the crown.
    case 'whathelped':
      screen = nav.plus ? /*#__PURE__*/React.createElement(WhatHelpedScreen, {
        nav: nav,
        entries: myEntries
      }) : /*#__PURE__*/React.createElement(UnlockScreen, {
        nav: nav
      });
      break;
    case 'contacts':
      screen = /*#__PURE__*/React.createElement(ContactsScreen, {
        nav: nav,
        profile: profile
      });
      break;
    case 'dates':
      screen = nav.plus ? /*#__PURE__*/React.createElement(DatesScreen, {
        nav: nav,
        profile: profile
      }) : /*#__PURE__*/React.createElement(UnlockScreen, {
        nav: nav
      });
      break;
    case 'wins':
      screen = /*#__PURE__*/React.createElement(WinsScreen, {
        nav: nav,
        entries: myEntries
      });
      break;
    case 'familysync':
      screen = nav.plus ? /*#__PURE__*/React.createElement(FamilySyncScreen, {
        nav: nav,
        profile: profile
      }) : /*#__PURE__*/React.createElement(UnlockScreen, {
        nav: nav,
        initialSlide: 2
      });
      break;
    case 'applock':
      screen = /*#__PURE__*/React.createElement(AppLockScreen, {
        nav: nav
      });
      break;
    case 'backup':
      screen = /*#__PURE__*/React.createElement(BackupScreen, {
        nav: nav,
        profile: profile,
        entries: myEntries,
        docs: myDocs
      });
      break;
    case 'help':
      screen = /*#__PURE__*/React.createElement(HelpScreen, {
        nav: nav
      });
      break;
    case 'support':
      screen = /*#__PURE__*/React.createElement(SupportScreen, {
        nav: nav
      });
      break;
    case 'quicklog':
      screen = /*#__PURE__*/React.createElement(QuickLogScreen, {
        nav: nav,
        today: today,
        view: view,
        profile: profile
      });
      break;
    // The old infomission/infoprivacy/infodata pages are gone: About is the one
    // information page (founder consolidation, 12 Jul 2026 sixth pass). The old
    // route names still land there so a saved navigation state never strands.
    case 'infomission':
    case 'infoprivacy':
    case 'infodata':
    case 'infoabout':
      screen = /*#__PURE__*/React.createElement(InfoAboutScreen, {
        nav: nav
      });
      break;
    case 'gateintro':
      screen = /*#__PURE__*/React.createElement(GateIntroScreen, {
        nav: nav,
        profile: profile
      });
      break;
    case 'handover':
      screen = /*#__PURE__*/React.createElement(HandoverScreen, {
        nav: nav,
        today: today,
        profile: profile
      });
      break;
    case 'tips':
      screen = /*#__PURE__*/React.createElement(DysregTipsScreen, {
        nav: nav
      });
      break;
    case 'child':
      screen = /*#__PURE__*/React.createElement(ChildScreen, {
        nav: nav,
        profile: profile
      });
      break;
    case 'addchild':
      screen = /*#__PURE__*/React.createElement(AddChildScreen, {
        nav: nav
      });
      break;
    case 'tour':
      screen = /*#__PURE__*/React.createElement(TourScreen, {
        nav: nav,
        profile: profile
      });
      break;
    case 'unlock':
      screen = /*#__PURE__*/React.createElement(UnlockScreen, {
        nav: nav,
        initialTier: view.tier,
        initialSlide: view.slide
      });
      break;
    case 'day':
      screen = /*#__PURE__*/React.createElement(DayScreen, {
        nav: nav,
        entries: myEntries,
        date: view.date
      });
      break;
    case 'entry':
      screen = /*#__PURE__*/React.createElement(EntryScreen, {
        nav: nav,
        entries: myEntries,
        id: view.id
      });
      break;
    case 'doc':
      screen = /*#__PURE__*/React.createElement(DocScreen, {
        nav: nav,
        docs: myDocs,
        id: view.id
      });
      break;
    case 'bin':
      screen = /*#__PURE__*/React.createElement(BinScreen, {
        nav: nav,
        entries: binEntries,
        docs: binDocs,
        today: today
      });
      break;
    default:
      screen = /*#__PURE__*/React.createElement(TodayScreen, {
        nav: nav,
        entries: myEntries,
        today: today,
        profile: profile
      });
  }
  // After a full reset there is no child left: the only screen is create-your-
  // first-child, and the header, tabs and sheets below all step aside for it.
  if (noChild) screen = /*#__PURE__*/React.createElement(AddChildScreen, {
    nav: nav
  });
  return /*#__PURE__*/React.createElement("div", {
    className: 'jotla-root' + (dark ? ' j-dark' : '') + (appMode ? ' j-app' : ''),
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      paddingTop: appMode ? 'max(env(safe-area-inset-top), 12px)' : 50,
      background: isChild ? '#FFF6EC' : 'var(--bg)',
      '--tscale': tscale
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: view.name + (view.id || view.date || '') + profileId,
    style: {
      position: 'absolute',
      inset: 0
    }
  }, /*#__PURE__*/React.createElement(ScreenBoundary, null, window.__JOTLA_TEST_THROW ? /*#__PURE__*/React.createElement(CrashProbe, null) : screen))), isTab && !noChild && !(view.name === 'evidence' && view.ev && view.ev.tab === 'records') && !(view.name === 'find' && view.findDrawer) && /*#__PURE__*/React.createElement(React.Fragment, null, fabOpen && /*#__PURE__*/React.createElement("div", {
    className: "j-dial-scrim",
    onClick: () => setFabOpen(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-dial"
  }, [['Document', 'doc', 'var(--blue)', () => nav.go('adddoc')], ['Dysregulation', 'pulse', 'var(--dysreg)', () => nav.go(nav.plus ? 'handover' : 'gateintro')], ["Child's Day", 'heart', 'var(--blue)', () => nav.go('child')], ['Quick Log', 'edit', 'var(--green)', () => nav.go('quicklog')]].map(([label, icon, tint, go], i) => /*#__PURE__*/React.createElement("button", {
    key: label,
    className: "j-dial-opt",
    style: {
      animationDelay: 0.035 * (3 - i) + 's'
    },
    onClick: e => {
      e.stopPropagation();
      setFabOpen(false);
      go();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: tint,
    stroke: 2.1
  }), /*#__PURE__*/React.createElement("span", null, label))))), fabTip && !fabOpen && /*#__PURE__*/React.createElement("div", {
    className: "j-fabtip",
    role: "status"
  }, "Try a double tap for Quick Log"), /*#__PURE__*/React.createElement("button", {
    className: 'j-fab' + (fabOpen ? ' j-fab-open' : ''),
    "aria-label": fabOpen ? 'Close' : 'Add',
    "aria-expanded": fabOpen,
    onClick: fabClick
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-fab-ic"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 26,
    color: "#fff",
    stroke: 2.4
  })))), isTab && !noChild && /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onTab: nav.setTab
  }), exitHint && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 'calc(96px + env(safe-area-inset-bottom))',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 80
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-fade",
    style: {
      background: 'rgba(22,30,44,0.92)',
      color: '#fff',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500,
      padding: '10px 18px',
      borderRadius: 999,
      boxShadow: '0 10px 24px -10px rgba(10,20,40,0.5)'
    }
  }, "Swipe back again to close Jotla")), profileOpen && !noChild && /*#__PURE__*/React.createElement(ProfileSheet, {
    profiles: profiles,
    activeId: profileId,
    onPick: id => {
      setProfileId(id);
      setProfileOpen(false);
      nav.home();
    },
    onAddChild: () => {
      setProfileOpen(false);
      nav.go('addchild');
    },
    onClose: () => setProfileOpen(false)
  }), childOptOpen && !noChild && /*#__PURE__*/React.createElement(ChildOptionsSheet, {
    profile: profile,
    entries: myEntries,
    docs: myDocs,
    canDelete: profiles.length > 1,
    onChange: nav.setChild,
    onDelete: () => nav.deleteChild(profileId),
    onReset: () => nav.resetChild(profileId),
    onResetAll: () => nav.resetAll(),
    onClose: () => setChildOptOpen(false)
  }), reminderOpen && !noChild && /*#__PURE__*/React.createElement(BackupReminder, {
    childName: profile && profile.name || 'your child',
    onExport: appExport,
    onClose: () => {
      setReminderOpen(false);
      setBackupReminderMonth(currentMonth);
    }
  }));
}

// ---- device + scaling stage ----
// On a real phone (or when launched from the home screen) the app fills the whole
// screen, the device itself is the frame. On a wide desktop we show the iPhone bezel
// so the design can be previewed in context.
function Stage() {
  const [scale, setScale] = useStateApp(1);
  const [mode, setMode] = useStateApp('desktop');
  useEffectApp(() => {
    const fit = () => {
      const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      const phone = window.innerWidth <= 600;
      const app = standalone || phone;
      document.documentElement.classList.toggle('j-appmode', app);
      setMode(app ? 'app' : 'desktop');
      const margin = 48;
      const s = Math.min((window.innerWidth - margin) / 402, (window.innerHeight - margin) / 874, 1);
      setScale(s < 0.3 ? 0.3 : s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  if (mode === 'app') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        background: '#F7F9FC',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(App, {
      appMode: true
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, #eef3fb 0%, #e4e9f2 70%, #dde3ee 100%)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, null, /*#__PURE__*/React.createElement(App, {
    appMode: false
  }))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(AppBoundary, null, /*#__PURE__*/React.createElement(Stage, null)));