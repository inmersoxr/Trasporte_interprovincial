# Administración empresarial e identidad — entrega de piloto

## Cómo entrar

Abre la aplicación habitual, inicia sesión y entra en **Operadores**. Selecciona tu empresa. En la consola Premium, **Administración de empresa** abre la gestión empresarial sin cambiar de cuenta ni de base de datos. **Identidad de empresa** aparece en la configuración del perfil público. Se exige membresía empresarial; conocer un enlace no concede permisos.

La navegación empresarial tiene cinco destinos: Operación, Equipo, Clientes y proveedores, Finanzas y Reportes. Cada destino muestra subtareas relacionadas; las acciones de crear, pagar, programar y revisar aparecen dentro de su contexto. En móvil la navegación permanece abajo; en escritorio se convierte en barra lateral. El marketplace y el demo no reciben el tema de la empresa.

## Estado funcional y evidencia

Todas las rutas siguientes son `/api/premium/enterprise` salvo Identidad. El frontend las consume mediante el proxy existente `/standard-api`. Implementación: `cloudflare-dev/premium-enterprise.mjs`, `business/app.mjs`, `business/business.css`; migración aditiva `0028_enterprise_management.sql`.

| Módulo | Implementación de piloto | Endpoints / persistencia |
|---|---|---|
| Centro de operaciones | Flota, asignación vigente y último GPS real; no posiciones inventadas | `/fleet`, `premium_assignments`, `standard_gps_*` y operaciones existentes |
| Vehículos / kilometraje | Reutiliza fichas existentes; historial de odómetro manual y segmentos GPS válidos, estimación diferenciada | `/vehicle-history`, `premium_odometer_history` |
| Mantenimiento | Planes por aceite, neumáticos, frenos, documentación u otros; fecha/km; programación en calendario existente; actualización al completar; notificaciones deduplicadas | `/component-plans`, `/component-plan-update`; `premium_component_plans`, `premium_maintenance` |
| Personal / turnos | Fichas laborales editables, cuenta de conductor opcional, turnos sin solapamientos, asignación durante turno activo | `/employees`, `/employee-update`, `/employee-status`, `/shifts`, `/shift-state`; `premium_employees`, `premium_shifts` |
| Remuneraciones | Borrador por periodo, base/extras/deducciones explícitos, detalle y CSV; publicación crea cuenta por pagar | `/payroll`, `/payroll-lines`, `/payroll-post`, `/payroll-void`; `premium_payroll_runs/lines` |
| Venta directa | Comparte inventario, precios, reservas y QR del marketplace; canal oficina persistente | `/direct-sale`; `bookings.sales_channel` |
| Clientes / proveedores | Directorios aislados por empresa, edición y vinculación con documentos | `/partners`, `/partner-update`; `premium_partners` |
| Cobrar / pagar | Documentos, vencimientos, cobros/pagos parciales simulados, reverso único y saldos calculados en servidor | `/documents`, `/payments`, `/document-payments`, `/document-void`; `premium_business_documents/payments` |
| Gastos | Reutiliza libro de gastos existente y comprobantes; vinculación a cuenta por pagar evita duplicar coste | `/premium/expenses`, `premium_expenses`, R2 existente |
| Liquidaciones | Servicios completados compartidos/privados/personalizados, revisión, aprobación y registro simulado; sin transferencia | `/settlements`, `/settlement-state`; tablas existentes y `premium_settlement_custom_items` |
| Facturación | Datos de emisor en entorno de pruebas y preparación JSON claramente no fiscal | `/issuer`, `/fiscal/:id`; `premium_fiscal_settings` |
| Informes / rentabilidad | Periodos en hora Ecuador; ventas por vehículo/ruta, costes directos y costes sin ruta separados; CSV | `/report`; ventas, gastos y documentos existentes |
| Permisos | Premium efectivo + empresa + rol en backend; personal laboral no concede acceso a cuentas | Guardias existentes y en `premium-enterprise.mjs`; dueño/admin gestionan finanzas, dispatcher venta directa/flota |

**Facturación electrónica no está conectada:** `/fiscal-submit` rechaza con 503. Falta integración firmada con certificado del emisor, secuencias y adaptador SRI probado. Un JSON preparado no tiene validez fiscal. No se abrió una integración real ni se llamó al facturador SRI de producción.

Las remuneraciones son registros de gestión configurados por el usuario; no calculan por sí solas obligaciones laborales, IESS ni impuestos. Los márgenes son de gestión, no contabilidad certificada. Ningún pago, reverso o liquidación de esta entrega mueve dinero real.

## Identidad de empresa

Implementación: `standard-company-identity.mjs`, `company/editor.mjs`, `company/theme.mjs`; migración `0027_company_identity.sql` sobre perfiles y almacenamiento R2 existentes.

`GET/POST /api/company-identity`: información básica y logo Standard; tres colores libres HEX, portada, galerías generales/de vehículos/instalaciones Premium. Editor en cuatro etapas, recorte de imágenes, transparencia PNG en logos, vista previa pública/administrativa, borrador, publicar, cancelar, restaurar apariencia y retirar personalización. Cambios guardados se recuperan dinámicamente; no recompilan aplicaciones. Revisión optimista evita sobrescribir cambios simultáneos. Imágenes y vehículos ajenos se rechazan.

Perfil público existente `/miniapp/?operator=…`: identidad, servicios/contacto, viajes, flota, opiniones verificadas y reservas; enlace compartible y QR. No se inventan valoraciones ni viajes. Colores semánticos de seguridad y tipografía RutasEC se conservan. Standard o Premium vencido reciben apariencia predeterminada.

## Criterios UX utilizados

- Navegación principal reducida y adaptable: [Android, patrones de navegación](https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns).
- Edición progresiva por etapas y contexto: [WAI, formularios multipágina](https://www.w3.org/WAI/tutorials/forms/multi-page/).
- Confirmación de guardado, errores junto a la tarea y conservación de datos: [WAI, notificaciones de formularios](https://www.w3.org/WAI/tutorials/forms/notifications/).
- Contraste de texto calculado a partir de la paleta, acciones contextuales, diálogos con validación y confirmación de descarte, objetivos táctiles y ausencia de desbordamiento a 360/390/1280px.

Estas verificaciones no sustituyen pruebas de usabilidad con operadoras. No se declara UX perfecta ni accesibilidad certificada.

## Pruebas y límites de aceptación

Pruebas de integración D1/R2: `company-identity.test.mjs`, `enterprise.test.mjs`. Incluyen dos Premium y un Standard, borrador/publicación, cambio simultáneo, aislamiento de medios/roles, plan vencido, turnos solapados, pagos simultáneos por encima del saldo, idempotencia, reverso duplicado, nómina, mantenimiento, venta de oficina sobre inventario compartido y liquidación única. Prueba de navegación real: `identity-local.e2e.mjs`, `enterprise-local.e2e.mjs`; también regresión Alpha, correo, plataforma y GPS.

Las empresas de aceptación son locales y no se siembran en el catálogo público. No se prueban datos empresariales privados en producción. Google/correo reales requieren la configuración externa ya identificada; GPS físico y segundo plano Android conservan sus límites documentados. Seguridad avanzada S1/0025 permanece pospuesta, sin publicarse.

Despliegue y resultado final: consultar snapshot fechado de entrega. Rollback: recuperar Workers anteriores manteniendo migraciones aditivas; no borrar tablas ni datos. No hay nuevos servicios de pago ni infraestructura duplicada; crece almacenamiento y consultas con el uso, polling de flota solo mientras la vista está visible.
