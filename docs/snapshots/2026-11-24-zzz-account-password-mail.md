# Acceso: visibilidad de contraseña y correo no configurado

Solicitud: ojito para comprobar la contraseña y diagnóstico de código que no llega.

Baseline6d428be1746ac5b7e92d4556a810397995efa226, rama Cloudflare; preservar main/Pages y excluir S1/0025. Configuración remota consultada2026-11-24: emailfalse, faltan AUTH_EMAIL_FROM y AUTH_EMAIL binding o RESEND_API_KEY. No es una entrega que se esté retrasando: no existe transporte activo. Tampoco se encontraron estas credenciales en el entorno de trabajo; no se imprimieron valores de secretos.

Cambios: helper accesible reutilizado en email-ui.mjs y formularios de cuenta/admin. Botón de ojo typebutton de44px, etiquetas Mostrar/Ocultar contraseña, aria-pressed y teclado. Conserva valor/autocomplete; no persiste contraseña ni estado; vuelve a ocultar al resetear formulario o esconder documento. El login existente sigue disponible aunque el correo esté inactivo.

Registro/recuperación con emailfalse: aviso contextual explícito de que no se envió código, botón de envío deshabilitado, reenvío deshabilitado, guardia adicional al submit; conserva campos y no abre paso de verificación. Backend ya rechazaba sin afirmar entrega; no se relaja prueba de posesión de correo ni se crean cuentas verificadas artificialmente.

Prueba: email-local Chromium PASS11.26s. Cobertura ampliada: ojo con ratón/teclado, valor conservado, registro/verificación/ingreso/cambio/recuperación con proveedor de prueba y configuración emailfalse sin transición falsa. Selectores de envío ajustados para distinguir ojos de botones submit. Sin cambios de base de datos, proveedores, pagos, demo o diseño general.

Activación real sigue bloqueada por un remitente y transporte configurados en Workers. La ruta existente admite AUTH_EMAIL.send o Resend; disponer de token de Cloudflare no configura un proveedor ni un remitente verificado. No se declara correo real operativo. Estado de despliegue y comprobación remota se añaden al cerrar la entrega.

## Primera entrega y comprobación remota
Commit712c49d5f986321f22e8adce553ccaf042f77d0c, Actions45319001461 verify/deploy SUCCESS,69 pruebas y seis recorridos navegador PASS. Activos de cuenta y copia admin coinciden byte a byte. Chromium remoto: ojo con ratón/teclado, valor intacto, aviso de correo inactivo, sin paso falso de código ni errores JS;360/390/1280 sin desbordamiento. Inspección visual detectó aviso duplicado y texto heredado que prometía envío aun con emailfalse: corregidos en seguimiento, con aserciones de regresión. Curl HTTPS normal; navegador de inspección usa ignoreHTTPSErrors por el proxy del entorno, sin cambio de seguridad en la aplicación.

main0e893488 intacto; Pages conserva SHA256c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f. Ningún correo real enviado ni registro ficticio creado.

Se solicitó al propietario el dominio disponible para configurar el remitente. Documentación oficial consultada: https://developers.cloudflare.com/email-service/configuration/send-bindings/ y https://developers.cloudflare.com/email-service/ . El envío arbitrario requiere dominio incorporado y plan habilitado; no se activó servicio pagado ni se inventó remitente.

## Cierre de entrega
Seguimiento1e07bbb7970ea5cdf68371ec900920d4d854c66c: Actions45319595023 verify/deploy SUCCESS, sin migraciones nuevas. Local correo PASS11.24s; CI vuelve a completar69 pruebas y seis recorridos navegador. Comprobación remota final PASS: icono con ratón/teclado, ocultación/valor intacto, aviso único, ausencia de promesa de envío cuando emailfalse, sin paso falso de código,360/390/1280 sin desbordamiento/errores JS. Archivos compartidos de cuenta y admin coinciden byte a byte con código final. Pages conserva hash anterior.

Correo real sigue emailfalse (faltan AUTH_EMAIL_FROM y AUTH_EMAIL binding o RESEND_API_KEY). No se recibió todavía respuesta sobre dominio al cerrar esta corrección; activación de transporte queda bloqueada por configuración externa, sin afirmar entrega de códigos.
