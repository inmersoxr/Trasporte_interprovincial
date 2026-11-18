// Organize existing controls without duplicating forms, identities or data.
export function mountNavigation({refresh,catalog,status}){
 const $=id=>document.getElementById(id),root=$('operator'),shell=document.querySelector('.standard-shell'),header=shell.querySelector('header'),publicNav=shell.querySelector('nav');
 publicNav.classList.add('passenger-navigation');publicNav.setAttribute('aria-label','Pasajeros');
 const switcher=document.querySelector('[data-view="operator"]');header.append(switcher);switcher.textContent='Gestionar mi operadora';
 const back=document.createElement('button');back.type='button';back.textContent='Vista de pasajero';header.append(back);
 const title=header.querySelector('h1');
 const tabs=[['home','Inicio','Tu operación, paso a paso'],['trips','Viajes','Rutas y horarios'],['reservations','Reservas','Pasajeros y embarques'],['fleet','Flota','Vehículos y conductores'],['more','Más','Tu empresa y tu cuenta']];
 const nav=document.createElement('nav');nav.className='operator-navigation';nav.setAttribute('aria-label','Consola de operadora');
 const icons={home:'⌂',trips:'↗',reservations:'▤',fleet:'▱',more:'•••'};
 for(const [id,label]of tabs){const b=document.createElement('button');b.type='button';b.dataset.operatorTab=id;b.innerHTML='<span aria-hidden="true">'+icons[id]+'</span>'+label;b.onclick=()=>go(id,undefined,true);nav.append(b);}
 shell.append(nav);
 const pages={};for(const [id,label,description]of tabs){const page=document.createElement('section');page.id='operatorPage-'+id;page.className='operator-page';page.innerHTML='<div class="page-heading"><p class="eyebrow">'+label+'</p><h2>'+description+'</h2></div>';root.append(page);pages[id]=page;}
 const home=document.createElement('div');home.className='operator-welcome';home.innerHTML='<p>Publica tus salidas y prepara el próximo embarque.</p><p id="operatorOverview">Entra con tu cuenta para consultar tu operadora.</p><button type="button" data-shortcut="trips">Preparar un viaje</button><button type="button" data-shortcut="reservations">Revisar reservas</button><p>¿Es tu primera vez? Completa tu empresa, registra la flota y solicita revisión.</p><button type="button" data-shortcut="more">Completar mi empresa</button>';pages.home.append(home);
 for(const b of home.querySelectorAll('[data-shortcut]'))b.onclick=()=>go(b.dataset.shortcut,undefined,true);
 const groups={trips:[['routes','Rutas'],['departures','Salidas'],['recurring','Recurrentes']],reservations:[['manifest','Manifiesto'],['boarding','Embarcar'],['history','Historial'],['requests','Solicitudes']],fleet:[['vehicles','Vehículos'],['drivers','Conductores']],more:[['company','Empresa'],['documents','Documentos'],['account','Cuenta']]},sections={},subnav={};
 for(const [page,items]of Object.entries(groups)){const n=document.createElement('nav');n.className='context-navigation';n.setAttribute('aria-label','Secciones de '+tabs.find(t=>t[0]===page)[1]);pages[page].append(n);subnav[page]=n;
  for(const [id,label]of items){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.operatorSection=id;b.onclick=()=>go(page,id,true);n.append(b);const s=document.createElement('div');s.id='operatorSection-'+id;pages[page].append(s);sections[id]=s;}}
 sections.account.innerHTML='<p>Tu cuenta es la misma para viajar y trabajar. Los permisos de cada empresa se comprueban por separado.</p><a class="account-action" href="/account/">Abrir mi cuenta</a>';
 let tab='home',section=null,managing=false;
 function go(next,sub,write=false){tab=tabs.some(t=>t[0]===next)?next:'home';section=groups[tab]?.some(([id])=>id===sub)?sub:groups[tab]?.[0][0];
  for(const [id,p]of Object.entries(pages))p.hidden=id!==tab;
  for(const [page,items]of Object.entries(groups))for(const [id]of items){sections[id].hidden=id!==section;const b=subnav[page].querySelector('[data-operator-section="'+id+'"]');b.setAttribute('aria-current',id===section?'page':'false');}
  for(const b of nav.querySelectorAll('button'))b.setAttribute('aria-current',b.dataset.operatorTab===tab?'page':'false');
  if(write){const u=new URL(location.href);u.searchParams.set('manage','1');u.searchParams.set('panel',tab);section?u.searchParams.set('section',section):u.searchParams.delete('section');history.pushState(null,'',u);status('');pages[tab].querySelector('h2').setAttribute('tabindex','-1');pages[tab].querySelector('h2').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  document.dispatchEvent(new CustomEvent('standard:navigation',{detail:{managing,tab,section}}));
 }
 function mode(value){managing=value;for(const el of [document.querySelector('a[href="/account/"]:not(.account-action)'),$('installStandard')])if(el)(value?sections.account:header).append(el);if(value)sections.account.append(back);nav.hidden=!value;publicNav.hidden=value;switcher.hidden=value;back.hidden=!value;title.textContent=value?'Mi operadora':'RutasEC';shell.classList.toggle('is-operator',value);}
 const original=switcher.onclick;switcher.onclick=()=>{original();mode(true);go('home',null,true);};
 back.onclick=()=>{const u=new URL(location.href);for(const k of ['manage','panel','section'])u.searchParams.delete(k);history.pushState(null,'',u);mode(false);document.querySelector('[data-view="catalog"]').click();};
 function restore(){const q=new URLSearchParams(location.search),value=q.has('manage');mode(value);if(value){for(const id of ['catalog','myBookings','privateRequests','tracking'])$(id).hidden=true;root.hidden=false;go(q.get('panel'),q.get('section'));refresh().catch(e=>status(e.message));}else{root.hidden=true;$('catalog').hidden=false;}}
 window.addEventListener('popstate',restore);document.addEventListener('rutasec:account',()=>mode(managing));
 function move(id,target){const el=$(id);if(el&&el.parentElement!==target)target.append(el);}
 // Labels/selectors remain visible across operator screens; bodies live in their task.
 const h=root.querySelector(':scope > h2');if(h)h.hidden=true;const hint=root.querySelector(':scope > p');if(hint)hint.hidden=true;
 const select=$('operatorSelect'),label=select.closest('label');label.classList.add('operator-context');root.prepend(label);label.append($('refreshOperator'));$('refreshOperator').textContent='↻';$('refreshOperator').setAttribute('aria-label','Actualizar panel');
 function organize(){
  move('operatorData',pages.home);move('operatorForm',sections.company);move('vehicleForm',sections.vehicles);move('offerForm',sections.routes);move('departureForm',sections.departures);move('recurringSchedules',sections.recurring);move('operatorMarket',sections.requests);
  move('operatorOnboarding',sections.company);move('operatorDriverForm',sections.drivers);move('vehicleDetailsForm',sections.vehicles);move('operatorDocumentForm',sections.documents);move('operatorDocuments',sections.documents);move('submitOperatorReview',sections.documents);
  move('operatorOperations',sections.manifest);move('boardForm',sections.boarding);move('operationsHistoryHeading',sections.history);move('operationsHistory',sections.history);
  for(const el of ['operationsHistory']){const n=$(el);if(n){for(const b of ['Operaciones anteriores','Volver a recientes']){const button=[...root.querySelectorAll('button')].find(x=>x.textContent===b);if(button&&button.parentElement!==sections.history)sections.history.append(button);}}}
 }
 let queued=false;new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;organize();});}}).observe(root,{childList:true,subtree:true});organize();
 document.addEventListener('standard:dashboard',e=>{const d=e.detail,op=d.operators.find(o=>o.id===select.value);$('operatorOverview').textContent=op?op.display_name+' · '+({pending:'Completa tu expediente para solicitar revisión',approved:'Operadora habilitada',suspended:'Operadora suspendida'}[op.status]||op.status):'Registra tu empresa en Más para comenzar.';organize();});
 // Private passenger flows retain their existing handlers and receipt return paths.
 new MutationObserver(()=>{if(!root.hidden)return;if(managing)mode(false);}).observe(root,{attributes:true,attributeFilter:['hidden']});
 const passengerViews=[['catalog',document.querySelector('[data-view="catalog"]')],['myBookings',$('openBookings')],['privateRequests',$('openPrivateMarket')]];
 function markPassenger(){for(const [id,b]of passengerViews)b.setAttribute('aria-current',!$(id).hidden?'page':'false');}
 for(const [id]of passengerViews)new MutationObserver(markPassenger).observe($(id),{attributes:true,attributeFilter:['hidden']});markPassenger();
 mode(new URLSearchParams(location.search).has('manage'));go(new URLSearchParams(location.search).get('panel'),new URLSearchParams(location.search).get('section'));
 if(managing){for(const id of ['catalog','myBookings','privateRequests','tracking'])$(id).hidden=true;root.hidden=false;}
 return{open:()=>{mode(true);for(const id of ['catalog','myBookings','privateRequests','tracking'])$(id).hidden=true;root.hidden=false;go(new URLSearchParams(location.search).get('panel'),new URLSearchParams(location.search).get('section'));}};
}
