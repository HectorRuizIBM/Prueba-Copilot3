(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.ConwayLife = api;
  }
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  "use strict";

  function nextGeneration(current, rows, columns) {
    if (!(current instanceof Uint8Array) || current.length !== rows * columns) {
      throw new TypeError("El tablero debe ser un Uint8Array del tamaño indicado.");
    }

    const next = new Uint8Array(current.length);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        let neighbors = 0;
        for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
          for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
            if (rowOffset === 0 && columnOffset === 0) continue;

            const neighborRow = row + rowOffset;
            const neighborColumn = column + columnOffset;
            if (
              neighborRow >= 0 &&
              neighborRow < rows &&
              neighborColumn >= 0 &&
              neighborColumn < columns
            ) {
              neighbors += current[neighborRow * columns + neighborColumn];
            }
          }
        }

        const index = row * columns + column;
        next[index] = neighbors === 3 || (current[index] === 1 && neighbors === 2) ? 1 : 0;
      }
    }
    return next;
  }

  function countLiving(cells) {
    let living = 0;
    for (const cell of cells) living += cell;
    return living;
  }

  function advance(current, rows, columns) {
    if (countLiving(current) === 0) {
      return { cells: current, advanced: false, extinct: true };
    }

    const cells = nextGeneration(current, rows, columns);
    return {
      cells,
      advanced: true,
      extinct: countLiving(cells) === 0,
    };
  }

  return { advance, countLiving, nextGeneration };
});
