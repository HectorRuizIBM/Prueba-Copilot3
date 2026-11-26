---
name: pruebas-web-playwright
description: Normas básicas para diseñar, construir y ejecutar pruebas fiables y no destructivas con Playwright Test.
---
# Pruebas web con Playwright

## Preparación y alcance
- En el flujo orquestador → verificador → playwright, verifica la aplicación recién creada en `proyectos/<slug>/`. Lee `docs/plan-aplicacion.md`, inspecciona sus rutas y funcionalidades y usa la URL local efectiva facilitada por el verificador tras arrancar los servicios. No uses Viewnext ni otras webs externas como sustituto.
- Cubre el flujo principal completo y los estados vacío, error y validación según aceptación. Las operaciones que modifican datos solo se prueban con permisos y datos temporales en un entorno controlado; nunca sobre la base de datos real del usuario. Si no puede aislarse el entorno, informa la limitación.

- Inspecciona manifiesto, configuración, suite y criterios existentes. Confirma URL, entorno y rutas autorizadas. Reutiliza el runner y el sistema de módulos del proyecto.
- No instales dependencias ni navegadores sin aprobación. Para aplicaciones nuevas, mantén pruebas y artefactos dentro de `proyectos/<slug>/`. La suite externa de la raíz solo se modifica por encargo explícito.
- Define una matriz criterio → página/acción → resultado esperado → prueba. Inspecciona el contenido real; no supongas que todas las portadas tienen h1 ni que todas las cabeceras HTTP son obligatorias.

## Normas de construcción
- Usa `test` y `expect` de `@playwright/test`, nombres descriptivos en español y pruebas independientes con fixtures `page`/`request`; no compartas estado entre tests.
- Prioriza `getByRole`, `getByLabel` y nombres accesibles. Usa `getByTestId` si existe un contrato. Evita selectores CSS frágiles y `.first()` para ocultar ambigüedades; acota por región o justifica el elemento elegido.
- Espera las acciones y aserciones de Playwright (`await expect`). No uses pausas fijas ni `networkidle` como requisito universal. Espera el estado observable esperado.
- Usa helpers para preparación repetida sin ocultar expectativas. Configura timeouts y reintentos acotados; no aumentes ambos para disimular fallos.
- Cada test debe tener aserciones de comportamiento, no solo navegación o clics. Reserva `expect.soft` para auditorías con defectos independientes.

## Controles mínimos según aceptación
1. **Páginas:** respuesta de navegación no nula, estado HTTP esperado, URL, título y encabezados/contenido relevantes visibles. Distingue encabezados HTML de cabeceras HTTP.
2. **Enlaces:** nombre accesible y destino válido según función (`https`, `http`, `mailto`, `tel` o ancla). Comprueba navegación en destinos internos representativos y limita el rastreo. Un control de diálogo expuesto como enlace sin href se informa como hallazgo de semántica; no se excluye silenciosamente para obtener verde.
3. **Botones:** rol, nombre, visibilidad y estado habilitado/deshabilitado esperado. Para acciones seguras, comprueba el efecto (diálogo, menú, cambio de estado), no solo el clic.
4. **Formularios:** etiquetas, campos y estados de validación. Prueba envío/success solo en entorno controlado con datos temporales y permiso. En producción no pulses Enviar ni generes contactos reales.
5. **Móvil y teclado:** viewport representativo, desbordamiento, navegación/menú, foco y uso por teclado en controles relevantes. No declares accesibilidad completa con estos controles; axe requiere aprobación si no está instalado.
6. **Red y consola:** recoge fallos antes de navegar, registra URL/status o error y distingue terceros de recursos propios. No ignores errores sin razón documentada. Las cabeceras de seguridad se evalúan según HTTPS, entorno y política acordada, no con reglas universales.

## Ejecución y evidencias
- Primero valida descubrimiento con el runner local y `--list`; después ejecuta la suite específica en un navegador instalado, con concurrencia baja en sitios públicos. Usa comandos compatibles con el shell confirmado y evita descargas implícitas si falta el runner.
- No simules las respuestas del sitio en una prueba que pretende demostrar su funcionamiento real. Si una prueba aislada usa mocks, identifícala como tal.
- Registra comando, fecha, navegador, código de salida, aprobadas/fallidas/no ejecutadas y rutas reales a capturas, trazas o informe. No inventes artefactos ni guardes datos personales o secretos.
- Ante fallo, analiza si la causa es expectativa incorrecta, defecto web o entorno; corrige el test solo con evidencia. No elimines aserciones ni marques skip para ocultar un defecto. Tras dos intentos fallidos, devuelve el bloqueo al verificador.
- La salida incluye cobertura y limitaciones: una prueba de href no demuestra navegación; una prueba de botón habilitado no demuestra envío; una revisión estática no demuestra ejecución en navegador.
