import {operatorScope} from './standard-catalog.mjs';
import {bookingContacts} from './standard-contact.mjs';
export async function createPrivate(db,user,body,core,env){
 const {stmt,integer,text,failure,command}=core;
 if(typeof body.offerId!=='string')throw failure('Ruta requerida');
 const offer=await stmt(db,`SELECT r.*,rv.vehicle_id,rv.duration_minutes,v.capacity FROM route_offers r
 JOIN standard_route_vehicles rv ON rv.offer_id=r.id JOIN vehicles v ON v.id=rv.vehicle_id JOIN operators o ON o.id=r.operator_id
 WHERE r.id=? AND r.service_type='private_fixed' AND r.active=1 AND v.status='active' AND o.status='approved' AND ${operatorScope(env)}`,[body.offerId]).first();
 if(!offer)throw failure('Ruta privada no disponible',409);
 if(body.quotedPriceCents!==offer.price_cents)throw failure('El precio cambió; revisa la tarifa por vehículo',409);
 if(typeof body.serviceAt!=='string')throw failure('Elige fecha y hora');
 const at=Date.parse(body.serviceAt);
 if(!Number.isFinite(at)||at<=Date.now()||at>Date.now()+366*86400000)throw failure('Fecha futura no válida');
 if(!Array.isArray(body.passengers)||!body.passengers.length||body.passengers.length>offer.capacity)throw failure('Cantidad de pasajeros no válida');
 const names=body.passengers.map(n=>text(n,'Nombre de pasajero',80));
 integer(offer.duration_minutes,1,2880,'Duración publicada');
 if(body.simulatedPaymentMethod&&!['credit','debit','transfer'].includes(body.simulatedPaymentMethod))throw failure('Método de pago simulado no válido');
 const id=crypto.randomUUID(),paymentId=crypto.randomUUID(),operations=[
 stmt(db,"INSERT INTO bookings(id,customer_id,offer_id,mode,service_at,passenger_count,amount_cents,status,confirmed_at) VALUES(?,?,?,'private_fixed',?,?,?,'confirmed',CURRENT_TIMESTAMP)",[id,user.id,offer.id,new Date(at).toISOString(),names.length,offer.price_cents]),
 stmt(db,'INSERT INTO standard_booking_details(booking_id,operator_id,vehicle_id) VALUES(?,?,?)',[id,offer.operator_id,offer.vehicle_id]),
 stmt(db,'INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,booking_id) VALUES(?,?,?,?,?)',[crypto.randomUUID(),offer.vehicle_id,at,at+offer.duration_minutes*60000,id]),
 stmt(db,"INSERT INTO payments(id,booking_id,provider,method,amount_cents,status,idempotency_key,paid_at) VALUES(?,?,'simulated',?,?,'paid',?,CURRENT_TIMESTAMP)",[paymentId,id,body.simulatedPaymentMethod==='transfer'?'bank_transfer':'card',offer.price_cents,user.id+':'+body.requestId]),stmt(db,"INSERT INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) VALUES(?,?,?,'simulated_method',?)",[crypto.randomUUID(),paymentId,'method:'+body.requestId,JSON.stringify({method:body.simulatedPaymentMethod||'credit'})])];
 operations.push(...bookingContacts(db,user,body,env,id,offer.id,offer.vehicle_id,core));
 names.forEach((name,i)=>operations.push(stmt(db,'INSERT INTO standard_passengers(booking_id,position,name) VALUES(?,?,?)',[id,i,name])));
 return command(db,user,body,'private_fixed',operations,id);
}
