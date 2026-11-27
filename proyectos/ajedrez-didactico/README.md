# Ajedrez desde el principio

Sitio educativo estático, en español, para aprender reglas básicas del ajedrez y recorrer la transcripción de *Scachs d'amor*. Está construido con HTML5, CSS3 y JavaScript vanilla; no tiene backend, instalación, almacenamiento ni dependencias de terceros.

## Abrir

1. Mantén juntos `index.html`, `styles.css`, `app.js` y el archivo proporcionado `game-data.js`.
2. Abre `index.html` directamente en un navegador moderno (doble clic o `file://`).

La aplicación usa scripts clásicos y rutas relativas: no necesita servidor local ni conexión para funcionar. La advertencia de `file://` es que el navegador debe permitir abrir los archivos locales del mismo directorio; no muevas `game-data.js` fuera de la carpeta. Si el registro no está disponible o tiene formato inesperado, los controles se desactivan y se muestra un error. No usa `fetch` ni módulos ES.

## Uso

- Navega por Introducción, Reglas, Las piezas y Partida histórica.
- En la partida, usa Inicio, Anterior, Reproducir/Pausar y Siguiente; también puedes seleccionar una jugada de la tabla de notación.
- Las flechas izquierda y derecha avanzan o retroceden cuando el foco no está en un enlace o control. El tablero es de solo lectura y no acepta movimientos libres.
- La reproducción se detiene al llegar al último movimiento. La secuencia y las coordenadas vienen de `game-data.js`; el frontend aplica cada origen y destino, pero no es un motor ni valida legalidad o jaques intermedios.

## Contexto histórico y fuentes

*Scachs d'amor* se sitúa probablemente hacia 1475 en Valencia y se atribuye a Francesc de Castellví, Narcís Vinyoles y Bernat Fenollar. La partida se presenta como Castellví (blancas) contra Vinyoles (negras), con Fenollar como árbitro/comentarista. La fuente la considera el registro conocido conservado más temprano de una partida con movimientos modernos de dama y alfil; esto no prueba que fuese literalmente la primera vez que se jugó así.

- Transcripción y contexto: [Scachs d'amor, Wikipedia](https://en.wikipedia.org/wiki/Scachs_d%27amor).
- Estudio académico sobre el poema y el registro de movimientos modernos: [artículo de 2022, DOI 10.46586/zfk.2022.269-310](https://doi.org/10.46586/zfk.2022.269-310).

## Comprobaciones

La regresión de orientación del tablero tiene pruebas Playwright propias en `tests/`. Desde esta carpeta, ejecútalas con la dependencia Playwright instalada en la raíz del repositorio:

```powershell
..\..\node_modules\.bin\playwright.cmd test --config .\playwright.config.cjs
```

La corrección se verificó en Playwright 1.65.1 / Chromium: 2 pruebas aprobadas, incluida la orientación visual a8–h8 / a1–h1, la colocación de las piezas iniciales y el primer movimiento e2–e4. `node --check .\app.js` y `node --check .\game-data.js` también finalizaron correctamente. Esta pasada no volvió a verificar la reproducción completa, otros navegadores ni la adaptación móvil; consulta `docs/verificacion.md`.
