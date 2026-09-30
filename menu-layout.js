/* Shared navigation improvements. Existing inputs, IDs and calculation handlers are retained. */
(() => {
  'use strict';
  function init() {
    const page = location.pathname.split('/').pop();
    const $ = s => document.querySelector(s);
    const all = s => [...document.querySelectorAll(s)];
    document.body.classList.add('menu-layout');
    const fold = (node, label) => {
      if (!node) return null;
      const details = document.createElement('details');
      details.className = 'menu-fold';
      const summary = document.createElement('summary');
      summary.textContent = label;
      node.before(details);
      details.append(summary, node);
      return details;
    };
    const jump = target => {
      for (let p = target.parentElement; p; p = p.parentElement) {
        if (p.tagName === 'DETAILS') p.open = true;
      }
      target.scrollIntoView({block: 'start', behavior: 'instant'});
      target.tabIndex = -1;
      target.focus({preventScroll: true});
    };
    const shortcuts = (anchor, label, items) => {
      if (!anchor) return;
      const nav = document.createElement('nav');
      nav.className = 'menu-shortcuts';
      nav.setAttribute('aria-label', label);
      for (const [text, id, key] of items) {
        const link = document.createElement('a');
        link.textContent = text;
        link.href = '#' + id;
        if (key) link.addEventListener('click', () => $(`[data-key="${key}"]`)?.click());
        nav.append(link);
      }
      anchor.after(nav);
    };
    const overview = $('#visual-overview');
    if (page === 'protective-relay.html') {
      fold($('.field-start'), '型式の探し方・資料の確認');
      const filters = fold($('.filters'), 'メーカー・機能・販売状況で絞り込む');
      if (filters) {
        const summary = filters.querySelector('summary');
        const update = () => {
          const selected = [...filters.querySelectorAll('button.active, button[aria-pressed="true"]')].map(b => b.textContent.trim()).filter(t => t !== 'すべて');
          summary.textContent = 'メーカー・機能・販売状況で絞り込む' + (selected.length ? '：' + selected.join(' / ') : '');
        };
        new MutationObserver(update).observe(filters.querySelector('.filters'), {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-pressed']});
        update();
      }
      $('.saved-search').hidden = true;
      $('#q').setAttribute('aria-label', '型式・メーカー・機能を検索');
      const main = $('main');
      const info = document.createElement('div');
      info.className = 'menu-reference';
      main.append(info);
      for (const node of [$('.stats'), $('.maker-audit'), overview]) if (node) info.append(node);
      fold(info, '収録情報・資料の見方');
    }
    if (page === 'test-measurement.html') {
      fold($('.field-start'), '試験方法の探し方');
      const tabs = $('.switch');
      const links = tabs?.querySelectorAll('a');
      if (links?.length === 2) { links[0].textContent = '試験名から探す'; links[0].href = '#method-search'; links[1].textContent = '器具型式から探す'; }
      tabs?.after($('#method-search'));
      fold($('.quick-tools'), 'よく使う器具・試験へのショートカット');
      if (overview) $('main').append(overview);
    }
    if (page === 'ocr-tap-calculator.html') {
      const intro = $('#ocr-start');
      const content = document.createElement('div');
      const nodes = [...intro.children].filter(n => !n.matches('small,h1,.start-lead,#demoBanner'));
      intro.append(content); nodes.forEach(n => content.append(n));
      const details = fold(content, '3つのつまみを図で学ぶ');
      details.id = 'ocr-introduction';
      $('#recordPanel').before(details);
      shortcuts(intro.querySelector('.start-lead'), '計算と学習の入口', [['すぐ計算する', 'commonPanel'], ['仕組みを学ぶ', 'ocr-introduction']]);
      if (overview) details.append(overview);
    }
    if (page === 'ac-withstand-test-simulator.html') {
      fold($('.field-start'), '使い方：入力から結果比較まで');
      if (overview) $('#source-notes').before(overview);
    }
    if (page === 'generator-rescue-island.html') {
      const guide = $('.shell.guide');
      if (guide) { $('#dbHome').append(guide); fold(guide, '試験を選ぶときのヒント'); }
      if (overview) { $('#dbHome').append(overview); overview.open = false; }
    }
    if (page === 'sequence-basics.html') {
      const catalog = $('.catalog');
      catalog.open = false;
      const update = () => { catalog.querySelector('summary').textContent = '教材を変更（全22教材）｜いま：' + $('#title').textContent; };
      const selected = () => { update(); catalog.open = false; jump($('#lesson')); };
      $('#steps').addEventListener('click', e => { if (e.target.closest('[data-step]')) selected(); });
      for (const id of ['prev', 'next']) $('#' + id).addEventListener('click', selected);
      update();
      if (overview) $('#lesson').after(overview);
    }
    if (page === 'vcb-inspection-guide.html') shortcuts($('.hero h1'), '点検項目から開く', [
      ['絶縁抵抗', 'visual', 'earth'], ['接点間', 'visual', 'gap'], ['主回路抵抗', 'visual', 'contact'], ['動作・連動', 'visual', 'trip']
    ]);
    if (page === 'instrument-calibration-guide.html') shortcuts($('.hero h1'), '計器と計算から開く', [
      ['携帯測定器', 'visual', 'source'], ['盤面計器', 'visual', 'panel'], ['誤差を計算', 'calculator']
    ]);
    if (page === 'ppe-withstand-guide.html') {
      const labels = ['手袋', '長靴', 'ヘルメット', 'シート・カバー', '操作棒'];
      const figures = all('#zukan figure');
      const entries = figures.map((n, i) => { n.id = 'ppe-item-' + i; return [labels[i], n.id]; }).filter(([label]) => label);
      shortcuts($('.hero h1'), '防具の種類から開く', entries);
    }
    if (page === 'cable-size-simulator.html') {
      const result = $('#singleResults');
      const details = fold(result, '単相3線の各区間を詳しく確認');
      const update = () => { details.hidden = result.hidden; };
      new MutationObserver(update).observe(result, {attributes: true, attributeFilter: ['hidden']});
      update();
    }
    // Open folded ancestors for both existing deep links and the new shortcuts.
    const openHash = () => {
      let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      if (target.tagName === 'DETAILS') target.open = true;
      jump(target);
    };
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (a && a.hash === location.hash) openHash();
    });
    window.addEventListener('hashchange', openHash);
    if (location.hash) openHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
