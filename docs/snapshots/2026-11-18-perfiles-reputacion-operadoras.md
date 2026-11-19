# Snapshot — RutasEC — 2026-11-18 — Perfiles públicos y reputación de operadoras

## Decisión confirmada
Cada operadora publica su página propia dentro del marketplace RutasEC, con identidad visual personalizable, información comercial, flota y viajes. Un mismo backend multi-tenant y plantilla configurable: no crear sitios ni aplicaciones independientes.

## Personalización
Textos, descripción, logotipo, portada, fotografías, colores y ajustes de presentación. Standard conserva perfil público y funciones esenciales; Premium ofrece mayor personalización visual y miniapp de marca. Los viajes publicados y flota visible se alimentan de los registros compartidos, no de copias manuales.

## Reputación
- Calificación de **1 a 5 estrellas** tras un viaje completado.
- Comentario escrito **opcional**.
- Promedio agregado, cantidad de reseñas y opiniones visibles en perfil público y resultados de búsqueda.
- Una valoración por pasajero y viaje/reserva elegible; comprobación desde backend, protección antifraude, privacidad y distintivo de viaje verificado.
- Derecho de respuesta pública de la operadora; reportes y moderación administrados por RutasEC.
- No permitir que Premium compre mejores estrellas ni elimine opiniones negativas legítimas.
- Definir al implementar política de edición, impugnación, publicación y casos de reserva con múltiples pasajeros.

## Flujo y datos
Viaje completado → invitación → estrellas obligatorias → texto opcional → validación/publicación → actualización de promedio. Vincular reviews a operator_id, booking_id, trip/departure_id y passenger_id, aplicando autorización y minimización de datos; recalcular agregados de forma confiable.

## Estado
**Solo especificación conceptual registrada en memoria y snapshot.** No se modificaron interfaces, servicios, base de datos, Cloudflare ni GitHub Pages. El ejemplo visual de operadora y reseñas visto en conversación era ficticio. Mantener Standard funcional primero, Premium después y demo intacta.
