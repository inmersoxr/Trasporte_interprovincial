# UX1 — consola de operadoras como aplicación

El usuario actualiza main84bc16f con propuesta de cinco pestañas y solicita expresamente simplificar la interfaz, agrupar tareas y separar públicos. Esta instrucción autoriza el ajuste visual sobre Cloudflare; sustituye la espera de autorización indicada en la propuesta original. Main/Pages/demo intactos. Rama funcional antes de cambios:cef8800; no hay trabajo de código paralelo en ella. Misma infraestructura/API/esquema0020.

## Implementación
- Standard: navegación inferior persistente Inicio, Viajes, Reservas, Flota y Más. Una pantalla principal visible. Opciones secundarias por contexto: rutas/salidas/recurrentes; manifiesto/embarque/historial/solicitudes; vehículos/conductores; empresa/documentos/cuenta. Inicio con resumen real y accesos a tareas.
- Pasajero conserva búsqueda, reservas y boletos en navegación independiente. Gestión de operadora abre un contexto distinto, con regreso a vista de pasajero desde Más/Cuenta. Recarga, URL y Atrás conservan pantalla. Cuenta/instalación quedan en Más durante gestión, liberando cabecera. Demo sigue accesible por su URL independiente, fuera de la navegación habitual.
- Premium adopta las mismas cinco entradas; Viajes/Reservas enlazan a consola Standard con operadora y pantalla seleccionadas, sin duplicar procesos. Flota/mantenimiento y Más/equipo/finanzas/marca reutilizan herramientas existentes. Contenedores de navegación separados de los hidden que controlan los permisos: no se reemplazan comprobaciones de rol ni se habilitan planes/cobros nuevos.
- Se trasladan nodos/formularios existentes conservando handlers, IDs, datos y estado. Guardias de carga documental aplicadas también a formularios movidos. Salir de pantalla detiene cámara. SW incorpora módulos nuevos; backend y esquema no cambian.
- Nueva memoria main se conserva como propuesta histórica; implementación y límites actuales quedan arriba en PROJECT_MEMORY.

## Pruebas locales
54/54 npm test PASS136.5s, incluida regresión de autorización, asientos, horarios, documentos, Premium y demo. Alpha Chromium PASS29.8s: varios contextos, expediente/revisión, viajes recurrentes, compra persistente, último asiento, QR decodificado de vídeo simulado, embarque/replay, nueva sesión; ahora navegando por pestañas. Cinco pantallas con capturas390px, una visible, recarga en conductores, regreso pasajero y Atrás; Premium activo solo como fixture local, flota/finanzas en secciones distintas. Google/correo siguen SIMULADOS en este harness. Revisadas capturas Inicio/Flota; no desbordamiento360/390/1280. Ajustes menores posteriores de cabecera/indicador de pestaña se verifican en CI antes de integrar.

La primera prueba usaba las ubicaciones anteriores de controles ahora ocultos: se actualizó el recorrido para abrir sus pantallas, sin forzar clics sobre elementos ocultos. También se adaptó la inserción de recurrentes para conservar el padre real del nodo movido. `git diff --check` PASS; fuentes originales Pages/demo idénticas.

## Entrega y límites
Al escribir este snapshot: código local, todavía sin despliegue de UX1. Se entrega mediante PR a rama Cloudflare y CI existentes; registrar resultado antes de afirmar disponibilidad. Sin infraestructura/migraciones/exportaciones ni servicios externos nuevos. Rollback: volver solo assets/módulos de navegación a versión Alpha previa, conservando API0020, guards y datos; sin alterar Pages. Futuro centro corporativo completo, Apple, funcionalidades Premium adicionales y cobros reales permanecen fuera del cambio. OAuth/correo reales y teléfonos físicos continúan pendientes.

## Correcciones de contexto comprobadas
Se conserva en URL la operadora elegida al cambiar pestañas/empresa; prueba con dos empresas y recarga PASS. Regresar a pasajero elimina filtro de empresa para volver al marketplace completo. Formularios movidos mantienen hidden sin selección e inert durante carga/error; una respuesta fallida no permite enviar datos de otra empresa. Browser prueba503 y recuperación. Último recorrido local PASS29.2s.

## Integración
PR4 integrado en codex/cloudflare-standard-junior como f4fa4734be2889fa59b9dc936b5a879be8a27272, head0b5dc5ba8d914d808c98291b06b4d01898c382fd. Actions44420682393 SUCCESS:54 tests y tres recorridos Chromium PASS sobre código final. Despliegue en curso al registrar esta línea; verificar cierre antes de afirmar publicación. Main/Pages intactos.

## Cierre remoto UX1
Actions44420942765 SUCCESS: https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/44420942765 . Repite54 tests y tres recorridos de navegador, despliega Workers existentes sin migraciones nuevas. Fuente desplegada f4fa4734be2889fa59b9dc936b5a879be8a27272; PR4 https://github.com/inmersoxr/Trasporte_interprovincial/pull/4 integrado solo en rama funcional. Verificación PR final44420682393 SUCCESS.

Comprobación remota Chromium PASS: navegación pasajero independiente, cinco destinos operadora, una pantalla visible, formularios ocultos sin empresa, recarga de Flota, regreso al catálogo general y Atrás/cuenta,360/390/1280 sin desbordamiento; Premium no muestra gestión sin acceso. Sin errores JS, cuentas/publicaciones/reservas de prueba remotas ni cambios de datos privados. El harness remoto conserva la excepción de certificado del proxy administrado en Chromium; curl valida TLS normalmente.

Health200/API0020/D1/R2true. Auth/config sigue google=false,email=false: faltan credenciales OAuth y remitente/transporte autorizado; no se afirma acceso real habilitado. Google/buzón/activación Premium/todas las transacciones de la prueba completa fueron fixtures locales, sin pagos reales ni expansión Premium. Cámara/teléfonos físicos siguen pendientes.

Pages200 conserva SHA256c8f347d3bc0431c5b77aa75a6588e1ae4c5152a5960acb88b7f97480c0cb8f6f. Fuentes y workflow Pages intactos. Main84bc16f conceptual se incorporó como referencia sin escribir main. Sin recursos nuevos, compras ni exportaciones. Rollback de assets a Alpha previa conserva backend/schema0020 y registros; no se ejecutó rollback remoto por este cambio. Siguiente trabajo dependiente: activación de Google/correo y piloto real; centro corporativo completo conserva su planificación separada.
