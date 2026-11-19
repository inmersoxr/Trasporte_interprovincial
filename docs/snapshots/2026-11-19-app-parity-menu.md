# UX2 — diseño del demo conectado al backend persistente

## Alcance autorizado
Usuario solicita resolver la divergencia visual de Cloudflare respecto al demo, menú de app con Operadores al final y contexto exclusivo de operación, incorporar logo de referencia y ajustar backend al recorrido funcional. Se mantiene intacto GitHub Pages/main y su demo; mismo Workers/D1/R2, autenticación y tres modalidades. No se sustituye el backend por el servicio de demo ni se crean registros ficticios.

## Implementado
- Portada recuperada del HTML aprobado: cinco fotografías de Ecuador, carrusel accesible/pausable y reducido movimiento; presentación, marca y buscador móvil. Template de presentación independiente; no carga fleet/BookingApp ni ejemplos del demo.
- Barra inferior Inicio/Explorar/Mis viajes/Seguridad/Operadores con iconos del demo. Operadores sustituye la navegación de pasajero por Inicio/Viajes/Reservas/Flota/Más. Cuenta/instalación se presentan dentro del contexto correspondiente. Seguridad ofrece información y contacto real, sin activar una emergencia ficticia.
- Tarjetas y detalle de viaje/vehículo con precio, plazas disponibles, puntos de encuentro, empresa y opiniones reales; reserva usa el checkout existente con asientos, verificación, persistencia y retorno seguro. Privados fijos y personalizados mantienen sus recorridos existentes. Los selectores de reserva distinguen detalle y confirmar para conservar el retorno de autenticación.
- Backend `/api/catalog` añade `vehiclePhotoUrl` desde las fotos que el propietario seleccionó en el perfil publicado. Retirar personalización retira también la foto del catálogo. Sin fotografías seleccionadas se informa de su ausencia; no se atribuye una foto de muestra a un vehículo real. Opiniones/plazas/viajes siguen calculados desde D1.
- Logo: referencia reconstruida mediante herramienta de imagen y convertida a marca amarilla plana, PNG con alpha para fotografía, PNG192/512 de fondo negro y favicon ICO32; wrapper SVG para favicon alternativo. Es una adaptación de la referencia, no un original vectorial ni conversión bit a bit del adjunto. Las dos versiones defectuosas anteriores se descartaron. Assets base64 versionados en `cloudflare-dev/brand/assets.json`, compilador materializa únicamente copias Cloudflare. Cuenta, gestión, administración y manifest/favicon comparten identidad; las marcas propias de operadoras se preservan.

## Integración reutilizada
`/api/operators`, `/api/vehicles`, `/api/route-offers`, `/api/departures`, `/api/catalog`, `/api/bookings`, `/api/private-route-bookings`, `/api/private-requests`, `/api/operations` y autenticación/cookies existentes. El frontend sigue hablando a `/standard-api`; no consume el almacenamiento local como inventario. No migraciones nuevas, servicios, buckets ni cobros.

## Evidencia local
Build/sintaxis PASS. Alpha Chromium PASS41.9s: navegación cinco destinos, seguridad, contexto exclusivo de operadora, detalle→autenticación→reserva, asientos, QR/cámara simulada, embarque, concurrencia, perfil/opiniones/moderación y múltiples sesiones. Capturas360/390/1280 sin desbordamiento; se corrigieron rutas de fotografías, etiquetas/selectores y se inspeccionó visualmente la portada390. Proveedores Google/correo y vídeo siguen SIMULADOS. Se ejecuta regresión completa57 casos y el caso de fotos públicas/retiradas antes de entrega. CI/despliegue se registrarán en cierre; no afirmar publicados antes de verificarlos.

## Límites y rollback
Google/correo reales siguen sin configuración externa; no se certifica piloto con teléfonos físicos, recepción real ni producción comercial. Se recuperan identidad y recorridos existentes sin afirmar equivalencia de cada pantalla comercial del demo. Rollback: revertir assets/UI/catalog compatibles conservando D1/R2/cookies y guardias Alpha; no borrar datos ni restaurar QA al catálogo público. Pages y sus archivos fuente no se modifican.
