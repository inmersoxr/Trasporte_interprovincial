# Premium empresarial — etapa separada autorizada

El usuario solicitó iniciar Premium posponiendo revisión Senior. Standard J1–J8 funcional permanece disponible. No modificar Pages, demo Premium existente, ledger demo ni habilitar cobros. La autorización no certifica producción comercial.

## Hitos, en orden
| Hito | Alcance | Aceptación |
|---|---|---|
| P1 | Base Premium dev por tenant, flota/kilometraje y mantenimiento | Servidor valida propietario/plan; datos D1, calendario sin solapamientos con Standard, idempotencia, dos sesiones y controles negativos |
| P2 | Personal, sucursales y roles básicos empresariales | Aislamiento, permisos reales y vínculos con recursos compartidos, sin datos ficticios presentados como personal verificado |
| P3 | Centro de operaciones y analítica | Estados y métricas derivados de registros persistidos; seguimiento simulado identificado |
| P4 | Finanzas y documentación interna | Costos/recaudación de demostración trazables; sin facturación fiscal ni liquidaciones/cobros bancarios reales |
| P5 | Perfil/miniapp configurable por operadora | Mismo backend, reservas directas y publicación segura por tenant, sin despliegue por operadora |
| P6 | Regresión y handoff | Móvil/PWA, dos sesiones, concurrencia, respaldo solo con autorización, rollback y límites comerciales documentados |

P1–P6 completados en su alcance funcional de desarrollo. Cierre: Actions44197152730 SUCCESS,31 tests CI y12 suites de navegador PASS, schema0012. Ver [handoff](PREMIUM_HANDOFF.md) y [snapshot final](snapshots/2026-11-17-premium-p6.md). No es certificación comercial.

A1 solicitado durante la ejecución: cuenta común e integración Google preparadas, pruebas criptográficas/callback simulado y cookie dev aprobadas. **Activación Google bloqueada:** faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el Worker. [Configuración exacta](IDENTITY_AND_APPS.md). Google real y Apple no se dan por activos ni verificados. Revisión Senior sigue pospuesta; pagos reales fuera de alcance.

## Reglas
Ruta /premium/ en Worker dev independiente de Pages; recursos compartidos con Standard sin duplicar identidades/vehículos/reservas. Activación Premium **de desarrollo**, gratuita/sin cobro, por propietario autenticado; servidor almacena/verifica entitlement, no basta selector local. No sustituye una suscripción comercial.
Mantener controles mínimos de autorización, entradas, aislamiento, idempotencia y no doble asignación. Una fase a la vez con pruebas locales/remotas y snapshot. No exportar datos o habilitar respaldos automáticos sin alcance autorizado. Senior/comercial, contratos, pagos reales y pruebas físicas siguen pendientes.
