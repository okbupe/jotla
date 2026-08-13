/* Jotla service worker: the app must work at a school gate with no signal.
   Strategy:
   - App shell and code (HTML, JSX, CSS, manifest): NETWORK-FIRST with cache
     fallback, so every deploy reaches devices on their next online load without
     waiting for a service-worker version bump. Offline still serves the cache.
   - Heavy static assets (vendor runtime, fonts, icons): CACHE-FIRST, they are
     versioned by path or never change.
   Bump VERSION when the precache list changes, OR when any cache-first asset is
   replaced under a name it already had: activate() drops every cache except
   VERSION, and that is the ONLY thing that can evict a cache-first entry. A ?v=
   query cannot, because the fetch handler matches with ignoreSearch: true. The
   illo deck now hashes its filenames so it never needs this; anything else that
   reuses a filename does: 2.0.15 replaced every moods/corgi/*.png with a cleaner
   cut under the same five names, which is exactly the case this rule exists for. Bumped to 1.13.0 on 16 Jul to evict the 3:2 illustration
   set that v1.12.0 had cached under the square set's names. */
const VERSION = 'jotla-v2.0.18';
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
  'min/ios-frame.js',
  'min/jotla-data.js',
  'min/jotla-icons.js',
  'min/jotla-illustrations.js',
  'min/jotla-ui.js',
  'min/jotla-parent-a.js',
  'min/jotla-month.js',
  'min/jotla-parent-b.js',
  'min/jotla-child.js',
  'min/jotla-onboard.js',
  'min/jotla-app.js'
];
const CACHE_FIRST = /\/vendor\/|\.(ttf|otf|woff2?|png|svg|ico|webp)$/;
/* The illo/*.webp deck is cache-first but deliberately NOT precached: cache.addAll
   is atomic, so one bad filename would fail the whole install and take offline
   support down with it. The tour is seen online at onboarding and cached from
   there. Revisit at ship time: the Tips deck is a school-gate crisis tool and
   has the strongest claim to being precached (all 14 images total ~166 KB). */

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
