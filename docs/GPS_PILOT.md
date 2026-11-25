# GPS real — piloto Cloudflare

## Uso
Preparar una salida dentro de la ventana de inicio existente (dos horas antes/después de su horario); usar un solo dispositivo emisor por vehículo. Operadora/conductor asignado inicia un servicio y confirma que su dispositivo viaja en el vehículo; el navegador pide permiso de ubicación. Alternativamente abre el enlace del estado del servicio y pulsa Activar GPS en este dispositivo. GPS activo y última sincronización aparecen en cabecera. Detener mi GPS cesa la captura local sin finalizar el servicio; Finalizar viaje impide nuevas transmisiones y revoca enlaces públicos. Si se termina desde otro dispositivo, el siguiente intento de sincronización se rechaza y detiene el emisor.

El dueño/administrador y los pasajeros de reservas confirmadas abren Ver estado del viaje para consultar el mapa. Compartir seguimiento abre el sistema del teléfono (incluido WhatsApp si está instalado) o copia un enlace; si falla el portapapeles queda un campo seleccionable. El receptor no necesita cuenta. Tokens32bytes aleatorios, hash almacenado, TTL12h máximo; creación de otro enlace personal revoca el anterior. Revocar mis enlaces invalida los propios; administración puede revocar todos los del servicio. Fin de viaje invalida todos, incluso en carreras con creación: la lectura exige estado running. Ningún enlace contiene manifiestos ni datos de pasajeros. No es mensajería ni integración WhatsApp.

## Implementación
Leaflet/OSM existentes; endpoints nuevos /api/gps/:trip (privado), /positions (POST autenticado), /history (personal autorizado), /share (POST crear/revocar), /api/gps/public/:token (solo lectura). D1 guarda captura/recepción por separado, vehículo y actor; UUID de muestra hace idempotente la sincronización. Validación de permisos se repite en trigger al insertar, después del precheck. Última muestra por hora de captura; sincronizar una muestra antigua no retrocede al vehículo. Lotes50,24h de antigüedad máxima, tolerancia60s al reloj adelantado, precisión0–5000m y valores numéricos acotados. La autorización no demuestra que el hardware sea incorruptible: no se presenta como prevención avanzada de spoofingGPS.

IndexedDB separa colas por cuenta/viaje: máx20000 muestras y24h locales, sin datos de pasajeros. Al recuperar red se reintentan lotes pendientes y se borran únicamente los IDs confirmados. Sesión actual debe coincidir con la cuenta capturadora; logout/cambio de cuenta detiene envío. Error409 por fin del servicio vacía su cola pendiente; no se sincroniza una ruta cerrada. Las colas se depuran al acceder a ellas; no se garantiza borrado mientras la aplicación está cerrada. Caducidad local impide reenviar muestras de más de24h; retención de historial servidor pendiente de política, no se ejecutan borrados de datos.

watchPosition toma posiciones reales; se filtran a5s con movimiento y10s estacionario cuando el navegador entrega muestras. No se genera una muestra nueva a partir de la anterior. Reintento10s, consulta de mapas7s solo visibles. Muestra última captura, recepción, precisión, antigüedad;30s marca sin posición reciente. No extrapola/interpola ubicaciones. La aplicación Standard nueva no reproduce recorridos simulados, ni siquiera para enlaces QA antiguos: muestra que no existe GPS real. El simulador comercial permanece únicamente en el demo separado.

Ruta vial gratuita mediante OSRM en routing.openstreetmap.de, entre centros aproximados de las16 ciudades existentes; no equivale a puntos exactos de embarque. Proveedor externo sin garantía/SLA: si falla, no se dibuja recta ficticia ni ETA inventada; reintento limitado a un minuto. El mapa y servicio de ruta reciben coordenadas necesarias según sus políticas, sin credenciales ni datos de pasajeros. ETA aproximada con velocidadGPS>=2m/s, precisión<=100m, muestra reciente y a<=500m de la ruta; si no, no disponible. No incorpora tráfico, paradas ni garantías de llegada.

## Límites físicos y Android
PWA requiere navegador/permiso/conectividad compatibles; no garantiza segundo plano/pantalla apagada. Captura puede continuar al navegar dentro de la app, pero cerrar proceso detiene watchPosition. Mantener abierta para piloto. cloudflare-dev/native/gps-contract.ts, permisos Android y contrato de integración preparados; no se implementó plugin/servicio nativo ni se compiló APK. La operación en segundo plano necesita foreground service real con notificación y pruebas Android antes de declararse activa.

## Entrega y pruebas
GPS se entrega por rama Cloudflare existente, con migración0026. No publicar0025 ni sus cambios locales: seguridad S1 pospuesta. No tocar reservas/pagos/manifiestos ni Pages. Pruebas automáticas usan ubicaciones emuladas explícitas: no certificar GPS físico, teléfono real o pantalla apagada. Correo/Google externos siguen bloqueando acceso real según configuración actual. GPS local puede comprobarse con identidades de prueba aisladas sin activar acceso sintético remoto.

## Ensayo físico pendiente (no certificado por pruebas emuladas)
1. Habilitar acceso normal real y preparar conductor/asignación y salida en ventana de inicio.
2. Teléfono A dentro del vehículo: iniciar, confirmar dispositivo y permitir ubicación precisa; mantener app visible.
3. Teléfono B: abrir enlace compartido sin cuenta y comprobar vehículo y tiempos de captura/recepción al desplazarse con seguridad, sin manipular el teléfono al conducir.
4. Desactivar datos/WiFi de A manteniendo Ubicación: B conserva última posición conocida y marca antigüedad; no debe avanzar solo.
5. Recuperar datos de A: comprobar cola sincronizada, última posición nueva sin retroceso a puntos antiguos, y captura distinta de recepción.
6. Revocar y regenerar enlace; el anterior deja de consultar. Finalizar servicio y comprobar enlace cerrado y emisión detenida.
7. Segundo plano/pantalla apagada se documenta como prueba de límite PWA, no garantía de continuidad. Android requiere futura implementación/compilación nativa y pruebas separadas.
