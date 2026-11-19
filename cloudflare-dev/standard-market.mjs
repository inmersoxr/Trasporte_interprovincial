// Competitive private market: offers never reserve a vehicle. Selection does.
import {operatorScope} from './standard-catalog.mjs';
import {contactPhone,accountEmail} from './standard-contact.mjs';
export async function handleMarket(request,env,core){
 const {identity,stmt,rows,failure,owner,command,integer,text}=core,db=env.DB;
 const user=await identity(request,db),path=new URL(request.url).pathname;
 const select=path.match(/^\/api\/private-requests\/([0-9a-f-]{36})\/select$/i);
 const cancel=path.match(/^\/api\/private-requests\/([0-9a-f-]{36})$/i);
 const withdraw=path.match(/^\/api\/private-offers\/([0-9a-f-]{36})$/i);
 const now=new Date().toISOString();
 if(request.method==='GET'){
  if(path==='/api/private-requests'){
   const requests=await rows(db,`SELECT r.*,s.people,s.vehicle_type,s.duration_minutes,s.expires_at FROM private_requests r
    JOIN standard_private_specs s ON s.request_id=r.id WHERE r.customer_id=? ORDER BY r.created_at DESC LIMIT 20`,[user.id]);
   const offers=await rows(db,`SELECT f.*,o.display_name AS operatorName,v.model AS vehicle,v.capacity,v.type AS vehicleType,(SELECT COUNT(*) FROM standard_reviews z WHERE z.operator_id=f.operator_id AND z.status='visible') AS ratingCount,(SELECT AVG(rating) FROM standard_reviews z WHERE z.operator_id=f.operator_id AND z.status='visible') AS ratingAverage FROM standard_private_offers f
    JOIN private_requests r ON r.id=f.request_id JOIN operators o ON o.id=f.operator_id JOIN vehicles v ON v.id=f.vehicle_id WHERE r.customer_id=? ORDER BY f.created_at,f.id`,[user.id]);
   const bookings=await rows(db,'SELECT c.*,t.id AS liveId FROM standard_custom_bookings c LEFT JOIN standard_tracking t ON t.custom_booking_id=c.id WHERE c.customer_id=?',[user.id]);
   return {requests:requests.map(r=>({...r,offers:offers.filter(o=>o.request_id===r.id),booking:bookings.find(b=>b.request_id===r.id)||null,
    expired:r.expires_at<=now,simulated:true})),notifications:'in-app demo',selection:'customer-choice'};
  }
  if(path==='/api/private-market'){
   const requests=await rows(db,`SELECT DISTINCT r.id,r.origin,r.destination,r.requested_at,s.people,s.vehicle_type,s.duration_minutes,s.expires_at
    FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id JOIN vehicles v ON v.capacity>=s.people AND v.status='active'
    JOIN memberships m ON m.operator_id=v.operator_id AND m.user_id=? AND m.role='owner'
    JOIN operators o ON o.id=v.operator_id AND o.status='approved'
    WHERE ${operatorScope(env)} AND r.status IN('requested','receiving_offers') AND s.expires_at>? AND (s.vehicle_type='any' OR s.vehicle_type=v.type)
    AND EXISTS(SELECT 1 FROM route_offers ro WHERE ro.operator_id=v.operator_id AND ro.origin=r.origin AND ro.active=1)
    AND NOT EXISTS(SELECT 1 FROM standard_vehicle_slots x WHERE x.vehicle_id=v.id AND x.active=1
     AND x.starts_at<unixepoch(r.requested_at)*1000+s.duration_minutes*60000 AND x.ends_at>unixepoch(r.requested_at)*1000)
    ORDER BY r.requested_at LIMIT 100`,[user.id,now]);
   const offers=await rows(db,`SELECT f.* FROM standard_private_offers f JOIN memberships m ON m.operator_id=f.operator_id WHERE m.user_id=? AND m.role='owner' ORDER BY f.created_at DESC LIMIT 100`,[user.id]);
   return {requests,offers,notifications:'Alertas DEMO dentro de la app; sin envío externo'};
  }
  throw failure('Recurso no encontrado',404);
 }
 if(request.method!=='POST')throw failure('Método no permitido',405);
 const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);
 let b;try{b=JSON.parse(raw);}catch{throw failure('JSON no válido');}if(!b||typeof b!=='object'||Array.isArray(b))throw failure('Solicitud no válida');
 if(path==='/api/private-requests'){
  const origin=text(b.origin,'Origen'),destination=text(b.destination,'Destino');if(origin.toLowerCase()===destination.toLowerCase())throw failure('Origen y destino deben ser distintos');
  const people=integer(b.people,1,30,'Pasajeros'),duration=integer(b.durationMinutes,1,2880,'Duración');
  if(!['any','auto','suv','van','minivan'].includes(b.vehicleType))throw failure('Tipo no válido');
  const at=b.immediate===true?Date.now()+300000:Date.parse(b.serviceAt);
  if(!Number.isFinite(at)||at<=Date.now()||at>Date.now()+366*86400000)throw failure('Horario futuro no válido');
  const notes=String(b.notes||'').trim();if(notes.length>500)throw failure('Notas demasiado largas');
  const id=crypto.randomUUID(),phone=contactPhone(b,env,failure),email=await accountEmail(db,user.id,stmt);
  let passengers;if(env.ALLOW_DEVELOPMENT_AUTH==='true'&&!b.passengers)passengers=Array.from({length:people},(_,i)=>'Invitado ficticio '+(i+1));
  else{if(!Array.isArray(b.passengers)||b.passengers.length!==people)throw failure('Escribe el nombre de cada pasajero');passengers=b.passengers.map(name=>text(name,'Nombre de pasajero',80));}
  const pickupPoint=env.ALLOW_DEVELOPMENT_AUTH==='true'&&!b.pickupPoint?'':text(b.pickupPoint,'Punto de encuentro',250),dropoffPoint=env.ALLOW_DEVELOPMENT_AUTH==='true'&&!b.dropoffPoint?'':text(b.dropoffPoint,'Punto de llegada',250);
  const saved=await command(db,user,b,'private_request',[
   stmt(db,'INSERT INTO private_requests(id,customer_id,origin,destination,requested_at,details) VALUES(?,?,?,?,?,?)',[id,user.id,origin,destination,new Date(at).toISOString(),JSON.stringify({notes,passengers,contactPhone:phone,contactEmail:email,pickupPoint,dropoffPoint})]),
   stmt(db,'INSERT INTO standard_private_specs(request_id,people,vehicle_type,duration_minutes,expires_at) VALUES(?,?,?,?,?)',[id,people,b.vehicleType,duration,new Date(Math.min(at,Date.now()+86400000)).toISOString()])],id);
  return {id:saved,status:'requested',assignment:'none'};
 }
 if(path==='/api/private-offers'){
  await owner(db,user.id,b.operatorId);
  const req=await stmt(db,`SELECT r.*,s.people,s.vehicle_type,s.duration_minutes FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id WHERE r.id=?`,[b.privateRequestId]).first();
  if(!req)throw failure('Solicitud no encontrada',404);
  const duration=integer(b.durationMinutes,req.duration_minutes,2880,'Duración propuesta'),price=integer(b.priceCents,1,1000000,'Precio');
  const vehicle=await stmt(db,`SELECT v.* FROM vehicles v WHERE v.id=? AND v.operator_id=? AND v.status='active' AND v.capacity>=?
   AND (?='any' OR v.type=?) AND EXISTS(SELECT 1 FROM operators o WHERE o.id=v.operator_id AND status='approved' AND ${operatorScope(env)})
   AND EXISTS(SELECT 1 FROM route_offers WHERE operator_id=v.operator_id AND origin=? AND active=1)`,[b.vehicleId,b.operatorId,req.people,req.vehicle_type,req.vehicle_type,req.origin]).first();
  if(!vehicle)throw failure('Operadora/vehículo no elegible para esta solicitud',403);
  const at=Date.parse(req.requested_at);
  if(await stmt(db,'SELECT 1 FROM standard_vehicle_slots WHERE vehicle_id=? AND active=1 AND starts_at<? AND ends_at>?',[vehicle.id,at+duration*60000,at]).first())throw failure('Vehículo no disponible',409);
  const id=crypto.randomUUID();
  try{
   const saved=await command(db,user,b,'private_offer',[
    stmt(db,'INSERT INTO standard_private_offers(id,request_id,operator_id,vehicle_id,price_cents,duration_minutes,created_at) VALUES(?,?,?,?,?,?,?)',[id,req.id,b.operatorId,vehicle.id,price,duration,new Date().toISOString()]),
    stmt(db,"UPDATE private_requests SET status='receiving_offers' WHERE id=? AND status='requested'",[req.id])],id);
   return {id:saved,status:'available',assignment:'none'};
  }catch(error){if(/offer_unavailable|UNIQUE constraint failed: standard_private_offers/.test(String(error.message)))throw failure('Oferta duplicada o solicitud ya no disponible',409);throw error;}
 }
 if(withdraw){
  if(b.action!=='withdraw')throw failure('Acción no válida');
  const offer=await stmt(db,'SELECT * FROM standard_private_offers WHERE id=?',[withdraw[1]]).first();if(!offer)throw failure('Oferta no encontrada',404);
  await owner(db,user.id,offer.operator_id);if(!['available','withdrawn'].includes(offer.status))throw failure('Oferta ya seleccionada o cerrada',409);
  await stmt(db,"UPDATE standard_private_offers SET status='withdrawn' WHERE id=? AND status='available'",[offer.id]).run();return {status:'withdrawn'};
 }
 if(select||cancel){
  const req=await stmt(db,`SELECT r.*,s.people,s.duration_minutes FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id WHERE r.id=?`,[(select||cancel)[1]]).first();
  if(!req)throw failure('Solicitud no encontrada',404);
  if(req.customer_id!==user.id){
   const selected=cancel?await stmt(db,'SELECT operator_id FROM standard_custom_bookings WHERE request_id=?',[req.id]).first():null;
   if(!selected)throw failure('Solicitud privada',403);await owner(db,user.id,selected.operator_id);
  }
  if(cancel){
   if(b.action!=='cancel')throw failure('Acción no válida');
   const booking=await stmt(db,'SELECT * FROM standard_custom_bookings WHERE request_id=?',[req.id]).first();
   if(booking&&(booking.boarded_at||!['confirmed','cancelled'].includes(booking.status)))throw failure('La operadora debe gestionar este servicio',409);
   try{await db.batch([
    stmt(db,"UPDATE standard_custom_bookings SET status='cancelled' WHERE request_id=? AND status='confirmed'",[req.id]),
    stmt(db,"UPDATE standard_vehicle_slots SET active=0 WHERE custom_booking_id IN(SELECT id FROM standard_custom_bookings WHERE request_id=? AND status='cancelled')",[req.id]),
    stmt(db,"INSERT OR IGNORE INTO standard_custom_events(id,booking_id,kind) SELECT ?,id,'simulated_refund' FROM standard_custom_bookings WHERE request_id=? AND status='cancelled'",[crypto.randomUUID(),req.id]),
    stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT id||':cancel',operator_id,'custom',id,'cancelled_simulated_refund' FROM standard_custom_bookings WHERE request_id=? AND status='cancelled'",[req.id]),
    stmt(db,"UPDATE private_requests SET status='cancelled' WHERE id=? AND (NOT EXISTS(SELECT 1 FROM standard_custom_bookings WHERE request_id=?) OR EXISTS(SELECT 1 FROM standard_custom_bookings WHERE request_id=? AND status='cancelled'))",[req.id,req.id,req.id]),
    stmt(db,"UPDATE standard_private_offers SET status='expired' WHERE request_id=? AND status='available' AND EXISTS(SELECT 1 FROM private_requests WHERE id=? AND status='cancelled')",[req.id,req.id])]);}
   catch(error){if(String(error.message).includes('already_boarded'))throw failure('Servicio ya abordado',409);throw error;}
   if((await stmt(db,'SELECT status FROM private_requests WHERE id=?',[req.id]).first()).status!=='cancelled')throw failure('El servicio cambió en otra sesión; actualiza',409);
   return {status:'cancelled',refund:'simulated'};
  }
  const offer=await stmt(db,'SELECT * FROM standard_private_offers WHERE id=? AND request_id=?',[b.offerId,req.id]).first();
  if(!offer)throw failure('Oferta no encontrada',404);if(b.quotedPriceCents!==offer.price_cents)throw failure('Precio no vigente',409);
  if(!await stmt(db,`SELECT 1 FROM operators o JOIN vehicles v ON v.operator_id=o.id WHERE o.id=? AND v.id=? AND o.status='approved' AND v.status='active' AND ${operatorScope(env)}`,[offer.operator_id,offer.vehicle_id]).first())throw failure('La operadora o el vehículo ya no están habilitados',409);
  const id=crypto.randomUUID(),at=Date.parse(req.requested_at);
  try{
   const saved=await command(db,user,b,'custom_booking',[
    stmt(db,'INSERT INTO standard_custom_bookings(id,request_id,offer_id,customer_id,operator_id,vehicle_id,service_at,duration_minutes,amount_cents,passengers_json,contact_phone,contact_email,pickup_point,dropoff_point) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,req.id,offer.id,user.id,offer.operator_id,offer.vehicle_id,req.requested_at,offer.duration_minutes,offer.price_cents,JSON.stringify(JSON.parse(req.details).passengers),JSON.parse(req.details).contactPhone||'',JSON.parse(req.details).contactEmail||null,JSON.parse(req.details).pickupPoint||'',JSON.parse(req.details).dropoffPoint||'']),
    stmt(db,'INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,custom_booking_id) VALUES(?,?,?,?,?)',[crypto.randomUUID(),offer.vehicle_id,at,at+offer.duration_minutes*60000,id]),
    stmt(db,"UPDATE private_requests SET status='booked' WHERE id=?",[req.id]),
    stmt(db,"UPDATE standard_private_offers SET status='selected' WHERE id=?",[offer.id]),
    stmt(db,"UPDATE standard_private_offers SET status='expired' WHERE request_id=? AND id<>? AND status='available'",[req.id,offer.id]),
    stmt(db,"INSERT INTO standard_custom_events(id,booking_id,kind) VALUES(?,?,'simulated_confirmed')",[crypto.randomUUID(),id])],id);
   return {bookingId:saved,mode:'custom',payment:'simulated',selection:'customer-choice'};
  }catch(error){if(/offer_unavailable|UNIQUE constraint failed: standard_custom_bookings/.test(String(error.message)))throw failure('La solicitud u oferta cambió; actualiza antes de elegir',409);throw error;}
 }
 throw failure('Recurso no encontrado',404);
}
