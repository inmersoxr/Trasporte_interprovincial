# UX-05 — primero el boleto


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
