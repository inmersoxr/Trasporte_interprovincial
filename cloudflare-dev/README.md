# RutasEC Standard en Cloudflare — desarrollo

GitHub Pages y su API/ledger R2 originales permanecen intactos. No se fusionó la rama dev a main ni se modificó el workflow Pages.

## Entradas y aislamiento
- **Standard D1:** https://rutasec-web-dev.drbrownlabs.workers.dev/standard/
- **Copia de paridad del demo:** https://rutasec-web-dev.drbrownlabs.workers.dev/
- **Salud API por service binding:** https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/health
- Worker API rutasec-api-dev, D1 rutasec-dev (DB), R2 privado rutasec-dev-files (BUCKET).
- La raíz usa /api/* y bundle demo en bucket exclusivo rutasec-parity-dev-files; Standard usa /standard-api/api/*, D1 y código standard-*.mjs. Nunca se usa el ledger demo original para pruebas.

J1–J7 verificados con snapshots por fase. J8 es regresión/handoff; consultar snapshot final para estado actual. La aplicación es de desarrollo: datos ficticios, pagos/avisos/SOS y seguimiento simulados, no un lanzamiento comercial.

## Funciones y límites
Operadoras, vehículos, rutas, salidas y catálogo D1 con autorización por membresía. Compartidos con asientos/transacciones; privados fijos con calendario exclusivo y tarifa por vehículo; personalizados con ofertas progresivas y elección libre revalidada atómicamente. Boletos/QR, cancelaciones/reembolsos simulados, manifiestos, abordaje manual por QR, estados e historial.

Identidades por capacidades privadas dev (hash en servidor), sin passwords/email verificado ni recuperación comercial. La clave se guarda localmente y puede copiarse/restaurarse en otro navegador. No compartirla con observadores: enlaces públicos de seguimiento no la incluyen. Alta de operadora autoaprobada solo para pruebas; no acredita habilitación comercial. No se inventan valoraciones.

Seguimiento con geometría de referencia Cuenca–Guayaquil, estado/reloj en D1 y render local; no GPS ni necesariamente ruta solicitada. Operador controla movimiento/atiende SOS, pasajero confirmado activa/cierra SOS DEMO, público observa. Enlaces históricos sin TTL. No se contacta emergencias ni se envía WhatsApp automáticamente.

## Reproducir
Node24, versiones fijadas en package-lock.json:

```sh
cd cloudflare-dev
npm ci
npm test
npm run build
```

Tests integran Workerd/Miniflare+D1 con migraciones reales/concurrencia. Build publica solo assets permitidos, no toca fuentes Pages y genera geometría para API. SW de paridad/Standard usan scopes/cachés distintos, versión por contenido y excluyen APIs. No se promete reservar sin conexión.

Browser contra dev, con Chromium /usr/bin/chromium o CHROMIUM_PATH:

```sh
npm run test:frontend
npm run test:standard
npm run test:market
npm run test:operations
npm run test:regression
```

Respetan proxy/CA del entorno sin desactivar TLS. Crean datos ficticios solo en dev; cancelan/finalizan servicios y conservan historial. Cámara física, dos teléfonos físicos e instalación nativa quedan para piloto.

## Despliegue y secretos
Workflow cloudflare-dev.yml verifica PRs y despliega rama codex/cloudflare-standard-junior al entorno GitHub cloudflare-development o por workflow_dispatch. No despliega main ni cambia Pages. Ambos secretos están verificados por ejecución real; no volver a solicitarlos sin fallo concreto: CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID.

CI genera build, aplica migraciones D1 con tracking y despliega API antes de Static Assets; health exige schema0006. No guardar tokens en archivos/YAML ni registros en logs/artifacts. deploy.py es bootstrap J1 y rehúsa sobrescribir Worker existente; check-remote.py está retirado para impedir reemplazar la API de negocio por un probe.

## Rollback, respaldo y revisión posterior
Rollback por versión/fuente Worker/Static Assets probado J1/J2, sin borrar registros ni migraciones destructivas. Volver a código previo no revierte datos; revisar compatibilidad.

Tras el rechazo inicial, el usuario autorizó expresamente exportar D1 al runner GitHub para restauración temporal, sin publicar el dump. Run43911145328 SUCCESS: 29 tablas y registros actuales restaurados; integridad, FK, unicidad de asientos y calendario correctos. Archivo temporal eliminado; cero artefactos, sin SQL/enlaces firmados ni registros en logs. **No se creó almacenamiento duradero de respaldos.** Ver verify-d1-restore.py y snapshot2026-11-16-j8-z-authorized-restore-verified.md. La ejecución por push se retiró; solo se permite acción manual verify_restore opt-in sobre la cuenta/base dev fijadas. No activar exportaciones automáticas ni otro destino sin autorización.

Revisión Senior posterior: autenticación/recuperación/revocación, onboarding real, abuso, privacidad/retención, respaldos autorizados, cargas/límites/costos y requisitos legales/GPS/notificaciones. Premium empresarial y pagos reales fuera de etapa. Sin upgrade de plan; consumo/factura no medidos ni garantía de costo cero.
