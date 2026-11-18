# Alpha E1 — cámara, embarque y boleto conectado

Después de D cerrado, se reutiliza ciclo de cámara del demo y controles D1 existentes. Cambios solo en aplicación Cloudflare; demo/Pages original sin cambios.

## Implementación
- Cámara con permiso explícito al pulsar Escanear; selección de salida/servicio por nombres/fechas. BarcodeDetector nativo y fallback local jsQR1.4.0 (MIT), fijado en package-lock. Build copia JS/licencia a assets funcionales y SW conserva solo recursos estáticos. Píxeles de cámara no se envían ni almacenan.
- Se detienen tracks al detectar, cancelar, salir del panel, ocultar pestaña o abandonar página; carrera de permiso pendiente controlada. Código manual opcional como respaldo del boleto, nunca clave de sesión.
- Backend vincula QR a la operadora y servicio elegido, con documentación vigente y estado autorizado. Ventana inicial:120min antes/después de hora programada, también para inicio de seguimiento. QA aislado conserva compatibilidad sintética; no activable desde query pública.
- Embarque único con compare-and-set D1 y evento único. Repetición/cancelado/otro servicio/no autorizado rechazados. Boleto representa boardedAt con hora Ecuador, retira QR ya utilizado y refleja estado desde servidor al recargar/reingresar.
- Polling no interfiere al navegar y no reconstruye QR si no cambia el boleto. No se inventan nombres de pasajeros en checkout normal.
- Se corrigió permisos() del seguimiento: ignoraba cookies y solo aceptaba Bearer de desarrollo. Ahora sesiones normales permiten operador/pasajero; visitante o cookie inválida conserva observación pública sin permisos. Seguimiento/SOS continúan claramente SIMULADOS.

## Pruebas
`npm test`:50/50 PASS (D1, demo y Premium incluidos). Nuevo caso normal/cookies: selección obligatoria, otra salida, futuro fuera de ventana, cancelado, otra cuenta, carrera200/409, timestamp/evento únicos, seguimiento controlable por cookie y SOS simulado por pasajero.
`npm run test:alpha-local`: PASS con expediente/revisión/publicación/búsqueda/Google SIMULADO/reserva → QR generado → cámara de canvas con frames continuos → jsQR decodifica píxeles reales → API/D1 → EMBARCADO en pasajero → segundo escaneo409 → misma fecha/evento → tracks cerrados → recarga y otra sesión conservan estado. Operador/pasajero/admin en360/390/1280 sin desbordamiento. La primera prueba usaba un canvas estático antes de iniciar el stream y no emitía frames; se corrigió el transporte de prueba, sin sustituir el decoder por respuestas falsas.

## Entrega y límites
Código local alpha-boarding-v1/schema0018, sin nueva migración para embarque. Sin commit/push/deploy ni datos reales remotos. Google real, correo real y teléfonos/cámara física no probados. No se declara Alpha aceptada. No activar ni contratar servicios externos por estas pruebas.
Siguiente E2 autorizado: contacto/datos necesarios de reserva, puntos de encuentro e historial; F registro por código y cierre de entrega después. Se preserva autorización general de correcciones.
