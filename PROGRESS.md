# Circuito prioritario de presentación

El plan completo continúa vigente. Prioridad actual: entregar empresa→vehículos→conductores invitados→publicación→compra/QR→embarque→GPS; pruebas físicas permanecen pendientes, sin detener el trabajo técnico.

| ID | Estado | Evidencia / siguiente acción |
|---|---|---|
| P0 | EN PRUEBAS | Preparación explícita de empresa y vehículo de piloto sin documentos falsos; backend probado. |
| P1 | EN PRUEBAS | Invitación vinculada, aceptación, asignación y revocación; permisos de conductor comprobados. |
| P2 | EN PRUEBAS | Publicación individual o recurrencia diaria/semanal/mensual elegida, vista previa sin escrituras y agenda Hoy/Mi semana mediante interfaz real. |
| P3 | EN PRUEBAS | Compra/QR/cámara/GPS/observador anónimo integrados en Chromium; coordenadas/cámara de prueba, no pruebas físicas. |
| P4 | EN DESARROLLO | Congelar fuente, regresión, despliegue y comprobación remota; entregar URL y guía. |

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
