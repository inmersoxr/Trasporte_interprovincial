# Google OAuth — preparación y callbacks exactos

Baseline088878a70fc614e9b0624b1ae917ed8800710a10 en rama Cloudflare. Main/Pages protegidos; S1 local excluido. Usuario recibió inmediatamente originsvacío y ambos callbacks HTTPS reales de web/admin. Guía docs/GOOGLE_OAUTH_CURRENT.md.

Revisión: backend ya tiene Authorization Code, PKCE, state/nonce, validación firmada/JWKS/claims, persistencia D1, sesiones7d revocables, linking explícito y separación de roles. No introducir biblioteca/base/proveedor paralelo. Config remoto inicial googlefalse por GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET ausentes; correo propio tambiénfalse; Google no depende del transporte de correo propio.

Cambios: botón Google antes de formularios de correo; limpieza de desafío pendiente al elegir Google (cuenta/admin), returnTo admite company/business sin abrir redirecciones externas; provisión desde secretos GitHub al Worker API existente y smoke automático en ambos hosts. Script preserva secretos con entradas ausentes, rechaza pares parciales/formatos inválidos, usa stdin y oculta valores/salida del proveedor. Client ID público admite configuración vars de wrangler además del secreto GitHub.

Pruebas locales: identity/provisión4tests PASS15.46s; Alpha Chromium50.88s incluye desafío de correo pendiente en cinco accesos; correo Chromium16.49s PASS; provisión adicional con ID público PASS. Fuente de identidad/usuarios/correo sin cambios. No configurar credenciales falsas en remoto ni realizar login Google sintético público. Estado de CI/despliegue se añadirá al cierre; consentimiento real pendiente de credenciales.

Cierre de preparación:ded3bb70e6470efe77b6cfdad1d70cf92940092e, Actions45322538944 SUCCESS71tests y seis navegadores, backend/web/admin desplegados; ambos hosts siguen googlefalse por credenciales ausentes. H1 posterior3186c93c añade acceso de piloto independiente sin modificar esos callbacks ni publicar secretos. Activación y consentimiento Google reales continúan pendientes; no declarar completada esa prueba externa.
