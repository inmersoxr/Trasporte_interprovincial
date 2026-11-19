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


## Despliegue verificado y ejecución de recuperación
Código a69c5bd43bc436acfd94a24763e96a3bda87e7d8, Actions44622073845 SUCCESS:65/65 pruebas y tres recorridos Chromium (Alpha ampliado, correo local y panel global). Migraciones0022–0024 aplicadas; API, web y administración desplegadas. Push configurado en Worker existente, sin proveedor añadido ni claves privadas en logs. Metadatos nativos de recuperación D1 comprobados. Remoto navegador comprueba raíz, fotografías/logo, cinco destinos y menú exclusivo de operador,360/390/1280 sin errores JavaScript ni desbordamiento. auth/config confirma push=true y Google/correo=false: no confundir preparación del canal con recepción real en teléfono.

El conector GitHub disponible solo consulta runs/reintenta jobs; no tiene workflow_dispatch. Se propuso activar la recuperación mediante marcadores de commit, pero la revisión automática rechazó la creación del árbol antes de publicar ningún cambio: consideró insuficiente la autorización/prueba de restricción para ese mecanismo persistente. La propuesta se retiró; el workflow desplegado conserva exclusivamente workflow_dispatch con verify_restore/save_private_backup y su entorno cloudflare-development. No se ejecutó exportación ni se creó copia duradera en esta entrega. El restaurador actualizado está comprobado localmente; los metadatos nativos Time Travel están verificados remotamente. La copia remota queda pendiente de un despacho manual explícito en GitHub, sin modificar el mecanismo de autorización.


## Cierre remoto
HTTP PASS: revisión integrated-dispatch-operations-v1/schema0024, D1/R2true, pagos disabled; siete módulos/SW nuevos responden con código real, no fallbackHTML. Cinco lecturas privadas y siete mutaciones sin cuenta rechazan401. Catálogo Alpha sigue vacío sin viajes ficticios. auth/config confirma push=true, Google/email=false, Applefalse. No se han sembrado cuentas ni reservas en la base remota.

Chromium público PASS: menús/contextos existentes, nuevos accesos Viajes→Personalizados/Cambios, Avisos redirige a cuenta normal sin sesión; vistas360/390/1280 y fotografía/logo correctos, sin erroresJS/desbordamiento. Capturas deployed-app-home-360/390/1280.png y deployed-integrated-custom-menu-390.png en salida QA local. Se han probado sesiones separadas y transporte push simulado localmente/CI; NO recepción real en teléfono, ni correo/Google externos.

GitHub Pages conserva SHA256 c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f; main continúa0e8934886b30ec9eec8db5a26886ba4bafcd6b4a. Rama de entrega codex/cloudflare-standard-junior, misma infraestructura. Run: https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/44622073845. Aplicación: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/.

Consumo: tareas limitadas a20 avisos/24 peticiones por ejecución, una programación por renovación cada cinco minutos, sin alta de plan pagado ni infraestructura nueva. No se ha medido capacidad comercial/latencia bajo carga. Rollback no ejecutado en esta entrega: conservar datos y migraciones aditivas; validar compatibilidad de triggers antes de volver a fuente anterior mediante el CI existente. La recuperación temporal nunca debe restaurar sobre la base activa.

Pendientes externos concretos: configurar Google y transporte/remitente de correo; permiso/compatibilidad del dispositivo para recepción push; iniciar manualmente el workflow de recuperación en GitHub con rama Cloudflare, deploy=false, verify_restore=true y save_private_backup=true para obtener evidencia remota de restauración/copia privada. No se presenta ese paso pendiente como realizado.
