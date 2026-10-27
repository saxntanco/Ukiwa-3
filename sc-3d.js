/* 高圧進相コンデンサ（参考：日新電機 PET-FK4N OF式・6%リアクトル用、カタログ「電力用コンデンサ 関連機器」Cat.No.237 R5 2023年10月）
   資料で確かめたこと：完全密閉構造で絶縁油を収納したOF式（p.2）、6%用の定格電圧7.02kV（p.3）、
   放電抵抗内蔵で開放5分後に50V以下（p.3）、保安装置はケース変形力で電流路を切断（p.23）、
   内圧式保護用接点はケース内圧上昇で動作し遮断器の引外し回路へ接続（p.23）、素子は金属蒸着フィルムで自己回復（p.7・p.23）、
   p.23の内部構造図の部品名（絶縁紙チューブ付リード線、支持板、可断片、内部素子）、放電抵抗付きは再投入まで5分以上（p.24）。
   素子の数・つなぎ方、ブッシングの数と位置、外形寸法は資料で確かめられていない（模式）。 1 = 約100mm */
(function () {
  'use strict';
  var W = 4.2, D = 2.3, H = 5.2, Y0 = 0.3;
  var STEEL = 0x8c939a, POR = 0x8d8f8a;
  var BX = [-1.3, 0, 1.3];
  var parts = {
    can: { name: '容器胴（ケース）', role: '素子と絶縁油を完全に密閉している鋼板のケース。内部で故障するとガスで内圧が上がり、ふくらむ。', links: ['oil', 'guard', 'press'], ev: 'doc', note: '完全密閉のOF式（カタログ p.2）、ケース変形・内圧上昇を使う保護（p.23）。寸法は未照合。' },
    bush: { name: '端子（ブッシング）', role: '直列リアクトルからの電線をつなぐ端子。', links: ['lead', 'can'], ev: 'unk', note: '3相の3端子として描いた。数・位置は外形図と未照合。' },
    lug: { name: '吊耳', role: '運搬・吊り上げに使う専用の金具。端子やケースを持って吊らない。', links: ['can'], ev: 'doc', note: '専用の吊耳を使う（カタログ p.23〜24）。位置は模式。' },
    gnd: { name: '接地端子', role: 'ケースを接地する端子。', links: ['can'], ev: 'simp', note: '位置は模式。' },
    press: { name: '内圧式保護用接点（保護箱）', role: '内部故障でケースの内圧が上がると動く接点。警報用ではなく、遮断器の引外し回路につなぐ。', links: ['can'], ev: 'doc', note: 'カタログ p.23（接点容量 AC220V/DC110V 5A）。箱の位置・形は模式。' },
    oil: { name: '絶縁油', role: '素子のすき間を満たして絶縁する。', links: ['can', 'elem'], ev: 'doc', note: 'OF式（カタログ p.2）。油の種類は未確認。' },
    elem: { name: '内部素子（金属蒸着フィルム）', role: 'フィルムに金属を蒸着した電極を巻いた素子。小さな絶縁破壊なら、まわりの蒸着膜が蒸発して絶縁が戻る（自己回復）。', links: ['plate', 'lead', 'res'], ev: 'doc', note: '金属蒸着フィルム・自己回復（カタログ p.7・p.23）。素子の数・形・つなぎ方は資料で確かめられず模式。' },
    plate: { name: '支持板', role: '素子を並べて支える板。', links: ['elem'], ev: 'simp', note: '部品名はカタログ p.23 の図。形・位置は模式。' },
    lead: { name: '絶縁紙チューブ付リード線', role: '素子と端子をつなぐリード線。絶縁紙のチューブで覆っている。', links: ['bush', 'guard', 'elem'], ev: 'simp', note: '部品名はカタログ p.23 の図。経路は模式。' },
    guard: { name: '保安装置（可断片）', role: '内部故障でケースがふくらむと、その変形の力で電流路（可断片）を切り、事故の拡大を防ぐ。', links: ['lead', 'can'], ev: 'doc', note: '方式はカタログ p.23。可断片の形・位置は模式。' },
    res: { name: '放電抵抗（内蔵）', role: '電源から切り離したあと、たまった電荷を逃がす抵抗。開放5分後に50V以下。端子と端子のあいだに入っているので、直流で見ると3つの端子がつながっている。だから絶縁抵抗はU端子1か所に当てるだけで3相ぶん測れる。', links: ['elem', 'bush'], ev: 'simp', note: '内蔵・5分後50V以下はカタログ p.3。端子のあいだにΔで入れた形は一般的なつなぎ方として描いた（この形式の内部接続図は未確認）。位置・形は模式。' },
    meg: { name: '絶縁抵抗計（メガ）', role: '直流の電圧をかけて、端子とケース（接地）のあいだに流れるわずかな漏れ電流から絶縁抵抗を出す。L を U 端子、E を接地端子へ。', links: ['bush', 'gnd'], ev: 'simp', note: '場面の説明用。測定電圧・判定値は社内基準に従う。' }
  };
  function build(G, st, mode) {
    var bulge = st.bulge || 0;
    /* 容器胴（ふくらみは面の外への張り出しで表す） */
    G.box(W + bulge * 0.3, H, D + bulge * 0.5, 0, Y0 + H / 2, 0, STEEL, { part: 'can', shell: true, shellAlpha: 0.15 });
    G.box(W + 0.1, 0.1, D + 0.1, 0, Y0 + H + 0.05, 0, 0x7a8288, { part: 'can' });
    G.box(W + 0.4, 0.15, D + 0.4, 0, Y0 - 0.07, 0, 0x5f666b, { part: 'can' });
    /* 吊耳・接地・保護箱 */
    [-1, 1].forEach(function (s) { G.box(0.1, 0.5, 0.5, s * (W / 2 + 0.12), Y0 + H - 0.3, 0, 0x6f777c, { part: 'lug' }); G.cyl(0.12, 0.12, s * (W / 2 + 0.12), Y0 + H - 0.2, 0, 0x2c2c2a, 'x', { part: 'lug' }, { seg: 10 }); });
    G.cyl(0.07, 0.2, W / 2 + 0.1, Y0 + 0.3, 0.6, 0xb8b8b4, 'x', { part: 'gnd' }, { seg: 10 });
    G.box(1.0, 0.6, 0.5, 1.2, Y0 + H + 0.4, -0.75, 0x55595e, { part: 'press' });
    G.box(0.12, 0.12, 0.05, 1.2, Y0 + H + 0.45, -0.48, st.press ? 0xc0392b : 0x2f8a4e, { part: 'press' });
    /* 端子 */
    BX.forEach(function (x) {
      G.cyl(0.2, 1.0, x, Y0 + H + 0.6, 0.25, POR, 'y', { part: 'bush' }, { seg: 14 });
      for (var i = 0; i < 2; i++) G.cyl(0.3, 0.06, x, Y0 + H + 0.45 + i * 0.35, 0.25, POR, 'y', { part: 'bush' }, { seg: 16 });
      G.cyl(0.06, 0.35, x, Y0 + H + 1.25, 0.25, 0xb8b8b4, 'y', { part: 'bush', cond: 'v' }, { seg: 10 });
    });
    /* ---- 中（模式） ---- */
    G.box(W - 0.2, H - 0.3, D - 0.2, 0, Y0 + H / 2, 0, 0xd9a93a, { part: 'oil', layer: 'int', alpha: 0.12, nopick: true });
    /* 支持板と素子（平たく巻いた素子を積み重ね） */
    [-1.0, 1.0].forEach(function (x) { G.box(0.08, H - 1.2, D - 0.5, x * 1.85, Y0 + (H - 0.4) / 2, 0, 0xd9c9a3, { part: 'plate', layer: 'int' }); });
    for (var r = 0; r < 8; r++) for (var c = 0; c < 3; c++) {
      var x = -1.2 + c * 1.2, y = Y0 + 0.5 + r * 0.48, hot = st.fault && r === 3 && c === 1;
      G.box(1.05, 0.38, D - 0.7, x, y, 0, hot ? 0xb83a2b : 0xb9c2c9, { part: 'elem', layer: 'int' });
      G.box(1.07, 0.06, D - 0.68, x, y + 0.16, 0, 0x8a9399, { part: 'elem', layer: 'int' });
    }
    /* 放電抵抗（3つの端子のあいだに入れた形で描いた） */
    var YR = Y0 + H - 0.2, ZR = 0.65;
    BX.forEach(function (x) { G.wire([[x, Y0 + H - 0.1, 0.25], [x, YR, ZR]], 0x2f6fa8, 1.6, { part: 'res', layer: 'int' }); });
    [[BX[0], BX[1], 0], [BX[1], BX[2], 0], [BX[0], BX[2], -0.45]].forEach(function (r) {
      var a = [r[0], YR + r[2], ZR], b = [r[1], YR + r[2], ZR];
      if (r[2]) { G.wire([[r[0], YR, ZR], a], 0x2f6fa8, 1.6, { part: 'res', layer: 'int' }); G.wire([[r[1], YR, ZR], b], 0x2f6fa8, 1.6, { part: 'res', layer: 'int' }); }
      G.cyl(0.07, Math.abs(r[1] - r[0]) * 0.55, (r[0] + r[1]) / 2, YR + r[2], ZR, 0x2f6fa8, 'x', { part: 'res', layer: 'int', cond: 'res' }, { seg: 10 });
      G.wire([a, b], 0x2f6fa8, 1.2, { part: 'res', layer: 'int' });
    });
    /* 保安装置（可断片） */
    var cut = st.guard ? 0.18 : 0;
    BX.forEach(function (x) {
      G.wire([[x, Y0 + H + 0.05, 0.25], [x, Y0 + H - 0.25, 0.25]], 0x8a6e4e, 2.2, { part: 'lead', layer: 'int', cond: 'v' });
      G.box(0.2, 0.12, 0.2, x, Y0 + H - 0.35, 0.25, 0xd9a227, { part: 'guard', layer: 'int' });
      G.box(0.2, 0.12, 0.2, x, Y0 + H - 0.5 - cut, 0.25, 0xd9a227, { part: 'guard', layer: 'int' });
      G.wire([[x, Y0 + H - 0.55 - cut, 0.25], [x, Y0 + H - 0.9, 0.3], [x * 0.9, Y0 + 0.5 + 7 * 0.48 + 0.25, 0.2]], 0x8a6e4e, 2.2, { part: 'lead', layer: 'int' });
    });
    if (st.spark) G.wire([[-0.3, Y0 + 0.5 + 3 * 0.48, D / 2 - 0.3], [0, Y0 + 0.62 + 3 * 0.48, D / 2 - 0.3], [0.25, Y0 + 0.45 + 3 * 0.48, D / 2 - 0.3]], 0xb38cff, 4, { part: 'elem', layer: 'int', nopick: true, zb: 0.4 });
    if (mode === 'ext') return;
    /* 絶縁抵抗計（メガ）：L を U 端子だけに、E を接地端子に */
    if (st.ir) {
      var MG = [-3.4, Y0 + H + 1.4, 0.25];
      G.box(1.0, 0.7, 0.6, MG[0], MG[1], MG[2], 0xf2e6c9, { part: 'meg' });
      G.wire([[MG[0] + 0.5, MG[1] + 0.2, MG[2]], [-2.2, Y0 + H + 2.0, 0.25], [BX[0], Y0 + H + 1.45, 0.25]], 0xd85a30, 3, { part: 'meg' });
      G.wire([[MG[0] - 0.2, MG[1] - 0.35, MG[2]], [-3.4, Y0 - 0.2, 0.6], [W / 2 + 0.25, Y0 - 0.2, 0.6], [W / 2 + 0.2, Y0 + 0.3, 0.6]], 0x3b6d11, 3, { part: 'meg' });
      if (st.irflow) {
        G.flow([[MG[0] + 0.5, MG[1] + 0.2, MG[2]], [-2.2, Y0 + H + 2.0, 0.25], [BX[0], Y0 + H + 1.45, 0.25], [BX[0], Y0 + H - 0.1, 0.25], [BX[0], YR, ZR], [BX[1], YR, ZR], [BX[1], Y0 + H - 0.1, 0.25], [BX[1], Y0 + H + 1.4, 0.25]], { speed: 0.35, n: 8, m: { part: 'res', layer: 'int' } });
        G.flow([[BX[1], YR, ZR], [BX[2], YR, ZR], [BX[2], Y0 + H - 0.1, 0.25], [BX[2], Y0 + H + 1.4, 0.25]], { speed: 0.35, n: 5, m: { part: 'res', layer: 'int' } });
        G.flow([[0, Y0 + 2.0, 0.3], [0, Y0 + 2.0, D / 2], [W / 2, Y0 + 0.4, 0.6], [W / 2 + 0.2, Y0 + 0.3, 0.6], [W / 2 + 0.25, Y0 - 0.2, 0.6], [-3.4, Y0 - 0.2, 0.6], [MG[0] - 0.2, MG[1] - 0.35, MG[2]]], { speed: 0.2, n: 5, col: 'bad', m: { part: 'can' } });
      }
    }
    /* 充電電流（往路：端子から素子へ。交流なので向きは半周期ごとに入れかわる） */
    if (st.on && !st.guard) BX.forEach(function (x) { G.flow([[x, Y0 + H + 1.6, 0.25], [x, Y0 + H + 0.05, 0.25], [x, Y0 + H - 0.9, 0.3], [x * 0.9, Y0 + 0.5 + 7 * 0.48 + 0.25, 0.2]], { speed: 0.5, m: { part: 'elem', layer: 'int' } }); });
    if (st.dis) G.flow([[BX[0], Y0 + 3.6, 0.2], [BX[0], Y0 + H - 0.9, 0.3], [BX[0], YR, ZR], [BX[1], YR, ZR], [BX[2], YR, ZR], [BX[2], Y0 + H - 0.9, 0.3], [BX[2], Y0 + 3.6, 0.2]], { speed: 0.25, n: 6, m: { part: 'res', layer: 'int' } });
  }
  function tint(m, st, mode) {
    if (mode === 'ext') return null;
    if (st.ir && (m.cond === 'v' || m.cond === 'res')) return { c: [240, 153, 123], k: 0.55 };
    if (m.cond === 'v' && (st.on || st.charge)) return { c: [240, 153, 123], k: st.on ? 0.6 : 0.35 };
    if (m.part === 'elem' && st.charge && !st.on) return { c: [240, 153, 123], k: 0.25 };
    return null;
  }
  var labels = [
    { part: 'bush', t: '端子', p: [0, Y0 + H + 1.75, 0.25] },
    { part: 'can', t: '容器胴（完全密閉）', p: [-1.0, Y0 + 1.0, D / 2 + 0.3], layer: 'ext-only' },
    { part: 'lug', t: '吊耳', p: [-W / 2 - 0.5, Y0 + H - 0.2, 0] },
    { part: 'press', t: '内圧式保護用接点', p: [1.2, Y0 + H + 1.0, -0.75] },
    { part: 'gnd', t: '接地端子', p: [W / 2 + 0.5, Y0 + 0.2, 0.6], layer: 'ext-only' },
    { part: 'elem', t: '内部素子（模式）', p: [-1.2, Y0 + 1.6, D / 2 + 0.2], layer: 'int' },
    { part: 'guard', t: '保安装置（可断片）', p: [-1.3, Y0 + H - 0.4, 0.8], layer: 'int' },
    { part: 'res', t: '放電抵抗（端子のあいだ）', p: [0.65, Y0 + H - 0.95, 0.9], layer: 'int' },
    { part: 'meg', t: '絶縁抵抗計（L は U だけ）', p: [-3.4, Y0 + H + 2.1, 0.25], when: function (s) { return s.ir; } },
    { t: 'V・W も同じ電位', p: [2.7, Y0 + H + 0.9, 0.25], hot: true, when: function (s) { return s.irflow; } },
    { part: 'plate', t: '支持板', p: [-2.0, Y0 + 3.6, 0.6], layer: 'int' },
    { t: '自己回復', p: [0, Y0 + 2.2, D / 2 + 0.3], hot: true, layer: 'int', when: function (s) { return s.spark && !s.fault; } },
    { t: 'ケースがふくらむ', p: [0, Y0 + 0.6, D / 2 + 0.6], hot: true, layer: 'int', when: function (s) { return s.bulge > 0.3; } }
  ];
  var base = { on: false, charge: false, dis: false, spark: false, fault: false, bulge: 0, guard: false, press: false, ir: false, irflow: false };
  var scenarios = [
    { name: 'ふだん（充電電流）', steps: [
      { t: '電源につながっている', x: '交流なので、半周期ごとに充電と放電をくり返し、進み電流が流れる。端子 → 保安装置 → リード線 → 素子 の向きに描いているが、向きは半周期ごとに入れかわる。', s: 'ok', st: { on: true, charge: true, dis: false } }
    ] },
    { name: '切り離したあと（放電抵抗）', steps: [
      { t: '開閉器で電源から切り離す', x: '素子には電荷が残り、端子に電圧が残っている（うすいオレンジ）。', s: 'warn', st: { on: false, charge: true, dis: false }, hz: '切ってすぐは端子に電圧が残っている。触れない。' },
      { t: '放電抵抗が電荷を逃がす', x: '内蔵の放電抵抗を通って、電荷がゆっくり減る。カタログでは開放5分後に50V以下。', s: 'warn', st: { dis: true } },
      { t: '5分たって放電が進んだ', x: '端子電圧は50V以下まで下がる。それでも作業の前は検電し、接地して残りの電荷を抜く。', s: 'ok', st: { charge: false, dis: false }, hz: '放電抵抗付きは、再投入まで5分以上あける（カタログ p.24）。電荷が残ったまま投入すると過大な突入電流になる。' }
    ] },
    { name: '絶縁抵抗測定（1端子で3相）', steps: [
      { t: '測定の準備', x: '停電して検電し、端子を接地して残っている電荷を抜く。端子につながる電線（直列リアクトル側）を外して、コンデンサだけにする。', s: 'ok', st: { on: false, charge: false, dis: false, ir: false, irflow: false, spark: false, fault: false, bulge: 0, guard: false, press: false } },
      { t: 'L を U 端子1か所、E を接地端子へ', x: '絶縁抵抗計の L を U 端子だけに当て、E をケースの接地端子につなぐ。', s: 'ok', st: { ir: true } },
      { t: '直流をかけると、V・W 端子も同じ電位になる', x: '素子は直流を通さないが、放電抵抗は直流を通す。端子のあいだの放電抵抗を通って、V・W 端子も U と同じ電位になる（3つともオレンジ）。だから U 1か所で、3相ぶんの端子・リード・素子とケースのあいだの絶縁を、まとめて測っている。赤い粒は、絶縁物を通ってケース → E へ戻るわずかな漏れ電流。', s: 'ok', st: { irflow: true } },
      { t: '指示が落ち着くまで待つ', x: 'はじめは素子を直流で充電する電流が流れるので、指示が低く出て、だんだん上がっていく。落ち着いてから読む。', s: 'warn', st: {} },
      { t: '測ったあとは放電してから外す', x: '素子は絶縁抵抗計の直流で充電されている。リードを外す前に、端子を接地して放電する。', s: 'warn', st: { irflow: false, ir: false, charge: true }, hz: '測定後のコンデンサには直流の電荷が残る。放電せずに触れると感電のおそれ。' }
    ] },
    { name: '内部で故障したとき', steps: [
      { t: '小さな絶縁破壊：自己回復', x: '素子の中で小さな絶縁破壊が起きると、まわりの蒸着膜が蒸発して離れ、絶縁が戻る（金属蒸着フィルムの自己回復）。', s: 'warn', st: { on: true, charge: true, spark: true, fault: false } },
      { t: '大きな故障：ガスでケースがふくらむ', x: '自己回復しきれない故障では、ガスが出てケースの内圧が上がり、容器胴がふくらむ。', s: 'ng', st: { spark: false, fault: true, bulge: 1 } },
      { t: '保安装置が電流路を切り、保護用接点が動く', x: 'ケースの変形の力で可断片が切れ、電流路が切れる。内圧式保護用接点が動作して、遮断器を引き外す。', s: 'ng', st: { guard: true, press: true, on: false }, hz: '保護用接点は警報ではなく遮断器の引外し回路につなぐ。動作したら、そのコンデンサを切り離してから再投入する（カタログ p.23）。ふくらみは点検で確認する。' }
    ] }
  ];
  function stateList(st) { return [['電源', st.on ? '接続' : '切り離し', false], ['端子の電荷', st.charge ? '残っている' : '放電した', st.charge && !st.on], ['ケース', st.bulge > 0.3 ? 'ふくらみ' : '正常', st.bulge > 0.3], ['保安装置', st.guard ? '電流路を切断' : '通電', !!st.guard], ['保護用接点', st.press ? '動作' : '復帰', !!st.press], ['絶縁抵抗計', st.ir ? 'U 端子に接続（V・W も同電位）' : 'なし', false]]; }
  function svgUpdate(svg, st) {
    var g = svg.querySelector('#sc-guard'); if (g) g.style.display = st.guard ? '' : 'none';
    var d = svg.querySelector('#sc-dis'); if (d) d.style.display = st.dis ? '' : 'none';
    var m = svg.querySelector('#sc-ir'); if (m) m.style.display = st.ir ? '' : 'none';
    var f = svg.querySelector('#sc-irflow'); if (f) f.style.display = st.irflow ? '' : 'none';
  }
  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.sc = {
    title: '高圧進相コンデンサ', parts: parts, partOrder: ['bush', 'can', 'lug', 'press', 'gnd', 'oil', 'elem', 'plate', 'lead', 'guard', 'res', 'meg'],
    initial: base, build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#scWire', svgUpdate: svgUpdate,
    view: { yaw: -0.55, pitch: 0.25 },
    modeView: { op: { zoom: 0.82, target: [-0.6, 3.3, 0.2] } },
    views: { front: { label: '正面', yaw: 0, pitch: 0.08 }, side: { label: '横', yaw: -1.57, pitch: 0.08 }, top: { label: '上', yaw: -0.2, pitch: 1.25 } },
    banner: { ext: ['参考：日新電機 PET-FK4N（OF式・6%用）', '!外形・端子の数と位置は外形図と未照合'], int: ['!中は模式：素子の数・並びは資料になく推定'], op: ['!電流の向き・大きさは模式'], wire: [] }
  };
})();
