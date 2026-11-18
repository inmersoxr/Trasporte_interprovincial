import {api,status,refresh,catalog} from './app.mjs';
const $ = id => document.getElementById(id);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const section = document.createElement('section'); section.id='recurringSchedules'; section.hidden=true;
section.innerHTML=`<h2>Viajes recurrentes</h2><p>Publica tus horarios habituales para un periodo. Cada salida tiene sus propios asientos y reservas. Hora de Ecuador continental (UTC−5).</p>
<form id="recurringForm"><label>Ruta compartida<select name="offerId" required></select></label>
<label>Desde<input name="startDate" type="date" required></label><label>Hasta<input name="endDate" type="date" required></label>
<fieldset><legend>Días de salida</legend>${[1,2,3,4,5,6,0].map(day=>`<label><input name="weekdays" type="checkbox" value="${day}" checked> ${dayNames[day]}</label>`).join('')}</fieldset>
<fieldset><legend>Horarios del mismo vehículo</legend><div id="recurringTimes"></div><button id="addRecurringTime" type="button">Añadir horario</button></fieldset>
<label>Duración del recorrido (minutos)<input name="durationMinutes" type="number" min="1" max="2880" value="240" required></label>
<p>El vehículo, precio y capacidad son los de la ruta. Hasta 90 días y 90 salidas por programación. Los horarios deben permitir que el vehículo complete cada recorrido.</p>
<button id="previewRecurring" type="button">Revisar salidas</button><div id="recurringPreview" role="status" aria-live="polite"></div><button id="publishRecurring" class="yellow" disabled>Publicar programación</button></form>
<h3>Mis programaciones</h3><p>Para cambiar horarios, detén las próximas salidas sin reservas y crea otra programación. Las salidas con reservas se conservan. Puedes cancelar una fecha concreta desde Operación y manifiestos.</p><div id="recurringList"></div>`;
$('operatorMarket').before(section);
const form=$('recurringForm'); let previewBody=null,requestId=null,busy=false,loadRevision=0;
const date = offset => new Date(Date.now()-5*3600000+offset*86400000).toISOString().slice(0,10);
form.elements.startDate.value=date(1); form.elements.endDate.value=date(7);
form.elements.startDate.min=form.elements.endDate.min=date(0);
function clearPreview(){previewBody=null;requestId=null;$('publishRecurring').disabled=true;$('recurringPreview').replaceChildren();}
function addTime(value=''){
 const row=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input'),remove=document.createElement('button');
 label.textContent='Hora de salida';input.name='times';input.type='time';input.required=true;input.value=value;label.append(input);
 remove.type='button';remove.textContent='Quitar horario';remove.onclick=()=>{if($('recurringTimes').children.length>1){row.remove();clearPreview();}};
 row.append(label,remove);$('recurringTimes').append(row);clearPreview();
}
addTime('08:00');
$('addRecurringTime').onclick=()=>{if($('recurringTimes').children.length<12)addTime();};
form.addEventListener('input',clearPreview);
function body(){
 const data=new FormData(form);
 return {operatorId:$('operatorSelect').value,offerId:data.get('offerId'),timezone:'America/Guayaquil',startDate:data.get('startDate'),endDate:data.get('endDate'),weekdays:data.getAll('weekdays').map(Number),times:data.getAll('times'),durationMinutes:Number(data.get('durationMinutes'))};
}
function syncForm(){
 const old=form.elements.offerId.value;
 form.elements.offerId.replaceChildren(...[...$('departureForm').elements.offerId.options].map(option=>option.cloneNode(true)));
 if([...form.elements.offerId.options].some(o=>o.value===old))form.elements.offerId.value=old;
 section.hidden=!$('operatorSelect').value;clearPreview();load();
}
function setBusy(value){busy=value;$('previewRecurring').disabled=value;$('publishRecurring').disabled=value||!previewBody;}
$('previewRecurring').onclick=async()=>{
 if(busy||!form.reportValidity())return;
 clearPreview();setBusy(true);const proposed=body();
 try{
  const {preview}=await api('/recurring-schedules/preview',proposed);
  if(JSON.stringify(body())!==JSON.stringify(proposed))return;
  previewBody=JSON.stringify(proposed);
  const details=document.createElement('p');details.textContent=`${preview.count} salidas · ${preview.origin} → ${preview.destination} · ${preview.vehicle} · ${preview.capacity} plazas por salida · $${(preview.priceCents/100).toFixed(2)} por asiento.`;
  const list=document.createElement('ul');
  for(const d of preview.departures.slice(0,10)){const li=document.createElement('li');li.textContent=new Date(d.departAt).toLocaleString('es-EC',{timeZone:'America/Guayaquil'});list.append(li);}
  $('recurringPreview').append(details,list);
  if(preview.count>10){const more=document.createElement('p');more.textContent=`Y ${preview.count-10} salidas más dentro del periodo elegido.`;$('recurringPreview').append(more);}
 }catch(error){status(error.message);}finally{setBusy(false);}
};
form.onsubmit=async event=>{
 event.preventDefault();if(busy)return;
 const proposed=body();if(!previewBody||JSON.stringify(proposed)!==previewBody){status('Revisa las salidas antes de publicar');return;}
 setBusy(true);requestId||=crypto.randomUUID();
 try{
  const {schedule}=await api('/recurring-schedules',{...proposed,requestId});clearPreview();
  await refresh();await catalog();status(`${schedule.departureCount} salidas publicadas. Cada fecha tiene su propio inventario.`);
 }catch(error){status(error.message);}finally{setBusy(false);}
};
async function load(){
 const operatorId=$('operatorSelect').value,revision=++loadRevision;if(!operatorId)return;
 try{
  const {schedules}=await api('/recurring-schedules?operatorId='+encodeURIComponent(operatorId));
  if(revision!==loadRevision||operatorId!==$('operatorSelect').value)return;
  $('recurringList').innerHTML=schedules.map(s=>`<article><strong>${esc(s.origin)} → ${esc(s.destination)}</strong><p>${esc(s.vehicle)} · ${esc(s.start_date)} al ${esc(s.end_date)}</p><p>${s.weekdays.map(d=>dayNames[d]).join(', ')} · ${s.times.map(esc).join(', ')} · hora Ecuador continental</p><p>${s.departureCount} salidas · ${s.upcomingCount} próximas publicadas · ${s.status==='active'?'Programación publicada':'Programación detenida'}</p>${s.status==='active'?`<button data-stop-recurring="${s.id}">Detener próximas sin reservas</button>`:`<p>${s.retainedCount} próximas con reservas conservadas.</p>`}</article>`).join('')||'<p>No has creado programaciones recurrentes.</p>';
  for(const button of $('recurringList').querySelectorAll('[data-stop-recurring]'))button.onclick=async()=>{
   button.disabled=true;const id=button.dataset.stopRecurring;
   try{const result=await api('/recurring-schedules/'+id,{operatorId,action:'stop',requestId:button.dataset.requestId||=crypto.randomUUID()});await refresh();await catalog();await load();status(result.notice);}
   catch(error){status(error.message);button.disabled=false;}
  };
 }catch(error){status(error.message);}
}
document.addEventListener('standard:dashboard',syncForm);syncForm();
