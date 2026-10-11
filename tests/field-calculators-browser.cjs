/* Focused regressions for input-first OCR, K2OC test ranges and portable records. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const { pickupRange } = require('../relay-test-calc.js');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'test-results');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => err ? res.writeHead(404).end() : res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}).end(data));
});
(async () => {
  for (const [tap, low, high] of [[3,2.7,3.3],[3.5,3.15,3.85],[4,3.6,4.4],[4.5,4.05,4.95],[5,4.5,5.5],[6,5.4,6.6]]) {
    for (const model of ['K2OC-AVN','K2OC-ACN']) assert.deepEqual(pickupRange(model,String(tap)), {tap,low,high,unit:'CT二次A'});
  }
  for (const invalid of ['',0,-3,2.9,3.1,6.1,Infinity,'unknown']) assert.equal(pickupRange('K2OC-AVN',invalid),null);
  assert.equal(pickupRange('MOC-A3V-R',3),null);
  console.log('PASS manufacturer test-range examples, limits and unsupported inputs');
  fs.mkdirSync(out,{recursive:true});
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ ...(process.env.FIELD_BROWSER_PATH ? {executablePath:process.env.FIELD_BROWSER_PATH,args:['--no-sandbox','--disable-dev-shm-usage']} : {}) });
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>route.request().url().startsWith(origin)||route.request().url().startsWith('data:')?route.continue():route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('ukiwa-theme-mode','manual'); localStorage.setItem('ukiwa-theme','light');
    window.copiedRecord = '';
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedRecord=value;}}});
  });
  const goto = async file => {
    await page.goto(origin+'/'+file,{waitUntil:'domcontentloaded'});
    const consent=page.getByRole('button',{name:'許可しない',exact:true});
    if(await consent.isVisible())await consent.click();
    assert.deepEqual(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);}),[],'unique page IDs');
  };
  const copy = async id => {await page.locator(id).click();return page.evaluate(()=>window.copiedRecord);};
  const noOverflow = async () => assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1), 'no horizontal page overflow');
  try {
    await goto('ct-calculator.html');
    assert.equal(await page.locator('#ctCopy').isDisabled(),true);
    await page.locator('.calculate').click();
    assert.match(await page.locator('#result').innerText(),/75\s*\/\s*5/);
    let record=await copy('#ctCopy');
    assert.match(record,/最小候補：75 \/ 5 A/); assert.match(record,/受電一次電流：R 40\.087\.*/);
    assert.match(record,/最大二次電流：2\.672/); assert.match(record,/Y-0550U/);assert.match(record,/未判定：二次負担/);
    await page.locator('#s').fill('200');
    assert.equal(await page.locator('#ctCopy').isDisabled(),true);
    await page.locator('.calculate').click();
    assert.match(await copy('#ctCopy'),/最小候補：100 \/ 5 A/);
    await page.locator('#condition-title').click();
    await page.locator('#sec').selectOption('1');await page.locator('.calculate').click();
    assert.match(await copy('#ctCopy'),/候補は保留：登録品は5A二次/);
    await page.locator('#source').selectOption('custom');await page.locator('#series').fill('75,100,150');await page.locator('#ref').fill('検証用の利用者資料');
    await page.locator('.calculate').click();assert.match(await copy('#ctCopy'),/最小候補：100 \/ 1 A/);
    await page.locator('#s').fill('0');await page.locator('#t').fill('0');await page.locator('.calculate').click();
    assert.equal(await page.locator('#ctCopy').isDisabled(),true);assert.match(await page.locator('#error').innerText(),/0より大きい/);
    await page.locator('#s').fill('100000');await page.locator('.calculate').click();assert.match(await copy('#ctCopy'),/候補なし/);
    await page.locator('.reset').click();await page.waitForFunction(()=>document.getElementById('ctCopy').disabled);
    await page.locator('.calculate').click();
    await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('clipboard unavailable');}});
    await page.locator('#ctCopy').click();assert.equal(await page.locator('#ctRecordFallback').isVisible(),true);
    assert.match(await page.locator('#ctRecordFallback').inputValue(),/最小候補：75 \/ 5 A/);
    await page.locator('#s').fill('200');assert.equal(await page.locator('#ctRecordFallback').isVisible(),false);
    console.log('PASS CT snapshot, stale/zero/unsupported conditions, custom 1A, range exhaustion and copy fallback');

    await goto('ocr-tap-calculator.html');
    assert.equal(await page.locator('#ctP').inputValue(),'');assert.equal(await page.locator('#knownLoad').isVisible(),true);
    assert.equal(await page.locator('#ocr-learning').getAttribute('open'),null);
    assert.ok(await page.locator('#commonPanel').evaluate(e=>e.compareDocumentPosition(document.querySelector('#ocr-learning')) & Node.DOCUMENT_POSITION_FOLLOWING));
    record=await copy('#copyRecord');assert.match(record,/実CT定格：未入力 \/ 5 A/);assert.match(record,/ダイヤル：判定不可/);
    await page.locator('#ctP').fill('50');await page.locator('#knownLoad').fill('20');
    assert.match(await page.locator('#tapSecA').innerText(),/2(?:\.0+)? A/);assert.equal(await page.locator('#selectedTap').inputValue(),'3');
    record=await copy('#copyRecord');assert.match(record,/限時の選択値：3 A（二次）／一次換算 30(?:\.0+)? A/);
    assert.match(record,/既知の最大負荷：20 A（CT一次側）/);assert.match(record,/CSM_K2OC_DS_J_2_4/);assert.doesNotMatch(record,/undefined|NaN/);
    await page.locator('#tapOrigin').selectOption('existing');await page.locator('#knownLoad').fill('25');
    record=await copy('#copyRecord');assert.match(record,/条件変更後の再確認が必要/);assert.match(record,/既設の承認済み値（利用者入力）/);
    await page.locator('#ctS').selectOption('1');assert.match(await page.locator('#dialOut').innerText(),/判定不可/);
    assert.match(await copy('#copyRecord'),/CT二次定格とK2OC入力の組合せを確認/);
    await page.locator('a[href="#ocr-learning"]').first().click();assert.notEqual(await page.locator('#ocr-learning').getAttribute('open'),null);
    console.log('PASS OCR blank start, direct inputs, primary/secondary record and changed-condition warning');

    await goto('ocr-tap-calculator.html?demo=1');
    assert.equal(await page.locator('#demoBanner').isVisible(),true);
    assert.match(await page.locator('#tapPri').innerText(),/19\.4\d* A/);
    assert.equal(await page.locator('#selectedTap').inputValue(),'3');
    record=await copy('#copyRecord');assert.match(record,/学習用の仮入力を含みます/);assert.match(record,/下位：90 A／0?\.5 s/);
    const downloaded=page.waitForEvent('download');await page.locator('#exportButton').click();
    const data=JSON.parse(fs.readFileSync(await (await downloaded).path(),'utf8'));assert.equal(data.version,'7.2');assert.match(data.record,/実CT定格：50 \/ 5 A/);
    await page.locator('#recordPanel details summary').click();
    await page.emulateMedia({media:'print'});assert.equal(await page.locator('#recordText').isVisible(),true);await page.emulateMedia({media:'screen'});
    console.log('PASS OCR explicit demo, downloadable provenance and printable record');

    await goto('relay-test-reference.html?model=K2OC-AVN');
    assert.equal(await page.locator('#k2ocTap').inputValue(),'');
    await page.locator('#k2ocTap').selectOption('3');assert.match(await page.locator('#k2ocRange').innerText(),/2.70 ～ 3.30 A/);
    await page.locator('#k2ocTap').selectOption('6');assert.match(await page.locator('#k2ocRange').innerText(),/5.40 ～ 6.60 A/);
    await page.locator('#model').selectOption('K2OC-ACN');assert.equal(await page.locator('#k2ocTap').inputValue(),'');
    await page.locator('#model').selectOption('MOC-A3V-R');assert.equal(await page.locator('#k2ocTap').count(),0);
    console.log('PASS K2OC model-scoped UI, updated limits and reset on model change');

    for(const file of ['ct-calculator.html','ocr-tap-calculator.html','relay-test-reference.html?model=K2OC-AVN']) {
      await goto(file);
      for(const width of [320,390,768]) {await page.setViewportSize({width,height:844});await noOverflow();}
      await page.setViewportSize({width:390,height:844});
      if(file.startsWith('ocr-')) await page.locator('a[href="#commonPanel"]').first().click();
      await page.screenshot({path:path.join(out,'field-'+file.split('.')[0]+'-mobile.png'),animations:'disabled'});
    }
    assert.deepEqual(errors,[],'no browser exceptions');
    console.log('PASS 320/390/768px pages without overflow; no browser exceptions');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
