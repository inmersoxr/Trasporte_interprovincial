import assert from "node:assert/strict";
const values = new Map();
globalThis.localStorage = {
  getItem: (k) => values.get(k) || null,
  setItem: (k, v) => values.set(k, v),
};
globalThis.window = new EventTarget();
const m = await import("../dist/world.js");
const date = m.today();
assert.equal(m.entities("hotel").length, 15);
assert.equal(m.entities("restaurante").length, 15);
assert.equal(m.entities("agencia").length, 8);
assert.equal(m.entities("atraccion").length, 15);
const ride = m.reserve([{ service: "ride-0", date, qty: 2, seats: [1, 2] }], {
  key: "same-checkout",
})[0];
assert.equal(m.available(m.world, "ride-0", date), 14);
assert.equal(
  m.reserve([{ service: "ride-0", date, qty: 2, seats: [1, 2] }], {
    key: "same-checkout",
  })[0].id,
  ride.id,
);
assert.equal(m.bookings().length, 1);
assert.throws(
  () => m.reserve([{ service: "ride-0", date, qty: 1, seats: [1] }]),
  /asientos/,
);
assert.equal(m.bookings().length, 1);
assert.throws(
  () =>
    m.transition(ride.id, "abordar", { role: "operador", tenant: "op-austro" }),
  /otro proveedor/,
);
m.transition(ride.id, "abordar", { role: "operador", tenant: "op-rutas" });
assert.throws(
  () =>
    m.transition(ride.id, "abordar", { role: "operador", tenant: "op-rutas" }),
  /No permitido/,
);
const stay = m.reserve(
  [
    {
      service: "room-0-0",
      date,
      end: new Date(new Date(date + "T12:00:00Z").getTime() + 86400000)
        .toISOString()
        .slice(0, 10),
      qty: 1,
    },
  ],
  { key: "hotel" },
)[0];
m.transition(stay.id, "entrada", { role: "hotel", tenant: "hotel-0" });
assert.equal(m.entity("room-0-0").roomState, "ocupada");
m.transition(stay.id, "salida", { role: "hotel", tenant: "hotel-0" });
assert.equal(m.entity("room-0-0").roomState, "limpieza");
const count = m.bookings().length;
assert.throws(
  () =>
    m.reserve([
      { service: "tour-0", date, qty: 1 },
      { service: "room-0-0", date, qty: 100 },
    ]),
  /salida|disponibilidad/,
);
assert.equal(m.bookings().length, count);
const meal = m.reserve(
  [{ service: "table-0-0", date, time: "13:00", qty: 2 }],
  { coupon: "SABORES15" },
)[0];
assert.equal(meal.amount, 30.6);
m.transition(meal.id, "cancelar", { role: "pasajero", id: "viajero-demo" });
assert.equal(m.entity(meal.id).state, "cancelada");
assert.equal(m.load().revision, m.world.revision);
assert.ok(m.world.events.length > 5);
console.log(
  "PASS: catálogo, compra, idempotencia, asiento ocupado, aislamiento de proveedor, QR único, check-in/out, paquete atómico, cupón, cancelación y persistencia.",
);
