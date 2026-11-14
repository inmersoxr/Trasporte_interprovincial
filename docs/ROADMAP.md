# RutasEC — Plan de desarrollo comercial
Fecha: 2026-11-14
Estado: plan de trabajo; NO constituye verificación de fases completadas.

## Principios
Preservar UI aprobada y demo, tres modalidades diferenciadas, bajo costo total, despliegue progresivo, snapshots por hito. Consultar PROJECT_MEMORY.md y AGENTS.md. Cloudflare Workers + D1 + R2, GitHub Pages, sin cobros reales hasta autorización y pruebas.

## Fases y criterios de aceptación

### 1. Backend de desarrollo (Work en ejecución; verificar resultado)
Worker separado, D1 dev con migraciones, R2 preservado, API operadoras/vehículos/rutas/reservas/asientos, pruebas de persistencia entre dispositivos, respaldo y rollback. Evidencias: URL dev, pruebas y commits. No confundir deploy GitHub con Cloudflare.

### 2. Identidad y permisos (3–5 días orientativos)
Registro/inicio sesión seguro, recuperación, roles pasajero/operadora/administrador/conductor, aislamiento por operadora, sesiones y auditoría. Pruebas de autorización negativas.

### 3. Motor de reservas (4–7 días)
Compartido: inventario y bloqueo temporal atómico, sin doble venta, expiración de holds; privado tarifa fija: vehículo completo, fecha/hora propia, sin usar asientos compartidos; personalizado: solicitud inmediata o programada; alertas a operadores elegibles disponibles; múltiples propuestas de precio y vehículo; comparación por perfil, reputación y precio; elección libre del pasajero (NO adjudicar al primero); confirmación de disponibilidad y reserva. Pruebas de concurrencia, cancelación y reintentos.

### 4. Preparación de pagos (sin pasarela ni cobros reales)
Definir contratos internos de pago, estados, ledger, conciliación y liquidación simulada. No integrar, contratar ni activar pasarelas de pago. La integración de Deuna, tarjetas y transferencias queda expresamente para la ÚLTIMA fase, después del piloto funcional sin cobros reales.

### 5. Operaciones de transporte (5–8 días)
Panel operadora, manifiesto de pasajeros, boleto QR verificable, abordaje, estados de viaje, cancelaciones, avisos, SOS real solo cuando exista integración adecuada; seguimiento GPS autorizado con consentimiento y retención definida. Mantener simulador y enlaces demo persistentes.

### 6. Standard/Premium y reputación (4–7 días)
Perfiles básicos gratuitos, perfiles enriquecidos, imágenes, comentarios, calificaciones vinculadas a viajes verificables, moderación y prevención de abuso; verificar y corregir controles que se desactivan solos y CTA privado que no responde.

### 7. Piloto funcional sin pasarela (2–4 semanas orientativas)
Onboarding de pocas operadoras, rutas reales, reservas y boletos de prueba, seguimiento, operaciones, soporte, requisitos legales y protección de datos. Pagos estrictamente simulados; no cobrar dinero real ni presentar la prueba como venta comercial.

### 8. Pasarela de pagos — ÚLTIMA fase; después, lanzamiento comercial
Solo cuando el resto de la plataforma esté probado: cotizar y elegir proveedores por costo total; integrar Deuna y/o tarjetas/transferencias según contratos; webhooks seguros, idempotencia, conciliación, reembolsos y liquidaciones. Probar en sandbox y realizar piloto de cobros autorizado antes de habilitar producción comercial. Separar producción, staging y demo; monitoreo, backups, alertas y presupuesto. Workers Paid solo si lo exige la operación.

## Dependencias
Fase 1 precede a identidad/reservas; la pasarela de pagos se implementa únicamente al final, tras completar backend, identidades, reservas, operaciones, Premium y piloto funcional sin cobros. Ninguna fase anterior debe activar pagos reales.

## Entregables por fase
Código y tests, evidencia de ejecución, URL de entorno, estado de despliegue, costo estimado/real, riesgos, plan de rollback, snapshot fechado en docs/snapshots y actualización de PROJECT_MEMORY.md.

## Próxima acción después de Work
Leer el snapshot que Work deje; contrastar endpoint desplegado y D1 contra repo, ejecutar pruebas de aceptación de Fase 1, corregir fallos antes de iniciar Fase 2. La pasarela queda para la última fase.

## Cambio de alcance 2026-11-14 — viajes personalizados
La modalidad personalizada funciona como mercado competitivo bajo demanda, parecido a la solicitud de Uber pero sin asignación automática: alerta a operadores disponibles, ofertas simultáneas, precio propuesto por cada operador y selección explícita por el cliente según perfiles, valoraciones y vehículos. El primer oferente NO tiene prioridad automática. Backend requiere solicitudes, ofertas, elegibilidad/disponibilidad, notificaciones, aceptación atómica y estados; no requiere pasarela de pagos hasta fase final.

## Decisión 2026-11-14 — visualización de ofertas en tiempo real
Las propuestas de operadores para viajes personalizados aparecen al pasajero **conforme llegan**, sin esperar ventana de cierre ni reunir un lote. Cada nueva oferta se incorpora inmediatamente a la lista y se puede comparar con las anteriores. El pasajero puede seleccionar cualquier oferta vigente; no existe prioridad automática para el primero. Actualizar mediante eventos en tiempo real o polling razonable con fallback, mostrando estados de conexión y disponibilidad. Revalidar oferta y disponibilidad al confirmar para evitar adjudicaciones duplicadas. Pagos continúan simulados hasta la última fase.
