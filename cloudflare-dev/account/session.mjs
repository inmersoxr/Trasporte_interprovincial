export const hasAccess=()=>document.documentElement.dataset.signedIn==='true'||new URLSearchParams(location.search).get('dev')==='1'&&document.documentElement.dataset.developmentAuth==='true'&&!!localStorage.getItem('rutasec-standard-session');
export function signInToReserve(kind,id){
 const next=new URL('/standard/',location.origin);next.searchParams.set('reserve',kind+':'+id);
 location.assign('/account/?returnTo='+encodeURIComponent(next.pathname+next.search));
}
export function signInFor(query){location.assign('/account/?returnTo='+encodeURIComponent('/standard/?'+new URLSearchParams(query)));}
export async function session(){const r=await fetch('/standard-api/auth/session',{cache:'no-store'});if(!r.ok)throw new Error('No se pudo consultar tu sesión');return r.json();}
export async function mountAccount(container,onChange=()=>{}){const link=document.createElement('a');link.href='/account/';link.textContent='Mi cuenta · iniciar sesión';container.append(link);
 try{const data=await session();document.documentElement.dataset.signedIn=String(data.authenticated);document.documentElement.dataset.developmentAuth=String(data.developmentAuth===true);if(data.authenticated){localStorage.removeItem('rutasec-standard-session');link.textContent='Mi cuenta · '+data.user.display_name;}onChange(data);document.dispatchEvent(new CustomEvent('rutasec:account',{detail:data}));}catch{link.textContent='Mi cuenta · comprobar conexión';onChange({authenticated:false,offline:true});}
}
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
