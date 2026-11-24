import {api,status} from './app.mjs';
import {renderGps,hideGps,markGpsUnavailable,startGps} from './gps.mjs';
const $=id=>document.getElementById(id);let id=null,loading=false;
async function refresh(){
 if(!id||loading)return;loading=true;const requested=id;
 try{
  const data=await api('/trips/'+requested);if(requested!==id)return;
  if(data.source!=='operations'){
   hideGps();$('standardMap').hidden=true;$('trackingControls').replaceChildren();$('trackingAlerts').replaceChildren();$('copyTracking').hidden=true;
   $('tracking').querySelector('h2').textContent='Seguimiento GPS';$('tracking').querySelector('h2+p').textContent='Este enlace corresponde a una demostración antigua, no a un dispositivo GPS.';
   $('trackingConnection').textContent='Sin ubicación GPS real';$('trackingProgress').textContent='No se muestran posiciones simuladas en esta aplicación.';return;
  }
  await renderGps(requested);
 }catch(e){markGpsUnavailable();status(e.message);}finally{loading=false;}
}
async function open(){
 const match=location.hash.match(/^#track\/([0-9a-f-]{36})$/i);if(!match){id=null;return;}
 id=match[1];document.body.classList.toggle('pilot-trip-view',new URLSearchParams(location.search).has('pilotOperator'));hideGps();$('standardMap').hidden=true;$('trackingControls').replaceChildren();$('trackingAlerts').replaceChildren();$('copyTracking').hidden=true;
 for(const section of ['catalog','operator','myBookings','privateRequests'])$(section).hidden=true;$('tracking').hidden=false;await refresh();const u=new URL(location.href);if(u.searchParams.get('autoGps')==='1'){u.searchParams.delete('autoGps');history.replaceState(null,'',u);await startGps(id);}
}
setInterval(()=>{if(id&&!document.hidden&&!$('tracking').hidden)refresh();},7000);
$('closeTracking').onclick=()=>{location.hash='';hideGps();$('tracking').hidden=true;$('catalog').hidden=false;};
window.addEventListener('hashchange',open);open();
