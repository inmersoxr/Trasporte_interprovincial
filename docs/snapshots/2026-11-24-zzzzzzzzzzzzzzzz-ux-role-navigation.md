# UX-04 — interacción y navegación de roles actuales


## UX-03 publicada / UX-04 en validación

UX-03 (02.02C) VALIDADA en su alcance: fuente a87c850060cc0887c979a1e59577008a76ca490a, Actions45507871842 verify y deploy SUCCESS (81 pruebas y10 recorridos navegador). Publicación comprobada en cinco recursos de reserva/pago/asientos, D1/R2 activos, esquema0037, pagosdisabled. Pages conserva hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f. Evidencia remota en docs/evidence/2026-11-24/ux/publication-checkout.json.

UX-04 (02.07 parcial) EN PRUEBAS: acceso empresarial sin sesión conserva retorno al login; conductor entra en jornada sin exponer navegación administrativa; Hoy/Mi semana mantiene URL al recargar; periodo y vacío se describen correctamente. Durante guardado empresarial se desactiva la siguiente acción principal hasta terminar la actualización, evitando un clic sin respuesta. Los errores posteriores al cierre del diálogo aparecen en el estado de pantalla. Reutiliza autenticación y permisos existentes; NO implementa aún los ocho roles/multirrol del plan.

Pruebas nuevas locales: invitación de conductor aceptada por cuenta nueva con una de cuatro unidades; solo una salida visible y dos destinos, retorno desde enlace empresarial; teclado en selección de piso no envía reserva; selección se conserva entre pisos; fallo503 al guardar vehículo conserva datos y permite reintento. Prueba inicial de creación rápida de cuatro empleados falló esperandoPersona3; otras ejecuciones pasaron. Se añade diagnóstico y se corrige ventana de interacción mientras refresh sigue en curso; confirmar regresión completa antes de publicar. Sensores físicos y matriz avanzada siguen pendientes.

Continuidad: no cerrar Fase02 global ni04 por este cambio. Mantener171tareas y seguir docs/FULL_PLAN_EXECUTION.md. No migraciones ni cambios de backend/alcance de permisos; conservar Pages y pagos simulados.
