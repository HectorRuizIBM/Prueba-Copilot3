# Hooks y preparación del entorno

Los hooks son comandos de ciclo de vida, no agentes. Mantienen la arquitectura en dos niveles.

- `check-python.json`: detección no destructiva de Python al iniciar sesión, mediante el preflight existente.
- `check-node.json`: detección no destructiva de Node/npm al iniciar sesión. Su ausencia puede ser normal en proyectos exclusivamente Python.
- `procedimientos/`: instrucciones de preparación de Python, Streamlit y Node migradas desde los antiguos instaladores. Los Markdown NO se ejecutan como hooks.

La instalación no se dispara en sessionStart: requiere conocer proyecto, stack, versión, manifiesto y aprobación explícita de operación y alcance. Investigador-entorno presenta el plan al orquestador y ejecuta únicamente comandos autorizados siguiendo las skills preparacion-python, preparacion-streamlit, preparacion-nodejs e instalacion-segura. Streamlit se comprueba usando el Python de la venv del proyecto, no globalmente.

No se añade un hook global para instalar Streamlit: no existe un proyecto/venv único por sesión. No instalar runtimes, dependencias o navegadores automáticamente ni cambiar PATH. Si falta software, comunicar el bloqueo y proponer instalación oficial o instrucciones manuales.

Formato de hooks basado en el existente en el repositorio; descubrimiento y ejecución deben verificarse en el cliente Copilot elegido. Si no se reconoce, ejecutar las comprobaciones manualmente. No atribuir autorización al evento ni interpretar un código de salida como garantía de bloqueo del agente.
