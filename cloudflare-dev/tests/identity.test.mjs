import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';
import {handleAuth,verifyGoogleIdToken,APP_ORIGIN,STATE_COOKIE,COOKIE} from '../identity.mjs';import {identity,stmt,rows,hash,failure} from '../standard-api.mjs';
const b64=v=>Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64url');
test('A1 Google: signed JWT claims, PKCE/state, explicit dev linking, revocable cookie and CSRF',async()=>{const {mf,db,call}=await runtime();try{
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']),jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key',use:'sig'},jwks={keys:[jwk]};
 async function jwt(nonce,extra={}){const head=b64({alg:'RS256',kid:'test-key'}),body=b64({iss:'https://accounts.google.com',aud:'client-test',sub:'google-subject',email:'fake@example.com',email_verified:true,name:'Persona ficticia',nonce,iat:Date.now()/1000,exp:Date.now()/1000+3600,...extra}),content=head+'.'+body;return content+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(content))).toString('base64url');}
 const good=await jwt('nonce');assert.equal((await verifyGoogleIdToken(good,{audience:'client-test',nonce:'nonce',jwks})).sub,'google-subject');
 for(const extra of [{aud:'other'},{iss:'evil'},{exp:1},{nonce:'other'},{email_verified:false},{email:null},{email:''},{iat:Date.now()/1000+600}])await assert.rejects(()=>jwt('nonce',extra).then(token=>verifyGoogleIdToken(token,{audience:'client-test',nonce:'nonce',jwks})));
 const tampered=good.split('.');tampered[1]=b64({sub:'attacker'});await assert.rejects(()=>verifyGoogleIdToken(tampered.join('.'),{audience:'client-test',nonce:'nonce',jwks}));
 const dev=(await call('/sessions',{})).data;const op=(await call('/operators',{name:'Cuenta existente',requestId:crypto.randomUUID()},dev.token)).data.id;
 const env={DB:db,GOOGLE_CLIENT_ID:'client-test',GOOGLE_CLIENT_SECRET:'not-a-real-secret'},core={identity,stmt,rows,hash,failure};
 const noConfig=await handleAuth(new Request(APP_ORIGIN+'/auth/google/start'),{DB:db},core);assert.equal(noConfig.status,503);
 await assert.rejects(()=>handleAuth(new Request(APP_ORIGIN+'/auth/google/start',{method:'POST',headers:{Origin:'https://evil.example'},body:'{}'}),env,core),e=>e.status===403);
 const start=await handleAuth(new Request(APP_ORIGIN+'/auth/google/start',{method:'POST',headers:{Origin:APP_ORIGIN,Authorization:'Bearer '+dev.token},body:'{"link":true}'}),env,core);const authUrl=new URL((await start.json()).url),state=authUrl.searchParams.get('state');assert.equal(authUrl.searchParams.get('code_challenge_method'),'S256');assert.ok(start.headers.get('Set-Cookie').includes('HttpOnly'));
 const tx=await db.prepare('SELECT * FROM auth_transactions').first();assert.notEqual(tx.state_hash,state);assert.equal(tx.link_user_id,dev.userId);
 const network=async(target,options)=>{if(target.includes('/token')){assert.equal(options.body.get('code_verifier'),tx.verifier);return Response.json({id_token:await jwt(tx.nonce)});}return Response.json(jwks);};
 const callback=new Request(APP_ORIGIN+'/auth/google/callback?code=fake-code&state='+state,{headers:{Cookie:STATE_COOKIE+'='+state}});
 const done=await handleAuth(callback,env,core,network);assert.equal(done.headers.get('Location'),APP_ORIGIN+'/account/?signedIn=1');const set=done.headers.getSetCookie().find(v=>v.startsWith(COOKIE+'='));assert.ok(set.includes('Secure'));const sessionCookie=set.split(';')[0];
 assert.equal((await identity(new Request(APP_ORIGIN+'/api/operator',{headers:{Cookie:sessionCookie}}),db)).id,dev.userId);
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM users').first()).n,1);assert.equal((await db.prepare('SELECT user_id FROM auth_identities').first()).user_id,dev.userId);
 const account=await handleAuth(new Request(APP_ORIGIN+'/auth/session',{headers:{Cookie:sessionCookie}}),env,core);assert.equal((await account.json()).operators[0].id,op);
 await assert.rejects(()=>identity(new Request(APP_ORIGIN+'/api/operators',{method:'POST',headers:{Cookie:sessionCookie,Origin:'https://evil.example'},body:'{}'}),db),e=>e.status===403);
 const repeated=await handleAuth(callback,env,core,network);assert.ok(repeated.headers.get('Location').includes('error=signin'));
 const logout=await handleAuth(new Request(APP_ORIGIN+'/auth/logout',{method:'POST',headers:{Cookie:sessionCookie,Origin:APP_ORIGIN}}),env,core);assert.equal(logout.status,200);await assert.rejects(()=>identity(new Request(APP_ORIGIN+'/api/operator',{headers:{Cookie:sessionCookie}}),db),e=>e.status===401);
 assert.equal((await call('/operator',undefined,dev.token)).status,200);
 }finally{await mf.dispose();}});
test('A1: Google customer registration reuses subject, never merges by email or grants enterprise roles',async()=>{const {mf,db}=await runtime();try{
 const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']),jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'customer-key'};
 const env={DB:db,GOOGLE_CLIENT_ID:'customer-client',GOOGLE_CLIENT_SECRET:'test-only'},core={identity,stmt,rows,hash,failure};
 async function login(subject,linkToken){const start=await handleAuth(new Request(APP_ORIGIN+'/auth/google/start',linkToken?{method:'POST',headers:{Origin:APP_ORIGIN,Authorization:'Bearer '+linkToken},body:'{"link":true}'}:{}),env,core);const target=linkToken?new URL((await start.json()).url):new URL(start.headers.get('Location')),state=target.searchParams.get('state'),nonce=target.searchParams.get('nonce');
  const content=b64({alg:'RS256',kid:'customer-key'})+'.'+b64({iss:'https://accounts.google.com',aud:'customer-client',sub:subject,email:'same@example.com',email_verified:true,name:'Google ficticio',nonce,iat:Date.now()/1000,exp:Date.now()/1000+300,role:'owner',operatorId:'untrusted'}),token=content+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(content))).toString('base64url');
  return handleAuth(new Request(APP_ORIGIN+'/auth/google/callback?code=synthetic&state='+state,{headers:{Cookie:STATE_COOKIE+'='+state}}),env,core,async url=>Response.json(url.includes('/token')?{id_token:token}:{keys:[jwk]}));
 }
 assert.ok((await login('subject-A')).headers.get('Location').includes('signedIn=1'));assert.equal((await db.prepare('SELECT COUNT(*) n FROM users').first()).n,1);
 await login('subject-A');assert.equal((await db.prepare('SELECT COUNT(*) n FROM users').first()).n,1);
 await login('subject-B');assert.equal((await db.prepare('SELECT COUNT(*) n FROM users').first()).n,2);assert.equal((await db.prepare('SELECT COUNT(*) n FROM memberships').first()).n,0);
 const devId=crypto.randomUUID(),devToken='1'.repeat(64);await db.prepare('INSERT INTO users(id,display_name) VALUES(?,?)').bind(devId,'Otro acceso dev').run();await db.prepare('INSERT INTO standard_sessions(token_hash,user_id) VALUES(?,?)').bind(await hash(devToken),devId).run();const conflict=await login('subject-A',devToken);assert.ok(conflict.headers.get('Location').includes('error=signin'));assert.equal((await db.prepare('SELECT COUNT(*) n FROM auth_identities WHERE user_id=?').bind(devId).first()).n,0);
 await db.prepare('UPDATE standard_sessions SET expires_at=? WHERE user_id=?').bind(Date.now()-1,devId).run();await assert.rejects(()=>identity(new Request(APP_ORIGIN+'/api/operator',{headers:{Authorization:'Bearer '+devToken}}),db),e=>e.status===401);
 }finally{await mf.dispose();}});
