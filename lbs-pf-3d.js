/* PF付き高圧交流負荷開閉器（参考：三菱電機 SCL-EHS2R 屋内用・フック棒操作・ストライカ引外し付）
   資料で確かめたこと：樹脂製アークシュートの消弧、主コンタクトと速切り補助ブレードの2段構成、
   負荷側のストライカ引外し機構、1相溶断で3相開放、補助スイッチ2a2b、絶縁バリヤ、ハンドル約90°操作。
   部品の上下配置・寸法比は外形図の画像と照合できていない（ページに明記）。 */
(function () {
  'use strict';
  var PX = { U: -0.56, V: 0, W: 0.56 }, PH = ['U', 'V', 'W'];
  var YT = 1.62, YH = 0.98, ZH = 0.16;         /* 固定接触部の高さ、ヒンジ（主軸）の高さと奥行 */
  var BL = YT - YH;                             /* ブレードの長さ */
  var FT = 0.86, FB = 0.32, ZF = 0.16;          /* ヒューズの上端・下端・奥行 */
  var CU = 0xc9874a, SILV = 0xc9cacc, RES = 0x7a4a2c, INS = 0xd9d3c6, STEEL = 0x8c939a;
  function rotX(h, ang, x) { return [x, YH + h * Math.cos(ang), ZH + h * Math.sin(ang)]; }
  var DEG = Math.PI / 180;

  var parts = {
    src: { name: '電源側端子', role: '受電側（電源側）の電線をつなぐ端子。開閉器が「切」でも、ここから上は電源につながっていて充電されている。', links: ['fixed', 'arc'], ev: 'simp', note: '上下どちらが電源側かは取付けで決まる。この図では上を電源側にしている。外形図とは未照合。' },
    arc: { name: 'アークシュート（樹脂製）', role: '開くときに出るアークを囲む部品。アークの熱で樹脂から水素・一酸化炭素のガスが出て、アークを冷やし消イオン化して消す。', links: ['fixed', 'aux'], ev: 'doc', note: '消弧方式はカタログ p.24付近の記述。形・大きさは簡略化。' },
    fixed: { name: '固定接触部', role: 'ブレードが入る受け側。入のときは主ブレードがここで電流を流す。', links: ['src', 'blade', 'aux'], ev: 'simp', note: '主コンタクトと補助ブレードの2段構成はカタログ記載。形は簡略化。' },
    blade: { name: '主ブレード（主コンタクト）', role: 'ふだん電流を流す可動ブレード。「切」では、まず主ブレードが開き、電流は補助ブレードへ移る（転流）。', links: ['fixed', 'shaft', 'fuse'], ev: 'simp', note: '2段構成と開く順番はカタログ p.24付近。ブレードの形は簡略化。' },
    aux: { name: '速切り補助ブレード', role: '主ブレードより後に、ひねりばねの力で一気に開く補助のブレード。アークはここで出て、アークシュートの中で消える。', links: ['fixed', 'arc', 'blade'], ev: 'doc', note: 'ひねりばねで加速する速切り補助ブレード（カタログ p.24付近）。形・取付位置は簡略化。' },
    ins: { name: '支持がいし', role: '充電部を取付枠から絶縁して支える。', links: ['frame', 'src', 'shaft'], ev: 'unk', note: '材質・形状・本数は未確認。' },
    shaft: { name: '主軸（3相連動）', role: '3相の主ブレードを同じ角度で回す軸。操作機構とつながり、3相を同時に開閉する。', links: ['blade', 'mech', 'trip'], ev: 'simp', note: '3相同時に開閉することは資料どおり。軸の位置は簡略化。' },
    fuse: { name: '限流ヒューズ（ストライカ付）', role: '短絡電流を、ピークに達する前に限流して遮断する。溶断すると下側のストライカが飛び出し、開閉器を引き外す。', links: ['blade', 'element', 'striker', 'load'], ev: 'doc', note: '三菱 CL形（ストライカ付 LB・LD）。φ50×260・φ60×310・φ77×310 の外形がある（開閉器カタログ）。図の大きさは比率を合わせた簡略化。' },
    element: { name: 'ヒューズエレメント', role: '電流で溶ける金属の帯。大電流定格はV字の刻みを入れた帯をジグザグに折って、けい砂の中に張り渡している。', links: ['fuse', 'sand'], ev: 'doc', note: 'ヒューズカタログ p.5（CL形の内部構造）。材質の記載はなく未確認。' },
    sand: { name: 'けい砂（消弧材）', role: 'エレメントのまわりを満たす砂。溶けた金属とアークの熱を吸い、アークを細かく分けて消す。', links: ['element', 'fuse'], ev: 'doc', note: 'ヒューズカタログ p.5。中央部のエレメントを端部より深く埋めている。' },
    striker: { name: 'ストライカ', role: 'ヒューズが溶断すると、表示線が溶けて内蔵ばねで突き出る棒。下キャップから出て、負荷側の引外し機構を押す。', links: ['fuse', 'trip'], ev: 'doc', note: '下キャップの動作表示装置を強力にしたもの（ヒューズカタログ p.5〜6）。力・ストロークは未確認。' },
    trip: { name: 'ストライカ引外し機構', role: 'どれか1相のストライカが押すと、3相の開閉器をまとめて引き外す。1相だけ切れて欠相になるのを防ぐ。', links: ['striker', 'mech', 'shaft'], ev: 'doc', note: '負荷側に設けられている（カタログ p.22〜24付近）。棒やレバーの形は未確認で簡略化。' },
    load: { name: '負荷側端子', role: '変圧器やコンデンサへの電線をつなぐ端子。ヒューズの下側とつながる。', links: ['fuse'], ev: 'simp', note: '配置は簡略化。' },
    mech: { name: '操作機構', role: 'フック棒でハンドルを約90°回して入・切する。ばねの力で一気に開閉する。ストライカ引外し機構からの引外しも受ける。', links: ['handle', 'shaft', 'trip', 'auxsw'], ev: 'doc', note: '操作方法はカタログ p.32付近。中の構造は未確認で、箱だけで表している。' },
    handle: { name: '操作ハンドル（フック棒操作）', role: 'フック棒を掛けて回すところ。一気にストッパーまで回す。', links: ['mech'], ev: 'doc', note: 'ハンドル方向は右・左を選べる（形名末尾 R／L）。この図は右（R）。' },
    auxsw: { name: '補助スイッチ（2a2b）', role: '開閉器の入・切に連動する接点。表示灯や引外し回路などに使う。', links: ['mech'], ev: 'doc', note: '標準2a2b（カタログ p.18付近）。取付位置は未確認。' },
    barrier: { name: '絶縁バリヤ', role: '相と相、相と側面のあいだを仕切る板。ワンタッチで取付けられる。', links: ['frame'], ev: 'doc', note: '相間・側面とも同一品（カタログ p.22付近）。形・大きさは簡略化。' },
    frame: { name: '取付枠', role: '盤に取付ける鋼製の枠。接地する。', links: ['ins', 'barrier'], ev: 'simp', note: '取付ピッチ 390・335 などの数値はあるが、外形図との照合はできていない。' }
  };

  function build(G, st, mode) {
    var ang = (st.main || 0) * 68 * DEG, angA = (st.aux || 0) * 68 * DEG;
    /* 取付枠（背面） */
    G.box(2.2, 0.08, 0.1, 0.12, 1.92, -0.32, STEEL, { part: 'frame' });
    G.box(2.2, 0.08, 0.1, 0.12, 0.05, -0.32, STEEL, { part: 'frame' });
    G.box(0.08, 1.95, 0.1, -1.0, 0.98, -0.32, STEEL, { part: 'frame' });
    G.box(0.08, 1.95, 0.1, 1.24, 0.98, -0.32, STEEL, { part: 'frame' });
    /* 絶縁バリヤ（相間） */
    [-0.28, 0.28].forEach(function (x) { G.box(0.02, 1.7, 0.55, x, 1.0, -0.02, 0xb8c4cc, { part: 'barrier', alpha: 0.45, shell: true, shellAlpha: 0.1 }); });
    PH.forEach(function (ph) {
      var x = PX[ph], fault = st.fault && ph === 'V';
      /* 支持がいし（上・ヒンジ・下） */
      G.cyl(0.07, 0.4, x, YT + 0.08, -0.08, INS, 'z', { part: 'ins' }, { seg: 14 });
      G.cyl(0.07, 0.36, x, YH, -0.1, INS, 'z', { part: 'ins' }, { seg: 14 });
      G.cyl(0.07, 0.36, x, FB - 0.12, -0.1, INS, 'z', { part: 'ins' }, { seg: 14 });
      /* 電源側端子 */
      G.box(0.1, 0.32, 0.04, x, YT + 0.32, ZH, CU, { part: 'src', cond: 'src', ph: ph });
      G.cyl(0.03, 0.06, x, YT + 0.4, ZH + 0.03, SILV, 'z', { part: 'src' }, { seg: 10 });
      /* 固定接触部とアークシュート */
      G.box(0.16, 0.08, 0.12, x, YT + 0.08, ZH, CU, { part: 'fixed', cond: 'src', ph: ph });
      G.box(0.26, 0.26, 0.24, x + 0.02, YT + 0.04, ZH + 0.02, RES, { part: 'arc', shell: true, shellAlpha: 0.22 });
      /* 主ブレード（2枚） */
      [-0.035, 0.035].forEach(function (dx) {
        G.rod(rotX(0, ang, x + dx), rotX(BL, ang, x + dx), 0.018, CU, { part: 'blade', cond: 'mid', ph: ph }, 4);
      });
      /* 速切り補助ブレード */
      G.rod(rotX(0.12, angA, x + 0.075), rotX(BL + 0.02, angA, x + 0.075), 0.011, 0xb07a3a, { part: 'aux', cond: 'mid', ph: ph }, 4);
      G.helix([x + 0.075, YH + 0.06, ZH], 'x', 0.025, 0.05, 4, 0x6b7075, 1.6, { part: 'aux' });
      /* アーク（開く途中だけ） */
      if (st.arc > 0.02) {
        var tip = rotX(BL + 0.02, angA, x + 0.075), fx = [x + 0.06, YT + 0.04, ZH + 0.02], wig = [];
        for (var i = 0; i <= 8; i++) { var t = i / 8; wig.push([fx[0] + (tip[0] - fx[0]) * t + Math.sin(i * 2.3) * 0.015, fx[1] + (tip[1] - fx[1]) * t, fx[2] + (tip[2] - fx[2]) * t + Math.cos(i * 1.7) * 0.015]); }
        G.wire(wig, 0xb38cff, 3 + 3 * st.arc, { part: 'arc', layer: 'int', nopick: true, zb: 0.2 }, false);
      }
      /* ヒンジ部とヒューズ上の接続 */
      G.box(0.14, 0.1, 0.12, x, YH, ZH, CU, { part: 'blade', cond: 'mid', ph: ph });
      G.box(0.06, YH - FT - 0.03, 0.04, x, (YH + FT) / 2, ZF, CU, { part: 'fuse', cond: 'mid', ph: ph });
      /* 限流ヒューズ：キャップ・筒・中身 */
      var fl = FT - FB, fc = (FT + FB) / 2, blown = st.blown && ph === 'V';
      G.cyl(0.07, 0.07, x, FT - 0.035, ZF, SILV, 'y', { part: 'fuse', cond: 'mid', ph: ph }, { seg: 16 });
      G.cyl(0.07, 0.07, x, FB + 0.035, ZF, SILV, 'y', { part: 'fuse', cond: blown ? 'off' : 'load', ph: ph }, { seg: 16 });
      G.cyl(0.062, fl - 0.14, x, fc, ZF, 0xe8e4da, 'y', { part: 'fuse', shell: true, shellAlpha: 0.18 }, { seg: 18 });
      /* 中身：けい砂とエレメント（内部表示） */
      G.cyl(0.05, fl - 0.16, x, fc, ZF, 0xe9d9a8, 'y', { part: 'sand', layer: 'int', alpha: 0.35 }, { seg: 14 });
      var zig = [], n = 14;
      for (var k = 0; k <= n; k++) { var yy = FT - 0.08 - (fl - 0.16) * k / n; zig.push([x + (k % 2 ? 0.028 : -0.028), yy, ZF]); }
      if (blown) {
        G.wire(zig.slice(0, 5), 0xd9d4c7, 2.4, { part: 'element', layer: 'int', zb: 0.15 }, false);
        G.wire(zig.slice(10), 0xd9d4c7, 2.4, { part: 'element', layer: 'int', zb: 0.15 }, false);
        if (st.farc > 0.02) G.wire(zig.slice(4, 11), 0xb38cff, 2 + 3 * st.farc, { part: 'element', layer: 'int', nopick: true, zb: 0.2 }, false);
      } else G.wire(zig, 0xd9d4c7, 2.4, { part: 'element', layer: 'int', zb: 0.15 }, false);
      /* ストライカ（下キャップから下へ） */
      var sOut = ph === 'V' ? (st.striker || 0) : 0;
      G.rod([x, FB, ZF], [x, FB - 0.02 - 0.09 * sOut, ZF], 0.016, 0xd9a227, { part: 'striker' }, 6);
      /* 負荷側端子 */
      G.box(0.06, 0.12, 0.04, x, FB - 0.06, ZF, CU, { part: 'load', cond: blown ? 'off' : 'load', ph: ph });
      G.box(0.1, 0.3, 0.04, x, FB - 0.27, ZF + 0.06, CU, { part: 'load', cond: blown ? 'off' : 'load', ph: ph });
      G.cyl(0.03, 0.06, x, FB - 0.36, ZF + 0.09, SILV, 'z', { part: 'load' }, { seg: 10 });
      /* 電流（往路：電源側 → 負荷側。帰路は負荷とほかの相・電源を通るので、この機器の外） */
      if (mode !== 'ext' && st.cur && !(st.main > 0.5 && st.aux > 0.5)) {
        var pathTop = [[x, YT + 0.42, ZH + 0.05], [x, YT + 0.08, ZH + 0.05]];
        var via = st.main > 0.5 ? [rotX(BL, angA, x + 0.075), rotX(0.12, angA, x + 0.075)] : [rotX(BL, ang, x), rotX(0.05, ang, x)];
        var rest = [[x, YH - 0.05, ZF], [x, FT, ZF], [x, FB, ZF], [x, FB - 0.36, ZF + 0.08]];
        if (!(st.blown && ph === 'V' && !st.farc)) G.flow(pathTop.concat(via, rest), { col: fault ? 'bad' : 'cur', speed: fault ? 1.2 : 0.45, m: { part: 'fuse', layer: 'int' } });
      }
    });
    /* 主軸（3相連動） */
    G.cyl(0.03, 1.75, 0.08, YH, ZH, 0x9a9a96, 'x', { part: 'shaft' }, { seg: 10 });
    /* ストライカ引外し機構：横棒とリンク（形は簡略化） */
    var tb = (st.trip || 0) * 0.05;
    G.box(1.62, 0.03, 0.03, 0.08, FB - 0.16 - tb, ZF + 0.02, 0x7a7a76, { part: 'trip' });
    G.rod([0.95, FB - 0.16 - tb, ZF + 0.02], [1.05, YH - 0.1, ZH], 0.016, 0x7a7a76, { part: 'trip' });
    /* 操作機構・ハンドル（右） */
    G.box(0.3, 0.6, 0.36, 1.08, YH, 0.0, 0x5f6266, { part: 'mech', shell: true, shellAlpha: 0.25 });
    var ha = (st.main || 0) * 90 * DEG;
    G.cyl(0.1, 0.04, 1.08, YH, 0.21, 0x2c2c2a, 'z', { part: 'handle' }, { seg: 18 });
    G.rod([1.08, YH, 0.24], [1.08 + 0.09 * Math.cos(ha + Math.PI / 2), YH + 0.09 * Math.sin(ha + Math.PI / 2), 0.24], 0.02, 0xd9a227, { part: 'handle' });
    G.box(0.14, 0.06, 0.03, 1.08, YH + 0.24, 0.19, st.main > 0.5 ? 0x2f8a4e : 0xc0392b, { part: 'handle' });
    /* 補助スイッチ */
    G.box(0.2, 0.16, 0.14, 1.08, YH - 0.42, 0.0, 0x3f4a55, { part: 'auxsw' });
  }

  function tint(m, st, mode) {
    if (mode === 'ext' || !m.cond || !st.live) return null;
    var c = [240, 153, 123];
    if (m.cond === 'src') return { c: c, k: 0.65 };
    var closed = !(st.main > 0.5 && st.aux > 0.5);
    if (m.cond === 'mid') return closed ? { c: c, k: 0.65 } : null;
    if (m.cond === 'load') return closed ? { c: c, k: 0.65 } : null;
    return null;
  }

  var labels = [
    { part: 'src', t: '電源側', p: [-0.56, YT + 0.5, ZH], hot: false },
    { part: 'arc', t: 'アークシュート', p: [0.56, YT + 0.24, ZH + 0.12] },
    { part: 'blade', t: '主ブレード', p: [-0.56, (YT + YH) / 2, ZH + 0.06], layer: 'ext' },
    { part: 'aux', t: '速切り補助ブレード', p: [0.62, (YT + YH) / 2 + 0.1, ZH + 0.06], layer: 'int' },
    { part: 'fuse', t: '限流ヒューズ', p: [-0.56, (FT + FB) / 2, ZF + 0.08] },
    { part: 'element', t: 'エレメント', p: [0.0, (FT + FB) / 2, ZF + 0.08], layer: 'int' },
    { part: 'sand', t: 'けい砂', p: [0.56, (FT + FB) / 2 - 0.1, ZF + 0.08], layer: 'int' },
    { part: 'striker', t: 'ストライカ', p: [0.0, FB - 0.08, ZF + 0.1] },
    { part: 'trip', t: '引外し機構', p: [0.5, FB - 0.2, ZF + 0.06] },
    { part: 'load', t: '負荷側', p: [-0.56, FB - 0.42, ZF + 0.08] },
    { part: 'handle', t: '操作ハンドル', p: [1.08, YH + 0.36, 0.22] },
    { part: 'auxsw', t: '補助スイッチ', p: [1.08, YH - 0.55, 0.1] },
    { part: 'barrier', t: '絶縁バリヤ', p: [-0.28, 1.8, 0.2], layer: 'ext-only' },
    { part: 'shaft', t: '主軸', p: [-0.95, YH, ZH], layer: 'int' },
    { t: 'U', p: [-0.56, YT + 0.62, ZH] }, { t: 'V', p: [0, YT + 0.62, ZH] }, { t: 'W', p: [0.56, YT + 0.62, ZH] },
    { t: 'アーク', p: [0.1, YT - 0.1, ZH + 0.4], hot: true, layer: 'int', when: function (s) { return s.arc > 0.3; } },
    { t: 'V相：エレメント溶断', p: [0.1, (FT + FB) / 2 + 0.08, ZF + 0.12], hot: true, layer: 'int', when: function (s) { return s.blown; } }
  ];

  var scenarios = [
    { name: '切操作（負荷電流）', steps: [
      { t: '入：負荷電流が流れている', x: '電流は電源側端子 → 固定接触部 → 主ブレード → ヒューズ → 負荷側端子 と流れる。黄色い粒は往路（電源側から負荷側）だけを描いている。帰り道は負荷とほかの相・電源を通るので、この機器の外。', s: 'ok', st: { main: 0, aux: 0, cur: true, live: true, arc: 0 } },
      { t: 'ハンドルを「切」へ：主ブレードが先に開く', x: '主ブレードが固定接触部から離れても、補助ブレードがまだ閉じているので、電流は補助ブレードへ移る（転流）。主ブレードの接点にはアークがほとんど出ない。', s: 'warn', st: { main: 0.75, aux: 0, cur: true } },
      { t: '補助ブレードがばねで一気に開く', x: '補助ブレードが開き、ここでアークが出る。アークシュートの樹脂から出るガスでアークが冷やされ、消える。', s: 'warn', st: { main: 1, aux: 0.55, arc: 1 }, hz: '負荷電流の開閉の場面。短絡電流は負荷開閉器では切らず、限流ヒューズが切る。' },
      { t: '切：電流は止まり、電源側だけ充電されている', x: 'ブレードは開き、負荷側には電圧がかからない。電源側端子・固定接触部・アークシュートのまわりは充電されたまま。', s: 'ok', st: { main: 1, aux: 1, arc: 0, cur: false }, hz: '「切」でも電源側は充電部。点検は上位で停電・検電・接地してから。' }
    ] },
    { name: 'ヒューズ溶断（短絡）', steps: [
      { t: '入：ふだんの状態', x: '3相とも負荷電流が流れている。', s: 'ok', st: { main: 0, aux: 0, cur: true, live: true, fault: false, blown: false, striker: 0, trip: 0, farc: 0 } },
      { t: 'V相の負荷側で短絡。大きな電流が流れる', x: '赤い粒は短絡電流。V相の限流ヒューズに、ふだんよりはるかに大きい電流が流れる（ここでは1相の例。実際の短絡は2相・3相にまたがることも多い）。', s: 'ng', st: { fault: true } },
      { t: 'エレメントが溶け、けい砂の中でアークが消える（限流遮断）', x: 'エレメントの細い部分から溶け、けい砂の中でアークが出る。アークの抵抗で電流がピークに届く前に抑えられ、短い時間で切れる。', s: 'ng', st: { blown: true, farc: 1, fault: true } },
      { t: '表示線が溶け、ストライカが飛び出す', x: '下キャップの中の表示線が溶けて、内蔵ばねでストライカが突き出る。V相の電流はもう流れていない。', s: 'warn', st: { farc: 0, fault: false, striker: 1 } },
      { t: 'ストライカが引外し機構を押し、3相が同時に開く', x: '1相だけ切れたままだと欠相になる。そこで負荷開閉器を引き外し、U相・W相もまとめて開く。', s: 'warn', st: { trip: 1, main: 1, aux: 1, cur: false } },
      { t: '切：ヒューズの交換が必要', x: '限流ヒューズは一度溶断すると使えない。原因を調べ、取扱説明書に従って交換してから投入する。', s: 'ok', st: {}, hz: '溶断の原因（短絡・過負荷）を取り除かずに投入しない。交換は停電・検電・接地のあと。' }
    ] }
  ];

  function stateList(st) {
    var closed = !(st.main > 0.5 && st.aux > 0.5);
    return [
      ['主ブレード', st.main > 0.5 ? '開' : '閉', false],
      ['補助ブレード', st.aux > 0.5 ? '開' : '閉', false],
      ['V相ヒューズ', st.blown ? '溶断' : '健全', !!st.blown],
      ['ストライカ', st.striker > 0.5 ? '突出' : '収納', st.striker > 0.5],
      ['負荷側', closed && !st.blown ? '充電' : (closed ? 'U・Wだけ充電' : '無電圧'), false]
    ];
  }

  function svgUpdate(svg, st) {
    var open = st.main > 0.5 && st.aux > 0.5;
    ['U', 'V', 'W'].forEach(function (ph, i) {
      var sw = svg.querySelector('#lb-sw-' + ph), fx = 120 + i * 140;
      if (sw) sw.setAttribute('d', open ? 'M' + fx + ' 110 L' + (fx + 28) + ' 84' : 'M' + fx + ' 110 L' + fx + ' 80');
    });
    var f = svg.querySelector('#lb-fuse-V'); if (f) f.setAttribute('fill', st.blown ? '#fcebe8' : '#fff');
    var x = svg.querySelector('#lb-blowx'); if (x) x.style.display = st.blown ? '' : 'none';
    var s = svg.querySelector('#lb-strk'); if (s) s.style.display = st.striker > 0.5 ? '' : 'none';
  }

  window.HV_MODELS = window.HV_MODELS || {};
  window.HV_MODELS.lbs = {
    title: 'PF付き高圧交流負荷開閉器', parts: parts,
    partOrder: ['src', 'arc', 'fixed', 'blade', 'aux', 'shaft', 'fuse', 'element', 'sand', 'striker', 'trip', 'load', 'mech', 'handle', 'auxsw', 'barrier', 'ins', 'frame'],
    initial: { main: 0, aux: 0, cur: false, live: false, arc: 0, fault: false, blown: false, striker: 0, trip: 0, farc: 0 },
    build: build, tint: tint, labels: labels, scenarios: scenarios, stateList: stateList, svg: '#lbsWire', svgUpdate: svgUpdate,
    view: { yaw: -0.5, pitch: 0.12 },
    views: { front: { label: '正面', yaw: 0, pitch: 0.05 }, side: { label: '横', yaw: -1.5, pitch: 0.05 }, top: { label: '上', yaw: -0.2, pitch: 1.25 }, fuse: { label: 'ヒューズ', yaw: -0.4, pitch: 0.1, zoom: 2.2, target: [0, 0.55, 0.16] } },
    banner: { ext: ['参考：三菱電機 SCL-EHS2R', '!部品の上下配置・寸法比は外形図と未照合'], int: ['!内部：資料の記述をもとにした簡略図', 'ヒューズとアークシュートを透かしている'], op: ['!動きは模式・時間は実際より遅い'], wire: [] }
  };
})();
