# Experiencia de RutasEC

Principio: registrar una vez, recuperar información y mostrar una acción principal según el trabajo que se realiza. El demo es referencia de claridad, no un conjunto de datos ni un backend para reutilizar.

## Navegación

Pasajero: buscar → salida → asiento → datos → pago simulado → boleto → seguimiento. Operadora: viajes/publicación, vehículos/conductores, reservas, empresa y gestión empresarial contextual. Standard/Premium se conservan como modalidades, sin esconder la publicación. Conductor: Hoy/Mi semana y acciones sobre asignaciones autorizadas. Administración global sigue separada y protegida. Menú inferior en móvil; navegación lateral y mayor densidad útil en escritorio.

## Formulario de publicación

Tres grupos visibles:1recorrido/horario,2vehículo/equipo,3tarifa/embarque. Un vehículo guardado recupera sus datos y oculta los campos de nueva unidad. Sin crear personas ni invitar cuentas durante la publicación. Otra persona responsable es opcional y solo aparece si hay empleados. Terminales/paradas/autorización e indicaciones son progresivos. El servidor mantiene autorización e inventario como fuente de verdad.

## Administración

Conservar todos los destinos, agrupados por operación, equipo/flota y clientes/finanzas. Una lista contextual reemplaza la exposición simultánea de todos los módulos. No inventar propietarios, permisos, nóminas o calendarios que el backend no soporte. Cada fase restante requiere implementación y pruebas propias.

## Estados y continuidad

Guardar muestra resultado concreto; errores conservan campos. Polling no reemplaza pantallas sin cambios ni interrumpe edición. Navegación mantiene empresa, modalidad y destino en URL; Volver/recargar deben recuperar contexto. Compartir mantiene el enlace durante las actualizaciones.

## Validación

Probar interacción real en390/1280, controles legibles, navegación con teclado, sin desbordamiento, persistencia y circuito transaccional existente. Comparar capturas y documentar fallos. La aceptación funcional de un módulo no acredita que todas las fases del producto estén terminadas.

## UX-02 — contexto empresarial compartido

EN PRUEBAS de publicación. Administración empresarial e identidad recuperan el mismo marco visual de operadora: logo/contexto, jerarquía de títulos, navegación inferior móvil/lateral escritorio, acciones contextuales y listas sin cuadrículas de funcionalidades. Tema de empresa y colores de seguridad se conservan. Regreso empresarial lleva a Empresa; iconos SVG reutilizados por consola y empresa con aria-hidden, sin alterar nombres accesibles. Formularios, borradores, clientes, cobros de prueba, nómina y mantenimiento existentes reutilizados. Sin cambios de base, API o permisos.

Pruebas: enterprise-localPASS10s en360/390/1280 y identity-localPASS9s con borrador/publicación/recorte. Se corrigió CSS pseudocontent que alteraba nombres accesibles. UX-01 continúa en Actions45505096489; completar ambos despliegues/evidencias antes de declarar publicado. Fase02 global no se cierra por estos hitos: resta consolidar navegación entre todas las superficies/roles y revisión de pasajero. Todo el plan permanece abierto según cada criterio, no limitarlo al piloto.

## UX-01/UX-02 publicados — 2026-11-24T23:05Z

UX-01 fuente4f5bbe77c8b520063798dfb814933ea759ec8045/Actions45505096489 verify/deploy SUCCESS. UX-02 fuente986224b08fbee3b2a06be15fb05b4ed761dc506d/Actions45505867765 verify/deploy SUCCESS. Cada entrega conserva81pruebas y10recorridos navegador. Sin migraciones, cambios de permisos, cobros ni modificación de datos del demo.

API7b5a8e5e-22e5-432b-91cf-5ddf54e76449; webc168e2e2-bfff-4515-a20a-7d1a17c8bd92; admin5f20b899-c00b-4a7c-a326-a6b131ab5d57. Verificación remota200/coincidencia fuente de app/CSS/template de operadora, marco empresarial/iconosSVG y businessapp. Health0037/D1R2true/pagosdisabled. Pages200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f permanece intacto.

UX-01 yUX-02 VALIDADA en su alcance de operadora/empresa, con interacciones y capturas390/1280, rutas de publicación/compra/QR/embarque/GPS, financiero, nómina, mantenimiento e identidad. Evidencias: docs/evidence/2026-11-24/ux/. No se crearon registros de prueba en la plataforma pública ni se acreditan sensores físicos.

Fase02 global EN DESARROLLO: siguiente02.02C coherencia de pasajero/sesión/retorno y02.07 validación transversal de accesibilidad/roles. Luego seguir fase03/04 y dependencias de PLAN, reutilizando identidad y APIs existentes. Roles granulares/múltiples, propietarios, asignaciones temporales, programación multivehículo y calendario completo siguen pendientes; consultar FULL_PLAN_EXECUTION.md. No cerrar todo el plan ni presentar estos accesos como funciones ya completadas. Fuente válida es rama activa/commit986224b; root local conserva trabajo S1 diferido no publicable.

URL principal https://rutasec-web-dev.drbrownlabs.workers.dev/pilot/ . Menú inferior móvil y rail escritorio, creación agrupada y recuperación de vehículo, sin duplicar datos ni módulos.

## UX-03 — tarea02.02C pasajero y retorno

EN PRUEBAS de publicación. Reserva agrupada en asientos/datos/pago, selección explícita de piso en vehículos de dos pisos conservando asientos de ambos pisos, estado de asiento actualizado durante polling, boleto con jerarquía legible. Botones de piso son typebutton y no confirman compras; selección/pago/inventario/QR siguen siendo los existentes. Cuenta de operadora incluye returnTo con empresa/modalidad/destino, validado por return-path existente.

Presentación/QR/cámara/GPSPASS24s; bus70/tramos/compra y ventanilla verificados tras seleccionar Piso2 en ambos canales. Sin migraciones, cambios de API, permisos ni cobros reales. Continuar fase02 transversal y validación de identidad existente, luego fase04autorización/equipo; no presentar roles avanzados o propietarios como implementados.
