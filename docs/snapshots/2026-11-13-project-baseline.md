# Snapshot 001 — RutasEC
Fecha: 2026-11-13
Tipo: inicio de desarrollo comercial tras aprobación del proyecto.
Fuente: conversaciones de diseño/arquitectura/pagos y revisión directa de archivos del repositorio en esta sesión.
Referencia: `PROJECT_MEMORY.md`.

## Estado comprobado en el repositorio
- GitHub Pages con frontend HTML/CSS/JS/PWA y cache service worker.
- Backend demo en Cloudflare Worker + R2; fuente `sync-service/`, build a `sync-service/out/worker.mjs`.
- Viajes simulados Cuenca–Guayaquil, SOS demo, operaciones, seguimiento compartido, reservas y pagos simulados.
- Código de Worker indica que viajes demo no expiran, incluso históricos; NO se verificó que esa versión esté desplegada en Cloudflare.
- Marketplace R2 en `marketplace/demo-v1.json`, límite explícito de 2500 reservas en demo; no adecuado para producción comercial.
- Código y UI de tres modalidades: compartido por asiento, privado con precio fijo por ruta y fecha propia, solicitud privada personalizada por cotización.
- Últimos cambios conocidos de navegación privada: commits `061190d52c081ae5a1499b9d8219ee4918b74611`, `1a96b359fb832a0a26284f59d3e85716bc0ca704`, `d791767418c2114dcf1445500d72b018c43d3b50`, `a24d1131b2c46afd9cef330dfc65f69365a70db0` (v38). No se ha ejecutado prueba end-to-end en esta sesión.
- GitHub y Cloudflare son despliegues distintos. Ningún pago bancario real activo.

## Decisiones comerciales y técnicas vigentes
- Proyecto aprobado; comenzar transición de mockup a aplicación real, no rehacer diseño.
- Ahorro como objetivo dominante; escalabilidad progresiva, evitar sobreingeniería.
- Cloudflare Workers + D1 propuesto como primera opción; R2 para archivos y demo histórica, no ledger monolítico de producción. Propuesta, aún no migrada.
- Tarjetas y transferencias pueden usar proveedores distintos. Comparar Datafast Dataweb, Kushki, Nuvei, PlacetoPay y alternativas; Deuna directo para enlace de pago cuando proceda.
- Split payment NO obligatorio; RutasEC puede gestionar liquidaciones a operadoras, sujeto a contrato y regulación.
- No asumir tarifas actuales de fuentes históricas. Datos orientativos y reservas detallados en `PROJECT_MEMORY.md`.
- Compra compartida confirma asiento solo tras pago; producción debe prevenir doble venta/cobro concurrente.
- Privado tarifa fija y personalizado por cotización son productos distintos.
- Seguimiento simulado persistente sin expiración 24h; no confundir con enlaces temporales de cobro.

## Pendientes / no verificados
- Versión exacta desplegada en Cloudflare, conectividad y binding R2.
- Pruebas completas de modalidades privadas, reserva concurrente, caché y API.
- Tarifas contractuales, mensualidades/mínimos, permisos para recaudar fondos de terceros y liquidar.
- Modelo D1 final, migración de registros, autenticación, proveedor GPS y controles operativos.
- Cargas reales, seguridad, protección de datos, obligaciones legales y fiscales.

## Política de siguientes snapshots
Crear `docs/snapshots/YYYY-MM-DD-<hito>.md` para cada hito relevante. Incluir commit SHA exacto del hito, pruebas ejecutadas con resultado, despliegue real, cambios y pendientes. Este snapshot es una línea base documental, NO certificación de producción.
