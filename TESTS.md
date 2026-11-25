# Registro de pruebas de RutasEC

Cada entrada incluye ID/tarea, entorno, método, resultado, evidencia, límites y commit. No confundir pruebas de CI/locales con vehículos, conductores o teléfonos físicos.

## Evidencia previa reutilizable
- Premium/identidad: Actions45309144150 SUCCESS,69 pruebas y seis recorridos Chromium; Workers/D1/R2schema0028. Ver snapshot2026-11-24-zz-enterprise-delivery.md.
- Acceso/ojito: Actions45319595023 SUCCESS,69 pruebas y seis recorridos, más navegador remoto360/390/1280. Snapshot2026-11-24-zzz-account-password-mail.md.
- Google preparado ded3bb70: Actions45322538944 verify/deploy SUCCESS. Pruebas locales de JWT/PKCE/callbacks/provisión y Alpha con desafío de correo pendiente; falta consentimiento real/credenciales.
- No declarar validados: cuatro vehículos reales, cuatro conductores, GPS físico simultáneo, piloto entre teléfonos, envío real de correo o Google real.

## Registro inicial de la tarea de Branding (histórico)
G-BRANDING: build local PASS; falta HTTP200 anónimo, navegación/legibilidad/capturas móvil y escritorio después de publicación.

## Política
Una compilación/captura por sí sola no valida funcionalidad. Registrar fallos y correcciones, concurrencia/aislamiento cuando corresponde, y dejar pendientes las pruebas físicas no ejecutadas. No sembrar datos falsos en catálogo público.

- 00.01: auditoría de lectura/contratos y evidencias existentes. Worker web/admin con proxy al mismo rutasec-api-dev; D1 rutasec-dev y R2 existentes; builds separados de Pages. No implica pruebas físicas nuevas.

- 00.02: auditoría de lectura/contratos y evidencias existentes. Matriz docs/ENTERPRISE_PILOT.md, docs/PREMIUM_AUDIT_IDENTITY.md y módulos standard/premium; diferencias nuevas registradas. No implica pruebas físicas nuevas.

- 00.03: auditoría de lectura/contratos y evidencias existentes. schema0028 remoto D1/R2true; 71 pruebas CI y seis navegadores; migraciones0001–0028 publicadas salvo0025 pospuesta. No implica pruebas físicas nuevas.

- 00.04: auditoría de lectura/contratos y evidencias existentes. Google y correo reales bloqueados; acceso piloto sin código pendiente; pruebas físicas no validadas; código funcional separado de aceptación real. No implica pruebas físicas nuevas.

- 00.05: Actions45330995683 SUCCESS; URLs about/privacy/terms HTTP200 anónimas; Chromium remoto390/1280 PASS; health schema0028/D1/R2true. No implica restauración nueva ni validación de teléfonos físicos.

- 00.06: Fuente ded3bb70; versiones Workers conocidas y D1 Time Travel metadata verificada en Actions45322538944; punto UTC2026-11-24T05:07:11Z; sin exportar/restaurar datos. No implica restauración nueva ni validación de teléfonos físicos.

## H1 en pruebas — 2026-11-24
- pilot-access.test.mjs: ruta real Worker, scrypt, cookie, registros teléfono/correo sin código, dueño de organización, Premium gratuito, idempotencia, contactos duplicados concurrentes, no privilegio global aun con correo preautorizado, sesión independiente, cambio de clave y revocación.
- pilot-local.e2e.mjs: registro móvil prioritario teléfono, creación de operadora, portal Premium real, segunda sesión sin cookies previas, recarga, cambio y logout; alternativa correo;360/390/1280 sin desbordamiento. PASS11.51s, capturas inspeccionadas.
- Fallos corregidos: alta de Premium duplicaba premium_tenants porque ya existe trigger0023: se reutiliza trigger. Primera entrada de operadora abría resumen sin exponer creación: ahora sin empresas abre Empresa automáticamente. Prueba de ruta503 se mantuvo y pasó tras corregir el backend; no se sustituyó por una ruta alternativa.
- Sin teléfonos/conductores/vehículos físicos;01.09 conserva validación humana pendiente.

## Cierre de entrega H1
Actions45333404724 SUCCESS:72/72 y siete flujos Chromium. H1 automatizado prueba dos contextos sin cookies compartidas, no dos teléfonos físicos. Remoto: health0029/flags de piloto true; UI360/390/1280 y contactos visibles, validación de contraseña conserva datos sin crear cuenta; login negativo401. Capturas inspeccionadas. Activos fuente coinciden; main/Pages intactos. Sin exportaciones de D1 ni alta de datos ficticios públicos.01.09 sigue bloqueada por prueba humana física; no certificar piloto integral.

- 01.01 VALIDADA: 3186c93c/Actions45333404724 SUCCESS;72tests y7navegadores. Registro sin correo/SMS en Worker real de prueba; frontend público muestra Crear cuenta y entrar sin código.

- 01.02 VALIDADA: Selector inicial Teléfono, prefijo editable+593, formato E164 normalizado en backend y rechazo de número sin código; Chromium360/390/1280 y captura remota inspeccionados.

- 01.03 VALIDADA: PILOT_REGISTRATION_ENABLED true en despliegue. Sin envío/código; contacto permanece no verificado. No concede admin global aun declarando correo preautorizado; rechazo fuera del host app y al apagar flag.

- 01.04 VALIDADA: scrypt reutilizado, cookies Secure/HttpOnly, sesiones hash7d, origen, rate limiting y revocación. Probe negativo en Cloudflare devuelve401 ejecutando comparación; sin cuenta creada ni secretos expuestos.

- 01.05 VALIDADA: Worker y Chromium: login en segundo contexto, recarga, cambio de contraseña revoca sesión anterior, logout revoca cookie; vía teléfono y correo preservada.

- 01.06 VALIDADA: Sin empresa, Operadores abre Empresa automáticamente; crear nombre persiste misma entidad vista desde segunda sesión. Reintento idempotente; ninguna empresa ficticia creada en remoto.

- 01.07 VALIDADA: Membresía owner al crear empresa; UI Administrador principal; API de otra empresa403, platformRole null y cero admin global por declaración de contacto sin verificar.

- 01.08 VALIDADA: PILOT_PREMIUM_ENABLED true; trial fee0 sin vencimiento configurado al crear organización propia, trigger0023 reutilizado. Premium/gestión habilitados en Worker y navegador; planes previos sin cambios; pagos reales desactivados.

- 01.09 BLOQUEADA: Dos contextos independientes y recarga PASS en CI; falta que participante entre con la misma cuenta desde dos teléfonos/conexiones reales y confirme la misma empresa. No sustituir esta evidencia con fixtures.

- 01.10 VALIDADA: 3186c93c/Actions45333404724 SUCCESS. schema0029 piloto/D1/R2true, flags true; activos coinciden, UI pública anónima móvil/escritorio PASS. Main/Pages intactos. Despliegue permite prueba física01.09, no cierra aún Fase01.

## Evidencias visuales persistentes
Capturas reales de integración, no teléfonos físicos: [móvil](docs/evidence/2026-11-24/h1-signup-mobile.png), [escritorio](docs/evidence/2026-11-24/h1-signup-desktop.png). Metodología y alcance en [README de evidencias](docs/evidence/2026-11-24/README.md). Estado actual por tarea en PROGRESS.md;01.09 BLOQUEADA hasta prueba humana.

## Circuito de presentación en pruebas
- Integración backend completa PASS: 7salidas reales en D1 local desde empresa nueva, sin fixtures de documentos. Reserva concurrente200/409, QR concurrente200/409, aislamiento entre2conductores, invitación usada/expirada/revocada y revocación de acceso, GPS/enlace público/fin. Última prueba6.17s.
- Regresión equipo/permisos4/4 PASS25.03s.
- Chromium: nueva empresa, vehículo, invitación→registro del conductor→aceptación, Hoy/Mi semana, publicación7salidas, compra con QR, decodificación jsQR desde vídeo, GPS emulado automático, pasajero y receptor sin cuenta y finalización. PASS27.72s. Capturas reales inspeccionadas.
- Fallos corregidos: pie fijo heredado tapaba Guardar vehículo; se hizo estático en /pilot/. Un módulo de recurrencia consultaba recursos administrativos al abrir el mapa del conductor y mostraba un error de permiso; ahora respeta rol. Finalizar con enlaces GPS activos devolvía409 por conteo de cambios del trigger; se utiliza UPDATE RETURNING sin debilitar el control de revisión.
- GPS/cámara emulados solo en pruebas, nunca coordenadas ficticias en aplicación o catálogo remoto. Reales/teléfonos físicos pendientes sin detener entrega por nueva instrucción.

## Circuito de presentación P0–P4 — 2026-11-24

Prioridad del propietario: publicar datos ingresados por él; cero empresas, vehículos, viajes o GPS precargados. Portal /pilot/ reutiliza cuentas, organización, flota/asignaciones/invitaciones, D1, reservas/QR, operaciones y GPS existentes. Menú administración Operación / Vehículos y equipo; conductor Hoy / Mi semana. Perfil/identidad enlaza al editor existente. Administración ve todos sus viajes con vehículo/conductor y mapa de unidades en curso, limitado a su empresa. Conductor no recibe equipo/invitaciones/finanzas ni viajes ajenos.

Por defecto Solo este viaje. Frecuencias optativas diaria/semanal/mensual con fecha final y vista previa explícita sin escrituras; publicar requiere confirmación. Cada instancia tiene inventario independiente. No se activó renovación automática. Migración0030 aditiva, conserva datos y documentación; elegibilidad de formación explícita sin falsificar revisión legal. No se incluyó S1/0025, Android ni pagos reales.

Pruebas dirigidas: siete casos de piloto/recurrencia PASS y Chromium con invitación/registro, vista previa, compra, lectura jsQR desde vídeo local, permisos de conductor, GPS emulado, observador anónimo y fin de enlace PASS. Se corrigieron errores administrativos mostrados al conductor y meta.changes de finalización afectado por trigger. Capturas1280/390 inspeccionadas. Mapa del navegador local usa tiles externos bloqueados; no demuestra cartografía/red/GPS físicos. Regresión y despliegue en verificación; actualizar con Actions/commits antes de cierre. Cámara, contactos, cuatro vehículos y teléfonos físicos siguen pendientes, sin bloquear entrega técnica.

### Congelación295bd0b2

Regresión aislada del árbol seleccionado para publicar (excluye S1/0025):74/74 PASS,249.39s; afectados9/9 PASS37.45s; navegador presentación1/1 PASS28.61s. Prueba adicional viaje único por defecto/reintento PASS7.91s sobre el mismo código aislado. Evidencias en docs/evidence/2026-11-24/presentation/: unit-74.txt, affected-9.txt, browser-circuit.txt, single-trip-local.txt y capturas de administrador1280, conductor semana390 y mapa390. Los tiles externos se bloquearon en el navegador local; petición anónima independiente a tile.openstreetmap.org HTTP200, sin sustituir una prueba del mapa durante conducción.

## Entrega publicada del circuito — 2026-11-24T06:37Z

Fuente295bd0b26cbe8f3782ca4a1f2e2a16da8e3df87f. Actions45340992233 verify/deploy SUCCESS:74pruebas y8recorridos navegador. Migración0030 aplicada en D1 existente; health pilot-circuit-v1, D1/R2true, pagosdisabled. Versiones API2ceaf44e-6f94-4e5c-b185-3b874f4b5f47, web29ecaf5c-9a04-4023-a20e-1ab6ef583d96 y admina9fbc7f1-6163-4f63-8d9a-de6110b2c600. Recuperación nativa D1 comprobada mediante metadata, sin exportación/restauración ni borrado.

URL de operación: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Navegador público390/1280 PASS: acceso piloto redirige a cuenta, registro sin código visible, sin desbordamiento ni erroresJS. Assets pilot/join/GPS/permisos coinciden byte a byte con fuente; dashboard anónimo401. Google y correo reales siguenfalse; teléfono/correo+contraseña del piloto no dependen de esos proveedores. No es login mediante WhatsApp.

Main permanece0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y Pages HTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se sembraron datos/GPS/cuentas en público. Pruebas reales con cuatro vehículos/conductores/cámaras y teléfonos independientes siguen EN PRUEBAS; fixtureGPS/cámara de CI no las valida. Mantener aplicación visible para GPS web. El plan171tareas continúa: no se declaran completadas todas las fases ni seguridad comercial. Evidencias y capturas: docs/evidence/2026-11-24/presentation/.

## S0 — Circuito simple solicitado después de la entrega anterior

Nuevas pruebas: vehículo sin placa/conductor → publicación200; guardias de empresas fuera del piloto siguen exigiendo documentación. Cambios de UI prueban el formulario del demo sin invitar ni registrar conductores, compra desde otra sesión, lector jsQR con vídeo de fixture, GPS emulado del operador y cierre de enlaces. Mantener pruebas físicas pendientes. Primer fallo de navegador fue navegación de la sesión observadora antes de finalizar login; corregido esperando sesión antes de abrir el panel.

S0 local:5/5 pruebas dirigidas PASS18.19s; recorrido simplificado de interfaz PASS23.66s, con cero membresías de conductor y cero invitaciones. Publicación incluye vehículo sin placa/asignación, compra desde otro contexto, QR leído desde píxeles de vídeo, GPS emulado del operador, consulta del pasajero/receptor anónimo y fin del enlace. Captura del formulario móvil inspeccionada: mismos campos/clases del demo y menú inferior; empresa única no muestra selector innecesario. Código45ed4b3d1ffa768de1eca995cb58cd7216560e10; despliegue en curso.

## S0 publicado y comprobado — 2026-11-24T10:15Z

Fuente45ed4b3d1ffa768de1eca995cb58cd7216560e10, Actions45372210818 verify/deploy SUCCESS.74 pruebas y8recorridos navegador PASS, incluido empresa→formulario del demo→vehículo/capacidad sin conductor/invitación/placa→publicación→compra independiente→QR→escaneo del operador→inicio/GPS→seguimiento público→finalización. Prueba local específica PASS23.66s; no se crearon datos de prueba en público.

/pilot/ confirmado públicamente con schema0031_simple_pilot, revision simple-pilot-v1, D1/R2true, pagosdisabled. Activos app/CSS/template/GPS coinciden byte a byte con el árbol probado. Chromium anónimo390/1280 confirma entrada/registro sin errores ni desbordamiento; dashboard401 sin sesión. Los fallos iniciales de acceso desde runner se debieron al proxy/CA del entorno; se configuró el proxy en el navegador de verificación, sin modificar TLS de la aplicación.

API3f8456a1-ac3a-45f6-84d9-209e9fe2bffb; web682d6e21-63d1-4bc6-ab90-0ff5f3370604; admina910e256-68d9-4787-9976-4ace29837ea3. Migración0031 aplicada sin borrar datos; D1 Time Travel metadata comprobada sin exportar/restaurar. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se desplegó el trabajo descartado de invitaciones.

S0-UI/API/despliegue VALIDADA en entorno de desarrollo; S0-FISICO PENDIENTE con teléfonos/cámara/GPS reales. Geolocalización/vídeo emulados no acreditan sensores físicos ni conducción. La aplicación transmite ubicaciones del dispositivo y no inventa posiciones; mantener el navegador visible. Cuenta normal existente conserva permisos; no se requiere crear conductores ni nuevos roles. Pagos simulados, sin cobros.

URL: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Menú inferior Mis viajes / Crear viaje / Mi empresa. Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Guía: docs/PRESENTATION_PILOT.md. Evidencias: docs/evidence/2026-11-24/simple/. Plan completo sigue vigente, fuera de este circuito no se dan por cerradas las fases.

## R1 — Módulos, responsables y cuatro ubicaciones

Prueba trip-staff: cuatro empleados/unidades/salidas, snapshot, reintento, responsable ajeno403, conflicto horario409 y rollback sin salida parcial; cuatro GPS y permisos, pasajero legítimo puede ver su viaje sin datos laborales privados. Métodos crédito/débito/transferencia persistidos como metadata; rechaza método inválido; no se almacenan campos bancarios ficticios.

Navegador operator-workspace: listas creadas por UI, Standard/Premium, publicación vinculada, enlace de salida anónimo, cuatro sesiones con geolocalización emulada, selección de cuatro unidades, WhatsApp/nativo con activación de usuario, panel conservado tras8.5s de polling, cierre deja tres unidades y expira enlace. PASS62.71s en iteración anterior; validando reubicación de accesos arriba→Empresa y eliminación de tarjetas duplicadas del mapa. Checkout de pasajero extendido: tres formularios ficticios del demo y boleto con Transferencia bancaria, compra/QR/cámara/embarque/inicio/fin PASS23.63s.

Fallos corregidos: iconos CSS contaminaban nombre accesible del botón Vehículos; se usan spans aria-hidden. Navegación de prueba esperaba GPS antes de cargar el documento; espera ahora URL/DOM. Consulta de reembolso contaba nuevo evento metadata como segundo reembolso; se verifica exactamente un evento simulated_refund. El pasajero comprador tiene acceso legítimo al GPS de su viaje; prueba de aislamiento utiliza un viaje ajeno no comprado. No se relajaron permisos para pasar pruebas.

R1 navegación: prueba de cuenta descubrió que el organizador legado volvía a mover Mi cuenta al área superior tras consultar sesión. Corregido en navigation.mjs para conservarlo en Mis viajes/Cuenta. Notificaciones conserva sus endpoints y eventos, pero la entrada Avisos se reubica y renombra Notificaciones de mis viajes, sin acceso principal arriba. Los iconos y chevrones decorativos usan aria-hidden; no forman parte del nombre accesible.

## R1 publicado — 2026-11-24T12:33Z

Fuentea72479aab0c35ea657bae9d27ea359c9d26fa9e0; Actions45393517383 verify/deploy SUCCESS,75 pruebas y9recorridos navegador. Incluye creación de cuatro vehículos y cuatro fichas laborales desde UI, vínculo persona/unidad/salida persistente y aislado, cuatro sesiones GPS emuladas independientes, próxima salida sin punto falso, selección/mapa global, boleto/QR/embarque, tres métodos de pago ficticios, WhatsApp/nativo con activación de usuario y enlace que sobrevive al polling. Cerrar uno de cuatro viajes deja3 y revoca su seguimiento público.

Interfaz publicada: Standard/Premium con menú inferior adaptado. Standard: Viajes, Crear viaje, Vehículos, Reservas, Empresa. Premium: En vivo, Vehículos, Empleados, Gestión, Empresa. Vista de pasajero y Mi cuenta se reubicaron en Empresa; en pasajero cuenta/notificaciones están dentro de Mis viajes y en consola Standard de gestión, Más→Cuenta. Se eliminó el destino principal Avisos, no el servicio de notificaciones. Se conserva la interfaz actual y se reutilizan los campos de pago ficticios y las funciones del demo, sin sus listas/personas/ubicaciones de muestra.

Migración0032 aditiva: standard_departure_staff liga empleado y salida, guarda nombre al asignar, valida empresa/persona activa y rechaza solapamientos en SQL. Alta de salida, bloqueo horario del vehículo y vínculo se confirma atómicamente en el comando existente; persona no necesita una cuenta y no obtiene permisos por figurar en el viaje. Los campos bancarios ficticios nunca entran en el payload; solo enum de método queda en payment_events. La prueba de reembolso verifica un único evento simulated_refund, separado de metadata.

Health remoto operator-workspace-v1/schema0032_trip_responsible, D1/R2true, paymentsdisabled. WorkerAPIa8e6f008-bbc6-4a50-8a2a-419d5911a0af, web6980630f-2345-4263-ba5e-80d335d57e1c, admin50b1c75e-d0a9-4360-9d56-ccf8f4cc4dc7. Activos index/app/CSS/share/payment/notifications/navigation/GPS coinciden con fuente final. Chromium anónimo390/1280 PASS, dashboard401 sin sesión; ninguna cuenta o viaje ficticio creado en público. Recuperación D1 nativa verificada por metadata, sin exportar/restaurar ni borrar datos. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos.

R1-UI/DATOS/COMPRA/GPS-software/DEPLOY VALIDADA en desarrollo. R1-FISICO PENDIENTE: cámara/GPS real, cuatro vehículos y teléfonos participantes. No se certifican conducción, producción ni contabilidad fiscal. SRI real permanece bloqueado por certificado/configuración/adaptador externo; sus datos/comprobantes de prueba sí funcionan. Pagos bancarios reales continúan desactivados. S1/0025 pospuesta.

Guía e inventario: docs/OPERATOR_WORKSPACE.md. Evidencias: docs/evidence/2026-11-24/workspace/. URL https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ ; pasajero https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Mantener plan171tareas, sin reiniciar ni marcar todas las fases como terminadas por esta entrega.

## R2 — publicación desde Premium

El recorrido operator-workspace se amplía: la cuarta de cuatro salidas se publica desde Premium, se comprueba permanencia de modalidad, aparición en próximas salidas y posterior inicio/GPS. Se comprueba ancho360/390 del menú de seis acciones. Despliegue pendiente de cerrar tras Actions y activos públicos.

## R3 — fichas de vehículos/conductores y boleto inmediato (2026-11-24)

EN PRUEBAS de entrega. Vehículos/Conductores en pestañas bajo Vehículos, alta y edición en diálogo, placa/marca/modelo/tipo/plazas y datos adicionales; cédula/licencia/teléfono/foto y vínculo laboral opcional. Reutiliza standard_drivers/documentos R2; configuración habitual en vehículo y snapshot driver por salida. Datos y fotografías privados, sin crear cuentas ni permisos. Crear viaje en ambas modalidades; recuperar conductor habitual y permitir cambio por salida. Migración0033 aditiva, sin borrado ni0025. Conflictos de conductor simultáneo en SQL, revisión optimista, aislamiento de empresa.

Compra: bloqueo de doble envío, abrir boleto específico usando respuesta confirmada del POST y URL recuperable, sin depender de GET del historial; aplicar a compartido y privado. No emitir boletos ficticios ni confirmar localmente sin backend. Pagos de crédito/débito/transferencia siguen simulados.

Evidencia local ya ejecutada: driver-resources API PASS; navegador cuatro vehículos/conductores/fotos/asignaciones/publicaciones/GPS PASS73s; presentación con lectura de historial503 forzada PASS29s. Ampliación tres compras por método confirmó boletos y avanzó al embarque; detectó inestabilidad del enlace de seguimiento, ajustado selector al primer enlace. Suite previa73/75: se corrigió alias SQL en perfil y fixture de identidades repetidas. No iniciar otra auditoría general por instrucción del usuario; workflow de publicación conserva checks existentes. Pruebas físicas de cámara/GPS y cuatro vehículos siguen pendientes. Completar evidencia Actions y remoto antes de declarar desplegado.

R3 entrega: Actions45400666550 SUCCESS,76pruebas+9recorridos. Compra con crédito/débito/transferencia, boleto inmediato aun si GET historial falla, QR/embarque/GPS entre sesiones. Cuatro fichas de conductor/fotos/vehículos/asignaciones y conflictos/revisiones/aislamiento PASS. Publicación HTTP/sourcehealth y Pages comprobados sin insertar datos públicos. GROUND-1 inspección de esquema/contratos VALIDADA; fases2–8 pendientes.

## GROUND — implementación y validación por fases (2026-11-24)

| Fase | Estado software | Evidencia |
|---|---|---|
| 1 | VALIDADA | Inventario docs/GROUND_TRANSPORT.md; commit2a68a941f5af267d657eba410016d376c0120d6d |
| 2 | VALIDADA | Alta7tipos, autorización/tipoempresa independientes, máximo configurado100; API y selector UI |
| 3 | VALIDADA | Uno/dos pisos, filas/columnas/pasillos/ventana, bloqueos, snapshotinmutable de salida; compra asiento70 |
| 4 | VALIDADA | Terminales/paradas/tarifa acumulada/autorización/frecuencia; UI publica y busca tramo Azogues–Guayaquil; SQL disjuntos/concurrencia; recurrencia recupera conductor |
| 5 | VALIDADA | Filtros vehículo/transporte/modalidad, disponibilidad por tramo, mapa asientos/QR y persistencia tras recarga |
| 6 | VALIDADA | Ventanilla comparte command/inventario; carrera web/oficina200+409; UI emite QR/imprime sin perder el boleto |
| 7 | VALIDADA | Integración automatizada4/12/20/50/70, conductor/vehículo/salida, QR doble uso409, cinco GPS/Premium y dos salidas recurrentes |
| 8 | EN PRUEBAS | Regresión, evidencias y despliegue efectivo pendientes de cierre; no confundir con build |

Validación anterior es software en D1/R2/Chromium aislados, con GPS/cámara emulados. Validación física con cooperativas/conductores/vehículos y sensores reales permanece PENDIENTE. No hay pagos reales ni certificación comercial.

Migraciones0034–0037 compatibles: clasificación canónica sin reconstruir vehicles ni cambiar IDs; configuraciónmáximo; layouts por vehículo/salida; paradas y snapshots; rangos de inventario y exclusión SQL de solapamientos reemplazan el índice único antiguo sin borrar claims; conductor habitual/override por salida también en recurrentes. Reservas antiguas representan trayecto completo0–1000 y conservan IDs, QR, estado y pagos. Compra100plazas se agrupa con json_each en dos INSERT, evitando200consultas por solicitud.

Atlas WebP generado específicamente para categorías de selección, siete referencias genéricas, no fotografías reales de las unidades. Solo assets de Cloudflare; Pages intacto. Campos bancarios siguen ficticios. Se reutilizan entidades, GPS, Premium, roles, cuentas, R2 y venta directa. No desarrollar Premium Inteligente ni Android.

Errores encontrados/corregidos: prueba antigua esperaba rechazo99pasajeros, actualizada a101; ventanilla no seleccionaba automáticamente la única salida y el bloqueo busy impedía abrir el boleto confirmado, corregidos. Pruebas de interfaz en390/1280, selector, publicación con parada, compra asiento70 y ventanilla PASS16s. Evidencias docs/evidence/2026-11-24/ground/. S1/0025 sigue pospuesta.

## GROUND publicado y comprobado — 2026-11-24T16:34Z

Fuente6546da5c67a7120dbe657ee878b405b02dd1af2e; Actions45437345514 verify/deploy SUCCESS.81pruebas+10recorridos navegador. Migraciones0034/0035/0036/0037 aplicadas en D1 existente, sin borrado, duplicación de infraestructura ni0025. API687d3d73-501d-4613-95e3-2a1e44ed8733; web8d6b5142-7ef5-479a-9390-67b352ee4bb6; admin22187e44-f24e-4fdf-8778-d649c8f249c7. Recuperación nativa D1 comprobada por metadata, sin exportar/restaurar datos.

HTTP200 y coincidencia byte a byte de resources/route-editor/vehicle-picker/seat-map/transport/reservations/business/atlasWebP. Healthground-transport-v1/schema0037_ground_operations/D1R2true/pagosdisabled. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a intacta; PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intacto. No se crearon personas, viajes ni GPS ficticios en público.

GROUND-8-DEPLOY VALIDADA. Fase8 global EN PRUEBAS: GROUND-8-FISICO PENDIENTE con vehículos/teléfonos/cámara/GPS reales. Las fases2–7 están verificadas como software sobre fixtures aislados; no certifican conducción ni seguridad comercial. GPS web necesita navegador visible; pagos bancarios reales y Premium Inteligente/Android continúan desactivados. Google/correo real/SRI conservan sus bloqueos externos previos, sin frenar el acceso de piloto existente.

URL: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ ; pasajero https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Crear vehículo muestra7imágenes genéricas de referencia; unidad y fotos propias se conservan aparte. Nuevo máximo100 se configura en standard_transport_settings, con controles SQL/API. Evidencias de publicación/verificación y capturas en docs/evidence/2026-11-24/ground/. Fuente válida es la rama activa y commit indicado; el trabajo S1 local anterior está diferido y no se publica con esta entrega.

## UX-01 — recuperación de claridad y reanudación del plan completo

Usuario informa piloto presentado; rechaza UX vigente. Plan171tareas/fases00–13 y ampliaciónGROUND permanecen vigentes, no se dan por terminados. La aceptación de interfaz no se deduce de81tests funcionales.

02.01 AUDITADA: demo público consultado en navegador de solo lectura, sin POST, y comparado con operadora real mediante fixtures locales. Problemas: seis destinos Premium, directorio empresarial plano, doble selector de responsable, reconfiguración de vehículo ya guardado, pérdida de contexto por polling/navegación sin URL.

UX-01 EN PRUEBAS: menú móvil de cinco destinos, rail de escritorio; Crear viaje agrupa recorrido, vehículo/equipo y tarifa/embarque; recuperar unidad/plazas/conductor y ocultar reconfiguración/selector duplicado; responsable adicional solo con empleados disponibles; gestión agrupada por operación, equipo/flota y clientes/finanzas dentro de Empresa. Ningún módulo se elimina. Filtros de estado y métricas reales; enlaces con contexto e historial; no reconstruir pantallas cuando los datos no cambian; conservar mensaje de guardado. Formularios/cámara/pago/QR/GPS/backend existentes reutilizados. Sin migraciones ni cambios de permisos.

Pruebas locales: presentación PASS26s, operadora cuatro unidades/conductores/salidas/GPS PASS66s, bus dos pisos/tramos/ventanilla y navegación recarga PASS15s; capturas móvil390 y escritorio1280 revisadas. Se corrigió un borrado accidental de enlaces de Empresa al incrustar el directorio. No declarar despliegue hasta Actions y comprobación remota.

Fase02 global EN DESARROLLO: continuar coherencia entre consola principal, administración empresarial, identidad y pasajero; accesibilidad/errores y navegación por rol. Fases04–09 todavía tienen trabajo real: roles empresariales múltiples y alcance, propietarios, asignaciones temporales, generación multivehículo y calendario completo. No marcar esos módulos como completos por añadir accesos. Google/correo/SRI reales mantienen dependencia externa previa; pruebas físicas siguen pendientes.

## UX-02 — contexto empresarial compartido

EN PRUEBAS de publicación. Administración empresarial e identidad recuperan el mismo marco visual de operadora: logo/contexto, jerarquía de títulos, navegación inferior móvil/lateral escritorio, acciones contextuales y listas sin cuadrículas de funcionalidades. Tema de empresa y colores de seguridad se conservan. Regreso empresarial lleva a Empresa; iconos SVG reutilizados por consola y empresa con aria-hidden, sin alterar nombres accesibles. Formularios, borradores, clientes, cobros de prueba, nómina y mantenimiento existentes reutilizados. Sin cambios de base, API o permisos.

Pruebas: enterprise-localPASS10s en360/390/1280 y identity-localPASS9s con borrador/publicación/recorte. Se corrigió CSS pseudocontent que alteraba nombres accesibles. UX-01 continúa en Actions45505096489; completar ambos despliegues/evidencias antes de declarar publicado. Fase02 global no se cierra por estos hitos: resta consolidar navegación entre todas las superficies/roles y revisión de pasajero. Todo el plan permanece abierto según cada criterio, no limitarlo al piloto.

## UX-01/UX-02 publicados — 2026-11-24T23:05Z

UX-01 fuente4f5bbe77c8b520063798dfb814933ea759ec8045/Actions45505096489 verify/deploy SUCCESS. UX-02 fuente986224b08fbee3b2a06be15fb05b4ed761dc506d/Actions45505867765 verify/deploy SUCCESS. Cada entrega conserva81pruebas y10recorridos navegador. Sin migraciones, cambios de permisos, cobros ni modificación de datos del demo.

API7b5a8e5e-22e5-432b-91cf-5ddf54e76449; webc168e2e2-bfff-4515-a20a-7d1a17c8bd92; admin5f20b899-c00b-4a7c-a326-a6b131ab5d57. Verificación remota200/coincidencia fuente de app/CSS/template de operadora, marco empresarial/iconosSVG y businessapp. Health0037/D1R2true/pagosdisabled. Pages200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f permanece intacto.

UX-01 yUX-02 VALIDADA en su alcance de operadora/empresa, con interacciones y capturas390/1280, rutas de publicación/compra/QR/embarque/GPS, financiero, nómina, mantenimiento e identidad. Evidencias: docs/evidence/2026-11-24/ux/. No se crearon registros de prueba en la plataforma pública ni se acreditan sensores físicos.

Fase02 global EN DESARROLLO: siguiente02.02C coherencia de pasajero/sesión/retorno y02.07 validación transversal de accesibilidad/roles. Luego seguir fase03/04 y dependencias de PLAN, reutilizando identidad y APIs existentes. Roles granulares/múltiples, propietarios, asignaciones temporales, programación multivehículo y calendario completo siguen pendientes; consultar FULL_PLAN_EXECUTION.md. No cerrar todo el plan ni presentar estos accesos como funciones ya completadas. Fuente válida es rama activa/commit986224b; root local conserva trabajo S1 diferido no publicable.

URL principal https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Menú inferior móvil y rail escritorio, creación agrupada y recuperación de vehículo, sin duplicar datos ni módulos.

## UX-03 — tarea02.02C pasajero y retorno

EN PRUEBAS de publicación. Reserva agrupada en asientos/datos/pago, selección explícita de piso en vehículos de dos pisos conservando asientos de ambos pisos, estado de asiento actualizado durante polling, boleto con jerarquía legible. Botones de piso son typebutton y no confirman compras; selección/pago/inventario/QR siguen siendo los existentes. Cuenta de operadora incluye returnTo con empresa/modalidad/destino, validado por return-path existente.

Presentación/QR/cámara/GPSPASS24s; bus70/tramos/compra y ventanilla verificados tras seleccionar Piso2 en ambos canales. Sin migraciones, cambios de API, permisos ni cobros reales. Continuar fase02 transversal y validación de identidad existente, luego fase04autorización/equipo; no presentar roles avanzados o propietarios como implementados.


## UX-03 publicada / UX-04 en validación

UX-03 (02.02C) VALIDADA en su alcance: fuente a87c850060cc0887c979a1e59577008a76ca490a, Actions45507871842 verify y deploy SUCCESS (81 pruebas y10 recorridos navegador). Publicación comprobada en cinco recursos de reserva/pago/asientos, D1/R2 activos, esquema0037, pagosdisabled. Pages conserva hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f. Evidencia remota en docs/evidence/2026-11-24/ux/publication-checkout.json.

UX-04 (02.07 parcial) EN PRUEBAS: acceso empresarial sin sesión conserva retorno al login; conductor entra en jornada sin exponer navegación administrativa; Hoy/Mi semana mantiene URL al recargar; periodo y vacío se describen correctamente. Durante guardado empresarial se desactiva la siguiente acción principal hasta terminar la actualización, evitando un clic sin respuesta. Los errores posteriores al cierre del diálogo aparecen en el estado de pantalla. Reutiliza autenticación y permisos existentes; NO implementa aún los ocho roles/multirrol del plan.

Pruebas nuevas locales: invitación de conductor aceptada por cuenta nueva con una de cuatro unidades; solo una salida visible y dos destinos, retorno desde enlace empresarial; teclado en selección de piso no envía reserva; selección se conserva entre pisos; fallo503 al guardar vehículo conserva datos y permite reintento. Prueba inicial de creación rápida de cuatro empleados falló esperandoPersona3; otras ejecuciones pasaron. Se añade diagnóstico y se corrige ventana de interacción mientras refresh sigue en curso; confirmar regresión completa antes de publicar. Sensores físicos y matriz avanzada siguen pendientes.


## UX-05 — boleto y navegación de pasajero

EN PRUEBAS de publicación. El boleto/QR ocupa el primer plano; cuenta queda debajo y opciones de instalación/notificaciones se agrupan en un desplegable. No se elimina ninguna función. Navegación marca un único destino activo al abrir Mis viajes; botones conservan tipografía/contraste del sistema. Regresión local AlphaPASS55s y bus70/tramos/ventanilla/QRPASS20s; comprobaciones de teclado entre pisos, fallo503/reintento, una pestaña activa y opciones accesibles mediante desplegable. Captura real móvil revisada.

UX-04 fuente d2b6ab6c7939916a9d11d560839e2305beb08125: workspacePASS69s, enterprisePASS10s e identidadPASS10s locales; CI45510823523 superó81pruebas pero falló por selector parcial de Mis viajes que también encontraba Notificaciones de mis viajes. Se corrige el selector a exact:true sin omitir ninguna comprobación. No declarar deployUX04 aprobado por esa ejecución. UX05 incluye corrección y debe superar flujo completo y publicación efectiva. Sin migraciones ni cambios de datos o permisos.


## Cierre de publicación UX-01–UX-05 — 2026-11-24

Hitos UX-01/02/03/04/05 VALIDADOS en su alcance de software y despliegue. Última fuente d980e47f2f2414d72e55649806a726ea3b5bb491; Actions45511383734 verify SUCCESS y deploy SUCCESS, 81 pruebas +10 recorridos navegador, incluida corrección de selector ambiguo. Actions45511395836 valida la misma fuente con deploy omitido; la evidencia de publicación es45511383734.

API a535d08f-f655-498e-91ec-7bce0bad7f43; web b03538e4-bf06-4ea0-95c8-4d7c09833f73; admin3cfe7299-660d-4467-9e91-86886e4afdfe. Siete archivos servidos200 e idénticos a fuente. Health0037_ground_operations/D1R2true/paymentsdisabled. No migraciones nuevas. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y Pages hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f permanecen intactos.

Reutilizado: backend/autenticación/permisos actuales, identidad R2/publicación, reservas/inventario/QR, módulos empresariales y GPS. Implementado: navegación inferior/rail de escritorio, directorio contextual de módulos, creación en tres secciones y recursos recuperados, selección de pisos por teclado sin enviar compra, boleto primero/opciones agrupadas, retorno de sesión, jornada y semana persistente del conductor, bloqueo visible durante guardado y conservación ante fallo503.

Evidencias en docs/evidence/2026-11-24/ux/ (creación390, viajes1280, mantenimiento1280, ticket390 y JSON de publicación). Pruebas locales de interacción y capturas revisadas; geolocalización/cámara emuladas no acreditan sensores físicos. No se insertaron cuentas/viajes sintéticos en remoto.

Continuidad: plan171tareas yGROUND vigentes. Fase02 global EN DESARROLLO/02.07 EN PRUEBAS, no confundir estos hitos con cierre de todas las superficies o de todo el plan. Fase03 registra evidencia de identidad existente como AUDITADA para reutilizarla. Después continuar Equipo/roles con autorización granular y alcance en backend; propietarios, asignaciones temporales, programación multivehículo/ida-retorno y calendario completo siguen abiertos. Ver FULL_PLAN_EXECUTION.md. No mapear nuevos roles a administrador ni cerrar tareas con enlaces.

URL de operadora https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ ; pasajeros https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Fuente remota de rama activa prevalece sobre diffs locales antiguos/S1 diferidos: no publicar0025 ni mezclar ese trabajo.


## 2026-11-25 — continuidad sin pausa / 04.01 base de permisos

El usuario ordena continuar hasta terminar. Checkout limpio de rama activa en /workspace/rutasec-active, base a33e199; no mezclar diffs S1/0025 del checkout histórico. Se conserva plan171tareas y evidencia física pendiente.

04.01 EN DESARROLLO: se reutilizan memberships, cuentas, sesiones y empresas. Migración aditiva0038 incorpora catálogo de funciones, concesiones explícitas múltiples, revisión de membresía y alcance vehicular. No modifica cuentas ni permisos existentes. Nuevos roles usarán un ancla heredada de mínimo privilegio (driver), nunca admin; las concesiones explícitas sustituyen el rol heredado en la resolución de capacidades. No activar escrituras/invitaciones de roles nuevos antes de completar guardas de todos los endpoints y SQL de operación. Owner protegido siempre conserva autoridad; roles heredados conservan su comportamiento hasta modificación autorizada.

Contrato GET/api/team/access autentica y devuelve roles/capacidades/revisión de la empresa solicitada. Prueba Worker real local PASS: propietario conservado, cuenta ajena403, anónimo401, POST405, finanzas explícito sin operación de viajes, alcance vehicular ajeno rechazado en SQL y revocación que elimina concesiones. Sin UI nueva ni despliegue todavía; continuar integración de guardas antes de exponer los roles.


## 04.03–04.10 — permisos operativos y empresariales (backend en pruebas)

Integradas capacidades en publicación, cambios, manifiestos, reservas, ventas, finanzas, nómina, mantenimiento y GPS. Scopes0039 aplican lectura por recurso y operación por salida; el conductor vinculado a la salida tiene prioridad sobre la asignación habitual del vehículo. Un permiso de lectura de flota combinado con conductor NO concede conducción de todas las unidades ni manifiestos ajenos. Base memberships heredada conservada como ancla mínima; sin nuevas invitaciones/roles expuestos aún.

Pruebas Worker locales: regresión5/5 (empresa, acceso operativo, embarque yGPS), contrato de acceso y nuevo recorrido de roles PASS. Agente de ventas vende con inventario real/pago simulado pero no accede a nómina ni opera viajes; contabilidad maneja finanzas/personas laborales, no inicia viajes ni veGPS; flota obtiene datos básicos de empleados sin remuneraciones; conductor por salida recibe manifiesto y opera aunque otro sea habitual. Revocación retira acceso inmediatamente. SQL de GPS y asignación verifica permisos en transacción. Prueba inicial usó una ruta sin puntos de embarque y una venta sin teléfono: se corrigieron los fixtures; no se relajaron validaciones.

Pendiente del mismo hito: Equipo y accesos con invitaciones/edición/revocación, selección de recursos y navegación según capacidades, pruebas navegador y despliegue. No marcar fase04 completa sin esas pruebas. Baseline82/82 anterior PASS; ejecutar batería integrada nuevamente tras completar el hito.
