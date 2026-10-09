const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const shapes = svg => [...svg.matchAll(/<(line|path|rect|circle)\b[^>]*>/g)].map(m => ({type: m[1], ...attributes(m[0])}));
const point = (x, y) => [Number(x), Number(y)];
const key = p => p.join(',');

// Read the actual drawn orthogonal conductors, rather than a separate circuit model.
function wireSegments(items) {
  const result = [];
  for (const item of items.filter(s => (s.class || '').split(' ').includes('wire'))) {
    if (item.type === 'line') result.push([point(item.x1, item.y1), point(item.x2, item.y2)]);
    else if (item.type === 'path') {
      const tokens = item.d.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g);
      let p;
      for (let i = 0; i < tokens.length;) {
        const command = tokens[i++];
        assert.ok(['M', 'H', 'V', 'L'].includes(command), `unsupported wire command ${command}`);
        let next;
        if (command === 'M' || command === 'L') next = point(tokens[i++], tokens[i++]);
        if (command === 'H') next = point(tokens[i++], p[1]);
        if (command === 'V') next = point(p[0], tokens[i++]);
        if (command !== 'M') result.push([p, next]);
        p = next;
      }
    }
  }
  return result;
}
function componentSegment(item) {
  if (item.type === 'circle') return [point(+item.cx - +item.r, item.cy), point(+item.cx + +item.r, item.cy)];
  return [point(item.x, +item.y + +item.height / 2), point(+item.x + +item.width, +item.y + +item.height / 2)];
}
function connected(segments, start, end) {
  const points = [...new Map([...segments.flat(), start, end].map(p => [key(p), p])).values()];
  const graph = new Map(points.map(p => [key(p), new Set()]));
  for (const [a, b] of segments) {
    assert.ok(a[0] === b[0] || a[1] === b[1], 'orthogonal segment');
    const on = points.filter(p => p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]));
    for (const p of on) for (const q of on) graph.get(key(p)).add(key(q));
  }
  const seen = new Set(), queue = [key(start)];
  while (queue.length) { const p = queue.pop(); if (seen.has(p)) continue; seen.add(p); queue.push(...graph.get(p)); }
  return seen.has(key(end));
}

test('drawn motor circuit: either stop contact interrupts both start and holding paths (16 states)', () => {
  const svg = read('motor-protection-relays.html').match(/<svg\b[^>]*id="motorControlCircuit"[^>]*>[\s\S]*?<\/svg>/)[0];
  const items = shapes(svg), wires = wireSegments(items);
  const contacts = ['motorProtectionContact', 'motorStopContact', 'motorStartContact', 'motorHoldContact'].map(id => {
    const item = items.find(s => s.id === id); assert.ok(item, id); return componentSegment(item);
  });
  const coil = componentSegment(items.find(s => s.id === 'motorControlCoil'));
  const rails = items.filter(s => s.type === 'line' && s.x1 === s.x2 && s.class.includes('control-wire'));
  assert.equal(rails.length, 2);
  const [L, N] = rails.map(s => point(s.x1, s.y1));
  for (let state = 0; state < 16; state++) {
    const closed = contacts.map((_, i) => Boolean(state & (1 << i)));
    const actual = connected([...wires, coil, ...contacts.filter((_, i) => closed[i])], L, N);
    assert.equal(actual, closed[0] && closed[1] && (closed[2] || closed[3]), `closed [protection, stop, start, hold]=${closed}`);
  }
});

test('drawn K2DG output loops use complete c1-a1 / c2-a2 pairs and remain separate', () => {
  const page = read('relay-wiring.html');
  const context = vm.createContext({});
  vm.runInContext(page.slice(page.indexOf('const termBlock='), page.indexOf('function testSvg(')) + ';globalThis.svg=installedSvg();', context);
  const svg = context.svg, terminals = {};
  for (const match of svg.matchAll(/<rect class="term"[^>]*\/><text class="tlabel"[^>]*>([ac][12])<\/text>/g)) {
    const rect = attributes(match[0].split('/>')[0]);
    terminals[match[1]] = point(+rect.x + +rect.width / 2, +rect.y + +rect.height);
  }
  assert.equal(Object.keys(terminals).length, 4);
  const groups = [...svg.matchAll(/<g data-contact-circuit="[12]">([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 2);
  const segments = [];
  for (const [i, match] of groups.entries()) {
    const items = shapes(match[1]);
    const components = items.filter(s => s.class === 'box');
    assert.equal(components.length, 2, 'one external power source and one load');
    const loop = [...wireSegments(items), ...components.map(componentSegment)];
    assert.ok(connected(loop, terminals[`c${i + 1}`], terminals[`a${i + 1}`]));
    segments.push(...loop);
  }
  assert.equal(connected(segments, terminals.c1, terminals.c2), false);
  assert.equal(connected(segments, terminals.a1, terminals.a2), false);
});
