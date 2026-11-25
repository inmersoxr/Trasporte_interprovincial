# Evidencia visual de H1

Capturas reales de Chromium de la prueba de integración H1: viewport390px móvil y1280px escritorio. Se sirven los mismos assets de la aplicación y se conectan al Worker/D1 de prueba con flags de piloto. No son maquetas ni pruebas realizadas con dos teléfonos físicos. No contienen datos personales de participantes reales.

- [Registro móvil](h1-signup-mobile.png).
- [Registro escritorio](h1-signup-desktop.png).

La comprobación remota adicional abrió el sitio público sin sesión, comprobó selector de teléfono, prefijo, alternativa correo, ausencia de código, conservación de campos ante error y ausencia de desbordamiento; no creó cuentas ficticias en servidor. Fuente y deploy3186c93c, Actions45333404724:72 pruebas y siete recorridos PASS. La captura por sí sola no sustituye estos recorridos ni la prueba física01.09 pendiente.
