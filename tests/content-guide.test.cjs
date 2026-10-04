const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const scope = {window:{}};
vm.runInNewContext(read('content-guide-data.js'), scope);
vm.runInNewContext(read('content-guide-private.js'), scope);
const publicItems = scope.window.UkiwaContents;
const privateItems = scope.window.UkiwaPrivateContents;

test('catalogue paths and related links exist, without exposing private pages in public results', () => {
  assert.equal(publicItems.length, 41);
  assert.equal(privateItems.length, 14);
  const all = [...publicItems, ...privateItems];
  assert.equal(new Set(all.map(x => x.path)).size, all.length);
  for (const list of [publicItems, privateItems]) {
    const allowed = new Set((list === publicItems ? publicItems : all).map(x => x.path));
    for (const item of list) {
      const file = item.path.endsWith('/') ? item.path + 'index.html' : item.path;
      assert.ok(fs.statSync(path.join(root, file)).isFile(), file);
      assert.ok(item.title && item.description && item.category && item.tags, file);
      assert.equal(item.related.length, 3, file);
      for (const related of item.related) {
        assert.ok(allowed.has(related), `${file} -> ${related}`);
        assert.notEqual(related, item.path);
      }
      assert.match(read(file), /island-pages\.js|content-guide\.js/, file);
    }
  }
});

const source = read('energy-kamoku2.js');
const parser = source.slice(source.indexOf('function parseNum('), source.indexOf('function answerText('));
const numericScope = {};
vm.runInNewContext(parser, numericScope);
test('numeric answers accept normal scientific notation and reject overflow before grading', () => {
  for (const input of ['1e999', '-2×10^999', 'Infinity', 'NaN', '']) assert.equal(numericScope.parseNum(input), null, input);
  assert.equal(numericScope.parseNum('1.2×10^3'), 1200);
  assert.equal(numericScope.parseNum('－２．５'), -2.5);
  assert.equal(numericScope.parseNum('3e-2'), 0.03);
});

test('damaged stored record shape is recovered and existing records are preserved', () => {
  const loader = source.slice(source.indexOf('function loadRec('), source.indexOf('function saveRec('));
  for (const [stored, expected] of [['null', {}], ['[]', {}], ['"text"', {}], ['bad JSON', {}], ['{"q1":{"tried":true}}', {q1:{tried:true}}]]) {
    const recordScope = {rec:null, lsKey:()=> 'test', localStorage:{getItem:()=>stored}};
    vm.runInNewContext(loader, recordScope);
    recordScope.loadRec();
    assert.deepEqual(JSON.parse(JSON.stringify(recordScope.rec)), expected);
  }
});
