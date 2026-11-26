# Informe de entorno — tienda-libros-juvenil

**Actualizado:** 2026-11-26  
**Proyecto:** `C:\Repositorios\Prueba Copilot3\proyectos\tienda-libros-juvenil`  
**Alcance:** estado de runtimes y dependencias tras la aprobación e implementación local. Se inspeccionaron solo manifiestos/lockfiles de frontend y backend y este informe; no se leyeron secretos ni código.

## Decisiones aprobadas

El usuario aprobó Ruta B y el stack concreto: frontend React + TypeScript + Vite, backend Python + FastAPI, persistencia SQLite y npm para frontend. También comunicó aprobación explícita para las instalaciones locales descritas abajo. El alcance sigue siendo catálogo juvenil local, sin carrito/checkout, autenticación, pagos, servicios externos ni despliegue público.

## Manifiestos y versiones fijadas observados

### Frontend

`frontend/package.json` declara versiones exactas; `frontend/package-lock.json` existe, usa `lockfileVersion: 3` y repite esas versiones en el paquete raíz.

| Paquete | Versión fijada |
|---|---:|
| `react` | `19.3.1` |
| `react-dom` | `19.3.1` |
| `@types/react` | `19.3.3` |
| `@types/react-dom` | `19.3.0` |
| `@vitejs/plugin-react` | `6.3.0` |
| `typescript` | `7.0.2` |
| `vite` | `8.3.8` |

### Backend

`backend/requirements.txt` fija:

```text
annotated-doc==0.0.7
annotated-types==0.8.0
anyio==4.16.0
click==8.5.1
fastapi==0.139.0
h11==0.16.0
httpcore2==2.16.2
httpx2==2.16.2
idna==3.20
pydantic==2.14.4
pydantic_core==2.50.5
starlette==1.10.0
truststore==0.10.5
typing-inspection==0.4.5
typing_extensions==4.16.0
uvicorn==0.46.0
```

En la lista visible de `backend` no aparece un lockfile Python adicional. La venv comunicada es `backend/.venv`, dentro de la raíz del proyecto.

## Runtimes y contexto de la comprobación previa

La última detección directa de herramientas (antes de esta actualización) dio Windows `10.0.26200`, PowerShell `5.1.26100.9711`, Node `24.15.0`, npm `12.2.3`, Python `3.14.4`, pip `26.2.1` y módulo estándar SQLite `3.50.4`. El alias `python3` de WindowsApps falló entonces; `python` y `py` resolvieron Python 3.14.4. Estos valores se conservan como evidencia de la comprobación anterior, no se volvieron a ejecutar en esta actualización.

También se había observado FastAPI `0.139.0`, Uvicorn `0.46.0` y Pydantic `2.13.4` en el entorno de usuario global. Esto no sustituye las versiones fijadas en `backend/requirements.txt`: en particular, esa lista fija Pydantic `2.14.4`. La instalación reportada se hizo en `backend/.venv`.

## Instalación y pruebas de implementación

La instalación de npm y `npm ls` fueron reportados por el especialista frontend; la instalación backend, los tests y `pip check`, por el especialista backend. El build final posterior al fix lo ejecutó el orquestador y terminó con código `0`. Estos resultados no se reejecutaron en esta actualización:

| Comprobación | Resultado comunicado |
|---|---|
| `npm install --no-audit --no-fund` | Código `0`. |
| `npm ls --depth=0` | Código `0`. |
| Build final del frontend | Código `0`. |
| Instalación backend desde `requirements.txt` en `backend/.venv` | Código `0`. |
| Pruebas backend | `7 tests OK`. |
| `pip check` | Código `0`. |

Según lo comunicado, las instalaciones fueron locales: no hubo instalaciones globales ni cambios de PATH. El investigador no instaló paquetes ni cambió PATH; esta actualización tampoco ejecutó instalaciones, gestores, servidores ni pruebas.

## Verificación independiente

`docs/verificacion.md` declara **APROBADO CON LIMITACIONES** (2026-11-26). La verificación integrada independiente ya terminó; por tanto, la nota anterior de este informe que la marcaba como pendiente está obsoleta.

- **Flujo UI integrado en Chrome: aprobado en lo comprobado.** Carga inicial, búsqueda por autor, combinación de género + edad, apertura de ficha/modal, estado vacío y limpieza de filtros pasaron. Escape cierra la ficha y devuelve el foco al botón que la abrió.
- **API y persistencia: aprobadas en las comprobaciones registradas.** Pasaron lista, búsqueda/filtros, detalle y errores esperados; la persistencia se confirmó tras reiniciar/reconectar con base SQLite temporal.
- **Móvil: aprobado para el viewport probado de 375 × 812.** Se observaron tres tarjetas, dos columnas y ausencia de desbordamiento horizontal. No se generaliza a otros tamaños ni al modal móvil.
- **Loopback y limpieza:** backend y Vite se usaron en `127.0.0.1`; el verificador empleó una base SQLite temporal y un perfil temporal. Los procesos y temporales se limpiaron al finalizar.
- **Incidencia de DB durante un primer intento:** una configuración de variable de DB fallida creó inicialmente la base predeterminada `backend/data/books.sqlite3`; se eliminó. El retest válido posterior verificó la DB temporal y confirmó que la predeterminada no existía. No queda reportado como residuo.

## Límites aún pendientes

- No se ejecutó una instalación limpia; la reproducibilidad desde cero no queda demostrada.
- No se hizo una auditoría completa de teclado ni de contraste. Hay comprobaciones puntuales: Tab/foco visible, cierre Escape y restitución del foco; una muestra de seis elementos superó 4.5:1. No se verificó navegación exhaustiva con teclado ni el contraste completo (incluidas tarjetas y ficha).
- La comprobación de teclado no incluyó apertura con Enter/Espacio; tampoco se cubrieron todos los tamaños de pantalla.
- Conviene ejecutar las herramientas Python mediante `backend/.venv` para validar contra las versiones fijadas y no confundirlas con paquetes disponibles globalmente.
- El investigador no consultó secretos, no instaló paquetes y no modificó PATH. La verificación utilizó servicios locales en loopback; no se afirma estado de conectividad externa.

## Archivos inspeccionados y permitidos

Se leyeron `frontend/package.json`, el inicio de `frontend/package-lock.json` (paquete raíz y lockfile v3), `backend/requirements.txt` y los listados de nombres de `frontend`/`backend`. No se inspeccionó código ni contenido de secretos. **Único archivo actualizado:** `proyectos/tienda-libros-juvenil/docs/entorno.md`.
