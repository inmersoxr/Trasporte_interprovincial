# RutasEC — Inicio de backend relacional (2026-11-14)

## Estado
Se agregó esquema D1 de preparación; **NO** se creó base de datos remota, **NO** se desplegó Worker, **NO** se modificó el ledger R2 ni se activaron pagos. Frontend y demo siguen intactos.

## Arquitectura
Cloudflare Workers + D1 (relacional) + R2 (archivos/demo), frontend GitHub Pages. Empezar con Workers Free y D1 Free; migrar a Workers Paid cuando la carga real lo exija. El plan no garantiza escalabilidad ilimitada de una sola base D1.

## Primera migración
Archivo: `sync-service/migrations/0001_initial.sql`. Tablas de usuarios, operadoras, membresías, vehículos, ofertas de ruta compartida/privada fija, salidas, reservas, claims de asientos, pagos, eventos de pago, liquidaciones, solicitudes privadas y auditoría.

**Precaución:** las tablas no constituyen todavía un backend funcional. Antes de aplicar, crear base D1 de desarrollo independiente y configurar binding `DB` en Worker de desarrollo, manteniendo binding R2 `BUCKET`. Ejecutar migración con Wrangler y validar integridad/índices. Nunca ejecutar migraciones destructivas sobre datos R2.

## Próxima implementación
1. Preparar Worker de desarrollo con endpoints de lectura/escritura D1 y autenticación segura, sin exponerlo como producción.
2. Implementar operaciones de inventario con SQL atómico y expiración de holds, sin vender asiento antes de pago verificado.
3. Migrador R2 → D1 idempotente y auditable; conservar copia y verificar conteos.
4. Integrar frontend progresivamente con feature flags y pruebas E2E.
5. Proveedores de pago sandbox, webhook firmado, conciliación y liquidación a operadoras (split opcional).
6. Crear snapshot de cada hito con pruebas, commit y despliegue real.

**Nota:** la política comercial prioriza costo total. Consultar `PROJECT_MEMORY.md`.
