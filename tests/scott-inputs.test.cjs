const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
class Element {
  constructor(id) { this.id=id; this.dataset={}; this.attrs={}; this.listeners={}; this.value=''; this.hidden=false; this._html=''; this._text=''; }
  set innerHTML(v) { this._html=String(v); this._text=this._html.replace(/<[^>]*>/g,''); }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text=String(v); this._html=String(v); }
  get textContent() { return this._text; }
  get valueAsNumber() { return this.value.trim()==='' ? NaN : Number(this.value); }
  setAttribute(k,v) { this.attrs[k]=String(v); }
  getAttribute(k) { return this.attrs[k] ?? null; }
  addEventListener(k,fn) { this.listeners[k]=fn; }
}
function setup() {
  const html=read('scott-transformer.html'), elements=new Map();
  for(const m of html.matchAll(/\bid="(sc-[^"]+)"/g)) elements.set(m[1],new Element(m[1]));
  const get=id=>elements.get('sc-'+id);
  const modes=['single','two','iv','scott','three'].map(mode=>{const e=get('mode-'+mode);e.dataset.mode=mode;e.attrs['data-mode']=mode;return e;});
  const pairs=['UW','UV','VW'].map(pair=>{const e=new Element('pair-'+pair);e.dataset.pair=pair;e.attrs['data-pair']=pair;return e;});
  const shared=['U','V','W'].map(v=>{const e=new Element('shared-'+v);e.dataset.shared=v;e.attrs['data-shared']=v;return e;});
  const document={
    getElementById:id=>elements.get(id)||null,
    querySelectorAll:sel=>sel==='.sc-modes button'?modes:sel==='[data-pair]'?pairs:sel==='[data-shared]'?shared:sel==='#sc-share-box .sc-chips button'?['share-even','share-all','share-t'].map(get):[]
  };
  vm.runInNewContext(read('scott-transformer.js'),{document,Math,Number,Object,String});
  return {get,input:(id,v)=>{const e=get(id);e.value=String(v);e.listeners.input({target:e});},click:id=>get(id).listeners.click()};
}
test('representative configurations still calculate the expected negative-sequence current',()=>{
  const s=setup();
  assert.equal(s.get('v-i2').textContent,'20.0%');
  s.click('mode-two');assert.equal(s.get('v-i2').textContent,'10.0%');
  s.click('mode-iv');assert.equal(s.get('v-i2').textContent,'20.0%');
  s.click('mode-scott');s.click('share-even');assert.equal(s.get('v-i2').textContent,'0.0%');
  s.click('mode-three');s.click('three-even');assert.equal(s.get('v-i2').textContent,'0.0%');
});
test('nonzero load with three zero weights clears ALL dependent results and recovers',()=>{
  const s=setup();s.click('mode-three');
  for(const id of ['w1','w2','w3']) s.input(id,0);
  assert.equal(s.get('pill').textContent,'計算できません');
  for(const id of ['v-i2','v-vu','v-max','v-ratio']) assert.equal(s.get(id).textContent,'—');
  for(const id of ['diagram','bars','seq','phasor','wave']) assert.equal(s.get(id).innerHTML,'');
  assert.match(s.get('cmp').innerHTML,/停止/);assert.doesNotMatch(s.get('cmp').innerHTML,/class="cur"/);
  assert.equal(s.get('w1').getAttribute('aria-invalid'),'true');
  s.click('three-even');assert.equal(s.get('v-i2').textContent,'0.0%');assert.equal(s.get('split-error').textContent,'');
  assert.equal(s.get('w1').getAttribute('aria-invalid'),'false');
});
test('zero single-phase load does not require a split; adding load again invalidates it',()=>{
  const s=setup();s.click('mode-three');s.input('s1',0);
  for(const id of ['w1','w2','w3']) s.input(id,0);
  assert.equal(s.get('v-i2').textContent,'0.0%');assert.equal(s.get('three-o').textContent,'単相負荷なし');
  s.input('s1',20);assert.equal(s.get('pill').textContent,'計算できません');
  s.click('mode-single');assert.equal(s.get('v-i2').textContent,'20.0%');
});
for(const [id,invalid,valid] of [
  ['limit',['',0,-1,0.999,50.01,'x'],[1,15,50]],
  ['x2',['',0,-1,0.019,1.001,'x'],[0.02,0.15,1]]
]){
  test(id+': blank, invalid, out of range, inclusive boundaries and recovery',()=>{
    const s=setup();
    for(const v of invalid){s.input(id,v);assert.equal(s.get('pill').textContent,'計算できません',String(v));assert.equal(s.get(id).getAttribute('aria-invalid'),'true');assert.equal(s.get('v-i2').textContent,'—');}
    for(const v of valid){s.input(id,v);assert.notEqual(s.get('pill').textContent,'計算できません');assert.equal(s.get(id).getAttribute('aria-invalid'),'false');assert.equal(s.get('v-i2').textContent,'20.0%');}
  });
}
test('all invalid fields must be repaired; mode changes never revive stale results',()=>{
  const s=setup();s.input('x2','');s.input('limit','');s.click('mode-scott');
  assert.equal(s.get('v-i2').textContent,'—');s.input('limit',15);assert.equal(s.get('v-i2').textContent,'—');
  s.input('x2',0.15);assert.equal(s.get('v-i2').textContent,'4.0%');
});
test('uneven two-transformer case is not highlighted as the balanced comparison row',()=>{
  const s=setup();s.click('mode-two');assert.match(s.get('cmp').innerHTML,/class="cur"/);
  s.click('share-all');assert.equal(s.get('v-i2').textContent,'20.0%');assert.doesNotMatch(s.get('cmp').innerHTML,/class="cur"/);
});
