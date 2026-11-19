export function period(url,failure){
 const today=new Date().toISOString().slice(0,10),from=url.searchParams.get('from')||new Date(Date.now()-30*86400000).toISOString().slice(0,10),to=url.searchParams.get('to')||new Date(Date.now()+30*86400000).toISOString().slice(0,10);
 const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!valid(from)||!valid(to)||to<from||Date.parse(to)-Date.parse(from)>366*86400000)throw failure('Período no válido (máximo 366 días)');
 return{from,to,start:from+'T00:00:00.000Z',end:new Date(Date.parse(to)+86400000).toISOString(),today};
}
export const servicesSQL=`SELECT b.id,b.mode,b.status,b.amount_cents,b.passenger_count,COALESCE(b.service_at,d.depart_at) AS service_at,m.vehicle_id FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id LEFT JOIN departures d ON d.id=b.departure_id WHERE m.operator_id=?
 UNION ALL SELECT id,'private_custom',status,amount_cents,json_array_length(passengers_json),service_at,vehicle_id FROM standard_custom_bookings WHERE operator_id=?`;
export async function analytics(url,operatorId,db,c){
 const {rows,stmt,failure}=c,p=period(url,failure),args=[operatorId,operatorId,p.start,p.end];
 const modes=await rows(db,`SELECT mode,COUNT(*) AS bookings,SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,SUM(CASE WHEN status IN('confirmed','running','completed') THEN passenger_count ELSE 0 END) AS passengers FROM (${servicesSQL}) WHERE service_at>=? AND service_at<? GROUP BY mode`,args);
 const departures=await rows(db,`SELECT d.id,d.depart_at,d.status,r.origin,r.destination,v.model,v.capacity,(SELECT COUNT(*) FROM seat_claims s WHERE s.departure_id=d.id AND s.status IN('held','confirmed')) AS occupied FROM departures d JOIN route_offers r ON r.id=d.offer_id JOIN vehicles v ON v.id=d.vehicle_id WHERE r.operator_id=? AND d.depart_at>=? AND d.depart_at<? ORDER BY d.depart_at LIMIT 100`,[operatorId,p.start,p.end]);
 const calendar=await rows(db,`SELECT s.starts_at,s.ends_at,v.model,CASE WHEN maintenance_id IS NOT NULL THEN 'maintenance' WHEN departure_id IS NOT NULL THEN 'shared' WHEN booking_id IS NOT NULL THEN 'private_fixed' ELSE 'private_custom' END AS kind FROM standard_vehicle_slots s JOIN vehicles v ON v.id=s.vehicle_id WHERE v.operator_id=? AND s.active=1 AND s.starts_at<? AND s.ends_at>? ORDER BY s.starts_at LIMIT 100`,[operatorId,Date.parse(p.end),Date.parse(p.start)]);
 const tracks=await rows(db,'SELECT id,state_json,service_status FROM standard_tracking WHERE operator_id=?',[operatorId]);
 const alerts=tracks.flatMap(t=>JSON.parse(t.state_json).alerts.filter(a=>a.status!=='closed').map(a=>({id:a.id,status:a.status,tripId:t.id,simulated:true})));
 return{period:{from:p.from,to:p.to,timezone:'UTC'},modes,departures,calendar,alerts,history:await rows(db,'SELECT entity_kind,entity_id,event,at FROM standard_operational_events WHERE operator_id=? ORDER BY at DESC LIMIT 100',[operatorId]),generatedAt:new Date().toISOString(),limits:{departures:100,calendar:100,history:100},source:'D1',tracking:'simulator',payments:'simulated'};
}
