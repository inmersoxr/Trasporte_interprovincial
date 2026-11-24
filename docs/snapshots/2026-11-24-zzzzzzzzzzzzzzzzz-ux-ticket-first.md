# UX-05 — primero el boleto


## UX-05 — boleto y navegación de pasajero

EN PRUEBAS de publicación. El boleto/QR ocupa el primer plano; cuenta queda debajo y opciones de instalación/notificaciones se agrupan en un desplegable. No se elimina ninguna función. Navegación marca un único destino activo al abrir Mis viajes; botones conservan tipografía/contraste del sistema. Regresión local AlphaPASS55s y bus70/tramos/ventanilla/QRPASS20s; comprobaciones de teclado entre pisos, fallo503/reintento, una pestaña activa y opciones accesibles mediante desplegable. Captura real móvil revisada.

UX-04 fuente d2b6ab6c7939916a9d11d560839e2305beb08125: workspacePASS69s, enterprisePASS10s e identidadPASS10s locales; CI45510823523 superó81pruebas pero falló por selector parcial de Mis viajes que también encontraba Notificaciones de mis viajes. Se corrige el selector a exact:true sin omitir ninguna comprobación. No declarar deployUX04 aprobado por esa ejecución. UX05 incluye corrección y debe superar flujo completo y publicación efectiva. Sin migraciones ni cambios de datos o permisos.
