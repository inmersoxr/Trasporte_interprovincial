# Viaje en curso: demostración compartida

Entrada: menú → Iniciar viaje de demostración (también en Tus viajes), o `/#demo`. Crear e iniciar viaje genera un identificador y comienza Cuenca–Guayaquil. No necesita reserva ni pago. La duración por defecto es 3 minutos; 2×, 4×, 8×, 16× y 32× aceleran la demostración. Pausa, reanuda, reinicia, centra el vehículo o explora el mapa. El amarillo indica recorrido realizado y el gris lo pendiente.

## Dos teléfonos y operaciones

1. En el teléfono del pasajero, inicia la demo, configura el contacto de emergencia (código de país) y pulsa Compartir viaje. Abre WhatsApp o el menú nativo de compartir; el envío lo confirma la persona.
2. Abre el enlace en el segundo teléfono. Es público y de solo lectura; no requiere cuenta ni instalación. Ambos muestran el mismo viaje, posición, progreso, ETA y SOS. Funciona aunque el navegador del pasajero se cierre.
3. Para operaciones, pulsa Centro de operaciones desde el viaje y luego Enlace de operaciones. Copia ese enlace a una tercera sesión. Permite atender alertas, sin controlar la simulación. Consérvalo privado. Un enlace de seguimiento normal permite monitorear, pero no atender.
4. SOS DEMO abre una confirmación con el contacto. Confirmar genera una alerta compartida con ID, hora y posición simulada. Si está marcada la opción WhatsApp, abre el mensaje preparado; nadie envía automáticamente. También hay un enlace Abrir WhatsApp en la alerta. No llama ni avisa a servicios de emergencia.
5. Operaciones pulsa Marcar atendida; el pasajero puede Cerrar alerta demo. El estado y los eventos se sincronizan. Reiniciar también cierra alertas activas.

## Arquitectura desplegada

Frontend: GitHub Pages, HTML/CSS/JS y Leaflet 1.9.4 local. Ruta OSRM con geometría de OpenStreetMap descargada y versionada: 3.947 vértices por Cuenca–Molleturo–Puerto Inca–Guayaquil. Longitud OSRM 185,76 km; la suma geodésica de los segmentos usada por la animación es aproximadamente 186,1 km. No es una línea recta. Teselas OSM France/HOT con tratamiento de color por CSS; el mapa conserva etiquetas, exploración y atribuciones.

Sincronización ligera: Cloudflare Worker + bucket R2 gestionados mediante Sites, en `https://rutasec-viajes-sync.cebx3001.chatgpt.site`. Servicio independiente del frontend estático. Fuente reproducible en `sync-service/worker.mjs`; comparte `shared/trip-core.mjs` y `shared/route.json`. `shared/live-config.mjs` contiene la URL pública, sin credenciales de infraestructura.

El servidor persiste ancla de distancia, fecha de referencia, velocidad, estado, revisión, alertas y eventos. Cada cliente usa el reloj del servidor para calcular la posición sobre la misma geometría, sin depender de un bucle en el teléfono del pasajero. Por ello la simulación sigue activa con el emisor cerrado. La posición se interpola localmente cada 120 ms y los eventos se consultan cada 1,8 s. El ETA indica la llegada de la demostración acelerada; no predice tráfico ni tiempo comercial real.

`tripSnapshot()` publica la interfaz de posición: latitud, longitud, orientación, timestamp, distancia, progreso, velocidad y ETA. `source: "simulator"` y `simulated: true` identifican el origen de datos en todo momento. La geometría y el simulador son funciones puras separadas del transporte HTTP y de Leaflet. Un futuro adaptador GPS deberá publicar este contrato con su propio origen y timestamps, reemplazando el proveedor de posición; esta demo no recoge la ubicación real del dispositivo.

## API y acceso

- `POST /api/trips` con `{routeId: "cuenca-guayaquil-v1"}` crea un viaje y devuelve, una sola vez, dos capacidades distintas: controlador y operaciones.
- `GET /api/trips/:id` devuelve el estado público, snapshot y reloj del servidor. Anónimo, sin tokens en el enlace público.
- `POST /api/trips/:id/commands` recibe `{action, requestId, expectedRevision}` y los campos de la acción. Requiere `Authorization: Bearer <capacidad>`. Acciones: `start`, `pause`, `speed` (multiplier), `reset`, `sos`, `attend` y `close-sos` (alertId).
- Solo el controlador modifica el viaje o cierra SOS. Operaciones solo puede `attend`. Los hashes de las capacidades no se publican; el teléfono guarda sus claves en localStorage. El número de emergencia permanece local y no se envía a la API. WhatsApp solo recibe el mensaje al abrir su enlace.
- Escrituras condicionales R2 por ETag, revisiones y requestId evitan sobrescrituras y repeticiones inmediatas. Conserva los últimos 50 eventos y 20 alertas por viaje.
- Los enlaces caducan a las 24 horas (HTTP 410). La caducidad limita lectura, no elimina automáticamente objetos del bucket. El servicio es una demostración, sin inventario, pagos, GPS operativo, despacho ni autenticación comercial. No usar datos sensibles reales en esta demo pública.

Los enlaces de controlador dependen de las claves locales: al borrar almacenamiento se pierde el control. El enlace público sigue siendo observación. La conectividad es necesaria para mapa, sincronización y WhatsApp; la PWA guarda la interfaz y geometría, no promete seguimiento sin conexión. El indicador informa pérdida de sincronización. Las teselas se solicitan directamente al proveedor y no se precargan ni se guardan masivamente.

## Reproducir y validar

Requiere Node 22 o posterior, por importaciones JSON ESM:

```sh
node --test sync-service/tests/sync.test.mjs
node sync-service/build.mjs
node --check sync-service/out/worker.mjs
node --check trip-live.mjs
node --check app.js
node --check sw.js
```

El bundle Worker resultante se despliega con un bucket R2 vinculado como `BUCKET`. No hay dependencias de compilación. Ajustar el origen permitido del frontend en worker.mjs y la URL de API en shared/live-config.mjs si se migra el despliegue. No guardar capacidades de viajes ni credenciales de infraestructura en Git.

Las pruebas verifican carretera y orientación, permisos, revisión obsoleta, pausa/reanudación/velocidad, SOS/atención/cierre compartido, caducidad y llegada con emisor ausente. La verificación en navegador cubre sesiones separadas y tamaño móvil. Un navegador de escritorio no certifica el envío desde WhatsApp instalado ni sustituye probar dos teléfonos físicos.
