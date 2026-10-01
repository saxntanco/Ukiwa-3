/* The guide remains readable with scripts disabled; math is native MathML. */
(() => {
  'use strict';
  const topics = [...document.querySelectorAll('.ef-topic')];
  const gasButtons = [...document.querySelectorAll('[data-gas]')];
  const gasPanels = [...document.querySelectorAll('.ef-gas-panel')];
  function selectGas(id) {
    gasButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.gas === id)));
    gasPanels.forEach(panel => { panel.hidden = panel.id !== `gas-${id}`; });
  }
  selectGas('temperature');
  document.querySelector('.ef-gas-controls').hidden = false;
  gasButtons.forEach(button => button.addEventListener('click', () => selectGas(button.dataset.gas)));
  document.querySelector('.ef-tools').hidden = false;
  document.getElementById('open-all').addEventListener('click', () => topics.forEach(topic => { topic.open = true; }));
  document.getElementById('close-all').addEventListener('click', () => topics.forEach(topic => { topic.open = false; }));

  function revealHash(focus = false) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    const topic = target.closest('.ef-topic');
    if (topic) {
      topic.open = true;
      if (focus) topic.querySelector('summary').focus({preventScroll:true});
    }
    requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  }
  // Handle a repeated link to the current hash after its topic was closed.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') === location.hash) {
      event.preventDefault();
      revealHash(true);
    }
  });
  window.addEventListener('hashchange', () => revealHash(true));
  revealHash();

  const scrollAreas = [...document.querySelectorAll('.ef-equation,.ef-table-wrap')];
  function labelOverflow() {
    scrollAreas.forEach(area => {
      area.dataset.scroll = String(area.clientWidth > 0 && area.scrollWidth > area.clientWidth + 1);
    });
  }
  document.addEventListener('toggle', labelOverflow, true);
  window.addEventListener('resize', labelOverflow);
  document.fonts.ready.then(labelOverflow);

  let printState;
  window.addEventListener('beforeprint', () => {
    const details = [...document.querySelectorAll('.ef-topic,.ef-intro,.ef-reference')];
    printState = details.map(item => [item, item.open]);
    details.forEach(item => { item.open = true; });
    gasPanels.forEach(panel => { panel.hidden = false; });
  });
  window.addEventListener('afterprint', () => {
    if (printState) printState.forEach(([item, wasOpen]) => { item.open = wasOpen; });
    const selected = gasButtons.find(button => button.getAttribute('aria-pressed') === 'true');
    selectGas(selected.dataset.gas);
  });
})();
