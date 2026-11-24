import {vehicleLabel} from './transport.mjs';
import {categoryImage} from './vehicle-picker.mjs';
import {showShare} from './share.mjs';
import {mountNavigation} from './navigation.mjs';
import {mountAccount,hasAccess} from '../account/session.mjs';
import {mountSearch} from './search.mjs';
import {cities} from './cities.mjs';
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const developmentTools=new URLSearchParams(location.search).get('dev')==='1';
let token = developmentTools ? localStorage.getItem('rutasec-standard-session') || '' : '', dashboard, refreshRevision = 0;
const copyAccess=document.createElement('button');copyAccess.id='copyStandardAccess';copyAccess.textContent='Copiar clave privada de mi acceso';copyAccess.hidden=!token||!developmentTools;
copyAccess.onclick=async()=>{try{await navigator.clipboard.writeText(token);status('Clave privada copiada; permite recuperar tu acceso en otro navegador. Consérvala privada.');}catch{status('No se pudo copiar; habilita permiso de portapapeles en este navegador');}};
document.querySelector('header').append(copyAccess);
for (const id of ['vehicleForm','offerForm','departureForm']) $(id).hidden = true;
export async function api(path, body) {
 try{
  const response = await fetch('/standard-api/api' + path, { method: body ? 'POST' : 'GET',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? {'Content-Type':'application/json'} : {}) },
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store',signal:AbortSignal.timeout(15000) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo completar'); return data;
 }catch(error){if(error.name==='TimeoutError')throw new Error('La conexión tardó demasiado. Actualiza el historial antes de reintentar.');if(error instanceof TypeError)throw new Error('Sin conexión con el servicio. Las reservas requieren conexión; revisa el historial al volver.');throw error;}
}
export function status(message) { $('status').textContent = message; }
const ratingLabel=item=>item.ratingCount?'★ '+Number(item.ratingAverage).toLocaleString('es-EC',{maximumFractionDigits:1})+' · '+item.ratingCount+(item.ratingCount===1?' valoración':' valoraciones'):'Aún sin valoraciones';
function vehicleImage(item){return item.vehiclePhotoUrl?`<img class="trip-vehicle-photo" src="${esc(item.vehiclePhotoUrl)}" alt="${esc(item.vehicle)}" loading="lazy">`:'<div class="trip-reference-photo">'+categoryImage(item.vehicleType)+'<small>Referencia del tipo de vehículo</small></div>';}
const detail=document.createElement('dialog');detail.id='tripDetails';detail.className='trip-detail-dialog';document.querySelector('.standard-shell').append(detail);
function openTrip(item,article){if(!item)return;detail.innerHTML=`<button type="button" class="detail-close" aria-label="Cerrar detalle">×</button>${vehicleImage(item)}<span class="tag">${item.departAt?'COMPARTIDO':'VEHÍCULO COMPLETO'}</span><h2>${esc(item.origin)} → ${esc(item.destination)}</h2><h3>${esc(item.vehicle)}</h3><p>${esc(vehicleLabel(item.vehicleType))} · ${esc(({public:'Público',private:'Privado',commercial:'Comercial'})[item.transportType]||'')} · ${esc(item.features||'')}</p><p><a href="${esc(item.profileUrl)}">${esc(item.operatorName)}</a> · ${esc(ratingLabel(item))}</p><p>${item.departAt?esc(new Date(item.departAt).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}))+' · hora de Ecuador': 'Elige tu fecha y hora al reservar'}</p><p>${esc(item.available??item.capacity)} ${item.departAt?'plazas disponibles':'pasajeros como máximo'}</p><p>Encuentro: ${esc(item.pickupPoint||'Consulta con la operadora')}</p><p>Llegada: ${esc(item.dropoffPoint||'Consulta con la operadora')}</p><h2>$${(item.priceCents/100).toFixed(2)} <small>${item.departAt?'por asiento':'por vehículo'}</small></h2><p class="small">Pago de prueba, sin cobros reales.</p><button type="button" class="yellow" data-detail-reserve>Reservar este viaje →</button>${item.departAt?'<button type="button" data-detail-share>Compartir viaje</button><section class="trip-share"></section>':''}`;detail.querySelector('.detail-close').onclick=()=>detail.close();detail.querySelector('[data-detail-reserve]').onclick=()=>{detail.close();article.querySelector('[data-reserve]')?.click();};if(item.departAt)detail.querySelector('[data-detail-share]').onclick=()=>showShare(detail.querySelector('.trip-share'),{url:location.origin+'/standard/?trip='+encodeURIComponent(item.id),title:item.origin+' → '+item.destination,onStatus:status});detail.showModal();}
export const apiHeaders=()=>token?{Authorization:'Bearer '+token}:{};
function options(items, label) { return items.map(item => `<option value="${esc(item.id)}">${esc(label(item))}</option>`).join(''); }
const searchQuery=mountSearch($('catalog'),()=>guarded(catalog));
for(const name of ['origin','destination']){
 const previous=$('offerForm').elements[name],select=document.createElement('select');select.name=name;select.required=true;
 for(const city of cities)select.add(new Option(city,city));select.value=previous.value;previous.replaceWith(select);
}
let catalogRevision=0,catalogCursor=null,nextCatalogCursor=null,lastCatalogQuery='';
const moreCatalog=document.createElement('button'),firstCatalog=document.createElement('button');moreCatalog.id='moreCatalog';moreCatalog.textContent='Ver más viajes';moreCatalog.hidden=true;firstCatalog.textContent='Volver a primeros viajes';firstCatalog.hidden=true;$('catalog').append(moreCatalog,firstCatalog);moreCatalog.onclick=()=>{catalogCursor=nextCatalogCursor;guarded(catalog);};firstCatalog.onclick=()=>{catalogCursor=null;guarded(catalog);};
export async function catalog() {
  const query=searchQuery(),operator=new URLSearchParams(location.search).get('operator');if(operator)query.set('operatorId',operator);const sharedTrip=new URLSearchParams(location.search).get('trip');if(sharedTrip&&/^[0-9a-f-]{36}$/i.test(sharedTrip)){for(const key of [...query.keys()])query.delete(key);query.set('departureId',sharedTrip);for(const key of ['boardingStop','alightingStop']){const value=new URLSearchParams(location.search).get(key);if(value!=null)query.set(key,value);}}
  const signature=query.toString();if(signature!==lastCatalogQuery){catalogCursor=null;lastCatalogQuery=signature;}if(catalogCursor)query.set('cursor',catalogCursor);
  const revision=++catalogRevision;let data;
  try{data=await api('/catalog?'+query);}catch(error){if(revision===catalogRevision){$('catalogList').textContent='No se pudieron actualizar los viajes. Revisa tu conexión.';$('privateList').replaceChildren();}throw error;}
  if(revision!==catalogRevision)return;if(data.maxCapacity)document.querySelector('#searchTrips [name=passengers]').max=String(data.maxCapacity);nextCatalogCursor=data.nextCursor;moreCatalog.hidden=!nextCatalogCursor;firstCatalog.hidden=!catalogCursor;
  $('catalogList').innerHTML = data.departures.map(d => `<article data-departure="${esc(d.id)}">${vehicleImage(d)}<strong>${esc(d.origin)} → ${esc(d.destination)}</strong><p><a href="/miniapp/?operator=${esc(d.operatorId)}">${esc(d.operatorName)}</a> · ${esc(d.vehicle)} · ${esc(vehicleLabel(d.vehicleType))}</p><p>${esc(ratingLabel(d))} · <a href="/miniapp/?operator=${esc(d.operatorId)}&tab=reviews">Opiniones</a></p><p>${esc(new Date(d.departAt).toLocaleString('es-EC',{timeZone:'America/Guayaquil'}))} · ${d.available} plazas disponibles</p><p>$${(d.priceCents/100).toFixed(2)} por asiento</p><button type="button" class="trip-details" data-detail="${esc(d.id)}">Ver viaje y vehículo →</button>${d.pickupPoint?`<p>Encuentro: ${esc(d.pickupPoint)} · Llegada: ${esc(d.dropoffPoint)}</p>`:""}</article>`).join('') || '<p>No hay salidas publicadas.</p>';
  $('privateList').innerHTML = data.routeOffers.filter(r => r.serviceType === 'private_fixed').map(r => `<article data-private-route="${r.id}">${vehicleImage(r)}<strong>${esc(r.origin)} → ${esc(r.destination)}</strong><p><a href="/miniapp/?operator=${esc(r.operatorId)}">${esc(r.operatorName)}</a> · ${esc(ratingLabel(r))}</p><p>${esc(r.vehicle)} · $${(r.priceCents/100).toFixed(2)} por vehículo · ${r.durationMinutes} min</p><button type="button" class="trip-details" data-detail="${esc(r.id)}">Ver viaje y vehículo →</button></article>`).join('') || '<p>No hay rutas privadas publicadas.</p>';
  for(const button of document.querySelectorAll('[data-detail]'))button.onclick=()=>openTrip(data.departures.find(d=>d.id===button.dataset.detail)||data.routeOffers.find(r=>r.id===button.dataset.detail),button.closest('article'));
  document.dispatchEvent(new CustomEvent('standard:catalog', { detail: data }));
}
export async function refresh() {
  if (!token && !hasAccess()) return;
  const revision = ++refreshRevision, next = await api('/operator');
  if (revision !== refreshRevision) return;
  dashboard = next; const selected = $('operatorSelect').value;
  $('operatorSelect').innerHTML = options(dashboard.operators, o => o.display_name);
  if (dashboard.operators.some(o => o.id === selected)) $('operatorSelect').value = selected;
  else if(dashboard.operators.some(o=>o.id===new URLSearchParams(location.search).get('operator')))$('operatorSelect').value=new URLSearchParams(location.search).get('operator');
  const operatorId = $('operatorSelect').value,memberRole=dashboard.operators.find(o=>o.id===operatorId)?.memberRole||'owner';document.querySelector('.standard-shell').dataset.memberRole=memberRole;
  const vehicles = dashboard.vehicles.filter(v => v.operator_id === operatorId);
  const offers = dashboard.routeOffers.filter(r => r.operator_id === operatorId);
  $('vehicleForm').hidden = $('offerForm').hidden = !operatorId||!['owner','admin'].includes(memberRole);$('departureForm').hidden=!operatorId||!['owner','admin','dispatcher'].includes(memberRole);
  $('offerForm').elements.vehicleId.innerHTML = options(vehicles.filter(v=>v.status==='active'), v => `${v.model} · ${v.capacity} plazas`);
  $('departureForm').elements.offerId.innerHTML = options(offers.filter(o => o.service_type === 'shared'), r => `${r.origin} → ${r.destination}`);
  const approved=dashboard.operators.find(o=>o.id===operatorId)?.status==='approved';
  $('offerForm').querySelector('button').disabled=!approved||!vehicles.some(v=>v.status==='active');
  $('departureForm').querySelector('button').disabled=!approved||!offers.some(o=>o.service_type==='shared');
  $('operatorData').textContent = `${vehicles.length} vehículos · ${offers.length} rutas · ${dashboard.departures.filter(d => offers.some(o => o.id === d.offer_id)).length} salidas`;
  document.dispatchEvent(new CustomEvent('standard:dashboard', { detail: dashboard }));
}
async function guarded(action) { try { await action(); } catch (e) { status(e.message); } }
for (const button of document.querySelectorAll('[data-view]')) button.onclick = () => {
  for (const id of ['catalog','operator','myBookings','privateRequests','tracking']) $(id).hidden = id !== button.dataset.view;
  if(location.hash.startsWith('#track/'))history.replaceState(null,'',location.pathname+location.search);
  guarded(button.dataset.view === 'operator' ? refresh : catalog);
};
$('createSession').onclick = () => guarded(async () => {
  const data = await api('/sessions', {}); token = data.token;
  localStorage.setItem('rutasec-standard-session', token); $('access').hidden = true;copyAccess.hidden=!developmentTools; status('Acceso privado de desarrollo creado'); await refresh();
});
$('restoreSession').onsubmit = event => { event.preventDefault(); guarded(async () => {
  const next = event.target.elements.token.value.trim(), previous = token; token = next;
  try { await refresh(); localStorage.setItem('rutasec-standard-session', token); $('access').hidden = true;copyAccess.hidden=!developmentTools; status('Acceso recuperado'); }
  catch(e) { token = previous; throw e; }
}); };
const forms = { operatorForm: '/operators', vehicleForm: '/vehicles', offerForm: '/route-offers', departureForm: '/departures' };
for (const [id, path] of Object.entries(forms)) $(id).onsubmit = async event => {
  event.preventDefault(); const form = event.target, button = form.querySelector('button'); button.disabled = true;
  await guarded(async () => {
    const body = Object.fromEntries(new FormData(form)); body.requestId = form.dataset.requestId ||= crypto.randomUUID();
    if (id !== 'operatorForm') {
      body.operatorId = $('operatorSelect').value;
      if (!body.operatorId) throw new Error('Selecciona una operadora antes de guardar');
    }
    if (id === 'vehicleForm') body.capacity = Number(body.capacity);
    if (id === 'offerForm') { body.priceCents = Math.round(Number(body.price) * 100); delete body.price; }
    if (id === 'departureForm') { body.departAt = new Date(body.departAt+'-05:00').toISOString(); body.durationMinutes = Number(body.durationMinutes); }
    await api(path, body); delete form.dataset.requestId; status('Cambios guardados'); await refresh(); await catalog();
  }); button.disabled = false;
};
$('operatorSelect').onchange = () => guarded(refresh);
$('refreshOperator').onclick = () => guarded(refresh);
$('access').hidden = !!token||!developmentTools;
guarded(catalog); if (token) guarded(refresh);
setInterval(() => { if (!document.hidden && !$('catalog').hidden) guarded(catalog); }, 10000);
import('./reservations.mjs').catch(e => status(e.message));
import('./notifications.mjs').catch(e=>status(e.message));
import('./changes.mjs').catch(e=>status(e.message));
import('./custom-settings.mjs').catch(e=>status(e.message));
import('./market.mjs').catch(e => status(e.message));
import('./operations.mjs').catch(e => status(e.message));
import('./recurring.mjs').catch(e => status(e.message));
import('./public-profile.mjs').catch(e => status(e.message));
import('./onboarding.mjs').catch(e => status(e.message));
import('./tracking.mjs').catch(e => status(e.message));
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>status('No se pudo habilitar el modo sin conexión'));
let installPrompt;
const install=document.createElement('button');install.id='installStandard';install.textContent='Instalar app';document.querySelector('header').append(install);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
install.onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else status('Para instalar: menú del navegador → Instalar app o Añadir a inicio. En iPhone: Compartir → Añadir a inicio.');};

const navigation=mountNavigation({refresh,catalog,status});
const accountArea=document.createElement('div');accountArea.className='booking-account';const accountOptions=document.createElement('details');accountOptions.innerHTML='<summary>Opciones de la aplicación</summary><div class="booking-account-options"></div>';accountArea.append(accountOptions);$('myBookings').append(accountArea);mountAccount(accountArea,data=>{if(data.authenticated){token='';copyAccess.hidden=true;$('access').hidden=true;guarded(refresh);if(new URLSearchParams(location.search).has('manage'))navigation.open();}else{$('access').hidden=!developmentTools||!data.developmentAuth;copyAccess.hidden=!developmentTools||!data.developmentAuth||!token;}});
