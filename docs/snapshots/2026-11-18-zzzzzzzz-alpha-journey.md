# Alpha E2 — contacto, boleto e historial persistente

Tras E1, se completa el recorrido Standard sin tocar demo/Pages ni ampliar Premium. Migración aditiva0019 preparada localmente; todavía no aplicada en Cloudflare.

## Implementado
- Teléfono obligatorio del comprador normal; correo verificado obtenido del servidor. Guardar teléfono es opcional en el perfil de cuenta. Nombre/teléfono editables sin cambiar correo, identidad ni roles.
- Puntos de encuentro/llegada en rutas, selección de ciudades aprobadas y horario continental Ecuador UTC−5 independiente del dispositivo. Compartido, privado fijo y personalizado conservan sus modalidades; personalizado exige nombres reales y contacto.
- Boleto persistente conserva una copia de contacto, encuentro, vehículo/placa y operadora al comprar. Cambiar después los metadatos no reescribe ese comprobante. Incluye contacto de operadora y enlace privado, que exige la misma cuenta tras iniciar sesión en otro dispositivo.
- Checkout abierto consulta inventario D1 periódicamente; descarta asientos ocupados y deshabilita confirmación cuando se agota. Compra sigue siendo atómica y simulada.
- Historial del pasajero paginado20 y operaciones100 con cursores privados validados. Manifiesto muestra contacto únicamente al personal autorizado. Navegación de cuenta distingue consola Standard, Premium ya habilitado y autoridad global existente.

## Evidencia local
`node --test tests/journey.test.mjs`: PASS;21 reservas, páginas20+1,101 eventos100+1, cursores ajenos denegados, snapshot inmutable, contacto privado/servidor, privado fijo/personalizado y carrera por asiento200/409.
`npm run test:alpha-local`: PASS,24.5s. Varias sesiones independientes, perfil/documentos/revisión, tres salidas recurrentes, búsqueda, Google SIMULADO, teléfono guardado, compra, lectura de píxeles QR con jsQR y cámara de vídeo simulada, embarque único, recarga y sesión nueva desde enlace privado. Otro comprador consume el último asiento mientras el formulario está abierto; se actualiza disponibilidad y se bloquea confirmación. No se ha certificado hardware físico ni proveedor externo.
Regresión completa al cierre: `npm test`51/51 PASS,119.6s, incluyendo demo y Premium.

## Límites y continuación
Sin commit/push/deploy en este hito. Remoto aún0014; Google/correo reales pendientes de configuración. No declarar Alpha funcional de extremo a extremo en Cloudflare. Rollback: volver API/assets compatibles conservando tablas y datos; no eliminar registros. Siguiente F autorizado: verificación por código de correo sobre la autenticación existente y entrega con regresión completa.
