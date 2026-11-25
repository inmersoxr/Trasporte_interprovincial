# RutasEC — Conecta Ecuador
Snapshot de decisiones de producto — 2026-11-24. Documento conceptual, no certificación de funcionalidades implementadas.

## Visión
Plataforma nacional de movilidad terrestre de pasajeros: conectar Ecuador desde cualquier punto hacia cualquier destino, progresivamente. No limitarse a venta de tickets ni transporte interprovincial. Conectar personas, comunidades, operadoras, terminales, destinos y economías locales. Acompañar antes, durante y después del viaje. Marca: RutasEC — Conecta Ecuador. Campaña B2B propuesta: «¿Y por qué no estamos en RutasEC?».

## Cobertura y datos
Interprovincial e intraprovincial (Cuenca–Paute, Cuenca–Gualaceo, Guayaquil–Playas), privado, compartido, turístico y aeroportuario según autorizaciones. Intracantonal rural como expansión; urbano masivo pendiente. Modelar provincias, cantones, parroquias, localidades, terminales, paradas, rutas ordenadas y segmentos. Inventario por segmentos: asiento reutilizable tras descenso.
Construir directorio nacional gratuito sin esperar registros voluntarios. Investigar ANT (títulos habilitantes, rutas, frecuencias, unidades), SEPS (cooperativas), Superintendencia de Compañías (sociedades), SRI (RUC), GAD y mancomunidades competentes, terminales (horarios efectivos). Solicitar matrices oficiales CSV/XLSX; cruzar RUC, deduplicar, registrar fuente, fecha y estado de verificación. No confundir existencia legal con permiso vigente. Catastro consolidado actualizado ANT aún no localizado. Referencias iniciales a verificar: https://www.seps.gob.ec/ ; https://mercadodevalores.supercias.gob.ec/reportes/directorioCompanias.jsf ; https://www.sri.gob.ec/nl-BE/catastros ; https://www.ant.gob.ec/ . Directorio y CRM comercial derivados de la misma investigación, sin publicar datos personales innecesarios. Acuerdos institucionales con directores de terminales para incorporar operadoras afiliadas.

## Identidad empresarial y reputación
Sistema propio inspirado en UX de Google Maps, sin dependencia de Google. Ficha gratuita: logo, portada, descripción, fotos oficiales y de pasajeros, ubicación y mapa, sucursales, contacto, horarios, servicios, rutas, tarifas, viajes y compra cuando habilitada. Estrellas 1–5, comentarios, fotos adjuntas, fecha, respuestas empresariales, denuncias y moderación, distinción de viaje verificado. No imponer múltiples categorías inicialmente. Solicitar reseña tras viaje, también desde boleto físico. Perfiles precreados sin reclamar y registro directo; reclamación y verificación propia de identidad/representación. No fabricar opiniones ni importar contenido Google como propio.
Google Business Profile queda como servicio profesional opcional: auditoría, creación, recuperación, verificación, optimización, sucursales, entrega de propiedad al cliente. Pago adicional o suscripción superior, sin integración API obligatoria ni bloqueo del onboarding.

## Onboarding y cuentas
Registro Google, Apple, teléfono o email según viabilidad; verificación de cuenta. Flujo conversacional paso a paso: nombre, logo, banner, descripción (asistencia IA opcional), plan y configuración operativa. Cuenta madre empresarial y cuentas hijas con roles/permisos; invitar conductor o personal por enlace WhatsApp desde ficha existente. Separar admin interno RutasEC de operadora y pasajero. Aislamiento multiempresa.

## Productos y monetización
Guía gratuita: presencia y descubrimiento. Standard/Marketplace: publicación y reserva, comisión por venta online, sin mensualidad base. POS: tarifa tecnológica por emisión/uso, no comisión comercial por cliente captado en ventanilla. Premium: suscripción según tamaño, marca propia, perfil, dominio, gestión de flota, personal, rutas, ventas, inventario, finanzas, reportes, QR, seguridad, centro de operaciones. Presencia Digital: servicio adicional. Destinos/Ads: publicidad contextual, acuerdos y afiliaciones. Rewards: recurrencia y promociones financiadas. Nombres secundarios, tarifas y paquetes no cerrados; $99 previo era hipótesis del alcance anterior, no precio definitivo.

## POS, boleto y abordaje
Mantener compra física y efectivo, sin obligar al pasajero a tener teléfono. Boleto impreso o digital con QR e ID único, mismo registro central. POS con selección de ruta, salida, asiento/segmento, cobro, impresión y registro. Escaneo con teléfono del personal autorizado al abordar: validar viaje, boleto, estado, duplicados; registrar hora, punto, unidad, actor y evento. No recoger ni contar papel manualmente. Interfaz simple: vendidos, abordados, pendientes, asientos y alertas. Venta genera evento financiero; abordaje genera evento operativo, conciliación automática, cancelaciones/devoluciones separadas. Reportes de caja, sucursal, ruta, unidad, ocupación, auditoría. Boleto operativo no sustituye obligaciones fiscales.
Offline: manifiesto autorizado local, cola de eventos, sincronización idempotente, resolución de duplicados entre dispositivos desconectados; política concreta pendiente. QR también permite consulta del viaje y destino por pasajero sin instalar app; separar token/permisos de consulta y validación, proteger datos personales.

## Operaciones y seguridad
Centro de operaciones multiunidad: GPS del conductor, última posición si no hay señal, ETA, ruta vial real, estado, ocupación, incidencias, SOS, alertas, conductor y vehículo asignados. Compartir seguimiento por enlace directo sin login con permisos limitados. SOS y contacto configurable. GPS dedicado/cámaras como opciones según modalidad. Mantener PWA instalable, experiencia pasajero y panel operadora. Arquitectura propuesta Workers + D1 + R2, OSM/Leaflet o MapLibre; autenticación y autorización por tenant, auditoría, respaldo y migración reversible. Pagos reales pendientes de integración; demo previa simulada.

## Destinos y publicidad interna
Aprovechar contexto de destino, fecha y llegada para recomendaciones útiles: hoteles, hostales, restaurantes, gastronomía, vida nocturna, turismo, cultura, eventos, comercios, movilidad complementaria. Antes de viajar, confirmación de compra, durante viaje, llegada y retorno. No publicidad genérica ni banners invasivos; identificar contenido patrocinado. No compartir datos personales de viajeros con anunciantes sin base adecuada. Pequeños negocios y municipios pueden promocionarse ante viajeros hacia su localidad. Perfiles de destinos y establecimientos, campañas por destino, fechas, presupuesto, impresiones, clics y conversiones. Ingresos por posicionamiento, suscripción destacada, campañas, leads, afiliación y acuerdos institucionales. No construir Booking inicialmente: referencias y ofertas primero, reservas de terceros después.

## Rewards y promociones propias
Propuesta: diez viajes pagados completados y siguiente elegible gratis; contador visible, recompensa automática. Packs 5/10/20, pases mensuales, ida/vuelta, grupos, horarios de baja demanda, referidos, cashback, combos transporte+destino. Motor de reglas por recurrencia, ruta, fecha, disponibilidad e historial, con preferencias de privacidad. Operadoras Premium pueden crear campañas. Financiamiento por comisión, operadora, patrocinador, asientos de baja demanda o tope de crédito. A 10% de comisión y precio constante, regalar un boleto íntegro tras diez consume toda la comisión bruta; no lanzar sin validar margen, elegibilidad, fraude, vencimiento y financiación.

## Experiencia y marca
Guía: buscar origen/destino/fecha/pasajeros, comparar opciones, reservar o consultar puntos de venta. Ficha de operadora intuitiva con pestañas información, viajes, fotos, opiniones. PWA con navegación Home/Buscar/Viajes/Seguridad/Operador, identidad grafito/blanco/amarillo, splash y acceso de instalación. Landing comercial cinematográfica con escenas fullscreen y snap exacto, un scroll = un beat; explicar guía, POS, marketplace y Premium, QR y reputación. Mantener identidad RutasEC — Conecta Ecuador.

## Pendientes y secuencia propuesta
1. Validar fuentes oficiales y construir directorio normalizado; confirmar competencias y cobertura.
2. Definir esquema multiempresa, rutas/segmentos, perfiles, verificación, moderación y permisos.
3. Integrar POS y QR con reservas e inventario; probar offline y conciliación.
4. Consolidar operaciones, seguridad, finanzas y Premium.
5. Incorporar destinos, publicidad contextual y panel de campañas.
6. Pilotar Rewards con economía unitaria validada.
No se afirma que estas fases estén implementadas. Este snapshot registra decisiones y propuestas de conversación; no modifica código ni sustituye auditoría del repositorio.
