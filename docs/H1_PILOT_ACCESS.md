# H1 — Cuenta y operadora del piloto

Entrada: https://rutasec-web-dev.drbrownlabs.workers.dev/account/?returnTo=%2Fstandard%2F%3Fmanage%3D1

1. Tocar Crear cuenta. Teléfono es la opción inicial; incluir + y código internacional (Ecuador +593 y número sin0inicial). También se puede elegir correo.
2. Escribir nombre opcional y contraseña de al menos12caracteres; confirmar contraseña. El ojo permite verla/ocultarla.
3. Tocar Crear cuenta y entrar. En este piloto no se envía ni exige código.
4. La vista Operadores abre Empresa automáticamente si aún no existe operadora. Escribir nombre comercial y registrar. Esa cuenta recibe owner solo en su organización.
5. La operadora nueva obtiene Premium de piloto sin cobro ni vencimiento comercial configurado. Se habilitan las capacidades implementadas, conservando permisos de rol; SRI/pagos reales y otras integraciones externas no se simulan como activas.
6. Desde otro navegador/teléfono, utilizar el mismo teléfono o correo y contraseña; consultar la misma empresa. Cambiar contraseña cierra las demás sesiones. Cerrar sesión revoca su acceso.

## Arquitectura y condición del contacto

`PILOT_REGISTRATION_ENABLED=true` permite cuentas explícitas sin verificación; `PILOT_PREMIUM_ENABLED=true` concede trial gratuito al crear una organización propia. No se habilita ALLOW_DEVELOPMENT_AUTH ni se usan claves manuales/IDs para entrar.

Reutiliza password-auth.mjs, scrypt, límites de intentos, cookies __Host Secure/HttpOnly/SameSiteLax, standard_sessions hash/expiración7d, usuarios/membresías y base existente. Se añade auth_phone_accounts para el identificador telefónico y auth_pilot_users para distinguir cuentas no verificadas. Correo usa auth_email_accounts con verified_at=0; comprobaciones reales de correo exigen >0. No se marca como verificado un teléfono/correo que no se comprobó. La autenticación Google y correo verificado siguen disponibles según su configuración.

Las cuentas piloto no reciben administración global, aun si declaran un correo preautorizado. Contactos ya registrados no se sobrescriben ni se fusionan por coincidir en email. El registro piloto solo se acepta en el host de la app, no en admin. La revisión documental/habilitación de una operadora continúa separada.

Premium reutiliza platform_subscriptions trial,fee0,next_due_onNULL y el trigger de entitlement0023 existente. No crear un segundo sistema de planes ni abrir APIs sin membresía. Las organizaciones comerciales existentes no se alteran. La segmentación definitiva queda pospuesta.

## Estado y pruebas

Migración0029 aditiva, sin borrar datos. Worker/SQL de prueba comprueban rutas reales: registro teléfono/correo, login, cookie, owner, plan, idempotencia, contacto duplicado concurrente, contraseña/cambio/revocación, denegación de empresa ajena y de autoridad global. Chromium prueba dos contextos sin cookies compartidas, recarga, UI de empresa/Premium y alternativa de correo;360/390/1280 y capturas reales. Se conserva información ante errores y no se muestra un paso de código ficticio.

La recuperación por correo sigue pendiente de transporte/remitente. Teléfono es un identificador sin verificación, no un canal SMS/WhatsApp ni una recuperación automática; conservar contraseña y solicitar soporte privado si hace falta. No afirmar titularidad de contacto ni confianza de producción.

01.09: sesiones independientes automatizadas no sustituyen la validación en dos teléfonos reales. Se despliega H1 para permitir esa prueba, se mantiene pendiente y no se cierra toda Fase01 hasta recibir evidencia física. Cuatro vehículos/conductores y56viajes siguen pendientes de datos y pruebas reales.

Rollback: desactivar flags del piloto y recuperar Worker anterior; mantener tablas aditivas y datos. Las cuentas piloto sin contacto verificado no se consideran verificadas al apagar el flag. No hace falta crear otra base ni eliminar perfiles.
