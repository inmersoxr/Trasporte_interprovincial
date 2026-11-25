
## UX-01 — recuperación de claridad y reanudación del plan completo

Usuario informa piloto presentado; rechaza UX vigente. Plan171tareas/fases00–13 y ampliaciónGROUND permanecen vigentes, no se dan por terminados. La aceptación de interfaz no se deduce de81tests funcionales.

02.01 AUDITADA: demo público consultado en navegador de solo lectura, sin POST, y comparado con operadora real mediante fixtures locales. Problemas: seis destinos Premium, directorio empresarial plano, doble selector de responsable, reconfiguración de vehículo ya guardado, pérdida de contexto por polling/navegación sin URL.

UX-01 EN PRUEBAS: menú móvil de cinco destinos, rail de escritorio; Crear viaje agrupa recorrido, vehículo/equipo y tarifa/embarque; recuperar unidad/plazas/conductor y ocultar reconfiguración/selector duplicado; responsable adicional solo con empleados disponibles; gestión agrupada por operación, equipo/flota y clientes/finanzas dentro de Empresa. Ningún módulo se elimina. Filtros de estado y métricas reales; enlaces con contexto e historial; no reconstruir pantallas cuando los datos no cambian; conservar mensaje de guardado. Formularios/cámara/pago/QR/GPS/backend existentes reutilizados. Sin migraciones ni cambios de permisos.

Pruebas locales: presentación PASS26s, operadora cuatro unidades/conductores/salidas/GPS PASS66s, bus dos pisos/tramos/ventanilla y navegación recarga PASS15s; capturas móvil390 y escritorio1280 revisadas. Se corrigió un borrado accidental de enlaces de Empresa al incrustar el directorio. No declarar despliegue hasta Actions y comprobación remota.

Fase02 global EN DESARROLLO: continuar coherencia entre consola principal, administración empresarial, identidad y pasajero; accesibilidad/errores y navegación por rol. Fases04–09 todavía tienen trabajo real: roles empresariales múltiples y alcance, propietarios, asignaciones temporales, generación multivehículo y calendario completo. No marcar esos módulos como completos por añadir accesos. Google/correo/SRI reales mantienen dependencia externa previa; pruebas físicas siguen pendientes.
