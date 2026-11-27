---
name: investigacion-entorno
description: Investiga requisitos y detecta el entorno para recomendar un stack mínimo y delegaciones justificadas.
---
# Investigación de entorno

1. Recibe del orquestador la raíz exclusiva `proyectos/<slug>/` y el nombre del proyecto. Lee petición y archivos reales de esa aplicación: manifiestos, lockfiles, documentación y configuración. Distingue observado, recomendado y pendiente.
2. Identifica SO/shell, ejecutables y versiones mediante comandos no destructivos. No interpretes falta de salida como éxito.
3. Evalúa interfaz, datos, autenticación, concurrencia y despliegue. Propón ruta A Streamlit/Python/SQLite o ruta B interfaz personalizada/backend único; justifica alternativas descartadas.
4. Obtén aprobación de decisiones tecnológicas. Construye una matriz herramienta, versión requerida, evidencia detectada, necesidad y acción.
5. Para cada faltante prepara comandos, alcance y verificación siguiendo .github/hooks/procedimientos/ e instalacion-segura. Solicita aprobación mediante el orquestador; no invoques agentes.
6. No crees agentes anidados. Devuelve necesidades no cubiertas al orquestador.

Salida en `proyectos/<slug>/docs/entorno.md`: requisitos, evidencias con comandos/códigos de salida, recomendación, aprobaciones, estado de dependencias y bloqueos. No escribas en el `docs/` compartido de la raíz ni en otra aplicación. Si la raíz asignada ya existe, comprueba que corresponde a este proyecto y no sobrescribas contenido ajeno. Caso fuera de alcance: no instalar herramientas por una solicitud meramente informativa.
