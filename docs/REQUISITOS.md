# Cobertura de la consigna

Fuente de verdad: `TPO Segundo Cuatrimestre 2026.pdf`, de cuatro páginas, ubicado en el repositorio del backend. Este archivo describe la implementación; no reemplaza la consigna.

## Requisitos obligatorios

| Requisito del PDF                  | Pantallas / implementación                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Información general y contacto     | Inicio, Nosotros, Contacto y pie de página; datos de `/store`.                                                        |
| Catálogo y navegación              | `/productos`, detalle `/productos/:id`; paginación real de la API.                                                    |
| Búsqueda y categorías              | Búsqueda por texto y selector de categoría; filtros almacenados en URL.                                               |
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
| Separación frontend/backend        | Repositorios independientes; proxy local, sin cambios al servidor.                                                    |

## Extra implementado: dashboard con métricas y estadísticas

En `/admin`, el Resumen muestra total de productos, activos e inactivos, distribución por disponibilidad y categoría, y consultas por estado. Incluye barras con cantidades y porcentajes, categorías vacías, actualización manual, fecha de actualización, carga, error y reintento. Consume exclusivamente los endpoints existentes; no agrega bibliotecas ni modifica el backend.

Los conteos de productos incluyen todas las páginas y los inactivos. Las consultas utilizan `meta.total` por estado. No se presentan estadísticas históricas ni de ventas.

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
- Se implementan todos los requisitos obligatorios. Se agrega el dashboard como funcionalidad de puntaje extra; los demás extras quedan para una etapa opcional.
- No se integra correo real. La recuperación se demuestra con el código devuelto en desarrollo/pruebas.
- No se implementan carrito, pagos, envíos ni asistente de armado de PC.
- No se modifica el backend. Cada producto conserva una sola URL de imagen; múltiples imágenes figuran como extra en la consigna.
