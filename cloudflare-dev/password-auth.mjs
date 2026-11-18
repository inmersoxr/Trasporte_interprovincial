import {Buffer} from 'node:buffer';
import {scrypt,timingSafeEqual} from 'node:crypto';
import {APP_ORIGIN,ADMIN_ORIGIN,COOKIE,requireOrigin,cookie} from './identity.mjs';
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export const mailReady=env=>!!env.AUTH_EMAIL_FROM&&(typeof env.AUTH_EMAIL?.send==='function'||!!env.RESEND_API_KEY);
export function normalizeEmail(value,failure){if(typeof value!=='string')throw failure('Escribe un correo válido');const email=value.trim().toLowerCase();if(email.length>254||!/^[-a-z0-9.!#$%&'*+\/=?^_`{|}~]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/i.test(email))throw failure('Escribe un correo válido');return email;}
function password(value,failure){if(typeof value!=='string'||value.length<12||value.length>128)throw failure('La contraseña debe tener entre 12 y 128 caracteres');return value;}
let hashing=Promise.resolve();
export function passwordHash(value,salt=random()) {const task=hashing.then(async()=>{const key=await new Promise((resolve,reject)=>scrypt(value,salt,32,{N:32768,r:8,p:3,maxmem:67108864},(error,result)=>error?reject(error):resolve(result)));return'scrypt$32768$8$3$'+salt+'$'+Buffer.from(key).toString('hex');});hashing=task.catch(()=>{});return task;}
export async function passwordMatches(value,stored){const parts=String(stored||'').split('$'),valid=parts.length===6&&parts.slice(0,4).join('$')==='scrypt$32768$8$3';const computed=await passwordHash(value,valid?parts[4]:'0000000000000000000000000000000000000000000000000000000000000000');const got=Buffer.from(computed.split('$')[5],'hex'),expected=valid?Buffer.from(parts[5],'hex'):Buffer.alloc(32);return valid&&expected.length===32&&timingSafeEqual(got,expected);}
export function sessionResponse(token){const r=reply({authenticated:true});r.headers.set('Set-Cookie',COOKIE+'='+token+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800');return r;}
async function rate(db,scope,key,limit,period,c){const now=Date.now(),bucket=Math.floor(now/period)*period,keyHash=await c.hash(scope+':'+key);const row=await c.stmt(db,'INSERT INTO auth_rate_limits(key_hash,bucket,hits) VALUES(?,?,1) ON CONFLICT(key_hash,bucket) DO UPDATE SET hits=hits+1 RETURNING hits',[keyHash,bucket]).first();if(row.hits>limit)throw c.failure('Demasiados intentos. Espera unos minutos antes de reintentar',429);}
async function send(env,email,kind,link,network){const message={from:env.AUTH_EMAIL_FROM,to:email,subject:kind==='verify'?'Confirma tu cuenta RutasEC':'Recupera tu contraseña RutasEC',text:(kind==='verify'?'Confirma tu correo y elige tu contraseña:':'Elige una contraseña nueva:')+'\n\n'+link+'\n\nEste enlace es personal, temporal y de un solo uso. Si no lo solicitaste, ignora este mensaje.'};
 if(env.AUTH_EMAIL?.send){const result=await env.AUTH_EMAIL.send(message);if(!result?.messageId)throw Error('Delivery not accepted');return;}
 const response=await network('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({...message,to:[email]})});if(!response.ok||!(await response.json()).id)throw Error('Delivery not accepted');
}
async function audit(db,c,id,user,action){return c.stmt(db,"INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'email_account',?,?)",[id,user,user,action]);}
export async function handlePassword(request,env,c,network=fetch){const {stmt,hash,failure,identity}=c,db=env.DB,url=new URL(request.url),path=url.pathname;
 if(request.method!=='POST')throw failure('Método no permitido',405);requireOrigin(request,failure);const raw=await request.text();if(raw.length>4096)throw failure('Solicitud demasiado grande',413);let b;try{b=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}if(!b||typeof b!=='object'||Array.isArray(b))throw failure('Solicitud no válida');
 const ip=request.headers.get('CF-Connecting-IP')||'unknown';await rate(db,'email-ip:'+path,ip,path.endsWith('/login')?30:15,600000,c);
 if(['/auth/email/register','/auth/email/forgot','/auth/email/resend'].includes(path)){
  if(!mailReady(env))throw failure('El envío de correos aún no está activado. No se ha enviado ningún mensaje',503);
  const email=normalizeEmail(b.email,failure),emailHash=await hash(email);await rate(db,'email-send',emailHash,4,3600000,c);
  const account=await stmt(db,'SELECT * FROM auth_email_accounts WHERE email_hash=?',[emailHash]).first();const purpose=path.endsWith('/forgot')?'reset':'verify';
  if(purpose==='reset'&&!account||purpose==='verify'&&account)return reply({message:'Si el correo corresponde, recibirás un enlace para continuar. Revisa también la carpeta de spam.'});
  const name=typeof b.name==='string'&&b.name.trim()?b.name.trim().slice(0,120):'Usuario RutasEC',token=random(),tokenHash=await hash(token);
  await db.batch([stmt(db,'DELETE FROM auth_email_actions WHERE expires_at<?',[Date.now()-86400000]),stmt(db,'DELETE FROM auth_rate_limits WHERE bucket<?',[Date.now()-86400000]),stmt(db,'INSERT INTO auth_email_actions(token_hash,email_hash,email,purpose,user_id,display_name,version,expires_at) VALUES(?,?,?,?,?,?,?,?)',[tokenHash,emailHash,email,purpose,account?.user_id||null,name,account?.version||null,Date.now()+(purpose==='reset'?900000:3600000)])]);
  const origin=url.origin===ADMIN_ORIGIN?ADMIN_ORIGIN:APP_ORIGIN,link=origin+(origin===ADMIN_ORIGIN?'/':'/account/')+'#'+purpose+'='+token;
  try{await send(env,email,purpose,link,network);}catch{await stmt(db,'DELETE FROM auth_email_actions WHERE token_hash=? AND used_at IS NULL',[tokenHash]).run();throw failure('No se pudo enviar el correo. Inténtalo más tarde',503);}
  return reply({message:'Si el correo corresponde, recibirás un enlace para continuar. Revisa también la carpeta de spam.'});
 }
 if(path==='/auth/email/login'){
  const email=normalizeEmail(b.email,failure),secret=typeof b.password==='string'&&b.password.length<=128?b.password:'';await rate(db,'email-login',await hash(email),8,600000,c);
  const account=await stmt(db,"SELECT a.*,u.status FROM auth_email_accounts a JOIN users u ON u.id=a.user_id WHERE a.email_hash=?",[await hash(email)]).first();const valid=await passwordMatches(secret,account?.password_hash);
  if(!valid||!account||account.status!=='active')throw failure('Correo o contraseña incorrectos',401);
  const token=random(),sessionHash=await hash(token);await db.batch([stmt(db,"INSERT INTO standard_sessions(token_hash,user_id,expires_at) SELECT ?,user_id,? FROM auth_email_accounts WHERE email_hash=? AND version=?",[sessionHash,Date.now()+604800000,account.email_hash,account.version]),stmt(db,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'email_account',?,'signed_in' WHERE EXISTS(SELECT 1 FROM standard_sessions WHERE token_hash=?)",[crypto.randomUUID(),account.user_id,account.user_id,sessionHash])]);
  if(!await stmt(db,'SELECT 1 FROM standard_sessions WHERE token_hash=?',[await hash(token)]).first())throw failure('Tu contraseña cambió. Vuelve a entrar',409);return sessionResponse(token);
 }
 if(path==='/auth/email/verify'||path==='/auth/email/reset'){
  if(typeof b.token!=='string'||!/^[0-9a-f]{64}$/.test(b.token))throw failure('El enlace no es válido o ya venció');const tokenHash=await hash(b.token),kind=path.endsWith('/verify')?'verify':'reset';
  const action=await stmt(db,'SELECT * FROM auth_email_actions WHERE token_hash=? AND purpose=? AND used_at IS NULL AND expires_at>?',[tokenHash,kind,Date.now()]).first();if(!action)throw failure('El enlace ya se usó o venció. Solicita uno nuevo');
  const encoded=await passwordHash(password(b.password,failure)),nonce=random(),userId=action.user_id||crypto.randomUUID(),token=random(),sessionHash=await hash(token),now=Date.now();
  const ops=[stmt(db,'UPDATE auth_email_actions SET used_at=?,claim_nonce=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?',[now,nonce,tokenHash,now])];
  const claim='EXISTS(SELECT 1 FROM auth_email_actions WHERE token_hash=? AND claim_nonce=?)';
  if(kind==='verify'){
   ops.push(stmt(db,`INSERT INTO users(id,display_name) SELECT ?,? WHERE ${claim}`,[userId,action.display_name,tokenHash,nonce]),stmt(db,`INSERT INTO auth_email_accounts(email_hash,email,user_id,password_hash,verified_at,last_nonce) SELECT ?,?,?,?,?,? WHERE ${claim}`,[action.email_hash,action.email,userId,encoded,now,nonce,tokenHash,nonce]),stmt(db,`INSERT INTO platform_admins(user_id,role) SELECT ?,'owner' WHERE ${claim} AND EXISTS(SELECT 1 FROM platform_owner_email_policy WHERE singleton=1 AND email_hash=?) AND NOT EXISTS(SELECT 1 FROM platform_admins)`,[userId,tokenHash,nonce,action.email_hash]));
  }else{
   ops.push(stmt(db,`UPDATE auth_email_accounts SET password_hash=?,version=version+1,last_nonce=? WHERE user_id=? AND version=? AND ${claim}`,[encoded,nonce,userId,action.version,tokenHash,nonce]));
  }
  const valid='EXISTS(SELECT 1 FROM auth_email_accounts WHERE user_id=? AND last_nonce=?)';
  ops.push(stmt(db,`DELETE FROM standard_sessions WHERE user_id=? AND ${valid}`,[userId,userId,nonce]),stmt(db,`INSERT INTO standard_sessions(token_hash,user_id,expires_at) SELECT ?,?,? WHERE ${claim} AND ${valid}`,[sessionHash,userId,now+604800000,tokenHash,nonce,userId,nonce]),stmt(db,`INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'email_account',?,? WHERE ${claim} AND ${valid}`,[crypto.randomUUID(),userId,userId,kind==='verify'?'email_verified':'password_reset',tokenHash,nonce,userId,nonce]));
  let results;try{results=await db.batch(ops);}catch(e){if(String(e.message).includes('UNIQUE'))throw failure('Este correo ya tiene una cuenta. Entra o recupera tu contraseña',409);throw e;}
  if(results[0].meta.changes!==1||!await stmt(db,'SELECT 1 FROM standard_sessions WHERE token_hash=?',[sessionHash]).first())throw failure('El enlace ya se usó o tu cuenta cambió. Solicita uno nuevo');return sessionResponse(token);
 }
 if(path==='/auth/email/change-password'){
  const user=await identity(request,db),account=await stmt(db,'SELECT * FROM auth_email_accounts WHERE user_id=?',[user.id]).first();
  if(!account||!await passwordMatches(typeof b.currentPassword==='string'&&b.currentPassword.length<=128?b.currentPassword:'',account.password_hash))throw failure('La contraseña actual no es correcta',401);
  const encoded=await passwordHash(password(b.password,failure)),nonce=random(),token=random(),sessionHash=await hash(token);
  const results=await db.batch([stmt(db,'UPDATE auth_email_accounts SET password_hash=?,version=version+1,last_nonce=? WHERE user_id=? AND version=?',[encoded,nonce,user.id,account.version]),stmt(db,'DELETE FROM standard_sessions WHERE user_id=? AND EXISTS(SELECT 1 FROM auth_email_accounts WHERE user_id=? AND last_nonce=?)',[user.id,user.id,nonce]),stmt(db,'INSERT INTO standard_sessions(token_hash,user_id,expires_at) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM auth_email_accounts WHERE user_id=? AND last_nonce=?)',[sessionHash,user.id,Date.now()+604800000,user.id,nonce]),stmt(db,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'email_account',?,'password_changed' WHERE EXISTS(SELECT 1 FROM auth_email_accounts WHERE user_id=? AND last_nonce=?)",[crypto.randomUUID(),user.id,user.id,user.id,nonce])]);
  if(results[0].meta.changes!==1)throw failure('Tu cuenta cambió. Vuelve a entrar',409);return sessionResponse(token);
 }
 throw failure('Ruta no encontrada',404);
}
