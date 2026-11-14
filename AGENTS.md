# Instrucciones persistentes — RutasEC
Antes de cualquier tarea leer `PROJECT_MEMORY.md` y el snapshot más reciente de `docs/snapshots/`. Consultar `README.md`, `LIVE-DEMO.md`, `BOOKINGS-DEMO.md` y código fuente relevante. Priorizar costo total, fiabilidad, no regresiones y migración gradual de demo a producción. No inventar pruebas ni despliegues. No asumir que GitHub actualiza Cloudflare. Mantener tres modalidades distintas (compartido por asiento; privado por ruta con precio fijo; privado personalizado por cotización). Split payment es opcional, no requisito. Tarifas de pasarelas son referenciales hasta cotización escrita. No exponer secretos ni datos personales. Documentar cada hito en snapshot fechado, preservar anteriores y actualizar `PROJECT_MEMORY.md` al tomar decisiones.


## Protocolo de ejecución — Junior primero, Senior después (2026-11-14)
La prioridad actual es hacer funcionar Standard con integraciones disponibles. No detener el desarrollo para una re-arquitectura total, ni desarrollar ahora Premium empresarial, pasarelas de pago reales o endurecimiento avanzado no bloqueante. Sí aplicar controles mínimos imprescindibles: autorización de operaciones, aislamiento básico de datos, validación de entradas, no exposición de secretos/datos personales, integridad e idempotencia de reservas y protección contra doble asignación. Nunca declarar listo para producción comercial un demo con estas limitaciones.

### Una fase a la vez
1. Antes de tocar código, comprobar el estado real del repositorio, último commit, despliegues y trabajo paralelo en Cloudflare. No duplicar ni sobrescribir el trabajo activo de otro agente. Registrar qué está confirmado y qué sigue pendiente.
2. Trabajar sobre UNA fase y UNA tarea verificable a la vez según `docs/ROADMAP.md`. Indicar objetivo, archivos afectados, dependencia, prueba y criterio de aceptación. No iniciar la siguiente fase sin cerrar y documentar la anterior; se permiten tareas de infraestructura paralelas solo si están aisladas.
3. Implementar el mínimo funcional integrado, sin rediseñar la UI aprobada, sin añadir frameworks/servicios por prestigio y sin refactorizaciones globales innecesarias.
4. Ejecutar pruebas locales pertinentes y, si se dispone de acceso, pruebas reales del entorno de desarrollo; incluir pruebas de errores, persistencia, dos sesiones y concurrencia cuando correspondan. No afirmar que una función está desplegada porque exista un commit o una migración SQL.
5. Al cerrar la tarea, reportar: implementado, verificado, no verificado, URL/entorno, pruebas y resultados, commit, regresiones, riesgos, costo/consumo si aplica, rollback y siguiente tarea. Guardar snapshot fechado y actualizar memoria si cambian decisiones.
6. Si falla una prueba o dependencia, corregir antes de avanzar. No marcar fase como completada con botones inertes, estados ficticios presentados como reales o datos que no persisten.

### Cloudflare en curso — prioridad inmediata
La última sesión de trabajo recuperada indicó que el acceso a Cloudflare expiró antes de confirmar creación de D1 o despliegue del backend nuevo. Este dato es histórico: verificar estado ACTUAL, no asumir que sigue pendiente ni que ya terminó. El trabajo de Work en Cloudflare puede seguir activo: primero revisar su resultado, commits, URLs y evidencias.
- Mantener `https://inmersoxr.github.io/Trasporte_interprovincial/` como demo público intacto, con Standard y Premium demostrativos, PWA, mapas, reservas, QR, simulación y seguimiento.
- Mantener separadas la API demo `https://rutasec-viajes-sync.cebx3001.chatgpt.site`, su ledger R2 y la nueva API/base D1 de desarrollo. No modificar, borrar, migrar o reutilizar datos del demo para pruebas destructivas.
- Verificar D1 dev, bindings, migraciones, Worker de desarrollo y endpoints mediante ejecución real antes de integrar frontend. El SQL existente no acredita despliegue.
- Preparar frontend Cloudflare Workers Static Assets en URL independiente y configuración por entorno; verificar rutas, manifest, service worker, CORS, enlaces, caché y paridad funcional. GitHub es la fuente del código, no el destino de ejecución del Worker. No redirigir GitHub Pages.
- Mantener pagos simulados y datos ficticios. Registrar prueba de rollback antes de adoptar la URL Cloudflare como entorno principal de desarrollo Standard.

### Orden funcional Junior
J1 verificar backend Cloudflare dev (Workers/D1/R2) y aislarlo del demo.
J2 integrar frontend Standard en entorno Cloudflare independiente y validar navegación/funciones existentes.
J3 operadoras, vehículos, rutas, salidas y catálogo persistentes; controles funcionales.
J4 compartido con asientos numerados, inventario consistente, reserva simulada, boleto/QR, cancelación.
J5 privado de tarifa fija: vehículo completo, fecha/hora propias, sin consumir plazas compartidas; impedir conflictos de disponibilidad.
J6 privado personalizado: solicitud, difusión a operadores elegibles, múltiples ofertas con precio/vehículo, visualización conforme llegan y selección libre con revalidación; nunca adjudicar automáticamente al primero.
J7 operaciones básicas: panel, manifiesto, abordaje, estados, historial, seguimiento y notificaciones de demostración claramente etiquetadas.
J8 regresión integral Standard, dos sesiones/dispositivos, persistencia, errores y documentación de lo que es demo versus funcional. Revisión Senior posterior sobre evidencia y código.

Premium empresarial, controles avanzados de planes, pagos reales, liquidaciones, y auditoría/refactorización Senior quedan después del Standard funcional; el demo Premium existente se conserva íntegro. La pasarela real se aborda únicamente en la fase final autorizada, según el roadmap. Si la infraestructura J1 no está lista, no fingir su disponibilidad ni conectar Standard a endpoints inexistentes.
