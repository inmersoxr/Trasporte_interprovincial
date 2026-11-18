const DAY = 86400000;
const invalid = message => Object.assign(new Error(message), {status:400});
function calendarDate(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw invalid(label + ' no válida');
  const day = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0,10) !== value) throw invalid(label + ' no válida');
  return day;
}

export function planSchedule(body, now = Date.now()) {
  const start = calendarDate(body.startDate, 'Fecha inicial'), end = calendarDate(body.endDate, 'Fecha final');
  const today = calendarDate(new Date(now - 5 * 3600000).toISOString().slice(0,10), 'Fecha actual');
  if (body.timezone && body.timezone !== 'America/Guayaquil') throw invalid('Usa la hora de Ecuador continental');
  if (start < today || end < start || end > today + 365 * DAY) throw invalid('El periodo debe ser futuro y estar dentro del próximo año');
  if (end - start >= 90 * DAY) throw invalid('El periodo admite como máximo 90 días');
  if (!Array.isArray(body.weekdays) || !body.weekdays.length || body.weekdays.length > 7 || body.weekdays.some(d=>!Number.isInteger(d)||d<0||d>6) || new Set(body.weekdays).size !== body.weekdays.length) throw invalid('Selecciona días de la semana distintos');
  if (!Array.isArray(body.times) || !body.times.length || body.times.length > 12 || body.times.some(t=>typeof t!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) || new Set(body.times).size !== body.times.length) throw invalid('Indica horarios válidos y distintos');
  if (!Number.isSafeInteger(body.durationMinutes) || body.durationMinutes < 1 || body.durationMinutes > 2880) throw invalid('Duración no válida');
  const weekdays = [...body.weekdays].sort(), times = [...body.times].sort(), departures = [];
  for (let day = start; day <= end; day += DAY) {
    if (!weekdays.includes(new Date(day).getUTCDay())) continue;
    const date = new Date(day).toISOString().slice(0,10);
    for (const time of times) {
      const at = Date.parse(date + 'T' + time + ':00-05:00');
      if (at <= now) continue;
      departures.push({departAt:new Date(at).toISOString(),startsAt:at,endsAt:at+body.durationMinutes*60000});
    }
  }
  if (!departures.length) throw invalid('No hay salidas futuras en los días y horarios elegidos');
  if (departures.length > 90) throw invalid('Una programación admite hasta 90 salidas. Reduce el periodo o los horarios');
  if (departures.some((d,i)=>i>0&&d.startsAt<departures[i-1].endsAt)) throw invalid('Los horarios se cruzan para el mismo vehículo. Usa otro vehículo u otros horarios');
  return {timezone:'America/Guayaquil',startDate:body.startDate,endDate:body.endDate,weekdays,times,durationMinutes:body.durationMinutes,departures};
}

export async function handleRecurring(request, env, core) {
  const {identity,owner,stmt,rows,failure,command,hash} = core, db = env.DB;
  const user = await identity(request,db), url = new URL(request.url), path = url.pathname;
  const match = path.match(/^\/api\/recurring-schedules(?:\/(preview|[0-9a-f-]{36}))?$/i);
  if (!match) throw failure('Programación no encontrada',404);
  const item = match[1];
  const select = `SELECT s.*,r.origin,r.destination,r.price_cents AS priceCents,v.model AS vehicle,v.capacity,
    (SELECT COUNT(*) FROM departures WHERE schedule_id=s.id) AS departureCount,
    (SELECT COUNT(*) FROM departures WHERE schedule_id=s.id AND status='published' AND depart_at>?) AS upcomingCount,
    (SELECT COUNT(*) FROM departures d WHERE schedule_id=s.id AND d.status='published' AND d.depart_at>?
      AND EXISTS(SELECT 1 FROM bookings b WHERE b.departure_id=d.id AND b.status IN('payment_pending','confirmed'))) AS retainedCount
    FROM standard_recurring_schedules s JOIN route_offers r ON r.id=s.offer_id JOIN vehicles v ON v.id=s.vehicle_id`;
  const present = row => { const {weekdays_json,times_json,...rest}=row; return {...rest,weekdays:JSON.parse(weekdays_json),times:JSON.parse(times_json)}; };
  async function one(id) {
    const now = new Date().toISOString(), row = await stmt(db,select+' WHERE s.id=?',[now,now,id]).first();
    if (!row) throw failure('Programación no encontrada',404);
    await owner(db,user.id,row.operator_id);
    return {schedule:present(row)};
  }
  if (request.method === 'GET') {
    if (item && item !== 'preview') return one(item);
    if (item) throw failure('Método no permitido',405);
    const op = url.searchParams.get('operatorId'); await owner(db,user.id,op);
    const now = new Date().toISOString();
    return {schedules:(await rows(db,select+' WHERE s.operator_id=? ORDER BY s.created_at DESC,s.id LIMIT 100',[now,now,op])).map(present)};
  }
  if (request.method !== 'POST') throw failure('Método no permitido',405);
  const raw = await request.text(); if (raw.length > 8192) throw failure('Solicitud demasiado grande',413);
  let body; try { body=JSON.parse(raw); } catch { throw failure('Solicitud no válida'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure('Solicitud no válida');
  await owner(db,user.id,body.operatorId);
  if (item !== 'preview' && (typeof body.requestId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.requestId))) throw failure('requestId requerido');

  if (item && item !== 'preview') {
    const current = await one(item);
    if (current.schedule.operator_id !== body.operatorId) throw failure('Programación de otra operadora',403);
    if (body.action !== 'stop') throw failure('Acción no válida');
    const now = new Date().toISOString();
    await command(db,user,body,'recurring_stop',[
      stmt(db,"UPDATE standard_recurring_schedules SET status='stopped' WHERE id=?",[item]),
      stmt(db,`INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event)
        SELECT d.id||':recurring-stop',?,'departure',d.id,'recurring_cancelled_without_bookings' FROM departures d
        WHERE d.schedule_id=? AND d.status='published' AND d.depart_at>?
        AND NOT EXISTS(SELECT 1 FROM bookings WHERE departure_id=d.id AND status IN('payment_pending','confirmed'))
        AND NOT EXISTS(SELECT 1 FROM seat_claims WHERE departure_id=d.id AND status IN('held','confirmed'))`,[body.operatorId,item,now]),
      stmt(db,`UPDATE departures SET status='cancelled' WHERE schedule_id=? AND status='published' AND depart_at>?
        AND NOT EXISTS(SELECT 1 FROM bookings WHERE departure_id=departures.id AND status IN('payment_pending','confirmed'))
        AND NOT EXISTS(SELECT 1 FROM seat_claims WHERE departure_id=departures.id AND status IN('held','confirmed'))`,[item,now]),
      stmt(db,"UPDATE standard_vehicle_slots SET active=0 WHERE departure_id IN(SELECT id FROM departures WHERE schedule_id=? AND status='cancelled')",[item])
    ],item);
    return {...await one(item),notice:'Programación detenida. Las salidas futuras sin reservas se retiraron; las que tienen reservas se conservan y se gestionan individualmente.'};
  }

  if (!item) {
    const previous = await stmt(db,'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?',[user.id,body.requestId??null]).first();
    if (previous) {
      if (previous.kind !== 'recurring_schedule' || previous.fingerprint !== await hash(JSON.stringify(body))) throw failure('Reintento con contenido distinto',409);
      return one(previous.entity_id);
    }
  }
  const offer = await stmt(db,`SELECT r.*,rv.vehicle_id,v.model,v.capacity FROM route_offers r
    JOIN standard_route_vehicles rv ON rv.offer_id=r.id JOIN vehicles v ON v.id=rv.vehicle_id JOIN operators o ON o.id=r.operator_id
    WHERE r.id=? AND r.operator_id=? AND r.service_type='shared' AND r.active=1 AND v.status='active' AND o.status='approved'`,[typeof body.offerId==='string'?body.offerId:'',body.operatorId]).first();
  if (!offer) throw failure('Selecciona una ruta compartida activa de tu operadora',403);
  const plan = planSchedule(body), first = plan.departures[0], last = plan.departures.at(-1);
  const occupied = await rows(db,'SELECT starts_at,ends_at FROM standard_vehicle_slots WHERE vehicle_id=? AND active=1 AND starts_at<? AND ends_at>?',[offer.vehicle_id,last.endsAt,first.startsAt]);
  if (plan.departures.some(d=>occupied.some(s=>s.starts_at<d.endsAt&&s.ends_at>d.startsAt))) throw failure('El vehículo ya tiene un viaje o mantenimiento en uno de esos horarios. No se publicó ninguna salida',409);
  if (item === 'preview') return {preview:{...plan,count:plan.departures.length,origin:offer.origin,destination:offer.destination,vehicle:offer.model,capacity:offer.capacity,priceCents:offer.price_cents}};

  const id = crypto.randomUUID();
  const operations = [stmt(db,`INSERT INTO standard_recurring_schedules(id,operator_id,offer_id,vehicle_id,timezone,start_date,end_date,weekdays_json,times_json,duration_minutes)
    VALUES(?,?,?,?,?,?,?,?,?,?)`,[id,body.operatorId,offer.id,offer.vehicle_id,plan.timezone,plan.startDate,plan.endDate,JSON.stringify(plan.weekdays),JSON.stringify(plan.times),plan.durationMinutes])];
  // Bounded chunks stay below D1's parameter limit and use a single atomic batch.
  for (let offset=0; offset<plan.departures.length; offset+=12) {
    const chunk = plan.departures.slice(offset,offset+12).map(d=>({...d,id:crypto.randomUUID(),slotId:crypto.randomUUID()}));
    operations.push(stmt(db,'INSERT INTO departures(id,offer_id,vehicle_id,depart_at,schedule_id) VALUES '+chunk.map(()=>'(?,?,?,?,?)').join(','),chunk.flatMap(d=>[d.id,offer.id,offer.vehicle_id,d.departAt,id])));
    operations.push(stmt(db,'INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,departure_id) VALUES '+chunk.map(()=>'(?,?,?,?,?)').join(','),chunk.flatMap(d=>[d.slotId,offer.vehicle_id,d.startsAt,d.endsAt,d.id])));
  }
  try { return one(await command(db,user,body,'recurring_schedule',operations,id)); }
  catch (error) {
    if (/schedule_unavailable|idx_standard_recurring_occurrence/.test(error.message)) throw failure('La programación cambió; actualiza y vuelve a intentarlo',409);
    throw error;
  }
}
