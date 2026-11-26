# Plan de agentes para crear aplicaciones web con GitHub Copilot

## 1. Objetivo

Crear un sistema de agentes de GitHub Copilot que transforme una petición del usuario en una aplicación web funcional. El agente principal coordinará la investigación, la preparación del entorno, el frontend, el backend y la verificación.

Este documento define el plan; no instala software ni implementa todavía los agentes.

### Estado inicial

- El repositorio dispone de las carpetas `.github/agents/` y `.github/skills/`.
- No hay una aplicación ni una tecnología seleccionada todavía.
- El entorno actual es Windows, con `cmd.exe` como shell.
- Antes de implementar, se debe confirmar la versión y superficie de Copilot utilizada (por ejemplo, VS Code o CLI). La disponibilidad, el formato y los eventos de hooks, las herramientas de delegación y los handoffs pueden variar. No se presupone que todas las superficies los soporten igual.

## 2. Arquitectura propuesta

```text
Usuario: petición de una web
             |
             v
       Orquestador web
             |
             +--> Investigador de entorno
             |       +--> Instalador de Python
             |       +--> Instalador de Streamlit
             |       +--> Instalador de Node.js
             |
             +--> Agente frontend
             |       +--> Skill: diseño profesional
             |       +--> Skill: diseño juvenil
             |
             +--> Agente backend
             |
             +--> Agente de verificación
```

El orquestador debe volver a integrar los resultados y verificar el producto completo. Un handoff no equivale a una llamada que devuelve automáticamente el control: el agente receptor necesita una ruta explícita para volver al orquestador.

## 3. Agentes a crear

### 3.1. Orquestador web — `orquestador-web.agent.md`

**Responsabilidad:** convertir la petición en un plan ejecutable y coordinar su entrega.

**Entrada:** objetivo de la web, público, funcionalidades, restricciones y estilo deseado.

**Acciones:**

1. Identificar requisitos y preguntar únicamente por decisiones bloqueantes.
2. Delegar al investigador la comprobación del entorno y la propuesta tecnológica.
3. Seleccionar una de las rutas de aplicación y registrar la decisión.
4. Definir el contrato de datos o API antes de paralelizar frontend y backend.
5. Delegar la implementación y resolver discrepancias entre agentes.
6. Solicitar pruebas e integrar los resultados.
7. Entregar instrucciones de ejecución, resultados de verificación y limitaciones.

**No debe:** instalar dependencias indiscriminadamente, declarar pruebas aprobadas sin ejecutarlas ni dar por terminado el trabajo solo porque los subagentes hayan finalizado.

### 3.2. Investigador y preparador de entorno — `investigador-entorno.agent.md`

**Responsabilidad:** determinar qué necesita realmente la aplicación, comprobar qué existe y coordinar la instalación de lo que falta.

**Comprobaciones:** sistema operativo, shell, herramientas disponibles, versiones, permisos, gestor de paquetes y restricciones de red.

**Salidas:**

- Informe de requisitos y herramientas detectadas.
- Stack recomendado y alternativas descartadas.
- Lista de dependencias necesarias y su estado.
- Plan de instalación con comandos adecuados al entorno.
- Bloqueos que requieren aprobación o intervención humana.

**Delegaciones:** Python, Streamlit y Node.js, exclusivamente cuando el stack los necesite.

**Creación de nuevos subagentes:** podrá proponer y crear archivos de agentes especializados dentro de `.github/agents/` cuando haya una necesidad no cubierta. Debe limitar su alcance, justificar su utilidad y evitar duplicados. Crear un archivo no garantiza que Copilot lo descubra o permita invocarlo inmediatamente en la sesión actual; se comprobará la recarga y el soporte del entorno. Si no hay delegación anidada, devolverá al orquestador las tareas de instalación para que este las ejecute mediante sus subagentes.

### 3.3. Instalador de Python — `instalador-python.agent.md`

**Responsabilidad:** asegurar un intérprete Python compatible con el proyecto.

**Flujo:**

1. Detectar instalaciones existentes. En Windows, comprobar `py --version` y `python --version`, y distinguir un intérprete real de los alias de ejecución de Windows.
2. Comprobar compatibilidad con las dependencias elegidas; no exigir automáticamente la versión más reciente.
3. Si falta, proponer un método fiable de instalación y solicitar aprobación antes de cambios globales.
4. Verificar intérprete y pip mediante el ejecutable seleccionado.
5. Crear un entorno virtual local `.venv` cuando corresponda.
6. Informar de rutas, versiones y comandos reproducibles.

**Reglas:** no sustituir instalaciones existentes ni modificar el PATH global sin autorización. Si el proceso no recibe el PATH actualizado, informar de la necesidad de reiniciar la terminal o utilizar la ruta explícita del intérprete.

### 3.4. Instalador de Streamlit — `instalador-streamlit.agent.md`

**Responsabilidad:** instalar y verificar Streamlit en el entorno Python del proyecto.

**Prerequisito:** Python verificado y entorno virtual disponible.

**Flujo:**

1. Confirmar que Streamlit pertenece al stack elegido.
2. Instalar mediante el Python del entorno virtual, no mediante un `pip` global ambiguo.
3. Registrar la dependencia y aplicar la estrategia de versiones del proyecto.
4. Verificar importación y versión.
5. Ejecutar una comprobación de arranque con tiempo limitado y detener el proceso de prueba.

**Ejemplo Windows:** `.venv\Scripts\python.exe -m pip install streamlit` y `.venv\Scripts\python.exe -m streamlit --version`.

### 3.5. Instalador de Node.js — `instalador-nodejs.agent.md`

**Responsabilidad:** preparar Node.js y el gestor de paquetes elegido cuando exista un frontend JavaScript/TypeScript o un backend Node.js.

**Flujo:**

1. Detectar `node --version` y `npm --version`.
2. Comprobar los requisitos del framework y preferir una versión LTS compatible.
3. Si falta, proponer instalación aprobada y adecuada al sistema operativo.
4. Verificar ejecutables y registrar versiones.
5. Instalar dependencias del proyecto respetando su gestor y archivo de bloqueo. Usar `npm ci` cuando exista un lockfile válido.

**Reglas:** no instalar Node.js si la aplicación funciona exclusivamente con Python y Streamlit; no mezclar gestores de paquetes sin una decisión explícita.

### 3.6. Frontend — `frontend.agent.md`

**Responsabilidad:** implementar la interfaz según el estilo seleccionado y el contrato acordado.

**Skills:**

- `diseno-profesional`: jerarquía visual clara, tipografía sobria, paleta consistente, componentes accesibles y presentación orientada a confianza y productividad.
- `diseno-juvenil`: composición dinámica, colores expresivos, tono cercano y microinteracciones moderadas, sin sacrificar accesibilidad.

**Requisitos comunes:** diseño adaptable a móvil, navegación por teclado, contraste suficiente, estados de carga/error/vacío, validación de formularios y ausencia de secretos en el cliente.

**Salida:** pantallas funcionales, componentes, integración con datos y comprobaciones de interfaz. La skill guía el diseño; no sustituye al agente ni es otro subagente.

### 3.7. Backend — `backend.agent.md`

**Responsabilidad:** implementar lógica de negocio y persistencia ligera.

**Opciones iniciales:**

- SQLite como primera opción para una aplicación local o de pequeña escala que necesite persistencia relacional.
- Datos en memoria solo para prototipos explícitamente no persistentes.
- Archivos JSON únicamente para casos muy simples sin escritura concurrente relevante.

**Requisitos:** validación de entradas, consultas parametrizadas, separación entre acceso a datos y lógica, inicialización o migraciones reproducibles, errores controlados y pruebas de persistencia.

**Salida:** modelo de datos, operaciones o API acordadas, pruebas y documentación. Si se necesita concurrencia elevada o despliegue multiinstancia, reevaluar SQLite en lugar de forzarlo.

### 3.8. Verificación — `verificador.agent.md`

**Responsabilidad:** comprobar de manera independiente que la aplicación satisface los criterios de aceptación.

**Comprobaciones:** instalación reproducible, pruebas unitarias e integración, build cuando exista, arranque, flujo principal, persistencia, accesibilidad básica y gestión de errores.

**Salida:** informe con comandos ejecutados, resultados, errores reproducibles y bloqueos. Los errores se devuelven al agente responsable y el orquestador solicita una nueva verificación.

## 4. Invocación como herramienta frente a handoff

| Mecanismo | Uso previsto | Control y resultado |
|---|---|---|
| Subagente como herramienta | Investigación, implementación acotada, comprobación o instalación aprobada | El agente invocante espera un resultado y continúa la coordinación. |
| Handoff | Cambio explícito de fase o interacción prolongada del usuario con otro especialista | El receptor pasa a conducir la conversación; el retorno requiere otro handoff o una acción explícita. |

**Ejemplos de handoffs:**

- Orquestador → frontend: «Definir y construir la interfaz».
- Orquestador → investigador: «Preparar el entorno».
- Frontend / backend / investigador → orquestador: «Integrar resultados y continuar».
- Orquestador → verificador: «Validar la entrega».

Para automatización de extremo a extremo, priorizar llamadas a subagentes. Usar handoffs cuando tenga sentido que el usuario cambie de interlocutor. Configurar las herramientas permitidas y los destinos de delegación según la sintaxis real soportada por la versión elegida de Copilot.

## 5. Instructions y skills

### Instructions generales — `.github/copilot-instructions.md`

Incluir:

- Convenciones del repositorio y estructura de la aplicación.
- Selección del stack según requisitos, sin instalar herramientas innecesarias.
- Comandos adecuados al sistema operativo y shell.
- Permisos mínimos y aprobación para instalaciones globales o acciones destructivas.
- Gestión de secretos mediante variables de entorno y archivos de ejemplo sin credenciales.
- Obligación de verificar cambios y reportar resultados reales.
- Contratos de delegación y límites de escritura por agente.
- Prohibición de bucles de delegación ilimitados.

### Instructions específicas

Crear archivos en `.github/instructions/` para frontend, backend y pruebas cuando se conozcan sus rutas. Aplicar los patrones de archivos correspondientes mediante el formato admitido por Copilot. Las instructions orientan el comportamiento; no son un mecanismo de control de acceso.

### Skills

```text
.github/skills/diseno-profesional/SKILL.md
.github/skills/diseno-juvenil/SKILL.md
```

Cada skill contendrá criterios de selección, pasos de diseño, ejemplos y una lista de comprobación. El frontend seleccionará la skill a partir de la petición o de la decisión del orquestador.

## 6. Hooks: comprobaciones en eventos

### Objetivo

Automatizar validaciones pequeñas, rápidas e idempotentes. Los hooks deben comprobar el entorno, no realizar instalaciones globales ocultas.

### Eventos propuestos

Los siguientes son objetivos funcionales; sus nombres exactos y disponibilidad deben verificarse en la superficie de Copilot seleccionada antes de escribir la configuración:

| Evento funcional | Acción | Política |
|---|---|---|
| Inicio de sesión o de agente | Detectar sistema, herramientas y entorno local | Informar del estado sin instalar nada. |
| Inicio de subagente Python, backend Python o Streamlit | Validar intérprete Python y entorno virtual | Si faltan, notificar al investigador o bloquear la tarea dependiente según el soporte disponible. |
| Antes de ejecutar una herramienta | Revisar comandos destructivos e instalaciones globales | Requerir aprobación o denegar cuando la API del hook permita hacerlo. |
| Después de modificaciones | Ejecutar validaciones acotadas sobre archivos relevantes | Reportar errores sin lanzar la suite completa en cada edición. |
| Final de tarea | Comprobar que existe un informe de verificación | Marcar verificaciones pendientes; no afirmar éxito automáticamente. |

### Caso solicitado: comprobar Python al iniciar un agente

1. El hook de inicio determina si el agente o proyecto necesita Python, si el evento proporciona esa información.
2. Comprueba primero el intérprete del proyecto y después instalaciones del sistema.
3. Devuelve un diagnóstico: disponible, incompatible o ausente.
4. El investigador delega la instalación al agente de Python, con aprobación cuando corresponda.
5. Se verifica nuevamente el intérprete antes de ejecutar tareas dependientes.

Si el evento no identifica el agente, ejecutar una detección general no bloqueante y aplicar la exigencia de Python al entrar en una tarea que lo necesite. Si no hay hooks soportados, utilizar una comprobación inicial explícita en las instructions y un script de preflight invocado por el agente.

### Implementación prevista

- Scripts locales bajo `scripts/hooks/`, con una alternativa que no dependa de Python para comprobar precisamente si Python falta.
- Configuración de hooks en la ubicación y formato documentados para el cliente seleccionado; `.github/hooks/` solo si ese cliente la soporta.
- Salidas y códigos de retorno conformes a la API real de hooks.
- Tiempo máximo de ejecución, mensajes accionables y ausencia de secretos en logs.
- Pruebas con Python presente, ausente e incompatible.

## 7. Rutas tecnológicas

### Ruta A: prototipo o herramienta de datos

- Python + Streamlit + SQLite.
- Frontend encargado de presentación, navegación y componentes de Streamlit.
- Backend como módulos Python de negocio y persistencia, sin API separada salvo necesidad.
- No requiere Node.js por defecto.

### Ruta B: web con interfaz personalizada

- Frontend JavaScript/TypeScript con un framework elegido según requisitos.
- Backend Python o Node.js, pero no ambos sin justificación.
- SQLite para persistencia inicial cuando sus límites sean compatibles con el despliegue.
- No requiere Streamlit por defecto.

La decisión depende del diseño requerido, autenticación, despliegue, número de usuarios, concurrencia y funcionalidades. La existencia de un instalador no obliga a instalar su tecnología.

## 8. Contrato de trabajo entre agentes

Cada encargo debe incluir:

```text
Objetivo:
Contexto y decisiones vigentes:
Entradas y contratos de datos/API:
Archivos que puede modificar:
Herramientas y permisos disponibles:
Criterios de aceptación:
Comandos de verificación esperados:
Resultado: cambios, verificaciones ejecutadas, riesgos y bloqueos.
```

Cada aplicación vive en una carpeta aislada `proyectos/<slug>/`, derivada del nombre aprobado del proyecto. El orquestador mantiene `proyectos/<slug>/docs/plan-aplicacion.md`; investigación y verificación escriben en `proyectos/<slug>/docs/entorno.md` y `proyectos/<slug>/docs/verificacion.md`. Los informes de aplicaciones nuevas no se escriben en el `docs/` compartido de la raíz. No asumir que los subagentes comparten automáticamente todo el contexto conversacional.

El orquestador comprueba si la carpeta ya existe antes de usarla. No sobrescribe ni mueve contenido existente: confirma que es la misma aplicación o acuerda otro slug. Crear la aplicación directamente en su carpeta asignada evita mover código después y mantiene coherentes imports, rutas y configuración.

Frontend y backend pueden trabajar en paralelo tras acordar el contrato. Archivos compartidos, dependencias y configuración quedan bajo coordinación del orquestador para evitar escrituras simultáneas.

## 9. Estructura prevista

```text
.github/
  copilot-instructions.md
  agents/
    orquestador-web.agent.md
    investigador-entorno.agent.md
    instalador-python.agent.md
    instalador-streamlit.agent.md
    instalador-nodejs.agent.md
    frontend.agent.md
    backend.agent.md
    verificador.agent.md
  instructions/
    frontend.instructions.md
    backend.instructions.md
    pruebas.instructions.md
  skills/
    diseno-profesional/SKILL.md
    diseno-juvenil/SKILL.md
scripts/
  hooks/
  preflight/
proyectos/
  <slug>/
    docs/
      plan-aplicacion.md
      entorno.md
      verificacion.md
    # Código, configuración, dependencias y pruebas de esta aplicación
PLAN-AGENTES.md
```

Cada nueva aplicación se crea directamente en `proyectos/<slug>/`; su estructura interna se decide después de elegir el stack. La documentación de la aplicación vive en su propio `docs/`; no se mantiene una carpeta `docs/` compartida en la raíz. La configuración de hooks se añadirá en la ruta admitida por el cliente y no se duplicará dentro de cada aplicación salvo necesidad aprobada.

## 10. Fases de implementación

1. **Confirmar compatibilidad:** cliente y versión de Copilot, formato de agentes, herramientas de subagentes, delegación anidada, handoffs y hooks disponibles.
2. **Definir instrucciones:** reglas generales, contrato de delegación, permisos y criterios de finalización.
3. **Crear agentes de entorno:** investigador e instaladores; probar detección sin cambios globales.
4. **Crear agentes de desarrollo:** orquestador, frontend, backend y verificador.
5. **Crear skills de diseño:** profesional y juvenil, con criterios verificables.
6. **Implementar preflight y hooks:** comenzar por detección de Python y validar sus escenarios de fallo.
7. **Probar una aplicación pequeña:** por ejemplo, gestor de tareas con alta, listado, edición, eliminación y persistencia SQLite; elegir una sola ruta tecnológica.
8. **Verificar el flujo completo:** petición → investigación → preparación aprobada → implementación → pruebas → entrega.

## 11. Criterios de aceptación del sistema de agentes

- Los ocho agentes están disponibles en el cliente elegido.
- El orquestador puede delegar tareas y recibir resultados verificables.
- Existe al menos un handoff operativo y una ruta explícita de retorno.
- El investigador instala únicamente requisitos del stack seleccionado.
- Python ausente produce un diagnóstico y una ruta de resolución, no una instalación silenciosa.
- Streamlit se instala en un entorno virtual local cuando corresponde.
- Node.js solo se prepara cuando sea necesario.
- Las dos skills producen estilos diferentes y mantienen requisitos de accesibilidad.
- El backend demuestra persistencia y validación mediante pruebas.
- Los hooks funcionan en los eventos soportados o se documenta y prueba la alternativa de preflight.
- La aplicación de ejemplo arranca con instrucciones reproducibles y un informe de verificación real.

## 12. Próxima decisión

Antes de implementar los archivos de agentes, confirmar la superficie de GitHub Copilot que se utilizará y escoger una primera aplicación de prueba. Como alcance inicial, se propone un gestor de tareas con SQLite, usando Streamlit si prima la rapidez o un frontend personalizado si prima el diseño visual.
