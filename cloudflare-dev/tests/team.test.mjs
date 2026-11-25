import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';
test('Premium P2: invitations are single-use, role enforcement, scoped assignments and revocation',async()=>{
 const {mf,db,call}=await runtime();try{
 const a=(await call('/sessions',{})).data,b=(await call('/sessions',{})).data,c=(await call('/sessions',{})).data;
 const create=(path,body,token=a.token)=>call(path,{...body,requestId:crypto.randomUUID()},token);
 const op=(await create('/operators',{name:'Empresa equipo ficticio'})).data.id;
 const op2=(await create('/operators',{name:'Otra empresa ficticia'})).data.id;
 const vehicle=(await create('/vehicles',{operatorId:op,type:'van',model:'Van equipo',capacity:8})).data.id;
 await create('/premium/activate',{operatorId:op});await create('/premium/activate',{operatorId:op2});
 const branch=(await create('/premium/branches',{operatorId:op,name:'Central',city:'Cuenca'})).data.id;
 const foreign=(await create('/premium/branches',{operatorId:op2,name:'Ajena',city:'Quito'})).data.id;
 const token='a'.repeat(64);assert.equal((await create('/premium/invites',{operatorId:op,role:'owner',token})).status,400);
 assert.equal((await create('/premium/invites',{operatorId:op,role:'driver',token})).status,200);
 assert.equal((await db.prepare('SELECT token_hash FROM premium_invites').first()).token_hash===token,false);
 const race=await Promise.all([create('/premium/join',{token},b.token),create('/premium/join',{token},c.token)]);
 assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);const member=race[0].status===200?b:c,outsider=member===b?c:b;
 assert.equal((await call('/premium?operatorId='+op,undefined,member.token)).data.vehicles.length,0);
 assert.equal((await create('/premium/assignments',{operatorId:op,vehicleId:vehicle,branchId:foreign,driverUserId:member.userId})).status,403);
 assert.equal((await create('/premium/assignments',{operatorId:op,vehicleId:vehicle,branchId:branch,driverUserId:member.userId})).status,200);
 const view=(await call('/premium?operatorId='+op,undefined,member.token)).data;
 assert.equal(view.vehicles.length,1);assert.equal(view.members.length,0);assert.equal(view.maintenance.length,0);
 assert.equal((await create('/premium/vehicle-profile',{operatorId:op,vehicleId:vehicle,odometerKm:20},member.token)).status,403);
 assert.equal((await create('/premium/invites',{operatorId:op,role:'admin',token:'b'.repeat(64)},member.token)).status,403);
 assert.equal((await call('/premium?operatorId='+op,undefined,outsider.token)).status,403);
 assert.equal((await create('/premium/revoke',{operatorId:op,userId:a.userId})).status,403);
 assert.equal((await create('/premium/revoke',{operatorId:op,userId:member.userId})).status,200);
 assert.equal((await call('/premium?operatorId='+op,undefined,member.token)).status,403);
 assert.equal((await create('/premium/join',{token},member.token)).status,409);
 assert.equal((await db.prepare('SELECT driver_user_id FROM premium_assignments').first()).driver_user_id,null);
 }finally{await mf.dispose();}
});
test('P6: D1 rejects stale assignment after membership revocation, even outside API prechecks',async()=>{const {mf,db,call}=await runtime();try{
 const a=(await call('/sessions',{})).data,b=(await call('/sessions',{})).data;const create=(p,body,t=a.token)=>call(p,{...body,requestId:crypto.randomUUID()},t);
 const operatorId=(await create('/operators',{name:'Integridad equipo'})).data.id;await create('/premium/activate',{operatorId});const vehicleId=(await create('/vehicles',{operatorId,type:'van',model:'Equipo P6',capacity:8})).data.id;const branchId=(await create('/premium/branches',{operatorId,name:'Central',city:'Cuenca'})).data.id;
 const token='f'.repeat(64);await create('/premium/invites',{operatorId,role:'driver',token});await create('/premium/join',{token},b.token);await create('/premium/assignments',{operatorId,vehicleId,branchId,driverUserId:b.userId});
 await db.prepare('DELETE FROM memberships WHERE operator_id=? AND user_id=?').bind(operatorId,b.userId).run();assert.equal((await db.prepare('SELECT driver_user_id FROM premium_assignments').first()).driver_user_id,null);
 await assert.rejects(()=>db.prepare('UPDATE premium_assignments SET driver_user_id=? WHERE vehicle_id=?').bind(b.userId,vehicleId).run(),/assignment_conflict/);
 }finally{await mf.dispose();}});
