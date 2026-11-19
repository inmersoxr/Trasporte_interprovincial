import {cities} from './standard/cities.mjs';
import {documentKinds} from './standard/onboarding-policy.mjs';
import {normalizeEmail} from './password-auth.mjs';
const uuid=value=>typeof value==='string'&&/^[0-9a-f-]{36}$/i.test(value);
const today=()=>new Date(Date.now()-5*3600000).toISOString().slice(0,10);
function validDate(value,failure){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value||value<today())throw failure('La fecha de vencimiento debe estar vigente');
 return value;
}
function phone(value,failure){if(typeof value!=='string'||!/^\+?[0-9 ()-]{7,24}$/.test(value)||(value.match(/\d/g)||[]).length<7||(value.match(/\d/g)||[]).length>15)throw failure('Escribe un teléfono válido');return value.trim();}
async function previous(db,user,body,kind,c){
 if(!uuid(body.requestId))throw c.failure('Solicitud no válida');
 const row=await c.stmt(db,'SELECT * FROM standard_commands WHERE user_id=? AND request_id=?',[user.id,body.requestId]).first();
 if(row&&(row.kind!==kind||row.fingerprint!==await c.hash(JSON.stringify(body))))throw c.failure('Reintento con contenido distinto',409);
 return row;
}
async function saveVersioned(db,user,body,kind,entityId,table,key,mutation,nonce,following,c){
 const fingerprint=await c.hash(JSON.stringify(body)),condition=`EXISTS(SELECT 1 FROM ${table} WHERE ${key}=? AND last_nonce=?)`,test=[entityId,nonce];
 const result=await db.batch([mutation,
  ...following(condition,test),
  c.stmt(db,`INSERT INTO standard_commands(user_id,request_id,kind,fingerprint,entity_id) SELECT ?,?,?,?,? WHERE ${condition}`,[user.id,body.requestId,kind,fingerprint,entityId,...test]),
  c.stmt(db,`INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'standard_onboarding',?,'updated' WHERE ${condition}`,[crypto.randomUUID(),user.id,body.operatorId,...test])]);
 if(result[0].meta.changes!==1&&!await previous(db,user,body,kind,c))throw c.failure('Los datos cambiaron; actualiza antes de guardar',409);
 return {id:entityId};
}
function invalidate(db,op,c,condition,args){return[
 c.stmt(db,`UPDATE operators SET status='pending' WHERE id=? AND data_scope='alpha' AND ${condition}`,[op,...args]),
 c.stmt(db,`UPDATE standard_operator_profiles SET review_state='draft',review_note='',revision=revision+1 WHERE operator_id=? AND ${condition}`,[op,...args])];}

export async function onboardingData(db,operatorId,c){
 const {stmt,rows}=c,operator=await stmt(db,'SELECT id,display_name,legal_name,tax_id,status,data_scope FROM operators WHERE id=?',[operatorId]).first();
 if(!operator)throw c.failure('Operadora no encontrada',404);
 const profile=await stmt(db,'SELECT * FROM standard_operator_profiles WHERE operator_id=?',[operatorId]).first();
 const result={operator,profile,driverAccounts:await rows(db,"SELECT u.id,u.display_name FROM users u JOIN memberships m ON m.user_id=u.id WHERE m.operator_id=? AND m.role='driver'",[operatorId]),drivers:await rows(db,'SELECT * FROM standard_drivers WHERE operator_id=? ORDER BY full_name',[operatorId]),
  vehicles:await rows(db,'SELECT v.*,x.driver_id,x.brand,x.year,x.color,x.revision FROM vehicles v LEFT JOIN standard_vehicle_details x ON x.vehicle_id=v.id WHERE v.operator_id=? ORDER BY v.created_at',[operatorId]),
  documents:await rows(db,'SELECT id,kind,subject_type,subject_id,filename,content_type,size,expires_on,created_at FROM standard_operator_documents WHERE operator_id=? ORDER BY created_at DESC,id',[operatorId]),
  requiredDocuments:documentKinds,documented:!!await stmt(db,'SELECT 1 FROM standard_documented_operators WHERE operator_id=?',[operatorId]).first(),policy:'pilot-manual-review'};
 const missing=[],has=(kind,id)=>result.documents.some(d=>d.kind===kind&&d.subject_id===id&&(!d.expires_on||d.expires_on>=today()));
 if(!profile)missing.push('Completa el perfil básico.');
 for(const kind of documentKinds.filter(k=>k.subject==='operator'))if(!has(kind.kind,operatorId))missing.push('Falta '+kind.label.toLowerCase()+'.');
 if(!result.vehicles.length)missing.push('Registra al menos un vehículo.');
 if(!result.documented)for(const v of result.vehicles){
  if(!v.driver_id||!v.plate||!v.brand||!v.year||!v.color)missing.push('Completa la ficha de '+v.model+'.');
  const driver=result.drivers.find(d=>d.id===v.driver_id);
  if(!driver)missing.push('Asigna un conductor al vehículo '+v.model+'.');
  else{if(driver.license_expires_on<today())missing.push('Actualiza la licencia de '+driver.full_name+'.');if(!has('license',driver.id))missing.push('Falta licencia vigente de '+driver.full_name+'.');}
  for(const kind of documentKinds.filter(k=>k.subject==='vehicle'))if(!has(kind.kind,v.id))missing.push('Falta '+kind.label.toLowerCase()+' de '+v.model+'.');
 }
 return {...result,missing:[...new Set(missing)]};
}

export async function readDocument(request,env,user,id,c,platform=false){
 const row=await c.stmt(env.DB,'SELECT * FROM standard_operator_documents WHERE id=?',[id]).first();if(!row)throw c.failure('Documento no encontrado',404);
 if(platform){if(!await c.stmt(env.DB,"SELECT 1 FROM platform_admins WHERE user_id=? AND role='owner'",[user.id]).first())throw c.failure('Sin permiso para documentos privados',403);}
 else await c.owner(env.DB,user.id,row.operator_id);
 const object=await env.BUCKET.get(row.object_key);if(!object)throw c.failure('Archivo no disponible',404);
 return new Response(object.body,{headers:{'Content-Type':row.content_type,'Content-Disposition':'attachment; filename="documento.'+({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[row.content_type]||'bin')+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

async function uploadDocument(request,env,user,op,c){
 const url=new URL(request.url),kind=documentKinds.find(k=>k.kind===url.searchParams.get('kind'));
 const subject=url.searchParams.get('subjectId'),requestId=url.searchParams.get('requestId'),expires=url.searchParams.get('expiresOn')||null;
 if(!kind||!uuid(subject)||!uuid(requestId))throw c.failure('Elige el documento y su titular');
 if(expires)validDate(expires,c.failure);else if(kind.expiry)throw c.failure('Indica la fecha de vencimiento');
 const table={operator:'operators',vehicle:'vehicles',driver:'standard_drivers'}[kind.subject];
 if(!await c.stmt(env.DB,`SELECT 1 FROM ${table} WHERE id=?${kind.subject==='operator'?' AND id=?':' AND operator_id=?'}`,[subject,op]).first())throw c.failure('Documento de otra operadora',403);
 if(Number(request.headers.get('Content-Length'))>5242880)throw c.failure('El archivo admite hasta 5 MB',413);
 const reader=request.body?.getReader();if(!reader)throw c.failure('Elige un archivo');
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5242880){await reader.cancel();throw c.failure('El archivo admite hasta 5 MB',413);}chunks.push(value);}
 if(!size)throw c.failure('Elige un archivo');
 const data=new Uint8Array(size);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
 const type=request.headers.get('Content-Type')?.split(';')[0],head=new TextDecoder().decode(data.slice(0,12));
 const valid=type==='application/pdf'&&head.startsWith('%PDF-')||type==='image/png'&&data.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'||type==='image/jpeg'&&data[0]===255&&data[1]===216&&data[2]===255||type==='image/webp'&&head.startsWith('RIFF')&&new TextDecoder().decode(data.slice(8,12))==='WEBP';
 if(!valid)throw c.failure('Usa un PDF o una imagen JPG, PNG o WebP válida');
 const contentHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),v=>v.toString(16).padStart(2,'0')).join('');
 const fingerprint=await c.hash(JSON.stringify({kind:kind.kind,subject,expires,contentHash}));
 const prior=await c.stmt(env.DB,'SELECT id,fingerprint FROM standard_operator_documents WHERE operator_id=? AND request_id=?',[op,requestId]).first();
 if(prior){if(prior.fingerprint!==fingerprint)throw c.failure('Reintento con un archivo distinto',409);return{id:prior.id};}
 const id=crypto.randomUUID(),key='standard/documents/'+op+'/'+id,nonce=crypto.randomUUID();
 await env.BUCKET.put(key,data,{httpMetadata:{contentType:type}});
 try{
  await env.DB.batch([
   c.stmt(env.DB,`INSERT INTO standard_operator_documents(id,operator_id,kind,subject_type,subject_id,object_key,content_type,size,filename,content_hash,expires_on,uploaded_by,request_id,fingerprint) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[id,op,kind.kind,kind.subject,subject,key,type,data.length,(url.searchParams.get('filename')||'Documento').slice(0,120),contentHash,expires,user.id,requestId,fingerprint]),
   ...invalidate(env.DB,op,c,'1=1',[]),
   c.stmt(env.DB,"INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'standard_onboarding',?,'document_uploaded')",[nonce,user.id,op])]);
  return{id};
 }catch(error){
  await env.BUCKET.delete(key);
  const saved=await c.stmt(env.DB,'SELECT id,fingerprint FROM standard_operator_documents WHERE operator_id=? AND request_id=?',[op,requestId]).first();
  if(saved?.fingerprint===fingerprint)return{id:saved.id};
  if(saved)throw c.failure('Reintento con un archivo distinto',409);throw error;
 }
}

export async function reviewOperator(db,user,body,c){
 const op=body.operatorId,revision=c.integer(body.expectedRevision,1,10000000,'Revisión'),state=body.decision;
 if(!['approved','changes_requested','suspended'].includes(state))throw c.failure('Decisión no válida');
 const note=c.text(body.note,'Observación de revisión',1000),nonce=crypto.randomUUID();
 const prior=await previous(db,user,body,'onboarding_review',c);if(prior)return{id:op};
 const condition='EXISTS(SELECT 1 FROM standard_operator_profiles WHERE operator_id=? AND last_nonce=?)',args=[op,nonce];
 try{
  const result=await db.batch([
   c.stmt(db,`UPDATE standard_operator_profiles SET review_state=?,review_note=?,reviewed_by=?,reviewed_at=CURRENT_TIMESTAMP,revision=revision+1,last_nonce=?
    WHERE operator_id=? AND revision=? AND (?<>'approved' OR review_state='submitted')`,[state,note,user.id,nonce,op,revision,state]),
   c.stmt(db,`UPDATE operators SET status=? WHERE id=? AND ${condition}`,[state==='approved'?'approved':state==='suspended'?'suspended':'pending',op,...args]),
   c.stmt(db,`UPDATE vehicles SET status='active' WHERE operator_id=? AND id IN(SELECT id FROM standard_documented_vehicles) AND ?='approved' AND ${condition}`,[op,state,...args]),
   c.stmt(db,`INSERT INTO standard_commands(user_id,request_id,kind,fingerprint,entity_id) SELECT ?,?,'onboarding_review',?,? WHERE ${condition}`,[user.id,body.requestId,await c.hash(JSON.stringify(body)),op,...args]),
   c.stmt(db,`INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action,details_json) SELECT ?,?,'platform_operator_review',?,?,? WHERE ${condition}`,[nonce,user.id,op,state,JSON.stringify({note,revision}),...args])]);
  if(result[0].meta.changes!==1&&!await previous(db,user,body,'onboarding_review',c))throw c.failure('La solicitud cambió; vuelve a revisarla',409);
  return{id:op,state};
 }catch(error){if(error.message.includes('onboarding_incomplete'))throw c.failure('Faltan datos o documentos vigentes; revisa el expediente',409);throw error;}
}

export async function handleOnboarding(request,env,c){
 const {identity,owner,stmt,rows,failure,text,integer,hash}=c,db=env.DB,url=new URL(request.url),path=url.pathname,user=await identity(request,db);
 const document=path.match(/^\/api\/operator-documents\/([0-9a-f-]{36})$/i);
 if(document&&request.method==='GET')return readDocument(request,env,user,document[1],c);
 if(request.method==='GET'){
  if(path!=='/api/operator-onboarding')throw failure('Ruta no encontrada',404);
  const op=url.searchParams.get('operatorId');await owner(db,user.id,op);return onboardingData(db,op,c);
 }
 if(request.method!=='POST')throw failure('Método no permitido',405);
 if(path==='/api/operator-documents'){const op=url.searchParams.get('operatorId');await owner(db,user.id,op);return uploadDocument(request,env,user,op,c);}
 const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);
 let body;try{body=JSON.parse(raw);}catch{throw failure('Solicitud no válida');}
 if(!body||typeof body!=='object'||Array.isArray(body))throw failure('Solicitud no válida');
 const op=body.operatorId;await owner(db,user.id,op);
 const kind={'/api/operator-profile':'operator_profile','/api/operator-drivers':'operator_driver','/api/vehicle-details':'vehicle_details','/api/operator-submit':'onboarding_submit'}[path];
 if(!kind)throw failure('Ruta no encontrada',404);
 const prior=await previous(db,user,body,kind,c);if(prior)return{id:prior.entity_id};
 const nonce=crypto.randomUUID(),fingerprint=await hash(JSON.stringify(body));
 if(path==='/api/operator-profile'){
  if(!['individual','company'].includes(body.kind)||!cities.includes(body.baseCity))throw failure('Elige tipo de prestador y ciudad');
  const name=text(body.name,'Nombre comercial'),legal=text(body.legalName,'Nombre legal'),responsible=text(body.responsibleName,'Responsable'),contact=normalizeEmail(body.contactEmail,failure),number=phone(body.phone,failure),address=text(body.address,'Dirección',250);
  const tax=typeof body.taxId==='string'?body.taxId.trim():'';if(tax&&!/^\d{10}(\d{3})?$/.test(tax)||body.kind==='company'&&!/^\d{13}$/.test(tax))throw failure('Revisa el identificador tributario');
  const revision=integer(body.expectedRevision,0,10000000,'Revisión');
  return saveVersioned(db,user,body,kind,op,'standard_operator_profiles','operator_id',
   stmt(db,`INSERT INTO standard_operator_profiles(operator_id,kind,responsible_name,phone,contact_email,base_city,address,last_request,fingerprint,last_nonce)
    SELECT ?,?,?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM standard_operator_profiles WHERE operator_id=?)
    ON CONFLICT(operator_id) DO UPDATE SET kind=excluded.kind,responsible_name=excluded.responsible_name,phone=excluded.phone,contact_email=excluded.contact_email,base_city=excluded.base_city,address=excluded.address,
    revision=revision+1,review_state='draft',review_note='',last_request=excluded.last_request,fingerprint=excluded.fingerprint,last_nonce=excluded.last_nonce WHERE revision=?`,[op,body.kind,responsible,number,contact,body.baseCity,address,body.requestId,fingerprint,nonce,revision,op,revision]),nonce,
   (condition,args)=>[stmt(db,`UPDATE operators SET display_name=?,legal_name=?,tax_id=?,status=CASE WHEN data_scope='qa' THEN status ELSE 'pending' END WHERE id=? AND ${condition}`,[name,legal,tax||null,op,...args])],c);
 }
 if(path==='/api/operator-drivers'){
  const id=body.id||crypto.randomUUID(),revision=integer(body.expectedRevision??0,0,10000000,'Revisión');if(!uuid(id))throw failure('Conductor no válido');
  if(body.id&&!await stmt(db,'SELECT 1 FROM standard_drivers WHERE id=? AND operator_id=?',[id,op]).first())throw failure('Conductor de otra operadora',403);
  if(body.userId&&!await stmt(db,"SELECT 1 FROM memberships WHERE user_id=? AND operator_id=? AND role='driver'",[body.userId,op]).first())throw failure('Cuenta de conductor ajena o sin permiso',403);
  const values=[id,op,text(body.fullName,'Nombre del conductor'),phone(body.phone,failure),text(body.identityNumber,'Identificación',30),text(body.licenseNumber,'Licencia',30),text(body.licenseCategory,'Categoría de licencia',10),validDate(body.licenseExpiresOn,failure),body.userId||null,body.requestId,fingerprint,nonce];
  return saveVersioned(db,user,body,kind,id,'standard_drivers','id',stmt(db,`INSERT INTO standard_drivers(id,operator_id,full_name,phone,identity_number,license_number,license_category,license_expires_on,user_id,last_request,fingerprint,last_nonce)
   SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM standard_drivers WHERE id=?)
   ON CONFLICT(id) DO UPDATE SET full_name=excluded.full_name,phone=excluded.phone,identity_number=excluded.identity_number,license_number=excluded.license_number,license_category=excluded.license_category,license_expires_on=excluded.license_expires_on,user_id=excluded.user_id,
   revision=revision+1,last_request=excluded.last_request,fingerprint=excluded.fingerprint,last_nonce=excluded.last_nonce WHERE revision=?`,[...values,revision,id,revision]),nonce,(condition,args)=>invalidate(db,op,c,condition,args),c);
 }
 if(path==='/api/vehicle-details'){
  const vehicle=await stmt(db,'SELECT * FROM vehicles WHERE id=? AND operator_id=?',[body.vehicleId,op]).first();if(!vehicle)throw failure('Vehículo de otra operadora',403);
  if(!await stmt(db,'SELECT 1 FROM standard_drivers WHERE id=? AND operator_id=?',[body.driverId,op]).first())throw failure('Elige un conductor de tu operadora',403);
  const plate=String(body.plate||'').trim().toUpperCase().replaceAll(' ','');if(!/^[A-Z0-9-]{5,12}$/.test(plate))throw failure('Revisa la placa del vehículo');
  const capacity=integer(body.capacity,1,30,'Capacidad'),year=integer(body.year,1980,new Date().getUTCFullYear()+1,'Año'),revision=integer(body.expectedRevision,0,10000000,'Revisión');
  const occupied=await stmt(db,`SELECT MAX(s.seat_number) AS maximum FROM seat_claims s JOIN departures d ON d.id=s.departure_id WHERE d.vehicle_id=? AND d.status IN('published','boarding','running') AND s.status IN('held','confirmed')`,[vehicle.id]).first();
  if(occupied.maximum>capacity)throw failure('La capacidad no puede bajar de los asientos reservados',409);
  if(vehicle.plate&&vehicle.plate!==plate&&await stmt(db,"SELECT 1 FROM standard_booking_details m JOIN bookings b ON b.id=m.booking_id WHERE m.vehicle_id=? AND b.status='confirmed' AND b.service_at>?",[vehicle.id,new Date().toISOString()]).first())throw failure('El vehículo tiene reservas futuras; conserva su placa',409);
  return saveVersioned(db,user,body,kind,vehicle.id,'standard_vehicle_details','vehicle_id',stmt(db,`INSERT INTO standard_vehicle_details(vehicle_id,driver_id,brand,year,color,last_request,fingerprint,last_nonce)
   SELECT ?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM standard_vehicle_details WHERE vehicle_id=?)
   ON CONFLICT(vehicle_id) DO UPDATE SET driver_id=excluded.driver_id,brand=excluded.brand,year=excluded.year,color=excluded.color,revision=revision+1,last_request=excluded.last_request,fingerprint=excluded.fingerprint,last_nonce=excluded.last_nonce WHERE revision=?`,[vehicle.id,body.driverId,text(body.brand,'Marca'),year,text(body.color,'Color'),body.requestId,fingerprint,nonce,revision,vehicle.id,revision]),nonce,
   (condition,args)=>[stmt(db,`UPDATE vehicles SET plate=?,model=?,capacity=?,status=CASE WHEN (SELECT data_scope FROM operators WHERE id=?)='qa' THEN status ELSE 'pending' END WHERE id=? AND ${condition}`,[plate,text(body.model,'Modelo'),capacity,op,vehicle.id,...args]),...invalidate(db,op,c,condition,args)],c);
 }
 const revision=integer(body.expectedRevision,1,10000000,'Revisión');
 if(!await stmt(db,'SELECT 1 FROM standard_documented_operators WHERE operator_id=?',[op]).first())throw failure('Completa el perfil, conductor, vehículo y documentos vigentes antes de solicitar revisión',409);
 return saveVersioned(db,user,body,kind,op,'standard_operator_profiles','operator_id',stmt(db,"UPDATE standard_operator_profiles SET review_state='submitted',submitted_at=CURRENT_TIMESTAMP,revision=revision+1,last_nonce=?,last_request=?,fingerprint=? WHERE operator_id=? AND revision=? AND review_state IN('draft','changes_requested')",[nonce,body.requestId,fingerprint,op,revision]),nonce,()=>[],c);
}
