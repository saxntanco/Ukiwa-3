// 熱分野 課目Ⅱ 空欄トレーニング（公開版）。データは energy-kamoku2/{年度}.json
// 問題画像・解答群の文言・書籍の解説は持たない。正解は ECCJ 標準解答で照合済みの値
const $ = id => document.getElementById(id);
function el(tag, text, cls) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; }
const YEARS = { r07: '令和7年度', r06: '令和6年度' };
const LS_UI = 'ukiwa-kamoku2-ui';
let ui = { year: 'r07', q: 4, filter: 'all', theme: '' };
try { Object.assign(ui, JSON.parse(localStorage.getItem(LS_UI) || '{}')); } catch {}
if (!YEARS[ui.year]) ui.year = 'r07';
let D = null, rec = {}, cur = null, view = 'solve';
const cache = {};

function saveUi() { try { localStorage.setItem(LS_UI, JSON.stringify(ui)); } catch {} }
function lsKey() { return `ukiwa-kamoku2-${ui.year}-v1`; }
function loadRec() { try { rec = JSON.parse(localStorage.getItem(lsKey()) || '{}'); } catch { rec = {}; } }
function saveRec() { try { localStorage.setItem(lsKey(), JSON.stringify(rec)); } catch {} }
function lab(x) { return `(${x.blank})`; }
function stateOf(id) { const r = rec[id]; return !r || !r.tried ? 'new' : r.last ? 'ok' : 'ng'; }
function isOk(x, v) { return Math.abs(v - x.answerNum) <= x.step / 2 + 1e-9 * Math.abs(x.answerNum); }
function parseNum(s) {
  s = String(s).trim().replace(/，/g, '.').replace(/[０-９．－]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/\s/g, '');
  const m = s.match(/^([-+]?\d*\.?\d+)(?:(?:[×xX*]10\^?|e|E)([-+]?\d+))?$/);
  return m ? parseFloat(m[1]) * (m[2] ? 10 ** parseInt(m[2], 10) : 1) : null;
}
function answerText(x) { return x.type === 'choice' ? x.answer : `${x.answerDisp}${x.unit ? ' [' + x.unit + ']' : ''}`; }
function blanksOfQ() { return D.blanks.filter(x => x.q === ui.q); }
function visible() {
  return blanksOfQ().filter(x => (!ui.theme || x.theme === ui.theme) &&
    (ui.filter === 'all' || (ui.filter === 'new' && stateOf(x.id) === 'new') || (ui.filter === 'retry' && stateOf(x.id) === 'ng')));
}

async function loadYear() {
  if (!cache[ui.year]) {
    const res = await fetch(`energy-kamoku2/${ui.year}.json?v=1`);
    if (!res.ok) throw new Error(res.status);
    cache[ui.year] = await res.json();
  }
  D = cache[ui.year]; loadRec();
  const qs = [...new Set(D.blanks.map(x => x.q))];
  if (!qs.includes(ui.q)) ui.q = qs[0];
  $('q').replaceChildren(...qs.map(q => { const o = el('option', `問題${q}　${D.qtitle[q] || ''}`); o.value = q; return o; }));
  $('q').value = ui.q;
  [['pdf-problem', D.problemUrl], ['pdf-answer', D.answerUrl], ['pdf-list', D.listUrl]].forEach(([id, u]) => { $(id).href = u; });
  $('private-link').href = D.privateUrl; $('private-link').textContent = `${YEARS[ui.year]} 課目Ⅱ（claude.ai）↗`;
  $('scope-year').textContent = YEARS[ui.year];
  render();
}

function fillTheme() {
  const themes = [...new Set(blanksOfQ().map(x => x.theme))];
  if (ui.theme && !themes.includes(ui.theme)) ui.theme = '';
  const all = el('option', 'すべてのテーマ'); all.value = '';
  $('theme').replaceChildren(all, ...themes.map(t => { const o = el('option', t); o.value = t; return o; }));
  $('theme').value = ui.theme;
}

function render() {
  fillTheme();
  const all = D.blanks, done = all.filter(x => stateOf(x.id) !== 'new'), okN = all.filter(x => stateOf(x.id) === 'ok');
  const pts = okN.reduce((s, x) => s + x.points, 0), total = all.reduce((s, x) => s + x.points, 0);
  $('stats').textContent = `${YEARS[ui.year]}　空欄 ${all.length} ／ 回答済み ${done.length} ／ 正解 ${okN.length} ／ 要復習 ${all.filter(x => stateOf(x.id) === 'ng').length} ／ 直近の正解で ${pts}/${total}点`;
  $('scope-count').textContent = `空欄 ${all.length}・${total}点`;
  $('list-title').textContent = `問題${ui.q}　${D.qtitle[ui.q] || ''}`;
  const list = visible();
  $('blanks').replaceChildren(...list.map(x => {
    const s = stateOf(x.id), b = el('button', null, s === 'new' ? '' : s);
    b.type = 'button'; b.append(el('b', `空欄 ${lab(x)}`), el('small', `${x.path}　${x.theme}　${x.points}点`), el('span', s === 'ok' ? '✓ 正解' : s === 'ng' ? '✗ 要復習' : '未回答', 'st'));
    b.setAttribute('aria-label', `空欄 ${lab(x)}、${x.path}、${s === 'ok' ? '正解済み' : s === 'ng' ? '要復習' : '未回答'}`);
    b.onclick = () => openBlank(x.id); return b;
  }));
  $('empty').hidden = list.length > 0;
}

// 全画面ウィンドウ
function openBlank(id) {
  cur = id; view = stateOf(id) === 'new' ? 'solve' : 'result';
  if (!$('dlg').open) $('dlg').showModal();
  renderDlg(); $('dhead').focus({ preventScroll: true });
}
function closeDlg() { $('dlg').close(); cur = null; render(); }
function record(x, ok, your) { const r = rec[x.id] || { n: 0 }; r.n++; r.tried = true; r.last = ok; r.your = your; r.t = Date.now(); rec[x.id] = r; saveRec(); }

function renderDlg() {
  const x = D.blanks.find(b => b.id === cur), list = visible().some(b => b.id === cur) ? visible() : blanksOfQ();
  $('dhead').textContent = `${YEARS[ui.year]}　問題${x.q}　${x.path}　空欄 ${lab(x)}`;
  $('dtabs').replaceChildren(...list.map(b => {
    const t = el('button', lab(b), stateOf(b.id) === 'new' ? '' : stateOf(b.id)); t.type = 'button';
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
    x.symbols.forEach(s => { const b = el('button', s); b.type = 'button'; b.setAttribute('aria-label', `${s} を選ぶ`); b.onclick = () => { record(x, s === x.answer, s); view = 'result'; renderDlg(); }; box.append(b); });
    inner.append(box);
  } else {
    const row = el('div', null, 'k2-num'), inp = el('input');
    inp.inputMode = 'decimal'; inp.autocomplete = 'off'; inp.setAttribute('aria-label', `空欄 ${lab(x)} の値`); inp.placeholder = x.fmt.includes('10^d') ? '例 1.23e3 / 1230' : '数値';
    const go = el('button', '判定する', 'primary'); go.type = 'button';
    const hint = el('p', `解答の形：${x.fmt}${x.unit ? '　単位 [' + x.unit + ']' : ''}${x.fmt.includes('10^d') ? '（指数を含めた値で入力。例：3.45×10³ なら 3.45e3 か 3450）' : ''}。最小位の一つ下で四捨五入。`, 'k2-hint');
    go.onclick = () => { const v = parseNum(inp.value); if (v == null) { hint.textContent = '数値として読めませんでした。例：3.45、3.45e3、3.45×10^3'; inp.focus(); return; } record(x, isOk(x, v), inp.value); view = 'result'; renderDlg(); };
    inp.onkeydown = e => { if (e.key === 'Enter') go.click(); };
    row.append(inp, el('span', x.unit ? `[${x.unit}]` : ''), go); inner.append(row, hint);
  }
  const later = el('div', null, 'k2-later'), see = el('button', 'わからない → 解説を見る'); see.type = 'button';
  see.onclick = () => { view = 'learn'; renderDlg(); }; later.append(see); inner.append(later);
}

function sec(inner, n, title) { const s = el('section', null, 'k2-sec'), h = el('h4'); h.append(el('span', String(n), 'n'), document.createTextNode(title)); s.append(h); inner.append(s); return s; }
function list(arr, tag = 'ul') { const u = el(tag); arr.forEach(t => u.append(el('li', t))); return u; }
function explain(inner, x) {
  const r = rec[x.id], seen = view === 'learn';
  const res = el('div', null, 'k2-result ' + (seen ? 'seen' : r && r.last ? 'ok' : 'ng'));
  res.append(document.createTextNode(seen ? '正答と解説' : r && r.last ? '正解！' : '不正解'));
  res.append(el('small', `正解：${lab(x)} ＝ ${answerText(x)}　（ECCJ標準解答で確認・配点${x.points}点）`));
  if (!seen && r && r.your) res.append(el('small', `あなたの答え：${r.your}`));
  inner.append(res);
  const f = x.full; let n = 1;
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
$('year').onchange = () => { ui.year = $('year').value; ui.theme = ''; saveUi(); loadYear().catch(showError); };
$('q').onchange = () => { ui.q = +$('q').value; ui.theme = ''; saveUi(); render(); };
$('filter').value = ui.filter;
$('filter').onchange = () => { ui.filter = $('filter').value; saveUi(); render(); };
$('theme').onchange = () => { ui.theme = $('theme').value; saveUi(); render(); };
$('reset').onclick = () => {
  const b = $('reset');
  if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = '本当に消す（もう一度押す）'; setTimeout(() => { b.dataset.arm = ''; b.textContent = 'この年度の記録を消す'; }, 4000); return; }
  b.dataset.arm = ''; b.textContent = '記録を消しました'; rec = {}; saveRec(); render();
};
function showError() { $('blanks').replaceChildren(el('p', '空欄データを読み込めませんでした。ページを再読み込みしてください。', 'k2-empty')); }
loadYear().catch(showError);
