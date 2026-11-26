import { world, entity, entities, bookings, transact, event } from "./world.js";
export const $ = (s, root = document) => root.querySelector(s);
export const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const money = (n) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
export const icons = {
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  bus: '<rect x="4" y="3" width="16" height="16" rx="3"/><path d="M4 11h16M8 19v2m8-2v2M8 15h.01M16 15h.01M9 6h6"/>',
  bed: '<path d="M3 18V8m18 10V8M3 14h18M6 10V6h12v4M3 20v-4h18v4"/>',
  food: '<path d="M5 3v7m4-7v7M3 3v5a4 4 0 0 0 8 0V3M7 12v10M20 3c-5 4-5 9 0 9v10M20 3v9"/>',
  mountain: '<path d="m2 20 8-16 5 9 2-4 5 11H2Zm5-10 3 3 3-3"/>',
  box: '<path d="m12 3 9 5v10l-9 5-9-5V8l9-5ZM3 8l9 5 9-5m-9 5v10M8 5l9 5"/>',
  home: '<path d="m3 10 9-8 9 8v11h-7v-7h-4v7H3V10Z"/>',
  heart:
    '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 10 8 16 7-6 12-12 8-16Z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
  ticket: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 0v12"/>',
  shield:
    '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z"/><path d="m8 12 3 3 5-6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  bell: '<path d="M4 17h16l-2-4V8a6 6 0 0 0-12 0v5l-2 4Zm5 3h6"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-4a8 8 0 0 1 16 0v4"/>',
  play: '<path d="m8 3 13 9-13 9V3Z"/>',
  check: '<path d="m4 12 5 5L20 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.pin}</svg>`;
export const link = (route, text, cls = "") =>
  `<a class="${cls}" href="#/${route}">${text}</a>`;
export const btn = (action, text, id = "", cls = "") =>
  `<button type="button" ${action === "presentation" ? 'aria-label="Modo inversionista"' : action === "notifications" ? 'aria-label="Notificaciones demo"' : ""} class="${cls}" data-action="${action}" data-id="${esc(id)}">${text}</button>`;
export const badge = (text, cls = "") =>
  `<span class="badge ${cls}">${esc(text)}</span>`;
export const types = {
  hotel: "Hospedaje",
  habitacion: "Habitación",
  restaurante: "Gastronomía",
  mesa: "Mesa",
  agencia: "Agencia",
  tour: "Experiencia",
  atraccion: "Atracción",
  bienestar: "Bienestar",
  noche: "Vida nocturna",
  viaje: "Transporte",
  operador: "Operadora",
  destino: "Destino",
  evento: "Evento",
  paquete: "Paquete",
};
export const photos = {
  hotel: "hotel",
  habitacion: "hotel",
  restaurante: "restaurant",
  mesa: "restaurant",
  tour: "banos",
  agencia: "banos",
  atraccion: "banos",
  bienestar: "hotel",
  noche: "restaurant",
  viaje: "sprinter",
  operador: "sprinter",
  destino: "banos",
};
export const photo = (e) =>
  `assets/${e.photo || photos[e.type] || "banos"}.webp`;
export function rating(id) {
  const r = world.reviews.filter((r) => r.entity === id);
  return r.length
    ? (r.reduce((s, r) => s + r.stars, 0) / r.length).toFixed(1)
    : null;
}
export function sponsored(e) {
  return world.campaigns.some(
    (c) =>
      c.active &&
      (!c.destination || c.destination === (e.destination || e.id)) &&
      (!c.category || c.category === e.type) &&
      (c.owner === "gad-banos" || c.owner === e.owner || c.owner === e.id) &&
      (!c.context || c.context === world.context.stage),
  );
}
export function card(e) {
  const s = entities().filter((s) => s.owner === e.id && s.bookable);
  const price =
    e.price ?? (s.length ? Math.min(...s.map((s) => s.price)) : null);
  return `<article class="card"><a href="#/entity/${esc(e.id)}" class="card-image"><img src="${photo(e)}" alt="${esc(e.type === "destino" ? e.name : "Imagen ilustrativa de " + types[e.type])}" loading="lazy">${sponsored(e) ? badge("Patrocinado", "sponsored") : e.mode === "premium" ? badge("PREMIUM", "premium") : ""}</a><button class="save" data-action="save" data-id="${esc(e.id)}" aria-label="Guardar ${esc(e.name)}">${icon("heart", world.saved.includes(e.id) ? "filled" : "")}</button><div class="card-copy"><div class="eyebrow">${esc(e.category || types[e.type])} <span>${rating(e.id) ? "★ " + rating(e.id) : "Demo"}</span></div><h3>${link("entity/" + e.id, esc(e.name))}</h3><p>${esc(e.subtitle || e.location || "Baños de Agua Santa · Ecuador")}</p><div class="card-bottom"><span>${price !== null ? `Desde <b>${money(price)}</b> <small>${e.type === "hotel" || e.type === "habitacion" ? "/ noche" : "/ persona"}</small>` : "Explora este lugar"}</span>${link("entity/" + e.id, "Ver ficha", "text-link")}</div></div></article>`;
}
export const cards = (list) =>
  `<div class="cards">${list.map(card).join("")}</div>`;
export function empty(
  title,
  text,
  route = "discover",
  label = "Explorar destinos",
) {
  return `<div class="empty">${icon("compass")}<h2>${title}</h2><p>${text}</p>${link(route, label, "button primary")}</div>`;
}
export function heading(kicker, title, desc = "", extra = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div>${extra}</div>`;
}
export function modal(html) {
  const d = $("#modal");
  d.innerHTML = `<button class="modal-close" data-action="close" aria-label="Cerrar">${icon("close")}</button>${html}`;
  if (!d.open) d.showModal();
}
export function close() {
  $("#modal").close();
}
let toastTimer;
export function toast(msg) {
  $("#toast").textContent = msg;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 4500);
}
export function download(name, content, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export const datePlus = (date, n) => {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const actions = {
  close,
  save: ({ id }) => {
    transact("guardar", (w) => {
      w.saved = w.saved.includes(id)
        ? w.saved.filter((x) => x !== id)
        : [...w.saved, id];
      event(w, "ficha.guardada", id);
    });
    toast("Tu selección se actualizó en Guardados");
  },
  share: async ({ id }) => {
    const url =
      location.origin +
      location.pathname +
      "#/entity/" +
      encodeURIComponent(id);
    try {
      await navigator.clipboard.writeText(url);
      toast("Enlace de la ficha copiado");
    } catch {
      modal(
        `<h2>Comparte este lugar</h2><input readonly value="${esc(url)}" aria-label="Enlace para compartir">`,
      );
    }
  },
  notifications: () =>
    modal(
      `<h2>Tu viaje, al día</h2><p class="muted">Notificaciones simuladas para la presentación.</p>${
        world.notifications.length
          ? world.notifications
              .slice(0, 12)
              .map(
                (n) =>
                  `<div class="list-item">${icon("bell")}<div>${esc(n.text)}<small>${new Date(n.at).toLocaleTimeString("es-EC")}</small></div></div>`,
              )
              .join("")
          : "<p>Al reservar recibirás aquí novedades de tu viaje.</p>"
      }`,
    ),
};
export function install() {
  let prompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    prompt = e;
  });
  actions.install = async () => {
    if (prompt) {
      await prompt.prompt();
      prompt = null;
    } else
      modal(
        '<h2>Lleva Ecuador contigo</h2><p>En Android abre el menú del navegador y elige «Instalar aplicación». En iPhone usa Compartir y «Añadir a pantalla de inicio».</p><p class="muted">La demo necesita cargar sus archivos una vez; las reservas y operaciones son simuladas.</p>',
      );
  };
}
export function mountMap(id, coords = [-1.3964, -78.4245], markers = []) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el || el._leaflet_id) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView(coords, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);
    L.circleMarker(coords, {
      radius: 9,
      color: "#151d20",
      fillColor: "#f6cf31",
      fillOpacity: 1,
    }).addTo(map);
    markers.forEach((e) =>
      L.circleMarker(e.coords || coords, { radius: 6, color: "#384d46" })
        .addTo(map)
        .bindPopup(esc(e.name)),
    );
  }, 30);
}

/* Product-facing copy only. Internal identifiers and transaction states stay intact. */
export function cleanProductCopy(root=document.body){
 const pairs=[
 [/Esta operación es una simulación\. No introduzcas datos personales ni bancarios reales\./gi,"No se realizará ningún cargo ni se solicitarán datos bancarios."],
 [/Pago de demostración\. No se solicitarán datos bancarios\./gi,"No se realizará ningún cargo."],
 [/PAGO SIMULADO CONFIRMADO/gi,"RESERVA CONFIRMADA"],
 [/Confirmar pago simulado/gi,"Confirmar reserva"],
 [/SOS es una simulación\. No realiza llamadas, envía mensajes ni activa servicios[^.]*\./gi,"Esta función no contacta servicios de emergencia."],
 [/GPS simulado sobre ruta vial de referencia\.[^.]*\./gi,"Ruta vial de referencia. Sin conexión GPS en tiempo real."],
 [/Simulación · Ruta OSRM · Sin GPS real/gi,"Ruta de referencia · Sin GPS en tiempo real"],
 [/Simulación autónoma compartida\.[^.]*\./gi,"Vista compartida del recorrido. Sin sincronización en tiempo real."],
 [/Proveedor ficticio y oferta simulada para el demo\./gi,"Consulta las opciones disponibles."],
 [/Lugar de referencia del directorio local\.[^.]*\. No existe afiliación comercial\./gi,"Lugar de referencia del directorio local."],
 [/Tarifas, inventario, reservas y opiniones son simulados\.[^.]*\./gi,"Imágenes ilustrativas."],
 [/Opinión de ejemplo para la presentación\. Esta valoración es simulada\./gi,""],
 [/Modo inversionista/gi,"Presentación"],
 [/\b(?:mockup\s*v?2?|demo|demostración|simulación)\b/gi,""],
 [/\b(?:simulado|simulada|simulados|simuladas|ficticio|ficticia|ficticios|ficticias)\b/gi,""],
 [/\b(?:para la presentación|para inversionistas|de presentación)\b/gi,""],
 [/\b(?:de|del|en la|en el|para la)\s*(?=[.,;:]|$)/gi,""],
 [/\s*·\s*(?=[.,;:]|$)/g,""],
 [/ {2,}/g," "]
 ];
 const clean=v=>pairs.reduce((t,[r,n])=>t.replace(r,n),v).trim();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while(node=walker.nextNode()){if(node.parentElement?.closest("script,style,code,pre"))continue;const v=node.nodeValue;if(/demo|simula|mockup|fictici|inversionista|presentación/i.test(v))node.nodeValue=clean(v);}
 for(const el of root.querySelectorAll("[placeholder],[aria-label],[title],input[value],textarea")){
 for(const attr of ["placeholder","aria-label","title"]){const v=el.getAttribute(attr);if(v&&/demo|simula|mockup|fictici|inversionista/i.test(v))el.setAttribute(attr,clean(v));}
 if(el.matches('input[type="text"],input:not([type]),textarea')&&/demo|simula|mockup|fictici/i.test(el.value)&&!el.matches('[name="token"],[name="plate"]'))el.value=clean(el.value);
 }
}
let copyQueued=false;
new MutationObserver(()=>{if(copyQueued)return;copyQueued=true;queueMicrotask(()=>{copyQueued=false;cleanProductCopy();});}).observe(document.body,{childList:true,subtree:true});
