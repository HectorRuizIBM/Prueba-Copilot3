"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { advance, countLiving, nextGeneration } = require("../life.js");

function board(rows) {
  return Uint8Array.from(rows.flatMap((row) => [...row].map((cell) => Number(cell))));
}

function printable(cells, rows, columns) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from(cells.slice(row * columns, (row + 1) * columns)).join(""),
  ).join("\n");
}

test("mantiene estable un bloque de cuatro células", () => {
  const initial = board(["0000", "0110", "0110", "0000"]);
  const next = nextGeneration(initial, 4, 4);
  assert.equal(printable(next, 4, 4), "0000\n0110\n0110\n0000");
});

test("transforma un parpadeador horizontal en vertical", () => {
  const initial = board(["00000", "00000", "01110", "00000", "00000"]);
  const next = nextGeneration(initial, 5, 5);
  assert.equal(printable(next, 5, 5), "00000\n00100\n00100\n00100\n00000");
});

test("una célula muerta nace con exactamente tres vecinas", () => {
  const next = nextGeneration(board(["010", "001", "010"]), 3, 3);
  assert.equal(next[4], 1);
});

test("una célula viva con dos vecinas sobrevive", () => {
  const next = nextGeneration(board(["000", "011", "010"]), 3, 3);
  assert.equal(next[4], 1);
});

test("una célula viva con menos de dos vecinas muere", () => {
  const next = nextGeneration(board(["000", "011", "000"]), 3, 3);
  assert.equal(next[4], 0);
});

test("una célula viva con más de tres vecinas muere", () => {
  const next = nextGeneration(board(["010", "111", "010"]), 3, 3);
  assert.equal(next[4], 0);
});

test("trata las células fuera del tablero como muertas, sin envolver los bordes", () => {
  const initial = board(["101", "000", "001"]);
  const next = nextGeneration(initial, 3, 3);
  assert.equal(next[1], 0);
});

test("rechaza un tablero de entrada con dimensiones incoherentes", () => {
  assert.throws(() => nextGeneration(new Uint8Array(3), 2, 2), TypeError);
});

test("al extinguirse la última célula se detiene y no avanza más generaciones", () => {
  const lastCell = board(["00000", "00000", "00100", "00000", "00000"]);
  const extinction = advance(lastCell, 5, 5);

  assert.equal(extinction.advanced, true);
  assert.equal(extinction.extinct, true);
  assert.equal(countLiving(extinction.cells), 0);

  const afterExtinction = advance(extinction.cells, 5, 5);
  assert.equal(afterExtinction.advanced, false);
  assert.equal(afterExtinction.extinct, true);
  assert.equal(countLiving(afterExtinction.cells), 0);
});
