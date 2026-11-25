// Names researched in public local directories. All offers, prices and affiliations simulated.
export function addBanos(w, date) {
  const E = w.entities,
    R = w.relations;
  const src = {
    hotels: "https://www.banosecuador.travel/es/hospedaje",
    food: "https://www.banosecuador.travel/es/restaurantes-banos",
    agencies: "https://www.banosecuador.travel/es/agencias-de-turismo-ecuador",
    attractions: "https://www.banostravel.com/banos?category=Atractivos",
    wellness: "https://www.banostravel.com/bienestar-banos",
    night: "https://www.banostravel.com/vida-nocturna-banos",
  };
  const add = (id, type, name, data = {}) => {
    E[id] = {
      id,
      type,
      name,
      destination: "banos",
      state: "activo",
      mode: "marketplace",
      location: "Baños de Agua Santa",
      coords: [-1.3964, -78.4245],
      source: src.attractions,
      description:
        "Lugar de referencia del directorio local. Su catálogo, precios, disponibilidad y operaciones en RutasEC son una simulación para esta presentación. No existe afiliación comercial.",
      ...data,
    };
    R.push({
      id: "at-" + id,
      source: id,
      target: "banos",
      type: "ubicadoEn",
      at: date,
    });
    if (data.owner)
      R.push({
        id: "own-" + id,
        source: id,
        target: data.owner,
        type: "ofrecidoPor",
        at: date,
      });
  };
  const hotels = [
    ["Samari Spa Resort", "Resort · Bienestar", 145],
    ["Sangay Spa Hotel", "Hotel familiar", 95],
    ["El Quinde Hotel", "Hotel económico", 38],
    ["La Casa del Molino Blanco B&B", "Hostal · Naturaleza", 22],
    ["Hotel Napolitano", "Hotel · Descanso", 52],
    ["La Cumbre Hotel", "Hotel céntrico", 35],
    ["La Floresta Hotel", "Boutique · Jardín", 78],
    ["Santa Cruz Backpacker’s", "Hostal · Mochileros", 18],
    ["593 Baños", "Hotel junto a las termas", 42],
    ["Hostal Abarsil", "Hostal económico", 20],
    ["Abuelita’s House", "Casa familiar", 28],
    ["Adevan", "Alojamiento privado", 30],
    ["Hostal Adventure", "Hostal económico", 19],
    ["Luna Volcán Adventure SPA", "Premium · Naturaleza", 240],
    ["Airos Hotel", "Hotel urbano", 45],
  ];
  hotels.forEach(([name, category, price], i) => {
    add("hotel-" + i, "hotel", name, {
      category,
      source:
        i === 13
          ? "https://lunavolcan.com/"
          : i === 14
            ? "https://www.banostravel.com/socios/category/Hoteles"
            : src.hotels,
      mode: [0, 1, 6, 13].includes(i)
        ? "premium"
        : i === 12
          ? "directorio"
          : "marketplace",
      photo: "hotel",
      sponsored: i === 0,
      hours: "Recepción demo · 24 horas",
    });
    for (let j = 0; j < 3; j++)
      add(
        `room-${i}-${j}`,
        "habitacion",
        ["Habitación doble", "Suite panorámica", "Habitación familiar"][j],
        {
          owner: "hotel-" + i,
          price: price + j * 22,
          capacity: j === 0 ? 6 : j === 1 ? 2 : 3,
          maxGuests: j === 2 ? 4 : 2,
          roomState: "disponible",
          bookable: i !== 12,
          mode: i === 12 ? "directorio" : "marketplace",
          photo: "hotel",
          subtitle: [
            "2 huéspedes · Desayuno demo",
            "2 huéspedes · Balcón demo",
            "4 huéspedes · Desayuno demo",
          ][j],
          source: src.hotels,
        },
      );
  });
  const restaurants = [
    ["La Floresta Restaurante", "Cocina de jardín", 18],
    ["Soma Beer Garden", "Bar · Cocina internacional", 16],
    ["La Ofrenda del Inca", "Cocina de montaña", 20],
    ["Flor de Jamaica Express", "Comida rápida", 8],
    ["Alfpasito", "Cocina ecuatoriana", 6],
    ["Amai", "Cocina coreana y china", 14],
    ["Amarelo Restaurante", "Mediterránea", 19],
    ["Andes Specialty Coffee", "Café de especialidad", 7],
    ["Anturios", "Cocina ecuatoriana", 14],
    ["Azotea 740", "Fusión · Rooftop", 18],
    ["Bambu’s Steak House", "Parrilla", 17],
    ["Bruneli", "Pizza · Parrilla", 10],
    ["Cafe Good Books & Food", "Café · Cocina internacional", 9],
    ["Cafe Hood", "Cocina local", 12],
    ["Cedro Rooftop", "Mexicana · Ecuatoriana", 15],
  ];
  restaurants.forEach(([name, category, price], i) => {
    add("rest-" + i, "restaurante", name, {
      category,
      source:
        i < 4 ? "https://www.banosecuador.travel/es/restaurantes" : src.food,
      mode: i === 0 ? "premium" : i === 14 ? "directorio" : "marketplace",
      photo: "restaurant",
      hours: "Horario demo · 08:00–22:00",
    });
    for (let j = 0; j < 2; j++)
      add(
        `table-${i}-${j}`,
        "mesa",
        j ? "Experiencia gastronómica" : "Mesa y menú de temporada",
        {
          owner: "rest-" + i,
          price: price + j * 8,
          capacity: 24,
          maxGuests: 6,
          bookable: i !== 14,
          photo: "restaurant",
          mode: i === 14 ? "directorio" : "marketplace",
          subtitle: "Reserva por persona · Mesa asignada en recepción demo",
          source: src.food,
        },
      );
  });
  const agencies = [
    "Geotours Adventure + Fun",
    "Turismo Ecuador 24",
    "Ambaturismo Travel",
    "Explorsierra Expediciones",
    "Agencia Rumiluna",
    "Alexandertour",
    "Alextravel Aventure",
    "Amazingtrip",
  ];
  agencies.forEach((name, i) => {
    add("agency-" + i, "agencia", name, {
      category: "Agencia local · Oferta demo",
      source: src.agencies,
      mode: i === 0 ? "premium" : "marketplace",
      photo: "banos",
    });
    add("guide-" + i, "guia", "Guía demo " + (i + 1), { owner: "agency-" + i });
  });
  const activities = [
    ["Ruta de las Cascadas", 22, "6 h"],
    ["Rafting río Pastaza", 35, "4 h"],
    ["Canyoning Chamana", 30, "3 h"],
    ["Canopy Puntzan", 25, "2 h"],
    ["Tarabitas y cascadas", 15, "3 h"],
    ["Bicicleta a Río Verde", 12, "5 h"],
    ["Casa del Árbol y miradores", 15, "3 h"],
    ["Senderismo en Runtún", 18, "4 h"],
    ["Termas y descanso", 20, "3 h"],
    ["Spa y bienestar", 45, "2 h"],
    ["Amazonía desde Baños", 65, "1 día"],
    ["Turismo comunitario", 48, "1 día"],
    ["Ruta cultural y melcochas", 12, "2 h"],
    ["Canyoning Cashaurco", 65, "5 h"],
    ["Ruta de los miradores", 18, "4 h"],
  ];
  for (let i = 0; i < 25; i++) {
    const [name, price, duration] = activities[i % 15];
    const owner = "agency-" + (i % 8);
    add(
      "tour-" + i,
      "tour",
      name + (i >= 15 ? " · alternativa " + (i - 13) : ""),
      {
        owner,
        price: price + (i >= 15 ? 5 : 0),
        capacity: 12,
        time: i % 2 ? "14:00" : "09:00",
        duration,
        bookable: true,
        photo: "banos",
        category:
          i === 1 || i === 2 || i === 3
            ? "Aventura"
            : i === 9
              ? "Bienestar"
              : "Naturaleza y cultura",
        source: i % 8 === 0 ? "https://www.geotoursbanos.com/" : src.agencies,
        subtitle: duration + " · " + agencies[i % 8] + " · Oferta simulada",
      },
    );
  }
  const attrs = [
    ["Pailón del Diablo", [-1.4035, -78.2977]],
    ["Casa del Árbol", [-1.4186, -78.4253]],
    ["Cascada de Agoyán", [-1.399, -78.383]],
    ["Manto de la Novia", [-1.405, -78.358]],
    ["Cascada Cabellera de la Virgen", [-1.4002, -78.4195]],
    ["Mirador Bellavista", [-1.408, -78.424]],
    ["Mirador Manos de Dios", [-1.414, -78.438]],
    ["Ruta de las Cascadas", [-1.401, -78.36]],
    ["Río Pastaza", [-1.397, -78.39]],
    ["Puente San Francisco", [-1.391, -78.424]],
    ["Basílica de Agua Santa", [-1.397, -78.422]],
    ["Parque Palomino Flores", [-1.397, -78.425]],
    ["Cascada de Ulba", [-1.413, -78.397]],
    ["Senderos de Runtún", [-1.421, -78.43]],
    ["Río Verde", [-1.403, -78.298]],
  ];
  attrs.forEach(([name, coords], i) => {
    add("attr-" + i, "atraccion", name, {
      coords,
      category:
        i < 5
          ? "Cascadas y naturaleza"
          : i > 9
            ? "Cultura y senderos"
            : "Aventura",
      photo: "banos",
      price: [0, 1, 2, 3, 6].includes(i) ? 5 : 0,
      capacity: 60,
      bookable: [0, 1, 2, 3, 6].includes(i),
      owner: "agency-0",
      time: "10:00",
      hours: "Horario demo · 08:00–18:00",
    });
    R.push({
      id: "visit-" + i,
      source: "tour-" + (i % 25),
      target: "attr-" + i,
      type: "visita",
      at: date,
    });
  });
  [
    "Luna Healing SPA",
    "Samari Spa",
    "Sangay Spa",
    "Termas de la Virgen",
    "El Salado",
  ].forEach((name, i) =>
    add("well-" + i, "bienestar", name, {
      category:
        i < 3 ? "Spa · Oferta ilustrativa" : "Termas · Oferta ilustrativa",
      source: src.wellness,
      price: 18 + i * 7,
      capacity: 12,
      bookable: true,
      owner: i < 3 ? "hotel-" + [13, 0, 1][i] : "gad-banos",
      photo: "hotel",
      time: "16:00",
    }),
  );
  [
    "Soma · Noche de música demo",
    "Zona Rosa · Ruta nocturna demo",
    "Cafés bajo las estrellas demo",
    "Miradores nocturnos demo",
    "Encuentro cultural nocturno demo",
  ].forEach((name, i) =>
    add("night-" + i, "noche", name, {
      category: "Vida nocturna · Escenario demo",
      source: src.night,
      price: 10 + i * 2,
      capacity: 20,
      bookable: true,
      owner: i === 0 ? "rest-1" : "agency-0",
      photo: "restaurant",
      time: "20:00",
    }),
  );
  for (const [id, name] of [
    ["rio-verde", "Río Verde"],
    ["rio-negro", "Río Negro"],
    ["riobamba", "Riobamba"],
    ["puyo", "Puyo"],
  ])
    add(id, "destino", name, {
      photo: "banos",
      category: "Conexión regional · demo",
      description:
        "Destino relacionado con Baños. Ficha representativa para explorar circuitos y conexiones de demostración.",
    });
  add("event-banos", "evento", "Festival de sabores de Baños", {
    owner: "gad-banos",
    category: "Evento de demostración",
    date,
    photo: "restaurant",
    description:
      "Evento ficticio para mostrar promoción territorial y participación de negocios locales.",
  });
  add("shop-banos", "comercio", "Artesanías del viajero · demo", {
    category: "Comercio local ficticio",
    owner: "gad-banos",
  });
  for (let i = 0; i < 6; i++) {
    const id = ["hotel-0", "rest-0", "agency-0", "tour-0", "attr-0", "banos"][
      i
    ];
    w.reviews.push({
      id: "review-seed-" + i,
      entity: id,
      stars: [5, 4, 5, 4, 5, 5][i],
      text: "Opinión de ejemplo para la presentación. Esta valoración es simulada.",
      verified: false,
      at: date,
    });
  }
  w.campaigns = [
    {
      id: "campaign-0",
      name: "Descubre Baños",
      destination: "banos",
      category: "hotel",
      budget: 250,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      active: true,
      owner: "gad-banos",
      start: date,
      end: date.slice(0, 4) + "-12-31",
      context: "antes",
      placement: "Descubre, fichas y recomendaciones",
    },
    {
      id: "campaign-1",
      name: "Vive la Amazonía",
      destination: "puyo",
      budget: 180,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      active: false,
      owner: "gad-banos",
    },
    {
      id: "campaign-2",
      name: "Conoce Cuenca",
      destination: "cuenca",
      budget: 150,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      active: false,
      owner: "gad-banos",
    },
    {
      id: "campaign-3",
      name: "Ruta del Pacífico",
      destination: "manta",
      budget: 200,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      active: false,
      owner: "gad-banos",
    },
  ];
  w.promotions = [
    {
      id: "promo-0",
      code: "BANOS10",
      name: "Tu primera escapada",
      percent: 10,
      active: true,
      owner: null,
    },
    {
      id: "promo-1",
      code: "SABORES15",
      name: "Sabores de Baños",
      percent: 15,
      active: true,
      owner: "rest-0",
    },
  ];
  ["Menú de temporada", "Bebida artesanal", "Postre del viajero"].forEach(
    (name, i) =>
      add("product-" + i, "producto", name, {
        owner: "rest-0",
        price: [18, 5, 7][i],
        stock: 30,
        capacity: 30,
        photo: "restaurant",
        bookable: false,
      }),
  );
  return w;
}
