# J2 — Comprobación real de secretos y reejecución de Actions

Fecha de evidencia: 2026-11-16 UTC, según logs GitHub. Referencia main sigue `fa2c7df394fcac52b3481bc483ab0d55dfedd014`; rama dev remota inicial `7cd035e6399ebc90a043514d7e33ff85670764f5`.

## Objetivo y criterio
Comprobar si CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID están disponibles y son utilizables por GitHub Actions; ejecutar J2 desde CI sin asumir configuración y sin modificar demo. Cierre requiere deploy/smoke de GitHub aprobado, además de pruebas de paridad/rollback ya registradas. Estado: J2 **en curso, bloqueada por un secreto externo**.

## Ejecuciones y cambios
1. Reejecutado mediante conector GitHub inmersoxr el run push `43596575209`, intento 2. Verify volvió a aprobarse. Deploy falló en Check required credentials con Missing CLOUDFLARE_API_TOKEN secret. Logs mostraban token vacío e ID enmascarado, por lo que NO se asumió correcto el valor del ID.
2. Modificado únicamente preflight de `.github/workflows/cloudflare-dev.yml` para revisar ambas variables independientemente y comparar ID con cuenta dev esperada. No se imprime token ni valor del secreto; el token solo se autentica por Wrangler si está presente. Shell validado con bash -n. Commit local `08b9073`, remoto `ec7b960fd107c4a9961a39ecf7962f2dd9613914`, publicado en el PR borrador #1 sin cambiar main.
3. Nuevo run push real: https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/43882962379
   - Job verify `133353417597`: SUCCESS, instalación npm, pruebas, build y sintaxis.
   - Job deploy `133353737548`: FAILURE, preflight exit code 1.
   - Mensaje 2026-11-16T14:11:06.6668676Z: `Missing CLOUDFLARE_API_TOKEN secret`.
   - Mensaje 2026-11-16T14:11:06.6677028Z: `CLOUDFLARE_ACCOUNT_ID matches RutasEC: OK`.
   - Deploy Wrangler y smoke posteriores no ejecutados. No se puede validar autenticación ni permisos de un token ausente en el runner.

## Resultado exacto y acción externa
**CLOUDFLARE_ACCOUNT_ID configurado y correcto. CLOUDFLARE_API_TOKEN ausente/no accesible en el contexto del job deploy.** Tener un token en la conversación o usarlo desde Codex no lo configura en Actions. El conector disponible no admite administración de Actions secrets; github_fetch excluye expresamente secrets APIs, y no hay herramienta de escritura de secretos. No usar secretos en YAML ni sustituir CI por un despliegue manual para declarar J2 completa.

Un administrador debe guardar SOLO `CLOUDFLARE_API_TOKEN` en:
https://github.com/inmersoxr/Trasporte_interprovincial/settings/secrets/actions

Usar **New repository secret**, nombre exacto `CLOUDFLARE_API_TOKEN`, valor del token Cloudflare autorizado. Alternativa: definirlo en environment `cloudflare-development`, usado por deploy. Si ya existe en otro entorno/repositorio u organización, debe hacerse accesible a este repositorio/job. No es necesario volver a configurar el ID correcto ni crear otro token por este error.

Después reejecutar los jobs fallidos del run `43882962379`; esto puede hacerlo el agente con su herramienta de reejecución. Si pasa preflight pero falla Wrangler, comprobar permisos/autenticación con el error concreto. No afirmar J2 verificada antes de ese deploy y smoke.

## Estado de recursos y demo
Comprobación de lectura durante esta sesión:
- Frontend `https://rutasec-web-dev.drbrownlabs.workers.dev/environment.json`: revision=j2-static-v1.
- `/standard-api/health`: ok=true, d1=true, r2=true, schema=0001_initial, payments=disabled.
- GitHub Pages HTTP 200; API demo health ok=true.
- Sin cambios en UI, archivos demo, datos R2/D1 ni versiones desplegadas por esta ejecución fallida. Pruebas de navegador/rollback previas siguen registradas; no se repitieron como si hubiera nuevo despliegue.
- La raíz del frontend dev sigue siendo paridad demo R2; D1 solo health hasta J3–J7.

## Rollback, consumo y próximo paso
Preflight/diagnóstico no modifica infraestructura ni recursos demo. Rollback del cambio CI: revertir commit de preflight en rama dev; no necesario para resolver secreto. GitHub Actions consumió ejecuciones de pruebas/build, costo no cuantificado; lecturas HTTP únicamente en Cloudflare, sin upgrade ni cobros reales.
Siguiente tarea: administrador configura secreto del token; agente reejecuta deploy, verifica URL/bindings/paridad y cierra J2 si pasa. J3–J8 no iniciadas aquí. PR: https://github.com/inmersoxr/Trasporte_interprovincial/pull/1.
