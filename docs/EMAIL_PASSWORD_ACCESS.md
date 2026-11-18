# A2 — acceso normal por correo y contraseña

## Experiencia de usuario
En /account/ y rutasec-admin-dev: Entrar (correo/contraseña), Crear cuenta (correo y nombre opcional), confirmación por enlace y elección de contraseña, Olvidé mi contraseña, cambio de contraseña dentro de la sesión. No se muestran IDs/UUIDs/claves de desarrollo ni se solicitan para asignar el acceso del propietario. El bootstrap por UUID quedó cancelado por el usuario. Google queda opcional/oculto si no está configurado.

Primera autoridad: correo previamente autorizado del propietario fijado solo como hash en platform_owner_email_policy. El receptor debe demostrar posesión del buzón mediante el enlace y elegir contraseña; solo entonces, si la autoridad global está vacía, se asigna owner. No autoaprobar otros correos ni confiar en parámetros role enviados por cliente. La identidad dev previa no se fusiona por simple declaración de email; no borrar datos legacy para aparentar una migración. Herramientas QA de Standard solo con ?dev=1; no forman parte del flujo normal.

## Implementación y controles
Schema0014: credenciales email verificadas, acciones temporales de uso único, contadores de intentos hasheados y política inicial. Registro no crea usuario/credencial activa antes de confirmar. Enlaces en fragmento, retirado inmediatamente al abrir, nunca devueltos por API ni registrados en logs. Caducidad1h verificación/15min recuperación, token aleatorio256bits guardado solo como hash. Mensajes de solicitud genéricos para direcciones existentes/inexistentes, sin devolver enlaces ni marcar falsamente un envío.
Contraseña12–128 caracteres, sin reglas artificiales de mezcla, scrypt nativo N32768/r8/p3/sal aleatoria por usuario (32MiB, maxmem64MiB), comparación constante; derivaciones serializadas por isolate para no multiplicar uso de memoria. Sin passwords en claro, logs, Git o URLs. Cookie Secure/HttpOnly/SameSite,7d y revocable. Reset/cambio revocan sesiones y tokens antiguos mediante versión; verificación/cambios con CAS y transacciones. Rate limits por correo/IP hasheados, CSRF Origin=host permitido, sin sesiones o roles para cuentas sin verificar. No es certificación de autenticación comercial ni auditoría Senior.

## Envío real — configuración de infraestructura
Preferencia: Cloudflare Email Service nativo sobre dominio propio onboarded y remitente de ese dominio. Configurar binding send_email llamado AUTH_EMAIL y AUTH_EMAIL_FROM (dirección emisora). No añadir binding operativo ni DNS hasta confirmar un dominio elegible. Alternativa preparada: RESEND_API_KEY + AUTH_EMAIL_FROM de remitente autorizado; no se creó cuenta externa ni contrató plan. No pedir al usuario IDs técnicos para iniciar sesión.
Sin remitente/transporte configurados, register/forgot devuelven503 y mensaje explícito de que no se envió correo. Nunca activar usuario/administrador por esa respuesta. Login/cambio de cuentas ya verificadas pueden seguir operando durante caída del transporte. Si el proveedor falla se retira la acción no entregada y se devuelve error, sin afirmar aceptación. Aceptación del proveedor no prueba lectura ni entrega final a la bandeja.
Preflight read-only en CI inspecciona solo conteos de zonas/domain readiness sin alterar DNS ni publicar correos, claves o zonas ajenas. /auth/config muestra email/emailMissing; no muestra valores secretos. Falta verificar la configuración real antes de prometer mensajes al usuario.

## Fuentes técnicas consultadas
- Cloudflare Email Service requiere dominio bajo Cloudflare DNS y sender del dominio onboarded: https://developers.cloudflare.com/email-service/get-started/send-emails/
- Binding nativo/forma de mensaje: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- Scrypt y parámetros de memoria limitados: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## Pruebas y límites
39 tests locales PASS; tres casos nuevos de verificación/login/rol, recuperación/cambio/revocación, caducidad/rate/CSRF y proveedor caído sin envío ficticio. Navegador local email-local.e2e recorre registro→correo SIMULADO→contraseña→admin→cambio→recuperación sin IDs; platform-local.e2e usa login de correo y conserva ledger/roles. No se afirma recepción de correo real ni cuenta del propietario activada hasta verificar entrega y acción real del usuario. QA no concede roles remotos. Evidencia snapshot2026-11-18-zz-email-password-a2.md.

## Rollback
Mantener esquema/credenciales y roles, no restablecer passwords ni borrar datos para volver versión. Volver versiones API/assets y desactivar altas si hace falta; conservar acceso de mantenimiento solo como QA, sin obligar al usuario a copiar claves. Demo Pages/API/ledger originales intactos. No pagos, compras de dominio, exportaciones ni upgrades automáticos.
