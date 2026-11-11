# RutasEC · Conecta Ecuador

Aplicación web móvil y PWA de transporte interprovincial. Continúa la implementación existente y reproduce la referencia visual aprobada: interfaz oscura, amarillo, splash de tres segundos, inicio de cinco partes (2 imagen / 2 buscador / 1 beneficios) y resultados con fotografías reales de vehículos (Sprinter, Hyundai H1, SUV Kia Sorento y sedán Toyota Corolla). El inicio usa la versión cinematográfica de la Rotonda aprobada durante esta sesión; el splash muestra la carretera hacia el Chimborazo en primer plano desde el vehículo.

## Publicación

GitHub Pages: https://inmersoxr.github.io/Trasporte_interprovincial/

El sitio estático se publica desde la raíz de `main`. No necesita compilación ni dependencias externas. Todas las imágenes, iconos, estilos y scripts se sirven desde el repositorio. La PWA incluye iconos PNG 192/512, manifest y service worker con actualización de caché.

## Flujos

- Origen/destino, intercambio, fecha local de Ecuador y pasajeros.
- Validación de ciudades distintas y fecha actual o futura.
- Filtros Todos / Auto / Furgoneta / SUV y capacidad disponible.
- Modalidad compartida (precio por asiento) o privada (vehículo completo).
- Selección con botones, gesto horizontal o flechas del teclado.
- Reserva local, total por número de pasajeros, persistencia, cancelación y compartir resumen.
- Panel de operadores con publicación y eliminación de salidas locales.
- Menú, instalación y créditos de imágenes.

Esta versión conserva el alcance de demostración del repositorio original. Los operadores, valoraciones y horarios son datos de ejemplo; no hay pagos, cupos transaccionales ni backend comercial. Las reservas y salidas creadas se guardan únicamente en el navegador.

## Archivos

`index.html`: pantallas y estructura accesible. `styles.css`: diseño adaptable. `app.js`: flujos existentes completados. `sw.js`: disponibilidad sin conexión tras la primera carga y actualización. `assets/`: imágenes optimizadas e iconos. `CREDITS.md`: fuentes y licencias.

## Verificación

Se revisaron en navegador el inicio, resultados, filtros, cálculo de tarifa privada, selección, reserva, persistencia tras recargar, cancelación y publicación/eliminación de salidas. El inicio se comprobó a 360 × 800 sin desbordamiento horizontal y con altura exacta de pantalla. Se valida la publicación final en GitHub Pages.

Comprobación de sintaxis: `node --check app.js` y `node --check sw.js`.
