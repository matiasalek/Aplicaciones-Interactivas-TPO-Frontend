# Verificación de la primera versión

La primera versión se verificó con Node.js 24.20.0 y Chromium. Se utilizó el código existente del backend, sin modificaciones, conectado a un clúster PostgreSQL 17 temporal en el puerto 55439 y una base exclusiva `pixel_forge_test`. Se aplicaron las cinco migraciones y el seed existentes a esa base aislada.

## Resultados

- Compilación con Vite aprobada.
- Siete pruebas unitarias de validación y utilidades aprobadas.
- Seis pruebas de navegador aprobadas contra la API y PostgreSQL reales.
- Revisión visual de capturas de Inicio y Administración en escritorio y móvil.
- Sin desborde horizontal de la página en los anchos probados: 375, 768, 1024 y 1440 píxeles. Las tablas administrativas tienen desplazamiento horizontal propio.
- Sin violaciones detectadas por axe en las comprobaciones WCAG A/AA incluidas para Inicio, Contacto y Resumen administrativo. Esto es una comprobación automatizada de esas pantallas, no una certificación de accesibilidad completa.
- Modo claro comprobado incluso al emular una preferencia de sistema oscuro.

## Recorridos automatizados

1. Catálogo real con al menos veinte productos, búsqueda, paginación, recarga de filtros, detalle y consulta con asunto precargado; validaciones de contacto vacío.
2. Navegación móvil, filtro por disponibilidad, modo claro y accesibilidad del formulario.
3. Error de conexión, reintento, página 404, identificador inválido y protección de rutas administrativas.
4. Correo duplicado mostrado en el registro, regreso al destino privado al ingresar y redirección al revocarse una sesión en el servidor.
5. Pantallas públicas en tablet y escritorio mediano sin desborde horizontal.
6. Registro con sesión real; edición y persistencia de perfil e información institucional; CRUD de categoría y producto; precio actualizado; activación y desactivación; bloqueo de categoría en uso; contacto público y gestión de estados de consultas; recuperación y nueva contraseña; revocación del JWT anterior; eliminación de registros creados y cierre de sesión.

Los datos de estas pruebas son temporales; no se cargaron en la base de demostración. Las capturas, trazas y resultados del navegador están excluidos de Git. Las pruebas se pueden reproducir siguiendo el README y usando una API con una base aislada.

## Verificación del dashboard

El dashboard se verificó con Node.js 24.20.0 y Chromium contra el backend existente, sin cambios, conectado a un clúster PostgreSQL 17 nuevo y aislado en el puerto 55449, base `pixel_forge_dashboard_test` y API en el puerto 3002. Se aplicaron las cinco migraciones y el seed originales. No se utilizó la base de demostración.

- Once pruebas unitarias aprobadas: las siete anteriores y cuatro del dashboard. Cubren agregación de 205 productos en tres páginas, visibilidad, disponibilidad, categorías vacías, consultas con más de 100 registros según `meta.total`, ceros, error de API y cambios detectables durante la paginación.
- Siete pruebas de navegador aprobadas: las seis anteriores y un recorrido del dashboard con conteos reales, creación y cambio de estado de consultas, actualización después de cambiar visibilidad, errores, reintento y estados vacíos simulados mediante interceptación de respuestas.
- Revisión visual de capturas del dashboard en 1440 y 375 píxeles; sin desborde horizontal en 375, 768, 1024 y 1440.
- Sin violaciones detectadas por axe en la comprobación incluida del dashboard en móvil; se mantienen las comprobaciones de las pantallas anteriores.
- Build de producción y verificación de formato aprobados.

Las capturas y trazas permanecen excluidas de Git. Las solicitudes entre endpoints no forman una transacción: las métricas son una lectura del estado actual, sin garantías de instantánea única si otros administradores modifican datos mientras cargan.

## Verificación de productos destacados — 13 de noviembre de 2026

Se verificaron ambos proyectos con Node.js 24.20.0, Chromium y PostgreSQL 17 temporal en el puerto 55459. La API de navegador utilizó el puerto 3003 y la base `pixel_forge_featured_e2e`, con las seis migraciones y el seed. La integración del backend utilizó otra base, `pixel_forge_featured_integration`. No se utilizaron datos de demostración.

- Frontend: doce pruebas unitarias aprobadas y nueve de navegador aprobadas, incluidos todos los recorridos anteriores.
- Backend: quince pruebas rápidas y diecisiete de integración aprobadas; se agregaron tres pruebas de validación y cinco de integración de destacados.
- El recorrido nuevo cubre creación desde formulario con destacado inicialmente desmarcado, edición y persistencia, interruptor del listado, filtros administrativos en URL, sección de hasta cuatro productos, acceso a todos los destacados y combinación con categoría. Comprueba identificación en detalle, exclusión de inactivos, conservación de la selección al desactivar/reactivar y conservación de precio/visibilidad al quitar el destacado.
- Se verifican selección vacía, catálogo sin resultados, limpieza de filtros y error/reintento de la sección. Un PATCH fallido muestra el error y conserva el estado previo del interruptor.
- La integración real comprueba booleanos estrictos, valor por defecto, autenticación, filtros combinados con búsqueda y disponibilidad, orden, paginación, totales y conservación de destacados al repetir el seed.
- Una base separada con las primeras cinco migraciones y veinte productos se actualizó a la sexta: se compararon todos los datos anteriores de productos y categorías, incluidos identificadores y fechas. Se conservaron sin cambios y todos los productos quedaron sin destacar. Repetir el migrador no aplicó cambios adicionales.
- Se probó `backend/database/create_database.sql` sobre otra base vacía; luego el migrador reconoció las seis versiones y el seed cargó los veinte productos.
- Revisión visual de la sección y listado administrativo en escritorio/móvil, y del formulario y detalle en escritorio. Sin desborde horizontal de Inicio y el listado en 375, 768, 1024 y 1440 píxeles.
- Sin violaciones detectadas por axe en las comprobaciones incluidas de Inicio con destacados y el listado administrativo móvil; se mantienen las anteriores. No constituye una auditoría completa de accesibilidad.

Los servicios temporales se detuvieron al finalizar. Para revisar una instalación anterior, aplicar `npm run db:migrate` desde el backend y reiniciar la API, como indica el README. La funcionalidad no agrega dependencias.

## Revisión posterior: validaciones de entrada

El 13 de noviembre de 2026 se alinearon precios, identificadores, URLs, correos, teléfonos y contraseñas entre ambos proyectos. Se usaron nuevas bases aisladas en PostgreSQL 17, puerto 55469 (`pixel_forge_validation_integration` y `pixel_forge_validation_e2e`), y una API temporal en 3004. No se utilizó ni migró la base de demostración; no se agregaron dependencias ni migraciones.

- Frontend: dieciocho pruebas unitarias y once de navegador aprobadas; se conservaron todos los recorridos anteriores.
- Backend: veintidós pruebas rápidas y veintiuna de integración aprobadas. Las entradas rechazadas se compararon contra los datos anteriores para comprobar que no se crearan ni modificaran registros.
- Regresión de precios: números finitos, cero, centavos como `0.29`, máximo permitido, decimales adicionales y rechazo de nulos, booleanos, arreglos y cadenas en la API. Identificadores validados dentro del rango integer de PostgreSQL, con respuesta `400` ante valores fuera de rango.
- Regresión de imágenes y redes: URLs completas HTTP/HTTPS, espacios exteriores y límite de 2000 caracteres; rechazo de FTP, JavaScript, datos embebidos y URLs incompletas.
- Correos con el mismo formato práctico en frontend/backend y normalización antes de validar en la API. Teléfonos con al menos cinco dígitos, separadores habituales y teléfono opcional en contacto.
- Registro y restablecimiento comprueban el límite de 72 bytes UTF-8 para contraseñas nuevas, incluidos emojis; el inicio de sesión conserva compatibilidad con credenciales existentes.
- Navegador: los formularios inválidos no generan solicitudes de escritura; los mensajes y estados accesibles se corrigen al editar. Se comprobó el guardado real de `0.29` sin redondeo.
- Se corrigió un problema del formulario: al salir del último campo hacia Enviar, un error podía desplazar el botón durante el clic. La validación de ese caso se realiza en el envío y las pruebas comprueban que un único clic muestre errores y enfoque el primero.

Build y formato aprobados. Los servicios temporales se detuvieron al finalizar. El detalle del contrato de la API está en `backend/docs/VALIDACIONES.md` del repositorio del servidor.
