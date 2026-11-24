# Entrega de identidad y gestión empresarial — 2026-11-24

## Alcance y protección

Autorización explícita del usuario para implementar lo parcial/pendiente de la auditoría Premium, con UX por tareas. Baseline Cloudflare384dabeea7fa0dadf24a7fd21883b144f0c7b301; main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a. Demo/Pages preservado. No duplicar base/bucket/aplicaciones. Seguridad avanzada S1 y migración0025 excluidas de la entrega; no pagos reales.

## Implementación

Matriz completa, archivos, endpoints y tablas: [ENTERPRISE_PILOT.md](../ENTERPRISE_PILOT.md). Migraciones0027/0028 aditivas; reutilizan perfil/media/R2, membresías, calendario, gastos, reservas, liquidaciones y GPS existentes.

Identidad: tres colores, Standard básico/Premium avanzado, borrador/publicación, galería tipada, recorte con alpha PNG para logos, vistas previas pública/administrativa, QR/enlace y temas dinámicos por empresa. Correcciones: gate Premium efectivo en endpoint heredado; publicación separada de borrador; CAS e imágenes/vehículos aislados. Marketplace conserva RutasEC.

Gestión: navegación móvil de cinco destinos/barra lateral escritorio; flota GPS real, historial manual/estimaciones de recorrido, controles por componente y alertas deduplicadas; empleados/turnos/asignación y remuneraciones; venta de oficina con inventario/QR compartidos; clientes/proveedores; AR/AP y movimientos simulados con saldo atómico/reversos únicos; gastos reutilizados; liquidaciones incluyendo personalizados; reportes de gestión por vehículo/ruta. Preparación fiscal expresamente no autorizada.

## Verificación local

- Regresión completa:70/70 PASS252.97s (incluye la prueba S1 local NO publicable).
- Integración empresarial después de configuración fiscal:2/2 PASS7.27s.
- Chromium: identidad con crop/logo/foto de vehículo y publicación10.75s; empresa9.91s; Alpha44.87s; correo12.92s; plataforma12.32s; GPS33.25s, todos PASS. Cuenta/proveedores simulados y DB/R2 aislados; no aceptación de teléfonos ni proveedores reales.
- Vista de escritorio inspeccionada visualmente; ancho360/390/1280 sin desbordamiento. Formularios conservan contexto/error, confirman descarte y no permiten doble envío por botón.
- Dos Premium y un Standard: paletas persistentes independientes, borrador no público, roles/medios/plan vencido y conflictos de revisión. Pagos concurrentes por encima de saldo200/409, reverso duplicado rechazado, turno superpuesto rechazado, nómina publica una sola obligación, venta oficina reintenta el mismo boleto y liquidación evita doble inclusión.
- Fallos corregidos durante pruebas: PNG de fixture corrupto; consulta de alertas LIKE excedía límite D1, reemplazada por identificador exacto/join; aserción de galería ajustada a contrato identity.gallery. No se eliminó cobertura ni se relajaron controles.

## Límites / pendientes externos

SRI: falta gestión de certificado, secuencias y adaptador firmado probado; fiscal-submit503, sin llamadas fiscales reales. Remuneraciones no automatizan derecho laboral/IESS/impuestos. Google OAuth y transporte/remitente de correo reales siguen sin configuración; flujos automatizados no prueban entrega de correo real. GPS físico, Android en segundo plano y usabilidad con operadoras pendientes. No declaración de seguridad/compliance de producción.

## Entrega remota

**Desplegado y comprobado.** Commit funcional `c1754e0b8e6a484ef66458db866384aaa566e11f`; [Actions45309144150](https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/45309144150) verify/deploy SUCCESS. Paquete exacto sin S1:69/69 PASS52.12s CI (225.06s local); seis recorridos Chromium PASS en CI. La comparación con baseline contiene38 archivos, cero cambios de código/demo raíz y cero cambios S1.

Migraciones0027/0028 aplicadas al D1 existente. Health remoto confirma enterprise-identity-v1/schema0028, D1/R2true y paymentsdisabled. Versiones Workers API `af4bc2e0-3431-46cd-8c54-19ad5a1f5f75`, web `3c89f3c9-05a9-42e9-a94d-75164401f33c`, admin `1ab249bb-b762-4ad1-9824-1ba52c02f84e`. Activos company/editor, company/theme, business/app y business.css descargados coinciden byte a byte con fuente probada.

Aplicación: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Entradas contextuales Identidad de empresa y Administración de empresa usan la operadora autenticada; no pedir IDs manuales.

Remoto no autenticado: company-identity401, enterprise401, perfil inexistente404; Chromium390px abre Standard/Identidad/Empresa sin errores JS ni desbordamiento y con mensaje de acceso requerido. Chromium de inspección necesitó ignoreHTTPSErrors por el certificado del proxy del entorno; curl verificó HTTPS normalmente. No se sembraron compañías/cuentas ficticias ni se accedió a datos empresariales privados para esta comprobación.

Configuración pública de acceso: googlefalse, emailfalse, pushtrue. Bloqueos exactos: GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET; AUTH_EMAIL_FROM y binding AUTH_EMAIL o RESEND_API_KEY. Las seis pruebas autenticadas de CI usan proveedores de prueba; no equivalen a alta real por Google/correo.

`main` continúa0e8934886b30ec9eec8db5a26886ba4bafcd6b4a. Pages SHA256 antes/después `c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f`, sin alteración. Restore-check fue skipped: no se exportó D1 ni se realizó respaldo nuevo en esta entrega.

Rollback: recuperar versiones previas de Workers sin revertir/eliminar tablas aditivas; datos preservados. No nuevos servicios de pago. Coste incremental: almacenamiento D1/R2, alertas acotadas y polling10s solo con flota visible. Estado de Pages/main se vuelve a comprobar después del despliegue.
