# Alpha D — perfil, flota y revisión documental

Se continúa con autorización general de correcciones, tras C verificado. Se reutiliza cuenta A1/A2, D1, BUCKET R2, flota/membresías y panel administrativo existentes; no se importa el ledger demo ni se amplía Premium.

## Implementado
- Cuenta Alpha crea operadora pendiente; cuenta verificada y autorización documental independientes. Solo QA aislado conserva autoaprobación sintética para regresión anterior.
- Perfil básico editable: nombre comercial/legal, tipo de prestador, responsable, teléfono/correo de contacto, ciudad, dirección e identificación tributaria si corresponde. Revisiones CAS e idempotencia evitan sobrescrituras concurrentes.
- Conductores con identidad/licencia/categoría/vencimiento, ficha de vehículo con placa única, marca/modelo/año/color/capacidad y conductor asociado por operadora. La placa y capacidad quedan protegidas si afectan reservas.
- PDF/JPG/PNG/WebP privados, hasta5MB con límite de lectura, firma de formato y acceso por propietario o administrador autorizado. R2+metadatos D1 con idempotencia/limpieza de duplicados concurrentes; ninguna URL pública ni archivos en caché API.
- Estados borrador/solicitado/aprobado/correcciones/suspensión con autor y fecha. UI explica elementos faltantes. Revisión en la tercera interfaz existente, con documentos descargables privados y motivo obligatorio. Auditor financiero no obtiene documentación privada.
- Vistas y triggers SQL de elegibilidad: documentación y licencia vigentes; publicación/venta bloqueada aunque se conozcan identificadores. Caducidad retira disponibilidad sin borrar boletos confirmados. Cambios de expediente vuelven a revisión; no anulan reservas por sí mismos.
- Google firmado con email verificado puede acreditar el correo preautorizado para primera autoridad global si no existe ninguna. No privilegios por correo de contacto, parámetro cliente ni rol de operadora. Propietario real remoto no aprovisionado durante estas pruebas.

## Pruebas
`npm test`:49/49 PASS. Incluye revisión obligatoria, carrera de perfil200/409, documentos privados/descarga exacta, rechazo de archivos inválidos/grandes, idempotencia concurrente con6 objetos R2 para6 documentos, rechazo de otra cuenta, revisión solo por plataforma, aprobación idempotente, publicación posterior, licencia vencida bloquea nueva compra y conserva boleto anterior. Regresión Standard/Premium/demo conservada.
`npm run test:alpha-local`: PASS, Google SIMULADO, operador completa perfil/vehículo/conductor/6 documentos → solicitud → administrador entra en otro subdominio y aprueba → operador publica3 salidas → pasajero accede al comprar → reserva/QR → otra sesión recupera boleto → cancelación independiente. Primera ejecución detectó que el test no elegía el conductor requerido; se hizo explícita la selección y se añadieron mensajes de elementos faltantes al producto. No se presentó el primer intento como aprobado.
`email-local.e2e` y `platform-local.e2e`: PASS, buzón simulado, acceso/ledger/roles/móvil conservados. `git diff --check` y comparación de archivos clave demo/Pages con HEAD: PASS, sin modificaciones.

## Estado y límites
Migración0018_standard_onboarding preparada y aplicada solo en Miniflare. Código/health local alpha-onboarding-v1; remoto permanece0014. Sin commit/push, deploy, exportaciones, cuentas reales, correos reales o cambios de infraestructura. Datos ficticios únicamente en pruebas aisladas; publicaciones remotas QA no se borraron.
Checklist inicial del piloto (identidad/habilitación, licencia, matrícula/cobertura/revisión) requiere revisión humana y validación de requisitos según servicio/jurisdicción. No es verificación automática con autoridades ni certificación comercial/normativa. Standard mantiene las herramientas básicas; Premium no se amplía.

Rutas principales: GET operator-onboarding, POST operator-profile/operator-drivers/vehicle-details/operator-documents/operator-submit bajo /standard-api/api; lectura privada operator-documents/:id. Administración: POST /platform-api/api/platform/operator-review y GET documents/:id. Usuario opera mediante formularios/nombres, nunca IDs técnicos ni claves manuales.

Siguiente E autorizado: escáner integrado, vigencia/salida correcta, estado del boleto, contacto/administración de viajes e historial. F correo por código/regresión/entrega después. Bloqueos externos Google/remitente ya informados no detienen esos trabajos.
