import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base='https://rutasec-web-dev.drbrownlabs.workers.dev';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const proxy=process.env.https_proxy||process.env.HTTPS_PROXY;
const options={...(proxy?{proxy:{server:proxy}}:{}),viewport:{width:390,height:844},timezoneId:'America/Guayaquil'};
const owner=await browser.newContext(options),passenger=await browser.newContext(options);
const page=await owner.newPage(),other=await passenger.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function submit(form,endpoint){
 const [response]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/'+endpoint)&&r.request().method()==='POST'),page.locator(form+' button').click()]);
 const data=await response.json();assert.equal(response.status(),200,JSON.stringify(data));return data;
}
try{
 await page.goto(base+'/standard/');await page.locator('#createSession').click();
 await page.getByText('Acceso privado de desarrollo creado',{exact:true}).waitFor();
 await page.locator('[data-view="operator"]').click();
 await page.locator('#operatorForm input').fill('Operadora D1 ficticia '+Date.now());
 const operator=await submit('#operatorForm','operators');
 await page.locator('#vehicleForm input[name="model"]').fill('Van ficticia J3');
 const vehicle=await submit('#vehicleForm','vehicles');
 await page.locator('#offerForm select[name="vehicleId"]').selectOption(vehicle.id);
 const offer=await submit('#offerForm','route-offers');
 await page.locator('#departureForm select[name="offerId"]').selectOption(offer.id);
 await page.locator('#departureForm input[name="departAt"]').fill(new Date(Date.now()+86400000).toISOString().slice(0,16));
 const departure=await submit('#departureForm','departures');
 await other.goto(base+'/standard/');
 await other.locator(`[data-departure="${departure.id}"]`).waitFor();
 await other.reload();await other.locator(`[data-departure="${departure.id}"]`).waitFor();
 const anonymous=await passenger.request.get(base+'/standard-api/api/operator');assert.equal(anonymous.status(),401);
 const session=await (await passenger.request.post(base+'/standard-api/api/sessions',{data:{}})).json();
 const forbidden=await passenger.request.post(base+'/standard-api/api/vehicles',{
  headers:{Authorization:'Bearer '+session.token},data:{operatorId:operator.id,requestId:crypto.randomUUID(),type:'van',model:'Ajeno',capacity:8}});
 assert.equal(forbidden.status(),403);
 await page.reload();await page.locator('[data-view="operator"]').click();
 await page.locator('#operatorSelect option[value="'+operator.id+'"]').waitFor({state:'attached'});
 assert.equal(await other.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);
 console.log('J3 real D1: UI operator/vehicle/route/departure, second-session catalog/reload, restored access, 401/403 isolation: PASS');
}finally{await browser.close();}
