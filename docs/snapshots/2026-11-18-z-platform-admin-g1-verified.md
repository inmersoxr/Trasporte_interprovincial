# G1 verificado — administración de RutasEC en hostname independiente

## Resultado y alcance
Entrada https://rutasec-admin-dev.drbrownlabs.workers.dev/ publicada como Worker de fachada, assets propios y service binding a rutasec-api-dev. Pasajeros/operadoras siguen en rutasec-web-dev; misma identidad/backend/D1/R2. No se muestra enlace administrativo en menús públicos. Rol global platform_admins separado de memberships de empresa. Panel de directorio, planes y fechas referenciales, cuotas internas/pagos manuales/saldos/anulación e historial. Sin cobros, verificación bancaria, factura fiscal ni suspensión automática por atraso.

## Código y despliegue comprobados
Código de aplicación86521f038b954a1bceac5be323339b207a6afb60; entrega con test remoto y documentación de main preservada2844fab78c47bf348ac84599c5590917dce820cb (local17e778d). Actions https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/44242242297 SUCCESS.
- verify134592667732:36 tests,36 PASS,0 FAIL.
- deploy134592832571: SUCCESS, API bdea35f4-ca3e-4bce-985b-2a515b0096fa; web fdde5b1f-391e-40b2-a1da-0753926e3626; admin860e22bf-98cf-4669-9dbf-a7fa6265d926.
- restore-check y bootstrap-platform-owner: SKIPPED intencionalmente.
Health remoto: g1-platform-admin-v1/schema0013, ok/D1/R2=true, payments=disabled. Ambos secretos Cloudflare Actions funcionan; no pedirlos otra vez.

## Pruebas y límites de la evidencia
36 tests locales/CI: ACL global/roles owner-auditor, operadora403, revisión/idempotencia de suscripción, pagos parciales concurrentes200/409 sin sobrepasar saldo, anulaciones conservan datos/auditoría, paginación/búsqueda, bootstrap first-owner sin reemplazar autoridad existente y callback OAuth por hostname con PKCE/CSRF origen=host. Regresión previa Standard/Premium completa incluida.
Chromium REAL con Workerd/D1 LOCAL: platform-local.e2e PASS. Tres identidades, CRUD de plan/fecha/cuota/pago/anulación, recarga/persistencia, auditor readonly, propietario de empresa rechazado y360/390/1280px. Datos y ACL locales exclusivamente ficticios.
Chromium remoto platform.e2e PASS: hostname/assets/CSP/no-store, cuenta crea acceso e ID propio, anónimo401, cuenta sin permiso403 sin guardar clave, ausencia de autoalta y móvil. Privilegio remoto NO aprovisionado ni CRUD global remoto certificado.
Regresiones reales contra Cloudflare: frontend (paridad/demo/maps/SOS/offline), regression (360/390/1280, restore válido/inválido, PWA/caché), identity (cookie dev/CSRF/logout) y premium (persistencia/calendario/permisos) PASS. Google real NO probado; permanece configurado=false por GOOGLE_CLIENT_ID/SECRET faltantes. Callback admin adicional documentado, no se inventa inicio Google activo.

## Primer acceso pendiente de identificar al propietario
Se solicitó al usuario el UUID mediante «Copiar ID de mi cuenta» en /account/. No se asumió identidad por email ni se elevó usuario de QA. Activación queda pendiente de su ID explícito y ejecución del procedimiento de infraestructura. Script first-owner preparado y probado; no hay endpoint web de autoconcesión. Workflow_dispatch preparado, pero workflow ausente de main (404): no prometer botón Run workflow mientras solo exista en rama. Guía exacta docs/PLATFORM_ADMIN.md. No compartir claves privadas ni tokens para indicar el ID.

## Trabajo paralelo conservado y continuidad
main avanzó a86d37507883f9df6447a9c8304cbbb79a6988132 por3 commits documentales: solo PROJECT_MEMORY y snapshot2026-11-18-standard-onboarding-codex-handoff.md cambiaron desde fa2c7df. Archivos del demo intactos. Se leyó y conservó ese documento completo, y su bloque de memoria se integró sin reemplazar los estados Cloudflare comprobados. Entrega remota2844fab tiene padres86521f y86d3750, por lo que el main documental queda incorporado a la rama; esta tarea no escribe main ni fusiona PR1.
El onboarding legal/documental detallado en el nuevo snapshot es especificación pendiente comercial. No reiniciar J1/J2 ni retirar Premium/G1 autorizados por el usuario. Estado funcional Cloudflare y demo Pages son distintos y están documentados con evidencia.

## Operación y rollback
Sin exportaciones/restores nuevos, upgrades, pagos reales ni costos medidos. Deshabilitar fachada administrativa o volver versiones API/assets si es necesario; conservar tablas y registro financiero/auditoría. Revocar platform_admins mediante infraestructura cuando se retire autoridad; no borrar cuotas/pagos para simular rollback. Guía docs/PLATFORM_ADMIN.md. Falta aprovisionar primera autoridad tras identificación; siguientes ampliaciones (revisión documental de operadoras, automatización comercial, Google real) requieren su propia verificación y no se dan por implementadas aquí.
