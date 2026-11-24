# H1 — implementación y validación de acceso piloto

Instrucción vigente permite registro sin códigos por teléfono/correo; reemplaza requisito histórico de verificar contacto antes de acceder durante piloto. Fase00 cerrada por commits00.01–00.06; plan maestro171tareas en14fases. Guía docs/H1_PILOT_ACCESS.md.

Implementado: teléfono internacional prioritario/correo alternativo; sin código durante flag piloto; scrypt/cookies/expiración/rate limits existentes; alta owner de organización; Premium gratuito autorizado mediante configuración y trigger existente; acceso independiente, recarga, cambio y cierre. Cuenta no verificada se distingue de posesión de correo/Google y no se utiliza para otorgar admin global.

Reutilización: password-auth/identity/standard_sessions/users/memberships/platform_subscriptions/premium_tenants; migración0029 añade proveedor de teléfono y metadatos piloto, sin reescribir datos previos. Rechaza duplicados concurrentes, no sobrescribe cuentas ni fusiona identidad por email. Formularios retienen campos ante fallos, ojo de contraseña existente, creación de empresa se muestra como primera tarea y se ocultan accesos Google no configurados.

Pruebas: pilot-access por Worker PASS10.65s; ChromiumH1 PASS11.51s dos contextos, navegación/empresa/Premium/recarga/contraseña/logout y correo; Alpha anterior PASS46.11s; correo anterior PASS13.31s. Capturas360/390/1280 inspeccionadas. Una prueba503 detectó duplicación de premium_tenants frente al trigger0023; se corrigió el backend reutilizando ese trigger, manteniendo la aserción de la ruta. Pantalla inicial ocultaba creación bajo Más: se corrigió navegación para empresas inexistentes.

No hay teléfonos, vehículos ni conductores físicos validados.01.09 permanece pendiente humano tras despliegue01.10; dependencia circular resuelta explícitamente en PLAN sin afirmar validación real. No empezar Fase02 como completada ni registrar cuatro unidades ficticias.

Fuente de publicación excluye S1/0025 y sus cambios locales; solo adapta autenticación y configuración del piloto autorizadas. No activar pagos reales ni modificar demo/main. CI/despliegue y comprobación remota se registrarán al cerrar H1.
