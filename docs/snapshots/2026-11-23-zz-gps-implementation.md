# GPS — implementación y activación en curso

Plan comunicado: reutilizar Leaflet/OSM y API existente, GPS autenticado/asignado/historial, cola offline, visor sin coordenadas ficticias, enlaces temporales y contrato nativo. Baseline remoto c45aaf872d0187eeee2c4ae877e32ff0b506a77f, main0e893488 intacto; conservar cambios locales previos. Guía GPS_PILOT.md.

Migración0026 aditiva, handler/cliente/cola nuevos, integración en estado de viaje/inicio, SW y pruebaGPS adicional en CI. No publicar S1/0025 ni cambios de reservas/catálogo/tareas pospuestos. Infraestructura existente, sin recursos duplicados ni proveedor de mapas pagado. Pruebas y resultado remoto se registran al cierre; un commit no acredita deploy.

No hardware GPS físico disponible en este entorno; ubicaciones de pruebas siempre emuladas. No afirmar dos teléfonos reales ni background nativo. Acceso Google/correo pendientes según auditorías anteriores. El GPS del piloto PWA requiere aplicación abierta.

## Pruebas locales
BackendGPS PASS, incluyendo conductor miembro sin asignación rechazado, pasajero/comprador sin permiso de emisor403, muestras idempotentes y atrasadas, límites y horas futuras, historia privada, token hash/TTL/revocación/fin. ChromiumGPS emulado PASS34.1s: cambio de ubicación, fallo y recuperación de transporte, cola IndexedDB, otra sesión pública y ruta vial usando geometría OSM grabada como fixture explícita. Captura gps-public-390.png local. Alpha existente PASS58.4s. Regresión local67/67 PASS245.9s incluye S1 local; CI remoto de esta entrega debe ser66, sin S1.

Fallos/correcciones de pruebas: transporte de sesión del nuevo fixture tenía una variable de Request que ocultaba el runtime; se corrigió sin relajar autenticación. Caso de cola esperaba nueva muestra antes del intervalo estacionario10s: se ajustó la espera a11s; no se forzó GPS ni se falsificó la cola. Las verificaciones finales pasaron. ProviderOSRM real consultado sin datos de usuarios: HTTP200/codeOk/ruta1 Cuenca–Guayaquil. No equivale a GPS físico.

CódigoGPS40ef329b796dcd538f4bb5b8dd322bb188a4a66c, run45245573221 en curso al registrar. Pages SHA256c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f idéntico. Sin cambios de datos financieros ni publicaciones remotas de prueba.

## Primera activación y corrección final
Run45245573221 SUCCESS:66 tests y cuatro flujos Chromium (Alpha, correo, plataforma y GPS). Migración0026/API/web/admin desplegadas, healthlive-gps-v1/D1/R2true. HTTP privado401, token desconocido404 y assets GPS200; auth/config mantiene Googlefalse/emailfalse/pushtrue. No se crearon datos GPS sintéticos remotos.

Revisión final encontró fallback del visor antiguo en enlaces de viaje inexistentes: se bloqueó, se añadió caso navegador y pasó30.9s. Se retiró después todo movimiento simulado del visor Standard (el demo comercial sigue intacto), se distingue rumbo desconocido con punto en vez de flecha, y una caída de conexión conserva última posición/antigüedad sin ETA aparentemente vigente. Navegador finalGPS PASS30.3s. Fuente final2d68c51ebdbed2005f3930596fce7ef2c06ef758 sometida a CI antes del cierre definitivo.

Ajuste de texto final: el aviso heredado de inicio del API mencionaba simulación; el cliente muestra ahora inicio real condicionado al permiso GPS, sin declarar que se transmite si se rechaza. Los pagos continúan rotulados SIMULADOS. Fuente de entrega347d595da5cdf27810c3512884449f708046cb3e, CI en curso. No cambian reglas de manifiestos/reservas/pagos.

Costo/límites: muestras5–10s, lote50, lectura7s visible, ruta externa una vez por pareja/visor y reintento mínimo1min. D1 añade escrituras e índices por muestra; no hay medición de carga comercial, alta de plan ni infraestructura duplicada. No afirmar operación de flota ilimitada dentro de cuota gratuita. Rollback de fuente/API/activos por CI preservando tablas0026; no DROP ni restauraciones destructivas. Rollback no ejecutado en esta entrega.

Revisión de visibilidad en recorrido largo: mapa recentra al vehículo si la última posición confirmada sale del área visible, sin interpolar su ubicación. Chromium con desplazamiento mayor y cola offline PASS32.0s. Prueba backend del conductor: asignación activa permite transmitir y registra su actor; retirada de asignación rechaza nuevos envíos, PASS7.3s. Fuente congelada75d0dee957b551fe62caef49f8398ebc454e4ceb sometida al último CI y despliegue.

## Cierre definitivo
Fuente75d0dee957b551fe62caef49f8398ebc454e4ceb, https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/45248557135 SUCCESS. Verificación66/66 PASS y cuatro recorridos Chromium PASS; GPS26.2s en CI final. Migración0026, API/web/admin existentes desplegados; no0025 ni cambios de reservas/catálogo/tareas S1. HTTP:healthlive-gps-v1/schema0026/D1/R2true, pagosdisabled, privados401 y capacidades desconocidas404. auth/config Googlefalse/emailfalse/pushtrue.

Remoto navegador PASS: raíz/menú de cinco destinos,360/390/1280 sin desbordamiento, token inválido cerrado, enlace de viaje inexistente sin vehículo de demo y sin erroresJS. gps.mjs/gps-queue.mjs/tracking.mjs/operations.mjs públicos coinciden byte a byte con archivos fuente; SW incluye nuevos módulos. OSMtile real200/PNG256 y proveedorOSRM200/codeOk/ruta1 comprobados sin enviar ubicaciones de usuarios. Pages conserva SHA256c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f y main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a.

NO se cargaron posiciones/cuentas/reservas de prueba en D1 remoto. No se prueba GPS físico ni dos teléfonos reales: pruebas emuladas aisladas de la base desplegada. No APK ni servicio Android implementado; preparación documentada/contrato/permisos. Alta real de nuevas cuentas sigue dependiendo del correo/Google externo. No se declaran resueltos esos bloqueos ni producción comercial. Aplicación: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/.
