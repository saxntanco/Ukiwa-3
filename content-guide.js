/* One navigation system for the site's existing content; no changes to calculation values. */
(() => {
  'use strict';
  if (document.querySelector('script[data-content-guide-loaded]')) return;
  const script = document.currentScript;
  script.dataset.contentGuideLoaded = 'true';
  const base = new URL('.', script.src);
  const here = new URL(location.href);
  const localPath = decodeURIComponent(here.pathname.slice(base.pathname.length)).replace(/index\.html$/, '');
  const isPrivate = !!document.querySelector('script[src*="hideout-nav.js"]') || /^(hidden-menu|ukiwa-lab)\.html$/.test(localPath);
  const asset = (path, type) => new Promise((resolve, reject) => {
    const node = document.createElement(type === 'css' ? 'link' : 'script');
    if (type === 'css') { node.rel = 'stylesheet'; node.href = new URL(path, base); }
    else node.src = new URL(path, base);
    node.onload = resolve; node.onerror = reject; document.head.append(node);
  });
  const ready = document.readyState === 'loading' ? new Promise(r => document.addEventListener('DOMContentLoaded', r, {once:true})) : Promise.resolve();
  Promise.all([ready, asset('content-guide.css?v=20260930b', 'css'), asset('content-guide-data.js?v=20260930b'), ...(isPrivate ? [asset('content-guide-private.js?v=20260930b')] : [])]).then(init).catch(() => {});
  function init() {
    const items = [...window.UkiwaContents, ...(isPrivate ? window.UkiwaPrivateContents : [])];
    const current = items.find(x => decodeURIComponent(new URL(x.path, base).pathname).replace(/index\.html$/, '') === decodeURIComponent(here.pathname).replace(/index\.html$/, ''));
    const el = (tag, text, cls) => { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; };
    const link = (item, cls) => { const a = el('a', '', cls); a.href = new URL(item.path, base); a.append(el('span', item.category, 'uc-tag'), el('strong', item.title), el('span', item.description, 'uc-description')); return a; };
    const dialog = el('dialog', '', 'uc-dialog'); dialog.setAttribute('aria-labelledby', 'uc-title');
    const head = el('div', '', 'uc-dialog-head'); const title = el('h2', '目的から教材を探す'); title.id = 'uc-title';
    const close = el('button', '閉じる ×', 'uc-close'); close.type = 'button'; close.addEventListener('click', () => dialog.close()); head.append(title, close);
    const intro = el('p', '型式・試験名・疑問から、原理・図解・計算・確認資料への入口を探せます。', 'uc-intro');
    const label = el('label', '探したいこと'); label.htmlFor = 'uc-search';
    const search = el('input'); search.id = 'uc-search'; search.type = 'search'; search.placeholder = '例：ゼロメグ、CT二次、A1 A2、発電機、一定'; search.autocomplete = 'off';
    const tabs = el('div', '', 'uc-tabs'); tabs.setAttribute('aria-label', '教材の分野');
    let category = 'すべて';
    const categories = ['すべて', ...new Set(items.map(x => x.category))];
    for (const name of categories) {
      const button = el('button', name); button.type = 'button'; button.setAttribute('aria-pressed', String(name === category));
      button.addEventListener('click', () => { category = name; for (const b of tabs.children) b.setAttribute('aria-pressed', String(b === button)); render(); }); tabs.append(button);
    }
    const status = el('p', '', 'uc-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const results = el('div', '', 'uc-results');
    const terms = el('details', '', 'uc-terms'); terms.append(el('summary', '混同しやすい言葉を、ここで確認'));
    const definitions = [
      ['「一定」', '指定した量の値が変わらないこと。PV＝一定なら、PとVは変わっても積が同じです。V/T＝一定なら比が同じです。', 'energy-kamoku2.html'],
      ['絶対温度と温度差', '温度の比にはKを使います。T[K]＝t[℃]＋273.15。温度差は1Kと1℃が同じ大きさです。', 'energy-kamoku2.html'],
      ['一次・二次', 'CTなら一次は設備側の電流、二次は計器・継電器へ送る電流。比が50/5なら一次50Aに対して二次5Aという対応です。', 'ct-calculator.html'],
      ['対地・相間・開いた接点間', '対地は導電部と接地側、相間はR–Sなど別の相、開いた接点間は同じ極の電源側と負荷側。測る二点が違います。', 'insulation-resistance-principle.html'],
      ['設定値・計算値・実測値', '設定値は機器に与える条件、計算値は入力と仮定から求めた値、実測値は実際に測った値。計算できても実機の状態を確認したことにはなりません。', 'test-measurement.html'],
      ['a接点・b接点の基準状態', '一般の電磁リレーではコイルが消磁した状態で、a接点は開、b接点は閉。押しボタン等は非操作状態が基準です。機器の図面で基準状態を確認します。', 'sequence-basics.html'],
      ['絶縁抵抗・耐圧', '絶縁抵抗は印加電圧と流れる電流から抵抗を求める測定。耐圧は指定電圧・時間・方法で絶縁が耐えるかの試験。抵抗が高いだけで耐圧良好とは判定しません。', 'insulation-resistance-principle.html'],
      ['許容電流・流れる電流', '許容電流は条件のもとで許容される上限、流れる電流は負荷や回路条件で決まる値。上限の数字がそのまま実際の電流になるわけではありません。', 'ac-withstand-test-simulator.html']
    ];
    for (const [name, definition, path] of definitions) {
      const section = el('section'); section.append(el('h3', name), el('p', definition));
      if (!['energy-kamoku2.html'].includes(path) || isPrivate) { const a = el('a', '関連する教材を読む →'); a.href = new URL(path, base); section.append(a); }
      terms.append(section);
    }
    const credit = el('p', '用語は本サイトによる整理。', 'uc-credit');
    const source = el('a', '根拠：日本電気技術者協会「絶縁抵抗測定の要領」'); source.href = 'https://www.jeea.or.jp/course/contents/02201/'; source.target = '_blank'; source.rel = 'noopener'; credit.append(source);
    const thermalSource = el('a', '東邦大学「ボイル‐シャルルの法則」'); thermalSource.href = 'https://www.toho-u.ac.jp/sci/biomol/glossary/chem/Boyle_Charles_law.html'; thermalSource.target = '_blank'; thermalSource.rel = 'noopener'; credit.append(thermalSource); terms.append(credit);
    dialog.append(head, intro, label, search, tabs, status, results, terms); document.body.append(dialog);
    const normalize = s => s.normalize('NFKC').toLowerCase().replace(/[‐‑–—−ー]/g, '-').replace(/\s+/g, ' ').trim();
    const aliases = s => s.replace(/めが[ー-]|ゼロメグ/g,'絶縁抵抗').replace(/エネ管/g,'エネルギ-').replace(/うきわめも/g,'うきわメモ').replace(/科目/g,'課目').replace(/ct二次/g,'ct 二次').replace(/ct一次/g,'ct 一次');
    function render() {
      const words = aliases(normalize(search.value)).split(' ').filter(Boolean);
      const filtered = items.filter(x => (category === 'すべて' || x.category === category) && words.every(w => aliases(normalize([x.title, x.description, x.tags, x.category].join(' '))).includes(w)));
      status.textContent = `${filtered.length}件 / ${items.length}教材`;
      results.replaceChildren(...filtered.map(x => { const a = link(x, 'uc-card'); if (x === current) { a.setAttribute('aria-current', 'page'); a.append(el('span', 'いま読んでいる教材', 'uc-current')); } return a; }));
      if (!filtered.length) results.append(el('p', '見つかりませんでした。型式の一部や「接地」「絶縁」「発電機」などの言葉でも探せます。', 'uc-empty'));
      terms.open = /一定|絶対温度|基準状態/.test(search.value);
    }
    search.addEventListener('input', render); render();
    let opener;
    const open = button => { opener = button; dialog.showModal(); search.focus(); };
    dialog.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); dialog.close(); } });
    dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll:true}); });
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
    const button = el('button', '教材を探す', 'uc-entry'); button.type = 'button'; button.setAttribute('aria-haspopup', 'dialog'); button.addEventListener('click', () => open(button));
    const nav = document.querySelector('.hideout-navigation') || document.querySelector('header .topActions') || document.querySelector('header .topin') || document.querySelector('header .shell') || document.querySelector('header nav') || document.querySelector('header');
    const homeSearch = current?.path === 'index.html' && document.querySelector('#search .core');
    if (homeSearch) { const bar = el('nav', '', 'uc-home-search'); bar.setAttribute('aria-label', '教材検索'); bar.append(button); const anchor = homeSearch.querySelector('.quick') || homeSearch.querySelector('.search'); if (anchor) anchor.after(bar); else homeSearch.append(bar); }
    else if (nav) nav.append(button);
    else { const bar = el('nav', '', 'uc-entry-bar'); bar.setAttribute('aria-label', '教材検索'); bar.append(button); document.body.prepend(bar); }
    // Private study/game screens manage their own scrolling and view height.
    if (current && !isPrivate && current.related.length) {
      const section = el('section', '', 'uc-related'); section.setAttribute('aria-labelledby', 'uc-related-title');
      const heading = el('h2', '理解をつなげる教材'); heading.id = 'uc-related-title'; section.append(heading);
      const cards = el('div', '', 'uc-related-grid');
      for (const path of current.related) { const item = items.find(x => x.path === path); if (item) cards.append(link(item, 'uc-card')); }
      section.append(cards);
      const main = document.querySelector('main'); if (main) main.append(section); else document.body.append(section);
    }
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'uc-main';
    if (main && !document.querySelector('.skip-link,a[href="#' + main.id + '"]')) {
      const skip = el('a', '本文へ進む', 'uc-skip'); skip.href = '#' + main.id;
      skip.addEventListener('click', () => { main.tabIndex = -1; main.focus({preventScroll:true}); }); document.body.prepend(skip);
    }
  }
})();
