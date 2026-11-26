---
name: preparacion-nodejs
description: Detecta Node.js y prepara dependencias compatibles respetando el gestor y el lockfile aprobados.
---
# Preparación de Node.js

1. Confirma necesidad en el stack y recibe la raíz `proyectos/<slug>/` asignada. Detecta `node --version`, `npm --version` y rutas; lee engines, manifiestos y lockfiles de ese proyecto.
2. Propón LTS compatible; consulta requisitos reales del framework, no impongas la última versión.
3. Si falta, aplica `instalacion-segura`. No cambies PATH, elimines versiones ni instales gestores globales sin autorización.
4. Verifica ejecutables tras instalar. Si la terminal conserva PATH antiguo, usa ruta explícita o solicita reinicio.
5. Con permiso instala con el gestor acordado. Para npm con lockfile válido usa `npm ci`; sin lockfile coordina `npm install`. No borres un lockfile para ocultar incompatibilidad ni mezcles gestores.
6. Revisa scripts y procedencia de dependencias antes de ejecutar. Ejecuta build/tests solo si están definidos.

Salida: versiones, gestor, comandos, cambios del lockfile aprobados, resultados y bloqueos. Caso fuera de alcance: ruta solo Python/Streamlit no requiere Node.js.
