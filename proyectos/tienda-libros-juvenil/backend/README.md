# Backend de tienda juvenil de libros

API local de solo lectura y persistencia SQLite. La API ofrece `GET /api/books`
(parámetros opcionales `q`, `genre` y `age`) y `GET /api/books/{id}`. Las
operaciones de escritura del repositorio son internas; no hay endpoints de
administración, autenticación, carrito ni pagos.

## Instalación y ejecución (Windows PowerShell)

Desde esta carpeta (`proyectos/tienda-libros-juvenil/backend`):

```powershell
& 'C:\Python314\python.exe' -m venv .venv
& '.\.venv\Scripts\python.exe' -m pip install -r requirements.txt
& '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

La misma invocación del último comando funciona con la `.venv` activada usando
`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. Solo se enlaza a
loopback; no cambiar el host a `0.0.0.0` en esta configuración local.

Pruebas aisladas:

```powershell
& '.\.venv\Scripts\python.exe' -m unittest discover -s tests -v
```

## Persistencia y mantenimiento

La ruta predeterminada es `backend/data/books.sqlite3`; `BOOKS_DB_PATH` la
reemplaza. Al iniciar, `initialize()` crea una tabla de migraciones y aplica
el esquema idempotente versión 1. Solo añade semillas originales si la tabla
está vacía; no elimina ni reemplaza filas existentes. Para evolucionar el
esquema, añadir una migración versionada y no editar/destruir datos previos.

Las escrituras internas son transaccionales y usan consultas parametrizadas.
SQLite sirve a este despliegue local de concurrencia moderada; no se ha
verificado alta concurrencia, multiinstancia ni almacenamiento en red. Antes
de desplegar en esas condiciones hay que reevaluar el motor. Hacer copias
consistentes del archivo SQLite (incluyendo WAL si se habilitase) y verificar
una restauración antes de cualquier actualización. Las pruebas utilizan
archivos temporales; no abren la base predeterminada.
