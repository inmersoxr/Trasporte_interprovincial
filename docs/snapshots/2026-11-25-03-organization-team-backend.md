# Equipo conectado al sistema existente


## 04.11–04.18 — equipo: backend implementado, interfaz en desarrollo

0040 amplía las invitaciones existentes (premium_invites), sin otro sistema de cuentas. Invitaciones con varias funciones, ficha de conductor opcional, asignación vehicular y alcance de propietario; expiración, revocación, aceptación de cuenta nueva/existente y combinación aditiva de funciones. Administrador principal protegido y también puede ser conductor. Edición CAS y replay idempotente; revocar no elimina vehículos ni boletos/historial. Invitar no exige pago ni crea otra aplicación.

Permisos se comprueban también dentro de las transacciones: guardas de capacidad para registros empresariales y guardas por servicio para operación/GPS/embarque. Prueba5/5 PASS (equipo, roles, acceso operativo, gestión empresarial y distanciaGPS). Incluye carreras de aceptación y aceptación simultánea de invitaciones distintas sin perder roles. Interfaz y pruebas visuales todavía en desarrollo; no declarado desplegado.
