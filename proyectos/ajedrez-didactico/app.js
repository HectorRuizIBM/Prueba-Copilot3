"use strict";

(function () {
  const files = "abcdefgh";
  const initialPosition = [
    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "........",
    "........",
    "PPPPPPPP",
    "RNBQKBNR",
  ].map(function (row) { return row.split(""); });
  const pieceNames = {
    k: "rey", q: "dama", r: "torre", b: "alfil", n: "caballo", p: "peón",
  };
  const glyphs = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };
  const board = document.getElementById("chessboard");
  const moveCount = document.getElementById("move-count");
  const moveNotation = document.getElementById("move-notation");
  const turnLabel = document.getElementById("turn-label");
  const gameStatus = document.getElementById("game-status");
  const gameError = document.getElementById("game-error");
  const progress = document.getElementById("game-progress");
  const progressFill = document.getElementById("progress-fill");
  const notationList = document.getElementById("notation-list");
  const startButton = document.getElementById("start-button");
  const previousButton = document.getElementById("previous-button");
  const playButton = document.getElementById("play-button");
  const playIcon = document.getElementById("play-icon");
  const playLabel = document.getElementById("play-label");
  const nextButton = document.getElementById("next-button");
  let plies = [];
  let positions = [];
  let currentPly = 0;
  let timer = null;
  let squareElements = [];
  let notationButtons = [];

  function clonePosition(position) {
    return position.map(function (row) { return row.slice(); });
  }

  function coordinateToIndex(coordinate) {
    return { row: 8 - Number(coordinate[1]), column: files.indexOf(coordinate[0]) };
  }

  function readGameData() {
    const data = window.HISTORICAL_GAME;
    if (!data || !Array.isArray(data.plies)) {
      throw new Error("No se encontró la secuencia local de la partida (game-data.js).");
    }
    if (data.plies.some(function (ply) {
      return !Array.isArray(ply) || typeof ply[0] !== "string" ||
        typeof ply[1] !== "string" || !/^[a-h][1-8][a-h][1-8]$/.test(ply[1]);
    })) {
      throw new Error("La secuencia local contiene una jugada con formato no válido.");
    }
    plies = data.plies;
    positions = [clonePosition(initialPosition)];
    let position = clonePosition(initialPosition);
    plies.forEach(function (ply, index) {
      const from = coordinateToIndex(ply[1].slice(0, 2));
      const to = coordinateToIndex(ply[1].slice(2, 4));
      const movingPiece = position[from.row][from.column];
      if (movingPiece === "." || movingPiece === undefined) {
        throw new Error("No hay una pieza en el origen de la jugada " + (index + 1) + ".");
      }
      position[from.row][from.column] = ".";
      position[to.row][to.column] = movingPiece;
      positions.push(clonePosition(position));
    });
  }

  function makeBoard() {
    board.replaceChildren();
    squareElements = [];
    for (let row = 0; row < 8; row += 1) {
      const rowElement = document.createElement("div");
      rowElement.setAttribute("role", "row");
      for (let column = 0; column < 8; column += 1) {
        const square = document.createElement("div");
        square.setAttribute("role", "cell");
        square.className = "square " + ((row + column) % 2 === 0 ? "square-light" : "square-dark");
        square.dataset.row = String(row);
        square.dataset.column = String(column);
        rowElement.appendChild(square);
        squareElements.push(square);
      }
      board.appendChild(rowElement);
    }
  }

  function makeNotation() {
    notationList.replaceChildren();
    notationButtons = [];
    for (let index = 0; index < plies.length; index += 2) {
      const row = document.createElement("tr");
      const numberCell = document.createElement("th");
      numberCell.scope = "row";
      numberCell.textContent = String(Math.floor(index / 2) + 1) + ".";
      row.appendChild(numberCell);
      for (let offset = 0; offset < 2; offset += 1) {
        const plyIndex = index + offset;
        const cell = document.createElement("td");
        if (plies[plyIndex]) {
          const button = document.createElement("button");
          const side = plyIndex % 2 === 0 ? "blancas" : "negras";
          button.type = "button";
          button.className = "notation-button";
          button.textContent = plies[plyIndex][0];
          button.setAttribute("aria-label", "Ir a jugada " + (Math.floor(plyIndex / 2) + 1) + ", " + side + ": " + plies[plyIndex][0]);
          button.addEventListener("click", function () {
            stopPlayback();
            setPosition(plyIndex + 1, true);
          });
          notationButtons[plyIndex] = button;
          cell.appendChild(button);
        } else {
          cell.textContent = "—";
        }
        row.appendChild(cell);
      }
      notationList.appendChild(row);
    }
  }

  function describeSquare(piece, row, column) {
    const coordinate = files[column] + (8 - row);
    if (piece === ".") return coordinate + ", casilla vacía";
    const side = piece === piece.toUpperCase() ? "blancas" : "negras";
    return coordinate + ", " + pieceNames[piece.toLowerCase()] + " " + side;
  }

  function renderBoard() {
    const position = positions[currentPly];
    squareElements.forEach(function (square) {
      const row = Number(square.dataset.row);
      const column = Number(square.dataset.column);
      const piece = position[row][column];
      square.replaceChildren();
      square.classList.remove("square-piece-white", "square-piece-black", "last-move-from", "last-move-to");
      square.setAttribute("aria-label", describeSquare(piece, row, column));
      if (piece !== ".") {
        square.textContent = glyphs[piece];
        square.classList.add(piece === piece.toUpperCase() ? "square-piece-white" : "square-piece-black");
      }
    });
    if (currentPly > 0) {
      const move = plies[currentPly - 1][1];
      const from = coordinateToIndex(move.slice(0, 2));
      const to = coordinateToIndex(move.slice(2, 4));
      squareElements[from.row * 8 + from.column].classList.add("last-move-from");
      squareElements[to.row * 8 + to.column].classList.add("last-move-to");
    }
    const sideToMove = currentPly % 2 === 0 ? "blancas" : "negras";
    board.setAttribute("aria-label", "Tablero de ajedrez, " +
      (currentPly === 0 ? "posición inicial" : "después de " + currentPly + " " + (currentPly === 1 ? "jugada" : "jugadas")) +
      ". Juegan " + sideToMove + ".");
  }

  function updateControls() {
    const atEnd = currentPly >= plies.length;
    startButton.disabled = currentPly === 0;
    previousButton.disabled = currentPly === 0;
    nextButton.disabled = atEnd;
    playButton.disabled = atEnd || plies.length === 0;
    playIcon.textContent = timer === null ? "▶" : "Ⅱ";
    playLabel.textContent = timer === null ? "Reproducir" : "Pausar";
    playButton.setAttribute("aria-label", timer === null ? "Reproducir partida" : "Pausar reproducción");
  }

  function updateNotation() {
    notationButtons.forEach(function (button) { button.removeAttribute("aria-current"); });
    if (currentPly === 0) {
      moveCount.textContent = "Inicio";
      moveNotation.textContent = "Posición inicial";
      turnLabel.textContent = "Juegan las blancas";
      return;
    }
    const move = plies[currentPly - 1];
    const side = (currentPly - 1) % 2 === 0 ? "blancas" : "negras";
    const number = Math.floor((currentPly - 1) / 2) + 1;
    moveCount.textContent = number + (side === "blancas" ? " · blancas" : " · negras");
    moveNotation.textContent = number + (side === "blancas" ? "." : "…") + move[0];
    if (currentPly < plies.length) {
      turnLabel.textContent = "Juegan " + (currentPly % 2 === 0 ? "blancas" : "negras");
    } else {
      turnLabel.textContent = "Mate · resultado 1-0";
    }
    const activeButton = notationButtons[currentPly - 1];
    if (activeButton) activeButton.setAttribute("aria-current", "step");
  }

  function updateProgress() {
    progress.setAttribute("aria-valuemax", String(plies.length));
    progress.setAttribute("aria-valuenow", String(currentPly));
    progressFill.style.width = (plies.length === 0 ? 0 : (currentPly / plies.length) * 100) + "%";
  }

  function setPosition(plyIndex, announce) {
    currentPly = Math.max(0, Math.min(plies.length, plyIndex));
    renderBoard();
    updateNotation();
    updateControls();
    updateProgress();
    if (currentPly === plies.length && plies.length > 0) {
      gameStatus.textContent = "Jaque mate en " + plies[plies.length - 1][0] + ". Ganan las blancas, 1-0.";
    } else if (announce) {
      gameStatus.textContent = currentPly === 0
        ? "Posición inicial. Juegan las blancas."
        : "Jugada " + Math.floor((currentPly - 1) / 2 + 1) + (currentPly % 2 === 1 ? ", blancas: " : ", negras: ") + plies[currentPly - 1][0] + ".";
    }
  }

  function stopPlayback() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
    updateControls();
  }

  function playNext() {
    if (currentPly >= plies.length) {
      stopPlayback();
      return;
    }
    setPosition(currentPly + 1, false);
    if (currentPly >= plies.length) stopPlayback();
  }

  function togglePlayback() {
    if (timer !== null) {
      stopPlayback();
      gameStatus.textContent = "Reproducción pausada en la jugada " + currentPly + ".";
      return;
    }
    if (currentPly >= plies.length || plies.length === 0) return;
    timer = window.setInterval(playNext, 1300);
    updateControls();
    gameStatus.textContent = "Reproduciendo la partida.";
  }

  function showError(error) {
    stopPlayback();
    gameStatus.textContent = "";
    gameError.hidden = false;
    gameError.textContent = "No se pudo preparar la partida: " + error.message + " Comprueba que game-data.js está junto a index.html.";
    [startButton, previousButton, playButton, nextButton].forEach(function (button) { button.disabled = true; });
    moveCount.textContent = "Error";
    moveNotation.textContent = "Partida no disponible";
    turnLabel.textContent = "Los controles están desactivados";
  }

  function initialize() {
    try {
      readGameData();
      makeBoard();
      makeNotation();
      setPosition(0, false);
      if (plies.length === 0) {
        gameStatus.textContent = "No hay jugadas disponibles en el registro.";
        moveNotation.textContent = "Sin movimientos";
        turnLabel.textContent = "Posición inicial";
      } else {
        gameStatus.textContent = "Partida lista. " + plies.length + " medias jugadas disponibles.";
      }
      startButton.addEventListener("click", function () {
        stopPlayback();
        setPosition(0, true);
      });
      previousButton.addEventListener("click", function () {
        stopPlayback();
        setPosition(currentPly - 1, true);
      });
      nextButton.addEventListener("click", function () {
        stopPlayback();
        setPosition(currentPly + 1, true);
      });
      playButton.addEventListener("click", togglePlayback);
      document.addEventListener("keydown", function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("button, a, input, textarea, select, [contenteditable='true']")) return;
        if (event.key === "ArrowRight" && currentPly < plies.length) {
          event.preventDefault();
          stopPlayback();
          setPosition(currentPly + 1, true);
        } else if (event.key === "ArrowLeft" && currentPly > 0) {
          event.preventDefault();
          stopPlayback();
          setPosition(currentPly - 1, true);
        }
      });
    } catch (error) {
      showError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  initialize();
}());
