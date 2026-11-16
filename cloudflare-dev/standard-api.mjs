// Development identities use random bearer capabilities, stored hashed in D1.
// They are not commercial registration, email recovery or verified operators.
import { handleReservations } from './standard-reservations.mjs';
import { handleMarket } from './standard-market.mjs';
import { handlePremium } from './premium-api.mjs';
import { handleOperations } from './standard-operations.mjs';
export const failure = (message, status = 400) => Object.assign(new Error(message), { status });
export const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest(
  'SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
const uuid = value => typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
export function text(value, label, max = 120) {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > max) throw failure(label + ' no válido');
  return value.trim();
}
export function integer(value, min, max, label) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw failure(label + ' no válido');
  return value;
}
export const stmt = (db, sql, args = []) => db.prepare(sql).bind(...args);
export const rows = async (db, sql, args = []) => (await stmt(db, sql, args).all()).results;
export async function identity(request, db) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token || !/^[0-9a-f]{64}$/i.test(token)) throw failure('Acceso requerido', 401);
  const user = await stmt(db, 'SELECT u.id FROM standard_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND u.status=\'active\'', [await hash(token)]).first();
  if (!user) throw failure('Acceso no válido', 401);
  return user;
}
export async function owner(db, userId, operatorId) {
  if (!uuid(operatorId)) throw failure('Operadora no válida');
  if (!await stmt(db, "SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role='owner'", [userId, operatorId]).first()) throw failure('Sin permiso para esta operadora', 403);
}
export async function command(db, user, body, kind, operations, entityId) {
  if (!uuid(body.requestId)) throw failure('requestId requerido');
  const fingerprint = await hash(JSON.stringify(body));
  const prior = await stmt(db, 'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?', [user.id, body.requestId]).first();
  if (prior) {
    if (prior.kind !== kind || prior.fingerprint !== fingerprint) throw failure('Reintento con contenido distinto', 409);
    return prior.entity_id;
  }
  try {
    await db.batch([...operations,
      stmt(db, 'INSERT INTO standard_commands(user_id,request_id,kind,fingerprint,entity_id) VALUES(?,?,?,?,?)', [user.id, body.requestId, kind, fingerprint, entityId]),
      stmt(db, 'INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,?,?,?)', [crypto.randomUUID(), user.id, kind, entityId, 'created'])]);
    return entityId;
  } catch (error) {
    const saved = await stmt(db, 'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?', [user.id, body.requestId]).first();
    if (saved?.kind === kind && saved.fingerprint === fingerprint) return saved.entity_id;
    if (String(error.message).includes('vehicle_conflict')) throw failure('El vehículo ya tiene un servicio en ese horario', 409);
    if (String(error.message).includes('request_limit')) throw failure('Límite de 10 solicitudes abiertas; cancela alguna antes de crear otra', 429);
    throw error;
  }
}
const catalogSQL = `SELECT d.id, d.depart_at AS departAt,d.status,r.id AS offerId,r.operator_id AS operatorId,
 r.origin,r.destination,r.price_cents AS priceCents,o.display_name AS operatorName,
 v.id AS vehicleId,v.type AS vehicleType,v.model AS vehicle,v.capacity,
 v.capacity-(SELECT COUNT(*) FROM seat_claims sc WHERE sc.departure_id=d.id AND sc.status IN('held','confirmed')) AS available,
 (SELECT json_group_array(seat_number) FROM seat_claims sc WHERE sc.departure_id=d.id AND sc.status IN('held','confirmed')) AS reservedSeatsJson
 FROM departures d JOIN route_offers r ON r.id=d.offer_id JOIN operators o ON o.id=r.operator_id
 JOIN vehicles v ON v.id=d.vehicle_id WHERE d.status='published' AND r.active=1
 AND o.status='approved' AND v.status='active' AND d.depart_at>? ORDER BY d.depart_at LIMIT 200`;

export async function handleStandard(request, env) {
  const path = new URL(request.url).pathname, method = request.method;
  if (path === '/api/catalog' && method === 'GET') {
    return { departures: (await rows(env.DB, catalogSQL, [new Date().toISOString()])).map(({reservedSeatsJson,...d})=>({...d,reservedSeats:JSON.parse(reservedSeatsJson||'[]')})),
      routeOffers: await rows(env.DB, `SELECT r.id,r.operator_id AS operatorId,r.origin,r.destination,r.service_type AS serviceType,
       r.price_cents AS priceCents,o.display_name AS operatorName,v.id AS vehicleId,v.model AS vehicle,v.type AS vehicleType,v.capacity,rv.duration_minutes AS durationMinutes
       FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN standard_route_vehicles rv ON rv.offer_id=r.id
       JOIN vehicles v ON v.id=rv.vehicle_id WHERE r.active=1 AND o.status='approved' AND v.status='active' LIMIT 200`),
      environment: 'development', payments: 'simulated' };
  }
  if (path === '/api/sessions' && method === 'POST') {
    const id = crypto.randomUUID(), token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    await env.DB.batch([stmt(env.DB, 'INSERT INTO users(id,display_name) VALUES(?,?)', [id, 'Pasajero de desarrollo']),
      stmt(env.DB, 'INSERT INTO standard_sessions(token_hash,user_id) VALUES(?,?)', [await hash(token), id])]);
    return { token, userId: id, authentication: 'development-capability' };
  }
  if(path==='/api/premium'||path.startsWith('/api/premium/'))return handlePremium(request,env,{identity,owner,stmt,rows,failure,command,integer,text});
  if(path.startsWith('/api/bookings')||path==='/api/private-route-bookings')return handleReservations(request,env,{identity,stmt,rows,failure,command,integer,text});
  if(path.startsWith('/api/private-requests')||path.startsWith('/api/private-offers')||path==='/api/private-market')return handleMarket(request,env,{identity,stmt,rows,failure,owner,command,integer,text});
  if(path==='/api/operations'||path.startsWith('/api/trips/'))return handleOperations(request,env,{identity,stmt,rows,owner,failure,integer,
   cancelBooking:id=>handleReservations(new Request(new URL('/api/bookings/'+id,request.url),{method:'POST',headers:request.headers,body:JSON.stringify({action:'cancel'})}),env,{identity,stmt,rows,failure,command,integer,text}),
   cancelCustom:id=>handleMarket(new Request(new URL('/api/private-requests/'+id,request.url),{method:'POST',headers:request.headers,body:JSON.stringify({action:'cancel'})}),env,{identity,stmt,rows,failure,owner,command,integer,text})});
  if (!['/api/operator', '/api/operators', '/api/vehicles', '/api/route-offers', '/api/departures'].includes(path)) return null;
  const user = await identity(request, env.DB);
  if (path === '/api/operator' && method === 'GET') {
    const operators = await rows(env.DB, "SELECT o.* FROM operators o JOIN memberships m ON m.operator_id=o.id WHERE m.user_id=? AND m.role='owner'", [user.id]);
    const owned = `SELECT operator_id FROM memberships WHERE user_id=? AND role='owner'`;
    return { operators, vehicles: await rows(env.DB, `SELECT * FROM vehicles WHERE operator_id IN (${owned})`, [user.id]),
      routeOffers: await rows(env.DB, `SELECT r.*,rv.vehicle_id FROM route_offers r JOIN standard_route_vehicles rv ON rv.offer_id=r.id WHERE r.operator_id IN (${owned})`, [user.id]),
      departures: await rows(env.DB, `SELECT d.* FROM departures d JOIN route_offers r ON r.id=d.offer_id WHERE r.operator_id IN (${owned}) ORDER BY depart_at`, [user.id]) };
  }
  if (method !== 'POST') throw failure('Método no permitido', 405);
  if (Number(request.headers.get('Content-Length') || 0) > 16384) throw failure('Solicitud demasiado grande', 413);
  const raw = await request.text(); if (raw.length > 16384) throw failure('Solicitud demasiado grande', 413);
  let body; try { body = JSON.parse(raw); } catch { throw failure('JSON no válido'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw failure('Solicitud no válida');
  const id = crypto.randomUUID(); let saved;
  if (path === '/api/operators') {
    const name = text(body.name, 'Nombre');
    saved = await command(env.DB, user, body, 'operator', [
      stmt(env.DB, "INSERT INTO operators(id,legal_name,display_name,status) VALUES(?,?,?,'approved')", [id, name, name]),
      stmt(env.DB, "INSERT INTO memberships(user_id,operator_id,role) VALUES(?,?,'owner')", [user.id, id])], id);
  } else {
    await owner(env.DB, user.id, body.operatorId);
    if (path === '/api/vehicles') {
      if (!['auto','suv','van','minivan'].includes(body.type)) throw failure('Tipo de vehículo no válido');
      saved = await command(env.DB, user, body, 'vehicle', [stmt(env.DB, 'INSERT INTO vehicles(id,operator_id,type,model,capacity) VALUES(?,?,?,?,?)',
        [id, body.operatorId, body.type, text(body.model, 'Modelo'), integer(body.capacity, 1, 30, 'Capacidad')])], id);
    }
    if (path === '/api/route-offers') {
      const origin = text(body.origin, 'Origen'), destination = text(body.destination, 'Destino');
      if (origin.toLocaleLowerCase() === destination.toLocaleLowerCase()) throw failure('Origen y destino deben ser distintos');
      if (!['shared','private_fixed'].includes(body.serviceType)) throw failure('Modalidad no válida');
      const vehicle = await stmt(env.DB, "SELECT * FROM vehicles WHERE id=? AND operator_id=? AND status='active'", [body.vehicleId, body.operatorId]).first();
      if (!vehicle) throw failure('Vehículo ajeno o no disponible', 403);
      saved = await command(env.DB, user, body, 'offer', [stmt(env.DB, 'INSERT INTO route_offers(id,operator_id,origin,destination,service_type,vehicle_type,price_cents) VALUES(?,?,?,?,?,?,?)',
        [id, body.operatorId, origin, destination, body.serviceType, vehicle.type, integer(body.priceCents, 1, 1000000, 'Precio en centavos')]),
        stmt(env.DB, 'INSERT INTO standard_route_vehicles(offer_id,vehicle_id,duration_minutes) VALUES(?,?,?)', [id, vehicle.id,integer(body.durationMinutes??240,1,2880,'Duración')])], id);
    }
    if (path === '/api/departures') {
      const offer = await stmt(env.DB, `SELECT r.*,rv.vehicle_id FROM route_offers r JOIN standard_route_vehicles rv ON rv.offer_id=r.id
        WHERE r.id=? AND r.operator_id=? AND r.service_type='shared' AND r.active=1`, [body.offerId, body.operatorId]).first();
      if (!offer) throw failure('Oferta compartida ajena o inexistente', 403);
      const at = Date.parse(body.departAt);
      if (!Number.isFinite(at) || at <= Date.now() || at > Date.now() + 366 * 86400000) throw failure('Fecha futura no válida');
      const duration = integer(body.durationMinutes ?? 240, 1, 2880, 'Duración');
      saved = await command(env.DB, user, body, 'departure', [stmt(env.DB, 'INSERT INTO departures(id,offer_id,vehicle_id,depart_at) VALUES(?,?,?,?)', [id, offer.id, offer.vehicle_id, new Date(at).toISOString()]),
        stmt(env.DB, 'INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,departure_id) VALUES(?,?,?,?,?)', [crypto.randomUUID(), offer.vehicle_id, at, at + duration * 60000, id])], id);
    }
  }
  return { id: saved, environment: 'development' };
}
