# Preparar Varilla para Microsoft Store

Varilla es una calculadora educativa de área de acero para columnas. Trabaja sin cuenta y sin conexión después de la primera carga. Los resultados son estimaciones por cuantía ingresada, no validaciones estructurales.

## Integraciones y pruebas en Edge sobre Windows 11

| Función | Prueba |
|---|---|
| Barra de título | Instala desde Edge. Activa la superposición y verifica que los controles de Windows no cubran el buscador. |
| Compartir y recibir | Comparte un cálculo y elige una app del sistema. Desde una app compatible, comparte el TXT de Varilla o `30 × 40 cm al 1%` hacia Varilla. Debe mostrar 12 cm² sin guardar automáticamente. |
| Accesos directos | En el menú del icono de la PWA instalada, prueba Nuevo cálculo y Ver historial. |
| Widget | En Win + W, agrega Varilla. Guarda un cálculo y comprueba que aparece; pulsa Abrir Varilla. |
| Barra lateral | Ancla Varilla a la barra lateral en Edge. Comprueba el formulario y los resultados a 376 px de ancho. |
| Acción de Windows | En el paquete de prueba, ejecuta Varilla.CalcularColumna desde App Actions Testing Playground con la entidad Text `30 × 40 cm al 1%`. Debe mostrar 12 cm². |

Prueba también el cálculo sin conexión después de una carga inicial, la descarga de TXT y la apertura de la página de privacidad. La disponibilidad de cada superficie depende de la versión de Windows y Edge.

## Empaquetar y enviar

1. Aloja la PWA en una URL pública HTTPS. Publica `index.html`, `privacidad.html`, `manifest.json`, `app.js`, `quantity.js`, `styles.css`, `service-worker.js`, `icons/` y `widgets/` con la misma estructura. No necesitas publicar esta carpeta de instrucciones.
2. En [Partner Center](https://partner.microsoft.com/dashboard), reserva el nombre y copia el identificador del paquete, el identificador del publicador y su nombre visible.
3. Analiza la URL en [PWABuilder](https://www.pwabuilder.com/). Revisa el informe y genera el paquete de Windows con los datos de Partner Center.
4. En la configuración de empaquetado habilita **Actions → Enable Actions** y carga [ActionsManifest.json](ActionsManifest.json). Para pruebas, usa una copia con `isAvailable: true` si el entorno de prueba lo requiere; la definición de publicación usa `false` conforme a la recomendación de Microsoft. Sigue [la guía oficial de pruebas de App Actions](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/app-actions#test-app-actions-for-a-pwa).
5. Instala el paquete en Windows 11 y completa las pruebas de la tabla antes de enviarlo. Captura imágenes actuales en Windows para la ficha; no uses el archivo de vista previa del widget como captura de la app.
6. En Partner Center, carga el paquete y completa la categoría, descripción, capturas, clasificación por edades, soporte y declaraciones de datos. Revisa que `privacidad.html` describa también el alojamiento real y usa su URL pública si corresponde. Envía a certificación.

Texto sugerido para la ficha: **Estima el área de acero de una columna según sus dimensiones y cuantía. Compara cinco grosores de varilla, guarda estimaciones y compártelas como texto o TXT. Herramienta educativa; no sustituye el diseño estructural.**

Fuentes: [Empaquetado de PWA](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/pwa/app-package-requirements), [propiedades de la ficha](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/pwa/enter-app-properties) y [certificación](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/pwa/resolve-submission-errors).
