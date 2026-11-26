# Conway Lab — Juego de la Vida

Simulador web local del autómata celular de Conway. El tablero empieza vacío con **100 filas × 100 columnas**, y el usuario puede cambiar ambas dimensiones. La implementación usa HTML, CSS y JavaScript nativos; no necesita servidor de aplicación, instalación ni paquetes.

## Abrir la web

En Windows, abre `index.html` con el navegador, o ejecuta desde esta carpeta en PowerShell:

```powershell
Start-Process .\index.html
```

Si prefieres servir los archivos en loopback:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://127.0.0.1:8000`. Para detener el servidor, vuelve a la terminal y pulsa `Ctrl+C`.

## Uso

- Selecciona células con el puntero o el teclado.
- En el tablero, usa las flechas para moverte y `Espacio` o `Enter` para cambiar una célula.
- Inicia o pausa la simulación, avanza un paso, genera un patrón aleatorio o limpia el tablero.
- Ajusta la velocidad entre 1 y 20 generaciones por segundo.
- Cambia filas y columnas entre 5 y 200; el tablero conserva las células que caben en la nueva dimensión y reinicia el contador.
- La simulación se detiene cuando muere la última célula. Si el tablero ya está vacío, Iniciar y Un paso no incrementan el contador.

Cada generación se calcula simultáneamente. Las células fuera de los bordes se consideran muertas; no hay conexión entre los extremos opuestos.

## Reglas de Conway

1. Una célula viva sobrevive con dos o tres vecinas vivas.
2. Una célula muerta nace con exactamente tres vecinas vivas.
3. Con menos de dos vecinas, una célula viva muere por soledad.
4. Con más de tres vecinas, una célula viva muere por superpoblación.

## Pruebas de las reglas

Requiere Node.js disponible; no instala dependencias. Desde esta carpeta:

```powershell
node --test tests\life.test.cjs
node --check app.js
node --check life.js
```

Las pruebas cubren bloque estable, oscilador, nacimiento, supervivencia, muerte por soledad y superpoblación, extinción, bordes y dimensiones inválidas.
