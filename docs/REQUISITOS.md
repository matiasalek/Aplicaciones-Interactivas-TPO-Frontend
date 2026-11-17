# Cobertura de la consigna

Fuente de verdad: `TPO Segundo Cuatrimestre 2026.pdf`, de cuatro páginas, ubicado en el repositorio del backend. Este archivo describe la implementación; no reemplaza la consigna.

## Requisitos obligatorios

| Requisito del PDF                  | Pantallas / implementación                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Información general y contacto     | Inicio, Nosotros, Contacto y pie de página; datos de `/store`.                                                        |
| Catálogo y navegación              | `/productos`, detalle `/productos/:id`; paginación real de la API.                                                    |
| Búsqueda y categorías              | Texto, categoría, disponibilidad y rango de precios; filtros almacenados en URL.                                      |
| Datos de cada publicación          | Nombre, categoría, imagen o ilustración identificada, descripción, precio ARS y disponibilidad.                       |
| 20 productos precargados           | Se consumen los 20 productos del seed existente. No se cargan datos ficticios en el frontend.                         |
| Registro del administrador         | `/registrarse`: nombre, apellido, correo, teléfono, contraseña y confirmación.                                        |
| Correos únicos                     | Validación de formato local y mensaje del conflicto `EMAIL_CONFLICT` del servidor.                                    |
| Inicio y cierre de sesión          | `/ingresar` y acción de cierre real mediante `/auth/logout`.                                                          |
| Recuperación de contraseña         | `/recuperar-contrasena` y `/restablecer-contrasena`, con código para el entorno académico local.                      |
| Edición del perfil                 | `/admin/perfil`: nombre, apellido, correo y teléfono.                                                                 |
| Información institucional          | `/admin/comercio`: nombre, descripción, dirección, teléfono, redes y horarios; creación y actualización mediante PUT. |
| Crear, editar y eliminar productos | `/admin/productos`, formulario nuevo y de edición, confirmación de eliminación.                                       |
| Activar y desactivar               | Interruptor en listado y casilla en formulario; productos inactivos ocultos por la API pública.                       |
| Categoría obligatoria              | Selector requerido; sin categorías se ofrece crear una antes de agregar productos.                                    |
| CRUD de categorías                 | `/admin/categorias`, alta, edición y eliminación con aviso de categoría en uso.                                       |
| Formulario de contacto             | Nombre, correo, teléfono opcional, asunto y mensaje. POST a `/inquiries`; confirmación después de persistir.          |
| Gestión de consultas               | Listado, detalle, filtro de estado, cambio a pendiente/leída/respondida y eliminación confirmada.                     |
| Roles                              | Visitante accede al sitio público; administrador autenticado accede a `/admin/*`.                                     |
| React, HTML, CSS, JavaScript       | React + Vite, JSX, CSS Modules; sin TypeScript.                                                                       |
| React Router                       | Navegación declarativa con rutas anidadas, rutas protegidas y página 404.                                             |
| Componentes reutilizables          | Layouts, formulario, campos, botones, avisos, tarjetas, paginación y diálogo.                                         |
| API REST y persistencia            | Fetch a la API existente; PostgreSQL sigue siendo la fuente de datos.                                                 |
| Validaciones de formularios        | Reglas locales, errores por campo y validaciones independientes del servidor.                                         |
| Autenticación y autorización       | JWT, perfil validado, manejo de expiración y autorización del backend.                                                |
| Manejo de errores                  | Fallos de conexión, errores de negocio traducidos, estados vacíos y reintentos.                                       |
| Diseño responsive                  | Navegación móvil, grillas adaptables, formularios de una columna y tablas desplazables.                               |
| Separación frontend/backend        | Repositorios independientes; comunicación por API REST mediante proxy local.                                          |

## Extra implementado: dashboard con métricas y estadísticas

En `/admin`, el Resumen muestra total de productos, activos e inactivos, distribución por disponibilidad y categoría, y consultas por estado. Incluye barras con cantidades y porcentajes, categorías vacías, actualización manual, fecha de actualización, carga, error y reintento. Consume exclusivamente los endpoints existentes; no agrega bibliotecas ni modifica el backend.

Los conteos de productos incluyen todas las páginas y los inactivos. Las consultas utilizan `meta.total` por estado. No se presentan estadísticas históricas ni de ventas.

## Extra implementado: productos destacados

Administración permite marcar y desmarcar productos destacados desde el listado y desde el formulario de alta/edición, con filtro de selección. Inicio publica hasta cuatro destacados activos y enlaza al catálogo filtrado. Las tarjetas y el detalle identifican la selección. Se mantienen búsqueda, categoría, disponibilidad, orden, paginación y filtros en URL.

El backend incorpora `isFeatured`, validaciones, filtro público/administrativo y una sexta migración SQL, también incluida en el script de creación. Los productos previos quedan sin destacar; el seed conserva las selecciones. Los inactivos permanecen ocultos públicamente aunque sean destacados. La selección es independiente de la disponibilidad y no tiene límite ni orden manual.

## Extra implementado: múltiples imágenes por publicación

Los productos admiten de una a diez URLs HTTP/HTTPS ordenadas, con principal en la primera posición. Administración permite agregar, quitar y reordenar con botones; valida cada URL, el límite y los duplicados. El detalle público presenta miniaturas seleccionables con mouse o teclado, posición actual y alternativa local ante fallos de carga. Las tarjetas usan la principal.

La migración `007_create_product_images.sql` crea la relación de imágenes y conserva las existentes. Altas y ediciones se guardan en una transacción, con bloqueo de la fila al editar. El contrato anterior `imageUrl` sigue disponible junto a `imageUrls`; editar otros campos o repetir el seed conserva la galería. Eliminar un producto elimina sus imágenes en cascada. No se agregaron dependencias ni carga de archivos.

## Extra implementado: promociones y novedades

El administrador puede crear, editar, publicar, volver a borrador y eliminar promociones o novedades. Inicio muestra las publicaciones visibles. Una promoción vinculada a un producto muestra el precio promocional y el habitual tanto en Inicio como en el catálogo y el detalle. El filtro y el orden por precio usan el importe vigente de la API.

## Ampliación del buscador: rango de precios

El catálogo permite precio mínimo y máximo opcionales en ARS, aplicados al pulsar un botón. Los límites son inclusivos y se combinan con los filtros, orden y paginación existentes. Se validan importes no negativos con hasta dos decimales y mínimo menor o igual al máximo en frontend y backend. La URL conserva los límites; aplicar un rango reinicia la página y limpiar filtros los elimina. La ampliación se limita al rango de precios acordado.

## Documentación de entrega

- Descripción funcional: README y esta matriz.
- Modelo de datos: `backend/docs/BASE_DE_DATOS.md`, en el repositorio del servidor.
- Diagrama de navegación y arquitectura: `ARQUITECTURA.md`.
- Manual de instalación: README del frontend y README del servidor.
- Código fuente: ambos repositorios.
- Script de creación de base: `backend/database/create_database.sql`.

## Decisiones acordadas

- Tema: componentes para videojuegos. Marca: Pixel Forge Componentes.
- Estética sobria y minimalista, exclusivamente modo claro.
- Ejecución local; no se requiere publicación en Internet.
- Se implementan los requisitos obligatorios, el dashboard, los productos destacados, las múltiples imágenes, las promociones y novedades y la ampliación del buscador con precio mínimo y máximo.
- No se integra correo real. La recuperación se demuestra con el código devuelto en desarrollo/pruebas.
- No se implementan carrito, pagos, envíos ni asistente de armado de PC.
- El backend se amplía para persistir y filtrar destacados, gestionar galerías de imágenes mediante URLs y filtrar por rango de precios, sin carga de archivos ni proveedor externo de almacenamiento.
