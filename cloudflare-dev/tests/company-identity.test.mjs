import test from 'node:test';import assert from 'node:assert/strict';import {runtime} from './runtime.mjs';import {identityDefaults} from '../standard-company-identity.mjs';
test('Company identity: two Premium brands, Standard limits, drafts, publication, CAS and media isolation',async()=>{
 const r=await runtime();try{const a=(await r.call('/sessions',{})).data.token,b=(await r.call('/sessions',{})).data.token,create=(path,body,token=a)=>r.call(path,{requestId:crypto.randomUUID(),...body},token),ops=[];
 for(let n=0;n<3;n++){const op=(await create('/operators',{name:'Empresa '+n})).data.id;ops.push(op);if(n<2)assert.equal((await create('/premium/activate',{operatorId:op})).status,200);}
 const config=(n)=>({title:'Empresa '+n,description:'Descripción de la empresa',tagline:'Viaja con nosotros',website:'https://example.com',phone:'0991112233',email:'ventas@example.com',address:'Cuenca',services:'Viajes interprovinciales',logoMediaId:null,coverMediaId:null,colors:n===0?{primary:'#092b46',secondary:'#15527d',accent:'#00ccaa'}:n===1?{primary:'#502145',secondary:'#743465',accent:'#ffba45'}:{...identityDefaults},gallery:[]});
 const privatePath=op=>'/company-identity?operatorId='+op;
 assert.equal((await r.call(privatePath(ops[0]),undefined,b)).status,403);
 const body={operatorId:ops[0],config:config(0),expectedRevision:0,action:'save',requestId:crypto.randomUUID()};assert.equal((await r.call('/company-identity',body,a)).status,200);assert.equal((await r.call('/company-identity',body,a)).data.revision,1);
 assert.equal((await r.call(privatePath(ops[0]),undefined,a)).data.draft.colors.accent,'#00ccaa');assert.notEqual((await r.call(privatePath(ops[0]),undefined,a)).data.applied.colors.accent,'#00ccaa');
 assert.equal((await create('/company-identity',{...body,requestId:crypto.randomUUID(),expectedRevision:1,action:'publish'})).status,200);assert.equal((await r.call('/miniapps/'+ops[0])).data.theme.accent,'#00ccaa');
 assert.equal((await create('/company-identity',{operatorId:ops[1],config:config(1),expectedRevision:0,action:'publish'})).status,200);assert.equal((await r.call('/miniapps/'+ops[1])).data.theme.accent,'#ffba45');assert.equal((await r.call('/miniapps/'+ops[0])).data.theme.accent,'#00ccaa');
 assert.equal((await create('/company-identity',{operatorId:ops[2],config:config(0),expectedRevision:0,action:'publish'})).status,403);assert.equal((await create('/company-identity',{operatorId:ops[2],config:config(2),expectedRevision:0,action:'publish'})).status,200);assert.equal((await r.call('/miniapps/'+ops[2])).data.theme.accent,identityDefaults.accent);
 const race=await Promise.all([0,1].map(i=>create('/company-identity',{operatorId:ops[0],config:{...config(0),title:'Título '+i},expectedRevision:2,action:'save'})));assert.deepEqual(race.map(x=>x.status).sort(),[200,409]);
 const invalid={...config(1),logoMediaId:crypto.randomUUID()};assert.equal((await create('/company-identity',{operatorId:ops[1],config:invalid,expectedRevision:1,action:'publish'})).status,403);
 await r.db.prepare("UPDATE premium_tenants SET active=0 WHERE operator_id=?").bind(ops[0]).run();assert.equal((await r.call('/miniapps/'+ops[0])).data.theme.accent,identityDefaults.accent);assert.equal((await create('/company-identity',{operatorId:ops[0],config:config(0),expectedRevision:3,action:'publish'})).status,403);
 }finally{await r.mf.dispose();}
});
