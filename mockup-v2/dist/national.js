export function addNational(w, date) {
  const E = w.entities;
  const data = [
    ["salinas", "Salinas", "Pacífico", "manta-cinematic"],
    ["montanita", "Montañita", "Pacífico", "manta-cinematic"],
    ["puerto-lopez", "Puerto López", "Pacífico", "manta-cinematic"],
    ["manta", "Manta", "Pacífico", "manta-cinematic"],
    ["quito", "Quito", "Andes", "quito-cinematic"],
    ["latacunga", "Latacunga", "Andes", "road-cinematic"],
    ["ambato", "Ambato", "Andes", "road-cinematic"],
    ["riobamba", "Riobamba", "Andes", "road-cinematic"],
    ["cuenca", "Cuenca", "Andes", "cuenca-cinematic"],
    ["tena", "Tena", "Amazonía", "banos"],
    ["puyo", "Puyo", "Amazonía", "banos"],
    ["macas", "Macas", "Amazonía", "banos"],
    ["guayaquil", "Guayaquil", "Pacífico", "guayaquil-cinematic"],
    ["rio-verde", "Río Verde", "Andes", "banos"],
    ["rio-negro", "Río Negro", "Amazonía", "banos"],
  ];
  for (const [id, name, region, photo] of data) {
    E[id] = {
      ...E[id],
      id,
      name,
      type: "destino",
      region,
      photo,
      category: region + " · Conexión demo",
      mode: "directorio",
      description:
        "Ficha representativa para mostrar circuitos nacionales. Fotos de referencia regional; conexiones, servicios y planes son ilustrativos.",
      circuits:
        region === "Andes"
          ? ["Volcanes", "Aventura"]
          : region === "Amazonía"
            ? ["Cascadas", "Aventura"]
            : ["Aventura"],
    };
    const exp = "exp-" + id;
    E[exp] = {
      id: exp,
      type: "tour",
      name: "Descubre " + name + " · experiencia demo",
      owner: "agency-0",
      destination: id,
      photo,
      price: 25,
      capacity: 12,
      bookable: true,
      mode: "marketplace",
      time: "09:00",
      description:
        "Experiencia ilustrativa para mostrar conexiones entre destinos. No corresponde a una oferta comercial real.",
    };
    w.relations.push({
      id: "national-" + id,
      source: exp,
      target: id,
      type: "seRealizaEn",
      at: date,
    });
  }
  E.banos.region = "Andes";
  E.banos.circuits = ["Cascadas", "Aventura", "Volcanes"];
  for (const [id, name, region] of [
    ["pacifico", "Ruta del Pacífico", "Pacífico"],
    ["andes", "Avenida de los volcanes", "Volcanes"],
    ["amazonia", "Puertas de la Amazonía", "Amazonía"],
    ["cascadas", "Circuito de las cascadas", "Cascadas"],
    ["aventura", "Ecuador aventura", "Aventura"],
  ]) {
    E["circuit-" + id] = {
      id: "circuit-" + id,
      type: "circuito",
      name,
      region,
    };
    for (const e of Object.values(E).filter(
      (e) =>
        e.type === "destino" &&
        (e.region === region || e.circuits?.includes(region)),
    ))
      w.relations.push({
        id: id + "-" + e.id,
        source: "circuit-" + id,
        target: e.id,
        type: "conecta",
        at: date,
      });
  }
  return w;
}
