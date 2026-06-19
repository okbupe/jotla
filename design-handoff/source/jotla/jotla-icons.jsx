// jotla-icons.jsx — calm line icons. One stroke weight, round caps. 24x24 grid.
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
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18 6l-1.8 1.8M7.8 16.2 6 18M18 18l-1.8-1.8M7.8 7.8 6 6" /></>,
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
  };
  return <svg {...common}>{paths[name] || null}</svg>;
}
Object.assign(window, { Icon });
