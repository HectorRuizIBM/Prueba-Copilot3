# Gestor de tareas

Aplicación local hecha con Python, Streamlit y SQLite.

## Ejecutar

Desde esta carpeta, usa el intérprete Python que ya tiene Streamlit disponible:

```powershell
& 'C:\Python314\python.exe' -m streamlit run app.py --server.address 127.0.0.1
```

La aplicación solo escucha en el equipo local. No se instalaron dependencias ni se creó un entorno virtual. Si Streamlit no está disponible en otro entorno, solicita autorización antes de instalarlo.

## Datos

Las tareas se guardan en `data/tasks.sqlite3`. Para respaldarlas, detén la aplicación y copia ese archivo a una ubicación segura. No está incluida una copia de seguridad automática.
