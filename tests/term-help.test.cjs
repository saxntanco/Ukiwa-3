const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { entries } = require('../term-help-data.js');
const { createMatcher, normalize } = require('../term-help.js');
const root = path.resolve(__dirname, '..');
const match = createMatcher(entries);

test('abbreviations cannot become a different device and longer technical terms win', () => {
  assert.deepEqual(match('OVGR・OVR・GR・ZCT・CTD・CT比・CT・反比例・比例').map(x => x.id),
    ['ovgr','ovr','gr','zct','ctd','ct-ratio','ct','inverse-proportional','proportional']);
  assert.deepEqual(match('PRODUCT CT123 XCT ABC_RPR2 VTTX').map(x => x.id), []);
  assert.deepEqual(match('定格負担と定格。可逆断熱と断熱。').map(x => x.id), ['rated-burden','rating','reversible-adiabatic','adiabatic']);
});

test('original Unicode offsets and visible text survive full-width and lower-case abbreviations', () => {
  const text = '例：ＣＴ比75/5、ct、ｏｖｇｒ、エンタルピー。';
  const results = match(text);
  assert.deepEqual(results.map(x => x.id), ['ct-ratio','ct','ovgr','enthalpy']);
  assert.deepEqual(results.map(x => text.slice(x.start, x.end)), ['ＣＴ比','ct','ｏｖｇｒ','エンタルピー']);
  assert.equal(match('CT比').length, 1); assert.equal(match('CT比').length, 1);
});

test('dictionary meanings are unique, short, complete and lead only to existing lessons', () => {
  const ids = new Set(), aliases = new Map();
  assert.ok(entries.length >= 150);
  for (const item of entries) {
    assert.ok(!ids.has(item.id), item.id); ids.add(item.id);
    assert.ok(item.definition && item.example && item.category, item.id);
    assert.ok(item.definition.length < 160 && item.example.length < 150, item.id);
    assert.ok(fs.existsSync(path.join(root, item.path.split('#')[0])), item.path);
    for (const alias of item.aliases) {
      const key = normalize(alias);
      assert.ok(!aliases.has(key) || aliases.get(key) === item.id, alias);
      aliases.set(key, item.id);
    }
    if (item.source) assert.equal(new URL(item.source.url).protocol, 'https:');
  }
});

test('every published HTML page, including the hideout and legacy URLs, reaches a shared glossary loader', () => {
  const files = execFileSync('git', ['ls-files','-z','*.html'], { cwd: root, encoding: 'utf8' }).split('\0')
    .filter(name => name && !name.startsWith('tests/') && !name.startsWith('circuit-duel/src/'));
  assert.ok(files.length >= 70);
  for (const name of files) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']*(?:island-pages|content-guide|hideout-nav)\.js[^"']*)["'][^>]*>/g)];
    assert.ok(scripts.length > 0, name);
    for (const script of scripts) assert.ok(fs.existsSync(path.resolve(root, path.dirname(name), script[1].split('?')[0])), name);
  }
  assert.match(fs.readFileSync(path.join(root,'island-pages.js'),'utf8'), /content-guide\.js/);
  for (const script of ['content-guide.js','hideout-nav.js']) {
    const source = fs.readFileSync(path.join(root,script),'utf8');
    assert.match(source, /script\[data-ukiwa-term-loader\]/);
    assert.match(source, /new URL\('term-help\.js\?v=[\w.-]+', document.currentScript.src\)/);
  }
});

test('ambiguous taps have distinct OCR and transformer explanations', () => {
  const tap = entries.find(x => x.id === 'tap');
  assert.match(tap.contexts.find(x => x.pages.includes('ocr-tap-calculator')).definition, /二次電流/);
  assert.match(tap.contexts.find(x => x.pages.includes('ct-calculator')).definition, /巻数/);
});
