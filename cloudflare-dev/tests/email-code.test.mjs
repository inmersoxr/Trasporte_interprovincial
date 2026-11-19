import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime.mjs';
import {handleAuth,APP_ORIGIN} from '../identity.mjs';
import {identity,stmt,rows,hash,failure} from '../standard-api.mjs';
const core={identity,stmt,rows,hash,failure},password='Una frase privada para el código';
async function fixture(){
 const r=await runtime({developmentAuth:false}),messages=[];
 const env={DB:r.db,AUTH_EMAIL_FROM:'cuentas@example.com',AUTH_EMAIL:{send:async m=>{messages.push(m);return{messageId:crypto.randomUUID()};}}};let n=0;
 async function call(path,body){try{const response=await handleAuth(new Request(APP_ORIGIN+'/auth/email/'+path,{method:'POST',headers:{Origin:APP_ORIGIN,'Content-Type':'application/json','CF-Connecting-IP':'code-test-'+(++n)},body:JSON.stringify(body)}),env,core);return{status:response.status,data:await response.json(),cookie:response.headers.get('Set-Cookie')};}catch(e){return{status:e.status||503,data:{error:e.message}};}}
 const code=()=>messages.at(-1).text.match(/\b\d{6}\b/)[0];return{...r,env,messages,call,code};
}
test('Alpha email code: pending password is hashed; mailbox proof activates once and legacy-token bypass fails',async()=>{
 const f=await fixture();try{
  const start=await f.call('register',{email:'new@example.com',name:'Nueva cuenta',password});assert.equal(start.status,200);const challenge=start.data.challenge,code=f.code();
  assert.match(challenge,/^[a-f0-9]{64}$/);assert.equal(JSON.stringify(start.data).includes(code),false);
  const pending=await f.db.prepare('SELECT * FROM auth_email_actions').first();assert.notEqual(pending.token_hash,challenge);assert.notEqual(pending.code_hash,code);assert.ok(pending.pending_password_hash.startsWith('scrypt$'));assert.notEqual(pending.pending_password_hash,password);
  assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM users').first()).n,0);
  assert.equal((await f.call('verify',{token:challenge,password:'Otra contraseña elegida maliciosamente'})).status,400);
  assert.equal((await f.call('login',{email:'new@example.com',password})).status,401);
  const outcomes=await Promise.all([f.call('verify',{challenge,code}),f.call('verify',{challenge,code})]);assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,400]);
  const cookie=outcomes.find(r=>r.status===200).cookie;assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);
  const session=await f.mf.dispatchFetch(APP_ORIGIN+'/auth/session',{headers:{Cookie:cookie.split(';')[0]}});assert.equal((await session.json()).user.email,'new@example.com');
  assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM auth_email_accounts').first()).n,1);assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM platform_admins').first()).n,0);
  const used=await f.db.prepare('SELECT * FROM auth_email_actions').first();assert.equal(used.pending_password_hash,null);assert.equal(used.code_hash,null);
  assert.equal((await f.call('verify',{challenge,code})).status,400);assert.equal((await f.call('login',{email:'new@example.com',password})).status,200);
  assert.equal((await f.call('register',{email:'new@example.com',password})).status,200);assert.equal(f.messages.length,1);
 }finally{await f.mf.dispose();}
});
test('Alpha email code: five guesses, resend invalidation, expiry and preauthorized mailbox owner',async()=>{
 const f=await fixture();try{
  const email='owner-code@example.com';await f.db.prepare('UPDATE platform_owner_email_policy SET email_hash=?').bind(await hash(email)).run();
  const start=await f.call('register',{email,password}),first=start.data.challenge,oldCode=f.code(),wrong=oldCode==='000000'?'111111':'000000';
  for(let i=0;i<5;i++)assert.equal((await f.call('verify',{challenge:first,code:wrong})).status,400);
  assert.equal((await f.call('verify',{challenge:first,code:oldCode})).status,400);
  assert.equal((await f.db.prepare('SELECT code_attempts FROM auth_email_actions').first()).code_attempts,5);
  const resend=await f.call('resend',{challenge:first});assert.equal(resend.status,200);assert.notEqual(resend.data.challenge,first);
  assert.equal((await f.call('verify',{challenge:first,code:oldCode})).status,400);
  assert.equal((await f.call('verify',{challenge:resend.data.challenge,code:f.code()})).status,200);assert.equal((await f.db.prepare('SELECT role FROM platform_admins').first()).role,'owner');
  const expired=await f.call('register',{email:'expired-code@example.com',password});await f.db.prepare('UPDATE auth_email_actions SET expires_at=1 WHERE token_hash=?').bind(await hash(expired.data.challenge)).run();assert.equal((await f.call('verify',{challenge:expired.data.challenge,code:f.code()})).status,400);
 }finally{await f.mf.dispose();}
});
test('Alpha email code: unavailable transport and failed resend never activate or falsely report delivery',async()=>{
 const f=await fixture();try{
  delete f.env.AUTH_EMAIL_FROM;assert.equal((await f.call('register',{email:'mail@example.com',password})).status,503);assert.equal(f.messages.length,0);f.env.AUTH_EMAIL_FROM='cuentas@example.com';
  const start=await f.call('register',{email:'mail@example.com',password}),code=f.code();f.env.AUTH_EMAIL.send=async()=>{throw Error('Unavailable');};
  assert.equal((await f.call('resend',{challenge:start.data.challenge})).status,503);assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM auth_email_actions WHERE used_at IS NULL').first()).n,1);
  assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM auth_email_accounts').first()).n,0);
  assert.equal((await f.call('verify',{challenge:start.data.challenge,code})).status,200);
  assert.equal((await f.call('register',{email:'failed-new@example.com',password})).status,503);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM auth_email_actions WHERE email='failed-new@example.com'").first()).n,0);
 }finally{await f.mf.dispose();}
});
