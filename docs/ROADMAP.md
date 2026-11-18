# RutasEC — Plan de desarrollo comercial
Fecha: 2026-11-14
Estado: plan de trabajo; NO constituye verificación de fases completadas.

## Alcance Alpha vigente — 2026-11-18, posterior a la auditoría
**Estado actual G:** correcciones A–F desplegadas y verificadas en Workers/D1/R2 existentes por Actions44415780046,54 tests + tres navegadores PASS. Health0020, Standard abre por defecto, catálogo solo Alpha, Pages intacto. Continúa pendiente aceptación con Google/correo reales (faltan configuración OAuth/remitente/transporte) y teléfonos físicos; ver ALPHA_ACCEPTANCE.md y snapshot2026-11-18-zzzzzzzzzz-alpha-delivery.md. Los estados locales y bloqueos anteriores de abajo son históricos.

F cerrado localmente:54 tests y tres navegadores PASS; código de correo sobre A2 y criterios en ALPHA_ACCEPTANCE.md. Entrega G pendiente en CI existente; configuración real Google/correo y piloto con teléfonos siguen sin certificar.
E1/E2 cerrados localmente con pruebas específicas y navegador; cámara/embarque único, contacto, boleto privado y persistente, inventario vivo e historiales. Ver snapshots correspondientes. F continúa sobre correo existente; Google/correo reales y prueba física siguen pendientes.
Autorización ampliada posterior: el usuario permite comenzar todas las correcciones restantes de la auditoría, sin pedir confirmación por cada mejora sobre lo existente. C catálogo/búsqueda/aislamiento QA cerrado localmente (48 tests + Chromium PASS); D onboarding/revisión documental, E embarque/cámara/boleto y F verificación por código/regresión/entrega continúan secuencialmente. Las dependencias externas se reportan y no bloquean correcciones independientes. No hay autorización para pagos reales, compras ni alteración del demo.
Hito D también cerrado localmente:49 tests y tres suites navegador PASS; expediente y revisión manual en panel común, antes de publicación. Ver snapshot2026-11-18-zzzzzz-alpha-onboarding.md. No desplegado, sin aprobación normativa automática; E continúa.
Usuario autoriza cuenta verificada obligatoria para reservar, Google primero (Apple posterior) y programación recurrente como herramienta Standard básica. Esto reemplaza la compra de invitado propuesta en el onboarding anterior. Consultas/búsqueda públicas. Reutilizar identidad/D1/salidas/calendario actuales; no ampliar Premium ni alterar demo/Pages. No equivale a autorizar cobros reales ni a certificar el circuito Alpha completo.
Hitos secuenciales: A) acceso verificado y retorno al checkout, implementado/pruebas locales PASS, activación externa Google/correo pendiente; B) salidas recurrentes con vigencia, inventario por fecha y prevención de conflictos, implementado/pruebas locales PASS. Regresión final46 tests y tres suites Chromium locales PASS. Ambos sin desplegar ni migrar remotamente; faltan activación real y los demás cierres de auditoría para certificar v0.1.0 Alpha. Guía [STANDARD_RECURRING.md](STANDARD_RECURRING.md) y snapshots Alpha; no marcar entrega externa por pruebas simuladas.

## Cambio de orden autorizado por el usuario
Después del bloque Junior, el usuario pidió saltar por ahora la revisión Senior y comenzar Premium empresarial. Se ejecutará por hitos en [PREMIUM_ROADMAP.md](PREMIUM_ROADMAP.md), con mismo backend/tenant y sin alterar Standard/demo. La revisión Senior queda pospuesta, no realizada ni eliminada como revisión posterior. Pagos reales no autorizados.

## Ejecución Junior verificada (evidencia de 2026-11-16)
J1–J8 funcionales de desarrollo verificadas, sin dar por terminadas las fases comerciales de este documento. Evidencias y límites en [JUNIOR_HANDOFF.md](JUNIOR_HANDOFF.md) y snapshots por fase. CI funcional43908026442 SUCCESS; Standard en `https://rutasec-web-dev.drbrownlabs.workers.dev/standard/`, demo original intacto. Restauración del respaldo actual verificada después de autorización explícita para exportar a runner GitHub: run43911145328 SUCCESS, dump eliminado, sin publicación de datos. Almacenamiento duradero de respaldos sigue pendiente. Premium P1–P6 funcional de desarrollo verificado después: Actions44197152730,31 tests CI/12 suites navegador PASS; ver PREMIUM_HANDOFF.md. Cuenta Google preparada con activación bloqueada por GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ausentes; revisión Senior pospuesta, pagos reales fuera de alcance.

## Administración de plataforma autorizada (2026-11-18)
El usuario solicita una tercera interfaz propia e independiente por subdominio, sobre el mismo backend. G1: directorio global de operadoras, planes/vencimientos y registros manuales de cuotas/pagos/auditoría, con autoridad de plataforma separada de roles empresariales. Sin cobros reales ni asignación de administradores a identidades supuestas. G1 publicado/verificado en desarrollo: Actions44242242297,36 tests; CRUD global en navegador local y rechazo remoto por roles comprobados. Alta por UUID reemplazada por A2 a petición expresa; primera autoridad solo mediante correo preautorizado y verificado, sin cuentas QA. Main86d3750 documental conservado. Guía docs/PLATFORM_ADMIN.md y snapshot2026-11-18-z-platform-admin-g1-verified.md.

## Acceso A2 autorizado (2026-11-18)
El usuario cancela el alta por IDs y pide correo/contraseña, confirmación, cambio y recuperación. Reemplazar el onboarding técnico en ambas entradas sin alterar datos/demo. Primera autoridad solo tras verificar el correo autorizado; sin bootstrap del UUID anterior. A2 desplegado: Actions44352814016,39 tests PASS y navegadores local/remoto aprobados dentro de su alcance. Entrega real BLOQUEADA: email=false, remitente/transporte ausentes y Cloudflare sin dominios (zoneCount0). No se afirma correo enviado ni propietario activado.

## Principios
Preservar UI aprobada y demo, tres modalidades diferenciadas, bajo costo total, despliegue progresivo, snapshots por hito. Consultar PROJECT_MEMORY.md y AGENTS.md. Cloudflare Workers + D1 + R2; migración controlada del frontend a Cloudflare Workers Static Assets, conservando GitHub Pages como demo intacta; sin cobros reales hasta autorización y pruebas.

## Fases y criterios de aceptación

### 1. Backend de desarrollo (Work en ejecución; verificar resultado)
Worker separado, D1 dev con migraciones, R2 preservado, API operadoras/vehículos/rutas/reservas/asientos, pruebas de persistencia entre dispositivos, respaldo y rollback. Evidencias: URL dev, pruebas y commits. No confundir deploy GitHub con Cloudflare.

### 2. Identidad y permisos (3–5 días orientativos)
Registro/inicio sesión seguro, recuperación, roles pasajero/operadora/administrador/conductor, aislamiento por operadora, sesiones y auditoría. Pruebas de autorización negativas.

### 3. Motor de reservas (4–7 días)
Compartido: inventario y bloqueo temporal atómico, sin doble venta, expiración de holds; privado tarifa fija: vehículo completo, fecha/hora propia, sin usar asientos compartidos; personalizado: solicitud inmediata o programada; alertas a operadores elegibles disponibles; múltiples propuestas de precio y vehículo; comparación por perfil, reputación y precio; elección libre del pasajero (NO adjudicar al primero); confirmación de disponibilidad y reserva. Pruebas de concurrencia, cancelación y reintentos.

### 4. Preparación de pagos (sin pasarela ni cobros reales)
Definir contratos internos de pago, estados, ledger, conciliación y liquidación simulada. No integrar, contratar ni activar pasarelas de pago. La integración de Deuna, tarjetas y transferencias queda expresamente para la ÚLTIMA fase, después del piloto funcional sin cobros reales.

### 5. Operaciones de transporte (5–8 días)
Panel operadora, manifiesto de pasajeros, boleto QR verificable, abordaje, estados de viaje, cancelaciones, avisos, SOS real solo cuando exista integración adecuada; seguimiento GPS autorizado con consentimiento y retención definida. Mantener simulador y enlaces demo persistentes.

### 6. Standard y reputación (4–7 días orientativos)
Perfiles básicos de operadoras, reputación y calificaciones vinculadas a viajes verificables, moderación y prevención de abuso; verificar CTA privado y controles de Standard. NO desarrollar Premium en esta fase: su demo se conserva íntegro y el SaaS Premium se planificará por separado una vez completado Standard.

### 7. Piloto funcional sin pasarela (2–4 semanas orientativas)
Onboarding de pocas operadoras, rutas reales, reservas y boletos de prueba, seguimiento, operaciones, soporte, requisitos legales y protección de datos. Pagos estrictamente simulados; no cobrar dinero real ni presentar la prueba como venta comercial.

### 8. Pasarela de pagos — ÚLTIMA fase; después, lanzamiento comercial
Solo cuando el resto de la plataforma esté probado: cotizar y elegir proveedores por costo total; integrar Deuna y/o tarjetas/transferencias según contratos; webhooks seguros, idempotencia, conciliación, reembolsos y liquidaciones. Probar en sandbox y realizar piloto de cobros autorizado antes de habilitar producción comercial. Separar producción, staging y demo; monitoreo, backups, alertas y presupuesto. Workers Paid solo si lo exige la operación.

## Dependencias
Fase 1 precede a identidad/reservas; la pasarela de pagos se implementa únicamente al final, tras completar backend, identidades, reservas, operaciones Standard y piloto funcional sin cobros; Premium SaaS es etapa posterior independiente. Ninguna fase anterior debe activar pagos reales.

## Entregables por fase
Código y tests, evidencia de ejecución, URL de entorno, estado de despliegue, costo estimado/real, riesgos, plan de rollback, snapshot fechado en docs/snapshots y actualización de PROJECT_MEMORY.md.

## Próxima acción después de Work
Leer el snapshot que Work deje; contrastar endpoint desplegado y D1 contra repo, ejecutar pruebas de aceptación de Fase 1, corregir fallos antes de iniciar Fase 2. La pasarela queda para la última fase.

## Cambio de alcance 2026-11-14 — viajes personalizados
La modalidad personalizada funciona como mercado competitivo bajo demanda, parecido a la solicitud de Uber pero sin asignación automática: alerta a operadores disponibles, ofertas simultáneas, precio propuesto por cada operador y selección explícita por el cliente según perfiles, valoraciones y vehículos. El primer oferente NO tiene prioridad automática. Backend requiere solicitudes, ofertas, elegibilidad/disponibilidad, notificaciones, aceptación atómica y estados; no requiere pasarela de pagos hasta fase final.

## Decisión 2026-11-14 — visualización de ofertas en tiempo real
Las propuestas de operadores para viajes personalizados aparecen al pasajero **conforme llegan**, sin esperar ventana de cierre ni reunir un lote. Cada nueva oferta se incorpora inmediatamente a la lista y se puede comparar con las anteriores. El pasajero puede seleccionar cualquier oferta vigente; no existe prioridad automática para el primero. Actualizar mediante eventos en tiempo real o polling razonable con fallback, mostrando estados de conexión y disponibilidad. Revalidar oferta y disponibilidad al confirmar para evitar adjudicaciones duplicadas. Pagos continúan simulados hasta la última fase.

## Decisión 2026-11-14 — SaaS multioperadora y miniapps Premium
RutasEC es simultáneamente marketplace de transporte y SaaS de gestión para cada operadora. Toda operadora tiene perfil público propio tipo Facebook Page y consola privada de administración/operaciones: rutas, vehículos, conductores, reservas, pasajeros, salidas, seguimiento y resultados, con acceso seguro por miembros/roles. Standard: perfil limitado y herramientas operativas esenciales. Premium: perfil y miniapp personalizables (marca, portada, galerías, secciones, contenidos, promociones, enlaces directos), herramientas avanzadas de gestión y analítica; NO retirar las funciones básicas indispensables a Standard. Cada miniapp es una vista configurable sobre el MISMO backend multi-tenant, no una aplicación separada ni despliegue individual. Un enlace público específico por operadora permite reservar directamente y también participar en marketplace general. Separar datos por operator_id y aplicar autorización por tenant en backend, no solo frontend. Entitlements/planes verificables desde servidor, con configuración de diseño y módulos, sin bifurcar código. Plan de precios SaaS y límites precisos pendientes de definición; pagos reales solo en fase final.

### Requisito transversal de las fases 2, 5 y 6 — SaaS por operadora
Fase 2: tenant/roles y aislamiento de datos. Fase 5: panel de operaciones completo para Standard y Premium. Fase 6: perfil público tipo Page y miniapp Premium configurable con reservas directas, marca y módulos, sin crear un frontend independiente por operadora. Probar aislamiento entre empresas, configuración por plan, publicación pública y reservas desde enlaces directos. No confundir monetización SaaS con la pasarela de pagos: esta última sigue al final.

## Decisión 2026-11-14 — desarrollo secuencial Standard primero, Premium aparte
Prioridad de ejecución obligatoria: terminar y verificar Standard antes de iniciar desarrollo funcional de Premium. Standard cubre marketplace, registro/roles básicos, perfiles básicos de operadora, publicación de rutas y salidas, reservas compartidas con asientos, privado fijo, personalizado competitivo con ofertas conforme llegan, boletos QR, embarque y administración comercial básica. Pasarela de pagos sigue al FINAL de la ejecución prevista y no debe bloquear pruebas con pagos simulados.
Premium se construirá posteriormente como producto SaaS empresarial modular SEPARADO (centro de operaciones, flota, mantenimiento, personal, sucursales, finanzas/facturación, roles avanzados, miniapps/perfiles personalizables), compartiendo identidades y datos comunes sin duplicar backend. Las pantallas Premium actuales son DEMO y deben conservarse sin confundirlas con módulos funcionales ni bloquear Standard. No implementar módulos Premium en la fase Standard. Una vez completado Standard, planificar y ejecutar Premium como segunda etapa con su propio roadmap y criterios de aceptación. Esta decisión reemplaza cualquier orden anterior que mezclaba funciones Premium con el desarrollo inicial de Standard.

## Regla innegociable 2026-11-14 — preservar demo funcional
NO cambiar, retirar, desactivar, romper ni reemplazar el demo público actual al desarrollar Standard ni al posponer Premium. Mantener operativos todos los flujos existentes, incluyendo simulaciones, mapas, paneles Premium demostrativos, navegación, selección de planes, datos ficticios, reservas y seguimiento de prueba. Desarrollar Standard real de forma compatible/aislada, con feature flags o rutas separadas cuando corresponda, sin sustituir demo por implementaciones incompletas. Antes de desplegar verificar regresión de todos los flujos demo y contar con rollback. Premium se desarrolla posteriormente como SaaS separado; su demo actual permanece disponible y funcional durante todas las fases. Esta regla prevalece sobre cualquier indicación previa que pudiera implicar retirar o alterar el demo.

## Fase transversal de infraestructura — frontend en Cloudflare (decisión 2026-11-14)
**Objetivo:** publicar una versión independiente del frontend/PWA de RutasEC en **Cloudflare Workers Static Assets** y conectar progresivamente sus APIs Workers/D1/R2, manteniendo **GitHub como fuente de código** y el **GitHub Pages actual como demo público funcional, sin cambios**. No confundir preparar o registrar esta tarea con desplegarla.

**Momento:** ejecutar tras verificar el backend de desarrollo de Fase 1, antes de considerar completado el piloto Standard. Puede realizarse en paralelo con el desarrollo Standard, pero nunca desplazar las prioridades ni tocar el demo.

**Implementación planificada:**
1. Auditar rutas absolutas/relativas, PWA/service worker, manifest, enlaces de seguimiento, endpoints, CORS, assets y configuración de caché de la versión actual; levantar línea base y pruebas de regresión.
2. Preparar configuración Wrangler y directorio de publicación para Workers Static Assets, sin modificar ni reemplazar la configuración GitHub Pages; elegir nombre Worker/URL de staging independientes.
3. Conectar el repositorio GitHub al build de Cloudflare o CI equivalente, con despliegues versionados, entorno staging y rollback. Evitar despliegue automático sobre el demo.
4. Mantener backend demo y backend D1 de desarrollo separados; enrutar frontend Cloudflare a APIs correctas mediante configuración por entorno/feature flags. No mezclar datos reales y ficticios, ni activar pagos reales.
5. Validar equivalencia funcional del demo en el nuevo dominio: Standard, Premium interactivo, mapas, simulador, reservas, selección de asientos, QR, enlaces persistentes de seguimiento, navegación móvil y PWA. Verificar persistencia, permisos y concurrencia de Standard según su fase.
6. Solo tras pruebas satisfactorias, adoptar la URL Cloudflare como entorno principal de desarrollo/piloto Standard. Conservar la URL GitHub Pages operativa como demo público y fallback; no redirigir ni apagarla. Registrar URLs, resultados de pruebas, consumo/costos y procedimiento de rollback en snapshot.

**Criterios de aceptación:** URL Cloudflare accesible y verificable, build reproducible desde GitHub, paridad funcional demo confirmada, frontend Standard conectado al backend de su entorno, GitHub Pages intacto, rollback probado y costos dentro de cuota objetivo. No afirmar despliegue realizado hasta comprobarlo. Documentación oficial: https://developers.cloudflare.com/workers/static-assets/ y https://developers.cloudflare.com/workers/ci-cd/builds/.


## Orden operativo vigente — Junior → revisión Senior (2026-11-14)
Este orden prevalece sobre estimaciones de calendario y propuestas anteriores que mezclaban Standard/Premium o adelantaban pagos. No significa que las fases estén terminadas. Consultar protocolo obligatorio en `AGENTS.md`.

**Bloque Junior (una fase a la vez):**
- J1. Confirmar el estado actual del trabajo Cloudflare Work: D1 dev creada o no, migraciones ejecutadas o no, Worker desplegado o no, bindings, URL, commits, pruebas, bloqueo de autenticación y rollback. La última sesión recuperada terminó con acceso Cloudflare expirado y sin despliegue confirmado; verificar de nuevo. No duplicar trabajo paralelo.
- J2. Publicar frontend de desarrollo en Cloudflare Workers Static Assets, independiente de GitHub Pages, con configuración API por entorno y paridad de demo verificada; mantener demo/R2 intactos. Si J1 no está verificada, no marcar J2 completada.
- J3. Conectar Standard: operadoras, vehículos, rutas, salidas, catálogo, persistencia y controles funcionales.
- J4. Reservas compartidas, asientos, boletos QR, cancelaciones y pagos exclusivamente simulados; verificar concurrencia e idempotencia.
- J5. Privados fijos con fecha/hora elegidas y disponibilidad exclusiva de vehículo, sin ocupar asientos compartidos.
- J6. Privados personalizados: varias ofertas simultáneas visibles conforme llegan, comparación y elección libre, revalidación al aceptar, sin prioridad al primero.
- J7. Operaciones básicas: manifiestos, abordaje, estados, seguimiento, historial, alertas/notificaciones simuladas identificadas como tales.
- J8. Pruebas de extremo a extremo, dos sesiones, dispositivos móviles, persistencia, regresión Standard/Premium demo, documentación y handoff.

**Bloque Senior (solo después de J8):** auditoría integral de arquitectura, seguridad, privacidad, calidad, rendimiento, deuda técnica y escalabilidad; revisión crítica de decisiones y refactorización justificada. Posteriormente planificar Premium empresarial por separado. Integración de pasarela y cobros reales únicamente en última fase autorizada y tras piloto, sin bloquear el Standard funcional.

**Cierre obligatorio por fase:** pruebas ejecutadas y resultados, código/commit, URL real y entorno, limitaciones, rollback, snapshot, estado `pendiente / en curso / verificado`. Un commit no es un deploy; una pantalla no es un flujo funcional. Mantener controles mínimos de integridad, autorización y protección de datos durante Junior; posponer solo el endurecimiento avanzado, nunca fallos críticos.
