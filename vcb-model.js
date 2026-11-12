/* 引出形VCB（参考：三菱電機 VF-8D 引出形・電動ばね操作、カタログ K-K06-5-C7085-R）
   資料で確かめたこと：真空バルブ・主回路端子・上部/下部接触子・開閉表示器・動作回数計・ばね蓄勢表示器・
   制御回路プラグ・車輪・インタロックの部品名、補助スイッチは電動ばね操作で5a5b。
   操作機構の中（主軸・リンク・補助スイッチの位置と形）は資料に構造図がなく模式。
   外形はカタログ p.19 図4.24（引出形 D形遮断器本体）に合わせた：幅480・全高378・フロントプレートから接触子先端まで34+377、
   上部接触子は床から340（178+162）・下部接触子は178、車輪φ60（前の車輪は前面から40、前後190、外幅438）、相間130。
   前面は開閉表示器・ばね蓄勢表示器・手動蓄勢ハンドル挿入口・入切レバー・動作回数計・取手（左右）・制御回路プラグ（右）の並び。
   真空バルブの位置と大きさは側面図の破線からの読み取り。 1 = 約330mm
   時間・電流の大きさは表さない（順番だけ）。 */
(function () {
  'use strict';
  var PX = { U: -0.394, V: 0, W: 0.394 }, PHS = ['U', 'V', 'W'], PZ = 0.04, VY = 0.82, FZ = 0.68;
  var CU = 0xc9874a, STEEL = 0x8c939a;
  var SHY = 0.32, SHZ = 0.3;
  var AUX = [0.42, 0.85, 0.42], TCP = [0.18, 0.55, 0.4], CCP = [-0.18, 0.7, 0.4], LAT = [0.02, 0.42, 0.3];
  var PLUG = [0.62, 0.55, 0.62];
  var DC = [-1.3, 1.35, 0.75], CMD = [1.3, 1.35, 0.75];
  var parts = {
    wheel: { name: '台車・車輪', role: '盤の中で VCB を「接続」「試験」「断路」の位置へ出し入れする。', links: ['terminal'], ev: 'doc', note: '「車輪」は VF-8D カタログの各部名称。車輪φ60、前の車輪は前面から40mm、前後190mm、外幅438mm（カタログ p.19 図4.24）。' },
    front: { name: '前面（フロントプレート・フェースプレート）', role: '入切レバーで手動の投入・引外し、手動蓄勢ハンドル挿入口でばねの手動蓄勢、下の挿入口で引き出し・挿入を操作する。左右に取手、下に接地端子とインターロックレバー・ピン。', links: ['indicator', 'latch'], ev: 'doc', note: '幅480・上端が床から378mm。部品の名前と並びはカタログ p.19 図4.24。色と細かな形は模式。インターロックレバー・ピンは描いていない。' },
    indicator: { name: '開閉表示器・ばね蓄勢表示器・動作回数計', role: '主接点の入・切、投入ばねが蓄勢されているか、動作回数を前から見る。主接点が開いたことは表示で、52a が開いたことは別に確かめる。', links: ['shaft', 'cspring'], ev: 'doc', note: '上から開閉表示器・ばね蓄勢表示器、入切レバーの下に動作回数計（カタログ p.19 図4.24）。表示の色は模式。' },
    plug: { name: '制御回路プラグ', role: '操作電源・67 などの外部回路と、VCB の中の TC・CC・補助スイッチをつなぐ。端子番号は展開接続図で確かめる。', links: ['aux', 'tc', 'cc', 'cmd'], ev: 'doc', note: '前面の右側（カタログ p.19 図4.24、制御プラグ方式A）。形は模式。' },
    pole: { name: '絶縁フレーム（各相）', role: '真空バルブを各相ごとに支える絶縁物。', links: ['vi', 'terminal'], ev: 'simp', note: '高さはフロントプレートとほぼ同じに収まる（カタログ p.19 図4.24の側面図）。形は模式。' },
    vi: { name: '真空バルブ', role: '真空の中で主接点を開閉する。アークは真空中で拡散して消える。可動側だけが上下に数 mm 動く。', links: ['rod', 'terminal'], ev: 'doc', note: '部品名は VF-8D カタログ。位置と大きさは図4.24の側面図の破線から読み取った。中の接点の形・ストロークは模式で拡大している。' },
    terminal: { name: '上部・下部接触子（主回路端子）', role: '盤の中の母線・ケーブル側とつながる。引き出すと切り離される。', links: ['vi', 'wheel'], ev: 'doc', note: '上部接触子は床から340mm、下部接触子は178mm（間隔162mm）、先端はフロントプレートから411mm、相間130mm（カタログ p.19 図4.24・図4.25）。接触子の形は模式。' },
    rod: { name: '絶縁操作ロッド', role: '主軸の回転を、各相の可動接点の上下に伝える。', links: ['shaft', 'vi'], ev: 'unk', note: 'ばね操作 VCB の一般的な構成として描いた。VF-8D での形は未確認。' },
    shaft: { name: '主軸', role: '3相の可動接点と補助スイッチを一緒に動かす軸。開路ばねで「切」側へ回る。', links: ['rod', 'link', 'ospring', 'latch'], ev: 'unk', note: '一般的な構成として描いた。形・位置は資料になく模式。' },
    ospring: { name: '開路ばね', role: '投入するときに蓄勢され、引外しキャッチが外れると主軸を「切」側へ回す。', links: ['shaft', 'latch'], ev: 'unk', note: '一般的なばね操作の原理。VF-8D の形・位置は未確認。' },
    cspring: { name: '投入ばね', role: '電動機（または手動）で蓄勢し、投入キャッチが外れると主軸を「入」側へ回す。', links: ['motor', 'cc', 'shaft'], ev: 'simp', note: '電動ばね操作であることは型式から。形・位置は模式。' },
    motor: { name: 'ばね蓄勢電動機', role: '投入したあと、投入ばねをもう一度蓄勢する。', links: ['cspring'], ev: 'simp', note: '電動ばね操作であることは型式から。形・位置は模式。' },
    tc: { name: '引外しコイル（TC）', role: '電流が流れるとプランジャが引外しキャッチを外す。短時間だけ電流を流す前提のコイルで、電流は 52a が切る。', links: ['latch', 'aux', 'plug'], ev: 'unk', note: '原理は一般的。VF-8D での位置・形は未確認。' },
    cc: { name: '投入コイル（CC）', role: '電流が流れると投入キャッチを外し、投入ばねが主軸を「入」側へ回す。', links: ['cspring', 'aux', 'plug'], ev: 'unk', note: '原理は一般的。位置・形は未確認。' },
    latch: { name: '引外しキャッチ（留め金）', role: '「入」の状態を保つ留め金。TC のプランジャで外れる。', links: ['tc', 'shaft', 'ospring'], ev: 'unk', note: '形は模式。' },
    aux: { name: '補助スイッチ（52a・52b）', role: '主軸と一緒に動く小さな接点の集まり。52a は主接点が入のとき閉じ、TC の回路を切る役。52b は主接点が切のとき閉じ、CC の回路に入る。', links: ['link', 'tc', 'cc', 'plug'], ev: 'simp', note: '接点数（電動ばね 5a5b）は VF-8D カタログ。位置・形・どの接点を TC・CC に使うかは展開接続図で確かめる。図の位置は推定。' },
    link: { name: '補助スイッチを回すリンク', role: '主軸の回転を補助スイッチへ伝える。ここが外れたり、補助スイッチの接点が溶着したりすると、主接点は開いても 52a が閉じたまま。', links: ['shaft', 'aux'], ev: 'unk', note: '形・位置は資料になく推定。' },
    cmd: { name: '外部の指令接点（67・制御スイッチ）', role: '引外しでは 67 などの継電器の出力接点、投入では制御スイッチ。VCB の外にある。', links: ['plug'], ev: 'simp', note: '場面の説明用に1つの箱で表した。' },
    dc: { name: '操作電源（直流 P・N）', role: 'TC・CC・電動機を動かす電源。', links: ['plug'], ev: 'simp', note: '電圧は機種・設備で異なり、ここでは表さない。' }
  };
  function lerp(a, b, k) { return a + (b - a) * k; }
  function armEnd(x, phi, r, y, z) { return [x, y + r * Math.sin(phi), z - r * Math.cos(phi)]; }

  function build(G, st, mode) {
    var c = st.closed, ax = st.aux;
    /* 台車・車輪（φ60。前の車輪は前面から40、前後190、外幅438） */
    G.box(1.33, 0.06, 0.95, 0, 0.19, 0.2, 0x5f6266, { part: 'wheel' });
    [[-0.66, 0.56], [0.66, 0.56], [-0.66, -0.02], [0.66, -0.02]].forEach(function (w) { G.cyl(0.09, 0.05, w[0], 0.09, w[1], 0x2c2c2a, 'x', { part: 'wheel' }, { seg: 14 }); });
    /* 操作機構の箱とフロントプレート（幅480・上端が床から378） */
    G.box(1.4, 0.93, 0.42, 0, 0.675, 0.46, STEEL, { part: 'front', shell: true });
    G.box(1.455, 0.935, 0.02, 0, 0.677, FZ, 0x6b7075, { part: 'front', shell: true });
    /* フェースプレート（中央の一段前の板） */
    G.box(1.09, 0.84, 0.015, 0, 0.72, FZ + 0.015, 0x4b5258, { part: 'front', shell: true });
    /* 取手（左右） */
    [-0.615, 0.615].forEach(function (x) { G.box(0.035, 0.4, 0.05, x, 0.88, FZ + 0.04, 0xc9cacc, { part: 'front' }); });
    /* 開閉表示器・ばね蓄勢表示器・動作回数計（上から） */
    G.box(0.1, 0.07, 0.02, -0.136, 1.0, FZ + 0.03, c > 0.5 ? 0xc0392b : 0x2f8a4e, { part: 'indicator' });
    G.box(0.1, 0.07, 0.02, -0.136, 0.876, FZ + 0.03, st.cs > 0.5 ? 0xf2c94c : 0xf4f2ea, { part: 'indicator' });
    G.box(0.12, 0.06, 0.02, -0.136, 0.588, FZ + 0.03, 0x2c2c2a, { part: 'indicator' });
    /* 手動蓄勢ハンドル挿入口と入切レバー */
    G.cyl(0.03, 0.03, -0.2, 0.755, FZ + 0.03, 0x1f2326, 'z', { part: 'front' }, { seg: 12 });
    G.box(0.1, 0.035, 0.05, -0.09, 0.73, FZ + 0.045, 0xd9a227, { part: 'front' });
    /* 挿入／引出ハンドル挿入口（下の中央）と接地端子 */
    G.box(0.09, 0.07, 0.03, 0, 0.26, FZ + 0.02, 0x1f2326, { part: 'front' });
    G.box(0.05, 0.08, 0.03, -0.17, 0.25, FZ + 0.02, 0x3b6d11, { part: 'front' });
    /* 制御回路プラグ（前面の右） */
    G.box(0.05, 0.16, 0.1, PLUG[0], PLUG[1], PLUG[2] + 0.07, 0x3a3a38, { part: 'plug' });
    /* 各相 */
    PHS.forEach(function (ph) {
      var x = PX[ph];
      G.box(0.3, 0.72, 0.04, x, 0.78, PZ + 0.17, 0x7a5a3a, { part: 'pole', shell: true, shellAlpha: 0.25 });
      G.box(0.3, 0.72, 0.04, x, 0.78, PZ - 0.17, 0x7a5a3a, { part: 'pole', shell: true, shellAlpha: 0.25 });
      G.cyl(0.11, 0.36, x, VY, PZ, 0xe8e4da, 'y', { part: 'vi', shell: true }, { seg: 18 });
      G.cyl(0.116, 0.03, x, VY + 0.19, PZ, 0xb8b8b4, 'y', { part: 'vi' }, { seg: 18 });
      G.cyl(0.116, 0.03, x, VY - 0.19, PZ, 0xb8b8b4, 'y', { part: 'vi' }, { seg: 18 });
      /* 上部・下部接触子（後ろへ水平に。床から340と178、先端は前面から411） */
      G.rod([x, VY + 0.2, PZ], [x, 1.03, PZ - 0.44], 0.03, CU, { part: 'terminal', cond: 'main' });
      G.cyl(0.07, 0.18, x, 1.03, PZ - 0.52, 0x9aa1a7, 'z', { part: 'terminal' }, { seg: 12 });
      G.rod([x, VY - 0.25, PZ], [x, 0.54, PZ - 0.44], 0.03, CU, { part: 'terminal', cond: 'main' });
      G.cyl(0.07, 0.18, x, 0.54, PZ - 0.52, 0x9aa1a7, 'z', { part: 'terminal' }, { seg: 12 });
      /* 中：固定接点・可動接点（ストロークは拡大） */
      var mv = VY - 0.07 * (1 - c);
      G.rod([x, VY + 0.19, PZ], [x, VY + 0.025, PZ], 0.018, CU, { part: 'vi', layer: 'int' });
      G.cyl(0.05, 0.02, x, VY + 0.02, PZ, CU, 'y', { part: 'vi', layer: 'int' }, { seg: 14 });
      G.cyl(0.05, 0.02, x, mv - 0.01, PZ, CU, 'y', { part: 'vi', layer: 'int' }, { seg: 14 });
      G.rod([x, mv - 0.02, PZ], [x, VY - 0.3, PZ], 0.018, CU, { part: 'vi', layer: 'int' });
      /* 主軸のクランクとロッド */
      var phi = lerp(-0.45, 0.35, c), ce = armEnd(x, phi, 0.2, SHY, SHZ);
      G.rod([x, SHY, SHZ], ce, 0.025, 0x55595e, { part: 'shaft', layer: 'int' });
      G.rod(ce, [x, VY - 0.3 - 0.07 * (1 - c), PZ + 0.02], 0.03, 0xd9c9a3, { part: 'rod', layer: 'int' });
    });
    G.cyl(0.04, 1.25, 0, SHY, SHZ, 0x55595e, 'x', { part: 'shaft', layer: 'int' }, { seg: 10 });
    /* 開路ばね（主軸の右端） */
    var phi0 = lerp(-0.45, 0.35, c), oe = armEnd(0.6, phi0 + Math.PI, 0.14, SHY, SHZ);
    G.rod([0.6, SHY, SHZ], oe, 0.022, 0x55595e, { part: 'ospring', layer: 'int' });
    G.helix([0.6, (oe[1] + 0.8) / 2, (oe[2] + 0.42) / 2], 'y', 0.045, 0.8 - oe[1], 7, 0x2f6fa8, 2, { part: 'ospring', layer: 'int' });
    /* 投入ばね・電動機 */
    var csL = lerp(0.42, 0.26, st.cs);
    G.helix([-0.55, 0.22 + csL / 2, 0.42], 'y', 0.06, csL, 7, 0x2f6fa8, 2.4, { part: 'cspring', layer: 'int' });
    G.box(0.14, 0.03, 0.14, -0.55, 0.22 + csL, 0.42, 0x55595e, { part: 'cspring', layer: 'int' });
    G.cyl(0.07, 0.18, -0.35, 0.3, 0.45, 0x4a5a6a, 'z', { part: 'motor', layer: 'int' }, { seg: 12 });
    /* TC・CC・キャッチ */
    G.box(0.14, 0.14, 0.14, TCP[0], TCP[1], TCP[2], 0xb8743f, { part: 'tc', layer: 'int' });
    G.rod([TCP[0], TCP[1] - 0.07, TCP[2] - 0.02], [TCP[0] - 0.02, TCP[1] - 0.07 - 0.06 - 0.04 * st.pl, TCP[2] - 0.05], 0.015, 0x9aa1a7, { part: 'tc', layer: 'int' });
    G.box(0.14, 0.14, 0.14, CCP[0], CCP[1], CCP[2], 0xb8743f, { part: 'cc', layer: 'int' });
    var la = st.latch ? 0 : 0.7;
    G.rod([LAT[0] - 0.1, LAT[1], LAT[2]], [LAT[0] - 0.1 + 0.22 * Math.cos(la), LAT[1] + 0.22 * Math.sin(la), LAT[2]], 0.018, 0xd9a227, { part: 'latch', layer: 'int' });
    /* 補助スイッチ（ドラム＋接点）とリンク */
    G.cyl(0.07, 0.24, AUX[0], AUX[1], AUX[2], 0x3f4a55, 'x', { part: 'aux', layer: 'int' }, { seg: 12 });
    var psi = lerp(-0.6, 0.6, ax), le = armEnd(AUX[0] + 0.14, psi + Math.PI / 2, 0.12, AUX[1], AUX[2]);
    G.rod([AUX[0] + 0.14, AUX[1], AUX[2]], le, 0.016, 0x55595e, { part: 'aux', layer: 'int' });
    /* 52a の接点（閉で橋渡し） */
    G.box(0.04, 0.04, 0.04, AUX[0] - 0.08, AUX[1] + 0.1, AUX[2] - 0.06, 0xb8b8b4, { part: 'aux', layer: 'int' });
    G.box(0.04, 0.04, 0.04, AUX[0] - 0.08, AUX[1] + 0.1, AUX[2] + 0.06, 0xb8b8b4, { part: 'aux', layer: 'int' });
    G.rod([AUX[0] - 0.08, AUX[1] + 0.1 + 0.05 * (1 - ax), AUX[2] - 0.06], [AUX[0] - 0.08, AUX[1] + 0.1 + 0.05 * (1 - ax), AUX[2] + 0.06], 0.012, ax > 0.5 ? 0xc0392b : 0x55595e, { part: 'aux', layer: 'int' });
    var se = armEnd(AUX[0] + 0.14, phi0, 0.16, SHY, SHZ);
    G.rod([AUX[0] + 0.14, SHY, SHZ], se, 0.02, 0x55595e, { part: 'shaft', layer: 'int' });
    if (st.broken) {
      G.rod(se, [se[0], se[1] + 0.2, se[2] + 0.02], 0.016, 0xb83a2b, { part: 'link', layer: 'int' });
      G.rod([le[0], le[1] - 0.15, le[2]], le, 0.016, 0xb83a2b, { part: 'link', layer: 'int' });
    } else G.rod(se, le, 0.016, 0x7c8a96, { part: 'link', layer: 'int' });
    /* 内部配線（制御回路プラグから） */
    var wT = [PLUG, [0.55, 1.0, 0.5], [AUX[0] - 0.08, AUX[1] + 0.12, AUX[2] - 0.06]];
    var wT2 = [[AUX[0] - 0.08, AUX[1] + 0.12, AUX[2] + 0.06], [0.3, 0.75, 0.5], [TCP[0], TCP[1] + 0.07, TCP[2]]];
    var wT3 = [[TCP[0] - 0.07, TCP[1], TCP[2]], [0.35, 0.4, 0.55], [PLUG[0] - 0.03, PLUG[1] - 0.05, PLUG[2]]];
    var wC = [PLUG, [0.5, 0.95, 0.36], [AUX[0] - 0.12, AUX[1] - 0.05, AUX[2] - 0.08], [0.0, 0.8, 0.36], [CCP[0], CCP[1] + 0.07, CCP[2]]];
    var wC2 = [[CCP[0] - 0.07, CCP[1], CCP[2]], [-0.3, 0.45, 0.58], [0.3, 0.36, 0.58], [PLUG[0], PLUG[1] - 0.05, PLUG[2]]];
    [wT, wT2, wT3].forEach(function (w) { G.wire(w, 0x378add, 2, { part: 'aux', layer: 'int', cond: 'trip' }); });
    [wC, wC2].forEach(function (w) { G.wire(w, 0x6b8f3a, 2, { part: 'cc', layer: 'int', cond: 'close' }); });
    if (mode !== 'op') return;
    /* 外部：操作電源と指令接点 */
    G.box(0.36, 0.3, 0.2, DC[0], DC[1], DC[2], 0xe8edf2, { part: 'dc' });
    G.box(0.36, 0.3, 0.2, CMD[0], CMD[1], CMD[2], 0xfdeee8, { part: 'cmd' });
    var oP = [[DC[0], DC[1] + 0.15, DC[2]], [DC[0], 1.75, DC[2]], [CMD[0], 1.75, CMD[2]], [CMD[0], CMD[1] + 0.15, CMD[2]]];
    var oR = [[CMD[0] - 0.18, CMD[1] - 0.05, CMD[2]], [0.95, 1.2, 0.85], [0.8, 0.6, 0.85], [PLUG[0] + 0.03, PLUG[1], PLUG[2] + 0.12]];
    var oN = [[PLUG[0] + 0.03, PLUG[1] - 0.06, PLUG[2] + 0.12], [0.75, 0.3, 0.95], [-0.9, 0.3, 0.95], [DC[0] + 0.18, DC[1] - 0.2, DC[2]]];
    G.wire(oP, 0xd85a30, 3, { part: 'dc', cond: 'P' }); G.wire(oR, 0xd85a30, 3, { part: 'cmd', cond: 'P' }); G.wire(oN, 0x2c2c2a, 3, { part: 'dc' });
    var sw = st.cmd ? 0 : 0.6;
    G.rod([CMD[0] - 0.1, CMD[1] + 0.16, CMD[2] + 0.11], [CMD[0] - 0.1 + 0.2 * Math.cos(sw), CMD[1] + 0.16 + 0.2 * Math.sin(sw), CMD[2] + 0.11], 0.015, 0x203b50, { part: 'cmd' });
    if (!st.power) return;
    var tail = function (a) { return a.concat(oN); };
    if (st.tcCur) G.flow(tail(oP.concat(oR, wT.slice(1), wT2, wT3)), { col: st.stuck ? 'bad' : 'cur', speed: 0.5, m: { part: 'tc' } });
    if (st.ccCur) G.flow(tail(oP.concat(oR, wC.slice(1), wC2)), { speed: 0.5, m: { part: 'cc' } });
  }
  function tint(m, st, mode) {
    if (m.part === 'tc' && st.tcCur) return { c: st.stuck ? [226, 75, 74] : [242, 178, 51], k: 0.55 };
    if (m.part === 'cc' && st.ccCur && !m.cond) return { c: [242, 178, 51], k: 0.55 };
    if (mode === 'op' && st.power && m.cond === 'P') return { c: [240, 153, 123], k: 0.5 };
    return null;
  }
  var labels = [
    { part: 'indicator', t: '開閉表示器', p: [-0.136, 1.12, 0.75], layer: 'ext-only' },
    { part: 'front', t: '入切レバー', p: [-0.4, 0.66, 0.78], layer: 'ext-only' },
    { part: 'plug', t: '制御回路プラグ', p: [PLUG[0] + 0.1, PLUG[1] - 0.2, PLUG[2] + 0.15] },
    { part: 'vi', t: '真空バルブ', p: [-0.394, VY + 0.42, PZ] },
    { part: 'terminal', t: '上部・下部接触子', p: [0.394, 1.2, PZ - 0.6] },
    { part: 'wheel', t: '台車・車輪', p: [0.75, -0.08, 0.56], layer: 'ext-only' },
    { part: 'aux', t: '補助スイッチ（52a・52b）', p: [AUX[0] + 0.1, AUX[1] + 0.22, AUX[2]], layer: 'int' },
    { part: 'link', t: 'リンク', p: [0.62, 0.6, 0.3], layer: 'int' },
    { part: 'tc', t: '引外しコイル TC', p: [TCP[0], TCP[1] - 0.18, TCP[2] + 0.1], layer: 'int' },
    { part: 'cc', t: '投入コイル CC', p: [CCP[0] - 0.05, CCP[1] + 0.15, CCP[2]], layer: 'int' },
    { part: 'shaft', t: '主軸', p: [-0.2, SHY - 0.1, SHZ], layer: 'int' },
    { part: 'cspring', t: '投入ばね', p: [-0.6, 0.18, 0.5], layer: 'int' },
    { part: 'ospring', t: '開路ばね', p: [0.68, 0.95, 0.36], layer: 'int' },
    { part: 'rod', t: '絶縁操作ロッド', p: [0, 0.42, 0.12], layer: 'int' },
    { part: 'dc', t: '操作電源 P・N', p: [DC[0], DC[1] - 0.25, DC[2]], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { part: 'cmd', t: '指令接点（67・CS）', p: [CMD[0], CMD[1] - 0.25, CMD[2]], layer: 'int', when: function (s, m) { return m === 'op'; } },
    { t: 'リンクが外れている', p: [0.75, 0.5, 0.55], hot: true, layer: 'int', when: function (s) { return s.broken; } },
    { t: '主接点は開いたのに52aは閉', p: [0.4, 1.2, 0.6], hot: true, layer: 'int', when: function (s) { return s.stuck; } }
  ];
  var base = { closed: 1, aux: 1, cs: 1, pl: 0, latch: true, cmd: false, power: true, tcCur: false, ccCur: false, broken: false, stuck: false };
  var scenarios = [
    { name: '引外し（正常）', steps: [
      { t: '「入」の状態', x: '主接点は閉じ、引外しキャッチが開路ばねの力を止めている。主軸と一緒に動く補助スイッチは、52a が閉・52b が開。', s: 'ok', st: { closed: 1, aux: 1, latch: true, cmd: false, tcCur: false, broken: false, stuck: false, power: true } },
      { t: '67 の出力接点が閉じる', x: '電流の往路：操作電源 P → 67 の接点 → 制御回路プラグ → 52a → TC。帰路：TC → 制御回路プラグ → N。52a が閉じているから流れる。', s: 'ok', st: { cmd: true, tcCur: true } },
      { t: 'TC のプランジャがキャッチを外す', x: '開路ばねの力で主軸が「切」側へ回り、絶縁操作ロッドが3相の可動接点を引き下げる。真空バルブの中で主接点が開く。', s: 'ok', st: { pl: 1, latch: false, closed: 0 } },
      { t: '主軸と一緒に補助スイッチが回り、52a が開く', x: '52a が開いて、TC の電流が切れる。52b は閉じる。TC に電流が流れたのは、ここまでのごく短いあいだだけ。', s: 'ok', st: { aux: 0, tcCur: false } },
      { t: '67 の接点が開く', x: '試験器・継電器が復帰して接点が開く。このとき電流はもう流れていないので、接点に負担はほとんどない。', s: 'ok', st: { cmd: false, pl: 0 } }
    ] },
    { name: '52aが開かない（故障例）', steps: [
      { t: '「入」の状態（リンクが外れている）', x: '成立条件の例：補助スイッチを回すリンクの外れ・ピン抜け、補助スイッチ接点の溶着、配線が 52a を通っていない。このどれかがあると、この先の結果になる。見た目の「入」は正常と同じ。', s: 'warn', st: { closed: 1, aux: 1, latch: true, cmd: false, tcCur: false, broken: true, stuck: false, power: true } },
      { t: '67 の出力接点が閉じる', x: '正常と同じく、P → 67 → 52a → TC → N に電流が流れる。', s: 'ok', st: { cmd: true, tcCur: true } },
      { t: '主接点は開く。でも 52a は閉じたまま', x: '主軸は回って主接点は開き、開閉表示器も「切」になる。補助スイッチには回転が伝わらないので、52a は閉じたまま。TC と 67 の出力接点に電流が流れ続ける（赤い粒）。', s: 'ng', st: { pl: 1, latch: false, closed: 0, stuck: true }, hz: 'TC は短い時間だけ電流を流す前提のコイルなので、流れ続けると焼損のおそれ。67 の接点も、直流を切るときのアークで傷むおそれ。焼損までの時間は機種・電圧で異なり、ここでは表さない。' },
      { t: '操作電源を切って電流を止める', x: '表示が「切」なのに TC の電流が止まらないときは、操作電源を切る（設備の手順に従う）。そのうえで、制御回路プラグの 52a の端子間の導通を、入・切させながら確かめる。', s: 'warn', st: { power: false, tcCur: false, cmd: false }, hz: '操作機構を点検するときは、取扱説明書の手順でばねを放勢してから。' }
    ] },
    { name: '投入（一般的な例）', steps: [
      { t: '「切」の状態・投入ばね蓄勢済み', x: '52a は開・52b は閉。投入ばねは電動機で蓄勢されている。CC の回路に 52b を入れる形は一般的な例で、その機種の展開接続図で確かめる。', s: 'ok', st: { closed: 0, aux: 0, cs: 1, latch: false, cmd: false, tcCur: false, ccCur: false, broken: false, stuck: false, power: true, pl: 0 } },
      { t: '投入の指令', x: '往路：P → 制御スイッチ → 制御回路プラグ → 52b → CC。帰路：CC → 制御回路プラグ → N。', s: 'ok', st: { cmd: true, ccCur: true } },
      { t: '投入ばねが主軸を「入」へ回す', x: 'CC が投入キャッチを外し、投入ばねの力で主軸が回って主接点が閉じる。同時に開路ばねが蓄勢され、引外しキャッチがかかる。', s: 'ok', st: { cs: 0, closed: 1, latch: true } },
      { t: '補助スイッチが切り替わる', x: '52b が開いて CC の電流が切れ、52a が閉じて次の引外しに備える。', s: 'ok', st: { aux: 1, ccCur: false, cmd: false } },
      { t: '電動機が投入ばねを蓄勢し直す', x: '次の投入に備える。ばね蓄勢表示器で確かめられる。', s: 'ok', st: { cs: 1 } }
    ] }
  ];
  function stateList(st) {
    return [['主接点', st.closed > 0.5 ? '入' : '切', false], ['52a', st.aux > 0.5 ? '閉' : '開', !!st.stuck], ['52b', st.aux > 0.5 ? '開' : '閉', false], ['TC の電流', st.tcCur ? (st.stuck ? '流れ続ける' : '流れている') : 'なし', !!st.stuck], ['CC の電流', st.ccCur ? '流れている' : 'なし', false], ['操作電源', st.power ? '入' : '切', !st.power]];
  }
  function svgUpdate(svg, st) {
    var q = function (id) { return svg.querySelector('#' + id); };
    var a = st.aux > 0.5;
    var s67 = q('vc-cmd'); if (s67) s67.setAttribute('d', st.cmd ? 'M120 60 L160 60' : 'M120 60 L156 42');
    var s52a = q('vc-52a'); if (s52a) s52a.setAttribute('d', a ? 'M230 60 L270 60' : 'M230 60 L266 42');
    var s52b = q('vc-52b'); if (s52b) s52b.setAttribute('d', !a ? 'M230 170 L270 170' : 'M230 170 L266 152');
    var sc = q('vc-cs'); if (sc) sc.setAttribute('d', st.cmd ? 'M120 170 L160 170' : 'M120 170 L156 152');
    var ft = q('vc-tflow'); if (ft) { ft.style.display = st.tcCur && st.power ? '' : 'none'; ft.setAttribute('stroke', st.stuck ? '#e24b4a' : '#f2b233'); }
    var fc = q('vc-cflow'); if (fc) fc.style.display = st.ccCur && st.power ? '' : 'none';
    var stk = q('vc-stuck'); if (stk) stk.style.display = st.stuck ? '' : 'none';
    var pw = q('vc-pwr'); if (pw) pw.textContent = st.power ? '' : '操作電源 切';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.vcb = {
    title: '引出形VCB', parts: parts,
    partOrder: ['front', 'indicator', 'plug', 'wheel', 'terminal', 'pole', 'vi', 'rod', 'shaft', 'ospring', 'cspring', 'motor', 'latch', 'tc', 'cc', 'aux', 'link', 'cmd', 'dc'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#vcbWire', svgUpdate: svgUpdate,
    view: { yaw: -0.6, pitch: 0.3 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.1 }, mech: { label: '操作機構', yaw: -0.5, pitch: 0.25, zoom: 1.8, target: [0.2, 0.6, 0.4] }, back: { label: '背面（接触子）', yaw: Math.PI - 0.4, pitch: 0.2 } },
    modeView: { op: { zoom: 0.85, target: [0, 0.8, 0.3] } },
    banner: { ext: ['参考：三菱電機 VF-8D 引出形・電動ばね操作', '外形と前面の並びはカタログの外形図（図4.24）に合わせた'], int: ['!操作機構の中は模式：補助スイッチ・リンクの位置と形は資料になく推定'], op: ['!順番を示す模式：時間・電流の大きさは表していない'], wire: [] }
  };
})();
