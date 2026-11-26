# Informe de entorno: Juego de la Vida de Conway

**Fecha de detección:** 2026-11-26  
**Raíz asignada:** `proyectos/juego-vida-conway/`  
**Alcance de este informe:** lectura y detección no destructivas. No se instaló software, no se cambió PATH ni permisos y no se consultó la red ni secretos.

## Decisiones y alcance recibidos

El plan `docs/plan-aplicacion.md` propone una simulación local en el navegador, edición de células, controles de iniciar/pausar/step/limpiar/aleatorio, velocidad, generaciones y reglas visibles. No contempla persistencia, backend, cuentas ni servicios externos. La carpeta se reservó vacía antes de redactar el plan; en la detección inicial solo contenía `docs/plan-aplicacion.md`.

El usuario aprobó la ruta estática tras revisar el plan y precisó tablero redimensionable de 100 × 100 por defecto. Esta actualización registra la decisión y las dependencias; no se instalaron paquetes.

## Detección observada

| Elemento | Evidencia observada | Estado |
|---|---|---|
| SO y arquitectura | Microsoft Windows 11 Business, versión `10.0.26200`, 64 bits. | Detectado |
| Shell | Windows PowerShell `5.1.26100.9711` (Desktop), proceso actual en `C:\Repositorios\Prueba Copilot3`. Execution Policy: `LocalMachine=RemoteSigned`; las demás scopes consultadas aparecen `Undefined`. | Detectado |
| Python principal | `C:\Python314\python.exe`, Python `3.14.4`; `py -0p` lo registra como predeterminado. `python -m pip --version`: pip `26.2.1`, en el user site de Python 3.14. | Detectado |
| Python alternativo | `C:\Programas\Python\python.exe`, Python `3.10.8`; pip `26.0.1`. | Detectado |
| Alias `python3` | Resuelve al alias de Microsoft Store `...\WindowsApps\python3.exe`, pero no ejecuta Python; la comprobación devolvió código `9009` y el mensaje de que no se encontró Python. No usarlo como intérprete detectado. | No utilizable en la prueba |
| Streamlit | `C:\Users\0018463\AppData\Roaming\Python\Python314\...\streamlit` aparece instalado como paquete `1.64.0` en Python 3.14. También hay paquete `1.31.0` en Python 3.10. El comando `streamlit` resuelve a `C:\Programas\Python\Scripts\streamlit.exe` y `streamlit --version` informó `1.31.0`; por tanto, el ejecutable global no corresponde al paquete encontrado en Python 3.14. | Detectado; rutas/versiones no alineadas |
| Node.js y npm | `C:\Program Files\nodejs\node.exe`, Node `v24.15.0`; npm `12.2.3`. | Detectado |
| Git | `C:\Program Files\Git\cmd\git.exe`, Git `2.56.1.windows.1`. | Detectado |
| Editor CLI | `code --version` respondió `1.2.4`, commit `a8e95743c5268be73767c46944a71f4465d05c90`, `x64`; la resolución encontrada corresponde al CLI de Cursor. También se localizó el directorio de CLI de VS Code, sin comprobar por separado su versión. | Detectado con esa salvedad |
| Navegadores | Se encontraron ejecutables en disco para Microsoft Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) y Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`). Ninguno resolvió por nombre en PATH. Firefox no se encontró en PATH ni en la ruta estándar consultada. | Detectados Edge y Chrome |
| Manifiestos del proyecto | En la detección inicial no había `package.json`, lockfile, `pyproject.toml`, `requirements.txt` ni código de aplicación. La implementación actual sigue sin manifiestos; usa solo recursos estáticos. | No requiere gestores ni dependencias |
| Artefactos del workspace compartido | La raíz del workspace tiene `package.json`, `package-lock.json` y `node_modules`; el manifiesto declara CommonJS y dependencias de desarrollo de Playwright, sin scripts de aplicación. `node_modules/@playwright/test` está presente (versión `1.65.1`); TypeScript no está presente. Son artefactos compartidos y no constituyen dependencias aprobadas de esta aplicación. No deben crearse manifiestos ni lockfiles en la raíz compartida. | No reutilizar como manifiesto de la app |
| Permisos observables | Las ACL de la raíz asignada y de `docs/` incluyen entradas `FullControl` y `Modify`, además de otras entradas heredadas. No se evaluó la autorización efectiva para cada identidad. Durante la investigación, la edición se limitó a este informe. | ACL consultadas; acceso efectivo pendiente |
| Red | No se consultó ni probó conectividad. La petición prohíbe consultas de red y descargas; una instalación futura que requiera paquetes deberá esperar permiso explícito, incluido el acceso de red que necesite. | No comprobada por restricción |

### Comprobaciones y códigos de salida

Las consultas se limitaron a resolución de rutas, versiones, metadatos locales y existencia de archivos; no ejecutaron instalaciones.

| Comprobación | Resultado |
|---|---|
| `python --version` | `Python 3.14.4`, código `0` |
| `py -0p` | `3.14` en `C:\Python314\python.exe`; `3.10` en `C:\Programas\Python\python.exe`, código `0` |
| `C:\Programas\Python\python.exe --version` | `Python 3.10.8`, código `0` |
| `python -m pip --version` | pip `26.2.1`, código `0` |
| `python -m pip show streamlit` | Streamlit `1.64.0` en el user site de Python 3.14, código `0` |
| Python 3.10: `-m pip show streamlit` | Streamlit `1.31.0` en `C:\Programas\Python\lib\site-packages`, código `0`; pip mostró advertencias de distribuciones inválidas `-andas` y `-treamlit`. No se repararon ni modificaron. |
| `streamlit --version` | Streamlit `1.31.0`, código `0` |
| `node --version`; `npm --version` | `v24.15.0`; `12.2.3`, ambos código `0` |
| `python3 --version` | El alias no encontró una instalación Python; código `9009` |
| `code --version` | `1.2.4`, código `0` |

## Evaluación y stack aprobado

**Ruta B aprobada: frontend estático con HTML, CSS y JavaScript nativos, sin framework ni proceso de build.** La simulación es enteramente local y mantiene/actualiza una cuadrícula. La web no requiere backend, gestor de paquetes, instalación ni servicios externos. Node se usa opcionalmente para ejecutar las pruebas integradas de la lógica, pero no es requisito de ejecución.

| Ruta | Compatibilidad y coste | Valoración |
|---|---|---|
| **B. Estática personalizada (seleccionada)** | Compatible con Edge/Chrome detectados; no requiere Node, Python, paquetes ni servicios externos para ejecutar una página autónoma. La app carga scripts clásicos propios y puede abrirse como `index.html`. Si se sirve localmente, usar un servidor solo ligado a `127.0.0.1`. | Ajuste aprobado al alcance interactivo. |
| **A. Python + Streamlit** | Hay Python 3.14.4 y 3.10.8 y paquetes Streamlit globales, pero el ejecutable global resuelve a la instalación 3.10/Streamlit 1.31, mientras Python 3.14 contiene Streamlit 1.64. Esa divergencia puede evitarse con un entorno aislado en la raíz del proyecto, pero crearlo e instalar dependencias no está autorizado. Streamlit introduce runtime y dependencias para una interacción que el navegador ya cubre. | Técnicamente posible, pero menos adecuado al alcance; no recomendada salvo decisión explícita. |

### Dependencias imprescindibles y opcionales

- **Para Ruta B aprobada:** ninguna dependencia de runtime fuera de un navegador moderno. No hace falta instalar Node ni crear `package.json`/lockfile para la app. Las pruebas unitarias usan el módulo `node:test` integrado en Node.
- **Para Ruta A alternativa:** Python y Streamlit dentro de un entorno aislado propio del proyecto; cualquier creación de `.venv` o instalación queda pendiente de aprobación explícita. No usar el `streamlit.exe` global como prueba de que el entorno objetivo está fijado.
- Playwright existe en `node_modules` de la raíz compartida y se reutilizó para una comprobación puntual de navegador, sin convertirlo en dependencia de la aplicación ni modificar configuración compartida.

## Comandos y verificación

La aplicación se puede abrir directamente:

```powershell
# Abrir el archivo con un navegador instalado (ajustar la ruta al archivo creado).
Start-Process 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList (Resolve-Path '.\proyectos\juego-vida-conway\index.html')
```

Opcionalmente, si el navegador requiere origen HTTP local, desde la raíz del workspace:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory .\proyectos\juego-vida-conway
```

La lógica se prueba desde la raíz de la aplicación con `node --test tests\life.test.cjs`; no requiere instalar paquetes. Los resultados detallados de pruebas y navegador se registran en `docs/verificacion.md`. No se instalaron paquetes ni se descargaron recursos.

## Aprobaciones y bloqueos

1. La ruta estática y el tablero redimensionable de 100 × 100 por defecto están aprobados.
2. No hay bloqueos de runtime conocidos. La app no instala software ni usa dependencias del gestor.
3. La alternativa Streamlit no se eligió; no se requiere crear `.venv` ni instalar paquetes Python.
4. No se instalaron paquetes, no se cambió PATH ni permisos y no se consultaron secretos ni conectividad externa.
