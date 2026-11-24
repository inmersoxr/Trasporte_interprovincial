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
