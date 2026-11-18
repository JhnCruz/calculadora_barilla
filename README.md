# Varilla · Estimación de acero en columnas

PWA con HTML, CSS y JavaScript, adaptada funcionalmente del proyecto CalcuVarilla. Conserva la paleta verde, crema y terracota. No requiere Swift, Vapor, Node ni una API para funcionar.

## Ejecutar

```sh
cd /Users/john/Documents/Trabajos_Victor/calculadora-varilla
python3 -m http.server 8000
```

Abre http://localhost:8000 en Chrome. Detén el servidor con Ctrl+C.

## Uso

Introduce los dos lados de la sección transversal en centímetros y el porcentaje de acero. Pulsa Calcular acero. La cuantía inicial es ilustrativa; no la calcula la aplicación.

- Sección = ancho × largo, en cm².
- Área de acero = sección × porcentaje / 100.
- Cantidad por grosor = área de acero / área nominal por barra, redondeada hacia arriba.

Las áreas aproximadas de la referencia son #3: 0.71, #4: 1.27, #5: 1.98, #6: 2.85 y #8: 5.07 cm². Cada fila es una alternativa independiente: no deben sumarse las cinco cantidades.

Ejemplo: 30 × 30 cm al 1% → sección de 900 cm² y acero de 9 cm². Alternativas matemáticas: 13 barras #3, 8 #4, 5 #5, 4 #6 o 2 #8.

Es una comparación educativa de áreas. No verifica cargas, mínimos normativos, distribución, separación, esbeltez ni validez estructural. No calcula altura de columna, longitudes, peso, estribos, traslapes, anclajes ni precios.

## Archivos

- index.html y styles.css: interfaz adaptable.
- quantity.js: cálculo local y tabla de áreas.
- app.js: resultados, historial, opciones para compartir e instalación.
- manifest.json e icons/: identidad de la PWA.
- service-worker.js: caché versionada calculadora-varilla-v9.

## Historial y PWA

Guarda hasta 20 estimaciones en este navegador. Se usa una clave separada para no mezclar el historial de columnas con las versiones anteriores de parrillas y precios.

Después de cargar con conexión, verifica el service worker en Chrome DevTools → Application. Recarga para activar la versión actual y prueba Network → Offline. La instalación y el modo offline requieren localhost o HTTPS. El botón Instalar app usa el diálogo nativo cuando está disponible y muestra instrucciones en otros casos.

Verificación realizada: sintaxis JavaScript, fórmula y redondeo para cinco grosores, entradas inválidas, cálculo en navegador y guardado en historial. El esquema de sección es ilustrativo, no un plano de armado.

## Navegación y compartir

La barra superior permite ir a Calculadora e Historial, iniciar un cálculo con los valores de ejemplo y buscar texto entre los registros guardados.

Compartir cálculo usa Web Share si el navegador la permite: envía un TXT cuando admite archivos o texto en caso contrario. La aplicación de destino se elige en el diálogo del sistema. Cancelar no envía nada. Descargar .txt siempre permite obtener un archivo UTF-8 con sección, cuantía, área y cinco alternativas.

Comprobado: filtro del historial y descarga de varilla-calculo.txt desde el navegador. Las aplicaciones disponibles al compartir dependen del sistema y del navegador.

## Integración con el sistema

- **Compartir cálculo:** prueba el botón desde la PWA instalada en Microsoft Edge en Windows 11. Selecciona una app del menú del sistema para recibir el TXT o el texto. La lista la controla Windows.
- **Barra de título:** abre la app instalada y activa la superposición con el control de la ventana si Edge lo ofrece. La navegación y el buscador ocupan el espacio libre junto a los controles nativos. En una pestaña normal la barra conserva su posición.
- **Widget:** para probar el panel de Windows 11, prepara Windows según [la guía de Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/widgets), instala la PWA en Edge y abre **Win + W → Agregar widgets → Varilla**. Guarda un cálculo y verifica que la tarjeta muestre la última estimación; **Abrir Varilla** lleva al historial. El widget usa Adaptive Cards y no requiere servidor de datos. No aparece como widget de macOS.

El flujo saliente sigue la sección [Uso compartido de contenido de Microsoft Learn](https://learn.microsoft.com/es-es/microsoft-edge/progressive-web-apps/how-to/share#uso-compartido-de-contenido): el clic llama a `navigator.share` y `navigator.canShare({files})` determina si se entrega el TXT o el texto. `share_target` permite recibir contenido e invocar la acción de Windows. Consulta [la guía de preparación para Microsoft Store](store/README.md).
