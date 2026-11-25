# Publicación adicional V2 en GitHub Pages

El usuario pide explícitamente publicar el mockup en GitHub Pages. La entrega de código sigue en mockup-v2. Se prepara un artefacto aditivo: raíz = copia del main actual; subruta mockup-v2/ = dist de V2. main y sus archivos no se modifican.

Cambios exclusivos en mockup-v2: workflow pages.yml de esta rama, script de empaquetado, README y memoria. El workflow de main permanece intacto. Build y deploy separados para que el artefacto esté disponible antes de desplegar. No se cambian servicios, bases de datos ni código de Entity/Scorpio.

La publicación comparte el sitio Pages existente del repositorio. Una futura publicación desde main puede retirar la subruta V2; una convivencia permanente automática requiere coordinar el workflow principal, que no se altera por la restricción explícita de rama.

Estado al preparar: empaquetado local comprobado; ejecución y verificación remotas pendientes. No confundir URL prevista con despliegue confirmado.
