# Circuito simple del demo conectado al backend

Fuente45ed4b3d1ffa768de1eca995cb58cd7216560e10. No se crearon datos de prueba en público.

- unit-5.txt: publicación sin placa/conductor y guardias fuera de piloto; cinco pruebas PASS.
- browser-simple.txt: empresa, formulario del demo, publicación, comprador independiente, QR, escaneo del operador, GPS emulado y cierre; PASS.
- simple-create-390.png: captura de la interfaz real del formulario móvil, inspeccionada; datos solo locales.

Cámara y GPS del navegador son fixtures locales; no validan vehículos ni sensores físicos. En navegador de pruebas los tiles externos se bloquearon. El código usa OpenStreetMap y GPS del dispositivo sin posiciones simuladas en la aplicación. El pago sigue SIMULADO.
