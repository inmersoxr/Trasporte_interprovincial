const allowedHost=host=>host==='fcm.googleapis.com'||host==='web.push.apple.com'||host==='updates.push.services.mozilla.com'||host.endsWith('.push.services.mozilla.com');
const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decode=text=>Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
export function pushEndpoint(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.port&&!u.username&&!u.password&&allowedHost(u.hostname)&&value.length<2048?u:null;}catch{return null;}}
export async function vapidHeaders(endpoint,env,now=Date.now()){
 const pub=decode(env.VAPID_PUBLIC_KEY),key=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',x:encode(pub.slice(1,33)),y:encode(pub.slice(33)),d:env.VAPID_PRIVATE_KEY},{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
 const json=v=>encode(new TextEncoder().encode(JSON.stringify(v))),data=json({typ:'JWT',alg:'ES256'})+'.'+json({aud:new URL(endpoint).origin,exp:Math.floor(now/1000)+43200,sub:'https://rutasec-web-dev.drbrownlabs.workers.dev/'});
 const token=data+'.'+encode(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,new TextEncoder().encode(data)));
 return{Authorization:'vapid t='+token+', k='+env.VAPID_PUBLIC_KEY,TTL:'300',Urgency:'high'};
}
export async function dispatchPush(env,network=fetch){
 if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)return{configured:false};const db=env.DB,now=Date.now();
 // One atomic lease and one subscription read keep background batches bounded.
 const pending=(await db.prepare(`UPDATE standard_notifications SET next_attempt=? WHERE id IN(SELECT id FROM standard_notifications WHERE push_sent_at IS NULL AND read_at IS NULL AND attempts<4 AND next_attempt<=? ORDER BY created_at,id LIMIT 20) AND next_attempt<=? AND push_sent_at IS NULL AND read_at IS NULL RETURNING *`).bind(now+60000,now,now).all()).results;
 if(!pending.length)return{configured:true,sent:0};
 const subs=(await db.prepare('SELECT endpoint,user_id FROM standard_push_subscriptions WHERE user_id IN(SELECT value FROM json_each(?))').bind(JSON.stringify([...new Set(pending.map(n=>n.user_id))])).all()).results;
 const live=(await db.prepare(`SELECT n.id FROM standard_notifications n WHERE n.id IN(SELECT value FROM json_each(?)) AND (n.kind<>'custom_request' OR EXISTS(SELECT 1 FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id JOIN standard_custom_enrollments e ON e.operator_id=n.operator_id JOIN memberships m ON m.operator_id=e.operator_id AND m.user_id=n.user_id AND m.role IN('owner','admin','dispatcher') WHERE r.id=substr(n.id,1,36) AND r.status IN('requested','receiving_offers') AND s.expires_at>? AND e.enabled=1 AND e.available=1)) AND (n.kind<>'custom_offer' OR EXISTS(SELECT 1 FROM standard_private_offers f JOIN private_requests r ON r.id=f.request_id JOIN standard_private_specs s ON s.request_id=r.id WHERE f.id=substr(n.id,1,36) AND f.status='available' AND r.status IN('requested','receiving_offers') AND s.expires_at>?))`).bind(JSON.stringify(pending.map(n=>n.id)),new Date(now).toISOString(),new Date(now).toISOString()).all()).results;
 const active=new Set(live.map(n=>n.id)),updates=[];let sent=0,budget=24;
 for(const n of pending){if(budget<=0)break;let retry=false;
  if(active.has(n.id))for(const sub of subs.filter(s=>s.user_id===n.user_id)){
   if(budget<=0){retry=true;break;}if(!pushEndpoint(sub.endpoint))continue;budget--;
   try{const r=await network(sub.endpoint,{method:'POST',headers:await vapidHeaders(sub.endpoint,env),redirect:'error',signal:AbortSignal.timeout(10000)});if([404,410].includes(r.status))updates.push(db.prepare('DELETE FROM standard_push_subscriptions WHERE endpoint=?').bind(sub.endpoint));else if(!r.ok)retry=true;}catch{retry=true;}
  }
  updates.push(db.prepare('UPDATE standard_notifications SET attempts=attempts+1,push_sent_at='+(!retry?'CURRENT_TIMESTAMP':'NULL')+' WHERE id=?').bind(n.id));if(!retry)sent++;
 }
 if(updates.length)await db.batch(updates);return{configured:true,sent};
}
export async function notifications(request,env,c){
 const {identity,stmt,rows,failure}=c,user=await identity(request,env.DB),url=new URL(request.url),path=url.pathname,db=env.DB;
 if(request.method==='GET'&&path==='/api/notifications'){
  const cursor=url.searchParams.get('cursor');let before=null;if(cursor){before=await stmt(db,'SELECT id,created_at FROM standard_notifications WHERE id=? AND user_id=?',[cursor,user.id]).first();if(!before)throw failure('Página no disponible',404);}
  const items=await rows(db,`SELECT id,kind,title,body,target,created_at,read_at FROM standard_notifications WHERE user_id=?${before?' AND (created_at<? OR (created_at=? AND id<?))':''} ORDER BY created_at DESC,id DESC LIMIT 31`,[user.id,...(before?[before.created_at,before.created_at,before.id]:[])]);
  return{items:items.slice(0,30),nextCursor:items.length>30?items[29].id:null,unread:(await stmt(db,'SELECT COUNT(*) n FROM standard_notifications WHERE user_id=? AND read_at IS NULL',[user.id]).first()).n,pushEnabled:!!(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY),publicKey:env.VAPID_PUBLIC_KEY||null};
 }
 if(request.method!=='POST')throw failure('Método no permitido',405);const raw=await request.text();if(raw.length>4096)throw failure('Solicitud demasiado grande',413);let b;try{b=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}if(!b||typeof b!=='object'||Array.isArray(b))throw failure('Solicitud no válida');
 if(path==='/api/notifications/read'){await stmt(db,'UPDATE standard_notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?',[b.id,user.id]).run();return{updated:true};}
 if(path==='/api/notifications/subscribe'){
  if(!env.VAPID_PUBLIC_KEY||!env.VAPID_PRIVATE_KEY)throw failure('Las notificaciones push aún no están configuradas',503);
  if(!pushEndpoint(b.endpoint))throw failure('Destino push no válido');
  if((await stmt(db,'SELECT COUNT(*) n FROM standard_push_subscriptions WHERE user_id=?',[user.id]).first()).n>=10&&!await stmt(db,'SELECT 1 FROM standard_push_subscriptions WHERE endpoint=? AND user_id=?',[b.endpoint,user.id]).first())throw failure('Ya tienes diez dispositivos registrados',409);
  await stmt(db,'INSERT INTO standard_push_subscriptions(endpoint,user_id) VALUES(?,?) ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id',[b.endpoint,user.id]).run();return{subscribed:true};
 }
 if(path==='/api/notifications/unsubscribe'){await stmt(db,'DELETE FROM standard_push_subscriptions WHERE endpoint=? AND user_id=?',[b.endpoint,user.id]).run();return{subscribed:false};}
 throw failure('Ruta no encontrada',404);
}
