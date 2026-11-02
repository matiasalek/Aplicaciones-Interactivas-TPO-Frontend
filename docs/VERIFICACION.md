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
