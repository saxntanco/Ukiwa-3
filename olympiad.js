(() => {
  'use strict';
  const fields = [...document.querySelectorAll('.field[data-group]')];
  if (!fields.length) return;
  const search = document.getElementById('olym-search');
  const buttons = [...document.querySelectorAll('button[data-group]')];
  let group = 'space';
  const normalize = text => text.normalize('NFKC').toLocaleLowerCase('ja').trim();
  function filter() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const field of fields) {
      const haystack = normalize(field.dataset.search + ' ' + field.querySelector('summary').textContent);
      const visible = words.length ? words.every(word => haystack.includes(word)) : group === 'all' || field.dataset.group === group;
      field.hidden = !visible;
      if (visible) count++;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', String(!words.length && button.dataset.group === group)));
    document.getElementById('olym-count').textContent = (words.length ? '全分野から検索：' : '') + count + ' / ' + fields.length + '分野';
    document.getElementById('olym-empty').hidden = count !== 0;
  }
  function fromHash() {
    const target = fields.find(field => '#' + field.id === location.hash);
    if (!target) return;
    search.value = '';
    group = target.dataset.group;
    filter();
    target.open = true;
    target.scrollIntoView({block: 'start'});
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    group = button.dataset.group;
    search.value = '';
    filter();
  }));
  search.addEventListener('input', filter);
  document.getElementById('olym-reset').addEventListener('click', () => {
    search.value = '';
    group = 'space';
    fields.forEach(field => { field.open = false; });
    filter();
    search.focus();
  });
  window.addEventListener('hashchange', fromHash);
  document.getElementById('directory-tools').hidden = false;
  filter();
  fromHash();
})();
