/**
 * Kill switch — temporarily disabling the service worker while the app is
 * under active development. The previous caching strategy (cache-first for
 * page navigations) was locking devices onto stale HTML/JS snapshots that
 * never refreshed, causing inconsistent behavior (logo showing/not showing
 * between header and footer on reload) and, on Android specifically, a
 * fully frozen non-interactive UI from a stale JS bundle mismatched with
 * the current page.
 *
 * This version unregisters itself and clears every cache the moment any
 * device loads it, so every client falls back to normal, uncached network
 * requests. Once the app is stable and ready for real offline support,
 * replace this with a properly-tested network-first service worker.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});