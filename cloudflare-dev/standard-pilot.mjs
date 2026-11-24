import {planSchedule} from './standard-recurring.mjs';
import {APP_ORIGIN,requireOrigin} from './identity.mjs';
import {handleStandard} from './standard-api.mjs';
import {cities} from './standard/cities.mjs';
export async function handlePilot(request,env,c){
 const {stmt,rows,failure,hash,command,text,integer}=c,db=env.DB,url=new URL(request.url),path=url.pathname.slice('/api/pilot'.length);
 if(env.PILOT_OPERATIONS_ENABLED!=='true')throw failure('Circuito de piloto no habilitado',403);
 let b={};if(request.method==='POST'){requireOrigin(request,failure);const raw=await request.text();if(raw.length>10000)throw failure('Solicitud demasiado grande',413);try{b=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}}
 const tokenValid=token=>typeof token==='string'&&/^[0-9a-f]{64}$/i.test(token);
 if(path==='/invite-preview'&&request.method==='POST'){
  if(!tokenValid(b.token))throw failure('Invitación no disponible',404);
  const invite=await stmt(db,`SELECT i.expires_at,i.used_by,o.display_name,v.model,v.plate FROM premium_invites i JOIN operators o ON o.id=i.operator_id JOIN vehicles v ON v.id=i.vehicle_id JOIN pilot_operators p ON p.operator_id=o.id WHERE i.token_hash=? AND i.revoked_at IS NULL AND i.expires_at>? AND p.enabled=1`,[await hash(b.token),Date.now()]).first();if(!invite)throw failure('Invitación vencida o revocada',404);return{company:invite.display_name,vehicle:invite.model,plate:invite.plate,expiresAt:invite.expires_at,used:!!invite.used_by,role:'Conductor'};
 }
 const user=await c.identity(request),op=request.method==='GET'?url.searchParams.get('operatorId'):b.operatorId;
 const member=await stmt(db,'SELECT m.role,o.* FROM memberships m JOIN operators o ON o.id=m.operator_id WHERE m.user_id=? AND m.operator_id=?',[user.id,op]).first();if(!member)throw failure('Sin acceso a esta operadora',403);
 const admin=['owner','admin'].includes(member.role),setting=await stmt(db,'SELECT * FROM pilot_operators WHERE operator_id=?',[op]).first();
 if(path==='/dashboard'&&request.method==='GET'){
  const today=new Date(Date.now()-18000000).toISOString().slice(0,10),start=url.searchParams.get('from')||today,end=url.searchParams.get('to')||new Date(Date.now()-18000000+6*86400000).toISOString().slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||Date.parse(end)<Date.parse(start)||Date.parse(end)-Date.parse(start)>31*86400000)throw failure('Selecciona un periodo de hasta31días');
  const scope=admin?'':' AND a.driver_user_id=?',args=admin?[op]:[op,user.id];
  const vehicles=await rows(db,`SELECT v.*,a.driver_user_id,u.display_name AS driver_name FROM vehicles v LEFT JOIN premium_assignments a ON a.vehicle_id=v.id LEFT JOIN users u ON u.id=a.driver_user_id WHERE v.operator_id=?${scope} ORDER BY v.created_at`,args);
  const trips=await rows(db,`SELECT d.id,d.depart_at,d.status,d.vehicle_id,r.origin,r.destination,r.price_cents,v.model,v.plate,v.capacity,u.display_name AS driver_name,t.id AS live_id,t.service_status,
   (SELECT COUNT(*) FROM seat_claims sc WHERE sc.departure_id=d.id AND sc.status IN('held','confirmed')) AS occupied,
   (SELECT COUNT(*) FROM standard_passengers p JOIN bookings b ON b.id=p.booking_id WHERE b.departure_id=d.id AND p.boarded_at IS NOT NULL AND p.cancelled_at IS NULL) AS boarded
   FROM departures d JOIN route_offers r ON r.id=d.offer_id JOIN vehicles v ON v.id=d.vehicle_id LEFT JOIN premium_assignments a ON a.vehicle_id=v.id LEFT JOIN users u ON u.id=a.driver_user_id LEFT JOIN standard_tracking t ON t.departure_id=d.id WHERE r.operator_id=?${scope} AND date(d.depart_at,'-5 hours')>=? AND date(d.depart_at,'-5 hours')<=? ORDER BY d.depart_at,d.id LIMIT 300`,[...args,start,end]);
  const fleetPositions=admin?await rows(db,`SELECT t.id AS trip_id,d.id AS departure_id,v.id AS vehicle_id,v.model,v.plate,u.display_name AS driver_name,r.origin,r.destination,g.lat,g.lng,g.accuracy,g.heading,g.captured_at,g.received_at FROM standard_tracking t JOIN departures d ON d.id=t.departure_id JOIN route_offers r ON r.id=d.offer_id JOIN vehicles v ON v.id=d.vehicle_id LEFT JOIN premium_assignments a ON a.vehicle_id=v.id LEFT JOIN users u ON u.id=a.driver_user_id LEFT JOIN standard_gps_positions g ON g.trip_id=t.id AND g.sample_id=(SELECT gp.sample_id FROM standard_gps_positions gp WHERE gp.trip_id=t.id ORDER BY gp.captured_at DESC,gp.sample_id DESC LIMIT 1) WHERE t.operator_id=? AND t.service_status='running' ORDER BY v.plate`,[op]):[];
  return{fleetPositions,operatorId:op,name:member.display_name,role:member.role,admin,enabled:!!setting?.enabled,today,from:start,to:end,vehicles,trips,members:admin?await rows(db,"SELECT m.user_id,u.display_name FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.operator_id=? AND m.role='driver' AND u.status='active' ORDER BY u.display_name",[op]):[],invites:admin?await rows(db,"SELECT i.id,i.label,i.expires_at,i.used_by,i.revoked_at,v.model,v.plate FROM premium_invites i JOIN vehicles v ON v.id=i.vehicle_id WHERE i.operator_id=? ORDER BY i.created_at DESC LIMIT 100",[op]):[],payments:'simulated',documentaryApproval:false};
 }
 if(!admin)throw failure('Solo la administración gestiona la operadora',403);
 if(request.method!=='POST')throw failure('Método no permitido',405);
 if(!/^[0-9a-f-]{36}$/i.test(b.requestId||''))throw failure('Solicitud sin clave de reintento');
 const stable=async suffix=>{const s=(await hash(b.requestId+':'+suffix)).slice(0,32);return s.slice(0,8)+'-'+s.slice(8,12)+'-'+s.slice(12,16)+'-'+s.slice(16,20)+'-'+s.slice(20);};
 const legacy=async(path,body)=>handleStandard(new Request(new URL('/api'+path,request.url),{method:'POST',headers:request.headers,body:JSON.stringify(body)}),env);
 if(path==='/prepare'){
  if(member.status==='suspended')throw failure('La operadora está suspendida; requiere atención de plataforma',403);if(b.acknowledge!==true)throw failure('Confirma que se trata de pruebas con pagos simulados');if(!cities.includes(b.city))throw failure('Selecciona una ciudad de Ecuador');
  const branch=setting?.branch_id||(await stmt(db,'SELECT id FROM premium_branches WHERE operator_id=? ORDER BY created_at LIMIT 1',[op]).first())?.id||await stable('branch');
  await command(db,user,b,'pilot_prepare',[
  ...(env.PILOT_PREMIUM_ENABLED==='true'?[stmt(db,`INSERT INTO platform_subscriptions(operator_id,plan,status,fee_cents,next_due_on,cycle_months,revision,last_request,fingerprint,notes) VALUES(?,'premium','trial',0,NULL,1,1,?,?,'Piloto autorizado sin cobros') ON CONFLICT(operator_id) DO UPDATE SET plan='premium',status='trial',fee_cents=0,next_due_on=NULL,revision=revision+1,last_request=excluded.last_request,fingerprint=excluded.fingerprint,notes=excluded.notes WHERE platform_subscriptions.plan<>'premium' OR platform_subscriptions.status NOT IN('active','trial') OR platform_subscriptions.next_due_on<date('now','-5 hours')`,[op,b.requestId,await hash(JSON.stringify(b))])]:[]),
  stmt(db,'INSERT OR IGNORE INTO premium_branches(id,operator_id,name,city) VALUES(?,?,?,?)',[branch,op,'Operación piloto',b.city]),stmt(db,'INSERT INTO pilot_operators(operator_id,branch_id,enabled,enabled_by) VALUES(?,?,1,?) ON CONFLICT(operator_id) DO UPDATE SET enabled=1',[op,branch,user.id]),stmt(db,"UPDATE operators SET status='approved' WHERE id=? AND status<>'suspended'",[op]),stmt(db,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'pilot_operator',?,'training_enabled_without_documentary_approval')",[await stable('audit'),user.id,op])],op);return{enabled:true,documentaryApproval:false};
 }
 if(!setting?.enabled)throw failure('Habilita primero las pruebas de esta empresa',409);
 if(path==='/vehicle'){
  const plate=String(b.plate||'').trim().toUpperCase().replace(/\s/g,'');if(!/^[A-Z0-9-]{5,12}$/.test(plate))throw failure('Revisa la placa');if(!['van','auto','suv','minivan'].includes(b.type))throw failure('Selecciona tipo de vehículo');const id=await stable('vehicle');
  try{const saved=await command(db,user,b,'pilot_vehicle',[stmt(db,"INSERT INTO vehicles(id,operator_id,type,model,plate,capacity,status) VALUES(?,?,?,?,?,?,'active')",[id,op,b.type,text(b.model,'Modelo',120),plate,integer(b.capacity,1,30,'Plazas')]),stmt(db,'INSERT INTO pilot_vehicles(vehicle_id,operator_id) VALUES(?,?)',[id,op])],id);return{id:saved};}catch(e){if(/UNIQUE.*plate/.test(e.message))throw failure('Esa placa ya está registrada',409);throw e;}
 }
 const vehicle=async()=>{const v=await stmt(db,'SELECT v.* FROM vehicles v JOIN pilot_vehicles p ON p.vehicle_id=v.id WHERE v.id=? AND v.operator_id=?',[b.vehicleId,op]).first();if(!v)throw failure('Vehículo ajeno o fuera del piloto',403);return v;};
 const idle=async v=>{if(await stmt(db,"SELECT 1 FROM standard_tracking t JOIN departures d ON d.id=t.departure_id WHERE d.vehicle_id=? AND t.service_status='running'",[v.id]).first())throw failure('Finaliza el viaje en curso antes de reasignar',409);};
 if(path==='/invite'){
  const v=await vehicle();await idle(v);if(await stmt(db,'SELECT 1 FROM premium_assignments WHERE vehicle_id=? AND driver_user_id IS NOT NULL',[v.id]).first())throw failure('El vehículo ya tiene conductor. Gestiona primero su asignación o acceso.',409);if(!tokenValid(b.token))throw failure('No se pudo generar el enlace');const id=await stable('invite');await command(db,user,b,'pilot_invite',[stmt(db,'UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE vehicle_id=? AND operator_id=? AND used_by IS NULL AND revoked_at IS NULL',[Date.now(),v.id,op]),stmt(db,"INSERT INTO premium_invites(id,operator_id,token_hash,role,expires_at,vehicle_id,label) VALUES(?,?,?,'driver',?,?,?)",[id,op,await hash(b.token),Date.now()+86400000,v.id,text(b.name,'Nombre del conductor',120)])],id);return{id,expiresInHours:24};
 }
 if(path==='/revoke-invite'){
  const i=await stmt(db,'SELECT * FROM premium_invites WHERE id=? AND operator_id=? AND vehicle_id IS NOT NULL',[b.id,op]).first();if(!i)throw failure('Invitación ajena',403);await command(db,user,b,'pilot_invite_revoke',[stmt(db,'UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE id=? AND operator_id=?',[Date.now(),i.id,op])],i.id);return{revoked:true};
 }
 if(path==='/assign'){
  const v=await vehicle();await idle(v);if(!await stmt(db,"SELECT 1 FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.user_id=? AND m.operator_id=? AND m.role='driver' AND u.status='active'",[b.driverUserId,op]).first())throw failure('Selecciona un conductor de esta empresa',403);
  await command(db,user,b,'pilot_assign',[stmt(db,'UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE operator_id=? AND vehicle_id=? AND used_by IS NULL AND revoked_at IS NULL',[Date.now(),op,v.id]),stmt(db,'INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) VALUES(?,?,?,?) ON CONFLICT(vehicle_id) DO UPDATE SET driver_user_id=excluded.driver_user_id',[v.id,op,setting.branch_id,b.driverUserId])],v.id);return{assigned:true};
 }
 if(path==='/revoke-driver'){
  const m=await stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role='driver'",[b.userId,op]).first();if(!m)throw failure('Conductor ajeno o no revocable',403);const assigned=await rows(db,'SELECT v.* FROM vehicles v JOIN premium_assignments a ON a.vehicle_id=v.id WHERE a.operator_id=? AND a.driver_user_id=?',[op,b.userId]);for(const v of assigned)await idle(v);
  await command(db,user,b,'pilot_driver_revoke',[stmt(db,'UPDATE premium_assignments SET driver_user_id=NULL WHERE operator_id=? AND driver_user_id=?',[op,b.userId]),stmt(db,"DELETE FROM memberships WHERE operator_id=? AND user_id=? AND role='driver'",[op,b.userId]),stmt(db,'UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE operator_id=? AND used_by=?',[Date.now(),op,b.userId])],b.userId);return{revoked:true};
 }
 if(path==='/publish'||path==='/preview'){
  const old=await stmt(db,'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?',[user.id,b.requestId]).first();if(old&&path==='/publish'){await command(db,user,b,'pilot_publish',[],old.entity_id);return b.frequency&&b.frequency!=='once'?{scheduleId:old.entity_id,count:(await stmt(db,'SELECT COUNT(*) n FROM departures WHERE schedule_id=?',[old.entity_id]).first()).n}:{departureId:old.entity_id,count:1};}
  const v=await vehicle();if(!await stmt(db,"SELECT 1 FROM premium_assignments a JOIN memberships m ON m.user_id=a.driver_user_id AND m.operator_id=a.operator_id AND m.role='driver' WHERE a.vehicle_id=? AND a.operator_id=?",[v.id,op]).first())throw failure('El conductor debe aceptar su invitación antes de publicar',409);
  if(!cities.includes(b.origin)||!cities.includes(b.destination)||b.origin===b.destination)throw failure('Selecciona ciudades distintas');
  const duration=integer(b.durationMinutes,1,1440,'Duración'),price=integer(b.priceCents,1,1000000,'Precio');if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(b.departLocal||'')||!Number.isFinite(Date.parse(b.departLocal+':00-05:00')))throw failure('Selecciona fecha y hora de Ecuador');
  const frequency=b.frequency||'once';if(!['once','daily','weekly','monthly'].includes(frequency))throw failure('Selecciona la frecuencia');const start=b.departLocal.slice(0,10),schedule={frequency,monthlyDay:Number(start.slice(8)),startDate:start,endDate:b.until,weekdays:frequency==='weekly'?b.weekdays:[0,1,2,3,4,5,6],times:[b.departLocal.slice(11)],durationMinutes:duration};
  const plan=frequency==='once'?{departures:[{departAt:new Date(b.departLocal+':00-05:00').toISOString(),startsAt:Date.parse(b.departLocal+':00-05:00'),endsAt:Date.parse(b.departLocal+':00-05:00')+duration*60000}]}:planSchedule(schedule);if(plan.departures[0].startsAt<=Date.now())throw failure('Selecciona una salida futura');
  const occupied=await rows(db,'SELECT starts_at,ends_at FROM standard_vehicle_slots WHERE vehicle_id=? AND active=1 AND starts_at<? AND ends_at>?',[v.id,plan.departures.at(-1).endsAt,plan.departures[0].startsAt]);if(plan.departures.some(d=>occupied.some(o=>o.starts_at<d.endsAt&&o.ends_at>d.startsAt)))throw failure('El vehículo tiene un viaje o mantenimiento en ese horario; no se publicó nada',409);
  if(path==='/preview')return{count:plan.departures.length,departures:plan.departures.map(d=>d.departAt),vehicle:v.model,plate:v.plate,frequency};
  const offer=await legacy('/route-offers',{requestId:await stable('offer'),operatorId:op,vehicleId:v.id,origin:b.origin,destination:b.destination,serviceType:'shared',priceCents:price,pickupPoint:text(b.pickup,'Punto de encuentro',250),dropoffPoint:text(b.dropoff,'Punto de llegada',250),durationMinutes:duration});
  if(frequency!=='once'){const r=await legacy('/recurring-schedules',{...schedule,requestId:await stable('schedule'),operatorId:op,offerId:offer.id});const id=r.schedule.id;await command(db,user,b,'pilot_publish',[],id);return{scheduleId:id,count:r.schedule.departureCount};}
  const departure=await legacy('/departures',{requestId:await stable('departure'),operatorId:op,offerId:offer.id,departAt:new Date(b.departLocal+':00-05:00').toISOString(),durationMinutes:duration});await command(db,user,b,'pilot_publish',[],departure.id);return{departureId:departure.id,count:1};
 }
 throw failure('Acción no disponible',404);
}
