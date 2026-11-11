// Produces an ESM Cloudflare Worker; no build dependencies.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const core=await readFile(new URL('shared/trip-core.mjs',root),'utf8');
const route=JSON.parse(await readFile(new URL('shared/route.json',root),'utf8'));
const institution=await readFile(new URL('sync-service/institution.mjs',root),'utf8');
const bookings=await readFile(new URL('sync-service/bookings.mjs',root),'utf8');
const worker=await readFile(new URL('sync-service/worker.mjs',root),'utf8');
const bundle=institution.replace(/^export /gm,'')+'\n'+bookings.replace(/^export /gm,'')+'\n'+core.replace(/^export /gm,'')+'\nconst route='+JSON.stringify(route)+';\n'+worker.replace(/^import .*;\n/gm,'');
await mkdir(new URL('sync-service/out/',root),{recursive:true});
await writeFile(new URL('sync-service/out/worker.mjs',root),bundle);
console.log('Worker listo: sync-service/out/worker.mjs. Vincular un bucket R2 como BUCKET.');
