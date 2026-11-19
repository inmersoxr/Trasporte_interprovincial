const uuid=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
const bodyText=(v,max,min,c)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw c.failure('Revisa el texto: admite de '+min+' a '+max+' caracteres');return v.trim();};
async function readBody(request,c){const raw=await request.text();if(raw.length>8192)throw c.failure('Solicitud demasiado grande',413);let b;try{b=JSON.parse(raw);}catch{throw c.failure('Solicitud no válida');}if(!b||typeof b!=='object'||Array.isArray(b)||!uuid(b.requestId))throw c.failure('Solicitud no válida');return b;}
async function prior(db,user,b,kind,c){const row=await c.stmt(db,'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?',[user.id,b.requestId]).first();if(row&&(row.kind!==kind||row.fingerprint!==await c.hash(JSON.stringify(b))))throw c.failure('Reintento con contenido distinto',409);return row;}
async function updateReview(env,user,b,id,kind,values,c){
 const db=env.DB,old=await prior(db,user,b,kind,c);if(old)return{id:old.entity_id};
 const revision=c.integer(b.expectedRevision,1,10000000,'Revisión'),nonce=crypto.randomUUID(),condition='EXISTS(SELECT 1 FROM standard_reviews WHERE id=? AND last_nonce=?)';
 const result=await db.batch([
  c.stmt(db,`UPDATE standard_reviews SET ${values.sql},revision=revision+1,last_nonce=? WHERE id=? AND revision=? AND ${kind==='review_moderated'?"EXISTS(SELECT 1 FROM platform_admins WHERE user_id=? AND role='owner')":"EXISTS(SELECT 1 FROM memberships WHERE user_id=? AND operator_id=standard_reviews.operator_id AND role IN('owner','admin'))"}`,[...values.args,nonce,id,revision,user.id]),
  c.stmt(db,`INSERT INTO standard_commands(user_id,request_id,kind,fingerprint,entity_id) SELECT ?,?,?,?,? WHERE ${condition}`,[user.id,b.requestId,kind,await c.hash(JSON.stringify(b)),id,id,nonce]),
  c.stmt(db,`INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action,details_json) SELECT ?,?,'operator_review',?,?,? WHERE ${condition}`,[nonce,user.id,id,kind,JSON.stringify(values.audit||{}),id,nonce])]);
 if(result[0].meta.changes!==1&&!await prior(db,user,b,kind,c))throw c.failure('La opinión cambió; actualiza antes de continuar',409);return{id};
}
export async function handleReviews(request,env,c){
 const url=new URL(request.url),path=url.pathname,db=env.DB,publicMatch=path.match(/^\/api\/operator-reviews\/([0-9a-f-]{36})$/i);
 if(publicMatch){
  if(request.method!=='GET')throw c.failure('Método no permitido',405);
  const op=publicMatch[1],published=await c.stmt(db,`SELECT o.display_name FROM operators o WHERE o.id=? AND o.status='approved' AND (o.data_scope='alpha' OR ?=1)`,[op,env.ALLOW_DEVELOPMENT_AUTH==='true'?1:0]).first();if(!published)throw c.failure('Perfil no publicado',404);
  const cursor=url.searchParams.get('cursor');let last;if(cursor){if(!uuid(cursor))throw c.failure('Página no válida');last=await c.stmt(db,"SELECT created_at,id FROM standard_reviews WHERE id=? AND operator_id=? AND status='visible'",[cursor,op]).first();if(!last)throw c.failure('Página no válida',404);}
  const reviews=await c.rows(db,`SELECT id,rating,comment,author_label AS authorLabel,created_at AS createdAt,reply,reply_at AS replyAt,revision,simulated FROM standard_reviews WHERE operator_id=? AND status='visible' ${last?'AND (created_at<? OR (created_at=? AND id<?))':''} ORDER BY created_at DESC,id DESC LIMIT 21`,[op,...(last?[last.created_at,last.created_at,last.id]:[])]);
  const summary=await c.stmt(db,"SELECT COUNT(*) AS count,AVG(rating) AS average FROM standard_reviews WHERE operator_id=? AND status='visible'",[op]).first();
  return{operatorName:published.display_name,reviews:reviews.slice(0,20).map(r=>({...r,verifiedTrip:true,simulated:!!r.simulated})),summary,nextCursor:reviews.length>20?reviews[19].id:null};
 }
 const user=await c.identity(request),platform=path.startsWith('/api/platform/reviews');
 if(platform&&!await c.stmt(db,"SELECT 1 FROM platform_admins WHERE user_id=? AND role='owner'",[user.id]).first())throw c.failure('Acceso exclusivo para moderación de RutasEC',403);
 if(request.method==='GET'){
  if(path==='/api/reviews/eligibility'){
   const op=url.searchParams.get('operatorId');if(op&&!uuid(op))throw c.failure('Operadora no válida');
   const eligible=await c.rows(db,`SELECT e.operator_id AS operatorId,e.booking_id AS bookingId,e.booking_kind AS bookingKind,e.service_at AS serviceAt,e.service_key AS serviceKey,o.display_name AS operatorName FROM standard_review_eligibility e JOIN operators o ON o.id=e.operator_id
    WHERE e.user_id=? AND (o.data_scope='alpha' OR ?=1) ${op?'AND e.operator_id=?':''} AND NOT EXISTS(SELECT 1 FROM memberships m WHERE m.user_id=e.user_id AND m.operator_id=e.operator_id)
    AND NOT EXISTS(SELECT 1 FROM standard_reviews r WHERE r.user_id=e.user_id AND r.service_key=e.service_key) ORDER BY e.service_at DESC LIMIT 50`,[user.id,env.ALLOW_DEVELOPMENT_AUTH==='true'?1:0,...(op?[op]:[])]);
   const own=await c.rows(db,`SELECT id,operator_id AS operatorId,rating,comment,status,reply,revision FROM standard_reviews WHERE user_id=? ${op?'AND operator_id=?':''} ORDER BY created_at DESC LIMIT 50`,[user.id,...(op?[op]:[])]);
   return{eligible,own,policy:'Una valoración por cuenta compradora y servicio completado con embarque. Estrellas y texto originales no se editan; puedes reportar un problema. Prueba sin cobros reales.'};
  }
  if(platform){
   const op=url.searchParams.get('operatorId'),cursor=url.searchParams.get('cursor');if(op&&!uuid(op)||cursor&&!uuid(cursor))throw c.failure('Filtro no válido');
   const reviews=await c.rows(db,`SELECT r.*,o.display_name AS operatorName,(SELECT COUNT(*) FROM standard_review_reports q WHERE q.review_id=r.id) AS reportCount FROM standard_reviews r JOIN operators o ON o.id=r.operator_id WHERE 1=1 ${op?'AND r.operator_id=?':''} ${cursor?'AND r.id>?':''} ORDER BY r.id LIMIT 51`,[...(op?[op]:[]),...(cursor?[cursor]:[])]);
   const ids=reviews.slice(0,50).map(r=>r.id),reports=ids.length?await c.rows(db,`SELECT review_id AS reviewId,reason,created_at AS createdAt FROM standard_review_reports WHERE review_id IN(${ids.map(()=>'?').join(',')}) ORDER BY created_at DESC`,ids):[];
   return{reviews:reviews.slice(0,50).map(({user_id,booking_id,service_key,last_nonce,...r})=>({...r,reports:reports.filter(q=>q.reviewId===r.id)})),nextCursor:reviews.length>50?reviews[49].id:null};
  }
  if(path==='/api/reviews/operator'){
   const op=url.searchParams.get('operatorId');if(!await c.stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role IN('owner','admin')",[user.id,op]).first())throw c.failure('Sin permiso para esta operadora',403);
   return{reviews:await c.rows(db,"SELECT id,rating,comment,author_label AS authorLabel,reply,revision,created_at AS createdAt FROM standard_reviews WHERE operator_id=? AND status='visible' ORDER BY created_at DESC,id DESC LIMIT 100",[op])};
  }
  throw c.failure('Ruta no encontrada',404);
 }
 if(request.method!=='POST')throw c.failure('Método no permitido',405);
 const b=await readBody(request,c);
 if(path==='/api/reviews'){
  const kind='review_create',old=await prior(db,user,b,kind,c);if(old)return{id:old.entity_id};
  if(!uuid(b.bookingId)||!['standard','custom'].includes(b.bookingKind))throw c.failure('Elige un viaje completado');
  const eligible=await c.stmt(db,'SELECT * FROM standard_review_eligibility WHERE user_id=? AND booking_id=? AND booking_kind=?',[user.id,b.bookingId,b.bookingKind]).first();if(!eligible)throw c.failure('Solo puedes valorar un viaje propio completado y con embarque registrado',403);
  if(!await c.stmt(db,"SELECT 1 FROM operators WHERE id=? AND (data_scope='alpha' OR ?=1)",[eligible.operator_id,env.ALLOW_DEVELOPMENT_AUTH==='true'?1:0]).first())throw c.failure('Este registro pertenece al entorno de pruebas aislado',403);
  if(await c.stmt(db,'SELECT 1 FROM memberships WHERE user_id=? AND operator_id=?',[user.id,eligible.operator_id]).first())throw c.failure('Los miembros de una operadora no pueden valorar su propia empresa',403);
  const name=(await c.stmt(db,'SELECT display_name FROM users WHERE id=?',[user.id]).first()).display_name,label=name.includes('@')||(name.match(/\d/g)||[]).length>=7?'Pasajero':name.trim().split(/\s+/)[0].slice(0,40)||'Pasajero',id=crypto.randomUUID();
  let saved;try{saved=await c.command(db,user,b,kind,[c.stmt(db,'INSERT INTO standard_reviews(id,operator_id,user_id,booking_id,booking_kind,service_key,rating,comment,author_label,last_nonce) VALUES(?,?,?,?,?,?,?,?,?,?)',[id,eligible.operator_id,user.id,b.bookingId,b.bookingKind,eligible.service_key,c.integer(b.rating,1,5,'Estrellas'),bodyText(b.comment??'',1000,0,c),label,id])],id);}catch(e){if(/UNIQUE.*standard_reviews/.test(e.message))throw c.failure('Ya valoraste este servicio',409);if(e.message.includes('review_not_eligible'))throw c.failure('El viaje ya no es elegible',409);throw e;}
  return{id:saved};
 }
 const match=path.match(/^\/api\/(?:platform\/)?reviews\/([0-9a-f-]{36})\/(reply|report|moderate)$/i);if(!match)throw c.failure('Ruta no encontrada',404);
 const r=await c.stmt(db,'SELECT * FROM standard_reviews WHERE id=?',[match[1]]).first();if(!r)throw c.failure('Opinión no encontrada',404);
 if(platform){if(match[2]!=='moderate')throw c.failure('Ruta no encontrada',404);if(!['visible','hidden'].includes(b.status))throw c.failure('Estado no válido');const reason=bodyText(b.reason,1000,5,c);return updateReview(env,user,b,r.id,'review_moderated',{sql:'status=?,moderation_reason=?',args:[b.status,reason],audit:{status:b.status,reason}},c);}
 if(match[2]==='reply'){
  if(r.status!=='visible'||!await c.stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role IN('owner','admin')",[user.id,r.operator_id]).first())throw c.failure('Sin permiso para responder',403);
  return updateReview(env,user,b,r.id,'review_replied',{sql:'reply=?,reply_at=CURRENT_TIMESTAMP',args:[bodyText(b.reply,1000,2,c)]},c);
 }
 if(match[2]==='report'){
  if(r.status!=='visible')throw c.failure('Opinión no disponible',404);
  const id=crypto.randomUUID();let saved;try{saved=await c.command(db,user,b,'review_reported',[c.stmt(db,'INSERT INTO standard_review_reports(id,review_id,reporter_id,reason) VALUES(?,?,?,?)',[id,r.id,user.id,bodyText(b.reason,500,5,c)])],id);}catch(e){if(/UNIQUE.*standard_review_reports/.test(e.message))throw c.failure('Ya reportaste esta opinión',409);throw e;}return{id:saved,message:'Reporte recibido. La opinión permanece visible hasta revisión de RutasEC.'};
 }
 throw c.failure('Ruta no encontrada',404);
}
