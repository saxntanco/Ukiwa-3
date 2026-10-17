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
  const shelves = [
    {id:'philosophy', title:'哲学・生き方', description:'自分らしさ、幸せ、よく生きること', fields:['philosophy']},
    {id:'east', title:'東洋思想', description:'仁、道、仏教から日々を考える', fields:['east']},
    {id:'economics', title:'経済学', description:'お金、市場、豊かさのしくみ', fields:['economics']},
    {id:'society', title:'社会・正義', description:'自由、公平、社会のあり方', fields:['justice','society']},
    {id:'mind', title:'心・文化・言葉', description:'心の動きと、人のつながり', fields:['psychology','culture']},
    {id:'science', title:'自然科学・数学', description:'自然を知る、数で考える', fields:['physics','life','math','method']}
  ];
  const pageSize = 6;
  let visibleCount = pageSize;
  let listKey = '';
  let comparison = [];
  let browseScroll = 0;
  let renderedUrl = '';
  let toastTimer;
  function stateFromUrl() {
    const params = new URLSearchParams(location.search);
    return {q:params.get('q')||'',shelf:shelves.some(s=>s.id===params.get('shelf'))?params.get('shelf'):'',field:Object.hasOwn(data.fields,params.get('field'))?params.get('field'):'all',route:data.routes.some(r=>r.id===params.get('route'))?params.get('route'):'',saved:params.get('saved')==='1',all:params.get('all')==='1',sort:['shelf','oldest','name'].includes(params.get('sort'))?params.get('sort'):'shelf'};
  }
  const state = stateFromUrl();
  const isSelection = () => Boolean(state.q.trim() || state.shelf || state.field!=='all' || state.route || state.saved || state.all);
  function message(text) { $('library-message').textContent=text; $('library-message').hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('library-message').hidden=true,3000); }
  function persist(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch { message('このブラウザーでは保存できません。この画面内では使えます。'); return false; } }
  function syncUrl(push=false) { const url=new URL(location.href); for(const [key,value] of Object.entries(state)){ if(value && value!=='all' && value!=='shelf') url.searchParams.set(key,value===true?'1':value); else url.searchParams.delete(key); } if(push) url.hash='catalog'; history[push?'pushState':'replaceState'](null,'',url); }
  function syncControls() { $('people-search').value=state.q; $('field-filter').value=state.field; $('sort-order').value=state.sort; $('saved-only').setAttribute('aria-pressed',String(state.saved)); $('saved-count').textContent=saved.size; $('clear-search').hidden=!state.q; }
  function renderList() {
    renderedUrl=location.href;
    const shelf=shelves.find(s=>s.id===state.shelf);
    const selectedRoute=data.routes.find(r=>r.id===state.route);
    const allowedFields=shelf?shelf.fields:Object.keys(data.fields);
    if(!allowedFields.includes(state.field)) state.field='all';
    const key=JSON.stringify(state);
    if(key!==listKey) { visibleCount=pageSize; listKey=key; }
    const active=isSelection();
    $('field-filter').innerHTML='<option value="all">'+(shelf?'この本棚の全分野':'すべての分野')+'</option>'+allowedFields.map(value=>`<option value="${value}">${esc(data.fields[value])}</option>`).join('');
    syncControls();
    $('library-hero').hidden=active;
    $('library-entrance').hidden=active;
    $('collections').hidden=active;
    $('catalog-results').hidden=!active;
    $('people-list').innerHTML='';
    if(!active) { $('result-count').textContent=''; return; }
    const words=normalize(state.q.trim()).split(/\s+/).filter(Boolean);
    const people=data.people.filter(p=>allowedFields.includes(p.field)&&(state.field==='all'||p.field===state.field)&&(!state.saved||saved.has(p.id))&&(!selectedRoute||selectedRoute.people.includes(p.id))&&words.every(word=>searchText.get(p.id).includes(word)));
    if(state.sort==='oldest') people.sort((a,b)=>a.born-b.born);
    else if(state.sort==='name') people.sort((a,b)=>a.name.localeCompare(b.name,'ja'));
    else if(selectedRoute) people.sort((a,b)=>selectedRoute.people.indexOf(a.id)-selectedRoute.people.indexOf(b.id));
    $('results-title').textContent=state.saved?'あとで読む':selectedRoute?selectedRoute.title:shelf?shelf.title:state.q.trim()?'検索結果':state.field!=='all'?data.fields[state.field]:'人物の索引';
    $('route-note').hidden=!selectedRoute;
    if(selectedRoute) $('route-note').textContent=selectedRoute.description+' 表示順に読むと、立場の違いをたどれます。';
    $('result-count').textContent=people.length===0?'0人':`${people.length}人中 ${Math.min(visibleCount,people.length)}人を表示`;
    $('people-list').innerHTML=people.slice(0,visibleCount).map(p=>`<article class="person-row"><a class="person-link" href="#${p.id}"><p class="person-meta"><span>${esc(data.fields[p.field])}</span><span>${esc(p.years)}</span>${saved.has(p.id)?'<span>しおりあり</span>':''}</p><h3>${esc(p.name)}</h3><p class="person-question">${esc(p.question)}</p><p class="person-keywords">${p.tags.map(esc).join(' / ')}</p><span class="row-arrow" aria-hidden="true">→</span></a></article>`).join('');
    $('more-people').hidden=people.length<=visibleCount;
    $('shown-count').textContent=`残り${Math.max(0,people.length-visibleCount)}人`;
    $('show-more').textContent=`次の${Math.max(0,Math.min(pageSize,people.length-visibleCount))}人を見る`;
    $('empty-state').hidden=people.length!==0;
  }
  function choose(selection) {
    Object.assign(state,{q:'',shelf:'',field:'all',route:'',saved:false,all:false,sort:'shelf'},selection);
    browseScroll=0;
    $('result-options').open=false;
    syncUrl(true);route();window.scrollTo(0,0);
    $(isSelection()?'results-title':'entrance-title').focus({preventScroll:true});
  }
  function reset(){ choose({}); }
  const backLabel = () => isSelection()?'← 選んだ本棚に戻る':'← 図書室の入口へ';

  const links = ids => ids.filter(id=>byId.has(id)).map(id=>`<a href="#${id}">${esc(byId.get(id).name)} →</a>`).join('');
  const sections = [['idea','考えを一言で'],['background','問いの背景'],['life','生涯の年表'],['arguments','主張の中身'],['example','身近な例'],['debate','反論・限界'],['legacy','その後への影響'],['works','原典・代表作'],['connections','つなげて読む'],['sources','出典']];
  const optionalSections = {life:p=>Array.isArray(p.life)&&p.life.length>0, legacy:p=>Boolean(p.legacy)};
  const sectionLinks = p => sections.filter(([id])=>!optionalSections[id]||optionalSections[id](p)).map(([id,label])=>`<a href="#${id}" data-section="${id}">${label}</a>`).join('');
  const paragraphs = text => String(text).split(/\n+/).filter(Boolean).map(line=>`<p>${esc(line)}</p>`).join('');
  const lifeSection = p => optionalSections.life(p) ? `<section id="life"><h2>生涯の年表</h2><ol class="life-list">${p.life.map(item=>`<li><span class="life-year">${esc(item.year)}</span><p>${esc(item.text)}</p></li>`).join('')}</ol></section>` : '';
  const legacySection = p => optionalSections.legacy(p) ? `<section id="legacy"><h2>その後への影響</h2>${paragraphs(p.legacy)}</section>` : '';
  function sourceList(p) { return p.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a><span class="source-type">${esc(s.type)} · ${esc(s.note || '出典確認：2026-10-12')}</span></li>`).join(''); }
  function renderReader(p) {
    $('reader-view').innerHTML=`<div class="reader-toolbar"><a href="#catalog" data-back>${backLabel()}</a><div class="reader-actions"><button class="quiet-button" data-save="${p.id}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id)?'しおりを外す':'あとで読む'}</button><button class="quiet-button" data-compare="${p.id}" aria-pressed="${comparison.includes(p.id)}">${comparison.includes(p.id)?'比較から外す':'比べる候補に'}</button><button class="quiet-button" data-font aria-pressed="${large}">文字を大きく</button></div></div>
      <div class="reader-layout"><article class="reader-article"><header class="reader-title"><p class="person-meta"><span>${esc(data.fields[p.field])}</span><span>${esc(p.years)}</span></p><h1 tabindex="-1" id="person-title">${esc(p.name)}</h1><p class="reader-en">${esc(p.en)} · ${p.tags.map(esc).join(' / ')}</p><p class="reader-question">${esc(p.question)}</p></header>
      <details class="reader-mobile-toc"><summary>この解説の目次・出典へ</summary><nav aria-label="この解説の目次">${sectionLinks(p)}</nav></details>
      <div class="reader-body"><section id="idea"><h2>考えを一言で</h2><p class="reader-summary">${esc(p.thesis)}</p><p class="reader-caption">内容をかみ砕いた要約です。本人の発言の引用ではありません。</p></section>
      <section id="background"><h2>なぜ、その問いを考えた？</h2>${paragraphs(p.background)}</section>${lifeSection(p)}
      <section id="arguments"><h2>何を主張したのか</h2>${p.ideas.map((idea,i)=>`<h3>${i+1}. ${esc(idea.title)}</h3><p>${esc(idea.body)}</p>`).join('')}</section>
      <section id="example"><h2>身近な場面で考える</h2><div class="example-text">${paragraphs(p.example)}</div><p class="reader-caption">理解のために作った例です。本人の発言・実験結果ではありません。</p></section>
      <section id="debate"><h2>反論・限界・誤解しやすい点</h2>${paragraphs(p.caution)}</section>${legacySection(p)}
      <section id="works"><h2>原典・代表的な仕事</h2><ul class="work-list">${p.works.map(w=>`<li>${esc(w.title)}<span>${esc(w.year)} · ${esc(w.note)}</span></li>`).join('')}</ul></section>
      <section id="connections"><h2>つなげて読む</h2><div class="related-links">${links(p.related)}</div></section>
      <section id="sources"><h2>出典・さらに読む</h2><ol class="source-list">${sourceList(p)}</ol><p class="reader-caption">原典の翻訳名・版は複数あります。解説は主張の全体を置き換えるものではありません。人物解説更新：${esc(data.updated)}。</p></section></div>
      <div class="reader-bottom"><div class="reader-back-links"><a href="#catalog" data-back>${backLabel()}</a>${isSelection()?'<a href="#catalog" data-home>図書室の入口へ</a>':''}</div><button class="quiet-button" data-share="${p.id}">この人物のリンクをコピー</button></div></article>
      <nav class="reader-aside" aria-label="この解説の目次"><p>この人を読む</p>${sectionLinks(p)}</nav></div>`;
    document.title=`${p.name}の考え｜うきわ図書室`;
    document.documentElement.style.setProperty('--reading',large?'21px':'18px');
  }
  function renderComparison(ids) {
    const people=ids.map(id=>byId.get(id)).filter(Boolean);
    if(people.length!==2||people[0].id===people[1].id) return false;
    const rows=[['中心の問い',p=>esc(p.question)],['考えを一言で',p=>esc(p.thesis)],['主張の中身',p=>p.ideas.map(x=>`<p><strong>${esc(x.title)}</strong><br>${esc(x.body)}</p>`).join('')],['反論・限界',p=>paragraphs(p.caution)],['詳しい解説・出典',p=>`<a href="#${p.id}">${esc(p.name)}を読む →</a>`]];
    $('compare-view').innerHTML=`<div class="reader-toolbar"><a href="#catalog" data-back>${backLabel()}</a><button class="quiet-button" data-share-compare>比較のリンクをコピー</button></div><header class="compare-heading"><p class="eyebrow">READ SIDE BY SIDE</p><h1 tabindex="-1">2人の考えを、<br class="mobile-break">並べて読む。</h1><p>同じ言葉でも、問いや前提が違うことがあります。優劣を決める表ではなく、違いを見つける入口です。</p></header><table class="compare-table"><thead><tr>${people.map(p=>`<th scope="col">${esc(p.name)}<small>${esc(data.fields[p.field])} · ${esc(p.years)}</small></th>`).join('')}</tr></thead><tbody>${rows.map(([label,content])=>`<tr class="compare-label"><th colspan="2">${label}</th></tr><tr>${people.map(p=>`<td>${content(p)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
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
    else {renderList();document.title='うきわ図書室｜人物と思想を旅する';if(hash==='collections')$('collections').scrollIntoView();else if(hash==='catalog')window.scrollTo(0,browseScroll);else if(hash){message('人物が見つからないため、本棚を表示しました。');history.replaceState(null,'',location.pathname+location.search+'#catalog');}}
    renderTray();
  }
  async function copyLink(url){try{await navigator.clipboard.writeText(url);message('リンクをコピーしました。');}catch{message('コピーできませんでした。アドレス欄のURLから共有できます。');}}
  $('shelf-list').innerHTML=shelves.map((s,i)=>`<button class="shelf-link" data-shelf="${s.id}"><span class="shelf-number" aria-hidden="true">0${i+1}</span><span><strong>${esc(s.title)}</strong><span class="shelf-description">${esc(s.description)}</span></span><span class="shelf-arrow" aria-hidden="true">→</span></button>`).join('');
  $('route-list').innerHTML=data.routes.map(r=>`<button data-route="${r.id}">${esc(r.title)}<span aria-hidden="true">→</span></button>`).join('');
  $('people-total').textContent=data.people.length;
  $('people-search').addEventListener('input',()=>{Object.assign(state,{q:$('people-search').value,shelf:'',field:'all',route:'',saved:false,all:false});syncUrl();renderList();});
  $('clear-search').addEventListener('click',()=>{state.q='';syncUrl();renderList();$('people-search').focus();});
  $('field-filter').addEventListener('change',()=>{state.field=$('field-filter').value;syncUrl();renderList();});
  $('sort-order').addEventListener('change',()=>{state.sort=$('sort-order').value;syncUrl();renderList();});
  $('saved-only').addEventListener('click',()=>choose({saved:!state.saved}));
  $('all-people').addEventListener('click',()=>choose({all:true}));
  $('shelf-list').addEventListener('click',e=>{const b=e.target.closest('[data-shelf]');if(b)choose({shelf:b.dataset.shelf});});
  $('route-list').addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(b)choose({route:b.dataset.route});});
  $('show-more').addEventListener('click',()=>{const previous=visibleCount;visibleCount+=pageSize;renderList();const next=$('people-list').querySelectorAll('.person-link')[previous];if(next){next.focus({preventScroll:true});next.scrollIntoView({block:'start'});}});
  $('reset-filters').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
  document.addEventListener('click',e=>{
    const button=e.target.closest('button,a');if(!button)return;
    if(button.matches('.person-link'))browseScroll=window.scrollY;
    if(button.dataset.section){e.preventDefault();$(button.dataset.section).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    if(button.hasAttribute('data-home')){e.preventDefault();reset();return;}
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
