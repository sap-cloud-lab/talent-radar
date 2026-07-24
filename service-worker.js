const CACHE_NAME = "talent-radar-pwa-20260724n";
const APP_SHELL = [
  "./dashboard.html",
  "./manifest.webmanifest",
  "./styles/dashboard.css?v=20260724n",
  "./scripts/shared.js?v=20260724n",
  "./scripts/live-jobs.js?v=20260724n",
  "./scripts/data.js?v=20260724n",
  "./scripts/pwa.js?v=20260724n",
  "./scripts/dashboard.js?v=20260724n",
  "./public/talent-radar-icon.svg",
  "./public/talent-radar-icon-180.png",
  "./public/talent-radar-icon-192.png",
  "./public/talent-radar-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const requestUrl = new URL(event.request.url);
          if (response.ok && requestUrl.pathname.endsWith("/dashboard.html")) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./dashboard.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("./dashboard.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === "opaque") return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
    )
  );
});
