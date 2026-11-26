import { passengerPass } from "./world.js";
import {
  world,
  entity,
  entities,
  bookings,
  reserve,
  transact,
  event,
  transition,
  reset,
  uid,
  today,
} from "./world.js";
import {
  $,
  esc,
  icon,
  link,
  btn,
  badge,
  modal,
  close,
  toast,
  actions,
  datePlus,
} from "./ui.js";
import { view, go, render } from "./app.js";
import { command } from "./operations.js";
import { setStage } from "./journey.js";
let active=false,paused=false,step=0,epoch=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(ms=1800){const e=epoch;for(let n=0;n<ms;n+=100){while(paused&&active&&e===epoch)await sleep(100);if(!active||e!==epoch)throw Error("Recorrido detenido");await sleep(100);}}
function profile(role="pasajero",tenant="op-rutas"){view.role=role;view.tenant=tenant;}
async function page(route,role,tenant){if(role)profile(role,tenant);close();go(route);await wait(1700);}
function bar(){document.querySelectorAll('[data-action="presentation"]').forEach(b=>{b.innerHTML=icon(active&&!paused?"pause":"play");b.setAttribute("aria-label",active&&!paused?"Pausar recorrido":"Reproducir recorrido");});}
async function click(el){if(!el)throw Error("Control no disponible");el.scrollIntoView({block:"center",behavior:"smooth"});el.style.outline="2px solid #ffcc32";await wait(750);el.click();await wait(1100);}
const booking=id=>bookings().filter(b=>b.service===id&&b.state!=="cancelada").at(-1);
async function buy(id,qty=2){if(booking(id))return booking(id);profile();view.search.qty=qty;const {checkout}=await import("./marketplace.js");checkout(id);await wait(1800);const f=document.querySelector("#booking-form");if(!f)throw Error("Reserva no disponible");if(f.querySelector("#seat-picker")){for(let i=0;i<qty;i++)await click(f.querySelector(".seat:not(:disabled):not(.selected)"));}await click(f.querySelector('button[type="submit"]'));await wait(2000);const b=booking(id);if(!b)throw Error("No se confirmó la reserva");close();return b;}
async function scan(id,role){const b=booking(id);if(!b||b.state!=="confirmada")return;await page("business/bookings",role,b.owner);const {scanner}=await import("./operations.js");scanner();await wait(1300);const f=document.querySelector("#scanner-form");f.elements.token.value=passengerPass(b);await wait(900);await click(f.querySelector("button"));await wait(1000);}
const rafting=()=>entities("tour").find(e=>/rafting/i.test(e.name)&&e.bookable)?.id||"tour-0";
const steps=[
 ["Viajar",async()=>{profile();Object.assign(view.search,{origin:"Quito",destination:"Baños de Agua Santa",date:today(),qty:2,modality:"compartido"});await page("home");const f=document.querySelector('form');if(f){await wait(1000);}await page("transport");}],
 ["Viajar",async()=>{await buy("ride-0");await page("ticket/"+booking("ride-0").id);}],
 ["Vivir el destino",async()=>{await page("entity/banos","pasajero");await page("entity/hotel-0");await buy("room-0-0",1);}],
 ["Viajar",async()=>{await scan("ride-0","operador");await page("tracking","pasajero");if(world.trip.status==="arrived")await command("reset");await command("start");await command("speed");await wait(4500);}],
 ["Viajar",async()=>{await page("safety");const b=document.querySelector('[data-action="shareTracking"]');if(b){await click(b);await wait(2200);close();}await command("finish");}],
 ["Vivir el destino",async()=>{await scan("room-0-0","hotel");await page("itinerary","pasajero");await page("entity/rest-0");await buy("table-0-0");await scan("table-0-0","restaurante");}],
 ["Vivir el destino",async()=>{await page("directory/tour?destination=banos","pasajero");const id=rafting();await page("entity/"+id);await buy(id);await scan(id,"agencia");await page("itinerary","pasajero");}],
 ["Explorar Ecuador",async()=>{await page("discover","pasajero");for(const id of ["Pacífico","Andes","Amazonía"]){const b=[...document.querySelectorAll('[data-action="region"]')].find(x=>x.dataset.id===id);if(b)await click(b);await wait(1200);}}],
 ["Planificar",async()=>{await page("planner/pacifico","pasajero");await wait(3500);await page("planner/andes");await wait(2500);await page("planner/amazonia");await wait(2500);await page("planner/pacifico");await click(document.querySelector("#circuit-form button[type=submit]"));await wait(2500);}],
 ["Operar",async()=>{await page("business/dashboard","operador","op-rutas");await page("business/bookings");await page("business/pos");await page("business/finance");}],
 ["Operar",async()=>{await page("business/operations","hotel","hotel-0");await page("business/operations","restaurante","rest-0");await page("business/operations","agencia","agency-0");}],
 ["Activar el territorio",async()=>{await page("gad","gad","gad-banos");await wait(2500);await page("admin","admin","admin-rutas");await wait(2500);await page("home","pasajero");}]
];
async function togglePlay(){if(active){paused=!paused;bar();return;}active=true;paused=false;epoch++;step=0;bar();try{for(;step<steps.length;step++){await steps[step][1]();await wait(1800);}}catch(e){toast(e.message);}finally{active=false;paused=false;bar();}}
Object.assign(actions, {
  presentation: togglePlay,
  presentationBar: bar,
  resetDialog: () =>
    modal(
      `<h2>Una historia nueva, desde el comienzo.</h2><p>Esto restablece únicamente las reservas, ventas, contenidos y eventos ficticios de este mockup en el navegador. Conserva el catálogo inicial.</p><div class="form-actions">${btn("close", "Conservar demo", "", "secondary")}${btn("resetWorld", "Restablecer escenario demo", "", "primary")}</div>`,
    ),
  resetWorld: () => {
    reset();
    active=false; paused=false; epoch++; step=0;
    setProfile("pasajero", "op-rutas");
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
    setProfile("agencia", "agency-0");
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
    setProfile("hotel", b.owner);
    close();
    go("business/operations");
    toast("Check-out demo: habitación en limpieza");
  },
});
// Eagerly make shared operational actions available in every profile.
