/* VT・LA内蔵GR付PAS（参考：戸上電機 KLT-PA-D2N11LT ほか）
   資料で確かめたこと：VT・LAは開閉器の負荷側に内蔵、VT 6600/105V 25VA・22/60kV、LA 8.4kV 2500A ZnOギャップレス、
   Z2は開閉器内で外箱に接続、Vc端子は接地しない、制御線11心、P2は接地相側、LA内蔵形はA種接地が必須、
   一相ごとの耐電圧試験はVTが焼損するので行わない、LA内蔵形はAC12kV以上・DC17kV以上をかけない。
   内部構造図は公開されておらず、内部は模式。VTがどの2相のあいだかも戸上電機の資料には書かれていない。 */
(function () {
  'use strict';
  var PH = { U: -0.35, V: 0, W: 0.35 }, PHS = ['U', 'V', 'W'], YC = 0.6;
  var STEEL = 0x8c939a, CU = 0xc9874a;
  var parts = {
    tank: { name: '外箱（ケース）', role: '開閉器の部品を収める鋼板の箱。A種接地する。開閉器の中で Z2 端子が外箱につながっている。', links: ['gnd', 'ctrl'], ev: 'doc', note: '接地・Z2 は戸上電機の製品ページ・取扱説明書 p.22付近。箱の形・寸法比は外形図と未照合。' },
    bsrc: { name: '電源側ブッシング・リード', role: '引込線（配電線側）とつながるところ。試験の前に、引込線とつながっていないことを確かめる。PAS を「入」にすると、ここまで充電される。', links: ['contact'], ev: 'doc', note: '「ブッシング」「電源側表示」は取扱説明書の各部の名称。本数・向きは未照合。' },
    bload: { name: '負荷側ブッシング・リード', role: '構内側（立上りケーブル）とつながるところ。VT・LA はこの負荷側に内蔵されている。', links: ['vt', 'la', 'zct', 'clip'], ev: 'doc', note: '負荷側に VT・LA 内蔵は製品ページ。形・向きは未照合。' },
    contact: { name: '主接点（模式）', role: '3相を同時に開閉する接点。消弧媒体は気中。', links: ['bsrc', 'zct', 'mech'], ev: 'unk', note: '消弧媒体（気中）は取扱説明書の表示。接点の形・位置は資料がなく模式。' },
    zct: { name: 'ZCT（模式）', role: '3相の導体をまとめて通し、地絡のときの零相電流を検出して SOG 制御装置へ送る（Z1・Z2）。', links: ['contact', 'ctrl'], ev: 'unk', note: '取扱説明書の接続図に記号がある。位置・形は模式。' },
    vt: { name: '内蔵 VT（模式）', role: '負荷側の2相のあいだにつながる、SOG 制御装置の電源用の変圧器（6600/105V・25VA）。この2相のどちらかを、柱の上でつかみ忘れると焼損のおそれ。', links: ['bload', 'ctrl'], ev: 'doc', note: '負荷側・定格は製品ページ。どの2相のあいだかは戸上電機の資料に書かれておらず未確認。図は仮に U–V に描いた。' },
    la: { name: '内蔵 LA（模式）', role: '雷の過電圧を大地へ逃がす避雷器（8.4kV・2500A・ZnO ギャップレス）。耐圧試験では切り離せないので、交流 10,350V でかけられる範囲で試験する。', links: ['bload', 'gnd'], ev: 'doc', note: '定格は製品ページ。各相と大地のあいだにつないだ形は一般的な避雷器のつなぎ方で、内部の接続図は未確認。' },
    mech: { name: '操作ハンドル・入切表示', role: '操作ひもでハンドルを引いて入・切する。入切は表示で確かめる。トリップコイルで引外されると「切」になる。', links: ['contact', 'tc'], ev: 'doc', note: '「操作ハンドル」「入切表示」は取扱説明書の各部の名称。位置・形は未照合。' },
    tc: { name: 'トリップコイル（模式）', role: 'SOG 制御装置の指令で励磁され、開閉器を引き外す。', links: ['mech', 'ctrl'], ev: 'unk', note: '取扱説明書の接続図に TC の記号がある。位置・形は模式。' },
    ctrl: { name: '制御線（SOG 制御装置へ）', role: '方向性は 11 心（Z1・Z2・Y1 の3心シールド）。P1・P2 は VT の二次（P2 は接地相側）。Vc は緑色だが接地箇所ではなく、接地すると VT が焼損する。', links: ['vt', 'zct', 'tc'], ev: 'doc', note: '製品ページ・取扱説明書。耐電圧試験のときの処置は、その機種の取扱説明書に従う。' },
    gnd: { name: '接地', role: '外箱の A 種接地。LA 内蔵形は接地しないと雷から守れない。試験では試験器の E 端子・ケーブルの遮へい層も同じ接地へ。', links: ['tank', 'la'], ev: 'doc', note: '取扱説明書 p.22付近。' },
    clip: { name: '短絡クリップ（4口）', role: '柱の上で PAS の負荷側 U・V・W とケーブル1心をつかむ。キュービクル側でも3心を三線短絡する。こうして9つの点を同じ電位にする。', links: ['bload', 'cable', 'tester'], ev: 'simp', note: 'このサイトの日誌で整理した現場の形。実際の結線は作業責任者の指示に従う。' },
    cable: { name: '立上りケーブル', role: '3心それぞれ、芯線と遮へい層（接地）のあいだの絶縁体が試される。充電電流の大部分はここの静電容量へ流れる。', links: ['clip', 'tester'], ev: 'simp', note: '一般的な CV ケーブルの説明。長さ・形は簡略化。' },
    tester: { name: '耐圧試験器', role: 'キュービクル側の三線短絡に試験電圧をかける。E 端子は接地。', links: ['clip', 'gnd'], ev: 'simp', note: '試験電圧は 6,600V 系で交流 10,350V。' }
  };
  var SRCEND = {}, LUGP = {}, TOPLUG = {}, BOTLUG = {}, CORE = {};
  var CX = 2.55, TOPY = -0.75, BOTY = -2.05, CZ = { U: -0.25, V: 0, W: 0.25 };
  var PC = [2.3, -0.45, 0.72], CC = [2.95, -2.45, 0.45], TS = [1.75, -2.55, 1.05], GP = [0.95, -2.67, 1.0];
  PHS.forEach(function (ph) {
    var z = PH[ph];
    SRCEND[ph] = [-2.3, 1.0, z * 1.2]; LUGP[ph] = [1.95, -0.29, z];
    TOPLUG[ph] = [CX, TOPY + 0.1, CZ[ph]]; BOTLUG[ph] = [CX, BOTY - 0.1, CZ[ph]];
    CORE[ph] = [[CX, TOPY - 0.23, CZ[ph]], [CX, -1.1, CZ[ph] * 0.6], [CX, -1.25, CZ[ph] * 0.15], [CX, -1.55, CZ[ph] * 0.15], [CX, -1.72, CZ[ph] * 0.6], [CX, BOTY + 0.23, CZ[ph]]];
  });
  var VTPH = ['U', 'V'];   /* 仮の相（資料では未確認） */

  function build(G, st, mode) {
    var S = { layer: 'int' };
    /* ---- 外観 ---- */
    G.box(2.8, 1.0, 1.2, 0, 0.5, 0, STEEL, { part: 'tank', shell: true });
    G.box(2.9, 0.06, 1.3, 0, 1.03, 0, 0x7b8289, { part: 'tank', shell: true });
    [-0.9, 0.9].forEach(function (x) { G.cyl(0.05, 0.16, x, 1.14, 0, 0x6b7075, 'y', { part: 'tank' }); G.cyl(0.09, 0.03, x, 1.23, 0, 0x6b7075, 'y', { part: 'tank' }); });
    G.box(0.5, 0.26, 0.02, 0.2, 0.55, 0.61, 0xededea, { part: 'tank', layer: 'ext-only' });
    G.cyl(0.04, 0.08, 1.15, 0.1, 0.64, 0xb8b8b4, 'z', { part: 'gnd' });
    PHS.forEach(function (ph) {
      var z = PH[ph];
      [[-1, 'bsrc', 'src'], [1, 'bload', 'load']].forEach(function (sd) {
        var s = sd[0];
        G.cyl(0.08, 0.36, s * 1.58, YC, z, 0x7e8b92, 'x', { part: sd[1] }, { seg: 14 });
        [1.48, 1.58, 1.68].forEach(function (xx) { G.cyl(0.125, 0.025, s * xx, YC, z, 0x6f7c84, 'x', { part: sd[1] }, { seg: 14 }); });
        G.cyl(0.03, 0.06, s * 1.79, YC, z, 0xb8b8b4, 'x', { part: sd[1], cond: ph, side: sd[2] }, { seg: 8 });
      });
      G.wire([[-1.79, YC, z], [-2.05, 0.75, z], SRCEND[ph]], 0x2c2c2a, 3.5, { part: 'bsrc', cond: ph, side: 'src' });
      G.wire([[1.79, YC, z], [1.92, 0.3, z], [1.95, -0.17, z]], 0x2c2c2a, 3.5, { part: 'bload', cond: ph, side: 'load' });
      G.box(0.06, 0.1, 0.04, 1.95, -0.23, z, 0xb8b8b4, { part: 'bload', cond: ph, side: 'load' });
    });
    /* 操作ハンドル・入切表示 */
    G.box(0.32, 0.22, 0.05, -0.95, 0.35, 0.625, 0x5f6266, { part: 'mech' });
    var ha = st.on ? 0.0 : 0.8;
    G.rod([-0.95, 0.35, 0.68], [-0.95 + 0.34 * Math.cos(ha), 0.35 - 0.34 * Math.sin(ha), 0.68], 0.03, 0x2c2c2a, { part: 'mech' });
    G.box(0.16, 0.09, 0.02, -0.62, 0.5, 0.615, st.on ? 0xc0392b : 0x2f8a4e, { part: 'mech' });
    G.wire([[0.8, 0.05, -0.55], [0.7, -0.2, -0.85], [0.4, -0.9, -1.0], [0.0, -1.3, -1.05]], 0x2c2c2a, 4, { part: 'ctrl' });
    /* ---- 内部（模式）：部品の形・位置は実機と異なる ---- */
    PHS.forEach(function (ph) {
      var z = PH[ph], a = st.on ? 0 : 0.9;
      G.box(1.0, 0.04, 0.05, -0.9, YC, z, CU, { part: 'contact', layer: 'int', cond: ph, side: 'src' });
      G.rod([-0.4, YC, z], [-0.4 + 0.5 * Math.cos(a), YC + 0.5 * Math.sin(a), z], 0.025, CU, { part: 'contact', layer: 'int', cond: ph, side: 'load' }, 4);
      G.box(1.48, 0.04, 0.05, 0.84, YC, z, CU, { part: 'contact', layer: 'int', cond: ph, side: 'load' });
    });
    /* ZCT（四角い枠） */
    G.box(0.1, 0.06, 0.96, 0.35, YC + 0.16, 0, 0x3f4a55, { part: 'zct', layer: 'int' });
    G.box(0.1, 0.06, 0.96, 0.35, YC - 0.16, 0, 0x3f4a55, { part: 'zct', layer: 'int' });
    G.box(0.1, 0.38, 0.06, 0.35, YC, -0.48, 0x3f4a55, { part: 'zct', layer: 'int' });
    G.box(0.1, 0.38, 0.06, 0.35, YC, 0.48, 0x3f4a55, { part: 'zct', layer: 'int' });
    /* VT（仮に U–V） */
    G.box(0.32, 0.24, 0.28, 0.85, 0.24, -0.18, 0x8a4b2e, { part: 'vt', layer: 'int' });
    G.wire([[0.79, YC, PH.U], [0.79, 0.45, PH.U], [0.79, 0.36, -0.26]], 0xd85a30, 2.5, { part: 'vt', layer: 'int', cond: 'U', side: 'load' });
    G.wire([[0.79, YC, PH.V], [0.79, 0.45, PH.V], [0.79, 0.36, -0.1]], 0xd85a30, 2.5, { part: 'vt', layer: 'int', cond: 'V', side: 'load' });
    G.wire([[0.95, 0.12, -0.3], [0.85, 0.08, -0.5], [0.8, 0.05, -0.55]], 0x378add, 2.5, { part: 'ctrl', layer: 'int' });
    /* LA（各相と大地） */
    PHS.forEach(function (ph) {
      var z = PH[ph];
      G.cyl(0.06, 0.28, 1.25, 0.32, z, 0x6d7f8c, 'y', { part: 'la', layer: 'int' }, { seg: 12 });
      G.wire([[1.25, YC, z], [1.25, 0.46, z]], CU, 2.5, { part: 'la', layer: 'int', cond: ph, side: 'load' });
      G.wire([[1.25, 0.18, z], [1.25, 0.08, z]], 0x3b6d11, 2.5, { part: 'la', layer: 'int' });
    });
    G.box(0.06, 0.03, 0.86, 1.25, 0.07, 0, 0x3b6d11, { part: 'gnd', layer: 'int' });
    /* TC（模式） */
    G.box(0.14, 0.14, 0.14, -0.72, 0.3, 0.3, 0xc9874a, { part: 'tc', layer: 'int' });
    /* ---- 試験の場面（外観では出さない） ---- */
    if (mode !== 'op') return;
    PHS.forEach(function (ph) {
      var z = CZ[ph];
      G.cyl(0.045, 0.22, CX, TOPY - 0.12, z, 0x3a3a38, 'y', { part: 'cable' }, { seg: 10 });
      G.cyl(0.07, 0.05, CX, TOPY - 0.03, z, 0x55595e, 'y', { part: 'cable' }, { seg: 10 });
      G.box(0.05, 0.1, 0.035, CX, TOPY + 0.06, z, 0xb8b8b4, { part: 'cable', cond: 'cable' });
      G.cyl(0.045, 0.22, CX, BOTY + 0.12, z, 0x3a3a38, 'y', { part: 'cable' }, { seg: 10 });
      G.cyl(0.07, 0.05, CX, BOTY + 0.03, z, 0x55595e, 'y', { part: 'cable' }, { seg: 10 });
      G.box(0.05, 0.1, 0.035, CX, BOTY - 0.06, z, 0xb8b8b4, { part: 'cable', cond: 'cable' });
      G.wire(CORE[ph], 0x2c2c2a, 3, { part: 'cable', cond: 'cable' });
    });
    G.wire([[CX, -1.2, 0], [CX, -1.4, 0], [CX, -1.6, 0]], 0x1f1f1d, 9, { part: 'cable' });
    /* 柱の上の4口クリップ */
    G.box(0.1, 0.12, 0.1, PC[0], PC[1], PC[2], 0x8c2f1a, { part: 'clip', cond: 'clip' });
    PHS.forEach(function (ph) {
      if (st.miss === ph) return;
      var L = LUGP[ph];
      G.wire([PC, [(PC[0] + L[0]) / 2, (PC[1] + L[1]) / 2 - 0.1, (PC[2] + L[2]) / 2], [L[0], L[1] - 0.05, L[2]]], 0x8c2f1a, 3.6, { part: 'clip', cond: 'clip' });
      G.box(0.09, 0.07, 0.08, L[0], L[1] - 0.02, L[2], 0xd9a227, { part: 'clip' });
    });
    G.wire([PC, [2.5, -0.5, 0.25], [TOPLUG.U[0], TOPLUG.U[1] + 0.06, TOPLUG.U[2]]], 0x8c2f1a, 3.6, { part: 'clip', cond: 'clip' });
    G.box(0.09, 0.07, 0.08, TOPLUG.U[0], TOPLUG.U[1] + 0.03, TOPLUG.U[2], 0xd9a227, { part: 'clip' });
    /* キュービクル側の三線短絡と試験器・接地 */
    G.box(0.1, 0.12, 0.1, CC[0], CC[1], CC[2], 0x8c2f1a, { part: 'clip', cond: 'clip' });
    PHS.forEach(function (ph) { var L = BOTLUG[ph]; G.wire([CC, [(CC[0] + L[0]) / 2, CC[1] - 0.05, (CC[2] + L[2]) / 2], [L[0], L[1] - 0.04, L[2]]], 0x8c2f1a, 3.6, { part: 'clip', cond: 'clip' }); G.box(0.09, 0.07, 0.08, L[0], L[1] - 0.03, L[2], 0xd9a227, { part: 'clip' }); });
    G.box(0.42, 0.26, 0.3, TS[0], TS[1], TS[2], 0xfdeee8, { part: 'tester' });
    G.wire([[TS[0] + 0.21, TS[1] + 0.05, TS[2] - 0.05], [2.45, -2.45, 0.85], CC], 0xd85a30, 4, { part: 'tester', cond: 'clip' });
    G.box(0.5, 0.04, 0.32, GP[0], GP[1], GP[2], 0x3b6d11, { part: 'gnd' });
    G.wire([[1.15, 0.06, 0.66], [1.1, -1.0, 0.9], [GP[0] + 0.05, GP[1] + 0.02, GP[2]]], 0x3b6d11, 3, { part: 'gnd' });
    G.wire([[TS[0] - 0.2, TS[1] - 0.1, TS[2]], [1.45, -2.67, 1.0], [GP[0] + 0.2, GP[1] + 0.02, GP[2]]], 0x3b6d11, 3, { part: 'gnd' });
    G.wire([[CX, BOTY + 0.2, CZ.W], [2.05, -2.25, 0.85], [GP[0] + 0.15, GP[1] + 0.02, GP[2] - 0.1]], 0x3b6d11, 2.5, { part: 'gnd' });
    /* 電流：往路（試験器 → 三線短絡 → 各心・クリップ → PAS）と帰路（遮へい層・外箱 → 接地 → 試験器E） */
    if (!st.volt) return;
    var feed = [[TS[0] + 0.21, TS[1] + 0.05, TS[2] - 0.05], [2.45, -2.45, 0.85], CC];
    PHS.forEach(function (ph) {
      var pts = feed.concat([[BOTLUG[ph][0], BOTLUG[ph][1] - 0.04, BOTLUG[ph][2]]], CORE[ph].slice().reverse(), [TOPLUG[ph]]);
      if (ph === 'U') pts = pts.concat([[2.5, -0.5, 0.25], PC]);
      G.flow(pts, { speed: 0.6, m: { part: 'cable' } });
    });
    PHS.forEach(function (ph) {
      if (st.miss === ph) return;
      var L = LUGP[ph], z = PH[ph], r = [PC, [(PC[0] + L[0]) / 2, (PC[1] + L[1]) / 2 - 0.1, (PC[2] + L[2]) / 2], [L[0], L[1] - 0.05, L[2]], [1.95, -0.17, z], [1.92, 0.3, z], [1.79, YC, z], [0.4, YC, z]];
      if (st.on) r = r.concat([[-0.4, YC, z], [-1.79, YC, z], [-2.05, 0.75, z], SRCEND[ph]]);
      G.flow(r, { speed: 0.6, m: { part: 'clip' } });
    });
    if (st.miss && VTPH.indexOf(st.miss) >= 0) {
      var other = VTPH[0] === st.miss ? VTPH[1] : VTPH[0];
      var vt = [[0.79, YC, PH[other]], [0.79, 0.45, PH[other]], [0.79, 0.36, other === 'U' ? -0.26 : -0.1], [0.85, 0.24, -0.18], [0.79, 0.36, st.miss === 'U' ? -0.26 : -0.1], [0.79, 0.45, PH[st.miss]], [0.79, YC, PH[st.miss]], [1.79, YC, PH[st.miss]], [1.92, 0.3, PH[st.miss]], [1.95, -0.17, PH[st.miss]]];
      G.flow(vt, { col: 'bad', speed: 0.7, m: { part: 'vt', layer: 'int' } });
    }
    if (st.dc) PHS.forEach(function (ph) { var z = PH[ph]; G.flow([[1.25, YC, z], [1.25, 0.46, z], [1.25, 0.18, z], [1.25, 0.08, z], [1.25, 0.07, 0.4], [1.15, 0.08, 0.62]], { col: 'bad', speed: 0.5, m: { part: 'la', layer: 'int' } }); });
    G.flow([[GP[0] + 0.15, GP[1] + 0.02, GP[2] - 0.1], [GP[0] + 0.2, GP[1] + 0.02, GP[2]], [1.45, -2.67, 1.0], [TS[0] - 0.2, TS[1] - 0.1, TS[2]]], { speed: 0.6, m: { part: 'gnd' } });
    G.flow([[CX, BOTY + 0.2, CZ.W], [2.05, -2.25, 0.85], [GP[0] + 0.15, GP[1] + 0.02, GP[2] - 0.1]], { speed: 0.6, m: { part: 'gnd' } });
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !st.volt || !m.cond) return null;
    var red = [240, 153, 123];
    if (m.cond === 'cable' || m.cond === 'clip') return { c: red, k: 0.65 };
    if (PHS.indexOf(m.cond) >= 0) {
      if (m.side === 'src') return st.on && st.miss !== m.cond ? { c: red, k: 0.65 } : null;
      if (st.miss === m.cond) return VTPH.indexOf(m.cond) >= 0 ? { c: [239, 159, 39], k: 0.6 } : null;
      return { c: red, k: 0.65 };
    }
    return null;
  }
  var labels = [
    { part: 'bsrc', t: '電源側', p: [-2.3, 1.2, 0] },
    { part: 'bload', t: '負荷側', p: [1.85, 0.95, 0] },
    { part: 'mech', t: '操作ハンドル・入切表示', p: [-0.95, 0.1, 0.7] },
    { part: 'tank', t: '外箱', p: [0.2, 1.15, 0.5], layer: 'ext-only' },
    { part: 'gnd', t: '接地端子', p: [1.15, -0.05, 0.7], layer: 'ext-only' },
    { part: 'ctrl', t: '制御線', p: [0.3, -1.0, -1.0] },
    { part: 'vt', t: 'VT（仮にU–V）', p: [0.85, 0.02, -0.18], layer: 'int' },
    { part: 'la', t: 'LA', p: [1.25, 0.0, 0.5], layer: 'int' },
    { part: 'zct', t: 'ZCT', p: [0.35, YC + 0.3, -0.48], layer: 'int' },
    { part: 'contact', t: '主接点', p: [-0.4, YC + 0.4, 0.35], layer: 'int' },
    { part: 'clip', t: '柱の上 4口クリップ', p: [2.3, -0.75, 0.9], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { part: 'cable', t: '立上りケーブル', p: [2.95, -1.4, 0], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { part: 'clip', t: '三線短絡', p: [3.2, -2.62, 0.45], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { part: 'tester', t: '耐圧試験器', p: [TS[0], TS[1] - 0.3, TS[2]], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { t: '帰路：遮へい層・外箱→接地→試験器E', p: [1.2, -2.95, 1.0], layer: 'int', when: function (s) { return s.volt; } },
    { t: 'U：VTの巻線を通って充電', p: [1.25, -0.6, -0.6], hot: true, layer: 'int', when: function (s) { return s.miss === 'U'; } },
    { t: 'W：試験されない', p: [1.25, -0.6, 0.62], hot: true, layer: 'int', when: function (s) { return s.miss === 'W'; } },
    { t: 'LA に直流 → 動作のおそれ', p: [1.25, -0.2, -0.6], hot: true, layer: 'int', when: function (s) { return s.dc; } },
    { t: '電源側まで充電', p: [-2.3, 0.6, 0.6], hot: true, layer: 'int', when: function (s) { return s.on && s.volt; } }
  ];
  var base = { on: false, volt: false, miss: '', dc: false };
  var scenarios = [
    { name: '3相一括（PAS切）', steps: [
      { t: '結線：柱の上とキュービクル側でクリップ', x: '柱の上の4口クリップで PAS の負荷側 U・V・W とケーブル1心、キュービクル側の4口クリップで3心を三線短絡して試験器へ。PAS 3点・ケーブル上端3点・下端3点の9つの点が1つにつながる。', s: 'ok', st: { on: false, volt: false } },
      { t: '交流 10,350V をかける', x: '9つの点が同じ電位になる。VT の両端（2相）も同じ電位なので、VT の巻線に電流は流れない。黄色い粒は充電電流の往路（試験器 → 各心・PAS 負荷側）と帰路（遮へい層・外箱 → 接地 → 試験器 E）。LA には 10,350V がかかるが、AC12kV 未満の範囲。', s: 'ok', st: { volt: true }, hz: '制御線・SOG 制御装置の処置は、その機種の取扱説明書に従う。Vc 端子は接地しない（VT 焼損）。' }
    ] },
    { name: '3相一括（PAS入）', steps: [
      { t: 'PAS を「入」にして試験電圧をかける', x: '主接点を通って、電源側ブッシングと電源側リードまで充電される。その先に電線がつながっていれば、そこまで充電され、充電電流も増える。', s: 'warn', st: { on: true, volt: true }, hz: '引込線（配電線側）から確実に切り離されていることが前提。戸上電機の資料で入・切の指定は確認できていない（日本高圧電気の取扱説明書は、ケーブルを含む試験で「切」を指定）。' }
    ] },
    { name: 'VTの相をつかみ忘れ', steps: [
      { t: '柱の上で、VT につながる相（図では U）をつかみ忘れる', x: 'つかみ忘れた U には、VT の巻線という細い道しか残らない。U の対地静電容量を充電する電流（赤い粒）が、全部 VT の巻線を通る。巻線の両端に電位差ができ、VT に電圧と電流がかかる。', s: 'ng', st: { on: false, volt: true, miss: 'U' }, hz: '戸上電機は、一相ごとの耐電圧試験は VT が焼損するので行わないよう示している。PAS の U・V・W は柱の上で必ず全部つかむ。' }
    ] },
    { name: 'VTのない相をつかみ忘れ', steps: [
      { t: '柱の上で、VT につながらない相（図では W）をつかみ忘れる', x: 'W は VT とつながっていないので、電流の通り道がない。W は試験されないだけで、VT は守られる。ただし試験範囲が欠ける。', s: 'warn', st: { on: false, volt: true, miss: 'W' }, hz: 'どの2相に VT がつながるかは機種で異なり、戸上電機の資料では未確認。どの相も必ずつかむ。' }
    ] },
    { name: '直流で試験', steps: [
      { t: '直流 20,700V をかける', x: 'LA の動作開始電圧（AC17kV 以上・波高値）を超えるおそれがあり、ZnO 素子に電流が流れて LA を傷める。', s: 'ng', st: { on: false, volt: true, dc: true }, hz: 'LA 内蔵形は、戸上電機の資料で AC12kV 以上・DC17kV 以上をかけないよう示されている。' }
    ] }
  ];
  function stateList(st) {
    return [['PAS', st.on ? '入' : '切', !!st.on], ['試験電圧', st.volt ? (st.dc ? '直流' : '交流 10,350V') : 'なし', !!st.dc], ['つかみ忘れ', st.miss || 'なし', !!st.miss], ['VT の巻線', st.miss && VTPH.indexOf(st.miss) >= 0 ? '電流が流れる' : '電流なし', !!(st.miss && VTPH.indexOf(st.miss) >= 0)]];
  }
  function svgUpdate(svg, st) {
    var q = function (id) { return svg.querySelector('#' + id); };
    ['U', 'V', 'W'].forEach(function (ph) { var e = q('ps-clip-' + ph); if (e) e.style.display = st.miss === ph ? 'none' : ''; });
    var Y = { U: 60, V: 100, W: 140 }; ['U', 'V', 'W'].forEach(function (ph) { var sw = q('ps-sw-' + ph); if (sw) sw.setAttribute('d', st.on ? 'M110 ' + Y[ph] + ' H150' : 'M110 ' + Y[ph] + ' L146 ' + (Y[ph] - 18)); });
    var on = q('ps-on'); if (on) on.style.display = st.on && st.volt ? '' : 'none';
    var dc = q('ps-dc'); if (dc) dc.style.display = st.dc ? '' : 'none';
    var vb = q('ps-vtbad'); if (vb) vb.style.display = st.miss === 'U' ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.pas = {
    title: 'VT・LA内蔵PAS', parts: parts,
    partOrder: ['bsrc', 'bload', 'mech', 'tank', 'gnd', 'ctrl', 'contact', 'zct', 'vt', 'la', 'tc', 'clip', 'cable', 'tester'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#pasWire', svgUpdate: svgUpdate,
    view: { yaw: -0.35, pitch: 0.3 },
    modeView: { op: { zoom: 0.78, target: [1.0, -0.95, 0.3], yaw: -0.45, pitch: 0.2 } },
    views: { front: { label: '正面', yaw: 0, pitch: 0.12 }, pole: { label: '柱の上のクリップ', yaw: -0.42, pitch: 0.22, zoom: 2.0, target: [2.2, -0.4, 0.25] }, cub: { label: 'キュービクル側', yaw: -0.3, pitch: 0.45, zoom: 2.0, target: [2.45, -2.35, 0.55] } },
    banner: { ext: ['参考：戸上電機 KLT-PA-D2N11LT', '!外形の寸法比・端子の向きは外形図と未照合'], int: ['!内部は模式：部品の形・位置は実機と異なる', 'VTの相は資料で未確認（仮にU–V）'], op: ['!内部は模式・VTは仮にU–V'], wire: [] }
  };
})();
