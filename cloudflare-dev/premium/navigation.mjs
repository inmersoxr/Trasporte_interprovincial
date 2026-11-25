// Same five operator destinations; all existing Premium tools retain their handlers.
export function mountPremiumNavigation(){
 const $=id=>document.getElementById(id),workspace=$('workspace'),main=document.querySelector('main');
 const fleet=document.createElement('section');fleet.id='premiumFleetPage';let n=$('team').nextSibling;while(n){const next=n.nextSibling;fleet.append(n);n=next;}workspace.append(fleet);
 const more=document.createElement('section'),moreNav=document.createElement('nav');more.id='premiumMorePage';moreNav.className='operator-subnav';moreNav.setAttribute('aria-label','Más opciones');more.append(moreNav);workspace.append(more);
 const toolPages={};
 const tools=[['team','Equipo'],['finance','Finanzas'],['branding','Marca']];let active='team';
 for(const [id,label]of tools){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{active=id;renderMore();};moreNav.append(b);const wrapper=document.createElement('div');wrapper.append($(id));more.append(wrapper);toolPages[id]=wrapper;}
 const account=document.createElement('a');account.href='/account/';account.textContent='Mi cuenta';more.append(account);
 const nav=document.createElement('nav');nav.className='operator-bottom';nav.setAttribute('aria-label','Consola de operadora Premium');main.append(nav);
 const tabs=[['home','Inicio','⌂'],['trips','Viajes','↗'],['reservations','Reservas','▤'],['fleet','Flota','▱'],['more','Más','•••']],pages={fleet,more};const home=document.createElement('section');home.append($('business'));workspace.append(home);pages.home=home;
 for(const [id,label]of tabs.filter(([id])=>['trips','reservations'].includes(id))){const p=document.createElement('section'),h=document.createElement('h2'),text=document.createElement('p'),a=document.createElement('a');h.textContent=label;text.textContent=id==='trips'?'Publica rutas, organiza salidas y programa tus horarios recurrentes.':'Consulta pasajeros, revisa manifiestos y escanea los boletos del próximo embarque.';a.textContent=id==='trips'?'Gestionar mis viajes':'Abrir reservas y embarques';a.dataset.standardPanel=id;p.append(h,text,a);workspace.append(p);pages[id]=p;}
 function renderMore(){if($(active).hidden)active=tools.find(([id])=>!$(id).hidden)?.[0]||'team';tools.forEach(([id],i)=>{toolPages[id].hidden=id!==active;moreNav.children[i].hidden=$(id).hidden;moreNav.children[i].setAttribute('aria-current',id===active?'page':'false');});}
 function show(id,write=false){const chosen=pages[id]?id:'home';for(const [key,p]of Object.entries(pages))p.hidden=key!==chosen;for(const b of nav.children)b.setAttribute('aria-current',b.dataset.destination===chosen?'page':'false');renderMore();if(write){const u=new URL(location.href);u.searchParams.set('panel',chosen);history.pushState(null,'',u);window.scrollTo(0,0);}}
 for(const [id,label,icon]of tabs){const b=document.createElement('button');b.type='button';b.dataset.destination=id;b.innerHTML='<span aria-hidden="true">'+icon+'</span>'+label;b.onclick=()=>show(id,true);nav.append(b);}
 function sync(){nav.hidden=workspace.hidden;renderMore();for(const a of workspace.querySelectorAll('[data-standard-panel]'))a.href='/standard/?'+new URLSearchParams({manage:'1',operator:$('operator').value,panel:a.dataset.standardPanel});}
 for(const [id]of tools)new MutationObserver(renderMore).observe($(id),{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(sync).observe(workspace,{attributes:true,attributeFilter:['hidden']});$('operator').addEventListener('change',sync);window.addEventListener('popstate',()=>show(new URLSearchParams(location.search).get('panel')));
 // Team invitations remain accessible before entitlement activation, as before.
 show(new URLSearchParams(location.search).get('panel'));sync();
}
