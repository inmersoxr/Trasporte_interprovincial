import {organizationAccess,requireCapability,hasCapability} from './standard-organization-access.mjs';
import {APP_ORIGIN,requireOrigin} from './identity.mjs';
const validId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/i.test(id);
const validToken=t=>typeof t==='string'&&/^[a-f0-9]{64}$/i.test(t);
const one=(db,sql,args=[])=>db.prepare(sql).bind(...args).first();
const all=async(db,sql,args=[])=>(await db.prepare(sql).bind(...args).all()).results;
function translate(error,failure){
 const message=String(error.message);
 if(/organization_team_access|organization_member_owner|organization_resource_scope/.test(message))throw failure('Tu acceso no permite cambiar ese registro',403);
 if(/organization_member_revision/.test(message))throw failure('Los accesos cambiaron en otra sesión. Actualiza antes de guardar.',409);
 if(/organization_invite_claim|UNIQUE constraint failed: organization_invite_claims/.test(message))throw failure('La invitación cambió, fue utilizada o ya no puede aceptarse.',409);
 throw error;
}
async function storedMember(db,userId,op,failure){
 const m=await one(db,'SELECT role FROM memberships WHERE user_id=? AND operator_id=?',[userId,op]);if(!m)throw failure('Esta persona ya no forma parte de la empresa',404);
 let roles=await all(db,'SELECT r.role,d.label FROM organization_member_roles r JOIN organization_role_definitions d ON d.role=r.role WHERE r.user_id=? AND r.operator_id=?',[userId,op]);
 if(m.role==='owner'||!await one(db,'SELECT 1 FROM organization_membership_settings WHERE user_id=? AND operator_id=?',[userId,op])){const legacy=await one(db,'SELECT role,label FROM organization_role_definitions WHERE role=?',[m.role]);if(!roles.some(r=>r.role===m.role))roles.push(legacy);}
 return{legacyRole:m.role,roles};
}
export async function previewOrganizationInvite(db,token,c){
 if(!validToken(token))throw c.failure('Invitación no disponible',404);
 const invite=await one(db,`SELECT i.*,o.display_name,v.model,v.plate,x.created_by FROM premium_invites i JOIN operators o ON o.id=i.operator_id LEFT JOIN vehicles v ON v.id=i.vehicle_id LEFT JOIN organization_invitation_context x ON x.invite_id=i.id WHERE i.token_hash=? AND i.revoked_at IS NULL AND i.expires_at>?`,[await c.hash(token),Date.now()]);
 if(!invite)throw c.failure('Invitación vencida o revocada',404);
 if(invite.created_by&&!await one(db,"SELECT 1 FROM organization_capabilities WHERE user_id=? AND operator_id=? AND capability IN('*','team.manage')",[invite.created_by,invite.operator_id]))throw c.failure('Invitación revocada',404);
 const roles=invite.created_by?await all(db,'SELECT r.role,d.label FROM organization_invitation_roles r JOIN organization_role_definitions d ON d.role=r.role WHERE r.invite_id=? ORDER BY d.label',[invite.id]):await all(db,'SELECT role,label FROM organization_role_definitions WHERE role=?',[invite.role]);
 return{company:invite.display_name,vehicle:invite.model||null,plate:invite.plate||null,expiresAt:invite.expires_at,used:!!invite.used_by,roles,role:roles.map(r=>r.label).join(', ')};
}
export async function acceptOrganizationInvite(body,user,db,c,invite){
 const context=await one(db,'SELECT * FROM organization_invitation_context WHERE invite_id=?',[invite.id]);
 if(!context)return null;
 const existing=await one(db,'SELECT role FROM memberships WHERE user_id=? AND operator_id=?',[user.id,invite.operator_id]);
 if(invite.used_by){if(invite.used_by===user.id&&existing)return{operatorId:invite.operator_id,access:await organizationAccess(db,user.id,invite.operator_id,c.failure)};throw c.failure('Invitación ya utilizada',409);}
 const granted=(await all(db,'SELECT role FROM organization_invitation_roles WHERE invite_id=?',[invite.id])).map(r=>r.role);
 const current=existing?(await organizationAccess(db,user.id,invite.operator_id,c.failure)).roles.map(r=>r.role):[];
 const merged=[...new Set([...current,...granted])].filter(role=>role!=='owner'),now=Date.now();
 if(!granted.length)throw c.failure('Invitación incompleta',409);
 const s=(sql,args=[])=>db.prepare(sql).bind(...args);
 try{await db.batch([
  s('INSERT INTO organization_invite_claims(invite_id,user_id,claimed_at) VALUES(?,?,?)',[invite.id,user.id,now]),
  s("INSERT OR IGNORE INTO memberships(user_id,operator_id,role) VALUES(?,?,'driver')",[user.id,invite.operator_id]),
  s('INSERT INTO organization_membership_settings(user_id,operator_id,updated_by,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,operator_id) DO UPDATE SET revision=revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at',[user.id,invite.operator_id,context.created_by,now]),
  s('INSERT OR IGNORE INTO organization_member_roles(user_id,operator_id,role) SELECT ?,?,value FROM json_each(?)',[user.id,invite.operator_id,JSON.stringify(merged)]),
  s('INSERT OR IGNORE INTO organization_vehicle_access_grants(user_id,operator_id,vehicle_id) SELECT ?,?,vehicle_id FROM organization_invitation_vehicles WHERE invite_id=?',[user.id,invite.operator_id,invite.id]),
  ...(context.driver_id?[s('UPDATE standard_drivers SET user_id=?,revision=revision+1 WHERE id=? AND operator_id=? AND (user_id IS NULL OR user_id=?)',[user.id,context.driver_id,invite.operator_id,user.id])]:[]),
  ...(invite.vehicle_id&&context.driver_id?[s('UPDATE vehicles SET default_driver_id=?,revision=revision+1 WHERE id=? AND operator_id=?',[context.driver_id,invite.vehicle_id,invite.operator_id]),s('UPDATE standard_vehicle_details SET driver_id=?,revision=revision+1 WHERE vehicle_id=?',[context.driver_id,invite.vehicle_id])]:[]),
  ...(invite.vehicle_id?[s('INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) VALUES(?,?,?,?) ON CONFLICT(vehicle_id) DO UPDATE SET driver_user_id=excluded.driver_user_id',[invite.vehicle_id,invite.operator_id,context.branch_id,user.id])]:[]),
  s('UPDATE premium_invites SET used_by=? WHERE id=? AND used_by IS NULL',[user.id,invite.id]),
  s("INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'organization_member',?,'invitation_accepted')",[crypto.randomUUID(),user.id,invite.operator_id+':'+user.id])
 ]);}catch(error){
  const used=await one(db,'SELECT used_by FROM premium_invites WHERE id=?',[invite.id]);
  if(used?.used_by===user.id&&await one(db,'SELECT 1 FROM memberships WHERE user_id=? AND operator_id=?',[user.id,invite.operator_id]))return{operatorId:invite.operator_id,access:await organizationAccess(db,user.id,invite.operator_id,c.failure)};
  translate(error,c.failure);
 }
 return{operatorId:invite.operator_id,access:await organizationAccess(db,user.id,invite.operator_id,c.failure)};
}
export async function organizationTeam(request,env,c){
 const db=env.DB,url=new URL(request.url),path=url.pathname.slice('/api/team'.length);
 let body={};
 if(request.method==='POST'){requireOrigin(request,c.failure);const raw=await request.text();if(raw.length>16384)throw c.failure('Solicitud demasiado grande',413);try{body=JSON.parse(raw);}catch{throw c.failure('Solicitud no válida');}if(!body||typeof body!=='object'||Array.isArray(body))throw c.failure('Solicitud no válida');}
 if(path==='/preview'&&request.method==='POST')return previewOrganizationInvite(db,body.token,c);
 const user=await c.identity(request),op=request.method==='GET'?url.searchParams.get('operatorId'):body.operatorId;
 const access=await requireCapability(db,user.id,op,'team.manage',c.failure);
 if(request.method==='GET'&&(path===''||path==='/')){
  const members=await all(db,'SELECT m.user_id,m.role,u.display_name,u.status AS accountStatus,COALESCE(s.revision,0) revision FROM memberships m JOIN users u ON u.id=m.user_id LEFT JOIN organization_membership_settings s ON s.user_id=m.user_id AND s.operator_id=m.operator_id WHERE m.operator_id=? ORDER BY u.display_name',[op]);
  const definitions=await all(db,'SELECT role,label,capabilities_json,assignable FROM organization_role_definitions');
  const grants=await all(db,'SELECT user_id,role FROM organization_member_roles WHERE operator_id=?',[op]),resources=await all(db,'SELECT user_id,vehicle_id FROM organization_vehicle_access_grants WHERE operator_id=?',[op]);
  for(const member of members){member.roles=grants.filter(r=>r.user_id===member.user_id).map(r=>({role:r.role,label:definitions.find(d=>d.role===r.role).label}));if(member.role==='owner'||member.revision===0){const d=definitions.find(d=>d.role===member.role);if(!member.roles.some(r=>r.role===d.role))member.roles.push({role:d.role,label:d.label});}member.vehicleIds=resources.filter(r=>r.user_id===member.user_id).map(r=>r.vehicle_id);}
  const cursor=url.searchParams.get('inviteCursor'),before=cursor&&await one(db,'SELECT id,created_at FROM premium_invites WHERE id=? AND operator_id=?',[cursor,op]);if(cursor&&!before)throw c.failure('Página de invitaciones no disponible',404);
  let invites=await all(db,'SELECT i.id,i.label,i.role,i.expires_at,i.used_by,i.revoked_at,v.model,x.contact_phone FROM premium_invites i LEFT JOIN vehicles v ON v.id=i.vehicle_id LEFT JOIN organization_invitation_context x ON x.invite_id=i.id WHERE i.operator_id=?'+(before?' AND (i.created_at<? OR (i.created_at=? AND i.id<?))':'')+' ORDER BY i.created_at DESC,i.id DESC LIMIT 101',[op,...(before?[before.created_at,before.created_at,before.id]:[])]);
  const nextInviteCursor=invites.length>100?invites[99].id:null;invites=invites.slice(0,100);
  const invitedRoles=await all(db,'SELECT r.invite_id,r.role,d.label FROM organization_invitation_roles r JOIN organization_role_definitions d ON d.role=r.role WHERE r.invite_id IN(SELECT value FROM json_each(?))',[JSON.stringify(invites.map(i=>i.id))]);
  for(const invite of invites){invite.roles=invitedRoles.filter(r=>r.invite_id===invite.id).map(({role,label})=>({role,label}));if(!invite.roles.length){const legacy=definitions.find(r=>r.role===invite.role);invite.roles=[{role:legacy.role,label:legacy.label}];}}

  return{access,members,invites,nextInviteCursor,roles:definitions.filter(r=>r.assignable),vehicles:await all(db,'SELECT v.id,v.model,v.plate,v.default_driver_id,a.driver_user_id FROM vehicles v LEFT JOIN premium_assignments a ON a.vehicle_id=v.id WHERE v.operator_id=? ORDER BY v.model',[op]),drivers:await all(db,"SELECT id,full_name,phone,user_id FROM standard_drivers WHERE operator_id=? AND status='active' ORDER BY full_name",[op])};
 }
 if(request.method!=='POST')throw c.failure('Método no permitido',405);
 if(!validId(body.requestId))throw c.failure('Falta la clave de esta operación');
 const expectedKind=({'/invite':'organization_invite','/revoke-invite':'organization_invite_revoke','/member':'organization_member_update','/revoke-member':'organization_member_revoke'})[path];
 const replay=await one(db,'SELECT kind,entity_id FROM standard_commands WHERE user_id=? AND request_id=?',[user.id,body.requestId]);
 if(replay&&expectedKind){await c.command(db,user,body,expectedKind,[],replay.entity_id);if(path==='/invite'){const saved=await one(db,'SELECT expires_at FROM premium_invites WHERE id=? AND operator_id=?',[replay.entity_id,op]);return{id:replay.entity_id,expiresAt:saved?.expires_at||0,url:APP_ORIGIN+'/join/#token='+body.token};}if(path==='/member')return{saved:true,userId:replay.entity_id};return{revoked:true};}

 const statement=(sql,args=[])=>c.stmt(db,sql,args),assertion=(operation,target=null,revision=null)=>statement('INSERT INTO organization_team_assertions(actor_id,request_id,operator_id,target_id,expected_revision,operation) VALUES(?,?,?,?,?,?)',[user.id,body.requestId,op,target,revision,operation]);
 async function validateRoles(current=[]){
  if(!Array.isArray(body.roles)||body.roles.length>8||new Set(body.roles).size!==body.roles.length||body.roles.some(r=>typeof r!=='string'))throw c.failure('Selecciona las funciones de esta persona');
  const catalog=await all(db,'SELECT role,assignable FROM organization_role_definitions');
  if(body.roles.some(role=>!catalog.some(r=>r.role===role&&(r.assignable||current.includes(role)&&role!=='owner'))))throw c.failure('Una de las funciones no se puede asignar',403);
  return body.roles;
 }
 async function validateVehicles(roles){const ids=body.vehicleIds||[];if(!Array.isArray(ids)||ids.length>100||new Set(ids).size!==ids.length||ids.some(id=>!validId(id)))throw c.failure('Selecciona vehículos válidos');if(roles.includes('vehicle_owner')&&!ids.length)throw c.failure('Selecciona los vehículos a los que tendrá acceso el propietario');const own=await all(db,'SELECT id FROM vehicles WHERE operator_id=? AND id IN(SELECT value FROM json_each(?))',[op,JSON.stringify(ids)]);if(own.length!==ids.length)throw c.failure('Vehículo de otra empresa',403);return ids;}
 try{
  if(path==='/invite'){
   const roles=await validateRoles(),vehicles=await validateVehicles(roles);if(!roles.length||!validToken(body.token))throw c.failure('Selecciona una función y genera una invitación válida');
   const label=c.text(body.name,'Nombre',120),phone=String(body.phone||'').trim();if(phone&&!/^\+[1-9]\d{7,14}$/.test(phone))throw c.failure('Escribe el número con código internacional, por ejemplo +593');
   if(body.driverId&&(!roles.includes('driver')||!await one(db,'SELECT 1 FROM standard_drivers WHERE id=? AND operator_id=? AND user_id IS NULL',[body.driverId,op])))throw c.failure('Selecciona una ficha de conductor sin cuenta vinculada',409);
   if(body.vehicleId&&(!roles.includes('driver')||!await one(db,'SELECT 1 FROM vehicles WHERE id=? AND operator_id=?',[body.vehicleId,op])))throw c.failure('Vehículo ajeno o función incompatible',403);
   if(body.vehicleId&&await one(db,'SELECT 1 FROM premium_assignments WHERE vehicle_id=? AND driver_user_id IS NOT NULL',[body.vehicleId]))throw c.failure('Ese vehículo ya tiene una cuenta de conductor asignada',409);
   const id=(await c.hash(user.id+':'+body.requestId)).slice(0,32).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5'),now=Date.now();
   let branch=body.vehicleId?(await one(db,'SELECT id FROM premium_branches WHERE operator_id=? ORDER BY created_at LIMIT 1',[op]))?.id:null;
   const operations=[assertion('invite')];
   if(body.vehicleId&&!branch){branch=crypto.randomUUID();operations.push(statement("INSERT INTO premium_branches(id,operator_id,name,city) VALUES(?,?,'Operación principal',COALESCE((SELECT base_city FROM standard_operator_profiles WHERE operator_id=?),'Cuenca'))",[branch,op,op]));}
   operations.push(statement("INSERT INTO premium_invites(id,operator_id,token_hash,role,expires_at,vehicle_id,label) VALUES(?,?,?,'driver',?,?,?)",[id,op,await c.hash(body.token),now+86400000,body.vehicleId||null,label]),statement('INSERT INTO organization_invitation_context(invite_id,created_by,contact_phone,driver_id,branch_id,previous_driver_id) VALUES(?,?,?,?,?,(SELECT default_driver_id FROM vehicles WHERE id=? AND operator_id=?))',[id,user.id,phone,body.driverId||null,branch,body.vehicleId||null,op]),statement('INSERT INTO organization_invitation_roles(invite_id,role) SELECT ?,value FROM json_each(?)',[id,JSON.stringify(roles)]),statement('INSERT INTO organization_invitation_vehicles(invite_id,vehicle_id) SELECT ?,value FROM json_each(?)',[id,JSON.stringify(vehicles)]));
   await c.command(db,user,body,'organization_invite',operations,id);
   const saved=await one(db,'SELECT expires_at FROM premium_invites WHERE id=?',[id]);
   return{id,expiresAt:saved.expires_at,url:APP_ORIGIN+'/join/#token='+body.token};
  }
  if(path==='/revoke-invite'){
   const invite=await one(db,'SELECT id FROM premium_invites WHERE id=? AND operator_id=?',[body.id,op]);if(!invite)throw c.failure('Invitación de otra empresa',403);
   await c.command(db,user,body,'organization_invite_revoke',[assertion('invite'),statement('UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE id=? AND operator_id=?',[Date.now(),body.id,op])],body.id);return{revoked:true};
  }
  if(path==='/member'||path==='/revoke-member'){
   if(!validId(body.userId)||!Number.isSafeInteger(body.expectedRevision)||body.expectedRevision<0)throw c.failure('Selecciona una persona y actualiza sus accesos');
   const member=await storedMember(db,body.userId,op,c.failure);
   if(path==='/revoke-member'){
    await c.command(db,user,body,'organization_member_revoke',[assertion('revoke',body.userId,body.expectedRevision),statement('UPDATE premium_invites SET revoked_at=?,expires_at=0 WHERE id IN(SELECT invite_id FROM organization_invitation_context WHERE created_by=?) AND operator_id=? AND used_by IS NULL',[Date.now(),body.userId,op]),statement('DELETE FROM memberships WHERE user_id=? AND operator_id=?',[body.userId,op])],body.userId);return{revoked:true};
   }
   const roles=await validateRoles(member.roles.map(r=>r.role)),vehicles=await validateVehicles(roles);if(!roles.length&&member.legacyRole!=='owner')throw c.failure('Selecciona al menos una función o revoca el acceso');
   const operations=[assertion('member',body.userId,body.expectedRevision)];
   if(body.driverId&&(!roles.includes('driver')||!await one(db,'SELECT 1 FROM standard_drivers WHERE id=? AND operator_id=? AND (user_id IS NULL OR user_id=?)',[body.driverId,op,body.userId])))throw c.failure('La ficha de conductor pertenece a otra cuenta o empresa',409);
   if(body.driverId&&await one(db,'SELECT 1 FROM standard_drivers WHERE operator_id=? AND user_id=? AND id<>?',[op,body.userId,body.driverId]))throw c.failure('Esta cuenta ya tiene una ficha de conductor. Reutiliza esa ficha.',409);
   let branch=null;
   if(body.vehicleId){if(!roles.includes('driver')||!await one(db,'SELECT 1 FROM vehicles WHERE id=? AND operator_id=?',[body.vehicleId,op]))throw c.failure('Vehículo ajeno o función incompatible',403);if(await one(db,'SELECT 1 FROM premium_assignments WHERE vehicle_id=? AND driver_user_id IS NOT NULL AND driver_user_id<>?',[body.vehicleId,body.userId]))throw c.failure('El vehículo ya tiene otro conductor asignado',409);branch=(await one(db,'SELECT id FROM premium_branches WHERE operator_id=? ORDER BY created_at LIMIT 1',[op]))?.id;if(!branch){branch=crypto.randomUUID();operations.push(statement("INSERT INTO premium_branches(id,operator_id,name,city) VALUES(?,?,'Operación principal',COALESCE((SELECT base_city FROM standard_operator_profiles WHERE operator_id=?),'Cuenca'))",[branch,op,op]));}}

   if(!roles.includes('driver'))operations.push(statement('UPDATE premium_assignments SET driver_user_id=NULL WHERE operator_id=? AND driver_user_id=?',[op,body.userId]),statement('UPDATE standard_drivers SET user_id=NULL WHERE operator_id=? AND user_id=?',[op,body.userId]));
   operations.push(statement("UPDATE memberships SET role='driver' WHERE user_id=? AND operator_id=? AND role<>'owner'",[body.userId,op]),statement('INSERT INTO organization_membership_settings(user_id,operator_id,updated_by,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,operator_id) DO UPDATE SET revision=revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at',[body.userId,op,user.id,Date.now()]),statement('DELETE FROM organization_member_roles WHERE user_id=? AND operator_id=?',[body.userId,op]),statement('INSERT INTO organization_member_roles(user_id,operator_id,role) SELECT ?,?,value FROM json_each(?)',[body.userId,op,JSON.stringify(roles)]),statement('DELETE FROM organization_vehicle_access_grants WHERE user_id=? AND operator_id=?',[body.userId,op]),statement('INSERT INTO organization_vehicle_access_grants(user_id,operator_id,vehicle_id) SELECT ?,?,value FROM json_each(?)',[body.userId,op,JSON.stringify(vehicles)]));
   if(body.driverId)operations.push(statement('UPDATE standard_drivers SET user_id=?,revision=revision+1 WHERE id=? AND operator_id=? AND (user_id IS NULL OR user_id=?)',[body.userId,body.driverId,op,body.userId]));
   if(body.vehicleId&&body.driverId)operations.push(statement('UPDATE vehicles SET default_driver_id=?,revision=revision+1 WHERE id=? AND operator_id=?',[body.driverId,body.vehicleId,op]),statement('UPDATE standard_vehicle_details SET driver_id=?,revision=revision+1 WHERE vehicle_id=?',[body.driverId,body.vehicleId]));
   if(body.vehicleId)operations.push(statement('INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) VALUES(?,?,?,?) ON CONFLICT(vehicle_id) DO UPDATE SET driver_user_id=excluded.driver_user_id',[body.vehicleId,op,branch,body.userId]));
   await c.command(db,user,body,'organization_member_update',operations,body.userId);return{access:await organizationAccess(db,body.userId,op,c.failure)};
  }
  throw c.failure('Ruta no encontrada',404);
 }catch(error){translate(error,c.failure);}
}
