import {operatorScope,operatorReady,vehicleReady} from './standard-catalog.mjs';
export function boardingWindow(env,serviceAt,failure){
 if(env.ALLOW_DEVELOPMENT_AUTH==='true')return;
 const start=Date.parse(serviceAt),now=Date.now();
 if(!Number.isFinite(start)||now<start-120*60000||now>start+120*60000)throw failure('El embarque está habilitado desde dos horas antes hasta dos horas después de la salida programada',409);
}
function selectedService(env,body,kind,id,at,failure){
 if(env.ALLOW_DEVELOPMENT_AUTH!=='true'||body.serviceId){
  if(!body.serviceId||!body.serviceKind)throw failure('Selecciona la salida o servicio que estás embarcando');
  if(body.serviceId!==id||body.serviceKind!==kind)throw failure('El boleto corresponde a otra salida o servicio',409);
 }
 boardingWindow(env,at,failure);
}
export async function boardPassenger(env,core,b){
 const {stmt,failure,integer}=core,db=env.DB,code=String(b.code||'').match(/^RUTASEC-(STANDARD|CUSTOM):([0-9a-f-]{36}):(\d+)$/i);
 if(!code)throw failure('El código no corresponde a un boleto de RutasEC');
 const id=code[2],position=integer(Number(code[3]),0,29,'Pasajero'),at=Date.now();let kind,serviceId;
 const actor=core.actorUserId,access=actor?" AND (EXISTS(SELECT 1 FROM organization_capabilities z WHERE z.user_id=? AND z.operator_id=o.id AND z.capability IN('*','trips.operate_all')) OR EXISTS(SELECT 1 FROM organization_departure_operation z WHERE z.user_id=? AND z.departure_id=(SELECT departure_id FROM bookings WHERE id=?)) OR NOT EXISTS(SELECT 1 FROM bookings WHERE id=? AND departure_id IS NOT NULL) AND EXISTS(SELECT 1 FROM organization_vehicle_operation z WHERE z.user_id=? AND z.vehicle_id=v.id))":'',accessArgs=actor?[actor,actor,id,id,actor]:[];
 const allowed=`o.status='approved' AND v.status='active' AND ${operatorScope(env)} AND ${operatorReady()} AND ${vehicleReady()}${access}`;
 if(code[1].toUpperCase()==='STANDARD'){
  const booking=await stmt(db,'SELECT b.* FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id WHERE b.id=? AND m.operator_id=?',[id,b.operatorId]).first();
  if(!booking)throw failure('Boleto de otra operadora o inexistente',403);
  kind=booking.departure_id?'departure':'booking';serviceId=booking.departure_id||id;
  selectedService(env,b,kind,serviceId,booking.service_at,failure);
  const result=await db.batch([
   stmt(db,`UPDATE standard_passengers SET boarded_at=? WHERE booking_id=? AND position=? AND boarded_at IS NULL AND cancelled_at IS NULL
    AND EXISTS(SELECT 1 FROM bookings WHERE id=? AND status='confirmed' AND service_at=?)
    AND NOT EXISTS(SELECT 1 FROM departures WHERE id=? AND status NOT IN('published','boarding','running'))
    AND NOT EXISTS(SELECT 1 FROM standard_tracking WHERE (booking_id=? OR departure_id=?) AND service_status='completed')
    AND EXISTS(SELECT 1 FROM standard_booking_details m JOIN operators o ON o.id=m.operator_id JOIN vehicles v ON v.id=m.vehicle_id WHERE m.booking_id=? AND ${allowed})`,[at,id,position,id,booking.service_at,booking.departure_id,id,booking.departure_id,id,...accessArgs]),
   stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT ?,?,'booking',?,'boarded' WHERE EXISTS(SELECT 1 FROM standard_passengers WHERE booking_id=? AND position=? AND boarded_at IS NOT NULL)",[id+':board:'+position,b.operatorId,id,id,position])]);
  if(result[0].meta.changes!==1)throw failure('Pasajero ya embarcado o boleto no habilitado',409);
 }else{
  if(position!==0)throw failure('QR de grupo no válido');
  const booking=await stmt(db,'SELECT * FROM standard_custom_bookings WHERE id=? AND operator_id=?',[id,b.operatorId]).first();if(!booking)throw failure('Servicio de otra operadora',403);
  kind='custom';serviceId=id;selectedService(env,b,kind,id,booking.service_at,failure);
  const result=await db.batch([
   stmt(db,`UPDATE standard_custom_bookings SET boarded_at=? WHERE id=? AND boarded_at IS NULL AND service_at=? AND status IN('confirmed','running')
    AND EXISTS(SELECT 1 FROM operators o JOIN vehicles v ON v.operator_id=o.id WHERE o.id=standard_custom_bookings.operator_id AND v.id=standard_custom_bookings.vehicle_id AND ${allowed})`,[at,id,booking.service_at,...accessArgs]),
   stmt(db,"INSERT OR IGNORE INTO standard_operational_events(id,operator_id,entity_kind,entity_id,event) SELECT ?,?,'custom',?,'group_boarded' WHERE EXISTS(SELECT 1 FROM standard_custom_bookings WHERE id=? AND boarded_at IS NOT NULL)",[id+':board:0',b.operatorId,id,id])]);
  if(result[0].meta.changes!==1)throw failure('Grupo ya embarcado o servicio no habilitado',409);
 }
 return{boarded:true,boardedAt:at,serviceKind:kind,serviceId,payments:'simulated',simulated:true};
}
