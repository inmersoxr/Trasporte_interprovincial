import {$,api,post,run,refresh,loadOperators,node,status} from './app.mjs';
let invite='';
export function setupTeam(){
 $('joinTeam').onsubmit=e=>{e.preventDefault();run(async()=>{await api('/premium/join',{token:e.target.elements.token.value.trim()});e.target.reset();await loadOperators();status('Invitación aceptada.');});};
 $('branchForm').onsubmit=e=>{e.preventDefault();run(async()=>{await post('/premium/branches',{name:e.target.elements.name.value,city:e.target.elements.city.value});e.target.reset();await refresh();status('Sucursal guardada.');});};
 $('inviteForm').onsubmit=e=>{e.preventDefault();run(async()=>{invite=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');await post('/premium/invites',{role:e.target.elements.role.value,token:invite});$('inviteNotice').textContent='Invitación creada: cópiala y compártela de forma privada con la persona elegida. Vence en 24 horas y admite un solo acceso.';$('copyInvite').hidden=false;});};
 $('copyInvite').onclick=()=>run(async()=>{await navigator.clipboard.writeText(invite);status('Invitación copiada.');});
 $('assignmentForm').onsubmit=e=>{e.preventDefault();run(async()=>{const f=e.target.elements;await post('/premium/assignments',{vehicleId:f.vehicleId.value,branchId:f.branchId.value,driverUserId:f.driverUserId.value||null});await refresh();status('Asignación guardada.');});};
}
export function renderTeam(data){
 $('team').hidden=data.role==='driver';$('teamManage').hidden=data.role!=='owner';$('teamData').replaceChildren();
 for(const b of data.branches)$('teamData').append(node('p',b.name+' · '+b.city));
 for(const m of data.members){const row=node('p',m.display_name+' · '+({owner:'Propietario',admin:'Administrador',dispatcher:'Despachador',driver:'Conductor'}[m.role]||'Miembro'));if(data.role==='owner'&&m.role!=='owner'){const button=node('button','Revocar acceso');button.onclick=()=>run(async()=>{await post('/premium/revoke',{userId:m.user_id});await refresh();status('Acceso revocado.');});row.append(button);}$('teamData').append(row);}
 const form=$('assignmentForm').elements;for(const field of ['vehicleId','branchId','driverUserId'])form[field].replaceChildren();form.driverUserId.add(new Option('Sin conductor',''));
 for(const v of data.vehicles)form.vehicleId.add(new Option(v.model,v.id));for(const b of data.branches)form.branchId.add(new Option(b.name,b.id));for(const m of data.members.filter(m=>m.role==='driver'))form.driverUserId.add(new Option(m.display_name,m.user_id));
 for(const a of data.assignments)$('teamData').append(node('p',(data.vehicles.find(v=>v.id===a.vehicle_id)?.model||'Vehículo')+' → '+(data.branches.find(b=>b.id===a.branch_id)?.name||'Sucursal')+' · '+(a.driver_user_id?'Conductor asignado':'Sin conductor')));
}
