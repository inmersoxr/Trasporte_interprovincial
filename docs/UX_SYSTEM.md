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
