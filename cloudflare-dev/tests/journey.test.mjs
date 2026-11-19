import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';import {verifiedActor} from './verified-actor.mjs';import {seedReviewedOperator} from './onboarding-fixture.mjs';import {APP_ORIGIN} from '../identity.mjs';
test('Alpha journey: contact and meeting snapshots, saved profile, private receipt and complete cursor histories',async()=>{
 const r=await runtime({developmentAuth:false});try{
  const owner=await verifiedActor(r,'journey-owner'),buyer=await verifiedActor(r,'journey-buyer'),stranger=await verifiedActor(r,'journey-stranger');
  const op=(await owner.call('/operators',{name:'Operadora de prueba'})).data.id,vehicle=(await owner.call('/vehicles',{operatorId:op,type:'van',model:'Modelo original',capacity:30})).data.id;
  await seedReviewedOperator(r.db,op,vehicle);await owner.call('/custom-settings',{operatorId:op,enabled:true,available:true,origins:['Cuenca'],vehicleIds:[vehicle],expectedRevision:0});
  const offer=(await owner.call('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Encuentro original',dropoffPoint:'Llegada original'})).data.id;
  const departure=(await owner.call('/departures',{operatorId:op,offerId:offer,departAt:new Date(Date.now()+86400000).toISOString()})).data.id;
  const body={departureId:departure,seatNumbers:[1],passengers:['Pasajero real de prueba'],quotedPriceCents:1500};
  assert.equal((await buyer.call('/bookings',body)).status,400);
  const first=await buyer.call('/bookings',{...body,contactPhone:'+593981112233',saveContact:true});assert.equal(first.status,200);
  assert.equal(first.data.booking.contactEmail,'journey-buyer@example.com');assert.equal(first.data.booking.pickupPoint,'Encuentro original');
  await r.db.prepare("UPDATE route_offers SET pickup_point='Encuentro posterior' WHERE id=?").bind(offer).run();await r.db.prepare("UPDATE vehicles SET model='Modelo corregido' WHERE id=?").bind(vehicle).run();
  const receipt=(await buyer.call('/bookings/'+first.data.booking.id)).data.booking;assert.equal(receipt.pickupPoint,'Encuentro original');assert.equal(receipt.vehicle,'Modelo original');
  assert.equal((await stranger.call('/bookings/'+receipt.id)).status,403);
  const session=await r.mf.dispatchFetch(APP_ORIGIN+'/auth/session',{headers:{Cookie:buyer.cookie}});assert.equal((await session.json()).user.phone,'+593981112233');
  const publicCatalog=await owner.call('/catalog');assert.equal(JSON.stringify(publicCatalog.data).includes('journey-buyer@example.com'),false);assert.equal(JSON.stringify(publicCatalog.data).includes('+593981112233'),false);
  for(let seat=2;seat<=21;seat++)assert.equal((await buyer.call('/bookings',{...body,seatNumbers:[seat],contactPhone:'+593981112233'})).status,200);
  const recent=(await buyer.call('/bookings')).data,older=(await buyer.call('/bookings?cursor='+recent.nextCursor)).data;
  assert.equal(recent.bookings.length,20);assert.equal(older.bookings.length,1);assert.equal(new Set([...recent.bookings,...older.bookings].map(b=>b.id)).size,21);assert.equal(older.nextCursor,null);
  assert.equal((await stranger.call('/bookings?cursor='+recent.nextCursor)).status,404);
  const race=await Promise.all([buyer.call('/bookings',{...body,seatNumbers:[22],contactPhone:'+593981112233',saveContact:true}),stranger.call('/bookings',{...body,seatNumbers:[22],contactPhone:'+593986665555',saveContact:true})]);assert.deepEqual(race.map(x=>x.status).sort(),[200,409]);
  assert.equal((await r.db.prepare("SELECT COUNT(*) n FROM seat_claims WHERE departure_id=? AND seat_number=22 AND status='confirmed'").bind(departure).first()).n,1);
  const fixed=(await owner.call('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'private_fixed',priceCents:10000,pickupPoint:'Encuentro privado',dropoffPoint:'Llegada privada'})).data.id;
  const privateTicket=await buyer.call('/private-route-bookings',{offerId:fixed,serviceAt:new Date(Date.now()+3*86400000).toISOString(),passengers:['Pasajero privado de prueba'],quotedPriceCents:10000,contactPhone:'+593981112233'});
  assert.equal(privateTicket.status,200);assert.equal(privateTicket.data.booking.pickupPoint,'Encuentro privado');
  const request=await buyer.call('/private-requests',{origin:'Cuenca',destination:'Manta',people:2,vehicleType:'van',durationMinutes:60,serviceAt:new Date(Date.now()+5*86400000).toISOString(),passengers:['Persona uno','Persona dos'],contactPhone:'+593981112233',pickupPoint:'Encuentro personalizado',dropoffPoint:'Llegada personalizada'});assert.equal(request.status,200);
  const quote=await owner.call('/private-offers',{operatorId:op,vehicleId:vehicle,privateRequestId:request.data.id,priceCents:9000,durationMinutes:60});assert.equal(quote.status,200);
  assert.equal((await buyer.call('/private-requests/'+request.data.id+'/select',{offerId:quote.data.id,quotedPriceCents:9000})).status,200);
  const custom=(await buyer.call('/private-requests')).data.requests.find(x=>x.id===request.data.id).booking;
  assert.equal(custom.contact_phone,'+593981112233');assert.deepEqual(JSON.parse(custom.passengers_json),['Persona uno','Persona dos']);
  for(let n=0;n<101;n++)await r.db.prepare("INSERT INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event,at) VALUES(?,?,'booking',?,'boarded','2026-11-18 01:00:00')").bind('history-'+String(n).padStart(3,'0'),op,receipt.id).run();
  const history=(await owner.call('/operations/history?operatorId='+op)).data,next=(await owner.call('/operations/history?operatorId='+op+'&cursor='+history.nextCursor)).data;
  assert.equal(history.events.length,100);assert.equal(next.events.length,1);assert.equal((await buyer.call('/operations/history?operatorId='+op)).status,403);
 }finally{await r.mf.dispose();}
});
