# Perfiles públicos y opiniones — Alpha

La cuenta personal, el perfil público de empresa y la consola de gestión tienen funciones distintas. Cada operadora habilitada dispone de una página compartible dentro de RutasEC, sobre los mismos Workers/D1/R2 e inventario. No se crean sitios, bases ni aplicaciones por empresa.

## Uso

En consola Standard: **Más → Perfil público**. Guarda nombre público, presentación, descripción, color, web HTTPS, logotipo, portada y fotografías de vehículos. Las imágenes (PNG/JPG/WebP hasta2MiB) se guardan privadas primero; elige las que quieres publicar y guarda el perfil. Vista previa autenticada y nombres de archivos facilitan la selección. Hasta30 fotografías de vehículos seleccionadas. La documentación del expediente es independiente y privada.

El enlace **Ver mi perfil público** abre cuatro vistas: **Viajes / Flota / Opiniones / Acerca de**. La portada/identidad es común; cada vista presenta una tarea en móvil, con navegación contextual y acceso a RutasEC/boletos/cuenta. No mezcla todos los formularios en una página. Compartir/copy requiere acción del usuario.

Viajes usa únicamente salidas futuras persistentes y rutas privadas fijas publicadas; los asientos agotados se excluyen por catálogo. Elegir asiento/fecha abre la reserva Standard existente. Flota muestra modelo, tipo, capacidad, marca/año/color y fotografía seleccionada de vehículos activos; no publica placas, conductores, licencias, documentos, correo ni identificadores de pasajeros. La marca de expediente revisado procede del servidor, no de una opción del editor.

Standard conserva perfil básico y reputación aunque no tenga Premium. Se reutilizan premium_profiles/premium_media por compatibilidad; sus nombres históricos no implican un requisito de plan. Premium conserva sus herramientas actuales y configuración existente. El enlace nuevo hacia el editor Standard de fotografías aparece al propietario; los administradores Premium conservan su editor existente. Retirar la personalización oculta las imágenes/presentación personalizadas; no borra estrellas, opiniones ni viajes publicados. La página básica y opiniones de una operadora habilitada siguen consultables. Operadoras pendientes/suspendidas y registros QA no se exponen en el entorno normal.

## Valoración y privacidad

- Requiere cuenta verificada, reserva propia confirmada, embarque registrado y servicio completado en servidor. Se cubren compartido, privado fijo y personalizado; el cliente no declara que un viaje terminó.
- Una valoración por **cuenta compradora y servicio**: una salida compartida admite una sola opinión de esa cuenta aunque haya adquirido varios boletos/asientos. Una reserva de grupo tiene una sola valoración del comprador; los nombres de acompañantes no permiten apropiarse de reservas ni opiniones. No se afirma verificación individual de acompañantes sin cuenta.
- Estrellas enteras1–5 obligatorias; comentario opcional hasta1000caracteres. Propietarios/miembros no pueden valorar su propia operadora. Unicidad, elegibilidad y campos inmutables tienen controles SQL, además de API.
- Se publica solo nombre de pila; si el nombre parece correo o número largo se usa «Pasajero». La pantalla explica qué será público. No se publican correo, teléfono, QR, boleto, cuenta o asiento. El texto lo decide el autor; reportes permiten revisar contenido que contenga información privada.
- En esta Alpha las reservas/pagos son simulados; se guarda simulated=1 en la opinión y se indica en la interfaz. «Viaje completado verificado» acredita el registro del sistema; no certifica GPS, pago bancario ni identidad física.
- Política inicial explícita: estrellas y comentario original no se editan desde la interfaz. Para errores/abuso/privacidad existe reporte a RutasEC. El operador puede responder públicamente y actualizar su respuesta con revisión concurrente; no cambiar puntuación ni borrar crítica legítima. Premium no afecta promedio ni moderación.

El promedio y la cantidad se recalculan desde opiniones visibles, tanto en perfil como catálogo. Sin opiniones se muestra ese estado, nunca estrellas de ejemplo. Las opiniones públicas tienen páginas20; elegibilidad/historial propio se limita a50 reservas/opiniones recientes, y la consola de respuesta muestra100 recientes. Moderación dispone de páginas50 y reportes asociados. No se inventan agregados por esos límites.

## Moderación

Consola operadora: **Más → Opiniones** permite responder y reportar. Un reporte no retira ni reduce automáticamente la opinión. En administración RutasEC: **Opiniones y reportes → Revisar**. Solo owner global puede ocultar/restaurar, con motivo obligatorio y revisión CAS; auditor y roles empresariales no tienen acceso a reportes privados. Se conservan texto/estrellas originales y auditoría. Al restaurar se recupera la misma valoración; no existen estrellas especiales, pagos ni eliminación favorable a Premium.

## Implementación

- Gestión: GET/POST /api/operator-public-profile?operatorId=…, POST /api/operator-public-media, GET privado /api/operator-public-media/:id?operatorId=….
- Página/manifest/medios públicos: /api/miniapps/:id y rutas existentes /manifest,/media/:id. Imágenes solo si están seleccionadas y publicadas; respuestas R2/API no-store/nosniff.
- Opiniones: GET /api/operator-reviews/:operatorId?cursor=…; GET /api/reviews/eligibility?operatorId=…; POST /api/reviews; GET /api/reviews/operator; POST /api/reviews/:id/reply o /report.
- Moderación: GET /api/platform/reviews?cursor=…; POST /api/platform/reviews/:id/moderate. Eventos de respuesta/moderación en historial de administración existente.
- Migración aditiva0021_public_profiles_reviews: columnas en almacenamiento existente; vista de elegibilidad, opiniones, reportes e integridad. Misma autenticación/cookies/D1/R2. Nada de localStorage como fuente de reputación.

## Límites y validación

Es una implementación Alpha, no una certificación comercial/antifraude integral. El envío real de códigos y OAuth Google siguen requiriendo configuración externa; el circuito automatizado usa proveedores y registros de prueba locales. La aprobación documental sigue siendo manual y distinta de verificar correo. No se insertan operadores, viajes ni opiniones ficticios remotos para demostrar la interfaz. Resultados, versión desplegada y rollback se registran en snapshot2026-11-19-public-profiles-reviews.md. Pages/demo se conservan intactos.
