# Registro de pruebas de RutasEC

Cada entrada incluye ID/tarea, entorno, método, resultado, evidencia, límites y commit. No confundir pruebas de CI/locales con vehículos, conductores o teléfonos físicos.

## Evidencia previa reutilizable
- Premium/identidad: Actions45309144150 SUCCESS,69 pruebas y seis recorridos Chromium; Workers/D1/R2schema0028. Ver snapshot2026-11-24-zz-enterprise-delivery.md.
- Acceso/ojito: Actions45319595023 SUCCESS,69 pruebas y seis recorridos, más navegador remoto360/390/1280. Snapshot2026-11-24-zzz-account-password-mail.md.
- Google preparado ded3bb70: Actions45322538944 verify/deploy SUCCESS. Pruebas locales de JWT/PKCE/callbacks/provisión y Alpha con desafío de correo pendiente; falta consentimiento real/credenciales.
- No declarar validados: cuatro vehículos reales, cuatro conductores, GPS físico simultáneo, piloto entre teléfonos, envío real de correo o Google real.

## Pruebas de la tarea en curso
G-BRANDING: build local PASS; falta HTTP200 anónimo, navegación/legibilidad/capturas móvil y escritorio después de publicación.

## Política
Una compilación/captura por sí sola no valida funcionalidad. Registrar fallos y correcciones, concurrencia/aislamiento cuando corresponde, y dejar pendientes las pruebas físicas no ejecutadas. No sembrar datos falsos en catálogo público.

- 00.01: auditoría de lectura/contratos y evidencias existentes. Worker web/admin con proxy al mismo rutasec-api-dev; D1 rutasec-dev y R2 existentes; builds separados de Pages. No implica pruebas físicas nuevas.
