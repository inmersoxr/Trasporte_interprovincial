const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token = localStorage.getItem('rutasec-standard-session') || '', dashboard, refreshRevision = 0;
for (const id of ['vehicleForm','offerForm','departureForm']) $(id).hidden = true;
export async function api(path, body) {
  const response = await fetch('/standard-api/api' + path, { method: body ? 'POST' : 'GET',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? {'Content-Type':'application/json'} : {}) },
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'No se pudo completar'); return data;
}
export function status(message) { $('status').textContent = message; }
function options(items, label) { return items.map(item => `<option value="${esc(item.id)}">${esc(label(item))}</option>`).join(''); }
async function catalog() {
  const data = await api('/catalog');
  $('catalogList').innerHTML = data.departures.map(d => `<article data-departure="${esc(d.id)}"><strong>${esc(d.origin)} → ${esc(d.destination)}</strong><p>${esc(d.operatorName)} · ${esc(d.vehicle)}</p><p>${esc(new Date(d.departAt).toLocaleString('es-EC'))} · ${d.capacity} plazas</p><p>$${(d.priceCents/100).toFixed(2)} por asiento</p></article>`).join('') || '<p>No hay salidas publicadas.</p>';
  $('privateList').innerHTML = data.routeOffers.filter(r => r.serviceType === 'private_fixed').map(r => `<article><strong>${esc(r.origin)} → ${esc(r.destination)}</strong><p>${esc(r.vehicle)} · $${(r.priceCents/100).toFixed(2)} por vehículo</p></article>`).join('') || '<p>No hay rutas privadas publicadas.</p>';
  document.dispatchEvent(new CustomEvent('standard:catalog', { detail: data }));
}
export async function refresh() {
  if (!token) return;
  const revision = ++refreshRevision, next = await api('/operator');
  if (revision !== refreshRevision) return;
  dashboard = next; const selected = $('operatorSelect').value;
  $('operatorSelect').innerHTML = options(dashboard.operators, o => o.display_name);
  if (dashboard.operators.some(o => o.id === selected)) $('operatorSelect').value = selected;
  const operatorId = $('operatorSelect').value;
  const vehicles = dashboard.vehicles.filter(v => v.operator_id === operatorId);
  const offers = dashboard.routeOffers.filter(r => r.operator_id === operatorId);
  $('vehicleForm').hidden = $('offerForm').hidden = $('departureForm').hidden = !operatorId;
  $('offerForm').elements.vehicleId.innerHTML = options(vehicles, v => `${v.model} · ${v.capacity} plazas`);
  $('departureForm').elements.offerId.innerHTML = options(offers.filter(o => o.service_type === 'shared'), r => `${r.origin} → ${r.destination}`);
  $('operatorData').textContent = `${vehicles.length} vehículos · ${offers.length} rutas · ${dashboard.departures.filter(d => offers.some(o => o.id === d.offer_id)).length} salidas`;
  document.dispatchEvent(new CustomEvent('standard:dashboard', { detail: dashboard }));
}
async function guarded(action) { try { await action(); } catch (e) { status(e.message); } }
for (const button of document.querySelectorAll('[data-view]')) button.onclick = () => {
  for (const id of ['catalog','operator']) $(id).hidden = id !== button.dataset.view;
  guarded(button.dataset.view === 'operator' ? refresh : catalog);
};
$('createSession').onclick = () => guarded(async () => {
  const data = await api('/sessions', {}); token = data.token;
  localStorage.setItem('rutasec-standard-session', token); $('access').hidden = true; status('Acceso privado de desarrollo creado'); await refresh();
});
$('restoreSession').onsubmit = event => { event.preventDefault(); guarded(async () => {
  const next = event.target.elements.token.value.trim(), previous = token; token = next;
  try { await refresh(); localStorage.setItem('rutasec-standard-session', token); $('access').hidden = true; status('Acceso recuperado'); }
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
    if (id === 'departureForm') { body.departAt = new Date(body.departAt).toISOString(); body.durationMinutes = Number(body.durationMinutes); }
    await api(path, body); delete form.dataset.requestId; status('Guardado en D1'); await refresh(); await catalog();
  }); button.disabled = false;
};
$('operatorSelect').onchange = () => guarded(refresh);
$('refreshOperator').onclick = () => guarded(refresh);
$('access').hidden = !!token;
guarded(catalog); if (token) guarded(refresh);
setInterval(() => { if (!document.hidden && !$('catalog').hidden) guarded(catalog); }, 10000);
