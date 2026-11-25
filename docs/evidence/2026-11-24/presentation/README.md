# Evidencia de presentación

Fuente295bd0b2; ejecución y versiones en deployment.json. Regresión74 y navegador8 de CI en ci-verification.txt. Capturas con empresas/vehículos de fixtures únicamente locales. Mapas locales no cargan tiles externos por aislamiento de prueba; coordenadas provienen de geolocalización emulada. No acreditan conducción real.

remote-readonly.json: health, portal/join, dashboard401, authconfig y Chromium anónimo390/1280; sin registros públicos. Se usó proxy HTTPS del entorno y Chromium ignoreHTTPSErrors para su CA de inspección, sin cambiar configuración TLS del servicio. Fetch HTTP de health/assets mantuvo validación del transporte.

unit-74.txt incluye regresión local del árbol seleccionado; affected-9.txt, navegador y single-trip-local.txt documentan verificación adicional. El último se generó añadiendo publicación individual sin frequency, vista previa1, reintento con mismo requestId y agenda independiente al escenario piloto existente, sin cambios al código bajo prueba.
