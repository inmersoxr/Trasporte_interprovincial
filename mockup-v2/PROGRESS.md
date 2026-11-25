# Mockup V2 · avances

Base: 759367e, rama exclusiva mockup-v2. Autorización 2026-11-24: infraestructura simplificada a JavaScript/JSON y almacenamiento local; no se requiere FastAPI/Scorpio ni sincronización entre dispositivos.

1. Base reutilizada: logo/iconos, fotografías con sus créditos, Leaflet BSD, contrato de simulación vial y ruta OSRM. Raíz original intacta; V2 se sirve exclusivamente desde mockup-v2/dist. Inspección de main en lectura: misma base de frontend sin build. No se consultan ni alteran servicios productivos.

2. Núcleo común: mundo JSON, IDs, relaciones tipadas, eventos, inventario y comandos simulados. Referencias fijadas en REFERENCES.md. Infraestructura local según autorización sobrevenida.

3. Fichas dinámicas por entidad, mapa, catálogo, modos directorio/marketplace/Premium, búsqueda transporte, rutas heredadas, guardados y comparación. Diseño móvil y desktop con activos reutilizados.

4. Catálogo Baños: 15 alojamientos con 45 habitaciones demo, 15 restaurantes con 30 opciones, 8 agencias, 25 ofertas de tours, 15 atracciones, 5 bienestar y 5 experiencias nocturnas. Fuentes públicas y activos con créditos; datos comerciales identificados como simulados.

5. Contexto antes/durante/llegada/después y notificaciones controladas. Recomendaciones evitan ofrecer hospedaje pendiente si ya hay reserva; todas leen el mundo compartido.

6. Checkout simulado con asientos, fechas, huéspedes, mesas, tours, entradas, cupones, QR digital/imprimible, itinerario y cancelación/modificación. Paquetes configurables con proveedores sustituibles e inventario común; privado competitivo controlado, sin adjudicación automática.

7. Descubre Ecuador accesible desde Home, regiones Pacífico/Andes/Amazonía y circuitos Volcanes/Cascadas/Aventura. Fichas nacionales representativas; Baños mantiene mayor detalle.

8. Consola modular por empresa: resumen, reservas, catálogo editable, calendario, flota/conductores, recepción/limpieza, comandas, guías, POS, personal con invitación demo, finanzas y marca. Onboarding controlado; fichas públicas leen los cambios.

9. Servicio común de operaciones QR por proveedor, rechazo de doble uso, abordaje, check-in/out y eventos. Seguimiento reutiliza trip-core y ruta vial OSRM; iniciar/pausar/acelerar/finalizar, SOS controlado y enlace limitado de solo lectura. Sin sincronización entre dispositivos por instrucción del usuario.

10. Valoraciones propias 1–5, foto autorizada opcional y respuesta empresarial. Campañas segmentadas y patrocinio identificado, métricas controladas, cupones y descuentos del checkout. La reputación no depende del pago.

11. GAD: ficha territorial editable, eventos/circuitos, establecimientos y métricas agregadas. Admin: entidades/relaciones, empresas, usuarios demo, reservas, transacciones, planes y comisiones. Importación CSV/XLSX con mapeo, clasificación, normalización, duplicados, vista previa y publicación de fichas con procedencia.

12. Modo inversionista: 12 escenas navegables, compras/contexto/abordaje/movimiento/llegada/check-in/ventas/GAD/Admin controlados. Navegación libre, tiempo demo, QR, check-out y reset local. PWA y arranque estático; publicación y comprobación integral pendientes al momento de este commit.

## Comprobación final

- `node mockup-v2/tests/smoke.mjs`: PASS para catálogo, inventario, idempotencia, asiento ocupado, proveedor incorrecto, QR repetido, check-in/out, rollback de paquete, cupón, cancelación y persistencia local.
- Comprobación DOM de las 12 escenas en Happy DOM: PASS; inicialización y renderizado de compra, hotel, tour, comida, paquete, seguimiento, llegada, recepción, finanzas, GAD y Admin. Es una comprobación del código, no una prueba visual de navegador.
- Publicación independiente Sites confirmada por herramienta nativa; URL en README. Vista previa administrada: falló relay de puerto 4173. Navegador: no pudo leer permisos; la alternativa de escritorio tampoco ofreció control utilizable. No se declara revisión visual de navegador ni prueba en teléfonos físicos.
- Código de la raíz y servicios previos intactos; solo esta carpeta y la memoria/snapshot de V2 se modifican en mockup-v2. Entity y Scorpio se consultaron en lectura.
