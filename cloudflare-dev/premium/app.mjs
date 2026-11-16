const $=id=>document.getElementById(id),key='rutasec-standard-session';
const status=message=>$('status').textContent=message;
async function api(path,body){
 const token=localStorage.getItem(key);
 if(!token)throw new Error('Abre Standard y crea o restaura tu acceso de desarrollo en este navegador.');
 const response=await fetch('/standard-api/api'+path,{method:body?'POST':'GET',cache:'no-store',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar la operación');return data;
}
function node(tag,value){const el=document.createElement(tag);el.textContent=value;return el;}
function field(form,label,name,value){const wrap=node('label',label),input=document.createElement('input');input.type='number';input.name=name;input.min='0';input.max='10000000';input.step='1';input.value=value??'';input.required=name==='odometerKm';wrap.append(input);form.append(wrap);}
async function run(action){const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await action();}catch(e){status(e.message);}finally{buttons.forEach(b=>b.disabled=false);}}
const post=(path,data)=>api(path,{...data,operatorId:$('operator').value,requestId:crypto.randomUUID()});
async function refresh(){
 const operatorId=$('operator').value;if(!operatorId){status('Crea primero una operadora y vehículos en Standard.');return;}
 const data=await api('/premium?operatorId='+encodeURIComponent(operatorId));
 $('activation').hidden=data.enabled;$('workspace').hidden=!data.enabled;
 if(!data.enabled){status('Premium aún no está habilitado para esta operadora.');return;}
 $('fleet').replaceChildren();$('jobs').replaceChildren();const select=$('maintenance').elements.vehicleId;select.replaceChildren();
 for(const v of data.vehicles){
  select.add(new Option(v.model,v.id));const card=node('div','');card.className='card';card.append(node('h3',v.model+' · '+v.capacity+' plazas'));
  if(v.next_service_km!=null&&v.odometer_km>=v.next_service_km)card.append(node('p','Mantenimiento por kilometraje pendiente'));
  const form=document.createElement('form');field(form,'Kilometraje registrado','odometerKm',v.odometer_km);field(form,'Próximo servicio en km (opcional)','nextServiceKm',v.next_service_km);form.append(node('button','Guardar kilometraje'));
  form.onsubmit=e=>{e.preventDefault();run(async()=>{await post('/premium/vehicle-profile',{vehicleId:v.id,odometerKm:Number(form.elements.odometerKm.value),nextServiceKm:form.elements.nextServiceKm.value===''?null:Number(form.elements.nextServiceKm.value)});await refresh();status('Kilometraje guardado.');});};card.append(form);$('fleet').append(card);
 }
 for(const job of data.maintenance){const card=node('div','');card.className='card';card.append(node('h3',job.summary),node('p',(data.vehicles.find(v=>v.id===job.vehicle_id)?.model||'Vehículo')+' · '+new Date(job.starts_at).toLocaleString()+' — '+new Date(job.ends_at).toLocaleString()),node('p',({open:'Programado',completed:'Completado',cancelled:'Cancelado'})[job.status]+' · Costo estimado USD '+(job.estimated_cost_cents/100).toFixed(2)));
  if(job.status==='open')for(const [state,label] of [['completed','Completar y liberar horario'],['cancelled','Cancelar mantenimiento']]){const button=node('button',label);button.onclick=()=>run(async()=>{await post('/premium/maintenance/'+job.id,{status:state});await refresh();status('Mantenimiento actualizado.');});card.append(button);}$('jobs').append(card);}
 status('Datos persistidos en D1 · Premium de desarrollo.');
}
$('activate').onclick=()=>run(async()=>{await post('/premium/activate',{});await refresh();});
$('refresh').onclick=()=>run(refresh);$('operator').onchange=()=>run(async()=>{$('workspace').hidden=true;$('activation').hidden=true;await refresh();});
$('maintenance').onsubmit=e=>{e.preventDefault();run(async()=>{const f=e.target.elements;await post('/premium/maintenance',{vehicleId:f.vehicleId.value,summary:f.summary.value,startsAt:new Date(f.startsAt.value).toISOString(),endsAt:new Date(f.endsAt.value).toISOString(),estimatedCostCents:Math.round(Number(f.cost.value)*100)});e.target.reset();await refresh();status('Mantenimiento guardado y horario bloqueado.');});};
run(async()=>{const data=await api('/operator');for(const op of data.operators)$('operator').add(new Option(op.display_name,op.id));await refresh();});
