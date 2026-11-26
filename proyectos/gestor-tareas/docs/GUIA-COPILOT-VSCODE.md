# Uso y validación en GitHub Copilot para VS Code

## Estado

Se han creado ocho agentes, nueve skills, instrucciones generales y un preflight Windows cmd. No se ha elegido stack, creado una aplicación ni instalado software. `.gitignore` se conserva intacto.

La configuración usa `.github/agents/*.agent.md`, frontmatter con `name`, `description`, `tools`, `agents` en coordinadores y `handoffs`; las skills usan `.github/skills/<nombre>/SKILL.md` con `name` y `description`. Los nombres de herramientas son conjuntos de VS Code (`read`, `search`, `edit`, `execute`, `agent`); las instrucciones no sustituyen los controles de aprobación del cliente.

## Puesta en marcha

1. Abre la raíz del proyecto en VS Code con GitHub Copilot habilitado. Registra versiones de VS Code y de la extensión; no están disponibles desde esta sesión.
2. Abre Chat y comprueba el selector de agentes: `orquestador-web`, `investigador-entorno`, los tres instaladores, `frontend`, `backend` y `verificador`. Recarga la ventana si no se descubren; consulta diagnósticos de personalizaciones antes de cambiar configuración.
3. Comprueba que tu versión reconoce las tools y listas `agents`. Si no admite invocación anidada, utiliza delegación directa desde el orquestador o handoffs. No activar aprobación automática global.
4. Selecciona `orquestador-web` y describe la web. Ejemplo: «Planifica un gestor de tareas persistente con estilo profesional. Propón el stack antes de implementar. No instales nada sin mi aprobación».
5. Revisa y aprueba stack, permisos y contrato. El orquestador crea cada aplicación directamente en `proyectos/<slug>/` (slug derivado del nombre aprobado, en kebab-case) y verifica que la carpeta no pertenezca ya a otro proyecto. Solo entonces solicita implementación. El código y los informes exclusivos de esa aplicación se guardan dentro de ella: `proyectos/<slug>/docs/plan-aplicacion.md`, `proyectos/<slug>/docs/entorno.md` y `proyectos/<slug>/docs/verificacion.md`. No sobrescribir informes de otros proyectos.

## Agentes y skills

| Agente | Skills |
|---|---|
| Orquestador | Coordina las skills mediante especialistas |
| Investigador | investigacion-entorno, instalacion-segura |
| Python | preparacion-python, instalacion-segura |
| Streamlit | preparacion-streamlit, instalacion-segura |
| Node.js | preparacion-nodejs, instalacion-segura |
| Frontend | diseno-profesional o diseno-juvenil |
| Backend | persistencia-sqlite |
| Verificador | verificacion-aplicacion |

Las skills se descubren/cargan bajo demanda; no son herramientas ni agentes. Verifica en Chat que se usan las instrucciones correspondientes, no solo que los archivos existen.

## Subagentes y handoffs

El orquestador tiene una lista explícita de especialistas; el investigador limita su delegación a instaladores. Los handoffs llevan `send: false`: el usuario revisa y envía el prompt. Todos los especialistas tienen retorno explícito. El retorno de una llamada de subagente no debe confundirse con ese cambio de conversación.

Prueba una investigación acotada con la herramienta de subagentes y comprueba resultado real. Después utiliza «Preparar entorno» y «Volver al orquestador» para probar transferencia y retorno. Si faltan capacidades, documenta la limitación y usa la alternativa manual.

## Preflight y hooks

En Windows cmd, desde la raíz:

```cmd
scripts\preflight\check-python.cmd
```

Código 0: Python 3 ejecutable detectado; código 1: ausente/no ejecutable. Prioriza venv, luego `py -3`, luego `python`. No instala nada y no acredita compatibilidad con Streamlit ni pip. Una venv dañada genera aviso aunque se detecte un Python del sistema; no utilizarla sin reparación aprobada.

**No se ha configurado un hook automático.** No se ha verificado el esquema/eventos con la versión instalada del cliente. Las instructions y agentes exigen el preflight explícito antes de tareas Python: es la alternativa prevista por el plan, no un hook de inicio simulado.

Para activar un hook posteriormente: confirmar documentación y versión, evento de inicio soportado (sesión o subagente), ubicación/esquema, entrada/salida JSON, timeout y semántica del código de retorno. Adaptar el script con un wrapper que cumpla esa API. Si el evento no identifica agente/stack, limitarse a diagnóstico general no bloqueante. No reutilizar el código 1 del preflight como bloqueo sin verificar la API. No activar instalaciones, acceso a secretos, red o acciones destructivas desde hooks.

Fuentes oficiales a contrastar con tu cliente:
- https://code.visualstudio.com/docs/copilot/customization/custom-agents
- https://code.visualstudio.com/docs/copilot/customization/agent-skills
- https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- https://code.visualstudio.com/docs/copilot/customization/hooks

## Validación de aceptación pendiente en el cliente real

- Descubrimiento: ocho agentes y nueve skills sin diagnósticos de frontmatter/tools.
- Delegación: resultado real de una tarea acotada; probar alternativa si no hay anidación.
- Handoff: cambio a investigador y retorno explícito al orquestador.
- Permisos: Python ausente produce diagnóstico; petición de instalación sin permiso solicita aprobación, nunca instala silenciosamente.
- Stack: ruta Streamlit no provoca instalación de Node; ruta personalizada no instala Streamlit sin necesidad.
- Diseño: comparar misma pantalla profesional/juvenil, teclado, móvil y contraste.
- Datos: tras elegir aplicación/stack, verificar CRUD, validación y persistencia con datos temporales.
- Preflight: probar presente, ausencia controlada y venv dañada; incompatibilidad se evalúa aparte con requisitos aprobados. No eliminar runtimes reales para simular ausencia.
- Hooks: pendiente hasta configurar y ejecutar evento real; preflight manual no prueba integración de hooks.

Las instructions específicas con `applyTo` para frontend/backend/pruebas quedan pendientes de conocer las rutas reales. No se usan globs inventados para una aplicación todavía inexistente. Las fases 7–8 del plan (aplicación de ejemplo y flujo completo) requieren elegir y aprobar la primera aplicación y su stack.
