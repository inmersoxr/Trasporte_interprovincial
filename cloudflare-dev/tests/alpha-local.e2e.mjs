import {browserPath} from './browser-path.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {runtime} from './runtime.mjs';
import {googleProvider} from './google-provider.mjs';
import {handleAuth,APP_ORIGIN,ADMIN_ORIGIN} from '../identity.mjs';
import {verifiedIdentity,stmt,rows,hash,failure} from '../standard-api.mjs';

test('Alpha local browser: recurring operator schedule, Google at checkout and persistent tickets across independent sessions', {timeout:120000}, async()=>{
  const {mf,db}=await runtime({developmentAuth:false});let browser;
  const core={identity:request=>verifiedIdentity(request,{DB:db}),stmt,rows,hash,failure};
  const errors=[];
  try{
    await db.prepare('UPDATE platform_owner_email_policy SET email_hash=?').bind(await hash('administrator-alpha@example.com')).run();
    browser=await chromium.launch({executablePath:browserPath,headless:true,args:['--no-sandbox']});
    async function actor(subject,timezoneId='America/Guayaquil'){
      const provider=await googleProvider(subject);
      const context=await browser.newContext({viewport:{width:390,height:844},timezoneId,serviceWorkers:'block'});
      await context.route('**/*',async route=>{
        const req=route.request(),url=new URL(req.url());
        if(url.origin==='https://accounts.google.com'){
          const callback=await provider.authorize(url);
          await route.fulfill({status:200,contentType:'text/html',body:`<h1>Proveedor Google SIMULADO para prueba local</h1><a href="${callback.href.replaceAll('&','&amp;')}">Aceptar acceso de prueba</a>`});return;
        }
        if(![APP_ORIGIN,ADMIN_ORIGIN].includes(url.origin)){await route.abort();return;}
        const prefix=url.origin===ADMIN_ORIGIN?'/platform-api':'/standard-api';
        if(url.pathname.startsWith(prefix+'/')){
          url.pathname=url.pathname.slice(prefix.length);
          const init={method:req.method(),headers:await req.allHeaders(),body:['GET','HEAD'].includes(req.method())?undefined:req.postDataBuffer()};
          let res;
          try{res=url.pathname.startsWith('/auth/')?await handleAuth(new Request(url,init),{DB:db,...provider.env},core,provider.network):await mf.dispatchFetch(url.href,init);}
          catch(error){res=Response.json({error:error.status?error.message:'No se pudo completar'},{status:error.status||503});}
          const headers=Object.fromEntries(res.headers),cookies=res.headers.getSetCookie();
          // Native Response has two Set-Cookie values on OAuth callback. Preserve
          // both in this local browser transport instead of comma-folding them.
          if(cookies.length>1){
            delete headers['set-cookie'];
            for(const value of cookies){const [pair,...attributes]=value.split(';'),at=pair.indexOf('='),name=pair.slice(0,at),cookieValue=pair.slice(at+1);const age=attributes.find(a=>a.trim().startsWith('Max-Age='));
              if(age&&Number(age.trim().slice(8))===0)await context.clearCookies({name});
              else await context.addCookies([{name,value:cookieValue,url:url.origin,httpOnly:true,secure:true,sameSite:'Lax'}]);
            }
          }
          if(res.status===302){
            // Route interception only handles the first URL of an HTTP redirect
            // chain. Use a fresh navigation so the Google transport stays local.
            const target=res.headers.get('Location');delete headers.location;headers['content-type']='text/html';
            await route.fulfill({status:200,headers,body:'<script>location.replace('+JSON.stringify(target)+')</script>'});return;
          }
          await route.fulfill({status:res.status,headers,body:Buffer.from(await res.arrayBuffer())});return;
        }
        const path=url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname;
        const root=new URL(url.origin===ADMIN_ORIGIN?'../out/admin-public/':'../out/public/',import.meta.url),file=new URL('.'+path,root);
        if(!file.pathname.startsWith(root.pathname)){await route.fulfill({status:404,body:''});return;}
        try{const type=path.endsWith('.mjs')||path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.json')||path.endsWith('.webmanifest')?'application/json':path.endsWith('.png')?'image/png':path.endsWith('.svg')?'image/svg+xml':'text/html';await route.fulfill({status:200,contentType:type,body:await readFile(file)});}
        catch{await route.fulfill({status:404,body:''});}
      });
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(15000);
      async function google(){
        await page.getByRole('button',{name:'Continuar con Google',exact:true}).click();
        try{await page.getByRole('link',{name:'Aceptar acceso de prueba'}).click();}
        catch(error){throw new Error(error.message+'; screen='+new URL(page.url()).pathname+'; text='+(await page.locator('body').innerText()).slice(0,1000)+'; errors='+JSON.stringify(errors));}
      }
      return {context,page,google};
    }
    const a=await actor('operator-alpha');
    await a.page.goto(APP_ORIGIN+'/account/');await a.google();await a.page.locator('#account').waitFor();
    assert.equal(await a.page.locator('#passwordSettings').isVisible(),false);
    await a.page.goto(APP_ORIGIN+'/standard/');await a.page.getByRole('button',{name:'Gestionar mi operadora',exact:true}).click();
    const operatorTab=async(tab,section)=>{await a.page.locator('[data-operator-tab="'+tab+'"]').click();if(section)await a.page.locator('[data-operator-section="'+section+'"]').click();};
    assert.equal(await a.page.locator('.operator-navigation button').count(),5);
    await operatorTab('more','company');
    await a.page.locator('#operatorForm [name="name"]').fill('Operadora Alpha de prueba');await a.page.locator('#operatorForm button').click();
    await operatorTab('fleet','vehicles');await a.page.locator('#vehicleForm').waitFor();await a.page.locator('#vehicleForm [name="model"]').fill('Vehículo Alpha de prueba');await a.page.locator('#vehicleForm [name="capacity"]').fill('2');await a.page.locator('#vehicleForm button').click();
    await a.page.locator('#vehicleDetailsForm [name="vehicleId"] option').waitFor({state:'attached'});
    await operatorTab('more','company');const profile=a.page.locator('#operatorProfileForm');
    for(const [name,value]of Object.entries({legalName:'Prestador Alpha de prueba',responsibleName:'Responsable de prueba',phone:'+593990000000',contactEmail:'contacto@example.com',address:'Dirección de prueba'}))await profile.locator(`[name="${name}"]`).fill(value);
    await profile.getByRole('button',{name:'Guardar perfil'}).click();await a.page.locator('#onboardingState').getByText(/Borrador/).waitFor();
    await operatorTab('fleet','drivers');const driver=a.page.locator('#operatorDriverForm');
    for(const [name,value]of Object.entries({fullName:'Conductor Alpha',phone:'+593990000000',identityNumber:'Identidad de prueba',licenseNumber:'LIC-ALPHA',licenseCategory:'AB',licenseExpiresOn:'2099-12-31'}))await driver.locator(`[name="${name}"]`).fill(value);
    await driver.getByRole('button',{name:'Guardar conductor'}).click();await a.page.locator('#vehicleDetailsForm [name="driverId"] option').waitFor({state:'attached'});
    await operatorTab('fleet','vehicles');const vehicle=a.page.locator('#vehicleDetailsForm');
    await vehicle.locator('[name="driverId"]').selectOption({label:'Conductor Alpha'});
    for(const [name,value]of Object.entries({plate:'ALP-1234',brand:'Marca de prueba',year:'2024',color:'Blanco'}))await vehicle.locator(`[name="${name}"]`).fill(value);
    await vehicle.getByRole('button',{name:'Guardar ficha del vehículo'}).click();
    await operatorTab('more','documents');const documents=a.page.locator('#operatorDocumentForm');
    for(const kind of ['identity','authorization','license','registration','insurance','inspection']){
      await documents.locator('[name="kind"]').selectOption(kind);await documents.locator('[name="expiresOn"]').fill('2099-12-31');
      await documents.locator('[name="file"]').setInputFiles({name:kind+'.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nDocumento de prueba\n%%EOF')});
      await documents.getByRole('button',{name:'Guardar documento'}).click();await a.page.getByRole('link',{name:kind+'.pdf',exact:true}).waitFor();
    }
    await a.page.getByRole('button',{name:'Solicitar revisión para operar'}).click();await operatorTab('more','company');await a.page.locator('#onboardingState').getByText(/En revisión/).waitFor();
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM departures').first()).n,0);
    const admin=await actor('administrator-alpha');await admin.page.goto(ADMIN_ORIGIN+'/');await admin.google();await admin.page.locator('#workspace').waitFor();
    await admin.page.getByRole('button',{name:'Revisar operadora'}).click();await admin.page.locator('#operatorReview [name="decision"]').selectOption('approved');
    await admin.page.locator('#operatorReview [name="note"]').fill('Documentos ficticios revisados en la prueba local');await admin.page.getByRole('button',{name:'Guardar revisión documental'}).click();
    await admin.page.getByText('Revisión documental guardada.',{exact:true}).waitFor();
    await a.page.locator('#refreshOperator').click();await a.page.locator('#onboardingState').getByText(/Aprobado/).waitFor();
    await operatorTab('trips','routes');await a.page.locator('#offerForm [name="vehicleId"] option').waitFor({state:'attached'});await a.page.locator('#offerForm [name="pickupPoint"]').fill('Encuentro de prueba en Cuenca');await a.page.locator('#offerForm [name="dropoffPoint"]').fill('Llegada de prueba en Guayaquil');await a.page.locator('#offerForm button').click();
    await operatorTab('trips','recurring');await a.page.locator('#recurringForm [name="offerId"] option').waitFor({state:'attached'});
    const localService=new Date(Date.now()+15*60000-5*3600000).toISOString(),publishedDate=localService.slice(0,10);
    const finalDate=new Date(Date.parse(publishedDate+'T00:00:00Z')+2*86400000).toISOString().slice(0,10);
    await a.page.locator('#recurringForm [name="startDate"]').fill(publishedDate);await a.page.locator('#recurringForm [name="endDate"]').fill(finalDate);await a.page.locator('#recurringForm [name="durationMinutes"]').fill('60');await a.page.locator('#recurringForm [name="times"]').fill(localService.slice(11,16));
    await a.page.getByRole('button',{name:'Revisar salidas'}).click();await a.page.locator('#recurringPreview').getByText(/3 salidas/).waitFor();
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM departures').first()).n,0);
    await a.page.getByRole('button',{name:'Publicar programación'}).click();await a.page.locator('#status').getByText(/3 salidas publicadas/).waitFor();
    const departures=(await db.prepare('SELECT id FROM departures ORDER BY depart_at').all()).results;assert.equal(departures.length,3);
    await mkdir(new URL('../qa-output/',import.meta.url),{recursive:true});
    await a.page.locator('#recurringSchedules').screenshot({path:new URL('../qa-output/alpha-recurring-390.png',import.meta.url).pathname});

    const b=await actor('passenger-alpha','Europe/Madrid');
    await b.page.goto(APP_ORIGIN+'/standard/');
    await b.page.getByRole('button',{name:'Gestionar mi operadora',exact:true}).click();await b.page.locator('[data-operator-tab="fleet"]').click();assert.equal(await b.page.locator('#vehicleDetailsForm').isVisible(),false);assert.equal(await b.page.locator('#operatorDriverForm').isVisible(),false);await b.page.locator('[data-operator-tab="more"]').click();await b.page.locator('[data-operator-section="account"]').click();await b.page.getByRole('button',{name:'Vista de pasajero',exact:true}).click();
    await b.page.locator('#searchTrips [name="origin"]').selectOption('Quito');await b.page.locator('#searchTrips button[type="submit"],#searchTrips button.yellow').click();
    await b.page.getByText('No hay salidas publicadas.',{exact:true}).waitFor();
    await b.page.locator('#searchTrips [name="origin"]').selectOption('Cuenca');await b.page.locator('#searchTrips [name="destination"]').selectOption('Guayaquil');
    await b.page.locator('#searchTrips [name="date"]').fill(publishedDate);await b.page.locator('#searchTrips button.yellow').click();
    const first=b.page.locator('[data-departure]').first();
    await first.getByRole('button',{name:/Reservar/}).click();await b.page.waitForURL('**/account/**');await b.google();
    await b.page.locator('#checkout').waitFor();
    assert.equal(await b.page.locator('#access').isVisible(),false);
    await b.page.locator('#seatGrid input[value="1"]').check();await b.page.locator('#passengerNames input').fill('Pasajero Alpha de prueba');
    await b.page.locator('#reserveForm [name="contactPhone"]').fill('+593981112233');await b.page.locator('#reserveForm [name="saveContact"]').check();await b.page.locator('#reserveForm input[type="checkbox"][required]').check();await b.page.getByRole('button',{name:'Confirmar pago SIMULADO',exact:true}).click();
    await b.page.locator('[data-booking]').waitFor();const booking=await db.prepare('SELECT id FROM bookings').first();
    assert.equal(await b.page.locator('.qr canvas,.qr img').count()>0,true);
    assert.equal((await db.prepare("SELECT COUNT(*) n FROM seat_claims WHERE status='confirmed'").first()).n,1);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM bookings').first()).n,1);
    await b.page.reload();await b.page.getByRole('button',{name:'Mis boletos'}).click();await b.page.locator(`[data-booking="${booking.id}"]`).waitFor();
    const qrImage=await b.page.locator('.qr canvas').first().evaluate(canvas=>canvas.toDataURL('image/png'));

    await operatorTab('reservations','manifest');await a.page.locator('#refreshOperations').click();await a.page.locator(`[data-manifest="${booking.id}"]`).getByText(/Pasajero Alpha de prueba/).waitFor();
    await a.page.bringToFront();
    await operatorTab('reservations','boarding');await a.page.locator('#boardForm [name="service"]').selectOption('departure:'+departures[0].id);
    await a.page.evaluate(async imageData=>{
      // Simulated camera frames, real jsQR pixel decoding and real D1 validation.
      globalThis.BarcodeDetector=undefined;
      const image=new Image();image.src=imageData;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;const context=canvas.getContext('2d');
      const draw=()=>{context.fillStyle='white';context.fillRect(0,0,640,480);context.drawImage(image,230,150,180,180);};draw();
      globalThis.testCameraStreams=[];
      navigator.mediaDevices.getUserMedia=async()=>{const stream=canvas.captureStream(12);globalThis.testCameraStreams.push(stream);const tick=setInterval(()=>{if(stream.getTracks().every(t=>t.readyState==='ended'))clearInterval(tick);else draw();},80);return stream;};
    },qrImage);
    await a.page.getByRole('button',{name:'Escanear QR con cámara'}).click();
    try{await a.page.getByText('Embarque confirmado y guardado en el servidor.',{exact:true}).waitFor();}
    catch(error){throw new Error(error.message+'; scan='+await a.page.locator('#boardingScanState').innerText()+'; camera='+JSON.stringify(await a.page.evaluate(()=>({ready:document.querySelector('#boardingCamera').readyState,width:document.querySelector('#boardingCamera').videoWidth,decoder:typeof window.jsQR,visibility:document.visibilityState})))+'; errors='+JSON.stringify(errors));}
    await b.page.bringToFront();
    await b.page.locator(`[data-booking="${booking.id}"]`).getByText('EMBARCADO',{exact:true}).waitFor();assert.equal(await b.page.locator('.qr canvas').count(),0);
    const boarded=(await db.prepare('SELECT boarded_at FROM standard_passengers WHERE booking_id=?').bind(booking.id).first()).boarded_at;assert.ok(boarded);
    await a.page.bringToFront();await a.page.getByRole('button',{name:'Escanear QR con cámara'}).click();await a.page.locator('#boardingScanState').getByText('Pasajero ya embarcado o boleto no habilitado',{exact:true}).waitFor();
    assert.equal((await db.prepare('SELECT boarded_at FROM standard_passengers WHERE booking_id=?').bind(booking.id).first()).boarded_at,boarded);
    assert.equal((await db.prepare("SELECT COUNT(*) n FROM standard_operational_events WHERE event='boarded'").first()).n,1);
    assert.equal(await a.page.evaluate(()=>globalThis.testCameraStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))),true);
    await b.page.reload();await b.page.getByRole('button',{name:'Mis boletos'}).click();await b.page.getByText('EMBARCADO',{exact:true}).waitFor();
    await operatorTab('reservations','manifest');await a.page.locator(`[data-service="${departures[1].id}"]`).getByRole('button',{name:'Cancelar salida y simular reembolsos'}).click();
    await operatorTab('reservations','manifest');await a.page.locator(`[data-service="${departures[1].id}"]`).getByText(/cancelled/).waitFor();
    assert.equal((await db.prepare("SELECT COUNT(*) n FROM departures WHERE status='published'").first()).n,2);
    // A second customer takes the last seat while the first customer's checkout is open.
    await b.page.getByRole('button',{name:'Explorar',exact:true}).click();await b.page.locator(`[data-departure="${departures[0].id}"] button`).click();await b.page.locator('#seatGrid input[value="2"]').check();
    const lastSeat=await actor('last-seat-alpha');await lastSeat.page.goto(APP_ORIGIN+'/account/');await lastSeat.google();await lastSeat.page.locator('#account').waitFor();
    const purchased=await lastSeat.page.evaluate(async departureId=>{const response=await fetch('/standard-api/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({departureId,seatNumbers:[2],passengers:['Otro pasajero de prueba'],contactPhone:'+593986665555',quotedPriceCents:1500,requestId:crypto.randomUUID()})});return response.status;},departures[0].id);assert.equal(purchased,200);
    await b.page.bringToFront();await b.page.locator('#checkoutSummary').getByText(/La salida ya no tiene disponibilidad/).waitFor();assert.equal(await b.page.locator('#reserveForm button.yellow').isDisabled(),true);await b.page.locator('#closeCheckout').click();
    const c=await actor('passenger-alpha');
    await c.page.goto(APP_ORIGIN+'/standard/?ticket='+booking.id);await c.page.waitForURL('**/account/**');await c.google();await c.page.locator(`[data-booking="${booking.id}"]`).waitFor();
    await c.page.getByText('EMBARCADO',{exact:true}).waitFor();
    await c.page.goto(APP_ORIGIN+'/account/');await c.page.locator('#account').waitFor();assert.equal(await c.page.locator('#accountProfile [name="phone"]').inputValue(),'+593981112233');
    for(const page of [a.page,b.page,c.page,admin.page])for(const width of [360,390,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
    await a.page.setViewportSize({width:390,height:844});
    for(const tab of ['home','trips','reservations','fleet','more']){await operatorTab(tab);assert.equal(await a.page.locator('.operator-page:visible').count(),1);assert.equal(await a.page.locator('.operator-navigation').isVisible(),true);await a.page.screenshot({path:new URL('../qa-output/operator-'+tab+'-390.png',import.meta.url).pathname});}
    await operatorTab('fleet','drivers');await a.page.reload();await a.page.locator('#operatorDriverForm').waitFor();assert.equal(await a.page.locator('#offerForm').isVisible(),false);
    await operatorTab('more','account');await a.page.getByRole('button',{name:'Vista de pasajero',exact:true}).click();assert.equal(await a.page.locator('.operator-navigation').isVisible(),false);assert.equal(await a.page.locator('#operator').isVisible(),false);
    assert.equal(await a.page.getByRole('link',{name:/Mi cuenta ·/}).isVisible(),true);await a.page.goBack();await a.page.locator('#operatorSection-account').waitFor();
    // Existing Premium capabilities use the same five destinations; no plan is purchased.
    const enable=await a.page.evaluate(async operatorId=>{const r=await fetch('/standard-api/api/premium/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operatorId,requestId:crypto.randomUUID()})});return r.status;},(await db.prepare("SELECT id FROM operators WHERE data_scope='alpha'").first()).id);assert.equal(enable,200);
    await a.page.goto(APP_ORIGIN+'/premium/');await a.page.locator('.operator-bottom').waitFor();assert.equal(await a.page.locator('.operator-bottom button').count(),5);
    await a.page.locator('[data-destination="fleet"]').click();await a.page.locator('#fleet').waitFor();assert.equal(await a.page.locator('#finance').isVisible(),false);
    await a.page.locator('[data-destination="more"]').click();await a.page.locator('.operator-subnav').getByRole('button',{name:'Finanzas',exact:true}).click();await a.page.locator('#finance').waitFor();assert.equal(await a.page.locator('#team').isVisible(),false);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM auth_identities').first()).n,4);
    assert.deepEqual(errors,[]);
  }finally{await browser?.close();await mf.dispose();}
});
