# Guía vigente

La organización actual de Standard/Premium y el circuito están en [OPERATOR_WORKSPACE.md](OPERATOR_WORKSPACE.md). La guía siguiente conserva la entrega simplificada anterior para trazabilidad; ya no describe todo el menú.

# Piloto simple: mismo formulario del demo, datos persistentes

## Cómo probarlo

1. Abrir https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Entrar con teléfono o correo y contraseña existentes; crear la empresa si aún no existe. Sin códigos de verificación durante el piloto.
2. En el menú inferior tocar **Crear viaje**. Completar origen, destino, fecha, hora, tipo/modelo de vehículo, capacidad, precio y punto de embarque. Se puede seleccionar un vehículo guardado. No se necesita conductor, invitación ni placa para una prueba.
3. Tocar **Publicar viaje**. No se generan viajes predeterminados ni programaciones sin pedirlas. La salida aparece en Mis viajes y en el marketplace.
4. En otro teléfono/sesión abrir https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Elegir la salida y el asiento, completar datos y confirmar pago SIMULADO. La reserva y el QR se guardan en el servidor; el asiento deja de estar disponible globalmente.
5. El operador abre su salida, toca **Escanear pasajeros**, permite la cámara y escanea el QR. El embarque queda registrado; un segundo uso se rechaza.
6. Tocar **Comenzar viaje y activar GPS**, permitir ubicación y mantener la app visible. El pasajero puede abrir y compartir el seguimiento temporal. No hay posiciones generadas; sin señal se conserva la última captura confirmada.
7. **Finalizar viaje y volver a mi jornada** termina el servicio y cierra el enlace público, conservando registros.

Embarque/inicio: probar con salida cercana (ventana de dos horas antes/después). Pagos sin cobros. GPS web puede interrumpirse con pantalla apagada o segundo plano.

## Alcance técnico

Se copia únicamente el markup del formulario real de bookings.mjs operatorSkeleton en pilot/demo-template.mjs y se reutilizan styles.css/bookings.css. Cloudflare conecta ese formulario a los módulos existentes; no se modifica el demo comercial. Backend sigue siendo Workers + D1 + R2 compartidos. Migración0031 aditiva modifica solo triggers de elegibilidad del piloto para no exigir asignación/documentación; el resto de controles de aislamiento, inventario y boletos se mantiene. No se borra ninguna entidad. No se incluyó S1/0025.

La recurrencia y los módulos empresariales existentes se preservan en el código y los datos; no son prerrequisitos ni parte del formulario básico. El plan maestro permanece vigente para etapas posteriores.
