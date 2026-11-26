import {
  world,
  entity,
  entities,
  bookings,
  reserve,
  reserveIn,
  transact,
  event,
  relation,
  transition,
  available,
  uid,
  today,
} from "./world.js";
import {
  $,
  esc,
  money,
  icon,
  link,
  btn,
  badge,
  cards,
  empty,
  heading,
  photo,
  types,
  modal,
  close,
  toast,
  actions,
  datePlus,
} from "./ui.js";
import { view, actor, go, render, contextBanner } from "./app.js";
import { recommendations } from "./journey.js";
let checkoutState;
let packageTheme = "Aventura";
export function checkout(id, channel = "marketplace") {
  const service = entity(id);
  if (!service) return toast("Servicio no disponible");
  if (!service.bookable)
    return toast("Ficha de directorio: consulta la información del proveedor.");
  const date = view.search.date >= today() ? view.search.date : today();
  checkoutState = { id, key: uid("checkout"), channel, seats: [] };
  const hotel = service.type === "habitacion";
  modal(
    `<div class="eyebrow">${channel === "pos" ? "VENTA DIRECTA · POS" : "TU PRÓXIMA EXPERIENCIA"}</div><h2>${esc(service.name)}</h2><p>${esc(entity(service.owner)?.name || "RutasEC")} · Reserva y pago simulados</p><form id="booking-form"><div class="form-grid"><label>Fecha ${hotel ? "de entrada" : ""}<input name="date" id="booking-date" required type="date" min="${today()}" value="${date}"></label>${hotel ? `<label>Fecha de salida<input name="end" type="date" required min="${datePlus(date, 1)}" value="${datePlus(date, 2)}"></label>` : `<label>Hora<input name="time" type="time" value="${service.time || "09:00"}" required ${service.type === "viaje" && service.modality === "compartido" ? "readonly" : ""}></label>`}<label>${hotel ? "Habitaciones" : service.modality === "privado" ? "Vehículo completo" : service.type === "mesa" ? "Personas" : "Participantes"}<input name="qty" id="booking-qty" type="number" value="${hotel || service.modality === "privado" ? 1 : view.search.qty}" min="1" max="${service.modality === "privado" ? 1 : hotel ? service.capacity : 16}" required></label><label>${hotel ? "Huéspedes por habitación" : "Nombre demo"}${hotel ? `<input name="guests" type="number" min="1" max="${service.maxGuests || 2}" value="2" required>` : '<input name="name" value="Viajero demo" maxlength="60" required>'}</label><label>Cupón demo<input name="coupon" placeholder="BANOS10" maxlength="30"></label><label>Medio de pago simulado<select name="payment"><option>Tarjeta demo</option><option>Transferencia demo</option><option>Efectivo demo</option></select></label></div>${service.type === "viaje" && service.modality === "compartido" ? '<p class="muted">Elige tus asientos. Gris: ocupado · Amarillo: seleccionado.</p><div id="seat-picker"></div>' : ""}<div class="notice yellow" style="margin-top:20px">Esta operación es una simulación. No introduzcas datos personales ni bancarios reales.</div><div class="form-actions"><div style="margin-right:auto"><small>Total demo</small><div id="checkout-total" class="invoice-total"></div></div><button class="primary" type="submit">Confirmar pago simulado</button></div></form>`,
  );
  refreshCheckout();
}
function refreshCheckout() {
  if (!checkoutState || !$("#booking-form")) return;
  const e = entity(checkoutState.id),
    d = Object.fromEntries(new FormData($("#booking-form"))),
    qty = Number(d.qty) || 1;
  const nights =
    e.type === "habitacion"
      ? Math.max(1, (new Date(d.end) - new Date(d.date)) / 86400000)
      : 1;
  const p = world.promotions.find(
    (p) => p.active && p.code === d.coupon && (!p.owner || p.owner === e.owner),
  );
  $("#checkout-total").textContent = money(
    e.price * qty * nights * (p ? 1 - p.percent / 100 : 1),
  );
  if ($("#seat-picker")) {
    const occupied = bookings()
      .filter(
        (b) =>
          b.service === e.id && b.date === d.date && b.state !== "cancelada",
      )
      .flatMap((b) => b.seats || []);
    checkoutState.seats = checkoutState.seats
      .filter((n) => !occupied.includes(n))
      .slice(0, qty);
    $("#seat-picker").innerHTML = `<div class="seats">${Array.from(
      { length: e.capacity },
      (_, i) => i + 1,
    )
      .map(
        (n) =>
          `<button type="button" class="seat ${checkoutState.seats.includes(n) ? "selected" : ""}" data-action="seat" data-id="${n}" ${occupied.includes(n) ? "disabled" : ""}>${n}</button>`,
      )
      .join(
        "",
      )}</div><p class="muted" style="text-align:center">${checkoutState.seats.length} de ${qty} asientos seleccionados</p>`;
  }
}
export function ticket(id) {
  const b = entity(id);
  if (!b || b.type !== "reserva")
    return empty(
      "Boleto no encontrado",
      "Esta reserva pertenece a otra sesión demo.",
      "itinerary",
      "Ir a Mi viaje",
    );
  const s = entity(b.service);
  setTimeout(() => {
    const el = $("#ticket-qr");
    if (el) {
      el.innerHTML = "";
      new QRCode(el, {
        text: b.token,
        width: 170,
        height: 170,
        correctLevel: QRCode.CorrectLevel.M,
      });
    }
  }, 40);
  return `<article class="ticket"><div class="ticket-head"><div><div class="eyebrow" style="color:#b9cebc">RUTASEC · COMPROBANTE DE DEMOSTRACIÓN</div><h3>${esc(s.name)}</h3></div>${badge(b.state, "yellow")}</div><div class="ticket-body"><div class="grid-2"><div><p><strong>${esc(entity(b.owner)?.name || "Proveedor demo")}</strong></p><p>${esc(b.date)} ${b.end ? " · Salida " + esc(b.end) : " · " + esc(b.time)}<br>${b.qty} ${s.type === "habitacion" ? "habitaciones" : "personas/unidades"} ${b.seats?.length ? " · Asientos " + b.seats.join(", ") : ""}</p><p class="invoice-total">${money(b.amount)}</p><p>${badge("PAGO SIMULADO CONFIRMADO", "green")}</p><small class="muted">${esc(b.id)}<br>Canal: ${b.channel === "pos" ? "Venta directa · POS" : "Marketplace"}<br>${b.refund || "No es un comprobante fiscal ni un derecho de acceso real."}</small></div><div class="qr"><div id="ticket-qr"></div><p><small>QR único de demostración</small></p><code style="font-size:.6rem;overflow-wrap:anywhere">${esc(b.token)}</code></div></div><div class="ticket-actions">${btn("print", "Imprimir boleto", id, "secondary")}${btn("copyQR", "Copiar código QR", id, "secondary")}${s.type === "viaje" ? link("tracking", "Seguimiento demo", "button primary") : ""}${b.state === "confirmada" ? btn("cancelBooking", "Cancelar reserva", id, "secondary") : ""}</div></div></article>`;
}
function itinerary() {
  const list = bookings()
    .filter((b) => b.passenger === "viajero-demo")
    .sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="container">${heading("TUS PLANES, CONECTADOS", "Mi viaje. Mis próximas historias.", "Cada boleto, estancia y experiencia, en un mismo lugar.", link("packages", "Agregar un paquete", "button primary"))}${contextBanner()}<div class="timeline">${[
    ["antes", "Antes de salir"],
    ["durante", "En camino"],
    ["llegada", "En el destino"],
    ["despues", "Tu próximo viaje"],
  ]
    .map(
      ([id, n]) =>
        `<div class="${world.context.stage === id ? "current" : ""}">${n}</div>`,
    )
    .join("")}</div>${
    list.length
      ? list
          .map((b) => {
            const s = entity(b.service);
            return `<div class="panel service-row"><img src="${photo(s)}" alt="Imagen ilustrativa"><div><div class="eyebrow">${types[s.type]} ${b.packageId ? "· Paquete conectado" : ""}</div><h3>${esc(s.name)}</h3><p class="muted">${esc(b.date)} · ${esc(b.time)} · ${b.qty} ${s.type === "habitacion" ? "habitación(es)" : "participante(s)"} ${b.seats?.length ? "· Asientos " + b.seats.join(", ") : ""}</p>${badge(b.state, b.state === "cancelada" ? "red" : "green")}</div><div class="right"><strong>${money(b.amount)}</strong><div class="ticket-actions">${btn("ticket", "Ver QR", b.id, "primary")}${b.state === "confirmada" ? btn("modifyBooking", "Modificar", b.id, "secondary") : ""}${b.state === "completada" || b.state === "salida" ? btn("review", "Valorar", s.owner || s.id, "secondary") : ""}</div></div></div>`;
          })
          .join("")
      : empty(
          "El comienzo de una gran historia",
          "Busca un viaje o reserva una experiencia. También puedes crear un paquete sin comprar transporte.",
          "transport",
          "Buscar mi próximo viaje",
        )
  }${world.requests.length ? `<section class="panel"><h2>Solicitudes privadas</h2>${world.requests.map((r) => `<div class="list-item"><div><strong>${esc(r.origin)} · ${esc(r.destination)}</strong><small>${r.offers.length} propuestas · ${esc(r.state)}</small></div>${btn("showOffers", "Comparar ofertas", r.id, "secondary right")}</div>`).join("")}</section>` : ""}<section class="section"><div class="section-title"><div><div class="eyebrow">PENSADO PARA TU VIAJE</div><h2>${world.context.stage === "llegada" ? "Ahora que llegaste, vive el destino." : "Tu viaje no termina en el boleto."}</h2></div></div>${cards(recommendations())}</section></div>`;
}
function packages() {
  const choices = {
    ida: entities("viaje").filter(
      (e) => e.destination === "banos" && e.modality === "compartido",
    ),
    vuelta: entities("viaje").filter((e) => e.origin === "Baños de Agua Santa"),
    hotel: entities("habitacion").filter((e) => e.bookable),
    comida: entities("mesa").filter((e) => e.bookable),
    tour: entities("tour"),
    entrada: entities("atraccion").filter((e) => e.bookable),
  };
  const labels = {
    ida: "Transporte de ida",
    vuelta: "Transporte de vuelta",
    hotel: "Hospedaje · 2 noches",
    comida: "Experiencia gastronómica",
    tour: "Tour y aventura",
    entrada: "Entrada a una atracción",
  };
  return `<div class="container">${heading("TU ESCAPADA, A TU MANERA", "Un paquete. Todas tus posibilidades.", "Combina, sustituye proveedores y compara. Cada componente genera su propia reserva y QR demo.")}<div class="toolbar">${["Aventura", "Familiar", "Bienestar", "Económico", "Premium", "Naturaleza"].map((t) => btn("packageTheme", t, t, "chip " + (t === packageTheme ? "active" : ""))).join("")}</div><form id="package-form"><div class="detail-layout"><div>${Object.entries(
    choices,
  )
    .map(
      ([key, list]) =>
        `<section class="panel"><label style="display:flex;gap:12px;align-items:center"><input type="checkbox" name="include-${key}" checked style="width:20px;height:20px;min-height:auto;margin:0">${labels[key]}</label><select name="${key}" style="margin-top:16px">${list.map((e) => `<option value="${e.id}" ${key === "hotel" && e.id === themeRoom() ? "selected" : ""}>${esc(entity(e.owner)?.name || "RutasEC")} · ${esc(e.name)} · ${money(e.price)}</option>`).join("")}</select><p class="muted"><small>${key === "hotel" ? "1 habitación para 2 personas · Precio por noche" : key === "vuelta" ? "Retorno dos días después de la salida" : "2 personas · Inventario de demostración"}</small></p></section>`,
    )
    .join(
      "",
    )}</div><aside class="panel detail-aside"><div class="eyebrow">ESCAPADA ${esc(packageTheme).toUpperCase()}</div><h2>Tu paquete conectado</h2><label>Fecha de inicio<input type="date" name="date" min="${today()}" value="${view.search.date}" required></label><p class="muted">2 personas · 2 noches · Todos los precios son simulados.</p><div id="package-total" class="invoice-total"></div><p class="notice">Puedes quitar el transporte y contratar solo servicios locales.</p><button type="submit" class="primary button">Contratar paquete demo</button></aside></div></form></div>`;
}
function themeRoom() {
  return {
    Aventura: "room-3-0",
    Familiar: "room-1-2",
    Bienestar: "room-0-1",
    Económico: "room-3-0",
    Premium: "room-13-1",
    Naturaleza: "room-6-0",
  }[packageTheme];
}
function packageItems(form) {
  const d = Object.fromEntries(new FormData(form));
  return ["ida", "vuelta", "hotel", "comida", "tour", "entrada"]
    .filter((k) => d["include-" + k])
    .map((k) => ({
      service: d[k],
      qty: k === "hotel" ? 1 : 2,
      date: k === "vuelta" ? datePlus(d.date, 2) : d.date,
      end: k === "hotel" ? datePlus(d.date, 2) : undefined,
      time: entity(d[k]).time || "13:00",
    }));
}
function packageTotal() {
  const f = $("#package-form");
  if (!f) return;
  const total = packageItems(f).reduce(
    (sum, i) => sum + entity(i.service).price * i.qty * (i.end ? 2 : 1),
    0,
  );
  $("#package-total").textContent = money(total);
}
export function privateRequest() {
  modal(
    `<div class="eyebrow">PRIVADO PERSONALIZADO · COTIZACIÓN DEMO</div><h2>Tu ruta. Tus reglas.</h2><p>Las operadoras proponen. Tú comparas y eliges libremente.</p><form id="private-form"><div class="form-grid"><label>Origen<input name="origin" required value="${esc(view.search.origin)}"></label><label>Destino<input name="destination" required value="${esc(view.search.destination)}"></label><label>Fecha<input name="date" type="date" min="${today()}" value="${esc(view.search.date)}" required></label><label>Pasajeros<input name="qty" type="number" min="1" max="8" value="${esc(view.search.qty)}" required></label><label class="full">Tu idea de viaje<textarea name="requirements" maxlength="400" placeholder="Paradas, tipo de vehículo, duración..."></textarea></label></div><div class="form-actions"><button class="primary" type="submit">Solicitar propuestas demo</button></div></form>`,
  );
}
function showOffers(id) {
  const r = world.requests.find((r) => r.id === id);
  modal(
    `<div class="eyebrow">TÚ ELIGES · SIN ADJUDICACIÓN AUTOMÁTICA</div><h2>Propuestas para tu viaje</h2><p>${esc(r.origin)} · ${esc(r.destination)} · ${r.date} · ${r.qty} personas</p>${r.offers.map((o) => `<div class="list-item"><div><h3>${esc(entity(o.owner).name)}</h3><small>${esc(o.vehicle)} · ${esc(o.conditions)}</small><p><strong>${money(o.price)}</strong> · Precio total demo</p></div>${r.state !== "reservada" ? btn("selectOffer", "Elegir propuesta", r.id + "|" + o.id, "primary right") : badge(r.selected === o.id ? "Seleccionada" : "No seleccionada")}</div>`).join("") || '<p class="muted">Solicitud difundida en la simulación. Haz llegar las propuestas con el control inferior.</p>'}${r.state !== "reservada" && r.offers.length < 3 ? btn("receiveOffer", "Recibir siguiente propuesta demo", r.id, "secondary") : ""}`,
  );
}
Object.assign(actions, {
  seat: ({ id }) => {
    const n = Number(id),
      qty = Number($("#booking-qty").value);
    if (checkoutState.seats.includes(n))
      checkoutState.seats = checkoutState.seats.filter((i) => i !== n);
    else if (checkoutState.seats.length < qty) checkoutState.seats.push(n);
    else return toast("Ya seleccionaste todos tus asientos.");
    refreshCheckout();
  },
  ticket: ({ id }) => modal(ticket(id)),
  copyQR: async ({ id }) => {
    try {
      await navigator.clipboard.writeText(entity(id).token);
      toast("Código QR copiado");
    } catch {
      toast("Copia el código visible en el boleto");
    }
  },
  print: () => window.print(),
  cancelBooking: ({ id }) => {
    transition(id, "cancelar", actor());
    close();
    render();
    toast(
      "Reserva cancelada. Inventario restituido y reembolso simulado registrado.",
    );
  },
  modifyBooking: ({ id }) => {
    const b = entity(id);
    modal(
      `<h2>Modificar mi reserva</h2><p>Regla demo: solo reservas confirmadas, conservando servicio, cantidad y duración.</p><form id="modify-form" data-id="${id}"><label>Nueva fecha<input name="date" type="date" required min="${today()}" value="${b.date}"></label><div class="form-actions"><button type="submit" class="primary">Guardar cambio demo</button></div></form>`,
    );
  },
  packageTheme: ({ id }) => {
    packageTheme = id;
    render();
  },
  showOffers: ({ id }) => showOffers(id),
  receiveOffer: ({ id }) => {
    transact("propuesta", (w) => {
      const r = w.requests.find((r) => r.id === id),
        i = r.offers.length;
      r.offers.push({
        id: uid("offer"),
        owner: i % 2 ? "op-austro" : "op-rutas",
        price: [180, 155, 205][i],
        vehicle: [
          "SUV · 4 pasajeros",
          "Van · 8 pasajeros",
          "SUV Premium · 4 pasajeros",
        ][i],
        conditions: [
          "Una parada incluida",
          "Dos paradas y equipaje",
          "Tres paradas y espera incluida",
        ][i],
      });
      r.state = "recibiendo propuestas";
      event(w, "privado.propuesta", r.id, { number: i + 1 });
    });
    showOffers(id);
  },
  selectOffer: ({ id }) => {
    const [rid, oid] = id.split("|");
    transact("seleccion", (w) => {
      const r = w.requests.find((r) => r.id === rid);
      if (r.state === "reservada")
        throw Error("Esta solicitud ya está reservada");
      const o = r.offers.find((o) => o.id === oid);
      const s = {
        id: uid("custom"),
        type: "viaje",
        name: r.origin + " · " + r.destination + " personalizado",
        origin: r.origin,
        destination: "banos",
        owner: o.owner,
        modality: "privado",
        capacity: 1,
        price: o.price,
        bookable: true,
        vehicle: o.owner + "-private",
        photo: "suv",
      };
      w.entities[s.id] = s;
      reserveIn(w, [{ service: s.id, date: r.date, qty: 1, time: "09:00" }], {
        key: rid,
      });
      r.state = "reservada";
      r.selected = oid;
      event(w, "privado.seleccionado", r.id, { offer: oid });
    });
    close();
    go("itinerary");
    toast("Elegiste tu propuesta. El boleto demo ya está disponible.");
  },
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#booking-form")) refreshCheckout();
});
document.addEventListener("change", (e) => {
  if (e.target.closest("#booking-form")) refreshCheckout();
  if (e.target.closest("#package-form")) packageTotal();
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  if (
    !["booking-form", "package-form", "private-form", "modify-form"].includes(
      form.id,
    )
  )
    return;
  e.preventDefault();
  try {
    const d = Object.fromEntries(new FormData(form));
    if (form.id === "booking-form") {
      const service = entity(checkoutState.id);
      if (
        service.type === "viaje" &&
        service.modality === "compartido" &&
        checkoutState.seats.length !== Number(d.qty)
      )
        throw Error("Selecciona tus asientos antes de confirmar");
      const result = reserve(
        [
          {
            service: checkoutState.id,
            ...d,
            qty: Number(d.qty),
            seats: checkoutState.seats,
          },
        ],
        {
          key: checkoutState.key,
          actor: actor(),
          channel: checkoutState.channel,
          coupon: d.coupon,
        },
      );
      close();
      go("itinerary");
      setTimeout(() => {
        modal(
          `<div class="eyebrow">¡TU PRÓXIMO RECUERDO EMPIEZA AQUÍ!</div><h2>Reserva demo confirmada</h2>${ticket(result[0].id)}<div class="form-actions">${btn("close", "Seguir explorando", "", "secondary")}${link("entity/banos", "Descubrir Baños", "button primary")}</div>`,
        );
      }, 60);
    }
    if (form.id === "package-form") {
      const items = packageItems(form);
      if (!items.length)
        throw Error("Incluye al menos un componente en tu paquete");
      transact("paquete", (w) => {
        const id = uid("package");
        w.entities[id] = {
          id,
          type: "paquete",
          name: "Escapada " + packageTheme,
          passenger: "viajero-demo",
          state: "confirmada",
          date: d.date,
        };
        const rs = reserveIn(w, items, { key: id, packageId: id });
        w.entities[id].amount = rs.reduce((n, b) => n + b.amount, 0);
        event(w, "paquete.contratado", id, { components: rs.length });
      });
      go("itinerary");
      toast("Paquete contratado: cada componente tiene su propio QR demo.");
    }
    if (form.id === "private-form") {
      const id = uid("request");
      transact("solicitud", (w) => {
        w.requests.push({ id, ...d, offers: [], state: "difundida" });
        event(w, "privado.solicitado", id, {
          origin: d.origin,
          destination: d.destination,
        });
      });
      showOffers(id);
    }
    if (form.id === "modify-form") {
      transact("modificacion", (w) => {
        const b = w.entities[form.dataset.id],
          s = w.entities[b.service];
        if (b.state !== "confirmada")
          throw Error("Solo puedes modificar reservas confirmadas");
        const nights = b.end
          ? (new Date(b.end) - new Date(b.date)) / 86400000
          : 0;
        b.state = "cancelada";
        const end = nights ? datePlus(d.date, nights) : undefined;
        if (available(w, b.service, d.date, end, b.time) < b.qty)
          throw Error("La nueva fecha no tiene disponibilidad");
        const taken = Object.values(w.entities)
          .filter(
            (x) =>
              x.type === "reserva" &&
              x.service === b.service &&
              x.date === d.date &&
              x.state !== "cancelada",
          )
          .flatMap((x) => x.seats || []);
        if (b.seats.some((n) => taken.includes(n)))
          throw Error("Tus asientos están ocupados en esa fecha");
        b.date = d.date;
        if (end) b.end = end;
        b.state = "confirmada";
        event(w, "reserva.modificada", b.id, { date: d.date });
      });
      close();
      render();
      toast("Reserva modificada en todas las vistas demo");
    }
  } catch (err) {
    toast(err.message);
  }
});
export function renderMarketplace(route, arg) {
  if (route === "itinerary") return itinerary();
  if (route === "ticket")
    return `<div class="container">${heading("TU ACCESO DEMO", "Todo listo para tu experiencia.")}${ticket(arg)}</div>`;
  if (route === "packages") {
    setTimeout(packageTotal, 50);
    return packages();
  }
}
