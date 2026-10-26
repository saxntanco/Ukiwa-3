/* VT・LA内蔵PAS 3Dモデル（外部ライブラリなし・canvas 2Dで描画）
   結線 0: 3相一括（交流） / 1: U相だけ / 2: U・V短絡（W開放） / 3: 3相一括（直流）
   内部の配置は推定。接続関係と定格は公開資料による。 */
(function () {
  'use strict';
  var wrap = document.getElementById('pas3d');
  var cv = document.getElementById('pas3dCanvas');
  if (!wrap || !cv) return;
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) { document.getElementById('pas3dMsg').style.display = 'flex'; return; }
  var lblBox = document.getElementById('pas3dLabels');

  /* ---------- ベクトル ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }
  function mix(c, d, k) { return [c[0] + (d[0] - c[0]) * k, c[1] + (d[1] - c[1]) * k, c[2] + (d[2] - c[2]) * k]; }

  /* ---------- 形の部品 ---------- */
  var polys = [], lines = [], T = polys;
  function addPoly(pts, col, m, center, ds) {
    var n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (center) {
      var fc = [0, 0, 0];
      pts.forEach(function (p) { fc = add3(fc, p); });
      fc = mul(fc, 1 / pts.length);
      if (dot(n, sub(fc, center)) < 0) { pts = pts.slice().reverse(); n = mul(n, -1); }
    }
    T.push({ p: pts, n: n, c: hex(col), m: m, ds: !!ds });
  }
  function grid(o, u, v, col, m, center) {
    var nu = Math.max(1, Math.ceil(Math.hypot(u[0], u[1], u[2]) / 0.32));
    var nv = Math.max(1, Math.ceil(Math.hypot(v[0], v[1], v[2]) / 0.32));
    var du = mul(u, 1 / nu), dv = mul(v, 1 / nv);
    for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
      var c = add3(add3(o, mul(du, i)), mul(dv, j));
      addPoly([c, add3(c, du), add3(add3(c, du), dv), add3(c, dv)], col, m, center);
    }
  }
  function box(w, h, d, x, y, z, col, m) {
    var hw = w / 2, hh = h / 2, hd = d / 2, ctr = [x, y, z];
    grid([x + hw, y - hh, z + hd], [0, 0, -d], [0, h, 0], col, m, ctr);
    grid([x - hw, y - hh, z - hd], [0, 0, d], [0, h, 0], col, m, ctr);
    grid([x - hw, y + hh, z + hd], [w, 0, 0], [0, 0, -d], col, m, ctr);
    grid([x - hw, y - hh, z - hd], [w, 0, 0], [0, 0, d], col, m, ctr);
    grid([x - hw, y - hh, z + hd], [w, 0, 0], [0, h, 0], col, m, ctr);
    grid([x + hw, y - hh, z - hd], [-w, 0, 0], [0, h, 0], col, m, ctr);
  }
  function cyl(r, len, x, y, z, col, axis, m, opts) {
    opts = opts || {};
    var seg = opts.seg || 16, ctr = [x, y, z], hl = len / 2, r2 = opts.r2 === undefined ? r : opts.r2;
    function P(a, s, rr) {
      var c = rr * Math.cos(a), d = rr * Math.sin(a);
      if (axis === 'x') return [x + s, y + c, z + d];
      if (axis === 'z') return [x + c, y + d, z + s];
      return [x + c, y + s, z + d];
    }
    var top = [], bot = [];
    for (var k = 0; k < seg; k++) {
      var a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2;
      addPoly([P(a0, -hl, r), P(a1, -hl, r), P(a1, hl, r2), P(a0, hl, r2)], col, m, ctr, opts.open);
      top.push(P(a0, hl, r2)); bot.push(P(a0, -hl, r));
    }
    if (!opts.open) { addPoly(top, col, m, ctr); addPoly(bot, col, m, ctr); }
  }
  function curve(pts, n, closed) {
    var out = [], m = pts.length, seg = closed ? m : m - 1;
    for (var i = 0; i < seg; i++) {
      var p0 = pts[closed ? (i - 1 + m) % m : Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[closed ? (i + 2) % m : Math.min(i + 2, m - 1)];
      for (var s = 0; s < n; s++) {
        var t = s / n, t2 = t * t, t3 = t2 * t, q = [];
        for (var d = 0; d < 3; d++) q.push(0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3));
        out.push(q);
      }
    }
    out.push(closed ? out[0] : pts[m - 1]);
    return out;
  }
  function wire(pts, col, w, m) {
    var c = curve(pts, 8, false), rgb = hex(col);
    for (var i = 0; i < c.length - 1; i++) lines.push({ a: c[i], b: c[i + 1], c: rgb, w: w, m: m });
  }
  function M(part, extra) { var o = { part: part }; for (var k in extra) o[k] = extra[k]; return o; }

  /* ---------- PASの形 ---------- */
  var PH = { U: -0.35, V: 0, W: 0.35 };
  var PHS = ['U', 'V', 'W'];
  var YC = 0.6;           // 主回路の高さ
  var XP = 0.15;          // 可動接点の回転軸
  var CU = 0xc9874a, STEEL = 0x8c939a;

  /* 外箱（透かすと半透明） */
  box(2.8, 1.0, 1.2, 0, 0.5, 0, STEEL, M('tank', { shell: 1 }));
  box(2.9, 0.06, 1.3, 0, 1.03, 0, 0x7b8289, M('tank', { shell: 1 }));
  [-0.9, 0.9].forEach(function (x) { cyl(0.05, 0.16, x, 1.14, 0, 0x6b7075, 'y', M('tank')); cyl(0.09, 0.03, x, 1.23, 0, 0x6b7075, 'y', M('tank')); });
  box(0.5, 0.26, 0.02, 0.2, 0.55, 0.61, 0xededea, M('tank', { shell: 1 }));
  /* 接地端子 */
  cyl(0.04, 0.08, 1.15, 0.1, 0.64, 0xb8b8b4, 'z', M('tank'));
  /* ブッシング（電源側：-x、負荷側：+x） */
  PHS.forEach(function (ph) {
    var z = PH[ph];
    [[-1, 'bush_src'], [1, 'bush_load']].forEach(function (sd) {
      var s = sd[0];
      cyl(0.08, 0.36, s * 1.58, YC, z, 0x7e8b92, 'x', M(sd[1]), { seg: 14 });
      [1.48, 1.58, 1.68].forEach(function (xx) { cyl(0.125, 0.025, s * xx, YC, z, 0x6f7c84, 'x', M(sd[1]), { seg: 14 }); });
      cyl(0.03, 0.06, s * 1.79, YC, z, 0xb8b8b4, 'x', M(sd[1], { ph: ph, side: s < 0 ? 'src' : 'load' }), { seg: 8 });
    });
  });
  /* 操作ハンドルと入切表示（前面 +z） */
  box(0.32, 0.22, 0.05, -0.95, 0.35, 0.625, 0x5f6266, M('mech'));
  var handlePolys = [], indPolys = [];

  /* 内部：導体・接点・消弧室 */
  PHS.forEach(function (ph) {
    var z = PH[ph];
    box(0.86, 0.05, 0.06, -0.97, YC, z, CU, M('contact', { inner: 1, ph: ph, side: 'src' }));
    box(0.08, 0.2, 0.12, -0.5, YC, z, 0xb06f36, M('contact', { inner: 1, ph: ph, side: 'src' }));
    box(0.26, 0.24, 0.2, -0.47, YC + 0.24, z, 0x55595e, M('contact', { inner: 1 }));
    box(1.25, 0.05, 0.06, XP + 0.625, YC, z, CU, M('cond', { inner: 1, ph: ph, side: 'load' }));
    cyl(0.04, 0.1, XP, YC, z, 0xb06f36, 'z', M('contact', { inner: 1, ph: ph, side: 'load' }), { seg: 10 });
  });
  /* 操作軸と操作機構 */
  cyl(0.03, 1.0, XP, YC, 0, 0xd9d4c7, 'z', M('mech', { inner: 1 }), { seg: 10 });
  box(0.36, 0.34, 0.26, -0.95, 0.34, 0.38, 0x4d5257, M('mech', { inner: 1 }));
  cyl(0.06, 0.28, -0.95, 0.34, 0.14, 0x9a9a96, 'z', M('mech', { inner: 1 }), { seg: 10 });
  cyl(0.07, 0.12, -0.72, 0.42, 0.38, 0xb06f36, 'z', M('mech', { inner: 1 }), { seg: 10 });
  wire([[-0.8, 0.45, 0.38], [-0.35, 0.55, 0.45], [XP, YC, 0.5]], 0xd9d4c7, 3, M('mech', { inner: 1 }));
  /* ZCT：3相の導体をまとめて囲む枠 */
  var ZX = 0.65;
  box(0.12, 0.08, 1.04, ZX, YC + 0.18, 0, 0x3f4a55, M('zct', { inner: 1 }));
  box(0.12, 0.08, 1.04, ZX, YC - 0.18, 0, 0x3f4a55, M('zct', { inner: 1 }));
  box(0.12, 0.44, 0.08, ZX, YC, -0.56, 0x3f4a55, M('zct', { inner: 1 }));
  box(0.12, 0.44, 0.08, ZX, YC, 0.56, 0x3f4a55, M('zct', { inner: 1 }));
  /* VT：負荷側 U–V 間（相は推定） */
  var VX = 1.0;
  box(0.34, 0.26, 0.3, VX, 0.24, -0.18, 0x8a4b2e, M('vt', { inner: 1 }));
  wire([[VX - 0.06, YC, PH.U], [VX - 0.06, 0.48, PH.U + 0.02], [VX - 0.06, 0.37, -0.26]], 0xd85a30, 2.5, M('vt', { inner: 1, ph: 'U', side: 'load' }));
  wire([[VX - 0.06, YC, PH.V], [VX - 0.06, 0.48, PH.V - 0.02], [VX - 0.06, 0.37, -0.1]], 0xd85a30, 2.5, M('vt', { inner: 1, ph: 'V', side: 'load' }));
  wire([[VX + 0.1, 0.12, -0.3], [0.85, 0.1, -0.5], [0.8, 0.2, -0.6]], 0x378add, 2.5, M('ctrl', { inner: 1 }));
  /* LA：各相–大地（推定） */
  var LX = 1.3;
  PHS.forEach(function (ph) {
    var z = PH[ph];
    cyl(0.065, 0.3, LX, 0.32, z, 0x6d7f8c, 'y', M('la', { inner: 1 }), { seg: 12 });
    [0.22, 0.3, 0.38].forEach(function (yy) { cyl(0.085, 0.02, LX, yy, z, 0x5b6c78, 'y', M('la', { inner: 1 }), { seg: 12 }); });
    wire([[LX, YC, z], [LX, 0.53, z], [LX, 0.47, z]], CU, 2.5, M('la', { inner: 1, ph: ph, side: 'load' }));
    wire([[LX, 0.17, z], [LX, 0.12, z], [LX, 0.08, z]], 0x3b6d11, 2.5, M('la', { inner: 1 }));
  });
  box(0.06, 0.03, 0.86, LX, 0.07, 0, 0x3b6d11, M('la', { inner: 1 }));
  /* 外の電線：電源側（配電線へ）と負荷側（引込ケーブル） */
  PHS.forEach(function (ph) {
    var z = PH[ph];
    wire([[-1.79, YC, z], [-2.05, 0.75, z], [-2.3, 1.0, z * 1.2]], 0x2c2c2a, 3.5, M('bush_src', { ph: ph, side: 'src' }));
    wire([[1.79, YC, z], [2.05, 0.45, z], [2.15, -0.4, z], [2.15, -1.15, z]], 0x2c2c2a, 4, M('bush_load', { ph: ph, side: 'cable' }));
  });
  /* 制御線（背面 -z） */
  wire([[0.8, 0.2, -0.6], [0.7, -0.2, -0.85], [0.4, -0.9, -1.0], [0.0, -1.3, -1.05]], 0x2c2c2a, 4, M('ctrl'));
  /* 試験器と接地 */
  box(0.42, 0.26, 0.3, 1.55, -1.5, 1.0, 0xfdeee8, M('tester'));
  box(0.5, 0.04, 0.32, 0.75, -1.62, 1.0, 0x3b6d11, M('gnd'));
  wire([[1.15, 0.06, 0.66], [1.0, -0.6, 0.85], [0.85, -1.6, 1.0]], 0x3b6d11, 3, M('gnd'));
  wire([[1.36, -1.58, 1.0], [1.1, -1.62, 1.0], [0.95, -1.61, 1.0]], 0x3b6d11, 3, M('gnd'));
  /* 試験リード（結線ごと） */
  wire([[2.15, -1.18, PH.U], [2.18, -1.25, PH.V], [2.15, -1.18, PH.W]], 0xd85a30, 3.5, M('lead', { modes: [0, 3] }));
  wire([[2.15, -1.18, PH.U], [2.18, -1.24, -0.18], [2.15, -1.18, PH.V]], 0xd85a30, 3.5, M('lead', { modes: [2] }));
  wire([[1.7, -1.45, 1.0], [2.0, -1.38, 0.55], [2.17, -1.24, PH.V]], 0xd85a30, 4, M('lead', { modes: [0, 2, 3] }));
  wire([[1.7, -1.45, 1.0], [2.0, -1.38, 0.4], [2.15, -1.2, PH.U]], 0xd85a30, 4, M('lead', { modes: [1] }));

  /* 可動接点（入切で回転） */
  var blade = [], ang = 0, angTarget = 0;
  function buildDyn() {
    blade = []; T = blade;
    var th = ang * 1.05, c = Math.cos(-th), s = Math.sin(-th);
    PHS.forEach(function (ph) {
      var z = PH[ph], tmp = [];
      T = tmp; box(0.64, 0.045, 0.07, -0.31, 0, 0, CU, M('contact', { inner: 1, ph: ph, side: 'load', blade: 1 }));
      tmp.forEach(function (q) {
        q.p = q.p.map(function (v) { return [XP + v[0] * c - v[1] * s, YC + v[0] * s + v[1] * c, z + v[2]]; });
        q.n = [q.n[0] * c - q.n[1] * s, q.n[0] * s + q.n[1] * c, q.n[2]];
        blade.push(q);
      });
    });
    /* ハンドルの向きと入切表示 */
    handlePolys = []; T = handlePolys;
    var hc = Math.cos(ang * 0.9), hs = Math.sin(ang * 0.9), tmp2 = [];
    T = tmp2; box(0.36, 0.06, 0.05, 0.16, 0, 0, 0x2c2c2a, M('mech'));
    tmp2.forEach(function (q) {
      q.p = q.p.map(function (v) { return [-0.95 + v[0] * hc - v[1] * hs, 0.35 + v[0] * hs + v[1] * hc, 0.68 + v[2]]; });
      q.n = [q.n[0] * hc - q.n[1] * hs, q.n[0] * hs + q.n[1] * hc, q.n[2]];
      handlePolys.push(q);
    });
    indPolys = []; T = indPolys;
    box(0.14, 0.09, 0.02, -0.65, 0.5, 0.615, ang < 0.5 ? 0xc0392b : 0x2f8a4e, M('mech'));
    T = polys;
  }

  /* ---------- 電流の通り道 ---------- */
  var pathVT = curve([[2.15, -1.18, PH.U], [2.15, -0.4, PH.U], [2.05, 0.45, PH.U], [1.78, YC, PH.U], [VX - 0.06, YC, PH.U], [VX - 0.06, 0.45, PH.U + 0.02], [VX - 0.06, 0.3, -0.24], [VX - 0.06, 0.3, -0.12], [VX - 0.06, 0.45, PH.V - 0.02], [VX - 0.06, YC, PH.V], [1.78, YC, PH.V], [2.05, 0.45, PH.V], [2.15, -0.4, PH.V], [2.15, -1.1, PH.V]], 8, false);
  var pathLA = PHS.map(function (ph) { var z = PH[ph]; return curve([[LX, YC, z], [LX, 0.47, z], [LX, 0.3, z], [LX, 0.12, z], [LX, 0.07, z + (z ? 0 : 0.001)], [LX - 0.15, 0.07, 0.5], [1.15, 0.08, 0.62]], 8, false); });
  function at(path, t) { var f = t * (path.length - 1), i = Math.floor(f), r = f - i, a = path[i], b = path[Math.min(i + 1, path.length - 1)]; return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; }
  var dotsVT = [], dotsLA = [], i;
  for (i = 0; i < 18; i++) dotsVT.push(i / 18);
  for (i = 0; i < 6; i++) dotsLA.push(i / 6);

  /* ---------- 部品の説明 ---------- */
  var PARTS = {
    bush_src: { n: '電源側ブッシング（配電線側）', p: [-1.62, 0.82, 0.35], t: '電源側の3本。配電線から来る電線をつなぐ。PASを「切」にすると、負荷側からかけた試験電圧はここまで届かない。', s: 'ブッシングは取扱説明書の「各部の名称」に記載。本数・向き・形はモデル。' },
    bush_load: { n: '負荷側ブッシング（引込ケーブル側）', p: [1.62, 0.82, 0.35], t: '引込ケーブルへつながる3本。耐圧試験は、キュービクル側のケーブル端から試験電圧をかける。', s: '形・向きはモデル。' },
    contact: { n: '主接点・消弧室', p: [-0.47, 0.98, 0.35], t: '3相の接点を同時に開閉する。消弧媒体は気中（取扱説明書の表示「A」）。「入・切」を切り替えると、可動接点が回って開く。', s: '消弧媒体は公開資料。接点と消弧室の形・配置は推定。' },
    mech: { n: '操作機構・操作ハンドル', p: [-0.95, 0.62, 0.62], t: '外のハンドルで入・切する。SOG制御装置の信号でトリップコイルが働き、ばねの力で開く。過電流ロックは、大きな電流が流れているあいだは開かないようにする機能。', s: 'ハンドルは公開資料（各部の名称）。内部の形は推定。表示の色（入＝赤・切＝緑）もモデル上の表現。' },
    zct: { n: 'ZCT（零相変流器）', p: [ZX, 0.95, 0.5], t: '3相の導体をまとめて通し、地絡のときに出る零相電流を検出してSOG制御装置へ送る（Z1・Z2）。', s: '取扱説明書の接続図に記号がある。位置と形は推定。' },
    vt: { n: 'VT（制御電源用変圧器）', p: [VX, 0.48, -0.18], t: '負荷側に内蔵、6,600/105V・25VA。SOG制御装置の電源（P1・P2）。一相だけに試験電圧をかけると、この巻線を通ってほかの相へ電流が流れる。', s: '負荷側・定格は公開資料（戸上電機）。どの相の間かは戸上電機の資料に記載がなく、モデルは日本高圧電気の取説の例にならってU–V間にしている。' },
    la: { n: 'LA（避雷器）', p: [LX, 0.12, 0.5], t: '負荷側に内蔵、定格8.4kV・公称放電電流2,500A・ZnO素子ギャップレス。交流10,350Vの3相一括はできるが、AC12kV以上・DC17kV以上はかけられない（戸上電機）。', s: '定格は公開資料。各相と大地の間につないだ形と配置は推定。' },
    tank: { n: '外箱・接地端子', p: [1.15, 0.1, 0.7], t: '外箱は必ずA種接地。LA内蔵形は、接地しないと雷から守れない。開閉器の中で Z2 端子が外箱につながっている。', s: '公開資料（戸上電機の製品ページ・取扱説明書）。' },
    ctrl: { n: '制御線（SOG制御装置へ）', p: [0.55, -0.5, -0.95], t: '方向性は11心（Z1・Z2・Y1の3心シールド）。Vc 端子は緑色だが接地箇所ではなく、アースにつなぐとVTが焼損する。耐電圧試験のときの処置は取扱説明書に従う（日本高圧電気の例：全ての制御線を外し、端末を一括接地）。', s: '公開資料（戸上電機・日本高圧電気）。' }
  };
  var LABELS = [
    { t: '電源側（配電線へ）', p: [-2.3, 1.15, 0] },
    { t: '負荷側（引込ケーブル）', p: [2.3, -0.75, 0.6] },
    { t: '耐圧試験器', p: [1.55, -1.32, 1.0] },
    { t: '接地', p: [0.6, -1.76, 1.0] },
    { t: 'VT', p: [VX, 0.05, -0.18], x: 1 },
    { t: 'LA', p: [LX - 0.05, -0.05, 0.62], x: 1 },
    { t: 'ZCT', p: [ZX, 0.9, -0.56], x: 1 },
    { t: 'V相ケーブルの静電容量へ', p: [2.5, -0.2, 0], m: 1, hot: 1 },
    { t: 'W相は試験されない', p: [2.5, -0.2, 0.42], m: 2, hot: 1 },
    { t: 'LAに直流 → 壊れるおそれ', p: [LX, 0.0, -0.6], m: 3, hot: 1 }
  ];
  LABELS.forEach(function (o) { var e = document.createElement('div'); e.className = 'lb' + (o.hot ? ' hot' : ''); e.textContent = o.t; lblBox.appendChild(e); o.e = e; });

  var MODES = [
    ['ok', '3相一括（交流10,350V）：正しい結線', 'VTの両端（U・V）が同じ電位なので、VTの巻線に電流は流れない。LAには10,350Vがかかるが、戸上電機の制限（AC12kV以上は不可）の範囲内。'],
    ['ng', 'U相だけ：VTが焼損するおそれ', 'U相からVTの巻線を通って、V相とV相ケーブルの静電容量へ電流が流れる。VTに電圧と電流がかかる。メーカーは一相ごとの試験を禁止している。'],
    ['warn', 'U・V短絡（W開放）：W相が試験されていない', 'VTの両端は同じ電位なのでVTは守られるが、W相には試験電圧がかからない。3相をまとめて試験する。'],
    ['ng', '3相一括（直流20,700V）：LAが壊れるおそれ', 'LA内蔵形は直流耐電圧試験を行わない（日本高圧電気）。戸上電機もDC17kV以上は不可。LAの動作電圧を超え、ZnO素子に電流が流れて壊れるおそれ。']
  ];

  /* ---------- 状態 ---------- */
  var CTR = [-0.05, -0.3, 0.05];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { yaw: -0.3, pitch: 0.3, dist: 8, mode: 0, on: false, xray: true, auto: !reduce, dirty: true, t: 0, sel: null };
  ang = angTarget = 1; buildDyn();
  var W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    st.dirty = true;
  }
  var cy, sy, cp, sp;
  function tf(p) {
    var x = p[0] - CTR[0], y = p[1] - CTR[1], z = p[2] - CTR[2];
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  }
  function rot(n) { var x1 = n[0] * cy + n[2] * sy, z1 = -n[0] * sy + n[2] * cy; return [x1, n[1] * cp - z1 * sp, n[1] * sp + z1 * cp]; }
  function F() { return 8 * Math.min(W / 5.6, H / 3.4); }
  function proj(v) { var s = F() / (st.dist - v[2]); return [W / 2 + v[0] * s, H / 2 - v[1] * s, s]; }

  /* どの相にどれだけ試験電圧がかかっているか（1＝試験電圧、0.5＝VT経由、0＝なし） */
  function phaseV(ph) {
    var m = st.mode;
    if (m === 0 || m === 3) return 1;
    if (m === 1) return ph === 'U' ? 1 : ph === 'V' ? 0.5 : 0;
    return ph === 'W' ? 0 : 1;
  }
  function chargeOf(meta) {
    if (!meta.ph) return 0;
    var v = phaseV(meta.ph);
    if (meta.side === 'src') return st.on ? v : 0;
    return v;
  }
  var LIGHT = norm([0.35, 0.75, 0.6]);
  var HOTC = [216, 90, 48], MIDC = [239, 159, 39], SELC = [22, 160, 176], BADC = [226, 75, 74];
  function visible(m) {
    if (m.inner && !st.xray) return false;
    if (m.modes && m.modes.indexOf(st.mode) < 0) return false;
    return true;
  }
  function colorOf(c, m) {
    var k = chargeOf(m);
    if (k >= 1) c = mix(c, HOTC, 0.6); else if (k > 0) c = mix(c, MIDC, 0.55);
    if (st.mode === 3 && m.part === 'la' && !m.ph) c = mix(c, BADC, reduce ? 0.5 : 0.35 + 0.3 * Math.sin(st.t * 6));
    if (st.mode === 1 && m.part === 'vt' && !m.ph) c = mix(c, BADC, reduce ? 0.5 : 0.35 + 0.3 * Math.sin(st.t * 6));
    if (st.sel && m.part === st.sel) c = mix(c, SELC, 0.45);
    return c;
  }

  function draw() {
    cy = Math.cos(st.yaw); sy = Math.sin(st.yaw); cp = Math.cos(st.pitch); sp = Math.sin(st.pitch);
    ctx.clearRect(0, 0, W, H);
    var items = [], cam = [0, 0, st.dist];
    function pushPoly(q) {
      if (!visible(q.m)) return;
      var vs = q.p.map(tf), n = rot(q.n), fc = [0, 0, 0];
      vs.forEach(function (v) { fc = add3(fc, v); });
      fc = mul(fc, 1 / vs.length);
      if (dot(n, sub(cam, fc)) < 0) { if (!q.ds) return; n = mul(n, -1); }
      var a = q.m.shell && st.xray ? 0.12 : 1;
      var sh = 0.52 + 0.48 * Math.max(0, dot(n, LIGHT));
      var c = colorOf(q.c, q.m);
      items.push({ k: 'p', z: fc[2], s: vs.map(proj), col: 'rgba(' + Math.round(c[0] * sh) + ',' + Math.round(c[1] * sh) + ',' + Math.round(c[2] * sh) + ',' + a + ')', a: a });
    }
    polys.forEach(pushPoly); blade.forEach(pushPoly); handlePolys.forEach(pushPoly); indPolys.forEach(pushPoly);
    lines.forEach(function (l) {
      if (!visible(l.m)) return;
      var a = tf(l.a), b = tf(l.b), pa = proj(a);
      var c = colorOf(l.c, l.m);
      items.push({ k: 'l', z: (a[2] + b[2]) / 2 + 0.02, s: [pa, proj(b)], col: 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')', w: l.w * pa[2] / 80 });
    });
    if (st.mode === 1) dotsVT.forEach(function (t) { var v = tf(at(pathVT, t)); items.push({ k: 'd', z: v[2] + 0.05, s: [proj(v)] }); });
    if (st.mode === 3 && st.xray) pathLA.forEach(function (p) { dotsLA.forEach(function (t) { var v = tf(at(p, t)); items.push({ k: 'd', z: v[2] + 0.05, s: [proj(v)] }); }); });
    items.sort(function (p, q) { return p.z - q.z; });
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    items.forEach(function (it) {
      if (it.k === 'p') {
        ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]);
        for (var j = 1; j < it.s.length; j++) ctx.lineTo(it.s[j][0], it.s[j][1]);
        ctx.closePath(); ctx.fillStyle = it.col; ctx.fill();
        if (it.a === 1) { ctx.strokeStyle = it.col; ctx.lineWidth = 0.6; ctx.stroke(); }
      } else if (it.k === 'l') {
        ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]); ctx.lineTo(it.s[1][0], it.s[1][1]);
        ctx.strokeStyle = it.col; ctx.lineWidth = Math.max(1.2, it.w); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(it.s[0][0], it.s[0][1], Math.max(2.5, it.s[0][2] * 0.032), 0, Math.PI * 2);
        ctx.fillStyle = '#f2b233'; ctx.fill(); ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 0.8; ctx.stroke();
      }
    });
    /* タップできる場所の目印 */
    Object.keys(PARTS).forEach(function (id) {
      var P = PARTS[id];
      if (isInner(id) && !st.xray) return;
      var s = proj(tf(P.p)); P.sp = s;
      ctx.beginPath(); ctx.arc(s[0], s[1], 7, 0, Math.PI * 2);
      ctx.fillStyle = st.sel === id ? 'rgba(22,120,136,.95)' : 'rgba(255,255,255,.85)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#167888'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s[0] - 3.5, s[1]); ctx.lineTo(s[0] + 3.5, s[1]); ctx.moveTo(s[0], s[1] - 3.5); ctx.lineTo(s[0], s[1] + 3.5);
      ctx.strokeStyle = st.sel === id ? '#fff' : '#167888'; ctx.lineWidth = 1.6; ctx.stroke();
    });
    LABELS.forEach(function (o) {
      var show = (!o.x || st.xray) && (o.m === undefined || o.m === st.mode) && !(o.m === 3 && !st.xray);
      if (!show) { o.e.style.display = 'none'; return; }
      var s = proj(tf(o.p));
      o.e.style.display = 'block'; var hw = o.e.offsetWidth / 2 + 4; o.e.style.left = Math.max(hw, Math.min(W - hw, s[0])) + 'px'; o.e.style.top = Math.max(12, Math.min(H - 12, s[1])) + 'px';
    });
  }
  function isInner(id) { return ['contact', 'zct', 'vt', 'la'].indexOf(id) >= 0; }

  /* ---------- 操作 ---------- */
  var mBtns = document.querySelectorAll('[data-pmode]'), sBtns = document.querySelectorAll('[data-sw]');
  var vbox = document.getElementById('pas3dVerdict');
  function verdict() {
    var m = MODES[st.mode];
    vbox.className = 'verdict ' + m[0];
    document.getElementById('pas3dVerdictTitle').textContent = m[1];
    document.getElementById('pas3dVerdictText').textContent = m[2];
    document.getElementById('pas3dSwText').textContent = st.on
      ? 'PASは「入」：電源側ブッシング（配電線側）まで試験電圧が届く。上位の系統から確実に切り離されていることが前提。日本高圧電気の取説は、ケーブルを含む試験で「切」を指定している。'
      : 'PASは「切」：試験電圧は負荷側（VT・LA・負荷側ブッシング）まで。電源側は充電されない。';
  }
  function setMode(m) {
    st.mode = m; st.dirty = true;
    Array.prototype.forEach.call(mBtns, function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-pmode')) === m)); });
    verdict();
  }
  function setOn(v) {
    st.on = v; angTarget = v ? 0 : 1; st.dirty = true;
    Array.prototype.forEach.call(sBtns, function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-sw') === 'on') === v)); });
    verdict();
  }
  Array.prototype.forEach.call(mBtns, function (b) { b.addEventListener('click', function () { setMode(Number(b.getAttribute('data-pmode'))); }); });
  Array.prototype.forEach.call(sBtns, function (b) { b.addEventListener('click', function () { setOn(b.getAttribute('data-sw') === 'on'); }); });
  var info = document.getElementById('pas3dInfo');
  function select(id) {
    st.sel = id; st.dirty = true;
    if (!id) { info.hidden = true; return; }
    var P = PARTS[id];
    if (isInner(id) && !st.xray) setX(true);
    info.hidden = false;
    document.getElementById('pas3dInfoName').textContent = P.n;
    document.getElementById('pas3dInfoText').textContent = P.t;
    document.getElementById('pas3dInfoSrc').textContent = P.s;
  }
  document.getElementById('pas3dInfoClose').addEventListener('click', function () { select(null); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-part]'), function (b) { b.addEventListener('click', function () { select(b.getAttribute('data-part')); }); });
  var bx = document.getElementById('pas3dXray'), ba = document.getElementById('pas3dAuto');
  function setX(v) { st.xray = v; st.dirty = true; bx.textContent = v ? '外箱を戻す' : '中を透かす'; }
  function setA(v) { st.auto = v; ba.textContent = v ? '自動回転を止める' : '自動回転する'; }
  bx.addEventListener('click', function () { setX(!st.xray); });
  ba.addEventListener('click', function () { setA(!st.auto); });
  document.getElementById('pas3dReset').addEventListener('click', function () { st.yaw = 0; st.pitch = 0.2; st.dist = 8; st.dirty = true; setA(false); });

  var ptrs = {}, last = null, pinch = 0, down = null, moved = 0;
  function pts() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
  cv.addEventListener('pointerdown', function (e) {
    ptrs[e.pointerId] = [e.clientX, e.clientY];
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    var p = pts(); if (p.length === 2) pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
    last = [e.clientX, e.clientY]; if (p.length === 1) { down = [e.clientX, e.clientY]; moved = 0; }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = [e.clientX, e.clientY];
    var p = pts();
    if (p.length === 2) {
      var d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
      if (pinch) st.dist = Math.max(4.5, Math.min(14, st.dist * pinch / d));
      pinch = d; moved = 99;
    } else if (last) {
      moved += Math.abs(e.clientX - last[0]) + Math.abs(e.clientY - last[1]);
      if (moved > 6) { setA(false); cv.classList.add('drag'); }
      st.yaw += (e.clientX - last[0]) * 0.01;
      st.pitch = Math.max(-1.3, Math.min(1.3, st.pitch + (e.clientY - last[1]) * 0.01));
      last = [e.clientX, e.clientY];
    }
    st.dirty = true;
  });
  function up(e) {
    var was = !!ptrs[e.pointerId]; delete ptrs[e.pointerId]; pinch = 0;
    var p = pts(); last = p.length ? p[0] : null;
    if (!p.length) cv.classList.remove('drag');
    if (was && e.type === 'pointerup' && !p.length && moved <= 6 && down) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 30;
      Object.keys(PARTS).forEach(function (id) {
        var s = PARTS[id].sp; if (!s || (isInner(id) && !st.xray)) return;
        var d = Math.hypot(s[0] - x, s[1] - y); if (d < bd) { bd = d; best = id; }
      });
      select(best);
    }
    down = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); st.dist = Math.max(4.5, Math.min(14, st.dist + e.deltaY * 0.005)); st.dirty = true; }, { passive: false });

  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize', resize);
  resize(); setX(true); setA(st.auto); setMode(0); setOn(false);

  var prev = 0;
  function loop(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016; prev = ts;
    st.t += dt;
    if (st.auto) { st.yaw += dt * 0.25; st.dirty = true; }
    if (ang !== angTarget) {
      var step = reduce ? 1 : dt * 2.5;
      ang = ang < angTarget ? Math.min(angTarget, ang + step) : Math.max(angTarget, ang - step);
      buildDyn(); st.dirty = true;
    }
    if (st.mode === 1 || st.mode === 3) {
      var sp1 = reduce ? 0.04 : 0.18;
      dotsVT = dotsVT.map(function (t) { return (t + dt * sp1) % 1; });
      dotsLA = dotsLA.map(function (t) { return (t + dt * sp1 * 1.4) % 1; });
      st.dirty = true;
    }
    if (st.dirty && W > 0) { draw(); st.dirty = false; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__pas3d = { setMode: setMode, setOn: setOn, select: select, state: st, parts: PARTS };
})();
