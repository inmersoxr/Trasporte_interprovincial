const $=id=>document.getElementById(id),operator=new URLSearchParams(location.search).get('operator');
let prompt;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;});$('install').onclick=async()=>{if(prompt){await prompt.prompt();prompt=null;}else $('installStatus').textContent='En Android: menú → Instalar app. En iPhone: Compartir → Añadir a inicio.';};
try{if(!/^[0-9a-f-]{36}$/i.test(operator||''))throw new Error('Abre el enlace de una operadora publicada.');const response=await fetch('/standard-api/api/miniapps/'+operator,{cache:'no-store'});const profile=await response.json();if(!response.ok)throw new Error(profile.error);
 document.title=profile.title+' · RutasEC';for(const name of ['title','tagline','bio'])$(name).textContent=profile[name];document.documentElement.style.setProperty('--brand',profile.accent);$('title').style.borderBottom='5px solid '+profile.accent;
 for(const [id,field]of [['logo','logoUrl'],['cover','coverUrl']])if(profile[field]){$(id).src=profile[field];$(id).hidden=false;}
 if(profile.website){$('website').href=profile.website;$('website').hidden=false;}
 $('manifest').href='/standard-api/api/miniapps/'+operator+'/manifest';$('book').href='/standard/?operator='+operator;$('book').hidden=false;$('manage').href='/premium/?operator='+operator;$('manage').hidden=false;
 const catalogResponse=await fetch(profile.catalogUrl,{cache:'no-store'});if(!catalogResponse.ok)throw new Error('No se pudo cargar la disponibilidad.');const catalog=await catalogResponse.json();
 for(const route of catalog.routeOffers){const p=document.createElement('p');p.textContent=route.origin+' → '+route.destination+' · '+route.vehicle+' · USD '+(route.priceCents/100).toFixed(2)+(route.serviceType==='shared'?' por asiento':' por vehículo');$('routes').append(p);}
 $('status').textContent=catalog.routeOffers.length?'Perfil publicado por la operadora.':'Esta operadora aún no tiene rutas publicadas.';
}catch(error){$('status').textContent=error instanceof TypeError?'Sin conexión. No se puede consultar disponibilidad ni reservar; vuelve a conectar.':error.message;}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>$('installStatus').textContent='No se pudo habilitar la aplicación sin conexión');
