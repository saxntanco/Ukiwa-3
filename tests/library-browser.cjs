const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server = http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)) return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>err?res.writeHead(404).end():res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data));
});
(async()=>{
  const out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch(process.env.LIBRARY_BROWSER_PATH?{executablePath:process.env.LIBRARY_BROWSER_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:{});
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopied=text;}}}));
  const goto=async suffix=>{await page.goto(origin+'/library.html'+(suffix||''));await page.waitForFunction(()=>!!window.UkiwaLibrary);};
  const count=async n=>assert.equal(await page.locator('.person-row').count(),n);
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
  const shot=async name=>page.screenshot({path:path.join(out,'library-'+name+'.png'),animations:'disabled'});
  try {
    await goto();await count(84);await noOverflow();await shot('desktop');
    await page.locator('#people-search').fill('かんと');assert.ok(await page.locator('.person-row').count()<84);
    await page.locator('.person-link[href="#kant"]').click();assert.match(await page.locator('#person-title').innerText(),/カント/);
    assert.equal(await page.locator('#reader-view').isVisible(),true);
    assert.equal(await page.locator('#browse-view').isVisible(),false);
    assert.equal(await page.locator('#sources a').count()>0,true);
    await page.locator('[data-save]').click();
    await page.locator('[data-font]').click();assert.equal(await page.locator('.reader-body').evaluate(e=>getComputedStyle(e).fontSize),'21px');
    await page.locator('[data-share]').click();assert.equal(await page.evaluate(()=>window.testCopied),origin+'/library.html#kant');
    await page.reload();assert.equal(await page.locator('[data-save]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('.reader-body').evaluate(e=>getComputedStyle(e).fontSize),'21px');
    await page.locator('[data-back]').first().click();await page.locator('#browse-view').waitFor({state:'visible'});assert.equal(await page.locator('#people-search').inputValue(),'かんと');
    await page.locator('#reset-filters').click();await page.locator('#saved-only').click();await count(1);
    await page.locator('#reset-filters').click();await page.locator('#field-filter').selectOption('economics');await count(14);
    await page.locator('#people-search').fill('ありえない検索zzzz');await count(0);assert.equal(await page.locator('#empty-state').isVisible(),true);
    await page.locator('#empty-reset').click();await count(84);
    await page.locator('[data-route="fairness"]').click();await count(6);
    await page.locator('a.person-link[href="#rawls"]').click();await page.locator('[data-compare]').click();
    await page.locator('[data-back]').first().click();await page.locator('#browse-view').waitFor({state:'visible'});await page.locator('a.person-link[href="#nozick"]').click();await page.waitForFunction(()=>document.querySelector('[data-compare]')?.dataset.compare==='nozick');await page.locator('[data-compare]').click();
    assert.equal(await page.locator('#compare-open').isEnabled(),true);await page.locator('#compare-open').click();
    await page.locator('#compare-view').waitFor({state:'visible'});assert.equal(await page.locator('#compare-tray').isVisible(),false);
    assert.equal(await page.locator('.compare-table thead th').count(),2);
    await page.locator('[data-share-compare]').click();assert.equal(await page.evaluate(()=>window.testCopied),origin+'/library.html#compare=rawls,nozick');
    await noOverflow();await shot('compare-desktop');
    console.log('PASS search, filters, saved state, reading font, comparison and share URLs');

    for(const width of [390,320]) {
      await page.setViewportSize({width,height:844});await goto();await noOverflow();
      const input=await page.locator('#people-search').boundingBox();assert.ok(input.y+input.height<844,'search visible in first viewport');
      if(width===390)await shot('mobile');
      await page.locator('#people-search').fill('こうし');await page.locator('.person-link[href="#confucius"]').click();await page.waitForFunction(()=>document.querySelector('[data-save]')?.dataset.save==='confucius');
      await noOverflow();if(width===390)await shot('reader-mobile');
      await page.locator('.reader-mobile-toc summary').click();await page.locator('.reader-mobile-toc [data-section="sources"]').click();
      assert.equal(new URL(page.url()).hash,'#confucius');
      const sourcesBox=await page.locator('#sources').boundingBox();
      assert.ok(sourcesBox.y>=0 && sourcesBox.y<700,'mobile table of contents reaches sources');
      await goto('#compare=rawls,nozick');await noOverflow();if(width===390)await shot('compare-mobile');
    }
    await goto('#person-does-not-exist');assert.equal(await page.locator('#browse-view').isVisible(),true);
    await goto('#compare=rawls,missing');assert.equal(await page.locator('#browse-view').isVisible(),true);
    await goto('#shannon');assert.match(await page.locator('#person-title').innerText(),/シャノン/);
    await goto();await page.locator('#people-search').fill('かんと');await page.locator('.person-link[href="#kant"]').click();
    await page.locator('#reader-view').waitFor({state:'visible'});await page.locator('[data-back]').first().click();await page.locator('#browse-view').waitFor({state:'visible'});
    await page.locator('#reset-filters').click();await page.goBack();await page.locator('#reader-view').waitFor({state:'visible'});
    await page.goBack();await page.locator('#browse-view').waitFor({state:'visible'});
    assert.equal(await page.locator('#people-search').inputValue(),'かんと');
    assert.deepEqual(errors,[]);
    console.log('PASS 320/390px catalog, reader, source navigation and comparison; invalid deep links; no browser exceptions');

    const restricted=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await restricted.addInitScript(()=>{
      Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage unavailable');}});
      Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('Clipboard unavailable');}}});
    });
    await restricted.goto(origin+'/library.html#kant');await restricted.locator('[data-save]').click();
    assert.equal(await restricted.locator('[data-save]').getAttribute('aria-pressed'),'true');
    assert.match(await restricted.locator('#library-message').innerText(),/保存できません/);
    await restricted.locator('[data-share]').click();assert.match(await restricted.locator('#library-message').innerText(),/アドレス欄/);
    await restricted.close();console.log('PASS unavailable storage and clipboard fallbacks');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
