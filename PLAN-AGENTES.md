# Arquitectura de agentes: dos niveles

## Estructura vigente

```text
Usuario → orquestador-web (nivel 1)
              → investigador-entorno (nivel 2)
              → frontend (nivel 2)
              → backend (nivel 2, si corresponde)
              → verificador con Playwright (nivel 2)
              ← resultados, evidencias y bloqueos
Usuario ← entrega del orquestador
```

Solo el orquestador tiene herramienta agent y lista de agentes delegables. Los especialistas devuelven resultados o utilizan un handoff de retorno; no crean ni invocan agentes anidados.

## Preparación sin agentes instaladores

Los antiguos perfiles instalador-python, instalador-streamlit e instalador-nodejs se han convertido en procedimientos en .github/hooks/procedimientos/. Los hooks de sesión detectan Python y Node/npm sin instalar nada. Los documentos no son hooks ejecutables.

Instalar automáticamente al comenzar una sesión no permite aprobar stack, versión y alcance por proyecto: por seguridad, investigador-entorno sigue las skills de preparación y los procedimientos solo tras autorización explícita. Runtimes globales, red, cambios PATH y dependencias requieren permisos específicos. Véase .github/hooks/README.md.

## Construcción y verificación

El orquestador registra plan, contrato y propiedad de archivos en proyectos/<slug>/docs/plan-aplicacion.md. Investigador-entorno documenta entorno.md. Frontend/backend construyen dentro de la misma raíz con archivos separados.

Verificador integra el antiguo especialista Playwright: arranca la aplicación creada, obtiene su URL local, guarda una suite reproducible y configuración dentro del proyecto, ejecuta comprobaciones y documenta verificacion.md. No sustituye la aplicación por una web externa ni repara implementación ajena. Devuelve fallos al orquestador y detiene solo procesos propios.

El antiguo perfil Playwright se conserva fuera de .github/agents/, en docs/archivo-agentes/, únicamente como histórico; no es un agente activo.

## Validación y límites

scripts/validate-agent-config.py comprueba cinco agentes, diez skills, destinos y ausencia de delegación anidada en especialistas. No verifica descubrimiento en VS Code ni ejecución real de hooks/handoffs.

Pendiente probar en el cliente: descubrimiento de los cinco perfiles, hook de Python y Node, delegación del orquestador, retorno y verificación con suite guardada de una aplicación real. Si faltan herramientas de delegación usar handoffs con intervención del usuario, sin simular llamadas.
