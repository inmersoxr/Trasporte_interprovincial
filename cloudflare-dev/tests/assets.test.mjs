import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('out/public/sw.js', root), 'utf8');
const handlers = {};
const removed=[];
vm.runInNewContext(sw, { self: { addEventListener: (name, fn) => { handlers[name] = fn; },clients:{claim:async()=>{}} },
  caches:{keys:async()=>['rutasec-cloudflare-dev-old','rutasec-standard-dev-keep'],delete:async key=>removed.push(key)},URL });
test('same-origin APIs bypass offline cache and HTML fallback', () => {
  for (const path of ['/api/catalog', '/standard-api/health', '/about/', '/privacy/', '/terms/']) {
    let intercepted = false;
    handlers.fetch({ request: { method: 'GET', url: 'https://dev.example' + path },
      respondWith() { intercepted = true; } });
    assert.equal(intercepted, false);
  }
});
test('parity SW activation preserves the independent Standard PWA cache', async()=>{
 let pending;handlers.activate({waitUntil(p){pending=p;}});await pending;
 assert.deepEqual(removed,['rutasec-cloudflare-dev-old']);
});
test('Standard SW bypasses APIs and its precache includes real public files',()=>{
 const source=readFileSync(new URL('out/public/standard/sw.js',root),'utf8'),events={};
 vm.runInNewContext(source,{self:{addEventListener:(name,fn)=>events[name]=fn,location:{origin:'https://dev.example',href:'https://dev.example/standard/sw.js'}},URL});
 for(const path of ['/standard-api/api/bookings','/api/catalog']){
  let handled=false;events.fetch({request:{url:'https://dev.example'+path,method:'GET'},respondWith(){handled=true;}});assert.equal(handled,false);
 }
 const core=JSON.parse(source.match(/const CORE=(\[[^;]+\]);/)[1].replaceAll("'",'"'));
 for(const path of core)assert.ok(existsSync(new URL('out/public/standard/'+path.split('?')[0],root)),path);
 assert.ok(!source.includes('__BUILD_REVISION__'));
});
test('all service worker precache files exist; copied config cannot target original demo', () => {
  const core = JSON.parse(sw.match(/const CORE = (\[[^;]+\]);/)[1].replaceAll("'", '"'));
  for (const path of core) assert.ok(existsSync(new URL('out/public/' + path.split('?')[0], root)), path);
  const config = readFileSync(new URL('out/public/shared/live-config.mjs', root), 'utf8');
  assert.ok(config.includes('location.origin'));
  assert.ok(!config.includes('chatgpt.site'));
});
test('Premium and miniapp offline shells cache only assets and bypass all private API/auth requests',()=>{
 for(const app of ['premium','miniapp']){const source=readFileSync(new URL('out/public/'+app+'/sw.js',root),'utf8'),events={};vm.runInNewContext(source,{self:{addEventListener:(name,fn)=>events[name]=fn,location:{origin:'https://dev.example',href:'https://dev.example/'+app+'/sw.js'}},URL});
 for(const path of ['/standard-api/api/premium/finance','/standard-api/auth/session','/standard-api/auth/google/callback','/api/catalog']){let handled=false;events.fetch({request:{url:'https://dev.example'+path,method:'GET'},respondWith(){handled=true;}});assert.equal(handled,false);}
 const core=JSON.parse(source.match(/const CORE=(\[[^;]+\]);/)[1]);for(const path of core)assert.ok(existsSync(new URL('out/public/'+app+'/'+path,root)),path);assert.ok(!source.includes('__BUILD_REVISION__'));
 }
});
