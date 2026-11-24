import {session} from './session.mjs';
import {mountEmailAuth,passwordVisibility} from './email-ui.mjs';
import {returnPath} from './return-path.mjs';
const $ = id => document.getElementById(id);
passwordVisibility(document);
const next = returnPath(new URLSearchParams(location.search).get('returnTo'));
let googleReady = false, passwordKind='email';

async function signedIn() {
  const data = await session();
  if (!data.authenticated) throw new Error('No se pudo comprobar tu sesión. Vuelve a entrar.');
  localStorage.removeItem('rutasec-standard-session');
  if (next) { location.replace(next); return; }
  $('signin').hidden = true; $('account').hidden = false;
  $('name').textContent = data.user.display_name; $('email').textContent = data.user.email || data.user.loginPhone || '';passwordKind=data.user.passwordKind||'email';
  $('accountProfile').elements.displayName.value=data.user.display_name;$('accountProfile').elements.phone.value=data.user.phone||'';
  $('passwordSettings').hidden = !data.user.hasPassword;
  $('linkGoogle').hidden = !googleReady || data.user.providers.includes('google');
  $('teams').replaceChildren();
  for (const op of data.operators) {
    const p = document.createElement('p'), link = document.createElement('a');
    link.href = '/pilot/?operator='+op.id;
    link.textContent = op.display_name + ' · ' + ({owner:'Administrador principal',admin:'Administrador',dispatcher:'Despachador',driver:'Conductor'}[op.role] || 'Miembro');
    p.append(link); $('teams').append(p);
  }
  if (!data.operators.length) $('teams').textContent = 'Tu cuenta guarda tus boletos. También puedes registrar tu operadora desde Standard.';
  if(data.platformRole){const p=document.createElement('p'),link=document.createElement('a');link.href='https://rutasec-admin-dev.drbrownlabs.workers.dev/';link.textContent='Administración de RutasEC';p.append(link);$('teams').append(p);}
}
$('logout').onclick = async () => {
  try {
    const response = await fetch('/standard-api/auth/logout', {method:'POST'});
    if (!response.ok) throw new Error('No se pudo cerrar la sesión');
    localStorage.removeItem('rutasec-standard-session'); location.replace('/account/');
  } catch (error) { $('status').textContent = error.message; }
};
$('linkGoogle').onclick = async () => {
  $('linkGoogle').disabled = true;
  try {
    const response = await fetch('/standard-api/auth/google/start', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({link:true})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No se pudo vincular Google');
    location.assign(data.url);
  } catch (error) { $('status').textContent = error.message; $('linkGoogle').disabled = false; }
};
$('changePassword').onsubmit = async event => {
  event.preventDefault(); const form = event.target;
  if (form.elements.password.value !== form.elements.confirm.value) { $('status').textContent = 'Las contraseñas no coinciden'; return; }
  const button = form.querySelector('button:not([type=button])'); button.disabled = true;
  try {
    const response = await fetch('/standard-api/auth/'+(passwordKind==='phone'?'pilot':'email')+'/change-password', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:form.elements.currentPassword.value,password:form.elements.password.value})});
    const data = await response.json(); if (!response.ok) throw new Error(data.error);
    form.reset(); $('status').textContent = 'Contraseña cambiada. Se cerraron las otras sesiones.';
  } catch (error) { $('status').textContent = error instanceof TypeError ? 'No se pudo conectar. Inténtalo de nuevo.' : error.message; }
  finally { button.disabled = false; }
};
$('accountProfile').onsubmit=async event=>{
 event.preventDefault();const form=event.target,button=form.querySelector('button:not([type=button])');button.disabled=true;
 try{const response=await fetch('/standard-api/auth/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))}),result=await response.json();if(!response.ok)throw new Error(result.error||'No se pudo guardar el perfil');await signedIn();$('status').textContent='Nombre y contacto guardados en tu cuenta.';}
 catch(error){$('status').textContent=error.message;}finally{button.disabled=false;}
};
try {
  const response = await fetch('/standard-api/auth/config', {cache:'no-store'});
  if (!response.ok) throw new Error('No se pudo consultar el acceso. Inténtalo de nuevo.');
  const config = await response.json(); googleReady = config.google;
  const auth = mountEmailAuth($('emailAuth'), {prefix:'/standard-api',config,onSignedIn:signedIn,onChallenge:()=>{$('signin').hidden=false;$('account').hidden=true;}});
  $('google').disabled = !googleReady;$('google').hidden=!googleReady;$('googleStatus').hidden=!googleReady;$('linkGoogleHint').hidden=!googleReady;$('authMethods').textContent=config.pilotRegistration?'Con tu teléfono o correo electrónico':googleReady?'O continúa con tu correo electrónico':'Entra con tu correo electrónico';
  $('googleStatus').textContent = googleReady ? '' : 'El acceso con Google todavía no está habilitado.';
  $('google').onclick = () => { auth.showLogin(); location.assign('/standard-api/auth/google/start' + (next ? '?returnTo=' + encodeURIComponent(next) : '')); };
  const data = await session(); if (data.authenticated && !auth.hasChallenge()) await signedIn();
  if (new URLSearchParams(location.search).has('error')) $('status').textContent = 'No se pudo iniciar sesión. Inténtalo de nuevo.';
} catch (error) { $('status').textContent = error instanceof TypeError ? 'Sin conexión. Vuelve a conectar para entrar.' : error.message; }
