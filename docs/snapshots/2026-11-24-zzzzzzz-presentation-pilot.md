# Circuito de presentación RutasEC

## Circuito de presentación P0–P4 — 2026-11-24

Prioridad del propietario: publicar datos ingresados por él; cero empresas, vehículos, viajes o GPS precargados. Portal /pilot/ reutiliza cuentas, organización, flota/asignaciones/invitaciones, D1, reservas/QR, operaciones y GPS existentes. Menú administración Operación / Vehículos y equipo; conductor Hoy / Mi semana. Perfil/identidad enlaza al editor existente. Administración ve todos sus viajes con vehículo/conductor y mapa de unidades en curso, limitado a su empresa. Conductor no recibe equipo/invitaciones/finanzas ni viajes ajenos.

Por defecto Solo este viaje. Frecuencias optativas diaria/semanal/mensual con fecha final y vista previa explícita sin escrituras; publicar requiere confirmación. Cada instancia tiene inventario independiente. No se activó renovación automática. Migración0030 aditiva, conserva datos y documentación; elegibilidad de formación explícita sin falsificar revisión legal. No se incluyó S1/0025, Android ni pagos reales.

Pruebas dirigidas: siete casos de piloto/recurrencia PASS y Chromium con invitación/registro, vista previa, compra, lectura jsQR desde vídeo local, permisos de conductor, GPS emulado, observador anónimo y fin de enlace PASS. Se corrigieron errores administrativos mostrados al conductor y meta.changes de finalización afectado por trigger. Capturas1280/390 inspeccionadas. Mapa del navegador local usa tiles externos bloqueados; no demuestra cartografía/red/GPS físicos. Regresión y despliegue en verificación; actualizar con Actions/commits antes de cierre. Cámara, contactos, cuatro vehículos y teléfonos físicos siguen pendientes, sin bloquear entrega técnica.

Guía: [PRESENTATION_PILOT.md](../PRESENTATION_PILOT.md). Estado de publicación y evidencia definitivos en PROGRESS.md/TESTS.md. Restauración: fuente55e77805072e8390bbb0a2e7fa9b202889a0ac2f, D1 Time Travel nativo; no exportar/restaurar ni borrar datos para esta entrega.

## Entrega publicada del circuito — 2026-11-24T06:37Z

Fuente295bd0b26cbe8f3782ca4a1f2e2a16da8e3df87f. Actions45340992233 verify/deploy SUCCESS:74pruebas y8recorridos navegador. Migración0030 aplicada en D1 existente; health pilot-circuit-v1, D1/R2true, pagosdisabled. Versiones API2ceaf44e-6f94-4e5c-b185-3b874f4b5f47, web29ecaf5c-9a04-4023-a20e-1ab6ef583d96 y admina9fbc7f1-6163-4f63-8d9a-de6110b2c600. Recuperación nativa D1 comprobada mediante metadata, sin exportación/restauración ni borrado.

URL de operación: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Navegador público390/1280 PASS: acceso piloto redirige a cuenta, registro sin código visible, sin desbordamiento ni erroresJS. Assets pilot/join/GPS/permisos coinciden byte a byte con fuente; dashboard anónimo401. Google y correo reales siguenfalse; teléfono/correo+contraseña del piloto no dependen de esos proveedores. No es login mediante WhatsApp.

Main permanece0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y Pages HTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se sembraron datos/GPS/cuentas en público. Pruebas reales con cuatro vehículos/conductores/cámaras y teléfonos independientes siguen EN PRUEBAS; fixtureGPS/cámara de CI no las valida. Mantener aplicación visible para GPS web. El plan171tareas continúa: no se declaran completadas todas las fases ni seguridad comercial. Evidencias y capturas: docs/evidence/2026-11-24/presentation/.
