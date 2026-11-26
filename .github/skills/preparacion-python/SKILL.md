---
name: preparacion-python
description: Detecta Python real, comprueba compatibilidad y prepara una venv local con permisos aprobados.
---
# Preparación de Python

1. Confirma que el stack requiere Python y recibe del orquestador la raíz `proyectos/<slug>/`. Ejecuta el preflight compartido desde la raíz del workspace si corresponde; crea o usa la venv exclusivamente dentro de la raíz del proyecto.
2. Prioriza `.venv`, luego launcher/intérprete disponible. Comprueba `-c "import sys; print(sys.executable); print(sys.version)"` y pip con el mismo ejecutable. Un alias que abre la tienda no es un intérprete.
3. Contrasta versión con requisitos; el preflight detecta presencia, no determina compatibilidad con todo el stack.
4. Si falta, aplica `instalacion-segura` con fuente oficial y aprobación; no reemplace instalaciones ni modifique PATH silenciosamente.
5. Con aprobación y si no existe, crea `.venv` mediante `<interprete> -m venv .venv`. No sobreescribas una venv existente incompatible; solicita decisión.
6. Usa `.venv\Scripts\python.exe` en Windows o `.venv/bin/python` en sistemas POSIX; verifica `-m pip --version`.

Salida: intérprete elegido, versión, venv, comandos y bloqueos. Prueba negativa: ausencia produce diagnóstico sin instalación automática; incompatibilidad se comunica sin sustituir el runtime.
