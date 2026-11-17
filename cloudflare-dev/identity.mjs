// Pinned development origin; production must use separate OAuth configuration.
export const APP_ORIGIN='https://rutasec-web-dev.drbrownlabs.workers.dev';
export const COOKIE='__Host-rutasec_session',STATE_COOKIE='__Host-rutasec_oauth';
export function cookie(request,name){return request.headers.get('Cookie')?.split(';').map(p=>p.trim()).find(p=>p.startsWith(name+'='))?.slice(name.length+1)||'';}
export function requireOrigin(request,failure){if(request.headers.get('Origin')!==APP_ORIGIN)throw failure('Origen no permitido',403);}
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode=value=>Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
const parse=value=>JSON.parse(new TextDecoder().decode(decode(value)));
const setCookie=(name,value,age)=>name+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+age;
const response=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function verifyGoogleIdToken(token,{audience,nonce,jwks,now=Date.now()}){
 if(typeof token!=='string'||token.length>16384)throw Error('Invalid token');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid token');
 const head=parse(parts[0]),claims=parse(parts[1]);if(head.alg!=='RS256'||typeof head.kid!=='string')throw Error('Invalid algorithm');
 const jwk=jwks.keys?.find(k=>k.kid===head.kid&&k.kty==='RSA'&&(!k.use||k.use==='sig'));if(!jwk)throw Error('Unknown signing key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('Invalid signature');
 if(!['accounts.google.com','https://accounts.google.com'].includes(claims.iss)||claims.aud!==audience||(claims.azp&&claims.azp!==audience)||claims.nonce!==nonce||!Number.isFinite(claims.exp)||claims.exp<=now/1000||!Number.isFinite(claims.iat)||claims.iat>now/1000+60||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255||(claims.email&&claims.email_verified!==true))throw Error('Invalid claims');
 return claims;
}
export async function handleAuth(request,env,c,network=fetch){const {identity,stmt,rows,hash,failure}=c,db=env.DB,url=new URL(request.url),path=url.pathname;
 const configured=!!(env.GOOGLE_CLIENT_ID&&env.GOOGLE_CLIENT_SECRET),callback=APP_ORIGIN+'/standard-api/auth/google/callback';
 if(path==='/auth/config'&&request.method==='GET')return response({google:configured,apple:false,environment:'development'});
 if(path==='/auth/session'&&request.method==='GET'){
  if(!cookie(request,COOKIE))return response({authenticated:false});
  try{const user=await identity(new Request(request.url,{headers:{Cookie:request.headers.get('Cookie')}}),db);return response({authenticated:true,user:await stmt(db,'SELECT id,display_name FROM users WHERE id=?',[user.id]).first(),operators:await rows(db,'SELECT o.id,o.display_name,m.role FROM memberships m JOIN operators o ON o.id=m.operator_id WHERE m.user_id=?',[user.id])});}catch{return response({authenticated:false});}
 }
 if(path==='/auth/logout'&&request.method==='POST'){requireOrigin(request,failure);const token=cookie(request,COOKIE);if(token)await stmt(db,'DELETE FROM standard_sessions WHERE token_hash=?',[await hash(token)]).run();const r=response({signedOut:true});r.headers.append('Set-Cookie',setCookie(COOKIE,'',0));return r;}
 if(path==='/auth/google/start'&&['GET','POST'].includes(request.method)){
  if(!configured)return response({error:'Google no está configurado todavía'},503);
  let link=null;if(request.method==='POST'){requireOrigin(request,failure);const raw=await request.text();if(raw.length>1024)throw failure('Solicitud demasiado grande',413);let body;try{body=JSON.parse(raw);}catch{throw failure('JSON no válido');}if(body?.link===true)link=(await identity(request,db)).id;}
  const state=random(),nonce=random(),verifier=random();await db.batch([stmt(db,'DELETE FROM auth_transactions WHERE expires_at<?',[Date.now()]),stmt(db,'INSERT INTO auth_transactions(state_hash,verifier,nonce,expires_at,link_user_id) VALUES(?,?,?,?,?)',[await hash(state),verifier,nonce,Date.now()+300000,link])]);
  const target=new URL('https://accounts.google.com/o/oauth2/v2/auth');target.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email profile',state,nonce,code_challenge:b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),code_challenge_method:'S256',prompt:'select_account'}).toString();
  const r=request.method==='POST'?response({url:target.href}):new Response(null,{status:302,headers:{Location:target.href,'Cache-Control':'no-store'}});r.headers.append('Set-Cookie',setCookie(STATE_COOKIE,state,300));return r;
 }
 if(path==='/auth/google/callback'&&request.method==='GET'){
  let issued='';try{
   if(!configured)throw Error('Provider unavailable');const state=url.searchParams.get('state'),code=url.searchParams.get('code');if(!state||!/^[0-9a-f]{64}$/.test(state)||cookie(request,STATE_COOKIE)!==state||!code||code.length>4096)throw Error('Invalid callback');
   const tx=await stmt(db,'DELETE FROM auth_transactions WHERE state_hash=? RETURNING *',[await hash(state)]).first();if(!tx||tx.expires_at<Date.now())throw Error('Expired transaction');
   const exchange=await network('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,code,code_verifier:tx.verifier,grant_type:'authorization_code',redirect_uri:callback})});if(!exchange.ok)throw Error('Exchange failed');const tokens=await exchange.json();
   const certs=await network('https://www.googleapis.com/oauth2/v3/certs');if(!certs.ok)throw Error('Keys unavailable');const claims=await verifyGoogleIdToken(tokens.id_token,{audience:env.GOOGLE_CLIENT_ID,nonce:tx.nonce,jwks:await certs.json()});
   const existing=await stmt(db,"SELECT user_id FROM auth_identities WHERE provider='google' AND subject=?",[claims.sub]).first();
   if(tx.link_user_id&&existing&&existing.user_id!==tx.link_user_id)throw Error('Explicit account merge required');
   let userId=existing?.user_id||tx.link_user_id;
   if(userId&&!await stmt(db,"SELECT 1 FROM users WHERE id=? AND status='active'",[userId]).first())throw Error('Account inactive');
   if(!existing){userId||=crypto.randomUUID();const operations=[];if(!tx.link_user_id)operations.push(stmt(db,'INSERT INTO users(id,display_name) VALUES(?,?)',[userId,String(claims.name||'Usuario RutasEC').slice(0,120)]));operations.push(stmt(db,"INSERT INTO auth_identities(provider,subject,user_id,email) VALUES('google',?,?,?)",[claims.sub,userId,claims.email||null]));try{await db.batch(operations);}catch(error){const saved=await stmt(db,"SELECT user_id FROM auth_identities WHERE provider='google' AND subject=?",[claims.sub]).first();if(!saved||(tx.link_user_id&&saved.user_id!==tx.link_user_id))throw error;userId=saved.user_id;}}
   const token=random();await stmt(db,'INSERT INTO standard_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',[await hash(token),userId,Date.now()+7*86400000]).run();issued=setCookie(COOKIE,token,7*86400);
   const r=new Response(null,{status:302,headers:{Location:APP_ORIGIN+'/account/?signedIn=1','Cache-Control':'no-store'}});r.headers.append('Set-Cookie',issued);r.headers.append('Set-Cookie',setCookie(STATE_COOKIE,'',0));return r;
  }catch{const r=new Response(null,{status:302,headers:{Location:APP_ORIGIN+'/account/?error=signin','Cache-Control':'no-store'}});r.headers.append('Set-Cookie',setCookie(STATE_COOKIE,'',0));return r;}
 }
 return response({error:'Not found'},404);
}
