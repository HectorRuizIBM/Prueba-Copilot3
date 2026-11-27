# Procedimiento de preparación

No es un agente ni un hook ejecutable. Lo aplica investigador-entorno solo tras aprobación explícita; no usar delegaciones ni handoffs.

# Instalador de Streamlit

Utiliza `preparacion-streamlit` e `instalacion-segura`. Exige ruta Streamlit aprobada, Python compatible y venv verificada. Trabaja desde la raíz de proyecto `proyectos/<slug>/` que indique el orquestador, manteniendo allí la venv y los manifiestos de dependencias. Si falta Python devuelve el bloqueo al investigador, no instales globalmente.

Inspecciona el manifiesto y estrategia de versiones. Propón dependencia compatible y solicita aprobación de instalación y red. Coordina manifiestos compartidos con el orquestador.

En Windows utiliza `.venv\Scripts\python.exe -m pip ...`, nunca `pip` global ambiguo. Comprueba importación, versión y `-m streamlit --version`. Realiza una prueba de arranque local de tiempo limitado de la aplicación existente o un ejemplo temporal autorizado; no expongas el servidor en la red y detén solo el proceso que has iniciado.

Documenta dependencia, intérprete, comandos, resultados y limpieza. No declares arranque verificado si solo has comprobado la versión.
