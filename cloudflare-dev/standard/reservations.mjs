import {api,status} from './app.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected,requestId,fixedOffer,fixedRequestId;
function enhance(data){
 for(const d of data.departures){
  const article=document.querySelector(`[data-departure="${d.id}"]`);if(!article||article.querySelector('button'))continue;
  const button=document.createElement('button');button.className='yellow';button.textContent=`Reservar · ${d.available} disponibles`;
  button.disabled=d.available<=0;button.onclick=()=>checkout(d);article.append(button);
 }
 for(const r of data.routeOffers.filter(r=>r.serviceType==='private_fixed')){
  const article=document.querySelector(`[data-private-route="${r.id}"]`);if(!article||article.querySelector('button'))continue;
  const button=document.createElement('button');button.className='yellow';button.textContent='Reservar vehículo completo';
  button.onclick=()=>{
   if(!localStorage.getItem('rutasec-standard-session')){status('Crea un acceso de desarrollo para reservar');return;}
   fixedOffer=r;fixedRequestId=crypto.randomUUID();$('privateError').textContent='';
   $('privateSummary').textContent=`${r.origin} → ${r.destination} · $${(r.priceCents/100).toFixed(2)} por vehículo · ${r.durationMinutes} min · hasta ${r.capacity} pasajeros`;
   $('privateReserveForm').querySelector('input[type="checkbox"]').checked=false;$('privateCheckout').showModal();
  };article.append(button);
 }
}
$('closePrivate').onclick=()=>$('privateCheckout').close();
$('privateReserveForm').onsubmit=async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector('button');button.disabled=true;
 try{
  await api('/private-route-bookings',{offerId:fixedOffer.id,serviceAt:new Date(form.elements.serviceAt.value).toISOString(),
   passengers:form.elements.passengers.value.split('\n').map(n=>n.trim()).filter(Boolean),quotedPriceCents:fixedOffer.priceCents,requestId:fixedRequestId});
  $('privateCheckout').close();status('Privado confirmado en D1 · pago SIMULADO');await loadBookings();
 }catch(error){$('privateError').textContent=error.message;}finally{button.disabled=false;}
};
function checkout(d){
 if(!localStorage.getItem('rutasec-standard-session')){status('Crea un acceso de desarrollo para reservar');return;}
 selected=d;requestId=crypto.randomUUID();$('checkoutSummary').textContent=`${d.origin} → ${d.destination} · $${(d.priceCents/100).toFixed(2)} por asiento`;
 $('seatGrid').innerHTML=Array.from({length:d.capacity},(_,i)=>`<label>${i+1}<input type="checkbox" value="${i+1}" ${d.reservedSeats.includes(i+1)?'disabled':''}></label>`).join('');
 $('passengerNames').innerHTML='';$('checkoutTotal').textContent='Selecciona al menos un asiento';
 $('reserveForm').querySelector('input[required]').checked=false;$('checkout').showModal();
}
$('seatGrid').onchange=()=>{
 const seats=[...$('seatGrid').querySelectorAll('input:checked')].map(i=>Number(i.value));
 const old=Object.fromEntries([...$('passengerNames').querySelectorAll('input')].map(i=>[i.dataset.seat,i.value]));
 $('passengerNames').innerHTML=seats.map(n=>`<label>Pasajero asiento ${n}<input data-seat="${n}" required minlength="2" maxlength="80" value="${esc(old[n]||'Pasajero ficticio '+n)}"></label>`).join('');
 $('checkoutTotal').textContent=`Total SIMULADO: $${(selected.priceCents*seats.length/100).toFixed(2)}`;
};
$('closeCheckout').onclick=()=>$('checkout').close();
$('reserveForm').onsubmit=async e=>{
 e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
 try{
  const inputs=[...$('passengerNames').querySelectorAll('input')];if(!inputs.length)throw new Error('Selecciona un asiento');
  await api('/bookings',{departureId:selected.id,seatNumbers:inputs.map(i=>Number(i.dataset.seat)),passengers:inputs.map(i=>i.value),quotedPriceCents:selected.priceCents,requestId});
  $('checkout').close();status('Pago SIMULADO confirmado en D1; boleto emitido');await loadBookings();
 }catch(error){status(error.message);$('checkoutSummary').textContent=error.message;}
 finally{button.disabled=false;}
};
export async function loadBookings(){
 try{
  const {bookings}=await api('/bookings');
  for(const id of ['catalog','operator'])$(id).hidden=true;$('myBookings').hidden=false;
  $('bookingList').innerHTML=bookings.map(b=>`<article data-booking="${b.id}"><strong>${esc(b.origin)} → ${esc(b.destination)}</strong><p>${esc(b.operatorName)} · ${esc(b.vehicle)}</p><p>${esc(b.service_at)} · ${esc(b.status)}</p><p>${esc(b.paymentLabel)} · $${(b.amount_cents/100).toFixed(2)}</p><ul>${b.passengers.map(p=>`<li>${esc(p.name)} · asiento ${p.seatNumber??'privado'}</li>`).join('')}</ul>${b.status==='confirmed'?b.qrCodes.map((qr,i)=>`<p>QR pasajero ${i+1}</p><div id="qr-${b.id}-${i}" class="qr"></div><p class="small">${esc(qr)}</p>`).join('')+`<button data-cancel="${b.id}">Cancelar y simular reembolso</button>`:''}</article>`).join('')||'<p>No hay boletos en este acceso.</p>';
  for(const b of bookings)if(b.status==='confirmed'){
   b.qrCodes.forEach((qr,i)=>new window.QRCode($(`qr-${b.id}-${i}`),{text:qr,width:180,height:180}));
  }
  for(const button of document.querySelectorAll('[data-cancel]'))button.onclick=async()=>{
   button.disabled=true;try{await api('/bookings/'+button.dataset.cancel,{action:'cancel'});await loadBookings();status('Cancelación persistida; reembolso SIMULADO');}
   catch(e){status(e.message);button.disabled=false;}
  };
 }catch(error){status(error.message);}
}
$('openBookings').onclick=loadBookings;$('refreshBookings').onclick=loadBookings;
document.addEventListener('standard:catalog',e=>enhance(e.detail));
api('/catalog').then(enhance).catch(e=>status(e.message));
