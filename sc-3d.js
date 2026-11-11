/* 高圧進相コンデンサ（参考：日新電機 PET-FK4N OF式・6%リアクトル用、カタログ「電力用コンデンサ 関連機器」Cat.No.237 R5 2023年10月）
   資料で確かめたこと：完全密閉構造で絶縁油を収納したOF式（p.2）、6%用の定格電圧7.02kV（p.3）、
   放電抵抗内蔵で開放5分後に50V以下（p.3）、保安装置はケース変形力で電流路を切断（p.23）、
   内圧式保護用接点はケース内圧上昇で動作し遮断器の引外し回路へ接続（p.23）、素子は金属蒸着フィルムで自己回復（p.7・p.23）、
   p.23の内部構造図の部品名（絶縁紙チューブ付リード線、支持板、可断片、内部素子）、放電抵抗付きは再投入まで5分以上（p.24）。
   外形は p.3 図1 に合わせた：ケース幅415・奥行110・高さ155、ブッシング3本（140ピッチ・ケース上面から195）、全高350、
   取付足を含む幅470、取付孔 440×80（6-12×16長孔）、接地端子M6は正面右下。
   結線は p.3 図1 の結線図のとおり Y（スター）：各相の素子と放電抵抗を並列にして端子と中性点のあいだに入れ、
   外側2相の中性点側に保安装置（F）が1つずつ入る。保安装置の可断片は、素子の上で前後の壁の支持金具に渡した支持板に付く（p.22 断面図）。
   PET-FK4N（31.9kvarまで）は保安装置内蔵。内圧式保護用接点が付くのは PET-FK4（53.2kvar以上）で、このモデルには描いていない。
   素子の数・並び、放電抵抗の位置は資料になく模式。 1 = 100mm */
(function () {
  'use strict';
  var W = 4.15, D = 1.1, H = 1.55, Y0 = 0.06, BH = 1.95, TOP = Y0 + H;
  var STEEL = 0x8c939a, POR = 0x8d8f8a;
  var BX = [-1.4, 0, 1.4], YE = Y0 + 0.62, YN = Y0 + 1.22, ZR = 0.38;
  var parts = {
    can: { name: '容器胴（ケース）', role: '素子と絶縁油を完全に密閉している鋼板のケース。内部で故障するとガスで内圧が上がり、ふくらむ。', links: ['oil', 'guard'], ev: 'doc', note: '完全密閉のOF式（カタログ p.2）。外形は図1のとおり：幅415・奥行110・高さ155、取付足を含む幅470、取付孔440×80、全高350（カタログ p.3）。' },
    bush: { name: '端子（ブッシング）', role: '直列リアクトルからの電線をつなぐ主回路端子。上に絶縁キャップをかぶせる。', links: ['lead', 'can'], ev: 'doc', note: '3本・140mmピッチ・ケース上面から195mm、端子はM12、適合電線14〜38mm²（カタログ p.3 図1）。ひだの形は図からの読み取り。' },
    gnd: { name: '接地端子（M6）', role: 'ケースを接地する端子。', links: ['can'], ev: 'doc', note: '正面の右下、M6ボルト、接地線5.5mm²以上（カタログ p.3 図1）。' },
    oil: { name: '絶縁油', role: '素子のすき間を満たして絶縁する。', links: ['can', 'elem'], ev: 'doc', note: 'OF式（カタログ p.2）。油量は4〜5L（p.3）。油の種類は未確認。' },
    elem: { name: '内部素子（金属蒸着フィルム）', role: 'フィルムに金属を蒸着した電極を巻いた素子。小さな絶縁破壊なら、まわりの蒸着膜が蒸発して絶縁が戻る（自己回復）。', links: ['plate', 'lead', 'res', 'neutral'], ev: 'doc', note: '金属蒸着フィルム・自己回復（カタログ p.7・p.22）。各相の素子が端子と中性点のあいだに入る Y 結線（p.3 結線図）。素子の数・並びは資料になく模式。' },
    plate: { name: '支持板（絶縁物）', role: '可断片を載せて、前後の壁の支持金具に渡してある板。素子の仕切りも同じ色で描いた。', links: ['guard', 'elem'], ev: 'simp', note: '部品名と、可断片を支える位置はカタログ p.22 の断面図。素子の仕切りは模式。' },
    lead: { name: '絶縁紙チューブ付リード線', role: '端子と素子をつなぐリード線。絶縁紙のチューブで覆っている。', links: ['bush', 'elem'], ev: 'simp', note: '部品名はカタログ p.22 の図。経路は模式。' },
    neutral: { name: '中性点側の線', role: '3相の素子と放電抵抗の、端子と反対側をまとめる線。外側の2相は保安装置を通って中央の相につながる。', links: ['elem', 'res', 'guard'], ev: 'doc', note: 'Y 結線で、外側2相の中性点側に保安装置（F）が入る（カタログ p.3 図1の結線図）。線の通り道は模式。' },
    guard: { name: '保安装置（可断片）', role: '内部故障でケースがふくらむと、前後の壁が離れる力で可断片がちぎれ、電流路を切って事故の拡大を防ぐ。', links: ['neutral', 'plate', 'can'], ev: 'doc', note: '方式と、素子の上で支持金具・支持板に付く構造はカタログ p.22 の断面図。2つを外側2相の中性点側に入れるのは p.3 の結線図。細かな形は模式。' },
    res: { name: '放電抵抗（内蔵）', role: '電源から切り離したあと、たまった電荷を逃がす抵抗。開放5分後に50V以下。各相の素子と並列に入っていて、中性点でつながるので、直流で見ると3つの端子がつながっている。だから絶縁抵抗はU端子1か所に当てるだけで3相ぶん測れる。', links: ['elem', 'bush', 'neutral'], ev: 'doc', note: '内蔵・5分後50V以下はカタログ p.3。各相の素子と並列（端子と中性点のあいだ）は p.3 図1の結線図。位置・形は模式。' },
    meg: { name: '絶縁抵抗計（メガ）', role: '直流の電圧をかけて、端子とケース（接地）のあいだに流れるわずかな漏れ電流から絶縁抵抗を出す。L を U 端子、E を接地端子へ。', links: ['bush', 'gnd'], ev: 'simp', note: '場面の説明用。測定電圧・判定値は社内基準に従う。' }
  };
  function build(G, st, mode) {
    var bulge = st.bulge || 0;
    /* 容器胴（ふくらみは前後の面の張り出しで表す） */
    G.box(W, H, D + bulge * 0.35, 0, Y0 + H / 2, 0, STEEL, { part: 'can', shell: true, shellAlpha: 0.15 });
    G.box(W + 0.06, 0.05, D + 0.06, 0, TOP + 0.02, 0, 0x7a8288, { part: 'can' });
    /* 取付足（足を含む幅470、取付孔 440×80） */
    [-1, 1].forEach(function (sx) {
      G.box(0.3, 0.05, D, sx * (W / 2 + 0.125), 0.03, 0, 0x5f666b, { part: 'can' });
      [-0.4, 0, 0.4].forEach(function (z) { G.cyl(0.05, 0.07, sx * 2.2, 0.03, z, 0x2c2c2a, 'y', { part: 'can' }, { seg: 8 }); });
    });
    /* 正面の表示（容量表示・警告一覧）と接地端子 M6 */
    G.box(0.5, 0.55, 0.02, -1.55, Y0 + 0.75, D / 2 + 0.01, 0xd9dde0, { part: 'can' });
    G.box(0.7, 0.55, 0.02, 0.35, Y0 + 0.75, D / 2 + 0.01, 0xd9dde0, { part: 'can' });
    G.cyl(0.05, 0.14, 1.15, Y0 + 0.3, D / 2 + 0.07, 0xb8b8b4, 'z', { part: 'gnd' }, { seg: 10 });
    /* 端子（ブッシング3本・140ピッチ・高さ195。上は絶縁キャップ） */
    BX.forEach(function (x) {
      G.cyl(0.14, BH - 0.45, x, TOP + (BH - 0.45) / 2, 0, 0xe9e9e4, 'y', { part: 'bush' }, { seg: 14 });
      [0.28, 0.7, 1.12].forEach(function (h, i) { G.cyl(0.33 - i * 0.04, 0.1, x, TOP + h, 0, 0xe9e9e4, 'y', { part: 'bush' }, { seg: 18 }); });
      G.cyl(0.2, 0.45, x, TOP + BH - 0.225, 0, 0x2c2c2a, 'y', { part: 'bush', cond: 'v' }, { seg: 12 });
    });
    /* ---- 中（模式） ---- */
    G.box(W - 0.1, H - 0.1, D - 0.1, 0, Y0 + H / 2, 0, 0xd9a93a, { part: 'oil', layer: 'int', alpha: 0.12, nopick: true });
    /* 素子（相ごとに1組。板を立てて並べた形で描いた）と、仕切りの支持板 */
    BX.forEach(function (x, c) {
      for (var k = 0; k < 7; k++) {
        var hot = st.fault && c === 1 && k === 3;
        G.box(0.13, 0.95, D - 0.45, x - 0.48 + k * 0.16, YE, -0.08, hot ? 0xb83a2b : (k % 2 ? 0x8a9399 : 0xb9c2c9), { part: 'elem', layer: 'int' });
      }
    });
    [-0.7, 0.7].forEach(function (x) { G.box(0.05, 1.0, D - 0.3, x, YE, 0, 0xd9c9a3, { part: 'plate', layer: 'int' }); });
    /* リード線：端子 → 素子の上 */
    BX.forEach(function (x) { G.wire([[x, TOP + 0.05, 0], [x, YN + 0.12, 0], [x, YE + 0.5, -0.08]], 0x8a6e4e, 2.2, { part: 'lead', layer: 'int', cond: 'v' }); });
    /* 放電抵抗：各相の素子と並列（端子側 → 中性点側）。手前に立てて描いた */
    BX.forEach(function (x) {
      G.wire([[x, YN + 0.12, 0], [x + 0.3, YN + 0.05, ZR]], 0x2f6fa8, 1.6, { part: 'res', layer: 'int' });
      G.cyl(0.05, 0.6, x + 0.3, YE + 0.05, ZR, 0x2f6fa8, 'y', { part: 'res', layer: 'int', cond: 'res' }, { seg: 10 });
      G.wire([[x + 0.3, YN + 0.05, ZR], [x + 0.3, Y0 + 0.14, ZR], [x, Y0 + 0.14, ZR]], 0x2f6fa8, 1.6, { part: 'res', layer: 'int' });
      /* 素子の下 → 中性点側の線 */
      G.wire([[x, YE - 0.5, -0.08], [x, Y0 + 0.14, ZR]], 0x6b7f4a, 2, { part: 'neutral', layer: 'int', cond: 'n' });
    });
    /* 中性点：外側2相は保安装置（可断片）を通って中央へ。可断片は素子の上、前後の壁の支持金具に渡した支持板の上 */
    var cut = st.guard ? 0.16 : 0;
    [-1, 1].forEach(function (sx) {
      var xo = sx * 1.4, xg = sx * 0.7;
      G.wire([[xo, Y0 + 0.14, ZR], [xg, Y0 + 0.14, ZR + 0.08], [xg, YN + 0.02, ZR + 0.08], [xg, YN + 0.02, 0.2 + cut]], 0x6b7f4a, 2, { part: 'neutral', layer: 'int', cond: 'n' });
      G.wire([[xg, YN + 0.02, -0.2 - cut], [xg, YN + 0.02, -ZR - 0.06], [xg * 0.3, YN + 0.02, -ZR - 0.06], [0, Y0 + 0.14, ZR]], 0x6b7f4a, 2, { part: 'neutral', layer: 'int', cond: 'n' });
      /* 支持金具（前後の壁）と支持板、可断片 */
      [-1, 1].forEach(function (sz) { G.box(0.3, 0.06, 0.12, xg, YN - 0.03, sz * (D / 2 - 0.08 + bulge * 0.17), 0x6f777c, { part: 'guard', layer: 'int' }); });
      G.box(0.26, 0.03, D - 0.3, xg, YN - 0.05, 0, 0xd9c9a3, { part: 'plate', layer: 'int' });
      G.box(0.16, 0.05, 0.2, xg, YN + 0.02, 0.1 + cut, 0xd9a227, { part: 'guard', layer: 'int' });
      G.box(0.16, 0.05, 0.2, xg, YN + 0.02, -0.1 - cut, 0xd9a227, { part: 'guard', layer: 'int' });
    });
    if (st.spark) G.wire([[-0.2, YE - 0.1, D / 2 - 0.2], [0.02, YE + 0.08, D / 2 - 0.2], [0.2, YE - 0.12, D / 2 - 0.2]], 0xb38cff, 4, { part: 'elem', layer: 'int', nopick: true, zb: 0.4 });
    if (mode === 'ext') return;
    /* 絶縁抵抗計（メガ）：L を U 端子だけに、E を接地端子に */
    if (st.ir) {
      var MG = [-3.3, TOP + 0.9, 0.9];
      G.box(1.0, 0.7, 0.6, MG[0], MG[1], MG[2], 0xf2e6c9, { part: 'meg' });
      G.wire([[MG[0] + 0.5, MG[1] + 0.2, MG[2]], [-2.2, TOP + BH + 0.5, 0.3], [BX[0], TOP + BH + 0.1, 0]], 0xd85a30, 3, { part: 'meg' });
      G.wire([[MG[0] - 0.2, MG[1] - 0.35, MG[2]], [-3.3, -0.15, 1.1], [1.15, -0.15, 1.1], [1.15, Y0 + 0.3, D / 2 + 0.14]], 0x3b6d11, 3, { part: 'meg' });
      if (st.irflow) {
        /* U端子 → 放電抵抗 → 中性点 → V・W の放電抵抗 → V・W 端子（直流で3端子が同じ電位になる） */
        G.flow([[MG[0] + 0.5, MG[1] + 0.2, MG[2]], [-2.2, TOP + BH + 0.5, 0.3], [BX[0], TOP + BH + 0.1, 0], [BX[0], YN + 0.12, 0], [BX[0] + 0.3, YN + 0.05, ZR], [BX[0] + 0.3, Y0 + 0.14, ZR], [BX[0], Y0 + 0.14, ZR], [-0.7, Y0 + 0.14, ZR + 0.08], [-0.7, YN + 0.02, ZR + 0.08], [-0.7, YN + 0.02, -ZR - 0.06], [0, Y0 + 0.14, ZR]], { speed: 0.35, n: 9, m: { part: 'res', layer: 'int' } });
        G.flow([[0, Y0 + 0.14, ZR], [0.3, Y0 + 0.14, ZR], [0.3, YN + 0.05, ZR], [0, YN + 0.12, 0], [0, TOP + BH, 0]], { speed: 0.35, n: 4, m: { part: 'res', layer: 'int' } });
        G.flow([[0, Y0 + 0.14, ZR], [0.2, YN + 0.02, -ZR - 0.06], [0.7, YN + 0.02, -ZR - 0.06], [0.7, YN + 0.02, ZR + 0.08], [0.7, Y0 + 0.14, ZR + 0.08], [1.4, Y0 + 0.14, ZR], [1.7, Y0 + 0.14, ZR], [1.7, YN + 0.05, ZR], [1.4, YN + 0.12, 0], [1.4, TOP + BH, 0]], { speed: 0.35, n: 6, m: { part: 'res', layer: 'int' } });
        G.flow([[0, YE, 0.2], [0, YE, D / 2], [1.15, Y0 + 0.3, D / 2], [1.15, Y0 + 0.3, D / 2 + 0.14], [1.15, -0.15, 1.1], [-3.3, -0.15, 1.1], [MG[0] - 0.2, MG[1] - 0.35, MG[2]]], { speed: 0.2, n: 5, col: 'bad', m: { part: 'can' } });
      }
    }
    /* 充電電流（往路：端子から素子へ。交流なので向きは半周期ごとに入れかわる） */
    if (st.on && !st.guard) BX.forEach(function (x) { G.flow([[x, TOP + BH + 0.3, 0], [x, TOP + 0.05, 0], [x, YN + 0.12, 0], [x, YE + 0.5, -0.08], [x, YE - 0.5, -0.08], [x, Y0 + 0.14, ZR]], { speed: 0.5, m: { part: 'elem', layer: 'int' } }); });
    /* 放電：各相の素子の電荷が、並列の放電抵抗を回って減る */
    if (st.dis) BX.forEach(function (x) { G.flow([[x, YE + 0.5, -0.08], [x, YN + 0.12, 0], [x + 0.3, YN + 0.05, ZR], [x + 0.3, Y0 + 0.14, ZR], [x, Y0 + 0.14, ZR], [x, YE - 0.5, -0.08]], { speed: 0.25, n: 4, m: { part: 'res', layer: 'int' } }); });
  }
  function tint(m, st, mode) {
    if (mode === 'ext') return null;
    if (st.ir && (m.cond === 'v' || m.cond === 'res' || m.cond === 'n')) return { c: [240, 153, 123], k: 0.55 };
    if (m.cond === 'v' && (st.on || st.charge)) return { c: [240, 153, 123], k: st.on ? 0.6 : 0.35 };
    if (m.part === 'elem' && st.charge && !st.on) return { c: [240, 153, 123], k: 0.25 };
    return null;
  }
  var labels = [
    { part: 'bush', t: '端子（3本）', p: [0, TOP + BH + 0.35, 0] },
    { part: 'can', t: '容器胴（完全密閉）', p: [-1.0, Y0 + 0.2, D / 2 + 0.3], layer: 'ext-only' },
    { part: 'gnd', t: '接地端子', p: [1.6, Y0 + 0.1, D / 2 + 0.3], layer: 'ext-only' },
    { part: 'elem', t: '内部素子（模式）', p: [-1.4, YE - 0.3, D / 2 + 0.2], layer: 'int' },
    { part: 'guard', t: '保安装置（可断片）', p: [-0.7, YN + 0.4, 0.3], layer: 'int' },
    { part: 'res', t: '放電抵抗（素子と並列）', p: [1.9, YE + 0.2, ZR + 0.3], layer: 'int' },
    { part: 'neutral', t: '中性点', p: [0.2, Y0 - 0.15, ZR + 0.3], layer: 'int' },
    { part: 'meg', t: '絶縁抵抗計（L は U だけ）', p: [-3.3, TOP + 1.6, 0.9], when: function (s) { return s.ir; } },
    { t: 'V・W も同じ電位', p: [2.3, TOP + BH + 0.2, 0], hot: true, when: function (s) { return s.irflow; } },
    { t: '自己回復', p: [0, YE + 0.2, D / 2 + 0.3], hot: true, layer: 'int', when: function (s) { return s.spark && !s.fault; } },
    { t: 'ケースがふくらむ', p: [0, Y0 + 0.3, D / 2 + 0.6], hot: true, layer: 'int', when: function (s) { return s.bulge > 0.3; } }
  ];
  var base = { on: false, charge: false, dis: false, spark: false, fault: false, bulge: 0, guard: false, press: false, ir: false, irflow: false };
  var scenarios = [
    { name: 'ふだん（充電電流）', steps: [
      { t: '電源につながっている', x: '交流なので、半周期ごとに充電と放電をくり返し、進み電流が流れる。端子 → リード線 → 素子 → 中性点 の向きに描いているが、向きは半周期ごとに入れかわる。', s: 'ok', st: { on: true, charge: true, dis: false } }
    ] },
    { name: '切り離したあと（放電抵抗）', steps: [
      { t: '開閉器で電源から切り離す', x: '素子には電荷が残り、端子に電圧が残っている（うすいオレンジ）。', s: 'warn', st: { on: false, charge: true, dis: false }, hz: '切ってすぐは端子に電圧が残っている。触れない。' },
      { t: '放電抵抗が電荷を逃がす', x: '各相の素子と並列に入った放電抵抗を回って、電荷がゆっくり減る。カタログでは開放5分後に50V以下。', s: 'warn', st: { dis: true } },
      { t: '5分たって放電が進んだ', x: '端子電圧は50V以下まで下がる。それでも作業の前は検電し、接地して残りの電荷を抜く。', s: 'ok', st: { charge: false, dis: false }, hz: '放電抵抗付きは、再投入まで5分以上あける（カタログ p.24）。電荷が残ったまま投入すると過大な突入電流になる。' }
    ] },
    { name: '絶縁抵抗測定（1端子で3相）', steps: [
      { t: '測定の準備', x: '停電して検電し、端子を接地して残っている電荷を抜く。端子につながる電線（直列リアクトル側）を外して、コンデンサだけにする。', s: 'ok', st: { on: false, charge: false, dis: false, ir: false, irflow: false, spark: false, fault: false, bulge: 0, guard: false, press: false } },
      { t: 'L を U 端子1か所、E を接地端子へ', x: '絶縁抵抗計の L を U 端子だけに当て、E をケースの接地端子につなぐ。', s: 'ok', st: { ir: true } },
      { t: '直流をかけると、V・W 端子も同じ電位になる', x: '素子は直流を通さないが、放電抵抗は直流を通す。U の放電抵抗 → 中性点 → V・W の放電抵抗と通って、V・W 端子も U と同じ電位になる（3つともオレンジ）。だから U 1か所で、3相ぶんの端子・リード・素子とケースのあいだの絶縁を、まとめて測っている。赤い粒は、絶縁物を通ってケース → E へ戻るわずかな漏れ電流。', s: 'ok', st: { irflow: true } },
      { t: '指示が落ち着くまで待つ', x: 'はじめは素子を直流で充電する電流が流れるので、指示が低く出て、だんだん上がっていく。落ち着いてから読む。', s: 'warn', st: {} },
      { t: '測ったあとは放電してから外す', x: '素子は絶縁抵抗計の直流で充電されている。リードを外す前に、端子を接地して放電する。', s: 'warn', st: { irflow: false, ir: false, charge: true }, hz: '測定後のコンデンサには直流の電荷が残る。放電せずに触れると感電のおそれ。' }
    ] },
    { name: '内部で故障したとき', steps: [
      { t: '小さな絶縁破壊：自己回復', x: '素子の中で小さな絶縁破壊が起きると、まわりの蒸着膜が蒸発して離れ、絶縁が戻る（金属蒸着フィルムの自己回復）。', s: 'warn', st: { on: true, charge: true, spark: true, fault: false } },
      { t: '大きな故障：ガスでケースがふくらむ', x: '自己回復しきれない故障では、ガスが出てケースの内圧が上がり、容器胴がふくらむ。', s: 'ng', st: { spark: false, fault: true, bulge: 1 } },
      { t: '保安装置が電流路を切る', x: 'ケースがふくらむと前後の壁が離れ、その力で可断片がちぎれて電流路が切れる。事故の拡大を防ぐ。', s: 'ng', st: { guard: true, on: false }, hz: 'この形式（PET-FK4N・31.9kvarまで）は保安装置内蔵。53.2kvar以上の PET-FK4 形は内圧式保護用接点付きで、接点は警報ではなく遮断器の引外し回路につなぐ（カタログ p.4・p.22）。ふくらみは点検で確認する。' }
    ] }
  ];
  function stateList(st) { return [['電源', st.on ? '接続' : '切り離し', false], ['端子の電荷', st.charge ? '残っている' : '放電した', st.charge && !st.on], ['ケース', st.bulge > 0.3 ? 'ふくらみ' : '正常', st.bulge > 0.3], ['保安装置', st.guard ? '電流路を切断' : '通電', !!st.guard], ['絶縁抵抗計', st.ir ? 'U 端子に接続（V・W も同電位）' : 'なし', false]]; }
  function svgUpdate(svg, st) {
    var g = svg.querySelector('#sc-guard'); if (g) g.style.display = st.guard ? '' : 'none';
    var d = svg.querySelector('#sc-dis'); if (d) d.style.display = st.dis ? '' : 'none';
    var m = svg.querySelector('#sc-ir'); if (m) m.style.display = st.ir ? '' : 'none';
    var f = svg.querySelector('#sc-irflow'); if (f) f.style.display = st.irflow ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.sc = {
    title: '高圧進相コンデンサ', parts: parts, partOrder: ['bush', 'can', 'gnd', 'oil', 'elem', 'lead', 'res', 'neutral', 'guard', 'plate', 'meg'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#scWire', svgUpdate: svgUpdate,
    view: { yaw: -0.55, pitch: 0.25 },
    modeView: { op: { zoom: 0.85, target: [-0.6, 1.7, 0.2] } },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.57, pitch: 0.08 }, top: { label: '上', yaw: -0.2, pitch: 1.25 } },
    banner: { ext: ['参考：日新電機 PET-FK4N（OF式・6%用）', '外形と端子3本の位置はカタログの外形図（図1）に合わせた'], int: ['結線は Y：素子と放電抵抗が並列、外側2相に保安装置（カタログの結線図）', '!素子の数・並び・放電抵抗の位置は模式'], op: ['!電流の向き・大きさは模式'], wire: [] }
  };
})();
