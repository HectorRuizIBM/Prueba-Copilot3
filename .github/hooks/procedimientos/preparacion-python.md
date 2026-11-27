# Procedimiento de preparación

No es un agente ni un hook ejecutable. Lo aplica investigador-entorno solo tras aprobación explícita; no usar delegaciones ni handoffs.

# Instalador de Python

Utiliza `preparacion-python` y `instalacion-segura`. Confirma que Python es necesario y la versión compatible con el stack aprobado. El orquestador debe indicar la raíz `proyectos/<slug>/`; cualquier venv o archivo de entorno del proyecto se crea allí, no en la raíz compartida del workspace.

En Windows ejecuta el preflight y contrasta `py --version`, `python --version` y el intérprete de `.venv` si existe. Verifica ejecución real, `sys.executable`, versión y pip usando el mismo intérprete; no confundas alias de Microsoft Store con Python instalado.

Si falta o es incompatible, presenta método oficial, versión, alcance y comandos; solicita permiso antes de descargar/instalar. No desinstales ni reemplaces otras versiones, ni cambies PATH global sin autorización específica. Si no hay permisos o red, entrega instrucciones manuales y marca el bloqueo.

Con aprobación crea `.venv` local mediante el intérprete seleccionado, sin reemplazar una venv existente. Usa su ejecutable explícito en comandos posteriores. Comprueba `-m pip --version`. Si PATH no se actualiza, informa de reinicio de terminal o ruta absoluta.

Devuelve comandos, códigos de salida, versiones, rutas y pruebas reales. No instales Streamlit: es responsabilidad de su especialista.
