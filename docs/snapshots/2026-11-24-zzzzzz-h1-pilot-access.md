# H1 — implementación y validación de acceso piloto

Instrucción vigente permite registro sin códigos por teléfono/correo; reemplaza requisito histórico de verificar contacto antes de acceder durante piloto. Fase00 cerrada por commits00.01–00.06; plan maestro171tareas en14fases. Guía docs/H1_PILOT_ACCESS.md.

Implementado: teléfono internacional prioritario/correo alternativo; sin código durante flag piloto; scrypt/cookies/expiración/rate limits existentes; alta owner de organización; Premium gratuito autorizado mediante configuración y trigger existente; acceso independiente, recarga, cambio y cierre. Cuenta no verificada se distingue de posesión de correo/Google y no se utiliza para otorgar admin global.

Reutilización: password-auth/identity/standard_sessions/users/memberships/platform_subscriptions/premium_tenants; migración0029 añade proveedor de teléfono y metadatos piloto, sin reescribir datos previos. Rechaza duplicados concurrentes, no sobrescribe cuentas ni fusiona identidad por email. Formularios retienen campos ante fallos, ojo de contraseña existente, creación de empresa se muestra como primera tarea y se ocultan accesos Google no configurados.

Pruebas: pilot-access por Worker PASS10.65s; ChromiumH1 PASS11.51s dos contextos, navegación/empresa/Premium/recarga/contraseña/logout y correo; Alpha anterior PASS46.11s; correo anterior PASS13.31s. Capturas360/390/1280 inspeccionadas. Una prueba503 detectó duplicación de premium_tenants frente al trigger0023; se corrigió el backend reutilizando ese trigger, manteniendo la aserción de la ruta. Pantalla inicial ocultaba creación bajo Más: se corrigió navegación para empresas inexistentes.

No hay teléfonos, vehículos ni conductores físicos validados.01.09 permanece pendiente humano tras despliegue01.10; dependencia circular resuelta explícitamente en PLAN sin afirmar validación real. No empezar Fase02 como completada ni registrar cuatro unidades ficticias.

Fuente de publicación excluye S1/0025 y sus cambios locales; solo adapta autenticación y configuración del piloto autorizadas. No activar pagos reales ni modificar demo/main. CI/despliegue y comprobación remota se registrarán al cerrar H1.

Compatibilidad de rollback: conservar la comprobación verified_at>0 al desactivar piloto. Un Worker histórico con verified_at IS NOT NULL interpretaría0incorrectamente; no usarlo sobre los nuevos registros sin parche compatible. Revertir frontend y apagar flags es reversible sin borrar datos.

## Entrega remota H1
Código3186c93cd3aa1ddc19230d155cb285be80baed77; Actions45333404724 verify/deploy SUCCESS:72/72 pruebas y siete recorridos Chromium PASS. Nuevo flujo de piloto PASS7.02s CI; última ejecución local con desafío antiguo pendiente PASS12.78s. Migración0029 aplicada; API0112d703-70d0-4bf5-afa5-fb92e4cc008c, webfa9e9271-9393-4f45-8bae-d9ef467f1149, admin3088599c-6e37-4609-aa16-43ae2685bcd3. Logs confirman flags PILOT_REGISTRATION_ENABLED/PILOT_PREMIUM_ENABLED true; healthpilot-access-v1/schema0029/D1/R2true/pagosdisabled.

Remoto: navegador anónimo360/390/1280 observa teléfono prioritario, +593 editable, alternativa correo, botón habilitado y ausencia de código. Error de contraseñas distintas conserva datos sin emitir registro; cero cuentas de prueba remotas. Login negativo por teléfono401 comprueba ejecución criptográfica en Worker real sin crear cuenta. Activos cuenta/app,email-ui y navegación coinciden byte a byte con código probado. Captura remota móvil inspeccionada. Chromium inspección ignora certificado del proxy del entorno; curl verifica HTTPS normalmente.

Main0e8934886b30ec9eec8db5a26886ba4bafcd6b4a y hash Pagesc8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f conservados. Fuente25archivos excluyeS1/0025 y módulos diferidos; no eliminaciones ni datos reales modificados por pruebas. Recuperación nativa D1 metadata verificada, sin exportación/restauración nueva.

H1 entregado para pruebas: /account/?returnTo=%2Fstandard%2F%3Fmanage%3D1 . Fase01 no cerrada:01.09 requiere dos teléfonos/conexiones reales. Siguiente tarea pendiente exige participación humana; no avanzar como si se hubieran validado vehículos/conductores/56viajes. Google siguefalse por credenciales ausentes; correo propiofalse por remitente/transporte; ninguno bloquea registro piloto habilitado.
