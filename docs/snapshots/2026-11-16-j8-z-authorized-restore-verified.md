# Respaldo actual D1 — restauración temporal autorizada y verificada

## Autorización y alcance
El usuario respondió «Si» a la propuesta concreta de exportar D1 al runner GitHub y restaurarlo temporalmente, sin publicar el dump. Se reintentó solo después de esa autorización; no se eludió el rechazo anterior ni se cambió a otro destino. Cuenta/base exclusivamente dev fijadas en script; demo y R2 originales fuera de alcance.

Código localc3c07da, remoto c4b15da4596f42c9842e398e16ddc5874100d072. Run https://github.com/inmersoxr/Trasporte_interprovincial/actions/runs/43911145328 SUCCESS. Job verify133453045989 SUCCESS (22 tests); restore-check133453197653 SUCCESS; deploy SKIPPED intencionalmente: no se cambiaron versiones ni datos de aplicación.

## Ejecución y resultados
verify-d1-restore.py usa Secrets para solicitar export D1 por HTTPS, espera snapshot completo y descarga enlace firmado sin reenviar bearer. Dump limitado32MiB, directorio temporal privado, archivo0600, restauración SQLite en memoria. No se ejecuta SQL sobre D1 remoto ni se restaura destructivamente.

Log seguro 2026-11-16T16:46:38.7378928Z:
- restore=PASS,29 tablas.
-15 reservas compartidas/fijas,6 personalizadas,7 salidas (conteos, no registros individuales).
- PRAGMA integrity_check=ok; foreign_key_check sin incidencias.
- Sin asientos activos duplicados ni slots de vehículos activos solapados.
- SHA256 del SQL restaurado:5462f0bde85722a25c470fc9da205a48b38a434b7f95bd53ee9c1c21519b1529.
- temporaryDumpRemoved=true; artifactsPublished=false; durableBackupCreated=false.

No se registraron SQL, filas, nombres, hashes de sesión ni enlaces firmados en logs. Metadatos/sumas únicamente. La eliminación del directorio se comprueba antes de emitir PASS y se ejecuta también ante error. El dump temporal del runner no se conserva; no se afirma borrado físico de objetos temporales internos que Cloudflare gestione para exportación.

## Cierre y límites
Prueba de export/restauración actual: VERIFICADA. Este hito no crea almacenamiento duradero ni certifica recuperación remota de producción. Tras registrar evidencia se retira trigger por push; futuras ejecuciones solo manual verify_restore opt-in. No hay cron/automatización de exportaciones ni publicación de artefactos. Consumo de lecturas/CI no medido, sin upgrade de plan ni pagos reales.

Comprobación posterior del retiro: Actions43911773082 SUCCESS; verify SUCCESS, restore-check SKIPPED y deploy SKIPPED. Consulta de artefactos del run de respaldo43911145328: total_count=0. Health de aplicación permanece j7-operations-v1/schema0006, sin redespliegue. main sigue fa2c7df.

Código de aplicación y demo intactos; ninguna regresión de UI por este cambio de verificación. Rollback: deshabilitar job/script, sin rollback de datos porque no se modificó la fuente. Siguiente revisión Senior/piloto: política de respaldo duradero autorizada, retención/cifrado, recuperación remota y controles comerciales.
