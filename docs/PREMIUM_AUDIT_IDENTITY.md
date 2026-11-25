# Premium — auditoría inicial y cierre de implementación

**Actualización 2026-11-24:** los estados pendientes de la tabla siguiente corresponden a la auditoría inicial. Implementación posterior autorizada, matriz actualizada y límites: [ENTERPRISE_PILOT.md](ENTERPRISE_PILOT.md). No interpretar el inventario histórico como estado posterior a la entrega.

Revisión sobre aplicación nueva Workers/D1/R2, no landing/demo. Baseline remoto384dabeea7fa0dadf24a7fd21883b144f0c7b301; main0e893488 intacto. Health remoto confirma live-gps-v1/schema0026/D1/R2 y pagos disabled. Código desplegado no acredita por sí solo uso real por empresas: pruebas siguientes son locales con D1/R2 de prueba; no sesiones empresariales reales ni GPS físico.

## Inventario individual

Las rutas API siguientes empiezan con /api, servidas por /standard-api. Componentes en cloudflare-dev/. Tablas provienen de sync-service/migrations/.

| Módulo | Estado real | Evidencia y límite |
|---|---|---|
| Centro de operaciones | Parcial | premium/business.mjs, premium-business.mjs, /premium/analytics; consulta bookings, departures, standard_vehicle_slots, standard_operational_events. P3 probado. No centro integral ERP. |
| GPS de flota | Parcial | standard-gps.mjs, standard/gps.mjs; /gps/:trip, /positions, /history, /share; standard_gps_positions/shares. GPS desplegado por viaje; falta centro Premium de mapa multivehículo. El reporte analytics todavía devuelve tracking:simulator: metadato desactualizado, no prueba de GPS agregado. |
| Vehículos | Implementado; pruebas locales | premium/app.mjs, premium-api.mjs; /premium, /premium/vehicle-profile; vehicles + premium_vehicle_profiles. P1. |
| Kilometraje | Parcial | odometer_km monótono y next_service_km; no integración automática de kilómetros GPS ni historial contable de cada actualización. |
| Historial de recorridos | Parcial | historial de eventos/servicios y GPS por viaje; no informe consolidado de kilómetros recorridos por vehículo. |
| Mantenimiento preventivo | Parcial | /premium/maintenance, premium_maintenance, standard_vehicle_slots; ventanas bloquean reservas y cierre libera calendario. P1 prueba carreras; no planes especializados por componente. |
| Aceite | Pendiente especializado | next_service_km genérico no equivale a intervalos/historial de aceite. |
| Neumáticos | Pendiente especializado | Sin inventario, posiciones de neumáticos, vida útil o rotaciones. |
| Frenos | Pendiente especializado | Sin alertas específicas ni historial por componente. |
| Documentación | Parcial | standard-onboarding.mjs, /operator-documents, standard_operator_documents y vistas standard_documented_*; revisión/vigencias y bloqueo de publicación, sin centro Premium de alertas multicanal. |
| Empleados | Parcial | premium/team.mjs, premium-team.mjs; memberships, premium_invites, premium_branches. Equipo de acceso, no expediente laboral integral. |
| Conductores/asignaciones | Parcial | /premium/assignments, premium_assignments + standard_drivers; vínculo vehículo/conductor/sucursal. Sin calendario de turnos laborales. |
| Remuneraciones/nómina | Pendiente | Sin motor de sueldos, anticipos, deducciones o roles de pago. |
| Ventas y reservas directas | Parcial; pago simulado | Flujo Standard de bookings/seat_claims/payments reutilizado; no POS/backoffice completo de venta directa. |
| Clientes | Parcial | users, contactos de reservas y datos guardados; no CRM empresarial/cartera de clientes. |
| Cuentas por cobrar | Pendiente empresarial | platform_invoices son cuotas de RutasEC a operadoras, no cuentas por cobrar de pasajeros/clientes de cada empresa. |
| Cuentas por pagar | Pendiente | Gastos registrados no equivalen a obligaciones, vencimientos y saldos a proveedores. |
| Gastos operativos | Implementado básico; prueba local | premium/finance.mjs, premium-finance.mjs; /premium/expenses, /expenses/:id/void, /expenses/:id/document; premium_expenses, vínculo opcional vehículo, idempotencia/anulación. P4. |
| Pagos a proveedores | Pendiente | Sin proveedores, órdenes de pago, conciliación ni saldos. Comprobante interno explícitamente no bancario/fiscal. |
| Liquidaciones | Esquema preparado, pendiente circuito | settlements/settlement_items en0001; no motor ni interfaz Premium operativa de liquidación. |
| Facturación electrónica | Pendiente | fiscal:false y pagos disabled; sin integración SRI, firma, autorización o notas de crédito fiscales. |
| Reportes comerciales | Implementado básico; prueba local | /premium/analytics: ocupación, modos, cancelaciones, calendario; límites100 y periodo366 días. P3. |
| Reportes financieros | Parcial/referencial | /premium/finance: ingresos contractuales de reservas y gastos; simulated:true/referenceResultCents. No contabilidad ni efectivo bancario. P4. |
| Rentabilidad vehículo/ruta | Pendiente consolidación | Costos pueden ligarse a vehículo; falta distribución de costos/ingresos y márgenes por ruta/vehículo. Total agregado no acredita esta función. |
| Roles empresariales | Implementado básico; pruebas locales | owner/admin/dispatcher/driver, memberships/premium_assignments, premium-api.mjs/standard-permissions.mjs; aislamiento y revocación P2/I2. No permisos laborales/financieros granulares completos. |

## Relaciones comprobadas en código y pruebas

operators→vehicles→departures/standard_booking_details/standard_custom_bookings; memberships→premium_assignments→vehicle/branch/driver. premium_maintenance→standard_vehicle_slots comparte exclusión con viajes. bookings→payments y pasajeros/asientos; premium_expenses→operator y vehículo opcional. Los reportes unen reservas/servicios con operador/vehículo; no existe todavía unión completa con nómina/proveedores/obligaciones/liquidaciones. GPS enlaza standard_tracking con vehículo y actor, separado del odómetro manual.

## Identidad y perfil existentes

premium-profiles.mjs y premium/branding.mjs: premium_profiles con título, descripción, tagline, accent, web, logo/portada, vehicle_photos_json; premium_media + R2. /premium/profile y /premium/media privados; /operator-public-profile y /operator-public-media compartidos con Standard. /miniapps/:operator y /media/:id públicos con selección de imágenes; miniapp/ tiene perfil/tablas de viajes, flota, opiniones y acceso a reserva. standard_reviews integra reputación por compra/embarque/completado. No reconstruir este perfil ni duplicar bucket/base.

Faltan: tres tokens de color, editor Identidad de empresa unificado, HEX/color sincronizados, recorte, galería de instalaciones, previsualización doble, borrador separado de publicado, cancelación/restauración y tema aplicado a consola/conductor. Enlace público ya existe por operadora; QR de perfil y compartir nativo deben completar ese enlace, no crear otra aplicación.

Hallazgos prioritarios:
1. profile() valida sintaxis de accent pero el endpoint compartido Standard llama esa función sin gate Premium. Standard puede enviar un color arbitrario. Corregir política en servidor y añadir prueba negativa, no solo ocultar selector.
2. publicMiniapp usa premium_tenants.active, mientras el acceso comercial efectivo también considera plan/fecha en standard-permissions.mjs. Unificar política de identidad al vencer/pausar Premium; no fiarse de estado cacheado.
3. Una sola columna published no separa guardar borrador de publicar una versión anterior. Implementar snapshot publicado/revisión sin perder compatibilidad con perfiles existentes.
4. premium/business aún rotula tracking simulator y finanzas de referencia. No presentar esos módulos como GPS agregado o ERP real.

## Plan de implementación posterior a esta auditoría

1. Extender premium_profiles de forma aditiva: primary/secondary/accent y galerías tipadas (general, vehículos, instalaciones), borrador y snapshot publicado, revisión CAS. Reutilizar premium_media/R2; validar pertenencia de cada imagen. Standard: logo e información básica, paleta RutasEC. Gate comercial efectivo de Premium en cada escritura y lectura pública.
2. Un editor Identidad de empresa en configuración Standard/Premium; controles de colores libres/HEX, recorte local de imágenes raster, previews Perfil público/Administración en contenedores aislados; guardar/publicar/cancelar/restaurar sin modificar marketplace ni colores semánticos.
3. Tokens CSS centralizados en raíz del contexto empresa, con contraste de texto y estados semánticos independientes; consumir mismo JSON en consola, conductor, miniapp y futura Android. Limpiar tokens al cambiar empresa/salir al marketplace. Ningún despliegue para modificar una identidad guardada.
4. Completar perfil existente con galerías, servicios/contacto y QR/enlace compartible, conservando viajes reales y reputación. No duplicar reservas ni manipular puntuaciones.
5. Aceptación aislada: dos Premium con paletas/fotos distintas y un Standard; persistencia/aislamiento, revocación de plan, edición no autorizada, imágenes privadas/publicadas, borrador, dos previews, mobile/desktop y regresión operativa. No sembrar empresas ficticias en catálogo público real para simular aceptación.

Esta fase documenta auditoría; las capacidades pendientes de identidad NO se presentan como implementadas. Nómina/ERP/fiscal no se incluyen en la implementación de personalización solicitada.

## Pruebas ejecutadas en esta auditoría
node --test tests/premium.test.mjs tests/team.test.mjs tests/business.test.mjs tests/finance.test.mjs tests/profiles.test.mjs tests/operating-access.test.mjs:7/7 PASS42.1s. Cubren calendario/mantenimiento, kilometraje, equipo y revocación, métricas, gastos idempotentes y documentos, perfil/R2 y suscripciones/permisos. No prueban las capacidades de identidad todavía ausentes, ERP completo, recepción GPS física ni operación empresarial con cuentas reales. Salud remota comprobada; las acciones autenticadas se probaron localmente, no sobre datos reales.
