# RutasEC — Mockup funcional V2

## Alcance y aislamiento
Tarea del segundo agente. El primer agente continúa la aplicación real en producción. Trabajar exclusivamente en la rama mockup-v2 y desplegar una instancia independiente con datos demo. No modificar main, producción, sus bases de datos ni Entity original. El entregable es un mockup funcional, no una nueva aplicación de producción ni una colección de pantallas estáticas.

## Fase 1 — Reutilizar la base
Referencias: https://github.com/inmersoxr/Trasporte_interprovincial y su historial, ramas y primer mockup funcional. Localizarlo y reutilizarlo, incorporando las mejoras de la aplicación actual. Inspección breve, sin auditorías repetitivas. Mantener splash, logo actualizado, grafito/blanco/amarillo, fotografía cinematográfica, PWA móvil y desktop, navegación y componentes existentes.
Conservar búsqueda origen/destino/fecha/pasajeros, transporte privado/compartido e inter/intraprovincial, operadores, vehículos, horarios, asientos, reserva, pago simulado, boleto QR, historial, GPS simulado sobre ruta vial, iniciar/pausar/acelerar/finalizar, compartir enlace directo de seguimiento sin login, SOS simulado, panel operador, flota, conductores, viajes, ocupación, POS, abordaje, centro de operaciones, marca Premium y permisos. Si falta una función, simularla coherentemente.

## Fase 2 — Núcleo común
Referencia obligatoria: https://github.com/drbrownlabs-afk/Entity (main). Leer README.md, AGENTS.md, docs/architecture.md y docs/implementation-plan.md; localizar API, persistencia SQLite, modelos, eventos y relaciones existentes. Reutilizar código compatible y metodología del mockup Entity. Fijar la revisión utilizada y documentar brevemente la integración. No copiar módulos espaciales/3D innecesarios. El README declara API inicial con SQLite y otras integraciones pendientes: no depender de Scorpio ni de capacidades sin implementar. Extender mediante adaptadores compatibles, no construir un núcleo incompatible.
Usar una instancia independiente de SQLite y API compartida por todos los perfiles y dispositivos demo. No usar localStorage como única fuente de verdad. Mantener identificadores únicos, relaciones, atributos, estados, capacidades, eventos y persistencia. Aislar permisos por empresa y datos privados; datos exclusivamente demo.
Entidades: país, provincia, destino, terminal, operador, vehículo, conductor, pasajero, ruta, viaje, hotel, habitación, restaurante, mesa, agencia, guía, tour, experiencia, atracción, comercio, evento, GAD, reserva, paquete, campaña, promoción. Relacionar recursos con propietarios, servicios con proveedores, reservas con pasajeros y recursos, destinos con establecimientos, tours con atracciones y paquetes con reservas. Un solo estado del mundo; una entidad se actualiza una vez y aparece actualizada en todas las vistas. Inventario y reservas transaccionales, validaciones idempotentes.

## Fase 3 — Fichas y guía de transporte
Componente universal dinámico inspirado en la facilidad de Google Maps: portada, logo, galería, descripción, mapa, ubicación, contactos, horarios, calificación 1–5, opiniones, catálogo, precios, disponibilidad, promociones, guardar, compartir, reservar y relaciones navegables. Módulos por tipo: viajes, habitaciones, menús, tours, entradas, destinos. No crear páginas manuales por entidad.
Tres modalidades: directorio gratuito (ficha y contactos sin compra), marketplace (compra y QR), Premium (comercialización y gestión empresarial). Patrocinio independiente, identificado. Comparación libre. Incluir varias ciudades de origen hacia Baños y conservar rutas existentes; marcar horarios y conexiones demo.

## Fase 4 — Catálogo territorial Baños
Investigar oferta real en https://www.banostravel.com/ y https://www.banosecuador.travel/es, páginas oficiales de proveedores y fuentes locales. Registrar fuente de datos. Objetivo orientativo: 15 alojamientos, 15 restaurantes/cafeterías, 8 agencias, 25 ofertas de tours, 15 atracciones, 5 bienestar, 5 vida nocturna. Variedad de precios y categorías, varias agencias por actividad. No limitar a un proveedor.
Incluir hostales, hoteles económicos, familiares, boutique, resorts, naturaleza y Premium; gastronomía tradicional, internacional, cafeterías y bares. Experiencias: Ruta de las Cascadas, Agoyán, Manto de la Novia, Pailón del Diablo, Casa del Árbol, miradores, rafting Pastaza, canyoning, canopy, tarabitas, bicicleta, senderismo, termas, spa, Amazonía, turismo comunitario y cultural. Fichas independientes para proveedores, actividades y atracciones, con relaciones.
Crear ficha territorial Premium de Baños: portada cinematográfica, galería, mapa, cómo llegar, categorías, filtros, búsqueda, comparación, opiniones, eventos, promociones, paquetes y destinos relacionados (Río Verde, Río Negro, Ambato, Riobamba, Puyo). Usar imágenes autorizadas o licencias compatibles; no copiar masivamente fotos/opiniones Google Maps. Marcar tarifas, afiliaciones, reputación e inventario simulados; no atribuir operaciones reales a establecimientos.

## Fase 5 — Contexto del viaje
Compra de boleto actualiza asientos, ventas, reserva y QR; activa contexto de destino. Mostrar invitación a descubrir Baños y contratar hospedaje, gastronomía y experiencias. Recomendaciones según destino, fechas, reservas existentes y estado del viaje. Simular notificaciones antes, durante y después del viaje. Al llegar, priorizar servicios locales; no recomendar hospedaje pendiente si ya está reservado. Navegación libre, sin itinerario obligatorio.

## Fase 6 — Marketplace y paquetes
Hoteles: comparar, elegir habitación, fechas, huéspedes, disponibilidad, reserva, pago demo, QR, cancelación, check-in/out.
Restaurantes: ficha, menú, mesa, fecha/hora/personas, experiencias gastronómicas, promociones y cupones QR.
Agencias: comparar proveedores, tours, fechas, horarios, duración, cupos, participantes, reserva, pago demo y QR.
Atracciones: información, horarios, mapa y entradas QR cuando corresponda.
Todas las contrataciones aparecen en itinerario del pasajero y panel del proveedor, con inventario actualizado.
Paquetes configurables: aventura, familiar, bienestar, económico, Premium y naturaleza. Combinar ida/vuelta, hotel, comida, tours y entradas; sustituir proveedores, actualizar total, contratar sin compra previa de boleto. Cada componente tiene reserva y QR propios vinculados al paquete. Itinerario permite consultar, agregar, modificar y cancelar según reglas demo.

## Fase 7 — Descubre Ecuador
Acceso desde Home sin comprar boleto. Fichas y circuitos relacionados: Pacífico (Salinas, Montañita, Puerto López, Manta), Andes (Quito, Latacunga, Ambato, Riobamba, Cuenca), Amazonía (Tena, Puyo, Macas), Volcanes, Cascadas y Aventura. Fotografías cinematográficas, experiencias, transporte y servicios. Baños es el territorio más completo; otros destinos tienen fichas representativas y conexiones demo identificadas.

## Fase 8 — Gestión empresarial universal
Reutilizar panel operador como plantilla modular. Transporte: centro de operaciones, mapa, flota, conductores, viajes, asientos, reservas, POS, QR, seguridad, finanzas.
Hotel: habitaciones, calendario, recepción, reservas, check-in/out, disponible/ocupada/limpieza, ventas directas, POS, ingresos.
Restaurante: menú, productos, mesas, reservas, comandas, POS, promociones, cupones e ingresos.
Agencia: tours, creación de experiencias, calendario, cupos, guías, participantes, QR, POS e ingresos.
Comunes: ficha, marca, fotos, catálogo, precios, disponibilidad, personal, permisos, finanzas, ventas, publicidad, promociones, reputación, estadísticas y configuración. Onboarding sencillo y cuentas hijas de empleados/conductores/recepcionistas/guías mediante invitación demo. Cada empresa opera su propio espacio. Ventas directas y marketplace comparten inventario. Cambios de catálogo se reflejan en fichas públicas.

## Fase 9 — Operaciones y QR
Reutilizar un servicio común de reservas, inventario, transacciones y QR. Boleto físico imprimible y digital comparten derecho de acceso. Escaneo por cámara si es posible, alternativa manual demo. Validación restringida al proveedor y servicio correspondiente; impedir doble uso y sobreventa.
Eventos: compra boleto→asientos/ventas/contexto; abordaje→ocupación/pasajero; inicio→seguimiento; llegada→recomendaciones; reserva hotel→disponibilidad; check-in→ocupada; check-out→limpieza; reserva tour→cupos; validación→participación; reserva mesa→disponibilidad; cupón→conversión; servicio completado→valoración; valoración→reputación; catálogo modificado→ficha; campaña→posicionamiento. Persistir al recargar y sincronizar entre dispositivos mediante API demo. Compartir seguimiento con token público limitado, sin exponer datos privados.

## Fase 10 — Reputación, publicidad y promociones
Valoraciones propias 1–5, comentarios, fotos autorizadas, respuesta empresarial y marca de servicio verificado. Reputación única por entidad, independiente del pago.
Campañas por destino, categoría, fechas, contexto, ubicación, servicio y presupuesto simulado. Patrocinados identificados en búsqueda, fichas, recomendaciones, notificaciones, Descubre Ecuador, itinerario y paquetes. Registrar impresiones, interacciones y conversiones. Descuentos, cupones, combos, promociones temporales, recompensas y beneficios de viajeros frecuentes configurables desde paneles.

## Fase 11 — GAD y administración
Panel GAD Baños: editar ficha territorial, contenido, campañas, eventos, circuitos, establecimientos, métricas agregadas de demanda, viajes, reservas y conversiones. No exponer datos privados. Campañas de ejemplo Descubre Baños, Vive la Amazonía, Conoce Cuenca, Ruta del Pacífico.
Admin central: entidades, empresas, destinos, usuarios, reservas, transacciones, suscripciones, campañas, promociones, comisiones e ingresos.
Importación Excel/CSV funcional: carga, asignación columnas, clasificación, normalización, duplicados por identificadores, vista previa y publicación automática de fichas con procedencia. Representar fuentes ANT, SEPS, Supercias, GAD, cámaras y directorios. No exigir catastro nacional completo ni simular como real una importación no implementada.

## Fase 12 — Entrega y modo inversionista
Selector discreto de perfiles: pasajero, operador, hotel, restaurante, agencia, GAD y admin. Control de tiempo, abordaje, viaje, llegada, QR, check-in/out, campañas y reset de datos demo. Permitir navegación libre.
Demostración: comprar boleto a Baños, comparar hoteles y tours, reservar, explorar restaurantes, crear paquete, compartir viaje, llegar, validar QR, consultar itinerario y comprobar inventario, ventas e ingresos en paneles correspondientes. Explorar otros destinos y panel GAD.
Publicar instancia independiente y entregar URL funcional, instrucciones mínimas de arranque y reset. No usar pagos reales, datos personales reales ni servicios externos de pago. No botones inertes ni pantallas aisladas. Ejecutar fases consecutivas, reutilizar antes de crear, commits por bloque, comprobación breve de flujos afectados y una prueba integral final. Evitar auditorías repetidas, informes extensos y decisiones menores que bloqueen. No modificar main ni Entity original. Si falta acceso a Entity, informar el bloqueo concreto y continuar con adaptador compatible, sin afirmar que se reutilizó código no accesible.
