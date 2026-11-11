# RutasEC · Conecta Ecuador

Aplicación web móvil y PWA de transporte interprovincial. Continúa la implementación existente y reproduce la referencia visual aprobada: interfaz oscura, amarillo, splash de tres segundos, inicio de cinco partes (2 imagen / 2 buscador / 1 navegación inferior) y resultados con fotografías reales de vehículos (Sprinter, Hyundai H1, SUV Kia Sorento y sedán Toyota Corolla). El inicio usa la versión cinematográfica de la Rotonda aprobada durante esta sesión; el splash muestra la carretera hacia el Chimborazo en primer plano desde el vehículo.

## Publicación

GitHub Pages: https://inmersoxr.github.io/Trasporte_interprovincial/

El sitio estático se publica desde la raíz de `main`. El frontend no necesita compilación. El módulo de seguimiento requiere conexión al servicio de sincronización y al proveedor de teselas. Todas las imágenes, iconos, estilos y scripts se sirven desde el repositorio. La PWA incluye iconos PNG 192/512, manifest y service worker con actualización de caché.

## Flujos

- Origen/destino, intercambio, fecha local de Ecuador y pasajeros.
- Validación de ciudades distintas y fecha actual o futura.
- Filtros Todos / Auto / Furgoneta / SUV y capacidad disponible.
- Modalidad compartida (precio por asiento) o privada (vehículo completo).
- Selección con botones, gesto horizontal o flechas del teclado.
- Reserva sincronizada, checkout ficticio, boletos, cancelaciones y mensajes de WhatsApp preparados.
- Panel del operador con creación/edición/publicación, reservas, cupos, abordajes, estados y ventas simuladas.
- Navegación inferior funcional, instalación y créditos de imágenes.

Esta versión conserva el alcance de demostración del repositorio original. Las salidas y reservas son de demostración: hay inventario compartido con control de concurrencia, pero no cobros bancarios reales ni backend operativo comercial. Las reservas y salidas nuevas se guardan en el servicio compartido; el navegador conserva sus accesos. Las reservas anteriores locales se identifican aparte.

## Archivos

`index.html`: pantallas y estructura accesible. `styles.css`: diseño adaptable. `app.js`: flujos existentes completados. `sw.js`: disponibilidad sin conexión tras la primera carga y actualización. `assets/`: imágenes optimizadas e iconos. `CREDITS.md`: fuentes y licencias.

## Verificación

Se revisaron en navegador el inicio, resultados, filtros, cálculo de tarifa privada, selección, reserva, persistencia tras recargar, cancelación y publicación/eliminación de salidas. El inicio se comprobó a 360 × 800 sin desbordamiento horizontal y con altura exacta de pantalla. Se valida la publicación final en GitHub Pages.

Comprobación de sintaxis: `node --check app.js` y `node --check sw.js`.


## Carrusel turístico de inicio

Guayaquil (Rotonda aprobada), Cuenca (Catedral Nueva), Manta (Playa El Murciélago), Babahoyo (Malecón 9 de Octubre) y Quito (San Francisco, centro histórico). Cambia cada seis segundos con fundido de 1,1 segundos. Incluye indicadores, selección manual, deslizamiento y pausa. Respeta movimiento reducido; suspende la rotación cuando la pestaña está oculta o se sale del inicio. Espera a que la siguiente imagen esté decodificada antes de mostrarla. Los campos del buscador conservan sus valores durante el cambio.

## Viaje compartido y SOS

Implementado un viaje Cuenca–Guayaquil con mapa OSM/Leaflet, ruta vial real, vehículo orientado, simulación de 3 minutos acelerable, seguimiento público entre dispositivos, SOS y centro de operaciones sincronizados. Se accede desde Seguridad o Tus viajes, sin reservas ni pagos reales. La arquitectura, API, instrucciones para dos teléfonos y pruebas están en [LIVE-DEMO.md](LIVE-DEMO.md). El servicio ligero desplegado usa Worker + R2; su fuente y pruebas se incluyen en `sync-service/`, integradas con las reservas compartidas.

## Navegación inferior y Seguridad

Inicio, Explorar, Mis viajes, Seguridad y Operadores son accesos funcionales y persistentes. Seguridad reúne el viaje de demostración, el contacto de emergencia, el seguimiento público y operaciones. No hay menú hamburguesa. Instalar app está disponible en las cabeceras, con aviso superior y diálogo nativo cuando el navegador lo admite; en otro caso muestra instrucciones específicas para el dispositivo.

## Reservas y operador sincronizados

El catálogo, el checkout ficticio y el panel del operador usan el servicio compartido Worker + R2. Los pagos simulados generan boletos y descuentan cupos con escrituras condicionales e idempotencia. El operador ve reservas, pasajeros, abordajes, cancelaciones, ventas y SOS sin recargar. WhatsApp se prepara para envío manual. Las reservas confirmadas acceden al mismo recorrido Cuenca–Guayaquil. Guía entre teléfonos, API, límites y evidencia en [BOOKINGS-DEMO.md](BOOKINGS-DEMO.md).
