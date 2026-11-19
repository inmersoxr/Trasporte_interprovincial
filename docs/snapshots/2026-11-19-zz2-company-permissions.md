# I2 — personal, planes y estados operativos

Parte autorizada del conjunto: solucionar que solo owner podía operar y que plan/vencimiento eran de referencia desconectados de Premium. Migración0023 añade modo operativo y vinculación de ficha de conductor/cuenta; triggers sincronizan la habilitación Premium en empresas Alpha. Se conservan nombres históricos del almacenamiento para no reconstruir identidades ni SaaS.

Implementado LOCALMENTE: permisos owner/admin/dispatcher/driver con asignación, manifestaciones/historial filtrados por conductor, guardias de embarque con permisos y horario revalidados en SQL, baja de vínculos al revocar. Cuenta vinculable en ficha del conductor. Standard esencial no se elimina por plan; herramientas Premium requieren plan aprobado y fecha vigente, sin activación gratuita Alpha ni cobros reales. QA explícito conserva compatibilidad.

Los servicios Alpha se inician/finalizan sin geometría, multiplicadores ni SOS ficticios; estado compartido persistente y embarque real, mapa GPS pendiente. Simulador anterior permanece aislado. Reputación usa estados completados y embarques existentes.

Pruebas: conjunto11/11 PASS; caso específico operating-access PASS como parte de3/3 en27.8s: administrador consulta operación, conductor ve su servicio, inicia/finaliza, no hay snapshotGPS ficticio, activación sin plan403, plan habilita, pausa retira Premium conservando operación. Se corrigió fixture repetido de expediente en pruebas con dos vehículos y conteo de cambios D1 que incluye triggers; no se relajaron restricciones de permisos. Prueba boarding actualizada: SOS simulado ya no se permite en servicio operativo.

No comercializar como contabilidad ni facturación. No Google/correo reales ni primer propietario físico certificados. Rollback compatible conserva membresías y servicios; no volver a depender de simulación para finalizar reservas nuevas. CI/despliegue en snapshotzz4.
