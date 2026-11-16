import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

test('D1 Standard catalog: authorization, persistence, idempotency and vehicle scheduling', async () => {
  const mf = new Miniflare(convertV4MiniflareOptions({ modules: ['worker.mjs','standard-api.mjs'].map(file => ({
    type: 'ESModule', path: new URL('../' + file, import.meta.url).pathname })),
    d1Databases: ['DB'], r2Buckets: ['BUCKET'], compatibilityDate: '2026-11-01' }));
  try {
    const db = await mf.getD1Database('DB');
    for (const file of ['0001_initial.sql','0002_standard.sql']) {
      const sql = (await readFile(new URL('../../sync-service/migrations/' + file, import.meta.url), 'utf8')).replace(/^--.*$/gm, '');
      const statements = sql.match(/CREATE TRIGGER[\s\S]*?END;|(?:PRAGMA|CREATE TABLE|CREATE INDEX|CREATE UNIQUE INDEX|INSERT)[\s\S]*?;/gi);
      for (const statement of statements) await db.prepare(statement).run();
    }
    const call = async (path, body, token) => {
      const r = await mf.dispatchFetch('https://dev.example/api' + path, { method: body ? 'POST':'GET',
        headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:'Bearer '+token} : {}) },
        body: body ? JSON.stringify(body) : undefined });
      return { status: r.status, data: await r.json() };
    };
    assert.equal((await call('/operator')).status, 401);
    const a = (await call('/sessions', {})).data.token;
    const b = (await call('/sessions', {})).data.token;
    const create = (path, body, token=a) => call(path, {...body,requestId:body.requestId||crypto.randomUUID()}, token);
    const payload={name:'Operadora ficticia',requestId:crypto.randomUUID()};
    const op=await create('/operators',payload); assert.equal(op.status,200);
    assert.equal((await create('/operators',payload)).data.id,op.data.id);
    assert.equal((await create('/operators',{...payload,name:'Distinto'})).status,409);
    const vehicle=await create('/vehicles',{operatorId:op.data.id,type:'van',model:'Ficticio',capacity:8});
    assert.equal(vehicle.status,200);
    assert.equal((await create('/vehicles',{operatorId:op.data.id,type:'van',model:'Ficticio',capacity:8},b)).status,403);
    assert.equal((await create('/vehicles',{operatorId:op.data.id,type:'van',model:'Ficticio',capacity:0})).status,400);
    const offer=await create('/route-offers',{operatorId:op.data.id,vehicleId:vehicle.data.id,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500});
    assert.equal(offer.status,200);
    const departAt=new Date(Date.now()+86400000).toISOString();
    const departure=await create('/departures',{operatorId:op.data.id,offerId:offer.data.id,departAt,durationMinutes:240});
    assert.equal(departure.status,200);
    assert.equal((await create('/departures',{operatorId:op.data.id,offerId:offer.data.id,departAt,durationMinutes:240})).status,409);
    assert.equal((await call('/catalog')).data.departures[0].id,departure.data.id);
    assert.equal((await call('/operator',undefined,b)).data.vehicles.length,0);
    assert.equal((await call('/operator',undefined,a)).data.vehicles.length,1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM departures').first()).n,1);
    assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM audit_events').first()).n,4);
    assert.equal((await db.prepare('SELECT token_hash FROM standard_sessions LIMIT 1').first()).token_hash.includes(a),false);
  } finally { await mf.dispose(); }
});
