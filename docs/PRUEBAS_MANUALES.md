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

## Productos destacados

1. Si se actualiza una instalación anterior, detener la API, ejecutar `npm run db:migrate` desde `backend/` y reiniciarla. Los productos previos deben conservar sus datos y quedar sin destacar.
2. Crear un producto: **Destacar producto** comienza desmarcado. Marcarlo, guardar y recargar la edición para comprobar persistencia. Repetir al editar un producto existente.
3. Desde el listado, destacar y quitar de destacados; comprobar mensajes, bloqueo durante el envío y filtros **Destacados / Sin destacar** combinados con categoría, búsqueda y visibilidad. Recargar y comprobar que los filtros persisten en URL.
4. Abrir Inicio: mostrar hasta cuatro destacados activos, del más reciente al más antiguo, con identificación y enlace a todos. Un producto común no debe aparecer en esa selección.
5. Abrir **Ver todos los destacados**: comprobar el filtro **Selección → Solo destacados**, combinarlo con búsqueda, categoría, disponibilidad y orden. Paginar, recargar, retroceder y limpiar filtros.
6. Abrir un destacado y comprobar la identificación junto a la disponibilidad. Quitar el destacado: debe seguir en el catálogo si está activo.
7. Desactivar un destacado: debe desaparecer de Inicio, catálogo y detalle público, manteniendo la selección en administración. Reactivarlo: debe volver a aparecer.
8. Sin destacados, comprobar el estado vacío de Inicio y que el catálogo general siga disponible. Interrumpir la solicitud de destacados y reintentar: la sección informa el error sin bloquear el resto del inicio.
9. Revisar Inicio y administración en 375, 768, 1024 y 1440 píxeles; las tablas se desplazan dentro de su contenedor, sin desbordar la página. Comprobar teclado, etiquetas y estados de los interruptores.

## Galerías de imágenes

1. Con la API detenida, aplicar `npm run db:migrate` en el backend y reiniciarla. Un producto anterior debe mantener su imagen como única principal, sin cambios en precio, disponibilidad, visibilidad o destacado.
2. Crear un producto con tres URLs HTTP/HTTPS. Agregar filas y comprobar vistas previas. Probar una fila vacía, FTP y una URL repetida: deben mostrar errores por imagen y enfocar la primera inválida al enviar.
3. Mover una imagen arriba y abajo. La primera debe quedar como principal. Guardar, recargar y comprobar todas las URLs y su orden.
4. Abrir catálogo y destacados: deben usar la principal. Abrir el detalle, seleccionar miniaturas con clic y con Tab/Enter y comprobar el contador y el cambio de imagen.
5. Probar una imagen inaccesible: debe mostrar la alternativa de categoría sin impedir elegir otras.
6. Editar precio o visibilidad conservando las imágenes. Quitar una imagen intermedia y luego la principal: debe promoverse la primera restante. No se permite quitar la última.
7. Agregar diez imágenes: debe deshabilitarse Agregar imagen. Eliminar una: debe volver a habilitarse. Comprobar que el servidor también rechace más de diez, colecciones vacías y URLs repetidas.
8. Eliminar el producto con confirmación; comprobar que la API deje de devolverlo y no queden filas suyas en `product_images`. No se eliminan archivos en los sitios que alojan las URLs.
9. Revisar detalle y editor en 375, 768, 1024 y 1440 píxeles, sin desborde de página. La fila de miniaturas puede desplazarse dentro de su contenedor.

## Recuperación

1. Generar código para una cuenta existente.
2. Continuar con el código precargado y elegir una nueva contraseña confirmada.
3. Comprobar que la contraseña anterior deja de servir y la nueva permite iniciar sesión.
4. Reutilizar el código: debe informar que es inválido o fue utilizado.
5. Probar un correo inexistente: el resultado debe ser genérico.

## Validaciones de entrada

1. En Contacto, Registro y Perfil, probar un correo con puntos consecutivos (`ana..p@example.com`): debe rechazarse. Un correo con `+` y un dominio normal debe aceptarse.
2. Probar teléfono `abcde`, solo guiones y `12-34`: deben rechazarse. `+54 (11) 4444-5555` debe aceptarse; en Contacto el teléfono vacío sigue siendo válido.
3. En productos, probar precio `1.000000001`: debe informar el límite de dos decimales; `0`, `0.29` y `123.45` deben guardarse sin redondeo. La API debe rechazar también precio nulo, booleano o en texto, y categoría booleana.
4. Probar `ftp://example.com/a.png` como imagen y `ftp://example.com` como red social: deben rechazarse localmente y en la API. Probar URLs HTTP/HTTPS completas y el límite de 2000 caracteres.
5. En Registro y Restablecimiento, probar diecinueve emojis de cuatro bytes: deben rechazarse por exceder el límite; dieciocho deben pasar la validación de longitud. Comprobar la confirmación de contraseña.
6. Corregir un campo con error: debe actualizar su mensaje y estado accesible. Enviar con un único clic desde el último campo inválido: deben mostrarse los errores y enfocarse el primero sin necesitar otro clic.

## Errores, accesibilidad y responsive

- Detener la API temporalmente: debe aparecer error de conexión y botón de reintento donde corresponda. Reiniciarla y reintentar.
- Probar rutas inexistentes y un identificador de producto inválido.
- Probar una URL de imagen inaccesible: debe mostrar ilustración identificada como alternativa.
- Recorrer con Tab y Shift+Tab, incluyendo menú móvil, formularios y diálogo de eliminación.
- Comprobar anchos de 375, 768 y 1440 píxeles. Las tablas administrativas se desplazan dentro de su contenedor; la página no debe desbordar horizontalmente.
- El aspecto debe permanecer claro aunque el sistema operativo use modo oscuro.

No ejecutar las pruebas automatizadas con datos que se quieran conservar. Las pruebas E2E requieren una API contra una base aislada de pruebas.
