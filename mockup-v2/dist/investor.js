import {world,entity,bookings,reset,today,transition,passengerPass} from "./world.js";
import {esc,icon,btn,modal,close,toast,actions} from "./ui.js";
import {view,go,render} from "./app.js";
import {setStage} from "./journey.js";
let active=false,step=0,baseline=new Set(),refs={},pending=null;
const profile=(role="pasajero",tenant="op-rutas")=>{view.role=role;view.tenant=tenant;};
const latest=type=>bookings().filter(b=>!baseline.has(b.id)&&b.state!=="cancelada"&&entity(b.service)?.type===type).at(-1);
const get=key=>entity(refs[key]);
const destination=()=>entity(get("ride")?.service)?.destination||world.context.destination;
const steps=[
 ["Viajar","Elige tu próximo destino","Selecciona origen, destino, fecha y pasajeros. Pulsa Buscar.",()=>go("home")],
 ["Viajar","Selecciona tu operadora","Compara horarios, vehículos y precios. Abre la reserva que prefieras."],
 ["Viajar","Elige tus asientos","Selecciona los asientos disponibles en la gráfica del vehículo."],
 ["Viajar","Confirma tu compra","Elige el medio de pago y confirma tu reserva. No se realizará ningún cargo."],
 ["Viajar","Tu boleto está listo","Revisa el boleto y el pase QR. Cuando estés listo, continúa al abordaje.",null,"Presentar QR"],
 ["Viajar","Presenta tu pase al conductor","Valida el boleto desde el lector de la operadora. Puedes pulsar Leer QR."],
 ["Viajar","Comienza tu viaje","Inicia el trayecto en el mapa y observa el seguimiento.",null],
 ["Viajar","Comparte tu recorrido","Pulsa Compartir seguimiento. Puedes copiar el enlace o compartirlo.",null,"Continuar al destino"],
 ["Vivir el destino","Descubre tu destino","Explora recomendaciones de alojamiento, gastronomía y experiencias.",null,"Buscar alojamiento"],
 ["Vivir el destino","Elige tu alojamiento","Selecciona un hotel y abre la habitación que prefieras."],
 ["Vivir el destino","Reserva tu habitación","Elige las fechas, huéspedes y medio de pago. Confirma la reserva."],
 ["Vivir el destino","Llegada al hotel","Revisa tu pase digital. Al llegar, preséntalo en recepción.",null,"Presentar QR"],
 ["Vivir el destino","Registra tu ingreso","Valida la reserva desde la recepción del hotel."],
 ["Vivir el destino","Descubre la gastronomía","Elige un restaurante, selecciona una mesa y confirma tu reserva."],
 ["Vivir el destino","Disfruta tu reserva","Presenta tu pase QR en el restaurante y valida el acceso."],
 ["Vivir el destino","Es hora de aventura","Elige rafting, trekking u otra experiencia y confirma la reserva."],
 ["Vivir el destino","Valida tu experiencia","Presenta el mismo pase QR a la agencia turística."],
 ["Explorar Ecuador","Descubre los circuitos nacionales","Explora Pacífico, Andes y Amazonía. Abre el circuito que prefieras."],
 ["Planificar","Diseña tu itinerario","Elige fechas, viajeros y servicios. Confirma cuando tengas tu ruta lista."],
 ["Planificar","Tu itinerario está listo","Revisa todas las reservas y servicios de tu viaje.",null,"Finalizar recorrido"]
];
function bar(){document.querySelectorAll('[data-action="presentation"]').forEach(b=>{b.innerHTML=icon("play");b.setAttribute("aria-label",active?"Cerrar tour guiado":"Iniciar tour guiado");});let el=document.getElementById("guided-tour");if(!active){el?.remove();return;}if(!el){el=document.createElement("aside");el.id="guided-tour";document.body.append(el);}const [chapter,title,desc,,next]=steps[step];el.innerHTML=`<style>#guided-tour{position:fixed;z-index:2147483000;right:14px;top:76px;width:min(340px,calc(100vw - 28px));background:#20252b;color:#fff;border:1px solid #ffcc32;border-radius:14px;padding:14px;box-shadow:0 8px 32px #0008;font-size:13px;pointer-events:auto}#guided-tour h3{margin:7px 0;color:white;font-size:17px}#guided-tour p{margin:5px 0 10px;color:#eee}#guided-tour button{font-size:12px}#guided-tour.minimized p,#guided-tour.minimized .guide-controls{display:none}#guided-tour .guide-head{display:flex;align-items:center;justify-content:space-between;gap:6px}#guided-tour .guide-controls{display:flex;gap:6px;flex-wrap:wrap}@media(max-width:600px){#guided-tour{top:65px;right:8px;width:calc(100vw - 16px);padding:10px}}</style><div class="guide-head"><small style="color:#ffcc32">${esc(chapter)} · ${step+1}/${steps.length}</small><div>${btn("guideMin","−","","plain")}${btn("guideStop","×","","plain")}</div></div><div style="height:3px;background:#555"><div style="height:3px;background:#ffcc32;width:${(step+1)/steps.length*100}%"></div></div><h3>${esc(title)}</h3><p>${esc(desc)}</p><div class="guide-controls">${next?btn("guideNext",next,"","primary"):""}${step===2?btn("guideNext","Continuar al pago","","secondary"):""}${step===7?btn("guideShowShare","Ver seguimiento","","secondary"):""}</div>`;}
function advance(n){if(!active)return;step=n;bar();}
async function scannerFor(key,role){const b=get(key);if(!b)return toast("Primero confirma la reserva");close();profile(role,b.owner);go("business/bookings");const m=await import("./operations.js");m.scanner();}
function passenger(route){close();profile();go(route);}
function directory(type){passenger("directory/"+type+"?destination="+destination());}
function start(){if(active){active=false;bar();return;}baseline=new Set(bookings().map(b=>b.id));refs={};pending=null;active=true;step=0;profile();close();go("home");bar();}
function check(){if(!active)return;const b=step===3||step===2||step===1?latest("viaje"):step===10?latest("habitacion"):step===13?latest("mesa"):step===15?latest("tour"):null;if(b){if(step<=3){refs.ride=b.id;advance(4);}else if(step===10){refs.hotel=b.id;advance(11);}else if(step===13){refs.food=b.id;advance(14);setTimeout(()=>scannerFor("food","restaurante"),350);}else if(step===15){refs.tour=b.id;advance(16);setTimeout(()=>scannerFor("tour","agencia"),350);}return;}
if(step===5&&get("ride")?.state==="abordada"){advance(6);passenger("tracking");}
else if(step===6&&["running","arrived"].includes(world.trip.status))advance(7);
else if(step===12&&get("hotel")?.state==="alojado"){advance(13);directory("restaurante");}
else if(step===14&&get("food")?.state==="utilizada"){advance(15);directory("tour");}
else if(step===16&&get("tour")?.state==="utilizada"){advance(17);passenger("discover");}
else if(step===18&&bookings().some(b=>!baseline.has(b.id)&&b.packageId)){advance(19);}
}
window.addEventListener("worldchange",()=>queueMicrotask(check));
window.addEventListener("hashchange",()=>{if(!active)return;const route=location.hash;if(step===0&&route.includes("/transport"))advance(1);if(step===17&&route.includes("/planner"))advance(18);});
document.addEventListener("click",e=>{if(!active)return;const b=e.target.closest("[data-action]");if(!b)return;if(b.dataset.action==="book"){const type=entity(b.dataset.id)?.type;if(step===1&&type==="viaje"){pending=b.dataset.id;advance(entity(pending).modality==="compartido"?2:3);}if(step===9&&type==="habitacion")advance(10);}if(step===2&&b.dataset.action==="seat")queueMicrotask(()=>{const f=document.querySelector("#booking-form");if(f&&f.querySelectorAll(".seat.selected").length>=Number(f.elements.qty.value))advance(3);});},true);
Object.assign(actions,{
 presentation:start,presentationBar:bar,guideStop:()=>{active=false;bar();},guideMin:()=>document.getElementById("guided-tour")?.classList.toggle("minimized"),
 guideShowShare:()=>passenger("tracking"),
 guideNext:async()=>{if(!active)return;if(step===2){advance(3);return;}if(step===4){advance(5);await scannerFor("ride","operador");}else if(step===7){advance(8);passenger("entity/"+destination());}else if(step===8){advance(9);directory("hotel");}else if(step===11){const {command}=await import("./operations.js");if(world.trip.status!=="arrived")await command("finish");advance(12);await scannerFor("hotel","hotel");}else if(step===19){active=false;bar();toast("Recorrido completado");}},
  resetDialog: () =>
    modal(
      `<h2>Una historia nueva, desde el comienzo.</h2><p>Esto restablece únicamente las reservas, ventas, contenidos y eventos ficticios de este mockup en el navegador. Conserva el catálogo inicial.</p><div class="form-actions">${btn("close", "Conservar demo", "", "secondary")}${btn("resetWorld", "Restablecer escenario demo", "", "primary")}</div>`,
    ),
  resetWorld: () => {
    reset();
    active=false; step=0;
    profile("pasajero", "op-rutas");
    view.search.date = today();
    close();
    go("home");
    bar();
    toast("Escenario demo restablecido. Listo para otra presentación.");
  },
  controlledTime: () =>
    modal(
      `<h2>Avanza el contexto del viaje</h2><p>El reloj controla las escenas y notificaciones de la muestra.</p><div class="toolbar">${[
        ["antes", "Antes de salir"],
        ["durante", "Durante el trayecto"],
        ["llegada", "Llegada"],
        ["despues", "Después del viaje"],
      ]
        .map(([id, n]) => btn("setStage", n, id, "secondary"))
        .join("")}</div>`,
    ),
  setStage: ({ id }) => {
    setStage(id);
    close();
    go("itinerary");
    toast("Contexto y recomendaciones actualizados");
  },
  quickQR: async () => {
    profile("agencia", "agency-0");
    close();
    await import("./business.js");
    const { scanner } = await import("./operations.js");
    go("business/bookings");
    setTimeout(scanner, 150);
  },
  demoCheckout: () => {
    const b = bookings().find((b) => b.state === "alojado");
    if (!b) return toast("Simula primero el check-in del hotel en la escena 9");
    transition(b.id, "salida", { role: "hotel", tenant: b.owner });
    profile("hotel", b.owner);
    close();
    go("business/operations");
    toast("Check-out demo: habitación en limpieza");
  },
});
// Eagerly make shared operational actions available in every profile.
