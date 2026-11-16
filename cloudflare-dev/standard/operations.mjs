import {api,status} from './app.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const section=document.createElement('section');section.id='operatorOperations';
section.innerHTML='<h2>Operación y manifiestos</h2><p>Avisos DEMO recibidos en este panel. No se envían mensajes externos.</p><button id="refreshOperations">Actualizar operación</button><p id="operationsConnection" role="status"></p><form id="boardForm"><label>Verificar QR o código manual<input name="code" required placeholder="RUTASEC-STANDARD:... o RUTASEC-CUSTOM:..."></label><button class="yellow">Registrar embarque</button></form><div id="operationsAlerts"></div><div id="operationsList"></div><h3>Historial persistente de operaciones</h3><div id="operationsHistory"></div>';
$('operator').append(section);
let loading=false;
const action=(kind,id,act,label)=>`<button data-kind="${kind}" data-id="${id}" data-action="${act}">${label}</button>`;
const link=id=>id?`<p><a href="#track/${id}">Abrir seguimiento DEMO</a></p>`:'';
async function load(){
 const op=$('operatorSelect').value;if(!op||loading)return;loading=true;
 try{
  const data=await api('/operations?operatorId='+encodeURIComponent(op));$('operationsConnection').textContent='Conectado · manifiestos y avisos DEMO actualizados';
  $('operationsList').innerHTML=data.departures.map(d=>`<article data-service="${d.id}"><strong>Salida ${esc(d.origin)} → ${esc(d.destination)}</strong><p>${esc(d.depart_at)} · ${esc(d.status)}</p>${d.status==='published'?action('departure',d.id,'start','Iniciar simulación ahora')+action('departure',d.id,'cancel','Cancelar salida y simular reembolsos'):''}${d.status==='running'?action('departure',d.id,'finish','Finalizar simulación'):''}${link(d.liveId)}</article>`).join('')+
   data.bookings.map(b=>`<article data-manifest="${b.id}"><strong>${b.mode==='shared'?'Manifiesto compartido':'Privado fijo'} · ${esc(b.origin)} → ${esc(b.destination)}</strong><p>${esc(b.status)} · Pago SIMULADO $${(b.amount_cents/100).toFixed(2)}</p><ul>${b.passengers.map(p=>`<li>${esc(p.name)} · ${p.seat_number??'vehículo completo'} · ${p.boarded_at?'EMBARCADO':'Por embarcar'}<p class="small">RUTASEC-STANDARD:${b.id}:${p.position}</p></li>`).join('')}</ul>${b.status==='confirmed'&&!b.departure_id&&!b.serviceStatus?action('booking',b.id,'start','Iniciar simulación privada'):''}${b.serviceStatus==='running'?action('booking',b.id,'finish','Finalizar simulación privada'):''}${b.status==='confirmed'&&!b.passengers.some(p=>p.boarded_at)&&b.serviceStatus!=='completed'?action('booking',b.id,'cancel','Cancelar boleto y simular reembolso'):''}${link(b.liveId)}</article>`).join('')+
   data.custom.map(b=>`<article data-service="${b.id}"><strong>Personalizado ${esc(b.origin)} → ${esc(b.destination)}</strong><p>${esc(b.status)} · Pago SIMULADO $${(b.amount_cents/100).toFixed(2)} · ${b.boarded_at?'GRUPO EMBARCADO':'Grupo por embarcar'}</p><p class="small">RUTASEC-CUSTOM:${b.id}:0</p>${b.status==='confirmed'?action('custom',b.id,'start','Iniciar simulación personalizada'):''}${b.status==='running'?action('custom',b.id,'finish','Finalizar simulación personalizada'):''}${b.status==='confirmed'&&!b.boarded_at?action('custom',b.id,'cancel','Cancelar servicio y simular reembolso'):''}${link(b.liveId)}</article>`).join('');
  $('operationsAlerts').innerHTML=data.alerts.map(a=>`<article><strong>SOS DEMO · ${esc(a.status)}</strong><p>No se ha contactado a emergencias</p><button data-attend="${a.id}" data-trip="${a.tripId}" ${a.status==='attended'?'disabled':''}>Marcar atendida DEMO</button></article>`).join('');
  $('operationsHistory').innerHTML=data.history.map(e=>`<p>${esc(e.at)} · ${esc(e.entity_kind)} · ${esc(e.event)}</p>`).join('')||'<p>Sin eventos todavía.</p>';
  for(const button of section.querySelectorAll('[data-action]'))button.onclick=async()=>{
   button.disabled=true;try{const result=await api('/operations',{operatorId:op,kind:button.dataset.kind,id:button.dataset.id,action:button.dataset.action});status(result.notice||'Operación guardada en D1');loading=false;await load();}catch(e){status(e.message);button.disabled=false;}
  };
  for(const button of section.querySelectorAll('[data-attend]'))button.onclick=async()=>{
   button.disabled=true;try{const t=await api('/trips/'+button.dataset.trip);await api('/trips/'+button.dataset.trip+'/commands',{action:'attend',alertId:button.dataset.attend,requestId:crypto.randomUUID(),expectedRevision:t.trip.revision});status('SOS DEMO atendido');loading=false;await load();}catch(e){status(e.message);button.disabled=false;}
  };
 }catch(e){$('operationsConnection').textContent='Sin conexión · reintentando';status(e.message);}finally{loading=false;}
}
$('boardForm').onsubmit=async e=>{
 e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
 try{await api('/operations',{operatorId:$('operatorSelect').value,action:'board',code:e.target.elements.code.value.trim()});status('Embarque registrado en D1');await load();}catch(e){status(e.message);}finally{button.disabled=false;}
};
$('refreshOperations').onclick=load;document.addEventListener('standard:dashboard',load);
setInterval(()=>{if(!document.hidden&&!$('operator').hidden)load();},5000);load();
