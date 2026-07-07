// jotla-ui.jsx — shared layout atoms used across screens.
const {
  useState,
  useRef,
  useEffect
} = React;

// The single source of the visible build number. Bump this every release
// (and keep sw.js VERSION in step) so the Settings footer can never lie.
window.JOTLA_BUILD = '1.8.0';

// Keyboard alternative for every swipe pager (build 1.8.0, WCAG 2.1.1): the pager
// becomes focusable and Left/Right arrows page it, so nothing in the app is
// swipe-only. Spread the result onto the pager div alongside ref/onScroll.
function pagerKeyProps(ref, label) {
  return {
    tabIndex: 0,
    role: 'group',
    'aria-label': label + '. Use the left and right arrow keys to move between pages.',
    onKeyDown: e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const el = ref.current;
      if (!el || !el.clientWidth) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      el.scrollTo({
        left: el.scrollLeft + dir * el.clientWidth,
        behavior: 'smooth'
      });
    }
  };
}

// A calm, honest locked card for Plus features in the free app: the feature is
// visible and named, never hidden, and one tap shows what Plus is.
function PlusLockedCard({
  title,
  text,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      padding: 14,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      border: '1px dashed var(--chip-border)',
      background: 'var(--card-2)',
      ...(style || {})
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 12,
      background: 'var(--tag-grey-bg)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 18,
    color: "var(--muted)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, title, /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      marginLeft: 8,
      background: 'var(--tint-blue)',
      color: 'var(--blue)'
    }
  }, "Plus")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 2
    }
  }, text)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16,
    color: "var(--faint)"
  }));
}

// Top bar for pushed (non-tab) screens
function PushHeader({
  title,
  subtitle,
  onBack,
  onClose,
  accent = '#1A56A8',
  bg = 'transparent'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px 10px',
      background: bg,
      position: 'sticky',
      top: 0,
      zIndex: 5
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "Back",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: 'none',
      background: 'var(--blue)',
      boxShadow: '0 10px 22px -8px rgba(26,86,168,0.7)',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 22,
    color: "#fff"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(19px * var(--tscale, 1))',
      color: 'var(--ink)',
      lineHeight: 1.1
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'calc(13px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginTop: 1
    }
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    className: "j-press",
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: 'none',
      background: 'var(--blue)',
      boxShadow: '0 10px 22px -8px rgba(26,86,168,0.7)',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    color: "#fff"
  })));
}
function moodTint(mood) {
  return mood === 'good' ? 'var(--tint-green)' : mood === 'hard' ? 'var(--tint-red)' : 'var(--tint-amber)';
}

// ---- date range ----
// "Today" for range maths is always the real device date (was a stale hardcode).
const RANGE_TODAY = window.JOTLA.TODAY_ISO;
function isoMinusDays(iso, n) {
  const d = window.JOTLA.parseISO(iso);
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
// returns {from, to} ISO strings or nulls (null = unbounded). preset 'Custom' uses the passed from/to.
function rangeBounds(preset, from, to) {
  switch (preset) {
    case 'This week':
      return {
        from: isoMinusDays(RANGE_TODAY, 4),
        to: RANGE_TODAY
      };
    // Mon 8 -> Fri 12
    case 'Last 2 weeks':
      return {
        from: isoMinusDays(RANGE_TODAY, 13),
        to: RANGE_TODAY
      };
    case 'Last 3 weeks':
      return {
        from: isoMinusDays(RANGE_TODAY, 20),
        to: RANGE_TODAY
      };
    case 'This month':
      return {
        from: RANGE_TODAY.slice(0, 8) + '01',
        to: RANGE_TODAY
      };
    case 'Custom':
      return {
        from: from || null,
        to: to || null
      };
    default:
      return {
        from: null,
        to: null
      };
    // Any time / This term / All time
  }
}
function inDateRange(iso, b) {
  if (!b) return true;
  if (b.from && iso < b.from) return false;
  if (b.to && iso > b.to) return false;
  return true;
}

// presets is an array; value = { preset, from, to }; onChange(next)
function DateRangeControl({
  presets,
  value,
  onChange
}) {
  const set = patch => onChange({
    ...value,
    ...patch
  });
  const dateInput = which => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--faint)',
      fontWeight: 500,
      marginBottom: 6
    }
  }, which === 'from' ? 'From' : 'To'), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "j-input",
    min: "2019-01-01",
    max: "2030-12-31",
    value: value[which] || '',
    onChange: e => set({
      [which]: e.target.value
    }),
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      colorScheme: 'light dark',
      padding: '11px 12px'
    }
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, presets.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    "aria-pressed": value.preset === p,
    className: 'j-chip' + (value.preset === p ? ' j-chip-on' : ''),
    onClick: () => set({
      preset: p
    })
  }, p))), value.preset === 'Custom' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 12
    }
  }, dateInput('from'), dateInput('to')));
}

// Attached-photo tile inside an entry. With a real image (src) it renders it;
// otherwise it falls back to the caption tile.
function PhotoAttachment({
  caption = 'Photo attached',
  src
}) {
  if (src) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--photo-bg)'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: caption || 'Attached photo',
      style: {
        display: 'block',
        width: '100%',
        maxHeight: 280,
        objectFit: 'cover'
      }
    }), caption && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 12px',
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: 'var(--faint)'
      }
    }, caption));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      borderRadius: 14,
      background: 'var(--photo-bg)',
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 20,
    color: "var(--faint)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--faint)',
      fontWeight: 500
    }
  }, caption));
}

// Read an image file, downscale it, and hand back a compact JPEG data URL.
// Keeps attached photos small enough to live in on-device storage.
function fileToImageDataURL(file, maxDim, quality, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', quality));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}
window.fileToImageDataURL = fileToImageDataURL;

// Entry card: clock time left, mood dot, setting chip, category chip, summary, optional photo.
function EntryCard({
  entry,
  onClick,
  showDate = false
}) {
  const J = window.JOTLA;
  const isHandover = entry.type === 'handover';
  const timeLabel = entry.clock || entry.time;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card j-press",
    onClick: onClick,
    style: {
      padding: 16,
      cursor: onClick ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 46,
      flexShrink: 0,
      paddingTop: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      letterSpacing: '0.01em'
    }
  }, timeLabel), showDate && /*#__PURE__*/React.createElement("span", {
    className: "j-meta",
    style: {
      marginTop: 1
    }
  }, J.fmtShort(entry.date))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MoodDot, {
    mood: entry.mood,
    size: 13
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow",
    style: {
      gap: 8,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-tag j-tag-grey"
  }, entry.setting), /*#__PURE__*/React.createElement("span", {
    className: "j-tag j-tag-blue"
  }, entry.category), isHandover && /*#__PURE__*/React.createElement("span", {
    className: "j-tag j-tag-blue",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 13,
    color: "var(--blue)"
  }), " Gate note"))), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(16.5px * var(--tscale, 1))',
      marginTop: 10,
      lineHeight: 1.4
    }
  }, entry.summary), (entry.photo || entry.photoData) && /*#__PURE__*/React.createElement(PhotoAttachment, {
    caption: entry.photo,
    src: entry.photoData
  }))));
}

// labelled section heading inside scroll areas
function SectionLabel({
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      margin: '0 0 10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Outfit', system-ui",
      fontWeight: 500,
      fontSize: 'calc(13px * var(--tscale, 1))',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'var(--faint)'
    }
  }, children), right);
}

// Month summary: three count blocks (Good / Mixed / Hard) + a plain trend line.
function MiniMonthStrip({
  entries,
  onOpen
}) {
  const J = window.JOTLA;
  let good = 0,
    ok = 0,
    hard = 0;
  const _my = J.TODAY_ISO.slice(0, 4),
    _mm = J.TODAY_ISO.slice(5, 7);
  const _dim = new Date(Number(_my), Number(_mm), 0).getDate();
  for (let d = 1; d <= _dim; d++) {
    const iso = `${_my}-${_mm}-${String(d).padStart(2, '0')}`;
    const m = J.dayMood(entries.filter(e => e.date === iso));
    if (m === 'good') good++;else if (m === 'ok') ok++;else if (m === 'hard') hard++;
  }
  const blocks = [{
    key: 'good',
    label: 'Good',
    n: good
  }, {
    key: 'ok',
    label: 'Mixed',
    n: ok
  }, {
    key: 'hard',
    label: 'Hard',
    n: hard
  }];
  const maxN = Math.max(good, ok, hard, 1);
  const _hc = {};
  entries.forEach(e => {
    if (e.mood === 'hard') _hc[e.category] = (_hc[e.category] || 0) + 1;
  });
  const _top = Object.entries(_hc).sort((a, b) => b[1] - a[1])[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-card j-press",
    onClick: onOpen,
    style: {
      padding: 18,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-h3"
  }, "This month"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--blue)',
      fontSize: 'calc(14px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, "Open Month view ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-end',
      minHeight: 92
    }
  }, blocks.map(b => {
    const c = window.MOOD_COLOURS[b.key];
    const h = 22 + b.n / maxN * 54; // taller bar for a higher count
    return /*#__PURE__*/React.createElement("div", {
      key: b.key,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "'Outfit', system-ui",
        fontWeight: 600,
        fontSize: 'calc(16px * var(--tscale, 1))',
        color: c,
        lineHeight: 1
      }
    }, b.n), /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        height: h,
        borderRadius: 14,
        background: c
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'calc(14px * var(--tscale, 1))',
        fontWeight: 500,
        color: 'var(--muted)'
      }
    }, b.label));
  })), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 16
    }
  }, _top ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "j-strong"
  }, _top[0]), " entries come up most often as the hard moments. Tap Find to see them gathered.") : 'No hard moments logged so far. Long may it last.'));
}
Object.assign(window, {
  PushHeader,
  EntryCard,
  SectionLabel,
  MiniMonthStrip,
  moodTint,
  PhotoAttachment,
  DateRangeControl,
  rangeBounds,
  inDateRange,
  PlusLockedCard,
  pagerKeyProps
});