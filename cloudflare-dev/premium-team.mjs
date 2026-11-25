import {acceptOrganizationInvite} from './standard-organization-team.mjs';
export async function joinTeam(body,user,db,c){
 const {stmt,failure,hash}=c;
 if(typeof body.token!=='string'||!/^[0-9a-f]{64}$/i.test(body.token))throw failure('Invitación no válida');
 const invite=await stmt(db,'SELECT * FROM premium_invites WHERE token_hash=?',[await hash(body.token)]).first();
 if(!invite||invite.revoked_at||invite.expires_at<Date.now())throw failure('Invitación inexistente o vencida',403);
 const organizationJoin=await acceptOrganizationInvite(body,user,db,c,invite);if(organizationJoin)return organizationJoin;
 const existing=await stmt(db,'SELECT role FROM memberships WHERE operator_id=? AND user_id=?',[invite.operator_id,user.id]).first();
 if(invite.used_by){if(invite.used_by===user.id&&existing)return{operatorId:invite.operator_id,role:existing.role};throw failure('Invitación ya utilizada',409);}
 if(invite.vehicle_id&&!await stmt(db,'SELECT 1 FROM pilot_operators WHERE operator_id=? AND enabled=1',[invite.operator_id]).first())throw failure('El piloto de esta empresa está deshabilitado',403);
 if(existing)throw failure('Ya eres miembro; el propietario debe gestionar el rol',409);
 if(!await stmt(db,'SELECT 1 FROM premium_tenants WHERE operator_id=? AND active=1',[invite.operator_id]).first())throw failure('Premium no habilitado',403);
 await db.batch([
  stmt(db,`INSERT INTO memberships(user_id,operator_id,role) SELECT ?,operator_id,role FROM premium_invites WHERE id=? AND used_by IS NULL AND revoked_at IS NULL AND expires_at>=? AND (vehicle_id IS NULL OR EXISTS(SELECT 1 FROM pilot_operators p WHERE p.operator_id=premium_invites.operator_id AND p.enabled=1))`,[user.id,invite.id,Date.now()]),
  stmt(db,'UPDATE premium_invites SET used_by=? WHERE id=? AND used_by IS NULL AND EXISTS(SELECT 1 FROM memberships WHERE user_id=? AND operator_id=?)',[user.id,invite.id,user.id,invite.operator_id]),
  ...(invite.vehicle_id?[
   stmt(db,`INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) SELECT v.id,v.operator_id,p.branch_id,? FROM vehicles v JOIN pilot_operators p ON p.operator_id=v.operator_id JOIN premium_invites i ON i.id=? WHERE v.id=? AND v.operator_id=? AND p.enabled=1 AND i.used_by=? ON CONFLICT(vehicle_id) DO UPDATE SET driver_user_id=excluded.driver_user_id`,[user.id,invite.id,invite.vehicle_id,invite.operator_id,user.id]),
   stmt(db,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'pilot_driver',?,'invitation_accepted' WHERE EXISTS(SELECT 1 FROM premium_invites WHERE id=? AND used_by=?)",[crypto.randomUUID(),user.id,invite.vehicle_id,invite.id,user.id])]:[])]);
 const used=await stmt(db,'SELECT used_by FROM premium_invites WHERE id=?',[invite.id]).first();
 if(used.used_by!==user.id)throw failure('Invitación utilizada por otra sesión',409);
 return{operatorId:invite.operator_id,role:invite.role};
}
export async function handleTeam(path,body,user,operatorId,db,c){
 const {stmt,command,text,hash,failure}=c,id=crypto.randomUUID();
 if(path==='/api/premium/branches')return{id:await command(db,user,body,'premium_branch',[stmt(db,'INSERT INTO premium_branches(id,operator_id,name,city) VALUES(?,?,?,?)',[id,operatorId,text(body.name,'Sucursal'),text(body.city,'Ciudad')])],id)};
 if(path==='/api/premium/invites'){
  if(!['admin','dispatcher','driver'].includes(body.role)||typeof body.token!=='string'||!/^[0-9a-f]{64}$/i.test(body.token))throw failure('Rol o clave de invitación no válido');
  return{id:await command(db,user,body,'premium_invite',[stmt(db,'INSERT INTO premium_invites(id,operator_id,token_hash,role,expires_at) VALUES(?,?,?,?,?)',[id,operatorId,await hash(body.token),body.role,Date.now()+86400000])],id),expiresInHours:24};
 }
 if(path==='/api/premium/revoke'){
  if(!await stmt(db,"SELECT 1 FROM memberships WHERE operator_id=? AND user_id=? AND role<>'owner'",[operatorId,body.userId]).first())throw failure('Miembro no revocable',403);
  await db.batch([stmt(db,'UPDATE premium_assignments SET driver_user_id=NULL WHERE operator_id=? AND driver_user_id=?',[operatorId,body.userId]),stmt(db,"DELETE FROM memberships WHERE operator_id=? AND user_id=? AND role<>'owner'",[operatorId,body.userId]),stmt(db,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'premium_member',?,'revoked')",[id,user.id,operatorId+':'+body.userId])]);return{revoked:true};
 }
 if(path==='/api/premium/assignments'){
  if(!await stmt(db,'SELECT 1 FROM vehicles v JOIN premium_branches b ON b.operator_id=v.operator_id WHERE v.id=? AND b.id=? AND v.operator_id=?',[body.vehicleId,body.branchId,operatorId]).first())throw failure('Sucursal o vehículo ajeno',403);
  const driver=body.driverUserId||null;
  if(driver&&!await stmt(db,"SELECT 1 FROM organization_effective_roles WHERE user_id=? AND operator_id=? AND role='driver'",[driver,operatorId]).first())throw failure('Conductor ajeno o rol no válido',403);
  return{id:await command(db,user,body,'premium_assignment',[stmt(db,`INSERT INTO premium_assignments(vehicle_id,operator_id,branch_id,driver_user_id) VALUES(?,?,?,?) ON CONFLICT(vehicle_id) DO UPDATE SET branch_id=excluded.branch_id,driver_user_id=excluded.driver_user_id`,[body.vehicleId,operatorId,body.branchId,driver])],body.vehicleId)};
 }
 return null;
}
