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
let active = sessionStorage.getItem("rutasec.v2.presenting") === "yes";
let step = Number(sessionStorage.getItem("rutasec.v2.step") || 0);
const steps = [
  ["Todo empieza con un viaje", "Presenta la visión y el buscador."],
  [
    "Un boleto abre el destino",
    "Simula una compra Quito–Baños para dos personas.",
  ],
  [
    "Una estancia conectada",
    "Reserva una habitación para dos noches en Baños.",
  ],
  [
    "Una aventura por descubrir",
    "Añade la Ruta de las Cascadas a tu itinerario.",
  ],
  ["Los sabores del destino", "Reserva una experiencia gastronómica."],
  [
    "Todo se puede combinar",
    "Abre el configurador de paquetes y sustituye proveedores.",
  ],
  [
    "El viaje está en marcha",
    "Simula abordaje y movimiento sobre la ruta vial.",
  ],
  [
    "Llegar activa nuevas oportunidades",
    "Finaliza el trayecto y presenta recomendaciones locales.",
  ],
  [
    "Un QR conecta la operación",
    "Simula check-in y consulta la recepción del hotel.",
  ],
  ["Cada reserva impulsa un negocio", "Abre ventas e inventario del operador."],
  [
    "El territorio también participa",
    "Presenta promoción y métricas agregadas del GAD.",
  ],
  [
    "Un ecosistema. Una sola visión.",
    "Consulta el mundo, las entidades y los eventos en Admin.",
  ],
];
function setProfile(role, tenant) {
  view.role = role;
  view.tenant = tenant;
}
export function bar() {
  const old = $("#presentation-bar");
  old?.remove();
  if (!active) return;
  const el = document.createElement("div");
  el.id = "presentation-bar";
  el.className = "presentation";
  el.innerHTML = `<div class="label">${step + 1} / ${steps.length} · Modo inversionista<small>${esc(steps[step][0])}</small></div>${btn("investorPrevious", "Anterior", "", "plain")}${btn("investorNext", step === steps.length - 1 ? "Reiniciar recorrido" : "Siguiente")}${btn("presentation", "☰", "", "plain")}`;
  document.body.append(el);
}
function ensureTrip() {
  if (
    !bookings().some((b) => b.service === "ride-0" && b.state !== "cancelada")
  )
    reserve([{ service: "ride-0", date: today(), qty: 2, seats: [1, 2] }], {
      key: "investor-ride",
    });
}
async function applyStep(n) {
  step = Math.max(0, Math.min(steps.length - 1, n));
  sessionStorage.setItem("rutasec.v2.step", String(step));
  view.search.date = today();
  if (step === 0) {
    setProfile("pasajero", "op-rutas");
    go("home");
  }
  if (step === 1) {
    setProfile("pasajero", "op-rutas");
    ensureTrip();
    go("itinerary");
  }
  if (step === 2) {
    setProfile("pasajero", "op-rutas");
    if (
      !bookings().some(
        (b) => b.service === "room-0-0" && b.state !== "cancelada",
      )
    )
      reserve(
        [
          {
            service: "room-0-0",
            date: today(),
            end: datePlus(today(), 2),
            qty: 1,
          },
        ],
        { key: "investor-hotel" },
      );
    go("entity/hotel-0");
  }
  if (step === 3) {
    setProfile("pasajero", "op-rutas");
    if (
      !bookings().some((b) => b.service === "tour-0" && b.state !== "cancelada")
    )
      reserve([{ service: "tour-0", date: today(), qty: 2 }], {
        key: "investor-tour",
      });
    go("entity/tour-0");
  }
  if (step === 4) {
    setProfile("pasajero", "op-rutas");
    if (
      !bookings().some(
        (b) => b.service === "table-0-0" && b.state !== "cancelada",
      )
    )
      reserve(
        [{ service: "table-0-0", date: today(), time: "13:00", qty: 2 }],
        { key: "investor-meal" },
      );
    go("entity/rest-0");
  }
  if (step === 5) {
    setProfile("pasajero", "op-rutas");
    go("packages");
  }
  if (step === 6) {
    ensureTrip();
    setProfile("operador", "op-rutas");
    bookings()
      .filter((b) => b.service === "ride-0" && b.state === "confirmada")
      .forEach((b) =>
        transition(b.id, "abordar", { role: "operador", tenant: "op-rutas" }),
      );
    if (world.trip.status === "arrived") await command("reset");
    await command("start");
    await command("speed");
    go("tracking");
  }
  if (step === 7) {
    await command("finish");
    setProfile("pasajero", "op-rutas");
    go("itinerary");
  }
  if (step === 8) {
    const b = bookings().find(
      (b) => b.service === "room-0-0" && b.state === "confirmada",
    );
    setProfile("hotel", "hotel-0");
    if (b) transition(b.id, "entrada", { role: "hotel", tenant: "hotel-0" });
    go("business/operations");
  }
  if (step === 9) {
    setProfile("operador", "op-rutas");
    go("business/finance");
  }
  if (step === 10) {
    setProfile("gad", "gad-banos");
    transact("escenarioCampana", (w) => {
      const c = w.campaigns[0];
      if (!w.events.some((e) => e.type === "inversionista.campana")) {
        c.impressions += 100;
        c.clicks += 12;
        c.conversions += 3;
        event(w, "inversionista.campana", c.id);
      }
    });
    go("gad");
  }
  if (step === 11) {
    setProfile("admin", "admin-rutas");
    go("admin");
  }
  bar();
  toast(steps[step][1]);
}
function presentation() {
  modal(
    `<div class="eyebrow">LA VISIÓN, EN UNA EXPERIENCIA</div><h2>Conectamos el viaje.<br>Activamos el destino.</h2><p>Recorrido controlado de 12 escenas. Puedes salir, explorar libremente y volver en cualquier momento.</p><div class="notice yellow">Solo simulaciones para una muestra. Sin cobros, operación turística real ni integración con producción.</div><div class="toolbar">${btn("investorStart", active ? "Continuar presentación" : "Comenzar presentación", "", "primary")}${btn("investorStop", "Navegar libremente", "", "secondary")}${btn("resetDialog", "Restablecer datos demo", "", "secondary")}</div><div class="activity">${steps.map(([name, desc], i) => `<div class="list-item"><div><strong>${i + 1}. ${name}</strong><small>${desc}</small></div>${btn("investorStep", "Mostrar", String(i), "chip right")}</div>`).join("")}</div><div class="toolbar">${btn("controlledTime", "Cambiar tiempo demo", "", "secondary")}${btn("quickQR", "Validar QR demo", "", "secondary")}${btn("demoCheckout", "Simular check-out", "", "secondary")}</div>`,
  );
}
Object.assign(actions, {
  presentation,
  presentationBar: bar,
  investorStart: async () => {
    active = true;
    sessionStorage.setItem("rutasec.v2.presenting", "yes");
    close();
    await applyStep(step);
  },
  investorStop: () => {
    active = false;
    sessionStorage.setItem("rutasec.v2.presenting", "no");
    close();
    bar();
    toast("Navegación libre activada");
  },
  investorStep: async ({ id }) => {
    active = true;
    sessionStorage.setItem("rutasec.v2.presenting", "yes");
    close();
    await applyStep(Number(id));
  },
  investorNext: async () => {
    if (step === steps.length - 1) {
      step = 0;
      await applyStep(0);
    } else await applyStep(step + 1);
  },
  investorPrevious: async () => applyStep(step - 1),
  resetDialog: () =>
    modal(
      `<h2>Una historia nueva, desde el comienzo.</h2><p>Esto restablece únicamente las reservas, ventas, contenidos y eventos ficticios de este mockup en el navegador. Conserva el catálogo inicial.</p><div class="form-actions">${btn("close", "Conservar demo", "", "secondary")}${btn("resetWorld", "Restablecer escenario demo", "", "primary")}</div>`,
    ),
  resetWorld: () => {
    reset();
    step = 0;
    sessionStorage.setItem("rutasec.v2.step", "0");
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
