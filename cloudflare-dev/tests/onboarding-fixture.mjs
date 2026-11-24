// Trusted local fixtures for tests whose subject is catalog/checkout, not review.
// The separate onboarding suite exercises the real APIs and R2 uploads.
export async function seedReviewedOperator(db,operatorId,vehicleId){
 const owner=await db.prepare("SELECT user_id FROM memberships WHERE operator_id=? AND role='owner'").bind(operatorId).first();
 const driver=crypto.randomUUID(),token=crypto.randomUUID(),plate='TST'+crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase();
 await db.batch([
  db.prepare(`INSERT OR IGNORE INTO standard_operator_profiles(operator_id,kind,responsible_name,phone,contact_email,base_city,address,last_request,fingerprint,last_nonce) VALUES(?,'individual','Persona de prueba','+593990000000','fixture@example.com','Cuenca','Dirección de prueba',?,'fixture',?)`).bind(operatorId,token,token),
  db.prepare(`INSERT INTO standard_drivers(id,operator_id,full_name,phone,identity_number,license_number,license_category,license_expires_on,last_request,fingerprint,last_nonce) VALUES(?,?,'Conductor de prueba','+593990000000',?,?,'AB','2099-12-31',?,'fixture',?)`).bind(driver,operatorId,driver,driver,token,token),
  db.prepare(`INSERT INTO standard_vehicle_details(vehicle_id,driver_id,brand,year,color,last_request,fingerprint,last_nonce) VALUES(?,?,'Marca de prueba',2024,'Blanco',?,'fixture',?)`).bind(vehicleId,driver,token,token),
  db.prepare("UPDATE vehicles SET plate=?,status='active' WHERE id=?").bind(plate,vehicleId)
 ]);
 for(const [kind,subject,subjectId]of [['identity','operator',operatorId],['authorization','operator',operatorId],['license','driver',driver],['registration','vehicle',vehicleId],['insurance','vehicle',vehicleId],['inspection','vehicle',vehicleId]]){
  const id=crypto.randomUUID();await db.prepare(`INSERT INTO standard_operator_documents(id,operator_id,kind,subject_type,subject_id,object_key,content_type,size,filename,content_hash,expires_on,uploaded_by,request_id,fingerprint) VALUES(?,?,?,?,?,?,'application/pdf',10,'Fixture local.pdf','fixture','2099-12-31',?,?,'fixture')`).bind(id,operatorId,kind,subject,subjectId,'local-fixture/'+id,owner.user_id,crypto.randomUUID()).run();
 }
 await db.batch([db.prepare("UPDATE standard_operator_profiles SET review_state='approved' WHERE operator_id=?").bind(operatorId),db.prepare("UPDATE operators SET status='approved',data_scope='alpha' WHERE id=?").bind(operatorId)]);
 return {driverId:driver};
}
