/* 引出形VCB 3Dモデル（外部ライブラリなし・canvas 2Dで描画）
   引外しの順番と、補助スイッチ（52a）のリンクが外れたときのTC焼損を再現する。
   部品の構成はメーカーのカタログ、リンクの形と配置は推定。 */
(function () {
  'use strict';
  var wrap = document.getElementById('vcb3d');
  var cv = document.getElementById('vcb3dCanvas');
  if (!wrap || !cv) return;
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) { document.getElementById('vcb3dMsg').style.display = 'flex'; return; }
  var lblBox = document.getElementById('vcb3dLabels');

  /* ---------- ベクトル ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }
  function mix(c, d, k) { return [c[0] + (d[0] - c[0]) * k, c[1] + (d[1] - c[1]) * k, c[2] + (d[2] - c[2]) * k]; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(v) { v = clamp01(v); return v * v * (3 - 2 * v); }

  /* ---------- 形の部品 ---------- */
  var T = [];
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
    var nu = Math.max(1, Math.ceil(Math.hypot(u[0], u[1], u[2]) / 0.25));
    var nv = Math.max(1, Math.ceil(Math.hypot(v[0], v[1], v[2]) / 0.25));
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
    var seg = opts.seg || 16, ctr = [x, y, z], hl = len / 2;
    function P(a, s) {
      var c = r * Math.cos(a), d = r * Math.sin(a);
      if (axis === 'x') return [x + s, y + c, z + d];
      if (axis === 'z') return [x + c, y + d, z + s];
      return [x + c, y + s, z + d];
    }
    var top = [], bot = [];
    for (var k = 0; k < seg; k++) {
      var a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2;
      addPoly([P(a0, -hl), P(a1, -hl), P(a1, hl), P(a0, hl)], col, m, ctr, opts.open);
      top.push(P(a0, hl)); bot.push(P(a0, -hl));
    }
    if (!opts.open) { addPoly(top, col, m, ctr); addPoly(bot, col, m, ctr); }
  }
  /* 2点を結ぶ角柱（棒・リンク） */
  function rod(a, b, r, col, m) {
    var d = sub(b, a), L = Math.hypot(d[0], d[1], d[2]) || 1e-6, u = mul(d, 1 / L);
    var t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    var p = norm(cross(u, t)), q = norm(cross(u, p)), ctr = mul(add3(a, b), 0.5), ring = [];
    for (var k = 0; k < 6; k++) { var an = k / 6 * Math.PI * 2; ring.push(add3(mul(p, Math.cos(an) * r), mul(q, Math.sin(an) * r))); }
    for (k = 0; k < 6; k++) {
      var r0 = ring[k], r1 = ring[(k + 1) % 6];
      addPoly([add3(a, r0), add3(a, r1), add3(b, r1), add3(b, r0)], col, m, ctr);
    }
    addPoly(ring.map(function (o) { return add3(b, o); }), col, m, ctr);
    addPoly(ring.map(function (o) { return add3(a, o); }), col, m, ctr);
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
  var lines = [];
  function wire(pts, col, w, m) {
    var c = curve(pts, 8, false), rgb = hex(col);
    for (var i = 0; i < c.length - 1; i++) lines.push({ a: c[i], b: c[i + 1], c: rgb, w: w, m: m });
  }
  function M(part, extra) { var o = { part: part }; for (var k in extra) o[k] = extra[k]; return o; }

  /* ---------- 寸法 ---------- */
  var PX = { U: -0.42, V: 0, W: 0.42 }, PHS = ['U', 'V', 'W'];
  var PZ = -0.4;                 /* 各相（真空バルブ）の奥行き位置 */
  var SH = [0, 0.3, 0.1];        /* 主軸の中心（yとz） */
  var CR = 0.5;                  /* 主軸のクランク長さ */
  var PHI_C = 0.2, PHI_O = -0.05; /* 主軸の角度：入・切 */
  var AUX = [0.42, 0.95, 0.42];  /* 補助スイッチの中心 */
  var TCP = [0.3, 0.5, 0.36];    /* 引外しコイル */
  var PLUG = [-0.45, 1.13, 0.5]; /* 制御回路プラグ */
  var CU = 0xc9874a, STEEL = 0x8c939a;

  /* ---------- 動かない部分 ---------- */
  var staticPolys = []; T = staticPolys;
  /* 台車・車輪 */
  box(1.5, 0.08, 1.55, 0, 0.1, -0.15, 0x5f6266, M('wheel'));
  [[-0.7, 0.45], [0.7, 0.45], [-0.7, -0.75], [0.7, -0.75]].forEach(function (w) { cyl(0.08, 0.05, w[0], 0.08, w[1], 0x2c2c2a, 'x', M('wheel'), { seg: 14 }); });
  /* 操作機構の箱（前面） */
  box(1.4, 0.95, 0.5, 0, 0.6, 0.42, STEEL, M('mech', { shell: 1 }));
  box(1.42, 0.97, 0.02, 0, 0.6, 0.68, 0x6b7075, M('front', { shell: 1 }));
  /* 前面の表示・ボタン（外から見える） */
  box(0.14, 0.06, 0.02, 0.05, 0.86, 0.7, 0xf4f2ea, M('indicator'));
  box(0.14, 0.06, 0.02, 0.3, 0.86, 0.7, 0xf2c94c, M('indicator'));
  cyl(0.04, 0.03, -0.22, 0.56, 0.705, 0xc0392b, 'z', M('front'), { seg: 12 });
  cyl(0.04, 0.03, 0.02, 0.56, 0.705, 0x2f8a4e, 'z', M('front'), { seg: 12 });
  cyl(0.035, 0.03, 0.34, 0.5, 0.705, 0x2c2c2a, 'z', M('front'), { seg: 12 });
  box(0.42, 0.14, 0.02, -0.05, 0.3, 0.7, 0xe8e8e2, M('front'));
  /* 各相：絶縁枠・真空バルブ・接触子 */
  PHS.forEach(function (ph) {
    var x = PX[ph];
    box(0.3, 1.0, 0.04, x, 0.95, PZ + 0.17, 0x7a5a3a, M('pole', { shell: 1 }));
    box(0.3, 1.0, 0.04, x, 0.95, PZ - 0.17, 0x7a5a3a, M('pole', { shell: 1 }));
    cyl(0.09, 0.36, x, 1.0, PZ, 0xe8e4da, 'y', M('vi', { shell: 1 }), { seg: 18 });
    cyl(0.096, 0.03, x, 1.19, PZ, 0xb8b8b4, 'y', M('vi'), { seg: 18 });
    cyl(0.096, 0.03, x, 0.81, PZ, 0xb8b8b4, 'y', M('vi'), { seg: 18 });
    /* 固定側：固定接点 → 上部接触子 */
    cyl(0.05, 0.03, x, 1.04, PZ, CU, 'y', M('vi', { inner: 1, ph: ph, cond: 1 }), { seg: 12 });
    cyl(0.025, 0.28, x, 1.18, PZ, CU, 'y', M('vi', { inner: 1, ph: ph, cond: 1 }), { seg: 10 });
    box(0.06, 0.06, 0.72, x, 1.32, PZ - 0.36, CU, M('terminal', { ph: ph, cond: 1 }));
    cyl(0.065, 0.14, x, 1.32, PZ - 0.78, 0xc9cacc, 'z', M('terminal'), { seg: 12 });
    /* 可動側：下部接触子（フレキシブル導体でつなぐ） */
    box(0.06, 0.06, 0.72, x, 0.7, PZ - 0.36, CU, M('terminal', { ph: ph, cond: 1 }));
    cyl(0.065, 0.14, x, 0.7, PZ - 0.78, 0xc9cacc, 'z', M('terminal'), { seg: 12 });
  });
  /* 主軸 */
  cyl(0.035, 1.35, 0.02, SH[1], SH[2], 0x9a9a96, 'x', M('shaft', { inner: 1 }), { seg: 12 });
  /* 操作機構の中 */
  cyl(0.075, 0.46, -0.45, 0.6, 0.42, 0x4d5257, 'y', M('cspring', { inner: 1 }), { seg: 14 });
  [0.42, 0.5, 0.58, 0.66, 0.74].forEach(function (yy) { cyl(0.085, 0.015, -0.45, yy, 0.42, 0x2c2c2a, 'y', M('cspring', { inner: 1 }), { seg: 14 }); });
  cyl(0.06, 0.1, -0.45, 0.92, 0.42, 0x6b7075, 'z', M('motor', { inner: 1 }), { seg: 12 });
  box(0.16, 0.12, 0.16, -0.45, 0.94, 0.35, 0x5a5e63, M('motor', { inner: 1 }));
  box(0.13, 0.13, 0.13, 0.3, 0.74, 0.36, 0x8a6d3b, M('cc', { inner: 1 }));
  box(0.04, 0.16, 0.16, 0.39, TCP[1], TCP[2], 0xa9abad, M('tc', { inner: 1 }));
  /* 補助スイッチのケース（回る部分は動く部分で描く） */
  box(0.06, 0.2, 0.2, AUX[0] + 0.2, AUX[1], AUX[2], 0x55595e, M('aux', { inner: 1 }));
  box(0.06, 0.2, 0.2, AUX[0] - 0.2, AUX[1], AUX[2], 0x55595e, M('aux', { inner: 1 }));
  /* 制御回路プラグと制御配線 */
  box(0.22, 0.08, 0.14, PLUG[0], PLUG[1], PLUG[2], 0x2f8a4e, M('plug'));
  var CTRL = [PLUG, [-0.1, 1.08, 0.55], [AUX[0] - 0.12, 1.06, 0.52], [AUX[0] - 0.12, AUX[1] + 0.06, AUX[2] + 0.1], [AUX[0] - 0.05, AUX[1] - 0.1, AUX[2] + 0.12], [0.42, 0.68, 0.5], [TCP[0] + 0.02, TCP[1] + 0.1, TCP[2] + 0.1], [TCP[0] - 0.06, TCP[1], TCP[2] + 0.1], [0.05, 0.45, 0.55], [-0.25, 0.85, 0.58], [-0.42, 1.06, 0.55], PLUG];
  wire(CTRL, 0x378add, 2.6, M('plug', { inner: 1, ctrl: 1 }));
  var CTRL_PATH = curve(CTRL, 8, false);

  /* ---------- 状態 ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = {
    yaw: -0.55, pitch: 0.28, dist: 7, xray: true, auto: false, dirty: true, t: 0, sel: null,
    fault: false,      /* 52aのリンクが外れている */
    p: 0,              /* 開いた量：0＝入、1＝切 */
    aux: 0,            /* 補助スイッチの回転：0＝入の位置、1＝切の位置 */
    plunger: 0, latch: 0,
    seq: null,         /* 再生中の時間（null＝止まっている） */
    k67: false, i: false, heat: 0, burned: false, arc: 0, power: true, msg: 0
  };

  /* ---------- 動く部分 ---------- */
  var dynPolys = [], dynLines = [];
  function phi() { return lerp(PHI_C, PHI_O, ease(st.p)); }
  function crankEnd(x, ang) { return [x, SH[1] + CR * Math.sin(ang) * 0.4 + 0.04, SH[2] - CR * Math.cos(ang)]; }
  function buildDyn() {
    dynPolys = []; T = dynPolys; dynLines = [];
    var a = phi(), lift = (Math.sin(a) - Math.sin(PHI_C)) * CR * 0.4;   /* 可動側の上下 */
    PHS.forEach(function (ph) {
      var x = PX[ph], ce = crankEnd(x, a);
      rod([x, SH[1], SH[2]], ce, 0.025, 0x9a9a96, M('shaft', { inner: 1 }));
      var top = 0.6 + lift;
      rod(ce, [x, top - 0.02, PZ], 0.028, 0xb07a3a, M('rod', { inner: 1 }));
      cyl(0.022, 0.34, x, top + 0.17, PZ, CU, 'y', M('vi', { inner: 1, ph: ph, cond: 1 }), { seg: 10 });
      cyl(0.05, 0.03, x, 1.0 + lift, PZ, CU, 'y', M('vi', { inner: 1, ph: ph, cond: 1, mov: 1 }), { seg: 12 });
      dynLines.push({ pts: curve([[x, 0.74 + lift, PZ], [x, 0.7, PZ - 0.08], [x, 0.7, PZ - 0.16]], 6, false), c: hex(0xd29a5a), w: 4, m: M('terminal', { ph: ph, cond: 1 }) });
    });
    /* 機構側のクランク・開路ばね */
    var cm = crankEnd(-0.15, a + Math.PI);
    rod([-0.15, SH[1], SH[2]], cm, 0.03, 0x9a9a96, M('shaft', { inner: 1 }));
    var springTop = [-0.15, 0.62, 0.3];
    rod(cm, springTop, 0.045 + 0.01 * (1 - st.p), 0x6b7075, M('ospring', { inner: 1 }));
    /* 引外しキャッチ（ラッチ） */
    var la = st.latch * 0.9, lc = [0.16, 0.5, 0.36];
    rod(lc, [lc[0] - 0.12 * Math.cos(la), lc[1] + 0.12 * Math.sin(la), lc[2]], 0.025, 0xd9a227, M('latch', { inner: 1 }));
    rod([lc[0], lc[1] - 0.12, lc[2]], lc, 0.02, 0x7a7a76, M('latch', { inner: 1 }));
    /* 引外しコイルとプランジャ */
    var tcCol = st.burned ? 0x2a1a10 : 0xc9874a;
    box(0.12, 0.12, 0.12, TCP[0], TCP[1], TCP[2], tcCol, M('tc', { inner: 1, coil: 1 }));
    var pl = 0.06 + 0.06 * st.plunger;
    rod([TCP[0] - 0.06, TCP[1], TCP[2]], [TCP[0] - 0.06 - pl, TCP[1], TCP[2]], 0.022, 0xc9cacc, M('tc', { inner: 1 }));
    /* 補助スイッチ：回転子と接点（5段） */
    var ra = st.aux * 1.2;
    for (var k = 0; k < 5; k++) {
      var xx = AUX[0] - 0.14 + k * 0.07;
      cyl(0.075, 0.045, xx, AUX[1], AUX[2], k === 0 ? 0x1f6f8b : 0x3f4a55, 'x', M('aux', { inner: 1, a52: k === 0 }), { seg: 12 });
      rod([xx, AUX[1], AUX[2]], [xx, AUX[1] + 0.09 * Math.cos(ra + k * 0.6), AUX[2] + 0.09 * Math.sin(ra + k * 0.6)], 0.012, 0xd9a227, M('aux', { inner: 1 }));
    }
    /* 52a の接点（最初の段）：閉＝橋がかかる */
    var c52 = !st.fault ? st.aux < 0.5 : true;
    var bx = AUX[0] - 0.14, by = AUX[1] + 0.1, bz = AUX[2] + 0.04;
    box(0.03, 0.03, 0.03, bx, by, bz - 0.04, 0xc9cacc, M('aux', { inner: 1, a52: 1 }));
    box(0.03, 0.03, 0.03, bx, by, bz + 0.04, 0xc9cacc, M('aux', { inner: 1, a52: 1 }));
    box(0.02, 0.015, 0.11, bx, by + (c52 ? 0.02 : 0.06), bz, c52 ? 0xe24b4a : 0x2f8a4e, M('aux', { inner: 1, a52: 1 }));
    /* 補助スイッチを回すリンク（主軸 → 補助スイッチのレバー） */
    var lv = [AUX[0] + 0.24, AUX[1] - 0.12 * Math.cos(ra), AUX[2] - 0.12 * Math.sin(ra)];
    rod([AUX[0] + 0.24, AUX[1], AUX[2]], lv, 0.018, 0x9a9a96, M('link', { inner: 1 }));
    var se = crankEnd(AUX[0] + 0.24, a + Math.PI * 0.5);
    rod([AUX[0] + 0.24, SH[1], SH[2]], se, 0.02, 0x9a9a96, M('link', { inner: 1 }));
    if (!st.fault) rod(se, lv, 0.016, 0xd9d4c7, M('link', { inner: 1 }));
    else rod(se, add3(se, [0, 0.32, 0.05]), 0.016, 0xe24b4a, M('link', { inner: 1, broken: 1 }));
    /* 開閉表示（入＝赤・切＝緑） */
    box(0.18, 0.1, 0.02, -0.25, 0.86, 0.7, st.p < 0.5 ? 0xc0392b : 0x2f8a4e, M('indicator'));
    T = staticPolys;
  }

  /* ---------- 電流の粒（引外し回路） ---------- */
  function at(path, t) { var f = t * (path.length - 1), i = Math.floor(f), r = f - i, a = path[i], b = path[Math.min(i + 1, path.length - 1)]; return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; }
  var dots = []; for (var di = 0; di < 26; di++) dots.push(di / 26);

  /* ---------- 部品の説明 ---------- */
  var PARTS = {
    vi: { n: '真空バルブ', p: [0.42, 1.0, PZ + 0.12], t: '各相に1本。接点が真空の容器に密封されていて、可動接点が下がって開くと、真空の中でアークが消える。', s: '接点が真空バルブに密封されていることは公開資料（東芝のカタログ）。形・寸法はモデル。' },
    terminal: { n: '上部・下部接触子', p: [0.42, 1.32, PZ - 0.8], t: '引出形のVCBを盤に押し込んだとき、盤側の主回路とつながるところ。上が固定接点側、下はフレキシブル導体で可動接点とつながる。', s: '上部・下部接触子は三菱電機のカタログの部品名。形はモデル。' },
    rod: { n: '絶縁操作ロッド', p: [0.42, 0.45, PZ], t: '主軸の回転を、可動接点の上下の動きに変える。主回路と操作機構のあいだを絶縁する。', s: '一般的な構造をもとにした推定。' },
    shaft: { n: '主軸', p: [-0.6, SH[1], SH[2]], t: '操作機構が回す軸。3相の可動接点と、補助スイッチを同じ動きで切り替える。', s: '主軸で3相と補助スイッチを動かす形は推定（機種で形はちがう）。' },
    cspring: { n: '投入ばね', p: [-0.45, 0.85, 0.5], t: '電動機（電動ばね操作）または手動で蓄勢して、投入のエネルギーにする。', s: '公開資料（東芝のカタログ）。形・位置はモデル。' },
    ospring: { n: '開路ばね（引外しばね）', p: [-0.15, 0.62, 0.3], t: '投入するときに一緒に蓄勢される。引外しのときは、このばねの力で主軸が回り、接点が開く。', s: '公開資料（東芝のカタログ）。形・位置はモデル。' },
    latch: { n: '引外しキャッチ（ラッチ）', p: [0.16, 0.62, 0.36], t: '投入した状態を機械的に保っている留め金。引外しコイルが励磁されると外れて、開路ばねが働く。', s: '公開資料（東芝のカタログ：引外しキャッチ）。形はモデル。' },
    tc: { n: '引外しコイル（TC）', p: [TCP[0], TCP[1] + 0.12, TCP[2]], t: '継電器の指令で励磁され、プランジャで引外しキャッチを外す。電流が流れるのは一瞬の前提で、遮断器が開くと52aで電流が切られる。', s: '役割は公開資料。定格・形は機種による。' },
    cc: { n: '投入コイル（CC）', p: [0.3, 0.84, 0.36], t: '投入指令で励磁され、投入キャッチを外す。投入ばねの力で主軸が回り、接点が閉じる。', s: '公開資料（東芝のカタログ）。位置はモデル。' },
    aux: { n: '補助スイッチ（52a・52b）', p: [AUX[0], AUX[1] + 0.16, AUX[2]], t: 'VCBの入・切に連動して切り替わるa接点・b接点の集まり。52aはその中のa接点で、引外し回路ではTCと直列に入り、VCBが開くとTCの電流を切る。接点数の例：三菱電機VF-8D/13Dは手動ばね操作2a2b・電動ばね操作5a5b、東芝は標準2a2b（追加3a3b）。', s: '接点数は公開資料。補助スイッチの位置と、主軸からリンクで回す形は推定（カタログに記載がなく、機種でちがう）。' },
    link: { n: '補助スイッチを回すリンク', p: [AUX[0] + 0.24, 0.62, AUX[2] - 0.2], t: '主軸の回転を補助スイッチに伝える。ここが外れたり曲がったりすると、主接点は開いたのに補助スイッチが回らず、52aが閉じたままになる。', s: '推定。実機のリンクの形と位置は、その機種の取扱説明書・構造図で確認する。' },
    plug: { n: '制御回路プラグ（二次コネクタ）', p: [PLUG[0], PLUG[1] + 0.08, PLUG[2]], t: '引出形で、VCBの制御回路（補助スイッチ・TC・CC・電動機）と盤側の制御回路をつなぐ。青い線が引外し回路の配線のイメージ。', s: '三菱電機：制御回路プラグ、東芝：制御回路断路部（カタログ）。配線の通り道はモデル。' },
    indicator: { n: '開閉表示器・動作回数計', p: [-0.1, 0.98, 0.7], t: '前面で入・切の状態と、動作した回数を確かめる。ばね蓄勢の表示がある機種もある。', s: '公開資料（三菱電機・東芝のカタログ）。色はモデル上の表現。' },
    wheel: { n: '台車・車輪（引出機構）', p: [0.7, 0.2, 0.45], t: '引出形は、盤から出し入れできる。機械的・電気的インタロックがあり、決められた位置でしか入・切できない。', s: '公開資料（東芝・三菱電機のカタログ）。形はモデル。' }
  };
  var INNER = ['vi', 'rod', 'shaft', 'cspring', 'ospring', 'latch', 'tc', 'cc', 'aux', 'link'];
  function isInner(id) { return INNER.indexOf(id) >= 0; }
  var LABELS = [
    { t: '真空バルブ', p: [-0.42, 1.48, PZ] },
    { t: '補助スイッチ（52a）', p: [AUX[0], AUX[1] + 0.3, AUX[2]], x: 1 },
    { t: '引外しコイル', p: [TCP[0] + 0.05, TCP[1] - 0.2, TCP[2] + 0.1], x: 1 },
    { t: '主軸', p: [0.8, SH[1] - 0.1, SH[2]], x: 1 },
    { t: '投入ばね', p: [-0.45, 0.3, 0.42], x: 1 },
    { t: '制御回路プラグ', p: [PLUG[0], PLUG[1] + 0.2, PLUG[2]] },
    { t: 'リンクが外れている', p: [AUX[0] + 0.3, 0.55, AUX[2] - 0.2], f: 1, hot: 1 },
    { t: 'TC焼損', p: [TCP[0] + 0.1, TCP[1] + 0.25, TCP[2]], b: 1, hot: 1 }
  ];
  LABELS.forEach(function (o) { var e = document.createElement('div'); e.className = 'lb' + (o.hot ? ' hot' : ''); e.textContent = o.t; lblBox.appendChild(e); o.e = e; });

  /* ---------- 描画 ---------- */
  var CTR = [0.0, 0.7, -0.1], CTR0 = CTR.slice();
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
  function F() { return 7 * Math.min(W / 2.3, H / 2.2); }
  function proj(v) { var s = F() / (st.dist - v[2]); return [W / 2 + v[0] * s, H / 2 - v[1] * s, s]; }
  var LIGHT = norm([0.35, 0.75, 0.6]);
  var SELC = [22, 160, 176], HOT = [226, 75, 74];
  function visible(m) { return !(m.inner && !st.xray); }
  function colorOf(c, m) {
    if (m.coil && !st.burned) {
      var k = st.i ? 0.35 + 0.65 * st.heat : st.heat * 0.6;
      if (st.i && !reduce) k *= 0.85 + 0.15 * Math.sin(st.t * 8);
      c = mix(c, HOT, Math.min(1, k));
    }
    if (m.ctrl && st.i) c = mix(c, [242, 178, 51], 0.7);
    if (m.a52 && st.i) c = mix(c, HOT, 0.4);
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
      var a = q.m.shell && st.xray ? (q.m.part === 'vi' ? 0.35 : 0.12) : 1;
      var sh = 0.52 + 0.48 * Math.max(0, dot(n, LIGHT));
      var c = colorOf(q.c, q.m);
      items.push({ k: 'p', z: fc[2], s: vs.map(proj), col: 'rgba(' + Math.round(c[0] * sh) + ',' + Math.round(c[1] * sh) + ',' + Math.round(c[2] * sh) + ',' + a + ')', a: a });
    }
    staticPolys.forEach(pushPoly); dynPolys.forEach(pushPoly);
    function pushLine(a0, b0, c0, w, m) {
      if (!visible(m)) return;
      var a = tf(a0), b = tf(b0), pa = proj(a), c = colorOf(c0, m);
      items.push({ k: 'l', z: (a[2] + b[2]) / 2 + 0.01, s: [pa, proj(b)], col: 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')', w: w * pa[2] / 90 });
    }
    lines.forEach(function (l) { pushLine(l.a, l.b, l.c, l.w, l.m); });
    dynLines.forEach(function (l) { for (var i = 0; i < l.pts.length - 1; i++) pushLine(l.pts[i], l.pts[i + 1], l.c, l.w, l.m); });
    if (st.i && st.xray) dots.forEach(function (t) { var v = tf(at(CTRL_PATH, t)); items.push({ k: 'd', z: v[2] + 0.03, s: [proj(v)] }); });
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
        ctx.beginPath(); ctx.arc(it.s[0][0], it.s[0][1], Math.max(2.5, it.s[0][2] * 0.012), 0, Math.PI * 2);
        ctx.fillStyle = '#f2b233'; ctx.fill(); ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 0.8; ctx.stroke();
      }
    });
    Object.keys(PARTS).forEach(function (id) {
      var P = PARTS[id];
      if (isInner(id) && !st.xray) { P.sp = null; return; }
      var s = proj(tf(P.p)); P.sp = s;
      ctx.beginPath(); ctx.arc(s[0], s[1], 7, 0, Math.PI * 2);
      ctx.fillStyle = st.sel === id ? 'rgba(22,120,136,.95)' : 'rgba(255,255,255,.85)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#167888'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s[0] - 3.5, s[1]); ctx.lineTo(s[0] + 3.5, s[1]); ctx.moveTo(s[0], s[1] - 3.5); ctx.lineTo(s[0], s[1] + 3.5);
      ctx.strokeStyle = st.sel === id ? '#fff' : '#167888'; ctx.lineWidth = 1.6; ctx.stroke();
    });
    LABELS.forEach(function (o) {
      var show = (!o.x || st.xray) && (!o.f || st.fault) && (!o.b || st.burned);
      if (!show) { o.e.style.display = 'none'; return; }
      var s = proj(tf(o.p));
      if (s[0] < 0 || s[0] > W || s[1] < 0 || s[1] > H) { o.e.style.display = 'none'; return; }
      o.e.style.display = 'block'; var hw = o.e.offsetWidth / 2 + 4;
      o.e.style.left = Math.max(hw, Math.min(W - hw, s[0])) + 'px'; o.e.style.top = Math.max(12, Math.min(H - 12, s[1])) + 'px';
    });
  }

  /* ---------- 回路図と説明の更新 ---------- */
  var sv = {
    k67: document.getElementById('sc67'), k52: document.getElementById('sc52'), tc: document.getElementById('scTC'),
    loop: document.getElementById('scLoop'), arc: document.getElementById('scArc'), time: document.getElementById('scTime'),
    msgBox: document.getElementById('vcbStatus'), msgT: document.getElementById('vcbStatusTitle'), msgB: document.getElementById('vcbStatusText')
  };
  var MSG = [
    ['ok', '入（投入している）', '主接点は閉じていて、補助スイッチの52aも閉じている。「引外しを再生」を押すと、67が動作したときの順番を見られる。'],
    ['warn', '① 67の接点が閉じ、TCに電流が流れる', '直流電源 → 67の接点 → 52a → TC と電流が流れ、TCが励磁される。'],
    ['warn', '② プランジャが引外しキャッチを外す', 'キャッチが外れると、開路ばねの力で主軸が回り始める。'],
    ['warn', '③ 主軸が回り、3相の接点が開く', '主軸につながった絶縁操作ロッドが可動接点を引き下げる。補助スイッチもリンクで同時に回る。'],
    ['ok', '④ 52aが開いて、TCの電流が切れる', '引外しは終わり。TCに電流が流れたのは一瞬だけ。67の接点は、電流がもう流れていない状態で開く。'],
    ['ng', '③’ 主軸は回ったのに、補助スイッチが回らない', 'リンクが外れているので、主接点が開いても52aは閉じたまま。TCに直流が流れ続け、同じ電流が67の接点にも流れ続ける。'],
    ['ng', 'TCが焼けて切れた', 'TCが焼損して回路が切れた瞬間、閉じていた67の接点が、コイルの直流電流を切らされる（アークが出る）。67の接点や出力回路が傷む原因になりうる。'],
    ['warn', '操作電源を切った', 'TCの電流は止まった。リンクが外れたままなので、このまま投入しても次の引外しで同じことが起きる。'],
    ['ok', '切（開いている）', '主接点も52aも開いている。「投入」で元に戻せる。']
  ];
  function setMsg(k) {
    if (st.msg === k) return; st.msg = k;
    var m = MSG[k];
    sv.msgBox.className = 'verdict ' + m[0]; sv.msgT.textContent = m[1]; sv.msgB.textContent = m[2];
  }
  function updSchematic() {
    var c52 = st.fault ? true : st.aux < 0.5;
    sv.k67.setAttribute('d', st.k67 ? 'M150 60 L190 60' : 'M150 60 L186 40');
    sv.k52.setAttribute('d', c52 ? 'M270 60 L310 60' : 'M270 60 L306 40');
    sv.k52.setAttribute('stroke', c52 ? '#b83a2b' : '#2f8a4e');
    sv.tc.setAttribute('fill', st.burned ? '#2a1a10' : st.i ? '#e24b4a' : st.heat > 0.05 ? '#d98a6e' : '#e8d3c0');
    sv.loop.setAttribute('class', st.i ? 'flow on' : 'flow');
    sv.arc.style.opacity = st.arc > 0 ? String(Math.min(1, st.arc)) : '0';
    sv.time.textContent = st.seq !== null && st.fault && st.i ? 'TCに通電中 ' + (Math.max(0, st.seq - 0.3)).toFixed(1) + ' 秒（模式）' : st.burned ? 'TC焼損（模式）' : '';
  }

  /* 引外しの再生：時間は見やすいように遅くしている（実際は数十ミリ秒） */
  var BURN_T = 6.0;
  function step(dt) {
    if (st.seq === null) return;
    st.seq += dt;
    var t = st.seq;
    st.k67 = t < (st.fault ? 999 : 1.6);
    if (st.power && !st.burned && st.k67) {
      var c52 = st.fault ? true : st.aux < 0.5;
      st.i = c52;
    } else st.i = false;
    st.plunger = st.i || t < 0.6 ? ease(t / 0.3) : Math.max(0, st.plunger - dt * 3);
    if (t > 0.3) st.latch = ease((t - 0.3) / 0.15);
    if (t > 0.4) st.p = ease((t - 0.4) / 0.45);
    if (!st.fault) st.aux = st.p;
    if (st.i) st.heat = Math.min(1, st.heat + dt / BURN_T * (st.fault ? 1 : 0.6));
    if (st.fault && st.i && st.heat >= 1) { st.burned = true; st.i = false; st.arc = 1.2; }
    if (st.arc > 0) st.arc = Math.max(0, st.arc - dt);
    /* 説明 */
    if (st.burned) setMsg(6);
    else if (!st.power && st.fault) setMsg(7);
    else if (t < 0.3) setMsg(1);
    else if (t < 0.4) setMsg(2);
    else if (st.fault && t > 0.9) setMsg(5);
    else if (t < 0.85) setMsg(3);
    else setMsg(4);
    if (!st.fault && t > 2.2) { st.seq = null; st.k67 = false; st.plunger = 0; setMsg(8); }
    if (st.burned && st.arc === 0 && t > 3) { st.seq = null; }
    buildDyn(); st.dirty = true;
  }
  function resetClosed() {
    st.seq = null; st.p = 0; st.aux = 0; st.plunger = 0; st.latch = 0; st.k67 = false; st.i = false;
    st.heat = 0; st.burned = false; st.arc = 0; st.power = true; st.msg = -1; setMsg(0);
    buildDyn(); updSchematic(); st.dirty = true;
  }
  function playTrip() {
    resetClosed(); st.seq = 0; setA(false);
    if (st.xray === false) setX(true);
  }

  /* ---------- 操作 ---------- */
  var fBtns = document.querySelectorAll('[data-fault]');
  function setFault(v) {
    st.fault = v;
    Array.prototype.forEach.call(fBtns, function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-fault') === '1') === v)); });
    resetClosed();
  }
  Array.prototype.forEach.call(fBtns, function (b) { b.addEventListener('click', function () { setFault(b.getAttribute('data-fault') === '1'); }); });
  document.getElementById('vcbPlay').addEventListener('click', playTrip);
  document.getElementById('vcbClose').addEventListener('click', resetClosed);
  document.getElementById('vcbPower').addEventListener('click', function () { if (st.seq !== null && st.i) { st.power = false; } });
  var info = document.getElementById('vcbInfo');
  function select(id) {
    st.sel = id; st.dirty = true;
    if (!id) { info.hidden = true; return; }
    var P = PARTS[id];
    if (isInner(id) && !st.xray) setX(true);
    info.hidden = false;
    document.getElementById('vcbInfoName').textContent = P.n;
    document.getElementById('vcbInfoText').textContent = P.t;
    document.getElementById('vcbInfoSrc').textContent = P.s;
  }
  document.getElementById('vcbInfoClose').addEventListener('click', function () { select(null); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-vpart]'), function (b) { b.addEventListener('click', function () { select(b.getAttribute('data-vpart')); }); });
  var bx = document.getElementById('vcbXray'), ba = document.getElementById('vcbAuto');
  function setX(v) { st.xray = v; st.dirty = true; bx.textContent = v ? '外箱を戻す' : '中を透かす'; }
  function setA(v) { st.auto = v; ba.textContent = v ? '自動回転を止める' : '自動回転する'; }
  bx.addEventListener('click', function () { setX(!st.xray); });
  ba.addEventListener('click', function () { setA(!st.auto); });
  var VIEWS = {
    all: { c: CTR0, d: 7, y: -0.55, p: 0.28 },
    mech: { c: [0.05, 0.62, 0.35], d: 4.8, y: -0.25, p: 0.22 },
    aux: { c: [0.42, 0.78, 0.4], d: 3.6, y: -0.35, p: 0.35 },
    vi: { c: [0, 0.9, PZ], d: 4.4, y: 0.85, p: 0.12 }
  };
  function view(k) { var v = VIEWS[k]; CTR = v.c.slice(); st.dist = v.d; st.yaw = v.y; st.pitch = v.p; st.dirty = true; setA(false); }
  Array.prototype.forEach.call(document.querySelectorAll('[data-vview]'), function (b) { b.addEventListener('click', function () { view(b.getAttribute('data-vview')); }); });
  document.getElementById('vcbReset').addEventListener('click', function () { view('all'); });

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
      if (pinch) st.dist = Math.max(1.8, Math.min(12, st.dist * pinch / d));
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
        var s = PARTS[id].sp; if (!s) return;
        var d = Math.hypot(s[0] - x, s[1] - y); if (d < bd) { bd = d; best = id; }
      });
      select(best);
    }
    down = null;
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); st.dist = Math.max(1.8, Math.min(12, st.dist + e.deltaY * 0.004)); st.dirty = true; }, { passive: false });

  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize', resize);
  resize(); setX(true); setA(false); setFault(false);

  var prev = 0;
  function loop(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016; prev = ts;
    st.t += dt;
    if (st.auto) { st.yaw += dt * 0.25; st.dirty = true; }
    if (st.seq !== null) step(dt * (reduce ? 0.6 : 1));
    if (st.i) { dots = dots.map(function (t) { return (t + dt * 0.25) % 1; }); st.dirty = true; }
    if (st.i || st.arc > 0 || st.seq !== null) updSchematic();
    if (st.dirty && W > 0) { draw(); st.dirty = false; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__vcb3d = { state: st, parts: PARTS, play: playTrip, setFault: setFault, reset: resetClosed };
})();
