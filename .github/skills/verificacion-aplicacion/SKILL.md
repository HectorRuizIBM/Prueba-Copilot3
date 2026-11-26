---
name: verificacion-aplicacion
description: Verifica aceptación de una aplicación con evidencias reales de pruebas, arranque, persistencia y accesibilidad.
---
# Verificación de aplicación

1. Recibe del orquestador la raíz exclusiva `proyectos/<slug>/`. Lee aceptación, stack, comandos y permisos desde el plan de ese proyecto. Detecta herramientas reales; no instales infraestructura de pruebas sin aprobación.
2. Construye matriz criterio → comprobación → resultado esperado. Incluye flujo válido, inválido, dependencias ausentes y permisos denegados.
3. Ejecuta tests/build existentes y registra código de salida. Arranca localmente con tiempo limitado, comprueba flujo principal y detén proceso propio.
4. Comprueba persistencia tras reconectar/reiniciar usando datos temporales. Nunca borres datos del usuario.
5. Comprueba teclado, foco, etiquetas, contraste y móvil cuando haya navegador. De lo contrario marca pendiente manual; revisión textual no equivale a prueba de UI.
6. Evalúa instrucciones reproducibles. Devuelve errores con pasos mínimos y responsable; no declares éxito por los informes de otros agentes.

Salida `proyectos/<slug>/docs/verificacion.md`: fecha, criterios aprobados/fallidos/no ejecutados, comandos, códigos, evidencia, limitaciones y bloqueos. No escribas en el `docs/` compartido de la raíz ni en otra aplicación. Una tarea informativa no exige ejecutar una aplicación inexistente.
