import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';import {verifiedActor} from './verified-actor.mjs';import {seedReviewedOperator} from './onboarding-fixture.mjs';import {hash} from '../standard-api.mjs';
test('Company staff share operations, drivers see only assigned services, commercial subscription controls Premium',async()=>{const f=await runtime({developmentAuth:false});try{
 const owner=await verifiedActor(f,'company-owner'),admin=await verifiedActor(f,'company-admin'),driver=await verifiedActor(f,'company-driver');
 const user=async actor=>(await actor.call('/me')).data.id;
 const op=(await owner.call('/operators',{name:'Empresa para prueba de roles'})).data.id;
 const v=(await owner.call('/vehicles',{operatorId:op,type:'van',model:'Van propia',capacity:2})).data.id;
 const other=(await owner.call('/vehicles',{operatorId:op,type:'van',model:'Otra van',capacity:2})).data.id;
 await seedReviewedOperator(f.db,op,v);await seedReviewedOperator(f.db,op,other);
 for(const [actor,role] of [[admin,'admin'],[driver,'driver']])await f.db.prepare('INSERT INTO memberships(user_id,operator_id,role) VALUES(?,?,?)').bind(await user(actor),op,role).run();
 const branch=crypto.randomUUID();await f.db.prepare('INSERT INTO premium_branches(id,operator_id,name,city) VALUES(?,?,?,?)').bind(branch,op,'Central','Cuenca').run();await f.db.prepare('INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) VALUES(?,?,?,?)').bind(v,op,branch,await user(driver)).run();
 let departure;
 for(const vehicleId of [v,other]){const route=await owner.call('/route-offers',{operatorId:op,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Terminal',dropoffPoint:'Llegada'});const d=await owner.call('/departures',{operatorId:op,offerId:route.data.id,departAt:new Date(Date.now()+900000).toISOString(),durationMinutes:60});assert.equal(d.status,200);if(vehicleId===v)departure=d.data.id;}
 assert.equal((await admin.call('/operations?operatorId='+op)).data.departures.length,2);assert.equal((await driver.call('/operations?operatorId='+op)).data.departures.length,1);assert.equal((await driver.call('/operator')).data.vehicles.length,1);
 assert.equal((await owner.call('/premium/activate',{operatorId:op})).status,403);
 await f.db.prepare("INSERT INTO platform_admins(user_id,role) VALUES(?,'owner')").bind(await user(admin)).run();
 const body={operatorId:op,plan:'premium',status:'active',feeCents:0,nextDueOn:new Date(Date.now()+86400000).toISOString().slice(0,10),cycleMonths:1,notes:'Habilitación manual, sin cobro',expectedRevision:0};assert.equal((await admin.call('/platform/subscriptions',body)).status,200);assert.equal((await owner.call('/premium?operatorId='+op)).data.enabled,true);
 const start=await driver.call('/operations',{operatorId:op,kind:'departure',id:departure,action:'start'});assert.equal(start.status,200);const view=await driver.call('/trips/'+start.data.liveId);assert.equal(view.data.source,'operations');assert.equal(view.data.snapshot,null);
 assert.equal((await driver.call('/operations',{operatorId:op,kind:'departure',id:departure,action:'finish'})).status,200);
 assert.equal((await admin.call('/platform/subscriptions',{...body,status:'paused',expectedRevision:1})).status,200);assert.equal((await owner.call('/premium?operatorId='+op)).data.enabled,false);assert.equal((await admin.call('/operations?operatorId='+op)).status,200);
 }finally{await f.mf.dispose();}});
