import {cities} from './cities.mjs';
export function mountSearch(section,search){
  const form=document.createElement('form');form.id='searchTrips';
  form.innerHTML='<h2>Buscar un viaje</h2><label>Origen<select name="origin"></select></label><label>Destino<select name="destination"></select></label><label>Fecha en Ecuador continental<input name="date" type="date"></label><label>Pasajeros<input name="passengers" type="number" min="1" max="30" value="1" required></label><label>Vehículo<select name="vehicleType"><option value="any">Cualquiera</option><option value="auto">Auto</option><option value="suv">SUV</option><option value="van">Furgoneta</option><option value="minivan">Minivan</option></select></label><button class="yellow">Buscar viajes</button><button type="reset">Limpiar filtros</button><p>Solo aparecen salidas publicadas con plazas suficientes. En privado eliges tu horario y se valida el vehículo al confirmar.</p>';
  for(const name of ['origin','destination']){
    const select=form.elements[name];select.add(new Option('Todas las ciudades',''));
    for(const city of cities)select.add(new Option(city,city));
  }
  form.elements.date.min=new Date(Date.now()-5*3600000).toISOString().slice(0,10);
  form.onsubmit=event=>{event.preventDefault();search();};
  form.onreset=()=>queueMicrotask(search);section.prepend(form);
  return ()=>{
    const query=new URLSearchParams(new FormData(form));
    for(const [key,value] of [...query])if(!value)query.delete(key);
    return query;
  };
}
