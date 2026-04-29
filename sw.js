const CACHE = 'extasis-v5'; /* ← cambiado fuerza actualización en todos los celulares */

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(['./','./index.html']); })
      .then(function() { return self.skipWaiting(); }) /* activa inmediato */
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); }) /* borra caché viejo */
      );
    }).then(function() { return self.clients.claim(); }) /* toma control inmediato */
  );
});

self.addEventListener('fetch', function(e) {
  /* Network first: intenta red, si falla usa caché */
  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        /* Actualizar caché con la versión nueva */
        var clone = resp.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return resp;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
