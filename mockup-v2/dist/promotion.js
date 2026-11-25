import {
  world,
  entity,
  entities,
  bookings,
  transact,
  event,
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
  heading,
  modal,
  close,
  toast,
  actions,
} from "./ui.js";
import { view, actor, render } from "./app.js";
export function reviewForm(id) {
  const verified = bookings().some(
    (b) =>
      ["completada", "salida"].includes(b.state) &&
      (b.service === id || entity(b.service)?.owner === id),
  );
  modal(
    `<div class="eyebrow">REPUTACIÓN PROPIA · INDEPENDIENTE DEL PLAN</div><h2>Tu experiencia conecta a otros.</h2><p>${esc(entity(id)?.name || "Servicio de demostración")}</p><form id="review-form" data-id="${id}"><div class="form-grid"><label>Valoración<select name="stars">${[5, 4, 3, 2, 1].map((s) => `<option value="${s}">${"★".repeat(s)} · ${s} de 5</option>`).join("")}</select></label><label>Servicio${badge(verified ? "Verificado · demo" : "Opinión de demostración", verified ? "green" : "yellow")}</label><label class="full">Tu opinión demo<textarea name="text" maxlength="500" required placeholder="Cuenta una experiencia ficticia para la muestra"></textarea></label><label class="full">Foto propia opcional · máximo 200 KB<input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label><label class="full" style="display:flex;align-items:center;gap:10px"><input name="permission" type="checkbox" required style="width:18px;min-height:18px">Confirmo que el texto es de demostración y tengo permiso para usar la foto.</label></div><div class="form-actions"><button class="primary">Publicar opinión demo</button></div></form>`,
  );
}
export function reputationPanel(owner) {
  const list = world.reviews.filter(
    (r) => r.entity === owner || entity(r.entity)?.owner === owner,
  );
  return `<section class="panel"><h2>La confianza se construye en cada experiencia.</h2><p class="muted">Una reputación por entidad. Pagar Premium o patrocinar nunca cambia sus estrellas.</p>${list.map((r) => `<div class="list-item"><div><strong>${"★".repeat(r.stars)} · ${esc(entity(r.entity)?.name || "Servicio")}</strong> ${r.verified ? badge("Verificado demo", "green") : badge("Opinión simulada")}<p>${esc(r.text)}</p>${r.photo ? `<img src="${esc(r.photo)}" alt="Foto autorizada por autor de reseña demo" style="height:90px;border-radius:10px">` : ""}${r.reply ? `<div class="notice">${esc(r.reply)}</div>` : ""}<div class="toolbar">${btn("replyReview", r.reply ? "Editar respuesta" : "Responder como empresa", r.id, "secondary")}</div></div></div>`).join("") || "<p>Las opiniones de tus servicios aparecerán aquí.</p>"}</section>`;
}
export function campaignPanel(owner) {
  const campaigns = world.campaigns.filter((c) => c.owner === owner);
  const p = world.promotions.filter(
    (p) => p.owner === owner || p.owner === null,
  );
  return `<div class="section-title"><h2>Que tu destino encuentre a sus viajeros.</h2>${btn("newCampaign", "Crear campaña demo", owner, "primary")}</div><div class="grid-2">${campaigns.map((c) => `<section class="panel"><div class="eyebrow">PUBLICIDAD SIMULADA · PATROCINADO</div><h2>${esc(c.name)}</h2><p>${esc(entity(c.destination)?.name || "Todos los destinos")} · ${c.context || "Todos los contextos"}</p>${badge(c.active ? "Activa" : "Pausada", c.active ? "green" : "yellow")}<p>Presupuesto demo: <strong>${money(c.budget)}</strong></p><div class="grid-3"><div><strong>${c.impressions}</strong><p class="muted"><small>Impresiones</small></p></div><div><strong>${c.clicks}</strong><p class="muted"><small>Interacciones</small></p></div><div><strong>${c.conversions}</strong><p class="muted"><small>Conversiones</small></p></div></div><div class="toolbar">${btn("toggleCampaign", c.active ? "Pausar" : "Activar", c.id, "secondary")}${btn("campaignExposure", "Simular exposición", c.id, "secondary")}</div><p class="muted"><small>${esc(c.placement || "Fichas, búsqueda y recomendaciones")}</small></p></section>`).join("") || '<section class="panel"><p class="muted">Crea tu primera campaña para mostrar posicionamiento contextual en la demo.</p></section>'}</div><section class="panel"><div class="section-title"><h2>Promociones y beneficios</h2>${btn("newPromotion", "Crear cupón demo", owner, "secondary")}</div>${p.map((p) => `<div class="list-item">${icon("ticket")}<div><strong>${esc(p.code)} · ${p.percent}% de descuento demo</strong><small>${esc(p.name)} · ${p.active ? "Activo" : "Pausado"}</small></div>${btn("togglePromotion", p.active ? "Pausar" : "Activar", p.id, "chip right")}</div>`).join("")}<div class="notice" style="margin-top:20px">Recompensas demo: al completar 10 viajes elegibles, el siguiente beneficio se muestra en el itinerario. No genera dinero, reembolsos ni derechos reales.</div></section>`;
}
function campaignForm(owner) {
  modal(
    `<h2>Una campaña conectada al viaje.</h2><p>Presupuesto, segmentación y resultados simulados.</p><form id="campaign-form" data-owner="${owner}"><div class="form-grid"><label class="full">Nombre<input name="name" required maxlength="100" placeholder="Descubre mi destino"></label><label>Destino<select name="destination">${entities(
      "destino",
    )
      .map(
        (d) =>
          `<option value="${d.id}" ${d.id === "banos" ? "selected" : ""}>${esc(d.name)}</option>`,
      )
      .join(
        "",
      )}</select></label><label>Categoría<select name="category"><option value="">Todas</option><option value="hotel">Hospedaje</option><option value="restaurante">Gastronomía</option><option value="tour">Experiencias</option></select></label><label>Desde<input name="start" type="date" value="${today()}" required></label><label>Hasta<input name="end" type="date" value="${today().slice(0, 4)}-12-31" required></label><label>Contexto<select name="context"><option value="">Todo el viaje</option><option value="antes">Antes de salir</option><option value="durante">Durante el viaje</option><option value="llegada">Al llegar</option></select></label><label>Presupuesto USD demo<input name="budget" type="number" min="1" value="200" required></label><label class="full">Ubicación / servicio objetivo<input name="placement" value="Búsqueda, fichas, recomendaciones, itinerario y paquetes" maxlength="150"></label></div><div class="form-actions"><button class="primary">Activar campaña simulada</button></div></form>`,
  );
}
export function recordPlacement(route) {
  const ids = world.campaigns
    .filter(
      (c) =>
        c.active &&
        (!c.context || c.context === world.context.stage) &&
        (!c.start || c.start <= today()) &&
        (!c.end || c.end >= today()),
    )
    .map((c) => c.id);
  if (!ids.length) return;
  transact("impresion", (w) => {
    for (const id of ids) {
      w.campaigns.find((c) => c.id === id).impressions++;
      event(w, "campana.impresion", id, { route });
    }
  });
}
Object.assign(actions, {
  newCampaign: ({ id }) => campaignForm(id || view.tenant),
  toggleCampaign: ({ id }) => {
    transact("campana", (w) => {
      const c = w.campaigns.find((c) => c.id === id);
      c.active = !c.active;
      event(w, "campana.estado", id, { active: c.active });
    });
    toast("Posicionamiento demo actualizado");
  },
  campaignExposure: ({ id }) => {
    transact("campana", (w) => {
      const c = w.campaigns.find((c) => c.id === id);
      c.impressions += 100;
      c.clicks += 12;
      c.conversions += 3;
      event(w, "campana.escenario", id, {
        impressions: 100,
        clicks: 12,
        conversions: 3,
      });
    });
    toast(
      "Escenario controlado: +100 impresiones, +12 clics, +3 conversiones simuladas.",
    );
  },
  newPromotion: ({ id }) =>
    modal(
      `<h2>Un beneficio para tu viajero</h2><form id="promotion-form" data-owner="${id || view.tenant}"><div class="form-grid"><label>Código<input name="code" required maxlength="20" pattern="[A-Za-z0-9]+" value="VIAJA15"></label><label>Descuento demo %<input name="percent" required type="number" min="1" max="50" value="15"></label><label class="full">Descripción<input name="name" required maxlength="100" value="Beneficio de temporada demo"></label></div><div class="form-actions"><button class="primary">Crear promoción demo</button></div></form>`,
    ),
  togglePromotion: ({ id }) => {
    transact("promocion", (w) => {
      const p = w.promotions.find((p) => p.id === id);
      p.active = !p.active;
      event(w, "promocion.estado", id);
    });
    render();
  },
  replyReview: ({ id }) =>
    modal(
      `<h2>La conversación también conecta.</h2><form id="reply-form" data-id="${id}"><label>Respuesta de la empresa<textarea name="reply" required maxlength="500">${esc(world.reviews.find((r) => r.id === id)?.reply || "Gracias por compartir tu experiencia de demostración.")}</textarea></label><div class="form-actions"><button class="primary">Publicar respuesta demo</button></div></form>`,
    ),
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (
    !["review-form", "campaign-form", "promotion-form", "reply-form"].includes(
      f.id,
    )
  )
    return;
  e.preventDefault();
  try {
    const fd = new FormData(f),
      d = Object.fromEntries(fd);
    if (f.id === "review-form") {
      let photo;
      const file = fd.get("image");
      if (file?.size) {
        if (file.size > 200000) throw Error("Usa una foto de menos de 200 KB");
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
          throw Error("Formato de imagen no admitido");
        photo = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      }
      transact("opinion", (w) => {
        const id = f.dataset.id;
        const verified = bookings().some(
          (b) =>
            ["completada", "salida"].includes(b.state) &&
            (b.service === id || entity(b.service)?.owner === id),
        );
        w.reviews.push({
          id: uid("review"),
          entity: id,
          stars: Number(d.stars),
          text: d.text,
          photo,
          verified,
          at: new Date().toISOString(),
        });
        event(w, "reputacion.valoracion", id, {
          stars: Number(d.stars),
          verified,
        });
      });
    }
    if (f.id === "campaign-form") {
      if (d.end < d.start)
        throw Error("La fecha final debe ser posterior al inicio");
      transact("campana", (w) => {
        const id = uid("campaign");
        w.campaigns.push({
          id,
          ...d,
          budget: Number(d.budget),
          active: true,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          owner: f.dataset.owner,
        });
        event(w, "campana.creada", id);
      });
    }
    if (f.id === "promotion-form")
      transact("promocion", (w) => {
        if (w.promotions.some((p) => p.code === d.code.toUpperCase()))
          throw Error("Ya existe este cupón");
        const id = uid("promo");
        w.promotions.push({
          id,
          ...d,
          code: d.code.toUpperCase(),
          percent: Number(d.percent),
          active: true,
          owner: f.dataset.owner,
        });
        event(w, "promocion.creada", id);
      });
    if (f.id === "reply-form")
      transact("reputacion", (w) => {
        const r = w.reviews.find((r) => r.id === f.dataset.id);
        const e = w.entities[r.entity];
        if (
          view.role !== "admin" &&
          e.id !== view.tenant &&
          e.owner !== view.tenant
        )
          throw Error("Esta opinión es de otro proveedor");
        r.reply = d.reply;
        event(w, "reputacion.respuesta", r.entity);
      });
    close();
    render();
    toast("Contenido de demostración actualizado");
  } catch (err) {
    toast(err.message);
  }
});
