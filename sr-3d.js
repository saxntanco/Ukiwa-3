/* 直列リアクトル（参考：日新電機 HM-LN3 油入・6%、カタログ「電力用コンデンサ 関連機器」Cat.No.237 R5 2023年10月）
   資料で確かめたこと：油入自冷式・油の取り替えのいらない空気密封式（p.11）、温度センサ全機種付属・高調波過負荷による二次事故の拡大を防ぐ（p.11）、
   制御線はファストン端子（p.11）、リアクタンスはコンデンサのリアクタンスを100%とした%で表示（p.11）、
   6.6kV 31.9kvar（設備容量30kvar用）の外形 A530・B340・C750・D520・E470・F200mm、油量35L（p.11〜12）、
   6%用コンデンサの定格電圧7.02kV（p.3）。
   外形は p.11 図9 に合わせた：A530（幅）・B340（奥行）・C750（ブッシング上端までの全高）・D520（タンク上面の高さ）・
   E470×F200（取付穴 4-φ12 のピッチ）、ブッシングは6本（奥の列 W・V・U、手前の列 Z・Y・X、左右150ピッチ・前後150）、ブッシング高さ180、
   吊り耳は上部の左右、銘板・温度センサは右の側面、接地端子は右下。結線は U–X・V–Y・W–Z の3コイル（p.11 結線図）。
   鉄心のギャップとコイルの形は資料に記述がなく模式。 1 = 100mm */
(function () {
  'use strict';
  var W = 5.3, D = 3.4, H = 5.0, Y0 = 0.2;
  var PX = { U: 1.5, V: 0, W: -1.5 }, PH = ['U', 'V', 'W'], YC = Y0 + 2.45, BZ = 0.75;
  var STEEL = 0x8c939a, POR = 0x8d8f8a, CU = 0xc9874a;
  var parts = {
    tank: { name: 'タンク', role: '鉄心・コイルと絶縁油を収める。空気密封式で、油の取り替えがいらない。', links: ['oil', 'base'], ev: 'doc', note: '空気密封式（カタログ p.11）。外形は図9のとおり：幅A530・奥行B340・タンク上面の高さD520・ブッシング上端までの全高C750（カタログ p.11）。' },
    bush: { name: '端子（電源側・コンデンサ側）', role: '電源側からの電線と、コンデンサへの電線をつなぐ。各相のコイルの両端が出ている。', links: ['coil'], ev: 'doc', note: '6本。奥の列が W・V・U、手前の列が Z・Y・X。左右150mmピッチ、前後150mm、高さ180mm、絶縁キャップ付き。結線は U–X・V–Y・W–Z（カタログ p.11 図9・結線図）。電源側とコンデンサ側のどちらの列につなぐかは、設備の結線図で確かめる。' },
    temp: { name: '温度センサ（ファストン端子）', role: 'コイルの温度が上がると動く接点。高調波で過負荷になったとき、遮断器を引き外したり警報を出したりして、二次事故の拡大を防ぐ。', links: ['coil'], ev: 'doc', note: '全機種付属・ファストン端子・制御線0.75〜2.27mm²（カタログ p.11）。位置は図9のとおり右の側面、銘板の下。箱の形は模式。' },
    base: { name: '台座・吊り金具', role: '据え付けと吊り上げの金具。', links: ['tank'], ev: 'doc', note: '取付穴は 4-φ12、ピッチ E470×F200。吊り耳は上部の左右（カタログ p.11 図9）。金具の細かな形は模式。' },
    gnd: { name: '接地端子', role: 'タンクを接地する。', links: ['tank'], ev: 'doc', note: '右の側面の下（カタログ p.11 図9）。' },
    oil: { name: '絶縁油', role: 'コイルを絶縁し、熱をタンクへ運ぶ。', links: ['tank', 'coil'], ev: 'doc', note: '油入自冷式・油量35L（31.9kvar、カタログ p.11〜12）。' },
    core: { name: '鉄心（ギャップ付き・模式）', role: '磁束の通り道。脚の途中にすき間（ギャップ）を入れて、電流が増えても飽和しにくく、インダクタンスがほぼ一定になるようにする。', links: ['coil', 'gap'], ev: 'unk', note: 'ギャップ付き鉄心はリアクトルの一般的な形。この形式の鉄心の形・ギャップの数は資料に記述がなく模式。' },
    gap: { name: 'ギャップ（すき間・模式）', role: '鉄心の途中の絶縁物のすき間。磁気抵抗を大きくして、インダクタンスを安定させる。', links: ['core'], ev: 'unk', note: '数・位置は模式。' },
    coil: { name: 'コイル（各相）', role: '電源とコンデンサのあいだに直列に入る。第5高調波などに対して、コンデンサ回路を誘導性にする。', links: ['core', 'bush', 'temp'], ev: 'unk', note: '巻き方・材質は資料に記述がなく模式。' }
  };
  function build(G, st, mode) {
    var shell = { part: 'tank', shell: true, shellAlpha: 0.14 };
    G.box(W, H, D, 0, Y0 + H / 2, 0, STEEL, shell);
    G.box(W + 0.2, 0.12, D + 0.2, 0, Y0 + H + 0.06, 0, 0x7a8288, { part: 'tank' });
    [-1, 1].forEach(function (s) { G.box(W, 0.2, 0.5, 0, 0.1, s * 1.0, 0x4f565b, { part: 'base' }); [-2.35, 2.35].forEach(function (x) { G.cyl(0.07, 0.22, x, 0.1, s * 1.0, 0x2c2c2a, 'y', { part: 'base' }, { seg: 8 }); }); G.box(0.12, 0.45, 0.5, s * (W / 2 + 0.06), Y0 + H - 0.35, 0, 0x6f777c, { part: 'base' }); });
    G.cyl(0.07, 0.2, W / 2 + 0.1, Y0 + 0.35, 1.0, 0xb8b8b4, 'x', { part: 'gnd' }, { seg: 10 });
    /* 銘板と温度センサ（右の側面。図9） */
    G.box(0.04, 0.6, 0.9, W / 2 + 0.02, Y0 + H - 1.2, 0, 0xd9dde0, { part: 'tank' });
    G.box(0.14, 0.7, 0.7, W / 2 + 0.07, Y0 + H - 2.1, 0, 0x3f4a55, { part: 'temp' });
    [-0.2, 0, 0.2].forEach(function (z) { G.box(0.05, 0.18, 0.1, W / 2 + 0.16, Y0 + H - 2.15, z, 0xc9cacc, { part: 'temp' }); });
    G.box(0.04, 0.12, 0.2, W / 2 + 0.16, Y0 + H - 1.88, 0, st.temp ? 0xc0392b : 0x2f8a4e, { part: 'temp' });
    /* 端子：電源側（後ろ）とコンデンサ側（前） */
    PH.forEach(function (ph) {
      [-BZ, BZ].forEach(function (z) {
        var x = PX[ph];
        G.cyl(0.17, 1.8, x, Y0 + H + 0.9, z, POR, 'y', { part: 'bush' }, { seg: 14 });
        for (var i = 0; i < 4; i++) G.cyl(0.3 - i * 0.02, 0.06, x, Y0 + H + 0.35 + i * 0.36, z, POR, 'y', { part: 'bush' }, { seg: 16 });
        G.cyl(0.21, 0.5, x, Y0 + H + 2.05, z, 0x2c2c2a, 'y', { part: 'bush', cond: 'v' }, { seg: 12 });
      });
    });
    /* ---- 中（模式） ---- */
    G.box(W - 0.2, H - 0.3, D - 0.2, 0, Y0 + H / 2, 0, 0xd9a93a, { part: 'oil', layer: 'int', alpha: 0.12, nopick: true });
    PH.forEach(function (ph) {
      var x = PX[ph];
      /* 脚（ギャップで区切った鉄心ブロック） */
      for (var b = 0; b < 4; b++) G.box(0.8, 0.5, 0.8, x, YC - 0.99 + b * 0.66, 0, 0x5e6266, { part: 'core', layer: 'int' });
      for (var g = 0; g < 3; g++) G.box(0.82, 0.14, 0.82, x, YC - 0.66 + g * 0.66, 0, 0xe9dfc8, { part: 'gap', layer: 'int' });
      /* コイル */
      G.cyl(0.68, 2.4, x, YC, 0, CU, 'y', { part: 'coil', layer: 'int', cond: 'v', shell: true, shellAlpha: 0.3 }, { seg: 20 });
      G.helix([x, YC, 0], 'y', 0.7, 2.2, 14, 0x8a5a2a, 1.3, { part: 'coil', layer: 'int' });
      G.wire([[x, YC + 1.2, -0.68], [x, Y0 + H, -BZ]], 0xd85a30, 2, { part: 'coil', layer: 'int', cond: 'v' });
      G.wire([[x, YC - 1.2, 0.68], [x + 0.3, YC, 0.82], [x, Y0 + H, BZ]], 0xd85a30, 2, { part: 'coil', layer: 'int', cond: 'v' });
    });
    G.box(3.8, 0.6, 0.8, 0, YC + 1.6, 0, 0x5e6266, { part: 'core', layer: 'int' });
    G.box(3.8, 0.6, 0.8, 0, YC - 1.6, 0, 0x5e6266, { part: 'core', layer: 'int' });
    G.wire([[PX.U + 0.68, YC + 0.5, 0], [W / 2, Y0 + H - 2.1, 0]], 0x3f4a55, 1.5, { part: 'temp', layer: 'int' });
    if (mode === 'ext' || !st.on) return;
    /* 電流（往路：電源側端子 → コイル → コンデンサ側端子） */
    PH.forEach(function (ph) {
      var x = PX[ph], pts = [[x, Y0 + H + 2.3, -BZ], [x, Y0 + H, -BZ], [x, YC + 1.2, -0.7]];
      for (var t = 0; t <= 10; t++) { var a = t / 10 * Math.PI * 5; pts.push([x + 0.72 * Math.sin(a), YC + 1.1 - t * 0.22, -0.72 * Math.cos(a)]); }
      pts = pts.concat([[x + 0.3, YC, 0.82], [x, Y0 + H, BZ], [x, Y0 + H + 2.3, BZ]]);
      G.flow(pts, { col: st.harm ? 'bad' : 'cur', speed: st.harm ? 0.9 : 0.5, m: { part: 'coil', layer: 'int' } });
    });
    G.flux([[PX.U, YC - 1.6, 0.45], [PX.U, YC + 1.6, 0.45], [PX.V, YC + 1.6, 0.45], [PX.V, YC - 1.6, 0.45]], { speed: 0.5, w: 2.2, m: { part: 'core', layer: 'int' } });
    G.flux([[PX.W, YC - 1.6, 0.45], [PX.W, YC + 1.6, 0.45], [PX.V, YC + 1.6, 0.45], [PX.V, YC - 1.6, 0.45]], { speed: 0.5, w: 2.2, m: { part: 'core', layer: 'int' } });
  }
  function tint(m, st, mode) {
    if (mode === 'ext') return null;
    if (m.cond === 'v' && st.on) return { c: [240, 153, 123], k: 0.5 };
    if (m.part === 'coil' && st.hot) return { c: [226, 75, 74], k: 0.45 };
    return null;
  }
  var labels = [
    { part: 'bush', t: '電源側の端子（U・V・W）', p: [-1.5, Y0 + H + 2.6, -BZ] },
    { t: 'コンデンサ側の端子（X・Y・Z）', p: [1.5, Y0 + H + 2.6, BZ] },
    { part: 'temp', t: '温度センサ', p: [W / 2 + 0.4, Y0 + H - 2.6, 0] },
    { part: 'tank', t: 'タンク（空気密封）', p: [1.2, Y0 + 1.2, D / 2 + 0.3], layer: 'ext-only' },
    { part: 'core', t: '鉄心（模式）', p: [0, YC + 2.1, 0.4], layer: 'int' },
    { part: 'gap', t: 'ギャップ（模式）', p: [PX.W + 1.3, YC + 0.0, 0.4], layer: 'int' },
    { part: 'coil', t: 'コイル', p: [PX.U - 1.3, YC - 0.6, 0.4], layer: 'int' },
    { part: 'oil', t: '絶縁油', p: [-2.2, Y0 + 0.6, 1.0], layer: 'int' },
    { t: '高調波で電流が増える', p: [0, Y0 + H + 3.1, 0], hot: true, layer: 'int', when: function (s) { return s.harm; } }
  ];
  var base = { on: false, harm: false, hot: false, temp: false };
  var scenarios = [
    { name: 'ふだん', steps: [
      { t: 'コンデンサと直列に電流が流れる', x: '電流の往路：電源側の端子 → コイル → コンデンサ側の端子 → コンデンサ。鉄心には磁束が回る（青い破線）。ギャップがあるので、電流が増えてもインダクタンスがほぼ一定に保たれる。', s: 'ok', st: { on: true, harm: false, hot: false, temp: false } }
    ] },
    { name: 'なぜ6%なのか', steps: [
      { t: '6%は、コンデンサのリアクタンスに対する割合', x: '基本波（50/60Hz）で、リアクトルのリアクタンスがコンデンサのリアクタンスの6%。', s: 'ok', st: { on: true } },
      { t: '第5高調波では、リアクトルの方が大きくなる', x: 'リアクトルのリアクタンスは周波数に比例して 6%×5＝30%、コンデンサは反比例して 100%÷5＝20%。30% > 20% なので、第5高調波に対してコンデンサ回路は誘導性になり、高調波を拡大しにくい。共振は 1÷√0.06 ≒ 4.1倍の周波数で、第5高調波より下にくる。', s: 'ok', st: {} },
      { t: 'そのかわり、コンデンサの電圧が上がる', x: 'リアクトルの分だけ、コンデンサにかかる電圧は 1÷(1−0.06) ≒ 1.064倍。6.6kV×1.064 ≒ 7.02kV。だから6%用のコンデンサは定格電圧7.02kV（カタログ p.3）。', s: 'warn', st: {}, hz: '6%用と13%用、旧JIS品と現JIS品を混ぜて使わない（カタログ p.26）。リアクトルとコンデンサは組み合わせで選ぶ。' }
    ] },
    { name: '高調波が多いとき', steps: [
      { t: '高調波で電流が増える', x: 'まわりの負荷（インバータなど）から高調波が多く入ると、リアクトルに流れる電流が増え（赤い粒）、コイルが熱くなる。', s: 'ng', st: { on: true, harm: true, hot: true } },
      { t: '温度センサが動く', x: '温度センサの接点が動いて、遮断器を引き外したり警報を出したりして、焼損などの二次事故を防ぐ。', s: 'warn', st: { temp: true, on: false, harm: false }, hz: '温度センサの制御線（ファストン端子）がつながっていないと保護できない。' }
    ] }
  ];
  function stateList(st) { return [['電流', st.on ? (st.harm ? '高調波で増加' : 'ふだん') : 'なし', !!st.harm], ['コイルの温度', st.hot ? '上昇' : 'ふだん', !!st.hot], ['温度センサ', st.temp ? '動作' : '復帰', !!st.temp]]; }
  function svgUpdate(svg, st) {
    var h = svg.querySelector('#sr-harm'); if (h) h.style.display = st.harm ? '' : 'none';
    var t = svg.querySelector('#sr-temp'); if (t) t.setAttribute('fill', st.temp ? '#c0392b' : '#fff');
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.sr = {
    title: '直列リアクトル', parts: parts, partOrder: ['bush', 'tank', 'temp', 'base', 'gnd', 'oil', 'core', 'gap', 'coil'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#srWire', svgUpdate: svgUpdate,
    view: { yaw: -0.55, pitch: 0.25 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.57, pitch: 0.08 }, top: { label: '上', yaw: -0.2, pitch: 1.25 } },
    banner: { ext: ['参考：日新電機 HM-LN3（油入・6%）', '外形と端子6本の位置はカタログの外形図（図9）に合わせた'], int: ['!中は模式：鉄心のギャップ・コイルの形は資料に記述なし'], op: ['!電流の大きさは表していない・往路だけ'], wire: [] }
  };
})();
