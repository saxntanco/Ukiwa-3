/* 零相変流器 ZCT（参考：オムロン 形OTG-N68 エポキシモールド高圧用貫通形・屋内用）
   資料で確かめたこと（CSM_Ground-fault_Protectors_DS_J_3_2、2024年4月版と推定）：定格一次電流400A、定格零相一次電流200mA、
   定格電圧6,600V、貫通孔 内径φ68（セパレータ付き・取り外し可）、使用可能電線外形φ26、M5端子ねじ、取付は2-φ8.5穴または2-M8ねじ穴、
   質量約1kg、一次導体は高圧シールドつきケーブルなど。外形図の数値 158・182・76.5・134・60 などがあるが、どの寸法かは図で未照合。
   中の鉄心・巻線の形、端子の数と記号の割り当ては資料に記述がない（模式）。 1 = 約50mm */
(function () {
  'use strict';
  var CY = 1.53, RI = 0.68, RO = 1.15, D = 0.6, EP = 0x3c4146;
  var parts = {
    body: { name: 'モールド本体（エポキシ）', role: '中の鉄心と巻線をエポキシ樹脂で固めて絶縁している。', links: ['core', 'hole', 'term'], ev: 'doc', note: 'エポキシモールド高圧用貫通形（カタログ p.2）。外形の丸み・寸法比は模式。' },
    hole: { name: '貫通孔（内径φ68）', role: '3相のケーブルをまとめて通す穴。3本の電流の合計を見る。', links: ['body', 'sep', 'cable'], ev: 'doc', note: '内径φ68、使用可能電線外形φ26（カタログ p.3）。' },
    sep: { name: 'セパレータ', role: '孔の中でケーブルどうしを分けて位置を決める仕切り。取り外せる。', links: ['hole', 'cable'], ev: 'simp', note: 'セパレータ付き・取り外し可はカタログ p.3。Y字の形は模式。' },
    foot: { name: '取付脚', role: '盤に取り付ける脚。2か所の穴（φ8.5）またはM8ねじ穴で固定する。', links: ['body'], ev: 'doc', note: '取付方法はカタログ p.3。脚の形は模式。' },
    term: { name: '二次端子（M5ねじ）', role: '地絡継電器（K2GRなど）へつなぐ端子。', links: ['wind', 'relay'], ev: 'simp', note: 'M5端子ねじはカタログ p.3。端子の数・位置・記号（k・l など）の割り当ては資料で確認できず模式。' },
    core: { name: '鉄心（環状・模式）', role: '孔をぐるりと囲む輪の形の鉄心。3本の電流がつくる磁束の合計が、ここを回る。', links: ['wind', 'body'], ev: 'unk', note: '中の構造はカタログに記述がない。環状鉄心は貫通形の一般的な形として模式で描いた。' },
    wind: { name: '二次巻線（模式）', role: '鉄心に巻いた細い線。鉄心に磁束が回ると、ここに電圧・電流が出る。', links: ['core', 'term'], ev: 'unk', note: '巻数・配置は資料になく模式。' },
    cable: { name: '一次導体（3相のケーブル）', role: '3相の電線をそろって孔に通す。製品の部品ではなく、設備側の例。', links: ['hole'], ev: 'simp', note: '一次導体は高圧シールドつきケーブルなど（カタログ p.2 注記）。場面の説明用。' },
    relay: { name: '地絡継電器（例）', role: '二次の出力を受けて、地絡かどうかを判定する。', links: ['term'], ev: 'simp', note: '適合機種の例 K2GR など（カタログ p.2）。場面の説明用。' }
  };
  function ringFace(G, z, col, m) {
    var n = 28;
    for (var k = 0; k < n; k++) {
      var a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
      G.poly([[RI * Math.cos(a0), CY + RI * Math.sin(a0), z], [RO * Math.cos(a0), CY + RO * Math.sin(a0), z], [RO * Math.cos(a1), CY + RO * Math.sin(a1), z], [RI * Math.cos(a1), CY + RI * Math.sin(a1), z]], col, m, [0, CY, 0]);
    }
  }
  function build(G, st, mode) {
    var bm = { part: 'body', shell: true, shellAlpha: 0.16 };
    G.cyl(RO, 2 * D, 0, CY, 0, EP, 'z', bm, { seg: 28, open: true });
    G.cyl(RI, 2 * D, 0, CY, 0, EP, 'z', { part: 'hole', shell: true, shellAlpha: 0.12 }, { seg: 28, open: true });
    ringFace(G, D, EP, bm); ringFace(G, -D, EP, bm);
    /* 台座と取付脚 */
    G.box(1.5, 0.6, 1.0, 0, 0.42, 0, EP, { part: 'body', shell: true, shellAlpha: 0.16 });
    G.box(3.64, 0.12, 1.2, 0, 0.06, 0, 0x6f757a, { part: 'foot' });
    [-1.58, 1.58].forEach(function (x) { G.cyl(0.17, 0.13, x, 0.07, 0, 0x23272b, 'y', { part: 'foot' }, { seg: 12 }); });
    /* 端子台（位置は模式） */
    G.box(0.9, 0.3, 0.5, 0.95, CY + 0.95, 0.15, 0x2a2e33, { part: 'term' });
    [0.68, 0.86, 1.04, 1.22].forEach(function (x) { G.cyl(0.07, 0.06, x, CY + 1.13, 0.15, 0xc9cacc, 'y', { part: 'term' }, { seg: 10 }); });
    /* セパレータ（取り外し可・Y字は模式） */
    [30, 150, 270].forEach(function (d) {
      var a = d * Math.PI / 180, ex = RI * 0.97 * Math.cos(a), ey = RI * 0.97 * Math.sin(a), nx = -Math.sin(a) * 0.025, ny = Math.cos(a) * 0.025;
      [1, -1].forEach(function (sg) { G.poly([[sg * nx, CY + sg * ny, -D], [ex + sg * nx, CY + ey + sg * ny, -D], [ex + sg * nx, CY + ey + sg * ny, D], [sg * nx, CY + sg * ny, D]], 0xd9d3c6, { part: 'sep' }, null, true); });
    });
    /* 中：環状鉄心と二次巻線（模式） */
    var RC = (RI + RO) / 2, n = 28;
    for (var k = 0; k < n; k++) {
      var a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
      G.rod([RC * Math.cos(a0), CY + RC * Math.sin(a0), 0], [RC * Math.cos(a1), CY + RC * Math.sin(a1), 0], 0.12, 0x7d8085, { part: 'core', layer: 'int' }, 6);
    }
    var wp = [], turns = 46, M = 600;
    for (var i = 0; i <= M; i++) {
      var th = i / M * Math.PI * 2 * 0.9 + 0.2, ph = th * turns, rr = RC + 0.17 * Math.cos(ph);
      wp.push([rr * Math.cos(th), CY + rr * Math.sin(th), 0.17 * Math.sin(ph)]);
    }
    G.wire(wp, 0x378add, 1.3, { part: 'wind', layer: 'int' }, false);
    G.wire([wp[wp.length - 1], [0.9, CY + 0.7, 0.1], [0.86, CY + 1.0, 0.15]], 0x378add, 1.6, { part: 'wind', layer: 'int' });
    G.wire([wp[0], [1.1, CY + 0.5, 0.1], [1.04, CY + 1.0, 0.15]], 0x378add, 1.6, { part: 'wind', layer: 'int' });
    if (mode === 'ext') return;
    /* 一次導体（3相）：孔を前後に貫く */
    var CP = { U: [0, CY + 0.36], V: [-0.31, CY - 0.18], W: [0.31, CY - 0.18] };
    ['U', 'V', 'W'].forEach(function (ph) { var c = CP[ph]; G.cyl(0.26, 4.2, c[0], c[1], 0, 0x2c2c2a, 'z', { part: 'cable', ph: ph }, { seg: 14 }); });
    /* 継電器への二次線 */
    G.box(0.8, 0.6, 0.4, 2.6, CY + 1.4, 0.15, 0xe8edf2, { part: 'relay' });
    G.wire([[0.86, CY + 1.16, 0.15], [1.6, CY + 1.5, 0.15], [2.2, CY + 1.45, 0.15]], 0x378add, 2, { part: 'term' });
    G.wire([[1.04, CY + 1.16, 0.15], [1.7, CY + 1.3, 0.15], [2.2, CY + 1.3, 0.15]], 0x378add, 2, { part: 'term' });
    /* 電流：往路は前（+z）へ、帰路は後ろ（−z）へ。平常時は孔の中で往復がそろう */
    if (st.cur) {
      G.flow([[CP.U[0], CP.U[1], -2.1], [CP.U[0], CP.U[1], 2.1]], { speed: 0.6, m: { part: 'cable' } });
      G.flow([[CP.V[0], CP.V[1], 2.1], [CP.V[0], CP.V[1], -2.1]], { speed: 0.3, m: { part: 'cable' } });
      if (!st.fault) G.flow([[CP.W[0], CP.W[1], 2.1], [CP.W[0], CP.W[1], -2.1]], { speed: 0.3, m: { part: 'cable' } });
      else {
        G.flow([[CP.W[0], CP.W[1], 2.1], [CP.W[0], CP.W[1], 1.0]], { speed: 0.3, m: { part: 'cable' } });
        G.flow([[0.31, CY - 0.18, 2.1], [0.31, -0.6, 2.1], [2.0, -0.6, 0], [0.31, -0.6, -2.1], [0.31, CY - 0.18, -2.1]], { col: 'bad', speed: 0.5, m: { part: 'cable' } });
        G.wire([[0.31, CY - 0.18, 2.1], [0.31, -0.6, 2.1], [2.0, -0.6, 0], [0.31, -0.6, -2.1], [0.31, CY - 0.18, -2.1]], 0xb83a2b, 2, { part: 'cable', nopick: true }, true);
        var f = []; for (var j = 0; j < 16; j++) { var a = j / 16 * Math.PI * 2; f.push([RC * Math.cos(a), CY + RC * Math.sin(a), 0.25]); }
        G.flux(f, { speed: 0.6, w: 3, m: { part: 'core', layer: 'int' } });
        G.flow([[1.04, CY + 1.16, 0.15], [1.7, CY + 1.3, 0.15], [2.2, CY + 1.3, 0.15]], { speed: 0.5, m: { part: 'term' } });
        G.flow([[2.2, CY + 1.45, 0.15], [1.6, CY + 1.5, 0.15], [0.86, CY + 1.16, 0.15]], { speed: 0.5, m: { part: 'term' } });
      }
    }
  }
  var labels = [
    { part: 'hole', t: '貫通孔 φ68', p: [0, CY + 0.8, 0.7], layer: 'ext-only' },
    { part: 'sep', t: 'セパレータ', p: [-0.5, CY + 0.2, 0.75], layer: 'ext-only' },
    { part: 'body', t: 'モールド本体', p: [-1.3, CY - 0.6, 0.6] },
    { part: 'foot', t: '取付脚', p: [-1.6, -0.15, 0.6] },
    { part: 'term', t: '二次端子 M5', p: [0.95, CY + 1.4, 0.4] },
    { part: 'core', t: '環状鉄心（模式）', p: [-1.0, CY + 0.6, 0.3], layer: 'int' },
    { part: 'wind', t: '二次巻線（模式）', p: [0.95, CY - 0.75, 0.4], layer: 'int' },
    { part: 'cable', t: 'U', p: [0, CY + 0.36, 2.35], layer: 'int' }, { t: 'V', p: [-0.31, CY - 0.18, 2.35], layer: 'int' }, { t: 'W', p: [0.31, CY - 0.18, 2.35], layer: 'int' },
    { part: 'relay', t: '地絡継電器（例）', p: [2.6, CY + 1.85, 0.15], layer: 'int' },
    { t: '孔の外を通る帰り道（地絡電流）', p: [2.0, -0.85, 0], hot: true, layer: 'int', when: function (s) { return s.fault; } },
    { t: '合計が0にならない → 磁束が回る', p: [-1.2, CY + 1.2, 0.3], hot: true, layer: 'int', when: function (s) { return s.fault; } }
  ];
  var base = { cur: false, fault: false };
  var scenarios = [
    { name: 'ふだん（地絡なし）', steps: [
      { t: '3本の電流が孔を通る', x: 'ある瞬間を切り取ると、前へ流れる電流と後ろへ戻る電流がちょうど同じ量（3本の合計が0）。それぞれがつくる磁束が打ち消し合い、鉄心に磁束は回らない。二次には何も出ない。', s: 'ok', st: { cur: true, fault: false } }
    ] },
    { name: '地絡が起きたとき', steps: [
      { t: '負荷側の W 相で地絡', x: 'W 相の電流の一部が、孔の中を戻らずに、大地・ケーブルの遮へい・対地静電容量など孔の外の道を通って戻る（赤い粒）。孔の中の合計が0でなくなる（零相電流）。', s: 'ng', st: { fault: true } },
      { t: '鉄心に磁束が回り、二次に出力が出る', x: '合計の分だけ磁束が鉄心を回り（青い破線）、二次巻線に電流が流れて地絡継電器へ届く。継電器が整定値と比べて判定する。', s: 'warn', st: {}, hz: '定格零相一次電流200mAは、継電器の動作の目安とは別の値。電流値・位相・継電器の動作は、この図では計算していない。' }
    ] }
  ];
  function stateList(st) { return [['孔の中の電流の合計', st.fault ? '0ではない（零相電流）' : '0', !!st.fault], ['鉄心の磁束', st.fault ? '回る' : 'なし', !!st.fault], ['二次出力', st.fault ? 'あり' : 'なし', !!st.fault]]; }
  function svgUpdate(svg, st) {
    var g = svg.querySelector('#zc-fault'); if (g) g.style.display = st.fault ? '' : 'none';
    var o = svg.querySelector('#zc-out'); if (o) o.textContent = st.fault ? '二次出力：あり' : '二次出力：なし';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.zct = {
    title: '零相変流器 ZCT', parts: parts, partOrder: ['body', 'hole', 'sep', 'foot', 'term', 'core', 'wind', 'cable', 'relay'],
    initial: base, build: build, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#zctWire', svgUpdate: svgUpdate,
    view: { yaw: -0.55, pitch: 0.25 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05 }, side: { label: '横', yaw: -1.57, pitch: 0.1 } },
    modeView: { op: { zoom: 0.75, target: [0.5, 1.4, 0], yaw: -0.8, pitch: 0.3 } },
    banner: { ext: ['参考：オムロン OTG-N68', '!外形の丸み・寸法比は外形図と未照合'], int: ['!中は模式：鉄心と巻線の形は資料に記述がない'], op: ['!電流の大きさ・位相は表していない'], wire: [] }
  };
})();
