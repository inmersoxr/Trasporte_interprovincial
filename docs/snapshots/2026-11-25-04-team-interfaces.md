# Equipo y accesos — interfaz y pruebas


## 04 — interfaz de equipo y roles preparada para publicar (2026-11-25)

Implementación conectada a membresías, cuentas y recursos existentes. Equipo y accesos se abre desde Empresa; una acción Invitar persona, funciones adicionales progresivas, ficha/vehículo recuperados, nombre/teléfono reutilizados, WhatsApp directo por número o selector de contactos nativo cuando existe, compartir nativo y copia secundaria. Aceptar vincula cuenta/ficha/vehículo y entra en la interfaz autorizada. Vista previa de funciones sin suplantación, CAS/revisión de conflictos, revocación que conserva datos. Listas estables durante menús/edición; polling operativo no desmonta el equipo.

Superficies adaptadas: pilot, business, Standard y cuenta usan capacidades/etiquetas reales. Finanzas no carga primero un mapa no autorizado; conductor ve Hoy/Mi semana; ventas no ve nómina; flota ve personal básico sin remuneraciones; propietario consulta solo GPS/historial de vehículos concedidos, aunque también tenga contabilidad. Un permiso de metadatos de vehículos no amplía el alcance de GPS. El conductor por salida prevalece sobre el habitual. Los boletos de oficina dejan de ser accesibles al emisor revocado; sus compras personales web se conservan.

Pruebas locales PASS: roles, invitaciones concurrentes/idempotentes, propietario protegido, revisión/edición/revocación, aislamiento, identidad dosPremium/Standard, acceso empresarial, QR/GPS, Alpha navegador55s, empresa11s, Ground19s. Navegador de equipo20s: alta real de cuenta, recurso vinculado, publicación, cambio a ventas/finanzas/flota/propietario y revocación; móvil390 y escritorio1280, sin desbordamiento, fallo503 conserva formulario. Capturas locales revisadas. Ground necesitó esperar la carga real del formulario tras hacer la navegación asíncrona; no se relajaron sus aserciones.

EN PRUEBAS de integración/publicación: workflow conserva todas las pruebas y añade test:organization-team-local como undécimo recorrido; health objetivo0040_organization_invitations. Migraciones0038–0040 aditivas, sustituyen solo vistas/triggers de autorización; no eliminan datos ni cambian membresías durante despliegue. No se ha publicado aún esta entrega.

Continuidad: publicar y comprobar este hito; completar el tema empresarial en pilot/conductor (gap03 detectado), después propietarios/fichas05, asignaciones06, programación07–08, calendario09 y restantes tareas10–13. No cerrar el plan completo ni certificar sensores físicos. Google/correo/SRI reales requieren su configuración/validación independiente; pagos siguen simulados.
