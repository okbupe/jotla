/* Jotla service worker: the app must work at a school gate with no signal.
   Strategy:
   - App shell and code (HTML, JSX, CSS, manifest): NETWORK-FIRST with cache
     fallback, so every deploy reaches devices on their next online load without
     waiting for a service-worker version bump. Offline still serves the cache.
   - Heavy static assets (vendor runtime, fonts, icons): CACHE-FIRST, they are
     versioned by path or never change.
   Bump VERSION when the precache list changes. */
const VERSION = 'jotla-v1.6.6';
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
const CACHE_FIRST = /\/vendor\/|\.(ttf|otf|woff2?|png|svg|ico)$/;

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
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  const putCopy = (res) => {
    if (res && res.ok && sameOrigin) {
      const copy = res.clone();
      caches.open(VERSION).then((cache) => cache.put(req, copy));
    }
    return res;
  };

  if (sameOrigin && CACHE_FIRST.test(url.pathname)) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then(putCopy))
    );
    return;
  }

  event.respondWith(
    fetch(req).then(putCopy).catch(() =>
      caches.match(req, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./');
        return Response.error();
      })
    )
  );
});
