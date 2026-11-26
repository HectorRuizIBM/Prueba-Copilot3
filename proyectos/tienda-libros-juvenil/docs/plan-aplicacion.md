# Plan de aplicación: tienda juvenil de libros

## Estado

**Aprobado por el usuario:** Ruta B, carpeta `proyectos/tienda-libros-juvenil/`, stack concreto y permiso para instalar las dependencias necesarias dentro de esta carpeta. No se autorizan instalaciones globales ni cambios en PATH. Público juvenil y tono visual juvenil.

**Alcance inicial acordado:** catálogo navegable, sin carrito, pagos ni checkout. Implementación y flujo integrado verificados; quedan limitaciones de verificación documentadas en `docs/verificacion.md`.

## Objetivo y experiencia

Crear una web adaptable para explorar un catálogo de libros dirigido a público juvenil, con presentación clara y expresiva, sin infantilizar ni sacrificar legibilidad.

Flujos iniciales:

- Explorar libros en una cuadrícula adaptable.
- Buscar por título o autor.
- Filtrar por género y edad recomendada.
- Abrir una ficha con título, autor, género, edad recomendada y descripción breve.
- Mostrar estados vacíos, carga, error y resultados.

No incluye autenticación, gestión de pedidos, carrito, pagos ni administración de inventario en esta primera versión.

## Stack aprobado

- Frontend: React `19.3.1` + TypeScript `7.0.2`, Vite `8.3.8` y `@vitejs/plugin-react` `6.3.0`.
- Herramientas frontend detectadas: Node.js `24.15.0` y npm `12.2.3`.
- Backend: Python `3.14.4`, FastAPI `0.139.0` y Uvicorn `0.46.0`, en un entorno virtual local del proyecto.
- Persistencia: SQLite del módulo estándar de Python.
- Las dependencias están instaladas en `frontend/node_modules` y `backend/.venv`; no se instalaron paquetes globales ni se cambió PATH.
- Versiones del registro npm consultadas el 26 de noviembre de 2026. Node 24 satisface el requisito publicado por Vite 8 (`^20.19.0 || >=22.12.0`).

## Datos y contenido propuestos

Base local en `backend/data/books.sqlite3`. Modelo propuesto:

| Campo | Descripción |
|---|---|
| `id` | Identificador único |
| `title` | Título del libro |
| `author` | Autoría |
| `genre` | Género para filtros |
| `recommended_age_min` | Edad mínima recomendada |
| `recommended_age_max` | Edad máxima recomendada |
| `description` | Texto breve de presentación |
| `cover_color` | Color de cubierta de muestra; no depende de imágenes externas |

El catálogo real no se ha proporcionado. El prototipo usará entradas ficticias y descripciones originales, claramente marcadas como demostración, sin reproducir textos ni usar imágenes de cubiertas de terceros. Se omiten precios hasta que se faciliten catálogo y moneda reales.

## Contrato API propuesto

- `GET /api/books`: lista libros; los parámetros opcionales `q`, `genre` y `age` buscan en título/autor, comparan el género y filtran por intervalo recomendado, respectivamente.
- Los filtros sin valor se omiten de la petición; parámetros ausentes no aplican filtro.
- `GET /api/books/{id}`: devuelve la ficha; ID inexistente produce `404`.
- Las respuestas de lista y detalle comparten los campos `id`, `title`, `author`, `genre`, `recommended_age_min`, `recommended_age_max`, `description` y `cover_color`.
- La lista devuelve un array JSON de fichas; el detalle devuelve una ficha JSON.
- La interfaz envía `age` como entero positivo; parámetros inválidos producen `422`.
- La interfaz consume únicamente este contrato y no accede directamente a SQLite.
- Validar y parametrizar consultas; no registrar datos sensibles.
- El frontend de desarrollo se limita a loopback y accede al backend mediante `/api` con proxy de Vite. El backend también escucha solo en loopback.

## Diseño juvenil propuesto

- Composición dinámica con tarjetas de libros como contenido principal.
- Acentos expresivos limitados, superficies claras, tipografía legible y jerarquía clara.
- Cubiertas tipográficas de muestra sin recursos externos no autorizados.
- Microinteracciones discretas y opcionales; sin movimiento que impida navegar.
- Teclado, foco visible, etiquetas accesibles, adaptación móvil y contraste WCAG AA.

## Operación, datos y permisos

- Entorno de desarrollo local; no configurar despliegue público sin decisión posterior.
- No crear autenticación, pagos ni llamadas a servicios externos en la primera versión.
- El archivo de SQLite quedará dentro de la carpeta del proyecto y se excluirá del control de versiones.
- La investigación de entorno documentará herramientas y versiones observadas en `docs/entorno.md`.
- La aprobación de instalaciones se limita a dependencias necesarias dentro del proyecto. No cambiar PATH, permisos ni instalar herramientas globalmente.

## Aceptación propuesta

- Buscar y filtrar por los campos acordados; la combinación de filtros funciona.
- La ficha de un libro existente se muestra y un ID inexistente genera un error controlado.
- La interfaz es usable en móvil y teclado; errores y lista vacía tienen mensajes claros.
- El backend prueba consultas válidas e inválidas y usa datos de prueba aislados.
- Frontend y backend integran el contrato sin acceso directo del navegador a la base de datos.
- La ejecución, dependencias, limitaciones y resultados se documentan.

## Responsabilidades

- Orquestador: mantener el contrato compartido, integrar y documentar la ejecución local.
- Investigador de entorno: mantener `docs/entorno.md` con detecciones y evidencias de preparación, sin instalaciones globales.
- Frontend: implementar la UI dentro del alcance asignado y aplicar la skill `diseno-juvenil`.
- Backend: implementar API, modelo SQLite y pruebas bajo el contrato aprobado.
- Verificador: informar resultados en `docs/verificacion.md`; no declarar aprobadas pruebas no ejecutadas.
