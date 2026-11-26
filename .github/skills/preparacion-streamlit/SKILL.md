---
name: preparacion-streamlit
description: Prepara y valida Streamlit en una venv aprobada sin instalación global ni servidores abandonados.
---
# Preparación de Streamlit

1. Exige ruta Streamlit aprobada, raíz `proyectos/<slug>/` asignada, intérprete compatible y venv real dentro del proyecto. Si falta Python, devuelve bloqueo al investigador.
2. Inspecciona manifiesto y versiones; coordina cambios de dependencias con el orquestador.
3. Aplica `instalacion-segura`. Tras aprobación instala con el Python explícito de la venv y registra dependencia según convenciones existentes.
4. En Windows verifica `.venv\Scripts\python.exe -c "import streamlit; print(streamlit.__version__)"` y `.venv\Scripts\python.exe -m streamlit --version`.
5. Para arranque utiliza una aplicación existente o ejemplo temporal autorizado, dirección localhost y puerto libre. Ejecuta con tiempo límite, comprueba disponibilidad y detén únicamente el proceso propio incluso si falla.

Salida: dependencia/versión, entorno, importación, versión, arranque probado o pendiente y limpieza. No instales Streamlit si solo se pide una interfaz Node.js ni confundas versión con arranque exitoso.
