/* 接地形計器用変圧器 EVT（参考：東光高岳 モールド形EVT GC-1 6600/√3・110/√3・190/3V）
   資料で確かめたこと：
   ・東光高岳 製品ページ（モールド形接地形計器用変圧器）：GC-1 の定格電圧 一次 6600/√3V・二次 110/√3V・三次 110/3 または 190/3V、
     耐電圧 13.2/60kV、階級 1P/3G、定格負担 50〜200VA、中性点接地構造で使用時は必ず接地。ヒューズ付きもある（6.6kV 1A 44kA）。
   ・三菱電機 計器用変成器カタログ：「EVTの一次接地側端子は使用時に必ず接地してください」、3G は地絡継電器用。
   ・利昌工業 Products News 241：EVT は Y－開放Δ結線、三次の開放Δに制限抵抗を接続して鉄共振などの異常現象を防ぐ。
   資料で確かめられなかったこと：外形・寸法・質量、端子の記号と位置、鉄心と巻線の配置（すべて模式）。
   この模型は「単相EVTを3台で1組」として描いた。三相一体形もある。 */
(function () {
  'use strict';
  var MOLD = 0x3f4a52, MOLD2 = 0x55626b, CAP = 0xc9cacc, BASE = 0x9aa2a8, CU = 0xc9874a, SEC = 0x1d9e75, TER = 0xd85a30, GND = 0x3b6d11;
  var PH = ['U', 'V', 'W'], X = { U: -1.35, V: 0, W: 1.35 };
  var TB = 0.55, TZ = 0.47; /* 低圧端子台の高さと前面位置 */
  var TX = { e: -0.3, s1: -0.15, s2: 0, t1: 0.15, t2: 0.3 }; /* 端子の並び（模式） */
  var HVY = { U: 2.55, V: 2.75, W: 2.95 };

  var parts = {
    body: { name: 'モールド本体', role: '鉄心と巻線を樹脂で固めた本体。1台で1相ぶん。3台で1組にして、高圧の各相と大地の間につなぐ。', links: ['bush', 'core', 'term'], ev: 'simp', note: 'モールド形であることは製品ページによる。形・寸法は資料で確かめられず模式。三相一体形もある。' },
    bush: { name: '一次端子（高圧側）', role: '高圧の1相につなぐ端子。もう一方の一次の端は、本体の中で一次接地側端子へつながる。', links: ['prim', 'hv'], ev: 'simp', note: '一次 6600/√3 V（製品ページ）。がいしの形・ヒューズの有無は機種で異なり、ここでは模式。' },
    term: { name: '低圧端子台', role: '一次接地側（E）、二次（2本）、三次（2本）の端子が並ぶ。', links: ['gnd', 'sec', 'ter'], ev: 'unk', note: '端子の数・並び・記号は資料で確認できず模式。実機は銘板・端子表示で確かめる。' },
    foot: { name: '取付台', role: '盤に固定する台。外箱・取付台は接地する。', links: ['body'], ev: 'simp', note: '形は模式。' },
    core: { name: '鉄心（模式）', role: '一次・二次・三次の巻線が同じ鉄心に巻かれていて、磁束でつながる。', links: ['prim', 'sec', 'ter'], ev: 'unk', note: '鉄心の形・寸法は資料になく模式。' },
    prim: { name: '一次巻線（Y結線・中性点接地）', role: '高圧の1相と大地の間につながる巻線。3台で Y 結線になり、中性点を接地する。ふだんは約3,810V（6600/√3）がかかる。', links: ['bush', 'gnd', 'core'], ev: 'doc', note: '一次 6600/√3 V は製品ページ。一次接地側端子を必ず接地することは三菱カタログ。巻線の配置は模式。' },
    sec: { name: '二次巻線（Y結線・110/√3V）', role: '3台の二次を Y 結線にして、線間 110V を電圧計や UVR・OVR へ送る。ふつうの VT と同じ役目。', links: ['core', 'meter'], ev: 'doc', note: '二次 110/√3 V は製品ページ。結線の描き方は模式。' },
    ter: { name: '三次巻線（オープンデルタ・190/3V）', role: '3台の三次を直列につなぎ、両端を開いたまま取り出す。ふだんは合計0V、地絡すると零相電圧（完全地絡で約190V）が出る。', links: ['core', 'clr', 'relay'], ev: 'doc', note: '三次 190/3 V は製品ページ。Y－開放Δ結線は利昌 PN241。' },
    gnd: { name: '一次接地側端子と接地', role: '3台の一次接地側を結んで大地へ。これで一次が Y 結線・中性点接地になる。', links: ['prim'], ev: 'doc', note: '「EVTの一次接地側端子は使用時に必ず接地」（三菱カタログ）。' },
    hv: { name: '高圧母線（U・V・W）', role: '主回路の3相。EVT の一次端子がそれぞれの相につながる。', links: ['bush'], ev: 'simp', note: '場面の説明用。' },
    clr: { name: '制限抵抗（CLR）', role: '三次の開いた両端の間につなぐ抵抗。鉄共振などの異常を防ぐ。', links: ['ter', 'relay'], ev: 'doc', note: '開放Δに制限抵抗を接続して鉄共振などを防ぐ（利昌 PN241）。抵抗値・形は機種によるので模式。' },
    relay: { name: 'OVGR・DGR（例）', role: '三次の零相電圧（V₀）を受けて地絡を判定する。', links: ['ter', 'clr'], ev: 'simp', note: '3G は地絡継電器用（三菱カタログ）。場面の説明用。' },
    meter: { name: '電圧計・UVR・OVR（例）', role: '二次の線間 110V を受ける。', links: ['sec'], ev: 'simp', note: '場面の説明用。' },
    test: { name: '試験器', role: '保護継電器試験器。零相電圧の代わりの電圧を出す。', links: ['ter', 'relay'], ev: 'simp', note: '場面の説明用。実際の結線は継電器と試験器の取扱説明書による。' }
  };

  function unit(G, ph) {
    var x = X[ph], m = { part: 'body', shell: true, shellAlpha: 0.12 };
    G.box(1.0, 0.08, 0.9, x, 0.04, 0, BASE, { part: 'foot' });
    G.box(0.92, 1.0, 0.8, x, 0.58, 0, MOLD, m);
    G.box(0.6, 0.12, 0.55, x, 1.14, 0, MOLD2, m);
    /* 一次端子（がいし形・模式） */
    G.cyl(0.17, 0.42, x, 1.41, 0, MOLD2, 'y', { part: 'bush', cond: 'p' + ph }, { seg: 18, r2: 0.11 });
    [1.3, 1.42, 1.54].forEach(function (y) { G.cyl(0.2, 0.035, x, y, 0, MOLD2, 'y', { part: 'bush', cond: 'p' + ph }, { seg: 18 }); });
    G.cyl(0.06, 0.16, x, 1.7, 0, CAP, 'y', { part: 'bush', cond: 'p' + ph }, { seg: 10 });
    /* 低圧端子台（前面・模式） */
    G.box(0.78, 0.2, 0.08, x, TB, 0.43, 0x2a2e33, { part: 'term' });
    Object.keys(TX).forEach(function (k) {
      var c = k === 'e' ? 'e' : k.charAt(0) === 's' ? 's' : 't';
      G.cyl(0.035, 0.07, x + TX[k], TB, TZ, CAP, 'z', { part: k === 'e' ? 'gnd' : k.charAt(0) === 's' ? 'sec' : 'ter', cond: c + ph }, { seg: 8 });
    });
    /* 銘板 */
    G.box(0.36, 0.2, 0.01, x, 0.86, 0.405, 0xf2f2ee, { part: 'body', layer: 'ext-only' });
    /* ---- 内部（模式）：日の字鉄心に、内から 二次・三次・一次 ---- */
    var K = 0x7d8085, cy = 0.62;
    G.box(0.66, 0.07, 0.26, x, cy + 0.36, 0, K, { part: 'core', layer: 'int' });
    G.box(0.66, 0.07, 0.26, x, cy - 0.36, 0, K, { part: 'core', layer: 'int' });
    G.box(0.07, 0.65, 0.26, x - 0.3, cy, 0, K, { part: 'core', layer: 'int' });
    G.box(0.07, 0.65, 0.26, x + 0.3, cy, 0, K, { part: 'core', layer: 'int' });
    G.box(0.1, 0.65, 0.26, x, cy, 0, K, { part: 'core', layer: 'int' });
    G.cyl(0.1, 0.5, x, cy, 0, SEC, 'y', { part: 'sec', layer: 'int', cond: 's' + ph }, { seg: 16 });
    G.cyl(0.14, 0.52, x, cy, 0, TER, 'y', { part: 'ter', layer: 'int', cond: 't' + ph, alpha: 0.7 }, { seg: 18, open: true });
    G.cyl(0.2, 0.56, x, cy, 0, CU, 'y', { part: 'prim', layer: 'int', cond: 'p' + ph, alpha: 0.55 }, { seg: 20, open: true });
    /* リード（模式） */
    G.wire([[x - 0.06, cy + 0.28, -0.1], [x - 0.04, 1.1, -0.05], [x, 1.33, 0]], CU, 2.5, { part: 'prim', layer: 'int', cond: 'p' + ph });
    G.wire([[x + 0.08, cy - 0.28, 0.1], [x - 0.2, 0.42, 0.3], [x + TX.e, TB, 0.43]], CU, 2.2, { part: 'prim', layer: 'int', cond: 'e' + ph });
    G.wire([[x - 0.04, cy - 0.26, 0.08], [x - 0.1, 0.42, 0.32], [x + TX.s1, TB, 0.43]], 0x0f6e56, 2, { part: 'sec', layer: 'int', cond: 's' + ph });
    G.wire([[x + 0.02, cy - 0.26, 0.08], [x + 0.01, 0.42, 0.34], [x + TX.s2, TB, 0.43]], 0x0f6e56, 2, { part: 'sec', layer: 'int', cond: 's' + ph });
    G.wire([[x + 0.1, cy - 0.27, 0.1], [x + 0.13, 0.42, 0.34], [x + TX.t1, TB, 0.43]], 0x993c1d, 2, { part: 'ter', layer: 'int', cond: 't' + ph });
    G.wire([[x + 0.14, cy - 0.27, 0.1], [x + 0.26, 0.42, 0.34], [x + TX.t2, TB, 0.43]], 0x993c1d, 2, { part: 'ter', layer: 'int', cond: 't' + ph });
  }

  function T(ph, k) { return [X[ph] + TX[k], TB, TZ + 0.04]; }

  function build(G, st, mode) {
    PH.forEach(function (ph) { unit(G, ph); });
    if (mode === 'ext') return;
    /* 高圧母線と一次端子へのつなぎ */
    PH.forEach(function (ph) {
      G.rod([-2.4, HVY[ph], -0.25], [2.4, HVY[ph], -0.25], 0.035, 0x6b7075, { part: 'hv', cond: 'p' + ph, layer: 'int' }, 6);
      G.wire([[X[ph], 1.78, 0], [X[ph], HVY[ph] - 0.2, -0.15], [X[ph], HVY[ph], -0.25]], CU, 3, { part: 'bush', cond: 'p' + ph, layer: 'int' });
    });
    /* 一次接地側：3台を結んで接地 */
    var e = PH.map(function (ph) { return T(ph, 'e'); });
    var GX = -2.15;
    G.wire([e[2], [e[2][0], 0.3, 0.7], [GX, 0.3, 0.7]], GND, 3, { part: 'gnd', layer: 'int' }, false);
    G.wire([e[1], [e[1][0], 0.3, 0.7]], GND, 3, { part: 'gnd', layer: 'int' }, false);
    G.wire([e[0], [e[0][0], 0.3, 0.7]], GND, 3, { part: 'gnd', layer: 'int' }, false);
    G.wire([[GX, 0.3, 0.7], [GX, -0.05, 0.7]], GND, 3, { part: 'gnd', layer: 'int' }, false);
    [0.24, 0.16, 0.08].forEach(function (w, i) { G.box(w, 0.02, 0.02, GX, -0.06 - i * 0.05, 0.7, GND, { part: 'gnd', layer: 'int' }); });
    /* 二次：Y結線（s2 を結んで中性点 o）、s1 を計器へ */
    var s2 = PH.map(function (ph) { return T(ph, 's2'); });
    G.wire([s2[0], [s2[0][0], 0.76, 0.75], [s2[2][0], 0.76, 0.75], s2[2]], 0x0f6e56, 2.5, { part: 'sec', layer: 'int' }, false);
    G.wire([s2[1], [s2[1][0], 0.76, 0.75]], 0x0f6e56, 2.5, { part: 'sec', layer: 'int' }, false);
    var MT = [-2.55, 1.0, 0.9];
    G.box(0.5, 0.42, 0.3, MT[0], MT[1], MT[2], 0xe8edf2, { part: 'meter', layer: 'int' });
    PH.forEach(function (ph, i) {
      var p = T(ph, 's1');
      G.wire([p, [p[0], 0.9 + i * 0.06, 0.9], [MT[0] + 0.25, 0.9 + i * 0.06, 0.9]], 0x0f6e56, 2, { part: 'sec', layer: 'int', cond: 's' + ph }, false);
    });
    /* 三次：直列（オープンデルタ）。U.t2→V.t1、V.t2→W.t1。両端 U.t1・W.t2 を CLR と継電器へ */
    var a = T('U', 't1'), b = T('W', 't2');
    G.wire([T('U', 't2'), [T('U', 't2')[0], 0.32, 0.95], [T('V', 't1')[0], 0.32, 0.95], T('V', 't1')], TER, 3, { part: 'ter', layer: 'int' }, false);
    G.wire([T('V', 't2'), [T('V', 't2')[0], 0.32, 0.95], [T('W', 't1')[0], 0.32, 0.95], T('W', 't1')], TER, 3, { part: 'ter', layer: 'int' }, false);
    var RY = [2.75, 1.05, 1.15], CL = [2.75, 0.45, 1.15];
    var aEnd = [a[0], 0.2, 1.25], bEnd = [b[0], 0.2, 1.25];
    G.wire([a, aEnd, [2.35, 0.2, 1.25]], TER, 3, { part: 'ter', layer: 'int' }, false);
    if (!st.iso) G.wire([b, [b[0], 0.12, 1.1], [2.35, 0.12, 1.1]], TER, 3, { part: 'ter', layer: 'int' }, false);
    else G.wire([b, [b[0], 0.12, 1.1], [b[0] + 0.25, 0.12, 1.1]], TER, 3, { part: 'ter', layer: 'int' }, false);
    G.box(0.5, 0.2, 0.2, CL[0], CL[1], CL[2], 0xf3e3c4, { part: 'clr', layer: 'int' });
    G.box(0.6, 0.42, 0.3, RY[0], RY[1], RY[2], 0xe8edf2, { part: 'relay', layer: 'int' });
    G.wire([[2.35, 0.2, 1.25], [2.5, 0.45, 1.2], [CL[0] - 0.25, CL[1], CL[2]]], TER, 2.5, { part: 'clr', layer: 'int' });
    G.wire([[2.35, 0.12, 1.1], [3.05, 0.2, 1.1], [CL[0] + 0.25, CL[1], CL[2]]], TER, 2.5, { part: 'clr', layer: 'int' });
    G.wire([[2.5, 0.45, 1.2], [2.55, 0.85, 1.15], [RY[0] - 0.3, RY[1] - 0.1, RY[2]]], TER, 2.5, { part: 'relay', layer: 'int' });
    G.wire([[3.05, 0.2, 1.1], [3.1, 0.85, 1.15], [RY[0] + 0.3, RY[1] - 0.1, RY[2]]], TER, 2.5, { part: 'relay', layer: 'int' });
    /* 試験器 */
    var TS = [3.0, 1.75, 1.0];
    if (st.test) {
      G.box(0.62, 0.36, 0.34, TS[0], TS[1], TS[2], 0xfdeee8, { part: 'test', layer: 'int' });
      if (!st.iso) {
        G.wire([[TS[0] - 0.31, TS[1] - 0.1, TS[2]], [1.9, 1.4, 1.2], [1.2, 0.7, 1.3], aEnd], 0xb83a2b, 3, { part: 'test', layer: 'int' });
        G.wire([[TS[0] - 0.2, TS[1] - 0.18, TS[2]], [2.2, 1.0, 1.3], [1.9, 0.3, 1.2], [b[0], 0.12, 1.1]], 0xb83a2b, 3, { part: 'test', layer: 'int' });
      } else {
        G.wire([[TS[0] - 0.2, TS[1] - 0.18, TS[2]], [2.45, 1.2, 1.25], [2.5, 0.45, 1.2]], 0xb83a2b, 3, { part: 'test', layer: 'int' });
        G.wire([[TS[0] + 0.2, TS[1] - 0.18, TS[2]], [3.2, 1.0, 1.15], [3.05, 0.2, 1.1]], 0xb83a2b, 3, { part: 'test', layer: 'int' });
      }
    }
    /* 磁束（各台）：大きさを線の太さで */
    var cy = 0.62;
    PH.forEach(function (ph) {
      var f = st.flux ? st.flux[ph] : 0, x = X[ph];
      if (f > 0.01) [-1, 1].forEach(function (s) {
        G.flux([[x, cy + 0.36, 0.15], [x + 0.3 * s, cy + 0.36, 0.15], [x + 0.3 * s, cy - 0.36, 0.15], [x, cy - 0.36, 0.15]], { speed: 0.4, w: 1 + 1.8 * f, m: { part: 'core', layer: 'int' } });
      });
    });
    /* 三次の電流：零相電圧が出ると CLR と継電器へ */
    if (st.v0 && !st.iso) {
      G.flow([a, aEnd, [2.35, 0.2, 1.25], [2.5, 0.45, 1.2], [CL[0] - 0.25, CL[1], CL[2]], [CL[0] + 0.25, CL[1], CL[2]], [3.05, 0.2, 1.1], [2.35, 0.12, 1.1], [b[0], 0.12, 1.1], b], { col: st.test ? 'bad' : 'cur', speed: 0.5, m: { part: 'clr', layer: 'int' } });
    }
    if (st.iso && st.test) {
      G.flow([[TS[0] - 0.2, TS[1] - 0.18, TS[2]], [2.45, 1.2, 1.25], [2.5, 0.45, 1.2], [CL[0] - 0.25, CL[1], CL[2]], [CL[0] + 0.25, CL[1], CL[2]], [3.05, 0.2, 1.1], [3.2, 1.0, 1.15], [TS[0] + 0.2, TS[1] - 0.18, TS[2]]], { speed: 0.45, m: { part: 'relay', layer: 'int' } });
    }
  }

  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond) return null;
    var red = [240, 153, 123], c = m.cond, k = c.charAt(0), ph = c.charAt(1);
    if (k === 'p' && st.vp && st.vp[ph]) return { c: red, k: st.vp[ph] > 1.5 ? 0.85 : 0.5 };
    if (k === 's' && st.vp && st.vp[ph] && !st.test) return { c: red, k: st.vp[ph] > 1.5 ? 0.6 : 0.35 };
    if (k === 't' && st.vp && st.vp[ph]) return { c: red, k: st.vp[ph] > 1.5 ? 0.6 : 0.35 };
    return null;
  }

  var labels = [
    { part: 'bush', t: '一次端子', p: [X.U, 1.95, 0], layer: 'ext-only' },
    { part: 'body', t: 'モールド本体（1台で1相）', p: [X.V, 1.35, 0.45], layer: 'ext-only' },
    { part: 'term', t: 'E・二次・三次の端子（模式）', p: [X.W, 0.3, 0.6], layer: 'ext-only' },
    { t: 'U', p: [X.U, 1.95, 0], layer: 'int' }, { t: 'V', p: [X.V, 1.95, 0], layer: 'int' }, { t: 'W', p: [X.W, 1.95, 0], layer: 'int' },
    { part: 'hv', t: '高圧母線 U・V・W', p: [-2.0, 3.15, -0.25], layer: 'int' },
    { part: 'prim', t: '一次（外側）', p: [X.U - 0.55, 0.95, 0.2], layer: 'int' },
    { part: 'ter', t: '三次（中）', p: [X.V - 0.5, 0.7, 0.25], layer: 'int' },
    { part: 'sec', t: '二次（内側）', p: [X.W + 0.55, 0.95, 0.2], layer: 'int' },
    { part: 'gnd', t: '一次の中性点を接地', p: [-2.15, -0.35, 0.7], layer: 'int' },
    { part: 'meter', t: '二次 → 計器・UVR', p: [-2.55, 1.4, 0.9], layer: 'int' },
    { part: 'clr', t: '制限抵抗 CLR', p: [2.75, 0.2, 1.3], layer: 'int' },
    { part: 'relay', t: '三次 → OVGR・DGR', p: [2.75, 1.45, 1.15], layer: 'int', when: function (s) { return !s.test; } },
    { t: '三次の開いた所：0 V', p: [0, 0.0, 1.3], layer: 'int', when: function (s) { return !s.v0 && !s.test; } },
    { t: '三次の開いた所：約190 V', p: [0, 0.0, 1.3], hot: true, layer: 'int', when: function (s) { return s.v0 && !s.test; } },
    { t: 'U相が完全地絡', p: [X.U, 2.25, 0.2], hot: true, layer: 'int', when: function (s) { return s.fault; } },
    { part: 'test', t: '試験器 190 V', p: [3.0, 2.1, 1.0], layer: 'int', when: function (s) { return s.test; } },
    { t: '高圧の3相に対地 約3,810 V', p: [0, 3.35, -0.25], hot: true, layer: 'int', when: function (s) { return s.test && !s.iso; } },
    { t: 'ここで切り離す', p: [X.W + 0.6, -0.1, 1.1], hot: true, layer: 'int', when: function (s) { return s.iso; } }
  ];

  var base = { vp: null, flux: null, v0: false, fault: false, test: false, iso: false };
  var N = { U: 1, V: 1, W: 1 }, F = { U: 0, V: 1.73, W: 1.73 };
  var scenarios = [
    { name: 'ふだん（地絡なし）', steps: [
      { t: '3台の一次に、それぞれ約3,810 V', x: '一次は高圧の各相と大地の間（Y結線・中性点接地）。1台あたり 6600/√3 ≒ 3,810 V がかかり、3台とも同じ大きさの磁束が回る（交流なので向きは入れかわる）。', s: 'ok', st: { vp: N, flux: N } },
      { t: '二次は線間110 V、三次の合計は0 V', x: '二次（Y結線）は線間 110 V を計器・UVR へ。三次は1台 63.3 V（190/3 V）ずつだが、120°ずつずれているので、直列にした両端では足し合わせて 0 V。OVGR・DGR には何も入らない。', s: 'ok', st: {} }
    ] },
    { name: '地絡が起きたとき', steps: [
      { t: 'U相が完全地絡', x: 'U相は大地と同じ電位になり、U の EVT の一次は 0 V。V・W 相は対地の電圧が √3 倍の約 6,600 V に上がる。V・W の台の磁束が大きくなり、U の台は磁束が消える。', s: 'ng', st: { vp: F, flux: F, fault: true } },
      { t: '三次の開いた所に約190 V', x: '三次の三角形が閉じなくなり、開いた所に零相電圧（3V₀）が出る。完全地絡で約 190 V。制限抵抗（CLR）と OVGR・DGR に電圧がかかり、継電器が整定値と比べて判定する。', s: 'warn', st: { v0: true }, hz: '二次の線間電圧は 110 V のまま。地絡は三次にだけはっきり表れる。電圧の大きさは完全地絡の理論値で、途中の地絡では 0〜190 V の間。' }
    ] },
    { name: '試験：三次から入れると', steps: [
      { t: 'EVT をつないだまま、三次の両端に 190 V', x: '開いた端子に入れた 190 V は、3台の三次に 63.3 V ずつ「同じ向き」にかかる。これは完全地絡と同じ状態。変圧器は逆向きにも働くので、巻数比で一次へ上がる。', s: 'ng', st: { test: true, vp: N, flux: N, v0: true }, hz: '一次 6600/√3 V・三次 190/3 V の例で、高圧の3相すべてに対地 約3,810 V（入れた電圧のざっと20倍）。停電中の高圧側が充電される。高圧側が短絡接地されていれば、逆に試験器から大電流が流れる。' },
      { t: '正しくは、EVT を切り離して継電器側へ入れる', x: '三次と継電器・CLR の間を切り離し、継電器側に試験電圧を入れる。EVT には電圧がかからず、高圧側へ上がることもない。', s: 'ok', st: { iso: true, vp: null, flux: null, v0: false }, hz: '切り離す箇所・入れる端子・換算は、継電器と EVT の取扱説明書、展開接続図、社内手順で確かめる。コンデンサ形 ZPD の T-E から入れる場合は、分圧なので昇圧しない（日記の記事を参照）。' }
    ] }
  ];
  function stateList(st) {
    var f = st.fault, t = st.test && !st.iso;
    return [
      ['U・V・W 対地（高圧）', t ? '3相とも 約3,810 V（逆加圧）' : f ? '0 / 約6,600 / 約6,600 V' : st.vp ? '3相とも 約3,810 V' : '−', !!(f || t)],
      ['二次 線間', st.test ? '−' : st.vp ? '110 V' : '−', false],
      ['三次の開いた所', st.iso ? '切り離し' : t ? '190 V（試験器）' : st.v0 ? '約190 V' : st.vp ? '0 V' : '−', !!st.v0]
    ];
  }
  function svgUpdate(svg, st) {
    var o = svg.querySelector('#ev-out'); if (o) o.textContent = st.iso ? '三次：切り離し' : st.test ? '三次：試験器 190 V' : st.v0 ? '三次の出力：約190 V' : '三次の出力：0 V';
    var g = svg.querySelector('#ev-fault'); if (g) g.style.display = st.fault ? '' : 'none';
    var w = svg.querySelector('#ev-back'); if (w) w.style.display = st.test && !st.iso ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.evt = {
    title: '接地形計器用変圧器 EVT', parts: parts,
    partOrder: ['bush', 'body', 'term', 'foot', 'core', 'prim', 'sec', 'ter', 'gnd', 'hv', 'meter', 'clr', 'relay', 'test'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#evtWire', svgUpdate: svgUpdate,
    view: { yaw: -0.5, pitch: 0.28 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.5, pitch: 0.1 }, top: { label: '上', yaw: 0, pitch: 1.3 } },
    modeView: { int: { zoom: 0.62, target: [0.25, 1.2, 0.4] }, op: { zoom: 0.62, target: [0.3, 1.2, 0.4], yaw: -0.35, pitch: 0.3 }, wire: { zoom: 0.62 } },
    banner: { ext: ['参考：東光高岳 GC-1（定格のみ）', '!外形・端子の並びは模式（資料で未確認）'], int: ['!鉄心・巻線・端子の配置は模式'], op: ['!電圧は完全地絡・三次190/3Vの例の理論値'], wire: [] }
  };
})();
