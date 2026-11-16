import {api,status} from './app.mjs';
import {prepareRoad,tripSnapshot} from '../shared/trip-core.mjs';
const $=id=>document.getElementById(id);
let id,map,marker,road,state,clockOffset=0,loading=false;
async function command(action,extra={}){
 try{
  if(action==='sos'&&!confirm('SOS DEMO: solo registra una alerta simulada; no contacta emergencias. ¿Continuar?'))return;
  const current=await api('/trips/'+id);await api('/trips/'+id+'/commands',{action,...extra,requestId:crypto.randomUUID(),expectedRevision:current.trip.revision});await refresh();
 }catch(e){status(e.message);}
}
async function refresh(){
 if(!id||loading)return;loading=true;const requested=id;
 try{
  const started=Date.now(),data=await api('/trips/'+id);if(requested!==id)return;
  state=data.trip;clockOffset=data.serverNow-(started+Date.now())/2;
  $('trackingConnection').textContent='Conectado · posición SIMULADA · enlace persistente';
  $('trackingControls').replaceChildren();
  const add=(label,action,extra)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>command(action,extra);$('trackingControls').append(b);};
  if(data.permissions.control){add('Iniciar/reanudar DEMO','start');add('Pausar DEMO','pause');add('Acelerar 8× DEMO','speed',{multiplier:8});}
  if(data.permissions.control||data.permissions.passenger)add('SOS DEMO','sos');
  $('trackingAlerts').replaceChildren();
  for(const alert of state.alerts){const p=document.createElement('p');p.textContent='SOS DEMO · '+alert.status;$('trackingAlerts').append(p);
   if(alert.status!=='closed'){
    if(data.permissions.control){const b=document.createElement('button');b.textContent='Atender SOS DEMO';b.onclick=()=>command('attend',{alertId:alert.id});$('trackingAlerts').append(b);}
    if(data.permissions.control||data.permissions.passenger){const b=document.createElement('button');b.textContent='Cerrar SOS DEMO';b.onclick=()=>command('close-sos',{alertId:alert.id});$('trackingAlerts').append(b);}
   }
  }
 }catch(e){$('trackingConnection').textContent='Sin conexión · posición no actualizada';status(e.message);}finally{loading=false;}
}
async function open(){
 const match=location.hash.match(/^#track\/([0-9a-f-]{36})$/i);if(!match){id=null;return;}id=match[1];state=null;
 for(const section of ['catalog','operator','myBookings','privateRequests'])$(section).hidden=true;$('tracking').hidden=false;
 try{
  if(!road){const response=await fetch('../shared/route.json');if(!response.ok)throw new Error('No se pudo cargar geometría');road=prepareRoad(await response.json());}
  if(!map){map=L.map('standardMap');L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap · OSM France HOT',maxZoom:19}).addTo(map);
   const points=road.coordinates.map(([lng,lat])=>[lat,lng]);L.polyline(points,{color:'#e9bc44',weight:4}).addTo(map);map.fitBounds(points);marker=L.circleMarker(points[0],{radius:9,color:'#ffe12a',fillOpacity:1}).addTo(map);}
  setTimeout(()=>map.invalidateSize(),0);await refresh();
 }catch(e){status(e.message);}
}
setInterval(()=>{if(id&&!document.hidden&&!$('tracking').hidden)refresh();},3000);
setInterval(()=>{if(state&&road&&id&&!document.hidden&&!$('tracking').hidden){const snapshot=tripSnapshot(state,road,Date.now()+clockOffset);marker?.setLatLng([snapshot.position.lat,snapshot.position.lng]);$('trackingProgress').textContent=`SIMULADO · ${(snapshot.progress*100).toFixed(1)}% · ${snapshot.status} · referencia Cuenca–Guayaquil`; }},150);
$('copyTracking').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+location.pathname+'#track/'+id);status('Enlace público copiado; no incluye acceso privado');}catch{status('Copia la dirección del navegador para compartir este seguimiento DEMO');}};
$('closeTracking').onclick=()=>{location.hash='';$('tracking').hidden=true;$('catalog').hidden=false;};
window.addEventListener('hashchange',open);open();
