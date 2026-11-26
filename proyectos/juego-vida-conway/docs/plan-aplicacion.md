# Plan de aplicación: Juego de la Vida de Conway

## Estado

Petición recibida: crear una web sobre el Juego de la Vida con las reglas de Conway.

La ruta del proyecto es `proyectos/juego-vida-conway/`; se comprobó que la carpeta no existía. El usuario aprobó la propuesta del plan y precisó que el tablero debe ser redimensionable y comenzar en 100 × 100 células. La implementación está hecha; evidencias y límites constan en `docs/verificacion.md`.

## Objetivo y alcance propuesto

Una aplicación web interactiva para explorar el autómata celular de Conway en una cuadrícula. La simulación se ejecutará en el navegador; no se prevén cuentas, datos personales, persistencia, backend ni servicios externos.

Funciones iniciales propuestas:

- Cuadrícula editable con interacción accesible para activar/desactivar células.
- Controles de iniciar/pausar, avanzar una generación, limpiar y generar una configuración aleatoria.
- Ajuste de velocidad y contador de generaciones.
- Explicación visible de las reglas: célula viva sobrevive con 2 o 3 vecinas vivas; célula muerta nace con exactamente 3; en los demás casos muere o permanece muerta.
- Diseño adaptable, estados y controles utilizables con teclado, y respeto por `prefers-reduced-motion`.

El tablero inicia vacío y permite cambiar por separado filas y columnas; ambos valores iniciales son 100. Las dimensiones estarán limitadas para mantener un rendimiento razonable. No se cargan patrones externos.

## Stack aprobado

Ruta B: web estática con HTML, CSS y JavaScript nativos, sin backend, gestor de paquetes ni dependencias de ejecución. El usuario indicó que el plan era correcto; no se requieren instalaciones. La simulación y el estado del tablero viven en el navegador; se puede abrir como `index.html` o servir localmente solo en loopback.

Funciones aprobadas: edición de células, iniciar/pausar, avanzar una generación, limpiar, generación aleatoria, selector de velocidad, contador de generaciones y explicación visible de las reglas. Estilo claro y neutral con acento de color; adaptable y accesible.

## Documentación y responsables

- Orquestador: mantener este plan y verificar el comportamiento de la simulación.
- Investigador de entorno: escribir únicamente `docs/entorno.md`; detección no destructiva, sin instalaciones.
- Implementación: solo frontend estático dentro de la raíz del proyecto; no hay backend.
- Verificador: registrar pruebas ejecutadas y límites en `docs/verificacion.md`.

## Criterios de aceptación

- Las transiciones de la cuadrícula siguen las reglas de Conway para supervivencia, nacimiento y muerte por soledad/superpoblación.
- El usuario puede editar el tablero y controlar la simulación sin recargar la página.
- La explicación de reglas y el contador corresponden al estado visible.
- El diseño funciona en tamaños de pantalla habituales y permite operar los controles con teclado; la generación automática respeta movimiento reducido.
- La ejecución y las verificaciones realizadas se documentan; no se afirma una verificación visual o de runtime si no se ejecutó.
