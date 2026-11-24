
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
