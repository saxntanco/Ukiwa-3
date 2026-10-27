/* 断路器（参考：三菱電機 DV形・形番1（DV-1）単極・F–F接続・フック棒操作、カタログ K-K06-5-C1036-L 2013年5月）
   資料で確かめたこと：単極単投・フック棒操作、7.2kV 200・400A、支持金具とエポキシ碍子をV字形に配置、
   単極品はラッチ付きで自然開路しない、F–F 200・400A標準品は開極ストッパー付き（開極角度約90°、80°以上開く）、
   無負荷変圧器の励磁電流・無負荷電路の充電電流は実用上1A以下なら開閉できる、それより大きい電流は負荷開閉器を使う。
   寸法比・接触部の細かな形は外形図の画像と照合できていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var CU = 0xc9874a, SILV = 0xc9cacc, EPX = 0x8a6e4e, STEEL = 0x9aa0a4;
  var HB = [0, 0.55, 1.05], FC = [0, 2.3, 1.05], BL = FC[1] - HB[1];
  var DEG = Math.PI / 180;
  var parts = {
    base: { name: '取付金具（台座）', role: '盤のアングルに取り付ける金具。2本のエポキシ碍子をV字形に支える。接地する。', links: ['ins'], ev: 'doc', note: '支持金具とエポキシ碍子のV字形配置はカタログ p.1。取付はアングル 50×50×6 が適当（p.3 図3-5の注記）。形・寸法比は模式。' },
    ins: { name: 'エポキシ碍子', role: '充電部（接触子・ブレード）を取付金具から絶縁して支える。V字形に開いて置き、小形・軽量にしている。', links: ['base', 'fixed', 'hinge'], ev: 'doc', note: 'V字形配置はカタログ p.1。ひだの数・太さは模式。' },
    fixed: { name: '固定接触子・上側端子', role: '閉じたブレードの先端をはさんで電流を流すところ。前面（F）に電線をつなぐ端子がある。', links: ['blade', 'ins', 'spring'], ev: 'simp', note: 'F–F接続（前面接続）はカタログの形式。接触子の形は模式。' },
    blade: { name: 'ブレード（可動刃）', role: '下の支点を中心に前へ倒れて開く刃。開くと、目で見える切れ目（断路）ができる。', links: ['fixed', 'hinge', 'latch', 'eye'], ev: 'simp', note: '平行2枚の刃として描いた。形・厚さは模式。' },
    hinge: { name: '支点・下側端子', role: 'ブレードが回る支点。開いても閉じても下側端子とつながっている。', links: ['blade', 'ins', 'stopper'], ev: 'simp', note: '下側に支点を置く形は模式（外形図と未照合）。' },
    latch: { name: 'ラッチ（掛け金）', role: '閉じたブレードを固定接触子に掛けておく金具。振動や電磁力で自然に開かないようにする。開くときはフック棒で外す。', links: ['blade', 'eye'], ev: 'doc', note: '単極品はラッチ付き（カタログ p.3）。形は模式。' },
    eye: { name: 'フック穴', role: 'フック棒（断路器操作棒）を掛ける穴。ここを引いてラッチを外し、ブレードを開く。', links: ['blade', 'latch'], ev: 'doc', note: 'フック棒操作はカタログ p.2 表1。形は模式。' },
    stopper: { name: '開極ストッパー', role: '開いたブレードが行き過ぎないように止める。開極角度は約90°で、80°以上開くよう指示がある。', links: ['hinge', 'blade'], ev: 'doc', note: 'F–F 200・400A標準品（カタログ p.3 注3）。位置・形は模式。' },
    spring: { name: '接触ばね（模式）', role: '接触子がブレードをはさむ力をつくる。接触圧が落ちると発熱の原因になる。', links: ['fixed'], ev: 'unk', note: 'DV-1の接触構造はカタログに記述がない（圧縮ばねの説明は600〜1200A器）。一般的な形として模式で描いた。' },
    hook: { name: 'フック棒（操作棒）', role: '離れた位置から断路器を操作する絶縁棒。', links: ['eye'], ev: 'simp', note: '場面の説明用。' }
  };
  function bladePt(h, a, dx) { return [dx, HB[1] + h * Math.cos(a), HB[2] + h * Math.sin(a)]; }
  function ribRod(G, a, b, r, R, n, col, m) {
    G.rod(a, b, r, col, m, 12);
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1), c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      var d = [(b[0] - a[0]) * 0.02, (b[1] - a[1]) * 0.02, (b[2] - a[2]) * 0.02];
      G.rod([c[0] - d[0], c[1] - d[1], c[2] - d[2]], [c[0] + d[0], c[1] + d[1], c[2] + d[2]], R, col, m, 14);
    }
  }
  function build(G, st, mode) {
    var a = (st.open || 0) * 90 * DEG;
    /* 取付金具 */
    G.box(0.6, 2.9, 0.12, 0, 1.42, -0.06, STEEL, { part: 'base' });
    G.box(0.6, 0.5, 0.3, 0, 1.42, 0.12, STEEL, { part: 'base' });
    [[0.2, 0.3], [-0.2, 0.3], [0.2, 2.55], [-0.2, 2.55]].forEach(function (p) { G.cyl(0.05, 0.03, p[0], p[1], 0.005, 0x55595e, 'z', { part: 'base' }, { seg: 10 }); });
    /* V字形のエポキシ碍子 */
    ribRod(G, [0, 1.6, 0.25], [0, 2.22, 0.95], 0.13, 0.2, 4, EPX, { part: 'ins' });
    ribRod(G, [0, 1.24, 0.25], [0, 0.63, 0.95], 0.13, 0.2, 4, EPX, { part: 'ins' });
    /* 固定接触子・上側端子 */
    G.box(0.36, 0.16, 0.22, FC[0], FC[1], FC[2], CU, { part: 'fixed', cond: 'src' });
    G.box(0.08, 0.26, 0.2, 0.14, FC[1] - 0.18, FC[2] + 0.05, CU, { part: 'fixed', cond: 'src' });
    G.box(0.08, 0.26, 0.2, -0.14, FC[1] - 0.18, FC[2] + 0.05, CU, { part: 'fixed', cond: 'src' });
    G.box(0.3, 0.06, 0.42, 0, FC[1] + 0.11, FC[2] + 0.25, CU, { part: 'fixed', cond: 'src' });
    G.cyl(0.05, 0.08, 0, FC[1] + 0.16, FC[2] + 0.32, SILV, 'y', { part: 'fixed' }, { seg: 10 });
    /* 接触ばね（内部・模式） */
    [0.2, -0.2].forEach(function (x) { G.helix([x, FC[1] - 0.18, FC[2] + 0.05], 'x', 0.04, 0.1, 5, 0x2f6fa8, 1.8, { part: 'spring', layer: 'int' }); });
    /* 支点・下側端子・ストッパー */
    G.box(0.36, 0.18, 0.24, HB[0], HB[1], HB[2], CU, { part: 'hinge', cond: 'load' });
    G.cyl(0.045, 0.42, HB[0], HB[1], HB[2], SILV, 'x', { part: 'hinge' }, { seg: 10 });
    G.box(0.3, 0.06, 0.42, 0, HB[1] - 0.12, HB[2] + 0.25, CU, { part: 'hinge', cond: 'load' });
    G.cyl(0.05, 0.08, 0, HB[1] - 0.17, HB[2] + 0.32, SILV, 'y', { part: 'hinge' }, { seg: 10 });
    G.box(0.2, 0.1, 0.08, 0, HB[1] - 0.05, HB[2] + 0.2, 0x55595e, { part: 'stopper' });
    /* ブレード（平行2枚）・ラッチ・フック穴 */
    [-0.1, 0.1].forEach(function (dx) { G.rod(bladePt(0, a, dx), bladePt(BL - 0.02, a, dx), 0.035, CU, { part: 'blade', cond: 'mid' }, 4); });
    G.rod(bladePt(0.4, a, -0.1), bladePt(0.4, a, 0.1), 0.02, SILV, { part: 'blade' }, 6);
    var la = st.latch === false ? 0.35 : 0;
    var lt = bladePt(BL - 0.1, a, 0), lh = [0, Math.cos(a), Math.sin(a)], lf = [0, -Math.sin(a), Math.cos(a)];
    G.rod(lt, [lt[0], lt[1] + lh[1] * 0.22 + lf[1] * (0.06 + la * 0.3), lt[2] + lh[2] * 0.22 + lf[2] * (0.06 + la * 0.3)], 0.025, 0xd9a227, { part: 'latch' }, 6);
    var ec = bladePt(BL + 0.12, a, 0);
    for (var k = 0; k < 10; k++) {
      var t0 = k / 10 * Math.PI * 2, t1 = (k + 1) / 10 * Math.PI * 2;
      var p0 = [0, ec[1] + 0.09 * (Math.cos(t0) * lh[1] + Math.sin(t0) * lf[1]), ec[2] + 0.09 * (Math.cos(t0) * lh[2] + Math.sin(t0) * lf[2])];
      var p1 = [0, ec[1] + 0.09 * (Math.cos(t1) * lh[1] + Math.sin(t1) * lf[1]), ec[2] + 0.09 * (Math.cos(t1) * lh[2] + Math.sin(t1) * lf[2])];
      G.rod(p0, p1, 0.02, 0xb07a3a, { part: 'eye' }, 5);
    }
    /* フック棒（操作の場面だけ） */
    if (mode === 'op' && st.hook) G.rod([0.05, ec[1] - 0.05, ec[2] + 0.1], [0.05, ec[1] - 2.2, ec[2] + 1.6], 0.035, 0xd8b04a, { part: 'hook' }, 6);
    /* アーク（電流が流れたまま開くと） */
    if (st.arc > 0.02) {
      var tip = bladePt(BL - 0.02, a, 0), wig = [];
      for (var i = 0; i <= 8; i++) { var t = i / 8; wig.push([Math.sin(i * 2.1) * 0.05, FC[1] + (tip[1] - FC[1]) * t, FC[2] + 0.05 + (tip[2] - FC[2] - 0.05) * t + Math.cos(i * 1.7) * 0.04]); }
      G.wire(wig, 0xb38cff, 3 + 4 * st.arc, { part: 'blade', nopick: true, zb: 0.2 }, false);
    }
    /* 電流（往路：上側端子 → ブレード → 下側端子。帰路は負荷と電源を通るので、この機器の外） */
    if (mode !== 'ext' && st.cur && (st.open < 0.05 || st.arc > 0.02)) {
      G.flow([[0, FC[1] + 0.16, FC[2] + 0.45], [0, FC[1] + 0.11, FC[2] + 0.1], bladePt(BL - 0.05, a, 0.12), bladePt(0.05, a, 0.12), [0, HB[1] - 0.12, HB[2] + 0.1], [0, HB[1] - 0.17, HB[2] + 0.45]], { col: st.arc > 0.02 ? 'bad' : 'cur', speed: 0.45, m: { part: 'blade' } });
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !st.live || !m.cond) return null;
    var c = [240, 153, 123];
    if (m.cond === 'src') return { c: c, k: 0.6 };
    if (st.open < 0.05 && (m.cond === 'mid' || m.cond === 'load')) return { c: c, k: 0.6 };
    return null;
  }
  var labels = [
    { part: 'fixed', t: '固定接触子・上側端子', p: [0, FC[1] + 0.35, FC[2] + 0.3] },
    { part: 'hinge', t: '支点・下側端子', p: [0, HB[1] - 0.4, HB[2] + 0.3] },
    { part: 'blade', t: 'ブレード', p: [0.25, 1.45, 1.1] },
    { part: 'ins', t: 'エポキシ碍子（V字形）', p: [0, 1.95, 0.45] },
    { part: 'base', t: '取付金具', p: [0, 2.95, -0.06], layer: 'ext-only' },
    { part: 'latch', t: 'ラッチ', p: [-0.3, FC[1] + 0.05, FC[2] + 0.2] },
    { part: 'eye', t: 'フック穴', p: [0.3, FC[1] + 0.25, FC[2] - 0.05] },
    { part: 'stopper', t: '開極ストッパー', p: [0, HB[1] + 0.1, HB[2] + 0.5], layer: 'int' },
    { part: 'spring', t: '接触ばね（模式）', p: [0.4, FC[1] - 0.25, FC[2]], layer: 'int' },
    { t: '見える切れ目', p: [0, FC[1] - 0.25, FC[2] + 0.6], hot: false, when: function (s) { return s.open > 0.9; } },
    { t: 'アーク', p: [0, FC[1] - 0.1, FC[2] + 0.45], hot: true, when: function (s) { return s.arc > 0.3; } }
  ];
  var base = { open: 0, latch: true, cur: false, live: false, arc: 0, hook: false };
  var scenarios = [
    { name: '無負荷で開く（正しい使い方）', steps: [
      { t: '閉：電流が流れている', x: '電流の往路：上側端子 → 固定接触子 → ブレード → 支点 → 下側端子。帰路は負荷と電源を通るので、この機器の外。断路器は、この電流を切るための機器ではない。', s: 'ok', st: { open: 0, latch: true, cur: true, live: true, arc: 0, hook: false } },
      { t: '先に遮断器（VCBなど）で電流を切る', x: '電流はゼロになった。電源側はまだ充電されている（オレンジ）。', s: 'ok', st: { cur: false } },
      { t: 'フック棒をフック穴に掛けて、ラッチを外す', x: 'ラッチは、閉じたブレードが振動や電磁力で開かないように止めている。', s: 'ok', st: { hook: true, latch: false } },
      { t: 'ブレードを開く（約90°、80°以上）', x: '開極ストッパーで止まるまで開く。目で見える切れ目ができる。', s: 'ok', st: { open: 1 } },
      { t: '開：見える切れ目ができた', x: '下側は電源から切り離された。上側（電源側）は充電部のまま。', s: 'ok', st: { hook: false }, hz: '開いても電源側は充電部。作業前は、検電して接地する。' }
    ] },
    { name: '電流が流れたまま開くと', steps: [
      { t: '閉：負荷電流が流れている', x: '遮断器で先に切らずに、断路器を開こうとしている。', s: 'warn', st: { open: 0, latch: true, cur: true, live: true, arc: 0, hook: true } },
      { t: 'ブレードが離れるとアークが出る', x: '断路器には消弧のしくみがないので、電流が流れているとアークが出て、刃と接触子のあいだに残る。', s: 'ng', st: { latch: false, open: 0.35, arc: 1 }, hz: 'カタログは、励磁電流・充電電流で実用上1A以下なら開閉できるとし、それより大きい電流は負荷開閉器を使うよう示している。負荷電流を断路器で切らない。' }
    ] }
  ];
  function stateList(st) { return [['ブレード', st.open > 0.9 ? '開' : (st.open > 0.05 ? '開く途中' : '閉'), false], ['ラッチ', st.latch === false ? '外れ' : '掛かり', false], ['電流', st.cur ? (st.arc > 0.02 ? 'アークで流れ続ける' : '流れている') : 'なし', st.arc > 0.02], ['下側端子', st.live && st.open < 0.05 ? '充電' : '電源から切り離し', false]]; }
  function svgUpdate(svg, st) {
    var sw = svg.querySelector('#ds-sw'); if (sw) sw.setAttribute('d', st.open > 0.05 ? 'M140 220 L196 160' : 'M140 220 L140 100');
    var arc = svg.querySelector('#ds-arc'); if (arc) arc.style.display = st.arc > 0.02 ? '' : 'none';
    var fl = svg.querySelector('#ds-flow'); if (fl) fl.style.display = st.cur ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.ds = {
    title: '断路器 DS', parts: parts, partOrder: ['fixed', 'blade', 'hinge', 'ins', 'base', 'latch', 'eye', 'stopper', 'spring', 'hook'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#dsWire', svgUpdate: svgUpdate,
    view: { yaw: -0.9, pitch: 0.15 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05 }, side: { label: '横', yaw: -1.57, pitch: 0.05 }, top: { label: '上', yaw: -0.3, pitch: 1.2 } },
    banner: { ext: ['参考：三菱電機 DV-1（単極・F–F）', '!寸法比・接触部の形は外形図と未照合'], int: ['!接触ばねは一般的な形の模式（DV-1の資料に記述なし）'], op: ['!動きは模式・時間は表していない'], wire: [] }
  };
})();
