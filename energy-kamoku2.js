// 熱分野 課目Ⅱ・課目Ⅳ 空欄トレーニング（公開版）。データは energy-kamoku{課目}/{年度}.json
// 課目は body の data-kamoku（2 または 4）で決まる。記録の保存キーは課目ごとに別
// 問題画像・解答群の文言・書籍の解説は持たない。正解は ECCJ 標準解答で照合済みの値
const $ = id => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; }
const K = document.body.dataset.kamoku === '4' ? '4' : '2';
const KJ = K === '4' ? '課目Ⅳ' : '課目Ⅱ';
const YEARS = K === '4' ? { r08: '令和8年度', r07: '令和7年度', r06: '令和6年度', r05: '令和5年度', r04: '令和4年度', r03: '令和3年度', r02: '令和2年度' } : { r08: '令和8年度', r07: '令和7年度', r06: '令和6年度', r05: '令和5年度', r04: '令和4年度', r03: '令和3年度', r02: '令和2年度' };
const LS_UI = `ukiwa-kamoku${K}-ui`;
let ui = { year: 'r08', q: K === '4' ? 11 : 4, filter: 'all', theme: '', themeAll: false };
try { Object.assign(ui, JSON.parse(localStorage.getItem(LS_UI) || '{}')); } catch {}
if (!YEARS[ui.year]) ui.year = 'r08';
let D = null, rec = {}, cur = null, view = 'solve';
const cache = {};

function saveUi() { try { localStorage.setItem(LS_UI, JSON.stringify(ui)); } catch {} }
function lsKey() { return `ukiwa-kamoku${K}-${ui.year}-v1`; }
function loadRec() { try { rec = JSON.parse(localStorage.getItem(lsKey()) || '{}'); } catch { rec = {}; } }
function saveRec() { try { localStorage.setItem(lsKey(), JSON.stringify(rec)); } catch {} }
function lab(x) { return `(${x.blank})`; }
function stateOf(id) { const r = rec[id]; return !r || !r.tried ? 'new' : r.last ? 'ok' : 'ng'; }
// 間隔をあけた復習：間違い・解説を見た・手応え△✕の空欄は 0→1→3→7→14→30 日の間隔で「今日の復習」に出す
const SR = [0, 1, 3, 7, 14, 30], DAY = 864e5, today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
function sr(r, ok) { r.box = ok ? Math.min((r.box || 0) + 1, 5) : 0; r.due = today() + SR[r.box]; }
function isDue(x) { const r = rec[x.id]; if (!r || !r.n) return false; return r.due != null ? r.due <= today() : stateOf(x.id) === 'ng'; }
function setFeel(x, k) { const r = rec[x.id]; if (!r) return; r.feel = k; if (k === 'bad') { r.box = 0; r.due = today(); } else if (k === 'mid') { r.box = Math.min(r.box || 0, 1); r.due = today() + 1; } else { r.box = Math.max(r.box || 0, 1); r.due = today() + SR[r.box]; } saveRec(); }
function isOk(x, v) { return Math.abs(v - x.answerNum) <= x.step / 2 + 1e-9 * Math.abs(x.answerNum); }
function parseNum(s) {
  s = String(s).trim().replace(/，/g, '.').replace(/[０-９．－]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/\s/g, '');
  const m = s.match(/^([-+]?\d*\.?\d+)(?:(?:[×xX*]10\^?|e|E)([-+]?\d+))?$/);
  return m ? parseFloat(m[1]) * (m[2] ? 10 ** parseInt(m[2], 10) : 1) : null;
}
function answerText(x) {
  if (x.type === 'choice') return x.answer;
  const quantity = `${x.answerDisp}${x.answerScale || ''}${x.unit ? ' [' + x.unit + ']' : ''}`;
  return x.answerScale ? `解答欄：${x.answerDisp} ／ 値：${quantity}` : quantity;
}
function blanksOfQ() { return D.blanks.filter(x => x.q === ui.q); }
function visible() {
  const base = ui.filter === 'due' ? D.blanks.filter(isDue) : ui.themeAll && ui.theme ? D.blanks.filter(x => x.theme === ui.theme) : blanksOfQ();
  return base.filter(x => (!ui.theme || x.theme === ui.theme) &&
    (ui.filter === 'all' || ui.filter === 'due' || (ui.filter === 'new' && stateOf(x.id) === 'new') || (ui.filter === 'retry' && stateOf(x.id) === 'ng')));
}

async function loadYear() {
  if (!cache[ui.year]) {
    const res = await fetch(`energy-kamoku${K}/${ui.year}.json?v=2`);
    if (!res.ok) throw new Error(res.status);
    cache[ui.year] = await res.json();
  }
  D = cache[ui.year]; loadRec();
  const qs = [...new Set(D.blanks.map(x => x.q))];
  if (!qs.includes(ui.q)) ui.q = qs[0];
  $('q').replaceChildren(...qs.map(q => { const o = el('option', `問題${q}　${D.qtitle[q] || ''}`); o.value = q; return o; }));
  $('q').value = ui.q;
  [['pdf-problem', D.problemUrl], ['pdf-answer', D.answerUrl], ['pdf-list', D.listUrl]].forEach(([id, u]) => { $(id).href = u; });
  $('private-link').href = D.privateUrl; $('private-link').textContent = `${YEARS[ui.year]} ${KJ}（claude.ai）↗`;
  $('scope-year').textContent = YEARS[ui.year];
  render();
}

function fillTheme() {
  const themes = [...new Set(blanksOfQ().map(x => x.theme))];
  if (ui.themeAll && ui.theme && !themes.includes(ui.theme)) themes.push(ui.theme);
  if (ui.theme && !themes.includes(ui.theme)) ui.theme = '';
  if (!ui.theme) ui.themeAll = false;
  const all = el('option', 'すべてのテーマ'); all.value = '';
  $('theme').replaceChildren(all, ...themes.map(t => { const o = el('option', t); o.value = t; return o; }));
  $('theme').value = ui.theme;
}

// 課目Ⅳは必須（問題11〜14）と選択（問題15〜18、本番は4問中2問）を分けて数える
function ptsText(okN, pts, total) {
  if (K !== '4') return `${pts}/${total}点`;
  const sum = (a, f) => a.filter(f).reduce((s, x) => s + x.points, 0);
  return `必須 ${sum(okN, x => x.q <= 14)}/${sum(D.blanks, x => x.q <= 14)}点・選択 ${sum(okN, x => x.q >= 15)}/${sum(D.blanks, x => x.q >= 15)}点（本番は選択4問中2問を解答）`;
}

function render() {
  fillTheme();
  const all = D.blanks, done = all.filter(x => stateOf(x.id) !== 'new'), okN = all.filter(x => stateOf(x.id) === 'ok');
  const pts = okN.reduce((s, x) => s + x.points, 0), total = all.reduce((s, x) => s + x.points, 0);
  $('stats').textContent = `${YEARS[ui.year]}　空欄 ${all.length} ／ 回答済み ${done.length} ／ 正解 ${okN.length} ／ 要復習 ${all.filter(x => stateOf(x.id) === 'ng').length} ／ 直近の正解で ${ptsText(okN, pts, total)}`;
  $('scope-count').textContent = `空欄 ${all.length}・${total}点`;
  const list = visible(), cross = list.some(x => x.q !== list[0].q) || ui.filter === 'due' || ui.themeAll;
  $('list-title').textContent = ui.filter === 'due' ? `今日の復習（全問題・${list.length}欄）` : ui.themeAll ? `テーマ「${ui.theme}」（全問題・${list.length}欄）` : `問題${ui.q}　${D.qtitle[ui.q] || ''}`;
  $('blanks').replaceChildren(...list.map(x => {
    const s = stateOf(x.id), b = el('button', null, s === 'new' ? '' : s);
    b.type = 'button'; b.append(el('b', `空欄 ${lab(x)}`), el('small', `${cross ? '問' + x.q + '　' : ''}${x.path}　${x.theme}　${x.points}点`), el('span', s === 'ok' ? '✓ 正解' : s === 'ng' ? '✗ 要復習' : '未回答', 'st'));
    b.setAttribute('aria-label', `空欄 ${lab(x)}、${x.path}、${s === 'ok' ? '正解済み' : s === 'ng' ? '要復習' : '未回答'}`);
    b.onclick = () => openBlank(x.id); return b;
  }));
  $('empty').hidden = list.length > 0;
  renderReview(); renderSheet();
}

// 全画面ウィンドウ
function openBlank(id) {
  cur = id; view = stateOf(id) === 'new' ? 'solve' : 'result';
  if (!$('dlg').open) $('dlg').showModal();
  renderDlg(); $('dhead').focus({ preventScroll: true });
}
function closeDlg() { $('dlg').close(); cur = null; render(); }
function record(x, ok, your) { const r = rec[x.id] || { n: 0 }; r.n++; r.tried = true; sr(r, ok); delete r.feel; r.last = ok; r.your = your; r.t = Date.now(); rec[x.id] = r; saveRec(); }

function renderDlg() {
  const x = D.blanks.find(b => b.id === cur), list = visible().some(b => b.id === cur) ? visible() : blanksOfQ();
  $('dhead').textContent = `${YEARS[ui.year]}　問題${x.q}　${x.path}　空欄 ${lab(x)}`;
  $('dtabs').replaceChildren(...list.map(b => {
    const t = el('button', (list.some(z => z.q !== x.q) ? `問${b.q} ` : '') + lab(b), stateOf(b.id) === 'new' ? '' : stateOf(b.id)); t.type = 'button';
    if (b.id === cur) t.setAttribute('aria-current', 'true');
    t.onclick = () => openBlank(b.id); return t;
  }));
  const i = list.findIndex(b => b.id === cur), prev = list[i - 1], next = list[i + 1];
  $('dprev').textContent = prev ? `← ${lab(prev)}` : '最初の空欄です'; $('dprev').disabled = !prev; $('dprev').onclick = () => prev && openBlank(prev.id);
  $('dnext').textContent = next ? `${lab(next)} へ →` : '最後の空欄です'; $('dnext').disabled = !next; $('dnext').onclick = () => next && openBlank(next.id);
  const inner = $('dinner'); inner.replaceChildren();
  const meta = el('div', null, 'k2-meta');
  [YEARS[ui.year], `問題${x.q}`, `小問 ${x.path}`, x.field, x.theme, `難易度 ${x.level}`, `配点 ${x.points}点`, `回答 ${(rec[x.id] || {}).n || 0}回`].forEach(t => meta.append(el('span', t)));
  inner.append(meta);
  const ask = el('div', null, 'k2-ask'); ask.append(el('small', '問われていること（問題文は ECCJ の問題PDFで確認）'), document.createTextNode(x.ask || x.full.what)); inner.append(ask);
  if (view === 'solve') solve(inner, x); else explain(inner, x);
  $('dbody').scrollTop = 0;
}

function solve(inner, x) {
  if (x.type === 'choice') {
    inner.append(el('p', `解答群の記号から選ぶ（${x.symbols[0]}〜${x.symbols[x.symbols.length - 1]}）。選択肢の内容は問題PDFの「〈${x.blank}〉の解答群」で確認してください。`, 'k2-hint'));
    const box = el('div', null, 'k2-choices');
    x.symbols.forEach(s => { const b = el('button', s); b.type = 'button'; b.setAttribute('aria-label', `${s} を選ぶ`); b.onclick = () => { record(x, s === x.answer || (x.alt || []).includes(s), s); view = 'result'; renderDlg(); }; box.append(b); });
    inner.append(box);
  } else {
    const row = el('div', null, 'k2-num'), inp = el('input');
    inp.inputMode = 'decimal'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', `空欄 ${lab(x)} の値`); inp.placeholder = /10\^[cd]/.test(x.fmt) ? '例 1.23e3 / 1230' : '数値';
    const go = el('button', '判定する', 'primary'); go.type = 'button';
    const hint = el('p', `解答の形：${x.fmt}${x.unit ? '　単位 [' + x.unit + ']' : ''}${x.answerScale ? '（固定倍率の前の係数だけを入力）' : /10\^[cd]/.test(x.fmt) ? '（指数を含めた値で入力。例：3.45×10³ なら 3.45e3 か 3450）' : ''}。最小位の一つ下で四捨五入。`, 'k2-hint');
    go.onclick = () => { const v = parseNum(inp.value); if (v == null) { hint.textContent = '数値として読めませんでした。例：3.45、3.45e3、3.45×10^3'; inp.focus(); return; } record(x, isOk(x, v), inp.value); view = 'result'; renderDlg(); };
    inp.onkeydown = e => { if (e.key === 'Enter') go.click(); };
    row.append(inp, el('span', `${x.answerScale || ''}${x.unit ? ' [' + x.unit + ']' : ''}`), go); inner.append(row, hint);
  }
  const later = el('div', null, 'k2-later'), see = el('button', 'わからない → 解説を見る'); see.type = 'button';
  see.onclick = () => { const r = rec[x.id] || { n: 0 }; r.n++; r.box = 0; r.due = today(); rec[x.id] = r; saveRec(); view = 'learn'; renderDlg(); }; later.append(see); inner.append(later);
}

function sec(inner, n, title) { const s = el('details', null, 'k2-sec'), sm = el('summary'), h = el('h4'); s.open = true; h.append(el('span', String(n), 'n'), document.createTextNode(title)); sm.append(h); s.append(sm); inner.append(s); return s; }
function list(arr, tag = 'ul') { const u = el(tag); arr.forEach(t => u.append(el('li', t))); return u; }
function renderReview() {
  const box = $('review-body'); if (!box) return; box.replaceChildren();
  const due = D.blanks.filter(isDue), c = el('div', null, 'k2-due' + (due.length ? '' : ' none'));
  c.append(el('h3', due.length ? `今日の復習：${due.length} 空欄` : '今日の復習：なし'));
  if (due.length) {
    c.append(el('p', '間違えた・解説を見た・手応えが△✕の空欄は、間をあけて出題します（1日→3日→7日→14日→30日）。', 'k2-hint'));
    const b = el('button', '復習を始める', 'primary'); b.type = 'button';
    b.onclick = () => { ui.filter = 'due'; ui.theme = ''; ui.themeAll = false; $('filter').value = 'due'; saveUi(); render(); const l = visible(); if (l.length) openBlank(l[0].id); }; c.append(b);
  } else c.append(el('p', '期日が来た復習はありません。間違えた空欄や、手応えを△✕にした空欄が、あとでここに出ます。', 'k2-hint'));
  box.append(c);
  const themes = [...new Set(D.blanks.map(x => x.theme))];
  const rows = themes.map(t => { const b = D.blanks.filter(x => x.theme === t), tr = b.filter(x => stateOf(x.id) !== 'new'), ok = b.filter(x => stateOf(x.id) === 'ok'); return { t, n: b.length, tr: tr.length, ok: ok.length, rate: tr.length ? ok.length / tr.length : null }; });
  rows.sort((a, b) => (a.rate == null) - (b.rate == null) || (a.rate ?? 0) - (b.rate ?? 0));
  box.append(el('h3', 'テーマ別の正答率（苦手な順）'));
  const tb = el('table', null, 'k2-thstat'), hd = el('tr'); ['テーマ', '正解/回答', '正答率', ''].forEach(h => hd.append(el('th', h))); tb.append(hd);
  rows.forEach(r => {
    const tr = el('tr'), weak = r.rate != null && r.rate < .6 && r.tr >= 2, th = el('td', r.t); if (weak) th.className = 'weak';
    tr.append(th, el('td', `${r.ok}/${r.tr}（全${r.n}）`));
    const bt = el('td'); if (r.rate != null) { const bar = el('span', null, 'k2-bar'), i = el('i'); i.style.width = Math.round(r.rate * 100) + '%'; bar.append(i); bt.append(bar, document.createTextNode(' ' + Math.round(r.rate * 100) + '%')); } else bt.textContent = '未回答';
    tr.append(bt); const go = el('td'), b = el('button', 'この分野だけ'); b.type = 'button';
    b.onclick = () => { ui.filter = 'all'; ui.theme = r.t; ui.themeAll = true; $('filter').value = 'all'; saveUi(); render(); window.scrollTo({ top: $('list-title').getBoundingClientRect().top + scrollY - 8, behavior: 'smooth' }); };
    go.append(b); tr.append(go); tb.append(tr);
  });
  box.append(tb, el('p', '正答率が60％未満（2欄以上回答）のテーマは赤字で示します。「この分野だけ」は、この年度の全問題から同じテーマの空欄を集めます。', 'k2-hint'));
}
function renderSheet() {
  const box = $('sheet-body'); if (!box) return; box.replaceChildren();
  box.append(el('p', '解説の「使う式」と「親の公式」をテーマごとに集めた復習用の一覧です。解く前に開くと答えの手がかりが見えるので、解いたあとの整理に使ってください。', 'k2-hint'));
  [...new Set(D.blanks.map(x => x.theme))].forEach(t => {
    const d = el('details'), bl = D.blanks.filter(x => x.theme === t); d.append(el('summary', `${t}（${bl.length}欄）`));
    const fm = new Map(), pr = new Map();
    bl.forEach(x => { const l = `問${x.q}${lab(x)}`; x.full.method[0].forEach(f => { if (!fm.has(f)) fm.set(f, []); fm.get(f).push(l); }); const k = x.full.parent[0]; if (!pr.has(k)) pr.set(k, { p: x.full.parent, l: [] }); pr.get(k).l.push(l); });
    d.append(el('h4', '使う式')); fm.forEach((l, f) => { const w = el('div', null, 'k2-fm'); w.append(el('div', f, 'k2-math'), el('small', '出てくる空欄：' + l.join('、'))); d.append(w); });
    d.append(el('h4', '親の公式 → 条件 → 派生')); pr.forEach(v => { const w = el('div', null, 'k2-fm'); w.append(el('div', v.p.join('\n'), 'k2-math'), el('small', '出てくる空欄：' + v.l.join('、'))); d.append(w); });
    box.append(d);
  });
}
function explain(inner, x) {
  const r = rec[x.id], seen = view === 'learn';
  const res = el('div', null, 'k2-result ' + (seen ? 'seen' : r && r.last ? 'ok' : 'ng'));
  res.append(document.createTextNode(seen ? '正答と解説' : r && r.last ? '正解！' : '不正解'));
  res.append(el('small', `正解：${lab(x)} ＝ ${answerText(x)}　（ECCJ標準解答で確認・配点${x.points}点）`));
  if (!seen && r && r.your) res.append(el('small', `あなたの答え：${r.your}`));
  inner.append(res);
  const f = x.full; let n = 1;
  // 要点カード（30秒で読む）→ 手応え（復習の間隔を決める）→ 詳しい解説（たたんで読める）
  const kc = el('div', null, 'k2-keycard'), kd = el('dl'); kc.append(el('h4', '要点カード（30秒で読む）'));
  [['解き方', x.key], ['見抜き方', (f.spot || [])[0]], ['親公式', (f.parent || [])[0]]].forEach(([a, b]) => { if (b) kd.append(el('dt', a), el('dd', b)); });
  kc.append(kd); inner.append(kc);
  if (r && r.n) {
    const fe = el('div', null, 'k2-feel'); fe.append(el('span', '手応え：'));
    const nextText = () => { const d = rec[x.id].due; return d == null ? '' : `次の復習：${d <= today() ? '今日' : (d - today()) + '日後'}`; };
    const nx = el('small', nextText());
    [['◎', '理解できた', 'ok'], ['△', 'あいまい', 'mid'], ['✕', '忘れそう', 'bad']].forEach(([m, t, k]) => { const b = el('button', `${m} ${t}`); b.type = 'button'; b.setAttribute('aria-pressed', String(rec[x.id].feel === k)); b.onclick = () => { setFeel(x, k); fe.querySelectorAll('button').forEach(z => z.setAttribute('aria-pressed', String(z === b))); nx.textContent = nextText(); }; fe.append(b); });
    fe.append(nx); inner.append(fe);
  }
  const fb = el('div', null, 'k2-foldbar'); [['すべてたたむ', false], ['すべて開く', true]].forEach(([t, o]) => { const b = el('button', t); b.type = 'button'; b.onclick = () => inner.querySelectorAll('details.k2-sec').forEach(d => { d.open = o; }); fb.append(b); }); inner.append(fb);
  sec(inner, n++, '何を問われているか').append(el('p', f.what));
  const m = sec(inner, n++, '解法：使う式と記号・単位'); f.method[0].forEach(t => m.append(el('div', t, 'k2-math')));
  const tb = el('table', null, 'k2-sym'); f.method[1].forEach(([a, b]) => { const tr = el('tr'); tr.append(el('td', a), el('td', b)); tb.append(tr); }); m.append(tb);
  sec(inner, n++, '式の出どころ（短い導出）').append(el('p', f.derive));
  sec(inner, n++, '数値を代入して計算').append(list(f.calc, 'ol'));
  sec(inner, n++, 'なぜこの答えか（確かめ）').append(el('p', f.check, 'k2-check'));
  sec(inner, n++, x.type === 'choice' ? 'ほかの選択肢が違う理由' : 'ありがちな間違い').append(list(f.why));
  sec(inner, n++, '試験で解き方を見抜くコツ').append(list(f.spot));
  sec(inner, n++, '関連知識：親の公式 → 条件 → 派生').append(el('div', f.parent.join('\n'), 'k2-math'));
  const s = el('section', null, 'k2-sec k2-src'); s.append(el('h4', '出典')); const dl = el('dl');
  [['試験', D.exam], ['課目', D.subject], ['大問・小問', `問題${x.q}　${x.path}　空欄 ${lab(x)}`], ['正解の扱い', `当時（${YEARS[ui.year]}）の試験上の正解`], ['問題', D.problemUrl], ['標準解答', D.answerUrl]].forEach(([a, b]) => {
    dl.append(el('dt', a)); const dd = el('dd');
    if (/^https?:/.test(b)) { const l = el('a', b); l.href = b; l.target = '_blank'; l.rel = 'noopener'; dd.append(l); } else dd.textContent = b;
    dl.append(dd);
  });
  s.append(dl); inner.append(s);
  const again = el('button', '答えを隠してもう一度解く'); again.type = 'button'; again.onclick = () => { view = 'solve'; renderDlg(); }; inner.append(again);
}

$('dclose').onclick = closeDlg;
$('dlg').addEventListener('cancel', e => { e.preventDefault(); closeDlg(); });
$('year').value = ui.year;
$('year').onchange = () => { ui.year = $('year').value; ui.theme = ''; ui.themeAll = false; saveUi(); loadYear().catch(showError); };
$('q').onchange = () => { ui.q = +$('q').value; ui.theme = ''; ui.themeAll = false; if (ui.filter === 'due') { ui.filter = 'all'; $('filter').value = 'all'; } saveUi(); render(); };
$('filter').value = ui.filter;
$('filter').onchange = () => { ui.filter = $('filter').value; saveUi(); render(); };
$('theme').onchange = () => { ui.theme = $('theme').value; ui.themeAll = false; saveUi(); render(); };
$('reset').onclick = () => {
  const b = $('reset');
  if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = '本当に消す（もう一度押す）'; setTimeout(() => { b.dataset.arm = ''; b.textContent = 'この年度の記録を消す'; }, 4000); return; }
  b.dataset.arm = ''; b.textContent = '記録を消しました'; rec = {}; saveRec(); render();
};
function showError() { $('blanks').replaceChildren(el('p', '空欄データを読み込めませんでした。ページを再読み込みしてください。', 'k2-empty')); }
loadYear().catch(showError);
// 記号の下付き：解説データの「c_p」「q_H」「T_h1」などを、問題文と同じ形（斜体の文字＋下付きの添字）で表示する。リンク・入力欄の中は変えない
(()=>{const RE=/(^|[^A-Za-z0-9_]|(?=\)))([A-Za-zΑ-Ωα-ω]|\))_([A-Za-z0-9]+)/g,SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','OPTION','SELECT','INPUT','SUB','SUP','A','CODE']);
 function fix(n){if(n.nodeType===3){const t=n.nodeValue;if(!t||t.indexOf('_')<0||(n.parentNode&&SKIP.has(n.parentNode.nodeName)))return;RE.lastIndex=0;let m,i=0,hit=false;const f=document.createDocumentFragment();
   while((m=RE.exec(t))){hit=true;const s=m.index+m[1].length,b=m[2];f.append(t.slice(i,s));if(/[A-Za-z]/.test(b)){const v=document.createElement('i');v.className='sym';v.textContent=b;f.append(v)}else f.append(b);const u=document.createElement('sub');u.className='sym-sub';u.textContent=m[3];f.append(u);i=s+b.length+1+m[3].length}
   if(hit){f.append(t.slice(i));n.replaceWith(f)}return}
  if(n.nodeType===1&&!SKIP.has(n.nodeName))[...n.childNodes].forEach(fix)}
 fix(document.body);new MutationObserver(ms=>{for(const r of ms){if(r.type==='characterData')fix(r.target);else r.addedNodes.forEach(fix)}}).observe(document.body,{childList:true,subtree:true,characterData:true})})();
