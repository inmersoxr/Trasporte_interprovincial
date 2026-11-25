import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';
test('Organization access: existing authority survives, explicit finance is least privilege, tenant scope and revocation remain effective',async()=>{
 const r=await runtime();try{
  const a=(await r.call('/sessions',{})).data,b=(await r.call('/sessions',{})).data,c=(await r.call('/sessions',{})).data;
  const op=(await r.call('/operators',{name:'Empresa de permisos',requestId:crypto.randomUUID()},a.token)).data.id,other=(await r.call('/operators',{name:'Empresa independiente',requestId:crypto.randomUUID()},b.token)).data.id;
  let access=await r.call('/team/access?operatorId='+op,null,a.token);assert.equal(access.status,200);assert.equal(access.data.roles[0].role,'owner');assert.deepEqual(access.data.capabilities,['*']);
  assert.equal((await r.call('/team/access?operatorId='+op,null,b.token)).status,403);assert.equal((await r.call('/team/access?operatorId='+op)).status,401);assert.equal((await r.call('/team/access',{operatorId:op},a.token)).status,405);
  await r.db.prepare("INSERT INTO memberships(user_id,operator_id,role) VALUES(?,?,'driver')").bind(c.userId,op).run();
  access=await r.call('/team/access?operatorId='+op,null,c.token);assert.ok(access.data.capabilities.includes('trips.operate'));assert.ok(!access.data.capabilities.includes('finance.write'));
  await r.db.batch([r.db.prepare('INSERT INTO organization_membership_settings(user_id,operator_id,updated_by,updated_at) VALUES(?,?,?,?)').bind(c.userId,op,a.userId,Date.now()),r.db.prepare("INSERT INTO organization_member_roles(user_id,operator_id,role) VALUES(?,?,'accountant')").bind(c.userId,op)]);
  access=await r.call('/team/access?operatorId='+op,null,c.token);assert.deepEqual(access.data.roles.map(r=>r.role),['accountant']);assert.ok(access.data.capabilities.includes('finance.write'));assert.ok(!access.data.capabilities.includes('trips.operate'));assert.ok(!access.data.capabilities.includes('*'));assert.equal((await r.call('/team/access?operatorId='+other,null,c.token)).status,403);
  const v=(await r.call('/vehicles',{operatorId:other,type:'van',model:'Vehículo de otra empresa',capacity:8,requestId:crypto.randomUUID()},b.token)).data.id;
  await assert.rejects(()=>r.db.prepare('INSERT INTO organization_vehicle_access_grants(user_id,operator_id,vehicle_id) VALUES(?,?,?)').bind(c.userId,op,v).run(),/organization_resource_scope/);
  await r.db.prepare('DELETE FROM memberships WHERE user_id=? AND operator_id=?').bind(c.userId,op).run();assert.equal((await r.call('/team/access?operatorId='+op,null,c.token)).status,403);assert.equal((await r.db.prepare('SELECT COUNT(*) n FROM organization_member_roles WHERE user_id=?').bind(c.userId).first()).n,0);
  access=await r.call('/team/access?operatorId='+op,null,a.token);assert.deepEqual(access.data.capabilities,['*']);
 }finally{await r.mf.dispose();}
});
