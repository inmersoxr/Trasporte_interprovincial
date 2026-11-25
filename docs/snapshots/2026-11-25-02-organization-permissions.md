# Permisos empresariales y alcance por salida


## 04.03–04.10 — permisos operativos y empresariales (backend en pruebas)

Integradas capacidades en publicación, cambios, manifiestos, reservas, ventas, finanzas, nómina, mantenimiento y GPS. Scopes0039 aplican lectura por recurso y operación por salida; el conductor vinculado a la salida tiene prioridad sobre la asignación habitual del vehículo. Un permiso de lectura de flota combinado con conductor NO concede conducción de todas las unidades ni manifiestos ajenos. Base memberships heredada conservada como ancla mínima; sin nuevas invitaciones/roles expuestos aún.

Pruebas Worker locales: regresión5/5 (empresa, acceso operativo, embarque yGPS), contrato de acceso y nuevo recorrido de roles PASS. Agente de ventas vende con inventario real/pago simulado pero no accede a nómina ni opera viajes; contabilidad maneja finanzas/personas laborales, no inicia viajes ni veGPS; flota obtiene datos básicos de empleados sin remuneraciones; conductor por salida recibe manifiesto y opera aunque otro sea habitual. Revocación retira acceso inmediatamente. SQL de GPS y asignación verifica permisos en transacción. Prueba inicial usó una ruta sin puntos de embarque y una venta sin teléfono: se corrigieron los fixtures; no se relajaron validaciones.

Pendiente del mismo hito: Equipo y accesos con invitaciones/edición/revocación, selección de recursos y navegación según capacidades, pruebas navegador y despliegue. No marcar fase04 completa sin esas pruebas. Baseline82/82 anterior PASS; ejecutar batería integrada nuevamente tras completar el hito.
