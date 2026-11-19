import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base='https://rutasec-web-dev.drbrownlabs.workers.dev';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const proxy=process.env.https_proxy||process.env.HTTPS_PROXY;
const context=await browser.newContext({...(proxy?{proxy:{server:proxy}}:{}),viewport:{width:390,height:844}});
const other=await browser.newContext({...(proxy?{proxy:{server:proxy}}:{})});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const session=await(await context.request.post(base+'/standard-api/api/sessions',{data:{}})).json();
 const outsider=await(await other.request.post(base+'/standard-api/api/sessions',{data:{}})).json();
 async function api(path,body,token=session.token){const r=await context.request.post(base+'/standard-api/api'+path,{headers:{Authorization:'Bearer '+token},data:{...body,requestId:crypto.randomUUID()}});return {status:r.status(),data:await r.json()};}
 const op=await api('/operators',{name:'Premium P1 ficticio '+Date.now()});assert.equal(op.status,200);
 const operatorId=op.data.id;
 const vehicle=await api('/vehicles',{operatorId,type:'van',model:'Van Premium ficticia',capacity:8});assert.equal(vehicle.status,200);
 const vehicleId=vehicle.data.id;
 await page.goto(base+'/premium/');await page.evaluate(token=>localStorage.setItem('rutasec-standard-session',token),session.token);await page.reload();
 await page.locator('#activate').waitFor();await page.locator('#activate').click();await page.locator('#workspace').waitFor();
 await page.locator('[name="odometerKm"]').fill('12000');await page.locator('[name="nextServiceKm"]').fill('15000');await page.getByRole('button',{name:'Guardar kilometraje'}).click();await page.getByText('Kilometraje guardado.',{exact:true}).waitFor();
 await page.reload();await page.locator('#workspace').waitFor();assert.equal(await page.locator('[name="odometerKm"]').inputValue(),'12000');
 const at=new Date(Date.now()+3*86400000);at.setSeconds(0,0);const end=new Date(at.getTime()+3600000);
 const form=page.locator('#maintenance');await form.locator('[name="summary"]').fill('Inspección P1 ficticia');await form.locator('[name="startsAt"]').fill(at.toISOString().slice(0,16));await form.locator('[name="endsAt"]').fill(end.toISOString().slice(0,16));await form.getByRole('button').click();await page.getByText('Mantenimiento guardado y horario bloqueado.',{exact:true}).waitFor();
 const offer=await api('/route-offers',{operatorId,vehicleId,origin:'Cuenca',destination:'Guayaquil',serviceType:'shared',priceCents:1000});assert.equal(offer.status,200);
 const departure={operatorId,offerId:offer.data.id,departAt:at.toISOString(),durationMinutes:60};
 assert.equal((await api('/departures',departure)).status,409);
 assert.equal((await api('/premium/vehicle-profile',{operatorId,vehicleId,odometerKm:13000},outsider.token)).status,403);
 const read=await other.request.get(base+'/standard-api/api/premium?operatorId='+operatorId,{headers:{Authorization:'Bearer '+outsider.token}});assert.equal(read.status(),403);
 await page.reload();await page.getByRole('button',{name:'Completar y liberar horario'}).click();await page.getByText('Mantenimiento actualizado.',{exact:true}).waitFor();
 const released={operatorId,vehicleId,summary:'Prueba liberación',startsAt:at.toISOString(),endsAt:end.toISOString()};
 const replacement=await api('/premium/maintenance',released);assert.equal(replacement.status,200);
 assert.equal((await api('/premium/maintenance/'+replacement.data.id,{operatorId,status:'cancelled'})).status,200);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('PASS Premium P1: activation, D1 persistence, tenant isolation, Standard calendar conflict, closure release and mobile layout');
}finally{await context.close();await other.close();await browser.close();}
