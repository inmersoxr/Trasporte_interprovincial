# RutasEC v0.1.0 Alpha — aceptación y límites

Identificador provisional de esta etapa:0.1.0-alpha.0. No equivale a certificación comercial. La autorización general del usuario permite corregir lo existente; no activa pagos reales ni permite modificar el demo de GitHub Pages.

## Inventario reutilizado y corregido

Rutas de backend indicadas relativas al Worker API; la web las expone bajo /standard-api.

| Función | Fuente y endpoints | Evidencia disponible |
| --- | --- | --- |
| Cuenta y sesión común | cloudflare-dev/identity.mjs, password-auth.mjs, account/; /auth/email/register,verify,resend,login,forgot,reset,change-password; /auth/session,profile,logout; /auth/google/start,callback | Operativa y comprobada localmente con proveedores simulados; activación real Google/correo depende de configuración externa. Cookies normales, no IDs ni claves manuales. |
| Operadora, conductor, vehículo y documentos | standard-onboarding.mjs, standard/onboarding.mjs, standard/onboarding-policy.mjs; /api/operator-onboarding,operator-profile,operator-drivers,vehicle-details,operator-documents,operator-submit | Localmente comprobada con D1/R2, expediente privado, revisión y caducidad. Política manual del piloto, no certificación de requisitos legales. |
| Revisión administrativa | platform-api.mjs, admin/review.mjs; /api/platform/operators/:id,operator-review,documents/:id | Autoridad global separada de propietario de operadora; comprobación local de privilegios y versión concurrente. Primer owner solo con correo preautorizado demostrado. |
| Rutas y publicaciones reales | standard-api.mjs, standard-catalog.mjs, standard/search.mjs; /api/operators,vehicles,route-offers,departures,catalog | Persistencia y filtros locales comprobados. Datos anteriores conservados como qa fuera del catálogo normal; ninguna precarga comercial se convierte en viaje Alpha. |
| Recurrencia Standard | standard-recurring.mjs, standard/recurring.mjs; /api/recurring-schedules y acciones preview/publish/stop | Localmente comprobada: fechas UTC−5, salidas e inventario independientes,90 máximas por transacción, idempotencia y conflictos. Sin cron/infraestructura nueva. |
| Reserva y plazas | standard-reservations.mjs, standard-contact.mjs, standard/reservations.mjs; /api/bookings y /api/bookings/:id | Localmente comprobada con sesiones independientes, carrera por misma plaza, último asiento, snapshots de contacto y reingreso. Compra exige cuenta verificada. Pago SIMULADO. |
| Privado fijo/personalizado | standard-private.mjs, standard-market.mjs, standard/market.mjs; /api/private-bookings,private-requests,private-offers | Se conserva implementación separada, calendario y selección competitiva existentes; regresión D1 y contacto/nombres reales comprobados localmente. Sin adjudicación al primer ofertante. |
| QR y embarque | standard-boarding.mjs, standard/scanner.mjs, standard/operations.mjs; /api/operations/board | Comprobado localmente: QR real decodificado desde vídeo de prueba, servicio/horario/operadora,200/409 concurrente/repetido y estado pasajero actualizado. Cámara física aún sin certificar. |
| Historial | standard-operations.mjs, standard-reservations.mjs; /api/operations/history y /api/bookings?cursor | Páginas100/20 con privacidad y persistencia comprobadas localmente. D1 fuente de verdad. |
| Premium | premium-*.mjs, premium/, miniapp/ | Funciones P1–P6 preexistentes conservadas. Regresión local; no ampliación ni certificación comercial en esta etapa. Publicación pública comparte elegibilidad Alpha. |
| Seguimiento/SOS/avisos | standard-operations.mjs, standard/tracking.mjs | Persistencia/permisos comprobados; posición, pago, avisos y SOS siguen SIMULADOS. No integración de emergencias ni mensajes automáticos. |

## Infraestructura existente

- rutasec-web-dev: Workers Static Assets, entrada Standard, copia independiente /demo/, service binding STANDARD_API. Catálogo/reservas funcionales usan D1, no ledger R2 del demo.
- rutasec-api-dev: D1 rutasec-dev y R2 rutasec-dev-files. Migraciones0015–0020 aditivas para esta entrega; no recrear bases ni buckets.
- rutasec-admin-dev: hostname administrativo existente, binding a la misma API y ACL global independiente.
- rutasec-parity-dev-files: ledger de paridad separado, sin reutilizarlo para asientos Alpha.
- GitHub Pages, sus fuentes originales, workflow y API demo externa permanecen intactos. Solo la copia generada para Cloudflare ajusta aislamiento de caché/rutas.

Antes de la entrega, health remoto seguía0014 y /auth/config devolvía google=false,email=false. No confundir este código local con despliegue: consultar el snapshot de entrega más reciente y su run de Actions.

## Criterios obligatorios para aceptación real

1. Activar un cliente OAuth Google real con callbacks de web/admin y un remitente/transporte de correo autorizado en el Worker existente. Comprobar recepción, código, login, cambio/recuperación y revocación reales. Nunca sustituirlos por sesiones sintéticas remotas.
2. Autoridad global demuestra su buzón preautorizado; operador distinto completa expediente y revisión manual. Verificar que el correo confirmado no equivale a habilitación documental.
3. Teléfono/sesión A publica una salida real de prueba y una recurrencia corta. Sesión B, independiente y de pasajero real, encuentra solo esas publicaciones, elige plaza, indica contacto y confirma pago SIMULADO.
4. A ve manifiesto y plaza descontada. Con dos compradores concurrentes, el mismo asiento admite una sola confirmación; al agotar capacidad desaparece de búsqueda. Repetir peticiones no duplica reservas.
5. A escanea el QR en una cámara física y registra un único embarque dentro de la ventana. Repetir QR y QR ajeno/cancelado/otra salida deben rechazarse. B refleja EMBARCADO sin depender de A ni de localStorage.
6. Recargar, cerrar sesión y abrir desde otro teléfono con la misma cuenta mantiene boleto, contacto, estado e historial. Otra cuenta no puede abrir boleto/documentos ni operar servicios ajenos.
7. Cancelación, horario/vehículo en conflicto y fin de recurrencia conservan reservas/eventos. Verificar cuentas móviles360/390px y escritorio, permiso denegado/cámara ausente, conexión interrumpida y recuperación sin doble compra.
8. Registrar resultados reales, dispositivos, entorno/commit/run y límites. Mantener los pagos simulados; no declarar la Alpha aceptada hasta completar estos puntos.

## Continuación y rollback

Corregir cualquier fallo de CI/despliegue antes del piloto; luego resolver configuración Google/correo y ejecutar el circuito real. Apple, Premium adicional, pasarelas reales y GPS/SOS integrados quedan posteriores. Respaldo/restore remoto actual no certificado; no programar exportaciones automáticas. Migraciones aditivas preservan registros: un rollback de API/assets debe respetar los datos existentes, sin borrar QA ni rebajar validación para aparentar funcionamiento. Registrar decisión de rollback y comprobar health/catálogo/permisos/demo después.
