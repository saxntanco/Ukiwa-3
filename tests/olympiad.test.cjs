const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('13 fields contain actual original practice, hints, explanations and official source routes',()=>{
 const h=read('olympiad.html');
 const fields=[...h.matchAll(/<details class="field"[^>]*id="([^"]+)"[\s\S]*?(?=<details class="field"|<p id="olym-empty")/g)];
 assert.equal(fields.length,13);assert.equal(new Set(fields.map(m=>m[1])).size,13);
 for(const [block,id]of fields){assert.match(block,/自作入門/);assert.match(block,/ヒントを見る/);assert.match(block,/最初の一手/);assert.match(block,/class="sources"/);assert.match(block,/https:\/\//);}
 assert.doesNotMatch(h,/解説準備中/);assert.match(h,/IAO）は別大会/);assert.match(h,/公式解答ではありません/);
 for(const p of ['olympiad-imo-2019-p1.html','olympiad-ipho-2022-t1.html'])assert.ok(h.includes(p));
});
test('new local links and anchors resolve and external tabs are isolated',()=>{
 for(const p of ['olympiad.html','olympiad-astronomy.html']){
  const h=read(p);
  const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,p);
  for(const m of h.matchAll(/(?:href|src)="([^"]+)"/g)){
   const u=m[1];if(/^https?:/.test(u))continue;
   const [file,anchor]=u.split('?')[0].split('#');const filePath=file||p;
   assert.ok(fs.existsSync(path.join(root,filePath)),p+': '+u);
   if(anchor)assert.ok(read(filePath).includes('id="'+anchor+'"'),u);
  }
  for(const m of h.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))assert.match(m[0],/rel="noopener"/);
 }
});
test('astronomy model computes ratios and never leaves an old value after invalid input',()=>{
 const input={valueAsNumber:2,attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this[k]=fn;}};
 const output={textContent:'',classList:{toggle(){}}},model={hidden:true};
 const elements={'distance-ratio':input,'brightness-result':output,'brightness-model':model};
 vm.runInNewContext(read('olympiad-astronomy.js'),{document:{getElementById:id=>elements[id]},Number,Intl});
 assert.equal(model.hidden,false);assert.match(output.textContent,/0.25/);
 for(const [k,expected]of [[1,' 1 倍'],[0.1,' 100 倍'],[100,' 0.0001 倍'],[3,' 0.1111 倍']]){input.valueAsNumber=k;input.input();assert.ok(output.textContent.includes(expected));assert.equal(input.attrs['aria-invalid'],'false');}
 for(const k of [NaN,0,-2,0.09,101,Infinity]){input.valueAsNumber=k;input.input();assert.match(output.textContent,/計算できません/);assert.equal(input.attrs['aria-invalid'],'true');}
 input.valueAsNumber=2;input.input();assert.match(output.textContent,/0.25/);
});
test('astronomy derivations keep angular units, assumptions, and the independent answers',()=>{
 const h=read('olympiad-astronomy.html');
 for(const token of ['3倍','20 pc','8年','秒角','全振幅2p','質量','軌道長半径','自作','公式解答ではありません'])assert.ok(h.includes(token),token);
 assert.equal(Math.sqrt(9),3);assert.equal(1/0.05,20);assert.equal(Math.sqrt(4**3),8);
});
test('VT learning pages distinguish burden-equivalent current from thermal limits',()=>{
 const h=read('vt-water-analogy.html');
 assert.match(h,/負担の一次換算電流/);assert.match(h,/励磁電流・損失を含む一次全電流とは別/);
 assert.doesNotMatch(h,/定格一次電流（負担|VTが本来流せる電流|定格の1.5倍を超える電圧では、鉄心が/);
 assert.match(h,/この表は焼損の判定表ではありません/);
 assert.doesNotMatch(read('pukapuka-diary.html'),/内蔵VTの定格一次電流/);
});
test('IMO proof references the correct side and the official comparison',()=>{
 const h=read('olympiad-imo-2019-p1.html');assert.match(h,/右辺の <span class="m">f\(f\(a\)\)/);assert.match(h,/公式解答との照合：済/);assert.match(h,/IMO2019SL.pdf/);
});
