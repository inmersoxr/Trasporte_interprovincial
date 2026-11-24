# Piloto de presentación — circuito prioritario

Prioridad explícita del propietario: entregar ahora el circuito funcional sin esperar pruebas físicas de cada fase. El plan171tareas y requisitos completos se conservan; no se consideran completados por esta entrega. No crear registros ficticios en catálogo remoto. Android/OTA/GPS nativo permanecen pospuestos.

## Entrada única

https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/

También desde Marketplace → Operadores o Mi cuenta → empresa. Una aplicación y un backend/D1; la pantalla se adapta a la membresía, sin suplantar identidades. Google/correo de verificación no bloquean el acceso de piloto: teléfono internacional o correo y contraseña, sin código mientras la configuración de piloto esté activa.

## Preparar la demostración

1. **Administrador:** entrar o crear cuenta, escribir nombre comercial y ciudad base, confirmar pruebas con pagos simulados. Si la empresa ya existe, habilitar sus pruebas una vez. No se marca documentación como verificada ni se crean licencias/documentos ficticios.
2. **Vehículos y equipo:** registrar cada vehículo real con placa, modelo, tipo y plazas. Escribir nombre del conductor y crear invitación para ese vehículo. Compartir con WhatsApp o copiar el enlace. El enlace caduca24horas, admite una persona y puede revocarse; enviarlo solamente al conductor correspondiente. Si se genera uno nuevo para el mismo vehículo, el pendiente anterior se revoca. Copiar/enviar antes de salir, pues el servidor conserva solo el hash del enlace.
3. **Conductor:** abrir su invitación en su teléfono, entrar o crear su propia cuenta, aceptar. La asignación se aplica al vehículo indicado. Ve **Hoy** y **Mi semana** (próximos7días), no la gestión empresarial ni los viajes de otro vehículo. La administración puede reasignar a conductores miembros o retirar acceso; no se permite reasignación durante un viaje en curso.
4. **Administrador → Crear un viaje:** elegir vehículo; conductor/capacidad se recuperan. Elegir origen/destino, hora de Ecuador, precio, duración y puntos de encuentro/llegada. La opción inicial es Solo este viaje. Opcionalmente elegir Cada día, Cada semana (seleccionar días) o Cada mes y fecha final. Revisar salidas muestra todas las fechas sin publicar; confirmar publica únicamente las salidas elegidas. Máximo90días/90salidas por programación; los meses sin el día elegido se omiten. No puede publicarse con un conductor pendiente de aceptar. Una programación genera salidas independientes, con calendario e inventario existente. Para ida y vuelta publicar otra programación en sentido contrario, dejando tiempo suficiente para completar la ida.
5. **Pasajero de pruebas:** abrir Marketplace en otra sesión/teléfono, buscar la salida, elegir asiento, proporcionar nombre/contacto, aceptar prueba y confirmar **pago SIMULADO**. Recibe boleto QR en Mis viajes; recarga y disponibilidad se mantienen en el servidor.
6. **Conductor:** en su salida de Hoy tocar Escanear pasajeros y Abrir cámara. Permitir cámara. El lector existente decodifica el QR y el servidor valida viaje, conductor, estado y uso único. El pasajero ve EMBARCADO; segundo escaneo se rechaza. Hay ingreso manual como respaldo si no puede utilizar cámara.
7. Tocar **Comenzar viaje y activar GPS**; permitir ubicación. Se abre el mapa y se inicia captura del dispositivo. Mantener esa pantalla abierta durante el recorrido; la PWA puede suspender GPS con pantalla apagada o en segundo plano. No se inventan posiciones.
8. La administración ve juntos vehículo, conductor, ocupación y estado de todos sus viajes y un mapa conjunto de las unidades en curso. Sin GPS aparece Sin ubicación confirmada. Pasajeros pueden ver el estado/mapa de sus viajes. El pasajero puede compartir seguimiento temporal; el receptor no necesita cuenta. Última captura real visible aun sin nuevas posiciones; cola de envío y recuperación de conexión reutilizan módulo existente.
9. En el mapa, **Finalizar viaje y volver a mi jornada** cierra el servicio y el enlace público. El historial se conserva.

**Para la presentación:** crear una salida cercana al momento de prueba. Embarque/inicio se habilitan desde2horas antes hasta2horas después de la salida. Una salida publicada para el día siguiente se ve en Mi semana pero no ofrece iniciar prematuramente. Los viajes deben provenir de publicaciones reales de los participantes; no se prellenó el marketplace.

## Reutilización y cambios

- Reutilizados: auth/sesiones/cuentas piloto, usuarios y memberships, vehicles, premium_invites/assignments/branches, route_offers/departures/recurrencia, inventario/boletos/QR, cámara jsQR, operaciones, GPS/mapa/IndexedDB y tokens compartidos.
- Nuevos: vista agrupada /pilot/ y aceptación /join/; API /api/pilot/ para preparación, vehículos, invitaciones, asignación, revocación, publicación y agenda. Pagos siguen simulados. Premium de prueba se habilita al preparar una empresa, sin cambiar un plan Premium activo vigente ni crear cobros.
- Migración0030 aditiva: pilot_operators/pilot_vehicles; metadatos vehículo/nombre/revocación en invitaciones y frecuencia/día mensual en programaciones existentes. Extiende guardias SQL solo a empresas/vehículos autorizados para pruebas, con cuenta de conductor activa y asignada. No altera vistas de documentación verificada. La aprobación documental real se conserva como proceso separado; el perfil no obtiene distintivo verificado por habilitar piloto.
- Corrección: finalización utilizaba meta.changes===1 y el trigger de revocar enlaces GPS podía sumar modificaciones, produciendo409 tras completar. UPDATE RETURNING comprueba la fila efectiva y conserva control de revisión.
- Ajustes UX: un menú de2destinos para administración y2para conductor; acciones de escaneo/inicio solo en ventana operativa; formularios conservan campos/reintentos; enlace compartible no desaparece por polling; errores de módulos administrativos no se presentan al conductor en el mapa; pantalla de viaje enfocada sin barra de pasajero superpuesta.

## Pruebas y límites

pilot-circuit.test.mjs: cuenta/empresa nueva sin fixture documental; dos vehículos y conductores invitados, agendas aisladas, siete salidas persistentes, publicación idempotente, dos usuarios por el mismo asiento(200/409), escáner duplicado(200/409), conductor ajeno rechazado, GPS y enlace público, revocaciones y cierre. No hay documentos ficticios ni badge verificado.

presentation-local.e2e.mjs: recorrido completo por la interfaz con cuentas independientes, invitación con registro/aceptación, publicación diaria elegida expresamente con vista previa sin escrituras, compra simulada/QR, lectura real jsQR desde píxeles de vídeo de prueba, GPS mediante geolocalización emulada del navegador, mapa pasajero/receptor anónimo, cierre y expiración. Capturas reales de escritorio/móvil. No sustituye cámara/GPS/vehículos físicos. Esas comprobaciones permanecen pendientes, sin bloquear mejoras y entrega técnica por orden del propietario.

Rollback: conservar backend compatible con contactos de piloto, cerrar operaciones activas y deshabilitar explícitamente las empresas piloto antes de retirar la nueva elegibilidad; no borrar reservas, usuarios ni tablas. Flags de portal no equivalen a revocar permisos persistentes por empresa. D1/Workers existentes, sin nueva infraestructura ni pasarela de pagos. Revisar ventana de recuperación nativa antes de restaurar datos; no se exportó ni restauró D1 para esta entrega.

Identidad: en Vehículos y equipo → Perfil e identidad de mi empresa se reutiliza el editor existente para descripción, contacto, logo y fotografías. El registro por teléfono no constituye autenticación WhatsApp ni verifica posesión del número. El piloto permite teléfono internacional o correo y contraseña; compartir por WhatsApp requiere acción del participante.
