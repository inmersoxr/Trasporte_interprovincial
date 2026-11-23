import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';import {verifiedActor} from './verified-actor.mjs';import {seedReviewedOperator} from './onboarding-fixture.mjs';
test('GPS real protocol: authorization, history retries, late samples, public expiry/revocation and completion',async()=>{
 const r=await runtime({developmentAuth:false});try{
 const owner=await verifiedActor(r,'gps-owner'),buyer=await verifiedActor(r,'gps-buyer'),outsider=await verifiedActor(r,'gps-outsider');
 const op=(await owner.call('/operators',{name:'GPS prueba'})).data.id;
 const vehicle=(await owner.call('/vehicles',{operatorId:op,type:'van',model:'GPS prueba',capacity:4})).data.id;await seedReviewedOperator(r.db,op,vehicle);
 const route=(await owner.call('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Punto Cuenca',dropoffPoint:'Punto Guayaquil'})).data.id;
 const departure=(await owner.call('/departures',{operatorId:op,offerId:route,departAt:new Date(Date.now()+600000).toISOString()})).data.id;
 await buyer.call('/bookings',{departureId:departure,seatNumbers:[1],passengers:['Persona prueba'],contactPhone:'+593981112233',quotedPriceCents:1500});
 const id=(await owner.call('/operations',{operatorId:op,kind:'departure',id:departure,action:'start'})).data.liveId;
 const url='/gps/'+id,point={id:crypto.randomUUID(),lat:-2.9,lng:-79.01,accuracy:8,speed:10,heading:90,capturedAt:Date.now()};
 assert.equal((await owner.call(url)).data.position,null);assert.equal((await outsider.call(url)).status,404);
 const foreignId=(await r.db.prepare("SELECT user_id FROM auth_identities WHERE provider='google' AND subject=?").bind('gps-outsider').first())?.user_id;
 assert.ok(foreignId);{await r.db.prepare("INSERT INTO memberships(user_id,operator_id,role) VALUES(?,?,'driver')").bind(foreignId,op).run();assert.equal((await outsider.call(url+'/positions',{positions:[point]})).status,404);}
 assert.equal((await buyer.call(url+'/positions',{positions:[point]})).status,403);
 assert.equal((await owner.call(url+'/positions',{positions:[point]})).status,200);
 assert.equal((await owner.call(url+'/positions',{positions:[point]})).status,200);
 assert.equal((await r.db.prepare('SELECT COUNT(*) n FROM standard_gps_positions').first()).n,1);
 const late={...point,id:crypto.randomUUID(),capturedAt:point.capturedAt-30000,lat:-2.91};await owner.call(url+'/positions',{positions:[late]});assert.equal((await buyer.call(url)).data.position.lat,point.lat);
 assert.equal((await owner.call(url+'/positions',{positions:[{...point,id:crypto.randomUUID(),lat:999}]})).status,400);
 assert.equal((await owner.call(url+'/positions',{positions:[{...point,id:crypto.randomUUID(),capturedAt:Date.now()+120000}]})).status,400);
 const shared=(await buyer.call(url+'/share',{})).data;assert.ok(shared.token);const publicRead=()=>r.call('/gps/public/'+shared.token);
 const pub=await publicRead();assert.equal(pub.status,200);assert.equal(pub.data.position.lat,point.lat);assert.equal(pub.data.canSend,false);assert.equal(JSON.stringify(pub.data).includes('Persona prueba'),false);
 assert.equal((await r.db.prepare('SELECT token_hash FROM standard_gps_shares LIMIT 1').first()).token_hash.includes(shared.token),false);
 await buyer.call(url+'/share',{action:'revoke'});assert.equal((await publicRead()).status,404);
 const expire=(await buyer.call(url+'/share',{})).data;await r.db.prepare('UPDATE standard_gps_shares SET expires_at=0').run();assert.equal((await r.call('/gps/public/'+expire.token)).status,404);
 const final=(await owner.call(url+'/share',{})).data;
 assert.equal((await owner.call(url+'/history')).data.positions.length,2);assert.equal((await buyer.call(url+'/history')).status,403);
 await owner.call('/operations',{operatorId:op,kind:'departure',id:departure,action:'finish'});
 assert.equal((await r.call('/gps/public/'+final.token)).status,404);assert.equal((await owner.call(url+'/positions',{positions:[{...point,id:crypto.randomUUID()}]})).status,409);
 }finally{await r.mf.dispose();}
});
