# Evidencia de entorno — gestor-tareas

**Fecha de consulta:** 2026-11-26  
**Proyecto:** `C:\Repositorios\Prueba Copilot3\proyectos\gestor-tareas`  
**Alcance:** refrescar evidencia de entorno antes de implementar. El stack Ruta A (Python + Streamlit + SQLite) y el diseño profesional constan como aprobados en `docs/plan-aplicacion.md`.

## Hechos observados

| Aspecto | Evidencia |
|---|---|
| SO y shell | Windows, versión reportada por .NET como `Microsoft Windows NT 10.0.26200.0`; Windows PowerShell `5.1.26100.9711`. Python reporta arquitectura `AMD64`. |
| Identidad | `INSAGS\0018463`. Se consultó la ACL de la raíz del proyecto: permisos heredados; `Usuarios autentificados` tiene `Modify`. No se hizo prueba de escritura ni se infiere permiso de instalación a partir de esta ACL. |
| Python elegido para comprobar | `C:\Python314\python.exe`, Python `3.14.4` (64-bit), `sys.executable` coincide con esa ruta. Código de salida de `--version`: `0`. |
| Streamlit | Distribución `1.64.0`; importable con el Python explícito. Consulta de metadatos e importación terminan con código `0`. Está disponible en el entorno de usuario actual; no se creó ni se examinó una venv. |
| SQLite | El módulo estándar `sqlite3` importa con el Python explícito y reporta biblioteca SQLite `3.50.4`; código `0`. No se verificó un CLI independiente. |
| pip | `pip 26.2.1`, asociado a Python 3.14. Solo se consultó su versión; no se usó para instalar. |
| Descubrimiento de intérpretes | `Get-Command python` resuelve primero a `C:\Python314\python.exe` (también encuentra `C:\Programas\Python\python.exe` y el alias de WindowsApps). `python3` resuelve a `C:\Users\0018463\AppData\Local\Microsoft\WindowsApps\python3.exe`, un archivo de tamaño 0 con atributos `ReparsePoint`. Según la actualización del usuario, el discovery empaquetado seleccionó ese alias y falló en dos ejecuciones. `py.exe` está en `C:\windows\py.exe`; no se ejecutó. |
| Archivos del proyecto | La carpeta `docs` existe y contiene el plan y este informe. La raíz del proyecto contiene `docs`; no se encontraron archivos coincidentes con los nombres habituales de manifiestos/lockfiles de Python, Node o Conda en la búsqueda recursiva. No se halló código de aplicación en la raíz inspeccionada. |
| Repositorio y red | El contexto de sesión indica que la raíz compartida no es un repositorio Git. No se hicieron consultas de red, descargas ni pruebas de conectividad. |

### Comprobaciones ejecutadas y códigos

Todas fueron consultas de lectura, sin iniciar aplicación o servidor.

1. `"$PSVersionTable.PSVersion.ToString()"` y `[System.Environment]::OSVersion.VersionString`  
   Resultado: PowerShell `5.1.26100.9711`; `Microsoft Windows NT 10.0.26200.0`.
2. `Get-Command python,python3,py -All` y `Get-Item 'C:\Python314\python.exe'`  
   Resultado: rutas descritas arriba; Python explícito existe. Código de la llamada: `0`.
3. `& 'C:\Python314\python.exe' --version`  
   Resultado: `Python 3.14.4`; `$LASTEXITCODE = 0`.
4. `& 'C:\Python314\python.exe' -c "import sys, streamlit, sqlite3; print('executable='+sys.executable); print('python='+sys.version.replace('\n',' ')); print('streamlit='+streamlit.__version__); print('sqlite='+sqlite3.sqlite_version)"`  
   Resultado: ejecutable `C:\Python314\python.exe`, Python `3.14.4`, Streamlit `1.64.0`, SQLite `3.50.4`; `$LASTEXITCODE = 0`.
5. `& 'C:\Python314\python.exe' -m pip --version`  
   Resultado: `pip 26.2.1 ... (python 3.14)`; `$LASTEXITCODE = 0`.
6. `& 'C:\Python314\python.exe' -c "import importlib.metadata as m; print('streamlit_distribution='+m.version('streamlit'))"`  
   Resultado: distribución `1.64.0`; `$LASTEXITCODE = 0`.
7. Resolución de `python3` con `Get-Command` y `Get-Item`  
   Resultado: el comando apunta al alias/reparse point de WindowsApps de tamaño 0. La ejecución manual de `python3` no se hizo en esta investigación.
8. Listado de la raíz, `docs` y búsqueda recursiva de `pyproject.toml`, `requirements*.txt`, `Pipfile`, `poetry.lock`, `uv.lock`, `package.json`, `package-lock.json`, `environment.yml` y `.python-version`  
   Resultado: `docs` existe; sin coincidencias de manifiestos/lockfiles. La consulta terminó normalmente.
9. `Get-Acl` de la raíz del proyecto  
   Resultado: entradas ACL heredadas, incluidas `Usuarios autentificados: Modify`; lectura únicamente.
10. **Actualización comunicada por el usuario:** el discovery empaquetado, invocado como `discover.py --project-dir C:\Repositorios\Prueba Copilot3\proyectos\gestor-tareas`, se ejecutó dos veces. Una ejecución usó explícitamente `C:\Python314\python.exe`; la otra forma de invocación y la ruta completa de `discover.py` no se especificaron. Ambas terminaron con código `1`: el resolver interno eligió `python3` de WindowsApps y su salida indicó que no hay Python. Microsoft Store no se abrió. Esto demuestra un fallo de discovery del script, no ausencia de Python en el entorno. En contraste, la importación directa documentada en el punto 4 con `C:\Python314\python.exe` tuvo código `0` y cargó Streamlit 1.64.0 y SQLite 3.50.4.

## Compatibilidad y stack

La importación correcta confirma **compatibilidad básica local** de Python 3.14.4 con la instalación existente de Streamlit 1.64.0 y con el módulo SQLite. No es una afirmación de soporte formal de versiones ni valida el funcionamiento de una aplicación completa. Las versiones disponibles pueden requerir una nueva comprobación al preparar la ejecución.

Ruta A está aprobada y no está pendiente. Para este alcance no hace falta Node.js; tampoco hace falta instalar un servidor SQLite: se dispone del módulo de biblioteca estándar. No se creó manifiesto, lockfile ni entorno virtual. Si más adelante se necesita reproducibilidad mediante venv/manifiesto, hacerlo requerirá autorización separada, fuera de las restricciones de esta consulta.

## Supuestos operativos para implementar

- Se asume ejecución local enlazada solo a loopback y base SQLite en `data/tasks.sqlite3`, con respaldo manual.
- Esos son supuestos operativos para la implementación local; **no** se afirma una aprobación explícita para exponer la aplicación por red. No se configuró ni probó acceso de red.
- No se creó la carpeta `data`, la base de datos ni datos de prueba. El backup manual no se ha ejecutado ni verificado.

## No ejecutado / restricciones respetadas

No se instaló ni descargó nada; no se creó venv; no se modificaron PATH, permisos, código, manifiestos, plan u otros archivos; no se inició Streamlit, servidor, navegador ni aplicación. El discovery descrito arriba sí se ejecutó dos veces, según el usuario; no se ejecutaron tests ni comandos de gestor de paquetes. No se hicieron consultas de red y, según el usuario, Microsoft Store no se abrió.

**Único archivo autorizado actualizado:** `C:\Repositorios\Prueba Copilot3\proyectos\gestor-tareas\docs\entorno.md`.
