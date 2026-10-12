(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const topics = [...document.querySelectorAll('.topic')];
  const problems = [...document.querySelectorAll('.problem')];
  let closeTarget = null;
  document.documentElement.classList.add('js');
  function render() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    const target = $(id);
    const topic = target?.closest('.topic');
    const problem = target?.closest('.problem');
    const guide = id === 'sources' || id === 'prize';
    $('entrance').hidden = Boolean(topic);
    document.querySelector('.page-heading').hidden = Boolean(topic);
    $('topic-controls').hidden = !topic;
    topics.forEach(item => { item.hidden = item !== topic; });
    problems.forEach(item => { item.open = item === problem; });
    if (topic) {
      $('topic-select').value = topic.id;
      document.title = (problem ? problem.querySelector('.problem-name').textContent : $(topic.id + '-title').textContent) + '｜未解決問題の図鑑';
    } else {
      document.title = '未解決問題の図鑑｜うきわ図書室';
      if (id && id !== 'entrance' && !guide) history.replaceState(null, '', location.pathname + location.search + '#entrance');
    }
    if (guide) $(id === 'prize' ? 'prize' : 'evidence-guide').open = true;
    requestAnimationFrame(() => {
      if (closeTarget) {
        const summary = closeTarget.querySelector('summary');
        summary.scrollIntoView({block:'start'});
        summary.focus({preventScroll:true});
        closeTarget = null;
      } else if (topic || guide) {
        const focusTarget = target === problem ? problem.querySelector('summary') : target === topic ? $(topic.id + '-title') : target.closest('.explanation')?.querySelector('h3') || target;
        focusTarget.scrollIntoView({block:'start'});
        if (!focusTarget.matches('summary,button,a,input,select')) focusTarget.setAttribute('tabindex','-1');
        focusTarget.focus({preventScroll:true});
      } else {
        window.scrollTo(0,0);
      }
    });
  }
  document.addEventListener('click', event => {
    const summary = event.target.closest('.problem > summary');
    const close = event.target.closest('.close-problem');
    if (summary || close) {
      event.preventDefault();
      const problem = (summary || close).closest('.problem');
      if (problem.open) {
        closeTarget = problem;
        location.hash = problem.closest('.topic').id;
      } else location.hash = problem.id;
    }
  });
  $('topic-select').addEventListener('change', event => { location.hash = event.target.value; });
  window.addEventListener('hashchange', render);
  render();
})();
