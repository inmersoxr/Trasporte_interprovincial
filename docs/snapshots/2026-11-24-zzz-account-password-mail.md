# Acceso: visibilidad de contraseña y correo no configurado

Solicitud: ojito para comprobar la contraseña y diagnóstico de código que no llega.

Baseline6d428be1746ac5b7e92d4556a810397995efa226, rama Cloudflare; preservar main/Pages y excluir S1/0025. Configuración remota consultada2026-11-24: emailfalse, faltan AUTH_EMAIL_FROM y AUTH_EMAIL binding o RESEND_API_KEY. No es una entrega que se esté retrasando: no existe transporte activo. Tampoco se encontraron estas credenciales en el entorno de trabajo; no se imprimieron valores de secretos.

Cambios: helper accesible reutilizado en email-ui.mjs y formularios de cuenta/admin. Botón de ojo typebutton de44px, etiquetas Mostrar/Ocultar contraseña, aria-pressed y teclado. Conserva valor/autocomplete; no persiste contraseña ni estado; vuelve a ocultar al resetear formulario o esconder documento. El login existente sigue disponible aunque el correo esté inactivo.

Registro/recuperación con emailfalse: aviso contextual explícito de que no se envió código, botón de envío deshabilitado, reenvío deshabilitado, guardia adicional al submit; conserva campos y no abre paso de verificación. Backend ya rechazaba sin afirmar entrega; no se relaja prueba de posesión de correo ni se crean cuentas verificadas artificialmente.

Prueba: email-local Chromium PASS11.26s. Cobertura ampliada: ojo con ratón/teclado, valor conservado, registro/verificación/ingreso/cambio/recuperación con proveedor de prueba y configuración emailfalse sin transición falsa. Selectores de envío ajustados para distinguir ojos de botones submit. Sin cambios de base de datos, proveedores, pagos, demo o diseño general.

Activación real sigue bloqueada por un remitente y transporte configurados en Workers. La ruta existente admite AUTH_EMAIL.send o Resend; disponer de token de Cloudflare no configura un proveedor ni un remitente verificado. No se declara correo real operativo. Estado de despliegue y comprobación remota se añaden al cerrar la entrega.
