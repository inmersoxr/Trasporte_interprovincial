# Sección institucional RutasEC

Cinco vistas internas desde el menú superior: acerca de, asociación, preguntas frecuentes, soporte y políticas. La barra inferior continúa siendo operativa. Los diálogos preservan formularios y estado de la pantalla anterior. Splash, temporización y estilos operativos no se modifican.

Las políticas son muestras ilustrativas no contractuales para el mockup. Cancelaciones, reembolsos y equipaje no modifican la lógica de reservas ni realizan cargos. Contactos inicialmente vacíos y configurables por administración. Condiciones comerciales propuestas: sin mensualidades, comisión del 10% por reserva pagada y procesamiento separado.

## Persistencia y revisión

El servicio existente añade `/api/institution/settings`, `/applications`, `/admin`, `/admin/applications/:id` y `/admin/settings`. Las solicitudes usan un objeto R2 separado `institution/v1.json`, escrituras condicionales, reintentos e idempotencia. No crean usuarios ni activan operadoras. Los datos de solicitudes son privados; el público recibe únicamente su comprobante.

Administración desde Contacto y soporte → Revisión administrativa. El secreto privado se entrega por separado y no se incluye en Git. El servicio verifica su SHA-256 contra `INSTITUTION_ADMIN_HASH`; sesión administrativa limitada al almacenamiento de la pestaña. Estados: recibida, en revisión, contactada y archivada. Edición con control de versiones.

## Verificación

`node --test sync-service/tests/*.test.mjs`: ocho pruebas, incluyendo reservas simultáneas, SOS, geometría vial y validación, idempotencia, privacidad y revisión de solicitudes.
