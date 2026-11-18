# Alpha C — catálogo y búsqueda reales

El usuario autoriza todas las correcciones de auditoría. Se conserva trabajo A/B sin recrearlo ni descartarlo. Revisión previa: remoto0014, D1/R2 accesibles, Google/correo sin configurar; no se crea infraestructura.

## Implementado y comprobado localmente
- Migración aditiva0017: data_scope de operadores, qa para registros anteriores. No se borran viajes/boletos ni se promueve por nombres. Publicaciones nuevas de cuentas verificadas normales usan alpha; runtime de tests aislado admite QA explícito. Miniapps públicas y catálogo normal excluyen QA.
- Filtros backend por ciudad origen/destino, fecha civil de Ecuador continental (incluido límite23:59), pasajeros, vehículo y operadora. Sin fallback ni generación ficticia. Agotadas fuera de resultados disponibles; tarifas/vehículos provienen de D1. Privados siguen siendo rutas publicadas con horario propio validado al confirmar.
- UI reutiliza las16 ciudades del demo, sin importar semillas; selección predefinida al publicar, filtros y estado vacío. Solicitudes de catálogo anteriores no sobrescriben filtros nuevos.
- Comprobación de operadora aprobada/ámbito Alpha al confirmar compartido/privado y seleccionar propuestas; no basta conocer un identificador oculto.
- Cloudflare raíz preparada para redirigir a /standard/; copia de demo preservada en /demo/. run_worker_first incluye ambas entradas y el SW copiado no intercepta Standard/cuenta/Premium/miniapp ni APIs. Pages y código raíz demo originales intactos.

## Pruebas
`npm test`:48/48 PASS. Nuevo caso QA conservado/invisible, cambiar nombre no lo promueve, filtros/fechas/agotadas/inyección como texto, tipos/capacidad y router. Regresión Standard/Premium/demo anterior conservada.
`npm run test:alpha-local`: PASS, Google SIMULADO, búsqueda Quito vacía → Cuenca/Guayaquil/fecha positiva → login/checkout → boleto y sesión independiente. Correcciones del hito A/B continúan funcionando.

## Límites y siguiente fase
Solo workspace; sin commit/push, deploy, migraciones remotas ni nuevas cuentas/datos remotos. La migración marca de manera conservadora todos los operadores anteriores QA; cualquier promoción futura requiere revisión explícita, nunca renombrar o SQL ciego. No se ha resuelto aún el alta documental ni se presenta autoaprobación dev como aprobación real: ese es el siguiente hito D.
Google real y correo real siguen pendientes de sus configuraciones externas. No se declara Alpha completa. Revertir código antes de deploy no requiere rollback remoto; conservar columnas/datos al revertir un despliegue futuro. La raíz Cloudflare cambia solo al desplegar; Pages conserva su URL.
