# Instrucciones del proyecto

- Fuente de verdad absoluta: `../Aplicaciones-Interactivas-POO/TPO Segundo Cuatrimestre 2026.pdf`. Leer la consigna antes de cambiar el alcance. El PDF es de solo lectura.
- Trabajar exclusivamente en este repositorio del frontend. No modificar archivos del backend ni su configuración.
- Cumplir todos los requisitos obligatorios del PDF. Los extras quedan para una etapa posterior.
- Mantener modo claro, estética sobria y minimalista y marca Pixel Forge Componentes.
- Usar React, Vite, JavaScript, React Router y CSS Modules. No introducir TypeScript.
- La aplicación se ejecuta solamente en local. El proxy de Vite conecta con la API sin modificar CORS del servidor.
- No agregar carrito, pagos, envíos ni proveedor de correo real. La recuperación de contraseña utiliza el token de desarrollo de la API.
- Mantener documentación, interfaz y errores en español argentino.
- Validar todos los formularios y conservar estados de carga, error, vacío y éxito.
- Verificar con `npm test`, `npm run build` y las pruebas de navegador cuando cambien flujos.
- Las pruebas E2E escriben datos: usar una API contra una base temporal exclusiva y `E2E_ALLOW_WRITES=1`. Nunca usar datos de desarrollo que se quieran conservar.
- No commitear dependencias, tokens, contraseñas, `.env`, capturas ni resultados temporales.
