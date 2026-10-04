const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
test('31 page-specific lessons have usable examples, valid answers, and source links', () => {
  const index = read('learning-guides/index.json');
  assert.equal(Object.keys(index).length, 31);
  for (const protectedPage of ['ac-withstand-test-simulator.html', 'ac-withstand-test-simulator (1).html', 'ukiwamemo_kyounonande_taiatsu_reactor_ic.html']) assert.ok(!Object.hasOwn(index, protectedPage));
  for (const [page, file] of Object.entries(index)) {
    assert.ok(fs.existsSync(path.join(root, page)), page);
    const guide = read(file);
    assert.equal(guide.page, page);
    assert.ok(guide.title && guide.lead, page);
    assert.ok(guide.sections.length >= 3, page);
    assert.ok(guide.sections.some(s => s.example), page);
    for (const section of guide.sections) {
      assert.ok(section.title && section.body.length, page);
      if (section.example) assert.ok(section.example.question && section.example.steps.length && section.example.answer, page);
      if (section.table) for (const row of section.table.rows) assert.equal(row.length, section.table.headers.length, page);
    }
    assert.ok(guide.checks.length >= 3, page);
    for (const check of guide.checks) {
      assert.ok(check.question && check.explanation && check.choices.length >= 2, page);
      assert.ok(Number.isInteger(check.answer) && check.answer >= 0 && check.answer < check.choices.length, page);
    }
    assert.ok(guide.sources.length, page);
    for (const source of guide.sources) {
      assert.ok(source.label && source.accessed, page);
      assert.match(source.url, /^https?:\/\//, page);
    }
  }
});
