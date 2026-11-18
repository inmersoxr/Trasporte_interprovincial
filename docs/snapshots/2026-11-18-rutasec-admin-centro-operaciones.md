# Snapshot RutasEC — 2026-11-18 — RutasEC Admin / Centro de operaciones corporativo

## Decisión de producto confirmada
Crear una **tercera interfaz administrativa propia de RutasEC**, independiente del portal de pasajeros y de las consolas de operadoras Standard/Premium. Es el centro de control interno de la empresa propietaria de la plataforma, no una cuenta de operador ni un módulo público.

## Arquitectura
- Un backend y un modelo de datos común para pasajeros, operadoras y RutasEC Admin; tres interfaces con ámbitos de autorización diferentes.
- Reutilizar internamente las capacidades de gestión que RutasEC ofrece a las operadoras, pero con alcance transversal y funciones corporativas exclusivas.
- Datos por operadora aislados mediante `operator_id`; el acceso global solo corresponde a roles internos autorizados, con verificación en servidor y auditoría.
- Eventos únicos y persistentes: publicación de viaje, reserva, cambio de plazas y abordaje se reflejan en todas las vistas pertinentes; evitar duplicación de información y métricas.

## Módulos previstos
1. **Dashboard global:** total de operadoras, viajes publicados, reservas, ingresos por comisiones y SaaS, tendencias y períodos.
2. **Operadoras:** altas, verificación, estado, planes Standard/Premium, flotas, miembros, permisos y asistencia.
3. **Operaciones:** todas las rutas, salidas, reservas, capacidad, boletos QR, embarques y seguimiento, con filtros por empresa y período.
4. **Finanzas:** comisiones, suscripciones, liquidaciones, conciliación, facturación y resultados corporativos; métricas reales derivadas del backend.
5. **Pasajeros y soporte:** cuentas, actividad, incidencias, reclamos y atención.
6. **Seguridad:** alertas SOS, revisión de incidentes, permisos y bitácora de acciones administrativas.
7. **Inteligencia de negocio:** demanda por ruta, ocupación, rendimiento de operadoras y crecimiento.
8. **Configuración comercial:** comisiones, precios y condiciones Standard/Premium, planes, límites, permisos y políticas administrables sin editar código.

## Acceso de soporte
Permitir a personal interno autorizado abrir una **vista contextual de una operadora concreta** para diagnóstico/soporte, con alcance explícito, controles de permisos y registro de auditoría. No confundir con autenticarse como el operador ni otorgar acceso global a usuarios de operadoras.

## Identidades y miembros
Mantener identidad personal separada de membresías empresariales. Una persona puede ser pasajero, operador independiente o miembro autorizado de varias operadoras; permisos por contexto activo. Las operadoras administran invitaciones y roles de su equipo. El personal corporativo de RutasEC tiene roles separados de los de las operadoras.

## Estado y restricciones
**Decisión conceptual aprobada; NO se afirma que el panel esté implementado, probado ni desplegado.** Los indicadores del mockup conversacional (248 operadoras, 3.842 viajes, 12.650 reservas, USD 18.420) eran exclusivamente ilustrativos, no datos de negocio. No introducirlos como registros reales.

Preservar íntegro el demo comercial GitHub Pages y su contenido Standard/Premium. Cloudflare es el entorno funcional que debe inspeccionarse antes de implementar; no inferir estado de despliegue desde GitHub. Prioridad de ejecución vigente: Standard funcional y validado primero; no alterar este orden sin instrucción del propietario.

## Alcance de este snapshot
Solo documentación de la decisión y actualización de memoria del sistema. No se modifican frontend, backend, infraestructura, bases de datos, permisos ni despliegues. La implementación del panel requiere una fase posterior expresamente autorizada.
