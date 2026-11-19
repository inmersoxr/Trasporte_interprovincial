const CACHE='rutasec-miniapp-dev-__BUILD_REVISION__';
const CORE=["./", "./index.html", "./app.mjs", "./profile.css", "../account/session.mjs", "../assets/icon-192.png", "../assets/icon-512.png"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('rutasec-miniapp-dev-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
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
