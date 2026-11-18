# Snapshot RutasEC — 2026-11-18 — Standard: onboarding y continuidad Codex

## Base comprobada
Repositorio `inmersoxr/Trasporte_interprovincial`, rama `main`, HEAD observado antes de este snapshot: `fa2c7df394fcac52b3481bc483ab0d55dfedd014` (2026-11-14). Se inspeccionaron `AGENTS.md`, `PROJECT_MEMORY.md`, `docs/ROADMAP.md`, `README.md`, `app.js`, `bookings.mjs` y `shared/live-config.mjs`. Este snapshot es documental: NO acredita pruebas ejecutadas, despliegue nuevo ni finalización de fases.

## Decisiones vigentes — prevalecen
1. Standard primero, Premium empresarial después. Preservar íntegro el demo GitHub Pages, incluyendo pantallas Premium de demostración, mapas, reservas, QR, PWA, SOS, simulación y seguimiento. No alterar datos ni API R2 demo para desarrollar Standard.
2. Trabajo secuencial J1→J8 según `AGENTS.md` y `docs/ROADMAP.md`. La prioridad inmediata es **verificar el estado real de Cloudflare Work**: D1 dev, migraciones, Worker, bindings, endpoint, pruebas y rollback. El historial indica acceso expirado; NO asumir que está pendiente ni que se desplegó.
3. Frontend Cloudflare Workers Static Assets independiente para desarrollo Standard, con API por entorno; GitHub Pages permanece intacto. No confundir commit con deploy.
4. Tres modalidades distintas: compartido por asiento; privado de tarifa fija con fecha/hora propia y vehículo completo; privado personalizado competitivo con ofertas visibles conforme llegan y elección libre del pasajero.
5. Sin cobros reales; pagos simulados hasta la última fase autorizada. No introducir módulos empresariales Premium durante Standard.

## Nueva definición funcional: alta de operadores Standard
**Objetivo:** habilitar un operador legalmente elegible para publicar y gestionar viajes usando el backend multi-tenant común. Registro de cuenta NO equivale a autorización para publicar ni a habilitación legal.

Flujo propuesto para especificar y ejecutar cuando corresponda en J3, respetando dependencias J1/J2 e identidad/roles:
- **Cuenta:** nombre, teléfono, correo y autenticación segura; verificación de contacto. No almacenar contraseñas en claro.
- **Tipo y vinculación:** conductor, operadora/empresa o miembro de una operadora; una persona puede ser conductor sin ser propietaria del vehículo. La relación entre usuarios, operadores, conductores y vehículos es explícita, no duplicada.
- **Perfil básico de operadora:** nombre comercial, contacto, datos identificativos empresariales cuando correspondan, cobertura/rutas y enlace público propio. Perfil Standard con información esencial; reputación verificable y moderación según fase; sin personalización avanzada Premium.
- **Vehículo:** tipo (auto, SUV, van, minibús según catálogo), marca, modelo, año, color, placa, capacidad de pasajeros, fotografías, estado, propietario/operadora asociada y documentos con vencimientos. Placa como identificador de registro verificable; evitar duplicados indebidos y no exponer datos sensibles en perfiles públicos.
- **Conductor:** identidad, licencia y categoría/vigencia, vinculación con operadora y vehículos autorizados. Soportar múltiples conductores/vehículos por operadora sin exigir una cuenta nueva por unidad.
- **Documentación y revisión:** cédula, licencia, matrícula, seguros/revisión y títulos habilitantes aplicables a modalidad y jurisdicción; estos requisitos son CANDIDATOS sujetos a validación normativa en Ecuador, no una lista legal exhaustiva. Estados sugeridos: draft → submitted → under_review → approved / changes_requested / rejected / suspended. Registrar quién y cuándo verificó, y vencimientos; permisos efectivos desde backend.
- **Activación:** solo operadores/vehículos/conductores aprobados y elegibles pueden publicar viajes; mantener capacidad de editar y corregir datos con auditoría. Definir reglas de revalidación y expiración documental.
- **Operación Standard:** publicar/editar rutas y salidas, tarifa y cupos; gestionar reservas, manifiestos, QR, abordajes, estados, seguimiento y resumen comercial básico; nunca privar Standard de funciones indispensables para operar.
- **Arquitectura:** users ↔ operator_memberships/roles ↔ operators ↔ drivers/vehicles ↔ route_offers/departures ↔ bookings/seats/payments simulados. Aislamiento por `operator_id` y autorización por tenant en servidor; no confiar en el frontend. Diseñar para reutilizar los mismos registros en Premium futuro, sin bifurcar backend.
- **UX:** onboarding progresivo, borrador persistente, errores claros, estado de revisión y documentos faltantes. Mantener UI aprobada y experiencia móvil.

## Diferenciación Standard/Premium
Standard: sin SaaS empresarial avanzado, perfil público básico, publicación de viajes, reservas, vehículos/conductores, operaciones esenciales y reputación asociada a viajes. Premium futuro: SaaS multioperadora modular, miniapp/página de marca configurable, galerías, contenidos, promociones, gestión avanzada de flota, personal, mantenimiento, sucursales, finanzas y analítica. Misma identidad y datos comunes. **Precio SaaS Premium y límites definitivos pendientes de definición**. No asumir precios ni porcentajes de comisión como definitivos sin validación comercial.

## Estado técnico y cautelas
- `README.md` describe frontend estático GitHub Pages y demo compartido con Worker/R2; `shared/live-config.mjs` apunta a `https://rutasec-viajes-sync.cebx3001.chatgpt.site`.
- `bookings.mjs` contiene estado de acceso de operador `rutasec-operator-access`, catálogo, panel, reservas, QR y operaciones. No confundir este acceso demo con autenticación comercial verificada.
- El estado actual de Cloudflare D1 y frontend independiente NO fue comprobado en consola durante esta revisión.
- Incidente observado en un teléfono externo: Android solicita Chrome al abrir PWA y enlace; otros dispositivos abren GitHub Pages. No hay causa raíz confirmada. Registrar como incidencia PWA por diagnosticar, sin cambiar manifest/identidad ni atribuirla sin evidencia a cambios recientes.

## Handoff obligatorio para Codex
1. Leer `AGENTS.md`, `PROJECT_MEMORY.md`, `docs/ROADMAP.md` y el snapshot más reciente; inspeccionar HEAD y trabajo paralelo antes de editar.
2. Verificar J1 de manera objetiva (Cloudflare/D1/Worker/URL/bindings/migraciones/pruebas/rollback); si no hay acceso, documentar bloqueo y NO inventar despliegue.
3. Completar J2 solo después de J1 verificada; mantener GitHub Pages y demo R2 intactos.
4. En J3 diseñar/implementar el onboarding Standard descrito arriba, con identidad/roles, aislamiento, persistencia, vehículos y conductores, y publicación condicionada a aprobación. Primero comparar con código existente para no duplicar módulos.
5. Ejecutar una tarea/fase verificable por vez, con pruebas negativas de autorización, validación, persistencia, sesiones y regresión; documentar resultados y nuevo snapshot por hito.
6. No implementar Premium funcional ni pasarela real, no rediseñar la UI aprobada y no modificar la demo pública sin pruebas y rollback.

## Estado de este hito
**Verificado:** contenido de los archivos y HEAD GitHub citados; reglas y roadmap vigentes. **No verificado:** despliegues Cloudflare, pruebas de extremo a extremo, legalidad documental específica, funcionalidad productiva del onboarding. **Cambio:** solo documentación de alcance/onboarding. **Rollback:** revertir el commit documental, sin impacto en frontend/API.
