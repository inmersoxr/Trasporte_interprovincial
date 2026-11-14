# Entorno Cloudflare independiente

No modifica los archivos ni el workflow del demo GitHub Pages. No usar datos personales ni pagos reales.

## Recursos
- Frontend de paridad: https://rutasec-web-dev.drbrownlabs.workers.dev/
- Salud D1 a través del frontend: https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/health
- Worker D1: https://rutasec-api-dev.drbrownlabs.workers.dev/health
- `DB`: D1 `rutasec-dev`; `BUCKET`: R2 `rutasec-dev-files`.
- `PARITY_BUCKET`: R2 `rutasec-parity-dev-files`, exclusivo de simulaciones del frontend de paridad.

La raíz es COPIA DEMOSTRATIVA de la interfaz existente. `/api/*` usa el bundle demo en un bucket nuevo; no se conecta al ledger demo original. `/standard-api/*` usa service binding al Worker D1, que por ahora solo implementa `/health`. Reservas D1 Standard y demás APIs no están implementadas todavía (J3–J7). No confundir una reserva de paridad R2 con migración comercial terminada.

## Reproducir
Desde esta carpeta, con Node 24:

```sh
npm ci
npm test
npm run build
```

El build copia solo assets públicos; nunca copia `.git`, credenciales, SQL ni código backend al directorio Static Assets. Reescribe únicamente la copia de `shared/live-config.mjs` y `sw.js`: APIs same-origin, caché con prefijo propio y exclusión de APIs para evitar guardar boletos privados o devolver HTML cuando falle la red. Manifest y enlaces son relativos al dominio nuevo.

Para desplegar, proporcionar `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN` mediante secretos del entorno y ejecutar `npm run deploy:frontend`. `python deploy.py` es exclusivamente el bootstrap J1 y se niega a sobrescribir un Worker existente. `python check-remote.py` verifica persistencia y redespliega temporalmente SOLO el Worker dev; revisar actividad paralela antes de ejecutarlo.

Prueba de navegador: `npm run test:frontend` con Chromium instalado en `/usr/bin/chromium` o variable `CHROMIUM_PATH`. Respeta proxy HTTPS del entorno; requiere que Chromium confíe en su CA. No desactiva validación TLS. Crea registros ficticios en el bucket de paridad y cancela la salida en finally; los registros históricos quedan en ese bucket aislado. No envía WhatsApp.

## GitHub Actions y bloqueo pendiente
`.github/workflows/cloudflare-dev.yml` verifica PRs, despliega únicamente desde la rama `codex/cloudflare-standard-junior` y permite despliegue manual en entorno GitHub `cloudflare-development`. No despliega automáticamente en main ni altera el workflow Pages.

Para activar ese despliegue, un administrador debe configurar en GitHub los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` (ID de cuenta `05c3eb3b0c05413d604a3f0fb6522940`) a nivel repositorio o entorno. Las herramientas conectadas permiten publicar código, pero no administrar esos secretos ni ejecutar workflow_dispatch; esa ejecución no se verificó desde este entorno. No se incluyen tokens en código, YAML, logs o commits. Mantener J2 en curso hasta validar ese camino desde GitHub.

## Rollback probado
Frontend: versión estable `34f4351c-240c-4952-9884-efab1d980ab5`. Se desplegó una revisión temporal con `environment.json` diferente y se restauró esa versión mediante API Workers Deployments, con verificación HTTP del marcador `j2-static-v1`. No elimina datos R2 ni D1. Worker D1: `check-remote.py` prueba restauración de fuente. Restauración de datos D1 remota y backup duradero siguen pendientes; export/restauración local de SQL sí se probaron.

Workers Free sin upgrade de plan; R2 Standard con cuota gratuita y posibles excedentes. No hay presupuesto medido ni garantía de factura cero.
