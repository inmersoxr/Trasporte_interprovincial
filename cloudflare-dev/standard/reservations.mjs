import {hasAccess,signInToReserve,signInFor,session} from '../account/session.mjs';
import {api,status} from './app.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected,requestId,fixedOffer,fixedRequestId,latestCatalog,loadingBookings=false,bookingsRevision=0,lastBookingsSnapshot='';
let historyCursor=null,nextCursor=null,viewedTicket=null,intentHandled=false;
const older=document.createElement('button'),recent=document.createElement('button');older.id='olderBookings';older.textContent='Más antiguos';older.hidden=true;recent.textContent='Volver a recientes';recent.hidden=true;$('myBookings').append(older,recent);
async function fillContact(form){try{const data=await session();if(!form.elements.contactPhone.value)form.elements.contactPhone.value=data.user?.phone||'';}catch{}}
const bookingStates={confirmed:'Confirmada',cancelled:'Cancelada',refunded:'Reembolsada',expired:'Vencida',payment_pending:'Pendiente'};
function enhance(data){
 latestCatalog=data;
 for(const d of data.departures){
  const article=document.querySelector(`[data-departure="${d.id}"]`);if(!article||article.querySelector('button'))continue;
  const button=document.createElement('button');button.className='yellow';button.textContent=`Reservar · ${d.available} disponibles`;
  button.disabled=d.available<=0;button.onclick=()=>checkout(d);article.append(button);
 }
 for(const r of data.routeOffers.filter(r=>r.serviceType==='private_fixed')){
  const article=document.querySelector(`[data-private-route="${r.id}"]`);if(!article||article.querySelector('button'))continue;
  const button=document.createElement('button');button.className='yellow';button.textContent='Reservar vehículo completo';
  button.onclick=()=>{
   if(!hasAccess()){signInToReserve('private',r.id);return;}
   fixedOffer=r;fixedRequestId=crypto.randomUUID();$('privateError').textContent='';
   $('privateSummary').textContent=`${r.origin} → ${r.destination} · $${(r.priceCents/100).toFixed(2)} por vehículo · ${r.durationMinutes} min · hasta ${r.capacity} pasajeros`;
   $('privateReserveForm').querySelector('input[type="checkbox"][required]').checked=false;$('privateCheckout').showModal();fillContact($('privateReserveForm'));
  };article.append(button);
 }
 resumeCheckout();
}
$('closePrivate').onclick=()=>$('privateCheckout').close();
$('privateReserveForm').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button');button.disabled=true;
 try{
  await api('/private-route-bookings',{offerId:fixedOffer.id,serviceAt:new Date(form.elements.serviceAt.value+'-05:00').toISOString(),
   passengers:form.elements.passengers.value.split('\n').map(n=>n.trim()).filter(Boolean),contactPhone:form.elements.contactPhone.value,saveContact:form.elements.saveContact.checked,quotedPriceCents:fixedOffer.priceCents,requestId:fixedRequestId});
  $('privateCheckout').close();status('Privado confirmado en D1 · pago SIMULADO');await loadBookings();
 }catch(error){$('privateError').textContent=error.message;}finally{button.disabled=false;}
};
function checkout(d){
 if(!hasAccess()){signInToReserve('shared',d.id);return;}
 selected=d;requestId=crypto.randomUUID();$('checkoutSummary').textContent=`${d.origin} → ${d.destination} · $${(d.priceCents/100).toFixed(2)} por asiento`;
 $('seatGrid').innerHTML=Array.from({length:d.capacity},(_,i)=>`<label>${i+1}<input type="checkbox" value="${i+1}" ${d.reservedSeats.includes(i+1)?'disabled':''}></label>`).join('');
 $('passengerNames').innerHTML='';$('checkoutTotal').textContent='Selecciona al menos un asiento';
 $('reserveForm').querySelector('input[type="checkbox"][required]').checked=false;$('reserveForm').querySelector('button').disabled=false;$('checkout').showModal();fillContact($('reserveForm'));
}
$('seatGrid').onchange=()=>{
 const seats=[...$('seatGrid').querySelectorAll('input:checked')].map(i=>Number(i.value));
 const old=Object.fromEntries([...$('passengerNames').querySelectorAll('input')].map(i=>[i.dataset.seat,i.value]));
 $('passengerNames').innerHTML=seats.map(n=>`<label>Pasajero asiento ${n}<input data-seat="${n}" required minlength="2" maxlength="80" value="${esc(old[n]||'')}"></label>`).join('');
 $('checkoutTotal').textContent=`Total SIMULADO: $${(selected.priceCents*seats.length/100).toFixed(2)}`;
};
$('closeCheckout').onclick=()=>$('checkout').close();
$('reserveForm').onsubmit=async e=>{
 e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
 try{
  const inputs=[...$('passengerNames').querySelectorAll('input')];if(!inputs.length)throw new Error('Selecciona un asiento');
  await api('/bookings',{departureId:selected.id,seatNumbers:inputs.map(i=>Number(i.dataset.seat)),passengers:inputs.map(i=>i.value),contactPhone:e.target.elements.contactPhone.value,saveContact:e.target.elements.saveContact.checked,quotedPriceCents:selected.priceCents,requestId});
  $('checkout').close();status('Pago SIMULADO confirmado en D1; boleto emitido');await loadBookings();
 }catch(error){status(error.message);$('checkoutSummary').textContent=error.message;}
 finally{button.disabled=false;}
};
export async function loadBookings({background=false,cursor=null,ticket=null}={}){
 if(!hasAccess()){if(!background)signInFor(ticket?{ticket}:{history:'1'});return;}
 if(background&&loadingBookings)return;loadingBookings=true;const turn=++bookingsRevision;
 try{
  const result=ticket?await api('/bookings/'+encodeURIComponent(ticket)):await api('/bookings'+(cursor?'?cursor='+encodeURIComponent(cursor):''));
  const bookings=ticket?[result.booking]:result.bookings;
  if(turn!==bookingsRevision||background&&$('myBookings').hidden)return;
  const snapshot=JSON.stringify({bookings,nextCursor:result.nextCursor||null});if(background&&snapshot===lastBookingsSnapshot)return;lastBookingsSnapshot=snapshot;
  historyCursor=cursor;viewedTicket=ticket;nextCursor=result.nextCursor||null;older.hidden=!nextCursor;recent.hidden=!cursor&&!ticket;
  for(const id of ['catalog','operator','privateRequests','tracking'])$(id).hidden=true;$('myBookings').hidden=false;
  $('bookingList').innerHTML=bookings.map(b=>`<article data-booking="${b.id}"><strong>${esc(b.origin)} → ${esc(b.destination)}</strong><p>${esc(b.operatorName)} · ${esc(b.vehicle)}</p><p>${esc(new Date(b.service_at).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}))} · ${esc(bookingStates[b.status]||b.status)}</p><p>${esc(b.paymentLabel)} · $${(b.amount_cents/100).toFixed(2)}</p><ul>${b.passengers.map(p=>`<li>${esc(p.name)} · asiento ${p.seatNumber??'privado'} · <strong>${p.boardedAt?'EMBARCADO':'Por embarcar'}</strong>${p.boardedAt?' · '+esc(new Date(p.boardedAt).toLocaleString('es-EC',{timeZone:'America/Guayaquil'})):''}</li>`).join('')}</ul>${b.status==='confirmed'?b.qrCodes.map((qr,i)=>b.passengers[i].boardedAt?`<p>QR del pasajero ${i+1} utilizado.</p>`:`<p>QR pasajero ${i+1}</p><div id="qr-${b.id}-${i}" class="qr"></div><details><summary>Código de respaldo</summary><p class="small">${esc(qr)}</p></details>`).join('')+(!b.passengers.some(p=>p.boardedAt)?`<button data-cancel="${b.id}">Cancelar y simular reembolso</button>`:''):''}</article>`).join('')||'<p>No hay boletos en esta cuenta.</p>';
  for(const b of bookings)if(b.status==='confirmed'){
   b.qrCodes.forEach((qr,i)=>{if(!b.passengers[i].boardedAt)new window.QRCode($(`qr-${b.id}-${i}`),{text:qr,width:180,height:180});});
  }
  for(const b of bookings){
   const article=document.querySelector(`[data-booking="${b.id}"]`);
   const details=document.createElement('p');details.textContent=(b.pickupPoint?'Encuentro: '+b.pickupPoint+' · ':'')+(b.dropoffPoint?'Llegada: '+b.dropoffPoint+' · ':'')+(b.vehiclePlate?'Placa: '+b.vehiclePlate:'');article.append(details);
   if(b.contactPhone){const contact=document.createElement('p');contact.textContent='Contacto de reserva: '+b.contactPhone;article.append(contact);}
   if(b.serviceStatus==='completed'){const rating=document.createElement('a');rating.href='/miniapp/?'+new URLSearchParams({operator:b.operatorId,tab:'reviews'});rating.textContent='Valorar este viaje completado';rating.className='rating-invitation';article.append(rating);}
  if(b.operatorPhone){const contact=document.createElement('a');contact.href='tel:'+b.operatorPhone.replace(/[^\d+]/g,'');contact.textContent='Contactar a la operadora';article.append(contact);}
   const copy=document.createElement('button');copy.textContent='Copiar enlace de este boleto';copy.onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+'/standard/?ticket='+encodeURIComponent(b.id));status('Enlace copiado. Para abrirlo se necesita entrar a la cuenta que reservó.');}catch{status('No se pudo copiar. Puedes recuperar el boleto en Mis boletos desde tu cuenta.');}};article.append(copy);
   if(b.liveId){const a=document.createElement('a');a.href='#track/'+b.liveId;a.textContent='Abrir seguimiento DEMO';article.append(a);}
   if(['running','completed'].includes(b.serviceStatus))article.querySelector('[data-cancel]')?.remove();
  }
  for(const button of document.querySelectorAll('[data-cancel]'))button.onclick=async()=>{
   button.disabled=true;try{await api('/bookings/'+button.dataset.cancel,{action:'cancel'});await loadBookings({cursor:historyCursor,ticket:viewedTicket});status('Cancelación persistida; reembolso SIMULADO');}
   catch(e){status(e.message);button.disabled=false;}
  };
 }catch(error){status(error.message);}finally{if(turn===bookingsRevision)loadingBookings=false;}
}
$('openBookings').onclick=()=>loadBookings();$('refreshBookings').onclick=()=>loadBookings({cursor:historyCursor,ticket:viewedTicket});older.onclick=()=>loadBookings({cursor:nextCursor});recent.onclick=()=>{const url=new URL(location.href);url.searchParams.delete('ticket');url.searchParams.delete('history');history.replaceState(null,'',url.pathname+url.search);loadBookings();};
$('openBookings').disabled=false;
document.addEventListener('standard:catalog',e=>enhance(e.detail));
function resumeCheckout(){
 const url=new URL(location.href),intent=url.searchParams.get('reserve');
 if(!intent||!latestCatalog||!hasAccess())return;
 const match=intent.match(/^(shared|private):([0-9a-f-]{36})$/i);
 url.searchParams.delete('reserve');history.replaceState(null,'',url.pathname+url.search+url.hash);
 if(!match){status('No se pudo recuperar el viaje. Vuelve a elegir una salida.');return;}
 if(match[1]==='shared'){
  const departure=latestCatalog.departures.find(d=>d.id===match[2]);
  if(!departure||departure.available<=0){status('La salida ya no está disponible. Elige otra salida.');return;}
  checkout(departure);
 }else{
  const button=document.querySelector(`[data-private-route="${match[2]}"] button`);
  if(button)button.click();else status('La ruta ya no está disponible. Elige otra ruta.');
 }
}
function resumeTicket(){
 if(intentHandled||!['true','false'].includes(document.documentElement.dataset.signedIn))return;
 const query=new URLSearchParams(location.search),ticket=query.get('ticket');
 if(!ticket&&!query.has('history'))return;intentHandled=true;
 if(ticket&&!/^[0-9a-f-]{36}$/i.test(ticket)){status('El enlace de boleto no es válido');return;}
 loadBookings({ticket});
}
document.addEventListener('rutasec:account',()=>{resumeCheckout();resumeTicket();});resumeTicket();
setInterval(()=>{if(!document.hidden&&!$('myBookings').hidden)loadBookings({background:true,cursor:historyCursor,ticket:viewedTicket});},5000);
setInterval(async()=>{
 if(document.hidden||!$('checkout').open||!selected)return;const id=selected.id;
 try{const data=await api('/catalog?operatorId='+encodeURIComponent(selected.operatorId)),next=data.departures.find(d=>d.id===id);if(!$('checkout').open||selected.id!==id)return;
  if(!next){$('checkoutSummary').textContent='La salida ya no tiene disponibilidad. Revisa Mis boletos si acabas de confirmar.';$('reserveForm').querySelector('button').disabled=true;return;}
  let changed=next.priceCents!==selected.priceCents;selected=next;
  for(const input of $('seatGrid').querySelectorAll('input')){const taken=Number(input.value)>next.capacity||next.reservedSeats.includes(Number(input.value));if(taken&&input.checked){input.checked=false;changed=true;}input.disabled=taken;}
  if(changed){$('seatGrid').onchange();$('reserveForm').querySelector('input[type="checkbox"][required]').checked=false;$('checkoutSummary').textContent='Cambió la disponibilidad o el precio. Revisa los asientos y el total antes de confirmar.';}
 }catch(error){status(error.message);}
},5000);
api('/catalog').then(enhance).catch(e=>status(e.message));
