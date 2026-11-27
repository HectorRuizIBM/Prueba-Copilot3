const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test, expect } = require("@playwright/test");

const pageUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

test("muestra la posición inicial con filas y archivos orientados correctamente", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(pageUrl);

  const board = page.locator("#chessboard");
  await expect(board.locator(":scope > [role='row']")).toHaveCount(8);
  const firstRank = board.locator(":scope > [role='row']").first();
  await expect(firstRank.locator("[role='cell']")).toHaveCount(8);

  const grid = await board.evaluate((element) => {
    const boardStyle = getComputedStyle(element);
    const rowStyle = getComputedStyle(element.firstElementChild);
    return {
      boardRows: boardStyle.gridTemplateRows.trim().split(/\s+/).length,
      boardColumns: boardStyle.gridTemplateColumns.trim().split(/\s+/).length,
      rankColumns: rowStyle.gridTemplateColumns.trim().split(/\s+/).length,
    };
  });
  expect(grid).toEqual({ boardRows: 8, boardColumns: 1, rankColumns: 8 });

  const corners = {};
  for (const square of ["a8", "h8", "a1", "h1"]) {
    corners[square] = await page.getByRole("cell", { name: new RegExp("^" + square + ",") }).boundingBox();
    expect(corners[square]).not.toBeNull();
  }
  expect(corners.a8.x).toBeLessThan(corners.h8.x);
  expect(corners.a8.y).toBeLessThan(corners.a1.y);
  expect(Math.abs(corners.a8.y - corners.h8.y)).toBeLessThan(1);
  expect(Math.abs(corners.a1.y - corners.h1.y)).toBeLessThan(1);

  for (const [square, piece] of [
    ["a8, torre negras", "♜"], ["h8, torre negras", "♜"],
    ["a7, peón negras", "♟"], ["h7, peón negras", "♟"],
    ["a1, torre blancas", "♖"], ["h1, torre blancas", "♖"],
    ["a2, peón blancas", "♙"], ["h2, peón blancas", "♙"],
  ]) {
    await expect(page.getByRole("cell", { name: square, exact: true })).toHaveText(piece);
  }
  await expect(page.getByRole("cell", { name: "a8, torre negras", exact: true })).toHaveClass(/square-light/);
  await expect(page.getByRole("cell", { name: "h1, torre blancas", exact: true })).toHaveClass(/square-light/);
});

test("aplica las coordenadas de la partida en filas y columnas correctas", async ({ page }) => {
  await page.goto(pageUrl);
  await page.getByRole("button", { name: "Siguiente jugada", exact: true }).click();

  await expect(page.getByRole("cell", { name: "e4, peón blancas", exact: true })).toHaveText("♙");
  await expect(page.getByRole("cell", { name: "e2, casilla vacía", exact: true })).toBeVisible();
});
