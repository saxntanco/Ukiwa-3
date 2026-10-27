/* 油入変圧器（参考：日立産機システム トップランナー油入変圧器 三相 6.6kV/210V 100kVA SOU-YDCR3、カタログ ST-147U 2018年3月）
   資料で確かめたこと：形式（75〜500kVA は SOU-YDCR3）、一次6,600V・二次210V、一次タップ電圧 F6750-R6600-F6450-F6300-6150、
   300kVA以下は外部操作タップ切換器がオプション（標準は内部で切り換える）、一次・二次端子ボルトと接地端子は標準、
   75kVA以上は排油弁・中身つり耳・高圧端子カバーが標準、100kVA の外形 X710・Y495・Z960mm、総質量445kg、油量91L。
   鉄心の材質と形、巻線の配置、タンクの放熱の形、結線は資料で確かめられていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var PX = { U: -1.7, V: 0, W: 1.7 }, PH = ['U', 'V', 'W'];
  var TK = { x: 3.0, z: 1.65, y0: 0.45, y1: 6.6 };
  var CU = 0xc9874a, POR = 0x8d8f8a, STEEL = 0x7f8a90, PAPER = 0xd8c9a3;
  var YC = 3.2;                        /* 巻線の中心の高さ */
  var TAPS = ['F6750', 'R6600', 'F6450', 'F6300', '6150'];
  var parts = {
    tank: { name: 'タンク（波形の放熱面）', role: '鉄心・巻線と絶縁油を収める鋼板の箱。表面の波形のひだで、油の熱を外気へ逃がす。', links: ['oil', 'base', 'gnd'], ev: 'unk', note: '外形 X710・Y495・Z960mm（100kVA、カタログ p.7）に比を合わせた。波形タンクか放熱器かは資料で確かめられておらず、一般的な波形で描いた。' },
    cover: { name: '上ぶた・中身つり耳', role: 'タンクを閉じるふた。中身（鉄心と巻線）をつり上げる金具が付く。', links: ['tank', 'hvb', 'lvb'], ev: 'doc', note: '中身つり耳は75kVA以上で標準（カタログ p.14）。形・位置は模式。' },
    hvb: { name: '一次端子（高圧ブッシング U・V・W）', role: '6.6kVの電線をつなぐ端子。磁器のひだで、タンク（接地）との沿面距離をかせぐ。', links: ['hvw', 'cover'], ev: 'simp', note: '一次端子ボルトは標準（カタログ p.14）。高圧端子カバーは75kVA以上で標準だが、図では外して描いた。並び・高さは模式。' },
    lvb: { name: '二次端子（低圧ブッシング u・v・w）', role: '210Vの負荷側をつなぐ端子。電流が大きいので太い銅帯でつなぐ。', links: ['lvw', 'cover'], ev: 'simp', note: '二次端子ボルトは標準（カタログ p.14）。端子の数・並びは二次端子図（S2）と未照合。' },
    base: { name: '台座（ベース）', role: '変圧器を床に据えて、耐震ボルトで固定する。', links: ['tank'], ev: 'simp', note: '形は模式。' },
    drain: { name: '排油弁', role: '絶縁油を抜いたり、試験用に油を採ったりする弁。', links: ['oil'], ev: 'doc', note: '75kVA以上で標準（カタログ p.2・p.14）。位置は模式。' },
    gnd: { name: '接地端子', role: 'タンク（外箱）を接地する端子。', links: ['tank'], ev: 'doc', note: '標準付属（カタログ p.14）。位置は模式。' },
    plate: { name: '銘板', role: '形式・容量・電圧・タップ・結線・製造年などが書いてある。結線やタップは銘板で確かめる。', links: ['tank'], ev: 'simp', note: '位置は模式。' },
    oil: { name: '絶縁油', role: '巻線の絶縁を助け、熱をタンクへ運ぶ。', links: ['tank', 'hvw', 'core'], ev: 'doc', note: '油量91L（100kVA、カタログ p.7）。油の種類は未確認。' },
    core: { name: '鉄心（3脚・模式）', role: '磁束の通り道。一次巻線がつくる磁束が、二次巻線を貫いて電圧を生む。', links: ['hvw', 'lvw', 'clamp'], ev: 'unk', note: '3脚の内鉄形で描いた。鉄心の材質（けい素鋼板・アモルファス）と形（積鉄心・巻鉄心）は、この形式について資料で確かめられていない。' },
    clamp: { name: '鉄心締付金具', role: '鉄心を上下から締めて、中身を一体にする金具。', links: ['core'], ev: 'unk', note: '一般的な形の模式。' },
    lvw: { name: '二次巻線（低圧・内側）', role: '巻数の少ない太い巻線。鉄心の磁束で210Vが生まれ、負荷へ電流を流す。', links: ['core', 'lvb', 'hvw'], ev: 'unk', note: '低圧を内側に置く一般的な配置で描いた。この形式の配置・材質は未確認。' },
    hvw: { name: '一次巻線（高圧・外側）', role: '巻数の多い細い巻線。途中にタップを出して、巻数を変えられる。', links: ['core', 'hvb', 'tap', 'lvw'], ev: 'unk', note: '高圧を外側に置く一般的な配置で描いた。結線（Δなど）は銘板で確かめる。' },
    tap: { name: 'タップ切換部（内部）', role: '一次巻線の巻数を切り換えて、二次電圧を合わせる。F6750・R6600・F6450・F6300・6150。必ず停電してから切り換える。', links: ['hvw'], ev: 'doc', note: 'タップ電圧はカタログ p.5。300kVA以下は外部操作タップ切換器がオプション（p.14）なので、標準品では内部で切り換えると読んだ。板の形・位置は模式。' }
  };
  function fins(G, z, sgn) {
    for (var x = -2.7; x <= 2.71; x += 0.3) G.box(0.05, 5.0, 0.55, x, 3.6, z + sgn * 0.27, 0x8b969c, { part: 'tank', shell: true, shellAlpha: 0.1 });
  }
  function bushHV(G, x, z, live) {
    G.cyl(0.22, 0.2, x, TK.y1 + 0.2, z, STEEL, 'y', { part: 'hvb' }, { seg: 14 });
    G.cyl(0.18, 1.6, x, TK.y1 + 1.1, z, POR, 'y', { part: 'hvb' }, { seg: 14 });
    for (var i = 0; i < 4; i++) G.cyl(0.32, 0.06, x, TK.y1 + 0.55 + i * 0.32, z, POR, 'y', { part: 'hvb' }, { seg: 16 });
    G.cyl(0.07, 0.5, x, TK.y1 + 2.1, z, 0xb8b8b4, 'y', { part: 'hvb', cond: 'hv' }, { seg: 10 });
    G.cyl(0.14, 0.08, x, TK.y1 + 2.15, z, 0xb8b8b4, 'y', { part: 'hvb', cond: 'hv' }, { seg: 10 });
  }
  function bushLV(G, x, z) {
    G.cyl(0.24, 0.2, x, TK.y1 + 0.2, z, STEEL, 'y', { part: 'lvb' }, { seg: 14 });
    G.cyl(0.2, 0.7, x, TK.y1 + 0.6, z, POR, 'y', { part: 'lvb' }, { seg: 14 });
    G.cyl(0.1, 0.5, x, TK.y1 + 1.15, z, CU, 'y', { part: 'lvb', cond: 'lv' }, { seg: 10 });
    G.box(0.5, 0.08, 0.3, x, TK.y1 + 1.35, z + 0.1, CU, { part: 'lvb', cond: 'lv' });
  }
  function build(G, st, mode) {
    var shell = { part: 'tank', shell: true, shellAlpha: 0.14 };
    /* 台座 */
    [-1.2, 1.2].forEach(function (z) { G.box(6.4, 0.45, 0.4, 0, 0.22, z, 0x4f565b, { part: 'base' }); });
    /* タンク（本体）と波形のひだ */
    G.box(TK.x * 2, TK.y1 - TK.y0, TK.z * 2, 0, (TK.y0 + TK.y1) / 2, 0, STEEL, shell);
    fins(G, TK.z, 1); fins(G, -TK.z, -1);
    /* 上ぶた・つり耳 */
    G.box(TK.x * 2 + 0.3, 0.12, TK.z * 2 + 0.3, 0, TK.y1 + 0.06, 0, 0x6f7a80, { part: 'cover' });
    [[-2.9, -1.5], [2.9, -1.5], [-2.9, 1.5], [2.9, 1.5]].forEach(function (p) {
      G.box(0.1, 0.45, 0.35, p[0] + (p[0] > 0 ? 0.25 : -0.25), TK.y1 - 0.1, p[1], 0x6f7a80, { part: 'cover' });
    });
    /* 銘板・排油弁・接地端子 */
    G.box(0.04, 0.9, 1.2, -TK.x - 0.02, 4.6, 0, 0xededea, { part: 'plate', layer: 'ext-only' });
    G.cyl(0.13, 0.35, TK.x + 0.17, 0.95, 0.6, 0x9aa1a7, 'x', { part: 'drain' }, { seg: 12 });
    G.box(0.18, 0.22, 0.18, TK.x + 0.4, 0.95, 0.6, 0xc0392b, { part: 'drain' });
    G.cyl(0.08, 0.25, TK.x + 0.12, 0.6, -0.9, 0xb8b8b4, 'x', { part: 'gnd' }, { seg: 10 });
    /* ブッシング */
    PH.forEach(function (ph) { bushHV(G, PX[ph], -0.75); bushLV(G, PX[ph] * 0.9, 0.95); });
    /* ---------- 中（絶縁油・鉄心・巻線・タップ） ---------- */
    G.box(TK.x * 2 - 0.2, TK.y1 - TK.y0 - 0.5, TK.z * 2 - 0.2, 0, (TK.y0 + TK.y1) / 2 - 0.2, 0, 0xd9a93a, { part: 'oil', layer: 'int', alpha: 0.12, nopick: true });
    /* 鉄心：3脚と上下のヨーク */
    PH.forEach(function (ph) { G.box(0.9, 3.8, 0.9, PX[ph], YC, 0, 0x5e6266, { part: 'core', layer: 'int' }); });
    G.box(4.3, 0.8, 0.9, 0, YC + 2.3, 0, 0x5e6266, { part: 'core', layer: 'int' });
    G.box(4.3, 0.8, 0.9, 0, YC - 2.3, 0, 0x5e6266, { part: 'core', layer: 'int' });
    [-0.55, 0.55].forEach(function (z) {
      G.box(4.7, 0.25, 0.12, 0, YC + 2.3, z, 0x3f4a55, { part: 'clamp', layer: 'int' });
      G.box(4.7, 0.25, 0.12, 0, YC - 2.3, z, 0x3f4a55, { part: 'clamp', layer: 'int' });
    });
    /* 巻線：内側に低圧、外側に高圧 */
    PH.forEach(function (ph) {
      var x = PX[ph];
      G.cyl(0.7, 3.2, x, YC, 0, CU, 'y', { part: 'lvw', layer: 'int', cond: 'lv' }, { seg: 18 });
      G.cyl(0.78, 3.0, x, YC, 0, PAPER, 'y', { part: 'lvw', layer: 'int', alpha: 0.35, nopick: true }, { seg: 18, open: true });
      G.cyl(1.05, 3.4, x, YC, 0, 0x9c6b3c, 'y', { part: 'hvw', layer: 'int', cond: 'hv', shell: true, shellAlpha: 0.32 }, { seg: 20 });
      G.helix([x, YC, 0], 'y', 1.08, 3.2, 16, 0x7a4a24, 1.2, { part: 'hvw', layer: 'int' });
      /* 一次の引出線（上の端 → 高圧ブッシング） */
      G.wire([[x, YC + 1.7, -0.85], [x, YC + 2.9, -0.8], [x, TK.y1, -0.75]], 0xd85a30, 2.2, { part: 'hvw', layer: 'int', cond: 'hv' });
      /* タップ引出線（巻線の途中 → タップ板） */
      G.wire([[x + 0.6, YC + 0.3, -0.85], [x + 0.9, YC + 1.6, -1.3], [2.35, 5.85, -1.3]], 0x7a4a24, 1.4, { part: 'tap', layer: 'int' });
      /* 二次の引出線（太い銅帯 → 低圧ブッシング） */
      G.rod([x * 0.9 + 0.1, YC + 1.6, 0.75], [x * 0.9, TK.y1, 0.95], 0.06, CU, { part: 'lvw', layer: 'int', cond: 'lv' }, 4);
    });
    /* Δ結線の渡り線（模式） */
    G.wire([[PX.U + 0.5, YC - 1.7, -0.9], [PX.U + 0.9, YC - 2.0, -1.2], [PX.V - 0.3, YC + 1.75, -1.2], [PX.V, YC + 1.7, -0.85]], 0xd85a30, 1.4, { part: 'hvw', layer: 'int' });
    /* タップ板 */
    G.box(0.9, 0.9, 0.08, 2.35, 5.85, -1.32, 0xe9dfc8, { part: 'tap', layer: 'int' });
    var ti = TAPS.indexOf(st.tap || 'R6600');
    for (var k = 0; k < 5; k++) G.cyl(0.05, 0.1, 2.0 + k * 0.17, 5.95, -1.26, k === ti ? 0xc0392b : 0xb8b8b4, 'z', { part: 'tap', layer: 'int' }, { seg: 8 });
    G.rod([2.0 + ti * 0.17, 5.95, -1.2], [2.35, 5.6, -1.2], 0.03, 0xc0392b, { part: 'tap', layer: 'int' }, 6);
    /* ---------- 動作：磁束と電流 ---------- */
    if (mode === 'ext') return;
    if (st.hv) {
      var fl = function (xa, xb) { return [[xa, YC - 1.6, 0.48], [xa, YC + 1.6, 0.48], [xa, YC + 2.3, 0.48], [(xa + xb) / 2, YC + 2.3, 0.48], [xb, YC + 2.3, 0.48], [xb, YC + 1.6, 0.48], [xb, YC - 1.6, 0.48], [xb, YC - 2.3, 0.48], [(xa + xb) / 2, YC - 2.3, 0.48], [xa, YC - 2.3, 0.48]]; };
      G.flux(fl(PX.U, PX.V), { speed: 0.5, w: 2.4, m: { part: 'core', layer: 'int' } });
      G.flux(fl(PX.W, PX.V), { speed: 0.5, w: 2.4, m: { part: 'core', layer: 'int' } });
      /* 一次電流（U相の巻線を例に）：U端子 → 巻線 → 渡り線 → V端子 */
      var hv = [[PX.U, TK.y1 + 2.0, -0.75], [PX.U, TK.y1, -0.75], [PX.U, YC + 1.7, -0.95]];
      for (var t = 0; t <= 12; t++) { var a = t / 12 * Math.PI * 6; hv.push([PX.U + 1.12 * Math.sin(a), YC + 1.6 - t * 0.27, 1.12 * Math.cos(a) * -1]); }
      hv = hv.concat([[PX.U + 0.9, YC - 2.0, -1.2], [PX.V - 0.3, YC + 1.75, -1.2], [PX.V, YC + 1.7, -0.85], [PX.V, TK.y1, -0.75], [PX.V, TK.y1 + 2.0, -0.75]]);
      G.flow(hv, { speed: st.load ? 0.6 : 0.2, n: st.load ? undefined : 6, m: { part: 'hvw', layer: 'int' } });
      if (st.load) PH.forEach(function (ph) {
        var x = PX[ph];
        G.flow([[x * 0.9 + 0.1, YC + 1.6, 0.75], [x * 0.9, TK.y1, 0.95], [x * 0.9, TK.y1 + 1.35, 1.05], [x * 0.9, TK.y1 + 1.4, 2.4]], { speed: 0.9, m: { part: 'lvw', layer: 'int' } });
      });
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !st.hv || !m.cond) return null;
    if (m.cond === 'hv') return { c: [240, 153, 123], k: 0.55 };
    if (m.cond === 'lv') return { c: [250, 199, 117], k: 0.5 };
    return null;
  }
  var labels = [
    { part: 'hvb', t: '一次端子 U・V・W（6.6kV）', p: [0, TK.y1 + 2.6, -0.75] },
    { part: 'lvb', t: '二次端子 u・v・w（210V）', p: [1.0, TK.y1 + 1.75, 1.2] },
    { part: 'tank', t: 'タンク（波形のひだ）', p: [-1.5, 2.0, TK.z + 0.6], layer: 'ext-only' },
    { part: 'cover', t: '中身つり耳', p: [3.4, TK.y1 + 0.3, 1.5], layer: 'ext-only' },
    { part: 'drain', t: '排油弁', p: [TK.x + 0.7, 0.6, 0.6] },
    { part: 'gnd', t: '接地端子', p: [TK.x + 0.5, 0.35, -1.2], layer: 'ext-only' },
    { part: 'plate', t: '銘板', p: [-TK.x - 0.3, 5.3, 0], layer: 'ext-only' },
    { part: 'core', t: '鉄心（模式）', p: [0, YC + 2.95, 0.5], layer: 'int' },
    { part: 'hvw', t: '一次巻線（外側）', p: [PX.U - 1.3, YC + 0.8, 0.6], layer: 'int' },
    { part: 'lvw', t: '二次巻線（内側）', p: [PX.W + 1.3, YC - 0.8, 0.6], layer: 'int' },
    { part: 'tap', t: 'タップ板', p: [2.35, 6.25, -1.35], layer: 'int' },
    { part: 'oil', t: '絶縁油', p: [-2.4, 1.2, 1.0], layer: 'int' },
    { t: '磁束（3つの脚とヨークを回る）', p: [0, YC - 3.0, 0.5], layer: 'int', when: function (s, m) { return m === 'op' && s.hv; } }
  ];
  var base = { hv: false, load: false, tap: 'R6600' };
  var scenarios = [
    { name: '電圧をかける（無負荷）', steps: [
      { t: '停電している状態', x: '一次にも二次にも電圧はない。', s: 'ok', st: { hv: false, load: false } },
      { t: '一次に 6.6kV をかける', x: '一次巻線に小さな励磁電流が流れ、鉄心に磁束が回る（青い破線）。その磁束が二次巻線を貫いて、二次に210Vが生まれる。負荷がないので二次電流は流れない。', s: 'ok', st: { hv: true } }
    ] },
    { name: '負荷をつなぐ', steps: [
      { t: '無負荷：励磁電流だけ', x: '一次の粒は少ない（励磁電流だけ）。', s: 'ok', st: { hv: true, load: false } },
      { t: '二次に負荷をつなぐ', x: '二次電流（黄色い粒）が流れる。二次電流は鉄心の磁束を打ち消す向きの起磁力をつくるので、それを補うように一次電流が増える。鉄心の磁束の大きさは、ほぼ変わらない。', s: 'ok', st: { load: true }, hz: '電流の往路だけを描いている。帰路はほかの相と負荷・電源を通る。' }
    ] },
    { name: 'タップを切り換える', steps: [
      { t: 'いまのタップは R6600', x: '一次電圧が6,600Vのとき、二次が210Vになる位置。', s: 'ok', st: { hv: false, load: false, tap: 'R6600' } },
      { t: '停電・検電・接地してから、タップを F6450 へ', x: 'タップは一次巻線の巻数を切り換える。F6450 は、一次の電圧が6,450Vのとき二次が210Vになる位置。巻数が減る。', s: 'warn', st: { tap: 'F6450' }, hz: 'タップは必ず停電して切り換える。標準品は内部で切り換えるので、ふたを開ける作業になる。手順はメーカーの取扱説明書に従う。' },
      { t: '電圧をかけると、二次電圧が少し上がる', x: '一次が6,600Vのままなら、二次は 210V×6,600÷6,450 ≒ 215V（巻数比からの計算で、約2.3%上がる）。受電電圧が低くて二次電圧が足りないときに使う。', s: 'ok', st: { hv: true } }
    ] }
  ];
  function stateList(st) { return [['一次電圧', st.hv ? '6.6kV' : 'なし', false], ['二次電流', st.hv && st.load ? '流れている' : 'なし', false], ['タップ', st.tap || 'R6600', st.tap !== 'R6600']]; }
  function svgUpdate(svg, st) {
    TAPS.forEach(function (t) { var e = svg.querySelector('#tr-tap-' + t); if (e) e.setAttribute('fill', t === (st.tap || 'R6600') ? '#c0392b' : '#fff'); });
    var f = svg.querySelector('#tr-flux'); if (f) f.style.display = st.hv ? '' : 'none';
    var l = svg.querySelector('#tr-load'); if (l) l.style.display = st.hv && st.load ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.tr = {
    title: '油入変圧器', parts: parts, partOrder: ['hvb', 'lvb', 'tank', 'cover', 'plate', 'drain', 'gnd', 'base', 'oil', 'core', 'clamp', 'hvw', 'lvw', 'tap'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#trWire', svgUpdate: svgUpdate,
    view: { yaw: -0.6, pitch: 0.25 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.57, pitch: 0.08 }, top: { label: '上', yaw: -0.2, pitch: 1.25 }, tap: { label: 'タップ板', yaw: -2.6, pitch: 0.35, zoom: 2.2, target: [2.2, 5.7, -1.2] } },
    banner: { ext: ['参考：日立 トップランナー油入変圧器 100kVA', '!外形は寸法比だけ合わせた概形'], int: ['!中は模式：鉄心・巻線の形と配置は資料で未確認'], op: ['!電流の大きさは表していない・往路だけ'], wire: [] }
  };
})();
