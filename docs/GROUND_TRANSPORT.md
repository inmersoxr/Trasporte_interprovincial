# Transporte terrestre: auditoría y ampliación

## GROUND-1 — VALIDADA, lectura del código y despliegue

R3 publicado7d8b7ae4582a801a933907b359f369df592899d9; Actions45400666550 verify/deploy SUCCESS. /pilot/resources.mjs, /pilot/app.mjs y /standard/reservations.mjs coinciden byte a byte; health0033_driver_vehicle_resources/D1/R2true/pagosdisabled. Pages200/hashc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f intacto. Fichas y pago→boleto ya publicados, no pendientes de esta ampliación.

- vehicles.capacity SQL soloexige>0; límite30 está en standard-api, standard-resources, standard-onboarding y standard-catalog, formularios Standard/pilot/search y selección de pasajeros. No reconstruir vehicles para aumentar plazas.
- vehicles.type tiene CHECK legado auto/suv/van/minivan/other. Añadir clasificación canónica compatible, conservar columna y referencias existentes; evitar rebuild/desactivación de foreign_keys.
- seat_claims unicidad activa por salida/asiento, validación SQL de capacidad y estado, command idempotente/batch. No permite ventas por tramos actualmente. Añadir rangos y exclusión SQL de solapamientos conservando claims existentes como trayecto completo.
- standard_passengers conserva identidad/embarque; código QR validado por backend y vinculado a salida. No crear segundo sistema de boletos.
- premium-enterprise/direct-sale ya delega en handleReservations y registra canaloffice. Ampliar el mismo payload de compra/asientos; no inventar ventas contables sin inventario.
- standard_route_vehicles/route_offers/standard_recurring_schedules/vehicle_slots ya vinculan vehículos, rutas, recurrencias y exclusiones de horario; añadir metadatos de terminales/paradas sobre ofertas existentes.
- standard_drivers, standard_departure_drivers y vehicles.default_driver_id ya vinculan conductor/vehículo/salida. Premium, GPS, mantenimiento y finanzas usan vehicle_id y departure_id; mantenerlos.
- standard_operator_profiles/premium_profiles/branches y empleados/roles ya existen. Añadir autorización/tipoempresa sin duplicar cooperativas ni aplicación.

## Decisiones de compatibilidad

Sin datos precargados en público. Configuraciones de asientos por vehículo y snapshot por salida protegen viajes publicados. Ventanilla y web usan el mismo comando e inventario. No acreditar legalidad por elegir público/privado/comercial ni por rellenar número de autorización; revisión documental se conserva.
