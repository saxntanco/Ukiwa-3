/* Run with Playwright installed: node tests/single-line-browser.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => { if (error) { res.writeHead(404).end(); return; } res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(data); });
});

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/single-line-lab.html`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { localStorage.setItem('ukiwa-theme-mode', 'manual'); localStorage.setItem('ukiwa-theme', 'light'); });
  const value = id => page.locator('#' + id).textContent();
  const expectText = async (id, text) => assert.equal(await value(id), text, id);
  const preset = name => page.locator(`[data-preset="${name}"]`).click();
  try {
    await page.goto(url);
    // Exercise the existing consent banner without enabling analytics in a test browser.
    await page.getByRole('button', { name: '許可しない', exact: true }).click();
    await expectText('high-current', '8.75 A');
    await expectText('low-current', '274.9 A');
    await expectText('ct-current', '2.187 A');
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });
    console.log('PASS initial readings and desktop screenshot');
    await preset('capacity');
    await expectText('high-current', '8.75 A'); await expectText('low-current', '274.9 A');
    await expectText('ct-current', '2.187 A'); await expectText('loading', '33.3%');
    await preset('reset'); await preset('pf');
    await expectText('high-current', '13.12 A'); await expectText('low-current', '412.4 A');
    await expectText('ct-current', '3.280 A'); await expectText('loading', '100.0%');
    assert.equal(await page.locator('#transformer-warning').isVisible(), false);
    console.log('PASS capacity invariance and power-factor change');
    await preset('reset');
    await page.getByText('設備の条件を変える', { exact: true }).click();
    await page.locator('#lowVoltage').selectOption('420');
    await expectText('low-current', '137.5 A'); await expectText('high-current', '8.75 A');
    await page.locator('#ctPrimary').selectOption('40');
    await expectText('ct-current', '1.093 A'); await expectText('low-current', '137.5 A');
    await preset('reset');
    await page.locator('#kw-range').press('ArrowRight'); await expectText('high-current', '8.84 A');
    await page.locator('#kw').fill('300'); await page.locator('#pf').fill('0.5');
    assert.equal(await page.locator('#transformer-warning').isVisible(), true);
    assert.equal(await page.locator('#ct-warning').isVisible(), true);
    await expectText('loading', '400.0%');
    console.log('PASS voltage, CT ratio, slider and over-rating warnings');
    await page.locator('#pf').fill('');
    for (const id of ['high-current', 'low-current', 'ct-current']) await expectText(id, '— A');
    assert.equal(await page.locator('#input-error').isVisible(), true);
    assert.equal(await page.locator('#diagram').getAttribute('class').then(x => x.includes('no-flow')), true);
    await page.locator('#pf').fill('0'); await expectText('high-current', '— A');
    await page.locator('#pf').fill('1'); await page.locator('#kw').fill('-1'); await expectText('low-current', '— A');
    await preset('reset'); await preset('zero');
    await expectText('high-current', '0.00 A'); await expectText('low-voltage-label', '線間電圧 210 V');
    assert.equal(await page.locator('#zero-note').isVisible(), true);
    await preset('reset');
    console.log('PASS invalid-input clearing, zero load and reset');
    await page.getByRole('button', { name: 'CTの役割を読む', exact: true }).press('Enter');
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    assert.match(await page.locator('#device-detail').textContent(), /一次通電中にCT二次回路を開放してはいけません/);
    await page.keyboard.press('Escape'); assert.equal(await page.getByRole('dialog').isVisible(), false);
    await page.locator('#flow-toggle').click();
    assert.equal(await page.locator('#flow-toggle').getAttribute('aria-pressed'), 'true');
    await page.locator('#sceneSelect').selectOption('dark');
    await page.screenshot({ path: path.join(output, 'dark.png'), fullPage: true });
    await page.locator('#sceneSelect').selectOption('light');
    await page.getByText('設備の条件を変える', { exact: true }).click();
    console.log('PASS keyboard dialog, Escape, pause and theme switch');
    for (const width of [768, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate(() => scrollTo(0, 0));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `horizontal overflow at ${width}px`);
      await page.screenshot({ path: path.join(output, `width-${width}.png`), fullPage: true });
    }
    await page.locator('#kw').fill('120'); await expectText('high-current', '11.66 A');
    await page.getByRole('button', { name: '変圧器の役割を読む', exact: true }).click();
    assert.equal(await page.getByRole('dialog').isVisible(), true);
    await page.screenshot({ path: path.join(output, 'mobile-dialog.png') });
    await page.getByRole('button', { name: '説明を閉じる' }).click();
    console.log('PASS tablet, 390px and 320px mobile layout and interaction');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.lab-flow').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await page.locator('#flow-toggle').getAttribute('aria-pressed'), 'true');
    await page.getByText('なぜこの電流になる？ 計算式を見る', { exact: true }).click();
    assert.match(await value('formula-high'), /11\.66 A/);
    assert.deepEqual(errors, []);
    console.log('PASS reduced motion, formula updates and no JavaScript errors');
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true });
    throw error;
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
