// The existing membership remains the tenant boundary. Explicit roles never imply legacy admin.
export const hasCapability=(access,capability)=>access.capabilities.includes('*')||access.capabilities.includes(capability);
export async function organizationAccess(db,userId,operatorId,failure){
 const member=await db.prepare("SELECT m.role,u.display_name FROM memberships m JOIN users u ON u.id=m.user_id AND u.status='active' WHERE m.user_id=? AND m.operator_id=?").bind(userId,operatorId).first();
 if(!member)throw failure('Sin acceso a esta operadora',403);
 const roles=(await db.prepare('SELECT e.role,d.label FROM organization_effective_roles e JOIN organization_role_definitions d ON d.role=e.role WHERE e.user_id=? AND e.operator_id=? ORDER BY d.label').bind(userId,operatorId).all()).results;
 const capabilities=(await db.prepare('SELECT capability FROM organization_capabilities WHERE user_id=? AND operator_id=? ORDER BY capability').bind(userId,operatorId).all()).results.map(r=>r.capability);
 const revision=(await db.prepare('SELECT revision FROM organization_membership_settings WHERE user_id=? AND operator_id=?').bind(userId,operatorId).first())?.revision||0;
 return{userId,operatorId,legacyRole:member.role,roles,capabilities,revision};
}
export async function requireCapability(db,userId,operatorId,capability,failure){const access=await organizationAccess(db,userId,operatorId,failure);if(!hasCapability(access,capability))throw failure('Tu función en la empresa no permite esta acción',403);return access;}
export async function organizationAccessEndpoint(request,env,c){if(request.method!=='GET')throw c.failure('Método no permitido',405);const user=await c.identity(request),op=new URL(request.url).searchParams.get('operatorId');return organizationAccess(env.DB,user.id,op,c.failure);}
export function enterpriseCapability(path,method,kind){
 if(method==='GET'){
  if(path===''||path==='/')return null;
  if(path==='/fleet')return 'fleet.track';if(path==='/vehicle-history')return 'vehicle.history.read';
  if(path==='/report')return 'reports.read';if(path==='/issuer'||path==='/document-payments'||path.startsWith('/fiscal/'))return 'finance.read';
  if(path==='/payroll-lines')return 'payroll.write';if(path==='/page')return({employees:'employees.basic',partners:'customers.write',documents:'finance.read',shifts:'shifts.write',payroll:'payroll.write'})[kind];
 }else if(method==='POST'){
  if(['/employees','/employee-update','/employee-status'].includes(path))return 'employees.write';
  if(['/partners','/partner-update'].includes(path))return 'customers.write';
  if(['/shifts','/shift-state'].includes(path))return 'shifts.write';
  if(['/payroll','/payroll-post','/payroll-void'].includes(path))return 'payroll.write';
  if(['/component-plans','/component-plan-update'].includes(path))return 'maintenance.write';
  if(path==='/direct-sale')return 'sales.write';
  if(['/issuer','/documents','/document-update','/payments','/document-void','/settlements','/settlement-state','/fiscal-submit'].includes(path))return 'finance.write';
 }
 return undefined;
}
