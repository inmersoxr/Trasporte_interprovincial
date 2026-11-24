# R2 — Crear viaje también en Premium

EN PRUEBAS. Añadir Crear viaje al menú inferior de Premium sin retirar los accesos actuales. Reutilizar formulario/backend/inventario de Standard y mantener Premium al publicar; regresar a En vivo con la salida pendiente. Prueba de la cuarta publicación en Premium dentro del recorrido existente y adaptación móvil360/390. No hay cambios de esquema.

# R1 — Recuperar módulos y completar relaciones/compartir

R1-UI VALIDADA: selector Standard/Premium, navegación inferior adaptada, sin Avisos, acceso de pasajero/cuenta reubicado en Empresa; módulos existentes vuelven a ser navegables. R1-DATOS VALIDADA: vehículos/empleados CRUD reutilizados y vínculo de responsable por salida nuevo en0032, con aislamiento y conflictos atómicos. R1-COMPRA VALIDADA: métodos/fichas ficticios del demo, boleto completo y estados/QR persistentes. R1-GPS VALIDADA (software; sensores físicos pendientes): cuatro sesiones GPS y selección de unidad con persona/vehículo, mapa estable y enlaces compartidos que no desaparecen. R1-DEPLOY VALIDADA por Actions45393517383 y comprobación pública. Pruebas físicas siguen pendientes.

# Corrección vigente: circuito simple como el demo

S0 — VALIDADA (software y despliegue de desarrollo; S0-FISICO PENDIENTE). Se reutiliza el formulario comercial de bookings.mjs y sus estilos; navegación inferior Mis viajes / Crear viaje / Mi empresa. No se exige conductor ni invitación. Vehículo se configura al publicar o se selecciona uno guardado; no se introducen placas ficticias. Empresas/vehículos/viajes previos se conservan. Publicar guarda D1 y catálogo; comprador en otra sesión recibe QR y el operador realiza escaneo/inicio/GPS/finalización. Migración0031 solo cambia elegibilidad de entrenamiento; no concede aprobación documental.

La solicitud anterior de corregir invitaciones quedó sustituida por esta instrucción antes de publicar: no se desplegó aquel trabajo en curso. Las pruebas físicas siguen pendientes; no confundir geolocalización/cámara emuladas con teléfonos reales.

# Circuito prioritario de presentación

El plan completo continúa vigente. Prioridad actual: entregar empresa→vehículos→conductores invitados→publicación→compra/QR→embarque→GPS; pruebas físicas permanecen pendientes, sin detener el trabajo técnico.

| ID | Estado | Evidencia / siguiente acción |
|---|---|---|
| P0 | VALIDADA | 295bd0b2: preparación explícita de empresa y vehículo sin documentos falsos; integración y navegador aislados PASS. |
| P1 | VALIDADA | 295bd0b2: invitación vinculada, aceptación, asignación y revocación; permisos/agenda aislada comprobados en Worker y navegador. |
| P2 | VALIDADA | Publicación individual o recurrencia diaria/semanal/mensual elegida, vista previa sin escrituras y agenda Hoy/Mi semana mediante interfaz real. Fuente295bd0b2; ninguna salida creada sin confirmación. |
| P3 | EN PRUEBAS | Compra/QR/cámara/GPS/observador anónimo integrados en Chromium; coordenadas/cámara de prueba, no pruebas físicas. |
| P4 | VALIDADA | 295bd0b2 / Actions45340992233 SUCCESS; schema0030,74pruebas+8navegadores, portal público390/1280 y assets exactos PASS. Guía docs/PRESENTATION_PILOT.md. |

# Prioridad inmediata de presentación — 2026-11-24

Prioridad vigente: circuito de presentación mañana. Continuar tareas implementables sin esperar01.09; mantener pruebas físicas pendientes. Secuencia P0 preparar operadora/vehículo piloto -> P1 invitación vinculada a vehículo -> P2 publicar/agenda -> P3 reserva/QR/embarque/GPS entre sesiones -> P4 desplegar y comprobar. Plan171tareas preservado; no declarar fases amplias terminadas por este recorte.


# Progreso de RutasEC

Registro inicial 2026-11-24. No se marcan las fases posteriores como terminadas por el inventario histórico. Ver docs/ENTERPRISE_PILOT.md y snapshots para capacidades reutilizables ya comprobadas.

Fase00 VALIDADA. H1 desplegado3186c93c/Actions45333404724 SUCCESS,72 pruebas y7navegadores. 01.09 conserva prueba física pendiente; por nueva instrucción no bloquea el circuito de presentación. G-BRANDING público; Google real pendiente de credenciales/consentimiento.

| ID | Estado | Evidencia / bloqueo | Commit |
|---|---|---|---|
| 00.01 | VALIDADA | Worker web/admin con proxy al mismo rutasec-api-dev; D1 rutasec-dev y R2 existentes; builds separados de Pages. Ver docs/AUDIT_PHASE00_2026-11-24.md. | c2618fb494af327e3106854b50f97247892ed105 |
| 00.02 | VALIDADA | Matriz docs/ENTERPRISE_PILOT.md, docs/PREMIUM_AUDIT_IDENTITY.md y módulos standard/premium; diferencias nuevas registradas. Ver docs/AUDIT_PHASE00_2026-11-24.md. | b29eebdd1986a181c535a592b7b5cb94afa83bc1 |
| 00.03 | VALIDADA | schema0028 remoto D1/R2true; 71 pruebas CI y seis navegadores; migraciones0001–0028 publicadas salvo0025 pospuesta. Ver docs/AUDIT_PHASE00_2026-11-24.md. | a247a67a0631dc238c134238d288fbd2629140ea |
| 00.04 | VALIDADA | Google y correo reales bloqueados; acceso piloto sin código pendiente; pruebas físicas no validadas; código funcional separado de aceptación real. Ver docs/AUDIT_PHASE00_2026-11-24.md. | a7cecfa6d8a99d9ab9ebbe153a6bd4b0fe97d660 |
| 00.05 | VALIDADA | Actions45330995683 SUCCESS; URLs about/privacy/terms HTTP200 anónimas; Chromium remoto390/1280 PASS; health schema0028/D1/R2true. Ver docs/AUDIT_PHASE00_2026-11-24.md. | 67bec5ed8db53772afb39cc5ac5d8b89fe96ccc8 |
| 00.06 | VALIDADA | Fuente ded3bb70; versiones Workers conocidas y D1 Time Travel metadata verificada en Actions45322538944; punto UTC2026-11-24T05:07:11Z; sin exportar/restaurar datos. Ver docs/AUDIT_PHASE00_2026-11-24.md. | 7497e906a19c32e5c250c291ae657dfa45958f6e |
| 01.01 | VALIDADA | 3186c93c/Actions45333404724 SUCCESS;72tests y7navegadores. Registro sin correo/SMS en Worker real de prueba; frontend público muestra Crear cuenta y entrar sin código. | 3186c93cd3aa1ddc19230d155cb285be80baed77 |
| 01.02 | VALIDADA | Selector inicial Teléfono, prefijo editable+593, formato E164 normalizado en backend y rechazo de número sin código; Chromium360/390/1280 y captura remota inspeccionados. | 1bd09dc0f390e06e69ad5f3bd1d7f55fcedb25d7 |
| 01.03 | VALIDADA | PILOT_REGISTRATION_ENABLED true en despliegue. Sin envío/código; contacto permanece no verificado. No concede admin global aun declarando correo preautorizado; rechazo fuera del host app y al apagar flag. | 2ac596631e4a064b5e74a5a5b82747325c1a5fe4 |
| 01.04 | VALIDADA | scrypt reutilizado, cookies Secure/HttpOnly, sesiones hash7d, origen, rate limiting y revocación. Probe negativo en Cloudflare devuelve401 ejecutando comparación; sin cuenta creada ni secretos expuestos. | 419a89c2492a8bd2cbad7a20fa96536001c109fe |
| 01.05 | VALIDADA | Worker y Chromium: login en segundo contexto, recarga, cambio de contraseña revoca sesión anterior, logout revoca cookie; vía teléfono y correo preservada. | 9e6bc88386845d5f9c08ba4c3f9f56edfa9b6b56 |
| 01.06 | VALIDADA | Sin empresa, Operadores abre Empresa automáticamente; crear nombre persiste misma entidad vista desde segunda sesión. Reintento idempotente; ninguna empresa ficticia creada en remoto. | b8684a8c60fe1b71ea1494236511488f072d6f6d |
| 01.07 | VALIDADA | Membresía owner al crear empresa; UI Administrador principal; API de otra empresa403, platformRole null y cero admin global por declaración de contacto sin verificar. | 3d6387746ea14323bb059ec7ff2a76e87076d4a2 |
| 01.08 | VALIDADA | PILOT_PREMIUM_ENABLED true; trial fee0 sin vencimiento configurado al crear organización propia, trigger0023 reutilizado. Premium/gestión habilitados en Worker y navegador; planes previos sin cambios; pagos reales desactivados. | a81c87f0f52d2ead823578fd3d4301bd553bf597 |
| 01.09 | BLOQUEADA | Dos contextos independientes y recarga PASS en CI; falta que participante entre con la misma cuenta desde dos teléfonos/conexiones reales y confirme la misma empresa. No sustituir esta evidencia con fixtures. | c4088d72610d92df0199aff0eb42a40017f3da21 |
| 01.10 | VALIDADA | 3186c93c/Actions45333404724 SUCCESS. schema0029 piloto/D1/R2true, flags true; activos coinciden, UI pública anónima móvil/escritorio PASS. Main/Pages intactos. Despliegue permite prueba física01.09, no cierra aún Fase01. | 3186c93cd3aa1ddc19230d155cb285be80baed77 |
| 02.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 02.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 03.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.13 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.14 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.15 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.16 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.17 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 04.18 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 05.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 06.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 07.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.13 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.14 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.15 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.16 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 08.17 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 09.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 10.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.13 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.14 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.15 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.16 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 11.17 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.13 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.14 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.15 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.16 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.17 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 12.18 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.01 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.02 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.03 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.04 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.05 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.06 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.07 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.08 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.09 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.10 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.11 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.12 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.13 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.14 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.15 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.16 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |
| 13.17 | PENDIENTE | Validar implementación existente antes de decidir cambios. | Pendiente de cierre identificable |

## Entrega publicada del circuito — 2026-11-24T06:37Z

Fuente295bd0b26cbe8f3782ca4a1f2e2a16da8e3df87f. Actions45340992233 verify/deploy SUCCESS:74pruebas y8recorridos navegador. Migración0030 aplicada en D1 existente; health pilot-circuit-v1, D1/R2true, pagosdisabled. Versiones API2ceaf44e-6f94-4e5c-b185-3b874f4b5f47, web29ecaf5c-9a04-4023-a20e-1ab6ef583d96 y admina9fbc7f1-6163-4f63-8d9a-de6110b2c600. Recuperación nativa D1 comprobada mediante metadata, sin exportación/restauración ni borrado.

URL de operación: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Navegador público390/1280 PASS: acceso piloto redirige a cuenta, registro sin código visible, sin desbordamiento ni erroresJS. Assets pilot/join/GPS/permisos coinciden byte a byte con fuente; dashboard anónimo401. Google y correo reales siguenfalse; teléfono/correo+contraseña del piloto no dependen de esos proveedores. No es login mediante WhatsApp.

Main permanece0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y Pages HTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se sembraron datos/GPS/cuentas en público. Pruebas reales con cuatro vehículos/conductores/cámaras y teléfonos independientes siguen EN PRUEBAS; fixtureGPS/cámara de CI no las valida. Mantener aplicación visible para GPS web. El plan171tareas continúa: no se declaran completadas todas las fases ni seguridad comercial. Evidencias y capturas: docs/evidence/2026-11-24/presentation/.

## S0 publicado y comprobado — 2026-11-24T10:15Z

Fuente45ed4b3d1ffa768de1eca995cb58cd7216560e10, Actions45372210818 verify/deploy SUCCESS.74 pruebas y8recorridos navegador PASS, incluido empresa→formulario del demo→vehículo/capacidad sin conductor/invitación/placa→publicación→compra independiente→QR→escaneo del operador→inicio/GPS→seguimiento público→finalización. Prueba local específica PASS23.66s; no se crearon datos de prueba en público.

/pilot/ confirmado públicamente con schema0031_simple_pilot, revision simple-pilot-v1, D1/R2true, pagosdisabled. Activos app/CSS/template/GPS coinciden byte a byte con el árbol probado. Chromium anónimo390/1280 confirma entrada/registro sin errores ni desbordamiento; dashboard401 sin sesión. Los fallos iniciales de acceso desde runner se debieron al proxy/CA del entorno; se configuró el proxy en el navegador de verificación, sin modificar TLS de la aplicación.

API3f8456a1-ac3a-45f6-84d9-209e9fe2bffb; web682d6e21-63d1-4bc6-ab90-0ff5f3370604; admina910e256-68d9-4787-9976-4ace29837ea3. Migración0031 aplicada sin borrar datos; D1 Time Travel metadata comprobada sin exportar/restaurar. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se desplegó el trabajo descartado de invitaciones.

S0-UI/API/despliegue VALIDADA en entorno de desarrollo; S0-FISICO PENDIENTE con teléfonos/cámara/GPS reales. Geolocalización/vídeo emulados no acreditan sensores físicos ni conducción. La aplicación transmite ubicaciones del dispositivo y no inventa posiciones; mantener el navegador visible. Cuenta normal existente conserva permisos; no se requiere crear conductores ni nuevos roles. Pagos simulados, sin cobros.

URL: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Menú inferior Mis viajes / Crear viaje / Mi empresa. Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Guía: docs/PRESENTATION_PILOT.md. Evidencias: docs/evidence/2026-11-24/simple/. Plan completo sigue vigente, fuera de este circuito no se dan por cerradas las fases.

## R1 publicado — 2026-11-24T12:33Z

Fuentea72479aab0c35ea657bae9d27ea359c9d26fa9e0; Actions45393517383 verify/deploy SUCCESS,75 pruebas y9recorridos navegador. Incluye creación de cuatro vehículos y cuatro fichas laborales desde UI, vínculo persona/unidad/salida persistente y aislado, cuatro sesiones GPS emuladas independientes, próxima salida sin punto falso, selección/mapa global, boleto/QR/embarque, tres métodos de pago ficticios, WhatsApp/nativo con activación de usuario y enlace que sobrevive al polling. Cerrar uno de cuatro viajes deja3 y revoca su seguimiento público.

Interfaz publicada: Standard/Premium con menú inferior adaptado. Standard: Viajes, Crear viaje, Vehículos, Reservas, Empresa. Premium: En vivo, Vehículos, Empleados, Gestión, Empresa. Vista de pasajero y Mi cuenta se reubicaron en Empresa; en pasajero cuenta/notificaciones están dentro de Mis viajes y en consola Standard de gestión, Más→Cuenta. Se eliminó el destino principal Avisos, no el servicio de notificaciones. Se conserva la interfaz actual y se reutilizan los campos de pago ficticios y las funciones del demo, sin sus listas/personas/ubicaciones de muestra.

Migración0032 aditiva: standard_departure_staff liga empleado y salida, guarda nombre al asignar, valida empresa/persona activa y rechaza solapamientos en SQL. Alta de salida, bloqueo horario del vehículo y vínculo se confirma atómicamente en el comando existente; persona no necesita una cuenta y no obtiene permisos por figurar en el viaje. Los campos bancarios ficticios nunca entran en el payload; solo enum de método queda en payment_events. La prueba de reembolso verifica un único evento simulated_refund, separado de metadata.

Health remoto operator-workspace-v1/schema0032_trip_responsible, D1/R2true, paymentsdisabled. WorkerAPIa8e6f008-bbc6-4a50-8a2a-419d5911a0af, web6980630f-2345-4263-ba5e-80d335d57e1c, admin50b1c75e-d0a9-4360-9d56-ccf8f4cc4dc7. Activos index/app/CSS/share/payment/notifications/navigation/GPS coinciden con fuente final. Chromium anónimo390/1280 PASS, dashboard401 sin sesión; ninguna cuenta o viaje ficticio creado en público. Recuperación D1 nativa verificada por metadata, sin exportar/restaurar ni borrar datos. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos.

R1-UI/DATOS/COMPRA/GPS-software/DEPLOY VALIDADA en desarrollo. R1-FISICO PENDIENTE: cámara/GPS real, cuatro vehículos y teléfonos participantes. No se certifican conducción, producción ni contabilidad fiscal. SRI real permanece bloqueado por certificado/configuración/adaptador externo; sus datos/comprobantes de prueba sí funcionan. Pagos bancarios reales continúan desactivados. S1/0025 pospuesta.

Guía e inventario: docs/OPERATOR_WORKSPACE.md. Evidencias: docs/evidence/2026-11-24/workspace/. URL https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ ; pasajero https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Mantener plan171tareas, sin reiniciar ni marcar todas las fases como terminadas por esta entrega.

## R3 — fichas de vehículos/conductores y boleto inmediato (2026-11-24)

EN PRUEBAS de entrega. Vehículos/Conductores en pestañas bajo Vehículos, alta y edición en diálogo, placa/marca/modelo/tipo/plazas y datos adicionales; cédula/licencia/teléfono/foto y vínculo laboral opcional. Reutiliza standard_drivers/documentos R2; configuración habitual en vehículo y snapshot driver por salida. Datos y fotografías privados, sin crear cuentas ni permisos. Crear viaje en ambas modalidades; recuperar conductor habitual y permitir cambio por salida. Migración0033 aditiva, sin borrado ni0025. Conflictos de conductor simultáneo en SQL, revisión optimista, aislamiento de empresa.

Compra: bloqueo de doble envío, abrir boleto específico usando respuesta confirmada del POST y URL recuperable, sin depender de GET del historial; aplicar a compartido y privado. No emitir boletos ficticios ni confirmar localmente sin backend. Pagos de crédito/débito/transferencia siguen simulados.

Evidencia local ya ejecutada: driver-resources API PASS; navegador cuatro vehículos/conductores/fotos/asignaciones/publicaciones/GPS PASS73s; presentación con lectura de historial503 forzada PASS29s. Ampliación tres compras por método confirmó boletos y avanzó al embarque; detectó inestabilidad del enlace de seguimiento, ajustado selector al primer enlace. Suite previa73/75: se corrigió alias SQL en perfil y fixture de identidades repetidas. No iniciar otra auditoría general por instrucción del usuario; workflow de publicación conserva checks existentes. Pruebas físicas de cámara/GPS y cuatro vehículos siguen pendientes. Completar evidencia Actions y remoto antes de declarar desplegado.

R3 PUBLICADO: 7d8b7ae4582a801a933907b359f369df592899d9/Actions45400666550 verify/deploy SUCCESS;76pruebas+9recorridos. Archivos públicos coinciden con fuente, schema0033/D1/R2true, Pages intacto. Corrección de test: qrcode oculta canvas al generar img; comprobar generación sin exigir canvas visible. Registro y compra de tres métodos avanzaron correctamente. Prueba física pendiente. GROUND-1 VALIDADA por inventario docs/GROUND_TRANSPORT.md; GROUND-2 EN DESARROLLO. No alterar plan171tareas.

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
