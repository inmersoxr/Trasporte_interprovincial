# J1 — Infraestructura verificada en Cloudflare

Fecha: 2026-11-14 (America/Guayaquil). Base main: `fa2c7df394fcac52b3481bc483ab0d55dfedd014`.

## Alcance y estado
J1 de infraestructura: **verificado**. Esta conclusión NO completa la Fase 1 comercial del roadmap: APIs de negocio, identidad y reservas corresponden a siguientes hitos Junior. No hay frontend Standard conectado ni ventas comerciales. El objetivo fue verificar Worker, D1, R2, migración, persistencia y rollback aislados antes de J2.

## Inventario y despliegue
Tras activar R2 y workers.dev desde el dashboard, consultas autenticadas confirmaron listas vacías de Workers, D1 y buckets. `main` remoto seguía en el SHA base; no se observó despliegue paralelo en esta cuenta. Se crearon únicamente:
- Worker: `rutasec-api-dev`, URL `https://rutasec-api-dev.drbrownlabs.workers.dev/health`.
- D1: `rutasec-dev`, ID `40c86354-202d-4b69-b7f1-9cb604932a79`, binding `DB`.
- R2: `rutasec-dev-files`, clase Standard, binding `BUCKET`.
- Migración existente `sync-service/migrations/0001_initial.sql` aplicada remotamente.

Código aislado en `cloudflare-dev/`: worker de salud, despliegue Python sin dependencias, configuración Wrangler sin secretos, pruebas locales y script remoto. GET /health verifica migración y acceso R2, devuelve no-store; demás rutas 404 y escrituras de salud 405. No se publican detalles de errores internos.

## Pruebas y resultados reales
- `node --test cloudflare-dev/tests/*.test.mjs sync-service/tests/*.test.mjs`: 4 archivos aprobados, 0 fallos. Sintaxis JS/Python correcta.
- GET /health desplegado: HTTP 200, ok/d1/r2=true, schema=0001_initial, payments=disabled.
- D1: INSERT ficticio, SELECT en petición independiente, DELETE y SELECT vacío: PASS.
- Versión temporal del Worker: R2 put/get/delete de objeto ficticio y comprobación de limpieza: PASS.
- Rollback por redespliegue de fuente: revisión temporal observada por HTTP y vuelta observada a j1-infrastructure-v1: PASS. Versión restaurada `4b556ebd-90e8-4c36-8535-bdb2f9f7d29d`.
- API D1 export: backup SQL real descargado a `/tmp/rutasec-dev-j1-backup.sql`; restaurado en SQLite local, 15 tablas, schema_migrations correcto e integrity_check=ok. SHA256 `36f377c57f01d479cdb1f90065ab5c78641f0baeed3d4793ee77d0955d30a2e2`. Archivo temporal, no backup duradero de producción; restauración remota D1 no probada.
- GET /api/bookings=404 y POST /health=405: PASS, no se finge API comercial.
- GitHub Pages HTTP 200 y API demo /health ok=true tras primer despliegue. Sin escrituras en demo ni cambios de sus archivos/workflow.

## Fallos encontrados y corregidos/límites
El cliente Python urllib con User-Agent predeterminado recibió HTTP 403 / código Cloudflare 1010 en workers.dev; curl sí accede. El verificador usa curl con agente explícito; no se alteró protección de cuenta. Dos intentos iniciales de rollback no observaron la revisión por este motivo; no se contaron como aprobados. Se repitió con éxito. El despliegue restablece workers.dev tras cada upload. PRAGMA integrity_check remoto fue rechazado por D1 con SQLITE_AUTH; no se reintentó ni se alteraron permisos, verificación de integridad hecha sobre backup local.

## Decisiones, consumo y rollback
Se mantiene esquema inicial sin migrar datos demo. Workers sin upgrade de plan, R2 Standard; pruebas consumen pocas escrituras/lecturas D1/R2, sin medición de factura ni promesa de costo cero. Pagos deshabilitados. Credenciales solo durante ejecución, fuera de Git.
Rollback: restaurar fuente previa con función deploy del script y verificar /health; script check-remote ejecuta ese ciclo con finally. No implica reversión de datos ni rollback de migraciones. No borrar recursos ni datos para revertir código.

## Siguiente tarea
J2: copia frontend con Static Assets, configuración API por entorno, service worker que no cachee APIs, paridad y regresión en dominio independiente. Mantener las APIs simuladas de paridad explícitamente aisladas de futura API D1 Standard y de demo original. J3–J8 siguen pendientes. No desarrollar Premium empresarial ni pagos reales.
