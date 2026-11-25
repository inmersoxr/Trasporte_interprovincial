import {tripSegment} from './standard-route-stops.mjs';
import {validVehicle,generateLayout} from './standard/transport.mjs';
import {pageCursor,nextPage} from './standard-pagination.mjs';
const available = "v.capacity-(SELECT COUNT(*) FROM seat_claims sc WHERE sc.departure_id=d.id AND sc.status IN('held','confirmed'))";
export const operatorScope = (env,alias='o') => env.ALLOW_DEVELOPMENT_AUTH==='true' ? '1=1' : `${alias}.data_scope='alpha'`;
export const pilotOperator=(op='o')=>`EXISTS(SELECT 1 FROM pilot_operators po WHERE po.operator_id=${op}.id AND po.enabled=1)`;
export const pilotVehicle=(op='o',vehicle='v')=>`EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators po ON po.operator_id=pv.operator_id WHERE pv.vehicle_id=${vehicle}.id AND pv.operator_id=${op}.id AND po.enabled=1)`;
export const operatorReady = (alias='o') => `(${alias}.data_scope='qa' OR ${pilotOperator(alias)} OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators x ON x.operator_id=p.operator_id WHERE p.operator_id=${alias}.id AND p.review_state='approved'))`;
export const vehicleReady = (op='o',vehicle='v') => `(${op}.data_scope='qa' OR ${pilotVehicle(op,vehicle)} OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=${vehicle}.id))`;

export async function catalog(request,env,{rows,failure}) {
  const query=new URL(request.url).searchParams, where=[],args=[];
  const operator=query.get('operatorId');
  if(operator&&!/^[0-9a-f-]{36}$/i.test(operator))throw failure('Operadora no válida');
  if(operator){where.push('o.id=?');args.push(operator);}
  for(const name of ['origin','destination']){
    const value=query.get(name)?.trim().normalize('NFC');
    if(value){if(value.length>120)throw failure('Ciudad no válida');where.push(`(LOWER(r.${name})=LOWER(?) OR EXISTS(SELECT 1 FROM standard_route_stops st WHERE st.offer_id=r.id AND LOWER(st.city)=LOWER(?)))`);args.push(value,value);}
  }
  const maxCapacity=(await env.DB.prepare('SELECT max_capacity FROM standard_transport_settings WHERE id=1').first()).max_capacity;
  const people=Number(query.get('passengers')||1);
  if(!Number.isInteger(people)||people<1||people>maxCapacity)throw failure('Elige entre 1 y '+maxCapacity+' pasajeros');
  const type=query.get('vehicleType');
  if(type&&type!=='any'){
    if(!validVehicle(type))throw failure('Tipo de vehículo no válido');
    where.push('COALESCE(v.vehicle_class,v.type)=?');args.push(type);
  }
  const transport=query.get('transportType');if(transport&&transport!=='any'){if(!['public','private','commercial'].includes(transport))throw failure('Tipo de transporte no válido');where.push('v.transport_type=?');args.push(transport);}
  const mode=query.get('serviceMode');if(mode&&mode!=='any'&&!['shared','private_fixed','custom'].includes(mode))throw failure('Modalidad no válida');
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
    v.id AS vehicleId,COALESCE(v.vehicle_class,v.type) AS vehicleType,v.transport_type AS transportType,v.model AS vehicle,COALESCE(dl.capacity,v.capacity) AS capacity,dl.layout_json AS seatLayoutJson,${available} AS available,
    (SELECT json_group_array(json_object('number',seat_number,'status',status,'start',start_stop,'end',end_stop)) FROM seat_claims WHERE departure_id=d.id AND status IN('held','confirmed')) AS reservedSeatsJson
    FROM departures d JOIN route_offers r ON r.id=d.offer_id JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.id=d.vehicle_id LEFT JOIN standard_departure_layouts dl ON dl.departure_id=d.id
    WHERE ${common} AND d.status='published' AND d.depart_at>?${date?' AND d.depart_at>=? AND d.depart_at<?':''}
    ${dc.sql}${departureId?' AND d.id=?':''} ORDER BY d.depart_at,d.id LIMIT 201`,[...args,new Date().toISOString(),...(date?[start,end]:[]),...dc.args,...(departureId?[departureId]:[])]);
  let routeOffers=await rows(env.DB,`SELECT r.id,r.operator_id AS operatorId,r.origin,r.destination,r.service_type AS serviceType,
    r.price_cents AS priceCents,o.display_name AS operatorName,r.pickup_point AS pickupPoint,r.dropoff_point AS dropoffPoint,v.id AS vehicleId,v.model AS vehicle,COALESCE(v.vehicle_class,v.type) AS vehicleType,v.transport_type AS transportType,v.capacity,rv.duration_minutes AS durationMinutes
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
  const stops=departures.length?await rows(env.DB,'SELECT * FROM standard_departure_stops WHERE departure_id IN(SELECT value FROM json_each(?)) ORDER BY position',[JSON.stringify(departures.map(d=>d.id))]):[];
  const metadata=departures.length?await rows(env.DB,'SELECT * FROM standard_route_transport WHERE offer_id IN(SELECT value FROM json_each(?))',[JSON.stringify(departures.map(d=>d.offerId))]):[];
  const result=[];for(const {reservedSeatsJson,seatLayoutJson,...d}of departures){const route=stops.filter(s=>s.departure_id===d.id),start=query.get('boardingStop')??(query.get('origin')?route.find(s=>s.city.toLowerCase()===query.get('origin').toLowerCase())?.position:undefined),end=query.get('alightingStop')??(query.get('destination')?route.find(s=>s.city.toLowerCase()===query.get('destination').toLowerCase())?.position:undefined);let segment;try{segment=tripSegment(route,start,end,d.priceCents,failure);}catch{continue;}const claims=JSON.parse(reservedSeatsJson||'[]').filter(c=>c.start<segment.end&&c.end>segment.start),layout=seatLayoutJson?JSON.parse(seatLayoutJson):generateLayout(d.capacity),blocked=layout.seats.filter(s=>s.blocked).map(s=>s.number),reserved=[...new Set(claims.map(c=>c.number))],unavailable=new Set([...blocked,...reserved]);if(d.capacity-unavailable.size<people)continue;const meta=metadata.find(m=>m.offer_id===d.offerId);result.push(decorate({...d,tripDepartAt:d.departAt,departAt:new Date(Date.parse(d.departAt)+segment.offset*60000).toISOString(),priceCents:segment.price,origin:segment.origin||d.origin,destination:segment.destination||d.destination,pickupPoint:segment.pickup||d.pickupPoint,dropoffPoint:segment.dropoff||d.dropoffPoint,boardingStop:route.length?segment.start:null,alightingStop:route.length?segment.end:null,stops:route,serviceType:'shared',features:meta?.features||'',frequencyReference:meta?.frequency_reference||'',seatLayout:layout,blockedSeats:blocked,reservedSeats:reserved,seatStates:Object.fromEntries(layout.seats.map(s=>[s.number,s.blocked?'blocked':claims.some(c=>c.number===s.number&&c.status==='confirmed')?'sold':claims.some(c=>c.number===s.number)?'reserved':'available'])),available:d.capacity-unavailable.size}));}
  return {maxCapacity,nextCursor,departures:mode&&mode!=='any'&&mode!=='shared'?[]:result,routeOffers:mode&&mode!=='any'&&mode!=='private_fixed'?[]:routeOffers.map(decorate),environment:'development',payments:'simulated',timeZone:'America/Guayaquil'};
}
