import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base='https://rutasec-web-dev.drbrownlabs.workers.dev',browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const proxy=process.env.https_proxy||process.env.HTTPS_PROXY;
const options={...(proxy?{proxy:{server:proxy}}:{}),permissions:['clipboard-read','clipboard-write'],timezoneId:'America/Guayaquil'};
try{
 for(const width of [360,390,1280]){
  const context=await browser.newContext({...options,viewport:{width,height:width===1280?900:844}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(base+'/standard/')).status(),200);
  await page.getByRole('button',{name:'Privado personalizado',exact:true}).waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.getElementById('openPrivateMarket').disabled);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const manifest=await (await context.request.get(base+'/standard/manifest.webmanifest')).json();assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
  await page.locator('#createSession').click();await page.getByText('Acceso privado de desarrollo creado',{exact:true}).waitFor();
  await page.locator('#copyStandardAccess').click();
  const key=await page.evaluate(()=>navigator.clipboard.readText());
  assert.ok(await page.evaluate(key=>localStorage.getItem('rutasec-standard-session')===key,key),'Copied access matches private session');
  const restore=await browser.newContext({...options,viewport:{width,height:844}}),restored=await restore.newPage();
  await restored.goto(base+'/standard/');await restored.locator('summary').click();
  await restored.locator('#restoreSession input').fill('0'.repeat(64));await restored.locator('#restoreSession button').click();
  await restored.getByText('Acceso no válido',{exact:true}).waitFor();
  assert.equal(await restored.evaluate(()=>localStorage.getItem('rutasec-standard-session')),null);
  await restored.locator('#restoreSession input').fill(key);await restored.locator('#restoreSession button').click();await restored.getByText('Acceso recuperado',{exact:true}).waitFor();
  assert.ok(await restored.evaluate(key=>localStorage.getItem('rutasec-standard-session')===key,key),'Restored identity matches');
  const invalid=await context.request.post(base+'/standard-api/api/private-requests',{headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},data:'not-json'});assert.equal(invalid.status(),400);
  const denied=await context.request.get(base+'/standard-api/api/operator');assert.equal(denied.status(),401);
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller);
  const scope=await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL);assert.ok(scope.endsWith('/standard/sw.js'));
  await page.evaluate(()=>fetch('/standard-api/api/catalog'));
  const cachedAPIs=await page.evaluate(async()=>{
   const found=[];for(const name of await caches.keys())for(const req of await (await caches.open(name)).keys())if(/^\/(api|standard-api)(?:\/|$)/.test(new URL(req.url).pathname))found.push(req.url);return found;
  });assert.deepEqual(cachedAPIs,[]);
  await mkdir(new URL('../qa-output/',import.meta.url),{recursive:true});
  await page.screenshot({path:new URL(`../qa-output/standard-${width}.png`,import.meta.url).pathname});
  await context.setOffline(true);await page.reload();
  await page.getByText('RutasEC Standard',{exact:true}).waitFor();
  await page.locator('#openBookings').click();await page.getByText(/Sin conexión con el servicio/).waitFor();
  await context.setOffline(false);await page.locator('[data-view="catalog"]').click();
  if(width===390){
   await page.goto(base+'/');await page.waitForFunction(()=>window.BookingApp);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
   await page.waitForFunction(()=>navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'));
   const names=await page.evaluate(()=>caches.keys());
   assert.ok(names.some(n=>n.startsWith('rutasec-standard-dev-')));assert.ok(names.some(n=>n.startsWith('rutasec-cloudflare-dev-')));
  }
  assert.deepEqual(errors,[]);
  await restore.close();await context.close();
  console.log(`J8 ${width}px: layout, private access restore, malformed JSON/401, own PWA/offline, APIs not cached and parity cache isolation: PASS`);
 }
}finally{await browser.close();}
