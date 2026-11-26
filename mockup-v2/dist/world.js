// Entity-inspired demo world. Original implementation; no Entity code redistributed.
// Entity reference: 5ce25196fe3377fc811b54e22390b8d585248533.
import { seedWorld, addManta } from "./seed.js";
export const STORAGE_KEY = "rutasec.mockup-v2.world.4";
export const uid = (prefix = "e") => `${prefix}-${crypto.randomUUID()}`;
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function fresh() {
  return seedWorld(today());
}
export function load() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v?.version === 4) return addManta(v,today());
  } catch {}
  return fresh();
}
export let world = load();
export const entities = (type) =>
  Object.values(world.entities).filter((e) => !type || e.type === type);
export const entity = (id) => world.entities[id];
export const bookings = () => entities("reserva");
export const services = (owner) =>
  entities().filter((e) => e.owner === owner && e.bookable);
export function relation(w, source, target, type) {
  if (
    !w.relations.some(
      (r) => r.source === source && r.target === target && r.type === type,
    )
  )
    w.relations.push({
      id: uid("rel"),
      source,
      target,
      type,
      at: new Date().toISOString(),
    });
}
export function event(w, type, subject, payload = {}) {
  w.events.push({
    id: uid("evt"),
    type,
    subject,
    payload,
    at: new Date().toISOString(),
    simulated: true,
  });
}
export function available(w, id, date, end, time) {
  const e = w.entities[id];
  if (!e) return 0;
  const occupied = Object.values(w.entities)
    .filter(
      (b) =>
        b.type === "reserva" &&
        b.service === id &&
        !["cancelada", "completada", "salida"].includes(b.state) &&
        (e.type === "habitacion"
          ? b.date < (end || date + "T") && (b.end || b.date + "T") > date
          : b.date === date && (!time || b.time === time)),
    )
    .reduce((n, b) => n + b.qty, 0);
  return Math.max(0, (e.capacity || 1) - occupied);
}
function requireDemo(ok, msg) {
  if (!ok) throw Error(msg);
}
function allowed(w, actor, e) {
  return (
    actor.role === "admin" ||
    (actor.role === "gad" && ["destino", "evento"].includes(e.type)) ||
    actor.tenant === e.owner ||
    actor.tenant === e.id
  );
}
export function transact(action, fn) {
  const next = structuredClone(world);
  fn(next);
  next.revision++;
  next.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  world = next;
  window.dispatchEvent(new CustomEvent("worldchange", { detail: action }));
  return world;
}
export function reserveIn(
  w,
  items,
  {
    key = uid("pay"),
    actor = { role: "pasajero", id: "viajero-demo" },
    packageId = null,
    channel = "marketplace",
    coupon,
  } = {},
) {
  const old = Object.values(w.entities).filter(
    (e) => e.type === "reserva" && e.request === key,
  );
  if (old.length) return old;
  const result = [];
  for (const item of items) {
    const e = w.entities[item.service];
    requireDemo(
      e?.bookable &&
        e.mode !== "directorio" &&
        w.entities[e.owner]?.mode !== "directorio",
      "Este servicio es solo de directorio.",
    );
    const qty = Number(item.qty || 1),
      date = item.date || w.date,
      end = item.end;
    requireDemo(Number.isInteger(qty) && qty > 0, "Cantidad no válida");
    requireDemo(date >= today(), "Elige una fecha actual o futura");
    if (e.type === "habitacion")
      requireDemo(
        end && end > date,
        "La salida debe ser posterior a la entrada",
      );
    requireDemo(
      available(w, e.id, date, end, item.time) >= qty,
      "No hay disponibilidad suficiente en la simulación",
    );
    const seatBookings = Object.values(w.entities).filter(
      (b) =>
        b.type === "reserva" &&
        b.service === e.id &&
        b.date === date &&
        b.state !== "cancelada",
    );
    const taken = seatBookings.flatMap((b) => b.seats || []);
    let seats = item.seats || [];
    if (e.type === "viaje" && e.modality === "compartido") {
      if (!seats.length)
        seats = Array.from({ length: e.capacity }, (_, i) => i + 1)
          .filter((n) => !taken.includes(n))
          .slice(0, qty);
      requireDemo(
        seats.length === qty &&
          new Set(seats).size === qty &&
          seats.every(
            (n) =>
              Number.isInteger(n) &&
              n > 0 &&
              n <= e.capacity &&
              !taken.includes(n),
          ),
        "Selecciona asientos disponibles",
      );
    }
    if (e.modality === "privado")
      requireDemo(
        !Object.values(w.entities).some(
          (b) =>
            b.type === "reserva" &&
            b.vehicle === e.vehicle &&
            b.date === date &&
            b.time === item.time &&
            !["cancelada", "completada"].includes(b.state),
        ),
        "Vehículo ocupado en esa franja demo",
      );
    const nights =
      e.type === "habitacion"
        ? Math.round((new Date(end) - new Date(date)) / 86400000)
        : 1;
    const discount =
      coupon &&
      w.promotions.find(
        (p) =>
          p.code === coupon && p.active && (!p.owner || p.owner === e.owner),
      );
    const amount =
      Math.round(
        e.price *
          qty *
          nights *
          (discount ? 1 - discount.percent / 100 : 1) *
          100,
      ) / 100;
    const b = {
      id: uid("res"),
      type: "reserva",
      name: e.name,
      service: e.id,
      owner: e.owner,
      passenger: actor.id || "viajero-demo",
      date,
      end,
      time: item.time || e.time || "09:00",
      qty,
      seats,
      vehicle: e.vehicle,
      state: "confirmada",
      amount,
      request: key,
      packageId,
      channel,
      token: uid("qr"),
      at: new Date().toISOString(),
      payment: "simulado",
      discount: discount?.percent || 0,
    };
    w.entities[b.id] = b;
    relation(w, b.id, e.id, "reservaRecurso");
    relation(w, b.id, b.passenger, "perteneceA");
    if (packageId) relation(w, packageId, b.id, "incluye");
    event(w, "reserva.confirmada", b.id, { service: e.id, amount, channel });
    result.push(b);
    if (e.type === "viaje" && e.destination && channel !== "pos")
      w.context = { destination: e.destination, stage: "antes", date, booking: b.id };
    w.notifications.unshift({
      id: uid("not"),
      text: `Reserva confirmada: ${e.name}. Tu QR demo está en Mi viaje.`,
      at: new Date().toISOString(),
    });
    for (const c of w.campaigns)
      if (c.active && (!c.category || c.category === e.type)) c.conversions++;
  }
  return result;
}
export function reserve(items, options) {
  let result;
  transact("reserva", (w) => {
    result = reserveIn(w, items, options);
  });
  return result;
}
export function transition(id, action, actor) {
  transact(action, (w) => {
    const b = w.entities[id];
    requireDemo(b?.type === "reserva", "Reserva no encontrada");
    const own = actor.id === b.passenger;
    requireDemo(
      allowed(w, actor, b) || (action === "cancelar" && own),
      "Este QR pertenece a otro proveedor",
    );
    const service = w.entities[b.service];
    const map = {
      validar: ["confirmada", "utilizada"],
      abordar: ["confirmada", "abordada"],
      entrada: ["confirmada", "alojado"],
      salida: ["alojado", "salida"],
      completar: ["utilizada", "completada"],
      cancelar: ["confirmada", "cancelada"],
    };
    requireDemo(map[action], "Acción no válida");
    const [from, to] = map[action];
    requireDemo(b.state === from, `No permitido: reserva ${b.state}`);
    if (action === "entrada" || action === "salida")
      requireDemo(service.type === "habitacion", "La reserva no es de hotel");
    if (action === "abordar")
      requireDemo(service.type === "viaje", "El boleto no es de transporte");
    b.state = to;
    b.updatedAt = new Date().toISOString();
    if (action === "abordar" && w.context.booking === b.id) w.context.stage = "durante";
    if (action === "entrada") service.roomState = "ocupada";
    if (action === "salida") service.roomState = "limpieza";
    if (action === "cancelar") b.refund = "reembolso simulado";
    event(w, "reserva." + action, b.id, { state: to });
  });
}
export function edit(id, patch, actor) {
  transact("catalogo", (w) => {
    const e = w.entities[id];
    requireDemo(e && allowed(w, actor, e), "Sin permiso para esta empresa");
    requireDemo(
      !("price" in patch) || Number(patch.price) >= 0,
      "Precio inválido",
    );
    Object.assign(e, patch, { updatedAt: new Date().toISOString() });
    event(w, "catalogo.modificado", id, { fields: Object.keys(patch) });
  });
}
export function reset() {
  world = fresh();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
  window.dispatchEvent(new CustomEvent("worldchange", { detail: "reset" }));
}
export function exportWorld() {
  return JSON.stringify(world, null, 2);
}
if (typeof window !== "undefined")
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      world = load();
      window.dispatchEvent(new CustomEvent("worldchange", { detail: "sync" }));
    }
  });
