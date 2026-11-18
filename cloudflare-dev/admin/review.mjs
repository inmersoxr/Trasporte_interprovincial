const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
export function renderOperatorReview(container,data,{api,reload,run,notice}){
 container.replaceChildren();if(!data)return;
 container.append(node('h3','Expediente para operar'),node('p','La verificación del correo es independiente de esta revisión documental.'));
 if(!data.profile){container.append(node('p','El operador todavía no completó su perfil.'));return;}
 const p=data.profile;
 for(const [label,value]of [['Estado',p.review_state],['Prestador',data.operator.legal_name],['Identificación tributaria',data.operator.tax_id||'No indicada'],['Responsable',p.responsible_name],['Contacto',p.phone+' · '+p.contact_email],['Base',p.base_city+' · '+p.address],['Expediente',data.documented?'Completo para revisión manual':'Faltan datos o documentos vigentes']])container.append(node('p',label+': '+value));
 for(const d of data.drivers)container.append(node('p','Conductor: '+d.full_name+' · Licencia '+d.license_number+' ('+d.license_category+') · vence '+d.license_expires_on));
 for(const v of data.vehicles)container.append(node('p','Vehículo: '+v.model+' · '+(v.plate||'Sin placa')+' · '+v.capacity+' plazas'));
 const documents=node('div','');
 for(const d of data.documents){const line=node('p',(data.requiredDocuments.find(k=>k.kind===d.kind)?.label||d.kind)+' · '),link=node('a',d.filename);link.href='/platform-api/api/platform/documents/'+d.id;link.target='_blank';link.rel='noopener';line.append(link,node('span',d.expires_on?' · vence '+d.expires_on:''));documents.append(line);}
 container.append(documents);
 const form=document.createElement('form');form.innerHTML='<label>Decisión<select name="decision"><option value="approved">Aprobar para el piloto</option><option value="changes_requested">Solicitar correcciones</option><option value="suspended">Suspender</option></select></label><label>Observación de la revisión<textarea name="note" required minlength="2" maxlength="1000"></textarea></label><button>Guardar revisión documental</button>';
 form.elements.decision.options[0].disabled=!data.documented||p.review_state!=='submitted';
 if(form.elements.decision.options[0].disabled)form.elements.decision.value='changes_requested';
 form.onsubmit=event=>{event.preventDefault();run(async()=>{await api('/api/platform/operator-review',{operatorId:data.operator.id,expectedRevision:p.revision,decision:form.elements.decision.value,note:form.elements.note.value,requestId:form.dataset.requestId||=crypto.randomUUID()});await reload();notice('Revisión documental guardada.');});};
 container.append(form);
}
