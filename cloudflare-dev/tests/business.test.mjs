import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';
test('P3: D1 analytics count real bookings, cancellations and occupancy, scoped by tenant and period',async()=>{const {mf,call}=await runtime();try{
 const token=(await call('/sessions',{})).data.token,other=(await call('/sessions',{})).data.token;const create=(path,body)=>call(path,{...body,requestId:crypto.randomUUID()},token);
 const operatorId=(await create('/operators',{name:'Analítica ficticia'})).data.id;
 assert.equal((await call('/premium/analytics?operatorId='+operatorId,undefined,token)).status,403);await create('/premium/activate',{operatorId});
 const vehicleId=(await create('/vehicles',{operatorId,type:'van',model:'Van P3',capacity:8})).data.id;
 const offerId=(await create('/route-offers',{operatorId,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500})).data.id;
 const departureId=(await create('/departures',{operatorId,offerId,departAt:new Date(Date.now()+86400000).toISOString()})).data.id;
 const booking=await create('/bookings',{departureId,seatNumbers:[1,2],passengers:['Persona A','Persona B'],quotedPriceCents:1500});assert.equal(booking.status,200);
 const path='/premium/analytics?operatorId='+operatorId;let view=(await call(path,undefined,token)).data;
 assert.equal(view.modes[0].bookings,1);assert.equal(view.modes[0].passengers,2);assert.equal(view.departures[0].occupied,2);assert.equal(view.calendar.length,1);
 await call('/bookings/'+booking.data.booking.id,{action:'cancel'},token);view=(await call(path,undefined,token)).data;assert.equal(view.modes[0].cancelled,1);assert.equal(view.modes[0].passengers,0);assert.equal(view.departures[0].occupied,0);
 assert.equal((await call(path,undefined,other)).status,403);assert.equal((await call(path+'&from=2026-02-30',undefined,token)).status,400);
 assert.equal((await call(path+'&from=2020-01-01&to=2020-01-02',undefined,token)).data.modes.length,0);
 }finally{await mf.dispose();}});
