const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const scope = {window: {}, document: {getElementById: () => null, querySelectorAll: () => []}, location: {hash: ''}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'motor-starting-insulation.js'), 'utf8'), scope);
const {METHODS, analyse} = scope.window.UkiwaMotorIslands;
const build = (k, v) => METHODS.find(m => m.k === k).build(v);
const count = (k, opts = {}) => {
  const c = build(k, opts.v);
  const a = analyse(c, opts.on || {}, !!opts.brk);
  return {all: a.islands.length, secondary: a.islands.filter(i => !i.prim).length, minor: a.islands.filter(i => i.minor).length, a, c};
};

test('stopped circuits: islands for the whole circuit and beyond the primary side', () => {
  const expected = {
    // The breaker-to-contactor wiring has no load joining the phases, so it is one island per phase.
    dol: [4, 1, 0], rev: [4, 1, 0], yd3: [7, 4, 1], yd2: [4, 4, 1],
    reactor: [4, 1, 0], kondorfer: [5, 2, 1], wound: [5, 2, 0], inv: [7, 4, 0]
  };
  for (const [k, [all, secondary, minor]] of Object.entries(expected)) {
    const r = count(k);
    assert.deepEqual([r.all, r.secondary, r.minor], [all, secondary, minor], k);
  }
  const b = count('yd3', {v: 'b'});
  assert.deepEqual([b.all, b.secondary, b.minor], [7, 4, 1], 'yd3 variant b');
});

test('every probe point belongs to a measurable island and every island has a probe', () => {
  for (const m of METHODS) for (const v of m.variants ? m.variants.map(x => x[0]) : [undefined]) {
    const c = m.build(v);
    const a = analyse(c, {}, false);
    const probed = new Set(c.order.filter(id => c.nodes[id].p).map(id => a.f(id)));
    for (const island of a.islands) if (!island.minor) assert.ok(probed.has(island.root), `${m.k}${v || ''} island ${island.letter} has no probe`);
    for (const id of c.order) if (c.nodes[id].p) assert.ok(!a.info[a.f(id)].src, `${m.k} probe ${id} on source`);
  }
});

test('state changes merge or split islands as the circuit says', () => {
  // A broken U winding isolates the U terminal side.
  assert.equal(count('dol', {brk: true}).all, 5);
  assert.equal(count('yd3', {brk: true}).all, 8);
  // MCS closed joins the three windings and the star jumper; the three primary wires stay separate.
  assert.equal(count('yd3', {on: {MCS: true}}).all, 4);
  // MCΔ fed from the line: closing it ties each line wire to one winding (R–Z, S–X, T–Y).
  const d = count('yd3', {on: {MCD: true}});
  assert.equal(d.all, 4);
  assert.equal(d.a.f('p10'), d.a.f('mt2'));
  // MCΔ fed from MCM secondary: closing it joins the three windings into a delta.
  assert.equal(count('yd3', {v: 'b', on: {MCD: true}}).all, 5);
  // Closing MCM ties each primary wire to its own winding.
  assert.equal(count('yd3', {on: {MCM: true}}).all, 4);
  // Shorting nothing: in the inverter case the disconnected input wiring is one island per phase.
  assert.notEqual(count('inv').a.f('p20'), count('inv').a.f('p21'));
  // Shorting leads bundle the phases: one point per section.
  assert.equal(count('dol', {on: {SHORT: true}}).all, 2);
  assert.equal(count('yd3', {on: {SHORT: true}}).all, 3);
  assert.equal(count('inv', {on: {SHORT: true}}).all, 3);
  // Two-contactor star-delta with the breaker on: windings are live, only the star jumper is left as an island.
  const live = count('yd2', {on: {CB: true}});
  assert.equal(live.all, 1);
  assert.ok(live.a.info[live.a.f('mt0')].src);
  // Inverter terminals reconnected: the islands touch the inverter body.
  const inv = count('inv', {on: {LINK: true}});
  assert.ok(inv.a.info[inv.a.f('p20')].dangerAny);
  assert.ok(!count('inv').a.info[count('inv').a.f('p20')].dangerAny);
  // Wound rotor: rotor circuit is separate from the stator.
  const w = count('wound');
  assert.notEqual(w.a.f('sr0'), w.a.f('mt0'));
  assert.equal(w.a.f('sr0'), w.a.f('sr2'));
  // Kondorfer: the autotransformer winding is in the motor island.
  const k = count('kondorfer');
  assert.equal(k.a.f('ka0'), k.a.f('mt0'));
  assert.equal(k.a.f('kn2'), k.a.f('mt1'));
});
