import {mountAccount} from '../account/session.mjs';
import {setupBranding,renderBranding} from './branding.mjs';
import {setupFinance,renderFinance} from './finance.mjs';
import {setupBusiness,renderBusiness} from './business.mjs';
import {setupTeam,renderTeam} from './team.mjs';
export const $=id=>document.getElementById(id),key='rutasec-standard-session';
export const status=message=>$('status').textContent=message;
export async function api(path,body){
 const token=localStorage.getItem(key);
 const response=await fetch('/standard-api/api'+path,{method:body?'POST':'GET',cache:'no-store',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar la operación');return data;
}
export function node(tag,value){const el=document.createElement(tag);el.textContent=value;return el;}
function field(form,label,name,value){const wrap=node('label',label),input=document.createElement('input');input.type='number';input.name=name;input.min='0';input.max='10000000';input.step='1';input.value=value??'';input.required=name==='odometerKm';wrap.append(input);form.append(wrap);}
export async function run(action){const operator=$('operator'),wasDisabled=operator.disabled;operator.disabled=true;const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await action();}catch(e){status(e instanceof TypeError?'Sin conexión. Los cambios requieren conexión; revisa los registros antes de reintentar.':e.message);}finally{buttons.forEach(b=>b.disabled=false);operator.disabled=wasDisabled;}}
export const post=(path,data)=>api(path,{...data,operatorId:$('operator').value,requestId:data.requestId||crypto.randomUUID()});
export async function refresh(){
 const operatorId=$('operator').value;if(!operatorId){status('Crea primero una operadora y vehículos en Standard.');return;}
 const data=await api('/premium?operatorId='+encodeURIComponent(operatorId));
 $('activation').hidden=data.enabled;$('workspace').hidden=!data.enabled;
 if(!data.enabled){status('Premium aún no está habilitado para esta operadora.');return;}
 renderTeam(data);await renderBusiness(data);await renderFinance(data);await renderBranding(data);
 const canManage=['owner','admin'].includes(data.role);$('maintenance').hidden=!canManage;
 $('fleet').replaceChildren();$('jobs').replaceChildren();const select=$('maintenance').elements.vehicleId;select.replaceChildren();
 for(const v of data.vehicles){
  select.add(new Option(v.model,v.id));const card=node('div','');card.className='card';card.append(node('h3',v.model+' · '+v.capacity+' plazas'));
  if(v.next_service_km!=null&&v.odometer_km>=v.next_service_km)card.append(node('p','Mantenimiento por kilometraje pendiente'));
  const form=document.createElement('form');field(form,'Kilometraje registrado','odometerKm',v.odometer_km);field(form,'Próximo servicio en km (opcional)','nextServiceKm',v.next_service_km);form.append(node('button','Guardar kilometraje'));
  if(!canManage)for(const input of form.elements)input.disabled=true;
  form.onsubmit=e=>{e.preventDefault();run(async()=>{await post('/premium/vehicle-profile',{vehicleId:v.id,odometerKm:Number(form.elements.odometerKm.value),nextServiceKm:form.elements.nextServiceKm.value===''?null:Number(form.elements.nextServiceKm.value)});await refresh();status('Kilometraje guardado.');});};card.append(form);$('fleet').append(card);
 }
 for(const job of data.maintenance){const card=node('div','');card.className='card';card.append(node('h3',job.summary),node('p',(data.vehicles.find(v=>v.id===job.vehicle_id)?.model||'Vehículo')+' · '+new Date(job.starts_at).toLocaleString()+' — '+new Date(job.ends_at).toLocaleString()),node('p',({open:'Programado',completed:'Completado',cancelled:'Cancelado'})[job.status]+' · Costo estimado USD '+(job.estimated_cost_cents/100).toFixed(2)));
  if(canManage&&job.status==='open')for(const [state,label] of [['completed','Completar y liberar horario'],['cancelled','Cancelar mantenimiento']]){const button=node('button',label);button.onclick=()=>run(async()=>{await post('/premium/maintenance/'+job.id,{status:state});await refresh();status('Mantenimiento actualizado.');});card.append(button);}$('jobs').append(card);}
 status('Datos persistidos en D1 · Premium de desarrollo.');
}
$('activate').onclick=()=>run(async()=>{await post('/premium/activate',{});await refresh();});
$('refresh').onclick=()=>run(refresh);$('operator').onchange=()=>run(async()=>{history.replaceState(null,'','?operator='+encodeURIComponent($('operator').value));$('workspace').hidden=true;$('activation').hidden=true;await refresh();});
$('maintenance').onsubmit=e=>{e.preventDefault();run(async()=>{const f=e.target.elements;await post('/premium/maintenance',{vehicleId:f.vehicleId.value,summary:f.summary.value,startsAt:new Date(f.startsAt.value).toISOString(),endsAt:new Date(f.endsAt.value).toISOString(),estimatedCostCents:Math.round(Number(f.cost.value)*100),requestId:e.target.dataset.requestId||=crypto.randomUUID()});e.target.reset();await refresh();status('Mantenimiento guardado y horario bloqueado.');});};
setupTeam();setupBusiness();setupFinance();setupBranding();
export async function loadOperators(){const data=await api('/premium/operators');$('operator').replaceChildren();for(const op of data.operators)$('operator').add(new Option(op.display_name+' · '+op.role,op.id));const selected=new URLSearchParams(location.search).get('operator');if(data.operators.some(o=>o.id===selected))$('operator').value=selected;await refresh();}
for(const form of document.forms){form.addEventListener('input',()=>delete form.dataset.requestId);form.addEventListener('reset',()=>delete form.dataset.requestId);}
mountAccount(document.querySelector('header'),data=>data.offline?status('Sin conexión. Consulta y cambios requieren conexión; no se confirma ninguna operación.'):run(loadOperators));
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>status('No se pudo habilitar la aplicación sin conexión'));
let installPrompt;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});window.addEventListener('rutasec:manifest',()=>installPrompt=null);const install=node('button','Instalar aplicación de gestión');install.id='installPremium';document.querySelector('header').append(install);install.onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else status('En Android: menú → Instalar app. En iPhone: Compartir → Añadir a inicio.');};
