# RutasEC · Mockup funcional V2

Entrega del código: https://github.com/inmersoxr/Trasporte_interprovincial/tree/mockup-v2/mockup-v2 . La rama de trabajo y entrega es exclusivamente `mockup-v2`. No requiere GitHub Pages.

Instancia independiente; solo datos ficticios. JavaScript sin build. Servir `dist/` con cualquier servidor estático. Todos los perfiles comparten un mundo persistido en este navegador y pestañas del mismo origen; otros dispositivos tienen demos independientes. No hay pagos, GPS ni afiliaciones reales.

Los archivos originales de RutasEC permanecen intactos. Las imágenes, Leaflet y el contrato de simulación se reutilizan según CREDITS.md. La ampliación vive solo en esta carpeta.

## Presentar

Abre el botón triangular de la cabecera o «Modo inversionista» del pie. «Comenzar presentación» muestra 12 escenas y controla reservas, abordaje, viaje, llegada, check-in, paneles y métricas demo. Usa «Siguiente» o elige cualquier escena. «Navegar libremente» permite explorar todos los perfiles desde el selector superior.

Para reiniciar: Modo inversionista → Restablecer datos demo. Solo afecta al almacenamiento local de V2. Cada navegador/dispositivo tiene su propio escenario. El enlace de seguimiento muestra una simulación autónoma de solo lectura y no datos de pasajeros.

## Arranque y comprobación breve

Desde esta carpeta: `python3 -m http.server 4173 --directory dist`. Abrir el servidor en el navegador. También puede publicarse dist en hosting estático. No requiere instalación ni build.

Desde la raíz del repositorio: `node mockup-v2/tests/smoke.mjs`. Prueba de humo del modelo simulado, sin acceso a producción.

Fuentes: `REFERENCES.md`, `dist/sources.json`, `dist/CREDITS.md`. Avances por fases: `PROGRESS.md`.

## Publicación independiente

https://rutasec-mockup-v2-inversionistas.cebx3001.chatgpt.site

Se publica únicamente esta carpeta como artefacto estático independiente. No cambia GitHub Pages, Workers, R2, D1 ni otra configuración del repositorio original. Los permisos del enlace se administran aparte; se creó privado por defecto.
