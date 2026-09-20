(()=>{'use strict';
const $=id=>document.getElementById(id),key='ukiwa-denken-study-v2',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let catalog=[],answers={},explanations={},solutionPages={},questions=[],state={records:{},last:null},queue=[],pos=0,shown=false,renderId=0,solutionRequest=0,reading=false;const packs=new Map();
try{const s=JSON.parse(localStorage.getItem(key));if(s?.records&&typeof s.records==='object')state=s}catch{}
function stats(){const r=questions.map(q=>state.records[q.id]||{});$('stats').textContent=`収録 ${questions.length}問 ／ 解説読了 ${r.filter(x=>x.readAt).length}問 ／ 解答済み ${r.filter(x=>x.attempts).length}問 ／ 自力正解 ${r.filter(x=>x.selfSolvedAt).length}問 ／ 要復習 ${r.filter(x=>x.retry).length}問`;$('start').disabled=!questions.length;$('resume').disabled=!questions.some(q=>q.id===state.last)}
function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{$('storage-note').classList.add('storage-error');$('storage-note').textContent='記録を保存できません。閉じると今回の記録は失われます。'}stats()}
async function json(url){const r=await fetch(url);if(!r.ok)throw Error('教材を取得できません');return r.json()}
async function unpack(name){if(packs.has(name))return packs.get(name);const p=(async()=>{const r=await fetch('denken-assets/'+name+'.pack?v=readable-1');if(!r.ok)throw Error('教材を取得できません');const b=Uint8Array.from(atob((await r.text()).trim()),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text())})();packs.set(name,p);try{return await p}catch(e){packs.delete(name);throw e}}
const subjectOrder=['理論','電力','機械','法規','電力・管理','機械・制御'];
function updateFilters(){
 const stage=$('stage').value,subject=$('subject').value,year=$('year').value;
 const relevant=questions.filter(q=>!stage||q.stage===stage);
 function options(id,values,previous,label){const select=$(id);select.replaceChildren(new Option(label,''));values.forEach(v=>select.add(new Option(v,v)));select.value=values.includes(previous)?previous:''}
 options('subject',subjectOrder.filter(v=>relevant.some(q=>q.subject===v)),subject,'全科目');
 const years=[...new Set(relevant.filter(q=>!$('subject').value||q.subject===$('subject').value).map(q=>String(q.year)))].sort((a,b)=>Number(b)-Number(a));
 options('year',years,year,'全年度');
}
function explanationKey(q){return q.year+'-'+q.subject+'-'+q.number}
function answerSpec(q){
 const correct=answers[q.year]?.[q.subject]?.[q.number];if(!correct)return null;
 const spec=correct.map((v,i)=>({label:'空欄 ('+(i+1)+')',correct:v,choices:[...'イロハニホヘトチリヌルヲワカヨ']}));
 if(q.year===2026&&q.subject==='機械'&&q.number===7){
  spec.forEach((v,i)=>{v.label='('+(i+1)+') 定義';v.choices=[...'イロハニホヘト']});
  ['g','c','e','b','a'].forEach((v,i)=>spec.push({label:'('+(i+1)+') 単位',correct:v,choices:[...'abcdefg']}));
 }
 return spec;
}
function showExplanation(q,ss=null){
 const e=explanations[explanationKey(q)],node=$('explanation');
 if(!e){node.innerHTML='<h2 tabindex="-1">'+(q.stage==='二次'?'公式解答で考え方を確認':'この問題の独自解説は未収録')+'</h2><p>'+(q.stage==='二次'?'このパネルに該当問題の計算過程・解答例を表示します。問題文と見比べ、途中式と論述の要点を確認してください。':'この問題は公式正答のみ収録しています。解き方から学びたい場合は、出題範囲の「画面内の解説あり」を選んでください。')+'</p>';return}
 const spec=answerSpec(q),paired=spec.length===10;
 const correct=i=>ss&&ss[i]?.value===spec[i].correct&&(!paired||ss[i+5]?.value===spec[i+5].correct);
 const answer=i=>spec[i].correct+(paired?' / '+spec[i+5].correct:'');
 node.innerHTML=`<span class="badge">うきわメモの独自解説 · ${ss?ss.filter((s,i)=>s.value===spec[i].correct).length+'/'+spec.length+'欄 正解':'解き方を先に読む'}</span><h2 tabindex="-1">${esc(e.title)}</h2><p class="explanation-idea">${esc(e.idea)}</p><ol class="explanation-steps">${e.steps.map((step,i)=>`<li class="${!ss?'step-reading':correct(i)?'step-correct':'step-review'}"><h3>(${i+1}) ${!ss?'考え方':correct(i)?'○ 正解':'復習'} · 正答 ${esc(answer(i))}</h3><p>${esc(step)}</p></li>`).join('')}</ol><details class="pitfall"><summary>ここで間違えやすい</summary><p>${esc(e.pitfall)}</p></details><p class="small">公式問題・正答に照合した独自の説明です（${esc(e.checked)}）。法規は出題年度の条件で解説しています。</p>`;
 const items=[...node.querySelectorAll('.explanation-steps li')],nav=document.createElement('nav');nav.className='step-nav';nav.setAttribute('aria-label','空欄ごとの解説');
 const select=i=>{items.forEach((el,j)=>el.hidden=i!==j);[...nav.children].forEach((el,j)=>el.setAttribute('aria-pressed',String(i===j)))};
 items.forEach((item,i)=>{const b=document.createElement('button');b.textContent='('+String(i+1)+')';b.setAttribute('aria-label','空欄 '+(i+1)+' の解説');b.onclick=()=>select(i);nav.append(b)});
 node.querySelector('.explanation-steps').before(nav);select(ss?Math.max(0,items.findIndex((_,i)=>!correct(i))):0);
}
function filtered(){return questions.filter(q=>{const r=state.records[q.id]||{},m=$('mode').value;return(!$('stage').value||q.stage===$('stage').value)&&(!$('subject').value||q.subject===$('subject').value)&&(!$('year').value||String(q.year)===$('year').value)&&(m==='all'||m==='new'&&!r.attempts&&!r.readAt||m==='read'&&r.readAt&&!r.attempts||m==='retry'&&r.retry||m==='saved'&&r.saved||m==='explained'&&(q.stage==='二次'||!!explanations[explanationKey(q)]))})}
function record(ok){const q=queue[pos],r=state.records[q.id]||{},now=new Date().toISOString(),assisted=!!r.draftAssisted;state.records[q.id]={...r,attempts:(r.attempts||0)+1,retry:!ok,lastCorrect:ok,lastAssisted:assisted,selfSolvedAt:ok&&!assisted?now:r.selfSolvedAt,draft:[],draftAssisted:false,date:now};save()}
function markRead(q){state.records[q.id]={...(state.records[q.id]||{}),readAt:new Date().toISOString()};save()}
function beginPractice(){
 reading=false;shown=false;++solutionRequest;$('explanation').hidden=true;$('solution').innerHTML='';$('learning-actions').innerHTML='';$('feedback').innerHTML='';
 document.querySelectorAll('[data-slot]').forEach(s=>{s.disabled=false;s.value=''});
 const q=queue[pos];state.records[q.id]={...(state.records[q.id]||{}),draft:[]};save();
 $('judge').disabled=false;$('preview').disabled=false;
 $('practice-note').textContent=state.records[q.id].draftAssisted?'解説を隠しました。今度は自分の手で再現してみましょう。今回は「解説を見て挑戦」として記録します。':'解説を見ずに挑戦中です。';
 setPane('answer');
}
async function loadSolution(q,open=false){
 const token=renderId,request=++solutionRequest;
 const sol=catalog.find(p=>p.answer&&p.year===q.year&&p.stage===q.stage);
 if(!sol){$('solution').textContent='この年度の公式解答は未収録です。';return false}
 $('solution').innerHTML=`${q.stage==='一次'?'<details'+(open?' open':'')+'><summary>公式正答表も確認する</summary>':''}<h2>${q.stage==='一次'?'公式正答表':'公式解答・計算過程'}</h2><p class="small">${esc(sol.title)}。該当科目・問番号を照合してください。</p><a href="${esc(sol.source)}" target="_blank" rel="noopener">解答原本PDF ↗</a><div id="solution-pages" class="paper">読み込み中…</div>${q.stage==='一次'?'</details>':''}`;
 try{const d=await unpack(q.year);if(token!==renderId||request!==solutionRequest)return false;const range=solutionPages[explanationKey(q)];pages($('solution-pages'),d[sol.id],range?.page||0,range?.end||d[sol.id].length);return true}
 catch(e){if(token===renderId&&request===solutionRequest)$('solution-pages').textContent=e.message;return false}
}
async function previewExplanation(){
 if(shown||reading)return;reading=true;const q=queue[pos],token=renderId,has=!!explanations[explanationKey(q)]||q.stage==='二次';
 state.records[q.id]={...(state.records[q.id]||{}),draftAssisted:true};save();
 document.querySelectorAll('[data-slot]').forEach(s=>s.disabled=true);$('judge').disabled=true;$('preview').disabled=true;$('feedback').innerHTML='';
 $('practice-note').textContent=has?'まずは解き方を読んでみましょう。読むだけでは解答済み・自力正解になりません。':'独自解説は未収録です。公式正答を確認できますが、解説読了には数えません。';
 $('explanation').hidden=false;showExplanation(q);
 $('learning-actions').innerHTML=`${has?'<button id="read-practice" class="primary" disabled>読んだ・解説を隠して解く</button><button id="read-next" disabled>読んだと記録して次へ</button>':'<button id="hide-answer" class="primary">正答を隠して解く</button>'}`;
 if(!has)$('hide-answer').onclick=beginPractice;
 const enable=()=>{for(const id of ['read-practice','read-next'])$(id).disabled=false;$('read-practice').onclick=()=>{markRead(q);beginPractice()};$('read-next').onclick=()=>{markRead(q);$('next').click()}};
 if(has&&q.stage==='一次')enable();
 setPane('explanation');$('explanation').querySelector('h2').focus({preventScroll:true});
 const loaded=await loadSolution(q,!has);if(token!==renderId||!reading)return;
 if(has&&q.stage==='二次'&&loaded)enable();
 if(has&&q.stage==='二次'&&!loaded){$('learning-actions').innerHTML='<button id="retry-explanation">解答を再読み込み</button><button id="hide-answer">解説を閉じて解く</button>';$('retry-explanation').onclick=()=>{reading=false;previewExplanation()};$('hide-answer').onclick=beginPractice}
}
function setPane(name){$('answer-pane').hidden=name!=='answer';$('explanation-pane').hidden=name!=='explanation';$('answer-tab').setAttribute('aria-pressed',String(name==='answer'));$('explanation-tab').setAttribute('aria-pressed',String(name==='explanation'))}
function pages(node,list,start,end){
 const selected=list.slice(start,end);let page=0;if(!node.dataset.zoom)node.dataset.zoom='width';
 const wrapper=document.createElement('div');wrapper.className='page-reader';
 const toolbar=document.createElement('div');toolbar.className='page-nav';
 const prev=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span');prev.textContent='←';next.textContent='→';prev.setAttribute('aria-label',node.id==='paper'?'問題の前のページ':'解答の前のページ');next.setAttribute('aria-label',node.id==='paper'?'問題の次のページ':'解答の次のページ');
 toolbar.append(prev,label,next);node.replaceChildren(wrapper);node.before(toolbar);const old=toolbar.previousElementSibling;if(old?.classList.contains('page-nav'))old.remove();
 function show(){wrapper.innerHTML=`<div class="paper-page" role="img" aria-label="原本 ${start+page+1} ページ">${selected[page]}</div>`;label.textContent=`${page+1} / ${selected.length} ページ`;prev.disabled=page===0;next.disabled=page+1===selected.length;node.scrollTop=0;node.scrollLeft=0}
 prev.onclick=()=>{page--;show()};next.onclick=()=>{page++;show()};show();
}
async function render(){const token=++renderId,q=queue[pos];shown=false;reading=false;shown=false;++solutionRequest;state.last=q.id;save();const r=state.records[q.id]||{},a=answerSpec(q);document.body.classList.add('studying');$('desk').classList.remove('wide-paper');$('study-settings').open=false;$('desk').innerHTML=`<div class="question-toolbar"><span class="badge">${q.year}年度 · ${esc(q.stage)} · ${esc(q.subject)}</span><label class="jump-label">問題<select id="jump"></select></label><span class="progress">${pos+1} / ${queue.length} 問</span><button id="bookmark" aria-pressed="${!!r.saved}">${r.saved?'★ 保存済み':'☆ あとで解く'}</button><a href="${esc(q.source)}" target="_blank" rel="noopener">原本PDF ↗</a></div><div class="exercise"><section class="problem-pane"><div class="paper-tools"><strong>問題</strong><label>表示<select id="zoom"><option value="width">読みやすい幅</option><option value="fit">ページ全体</option><option value="125%">125%</option><option value="150%">150%</option></select></label><button id="wide-paper" aria-pressed="false">問題を広く</button></div><div id="paper" class="paper" data-zoom="width">図と数式を読み込んでいます…</div><p class="source">出典：${esc(q.title)}／電気技術者試験センター</p></section><section class="study-side"><nav class="study-tabs" aria-label="学習パネル"><button id="answer-tab" aria-pressed="true">解答・メモ</button><button id="explanation-tab" aria-pressed="false">解説</button></nav><div id="answer-pane" class="answer-panel"><p id="practice-note" class="small">解説を見ずに挑戦中です。</p><button id="preview" type="button">先に解説を見る</button><h2>${a?'解答を選ぶ':'解答を組み立てる'}</h2>${a?'<div id="slots"></div>':'<p class="small">記述式は公式解答と照合して理解度を記録します。</p>'}<details class="memo-details"><summary>考え方・途中式メモ</summary><label>メモ<textarea id="memo" placeholder="使う公式、途中式、気づいたこと…"></textarea></label></details><button id="judge" class="primary">${a?'採点して答え合わせ':'公式解答を開く'}</button><div id="feedback"></div></div><div id="explanation-pane" hidden><section id="explanation" class="inline-explanation" hidden></section><div id="learning-actions" class="actions"></div><div id="solution"></div></div></section></div><div class="question-footer"><button id="prev" ${pos===0?'disabled':''}>← 前の問題</button><button id="next">${pos+1===queue.length?'学習結果を見る':'次の問題 →'}</button></div>`;
$('answer-tab').onclick=()=>setPane('answer');$('explanation-tab').onclick=()=>{if(!shown&&!reading)previewExplanation();else setPane('explanation')};$('wide-paper').onclick=()=>{const wide=$('desk').classList.toggle('wide-paper');$('wide-paper').textContent=wide?'解説も表示':'問題を広く';$('wide-paper').setAttribute('aria-pressed',String(wide))};

queue.forEach((item,i)=>{const o=document.createElement('option');o.value=i;o.textContent=item.year+' '+item.subject+' 問'+item.number;o.selected=i===pos;$('jump').append(o)});$('desk').scrollIntoView({block:'start',behavior:'instant'});$('jump').onchange=()=>{pos=Number($('jump').value);render()};
if(a)a.forEach((_,i)=>{const l=document.createElement('label');l.textContent=a[i].label;const s=document.createElement('select');s.dataset.slot=i;s.setAttribute('aria-label',a[i].label);s.innerHTML='<option value="">未選択</option>'+a[i].choices.map(x=>`<option>${x}</option>`).join('');s.value=r.draft?.[i]||'';s.onchange=()=>{state.records[q.id]={...(state.records[q.id]||{}),draft:[...document.querySelectorAll('[data-slot]')].map(x=>x.value)};save()};l.append(s);$('slots').append(l)});
$('memo').value=r.memo||'';$('memo').oninput=()=>{state.records[q.id]={...(state.records[q.id]||{}),memo:$('memo').value};save()};$('zoom').onchange=()=>{$('paper').dataset.zoom=$('zoom').value;$('paper').style.setProperty('--zoom',$('zoom').value)};$('bookmark').onclick=()=>{const r=state.records[q.id]||{};r.saved=!r.saved;state.records[q.id]=r;save();$('bookmark').textContent=r.saved?'★ 保存済み':'☆ あとで解く';$('bookmark').setAttribute('aria-pressed',String(r.saved))};$('preview').onclick=previewExplanation;$('judge').onclick=()=>reveal(a);$('prev').onclick=()=>{pos--;render()};$('next').onclick=()=>{if(pos+1<queue.length){pos++;render()}else{++renderId;$('desk').innerHTML='<h2>ここまで、おつかれさまでした。</h2><p>間違えた問題は「間違えた・要復習」から繰り返せます。解説読了と解答済みは別々に記録しています。</p>';stats()}};
if($('approach').value==='learn')previewExplanation();
try{const d=await unpack(q.year);if(token===renderId)pages($('paper'),d[q.paper],q.page,q.end)}catch(e){if(token===renderId)$('paper').textContent=e.message}}
async function reveal(a){if(shown||reading)return;const q=queue[pos],ss=[...document.querySelectorAll('[data-slot]')];if(a&&ss.some(s=>!s.value)){$('feedback').textContent='すべての解答欄を選択してください。';return}shown=true;$('judge').disabled=true;$('preview').disabled=true;const ok=a?ss.every((s,i)=>s.value===a[i].correct):null;const assisted=!!state.records[q.id]?.draftAssisted;if(a){record(ok);ss.forEach(s=>s.disabled=true)}$('feedback').innerHTML=`<section class="feedback ${ok===false?'wrong':''}"><h2>${ok===null?'公式解答と照合':ok?(assisted?'解説を見て全問正解':'自力で全問正解です'):'間違えた空欄を確認しよう'}</h2>${a?`<ol>${a.map((v,i)=>`<li>${ss[i].value===v.correct?'○':'×'} ${esc(v.label)} · あなた：${ss[i].value} → 正答：<strong>${v.correct}</strong></li>`).join('')}</ol><p class="small">解説と答え合わせをこのパネルで確認できます。</p>`:'<p>下の公式解答で途中式・単位・論述の要点を照合してください。</p><div class="actions"><button id="understood">解けた</button><button id="retry">要復習</button></div>'}</section>`;
$('explanation').hidden=false;showExplanation(q,ss);setPane('explanation');$('explanation').querySelector('h2').focus({preventScroll:true});
$('learning-actions').append(...$('feedback').childNodes);if(ok===null)for(const [id,v]of[['understood',true],['retry',false]])$(id).onclick=()=>{record(v);$('understood').disabled=true;$('retry').disabled=true;$(id).textContent+=' · 記録しました'};
await loadSolution(q);}
$('start').onclick=()=>{queue=filtered();pos=0;state.queue=queue.map(q=>q.id);state.filters=Object.fromEntries(['stage','subject','year','mode','approach'].map(id=>[id,$(id).value]));if(queue.length)render();else $('desk').innerHTML='<h2>この条件に合う問題はありません。</h2><p>科目・年度・出題範囲を変えてください。</p>'};$('resume').onclick=()=>{queue=(state.queue||[]).map(id=>questions.find(q=>q.id===id)).filter(Boolean);if(!queue.some(q=>q.id===state.last))queue=questions;const f=state.filters||{};$('stage').value=f.stage||'';updateFilters();$('subject').value=f.subject||'';updateFilters();$('year').value=f.year||'';$('mode').value=f.mode||'all';$('approach').value=f.approach||'learn';pos=queue.findIndex(q=>q.id===state.last);if(pos>=0)render()};$('approach').onchange=()=>{if(queue[pos]&&$('preview')){state.filters={...(state.filters||{}),approach:$('approach').value};save();if($('approach').value==='learn'){if(shown)render();else previewExplanation()}else if(reading||shown)beginPractice()}};stats();
(async()=>{try{[catalog,answers,explanations,solutionPages]=await Promise.all([json('denken-assets/catalog.json'),json('denken-assets/answers.json'),json('denken-assets/original-explanations.json?v=1'),json('denken-assets/solution-pages.json')]);for(const p of catalog.filter(p=>!p.answer))p.starts.forEach((s,i)=>questions.push({...p,id:p.id+'-'+s.number,paper:p.id,number:s.number,page:s.page,end:p.starts[i+1]?.page??p.pages}));questions.sort((a,b)=>b.year-a.year||a.stage.localeCompare(b.stage)||['理論','電力','機械','法規','電力・管理','機械・制御'].indexOf(a.subject)-['理論','電力','機械','法規','電力・管理','機械・制御'].indexOf(b.subject)||a.number-b.number);
updateFilters();$('stage').onchange=updateFilters;$('subject').onchange=updateFilters;$('desk').innerHTML=`<div class="empty"><span class="badge">2009–2026 · 電験二種</span><h2>最初は、解き方を読むところから。</h2><p>公式公開の${catalog.length}資料から、${questions.length}問を収録。</p><ol><li>「解説から学ぶ」で考え方と途中式を読む</li><li>読んだら解説を隠し、自分の手で解いてみる</li><li>後日「自力で解く」で、覚えたか確かめる</li></ol><p class="small">一次：2009～2026年度 ／ 二次：2009～2025年度。採点後はこの画面で答え合わせ。独自解説は2026年度一次30問、二次170問は公式の計算過程を収録。ほかの一次510問は正答のみで、独自解説は未収録です。「画面内の解説あり」で絞り込めます。</p><a href="https://www.shiken.or.jp/chief/second/qa/index.html" target="_blank" rel="noopener">出典・過去問題の利用条件 ↗</a></div>`;stats()}catch(e){$('desk').textContent='教材を読み込めませんでした。再読み込みしてください。 '+e.message}})();
})();
