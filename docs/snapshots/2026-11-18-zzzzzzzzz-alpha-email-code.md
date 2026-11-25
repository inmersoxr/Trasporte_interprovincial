# Alpha F — correo por código y regresión local

Se reutiliza A2; no se incorpora proveedor nuevo, base de datos ni sistema de autenticación paralelo. Versión provisional0.1.0-alpha.0; no certifica aceptación real.

## Implementación
- Registro normal pide correo/contraseña/confirmación; envía seis dígitos y activa la cuenta únicamente al introducirlos. Contraseña pendiente derivada con scrypt existente; código hasheado junto a desafío256bits. API nunca devuelve el código. El desafío aislado tampoco permite utilizar el verificador legacy para cambiar contraseña/activar cuenta.
- Caducidad10min,5 intentos,4 envíos/hora por correo y límites por IP. Reenvío sustituye el desafío después de aceptación del transporte; si falla, elimina la acción nueva y conserva el código anterior. Uso único atómico, incluida carrera de verificación. Se retiran los hashes pendientes tras confirmación.
- Recarga del formulario conserva solo desafío no autenticante en sessionStorage, sin password/código/cookie. Recuperación por enlace, cuentas/enlaces anteriores, cambio y revocación existentes siguen compatibles. Se comprueba posesión del buzón preautorizado antes del primer owner.
- Migración0020 aditiva; health alpha-email-code-v1/schema0020. Configuración native Email Service confirmada con documentación oficial, sin activar remitente ni contratar proveedor. Resend sigue alternativa preparada.
- CI preparado para tres recorridos locales de navegador además de tests; selecciona Chromium disponible en Codex/runner sin nueva infraestructura. Inventario/criterios reales en docs/ALPHA_ACCEPTANCE.md.

## Evidencia
- `npm test`:54/54 PASS,136.2s, incluidas regresiones demo/Premium e integridad D1. Tres tests nuevos de código: cuenta pendiente, no bypass, carrera200/400, replay/cinco intentos/caducidad/reenvío/owner y proveedor caído sin falso envío.
- `npm run test:alpha-local`:PASS27.8s, varios contextos, Google SIMULADO, documento/revisión/salidas/búsqueda/compra/QR real en vídeo simulado/embarque/reingreso/última plaza.
- `npm run test:email-local`:PASS10.4s, buzón SIMULADO, código, recarga sin password almacenado, administración, cambio y recuperación.
- `npm run test:platform-local`:PASS11.7s, roles/planes/ledger manual existente y móvil.
- Primera regresión F53/54 falló por EPIPE en el puente HTTP Miniflare al rechazar/cancelar5MB antes de terminar escritura. El límite real ahora se prueba directamente con Request y el mismo handler/autenticación/D1, sin aceptar EPIPE como éxito ni relajar el límite. Prueba aislada y regresión completa posterior PASS.
- `git diff --check`:PASS. Fuentes originales index/app/bookings/styles/sw y workflow Pages idénticos a HEAD. Pages remoto200 con SHA256 c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f antes de entrega.

## Estado externo y siguiente tarea
Antes de entregar, health remoto aún0014, D1/R2true; auth/config google=false,email=false: faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET, AUTH_EMAIL_FROM y binding AUTH_EMAIL o RESEND_API_KEY. No se envió correo real ni creó cuenta remota del propietario. Local sin secretos/identidades salientes configurados; se comprobará CI existente, sin volver a solicitar el token por anticipado.
F cerrado localmente, sin commit/push/deploy todavía en este snapshot. Continúa entrega G en rama exclusiva Cloudflare: verificar remoto sin trabajo paralelo, publicar cambios revisables, ejecutar CI y despliegue existente si disponible. No main/Pages, migraciones destructivas, cobros ni ampliación Premium. Rollback conserva tablas/cuentas/datos; no borrar para volver versión. Aceptación real requiere configuración externa y dos teléfonos/cámara física, como indica ALPHA_ACCEPTANCE.md.
