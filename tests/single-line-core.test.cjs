const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, defaults } = require('../single-line-core.js');
const calc = patch => calculate({ ...defaults, ...patch });
function near(actual, expected, tolerance = 1e-8) { assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`); }

test('90 kW / 0.9: independent reference values for 6.6kV/210V and CT20/5', () => {
  const r = calc();
  assert.equal(r.ok, true); near(r.apparentPower, 100);
  near(r.highCurrent, 8.747731351358, 1e-9);
  near(r.lowCurrent, 274.9286996141, 1e-9);
  near(r.ctCurrent, 2.1869328378395, 1e-9);
  near(r.loading, 66.6666666667, 1e-9);
  assert.equal(r.transformerOver, false); assert.equal(r.ctOver, false);
});
test('changing capacity alone changes ratings and utilization, never actual currents', () => {
  const a = calc(), b = calc({ kva: 300 });
  for (const key of ['highCurrent', 'lowCurrent', 'ctCurrent', 'apparentPower']) assert.equal(a[key], b[key]);
  near(b.loading, a.loading / 2); near(b.highRatedCurrent, a.highRatedCurrent * 2); near(b.lowRatedCurrent, a.lowRatedCurrent * 2);
});
test('lowering power factor at constant kW raises all currents in proportion', () => {
  const a = calc(), b = calc({ pf: 0.6 });
  for (const key of ['highCurrent', 'lowCurrent', 'ctCurrent', 'apparentPower']) near(b[key], a[key] * 1.5);
  near(b.loading, 100); assert.equal(b.transformerOver, false);
  assert.equal(calc({ kw: 90.001, pf: 0.6 }).transformerOver, true);
});
test('secondary voltage and CT ratio each affect only their own current', () => {
  const a = calc(), b = calc({ lowVoltage: 420 }), c = calc({ ctPrimary: 40 });
  near(b.lowCurrent, a.lowCurrent / 2); assert.equal(b.highCurrent, a.highCurrent); assert.equal(b.ctCurrent, a.ctCurrent);
  near(c.ctCurrent, a.ctCurrent / 2); assert.equal(c.highCurrent, a.highCurrent); assert.equal(c.lowCurrent, a.lowCurrent);
});
test('zero load has zero modeled currents but both bus voltages remain energized', () => {
  const r = calc({ kw: 0 });
  for (const key of ['highCurrent', 'lowCurrent', 'ctCurrent', 'apparentPower', 'loading']) assert.equal(r[key], 0);
  assert.equal(r.highVoltage, 6600); assert.equal(r.lowVoltage, 210); assert.equal(r.noLoad, true);
});
test('boundary inputs conserve three-phase power; over-ratings flag without clipping', () => {
  for (const kw of [0, 1, 90, 300]) for (const pf of [0.5, 0.9, 1]) for (const lowVoltage of [200, 210, 400, 420]) {
    const r = calc({ kw, pf, lowVoltage });
    assert.equal(r.ok, true);
    near(Math.sqrt(3) * 6600 * r.highCurrent * pf / 1000, kw);
    near(Math.sqrt(3) * lowVoltage * r.lowCurrent * pf / 1000, kw);
  }
  const r = calc({ kw: 300, pf: 0.5 });
  assert.equal(r.transformerOver, true); assert.equal(r.ctOver, true); near(r.loading, 400); assert.ok(r.ctCurrent > 5);
  const limitKW = Math.sqrt(3) * 6600 * 20 / 1000;
  assert.equal(calc({ kw: limitKW, pf: 1 }).ctOver, false);
  assert.equal(calc({ kw: limitKW + 0.001, pf: 1 }).ctOver, true);
});
test('invalid, missing and nonfinite inputs return errors and no stale calculated values', () => {
  for (const patch of [{ kw: '' }, { kw: ' ' }, { kw: -1 }, { kw: 301 }, { pf: 0 }, { pf: 1.1 }, { pf: null }, { kva: Infinity }, { lowVoltage: undefined }, { ctPrimary: NaN }, { kw: 'x' }, { kw: [] }, { kw: true }]) {
    const r = calc(patch); assert.equal(r.ok, false, JSON.stringify(patch)); assert.ok(Object.keys(r.errors).length); assert.equal(r.highCurrent, undefined);
  }
  assert.equal(calculate().ok, false);
  assert.equal(calc({ kw: '90', pf: '0.9' }).ok, true);
});
