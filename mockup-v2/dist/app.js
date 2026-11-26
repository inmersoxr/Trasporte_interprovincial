import "./marketplace.js";
import "./operations.js";
import { recordPlacement } from "./promotion.js";
import "./investor.js";
import { recommendations } from "./journey.js";
import {
  world,
  entity,
  entities,
  bookings,
  transact,
  event,
  available,
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
  card,
  empty,
  heading,
  photo,
  types,
  rating,
  modal,
  close,
  toast,
  actions,
  mountMap,
  install,
} from "./ui.js";
export const view = {
  role: sessionStorage.getItem("rutasec.v2.role") || "pasajero",
  tenant: sessionStorage.getItem("rutasec.v2.tenant") || "op-rutas",
  tab: "overview",
  category: "all",
  destination: "banos",
  search: {
    origin: "Quito",
    destination: "Baños de Agua Santa",
    date: today(),
    qty: 1,
    modality: "compartido",
  },
  compare: [],
  page: "home",
};
export const actor = () => ({
  role: view.role,
  tenant: view.tenant,
  id: "viajero-demo",
});
export function go(route) {
  if (location.hash === "#/" + route) render();
  else location.hash = "/" + route;
}
const categories = [
  ["viaje", "bus", "Transporte", "Conecta ciudades"],
  ["hotel", "bed", "Hospedaje", "Tu lugar para descansar"],
  ["restaurante", "food", "Gastronomía", "Sabores que conectan"],
  ["tour", "mountain", "Experiencias", "Historias por vivir"],
  ["paquete", "box", "Paquetes", "Todo, a tu manera"],
  ["destino", "compass", "Destinos", "Descubre Ecuador"],
];
const nav = [
  ["home", "home", "Inicio"],
  ["discover", "compass", "Descubre Ecuador"],
  ["itinerary", "ticket", "Mi viaje"],
  ["saved", "heart", "Guardados"],
];
function header() {
  return `<header class="topbar">${link("home", '<img src="assets/icon-192.png" alt="">Rutas<b>EC</b>', "brand")}<nav class="main-nav" aria-label="Principal">${nav.map(([r, i, n]) => link(r, n, view.page === r ? "active" : "")).join("")}</nav><div class="header-actions">${btn("presentation", icon("play"), "", "icon-button")}${btn("notifications", icon("bell") + `<span class="notification-count">${Math.min(9, world.notifications.length)}</span>`, "", "icon-button")}<div class="avatar">EC</div><select id="profile" class="profile-select" aria-label="Perfil de demostración">${[
    ["pasajero", "Pasajero"],
    ["operador", "Operador"],
    ["hotel", "Hotel"],
    ["restaurante", "Restaurante"],
    ["agencia", "Agencia"],
    ["gad", "GAD Baños"],
    ["admin", "Admin RutasEC"],
  ]
    .map(
      ([v, n]) =>
        `<option value="${v}" ${view.role === v ? "selected" : ""}>${n} · Demo</option>`,
    )
    .join(
      "",
    )}</select></div></header>`;
}
function footer() {
  return `<footer class="footer"><div>${link("home", "Rutas<b>EC</b>", "brand")}<p>Conectamos el viaje. Activamos el destino.</p></div><nav>${link("directory/operador", "Guía de transporte")}${btn("install", "Instalar app")}${btn("sources", "Fuentes y créditos")}</nav></footer>`;
}
export let promoTimer;
function tourismHero(){
 const slides=[["manta","Manta","Playas, sabores manabitas y experiencias frente al Pacífico.","Manabí","manta-cinematic"],["banos","Baños de Agua Santa","Cascadas, aventura y bienestar entre montañas.","Tungurahua","banos"]];
 return `<section class="hero tourism-hero" aria-label="Destinos promocionados" style="display:block"><style>
 .tourism-hero:before{display:none}.tourism-hero .promo-slide{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity 1.1s,visibility 1.1s;display:flex;align-items:center;background-size:cover;background-position:center;color:white;text-decoration:none}.tourism-hero .promo-slide.current{opacity:1;visibility:visible;z-index:1}.tourism-hero .promo-controls{position:absolute;z-index:2;bottom:55px;left:50%;transform:translateX(-50%);display:flex;gap:10px;align-items:center}.tourism-hero .promo-controls button{border:1px solid #ffffff88;background:#17201dcc;color:white;border-radius:20px;padding:6px 12px;cursor:pointer}.tourism-hero .promo-controls button[aria-current=true]{background:#f6d344;color:#111}.tourism-hero .promo-slide:focus-visible{outline:3px solid #f6d344;outline-offset:-4px}@media(prefers-reduced-motion:reduce){.tourism-hero .promo-slide{transition:none}}
 </style>${slides.map(([id,name,copy,region,img],i)=>`<a href="#/entity/${id}" class="promo-slide ${i===0?"current":""}" aria-hidden="${i!==0}" tabindex="${i===0?0:-1}" style="background-image:linear-gradient(90deg,rgba(10,20,22,.84),rgba(10,20,22,.15)),url('assets/${img}.webp')"><div class="hero-content"><div class="eyebrow">DESTINO PROMOCIONADO</div><h1>Descubre <em>${name}</em></h1><p>${copy}</p><div class="hero-location">${icon("pin")}<div>${name}<small>${region}, Ecuador</small></div></div></div></a>`).join("")}</section>`;
}
function mountTourismHero(){
 clearInterval(promoTimer);
 const root=document.querySelector(".tourism-hero");if(!root)return;
 let index=0,paused=matchMedia("(prefers-reduced-motion: reduce)").matches;
 const slides=[...root.querySelectorAll(".promo-slide")];
 const show=n=>{index=(n+slides.length)%slides.length;slides.forEach((el,i)=>{el.classList.toggle("current",i===index);el.setAttribute("aria-hidden",String(i!==index));el.tabIndex=i===index?0:-1});};
 promoTimer=setInterval(()=>{if(!root.isConnected){clearInterval(promoTimer);return;}if(!paused&&!root.matches(":hover")&&!root.contains(document.activeElement)&&!document.hidden)show(index+1)},6000);
}
function home() {
  return `${tourismHero()}<div class="container"><div class="search-wrap">${searchForm()}</div><section class="section"><div class="section-title"><div><h2>¿Qué te gustaría descubrir?</h2><p>Un viaje completo, a tu ritmo.</p></div></div><div class="categories">${categories.map(([t, i, n, d]) => link(t === "destino" ? "discover" : t === "viaje" ? "transport" : t === "paquete" ? "packages" : "directory/" + t, `${icon(i)}<div><h3>${n}</h3><small>${d}</small></div>`, "category")).join("")}</div></section>${world.context.booking ? contextBanner()+`<section class="section"><h2>Recomendaciones para tu viaje a ${esc(entity(world.context.destination)?.name)}</h2>${cards(recommendations())}</section>` : ""}<section class="section"><div class="section-title"><div><div class="eyebrow">DESTINO DESTACADO</div><h2>Baños. Siente la aventura.</h2><p>Cascadas que impresionan. Sabores que se quedan. Momentos que conectan.</p></div>${link("entity/banos", "Explorar destino", "text-link")}</div>${cards(["hotel-0", "tour-0", "rest-0"].map(entity).filter(Boolean))}</section><div class="banner">${icon("box")}<div><h3>Tu escapada, exactamente como la imaginas.</h3><p>Combina transporte, hospedaje y experiencias. Tú eliges cada detalle.</p></div>${link("packages", "Crea tu paquete", "button secondary")}</div><section class="section"><div class="section-title"><div><div class="eyebrow">CUATRO MUNDOS. UN SOLO PAÍS.</div><h2>Siempre hay un Ecuador por descubrir.</h2></div>${link("discover", "Ver destinos", "text-link")}</div>${cards(entities("destino").filter((e) => ["manta", "banos"].includes(e.id)))}</section>${footer()}</div>`;
}
function searchForm() {
  const cities = [
    "Quito",
    "Guayaquil",
    "Cuenca",
    "Ambato",
    "Riobamba",
    "Baños de Agua Santa",
    "Manta",
    "Paute",
    "Gualaceo",
    "Playas",
  ];
  return `<form id="search-form" class="search-card"><div class="search-tabs"><span class="active">${icon("bus")}Viajes</span>${link("directory/hotel", icon("bed") + " Hospedaje")}${link("directory/tour", icon("mountain") + " Experiencias")}</div><div class="transport-mode" role="group" aria-label="Modalidad de viaje"><style>.transport-mode{display:flex;gap:7px;margin:8px 0 12px;max-width:420px}.search-card .transport-mode label{position:relative;display:flex;align-items:center;justify-content:center;flex:1;min-width:0;min-height:30px;padding:6px 5px;border:1px solid #5d6570;border-radius:8px;background:#1b222a;color:#e7e9ec;font-size:12px;font-weight:500;letter-spacing:0;text-transform:none;cursor:pointer;white-space:nowrap}.search-card .transport-mode label:has(input:checked){border-color:#ffcc32;color:#ffcc32;background:#ffcc3212}.search-card .transport-mode input{position:absolute;opacity:0;width:1px;height:1px;padding:0;margin:0}.search-card .transport-mode label:has(input:focus-visible){outline:2px solid #ffcc32;outline-offset:2px}</style>${[["compartido","Compartido"],["privado","Privado"],["personalizado","Personalizado"]].map(([v,n])=>`<label><input type="radio" name="modality" value="${v}" ${view.search.modality===v?"checked":""}> ${n}</label>`).join("")}</div><div class="search-fields"><label>ORIGEN<select name="origin">${cities.map((n) => `<option ${view.search.origin === n ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>DESTINO<select name="destination">${cities.map((n) => `<option ${view.search.destination === n ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>FECHA DE SALIDA<input type="date" name="date" required min="${today()}" value="${view.search.date}"></label><label>PASAJEROS<select name="qty">${[1, 2, 3, 4, 5, 6].map((n) => `<option ${view.search.qty == n ? "selected" : ""} value="${n}">${n} ${n === 1 ? "persona" : "personas"}</option>`).join("")}</select></label><button class="primary" type="submit">${icon("search")}Buscar viaje</button></div></form>`;
}
export function transport() {
  let list = entities("viaje").filter(
    (e) => e.modality === view.search.modality,
  );
  list = list.filter(
    (e) =>
      e.origin === view.search.origin &&
      e.destinationName === view.search.destination &&
      available(world, e.id, view.search.date) >= Number(view.search.qty),
  );
  if (view.search.modality === "privado")
    list = entities("viaje").filter(
      (e) =>
        e.modality === "privado" &&
        available(world,e.id,view.search.date)>0 &&
        (entity(e.vehicle)?.capacity||1)>=Number(view.search.qty) &&
        e.origin === view.search.origin &&
        e.destinationName === view.search.destination,
    );
  return `<div class="container">${heading("ELIGE CÓMO VIAJAR", "Tu siguiente destino te espera.", "Compartido por asiento, privado con tarifa fija o una ruta hecha para ti. Horarios y conexiones demo.")}${searchForm()}<div class="toolbar">${btn("modality", "Compartido por asiento", "compartido", "chip " + (view.search.modality === "compartido" ? "active" : ""))}${btn("modality", "Privado · tarifa fija", "privado", "chip " + (view.search.modality === "privado" ? "active" : ""))}${btn("privateRequest", "Privado personalizado", "", "chip")}${link("directory/operador", "Guía de operadoras", "chip")}</div><p class="muted">${list.length} opciones · ${esc(view.search.date)} · ${esc(view.search.qty)} pasajeros</p>${list.length ? list.map((e) => `<div class="panel service-row"><img src="${photo(e)}" alt="Vehículo referencial"><div><div class="eyebrow">${esc(entity(e.owner).name)} · ${e.scope}</div><h3>${esc(e.origin)} · ${esc(e.destinationName)}</h3><div class="facts"><span>${icon("clock")}${e.time} · ${e.duration}</span><span>${icon("user")}${available(world, e.id, view.search.date)} ${e.modality === "privado" ? "vehículo disponible" : "asientos disponibles"}</span></div>${link("entity/" + e.id, "Detalles de la salida", "text-link")}</div><div class="right"><strong class="invoice-total">${money(e.price)}</strong><p class="muted">${e.modality === "privado" ? "vehículo completo" : "por persona"}</p>${btn("book", "Elegir viaje", e.id, "primary")}</div></div>`).join("") : empty("Busquemos otra conexión", "Prueba Quito, Cuenca, Guayaquil, Ambato o Riobamba hacia Baños. También Cuenca–Guayaquil y conexiones intraprovinciales.", "transport", "Cambiar búsqueda")}${footer()}</div>`;
}
export function directory(type = "all") {
  const destinations = entities("destino");
  let list = entities().filter((e) =>
    [
      "hotel",
      "restaurante",
      "agencia",
      "tour",
      "atraccion",
      "bienestar",
      "noche",
      "operador",
    ].includes(e.type),
  );
  const destinationFilter = new URLSearchParams(location.hash.split("?")[1] || "").get("destination");
  if(destinationFilter) list=list.filter(e=>e.destination===destinationFilter);
  if (type !== "all") list = list.filter((e) => e.type === type);
  if (view.query)
    list = list.filter((e) =>
      (e.name + " " + (e.category || ""))
        .toLowerCase()
        .includes(view.query.toLowerCase()),
    );
  if (view.sort === "price")
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  return `<div class="container">${heading("EXPLORA A TU MANERA", type === "all" ? "Encuentra tu próxima experiencia." : types[type] || type, "Información de lugares reales, con oferta comercial y reputación de demostración.")}<div class="toolbar"><input id="directory-search" aria-label="Buscar en el catálogo" placeholder="Busca un lugar o experiencia" value="${esc(view.query || "")}"><select id="sort" aria-label="Ordenar"><option value="recommended">Recomendados</option><option value="price" ${view.sort === "price" ? "selected" : ""}>Menor precio</option></select>${["all", "hotel", "restaurante", "tour", "agencia", "atraccion", "bienestar", "noche"].map((t) => link("directory/" + t, t === "all" ? "Todo" : types[t], "chip " + (t === type ? "active" : ""))).join("")}</div><p class="muted">${list.length} opciones · Servicios y fotos ilustrativos</p>${list.length ? cards(list) : empty("No encontramos coincidencias", "Prueba otro nombre o categoría.", "directory/all", "Ver todo el catálogo")}${footer()}</div>`;
}
export function detail(id) {
  const e = entity(id);
  if (!e)
    return `<div class="container">${empty("Este lugar todavía no está en la demo", "Explora los destinos y establecimientos disponibles.")}</div>`;
  if (e.type === "destino") return destination(e);
  const catalog = entities().filter((s) => s.owner === e.id && s.bookable);
  const related = world.relations
    .filter((r) => r.source === id || r.target === id)
    .map((r) => entity(r.source === id ? r.target : r.source))
    .filter((r) => r && r.type !== "reserva");
  const reviews = world.reviews.filter((r) => r.entity === id);
  return `<div class="container">${heading(link("home", "Inicio") + " / " + (types[e.type] || e.type), "", "", btn("share", "Compartir ficha", id, "secondary"))}<div class="detail-cover"><img src="${photo(e)}" alt="Imagen ilustrativa"><div>${badge(e.mode === "premium" ? "PREMIUM" : e.mode === "directorio" ? "GUÍA GRATUITA" : "MARKETPLACE", "premium")}<h1>${esc(e.name)}</h1><p>${esc(e.category || types[e.type])} · ${esc(e.location || entity(e.destination)?.name || "Ecuador")}</p></div></div><div class="detail-layout"><div><div class="toolbar">${btn("save", icon("heart") + " Guardar", id, "chip")}${btn("compare", "Comparar", id, "chip")}${link("directory/" + (["habitacion", "mesa"].includes(e.type) ? entity(e.owner)?.type : e.type), "Ver alternativas", "chip")}</div><section class="panel"><h2>Un lugar para tu próximo recuerdo.</h2><p>${esc(e.description || "Descubre este servicio en nuestra demostración de RutasEC. Explora sus opciones, compara proveedores y añádelo a tu viaje.")}</p><div class="facts"><span>${icon("clock")}${esc(e.hours || "Horario de demostración · 08:00–20:00")}</span><span>${icon("star")}${rating(id) ? rating(id) + " / 5 · opiniones demo" : "Sin valoraciones demo"}</span><span>${icon("shield")}Sin afiliación comercial</span></div><div class="notice">Tarifas, inventario, reservas y opiniones son simulados. Las fotos son ilustrativas y no acreditan instalaciones ni servicios reales.</div><div class="gallery"><img src="${photo(e)}" alt="Imagen ilustrativa"><img src="assets/banos.webp" alt="Pailón del Diablo"><img src="assets/road-cinematic.webp" alt="Paisaje referencial de Ecuador"></div></section>${catalog.length ? `<section class="panel"><h2>${e.type === "hotel" ? "Elige tu habitación" : e.type === "restaurante" ? "Menú, mesas y experiencias" : "Catálogo de experiencias"}</h2>${catalog.map((s) => `<div class="service-row"><img src="${photo(s)}" alt="Imagen ilustrativa"><div><h3>${esc(s.name)}</h3><small>${esc(s.subtitle || "Disponibilidad de demostración")} · ${available(world, s.id, world.date)} disponibles</small></div><div class="right"><b>${money(s.price)}</b><div>${btn("book", "Reservar demo", s.id, "primary")}</div></div></div>`).join("")}</section>` : ""}<section class="panel"><h2>Ubicación y contacto</h2><p>${esc(e.address || e.location || "Baños de Agua Santa · Ubicación aproximada demo")}</p><div id="entity-map" class="map"></div><div class="toolbar">${btn("contact", "Ver contacto", id, "secondary")}${e.source ? `<a class="text-link" target="_blank" rel="noopener" href="${esc(e.source)}">Consultar fuente del directorio</a>` : ""}</div></section><section class="panel"><h2>Opiniones de la comunidad</h2><p class="muted">Reseñas propias simuladas. La reputación no depende del plan.</p>${reviews.map((r) => `<div class="list-item"><div><strong>${"★".repeat(r.stars)} · Viajero demo</strong> ${r.verified ? badge("Servicio verificado · demo", "green") : ""}<p>${esc(r.text)}</p>${r.reply ? `<div class="notice">Respuesta del negocio: ${esc(r.reply)}</div>` : ""}</div></div>`).join("") || "<p>Todavía no hay opiniones para esta ficha.</p>"}${btn("review", "Escribir una opinión", id, "secondary")}</section>${
    related.length
      ? `<section class="panel"><h2>Todo está conectado</h2><div class="toolbar">${related
          .slice(0, 10)
          .map((r) => link("entity/" + r.id, esc(r.name), "chip"))
          .join("")}</div></section>`
      : ""
  }</div><aside class="panel detail-aside"><div class="eyebrow">${types[e.type] || "Tu destino"}</div><h2>${e.price != null ? money(e.price) : "Vive la experiencia"}</h2><p class="muted">${e.modality === "privado" ? "Tarifa fija por vehículo completo" : e.bookable ? "Precio simulado por persona o unidad" : "Elige una opción de su catálogo."}</p>${e.bookable ? btn("book", "Reservar simulación", id, "primary") : catalog.length ? btn("book", "Ver reserva demo", catalog[0].id, "primary") : btn("contact", "Consultar información", id, "primary")}${btn("compare", "Comparar alternativas", id, "secondary")}<p class="muted"><small>Pago de demostración. No se solicitarán datos bancarios.</small></p>${e.owner ? link("entity/" + e.owner, "Ver proveedor", "text-link") : ""}</aside></div>${footer()}</div>`;
}
export function destination(e) {
  mountMap("destination-map", e.coords, entities("atraccion").filter(a=>a.destination===e.id));
  const list = entities().filter(
    (s) =>
      s.destination === e.id &&
      [
        "hotel",
        "restaurante",
        "tour",
        "atraccion",
        "bienestar",
        "noche",
        "evento",
      ].includes(s.type),
  );
  const filtered =
    view.category === "all"
      ? list
      : list.filter((s) => s.type === view.category);
  return `<div class="container">${heading("DESCUBRE ECUADOR", "", "", btn("share", "Compartir destino", e.id, "secondary"))}<div class="detail-cover"><img src="${photo(e)}" alt="${esc(e.name)}"><div>${badge("DESTINO PREMIUM", "premium")}<h1>${esc(e.name)}</h1><p>${esc(e.category || "Ecuador")} · Naturaleza, cultura y experiencias</p></div></div><div class="toolbar">${["all", "hotel", "restaurante", "tour", "atraccion", "bienestar", "noche", "evento"].map((t) => btn("destinationCategory", t === "all" ? "Todo" : types[t] || t, t, "chip " + (view.category === t ? "active" : ""))).join("")}${btn("save", icon("heart") + " Guardar", e.id, "chip")}</div><div class="grid-2"><div class="panel"><div class="eyebrow">EL DESTINO, A TU RITMO</div><h2>Conecta con algo extraordinario.</h2><p>${esc(e.description)}</p><div class="toolbar">${btn("howTo", "Cómo llegar", e.id, "primary")}${link("packages", "Crear paquete", "button secondary")}${link("directory/all?destination="+e.id, "Buscar y comparar", "button secondary")}</div><p class="muted"><small>Oferta de presentación · Sin afiliación con los establecimientos</small></p></div><div class="panel"><div id="destination-map" class="map"></div></div></div><div class="section-title"><h2>${view.category === "all" ? "Todo lo que puedes vivir aquí" : types[view.category] || view.category}</h2><span class="muted">${filtered.length} opciones demo</span></div>${cards(filtered)}<section class="section"><h2>El viaje continúa</h2><div class="toolbar">${[
    "rio-verde",
    "rio-negro",
    "ambato",
    "riobamba",
    "puyo",
  ]
    .filter((id) => entity(id))
    .map((id) => link("entity/" + id, esc(entity(id).name), "chip"))
    .join("")}</div></section>${footer()}</div>`;
}
export function contextBanner() {
  return `<div class="banner">${icon(world.context.stage === "llegada" ? "sun" : "compass")}<div><h3>${world.context.stage === "llegada" ? "¡Bienvenido a tu destino!" : "Tu viaje a "+(entity(world.context.destination)?.name||"tu destino")+" ya comenzó."}</h3><p>${bookings().some((b) => entity(b.service)?.type === "habitacion" && b.state !== "cancelada" && entity(b.service)?.destination===world.context.destination) ? "Ya tienes dónde descansar. Descubre qué hacer y dónde comer." : "Encuentra tu lugar para descansar y tu próxima aventura."}</p></div>${link("entity/" + world.context.destination, "Descubrir mi destino", "button secondary")}</div>`;
}
async function page(route, arg) {
  if (route === "home") return home();
  if (route === "transport") return transport();
  if (route === "directory") return directory(arg?.split("?")[0]);
  if (route === "entity") {
    const html = detail(arg);
    if (entity(arg)?.type !== "destino")
      mountMap("entity-map", entity(arg)?.coords);
    return html;
  }
  if (route === "saved")
    return `<div class="container">${heading("TU SELECCIÓN", "Lugares que te inspiran.", "Guarda ideas y vuelve a ellas cuando quieras.")}${world.saved.length ? cards(world.saved.map(entity).filter(Boolean)) : empty("Tu próxima aventura empieza con una idea", "Guarda destinos y lugares con el corazón para encontrarlos aquí.")}${footer()}</div>`;
  if (["itinerary", "packages", "ticket"].includes(route)) {
    const m = await import("./marketplace.js");
    return m.renderMarketplace(route, arg);
  }
  if (["business", "gad", "admin"].includes(route)) {
    const m = await import("./business.js");
    return m.renderBusiness(route, arg);
  }
  if (route === "discover") {
    const m = await import("./discover.js");
    return m.discover();
  }
  if (["tracking", "safety"].includes(route)) {
    const m = await import("./operations.js");
    return m.renderOperations(route, arg);
  }
  return home();
}
let renderId = 0;
export async function render() {
  const n = ++renderId;
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  const route = parts[0] || "home",
    arg = parts[1];
  view.page = route;
  let content;
  try {
    content = await page(route, arg);
  } catch (err) {
    content = `<div class="container">${empty("Estamos preparando esta vista", esc(err.message), "home", "Volver al inicio")}</div>`;
  }
  if (n !== renderId) return;
  sessionStorage.setItem("rutasec.v2.role", view.role);
  sessionStorage.setItem("rutasec.v2.tenant", view.tenant);
  $("#app").innerHTML =
    header() +
    `<main id="main">${content}</main>` +
    `<nav class="bottom-nav" aria-label="Navegación móvil">${[...nav.slice(0, 3), ["safety", "shield", "Seguridad"], ["business", "grid", "Empresas"]].map(([r, i, t]) => link(r, icon(i) + t, route === r ? "active" : "")).join("")}</nav>`;
  mountTourismHero();
  actions.presentationBar?.();
  
  if (view.compare.length) {
    const el = document.createElement("div");
    el.className = "compare";
    el.innerHTML = `${view.compare.length} seleccionados ${btn("showCompare", "Comparar", "", "primary")}${btn("clearCompare", "✕")}`;
    $("#app").append(el);
  }
}
Object.assign(actions, {
  modality: ({ id }) => {
    view.search.modality = id;
    render();
  },
  destinationCategory: ({ id }) => {
    view.category = id;
    render();
  },
  compare: ({ id }) => {
    if (!view.compare.includes(id)) view.compare.push(id);
    view.compare = view.compare.slice(-3);
    render();
    toast("Añadido al comparador");
  },
  clearCompare: () => {
    view.compare = [];
    render();
  },
  showCompare: () =>
    modal(
      `<h2>Compara a tu manera</h2><p class="muted">Precios e inventario de demostración.</p><div class="table-wrap"><table><thead><tr><th>Servicio</th>${view.compare.map((id) => `<th>${esc(entity(id).name)}</th>`).join("")}</tr></thead><tbody>${[
        ["Categoría", (e) => types[e.type]],
        [
          "Precio desde",
          (e) =>
            money(
              e.price ??
                Math.min(
                  ...entities()
                    .filter((s) => s.owner === e.id && s.bookable)
                    .map((s) => s.price),
                ),
            ),
        ],
        ["Modalidad", (e) => e.mode],
        ["Reputación demo", (e) => rating(e.id) || "Sin reseñas"],
      ]
        .map(
          ([n, f]) =>
            `<tr><td>${n}</td>${view.compare.map((id) => `<td>${esc(f(entity(id))) || "Consultar"}</td>`).join("")}</tr>`,
        )
        .join(
          "",
        )}<tr><td></td>${view.compare.map((id) => `<td>${link("entity/" + id, "Ver ficha", "text-link")}</td>`).join("")}</tr></tbody></table></div>`,
    ),
  contact: ({ id }) =>
    modal(
      `<h2>Información de contacto</h2><h3>${esc(entity(id).name)}</h3><p>Contacto ilustrativo para la muestra. No se enviarán mensajes ni se realizarán llamadas reales.</p>${entity(id).source ? `<a class="button secondary" target="_blank" rel="noopener" href="${esc(entity(id).source)}">Abrir fuente pública del lugar</a>` : ""}`,
    ),
  howTo: ({ id }) => {
    view.search.destination = entity(id).name;
    go("transport");
  },
  book: async ({ id }) => (await import("./marketplace.js")).checkout(id),
  privateRequest: async () =>
    (await import("./marketplace.js")).privateRequest(),
  review: async ({ id }) => (await import("./promotion.js")).reviewForm(id),
  sources: () =>
    modal(
      `<h2>Fuentes, créditos y alcance</h2><p>Directorio de Baños investigado en la Cámara de Turismo y Baños Ecuador Travel. Datos comerciales y opiniones simulados, sin afiliación.</p><p>Fotos genéricas ilustrativas para hospedaje y gastronomía. Pailón del Diablo: Sebastian Reategui, CC0, Wikimedia Commons. Fotografías RutasEC y Leaflet: créditos originales conservados.</p><div class="toolbar"><a class="button secondary" href="CREDITS.md" target="_blank">Créditos completos</a><a class="button secondary" href="sources.json" target="_blank">Fuentes del catálogo</a></div>`,
    ),
});
document.addEventListener("click", async (e) => {
  const anchor = e.target.closest('dialog a[href^="#"]');
  if (anchor) close();
  const el = e.target.closest("[data-action]");
  if (!el) return;
  e.preventDefault();
  try {
    const action = actions[el.dataset.action];
    if (action) await action({ ...el.dataset, el });
    else toast("Esta acción no está disponible.");
  } catch (err) {
    toast(err.message);
  }
});
document.addEventListener("submit", async (e) => {
  if (e.target.id === "search-form") {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.origin === data.destination)
      return toast("Elige ciudades de origen y destino diferentes.");
    view.search = { ...view.search, ...data };
    if(data.modality==="personalizado"){ (await import("./marketplace.js")).privateRequest(); return; }
    go("transport");
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "profile") {
    view.role = e.target.value;
    view.tab = "overview";
    const mapping = {
      operador: "op-rutas",
      hotel: "hotel-0",
      restaurante: "rest-0",
      agencia: "agency-0",
      gad: "gad-banos",
      admin: "admin-rutas",
    };
    view.tenant = mapping[view.role] || "op-rutas";
    go(
      view.role === "pasajero"
        ? "home"
        : view.role === "gad"
          ? "gad"
          : view.role === "admin"
            ? "admin"
            : "business",
    );
  }
  if (e.target.id === "sort") {
    view.sort = e.target.value;
    render();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "directory-search") {
    const start = e.target.selectionStart;
    view.query = e.target.value;
    render().then(() => {
      const input = $("#directory-search");
      input?.focus();
      input?.setSelectionRange(start, start);
    });
  }
});
window.addEventListener("hashchange", () => {
  close();
  recordPlacement(location.hash);
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
});
window.addEventListener("worldchange", () => {
  if (!$("#modal").open) render();
});
install();
render();
setTimeout(() => $("#splash").classList.add("hidden"), 1400);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
