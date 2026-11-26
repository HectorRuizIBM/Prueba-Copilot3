# Investigación de GitHub Copilot: agentes, handoffs y hooks

Este repositorio es un espacio de trabajo para diseñar y probar las capacidades de personalización de GitHub Copilot en VS Code: instrucciones, agentes especializados, skills, delegación como herramienta, handoffs y hooks de ciclo de vida.

El objetivo de la investigación es distinguir lo que está definido en los archivos de configuración de lo que realmente descubre y ejecuta el cliente de Copilot. La disponibilidad y sintaxis de estas funciones pueden variar según el cliente y su versión; por eso, los resultados estáticos no se presentan como evidencia de ejecución.

## Estado actual

- Hay instrucciones generales en `.github/copilot-instructions.md`.
- Hay ocho perfiles de agente en `.github/agents/` y nueve skills en `.github/skills/`.
- Los perfiles incluyen frontmatter `handoffs`, con rutas propuestas desde el orquestador a especialistas y de vuelta al orquestador.
- `PLAN-AGENTES.md` describe la arquitectura y los experimentos pendientes.
- `scripts/validate-agent-config.py` comprueba estructura, nombres, cantidad de agentes/skills y destinos declarados. **No** demuestra que VS Code descubra los perfiles, que un handoff funcione en una sesión ni que un hook se ejecute.
- `scripts/preflight/check-python.cmd` es una comprobación manual y no destructiva de Python. **No es un hook de Copilot.**
- En la inspección actual no se encontró configuración de hooks en `.github/hooks/` ni en `.vscode/`. Los hooks de Copilot no están implementados ni verificados en este repositorio.
- Las aplicaciones de `proyectos/` son ejemplos para probar el flujo de desarrollo. La tienda de libros juveniles no implementa por sí misma hooks ni handoffs.

## Qué se investiga

### Agentes como herramientas y handoffs

- **Subagente como herramienta:** el agente invocante delega una tarea acotada, recibe el resultado y continúa coordinando.
- **Handoff:** se transfiere explícitamente el control de la conversación a otro agente. El retorno requiere otro handoff o una acción del usuario; no se presupone que vuelva automáticamente.
- **Pregunta de prueba:** ¿el cliente seleccionado descubre y ejecuta las rutas configuradas, y puede el agente receptor devolver el control al orquestador?

El agente `orquestador-web` declara handoffs a `investigador-entorno`, `frontend`, `backend` y `verificador`. Los especialistas incluyen rutas de retorno. Esto describe la configuración escrita; su funcionamiento real debe comprobarse en el cliente de Copilot elegido.

### Hooks

Se quiere comprobar si los hooks disponibles permiten automatizar validaciones breves en eventos como el inicio de una sesión o agente, antes/después de una herramienta y al finalizar una tarea. Un caso de estudio es detectar si una tarea necesita Python y comprobar el intérprete sin instalar software silenciosamente.

Antes de implementar hooks se debe confirmar el cliente y su versión, consultar los eventos y el formato que admite, y probar el comportamiento real. Si no hay un hook compatible, la alternativa documentada es invocar explícitamente el preflight y comunicar el resultado.

## Contenido del repositorio

| Ruta | Propósito |
|---|---|
| `.github/copilot-instructions.md` | Reglas generales, aislamiento por proyecto, permisos y coordinación. |
| `.github/agents/` | Orquestador, investigador, instaladores, frontend, backend y verificador. |
| `.github/skills/` | Guías reutilizables de diseño, entorno, instalación, SQLite y verificación. |
| `PLAN-AGENTES.md` | Arquitectura, diferencias entre delegación y handoff, propuesta de hooks y criterios de aceptación. |
| `scripts/validate-agent-config.py` | Validación estructural estática, sin dependencias externas. |
| `scripts/preflight/check-python.cmd` | Detección manual no destructiva de Python en Windows. |
| `proyectos/<slug>/` | Aplicaciones y sus documentos aislados por proyecto. |

### Aplicaciones de ejemplo

- [Gestor de tareas](proyectos/gestor-tareas/README.md): ejemplo local con Python, Streamlit y SQLite.
- [Tienda juvenil de libros](proyectos/tienda-libros-juvenil/README.md): ejemplo con React, TypeScript, Vite, FastAPI y SQLite. Tiene su propio plan, informe de entorno y verificación.

Los detalles de stack, comandos y resultados pertenecen al README y a los documentos de cada aplicación; no se duplican aquí.

## Comprobaciones disponibles

Desde la raíz del repositorio, en PowerShell:

```powershell
python scripts\validate-agent-config.py
```

La salida esperada identifica ocho agentes, nueve skills y destinos resueltos. Es una comprobación del contenido de los archivos, no una prueba de integración con Copilot.

Para comprobar Python en Windows desde `cmd.exe`, desde la raíz del repositorio:

```cmd
scripts\preflight\check-python.cmd
```

El preflight no instala herramientas, no cambia PATH y no crea entornos virtuales.

## Próximos experimentos

1. Registrar el cliente de Copilot y su versión exacta (por ejemplo, VS Code o CLI).
2. Comprobar el descubrimiento real de instrucciones, agentes y skills en ese cliente.
3. Probar una delegación como herramienta y un handoff de ida y vuelta; guardar evidencia del resultado y de las acciones del usuario necesarias.
4. Consultar la documentación del cliente para confirmar la configuración y los eventos de hooks disponibles antes de añadir archivos.
5. Si hay soporte, implementar un hook pequeño para detectar Python al inicio de una tarea que lo necesite; verificar Python ausente, incompatible y disponible.
6. Si no hay soporte, probar y documentar el preflight como alternativa explícita.
7. Actualizar `PLAN-AGENTES.md` y este README con comandos, versiones, resultados y límites observados.

## Límites y seguridad

- No afirmar que un hook se ejecutó por encontrar una propuesta en un plan o un script en el repositorio.
- No afirmar que un handoff funciona por tener metadatos `handoffs` en un agente; probarlo en la sesión real.
- No instalar dependencias, herramientas o versiones globales sin aprobación explícita. Los agentes de instalación deben limitarse al proyecto y al stack aprobado.
- No guardar credenciales ni secretos en prompts, archivos de ejemplo o informes.
- Cada aplicación vive en `proyectos/<slug>/`; sus documentos y datos no deben mezclarse con los de otra aplicación.
