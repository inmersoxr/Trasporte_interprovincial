# RutasEC Premium — entrega funcional de desarrollo

## Entradas y modelo
- Gestión: https://rutasec-web-dev.drbrownlabs.workers.dev/premium/
- Cuenta común: https://rutasec-web-dev.drbrownlabs.workers.dev/account/
- Standard: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/
- Miniapp por operadora: /miniapp/?operator=UUID, solo tras publicación explícita.

Misma plataforma Workers+D1+R2 e identidad. Cada operadora tiene tenant, personal, permisos, vehículos y configuración; nunca se despliega una copia por empresa. Manifest público/gestión con start_url del tenant; PWA instalable vía navegador. Sesiones son comunes a las PWAs del mismo origen. Instalar no otorga permisos.

## Alcance implementado
P1 flota compartida, kilometraje monotónico y mantenimiento que bloquea el calendario de Standard. P2 sucursales, invitaciones privadas de24h/un uso, asignación vehículo/conductor y revocación. P3 operaciones/analítica real D1 con período UTC, ocupación, calendario e historia, alertas DEMO. P4 costos internos/auditoría/anulación y comprobantes privados no fiscales; referencias de reservas simuladas, sin mover dinero. P5 marca, logo/portada R2, perfil público configurable, publicación segura y reservas directas sobre mismo inventario. P6 PWA aislada por scope, offline sin confirmaciones ficticias, reintentos estables, integridad SQL de asignaciones y regresión.

## Roles efectivos
| Rol | Alcance Premium |
|---|---|
| Propietario | Activación dev, flota/mantenimiento, equipo/invitaciones/sucursales/asignaciones, analítica, finanzas y marca |
| Admin | Flota/mantenimiento, lectura de equipo, analítica, finanzas y marca; sin invitar/revocar/asignar personal |
| Despachador | Consulta de flota y operaciones/analítica; sin modificar recursos ni finanzas/marca |
| Conductor | Consulta exclusivamente de vehículos asignados y kilometraje; sin equipo/finanzas/analítica/mantenimiento |

Standard mantiene sus operaciones por propietario (manifiestos/QR/control de viajes). No se atribuye al rol conductor un despacho o GPS que no existe. Pasajeros ven sus propias reservas; público solo perfiles publicados/catálogo/seguimiento de simulación.

## Cuenta y Google
A1 preparado con Code+PKCE/state/nonce, validación criptográfica, cookie7d revocable y CSRF. Vinculación explícita conserva acceso dev; no fusión por email ni roles del proveedor. Registro nuevo/reingreso/no fusión/claims inválidos probados con proveedor SIMULADO. Cookie de navegador probada con identidad dev sintética, sin simular que fuera Google real.
**Bloqueo externo confirmado:** Worker rutasec-api-dev carece de GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET. GET /standard-api/auth/config devuelve google=false y ambos nombres en missingGoogleConfiguration. Crear cliente OAuth web y configurar ambas variables del Worker, con callback exacto https://rutasec-web-dev.drbrownlabs.workers.dev/standard-api/auth/google/callback. Instrucciones y enlaces directos en [IDENTITY_AND_APPS.md](IDENTITY_AND_APPS.md). Los secretos Cloudflare Actions funcionan; no volver a pedirlos. Login real Google NO certificado; Apple no integrado. Accesos dev siguen disponibles.

## Verificación
Ver snapshots fechados P1–P6/A1; se registrará aquí el cierre final tras CI/regresión. Comandos en cloudflare-dev/package.json: npm test y suites test:frontend/standard/market/operations/regression/premium/team/business/finance/profiles/identity/premium-regression. Navegadores crean solo datos ficticios en dominio dev fijado, no en Pages/API demo. Algunos registros sintéticos y medios QA se conservan en D1/R2; reservas/costos/mantenimientos de pruebas finalizadas se cancelan/anulan/completan cuando el flujo lo permite, sin borrar historia.

## Límites comerciales
No es lanzamiento comercial. Operadoras autoaprobadas solo en dev, capacidades dev conservadas, Premium activable gratuitamente sin suscripción pagada. Pagos/reembolsos, avisos/SOS/GPS son simulados; costos manuales no prueban transferencias ni facturas SRI. No hay app de tiendas, instalación/cámara certificada en teléfonos físicos, nómina, GPS de conductores, liquidación bancaria ni respaldo duradero nuevo. Senior quedó pospuesto por el usuario. Medios R2 sin transformación/limpieza avanzada; consumo y factura no medidos. Sin upgrades ni cobros habilitados.

## Continuidad y rollback
main/Pages/API y ledger demo originales intactos; PR1 sigue borrador, sin merge. Conservar migraciones aditivas. Antes de retirar consola cerrar mantenimientos abiertos; conservar API capaz de liberar slots. Si se retira P2, revocar membresías/invitaciones; si se retira P5, despublicar perfiles; si se retira A1, retirar sesiones cookie nuevas. Volver Worker/assets a versión anterior sin borrar reservas/ledger. SW por versión/scope, APIs excluidas de caché. No ejecutar exportación/restauración nueva por automatismo: última restauración temporal autorizada fue del esquema0006, no verifica respaldo actual0012. Política de copia duradera/recuperación comercial pendiente de autorización y ejecución separadas.
