# J2 — Frontend independiente desplegado; CI pendiente

Fecha: 2026-11-14 (America/Guayaquil). Base de referencia main `fa2c7df`; hito local J1 `255a3b3`.
Estado J2: **en curso**, no avanzar a J3 antes de verificar despliegue desde GitHub. J3–J8 pendientes.

## Objetivo y cambios
Publicar copia de la interfaz aprobada en Workers Static Assets y verificar navegación/paridad, API por entorno, PWA y rollback, sin alterar GitHub Pages.
Archivos exclusivamente en `cloudflare-dev/`, nuevo workflow `.github/workflows/cloudflare-dev.yml`, documentación/evidencia. Ningún cambio a index.html, app.js, bookings.mjs, shared/live-config.mjs, sw.js ni workflow Pages originales.

## Entorno real
- Frontend: https://rutasec-web-dev.drbrownlabs.workers.dev/
- Salud backend a través de service binding: https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/health
- `/api/*`: bundle demo original ejecutado en R2 independiente `rutasec-parity-dev-files`.
- `/standard-api/*`: service binding al Worker dev D1, actualmente solo health. No fingir endpoints Standard de negocio.
- Static Assets publica allowlist de archivos públicos; no SQL/backend/credenciales. Config API de la copia usa location.origin. PWA de copia excluye APIs del caché y fallback, y cambia prefijo de caché. Manifest y enlaces conservan rutas relativas.

## Pruebas
- npm ci desde lockfile limpio, npm test: **19 tests aprobados**, 0 fallos. Incluye pruebas existentes y controles de salud/caché/assets.
- Build reproducible con Node 24, Wrangler 4.162.0; bundle y SW pasan node --check.
- Playwright 1.65.1 + Chromium 156, viewport móvil 390×844 y segunda sesión 1280×900: PASS. Carga de Static Assets, sin overflow horizontal, health D1 por binding, navegación, selección Standard/Premium demo, creación de salida ficticia, catálogo entre sesiones, reserva de dos asientos 8→6, boleto con recarga, acceso anónimo rechazado, mapa Leaflet, seguimiento y SOS simulado compartido, shell PWA offline, APIs fuera del caché, 0 errores JS y 0 peticiones al demo original.
- Script e2e crea registros históricos ficticios SOLO en bucket de paridad y cancela la salida en finally. No envió WhatsApp ni hizo cobros. No se probó en teléfonos físicos ni instalación nativa.
- Captura inspeccionada: `docs/evidence/2026-11-14-cloudflare-home-mobile.png`.
- Rollback real Static Assets: versión estable `34f4351c-240c-4952-9884-efab1d980ab5`; revisión temporal `99baf986-87f7-4824-8d90-f5b995c0436b` con marcador distinto observada por HTTP. API de deployments restauró versión estable; deployment rollback `02e32ac3-d619-4099-9012-ab64a942cdf2`. HTTP confirmó environment.json revision=j2-static-v1 después de restaurar.
- Verificación final: GitHub Pages HTTP 200; API demo /health ok=true. No hubo despliegue ni escritura de datos del demo.

## Fallos y correcciones
Chromium no confiaba en la CA del proxy de este entorno. Se registró CA oficial en NSS en la misma sesión de prueba, sin desactivar TLS; peticiones API Playwright configuradas con proxy HTTPS explícito. Primeros intentos fallaron por confianza/ruta de red, no contados como aprobados. Ajustadas esperas del verificador para boleto asíncrono y selector del mapa visible (existía también mapa Premium oculto). Un test que intentó crear procesos bajo sandbox falló EPERM; build movido al pretest y suite repetida con éxito.

## CI y dependencia externa pendiente
Workflow nuevo valida PRs y permite deploy automático SOLO de rama dev, o manual, hacia Worker dev; main/Pages no se alteran. Requiere secretos GitHub CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID (repositorio o environment cloudflare-development). No se ha verificado su configuración ni el despliegue CI. Herramientas GitHub conectadas publican código pero no administran secretos ni disparan workflow_dispatch. No guardar token en YAML.
Git push --dry-run con credencial de shell fue rechazado HTTP 403 para usuario cebx3001; conector GitHub inmersoxr sí acredita permisos push/admin y es el camino alternativo para publicar la rama de revisión. No cambiar credenciales globales ni tocar main.

## Riesgos, costo y siguiente tarea
La UI de paridad sigue siendo demo R2 y sus límites originales; no es backend comercial ni reemplazo D1. Premium solo demostrativo. R2 Standard, Workers sin upgrade, decenas de peticiones de prueba; costos/factura no medidos y posibles excedentes. Rollback de código no revierte datos. No adoptar esta URL como piloto Standard hasta completar J3–J8 y pendientes de J2.
Siguiente: verificar CI de rama dev; si faltan secretos/autorización de entorno, reportar el bloqueo exacto para que administrador lo configure y reejecute. Una vez J2 cerrada, J3: APIs D1 de operadoras, vehículos, rutas, salidas, catálogo y conexión Standard con controles de autorización/aislamiento.
