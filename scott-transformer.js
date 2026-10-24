/* 非常用発電機とスコットトランス：単相負荷のつなぎ方と発電機の逆相電流のシミュレーター
   つなぎ方：単相変圧器1台・単相変圧器2台・逆V結線・スコット結線・単相変圧器3台
   学習用モデル。三相210V・理想変圧器・単相負荷は力率1・三相負荷は力率0.8。 */
(function () {
  'use strict';
  var V = 210, VP = V / Math.sqrt(3), PHI3 = Math.acos(0.8) * 180 / Math.PI;
  function cx(re, im) { return { re: re, im: im }; }
  var ZERO = cx(0, 0);
  function add(a, b) { return cx(a.re + b.re, a.im + b.im); }
  function sub(a, b) { return cx(a.re - b.re, a.im - b.im); }
  function sc(a, k) { return cx(a.re * k, a.im * k); }
  function mul(a, b) { return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function abs(a) { return Math.hypot(a.re, a.im); }
  function argd(a) { return Math.atan2(a.im, a.re) * 180 / Math.PI; }
  function pol(r, d) { return cx(r * Math.cos(d * Math.PI / 180), r * Math.sin(d * Math.PI / 180)); }
  var PH = ['U', 'V', 'W'], ANG = { U: 0, V: -120, W: 120 };
  var NEXT = { U: ['V', 'W'], V: ['W', 'U'], W: ['U', 'V'] };
  var uP = { U: pol(VP, 0), V: pol(VP, -120), W: pol(VP, 120) };
  var A1 = pol(1, 120), A2 = pol(1, 240);
  var COL = { U: 'var(--sc-u)', V: 'var(--sc-v)', W: 'var(--sc-w)' };
  function $(id) { return document.getElementById('sc-' + id); }
  if (!$('diagram')) return;

  var st = { mode: 'single', Sn: 100, S3: 40, S1: 20, pair: 'UW', shared: 'U', share: 60, w: [40, 30, 30], limit: 15, x2: 0.15 };
  var BUS = { U: 70, V: 110, W: 150 }, TAP = { U: 150, V: 170, W: 190 }, BOXT = 200, BOXB = 248;

  function lineLoad(X, Y, S) { var v = sub(uP[X], uP[Y]); var m = abs(v); return sc(v, S * 1000 / (m * m)); }

  function build(mode, o) {
    o = Object.assign({}, st, o || {});
    var S1 = o.S1, drops = [], boxes = [], loads = [], extra = [], parts = null;
    if (mode === 'single') {
      var X = o.pair[0], Y = o.pair[1], I = lineLoad(X, Y, S1);
      drops = [{ ph: X, x: 390, I: I }, { ph: Y, x: 450, I: sc(I, -1) }];
      boxes = [{ x0: 365, x1: 475, t: '単相Tr ' + X + '–' + Y }];
      loads = [{ x0: 372, x1: 468, S: S1, t: '単相負荷' }];
      extra.push({ kind: 'sec', d: 'M420 248V270' });
    } else if (mode === 'two') {
      var sa = S1 * o.share / 100, sb = S1 - sa; parts = [sa, sb];
      var ia = lineLoad('U', 'V', sa), ib = lineLoad('V', 'W', sb);
      drops = [{ ph: 'U', x: 310, I: ia }, { ph: 'V', x: 370, I: sc(ia, -1) }, { ph: 'V', x: 480, I: ib }, { ph: 'W', x: 540, I: sc(ib, -1) }];
      boxes = [{ x0: 290, x1: 390, t: '単相Tr U–V' }, { x0: 460, x1: 560, t: '単相Tr V–W' }];
      loads = [{ x0: 292, x1: 388, S: sa, t: 'U–Vの負荷' }, { x0: 462, x1: 558, S: sb, t: 'V–Wの負荷' }];
      extra.push({ kind: 'sec', d: 'M340 248V270M510 248V270' });
    } else if (mode === 'iv') {
      var Xs = o.shared, Ys = NEXT[Xs][0], Zs = NEXT[Xs][1];
      var vout = add(sub(uP[Ys], uP[Xs]), sub(uP[Zs], uP[Xs]));
      var Ii = sc(vout, S1 * 1000 / Math.pow(abs(vout), 2));
      drops = [{ ph: Ys, x: 320, I: Ii }, { ph: Xs, x: 435, I: sc(Ii, -2), branch: true }, { ph: Zs, x: 550, I: Ii }];
      boxes = [{ x0: 300, x1: 400, t: '単相Tr ' + Ys + '–' + Xs }, { x0: 470, x1: 570, t: '単相Tr ' + Xs + '–' + Zs }];
      loads = [{ x0: 380, x1: 490, S: S1, t: '単相負荷（1回路）', sub: '2台の二次は直列' }];
      extra.push({ kind: 'branch', ph: Xs, I: Ii });
      extra.push({ kind: 'sec', d: 'M335 248V262H395V270M535 248V262H475V270' });
      extra.push({ kind: 'sec', d: 'M365 248V256H505V248' });
      parts = { X: Xs, Y: Ys, Z: Zs };
    } else if (mode === 'scott') {
      var SM = S1 * o.share / 100, ST = S1 - SM; parts = [SM, ST];
      var vM = sub(uP.U, uP.W), vT = sub(uP.V, sc(add(uP.U, uP.W), 0.5));
      var iM = sc(vM, SM * 1000 / Math.pow(abs(vM), 2)), iT = sc(vT, ST * 1000 / Math.pow(abs(vT), 2));
      drops = [{ ph: 'U', x: 350, I: sub(iM, sc(iT, 0.5)) }, { ph: 'W', x: 430, I: sub(sc(iM, -1), sc(iT, 0.5)) }, { ph: 'V', x: 540, I: iT }];
      boxes = [{ x0: 328, x1: 452, t: 'M座（主座）' }, { x0: 502, x1: 592, t: 'T座 √3/2' }];
      loads = [{ x0: 342, x1: 438, S: SM, t: 'M座の負荷' }, { x0: 499, x1: 595, S: ST, t: 'T座の負荷' }];
      extra.push({ kind: 'owire', I: iT });
      extra.push({ kind: 'sec', d: 'M390 248V270M547 248V270' });
    } else {
      var w = o.w, tot = (w[0] + w[1] + w[2]) || 1, s = w.map(function (x) { return S1 * x / tot; }); parts = s;
      var a = lineLoad('U', 'V', s[0]), b = lineLoad('V', 'W', s[1]), c = lineLoad('W', 'U', s[2]);
      drops = [{ ph: 'U', x: 300, I: a }, { ph: 'V', x: 340, I: sc(a, -1) }, { ph: 'V', x: 405, I: b }, { ph: 'W', x: 445, I: sc(b, -1) }, { ph: 'W', x: 510, I: c }, { ph: 'U', x: 550, I: sc(c, -1) }];
      boxes = [{ x0: 282, x1: 358, t: 'U–V' }, { x0: 387, x1: 463, t: 'V–W' }, { x0: 492, x1: 568, t: 'W–U' }];
      loads = [{ x0: 272, x1: 368, S: s[0], t: 'U–Vの負荷' }, { x0: 377, x1: 473, S: s[1], t: 'V–Wの負荷' }, { x0: 482, x1: 578, S: s[2], t: 'W–Uの負荷' }];
      extra.push({ kind: 'sec', d: 'M320 248V270M425 248V270M530 248V270' });
    }
    var In = o.Sn * 1000 / (Math.sqrt(3) * V), I3 = o.S3 * 1000 / (Math.sqrt(3) * V);
    var mot = {}, tr = {}, totI = {}, pct = {};
    PH.forEach(function (p) {
      mot[p] = pol(I3, ANG[p] - PHI3);
      tr[p] = drops.filter(function (d) { return d.ph === p; }).reduce(function (acc, d) { return add(acc, d.I); }, ZERO);
      totI[p] = add(mot[p], tr[p]); pct[p] = abs(totI[p]) / In * 100;
    });
    var I1 = sc(add(add(totI.U, mul(A1, totI.V)), mul(A2, totI.W)), 1 / 3);
    var I2 = sc(add(add(totI.U, mul(A2, totI.V)), mul(A1, totI.W)), 1 / 3);
    var i1 = abs(I1) / In * 100, i2 = abs(I2) / In * 100, vu = o.x2 * i2;
    var maxP = 'U'; PH.forEach(function (p) { if (pct[p] > pct[maxP]) maxP = p; });
    return { mode: mode, drops: drops, boxes: boxes, loads: loads, extra: extra, parts: parts, In: In, mot: mot, tr: tr, tot: totI, pct: pct, i1: i1, i2: i2, vu: vu, maxP: maxP, maxLine: pct[maxP], motor: 2 * vu * vu };
  }

  function maxS1(mode, o) {
    function ok(S) { var r = build(mode, Object.assign({}, o, { S1: S })); return r.i2 <= st.limit + 1e-9 && r.maxLine <= 100 + 1e-9; }
    if (!ok(0)) return 0;
    var lo = 0, hi = st.Sn * 3; if (ok(hi)) return hi;
    for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; }
    return lo;
  }
  function ratioText(r) {
    var m = PH.map(function (p) { return abs(r.tr[p]); }), mx = Math.max.apply(null, m);
    if (mx < 1e-9) return '0 : 0 : 0';
    var nz = m.filter(function (x) { return x > mx * 0.01; }), mn = Math.min.apply(null, nz);
    return m.map(function (x) { if (x < mx * 0.01) return '0'; var q = x / mn; return Math.abs(q - Math.round(q)) < 0.05 ? String(Math.round(q)) : q.toFixed(2); }).join(' : ');
  }

  /* 結線図 */
  function width(p) { return (1.6 + 7.5 * Math.min(p, 1.6) / 1.6).toFixed(1); }
  function wire(x1, y1, x2, y2, ph, I, In) {
    var p = abs(I) / In;
    if (p < 0.004) return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:var(--sc-line)" stroke-width="1.6" stroke-dasharray="4 4"/>';
    var w = width(p), dur = Math.min(6, Math.max(0.35, 1.1 / p)).toFixed(2);
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:' + COL[ph] + '" stroke-width="' + w + '" stroke-linecap="round"/>' +
      '<line class="flow" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" style="stroke:var(--sc-panel2);animation-duration:' + dur + 's" stroke-width="' + Math.max(1, w * 0.42).toFixed(1) + '" stroke-dasharray="3 14" stroke-linecap="round"/>';
  }
  function dot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3.4" style="fill:var(--sc-ink)"/>'; }
  function drawDiagram(r) {
    var s = '<svg data-uv-zoom="off" viewBox="0 0 610 332" role="img" aria-label="発電機と変圧器の結線図">';
    PH.forEach(function (p) {
      var y = BUS[p];
      s += wire(84, y, TAP[p], y, p, r.tot[p], r.In);
      var ds = r.drops.filter(function (d) { return d.ph === p; }).sort(function (a, b) { return a.x - b.x; });
      if (!ds.length) {
        s += wire(TAP[p], y, 600, y, p, ZERO, r.In);
        s += '<text x="598" y="' + (y - 7) + '" text-anchor="end" font-size="11" class="m">' + p + '相：変圧器の電流 0A（遊んでいる）</text>';
      } else {
        var prev = TAP[p];
        ds.forEach(function (d, i) { var down = ds.slice(i).reduce(function (acc, b) { return add(acc, b.I); }, ZERO); s += wire(prev, y, d.x, y, p, down, r.In); prev = d.x; });
      }
    });
    PH.forEach(function (p) { s += wire(TAP[p], BUS[p], TAP[p], 252, p, r.mot[p], r.In); });
    s += '<circle cx="170" cy="274" r="23" style="fill:var(--sc-panel);stroke:var(--sc-ink)" stroke-width="1.5"/><text x="170" y="280" text-anchor="middle" font-size="17" font-weight="700">M</text>';
    s += '<text x="170" y="318" text-anchor="middle" font-size="11.5">三相負荷 <tspan class="mono">' + st.S3.toFixed(0) + 'kVA</tspan></text>';
    r.drops.forEach(function (d) { s += wire(d.x, BUS[d.ph], d.x, d.branch ? 186 : BOXT, d.ph, d.I, r.In); });
    r.extra.forEach(function (e) {
      if (e.kind === 'branch') {
        s += wire(380, 186, 435, 186, e.ph, e.I, r.In) + wire(435, 186, 490, 186, e.ph, e.I, r.In);
        s += wire(380, 186, 380, BOXT, e.ph, e.I, r.In) + wire(490, 186, 490, BOXT, e.ph, e.I, r.In);
        s += '<text x="435" y="180" text-anchor="middle" font-size="10" class="m">共通の相 ' + e.ph + '（2台分）</text>';
      }
      if (e.kind === 'owire') s += '<line x1="452" y1="232" x2="502" y2="232" style="stroke:var(--sc-v)" stroke-width="' + width(abs(e.I) / r.In) + '" stroke-linecap="round"/><text x="477" y="225" text-anchor="middle" font-size="10" class="m">中点O</text>';
    });
    PH.forEach(function (p) { s += dot(TAP[p], BUS[p]); });
    r.drops.forEach(function (d) { s += dot(d.x, BUS[d.ph]); });
    r.boxes.forEach(function (b) {
      var c = (b.x0 + b.x1) / 2;
      s += '<rect x="' + b.x0 + '" y="' + BOXT + '" width="' + (b.x1 - b.x0) + '" height="' + (BOXB - BOXT) + '" rx="6" style="fill:var(--sc-panel);stroke:var(--sc-ink)" stroke-width="1.4"/>';
      s += '<text x="' + c + '" y="' + (BOXT + 15) + '" text-anchor="middle" font-size="11" font-weight="700">' + b.t + '</text>';
      s += '<circle cx="' + (c - 6) + '" cy="' + (BOXT + 33) + '" r="8" style="fill:none;stroke:var(--sc-ink)" stroke-width="1.3"/><circle cx="' + (c + 6) + '" cy="' + (BOXT + 33) + '" r="8" style="fill:none;stroke:var(--sc-ink)" stroke-width="1.3"/>';
    });
    r.extra.forEach(function (e) { if (e.kind === 'sec') s += '<path d="' + e.d + '" style="fill:none;stroke:var(--sc-muted)" stroke-width="2"/>'; });
    r.loads.forEach(function (l) {
      var x0 = l.x0, w = l.x1 - l.x0;
      s += '<rect x="' + x0 + '" y="270" width="' + w + '" height="44" rx="6" style="fill:var(--sc-panel);stroke:var(--sc-line)" stroke-width="1"/>';
      s += '<circle cx="' + (x0 + 14) + '" cy="292" r="7" style="fill:none;stroke:var(--sc-ink)" stroke-width="1.2"/><path d="M' + (x0 + 9) + ' 287 L' + (x0 + 19) + ' 297 M' + (x0 + 19) + ' 287 L' + (x0 + 9) + ' 297" style="stroke:var(--sc-ink)" stroke-width="1.2"/>';
      s += '<text x="' + (x0 + 26) + '" y="287" font-size="10.5">' + l.t + '</text><text x="' + (x0 + 26) + '" y="305" font-size="12" font-weight="600" class="mono">' + l.S.toFixed(1) + 'kVA</text>';
      if (l.sub) s += '<text x="' + (x0 + w / 2) + '" y="327" text-anchor="middle" font-size="10" class="m">' + l.sub + '</text>';
    });
    s += '<circle cx="44" cy="110" r="30" style="fill:var(--sc-panel);stroke:var(--sc-ink)" stroke-width="1.6"/><text x="44" y="117" text-anchor="middle" font-size="20" font-weight="700">G</text>';
    PH.forEach(function (p) { s += '<line x1="' + (p === 'V' ? 74 : 68) + '" y1="' + (p === 'U' ? 95 : p === 'V' ? 110 : 125) + '" x2="84" y2="' + BUS[p] + '" style="stroke:' + COL[p] + '" stroke-width="2.4"/>'; });
    s += '<text x="44" y="162" text-anchor="middle" font-size="11.5">発電機</text><text x="44" y="177" text-anchor="middle" font-size="11.5" class="mono">' + st.Sn + 'kVA</text>';
    PH.forEach(function (p) { s += '<text x="90" y="' + (BUS[p] - 7) + '" font-size="11.5" font-weight="700" style="fill:' + COL[p] + '">' + p + '</text><text x="102" y="' + (BUS[p] - 7) + '" font-size="11" class="mono m">' + abs(r.tot[p]).toFixed(0) + 'A</text>'; });
    return s + '</svg>';
  }

  /* ベクトル（単相負荷ぶん）と波形（線電流） */
  function drawPhasor(r) {
    var c = 120, mags = PH.map(function (p) { return abs(r.tr[p]); }), mx = Math.max.apply(null, mags), R = mx > 1e-9 ? 90 / mx : 0;
    var s = '<line x1="12" y1="' + c + '" x2="228" y2="' + c + '" style="stroke:var(--sc-line)"/><line x1="' + c + '" y1="12" x2="' + c + '" y2="228" style="stroke:var(--sc-line)"/>';
    PH.forEach(function (p) { var a = ANG[p] * Math.PI / 180; s += '<text x="' + (c + 106 * Math.cos(a)).toFixed(1) + '" y="' + (c - 106 * Math.sin(a) + 3).toFixed(1) + '" text-anchor="middle">' + p + '</text>'; });
    var drawn = [];
    PH.forEach(function (p) {
      var I = r.tr[p], x = c + I.re * R, y = c - I.im * R, L = Math.hypot(x - c, y - c);
      if (L < 1) return;
      var same = drawn.filter(function (q) { return Math.abs(q.x - x) < 3 && Math.abs(q.y - y) < 3; });
      var ux = (x - c) / L, uy = (y - c) / L, hx = x - ux * 9, hy = y - uy * 9;
      s += '<line x1="' + c + '" y1="' + c + '" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) + '" style="stroke:' + COL[p] + '" stroke-width="' + (same.length ? 2 : 4) + '"' + (same.length ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>';
      s += '<polygon points="' + x.toFixed(1) + ',' + y.toFixed(1) + ' ' + (hx - uy * 5).toFixed(1) + ',' + (hy + ux * 5).toFixed(1) + ' ' + (hx + uy * 5).toFixed(1) + ',' + (hy - ux * 5).toFixed(1) + '" style="fill:' + COL[p] + '"/>';
      if (same.length) s += '<text x="' + Math.max(40, Math.min(200, x + uy * 16)).toFixed(1) + '" y="' + (y - ux * 16 + 3).toFixed(1) + '" text-anchor="middle" style="fill:var(--sc-ink)">' + same[0].p + '・' + p + ' 同じ向き</text>';
      drawn.push({ x: x, y: y, p: p });
    });
    $('phasor').innerHTML = s + '<text x="10" y="232">単相負荷ぶん（文字＝相電圧の向き）</text>';
  }
  function drawWave(r) {
    var W = 300, mid = 72, mx = Math.max(r.pct.U, r.pct.V, r.pct.W, 100), amp = 58 * 100 / mx;
    var s = '<line x1="0" y1="' + mid + '" x2="' + W + '" y2="' + mid + '" style="stroke:var(--sc-line)"/>';
    s += '<line x1="0" y1="' + (mid - amp).toFixed(1) + '" x2="' + W + '" y2="' + (mid - amp).toFixed(1) + '" style="stroke:var(--sc-line)" stroke-dasharray="3 4"/><line x1="0" y1="' + (mid + amp).toFixed(1) + '" x2="' + W + '" y2="' + (mid + amp).toFixed(1) + '" style="stroke:var(--sc-line)" stroke-dasharray="3 4"/>';
    PH.forEach(function (p) {
      var I = r.tot[p], m = abs(I) / r.In, ph = argd(I) * Math.PI / 180, d = '';
      for (var i = 0; i <= 120; i++) { var x = i / 120 * W, t = i / 120 * 3 * Math.PI; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (mid - amp * m * Math.sin(t + ph)).toFixed(1); }
      s += '<path d="' + d + '" style="fill:none;stroke:' + COL[p] + '" stroke-width="2"/>';
    });
    $('wave').innerHTML = s + '<text x="4" y="144">線電流（三相負荷を含む）・点線＝定格</text>';
  }

  var NAMES = { single: '単相変圧器1台', two: '単相変圧器2台', iv: '逆V結線', scott: 'スコット結線', three: '単相変圧器3台' };
  function f1(x) { return x.toFixed(1); }
  function level(r) {
    if (r.maxLine > 100 + 1e-9) return ['bad', '定格電流を超過'];
    if (r.i2 > st.limit + 1e-9) return ['bad', '逆相電流が許容値を超過'];
    if (r.i2 > st.limit * 0.5) return ['warn', '許容内（余裕は少なめ）'];
    return ['ok', '余裕あり'];
  }
  function story(r) {
    var a = f1(st.S1) + ' ÷ ' + st.Sn;
    if (r.mode === 'single') {
      var X = st.pair[0], Y = st.pair[1], Z = PH.filter(function (p) { return p !== X && p !== Y; })[0];
      return '単相負荷の電流は<b>' + X + '相と' + Y + '相にだけ</b>流れ、' + Z + '相の変圧器側は0Aです。逆相電流は「単相負荷 ÷ 発電機容量」＝ ' + a + ' ＝ <b>' + f1(r.i2) + '%</b>。どの2相につないでも同じです。';
    }
    if (r.mode === 'two') return 'U–V ' + f1(r.parts[0]) + 'kVA、V–W ' + f1(r.parts[1]) + 'kVA。半分ずつにすると、逆相電流は単相変圧器1台の<b>半分</b>まで減りますが、0にはなりません。いまは <b>' + f1(r.i2) + '%</b> です。';
    if (r.mode === 'iv') { var q = r.parts; return '共通の相' + q.X + 'に<b>2倍</b>、' + q.Y + '相と' + q.Z + '相に1倍ずつ、<b>同じ向き</b>の電流が流れます。3本とも流れていますが、逆相電流は ' + a + ' ＝ <b>' + f1(r.i2) + '%</b> で、単相変圧器1台と同じです。'; }
    if (r.mode === 'scott') return 'M座 ' + f1(r.parts[0]) + 'kVA、T座 ' + f1(r.parts[1]) + 'kVA。逆相電流になるのは<b>2つの差の分だけ</b>です：|' + f1(r.parts[0]) + ' − ' + f1(r.parts[1]) + '| ÷ ' + st.Sn + ' ＝ <b>' + f1(r.i2) + '%</b>。「全部T座」は逆V結線（共通相V）と、「全部M座」は単相変圧器1台と同じ電流になります。';
    var s = r.parts;
    return 'U–V ' + f1(s[0]) + '・V–W ' + f1(s[1]) + '・W–U ' + f1(s[2]) + 'kVA。3等分すれば平衡しますが、3つの負荷をそろえる必要があります。いまの逆相電流は <b>' + f1(r.i2) + '%</b> です。';
  }
  function press(sel, attr, val) { document.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false'); }); }
  function inputError() {
    if (!Number.isFinite(st.limit) || st.limit < 1 || st.limit > 50) return '許容逆相電流を1〜50%で入力してください。';
    if (!Number.isFinite(st.x2) || st.x2 < 0.02 || st.x2 > 1) return '逆相リアクタンス x₂ を0.02〜1 puで入力してください。';
    if (st.mode === 'three' && st.S1 > 0 && st.w.every(function (v) { return v === 0; })) return '単相負荷があるため、3台の振り分けを少なくとも1か所で0より大きくしてください。';
    return '';
  }
  function syncControls() {
    $('sn-o').textContent = st.Sn + 'kVA（定格 ' + (st.Sn * 1000 / (Math.sqrt(3) * V)).toFixed(0) + 'A）';
    $('s3-o').textContent = st.S3 + 'kVA';
    $('s1-o').textContent = f1(st.S1) + 'kVA';
    $('pair-o').textContent = st.pair[0] + '–' + st.pair[1] + '間';
    $('shared-o').textContent = st.shared + '相（2倍の電流）';
    if (st.mode === 'scott') { $('share-label').textContent = 'M座とT座への振り分け'; $('share-o').textContent = 'M座 ' + st.share + '% ／ T座 ' + (100 - st.share) + '%'; }
    if (st.mode === 'two') { $('share-label').textContent = '2台への振り分け'; $('share-o').textContent = 'U–V ' + st.share + '% ／ V–W ' + (100 - st.share) + '%'; }
    $('share-all').textContent = st.mode === 'two' ? '全部U–V' : '全部M座';
    $('share-t').textContent = st.mode === 'two' ? '全部V–W' : '全部T座';
    var t = st.w[0] + st.w[1] + st.w[2];
    $('three-o').textContent = t ? st.w.map(function (x) { return Math.round(x / t * 100) + '%'; }).join(' / ') : st.S1 > 0 ? '振り分け未設定' : '単相負荷なし';
    $('pair-box').hidden = st.mode !== 'single';
    $('shared-box').hidden = st.mode !== 'iv';
    $('share-box').hidden = !(st.mode === 'scott' || st.mode === 'two');
    $('three-box').hidden = st.mode !== 'three';
    press('.sc-modes button', 'data-mode', st.mode);
    press('[data-pair]', 'data-pair', st.pair);
    press('[data-shared]', 'data-shared', st.shared);
    press('#sc-share-box .sc-chips button', 'data-v', String(st.share));
  }
  function render() {
    syncControls();
    var err = inputError();
    $('limit').setAttribute('aria-invalid', String(!Number.isFinite(st.limit) || st.limit < 1 || st.limit > 50));
    $('x2').setAttribute('aria-invalid', String(!Number.isFinite(st.x2) || st.x2 < 0.02 || st.x2 > 1));
    var noSplit = st.mode === 'three' && st.S1 > 0 && st.w.every(function (v) { return v === 0; });
    ['w1', 'w2', 'w3'].forEach(function (id) { $(id).setAttribute('aria-invalid', String(noSplit)); });
    $('split-error').textContent = noSplit ? '単相負荷の合計を配分できません。振り分けを設定するか「3等分にする」を押してください。' : '';
    $('assume-error').textContent = ($('limit').getAttribute('aria-invalid') === 'true' || $('x2').getAttribute('aria-invalid') === 'true') ? err : '';
    if (err) {
      $('pill').className = 'sc-pill bad'; $('pill').textContent = '計算できません';
      $('verdict').textContent = err + ' 入力がそろうまで数値・判定を表示しません。';
      $('story').textContent = err;
      ['diagram', 'bars', 'seq', 'phasor', 'wave'].forEach(function (id) { $(id).innerHTML = ''; });
      ['v-i2', 'v-vu', 'v-max', 'v-ratio'].forEach(function (id) { $(id).textContent = '—'; });
      $('v-mot').textContent = '入力条件を確認してください';
      ['m-i2', 'm-vu', 'm-max'].forEach(function (id) { $(id).className = 'sc-metric'; });
      $('cmp').innerHTML = '<tr><td colspan="8">入力条件が不足・範囲外のため、比較計算を停止しています。</td></tr>';
      return;
    }
    var r = build(st.mode);
    $('diagram').innerHTML = drawDiagram(r);
    $('story').innerHTML = story(r);
    var lv = level(r), pill = $('pill');
    pill.className = 'sc-pill ' + lv[0]; pill.textContent = NAMES[st.mode] + '：' + lv[1];
    var vt;
    if (lv[0] === 'bad' && r.maxLine > 100) vt = r.maxP + '相の電流が定格の' + f1(r.maxLine) + '%です。発電機の容量に対して負荷が大きすぎます。';
    else if (lv[0] === 'bad') vt = '逆相電流が許容値（' + st.limit + '%）を超えています。回転子の発熱と電圧の不平衡が問題になります。';
    else if (lv[0] === 'warn') vt = '逆相電流は許容値（' + st.limit + '%）以内ですが、負荷が増えると超えます。';
    else vt = '逆相電流は許容値（' + st.limit + '%）の半分以下です。';
    $('verdict').textContent = vt;
    $('v-i2').innerHTML = f1(r.i2) + '<small>%</small>';
    $('v-vu').innerHTML = f1(r.vu) + '<small>%</small>';
    $('v-mot').textContent = '三相モーターの温度上昇の増え方 +' + f1(r.motor) + '%（目安）';
    $('v-max').innerHTML = f1(r.maxLine) + '<small>% ' + r.maxP + '相</small>';
    $('v-ratio').textContent = ratioText(r);
    $('m-i2').className = 'sc-metric' + (r.i2 > st.limit ? ' hot' : r.i2 > st.limit * 0.5 ? ' mid' : '');
    $('m-max').className = 'sc-metric' + (r.maxLine > 100 ? ' hot' : r.maxLine > 90 ? ' mid' : '');
    $('m-vu').className = 'sc-metric' + (r.vu > 2 ? ' hot' : r.vu > 1 ? ' mid' : '');
    var SCALE = 150;
    $('bars').innerHTML = PH.map(function (p) {
      var v = r.pct[p];
      return '<div class="sc-bar"><span class="lab" style="color:' + COL[p] + '">' + p + '相</span><div class="sc-track" role="img" aria-label="' + p + '相 定格の' + f1(v) + '%"><div class="sc-fill" style="width:' + (Math.min(v, SCALE) / SCALE * 100) + '%;background:' + COL[p] + '"></div><div class="sc-mark" style="left:' + (100 / SCALE * 100) + '%"></div></div><span class="val">' + abs(r.tot[p]).toFixed(0) + 'A</span></div>';
    }).join('');
    var SS = Math.max(120, r.i1 * 1.1);
    $('seq').innerHTML = [['正相', r.i1, 'var(--sc-acc)'], ['逆相', r.i2, r.i2 > st.limit ? 'var(--sc-bad)' : 'var(--sc-warn)']].map(function (x) {
      return '<div class="sc-bar"><span class="lab">' + x[0] + '</span><div class="sc-track" role="img" aria-label="' + x[0] + '分 定格の' + f1(x[1]) + '%"><div class="sc-fill" style="width:' + (Math.min(x[1], SS) / SS * 100) + '%;background:' + x[2] + '"></div>' + (x[0] === '逆相' ? '<div class="sc-mark" style="left:' + (st.limit / SS * 100) + '%"></div>' : '') + '</div><span class="val">' + f1(x[1]) + '%</span></div>';
    }).join('');
    drawPhasor(r); drawWave(r);
    var rows = [
      ['single', { pair: 'UW' }, '単相変圧器1台', '1台', '単相3線 1回路', 'single'],
      ['two', { share: 50 }, '単相変圧器2台', '2台', '単相 2回路', 'two'],
      ['iv', { shared: 'U' }, '逆V結線', '2台', '単相 1回路', 'iv'],
      ['scott', { share: 100 }, 'スコット（全部M座）', 'M座・T座', '2回路のうち1つ', 'scott-m'],
      ['scott', { share: 0 }, 'スコット（全部T座）', 'M座・T座', '2回路のうち1つ', 'scott-t'],
      ['scott', { share: 50 }, 'スコット（半分ずつ）', 'M座・T座', '単相3線 2回路', 'scott'],
      ['three', { w: [1, 1, 1] }, '単相変圧器3台', '3台', '単相 3回路', 'three']
    ];
    var curKey = st.mode === 'scott' ? (st.share === 100 ? 'scott-m' : st.share === 0 ? 'scott-t' : st.share === 50 ? 'scott' : '') : st.mode;
    if (st.mode === 'two' && st.share !== 50) curKey = '';
    if (st.mode === 'three' && !(st.w[0] === st.w[1] && st.w[1] === st.w[2])) curKey = '';
    if (st.mode === 'single' && st.pair !== 'UW') curKey = '';
    if (st.mode === 'iv' && st.shared !== 'U') curKey = '';
    $('cmp').innerHTML = rows.map(function (row) {
      var x = build(row[0], row[1]), mx = maxS1(row[0], row[1]);
      var tag = x.i2 > st.limit ? ['bad', '超過'] : x.i2 > st.limit * 0.5 ? ['warn', '注意'] : ['ok', 'OK'];
      return '<tr class="' + (row[5] === curKey ? 'cur' : '') + '"><td><b>' + row[2] + '</b></td><td>' + row[3] + '</td><td>' + row[4] + '</td><td class="n">' + ratioText(x) + '</td><td class="n">' + f1(x.i2) + '% <span class="sc-tag ' + tag[0] + '">' + tag[1] + '</span></td><td class="n">約' + f1(x.vu) + '%</td><td class="n">' + f1(x.maxLine) + '%（' + x.maxP + '相）</td><td class="n">' + (mx >= st.Sn * 3 - 1e-6 ? '—' : f1(mx) + 'kVA') + '</td></tr>';
    }).join('');
  }

  function syncLimits() {
    $('s3').max = st.Sn; $('s1').max = Math.max(10, st.Sn);
    if (st.S3 > st.Sn) { st.S3 = st.Sn; $('s3').value = st.S3; }
    if (st.S1 > st.Sn) { st.S1 = st.Sn; $('s1').value = st.S1; }
  }
  function on(id, ev, fn) { $(id).addEventListener(ev, fn); }
  function setShare(v) { st.share = v; $('share').value = v; render(); }
  $('share-even').setAttribute('data-v', '50'); $('share-all').setAttribute('data-v', '100'); $('share-t').setAttribute('data-v', '0');
  on('sn', 'input', function (e) { st.Sn = +e.target.value; syncLimits(); render(); });
  on('s3', 'input', function (e) { st.S3 = +e.target.value; render(); });
  on('s1', 'input', function (e) { st.S1 = +e.target.value; render(); });
  on('share', 'input', function (e) { st.share = +e.target.value; render(); });
  ['w1', 'w2', 'w3'].forEach(function (id, i) { on(id, 'input', function (e) { st.w[i] = +e.target.value; render(); }); });
  on('share-even', 'click', function () { setShare(50); });
  on('share-all', 'click', function () { setShare(100); });
  on('share-t', 'click', function () { setShare(0); });
  on('three-even', 'click', function () { st.w = [50, 50, 50]; ['w1', 'w2', 'w3'].forEach(function (id) { $(id).value = 50; }); render(); });
  on('limit', 'input', function (e) { st.limit = e.target.valueAsNumber; render(); });
  on('x2', 'input', function (e) { st.x2 = e.target.valueAsNumber; render(); });
  document.querySelectorAll('[data-pair]').forEach(function (b) { b.addEventListener('click', function () { st.pair = b.dataset.pair; render(); }); });
  document.querySelectorAll('[data-shared]').forEach(function (b) { b.addEventListener('click', function () { st.shared = b.dataset.shared; render(); }); });
  document.querySelectorAll('.sc-modes button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.mode !== st.mode && (b.dataset.mode === 'two' || b.dataset.mode === 'scott')) { st.share = b.dataset.mode === 'two' ? 50 : 60; $('share').value = st.share; }
      st.mode = b.dataset.mode; render();
    });
  });
  syncLimits(); render();
})();
