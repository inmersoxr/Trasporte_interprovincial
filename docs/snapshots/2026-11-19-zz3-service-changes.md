# I3 — cambios, inventario y renovación

Migración0024 aditiva: revisiones, auditoría de cambios, pasajeros cancelados, bloqueo de calendario también al actualizar y renovación opt-in de horarios. Código service-changes/recurring y sus pantallas usa el mismo backend.

Administración puede reprogramar o sustituir vehículo en salida futura sin embarques, reprogramar privados, editar tarifa/publicación de ruta para futuras ventas. Se conserva precio de boletos existentes y se avisa al comprador. El pasajero puede cambiar asientos o cancelar parte del grupo; reembolso simulado trazable y liberación de plazas. Posiciones/QR restantes estables; el QR cancelado no embarca. CAS y transacciones evitan cambios parciales, choques de calendario y doble asiento. Caducidad documental y capacidad se revalidan.

Renovación automática mantiene siete días futuros, sin duplicados y sin retirar reservas; detener conserva las reservadas. Los errores de renovación se muestran y supervisan. Lotes acotados a una programación por ejecución, máximo12 salidas por sentencia y siete días futuros, sin contratar un plan adicional. Tareas sin contenido personal en logs.

Pruebas dirigidas3/3 PASS27.8s junto con permisos; ampliadas8/8 PASS71.0s cubren calendario/precio/asientos/reembolso/QR estable, rollback de asiento ocupado, consulta de históricos, huecos y concurrencia. Después se agregó caso de privado fijo reprogramado yQRcancelado. El conjunto final/CI verifica versión exacta. Sin migraciones remotas todavía en este registro inicial; cierrezz4 prevalece.

Rollback: mantener revisiones/cancelaciones/auditoría; versión de API compatible que no reanime pasajeros cancelados. No volver a escáner anterior que ignore cancelled_at. No borrar reservas ni usar restauración destructiva.
