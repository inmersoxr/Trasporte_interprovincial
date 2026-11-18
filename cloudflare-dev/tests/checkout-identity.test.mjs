import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';
import {googleProvider} from './google-provider.mjs';
import {handleAuth,APP_ORIGIN,COOKIE,STATE_COOKIE} from '../identity.mjs';
import {verifiedIdentity,stmt,rows,hash,failure} from '../standard-api.mjs';
import {returnPath} from '../account/return-path.mjs';
import {seedReviewedOperator} from './onboarding-fixture.mjs';

test('checkout return paths never redirect to external origins or APIs', () => {
  for (const value of ['https://evil.example/','//evil.example/','/\\evil.example/','/standard/../../api/sessions','/standard/\n/evil','/account/','/standard-api/auth/logout']) assert.equal(returnPath(value),null);
  assert.equal(returnPath('/standard/?reserve=shared:example'),'/standard/?reserve=shared:example');
});

test('Alpha defaults reject unverified legacy access; Google accounts retain tickets across independent sessions', async () => {
  const {mf,db} = await runtime({developmentAuth:false});
  const core = {identity:request=>verifiedIdentity(request,{DB:db}),stmt,rows,hash,failure};
  async function login(provider, next, extra) {
    const env = {DB:db,...provider.env};
    const start = await handleAuth(new Request(APP_ORIGIN+'/auth/google/start'+(next?'?returnTo='+encodeURIComponent(next):'')),env,core);
    const callback = await provider.authorize(start.headers.get('Location'),extra);
    // The real router strips /standard-api before handing the request to the API.
    callback.pathname = callback.pathname.replace('/standard-api','');
    const state = callback.searchParams.get('state');
    const result = await handleAuth(new Request(callback,{headers:{Cookie:STATE_COOKIE+'='+state}}),env,core,provider.network);
    return {result, cookie:result.headers.getSetCookie().find(v=>v.startsWith(COOKIE+'='))?.split(';')[0]};
  }
  const call = async (path, body, cookie, token) => {
    const response = await mf.dispatchFetch(APP_ORIGIN+'/api'+path,{method:body?'POST':'GET',headers:{Origin:APP_ORIGIN,...(cookie?{Cookie:cookie}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
    return {status:response.status,data:await response.json()};
  };
  try {
    assert.equal((await call('/catalog')).status,200);
    assert.equal((await call('/sessions',{})).status,403);
    const legacyUser = crypto.randomUUID(), token = 'a'.repeat(64);
    await db.batch([db.prepare('INSERT INTO users(id,display_name) VALUES(?,?)').bind(legacyUser,'Legacy QA'),db.prepare('INSERT INTO standard_sessions(token_hash,user_id) VALUES(?,?)').bind(await hash(token),legacyUser)]);
    assert.equal((await call('/operator',undefined,undefined,token)).status,403);
    assert.equal((await call('/bookings',{requestId:crypto.randomUUID()},undefined,token)).status,403);
    assert.equal((await call('/bookings',{})).status,401);
    const operator = await googleProvider('operator'), passenger = await googleProvider('passenger');
    const a = await login(operator), b = await login(passenger,'/standard/?reserve=shared:pending');
    assert.ok(a.cookie); assert.ok(b.cookie);
    assert.equal(b.result.headers.get('Location'),APP_ORIGIN+'/standard/?reserve=shared:pending');
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM memberships').first()).n,0);
    const create = (path,body) => call(path,{...body,requestId:crypto.randomUUID()},a.cookie);
    const op = (await create('/operators',{name:'Operador de prueba'})).data.id;
    const vehicle = (await create('/vehicles',{operatorId:op,type:'van',model:'Vehículo de prueba',capacity:2})).data.id;
    await seedReviewedOperator(db,op,vehicle);
    const offer = (await create('/route-offers',{operatorId:op,vehicleId:vehicle,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Referencia de prueba en Cuenca',dropoffPoint:'Referencia de prueba en Guayaquil'})).data.id;
    const departure = (await create('/departures',{operatorId:op,offerId:offer,departAt:new Date(Date.now()+86400000).toISOString()})).data.id;
    const booked = await call('/bookings',{departureId:departure,seatNumbers:[1],passengers:['Pasajero de prueba'],contactPhone:'+593981112233',quotedPriceCents:1500,requestId:crypto.randomUUID()},b.cookie);
    assert.equal(booked.status,200);
    const secondSession = await login(passenger);
    assert.notEqual(secondSession.cookie,b.cookie);
    assert.equal((await call('/bookings',undefined,secondSession.cookie)).data.bookings[0].id,booked.data.booking.id);
    const profile = await handleAuth(new Request(APP_ORIGIN+'/auth/session',{headers:{Cookie:secondSession.cookie}}),{DB:db,...passenger.env},core);
    const user = (await profile.json()).user;
    assert.equal(user.email,'passenger@example.com'); assert.equal(user.hasPassword,0); assert.deepEqual(user.providers,['google']);
    const staleToken='b'.repeat(64);
    await db.prepare('INSERT INTO standard_sessions(token_hash,user_id) VALUES(?,?)').bind(await hash(staleToken),user.id).run();
    assert.equal((await call('/bookings',undefined,undefined,staleToken)).status,403);
    assert.equal((await call('/bookings',undefined,COOKIE+'='+staleToken)).status,403);
    const invalid = await login(await googleProvider('unverified'),undefined,{email_verified:false});
    assert.equal(invalid.cookie,undefined); assert.ok(invalid.result.headers.get('Location').includes('error=signin'));
    const unsafe = await login(passenger,'//evil.example/');
    assert.equal(unsafe.result.headers.get('Location'),APP_ORIGIN+'/account/?signedIn=1');
  } finally { await mf.dispose(); }
});
