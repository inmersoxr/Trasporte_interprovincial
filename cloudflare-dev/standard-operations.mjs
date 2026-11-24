import {pageCursor,nextPage,cursorClause} from './standard-pagination.mjs';
import {role,operate,visibleService} from './standard-permissions.mjs';
import {prepareRoad,tripSnapshot,applyTripCommand,ROUTE_ID} from '../shared/trip-core.mjs';
import route from './out/reference-route.mjs';
import {cookie,COOKIE} from './identity.mjs';
import {boardPassenger,boardingWindow} from './standard-boarding.mjs';
const road=prepareRoad(route),validId=s=>typeof s==='string'&&/^[0-9a-f-]{36}$/i.test(s);
const notice='Simulación de referencia Cuenca–Guayaquil; no es GPS ni representa necesariamente la ruta contratada. SOS y avisos son DEMO, sin servicios de emergencia.';
export async function handleOperations(request,env,core){
 const {identity,stmt,rows,owner,failure,integer}=core,db=env.DB,url=new URL(request.url),path=url.pathname;
 const tripMatch=path.match(/^\/api\/trips\/([0-9a-f-]{36})(\/commands)?$/i);
 async function permissions(row){
  if(!request.headers.get('Authorization')&&!cookie(request,COOKIE))return {control:false,passenger:false};
  let user;try{user=await identity(request,db);}catch(error){if([401,403].includes(error.status))return{control:false,passenger:false};throw error;}
  const control=!!await stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role IN('owner','admin','dispatcher')",[user.id,row.operator_id]).first();
  const passenger=!!await stmt(db,`SELECT 1 FROM bookings WHERE customer_id=? AND status='confirmed' AND (id=? OR departure_id=?)
   UNION SELECT 1 FROM standard_custom_bookings WHERE customer_id=? AND id=? AND status<>'cancelled' LIMIT 1`,[user.id,row.booking_id,row.departure_id,user.id,row.custom_booking_id]).first();
  return {control,passenger};
 }
 const publicView=async row=>row.mode==='operations'?{trip:JSON.parse(row.state_json),snapshot:null,permissions:await permissions(row),serverNow:Date.now(),source:'operations',simulated:false,notice:'Estado operativo registrado por tu operadora. No es seguimiento GPS.'}:({trip:JSON.parse(row.state_json),snapshot:tripSnapshot(JSON.parse(row.state_json),road),permissions:await permissions(row),serverNow:Date.now(),expiresAt:null,notice,source:'simulator',simulated:true});
 if(tripMatch){
  const row=await stmt(db,'SELECT * FROM standard_tracking WHERE id=?',[tripMatch[1]]).first();if(!row)throw failure('Seguimiento no encontrado',404);
  if(request.method==='GET'&&!tripMatch[2])return publicView(row);
  if(request.method!=='POST'||!tripMatch[2])throw failure('Método no permitido',405);
  if(row.mode==='operations')throw failure('El estado del servicio se gestiona desde Operaciones; no hay simulación ni SOS automático',409);
  const access=await permissions(row),raw=await request.text();if(raw.length>4096)throw failure('Solicitud demasiado grande',413);
  let b;try{b=JSON.parse(raw);}catch{throw failure('JSON no válido');}if(!b||typeof b!=='object')throw failure('Solicitud no válida');
  if(!access.control&&!(access.passenger&&['sos','close-sos'].includes(b.action)))throw failure('Este acceso no puede controlar el seguimiento',403);
  if(!validId(b.requestId))throw failure('requestId no válido');
  if(row.service_status==='completed'&&['start','pause','speed','reset'].includes(b.action))throw failure('Servicio ya finalizado',409);
  const state=JSON.parse(row.state_json);
  if(state.events.some(e=>e.id===b.requestId))return publicView(row);
  if(b.expectedRevision!==row.revision)throw failure('Seguimiento actualizado por otra sesión',409);
  let next;try{next=applyTripCommand(state,{action:b.action,multiplier:b.multiplier,requestId:b.requestId,alertId:b.action==='sos'?crypto.randomUUID():b.alertId},road);}catch(error){throw failure(error.message);}
  if(next===state)return publicView(row);
  const result=await stmt(db,'UPDATE standard_tracking SET state_json=?,revision=? WHERE id=? AND revision=?',[JSON.stringify(next),next.revision,row.id,row.revision]).run();
  if(result.meta.changes!==1)throw failure('Otra sesión actualizó el seguimiento; reintenta',409);
  return publicView({...row,state_json:JSON.stringify(next),revision:next.revision});
 }
 const user=await identity(request,db);
 if(path==='/api/operations/history'&&request.method==='GET'){
  const op=url.searchParams.get('operatorId'),cursor=url.searchParams.get('cursor');const memberRole=await role(db,user.id,op,failure);let before=null;
  if(cursor){before=await stmt(db,'SELECT id,at FROM standard_operational_events WHERE id=? AND operator_id=?',[cursor,op]).first();if(!before)throw failure('Página de historial no disponible',404);}
  const events=await rows(db,`SELECT * FROM standard_operational_events WHERE operator_id=?${memberRole==='driver'?' AND entity_id IN('+visibleService+')':''}${before?' AND (at<? OR (at=? AND id<?))':''} ORDER BY at DESC,id DESC LIMIT 101`,[op,...(memberRole==='driver'?[user.id,user.id,user.id]:[]),...(before?[before.at,before.at,before.id]:[])]);
  return{events:events.slice(0,100),nextCursor:events.length>100?events[99].id:null};
 }
 if(path==='/api/operations'&&request.method==='GET'){
  const op=url.searchParams.get('operatorId'),memberRole=await role(db,user.id,op,failure),scope=memberRole==='driver'?' AND id IN('+visibleService+')':'';
  const paging=pageCursor(url.searchParams.get('cursor'),failure),dc=cursorClause(paging.dep,'d.depart_at','d.id'),bc=cursorClause(paging.booking,'b.created_at','b.id'),cc=cursorClause(paging.custom,'c.created_at','c.id');
  const visible=memberRole==='driver'?' AND v.id IN(SELECT vehicle_id FROM premium_assignments WHERE driver_user_id=?)':'';
  const departures=await rows(db,`SELECT d.*,r.origin,r.destination,t.id AS liveId,t.service_status AS serviceStatus FROM departures d JOIN vehicles v ON v.id=d.vehicle_id JOIN route_offers r ON r.id=d.offer_id LEFT JOIN standard_tracking t ON t.departure_id=d.id WHERE r.operator_id=?${visible}${dc.sql} ORDER BY d.depart_at DESC,d.id DESC LIMIT 101`,[op,...(memberRole==='driver'?[user.id]:[]),...dc.args]);
  const bookings=await rows(db,`SELECT b.*,r.origin,r.destination,v.model AS vehicle,c.passenger_phone AS contactPhone,c.passenger_email AS contactEmail,c.pickup_point AS pickupPoint,c.dropoff_point AS dropoffPoint,t.id AS liveId,t.service_status AS serviceStatus FROM bookings b
   JOIN standard_booking_details m ON m.booking_id=b.id JOIN route_offers r ON r.id=b.offer_id JOIN vehicles v ON v.id=m.vehicle_id
   LEFT JOIN standard_booking_contacts c ON c.booking_id=b.id LEFT JOIN standard_tracking t ON t.booking_id=b.id WHERE m.operator_id=?${visible}${bc.sql} ORDER BY b.created_at DESC,b.id DESC LIMIT 101`,[op,...(memberRole==='driver'?[user.id]:[]),...bc.args]);
  const passengers=await rows(db,'SELECT p.* FROM standard_passengers p JOIN standard_booking_details m ON m.booking_id=p.booking_id WHERE m.operator_id=? AND p.cancelled_at IS NULL',[op]);
  const custom=await rows(db,`SELECT c.*,r.origin,r.destination,t.id AS liveId FROM standard_custom_bookings c JOIN vehicles v ON v.id=c.vehicle_id JOIN private_requests r ON r.id=c.request_id LEFT JOIN standard_tracking t ON t.custom_booking_id=c.id WHERE c.operator_id=?${visible}${cc.sql} ORDER BY c.created_at DESC,c.id DESC LIMIT 101`,[op,...(memberRole==='driver'?[user.id]:[]),...cc.args]);
  const tracks=await rows(db,'SELECT id,state_json FROM standard_tracking WHERE operator_id=?',[op]);
  const allowed=memberRole==='driver'?new Set((await rows(db,visibleService,[user.id,user.id,user.id])).map(x=>x.id)):null;
  const cursor=nextPage({dep:departures.length>100?{time:departures[99].depart_at,id:departures[99].id}:false,booking:bookings.length>100?{time:bookings[99].created_at,id:bookings[99].id}:false,custom:custom.length>100?{time:custom[99].created_at,id:custom[99].id}:false});
  const ds=departures.slice(0,100).filter(d=>!allowed||allowed.has(d.id)),bs=bookings.slice(0,100).filter(b=>!allowed||allowed.has(b.id)),cs=custom.slice(0,100).filter(b=>!allowed||allowed.has(b.id));
  return {nextCursor:cursor,departures:ds,bookings:bs.map(b=>({...b,passengers:passengers.filter(p=>p.booking_id===b.id)})),custom:cs,
   alerts:tracks.filter(t=>memberRole!=='driver').flatMap(t=>JSON.parse(t.state_json).alerts.filter(a=>a.status!=='closed').map(a=>({...a,tripId:t.id}))),
   history:await rows(db,'SELECT * FROM standard_operational_events WHERE operator_id=?'+(allowed?' AND entity_id IN(SELECT value FROM json_each(?))':'')+' ORDER BY at DESC LIMIT 100',allowed?[op,JSON.stringify([...allowed])]:[op]),notifications:'DEMO dentro de la app; sin WhatsApp automático',simulated:true};
 }
 if(path!=='/api/operations'||request.method!=='POST')throw failure('Método no permitido',405);
 const raw=await request.text();if(raw.length>8192)throw failure('Solicitud demasiado grande',413);
 let b;try{b=JSON.parse(raw);}catch{throw failure('JSON no válido');}if(!b||typeof b!=='object')throw failure('Solicitud no válida');
 await role(db,user.id,b.operatorId,failure);
 if(b.action==='board'){const id=String(b.code||'').split(':')[1],kind=String(b.code).includes('CUSTOM')?'custom':'booking';const row=kind==='custom'?await stmt(db,'SELECT vehicle_id FROM standard_custom_bookings WHERE id=? AND operator_id=?',[id,b.operatorId]).first():await stmt(db,'SELECT vehicle_id FROM standard_booking_details WHERE booking_id=? AND operator_id=?',[id,b.operatorId]).first();await operate(db,user.id,b.operatorId,row?.vehicle_id,failure);return boardPassenger(env,{...core,actorUserId:user.id},b);}
 if(!validId(b.id)||!['departure','booking','custom'].includes(b.kind))throw failure('Servicio no válido');
 const column={departure:'departure_id',booking:'booking_id',custom:'custom_booking_id'}[b.kind];
 let target;
 if(b.kind==='departure')target=await stmt(db,'SELECT d.*,r.operator_id FROM departures d JOIN route_offers r ON r.id=d.offer_id WHERE d.id=?',[b.id]).first();
 if(b.kind==='booking')target=await stmt(db,'SELECT b.*,m.operator_id FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id WHERE b.id=?',[b.id]).first();
 if(b.kind==='custom')target=await stmt(db,'SELECT * FROM standard_custom_bookings WHERE id=?',[b.id]).first();
 if(!target||target.operator_id!==b.operatorId)throw failure('Servicio de otra operadora',403);
 const actorRole=await operate(db,user.id,b.operatorId,target.vehicle_id|| (b.kind==='booking'?(await stmt(db,'SELECT vehicle_id FROM standard_booking_details WHERE booking_id=?',[b.id]).first())?.vehicle_id:null),failure);
 if(b.action==='cancel'){
  if(actorRole==='driver')throw failure('La administración de la operadora gestiona las cancelaciones',403);
  if(b.kind==='booking')return core.cancelBooking(b.id);
  if(b.kind==='custom')return core.cancelCustom(target.request_id);
  if(target.status==='cancelled')return {status:'cancelled'};
  if(target.status!=='published')throw failure('Solo se cancela una salida no iniciada',409);
  try{await db.batch([
   stmt(db,"UPDATE departures SET status='cancelled' WHERE id=? AND status='published'",[target.id]),
   stmt(db,"UPDATE bookings SET status='cancelled' WHERE departure_id=? AND status='confirmed' AND EXISTS(SELECT 1 FROM departures WHERE id=? AND status='cancelled')",[target.id,target.id]),
   stmt(db,"UPDATE seat_claims SET status='released' WHERE departure_id=? AND EXISTS(SELECT 1 FROM departures WHERE id=? AND status='cancelled')",[target.id,target.id]),
   stmt(db,"UPDATE payments SET status='refunded' WHERE booking_id IN(SELECT id FROM bookings WHERE departure_id=? AND status='cancelled') AND status='paid'",[target.id]),
   stmt(db,"INSERT OR IGNORE INTO payment_events(id,payment_id,provider_event_id,kind,payload_json) SELECT lower(hex(randomblob(16))),id,'cancel:'||booking_id,'simulated_refund','{}' FROM payments WHERE booking_id IN(SELECT id FROM bookings WHERE departure_id=?) AND status='refunded'",[target.id]),
   stmt(db,"UPDATE standard_vehicle_slots SET active=0 WHERE departure_id=? AND EXISTS(SELECT 1 FROM departures WHERE id=? AND status='cancelled')",[target.id,target.id]),
   stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT ?,?,'departure',?,'cancelled' WHERE EXISTS(SELECT 1 FROM departures WHERE id=? AND status='cancelled')",[target.id+':cancel',b.operatorId,target.id,target.id])]);}
  catch(error){if(String(error.message).includes('already_boarded'))throw failure('Hay pasajeros embarcados; no se cancela la salida',409);throw error;}
  const updated=await stmt(db,'SELECT status FROM departures WHERE id=?',[target.id]).first();if(updated.status!=='cancelled')throw failure('La salida cambió en otra sesión',409);return {status:'cancelled',refund:'simulated'};
 }
 if(b.kind==='booking'&&target.departure_id)throw failure('Controla la salida compartida, no el boleto individual');
 const existing=await stmt(db,`SELECT * FROM standard_tracking WHERE ${column}=?`,[target.id]).first();
 if(b.action==='start'){
  boardingWindow(env,target.depart_at||target.service_at,failure);
  if(existing){if(existing.service_status==='completed')throw failure('Servicio finalizado',409);return {liveId:existing.id,status:'running'};}
  if(!['published','confirmed'].includes(target.status))throw failure('Servicio no habilitado para iniciar',409);
  const id=crypto.randomUUID(),now=Date.now();
  const initial={id,routeId:ROUTE_ID,simulated:true,source:'simulator',status:'ready',anchorMeters:0,anchorAt:now,multiplier:1,revision:1,createdAt:now,updatedAt:now,expiresAt:null,alerts:[],events:[]};
  const mode=env.ALLOW_DEVELOPMENT_AUTH==='true'?'simulator':'operations';
  const state=mode==='simulator'?applyTripCommand(initial,{action:'start',requestId:crypto.randomUUID()},road,now):{id,status:'running',revision:1,source:'operations',alerts:[],events:[],createdAt:now,updatedAt:now};
  const operations=[];
  if(b.kind==='departure')operations.push(stmt(db,"UPDATE departures SET status='running' WHERE id=? AND status='published'",[target.id]));
  if(b.kind==='custom')operations.push(stmt(db,"UPDATE standard_custom_bookings SET status='running' WHERE id=? AND status='confirmed'",[target.id]));
  operations.push(stmt(db,`INSERT INTO standard_tracking(id,operator_id,${column},state_json,revision,mode) VALUES(?,?,?,?,?,?)`,[id,b.operatorId,target.id,JSON.stringify(state),state.revision,mode]),
   stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) VALUES(?,?,?,?,?)",[target.id+':start',b.operatorId,b.kind,target.id,mode==='operations'?'service_started':'simulation_started']));
  try{await db.batch(operations);}catch(error){const prior=await stmt(db,`SELECT id FROM standard_tracking WHERE ${column}=?`,[target.id]).first();if(prior)return {liveId:prior.id,status:'running'};if(String(error.message).includes('service_unavailable'))throw failure('Servicio actualizado en otra sesión',409);throw error;}
  return {liveId:id,status:'running',notice};
 }
 if(b.action==='finish'){
  if(!existing)throw failure('Inicia el servicio antes de finalizar',409);
  if(existing.service_status==='completed')return {status:'completed',liveId:existing.id};
  const next=JSON.parse(existing.state_json);next.status='arrived';if(existing.mode!=='operations')next.anchorMeters=road.totalMeters;next.anchorAt=Date.now();next.updatedAt=next.anchorAt;next.revision++;
  const guard=`EXISTS(SELECT 1 FROM standard_tracking WHERE id=? AND service_status='completed' AND revision=?)`;
  const operations=[stmt(db,"UPDATE standard_tracking SET service_status='completed',state_json=?,revision=? WHERE id=? AND revision=? RETURNING id",[JSON.stringify(next),next.revision,existing.id,existing.revision])];
  if(b.kind==='departure')operations.push(stmt(db,`UPDATE departures SET status='completed' WHERE id=? AND ${guard}`,[target.id,existing.id,next.revision]));
  if(b.kind==='custom')operations.push(stmt(db,`UPDATE standard_custom_bookings SET status='completed' WHERE id=? AND ${guard}`,[target.id,existing.id,next.revision]));
  operations.push(stmt(db,`UPDATE standard_vehicle_slots SET active=0 WHERE ${column}=? AND ${guard}`,[target.id,existing.id,next.revision]),
   stmt(db,`INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT ?,?,?,?,? WHERE ${guard}`,[target.id+':finish',b.operatorId,b.kind,target.id,existing.mode==='operations'?'service_completed':'simulation_completed',existing.id,next.revision]));
  const result=await db.batch(operations);if(result[0].results.length!==1)throw failure('Seguimiento cambió; reintenta finalizar',409);
  return {status:'completed',liveId:existing.id};
 }
 throw failure('Acción no válida');
}
