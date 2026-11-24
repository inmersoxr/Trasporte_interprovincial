# Espacio de operadora: Standard y Premium

Usar la misma aplicación en /pilot/. La interfaz actual conserva menú inferior. Standard y Premium son secciones de operación, no aplicaciones separadas. Durante el piloto se conservan las capacidades autorizadas y pagos simulados.

## Recorrido

1. Standard → Vehículos: registrar unidades y consultar la lista propia; placas opcionales durante pruebas.
2. Premium → Empleados: registrar personas, cargo, contactos y datos de referencia; no se exige cuenta para crear la ficha.
3. Standard → Crear viaje: seleccionar vehículo guardado y persona responsable, elegir origen/destino/fecha/hora/plazas/tarifa/embarque y publicar. La reserva y el calendario usan el servidor.
4. Pasajero: Empresa → Vista de pasajero, o /standard/. Elegir salida/asientos, datos reales del viajero y método de pago simulado. Las fichas bancarias son los valores ficticios del demo, sin envío de PAN/CVV/cuentas. La confirmación emite boleto, QR, importe, método, horario y puntos de encuentro/llegada.
5. Operador: en Viajes escanear el QR, comprobar embarque, comenzar viaje y permitir GPS real. Mantener navegador visible.
6. Premium → En vivo: ver viajes en curso, persona/vehículo/última captura; seleccionar unidad o Abrir seguimiento. Sin GPS se muestra el estado, sin punto ficticio. Cuatro vehículos requieren cuatro dispositivos/sesiones transmitiendo sus ubicaciones; una ficha laboral no concede permisos de acceso.
7. Compartir viaje antes de salir publica el enlace de la salida; Compartir seguimiento en el mapa genera enlace temporal revocable. Ofrece WhatsApp, menú nativo y copiar. El receptor del seguimiento no necesita cuenta; el enlace termina al finalizar. El panel de compartir se conserva entre actualizaciones del mapa.
8. Mi cuenta y Vista de pasajero están dentro de Empresa del menú inferior. En la vista de pasajero, Mi cuenta y Notificaciones de mis viajes quedan dentro de Mis viajes. En la consola Standard de gestión, están en Más → Cuenta. No se eliminaron; tampoco quedan enlaces de acceso en la cabecera.

## Comparación funcional con el demo

| Función del demo | Interfaz actual | Datos/endpoints | Validación y límites |
|---|---|---|---|
| Flota/directorio | Standard/Premium → Vehículos | /api/pilot/vehicle, /dashboard; vehicles/pilot_vehicles | CRUD existente reutilizado, lista creada desde UI; sin muestras precargadas |
| Personal | Premium → Empleados/Turnos/Remuneraciones | /premium/enterprise/employees, employee-update/status, shifts, payroll; premium_employees/shifts/payroll_* | Persistencia y pruebas enterprise existentes; nuevas cuatro fichas desde UI |
| Persona + unidad + salida | Crear viaje; En vivo; mapa privado | /departures + standard_departure_staff(0032) | Referencias por ID, snapshot de nombre, autorización y conflicto horario en SQL; no cuentas falsas |
| Crear/publicar y recurrentes | Standard → Viajes/Crear viaje/Programación y servicios | route_offers, departures, recurring-schedules, vehicle_slots | Calendario existente; frecuencia diaria/semanal/mensual elegida y vista previa; mensual sin autorrenovación en esta UI |
| Compartido/privado/personalizado | Vista de pasajero y servicios Standard | catalog/bookings/private-route-bookings/private-requests/offers | Inventario y cotización existentes; no adjudicación al primero |
| Elegir asiento y pagar | Checkout del pasajero | seat_claims/payments/payment_events | Pagos simulados; tarjeta crédito/débito y transferencia para compartido/fijo; solo enum de método persistido |
| Boleto y QR | Mis viajes del pasajero | bookings, passengers, booking_contacts | Embarque y boleto actualizados desde servidor; no PII dentro del QR |
| Escanear/iniciar/finalizar | Viajes/Reservas | operations, standard_tracking | Autoridad de empresa y uso único; GPS real del dispositivo |
| Mapa/selección de unidades | Premium → En vivo; Gestión → centro de flota | pilot/dashboard, premium/enterprise/fleet, gps/positions/history | Cuatro sesiones emuladas y privacidad comprobadas; sensores físicos pendientes |
| Compartir salida/seguimiento | Botones contextuales del viaje/mapa | URL pública departureId; gps/share/public | WhatsApp/nativo desde acción explícita; caducidad/fin/revocación existentes |
| Mantenimiento/documentación | Premium → Gestión → Mantenimiento; Standard → Empresa | component-plans, maintenance, operator-documents, odometer | Registros, programación y controles de fecha/km existentes; no posiciones ni documentos inventados |
| Venta de oficina/clientes/proveedores | Premium → Gestión | direct-sale, partners | Misma reserva/QR e inventario; contactos por empresa |
| Cobrar/pagar/gastos/liquidaciones | Premium → Gestión | documents/payments, expenses, settlements | Gestión y movimientos simulados; no transferencias bancarias reales |
| Reportes y rentabilidad | Premium → Gestión | enterprise/report, analytics, finance | Datos registrados, no contabilidad bancaria certificada |
| Datos fiscales/facturación | Gestión → Datos fiscales y comprobantes de prueba | issuer, fiscal settings/preparation | Preparación funcional; SRI real BLOQUEADO por certificado, configuración y adaptador externo; no se presenta como factura autorizada |
| Perfil/marca/fotos/opiniones | Empresa | company-identity, R2, miniapps, reviews | Editor existente y perfiles públicos; no reconstruidos |

No se copiaron listas ficticias, personas ni ubicaciones del demo al entorno público. La nueva tabla no reemplaza usuarios ni empleados: relaciona una salida con su ficha laboral. Los accesos de conductor existentes siguen siendo independientes y opcionales. Migración0032 es aditiva. S1/0025 permanece pospuesta.
