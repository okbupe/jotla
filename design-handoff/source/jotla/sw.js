/* Jotla service worker: the app must work at a school gate with no signal.
   Cache-first for everything precached; runtime-cache anything else same-origin.
   Bump VERSION on every release so waiting clients pick up the new shell. */
const VERSION = 'jotla-v1.2.0';
const PRECACHE = [
  './',
  'index.html',
  'jotla.css',
  'jotla.webmanifest',
  'jotla-icon-180.png',
  'jotla-icon-192.png',
  'jotla-icon-512.png',
  '../styles.css',
  '../colors_and_type.css',
  '../fonts/CalSans-Regular.ttf',
  '../fonts/Outfit-VariableFont_wght.ttf',
  'vendor/react.production.min.js',
  'vendor/react-dom.production.min.js',
  'vendor/babel.min.js',
  'ios-frame.jsx',
  'jotla-data.jsx',
  'jotla-icons.jsx',
  'jotla-illustrations.jsx',
  'jotla-ui.jsx',
  'jotla-parent-a.jsx',
  'jotla-month.jsx',
  'jotla-parent-b.jsx',
  'jotla-child.jsx',
  'jotla-onboard.jsx',
  'jotla-app.jsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        // Runtime-cache successful same-origin responses so a first online visit
        // leaves everything recoverable offline.
        if (res && res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Offline and not cached: for page navigations fall back to the app shell.
        if (req.mode === 'navigate') return caches.match('./');
        return Response.error();
      });
    })
  );
});
