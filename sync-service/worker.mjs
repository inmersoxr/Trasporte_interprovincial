import {handleInstitution} from './institution.mjs';
import {handleBookings,handleLinkedTrip} from './bookings.mjs';
import {prepareRoad, tripSnapshot, applyTripCommand, ROUTE_ID} from '../shared/trip-core.mjs';
import route from '../shared/route.json' with {type:'json'};
const road=prepareRoad(route);
const FRONTEND='https://inmersoxr.github.io';
// Demo trips do not expire; the stored state remains available across sessions.
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
function originAllowed(origin,url){return !origin||origin===FRONTEND||origin===new URL(url).origin||/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin);}
function response(request,data,status=200){const origin=request.headers.get('Origin');return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':origin||FRONTEND,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600','Vary':'Origin','X-Content-Type-Options':'nosniff'}});}
async function permissions(request,trip){const raw=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';if(!raw)return {control:false,operations:false};const hash=await digest(raw);return {control:hash===trip.controlHash,operations:hash===trip.opsHash||hash===trip.controlHash};}
function publicView(trip,permissions){const {controlHash,opsHash,...visible}=trip;visible.expiresAt=null;const now=Date.now();return {trip:visible,snapshot:tripSnapshot(trip,road,now),permissions,serverNow:now};}
export default {async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(!originAllowed(request.headers.get('Origin'),request.url))return response(request,{error:'Origen no permitido.'},403);
  if(request.method==='OPTIONS')return response(request,{ok:true});
  if(path==='/health'||path==='/')return response(request,{service:'RutasEC Demo Sync',ok:!!env.BUCKET,source:'simulated',route:ROUTE_ID,pollIntervalMs:1800,expiresAfterHours:null});
  if(!env.BUCKET)return response(request,{error:'El almacenamiento compartido no está disponible.'},503);
  try {
    const ctx={digest,snapshot:trip=>tripSnapshot(trip,road,Date.now()),command:(trip,cmd,now)=>applyTripCommand(trip,cmd,road,now),totalMeters:road.totalMeters,publicView};
    const institution=await handleInstitution(request,env,ctx);if(institution)return response(request,institution.data,institution.status||200);
    const market=await handleBookings(request,env,ctx);if(market)return response(request,market.data,market.status||200);
    if(path==='/api/trips'&&request.method==='POST'){
      const body=await request.json();if(body.routeId!==ROUTE_ID)return response(request,{error:'Ruta no admitida.'},400);
      const id=crypto.randomUUID(),controllerToken=token(),operationsToken=token(),now=Date.now();
      const trip={id,routeId:ROUTE_ID,simulated:true,source:'simulator',status:'ready',anchorMeters:0,anchorAt:now,multiplier:1,revision:1,createdAt:now,updatedAt:now,expiresAt:null,controlHash:await digest(controllerToken),opsHash:await digest(operationsToken),alerts:[],events:[],driver:{name:'Daniel Andrade · Demo',operator:'Transporte Andecar · Demo',vehicle:'Mercedes Sprinter · 12 plazas',plate:'DEMO-001'}};
      await env.BUCKET.put('trips/'+id+'.json',JSON.stringify(trip),{onlyIf:new Headers({'If-None-Match':'*'}),httpMetadata:{contentType:'application/json'}});
      return response(request,{...publicView(trip,{control:true,operations:true}),controllerToken,operationsToken},201);
    }
    const match=path.match(/^\/api\/trips\/([0-9a-f-]{36})(\/commands)?$/);
    if(!match)return response(request,{error:'Recurso no encontrado.'},404);
    const key='trips/'+match[1]+'.json',object=await env.BUCKET.get(key);
    if(!object){const linked=await handleLinkedTrip(request,env,match[1],ctx);if(linked)return response(request,linked.data,linked.status||200);return response(request,{error:'Viaje no encontrado. Revisa el enlace.'},404);}
    const trip=await object.json();// Persistent mockup: historical demo trips remain accessible; no 24-hour expiration.
    const access=await permissions(request,trip);
    if(request.method==='GET'&&!match[2])return response(request,publicView(trip,access));
    if(request.method!=='POST'||!match[2])return response(request,{error:'Método no permitido.'},405);
    if(Number(request.headers.get('Content-Length')||0)>4096)return response(request,{error:'Solicitud demasiado grande.'},413);
    const command=await request.json();
    if(!access.control&&!(access.operations&&command.action==='attend'))return response(request,{error:'Este enlace solo permite observar el viaje.'},403);
    if(typeof command.requestId!=='string'||!/^[0-9a-f-]{36}$/.test(command.requestId))return response(request,{error:'Identificador de evento no válido.'},400);
    if(trip.events.some(event=>event.id===command.requestId))return response(request,publicView(trip,access));
    if(command.expectedRevision!==trip.revision)return response(request,{error:'El viaje cambió en otro dispositivo. Actualizando…',revision:trip.revision},409);
    const safe={action:command.action,multiplier:command.multiplier,alertId:command.action==='sos'?crypto.randomUUID():command.alertId,requestId:command.requestId};
    let next;try{next=applyTripCommand(trip,safe,road,Date.now());}catch(error){return response(request,{error:error.message},400);}
    if(next===trip)return response(request,publicView(trip,access));
    const saved=await env.BUCKET.put(key,JSON.stringify(next),{onlyIf:{etagMatches:object.etag},httpMetadata:{contentType:'application/json'}});
    if(!saved)return response(request,{error:'Otro dispositivo actualizó el viaje. Reintenta.'},409);
    return response(request,publicView(next,access));
  } catch(error){return response(request,{error:error instanceof SyntaxError?'Solicitud JSON no válida.':error.status?error.message:'No se pudo sincronizar el viaje. Reintenta.'},error instanceof SyntaxError?400:error.status||503);}
}};
