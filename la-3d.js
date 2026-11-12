/* 避雷器（参考：音羽電機 GL-B6G 直列ギャップ付・磁器がいし形・一般用）
   資料で確かめたこと（音羽電機 高圧用避雷器 選定表）：直列ギャップ付 磁器がいし形 一般用、公称電圧6.6kV・定格電圧8.4kV、
   公称放電電流2.5kA、規格JEC-2374、「高性能素子を使用した非直線抵抗性により続流が流れない」。
   外形は音羽電機 総合カタログ 2024-2025 p.136 の外形寸法図（GL-B6G-T 電線直付タイプ）に合わせた：全高250・碍管φ72、
   上に黒い安全キャップ（中に線路側端子）、碍管のひだ7枚、下寄りに支持バンド、いちばん下に接地側端子、質量約1.5kg。
   中の並びは同カタログ p.135「6kV系統用の配電用避雷器の代表的な構造例（直列ギャップ付）」のとおり：上にギャップ、下に酸化亜鉛（ZnO）素子。
   ギャップの電極の形・数、素子の枚数は図から読み取れず模式。 1 = 100mm */
(function () {
  'use strict';
  var POR = 0x8d8f8a, CAP = 0xb4b8bb, CU = 0xc9874a;
  var Y0 = 0.25, Y1 = 1.65, YT = 2.5;   /* 碍管の下端・上端、安全キャップの上端（全高250） */
  var parts = {
    line: { name: '線路側端子（上）', role: '高圧の電線（または LA コネクタ）につなぐ端子。ふだんは系統の対地電圧がかかっている。', links: ['cap', 'gap'], ev: 'doc', note: '安全キャップの中にある。GL-B6G-T は電線直付タイプで取付可能電線はφ2.6mm〜22mm²、GL-B6G は LAコネクタ接続タイプ（カタログ p.136）。' },
    cap: { name: '安全キャップ', role: '線路側端子の充電部を覆う、黒い絶縁のキャップ。', links: ['line', 'housing'], ev: 'doc', note: '名前と形はカタログ p.136 の外形寸法図・写真。黒い絶縁のキャップで、線路側端子を覆う。' },
    housing: { name: '碍管（磁器がいし）', role: '中の部品を雨・汚れから守り、線路側と接地側を絶縁する。ひだで沿面距離をかせぐ。', links: ['cap', 'band'], ev: 'doc', note: '碍管φ72・全高250mm（GL-B6G-T。LAコネクタ接続タイプの GL-B6G は245mm）、ひだ7枚（カタログ p.136 外形寸法図）。太さの細部は図からの読み取り。' },
    band: { name: '支持バンド', role: '本体を盤や腕金に取り付ける金具。接地側端子とは別のもの。', links: ['housing'], ev: 'doc', note: '名前と位置（碍管の下寄り）はカタログ p.136 の外形寸法図。金具の細かな形は簡略化。取付金具は別の付属品（X-5）。' },
    earth: { name: '接地側端子（下）', role: '接地線をつなぐ端子。雷のサージ電流はここから接地極へ流れる。接地線が外れていると働かない。', links: ['elem', 'gnd'], ev: 'doc', note: 'いちばん下。取付可能電線はφ2.6mm〜22mm²（カタログ p.136）。' },
    gap: { name: '直列ギャップ', role: 'ふだんは空間で絶縁していて電流を通さない。サージで電圧が上がると放電して、特性要素に電流を流す。', links: ['line', 'elem'], ev: 'doc', note: '直列ギャップ付は選定表の記載。碍管の中の上側にある並びは、カタログ p.135「代表的な構造例（直列ギャップ付）」。電極の形・数は図から読み取れず模式。' },
    elem: { name: '特性要素（酸化亜鉛 ZnO 素子）', role: '電圧が高いと抵抗が小さく、低いと大きくなる素子（非直線抵抗）。サージを流したあと、系統の電圧では電流をほとんど流さず、続流を止める。', links: ['gap', 'earth'], ev: 'doc', note: '「ZnO素子の非直線抵抗性により無続流」はカタログ p.136。ギャップの下にある並びは p.135 の構造例。素子の枚数・寸法は模式。' },
    gnd: { name: '接地線・接地極', role: 'サージ電流を大地へ逃がす道。', links: ['earth'], ev: 'simp', note: '場面の説明用。' }
  };
  function build(G, st, mode) {
    /* 碍管（φ72・ひだ7枚）。下に一段太い胴 */
    G.cyl(0.24, Y1 - Y0, 0, (Y0 + Y1) / 2, 0, POR, 'y', { part: 'housing', shell: true, shellAlpha: 0.18 }, { seg: 22 });
    for (var i = 0; i < 7; i++) G.cyl(0.36, 0.05, 0, 0.82 + i * 0.125, 0, POR, 'y', { part: 'housing', shell: true, shellAlpha: 0.12 }, { seg: 24, r2: 0.29 });
    G.cyl(0.33, 0.12, 0, Y0 + 0.08, 0, POR, 'y', { part: 'housing', shell: true, shellAlpha: 0.12 }, { seg: 24 });
    /* 安全キャップ（黒・絶縁）と、その中の線路側端子 */
    G.cyl(0.3, 0.2, 0, Y1 + 0.1, 0, 0x2a2c30, 'y', { part: 'cap', shell: true, shellAlpha: 0.2 }, { seg: 24, r2: 0.22 });
    G.cyl(0.2, YT - Y1 - 0.2, 0, (YT + Y1 + 0.2) / 2, 0, 0x2a2c30, 'y', { part: 'cap', shell: true, shellAlpha: 0.2 }, { seg: 24 });
    G.cyl(0.07, 0.55, 0, Y1 + 0.3, 0, 0xb8b8b4, 'y', { part: 'line', cond: 'line', layer: 'int' }, { seg: 12 });
    G.cyl(0.11, 0.05, 0, Y1 + 0.5, 0, 0xb8b8b4, 'y', { part: 'line', cond: 'line', layer: 'int' }, { seg: 14 });
    /* 接地側端子（いちばん下） */
    G.cyl(0.07, 0.25, 0, Y0 - 0.125, 0, 0xb8b8b4, 'y', { part: 'earth', cond: 'earth' }, { seg: 12 });
    G.cyl(0.12, 0.04, 0, Y0 - 0.2, 0, 0xb8b8b4, 'y', { part: 'earth', cond: 'earth' }, { seg: 6 });
    /* 支持バンド（碍管の下寄りを抱えて横へ出る） */
    G.cyl(0.29, 0.14, 0, 0.56, 0, 0x8d9296, 'y', { part: 'band' }, { seg: 22 });
    G.box(0.16, 0.14, 0.55, 0, 0.56, -0.5, 0x8d9296, { part: 'band' });
    G.cyl(0.05, 0.2, 0, 0.56, 0.36, 0x6f757a, 'x', { part: 'band' }, { seg: 8 });
    /* 中：上にギャップ、下に酸化亜鉛（ZnO）素子（代表的な構造例の並び） */
    var gy = [Y1 - 0.3];
    G.rod([0, Y1 + 0.03, 0], [0, Y1 - 0.24, 0], 0.03, CU, { part: 'gap', layer: 'int', cond: 'line' }, 6);
    gy.forEach(function (y) {
      G.cyl(0.15, 0.04, 0, y + 0.04, 0, 0xb8b8b4, 'y', { part: 'gap', layer: 'int' }, { seg: 18 });
      G.cyl(0.15, 0.04, 0, y - 0.06, 0, 0xb8b8b4, 'y', { part: 'gap', layer: 'int' }, { seg: 18 });
    });
    G.rod([0, Y1 - 0.38, 0], [0, 0.95, 0], 0.03, CU, { part: 'gap', layer: 'int' }, 6);
    for (var e = 0; e < 3; e++) G.cyl(0.14, 0.15, 0, 0.87 - e * 0.17, 0, 0xd9a227, 'y', { part: 'elem', layer: 'int' }, { seg: 18 });
    G.rod([0, 0.45, 0], [0, Y0 + 0.02, 0], 0.03, CU, { part: 'elem', layer: 'int' }, 6);
    /* 放電の光（ギャップ） */
    if (st.spark > 0.02) gy.forEach(function (y, k) {
      var w = []; for (var j = 0; j <= 4; j++) w.push([Math.sin(j * 2 + k) * 0.06, y + 0.02 - j * 0.015, Math.cos(j * 1.6 + k) * 0.06]);
      G.wire(w, 0xb38cff, 2 + 4 * st.spark, { part: 'gap', layer: 'int', nopick: true, zb: 0.3 }, false);
    });
    /* 線路と接地（場面） */
    if (mode !== 'ext') {
      G.wire([[0, YT - 0.05, 0], [0, YT + 0.3, 0], [-1.2, YT + 0.4, 0], [-2.2, YT + 0.4, 0]], 0x2c2c2a, 4, { part: 'line', cond: 'line' });
      G.wire([[0, Y0 - 0.25, 0], [0.4, Y0 - 0.5, 0], [0.9, -0.9, 0], [0.9, -1.4, 0]], 0x3b6d11, 3.5, { part: 'gnd' });
      G.box(0.5, 0.06, 0.5, 0.9, -1.45, 0, 0x3b6d11, { part: 'gnd' });
    }
    if (mode !== 'ext' && st.surge > 0.02 && st.spark > 0.02) {
      G.flow([[-2.2, YT + 0.4, 0], [-1.2, YT + 0.4, 0], [0, YT + 0.3, 0], [0, Y1 + 0.5, 0], [0, Y1 - 0.3, 0], [0, 0.95, 0], [0, Y0, 0], [0, Y0 - 0.25, 0], [0.4, Y0 - 0.5, 0], [0.9, -0.9, 0], [0.9, -1.4, 0]], { col: 'bad', speed: 1.1, m: { part: 'elem', layer: 'int' } });
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond) return null;
    if (m.cond === 'line' && st.live) return st.surge > 0.02 ? { c: [226, 75, 74], k: 0.65 } : { c: [240, 153, 123], k: 0.55 };
    return null;
  }
  var labels = [
    { part: 'cap', t: '安全キャップ（中に線路側端子）', p: [0.3, YT - 0.2, 0.2] },
    { part: 'housing', t: '碍管（磁器）', p: [0.5, 1.2, 0.2], layer: 'ext-only' },
    { part: 'band', t: '支持バンド', p: [0.3, 0.56, -0.8] },
    { part: 'earth', t: '接地側端子', p: [0.35, Y0 - 0.2, 0.2] },
    { part: 'gap', t: '直列ギャップ', p: [0.55, Y1 - 0.3, 0.2], layer: 'int' },
    { part: 'elem', t: '特性要素（ZnO素子）', p: [0.6, 0.7, 0.2], layer: 'int' },
    { part: 'gnd', t: '接地極へ', p: [1.3, -1.45, 0], layer: 'int' },
    { t: '雷サージ', p: [-1.5, YT + 0.15, 0], hot: true, layer: 'int', when: function (s) { return s.surge > 0.5; } },
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
    title: '避雷器 LA', parts: parts, partOrder: ['cap', 'line', 'housing', 'band', 'earth', 'gap', 'elem', 'gnd'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#laWire', svgUpdate: svgUpdate,
    view: { yaw: -0.5, pitch: 0.2 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05, zoom: 0.78, target: [0, 1.15, 0] }, top: { label: '上', yaw: 0, pitch: 1.3, zoom: 0.78, target: [0, 1.15, 0] } },
    modeView: { ext: { zoom: 0.78, target: [0, 1.15, 0] }, int: { zoom: 0.78, target: [0, 1.15, 0] }, op: { zoom: 0.6, target: [-0.4, 0.9, 0] } },
    banner: { ext: ['参考：音羽電機 GL-B6G（直列ギャップ付）', '外形はカタログの外形寸法図（全高250・φ72）に合わせた'], int: ['上にギャップ・下にZnO素子の並びは、カタログの構造例のとおり', '!電極の形・素子の枚数は模式'], op: ['!中は模式・時間と電流の大きさは表していない'], wire: [] }
  };
})();
