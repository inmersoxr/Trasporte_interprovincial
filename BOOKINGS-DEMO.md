# RutasEC · Reservas compartidas y operación de demostración

## Probar entre dos teléfonos

Ambos abren la aplicación de GitHub Pages. No se instala un backend en el teléfono. El pago, los boletos y las alertas están identificados como simulados.

1. **Teléfono A → Operadores.** Guarda el nombre de la operadora y su WhatsApp con código de país. El acceso de demostración se conserva en ese navegador. Crea una salida Cuenca–Guayaquil con fecha actual o futura, hora, vehículo, capacidad 8 y precio por asiento. Deja marcada Publicar y pulsa Publicar viaje. También se pueden guardar borradores y publicarlos después.
2. **Teléfono B → Inicio.** Busca Cuenca–Guayaquil en la misma fecha, con 2 pasajeros. Alternativamente, el operador puede copiar el enlace de la salida para abrir directamente su detalle. Explorar permite ver todas las salidas publicadas.
3. Reserva la salida, registra los dos nombres y elige crédito, débito o transferencia. Son medios ficticios: no se solicitan números de tarjeta, cuentas ni claves bancarias. Acepta la condición de demostración y confirma el pago simulado.
4. B recibe un boleto con UUID, ruta, fecha/hora, operadora, vehículo, pasajeros, cantidad de asientos, monto y pago SIMULADO CONFIRMADO. A recibe la reserva automáticamente sin recargar; la disponibilidad cambia de 8 a 6. La operación no depende de WhatsApp.
5. En el boleto, Avisar al operador por WhatsApp abre un mensaje dirigido al número configurado, con todos los datos y un enlace privado al boleto. La persona confirma manualmente el envío. La aplicación no afirma haberlo enviado.
6. A puede ver reservas por viaje, marcar pasajeros como abordados, editar salidas pendientes, gestionar cancelaciones y consultar ventas/reembolsos simulados. Con reservas confirmadas se conserva ruta, horario y vehículo; se permite ampliar capacidad y ajustar la tarifa para compras futuras. No se puede reducir capacidad por debajo de los cupos reservados.
7. A pulsa Iniciar recorrido simulado. El boleto de B habilita automáticamente Abrir viaje en curso. Ambos acceden a la misma simulación; B puede compartir el enlace público y activar/cerrar SOS. Solo el operador controla movimiento y atiende alertas. El panel del operador también muestra SOS y permite marcarlo atendido.
8. Para otra demostración crea una salida nueva. Los viajes finalizados conservan historial y boletos; no vuelven a vender cupos.

## Panel del operador

La navegación inferior existente permanece: Inicio / Explorar / Mis viajes / Seguridad / Operadores. Se conserva el estilo grafito, amarillo y fotografías reales de vehículos. El panel incluye:

- Perfil de operadora y WhatsApp.
- Crear, editar, guardar borrador y publicar viajes.
- Filtros Todos, Publicados, Próximos, En curso, Finalizados y Cancelados.
- Capacidad, ocupación y disponibilidad con representación visual de cupos.
- Reservas por salida, pasajeros, abordajes, método y monto del pago ficticio.
- Ventas brutas, reembolsos, ventas netas e historial.
- Cancelación de reserva y de salida, con devolución de cupos y estado de reembolso **simulado**. Una reserva ya abordada no admite cancelación. Durante un viaje, una cancelación la gestiona la operadora.

Mis viajes recupera los boletos cuyo acceso guarda ese teléfono. El enlace privado permite consultar el mismo boleto desde otro teléfono. Una reserva local de la versión anterior se conserva como registro anterior, identificado expresamente como local; no afecta el inventario compartido.

## Persistencia y concurrencia

Se amplía el servicio ya desplegado: Cloudflare Worker + R2 en `shared/live-config.mjs`. El frontend sigue publicado en GitHub Pages. No usa exclusivamente localStorage: viajes, perfiles, reservas, cupos, pagos ficticios, abordajes, cancelaciones y alertas se guardan en el servicio compartido.

`sync-service/bookings.mjs` mantiene un libro de demostración en un único objeto R2 (`marketplace/demo-v1.json`). Cada escritura lee el ETag y utiliza una condición `etagMatches`; la primera creación usa If-None-Match. Ante una carrera, vuelve a leer y revalida hasta ocho intentos. Disponibilidad, precio, estado de la salida, reserva y pago simulado se verifican y guardan juntos, sin una escritura parcial por entidad. No se calcula disponibilidad desde una copia local del teléfono.

Cada checkout genera y guarda una clave de idempotencia antes de enviar el pago. Reintentar la misma solicitud devuelve el mismo boleto. La clave privada del boleto también se genera antes del envío, por lo que una respuesta perdida se puede recuperar reintentando. La tarifa se comprueba en el servidor y las cantidades monetarias se guardan en centavos. Las cancelaciones repetidas no liberan cupos más de una vez. Las ventas y reembolsos se conservan como historial.

La interfaz consulta cambios cada 1,8 segundos más la latencia de las peticiones y se actualiza al volver a la aplicación. Los formularios de edición y checkout no se reconstruyen durante la escritura. Cuando falta conexión se informa del problema; no se promete confirmar reservas sin red.

## Acceso y datos

El acceso de operador y los boletos usan capacidades aleatorias de 256 bits. Solo sus hashes se guardan en el servidor; no se incluyen en el catálogo público. localStorage conserva las capacidades e identificadores para recuperar la sesión, no la fuente de verdad del inventario. Borrar ese almacenamiento pierde el acceso local; no borra ni duplica las reservas del servicio.

El catálogo publica ruta, horario, vehículo, tarifa, disponibilidad, nombre comercial y WhatsApp de la operadora. Los nombres de pasajeros solo se devuelven al operador correspondiente o al enlace privado del boleto. El enlace público de seguimiento no contiene esas credenciales. El enlace de boleto compartido por WhatsApp sí permite ver esa reserva: debe usarse con los participantes de la demostración.

Los pasajeros confirmados pueden activar/cerrar SOS; no pueden iniciar, pausar, acelerar ni reiniciar el vehículo. Las reservas canceladas pierden esa autorización. El operador conserva el control del viaje. El proveedor de movimiento sigue siendo `shared/trip-core.mjs`, separado de un futuro GPS real. Las posiciones llevan `simulated: true` y `source: "simulator"`.

No es una plataforma de cobro ni autenticación comercial. No procesa tarjetas, transferencias, cargos, devoluciones bancarias ni mensajes automáticos. El libro global tiene límites de demostración (100 operadoras y menos de 2.500 reservas); no es una arquitectura de inventario para producción de gran escala. Los objetos persisten hasta una gestión posterior del servicio.

## API añadida

| Endpoint | Comportamiento |
| --- | --- |
| `GET /api/catalog` | Catálogo público sin nombres de pasajeros. |
| `POST /api/operators` | Guarda perfil con capacidad de operador. |
| `GET /api/operator` | Panel privado de esa operadora, viajes y reservas. |
| `POST /api/rides` | Crea salida con requestId idempotente. |
| `POST /api/rides/:id` | update / publish / start / finish / cancel. |
| `POST /api/bookings` | Confirma reserva y pago ficticio de manera atómica. |
| `GET /api/bookings/:id` | Boleto autorizado por su capacidad o por su operadora. |
| `POST /api/bookings/:id` | board / cancel. |
| `GET /api/trips/:id` | Admite los recorridos vinculados a salidas reservadas. |
| `POST /api/trips/:id/commands` | Misma simulación/SOS, con permisos de operador o pasajero. |

## Comprobación realizada · 11 de noviembre de 2026

Se usaron dos sesiones con almacenamiento de navegador separado: operador en una copia local del frontend y pasajero en GitHub Pages; ambas conectadas al mismo servicio público desplegado. Se verificaron publicación y edición de 8 plazas, búsqueda desde la otra sesión, pago de 2 asientos por $30, boleto, cambio automático 8→6, nombres y abordaje en el panel sin recarga, y el aviso de WhatsApp preparado sin enviarlo.

El operador inició el recorrido; el boleto habilitó el seguimiento automáticamente. El pasajero accedió sin controles del vehículo, compartió el enlace y activó SOS. El panel recibió la alerta y pudo marcarla atendida; el pasajero vio el estado actualizado. Una segunda reserva por transferencia ficticia se canceló desde el panel: el boleto mostró reembolso simulado y la salida recuperó sus 8 cupos.

La prueba de concurrencia se ejecutó también contra el R2 desplegado: dos solicitudes simultáneas de 6 plazas sobre una salida de 8 devolvieron 201 y 409; quedaron 2 disponibles, el reintento devolvió el mismo boleto y la cancelación restituyó los 8 cupos. Se usaron datos ficticios. No se afirma una prueba con dos teléfonos físicos ni envío de WhatsApp.

```sh
node --test sync-service/tests/*.test.mjs
node sync-service/build.mjs
node --check sync-service/out/worker.mjs
node --check app.js
node --check bookings.mjs
node --check trip-live.mjs
node --check sw.js
```

Prueba remota opcional, que crea registros ficticios y cancela su salida al terminar:

```sh
node sync-service/tests/production-check.mjs --run-demo
```

Para reproducir el despliegue API, el bundle debe tener R2 vinculado como BUCKET; el servicio actual conserva su identidad y almacenamiento. No se deben guardar capacidades de sesiones ni credenciales de infraestructura en Git.
