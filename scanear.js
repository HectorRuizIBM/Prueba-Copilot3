const { chromium } = require('playwright');

(async () => {
  // 1. Iniciar el navegador (headless: true lo ejecuta en segundo plano)
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 2. Ir a la dirección concreta
  const url = 'http://127.0.0.1:5173'; // <-- Cambia esto por tu URL
  await page.goto(url, { waitUntil: 'networkidle' });

  // 3. Extraer información (ejemplo: el título y todos los enlaces)
  const titulo = await page.title();
  const textosH1 = await page.locator('h1').allTextContents();

  console.log('Título de la página:', titulo);
  console.log('Encabezados H1:', textosH1);

  // 4. Cerrar el navegador
  await browser.close();
})();
