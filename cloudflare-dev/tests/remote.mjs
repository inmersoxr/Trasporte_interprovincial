import {chromium} from 'playwright';import assert from 'node:assert/strict';
export const base='https://rutasec-web-dev.drbrownlabs.workers.dev';
export async function remote(){const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const proxy=process.env.https_proxy||process.env.HTTPS_PROXY;const options={...(proxy?{proxy:{server:proxy}}:{}),viewport:{width:390,height:844}};
 const contexts=[];async function actor(){const context=await browser.newContext(options);contexts.push(context);const session=await(await context.request.post(base+'/standard-api/api/sessions',{data:{}})).json();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function api(path,body){const r=await context.request.fetch(base+'/standard-api/api'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+session.token},data:body?{...body,requestId:body.requestId||crypto.randomUUID()}:undefined});return{status:r.status(),data:await r.json()};}
 async function open(path='/premium/'){await page.goto(base+path);await page.evaluate(t=>localStorage.setItem('rutasec-standard-session',t),session.token);await page.reload();}
 return{context,page,session,api,open,errors};}
 return{browser,actor,close:async()=>{for(const c of contexts)await c.close();await browser.close();}};}
export async function setup(actor){const op=await actor.api('/operators',{name:'QA Premium '+Date.now()});assert.equal(op.status,200);const operatorId=op.data.id;const vehicle=await actor.api('/vehicles',{operatorId,type:'van',model:'Van ficticia QA',capacity:8});assert.equal(vehicle.status,200);assert.equal((await actor.api('/premium/activate',{operatorId})).status,200);return{operatorId,vehicleId:vehicle.data.id};}
