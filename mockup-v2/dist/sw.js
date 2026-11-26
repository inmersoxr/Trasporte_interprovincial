const CACHE = "rutasec-mockup-v2-5";
const CORE = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "world.js",
  "seed.js",
  "catalog.js",
  "banos.js",
  "national.js",
  "ui.js",
  "journey.js",
  "marketplace.js",
  "business.js",
  "operations.js",
  "promotion.js",
  "territory.js",
  "discover.js",
  "investor.js",
  "planner.js",
  "circuit-catalog.js",
  "manifest.webmanifest",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "vendor/qrcode.min.js",
  "vendor/xlsx.full.min.js",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/banos.webp",
  "assets/hotel.webp",
  "assets/restaurant.webp",
  "assets/road-cinematic.webp",
  "shared/trip-core.mjs",
  "shared/route.json",
  "shared/quito-banos.json",
];
self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("rutasec-mockup-v2-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then(
            (hit) =>
              hit ||
              new Response("Recurso no disponible sin conexión", {
                status: 503,
              }),
          ),
      ),
  );
});
