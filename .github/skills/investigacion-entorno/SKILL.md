---
name: investigacion-entorno
description: Investiga requisitos y detecta el entorno para recomendar un stack mínimo y delegaciones justificadas.
---
# Investigación de entorno

1. Recibe del orquestador la raíz exclusiva `proyectos/<slug>/` y el nombre del proyecto. Lee petición y archivos reales de esa aplicación: manifiestos, lockfiles, documentación y configuración. Distingue observado, recomendado y pendiente.
2. Identifica SO/shell, ejecutables y versiones mediante comandos no destructivos. No interpretes falta de salida como éxito.
3. Evalúa interfaz, datos, autenticación, concurrencia y despliegue. Propón ruta A Streamlit/Python/SQLite o ruta B interfaz personalizada/backend único; justifica alternativas descartadas.
4. Obtén aprobación de decisiones tecnológicas. Construye una matriz herramienta, versión requerida, evidencia detectada, necesidad y acción.
5. Para cada faltante prepara encargo al instalador con alcance, permisos y verificación. Usa `instalacion-segura`; si no hay delegación anidada, devuelve encargos al orquestador.
6. Si se necesita otro especialista, justifica alcance y evita duplicados; no presupongas descubrimiento inmediato de nuevos archivos.

Salida en `proyectos/<slug>/docs/entorno.md`: requisitos, evidencias con comandos/códigos de salida, recomendación, aprobaciones, estado de dependencias y bloqueos. No escribas en el `docs/` compartido de la raíz ni en otra aplicación. Si la raíz asignada ya existe, comprueba que corresponde a este proyecto y no sobrescribas contenido ajeno. Caso fuera de alcance: no instalar herramientas por una solicitud meramente informativa.
