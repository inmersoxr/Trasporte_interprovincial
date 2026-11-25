# Base de roles empresariales


## 2026-11-25 — continuidad sin pausa / 04.01 base de permisos

El usuario ordena continuar hasta terminar. Checkout limpio de rama activa en /workspace/rutasec-active, base a33e199; no mezclar diffs S1/0025 del checkout histórico. Se conserva plan171tareas y evidencia física pendiente.

04.01 EN DESARROLLO: se reutilizan memberships, cuentas, sesiones y empresas. Migración aditiva0038 incorpora catálogo de funciones, concesiones explícitas múltiples, revisión de membresía y alcance vehicular. No modifica cuentas ni permisos existentes. Nuevos roles usarán un ancla heredada de mínimo privilegio (driver), nunca admin; las concesiones explícitas sustituyen el rol heredado en la resolución de capacidades. No activar escrituras/invitaciones de roles nuevos antes de completar guardas de todos los endpoints y SQL de operación. Owner protegido siempre conserva autoridad; roles heredados conservan su comportamiento hasta modificación autorizada.

Contrato GET/api/team/access autentica y devuelve roles/capacidades/revisión de la empresa solicitada. Prueba Worker real local PASS: propietario conservado, cuenta ajena403, anónimo401, POST405, finanzas explícito sin operación de viajes, alcance vehicular ajeno rechazado en SQL y revocación que elimina concesiones. Sin UI nueva ni despliegue todavía; continuar integración de guardas antes de exponer los roles.
