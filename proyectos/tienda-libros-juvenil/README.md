# Tienda juvenil de libros

Catálogo local de demostración con frontend React y API Python. Los libros y las descripciones son ficticios; no se muestran precios ni se usan cubiertas externas.

## Requisitos

- Node.js 24 o compatible con Vite 8, y npm.
- Python 3.14.

## Preparación en Windows PowerShell

Desde la carpeta del proyecto:

```powershell
Set-Location backend
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-Location ..\frontend
npm ci
```

Las dependencias Python se instalan en `backend\.venv` y las de frontend en `frontend\node_modules`; no se requieren instalaciones globales.

## Ejecución local

Abre dos terminales PowerShell desde la carpeta del proyecto.

Terminal 1 — API:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Terminal 2 — web:

```powershell
Set-Location frontend
npm run dev -- --host 127.0.0.1
```

Abre `http://127.0.0.1:5173`. La API solo escucha en loopback; Vite reenvía `/api` a `127.0.0.1:8000`.

## Verificaciones

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
Set-Location ..\frontend
npm run build
```

La base SQLite local se crea en `backend\data\books.sqlite3` en el primer arranque. Las pruebas deben usar una base temporal y no modificar esa base.
