import {tripSegment} from './standard-route-stops.mjs';
import {createPrivate} from './standard-private.mjs';
import {operatorScope} from './standard-catalog.mjs';
import {bookingContacts} from './standard-contact.mjs';
export async function handleReservations(request, env, core) {
  const { identity, stmt, rows, failure, command, integer, text } = core;
  const user = await identity(request, env.DB), path = new URL(request.url).pathname;
  const fixed=path==='/api/private-route-bookings';
  const match = fixed?[path,undefined]:path.match(/^\/api\/bookings(?:\/([0-9a-f-]{36}))?$/i);
  if (!match) throw failure('Recurso no encontrado', 404);
  const db = env.DB;
  async function view(id) {
    const b = await stmt(db, `SELECT b.*,COALESCE(seg.origin,r.origin) AS origin,COALESCE(seg.destination,r.destination) AS destination,seg.boarding_stop AS boardingStop,seg.alighting_stop AS alightingStop,COALESCE(c.operator_name,o.display_name) AS operatorName,COALESCE(c.vehicle_model,v.model) AS vehicle,v.capacity,
      c.passenger_phone AS contactPhone,c.passenger_email AS contactEmail,COALESCE(seg.pickup_point,c.pickup_point,r.pickup_point) AS pickupPoint,COALESCE(seg.dropoff_point,c.dropoff_point,r.dropoff_point) AS dropoffPoint,COALESCE(c.vehicle_plate,v.plate) AS vehiclePlate,pf.phone AS operatorPhone,
      (SELECT json_extract(pe.payload_json,'$.method') FROM payment_events pe WHERE pe.payment_id=p.id AND pe.kind='simulated_method' LIMIT 1) AS simulatedPaymentMethod,m.operator_id AS operatorId,m.vehicle_id AS vehicleId,p.status AS paymentStatus,t.id AS liveId,t.service_status AS serviceStatus
      FROM bookings b JOIN route_offers r ON r.id=b.offer_id JOIN standard_booking_details m ON m.booking_id=b.id
      JOIN operators o ON o.id=m.operator_id JOIN vehicles v ON v.id=m.vehicle_id JOIN payments p ON p.booking_id=b.id
      LEFT JOIN standard_booking_segments seg ON seg.booking_id=b.id LEFT JOIN standard_booking_contacts c ON c.booking_id=b.id LEFT JOIN standard_operator_profiles pf ON pf.operator_id=o.id
      LEFT JOIN standard_tracking t ON t.booking_id=b.id OR t.departure_id=b.departure_id WHERE b.id=?`, [id]).first();
    if (!b) throw failure('Boleto no encontrado',404);
    if ((b.customer_id!==user.id||b.sales_channel==='office') && !await stmt(db,"SELECT 1 FROM organization_capabilities WHERE user_id=? AND operator_id=? AND capability IN('*','bookings.all')",[user.id,b.operatorId]).first()) throw failure('Boleto privado',403);
    b.passengers=await rows(db,'SELECT position,name,seat_number AS seatNumber,boarded_at AS boardedAt FROM standard_passengers WHERE booking_id=? AND cancelled_at IS NULL ORDER BY position',[id]);
    return {...b,simulated:true,paymentMethodLabel:({credit:'Tarjeta de crédito',debit:'Tarjeta de débito',transfer:'Transferencia bancaria'})[b.simulatedPaymentMethod]||'Pago de prueba',paymentLabel:b.paymentStatus==='refunded'?'Reembolso SIMULADO':'Pago SIMULADO confirmado',
      qrCodes:b.passengers.map(p=>`RUTASEC-STANDARD:${b.id}:${p.position}`)};
  }
  if(request.method==='GET'&&!fixed) {
    if(match[1])return {booking:await view(match[1])};
    const officeScope=" AND (sales_channel<>'office' OR EXISTS(SELECT 1 FROM standard_booking_details x JOIN organization_capabilities c ON c.operator_id=x.operator_id WHERE x.booking_id=bookings.id AND c.user_id=? AND c.capability IN('*','bookings.all')))";
    const cursor=new URL(request.url).searchParams.get('cursor');let before=null;
    if(cursor){before=await stmt(db,'SELECT created_at,id FROM bookings WHERE id=? AND customer_id=?'+officeScope,[cursor,user.id,user.id]).first();if(!before)throw failure('Página de historial no disponible',404);}
    const ids=await rows(db,`SELECT id FROM bookings WHERE customer_id=?${officeScope}${before?' AND (created_at<? OR (created_at=? AND id<?))':''} ORDER BY created_at DESC,id DESC LIMIT 21`,[user.id,user.id,...(before?[before.created_at,before.created_at,before.id]:[])]);
    return {bookings:await Promise.all(ids.slice(0,20).map(b=>view(b.id))),nextCursor:ids.length>20?ids[19].id:null};
  }
  if(request.method!=='POST')throw failure('Método no permitido',405);
  const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);
  let body;try{body=JSON.parse(raw);}catch{throw failure('JSON no válido');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw failure('Solicitud no válida');
  if(match[1]) {
    const b=await view(match[1]);
    if(body.action!=='cancel')throw failure('Acción no válida');
    if(b.status==='cancelled')return {booking:b};
    const departure=await stmt(db,'SELECT status FROM departures WHERE id=?',[b.departure_id]).first();
    const isOwner=!!await stmt(db,"SELECT 1 FROM organization_capabilities WHERE user_id=? AND operator_id=? AND capability IN('*','bookings.all')",[user.id,b.operatorId]).first();
    if((departure&&departure.status!=='published'||b.serviceStatus==='running')&&!isOwner)throw failure('La operadora debe gestionar la cancelación del viaje iniciado',409);
    if(b.serviceStatus==='completed'||departure?.status==='completed')throw failure('Servicio ya finalizado',409);
    if(b.passengers.some(p=>p.boardedAt))throw failure('No se puede cancelar un pasajero embarcado',409);
    try{
      await db.batch([
        stmt(db,`UPDATE bookings SET status='cancelled' WHERE id=? AND status='confirmed'
         AND NOT EXISTS(SELECT 1 FROM standard_tracking t WHERE (t.booking_id=bookings.id OR t.departure_id=bookings.departure_id) AND t.service_status='completed')
         AND (NOT EXISTS(SELECT 1 FROM standard_tracking t WHERE (t.booking_id=bookings.id OR t.departure_id=bookings.departure_id) AND t.service_status='running')
          OR EXISTS(SELECT 1 FROM organization_capabilities WHERE user_id=? AND operator_id=? AND capability IN('*','bookings.all')))`,[b.id,user.id,b.operatorId]),
        stmt(db,"UPDATE seat_claims SET status='released' WHERE booking_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id,b.id]),
        stmt(db,"UPDATE standard_vehicle_slots SET active=0 WHERE booking_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id,b.id]),
        stmt(db,"UPDATE payments SET status='refunded' WHERE booking_id=? AND status='paid' AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id,b.id]),
        stmt(db,"INSERT OR IGNORE INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) SELECT ?,id,?,'simulated_refund','{}' FROM payments WHERE booking_id=? AND status='refunded'",[crypto.randomUUID(),'cancel:'+b.id,b.id]),
        stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT ?,?,'booking',?,'cancelled_simulated_refund' WHERE EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id+':cancel',b.operatorId,b.id,b.id])]);
    }catch(error){if(String(error.message).includes('already_boarded'))throw failure('Pasajero ya embarcado',409);throw error;}
    const result=await view(b.id);if(result.status!=='cancelled')throw failure('El servicio cambió en otra sesión',409);return {booking:result};
  }
  if(fixed)return {booking:await view(await createPrivate(db,user,body,core,env))};
  if(typeof body.departureId!=='string')throw failure('Salida requerida');
  const d=await stmt(db,`SELECT d.*,r.operator_id,r.price_cents,COALESCE(dl.capacity,v.capacity) AS capacity FROM departures d JOIN route_offers r ON r.id=d.offer_id
    JOIN vehicles v ON v.id=d.vehicle_id LEFT JOIN standard_departure_layouts dl ON dl.departure_id=d.id JOIN operators o ON o.id=r.operator_id WHERE d.id=? AND d.status='published' AND r.active=1 AND v.status='active' AND o.status='approved' AND ${operatorScope(env)}`,[body.departureId]).first();
  if(!d||Date.parse(d.depart_at)<=Date.now())throw failure('Salida no disponible',409);
  const stops=await rows(db,'SELECT * FROM standard_departure_stops WHERE departure_id=? ORDER BY position',[d.id]),segment=tripSegment(stops,body.boardingStop,body.alightingStop,d.price_cents,failure);
  if(body.quotedPriceCents!==segment.price)throw failure('El precio cambió; revisa el total',409);
  if(!Array.isArray(body.seatNumbers)||!body.seatNumbers.length||body.seatNumbers.length>d.capacity||new Set(body.seatNumbers).size!==body.seatNumbers.length)throw failure('Asientos no válidos');
  const seats=body.seatNumbers.map(n=>integer(n,1,d.capacity,'Asiento'));
  if(!Array.isArray(body.passengers)||body.passengers.length!==seats.length)throw failure('Pasajeros no válidos');
  const names=body.passengers.map(name=>text(name,'Nombre de pasajero',80)),id=crypto.randomUUID(),paymentId=crypto.randomUUID();
  if(body.simulatedPaymentMethod&&!['credit','debit','transfer'].includes(body.simulatedPaymentMethod))throw failure('Método de pago simulado no válido');
  const operations=[
    stmt(db,"INSERT INTO bookings(id,customer_id,offer_id,departure_id,mode,service_at,passenger_count,amount_cents,status,confirmed_at) VALUES(?,?,?,?,'shared',?,?,?,'confirmed',CURRENT_TIMESTAMP)",[id,user.id,d.offer_id,d.id,new Date(Date.parse(d.depart_at)+segment.offset*60000).toISOString(),seats.length,segment.price*seats.length]),
    stmt(db,'INSERT INTO standard_booking_details(booking_id,operator_id,vehicle_id) VALUES(?,?,?)',[id,d.operator_id,d.vehicle_id]),
    stmt(db,"INSERT INTO payments(id,booking_id,provider,method,amount_cents,status,idempotency_key,paid_at) VALUES(?,?,'simulated',?,?,'paid',?,CURRENT_TIMESTAMP)",[paymentId,id,body.simulatedPaymentMethod==='transfer'?'bank_transfer':'card',segment.price*seats.length,user.id+':'+body.requestId]),stmt(db,"INSERT INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) VALUES(?,?,?,'simulated_method',?)",[crypto.randomUUID(),paymentId,'method:'+body.requestId,JSON.stringify({method:body.simulatedPaymentMethod||'credit'})])];
  operations.push(...bookingContacts(db,user,body,env,id,d.offer_id,d.vehicle_id,core));
  if(stops.length)operations.push(stmt(db,'INSERT INTO standard_booking_segments(booking_id,boarding_stop,alighting_stop,origin,destination,pickup_point,dropoff_point,boarding_offset) VALUES(?,?,?,?,?,?,?,?)',[id,segment.start,segment.end,segment.origin,segment.destination,segment.pickup,segment.dropoff,segment.offset]));
  operations.push(stmt(db,"INSERT INTO standard_passengers(booking_id,position,name,seat_number) SELECT ?,CAST(key AS INTEGER),json_extract(value,'$.name'),json_extract(value,'$.seat') FROM json_each(?)",[id,JSON.stringify(seats.map((seat,i)=>({seat,name:names[i]})))]),stmt(db,"INSERT INTO seat_claims(id,departure_id,booking_id,seat_number,status,start_stop,end_stop) SELECT ?||':'||key,?,?,CAST(value AS INTEGER),'confirmed',?,? FROM json_each(?)",[id,d.id,id,segment.start,segment.end,JSON.stringify(seats)]));
  let saved;
  try{saved=await command(db,user,body,'booking',operations,id);}
  catch(error){if(/seat_unavailable|UNIQUE constraint failed: seat_claims/.test(String(error.message)))throw failure('Uno de los asientos ya fue reservado',409);throw error;}
  return {booking:await view(saved)};
}
