import {homeMarkup} from './home-template.mjs';
import {cities} from './cities.mjs';
export function mountSearch(section,search){
  const form=document.createElement('form');form.id='searchTrips';form.className='home-search';
  const hero=document.createElement('div');hero.className='alpha-hero';hero.innerHTML=homeMarkup;
  section.prepend(hero);
  const photos=[...hero.querySelectorAll('.hero-photo')],dots=[...hero.querySelectorAll('.hero-dot')];let scene=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const labels=[['Guayaquil','Malecón 2000'],['Cuenca','Catedral Nueva'],['Manta','Playa El Murciélago'],['Babahoyo','Malecón 9 de Octubre'],['Quito','Centro histórico']];
  function choose(index){scene=index;photos.forEach((p,i)=>{p.classList.toggle('is-active',i===index);p.setAttribute('aria-hidden',String(i!==index));});dots.forEach((b,i)=>{b.classList.toggle('is-active',i===index);b.setAttribute('aria-pressed',String(i===index));});hero.querySelector('#heroCity').textContent=labels[index][0];hero.querySelector('#heroLandmark').textContent=labels[index][1];}
  dots.forEach((b,i)=>b.onclick=()=>choose(i));const pause=hero.querySelector('#carouselPause');function syncPause(){pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Reanudar carrusel':'Pausar carrusel');}syncPause();pause.onclick=()=>{paused=!paused;syncPause();};setInterval(()=>{if(!paused&&!document.hidden&&!section.hidden)choose((scene+1)%photos.length);},6000);

  form.innerHTML='<div class="search-panel"><div class="places"><label class="field">¿Desde dónde?<select name="origin" aria-label="Ciudad de origen"></select></label><button type="button" id="swapSearchCities" aria-label="Intercambiar ciudades">⇅</button><label class="field">¿A dónde vas?<select name="destination" aria-label="Ciudad de destino"></select></label></div><div class="row2"><label class="field">Fecha<input name="date" type="date" aria-label="Fecha de viaje"></label><label class="field">Pasajeros<input name="passengers" type="number" min="1" max="30" value="1" required></label></div></div><button class="yellow search-button">Buscar viajes →</button><details class="search-filters"><summary>Más filtros</summary><label>Vehículo<select name="vehicleType"><option value="any">Cualquiera</option><option value="auto">Auto</option><option value="suv">SUV</option><option value="van">Furgoneta</option><option value="minivan">Minivan</option></select></label><button type="reset">Limpiar filtros</button></details>';
  form.querySelector('#swapSearchCities').onclick=()=>{const origin=form.elements.origin,destination=form.elements.destination;[origin.value,destination.value]=[destination.value,origin.value];};
  for(const name of ['origin','destination']){
    const select=form.elements[name];select.add(new Option('Todas las ciudades',''));
    for(const city of cities)select.add(new Option(city,city));
  }
  form.elements.date.min=new Date(Date.now()-5*3600000).toISOString().slice(0,10);
  form.onsubmit=event=>{event.preventDefault();search();};
  form.onreset=()=>queueMicrotask(search);hero.after(form);
  return ()=>{
    const query=new URLSearchParams(new FormData(form));
    for(const [key,value] of [...query])if(!value)query.delete(key);
    return query;
  };
}
