import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';import {googleProvider} from './google-provider.mjs';
import {handleAuth,APP_ORIGIN,COOKIE,STATE_COOKIE} from '../identity.mjs';
import {verifiedIdentity,stmt,rows,hash,failure,owner} from '../standard-api.mjs';
import {handleOnboarding} from '../standard-onboarding.mjs';

test('Alpha onboarding: verified identity is not approval; private R2 documents, reviewed fleet and expiry guard real publication',async()=>{
 const {mf,db}=await runtime({developmentAuth:false}),core={identity:r=>verifiedIdentity(r,{DB:db}),stmt,rows,hash,failure};
 async function actor(name){
  const provider=await googleProvider(name),env={DB:db,...provider.env},start=await handleAuth(new Request(APP_ORIGIN+'/auth/google/start'),env,core);
  const target=await provider.authorize(start.headers.get('Location'));target.pathname='/auth/google/callback';
  const response=await handleAuth(new Request(target,{headers:{Cookie:STATE_COOKIE+'='+target.searchParams.get('state')}}),env,core,provider.network),cookie=response.headers.getSetCookie().find(c=>c.startsWith(COOKIE+'=')).split(';')[0];
  async function call(path,body){const response=await mf.dispatchFetch(APP_ORIGIN+'/api'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:APP_ORIGIN,'Content-Type':'application/json'},body:body?JSON.stringify({...body,requestId:body.requestId||crypto.randomUUID()}):undefined});return{status:response.status,data:await response.json()};}
  return{cookie,call};
 }
 try{
  await db.prepare('UPDATE platform_owner_email_policy SET email_hash=?').bind(await hash('platform-reviewer@example.com')).run();
  const admin=await actor('platform-reviewer'),op=await actor('operator-owner'),other=await actor('other-operator');
  assert.equal((await admin.call('/platform/me')).data.role,'owner');
  assert.equal((await op.call('/platform/me')).status,403);
  const operatorId=(await op.call('/operators',{name:'Prestador Alpha'})).data.id;
  const vehicleId=(await op.call('/vehicles',{operatorId,type:'van',model:'Van de prueba',capacity:8})).data.id;
  assert.equal((await db.prepare('SELECT status FROM operators WHERE id=?').bind(operatorId).first()).status,'pending');
  const route={operatorId,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1500,pickupPoint:'Referencia de prueba en Cuenca',dropoffPoint:'Referencia de prueba en Guayaquil'};
  assert.equal((await op.call('/route-offers',route)).status,403);
  const profile={operatorId,kind:'individual',name:'Prestador Alpha',legalName:'Persona de prueba',responsibleName:'Responsable de prueba',phone:'+593990000000',contactEmail:'operador@example.com',baseCity:'Cuenca',address:'Dirección de prueba',taxId:'',expectedRevision:0};
  assert.equal((await op.call('/operator-profile',profile)).status,200);
  const revisionRace=await Promise.all([op.call('/operator-profile',{...profile,name:'Nombre A',expectedRevision:1}),op.call('/operator-profile',{...profile,name:'Nombre B',expectedRevision:1})]);
  assert.deepEqual(revisionRace.map(r=>r.status).sort(),[200,409]);
  const driver=(await op.call('/operator-drivers',{operatorId,fullName:'Conductor de prueba',phone:'+593990000000',identityNumber:'Documento de prueba',licenseNumber:'Licencia de prueba',licenseCategory:'AB',licenseExpiresOn:'2099-12-31',expectedRevision:0}));assert.equal(driver.status,200);const driverId=driver.data.id;
  assert.equal((await op.call('/vehicle-details',{operatorId,vehicleId,driverId,plate:'ABC-1234',brand:'Marca de prueba',model:'Van de prueba',year:2024,color:'Blanco',capacity:8,expectedRevision:0})).status,200);
  assert.equal((await other.call('/operator-onboarding?operatorId='+operatorId)).status,403);
  assert.equal((await op.call('/operator-submit',{operatorId,expectedRevision:1})).status,409);
  const bytes=new TextEncoder().encode('%PDF-1.4\nDocumento simulado para pruebas\n%%EOF');
  const badQuery=new URLSearchParams({operatorId,kind:'identity',subjectId:operatorId,requestId:crypto.randomUUID()});
  const badFile=await mf.dispatchFetch(APP_ORIGIN+'/api/operator-documents?'+badQuery,{method:'POST',headers:{Cookie:op.cookie,Origin:APP_ORIGIN,'Content-Type':'application/pdf'},body:'<html>not a PDF</html>'});assert.equal(badFile.status,400);
  // Exercise the real streamed size guard directly: Miniflare's HTTP bridge can
  // raise EPIPE when a server rejects/cancels a 5MB request before it finishes writing.
  const oversized=new Request(APP_ORIGIN+'/api/operator-documents?'+badQuery,{method:'POST',headers:{Cookie:op.cookie,Origin:APP_ORIGIN,'Content-Type':'application/pdf'},body:new Uint8Array(5242881)});
  await assert.rejects(()=>handleOnboarding(oversized,{DB:db},{...core,owner}),e=>e.status===413);
  async function upload(kind,subjectId,requestId=crypto.randomUUID()){
   const query=new URLSearchParams({operatorId,kind,subjectId,requestId,expiresOn:'2099-12-31',filename:'Documento de prueba.pdf'});
   const response=await mf.dispatchFetch(APP_ORIGIN+'/api/operator-documents?'+query,{method:'POST',headers:{Cookie:op.cookie,Origin:APP_ORIGIN,'Content-Type':'application/pdf'},body:bytes});return{status:response.status,data:await response.json()};
  }
  const firstKey=crypto.randomUUID(),copies=await Promise.all([upload('identity',operatorId,firstKey),upload('identity',operatorId,firstKey)]);
  assert.ok(copies.every(c=>c.status===200));assert.equal(copies[0].data.id,copies[1].data.id);
  for(const [kind,id]of [['authorization',operatorId],['license',driverId],['registration',vehicleId],['insurance',vehicleId],['inspection',vehicleId]])assert.equal((await upload(kind,id)).status,200);
  const bucket=await mf.getR2Bucket('BUCKET');assert.equal((await bucket.list()).objects.length,6);
  const documentId=copies[0].data.id;
  assert.equal((await mf.dispatchFetch(APP_ORIGIN+'/api/operator-documents/'+documentId)).status,401);
  assert.equal((await other.call('/operator-documents/'+documentId)).status,403);
  const downloaded=await mf.dispatchFetch(APP_ORIGIN+'/api/operator-documents/'+documentId,{headers:{Cookie:op.cookie}});
  assert.equal(downloaded.status,200);assert.equal(downloaded.headers.get('Cache-Control'),'no-store');assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()),bytes);
  let data=(await op.call('/operator-onboarding?operatorId='+operatorId)).data;assert.equal(data.documented,true);
  assert.equal((await op.call('/operator-submit',{operatorId,expectedRevision:data.profile.revision})).status,200);
  data=(await op.call('/operator-onboarding?operatorId='+operatorId)).data;
  const decision={operatorId,expectedRevision:data.profile.revision,decision:'approved',note:'Expediente ficticio revisado en prueba local',requestId:crypto.randomUUID()};
  assert.equal((await op.call('/platform/operator-review',decision)).status,403);
  assert.equal((await admin.call('/platform/operator-review',decision)).status,200);
  assert.equal((await admin.call('/platform/operator-review',decision)).status,200);
  const offer=(await op.call('/route-offers',route));assert.equal(offer.status,200);
  const departure=(await op.call('/departures',{operatorId,offerId:offer.data.id,departAt:new Date(Date.now()+86400000).toISOString()}));assert.equal(departure.status,200);
  assert.equal((await other.call('/catalog')).data.departures.length,1);
  const booking={departureId:departure.data.id,seatNumbers:[1],passengers:['Pasajero de prueba'],contactPhone:'+593981112233',quotedPriceCents:1500};
  const ticket=await other.call('/bookings',booking);assert.equal(ticket.status,200);
  // Clock-passage fixture: expired documents must fail even while status says approved.
  await db.prepare("UPDATE standard_drivers SET license_expires_on='2000-01-01' WHERE id=?").bind(driverId).run();
  assert.equal((await other.call('/catalog')).data.departures.length,0);
  assert.equal((await other.call('/bookings',{...booking,seatNumbers:[2]})).status,409);
  assert.equal((await other.call('/bookings/'+ticket.data.booking.id)).data.booking.status,'confirmed');
 }finally{await mf.dispose();}
});
