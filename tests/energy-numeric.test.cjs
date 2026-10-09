const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'energy-kamoku2.js'), 'utf8');
const context = vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function parseNum('), source.indexOf('function answerText(')), context);
const grade = (question, input) => context.isOk(question, context.parseNum(input));
const blanks = [2, 4].flatMap(k => fs.readdirSync(path.join(root, `energy-kamoku${k}`))
  .filter(f => f.endsWith('.json'))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(root, `energy-kamoku${k}`, f), 'utf8')).blanks));
const find = id => blanks.find(x => x.id === id);

test('the documented rounding boundary rejects 1.895 for the 1.89 answer', () => {
  const q = find('R04-II-6-A');
  for (const value of ['1.89', '1.885', '1.8949', '1.894999999999999999']) assert.equal(grade(q, value), true, value);
  for (const value of ['1.895', '1.895000000000000001', '1.884999999999999999', '1.90']) assert.equal(grade(q, value), false, value);
});

test('decimal rounding handles binary-float pitfalls, signed values and zero', () => {
  assert.equal(grade({ answerNum: 1.01, step: .01 }, '1.005'), true);
  assert.equal(grade({ answerNum: 1, step: .01 }, '1.005'), false);
  assert.equal(grade({ answerNum: -1.89, step: .01 }, '-1.885'), true);
  assert.equal(grade({ answerNum: -1.89, step: .01 }, '-1.895'), false);
  for (const value of ['0', '-0', '0.004999', '-0.004999']) assert.equal(grade({ answerNum: 0, step: .01 }, value), true);
  for (const value of ['0.005', '-0.005']) assert.equal(grade({ answerNum: 0, step: .01 }, value), false);
});

test('scientific notation and full-width input preserve the same decimal boundary', () => {
  const q = find('R04-II-6-A');
  for (const value of ['1.89e0', '189E-2', '1.89×10^0', '189×10⁻²', '１．８９', '+1.89']) assert.equal(grade(q, value), true, value);
  for (const value of ['189.5e-2', '１．８９５', '1.895×10⁰']) assert.equal(grade(q, value), false, value);
});

test('fixed multipliers require coefficients while variable exponents require whole values', () => {
  const fixed = find('R07-II-4-D');
  assert.equal(grade(fixed, '7.18'), true);
  assert.equal(grade(fixed, '0.718'), false);
  const full = find('R04-II-5-A');
  assert.equal(grade(full, '144'), true);
  assert.equal(grade(full, '1.44e2'), true);
  assert.equal(grade(full, '1.44'), false);
  assert.equal(grade(find('R04-II-5-B'), '22.4'), true);
});

test('all existing numeric answers still pass at their displayed precision', () => {
  const numeric = blanks.filter(x => x.type !== 'choice');
  assert.equal(numeric.length, 160);
  for (const q of numeric) {
    assert.equal(grade(q, q.answerDisp), true, `${q.id}: displayed answer ${q.answerDisp}`);
    assert.equal(grade(q, String(q.answerNum + q.step)), false, `${q.id}: one answer step too high`);
  }
});

test('malformed and oversized input cannot be graded as a number', () => {
  for (const input of ['', 'NaN', 'Infinity', '1,89', '1..89', '1e', '1e999', '-2×10^999', '1e1001', '1e-1001', '9'.repeat(301)]) {
    assert.equal(context.parseNum(input), null, input);
  }
});
