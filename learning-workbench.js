/* Page-specific learning; this module never changes a calculator's inputs. */
(() => {
  'use strict';
  const source = document.currentScript;
  if (!source || window.ukiwaWorkbenchLoaded) return;
  window.ukiwaWorkbenchLoaded = true;
  const base = new URL('.', source.src);
  const page = decodeURIComponent(location.pathname.slice(base.pathname.length));
  const excluded = new Set(['ac-withstand-test-simulator.html', 'ac-withstand-test-simulator (1).html', 'ukiwamemo_kyounonande_taiatsu_reactor_ic.html']);
  if (excluded.has(page)) return;
  const ready = document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once:true})) : Promise.resolve();
  const get = async path => { const response = await fetch(new URL(path, base)); if (!response.ok) throw new Error('Learning content unavailable'); return response.json(); };
  Promise.all([ready, get('learning-guides/index.json?v=20261004')]).then(async ([, index]) => {
    if (!Object.hasOwn(index, page)) return;
    const guide = await get(index[page] + '?v=20261004');
    if (guide.page !== page) return;
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('learning-workbench.css?v=20261004', base); document.head.append(css);
    build(guide);
  }).catch(() => { /* Existing page remains usable when optional material is offline. */ });
  function build(guide) {
    const el = (tag, text, cls) => { const node = document.createElement(tag); if (text != null) node.textContent = text; if (cls) node.className = cls; return node; };
    const button = (text, action, cls) => { const b = el('button', text, cls); b.type = 'button'; b.addEventListener('click', action); return b; };
    const key = 'ukiwa-learning-workbench-v1:' + page;
    let record = {};
    try { const saved = JSON.parse(localStorage.getItem(key) || '{}'); if (saved && typeof saved === 'object' && !Array.isArray(saved)) record = saved; } catch (_) {}
    const entry = el('section', null, 'lw-entry'); entry.setAttribute('aria-label', '原理から復習する');
    entry.append(el('span', '原理 → 具体例 → 確認', 'lw-kicker'), el('h2', guide.title), el('p', guide.lead));
    const actions = el('div', null, 'lw-actions');
    const openLearn = button('考え方と例を見る', () => open('learn', openLearn), 'lw-primary');
    const openQuiz = button('確認問題 ' + guide.checks.length + '問', () => open('quiz', openQuiz));
    actions.append(openLearn, openQuiz); entry.append(actions);
    const main = document.querySelector('main'); (main || document.body).prepend(entry);
    const dialog = el('dialog', null, 'lw-dialog'); dialog.setAttribute('aria-labelledby', 'lw-title');
    const head = el('header', null, 'lw-head'); const title = el('h2', guide.title); title.id = 'lw-title';
    head.append(title, button('閉じる ×', () => dialog.close(), 'lw-close'));
    const tabs = el('nav', null, 'lw-tabs'); tabs.setAttribute('aria-label', '教材の表示');
    const panels = {}, tabButtons = {};
    for (const [id, name] of [['learn','考え方・例'], ['quiz','確認問題'], ['sources','根拠資料']]) {
      const p = el('section', null, 'lw-panel'); p.id = 'lw-' + id; panels[id] = p;
      const b = button(name, () => select(id)); b.setAttribute('aria-controls', p.id); tabButtons[id] = b; tabs.append(b);
    }
    const body = el('div', null, 'lw-body'); body.append(...Object.values(panels));
    dialog.append(head, tabs, body); document.body.append(dialog);
    panels.learn.append(el('p', guide.lead, 'lw-lead'));
    guide.sections.forEach((section, index) => {
      const detail = el('details', null, 'lw-section'); detail.append(el('summary', String(index + 1).padStart(2, '0') + '  ' + section.title));
      const inner = el('div', null, 'lw-section-body');
      (section.body || []).forEach(text => inner.append(el('p', text)));
      if (section.formula) inner.append(el('p', section.formula, 'lw-formula'));
      if (section.steps?.length) { const list = el('ol'); section.steps.forEach(text => list.append(el('li', text))); inner.append(list); }
      if (section.table) {
        const wrap = el('div', null, 'lw-table-wrap'), table = el('table'), row = el('tr'), thead = el('thead'), tbody = el('tbody');
        section.table.headers.forEach(text => { const th = el('th', text); th.scope = 'col'; row.append(th); }); thead.append(row);
        section.table.rows.forEach(values => { const tr = el('tr'); values.forEach(text => tr.append(el('td', String(text)))); tbody.append(tr); });
        table.append(thead, tbody); wrap.append(table); inner.append(wrap);
      }
      if (section.example) {
        const ex = el('section', null, 'lw-example'); ex.append(el('h3', '具体例'), el('p', section.example.question));
        const answer = el('details'); answer.append(el('summary', '途中の考え方と答えを見る'));
        const list = el('ol'); (section.example.steps || []).forEach(text => list.append(el('li', text)));
        answer.append(list, el('p', section.example.answer, 'lw-answer')); ex.append(answer); inner.append(ex);
      }
      detail.append(inner); panels.learn.append(detail);
    });
    const progress = el('p', null, 'lw-progress'); progress.setAttribute('role', 'status');
    const storage = el('p', '確認の記録はこの端末・ブラウザーに保存。現場の試験記録や資格試験の得点とは別です。', 'lw-small');
    const updateProgress = () => { const checked = guide.checks.filter((_, i) => typeof record[i]?.correct === 'boolean'); const correct = checked.filter((_, i) => false); progress.textContent = '回答済み ' + checked.length + ' / ' + guide.checks.length + '問 · 直近正解 ' + guide.checks.filter((_, i) => record[i]?.correct === true).length + '問'; };
    panels.quiz.append(el('h3', '条件から、自分で説明できるか'), storage, progress);
    guide.checks.forEach((check, i) => {
      const form = el('form', null, 'lw-question'); const field = el('fieldset'); field.append(el('legend', 'Q' + (i + 1) + '  ' + check.question));
      check.choices.forEach((choice, j) => { const label = el('label', null, 'lw-choice'), input = el('input'); input.type = 'radio'; input.name = 'answer'; input.value = String(j); label.append(input, el('span', choice)); field.append(label); });
      const submit = el('button', '答え合わせ', 'lw-primary'); submit.type = 'submit';
      const feedback = el('p', null, 'lw-feedback'); feedback.setAttribute('role', 'status');
      form.append(field, submit, feedback);
      form.addEventListener('submit', e => {
        e.preventDefault(); const selected = form.querySelector('input:checked');
        if (!selected) { feedback.textContent = '選択肢を一つ選んでください。'; return; }
        const correct = Number(selected.value) === check.answer;
        feedback.textContent = (correct ? '○ 正解。' : 'もう一度確認。正解は「' + check.choices[check.answer] + '」。') + ' ' + check.explanation;
        feedback.dataset.correct = String(correct); record[i] = {correct, at:new Date().toISOString()};
        try { localStorage.setItem(key, JSON.stringify(record)); } catch (_) { storage.textContent = 'このブラウザーでは記録を保存できません。回答は画面内で確認できます。'; }
        updateProgress();
      }); panels.quiz.append(form);
    }); updateProgress();
    const reset = button('回答欄だけ空にする', () => { panels.quiz.querySelectorAll('form').forEach(form => { form.reset(); const f = form.querySelector('.lw-feedback'); f.textContent = ''; delete f.dataset.correct; }); });
    panels.quiz.append(reset, el('p', '回答欄を空にしても復習記録は残ります。', 'lw-small'));
    panels.sources.append(el('h3', '確認に使った資料'), el('p', '例題・確認問題は本サイトの学習用です。実機の適用範囲は資料の版・型式・設備条件と照合してください。'));
    const sources = el('ul', null, 'lw-sources');
    guide.sources.forEach(source => { let url; try { url = new URL(source.url); } catch (_) { return; } if (!['https:','http:'].includes(url.protocol)) return; const li = el('li'), a = el('a', source.label); a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a, el('p', [source.date, source.accessed ? '確認 ' + source.accessed : ''].filter(Boolean).join(' / '), 'lw-small')); sources.append(li); });
    panels.sources.append(sources);
    let opener;
    function select(id) { for (const [key, panel] of Object.entries(panels)) { panel.hidden = key !== id; tabButtons[key].setAttribute('aria-pressed', String(key === id)); } body.scrollTop = 0; }
    function open(id, from) { opener = from; select(id); if (!dialog.open) dialog.showModal(); tabButtons[id].focus(); }
    dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
    dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
    select('learn');
  }
})();
