import { world, entity, entities, transact, event } from "./world.js";
import {
  esc,
  icon,
  link,
  btn,
  badge,
  cards,
  heading,
  actions,
  toast,
} from "./ui.js";
import { view, render } from "./app.js";
let region = "Todo";
export function discover() {
  const list = entities("destino").filter(
    (e) =>
      region === "Todo" || e.region === region || e.circuits?.includes(region),
  );
  return `<div class="container">${heading("CUATRO MUNDOS. INFINITAS HISTORIAS.", "Descubre Ecuador.", "No necesitas un boleto para empezar a explorar. Elige una región y encuentra tu próxima escapada.")}<div class="detail-cover"><img src="assets/road-cinematic.webp" alt="Carretera hacia el Chimborazo, ilustración cinematográfica"><div>${badge("EL PAÍS TE ESTÁ ESPERANDO", "premium")}<h1>Un camino. Mil destinos.</h1><p>Pacífico, Andes y Amazonía. Conecta con lo que te mueve.</p></div></div><div class="toolbar">${["Todo", "Pacífico", "Andes", "Amazonía", "Volcanes", "Cascadas", "Aventura"].map((r) => btn("region", r, r, "chip " + (region === r ? "active" : ""))).join("")}</div>${cards(list)}<div class="banner">${icon("compass")}<div><h3>Baños conecta todos tus planes.</h3><p>El destino más completo de esta muestra: transporte, hospedaje, gastronomía y aventura.</p></div>${link("entity/banos", "Conocer Baños", "button primary")}</div><section class="panel"><h2>Circuitos que conectan</h2><div class="toolbar">${link("planner/pacifico","Ruta Spondylus","button primary")}${link("planner/andes","Ruta de los Andes","button secondary")}${link("planner/amazonia","Ruta Amazónica","button secondary")}</div><div class="toolbar">${entities(
    "circuito",
  )
    .map((e) => btn("region", e.name, e.region, "chip"))
    .join(
      "",
    )}</div><p class="muted">Fuera de Baños las fichas y conexiones son representativas de demostración.</p></section></div>`;
}
actions.region = ({ id }) => {
  region = id;
  render();
};
