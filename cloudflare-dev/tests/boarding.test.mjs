import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';import {verifiedActor} from './verified-actor.mjs';import {seedReviewedOperator} from './onboarding-fixture.mjs';
import {APP_ORIGIN,COOKIE} from '../identity.mjs';
test('Alpha boarding binds ticket to its service/time and records once; ordinary cookie sessions control tracking',async()=>{
 const r=await runtime({developmentAuth:false});try{
  const owner=await verifiedActor(r,'boarding-owner'),passenger=await verifiedActor(r,'boarding-passenger');
  const op=(await owner.call('/operators',{name:'Operador de prueba'})).data.id;
  const vehicle=(await owner.call('/vehicles',{operatorId:op,type:'van',model:'Van de prueba',capacity:4})).data.id;
  await seedReviewedOperator(r.db,op,vehicle);
  const route=(await owner.call('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Referencia de prueba en Cuenca',dropoffPoint:'Referencia de prueba en Guayaquil'})).data.id;
  const departure=(await owner.call('/departures',{operatorId:op,offerId:route,departAt:new Date(Date.now()+15*60000).toISOString()})).data.id;
  const tomorrow=(await owner.call('/departures',{operatorId:op,offerId:route,departAt:new Date(Date.now()+86400000).toISOString()})).data.id;
  const reserve=(id,seat)=>passenger.call('/bookings',{departureId:id,seatNumbers:[seat],passengers:['Pasajero de prueba'],contactPhone:'+593981112233',quotedPriceCents:1500});
  const ticket=(await reserve(departure,1)).data.booking,early=(await reserve(tomorrow,1)).data.booking;
  const board={operatorId:op,action:'board',code:ticket.qrCodes[0],serviceKind:'departure',serviceId:departure};
  assert.equal((await owner.call('/operations',{operatorId:op,action:'board',code:ticket.qrCodes[0]})).status,400);
  assert.equal((await owner.call('/operations',{...board,serviceId:tomorrow})).status,409);
  assert.equal((await owner.call('/operations',{...board,serviceId:tomorrow,code:early.qrCodes[0]})).status,409);
  assert.equal((await passenger.call('/operations',board)).status,403);
  const canceled=(await reserve(departure,2)).data.booking;
  await passenger.call('/bookings/'+canceled.id,{action:'cancel'});
  assert.equal((await owner.call('/operations',{...board,code:canceled.qrCodes[0]})).status,409);
  const race=await Promise.all([owner.call('/operations',board),owner.call('/operations',board)]);
  assert.deepEqual(race.map(v=>v.status).sort(),[200,409]);
  const after=(await passenger.call('/bookings/'+ticket.id)).data.booking;
  assert.ok(after.passengers[0].boardedAt);assert.equal((await r.db.prepare("SELECT COUNT(*) n FROM standard_operational_events WHERE event='boarded'").first()).n,1);
  assert.equal((await owner.call('/operations',board)).status,409);
  assert.equal((await passenger.call('/bookings/'+ticket.id)).data.booking.passengers[0].boardedAt,after.passengers[0].boardedAt);
  const started=await owner.call('/operations',{operatorId:op,kind:'departure',id:departure,action:'start'});assert.equal(started.status,200);
  const path='/trips/'+started.data.liveId,ownView=await owner.call(path),passengerView=await passenger.call(path);
  assert.equal(ownView.data.permissions.control,true);assert.equal(passengerView.data.permissions.passenger,true);
  const anonymous=await r.mf.dispatchFetch(APP_ORIGIN+'/api'+path);assert.equal((await anonymous.json()).permissions.control,false);
  const stale=await r.mf.dispatchFetch(APP_ORIGIN+'/api'+path,{headers:{Cookie:COOKIE+'='+'a'.repeat(64)}});assert.equal(stale.status,200);assert.equal((await stale.json()).permissions.control,false);
  const sos=await passenger.call(path+'/commands',{action:'sos',expectedRevision:passengerView.data.trip.revision});assert.equal(passengerView.data.source,'operations');assert.equal(passengerView.data.snapshot,null);assert.equal(sos.status,409);
 }finally{await r.mf.dispose();}
});
