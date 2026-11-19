# Operación integrada de RutasEC

Esta entrega amplía los servicios existentes de Standard/Premium sobre Workers, D1 y R2. No modifica GitHub Pages ni añade pagos reales. WhatsApp queda fuera por instrucción expresa del usuario; no se crean proveedores, credenciales ni consentimientos de marketing de WhatsApp.

## Personalizados espontáneos

Operadora: **Viajes → Personalizados**. Seleccionar ciudades de recogida y vehículos propios, activar recepción de solicitudes y disponibilidad. La inscripción no sustituye la revisión documental ni exige publicar rutas. Se puede pausar sin borrar reservas confirmadas. **Reservas → Solicitudes** muestra oportunidades compatibles; cotizar exige vehículo habilitado, capacidad, calendario y disponibilidad vigentes.

Pasajero: **Solicitar transporte privado**. Indicar origen/destino, grupo, vehículo, encuentro/llegada y fecha, o **Lo necesito ahora**. En solicitudes de ahora, la ventana para recibir/elegir cotizaciones es de30min y las propuestas pueden recoger entre5 y120min después de cotizar, dentro del plazo de recogida de la solicitud. El precio es por vehículo, no por asiento. El operador propone hora de recogida y duración, no GPS ni asignación automática. Las cotizaciones aparecen conforme llegan; se puede elegir cualquiera. Se comprueba otra vez disponibilidad al confirmar y se libera el resto de ofertas.

Los horarios comprometidos se consideran al identificar huecos para atender la solicitud; una cita posterior no impide cotizar si existe un intervalo suficiente antes. Pausar la inscripción impide elegir ofertas pendientes mientras esté pausada. Solicitudes, precios y reservas permanecen en D1, no en el navegador. Los flujos QA históricos conservan su compatibilidad únicamente en pruebas explícitas; no se incluyen en el catálogo Alpha.

## Avisos y push

El botón **Avisos** abre una bandeja privada, con páginas y enlaces a cada tarea. Llegan solicitudes a empresas inscritas, cotizaciones a pasajeros, elección de oferta a ambas partes, reservas, cancelaciones y cambios de horario/vehículo/boleto. Abrir un enlace marca el aviso leído. Premium ofrece un enlace a los avisos de la misma cuenta.

**Activar notificaciones en este dispositivo** pide permiso al navegador. Cada dispositivo mantiene su propia suscripción y se puede desactivar. Algunos navegadores móviles requieren instalar la PWA; especialmente iPhone/iPad admiten push mediante la app web instalada, según versión/compatibilidad. Esto no es una app nativa de tienda. Sin permiso o soporte, la bandeja funciona igualmente al abrir la aplicación.

El push utiliza VAPID/Web Push, no WhatsApp. El despliegue aprovisiona una sola pareja de claves en secretos del Worker existente si no existe; nunca se imprime ni versiona la clave privada. No se regenera en cada despliegue. Configuración parcial exige recuperar una pareja válida antes de aceptar suscripciones.

Se envían señales vacías a servicios push permitidos; el service worker consulta el contenido con la sesión del usuario. No se coloca información de pasajeros, boletos o contactos en la carga externa. Se validan host/HTTPS y se prohíben redirecciones. Los destinos410/404 se eliminan. Una concesión atómica evita que tareas concurrentes reclamen el mismo aviso. Hay reintentos y una tarea cada minuto para recuperar pendientes; no se garantiza entrega instantánea ni recepción con dispositivos desconectados. Los lotes y solicitudes de red están acotados para el entorno actual. Las solicitudes/ofertas que ya no sean accionables no despiertan el dispositivo.

## Permisos y planes

La cuenta personal se comparte entre pasajero y personal. El propietario conserva la titularidad. Administradores gestionan la empresa; despachadores consultan operación, publican salidas/programaciones y cotizan; conductores consultan y operan sus vehículos asignados. El servidor verifica cada acción y filtra manifiestos/historial de conductores. Las cancelaciones financieras quedan en administración/despacho. La ficha del conductor permite vincular una cuenta con rol de conductor de la misma empresa; revocar membresía elimina vínculos y asignaciones vigentes.

En Alpha, Premium depende del plan asignado por administración RutasEC: Premium activo/en prueba y fecha vigente. El propietario no puede autoactivarlo gratuitamente sin habilitación. Pausar/cancelar o vencer el plan bloquea herramientas Premium, pero no borra datos ni cancela reservas. Las operaciones esenciales Standard siguen disponibles según permisos. No se comprueban transferencias ni se cobran cuotas automáticamente. Los nombres históricos de tablas/plan de desarrollo se conservan por compatibilidad, con comprobación comercial adicional en el servidor.

## Operar y modificar viajes

Iniciar/finalizar un servicio registra su estado real en D1. No obliga a ejecutar el simulador de Cuenca–Guayaquil ni ofrece GPS o SOS simulados como seguimiento real. El simulador histórico permanece aislado para QA/demo. El embarque conserva validación de servicio, ventana temporal, titularidad, documentación vigente y uso único.

**Viajes → Cambios** permite a administración modificar horarios o vehículo de salidas futuras sin embarques, reprogramar privados, y cambiar tarifa/publicación de rutas para nuevas ventas. Se conserva lo pagado en boletos existentes; cambios generan avisos. El calendario comprueba conflictos también al actualizar, y el nuevo vehículo debe tener capacidad y habilitación. Las operaciones son transaccionales y versionadas: una vista vieja no sobrescribe otra sesión.

En un boleto compartido futuro, **Cambiar asientos o cancelar pasajeros** permite reemplazar asientos o cancelar parte del grupo. Se valida la disponibilidad en servidor y los asientos liberados se pueden reservar de nuevo. El reembolso es exclusivamente simulado y queda en el historial; no se mueve dinero. Los pasajeros restantes mantienen sus posiciones/QR y no se puede embarcar un QR cancelado. Para cancelar todo el grupo se usa la cancelación completa existente. No se modifican servicios iniciados o con embarques.

## Recurrencia y volumen

La programación recurrente puede activar renovación automática. Mantiene próximos siete días, mediante la tarea periódica cada cinco minutos y el mismo inventario/calendario; no duplica salidas ni elimina reservas. Un conflicto o falta de habilitación deja un error visible para revisión, sin publicar un lote parcial. Detener conserva las salidas reservadas y retira futuras sin reservas.

Catálogo público, manifiestos y solicitudes personalizadas tienen continuación por cursor; boletos/historial y opiniones conservan sus páginas existentes. Se pueden recuperar enlaces de viajes fuera de la primera página. Los paneles analíticos/financieros conservan filtros de periodo y sus límites documentados; no son un ERP ni contabilidad fiscal.

## Supervisión y recuperación

El panel global incluye salud de tareas push/recurrencia, pendientes y reintentos agotados. Los fallos de tareas se registran sin datos personales ni secretos. El despliegue comprueba salud D1/R2 y consulta metadatos de Time Travel de D1, sin exportar ni restaurar la base. La retención depende del servicio/plan real y debe verificarse en el resultado del despliegue; no se inventa un número de días. El verificador de restauración valida ahora el esquema0024. Por ejecución manual autorizada puede guardar una copia comprimida en el bucket privado existente: comprueba que no haya dominio público, restaura primero en SQLite temporal, sube la copia, la descarga y comprueba bytes/restauración. El dump temporal se elimina y no se publica como artefacto. No exporta automáticamente en cada despliegue ni restaura sobre la base activa. Es una copia privada en la misma cuenta Cloudflare, no un respaldo independiente fuera del proveedor. La retención/periodicidad de copias R2 se decide aparte; Time Travel conserva su recuperación nativa automática.

## Límites externos

Google/correo reales requieren su configuración externa pendiente. El código no considera enviados correos que no se entregaron al transporte. Los push necesitan permiso, navegador compatible y sesión. Las pruebas locales de identidad y transporte se identifican como simuladas. Cobros bancarios, facturación fiscal, liquidación, GPS real, aplicaciones nativas, respaldo externo independiente y certificación comercial no forman parte de esta activación. No afirmar piloto físico ni recepción real de push en un teléfono sin evidencia.

Referencias de límites comprobadas al preparar la entrega: [Workers](https://developers.cloudflare.com/workers/platform/limits/) y [D1](https://developers.cloudflare.com/d1/platform/limits/). Se acotan lotes/red y se respetan100 parámetros por sentencia; no se certifica capacidad comercial sin medir consumo real.


Recuperación autorizada: workflow_dispatch con deploy=false, verify_restore=true y, para copia privada, save_private_backup=true, seleccionando la rama codex/cloudflare-standard-junior. La herramienta GitHub disponible no inicia workflow_dispatch; requiere ejecutarlo desde GitHub Actions. Las actualizaciones normales no exportan datos.
