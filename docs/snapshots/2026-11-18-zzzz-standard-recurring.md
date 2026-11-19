# Alpha B — recurrencia Standard y cierre local

## Alcance autorizado
Usuario pide viajes recurrentes como básico, cuenta verificada al comprar y Google primero; Apple después. Se termina hito A con 41 pruebas y navegador email-local antes de comenzar B. Premium no se amplía; no se modifica demo/Pages. El resto de correcciones de la auditoría no se presenta como resuelto.

## Cambios
Programación persistente por ruta/vehículo/días/horarios/vigencia en misma D1; generación anticipada de salidas ordinarias, inventario por fecha, preview sin escrituras, batch atómico/idempotente, prevención de conflictos (incluido calendario Premium), cancelación individual ya existente y stop sin cancelar reservas. Máximos 90 días/90 salidas, hora Ecuador continental; renovación explícita al terminar el periodo. Sin cron ni infraestructura duplicada. Backend standard-recurring.mjs y UI standard/recurring.mjs; nuevo módulo incluido en caché de assets, APIs siempre fuera de caché. Guía docs/STANDARD_RECURRING.md.

Migraciones0015_checkout_identity y0016_standard_recurring preparadas y probadas en Miniflare; NO aplicadas remotamente. Revisión de código alpha-standard-recurring-v1/schema0016; no se etiqueta v0.1.0 Alpha funcional. Configuración normal ALLOW_DEVELOPMENT_AUTH=false: acceso privado exige cookie temporal de cuenta verificada, no claves legacy, incluso si la identidad se vinculó después. keep_vars=true conserva configuración OAuth/remitente externa entre despliegues.

## Pruebas ejecutadas
- Regresión final `npm test`: 46 tests,46 PASS,0 FAIL, sobre código final de auth/recurrencia. Standard, demo y módulos Premium existentes incluidos.
- `npm run test:alpha-local`: PASS. Chromium, Google SIMULADO, operador → programación de 3 salidas → pasajero anónimo consulta → login al checkout → asiento/pago SIMULADO/QR → manifiesto → recarga y sesión nueva conservan boleto → cancelación de otra salida.360/390/1280 sin desbordamiento; captura local ignorada qa-output/alpha-recurring-390.png inspeccionada.
- `node tests/email-local.e2e.mjs`: PASS (buzón SIMULADO, alta/confirmación/cambio/reset/admin).
- `node tests/platform-local.e2e.mjs`: PASS (ledger/roles/plan/admin, sin cobros).
- Identidad: sin email Google verificado, OAuth no crea sesión. Legacy no verificado, bearer o cookie sin caducidad rechazados en configuración normal; dos sesiones Google recuperan mismo boleto.
- Recurrencia:90 salidas en batch, conflictos/publicaciones concurrentes200/409 sin huérfanos, asientos por día, cancelación de fecha no recreada por retry, stop concurrente con reserva sin boleto confirmado cancelado.
- `git diff --check` PASS;10 archivos clave de demo/Pages/backend demo comparados con HEAD: idénticos. Sintaxis nuevos módulos comprobada.
- Bundle Worker con esbuild PASS (salida temporal, sin deploy). Wrangler dry-run local no finalizó: esta instalación intenta crear su configuración global en /home/agent/.config/.wrangler, ruta no disponible en el sandbox. No se cambió HOME ni se pidió acceso adicional; empaquetado verificado con esbuild y ejecución con Miniflare. No se presenta el dry-run como aprobado.

El harness del navegador convierte redirects OAuth en navegaciones frescas para interceptar todo el proveedor simulado; las pruebas de backend sí comprueban respuestas302, firma/state/nonce/PKCE/cookies. No se presenta esa simulación como login Google real.

## Bloqueos y límites
GET remoto antes de cambios: health a2-email-password-v1/schema0014/D1/R2=true, auth/config google=false/email=false. Faltan cliente/secreto OAuth web Google y remitente/transporte de correo. No se configuró ni contrató proveedor, no se crearon identidades/reservas remotas ni se concedieron roles reales. Apple no implementado por decisión del usuario. Persisten los demás hallazgos de auditoría (onboarding documental, filtros de búsqueda, cámara y estado visual de embarque, catálogo QA, etc.).
Se repitió GET auth/config al cierre: google=false/email=false, siguen faltando las mismas variables. No se considera activado por pruebas locales ni por tener un token de infraestructura.

## Entrega
Solo cambios en workspace, con documentación/memoria/roadmap; sin commit/push, deploy, migración remota ni exportación. Mismos Workers/D1/R2, demo público intacto. No ejecutar e2e QA antiguos contra remoto normal: /api/sessions queda restringido por servidor cuando se despliegue esta configuración.
Activación posterior: configurar cliente OAuth sobre origen/callback existentes; aplicar migraciones aditivas al entorno funcional y publicar versión compatible; verificar Google real con dos sesiones autorizadas. Conservar versiones y datos para rollback según guía, no borrar reservas. Este hito no cierra la Alpha completa.
