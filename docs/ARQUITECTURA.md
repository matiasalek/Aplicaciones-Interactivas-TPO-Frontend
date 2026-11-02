# Arquitectura y navegación

## Estructura

```text
src/
  main.jsx                    # React, Router y proveedor de sesión
  App.jsx                     # Rutas, foco, título y límite de errores
  components/
    Layouts.jsx               # Sitio público, administración y control de acceso
    UI.jsx                    # Formularios, errores, paginación, confirmaciones
    ProductCard.jsx           # Tarjetas, disponibilidad e imágenes
    HardwareArt.jsx           # Ilustraciones vectoriales locales
  context/AuthContext.jsx     # Sesión y perfil autenticado
  lib/
    api.js                    # Fetch, timeout, token y errores en español
    hooks.js                  # Carga cancelable y mutaciones sin doble envío
    validation.js             # Reglas reutilizables de los formularios
  pages/
    PublicPages.jsx           # Inicio, catálogo, detalle, nosotros, contacto
    AuthPages.jsx             # Registro, acceso y recuperación
    AdminPages.jsx            # Administración completa
  styles/
    global.css                # Bases, tipografía, foco y modo claro
    App.module.css            # Componentes y adaptaciones responsive
```

## Diagrama de navegación

```mermaid
flowchart TD
  Inicio --> Catalogo[Catálogo con filtros]
  Catalogo --> Detalle[Detalle de producto]
  Detalle --> Contacto[Consulta con asunto precargado]
  Inicio --> Nosotros
  Inicio --> Contacto
  Inicio --> Acceso[Iniciar sesión]
  Acceso --> Registro
  Acceso --> Recuperar[Generar código de recuperación]
  Recuperar --> Restablecer[Nueva contraseña]
  Restablecer --> Acceso
  Registro --> Admin[Administración protegida]
  Acceso --> Admin
  Admin --> Productos[Listar / crear / editar / eliminar productos]
  Productos --> Visibilidad[Activar / desactivar]
  Admin --> Categorias[Listar / crear / editar / eliminar categorías]
  Admin --> Consultas[Listado de consultas]
  Consultas --> Consulta[Detalle / cambiar estado / eliminar]
  Admin --> Comercio[Crear o actualizar información institucional]
  Admin --> Perfil[Editar perfil]
  Admin --> Cierre[Cerrar sesión]
  Cierre --> Acceso
```

## Flujo de datos

```mermaid
flowchart LR
  Vista[Componentes React] --> Validacion[Validación local]
  Validacion --> Cliente[Cliente Fetch]
  Cliente --> Proxy[Proxy Vite /api]
  Proxy --> API[API REST existente]
  API --> BD[(PostgreSQL)]
  API --> Respuesta[JSON o error]
  Respuesta --> Vista
```

Los GET se cancelan cuando cambia la pantalla o los filtros para evitar respuestas antiguas. Las mutaciones deshabilitan controles durante el envío y bloquean solicitudes duplicadas. Los errores de negocio se traducen a mensajes en español; la validación local no reemplaza las restricciones de la API ni de PostgreSQL.

Los formularios tienen etiquetas, errores asociados, foco en el primer error y feedback de envío. La navegación incluye enlace para saltar al contenido y foco en el contenido al cambiar de ruta. El diálogo nativo de confirmación captura el foco y permite Escape cuando no hay una operación en curso. Se respeta la preferencia de reducir animaciones.
