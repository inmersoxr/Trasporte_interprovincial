import { world, entity, entities, bookings, transact, event } from "./world.js";
export function recommendations() {
  const destination = world.context.destination || "banos";
  const hasStay = bookings().some(
    (b) =>
      entity(b.service)?.type === "habitacion" &&
      b.state !== "cancelada" &&
      entity(b.service)?.destination === destination,
  );
  const types =
    world.context.stage === "despues"
      ? ["destino", "tour"]
      : world.context.stage === "llegada" || hasStay
        ? ["restaurante", "tour", "atraccion"]
        : ["hotel", "tour", "restaurante"];
  const candidates = entities()
    .filter((e) => e.destination === destination && types.includes(e.type))
    .sort((a, b) => Number(b.sponsored) - Number(a.sponsored))
    ;
  return types.map(type=>candidates.find(e=>e.type===type)).filter(Boolean);
}
export function setStage(stage) {
  transact("contexto", (w) => {
    w.context.stage = stage;
    const messages = {
      antes: "Tu salida está cerca. Revisa tu boleto y descubre tu destino.",
      durante: "Estás en camino. Tu seguimiento y tus reservas están a mano.",
      llegada:
        "¡Llegaste a tu destino! Descubre gastronomía y experiencias locales.",
      despues:
        "Gracias por viajar con RutasEC. Comparte tu experiencia y planea la siguiente.",
    };
    w.notifications.unshift({
      id: crypto.randomUUID(),
      text: messages[stage],
      at: new Date().toISOString(),
    });
    event(w, "viaje.contexto", w.context.destination, { stage });
  });
}
