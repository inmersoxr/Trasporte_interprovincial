import assert from 'node:assert/strict';import {remote,setup} from './remote.mjs';
const r=await remote();try{const a=await r.actor(),b=await r.actor(),{operatorId,vehicleId}=await setup(a);const offer=await a.api('/route-offers',{operatorId,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'private_fixed',priceCents:9000});assert.equal(offer.status,200);
 const booking=await b.api('/private-route-bookings',{offerId:offer.data.id,serviceAt:new Date(Date.now()+86400000).toISOString(),quotedPriceCents:9000,passengers:['Pasajero ficticio P3']});assert.equal(booking.status,200);
 await a.open();await a.page.locator('#analyticsStatus').filter({hasText:'Consultado en D1'}).waitFor();await a.page.getByText('Privado fijo: 1 reservas · 0 canceladas · 1 pasajeros vigentes',{exact:true}).waitFor();
 assert.equal((await b.api('/premium/analytics?operatorId='+operatorId)).status,403);assert.equal((await b.api('/bookings/'+booking.data.booking.id,{action:'cancel'})).status,200);
 await a.page.locator('#periodForm button').click();await a.page.getByText('Privado fijo: 1 reservas · 1 canceladas · 0 pasajeros vigentes',{exact:true}).waitFor();assert.deepEqual(a.errors,[]);console.log('PASS P3 browser: actual D1 booking counts, cancellation refresh and tenant denial');
}finally{await r.close();}
