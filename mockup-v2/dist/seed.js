import { addNational } from "./national.js";
import { addBanos } from "./banos.js";
import { baseCatalog } from "./catalog.js";
export function seedWorld(date) {
  return addManta(addNational(
    addBanos(
      {
        version: 4,
        revision: 0,
        date,
        entities: {
          ...baseCatalog(date).entities,
          "viajero-demo": {
            id: "viajero-demo",
            type: "pasajero",
            name: "Viajero de demostración",
          },
          ecuador: { id: "ecuador", type: "pais", name: "Ecuador" },
        },
        relations: baseCatalog(date).relations,
        events: [],
        campaigns: [],
        promotions: [],
        reviews: [],
        notifications: [],
        saved: [],
        invites: [],
        requests: [],
        orders: [],
        context: { destination: "banos", stage: "antes", date },
        trip: {
          status: "ready",
          anchorMeters: 0,
          anchorAt: Date.now(),
          multiplier: 1,
          alerts: [],
          events: [],
          revision: 0,
        },
        settings: { commission: 10 },
        updatedAt: new Date().toISOString(),
      },
      date,
    ),
    date,
  ),date);
}

export function addManta(w,date){
 const E=w.entities;
 const add=(id,type,name,data={})=>{if(!E[id]) E[id]={id,type,name,destination:"manta",location:"Manta",state:"activo",mode:"marketplace",description:"Proveedor ficticio y oferta simulada para el demo.",...data};};
 for(let i=0;i<3;i++){
 add("manta-hotel-"+i,"hotel",["Hotel Costa Demo","Hotel Bahía Demo","Hostal Pacífico Demo"][i],{photo:"hotel",category:"Hospedaje demo"});
 add("manta-room-"+i,"habitacion","Habitación doble",{owner:"manta-hotel-"+i,photo:"hotel",price:45+i*20,capacity:6,maxGuests:2,bookable:true});
 add("manta-rest-"+i,"restaurante",["Mar y Sabor Demo","Cocina Manabita Demo","Terraza del Pacífico Demo"][i],{photo:"restaurant",category:"Gastronomía demo"});
 add("manta-table-"+i,"mesa","Menú y mesa",{owner:"manta-rest-"+i,photo:"restaurant",price:12+i*5,capacity:24,bookable:true});
 }
 add("manta-agency","agencia","Costa Aventura Demo",{photo:"manta-cinematic"});
 for(let i=0;i<3;i++)add("manta-tour-"+i,"tour",["Ruta de playas","Experiencia gastronómica manabita","Paseo costero"][i],{owner:"manta-agency",photo:"manta-cinematic",price:20+i*10,capacity:12,time:"09:00",duration:"3 h",bookable:true});
 add("manta-attr-0","atraccion","Playa El Murciélago",{photo:"manta-cinematic",description:"Playa urbana de Manta.",coords:[-0.941,-80.733]});
 for(const dest of ["manta","banos"]){const name=E[dest].name;for(const [i,origin] of ["Cuenca","Guayaquil","Quito"].entries()){for(const mode of ["compartido","privado"]){const id="demo-"+dest+"-"+i+"-"+mode;const vehicle=id+"-veh";const owner=i%2?"op-austro":"op-rutas";add(vehicle,"vehiculo",mode==="privado"?"Kia Sorento":"Mercedes Sprinter",{owner,capacity:mode==="privado"?4:12,photo:mode==="privado"?"suv":"sprinter",plate:"DEMO-"+dest+"-"+i+"-"+mode,state:"disponible"});add(id,"viaje",origin+" · "+name,{destination:dest,destinationName:name,origin,owner,vehicle,modality:mode,capacity:mode==="privado"?1:12,price:mode==="privado"?120+i*25:15+i*5,time:"08:00",duration:"Horario demo",scope:"Interprovincial",photo:mode==="privado"?"suv":"sprinter",bookable:true});}}}
 return w;
}
