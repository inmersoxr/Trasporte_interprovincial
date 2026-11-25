# RutasEC — Handoff Junior J1–J8

## Resultado y rutas
Funcional de desarrollo en Workers + D1 + R2, verificado con datos ficticios; no listo para operación comercial.

- **Standard:** https://rutasec-web-dev.drbrownlabs.workers.dev/standard/
- **Paridad del demo, datos R2 separados:** https://rutasec-web-dev.drbrownlabs.workers.dev/
- **Health:** https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/health
- **Demo original conservado:** https://inmersoxr.github.io/Trasporte_interprovincial/
- **PR:** https://github.com/inmersoxr/Trasporte_interprovincial/pull/1 (sin fusionar main).

## Evidencia por hito
| Hito | Alcance funcional verificado | Snapshot |
|---|---|---|
| J1 | Worker/D1/R2 aislados, migración, persistencia y rollback | 2026-11-14-j1-infrastructure-deployed.md |
| J2 | Static Assets, API por entorno, paridad demo y deploy CI | 2026-11-16-j2-verified.md |
| J3 | Catálogo relacional, operadoras/vehículos/rutas/salidas, tenant | 2026-11-16-j3-verified.md |
| J4 | Asientos, reserva atómica, pago simulado, QR/cancelación | 2026-11-16-j4-verified.md |
| J5 | Privado fijo, horario propio, tarifa por vehículo, exclusividad | 2026-11-16-j5-verified.md |
| J6 | Varias ofertas progresivas, elección libre, revalidación atómica | 2026-11-16-j6-verified.md |
| J7 | Manifiestos, QR manual, estados, historia, roles/seguimiento/SOS DEMO | 2026-11-16-j7-verified.md |
| J8 | Regresión completa, móvil, red, acceso, PWA/caché y handoff | 2026-11-16-j8-verified.md |

Snapshots en docs/snapshots. La fase comercial1–8 del roadmap no se declara terminada por estos hitos Junior.

## Versión y verificación final
Código remoto funcional `bb968c2cf81557a8f7f51c82bba18ce02d931aa8`; CI https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/43908026442 SUCCESS. Worker API versión b2b10bb5-4d45-4906-b9ac-d8caa331fd16; web versión2cad9c07-71fc-4cca-b707-f4fcfb8b8351. Health j7-operations-v1/schema0006, D1/R2=true.

22 tests locales/CI aprobados. Suite Workerd/D1 incluye integridad transaccional, aislamiento, entradas, idempotencia y concurrencia. Las cinco suites remotas de navegador pasan sobre el despliegue final: frontend.e2e, standard.e2e, market.e2e, operations.e2e y regression.e2e. Ver cloudflare-dev/README.md para comandos.

Concurrencia real D1: dos compras de6 plazas sobre8 →200/409, una reserva/pago y retry mismo boleto; cancelación restituye plazas. Dos selecciones custom →200/409, elección de oferta posterior sin prioridad al primero, retiro/ocupación posterior revalidados. Bordaje QR una vez; cancelaciones y eventos de reembolso no duplican efectos.

Browser usa contextos aislados, no teléfonos físicos. Simulación compartida sigue con controlador cerrado, link histórico persiste, observador no controla ni recibe nombres de pasajeros. Manifest/roles y SOS/atención/cierre comprobados. PWA a360/390/1280px, sin overflow, recuperación de acceso con clave privada, rechazo de clave inválida/JSON malformado/401, offline shell sin inventar reservas, APIs fuera de caché y cachés Standard/paridad preservadas mutuamente.

## Aislamiento y despliegue
main remoto sigue fa2c7df394fcac52b3481bc483ab0d55dfedd014. Diff restringido a cloudflare-dev, migraciones nuevas, documentación/memoria y workflow dev; originales index/app/bookings/sw/config/API/workflow Pages intactos. Pages HTTP200 y API demo original healthok=true al cierre. Regresión funcional se hizo contra copia aislada para no escribir en demo original.

Standard usa exclusivamente service binding y D1. Solo la capacidad local se guarda en navegador. Raíz de paridad usa bucket propio; no mezclar historiales ni interpretar reserva R2 demo como reserva Standard D1. Ambos secretos Actions configurados y autenticados; no exponerlos ni pedirlos de nuevo sin evidencia.

## Rollback y datos
Rollback Worker/Static Assets probado J1/J2 mediante versión/fuente. No elimina registros ni revierte migraciones destructivas. Para nueva reversión revisar compatibilidad del esquema y evitar pisar otro despliegue activo. El probe antiguo J1 está deshabilitado sobre API de negocio.

Export/restauración local inicial verificado en J1. Tras autorización explícita del usuario, **el respaldo actual de D1 dev fue restaurado y validado temporalmente** en GitHub Actions43911145328: 29 tablas,15 reservas compartidas/fijas,6 personalizadas y7 salidas. Integridad/FK/unicidad de asientos/calendario correctos; dump del runner eliminado y cero artefactos de datos. El rechazo inicial no se sorteó: se esperó autorización del destino. La comprobación ya no se dispara por push, solo manual verify_restore opt-in. No se creó respaldo duradero ni se probó restauración destructiva sobre la base remota; no equivale a recuperación comercial certificada. Evidencia en snapshot2026-11-16-j8-z-authorized-restore-verified.md.

## Límites para revisión Senior/piloto
- Identidad por capacidades dev; registro/email, recuperación, revocación y expiración comerciales pendientes.
- Autoregistro de operadoras dev no acredita habilitación real. Elegibilidad custom por origen/calendario/capacidad, no GPS online.
- Pagos, reembolsos, SOS y notificaciones internos simulados. No integración bancaria/WhatsApp/emergencias/GPS.
- La ruta de mapa es referencia Cuenca–Guayaquil, expresamente señalizada; no necesariamente ruta contratada.
- QR manual y navegadores probados; cámara/instalación nativa/dos teléfonos físicos pendientes.
- Sin reputación inventada; revisión de reputación, privacidad, retención, abuso/cuotas, carga y obligaciones legales antes de comercializar.
- Listas de historial acotadas; revisar paginación/escala y costo. Sin upgrade de plan ni factura/consumo medidos; no promesa de costo cero.
- Premium empresarial, pagos reales y refactorización global no ejecutados. Revisión Senior posterior basada en esta evidencia.
