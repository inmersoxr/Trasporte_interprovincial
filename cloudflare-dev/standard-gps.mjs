import {canOperate} from './standard-permissions.mjs';
const uuid=x=>typeof x==='string'&&/^[a-f0-9-]{36}$/i.test(x);
export async function handleGps(request,env,c){
 const {stmt,rows,failure,identity,hash}=c,db=env.DB,url=new URL(request.url),parts=url.pathname.split('/'),publicToken=parts[3]==='public'?parts[4]:null,now=Date.now();let user,t;
 const query=`SELECT t.*,COALESCE(d.vehicle_id,m.vehicle_id,b.vehicle_id) vehicle_id,COALESCE(r.origin,br.origin,pr.origin) origin,COALESCE(r.destination,br.destination,pr.destination) destination FROM standard_tracking t LEFT JOIN departures d ON d.id=t.departure_id LEFT JOIN route_offers r ON r.id=d.offer_id LEFT JOIN standard_booking_details m ON m.booking_id=t.booking_id LEFT JOIN bookings bk ON bk.id=t.booking_id LEFT JOIN route_offers br ON br.id=bk.offer_id LEFT JOIN standard_custom_bookings b ON b.id=t.custom_booking_id LEFT JOIN private_requests pr ON pr.id=b.request_id`;
 if(publicToken){
  if(request.method!=='GET'||!/^[-_a-zA-Z0-9]{43}$/.test(publicToken))throw failure('Enlace no disponible',404);
  t=await stmt(db,query+` JOIN standard_gps_shares s ON s.trip_id=t.id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND t.service_status='running'`,[await hash(publicToken),now]).first();
 }else{
  user=await identity(request);if(!uuid(parts[3]))throw failure('Viaje no disponible',404);t=await stmt(db,query+' WHERE t.id=?',[parts[3]]).first();
 }
 if(!t||t.mode!=='operations')throw failure('Viaje no disponible',404);
 const member=user?await stmt(db,'SELECT role FROM memberships WHERE operator_id=? AND user_id=?',[t.operator_id,user.id]).first():null;
 const canSend=!!member&&await canOperate(db,user.id,t.operator_id,t.vehicle_id,t.departure_id);
 const staff=!!member&&!!await stmt(db,"SELECT 1 FROM organization_capabilities WHERE user_id=? AND operator_id=? AND capability IN('*','trips.operate_all')",[user.id,t.operator_id]).first();
 const fleetViewer=!!member&&!!await stmt(db,"SELECT 1 FROM organization_fleet_access a JOIN organization_capabilities c ON c.user_id=a.user_id AND c.operator_id=a.operator_id WHERE a.user_id=? AND a.vehicle_id=? AND c.capability IN('*','fleet.track')",[user.id,t.vehicle_id]).first();
 const passenger=user&&!!await stmt(db,`SELECT 1 FROM bookings WHERE customer_id=? AND sales_channel<>'office' AND status='confirmed' AND (id=? OR departure_id=?) UNION SELECT 1 FROM standard_custom_bookings WHERE customer_id=? AND id=? AND status IN('confirmed','running','completed')`,[user.id,t.booking_id,t.departure_id,user.id,t.custom_booking_id]).first();
 if(!publicToken&&!canSend&&!fleetViewer&&!passenger)throw failure('Viaje no disponible',404);
 if(request.method==='GET'&&parts[4]==='history'){
  if(!canSend&&!fleetViewer||publicToken)throw failure('Historial privado',403);
  const before=Number(url.searchParams.get('before')||now+60001);if(!Number.isSafeInteger(before))throw failure('Página no válida');
  const positions=await rows(db,'SELECT sample_id,lat,lng,accuracy,speed,heading,captured_at,received_at FROM standard_gps_positions WHERE trip_id=? AND captured_at<? ORDER BY captured_at DESC,sample_id DESC LIMIT 101',[t.id,before]);
  return{positions:positions.slice(0,100),nextBefore:positions.length>100?positions[99].captured_at:null};
 }
 if(request.method==='GET'){
  const latest=await stmt(db,'SELECT lat,lng,accuracy,speed,heading,captured_at,received_at FROM standard_gps_positions WHERE trip_id=? ORDER BY captured_at DESC,sample_id DESC LIMIT 1',[t.id]).first();
  const vehicle=await stmt(db,'SELECT model,plate FROM vehicles WHERE id=?',[t.vehicle_id]).first();const responsible=canSend||fleetViewer?await stmt(db,'SELECT driver_name AS responsible_name FROM standard_departure_drivers WHERE departure_id=? UNION ALL SELECT responsible_name FROM standard_departure_staff WHERE departure_id=?',[t.departure_id,t.departure_id]).first():null;return{vehicle:vehicle?.model||null,responsibleName:responsible?.responsible_name||null,tripId:t.id,status:t.service_status,origin:t.origin,destination:t.destination,position:latest,serverNow:now,canSend:!!canSend,canShare:!publicToken,source:'gps',simulated:false};
 }
 if(publicToken||request.method!=='POST')throw failure('Método no permitido',405);
 const raw=await request.text();if(raw.length>32768)throw failure('Solicitud demasiado grande',413);let b;try{b=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}if(!b||typeof b!=='object')throw failure('Solicitud no válida');
 if(parts[4]==='share'){
  if(b.action==='revoke'){await stmt(db,'UPDATE standard_gps_shares SET revoked_at=? WHERE trip_id=? AND revoked_at IS NULL'+(staff?'':' AND created_by=?'),[now,t.id,...(staff?[]:[user.id])]).run();return{revoked:true};}
  if(t.service_status!=='running')throw failure('El viaje no está en curso',409);
  const token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  // One active personal link per trip. No bearer token is stored in plaintext.
  await db.batch([stmt(db,'UPDATE standard_gps_shares SET revoked_at=? WHERE trip_id=? AND created_by=? AND revoked_at IS NULL',[now,t.id,user.id]),stmt(db,'INSERT INTO standard_gps_shares(token_hash,trip_id,created_by,expires_at) VALUES(?,?,?,?)',[await hash(token),t.id,user.id,now+12*3600000])]);return{token,expiresAt:now+12*3600000};
 }
 if(parts[4]!=='positions')throw failure('Ruta no disponible',404);
 if(!canSend)throw failure('Solo el personal asignado puede transmitir',403);
 if(t.service_status!=='running')throw failure('Seguimiento detenido',409);
 if(!Array.isArray(b.positions)||!b.positions.length||b.positions.length>50)throw failure('Lote GPS no válido');
 const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 for(const p of b.positions)if(!uuid(p?.id)||!finite(p.lat,-90,90)||!finite(p.lng,-180,180)||!finite(p.accuracy,0,5000)||!Number.isSafeInteger(p.capturedAt)||p.capturedAt<now-24*3600000||p.capturedAt>now+60000||p.speed!=null&&!finite(p.speed,0,120)||p.heading!=null&&!finite(p.heading,0,360))throw failure('Muestra GPS no válida');
 try{await db.batch(b.positions.map(p=>stmt(db,`INSERT INTO standard_gps_positions(trip_id,sample_id,actor_id,vehicle_id,lat,lng,accuracy,speed,heading,captured_at,received_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(trip_id,sample_id) DO NOTHING`,[t.id,p.id,user.id,t.vehicle_id,p.lat,p.lng,p.accuracy,p.speed??null,p.heading??null,p.capturedAt,now])));}catch(e){if(e.message.includes('gps_access_changed'))throw failure('El viaje o la asignación cambió',409);throw e;}
 return{accepted:b.positions.map(p=>p.id),receivedAt:now};
}
