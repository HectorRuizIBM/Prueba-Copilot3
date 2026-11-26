---
name: persistencia-sqlite
description: Implementa persistencia SQLite ligera con validación, transacciones y pruebas aisladas.
---
# Persistencia SQLite

1. Confirma requisitos, stack, contrato y raíz `proyectos/<slug>/` asignada. Evalúa concurrencia y despliegue; para multiinstancia o alta escritura pide reevaluación antes de implementar. Mantén código, pruebas y configuración de la base dentro del proyecto; no uses otra aplicación ni rutas compartidas por defecto.
2. Define esquema, claves y restricciones. Documenta inicialización y evolución reproducible sin borrar datos existentes.
3. Utiliza el driver compatible aprobado, consultas parametrizadas y transacciones. Nunca concatene entradas en SQL. Separa acceso a datos y lógica, cierra conexiones y controla errores.
4. Valida tipo, tamaño y reglas de negocio en backend; no confíes en validación del cliente.
5. Prueba CRUD, entradas inválidas, registros inexistentes, persistencia al reconectar y rollback cuando corresponda. Usa una base temporal por prueba, nunca datos reales.
6. Documenta ruta configurable, limitaciones, copia de seguridad y recuperación según alcance. Pide aprobación antes de migraciones destructivas.

Salida: modelo, operaciones, inicialización/migraciones, pruebas y evidencias. No afirmar persistencia si solo se probaron datos en memoria.
