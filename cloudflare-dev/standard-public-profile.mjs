import {profile,uploadMedia} from './premium-profiles.mjs';
export async function handlePublicProfile(request,env,c){
 const user=await c.identity(request),url=new URL(request.url),op=url.searchParams.get('operatorId');
 if(!await c.stmt(env.DB,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role IN('owner','admin')",[user.id,op]).first())throw c.failure('Sin permiso para el perfil de esta operadora',403);
 const media=url.pathname.match(/^\/api\/operator-public-media\/([0-9a-f-]{36})$/i);
 if(media){if(request.method!=='GET')throw c.failure('Método no permitido',405);const row=await c.stmt(env.DB,'SELECT * FROM premium_media WHERE id=? AND operator_id=?',[media[1],op]).first();const file=row&&await env.BUCKET.get(row.object_key);if(!file)throw c.failure('Imagen no encontrada',404);return new Response(file.body,{headers:{'Content-Type':row.content_type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
 if(url.pathname==='/api/operator-public-media')return uploadMedia(request,env,c);
 if(request.method==='GET')return profile(url,null,user,op,env.DB,c);
 if(request.method!=='POST')throw c.failure('Método no permitido',405);
 const raw=await request.text();if(raw.length>16384)throw c.failure('Solicitud demasiado grande',413);let body;try{body=JSON.parse(raw);}catch{throw c.failure('Solicitud no válida');}
 if(!body||typeof body!=='object'||Array.isArray(body))throw c.failure('Solicitud no válida');
 return profile(url,body,user,op,env.DB,c);
}
