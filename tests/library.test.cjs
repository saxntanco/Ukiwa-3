const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'library-people.js'), 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.UkiwaLibrary));

test('library entries have substantive explanations, limitations, works and attributed sources', () => {
  assert.equal(data.people.length, 84);
  assert.equal(Object.keys(data.fields).length, 11);
  const ids = new Set(data.people.map(p => p.id));
  assert.equal(ids.size, data.people.length);
  for (const p of data.people) {
    assert.ok(data.fields[p.field], p.id + ': known field');
    assert.match(p.id, /^[a-z][a-z-]+$/);
    for (const key of ['name','en','years','question','thesis','background','example','caution']) assert.ok(p[key]?.length >= 2, p.id + ': ' + key);
    assert.ok(p.ideas.length >= 2, p.id + ': explanations');
    assert.ok(p.ideas.every(i=>i.title && i.body.length>=50), p.id + ': explanation depth');
    assert.ok(p.caution.length >= 40, p.id + ': scope and debate');
    assert.ok(p.works.length >= 1 && p.works.every(w=>w.title && w.year && w.note), p.id + ': works');
    assert.ok(p.sources.length >= 1, p.id + ': sources');
    for (const s of p.sources) {
      assert.equal(new URL(s.url).protocol, 'https:');
      assert.ok(s.label && s.type && s.note, p.id + ': source provenance');
      assert.doesNotMatch(s.url, /derk-pereboom\.net|mendelweb\.org|michael-faraday$/);
    }
    assert.ok(p.related.length >= 2 && p.related.every(id=>ids.has(id) && id!==p.id), p.id + ': valid connections');
  }
  assert.ok(data.routes.length >= 6);
  for (const route of data.routes) {
    assert.equal(new Set(route.people).size,route.people.length);
    assert.ok(route.people.every(id=>ids.has(id)),route.id + ': no dead links');
  }
});

test('existing six shelves remain available and the library entry describes its new content', () => {
  const html = fs.readFileSync(path.join(root, 'library.html'),'utf8');
  for (const file of ['prize-encyclopedia.html','unsolved-problems.html','big-science.html','unit-people.html','named-laws.html','science-calendar.html']) {
    assert.ok(html.includes('href="'+file+'"'));
    assert.ok(fs.existsSync(path.join(root,file)));
  }
  assert.match(html,/引用したものではありません/);
  assert.match(html,/このブラウザー内に保存/);
  assert.match(fs.readFileSync(path.join(root, 'hidden-menu.html'),'utf8'),/84人/);
});
