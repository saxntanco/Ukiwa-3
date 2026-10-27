/* 360°で見る高圧機器：共通エンジン（外部ライブラリなし・canvas 2D）
   表現のきまり
   ・電圧（充電している導体）＝導体を橙色に塗る
   ・電流＝黄色の粒と矢印（向きつき）。流れる条件は各ステップの文で示す
   ・磁束＝鉄心の上の青い破線ループ
   ・内部の「模式」は実機の配置ではない。画面上部の帯で常に示す */
(function () {
  'use strict';
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function len(a) { return Math.hypot(a[0], a[1], a[2]); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hex(c) { return typeof c === 'number' ? [(c >> 16) & 255, (c >> 8) & 255, c & 255] : c; }
  function mix(c, d, k) { return [c[0] + (d[0] - c[0]) * k, c[1] + (d[1] - c[1]) * k, c[2] + (d[2] - c[2]) * k]; }
  function ease(v) { v = v < 0 ? 0 : v > 1 ? 1 : v; return v * v * (3 - 2 * v); }
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html !== undefined) e.innerHTML = html; return e; }

  /* ---------- 形をつくる道具 ---------- */
  function Builder() {
    this.polys = []; this.lines = []; this.flows = []; this.fluxes = [];
  }
  Builder.prototype.poly = function (pts, col, m, center, ds) {
    var n = norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
    if (center) {
      var fc = [0, 0, 0]; pts.forEach(function (p) { fc = add(fc, p); }); fc = mul(fc, 1 / pts.length);
      if (dot(n, sub(fc, center)) < 0) { pts = pts.slice().reverse(); n = mul(n, -1); }
    }
    this.polys.push({ p: pts, n: n, c: hex(col), m: m || {}, ds: !!ds });
  };
  Builder.prototype.grid = function (o, u, v, col, m, center) {
    var nu = Math.max(1, Math.ceil(len(u) / 0.22)), nv = Math.max(1, Math.ceil(len(v) / 0.22));
    var du = mul(u, 1 / nu), dv = mul(v, 1 / nv);
    for (var i = 0; i < nu; i++) for (var j = 0; j < nv; j++) {
      var c = add(add(o, mul(du, i)), mul(dv, j));
      this.poly([c, add(c, du), add(add(c, du), dv), add(c, dv)], col, m, center);
    }
  };
  Builder.prototype.box = function (w, h, d, x, y, z, col, m) {
    var hw = w / 2, hh = h / 2, hd = d / 2, c = [x, y, z];
    this.grid([x + hw, y - hh, z + hd], [0, 0, -d], [0, h, 0], col, m, c);
    this.grid([x - hw, y - hh, z - hd], [0, 0, d], [0, h, 0], col, m, c);
    this.grid([x - hw, y + hh, z + hd], [w, 0, 0], [0, 0, -d], col, m, c);
    this.grid([x - hw, y - hh, z - hd], [w, 0, 0], [0, 0, d], col, m, c);
    this.grid([x - hw, y - hh, z + hd], [w, 0, 0], [0, h, 0], col, m, c);
    this.grid([x + hw, y - hh, z - hd], [-w, 0, 0], [0, h, 0], col, m, c);
  };
  /* 軸方向の円柱（axis: 'x' | 'y' | 'z'）。opts.r2 で先細り、opts.open で側面だけ */
  Builder.prototype.cyl = function (r, L, x, y, z, col, axis, m, opts) {
    opts = opts || {};
    var seg = opts.seg || 16, c = [x, y, z], hl = L / 2, r2 = opts.r2 === undefined ? r : opts.r2, self = this;
    function P(a, s, rr) { var u = rr * Math.cos(a), v = rr * Math.sin(a); return axis === 'x' ? [x + s, y + u, z + v] : axis === 'z' ? [x + u, y + v, z + s] : [x + u, y + s, z + v]; }
    var top = [], bot = [];
    for (var k = 0; k < seg; k++) {
      var a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2;
      self.poly([P(a0, -hl, r), P(a1, -hl, r), P(a1, hl, r2), P(a0, hl, r2)], col, m, c, opts.open);
      top.push(P(a0, hl, r2)); bot.push(P(a0, -hl, r));
    }
    if (!opts.open) { this.poly(top, col, m, c); this.poly(bot, col, m, c); }
  };
  /* 2点を結ぶ多角柱 */
  Builder.prototype.rod = function (a, b, r, col, m, sides) {
    sides = sides || 6;
    var d = sub(b, a), L = len(d) || 1e-6, u = mul(d, 1 / L), t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    var p = norm(cross(u, t)), q = norm(cross(u, p)), c = mul(add(a, b), 0.5), ring = [], k;
    for (k = 0; k < sides; k++) { var an = k / sides * Math.PI * 2; ring.push(add(mul(p, Math.cos(an) * r), mul(q, Math.sin(an) * r))); }
    for (k = 0; k < sides; k++) { var r0 = ring[k], r1 = ring[(k + 1) % sides]; this.poly([add(a, r0), add(a, r1), add(b, r1), add(b, r0)], col, m, c); }
    this.poly(ring.map(function (o) { return add(b, o); }), col, m, c);
    this.poly(ring.map(function (o) { return add(a, o); }), col, m, c);
  };
  Builder.prototype.wire = function (pts, col, w, m, smooth) {
    var c = smooth === false ? pts : curve(pts, 8, false), rgb = hex(col);
    for (var i = 0; i < c.length - 1; i++) this.lines.push({ a: c[i], b: c[i + 1], c: rgb, w: w, m: m || {} });
  };
  /* コイル（らせん）：中心・軸方向・半径・長さ・巻数 */
  Builder.prototype.helix = function (ctr, axis, r, L, turns, col, w, m) {
    var pts = [], n = Math.max(24, Math.round(turns * 18));
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = t * turns * Math.PI * 2, s = (t - 0.5) * L, u = r * Math.cos(a), v = r * Math.sin(a);
      pts.push(axis === 'x' ? [ctr[0] + s, ctr[1] + u, ctr[2] + v] : axis === 'z' ? [ctr[0] + u, ctr[1] + v, ctr[2] + s] : [ctr[0] + u, ctr[1] + s, ctr[2] + v]);
    }
    this.wire(pts, col, w, m, false);
  };
  /* 電流の粒。pts は往路の向きに並べる */
  Builder.prototype.flow = function (pts, opt) { opt = opt || {}; var p = curve(pts, 6, !!opt.closed); this.flows.push({ path: p, L: plen(p), n: opt.n, sp: opt.speed || 0.5, col: opt.col || 'cur', m: opt.m || {}, closed: !!opt.closed }); };
  /* 磁束のループ（閉じた形） */
  Builder.prototype.flux = function (pts, opt) { opt = opt || {}; var p = curve(pts, 6, true); this.fluxes.push({ path: p, L: plen(p), sp: opt.speed || 0.6, m: opt.m || {}, w: opt.w || 2.2 }); };

  function curve(pts, n, closed) {
    var out = [], m = pts.length, seg = closed ? m : m - 1;
    if (m < 2) return pts.slice();
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
  function plen(p) { var L = 0; for (var i = 1; i < p.length; i++) L += len(sub(p[i], p[i - 1])); return L; }
  function at(p, t) {
    var f = t * (p.length - 1), i = Math.floor(f), r = f - i, a = p[i], b = p[Math.min(i + 1, p.length - 1)];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r];
  }

  /* ---------- 画面 ---------- */
  var MODES = [['ext', '外観', '形と端子'], ['int', '内部', 'つながり'], ['op', '動作', '順番に見る'], ['wire', '結線', '回路図']];

  function mount(root, model) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hv = el('div', { class: 'hv', 'data-mode': 'ext' });
    var tabs = el('div', { class: 'hv-tabs', role: 'group', 'aria-label': '表示の切り替え' });
    MODES.forEach(function (m) { var b = el('button', { type: 'button', 'data-mode': m[0], 'aria-pressed': 'false' }, m[1] + '<small>' + m[2] + '</small>'); tabs.appendChild(b); });
    var stage = el('div', { class: 'hv-stage' });
    var cwrap = el('div', { class: 'hv-canvas' });
    var cv = el('canvas', { 'aria-label': model.title + 'の3Dモデル。ドラッグで回転、2本指で拡大、部品をタップで説明' });
    var lbls = el('div', { class: 'hv-lbls' });
    var banner = el('div', { class: 'hv-banner' });
    var hint = el('div', { class: 'hv-hint' }, 'ドラッグで回転・2本指／ホイールで拡大・部品をタップ');
    var msg = el('div', { class: 'hv-msg' }, 'この端末では3Dを表示できませんでした。「結線」と下の説明で同じ内容を確認できます。');
    cwrap.appendChild(cv); cwrap.appendChild(lbls); cwrap.appendChild(banner); cwrap.appendChild(hint); cwrap.appendChild(msg);
    var wire = el('div', { class: 'hv-wire' });
    stage.appendChild(cwrap); stage.appendChild(wire);
    var legend = el('div', { class: 'hv-legend' }, '<span><i class="volt"></i>電圧がかかっている導体</span><span><i class="cur"></i>電流（粒の向き）</span><span><i class="flux"></i>磁束</span><span><i class="gnd"></i>接地</span>');
    var tools = el('div', { class: 'hv-tools' });
    var op = el('div', { class: 'hv-op', hidden: '' });
    var scen = el('div', { class: 'hv-scen', role: 'group', 'aria-label': '場面' });
    var bar = el('div', { class: 'hv-stepbar' });
    var bPrev = el('button', { type: 'button', class: 'sub', 'aria-label': '前の段階' }, '◀');
    var bNext = el('button', { type: 'button', 'aria-label': '次の段階' }, '次へ ▶');
    var bReset = el('button', { type: 'button', class: 'sub' }, '↺ 最初から');
    var cnt = el('span', { class: 'cnt' });
    bar.appendChild(bPrev); bar.appendChild(bNext); bar.appendChild(bReset); bar.appendChild(cnt);
    var stepBox = el('div', { class: 'hv-step ok', 'aria-live': 'polite' });
    op.appendChild(scen); op.appendChild(bar); op.appendChild(stepBox);
    var info = el('div', { class: 'hv-info', hidden: '', 'aria-live': 'polite' });
    var parts = el('div', { class: 'hv-parts', 'aria-label': '部品を選んで説明を見る' });
    hv.appendChild(tabs); hv.appendChild(stage); hv.appendChild(legend); hv.appendChild(tools); hv.appendChild(op); hv.appendChild(info); hv.appendChild(parts);
    root.innerHTML = ''; root.appendChild(hv);
    var svgSrc = model.svg && document.querySelector(model.svg);
    var svg = null;
    if (svgSrc) { svg = svgSrc.content ? svgSrc.content.firstElementChild.cloneNode(true) : svgSrc; wire.appendChild(svg); }

    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) { msg.style.display = 'flex'; }

    /* 状態 */
    var S = {
      mode: 'ext', yaw: model.view ? model.view.yaw : -0.6, pitch: model.view ? model.view.pitch : 0.3, zoom: 1, target: null,
      auto: false, sel: null, scen: 0, step: 0, st: JSON.parse(JSON.stringify(model.initial || {})), tw: null, dirty: true, t: 0
    };
    var B = new Builder(), R = 1, CTR0 = [0, 0, 0];
    function rebuild() {
      B = new Builder();
      model.build(B, S.st, S.mode);
      S.dirty = true;
    }
    /* 外形から大きさを決める */
    (function fit() {
      var b0 = new Builder(); model.build(b0, S.st, 'ext');
      var mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      function acc(p) { for (var i = 0; i < 3; i++) { if (p[i] < mn[i]) mn[i] = p[i]; if (p[i] > mx[i]) mx[i] = p[i]; } }
      b0.polys.forEach(function (q) { if (!q.m.layer || q.m.layer === 'ext') q.p.forEach(acc); });
      b0.lines.forEach(function (l) { if (!l.m.layer || l.m.layer === 'ext') { acc(l.a); acc(l.b); } });
      CTR0 = mul(add(mn, mx), 0.5); R = Math.max(0.3, len(sub(mx, mn)) / 2);
      S.target = model.view && model.view.target ? model.view.target.slice() : CTR0.slice();
    })();

    var W = 0, H = 0, DPR = 1;
    function resize() { DPR = Math.min(window.devicePixelRatio || 1, 2); W = cwrap.clientWidth; H = cwrap.clientHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0); S.dirty = true; }
    var cy, sy, cp, sp, dist, focal;
    function tf(p) {
      var x = p[0] - S.target[0], y = p[1] - S.target[1], z = p[2] - S.target[2];
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
    }
    function rot(n) { var x1 = n[0] * cy + n[2] * sy, z1 = -n[0] * sy + n[2] * cy; return [x1, n[1] * cp - z1 * sp, n[1] * sp + z1 * cp]; }
    function proj(v) { var s = focal / Math.max(0.05, dist - v[2]); return [W / 2 + v[0] * s, H / 2 - v[1] * s, s]; }
    var LIGHT = norm([0.35, 0.75, 0.6]), SEL = [22, 160, 176];
    function visible(m) {
      if (m.layer === 'int' && S.mode === 'ext') return false;
      if (m.layer === 'ext-only' && S.mode !== 'ext') return false;
      return true;
    }
    function shade(c, m) {
      if (model.tint) { var t = model.tint(m, S.st, S.mode); if (t) c = mix(c, hex(t.c), t.k); }
      if (S.sel && m.part === S.sel) c = mix(c, SEL, 0.5);
      return c;
    }
    function alphaOf(m) {
      var a = 1;
      if (m.shell && S.mode !== 'ext') a = m.shellAlpha || 0.12;
      if (m.alpha) a = Math.min(a, m.alpha);
      if (S.sel && m.part !== S.sel && S.mode !== 'ext' && !m.shell) a *= 0.55;
      return a;
    }
    var drawn = [];
    function draw() {
      cy = Math.cos(S.yaw); sy = Math.sin(S.yaw); cp = Math.cos(S.pitch); sp = Math.sin(S.pitch);
      dist = R * 3.6 / S.zoom; focal = 0.5 * Math.min(W, H) / R * (R * 3.6);
      ctx.clearRect(0, 0, W, H);
      var items = [], cam = [0, 0, dist];
      B.polys.forEach(function (q) {
        if (!visible(q.m)) return;
        var vs = q.p.map(tf), n = rot(q.n), fc = [0, 0, 0];
        vs.forEach(function (v) { fc = add(fc, v); }); fc = mul(fc, 1 / vs.length);
        if (dot(n, sub(cam, fc)) < 0) { if (!q.ds) return; n = mul(n, -1); }
        var a = alphaOf(q.m), sh = 0.55 + 0.45 * Math.max(0, dot(n, LIGHT)), c = shade(q.c, q.m);
        items.push({ k: 'p', z: fc[2] + (q.m.zb || 0), s: vs.map(proj), col: 'rgba(' + Math.round(c[0] * sh) + ',' + Math.round(c[1] * sh) + ',' + Math.round(c[2] * sh) + ',' + a + ')', a: a, m: q.m });
      });
      B.lines.forEach(function (l) {
        if (!visible(l.m)) return;
        var a = tf(l.a), b = tf(l.b), pa = proj(a), c = shade(l.c, l.m), al = alphaOf(l.m);
        items.push({ k: 'l', z: (a[2] + b[2]) / 2 + 0.01 + (l.m.zb || 0), s: [pa, proj(b)], col: 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + al + ')', w: Math.max(1.1, l.w * pa[2] / (focal / (R * 3.6)) / 90), m: l.m, a: al });
      });
      if (S.mode !== 'ext') {
        B.fluxes.forEach(function (f) {
          if (!visible(f.m)) return;
          var off = (S.t * f.sp / f.L) % 1, pts = f.path.map(function (p) { return proj(tf(p)); }), zz = 0;
          f.path.forEach(function (p) { zz += tf(p)[2]; });
          items.push({ k: 'f', z: zz / f.path.length + 0.05, s: pts, off: off, w: f.w, m: f.m, arrows: [0.12, 0.45, 0.78].map(function (t) { var t2 = (t + off) % 1; return [proj(tf(at(f.path, t2))), proj(tf(at(f.path, (t2 + 0.01) % 1)))]; }) });
        });
        B.flows.forEach(function (f) {
          if (!visible(f.m)) return;
          var n = f.n || Math.max(4, Math.round(f.L * 7)), off = (S.t * f.sp / Math.max(0.2, f.L)) % 1;
          for (var i = 0; i < n; i++) {
            var t = (i / n + off) % 1, p = tf(at(f.path, t)), q = tf(at(f.path, Math.min(1, t + 0.008)));
            items.push({ k: 'd', z: p[2] + 0.04, s: [proj(p), proj(q)], col: f.col, m: f.m, head: i % 3 === 0 });
          }
        });
      }
      items.sort(function (p, q) { return p.z - q.z; });
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      items.forEach(function (it) {
        if (it.k === 'p') {
          ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]);
          for (var j = 1; j < it.s.length; j++) ctx.lineTo(it.s[j][0], it.s[j][1]);
          ctx.closePath(); ctx.fillStyle = it.col; ctx.fill();
          if (it.a >= 0.99) { ctx.strokeStyle = it.col; ctx.lineWidth = 0.6; ctx.stroke(); }
        } else if (it.k === 'l') {
          ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]); ctx.lineTo(it.s[1][0], it.s[1][1]);
          ctx.strokeStyle = it.col; ctx.lineWidth = it.w; ctx.stroke();
        } else if (it.k === 'f') {
          ctx.save(); ctx.setLineDash([7, 6]); ctx.lineDashOffset = -it.off * 60;
          ctx.beginPath(); ctx.moveTo(it.s[0][0], it.s[0][1]);
          for (var k = 1; k < it.s.length; k++) ctx.lineTo(it.s[k][0], it.s[k][1]);
          ctx.strokeStyle = 'rgba(47,111,208,.9)'; ctx.lineWidth = it.w; ctx.stroke(); ctx.restore();
          it.arrows.forEach(function (ar) { arrow(ar[0], ar[1], 'rgba(47,111,208,.95)', 7); });
        } else {
          var r = Math.max(2.6, Math.min(6, it.s[0][2] / (focal / (R * 3.6)) * 0.035));
          var red = it.col === 'bad';
          if (it.head) arrow(it.s[0], it.s[1], red ? '#e24b4a' : '#d9921a', r * 2.4);
          else { ctx.beginPath(); ctx.arc(it.s[0][0], it.s[0][1], r, 0, Math.PI * 2); ctx.fillStyle = red ? '#e24b4a' : '#f2b233'; ctx.fill(); ctx.strokeStyle = red ? '#fff' : '#8a5a00'; ctx.lineWidth = 0.9; ctx.stroke(); }
        }
      });
      drawn = items;
      placeLabels();
    }
    function arrow(p, q, col, size) {
      var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      ctx.beginPath(); ctx.moveTo(p[0] + dx * size * 0.6, p[1] + dy * size * 0.6);
      ctx.lineTo(p[0] - dx * size * 0.5 - dy * size * 0.45, p[1] - dy * size * 0.5 + dx * size * 0.45);
      ctx.lineTo(p[0] - dx * size * 0.5 + dy * size * 0.45, p[1] - dy * size * 0.5 - dx * size * 0.45);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8; ctx.stroke();
    }

    /* ---------- ラベル：裏側は出さない・重ならない ---------- */
    var LB = (model.labels || []).map(function (o) { var e = el('div', { class: 'hv-lb' + (o.hot ? ' hot' : '') }); e.textContent = o.t; e.style.display = 'none'; lbls.appendChild(e); return { o: o, e: e, w: 0, h: 0 }; });
    function placeLabels() {
      var cand = [];
      LB.forEach(function (L) {
        var o = L.o, show = true;
        if (o.layer === 'int' && S.mode === 'ext') show = false;
        if (o.layer === 'ext-only' && S.mode !== 'ext') show = false;
        if (o.modes && o.modes.indexOf(S.mode) < 0) show = false;
        if (o.when && !o.when(S.st, S.mode)) show = false;
        if (S.mode === 'wire') show = false;
        var v = show ? tf(o.p) : null;
        if (show && !o.always) { var back = S.mode === 'ext' ? -0.12 : -0.4; if (v[2] < back * R) show = false; }
        if (!show) { L.e.style.display = 'none'; return; }
        var s = proj(v);
        if (s[0] < 4 || s[0] > W - 4 || s[1] < 4 || s[1] > H - 4) { L.e.style.display = 'none'; return; }
        L.e.classList.toggle('sel', !!(S.sel && o.part === S.sel));
        cand.push({ L: L, s: s, pr: (S.sel && o.part === S.sel ? 3 : 0) + (o.hot ? 2 : 0) + v[2] / R });
      });
      cand.sort(function (a, b) { return b.pr - a.pr; });
      var placed = [];
      cand.forEach(function (c) {
        var L = c.L;
        if (!L.w) { L.e.style.display = 'block'; L.w = L.e.offsetWidth; L.h = L.e.offsetHeight; }
        var x = Math.max(L.w / 2 + 2, Math.min(W - L.w / 2 - 2, c.s[0])), y = Math.max(L.h / 2 + 2, Math.min(H - L.h / 2 - 2, c.s[1]));
        var r = [x - L.w / 2 - 2, y - L.h / 2 - 2, x + L.w / 2 + 2, y + L.h / 2 + 2];
        var hit = placed.some(function (p) { return !(r[2] < p[0] || r[0] > p[2] || r[3] < p[1] || r[1] > p[3]); });
        if (hit) { L.e.style.display = 'none'; return; }
        placed.push(r);
        L.e.style.display = 'block'; L.e.style.transform = 'translate(' + (x - L.w / 2) + 'px,' + (y - L.h / 2) + 'px)';
      });
    }

    /* ---------- 帯（今見ているものが実機どおりか） ---------- */
    function setBanner() {
      var b = model.banner || {}, t = b[S.mode] || [];
      banner.innerHTML = t.map(function (x) { return '<span class="' + (x[0] === '!' ? 'schem' : '') + '">' + x.replace(/^!/, '') + '</span>'; }).join('');
    }

    /* ---------- 部品の説明 ---------- */
    var EVN = { doc: '資料で確認', simp: '簡略化・拡大', unk: '未確認' };
    var order = model.partOrder || Object.keys(model.parts);
    order.forEach(function (id) { var b = el('button', { type: 'button', 'data-part': id, 'aria-pressed': 'false' }); b.textContent = model.parts[id].name; parts.appendChild(b); });
    function select(id) {
      S.sel = id || null; S.dirty = true;
      Array.prototype.forEach.call(parts.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === S.sel)); });
      if (svg) Array.prototype.forEach.call(svg.querySelectorAll('[data-part]'), function (n) { n.classList.toggle('hv-sel', n.getAttribute('data-part') === S.sel); });
      if (!id) { info.hidden = true; return; }
      var P = model.parts[id];
      if (!P) return;
      var links = (P.links || []).filter(function (k) { return model.parts[k]; });
      info.innerHTML = '<button type="button" class="x" aria-label="説明を閉じる">×</button><h3></h3><p class="role"></p>' + (links.length ? '<p style="margin:0;font-size:13px;font-weight:700">つながる相手</p><div class="hv-links"></div>' : '') + '<p class="ev"><span class="hv-ev ' + (P.ev || 'unk') + '">' + EVN[P.ev || 'unk'] + '</span><span class="note"></span></p>';
      info.querySelector('h3').textContent = P.name;
      info.querySelector('.role').textContent = P.role;
      info.querySelector('.note').textContent = P.note || '';
      var lk = info.querySelector('.hv-links');
      links.forEach(function (k) { var b = el('button', { type: 'button' }); b.textContent = model.parts[k].name + (P.via && P.via[k] ? '（' + P.via[k] + '）' : ''); b.addEventListener('click', function () { select(k); }); lk.appendChild(b); });
      info.querySelector('.x').addEventListener('click', function () { select(null); });
      info.hidden = false;
      if (P.layer === 'int' && S.mode === 'ext') setMode('int');
    }
    parts.addEventListener('click', function (e) { var b = e.target.closest('[data-part]'); if (b) select(b.getAttribute('data-part') === S.sel ? null : b.getAttribute('data-part')); });
    if (svg) svg.addEventListener('click', function (e) { var n = e.target.closest('[data-part]'); select(n ? n.getAttribute('data-part') : null); });

    /* ---------- 動作（段階） ---------- */
    var SC = model.scenarios || [];
    SC.forEach(function (s, i) { var b = el('button', { type: 'button', 'aria-pressed': String(i === 0) }); b.textContent = s.name; b.addEventListener('click', function () { setScen(i); }); scen.appendChild(b); });
    if (SC.length < 2) scen.style.display = 'none';
    function stepState(si, k) {
      var s = SC[si], st = JSON.parse(JSON.stringify(model.initial || {}));
      for (var i = 0; i <= k; i++) { var d = s.steps[i].st || {}; for (var key in d) st[key] = d[key]; }
      return st;
    }
    function renderStep() {
      if (!SC.length) return;
      var s = SC[S.scen], st = s.steps[S.step];
      stepBox.className = 'hv-step ' + (st.s || 'ok');
      var h = '<b>' + (S.step + 1) + '. ' + st.t + '</b><p>' + st.x + '</p>';
      if (model.stateList) { h += '<ul class="hv-states">' + model.stateList(stepState(S.scen, S.step)).map(function (r) { return '<li' + (r[2] ? ' class="on"' : '') + '>' + r[0] + '：<b>' + r[1] + '</b></li>'; }).join('') + '</ul>'; }
      if (st.hz) h += '<p class="hv-hazard">⚠ ' + st.hz + '</p>';
      stepBox.innerHTML = h;
      cnt.textContent = (S.step + 1) + ' / ' + s.steps.length;
      bPrev.disabled = S.step === 0; bNext.disabled = S.step === s.steps.length - 1;
      Array.prototype.forEach.call(scen.children, function (b, i) { b.setAttribute('aria-pressed', String(i === S.scen)); });
    }
    function goStep(k, instant) {
      var to = stepState(S.scen, k), from = JSON.parse(JSON.stringify(S.st));
      S.step = k; renderStep();
      if (instant || reduce) { S.st = to; S.tw = null; rebuild(); updSvg(); return; }
      S.tw = { from: from, to: to, t: 0 };
      updSvg(to);
    }
    function setScen(i) { S.scen = i; goStep(0, true); }
    bPrev.addEventListener('click', function () { if (S.step > 0) goStep(S.step - 1); });
    bNext.addEventListener('click', function () { if (S.step < SC[S.scen].steps.length - 1) goStep(S.step + 1); });
    bReset.addEventListener('click', function () { goStep(0, true); });
    function updSvg(st) { if (svg && model.svgUpdate) model.svgUpdate(svg, st || S.st); }

    /* ---------- 表示の切り替え ---------- */
    function setMode(m) {
      S.mode = m; hv.setAttribute('data-mode', m);
      Array.prototype.forEach.call(tabs.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === m)); });
      op.hidden = !(m === 'op' || m === 'wire') || !SC.length;
      legend.style.display = m === 'ext' ? 'none' : '';
      var mv = model.modeView && model.modeView[m];
      if (mv) { S.zoom = mv.zoom || 1; S.target = mv.target ? mv.target.slice() : CTR0.slice(); if (mv.yaw != null) { S.yaw = mv.yaw; S.pitch = mv.pitch; } }
      else if (model.modeView) { S.zoom = 1; S.target = model.view && model.view.target ? model.view.target.slice() : CTR0.slice(); }
      setBanner(); rebuild(); updSvg();
      if (m === 'wire') LB.forEach(function (L) { L.e.style.display = 'none'; });
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('[data-mode]'); if (b) setMode(b.getAttribute('data-mode')); });

    /* ---------- 視点 ---------- */
    var views = model.views || {};
    Object.keys(views).forEach(function (k) {
      var b = el('button', { type: 'button' }); b.textContent = views[k].label;
      b.addEventListener('click', function () { var v = views[k]; S.yaw = v.yaw; S.pitch = v.pitch; S.zoom = v.zoom || 1; S.target = v.target ? v.target.slice() : CTR0.slice(); S.auto = false; bAuto.setAttribute('aria-pressed', 'false'); S.dirty = true; });
      tools.appendChild(b);
    });
    var bAuto = el('button', { type: 'button', 'aria-pressed': 'false' }, '自動回転');
    bAuto.addEventListener('click', function () { S.auto = !S.auto; bAuto.setAttribute('aria-pressed', String(S.auto)); });
    tools.appendChild(bAuto);

    /* ---------- 指とマウス ---------- */
    var ptrs = {}, last = null, pinch = 0, moved = 0, downAt = null;
    function pts() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
    cv.addEventListener('pointerdown', function (e) {
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      var p = pts(); if (p.length === 2) { pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); moved = 99; }
      last = [e.clientX, e.clientY]; if (p.length === 1) { moved = 0; downAt = [e.clientX, e.clientY]; }
    });
    cv.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = [e.clientX, e.clientY];
      var p = pts();
      if (p.length === 2) { var d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); if (pinch) S.zoom = Math.max(0.6, Math.min(4, S.zoom * d / pinch)); pinch = d; }
      else if (last) {
        moved += Math.abs(e.clientX - last[0]) + Math.abs(e.clientY - last[1]);
        if (moved > 8) { cv.classList.add('drag'); S.auto = false; bAuto.setAttribute('aria-pressed', 'false'); S.yaw += (e.clientX - last[0]) * 0.01; S.pitch = Math.max(-1.45, Math.min(1.45, S.pitch + (e.clientY - last[1]) * 0.01)); }
        last = [e.clientX, e.clientY];
      }
      S.dirty = true;
    });
    function up(e) {
      var was = !!ptrs[e.pointerId]; delete ptrs[e.pointerId]; pinch = 0;
      var p = pts(); last = p.length ? p[0] : null;
      if (!p.length) cv.classList.remove('drag');
      if (was && e.type === 'pointerup' && !p.length && moved <= 8 && downAt) {
        var r = cv.getBoundingClientRect(); pick(e.clientX - r.left, e.clientY - r.top);
      }
      if (!p.length) downAt = null;
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) { e.preventDefault(); S.zoom = Math.max(0.6, Math.min(4, S.zoom * (e.deltaY > 0 ? 0.92 : 1.08))); S.dirty = true; }, { passive: false });
    function inPoly(x, y, s) { var c = false; for (var i = 0, j = s.length - 1; i < s.length; j = i++) { if (((s[i][1] > y) !== (s[j][1] > y)) && (x < (s[j][0] - s[i][0]) * (y - s[i][1]) / (s[j][1] - s[i][1]) + s[i][0])) c = !c; } return c; }
    function segD(x, y, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l)); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); }
    function pick(x, y) {
      for (var i = drawn.length - 1; i >= 0; i--) {
        var it = drawn[i]; if (!it.m || !it.m.part || it.m.nopick) continue;
        if (it.k === 'p') { if (it.a < 0.3) continue; if (inPoly(x, y, it.s)) return select(it.m.part); }
        else if (it.k === 'l') { if (it.a < 0.3) continue; if (segD(x, y, it.s[0], it.s[1]) < Math.max(7, it.w)) return select(it.m.part); }
      }
      select(null);
    }

    /* ---------- 動かす ---------- */
    if (window.ResizeObserver) new ResizeObserver(resize).observe(cwrap); else window.addEventListener('resize', resize);
    resize(); setMode('ext'); if (SC.length) goStep(0, true);
    var prev = 0;
    function loop(ts) {
      var dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0.016; prev = ts;
      S.t += dt * (reduce ? 0.3 : 1);
      if (S.auto) { S.yaw += dt * 0.3; S.dirty = true; }
      if (S.tw) {
        S.tw.t = Math.min(1, S.tw.t + dt / 0.8);
        var k = ease(S.tw.t), st = {};
        for (var key in S.tw.to) { var a = S.tw.from[key], b = S.tw.to[key]; st[key] = (typeof a === 'number' && typeof b === 'number') ? a + (b - a) * k : (S.tw.t < 1 ? (typeof b === 'boolean' && a !== undefined ? (k < 0.5 ? a : b) : b) : b); }
        S.st = st; rebuild();
        if (S.tw.t >= 1) { S.st = S.tw.to; S.tw = null; rebuild(); updSvg(); }
      }
      if ((B.flows.length || B.fluxes.length) && S.mode !== 'ext' && S.mode !== 'wire') S.dirty = true;
      if (S.dirty && W > 0 && ctx && S.mode !== 'wire') { draw(); S.dirty = false; }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    var api = { select: select, setMode: setMode, goStep: goStep, setScen: setScen, state: S, model: model, drawnCount: function () { return drawn.length; }, labelCount: function () { return LB.filter(function (L) { return L.e.style.display === 'block'; }).length; }, view: function (y, p, z) { S.yaw = y; S.pitch = p; S.zoom = z || 1; S.dirty = true; } };
    root.hv = api;
    return api;
  }
  window.HV3D = { mount: mount };
})();
