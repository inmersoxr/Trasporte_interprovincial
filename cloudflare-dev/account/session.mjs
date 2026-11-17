export const hasAccess=()=>!!localStorage.getItem('rutasec-standard-session')||document.documentElement.dataset.signedIn==='true';
export async function session(){const r=await fetch('/standard-api/auth/session',{cache:'no-store'});if(!r.ok)throw new Error('No se pudo consultar tu sesión');return r.json();}
export async function mountAccount(container,onChange=()=>{}){const link=document.createElement('a');link.href='/account/';link.textContent='Mi cuenta · iniciar sesión';container.append(link);
 try{const data=await session();document.documentElement.dataset.signedIn=String(data.authenticated);if(data.authenticated){localStorage.removeItem('rutasec-standard-session');link.textContent='Mi cuenta · '+data.user.display_name;}onChange(data);document.dispatchEvent(new CustomEvent('rutasec:account',{detail:data}));}catch{link.textContent='Mi cuenta · comprobar conexión';onChange({authenticated:false,offline:true});}
}
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
