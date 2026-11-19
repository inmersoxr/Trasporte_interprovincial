import {manage} from './standard-permissions.mjs';
export async function serviceChanges(request,env,c){
 const {identity,stmt,rows,failure,integer,text,command}=c,user=await identity(request,env.DB),db=env.DB;
 if(request.method!=='POST')throw failure('Método no permitido',405);const raw=await request.text();if(raw.length>4096)throw failure('Solicitud demasiado grande',413);let b;try{b=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}if(!b||typeof b!=='object'||Array.isArray(b))throw failure('Solicitud no válida');
 const path=new URL(request.url).pathname,revision=integer(b.expectedRevision,1,100000000,'Revisión'),reason=text(b.reason,'Motivo',250),operations=[];let op,entity,kind;
 if(path==='/api/route-change'){
  const r=await stmt(db,'SELECT * FROM route_offers WHERE id=?',[b.id]).first();if(!r)throw failure('Ruta no encontrada',404);op=r.operator_id;entity=r.id;kind='route';await manage(db,user.id,op,failure);
  operations.push(stmt(db,'UPDATE route_offers SET price_cents=?,active=?,revision=revision+1,last_change=? WHERE id=? AND revision=?',[integer(b.priceCents,1,1000000,'Precio'),b.active===false?0:1,b.requestId,r.id,revision]));
 }else if(path==='/api/departure-change'){
  const d=await stmt(db,'SELECT d.*,r.operator_id FROM departures d JOIN route_offers r ON r.id=d.offer_id WHERE d.id=?',[b.id]).first();if(!d)throw failure('Salida no encontrada',404);op=d.operator_id;entity=d.id;kind='departure';await manage(db,user.id,op,failure);
  const at=Date.parse(b.departAt),duration=integer(b.durationMinutes,1,2880,'Duración');if(!Number.isFinite(at)||at<=Date.now()||at>Date.now()+366*86400000)throw failure('Selecciona una fecha futura');
  const vehicle=await stmt(db,'SELECT * FROM vehicles WHERE id=? AND operator_id=?',[b.vehicleId,op]).first();if(!vehicle)throw failure('Vehículo ajeno',403);
  operations.push(stmt(db,"UPDATE departures SET depart_at=?,vehicle_id=?,revision=revision+1,last_change=? WHERE id=? AND revision=? AND status='published'",[new Date(at).toISOString(),vehicle.id,b.requestId,d.id,revision]),
   stmt(db,'UPDATE standard_vehicle_slots SET vehicle_id=?,starts_at=?,ends_at=? WHERE departure_id=? AND EXISTS(SELECT 1 FROM departures WHERE id=? AND last_change=?)',[vehicle.id,at,at+duration*60000,d.id,d.id,b.requestId]),
   stmt(db,'UPDATE bookings SET service_at=?,revision=revision+1 WHERE departure_id=? AND EXISTS(SELECT 1 FROM departures WHERE id=? AND last_change=?)',[new Date(at).toISOString(),d.id,d.id,b.requestId]),
   stmt(db,'UPDATE standard_booking_details SET vehicle_id=? WHERE booking_id IN(SELECT id FROM bookings WHERE departure_id=?) AND EXISTS(SELECT 1 FROM departures WHERE id=? AND last_change=?)',[vehicle.id,d.id,d.id,b.requestId]),
   stmt(db,'UPDATE standard_booking_contacts SET vehicle_plate=?,vehicle_model=? WHERE booking_id IN(SELECT id FROM bookings WHERE departure_id=?) AND EXISTS(SELECT 1 FROM departures WHERE id=? AND last_change=?)',[vehicle.plate,vehicle.model,d.id,d.id,b.requestId]),
   stmt(db,`INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT ?||':'||customer_id,customer_id,?,'change','Tu viaje tiene un cambio',?,'/standard/?ticket='||id FROM bookings WHERE departure_id=? AND status='confirmed' AND EXISTS(SELECT 1 FROM departures WHERE id=? AND last_change=?)`,[b.requestId,op,reason,d.id,d.id,b.requestId]));
 }else if(path==='/api/private-service-change'){
  const custom=b.kind==='custom',table=custom?'standard_custom_bookings':'bookings',column=custom?'custom_booking_id':'booking_id';
  const row=await stmt(db,custom?'SELECT * FROM standard_custom_bookings WHERE id=?':'SELECT b.*,m.operator_id FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id WHERE b.id=? AND b.departure_id IS NULL',[b.id]).first();
  if(!row)throw failure('Servicio no encontrado',404);op=row.operator_id;entity=row.id;kind=custom?'private_custom':'private_fixed';await manage(db,user.id,op,failure);
  const at=Date.parse(b.departAt),duration=integer(b.durationMinutes,1,2880,'Duración');if(!Number.isFinite(at)||at<=Date.now()||at>Date.now()+366*86400000)throw failure('Selecciona una fecha futura');
  const vehicle=await stmt(db,`SELECT v.* FROM vehicles v JOIN operators o ON o.id=v.operator_id WHERE v.id=? AND v.operator_id=? AND v.status='active' AND o.status='approved' AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id))`,[b.vehicleId,op]).first();if(!vehicle)throw failure('El vehículo debe pertenecer a tu operadora y estar habilitado',403);
  const count=custom?JSON.parse(row.passengers_json).length:row.passenger_count;if(vehicle.capacity<count)throw failure('El vehículo no tiene capacidad para el grupo',409);
  const guard=`EXISTS(SELECT 1 FROM ${table} WHERE id=? AND last_change=?)`,args=[row.id,b.requestId];
  operations.push(stmt(db,`UPDATE ${table} SET service_at=?,revision=revision+1,last_change=?${custom?',vehicle_id=?,duration_minutes=?':''} WHERE id=? AND revision=? AND status='confirmed' AND ${custom?'boarded_at IS NULL':"NOT EXISTS(SELECT 1 FROM standard_passengers p WHERE p.booking_id=bookings.id AND p.boarded_at IS NOT NULL)"} AND NOT EXISTS(SELECT 1 FROM standard_tracking t WHERE t.${column}=${table}.id)`,[new Date(at).toISOString(),b.requestId,...(custom?[vehicle.id,duration]:[]),row.id,revision]),stmt(db,`UPDATE standard_vehicle_slots SET vehicle_id=?,starts_at=?,ends_at=? WHERE ${column}=? AND ${guard}`,[vehicle.id,at,at+duration*60000,row.id,...args]));
  if(!custom)operations.push(stmt(db,'UPDATE standard_booking_details SET vehicle_id=? WHERE booking_id=? AND '+guard,[vehicle.id,row.id,...args]),stmt(db,'UPDATE standard_booking_contacts SET vehicle_plate=?,vehicle_model=? WHERE booking_id=? AND '+guard,[vehicle.plate,vehicle.model,row.id,...args]));
  operations.push(stmt(db,`INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT ?||':'||customer_id,customer_id,?,'change','Tu servicio tiene un cambio',?,? FROM ${table} WHERE id=? AND ${guard}`,[b.requestId,op,reason,custom?'/standard/?private=1':'/standard/?ticket='+row.id,row.id,...args]));
 }else if(path==='/api/booking-change'){
  const booking=await stmt(db,'SELECT b.*,m.operator_id,m.vehicle_id,v.capacity FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id JOIN vehicles v ON v.id=m.vehicle_id WHERE b.id=?',[b.id]).first();if(!booking)throw failure('Boleto no encontrado',404);op=booking.operator_id;entity=booking.id;
  if(booking.customer_id!==user.id)await manage(db,user.id,op,failure);
  const d=await stmt(db,'SELECT * FROM departures WHERE id=?',[booking.departure_id]).first();if(!d||d.status!=='published'||Date.parse(d.depart_at)<=Date.now()||booking.status!=='confirmed')throw failure('Este boleto ya no admite cambios',409);
  const passengers=await rows(db,'SELECT * FROM standard_passengers WHERE booking_id=? AND cancelled_at IS NULL ORDER BY position',[booking.id]);if(passengers.some(p=>p.boarded_at))throw failure('El boleto ya tiene pasajeros embarcados',409);
  kind=b.action==='cancel_seats'?'partial_cancel':'seats';
  operations.push(stmt(db,"UPDATE bookings SET revision=revision+1,last_change=? WHERE id=? AND revision=? AND status='confirmed' AND NOT EXISTS(SELECT 1 FROM standard_passengers WHERE booking_id=? AND boarded_at IS NOT NULL)",[b.requestId,booking.id,revision,booking.id]));
  const guard='EXISTS(SELECT 1 FROM bookings WHERE id=? AND last_change=?)',guardArgs=[booking.id,b.requestId];
  if(kind==='seats'){
   if(!Array.isArray(b.seatNumbers)||b.seatNumbers.length!==passengers.length||new Set(b.seatNumbers).size!==b.seatNumbers.length)throw failure('Selecciona un asiento distinto para cada pasajero');b.seatNumbers.forEach(n=>integer(n,1,booking.capacity,'Asiento'));
   operations.push(stmt(db,"UPDATE seat_claims SET status='released' WHERE booking_id=? AND "+guard,[booking.id,...guardArgs]));
   passengers.forEach((p,i)=>{operations.push(stmt(db,'UPDATE standard_passengers SET seat_number=? WHERE booking_id=? AND position=? AND '+guard,[b.seatNumbers[i],booking.id,p.position,...guardArgs]),stmt(db,"INSERT INTO seat_claims(id,departure_id,booking_id,seat_number,status) SELECT ?,?,?,?,'confirmed' WHERE "+guard,[crypto.randomUUID(),booking.departure_id,booking.id,b.seatNumbers[i],...guardArgs]));});
  }else{
   if(!Array.isArray(b.positions)||!b.positions.length||new Set(b.positions).size!==b.positions.length||b.positions.some(pos=>!passengers.some(p=>p.position===pos)))throw failure('Selecciona pasajeros activos de este boleto');
   if(b.positions.length===passengers.length)throw failure('Para cancelar todos los pasajeros usa Cancelar boleto');
   const refund=Math.round(booking.amount_cents/passengers.length)*b.positions.length;
   for(const pos of b.positions){const p=passengers.find(p=>p.position===pos);operations.push(stmt(db,'UPDATE standard_passengers SET cancelled_at=? WHERE booking_id=? AND position=? AND '+guard,[Date.now(),booking.id,pos,...guardArgs]),stmt(db,"UPDATE seat_claims SET status='released' WHERE booking_id=? AND seat_number=? AND "+guard,[booking.id,p.seat_number,...guardArgs]));}
   operations.push(stmt(db,'UPDATE bookings SET passenger_count=passenger_count-?,amount_cents=amount_cents-? WHERE id=? AND '+guard,[b.positions.length,refund,booking.id,...guardArgs]),stmt(db,"INSERT INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) SELECT ?,id,?,'simulated_partial_refund',? FROM payments WHERE booking_id=? AND "+guard,[crypto.randomUUID(),b.requestId,JSON.stringify({amountCents:refund,positions:b.positions}),booking.id,...guardArgs]));
  }
  operations.push(stmt(db,"INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT ?,customer_id,?,'change','Tu boleto se actualizó',?,'/standard/?ticket='||id FROM bookings WHERE id=? AND "+guard,[b.requestId+':notice',op,reason,booking.id,...guardArgs]));
 }else throw failure('Ruta no encontrada',404);
 operations.push(stmt(db,'INSERT INTO standard_service_changes(id,actor_user_id,operator_id,entity_id,kind,reason) VALUES(?,?,?,?,?,?)',[b.requestId,user.id,op,entity,kind,reason]));
 try{const id=await command(db,user,b,'service_change',operations,entity);return{id,updated:true,payments:'simulated'};}catch(error){if(/change_conflict|vehicle_conflict|service_change_not_allowed|seat_unavailable|UNIQUE constraint failed: seat_claims|seat_cancelled/.test(String(error.message)))throw failure('El servicio, los asientos o el calendario cambiaron. Actualiza antes de reintentar',409);throw error;}
}
