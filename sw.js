/* ΜΟΥΣΙΚΗ ΣΧΟΛΗ 360° — Service Worker (offline cache).
   Ενεργό μόνο όταν η εφαρμογή σερβίρεται μέσω http(s). Ως τοπικό αρχείο (file://)
   η εφαρμογή ήδη λειτουργεί offline και ο SW δεν χρειάζεται. */
const CACHE = "mousiki360-v4";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Μην προσπαθείς να cache-άρεις εξωτερικά (π.χ. YouTube) — άσε τα να πάνε στο δίκτυο.
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
