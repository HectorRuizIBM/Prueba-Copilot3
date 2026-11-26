(function () {
  "use strict";

  const MIN_DIMENSION = 5;
  const MAX_DIMENSION = 200;
  const boardElement = document.querySelector("#game-board");
  const rowsInput = document.querySelector("#rows-input");
  const columnsInput = document.querySelector("#columns-input");
  const generationOutput = document.querySelector("#generation-count");
  const dimensionsOutput = document.querySelector("#board-dimensions");
  const announcements = document.querySelector("#announcements");
  const runButton = document.querySelector("#toggle-run");
  const runLabel = document.querySelector("#run-label");
  const stepButton = document.querySelector("#step-once");
  const randomButton = document.querySelector("#randomize");
  const clearButton = document.querySelector("#clear-board");
  const speedInput = document.querySelector("#speed-input");
  const speedOutput = document.querySelector("#speed-value");

  let rows = 100;
  let columns = 100;
  let cells = new Uint8Array(rows * columns);
  let generation = 0;
  let activeIndex = 0;
  let timer = null;
  let cellElements = [];

  function cellLabel(index) {
    const row = Math.floor(index / columns) + 1;
    const column = (index % columns) + 1;
    const state = cells[index] ? "viva" : "muerta";
    return `Fila ${row}, columna ${column}, ${state}`;
  }

  function updateCell(index) {
    const cell = cellElements[index];
    if (!cell) return;
    const alive = cells[index] === 1;
    cell.setAttribute("aria-selected", String(alive));
    cell.setAttribute("aria-label", cellLabel(index));
  }

  function setCell(index, alive) {
    const value = alive ? 1 : 0;
    if (cells[index] === value) return;
    cells[index] = value;
    updateCell(index);
  }

  function updateReadouts() {
    generationOutput.value = String(generation).padStart(4, "0");
    dimensionsOutput.textContent = `${rows} filas × ${columns} columnas`;
    boardElement.setAttribute(
      "aria-label",
      `Tablero del Juego de la Vida, ${rows} filas por ${columns} columnas`,
    );
    boardElement.setAttribute("aria-rowcount", String(rows));
    boardElement.setAttribute("aria-colcount", String(columns));
  }

  function renderBoard() {
    const fragment = document.createDocumentFragment();
    cellElements = new Array(rows * columns);
    boardElement.style.setProperty("--rows", String(rows));
    boardElement.style.setProperty("--columns", String(columns));

    for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
      const row = document.createElement("div");
      row.className = "game-row";
      row.setAttribute("role", "row");
      row.setAttribute("aria-rowindex", String(rowIndex + 1));

      for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
        const index = rowIndex * columns + columnIndex;
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.type = "button";
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-rowindex", String(rowIndex + 1));
        cell.setAttribute("aria-colindex", String(columnIndex + 1));
        cell.setAttribute("aria-selected", String(cells[index] === 1));
        cell.setAttribute("aria-label", cellLabel(index));
        cell.tabIndex = index === activeIndex ? 0 : -1;
        cell.dataset.index = String(index);
        cellElements[index] = cell;
        row.append(cell);
      }
      fragment.append(row);
    }

    boardElement.replaceChildren(fragment);
    updateReadouts();
  }

  function paintGeneration(next) {
    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index] !== next[index]) {
        cells[index] = next[index];
        updateCell(index);
      }
    }
    generation += 1;
    generationOutput.value = String(generation).padStart(4, "0");
  }

  function step() {
    const result = window.ConwayLife.advance(cells, rows, columns);
    if (!result.advanced) {
      stop();
      announcements.textContent = "No quedan células vivas. Activa alguna célula para continuar.";
      return false;
    }

    paintGeneration(result.cells);
    if (result.extinct) {
      stop();
      announcements.textContent = `La simulación se detuvo en la generación ${generation}: no quedan células vivas.`;
      return false;
    }
    return true;
  }

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    runButton.setAttribute("aria-pressed", "false");
    runLabel.textContent = "Iniciar";
  }

  function start() {
    if (timer !== null) return;
    if (window.ConwayLife.countLiving(cells) === 0) {
      stop();
      announcements.textContent = "No hay células vivas. Activa alguna célula para iniciar la simulación.";
      return;
    }
    runButton.setAttribute("aria-pressed", "true");
    runLabel.textContent = "Pausar";
    const interval = 1000 / Number(speedInput.value);
    timer = window.setInterval(step, interval);
    announcements.textContent = "Simulación iniciada.";
  }

  function updateSpeed() {
    speedOutput.value = `${speedInput.value} gen/s`;
    speedOutput.textContent = `${speedInput.value} gen/s`;
    if (timer !== null) {
      stop();
      start();
    }
  }

  function resetBoard(nextRows, nextColumns) {
    stop();
    const previousCells = cells;
    const previousRows = rows;
    const previousColumns = columns;
    rows = nextRows;
    columns = nextColumns;
    cells = new Uint8Array(rows * columns);
    const copiedRows = Math.min(previousRows, rows);
    const copiedColumns = Math.min(previousColumns, columns);
    for (let row = 0; row < copiedRows; row += 1) {
      for (let column = 0; column < copiedColumns; column += 1) {
        cells[row * columns + column] = previousCells[row * previousColumns + column];
      }
    }
    generation = 0;
    activeIndex = Math.min(activeIndex, cells.length - 1);
    renderBoard();
    announcements.textContent = `Tablero vacío de ${rows} filas por ${columns} columnas.`;
    cellElements[0]?.focus();
  }

  document.querySelector("#size-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nextRows = Number(rowsInput.value);
    const nextColumns = Number(columnsInput.value);
    const valid =
      Number.isInteger(nextRows) &&
      Number.isInteger(nextColumns) &&
      nextRows >= MIN_DIMENSION &&
      nextRows <= MAX_DIMENSION &&
      nextColumns >= MIN_DIMENSION &&
      nextColumns <= MAX_DIMENSION;

    if (!valid) {
      announcements.textContent = `Elige entre ${MIN_DIMENSION} y ${MAX_DIMENSION} filas y columnas.`;
      (nextRows < MIN_DIMENSION || nextRows > MAX_DIMENSION ? rowsInput : columnsInput).focus();
      return;
    }

    rowsInput.value = String(nextRows);
    columnsInput.value = String(nextColumns);
    resetBoard(nextRows, nextColumns);
  });

  runButton.addEventListener("click", () => {
    if (timer === null) start();
    else {
      stop();
      announcements.textContent = "Simulación pausada.";
    }
  });

  stepButton.addEventListener("click", () => {
    stop();
    if (step()) announcements.textContent = `Generación ${generation}.`;
  });

  randomButton.addEventListener("click", () => {
    stop();
    cells = new Uint8Array(cells.length);
    for (let index = 0; index < cells.length; index += 1) {
      cells[index] = Math.random() < 0.28 ? 1 : 0;
      updateCell(index);
    }
    generation = 0;
    generationOutput.value = "0000";
    announcements.textContent = "Se ha generado un patrón aleatorio.";
  });

  clearButton.addEventListener("click", () => {
    stop();
    cells.fill(0);
    for (let index = 0; index < cellElements.length; index += 1) updateCell(index);
    generation = 0;
    generationOutput.value = "0000";
    announcements.textContent = "Tablero limpiado.";
  });

  speedInput.addEventListener("input", updateSpeed);

  boardElement.addEventListener("focusin", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    activeIndex = Number(cell.dataset.index);
    for (let index = 0; index < cellElements.length; index += 1) {
      cellElements[index].tabIndex = index === activeIndex ? 0 : -1;
    }
  });

  boardElement.addEventListener("click", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    activeIndex = index;
    setCell(index, !cells[index]);
  });

  boardElement.addEventListener("keydown", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;
    let nextIndex = Number(cell.dataset.index);

    switch (event.key) {
      case "ArrowUp":
        nextIndex = Math.max(0, nextIndex - columns);
        break;
      case "ArrowDown":
        nextIndex = Math.min(cells.length - 1, nextIndex + columns);
        break;
      case "ArrowLeft":
        nextIndex = Math.max(0, nextIndex - 1);
        break;
      case "ArrowRight":
        nextIndex = Math.min(cells.length - 1, nextIndex + 1);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = cells.length - 1;
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        setCell(nextIndex, !cells[nextIndex]);
        return;
      default:
        return;
    }

    event.preventDefault();
    cellElements[nextIndex]?.focus();
  });

  updateSpeed();
  renderBoard();
})();
