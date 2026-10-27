/* 高圧真空電磁接触器 VCS（参考：三菱電機 VZ-Eシリーズ コンビネーションユニット 200A・機械ラッチ（L）、
   カタログ G-199-1-C8651-E（HAI 2303、2023年3月改訂）、国内製品ページ）
   資料で確かめたこと：定格使用電圧 3.3/6.6kV、200/400A、AC4級（開閉耐久はAC3級）、形名の2/4は200/400A、Eは常時励磁（電気保持）・Lは機械ラッチ、
   ラッチ式は永久磁石で電磁的に保持（注油不要）、投入コイルで可動鉄心が固定鉄心に吸引されLS1が投入コイル電流を切る、
   引外しは引外しコイルの磁束が永久磁石の磁束を打ち消し引外しばねで開く、常時励磁式は制御電源が16ms切れても開く、
   補助スイッチ2a2b、LS0（位置）・LS1（投入コイル遮断）・LS2（電力ヒューズ溶断）、動作回数計・電力ヒューズ溶断検出装置は標準付属、
   機械的耐久25万回、電気的耐久 電動機・変圧器25万回・コンデンサ10万回、開閉頻度600回/時、15年以内または耐久回数で更新。
   電磁石・ばね・リンクの形と位置、ヒューズの取付け位置、全体の寸法は資料で確かめられていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var PX = { U: -1.2, V: 0, W: 1.2 }, PH = ['U', 'V', 'W'];
  var VZ = -0.7, VY = 2.7, FZ = 0.9, FT = 4.4, FB = 2.5;
  var STEEL = 0x8c939a, INS = 0x5a6670, CU = 0xc9874a;
  var MC = [0, 0.95, 0.7];  /* 電磁石の中心 */
  var parts = {
    frame: { name: '取付枠', role: '真空バルブ・電磁石・ヒューズを支える枠。盤に固定する（固定形の取付穴は4か所、ピッチ342×170mm）。', links: ['vi', 'mech'], ev: 'simp', note: '固定形の取付ピッチはカタログ p.6。コンビネーションユニットの枠の形は模式。' },
    vi: { name: '真空バルブ（各相）', role: '真空の中で主接点を開閉する。負荷電流（電動機・変圧器・コンデンサ）をひんぱんに開閉するのが得意。', links: ['rod', 'term', 'fuse'], ev: 'doc', note: '真空バルブで電流を切る（カタログ p.6）。大きさ・位置は模式。' },
    term: { name: '主回路端子', role: '上が電源側、下が負荷側の電線をつなぐ端子として描いた。', links: ['fuse', 'vi'], ev: 'unk', note: '端子の位置・向きは外形図と未照合。' },
    fuse: { name: '電力ヒューズ（PF）', role: '短絡電流を切る。接触器は負荷電流の開閉、短絡はヒューズ、と役割を分ける。', links: ['vi', 'ls2', 'term'], ev: 'simp', note: 'コンビネーションユニットは電力ヒューズと組み合わせる（カタログ p.18〜19 に選定表）。取付け位置・向きは模式。' },
    ls2: { name: '電力ヒューズ溶断検出（LS2）', role: 'ヒューズが溶断すると動いて、接触器を引き外し、欠相運転を防ぐ。', links: ['fuse', 'tc'], ev: 'doc', note: 'LS2・電力ヒューズ溶断検出装置（カタログ p.14〜16、国内製品ページ）。形は模式。' },
    rod: { name: '絶縁操作ロッド・主軸', role: '電磁石の可動鉄心の動きを、3相の可動接点に伝える。', links: ['arm', 'vi'], ev: 'unk', note: '形・位置は模式。' },
    mech: { name: '操作機構（電磁石の箱）', role: '投入コイル・引外しコイル・鉄心・永久磁石・引外しばねを収めた部分。', links: ['cc', 'tc', 'arm', 'pm'], ev: 'simp', note: '構成はカタログ p.22〜23 の動作説明から。箱の形・位置は模式。' },
    fixcore: { name: '固定鉄心・ヨーク', role: '投入コイルの磁束の通り道。可動鉄心を吸い付ける。', links: ['arm', 'cc', 'pm'], ev: 'doc', note: '「可動鉄心が固定鉄心に吸引される」（カタログ p.23）。形は模式。' },
    arm: { name: '可動鉄心', role: '投入コイルで吸引されて動き、主軸を回して接点を閉じる。', links: ['fixcore', 'rod', 'spring'], ev: 'doc', note: 'カタログ p.23。形・動く向きは模式。' },
    cc: { name: '投入コイル', role: '「入」の指令で励磁され、可動鉄心を吸引する。吸引が終わるとLS1が電流を切る。', links: ['fixcore', 'ls1'], ev: 'doc', note: 'カタログ p.22〜23。形は模式。' },
    pm: { name: '永久磁石（ラッチ式）', role: '投入した状態を磁石の力で保持する。制御電源が切れても「入」のまま。注油がいらない。', links: ['fixcore', 'arm', 'tc'], ev: 'doc', note: 'ラッチ式（L）の電磁保持（カタログ p.1・p.23、国内製品ページ）。形・位置は模式。' },
    tc: { name: '引外しコイル', role: '「切」の指令で励磁され、永久磁石の磁束を打ち消す。保持が外れて、引外しばねで開く。', links: ['pm', 'spring'], ev: 'doc', note: 'カタログ p.23。形・位置は模式。' },
    spring: { name: '引外しばね', role: '保持が外れると、接点を開く向きに主軸を戻す。', links: ['arm', 'tc'], ev: 'doc', note: 'カタログ p.23。形・位置は模式。' },
    ls1: { name: 'LS1（投入コイル遮断）', role: '投入が終わったら投入コイルの電流を切るスイッチ。', links: ['cc'], ev: 'doc', note: 'カタログ p.14〜15・p.22〜23。形・位置は模式。' },
    aux: { name: '補助スイッチ（2a2b）・動作回数計・入切表示', role: '入・切に連動する接点、開閉回数の計数、前面の表示。', links: ['mech'], ev: 'doc', note: '補助スイッチ2a2b（カタログ p.16）、動作回数計は標準付属（国内製品ページ）。並びは模式。' }
  };
  function build(G, st, mode) {
    var c = st.closed || 0, gap = 0.22 * (1 - c);
    /* 取付枠・後ろの絶縁枠 */
    G.box(3.8, 0.15, 3.0, 0, 0.08, 0, STEEL, { part: 'frame' });
    [-1, 1].forEach(function (s) { G.box(0.12, 4.6, 0.12, s * 1.85, 2.4, -1.35, STEEL, { part: 'frame' }); });
    G.box(3.8, 0.12, 0.12, 0, 4.7, -1.35, STEEL, { part: 'frame' });
    G.box(3.6, 3.6, 0.06, 0, 2.6, -1.25, INS, { part: 'frame', alpha: 0.6 });
    PH.forEach(function (ph) {
      var x = PX[ph], blown = st.blown && ph === 'V';
      /* 真空バルブ */
      G.cyl(0.32, 1.3, x, VY, VZ, 0xe8e4da, 'y', { part: 'vi', shell: true, shellAlpha: 0.3 }, { seg: 18 });
      G.cyl(0.34, 0.06, x, VY + 0.65, VZ, 0xb8b8b4, 'y', { part: 'vi' }, { seg: 18 });
      G.cyl(0.34, 0.06, x, VY - 0.65, VZ, 0xb8b8b4, 'y', { part: 'vi' }, { seg: 18 });
      G.cyl(0.22, 0.04, x, VY + 0.06, VZ, CU, 'y', { part: 'vi', layer: 'int' }, { seg: 14 });
      G.cyl(0.22, 0.04, x, VY - 0.02 - 0.12 * (1 - c), VZ, CU, 'y', { part: 'vi', layer: 'int' }, { seg: 14 });
      G.rod([x, VY + 0.08, VZ], [x, VY + 0.7, VZ], 0.05, CU, { part: 'vi', cond: 'mid' }, 6);
      G.rod([x, VY - 0.04 - 0.12 * (1 - c), VZ], [x, VY - 0.85, VZ], 0.05, CU, { part: 'vi', cond: c > 0.5 ? 'mid' : 'off' }, 6);
      /* ヒューズ（前・縦）：上の端子 → ヒューズ → 真空バルブの上 */
      G.cyl(0.27, FT - FB - 0.3, x, (FT + FB) / 2, FZ, 0xf2f0ea, 'y', { part: 'fuse', shell: true, shellAlpha: 0.2 }, { seg: 18 });
      G.cyl(0.29, 0.15, x, FT - 0.08, FZ, 0xc9cacc, 'y', { part: 'fuse', cond: 'src' }, { seg: 18 });
      G.cyl(0.29, 0.15, x, FB + 0.08, FZ, 0xc9cacc, 'y', { part: 'fuse', cond: blown ? 'off' : 'mid' }, { seg: 18 });
      if (blown) G.cyl(0.275, 0.25, x, (FT + FB) / 2, FZ, 0xb83a2b, 'y', { part: 'fuse', layer: 'int' }, { seg: 18 });
      G.rod([x, FB + 0.08, FZ], [x, FB - 0.3 - 0.15 * (blown ? st.striker || 0 : 0), FZ], 0.03, 0xd9a227, { part: 'ls2' }, 6);
      G.box(0.08, 0.5, 0.5, x, FT + 0.1, FZ - 0.2, CU, { part: 'term', cond: 'src' });
      G.box(0.12, 0.08, 1.9, x, FT + 0.35, -0.15, CU, { part: 'term', cond: 'src' });
      G.box(0.12, 0.08, 1.6, x, FB - 0.05, 0.1, CU, { part: 'fuse', cond: blown ? 'off' : 'mid' });
      G.rod([x, FB - 0.05, -0.7], [x, VY + 0.7, VZ], 0.04, CU, { part: 'fuse', cond: blown ? 'off' : 'mid' }, 6);
      /* 負荷側端子（下・後ろへ） */
      G.box(0.12, 0.08, 0.9, x, VY - 0.9, -1.05, CU, { part: 'term', cond: c > 0.5 && !blown ? 'mid' : 'off' });
      /* 絶縁操作ロッド */
      G.rod([x, 1.25 + 0.12 * c, -0.1], [x, VY - 0.85, VZ], 0.06, 0xd9c9a3, { part: 'rod' }, 6);
    });
    G.cyl(0.06, 3.0, 0, 1.25, -0.1, 0x55595e, 'x', { part: 'rod' }, { seg: 10 });
    G.box(0.6, 0.06, 0.06, 0, 1.25 + 0.12 * c, 0.2, 0x55595e, { part: 'rod' });
    /* LS2 の横棒（ストライカで押される） */
    G.box(2.8, 0.05, 0.05, 0, FB - 0.4 - 0.08 * (st.striker || 0), FZ, 0x7a7a76, { part: 'ls2' });
    /* 操作機構の箱（前・下） */
    G.box(2.4, 1.5, 1.3, MC[0], MC[1], MC[2], 0x6b7075, { part: 'mech', shell: true, shellAlpha: 0.2 });
    G.box(0.32, 0.14, 0.03, -0.5, MC[1] + 0.45, MC[2] + 0.66, c > 0.5 ? 0xc0392b : 0x2f8a4e, { part: 'aux' });
    G.box(0.36, 0.14, 0.03, 0.4, MC[1] + 0.45, MC[2] + 0.66, 0x2c2c2a, { part: 'aux' });
    G.box(0.5, 0.35, 0.3, 0.85, MC[1] - 0.3, MC[2] + 0.2, 0x3f4a55, { part: 'aux', layer: 'int' });
    /* 電磁石（中・模式）：ヨーク・固定鉄心・投入コイル・永久磁石・可動鉄心・引外しコイル・ばね・LS1 */
    G.box(1.4, 0.12, 0.8, 0, 0.3, MC[2], 0x5e6266, { part: 'fixcore', layer: 'int' });
    [-0.64, 0.64].forEach(function (x) { G.box(0.12, 0.8, 0.8, x, 0.7, MC[2], 0x5e6266, { part: 'fixcore', layer: 'int' }); });
    G.cyl(0.18, 0.75, 0, 0.72, MC[2], 0x5e6266, 'y', { part: 'fixcore', layer: 'int' }, { seg: 14 });
    G.cyl(0.4, 0.55, 0, 0.66, MC[2], st.ccCur ? 0xe0a03a : CU, 'y', { part: 'cc', layer: 'int', shell: true, shellAlpha: 0.5 }, { seg: 18 });
    [-0.52, 0.52].forEach(function (x) { G.box(0.14, 0.3, 0.6, x, 0.95, MC[2], st.tcCur ? 0x9b8fd0 : 0x2f6fb5, { part: 'pm', layer: 'int' }); });
    G.box(1.4, 0.1, 0.8, 0, 1.15 + gap, MC[2], 0x4a4f55, { part: 'arm', layer: 'int' });
    G.rod([0, 1.2 + gap, MC[2]], [0, 1.25 + 0.12 * c, 0.2], 0.04, 0x55595e, { part: 'arm', layer: 'int' }, 6);
    G.cyl(0.14, 0.3, 0.75, 1.5, MC[2], st.tcCur ? 0xe0a03a : 0xb8743f, 'y', { part: 'tc', layer: 'int' }, { seg: 12 });
    G.helix([-0.75, 1.35 + gap / 2, MC[2]], 'y', 0.09, 0.35 + gap, 6, 0x2f6fa8, 2, { part: 'spring', layer: 'int' });
    G.box(0.2, 0.15, 0.2, -0.95, 1.2, MC[2] + 0.3, c > 0.9 ? 0xc0392b : 0x2f8a4e, { part: 'ls1', layer: 'int' });
    if (mode === 'ext') return;
    /* 主回路の電流（往路：上の端子 → ヒューズ → 真空バルブ → 下の端子） */
    if (st.load && c > 0.9) PH.forEach(function (ph) {
      var x = PX[ph];
      if (st.blown && ph === 'V') return;
      G.flow([[x, FT + 0.35, -1.0], [x, FT + 0.35, FZ - 0.2], [x, FT, FZ + 0.3], [x, FB, FZ + 0.3], [x, FB - 0.05, -0.7], [x, VY + 0.7, VZ], [x, VY - 0.85, VZ], [x, VY - 0.9, -1.5]], { col: st.fault && ph === 'V' ? 'bad' : 'cur', speed: st.fault && ph === 'V' ? 1.2 : 0.45, m: { part: 'vi' } });
    });
    /* 操作コイルの電流（制御回路） */
    if (st.ccCur) G.flow([[-1.1, 0.9, MC[2] + 0.6], [-0.45, 0.66, MC[2] + 0.3], [0, 0.95, MC[2] + 0.42], [0.45, 0.66, MC[2] + 0.3], [1.1, 0.9, MC[2] + 0.6]], { speed: 0.5, m: { part: 'cc', layer: 'int' } });
    if (st.tcCur) G.flow([[1.1, 1.8, MC[2] + 0.6], [0.75, 1.65, MC[2] + 0.2], [0.75, 1.35, MC[2] + 0.2], [1.1, 1.2, MC[2] + 0.6]], { speed: 0.5, m: { part: 'tc', layer: 'int' } });
    if (c > 0.9 && st.pmHold) G.flux([[-0.52, 1.1, MC[2] + 0.42], [0, 1.2, MC[2] + 0.42], [0.52, 1.1, MC[2] + 0.42], [0.52, 0.8, MC[2] + 0.42], [0.6, 0.35, MC[2] + 0.42], [0, 0.32, MC[2] + 0.42], [-0.6, 0.35, MC[2] + 0.42], [-0.52, 0.8, MC[2] + 0.42]], { speed: 0.4, w: 2.2, m: { part: 'pm', layer: 'int' } });
  }
  function tint(m, st, mode) {
    if (mode === 'ext' || !st.live || !m.cond) return null;
    if (m.cond === 'src' || m.cond === 'mid') return { c: [240, 153, 123], k: 0.55 };
    return null;
  }
  var labels = [
    { part: 'vi', t: '真空バルブ', p: [PX.U - 0.6, VY, VZ] },
    { part: 'fuse', t: '電力ヒューズ（PF）', p: [PX.W + 0.75, (FT + FB) / 2, FZ] },
    { part: 'term', t: '電源側', p: [0, FT + 0.7, -1.0] },
    { t: '負荷側', p: [PX.W + 0.4, VY - 1.2, -1.5] },
    { part: 'mech', t: '操作機構', p: [-1.4, MC[1] + 0.9, MC[2] + 0.6], layer: 'ext-only' },
    { part: 'aux', t: '入切表示・動作回数計', p: [0, MC[1] + 0.85, MC[2] + 0.75], layer: 'ext-only' },
    { part: 'rod', t: '絶縁操作ロッド', p: [PX.U - 0.5, 1.6, -0.35], layer: 'int' },
    { part: 'cc', t: '投入コイル', p: [-0.15, 0.3, MC[2] + 0.75], layer: 'int' },
    { part: 'pm', t: '永久磁石', p: [-0.85, 0.95, MC[2] + 0.5], layer: 'int' },
    { part: 'arm', t: '可動鉄心', p: [0.3, 1.35 + 0.22, MC[2] + 0.6], layer: 'int' },
    { part: 'tc', t: '引外しコイル', p: [1.1, 1.75, MC[2] + 0.4], layer: 'int' },
    { part: 'spring', t: '引外しばね', p: [-1.2, 1.7, MC[2]], layer: 'int' },
    { part: 'ls2', t: 'ヒューズ溶断検出 LS2', p: [1.0, FB - 0.6, FZ + 0.3], layer: 'int' },
    { t: 'V相ヒューズ溶断', p: [0, (FT + FB) / 2, FZ + 0.5], hot: true, layer: 'int', when: function (s) { return s.blown; } }
  ];
  var base = { closed: 0, live: true, load: false, ccCur: false, tcCur: false, pmHold: false, blown: false, striker: 0, fault: false };
  var scenarios = [
    { name: '投入（ラッチ式）', steps: [
      { t: '切：電源側は充電されている', x: '主接点は開いていて、電源側の端子とヒューズだけ充電されている（オレンジ）。', s: 'ok', st: { closed: 0, load: false, ccCur: false, tcCur: false, pmHold: false, blown: false, striker: 0, fault: false } },
      { t: '「入」の指令：投入コイルが励磁される', x: '投入コイルに電流が流れ、固定鉄心と可動鉄心のあいだに磁束ができる。', s: 'ok', st: { ccCur: true } },
      { t: '可動鉄心が吸引され、主接点が閉じる', x: '可動鉄心が固定鉄心に吸い付き、主軸と絶縁操作ロッドが3相の可動接点を押し上げる。引外しばねは押し縮められる。', s: 'ok', st: { closed: 1 } },
      { t: 'LS1 が投入コイルの電流を切り、永久磁石が保持する', x: '投入が終わると LS1 が投入コイルの電流を切る。そのあとは永久磁石の磁束（青い破線）で「入」を保持する。制御電源が切れても「入」のまま。', s: 'ok', st: { ccCur: false, pmHold: true, load: true } }
    ] },
    { name: '引外し（ラッチ式）', steps: [
      { t: '入：永久磁石で保持中', x: '負荷電流が流れている。', s: 'ok', st: { closed: 1, load: true, ccCur: false, tcCur: false, pmHold: true, blown: false, striker: 0, fault: false } },
      { t: '「切」の指令：引外しコイルが励磁される', x: '引外しコイルの磁束が、永久磁石の磁束を打ち消す。保持する力がなくなる。', s: 'warn', st: { tcCur: true, pmHold: false } },
      { t: '引外しばねで開く', x: '引外しばねが可動鉄心を押し戻し、3相の主接点が開く。真空バルブの中で負荷電流が切れる。', s: 'ok', st: { closed: 0, load: false, tcCur: false } }
    ] },
    { name: '常時励磁式との違い', steps: [
      { t: '常時励磁式（E）は、コイルの電流で「入」を保つ', x: '常時励磁式は、保持コイルに電流を流し続けて「入」を保つ。このモデルはラッチ式（L）なので、保持は永久磁石。', s: 'ok', st: { closed: 1, load: true, pmHold: true, ccCur: false, tcCur: false } },
      { t: '制御電源が切れると', x: '常時励磁式は、制御電源が16msほど切れただけでも開く（カタログ p.22）。ラッチ式は永久磁石で保持しているので開かない。停電後の自動再始動を避けたい電動機などは常時励磁式、電源が切れても入れておきたい回路はラッチ式、と使い分ける。', s: 'warn', st: {} }
    ] },
    { name: 'ヒューズ溶断（短絡）', steps: [
      { t: 'V相の負荷側で短絡', x: '短絡電流（赤い粒）が流れる。接触器は負荷電流の開閉用で、短絡電流は電力ヒューズが切る。', s: 'ng', st: { closed: 1, load: true, pmHold: true, fault: true, blown: false, striker: 0, ccCur: false, tcCur: false } },
      { t: '電力ヒューズが溶断する', x: 'V相のヒューズが限流遮断する。U相・W相はまだ流れている（欠相）。', s: 'ng', st: { blown: true, fault: false, striker: 1 } },
      { t: '溶断検出（LS2）で接触器が引き外される', x: 'ストライカが溶断検出の横棒を押して LS2 が動き、引外しコイルが励磁されて3相とも開く。欠相運転を防ぐ。', s: 'warn', st: { tcCur: true, pmHold: false, closed: 0, load: false }, hz: '溶断したヒューズは3相とも交換を検討し、原因を調べてから投入する（手順はメーカーの取扱説明書に従う）。' }
    ] }
  ];
  function stateList(st) { return [['主接点', st.closed > 0.5 ? '入' : '切', false], ['投入コイル', st.ccCur ? '励磁' : '無励磁', false], ['引外しコイル', st.tcCur ? '励磁' : '無励磁', false], ['保持', st.closed > 0.5 ? (st.pmHold ? '永久磁石' : '保持なし') : '—', false], ['V相ヒューズ', st.blown ? '溶断' : '健全', !!st.blown]]; }
  function svgUpdate(svg, st) {
    var s = svg.querySelector('#vs-sw'); if (s) s.setAttribute('d', st.closed > 0.5 ? 'M210 60 V100' : 'M210 100 L190 64');
    var b = svg.querySelector('#vs-blow'); if (b) b.style.display = st.blown ? '' : 'none';
    var cc = svg.querySelector('#vs-cc'); if (cc) cc.setAttribute('fill', st.ccCur ? '#f2b233' : '#fff');
    var tc = svg.querySelector('#vs-tc'); if (tc) tc.setAttribute('fill', st.tcCur ? '#f2b233' : '#fff');
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.vcs = {
    title: '高圧真空電磁接触器 VCS', parts: parts, partOrder: ['term', 'fuse', 'vi', 'rod', 'mech', 'aux', 'frame', 'fixcore', 'arm', 'cc', 'pm', 'tc', 'spring', 'ls1', 'ls2'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#vcsWire', svgUpdate: svgUpdate,
    view: { yaw: -0.6, pitch: 0.25 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.57, pitch: 0.08 }, mag: { label: '電磁石', yaw: -0.4, pitch: 0.2, zoom: 2.4, target: [0, 0.9, 0.7] } },
    banner: { ext: ['参考：三菱電機 VZ-E コンビネーション 200A・ラッチ式', '!外形・ヒューズの位置は外形図と未照合'], int: ['!電磁石・ばね・リンクの形と位置は模式（動作の順番は資料どおり）'], op: ['!動きは模式・時間は表していない'], wire: [] }
  };
})();
