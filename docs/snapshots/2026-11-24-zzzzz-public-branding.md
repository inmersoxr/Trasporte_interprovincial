# Páginas públicas para Google Branding

Solicitud previa al nuevo plan maestro: publicar home, privacidad y términos para la aplicación actual. Correo de soporte autorizado expresamente por el propietario: rutasecuador45@gmail.com. No utilizar contactos inventados ni alterar demo/Pages.

Auditoría: el demo histórico tiene políticas de muestra en diálogos con configuración propia; no existen páginas independientes aplicables al backend actual. Se reutilizan identidad y recursos gráficos de RutasEC; nuevas páginas estáticas en legal/ para /about/, /privacy/ y /terms/, legibles sin JavaScript ni sesión. Home describe marketplace y operadoras, enlaza aplicación, cuenta, privacidad, términos y contacto. Políticas describen Google básico, reservas/documentos/GPS/compartición, permisos, almacenamiento, pagos simulados, conservación y atención de derechos por soporte. No se inventan razón social, dirección, RUC, plazos de conservación ni certificaciones. La identidad jurídica formal y validación legal del responsable no se presentan como certificadas.

Construcción aislada Cloudflare: copia HTML/CSS; pie de enlaces en cuenta/Standard; SW del demo copiado no intercepta políticas para evitar servir HTML alternativo. No tocar páginas ni scripts del demo original.

Pruebas locales: build PASS; assets/SW PASS; Chromium anónimo390/1280 prueba tres páginas, contacto, navegación y ausencia de desbordamiento/errores JS. Capturas legales en qa-output inspeccionables. Verificación remota y commit/run se registran al finalizar publicación.

URLs previstas:
- https://rutasec-web-dev.drbrownlabs.workers.dev/about/
- https://rutasec-web-dev.drbrownlabs.workers.dev/privacy/
- https://rutasec-web-dev.drbrownlabs.workers.dev/terms/

Publicación de estas páginas no equivale a aprobación de Google: su política de OAuth exige una homepage pública con descripción/enlaces y dominio verificable bajo control del desarrollador. Si Google exige verificar propiedad, se debe completar ese paso en Google Cloud/Search Console; no se promete que workers.dev sea aprobado automáticamente.
Fuentes oficiales consultadas: https://developers.google.com/identity/protocols/oauth2/policies ; https://www.spdp.gob.ec/docs/proteccion-de-datos-personales/cuales-son-mis-derechos/derecho-de-eliminacion/ .
