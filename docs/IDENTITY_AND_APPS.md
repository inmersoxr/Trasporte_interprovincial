# Una cuenta RutasEC, múltiples espacios de operadora

La persona inicia sesión una vez. Su user_id sirve para reservar como pasajero y para acceder a operadoras donde memberships autorice un rol. Google/Apple acreditan una identidad, nunca un rol empresarial, una aprobación comercial o un plan Premium. No confiar en operatorId/role enviados por cliente. El servidor comprueba pertenencia y entitlement en cada operación.

Cada operadora comparte backend Workers/D1/R2 y código, con datos por operator_id. Perfil público/miniapp /miniapp/?operator=UUID, consola privada /premium/?operator=UUID y manifest propio; se puede instalar como PWA. Instalar la app no otorga acceso. Pasajeros reservan con el inventario común. No hay un despliegue por empresa ni cuentas duplicadas.

## Google — configuración externa necesaria
Crear un cliente OAuth de tipo **Aplicación web** en https://console.cloud.google.com/apis/credentials (proyecto propio; Google puede pedir configurar marca, audiencia y pantalla de consentimiento). Scopes mínimos openid, email, profile; no acceso a Drive/Gmail. Si el proyecto está en pruebas, agregar los usuarios de prueba en la configuración de audiencia.

Origen JavaScript: https://rutasec-web-dev.drbrownlabs.workers.dev
Redirect URI exacto: https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/auth/google/callback

Configurar en Worker **rutasec-api-dev**, Settings → Variables and Secrets:
- GOOGLE_CLIENT_ID: ID del cliente web.
- GOOGLE_CLIENT_SECRET: secreto de ese cliente (tipo Secret).

Panel directo del Worker: https://dash.cloudflare.com/05c3eb3b0c05413d604a3f0fb6522940/workers/services/view/rutasec-api-dev/production/settings
No es el token API de Cloudflare. No se necesita volver a entregar CLOUDFLARE_API_TOKEN ni cambiar los secretos Actions para login. Nunca guardar el secreto Google en HTML, Git o chat. Nuevos dominios/producción requieren redirect y configuración separados.

## Alcance de identidad previsto
Authorization Code + PKCE, state y nonce, transacción temporal de un uso, validación criptográfica JWT con JWKS Google y comprobación iss/aud/exp/nonce. Sesión aleatoria revocable en cookie Secure/HttpOnly/SameSite, token solo hash en D1, expiración y control Origin para escrituras con cookie. Vinculación del acceso dev actual solo por acción explícita autenticada; no fusionar cuentas por coincidencia de email. Conservar accesos dev existentes para no perder datos.

Un Google ya vinculado a otra cuenta no se fusiona automáticamente con el acceso dev. Recuperación desde el proveedor no acredita pertenencia a una operadora. No certificar login real hasta completar el callback con un usuario autorizado y credenciales reales.

## Apple
La opción es **Iniciar sesión con Apple**. Comparte el mismo modelo de identidad/memberships, pero necesita su propia configuración Apple Developer (Services ID, dominio/return URL y clave privada de firma). No mostrar un botón funcional ni afirmar integración hasta configurarlo y probarlo. Google es el primer proveedor solicitado; Apple queda posterior.

## Límites
PWA es instalación web; no se publica en App Store/Play Store. Instalación nativa/cámara en hardware físico y operación comercial siguen pendientes. Identidad real no activa pagos ni suscripciones comerciales. La autoaprobación de operadoras continúa limitada al entorno de desarrollo.

## Estado comprobado de esta entrega
2026-11-17: /standard-api/auth/config devuelve google=false, missingGoogleConfiguration=[GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET], apple=false. Implementación A1 desplegada y controles locales/cookie dev verificados; callback con cuenta real Google pendiente. Después de configurar ambas variables, comprobar google=true y realizar login real/vinculación con cuenta autorizada antes de declararlo disponible. No configurar Apple sin su integración/configuración separada.
