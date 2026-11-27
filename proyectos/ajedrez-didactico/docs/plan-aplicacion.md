# Ajedrez didáctico

## Objetivo y público

Web estática en español para enseñar las reglas esenciales del ajedrez a personas principiantes. Destaca la tradición valenciana vinculada a la aparición de la Dama moderna y permite reproducir la partida histórica documentada en *Scachs d'amor*.

## Decisiones aprobadas

- Ruta: `proyectos/ajedrez-didactico/`.
- Stack: HTML5, CSS3 y JavaScript vanilla; sin backend, dependencias, instalación ni servicios externos.
- Estilo: profesional, sobrio, accesible y adaptable a móvil.
- Puede abrirse directamente desde `index.html`; interactividad y recursos locales sin red.
- No guardar datos personales ni persistencia.
- La afirmación histórica se redactará de forma precisa y atribuida, evitando presentar como certeza aspectos discutidos.

## Contenido y experiencia

- Navegación por introducción, reglas, piezas y partida histórica.
- Explicación del objetivo, jaque y mate, turnos, movimientos de las seis piezas y reglas especiales.
- Tablero reproducible de *Scachs d'amor*, con controles para avanzar, retroceder y recorrer las jugadas, además de notación y contexto histórico. La partida y las atribuciones se basarán en una fuente verificada antes de cerrar la implementación.
- Diseño responsive, navegación por teclado, foco visible, etiquetas accesibles y respeto por `prefers-reduced-motion`.

## Contrato de datos e interacción

Aplicación local sin API ni almacenamiento. El tablero recibe una posición inicial y una secuencia ordenada de jugadas en notación algebraica o coordenadas documentadas en el código; solo acepta y presenta movimientos de la partida verificada. Los controles actualizan tablero, turno, jugada y texto explicativo de forma sincronizada. No se simula un motor de ajedrez.

## Propiedad de archivos

- Frontend: `index.html`, `styles.css`, `app.js`, y `README.md`.
- Orquestador: `game-data.js`, que conserva la transcripción contrastada de la partida y su fuente.
- Orquestación: `docs/plan-aplicacion.md`, `docs/entorno.md`, `docs/verificacion.md`.
- Ningún agente modifica archivos fuera de esta raíz.

## Criterios de aceptación

1. La página explica reglas básicas y movimientos de todas las piezas correctamente.
2. Expone la conexión valenciana de la Dama moderna con atribución y matices históricos.
3. La partida se presenta con secuencia de jugadas acreditada y el tablero puede recorrerse en ambas direcciones sin perder sincronización.
4. Se entiende en móvil y escritorio; funciona por teclado y muestra foco.
5. Se puede abrir sin backend ni conexiones externas.
6. No hay errores de JavaScript en las comprobaciones realizadas.
7. El informe de verificación distingue pruebas ejecutadas y pendientes.
