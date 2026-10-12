const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>err?res.writeHead(404).end():res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data));
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch(process.env.LIBRARY_BROWSER_PATH?{executablePath:process.env.LIBRARY_BROWSER_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:{});
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  const out=path.join(root,'test-results');fs.mkdirSync(out,{recursive:true});
  const goto=async hash=>{await page.goto(origin+'/unsolved-problems.html'+(hash||''));await page.waitForFunction(()=>document.documentElement.classList.contains('js'));};
  const visibleTopics=()=>page.locator('.topic:visible');
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
  const shot=async name=>page.screenshot({path:path.join(out,'unsolved-'+name+'.png'),animations:'disabled'});
  try {
    await goto();assert.equal(await visibleTopics().count(),0);assert.equal(await page.locator('.topic-grid a').count(),6);await noOverflow();await shot('desktop');
    assert.equal(await page.locator('.problem').count(),28);
    const catalogue=await page.locator('.problem').evaluateAll(items=>items.map(e=>({id:e.id,body:e.querySelector('.problem-body').textContent,sources:[...e.querySelectorAll('.problem-sources a')].map(a=>a.href)})));
    for(const entry of catalogue){assert.ok(entry.body.length>450,entry.id+' has explanatory depth');assert.ok(entry.sources.length>0);for(const url of entry.sources)assert.equal(new URL(url).protocol,'https:');}
    const ids=await page.locator('[id]').evaluateAll(items=>items.map(e=>e.id));assert.equal(new Set(ids).size,ids.length,'unique fragment identifiers');
    const missing=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));assert.deepEqual(missing,[]);
    await page.locator('.featured-question').click();await page.locator('#consciousness[open]').waitFor();
    assert.equal(await visibleTopics().count(),1);assert.equal(await page.locator('.problem[open]').count(),1);
    await page.locator('.reading-jumps a[href="#conscious-theories"]').click();await noOverflow();await shot('theories-desktop');
    const title=await page.title();assert.match(title,/意識/);
    await page.locator('#topic-select').selectOption('math');await page.locator('#math').waitFor({state:'visible'});
    assert.equal(await page.locator('#life').isVisible(),false);assert.equal(await page.locator('.problem[open]').count(),0);
    await page.locator('#riemann > summary').click();await page.locator('#riemann[open]').waitFor();
    await page.locator('#collatz > summary').click();await page.locator('#collatz[open]').waitFor();assert.equal(await page.locator('#riemann').getAttribute('open'),null);
    await page.goBack();await page.locator('#riemann[open]').waitFor();
    await page.locator('#riemann .close-problem').click();await page.waitForFunction(()=>location.hash==='#math'&&!document.querySelector('.problem[open]'));assert.equal(await page.locator('.problem[open]').count(),0);
    await page.locator('#riemann > summary').focus();await page.keyboard.press('Enter');await page.locator('#riemann[open]').waitFor();
    await page.locator('#riemann > summary').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>location.hash==='#math'&&!document.querySelector('.problem[open]'));
    console.log('PASS 28 substantive entries, source links, fragments, subject selection, accordion, keyboard and history');
    for(const width of [390,320]){
      await page.setViewportSize({width,height:844});await goto();await noOverflow();await shot('mobile-'+width);
      const featured=await page.locator('.featured-question').boundingBox();assert.ok(featured.y+featured.height<844,'consciousness entry visible without scrolling');
      await page.locator('.featured-question').click();await page.locator('#consciousness[open]').waitFor();await noOverflow();if(width===390)await shot('consciousness-mobile');
      await page.locator('.reading-jumps a[href="#conscious-theories"]').click();await page.waitForFunction(()=>location.hash==='#conscious-theories');await noOverflow();if(width===390)await shot('theories-mobile');
      const theory=await page.locator('#conscious-theories').boundingBox();assert.ok(theory.y>=0&&theory.y<500,'chapter link reaches theory comparison');
      await page.locator('#topic-select').selectOption('physics');await page.locator('#physics').waitFor({state:'visible'});await noOverflow();
      await page.locator('#neutrino > summary').click();await page.locator('#neutrino[open]').waitFor();await noOverflow();
      await page.locator('#neutrino .problem-bottom a').click();await page.locator('#entrance').waitFor({state:'visible'});assert.equal(await visibleTopics().count(),0);
    }
    for(const entry of catalogue){await goto('#'+entry.id);assert.equal(await page.locator('.problem[open]').count(),1);assert.equal(await page.locator('#'+entry.id).isVisible(),true);await noOverflow();}
    await goto('#conscious-hard');assert.equal(await page.locator('#consciousness').getAttribute('open'),'');
    await goto('#sources');assert.equal(await page.locator('#evidence-guide').getAttribute('open'),'');
    await goto('#prize');assert.equal(await page.locator('#prize').getAttribute('open'),'');
    await goto('#missing-problem');assert.equal(await page.locator('#entrance').isVisible(),true);assert.equal(new URL(page.url()).hash,'#entrance');
    const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await fallback.goto(origin+'/unsolved-problems.html#life');assert.equal(await fallback.locator('.topic:visible').count(),6);
    await fallback.locator('#consciousness > summary').click();assert.equal(await fallback.locator('#consciousness .problem-body').isVisible(),true);await fallback.close();
    assert.deepEqual(errors,[]);console.log('PASS 320/390px, all 28 deep links, chapter jumps, legacy anchors, invalid fragment and no-JavaScript reading');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
