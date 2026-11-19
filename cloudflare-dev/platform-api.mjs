import {handleReviews} from './standard-reviews.mjs';
import {onboardingData,reviewOperator,readDocument} from './standard-onboarding.mjs';
import {owner} from './standard-api.mjs';
export function date(value,label,failure){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw failure(label+' no válida');return value;}
const uuid=value=>typeof value==='string'&&/^[0-9a-f-]{36}$/i.test(value);
const balanceSQL=`SELECT i.*,COALESCE((SELECT SUM(p.amount_cents) FROM platform_payments p WHERE p.invoice_id=i.id AND p.status='recorded'),0) AS paid_cents FROM platform_invoices i`;
export async function handlePlatform(request,env,c){const {identity,stmt,rows,failure,integer,text,command,hash}=c,db=env.DB,url=new URL(request.url),path=url.pathname,user=await identity(request,db);
 if(path.startsWith('/api/platform/reviews'))return handleReviews(request,env,c);
 const admin=await stmt(db,'SELECT role FROM platform_admins WHERE user_id=?',[user.id]).first();if(!admin)throw failure('Acceso exclusivo para administración de RutasEC',403);
 const document=path.match(/^\/api\/platform\/documents\/([0-9a-f-]{36})$/i);
 if(document&&request.method==='GET')return readDocument(request,env,user,document[1],{...c,owner},true);
 if(path==='/api/platform/me'&&request.method==='GET')return{userId:user.id,role:admin.role,environment:'development',payments:'manual-records-only'};
 if(path==='/api/platform/operators'&&request.method==='GET'){
  const q=url.searchParams.get('q')||'',cursor=url.searchParams.get('cursor')||'';if(q.length>120||cursor&&!uuid(cursor))throw failure('Filtro no válido');
  const operators=await rows(db,`SELECT o.id,o.display_name,o.status,o.created_at,s.plan,s.status AS subscription_status,s.fee_cents,s.next_due_on,
   COALESCE(p.active,0) AS premium_dev_enabled,(SELECT COUNT(*) FROM vehicles v WHERE v.operator_id=o.id) AS vehicles
   FROM operators o LEFT JOIN platform_subscriptions s ON s.operator_id=o.id LEFT JOIN premium_tenants p ON p.operator_id=o.id
   WHERE o.id>? AND instr(lower(o.display_name),lower(?))>0 ORDER BY o.id LIMIT 51`,[cursor,q]);
  const totals=await stmt(db,`SELECT (SELECT COUNT(*) FROM operators) AS operators,(SELECT COUNT(*) FROM premium_tenants WHERE active=1) AS premiumDev,
   (SELECT COUNT(*) FROM platform_subscriptions WHERE status IN('trial','active') AND next_due_on<date('now')) AS overdueSchedules,
   (SELECT COUNT(*) FROM platform_subscriptions WHERE status IN('trial','active') AND next_due_on BETWEEN date('now') AND date('now','+7 days')) AS upcomingSchedules,
   (SELECT COALESCE(SUM(amount_cents-paid_cents),0) FROM (${balanceSQL}) WHERE status='open' AND due_on<date('now')) AS overdueCents`).first();
  return{operators:operators.slice(0,50),nextCursor:operators.length>50?operators[49].id:null,totals,currency:'USD',referenceOnly:true};
 }
 if(path==='/api/platform/audit'&&request.method==='GET')return{events:await rows(db,"SELECT a.id,a.actor_user_id,a.entity_type,a.entity_id,a.action,a.created_at,COALESCE(o.display_name,oi.display_name,op.display_name,ro.display_name) AS operator_name FROM audit_events a LEFT JOIN operators o ON o.id=a.entity_id LEFT JOIN platform_invoices i ON i.id=a.entity_id LEFT JOIN operators oi ON oi.id=i.operator_id LEFT JOIN platform_payments p ON p.id=a.entity_id LEFT JOIN platform_invoices pi ON pi.id=p.invoice_id LEFT JOIN operators op ON op.id=pi.operator_id LEFT JOIN standard_reviews rv ON rv.id=a.entity_id LEFT JOIN operators ro ON ro.id=rv.operator_id WHERE (a.entity_type LIKE 'platform_%' OR a.entity_type='operator_review') ORDER BY a.created_at DESC,a.id DESC LIMIT 100"),limit:100};
 const detail=path.match(/^\/api\/platform\/operators\/([0-9a-f-]{36})$/i);
 if(detail&&request.method==='GET'){
  const operator=await stmt(db,'SELECT id,display_name,legal_name,status,created_at FROM operators WHERE id=?',[detail[1]]).first();if(!operator)throw failure('Operadora no encontrada',404);
  return{operator,onboarding:admin.role==='owner'?await onboardingData(db,operator.id,c):null,subscription:await stmt(db,'SELECT * FROM platform_subscriptions WHERE operator_id=?',[operator.id]).first(),invoices:await rows(db,balanceSQL+' WHERE i.operator_id=? ORDER BY i.due_on DESC,i.id DESC LIMIT 100',[operator.id]),payments:await rows(db,'SELECT p.* FROM platform_payments p JOIN platform_invoices i ON i.id=p.invoice_id WHERE i.operator_id=? ORDER BY p.created_at DESC,p.id DESC LIMIT 200',[operator.id]),limits:{invoices:100,payments:200},fiscal:false};
 }
 if(request.method!=='POST')throw failure('Ruta no encontrada',404);if(admin.role!=='owner')throw failure('Tu acceso es de consulta',403);
 const raw=await request.text();if(raw.length>16384)throw failure('Solicitud demasiado grande',413);let body;try{body=JSON.parse(raw);}catch{throw failure('JSON no válido');}if(!body||typeof body!=='object'||Array.isArray(body)||!uuid(body.requestId))throw failure('Solicitud o requestId no válido');
 const operatorId=body.operatorId;if(!uuid(operatorId)||!await stmt(db,'SELECT 1 FROM operators WHERE id=?',[operatorId]).first())throw failure('Operadora no encontrada',404);
 if(path==='/api/platform/operator-review')return reviewOperator(db,user,body,c);
 if(path==='/api/platform/subscriptions'){
  if(!['standard','premium'].includes(body.plan)||!['trial','active','paused','cancelled'].includes(body.status))throw failure('Plan o estado no válido');
  const fee=body.feeCents==null?null:integer(body.feeCents,0,100000000,'Cuota'),due=body.nextDueOn?date(body.nextDueOn,'Vencimiento',failure):null,cycle=integer(body.cycleMonths,1,12,'Ciclo'),revision=integer(body.expectedRevision,0,100000000,'Revisión');
  if(typeof body.notes!=='string'||body.notes.length>1000)throw failure('Notas no válidas');const fingerprint=await hash(JSON.stringify(body)),prior=await stmt(db,'SELECT * FROM platform_subscriptions WHERE operator_id=?',[operatorId]).first();
  if(prior?.last_request===body.requestId){if(prior.fingerprint!==fingerprint)throw failure('Reintento con contenido distinto',409);return{revision:prior.revision};}
  const result=await db.batch([stmt(db,`INSERT INTO platform_subscriptions(operator_id,plan,status,fee_cents,next_due_on,cycle_months,notes,revision,last_request,fingerprint)
   SELECT ?,?,?,?,?,?,?,1,?,? WHERE (?=0 OR EXISTS(SELECT 1 FROM platform_subscriptions WHERE operator_id=?))
   ON CONFLICT(operator_id) DO UPDATE SET plan=excluded.plan,status=excluded.status,fee_cents=excluded.fee_cents,next_due_on=excluded.next_due_on,cycle_months=excluded.cycle_months,notes=excluded.notes,revision=platform_subscriptions.revision+1,last_request=excluded.last_request,fingerprint=excluded.fingerprint,updated_at=CURRENT_TIMESTAMP WHERE platform_subscriptions.revision=?`,[operatorId,body.plan,body.status,fee,due,cycle,body.notes.trim(),body.requestId,fingerprint,revision,operatorId,revision]),stmt(db,"INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action) SELECT ?,?,'platform_subscription',operator_id,'configured' FROM platform_subscriptions WHERE operator_id=? AND last_request=?",[operatorId+':'+body.requestId,user.id,operatorId,body.requestId])]);
  if(result[0].meta.changes!==1)throw failure('La suscripción cambió; actualiza antes de guardar',409);return{revision:revision+1,referenceOnly:true};
 }
 if(path==='/api/platform/invoices'){
  const start=date(body.periodStart,'Inicio',failure),end=date(body.periodEnd,'Fin',failure),due=date(body.dueOn,'Vencimiento',failure);if(end<start)throw failure('Período no válido');
  if(!await stmt(db,'SELECT 1 FROM platform_subscriptions WHERE operator_id=?',[operatorId]).first())throw failure('Registra primero el plan de referencia');
  const id=crypto.randomUUID();try{return{id:await command(db,user,body,'platform_invoice',[stmt(db,'INSERT INTO platform_invoices(id,operator_id,period_start,period_end,due_on,amount_cents,created_by) VALUES(?,?,?,?,?,?,?)',[id,operatorId,start,end,due,integer(body.amountCents,1,100000000,'Importe'),user.id])],id),fiscal:false};}catch(e){if(String(e.message).includes('UNIQUE constraint failed: platform_invoices'))throw failure('Ya existe una cuota para ese período',409);throw e;}
 }
 if(path==='/api/platform/payments'){
  if(!uuid(body.invoiceId)||!await stmt(db,'SELECT 1 FROM platform_invoices WHERE id=? AND operator_id=?',[body.invoiceId,operatorId]).first())throw failure('Cuota ajena o inexistente',403);
  const received=date(body.receivedOn,'Recepción',failure);if(received>new Date().toISOString().slice(0,10))throw failure('La fecha de recepción no puede ser futura');const id=crypto.randomUUID();
  try{return{id:await command(db,user,body,'platform_payment',[stmt(db,'INSERT INTO platform_payments(id,invoice_id,amount_cents,received_on,reference,created_by) VALUES(?,?,?,?,?,?)',[id,body.invoiceId,integer(body.amountCents,1,100000000,'Importe'),received,text(body.reference,'Referencia',120),user.id])],id),verifiedByBank:false};}catch(e){if(/platform_payment_conflict|UNIQUE constraint failed: platform_payments/.test(String(e.message)))throw failure('El importe supera el saldo, la cuota está anulada o la referencia ya existe',409);throw e;}
 }
 const closure=path.match(/^\/api\/platform\/(invoices|payments)\/([0-9a-f-]{36})\/void$/i);
 if(closure){const table=closure[1]==='invoices'?'platform_invoices':'platform_payments',id=closure[2],reason=text(body.reason,'Motivo',200);
  const own=closure[1]==='invoices'?'SELECT 1 FROM platform_invoices WHERE id=? AND operator_id=?':'SELECT 1 FROM platform_payments p JOIN platform_invoices i ON i.id=p.invoice_id WHERE p.id=? AND i.operator_id=?';if(!await stmt(db,own,[id,operatorId]).first())throw failure('Registro ajeno o inexistente',403);
  try{await db.batch([stmt(db,`UPDATE ${table} SET status='void',void_reason=? WHERE id=? AND status<>'void'`,[reason,id]),stmt(db,"INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,?,?,'void')",[id+':void',user.id,'platform_'+closure[1],id])]);}catch(e){if(String(e.message).includes('platform_invoice_has_payments'))throw failure('Anula primero los pagos registrados de esta cuota',409);throw e;}return{id,status:'void'};
 }
 throw failure('Ruta no encontrada',404);
}
