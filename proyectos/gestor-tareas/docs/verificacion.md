# Verificación — gestor de tareas

**Fecha:** 2026-11-26  
**Proyecto:** `proyectos/gestor-tareas`  
**Entorno:** Windows; `C:\Python314\python.exe` (Python 3.14.4), Streamlit 1.64.0, SQLite 3.50.4.  
**Alcance:** pruebas backend existentes y pruebas UI headless con Streamlit AppTest. No se inició servidor ni navegador, no se instalaron dependencias y no se usó la base persistente.

## Matriz de aceptación

| Criterio | Comando/acción y código | Resultado observado | Estado |
|---|---|---|---|
| Pruebas unitarias backend: CRUD, filtros, validación, timestamps y persistencia/reconexión SQLite | Desde la raíz del proyecto: `& 'C:\Python314\python.exe' -m unittest discover -s tests -p 'test_task_store.py' -v` — **código 0** | 7 pruebas aprobadas. Incluye reconexión a la base temporal, filtros, entradas inválidas y rollback ante fallo SQLite. | **Aprobado** |
| UI headless: estado vacío, creación y validación de título | `& 'C:\Python314\python.exe' -m unittest discover -s tests -p 'test_app.py' -v` — **código 0** | La aplicación cargó sin excepciones; el estado vacío y el rechazo de título vacío se comprobaron. Alta con título recortado y descripción también comprobada. | **Aprobado** |
| UI headless: filtro, edición, borrado confirmado y reconexión/persistencia | Mismo comando AppTest — **código 0** | El filtro sin resultados mostró su mensaje; se rechazó edición con título vacío; edición válida persistió al reconectar `TaskStore`; borrado sin confirmación mostró advertencia y el borrado confirmado dejó la lista vacía. | **Aprobado** |
| Suite completa backend + UI | `& 'C:\Python314\python.exe' -m unittest discover -s tests -v` — **código 0** | 9 pruebas aprobadas. | **Aprobado** |
| Instalación reproducible | Inspección con `C:\Python314\python.exe`: Streamlit importable y distribución instalada `1.64.0`; `requirements.txt` contiene `streamlit==1.64.0`. No se ejecutó instalación ni descarga. | Hay una versión fijada de Streamlit y está disponible en este entorno. No se validó una instalación limpia; no se identificó lockfile ni fijación del intérprete Python. | **No ejecutado** |
| Build | Inspección de artefactos: no se encontró `pyproject.toml` ni `setup.py`; no hay comando de build documentado. | No corresponde un build definido para esta aplicación Streamlit. | **No ejecutado** |
| Arranque HTTP local | No ejecutado, conforme al permiso explícito de no iniciar servidor/navegador. | No se ha comprobado el arranque HTTP ni el enlace efectivo a loopback. Las pruebas AppTest usan `streamlit.config.set_option('server.address', '127.0.0.1')` en el proceso de prueba y no arrancan un servidor. | **No ejecutado** |
| Persistencia en base temporal y protección de datos persistentes | Revisiones realizadas por los tests AppTest y backend; `data/tasks.sqlite3` comprobada por existencia tras las pruebas. | Las verificaciones usaron `tempfile`; la ruta por defecto `data/tasks.sqlite3` no existía tras la ejecución y no se creó ni modificó. | **Aprobado** |
| Errores de interfaz, vacío y validación | AppTest descrito arriba; errores de validación backend dentro de la suite. | Se observaron mensajes de vacío, error de título y advertencia de confirmación. El test backend también verifica rollback ante fallo de escritura SQLite. No se simuló fallo de permisos ni dependencia ausente en la interfaz. | **Aprobado** para los escenarios ejercitados; fallos de permisos/dependencias **no ejecutados** |
| Teclado, foco, etiquetas accesibles y adaptación móvil | Sin navegador; inspección textual no demuestra comportamiento accesible. | Pendiente de comprobación manual con navegador/dispositivo. | **No ejecutado** |
| Contraste visual | Sin navegador; el archivo `.streamlit/config.toml` contiene los tokens del plan (`#245C5A`, `#FFFFFF`, `#F4F6F5`, `#18222D`), pero no se midió visualmente la interfaz en esta verificación. | No se declara accesibilidad visual ni contraste aprobado a partir de la configuración. | **No ejecutado** |

## Reproducibilidad y seguridad de la ejecución

- Los comandos se ejecutaron desde `proyectos/gestor-tareas` con la ruta explícita del intérprete documentado.
- La configuración de dirección y `TASKS_DB_PATH` se limitaron al proceso de test. Las pruebas crearon y limpiaron bases temporales propias.
- No hubo instalación, descarga, consulta de red, creación de entorno virtual, ejecución HTTP ni apertura de navegador.
- La base persistente por defecto no se tocó.
- AppTest imprimió el aviso de Streamlit `missing ScriptRunContext` al ejecutarse en modo headless; las pruebas terminaron correctamente y `app.exception` estuvo vacío.

## Notas y bloqueos

- Durante la elaboración del test UI, una primera ejecución de `test_app.py` terminó con código **1** porque el propio test intentó borrar una tarea todavía oculta por el filtro `pending` después de cambiarla a `completed`. Se corrigió únicamente el test para volver al filtro `all`. Las ejecuciones finales del test UI (2 pruebas), backend (7) y suite completa (9) terminaron con código **0**. No se modificaron `app.py` ni `task_store.py`.
- Pendientes por permiso/alcance: arranque HTTP, navegador, accesibilidad visual y validación de instalación limpia. No se registraron fallos reproducibles de la implementación en las comprobaciones ejecutadas.
