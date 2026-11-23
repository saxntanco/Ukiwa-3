/* スコット結線変圧器（三相 → 単相2回路）。非常用発電機の単相負荷用によく使われる低圧の乾式変圧器を想定。
   資料で確かめたこと：二次の2回路（M座・T座）には別々の単相負荷をつなぐ、二次の2回路を並列にしてはいけない（焼損）、
   M座とT座の負荷が等しいときだけ三相側が平衡、1座で使える容量は定格の1/2（ダイヘン FAQ Q13）。
   保護ケース付きの外形（例：10kVA X465・Y440・590・Z395mm、三菱電機 低圧配電用スコット結線変圧器 保護ケース）。
   T座の一次巻数がM座の√3/2、T座はM座一次の中点につなぐ（結線の原理。日本電気技術者協会の解説ほか）。
   鉄心の形（外鉄形で描いた）・巻線の配置・端子台の位置・二次の端子数は資料で確かめていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var CS = { x: 2.4, z: 2.0, y0: 0.35, y1: 6.1 };   /* 保護ケース */
  var SX = { M: 1.2, T: -1.2 };                       /* M座・T座の中心 */
  var YC = 3.1, CH = 1.15;                            /* 巻線の中心の高さ、巻線の半分の高さ */
  var CU = 0xc9874a, PRI = 0x9c6b3c, STEEL = 0x7f8a90, CORE = 0x5e6266, CASE = 0xb9c2c7, TB = 0x2d3640;
  var TX = { R: 0.7, S: 0, T: -0.7 }, TBY = 5.5, TBZ = -1.6;   /* 一次端子台 */
  var OY = 1.05, OZ = -1.6;                                      /* 二次端子台 */
  var parts = {
    case: { name: '保護ケース（通気口つき）', role: '中の変圧器を囲う鋼板のケース。乾式なので、側面・下部の通気口から空気を通して冷やす。', links: ['base', 'plate', 'gnd'], ev: 'doc', note: '保護ケース付きの外形（10kVA：X465・Y440・590・Z395mm、三菱電機の外形寸法表）に比を合わせた。寸法表のどの列が高さかは原本の外形図で再確認が望ましい。通気口の形・位置は模式。' },
    base: { name: '取付脚', role: 'ケースを床や発電機の架台にボルトで固定する。', links: ['case'], ev: 'simp', note: '外形寸法表に取付ボルト（5〜50kVAはM12）の記載あり。脚の形は模式。' },
    plate: { name: '銘板', role: '容量・一次電圧・二次電圧（M座・T座）・結線・製造年が書いてある。1座で使える容量は定格の半分。', links: ['case', 'mout', 'tout'], ev: 'simp', note: '位置は模式。' },
    gnd: { name: '接地端子', role: 'ケースと鉄心を接地する端子。', links: ['case'], ev: 'unk', note: '位置・有無は資料で確かめていない。一般的な位置で描いた。' },
    pterm: { name: '一次端子台（R・S・T）', role: '三相の3線をつなぐ。Sと Tは M座、Rは T座へ行く。単相変圧器1台と違い、3線すべてから電流を取る。', links: ['mpri', 'tpri'], ev: 'unk', note: '端子台の位置・形は模式。どの相をT座へつなぐかは銘板・結線図で確かめる。' },
    mcore: { name: 'M座の鉄心', role: 'M座（主座）の磁束の通り道。T座とは別の鉄心で、磁気的にはつながっていない。', links: ['mpri', 'msec'], ev: 'unk', note: '外形の小形変圧器でよくある外鉄形で描いた。実機の鉄心の形は未確認。' },
    tcore: { name: 'T座の鉄心', role: 'T座（ティー座）の磁束の通り道。M座の磁束より位相が90°ずれる。', links: ['tpri', 'tsec'], ev: 'unk', note: '外鉄形で描いた模式。位相は動きでは表していない。' },
    mpri: { name: 'M座一次巻線（S-T間）', role: '三相のS線とT線の間につなぐ巻線。真ん中から中点タップを出す。', links: ['pterm', 'mmid', 'mcore', 'msec'], ev: 'doc', note: 'S-T間につなぎ中点を出すのは結線の原理（日本電気技術者協会の解説）。巻線の形は模式。' },
    mmid: { name: '中点タップ（M座 → T座）', role: 'M座一次の真ん中から T座一次へつなぐ線。T座の電流はここでM座の上半分と下半分へ半分ずつ分かれ、S線とT線へ戻る。', links: ['mpri', 'tpri'], ev: 'doc', note: '中点につなぐのは結線の原理。半分ずつに分かれるのは、上下の巻線が同じ鉄心に巻かれ、起磁力が打ち消し合う向きに流れるため。線の引き回しは模式。' },
    tpri: { name: 'T座一次巻線（R-中点間・巻数√3/2）', role: 'R線とM座の中点の間につなぐ。巻数をM座の√3/2（約0.866）倍にして、二次電圧をM座と同じ大きさにそろえる。', links: ['pterm', 'mmid', 'tcore', 'tsec'], ev: 'doc', note: '実機では、T座一次の全巻数の0.866（√3/2）の点にタップを出して三相の線をつなぐ（日本電気技術者協会の解説）。図ではタップを省き、使う巻数だけの巻線として描いた。らせんは16回と14回にして差を見せた（実際の巻数ではない）。' },
    msec: { name: 'M座二次巻線', role: 'M座の単相出力をつくる巻線。負荷Aへつなぐ。', links: ['mcore', 'mout'], ev: 'unk', note: '低圧を内側に置く一般的な配置で描いた。' },
    tsec: { name: 'T座二次巻線', role: 'T座の単相出力をつくる巻線。M座と同じ大きさで、位相が90°ずれた電圧が出る。負荷Bへつなぐ。', links: ['tcore', 'tout'], ev: 'unk', note: '内側に置く一般的な配置で描いた。' },
    mout: { name: 'M座出力端子（負荷A）', role: 'M座の単相出力。負荷Aをつなぐ。T座の出力と並列にしてはいけない。', links: ['msec', 'tout'], ev: 'doc', note: '各座に別々の単相負荷をつなぐ・並列禁止はダイヘン FAQ Q13。端子は2つで描いたが、単相3線（例：210/105V）の製品もある。端子数・電圧は銘板で確かめる。' },
    tout: { name: 'T座出力端子（負荷B）', role: 'T座の単相出力。負荷Bをつなぐ。負荷AとBが同じ大きさのとき、三相側が平衡する。', links: ['tsec', 'mout'], ev: 'doc', note: 'ダイヘン FAQ Q13。端子数は模式。' }
  };
  /* 巻線の表面を回る電流の通り道（上 → 下） */
  function coil(x, r, turns, from, to) {
    var p = [], n = turns * 3;
    for (var t = 0; t <= n; t++) { var a = t / n * Math.PI * 2 * turns; p.push([x + r * Math.sin(a), from + (to - from) * t / n, -r * Math.cos(a)]); }
    return p;
  }
  function seat(G, k, turns) {
    var x = SX[k], c = k === 'M' ? 'mcore' : 'tcore', pr = k === 'M' ? 'mpri' : 'tpri', se = k === 'M' ? 'msec' : 'tsec';
    /* 外鉄形の鉄心：中央脚・両側の脚・上下のヨーク */
    G.box(0.55, 2.6, 0.7, x, YC, 0, CORE, { part: c, layer: 'int' });
    G.box(0.26, 2.6, 0.7, x - 0.9, YC, 0, CORE, { part: c, layer: 'int' });
    G.box(0.26, 2.6, 0.7, x + 0.9, YC, 0, CORE, { part: c, layer: 'int' });
    G.box(2.06, 0.32, 0.7, x, YC + 1.46, 0, CORE, { part: c, layer: 'int' });
    G.box(2.06, 0.32, 0.7, x, YC - 1.46, 0, CORE, { part: c, layer: 'int' });
    /* 巻線：内側に二次、外側に一次 */
    G.cyl(0.42, 2.1, x, YC, 0, CU, 'y', { part: se, layer: 'int', cond: 'sec' }, { seg: 18 });
    G.cyl(0.64, 2.3, x, YC, 0, PRI, 'y', { part: pr, layer: 'int', cond: 'pri', shell: true, shellAlpha: 0.3 }, { seg: 20 });
    G.helix([x, YC, 0], 'y', 0.66, 2.2, turns, 0x7a4a24, 1.2, { part: pr, layer: 'int' });
    /* 二次の引出線 → 出力端子 */
    G.rod([x - 0.25, YC - 1.05, -0.35], [x - 0.35, OY + 0.15, OZ + 0.1], 0.04, CU, { part: se, layer: 'int', cond: 'sec' }, 4);
    G.rod([x + 0.25, YC - 1.05, -0.35], [x + 0.35, OY + 0.15, OZ + 0.1], 0.04, CU, { part: se, layer: 'int', cond: 'sec' }, 4);
    /* 二次端子台 */
    var o = k === 'M' ? 'mout' : 'tout';
    G.box(1.2, 0.35, 0.3, x, OY, OZ, TB, { part: o, layer: 'int' });
    [-0.35, 0.35].forEach(function (d) { G.cyl(0.08, 0.2, x + d, OY + 0.05, OZ - 0.2, 0xb8b8b4, 'z', { part: o, layer: 'int', cond: 'sec' }, { seg: 10 }); });
  }
  function build(G, st, mode) {
    var shell = { part: 'case', shell: true, shellAlpha: 0.12 };
    /* 取付脚 */
    [-1.5, 1.5].forEach(function (z) { G.box(5.2, 0.3, 0.45, 0, 0.2, z, 0x4f565b, { part: 'base' }); });
    /* 保護ケース */
    G.box(CS.x * 2, CS.y1 - CS.y0, CS.z * 2, 0, (CS.y0 + CS.y1) / 2, 0, CASE, shell);
    G.box(CS.x * 2 + 0.2, 0.12, CS.z * 2 + 0.2, 0, CS.y1 + 0.06, 0, 0x9aa5ab, shell);
    /* 通気口（側面と前面下部のルーバー） */
    [-1, 1].forEach(function (s) {
      for (var i = 0; i < 6; i++) G.box(0.06, 0.08, 2.4, s * (CS.x + 0.03), 1.1 + i * 0.28, 0, 0x55626b, { part: 'case', layer: 'ext-only' });
      for (var j = 0; j < 4; j++) G.box(0.06, 0.08, 2.4, s * (CS.x + 0.03), 4.6 + j * 0.28, 0, 0x55626b, { part: 'case', layer: 'ext-only' });
    });
    for (var f = 0; f < 4; f++) G.box(3.0, 0.08, 0.06, 0, 0.9 + f * 0.25, -CS.z - 0.03, 0x55626b, { part: 'case', layer: 'ext-only' });
    /* 銘板・接地端子 */
    G.box(1.1, 0.8, 0.04, -1.3, 4.9, -CS.z - 0.03, 0xededea, { part: 'plate', layer: 'ext-only' });
    G.cyl(0.08, 0.25, CS.x + 0.12, 0.55, 1.2, 0xb8b8b4, 'x', { part: 'gnd' }, { seg: 10 });
    /* ---------- 中 ---------- */
    seat(G, 'M', 16); seat(G, 'T', 14);
    /* 一次端子台 R・S・T */
    G.box(2.2, 0.45, 0.3, 0, TBY, TBZ, TB, { part: 'pterm', layer: 'int' });
    ['R', 'S', 'T'].forEach(function (p) { G.cyl(0.09, 0.22, TX[p], TBY + 0.05, TBZ - 0.22, 0xb8b8b4, 'z', { part: 'pterm', layer: 'int', cond: 'pri' }, { seg: 10 }); });
    /* 一次の引出線 */
    var M = SX.M, T = SX.T;
    G.wire([[TX.R, TBY - 0.2, TBZ + 0.1], [-0.4, 5.0, -1.2], [T + 0.3, YC + CH + 0.25, -0.7], [T + 0.3, YC + CH, -0.62]], 0xd85a30, 2.2, { part: 'tpri', layer: 'int', cond: 'pri' });
    G.wire([[TX.S, TBY - 0.2, TBZ + 0.1], [0.4, 5.0, -1.2], [M - 0.3, YC + CH + 0.25, -0.7], [M - 0.3, YC + CH, -0.62]], 0xd85a30, 2.2, { part: 'mpri', layer: 'int', cond: 'pri' });
    G.wire([[TX.T, TBY - 0.2, TBZ + 0.1], [-0.15, 4.4, -1.35], [0.05, 2.0, -1.2], [M - 0.3, YC - CH - 0.2, -0.75], [M - 0.3, YC - CH, -0.62]], 0xd85a30, 2.2, { part: 'mpri', layer: 'int', cond: 'pri' });
    /* 中点タップ：M座一次の真ん中 → T座一次の下の端 */
    G.wire([[M - 0.1, YC, -0.68], [M - 0.6, YC + 0.1, -1.05], [0, YC - 0.35, -1.1], [T + 0.6, YC - CH - 0.1, -0.95], [T + 0.3, YC - CH, -0.62]], 0x2f8f6a, 2.2, { part: 'mmid', layer: 'int', cond: 'pri' });
    G.cyl(0.07, 0.08, M - 0.1, YC, -0.68, 0x2f8f6a, 'z', { part: 'mmid', layer: 'int' }, { seg: 10 });
    /* 二次の並列（してはいけない接続） */
    if (st.par && mode !== 'ext') {
      G.wire([[M - 0.35, OY + 0.05, OZ - 0.32], [0, OY - 0.35, OZ - 0.6], [T + 0.35, OY + 0.05, OZ - 0.32]], 0xe24b4a, 2.6, { part: 'tout', layer: 'int' });
      G.wire([[M - 0.35, OY + 0.05, OZ - 0.32], [0, OY - 0.6, OZ - 0.75], [T + 0.35, OY + 0.05, OZ - 0.32]], 0xe24b4a, 2.6, { part: 'tout', layer: 'int' });
    }
    /* 負荷（動作のときだけ） */
    if (mode === 'op' || mode === 'int') {
      if (st.m) G.box(0.9, 0.6, 0.5, M, OY - 0.1, OZ - 1.3, 0xf4efe2, { part: 'mout', layer: 'int' });
      if (st.t) G.box(0.9, 0.6, 0.5, T, OY - 0.1, OZ - 1.3, 0xf4efe2, { part: 'tout', layer: 'int' });
    }
    /* ---------- 動作：磁束と電流 ---------- */
    if (mode === 'ext' || !st.v) return;
    ['M', 'T'].forEach(function (k) {
      var x = SX[k], c = k === 'M' ? 'mcore' : 'tcore';
      [-1, 1].forEach(function (s) {
        var xo = x + s * 0.9;
        G.flux([[x, YC - 1.1, 0.42], [x, YC + 1.1, 0.42], [x, YC + 1.46, 0.42], [(x + xo) / 2, YC + 1.46, 0.42], [xo, YC + 1.46, 0.42], [xo, YC + 1.1, 0.42], [xo, YC - 1.1, 0.42], [xo, YC - 1.46, 0.42], [(x + xo) / 2, YC - 1.46, 0.42], [x, YC - 1.46, 0.42]], { speed: 0.45, w: 2.2, m: { part: c, layer: 'int' } });
      });
    });
    var term = function (p) { return [TX[p], TBY + 0.05, TBZ - 0.35]; };
    /* T座の負荷：R → T座一次 → 中点 → M座一次の上半分（S）と下半分（T）へ半分ずつ */
    if (st.t) {
      var pr = [term('R'), [TX.R, TBY - 0.2, TBZ + 0.1], [-0.4, 5.0, -1.2], [T + 0.3, YC + CH + 0.25, -0.7]].concat(coil(T, 0.7, 4, YC + CH, YC - CH));
      pr = pr.concat([[T + 0.6, YC - CH - 0.1, -0.95], [0, YC - 0.35, -1.1], [M - 0.6, YC + 0.1, -1.05], [M - 0.1, YC, -0.7]]);
      G.flow(pr, { speed: 0.6, m: { part: 'tpri', layer: 'int' } });
      G.flow(coil(M, 0.72, 2, YC, YC + CH).concat([[M - 0.3, YC + CH + 0.25, -0.7], [0.4, 5.0, -1.2], [TX.S, TBY - 0.2, TBZ + 0.1], term('S')]), { speed: 0.35, n: 6, m: { part: 'mmid', layer: 'int' } });
      G.flow(coil(M, 0.72, 2, YC, YC - CH).concat([[M - 0.3, YC - CH - 0.2, -0.75], [0.05, 2.0, -1.2], [-0.15, 4.4, -1.35], [TX.T, TBY - 0.2, TBZ + 0.1], term('T')]), { speed: 0.35, n: 6, m: { part: 'mmid', layer: 'int' } });
      G.flow([[T - 0.25, YC - 1.05, -0.35], [T + 0.35, OY + 0.15, OZ + 0.1], [T + 0.35, OY + 0.05, OZ - 0.35], [T + 0.3, OY, OZ - 1.05]], { speed: 0.8, m: { part: 'tsec', layer: 'int' } });
    }
    /* M座の負荷：S → M座一次（全体） → T */
    if (st.m) {
      var pm = [term('S'), [TX.S, TBY - 0.2, TBZ + 0.1], [0.4, 5.0, -1.2], [M - 0.3, YC + CH + 0.25, -0.7]].concat(coil(M, 0.76, 6, YC + CH, YC - CH));
      pm = pm.concat([[M - 0.3, YC - CH - 0.2, -0.75], [0.05, 2.0, -1.2], [-0.15, 4.4, -1.35], [TX.T, TBY - 0.2, TBZ + 0.1], term('T')]);
      G.flow(pm, { speed: 0.6, m: { part: 'mpri', layer: 'int' } });
      G.flow([[M - 0.25, YC - 1.05, -0.35], [M - 0.35, OY + 0.15, OZ + 0.1], [M - 0.35, OY + 0.05, OZ - 0.35], [M - 0.3, OY, OZ - 1.05]], { speed: 0.8, m: { part: 'msec', layer: 'int' } });
    }
    /* 並列にしたとき：2つの二次巻線の間を回る循環電流（赤） */
    if (st.par) {
      G.flow([[M - 0.35, OY + 0.05, OZ - 0.32], [0, OY - 0.35, OZ - 0.6], [T + 0.35, OY + 0.05, OZ - 0.32], [T + 0.35, OY + 0.15, OZ + 0.1], [T - 0.25, YC - 1.05, -0.35], [T + 0.25, YC - 1.05, -0.35], [T + 0.35, OY + 0.15, OZ + 0.1], [T + 0.35, OY + 0.05, OZ - 0.32], [0, OY - 0.6, OZ - 0.75], [M - 0.35, OY + 0.05, OZ - 0.32], [M - 0.35, OY + 0.15, OZ + 0.1], [M + 0.25, YC - 1.05, -0.35], [M - 0.25, YC - 1.05, -0.35], [M - 0.35, OY + 0.15, OZ + 0.1]], { speed: 1.2, col: 'bad', closed: true, m: { part: 'tout', layer: 'int' } });
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !st.v || !m.cond) return null;
    if (m.cond === 'pri') return { c: [240, 153, 123], k: 0.5 };
    if (m.cond === 'sec') return st.par ? { c: [226, 75, 74], k: 0.55 } : { c: [250, 199, 117], k: 0.5 };
    return null;
  }
  var labels = [
    { part: 'case', t: '保護ケース', p: [1.6, CS.y1 + 0.5, -CS.z], layer: 'ext-only' },
    { part: 'case', t: '通気口', p: [CS.x + 0.5, 1.6, 0.6], layer: 'ext-only' },
    { part: 'plate', t: '銘板', p: [-1.3, 5.55, -CS.z - 0.1], layer: 'ext-only' },
    { part: 'gnd', t: '接地端子', p: [CS.x + 0.5, 0.35, 1.5], layer: 'ext-only' },
    { part: 'pterm', t: '一次端子台 R・S・T（三相）', p: [0, TBY + 0.6, TBZ - 0.3], layer: 'int' },
    { part: 'mpri', t: 'M座（S-T間）', p: [SX.M + 0.6, YC + 1.95, -0.6], layer: 'int' },
    { part: 'tpri', t: 'T座（R-中点・巻数√3/2）', p: [SX.T - 0.5, YC + 1.95, -0.6], layer: 'int' },
    { part: 'mmid', t: '中点タップ', p: [0, YC - 0.75, -1.3], layer: 'int' },
    { part: 'mout', t: 'M座出力 → 負荷A', p: [SX.M, OY - 0.6, OZ - 0.4], layer: 'int' },
    { part: 'tout', t: 'T座出力 → 負荷B', p: [SX.T, OY - 0.6, OZ - 0.4], layer: 'int' },
    { t: '並列は禁止：循環電流で焼損', p: [0, OY - 1.1, OZ - 0.9], layer: 'int', hot: true, when: function (s, m) { return s.par && m !== 'ext'; } },
    { t: 'M座とT座の磁束は位相が90°ずれる', p: [0, YC + 2.15, 0.5], layer: 'int', when: function (s, m) { return m === 'op' && s.v && !s.par; } }
  ];
  var base = { v: false, m: false, t: false, par: false };
  var scenarios = [
    { name: '電圧をかける（無負荷）', steps: [
      { t: '停電している状態', x: '一次にも二次にも電圧はない。', s: 'ok', st: { v: false, m: false, t: false, par: false } },
      { t: '三相をかける', x: 'S-T間の電圧が M座に、R-中点間の電圧が T座にかかる。2つの鉄心に磁束が回り（青い破線）、二次に同じ大きさの単相電圧が2つ出る。2つの電圧は位相が90°ずれている。', s: 'ok', st: { v: true }, hz: '磁束の動きは位相（90°のずれ）を表していない。' }
    ] },
    { name: '両座に同じ負荷', steps: [
      { t: '負荷Aと負荷Bを同じ大きさでつなぐ', x: 'M座の電流は S → T へ流れる。T座の電流は R から入り、中点でM座の上半分と下半分に半分ずつ分かれて S と T へ戻る。', s: 'ok', st: { v: true, m: true, t: true, par: false }, hz: '電流は往路の向きだけを描いている。交流なので実際は向きが入れ替わる。' },
      { t: '3線の電流がそろう（三相平衡）', x: 'M座の一次電流を10Aとすると、T座は巻数が√3/2なので 10×2/√3 ≒ 11.55A。S線とT線は「M座10A」と「T座の半分5.77A（90°ずれ）」の合成で √(10²＋5.77²) ≒ 11.55A。R・S・Tがそろって 11.55A になる。', s: 'ok', st: {} }
    ] },
    { name: '片側だけ負荷', steps: [
      { t: '負荷Aだけをつなぐ', x: 'M座だけに電流が流れる。R線には流れず、S線とT線だけに10Aずつ。単相変圧器1台をS-T間につないだのと同じで、三相側は不平衡になる。', s: 'warn', st: { v: true, m: true, t: false, par: false }, hz: '発電機の逆相電流・回転子の過熱、電圧の不平衡につながる。1座で使えるのは定格の半分まで。' },
      { t: '負荷Bだけをつなぐ', x: 'T座だけに電流が流れる。R線は11.55A、S線とT線は半分の5.77Aずつ。これも不平衡。負荷AとBを同じにそろえることが前提。', s: 'warn', st: { m: false, t: true } }
    ] },
    { name: '二次を並列にすると', steps: [
      { t: 'M座とT座の出力を並列につなぐ（してはいけない）', x: '2つの出力は大きさは同じでも位相が90°ずれている。並列にすると、その差の電圧（1.41倍）で2つの二次巻線の間に大きな循環電流が流れ、変圧器が焼損する。', s: 'ng', st: { v: true, m: false, t: false, par: true }, hz: 'メーカーも並列の禁止を明記している（ダイヘン FAQ Q13）。容量を増やしたいときは、より大きい変圧器を選ぶ。' }
    ] }
  ];
  function lines(st) {
    if (!st.v) return null;
    var a = st.m ? 10 : 0, b = st.t ? 10 : 0;
    var r = b * 2 / Math.sqrt(3), s = Math.sqrt(a * a + Math.pow(b / Math.sqrt(3), 2));
    return { R: r, S: s, T: s };
  }
  function f1(x) { return x < 0.005 ? '0A' : x.toFixed(2) + 'A'; }
  function stateList(st) {
    if (st.v && st.par) return [['一次電圧', '三相 あり', false], ['二次', '並列（循環電流）', true], ['結果', '焼損のおそれ', true]];
    var L = lines(st);
    if (!L) return [['一次電圧', 'なし', false], ['負荷', 'なし', false]];
    var bal = Math.abs(L.R - L.S) < 0.01;
    var idle = L.R + L.S < 0.01;
    return [['R線', f1(L.R), false], ['S線', f1(L.S), false], ['T線', f1(L.T), false], ['三相側', idle ? '電流なし（励磁分のみ）' : bal ? '平衡' : '不平衡', !idle && !bal]];
  }
  function svgUpdate(svg, st) {
    var L = lines(st) || { R: 0, S: 0, T: 0 };
    var put = function (id, v) { var e = svg.querySelector(id); if (e) e.textContent = st.v && !st.par ? f1(v) : ''; };
    put('#sc3-iR', L.R); put('#sc3-iS', L.S); put('#sc3-iT', L.T);
    var show = function (id, on) { var e = svg.querySelector(id); if (e) e.style.display = on ? '' : 'none'; };
    show('#sc3-loadA', st.v && st.m); show('#sc3-loadB', st.v && st.t); show('#sc3-par', st.par);
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.scott = {
    title: 'スコット結線変圧器', parts: parts, partOrder: ['pterm', 'mpri', 'mmid', 'tpri', 'mcore', 'tcore', 'msec', 'tsec', 'mout', 'tout', 'case', 'plate', 'gnd', 'base'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#scWire', svgUpdate: svgUpdate,
    view: { yaw: Math.PI - 0.55, pitch: 0.25 },
    views: { front: { label: '正面', yaw: Math.PI, pitch: 0.08 }, side: { label: '横', yaw: 1.57, pitch: 0.08 }, top: { label: '上', yaw: Math.PI - 0.2, pitch: 1.25 }, mid: { label: '中点タップ', yaw: Math.PI - 0.35, pitch: 0.2, zoom: 1.9, target: [0, 3.0, -0.9] } },
    banner: { ext: ['想定：非常用発電機の単相負荷用 低圧スコット変圧器（保護ケース付き）', '!外形は寸法比だけ合わせた概形'], int: ['!中は模式：鉄心の形・巻線の配置は資料で未確認'], op: ['!電流の大きさは表していない・往路だけ', '!位相（90°のずれ）は動きでは表していない'], wire: [] }
  };
})();
