/* Site-wide contextual glossary. Text is retained; controls, math and diagrams are never rewritten. */
(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) { module.exports = core; return; }
  if (root.UkiwaTermHelp) return;
  root.UkiwaTermHelp = { version: '20261011-1' };
  const script = document.currentScript;
  const base = new URL('.', script.src);
  const load = (file, css) => new Promise((resolve, reject) => {
    const node = document.createElement(css ? 'link' : 'script');
    if (css) { node.rel = 'stylesheet'; node.href = new URL(file, base); }
    else node.src = new URL(file, base);
    node.onload = resolve; node.onerror = reject; document.head.append(node);
  });
  const ready = document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true })) : Promise.resolve();
  Promise.all([ready, load('term-help.css?v=20261011-1', true), load('term-help-data.js?v=20261010')])
    .then(() => init(root.UkiwaTermData.entries)).catch(() => { /* Original page remains fully usable if the optional glossary cannot load. */ });

  function init(entries) {
    const matcher = core.createMatcher(entries);
    const byId = new Map(entries.map(entry => [entry.id, entry]));
    const storageKey = 'ukiwa-term-hints-v1';
    let enabled = true;
    try { enabled = localStorage.getItem(storageKey) !== 'off'; } catch (_) { /* Storage is optional. */ }
    const skip = 'script,style,noscript,template,svg,math,mjx-container,canvas,iframe,pre,code,kbd,samp,a,button,input,select,textarea,option,label,summary,nav,header,footer,h1,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="radio"],[role="option"],[role="menuitem"],[onclick],[data-no-term-help],.ut-dialog,.ut-entry-wrap,.katex,.MathJax,.math,.equation,.formula';
    const sectionSelector = 'section,article,details,dialog,main,[role="tabpanel"],[data-term-section],.card';
    const headingSelector = 'h2,h3,h4,h5,h6';
    const sectionOf = node => (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest(sectionSelector) || document.body;
    const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
    const dialog = el('dialog', '', 'ut-dialog');
    dialog.id = 'ut-dialog'; dialog.setAttribute('aria-labelledby', 'ut-title');
    dialog.dataset.noTermHelp = '';
    const head = el('div', '', 'ut-head');
    const headingGroup = el('div');
    const eyebrow = el('p', 'ことばのヒント', 'ut-eyebrow');
    const title = el('h2'); title.id = 'ut-title';
    const close = el('button', '×', 'ut-close'); close.type = 'button'; close.setAttribute('aria-label', '用語の解説を閉じる');
    headingGroup.append(eyebrow, title); head.append(headingGroup, close);
    const body = el('div', '', 'ut-body'); dialog.append(head, body); document.body.append(dialog);
    let opener = null;
    let listQuery = '';
    let listMode = false;
    const isPrivate = () => !!document.querySelector('script[src*="hideout-nav.js"]') || /\/(hidden-menu|ukiwa-lab)\.html$/.test(location.pathname);
    const privatePaths = /^(energy-|denken-|library\.html|hidden-menu|island-game|circuit-duel)/;

    function contextual(entry) {
      const context = (entry.contexts || []).find(item => item.pages.some(path => location.pathname.includes(path)));
      return context ? { ...entry, ...context } : entry;
    }
    function position() {
      if (!dialog.open || innerWidth <= 600) return;
      const size = dialog.getBoundingClientRect();
      const rect = opener?.isConnected ? opener.getBoundingClientRect() : null;
      const w = size.width || 392, h = size.height || 300;
      let left = rect ? rect.left : (innerWidth - w) / 2;
      let top = rect ? rect.bottom + 10 : (innerHeight - h) / 2;
      if (rect && top + h > innerHeight - 12) top = rect.top - h - 10;
      dialog.style.left = `${Math.max(12, Math.min(left, innerWidth - w - 12))}px`;
      dialog.style.top = `${Math.max(12, Math.min(top, innerHeight - h - 12))}px`;
    }
    function show(trigger) {
      if (!dialog.open) {
        opener = trigger || document.activeElement;
        if (opener?.classList.contains('ut-term')) opener.setAttribute('aria-expanded', 'true');
        dialog.showModal();
      }
      position();
      if (listMode) body.querySelector('input[type="search"]')?.focus({ preventScroll: true });
      else close.focus({ preventScroll: true });
    }
    function dismiss() { if (dialog.open) dialog.close(); }
    close.addEventListener('click', dismiss);
    dialog.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); dismiss(); });
    dialog.addEventListener('close', () => {
      if (opener?.isConnected) { opener.setAttribute('aria-expanded', 'false'); opener.focus({ preventScroll: true }); }
    });
    // A drag/scroll that begins inside the card must not count as an outside tap.
    let outsideDown = false;
    const outside = event => { const r = dialog.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; };
    dialog.addEventListener('pointerdown', event => { outsideDown = event.target === dialog && outside(event); });
    dialog.addEventListener('click', event => {
      if (outsideDown && event.target === dialog && outside(event)) dismiss();
      outsideDown = false;
      event.stopPropagation();
    });
    addEventListener('resize', position);

    function openTerm(id, trigger) {
      const raw = byId.get(id); if (!raw) return;
      const entry = contextual(raw); listMode = false;
      eyebrow.textContent = `ことばのヒント / ${entry.category}`;
      title.textContent = entry.term;
      body.replaceChildren(el('p', entry.definition));
      if (entry.example) { const example = el('div', '', 'ut-example'); example.append(el('b', 'たとえば'), el('p', entry.example)); body.append(example); }
      if (entry.note) body.append(el('p', entry.note, 'ut-note'));
      const footer = el('div', '', 'ut-footer');
      if (entry.path && (!privatePaths.test(entry.path) || isPrivate())) {
        const more = el('a', '関連する教材を読む →'); more.href = new URL(entry.path, base); footer.append(more);
      }
      const browse = el('button', 'ほかの用語'); browse.type = 'button'; browse.addEventListener('click', () => openList(null)); footer.append(browse);
      body.append(footer);
      if (entry.source) {
        const source = el('p', '', 'ut-source'); const link = el('a', entry.source.label);
        link.href = entry.source.url; link.target = '_blank'; link.rel = 'noopener';
        source.append(link, document.createTextNode(`（確認 ${entry.source.checked}）`)); body.append(source);
      }
      show(trigger);
    }
    function openList(trigger) {
      listMode = true; eyebrow.textContent = 'ことばのヒント'; title.textContent = '用語を探す'; body.replaceChildren();
      body.append(el('p', '本文の背景色が付いた用語をタップすると、このページのまま短い意味と例を読めます。同じ用語は節の最初に表示します。'));
      const setting = el('label', '', 'ut-setting'); const checkbox = el('input'); checkbox.type = 'checkbox'; checkbox.checked = enabled;
      setting.append(checkbox, document.createTextNode('本文に用語のヒントを表示'));
      checkbox.addEventListener('change', () => {
        enabled = checkbox.checked;
        try { localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch (_) { /* Optional. */ }
        for (const term of document.querySelectorAll('button.ut-term')) term.disabled = !enabled;
      });
      const searchLabel = el('label', '用語・略語で検索'); searchLabel.htmlFor = 'ut-search';
      const search = el('input', '', 'ut-search'); search.id = 'ut-search'; search.type = 'search'; search.placeholder = '例：負担、励磁、エンタルピー'; search.autocomplete = 'off'; search.value = listQuery;
      const status = el('p', '', 'ut-status'); status.setAttribute('role', 'status');
      const list = el('div', '', 'ut-list');
      function render() {
        listQuery = search.value; const query = core.normalize(listQuery).trim();
        const present = new Set([...document.querySelectorAll('.ut-term')].map(node => node.dataset.utId));
        const found = entries.filter(entry => core.normalize([entry.term, ...entry.aliases, entry.category].join(' ')).includes(query));
        found.sort((a, b) => Number(present.has(b.id)) - Number(present.has(a.id)) || a.term.localeCompare(b.term, 'ja'));
        status.textContent = `${found.length}語${found.length > 40 ? '・先頭40語を表示。入力して絞り込めます' : ''}`;
        list.replaceChildren();
        for (const entry of found.slice(0, 40)) {
          const button = el('button'); button.type = 'button';
          button.append(el('span', entry.term), el('small', present.has(entry.id) ? 'このページ' : entry.category));
          button.addEventListener('click', () => openTerm(entry.id, null)); list.append(button);
        }
        if (!found.length) list.append(el('p', 'まだ登録されていない用語です。略語や別の言い方でも探せます。'));
        position();
      }
      search.addEventListener('input', render); body.append(setting, searchLabel, search, status, list); render(); show(trigger);
    }

    const launcher = el('button', '? 用語のヒント', 'ut-entry'); launcher.type = 'button'; launcher.setAttribute('aria-haspopup', 'dialog'); launcher.setAttribute('aria-controls', dialog.id); launcher.title = '背景色の付いた用語をタップすると解説。用語一覧と表示設定';
    launcher.addEventListener('click', () => openList(launcher));
    const nav = document.querySelector('.hideout-navigation,header .topActions,header .topin,header nav,header');
    if (nav) nav.append(launcher);
    else { const bar = el('div', '', 'ut-entry-wrap'); bar.append(launcher); document.body.prepend(bar); }

    function annotate(scope) {
      if (!scope.isConnected || scope.closest?.(skip)) return;
      const nodes = [];
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('button.ut-term')) return NodeFilter.FILTER_ACCEPT;
          if (node.matches(skip)) return NodeFilter.FILTER_REJECT;
          return node.matches(headingSelector) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
        return node.parentElement && !node.parentElement.closest(skip) && node.data.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } });
      while (walker.nextNode()) nodes.push(walker.currentNode);
      // Headings start a new reading section; cards, results and dialogs have their own scope.
      // Keep existing first hints so a routine content update does not replace the focused button.
      const usedBySection = new Map();
      for (const node of nodes) {
        const parent = node.parentElement;
        if (!parent || parent.closest(skip) || !node.isConnected) continue;
        const section = sectionOf(node);
        if (node.nodeType === Node.ELEMENT_NODE && node.matches(headingSelector)) {
          usedBySection.set(section, new Set()); continue;
        }
        let used = usedBySection.get(section);
        if (!used) { used = new Set(); usedBySection.set(section, used); }
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (used.has(node.dataset.utId)) node.replaceWith(document.createTextNode(node.textContent));
          else used.add(node.dataset.utId);
          continue;
        }
        const matches = matcher(node.data).filter(match => { if (used.has(match.id)) return false; used.add(match.id); return true; });
        if (!matches.length) continue;
        const fragment = document.createDocumentFragment(); let cursor = 0;
        for (const match of matches) {
          fragment.append(document.createTextNode(node.data.slice(cursor, match.start)));
          const term = el('button', node.data.slice(match.start, match.end), 'ut-term'); term.type = 'button'; term.dataset.utId = match.id; term.disabled = !enabled;
          term.setAttribute('aria-haspopup', 'dialog'); term.setAttribute('aria-controls', dialog.id); term.setAttribute('aria-expanded', 'false');
          term.setAttribute('aria-label', `${term.textContent}の意味を読む`);
          fragment.append(term); cursor = match.end;
        }
        fragment.append(document.createTextNode(node.data.slice(cursor))); node.replaceWith(fragment);
      }
    }
    // Capture stops a term inside a clickable card from also navigating or answering a question.
    document.addEventListener('click', event => {
      const trigger = event.target.closest?.('button.ut-term');
      if (!trigger || !enabled) return;
      event.preventDefault(); event.stopImmediatePropagation(); openTerm(trigger.dataset.utId, trigger);
    }, true);
    const options = { subtree: true, childList: true, characterData: true };
    let timer = null; const pending = new Set();
    function flush() {
      timer = null; observer.disconnect();
      const scopes = [...pending].filter(node => node.isConnected); pending.clear();
      for (const scope of scopes) if (!scopes.some(other => other !== scope && other.contains(scope))) annotate(scope);
      observer.observe(document.body, options);
      if (dialog.open && opener && !opener.isConnected) dismiss();
    }
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
        if (!target || target.closest(skip)) continue;
        // Reconcile the whole section, including removals, so its next occurrence can become a hint.
        pending.add(sectionOf(target));
      }
      pending.delete(null);
      if (pending.size && timer === null) timer = setTimeout(flush, 100);
    });
    annotate(document.body); observer.observe(document.body, options);
    root.UkiwaTermHelp.count = entries.length;
    root.UkiwaTermHelp.ready = true;
  }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const normalize = text => String(text).normalize('NFKC').toLocaleLowerCase('en');
  const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function createMatcher(entries) {
    const map = new Map();
    for (const entry of entries) for (const alias of entry.aliases) {
      map.set(normalize(alias), entry.id);
      // Add full-width Latin spellings without changing offsets in the original prose.
    }
    const aliases = new Set(entries.flatMap(entry => entry.aliases.flatMap(alias => [alias, alias.replace(/[A-Za-z0-9]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0xfee0))])));
    const pattern = new RegExp([...aliases].sort((a, b) => b.length - a.length).map(escape).join('|'), 'giu');
    const latin = char => /[A-Za-z0-9_Ａ-Ｚａ-ｚ０-９]/u.test(char || '');
    return text => {
      pattern.lastIndex = 0; const found = []; let match;
      while ((match = pattern.exec(text))) {
        const token = match[0], start = match.index, end = start + token.length;
        if ((latin(token[0]) && latin(text[start - 1])) || (latin(token.at(-1)) && latin(text[end]))) continue;
        const id = map.get(normalize(token)); if (id) found.push({ id, start, end });
      }
      return found;
    };
  }
  return { normalize, createMatcher };
});
