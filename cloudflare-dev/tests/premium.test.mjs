import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';

test('Premium P1: tenant entitlement, monotonic mileage, atomic shared calendar and closure races', async () => {
  const {mf,db,call}=await runtime();
  try {

    const a=(await call('/sessions',{})).data.token,b=(await call('/sessions',{})).data.token;
    const create=(path,body,token=a)=>call(path,{...body,requestId:body.requestId||crypto.randomUUID()},token);
    const op=(await create('/operators',{name:'Premium ficticio'})).data.id;
    const vehicle=(await create('/vehicles',{operatorId:op,type:'van',model:'Flota prueba',capacity:8})).data.id;
    const base={operatorId:op,vehicleId:vehicle};
    assert.equal((await call('/premium?operatorId='+op)).status,401);
    assert.equal((await call('/premium?operatorId='+op,undefined,b)).status,403);
    assert.equal((await call('/premium?operatorId='+op,undefined,a)).data.enabled,false);
    assert.equal((await create('/premium/vehicle-profile',{...base,odometerKm:100})).status,403);
    const activate={operatorId:op,requestId:crypto.randomUUID()};
    assert.equal((await create('/premium/activate',activate,b)).status,403);
    assert.equal((await create('/premium/activate',activate)).status,200);
    assert.equal((await create('/premium/activate',activate)).status,200);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM premium_tenants').first()).n,1);
    assert.equal((await create('/premium/vehicle-profile',{...base,odometerKm:1000,nextServiceKm:1200})).status,200);
    assert.equal((await create('/premium/vehicle-profile',{...base,odometerKm:999})).status,409);
    assert.equal((await create('/premium/vehicle-profile',{...base,odometerKm:2000},b)).status,403);
    const offer=(await create('/route-offers',{...base,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1000})).data.id;
    const at=Date.now()+86400000;
    const job={...base,summary:'Inspección ficticia',startsAt:new Date(at).toISOString(),endsAt:new Date(at+3600000).toISOString(),requestId:crypto.randomUUID()};
    const scheduled=await create('/premium/maintenance',job);assert.equal(scheduled.status,200);
    assert.equal((await create('/premium/maintenance',job)).data.id,scheduled.data.id);
    assert.equal((await create('/premium/maintenance',{...job,summary:'Otro',requestId:crypto.randomUUID()})).status,409);
    const departure={operatorId:op,offerId:offer,departAt:job.startsAt,durationMinutes:60};
    assert.equal((await create('/departures',departure)).status,409);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM premium_maintenance').first()).n,1);
    const close='/premium/maintenance/'+scheduled.data.id;
    assert.equal((await create(close,{operatorId:op,status:'completed'},b)).status,403);
    const race=await Promise.all([create(close,{operatorId:op,status:'completed'}),create(close,{operatorId:op,status:'cancelled'})]);
    assert.deepEqual(race.map(r=>r.status).sort(),[200,409]);
    const winner=race.find(r=>r.status===200).data.status;
    assert.equal((await create(close,{operatorId:op,status:winner})).status,200);
    assert.equal((await create('/departures',departure)).status,200);
    assert.equal((await create('/premium/maintenance',{...job,requestId:crypto.randomUUID()})).status,409);
    const later={...job,startsAt:new Date(at+7200000).toISOString(),endsAt:new Date(at+10800000).toISOString()};
    const competing=await Promise.all([create('/premium/maintenance',{...later,requestId:crypto.randomUUID()}),create('/premium/maintenance',{...later,requestId:crypto.randomUUID()})]);
    assert.deepEqual(competing.map(r=>r.status).sort(),[200,409]);
    const view=(await call('/premium?operatorId='+op,undefined,a)).data;
    assert.equal(view.vehicles[0].odometer_km,1000);assert.equal(view.maintenance.length,2);
    assert.equal(view.payments,'disabled');
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM payments').first()).n,0);
  } finally { await mf.dispose(); }
});
