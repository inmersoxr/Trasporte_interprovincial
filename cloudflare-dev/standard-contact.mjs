export function contactPhone(body,env,failure){
 if(env.ALLOW_DEVELOPMENT_AUTH==='true'&&!body.contactPhone)return '';
 if(typeof body.contactPhone!=='string'||!/^\+?[0-9 ()-]{7,24}$/.test(body.contactPhone.trim())||(body.contactPhone.match(/\d/g)||[]).length<7||(body.contactPhone.match(/\d/g)||[]).length>15)throw failure('Escribe un teléfono de contacto para esta reserva');
 return body.contactPhone.trim();
}
export async function accountEmail(db,userId,stmt){return (await stmt(db,`SELECT COALESCE((SELECT email FROM auth_email_accounts WHERE user_id=?),(SELECT email FROM auth_identities WHERE user_id=? AND provider='google')) AS email`,[userId,userId]).first())?.email||null;}
export function bookingContacts(db,user,body,env,bookingId,offerId,vehicleId,c){
 const phone=contactPhone(body,env,c.failure);if(!phone)return [];
 const operations=[c.stmt(db,`INSERT INTO standard_booking_contacts(booking_id,passenger_phone,passenger_email,pickup_point,dropoff_point,vehicle_plate,vehicle_model,operator_name)
  SELECT ?,?,COALESCE((SELECT email FROM auth_email_accounts WHERE user_id=?),(SELECT email FROM auth_identities WHERE user_id=? AND provider='google')),
  r.pickup_point,r.dropoff_point,v.plate,v.model,o.display_name FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.operator_id=o.id
  WHERE r.id=? AND v.id=?`,[bookingId,phone,user.id,user.id,offerId,vehicleId])];
 if(body.saveContact===true)operations.push(c.stmt(db,`INSERT INTO standard_passenger_profiles(user_id,phone) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET phone=excluded.phone,updated_at=CURRENT_TIMESTAMP`,[user.id,phone]));
 return operations;
}
