
const $=id=>document.getElementById(id);
function closeMenu(){document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close())}function toast(text){$('toast').textContent=text;$('toast').style.display='block';clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('toast').style.display='none',4500)}function saveLocal(k,v){try{localStorage.setItem(k,v)}catch{toast('No se pudo guardar en este dispositivo. Activa el almacenamiento del navegador.');throw new Error('Storage unavailable')}}function totalCost(v){return cost(v)*(mode==='shared'?Number($('people').value):1)}function cancelTrip(){window.BookingApp?.cancelCurrent()}const vehicleIcon='<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h16l3 6v8H2V9l1-3Zm1 5h17M7 6v5m6-5v5M5 15h2m10 0h2M5 20v2m14-2v2"/></svg>',arrowIcon='<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>',chevronIcon='<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 5 7 7-7 7"/></svg>';
const cities=['Guayaquil','Cuenca','Machala','Loja','Manta','Portoviejo','Riobamba','Ambato','Babahoyo','Quito','Latacunga','Santo Domingo','Salinas','Milagro','Azogues','Esmeraldas'];for(const id of ['from','to'])$(id).innerHTML=cities.map(c=>'<option>'+c+'</option>').join('');$('to').value='Cuenca';function localDate(d){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Guayaquil',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}const today=localDate(new Date());$('date').value=localDate(new Date(Date.now()+86400000));$('date').min=today;
const fleet=[{type:'van',title:'Furgoneta ejecutiva',operator:'Transporte Andecar',rating:'4.8',trips:'1,240',time:'06:00',arrival:'10:15',seats:12,price:15,img:'./assets/sprinter.webp'},{type:'suv',title:'SUV confortable',operator:'Sur Express',rating:'4.6',trips:'882',time:'08:30',arrival:'12:45',seats:4,price:22,img:'./assets/suv.webp'},{type:'van',title:'Furgoneta interprovincial',operator:'ViajaEC',rating:'4.9',trips:'540',time:'09:00',arrival:'13:00',seats:15,price:16,img:'./assets/minivan.webp'},{type:'auto',title:'Auto privado',operator:'Ruta Central',rating:'4.7',trips:'315',time:'14:00',arrival:'18:20',seats:4,price:20,img:'./assets/sedan.webp'}];let mode='shared',selected=0,activeFilter='all',installPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;updateInstallBanner()});window.addEventListener('appinstalled',()=>{installPrompt=null;$('installBanner').hidden=true;document.querySelectorAll('.app-install-button').forEach(b=>{b.disabled=true;b.querySelector('span').textContent='App instalada'})});function installedMode(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
function updateInstallBanner(){let dismissed=false;try{dismissed=Number(localStorage.getItem('rutasec-install-dismissed-until')||0)>Date.now()}catch{}$('installBanner').hidden=installedMode()||dismissed||document.querySelector('.shell').dataset.screen==='live-trip';}
function dismissInstallBanner(){$('installBanner').hidden=true;try{localStorage.setItem('rutasec-install-dismissed-until',String(Date.now()+86400000))}catch{}}
function installApp(){if(installedMode()){toast('RutasEC ya está abierta como aplicación.');return}if(installPrompt){const prompt=installPrompt;installPrompt=null;prompt.prompt();prompt.userChoice.then(result=>{if(result.outcome==='accepted')$('installBanner').hidden=true});return}const ios=/iPhone|iPad|iPod/.test(navigator.userAgent),android=/Android/.test(navigator.userAgent),steps=ios?['Abre esta página en Safari.','Toca Compartir y selecciona Añadir a pantalla de inicio.','Confirma con Añadir.']:android?['Abre esta página en Chrome.','Toca el menú ⋮ y selecciona Instalar aplicación o Añadir a pantalla principal.','Confirma la instalación.']:['Abre RutasEC en Chrome o Edge.','Usa el icono de instalación de la barra de direcciones o la opción Instalar esta página como aplicación del navegador.','Confirma la instalación.'];$('installInstructionsIntro').textContent=ios?'Añade RutasEC a la pantalla de inicio de tu iPhone o iPad.':android?'Añade RutasEC a la pantalla de inicio de tu teléfono.':'Instala RutasEC para abrirla directamente como una aplicación.';$('installSteps').replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));$('installDialog').showModal();}
updateDateLabel();let splashTimer=null;function launchSplash(){const splash=$('splash');if(!splash)return;splash.classList.remove('hide');splash.removeAttribute('aria-hidden');splash.style.display='flex';const loader=splash.querySelector('.loader');if(loader){const fresh=loader.cloneNode(true);loader.replaceWith(fresh)}clearTimeout(splashTimer);splashTimer=setTimeout(()=>{splash.classList.add('hide');splash.setAttribute('aria-hidden','true');setTimeout(()=>{if(splash.classList.contains('hide'))splash.style.display='none'},700)},3000)}launchSplash();document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.matchMedia('(display-mode: standalone)').matches)launchSplash()});window.addEventListener('pageshow',e=>{if(e.persisted)launchSplash()});
function show(id){closeMenu();document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));const tab=['detail','booking'].includes(id)?'results':id==='ticket'?'mytrip':id==='live-trip'?'security':id;document.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('on',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});document.querySelector('.shell').dataset.screen=id;$('bottomNav').hidden=id==='live-trip';if(id==='live-trip')$('installBanner').hidden=true;else updateInstallBanner();if(id!=='live-trip'&&/^#(?:demo|viaje|seguimiento|operaciones)(?:\/|$)/.test(location.hash))history.replaceState(null,'',location.pathname+location.search);window.scrollTo(0,0);if(id==='results')renderResults();if(id==='detail')renderDetail();if(id==='booking')renderBooking();if(id==='operator')renderOperator();if(id==='mytrip')renderTrip();if(id==='security')renderSecurity();if(id!=='ticket'&&/^#(?:boleto|salida)\//.test(location.hash))history.replaceState(null,'',location.pathname+location.search);document.dispatchEvent(new CustomEvent('rutas:screen',{detail:id}))}function swapCities(){let a=$('from').value;$('from').value=$('to').value;$('to').value=a}function modeSet(m){mode=m;$('shared').classList.toggle('selected',m==='shared');$('private').classList.toggle('selected',m==='private')}function search(){$('searchError').textContent='';if($('from').value===$('to').value){$('searchError').textContent='Elige ciudades diferentes.';return}if(!$('date').value||$('date').value<today){$('searchError').textContent='Elige una fecha actual o futura.';return}show('results')}function filter(t){activeFilter=t;document.querySelectorAll('#filters button').forEach((b,i)=>(b.classList.toggle('on',['all','auto','van','suv'][i]===t),b.setAttribute('aria-pressed',String(['all','auto','van','suv'][i]===t))));renderResults()}function cost(v){return mode==='shared'?v.price:v.price*v.seats}function formatDate(d){return new Intl.DateTimeFormat('es-EC',{weekday:'short',day:'numeric',month:'short',timeZone:'America/Guayaquil'}).format(new Date(d+'T12:00:00-05:00')).replaceAll('.','')}function updateDateLabel(){if($('date').value)$('dateLabel').textContent=formatDate($('date').value)}function renderResults(){window.BookingApp?.renderResults()}function select(i){selected=i;show('detail')}function cycle(n){let count=0;do{selected=(selected+n+fleet.length)%fleet.length;count++}while(fleet[selected].seats<Number($('people').value)&&count<fleet.length);renderDetail()}function renderDetail(){window.BookingApp?.renderDetail()}function renderBooking(){window.BookingApp?.renderCheckout()}function confirmTrip(){window.BookingApp?.pay()}function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function renderTrip(){window.BookingApp?.renderHistory()}function shareTrip(){window.BookingApp?.shareCurrentTicket()}
function renderOperator(){window.BookingApp?.openOperator()}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// Swipe and keyboard selection on the existing vehicle showroom.
let swipeStart=null;const showroom=document.querySelector('.showroom');showroom.addEventListener('pointerdown',e=>{swipeStart=e.clientX});showroom.addEventListener('pointerup',e=>{if(swipeStart!==null&&Math.abs(e.clientX-swipeStart)>45)cycle(e.clientX<swipeStart?1:-1);swipeStart=null});showroom.addEventListener('pointercancel',()=>swipeStart=null);document.addEventListener('keydown',e=>{if($('detail').classList.contains('active')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();cycle(e.key==='ArrowRight'?1:-1)}});

// Rotate only the destination artwork; search fields retain their state.
const destinationScenes = [
  {city:'Guayaquil',landmark:'Malecón 2000'},
  {city:'Cuenca',landmark:'Catedral Nueva'},
  {city:'Manta',landmark:'Playa El Murciélago'},
  {city:'Babahoyo',landmark:'Malecón 9 de Octubre'},
  {city:'Quito',landmark:'Centro histórico'}
];
const destinationPhotos = [...document.querySelectorAll('.hero-slides .hero-photo')];
const destinationDots = [...document.querySelectorAll('.hero-dot')];
const reducedDestinationMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let destinationIndex = 0;
let destinationPaused = reducedDestinationMotion.matches;
let destinationTimer = null;
let destinationBusy = false;
function syncDestinationTimer() {
  clearTimeout(destinationTimer);
  if (destinationPaused || document.hidden || !$('home').classList.contains('active')) return;
  destinationTimer = setTimeout(() => chooseDestination((destinationIndex + 1) % destinationScenes.length), 6000);
}
async function chooseDestination(index) {
  if (destinationBusy) return;
  destinationBusy = true;
  try {
    const photo = destinationPhotos[index];
    // Decode before crossfading so a slow connection never exposes an empty scene.
    if (!photo.complete || !photo.naturalWidth) await photo.decode();
    if (!photo.naturalWidth) throw new Error('Destination unavailable');
    destinationIndex = index;
    destinationPhotos.forEach((image,i) => {image.classList.toggle('is-active',i===index);image.setAttribute('aria-hidden',String(i!==index));});
    destinationDots.forEach((button,i) => {button.classList.toggle('is-active',i===index);button.setAttribute('aria-pressed',String(i===index));});
    $('heroCity').textContent=destinationScenes[index].city;
    $('heroLandmark').textContent=destinationScenes[index].landmark;
  } catch { /* Keep the current photograph if another destination cannot load. */ }
  finally { destinationBusy=false;syncDestinationTimer(); }
}
function syncDestinationPause() {
  $('carouselPause').setAttribute('aria-label',destinationPaused?'Reanudar carrusel':'Pausar carrusel');
  $('carouselPause').setAttribute('aria-pressed',String(destinationPaused));
  $('carouselPause').innerHTML=destinationPaused?'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5 2 8 6-8 6Z" fill="currentColor"/></svg>':'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2"/></svg>';
  syncDestinationTimer();
}
function toggleDestinations(){destinationPaused=!destinationPaused;syncDestinationPause();}
reducedDestinationMotion.addEventListener('change',event=>{destinationPaused=event.matches;syncDestinationPause();});
document.addEventListener('visibilitychange',syncDestinationTimer);
new MutationObserver(syncDestinationTimer).observe($('home'),{attributes:true,attributeFilter:['class']});
let destinationSwipe=null;
const destinationArea=document.querySelector('.home-top');
destinationArea.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;destinationSwipe={x:e.clientX,y:e.clientY};});
destinationArea.addEventListener('pointerup',e=>{if(!destinationSwipe)return;const dx=e.clientX-destinationSwipe.x,dy=e.clientY-destinationSwipe.y;destinationSwipe=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)chooseDestination((destinationIndex+(dx<0?1:-1)+destinationScenes.length)%destinationScenes.length);});
destinationArea.addEventListener('pointercancel',()=>destinationSwipe=null);
syncDestinationPause();

function startLiveDemo(){if(window.LiveTrip)window.LiveTrip.openDemo();else toast('El mapa está cargando. Reintenta en un momento.')}function openLiveOperations(){if(window.LiveTrip)window.LiveTrip.openOperations();else toast('El mapa está cargando. Reintenta en un momento.')}

// Visible passenger-safety entry and restored bottom navigation.
function renderSecurity(){let saved=null,known=false;try{saved=localStorage.getItem('rutasec-last-live');known=!!JSON.parse(localStorage.getItem('rutasec-live-keys')||'{}')[saved];const phone=localStorage.getItem('rutasec-emergency-contact')||'';$('securityContactStatus').textContent=phone?'Contacto guardado · •••• '+phone.slice(-4):'Sin contacto configurado'}catch{}$('securityStart').textContent=known?'Abrir mi viaje de demostración':'Iniciar viaje de demostración';$('securityNew').hidden=!known;}
function startNewLiveDemo(){if(window.LiveTrip)window.LiveTrip.newDemo();else toast('El mapa está cargando. Reintenta en un momento.')}
function configureEmergencyContact(){if(window.LiveTrip)window.LiveTrip.contact();else toast('El módulo de seguridad está cargando. Reintenta en un momento.')}

$('liveSOSDialog').addEventListener('close',()=>{if($('security').classList.contains('active'))renderSecurity()});
if(location.hash==='#seguridad')show('security');
window.addEventListener('hashchange',()=>{if(location.hash==='#seguridad')show('security')});

setTimeout(updateInstallBanner,4000);
