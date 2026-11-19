const appOrigin='https://rutasec-web-dev.drbrownlabs.workers.dev';
export async function uploadMedia(request,env,c){const {identity,stmt,failure}=c,db=env.DB,user=await identity(request,db),operatorId=new URL(request.url).searchParams.get('operatorId');
 if(request.method!=='POST')throw failure('Método no permitido',405);
 if(new URL(request.url).pathname==='/api/premium/media'&&!await stmt(db,"SELECT 1 FROM memberships m JOIN premium_tenants p ON p.operator_id=m.operator_id WHERE m.user_id=? AND m.operator_id=? AND m.role IN('owner','admin') AND p.active=1",[user.id,operatorId]).first())throw failure('Sin permiso para imágenes',403);
 if(!await stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role IN('owner','admin')",[user.id,operatorId]).first())throw failure('Sin permiso para imágenes',403);
 const mime=request.headers.get('Content-Type'),types={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};if(!types[mime])throw failure('Solo PNG, JPEG o WebP');
 if(Number(request.headers.get('Content-Length'))>2097152)throw failure('Imagen demasiado grande (2 MiB)',413);
 const reader=request.body?.getReader();if(!reader)throw failure('Imagen requerida');const chunks=[];let bytes=0;
 while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>2097152){await reader.cancel();throw failure('Imagen demasiado grande (2 MiB)',413);}chunks.push(part.value);}
 const data=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
 const png=bytes>=8&&[137,80,78,71,13,10,26,10].every((b,i)=>data[i]===b),jpg=bytes>=3&&data[0]===255&&data[1]===216&&data[2]===255,webp=bytes>=12&&new TextDecoder().decode(data.slice(0,4))==='RIFF'&&new TextDecoder().decode(data.slice(8,12))==='WEBP';
 if(!(mime==='image/png'?png:mime==='image/jpeg'?jpg:webp))throw failure('Contenido de imagen no válido');
 const id=crypto.randomUUID(),key='premium/'+operatorId+'/'+id+'.'+types[mime];await env.BUCKET.put(key,data,{httpMetadata:{contentType:mime}});
 try{await stmt(db,'INSERT INTO premium_media(id,operator_id,object_key,content_type,bytes,filename) VALUES(?,?,?,?,?,?)',[id,operatorId,key,mime,bytes,(new URL(request.url).searchParams.get('filename')||'Imagen').slice(0,120)]).run();}catch(e){await env.BUCKET.delete(key);throw e;}return{id,bytes};
}
export async function profile(url,body,user,operatorId,db,c){const {stmt,rows,failure,text,integer,hash}=c;
 if(!body)return{profile:await stmt(db,'SELECT * FROM premium_profiles WHERE operator_id=?',[operatorId]).first(),media:await rows(db,'SELECT id,content_type,bytes,filename FROM premium_media WHERE operator_id=? ORDER BY created_at DESC LIMIT 100',[operatorId])};
 const title=text(body.title,'Nombre público'),short=(v,max)=>{if(typeof v!=='string'||v.length>max)throw failure('Contenido demasiado largo');return v.trim();};
 const tagline=short(body.tagline??'',160),bio=short(body.bio??'',2000),website=short(body.website??'',2048);
 if(website){let target;try{target=new URL(website);}catch{throw failure('Enlace no válido');}if(target.protocol!=='https:'||target.username||target.password)throw failure('Usa un enlace HTTPS sin credenciales');}
 if(!/^#[0-9a-f]{6}$/i.test(body.accent)||typeof body.published!=='boolean'||!/^[0-9a-f-]{36}$/i.test(body.requestId||''))throw failure('Color, publicación o requestId no válido');
 for(const media of [body.logoMediaId,body.coverMediaId])if(media&&!await stmt(db,'SELECT 1 FROM premium_media WHERE id=? AND operator_id=?',[media,operatorId]).first())throw failure('Imagen ajena',403);
 const revision=integer(body.expectedRevision,0,100000000,'Revisión'),fingerprint=await hash(JSON.stringify(body)),prior=await stmt(db,'SELECT * FROM premium_profiles WHERE operator_id=?',[operatorId]).first();
 if(prior?.last_request===body.requestId){if(prior.fingerprint!==fingerprint)throw failure('Reintento con contenido distinto',409);return{revision:prior.revision};}
 let photos=prior?JSON.parse(prior.vehicle_photos_json||'{}'):{};
 if(body.vehiclePhotos!==undefined){
  if(!body.vehiclePhotos||typeof body.vehiclePhotos!=='object'||Array.isArray(body.vehiclePhotos)||Object.keys(body.vehiclePhotos).length>30)throw failure('Selecciona fotografías válidas para la flota');
  photos={};for(const [vehicleId,mediaId]of Object.entries(body.vehiclePhotos)){
   if(!/^[0-9a-f-]{36}$/i.test(vehicleId)||!await stmt(db,'SELECT 1 FROM vehicles WHERE id=? AND operator_id=?',[vehicleId,operatorId]).first())throw failure('Vehículo ajeno',403);
   if(mediaId){if(!await stmt(db,'SELECT 1 FROM premium_media WHERE id=? AND operator_id=?',[mediaId,operatorId]).first())throw failure('Imagen ajena',403);photos[vehicleId]=mediaId;}
  }
 }
 const result=await db.batch([
 stmt(db,`INSERT INTO premium_profiles(operator_id,title,tagline,bio,accent,website,logo_media_id,cover_media_id,published,revision,last_request,fingerprint) SELECT ?,?,?,?,?,?,?,?,?,1,?,? WHERE (?=0 OR EXISTS(SELECT 1 FROM premium_profiles WHERE operator_id=?))
 ON CONFLICT(operator_id) DO UPDATE SET title=excluded.title,tagline=excluded.tagline,bio=excluded.bio,accent=excluded.accent,website=excluded.website,logo_media_id=excluded.logo_media_id,cover_media_id=excluded.cover_media_id,published=excluded.published,revision=premium_profiles.revision+1,last_request=excluded.last_request,fingerprint=excluded.fingerprint,updated_at=CURRENT_TIMESTAMP WHERE premium_profiles.revision=?`,[operatorId,title,tagline,bio,body.accent,website,body.logoMediaId||null,body.coverMediaId||null,Number(body.published),body.requestId,fingerprint,revision,operatorId,revision]),
 stmt(db,'UPDATE premium_profiles SET vehicle_photos_json=? WHERE operator_id=? AND last_request=?',[JSON.stringify(photos),operatorId,body.requestId]),
 stmt(db,"INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'premium_profile',operator_id,'configured' FROM premium_profiles WHERE operator_id=? AND last_request=?",[operatorId+':'+body.requestId,user.id,operatorId,body.requestId])]);
 if(result[0].meta.changes!==1)throw failure('El perfil cambió; actualiza antes de guardar',409);return{revision:revision+1};
}
export async function publicMiniapp(request,env,c){const {stmt,failure}=c,url=new URL(request.url),match=url.pathname.match(/^\/api\/miniapps\/([0-9a-f-]{36})(?:\/(manifest|media\/([0-9a-f-]{36})))?$/i);if(!match) return null;
 if(request.method!=='GET')throw failure('Método no permitido',405);
 const row=await stmt(env.DB,`SELECT o.id AS operator_id,o.display_name AS business_name,p.published AS personalization_published,COALESCE(p.title,o.display_name) AS title,COALESCE(p.tagline,'') AS tagline,
 COALESCE(p.bio,'') AS bio,COALESCE(p.accent,'#f6c928') AS accent,COALESCE(p.website,'') AS website,p.logo_media_id,p.cover_media_id,
 COALESCE(p.vehicle_photos_json,'{}') AS vehicle_photos_json,COALESCE(p.revision,0) AS revision,EXISTS(SELECT 1 FROM premium_tenants t WHERE t.operator_id=o.id AND t.active=1) AS premium_active,
 EXISTS(SELECT 1 FROM standard_documented_operators x JOIN standard_operator_profiles s ON s.operator_id=x.operator_id WHERE x.operator_id=o.id AND s.review_state='approved') AS verified,
 (SELECT base_city FROM standard_operator_profiles WHERE operator_id=o.id) AS base_city
 FROM operators o LEFT JOIN premium_profiles p ON p.operator_id=o.id
 WHERE o.id=? AND (COALESCE(p.published,1)=1 OR o.data_scope='alpha') AND (p.operator_id IS NOT NULL OR o.data_scope='alpha')
 AND o.status='approved' AND (o.data_scope='alpha' OR ?=1)`,[match[1],env.ALLOW_DEVELOPMENT_AUTH==='true'?1:0]).first();if(!row)throw failure('Perfil no publicado',404);
 if(row.personalization_published===0){row.title=row.business_name;row.tagline='';row.bio='';row.accent='#f6c928';row.website='';row.logo_media_id=null;row.cover_media_id=null;row.vehicle_photos_json='{}';}
 const photos=JSON.parse(row.vehicle_photos_json),image=id=>id?'/standard-api/api/miniapps/'+row.operator_id+'/media/'+id:null;

 if(match[2]==='manifest'){
  const business=url.searchParams.get('business')==='1',scope=business?(row.premium_active?'/premium/':'/standard/'):'/miniapp/',start=scope+'?'+new URLSearchParams({operator:row.operator_id,...(business&&!row.premium_active?{manage:'1'}:{})});
  return new Response(JSON.stringify({id:start,name:row.title+(business?' · Gestión':''),short_name:row.title.slice(0,24),start_url:start,scope,display:'standalone',background_color:business?(row.premium_active?'#f4f6f9':'#191e25'):'#12161c',theme_color:row.accent,icons:[{src:appOrigin+'/assets/icon-192.png',sizes:'192x192',type:'image/png'},{src:appOrigin+'/assets/icon-512.png',sizes:'512x512',type:'image/png'}]}),{headers:{'Content-Type':'application/manifest+json','Cache-Control':'no-store'}});
 }
 if(match[3]){if(![row.logo_media_id,row.cover_media_id,...Object.values(photos)].includes(match[3]))throw failure('Imagen no publicada',404);const media=await stmt(env.DB,'SELECT * FROM premium_media WHERE id=? AND operator_id=?',[match[3],row.operator_id]).first();const object=media&&await env.BUCKET.get(media.object_key);if(!object)throw failure('Imagen no encontrada',404);return new Response(object.body,{headers:{'Content-Type':media.content_type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});}
 const fleet=(await c.rows(env.DB,`SELECT v.id,v.type,v.model,v.capacity,x.brand,x.year,x.color FROM vehicles v LEFT JOIN standard_vehicle_details x ON x.vehicle_id=v.id WHERE v.operator_id=? AND v.status='active' ORDER BY v.created_at,v.id LIMIT 100`,[row.operator_id])).map(v=>({...v,photoUrl:image(photos[v.id])}));
 const reputation=await stmt(env.DB,"SELECT COUNT(*) AS count,AVG(rating) AS average FROM standard_reviews WHERE operator_id=? AND status='visible'",[row.operator_id]).first();
 return{fleet,reputation,verified:!!row.verified,baseCity:row.base_city,profileUrl:'/miniapp/?operator='+row.operator_id,operatorId:row.operator_id,title:row.title,tagline:row.tagline,bio:row.bio,accent:row.accent,website:row.website,logoUrl:image(row.logo_media_id),coverUrl:image(row.cover_media_id),catalogUrl:'/standard-api/api/catalog?operatorId='+row.operator_id,revision:row.revision,environment:'development',payments:'simulated'};
}
