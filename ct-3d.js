/* 高圧変流器（参考：三菱電機 CD-25ENB 75/5A・モールド形・屋内）
   外観はうきわメモ利用者の実機写真と三菱電機の仕様。内部（巻線・鉄心）は資料がなく模式。 */
(function () {
  'use strict';
  var BLACK = 0x2a2c30, STEEL = 0xb8bcc0, CU = 0xc9874a, SILV = 0xc9cacc;
  var parts = {
    body: { name: 'モールド本体', role: '一次導体・二次巻線・鉄心を樹脂で固めて絶縁している部分。', links: ['primK', 'primL', 'sec'], ev: 'doc', note: '黒いモールドの外形は実機写真による。寸法比は簡略化（外形図とは未照合）。' },
    primK: { name: '一次端子 K', role: '主回路の導体をつなぐ一次側の端子。電流が K から入って L から出るとき、二次電流は k から外へ出る（減極性）。', links: ['prim', 'primL'], ev: 'simp', note: '平らな端子板と取付穴は実機写真による。上下どちらがKかは銘板・端子表示で確認する（未確認）。' },
    primL: { name: '一次端子 L', role: '一次側のもう一方の端子。写真では端子板に「75A」と書かれている。', links: ['prim', 'primK'], ev: 'simp', note: '実機写真による。' },
    sec: { name: '二次端子 k・l', role: '計器や継電器へつなぐ二次側の端子（定格 5A）。一次電流が流れているあいだは開放してはいけない。', links: ['secw', 'cover', 'burden'], ev: 'doc', note: '二次開路の禁止は三菱電機のカタログ p.5。端子の形は実機写真による。' },
    cover: { name: '端子カバー（検定の封印）', role: '二次端子を覆うカバー。検定品は封印がされる（写真の「検」の印）。', links: ['sec'], ev: 'simp', note: '写真では丸い灰色のカバーに「検」の印。形は簡略化。' },
    base: { name: '取付台', role: '盤に取付ける金具。接地する。', links: ['body'], ev: 'doc', note: '取付足・外箱（ない場合は鉄心）を接地する（カタログ p.5〜6）。形は写真による簡略化。' },
    plate: { name: '銘板', role: '形式 CD-25ENB、変流比 75/5A、確度階級 1.0・1PS10、定格負担 25VA、耐電圧 6.9/22/60kV、周波数 50・60Hz などが書かれている。', links: ['body'], ev: 'doc', note: '利用者の実機写真の銘板から読み取り。' },
    prim: { name: '一次巻線（模式）', role: '主回路の電流が流れる巻線。75/5A では一次の巻数は少なく、二次の巻数との比で電流を 1/15 にする。', links: ['primK', 'primL', 'core'], ev: 'unk', note: '一次が巻線になっているか（巻線形）、何回巻きかは資料がなく未確認。図は原理を示す模式。' },
    core: { name: '鉄心（模式）', role: '一次と二次の巻線を通る磁束の通り道。', links: ['prim', 'secw'], ev: 'unk', note: '形・材質は未確認。図は模式。' },
    secw: { name: '二次巻線（模式）', role: '細い線を多く巻いた巻線。一次の起磁力を打ち消すように二次電流が流れる。', links: ['core', 'sec'], ev: 'unk', note: '巻数・配置は未確認。図は模式。' },
    burden: { name: '負担（計器・継電器）', role: '二次につながる電流計・継電器などの合計。CD-25ENB の定格負担は 25VA。', links: ['sec'], ev: 'simp', note: '機器の外にあるので、図では箱で表している。' },
    test: { name: '耐圧試験器', role: '試験のときだけつなぐ。一次の K–L を短絡したところに試験電圧をかける。', links: ['primK', 'primL'], ev: 'simp', note: '試験の結線は日誌・耐圧のページの整理による一般的な形。' }
  };
  var Y0 = 0.0;
  function build(G, st, mode) {
    /* 取付台 */
    G.box(0.9, 0.04, 0.5, 0, 0.02, -0.05, STEEL, { part: 'base' });
    G.box(0.04, 0.35, 0.5, -0.42, 0.2, -0.05, STEEL, { part: 'base' });
    G.box(0.04, 0.35, 0.5, 0.42, 0.2, -0.05, STEEL, { part: 'base' });
    /* 本体：上下に張り出したモールド */
    G.box(0.78, 0.62, 0.5, 0, 0.55, 0, BLACK, { part: 'body', shell: true, shellAlpha: 0.14 });
    G.box(0.62, 0.14, 0.42, 0, 0.93, 0, BLACK, { part: 'body', shell: true, shellAlpha: 0.14 });
    G.box(0.62, 0.14, 0.42, 0, 0.17, 0, BLACK, { part: 'body', shell: true, shellAlpha: 0.14 });
    G.cyl(0.07, 0.62, 0, 1.0, 0.0, BLACK, 'x', { part: 'body', shell: true, shellAlpha: 0.14 }, { seg: 12 });
    G.cyl(0.07, 0.62, 0, 0.1, 0.0, BLACK, 'x', { part: 'body', shell: true, shellAlpha: 0.14 }, { seg: 12 });
    /* 銘板 */
    G.box(0.36, 0.26, 0.01, 0.06, 0.58, 0.255, 0xf4f4f0, { part: 'plate', layer: 'ext-only' });
    /* 一次端子（上：K・下：L） */
    var pq = st.short ? 'hv' : 'p';
    G.box(0.18, 0.28, 0.025, 0, 1.2, 0, SILV, { part: 'primK', cond: pq });
    G.cyl(0.035, 0.03, 0, 1.24, 0.0, 0x555555, 'z', { part: 'primK' }, { seg: 12 });
    G.box(0.18, 0.28, 0.025, 0, -0.1, 0, SILV, { part: 'primL', cond: pq });
    G.cyl(0.035, 0.03, 0, -0.14, 0.0, 0x555555, 'z', { part: 'primL' }, { seg: 12 });
    /* 二次端子（左側面）と端子カバー */
    G.box(0.12, 0.42, 0.22, -0.45, 0.55, 0.05, BLACK, { part: 'body', shell: true, shellAlpha: 0.14 });
    [0.68, 0.42].forEach(function (y) { G.cyl(0.035, 0.08, -0.54, y, 0.08, SILV, 'x', { part: 'sec', cond: 's' }, { seg: 6 }); });
    G.cyl(0.12, 0.08, -0.53, 0.55, -0.12, 0x8a8f94, 'x', { part: 'cover', layer: 'ext-only' }, { seg: 18 });
    /* ---- 内部（模式）---- */
    var I = { layer: 'int' };
    /* 鉄心：四角い輪 */
    G.box(0.5, 0.06, 0.1, 0, 0.78, -0.02, 0x7d8085, { part: 'core', layer: 'int' });
    G.box(0.5, 0.06, 0.1, 0, 0.32, -0.02, 0x7d8085, { part: 'core', layer: 'int' });
    G.box(0.06, 0.4, 0.1, -0.22, 0.55, -0.02, 0x7d8085, { part: 'core', layer: 'int' });
    G.box(0.06, 0.4, 0.1, 0.22, 0.55, -0.02, 0x7d8085, { part: 'core', layer: 'int' });
    /* 一次巻線：太い線で少なく（右脚）*/
    G.helix([0.22, 0.55, -0.02], 'y', 0.09, 0.26, 2.5, CU, 6, { part: 'prim', layer: 'int', cond: pq });
    G.wire([[0, 1.06, 0], [0.12, 0.95, 0], [0.22, 0.7, -0.02]], CU, 6, { part: 'prim', layer: 'int', cond: pq });
    G.wire([[0.22, 0.4, -0.02], [0.12, 0.18, 0], [0, 0.04, 0]], CU, 6, { part: 'prim', layer: 'int', cond: pq });
    /* 二次巻線：細い線を多く（左脚） */
    G.helix([-0.22, 0.55, -0.02], 'y', 0.075, 0.3, 14, 0x378add, 1.6, { part: 'secw', layer: 'int', cond: 's' });
    G.wire([[-0.22, 0.7, -0.02], [-0.38, 0.69, 0.06], [-0.5, 0.68, 0.08]], 0x378add, 2.2, { part: 'secw', layer: 'int' });
    G.wire([[-0.22, 0.4, -0.02], [-0.38, 0.41, 0.06], [-0.5, 0.42, 0.08]], 0x378add, 2.2, { part: 'secw', layer: 'int' });
    /* 外：一次の導体（主回路）・二次の負担・試験器 */
    if (mode !== 'ext') {
      if (!st.test) {
        G.wire([[0, 1.34, 0], [0, 1.7, 0]], 0x2c2c2a, 5, { part: 'primK', cond: 'p' });
        G.wire([[0, -0.24, 0], [0, -0.6, 0]], 0x2c2c2a, 5, { part: 'primL', cond: 'p' });
      }
      var open = st.open;
      G.box(0.2, 0.16, 0.14, -1.0, 0.55, 0.08, 0xeef3f6, { part: 'burden', layer: 'int' });
      G.wire([[-0.58, 0.68, 0.08], [-0.8, 0.68, 0.08], [-0.92, 0.6, 0.08]], 0x378add, 2.6, { part: 'burden', layer: 'int' });
      if (!open) G.wire([[-0.58, 0.42, 0.08], [-0.8, 0.42, 0.08], [-0.92, 0.5, 0.08]], 0x378add, 2.6, { part: 'burden', layer: 'int' });
      else { G.wire([[-0.58, 0.42, 0.08], [-0.72, 0.42, 0.08]], 0x378add, 2.6, { part: 'burden', layer: 'int' }); G.wire([[-0.8, 0.46, 0.08], [-0.92, 0.5, 0.08]], 0x378add, 2.6, { part: 'burden', layer: 'int' }); }
      if (st.test) {
        G.box(0.3, 0.2, 0.22, 0.62, 1.42, 0.1, 0xfdeee8, { part: 'test', layer: 'int' });
        G.wire([[0.47, 1.42, 0.1], [0.25, 1.4, 0.05], [0.05, 1.3, 0.02]], 0xd85a30, 4, { part: 'test', layer: 'int', cond: 'hv' });
        G.wire([[0.05, 1.3, 0.04], [0.45, 1.0, 0.25], [0.45, 0.1, 0.25], [0.05, -0.1, 0.04]], 0xd85a30, 3.5, { part: 'test', layer: 'int', cond: 'hv' });
        G.wire([[-0.92, 0.55, 0.08], [-1.0, 0.2, 0.1], [-0.7, -0.1, 0.2], [-0.4, 0.02, 0.1]], 0x3b6d11, 3, { part: 'base', layer: 'int' });
        G.wire([[0.42, 0.04, 0.2], [0.72, 0.0, 0.2], [0.66, 1.32, 0.1]], 0x3b6d11, 3, { part: 'base', layer: 'int' });
      }
      /* 電流と磁束 */
      if (st.ip) G.flow([[0, 1.7, 0], [0, 1.06, 0], [0.12, 0.95, 0], [0.22, 0.7, -0.02], [0.22, 0.55, 0.07], [0.22, 0.4, -0.02], [0.12, 0.18, 0], [0, -0.6, 0]], { speed: 0.5, m: { part: 'prim', layer: 'int' } });
      if (st.is && !open) G.flow([[-0.5, 0.68, 0.08], [-0.8, 0.68, 0.08], [-0.92, 0.6, 0.08], [-0.92, 0.5, 0.08], [-0.8, 0.42, 0.08], [-0.5, 0.42, 0.08], [-0.22, 0.4, -0.02], [-0.22, 0.7, -0.02]], { speed: 0.5, closed: false, m: { part: 'secw', layer: 'int' } });
      if (st.flux > 0.01) {
        var o = 0.03;
        G.flux([[-0.22 - o, 0.78, 0.05], [0.22 + o, 0.78, 0.05], [0.22 + o, 0.32, 0.05], [-0.22 - o, 0.32, 0.05]], { speed: 0.3 + st.flux * 0.6, w: 1.4 + st.flux * 3.6, m: { part: 'core', layer: 'int' } });
      }
    }
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond) return null;
    if (m.cond === 'hv' && st.test) return { c: [240, 153, 123], k: 0.7 };
    if (m.cond === 'p' && st.live) return { c: [240, 153, 123], k: 0.55 };
    if (m.cond === 's' && st.vhigh) return { c: [226, 75, 74], k: 0.55 };
    return null;
  }
  var labels = [
    { part: 'primK', t: '一次 K', p: [0.14, 1.3, 0.05] },
    { part: 'primL', t: '一次 L（75A）', p: [0.18, -0.16, 0.05] },
    { part: 'sec', t: '二次 k・l', p: [-0.62, 0.78, 0.1] },
    { part: 'plate', t: '銘板', p: [0.06, 0.74, 0.27], layer: 'ext-only' },
    { part: 'cover', t: '端子カバー（検）', p: [-0.56, 0.32, -0.12], layer: 'ext-only' },
    { part: 'base', t: '取付台', p: [0.42, 0.06, 0.24] },
    { part: 'core', t: '鉄心（模式）', p: [0, 0.86, 0.12], layer: 'int' },
    { part: 'prim', t: '一次巻線（模式）', p: [0.38, 0.55, 0.1], layer: 'int' },
    { part: 'secw', t: '二次巻線（模式）', p: [-0.22, 0.24, 0.1], layer: 'int' },
    { part: 'burden', t: '計器・継電器（負担）', p: [-1.0, 0.72, 0.1], layer: 'int' },
    { part: 'test', t: '耐圧試験器', p: [0.62, 1.6, 0.1], layer: 'int', when: function (s) { return s.test; } },
    { t: '二次開放', p: [-0.76, 0.32, 0.1], hot: true, layer: 'int', when: function (s) { return s.open; } },
    { t: 'k–l 短絡・接地', p: [-1.0, 0.1, 0.12], layer: 'int', when: function (s) { return s.test; } },
    { t: 'K–L 短絡', p: [0.55, 0.55, 0.28], layer: 'int', when: function (s) { return s.test; } }
  ];
  var scenarios = [
    { name: 'ふだんの使い方', steps: [
      { t: '一次に負荷電流が流れる', x: '主回路の電流（往路）が K から入り、一次巻線を通って L へ出る。一次電流の大きさは負荷で決まり、CT では変えられない。', s: 'ok', st: { live: true, ip: true, is: false, flux: 0, open: false, test: false, short: false, vhigh: false } },
      { t: '二次電流が、一次の起磁力を打ち消すように流れる', x: '二次電流は k から外へ出て、計器・継電器を通り、l から戻る（減極性）。一次と二次の起磁力がほぼ打ち消し合うので、鉄心の磁束は小さい（青い破線は細い）。', s: 'ok', st: { is: true, flux: 0.15 } },
      { t: '75/5A なら二次は 1/15', x: '一次 75A のとき二次は 5A。二次の巻数は一次の 15倍。', s: 'ok', st: {} }
    ] },
    { name: '二次を開放すると', steps: [
      { t: 'ふだん：二次は負担で閉じている', x: '一次電流と二次電流の起磁力が打ち消し合い、磁束は小さい。', s: 'ok', st: { live: true, ip: true, is: true, flux: 0.15, open: false, test: false, short: false, vhigh: false } },
      { t: '通電中に二次を開放（計器を外す・端子が外れる）', x: '二次電流は流れなくなる。でも一次電流は負荷で決まるので流れ続ける。打ち消す相手がいなくなり、一次の起磁力がそのまま鉄心を励磁する。磁束が大きくなり、鉄心は飽和する。', s: 'ng', st: { is: false, open: true, flux: 1 } },
      { t: '二次端子に高い電圧が出る', x: '飽和した鉄心の磁束が向きを変えるたびに、二次巻線に先のとがった高い電圧が出る。二次の絶縁破壊・焼損や、触れた人の感電のおそれ。どのくらいの電圧になるかは CT と一次電流によるので、ここでは数値を出さない。', s: 'ng', st: { vhigh: true }, hz: '一次電流が流れているあいだは、CT の二次を開放しない（三菱電機カタログ p.5）。計器を外すときは、先に二次を短絡する。' }
    ] },
    { name: '耐圧試験の結線', steps: [
      { t: '主回路から切り離し、K–L を短絡する', x: '一次の両端を同じ電位にして、試験電圧をかける。一次と大地（外箱・取付台・二次）のあいだの絶縁を試す。', s: 'ok', st: { live: false, ip: false, is: false, flux: 0, open: false, test: true, short: true, vhigh: false } },
      { t: '二次 k–l は短絡して接地、取付台も接地', x: '二次を浮かせると、静電誘導で高い電圧が出ることがある。試験器の E 端子も同じ接地へ。電流はほとんど流れず（絶縁の充電電流だけ）、鉄心に磁束はできない。', s: 'ok', st: {}, hz: '試験電圧・時間・結線は、試験する設備の条件と作業責任者の指示に従う。試験後は十分に放電する。' }
    ] }
  ];
  function stateList(st) {
    return [['一次電流', st.ip ? '流れている' : 'なし', false], ['二次', st.test ? '短絡・接地' : (st.open ? '開放' : '負担で閉'), !!st.open], ['磁束', st.flux > 0.6 ? '大（飽和）' : st.flux > 0 ? '小' : 'なし', st.flux > 0.6], ['一次 K–L', st.short ? '短絡（試験電圧）' : '主回路']];
  }
  function svgUpdate(svg, st) {
    var o = svg.querySelector('#ct-open'); if (o) o.style.display = st.open ? '' : 'none';
    var c = svg.querySelector('#ct-closed'); if (c) c.style.display = st.open ? 'none' : '';
    var t = svg.querySelector('#ct-test'); if (t) t.style.display = st.test ? '' : 'none';
    var n = svg.querySelector('#ct-normal'); if (n) n.style.display = st.test ? 'none' : '';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.ct = {
    title: '高圧変流器', parts: parts,
    partOrder: ['primK', 'primL', 'sec', 'cover', 'body', 'plate', 'base', 'prim', 'core', 'secw', 'burden', 'test'],
    initial: { live: false, ip: false, is: false, flux: 0, open: false, test: false, short: false, vhigh: false },
    build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#ctWire', svgUpdate: svgUpdate,
    view: { yaw: -0.55, pitch: 0.2 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05 }, side: { label: '二次端子側', yaw: 1.2, pitch: 0.1 }, top: { label: '上', yaw: 0, pitch: 1.25 } },
    banner: { ext: ['参考：三菱電機 CD-25ENB（実機写真）', '!寸法比は外形図と未照合'], int: ['!巻線・鉄心は模式（実機の形・巻数ではない）'], op: ['!巻線・鉄心は模式'], wire: [] }
  };
})();
