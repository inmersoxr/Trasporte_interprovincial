import {
  world,
  entity,
  entities,
  bookings,
  services,
  available,
  transact,
  event,
  relation,
  edit,
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
  rating,
  modal,
  close,
  toast,
  actions,
  datePlus,
  download,
} from "./ui.js";
import { view, actor, go, render } from "./app.js";
const businessTypes = ["operador", "hotel", "restaurante", "agencia"];
const tenant = () => entity(view.tenant);
const ownBookings = () => bookings().filter((b) => b.owner === view.tenant);
const ownServices = () => services(view.tenant);
const nonCancelled = () => ownBookings().filter((b) => b.state !== "cancelada");
const tabs = [
  ["overview", "grid", "Resumen"],
  ["bookings", "ticket", "Reservas y QR"],
  ["catalog", "box", "Catálogo"],
  ["calendar", "clock", "Calendario"],
  ["operations", "pin", "Operaciones"],
  ["pos", "food", "Punto de venta"],
  ["staff", "user", "Personal"],
  ["finance", "grid", "Finanzas"],
  ["campaigns", "sun", "Promociones"],
  ["reputation", "star", "Reputación"],
  ["settings", "compass", "Mi empresa"],
];
function setBusinessRole() {
  const e = tenant();
  if (!e || !businessTypes.includes(e.type)) {
    view.tenant = "op-rutas";
    view.role = "operador";
  } else view.role = e.type;
}

function desktopDashboard() {
  const t=tenant(), trips=ownServices().filter(s=>s.type==="viaje"), fleet=entities("vehiculo").filter(v=>v.owner===t.id), drivers=entities("conductor").filter(d=>d.owner===t.id);
  const list=nonCancelled().filter(b=>b.date===world.date), sales=nonCancelled().filter(b=>String(b.at||"").slice(0,10)===world.date);
  const running=world.trip.status==="running"||world.trip.status==="paused";
  const routeTrip=trips.find(s=>world.trip.route==="legacy"?s.origin==="Cuenca"&&s.destinationName==="Guayaquil":s.origin==="Quito"&&s.destinationName==="Baños de Agua Santa");
  const active=running&&routeTrip?1:0, done=world.trip.status==="arrived"&&routeTrip?1:0;
  const capacity=trips.reduce((n,s)=>n+s.capacity,0), sold=list.reduce((n,b)=>n+b.qty,0);
  const maintenance=fleet.filter(v=>v.state==="mantenimiento").length;
  const alerts=(routeTrip?world.trip.alerts:[]).filter(a=>a.status!=="closed");
  const card=(i,label,value,detail,route)=>link(route,icon(i)+'<div><small>'+label+'</small><strong>'+value+'</strong><small>'+detail+'</small></div>',"dd-card dd-kpi");
  const panel=(title,body,extra="")=>'<section class="dd-card"><div class="dd-title"><b>'+title+'</b>'+extra+'</div>'+body+'</section>';
  const departures=trips.filter(s=>s.state!=="pausado"&&!(done&&s.id===routeTrip?.id)&&!(active&&s.id===routeTrip?.id)).sort((a,b)=>String(a.time).localeCompare(String(b.time))).slice(0,3);
  setTimeout(async()=>{
    const el=document.getElementById("dd-map"); if(!el||!window.L)return;
    const map=L.map(el,{scrollWheelZoom:false}).setView([-1.8,-79],7);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(map);
    if(!routeTrip)return;
    try{
      const data=await (await fetch(world.trip.route==="legacy"?"shared/route.json":"shared/quito-banos.json")).json();
      const {prepareRoad,tripSnapshot}=await import("./shared/trip-core.mjs");
      const road=prepareRoad(data); if(!el.isConnected)return;
      const line=L.polyline(road.coordinates.map(([lng,lat])=>[lat,lng]),{color:"#ffd12b",weight:5}).addTo(map);
      map.fitBounds(line.getBounds(),{padding:[20,20]});
      const marker=L.circleMarker(line.getLatLngs()[0],{radius:8,color:"#111",fillColor:"#ffd12b",fillOpacity:1}).addTo(map).bindPopup(esc(entity(routeTrip.vehicle)?.name||routeTrip.name));
      const tick=()=>{if(!el.isConnected){clearInterval(timer);map.remove();return;}const s=tripSnapshot(world.trip,road);marker.setLatLng([s.position.lat,s.position.lng]);const info=document.getElementById("dd-progress");if(info)info.textContent=Math.round(s.progress*100)+"% · "+(s.remainingMeters/1000).toFixed(1)+" km restantes";};
      const timer=setInterval(tick,1000);tick();
    }catch{el.insertAdjacentHTML("beforeend",'<small class="dd-map-error">Ruta simulada no disponible</small>');}
  },80);
  return `<style>
  .dd-shell{background:#111317;color:#f4f4f5;display:grid;grid-template-columns:205px minmax(0,1fr);gap:16px;padding:16px;min-height:calc(100vh - 85px);font-size:14px}
  .dd-shell a{color:inherit;text-decoration:none}.dd-side{background:#191c22;border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}.dd-side a{padding:13px;border-radius:9px;display:flex;align-items:center;gap:10px}.dd-side a:hover,.dd-side .active{background:#ffd12b;color:#111}.dd-side h3{margin:12px 0}.dd-main{min-width:0}.dd-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px}.dd-head h1{font-size:29px;margin:0;color:#fff}.dd-head small,.dd-card small{color:#b9bbc3;display:block}.dd-card{background:#202329;border:1px solid #343740;border-radius:13px;padding:14px;min-width:0;color:#f4f4f5}.dd-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}.dd-kpi{display:flex;align-items:center;gap:12px}.dd-kpi .icon{color:#ffd12b;width:32px;height:32px;flex-shrink:0}.dd-kpi strong{font-size:30px;display:block;line-height:1.3}.dd-middle{display:grid;grid-template-columns:1.8fr 1fr;gap:12px;margin-bottom:12px}.dd-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:16px}.dd-title a{font-size:12px;color:#ffd12b}.dd-map{height:260px;border-radius:9px;background:#293b36;overflow:hidden}.dd-map .leaflet-tile-pane{filter:brightness(.65) saturate(.75)}.dd-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #3b3e45}.dd-row:last-child{border:0}.dd-row img{width:52px;height:36px;object-fit:cover;border-radius:5px}.dd-row strong{color:#ffd12b}.dd-row .dd-grow{flex:1;min-width:0}.dd-bottom{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.dd-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#72cc69;margin-right:6px}.dd-ring{width:82px;height:82px;border-radius:50%;display:grid;place-items:center;border:9px solid #ffd12b;margin:8px auto;font-size:24px;font-weight:700}.dd-side select{max-width:100%;color:#fff;background:#252830}.dd-shell a:focus-visible{outline:2px solid #ffd12b}.dd-mobile{display:none}@media(max-width:1023px){.dd-shell{display:none}.dd-mobile{display:block}}@media(min-width:1024px) and (max-width:1250px){.dd-shell{grid-template-columns:165px minmax(0,1fr)}.dd-kpi strong{font-size:23px}.dd-bottom{grid-template-columns:repeat(2,minmax(0,1fr))}}
  </style><div class="dd-mobile container">${link("business/overview","Volver al resumen empresarial","button secondary")}</div><div class="dd-shell"><aside class="dd-side"><h2 style="color:#ffd12b;margin:0">RutasEC</h2><small>Conecta Ecuador</small><h3>${esc(t.name)}</h3><select id="tenant-picker" aria-label="Operadora">${entities("operador").map(e=>'<option value="'+esc(e.id)+'" '+(e.id===t.id?'selected':'')+'>'+esc(e.name)+'</option>').join("")}</select>${[["dashboard","home","Inicio"],["calendar","pin","Operación"],["operations","bus","Flota"],["staff","user","Equipo"],["finance","grid","Gestión"],["bookings","ticket","Reservas y QR"],["overview","compass","Resumen general"]].map(([r,i,n])=>link("business/"+r,icon(i)+n,r==="dashboard"?"active":"")).join("")}<small style="margin-top:auto">Datos de demostración · ${esc(world.date)}</small></aside><div class="dd-main"><div class="dd-head"><div><h1>Inicio</h1><small>Centro de operaciones</small></div><small>${esc(world.date)} · ${new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"})} · Administrador demo</small></div><div class="dd-kpis">${card("pin","Viajes programados",trips.length,active+" en curso · "+done+" finalizados","business/calendar")}${card("bus","Vehículos en servicio",active+"/"+fleet.length,maintenance+" en mantenimiento","business/operations")}${card("ticket","Reservas",list.length,(capacity?Math.round(sold/capacity*100):0)+"% ocupación del catálogo","business/bookings")}${card("grid","Ventas del día",money(sales.reduce((n,b)=>n+b.amount,0)),sales.reduce((n,b)=>n+b.qty,0)+" unidades vendidas","business/finance")}</div><div class="dd-middle">${panel("Flota en vivo · simulación",'<div id="dd-map" class="dd-map"></div><small id="dd-progress">'+(routeTrip?esc(routeTrip.name):"Sin ruta de seguimiento asignada a esta operadora")+'</small>',link("tracking","Ver seguimiento ↗"))}${panel("Próximas salidas",departures.map(s=>link("entity/"+s.id,'<strong>'+esc(s.time)+'</strong><div class="dd-grow"><b>'+esc(s.name)+'</b><small>'+esc(entity(s.vehicle)?.name||"Sin vehículo")+'</small></div><small>'+(s.capacity-available(world,s.id,world.date))+'/'+s.capacity+'</small>',"dd-row")).join("")||"<small>Sin salidas disponibles</small>",link("business/calendar","Ver programación →"))}</div><div class="dd-bottom">${panel("Viajes de hoy",'<div class="dd-ring">'+trips.length+'</div><small>En curso: '+active+' · Finalizados: '+done+'</small><small>Catálogo programado: '+Math.max(0,trips.length-active-done)+'</small>')}${panel("Conductores asignados",drivers.slice(0,4).map(d=>'<div class="dd-row">'+icon("user")+'<div><b>'+esc(d.name)+'</b><small>'+esc(entity(d.vehicle)?.plate||"Sin placa")+'</small></div></div>').join("")||"<small>Sin conductores asignados</small>",link("business/staff","Ver equipo"))}${panel("Estado de flota",'<div class="dd-row"><span class="dd-dot"></span>En ruta <b class="right">'+active+'</b></div><div class="dd-row">Disponibles <b class="right">'+fleet.filter(v=>v.state==="disponible"&&!(active&&v.id===routeTrip?.vehicle)).length+'</b></div><div class="dd-row">Mantenimiento <b class="right">'+maintenance+'</b></div>',link("business/operations","Ver flota"))}${panel("Alertas operativas",alerts.map(a=>'<div class="dd-row">'+icon("bell")+'<small>'+esc(a.message||a.type||"Alerta de seguimiento")+'</small></div>').join("")||"<small>Sin alertas activas registradas</small>",link("safety","Seguridad"))}</div></div></div>`;
}

function sidebar() {
  const t = tenant();
  return `<aside class="sidebar"><h3>${esc(t.name)}</h3><p>Espacio empresarial · ${t.mode === "premium" ? "Premium" : "Marketplace"} demo</p>${t.type === "operador" ? '<a class="dd-entry" href="#/business/dashboard">Dashboard desktop</a><style>@media(max-width:1023px){.dd-entry{display:none!important}}</style>' : ""}${tabs.map(([id, i, n]) => link("business/" + id, icon(i) + n, id === view.tab ? "active" : "")).join("")}</aside>`;
}
function companyPicker() {
  return `<div class="toolbar"><label>Empresa de demostración<select id="tenant-picker">${entities(
    tenant().type,
  )
    .map(
      (e) =>
        `<option value="${e.id}" ${e.id === view.tenant ? "selected" : ""}>${esc(e.name)}</option>`,
    )
    .join(
      "",
    )}</select></label><div style="margin-left:auto">${link("entity/" + view.tenant, "Ver ficha pública", "button secondary")}</div></div>`;
}
function stats() {
  const list = nonCancelled(),
    gross = list.reduce((n, b) => n + b.amount, 0),
    units = ownServices().reduce((n, s) => n + s.capacity, 0);
  return `<div class="stats">${[
    [list.length, "Reservas activas", "Marketplace y ventas directas"],
    [money(gross), "Ventas simuladas", "Pagos de demostración"],
    [
      list.reduce((n, b) => n + b.qty, 0),
      "Unidades vendidas",
      "Inventario conectado",
    ],
    [units, "Capacidad del catálogo", "Para cada fecha / franja demo"],
  ]
    .map(
      ([v, k, d]) =>
        `<div class="stat"><small>${k}</small><strong>${v}</strong><p>${d}</p></div>`,
    )
    .join("")}</div>`;
}
function overview() {
  const list = ownBookings();
  return `${stats()}<div class="grid-2"><section class="panel"><h2>Tu operación, en un vistazo.</h2><p class="muted">Reservas de pasajeros y ventas directas comparten el mismo inventario de demostración.</p><div class="toolbar">${link("business/pos", "Nueva venta POS", "button primary")}${link("business/bookings", "Validar QR", "button secondary")}${link("business/catalog", "Gestionar catálogo", "button secondary")}</div><div class="notice">${tenant().type === "hotel" ? "Recepción: confirma QR, registra check-in y check-out. Las habitaciones pasan a limpieza al salir." : tenant().type === "restaurante" ? "Servicio: reservas de mesas, menú, comandas, promociones y caja en un mismo espacio." : tenant().type === "agencia" ? "Experiencias: salidas, cupos, guías, participantes y validación QR conectados." : "Transporte: flota, conductores, salidas, ocupación, abordaje y seguimiento GPS simulado."}</div></section><section class="panel"><h2>Actividad reciente</h2><div class="activity">${
    world.events
      .filter((e) => {
        const subject = entity(e.subject);
        return subject?.owner === view.tenant || subject?.id === view.tenant;
      })
      .slice(-8)
      .reverse()
      .map(
        (e) =>
          `<p>${esc(e.type.replaceAll(".", " · "))}<small>${esc(entity(e.subject)?.name || e.subject)} · ${new Date(e.at).toLocaleTimeString("es-EC")}</small></p>`,
      )
      .join("") ||
    '<p class="muted">Tu actividad aparecerá al reservar, vender o editar un servicio.</p>'
  }</div></section></div>${list.length ? bookingTable(list.slice(-5)) : empty("Tu primera reserva está por llegar", "Cambia a Pasajero para contratar o crea una venta desde el POS.", "business/pos", "Crear venta demo")}`;
}
export function bookingTable(list) {
  return `<section class="panel"><div class="section-title"><h2>Reservas y acceso</h2>${btn("scanner", "Validar QR manual", "", "primary")}</div><div class="table-wrap"><table><thead><tr><th>Servicio / reserva</th><th>Fecha / cantidad</th><th>Estado</th><th>Venta demo</th><th>Operación</th></tr></thead><tbody>${
    list
      .map((b) => {
        const s = entity(b.service);
        return `<tr><td><strong>${esc(s.name)}</strong><small>${esc(b.id.slice(0, 12))} · Viajero demo</small></td><td>${esc(b.date)}<small>${b.qty} unidades ${b.seats?.length ? "· Asientos " + b.seats.join(", ") : ""}</small></td><td>${badge(b.state, b.state === "cancelada" ? "red" : "green")}</td><td>${money(b.amount)}<small>${b.channel === "pos" ? "POS" : "Marketplace"}</small></td><td><div class="toolbar" style="margin:0">${btn("ticket", "QR", b.id, "chip")}${b.state === "confirmada" ? btn("bookingOp", s.type === "habitacion" ? "Check-in" : s.type === "viaje" ? "Abordar" : "Validar", b.id + "|" + (s.type === "habitacion" ? "entrada" : s.type === "viaje" ? "abordar" : "validar"), "chip") : b.state === "alojado" ? btn("bookingOp", "Check-out", b.id + "|salida", "chip") : b.state === "utilizada" ? btn("bookingOp", "Completar", b.id + "|completar", "chip") : ""}${b.state === "confirmada" ? btn("cancelBooking", "Cancelar", b.id, "chip") : ""}</div></td></tr>`;
      })
      .join("") ||
    '<tr><td colspan="5">Todavía no hay reservas demo en esta empresa.</td></tr>'
  }</tbody></table></div></section>`;
}
function catalog() {
  const list = entities().filter(
    (e) =>
      e.owner === view.tenant &&
      [
        "viaje",
        "habitacion",
        "mesa",
        "tour",
        "atraccion",
        "bienestar",
        "noche",
      ].includes(e.type),
  );
  return `<div class="section-title"><h2>${tenant().type === "hotel" ? "Habitaciones y disponibilidad" : tenant().type === "restaurante" ? "Menú y experiencias" : tenant().type === "agencia" ? "Tours y experiencias" : "Salidas publicadas"}</h2>${btn("newService", "Añadir servicio demo", "", "primary")}</div><section class="panel"><div class="table-wrap"><table><thead><tr><th>Servicio</th><th>Precio demo</th><th>Inventario</th><th>Estado</th><th>Editar</th></tr></thead><tbody>${list.map((s) => `<tr><td><strong>${esc(s.name)}</strong><small>${s.time || "Horario flexible"} · ${s.type === "viaje" ? s.modality : types[s.type]}</small></td><td>${money(s.price)}</td><td>${available(world, s.id, world.date)} / ${s.capacity}<small>Disponible en ${world.date}</small></td><td>${badge(s.roomState || s.state, "green")}</td><td>${btn("editService", "Editar", s.id, "chip")} ${link("entity/" + s.id, "Ficha", "chip")}</td></tr>`).join("")}</tbody></table></div></section>${tenant().type === "restaurante" ? menuPanel() : ""}`;
}
function calendar() {
  return `<section class="panel"><h2>Disponibilidad de los próximos 7 días</h2><p class="muted">${world.date} · Cada celda muestra unidades disponibles del inventario demo.</p><div class="table-wrap"><table><thead><tr><th>Servicio</th>${Array.from({ length: 7 }, (_, i) => `<th>${datePlus(world.date, i).slice(5)}</th>`).join("")}</tr></thead><tbody>${ownServices()
    .map(
      (s) =>
        `<tr><td><strong>${esc(s.name)}</strong></td>${Array.from({ length: 7 }, (_, i) => `<td>${badge(available(world, s.id, datePlus(world.date, i)), available(world, s.id, datePlus(world.date, i)) ? "green" : "red")}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></div></section>`;
}
function operations() {
  const type = tenant().type;
  if (type === "operador")
    return `<section class="panel"><h2>Centro de operaciones</h2><p>Mapa, movimiento, abordaje y seguridad del viaje de demostración.</p><div class="toolbar">${link("tracking", "Abrir seguimiento simulado", "button primary")}${link("safety", "Seguridad y SOS", "button secondary")}${btn("newVehicle", "Añadir vehículo", "", "secondary")}</div><div class="grid-3">${entities(
      "vehiculo",
    )
      .filter((v) => v.owner === view.tenant)
      .map(
        (v) =>
          `<div class="panel"><img src="${photo(v)}" alt="Vehículo referencial" style="height:100px;object-fit:contain;margin-bottom:15px"><h3>${esc(v.name)}</h3><p>${v.capacity} plazas · ${esc(v.plate || "DEMO")}</p>${badge(v.state, "green")}<p><small>${esc(entities("conductor").find((d) => d.vehicle === v.id)?.name || "Conductor demo por asignar")}</small></p>${btn("resourceState", v.state === "mantenimiento" ? "Marcar disponible" : "Mantenimiento", v.id, "chip")}</div>`,
      )
      .join(
        "",
      )}</div></section>${world.requests.length ? `<section class="panel"><h2>Solicitudes privadas · Mercado de propuestas demo</h2>${world.requests.map((r) => `<div class="list-item"><div><strong>${esc(r.origin)} · ${esc(r.destination)}</strong><small>${esc(r.state)} · ${r.offers.length} propuestas</small></div>${btn("operatorOffer", "Enviar propuesta demo", r.id, "secondary right")}</div>`).join("")}</section>` : ""}`;
  if (type === "hotel")
    return `<section class="panel"><h2>Recepción y estado de habitaciones</h2><div class="grid-3">${ownServices()
      .filter((s) => s.type === "habitacion")
      .map(
        (s) =>
          `<div class="panel"><div class="eyebrow">${esc(s.id)}</div><h3>${esc(s.name)}</h3><p>${badge(s.roomState || "disponible", s.roomState === "limpieza" ? "yellow" : "green")}</p><small class="muted">${available(world, s.id, world.date)} unidades disponibles para reservar</small>${s.roomState === "limpieza" ? btn("cleanRoom", "Marcar limpieza terminada", s.id, "secondary") : ""}</div>`,
      )
      .join(
        "",
      )}</div><p class="notice">QR validado → check-in → ocupada. Check-out → limpieza. Limpieza terminada → disponible.</p></section>${bookingTable(ownBookings())}`;
  if (type === "restaurante")
    return `<section class="panel"><div class="section-title"><h2>Comandas y servicio</h2>${btn("newOrder", "Nueva comanda demo", "", "primary")}</div><div class="grid-3">${
      world.orders
        .filter((o) => o.owner === view.tenant)
        .map(
          (o) =>
            `<div class="panel"><div class="eyebrow">Mesa ${o.table}</div><h3>${esc(o.product)}</h3><p>${o.qty} unidades · ${money(o.amount)}</p>${badge(o.state, "green")}<div class="toolbar">${o.state !== "servida" ? btn("orderState", o.state === "pendiente" ? "En preparación" : "Marcar servida", o.id, "secondary") : ""}</div></div>`,
        )
        .join("") ||
      '<p class="muted">Crea una comanda controlada para ver el flujo cocina → servicio.</p>'
    }</div></section>${bookingTable(ownBookings())}`;
  return `<section class="panel"><h2>Guías y participantes</h2>${entities(
    "guia",
  )
    .filter((g) => g.owner === view.tenant)
    .map(
      (g) =>
        `<div class="list-item">${icon("user")}<div><strong>${esc(g.name)}</strong><small>Guía de demostración · Asignación local</small></div></div>`,
    )
    .join(
      "",
    )}<div class="toolbar">${btn("invite", "Invitar guía demo", "", "secondary")}${link("business/calendar", "Ver calendario de tours", "button secondary")}</div></section>${bookingTable(ownBookings())}`;
}
function menuPanel() {
  const products = entities("producto").filter((p) => p.owner === view.tenant);
  return `<section class="panel"><div class="section-title"><h2>Productos y menú</h2>${btn("newProduct", "Añadir producto", "", "secondary")}</div>${products.map((p) => `<div class="list-item"><div><strong>${esc(p.name)}</strong><small>${money(p.price)} · ${p.stock} unidades demo</small></div>${btn("editService", "Editar", p.id, "chip right")}</div>`).join("") || '<p class="muted">Añade productos para mostrar comandas y ventas de cocina.</p>'}</section>`;
}
function pos() {
  return `<section class="panel"><div class="eyebrow">VENTA DIRECTA · MISMO INVENTARIO</div><h2>El mostrador también está conectado.</h2><p>Selecciona un servicio, confirma el cobro ficticio e imprime el mismo QR que usa el pasajero digital.</p><form id="pos-form"><label>Servicio<select name="service">${ownServices()
    .map(
      (s) =>
        `<option value="${s.id}">${esc(s.name)} · ${money(s.price)}</option>`,
    )
    .join(
      "",
    )}</select></label><div class="form-actions"><button class="primary" type="submit">Nueva venta simulada</button></div></form><div class="notice">POS usa el inventario de marketplace. No se procesa dinero ni se emiten documentos fiscales.</div></section>${bookingTable(ownBookings().filter((b) => b.channel === "pos"))}`;
}
function staff() {
  return `<section class="panel"><div class="section-title"><h2>Tu equipo, conectado.</h2>${btn("invite", "Invitar empleado demo", "", "primary")}</div><div class="list-item">${icon("user")}<div><strong>Cuenta madre · Administrador demo</strong><small>Gestión de catálogo, reservas, ventas y personal de esta empresa</small></div>${badge("Propietario", "green")}</div>${world.invites
    .filter((i) => i.owner === view.tenant)
    .map(
      (i) =>
        `<div class="list-item">${icon("user")}<div><strong>${esc(i.name)}</strong><small>${esc(i.role)} · ${esc(i.state)}</small></div>${btn("inviteLink", "Ver invitación", i.id, "chip right")}</div>`,
    )
    .join(
      "",
    )}<p class="notice">Permisos y cuentas hijas simulados. No se envían correos ni mensajes reales.</p></section>`;
}
function finance() {
  const list = ownBookings(),
    gross = list
      .filter((b) => b.state !== "cancelada")
      .reduce((n, b) => n + b.amount, 0),
    refunds = list
      .filter((b) => b.state === "cancelada")
      .reduce((n, b) => n + b.amount, 0),
    commission = list
      .filter((b) => b.state !== "cancelada" && b.channel !== "pos")
      .reduce((n, b) => n + (b.amount * world.settings.commission) / 100, 0);
  return `${stats()}<section class="panel"><h2>Resumen financiero demo</h2><div class="list-item">Ventas netas simuladas<strong class="right">${money(gross)}</strong></div><div class="list-item">Reembolsos simulados<strong class="right">${money(refunds)}</strong></div><div class="list-item">Comisión marketplace · ${world.settings.commission}% demo<strong class="right">${money(commission)}</strong></div><div class="list-item">Ingreso estimado demo<strong class="right">${money(gross - commission)}</strong></div><p class="muted">Las ventas POS no tienen comisión comercial en esta simulación. Tarifas, liquidación y suscripciones no representan un contrato.</p>${btn("exportSales", "Exportar ventas CSV", "", "secondary")}</section>${bookingTable(list)}`;
}
function settings() {
  const t = tenant();
  return `<section class="panel"><h2>La identidad de tu empresa.</h2><p class="muted">Los cambios se reflejan en su ficha y catálogo público de la demo.</p><form id="company-form"><div class="form-grid"><label>Nombre comercial<input name="name" required maxlength="100" value="${esc(t.name)}"></label><label>Modalidad<select name="mode">${["directorio", "marketplace", "premium"].map((m) => `<option ${m === t.mode ? "selected" : ""}>${m}</option>`).join("")}</select></label><label class="full">Descripción<textarea name="description" maxlength="800">${esc(t.description)}</textarea></label><label>Portada ilustrativa<select name="photo">${["hotel", "restaurant", "banos", "sprinter", "suv", "road-cinematic"].map((p) => `<option ${t.photo === p ? "selected" : ""}>${p}</option>`).join("")}</select></label><label>Contacto demo<input name="contact" value="${esc(t.contact || "Contacto de demostración")}" maxlength="100"></label></div><div class="form-actions"><button class="primary" type="submit">Actualizar ficha demo</button></div></form></section><div class="banner">${icon("grid")}<div><h3>Más negocios. Un mismo ecosistema.</h3><p>Onboarding simple para incorporar una nueva empresa de demostración.</p></div>${btn("onboarding", "Crear empresa demo", "", "secondary")}</div>`;
}
function serviceForm(id, type) {
  const e = id ? entity(id) : null;
  type =
    type ||
    e?.type ||
    {
      operador: "viaje",
      hotel: "habitacion",
      restaurante: "mesa",
      agencia: "tour",
    }[tenant().type];
  modal(
    `<div class="eyebrow">CATÁLOGO EMPRESARIAL DEMO</div><h2>${e ? "Editar" : "Crear"} ${types[type] || type}</h2><form id="service-form" data-id="${id || ""}" data-type="${type}"><div class="form-grid"><label class="full">Nombre<input name="name" required maxlength="100" value="${esc(e?.name || "")}"></label><label>Precio USD demo<input type="number" name="price" min="0" step=".01" value="${e?.price || 10}" required></label><label>${type === "producto" ? "Stock" : "Capacidad por fecha"}<input type="number" name="capacity" min="1" max="200" value="${e?.capacity || e?.stock || 8}" required></label><label>Hora demo<input type="time" name="time" value="${e?.time || "09:00"}"></label><label>Estado<select name="state"><option>activo</option><option ${e?.state === "pausado" ? "selected" : ""}>pausado</option></select></label>${type === "viaje" ? `<label>Origen<input name="origin" value="${esc(e?.origin || "Quito")}" required></label><label>Destino<input name="destinationName" value="${esc(e?.destinationName || "Baños de Agua Santa")}" required></label>` : ""}<label class="full">Descripción<textarea name="description" maxlength="600">${esc(e?.description || "Servicio de demostración")}</textarea></label></div><div class="form-actions"><button class="primary" type="submit">Guardar y publicar demo</button></div></form>`,
  );
}
function inviteForm() {
  modal(
    `<h2>Invita a tu equipo</h2><p>Enlace simulado que funciona dentro de este navegador. No se envían invitaciones reales.</p><form id="invite-form"><div class="form-grid"><label>Nombre demo<input name="name" value="Empleado demo" required maxlength="60"></label><label>Permiso<select name="role"><option>Recepción</option><option>Conductor</option><option>Guía</option><option>Caja</option><option>Gestor de catálogo</option></select></label></div><div class="form-actions"><button class="primary">Crear invitación demo</button></div></form>`,
  );
}
function showInvitation(id) {
  const i = world.invites.find((i) => i.id === id);
  modal(
    `<h2>Invitación de demostración</h2><p>${esc(i.name)} · ${esc(i.role)} · ${esc(entity(i.owner).name)}</p><p class="notice">Acceso controlado a este espacio empresarial. No existe una cuenta externa real.</p><div class="form-actions">${btn("acceptInvite", "Aceptar invitación demo", id, "primary")}</div>`,
  );
}
Object.assign(actions, {
  editService: ({ id }) => serviceForm(id),
  newService: () => serviceForm(),
  newProduct: () => serviceForm(null, "producto"),
  invite: inviteForm,
  inviteLink: ({ id }) => showInvitation(id),
  acceptInvite: ({ id }) => {
    const i = world.invites.find((i) => i.id === id);
    transact("invitacion", (w) => {
      w.invites.find((i) => i.id === id).state = "aceptada";
      event(w, "personal.invitacionAceptada", i.owner, { role: i.role });
    });
    view.tenant = i.owner;
    view.role = entity(i.owner).type;
    close();
    go("business");
    toast("Perfil empresarial demo activado");
  },
  cleanRoom: ({ id }) => {
    edit(id, { roomState: "disponible" }, actor());
    toast("Limpieza terminada. Habitación disponible.");
  },
  resourceState: ({ id }) => {
    edit(
      id,
      {
        state:
          entity(id).state === "mantenimiento" ? "disponible" : "mantenimiento",
      },
      actor(),
    );
    toast("Estado de flota actualizado");
  },
  newVehicle: () =>
    modal(
      `<h2>Nuevo recurso de flota</h2><form id="vehicle-form"><div class="form-grid"><label>Vehículo demo<input name="name" required value="Van de demostración"></label><label>Plazas<input name="capacity" type="number" min="1" max="60" required value="12"></label><label>Conductor demo<input name="driver" required value="Conductor demo"></label><label>Identificador<input name="plate" required value="DEMO-200"></label></div><div class="form-actions"><button class="primary">Guardar recurso demo</button></div></form>`,
    ),
  newOrder: () =>
    modal(
      `<h2>Nueva comanda demo</h2><form id="order-form"><div class="form-grid"><label>Mesa<input name="table" type="number" min="1" max="20" required value="1"></label><label>Producto<select name="product">${(entities("producto").filter((p) => p.owner === view.tenant).length ? entities("producto").filter((p) => p.owner === view.tenant) : [{ id: "default", name: "Menú de temporada demo" }]).map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></label><label>Cantidad<input name="qty" type="number" min="1" max="20" value="2" required></label></div><div class="form-actions"><button class="primary">Enviar comanda demo</button></div></form>`,
    ),
  orderState: ({ id }) => {
    transact("comanda", (w) => {
      const o = w.orders.find((o) => o.id === id);
      if (o.owner !== view.tenant) throw Error("La comanda es de otra empresa");
      o.state = o.state === "pendiente" ? "preparación" : "servida";
      event(w, "comanda." + o.state, o.owner, { order: id });
    });
    toast("Estado de cocina actualizado");
  },
  exportSales: () =>
    download(
      "ventas-demo.csv",
      "reserva,fecha,servicio,estado,monto,canal\n" +
        ownBookings()
          .map((b) =>
            [
              b.id,
              b.date,
              JSON.stringify(entity(b.service).name),
              b.state,
              b.amount,
              b.channel,
            ].join(","),
          )
          .join("\n"),
      "text/csv",
    ),
  onboarding: () =>
    modal(
      `<h2>Tu negocio, conectado a RutasEC.</h2><p>Registro simple de una empresa ficticia para la presentación.</p><form id="onboarding-form"><div class="form-grid"><label>Nombre<input name="name" required maxlength="100" placeholder="Mi empresa demo"></label><label>Actividad<select name="type"><option value="operador">Transporte</option><option value="hotel">Hospedaje</option><option value="restaurante">Gastronomía</option><option value="agencia">Agencia</option></select></label><label>Modalidad<select name="mode"><option value="directorio">Directorio gratuito</option><option value="marketplace">Marketplace</option><option value="premium">Premium</option></select></label></div><div class="form-actions"><button class="primary">Crear mi espacio demo</button></div></form>`,
    ),
  operatorOffer: ({ id }) =>
    modal(
      `<h2>Propón tu servicio</h2><form id="operator-offer-form" data-id="${id}"><label>Precio total USD demo<input name="price" type="number" min="1" value="165" required></label><label>Condiciones<input name="conditions" value="Van, equipaje y una parada demo" required maxlength="200"></label><div class="form-actions"><button class="primary">Enviar propuesta simulada</button></div></form>`,
    ),
});
document.addEventListener("change", (e) => {
  if (e.target.id === "tenant-picker") {
    view.tenant = e.target.value;
    render();
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (
    ![
      "company-form",
      "service-form",
      "pos-form",
      "invite-form",
      "vehicle-form",
      "order-form",
      "onboarding-form",
      "operator-offer-form",
    ].includes(f.id)
  )
    return;
  e.preventDefault();
  try {
    const d = Object.fromEntries(new FormData(f));
    if (f.id === "pos-form") {
      const m = await import("./marketplace.js");
      return m.checkout(d.service, "pos");
    }
    if (f.id === "company-form") edit(view.tenant, d, actor());
    if (f.id === "service-form") {
      const patch = {
        ...d,
        price: Number(d.price),
        capacity: Number(d.capacity),
        bookable: d.state !== "pausado",
      };
      if (f.dataset.type === "producto") patch.stock = patch.capacity;
      if (f.dataset.id) {
        const old = entity(f.dataset.id),
          used = old.capacity - available(world, old.id, world.date);
        if (patch.capacity < used)
          throw Error("La capacidad no puede ser inferior a lo reservado");
        edit(f.dataset.id, patch, actor());
      } else
        transact("catalogo", (w) => {
          const id = uid("service"),
            type = f.dataset.type;
          w.entities[id] = {
            id,
            type,
            ...patch,
            owner: view.tenant,
            destination: "banos",
            mode: "marketplace",
            photo:
              type === "habitacion"
                ? "hotel"
                : type === "mesa" || type === "producto"
                  ? "restaurant"
                  : type === "viaje"
                    ? "sprinter"
                    : "banos",
            modality: type === "viaje" ? "compartido" : undefined,
            scope: "Interprovincial",
            roomState: "disponible",
          };
          relation(w, id, view.tenant, "ofrecidoPor");
          event(w, "catalogo.creado", id);
        });
    }
    if (f.id === "invite-form") {
      let id;
      transact("personal", (w) => {
        id = uid("invite");
        w.invites.push({ id, ...d, owner: view.tenant, state: "invitada" });
        event(w, "personal.invitado", view.tenant, { role: d.role });
      });
      return showInvitation(id);
    }
    if (f.id === "vehicle-form")
      transact("flota", (w) => {
        const id = uid("veh");
        w.entities[id] = {
          id,
          type: "vehiculo",
          name: d.name,
          capacity: Number(d.capacity),
          plate: d.plate,
          owner: view.tenant,
          state: "disponible",
          photo: "minivan",
        };
        const driver = uid("driver");
        w.entities[driver] = {
          id: driver,
          type: "conductor",
          name: d.driver,
          owner: view.tenant,
          vehicle: id,
        };
        relation(w, id, view.tenant, "propiedadDe");
        event(w, "flota.creada", id);
      });
    if (f.id === "order-form")
      transact("comanda", (w) => {
        const p = w.entities[d.product];
        const qty = Number(d.qty);
        if (p && p.stock < qty) throw Error("No hay suficiente stock demo");
        if (p) p.stock -= qty;
        w.orders.push({
          id: uid("order"),
          owner: view.tenant,
          table: d.table,
          product: p?.name || "Menú de temporada demo",
          qty,
          amount: qty * (p?.price || 18),
          state: "pendiente",
        });
        event(w, "comanda.creada", view.tenant, { qty });
      });
    if (f.id === "onboarding-form") {
      let id;
      transact("onboarding", (w) => {
        id = uid("business");
        w.entities[id] = {
          id,
          ...d,
          state: "activo",
          destination: "banos",
          photo:
            d.type === "hotel"
              ? "hotel"
              : d.type === "restaurante"
                ? "restaurant"
                : "banos",
          description: "Empresa ficticia creada durante la muestra.",
        };
        relation(w, id, "banos", "ubicadoEn");
        event(w, "empresa.registrada", id);
      });
      view.tenant = id;
      view.role = d.type;
      view.tab = "settings";
    }
    if (f.id === "operator-offer-form")
      transact("oferta", (w) => {
        const r = w.requests.find((r) => r.id === f.dataset.id);
        if (r.state === "reservada")
          throw Error("El pasajero ya eligió una propuesta");
        r.offers.push({
          id: uid("offer"),
          owner: view.tenant,
          price: Number(d.price),
          vehicle: "Vehículo demo del operador",
          conditions: d.conditions,
        });
        r.state = "recibiendo propuestas";
        event(w, "privado.propuesta", r.id, { owner: view.tenant });
      });
    close();
    render();
    toast("Operación simulada guardada. Todas las vistas usan el mismo mundo.");
  } catch (err) {
    toast(err.message);
  }
});
export async function renderBusiness(route, arg) {
  if (route === "gad" || route === "admin") {
    const m = await import("./territory.js");
    return m.renderTerritory(route, arg);
  }
  setBusinessRole();
  view.tab = arg || "overview";
  if(view.tab==="dashboard" && tenant().type==="operador") return desktopDashboard();
  let html;
  if (view.tab === "campaigns" || view.tab === "reputation") {
    const m = await import("./promotion.js");
    html =
      view.tab === "campaigns"
        ? m.campaignPanel(view.tenant)
        : m.reputationPanel(view.tenant);
  } else
    html = (
      {
        overview,
        bookings: () => bookingTable(ownBookings()),
        catalog,
        calendar,
        operations,
        pos,
        staff,
        finance,
        settings,
      }[view.tab] || overview
    )();
  const names = {
    operador: "Transporte",
    hotel: "Hospedaje",
    restaurante: "Gastronomía",
    agencia: "Experiencias",
  };
  return `<div class="container"><div class="dashboard">${sidebar()}<div>${heading(names[tenant().type] + " · GESTIÓN EMPRESARIAL", tabs.find((t) => t[0] === view.tab)?.[2] || "Tu negocio, conectado.", "Operaciones simuladas en tu espacio empresarial.")} ${companyPicker()}${html}</div></div></div>`;
}
