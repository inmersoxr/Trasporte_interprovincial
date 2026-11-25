import {
  world,
  entity,
  entities,
  bookings,
  transact,
  event,
  transition,
  uid,
} from "./world.js";
import {
  prepareRoad,
  tripSnapshot,
  applyTripCommand,
} from "./shared/trip-core.mjs";
import {
  $,
  esc,
  money,
  icon,
  link,
  btn,
  badge,
  empty,
  heading,
  modal,
  close,
  toast,
  actions,
  mountMap,
} from "./ui.js";
import { view, actor, go, render } from "./app.js";
import { setStage } from "./journey.js";
let timer,
  road,
  map,
  vehicle,
  publicTrip = null;
export function scanner() {
  const list = bookings().filter((b) => b.owner === view.tenant);
  modal(
    `<div class="eyebrow">LECTURA CONTROLADA · SIN CÁMARA</div><h2>Un QR. Una experiencia.</h2><p>La validación se restringe al proveedor seleccionado. Un código usado no vuelve a validarse.</p><form id="scanner-form"><label>Código QR demo<input name="token" required placeholder="Pega el código del boleto"></label><div class="form-actions"><button class="primary">Validar acceso simulado</button></div></form><h3>Simular lectura de una reserva</h3>${list.map((b) => `<div class="list-item"><div><strong>${esc(entity(b.service).name)}</strong><small>${esc(b.state)} · ${esc(b.date)}</small></div>${btn("scanBooking", "Leer QR", b.id, "chip right")}</div>`).join("") || '<p class="muted">Crea primero una reserva en esta empresa.</p>'}`,
  );
}
function validateBooking(id) {
  const b = entity(id);
  if (!b || b.owner !== view.tenant)
    throw Error("Este QR no corresponde a tu proveedor y servicio");
  const s = entity(b.service);
  transition(
    id,
    s.type === "habitacion"
      ? "entrada"
      : s.type === "viaje"
        ? "abordar"
        : "validar",
    actor(),
  );
  close();
  render();
  toast("QR validado en la simulación. Estado e inventario actualizados.");
}
async function initTracking(routeName) {
  clearInterval(timer);
  const path =
    routeName === "legacy" ? "shared/route.json" : "shared/quito-banos.json";
  let data;
  try {
    const res = await fetch(path);
    if (!res.ok) throw Error("No cargó la ruta");
    data = await res.json();
  } catch {
    data = await (await fetch("shared/route.json")).json();
    toast("Se muestra la ruta vial heredada Cuenca–Guayaquil.");
  }
  road = prepareRoad(data);
  const el = $("#trip-map");
  if (!el) return;
  map = L.map(el, { scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors · Ruta OSRM",
    maxZoom: 18,
  }).addTo(map);
  const coords = road.coordinates.map(([lng, lat]) => [lat, lng]);
  const line = L.polyline(coords, {
    color: "#5b7863",
    weight: 5,
    opacity: 0.8,
  }).addTo(map);
  map.fitBounds(line.getBounds(), { padding: [30, 30] });
  vehicle = L.circleMarker(coords[0], {
    radius: 9,
    color: "#17251c",
    weight: 3,
    fillColor: "#f6d344",
    fillOpacity: 1,
  }).addTo(map);
  L.circleMarker(coords.at(-1), {
    radius: 7,
    color: "#364c3c",
    fillOpacity: 1,
  }).addTo(map);
  tick();
  timer = setInterval(tick, 1000);
}
function tick() {
  if (!$("#trip-map") || !["tracking", "safety"].includes(view.page)) {
    clearInterval(timer);
    return;
  }
  const s = tripSnapshot(publicTrip || world.trip, road);
  vehicle.setLatLng([s.position.lat, s.position.lng]);
  $("#progress").textContent = Math.round(s.progress * 100) + "%";
  $("#trip-status").textContent =
    {
      ready: "Listo para iniciar",
      running: "En camino",
      paused: "En pausa",
      arrived: "Llegada simulada",
    }[s.status] || s.status;
  $("#distance").textContent = (s.remainingMeters / 1000).toFixed(1) + " km";
  $("#eta").textContent = Math.ceil(s.remainingSeconds) + " s demo";
  if (
    s.status === "arrived" &&
    !publicTrip &&
    world.context.stage !== "llegada"
  ) {
    transact("llegada", (w) => {
      w.trip.status = "arrived";
      w.trip.anchorMeters = road.totalMeters;
      w.context.stage = "llegada";
      event(w, "viaje.llegada", "banos");
      w.notifications.unshift({
        id: uid("n"),
        text: "¡Bienvenido a Baños! Tu itinerario, tus restaurantes y experiencias están listos.",
        at: new Date().toISOString(),
      });
    });
  }
}
export function renderOperations(route, arg) {
  publicTrip = null;
  if (arg) {
    try {
      const d = JSON.parse(atob(decodeURIComponent(arg)));
      if (
        !["ready", "running", "paused", "arrived"].includes(d.status) ||
        !Number.isFinite(d.anchorMeters) ||
        !Number.isFinite(d.anchorAt)
      )
        throw Error();
      publicTrip = {
        status: d.status,
        anchorMeters: d.anchorMeters,
        anchorAt: d.anchorAt,
        multiplier: [1, 2, 4, 8, 16, 32].includes(d.multiplier)
          ? d.multiplier
          : 1,
        alerts: [],
        route: d.route === "legacy" ? "legacy" : "banos",
      };
    } catch {
      return `<div class="container">${empty("Enlace de seguimiento no válido", "Solicita un nuevo enlace de demostración.", "safety", "Ir a Seguridad")}</div>`;
    }
  }
  const controls = !publicTrip && ["operador", "admin"].includes(view.role);
  const alerts = world.trip.alerts.filter((a) => a.status !== "closed");
  const routeName = publicTrip?.route || world.trip.route || "banos";
  setTimeout(() => initTracking(routeName), 60);
  return `<div class="container">${heading(route === "safety" ? "VIAJA ACOMPAÑADO" : "SEGUIMIENTO DE DEMOSTRACIÓN", publicTrip ? "Un viaje que puedes acompañar." : route === "safety" ? "Tu tranquilidad viaja contigo." : "Conecta con cada kilómetro.", publicTrip ? "Simulación autónoma compartida. No sincroniza dispositivos ni expone reservas o pasajeros." : "GPS simulado sobre ruta vial de referencia. SOS no contacta servicios de emergencia.", btn("shareTracking", "Compartir seguimiento", "", "secondary"))}<div class="timeline"><div class="${world.trip.status === "ready" ? "current" : "done"}">Antes de salir</div><div class="${world.trip.status === "running" ? "current" : ""}">En camino</div><div class="${world.trip.status === "arrived" ? "current" : ""}">En el destino</div></div><div class="detail-layout"><div><div class="panel"><div class="section-title"><div><h2>${routeName === "legacy" ? "Cuenca · Guayaquil" : "Quito · Baños"}</h2><span class="status-line">Simulación · Ruta OSRM · Sin GPS real</span></div>${badge(publicTrip ? "SOLO LECTURA" : "VIAJE DEMO", "yellow")}</div><div id="trip-map" class="map" style="height:430px"></div><div class="stats" style="margin-bottom:0"><div><small>Estado</small><h3 id="trip-status">Cargando ruta…</h3></div><div><small>Recorrido</small><h3 id="progress">0%</h3></div><div><small>Restante</small><h3 id="distance">—</h3></div><div><small>Tiempo acelerado</small><h3 id="eta">—</h3></div></div></div>${controls ? `<section class="panel"><h2>Control del operador</h2><div class="toolbar">${btn("tripCommand", "Iniciar", "start", "primary")}${btn("tripCommand", "Pausar", "pause", "secondary")}${btn("tripCommand", "Acelerar ×8", "speed", "secondary")}${btn("tripCommand", "Finalizar", "finish", "secondary")}${btn("tripRoute", routeName === "legacy" ? "Usar Quito–Baños" : "Ruta heredada Cuenca–Guayaquil", routeName === "legacy" ? "banos" : "legacy", "chip")}</div><p class="muted">Controles disponibles solo en perfiles Operador o Admin. El modo inversionista también permite avanzar el escenario.</p></section>` : ""}</div><aside><section class="panel"><h2>${publicTrip ? "Seguimiento público limitado" : "Tu seguridad, presente."}</h2><p class="muted">${publicTrip ? "Este enlace contiene solo el estado y reloj de la simulación. No incluye identidades, QR de acceso ni contactos." : "Una alerta visible para el centro de operaciones, dentro de la demo."}</p>${!publicTrip ? btn("tripCommand", icon("shield") + " Activar SOS simulado", "sos", "primary") : ""}<p class="notice">SOS es una simulación. No realiza llamadas, envía mensajes ni activa servicios externos.</p>${!publicTrip ? btn("safetyContact", "Contacto de demostración", "", "secondary") : ""}</section>${!publicTrip ? `<section class="panel"><h2>Alertas demo</h2>${alerts.map((a) => `<div class="list-item"><div><strong>SOS simulado</strong><small>${esc(a.status)} · ${new Date(a.at).toLocaleTimeString("es-EC")}</small><div class="toolbar">${controls ? btn("attendSOS", "Atender", a.id, "chip") : ""}${btn("closeSOS", "Cerrar alerta", a.id, "chip")}</div></div></div>`).join("") || '<p class="muted">Sin alertas abiertas en la demo.</p>'}</section>` : ""}${link("itinerary", "Volver a mi itinerario", "button secondary")}</aside></div></div>`;
}
export async function command(action) {
  if (!road) {
    const r = await (await fetch("shared/quito-banos.json")).json();
    road = prepareRoad(r);
  }
  transact("trip", (w) => {
    if (action === "finish") {
      w.trip.anchorMeters = road.totalMeters;
      w.trip.anchorAt = Date.now();
      w.trip.status = "arrived";
      w.context.stage = "llegada";
      event(w, "viaje.llegada", "banos");
      w.notifications.unshift({
        id: uid("n"),
        text: "¡Llegaste a Baños! Descubre gastronomía y experiencias locales.",
        at: new Date().toISOString(),
      });
    } else {
      w.trip = applyTripCommand(
        w.trip,
        { action, multiplier: 8, requestId: uid("cmd"), alertId: uid("alert") },
        road,
      );
      event(w, "viaje." + action, "ride-0");
      if (action === "start") w.context.stage = "durante";
    }
  });
}
Object.assign(actions, {
  scanner,
  scanBooking: ({ id }) => validateBooking(id),
  bookingOp: ({ id }) => {
    const [bookingId, action] = id.split("|");
    transition(bookingId, action, actor());
    render();
    toast("Estado actualizado en la demostración");
  },
  tripCommand: async ({ id }) => {
    if (!["sos"].includes(id) && !["operador", "admin"].includes(view.role))
      throw Error("Cambia al perfil operador para controlar el viaje");
    await command(id);
    toast(
      id === "sos"
        ? "SOS simulado visible en operaciones"
        : "Simulación actualizada",
    );
  },
  tripRoute: ({ id }) =>
    transact("ruta", (w) => {
      w.trip.route = id;
      w.trip.anchorMeters = 0;
      w.trip.anchorAt = Date.now();
      w.trip.status = "ready";
    }),
  shareTracking: async () => {
    const t = world.trip;
    const data = {
      status: t.status,
      anchorMeters: t.anchorMeters,
      anchorAt: t.anchorAt,
      multiplier: t.multiplier,
      route: t.route || "banos",
    };
    const url =
      location.origin +
      location.pathname +
      "#/tracking/" +
      encodeURIComponent(btoa(JSON.stringify(data)));
    modal(
      `<h2>Acompaña este viaje</h2><p>Enlace público de simulación autónoma, sin login de la demo. No contiene datos privados y no sincroniza cambios posteriores entre dispositivos.</p><input readonly value="${esc(url)}" aria-label="Enlace de seguimiento"><div class="form-actions"><a class="button primary" target="_blank" rel="noopener" href="${esc(url)}">Abrir seguimiento</a></div><p class="muted"><small>El acceso al sitio depende de sus permisos de publicación. Dentro del mockup, esta vista es de solo lectura.</small></p>`,
    );
  },
  attendSOS: ({ id }) => {
    if (!["operador", "admin"].includes(view.role))
      throw Error("Solo operador atiende alertas");
    transact("sos", (w) => {
      const a = w.trip.alerts.find((a) => a.id === id);
      a.status = "attended";
      event(w, "sos.atendido", "ride-0");
    });
  },
  closeSOS: ({ id }) =>
    transact("sos", (w) => {
      const a = w.trip.alerts.find((a) => a.id === id);
      a.status = "closed";
      event(w, "sos.cerrado", "ride-0");
    }),
  safetyContact: () =>
    modal(
      '<h2>Contacto de confianza · demo</h2><p>Familia del viajero · contacto ficticio configurado para mostrar la experiencia de seguridad.</p><div class="notice">No se almacena un teléfono real ni se envían notificaciones externas. El enlace de seguimiento puede copiarse y compartirse manualmente.</div>',
    ),
});
document.addEventListener("submit", (e) => {
  if (e.target.id !== "scanner-form") return;
  e.preventDefault();
  try {
    const token = new FormData(e.target).get("token"),
      b = bookings().find((b) => b.token === token);
    if (!b) throw Error("QR de demostración no reconocido");
    validateBooking(b.id);
  } catch (err) {
    toast(err.message);
  }
});
