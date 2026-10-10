/* Run in CI with Playwright installed. Exercises real pages plus isolated regression cases. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' };
const fixture = `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Term hint regression</title><style>body{font:18px/1.8 system-ui;padding:20px;max-width:750px}button{padding:20px;display:block;font-size:30px;min-height:70px}dialog{background:white}</style><body><header><h1>用語のヒントの確認</h1></header><main><p id="prose">CT比とCT比。定格負担と負担。エンタルピー。</p><div id="card"><p>励磁と消磁。</p></div><section><p id="dynamic"></p></section><form id="form"><p>保護協調の説明。</p><button id="original" type="button">CT比を計算</button><label id="label">定格電流<input value="5"></label></form><a id="link" href="#">CT比の教材</a><code id="code">const CT = 5</code><math id="math"><mi>CT</mi></math><svg id="svg"><text>CT比</text></svg><section id="repeat-section"><h2>同じ節</h2><p id="first-mention">CT比と励磁。</p><p id="later-mention">CT比と励磁。</p><h3>次の節</h3><p id="next-section">CT比と励磁。</p></section><article id="separate-card"><p>CT比と励磁。</p></article></main><dialog id="parent-dialog"><p>エンタルピーを考える。</p><button id="parent-close" onclick="document.getElementById('parent-dialog').close()">問題を閉じる</button></dialog><script>window.cardClicks=0;window.submits=0;document.getElementById('card').onclick=()=>window.cardClicks++;document.getElementById('form').onsubmit=e=>{e.preventDefault();window.submits++};</script><script src="/term-help.js?v=test" defer></script></body></html>`;
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/term-fixture.html') { res.writeHead(200, {'Content-Type':types['.html']}).end(fixture); return; }
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}).end(data); });
});
(async () => {
  fs.mkdirSync(output, { recursive:true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport:{width:1280,height:900} });
  page.setDefaultTimeout(12000);
  // Deterministic tests without analytics or other third-party traffic.
  await page.route('**/*', route => route.request().url().startsWith(origin) || route.request().url().startsWith('data:') ? route.continue() : route.abort());
  await page.addInitScript(() => { localStorage.setItem('ukiwa-theme-mode','manual'); localStorage.setItem('ukiwa-theme','light'); });
  const errors = [];
  page.on('pageerror', error => errors.push(error.stack || error.message));
  const dialog = page.locator('#ut-dialog');
  const goto = async file => {
    await page.goto(origin + '/' + file, {waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.UkiwaTermHelp?.ready);
    const consent = page.getByRole('button', {name:'許可しない',exact:true});
    if (await consent.isVisible()) await consent.click();
  };
  const close = async () => { await page.getByRole('button',{name:'用語の解説を閉じる',exact:true}).click(); assert.equal(await dialog.isVisible(),false); };
  try {
    await goto('ct-calculator.html');
    await page.screenshot({path:path.join(output,'term-reading-light.png'),animations:'disabled'});
    await page.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
    await page.screenshot({path:path.join(output,'term-reading-dark.png'),animations:'disabled'});
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
    const ratio = page.locator('#result .ut-term[data-ut-id="ct-ratio"]').first();
    await ratio.click();
    assert.match(await dialog.innerText(), /一次30Aで二次2A/);
    assert.equal(await dialog.evaluate(node => getComputedStyle(node).opacity), '1', 'explanation is readable immediately');
    await page.screenshot({path:path.join(output,'term-desktop.png'),animations:'disabled'});
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await ratio.evaluate(node => node === document.activeElement),true);
    await page.getByRole('button',{name:'CT比の候補を計算する →',exact:true}).click();
    assert.match(await page.locator('#result').innerText(), /75\s*\/\s*5/);
    await page.locator('#s').fill('200');
    await page.getByRole('button',{name:'CT比の候補を計算する →',exact:true}).click();
    assert.match(await page.locator('#result').innerText(), /100\s*\/\s*5/);
    await page.waitForFunction(() => document.querySelector('#result .ut-term[data-ut-id="rating"]'));
    console.log('PASS CT calculations, dynamic result hints, Escape and focus restoration');

    await page.locator('.ut-entry').click();
    await page.locator('#ut-search').fill('エンタルピー');
    await page.locator('.ut-list button').first().click();
    assert.match(await dialog.innerText(), /内部エネルギー/);
    assert.equal(await dialog.locator('a[href*="energy-"]').count(),0,'public hints must not expose private study routes');
    await close();
    await page.locator('.ut-entry').click();
    await page.getByLabel('本文に用語のヒントを表示').uncheck();
    await close();
    assert.equal(await page.locator('.ut-term:not(:disabled)').count(),0);
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(() => window.UkiwaTermHelp?.ready);
    assert.equal(await page.locator('.ut-term:not(:disabled)').count(),0);
    await page.locator('.ut-entry').click(); await page.getByLabel('本文に用語のヒントを表示').check(); await close();
    console.log('PASS search, private-route boundary and persistent hint preference');

    await goto('term-fixture.html');
    assert.equal(await page.locator('#prose').textContent(),'CT比とCT比。定格負担と負担。エンタルピー。');
    assert.equal(await page.locator('#prose .ut-term[data-ut-id="ct-ratio"]').count(),1);
    for (const id of ['original','label','link','code','math','svg']) assert.equal(await page.locator(`#${id} .ut-term`).count(),0,id);
    await page.evaluate(() => { document.getElementById('dynamic').textContent='リアクタンスと零相電流。'; });
    await page.waitForFunction(() => document.querySelector('#dynamic .ut-term[data-ut-id="reactance"]'));
    await page.evaluate(() => { document.getElementById('dynamic').textContent='エンタルピーとエントロピー。'; });
    await page.waitForFunction(() => document.querySelectorAll('#dynamic .ut-term').length === 2);
    assert.equal(await page.locator('#dynamic').textContent(),'エンタルピーとエントロピー。');
    await page.locator('#form .ut-term').click(); assert.equal(await page.evaluate(() => window.submits),0); await close();
    console.log('PASS original text, duplicate suppression, control/math isolation and repeated dynamic updates');

    assert.equal(await page.locator('#first-mention .ut-term').count(),2);
    assert.equal(await page.locator('#later-mention .ut-term').count(),0,'repeat paragraphs stay plain');
    assert.equal(await page.locator('#next-section .ut-term').count(),2,'a subheading starts a new reading section');
    assert.equal(await page.locator('#separate-card .ut-term').count(),2,'a separate card keeps its own hints');
    await page.evaluate(() => {
      const first=document.getElementById('first-mention');
      const earlier=document.createElement('p'); earlier.id='earlier-mention'; earlier.textContent='CT比。';
      first.before(earlier);
    });
    await page.waitForFunction(() => document.querySelector('#earlier-mention .ut-term') && document.querySelectorAll('#first-mention .ut-term').length === 1);
    await page.evaluate(() => document.getElementById('earlier-mention').remove());
    await page.waitForFunction(() => document.querySelectorAll('#first-mention .ut-term').length === 2);
    await page.evaluate(() => { document.getElementById('first-mention').textContent='説明を更新しました。'; });
    await page.waitForFunction(() => document.querySelectorAll('#later-mention .ut-term').length === 2);
    assert.equal(await page.locator('#later-mention').textContent(),'CT比と励磁。');
    console.log('PASS one hint per reading section, insertion, removal and changed first occurrence');


    await page.evaluate(() => document.getElementById('parent-dialog').showModal());
    await page.locator('#parent-dialog .ut-term').click();
    assert.equal(await dialog.isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await page.locator('#parent-dialog').isVisible(),true);
    await page.locator('#parent-close').click();
    for (const width of [390,320,768]) {
      await page.setViewportSize({width,height:844});
      await page.locator('#prose .ut-term').first().click();
      const box = await dialog.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width && box.y >= 0 && box.y + box.height <= 844, `dialog overflow at ${width}`);
      if (width <= 600) assert.ok(box.y > 250, 'phone card is placed near the bottom');
      await page.screenshot({path:path.join(output,`term-width-${width}.png`),animations:'disabled'});
      await page.mouse.click(2,2); assert.equal(await dialog.isVisible(),false);
    }
    await page.setViewportSize({width:1280,height:900});
    console.log('PASS nested exercise dialog, outside dismissal and 320/390/768px layout');

    await goto('energy-kamoku2.html');
    await page.locator('#blanks button').first().click();
    await page.getByRole('button',{name:'わからない → 解説を見る',exact:true}).click();
    await page.waitForFunction(() => document.querySelector('#dinner .ut-term'));
    await page.locator('#dinner .ut-term').first().click();
    assert.equal(await dialog.isVisible(),true);
    await page.keyboard.press('Escape'); assert.equal(await page.locator('#dlg').isVisible(),true);
    assert.ok(await page.locator('#dinner').innerText());
    await page.setViewportSize({width:390,height:844});
    await page.locator('#dinner .ut-term').first().click();
    await page.screenshot({path:path.join(output,'term-energy-mobile.png'),animations:'disabled'});
    await close();
    console.log('PASS actual energy-exam explanation dialog and mobile hints');

    await goto('ct-calculator.html');
    await page.screenshot({path:path.join(output,'term-reading-mobile.png'),animations:'disabled'});
    await page.locator('#result .ut-term[data-ut-id="ct-ratio"]').click();
    await page.screenshot({path:path.join(output,'term-mobile.png'),animations:'disabled'}); await close();
    await page.setViewportSize({width:1280,height:900});
    const smoke = ['index.html','protective-relay.html','motor-starting-insulation.html','sequence-basics.html','pas-vt-withstand-simulator.html','ac-withstand-test-simulator.html','earth-resistance-et5.html','generator-rescue-island.html','denken-foundations.html','energy-formulas.html','energy-kamoku4.html','denken-study.html','science-calendar.html','circuit-duel/'];
    for (const file of smoke) {
      // Some readers are served under one shared filename with a course query.
      if (file === 'energy-kamoku4.html' && !fs.existsSync(path.join(root,file))) continue;
      await goto(file);
      assert.equal(await page.locator('.ut-entry').count(),1,file);
      assert.equal(await page.locator('#ut-dialog').count(),1,file);
      assert.equal(await page.locator('button button.ut-term,a button.ut-term,svg .ut-term,math .ut-term').count(),0,file);
    }
    assert.deepEqual(errors.filter(error => /term-help(?:\.js|\.css|\-data)/.test(error)),[]);
    console.log(`PASS ${smoke.length} representative live-page templates; no glossary JavaScript errors`);
  } catch (error) {
    await page.screenshot({path:path.join(output,'term-failure.png'),fullPage:true}).catch(()=>{});
    console.error('PAGE ERRORS',errors);
    throw error;
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode=1; });
