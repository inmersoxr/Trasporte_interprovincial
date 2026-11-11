const CACHE = 'rutasec-v16-demo-departures';
const CORE = ['./shared/demo-departures.mjs', './institution.css?v=15', './institution.mjs?v=15', './bookings.mjs?v=16', './bookings.css?v=12', './trip-live.css?v=9', './trip-live.mjs?v=13', './shared/trip-core.mjs', './shared/live-config.mjs', './shared/route.json', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css', './', './index.html', './styles.css?v=12', './app.js?v=12', './manifest.webmanifest', './icon.svg', './assets/guayaquil-cinematic.webp', './assets/cuenca-cinematic.webp', './assets/manta-cinematic.webp', './assets/babahoyo-cinematic.webp', './assets/quito-cinematic.webp', './assets/road-cinematic.webp', './assets/sprinter.webp', './assets/suv.webp', './assets/minivan.webp', './assets/sedan.webp', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('rutasec-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request, {cache: 'no-cache'}).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
