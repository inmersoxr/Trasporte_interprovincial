import { addNational } from "./national.js";
import { addBanos } from "./banos.js";
import { baseCatalog } from "./catalog.js";
export function seedWorld(date) {
  return addNational(
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
  );
}
