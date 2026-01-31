self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("antam-cache-v1").then(cache => {
      return cache.addAll([
        "/",
        "/homeupdatetest.html",
        "/homeupdatetest.css",
        "/homeupdatetest.js",
        "/checkoutupdate.html",
        "/checkoutupdate.js",
        "/akun.html",
        "/icon-512.png",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});


