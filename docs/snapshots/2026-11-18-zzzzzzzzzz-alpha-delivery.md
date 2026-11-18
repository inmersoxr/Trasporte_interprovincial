# Alpha G — entrega Cloudflare verificada

Fecha2026-11-18, cierre posterior a F. Autorización expresa del usuario para todas las correcciones; no se pidió permiso nuevamente. Alcance Standard v0.1.0 Alpha, sin cobros reales ni ampliación Premium.

## Fuente y ejecución

- PR2: https://github.com/inmersoxr/Trasporte_interprovincial/pull/2 —79 archivos,2133 adiciones/172 eliminaciones; commit badbaa523322e07bf6bb550a38ccd91dc2905518.
- Verificación PR: Actions44415457679 SUCCESS.54 tests y los tres recorridos Chromium locales Alpha/email/platform PASS, además de build/sintaxis. Proveedores Google/correo SIMULADOS, QR decodificado de píxeles reales en vídeo simulado.
- Integrado únicamente en codex/cloudflare-standard-junior:2a3df1c01549493543e8e131f57edbf037cbc0a9. No se modificó ni integró en main.
- Actions de entrega44415780046 SUCCESS: https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/44415780046 . Repite54 tests y tres navegadores, aplica0015–0020 en D1 existente y despliega API/web/admin existentes.
- Preflight actual comprobó CLOUDFLARE_API_TOKEN disponible y CLOUDFLARE_ACCOUNT_ID correcto; autenticación/autorización probadas por migraciones y tres deploys satisfactorios. No se asumieron secretos ni se volvió a solicitar token al usuario.
- API versión Cloudflare1d9af950-02f3-46d6-92f9-0d4f483c403f; web397ab7bb-09de-44c2-b205-71fdf4fe29a2; admin700f5b40-c618-4fa9-a8c1-93e1427910c5.

## Estado remoto observado

- https://rutasec-web-dev.drbrownlabs.workers.dev/ redirige302 a /standard/. Etiqueta provisional v0.1.0 Alpha, pagos de prueba, sin cobros.
- Health directo y fachada200: alpha-email-code-v1/schema0020_email_verification_code,ok/d1/r2true,paymentsdisabled.
- Catálogo normal200,departures=[] y routeOffers=[]: los registros QA anteriores se conservaron, pero no aparecen como viajes Alpha. No se insertaron publicaciones, cuentas ni reservas sintéticas remotas para aparentar funcionamiento.
- APIs privadas de operador/boletos/documentos401 sin cuenta; creación de sesión sintética403 con ALLOW_DEVELOPMENT_AUTH=false; autoridad admin401 sin sesión.
- /standard/,/account/,/demo/,scripts demo,scanner y jsQR locales200. Navegador remoto comprobó entrada Standard/catálogo vacío,360/390/1280px sin desbordamiento, formulario de código sin IDs, login administrativo y alias demo sin errores JS. Se usó ignoreHTTPSErrors solo en el navegador del harness por certificado del proxy administrado no instalado en Chromium; curl conservó validación TLS. No se cambió TLS de la aplicación.
- GitHub Pages200,SHA256 c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f antes/después, idéntico. Fuentes originales y workflow Pages sin cambios. API demo y ledger original no se migraron.

## Bloqueos externos exactos

`/standard-api/auth/config`: google=false,email=false. Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en rutasec-api-dev; y AUTH_EMAIL_FROM junto a binding AUTH_EMAIL o RESEND_API_KEY para transporte autorizado. Preflight Cloudflare actual:zonesReadabletrue,zoneCount0,rutasecDomainCount0. Los secretos Actions de Cloudflare sí funcionan; son distintos de estas configuraciones de identidad/correo.

No hubo envío real ni cuenta del propietario activada. El siguiente paso dependiente es configurar cliente OAuth Google con callbacks existentes y remitente/transporte autorizado; después verificar buzón/primer owner y ejecutar circuito operador–pasajero con dos teléfonos/cámara física. No comprar dominio/plan ni crear cuentas externas para ocultar el bloqueo. Apple posterior.

## Documentación paralela preservada

Main avanzó de17f1494 a305cd719 mientras se trabajaba. Comparación comprobó solo dos cambios documentales: memoria y snapshot RutasEC Admin corporativo. Se leen y conservan en esta rama sin modificar main ni convertir métricas ilustrativas en datos. El futuro centro corporativo completo continúa conceptual; el panel G1/revisión Alpha existente no certifica todos sus módulos. Snapshot canónico2026-11-18-rutasec-admin-centro-operaciones.md.

## Cierre, límites y continuación

Correcciones A–F implementadas/probadas y G desplegada/verificada dentro de su alcance; no se declara Alpha aceptada de extremo a extremo con identidades reales. Inventario y criterios pendientes en docs/ALPHA_ACCEPTANCE.md. Sin infraestructura duplicada, upgrades, exportaciones automáticas ni cobros; solo consumo de CI y servicios de desarrollo existentes. Coste de factura no auditado.

Restore remoto actual no ejecutado (job opt-in omitido), sin copia duradera nueva. Rollback integral hacia0014 no certificado: podría reabrir acceso QA/catálogo antiguo. Preferir corrección compatible con esquema0020 conservando guards de identidad/catálogo y los datos; no eliminar migraciones/tablas/cuentas ni activar acceso sintético para recuperar servicio. Ante incidente, limitar temporalmente el entorno funcional y preparar parche validado sobre esta base; demo queda separado.
