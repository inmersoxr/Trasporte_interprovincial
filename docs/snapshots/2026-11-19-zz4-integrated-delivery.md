# I4 — conjunto integrado, continuación y recuperación

Entrega solicitada: personalizados inscritos, avisos propios/push (WhatsApp cancelado), personal/planes, operación sin simulador, cambios de servicios, renovación, consulta más allá de límites y supervisión. Detalle de uso/políticas en docs/INTEGRATED_OPERATIONS.md; fases locales enzz1–zz3.

Implementación preparada con migraciones0022–0024, misma API/Workers/D1/R2 y frontend. Catálogo público200 por página, manifiestos100 por tipo y solicitudes20 por página con cursores y enlaces profundos. Prueba201 salidas demuestra continuidad sin duplicación; solicitudes/ofertas se consultan por página propia. Panel global muestra fallos/pending de tareas; CI verifica metadatos Time Travel sin exportación/restauración. No se crea producción duplicada ni se modifica Pages.

Estado de este registro inicial: pruebas dirigidas pasadas, regresión completa y navegador ampliado en ejecución. No afirmar deploy ni recepción real de push aún. Mantener historial de fallos/correcciones y registrar cierre remoto con commit/run/resultado.

Límites externos: Google/correo reales sin configuración externa; permiso/compatibilidad push se concede por persona/dispositivo. No WhatsApp, pagos reales, GPS real ni piloto físico. Time Travel no equivale a respaldo externo o restauración ejecutada. Continúan políticas y alcances comerciales de datos/recuperación.


## Verificación local consolidada
Regresión64/64 PASS307.3s. Navegador Alpha ampliado PASS82.1s: inscripción, solicitud espontánea, cotización con recogida, elección del pasajero y aviso de adjudicación en ambas sesiones, además del circuito previo de expediente/reserva/QR/cámara/embarque/perfil/moderación. Captura custom-notification-390.png revisada; push no configurado en fixture se presenta deshabilitado, sin afirmar envío real. Casos dirigidos dispatch3/3 PASS18.6s tras añadir hueco antes de mantenimiento, firma y despacho concurrente/503/410. Caso operating-access PASS9.5s después de separar eventos reales/simulados. La consulta de oportunidades se limita a la empresa seleccionada y descarta respuestas antiguas al cambiar de empresa.

Primer conjunto preliminar detectó una fixture que intentaba cotizar Alpha sin inscribirse: se actualizó la preparación del caso para el nuevo requisito; la prueba explícita de inscripción rechaza cotización no inscrita. Otra ejecución de navegador encontró un fallo intermitente en retorno a boleto; se añadió diagnóstico y el recorrido completo posterior pasó. Los selectores se ajustaron al nuevo vocabulario operativo; no se omitieron pruebas ni permisos. Los ajustes finales se someten al CI de la fuente exacta antes de desplegar.


## Recuperación solicitada dentro de la entrega
Se actualiza el verificador existente al esquema0024 y se añade copia opcional en el R2 privado existente, sin dominio público y sin crear bucket. Se ejecutará manualmente con verify_restore/save_private_backup, por la autorización del usuario para completar los hallazgos de recuperación; no son exportaciones automáticas por push ni restauraciones de la base activa. Prueba local del restaurador actual PASS sobre SQLite temporal (integridad/FK/inventario,60 tablas). La versión final se somete a65 casos CI. No se afirma copia remota creada hasta comprobar el run de recuperación.

La optimización inicial de renovación con SELECT UNION excedió el límite de términos de D1: se reemplazó por VALUES y json_each en lotes de12, respetando parámetros y transacción, y se volvió a comprobar2/2 PASS17.8s. Se mantiene una programación por tarea cada cinco minutos para acotar CPU, conservando los próximos siete días completos y las salidas ya existentes de hoy.
