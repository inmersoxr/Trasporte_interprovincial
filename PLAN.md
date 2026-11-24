# Prioridad inmediata de presentación — 2026-11-24

Prioridad vigente: circuito de presentación mañana. Continuar tareas implementables sin esperar01.09; mantener pruebas físicas pendientes. Secuencia P0 preparar operadora/vehículo piloto -> P1 invitación vinculada a vehículo -> P2 publicar/agenda -> P3 reserva/QR/embarque/GPS entre sesiones -> P4 desplegar y comprobar. Plan171tareas preservado; no declarar fases amplias terminadas por este recorte.


# Plan maestro de RutasEC

Vigente desde 2026-11-24 por instrucción del propietario. Este plan integra, no elimina, docs/ROADMAP.md, docs/PREMIUM_ROADMAP.md, PROJECT_MEMORY.md, auditorías y snapshots históricos. PLAN define alcance/dependencias/aceptación; PROGRESS contiene estados y evidencias; TESTS contiene resultados.

Estados permitidos: PENDIENTE, AUDITADA, EN DESARROLLO, EN PRUEBAS, BLOQUEADA, VALIDADA. Solo cerrar fase cuando todas sus tareas obligatorias estén VALIDADA. Evidencia automatizada no valida vehículos/teléfonos reales.

## Regla de ejecución
Una tarea a la vez: objetivo/dependencias → auditoría/reutilización → diseño técnico y UX → implementar → probar/interactuar/inspeccionar capturas → corregir → registrar → commit → siguiente tarea. Bloqueos externos no se ocultan ni se sustituyen con fixtures.

## Trabajo en curso al adoptar este plan
G-OAUTH: preparación de Google publicada ded3bb70, activación real BLOQUEADA por credenciales/consentimiento. G-BRANDING: páginas públicas solicitadas antes de este plan, implementación local; cerrar esta entrega dentro de la comprobación00.05 y continuar Fase00→H1. Nuevas instrucciones permiten H1 sin verificación de contacto; eso no habilita autoridad de plataforma ni confirma propiedad de un correo/teléfono.

## Fase 00 — Auditoría

Aceptación de fase: Inventario y punto de recuperación comprobables.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 00.01 | Auditar repositorio y arquitectura | Ninguna; revisar continuidad existente | Auditar repositorio y arquitectura: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 00.02 | Inventariar módulos y funcionalidades | 00.01 | Inventariar módulos y funcionalidades: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 00.03 | Auditar base de datos, endpoints y persistencia | 00.02 | Auditar base de datos, endpoints y persistencia: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 00.04 | Clasificar funcionalidades operativas, parciales y pendientes | 00.03 | Clasificar funcionalidades operativas, parciales y pendientes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 00.05 | Comprobar despliegue actual | 00.04 | Comprobar despliegue actual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 00.06 | Establecer punto de restauración | 00.05 | Establecer punto de restauración: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 01 — Acceso y creación de operadora

Aceptación de fase: H1: acceso y creación de operadora sin códigos, Premium de piloto y sesión persistente.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 01.01 | Registro por teléfono o correo y contraseña | Fase 00 validada | Registro por teléfono o correo y contraseña: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.02 | Teléfono con código internacional prioritario | 01.01 | Teléfono con código internacional prioritario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.03 | Verificación temporalmente desactivada en piloto | 01.02 | Verificación temporalmente desactivada en piloto: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.04 | Seguridad de contraseñas y sesiones | 01.03 | Seguridad de contraseñas y sesiones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.05 | Inicio y cierre de sesión | 01.04 | Inicio y cierre de sesión: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.06 | Creación de operadora | 01.05 | Creación de operadora: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.07 | Administrador principal de la organización | 01.06 | Administrador principal de la organización: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.08 | Premium completo por configuración de piloto | 01.07 | Premium completo por configuración de piloto: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 01.09 | Persistencia desde otro dispositivo | 01.08 + despliegue01.10 para la comprobación física | Persistencia desde otro dispositivo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 01.10 | Desplegar versión funcional H1 | 01.01–01.08 + prueba automatizada de sesiones01.09 | Desplegar versión funcional H1: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 02 — Sistema UX/UI

Aceptación de fase: Navegación limpia y coherente en móvil y escritorio.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 02.01 | Auditoría visual de interfaces | Fase 01 validada | Auditoría visual de interfaces: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.02 | Navegación principal y contextual | 02.01 | Navegación principal y contextual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.03 | Jerarquía y componentes reutilizables | 02.02 | Jerarquía y componentes reutilizables: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.04 | Eliminar controles redundantes | 02.03 | Eliminar controles redundantes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.05 | Navegación móvil | 02.04 | Navegación móvil: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.06 | Administración de escritorio | 02.05 | Administración de escritorio: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 02.07 | Accesibilidad, legibilidad y adaptación | 02.06 | Accesibilidad, legibilidad y adaptación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 03 — Identidad empresarial

Aceptación de fase: Identidad visible y persistente entre dispositivos.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 03.01 | Nombre y descripción | Fase 02 validada | Nombre y descripción: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 03.02 | Logotipo y banner | 03.01 | Logotipo y banner: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 03.03 | Fotografías | 03.02 | Fotografías: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 03.04 | Colores corporativos | 03.03 | Colores corporativos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 03.05 | Perfil público | 03.04 | Perfil público: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 03.06 | Persistencia y sincronización | 03.05 | Persistencia y sincronización: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 04 — Equipo, roles e invitaciones

Aceptación de fase: H2: participantes independientes e interfaces por responsabilidad.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 04.01 | Membresías empresariales | Fase 03 validada | Membresías empresariales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.02 | Administrador principal | 04.01 | Administrador principal: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.03 | Administrador de operaciones | 04.02 | Administrador de operaciones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.04 | Conductor | 04.03 | Conductor: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.05 | Agente de ventas | 04.04 | Agente de ventas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.06 | Propietario de vehículos | 04.05 | Propietario de vehículos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.07 | Responsable de flota | 04.06 | Responsable de flota: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.08 | Contabilidad y finanzas | 04.07 | Contabilidad y finanzas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.09 | Múltiples roles por usuario | 04.08 | Múltiples roles por usuario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.10 | Permisos y alcance de recursos | 04.09 | Permisos y alcance de recursos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.11 | Equipo y accesos | 04.10 | Equipo y accesos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.12 | Invitaciones individuales temporales revocables de un uso | 04.11 | Invitaciones individuales temporales revocables de un uso: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.13 | Compartir invitación por WhatsApp | 04.12 | Compartir invitación por WhatsApp: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.14 | Aceptar con cuentas nuevas y existentes | 04.13 | Aceptar con cuentas nuevas y existentes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.15 | Interfaz adaptada a roles | 04.14 | Interfaz adaptada a roles: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.16 | Vista previa de roles sin suplantación | 04.15 | Vista previa de roles sin suplantación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.17 | Modificar y revocar accesos | 04.16 | Modificar y revocar accesos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 04.18 | Aislamiento de usuarios y organizaciones | 04.17 | Aislamiento de usuarios y organizaciones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 05 — Flota y propietarios

Aceptación de fase: H3: cuatro vehículos reales con propietarios y conductores.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 05.01 | Registrar propietarios | Fase 04 validada | Registrar propietarios: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.02 | Registrar conductores antes o después de sus cuentas | 05.01 | Registrar conductores antes o después de sus cuentas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.03 | Ficha de vehículo | 05.02 | Ficha de vehículo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.04 | Placa, marca, modelo, año y tipo | 05.03 | Placa, marca, modelo, año y tipo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.05 | Fotografías | 05.04 | Fotografías: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.06 | Capacidad y distribución de asientos | 05.05 | Capacidad y distribución de asientos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.07 | Kilometraje, documentos y estado | 05.06 | Kilometraje, documentos y estado: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.08 | Vincular propietarios y vehículos | 05.07 | Vincular propietarios y vehículos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.09 | Propietario con múltiples vehículos | 05.08 | Propietario con múltiples vehículos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.10 | Propietario que también conduce | 05.09 | Propietario que también conduce: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.11 | Información relacionada en ficha | 05.10 | Información relacionada en ficha: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 05.12 | Validar cuatro vehículos reales | 05.11 | Validar cuatro vehículos reales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |

## Fase 06 — Asignaciones operativas

Aceptación de fase: Reasignación temporal sin duplicados ni pérdida de historial.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 06.01 | Conductor habitual | Fase 05 validada | Conductor habitual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.02 | Asignaciones temporales | 06.01 | Asignaciones temporales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.03 | Asignación por viaje | 06.02 | Asignación por viaje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.04 | Prioridad automática de asignaciones | 06.03 | Prioridad automática de asignaciones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.05 | Asignaciones pendientes | 06.04 | Asignaciones pendientes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.06 | Conflictos de horarios | 06.05 | Conflictos de horarios: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.07 | Cambios por viaje, día, semana o periodo | 06.06 | Cambios por viaje, día, semana o periodo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.08 | Modificar conductor habitual | 06.07 | Modificar conductor habitual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.09 | Reasignación desde vehículo o viaje | 06.08 | Reasignación desde vehículo o viaje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 06.10 | Conservar reservas, boletos e historial | 06.09 | Conservar reservas, boletos e historial: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 07 — Creación individual de viajes

Aceptación de fase: H4: publicación sencilla usando información registrada.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 07.01 | Formulario Crear viaje | Fase 06 validada | Formulario Crear viaje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.02 | Rutas reutilizables | 07.01 | Rutas reutilizables: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.03 | Origen, destino, fechas y horarios | 07.02 | Origen, destino, fechas y horarios: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.04 | Recuperar vehículo | 07.03 | Recuperar vehículo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.05 | Recuperar conductor asignado | 07.04 | Recuperar conductor asignado: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.06 | Tarifa y disponibilidad | 07.05 | Tarifa y disponibilidad: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.07 | Generar ida y retorno | 07.06 | Generar ida y retorno: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.08 | Registros independientes por trayecto | 07.07 | Registros independientes por trayecto: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.09 | Publicar viajes individuales | 07.08 | Publicar viajes individuales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 07.10 | Aparición en marketplace y perfil | 07.09 | Aparición en marketplace y perfil: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 08 — Programación recurrente

Aceptación de fase: H5: cuatro vehículos, ocho viajes diarios, 56 viajes en siete días.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 08.01 | Plantillas reutilizables | Fase 07 validada | Plantillas reutilizables: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.02 | Recurrencia diaria, semanal y mensual | 08.01 | Recurrencia diaria, semanal y mensual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.03 | Días e intervalos | 08.02 | Días e intervalos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.04 | Uno o varios vehículos | 08.03 | Uno o varios vehículos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.05 | Horario individual por vehículo | 08.04 | Horario individual por vehículo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.06 | Ida y retorno | 08.05 | Ida y retorno: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.07 | Recuperar conductores | 08.06 | Recuperar conductores: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.08 | Vista previa de generación | 08.07 | Vista previa de generación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.09 | Conflictos y asignaciones pendientes | 08.08 | Conflictos y asignaciones pendientes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.10 | Evitar duplicados | 08.09 | Evitar duplicados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.11 | Viajes individuales desde plantilla | 08.10 | Viajes individuales desde plantilla: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.12 | Publicación masiva | 08.11 | Publicación masiva: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.13 | Duplicar programación | 08.12 | Duplicar programación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.14 | Cambiar o cancelar instancia | 08.13 | Cambiar o cancelar instancia: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.15 | Cambiar futuras instancias sin alterar finalizadas | 08.14 | Cambiar futuras instancias sin alterar finalizadas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.16 | Conservar reservas al modificar | 08.15 | Conservar reservas al modificar: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 08.17 | Programación semanal real del piloto | 08.16 | Programación semanal real del piloto: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |

## Fase 09 — Calendario y agenda del conductor

Aceptación de fase: H6: agenda por conductor sincronizada con administración.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 09.01 | Calendario diario | Fase 08 validada | Calendario diario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.02 | Vistas semanal y mensual | 09.01 | Vistas semanal y mensual: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.03 | Filtros contextuales | 09.02 | Filtros contextuales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.04 | Detalles desde calendario | 09.03 | Detalles desde calendario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.05 | Crear y modificar desde calendario | 09.04 | Crear y modificar desde calendario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.06 | Reasignar, duplicar y cancelar | 09.05 | Reasignar, duplicar y cancelar: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.07 | Ocupación y estado | 09.06 | Ocupación y estado: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.08 | Mi jornada | 09.07 | Mi jornada: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.09 | Vista Hoy | 09.08 | Vista Hoy: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.10 | Mi semana | 09.09 | Mi semana: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.11 | Próximo viaje y acción | 09.10 | Próximo viaje y acción: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 09.12 | Sincronizar cambios administrativos | 09.11 | Sincronizar cambios administrativos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |

## Fase 10 — Reservas y embarques

Aceptación de fase: H7: reservas y QR reales entre teléfonos y conexiones.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 10.01 | Auditar y reutilizar reservas | Fase 09 validada | Auditar y reutilizar reservas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.02 | Disponibilidad por viaje | 10.01 | Disponibilidad por viaje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.03 | Selección de asientos | 10.02 | Selección de asientos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.04 | Pagos simulados | 10.03 | Pagos simulados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.05 | Prevenir doble reserva atómicamente | 10.04 | Prevenir doble reserva atómicamente: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.06 | Boletos QR individuales | 10.05 | Boletos QR individuales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.07 | Manifiesto | 10.06 | Manifiesto: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.08 | Escaneo QR | 10.07 | Escaneo QR: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 10.09 | Rechazar boleto de otro viaje | 10.08 | Rechazar boleto de otro viaje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.10 | Impedir doble embarque | 10.09 | Impedir doble embarque: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 10.11 | Sincronizar pendientes y embarcados | 10.10 | Sincronizar pendientes y embarcados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 11 — Ejecución de viajes y GPS

Aceptación de fase: H8: vehículos reales, ubicación y seguimiento entre dispositivos.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 11.01 | Kilometraje inicial | Fase 10 validada | Kilometraje inicial: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.02 | Confirmar vehículo y preparación | 11.01 | Confirmar vehículo y preparación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.03 | Iniciar viaje y hora real | 11.02 | Iniciar viaje y hora real: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 11.04 | Activar GPS web | 11.03 | Activar GPS web: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.05 | Registrar posiciones reales | 11.04 | Registrar posiciones reales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 11.06 | Actualizar operaciones | 11.05 | Actualizar operaciones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.07 | Enlace de seguimiento de pasajeros | 11.06 | Enlace de seguimiento de pasajeros: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.08 | Compartir por WhatsApp | 11.07 | Compartir por WhatsApp: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.09 | Seguimiento sin cuenta desde otra conexión | 11.08 | Seguimiento sin cuenta desde otra conexión: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 11.10 | Seguimiento privado durante periodos autorizados | 11.09 | Seguimiento privado durante periodos autorizados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.11 | Múltiples vehículos simultáneos | 11.10 | Múltiples vehículos simultáneos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 11.12 | Pérdida de señal, permisos y conexión | 11.11 | Pérdida de señal, permisos y conexión: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.13 | Gastos e incidencias | 11.12 | Gastos e incidencias: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.14 | Finalizar y hora de llegada | 11.13 | Finalizar y hora de llegada: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.15 | Kilometraje final | 11.14 | Kilometraje final: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.16 | Cerrar seguimiento público | 11.15 | Cerrar seguimiento público: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 11.17 | Historial de conductor y vehículo | 11.16 | Historial de conductor y vehículo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 12 — Gestión empresarial

Aceptación de fase: H9: registros operativos alimentan gestión sin duplicación.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 12.01 | Centro de control de flota | Fase 11 validada | Centro de control de flota: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.02 | Propietarios avanzados | 12.01 | Propietarios avanzados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.03 | Gestión de empleados | 12.02 | Gestión de empleados: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.04 | Jornadas laborales | 12.03 | Jornadas laborales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.05 | Ausencias y vacaciones | 12.04 | Ausencias y vacaciones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.06 | Mantenimiento preventivo por kilometraje | 12.05 | Mantenimiento preventivo por kilometraje: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.07 | Mantenimiento correctivo | 12.06 | Mantenimiento correctivo: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.08 | Rendimiento vehicular | 12.07 | Rendimiento vehicular: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.09 | Combustible, peajes y gastos | 12.08 | Combustible, peajes y gastos: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.10 | Ingresos de reservas | 12.09 | Ingresos de reservas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.11 | Liquidaciones a propietarios y conductores | 12.10 | Liquidaciones a propietarios y conductores: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.12 | Cuentas por cobrar | 12.11 | Cuentas por cobrar: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.13 | Cuentas por pagar | 12.12 | Cuentas por pagar: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.14 | Facturación | 12.13 | Facturación: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.15 | Nómina | 12.14 | Nómina: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.16 | Estadísticas | 12.15 | Estadísticas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.17 | Productividad y rentabilidad | 12.16 | Productividad y rentabilidad: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 12.18 | Capas empresariales en calendario | 12.17 | Capas empresariales en calendario: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Fase 13 — Validación integral

Aceptación de fase: H10: piloto integral comprobado y desplegado.

| ID | Tarea | Dependencias | Criterio de aceptación específico |
|---|---|---|---|
| 13.01 | Cuatro vehículos reales | Fase 12 validada | Cuatro vehículos reales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 13.02 | Cuatro conductores independientes | 13.01 | Cuatro conductores independientes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.03 | Programación de 56 viajes | 13.02 | Programación de 56 viajes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.04 | Reservas desde conexiones diferentes | 13.03 | Reservas desde conexiones diferentes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.05 | Reasignar con reservas | 13.04 | Reasignar con reservas: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.06 | Modificar recurrentes | 13.05 | Modificar recurrentes: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.07 | Embarques QR reales | 13.06 | Embarques QR reales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 13.08 | Viajes y GPS reales | 13.07 | Viajes y GPS reales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. La parte física permanece pendiente hasta prueba humana/documentada. |
| 13.09 | Kilometraje e historial | 13.08 | Kilometraje e historial: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.10 | Gestión empresarial integrada | 13.09 | Gestión empresarial integrada: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.11 | Permisos y seguridad | 13.10 | Permisos y seguridad: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.12 | Persistencia y sincronización | 13.11 | Persistencia y sincronización: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.13 | UX móvil | 13.12 | UX móvil: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.14 | UX escritorio | 13.13 | UX escritorio: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.15 | Corregir regresiones | 13.14 | Corregir regresiones: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.16 | Pruebas finales | 13.15 | Pruebas finales: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |
| 13.17 | Desplegar piloto validado | 13.16 | Desplegar piloto validado: recorrido completo con permisos, persistencia y evidencia verificable; conservar lo existente. |

## Programación de referencia de H5
| Vehículo | Conductor | Ida Cuenca–Guayaquil | Retorno Guayaquil–Cuenca |
|---|---|---|---|
| Unidad01 | A | 08:00–12:00 | 13:00–17:00 |
| Unidad02 | B | 09:00–13:00 | 14:00–18:00 |
| Unidad03 | C | 10:00–14:00 | 15:00–19:00 |
| Unidad04 | D | 11:00–15:00 | 16:00–20:00 |

Las letras y unidades son una plantilla, no vehículos/conductores registrados. H5 exige recursos reales y56 registros independientes, no filas ficticias.

## Límites vigentes
Pagos simulados; Android/OTA/GPS nativo en segundo plano pospuestos. Premium completo para la operadora del piloto mediante configuración autorizada; segmentación comercial definitiva pospuesta. Mantener multiempresa y permisos de backend. No modificar demo GitHub Pages ni crear infraestructuras duplicadas.

## Dependencia operativa H1
La prueba física01.09 requiere una URL desplegada01.10. Se comprueban antes dos contextos independientes y recarga en automatización; se entrega la versión y se conserva01.09 pendiente de teléfonos reales. Esto evita una dependencia circular sin declarar la aceptación física realizada. Fase01 no se cierra hasta esa validación.

## Circuito prioritario elegido por el propietario (sin sustituir171tareas)

| ID | Dependencias | Aceptación |
|---|---|---|
| P0 | 00/H1 existentes | Persona crea empresa y registra vehículo con placa/capacidad, sin datos precargados ni aprobación documental ficticia. |
| P1 | P0 | Invitar conductor a vehículo, aceptar con cuenta independiente, roles limitados y revocación comprobados. |
| P2 | P1 | Administrador elige horario/destino/vehículo y viaje único o recurrencia diaria/semanal/mensual; vista previa no escribe, publicación explícita y agenda persistente. |
| P3 | P2 | Compra simulada sin doble asiento, QR/embarque único, GPS real del dispositivo, mapa administrativo conjunto, pasajero y enlace público; automatización y validación física se registran separadas. |
| P4 | P0–P3 software | Actions verde, D1/Workers existentes, assets remotos comprobados y guía; no bloquea entrega por validación física pendiente. |
