self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("antam-cache-v2").then(cache => {
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

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 👉 JANGAN cache / intercept API JSONBin atau API luar
  if (url.origin.includes("jsonbin.io")) {
    return event.respondWith(fetch(event.request));
  }

  // Default: cache-first untuk file lokal
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
