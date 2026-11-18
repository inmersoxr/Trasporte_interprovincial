# Tercera interfaz — administración propia de RutasEC (G1)

Entrada independiente: https://rutasec-admin-dev.drbrownlabs.workers.dev/
Pasajeros y operadoras permanecen en rutasec-web-dev.drbrownlabs.workers.dev. Mismo repositorio/backend/identidad/D1/R2; Worker administrativo es una fachada de assets y service binding, no duplica base ni plataforma. No se agrega un menú administrativo a las interfaces públicas. Dominio propio futuro admin.<dominio-controlado> requiere configurar ese dominio, allowed origins y callback OAuth; no inventar dominio disponible.

## Funciones de desarrollo
Directorio global de operadoras con búsqueda/paginación, conteo de flota, estado y Premium dev, plan de referencia, cuota/ciclo y próximo vencimiento. Fechas vencidas/próximos7d y saldo vencido de cuotas internas. Suscripción referencial con control de revisión. Cuotas por período (no fiscales), registros manuales parciales/completos, saldo calculado en servidor y anulaciones que conservan historial. No se transfiere/cobra dinero ni comprueba banco/pasarela. Registrar pago no mueve automáticamente próxima fecha ni Premium; no se suspende una operadora por atraso automáticamente. No inventar cuotas para operadoras sin configuración.

Owner de plataforma modifica; auditor consulta. Los roles de operadora, incluyendo owner/admin, nunca dan acceso global. API comprueba platform_admins en cada petición. No existe endpoint público de bootstrap ni alta de administradores desde la UI. La primera cuenta privilegiada no se asigna a correos sin verificar ni a cuentas de QA.

## Primera habilitación — dato requerido del propietario
1. Abrir https://rutasec-web-dev.drbrownlabs.workers.dev/account/ y crear/restaurar el acceso de desarrollo (o Google cuando esté disponible).
2. Copiar **ID de mi cuenta** y comunicar ese UUID al responsable que aprovisiona la plataforma. Es identificador, no clave privada. Necesitamos que el usuario identifique su cuenta antes de asignar ese primer permiso.
3. Ejecutar manualmente workflow cloudflare-dev.yml sobre la rama de desarrollo, con bootstrap_platform_owner igual a ese ID explícito, deploy=false, verify_restore=false. El job usa environment cloudflare-development, cuenta/base dev fijadas, exige usuario activo y solo permite la primera autoridad. No se ejecuta por push, no puede reemplazar administradores ni crea usuarios. Trigger SQL guarda auditoría atómicamente.
4. En el hostname administrativo iniciar sesión Google (configurado) o pegar la clave privada del acceso dev en el formulario autorizado. La clave se copia en Mi cuenta y se pega solo en el panel, nunca en chat/Git/URL. Solo se conserva allí después de comprobar permiso global.

Nadie queda habilitado por instalar o conocer la URL. El provisionamiento inicial espera el ID que el usuario elija; no se ejecuta con un UUID supuesto. Pruebas locales usan usuarios/ACL exclusivamente ficticios sin conceder roles en remoto.

## Google y sesiones
Mismo cliente/usuario RutasEC; cookies separadas por hostname. Agregar al cliente web Google este callback adicional:
https://rutasec-admin-dev.drbrownlabs.workers.dev/platform-api/auth/google/callback
Y origen JavaScript https://rutasec-admin-dev.drbrownlabs.workers.dev
Mantener el callback original Standard; configuración en IDENTITY_AND_APPS.md. Code+PKCE/state/nonce y JWT verificados como en cuenta principal. CSRF exige Origin permitido y coincidente con host de la petición; el origen público no puede escribir con cookies administrativas. GOOGLE_CLIENT_ID/SECRET siguen siendo dependencia externa si no están configurados. No se da por probado login Google real.

Fachada permite únicamente /platform-api/api/platform/* y /platform-api/auth/*, sin registro público ni catálogo. Assets/datos no-store; sin SW, sin caché offline de administración. CSP self, no frames y no-referrer. Salir elimina acceso local y sesión cookie de ese host; claves dev copiadas siguen siendo capacidades de desarrollo, no sesiones comerciales de producción.

## Alcance, pruebas y rollback
Migración aditiva0013; datos Standard/Premium preservados. Backoffice G1 es un primer bloque funcional, sin contabilidad fiscal, pasarela bancaria, automatización de suscripciones, gestión de privilegios por UI, respaldos nuevos ni certificación comercial. No altera Pages/demo/API/ledger originales ni main. Rollback: volver versiones API y fachada/assets; conservar registros/auditoría y tablas. Si se retira el panel deshabilitar Worker y revocar platform_admins fuera de UI según autoridad vigente, sin borrar cuotas/pagos. Costos/consumo no medidos, ningún upgrade contratado.
Evidencia de ejecución/despliegue en snapshot2026-11-18-platform-admin-g1.md.
