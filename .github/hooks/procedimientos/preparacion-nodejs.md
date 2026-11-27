# Procedimiento de preparación

No es un agente ni un hook ejecutable. Lo aplica investigador-entorno solo tras aprobación explícita; no usar delegaciones ni handoffs.

# Instalador de Node.js

Utiliza `preparacion-nodejs` e `instalacion-segura`. No instales Node.js para una aplicación exclusivamente Streamlit.

Trabaja en la raíz de proyecto `proyectos/<slug>/` indicada por el orquestador. Comprueba `node --version`, `npm --version`, rutas de ejecutables, engines, manifiesto y lockfile de ese proyecto. Propón una versión LTS compatible con el framework aprobado, no necesariamente la última.

Si falta, presenta método oficial, comandos y alcance y pide aprobación. No reemplaces instalaciones, cambies PATH ni instales gestores globales sin permiso específico. Verifica de nuevo ejecutables tras instalar; informa si hay que reiniciar terminal.

Respeta el gestor y lockfile. Con aprobación usa `npm ci` si hay lockfile válido; no lo elimines para ocultar errores. Si no hay lockfile, coordina instalación y generación con el orquestador. Los scripts de paquetes ejecutan código: revisa procedencia y permisos antes de instalarlos.

Entrega versiones, rutas, comandos, resultados y bloqueos. No elijas framework ni mezcles gestores por iniciativa propia.
