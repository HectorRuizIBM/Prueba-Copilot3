// @ts-check
import { test, expect } from '@playwright/test';

const HOME = 'https://www.viewnext.com/';

/** @param {import('@playwright/test').Page} page */
async function openHome(page) {
  const response = await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  expect(response, 'La página debe responder').not.toBeNull();
  expect(response.status(), 'La página debe devolver HTTP 200').toBe(200);
  await expect(page).toHaveTitle(/viewnext/i);
}

/** @param {import('@playwright/test').Page} page */
async function dismissCookies(page) {
  const reject = page.getByRole('button', {
    name: /rechazar|reject|solo necesarias/i,
  }).first();
  if (await reject.isVisible()) await reject.click();
}

/** @param {import('@playwright/test').Page} page */
function contactLink(page) {
  return page.getByRole('link', { name: /^contacto$/i }).filter({ visible: true }).first();
}

 test('inicio: respuesta, título, encabezados y enlaces', async ({ page }) => {
  await openHome(page);
  await expect(page.getByRole('heading').filter({ visible: true }).first()).toBeVisible();
  await expect(contactLink(page)).toBeVisible();
  await expect(contactLink(page)).toHaveAttribute('href', /contact/i);

  // Comprueba destinos de enlaces visibles sin rastrear toda la web pública.
  const links = page.getByRole('link').filter({ visible: true });
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    expect.soft(href, `Destino del enlace: ${await link.innerText()}`).toBeTruthy();
    if (href) {
      expect.soft(href).not.toMatch(/^javascript:/i);
      expect.soft(new URL(href, page.url()).protocol).toMatch(/^(https?:|mailto:|tel:)$/);
    }
  }
});

test('contacto: navegación y botón de envío', async ({ page }) => {
  await openHome(page);
  await dismissCookies(page);
  await contactLink(page).click();
  await expect(page).toHaveURL(/contact/i);
  await expect(page.getByRole('heading', { name: /Contacta con Viewnext/i })).toBeVisible();

  const send = page.getByRole('button', { name: /enviar/i });
  await expect(send).toBeVisible();
  await expect(send).toBeEnabled();
  await expect(send).toHaveAccessibleName(/enviar/i);
  // No se pulsa Enviar: evitamos generar contactos reales en producción.
  const form = page.locator('form').filter({ has: send });
  await expect(form).toHaveCount(1);
  expect(await form.locator('input:not([type="hidden"]), textarea, select').count()).toBeGreaterThan(0);
});

test('contacto: respuesta HTTP del destino del enlace', async ({ page, request }) => {
  await openHome(page);
  const href = await contactLink(page).getAttribute('href');
  expect(href).toBeTruthy();
  const url = new URL(href || '', page.url());
  expect(url.hostname).toBe(new URL(HOME).hostname);
  const response = await request.get(url.href);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/text\/html/i);
});

test('móvil: contenido y ausencia de desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await expect(page.getByRole('heading').filter({ visible: true }).first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
