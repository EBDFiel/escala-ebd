const CACHE_NAME = "escala-ebd-v1";

const ARQUIVOS_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logoebd.png",
  "./Logo%20Horizontal%20Branca@300x.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (nomesCaches) {
      return Promise.all(
        nomesCaches.map(function (nomeCache) {
          if (nomeCache !== CACHE_NAME) {
            return caches.delete(nomeCache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
