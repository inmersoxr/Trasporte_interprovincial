import {serviceChanges} from './standard-changes.mjs';
import {manage,role} from './standard-permissions.mjs';
import {notifications} from './standard-notifications.mjs';
import {customSettings} from './standard-custom-settings.mjs';
import {handleReviews} from './standard-reviews.mjs';
import {handlePublicProfile} from './standard-public-profile.mjs';
import {cookie,COOKIE,requireOrigin} from './identity.mjs';
import {publicMiniapp} from './premium-profiles.mjs';
// Development identities use random bearer capabilities, stored hashed in D1.
// They are not commercial registration, email recovery or verified operators.
import { handleReservations } from './standard-reservations.mjs';
import { handleMarket } from './standard-market.mjs';
import { handlePremium } from './premium-api.mjs';
import { handleOperations } from './standard-operations.mjs';
import { handleRecurring } from './standard-recurring.mjs';
import {catalog,operatorReady,vehicleReady} from './standard-catalog.mjs';
import {handleOnboarding} from './standard-onboarding.mjs';
import {cities} from './standard/cities.mjs';
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
  const bearer=request.headers.get('Authorization');
  const token = bearer?bearer.replace(/^Bearer /, ''):cookie(request,COOKIE);
  if(!bearer&&token&&!['GET','HEAD'].includes(request.method))requireOrigin(request,failure);
  if (!token || !/^[0-9a-f]{64}$/i.test(token)) throw failure('Acceso requerido', 401);
  const user = await stmt(db, 'SELECT u.id FROM standard_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND u.status=\'active\' AND (s.expires_at IS NULL OR s.expires_at>?)', [await hash(token),Date.now()]).first();
  if (!user) throw failure('Acceso no válido', 401);
  return user;
}
export async function verifiedIdentity(request, env) {
  const user = await identity(request, env.DB);
  // Synthetic identities are allowed only in an explicitly configured QA runtime.
  if (env.ALLOW_DEVELOPMENT_AUTH === 'true') return user;
  if (request.headers.has('Authorization')) throw failure('Inicia sesión con tu cuenta de RutasEC',403);
  const verified = await stmt(env.DB, `SELECT 1 FROM standard_sessions WHERE token_hash=? AND user_id=? AND expires_at>?
    AND (EXISTS(SELECT 1 FROM auth_email_accounts WHERE user_id=? AND verified_at IS NOT NULL)
    OR EXISTS(SELECT 1 FROM auth_identities WHERE user_id=? AND provider='google' AND email IS NOT NULL))`,
    [await hash(cookie(request,COOKIE)),user.id,Date.now(),user.id,user.id]).first();
  if (!verified) throw failure('Inicia sesión con una cuenta verificada para continuar', 403);
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
    if (String(error.message).includes('assignment_conflict')) throw failure('La asignación cambió; actualiza los miembros y vehículos',409);
    if (String(error.message).includes('request_limit')) throw failure('Límite de 10 solicitudes abiertas; cancela alguna antes de crear otra', 429);
    if (String(error.message).includes('operator_not_ready')) throw failure('La operadora, el conductor o el vehículo necesitan revisión vigente para publicar o reservar',409);
    throw error;
  }
}
export async function handleStandard(request, env) {
  const path = new URL(request.url).pathname, method = request.method;
  const authenticate = request => verifiedIdentity(request, env);
  if(['/api/route-change','/api/departure-change','/api/booking-change','/api/private-service-change'].includes(path))return serviceChanges(request,env,{identity:authenticate,stmt,rows,failure,integer,text,command});
  if(path.startsWith('/api/notifications'))return notifications(request,env,{identity:authenticate,stmt,rows,failure});
  if(path==='/api/custom-settings')return customSettings(request,env,{identity:authenticate,stmt,rows,failure,command});
  if(path.startsWith('/api/reviews')||path.startsWith('/api/operator-reviews/'))return handleReviews(request,env,{identity:authenticate,stmt,rows,failure,command,integer,text,hash});
  if(path==='/api/me'&&method==='GET'){const user=await authenticate(request);return stmt(env.DB,'SELECT id,display_name FROM users WHERE id=?',[user.id]).first();}
  if(path.startsWith('/api/miniapps/'))return publicMiniapp(request,env,{stmt,rows,failure});
  if (path === '/api/catalog' && method === 'GET') {
    return catalog(request,env,{rows,failure});
  }
  if (path === '/api/sessions' && method === 'POST') {
    if (env.ALLOW_DEVELOPMENT_AUTH !== 'true') throw failure('Usa tu cuenta de RutasEC para iniciar sesión', 403);
    const id = crypto.randomUUID(), token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    await env.DB.batch([stmt(env.DB, 'INSERT INTO users(id,display_name) VALUES(?,?)', [id, 'Pasajero de desarrollo']),
      stmt(env.DB, 'INSERT INTO standard_sessions(token_hash,user_id) VALUES(?,?)', [await hash(token), id])]);
    return { token, userId: id, authentication: 'development-capability' };
  }
  if(['/api/operator-onboarding','/api/operator-profile','/api/operator-drivers','/api/vehicle-details','/api/operator-documents','/api/operator-submit'].includes(path)||path.startsWith('/api/operator-documents/'))return handleOnboarding(request,env,{identity:authenticate,owner:(db,u,o)=>manage(db,u,o,failure),stmt,rows,failure,command,integer,text,hash});
  if(['/api/operator-public-profile','/api/operator-public-media'].includes(path)||path.startsWith('/api/operator-public-media/'))return handlePublicProfile(request,env,{identity:authenticate,stmt,rows,failure,text,integer,hash});
  if(path==='/api/premium'||path.startsWith('/api/premium/'))return handlePremium(request,env,{identity:authenticate,owner,stmt,rows,failure,command,integer,text,hash});
  if(path==='/api/recurring-schedules'||path.startsWith('/api/recurring-schedules/'))return handleRecurring(request,env,{identity:authenticate,owner:(db,u,o)=>role(db,u,o,failure).then(r=>{if(!['owner','admin','dispatcher'].includes(r))throw failure('Sin permiso para programar viajes',403);}),stmt,rows,failure,command,hash});
  if(path.startsWith('/api/bookings')||path==='/api/private-route-bookings')return handleReservations(request,env,{identity:authenticate,stmt,rows,failure,command,integer,text});
  if(path.startsWith('/api/private-requests')||path.startsWith('/api/private-offers')||path==='/api/private-market')return handleMarket(request,env,{identity:authenticate,stmt,rows,failure,owner:(db,u,o)=>{return role(db,u,o,failure).then(r=>{if(!['owner','admin','dispatcher'].includes(r))throw failure('Sin permiso para cotizar',403);});},command,integer,text});
  if(path==='/api/operations'||path.startsWith('/api/operations/')||path.startsWith('/api/trips/'))return handleOperations(request,env,{identity:authenticate,stmt,rows,owner,failure,integer,
   cancelBooking:id=>handleReservations(new Request(new URL('/api/bookings/'+id,request.url),{method:'POST',headers:request.headers,body:JSON.stringify({action:'cancel'})}),env,{identity:authenticate,stmt,rows,failure,command,integer,text}),
   cancelCustom:id=>handleMarket(new Request(new URL('/api/private-requests/'+id,request.url),{method:'POST',headers:request.headers,body:JSON.stringify({action:'cancel'})}),env,{identity:authenticate,stmt,rows,failure,owner:(db,u,o)=>{return role(db,u,o,failure).then(r=>{if(!['owner','admin','dispatcher'].includes(r))throw failure('Sin permiso para cotizar',403);});},command,integer,text})});
  if (!['/api/operator', '/api/operators', '/api/vehicles', '/api/route-offers', '/api/departures'].includes(path)) return null;
  const user = await authenticate(request);
  if (path === '/api/operator' && method === 'GET') {
    const operators = await rows(env.DB, "SELECT o.*,m.role AS memberRole FROM operators o JOIN memberships m ON m.operator_id=o.id WHERE m.user_id=?", [user.id]);
    const owned = `SELECT operator_id FROM memberships WHERE user_id=?`;
    const vehicleScope=` AND (EXISTS(SELECT 1 FROM memberships m WHERE m.operator_id=vehicles.operator_id AND m.user_id=? AND m.role<>'driver') OR id IN(SELECT vehicle_id FROM premium_assignments WHERE driver_user_id=?))`;
    const dashboard={ operators, vehicles: await rows(env.DB, `SELECT * FROM vehicles WHERE operator_id IN (${owned})${vehicleScope}`, [user.id,user.id,user.id]),
      routeOffers: await rows(env.DB, `SELECT r.*,rv.vehicle_id FROM route_offers r JOIN standard_route_vehicles rv ON rv.offer_id=r.id WHERE r.operator_id IN (${owned})`, [user.id]),
      departures: await rows(env.DB, `SELECT d.* FROM departures d JOIN route_offers r ON r.id=d.offer_id WHERE r.operator_id IN (${owned}) ORDER BY depart_at`, [user.id]) };
    const vehicleIds=new Set(dashboard.vehicles.map(v=>v.id));dashboard.routeOffers=dashboard.routeOffers.filter(r=>vehicleIds.has(r.vehicle_id));dashboard.departures=dashboard.departures.filter(d=>vehicleIds.has(d.vehicle_id));return dashboard;
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
      stmt(env.DB, "INSERT INTO operators(id,legal_name,display_name,status,data_scope) VALUES(?,?,?,?,?)", [id, name, name,env.ALLOW_DEVELOPMENT_AUTH==='true'?'approved':'pending',env.ALLOW_DEVELOPMENT_AUTH==='true'?'qa':'alpha']),
      stmt(env.DB, "INSERT INTO memberships(user_id,operator_id,role) VALUES(?,?,'owner')", [user.id, id])], id);
  } else {
    if(path==='/api/departures'){if(!['owner','admin','dispatcher'].includes(await role(env.DB,user.id,body.operatorId,failure)))throw failure('Sin permiso para publicar salidas',403);}else await manage(env.DB, user.id, body.operatorId,failure);
    if (path === '/api/vehicles') {
      if (!['auto','suv','van','minivan'].includes(body.type)) throw failure('Tipo de vehículo no válido');
      saved = await command(env.DB, user, body, 'vehicle', [stmt(env.DB, 'INSERT INTO vehicles(id,operator_id,type,model,capacity,status) VALUES(?,?,?,?,?,?)',
        [id, body.operatorId, body.type, text(body.model, 'Modelo'), integer(body.capacity, 1, 30, 'Capacidad'),env.ALLOW_DEVELOPMENT_AUTH==='true'?'active':'pending'])], id);
    }
    if (path === '/api/route-offers') {
      const origin = text(body.origin, 'Origen'), destination = text(body.destination, 'Destino');
      if (origin.toLocaleLowerCase() === destination.toLocaleLowerCase()) throw failure('Origen y destino deben ser distintos');
      if (!['shared','private_fixed'].includes(body.serviceType)) throw failure('Modalidad no válida');
      if(env.ALLOW_DEVELOPMENT_AUTH!=='true'&&(!cities.includes(origin)||!cities.includes(destination)))throw failure('Selecciona ciudades del catálogo de Ecuador');
      const pickup=env.ALLOW_DEVELOPMENT_AUTH==='true'&&!body.pickupPoint?'':text(body.pickupPoint,'Punto de encuentro',250),dropoff=env.ALLOW_DEVELOPMENT_AUTH==='true'&&!body.dropoffPoint?'':text(body.dropoffPoint,'Punto de llegada',250);
      const vehicle = await stmt(env.DB, `SELECT v.* FROM vehicles v JOIN operators o ON o.id=v.operator_id WHERE v.id=? AND v.operator_id=? AND v.status='active' AND o.status='approved' AND ${operatorReady()} AND ${vehicleReady()}`, [body.vehicleId, body.operatorId]).first();
      if (!vehicle) throw failure('Vehículo ajeno o no disponible', 403);
      saved = await command(env.DB, user, body, 'offer', [stmt(env.DB, 'INSERT INTO route_offers(id,operator_id,origin,destination,service_type,vehicle_type,price_cents,pickup_point,dropoff_point) VALUES(?,?,?,?,?,?,?,?,?)',
        [id, body.operatorId, origin, destination, body.serviceType, vehicle.type, integer(body.priceCents, 1, 1000000, 'Precio en centavos'),pickup,dropoff]),
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
