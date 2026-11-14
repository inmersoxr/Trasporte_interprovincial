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
Compartido: inventario y bloqueo temporal atómico, sin doble venta, expiración de holds; privado tarifa fija: vehículo completo, fecha/hora propia, sin usar asientos compartidos; personalizado: solicitud de cotización, respuesta y aceptación. Pruebas de concurrencia, cancelación y reintentos.

### 4. Pagos y liquidaciones (5–10 días más aprobación comercial)
Adaptadores separados: Deuna (enlace móvil directo si API/contrato lo permiten), pasarela de tarjetas a seleccionar por costo total, transferencia bancaria. Sandbox, webhook autenticado, idempotencia, conciliación, reembolsos y liquidación periódica a operadoras. Split no obligatorio; validar marco legal y contractual. Nunca confirmar reserva por redirección de frontend.

### 5. Operaciones de transporte (5–8 días)
Panel operadora, manifiesto de pasajeros, boleto QR verificable, abordaje, estados de viaje, cancelaciones, avisos, SOS real solo cuando exista integración adecuada; seguimiento GPS autorizado con consentimiento y retención definida. Mantener simulador y enlaces demo persistentes.

### 6. Standard/Premium y reputación (4–7 días)
Perfiles básicos gratuitos, perfiles enriquecidos, imágenes, comentarios, calificaciones vinculadas a viajes verificables, moderación y prevención de abuso; verificar y corregir controles que se desactivan solos y CTA privado que no responde.

### 7. Piloto con operadoras (2–4 semanas)
Onboarding de pocas operadoras, rutas reales, pruebas de compra y liquidación, atención al cliente, requisitos legales, fiscales, protección de datos y seguridad; métricas de conversión, fallos y costos.

### 8. Lanzamiento controlado y escalamiento
Separar producción, staging y demo; monitoreo, alertas, backups, restauración, rate limiting, presupuesto y observabilidad. Migrar a Workers Paid por necesidad operativa o límites medidos, no automáticamente.

## Dependencias
Fase 1 precede a identidad/reservas; pagos reales requieren inventario, identidad y contratos; piloto real requiere seguridad, operación y pagos validados. Fases 4–6 pueden solaparse parcialmente.

## Entregables por fase
Código y tests, evidencia de ejecución, URL de entorno, estado de despliegue, costo estimado/real, riesgos, plan de rollback, snapshot fechado en docs/snapshots y actualización de PROJECT_MEMORY.md.

## Próxima acción después de Work
Leer el snapshot que Work deje; contrastar endpoint desplegado y D1 contra repo, ejecutar pruebas de aceptación de Fase 1, corregir fallos antes de iniciar Fase 2.
