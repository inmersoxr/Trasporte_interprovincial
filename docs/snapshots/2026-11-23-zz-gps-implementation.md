# GPS — implementación y activación en curso

Plan comunicado: reutilizar Leaflet/OSM y API existente, GPS autenticado/asignado/historial, cola offline, visor sin coordenadas ficticias, enlaces temporales y contrato nativo. Baseline remoto c45aaf872d0187eeee2c4ae877e32ff0b506a77f, main0e893488 intacto; conservar cambios locales previos. Guía GPS_PILOT.md.

Migración0026 aditiva, handler/cliente/cola nuevos, integración en estado de viaje/inicio, SW y pruebaGPS adicional en CI. No publicar S1/0025 ni cambios de reservas/catálogo/tareas pospuestos. Infraestructura existente, sin recursos duplicados ni proveedor de mapas pagado. Pruebas y resultado remoto se registran al cierre; un commit no acredita deploy.

No hardware GPS físico disponible en este entorno; ubicaciones de pruebas siempre emuladas. No afirmar dos teléfonos reales ni background nativo. Acceso Google/correo pendientes según auditorías anteriores. El GPS del piloto PWA requiere aplicación abierta.
