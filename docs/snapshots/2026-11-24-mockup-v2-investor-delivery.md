# RutasEC V2 — muestra de inversionistas

Fecha local: 2026-11-24 (America/Guayaquil). Base original: 759367e3c3948e9b42a46176080fc5f20ae128de. Trabajo exclusivo en mockup-v2. Hitos locales secuenciales de fase 1–12: 28be6c1, 710a903, 8652364, 37236f7, 56d99d7, bbf337a, 86a4e68, c80d896, 7c07538, 7dcf4bc, d962f80, 486dc68. Pulido y verificación: 95a710d y 17e6395.

El usuario autorizó explícitamente reemplazar infraestructura real por simulación JavaScript/JSON/localStorage y después aclaró que se trata de una muestra controlada, sin necesidad de operación real. Se priorizan las vistas, navegación e interacción de perfiles.

## Entrega

- Sitio independiente: https://rutasec-mockup-v2-inversionistas.cebx3001.chatgpt.site . Primera publicación confirmada con estado succeeded. Artefacto inicial: 42f276a72d341f755b4060b5670e32ea94279db1. Fuente final preparada: e1c4898b9bca424c85bfdcba8901e0f9b6276b99.
- Fuente en mockup-v2/dist, sin build ni backend. Abrir Presentación desde el botón triangular de cabecera; 12 escenas o navegación libre con selector de perfiles. Reset en Modo inversionista. Instrucciones en mockup-v2/README.md y avances en PROGRESS.md.
- 15 alojamientos, 15 restaurantes, 8 agencias, 25 tours locales, 15 atracciones, 5 bienestar, 5 experiencias nocturnas, habitaciones/mesas y destinos nacionales. Nombres de referencia investigados; precios, reputación, disponibilidad, afiliaciones y operaciones son simulados. Fuentes y licencias conservadas.
- Un mundo local con entidades/IDs, relaciones tipadas, estados, reservas y eventos. Compras/QR/cancelaciones actualizan los paneles; POS e itinerario leen los mismos datos. Seguimiento vial reutiliza el contrato original con reloj simulado y enlace limitado autónomo. No sincroniza dispositivos.

## Evidencia y límites

`node mockup-v2/tests/smoke.mjs`: PASS. Inventario, idempotencia, asiento ocupado, proveedor incorrecto, doble QR, check-in/out, paquete atómico, cupón, cancelación y persistencia. Comprobación Happy DOM de todas las escenas: PASS. No acredita revisión visual.

La vista previa de Sites falló por timeout del relay en puerto 4173; Browser Use no pudo leer requisitos/permisos y el escritorio no tuvo proveedor AT-SPI utilizable. No se afirma prueba visual, teléfonos reales, autenticación comercial, pagos reales, entrega de mensajes ni reservas con establecimientos.

`git push origin HEAD:refs/heads/mockup-v2` recibió 403 por identidad cebx3001 sin permisos. La conexión GitHub del propietario inmersoxr sí confirma permisos push/admin; se usa para entregar exclusivamente la rama mockup-v2, preservando su estado previo.

## Aislamiento y rollback

Sin cambios en código de raíz, main, otras ramas, workflows, secretos, Entity, Scorpio o servicios existentes. Solo carpeta V2 y este registro de memoria en mockup-v2. Sites mantiene su artefacto de hosting separado, sin crear otro repositorio GitHub. Rollback del sitio: restaurar versión previa de Sites; rollback del escenario: reset local. La demo previa permanece intacta.

Costo: demo estática sin infraestructura adicional de datos. No se asumieron compras ni tarifas contratadas. Siguiente paso: revisión de diseño por el usuario en el enlace publicado; el hosting y el acceso al enlace son independientes de GitHub Pages.

## Entrega del código en GitHub

El usuario solicita la entrega en GitHub, no en Pages. El destino canónico es la carpeta `mockup-v2/` de la rama `mockup-v2` del mismo repositorio. Se completa mediante la conexión autorizada del propietario inmersoxr; el rechazo del Git CLI con la cuenta cebx3001 no implica falta de acceso por esta conexión. No se modifica main ni se configura GitHub Pages. Los commits locales por fases se conservan en el historial de trabajo; el conector publica el árbol final con un commit de entrega sobre la rama existente.
