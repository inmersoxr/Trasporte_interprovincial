import {readFile,readdir} from 'node:fs/promises';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
export async function runtime({developmentAuth=true,pilot=false}={}){
 const root=new URL('../',import.meta.url),files=['worker.mjs','identity.mjs','platform-api.mjs','password-auth.mjs','account/return-path.mjs','standard/transport.mjs','standard/cities.mjs','standard/onboarding-policy.mjs',...(await readdir(root)).filter(f=>/^(standard|premium)-.*\.mjs$/.test(f))];
 const mf=new Miniflare(convertV4MiniflareOptions({modules:[...files,'out/reference-route.mjs','../shared/trip-core.mjs'].map(file=>({type:'ESModule',path:new URL(file,root).pathname})),modulesRoot:new URL('../../',import.meta.url).pathname,bindings:{ALLOW_DEVELOPMENT_AUTH:String(developmentAuth),PILOT_REGISTRATION_ENABLED:String(pilot),PILOT_PREMIUM_ENABLED:String(pilot),PILOT_OPERATIONS_ENABLED:String(pilot)},d1Databases:['DB'],r2Buckets:['BUCKET'],compatibilityDate:'2026-11-01',compatibilityFlags:['nodejs_compat']}));
 const db=await mf.getD1Database('DB');
 for(const file of (await readdir(new URL('../../sync-service/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){
  const sql=(await readFile(new URL('../../sync-service/migrations/'+file,import.meta.url),'utf8')).replace(/^--.*$/gm,'');
  for(const statement of sql.match(/CREATE TRIGGER[\s\S]*?END;|(?:DROP INDEX|DROP TRIGGER|DROP VIEW|PRAGMA|CREATE TABLE|CREATE VIEW|CREATE INDEX|CREATE UNIQUE INDEX|ALTER TABLE|INSERT|UPDATE)[\s\S]*?;/gi)||[])await db.prepare(statement).run();
 }
 const call=async(path,body,token)=>{const r=await mf.dispatchFetch('https://dev.example/api'+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return{status:r.status,data:await r.json()};};
 return{mf,db,call};
}
