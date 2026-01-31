// === SERVICE WORKER FINAL - ANTAM PWA ===
const CACHE_NAME = "antam-cache-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./homeupdatetest.html",
  "./homeupdatetest.css",
  "./homeupdatetest.js",
  "./checkoutupdate.html",
  "./checkoutupdate.js",
  "./akun.html",
  "./akun.js",
  "./icon-512.png",
  "./manifest.json"
];

// Install: cache semua file penting
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // langsung aktif
});

// Activate: hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // langsung kontrol semua tab
});

// Fetch: cache-first untuk file lokal, network-only untuk API
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Jangan cache API eksternal (JSONBin, dll)
  if (url.origin.includes("jsonbin.io")) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
