# I1 — personalizados inscritos, elección libre y avisos

Usuario autoriza una entrega integrada con los hallazgos anteriores y el mercado espontáneo. Después descarta expresamente WhatsApp: solo avisos propios y push. Misma infraestructura, cuenta y app; Pages intocable y pagos simulados.

Estado inicial comprobado: rama funcionalf2c89af9ba13691f35c5b4db248191de5c4e5be6; main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a; fuente desplegada128d5c62/esquema0021. Mercado competidor existente con rutas obligatorias y solicitud inmediata5min, sin inscripción ni push.

Implementación LOCAL: migración0022, inscripción por ciudades/vehículos y pausa; eliminación de ruta publicada como requisito Alpha; huecos de calendario, recogida5–120min, solicitud inmediata abierta30min; selección atómica conserva elección del pasajero. Avisos D1 transaccionales y privados; suscripciones por dispositivo, VAPID sin carga privada, validación de destinos, leasing/reintentos/limpieza410 y cron. Provisión de claves en Worker existente mediante CI, sin imprimirlas ni duplicar infraestructura. No WhatsApp ni nuevo sistema de autenticación.

Pruebas dirigidas iniciales5/5 PASS35.5s; evolución11/11 PASS76.8s junto con onboarding/operación/equipo; prueba final dispatch3/3 PASS18.6s cubre dos operadoras, elección de la segunda propuesta, pausa, hueco antes de un mantenimiento posterior, avisos correctos, aislamiento, firmaES256, carrera de despacho,503/reintento y410. Datos solo locales. UI en Viajes/Personalizados, Reservas/Solicitudes y Avisos. Estado remoto y CI se cerrarán en snapshotzz4.

Rollback: conservar tablas/avisos/inscripciones/cotizaciones/reservas. Desactivar recepción/push o volver UI compatible; no borrar ledger ni revivir ofertas seleccionadas. Evitar reactivar QA públicamente. Claves no se rotan automáticamente. Límites de entrega y permisos del dispositivo en INTEGRATED_OPERATIONS.md.
