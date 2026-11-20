# Pixel Forge Componentes

**Documentación técnica y funcional**

Universidad Argentina de la Empresa (UADE)  
Aplicaciones Interactivas · Trabajo Práctico Obligatorio  
Segundo cuatrimestre de 2026

## Integrantes

| Nombre                            | Legajo  | Correo institucional        |
| --------------------------------- | ------- | --------------------------- |
| Maria Virginia Di Nocera Sapienza | 1175188 | mdinocera@uade.edu.ar       |
| Tomas Agustin Porres              | 1125568 | tporres@uade.edu.ar         |
| Matias Mariano Aleksandrowicz     | 1148777 | maleksandrowicz@uade.edu.ar |

## Docentes

Maria Paula Sarasa y Daniel Gustavo Chultaeiz

<!-- pagina -->

## Índice

| Sección                                 | Página |
| --------------------------------------- | ------ |
| 1. Descripción y alcance                | 3      |
| 2. Sitio público y catálogo             | 4      |
| 3. Administración del comercio          | 5      |
| 4. Diagrama de navegación               | 6      |
| 5. Arquitectura e integración           | 7      |
| 6. Modelo de datos                      | 8      |
| 7. API REST de acceso y catálogo        | 9      |
| 8. API REST de gestión                  | 10     |
| 9. Validaciones, sesión y accesibilidad | 11     |
| 10. Instalación desde cero              | 12     |
| 11. Configuración y mantenimiento       | 13     |
| 12. Pruebas y resultados                | 14     |
| 12.1. Ejecución de las pruebas          | 15     |
| 13. Recorrido de demostración           | 16     |
| 14. Trazabilidad con la consigna        | 17     |
| 15. Código fuente y archivos de entrega | 18     |

La sección 10 permite iniciar el sistema desde una instalación limpia. La sección 13 recorre el sitio público, la administración y la verificación de CORS en el navegador. La sección 14 relaciona esos casos con la consigna.

<!-- pagina -->

## 1. Descripción y alcance

Pixel Forge Componentes es una plataforma web para un comercio de componentes de PC orientado a videojuegos. Permite conocer el comercio, explorar sus productos y enviar consultas. El administrador mantiene el catálogo, publica contenido y gestiona las consultas desde un área privada.

### Roles

| Rol           | Acceso                            | Responsabilidades                                                                                                             |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Visitante     | Sitio público, sin registro       | Consultar información, buscar y filtrar productos, comparar precios disponibles y enviar consultas.                           |
| Administrador | Cuenta registrada y sesión válida | Gestionar perfil, información institucional, categorías, productos, promociones, novedades y consultas. Consultar el Resumen. |

### Límites del trabajo práctico

- El catálogo publica información comercial y canaliza consultas. El flujo de atención se gestiona desde el panel.
- La recuperación de contraseña se demuestra localmente con el código que devuelve la API en desarrollo y pruebas. El sistema está preparado para una demostración local.
- La carga inicial incorpora **6 categorías y 20 productos con fotos locales**. En una base nueva, el administrador configura los datos del comercio, selecciona destacados y crea las promociones que quiera mostrar.

### Recorrido principal

Una persona encuentra un producto, revisa su disponibilidad, precio y galería, y abre Contacto con el asunto precargado. El formulario guarda la consulta en PostgreSQL con estado **Pendiente**. El administrador la abre en el panel, puede marcarla **Leída** o **Respondida**, devolverla a **Pendiente** y eliminarla con confirmación.

<!-- pagina -->

## 2. Sitio público y catálogo

| Pantalla    | Ruta             | Función                                                                                                                         |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Inicio      | `/`              | Presenta la marca, las categorías, los componentes, hasta cuatro destacados activos y las promociones o novedades visibles.     |
| Componentes | `/productos`     | Busca, combina filtros, ordena y navega por páginas de 12 productos.                                                            |
| Detalle     | `/productos/:id` | Presenta nombre, categoría, galería, descripción, disponibilidad y precio en ARS. Permite iniciar una consulta por el producto. |
| Nosotros    | `/nosotros`      | Presenta la descripción e información publicada del comercio.                                                                   |
| Contacto    | `/contacto`      | Muestra datos de contacto y recibe nombre, correo, teléfono opcional, asunto y mensaje.                                         |

### Búsqueda y precio vigente

El texto se busca en el nombre y la descripción del producto. Se puede combinar con categoría, disponibilidad, destacados y límites de precio. Los extremos son opcionales e inclusivos. La búsqueda, los filtros, el orden y la página se reflejan en la URL, por lo que funcionan con recarga y navegación del navegador. **Aplicar precio** vuelve a la primera página. **Limpiar filtros** elimina también los límites.

El **precio vigente** es el de la oferta publicada cuando corresponde y el habitual en los demás casos. La tarjeta y el detalle muestran **Oferta**, el precio habitual tachado y el promocional. La API usa ese mismo importe para filtrar y ordenar. Los productos desactivados quedan fuera de los listados y del detalle público.

### Galería y estados de la interfaz

El detalle permite elegir miniaturas con mouse o teclado. Los 20 productos iniciales tienen fotografías o fotogramas de los modelos correspondientes, optimizados en WebP y servidos por la API. **Créditos de imágenes**, en el pie, reúne la fuente, autoría, licencia y adaptación de cada archivo. Si una imagen falla, se muestra una ilustración de la categoría identificada en la vista principal. La interfaz contempla carga, listas vacías, errores recuperables y enlaces inexistentes.

<!-- pagina -->

## 3. Administración del comercio

| Pantalla                 | Funciones                                                                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resumen                  | Total de productos y consultas, activos e inactivos, disponibilidad, distribución por categoría y consultas por estado. Actualización manual con fecha de la última lectura. |
| Productos                | Alta, edición, eliminación confirmada, visibilidad, disponibilidad, destacados manuales y galerías de hasta 10 imágenes. El listado muestra el precio vigente.               |
| Categorías               | Alta, edición y eliminación de categorías vacías. Se exige una categoría existente por producto. PostgreSQL protege las categorías en uso.                                   |
| Promociones y novedades  | Crear, editar, publicar, volver a borrador y eliminar. Una promoción puede vincular un producto y un precio promocional.                                                     |
| Consultas                | Listado, filtro por estado, detalle, cambio de estado y eliminación confirmada.                                                                                              |
| Información del comercio | Nombre, descripción, dirección, teléfono, redes sociales y horarios. Los datos se consumen desde el área pública.                                                            |
| Mi perfil                | Edición de nombre, apellido, correo y teléfono. El servidor garantiza que el correo sea único.                                                                               |

### Reglas del dashboard y los destacados

Resumen cuenta activos e inactivos, incluye categorías vacías y usa el total de la API por estado de consulta. Las barras muestran cantidades y porcentajes redondeados. Una falla de carga permite reintentar y deja accesibles las acciones del panel.

Inicio muestra hasta cuatro productos activos en Destacados y prioriza las ofertas publicadas. **Solo destacados** incluye las ofertas y los productos marcados manualmente. El filtro y el interruptor administrativos representan la selección manual. Al retirar una oferta, el producto sigue destacado si tiene esa marca.

### Ciclo de una oferta

El formulario abre en **Borrador**. El precio promocional debe ser menor al habitual y se admite hasta una oferta publicada por producto. Al listar o buscar en **Administración → Productos**, se ve el importe promocional, el habitual tachado y la etiqueta **Oferta**. Retirar la oferta recupera el precio habitual. Desactivar el producto oculta su publicación vinculada mientras esté inactivo. Borrarlo elimina sus imágenes y promociones asociadas.

<!-- pagina -->

## 4. Diagrama de navegación

### Navegación pública

```text
Inicio (/)
├─ Componentes (/productos)
│  └─ Detalle (/productos/:id)
│     └─ Contacto con asunto precargado (/contacto?producto=…)
├─ Destacados → catálogo filtrado (/productos?isFeatured=true)
├─ Promociones y novedades → detalle del producto vinculado
├─ Nosotros (/nosotros)
├─ Contacto (/contacto)
├─ Créditos de imágenes (/creditos-imagenes), desde el pie
└─ Acceso admin (/ingresar)
   ├─ Registro (/registrarse)
   └─ Recuperación (/recuperar-contrasena)
      └─ Restablecimiento (/restablecer-contrasena) → Acceso
```

### Navegación con sesión

```text
Administración (/admin) → Resumen
├─ Productos (/admin/productos) → nuevo | :id/editar
├─ Categorías (/admin/categorias) → nueva | :id/editar
├─ Promociones y novedades (/admin/novedades) → nueva | :id/editar
├─ Consultas (/admin/consultas) → :id
├─ Información del comercio (/admin/comercio)
├─ Mi perfil (/admin/perfil)
└─ Cerrar sesión → Ingresar
```

Una visita a una ruta privada sin sesión redirige a Ingresar y conserva el destino solicitado. Luego de ingresar, vuelve a ese destino. Al recargar una ruta privada se comprueba el perfil con la API antes de mostrar el panel. Las rutas desconocidas muestran una página 404.

<!-- pagina -->

## 5. Arquitectura e integración

```text
Navegador
  React + React Router + CSS Modules
          │  fetch /api/v1/... · JSON
          ▼
  Vite en 127.0.0.1:5173 · proxy /api
          │  HTTP · destino configurable mediante API_TARGET
          ▼
  Express en localhost:3000 · rutas y middleware
          │  validación Zod · controlador · repositorio/servicio
          ▼
  PostgreSQL 17 · pg · consultas parametrizadas y transacciones
```

| Capa                    | Organización                                              | Responsabilidad                                                                                                 |
| ----------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Navegación y sesión     | Frontend · `src/App.jsx`, `src/context/`                  | Rutas públicas y privadas, estado de sesión y redirecciones.                                                    |
| Pantallas y componentes | Frontend · `src/pages/`, `src/components/`, `src/styles/` | UI responsive, formularios reutilizables, galerías, avisos, diálogos y listados.                                |
| Integración HTTP        | Frontend · `src/lib/`                                     | Cliente Fetch, token portador, cancelación, traducción de errores, validación local y agregación del dashboard. |
| API y negocio           | Backend · `backend/src/`                                  | Express organiza rutas, middleware, controladores, validadores, servicios y repositorios.                       |
| Persistencia            | Backend · `backend/src/db/`                               | Pool PostgreSQL, migraciones SQL, carga inicial y transacciones.                                                |

Cada repositorio tiene su propio manifiesto y archivo de dependencias bloqueadas. El navegador llama rutas relativas bajo `/api` y el proxy de Vite las reenvía a Express. Para llamadas directas desde otro origen, Express aplica CORS con una lista de orígenes configurada en el backend. Una operación válida de escritura se confirma en la vista después de la respuesta del servidor. Las lecturas obsoletas se cancelan cuando cambia la ruta o el filtro.

### Llamadas directas y CORS

CORS indica al navegador desde qué orígenes puede leer respuestas de la API. Un origen incluye protocolo, host y puerto. Express envía `Access-Control-Allow-Origin` para los orígenes configurados y responde a las solicitudes previas `OPTIONS` para peticiones con cuerpo JSON o el encabezado `Authorization`. Las rutas privadas siguen validando el JWT.

<!-- pagina -->

## 6. Modelo de datos

### Relaciones principales

```text
categories        1 ─── 0..N products
products          1 ─── 1..10 product_images   (regla de la API)
products       0..1 ─── 0..N announcements     (vínculo opcional)
administrators    1 ─── 0..N auth_sessions
administrators    1 ─── 0..N password_reset_tokens
Independientes: store_information, inquiries y schema_migrations.
```

| Tabla                   | Datos y restricciones relevantes                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories`            | Nombre único sin distinguir mayúsculas. El borrado se restringe si hay productos asociados.                                                                           |
| `products`              | Categoría obligatoria, nombre, descripción, imagen principal, precio decimal, disponibilidad, visibilidad y destacado manual. Nombre único sin distinguir mayúsculas. |
| `product_images`        | Clave compuesta producto/posición, de 0 a 9. URLs ordenadas. Borrado en cascada desde el producto.                                                                    |
| `announcements`         | Tipo, título, descripción, publicación y vínculo opcional con producto e importe. Índice único parcial para una oferta publicada por producto.                        |
| `administrators`        | Nombre, apellido, correo único normalizado, teléfono, hash de contraseña y rol de administración.                                                                     |
| `auth_sessions`         | Identificador de sesión, administrador, vencimiento y revocación.                                                                                                     |
| `password_reset_tokens` | Resumen SHA-256 del código, administrador, vencimiento y marca de uso.                                                                                                |
| `store_information`     | Fila única con nombre, descripción, dirección, teléfono, redes en JSONB y horarios.                                                                                   |
| `inquiries`             | Contacto, asunto, mensaje y estado `pending`, `read` o `answered`. Inicialmente `pending`.                                                                            |
| `schema_migrations`     | Versiones aplicadas y fecha de aplicación.                                                                                                                            |

Las escrituras de galería se guardan con el producto en una transacción. Las publicaciones vinculadas y las ediciones de precio habitual bloquean la fila del producto para verificar el importe con datos consistentes. El modelo ampliado está en el anexo de código y archivos de entrega.

<!-- pagina -->

## 7. API REST de acceso y catálogo

Base local `http://localhost:3000/api/v1`. Las rutas de administrador requieren la cabecera `Authorization: Bearer <token>`. Los recursos funcionales se devuelven en `data`. Los listados paginados incluyen también `meta` con página, límite y total.

| Método y ruta relativa                                     | Acceso        | Resultado                                                        |
| ---------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `GET /health`                                              | Público       | Estado del servidor HTTP.                                        |
| `GET /health/ready`                                        | Público       | Disponibilidad de PostgreSQL. Responde 503 si la conexión falla. |
| `POST /auth/register` · `POST /auth/login`                 | Público       | Registro con sesión automática e inicio de sesión.               |
| `POST /auth/logout`                                        | Administrador | Revoca la sesión actual.                                         |
| `POST /auth/forgot-password`                               | Público       | Genera el código si la cuenta existe.                            |
| `POST /auth/reset-password`                                | Público       | Cambia la contraseña y revoca sesiones anteriores.               |
| `GET /profile` · `PATCH /profile`                          | Administrador | Consulta y actualiza datos personales.                           |
| `GET /products` · `GET /products/:id`                      | Público       | Listado y ficha de productos activos.                            |
| `GET /admin/products` · `GET /admin/products/:id`          | Administrador | Listado y ficha. Incluyen productos inactivos.                   |
| `POST /admin/products`                                     | Administrador | Crea un producto con su imagen o galería.                        |
| `PATCH /admin/products/:id` · `DELETE /admin/products/:id` | Administrador | Actualiza campos, visibilidad o galería, o elimina el producto.  |

### Parámetros del catálogo

- `q`, `categoryId` y `availability` filtran texto, categoría y disponibilidad (`in_stock`, `out_of_stock`, `preorder`). `isFeatured` incluye ofertas publicadas en el sitio público y representa la selección manual en Administración, que también admite `isActive`.
- `minPrice` y `maxPrice` filtran el precio vigente. `sort` admite `newest`, `name`, `price_asc`, `price_desc` y `offers_first`. Inicio usa `offers_first` para priorizar las ofertas según su última actualización. `page` parte de 1 y `limit` admite de 1 a 100.
- La API devuelve `price` habitual, `promotionPrice` opcional y `effectivePrice` vigente. La galería usa `imageUrls` y conserva la principal en `imageUrl`. Las fotos WebP y sus créditos se sirven bajo `/media/products/`.

<!-- pagina -->

## 8. API REST de gestión

| Método y ruta relativa a `/api/v1`                                 | Acceso        | Operación                                                                |
| ------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------ |
| `GET /store`                                                       | Público       | Lee datos institucionales.                                               |
| `PUT /store`                                                       | Administrador | Crea o reemplaza los datos institucionales.                              |
| `GET /categories` · `GET /categories/:id`                          | Público       | Lista y consulta categorías.                                             |
| `POST /categories`                                                 | Administrador | Crea una categoría.                                                      |
| `PATCH /categories/:id` · `DELETE /categories/:id`                 | Administrador | Edita o elimina una categoría vacía.                                     |
| `POST /inquiries`                                                  | Público       | Guarda una consulta como pendiente.                                      |
| `GET /inquiries` · `GET /inquiries/:id`                            | Administrador | Lista y consulta mensajes. El listado admite `status`, `page` y `limit`. |
| `PATCH /inquiries/:id/status` · `DELETE /inquiries/:id`            | Administrador | Cambia el estado o elimina la consulta.                                  |
| `GET /announcements`                                               | Público       | Lista promociones y novedades visibles en Inicio.                        |
| `GET /admin/announcements` · `GET /admin/announcements/:id`        | Administrador | Lista publicaciones y borradores, y obtiene una publicación.             |
| `GET /admin/announcements/products`                                | Administrador | Opciones de producto y precio habitual para el formulario.               |
| `POST /admin/announcements`                                        | Administrador | Crea una publicación.                                                    |
| `PUT /admin/announcements/:id` · `DELETE /admin/announcements/:id` | Administrador | Reemplaza los datos y el estado, o elimina la publicación.               |

### Ejemplo de consulta y respuesta

```http
POST /api/v1/inquiries
{"name":"Ana","email":"ana@example.com","phone":null,
 "subject":"Consulta por un SSD","message":"¿Está disponible?"}
```

Un alta válida responde **201**. Las eliminaciones exitosas responden **204**. Un error de validación devuelve `400` y un objeto `error` con `code`, `message` y `details` cuando corresponde. La API devuelve **401** ante una sesión ausente o inválida, **404** para recursos no disponibles y **409** ante conflictos de negocio.

<!-- pagina -->

## 9. Validaciones, sesión y accesibilidad

### Validaciones principales

| Entrada                   | Regla aplicada                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precios                   | Números JSON entre 0 y 9.999.999.999,99 ARS, hasta dos decimales. En filtros de URL se usa punto decimal. Mínimo menor o igual al máximo.                                             |
| Identificadores y estados | Claves enteras positivas en el rango de PostgreSQL. Disponibilidad, tipo de publicación y estado de consulta tienen valores enumerados. Visibilidad y destacados usan booleanos JSON. |
| Galería y enlaces         | 1 a 10 imágenes sin referencias repetidas. Se admiten las fotos WebP del catálogo y URLs HTTP/HTTPS de hasta 2000 caracteres. La primera es la principal.                             |
| Datos personales          | Correo de hasta 320 caracteres, normalizado a minúsculas y único para administradores. Teléfono con al menos cinco dígitos y hasta 50 caracteres. Opcional en consultas.              |
| Contraseñas nuevas        | De 8 a 72 caracteres, con límite adicional de 72 bytes UTF-8. Confirmación en la interfaz. El backend guarda el hash con bcrypt.                                                      |
| Ofertas                   | Producto y precio promocional se indican juntos. El precio de oferta debe ser menor al habitual. Se admite una publicación activa por producto.                                       |

### Sesión y recuperación

El frontend guarda el JWT en `sessionStorage` de la pestaña y verifica el perfil al recargar. Express valida el token y comprueba la sesión activa en PostgreSQL. Cerrar sesión revoca el identificador actual. Restablecer contraseña usa un código de un solo uso con vencimiento y revoca las sesiones previas. En producción la API omite el código de su respuesta.

### Uso con teclado y pantallas pequeñas

El diseño usa modo claro, menú móvil, grillas adaptables y tablas administrativas con desplazamiento interno. La interfaz incluye etiquetas en formularios, mensajes asociados, foco en el primer error, enlace para saltar al contenido y diálogos con foco administrado. Los indicadores de estado tienen texto y las miniaturas se operan con teclado.

<!-- pagina -->

## 10. Instalación desde cero

### Requisitos

Git, Node.js **24.20.0**, npm y PostgreSQL **17** con `psql` y `createdb` disponibles. `fnm` es opcional y usa `.node-version` para elegir Node. Postman sirve para probar la API. Playwright y Chromium se usan en las pruebas de navegador.

### Terminal 1 · API y datos

```bash
git clone https://github.com/matiasalek/Aplicaciones-Interactivas-TPO.git
cd Aplicaciones-Interactivas-TPO
fnm use                         # si se utiliza fnm
# Iniciar PostgreSQL. En macOS con Homebrew:
brew services start postgresql@17
createdb gamer_store             # primera vez
cd backend
npm ci
cp -n .env.example .env
# Revisar DATABASE_URL y JWT_SECRET en .env antes de seguir.
npm run db:setup
npm run dev
```

Configurar `DATABASE_URL` en `backend/.env` con el usuario, puerto y base locales. `db:setup` aplica las nueve migraciones e incorpora seis categorías y veinte productos con fotos. La API queda en `http://localhost:3000`.

### Terminal 2 · Interfaz

```bash
git clone https://github.com/matiasalek/Aplicaciones-Interactivas-TPO-Frontend.git
cd Aplicaciones-Interactivas-TPO-Frontend
fnm use                         # si se utiliza fnm
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173`. Entrar a **Acceso admin → Creá tu cuenta**, completar el registro y cargar la información del comercio. El catálogo inicial queda visible desde el momento en que la API y la base están disponibles.

<!-- pagina -->

## 11. Configuración y mantenimiento

| Variable                                                | Repo     | Uso local                                                                              |
| ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| `NODE_ENV`, `PORT`                                      | Backend  | `development` y `3000` para la demostración.                                           |
| `DATABASE_URL`                                          | Backend  | URL a la base de trabajo, por ejemplo `postgresql://localhost:5432/gamer_store`.       |
| `DATABASE_SSL`, `DATABASE_POOL_MAX`                     | Backend  | TLS y máximo del pool. Valores locales del ejemplo `false` y `10`.                     |
| `JWT_SECRET`                                            | Backend  | Secreto local de firma de al menos 32 caracteres. Usar un secreto propio.              |
| `JWT_EXPIRES_SECONDS`, `PASSWORD_RESET_EXPIRES_MINUTES` | Backend  | Duración de sesión y código. Valores de ejemplo `28800` y `30`.                        |
| `BCRYPT_ROUNDS`                                         | Backend  | Costo del hash configurado en `10` por defecto.                                        |
| `CORS_ALLOWED_ORIGINS`                                 | Backend  | Orígenes HTTP(S) separados por comas. Una lista vacía deshabilita CORS. |
| `API_TARGET`                                            | Frontend | Destino del proxy. Por defecto `http://localhost:3000`. Reiniciar Vite tras cambiarlo. |

### Actualizar una base existente

Con la API detenida, ejecutar `npm run db:migrate` desde `backend/` y reiniciar el servidor. El ejecutor registra cada versión con una transacción. La 006 agrega destacados, la 007 crea las galerías, la 008 agrega promociones y novedades y la 009 instala las fotos en ejemplos que conservan su imagen inicial. Las galerías editadas se preservan.


### Diagnóstico local

Consultar `/api/v1/health` para verificar Express y `/api/v1/health/ready` para verificar PostgreSQL. Si la primera funciona y la segunda devuelve 503, revisar que PostgreSQL esté iniciado y que la URL de la base sea correcta. Si falla el sitio y la API funciona, revisar `API_TARGET` y el puerto de Vite. Los archivos `.env` permanecen locales.

<!-- pagina -->

## 12. Pruebas y resultados

Resultados de la revisión del catálogo con fotos locales, usando Node.js 24.20.0 y bases aisladas. Las pruebas rápidas incluyen la revisión de CORS.

| Conjunto               | Resultado    | Cobertura representativa                                                                                                                  |
| ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend unitarias     | 23 aprobadas | Validaciones, precio, URLs, galería y agregación del dashboard.                                                                           |
| Chromium con API real  | 16 aprobadas | Sitio público, administración, recuperación, promociones, galería, destacados, responsive y errores.                                      |
| Backend rápidas        | 32 aprobadas | Contratos de entrada, imágenes WebP, estados HTTP y CORS con origen permitido, origen ajeno y solicitud previa.                                                                      |
| Backend con PostgreSQL | 32 aprobadas | Autenticación, consultas, categorías, persistencia, galerías, precios y concurrencia de publicaciones.                                    |
| Build y formato        | Aprobados    | `npm run build` y `npm run format:check` en frontend.                                                                                     |
| SQL y migraciones      | Aprobados    | Esquema vacío con 9 migraciones, 6 categorías, 20 productos y 20 fotos iniciales. La 009 preserva galerías y publicaciones administradas. |

### Casos de integración destacados

- El acceso administrativo rechaza visitantes sin sesión. Un correo duplicado se rechaza incluso cuando cambia el uso de mayúsculas. Las sesiones se invalidan al cerrar sesión o al restablecer la contraseña.
- Un error durante la escritura de una galería revierte la modificación. Las pruebas cubren compatibilidad con el campo de imagen anterior y edición simultánea.
- Dos publicaciones concurrentes para el mismo producto permiten una sola oferta. El filtro con límites iguales incluye el precio promocional exacto. Al retirar la oferta vuelve el precio habitual.
- Las pruebas de navegador comprueban el precio de oferta en el listado administrativo, el catálogo, los filtros y la ficha. También verifican que una oferta se incorpore a Destacados al publicarse y se retire al volver a borrador. Las comprobaciones de accesibilidad abarcan recorridos específicos.

<!-- pagina -->

## 12.1. Ejecución de las pruebas

Desde frontend, ejecutar `npm test`, `npm run build` y `npm run format:check`. Para navegador, preparar una base exclusiva y una API de pruebas desde `backend/`:

```bash
createdb gamer_store_e2e
export DATABASE_URL=postgresql://localhost:5432/gamer_store_e2e
NODE_ENV=test npm run db:setup
NODE_ENV=test PORT=3001 npm start
```

En frontend, instalar Chromium una vez con `npx playwright install chromium` y ejecutar:

```bash
API_TARGET=http://127.0.0.1:3001 E2E_ALLOW_WRITES=1 npm run test:e2e
```

Desde backend, ejecutar `npm test`. Para integración, crear una base exclusiva y usar la misma URL de pruebas en ambas variables:

```bash
createdb gamer_store_test
TEST_DATABASE_URL=postgresql://localhost:5432/gamer_store_test \
DATABASE_URL=postgresql://localhost:5432/gamer_store_test \
NODE_ENV=test npm run test:integration
```

Las suites de integración y navegador escriben datos. Usar bases separadas que puedan limpiarse. Para el recorrido en navegador, el puerto 5173 tiene que estar libre.

<!-- pagina -->

## 13. Recorrido de demostración

| Paso | Acción                                                                                                                                | Verificación esperada                                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Abrir Inicio y Componentes. Buscar `Ryzen`, seleccionar categoría o disponibilidad y navegar.                                         | Los 20 productos iniciales están disponibles según los filtros. Buscar, ordenar y recargar mantiene los parámetros en la URL.     |
| 2    | Abrir un detalle y pulsar **Consultar por este producto**. Enviar primero el formulario vacío y luego uno válido.                     | El asunto se precarga. El foco va al primer error. La consulta válida queda persistida como Pendiente.                            |
| 3    | Ir a `/admin/consultas` sin sesión, registrarse y volver al destino solicitado.                                                       | El acceso está protegido. El correo repetido se rechaza y la consulta aparece en el panel.                                        |
| 4    | Marcar la consulta Leída, Respondida y Pendiente. Modificar el perfil y el comercio.                                                  | Los filtros reflejan los cambios. Los datos publicados aparecen en Nosotros, Contacto y el pie.                                   |
| 5    | Crear una categoría y asignarla a un producto. Agregar dos imágenes, reordenarlas y probar el destacado manual.                       | La principal cambia en las tarjetas, la galería responde al teclado y el producto aparece entre los destacados activos.           |
| 6    | Quitar la selección manual y publicar una oferta vinculada. Buscar el producto en Administración y filtrar por precio en el catálogo. | Se muestra el precio de oferta en Administración. El producto aparece en Destacados y el catálogo filtra por el importe vigente.  |
| 7    | Desactivar y reactivar el producto. Volver la promoción a borrador.                                                                   | La inactividad oculta el producto y su anuncio. Retirar la oferta restaura el precio habitual y deja vigente la selección manual. |
| 8    | Actualizar Resumen. Cerrar sesión y recuperar contraseña con el código de desarrollo.                                                 | Los conteos reflejan el estado actual. La nueva contraseña funciona y se revocan sesiones anteriores.                             |

Para la revisión visual, recorrer Inicio, catálogo y administración en anchos de 375, 768, 1024 y 1440 píxeles. Probar el menú móvil, foco, miniaturas, mensajes y desplazamiento interno de tablas.

### Verificación de CORS en el navegador

Configurá `CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173` en `backend/.env` y reiniciá Express. Abrí ese frontend y probá esta llamada desde la consola.

```js
await fetch("http://127.0.0.1:3000/api/v1/health").then(r => r.json())
```

Devuelve `{ status: "ok" }`. En **Network**, la llamada directa usa el puerto 3000 y lleva `Access-Control-Allow-Origin` con el origen del frontend. Las llamadas vía Vite usan el puerto 5173.

<!-- pagina -->

## 14. Trazabilidad con la consigna

### Obligatorios implementados

| Bloque de la consigna       | Evidencia en la entrega                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Sitio público y contacto    | Sección 2 y pasos 1 a 2. Catálogo consultable, información del comercio y consultas persistidas.                                          |
| Registro, sesión y perfil   | Secciones 3, 7 y 9. Registro, correo único, inicio, cierre, recuperación y modificación de datos.                                         |
| Información institucional   | Secciones 3 y 8. Creación y edición desde el panel y lectura pública.                                                                     |
| Productos y categorías      | Secciones 2, 3, 6 y 7. Gestión, activación, categoría obligatoria y 20 productos iniciales.                                               |
| Gestión de consultas        | Secciones 3, 8 y 13. Listado, cambios de estado y eliminación.                                                                            |
| Roles y requisitos técnicos | Secciones 1, 4, 5 y 9. Aplicación responsive separada en React y Express, REST, PostgreSQL, autorizaciones y validaciones en ambos lados. |
| Documentación y entregables | Secciones 4, 6, 10 y 15. Navegación, modelo, instalación, código y script SQL.                                                            |

### Funcionalidades adicionales

| Extra                              | Estado                                                                                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard con métricas             | Implementado con datos de la API y actualización manual.                                                                                                                         |
| Múltiples imágenes por publicación | Implementado con galería ordenada y selección de imagen principal.                                                                                                               |
| Buscador avanzado                  | Implementada la combinación de texto, categoría, disponibilidad, destacados, rango de precios, orden y paginación. La calificación del extra depende del criterio de la cátedra. |
| Promociones o novedades            | Implementado con gestión de publicaciones y precios de oferta en catálogo.                                                                                                       |
| Publicaciones destacadas           | Implementado con selección administrativa y visibilidad pública.                                                                                                                 |

<!-- pagina -->

## 15. Código fuente y archivos de entrega

| Material                   | Ubicación                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Código frontend            | [Aplicaciones-Interactivas-TPO-Frontend](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO-Frontend) · versión de referencia [`964288d`](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO-Frontend/commit/964288d3bb3643257f9d9ab90802556400b498e5).                                                                          |
| Código backend             | [Aplicaciones-Interactivas-TPO](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO) · versión de referencia [`9c829ad`](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/commit/9c829ad60287c4c610b7b2d6dfd639d54cf213d7).                                                                                                     |
| Script de creación         | [`backend/database/create_database.sql`](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/blob/9c829ad60287c4c610b7b2d6dfd639d54cf213d7/backend/database/create_database.sql) y [migraciones SQL](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/tree/9c829ad60287c4c610b7b2d6dfd639d54cf213d7/backend/src/db/migrations). |
| Modelo relacional ampliado | [`backend/docs/BASE_DE_DATOS.md`](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/blob/9c829ad60287c4c610b7b2d6dfd639d54cf213d7/backend/docs/BASE_DE_DATOS.md), con relaciones, restricciones y consultas de inspección.                                                                                                               |
| Prueba de la API           | [Guía de Postman](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/blob/9c829ad60287c4c610b7b2d6dfd639d54cf213d7/backend/docs/PRUEBAS_CON_POSTMAN.md) y colección en `backend/postman/`. Las rutas de publicaciones de esta versión están en la sección 8.                                                                              |
| Recorrido manual           | [Guía de pruebas del frontend](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO-Frontend/blob/964288d3bb3643257f9d9ab90802556400b498e5/docs/PRUEBAS_MANUALES.md).                                                                                                                                                                       |
| Consigna                   | `TPO Segundo Cuatrimestre 2026.pdf`, en la raíz del repositorio del backend.                                                                                                                                                                                                                                                                       |

Los commits enlazados identifican el código fuente de la entrega, con fotos locales, precios de oferta en Administración, destacados automáticos y CORS configurable en Express. Las [fotos WebP y sus créditos](https://github.com/matiasalek/Aplicaciones-Interactivas-TPO/tree/9c829ad60287c4c610b7b2d6dfd639d54cf213d7/backend/public/catalog-media) se incluyen en el repositorio del backend.
