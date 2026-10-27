/* 計器用変圧器（参考：三菱電機 PD-100HF 6600/110V・ヒューズ付・モールド形）
   外観は利用者の実機写真と仕様（ヒューズ PL-G 7.2/3.6kV T1A 40kA・φ15×110）。
   内部（鉄心・巻線・リード）は資料がなく模式。ヒューズの手前・奥のどちらが電源側かは未確認。 */
(function () {
  'use strict';
  var BROWN = 0x8a4b2e, GREY = 0x6b7075, CU = 0xc9874a, SILV = 0xc9cacc, FUSE = 0xe2e2de;
  var FX = { U: -0.5, V: 0.5 }, FY = 1.3, FZ = 0.0;
  var parts = {
    top: { name: '一次側のモールド（茶色）', role: '一次の高圧部分を樹脂で固めた部分。2本のヒューズを、中央の仕切りで分けて載せている。', links: ['fuseU', 'fuseV', 'body'], ev: 'doc', note: '形は利用者の実機写真による。寸法比は外形図とは未照合。' },
    body: { name: '本体（灰色）・銘板', role: '鉄心と巻線を固めた本体。銘板に 6600/110V、1.0・1P、100VA、耐電圧 22/60kV、制限負荷 200VA などが書かれている。', links: ['top', 'sec', 'feet'], ev: 'doc', note: '銘板の値は利用者の実機写真による。' },
    fuseU: { name: '一次ヒューズ（U）', role: 'VT が絶縁破壊したとき、主回路の短絡事故に広がる前に VT 回路を切り離すためのヒューズ。VT そのものを守るためではない。', links: ['termU', 'prim'], ev: 'doc', note: 'PL-G 7.2/3.6kV T1A 40kA（仕様）。φ15×110（ヒューズカタログ p.7）。ヒューズの役割はカタログ p.12。' },
    fuseV: { name: '一次ヒューズ（V）', role: 'U 側と同じ。一次巻線のもう一方の端につながる。', links: ['termV', 'prim'], ev: 'doc', note: 'U 側と同じ資料。' },
    termU: { name: '一次接続端子 U（手前のキャップ）', role: '主回路の U 相をつなぐところ。耐圧試験では U と V を短絡してから試験電圧をかける。', links: ['fuseU'], ev: 'unk', note: '手前のキャップ側が電源側（表）かどうかは未確認。ヒューズを抜いてテスターで確かめる（下の説明）。' },
    termV: { name: '一次接続端子 V（手前のキャップ）', role: '主回路の V 相をつなぐところ。', links: ['fuseV'], ev: 'unk', note: 'U と同じく未確認。' },
    sec: { name: '二次端子 u・v', role: '電圧計・継電器へつなぐ 110V の端子。二次を短絡すると大きな電流が流れて巻線を傷めるので、短絡しない（耐圧試験のときは別）。', links: ['secw', 'body'], ev: 'doc', note: '二次短絡の禁止はカタログ p.5。端子の位置は実機写真による。' },
    feet: { name: '取付脚', role: '盤に取付ける金具。外箱・取付足は接地する。', links: ['body'], ev: 'doc', note: '接地はカタログ p.5〜6。形は写真による簡略化。' },
    core: { name: '鉄心（模式）', role: '一次と二次の巻線を通る磁束の通り道。', links: ['prim', 'secw'], ev: 'unk', note: '形・寸法は資料がなく未確認。原理を示す模式。' },
    prim: { name: '一次巻線（模式）', role: '細い線を多く巻いた巻線。6600V がかかる。巻数は二次の 60 倍（6600÷110）。', links: ['fuseU', 'fuseV', 'core'], ev: 'unk', note: '巻数比は定格から計算。配置・重ね方は未確認の模式。' },
    secw: { name: '二次巻線（模式）', role: '太い線を少なく巻いた巻線。110V が出る。', links: ['core', 'sec'], ev: 'unk', note: '配置は未確認の模式。' },
    test: { name: '耐圧試験器・試験の結線', role: '試験のときだけつなぐ。U–V を短絡したところに試験電圧（6,600V 系は 10,350V）をかける。E 端子は接地。', links: ['termU', 'termV'], ev: 'simp', note: '一般的な結線を描いた。試験条件は作業責任者の指示に従う。' }
  };
  function build(G, st, mode) {
    /* 取付脚 */
    G.box(0.32, 0.05, 0.9, -0.62, 0.03, 0, 0xb8bcc0, { part: 'feet' });
    G.box(0.32, 0.05, 0.9, 0.62, 0.03, 0, 0xb8bcc0, { part: 'feet' });
    /* 本体（灰色）と銘板 */
    G.box(1.25, 0.62, 0.78, 0, 0.38, 0, GREY, { part: 'body', shell: true, shellAlpha: 0.12 });
    G.box(0.6, 0.28, 0.01, 0.0, 0.42, 0.395, 0xf2f2ee, { part: 'body', layer: 'ext-only' });
    G.cyl(0.07, 0.01, 0.52, 0.42, 0.395, 0xdedede, 'z', { part: 'body', layer: 'ext-only' }, { seg: 14 });
    /* 二次端子（下の前） */
    G.box(0.36, 0.1, 0.14, 0, 0.06, 0.33, BROWN, { part: 'body', shell: true, shellAlpha: 0.12 });
    [-0.09, 0.09].forEach(function (x) { G.cyl(0.03, 0.08, x, 0.05, 0.43, SILV, 'z', { part: 'sec', cond: 's' }, { seg: 6 }); });
    /* 茶色のモールド：底・左右の壁・中央の仕切り */
    G.box(1.45, 0.16, 0.86, 0, 0.76, 0, BROWN, { part: 'top', shell: true, shellAlpha: 0.14 });
    G.box(0.12, 0.42, 0.86, -0.68, 1.05, 0, BROWN, { part: 'top', shell: true, shellAlpha: 0.14 });
    G.box(0.12, 0.42, 0.86, 0.68, 1.05, 0, BROWN, { part: 'top', shell: true, shellAlpha: 0.14 });
    G.box(0.1, 0.58, 0.86, 0, 1.13, 0, 0x7a4027, { part: 'top', shell: true, shellAlpha: 0.14 });
    G.box(0.36, 0.22, 0.4, -0.42, 0.93, 0.18, BROWN, { part: 'top', shell: true, shellAlpha: 0.14 });
    G.box(0.36, 0.22, 0.4, 0.42, 0.93, 0.18, BROWN, { part: 'top', shell: true, shellAlpha: 0.14 });
    /* ヒューズ（前後方向に寝かせて載る） */
    ['U', 'V'].forEach(function (ph) {
      var x = FX[ph], cond = ph;
      G.cyl(0.07, 0.62, x, FY, FZ, FUSE, 'z', { part: ph === 'U' ? 'fuseU' : 'fuseV', cond: cond }, { seg: 16 });
      G.cyl(0.1, 0.06, x, FY, 0.33, 0xb8b8b4, 'z', { part: ph === 'U' ? 'termU' : 'termV', cond: cond }, { seg: 16 });
      G.cyl(0.025, 0.06, x, FY, 0.38, 0x8e8e8a, 'z', { part: ph === 'U' ? 'termU' : 'termV', cond: cond }, { seg: 8 });
      G.box(0.18, 0.24, 0.06, x, FY - 0.04, -0.33, 0xa9abad, { part: ph === 'U' ? 'fuseU' : 'fuseV', cond: cond });
    });
    /* ---- 内部（模式） ---- */
    var K = 0x7d8085;
    G.box(0.8, 0.07, 0.3, 0, 0.62, 0, K, { part: 'core', layer: 'int' });
    G.box(0.8, 0.07, 0.3, 0, 0.14, 0, K, { part: 'core', layer: 'int' });
    G.box(0.08, 0.41, 0.3, -0.36, 0.38, 0, K, { part: 'core', layer: 'int' });
    G.box(0.08, 0.41, 0.3, 0.36, 0.38, 0, K, { part: 'core', layer: 'int' });
    G.box(0.12, 0.41, 0.3, 0, 0.38, 0, K, { part: 'core', layer: 'int' });
    G.cyl(0.12, 0.34, 0, 0.38, 0, 0x378add, 'y', { part: 'secw', layer: 'int', cond: 's' }, { seg: 18 });
    G.cyl(0.2, 0.36, 0, 0.38, 0, CU, 'y', { part: 'prim', layer: 'int', cond: 'prim', alpha: 0.6 }, { seg: 22, open: true });
    G.wire([[-0.14, 0.55, -0.12], [-0.3, 0.9, -0.28], [-0.5, FY - 0.08, -0.33]], CU, 2.5, { part: 'prim', layer: 'int', cond: 'U' });
    G.wire([[0.14, 0.55, -0.12], [0.3, 0.9, -0.28], [0.5, FY - 0.08, -0.33]], CU, 2.5, { part: 'prim', layer: 'int', cond: 'V' });
    G.wire([[-0.06, 0.22, 0.1], [-0.09, 0.1, 0.3], [-0.09, 0.05, 0.4]], 0x185fa5, 2.5, { part: 'secw', layer: 'int' });
    G.wire([[0.06, 0.22, 0.1], [0.09, 0.1, 0.3], [0.09, 0.05, 0.4]], 0x185fa5, 2.5, { part: 'secw', layer: 'int' });
    /* 試験の結線（耐圧の場面だけ） */
    if (mode !== 'ext' && st.test) {
      var T = [0.98, 1.72, 0.45];
      G.box(0.36, 0.22, 0.26, T[0], T[1], T[2], 0xfdeee8, { part: 'test', layer: 'int' });
      G.wire([[T[0] - 0.18, T[1], T[2]], [0.2, 1.75, 0.6], [-0.5, 1.5, 0.45], [-0.5, FY, 0.4]], 0xd85a30, 4, { part: 'test', layer: 'int', cond: 'U' });
      if (st.short) G.wire([[-0.5, FY, 0.41], [-0.25, 1.62, 0.55], [0.25, 1.62, 0.55], [0.5, FY, 0.41]], 0xd85a30, 3.5, { part: 'test', layer: 'int', cond: 'U' });
      if (st.vgnd) G.wire([[0.5, FY, 0.41], [0.78, 1.0, 0.55], [0.88, 0.1, 0.6], [0.92, -0.03, 0.6]], 0x3b6d11, 3.5, { part: 'test', layer: 'int' });
      G.wire([[-0.09, 0.05, 0.47], [0, -0.02, 0.55], [0.09, 0.05, 0.47]], 0x3b6d11, 3, { part: 'sec', layer: 'int' });
      G.wire([[0, -0.02, 0.55], [0.5, -0.03, 0.6], [0.92, -0.03, 0.6]], 0x3b6d11, 3, { part: 'feet', layer: 'int' });
      G.wire([[0.62, 0.05, 0.4], [0.8, -0.03, 0.55], [0.92, -0.03, 0.6]], 0x3b6d11, 2.5, { part: 'feet', layer: 'int' });
      G.wire([[T[0], T[1] - 0.11, T[2]], [T[0] + 0.05, 0.4, 0.6], [0.95, -0.03, 0.6]], 0x3b6d11, 2.5, { part: 'test', layer: 'int' });
      G.box(0.26, 0.03, 0.18, 0.95, -0.04, 0.6, 0x3b6d11, { part: 'feet', layer: 'int' });
    }
    /* 電流と磁束 */
    if (mode !== 'ext') {
      if (st.iex) {
        var path = [[-0.5, FY, 0.4], [-0.5, FY, -0.3], [-0.3, 0.9, -0.28], [-0.14, 0.55, -0.12], [-0.2, 0.45, 0.12], [0.2, 0.35, 0.12], [0.14, 0.55, -0.12], [0.3, 0.9, -0.28], [0.5, FY, -0.3], [0.5, FY, 0.4]];
        if (st.vgnd) path = path.concat([[0.78, 1.0, 0.55], [0.88, 0.1, 0.6], [0.92, -0.03, 0.6]]);
        G.flow(path, { col: st.bad ? 'bad' : 'cur', speed: st.bad ? 0.9 : 0.25, n: st.bad ? 22 : 10, m: { part: 'prim', layer: 'int' } });
      }
      if (st.isec) G.flow([[-0.09, 0.05, 0.47], [-0.09, 0.1, 0.3], [-0.06, 0.22, 0.1], [0, 0.3, 0.13], [0.06, 0.22, 0.1], [0.09, 0.1, 0.3], [0.09, 0.05, 0.47], [0, -0.02, 0.55], [-0.09, 0.05, 0.47]], { col: st.bad ? 'bad' : 'cur', speed: st.bad ? 1.0 : 0.3, m: { part: 'secw', layer: 'int' } });
      if (st.flux > 0.01) {
        [-1, 1].forEach(function (s) {
          G.flux([[0, 0.66, 0.17], [0.36 * s, 0.66, 0.17], [0.36 * s, 0.1, 0.17], [0, 0.1, 0.17]], { speed: 0.4, w: 1.2 + 2.6 * st.flux, m: { part: 'core', layer: 'int' } });
        });
      }
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond) return null;
    var red = [240, 153, 123];
    if (m.cond === 'U' && st.vU) return { c: red, k: 0.65 };
    if (m.cond === 'V' && st.vV) return { c: red, k: st.vV === 2 ? 0.3 : 0.65 };
    if (m.cond === 'prim' && (st.vU || st.vV)) return { c: red, k: 0.4 };
    if (m.cond === 's' && st.vs) return { c: red, k: 0.4 };
    return null;
  }
  var labels = [
    { part: 'termU', t: 'U', p: [-0.5, FY + 0.16, 0.42] },
    { part: 'termV', t: 'V', p: [0.5, FY + 0.16, 0.42] },
    { part: 'fuseU', t: '一次ヒューズ', p: [-0.5, FY + 0.12, -0.1] },
    { part: 'top', t: '一次側モールド', p: [-0.68, 1.3, 0.3], layer: 'ext-only' },
    { part: 'body', t: '銘板', p: [0, 0.6, 0.42], layer: 'ext-only' },
    { part: 'sec', t: '二次 u・v', p: [0, -0.05, 0.5] },
    { part: 'feet', t: '取付脚', p: [0.62, 0.0, 0.5], layer: 'ext-only' },
    { part: 'core', t: '鉄心（模式）', p: [0.36, 0.7, 0.2], layer: 'int' },
    { part: 'prim', t: '一次巻線（模式）', p: [-0.32, 0.4, 0.2], layer: 'int' },
    { part: 'secw', t: '二次巻線（模式）', p: [0, 0.18, 0.25], layer: 'int' },
    { part: 'test', t: '耐圧試験器', p: [0.98, 1.88, 0.45], layer: 'int', when: function (s) { return s.test; } },
    { t: 'U–V 短絡', p: [0, 1.72, 0.55], layer: 'int', when: function (s) { return s.short; } },
    { t: 'V が大地に接触', p: [0.9, 0.55, 0.6], hot: true, layer: 'int', when: function (s) { return s.vgnd; } },
    { t: 'V は浮いている', p: [0.75, 1.5, 0.5], layer: 'int', when: function (s) { return s.test && !s.short && !s.vgnd; } }
  ];
  var base = { test: false, short: false, vgnd: false, vU: false, vV: false, vs: false, iex: false, isec: false, flux: 0, bad: false };
  var scenarios = [
    { name: 'ふだんの使い方', steps: [
      { t: '一次の U–V 間に 6,600V', x: '主回路の U 相と V 相のあいだの電圧が、ヒューズを通って一次巻線にかかる。流れるのは鉄心を励磁する小さな電流だけ（交流なので向きは1秒に何十回も入れかわる。粒は半周期分の向き）。', s: 'ok', st: { vU: true, vV: true, iex: true, flux: 0.5 } },
      { t: '二次に 110V が出る', x: '磁束が二次巻線を通り抜けて、巻数比（60:1）で 110V が出る。計器・継電器へ小さな電流が流れる。', s: 'ok', st: { vs: true } }
    ] },
    { name: '耐圧：U–V短絡（正しい）', steps: [
      { t: 'U–V を短絡して試験電圧をかける', x: '一次巻線の両端が同じ電位になるので、巻線に電圧はかからず、磁束もできない。一次と大地（外箱・鉄心・二次）のあいだの絶縁だけに試験電圧がかかる。', s: 'ok', st: { test: true, short: true, vU: true, vV: true }, hz: '二次 u–v は短絡して接地、外箱・取付脚も接地。試験後は十分に放電する。' }
    ] },
    { name: '耐圧：Uだけ・V浮き', steps: [
      { t: 'U だけに試験電圧、V はどこにもつながらない', x: '等価回路：試験器 → 一次巻線 → V 端の対地静電容量 → 大地。二次は短絡しているので、一次から見た巻線は小さなインピーダンス（漏れインピーダンス）。V 端の対地静電容量のインピーダンスのほうがずっと大きいので、電圧のほとんどは静電容量にかかり、巻線にかかるのはわずか。V も U とほぼ同じ電位になる。', s: 'warn', st: { test: true, short: false, vU: true, vV: 2 }, hz: '仮定：V 端の先に何もつながっていない。V に電線や機器がつながると静電容量が増え、巻線にかかる電圧が大きくなることがある。浮いているかどうかは現場で保証できない。' }
    ] },
    { name: '耐圧：Uだけ・V接地', steps: [
      { t: 'V 端が大地とつながっている', x: '一次巻線の両端に、試験電圧がそのままかかる（10,350V は定格 6,600V の約 1.6 倍）。VT として動いてしまい、鉄心は強く励磁される。', s: 'ng', st: { test: true, short: false, vgnd: true, vU: true, vV: false, flux: 1 } },
      { t: '二次は短絡しているので、大きな電流が流れる', x: '二次を短絡したまま一次を励磁する状態。電流の大きさは、その VT の短絡インピーダンスで決まり、定格を大きく超えうる。どれだけの電流・何秒で焼損するかは、機種の特性がないので出さない。T1A のヒューズが先に切れるとも限らない。', s: 'ng', st: { iex: true, isec: true, bad: true }, hz: '焼損・試験器の過電流トリップのおそれ。U–V の短絡を目で確かめてから電圧をかける。' }
    ] }
  ];
  function stateList(st) {
    return [['U–V', st.short ? '短絡' : (st.test ? '短絡なし' : '主回路'), st.test && !st.short], ['V 端', st.vgnd ? '大地に接触' : (st.test && !st.short ? '浮き' : '−'), !!st.vgnd], ['巻線の電圧', st.vgnd ? '試験電圧ほぼ全部' : (st.test ? (st.short ? '0' : 'わずか') : '6,600V'), !!st.vgnd], ['磁束', st.flux > 0.8 ? '大' : st.flux > 0 ? 'ふだん' : 'なし', st.flux > 0.8]];
  }
  function svgUpdate(svg, st) {
    ['vt-short', 'vt-vgnd', 'vt-float', 'vt-normal'].forEach(function (id) { var e = svg.querySelector('#' + id); if (e) e.style.display = 'none'; });
    var on = st.test ? (st.short ? 'vt-short' : st.vgnd ? 'vt-vgnd' : 'vt-float') : 'vt-normal';
    var e = svg.querySelector('#' + on); if (e) e.style.display = '';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.vt = {
    title: '計器用変圧器', parts: parts,
    partOrder: ['termU', 'termV', 'fuseU', 'fuseV', 'top', 'body', 'sec', 'feet', 'core', 'prim', 'secw', 'test'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#vtWire', svgUpdate: svgUpdate,
    view: { yaw: -0.6, pitch: 0.3 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.1 }, side: { label: '横', yaw: -1.5, pitch: 0.1 }, top: { label: '上', yaw: 0, pitch: 1.3 } },
    banner: { ext: ['参考：三菱電機 PD-100HF（実機写真）', '!寸法比は外形図と未照合'], int: ['!鉄心・巻線・リードは模式（実機の形ではない）'], op: ['!鉄心・巻線は模式'], wire: [] }
  };
})();
