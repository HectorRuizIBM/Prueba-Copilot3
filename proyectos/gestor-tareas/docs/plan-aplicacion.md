# Plan de aplicación: gestor de tareas persistente

## Estado

**Implementación terminada.** Stack y diseño profesional aprobados: Ruta A (Python + Streamlit + SQLite). Las 9 pruebas backend/UI headless pasan. No se instalaron software ni dependencias. El arranque HTTP y la comprobación visual siguen pendientes de autorización.

**Carpeta del proyecto:** `proyectos/gestor-tareas/`.

## Objetivo y alcance propuesto

Crear un gestor de tareas persistente, de estilo profesional, para uso local de una persona o un equipo pequeño.

Alcance inicial propuesto:

- Crear, listar, editar y eliminar tareas.
- Filtrar tareas por estado.
- Guardar cambios entre reinicios mediante SQLite.
- No incluir autenticación, colaboración en tiempo real ni despliegue remoto en la primera versión.

### Alcance v1

- Una tarea tiene título obligatorio, descripción opcional, estado y marcas de creación/actualización.
- Estados: pendiente, en curso y completada.
- No se añade fecha límite, prioridad ni notificaciones hasta que se soliciten.

## Stack elegido

**Python + Streamlit + SQLite.** Stack elegido por el usuario para una interfaz de productividad sencilla con persistencia local. No requiere Node.js.

## Supuestos operativos de esta ejecución

- Uso local en un solo equipo. El servidor de desarrollo se limitará a `127.0.0.1`; no se configurarán acceso por red, autenticación ni despliegue.
- La base persistente estará en `data/tasks.sqlite3` bajo esta carpeta de proyecto. Se excluirá de control de versiones; la copia de seguridad será manual, con la aplicación detenida.
- Eliminar una tarea significa borrado definitivo. No se implementan papelera, historial, fechas límite ni prioridades.
- Se usará el Python y Streamlit ya presentes en el entorno. No se creará una venv ni se instalarán paquetes sin aprobación; si alguna comprobación requiere una dependencia ausente, se detendrá y solicitará autorización.

## Contrato de datos propuesto

| Campo | Tipo/validación |
|---|---|
| `id` | Identificador único, generado por la aplicación |
| `title` | Texto obligatorio, recortado, máximo 200 caracteres |
| `description` | Texto opcional, máximo 2000 caracteres |
| `status` | `pending`, `in_progress` o `completed` |
| `created_at` | Fecha/hora generada al crear |
| `updated_at` | Fecha/hora actualizada en cada edición |

Persistencia en SQLite local en `data/tasks.sqlite3`, relativo a la raíz del proyecto. Las operaciones deben validar entradas, usar consultas parametrizadas y conservar los datos al cerrar y volver a abrir la aplicación.

El backend expondrá una clase `TaskStore` que recibe una ruta de base de datos y ofrece `initialize()`, `create_task(title, description="", status="pending")`, `list_tasks(status=None)`, `get_task(task_id)`, `update_task(task_id, title, description, status)` y `delete_task(task_id)`. Cada tarea se representa con `id`, `title`, `description`, `status`, `created_at` y `updated_at`; las fechas son ISO 8601 UTC. Entradas inválidas producen `ValidationError`; una ID inexistente produce `TaskNotFoundError`. Las pruebas usarán rutas temporales, nunca `data/tasks.sqlite3`.

## Diseño aprobado

- Jerarquía sobria orientada a productividad: resumen/listado, filtros visibles y acciones claras para crear y editar.
- Tema Streamlit: fondo `#FFFFFF`, superficie secundaria `#F4F6F5`, texto `#18222D` y acento `#245C5A`; contraste medido de 16.09:1 para texto y 7.63:1 para el acento sobre blanco.
- Tipografía sans serif legible y espaciado consistente.
- Estados vacíos, de carga, error y éxito con mensajes accionables.
- Uso por teclado, foco visible, etiquetas accesibles, adaptación móvil y contraste WCAG AA como objetivo.
- Priorizar componentes nativos de Streamlit y evitar CSS dependiente de selectores internos.

## Verificación y aceptación propuestas

- CRUD de tareas y filtrado por estado funcionan.
- Títulos vacíos o estados no válidos se rechazan con un mensaje claro.
- Los datos persisten tras reiniciar/reconectar a la base SQLite.
- Pruebas usan bases temporales, no datos reales.
- Backend: `C:\Python314\python.exe -m unittest discover -s tests` desde la carpeta del proyecto.
- Arranque local: `C:\Python314\python.exe -m streamlit run app.py --server.address 127.0.0.1`; no iniciar un servidor sin autorización.
- Arranque y pasos de ejecución quedan documentados.
- Revisar teclado, estados de interfaz, adaptación móvil y contraste; marcar las comprobaciones que no puedan automatizarse.

## Entorno, permisos y próximas decisiones

- Entorno observado hasta ahora: Windows y PowerShell; Python 3.14.4 y Node.js 24.15.0 están disponibles. La presencia de Node no implica que deba usarse.
- El informe de entorno confirma Streamlit 1.64.0 ya instalado en el perfil de usuario e importable con Python 3.14.4; SQLite 3.50.4 está disponible mediante la biblioteca estándar. No hay venv ni manifiestos de aplicación. Esta instalación existente no es una dependencia del proyecto ni se ha modificado.
- La importación correcta confirma compatibilidad básica local, no una validación de la aplicación completa ni una garantía formal de soporte.
- No se ha realizado ninguna instalación. Cualquier instalación de Streamlit/dependencias o creación de un entorno virtual requerirá aprobación explícita con su alcance.
- Los supuestos operativos de esta ejecución fijan uso local y respaldo manual; cualquier requisito de acceso por red o respaldo automático queda fuera de esta versión.
- Evidencia detallada y comandos ejecutados: [entorno.md](./entorno.md).

## Responsabilidades

- Orquestador: mantener este plan, cerrar decisiones y coordinar el contrato.
- Investigador de entorno: documentar requisitos y compatibilidad en `entorno.md`; no instalar.
- Frontend: implementar `app.py` según el diseño aprobado.
- Backend: implementar `task_store.py` y `tests/test_task_store.py` bajo el contrato aprobado.
- Verificador: registrar pruebas, arranque, persistencia y comprobaciones de accesibilidad en `verificacion.md`.

La elección del stack está aprobada y el usuario ha solicitado ejecutar el plan. No instalar dependencias ni crear entornos sin aprobación explícita de esa operación.
