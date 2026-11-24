import {pageCursor,nextPage} from './standard-pagination.mjs';
const available = "v.capacity-(SELECT COUNT(*) FROM seat_claims sc WHERE sc.departure_id=d.id AND sc.status IN('held','confirmed'))";
export const operatorScope = (env,alias='o') => env.ALLOW_DEVELOPMENT_AUTH==='true' ? '1=1' : `${alias}.data_scope='alpha'`;
export const pilotOperator=(op='o')=>`EXISTS(SELECT 1 FROM pilot_operators po WHERE po.operator_id=${op}.id AND po.enabled=1)`;
export const pilotVehicle=(op='o',vehicle='v')=>`EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators po ON po.operator_id=pv.operator_id JOIN premium_assignments pa ON pa.vehicle_id=pv.vehicle_id JOIN memberships pm ON pm.operator_id=po.operator_id AND pm.user_id=pa.driver_user_id AND pm.role='driver' JOIN users pu ON pu.id=pm.user_id WHERE pv.vehicle_id=${vehicle}.id AND pv.operator_id=${op}.id AND po.enabled=1 AND pu.status='active' AND ${vehicle}.plate IS NOT NULL)`;
export const operatorReady = (alias='o') => `(${alias}.data_scope='qa' OR ${pilotOperator(alias)} OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators x ON x.operator_id=p.operator_id WHERE p.operator_id=${alias}.id AND p.review_state='approved'))`;
export const vehicleReady = (op='o',vehicle='v') => `(${op}.data_scope='qa' OR ${pilotVehicle(op,vehicle)} OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=${vehicle}.id))`;

export async function catalog(request,env,{rows,failure}) {
  const query=new URL(request.url).searchParams, where=[],args=[];
  const operator=query.get('operatorId');
  if(operator&&!/^[0-9a-f-]{36}$/i.test(operator))throw failure('Operadora no válida');
  if(operator){where.push('o.id=?');args.push(operator);}
  for(const name of ['origin','destination']){
    const value=query.get(name)?.trim().normalize('NFC');
    if(value){if(value.length>120)throw failure('Ciudad no válida');where.push(`LOWER(r.${name})=LOWER(?)`);args.push(value);}
  }
  const people=Number(query.get('passengers')||1);
  if(!Number.isInteger(people)||people<1||people>30)throw failure('Elige entre 1 y 30 pasajeros');
  const type=query.get('vehicleType');
  if(type&&type!=='any'){
    if(!['auto','suv','van','minivan'].includes(type))throw failure('Tipo de vehículo no válido');
    where.push('v.type=?');args.push(type);
  }
  const date=query.get('date');let start,end;
  if(date){
    const day=Date.parse(date+'T00:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==date)throw failure('Fecha no válida');
    start=new Date(day+5*3600000).toISOString();end=new Date(day+5*3600000+86400000).toISOString();
  }
  const paging=pageCursor(query.get('cursor'),failure),dep=paging.dep,route=paging.route;
  const dc=dep===false?{sql:' AND 0=1',args:[]}:dep?{sql:' AND (d.depart_at>? OR (d.depart_at=? AND d.id>?))',args:[dep.time,dep.time,dep.id]}:{sql:'',args:[]},rc=route===false?{sql:' AND 0=1',args:[]}:route?{sql:' AND r.id>?',args:[route.id]}:{sql:'',args:[]};
  const departureId=query.get('departureId'),offerId=query.get('offerId');if([departureId,offerId].some(x=>x&&!/^[0-9a-f-]{36}$/i.test(x)))throw failure('Viaje no válido');
  const common=`r.active=1 AND o.status='approved' AND v.status='active' AND ${operatorReady()} AND ${vehicleReady()} AND ${operatorScope(env)}${where.length?' AND '+where.join(' AND '):''}`;
  let departures=await rows(env.DB,`SELECT d.id,d.depart_at AS departAt,d.status,r.id AS offerId,r.operator_id AS operatorId,
    r.origin,r.destination,r.price_cents AS priceCents,o.display_name AS operatorName,r.pickup_point AS pickupPoint,r.dropoff_point AS dropoffPoint,
    v.id AS vehicleId,v.type AS vehicleType,v.model AS vehicle,v.capacity,${available} AS available,
    (SELECT json_group_array(seat_number) FROM seat_claims WHERE departure_id=d.id AND status IN('held','confirmed')) AS reservedSeatsJson
    FROM departures d JOIN route_offers r ON r.id=d.offer_id JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.id=d.vehicle_id
    WHERE ${common} AND d.status='published' AND d.depart_at>? AND ${available}>=?${date?' AND d.depart_at>=? AND d.depart_at<?':''}
    ${dc.sql}${departureId?' AND d.id=?':''} ORDER BY d.depart_at,d.id LIMIT 201`,[...args,new Date().toISOString(),people,...(date?[start,end]:[]),...dc.args,...(departureId?[departureId]:[])]);
  let routeOffers=await rows(env.DB,`SELECT r.id,r.operator_id AS operatorId,r.origin,r.destination,r.service_type AS serviceType,
    r.price_cents AS priceCents,o.display_name AS operatorName,r.pickup_point AS pickupPoint,r.dropoff_point AS dropoffPoint,v.id AS vehicleId,v.model AS vehicle,v.type AS vehicleType,v.capacity,rv.duration_minutes AS durationMinutes
    FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN standard_route_vehicles rv ON rv.offer_id=r.id JOIN vehicles v ON v.id=rv.vehicle_id
    WHERE ${common} AND v.capacity>=? ${rc.sql}${offerId?' AND r.id=?':''} ORDER BY r.id LIMIT 201`,[...args,people,...rc.args,...(offerId?[offerId]:[])]);
  const nextCursor=nextPage({dep:departures.length>200?{time:departures[199].departAt,id:departures[199].id}:false,route:routeOffers.length>200?{id:routeOffers[199].id}:false});departures=departures.slice(0,200);routeOffers=routeOffers.slice(0,200);
  const ids=[...new Set([...departures,...routeOffers].map(x=>x.operatorId))];
  const summaries=ids.length?await rows(env.DB,"SELECT operator_id,COUNT(*) AS count,AVG(rating) AS average FROM standard_reviews WHERE status='visible' AND operator_id IN(SELECT value FROM json_each(?)) GROUP BY operator_id",[JSON.stringify(ids)]):[];
  const reputations=new Map(summaries.map(r=>[r.operator_id,r]));
  // Branding is optional; only explicitly published media may appear publicly.
  const profiles=ids.length?await rows(env.DB,"SELECT operator_id,vehicle_photos_json FROM premium_profiles WHERE published=1 AND operator_id IN(SELECT value FROM json_each(?))",[JSON.stringify(ids)]):[];
  const photos=new Map(profiles.map(p=>[p.operator_id,JSON.parse(p.vehicle_photos_json||'{}')]));
  const decorate=item=>({...item,vehiclePhotoUrl:photos.get(item.operatorId)?.[item.vehicleId]?'/standard-api/api/miniapps/'+item.operatorId+'/media/'+photos.get(item.operatorId)[item.vehicleId]:null,profileUrl:'/miniapp/?operator='+item.operatorId,ratingCount:reputations.get(item.operatorId)?.count||0,ratingAverage:reputations.get(item.operatorId)?.average??null});
  return {nextCursor,departures:departures.map(({reservedSeatsJson,...d})=>decorate({...d,reservedSeats:JSON.parse(reservedSeatsJson||'[]')})),routeOffers:routeOffers.map(decorate),environment:'development',payments:'simulated',timeZone:'America/Guayaquil'};
}
