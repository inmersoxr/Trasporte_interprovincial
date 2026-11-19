import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';
import worker from '../worker.mjs';
import router from '../frontend-router.mjs';
import {seedReviewedOperator} from './onboarding-fixture.mjs';

test('Alpha catalog quarantines QA without deleting it; filters use Ecuador dates and remaining seats',async()=>{
 const {mf,db,call}=await runtime();
 try{
  const token=(await call('/sessions',{})).data.token;
  const create=(path,body)=>call(path,{...body,requestId:crypto.randomUUID()},token);
  const op=(await create('/operators',{name:'QA conservado'})).data.id;
  const vehicle=(await create('/vehicles',{operatorId:op,type:'van',model:'Van de prueba',capacity:2})).data.id;
  const route=(await create('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500})).data.id;
  const date=new Date(Date.now()+3*86400000).toISOString().slice(0,10);
  const departure=(await create('/departures',{operatorId:op,offerId:route,departAt:date+'T23:59:00-05:00',durationMinutes:10})).data.id;
  async function normal(query=''){
   const response=await worker.fetch(new Request('https://dev.example/api/catalog'+query),{DB:db});
   return {status:response.status,data:await response.json()};
  }
  assert.equal((await call('/catalog')).data.departures.length,1); // Explicit isolated QA runtime.
  assert.equal((await normal()).data.departures.length,0);
  assert.equal((await normal()).data.routeOffers.length,0);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM departures').first()).n,1);
  // Promotion is explicit in this local fixture; renaming a QA operator never promotes it.
  await db.prepare("UPDATE operators SET display_name='Nombre sin etiquetas' WHERE id=?").bind(op).run();
  assert.equal((await normal()).data.departures.length,0);
  await seedReviewedOperator(db,op,vehicle);
  assert.equal((await normal('?origin=Cuenca&destination=Guayaquil&date='+date+'&passengers=2')).data.departures[0].id,departure);
  assert.equal((await normal('?origin=Quito')).data.departures.length,0);
  assert.equal((await normal('?origin='+encodeURIComponent("Cuenca' OR 1=1--"))).data.departures.length,0);
  assert.equal((await normal('?destination=Cuenca')).data.departures.length,0);
  assert.equal((await normal('?passengers=3')).data.departures.length,0);
  assert.equal((await normal('?vehicleType=auto')).data.departures.length,0);
  const next=new Date(Date.parse(date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
  assert.equal((await normal('?date='+next)).data.departures.length,0);
  assert.equal((await normal('?date=1900-01-01')).data.departures.length,0);
  assert.equal((await normal('?date=2026-02-30')).status,400);
  assert.equal((await normal('?passengers=99')).status,400);
  assert.equal((await create('/bookings',{departureId:departure,seatNumbers:[1,2],passengers:['Uno','Dos'],quotedPriceCents:1500})).status,200);
  assert.equal((await normal()).data.departures.length,0); // Sold out is absent from available results.
 }finally{await mf.dispose();}
});

test('Cloudflare entry opens Standard and keeps the copied demo under its own path',async()=>{
 const calls=[],env={ASSETS:{fetch:request=>{calls.push(new URL(request.url).pathname);return new Response('demo asset');}}};
 const root=await router.fetch(new Request('https://example.com/'),env);
 assert.equal(root.status,302);assert.equal(root.headers.get('Location'),'/standard/');
 assert.equal(root.headers.get('Cache-Control'),'no-store');
 assert.equal((await router.fetch(new Request('https://example.com/demo/'),env)).status,200);
 await router.fetch(new Request('https://example.com/demo/app.js'),env);
 assert.deepEqual(calls,['/','/app.js']);
});
