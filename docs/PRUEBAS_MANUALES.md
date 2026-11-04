# Recorrido de verificación manual

Iniciar la API y PostgreSQL, ejecutar `npm run dev` y abrir http://127.0.0.1:5173.

## Sitio público

1. Recorrer Inicio, Componentes, Nosotros y Contacto.
2. Verificar las seis categorías y al menos veinte productos iniciales con la API preparada.
3. Buscar `Ryzen`, cambiar categoría, disponibilidad y orden. Avanzar y retroceder páginas; recargar y comprobar que la URL conserva los filtros.
4. Abrir un producto: comprobar todos sus datos y que el enlace de consulta precarga el asunto.
5. Enviar contacto vacío: comprobar validaciones locales y foco en el primer campo inválido. Probar correo inválido y teléfono opcional vacío.
6. Enviar una consulta válida y verificar confirmación. Comprobar su existencia desde administración.

## Sesión y administración

1. Abrir `/admin/productos` sin sesión: debe mostrar acceso y regresar al destino al ingresar.
2. Registrarse y probar el mismo correo desde otra sesión: debe mostrarse el conflicto.
3. Editar el perfil, recargar y comprobar persistencia.
4. Completar datos del comercio, horarios y redes. Consultar Nosotros, Contacto y el pie público.
5. Crear, editar y eliminar una categoría vacía.
6. Crear un producto con categoría, descripción, imagen, precio y disponibilidad. Editarlo y comprobar persistencia.
7. Intentar borrar su categoría: debe informar que tiene productos asociados.
8. Desactivar el producto: debe desaparecer del catálogo público y seguir disponible al editar en administración. Activarlo nuevamente.
9. Eliminar el producto con confirmación, luego eliminar la categoría.
10. Abrir una consulta y marcarla como leída, respondida y pendiente. Verificar los filtros y eliminarla con confirmación.
11. Cerrar sesión: volver a abrir una ruta privada y comprobar que requiere acceso.

## Dashboard administrativo

1. Abrir Administración → Resumen. Comprobar carga, fecha de actualización, cuatro tarjetas y distribuciones de disponibilidad, consultas y categorías.
2. Comparar productos activos e inactivos con los listados; su suma debe coincidir con el total. La disponibilidad y las categorías también incluyen los inactivos.
3. Cambiar la visibilidad o disponibilidad de un producto en otra pestaña. Pulsar Actualizar y comprobar los nuevos conteos sin recargar la página.
4. Enviar una consulta desde Contacto; verificar que aumentan las pendientes y el total al actualizar. Cambiar su estado y repetir.
5. Crear una categoría vacía: debe aparecer con cero productos. Sin productos o consultas, deben mostrarse ceros y mensajes vacíos, sin porcentajes inválidos.
6. Detener la API y actualizar: comprobar error y reintento, con accesos de gestión disponibles. Reiniciar la API y pulsar Volver a intentar.
7. Revisar en 375, 768, 1024 y 1440 píxeles, sin desborde horizontal. Comprobar que las cantidades se entienden sin depender del color de las barras.

## Recuperación

1. Generar código para una cuenta existente.
2. Continuar con el código precargado y elegir una nueva contraseña confirmada.
3. Comprobar que la contraseña anterior deja de servir y la nueva permite iniciar sesión.
4. Reutilizar el código: debe informar que es inválido o fue utilizado.
5. Probar un correo inexistente: el resultado debe ser genérico.

## Errores, accesibilidad y responsive

- Detener la API temporalmente: debe aparecer error de conexión y botón de reintento donde corresponda. Reiniciarla y reintentar.
- Probar rutas inexistentes y un identificador de producto inválido.
- Probar una URL de imagen inaccesible: debe mostrar ilustración identificada como alternativa.
- Recorrer con Tab y Shift+Tab, incluyendo menú móvil, formularios y diálogo de eliminación.
- Comprobar anchos de 375, 768 y 1440 píxeles. Las tablas administrativas se desplazan dentro de su contenedor; la página no debe desbordar horizontalmente.
- El aspecto debe permanecer claro aunque el sistema operativo use modo oscuro.

No ejecutar las pruebas automatizadas con datos que se quieran conservar. Las pruebas E2E requieren una API contra una base aislada de pruebas.
