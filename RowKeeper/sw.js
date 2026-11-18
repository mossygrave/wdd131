const CACHE_NAME = "rowkeeper-shell-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./images/favicon.png",
  "./images/apple-touch-icon.png",
  "./images/rowkeeper-icon.png",
  "./images/pwa-192.png",
  "./images/pwa-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith("rowkeeper-shell-") && name !== CACHE_NAME).map(name => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match(new URL("./index.html", self.registration.scope)));
      }
    })());
    return;
  }

  const appUrls = APP_FILES.map(path => new URL(path, self.registration.scope).href);
  if (appUrls.includes(request.url)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const refresh = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
      return cached || refresh;
    })());
  }
});
