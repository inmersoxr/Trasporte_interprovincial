export function baseCatalog(date) {
  const entities = {},
    relations = [];
  const add = (id, type, name, data = {}) =>
    (entities[id] = {
      id,
      type,
      name,
      state: "activo",
      mode: "marketplace",
      ...data,
    });
  const rel = (source, target, type) =>
    relations.push({
      id: `${source}-${target}-${type}`,
      source,
      target,
      type,
      at: date,
    });
  add("tungurahua", "provincia", "Tungurahua");
  add("banos", "destino", "Baños de Agua Santa", {
    category: "Andes · Tungurahua",
    photo: "banos",
    coords: [-1.3964, -78.4245],
    description:
      "Entre cascadas, aguas termales y montañas, el viaje se convierte en una experiencia. Descubre la puerta de entrada a la Amazonía.",
    mode: "premium",
  });
  rel("banos", "tungurahua", "ubicadoEn");
  rel("tungurahua", "ecuador", "parteDe");
  for (const [id, name, photo, coords] of [
    ["cuenca", "Cuenca", "cuenca-cinematic", [-2.9001, -79.0059]],
    ["guayaquil", "Guayaquil", "guayaquil-cinematic", [-2.1894, -79.8891]],
    ["quito", "Quito", "quito-cinematic", [-0.1807, -78.4678]],
    ["manta", "Manta", "manta-cinematic", [-0.9677, -80.7089]],
    ["ambato", "Ambato", "road-cinematic", [-1.249, -78.616]],
  ])
    add(id, "destino", name, {
      photo,
      coords,
      category: "Conexión demo",
      description:
        "Una nueva manera de conectar con Ecuador. Ficha representativa, servicios y conexiones de demostración.",
    });
  add("terminal-banos", "terminal", "Terminal terrestre de Baños", {
    destination: "banos",
    coords: [-1.392, -78.425],
  });
  [
    ["op-rutas", "Rutas Andinas", "premium"],
    ["op-austro", "Conecta Austro", "marketplace"],
    ["op-costa", "Costa Express", "directorio"],
  ].forEach(([id, name, mode]) =>
    add(id, "operador", name, {
      mode,
      category: "Operadora demo",
      description:
        "Operadora ficticia para mostrar rutas, inventario, ventas y abordaje en RutasEC.",
      location: "Ecuador",
      photo: "sprinter",
      contact: "Contacto de demostración",
    }),
  );
  for (const [i, origin, destination, price, capacity, photo, time] of [
    [0, "Quito", "Baños de Agua Santa", 12, 16, "sprinter", "08:30"],
    [1, "Guayaquil", "Baños de Agua Santa", 22, 16, "sprinter", "07:00"],
    [2, "Cuenca", "Baños de Agua Santa", 20, 12, "minivan", "06:30"],
    [3, "Ambato", "Baños de Agua Santa", 4, 16, "sprinter", "10:00"],
    [4, "Riobamba", "Baños de Agua Santa", 7, 12, "minivan", "09:00"],
    [5, "Cuenca", "Guayaquil", 15, 8, "minivan", "08:00"],
    [6, "Guayaquil", "Manta", 12, 16, "sprinter", "09:00"],
    [7, "Cuenca", "Paute", 3, 12, "minivan", "11:00"],
    [8, "Cuenca", "Gualaceo", 3, 12, "minivan", "12:00"],
    [9, "Guayaquil", "Playas", 5, 12, "minivan", "10:30"],
    [10, "Baños de Agua Santa", "Quito", 12, 16, "sprinter", "17:00"],
  ]) {
    const owner = i % 2 ? "op-austro" : "op-rutas",
      vehicle = "veh-" + i;
    add(
      vehicle,
      "vehiculo",
      photo === "sprinter" ? "Mercedes Sprinter" : "Hyundai H1",
      { owner, capacity, photo, plate: `DEMO-${i + 100}`, state: "disponible" },
    );
    add("driver-" + i, "conductor", "Conductor demo " + (i + 1), {
      owner,
      vehicle,
    });
    add("route-" + i, "ruta", `${origin} · ${destination}`, {
      origin,
      destination,
    });
    add("ride-" + i, "viaje", `${origin} · ${destination}`, {
      owner,
      origin,
      destination:
        destination === "Baños de Agua Santa"
          ? "banos"
          : destination === "Guayaquil"
            ? "guayaquil"
            : "manta",
      destinationName: destination,
      modality: "compartido",
      scope: ["Paute", "Gualaceo", "Playas"].includes(destination)
        ? "Intraprovincial"
        : "Interprovincial",
      capacity,
      photo,
      price,
      time,
      duration: i === 3 ? "50 min" : i === 0 ? "3 h 30 min" : "5 h 20 min",
      bookable: true,
      vehicle,
      driver: "driver-" + i,
      route: "route-" + i,
      description:
        "Salida de demostración. Fechas, frecuencia, precio y disponibilidad simulados.",
    });
    rel("ride-" + i, owner, "ofrecidoPor");
    rel("ride-" + i, vehicle, "usa");
    rel(vehicle, owner, "propiedadDe");
    rel("ride-" + i, "route-" + i, "recorre");
  }
  add("private-quito", "viaje", "Quito · Baños privado", {
    owner: "op-rutas",
    origin: "Quito",
    destination: "banos",
    destinationName: "Baños de Agua Santa",
    modality: "privado",
    scope: "Interprovincial",
    capacity: 1,
    photo: "suv",
    price: 135,
    time: "09:00",
    duration: "3 h",
    bookable: true,
    vehicle: "veh-private",
    description:
      "Vehículo completo para hasta 4 personas. Tarifa fija demo; elige fecha y hora propias.",
  });
  add("veh-private", "vehiculo", "Kia Sorento", {
    owner: "op-rutas",
    capacity: 4,
    photo: "suv",
    state: "disponible",
  });
  add("gad-banos", "gad", "GAD Baños", {
    destination: "banos",
    mode: "premium",
  });
  add("admin-rutas", "administracion", "RutasEC Admin");
  return { entities, relations };
}
