import {organizationAccess,requireCapability,hasCapability} from './standard-organization-access.mjs';
import {enterprise} from './premium-enterprise.mjs';
import {commercialPremium} from './standard-permissions.mjs';
import {uploadMedia,profile} from './premium-profiles.mjs';
import {finance,expense,document} from './premium-finance.mjs';
import {analytics} from './premium-business.mjs';
import {joinTeam,handleTeam} from './premium-team.mjs';
// Premium dev extends the same tenant, identity, vehicles and scheduling ledger.
export async function handlePremium(request,env,c) {
 const {identity,owner,stmt,rows,failure,command,integer,text,hash}=c,db=env.DB;
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/premium/media')return uploadMedia(request,env,c);
 const user=await identity(request,db);
 let body={};
 if(request.method==='POST') {
  const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);
  try{body=JSON.parse(raw);}catch{throw failure('JSON no válido');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw failure('Solicitud no válida');
 } else if(request.method!=='GET')throw failure('Método no permitido',405);
 if(path==='/api/premium/join'&&request.method==='POST')return joinTeam(body,user,db,c);
 if(path==='/api/premium/operators'&&request.method==='GET')return{userId:user.id,operators:await rows(db,'SELECT o.id,o.display_name,m.role FROM operators o JOIN memberships m ON m.operator_id=o.id WHERE m.user_id=?',[user.id])};
 const operatorId=request.method==='GET'?url.searchParams.get('operatorId'):body.operatorId;
 const membership=await stmt(db,'SELECT role FROM memberships WHERE operator_id=? AND user_id=?',[operatorId,user.id]).first();
 if(!membership)throw failure('Sin permiso para esta operadora',403);
 const role=membership.role,access=await organizationAccess(db,user.id,operatorId,failure),can=cap=>hasCapability(access,cap);
 const teamPaths=['/api/premium/branches','/api/premium/invites','/api/premium/revoke','/api/premium/assignments'];
 if(path==='/api/premium/activate'||teamPaths.includes(path))await owner(db,user.id,operatorId);
 else if(request.method==='POST'&&!path.startsWith('/api/premium/enterprise'))await requireCapability(db,user.id,operatorId,path==='/api/premium/profile'?'company.edit':path.startsWith('/api/premium/expenses')||path.startsWith('/api/premium/documents/')?'finance.write':'maintenance.write',failure);
 const entitlement=await stmt(db,`SELECT t.plan,t.active,t.activated_at FROM premium_tenants t JOIN operators o ON o.id=t.operator_id WHERE t.operator_id=? AND (o.data_scope='qa' OR ${commercialPremium})`,[operatorId]).first();
 if(path.startsWith('/api/premium/enterprise')){if(!entitlement?.active)throw failure('Premium no habilitado',403);return enterprise(request,env,c,user,operatorId,role,body);}
 if(path==='/api/premium'&&request.method==='GET') {
  if(!entitlement?.active)return {enabled:false,canActivate:env.ALLOW_DEVELOPMENT_AUTH==='true',notice:'Solicita la habilitación del plan a la administración de RutasEC.',environment:'development',payments:'disabled'};
  return {enabled:true,role,access,entitlement,environment:'development',payments:'disabled',
   vehicles:await rows(db,`SELECT v.*,p.odometer_km,p.next_service_km,p.updated_at FROM vehicles v
    LEFT JOIN premium_vehicle_profiles p ON p.vehicle_id=v.id WHERE v.operator_id=? AND v.id IN(SELECT vehicle_id FROM organization_vehicle_access WHERE user_id=?) ORDER BY v.model`,[operatorId,user.id]),
   branches:!can('sales.write')&&!can('fleet.write')&&!can('trips.write')?[]:await rows(db,'SELECT * FROM premium_branches WHERE operator_id=?',[operatorId]),
   members:can('team.manage')||can('employees.write')?await rows(db,'SELECT m.user_id,m.role,u.display_name FROM memberships m JOIN users u ON u.id=m.user_id WHERE m.operator_id=?',[operatorId]):[],
   assignments:can('fleet.read')?await rows(db,"SELECT * FROM premium_assignments WHERE operator_id=? AND vehicle_id IN(SELECT vehicle_id FROM organization_vehicle_access WHERE user_id=?)",[operatorId,user.id]):[],
   maintenance:!can('maintenance.write')?[]:await rows(db,'SELECT * FROM premium_maintenance WHERE operator_id=? ORDER BY starts_at DESC LIMIT 200',[operatorId])};
 }
 if(path==='/api/premium/analytics'&&request.method==='GET'){if(!entitlement?.active||!can('reports.read'))throw failure('Sin permiso para analítica',403);return analytics(url,operatorId,db,c);}
 if(path.startsWith('/api/premium/finance')||path.startsWith('/api/premium/expenses')||path.startsWith('/api/premium/documents/')){
  if(!entitlement?.active||!can(request.method==='GET'?'finance.read':'finance.write'))throw failure('Sin permiso para finanzas',403);
  if(path==='/api/premium/finance'&&request.method==='GET')return finance(url,operatorId,db,c);
  const doc=path.match(/^\/api\/premium\/documents\/([0-9a-f-]{36})$/i);if(doc&&request.method==='GET')return document(doc[1],operatorId,db,c);
  if(request.method==='POST'){const result=await expense(path,body,user,operatorId,db,c);if(result)return result;}
 }
 if(path==='/api/premium/profile'){if(!entitlement?.active||!can('company.edit'))throw failure('Sin permiso para personalización',403);return profile(url,request.method==='POST'?body:null,user,operatorId,db,c);}
 if(request.method!=='POST')throw failure('Ruta no encontrada',404);
 if(path==='/api/premium/activate') {
  if(env.ALLOW_DEVELOPMENT_AUTH!=='true'&&!await stmt(db,`SELECT 1 FROM operators o WHERE o.id=? AND ${commercialPremium}`,[operatorId]).first())throw failure('La administración de RutasEC debe habilitar tu plan Premium',403);
  await command(db,user,body,'premium_activation',[stmt(db,'INSERT OR IGNORE INTO premium_tenants(operator_id) VALUES(?)',[operatorId])],operatorId);
  return {id:operatorId,enabled:true,plan:'premium_dev',payments:'disabled'};
 }
 if(!entitlement?.active)throw failure('Activa Premium de desarrollo para esta operadora',403);
 if(teamPaths.includes(path))return handleTeam(path,body,user,operatorId,db,c);
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
  if(body.componentPlanId&&!await stmt(db,'SELECT 1 FROM premium_component_plans WHERE id=? AND operator_id=? AND vehicle_id=?',[body.componentPlanId,operatorId,body.vehicleId]).first())throw failure('Control preventivo ajeno',403);
  const saved=await command(db,user,body,'premium_maintenance',[
   stmt(db,'INSERT INTO premium_maintenance(id,operator_id,vehicle_id,summary,starts_at,ends_at,estimated_cost_cents,component_plan_id) VALUES(?,?,?,?,?,?,?,?)',[id,operatorId,body.vehicleId,text(body.summary,'Descripción',200),start,end,integer(body.estimatedCostCents??0,0,100000000,'Costo estimado'),body.componentPlanId||null]),
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
