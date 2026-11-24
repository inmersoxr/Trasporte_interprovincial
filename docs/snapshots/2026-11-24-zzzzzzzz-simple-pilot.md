# Prioridad simplificada del propietario — 2026-11-24

La instrucción más reciente reemplaza los prerrequisitos de conductores/invitaciones para esta entrega. Circuito único: crear empresa → crear/publicar viaje con el formulario del demo (vehículo y plazas incluidos) → compra persistente desde otra sesión → QR → operador escanea/inicia/GPS/finaliza. Navegación inferior de app. No exigir alta de conductores, aceptar invitaciones, registrar previamente flota ni verificar contactos para publicar en el piloto. Mantener cuentas/permisos básicos existentes, pagos simulados y demo Pages intacto. Plan completo conservado para después; no borrar datos ni funciones históricas.


## Estado

Implementación en pruebas: formulario copiado del demo, menú inferior, vehículo/capacidad al publicar, no conductor/invitación/placa obligatorios, QR y GPS con operador. Cinco pruebas dirigidas PASS incluyendo publicar vehículo sin conductor y revisión documental normal intacta. No declarar desplegado hasta comprobar Actions/health y activos remotos. Referencia de restauración f57662b32a152279cb17eb9c3cec40594e4035b7; no se exportó/restauró ni borró D1.

## S0 publicado y comprobado — 2026-11-24T10:15Z

Fuente45ed4b3d1ffa768de1eca995cb58cd7216560e10, Actions45372210818 verify/deploy SUCCESS.74 pruebas y8recorridos navegador PASS, incluido empresa→formulario del demo→vehículo/capacidad sin conductor/invitación/placa→publicación→compra independiente→QR→escaneo del operador→inicio/GPS→seguimiento público→finalización. Prueba local específica PASS23.66s; no se crearon datos de prueba en público.

/pilot/ confirmado públicamente con schema0031_simple_pilot, revision simple-pilot-v1, D1/R2true, pagosdisabled. Activos app/CSS/template/GPS coinciden byte a byte con el árbol probado. Chromium anónimo390/1280 confirma entrada/registro sin errores ni desbordamiento; dashboard401 sin sesión. Los fallos iniciales de acceso desde runner se debieron al proxy/CA del entorno; se configuró el proxy en el navegador de verificación, sin modificar TLS de la aplicación.

API3f8456a1-ac3a-45f6-84d9-209e9fe2bffb; web682d6e21-63d1-4bc6-ab90-0ff5f3370604; admina910e256-68d9-4787-9976-4ace29837ea3. Migración0031 aplicada sin borrar datos; D1 Time Travel metadata comprobada sin exportar/restaurar. Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y PagesHTTP200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intactos. No se desplegó el trabajo descartado de invitaciones.

S0-UI/API/despliegue VALIDADA en entorno de desarrollo; S0-FISICO PENDIENTE con teléfonos/cámara/GPS reales. Geolocalización/vídeo emulados no acreditan sensores físicos ni conducción. La aplicación transmite ubicaciones del dispositivo y no inventa posiciones; mantener el navegador visible. Cuenta normal existente conserva permisos; no se requiere crear conductores ni nuevos roles. Pagos simulados, sin cobros.

URL: https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Menú inferior Mis viajes / Crear viaje / Mi empresa. Marketplace: https://rutasec-web-dev.drbrownlabs.workers.dev/standard/ . Guía: docs/PRESENTATION_PILOT.md. Evidencias: docs/evidence/2026-11-24/simple/. Plan completo sigue vigente, fuera de este circuito no se dan por cerradas las fases.
