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

## GROUND — implementación y validación por fases (2026-11-24)

| Fase | Estado software | Evidencia |
|---|---|---|
| 1 | VALIDADA | Inventario docs/GROUND_TRANSPORT.md; commit2a68a941f5af267d657eba410016d376c0120d6d |
| 2 | VALIDADA | Alta7tipos, autorización/tipoempresa independientes, máximo configurado100; API y selector UI |
| 3 | VALIDADA | Uno/dos pisos, filas/columnas/pasillos/ventana, bloqueos, snapshotinmutable de salida; compra asiento70 |
| 4 | VALIDADA | Terminales/paradas/tarifa acumulada/autorización/frecuencia; UI publica y busca tramo Azogues–Guayaquil; SQL disjuntos/concurrencia; recurrencia recupera conductor |
| 5 | VALIDADA | Filtros vehículo/transporte/modalidad, disponibilidad por tramo, mapa asientos/QR y persistencia tras recarga |
| 6 | VALIDADA | Ventanilla comparte command/inventario; carrera web/oficina200+409; UI emite QR/imprime sin perder el boleto |
| 7 | VALIDADA | Integración automatizada4/12/20/50/70, conductor/vehículo/salida, QR doble uso409, cinco GPS/Premium y dos salidas recurrentes |
| 8 | EN PRUEBAS | Regresión, evidencias y despliegue efectivo pendientes de cierre; no confundir con build |

Validación anterior es software en D1/R2/Chromium aislados, con GPS/cámara emulados. Validación física con cooperativas/conductores/vehículos y sensores reales permanece PENDIENTE. No hay pagos reales ni certificación comercial.

Migraciones0034–0037 compatibles: clasificación canónica sin reconstruir vehicles ni cambiar IDs; configuraciónmáximo; layouts por vehículo/salida; paradas y snapshots; rangos de inventario y exclusión SQL de solapamientos reemplazan el índice único antiguo sin borrar claims; conductor habitual/override por salida también en recurrentes. Reservas antiguas representan trayecto completo0–1000 y conservan IDs, QR, estado y pagos. Compra100plazas se agrupa con json_each en dos INSERT, evitando200consultas por solicitud.

Atlas WebP generado específicamente para categorías de selección, siete referencias genéricas, no fotografías reales de las unidades. Solo assets de Cloudflare; Pages intacto. Campos bancarios siguen ficticios. Se reutilizan entidades, GPS, Premium, roles, cuentas, R2 y venta directa. No desarrollar Premium Inteligente ni Android.

Errores encontrados/corregidos: prueba antigua esperaba rechazo99pasajeros, actualizada a101; ventanilla no seleccionaba automáticamente la única salida y el bloqueo busy impedía abrir el boleto confirmado, corregidos. Pruebas de interfaz en390/1280, selector, publicación con parada, compra asiento70 y ventanilla PASS16s. Evidencias docs/evidence/2026-11-24/ground/. S1/0025 sigue pospuesta.
