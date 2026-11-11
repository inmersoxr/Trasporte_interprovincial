// Public mockup inventory: never use these demo identities for a real operator.
export const DEMO_FLEET=[
 {id:'10000000-0000-4000-8000-000000000001',name:'Transporte Andecar · Demo',vehicleType:'van',vehicle:'Furgoneta ejecutiva · Mercedes Sprinter',capacity:12,priceCents:1500,time:'06:00'},
 {id:'10000000-0000-4000-8000-000000000002',name:'Sur Express · Demo',vehicleType:'suv',vehicle:'SUV confortable · Kia Sorento',capacity:4,priceCents:2200,time:'08:30'},
 {id:'10000000-0000-4000-8000-000000000003',name:'ViajaEC · Demo',vehicleType:'minivan',vehicle:'Furgoneta interprovincial · Hyundai H1',capacity:15,priceCents:1600,time:'09:00'},
 {id:'10000000-0000-4000-8000-000000000004',name:'Ruta Central · Demo',vehicleType:'auto',vehicle:'Auto privado · Toyota Corolla',capacity:4,priceCents:2000,time:'14:00'}
];
const hex=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
export async function ensureDemoDepartures(api,{origin,destination,date},rides,now=Date.now()){
 if(!origin||!destination||origin===destination||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Date.parse(date+'T23:59:00-05:00')<now)return false;
 let added=false;
 for(const f of DEMO_FLEET){
  const h=await hex('rutasec-public-mockup-v1|'+[f.id,origin,destination,date].join('|'));
  const requestId=h.slice(0,8)+'-'+h.slice(8,12)+'-4'+h.slice(13,16)+'-8'+h.slice(17,20)+'-'+h.slice(20,32);
  if(rides.some(r=>r.requestId===requestId))continue; // Never refill a paid, cancelled or completed departure.
  const token=await hex('rutasec-public-demo-operator-v1|'+f.id);
  await api('/api/operators',{token,body:{id:f.id,name:f.name,whatsapp:'00000000'}});
  const time=Date.parse(date+'T'+f.time+':00-05:00')>now?f.time:'23:59';
  await api('/api/rides',{token,body:{requestId,origin,destination,date,time,vehicleType:f.vehicleType,vehicle:f.vehicle,capacity:f.capacity,priceCents:f.priceCents,publish:true}});
  added=true;
 }
 return added;
}
