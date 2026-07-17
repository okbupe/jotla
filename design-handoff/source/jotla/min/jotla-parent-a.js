function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// jotla-parent-a.jsx: Today, Quick log, Handover (Dysregulation).
const {
  useState: useStateA,
  useRef: useRefA
} = React;
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// soft tappable tile used on Today. It wears the same border and drop shadow as
// the cards (var(--line) + var(--card-shadow)) so the two tiles lift off the page
// and read as siblings of the cards below them, not flat patches (founder's
// seventh pass, item 39, 13 Jul 2026).
function ActionTile({
  icon,
  title,
  sub,
  tint,
  ink,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: "j-press",
    style: {
      flex: 1,
      textAlign: 'left',
      border: '1px solid var(--line)',
      cursor: 'pointer',
      background: tint,
      borderRadius: 16,
      padding: '14px 14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minHeight: 56,
      boxShadow: 'var(--card-shadow)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 12,
      background: 'var(--card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px -8px rgba(20,40,80,0.4)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: ink,
      lineHeight: 1.1
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--muted)',
      marginTop: 2
    }
  }, sub)));
}

// ---------------- Today ----------------
function TodayScreen({
  nav,
  entries,
  today,
  profile
}) {
  const J = window.JOTLA;
  const todays = entries.filter(e => e.date === today);
  const childName = profile && profile.name || 'Sam';
  const isEmpty = entries.length === 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 14,
      paddingBottom: 120
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-eyebrow",
    style: {
      marginBottom: 6
    }
  }, J.fmtLong(today)), /*#__PURE__*/React.createElement("h1", {
    className: "j-h1",
    style: {
      marginBottom: 4
    }
  }, greeting(), "."), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)',
      marginBottom: 20
    }
  }, isEmpty ? `${childName}'s record is brand new. Add the first line whenever you are ready.` : `Here is how ${childName}'s day is looking. Nothing to catch up on.`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(ActionTile, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "heart",
      size: 20,
      color: "var(--green)"
    }),
    title: "Your day",
    sub: nav.plus ? 'Do it together with ' + childName : 'Hand the phone to ' + childName,
    tint: "var(--tint-green)",
    ink: "var(--green-ink)",
    onClick: () => nav.go('child')
  }), /*#__PURE__*/React.createElement(ActionTile, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "note",
      size: 20,
      color: "var(--blue)"
    }),
    title: "Dysregulation",
    sub: "Capture what happened",
    tint: "var(--tint-blue)",
    ink: "var(--blue)",
    onClick: () => nav.go(nav.plus ? 'handover' : 'gateintro')
  })), isEmpty ? /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 22,
      marginBottom: 22,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      background: 'var(--tint-blue)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "leaf",
    size: 30,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "j-h3",
    style: {
      marginBottom: 6
    }
  }, "A fresh, blank record"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      marginBottom: 16
    }
  }, "The picture builds itself one ordinary day at a time. New to Jotla?"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    onClick: () => nav.go('tour')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "hand",
    size: 18,
    color: "var(--blue)"
  }), " Take the quick tour")) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(MiniMonthStrip, {
    entries: entries,
    onOpen: () => nav.setTab('month')
  })), /*#__PURE__*/React.createElement(SectionLabel, null, childName, "'s day so far"), todays.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 24,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Face, {
    mood: "good",
    size: 56
  })), /*#__PURE__*/React.createElement("p", {
    className: "j-h3",
    style: {
      marginBottom: 6
    }
  }, "Nothing logged yet today"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, "A single line is plenty.")) : /*#__PURE__*/React.createElement(LogList, {
    list: todays,
    nav: nav
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary j-btn-lg",
    style: {
      marginTop: 16
    },
    onClick: () => nav.go('quicklog')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 22,
    color: "#fff",
    stroke: 2.2
  }), " Add to today"))));
}

// ---------------- shared form atoms ----------------
function ChipGroup({
  options,
  value,
  onChange,
  multi = false,
  green = false
}) {
  const isOn = o => multi ? value.includes(o) : value === o;
  const toggle = o => {
    if (multi) onChange(value.includes(o) ? value.filter(x => x !== o) : [...value, o]);else onChange(o);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    "aria-pressed": isOn(o),
    className: 'j-chip' + (isOn(o) ? green ? ' j-chip-on-green' : ' j-chip-on' : ''),
    onClick: () => toggle(o)
  }, o)));
}
function MoodFacePicker({
  value,
  onChange
}) {
  const J = window.JOTLA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'space-between'
    }
  }, J.MOODS.map(m => {
    const on = value === m.key;
    return /*#__PURE__*/React.createElement("button", {
      key: m.key,
      onClick: () => onChange(m.key),
      className: "j-press",
      style: {
        flex: 1,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        padding: '4px 0'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        borderRadius: '50%',
        padding: 4,
        boxShadow: on ? `0 0 0 3px ${window.MOOD_COLOURS[m.key]}` : '0 0 0 2px transparent',
        transition: 'box-shadow .15s ease'
      }
    }, /*#__PURE__*/React.createElement(Face, {
      mood: m.key,
      size: 48
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'calc(12px * var(--tscale, 1))',
        fontWeight: 500,
        color: on ? 'var(--ink)' : 'var(--faint)'
      }
    }, m.label));
  }));
}
function FieldLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(16px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: '0 0 10px'
    }
  }, children);
}

// Take or attach photo, with a result tile
function PhotoPicker() {
  const [photo, setPhoto] = useStateA(null); // null | 'taken' | 'attached'
  if (photo) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        background: 'var(--photo-bg)',
        minHeight: 96,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'var(--card)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 22,
      color: "var(--blue)"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(15px * var(--tscale, 1))',
        fontWeight: 500,
        color: 'var(--ink)'
      }
    }, "Photo attached (sample)"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'calc(13px * var(--tscale, 1))',
        color: 'var(--faint)',
        marginTop: 1
      }
    }, photo === 'taken' ? 'Taken just now' : 'Chosen from your photos')), /*#__PURE__*/React.createElement("button", {
      onClick: () => setPhoto(null),
      "aria-label": "Remove photo",
      className: "j-press",
      style: {
        width: 36,
        height: 36,
        borderRadius: 10,
        border: 'none',
        background: 'var(--card)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 18,
      color: "var(--muted)"
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhoto('taken'),
    className: "j-press",
    style: {
      flex: 1,
      minHeight: 84,
      borderRadius: 14,
      cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "camera",
    size: 24,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, "Take photo")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPhoto('attached'),
    className: "j-press",
    style: {
      flex: 1,
      minHeight: 84,
      borderRadius: 14,
      cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 24,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, "Attach image")));
}

// Attach media: real files. Photos are downscaled and stored with the entry; videos
// stay in the phone's own library and the entry keeps an honest note of them.
function MediaPicker({
  value = null,
  onChange = () => {}
}) {
  const media = value;
  const onFile = (e, source) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.type && f.type.startsWith('video')) {
      onChange({
        source,
        kind: 'video',
        name: f.name
      });
      return;
    }
    window.fileToImageDataURL(f, 1024, 0.72, url => onChange({
      source,
      kind: 'photo',
      dataUrl: url
    }));
  };
  if (media) {
    const isVideo = media.kind === 'video';
    const sourceLabel = isVideo ? 'Video noted. The video itself stays safely in your photo library.' : media.source === 'capture' ? 'Taken just now' : 'Chosen from your photos';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--line)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        minHeight: isVideo ? 110 : 0,
        background: 'var(--photo-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, isVideo ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 18px -8px rgba(20,40,80,0.5)',
        paddingLeft: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 26,
      color: "var(--blue)",
      fill: true
    })) : /*#__PURE__*/React.createElement("img", {
      src: media.dataUrl,
      alt: "Attached photo",
      style: {
        display: 'block',
        width: '100%',
        maxHeight: 220,
        objectFit: 'cover'
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => onChange(null),
      "aria-label": "Remove media",
      className: "j-press",
      style: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 10,
        border: 'none',
        background: 'rgba(255,255,255,0.92)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "close",
      size: 17,
      color: "var(--muted)"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 13px',
        background: 'var(--card)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: isVideo ? 'video' : 'camera',
      size: 17,
      color: "var(--blue)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'calc(13.5px * var(--tscale, 1))',
        color: 'var(--faint)'
      }
    }, sourceLabel)));
  }
  const tile = (label, sub, icon, capture) => /*#__PURE__*/React.createElement("label", {
    className: "j-press",
    style: {
      flex: 1,
      minHeight: 84,
      borderRadius: 14,
      cursor: 'pointer',
      border: '1.5px dashed var(--chip-border)',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 24,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(12px * var(--tscale, 1))',
      color: 'var(--faint)'
    }
  }, sub), /*#__PURE__*/React.createElement("input", _extends({
    type: "file",
    accept: "image/*,video/*"
  }, capture ? {
    capture: 'environment'
  } : {}, {
    style: {
      display: 'none'
    },
    onChange: e => onFile(e, capture ? 'capture' : 'attach')
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, tile('Capture', 'Photo or video', 'camera', true), tile('Attach media', 'From your photos', 'attach', false));
}

// The quick log is dynamic (founder + wife's insight, 15 Jul 2026): a real day
// holds several moments, each with its own time, place, kind and mood (a morning
// wobble in transition, a new word at lunch, an incident while eating). Rather
// than force a separate log per moment, the day and place are set once at the
// top, then each category pill is an "add" button: tap it, write the moment,
// Okay, and it banks with a count badge. Change When and the next tap stamps the
// new time. One Save writes every banked moment as its own dated entry, so each
// stays individually findable, filterable and printable, the way evidence must.
// Incidents opens the same pattern with a richer before/during/after box and
// saves as a dysregulation note (type 'handover').
// The context row (founder, 16 Jul 2026): Day / Where / When sit side by side,
// each one a tinted card holding its label above its current answer, so the pair
// reads as a single thing to tap. Tapping a card opens just its own options
// underneath and blurs the rest of the screen, so a tired parent looks at one
// question at a time. Picking an answer closes it.
function ContextField({
  label,
  value,
  active,
  onClick
}) {
  return (
    /*#__PURE__*/
    // the card carries its label in the accessible name too, so a screen reader
    // never reads the answer out as a bare word with nothing to attach it to
    React.createElement("button", {
      onClick: onClick,
      "aria-expanded": active,
      "aria-label": label + ', ' + value,
      className: 'j-card j-ctx' + (active ? ' j-ctx-on' : '')
    }, /*#__PURE__*/React.createElement("span", {
      className: "j-ctx-q"
    }, label), /*#__PURE__*/React.createElement("span", {
      className: "j-ctx-a"
    }, value))
  );
}
function QuickLogScreen({
  nav,
  today,
  view,
  profile
}) {
  const J = window.JOTLA;
  const [setting, setSetting] = useStateA('School');
  const [time, setTime] = useStateA('Morning');
  const [picker, setPicker] = useStateA(null); // null | 'day' | 'where' | 'when'
  const [places, setPlaces] = useStateA([]); // the parent's own places, added via Other
  const [placeOpen, setPlaceOpen] = useStateA(false);
  const [placeText, setPlaceText] = useStateA('');
  const minus1 = iso => {
    const d = J.parseISO(iso);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  // A date can arrive on the view (the Day view's "Add a note", 12 Jul 2026),
  // pre-setting the day chips so nothing needs re-picking.
  const preset = view && typeof view.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(view.date) && view.date >= window.MIN_LOG_DAY && view.date <= today ? view.date : null;
  const [dayMode, setDayMode] = useStateA(!preset || preset === today ? 'today' : preset === minus1(today) ? 'yesterday' : 'custom'); // today | yesterday | custom
  const [customDate, setCustomDate] = useStateA(preset && preset !== today && preset !== minus1(today) ? preset : minus1(minus1(today)));
  const [dayPickerOpen, setDayPickerOpen] = useStateA(false);
  const logDate = dayMode === 'today' ? today : dayMode === 'yesterday' ? minus1(today) : customDate;

  // the day's banked moments, and the one category whose editor is open
  const [moments, setMoments] = useStateA([]);
  const [openCat, setOpenCat] = useStateA(null);
  const [editKey, setEditKey] = useStateA(null); // set when reopening a banked moment
  const [eText, setEText] = useStateA('');
  const [eMood, setEMood] = useStateA('good');
  const [eBefore, setEBefore] = useStateA('');
  const [eDuring, setEDuring] = useStateA('');
  const [eAfter, setEAfter] = useStateA('');
  const [eWho, setEWho] = useStateA([]); // who was there (founder, 16 Jul 2026)
  const [eMedia, setEMedia] = useStateA(null);
  const isInc = openCat === 'Incidents';
  const openEditor = c => {
    setPicker(null);
    setOpenCat(c);
    setEditKey(null);
    setEText('');
    setEMood(c === 'Incidents' ? 'hard' : 'good');
    setEBefore('');
    setEDuring('');
    setEAfter('');
    setEWho([]);
    setEMedia(null);
  };
  // A banked moment reopens for changing (founder, 16 Jul 2026): something else
  // often comes back to you while you are still sitting there logging. It keeps
  // its own time and place; only what happened changes.
  const editMoment = m => {
    setPicker(null);
    setOpenCat(m.category);
    setEditKey(m.key);
    setEText(m.text);
    setEMood(m.mood);
    setEBefore(m.before);
    setEDuring(m.during);
    setEAfter(m.after);
    setEWho(m.who || []);
    setEMedia(m.media);
  };
  const bankMoment = () => {
    const body = {
      category: openCat,
      mood: eMood,
      isIncident: openCat === 'Incidents',
      text: eText.trim(),
      before: eBefore.trim(),
      during: eDuring.trim(),
      after: eAfter.trim(),
      who: eWho,
      media: eMedia
    };
    if (editKey) setMoments(ms => ms.map(m => m.key === editKey ? {
      ...m,
      ...body
    } : m));else setMoments(ms => [...ms, {
      ...body,
      key: 'm' + Date.now() + '_' + ms.length,
      time,
      setting
    }]);
    setOpenCat(null);
    setEditKey(null);
  };
  const removeMoment = key => {
    setMoments(ms => ms.filter(m => m.key !== key));
    if (editKey === key) {
      setOpenCat(null);
      setEditKey(null);
    }
  };
  const countFor = c => moments.filter(m => m.category === c).length;
  const nowClock = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  const save = () => {
    if (!moments.length) return;
    const kind = dayMode === 'today' ? 'contemporaneous' : 'recalled';
    // One Save is one log (founder, 16 Jul 2026): the moments written together
    // share a logId and a clock, so the record reads back as the single log the
    // parent wrote. Each moment still lands as its own dated entry underneath,
    // which is what keeps Find, the month graph and the PDF pack working.
    const logId = 'L' + Date.now();
    const clock = nowClock();
    // addEntry prepends, so add in reverse to keep the order they were written
    [...moments].reverse().forEach(m => {
      const base = {
        id: (m.isIncident ? 'h' : 'n') + m.key,
        logId,
        date: logDate,
        time: m.time,
        clock,
        setting: m.setting,
        category: m.category,
        mood: m.mood,
        kind
      };
      const entry = m.isIncident ? {
        ...base,
        type: 'handover',
        summary: m.during || m.text || 'Hard moment captured.',
        handover: {
          behaviours: [],
          before: m.before,
          during: m.during || m.text,
          after: m.after,
          duration: '',
          helped: '',
          who: m.who || [],
          where: ''
        }
      } : {
        ...base,
        type: 'quick',
        summary: m.text || `${m.category} at ${m.setting.toLowerCase()}. ${m.time} went ${m.mood === 'good' ? 'well' : m.mood === 'ok' ? 'up and down' : 'hard'}.`
      };
      if (m.media && m.media.dataUrl) {
        entry.photoData = m.media.dataUrl;
        entry.photo = 'Photo from the day';
      } else if (m.media && m.media.kind === 'video') {
        entry.photo = 'Video noted (kept in your photo library)';
      }
      nav.addEntry(entry);
    });
    nav.back();
  };
  const moodDot = mk => /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: window.MOOD_COLOURS[mk],
      flexShrink: 0,
      marginTop: 6
    }
  });
  // A day from another year has to say so (founder, 16 Jul 2026): the formatters
  // never print a year, so "10 Dec" alone leaves you guessing which December.
  // The year shows only when it is not the current one, so the common case stays short.
  const yearSuffix = J.parseISO(logDate).getFullYear() === J.parseISO(today).getFullYear() ? '' : ' ' + J.parseISO(logDate).getFullYear();
  const longDate = J.fmtLong(logDate) + yearSuffix;
  const dayLabel = dayMode === 'today' ? 'Today' : dayMode === 'yesterday' ? 'Yesterday' : J.fmtShort(logDate) + yearSuffix;
  const placeOptions = [...J.SETTINGS, ...places];
  // a reopened moment keeps its own stamp; a new one takes the row's current answers
  const editing = editKey ? moments.find(m => m.key === editKey) : null;
  const eTime = editing ? editing.time : time;
  const eSetting = editing ? editing.setting : setting;
  // while a question is open, the rest of the screen softens out of the way
  const dim = {
    transition: 'filter .18s ease, opacity .18s ease',
    ...(picker ? {
      filter: 'blur(4px)',
      opacity: 0.4
    } : {})
  };
  const pickerChip = (label, on, onPick) => /*#__PURE__*/React.createElement("button", {
    key: label,
    "aria-pressed": on,
    className: 'j-chip' + (on ? ' j-chip-on' : ''),
    onClick: onPick
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Quick log",
    subtitle: "Log the whole day, one moment at a time",
    onClose: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingBottom: 130,
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(ContextField, {
    label: "Day",
    value: dayLabel,
    active: picker === 'day',
    onClick: () => setPicker(p => p === 'day' ? null : 'day')
  }), /*#__PURE__*/React.createElement(ContextField, {
    label: "Where",
    value: setting,
    active: picker === 'where',
    onClick: () => setPicker(p => p === 'where' ? null : 'where')
  }), /*#__PURE__*/React.createElement(ContextField, {
    label: "When",
    value: time,
    active: picker === 'when',
    onClick: () => setPicker(p => p === 'when' ? null : 'when')
  })), picker && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, picker === 'day' && [pickerChip('Today', dayMode === 'today', () => {
    setDayMode('today');
    setPicker(null);
  }), pickerChip('Yesterday', dayMode === 'yesterday', () => {
    setDayMode('yesterday');
    setPicker(null);
  }), pickerChip('Another day', dayMode === 'custom', () => {
    setDayMode('custom');
    setDayPickerOpen(true);
    setPicker(null);
  })], picker === 'where' && [...placeOptions.map(s => pickerChip(s, setting === s, () => {
    setSetting(s);
    setPicker(null);
  })), /*#__PURE__*/React.createElement("button", {
    key: "__other",
    className: "j-chip",
    style: {
      borderStyle: 'dashed'
    },
    onClick: () => setPlaceOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    color: "var(--faint)"
  }), " Other")], picker === 'when' && J.TIMES.map(t => pickerChip(t, time === t, () => {
    setTime(t);
    setPicker(null);
  }))), picker === 'where' && placeOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    style: {
      flex: 1,
      minWidth: 0
    },
    value: placeText,
    onChange: e => setPlaceText(e.target.value),
    "aria-label": "Add a place",
    placeholder: "Grandma's, the park, soft play..."
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      flex: '0 0 auto',
      width: 'auto',
      minHeight: 48,
      padding: '0 22px'
    },
    onClick: () => {
      const t = placeText.trim();
      if (!t) return;
      if (!placeOptions.includes(t)) setPlaces(p => [...p, t]);
      setSetting(t);
      setPlaceText('');
      setPlaceOpen(false);
      setPicker(null);
    }
  }, "Add"))), /*#__PURE__*/React.createElement("div", {
    onClick: picker ? () => setPicker(null) : undefined,
    style: dim
  }, /*#__PURE__*/React.createElement("div", {
    style: picker ? {
      pointerEvents: 'none'
    } : undefined
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      margin: '12px 0 0',
      color: 'var(--faint)'
    }
  }, "Saving to ", /*#__PURE__*/React.createElement("span", {
    className: "j-strong",
    style: {
      color: 'var(--muted)'
    }
  }, longDate)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(FieldLabel, null, "What happened?"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      margin: '-4px 0 12px',
      color: 'var(--faint)'
    }
  }, "Tap what happened. Add as many as you like, then Save once."), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, J.CATEGORIES.map(c => {
    const n = countFor(c);
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      className: 'j-chip' + (n > 0 || openCat === c ? ' j-chip-on' : ''),
      onClick: () => openEditor(c)
    }, c, n > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 20,
        height: 20,
        padding: '0 5px',
        borderRadius: 999,
        background: 'var(--blue)',
        color: '#fff',
        fontSize: 'calc(12px * var(--tscale, 1))',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, n));
  }))), openCat && /*#__PURE__*/React.createElement("div", {
    className: "j-card j-card-pad",
    style: {
      marginTop: 22,
      border: '1.5px solid var(--blue)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(17px * var(--tscale, 1))',
      color: 'var(--ink)',
      margin: 0
    }
  }, openCat), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 2
    }
  }, eTime, " \xB7 ", eSetting, " \xB7 ", longDate)), isInc ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PhaseField, {
    label: "Before",
    hint: "What led up to it",
    value: eBefore,
    onChange: setEBefore
  }), /*#__PURE__*/React.createElement(PhaseField, {
    label: "During",
    hint: "What actually happened",
    value: eDuring,
    onChange: setEDuring
  }), /*#__PURE__*/React.createElement(PhaseField, {
    label: "After",
    hint: "How it ended",
    value: eAfter,
    onChange: setEAfter
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Who was there?"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, whoChipsFor(profile).map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    "aria-pressed": eWho.includes(c),
    className: 'j-chip' + (eWho.includes(c) ? ' j-chip-on' : ''),
    onClick: () => setEWho(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])
  }, c))))) : /*#__PURE__*/React.createElement("textarea", {
    className: "j-input",
    value: eText,
    onChange: e => setEText(e.target.value),
    rows: 3,
    placeholder: "A line is plenty. Their exact words, in quotes, are gold."
  }), nav.plus ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Add a photo or video"), /*#__PURE__*/React.createElement(MediaPicker, {
    value: eMedia,
    onChange: setEMedia
  })) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    title: "Add photos and videos",
    text: "Keep a photo or video with the note. Sometimes the picture is the evidence. Part of Plus.",
    onClick: () => nav.go('unlock')
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "How did it feel?"), /*#__PURE__*/React.createElement(MoodFacePicker, {
    value: eMood,
    onChange: setEMood
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      flex: '0 0 38%',
      minHeight: 52
    },
    onClick: () => {
      setOpenCat(null);
      setEditKey(null);
    }
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    style: {
      flex: 1,
      minHeight: 52
    },
    onClick: bankMoment
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 20,
    color: "#fff"
  }), " Okay"))), moments.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Moments so far"), /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: '4px 16px'
    }
  }, moments.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.key,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      padding: '12px 0',
      borderTop: moments[0].key === m.key ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => editMoment(m),
    "aria-label": 'Edit the ' + m.category + ' moment',
    className: "j-press",
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      textAlign: 'left',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 0
    }
  }, moodDot(m.mood), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-meta",
    style: {
      display: 'block'
    }
  }, m.time, " \xB7 ", m.setting, " \xB7 ", m.category), /*#__PURE__*/React.createElement("span", {
    className: "j-body",
    style: {
      display: 'block',
      fontSize: 'calc(15px * var(--tscale, 1))',
      marginTop: 1
    }
  }, m.isIncident ? m.during || m.text || 'Incident noted' : m.text || 'Noted'))), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeMoment(m.key),
    "aria-label": "Remove moment",
    className: "j-press",
    style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      border: 'none',
      background: 'var(--tag-grey-bg)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 16,
    color: "var(--muted)"
  }))))), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 8
    }
  }, "Tap a moment to change it. It all saves as one log.")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
      background: 'var(--fade-grad)',
      ...dim,
      ...(picker ? {
        pointerEvents: 'none'
      } : {})
    }
  }, moments.length > 0 && /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      textAlign: 'center',
      marginBottom: 8
    }
  }, moments.length, " moment", moments.length === 1 ? '' : 's', " ready. Saves as one log."), /*#__PURE__*/React.createElement("button", {
    className: 'j-btn j-btn-lg' + (moments.length ? ' j-btn-primary' : ''),
    onClick: save,
    style: moments.length ? {} : {
      background: 'var(--tag-grey-bg)',
      color: 'var(--faint)',
      boxShadow: 'none',
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 22,
    color: moments.length ? '#fff' : 'var(--faint)'
  }), " Save")), dayPickerOpen && /*#__PURE__*/React.createElement(CalendarSheet, {
    onClose: () => setDayPickerOpen(false),
    value: customDate,
    onSelect: setCustomDate,
    minDate: window.MIN_LOG_DAY,
    maxDate: today
  }));
}

// ---------------- Dysregulation (guided capture) ----------------
// Child-centred, supportive questions. Not a witness statement.
const GATE_QUESTIONS = name => ['What happened?', 'Where and when was this?', 'Who was there?', `How did ${name} seem?`, 'What seemed to lead up to it?', 'What helped, or what happened next?'];

// Who was with the child, and where it happened (founder ask, 15 Jul 2026): the
// the guided note now captures the scene, not only the behaviours and the ABC phases.
const WHO_CHIPS = ['Teachers', 'TA', 'Other children', 'Other adults'];
// The child's own named adults (the circle) lead the who-chips, exactly as they
// already do in child mode (founder spec, 12 Jul 2026): "Miss Bell" is worth more
// to a parent proving a pattern than "TA". Deduped case-insensitively so an adult
// actually named "TA" never doubles the generic chip.
function whoChipsFor(profile) {
  const named = (profile && profile.adults || []).filter(Boolean);
  return [...named, ...WHO_CHIPS.filter(g => !named.some(n => n.toLowerCase() === g.toLowerCase()))];
}
const WHERE_CHIPS = ['Classroom', 'Playground', 'Corridor', 'Lunch hall', 'Outside', 'Toilets', 'Other'];
function Stepper({
  value,
  onChange,
  unit = 'mins'
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(value + 1);
  const btn = (label, fn) => /*#__PURE__*/React.createElement("button", {
    onClick: fn,
    className: "j-press",
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      border: '1.5px solid var(--chip-border)',
      background: 'var(--card)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--blue)'
    }
  }, label);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, btn(/*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(26px * var(--tscale, 1))',
      fontWeight: 400,
      lineHeight: 1
    }
  }, "-"), dec), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 96,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(26px * var(--tscale, 1))',
      color: 'var(--ink)'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--faint)',
      marginLeft: 6
    }
  }, unit)), btn(/*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(24px * var(--tscale, 1))',
      fontWeight: 400,
      lineHeight: 1
    }
  }, "+"), inc));
}
function PhaseField({
  label,
  hint,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--blue)'
    }
  }, hint), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'calc(12.5px * var(--tscale, 1))',
      color: 'var(--faint)'
    }
  }, label)), /*#__PURE__*/React.createElement("textarea", {
    className: "j-input",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    },
    value: value,
    onChange: e => onChange(e.target.value),
    rows: 2,
    placeholder: "Type a few words, or tap chips below."
  }));
}
function HandoverScreen({
  nav,
  today,
  profile
}) {
  const J = window.JOTLA;
  const school = profile && profile.school || 'Oakfield Primary';
  const childName = profile && profile.name || 'Sam';
  const [behaviours, setBehaviours] = useStateA([]);
  const [before, setBefore] = useStateA('');
  const [during, setDuring] = useStateA('');
  const [after, setAfter] = useStateA('');
  const [duration, setDuration] = useStateA(10);
  const [helped, setHelped] = useStateA('');
  const [who, setWho] = useStateA([]); // who was with the child (multi-select)
  const [whereAt, setWhereAt] = useStateA(''); // where it happened (single-select)
  const [nudge, setNudge] = useStateA(false);
  const [media, setMedia] = useStateA(null);
  const [extras, setExtras] = useStateA([]);
  const [customOpen, setCustomOpen] = useStateA(false);
  const [customText, setCustomText] = useStateA('');
  const [draft, setDraft] = useStateA(`Hi,\n\nThank you for letting me know about ${childName} this afternoon. When you have a moment, would you mind sending me a quick email with what was discussed? It really helps to have the same picture at home and school.\n\nThank you so much.`);
  const save = () => {
    const now = new Date();
    const entry = {
      id: 'h' + Date.now(),
      date: today,
      time: now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening',
      clock: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      setting: 'School',
      category: 'Incidents',
      mood: 'hard',
      kind: 'contemporaneous',
      type: 'handover',
      summary: during.trim() ? during.trim() : 'Hard moment captured.',
      handover: {
        behaviours,
        before,
        during,
        after,
        duration: duration + ' mins',
        helped,
        who,
        where: whereAt
      }
    };
    if (media && media.dataUrl) {
      entry.photoData = media.dataUrl;
      entry.photo = 'Photo from the moment';
    } else if (media && media.kind === 'video') {
      entry.photo = 'Video noted (kept in your photo library)';
    }
    nav.addEntry(entry);
    setNudge(true);
  };
  const finish = () => {
    setNudge(false);
    nav.back();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen",
    style: {
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Dysregulation",
    subtitle: "One calm screen, minimal typing.",
    onBack: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingBottom: 150,
      paddingTop: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14,
    color: "var(--muted)"
  }), " ", (() => {
    const n = new Date();
    return (n.getHours() < 12 ? 'Morning' : n.getHours() < 17 ? 'Afternoon' : 'Evening') + ', ' + String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
  })()), /*#__PURE__*/React.createElement("span", {
    className: "j-pillbadge",
    style: {
      background: 'var(--card)',
      border: '1px solid var(--line)',
      color: 'var(--muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "today",
    size: 14,
    color: "var(--muted)"
  }), " ", school)), /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16,
      background: 'var(--tint-blue)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-eyebrow",
    style: {
      marginBottom: 4
    }
  }, "Ask the teacher"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm",
    style: {
      margin: 0,
      color: 'var(--blue)'
    }
  }, "Six gentle questions.", /*#__PURE__*/React.createElement("br", null), "Read them out, tap the answers below.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.go('tips'),
    className: "j-press",
    style: {
      border: 'none',
      cursor: 'pointer',
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 15px',
      borderRadius: 999,
      marginTop: 2,
      background: '#6E54D6',
      color: '#fff',
      fontFamily: "'Outfit', system-ui",
      fontWeight: 600,
      fontSize: 'calc(14px * var(--tscale, 1))',
      boxShadow: '0 8px 18px -8px rgba(110,84,214,0.7)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 16,
    color: "#fff"
  }), " TIPS")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, GATE_QUESTIONS(childName).map((q, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--card)',
      color: 'var(--blue)',
      fontSize: 'calc(12px * var(--tscale, 1))',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1
    }
  }, i + 1), /*#__PURE__*/React.createElement("p", {
    style: {
      flex: 1,
      minWidth: 0,
      margin: 0,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      color: 'var(--ink)',
      fontWeight: 400,
      lineHeight: 1.4
    }
  }, q))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "What did you see? Tap what fits."), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, [...J.BEHAVIOURS, ...extras].map(b => /*#__PURE__*/React.createElement("button", {
    key: b,
    "aria-pressed": behaviours.includes(b),
    className: 'j-chip' + (behaviours.includes(b) ? ' j-chip-on' : ''),
    onClick: () => setBehaviours(v => v.includes(b) ? v.filter(x => x !== b) : [...v, b])
  }, b)), /*#__PURE__*/React.createElement("button", {
    className: "j-chip",
    style: {
      borderStyle: 'dashed'
    },
    onClick: () => setCustomOpen(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 15,
    color: "var(--faint)"
  }), " Add your own")), customOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "j-input",
    style: {
      flex: 1,
      minWidth: 0
    },
    value: customText,
    onChange: e => setCustomText(e.target.value),
    placeholder: "Your own word for what you saw"
  }), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-soft",
    style: {
      flex: '0 0 auto',
      width: 'auto',
      minHeight: 48,
      padding: '0 22px'
    },
    onClick: () => {
      const t = customText.trim();
      if (!t) return;
      if (!extras.includes(t) && !J.BEHAVIOURS.includes(t)) setExtras(x => [...x, t]);
      setBehaviours(v => v.includes(t) ? v : [...v, t]);
      setCustomText('');
      setCustomOpen(false);
    }
  }, "Add"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Who was with ", childName, "?"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, whoChipsFor(profile).map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    "aria-pressed": who.includes(c),
    className: 'j-chip' + (who.includes(c) ? ' j-chip-on' : ''),
    onClick: () => setWho(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])
  }, c)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Where did it happen?"), /*#__PURE__*/React.createElement("div", {
    className: "j-chiprow"
  }, WHERE_CHIPS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    "aria-pressed": whereAt === c,
    className: 'j-chip' + (whereAt === c ? ' j-chip-on' : ''),
    onClick: () => setWhereAt(v => v === c ? '' : c)
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(PhaseField, {
    label: "Before",
    hint: "What led up to it",
    value: before,
    onChange: setBefore
  }), /*#__PURE__*/React.createElement(PhaseField, {
    label: "During",
    hint: "What actually happened",
    value: during,
    onChange: setDuring
  }), /*#__PURE__*/React.createElement(PhaseField, {
    label: "After",
    hint: "How it ended",
    value: after,
    onChange: setAfter
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--blue)',
      margin: '0 0 10px'
    }
  }, "How long did it last?"), /*#__PURE__*/React.createElement(Stepper, {
    value: duration,
    onChange: setDuration
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Cal Sans', system-ui",
      fontWeight: 500,
      fontSize: 'calc(15px * var(--tscale, 1))',
      color: 'var(--blue)',
      margin: '0 0 10px'
    }
  }, "What helped them settle?"), /*#__PURE__*/React.createElement("textarea", {
    className: "j-input",
    style: {
      fontSize: 'calc(15.5px * var(--tscale, 1))'
    },
    value: helped,
    onChange: e => setHelped(e.target.value),
    rows: 2,
    placeholder: "The thing that worked, however small."
  })), nav.plus ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLabel, null, "Add a photo or video"), /*#__PURE__*/React.createElement(MediaPicker, {
    value: media,
    onChange: setMedia
  })) : /*#__PURE__*/React.createElement(PlusLockedCard, {
    title: "Add photos and videos",
    text: "Keep a photo or video with the note. Sometimes the picture is the evidence. Part of Plus.",
    onClick: () => nav.go('unlock')
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
      background: 'var(--fade-grad)',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      flex: '0 0 38%'
    },
    onClick: () => {
      const touched = behaviours.length || who.length || whereAt || before.trim() || during.trim() || after.trim() || helped.trim() || media;
      if (!touched || window.confirm('Leave without saving this note? What you have entered here will be lost.')) nav.back();
    }
  }, "Finish later"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    style: {
      flex: 1
    },
    onClick: save
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 20,
    color: "#fff"
  }), " Save note")), nudge && /*#__PURE__*/React.createElement("div", {
    className: "j-sheet-scrim",
    onClick: finish
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "j-sheet"
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
      background: 'var(--tint-green)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 26,
    color: "var(--green)"
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "j-h2",
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, "Saved to ", childName, "'s record"), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      textAlign: 'center',
      color: 'var(--muted)',
      marginBottom: 18
    }
  }, "Want to drop the teacher a quick line? It helps to have the same picture at home and school."), /*#__PURE__*/React.createElement("textarea", {
    className: "j-input",
    value: draft,
    onChange: e => setDraft(e.target.value),
    rows: 6,
    style: {
      fontSize: 'calc(15px * var(--tscale, 1))',
      lineHeight: 1.5,
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginBottom: 16
    }
  }, "Nothing is sent for you. This just opens your own email with the words ready, so you can change them or not send at all."), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: () => {
      window.location.assign('mailto:?subject=' + encodeURIComponent('About ' + childName + ' today') + '&body=' + encodeURIComponent(draft));
      finish();
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowRight",
    size: 20,
    color: "#fff"
  }), " Open in email"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    style: {
      marginTop: 10
    },
    onClick: finish
  }, "Not now"))));
}

// ---------------- "Dysregulation" explainer (shown before capture when there is no Plus) ----------------
// Deliberately uses the word "dysregulation": it is the word SEND parents hear
// constantly from school, and meeting them in their own vocabulary is the point.
function GateIntroScreen({
  nav,
  profile
}) {
  const childName = profile && profile.name || 'Sam';
  const reasons = [['In the moment', `You know exactly what to ask, so "dysregulated" never goes into the record as one bare word with nothing behind it.`], ['Over time', 'Because it records what came before and what helped, the patterns become easy to find.'], ['When it counts', 'It reads as a calm, factual note rather than a vent. The kind of note made on the day that helps at an EHCP assessment, an annual review, or a tribunal.']];
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Dysregulation",
    onClose: () => nav.back()
  }), /*#__PURE__*/React.createElement("div", {
    className: "j-scroll j-fade"
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      paddingTop: 4,
      paddingBottom: 150
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 15,
      background: 'var(--tint-blue)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 26,
    color: "var(--blue)"
  }))), /*#__PURE__*/React.createElement("h1", {
    className: "j-h1",
    style: {
      marginBottom: 10
    }
  }, "For the days you hear \"dysregulated\""), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, "A quick log captures that something happened, and how it felt. A line is plenty."), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)',
      marginBottom: 14
    }
  }, "A dysregulation note is for the harder days. The teacher meets you at the gate, or the message home says ", childName, " was dysregulated, and you are left holding one word instead of a picture of what actually happened."), /*#__PURE__*/React.createElement("p", {
    className: "j-body",
    style: {
      color: 'var(--muted)',
      marginBottom: 22
    }
  }, "Dysregulation Mode walks you through it while you are still standing there. It knows the right questions to ask, and the right order to ask them in, and it turns the answers into a calm, dated note: what led up to it, what happened, and what helped. The time and place add themselves."), /*#__PURE__*/React.createElement(SectionLabel, null, "Why it is worth it"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 12
    }
  }, reasons.map(([h, b]) => /*#__PURE__*/React.createElement("div", {
    key: h,
    className: "j-card",
    style: {
      padding: 16,
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 10,
      background: 'var(--tint-green)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 17,
    color: "var(--green)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-h3",
    style: {
      marginBottom: 4
    }
  }, h), /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, b)))), /*#__PURE__*/React.createElement("div", {
    className: "j-card",
    style: {
      padding: 16,
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start',
      background: 'var(--tint-amber)',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 10,
      background: 'var(--card)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 17,
    color: "var(--amber)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "j-h3",
    style: {
      marginBottom: 4
    }
  }, "Tips come with it"), /*#__PURE__*/React.createElement("p", {
    className: "j-sm"
  }, "Short, calm guidance for the moment itself: how to steady yourself and ", childName, ", and what tends to do more harm than good.")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '12px 20px calc(16px + env(safe-area-inset-bottom))',
      background: 'var(--fade-grad)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary j-btn-lg",
    onClick: () => nav.go('unlock')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkle",
    size: 20,
    color: "#fff"
  }), " See what Plus adds"), /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-ghost",
    onClick: () => nav.go('quicklog')
  }, "Just log it quickly instead")));
}

// ---------------- Tips (Plus): how to be, when your child is dysregulated ----------------
// A calm, swipeable deck rather than a wall of text. Widely accepted co-regulation
// practice in plain language; never medical advice, and it says so.
const DYSREG_TIPS = [{
  illo: 'tipCalm',
  icon: 'heart',
  tint: 'var(--tint-green)',
  ink: 'var(--green)',
  title: 'Start with you',
  body: 'Your calm is the tool. Take one slow breath before any words. A dysregulated child borrows their calm from the nearest steady adult; that is co-regulation, and you are the anchor.',
  say: '"I\'m here. You\'re safe."'
},
// The \n is a deliberate break, not wrapping (founder, 16 Jul). .j-illo-title
// sets white-space: pre-line to honour it; aria-labels flatten it back to a space.
{
  illo: 'tipSoft',
  icon: 'hand',
  tint: 'var(--tint-blue)',
  ink: 'var(--blue)',
  title: 'Fewer words,\nsofter everything',
  body: 'Keep it short and simple. Lower your voice, come down to their level, stand slightly side-on rather than face-on. No questions yet: in the storm the thinking part of the brain is offline, so reasoning cannot land.'
}, {
  illo: 'tipAvoid',
  icon: 'close',
  tint: 'var(--tint-red)',
  ink: 'var(--red-ink)',
  title: 'What makes it worse',
  body: 'Asking why. Threatening consequences. Crowding, holding or blocking the way unless safety truly demands it. Taking what is said in the storm personally. Dysregulation is not naughtiness, and mid-storm is never the teaching moment.'
}, {
  illo: 'tipRoom',
  icon: 'leaf',
  tint: 'var(--tint-amber)',
  ink: 'var(--amber)',
  title: 'Give it room to pass',
  body: 'Less noise, less light, less audience, if you can manage it. One steady presence beats a crowd. A storm passes faster when nothing feeds it.'
}, {
  illo: 'tipReconnect',
  icon: 'heart',
  tint: 'var(--tint-green)',
  ink: 'var(--green)',
  title: 'Afterwards,\nreconnect first',
  body: 'Repair before review. Let them know the storm did not change anything between you. Save the talking-through for later, once everyone is truly calm, and keep it free of blame.',
  say: '"That was hard. We\'re okay."'
}, {
  illo: 'tipWrite',
  icon: 'note',
  tint: 'var(--tint-blue)',
  ink: 'var(--blue)',
  title: 'Then write it down',
  body: 'Once things are settled, open Dysregulation. It asks you the right questions in the right order while everything is still fresh. Hours later is fine; the record keeps its timing honest.',
  cta: true
}];

// The one line of chrome left at the bottom of the deck. The \n is a deliberate
// break (founder, 17 Jul), not wrapping: it keeps "Good general practice" whole
// with the swipe instruction and puts the disclaimer on its own line. Rendered
// with white-space: pre-line.
const TIPS_ADVISORY = 'Swipe for the next one. Good general practice,\nnot medical advice; you know your child best.';
function DysregTipsScreen({
  nav
}) {
  const [idx, setIdx] = useStateA(0);
  const pagerRef = useRefA(null);
  const onScroll = () => {
    const el = pagerRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "j-screen"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      padding: '14px 18px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-eyebrow"
  }, "Tips \xB7 ", idx + 1, " of ", DYSREG_TIPS.length), /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      marginTop: 3
    }
  }, "How to be, when it is happening")), /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.back(),
    className: "j-press",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: 'var(--faint)',
      fontSize: 'calc(14.5px * var(--tscale, 1))',
      fontWeight: 500,
      padding: 4,
      flexShrink: 0
    }
  }, "Skip")), /*#__PURE__*/React.createElement("div", _extends({
    ref: pagerRef,
    onScroll: onScroll,
    className: "j-pager j-fade"
  }, pagerKeyProps(pagerRef, 'Tips'), {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
      WebkitOverflowScrolling: 'touch',
      outline: 'none'
    }
  }), DYSREG_TIPS.map((t, i) =>
  /*#__PURE__*/
  /* A Tips card must not scroll (founder, 17 Jul). The illustration gives
     way instead (see .j-illo-slot), so on every normal phone this never
     fires; it is the valve for the one case where the words alone fill the
     screen, and it beats clipping the say pill off the bottom. */
  React.createElement("div", {
    key: i,
    style: {
      flex: '0 0 100%',
      width: '100%',
      height: '100%',
      scrollSnapAlign: 'start',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "j-pad",
    style: {
      '--illo-copy': '17.2em',
      height: '100%',
      boxSizing: 'border-box',
      paddingTop: 6,
      paddingBottom: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, t.illo ? /*#__PURE__*/React.createElement("span", {
    className: "j-illo-slot",
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(StoryIllo, {
    scene: t.illo,
    width: 264
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 76,
      height: 76,
      borderRadius: 24,
      background: t.tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 36,
    color: t.ink
  })), /*#__PURE__*/React.createElement("div", {
    className: "j-illo-copy"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "j-h1 j-illo-title",
    style: {
      marginBottom: 12
    }
  }, t.title), /*#__PURE__*/React.createElement("p", {
    className: "j-body j-illo-body",
    style: {
      color: 'var(--muted)',
      fontSize: 'calc(16.5px * var(--tscale, 1))',
      lineHeight: 1.55,
      maxWidth: 330
    }
  }, t.body), (t.say || t.cta) && /*#__PURE__*/React.createElement("div", {
    className: "j-illo-tail"
  }, t.say && /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '10px 18px',
      borderRadius: 999,
      background: t.tint,
      color: t.ink,
      fontSize: 'calc(15.5px * var(--tscale, 1))',
      fontWeight: 500
    }
  }, t.say), t.cta && /*#__PURE__*/React.createElement("button", {
    className: "j-btn j-btn-primary",
    onClick: () => nav.go('handover')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "note",
    size: 18,
    color: "#fff"
  }), " Open Dysregulation"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 20px calc(14px + env(safe-area-inset-bottom))',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "j-meta",
    style: {
      textAlign: 'center',
      whiteSpace: 'pre-line',
      lineHeight: 1.45
    }
  }, TIPS_ADVISORY)));
}
Object.assign(window, {
  TodayScreen,
  QuickLogScreen,
  HandoverScreen,
  GateIntroScreen,
  DysregTipsScreen,
  ChipGroup,
  FieldLabel,
  PhotoPicker,
  MediaPicker,
  greeting
});