// jotla-icons.jsx: calm line icons. One stroke weight, round caps. 24x24 grid.
function Icon({ name, size = 24, color = 'currentColor', stroke = 2, fill = false, style = {} }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { display: 'block', ...style }, 'aria-hidden': true,
  };
  const paths = {
    today: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M9.5 19.5v-5h5v5" /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    doc: <><path d="M6 3h7l5 5v13H6z" /><path d="M13 3v5h5" /><path d="M9 13h6M9 16.5h6" /></>,
    /* a real cog with teeth (founder, 7 Aug: the ray version read as a sun) */
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    camera: <><path d="M4 8.5h3l1.3-2h7.4L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5Z" /><circle cx="12" cy="13.5" r="3.2" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4.2l2.6 1.8" /></>,
    chevronRight: <path d="m9 5 7 7-7 7" />,
    chevronLeft: <path d="m15 5-7 7 7 7" />,
    chevronDown: <path d="m5 9 7 7 7-7" />,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
    shield: <><path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    sparkle: <><path d="M12 4.5c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5Z" /></>,
    arrowRight: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    arrowLeft: <><path d="M20 12H5M11 6l-6 6 6 6" /></>,
    hand: <><path d="M8 11V6.5a1.5 1.5 0 0 1 3 0V11m0-1.5V5a1.5 1.5 0 0 1 3 0v6m0-3.5a1.5 1.5 0 0 1 3 0V15a5.5 5.5 0 0 1-5.5 5.5H11A5 5 0 0 1 7 18l-2-2.5a1.6 1.6 0 0 1 2.4-2L8 14.5" /></>,
    edit: <><path d="M5 19h3l9.5-9.5-3-3L5 16z" /><path d="M14.5 6.5l3 3" /></>,
    download: <><path d="M12 4v10M8 10.5l4 4 4-4" /><path d="M5 19.5h14" /></>,
    heart: <><path d="M12 19.5C6 15.8 4 12.6 4 9.5A4 4 0 0 1 12 7a4 4 0 0 1 8 2.5c0 3.1-2 6.3-8 10z" /></>,
    leaf: <><path d="M5 19c0-7 4.5-12 14-12 0 9-5 13-11 13a3 3 0 0 1-3-1Z" /><path d="M9 15c2-3 4.5-5 8-6.5" /></>,
    note: <><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" /></>,
    bell: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z" /><path d="M10 19.5a2 2 0 0 0 4 0" /></>,
    star: <><path d="M12 4l2.3 4.8 5.2.7-3.8 3.6 1 5.1L12 16.4 7.3 18.8l1-5.1L4.5 9.5l5.2-.7z" /></>,
    play: <path d="M8 5.5v13l11-6.5z" />,
    video: <><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="m16 10.5 5-3v9l-5-3z" /></>,
    attach: <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />,
    moon: <><path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" /></>,
    /* ---- redesign kit (2026-08-06 neutral shell) ---- */
    menu: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
    /* the standing Jotla symbol for dysregulation */
    pulse: <path d="M3 12h4l2.5-7 4 14 2.5-7H21" />,
    /* the two solid icons: the crown (Plus gate, the only gold) and the
       sparkles (the Jotla AI mark, founder 7 Aug); everything else is stroke */
    crown: <path d="M3.6 18 2.6 8.6l4.9 3.3L12 5.6l4.5 6.3 4.9-3.3-1 9.4a1.4 1.4 0 0 1-1.4 1.2H5a1.4 1.4 0 0 1-1.4-1.2z" fill={color} stroke="none" />,
    sparkles: <path d="M10.5 6.5c.9 4.6 2.5 6.2 7 7-4.5.8-6.1 2.4-7 7-.9-4.6-2.5-6.2-7-7 4.5-.8 6.1-2.4 7-7ZM18 3.5c.45 2.3 1.25 3.1 3.5 3.5-2.25.4-3.05 1.2-3.5 3.5-.45-2.3-1.25-3.1-3.5-3.5 2.25-.4 3.05-1.2 3.5-3.5Z" fill={color} stroke="none" />,
    palette: <><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.2 0 1.9-.7 1.9-1.6 0-.8-.5-1.2-.5-2 0-1 .8-1.7 1.9-1.7H17a4.5 4.5 0 0 0 4.5-4.5c0-4.1-4.3-7.2-9.5-7.2z" /><circle cx="7.5" cy="11" r="1.05" /><circle cx="10.5" cy="7.5" r="1.05" /><circle cx="14.5" cy="7.5" r="1.05" /><circle cx="17.5" cy="11" r="1.05" /></>,
    textsize: <><path d="M4 18 9 6l5 12M5.7 14h6.6" /><path d="M15.5 18l2.6-6 2.6 6M16.5 15.9h3.2" /></>,
    trash: <><path d="M3.5 6h17" /><path d="M8.5 6V4.5A1.5 1.5 0 0 1 10 3h4a1.5 1.5 0 0 1 1.5 1.5V6" /><path d="M18.5 6v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6" /><path d="M10 10.5v6M14 10.5v6" /></>,
    restart: <><path d="M3.5 4.5v5.5H9" /><path d="M4.2 14a8 8 0 1 0 1.9-8.6L3.5 8" /></>,
    cloudup: <><path d="M7 18.5a4.5 4.5 0 0 1-.6-8.95 6 6 0 0 1 11.6 1.6A3.9 3.9 0 0 1 17.5 18.5" /><path d="M12 20v-6.5M9.2 16l2.8-2.8 2.8 2.8" /></>,
    clouddown: <><path d="M7 18.5a4.5 4.5 0 0 1-.6-8.95 6 6 0 0 1 11.6 1.6A3.9 3.9 0 0 1 17.5 18.5" /><path d="M12 13v6.5M9.2 17l2.8 2.8 2.8-2.8" /></>,
    mail: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4.5 8 7.5 5 7.5-5" /></>,
    help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.7 9.2a2.3 2.3 0 0 1 4.47.75c0 1.55-2.17 2.1-2.17 3.05" /><path d="M12 16.4h.01" /></>,
    info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.6h.01" /></>,
    finger: <><path d="M5 9.2A7.6 7.6 0 0 1 12 4.6a7.6 7.6 0 0 1 7 4.6" /><path d="M7.4 12.2a4.7 4.7 0 0 1 9.4 0v1.9a11.4 11.4 0 0 1-.95 4.7" /><path d="M9.8 12.2a2.35 2.35 0 0 1 4.7 0v1.9c0 2.1-.3 3.8-.85 5.3" /><path d="M12 12.7v1.4c0 2.4-.4 4.4-1.15 6.05" /></>,
    dots9: <><circle cx="6" cy="6" r="1.15" /><circle cx="12" cy="6" r="1.15" /><circle cx="18" cy="6" r="1.15" /><circle cx="6" cy="12" r="1.15" /><circle cx="12" cy="12" r="1.15" /><circle cx="18" cy="12" r="1.15" /><circle cx="6" cy="18" r="1.15" /><circle cx="12" cy="18" r="1.15" /><circle cx="18" cy="18" r="1.15" /></>,
    upload: <><path d="M12 14V4M8 7.5l4-4 4 4" /><path d="M5 19.5h14" /></>,
    /* the Documents kit: one silhouette per document type (7 Aug) */
    at: <><circle cx="12" cy="12" r="3.4" /><path d="M15.4 12v1.3a2.3 2.3 0 0 0 4.6 0V12a8 8 0 1 0-3.1 6.3" /></>,
    clipboard: <><rect x="5" y="4.5" width="14" height="16" rx="2.5" /><rect x="9" y="3" width="6" height="3.5" rx="1.2" /><path d="M9 11.5h6M9 15h6" /></>,
    chart: <><path d="M4 20h16" /><path d="M7 20v-6M12 20V7M17 20v-9" /></>,
    /* the graph toggle wears this one: three real bars, no axis (founder, 11 Aug) */
    bars: <><rect x="3.6" y="12.4" width="4.8" height="7.6" rx="1.6" /><rect x="9.6" y="7.4" width="4.8" height="12.6" rx="1.6" /><rect x="15.6" y="3.8" width="4.8" height="16.2" rx="1.6" /></>,
    /* the rewind clock: back to today (founder, 14 Aug) */
    rewind: <><path d="M3.8 12a8.2 8.2 0 1 0 2.4-5.8L3.8 8.4" /><path d="M3.8 3.6v4.8h4.8" /><path d="M12 8.2v4.3l2.7 1.9" /></>,
    folder: <><path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></>,
    person: <><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" /></>,
    music: <><path d="M9 18V6l8-2v12" /><circle cx="7" cy="18" r="2.2" /><circle cx="15" cy="16" r="2.2" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
}
Object.assign(window, { Icon });
