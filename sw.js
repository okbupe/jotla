/* THE SMALLEST SERVICE WORKER THAT MAKES JOTLA INSTALLABLE, AND NOTHING MORE.
 *
 * Bupe, 2 September 2026: "I can't install this live page to my phone like I
 * did before so it's an app on my phone."
 *
 * Android Chrome will only offer a real installed app (a WebAPK, with its own
 * icon and no browser chrome) for a page that has a manifest AND a service
 * worker with a fetch handler. The old hand-built prototype had one, which is
 * why it installed and the Expo export did not.
 *
 * IT DELIBERATELY CACHES NOTHING. The handler below does not call
 * respondWith, so every request is handled by the browser exactly as if this
 * file did not exist. That is the whole design:
 *
 *  - Jotla's offline story is already the database. The record lives in the
 *    page's own SQLite (src/db/database.web.ts), not in a network cache.
 *  - A caching worker on a site that is republished as often as this one is a
 *    machine for serving a parent yesterday's app. Stale JS against a migrated
 *    database is a far worse failure than needing a connection to open.
 *
 * So this buys the install and takes on no staleness risk. If offline loading
 * is ever wanted, it is a deliberate piece of work with a versioned cache and
 * a story for schema changes, not a line added here.
 */

self.addEventListener('install', () => {
  // Take over immediately rather than waiting for every old tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intentionally empty. Not calling respondWith hands the request straight
  // back to the browser. See the header: this exists to be counted, not to
  // intercept.
});
