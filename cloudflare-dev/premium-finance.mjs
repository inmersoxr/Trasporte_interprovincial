import {period,servicesSQL} from './premium-business.mjs';
export async function finance(url,operatorId,db,c){const {stmt,rows,failure}=c,p=period(url,failure);
 const revenue=await stmt(db,`SELECT COALESCE(SUM(CASE WHEN status IN('confirmed','running','completed') THEN amount_cents ELSE 0 END),0) AS confirmedCents,COALESCE(SUM(CASE WHEN status='cancelled' THEN amount_cents ELSE 0 END),0) AS cancelledCents FROM (${servicesSQL}) WHERE service_at>=? AND service_at<?`,[operatorId,operatorId,p.start,p.end]).first();
 const costs=await stmt(db,"SELECT COALESCE(SUM(amount_cents),0) AS expenseCents FROM premium_expenses WHERE operator_id=? AND incurred_on>=? AND incurred_on<=? AND status='posted'",[operatorId,p.from,p.to]).first();
 return{period:{from:p.from,to:p.to,timezone:'UTC',basis:'service date / cost date'},currency:'USD',simulated:true,payments:'disabled',fiscal:false,...revenue,...costs,referenceResultCents:revenue.confirmedCents-costs.expenseCents,
 expenses:await rows(db,'SELECT * FROM premium_expenses WHERE operator_id=? AND incurred_on>=? AND incurred_on<=? ORDER BY incurred_on DESC,created_at DESC LIMIT 100',[operatorId,p.from,p.to]),limit:100};
}
export async function expense(path,body,user,operatorId,db,c){const {stmt,failure,command,text,integer}=c;
 if(path==='/api/premium/expenses'){
  if(!['fuel','maintenance','tolls','other'].includes(body.category)||typeof body.incurredOn!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(body.incurredOn)||!Number.isFinite(Date.parse(body.incurredOn))||new Date(body.incurredOn).toISOString().slice(0,10)!==body.incurredOn)throw failure('Categoría o fecha no válida');
  const vehicle=body.vehicleId||null;if(vehicle&&!await stmt(db,'SELECT 1 FROM vehicles WHERE id=? AND operator_id=?',[vehicle,operatorId]).first())throw failure('Vehículo ajeno',403);
  const id=crypto.randomUUID();return{id:await command(db,user,body,'premium_expense',[stmt(db,'INSERT INTO premium_expenses(id,operator_id,vehicle_id,category,description,amount_cents,incurred_on,created_by) VALUES(?,?,?,?,?,?,?,?)',[id,operatorId,vehicle,body.category,text(body.description,'Descripción',200),integer(body.amountCents,1,100000000,'Monto'),body.incurredOn,user.id])],id),fiscal:false};
 }
 const match=path.match(/^\/api\/premium\/expenses\/([0-9a-f-]{36})\/void$/i);if(!match)return null;
 if(!await stmt(db,'SELECT 1 FROM premium_expenses WHERE id=? AND operator_id=?',[match[1],operatorId]).first())throw failure('Registro ajeno o inexistente',403);
 if(await stmt(db,"SELECT 1 FROM premium_business_documents WHERE expense_id=? AND operator_id=? AND status='open'",[match[1],operatorId]).first())throw failure('Anula primero el documento asociado a este gasto',409);
 const reason=text(body.reason,'Motivo de anulación',200);
 await db.batch([stmt(db,"UPDATE premium_expenses SET status='void',void_reason=?,voided_at=CURRENT_TIMESTAMP WHERE id=? AND status='posted'",[reason,match[1]]),stmt(db,"INSERT OR IGNORE INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES(?,?,'premium_expense',?,'void')",[match[1]+':void',user.id,match[1]])]);return{id:match[1],status:'void'};
}
export async function document(id,operatorId,db,c){const {stmt,failure}=c;const row=await stmt(db,'SELECT e.*,o.display_name AS operator_name FROM premium_expenses e JOIN operators o ON o.id=e.operator_id WHERE e.id=? AND e.operator_id=?',[id,operatorId]).first();if(!row)throw failure('Comprobante ajeno o inexistente',403);return{document:row,title:'Comprobante interno de desarrollo',fiscal:false,payments:'disabled',notice:'No es factura fiscal, recibo bancario ni evidencia de un pago real.'};}
