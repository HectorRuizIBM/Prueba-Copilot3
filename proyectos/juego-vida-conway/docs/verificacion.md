# Verificación — Juego de la Vida de Conway

**Fecha:** 2026-11-26  
**Proyecto:** `proyectos/juego-vida-conway/`  
**Alcance:** lógica de evolución, controles, tablero redimensionable y comprobaciones básicas de navegador.  
**Resultado:** **aprobado para el alcance probado**, con límites de accesibilidad y visualización indicados abajo.

## Resultados

| Criterio | Resultado | Evidencia |
|---|---|---|
| Reglas del autómata y extinción | **Aprobado** | `node --test tests\life.test.cjs` — código 0, 9/9 pruebas: bloque estable, parpadeador, nacimiento, supervivencia, muerte por soledad, superpoblación, límites sin wrap, tamaño inválido y detención de avances después de la extinción. |
| Sintaxis JavaScript | **Aprobado** | `node --check app.js` y `node --check life.js` — código 0. |
| Tablero inicial 100 × 100 | **Aprobado** | Chrome headless: renderiza 10 000 células; ARIA anuncia 100 filas y 100 columnas. |
| Edición con teclado | **Aprobado, comprobación puntual** | En Chrome: se activa una célula, ArrowRight mueve el foco y Espacio activa la siguiente. No se auditó exhaustivamente toda la navegación ni con lector de pantalla. |
| Redimensionamiento y conservación | **Aprobado** | De 100 × 100 a 60 × 50: se renderizan 3 000 células y se conservan las células vivas situadas en la zona común. |
| Paso de generación y limpiar | **Aprobado** | Un paso incrementa la generación a `0001`; Limpiar deja cero células vivas y reinicia el contador. |
| Detenerse al extinguirse el tablero | **Aprobado** | Con una sola célula viva, Chrome avanzó a la generación `0001`, la célula murió, el control volvió a “Iniciar” y `aria-pressed` pasó a `false`. Tras esperar 500 ms el contador siguió en `0001`. Un paso manual y un intento de reiniciar con tablero vacío tampoco incrementaron el contador. |
| Aleatorio e iniciar/pausar | **Aprobado** | Chrome móvil: Aleatorio generó una configuración mixta (2 802 células vivas en esa ejecución); iniciar avanzó generaciones y pausar detuvo el contador. El número aleatorio no es determinista. |
| Diseño móvil | **Aprobado, viewport puntual** | Chrome headless a 375 × 812 px: sin desbordamiento horizontal de la página. El tablero conserva su desplazamiento interno para permitir editar una cuadrícula grande. |
| Contraste | **Comprobación de muestra aprobada** | Ratios calculados: texto principal 14.78:1; texto secundario 8.50:1; texto atenuado 4.81:1; verde sobre blanco 6.69:1; texto blanco del botón primario 6.69:1; foco naranja sobre blanco 4.48:1. No es una auditoría de todos los estados/componentes. |
| Instalación/dependencias | **No necesarias** | No se instaló software. El frontend no tiene dependencias de ejecución; las pruebas usan `node:test`. Para el test de navegador se reutilizó Playwright ya presente en `node_modules` compartido del workspace, sin alterar manifiestos. |
| Persistencia/red/backend | **Fuera de alcance** | El tablero vive solo en memoria del navegador; no se usa backend, almacenamiento persistente, servicios externos ni datos personales. |

## Incidencia resuelta durante la validación

El primer flujo de navegador encontró que las células conservadas al cambiar el tamaño se mostraban como muertas en el estado accesible. Se ajustó la inicialización de los atributos `aria-selected` al volver a renderizar el tablero. El retest de redimensionamiento y conservación pasó. No se modificó ni perdió información persistente; la simulación no guarda datos.

## Comprobaciones de navegador

Se cargó directamente `index.html` en Chrome headless con Playwright disponible localmente. Las comprobaciones cubrieron:

- carga de 10 000 células por defecto;
- clic para activar una célula y uso de flecha/Espacio para la siguiente;
- redimensionamiento a 60 × 50 con preservación de la zona común;
- avance de generación y limpieza;
- viewport de 375 × 812 px, aleatorización e inicio/pausa.

La primera ejecución del caso de resize detectó el defecto indicado; tras el ajuste, los dos flujos de navegador terminaron con código 0. Los procesos del navegador se cerraron y no se inició un servidor local persistente.

Para el defecto del contador, la prueba unitaria de `advance` verifica que la transición que mata la última célula se procesa una vez y que una segunda llamada sobre tablero vacío no avanza. Además, Chrome confirmó que el temporizador se cancela y que el contador no cambia después de la extinción. La ejecución final del test de navegador terminó con código 0.

## Límites

- No se ha hecho una revisión visual manual ni una auditoría completa WCAG; el contraste evaluado es una muestra.
- No se probó con lector de pantalla ni con todos los tamaños de pantalla.
- El tablero es finito: las células fuera de los límites se consideran muertas, sin envolver los bordes.
- Máximo configurable: 200 × 200 células. El rendimiento en ese máximo no se midió.
