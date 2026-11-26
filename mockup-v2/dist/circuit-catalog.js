export const circuits={
 pacifico:{name:"Ruta Spondylus",stops:["salinas","montanita","puerto-lopez","manta"]},
 andes:{name:"Ruta de los Andes",stops:["quito","latacunga","ambato","riobamba","cuenca"]},
 amazonia:{name:"Ruta Amazónica",stops:["coca","tena","misahualli","puyo","macas","sucua"]}
};
export function addCircuitCatalog(w){const E=w.entities;for(const [id,name] of [["coca","El Coca"],["misahualli","Misahuallí"],["sucua","Sucúa"]])if(!E[id])E[id]={id,name,type:"destino",region:"Amazonía",photo:"banos",mode:"directorio"};
for(const c of Object.values(circuits))for(const [i,d] of c.stops.entries()){const name=E[d]?.name||d;const add=(id,type,n,data)=>{if(!E[id])E[id]={id,type,name:n,destination:d,mode:"marketplace",...data};};add("circuit-hotel-"+d,"hotel","Hospedaje "+name,{photo:"hotel"});add("circuit-room-"+d,"habitacion","Habitación doble · "+name,{owner:"circuit-hotel-"+d,price:55,capacity:12,bookable:true,maxGuests:2});add("circuit-tour-"+d,"tour","Experiencia local · "+name,{owner:"agency-0",price:25,capacity:16,bookable:true,time:"14:00"});if(i){const from=c.stops[i-1];add("circuit-ride-"+from+"-"+d,"viaje",E[from].name+" → "+name,{owner:"op-rutas",origin:E[from].name,destinationName:name,price:18,capacity:16,bookable:true,modality:"compartido",time:"08:00",photo:"sprinter"});}}
return w;}
