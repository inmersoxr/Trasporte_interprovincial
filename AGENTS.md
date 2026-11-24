# Prioridad vigente — funcionalidad completa accesible, interfaz nueva

La simplificación anterior NO autoriza ocultar módulos Standard/Premium. Mantener interfaz actual y navegación inferior; entrar en Operadores cambia al espacio de operadora con secciones Standard y Premium. Standard: viajes, creación, vehículos, reservas y empresa. Premium: en vivo, vehículos, empleados, gestión empresarial y empresa. Sin destino Avisos. Reubicar Vista de pasajero y Mi cuenta dentro de Empresa del menú inferior; no eliminarlos ni mantener accesos textuales arriba. El demo histórico es referencia de funciones y campos, no una pantalla que deba sustituir a la interfaz actual.

Las listas de vehículos y empleados se generan con registros propios persistentes. Un viaje puede vincular vehículo y persona responsable de la ficha laboral, sin hacer obligatoria una cuenta/invitación para esa persona. En vivo debe mostrar viajes activos de la empresa con persona, vehículo y GPS recibido, incluidos cuatro simultáneos; nunca posiciones de demo. El pasajero elige viaje/asiento, pago ficticio crédito/débito/transferencia, boleto completo/QR; operador escanea, embarca, inicia, transmite GPS y finaliza; compartir publicación y seguimiento por WhatsApp/menú nativo. Pagos siguen simulados; no pedir ni enviar datos bancarios reales. Preservar demo Pages, datos y plan maestro.

# Prioridad simplificada del propietario — 2026-11-24

La instrucción más reciente reemplaza los prerrequisitos de conductores/invitaciones para esta entrega. Circuito único: crear empresa → crear/publicar viaje con el formulario del demo (vehículo y plazas incluidos) → compra persistente desde otra sesión → QR → operador escanea/inicia/GPS/finaliza. Navegación inferior de app. No exigir alta de conductores, aceptar invitaciones, registrar previamente flota ni verificar contactos para publicar en el piloto. Mantener cuentas/permisos básicos existentes, pagos simulados y demo Pages intacto. Plan completo conservado para después; no borrar datos ni funciones históricas.

# Prioridad inmediata de presentación — 2026-11-24

Prioridad vigente: circuito de presentación mañana. Continuar tareas implementables sin esperar01.09; mantener pruebas físicas pendientes. Secuencia P0 preparar operadora/vehículo piloto -> P1 invitación vinculada a vehículo -> P2 publicar/agenda -> P3 reserva/QR/embarque/GPS entre sesiones -> P4 desplegar y comprobar. Plan171tareas preservado; no declarar fases amplias terminadas por este recorte.


# Protocolo vigente del agente — 2026-11-24

Al iniciar: leer AGENTS.md, PLAN.md, PROGRESS.md y TESTS.md; identificar siguiente tarea, comprobar repositorio y despliegue, continuar sin reiniciar. Conservar también PROJECT_MEMORY.md y snapshots. Estos cuatro archivos son la fuente de continuidad; las instrucciones históricas siguientes se mantienen para trazabilidad, pero prevalece este bloque y el plan vigente.

Ejecutar una tarea a la vez con objetivo, dependencias, auditoría/reutilización, diseño técnico/UX, implementación, pruebas e inspección visual real, corrección, evidencias, estado y commit identificable. No solicitar aprobación por decisiones reversibles ordinarias; reportar credenciales, acciones irreversibles o pruebas humanas bloqueadas. Estados: PENDIENTE/AUDITADA/EN DESARROLLO/EN PRUEBAS/BLOQUEADA/VALIDADA. No cerrar fase con tareas obligatorias sin validar. No declarar pruebas físicas realizadas por usar fixtures.

Arquitectura: misma aplicación/código/backend/base compartida, relaciones por identificadores, permisos en backend, aislamiento multiempresa, preservar datos. Pagos simulados. Todas las capacidades Premium para operadora piloto mediante configuración autorizada; segmentación comercial pospuesta. Android, OTA y GPS nativo en segundo plano pospuestos. No modificar demo GitHub Pages ni duplicar infraestructura.

H1 prioritario: registro por teléfono internacional o correo/contraseña sin verificación temporalmente en piloto, sesiones seguras, crear operadora y su administrador principal de organización. Una cuenta sin verificación NO prueba posesión de un contacto ni concede administración de la plataforma, ni permite apropiarse de cuentas existentes. Mantener Google/correo verificados y sus datos separados de esa condición del piloto. Esta instrucción sustituye el requisito histórico de verificar contacto antes de cualquier acceso durante el piloto.

UX transversal: identidad RutasEC; una acción principal por contexto; secundarias contextuales; grupos coherentes sin saturación de tarjetas/botones; campos progresivos e información recuperada automáticamente; navegación por rol, móvil para conductor y escritorio para administración; errores/carga/guardado/sincronización/desconexión claros; conservar campos ante fallos. Interacción y capturas reales en móvil/escritorio, no marcar interfaz terminada solo por funcionar su código.

# Instrucciones persistentes — RutasEC
## Correcciones Alpha autorizadas — 2026-11-18
El usuario autorizó expresamente comenzar todas las correcciones de la auditoría y mejorar lo existente. No volver a pedir autorización por cada corrección dentro de este alcance. Trabajar por hitos implementados/probados/documentados sobre Workers/D1/R2 existentes. Cuenta verificada obligatoria al reservar, Google primero, Apple después; recurrencia básica Standard. Preservar demo/Pages y datos, no ampliar Premium ni activar cobros reales. Credenciales/contrataciones externas pendientes se reportan sin frenar trabajo independiente. No declarar v0.1.0 Alpha funcional hasta verificar el circuito completo y sus límites reales.

## Acceso normal obligatorio (instrucción expresa 2026-11-18)
El usuario rechazó el acceso mediante IDs, UUIDs o claves de desarrollo. Usar correo/contraseña, verificación del correo, cambio y recuperación de contraseña en cuenta y panel administrativo. No volver a pedir identificadores internos ni secretos de desarrollo para iniciar sesión. El intento de habilitación por UUID quedó cancelado; no ejecutar bootstrap sobre ese UUID. Primera autoridad por correo previamente autorizado solo después de comprobar posesión del buzón; no asignar roles a correos sin verificar ni presentar envíos simulados como reales. Herramientas de prueba pueden mantenerse aisladas y explícitas, nunca como flujo normal.

## Orden vigente por instrucción expresa del usuario
Tras J1–J8 funcionales, el usuario indicó «Salta esa parte y comienza con la parte premium»: posponer la revisión Senior y comenzar Premium empresarial por hitos verificables. Esta instrucción reemplaza únicamente el orden previo que exigía revisión Senior antes de Premium; no elimina controles mínimos de autorización, aislamiento, integridad, pruebas ni preservación de Standard/demo. Pagos reales siguen fuera de alcance. Consultar docs/PREMIUM_ROADMAP.md. No afirmar que la revisión Senior se realizó ni que el entorno es comercial.

Antes de cualquier tarea leer `PROJECT_MEMORY.md` y el snapshot más reciente de `docs/snapshots/`. Consultar `README.md`, `LIVE-DEMO.md`, `BOOKINGS-DEMO.md` y código fuente relevante. Priorizar costo total, fiabilidad, no regresiones y migración gradual de demo a producción. No inventar pruebas ni despliegues. No asumir que GitHub actualiza Cloudflare. Mantener tres modalidades distintas (compartido por asiento; privado por ruta con precio fijo; privado personalizado por cotización). Split payment es opcional, no requisito. Tarifas de pasarelas son referenciales hasta cotización escrita. No exponer secretos ni datos personales. Documentar cada hito en snapshot fechado, preservar anteriores y actualizar `PROJECT_MEMORY.md` al tomar decisiones.


## Protocolo de ejecución — Junior primero, Senior después (2026-11-14)
La prioridad actual es hacer funcionar Standard con integraciones disponibles. No detener el desarrollo para una re-arquitectura total, ni desarrollar ahora Premium empresarial, pasarelas de pago reales o endurecimiento avanzado no bloqueante. Sí aplicar controles mínimos imprescindibles: autorización de operaciones, aislamiento básico de datos, validación de entradas, no exposición de secretos/datos personales, integridad e idempotencia de reservas y protección contra doble asignación. Nunca declarar listo para producción comercial un demo con estas limitaciones.

### Una fase a la vez
1. Antes de tocar código, comprobar el estado real del repositorio, último commit, despliegues y trabajo paralelo en Cloudflare. No duplicar ni sobrescribir el trabajo activo de otro agente. Registrar qué está confirmado y qué sigue pendiente.
2. Trabajar sobre UNA fase y UNA tarea verificable a la vez según `docs/ROADMAP.md`. Indicar objetivo, archivos afectados, dependencia, prueba y criterio de aceptación. No iniciar la siguiente fase sin cerrar y documentar la anterior; se permiten tareas de infraestructura paralelas solo si están aisladas.
3. Implementar el mínimo funcional integrado, sin rediseñar la UI aprobada, sin añadir frameworks/servicios por prestigio y sin refactorizaciones globales innecesarias.
4. Ejecutar pruebas locales pertinentes y, si se dispone de acceso, pruebas reales del entorno de desarrollo; incluir pruebas de errores, persistencia, dos sesiones y concurrencia cuando correspondan. No afirmar que una función está desplegada porque exista un commit o una migración SQL.
5. Al cerrar la tarea, reportar: implementado, verificado, no verificado, URL/entorno, pruebas y resultados, commit, regresiones, riesgos, costo/consumo si aplica, rollback y siguiente tarea. Guardar snapshot fechado y actualizar memoria si cambian decisiones.
6. Si falla una prueba o dependencia, corregir antes de avanzar. No marcar fase como completada con botones inertes, estados ficticios presentados como reales o datos que no persisten.

### Cloudflare en curso — prioridad inmediata
La última sesión de trabajo recuperada indicó que el acceso a Cloudflare expiró antes de confirmar creación de D1 o despliegue del backend nuevo. Este dato es histórico: verificar estado ACTUAL, no asumir que sigue pendiente ni que ya terminó. El trabajo de Work en Cloudflare puede seguir activo: primero revisar su resultado, commits, URLs y evidencias.
- Mantener `https://inmersoxr.github.io/Trasporte_interprovincial/` como demo público intacto, con Standard y Premium demostrativos, PWA, mapas, reservas, QR, simulación y seguimiento.
- Mantener separadas la API demo `https://rutasec-viajes-sync.cebx3001.chatgpt.site`, su ledger R2 y la nueva API/base D1 de desarrollo. No modificar, borrar, migrar o reutilizar datos del demo para pruebas destructivas.
- Verificar D1 dev, bindings, migraciones, Worker de desarrollo y endpoints mediante ejecución real antes de integrar frontend. El SQL existente no acredita despliegue.
- Preparar frontend Cloudflare Workers Static Assets en URL independiente y configuración por entorno; verificar rutas, manifest, service worker, CORS, enlaces, caché y paridad funcional. GitHub es la fuente del código, no el destino de ejecución del Worker. No redirigir GitHub Pages.
- Mantener pagos simulados y datos ficticios. Registrar prueba de rollback antes de adoptar la URL Cloudflare como entorno principal de desarrollo Standard.

### Orden funcional Junior
J1 verificar backend Cloudflare dev (Workers/D1/R2) y aislarlo del demo.
J2 integrar frontend Standard en entorno Cloudflare independiente y validar navegación/funciones existentes.
J3 operadoras, vehículos, rutas, salidas y catálogo persistentes; controles funcionales.
J4 compartido con asientos numerados, inventario consistente, reserva simulada, boleto/QR, cancelación.
J5 privado de tarifa fija: vehículo completo, fecha/hora propias, sin consumir plazas compartidas; impedir conflictos de disponibilidad.
J6 privado personalizado: solicitud, difusión a operadores elegibles, múltiples ofertas con precio/vehículo, visualización conforme llegan y selección libre con revalidación; nunca adjudicar automáticamente al primero.
J7 operaciones básicas: panel, manifiesto, abordaje, estados, historial, seguimiento y notificaciones de demostración claramente etiquetadas.
J8 regresión integral Standard, dos sesiones/dispositivos, persistencia, errores y documentación de lo que es demo versus funcional. Revisión Senior posterior sobre evidencia y código.

Premium empresarial, controles avanzados de planes, pagos reales, liquidaciones, y auditoría/refactorización Senior quedan después del Standard funcional; el demo Premium existente se conserva íntegro. La pasarela real se aborda únicamente en la fase final autorizada, según el roadmap. Si la infraestructura J1 no está lista, no fingir su disponibilidad ni conectar Standard a endpoints inexistentes.

### Elección de programación del piloto
El propietario decide datos, vehículos, conductores, horarios y publicaciones. No sembrar viajes ni crear siete salidas por defecto. Solo este viaje es inicial; recurrencia diaria/semanal/mensual optativa con fecha final y vista previa sin escrituras, publicación explícita. Administración ve toda su organización; conductor solo sus asignaciones. Mantener plan completo sin exigir cerrar fases empresariales para entregar circuito de presentación.
