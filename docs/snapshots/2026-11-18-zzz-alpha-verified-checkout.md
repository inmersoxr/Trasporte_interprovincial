# Alpha A — cuenta verificada al reservar y Google inicial

## Autorización y alcance
Tras la auditoría de solo lectura, el usuario pide sign in/verificación al comprar, recurrencia Standard y Google como primer proveedor; Apple posterior. Queda reemplazado el requisito de compra de invitado. Esta autorización permite implementar estas tareas; no se declara resuelto el resto de hallazgos de auditoría.

## Implementación
- Se reutilizan A1/A2 y la misma identidad D1. Confirmación de correo conserva el enlace existente; introducir un código numérico es un requisito anterior aún no implementado. Google debe proporcionar correo verificado y JWT firmado válido; no requiere que RutasEC envíe otro correo al iniciar con Google.
- Cuenta obligatoria al reservar; catálogo público. Middleware privado rechaza accesos legacy no verificados salvo runtime QA explícito. ALLOW_DEVELOPMENT_AUTH=false en configuración del Worker; tests sintéticos habilitan true únicamente en Miniflare. Los datos QA anteriores no se borran ni se reasignan.
- Standard recuerda la salida/ruta elegida en un retorno interno a checkout y reconsulta catálogo/inventario después del acceso. Redirecciones externas/API rechazadas. Google conserva retorno en transacción OAuth temporal; registro por email lo incluye en su enlace. Sin guardar claves o contraseñas en almacenamiento del navegador.
- Cuenta muestra correo de Google, oculta cambio de contraseña si no existe contraseña local y permite vincular Google explícitamente a una cuenta autenticada. No fusión por coincidencia de correo ni roles empresariales concedidos por Google.
- Migración0015_checkout_identity aditiva preparada. Revisión local alpha-verified-checkout-v1. No desplegada.

## Verificación
`npm test`: 41/41 PASS, incluye rechazo de legacy sin verificación y alta Google simulada → reserva D1 → segundo inicio independiente → mismo boleto. JWT sin correo/verificación rechazado; retorno externo rechazado; 39 pruebas previas conservadas.
`node tests/email-local.e2e.mjs`: PASS, Chromium390px, alta/confirmación/contraseña/cambio/recuperación y admin con buzón LOCAL SIMULADO. El primer intento de Miniflare sin red falló por listen EPERM; resuelto con capacidad de red para puertos locales, sin cambiar producto ni omitir pruebas.

GET remoto de health sigue a2-email-password-v1/schema0014, D1/R2=true. GET auth/config: google=false/email=false, GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET y remitente/transporte ausentes. No se ejecutaron pruebas que escriben en remoto ni se enviaron correos reales.

## Entrega y límites
Solo workspace; sin commit/push, migraciones remotas, infraestructura nueva ni deploy. GitHub Pages, frontend demo raíz y sus datos intactos. La activación real Google depende del cliente OAuth y del callback ya documentado en docs/IDENTITY_AND_APPS.md; el token Cloudflare no los sustituye. Premium conserva su implementación y regresión. No se certifica la Alpha ni hardware físico.

Rollback previo a despliegue: descartar exclusivamente estos cambios locales revisados; no hay cambios remotos que revertir. Para un despliegue futuro, aplicar primero migración aditiva y conservar versión anterior; no eliminar identidades/reservas ni ejecutar down-migration destructiva.

Siguiente tarea autorizada: programación recurrente, aislada sobre D1/calendario existente, con pruebas de conflictos e inventario por salida.
