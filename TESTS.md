# Registro de pruebas de RutasEC

Cada entrada incluye ID/tarea, entorno, método, resultado, evidencia, límites y commit. No confundir pruebas de CI/locales con vehículos, conductores o teléfonos físicos.

## Evidencia previa reutilizable
- Premium/identidad: Actions45309144150 SUCCESS,69 pruebas y seis recorridos Chromium; Workers/D1/R2schema0028. Ver snapshot2026-11-24-zz-enterprise-delivery.md.
- Acceso/ojito: Actions45319595023 SUCCESS,69 pruebas y seis recorridos, más navegador remoto360/390/1280. Snapshot2026-11-24-zzz-account-password-mail.md.
- Google preparado ded3bb70: Actions45322538944 verify/deploy SUCCESS. Pruebas locales de JWT/PKCE/callbacks/provisión y Alpha con desafío de correo pendiente; falta consentimiento real/credenciales.
- No declarar validados: cuatro vehículos reales, cuatro conductores, GPS físico simultáneo, piloto entre teléfonos, envío real de correo o Google real.

## Pruebas de la tarea en curso
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
