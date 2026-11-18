# Viajes recurrentes — Standard

## Uso previsto
En Standard → Operadora → Viajes recurrentes, elegir una ruta compartida existente, fecha inicial/final, días de la semana, horarios y duración. El vehículo, precio por asiento y capacidad se toman de esa ruta. Revisar el resumen y publicar la programación. Esta herramienta básica no requiere activar Premium.

Ejemplo: lunes a viernes a las 08:00 durante un mes. Para 08:00/09:00/10:00 con recorridos de varias horas, usar vehículos diferentes mediante programaciones por ruta/vehículo; un mismo vehículo no puede prestar servicios que se cruzan.

Hora fija de Ecuador continental, America/Guayaquil (UTC−5), independiente de la zona del teléfono. Galápagos queda fuera de esta primera implementación. Periodo máximo 90 días y 90 salidas futuras por programación; se omiten horarios ya pasados del día actual. No se amplía automáticamente después de la fecha final: definir un nuevo periodo es una acción del operador. No hay publicación diaria manual ni dependencia de que su navegador siga abierto.

## Inventario y gestión
Cada fecha/hora genera una salida D1 normal: reservas, asientos, QR, manifiesto e historial propios. No se comparten cupos entre días. La vista previa no crea datos. Publicación en un único batch atómico, idempotencia y calendario de vehículo compartido con privados y mantenimiento; si hay un conflicto, no se publica parcialmente.

Cancelar una fecha usa Operación y manifiestos existente (reembolsos siempre simulados). Reintentar la publicación original no recrea fechas canceladas. Detener la programación retira futuras publicadas sin reservas/retenciones, libera slots y conserva las que tienen reservas, además de las iniciadas/históricas. Las conservadas se gestionan individualmente; no se anulan pasajeros en una acción masiva silenciosa.

Para cambiar días/horarios, detener las próximas sin reservas y publicar una nueva programación. No se reescriben viajes ya reservados. El listado muestra hasta 100 programaciones; no hay edición masiva ni recurrencia infinita en esta versión.

## Implementación
- Backend: cloudflare-dev/standard-recurring.mjs.
- UI: cloudflare-dev/standard/recurring.mjs, aislada del demo Pages.
- Migración aditiva0016_standard_recurring: tabla de programaciones, referencia desde departures, unicidad de ocurrencia y guard SQL de elegibilidad.
- POST `/standard-api/api/recurring-schedules/preview`: resumen y conflictos, sin escrituras.
- POST `/standard-api/api/recurring-schedules`: publicación con requestId.
- GET `/standard-api/api/recurring-schedules?operatorId=…`: listado del propietario.
- GET `/standard-api/api/recurring-schedules/:id`: detalle autorizado.
- POST `/standard-api/api/recurring-schedules/:id` con action=stop: detener próximas sin reservas, idempotente.
Los identificadores son internos; la persona elige nombres de ruta y fechas en formularios.

## Pruebas y estado
`npm test`: 46 PASS. Incluye calendario/fechas inválidas, zona Ecuador, años bisiestos, máximos, horarios incompatibles, aislamiento, vista previa sin escrituras, publicación persistente/idempotente, conflicto concurrente, asientos por día, cancelación de una fecha y reserva simultánea con stop. Caso de 90 salidas también aprobado.
`npm run test:alpha-local`: Chromium local con dos usuarios y tres sesiones independientes; Google SIMULADO → operador publica 3 salidas → pasajero entra al reservar → D1 confirma asiento/QR → otra sesión recupera boleto → operador ve manifiesto y cancela otra fecha. Vista360/390/1280 sin desbordamiento. No certifica Google externo, correos reales ni cámaras/teléfonos físicos.

No se aplicaron migraciones ni se desplegó este código. Remoto sigue schema0014. Aplicar0015 y0016 a la D1 funcional existente antes de publicar versiones compatibles; nunca a la API/R2 demo. No crear otra D1 ni auto-seed de viajes. Google necesita configuración OAuth; correo sigue dependiendo de remitente/transporte.

## Coste y rollback
Sin cron, servicios nuevos ni upgrade de plan. Se almacenan solo las ocurrencias elegidas por el operador, en chunks acotados dentro de un batch. No hay consumo de estas salidas en D1 remoto durante las pruebas locales.
Migraciones aditivas: conservar datos/columnas al volver a una versión compatible anterior. Una API anterior seguiría viendo las salidas ordinarias generadas; no retiraría las series por sí misma. Si se necesita retirarlas, usar la gestión autorizada que respeta reservas, no borrar tablas ni boletos. El rollback remoto aún no se ha ejecutado porque no existe despliegue de este cambio.
