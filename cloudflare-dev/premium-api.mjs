// Premium dev extends the same tenant, identity, vehicles and scheduling ledger.
export async function handlePremium(request,env,c) {
 const {identity,owner,stmt,rows,failure,command,integer,text}=c,db=env.DB;
 const url=new URL(request.url),path=url.pathname,user=await identity(request,db);
 let body={};
 if(request.method==='POST') {
  const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);
  try{body=JSON.parse(raw);}catch{throw failure('JSON no válido');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw failure('Solicitud no válida');
 } else if(request.method!=='GET')throw failure('Método no permitido',405);
 const operatorId=request.method==='GET'?url.searchParams.get('operatorId'):body.operatorId;
 await owner(db,user.id,operatorId);
 const entitlement=await stmt(db,'SELECT plan,active,activated_at FROM premium_tenants WHERE operator_id=?',[operatorId]).first();
 if(path==='/api/premium'&&request.method==='GET') {
  if(!entitlement?.active)return {enabled:false,environment:'development',payments:'disabled'};
  return {enabled:true,entitlement,environment:'development',payments:'disabled',
   vehicles:await rows(db,`SELECT v.*,p.odometer_km,p.next_service_km,p.updated_at FROM vehicles v
    LEFT JOIN premium_vehicle_profiles p ON p.vehicle_id=v.id WHERE v.operator_id=? ORDER BY v.model`,[operatorId]),
   maintenance:await rows(db,'SELECT * FROM premium_maintenance WHERE operator_id=? ORDER BY starts_at DESC LIMIT 200',[operatorId])};
 }
 if(request.method!=='POST')throw failure('Ruta no encontrada',404);
 if(path==='/api/premium/activate') {
  await command(db,user,body,'premium_activation',[stmt(db,'INSERT OR IGNORE INTO premium_tenants(operator_id) VALUES(?)',[operatorId])],operatorId);
  return {id:operatorId,enabled:true,plan:'premium_dev',payments:'disabled'};
 }
 if(!entitlement?.active)throw failure('Activa Premium de desarrollo para esta operadora',403);
 const id=crypto.randomUUID();
 if(path==='/api/premium/vehicle-profile'||path==='/api/premium/maintenance') {
  if(!await stmt(db,'SELECT 1 FROM vehicles WHERE id=? AND operator_id=?',[body.vehicleId,operatorId]).first())throw failure('Vehículo ajeno o inexistente',403);
  if(path.endsWith('/vehicle-profile')) {
   const km=integer(body.odometerKm,0,10000000,'Kilometraje'),next=body.nextServiceKm==null?null:integer(body.nextServiceKm,0,10000000,'Próximo servicio');
   try {
    const saved=await command(db,user,body,'premium_vehicle_profile',[stmt(db,`INSERT INTO premium_vehicle_profiles(vehicle_id,odometer_km,next_service_km) VALUES(?,?,?)
     ON CONFLICT(vehicle_id) DO UPDATE SET odometer_km=excluded.odometer_km,next_service_km=excluded.next_service_km,updated_at=CURRENT_TIMESTAMP`,[body.vehicleId,km,next])],body.vehicleId);
    return {id:saved};
   }catch(error){if(String(error.message).includes('odometer_decrease'))throw failure('El kilometraje no puede disminuir; actualiza la vista',409);throw error;}
  }
  const start=Date.parse(body.startsAt),end=Date.parse(body.endsAt),now=Date.now();
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<now-300000||start>now+366*86400000||end<=start||end-start>30*86400000)throw failure('Horario de mantenimiento no válido');
  const saved=await command(db,user,body,'premium_maintenance',[
   stmt(db,'INSERT INTO premium_maintenance(id,operator_id,vehicle_id,summary,starts_at,ends_at,estimated_cost_cents) VALUES(?,?,?,?,?,?,?)',[id,operatorId,body.vehicleId,text(body.summary,'Descripción',200),start,end,integer(body.estimatedCostCents??0,0,100000000,'Costo estimado')]),
   stmt(db,'INSERT INTO standard_vehicle_slots(id,vehicle_id,starts_at,ends_at,maintenance_id) VALUES(?,?,?,?,?)',[crypto.randomUUID(),body.vehicleId,start,end,id])],id);
  return {id:saved};
 }
 const match=path.match(/^\/api\/premium\/maintenance\/([0-9a-f-]{36})$/i);
 if(match) {
  if(!['completed','cancelled'].includes(body.status))throw failure('Estado no válido');
  const job=await stmt(db,'SELECT * FROM premium_maintenance WHERE id=? AND operator_id=?',[match[1],operatorId]).first();
  if(!job)throw failure('Mantenimiento ajeno o inexistente',403);
  await db.batch([
   stmt(db,"UPDATE premium_maintenance SET status=?,closed_at=CURRENT_TIMESTAMP WHERE id=? AND status='open'",[body.status,job.id]),
   stmt(db,'UPDATE standard_vehicle_slots SET active=0 WHERE maintenance_id=? AND EXISTS(SELECT 1 FROM premium_maintenance WHERE id=? AND status=?)',[job.id,job.id,body.status]),
   stmt(db,`INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action)
    SELECT ?,?,'premium_maintenance',id,? FROM premium_maintenance WHERE id=? AND status=?`,[job.id+':'+body.status,user.id,body.status,job.id,body.status])]);
  const current=await stmt(db,'SELECT status FROM premium_maintenance WHERE id=?',[job.id]).first();
  if(current.status!==body.status)throw failure('El mantenimiento ya fue cerrado con otro estado',409);
  return {id:job.id,status:current.status};
 }
 throw failure('Ruta no encontrada',404);
}
