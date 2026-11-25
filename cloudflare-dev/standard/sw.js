const CACHE='rutasec-standard-dev-__BUILD_REVISION__';
const CORE=['../company/access.mjs',"../company/theme.mjs",'./','./index.html','./standard.css','./app.mjs','./navigation.mjs','./notifications.mjs','./custom-settings.mjs','./changes.mjs','./ticket-changes.mjs','./public-profile.mjs','./search.mjs','./home-template.mjs','./transport.mjs','./seat-map.mjs','./vehicle-picker.mjs','./vehicle-picker.css','../assets/vehicle-types.webp','./payment-demo.mjs','./cities.mjs','./onboarding.mjs','./onboarding-policy.mjs','./reservations.mjs','./market.mjs','./operations.mjs','./scanner.mjs','./vendor/jsQR.js','./recurring.mjs','./tracking.mjs','./gps.mjs','./gps-queue.mjs','./manifest.webmanifest','./vendor/qrcode.min.js','../account/session.mjs','../styles.css?v=12','../bookings.css?v=39','../vendor/leaflet/leaflet.js','../vendor/leaflet/leaflet.css','../shared/trip-core.mjs','../shared/route.json','../assets/rutasec-logo.png','../assets/icon-192.png','../assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('rutasec-standard-dev-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||/^\/(api|standard-api)(?:\/|$)/.test(url.pathname))return;
 const staticPaths=CORE.map(path=>new URL(path,self.location.href).pathname);
 const navigation=event.request.mode==='navigate'&&url.pathname.startsWith(new URL('./',self.location.href).pathname);
 if(!navigation&&!staticPaths.includes(url.pathname))return;
 event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;
 }).catch(async()=>await caches.match(event.request)||(navigation?await caches.match('./index.html'):Response.error())));
});

self.addEventListener('push',event=>event.waitUntil((async()=>{
 try{const r=await fetch('/standard-api/api/notifications',{credentials:'include',cache:'no-store'});if(!r.ok){await self.registration.showNotification('RutasEC',{body:'Abre la aplicación para consultar tus avisos.',icon:'/assets/icon-192.png',tag:'rutasec-access',data:{target:'/account/'}});return;}const data=await r.json(),n=data.items.find(x=>!x.read_at);if(!n){await self.registration.showNotification('RutasEC',{body:'Tus avisos están disponibles en la aplicación.',icon:'/assets/icon-192.png',tag:'rutasec-inbox',data:{target:'/standard/'}});return;}await self.registration.showNotification(n.title,{body:n.body,icon:'/assets/icon-192.png',badge:'/assets/icon-192.png',tag:n.id,data:{target:n.target,id:n.id}});}catch{}
})()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const target=new URL(event.notification.data?.target||'/standard/',self.location.origin);if(target.origin!==self.location.origin)return;try{await fetch('/standard-api/api/notifications/read',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:event.notification.data?.id})});}catch{}const tabs=await self.clients.matchAll({type:'window',includeUncontrolled:true});const tab=tabs.find(t=>new URL(t.url).origin===target.origin);if(tab){await tab.navigate(target.href);await tab.focus();}else await self.clients.openWindow(target.href);})());});
