import {hasAccess,signInFor} from '../account/session.mjs';
import {api,status} from './app.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let privateCursor=null,privateNext=null;
const privateOlder=document.createElement('button'),privateRecent=document.createElement('button');privateOlder.textContent='Solicitudes anteriores';privateRecent.textContent='Ver todas mis solicitudes';privateOlder.hidden=privateRecent.hidden=true;$('privateRequests').append(privateOlder,privateRecent);privateOlder.onclick=()=>{privateCursor=privateNext;loadPrivate();};privateRecent.onclick=()=>{privateCursor=null;const u=new URL(location.href);u.searchParams.delete('request');history.replaceState(null,'',u);loadPrivate();};
let operatorVehicles=[],queue=[],loadingPrivate=false,loadingMarket=false;
function updateVehicles(){
 const select=$('marketOfferForm').elements.vehicleId,old=select.value,op=$('operatorSelect').value;
 select.innerHTML=operatorVehicles.filter(v=>v.operator_id===op).map(v=>`<option value="${v.id}">${esc(v.model)} · ${v.capacity} pasajeros</option>`).join('');
 if([...select.options].some(o=>o.value===old))select.value=old;
}
document.addEventListener('standard:dashboard',e=>{operatorVehicles=e.detail.vehicles;updateVehicles();loadMarket();});
export async function loadPrivate(){
 if(loadingPrivate)return;loadingPrivate=true;
 try{
  const specific=new URLSearchParams(location.search).get('request'),query=new URLSearchParams();if(privateCursor)query.set('cursor',privateCursor);if(specific)query.set('request',specific);const {requests,nextCursor}=await api('/private-requests?'+query);privateNext=nextCursor;privateOlder.hidden=!nextCursor;privateRecent.hidden=!privateCursor&&!specific;$('offersConnection').textContent='Conectado · ofertas actualizadas cada 3 segundos';
  $('privateRequestList').innerHTML=requests.map(r=>`<article data-request="${r.id}"><h3>${esc(r.origin)} → ${esc(r.destination)}</h3><p>${r.immediate?'Lo necesito ahora':esc(new Date(r.requested_at).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}))} · ${r.people} pasajeros · ${esc(r.status)}${r.expired?' · plazo expirado':''}</p>${r.booking?`<div data-custom-booking="${r.booking.id}"><strong>Servicio personalizado ${esc(r.booking.status)}</strong><p>Pago SIMULADO · $${(r.booking.amount_cents/100).toFixed(2)}</p><p>Boleto ${r.booking.id}</p></div>`:''}<div class="offer-list">${r.offers.map(o=>`<article data-offer="${o.id}"><strong><a href="/miniapp/?operator=${esc(o.operator_id)}">${esc(o.operatorName)}</a></strong><p>${esc(o.vehicle)} · ${o.capacity} pasajeros · ${o.duration_minutes} min</p><p>${o.ratingCount?'★ '+Number(o.ratingAverage).toLocaleString('es-EC',{maximumFractionDigits:1})+' · '+o.ratingCount+(o.ratingCount===1?' valoración':' valoraciones'):'Aún sin valoraciones'} · <a href="/miniapp/?operator=${esc(o.operator_id)}&tab=reviews">Ver perfil y opiniones</a></p><p>Recogida: ${esc(new Date(o.pickup_at||r.requested_at).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}))}</p><p>$${(o.price_cents/100).toFixed(2)} por vehículo · ${esc(o.status)}</p>${o.status==='available'&&!r.expired&&!r.booking?`<button class="yellow" data-select="${o.id}" data-request="${r.id}" data-price="${o.price_cents}">Elegir esta oferta</button>`:''}</article>`).join('')||'<p>Esperando propuestas; no hay adjudicación automática.</p>'}</div>${r.status!=='cancelled'?`<button data-cancel-request="${r.id}">Cancelar solicitud/servicio</button>`:''}</article>`).join('')||'<p>No hay solicitudes en este acceso.</p>';
  for(const button of document.querySelectorAll('[data-select]'))button.onclick=async()=>{
   button.disabled=true;try{await api('/private-requests/'+button.dataset.request+'/select',{offerId:button.dataset.select,quotedPriceCents:Number(button.dataset.price),requestId:crypto.randomUUID()});status('Oferta elegida por ti; disponibilidad confirmada y pago SIMULADO');await loadPrivateAfter();}
   catch(e){status(e.message);button.disabled=false;}
  };
  for(const r of requests)if(r.booking&&r.booking.status!=='cancelled'){
   const target=document.querySelector(`[data-custom-booking="${r.booking.id}"]`),qr=document.createElement('div');qr.className='qr';target.append(qr);
   if(!r.booking.boarded_at)new window.QRCode(qr,{text:'RUTASEC-CUSTOM:'+r.booking.id+':0',width:180,height:180});else{qr.className='';qr.textContent='GRUPO EMBARCADO · QR utilizado';}
   if(r.booking.status==='completed'){const rating=document.createElement('a');rating.href='/miniapp/?'+new URLSearchParams({operator:r.booking.operator_id,tab:'reviews'});rating.textContent='Valorar este viaje completado';rating.className='rating-invitation';target.append(rating);}
   if(r.booking.liveId){const link=document.createElement('a');link.href='#track/'+r.booking.liveId;link.textContent='Estado del servicio del grupo';target.append(link);}
   if(r.booking.boarded_at||r.booking.status!=='confirmed')document.querySelector(`[data-cancel-request="${r.id}"]`)?.remove();
  }
  for(const button of document.querySelectorAll('[data-cancel-request]'))button.onclick=async()=>{
   button.disabled=true;try{await api('/private-requests/'+button.dataset.cancelRequest,{action:'cancel'});status('Solicitud cancelada; reembolso simulado si corresponde');await loadPrivateAfter();}catch(e){status(e.message);button.disabled=false;}
  };
 }catch(e){$('offersConnection').textContent='Sin conexión · reintentando; confirma disponibilidad al elegir';status(e.message);}
 finally{loadingPrivate=false;}
}
async function loadPrivateAfter(){loadingPrivate=false;await loadPrivate();}
async function loadMarket(){
 const selectedOperator=$('operatorSelect').value;if(loadingMarket||!hasAccess()||!selectedOperator||document.querySelector('.standard-shell').dataset.memberRole==='driver')return;loadingMarket=true;
 try{
  const data=await api('/private-market?operatorId='+encodeURIComponent(selectedOperator));if(selectedOperator!==$('operatorSelect').value)return;queue=data.requests;
  $('marketConnection').textContent='Conectado · solicitudes disponibles';
  $('marketQueue').innerHTML=queue.map(r=>`<p>${esc(r.origin)} → ${esc(r.destination)} · ${r.people} pasajeros · ${esc(r.requested_at)}</p>`).join('')||'<p>Sin solicitudes elegibles y disponibles.</p>';
  const select=$('marketOfferForm').elements.privateRequestId,old=select.value;
  select.innerHTML=queue.map(r=>`<option value="${r.id}">${esc(r.origin)} → ${esc(r.destination)} · ${r.people} pasajeros</option>`).join('');
  if(queue.some(r=>r.id===old))select.value=old;
  $('myOffers').innerHTML=data.offers.map(o=>`<p>Oferta $${(o.price_cents/100).toFixed(2)} · ${esc(o.status)} ${o.status==='available'?`<button data-withdraw="${o.id}">Retirar oferta</button>`:''}</p>`).join('');
  for(const button of document.querySelectorAll('[data-withdraw]'))button.onclick=async()=>{try{await api('/private-offers/'+button.dataset.withdraw,{action:'withdraw'});await loadMarketAfter();}catch(e){status(e.message);}};
 }catch(e){$('marketConnection').textContent='Sin conexión · reintentando';status(e.message);}
 finally{loadingMarket=false;}
}
async function loadMarketAfter(){loadingMarket=false;await loadMarket();}
$('marketOfferForm').elements.privateRequestId.onchange=()=>{
 const r=queue.find(r=>r.id===$('marketOfferForm').elements.privateRequestId.value);
 if(r)$('marketOfferForm').elements.durationMinutes.value=r.duration_minutes;
};
$('marketOfferForm').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button');button.disabled=true;
 try{await api('/private-offers',{operatorId:$('operatorSelect').value,privateRequestId:form.elements.privateRequestId.value,
  vehicleId:form.elements.vehicleId.value,priceCents:Math.round(Number(form.elements.price.value)*100),pickupMinutes:Number(form.elements.pickupMinutes.value),durationMinutes:Number(form.elements.durationMinutes.value),requestId:form.dataset.requestId||=crypto.randomUUID()});
  delete form.dataset.requestId;status('Oferta publicada; el pasajero decide, sin prioridad al primero');await loadMarketAfter();
 }catch(e){status(e.message);}finally{button.disabled=false;}
};
$('privateRequestForm').elements.immediate.onchange=e=>{const date=$('privateRequestForm').elements.serviceAt;date.disabled=e.target.checked;date.required=!e.target.checked;};
$('privateRequestForm').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button');button.disabled=true;
 try{const immediate=form.elements.immediate.checked;await api('/private-requests',{origin:form.elements.origin.value,destination:form.elements.destination.value,
  serviceAt:immediate?null:new Date(form.elements.serviceAt.value+'-05:00').toISOString(),immediate,people:Number(form.elements.people.value),
  passengers:form.elements.passengers.value.split('\n').map(n=>n.trim()).filter(Boolean),contactPhone:form.elements.contactPhone.value,pickupPoint:form.elements.pickupPoint.value,dropoffPoint:form.elements.dropoffPoint.value,
  vehicleType:form.elements.vehicleType.value,durationMinutes:Number(form.elements.durationMinutes.value),notes:form.elements.notes.value,requestId:form.dataset.requestId||=crypto.randomUUID()});
  privateCursor=null;const u=new URL(location.href);u.searchParams.delete('request');history.replaceState(null,'',u);delete form.dataset.requestId;status('Solicitud publicada: esperando ofertas, sin asignación automática');await loadPrivate();
 }catch(e){status(e.message);}finally{button.disabled=false;}
};
$('openPrivateMarket').onclick=()=>{
 if(!hasAccess()){signInFor({private:'1'});return;}
 for(const id of ['catalog','operator','myBookings','tracking'])$(id).hidden=true;$('privateRequests').hidden=false;loadPrivate();
};
$('openPrivateMarket').disabled=false;
function resumePrivate(){if(hasAccess()&&new URLSearchParams(location.search).has('private')){const url=new URL(location.href);url.searchParams.delete('private');history.replaceState(null,'',url.pathname+url.search);$('openPrivateMarket').click();}}
document.addEventListener('rutasec:account',resumePrivate);resumePrivate();
setInterval(()=>{if(!document.hidden){if(!$('privateRequests').hidden)loadPrivate();if(!$('operator').hidden)loadMarket();}},3000);
if(hasAccess())api('/operator').then(data=>{operatorVehicles=data.vehicles;updateVehicles();}).catch(e=>status(e.message));
