# Verificación

## Corrección de orientación del tablero

El tablero estaba transpuesto visualmente porque sus ocho contenedores de fila se distribuían como elementos en las ocho columnas del grid exterior. El grid exterior ahora dispone las ocho filas verticalmente y cada fila distribuye sus ocho casillas horizontalmente.

## Comprobaciones ejecutadas

Fecha: 2026-11-27. Entorno: Windows, PowerShell, Playwright 1.65.1 con Chromium.

| Comando (desde la raíz del proyecto) | Resultado |
|---|---|
| `..\..\node_modules\.bin\playwright.cmd test --config .\playwright.config.cjs` | Código 0; 2 pruebas aprobadas. |
| `node --check .\app.js` | Código 0. |
| `node --check .\game-data.js` | Código 0. |

Las pruebas confirman que el tablero tiene ocho filas verticales y ocho columnas por fila, que los archivos avanzan de a a h de izquierda a derecha, que las filas van de 8 a 1 de arriba abajo, y que a8 y h1 son casillas claras. Comprueban además las piezas negras en las filas 8 y 7, las blancas en las filas 1 y 2, y que el primer movimiento e2–e4 coloca el peón blanco en e4.

## Pendiente

No se repitió en esta corrección la reproducción completa de las 41 medias jugadas, ni pruebas manuales en Edge, otros tamaños de pantalla o una auditoría automatizada de accesibilidad.
