/* 避雷器（参考：音羽電機 GL-B6G 直列ギャップ付・磁器がいし形・一般用）
   資料で確かめたこと（音羽電機 高圧用避雷器 選定表）：直列ギャップ付 磁器がいし形 一般用、公称電圧6.6kV・定格電圧8.4kV、
   公称放電電流2.5kA、規格JEC-2374、「高性能素子を使用した非直線抵抗性により続流が流れない」。
   外形寸法・中の部品の数と配置は資料で確認できていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var POR = 0x8d8f8a, CAP = 0xb4b8bb, CU = 0xc9874a;
  var Y0 = 0.3, Y1 = 2.1;          /* 磁器の下端・上端 */
  var parts = {
    line: { name: '線路側端子（上）', role: '高圧の電線（または LA コネクタ）につなぐ端子。ふだんは系統の対地電圧がかかっている。', links: ['cap', 'gap'], ev: 'simp', note: '上を線路側とした。接続方法（コネクタ／電線直付け）は形名で異なり、未照合。' },
    cap: { name: '上部キャップ', role: '磁器の上を封じる金具。中の部品を押さえ、湿気が入らないよう密封する。', links: ['line', 'housing'], ev: 'unk', note: '形・寸法は未照合。' },
    housing: { name: '磁器がいし（外被）', role: '中の部品を雨・汚れから守り、線路側と接地側を絶縁する。ひだで沿面距離をかせぐ。', links: ['cap', 'band'], ev: 'doc', note: '磁器がいし形は選定表の記載。ひだの数・太さは模式。' },
    band: { name: '取付バンド・金具', role: '本体を盤や腕金に取り付ける金具。接地側端子とは別のもの。', links: ['housing'], ev: 'unk', note: '形・位置は未照合。' },
    earth: { name: '接地側端子（下）', role: '接地線をつなぐ端子。雷のサージ電流はここから接地極へ流れる。接地線が外れていると働かない。', links: ['elem', 'gnd'], ev: 'simp', note: '下を接地側とした。形は模式。' },
    gap: { name: '直列ギャップ（模式）', role: 'ふだんは空間で絶縁していて電流を通さない。サージで電圧が上がると放電して、特性要素に電流を流す。', links: ['line', 'elem'], ev: 'simp', note: '直列ギャップ付は選定表の記載。電極の形・数・位置は資料になく模式。' },
    elem: { name: '特性要素（模式）', role: '電圧が高いと抵抗が小さく、低いと大きくなる素子（非直線抵抗）。サージを流したあと、系統の電圧では電流をほとんど流さず、続流を止める。', links: ['gap', 'earth'], ev: 'simp', note: '「高性能素子の非直線抵抗性により続流が流れない」は選定表の記載。素子の材質・枚数・寸法は未確認で模式。' },
    spring: { name: '押えばね（模式）', role: '中の部品を上下から押さえて、接触を保つ。', links: ['gap', 'cap'], ev: 'unk', note: '一般的な構成として描いた。GL-B6G での有無・形は未確認。' },
    gnd: { name: '接地線・接地極', role: 'サージ電流を大地へ逃がす道。', links: ['earth'], ev: 'simp', note: '場面の説明用。' }
  };
  function build(G, st, mode) {
    /* 磁器（ひだ付き） */
    G.cyl(0.26, Y1 - Y0, 0, (Y0 + Y1) / 2, 0, POR, 'y', { part: 'housing', shell: true, shellAlpha: 0.18 }, { seg: 22 });
    for (var i = 0; i < 6; i++) G.cyl(0.36, 0.05, 0, Y0 + 0.35 + i * 0.25, 0, POR, 'y', { part: 'housing', shell: true, shellAlpha: 0.12 }, { seg: 24, r2: 0.3 });
    /* 上部キャップ・線路側端子 */
    G.cyl(0.41, 0.22, 0, Y1 + 0.11, 0, CAP, 'y', { part: 'cap' }, { seg: 24 });
    G.cyl(0.08, 0.3, 0, Y1 + 0.37, 0, 0xb8b8b4, 'y', { part: 'line', cond: 'line' }, { seg: 12 });
    G.cyl(0.14, 0.05, 0, Y1 + 0.5, 0, 0xb8b8b4, 'y', { part: 'line', cond: 'line' }, { seg: 14 });
    /* 下部金具・接地側端子 */
    G.cyl(0.32, 0.16, 0, Y0 - 0.08, 0, CAP, 'y', { part: 'earth' }, { seg: 22 });
    G.cyl(0.07, 0.24, 0, Y0 - 0.28, 0, 0xb8b8b4, 'y', { part: 'earth', cond: 'earth' }, { seg: 12 });
    /* 取付バンド */
    G.cyl(0.29, 0.1, 0, Y0 + 0.2, 0, 0x6f757a, 'y', { part: 'band' }, { seg: 22 });
    G.box(0.14, 0.1, 0.5, 0, Y0 + 0.2, -0.5, 0x6f757a, { part: 'band' });
    G.box(0.5, 0.4, 0.06, 0, Y0 + 0.2, -0.78, 0x6f757a, { part: 'band' });
    /* 中（模式）：押えばね・直列ギャップ・特性要素 */
    G.helix([0, Y1 - 0.12, 0], 'y', 0.12, 0.16, 5, 0x2f6fa8, 2, { part: 'spring', layer: 'int' });
    var gy = [Y1 - 0.3, Y1 - 0.45, Y1 - 0.6];
    gy.forEach(function (y) {
      G.cyl(0.17, 0.04, 0, y + 0.03, 0, 0xb8b8b4, 'y', { part: 'gap', layer: 'int' }, { seg: 18 });
      G.cyl(0.17, 0.04, 0, y - 0.05, 0, 0xb8b8b4, 'y', { part: 'gap', layer: 'int' }, { seg: 18 });
    });
    for (var e = 0; e < 7; e++) G.cyl(0.16, 0.12, 0, Y1 - 0.8 - e * 0.14, 0, 0x4a4f55, 'y', { part: 'elem', layer: 'int' }, { seg: 18 });
    G.rod([0, Y1 - 0.8 - 6 * 0.14 - 0.06, 0], [0, Y0 + 0.02, 0], 0.03, CU, { part: 'elem', layer: 'int' }, 6);
    /* 放電の光（ギャップ） */
    if (st.spark > 0.02) gy.forEach(function (y, k) {
      var w = []; for (var j = 0; j <= 4; j++) w.push([Math.sin(j * 2 + k) * 0.06, y + 0.01 - j * 0.0125, Math.cos(j * 1.6 + k) * 0.06]);
      G.wire(w, 0xb38cff, 2 + 4 * st.spark, { part: 'gap', layer: 'int', nopick: true, zb: 0.3 }, false);
    });
    /* 線路と接地（場面） */
    if (mode !== 'ext') {
      G.wire([[0, Y1 + 0.5, 0], [0, Y1 + 0.85, 0], [-1.2, Y1 + 0.95, 0], [-2.2, Y1 + 0.95, 0]], 0x2c2c2a, 4, { part: 'line', cond: 'line' });
      G.wire([[0, Y0 - 0.4, 0], [0.4, Y0 - 0.6, 0], [0.9, -0.9, 0], [0.9, -1.4, 0]], 0x3b6d11, 3.5, { part: 'gnd' });
      G.box(0.5, 0.06, 0.5, 0.9, -1.45, 0, 0x3b6d11, { part: 'gnd' });
    }
    if (mode !== 'ext' && st.surge > 0.02 && st.spark > 0.02) {
      G.flow([[-2.2, Y1 + 0.95, 0], [-1.2, Y1 + 0.95, 0], [0, Y1 + 0.85, 0], [0, Y1 + 0.5, 0], [0, Y1 - 0.3, 0], [0, Y1 - 0.8, 0], [0, Y0, 0], [0, Y0 - 0.4, 0], [0.4, Y0 - 0.6, 0], [0.9, -0.9, 0], [0.9, -1.4, 0]], { col: 'bad', speed: 1.1, m: { part: 'elem', layer: 'int' } });
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond) return null;
    if (m.cond === 'line' && st.live) return st.surge > 0.02 ? { c: [226, 75, 74], k: 0.65 } : { c: [240, 153, 123], k: 0.55 };
    return null;
  }
  var labels = [
    { part: 'line', t: '線路側端子', p: [0, Y1 + 0.7, 0.2] },
    { part: 'housing', t: '磁器がいし', p: [0.45, (Y0 + Y1) / 2 + 0.3, 0.2], layer: 'ext-only' },
    { part: 'band', t: '取付バンド', p: [0.3, Y0 + 0.2, -0.85] },
    { part: 'earth', t: '接地側端子', p: [0.35, Y0 - 0.3, 0.2] },
    { part: 'gap', t: '直列ギャップ（模式）', p: [0.55, Y1 - 0.45, 0.2], layer: 'int' },
    { part: 'elem', t: '特性要素（模式）', p: [0.55, Y1 - 1.2, 0.2], layer: 'int' },
    { part: 'spring', t: '押えばね（模式）', p: [-0.55, Y1 - 0.12, 0.2], layer: 'int' },
    { part: 'gnd', t: '接地極へ', p: [1.3, -1.45, 0], layer: 'int' },
    { t: '雷サージ', p: [-1.5, Y1 + 0.7, 0], hot: true, layer: 'int', when: function (s) { return s.surge > 0.5; } },
    { t: '帰路：大地 → 系統の対地静電容量などを通って戻る（図の外）', p: [-0.6, -1.75, 0], layer: 'int', when: function (s) { return s.spark > 0.5; } }
  ];
  var base = { live: true, surge: 0, spark: 0 };
  var scenarios = [
    { name: 'ふだん（系統の電圧だけ）', steps: [
      { t: 'ふだん：電流は流れない', x: '線路側端子には系統の対地電圧がかかっている（オレンジ）。直列ギャップが空間で絶縁していて、避雷器を通る電流はない。', s: 'ok', st: { live: true, surge: 0, spark: 0 } }
    ] },
    { name: '雷サージが来たとき', steps: [
      { t: '雷サージが線路を伝わってくる', x: '線路側端子の電圧が、ふだんよりはるかに高くなる（赤）。まだギャップは放電していない。', s: 'warn', st: { live: true, surge: 1, spark: 0 } },
      { t: '直列ギャップが放電し、特性要素に電流が流れる', x: '電圧が高いと特性要素の抵抗が小さくなり、サージ電流（赤い粒）が線路側端子 → ギャップ → 特性要素 → 接地側端子 → 接地極へ流れる。端子間の電圧は低く抑えられる（制限電圧）。', s: 'ng', st: { spark: 1 }, hz: '接地線が外れていたり、接地抵抗が大きかったりすると、サージを逃がせない。' },
      { t: 'サージが過ぎると、続流が止まる', x: '系統の電圧に戻ると、特性要素の抵抗が大きくなり、電流はほとんど流れない。ギャップの放電も消えて、ふだんの状態に戻る。', s: 'ok', st: { surge: 0, spark: 0 } }
    ] }
  ];
  function stateList(st) { return [['線路の電圧', st.surge > 0.5 ? 'サージ（高い）' : (st.live ? 'ふだんの対地電圧' : 'なし'), st.surge > 0.5], ['直列ギャップ', st.spark > 0.5 ? '放電' : '絶縁', st.spark > 0.5], ['大地へ流れる電流', st.spark > 0.5 ? 'サージ電流' : 'なし', st.spark > 0.5]]; }
  function svgUpdate(svg, st) {
    var a = svg.querySelector('#la-spark'); if (a) a.style.display = st.spark > 0.5 ? '' : 'none';
    var f = svg.querySelector('#la-flow'); if (f) f.style.display = st.spark > 0.5 ? '' : 'none';
    var s = svg.querySelector('#la-surge'); if (s) s.style.display = st.surge > 0.5 ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.la = {
    title: '避雷器 LA', parts: parts, partOrder: ['line', 'cap', 'housing', 'band', 'earth', 'gap', 'elem', 'spring', 'gnd'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#laWire', svgUpdate: svgUpdate,
    view: { yaw: -0.5, pitch: 0.2 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05 }, top: { label: '上', yaw: 0, pitch: 1.3 } },
    modeView: { op: { zoom: 0.72, target: [-0.4, 1.0, 0] } },
    banner: { ext: ['参考：音羽電機 GL-B6G（直列ギャップ付）', '!外形寸法は資料と未照合'], int: ['!中は模式：ギャップと特性要素の数・形は資料になく推定'], op: ['!中は模式・時間と電流の大きさは表していない'], wire: [] }
  };
})();
