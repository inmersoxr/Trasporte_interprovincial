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

Pendiente de confirmación al escribir esta sección: solo considerar desplegado después de Actions exitoso, health0028/enterprise-identity-v1 y comprobaciones de activos. Se actualizará esta sección con SHA/run y resultados. No se inicia prueba empresarial remota creando datos ficticios.

Rollback: recuperar versiones previas de Workers sin revertir/eliminar tablas aditivas; datos preservados. No nuevos servicios de pago. Coste incremental: almacenamiento D1/R2, alertas acotadas y polling10s solo con flota visible. Estado de Pages/main se vuelve a comprobar después del despliegue.
