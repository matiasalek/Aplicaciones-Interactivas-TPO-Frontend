# Pixel Forge Componentes — Frontend

Frontend del TPO de Aplicaciones Interactivas, separado del repositorio del backend. Incluye el sitio público y el área de administración con React, JavaScript, React Router y CSS Modules. La interfaz utiliza exclusivamente modo claro y está adaptada a dispositivos móviles.

La fuente de verdad es **TPO Segundo Cuatrimestre 2026.pdf**, conservado sin cambios en el repositorio hermano `Aplicaciones-Interactivas-POO`. Los requisitos se relacionan con las pantallas en [docs/REQUISITOS.md](docs/REQUISITOS.md).

## Ejecución local

Requisitos: Node.js 24 (`.node-version`), npm y el backend existente con PostgreSQL y su carga inicial de al menos 20 productos.

1. Iniciar PostgreSQL y la API siguiendo el README del backend. La API debe escuchar en `http://localhost:3000`.
2. En este repositorio:

   ```bash
   fnm use
   npm ci
   npm run dev
   ```

3. Abrir **http://127.0.0.1:5173**.

No es necesario modificar el backend ni agregar CORS: el servidor de Vite reenvía `/api` al backend. Si la API escucha en otro puerto, copiar `.env.example` a `.env` y ajustar `API_TARGET`; reiniciar Vite después. No se necesita publicar el proyecto.

Si PostgreSQL o la API están detenidos, las pantallas muestran un error con la posibilidad de reintentar. No se sustituyen los datos reales por datos ficticios.

## Funcionalidad

- Inicio, catálogo con búsqueda por texto, categoría, disponibilidad, orden y paginación.
- Detalle del producto con imagen, descripción, precio y disponibilidad; consulta con asunto precargado.
- Información del comercio, dirección, teléfono, redes y horarios obtenidos de la API.
- Formulario de contacto persistido en PostgreSQL.
- Registro, inicio y cierre de sesión, recuperación y restablecimiento de contraseña.
- Rutas administrativas protegidas y recuperación del destino solicitado al iniciar sesión.
- CRUD de productos y categorías, activación/desactivación y gestión de consultas.
- Dashboard en Administración → Resumen: totales de productos, visibilidad, disponibilidad, categorías y consultas por estado, con actualización manual.
- Edición de información institucional y datos personales del administrador.
- Validaciones locales alineadas con los contratos del backend, estados de carga, errores y confirmaciones de eliminación.

La identidad visual es Pixel Forge Componentes; el nombre institucional y los datos publicados se gestionan en Administración → Información del comercio.

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

## Recuperación de contraseña para el TP

No se integra un proveedor de correo. Con el backend en desarrollo o pruebas, la pantalla muestra el código generado por la API y permite pasar directamente al formulario de nueva contraseña. El código también se puede pegar manualmente. No se guarda en almacenamiento persistente ni se agrega a la URL desde la pantalla de recuperación. Al restablecer, el backend revoca las sesiones anteriores.

## Sesión y autorización

El JWT se conserva en `sessionStorage` de la pestaña y se valida contra `/profile` al recargar. La interfaz no guarda contraseñas. Un `401` en operaciones autenticadas elimina la sesión local y redirige al acceso. Un error de conexión permite reintentar sin confundirlo con una sesión inválida. El cierre de sesión requiere que el backend confirme su revocación; si está desconectado, se informa el error.

Las rutas privadas del frontend son una ayuda de navegación; la autorización efectiva sigue a cargo de la API existente.

## Imágenes y enlaces

Los productos utilizan una URL de imagen, de acuerdo con el backend. Se aceptan direcciones HTTP/HTTPS. Si la carga falla o el seed utiliza `placehold.co`, se muestra una ilustración vectorial local de la categoría, identificada como tal; no se presenta como fotografía del modelo. Las imágenes personalizadas se muestran normalmente. Las redes se abren en otra pestaña y se filtran para permitir solamente HTTP/HTTPS.

La tipografía usa fuentes web de Google con alternativas del sistema; si no hay Internet se utilizan las alternativas. Las ilustraciones e íconos se incluyen en el frontend.

## Comandos y verificaciones

| Comando            | Función                                             |
| ------------------ | --------------------------------------------------- |
| `npm run dev`      | Desarrollo local en 5173 y proxy a la API.          |
| `npm run build`    | Comprueba y genera el frontend en `dist/`.          |
| `npm run preview`  | Previsualiza el build localmente en 4173 con proxy. |
| `npm test`         | Pruebas unitarias de validaciones y utilidades.     |
| `npm run test:e2e` | Pruebas de navegador con Chromium y API real.       |

Para las pruebas de navegador, instalar Chromium una vez con `npx playwright install chromium`. Estas pruebas **crean, modifican y eliminan sus propios registros**. Usar una instancia de backend conectada a una base exclusiva de pruebas con el seed cargado, nunca la base de demostración. El frontend de las pruebas se inicia automáticamente en 5173; `API_TARGET` determina el backend usado. El código original del servidor no necesita cambios.

```bash
API_TARGET=http://127.0.0.1:3001 E2E_ALLOW_WRITES=1 npm run test:e2e
```

El detalle de la estructura y la navegación está en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md). El recorrido manual está en [docs/PRUEBAS_MANUALES.md](docs/PRUEBAS_MANUALES.md).
