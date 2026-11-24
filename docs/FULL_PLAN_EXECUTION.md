# Continuidad del plan completo

El piloto fue presentado según el propietario. No convertir ese recorte en producto terminado ni reiniciar PLAN.md. Trabajar por tareas y evidencias; preservar171tareas y ampliaciónGROUND.

1. UX-01–05 publicados y comprobados (d980e47/Actions45511383734). Continuar02.07 con aceptación transversal pendiente; no duplicar aplicación ni reconstruir estos flujos.
2. Validar identidad existente (borrador, publicación, R2, perfil público, tema, permisos), reutilizando pruebas ya disponibles.
3. Equipo y accesos: memberships actualmente permite owner/admin/dispatcher/driver. No presentar los ocho roles ni múltiples roles como implementados: hace falta autorización granular y alcance real. Reutilizar invitaciones temporales y cuentas existentes; vincular ficha de conductor con aceptación y permisos efectivos, separar perfil laboral de cuenta. Revisar relación entre asignación por vehículo y conductor de cada salida antes de ampliar acceso.
4. Propietarios y flota: reutilizar vehicles/standard_drivers/empleados/documentos/fotos; falta relación de propietarios múltiple y ficha integrada según05.08–05.11. No duplicar personas o unidades.
5. Asignaciones: premium_assignments y turnos existentes no equivalen al modelo completo de conductor habitual/temporal/por salida con prioridades e historial. Validar y completar fases06–08, incluida programación multivehículo e ida/retorno.
6. Calendario y Mi jornada: listas actuales y filtros de fecha no equivalen a diario/semanal/mensual interactivo completo. Completar09 y probar cambios administrativos con cuentas independientes.
7. Reservas/QR/GPS: reutilizar inventario/transacciones/tramos/boletos/escáner/seguimiento. Regresión81+10 es evidencia de software; sensores y participantes reales se validan aparte.
8. Gestión empresarial: existen empleados/turnos/nómina/AR/AP/gastos/ventas/mantenimiento/reportes. Auditar relaciones concretas y completar ausencias, vacaciones y liquidaciones de propietarios según12; SRI requiere certificado/configuración/adaptador externo, no fingir facturas autorizadas.
9. Cierre13 exige cuentas, vehículos, conexiones y dispositivos reales, además de revisión UX y permisos. Google/correo real siguen dependiendo de configuración externa; el acceso de prueba no acredita posesión del contacto. Pagos siguen simulados; no activar Android/Premium Inteligente ni seguridad avanzada pendiente sin su fase.

No cerrar fases por añadir enlaces o botones. Cada interfaz debe corresponder a datos/acciones/persistencia y permisos probados.

## Preparación de fase04: permisos antes de exponer nuevos roles

Hecho comprobado: memberships y premium_invites tienen restricciones paraowner/admin/dispatcher/driver. El administrador actual tiene acceso amplio; no equivale a administrador de operaciones limitado. Las fichas de conductor y el usuario de acceso son entidades separadas. premium_assignments es asignación por vehículo, mientras standard_departure_drivers conserva persona por salida; la relación entre ambas debe resolverse al aceptar la invitación y al calcular alcance por viaje.

No mapear contabilidad, ventas, propietario o responsable de flota a administrador para que una pantalla funcione. No basar restricciones en ocultar botones. Diseñar/implementar la matriz de capacidades por tarea, múltiples roles por persona y alcance por recurso, incluyendo endpoints de manifiestos/documentos/GPS y acceso personal como pasajero. Conservar permisos de cuentas existentes y el administrador principal; no reconstruir autenticación ni sobrescribir datos.

Pruebas mínimas de esa ampliación: dueño puede gestionar su organización; contabilidad no inicia viajes ni ve documentos de conductores innecesariamente; ventas no accede a nómina; propietario ve solo sus vehículos; conductor ve/opera solo sus salidas, incluso con conductor habitual distinto o reasignación; combinar roles no concede permisos fuera de sus recursos; revocación invalida acceso en backend; invitación vincula cuenta/ficha/organización y conduce a la interfaz correcta. Reutilizar joinTeam, command, memberships, identidades y D1 existentes mediante migraciones aditivas, con contratos revisables y pruebas antes de activar cada capacidad.

Esta preparación es AUDITADA, no implementación ni validación de los nuevos roles. Los casos de acceso por salida requieren revisar tanto APIs como restricciones SQL existentes; no desactivar estas restricciones para facilitar el desarrollo.
