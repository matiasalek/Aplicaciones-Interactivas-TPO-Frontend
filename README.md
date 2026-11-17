# Pixel Forge Componentes — Frontend

Frontend del TPO de Aplicaciones Interactivas, separado del repositorio del backend. Incluye el sitio público y el área de administración con React, JavaScript, React Router y CSS Modules. La interfaz utiliza exclusivamente modo claro y está adaptada a dispositivos móviles.

La fuente de verdad es **TPO Segundo Cuatrimestre 2026.pdf**, conservado sin cambios en el repositorio hermano `Aplicaciones-Interactivas-POO`. Los requisitos se relacionan con las pantallas en [docs/REQUISITOS.md](docs/REQUISITOS.md).

## Ejecución local

Requisitos: Node.js 24 (`.node-version`), npm y el backend actualizado con PostgreSQL, sus nueve migraciones y su carga inicial de al menos 20 productos.

1. Iniciar PostgreSQL y la API siguiendo el README del backend. La API debe escuchar en `http://localhost:3000`.
2. En este repositorio:

   ```bash
   fnm use
   npm ci
   npm run dev
   ```

3. Abrir **http://127.0.0.1:5173**.

No es necesario agregar CORS: el servidor de Vite reenvía `/api` al backend. Si la API escucha en otro puerto, copiar `.env.example` a `.env` y ajustar `API_TARGET`; reiniciar Vite después. No se necesita publicar el proyecto.

Si ya tenías el backend anterior, detené la API, ejecutá `npm run db:migrate` desde su carpeta `backend/` y reiniciala antes de usar esta versión. La migración 009 incorpora las fotos locales a los ejemplos del catálogo que siguen con su imagen original.

Si PostgreSQL o la API están detenidos, las pantallas muestran un error con la posibilidad de reintentar. No se sustituyen los datos reales por datos ficticios.

## Funcionalidad

- Inicio, catálogo con búsqueda por texto, categoría, disponibilidad, precio mínimo/máximo, orden y paginación.
- Detalle del producto con galería de imágenes, descripción, precio y disponibilidad; consulta con asunto precargado.
- Información del comercio, dirección, teléfono, redes y horarios obtenidos de la API.
- Formulario de contacto persistido en PostgreSQL.
- Registro, inicio y cierre de sesión, recuperación y restablecimiento de contraseña.
- Rutas administrativas protegidas y recuperación del destino solicitado al iniciar sesión.
- CRUD de productos y categorías, activación/desactivación y gestión de consultas.
- Productos destacados: selección desde el listado y formulario administrativos, sección en Inicio, filtro de catálogo e identificación en tarjetas y detalle.
- Galerías de una a diez imágenes por producto mediante URLs, con orden e imagen principal administrables.
- Promociones y novedades administrables con borradores. Las ofertas vinculadas a productos se aplican también al catálogo, los filtros y el orden por precio.
- Dashboard en Administración → Resumen: totales de productos, visibilidad, disponibilidad, categorías y consultas por estado, con actualización manual.
- Edición de información institucional y datos personales del administrador.
- Validaciones locales alineadas con los contratos del backend, estados de carga, errores y confirmaciones de eliminación.

La identidad visual es Pixel Forge Componentes; el nombre institucional y los datos publicados se gestionan en Administración → Información del comercio.

En Componentes, **Precio mínimo (ARS)** y **Precio máximo (ARS)** son opcionales. Pulsar **Aplicar precio** para filtrar; se incluyen ambos extremos y se puede completar uno solo. Se admiten importes no negativos con hasta dos decimales y el mínimo no puede superar al máximo. El rango se conserva en la URL al buscar, cambiar otros filtros, ordenar, paginar y recargar. Aplicar un rango vuelve a la primera página; **Limpiar filtros** también elimina los límites de precio.

## Dashboard administrativo

El Resumen muestra métricas reales del estado actual del comercio. La disponibilidad y las categorías incluyen productos activos e inactivos. Las barras muestran cantidad y porcentaje sobre el total de productos o consultas, según corresponda; los porcentajes se redondean a enteros y pueden no sumar exactamente 100 %.

Se carga al entrar y se vuelve a consultar con **Actualizar**. Incluye la fecha de última actualización, estados vacíos y reintento ante errores. Los accesos de gestión siguen disponibles si falla la carga. No agrega dependencias ni requiere cambios al backend.

Las métricas describen el estado actual, sin historial ni actualización en tiempo real. Las consultas se cuentan con los totales filtrados de la API; los productos se recorren en páginas de hasta 100. Las solicitudes no forman una transacción única: si se modifica el catálogo durante la lectura y se detectan cambios de total o productos repetidos, se pide reintentar.

## Primera demostración

1. Registrarse desde Acceso admin → Creá tu cuenta. Se inicia sesión automáticamente.
2. Completar Información del comercio. Los datos aparecen en Nosotros, Contacto y el pie público.
3. Revisar las categorías y los 20 productos precargados.
4. Crear una categoría y un producto, editarlo, desactivarlo y comprobar que desaparece del catálogo público. Activarlo nuevamente.
5. Enviar una consulta desde el sitio público y gestionarla en Administración → Consultas.
6. Modificar el perfil y cerrar sesión.
7. Probar la recuperación de contraseña con una cuenta existente.

## Productos destacados

En Administración → Productos se puede destacar o quitar de destacados con un interruptor, o con **Destacar producto** al crear y editar. El filtro administrativo distingue todos, destacados y sin destacar; puede combinarse con categoría, búsqueda y visibilidad, y se conserva en la URL.

El inicio muestra hasta cuatro destacados activos, ordenados del más reciente al más antiguo, con un enlace a todos los destacados del catálogo. El filtro **Selección → Solo destacados** se combina con los demás filtros, orden y paginación. Las tarjetas y el detalle muestran una identificación de destacado junto a la disponibilidad.

No hay límite de productos destacados ni orden manual. Un producto inactivo conserva su selección, pero queda oculto en todo el sitio público; vuelve a aparecer al activarlo. Quitar el destacado no desactiva el producto. La disponibilidad sigue siendo independiente: un destacado puede estar sin stock o a pedido.

Los productos existentes y los nuevos quedan sin destacar por defecto. La migración no selecciona productos automáticamente y repetir el seed conserva las selecciones del administrador. Sin destacados, el inicio muestra un estado vacío y el resto del catálogo sigue disponible. La sección incluye carga, error y reintento. No se agregaron dependencias.

## Galería de imágenes

En el formulario de producto se pueden agregar de una a diez URLs públicas HTTP/HTTPS, de hasta 2000 caracteres cada una. **Agregar imagen** incorpora una fila; los botones de subir y bajar cambian el orden, y eliminar quita una imagen del formulario. La primera es la principal y se utiliza en tarjetas del catálogo y destacados. Para cambiarla, mover la imagen elegida al primer lugar. Siempre debe quedar al menos una imagen.

Las filas incluyen una vista previa, validaciones por imagen y control de URLs repetidas. Los cambios se guardan al pulsar **Crear producto** o **Guardar producto**. El detalle público permite seleccionar miniaturas con mouse o teclado y muestra la posición actual; un producto con una sola imagen conserva la presentación simple.

El backend devuelve `imageUrls` en orden y conserva `imageUrl` como primera imagen por compatibilidad. La actualización de producto y galería es transaccional. La migración preserva las imágenes anteriores, el seed respeta galerías administradas y la eliminación del producto borra sus registros de imágenes, sin modificar archivos remotos. No se suben archivos ni se agregan dependencias.

## Promociones y novedades

En Administración → Promociones y novedades se puede crear, editar y eliminar una publicación. Elegí el tipo, completá el título y el texto y guardala como **Borrador** o **Publicada**. Inicio muestra las publicaciones visibles desde la más reciente.

Una promoción puede asociarse a un producto con un precio menor al habitual. Las tarjetas y el detalle muestran **Oferta**, el precio habitual tachado y el precio promocional. El rango y el orden usan el precio vigente. Se permite hasta una promoción publicada por producto. Volverla a borrador o eliminarla restablece el precio habitual. Desactivar el producto oculta también su anuncio público hasta que vuelva a estar activo.

## Validaciones

Todos los formularios validan antes de enviar y el backend vuelve a validar los datos de manera independiente. Los precios admiten desde cero hasta 9.999.999.999,99 ARS con hasta dos decimales, sin redondear valores inválidos. La interfaz convierte precio y categoría a números JSON; la API rechaza texto, booleanos y nulos en esos campos.

Imágenes y redes requieren URLs completas HTTP/HTTPS de hasta 2000 caracteres. El correo usa el mismo formato práctico en ambos lados; el servidor elimina espacios exteriores y lo guarda en minúsculas. Los teléfonos admiten al menos cinco dígitos, hasta 50 caracteres y los separadores habituales: espacios, puntos, guiones, paréntesis y `+` al inicio, sin imponer un país.

Las contraseñas nuevas requieren entre 8 y 72 caracteres y no pueden exceder 72 bytes UTF-8, límite de la biblioteca de contraseñas. Con emojis o letras acentuadas, el máximo de caracteres puede ser menor. El inicio de sesión conserva la compatibilidad con credenciales existentes. La confirmación se comprueba en la interfaz; la unicidad de correos, las relaciones y los permisos se garantizan en el servidor y la base de datos.

## Recuperación de contraseña para el TP

No se integra un proveedor de correo. Con el backend en desarrollo o pruebas, la pantalla muestra el código generado por la API y permite pasar directamente al formulario de nueva contraseña. El código también se puede pegar manualmente. No se guarda en almacenamiento persistente ni se agrega a la URL desde la pantalla de recuperación. Al restablecer, el backend revoca las sesiones anteriores.

## Sesión y autorización

El JWT se conserva en `sessionStorage` de la pestaña y se valida contra `/profile` al recargar. La interfaz no guarda contraseñas. Un `401` en operaciones autenticadas elimina la sesión local y redirige al acceso. Un error de conexión permite reintentar sin confundirlo con una sesión inválida. El cierre de sesión requiere que el backend confirme su revocación; si está desconectado, se informa el error.

Las rutas privadas del frontend son una ayuda de navegación; la autorización efectiva sigue a cargo de la API existente.

## Imágenes y enlaces

Los veinte ejemplos cargados desde cero incluyen fotografías o fotogramas de los modelos correspondientes, optimizados en WebP y servidos por el backend. En el pie se accede a **Créditos de imágenes**, con la fuente, autoría, licencia y adaptación. La galería conserva esas fotos locales y admite imágenes personalizadas mediante URLs HTTP/HTTPS. Si falla una imagen, se muestra una ilustración de la categoría identificada como tal. Las demás imágenes siguen disponibles.

En una instalación anterior, la migración 009 actualiza los ejemplos que conservan su imagen inicial. Mantiene las galerías personalizadas. Algunos modelos de ejemplo cambian para que el producto y la foto coincidan.

La tipografía usa fuentes web de Google con alternativas del sistema; si no hay Internet se utilizan las alternativas. Las ilustraciones e íconos se incluyen en el frontend.

## Comandos y verificaciones

| Comando            | Función                                             |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Desarrollo local en 5173 y proxy a la API.          |
| `npm run build`    | Comprueba y genera el frontend en `dist/`.          |
| `npm run preview`  | Previsualiza el build localmente en 4173 con proxy. |
| `npm test`         | Pruebas unitarias de validaciones y utilidades.     |
| `npm run test:e2e` | Pruebas de navegador con Chromium y API real.       |

Para las pruebas de navegador, instalar Chromium una vez con `npx playwright install chromium`. Estas pruebas **crean, modifican y eliminan sus propios registros**. Usar una instancia de backend conectada a una base exclusiva de pruebas con las nueve migraciones y el seed cargado, nunca la base de demostración. El frontend de las pruebas se inicia automáticamente en 5173; `API_TARGET` determina el backend usado.

```bash
API_TARGET=http://127.0.0.1:3001 E2E_ALLOW_WRITES=1 npm run test:e2e
```

El detalle de la estructura y la navegación está en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md). El recorrido manual está en [docs/PRUEBAS_MANUALES.md](docs/PRUEBAS_MANUALES.md).
