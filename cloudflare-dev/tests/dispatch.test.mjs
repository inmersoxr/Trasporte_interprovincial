import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';import {verifiedActor} from './verified-actor.mjs';import {seedReviewedOperator} from './onboarding-fixture.mjs';import {pushEndpoint,vapidHeaders,dispatchPush} from '../standard-notifications.mjs';
test('Spontaneous market opts in without published routes, alerts eligible operators, accepts any quote and revalidates pause',async()=>{const f=await runtime({developmentAuth:false});try{
 const buyer=await verifiedActor(f,'spontaneous-buyer'),a=await verifiedActor(f,'spontaneous-a'),b=await verifiedActor(f,'spontaneous-b'),other=await verifiedActor(f,'spontaneous-other');
 async function operator(actor){const op=(await actor.call('/operators',{name:'Operadora local'})).data.id,v=(await actor.call('/vehicles',{operatorId:op,type:'van',model:'Van local',capacity:8})).data.id;await seedReviewedOperator(f.db,op,v);return{op,v};}
 const av=await operator(a),bv=await operator(b),ov=await operator(other);
 const maintenance=crypto.randomUUID(),busyAt=Date.now()+5*3600000;await f.db.prepare('INSERT INTO premium_maintenance(id,operator_id,vehicle_id,summary,starts_at,ends_at) VALUES(?,?,?,?,?,?)').bind(maintenance,av.op,av.v,'Mantenimiento posterior',busyAt,busyAt+3600000).run();await f.db.prepare('INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,maintenance_id) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),av.v,busyAt,busyAt+3600000,maintenance).run();
 const request=await buyer.call('/private-requests',{origin:'Cuenca',destination:'Manta',immediate:true,people:2,vehicleType:'van',durationMinutes:240,passengers:['Ana','Luis'],contactPhone:'+593987654321',pickupPoint:'Centro',dropoffPoint:'Playa'});assert.equal(request.status,200);
 const quote=(actor,v,price)=>actor.call('/private-offers',{operatorId:v.op,vehicleId:v.v,privateRequestId:request.data.id,priceCents:price,durationMinutes:240,pickupMinutes:20});
 assert.equal((await quote(a,av,12000)).status,403);
 for(const [actor,v] of [[a,av],[b,bv]])assert.equal((await actor.call('/custom-settings',{operatorId:v.op,enabled:true,available:true,origins:['Cuenca'],vehicleIds:[v.v],expectedRevision:0})).status,200);
 // The subsequent request is fanned out transactionally, once per member.
 const next=await buyer.call('/private-requests',{origin:'Cuenca',destination:'Manta',immediate:true,people:2,vehicleType:'van',durationMinutes:240,passengers:['Ana','Luis'],contactPhone:'+593987654321',pickupPoint:'Centro',dropoffPoint:'Playa'});assert.equal(next.status,200);
 assert.equal((await a.call('/notifications')).data.unread,1);assert.equal((await b.call('/notifications')).data.unread,1);assert.equal((await other.call('/notifications')).data.unread,0);
 assert.ok((await a.call('/private-market')).data.requests.some(r=>r.id===next.data.id));
 const qa=await quote(a,av,12000),qb=await quote(b,bv,13000);assert.equal(qa.status,200);assert.equal(qb.status,200);
 const offers=(await buyer.call('/private-requests')).data.requests.find(r=>r.id===request.data.id).offers;assert.equal(offers.length,2);assert.ok(offers.every(o=>Date.parse(o.pickup_at)>Date.now()));
 await b.call('/custom-settings',{operatorId:bv.op,enabled:true,available:false,origins:['Cuenca'],vehicleIds:[bv.v],expectedRevision:1});
 assert.equal((await buyer.call('/private-requests/'+request.data.id+'/select',{offerId:qb.data.id,quotedPriceCents:13000})).status,409);
 await b.call('/custom-settings',{operatorId:bv.op,enabled:true,available:true,origins:['Cuenca'],vehicleIds:[bv.v],expectedRevision:2});
 const chosen=await buyer.call('/private-requests/'+request.data.id+'/select',{offerId:qb.data.id,quotedPriceCents:13000});assert.equal(chosen.status,200);const booking=await f.db.prepare('SELECT * FROM standard_custom_bookings WHERE id=?').bind(chosen.data.bookingId).first();assert.equal(booking.operator_id,bv.op);assert.equal(booking.service_at,offers.find(o=>o.id===qb.data.id).pickup_at);
 assert.equal((await buyer.call('/notifications')).data.unread,3);
 assert.equal((await other.call('/custom-settings?operatorId='+av.op)).status,403);
 }finally{await f.mf.dispose();}});
test('Native push validates destinations and signs audience-bound ES256 VAPID without private data',async()=>{
 assert.equal(pushEndpoint('https://localhost/push'),null);assert.equal(pushEndpoint('https://fcm.googleapis.com.evil.test/push'),null);assert.equal(pushEndpoint('http://fcm.googleapis.com/push'),null);
 const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await crypto.subtle.exportKey('jwk',keys.privateKey),publicKey=Buffer.from(await crypto.subtle.exportKey('raw',keys.publicKey)).toString('base64url'),env={VAPID_PUBLIC_KEY:publicKey,VAPID_PRIVATE_KEY:jwk.d};
 const headers=await vapidHeaders('https://fcm.googleapis.com/test',env),token=headers.Authorization.slice(8).split(',')[0],parts=token.split('.');assert.equal(JSON.parse(Buffer.from(parts[1],'base64url')).aud,'https://fcm.googleapis.com');assert.ok(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},keys.publicKey,Buffer.from(parts[2],'base64url'),Buffer.from(parts[0]+'.'+parts[1])));
 assert.deepEqual(await dispatchPush({}),{configured:false});
});
test('Notification subscriptions are private; concurrent dispatch leases once, transient failures retry and expired endpoints are removed',async()=>{
 const {notifications}=await import('../standard-notifications.mjs'),{identity,stmt,rows,failure}=await import('../standard-api.mjs'),f=await runtime();try{
 const actor=(await f.call('/sessions',{})).data,key=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']),jwk=await crypto.subtle.exportKey('jwk',key.privateKey),env={DB:f.db,VAPID_PUBLIC_KEY:Buffer.from(await crypto.subtle.exportKey('raw',key.publicKey)).toString('base64url'),VAPID_PRIVATE_KEY:jwk.d};
 const endpoint='https://fcm.googleapis.com/test-private-endpoint';await notifications(new Request('https://dev.example/api/notifications/subscribe',{method:'POST',headers:{Authorization:'Bearer '+actor.token},body:JSON.stringify({endpoint})}),env,{identity:r=>identity(r,f.db),stmt,rows,failure});
 const insert=async id=>f.db.prepare("INSERT INTO standard_notifications(id,user_id,kind,title,body,target) VALUES(?,?,'booking','Reserva de prueba','Solo para tu cuenta','/standard/')").bind(id,actor.userId).run();await insert('push-test-one');let sent=0;
 const transport=async(url,options)=>{sent++;assert.equal(url,endpoint);assert.equal(options.body,undefined);assert.match(options.headers.Authorization,/^vapid t=/);return new Response(null,{status:201});};
 await Promise.all([dispatchPush(env,transport),dispatchPush(env,transport)]);assert.equal(sent,1);assert.ok((await f.db.prepare("SELECT push_sent_at FROM standard_notifications WHERE id='push-test-one'").first()).push_sent_at);
 await insert('push-test-two');await dispatchPush(env,async()=>new Response(null,{status:503}));assert.equal((await f.db.prepare("SELECT attempts FROM standard_notifications WHERE id='push-test-two'").first()).attempts,1);await f.db.prepare("UPDATE standard_notifications SET next_attempt=0 WHERE id='push-test-two'").run();await dispatchPush(env,async()=>new Response(null,{status:410}));assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM standard_push_subscriptions').first()).n,0);
 }finally{await f.mf.dispose();}
});
