# Investigación de GitHub Copilot: agentes, handoffs y hooks

Este repositorio es un espacio de trabajo para diseñar y probar las capacidades de personalización de GitHub Copilot en VS Code: instrucciones, agentes especializados, skills, delegación como herramienta, handoffs y hooks de ciclo de vida.

El objetivo de la investigación es distinguir lo que está definido en los archivos de configuración de lo que realmente descubre y ejecuta el cliente de Copilot. La disponibilidad y sintaxis de estas funciones pueden variar según el cliente y su versión; por eso, los resultados estáticos no se presentan como evidencia de ejecución.

## Estado actual

- Hay instrucciones generales en `.github/copilot-instructions.md`.
- Hay nueve perfiles de agente en `.github/agents/` y diez skills en `.github/skills/`, incluido el especialista `playwright` y la skill `pruebas-web-playwright`.
- Los perfiles incluyen frontmatter `handoffs`, con rutas propuestas desde el orquestador a especialistas y de vuelta al orquestador.
- `PLAN-AGENTES.md` describe la arquitectura y los experimentos pendientes.
- `scripts/validate-agent-config.py` comprueba estructura, nombres, cantidad de agentes/skills y destinos declarados. **No** demuestra que VS Code descubra los perfiles, que un handoff funcione en una sesión ni que un hook se ejecute.
- `scripts/preflight/check-python.cmd` es una comprobación no destructiva de Python: puede ejecutarse manualmente y es el comando utilizado por el hook.
- Hay un hook configurado en `.github/hooks/check-python.json` para el evento `sessionStart`. Su descubrimiento y ejecución real en Copilot en VS Code están pendientes de verificación.
- Las aplicaciones de `proyectos/` son ejemplos para probar el flujo de desarrollo. La tienda de libros juveniles no implementa por sí misma hooks ni handoffs.

## Qué se investiga

### Agentes como herramientas y handoffs

- **Subagente como herramienta:** el agente invocante delega una tarea acotada, recibe el resultado y continúa coordinando.
- **Handoff:** se transfiere explícitamente el control de la conversación a otro agente. El retorno requiere otro handoff o una acción del usuario; no se presupone que vuelva automáticamente.
- **Pregunta de prueba:** ¿el cliente seleccionado descubre y ejecuta las rutas configuradas, y puede el agente receptor devolver el control al orquestador?

El agente `orquestador-web` declara handoffs a `investigador-entorno`, `frontend`, `backend` y `verificador`. Los especialistas incluyen rutas de retorno. Esto describe la configuración escrita; su funcionamiento real debe comprobarse en el cliente de Copilot elegido.

### Verificación de la aplicación creada con Playwright

El objetivo de la revisión es **la aplicación que frontend/backend acaban de construir en `proyectos/<slug>/`**, no Viewnext ni otra web externa.

1. **Orquestador → verificador:** entrega la raíz exacta del proyecto, su plan, criterios de aceptación y permisos.
2. **Verificador:** lee los comandos existentes, arranca los servicios con permisos vigentes y datos temporales, comprueba que responden y obtiene la URL local efectiva. Si el arranque falla, registra el bloqueo sin sustituir la aplicación por una web externa.
3. **Verificador → playwright:** invoca al especialista mediante la herramienta `agent`, indicando URL, criterios, rutas autorizadas, navegadores disponibles y acciones permitidas. Si la delegación anidada no está disponible, ofrece el handoff **Crear y ejecutar pruebas web** o devuelve el encargo al orquestador.
4. **Playwright:** lee el plan y la implementación, construye y ejecuta pruebas de las funcionalidades reales siguiendo [pruebas-web-playwright](.github/skills/pruebas-web-playwright/SKILL.md). Mantiene pruebas, configuración propia y artefactos dentro del proyecto.
5. **Verificador:** contrasta las evidencias, registra criterios aprobados, fallidos o no ejecutados en `proyectos/<slug>/docs/verificacion.md` y devuelve los fallos al orquestador. Detiene únicamente los procesos que haya iniciado.

#### Controles de las pruebas

- **Páginas:** respuesta HTTP esperada, URL, título y contenido relevante visible.
- **Enlaces:** nombres accesibles, destinos válidos y navegación interna representativa.
- **Botones:** visibilidad, estado y efecto observable de las acciones permitidas.
- **Formularios y flujos:** etiquetas, validaciones, estados de error/éxito y flujo principal. Las operaciones que modifican datos se prueban solo con permisos y datos temporales en un entorno controlado.
- **Móvil y teclado:** adaptación, desbordamiento horizontal, foco y navegación de controles relevantes, sin declarar accesibilidad completa.
- **Red y consola:** errores de JavaScript y recursos fallidos, distinguiendo recursos propios y terceros.

Las pruebas deben ser independientes, usar selectores accesibles y esperas de Playwright, sin pausas fijas ni aserciones relajadas para ocultar defectos. El especialista devuelve comandos, códigos de salida, resultados, artefactos reales y limitaciones. No instala dependencias ni navegadores sin aprobación y no repara la implementación de la aplicación.

#### Cómo solicitar la verificación en Copilot

Selecciona `verificador` y sustituye `<slug>` por el proyecto recién creado:

> Verifica la aplicación recién construida en proyectos/<slug>/ según su docs/plan-aplicacion.md. Arranca sus servicios con los comandos existentes y permisos vigentes, y delega en playwright las pruebas de su URL local. Autoriza pruebas y artefactos dentro de este proyecto; no instales dependencias ni uses una web externa como sustituto. Registra evidencias y bloqueos en docs/verificacion.md del proyecto.

La suite `tests/example.spec.js` de la raíz para Viewnext es un experimento externo separado, **no** la ubicación ni el objetivo de las pruebas de aplicaciones nuevas. La configuración de delegación existe, pero su ejecución real en Copilot en VS Code debe comprobarse; este README no afirma que las aplicaciones hayan superado estas pruebas.

### Hooks

Un hook ejecuta un comando cuando ocurre un evento del agente, sin depender de que el modelo decida invocar una herramienta. El ejemplo creado comprueba Python al inicio de una sesión, sin instalar software.

#### Ejemplo configurado: comprobar Python al iniciar una sesión

El archivo [`.github/hooks/check-python.json`](.github/hooks/check-python.json) contiene:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "command": "cmd.exe /d /c scripts\\preflight\\check-python.cmd",
        "timeoutSec": 10
      }
    ]
  }
}
```

- **Evento:** `sessionStart`, inicio de una sesión; no implica ejecución al iniciar cada subagente ni en cada handoff.
- **Comando:** ejecuta el preflight desde la raíz del repositorio en Windows, con un límite configurado de 10 segundos.
- **Detección:** busca primero `.venv\Scripts\python.exe`, después `py -3` y finalmente `python`.
- **Resultado:** muestra `PYTHON_DISPONIBLE`, ruta y versión si encuentra un intérprete ejecutable; en caso contrario, muestra `PYTHON_AUSENTE_O_NO_EJECUTABLE` y devuelve código `1`.
- **Seguridad y alcance:** no instala software, no cambia PATH ni crea entornos. Comprueba disponibilidad, no compatibilidad con las dependencias del stack. Se ejecuta para la sesión aunque la tarea no necesite Python.
- **Límites:** requiere Windows y un cliente que admita este formato. Un código de salida `1` no garantiza bloquear al agente; la salida del script tampoco equivale por sí sola a incorporar instrucciones al contexto del modelo.

#### Cómo comprobarlo en Copilot en VS Code

1. Abre la raíz del repositorio en VS Code y registra las versiones de VS Code y de las extensiones de Copilot.
2. Selecciona el destino de sesión **Copilot**, si el cliente ofrece ese selector. Abre `/hooks` o la sección **Customizations → Hooks**, si están disponibles, y comprueba que reconoce la configuración existente; no crees otra copia del hook.
3. Ejecuta primero `scripts\preflight\check-python.cmd` en `cmd.exe` desde la raíz. Esto prueba el script, no la integración con Copilot.
4. Inicia una sesión nueva y consulta los detalles o registros de ejecución de hooks que proporcione el cliente. Comprueba que se lanzó el comando y guarda su salida.
5. Registra el evento, las versiones, el código de salida y el resultado observado. Prueba también la ausencia de Python en un entorno controlado, sin desinstalar ni modificar el entorno principal.

Si el cliente no reconoce el hook, revisa su versión, el formato admitido y las políticas de la organización. Mantén el preflight manual como alternativa hasta verificar la integración.

Referencias oficiales: [Hooks en VS Code](https://code.visualstudio.com/docs/agent-customization/hooks) y [referencia de hooks de Copilot](https://docs.github.com/en/copilot/reference/hooks-reference).

## Contenido del repositorio

| Ruta | Propósito |
|---|---|
| `.github/copilot-instructions.md` | Reglas generales, aislamiento por proyecto, permisos y coordinación. |
| `.github/agents/` | Orquestador, investigador, instaladores, frontend, backend, verificador y especialista Playwright. |
| `.github/skills/` | Guías reutilizables de diseño, entorno, instalación, SQLite, verificación y pruebas web con Playwright. |
| `PLAN-AGENTES.md` | Arquitectura, diferencias entre delegación y handoff, propuesta de hooks y criterios de aceptación. |
| `scripts/validate-agent-config.py` | Validación estructural estática, sin dependencias externas. |
| `.github/hooks/check-python.json` | Hook configurado para comprobar Python en `sessionStart`; integración pendiente de verificar en VS Code. |
| `scripts/preflight/check-python.cmd` | Detección no destructiva de Python en Windows, manual o invocada por el hook. |
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

La salida esperada identifica nueve agentes, diez skills y destinos resueltos. Es una comprobación del contenido de los archivos, no una prueba de integración con Copilot.

Para comprobar Python en Windows desde `cmd.exe`, desde la raíz del repositorio:

```cmd
scripts\preflight\check-python.cmd
```

El preflight no instala herramientas, no cambia PATH y no crea entornos virtuales.

## Próximos experimentos

1. Registrar las versiones exactas de VS Code y de las extensiones de GitHub Copilot utilizadas.
2. Comprobar el descubrimiento real de instrucciones, agentes y skills en ese cliente.
3. Probar una delegación como herramienta y un handoff de ida y vuelta; guardar evidencia del resultado y de las acciones del usuario necesarias.
4. Confirmar que VS Code descubre `.github/hooks/check-python.json` y verificar su ejecución en una sesión nueva.
5. Verificar los casos de Python disponible y ausente en entornos controlados; comprobar por separado la compatibilidad de versión con el stack seleccionado.
6. Si no hay soporte o el formato no es compatible, probar y documentar el preflight como alternativa explícita.

7. Probar el flujo orquestador → verificador → playwright con una aplicación recién creada: comprobar arranque local, pruebas dentro de su proyecto, evidencias, retorno al verificador y comunicación de fallos al orquestador.
8. Actualizar `PLAN-AGENTES.md` y este README con comandos, versiones, resultados y límites observados.

## Límites y seguridad

- No afirmar que un hook se ejecutó por encontrar una propuesta en un plan o un script en el repositorio.
- No afirmar que un handoff funciona por tener metadatos `handoffs` en un agente; probarlo en la sesión real.
- No instalar dependencias, herramientas o versiones globales sin aprobación explícita. Los agentes de instalación deben limitarse al proyecto y al stack aprobado.
- No guardar credenciales ni secretos en prompts, archivos de ejemplo o informes.
- Cada aplicación vive en `proyectos/<slug>/`; sus documentos y datos no deben mezclarse con los de otra aplicación.
