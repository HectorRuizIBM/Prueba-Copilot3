# Entorno

## Evidencia recopilada

- Sistema: Windows; shell: PowerShell 5.1.
- Node.js `v24.15.0` y npm `12.2.3` detectados. No son necesarios para abrir la aplicación; Node puede comprobar sintaxis JavaScript.
- Chrome `158.0.8127.38` y Edge `158.0.4370.33` detectados. No se detectaron Firefox ni Brave en PATH o ubicaciones habituales.
- La web estática puede abrirse desde `index.html` con `file://`, utilizando recursos relativos y scripts clásicos. Se evitarán `fetch` y módulos ES, que pueden estar limitados por la política de origen local del navegador.
- No se instalaron dependencias ni se modificó configuración del equipo.

## Comprobaciones recomendadas

Desde esta carpeta:

```powershell
node --check .\app.js
Start-Process .\index.html
```

`node --check` valida sintaxis, no la interacción del navegador. Revisar la página, controles y consola en Chrome y Edge. No se confirmó una herramienta de validación HTML ni se comprobó conectividad de red.
