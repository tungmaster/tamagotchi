
const CACHE_NAME = "pixelgotchi-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Prefer cache-first for app shell
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).then((resp) => {
      // Optionally put fetched assets back into cache (runtime caching)
      if(e.request.method === "GET" && resp.status === 200 && resp.type === "basic"){
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
      }
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
