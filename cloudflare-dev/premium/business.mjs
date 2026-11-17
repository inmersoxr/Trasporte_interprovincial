import {$,api,run,node,status} from './app.mjs';
export function setupBusiness(){const form=$('periodForm');form.elements.from.value=new Date(Date.now()-30*86400000).toISOString().slice(0,10);form.elements.to.value=new Date(Date.now()+30*86400000).toISOString().slice(0,10);form.onsubmit=e=>{e.preventDefault();run(()=>renderBusiness({role:$('business').dataset.role}));};}
export function selectedPeriod(){const f=$('periodForm').elements;return'operatorId='+encodeURIComponent($('operator').value)+'&from='+f.from.value+'&to='+f.to.value;}
export async function renderBusiness(data){$('business').hidden=data.role==='driver';$('business').dataset.role=data.role;if(data.role==='driver')return;
 const result=await api('/premium/analytics?'+selectedPeriod());$('analytics').replaceChildren();
 for(const mode of result.modes)$('analytics').append(node('p',({'shared':'Compartido','private_fixed':'Privado fijo','private_custom':'Personalizado'})[mode.mode]+': '+mode.bookings+' reservas · '+mode.cancelled+' canceladas · '+mode.passengers+' pasajeros vigentes'));
 if(!result.modes.length)$('analytics').append(node('p','Sin reservas en este período.'));
 $('analytics').append(node('h3','Salidas y ocupación (hasta 100)'));for(const d of result.departures)$('analytics').append(node('p',d.origin+' → '+d.destination+' · '+new Date(d.depart_at).toLocaleString()+' · '+d.status+' · '+d.occupied+'/'+d.capacity+' plazas'));
 $('analytics').append(node('h3','Calendario activo (hasta 100)'));for(const s of result.calendar)$('analytics').append(node('p',s.model+' · '+s.kind+' · '+new Date(s.starts_at).toLocaleString()+' — '+new Date(s.ends_at).toLocaleString()));
 $('analytics').append(node('h3','Alertas de seguimiento DEMO'));for(const alert of result.alerts){const link=node('a',alert.status+' · Abrir seguimiento simulado');link.href='/standard/#track/'+alert.tripId;$('analytics').append(link);}
 $('analytics').append(node('h3','Historial operativo (últimos 100)'));for(const h of result.history)$('analytics').append(node('p',h.event+' · '+h.entity_kind+' · '+new Date(h.at).toLocaleString()));
 $('analyticsStatus').textContent='Consultado en D1: '+new Date(result.generatedAt).toLocaleString()+'. Período UTC; GPS, SOS y avisos son simulados.';
}
