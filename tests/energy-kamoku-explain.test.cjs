// 課目Ⅱ・Ⅳ 空欄解説データの整合：解説の型、選択肢ごとの理由、問題全体の話
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = [2, 4].flatMap(k => fs.readdirSync(path.join(root, `energy-kamoku${k}`))
  .filter(f => f.endsWith('.json')).map(f => path.join(root, `energy-kamoku${k}`, f)));
const years = files.map(f => ({ f, d: JSON.parse(fs.readFileSync(f, 'utf8')) }));

test('every blank has an explanation type that matches its answer form', () => {
  for (const { f, d } of years) for (const x of d.blanks) {
    assert.ok(['calc', 'formula', 'know'].includes(x.kind), `${x.id} kind`);
    assert.equal(x.kind === 'calc', x.type === 'num', `${x.id} calc only for numeric answers`);
  }
});

test('per-choice reasons name only real wrong choices of that blank', () => {
  for (const { d } of years) for (const x of d.blanks) {
    if (!x.whyBy) continue;
    assert.equal(x.type, 'choice', x.id);
    for (const [s, r] of Object.entries(x.whyBy)) {
      assert.ok(x.symbols.includes(s), `${x.id} ${s} is a symbol of the answer group`);
      assert.notEqual(s, x.answer, `${x.id} the correct answer has no "wrong" reason`);
      assert.ok(String(r).trim().length > 2, `${x.id} ${s} reason is not empty`);
      if ((x.alt || []).includes(s)) assert.match(r, /順序不問/, `${x.id} ${s} order-free answer is marked as correct`);
    }
  }
});

test('R03–R07 choice blanks all carry per-choice reasons and a question overview', () => {
  for (const { f, d } of years) {
    if (!/r0[3-7]\.json$/.test(f)) continue;
    for (const x of d.blanks.filter(b => b.type === 'choice')) assert.ok(x.whyBy && Object.keys(x.whyBy).length, `${x.id} whyBy`);
    for (const q of new Set(d.blanks.map(b => String(b.q)))) assert.ok(d.story && d.story[q] && d.story[q].body.length, `${f} story ${q}`);
  }
});

test('symbol tables keep only filled rows', () => {
  for (const { d } of years) for (const x of d.blanks) for (const row of x.full.method[1]) {
    assert.equal(row.length, 2, x.id);
    assert.ok(String(row[0]).trim() && String(row[1]).trim(), `${x.id} symbol row`);
  }
});
