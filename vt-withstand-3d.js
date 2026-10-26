/* VT単体の耐圧試験 3Dモデル（外部ライブラリなし・canvas 2Dで描画）
   モード 0: U–V短絡 / 1: Uだけ・V浮き / 2: Uだけ・V接地 */
(function () {
  'use strict';
  var wrap = document.getElementById('vt3d');
  var cv = document.getElementById('vt3dCanvas');
  if (!wrap || !cv) return;
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) { document.getElementById('vt3dMsg').style.display = 'flex'; return; }
  var lblBox = document.getElementById('vt3dLabels');

  /* ---------- ベクトル ---------- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add3(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }

  /* ---------- モデル ---------- */
  var polys = [];   // {p:[v3], n:v3, c:[r,g,b], g:group, ds:bool}
  var lines = [];   // {a:v3, b:v3, c:[r,g,b], w:px, g:group}

  function addPoly(pts, col, g, center, ds) {
    var n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (center) {
      var fc = [0, 0, 0];
      pts.forEach(function (p) { fc = add3(fc, p); });
      fc = mul(fc, 1 / pts.length);
      if (dot(n, sub(fc, center)) < 0) { pts = pts.slice().reverse(); n = mul(n, -1); }
    }
    polys.push({ p: pts, n: n, c: hex(col), g: g || 'solid', ds: !!ds });
  }
  function grid(o, u, v, col, g, center) {
    var nu = Math.max(1, Math.ceil(Math.hypot(u[0], u[1], u[2]) / 0.3));
    var nv = Math.max(1, Math.ceil(Math.hypot(v[0], v[1], v[2]) / 0.3));
    var du = mul(u, 1 / nu), dv = mul(v, 1 / nv);
    for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
      var c = add3(add3(o, mul(du, i)), mul(dv, j));
      addPoly([c, add3(c, du), add3(add3(c, du), dv), add3(c, dv)], col, g, center);
    }
  }
  function box(w, h, d, x, y, z, col, g) {
    var hw = w / 2, hh = h / 2, hd = d / 2, ctr = [x, y, z];
    grid([x + hw, y - hh, z + hd], [0, 0, -d], [0, h, 0], col, g, ctr);
    grid([x - hw, y - hh, z - hd], [0, 0, d], [0, h, 0], col, g, ctr);
    grid([x - hw, y + hh, z + hd], [w, 0, 0], [0, 0, -d], col, g, ctr);
    grid([x - hw, y - hh, z - hd], [w, 0, 0], [0, 0, d], col, g, ctr);
    grid([x - hw, y - hh, z + hd], [w, 0, 0], [0, h, 0], col, g, ctr);
    grid([x + hw, y - hh, z - hd], [-w, 0, 0], [0, h, 0], col, g, ctr);
  }
  function cyl(r, len, x, y, z, col, axis, g, opts) {
    opts = opts || {};
    var seg = opts.seg || 18, ctr = [x, y, z], hl = len / 2;
    function P(a, s) {
      return axis === 'z' ? [x + r * Math.cos(a), y + r * Math.sin(a), z + s] : [x + r * Math.cos(a), y + s, z + r * Math.sin(a)];
    }
    var top = [], bot = [];
    for (var k = 0; k < seg; k++) {
      var a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2;
      addPoly([P(a0, -hl), P(a1, -hl), P(a1, hl), P(a0, hl)], col, g, ctr, opts.open);
      top.push(P(a0, hl)); bot.push(P(a0, -hl));
    }
    if (!opts.open) { addPoly(top, col, g, ctr); addPoly(bot, col, g, ctr); }
  }
  function curve(pts, n, closed) {
    var out = [], P = pts.slice(), m = P.length;
    var seg = closed ? m : m - 1;
    for (var i = 0; i < seg; i++) {
      var p0 = P[closed ? (i - 1 + m) % m : Math.max(i - 1, 0)], p1 = P[i], p2 = P[(i + 1) % m], p3 = P[closed ? (i + 2) % m : Math.min(i + 2, m - 1)];
      for (var s = 0; s < n; s++) {
        var t = s / n, t2 = t * t, t3 = t2 * t, q = [];
        for (var d = 0; d < 3; d++) q.push(0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3));
        out.push(q);
      }
    }
    if (!closed) out.push(P[m - 1]); else out.push(out[0]);
    return out;
  }
  function wire(pts, col, w, g) {
    var c = curve(pts, 8, false), rgb = hex(col);
    for (var i = 0; i < c.length - 1; i++) lines.push({ a: c[i], b: c[i + 1], c: rgb, w: w, g: g });
  }

  /* 外装（透かすと半透明） */
  box(0.35, 0.1, 1.5, -0.75, 0.05, 0, 0xa9abad, 'feet');
  box(0.35, 0.1, 1.5, 0.75, 0.05, 0, 0xa9abad, 'feet');
  box(1.9, 0.8, 1.2, 0, 0.5, 0, 0x6b7075, 'shell');
  box(0.9, 0.42, 0.02, 0, 0.52, 0.61, 0xededea, 'shell');
  box(2.1, 0.22, 1.4, 0, 1.01, 0, 0x8a4b2e, 'shell');
  box(0.14, 0.45, 1.4, -0.98, 1.34, 0, 0x8a4b2e, 'shell');
  box(0.14, 0.45, 1.4, 0.98, 1.34, 0, 0x8a4b2e, 'shell');
  box(0.12, 0.6, 1.4, 0, 1.42, 0, 0x7a4027, 'shell');
  box(0.55, 0.12, 0.22, 0, 0.04, 0.5, 0x8a4b2e, 'shell');
  /* ヒューズ（前：キャップ＋ボルト＝表、奥：ホルダ＝裏） */
  [-0.5, 0.5].forEach(function (x) {
    cyl(0.1, 0.85, x, 1.3, -0.02, 0xe2e2de, 'z', 'fuse', { seg: 16 });
    cyl(0.14, 0.08, x, 1.3, 0.45, 0xb8b8b4, 'z', 'fuse', { seg: 16 });
    cyl(0.04, 0.1, x, 1.3, 0.53, 0x8e8e8a, 'z', 'fuse', { seg: 10 });
    box(0.24, 0.32, 0.08, x, 1.25, -0.5, 0xa9abad, 'fuse');
  });
  [-0.12, 0.12].forEach(function (x) { cyl(0.04, 0.12, x, 0.04, 0.65, 0xc9cacc, 'z', 'fuse', { seg: 10 }); });
  /* 内部：鉄心・巻線・リード */
  box(1.3, 0.1, 0.5, 0, 0.82, 0, 0x7d8085, 'core');
  box(1.3, 0.1, 0.5, 0, 0.22, 0, 0x7d8085, 'core');
  box(0.1, 0.5, 0.5, -0.6, 0.52, 0, 0x7d8085, 'core');
  box(0.1, 0.5, 0.5, 0.6, 0.52, 0, 0x7d8085, 'core');
  box(0.18, 0.5, 0.5, 0, 0.52, 0, 0x7d8085, 'core');
  cyl(0.2, 0.4, 0, 0.52, 0, 0x378add, 'y', 'scoil', { seg: 20 });
  cyl(0.34, 0.44, 0, 0.52, 0, 0xd85a30, 'y', 'pcoil', { seg: 24, open: true });
  wire([[-0.25, 0.74, -0.22], [-0.38, 1.0, -0.42], [-0.5, 1.09, -0.5]], 0xd85a30, 2.5, 'inner');
  wire([[0.25, 0.74, -0.22], [0.38, 1.0, -0.42], [0.5, 1.09, -0.5]], 0xd85a30, 2.5, 'inner');
  wire([[-0.1, 0.32, 0.18], [-0.12, 0.15, 0.42], [-0.12, 0.05, 0.58]], 0x185fa5, 2.5, 'inner');
  wire([[0.1, 0.32, 0.18], [0.12, 0.15, 0.42], [0.12, 0.05, 0.58]], 0x185fa5, 2.5, 'inner');
  /* 接地板と試験リード */
  box(0.5, 0.04, 0.35, 1.25, -0.02, 1.0, 0x3b6d11, 'solid');
  wire([[0, 2.55, 1.15], [-0.3, 2.0, 0.95], [-0.5, 1.55, 0.72], [-0.5, 1.3, 0.6]], 0xd85a30, 4, 'hv');
  wire([[-0.5, 1.3, 0.6], [-0.25, 1.68, 0.78], [0.25, 1.68, 0.78], [0.5, 1.3, 0.6]], 0xd85a30, 3.5, 'jumper');
  wire([[0.5, 1.3, 0.6], [0.85, 1.1, 0.85], [1.1, 0.45, 1.0], [1.2, 0.0, 1.0]], 0x3b6d11, 3.5, 'vground');
  wire([[-0.12, 0.04, 0.72], [0, 0.0, 0.82], [0.12, 0.04, 0.72]], 0x3b6d11, 3, 'gnd');
  wire([[0, 0.0, 0.82], [0.6, -0.01, 0.95], [1.05, 0.0, 1.0]], 0x3b6d11, 3, 'gnd');
  wire([[0.75, 0.05, 0.75], [1.0, 0.02, 0.95], [1.12, 0.0, 1.0]], 0x3b6d11, 3, 'gnd');

  /* 電流の通り道（モード2） */
  var pathP = curve([[0, 2.55, 1.15], [-0.3, 2.0, 0.95], [-0.5, 1.55, 0.72], [-0.5, 1.3, 0.6], [-0.5, 1.3, 0.0], [-0.5, 1.15, -0.5], [-0.25, 0.74, -0.22], [-0.36, 0.62, 0.05], [0, 0.5, 0.36], [0.36, 0.42, 0.05], [0, 0.6, -0.36], [0.25, 0.74, -0.22], [0.5, 1.15, -0.5], [0.5, 1.3, 0.0], [0.5, 1.3, 0.6], [0.85, 1.1, 0.85], [1.1, 0.45, 1.0], [1.2, 0.0, 1.0]], 12, false);
  var pathS = curve([[-0.12, 0.05, 0.66], [-0.1, 0.32, 0.18], [-0.22, 0.45, 0], [0, 0.55, 0.22], [0.22, 0.45, 0], [0.1, 0.32, 0.18], [0.12, 0.05, 0.66], [0, 0.0, 0.8]], 14, true);
  function at(path, t) { var f = t * (path.length - 1), i = Math.floor(f), r = f - i, a = path[i], b = path[Math.min(i + 1, path.length - 1)]; return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; }
  var dotsP = [], dotsS = [], i;
  for (i = 0; i < 16; i++) dotsP.push(i / 16);
  for (i = 0; i < 22; i++) dotsS.push(i / 22);

  var LABELS = [
    { t: '試験器 HV へ', p: [0, 2.68, 1.15] },
    { t: 'U（表）', p: [-0.78, 1.3, 0.62] },
    { t: 'V（表）', p: [0.78, 1.3, 0.62] },
    { t: 'U–V 短絡', p: [0, 1.88, 0.78], m: 0 },
    { t: 'V端は浮き', p: [0.98, 1.5, 0.62], m: 1 },
    { t: 'V端が大地に接触', p: [1.25, 0.78, 1.0], m: 2, hot: 1 },
    { t: '接地', p: [1.3, -0.2, 1.0] },
    { t: '二次 短絡', p: [-0.4, -0.14, 0.82] },
    { t: '一次巻線', p: [-0.62, 0.55, 0.42], x: 1 },
    { t: '二次巻線', p: [0.32, 0.27, 0.42], x: 1 }
  ];
  LABELS.forEach(function (o) { var e = document.createElement('div'); e.className = 'lb' + (o.hot ? ' hot' : ''); e.textContent = o.t; lblBox.appendChild(e); o.e = e; });

  var VERDICT = [
    ['ok', 'U–V短絡：正しい結線', '一次巻線の両端が同じ電位。巻線に電圧がかからず、一次と大地（外箱・鉄心・二次）のあいだの絶縁だけに試験電圧がかかる。'],
    ['warn', 'Uだけ・V浮き：通ってしまうことがある', '一次巻線と浮遊容量が直列になり、電圧の大部分は浮遊容量側へ。巻線にかかる電圧は小さいが、Vの先の静電容量しだいで大きくなることもあり、確実ではない。'],
    ['ng', 'Uだけ・V接地：VTを動かしてしまう', '一次巻線の両端に10,350V（定格6,600Vの約1.6倍）。二次は短絡・接地しているので、二次を短絡したまま一次を励磁する状態になり、定格を大きく超える電流が流れうる。焼損や試験器の過電流トリップにつながる。']
  ];

  /* ---------- 状態 ---------- */
  var CTR = [0.15, 1.0, 0.25];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { yaw: -0.5, pitch: 0.28, dist: 7.8, mode: 0, xray: true, auto: !reduce, dirty: true, t: 0 };
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
  function rot(n) {
    var x1 = n[0] * cy + n[2] * sy, z1 = -n[0] * sy + n[2] * cy;
    return [x1, n[1] * cp - z1 * sp, n[1] * sp + z1 * cp];
  }
  function F() { return Math.min(H, W * 0.95) * 0.33 * 7; }
  function proj(v) { var s = F() / (st.dist - v[2]); return [W / 2 + v[0] * s, H / 2 - v[1] * s, s]; }

  var LIGHT = norm([0.35, 0.75, 0.6]);
  var HOT = [226, 75, 74];
  function visible(g) {
    if (g === 'core' || g === 'scoil' || g === 'pcoil' || g === 'inner') return st.xray;
    if (g === 'jumper') return st.mode === 0;
    if (g === 'vground') return st.mode === 2;
    return true;
  }
  function alphaOf(g) {
    if (g === 'shell') return st.xray ? 0.13 : 1;
    if (g === 'pcoil') return 0.62;
    return 1;
  }
  function hotK(g) {
    if (st.mode !== 2) return 0;
    var k = reduce ? 0.5 : 0.35 + 0.3 * Math.sin(st.t * 6);
    if (g === 'pcoil' || g === 'scoil') return k + 0.15;
    if (g === 'core') return k * 0.5;
    return 0;
  }

  function draw() {
    cy = Math.cos(st.yaw); sy = Math.sin(st.yaw); cp = Math.cos(st.pitch); sp = Math.sin(st.pitch);
    ctx.clearRect(0, 0, W, H);
    var items = [];
    var cam = [0, 0, st.dist];
    polys.forEach(function (q) {
      if (!visible(q.g)) return;
      var vs = q.p.map(tf), n = rot(q.n), fc = [0, 0, 0];
      vs.forEach(function (v) { fc = add3(fc, v); });
      fc = mul(fc, 1 / vs.length);
      var facing = dot(n, sub(cam, fc));
      if (facing < 0) { if (!q.ds) return; n = mul(n, -1); }
      var a = alphaOf(q.g);
      var sh = 0.52 + 0.48 * Math.max(0, dot(n, LIGHT));
      var c = q.c, k = hotK(q.g);
      if (k) c = [c[0] + (HOT[0] - c[0]) * k, c[1] + (HOT[1] - c[1]) * k, c[2] + (HOT[2] - c[2]) * k];
      items.push({ k: 'p', z: fc[2], s: vs.map(proj), col: 'rgba(' + Math.round(c[0] * sh) + ',' + Math.round(c[1] * sh) + ',' + Math.round(c[2] * sh) + ',' + a + ')', a: a });
    });
    lines.forEach(function (l) {
      if (!visible(l.g)) return;
      var a = tf(l.a), b = tf(l.b), pa = proj(a), pb = proj(b);
      var c = l.c;
      if (st.mode === 2 && (l.g === 'inner' || l.g === 'vground')) c = [Math.min(255, c[0] + 30), c[1], c[2]];
      items.push({ k: 'l', z: (a[2] + b[2]) / 2 + 0.02, s: [pa, pb], col: 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')', w: l.w * pa[2] / 70 });
    });
    if (st.mode === 2) {
      dotsP.forEach(function (t) { var v = tf(at(pathP, t)); items.push({ k: 'd', z: v[2] + 0.05, s: [proj(v)] }); });
      dotsS.forEach(function (t) { var v = tf(at(pathS, t)); items.push({ k: 'd', z: v[2] + 0.05, s: [proj(v)] }); });
    }
    items.sort(function (p, q) { return p.z - q.z; });
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    items.forEach(function (it) {
      if (it.k === 'p') {
        ctx.beginPath();
        ctx.moveTo(it.s[0][0], it.s[0][1]);
        for (var j = 1; j < it.s.length; j++) ctx.lineTo(it.s[j][0], it.s[j][1]);
        ctx.closePath();
        ctx.fillStyle = it.col; ctx.fill();
        if (it.a === 1) { ctx.strokeStyle = it.col; ctx.lineWidth = 0.6; ctx.stroke(); }
      } else if (it.k === 'l') {
        ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]); ctx.lineTo(it.s[1][0], it.s[1][1]);
        ctx.strokeStyle = it.col; ctx.lineWidth = Math.max(1.2, it.w); ctx.stroke();
      } else {
        var r = Math.max(2.5, it.s[0][2] * 0.035);
        ctx.beginPath(); ctx.arc(it.s[0][0], it.s[0][1], r, 0, Math.PI * 2);
        ctx.fillStyle = '#f2b233'; ctx.fill(); ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 0.8; ctx.stroke();
      }
    });
    LABELS.forEach(function (o) {
      var show = (!o.x || st.xray) && (o.m === undefined || o.m === st.mode);
      if (!show) { o.e.style.display = 'none'; return; }
      var s = proj(tf(o.p));
      o.e.style.display = 'block'; o.e.style.left = s[0] + 'px'; o.e.style.top = s[1] + 'px';
    });
  }

  /* ---------- 操作 ---------- */
  var btns = document.querySelectorAll('[data-mode]');
  var vbox = document.getElementById('vt3dVerdict');
  function setMode(m) {
    st.mode = m; st.dirty = true;
    Array.prototype.forEach.call(btns, function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-mode')) === m)); });
    vbox.className = 'verdict ' + VERDICT[m][0];
    document.getElementById('vt3dVerdictTitle').textContent = VERDICT[m][1];
    document.getElementById('vt3dVerdictText').textContent = VERDICT[m][2];
  }
  Array.prototype.forEach.call(btns, function (b) { b.addEventListener('click', function () { setMode(Number(b.getAttribute('data-mode'))); }); });
  var bx = document.getElementById('vt3dXray'), ba = document.getElementById('vt3dAuto');
  function setX(v) { st.xray = v; st.dirty = true; bx.textContent = v ? '外装を戻す' : '中を透かす'; }
  function setA(v) { st.auto = v; ba.textContent = v ? '自動回転を止める' : '自動回転する'; }
  bx.addEventListener('click', function () { setX(!st.xray); });
  ba.addEventListener('click', function () { setA(!st.auto); });
  document.getElementById('vt3dReset').addEventListener('click', function () { st.yaw = 0; st.pitch = 0.15; st.dist = 7.8; st.dirty = true; setA(false); });

  var ptrs = {}, last = null, pinch = 0;
  function pts() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
  cv.addEventListener('pointerdown', function (e) {
    ptrs[e.pointerId] = [e.clientX, e.clientY]; setA(false); cv.classList.add('drag');
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    var p = pts(); if (p.length === 2) pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); last = [e.clientX, e.clientY];
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = [e.clientX, e.clientY];
    var p = pts();
    if (p.length === 2) {
      var d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]);
      if (pinch) st.dist = Math.max(4, Math.min(12, st.dist * pinch / d));
      pinch = d;
    } else if (last) {
      st.yaw += (e.clientX - last[0]) * 0.01;
      st.pitch = Math.max(-1.3, Math.min(1.3, st.pitch + (e.clientY - last[1]) * 0.01));
      last = [e.clientX, e.clientY];
    }
    st.dirty = true;
  });
  function up(e) { delete ptrs[e.pointerId]; pinch = 0; var p = pts(); last = p.length ? p[0] : null; if (!p.length) cv.classList.remove('drag'); }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); st.dist = Math.max(4, Math.min(12, st.dist + e.deltaY * 0.004)); st.dirty = true; }, { passive: false });

  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap); else window.addEventListener('resize', resize);
  resize(); setX(true); setA(st.auto); setMode(0);

  var prev = 0;
  function loop(ts) {
    var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016; prev = ts;
    st.t += dt;
    if (st.auto) { st.yaw += dt * 0.3; st.dirty = true; }
    if (st.mode === 2) {
      var sp1 = reduce ? 0.03 : 0.15, sp2 = reduce ? 0.12 : 0.7;
      dotsP = dotsP.map(function (t) { return (t + dt * sp1) % 1; });
      dotsS = dotsS.map(function (t) { return (t + dt * sp2) % 1; });
      st.dirty = true;
    }
    if (st.dirty && W > 0) { draw(); st.dirty = false; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.__vt3d = { setMode: setMode, state: st };
})();
