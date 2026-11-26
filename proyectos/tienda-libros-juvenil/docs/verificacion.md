# Verificación independiente — tienda-libros-juvenil

**Fecha:** 2026-11-26  
**Alcance:** `proyectos/tienda-libros-juvenil/`; criterios de `docs/plan-aplicacion.md` y comandos de `README.md`.  
**Veredicto actualizado (retest 2026-11-26): APROBADO CON LIMITACIONES.** El flujo UI afectado ahora pasa en navegador; quedan sin ejecutar la instalación limpia y la comprobación completa de teclado y contraste.  
**Cambios:** solo este informe. No se instalaron dependencias ni se modificaron código, plan o `docs/entorno.md`.

## Resultados por criterio

| Criterio | Estado | Comando/acción, código y resultado observado |
|---|---|---|
| Instalación reproducible | **No ejecutado** | No se instaló nada, conforme a la restricción. Se observaron `backend/.venv`, `frontend/node_modules`, `backend/requirements.txt` con versiones fijadas y `frontend/package-lock.json` (lockfile v3); README documenta `pip install -r requirements.txt` y `npm ci`. Una instalación limpia no se realizó, por lo que su reproducibilidad no queda demostrada. |
| Pruebas backend | **Aprobado** | Desde `backend`: `.\.venv\Scripts\python.exe -m unittest discover -s tests -v` — **código 0**; 7 pruebas, todas `ok` (incluye validación, filtros, errores, transacciones y reconexión SQLite). |
| Build frontend | **Aprobado** | El orquestador ejecutó `npm run build` en `frontend` tras la corrección — **código 0** (evidencia directa). No se repitió en esta ronda limitada a los criterios UI afectados. |
| Arranque local de backend y Vite | **Aprobado** | Arranque temporal en `127.0.0.1:8000` con el Python de `.venv` y en `127.0.0.1:5173` con el Vite ya instalado. Backend y documento web respondieron HTTP 200. No se expusieron a otras interfaces. |
| API: lista y filtros válidos | **Aprobado** | Con SQLite temporal y HTTP local: lista 200/3 libros; `q=Vera` 200/1; `genre=Aventura` 200/1; `age=18` 200/1; combinación `genre=Aventura&age=14` 200/1. Consultar API sin filtros, query de búsqueda, filtro de edad, género y combinación funciona cuando los parámetros son válidos y no vacíos. |
| Integración frontend → catálogo, búsqueda y filtros | **Aprobado** | Retest en Chrome headless: carga inicial con 3 libros; búsqueda `Vera` muestra 1; género `Aventura` + edad `14` muestra 1. La petición inicial llega por proxy Vite y devuelve 200/3. El plan vigente define que filtros sin valor se omiten y que parámetros ausentes no filtran; la implementación revisada construye la query de forma condicional y cumple ese contrato en el flujo observado. |
| API: ficha y errores | **Aprobado** | HTTP: detalle existente (ID 1) 200; `/api/books/999999` 404 con `Libro no encontrado.`; `age=0` 422. Query sin coincidencias 200 con lista vacía. |
| Ficha/modal desde la interfaz | **Aprobado** | Retest: se abrió la ficha de «La brújula de papel» desde una tarjeta; el diálogo recibió el detalle, estuvo abierto y se observó `aria-labelledby="dialog-title"`. Escape lo cerró y devolvió el foco al botón que lo abrió. |
| Estado de error frontend | **Aprobado** | En la verificación previa, Chrome mostró el panel controlado para HTTP 422 y la acción “Reintentar”. Ese 422 de carga inicial se resolvió en el retest; no se volvió a inducir una caída del backend para repetir el estado. |
| Estado vacío frontend | **Aprobado** | Retest: una búsqueda sin coincidencias mostró el panel vacío y su mensaje; limpiar filtros restauró las 3 tarjetas. |
| Persistencia después de reiniciar/reconectar | **Aprobado** | Con la misma SQLite temporal: se detuvo y reinició el backend; siguieron disponibles los 3 registros de demostración y el detalle con ID 1 respondió 200 vía proxy Vite. Las pruebas unitarias también verifican persistencia tras reconectar. |
| Etiquetas de controles | **Aprobado** | Chrome comprobó búsqueda, género y edad; los tres controles tienen etiqueta asociada. |
| Teclado: Tab, foco y cierre del diálogo | **Aprobado** | Retest: Tab alcanzó un botón de ficha con outline visible de 3 px; dentro del diálogo Escape lo cerró y devolvió el foco al botón de apertura. No se comprobó activación de la ficha con Enter/Espacio ni se hizo una auditoría completa de navegación. |
| Adaptación móvil del flujo principal | **Aprobado** | Chrome con catálogo visible a 375 × 812 px: 3 tarjetas, cuadrícula de 2 columnas (`165.5px` cada una), `scrollWidth=375` y sin desbordamiento horizontal. No se probó una gama completa de tamaños ni el diálogo en móvil. |
| Contraste general | **No ejecutado** | Una muestra de seis elementos en Chrome superó 4.5:1 para texto normal: título 14.47:1, introducción 6.91:1, etiqueta 8.33:1, título de estado 15.49:1, texto de estado 7.40:1 y botón 15.63:1. La muestra no acredita el criterio completo; tarjetas y ficha no se pudieron revisar. |
| Limpieza y DB predeterminada | **Aprobado** | Se eliminó el directorio SQLite/perfil temporal; `backend/data/books.sqlite3` **no existe**. Al finalizar no había listeners en 8000, 5173 ni 9222; no quedaron directorios temporales de verificación. |

## Incidencia de la primera verificación (resuelta)

La primera verificación detectó que el frontend enviaba parámetros vacíos y el flujo inicial respondía 422. El plan compartido ya establece el contrato aplicable: **omitir los filtros vacíos; parámetros ausentes no filtran**. El retest se hizo contra ese contrato y la implementación actual pasó las comprobaciones UI siguientes.

La evidencia anterior de HTTP 422 y la UI sin tarjetas corresponde al estado previo a la corrección. No se usa como resultado del retest.

## Comandos, entorno y evidencias adicionales

- Versiones comprobadas en los entornos existentes: Python `3.14.4`, FastAPI `0.139.0`, Uvicorn `0.46.0`, Node `v24.15.0`, npm `12.2.3`.
- Integración HTTP — **código 0**, 16 comprobaciones aprobadas: arranque, lista, búsqueda, género, edad, combinación, lista vacía, detalle existente/inexistente, validación 422, documento `/` 200, proxy Vite `/api`, persistencia tras reinicio, creación y limpieza de SQLite temporal, y ausencia de la DB predeterminada.
- Reproducción con `TestClient` y DB temporal del query vacío anterior — **código 0** para el comando; resultados HTTP 200/3, 422 y 200/0 respectivamente.
- Evidencia histórica anterior a la corrección: Chrome `158.0.8127.38` mostró carga UI fallida por 422. Los resultados nuevos de carga y flujo se registran en la sección de retest; las comprobaciones parciales anteriores no sustituyen esa evidencia.
- No hay script de pruebas frontend en `frontend/package.json`; están documentados `dev` y `build`. No se inventó ni se añadió infraestructura de pruebas.
- No se instalaron paquetes. Los servidores, navegador y archivos SQLite temporales iniciados para las comprobaciones fueron detenidos/eliminados; la DB predeterminada permaneció ausente.

## Retest del flujo UI — 2026-11-26

| Criterio afectado | Estado | Acción, código y resultado |
|---|---|---|
| Contrato de filtros vacíos del plan | **Aprobado** | Se leyó la sección «Contrato API propuesto»: los filtros sin valor se omiten y parámetros ausentes no aplican filtro. La petición inicial del UI cargó el catálogo por `/api/books` sin parámetros vacíos. |
| SQLite aislada | **Aprobado** | Se inició Uvicorn con `BOOKS_DB_PATH` apuntando a `%TEMP%\books-ui-retest-<GUID>\catalog.sqlite3`; antes de continuar se comprobó que ese archivo existía, que `/api/books` devolvía 200 y que `backend/data/books.sqlite3` no existía. |
| Inicio/proxy | **Aprobado** | Backend y Vite enlazados a `127.0.0.1`; listeners comprobados en loopback. `GET /` → 200; desde la página `fetch('/api/books')` → 200/3. |
| Flujo principal en Chrome headless | **Aprobado** | Chrome 158.0.8127.38, DevTools en loopback. Carga inicial 3 tarjetas; búsqueda por autor `Vera` → 1 tarjeta; género `Aventura` + edad `14` → 1 tarjeta; ficha existente abierta; Escape cierra y restituye foco; búsqueda sin coincidencias muestra vacío y “Limpiar filtros” restaura 3 tarjetas. Todas esas aserciones: **código 0**. |
| Teclado/foco | **Aprobado, alcance acotado** | Tab alcanza el botón de ficha con outline sólido de 3 px; foco inicial del modal en “Cerrar ficha”; Escape cierra y devuelve el foco. No se probó Enter/Espacio para abrir ni navegación exhaustiva. |
| Móvil | **Aprobado, viewport probado** | Emulación 375 × 812 px con catálogo visible: 2 columnas, 3 tarjetas, sin overflow horizontal. No se extrapola a otros tamaños. |
| Proceso externo de verificación | **Fallido y limpiado** | Un primer intento de retest no aisló correctamente `BOOKS_DB_PATH` y creó el archivo predeterminado (ausente antes, 16 KiB, creado durante ese intento). Se detuvieron los procesos identificados como propios y se eliminó únicamente ese archivo creado por la prueba. Un intento posterior abortó al encontrar los puertos ocupados por procesos de esa misma prueba. El retest válido posterior verificó explícitamente DB temporal y ausencia de la predeterminada. Un error del script de limpieza (`$PID` de PowerShell es de solo lectura) impidió el cierre automático; se detuvieron por PID los listeners propios de Python, Vite y Chrome y se borraron DB/perfil temporales. |

Comandos/acciones del retest válido (desde los directorios indicados; perfil y DB en `%TEMP%`):

```powershell
# Desde backend; BOOKS_DB_PATH apuntaba al archivo SQLite temporal
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Desde frontend
node .\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173 --strictPort

# Navegador instalado, headless; interacción y aserciones vía Chrome DevTools Protocol
chrome.exe --headless=new --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 --user-data-dir="<perfil temporal>" http://127.0.0.1:5173/
```

Arranque/API, documento frontend y bind loopback: **código 0**. Aserciones CDP de carga, proxy, búsqueda, filtros combinados, ficha/modal, teclado, vacío y viewport móvil: **todas código 0**; `CDP_EXIT=0`. El comando completo de orquestación tuvo un error posterior en la limpieza automática por usar el nombre reservado `$PID`; los procesos propios se detuvieron después por sus PID exactos y la comprobación final de limpieza dio **código 0**.

**Limpieza final del retest:** DB predeterminada ausente; directorio temporal borrado; puertos 8000, 5173 y 9222 sin listeners.

**Veredicto:** el fallo funcional que motivó la repetición está resuelto para el flujo comprobado. La verificación queda **aprobada con limitaciones**; no se declara completa la instalación reproducible ni la auditoría general de contraste/accesibilidad.
