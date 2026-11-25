import {
  world,
  entity,
  entities,
  bookings,
  transact,
  event,
  relation,
  exportWorld,
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
  heading,
  modal,
  close,
  toast,
  actions,
  download,
  types,
} from "./ui.js";
import { view, render } from "./app.js";
import { campaignPanel } from "./promotion.js";
let adminTab = "overview",
  gadTab = "overview",
  importRows = [],
  importColumns = [],
  importPreview = [];
const norm = (v) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
function metrics() {
  const active = bookings().filter((b) => b.state !== "cancelada");
  return `<div class="stats">${[
    [entities("destino").length, "Destinos conectados"],
    [
      entities().filter((e) =>
        ["hotel", "restaurante", "agencia", "operador"].includes(e.type),
      ).length,
      "Negocios del catálogo",
    ],
    [active.length, "Reservas demo activas"],
    [
      money(active.reduce((n, b) => n + b.amount, 0)),
      "Movimiento económico demo",
    ],
  ]
    .map(
      ([v, n]) =>
        `<div class="stat"><small>${n}</small><strong>${v}</strong><p>Datos del escenario de demostración</p></div>`,
    )
    .join("")}</div>`;
}
function gadOverview() {
  const categories = [
    ["Hospedaje", "habitacion"],
    ["Gastronomía", "mesa"],
    ["Experiencias", "tour"],
    ["Transporte", "viaje"],
  ];
  return `${metrics()}<div class="grid-2"><section class="panel"><h2>Un territorio conectado crea oportunidades.</h2><p class="muted">Demanda y reservas agregadas. Este panel no muestra identidades ni datos privados del viajero.</p><div class="bars">${categories
    .map(([n, t]) => {
      const count = bookings().filter(
        (b) => entity(b.service)?.type === t && b.state !== "cancelada",
      ).length;
      return `<div style="height:${Math.min(100, 8 + count * 15)}%"><small>${n} · ${count}</small></div>`;
    })
    .join(
      "",
    )}</div><div class="toolbar">${link("entity/banos", "Ver ficha territorial", "button primary")}${btn("gadTab", "Editar territorio", "content", "secondary")}</div></section><section class="panel"><h2>Del viaje al desarrollo local.</h2><div class="list-item">Viajes hacia Baños<strong class="right">${bookings().filter((b) => entity(b.service)?.destination === "banos" && entity(b.service)?.type === "viaje").length}</strong></div><div class="list-item">Impresiones demo<strong class="right">${world.campaigns.reduce((n, c) => n + c.impressions, 0)}</strong></div><div class="list-item">Interacciones demo<strong class="right">${world.campaigns.reduce((n, c) => n + c.clicks, 0)}</strong></div><div class="list-item">Conversiones demo<strong class="right">${world.campaigns.reduce((n, c) => n + c.conversions, 0)}</strong></div><p class="notice">Métricas agregadas de un escenario controlado. No representan turismo ni economía reales.</p></section></div>`;
}
function territorialContent() {
  const e = entity("banos");
  return `<section class="panel"><h2>La historia de tu territorio.</h2><form id="territory-form"><div class="form-grid"><label>Nombre del destino<input name="name" required value="${esc(e.name)}"></label><label>Categoría<input name="category" required value="${esc(e.category)}"></label><label class="full">Descripción<textarea name="description" maxlength="1000" required>${esc(e.description)}</textarea></label><label>Portada ilustrativa<select name="photo"><option>banos</option><option>road-cinematic</option></select></label></div><div class="form-actions"><button class="primary">Publicar ficha demo</button></div></form></section><section class="panel"><div class="section-title"><h2>Eventos y circuitos</h2>${btn("newTerritorial", "Crear contenido demo", "", "secondary")}</div>${entities()
    .filter((e) => e.type === "evento" || e.type === "circuito")
    .map(
      (e) =>
        `<div class="list-item"><div><strong>${esc(e.name)}</strong><small>${types[e.type] || "Circuito"} · ${e.date || "Conexión demo"}</small></div>${link(e.type === "circuito" ? "discover" : "entity/" + e.id, "Ver contenido", "chip right")}</div>`,
    )
    .join("")}</section>`;
}
function entityTable(list) {
  return `<section class="panel"><div class="table-wrap"><table><thead><tr><th>Entidad</th><th>Tipo</th><th>Estado / plan</th><th>Relaciones</th><th>Vista</th></tr></thead><tbody>${list.map((e) => `<tr><td><strong>${esc(e.name || e.id)}</strong><small>${esc(e.id)}</small></td><td>${esc(types[e.type] || e.type)}</td><td>${badge(e.mode || e.state || "demo")}</td><td>${world.relations.filter((r) => r.source === e.id || r.target === e.id).length}</td><td>${btn("inspectEntity", "Inspeccionar", e.id, "chip")} ${link("entity/" + e.id, "Ficha", "chip")}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function adminOverview() {
  return `${metrics()}<div class="grid-2"><section class="panel"><h2>Un solo mundo. Todas las operaciones.</h2><div class="list-item">Entidades<strong class="right">${entities().length}</strong></div><div class="list-item">Relaciones tipadas<strong class="right">${world.relations.length}</strong></div><div class="list-item">Eventos append-only<strong class="right">${world.events.length}</strong></div><div class="list-item">Revisión del escenario<strong class="right">${world.revision}</strong></div><div class="toolbar">${btn("adminTab", "Explorar entidades", "entities", "primary")}${btn("exportWorld", "Exportar mundo JSON", "", "secondary")}</div></section><section class="panel"><h2>Actividad del ecosistema</h2><div class="activity">${
    world.events
      .slice(-10)
      .reverse()
      .map(
        (e) =>
          `<p>${esc(e.type)}<small>${esc(e.subject)} · ${new Date(e.at).toLocaleTimeString("es-EC")}</small></p>`,
      )
      .join("") || "<p>Los eventos de las operaciones aparecerán aquí.</p>"
  }</div></section></div>`;
}
function importPanel() {
  return `<section class="panel"><div class="eyebrow">DIRECTORIO · DATOS DEMO</div><h2>De una hoja de cálculo a un territorio conectado.</h2><p class="muted">Importa CSV o Excel, asigna columnas, normaliza y revisa duplicados antes de publicar fichas de directorio.</p><label>Archivo CSV / XLSX<input id="import-file" type="file" accept=".csv,.xlsx,.xls"></label><div class="toolbar">${btn("sampleImport", "Cargar muestra controlada", "", "primary")}${btn("importTemplate", "Descargar plantilla Excel", "", "secondary")}</div><div class="notice">Fuentes representadas: ANT, SEPS, Supercias, GAD, cámaras y directorios. La muestra es ficticia, no un catastro oficial.</div></section><section id="import-mapping" class="panel" ${importRows.length ? "" : "hidden"}>${mappingForm()}</section><section id="import-preview"></section>`;
}
function mappingForm() {
  if (!importRows.length) return "";
  return `<h2>Asigna columnas</h2><p>${importRows.length} filas leídas</p><form id="mapping-form"><div class="form-grid">${[
    ["name", "Nombre"],
    ["type", "Tipo de entidad"],
    ["externalId", "Identificador / RUC demo"],
    ["location", "Ubicación"],
  ]
    .map(
      ([k, n]) =>
        `<label>${n}<select name="${k}"><option value="">No asignar</option>${importColumns.map((c) => `<option value="${esc(c)}" ${norm(c) === norm({ name: "Nombre", type: "Tipo", externalId: "Identificador", location: "Ubicacion" }[k]) ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></label>`,
    )
    .join(
      "",
    )}<label>Procedencia<select name="source"><option>Muestra ficticia</option><option>ANT · archivo aportado</option><option>SEPS · archivo aportado</option><option>Supercias · archivo aportado</option><option>GAD · archivo aportado</option><option>Cámara de turismo · archivo aportado</option><option>Directorio local · archivo aportado</option></select></label></div><div class="form-actions"><button class="primary">Normalizar y previsualizar</button></div></form>`;
}
function classify(v) {
  const t = norm(v);
  if (/hotel|hostal|alojamiento/.test(t)) return "hotel";
  if (/rest|cafe|gastr/.test(t)) return "restaurante";
  if (/agencia|operador turist/.test(t)) return "agencia";
  if (/trans|cooperativa|operador/.test(t)) return "operador";
  if (/atraccion|cascada/.test(t)) return "atraccion";
  return "comercio";
}
export function parseCSV(text) {
  const sep = text.split(/\r?\n/)[0].includes(";") ? ";" : ",";
  let rows = [],
    row = [],
    value = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === sep && !quoted) {
      row.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(value);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  row.push(value);
  if (row.some((v) => v.trim())) rows.push(row);
  if (quoted) throw Error("El CSV tiene comillas sin cerrar");
  const headers = (rows.shift() || []).map((h) =>
    h.replace(/^\uFEFF/, "").trim(),
  );
  return rows.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] || ""])),
  );
}
function loadRows(rows) {
  if (!rows.length) throw Error("No hay filas para importar");
  if (rows.length > 500)
    throw Error("La muestra admite hasta 500 filas por carga");
  importRows = rows;
  importColumns = Object.keys(rows[0]);
  render();
}
Object.assign(actions, {
  gadTab: ({ id }) => {
    gadTab = id;
    render();
  },
  adminTab: ({ id }) => {
    adminTab = id;
    render();
  },
  exportWorld: () => download("rutasec-mundo-demo.json", exportWorld()),
  inspectEntity: ({ id }) => {
    const e = entity(id);
    modal(
      `<h2>Entidad del mundo demo</h2><p>${esc(e.name || e.id)} · ${esc(e.type)}</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:.75rem;background:#f2f5f3;padding:18px;border-radius:12px;max-height:260px;overflow:auto">${esc(JSON.stringify(e, null, 2))}</pre><h3>Relaciones tipadas</h3>${world.relations
        .filter((r) => r.source === id || r.target === id)
        .slice(0, 12)
        .map(
          (r) =>
            `<p><small>${esc(r.type)} · ${link("entity/" + (r.source === id ? r.target : r.source), esc(entity(r.source === id ? r.target : r.source)?.name || r.target), "text-link")}</small></p>`,
        )
        .join(
          "",
        )}<div class="form-actions">${btn("ngsiExport", "Exportar contrato NGSI-LD", id, "secondary")}</div>`,
    );
  },
  ngsiExport: ({ id }) => {
    const e = entity(id),
      doc = {
        "@context": [
          "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
        ],
        id: "urn:ngsi-ld:" + e.type + ":" + e.id,
        type: e.type,
        name: { type: "Property", value: e.name || e.id },
        state: {
          type: "Property",
          value: e.state || "demo",
          observedAt: e.updatedAt || world.updatedAt,
        },
      };
    world.relations
      .filter((r) => r.source === id)
      .forEach(
        (r, i) =>
          (doc["relation" + i] = {
            type: "Relationship",
            object: "urn:ngsi-ld:" + entity(r.target)?.type + ":" + r.target,
          }),
      );
    download(e.id + "-ngsi-ld.json", JSON.stringify(doc, null, 2));
  },
  newTerritorial: () =>
    modal(
      `<h2>Una nueva razón para descubrir.</h2><form id="territorial-new-form"><div class="form-grid"><label>Nombre<input name="name" required maxlength="100" value="Encuentro cultural de Baños · demo"></label><label>Contenido<select name="type"><option value="evento">Evento</option><option value="circuito">Circuito</option></select></label><label>Fecha demo<input name="date" type="date" required value="${world.date}"></label><label>Descripción<textarea name="description" maxlength="500">Contenido simulado para la presentación.</textarea></label></div><div class="form-actions"><button class="primary">Publicar contenido demo</button></div></form>`,
    ),
  sampleImport: () =>
    loadRows([
      {
        Nombre: "Hostal Sendero Demo",
        Tipo: "Hotel",
        Identificador: "DEMO-001",
        Ubicacion: "Baños",
      },
      {
        Nombre: "Sabores del Río Demo",
        Tipo: "Restaurante",
        Identificador: "DEMO-002",
        Ubicacion: "Baños",
      },
      {
        Nombre: "Hostal Sendero Demo",
        Tipo: "Hotel",
        Identificador: "DEMO-001",
        Ubicacion: "Baños",
      },
      {
        Nombre: "Aventura Verde Demo",
        Tipo: "Agencia",
        Identificador: "DEMO-003",
        Ubicacion: "Baños",
      },
    ]),
  importTemplate: () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        {
          Nombre: "Negocio de muestra",
          Tipo: "Hotel",
          Identificador: "DEMO-001",
          Ubicacion: "Baños",
        },
      ]),
      "Directorio demo",
    );
    XLSX.writeFile(wb, "plantilla-rutasec-demo.xlsx");
  },
  publishImport: () => {
    const rows = importPreview.filter((r) => r.status === "Lista");
    if (!rows.length) return toast("No hay nuevas fichas para publicar");
    transact("importacion", (w) => {
      for (const row of rows) {
        const duplicate = Object.values(w.entities).some(
          (e) =>
            (row.externalId && e.externalId === row.externalId) ||
            (norm(e.name) === norm(row.name) && e.type === row.type),
        );
        if (duplicate) continue;
        const id = uid("import");
        w.entities[id] = {
          id,
          type: row.type,
          name: row.name,
          externalId: row.externalId,
          location: row.location,
          destination: "banos",
          mode: "directorio",
          state: "activo",
          provenance: row.source,
          description:
            "Ficha importada de datos de demostración. Procedencia: " +
            row.source +
            ". Sin verificación legal ni afiliación.",
          photo:
            row.type === "hotel"
              ? "hotel"
              : row.type === "restaurante"
                ? "restaurant"
                : "banos",
        };
        relation(w, id, "banos", "ubicadoEn");
        event(w, "directorio.importado", id, { source: row.source });
      }
    });
    importRows = [];
    importPreview = [];
    render();
    toast("Fichas de directorio publicadas. Duplicados omitidos.");
  },
});
document.addEventListener("change", async (e) => {
  if (e.target.id !== "import-file") return;
  try {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2000000) throw Error("Usa un archivo de hasta 2 MB");
    if (/\.csv$/i.test(file.name)) loadRows(parseCSV(await file.text()));
    else {
      const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
      loadRows(
        XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }),
      );
    }
  } catch (err) {
    toast(err.message);
  }
});
document.addEventListener("submit", (e) => {
  const f = e.target;
  if (
    ![
      "territory-form",
      "territorial-new-form",
      "mapping-form",
      "commission-form",
    ].includes(f.id)
  )
    return;
  e.preventDefault();
  try {
    const d = Object.fromEntries(new FormData(f));
    if (f.id === "mapping-form") {
      if (!d.name) throw Error("Asigna la columna de nombre");
      const seen = new Set();
      importPreview = importRows.map((r) => {
        const name = String(r[d.name] || "")
            .trim()
            .replace(/\s+/g, " "),
          type = classify(r[d.type]),
          externalId = String(r[d.externalId] || "").trim(),
          key = externalId || norm(name) + "|" + type;
        const duplicate =
          seen.has(key) ||
          entities().some(
            (e) =>
              (externalId && e.externalId === externalId) ||
              (norm(e.name) === norm(name) && e.type === type),
          );
        seen.add(key);
        return {
          name,
          type,
          externalId,
          location: r[d.location] || "Baños",
          source: d.source,
          status: !name ? "Sin nombre" : duplicate ? "Duplicado" : "Lista",
        };
      });
      $("#import-preview").innerHTML =
        `<div class="panel"><h2>Vista previa normalizada</h2><div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Clasificación</th><th>ID</th><th>Estado</th></tr></thead><tbody>${importPreview.map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(types[r.type] || r.type)}</td><td>${esc(r.externalId)}</td><td>${badge(r.status, r.status === "Lista" ? "green" : "yellow")}</td></tr>`).join("")}</tbody></table></div><div class="form-actions">${btn("publishImport", "Publicar " + importPreview.filter((r) => r.status === "Lista").length + " fichas demo", "", "primary")}</div></div>`;
      return;
    }
    transact("territorio", (w) => {
      if (f.id === "territory-form") {
        Object.assign(w.entities.banos, d);
        event(w, "territorio.modificado", "banos");
      }
      if (f.id === "territorial-new-form") {
        const id = uid(d.type);
        w.entities[id] = {
          id,
          ...d,
          destination: "banos",
          owner: "gad-banos",
          state: "activo",
          photo: "banos",
          mode: "directorio",
        };
        relation(w, id, "banos", d.type === "evento" ? "ocurreEn" : "conecta");
        event(w, "territorio.contenidoCreado", id);
      }
      if (f.id === "commission-form") {
        w.settings.commission = Number(d.commission);
        event(w, "admin.comision", "admin-rutas", {
          percent: Number(d.commission),
        });
      }
    });
    close();
    render();
    toast("Configuración de demostración actualizada");
  } catch (err) {
    toast(err.message);
  }
});
export function renderTerritory(route) {
  if (route === "gad") {
    view.role = "gad";
    view.tenant = "gad-banos";
    const tabs = [
      ["overview", "Inteligencia territorial"],
      ["content", "Ficha, eventos y circuitos"],
      ["campaigns", "Campañas y promoción"],
      ["establishments", "Establecimientos"],
    ];
    return `<div class="container">${heading("GAD BAÑOS · DESTINO PREMIUM", "El turismo conecta. El territorio crece.", "Contenido, promoción y demanda agregada en un solo lugar. Sin datos personales del pasajero.")}<div class="toolbar">${tabs.map(([t, n]) => btn("gadTab", n, t, "chip " + (t === gadTab ? "active" : ""))).join("")}</div>${gadTab === "overview" ? gadOverview() : gadTab === "content" ? territorialContent() : gadTab === "campaigns" ? campaignPanel("gad-banos") : entityTable(entities().filter((e) => ["hotel", "restaurante", "agencia", "atraccion", "bienestar", "comercio"].includes(e.type)))}</div>`;
  }
  view.role = "admin";
  view.tenant = "admin-rutas";
  const tabs = [
    ["overview", "Ecosistema"],
    ["entities", "Entidades"],
    ["companies", "Empresas"],
    ["users", "Usuarios"],
    ["bookings", "Reservas"],
    ["finance", "Transacciones"],
    ["subscriptions", "Suscripciones"],
    ["campaigns", "Campañas"],
    ["import", "Importar Excel/CSV"],
    ["settings", "Configuración"],
  ];
  let content;
  if (adminTab === "overview") content = adminOverview();
  else if (adminTab === "entities" || adminTab === "companies")
    content = entityTable(
      entities().filter((e) =>
        adminTab === "entities"
          ? e.type !== "reserva"
          : ["hotel", "restaurante", "agencia", "operador"].includes(e.type),
      ),
    );
  else if (adminTab === "users")
    content = entityTable(
      entities().filter((e) =>
        ["pasajero", "conductor", "guia"].includes(e.type),
      ),
    );
  else if (adminTab === "bookings")
    content = `<section class="panel"><h2>Reservas del ecosistema demo</h2><div class="table-wrap"><table><thead><tr><th>Servicio</th><th>Proveedor</th><th>Fecha</th><th>Estado</th><th>QR</th></tr></thead><tbody>${bookings()
      .map(
        (b) =>
          `<tr><td>${esc(b.name)}</td><td>${esc(entity(b.owner)?.name)}</td><td>${b.date}</td><td>${badge(b.state)}</td><td>${btn("ticket", "Ver QR", b.id, "chip")}</td></tr>`,
      )
      .join("")}</tbody></table></div></section>`;
  else if (adminTab === "finance")
    content = `${metrics()}<section class="panel"><h2>Transacciones simuladas</h2><div class="table-wrap"><table><thead><tr><th>Reserva</th><th>Pago demo</th><th>Comisión demo</th><th>Estado</th></tr></thead><tbody>${bookings()
      .map(
        (b) =>
          `<tr><td>${esc(b.id.slice(0, 12))}<small>${esc(b.name)}</small></td><td>${money(b.amount)}</td><td>${money(b.channel === "pos" || b.state === "cancelada" ? 0 : (b.amount * world.settings.commission) / 100)}</td><td>${b.refund || "Pago simulado confirmado"}</td></tr>`,
      )
      .join("")}</tbody></table></div></section>`;
  else if (adminTab === "subscriptions")
    content = entityTable(entities().filter((e) => e.mode === "premium"));
  else if (adminTab === "campaigns") content = campaignPanel("gad-banos");
  else if (adminTab === "import") content = importPanel();
  else
    content = `<section class="panel"><h2>Economía de demostración</h2><form id="commission-form"><label>Comisión marketplace simulada %<input name="commission" type="number" min="0" max="30" value="${world.settings.commission}" required></label><div class="form-actions"><button class="primary">Guardar escenario</button></div></form><div class="toolbar">${btn("exportWorld", "Exportar mundo JSON", "", "secondary")}${btn("resetDialog", "Restablecer demo", "", "secondary")}</div><p class="notice">Sin pagos reales, identidades reales ni cambios en producción. Premium y suscripciones son modalidades ilustrativas.</p></section>`;
  return `<div class="container">${heading("RUTASEC ADMIN · ESCENARIO CONTROLADO", "Todo un ecosistema. Una sola visión.", "Entidades, empresas, usuarios, reservas, transacciones, planes y promoción.")}<div class="toolbar">${tabs.map(([t, n]) => btn("adminTab", n, t, "chip " + (t === adminTab ? "active" : ""))).join("")}</div>${content}</div>`;
}
