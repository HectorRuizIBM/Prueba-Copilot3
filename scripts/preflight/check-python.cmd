@echo off
setlocal
rem Deteccion no destructiva: no instala, no cambia PATH ni crea entornos.
rem Ejecutar desde la raiz del proyecto con cmd.exe.
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" -c "import sys; print('PYTHON_DISPONIBLE'); print(sys.executable); print(sys.version)" 2>nul
  if not errorlevel 1 exit /b 0
  echo AVISO: La venv existente no se puede ejecutar. Revisar antes de usarla.
)
where py >nul 2>nul
if not errorlevel 1 (
  py -3 -c "import sys; print('PYTHON_DISPONIBLE'); print(sys.executable); print(sys.version)" 2>nul
  if not errorlevel 1 exit /b 0
)
where python >nul 2>nul
if not errorlevel 1 (
  python -c "import sys; print('PYTHON_DISPONIBLE'); print(sys.executable); print(sys.version); sys.exit(0 if sys.version_info.major == 3 else 1)" 2>nul
  if not errorlevel 1 exit /b 0
)
echo PYTHON_AUSENTE_O_NO_EJECUTABLE: Solicitar diagnostico al investigador-entorno.
echo No se ha instalado software. La compatibilidad debe comprobarse con el stack aprobado.
exit /b 1
