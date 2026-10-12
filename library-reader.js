(() => {
  'use strict';
  const data = window.UkiwaLibrary;
  if (!data) return;
  const byId = new Map(data.people.map(person => [person.id, person]));
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[ぁ-ゖ]/g,c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const searchText = new Map(data.people.map(p => [p.id, normalize([p.name,p.en,p.alias || '',p.question,p.thesis,p.tags.join(' '),p.background,...p.ideas.map(x=>x.body),data.fields[p.field]].join(' '))]));
  function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  const storedSaved = readStore('ukiwa-library-saved', []);
  const saved = new Set(Array.isArray(storedSaved) ? storedSaved.filter(id=>byId.has(id)) : []);
  let large = readStore('ukiwa-library-large', false) === true;
  let comparison = [];
  let browseScroll = 0;
  let renderedUrl = '';
  let toastTimer;
  function stateFromUrl() {
    const params = new URLSearchParams(location.search);
    return {q:params.get('q')||'',field:data.fields[params.get('field')]?params.get('field'):'all',route:data.routes.some(r=>r.id===params.get('route'))?params.get('route'):'',saved:params.get('saved')==='1',sort:['shelf','oldest','name'].includes(params.get('sort'))?params.get('sort'):'shelf'};
  }
  const state = stateFromUrl();
  function message(text) { $('library-message').textContent=text; $('library-message').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('library-message').hidden=true,3000); }
  function persist(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { message('このブラウザーでは保存できません。この画面内では使えます。'); return false; } }
  function syncUrl() { const url=new URL(location.href); for(const [key,value] of Object.entries(state)){ if(value && value!=='all' && value!=='shelf') url.searchParams.set(key,value===true?'1':value); else url.searchParams.delete(key); } history.replaceState(null,'',url); }
  function syncControls() { $('people-search').value=state.q; $('field-filter').value=state.field; $('sort-order').value=state.sort; $('saved-only').setAttribute('aria-pressed',String(state.saved)); $('saved-count').textContent=saved.size; $('clear-search').hidden=!state.q; document.querySelectorAll('[data-route]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.route===state.route))); }
  function renderList() {
    syncControls();
    const words=normalize(state.q.trim()).split(/\s+/).filter(Boolean);
    const route=data.routes.find(r=>r.id===state.route);
    const people=data.people.filter(p=>(state.field==='all'||p.field===state.field)&&(!state.saved||saved.has(p.id))&&(!route||route.people.includes(p.id))&&words.every(word=>searchText.get(p.id).includes(word)));
    if(state.sort==='oldest') people.sort((a,b)=>a.born-b.born);
    else if(state.sort==='name') people.sort((a,b)=>a.name.localeCompare(b.name,'ja'));
    else if(route) people.sort((a,b)=>route.people.indexOf(a.id)-route.people.indexOf(b.id));
    $('route-note').hidden=!route;
    if(route) $('route-note').innerHTML=`<strong>${esc(route.title)}</strong>${esc(route.description)}<br>表示順に読むと、立場の違いをたどれます。`;
    $('result-count').textContent=`${people.length}人 / 全${data.people.length}人${state.saved?' · あとで読む':''}`;
    $('people-list').innerHTML=people.map(p=>`<article class="person-row"><a class="person-link" href="#${p.id}"><p class="person-meta"><span>${esc(data.fields[p.field])}</span><span>${esc(p.years)}</span>${saved.has(p.id)?'<span>しおりあり</span>':''}</p><h3>${esc(p.name)}</h3><p class="person-question">${esc(p.question)}</p><p class="person-keywords">${p.tags.map(esc).join(' / ')}</p><span class="row-arrow" aria-hidden="true">↗</span></a></article>`).join('');
    $('empty-state').hidden=people.length!==0;
  }
  function reset(){ Object.assign(state,{q:'',field:'all',route:'',saved:false,sort:'shelf'});syncUrl();renderList(); }
  const links = ids => ids.filter(id=>byId.has(id)).map(id=>`<a href="#${id}">${esc(byId.get(id).name)} →</a>`).join('');
  const sections = [['idea','考えを一言で'],['background','問いの背景'],['arguments','主張の中身'],['example','身近な例'],['debate','反論・限界'],['works','原典・代表作'],['connections','つなげて読む'],['sources','出典']];
  const sectionLinks = () => sections.map(([id,label])=>`<a href="#${id}" data-section="${id}">${label}</a>`).join('');
  function sourceList(p) { return p.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a><span class="source-type">${esc(s.type)} · ${esc(s.note || '出典確認：2026-10-12')}</span></li>`).join(''); }
  function renderReader(p) {
    $('reader-view').innerHTML=`<div class="reader-toolbar"><a href="#catalog" data-back>← 人物の本棚へ</a><div class="reader-actions"><button class="quiet-button" data-save="${p.id}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id)?'しおりを外す':'あとで読む'}</button><button class="quiet-button" data-compare="${p.id}" aria-pressed="${comparison.includes(p.id)}">${comparison.includes(p.id)?'比較から外す':'比べる候補に'}</button><button class="quiet-button" data-font aria-pressed="${large}">文字を大きく</button></div></div>
      <div class="reader-layout"><article class="reader-article"><header class="reader-title"><p class="person-meta"><span>${esc(data.fields[p.field])}</span><span>${esc(p.years)}</span></p><h1 tabindex="-1" id="person-title">${esc(p.name)}</h1><p class="reader-en">${esc(p.en)} · ${p.tags.map(esc).join(' / ')}</p><p class="reader-question">${esc(p.question)}</p></header>
      <details class="reader-mobile-toc"><summary>この解説の目次・出典へ</summary><nav aria-label="この解説の目次">${sectionLinks()}</nav></details>
      <div class="reader-body"><section id="idea"><h2>考えを一言で</h2><p class="reader-summary">${esc(p.thesis)}</p><p class="reader-caption">内容をかみ砕いた要約です。本人の発言の引用ではありません。</p></section>
      <section id="background"><h2>なぜ、その問いを考えた？</h2><p>${esc(p.background)}</p></section>
      <section id="arguments"><h2>何を主張したのか</h2>${p.ideas.map((idea,i)=>`<h3>${i+1}. ${esc(idea.title)}</h3><p>${esc(idea.body)}</p>`).join('')}</section>
      <section id="example"><h2>身近な場面で考える</h2><div class="example-text"><p>${esc(p.example)}</p></div><p class="reader-caption">理解のために作った例です。本人の発言・実験結果ではありません。</p></section>
      <section id="debate"><h2>反論・限界・誤解しやすい点</h2><p>${esc(p.caution)}</p></section>
      <section id="works"><h2>原典・代表的な仕事</h2><ul class="work-list">${p.works.map(w=>`<li>${esc(w.title)}<span>${esc(w.year)} · ${esc(w.note)}</span></li>`).join('')}</ul></section>
      <section id="connections"><h2>つなげて読む</h2><div class="related-links">${links(p.related)}</div></section>
      <section id="sources"><h2>出典・さらに読む</h2><ol class="source-list">${sourceList(p)}</ol><p class="reader-caption">原典の翻訳名・版は複数あります。解説は主張の全体を置き換えるものではありません。人物解説更新：2026-10-12。</p></section></div>
      <div class="reader-bottom"><a href="#catalog" data-back>← 本棚に戻る</a><button class="quiet-button" data-share="${p.id}">この人物のリンクをコピー</button></div></article>
      <nav class="reader-aside" aria-label="この解説の目次"><p>この人を読む</p>${sectionLinks()}</nav></div>`;
    document.title=`${p.name}の考え｜うきわ図書室`;
    document.documentElement.style.setProperty('--reading',large?'21px':'18px');
  }
  function renderComparison(ids) {
    const people=ids.map(id=>byId.get(id)).filter(Boolean);
    if(people.length!==2||people[0].id===people[1].id) return false;
    const rows=[['中心の問い',p=>esc(p.question)],['考えを一言で',p=>esc(p.thesis)],['主張の中身',p=>p.ideas.map(x=>`<p><strong>${esc(x.title)}</strong><br>${esc(x.body)}</p>`).join('')],['反論・限界',p=>esc(p.caution)],['詳しい解説・出典',p=>`<a href="#${p.id}">${esc(p.name)}を読む →</a>`]];
    $('compare-view').innerHTML=`<div class="reader-toolbar"><a href="#catalog" data-back>← 人物の本棚へ</a><button class="quiet-button" data-share-compare>比較のリンクをコピー</button></div><header class="compare-heading"><p class="eyebrow">READ SIDE BY SIDE</p><h1 tabindex="-1">2人の考えを、<br class="mobile-break">並べて読む。</h1><p>同じ言葉でも、問いや前提が違うことがあります。優劣を決める表ではなく、違いを見つける入口です。</p></header><table class="compare-table"><thead><tr>${people.map(p=>`<th scope="col">${esc(p.name)}<small>${esc(data.fields[p.field])} · ${esc(p.years)}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([label,content])=>`<tr class="compare-label"><th colspan="2">${label}</th></tr><tr>${people.map(p=>`<td>${content(p)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    document.title=`${people.map(p=>p.name).join('と')}を比較｜うきわ図書室`;
    return true;
  }
  function renderTray(){ $('compare-tray').hidden=comparison.length===0||!$('compare-view').hidden; $('compare-selection').textContent=comparison.length?comparison.map(id=>byId.get(id).name).join(' × ')+(comparison.length===1?' / もう1人選んでください':''):''; $('compare-open').disabled=comparison.length!==2; }
  function route(){
    if(renderedUrl===location.href) return;
    renderedUrl=location.href;
    let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{hash='';}
    const person=byId.get(hash);
    const compare=hash.startsWith('compare=')&&renderComparison(hash.slice(8).split(','));
    const isBrowse=!person&&!compare;
    $('browse-view').hidden=!isBrowse; $('reader-view').hidden=!person; $('compare-view').hidden=!compare;
    if(person){renderReader(person);window.scrollTo(0,0);$('person-title').focus({preventScroll:true});}
    else if(compare){window.scrollTo(0,0);$('compare-view').querySelector('h1').focus({preventScroll:true});}
    else {renderList();document.title='うきわ図書室｜人物と思想を旅する';if(hash==='collections')$('collections').scrollIntoView();else if(hash==='catalog')window.scrollTo(0,browseScroll||$('catalog').offsetTop-65);else if(hash){message('人物が見つからないため、本棚を表示しました。');history.replaceState(null,'',location.pathname+location.search+'#catalog');}}
    renderTray();
  }
  async function copyLink(url){try{await navigator.clipboard.writeText(url);message('リンクをコピーしました。');}catch{message('コピーできませんでした。アドレス欄のURLから共有できます。');}}
  for(const [value,label] of Object.entries(data.fields)){const option=document.createElement('option');option.value=value;option.textContent=label;$('field-filter').append(option);}
  $('route-list').innerHTML=data.routes.map(r=>`<button data-route="${r.id}" aria-pressed="false">${esc(r.title)}</button>`).join('');
  if(matchMedia('(max-width:560px)').matches && !state.route) document.querySelector('.reading-routes').open=false;
  $('people-total').textContent=data.people.length;
  $('people-search').addEventListener('input',()=>{state.q=$('people-search').value;syncUrl();renderList();});
  $('clear-search').addEventListener('click',()=>{state.q='';syncUrl();renderList();$('people-search').focus();});
  $('field-filter').addEventListener('change',()=>{state.field=$('field-filter').value;syncUrl();renderList();});
  $('sort-order').addEventListener('change',()=>{state.sort=$('sort-order').value;syncUrl();renderList();});
  $('saved-only').addEventListener('click',()=>{state.saved=!state.saved;syncUrl();renderList();});
  $('reset-filters').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
  $('route-list').addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(!b)return;state.route=state.route===b.dataset.route?'':b.dataset.route;state.field='all';state.q='';state.saved=false;state.sort='shelf';syncUrl();renderList();});
  document.addEventListener('click',e=>{
    const button=e.target.closest('button,a');if(!button)return;
    if(button.matches('.person-link'))browseScroll=window.scrollY;
    if(button.dataset.section){e.preventDefault();$(button.dataset.section).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    if(button.hasAttribute('data-back')){e.preventDefault();location.hash='catalog';}
    if(button.dataset.save){const id=button.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);const stored=persist('ukiwa-library-saved',[...saved]);button.setAttribute('aria-pressed',String(saved.has(id)));button.textContent=saved.has(id)?'しおりを外す':'あとで読む';if(stored)message(saved.has(id)?'「あとで読む」に保存しました。':'しおりを外しました。');}
    if(button.dataset.compare){const id=button.dataset.compare;if(comparison.includes(id))comparison=comparison.filter(x=>x!==id);else if(comparison.length<2)comparison.push(id);else{message('比較は2人までです。下の「解除」で選び直せます。');return;}button.setAttribute('aria-pressed',String(comparison.includes(id)));button.textContent=comparison.includes(id)?'比較から外す':'比べる候補に';renderTray();}
    if(button.hasAttribute('data-font')){large=!large;persist('ukiwa-library-large',large);document.documentElement.style.setProperty('--reading',large?'21px':'18px');button.setAttribute('aria-pressed',String(large));}
    if(button.dataset.share||button.hasAttribute('data-share-compare')){const url=new URL(location.href);url.search='';copyLink(url.href);}
  });
  $('compare-clear').addEventListener('click',()=>{comparison=[];renderTray();document.querySelectorAll('[data-compare]').forEach(b=>{b.setAttribute('aria-pressed','false');b.textContent='比べる候補に';});});
  $('compare-open').addEventListener('click',()=>{if(comparison.length===2)location.hash='compare='+comparison.join(',');});
  window.addEventListener('popstate',()=>{Object.assign(state,stateFromUrl());route();});
  window.addEventListener('hashchange',route);
  route();
})();
