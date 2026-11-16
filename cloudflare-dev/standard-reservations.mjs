export async function handleReservations(request, env, core) {
  const { identity, stmt, rows, failure, command, integer, text } = core;
  const user = await identity(request, env.DB), path = new URL(request.url).pathname;
  const match = path.match(/^\/api\/bookings(?:\/([0-9a-f-]{36}))?$/i);
  if (!match) throw failure('Recurso no encontrado', 404);
  const db = env.DB;
  async function view(id) {
    const b = await stmt(db, `SELECT b.*,r.origin,r.destination,o.display_name AS operatorName,v.model AS vehicle,
      m.operator_id AS operatorId,m.vehicle_id AS vehicleId,p.status AS paymentStatus
      FROM bookings b JOIN route_offers r ON r.id=b.offer_id JOIN standard_booking_details m ON m.booking_id=b.id
      JOIN operators o ON o.id=m.operator_id JOIN vehicles v ON v.id=m.vehicle_id JOIN payments p ON p.booking_id=b.id WHERE b.id=?`, [id]).first();
    if (!b) throw failure('Boleto no encontrado',404);
    if (b.customer_id!==user.id && !await stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role='owner'",[user.id,b.operatorId]).first()) throw failure('Boleto privado',403);
    b.passengers=await rows(db,'SELECT position,name,seat_number AS seatNumber,boarded_at AS boardedAt FROM standard_passengers WHERE booking_id=? ORDER BY position',[id]);
    return {...b,simulated:true,paymentLabel:b.paymentStatus==='refunded'?'Reembolso SIMULADO':'Pago SIMULADO confirmado',
      qrCodes:b.passengers.map(p=>`RUTASEC-STANDARD:${b.id}:${p.position}`)};
  }
  if(request.method==='GET') {
    if(match[1])return {booking:await view(match[1])};
    const ids=await rows(db,'SELECT id FROM bookings WHERE customer_id=? ORDER BY created_at DESC LIMIT 100',[user.id]);
    return {bookings:await Promise.all(ids.map(b=>view(b.id)))};
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
    if(departure&&departure.status!=='published')throw failure('La operadora debe gestionar la cancelación del viaje iniciado',409);
    if(b.passengers.some(p=>p.boardedAt))throw failure('No se puede cancelar un pasajero embarcado',409);
    try{
      await db.batch([
        stmt(db,"UPDATE bookings SET status='cancelled' WHERE id=? AND status='confirmed'",[b.id]),
        stmt(db,"UPDATE seat_claims SET status='released' WHERE booking_id=? AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id,b.id]),
        stmt(db,"UPDATE payments SET status='refunded' WHERE booking_id=? AND status='paid' AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='cancelled')",[b.id,b.id]),
        stmt(db,"INSERT OR IGNORE INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) SELECT ?,id,?,'simulated_refund','{}' FROM payments WHERE booking_id=? AND status='refunded'",[crypto.randomUUID(),'cancel:'+b.id,b.id])]);
    }catch(error){if(String(error.message).includes('already_boarded'))throw failure('Pasajero ya embarcado',409);throw error;}
    return {booking:await view(b.id)};
  }
  if(typeof body.departureId!=='string')throw failure('Salida requerida');
  const d=await stmt(db,`SELECT d.*,r.operator_id,r.price_cents,v.capacity FROM departures d JOIN route_offers r ON r.id=d.offer_id
    JOIN vehicles v ON v.id=d.vehicle_id WHERE d.id=? AND d.status='published' AND r.active=1 AND v.status='active'`,[body.departureId]).first();
  if(!d||Date.parse(d.depart_at)<=Date.now())throw failure('Salida no disponible',409);
  if(body.quotedPriceCents!==d.price_cents)throw failure('El precio cambió; revisa el total',409);
  if(!Array.isArray(body.seatNumbers)||!body.seatNumbers.length||body.seatNumbers.length>d.capacity||new Set(body.seatNumbers).size!==body.seatNumbers.length)throw failure('Asientos no válidos');
  const seats=body.seatNumbers.map(n=>integer(n,1,d.capacity,'Asiento'));
  if(!Array.isArray(body.passengers)||body.passengers.length!==seats.length)throw failure('Pasajeros no válidos');
  const names=body.passengers.map(name=>text(name,'Nombre de pasajero',80)),id=crypto.randomUUID(),paymentId=crypto.randomUUID();
  const operations=[
    stmt(db,"INSERT INTO bookings(id,customer_id,offer_id,departure_id,mode,service_at,passenger_count,amount_cents,status,confirmed_at) VALUES(?,?,?,?,'shared',?,?,?,'confirmed',CURRENT_TIMESTAMP)",[id,user.id,d.offer_id,d.id,d.depart_at,seats.length,d.price_cents*seats.length]),
    stmt(db,'INSERT INTO standard_booking_details(booking_id,operator_id,vehicle_id) VALUES(?,?,?)',[id,d.operator_id,d.vehicle_id]),
    stmt(db,"INSERT INTO payments(id,booking_id,provider,method,amount_cents,status,idempotency_key,paid_at) VALUES(?,?,'simulated','other',?,'paid',?,CURRENT_TIMESTAMP)",[paymentId,id,d.price_cents*seats.length,user.id+':'+body.requestId])];
  seats.forEach((seat,i)=>operations.push(
    stmt(db,'INSERT INTO standard_passengers(booking_id,position,name,seat_number) VALUES(?,?,?,?)',[id,i,names[i],seat]),
    stmt(db,"INSERT INTO seat_claims(id,departure_id,booking_id,seat_number,status) VALUES(?,?,?,?,'confirmed')",[crypto.randomUUID(),d.id,id,seat])));
  let saved;
  try{saved=await command(db,user,body,'booking',operations,id);}
  catch(error){if(/seat_unavailable|UNIQUE constraint failed: seat_claims/.test(String(error.message)))throw failure('Uno de los asientos ya fue reservado',409);throw error;}
  return {booking:await view(saved)};
}
