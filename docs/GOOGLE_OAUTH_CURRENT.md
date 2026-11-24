# Google OAuth — aplicación actual RutasEC

Cliente Web application, nombre Rutas Ecuador. Inicio por redirección de servidor (Authorization Code + PKCE), sin Google Identity Services JavaScript. **Authorized JavaScript origins: vacío.** No configurar orígenes de GitHub Pages, localhost o API aislada.

**Authorized redirect URIs**, una entrada por fila, sin barra final:

```
https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/auth/google/callback
https://rutasec-admin-dev.drbrownlabs.workers.dev/platform-api/auth/google/callback
```

Las rutas internas del Worker son `/auth/google/start` y `/auth/google/callback`; el navegador utiliza los prefijos de proxy anteriores. Ambos hosts llegan al mismo rutasec-api-dev existente. No crear otro Worker/base/proveedor de usuarios. Rutas exactas definidas por APP_ORIGIN/ADMIN_ORIGIN y verificadas en identity.test.mjs y verify-google-deployment.py.

## Credenciales y activación

1. Crear el cliente anterior en Google Auth Platform y obtener **Client ID y Client Secret**. El Secret es necesario para este cliente web confidencial.
2. Abrir [GitHub Actions secrets de este repositorio](https://github.com/inmersoxr/Trasporte_interprovincial/settings/secrets/actions). Crear `GOOGLE_CLIENT_SECRET` con el Secret. Escribirlo solo en el campo Secret; no incluirlo en código, capturas, logs, issues o conversaciones.
3. El Client ID es público: puede proporcionarse al agente para añadirlo a `vars.GOOGLE_CLIENT_ID` del wrangler.json de la API. Alternativamente, guardar `GOOGLE_CLIENT_ID` también en GitHub Actions secrets; ese valor tiene prioridad. No usar credenciales OAuth de Android/iOS.
4. Con ambas credenciales disponibles, ejecutar el workflow **Verify and deploy isolated Cloudflare frontend**, rama `codex/cloudflare-standard-junior`, con **deploy=true**, o publicar el Client ID en esa rama para activar el push existente. El agente puede continuar la publicación normal cuando esté configurado el Secret.
5. El job `cloudflare-development` importa ambos valores en rutasec-api-dev con Wrangler por stdin. `keep_vars` y la carga sin valores evitan borrar credenciales existentes. Ausencia de ambos valores: omite carga; presencia parcial/inválida: falla con mensaje sin datos sensibles. El Secret nunca se sirve al navegador.
6. Verificación automática en ambos hosts: config.google=true; inicio302 a accounts.google.com, callback exacto, PKCE, scope openid/email/profile, cookie de estado Secure/HttpOnly. Esta comprobación no simula consentimiento ni declara un login real.
7. Prueba real final: abrir [Mi cuenta](https://rutasec-web-dev.drbrownlabs.workers.dev/account/), tocar Continuar con Google, aceptar en Google y regresar autenticado. Recargar para verificar sesión persistente; cerrar sesión y volver a entrar para comprobar que reutiliza el usuario. Entrar en Mi operadora para completar perfil. Si Google limita el acceso desde Audience, autorizar allí los correos del piloto.

Si el Secret se configura directamente en Cloudflare, debe ser un secreto de **rutasec-api-dev** llamado `GOOGLE_CLIENT_SECRET`; el frontend y el Worker admin no deben recibirlo. Guardar el Client ID público en la API y dejar vacíos los secretos GitHub para evitar que un valor antiguo los reemplace. La vía GitHub de arriba permite preparar todo sin acceso interactivo adicional a Cloudflare.

## Implementación y persistencia reutilizadas

- `identity.mjs`: transacción OAuth de5min con state hash, nonce y PKCE S256; intercambio de código server-side en oauth2.googleapis.com/token; validación RS256 contra JWKS Google con issuer/audience/azp/nonce/exp/iat/sub/email_verified.
- `auth_transactions`, `auth_identities`, `users`, `standard_sessions` en D1 existente. Sesión aleatoria de7d, token hash en DB, cookie por host Secure/HttpOnly/SameSiteLax. Logout revoca la sesión; no se guarda access_token/id_token en localStorage ni se solicita acceso offline.
- Identidad estable por subject Google. No fusionar automáticamente dos usuarios por coincidencia de email. Una cuenta existente por correo debe entrar y elegir Vincular Google para conservar su usuario/boletos/permisos. Google no concede membresías empresariales ni administración global por parámetros del navegador.
- `account/app.mjs`, `account/index.html`, `admin/panel.mjs`: mismo botón para registro e inicio; visible antes del formulario de correo en cuenta. Elegir Google descarta un desafío de correo pendiente para evitar que ese paso oculte la sesión ya creada por Google.
- `return-path.mjs`: retorno limitado a pantallas Standard/Premium/perfil/identidad/empresa, nunca URL externa ni endpoints de API.
- Correo/contraseña conserva su implementación, ojito, verificación y recuperación. Google demuestra el correo mediante Google; no necesita el transporte de códigos de RutasEC. El correo propio sigue sujeto a la configuración de envío pendiente.

## Pruebas, límites y fuentes

Pruebas de firma/claims alterados, callbacks web/admin, CSRF, replay/expiración, persistencia/revocación, identidad estable, no asignación de roles y vinculación explícita en identity.test.mjs. Activación: google-provision.test.mjs y google-provision.py prueban que ausencia de secretos no modifica servidor, pares incompletos se rechazan, payload viaja por stdin y salidas del proveedor no se imprimen. Alpha Chromium incluye desafío de correo pendiente antes de Google, acceso a operadora, checkout y boletos entre sesiones; correo Chromium conserva registro/cambio/recuperación.

Los proveedores de CI son de prueba. El acceso real de Google requiere credenciales reales y consentimiento de una persona; no declarar Google activo porque las pruebas locales pasen. Estado de despliegue y activación: snapshot fechado de esta entrega. Sin nueva base, migraciones ni pagos. Rollback de frontend/flujo a versión anterior manteniendo tablas; credenciales permanecen en el Worker y pueden revocarse desde Google Cloud si el propietario lo requiere.

Fuentes oficiales: [OAuth para servidor web](https://developers.google.com/identity/protocols/oauth2/web-server), [validación OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect), [políticas OAuth](https://developers.google.com/identity/protocols/oauth2/policies).
