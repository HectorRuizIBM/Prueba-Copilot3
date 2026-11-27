@echo off
rem Deteccion no destructiva: no instala ni cambia PATH.
node --version
if errorlevel 1 exit /b 1
call npm --version
if errorlevel 1 exit /b 1
exit /b 0
