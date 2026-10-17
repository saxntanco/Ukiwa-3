/* 賞の図鑑：歴代受賞者の一覧（prize-history-data.js を表示する） */
(function () {
  var D = window.PRIZE_HISTORY;
  var root = document.getElementById('history-app');
  if (!D || !root) return;

  var PRIZES = [
    { id: 'nobel', name: 'ノーベル賞', span: '1901〜' },
    { id: 'fields', name: 'フィールズ賞', span: '1936〜' },
    { id: 'abel', name: 'アーベル賞', span: '2003〜' },
    { id: 'turing', name: 'チューリング賞', span: '1966〜' },
    { id: 'kyoto', name: '京都賞', span: '1985〜' },
    { id: 'japanprize', name: '日本国際賞', span: '1985〜' },
    { id: 'kavli', name: 'カブリ賞', span: '2008〜' },
    { id: 'pritzker', name: 'プリツカー賞', span: '1979〜' }
  ];
  var CAT = { phy: '物理学', che: '化学', med: '生理学・医学', lit: '文学', pea: '平和', eco: '経済学' };
  var NOTES = {
    nobel: '1940〜42年は第二次世界大戦で全部門とも授賞なし。ほかにも授賞のない年・部門があります。経済学賞は1969年から。',
    fields: '4年に1度。1940年代は戦争で中断し、1950年に再開しました。',
    turing: '年は「何年の賞か」。発表は翌年の春です。',
    kyoto: '2020年は新型コロナウイルスの影響で授賞なし。部門の中の分野は毎年持ち回りです。',
    japanprize: '毎年2分野。分野は持ち回りです。',
    kavli: '2年に1度（偶数年）。',
    pritzker: '存命の建築家に贈られます（2015年のフライ・オットーは発表直前に死去）。'
  };

  var state = { prize: 'nobel', cat: 'all', q: '', jp: false, newest: true };
  try {
    var saved = JSON.parse(localStorage.getItem('ukiwa-prize-history') || '{}');
    if (saved.prize && D[saved.prize]) state.prize = saved.prize;
    if (typeof saved.newest === 'boolean') state.newest = saved.newest;
  } catch (e) {}

  function save() {
    try { localStorage.setItem('ukiwa-prize-history', JSON.stringify({ prize: state.prize, newest: state.newest })); } catch (e) {}
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFKC'); }

  root.innerHTML =
    '<div class="hx-tabs" role="tablist" aria-label="賞を選ぶ"></div>' +
    '<div class="hx-bar">' +
      '<label class="hx-search"><span>名前・キーワード</span><input type="search" placeholder="例：アインシュタイン、Curie、LED、日本" autocomplete="off"></label>' +
      '<label class="hx-check"><input type="checkbox" class="hx-jp"> 日本関連だけ</label>' +
      '<button type="button" class="hx-order"></button>' +
    '</div>' +
    '<div class="hx-cats" aria-label="部門"></div>' +
    '<p class="hx-count" aria-live="polite"></p>' +
    '<p class="hx-note muted"></p>' +
    '<div class="hx-list"></div>';

  var tabs = root.querySelector('.hx-tabs');
  var cats = root.querySelector('.hx-cats');
  var input = root.querySelector('input[type=search]');
  var jpBox = root.querySelector('.hx-jp');
  var orderBtn = root.querySelector('.hx-order');
  var list = root.querySelector('.hx-list');
  var count = root.querySelector('.hx-count');
  var note = root.querySelector('.hx-note');

  PRIZES.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.id = p.id;
    b.innerHTML = esc(p.name) + '<small>' + p.span + '・' + D[p.id].length + '件</small>';
    b.addEventListener('click', function () {
      state.prize = p.id; state.cat = 'all'; save(); render();
    });
    tabs.appendChild(b);
  });

  input.addEventListener('input', function () { state.q = input.value.trim(); render(); });
  jpBox.addEventListener('change', function () { state.jp = jpBox.checked; render(); });
  orderBtn.addEventListener('click', function () { state.newest = !state.newest; save(); render(); });

  function catsFor(rows) {
    var seen = [];
    rows.forEach(function (r) { if (r[1] && seen.indexOf(r[1]) < 0) seen.push(r[1]); });
    return seen;
  }
  function label(prize, f) { return prize === 'nobel' ? CAT[f] : f; }

  function render() {
    var rows = D[state.prize];
    Array.prototype.forEach.call(tabs.children, function (b) {
      var on = b.dataset.id === state.prize;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    orderBtn.textContent = state.newest ? '新しい順 ⇅' : '古い順 ⇅';
    note.textContent = NOTES[state.prize] || '';

    var fs = catsFor(rows);
    if (state.prize === 'kyoto') fs = fs.map(function (f) { return f.replace(/（.*$/, ''); }).filter(function (f, i, a) { return a.indexOf(f) === i; });
    cats.innerHTML = '';
    if (fs.length > 1) {
      ['all'].concat(fs).forEach(function (f) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = f === 'all' ? 'すべて' : label(state.prize, f);
        b.className = state.cat === f ? 'on' : '';
        b.setAttribute('aria-pressed', state.cat === f ? 'true' : 'false');
        b.addEventListener('click', function () { state.cat = f; render(); });
        cats.appendChild(b);
      });
    }

    var raw = state.q.normalize('NFKC');
    // 「LED」「DNA」のような大文字の略語は大文字のまま探す（Lederman などに当たらないように）
    var exact = /^[A-Z0-9][A-Z0-9-]*$/.test(raw) && raw.length <= 5;
    var q = exact ? raw : norm(raw);
    var hits = rows.filter(function (r) {
      if (state.cat !== 'all' && r[1].indexOf(state.cat) !== 0) return false;
      if (state.jp && !r[4]) return false;
      if (!q) return true;
      var text = r[0] + ' ' + label(state.prize, r[1]) + ' ' + r[2].join(' ') + ' ' + r[3] + (r[4] ? ' 日本' : '');
      return (exact ? text.normalize('NFKC') : norm(text)).indexOf(q) >= 0;
    });
    if (state.newest) {
      // 年は新しい順、同じ年の中は部門の順のまま
      hits = hits.map(function (r, i) { return [r, i]; })
        .sort(function (a, b) { return b[0][0] - a[0][0] || a[1] - b[1]; })
        .map(function (x) { return x[0]; });
    }

    var people = hits.reduce(function (n, r) { return n + r[2].length; }, 0);
    count.textContent = hits.length + '件（のべ' + people + '人・団体）を表示';

    if (!hits.length) {
      list.innerHTML = '<p class="hx-empty">見つかりませんでした。言葉を短くするか、ほかの賞でも探してみてください。</p>';
      return;
    }
    var html = '', curDecade = null;
    hits.forEach(function (r) {
      var dec = Math.floor(r[0] / 10) * 10;
      if (dec !== curDecade) {
        if (curDecade !== null) html += '</div></section>';
        html += '<section class="hx-dec"><h3>' + dec + '年代</h3><div class="hx-grid">';
        curDecade = dec;
      }
      var f = r[1] ? label(state.prize, r[1]) : '';
      html += '<article class="hx-item' + (r[4] ? ' is-jp' : '') + '">' +
        '<div class="hx-head"><b>' + r[0] + '</b>' + (f ? '<span>' + esc(f) + '</span>' : '') + (r[4] ? '<span class="jp">日本</span>' : '') + '</div>' +
        '<p class="hx-who">' + r[2].map(esc).join('、') + '</p>' +
        '<p class="hx-what">' + esc(r[3]) + '</p></article>';
    });
    html += '</div></section>';
    list.innerHTML = html;
  }
  render();
})();
