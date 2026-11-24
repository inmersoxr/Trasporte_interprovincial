# Prioridad simplificada del propietario — 2026-11-24

La instrucción más reciente reemplaza los prerrequisitos de conductores/invitaciones para esta entrega. Circuito único: crear empresa → crear/publicar viaje con el formulario del demo (vehículo y plazas incluidos) → compra persistente desde otra sesión → QR → operador escanea/inicia/GPS/finaliza. Navegación inferior de app. No exigir alta de conductores, aceptar invitaciones, registrar previamente flota ni verificar contactos para publicar en el piloto. Mantener cuentas/permisos básicos existentes, pagos simulados y demo Pages intacto. Plan completo conservado para después; no borrar datos ni funciones históricas.


## Estado

Implementación en pruebas: formulario copiado del demo, menú inferior, vehículo/capacidad al publicar, no conductor/invitación/placa obligatorios, QR y GPS con operador. Cinco pruebas dirigidas PASS incluyendo publicar vehículo sin conductor y revisión documental normal intacta. No declarar desplegado hasta comprobar Actions/health y activos remotos. Referencia de restauración f57662b32a152279cb17eb9c3cec40594e4035b7; no se exportó/restauró ni borró D1.
