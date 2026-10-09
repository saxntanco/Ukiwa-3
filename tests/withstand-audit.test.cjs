const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const ac = read('ac-withstand-test-simulator.html');
const pas = read('pas-vt-withstand-simulator.html');
const inlineScripts = html => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(s => s.trim());
const acScripts = inlineScripts(ac);
const acContext = vm.createContext({ module: { exports: {} } });
vm.runInContext(acScripts.find(s => s.includes('const ChargingComparison')), acContext);
const E = acContext.module.exports;
const compare = length => E.compare({ size: 38, f: 50, V: 10350, length, theoryMode: 'example' });
const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('all changed pages have syntactically valid inline JavaScript', () => {
  for (const name of ['ac-withstand-test-simulator.html', 'pas-vt-withstand-simulator.html', 'ppe-withstand-guide.html']) {
    inlineScripts(read(name)).forEach((code, i) => new vm.Script(code, { filename: `${name}:script-${i}` }));
  }
});

test('38 mm², 100 m reference and zero-reactor feasible case remain correct', () => {
  const r = compare(100);
  close(r.A.value, 204);
  close(r.B.value, 312.14864606068187);
  const selected = E.reactors(r.B.value, 10350, 50, 4, 0, 167).minimum;
  assert.equal(selected.a, 1);
  assert.equal(selected.b, 0);
  assert.ok(selected.worst <= 167);
  const short = E.reactors(compare(30).B.value, 10350, 50, 4, 0, 167).minimum;
  assert.equal(short.a + short.b, 0);
});

test('210 m can satisfy transformer current while exceeding standard A2 range', () => {
  const current = compare(210).B.value;
  close(current, 655.5121567274319);
  const only2 = E.reactors(current, 10350, 50, 4, 0, 167).minimum;
  assert.equal(only2.a, 4);
  close(only2.worst, 76.60058189568672, 1e-6);
  assert.equal(E.meterRange(current).within, false);
  const mixed = E.reactors(current, 10350, 50, 4, 3, 167).minimum;
  assert.equal(mixed.a, 1);
  assert.equal(mixed.b, 1);
  assert.ok(mixed.worst <= 167);
  assert.equal(E.reactors(10000, 10350, 50, 4, 3, 167).minimum, null);
});

test('standard A2 boundary is independent of reactor compensation', () => {
  assert.equal(E.meterRange(499.9).within, true);
  assert.equal(E.meterRange(500).within, true);
  assert.equal(E.meterRange(500).atLimit, true);
  assert.equal(E.meterRange(500.1).within, false);
  assert.equal(E.meterRange(0).within, true);
  for (const invalid of [-1, '', 'NaN', Infinity]) assert.throws(() => E.meterRange(invalid));
});

test('equivalent capacity units and frequency change yield expected currents', () => {
  const expected = compare(100).B.value;
  for (const [c, unit] of [[.32, 'uFkm'], [.32, 'nFm'], [.00032, 'uFm']]) {
    const r = E.manual(c, unit, 100, 'm', 'one', 50, 10350);
    close(r.cap, .096);
    close(r.value, expected);
  }
  close(E.compare({ size: 38, f: 60, V: 10350, length: 100 }).B.value, expected * 1.2);
});

// Minimal DOM adapter runs the real renderer and its real input listener.
function acPage(length) {
  const elements = new Map();
  class Element {
    constructor(id = '') { this.id = id; this.value = ''; this.children = []; this.listeners = {}; this._html = ''; }
    set innerHTML(value) {
      this._html = value;
      if (this.id === 'cards') this.children = Array.from({ length: (value.match(/<article\b/g) || []).length }, () => new Element());
    }
    get innerHTML() { return this._html; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    insertBefore(child) { this.children.push(child); child.parent = this; }
    querySelector() { return null; }
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
  }
  const get = id => { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); };
  const defaults = { size: 38, freq: 50, voltage: 10350, length, theoryMode: 'example', epsilon: 2.3, legacyC: .32, legacyUnit: 'uFkm', legacyLength: 100, legacyLengthUnit: 'm', legacyBasis: 'one', legacyF: 50, legacyV: 10350 };
  Object.entries(defaults).forEach(([id, value]) => { get(id).value = String(value); });
  const document = {
    getElementById: get,
    createElement: () => new Element(),
    querySelectorAll: selector => selector === '.method-reactors' ? get('cards').children.flatMap(card => card.children) : [],
  };
  const context = vm.createContext({ document, module: { exports: {} } });
  for (const script of acScripts.filter(s => s.includes('const ChargingComparison') || s.includes('const E=ChargingComparison'))) vm.runInContext(script, context);
  return { get, bPanel: () => get('cards').children[1].children[0].innerHTML };
}

test('actual A2 result warning changes after cable-length input changes', () => {
  const page = acPage(210);
  assert.match(page.bPanel(), /data-role="a2-range" class="error"/);
  assert.match(page.bPanel(), /655\.5mA/);
  assert.match(page.bPanel(), /標準A2の測定範囲外/);
  page.get('length').value = '160';
  page.get('length').listeners.input();
  assert.match(page.bPanel(), /data-role="a2-range" class="hint"/);
  assert.match(page.bPanel(), /499\.4mA/);
  assert.doesNotMatch(page.bPanel(), /標準A2の測定範囲外/);
  assert.match(page.bPanel(), /損失を含む実際の全電流/);
});

function pasModel() {
  const values = { iex: 2, rk: 10, cs: 50, len: 30, size: .32, v2: 105 };
  const context = vm.createContext({ document: { getElementById: id => ({ value: values[id] }) } });
  vm.runInContext(pas.slice(pas.indexOf('const $=id=>document.getElementById(id)'), pas.indexOf('const fmt=v=>')), context);
  return {
    values,
    solve: (state, count = 1) => vm.runInContext(`st=${JSON.stringify(Object.fromEntries(['U', 'V', 'W'].map((phase, i) => [phase, state[i]])))};vtn=${count};solve()`, context),
  };
}

test('PAS model preserves common-mode cancellation and connected/grounded voltage', () => {
  const model = pasModel();
  for (const count of [1, 2]) {
    const r = model.solve('HHH', count);
    r.vt.forEach(vt => close(Math.hypot(vt.v.re, vt.v.im), 0));
    close(Math.hypot(r.I.re, r.I.im) * 1000, 2 * Math.PI * 50 * (9.6e-9 + 50e-12) * 10350 * 3 * 1000);
  }
  const grounded = model.solve('HGG');
  close(Math.hypot(grounded.vt[0].v.re, grounded.vt[0].v.im), 10350);
});

test('PAS open-secondary RLC model is not bounded by nominal 31 mA cable current', () => {
  const model = pasModel();
  const open = model.solve('HFF');
  // Independent two-branch impedance result for the open phase.
  const yg = 2 * Math.PI * 50 * (9.6e-9 + 50e-12);
  const xm = 6600 / .002;
  const expected = 10350 * yg / Math.hypot(1 / (10 * xm), yg - 1 / xm);
  close(Math.hypot(open.vt[0].v.re, open.vt[0].v.im), expected);
  close(Math.hypot(open.V.W.re, open.V.W.im), 0); // Omitted mutual capacitance, not a field safety claim.
  model.values.iex = 33;
  const altered = model.solve('HFF');
  const returnCurrent = 2 * Math.PI * 50 * (9.6e-9 + 50e-12) * Math.hypot(altered.V.V.re, altered.V.V.im) * 1000;
  assert.ok(returnCurrent > 31, `model current ${returnCurrent} mA`);
  assert.ok(Number.isFinite(returnCurrent));
});

test('equivalent-circuit top conductor does not bridge the VT winding', () => {
  const section = pas.slice(pas.indexOf('<details open id="why-s">'), pas.indexOf('<p><b>③'));
  const conductor = section.match(/<path d="(M70 99 V50 [^"]+)" fill="none" stroke="#7d8b94"/);
  assert.ok(conductor, 'equivalent-circuit conductor found');
  assert.match(conductor[1], /H230 M310 50 H380/);
  assert.doesNotMatch(conductor[1], /V50 H380/);
});
