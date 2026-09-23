/* Prototype: solve one blank at a time. Records share denken-study.js storage and evidence rules. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const key='ukiwa-denken-study-v2',evidence=window.UkiwaStudyEvidence,symbols=[...'イロハニホヘトチリヌルヲワカヨ'];
const qid=new URLSearchParams(location.search).get('q')||'20260830_ch_second_q01-1';
let state={records:{}};
// Follow the study room's paper colour setting (default: warm paper).
try{document.documentElement.dataset.tone=JSON.parse(localStorage.getItem('ukiwa-study-reader-v1')||'{}').paper==='white'?'white':'warm'}catch{document.documentElement.dataset.tone='warm'}
try{const s=JSON.parse(localStorage.getItem(key));if(s?.records&&typeof s.records==='object')state=s}catch{}
let q,correct,lesson,deep,spots=[],pages=[],step=0;
const slots=[];// per blank: {selected,checked,ok,hint,revealed,wide}

const el=(tag,cls,textValue)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(textValue!=null)n.textContent=textValue;return n};
function save(){
 // Merge with the latest stored state so another open tab's records are not overwritten.
 try{const latest=JSON.parse(localStorage.getItem(key));if(latest?.records&&typeof latest.records==='object')state={...latest,records:{...latest.records,[q.id]:state.records[q.id]}};}catch{}
 try{localStorage.setItem(key,JSON.stringify(state))}catch{$('note').textContent='記録を保存できません。閉じると今回の記録は失われます。'}
}
function slotRecord(slot){return state.records[q.id]?.slots?.[slot]||{}}
function exposeSlot(slot){const r=state.records[q.id]||{},now=new Date().toISOString();state.records[q.id]={...r,exposedAt:now,slots:{...r.slots,[slot]:{...evidence.expose(slotRecord(slot)),readAt:now}}};save();}
function attemptSlot(slot,ok,assisted){const r=state.records[q.id]||{},old=slotRecord(slot),next=evidence.result({...old,exposedAt:old.exposedAt||r.wholeExposedAt},ok,assisted||!!r.draftAssisted);state.records[q.id]={...r,slots:{...r.slots,[slot]:next}};save();return next.lastOutcome;}

async function json(url){const r=await fetch(url);if(!r.ok)throw Error(url);return r.json()}
async function unpack(name){const r=await fetch('denken-assets/'+name+'.pack?v=readable-1');if(!r.ok)throw Error('pack');const b=Uint8Array.from(atob((await r.text()).trim()),c=>c.charCodeAt(0));return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text())}

/* Left/right extent of the printed text, so crops are centred whatever the booklet's gutter side. */
const bounds=new Map();
async function measure(index){
 if(bounds.has(index))return;bounds.set(index,null);
 try{const image=pageSvg(index)?.querySelector('image');if(!image)return;
  const IW=Number(image.getAttribute('width')),IH=Number(image.getAttribute('height')),bitmap=new Image();
  bitmap.src=image.getAttribute('href');await bitmap.decode();
  const c=document.createElement('canvas');c.width=800;c.height=Math.round(800*IH/IW);
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,c.width,c.height);
  const {data}=ctx.getImageData(0,0,c.width,c.height);let lo=800,hi=-1;
  // Skip the page number and print code at the foot of the page.
  for(let y=0;y<c.height*.93;y++)for(let x=2;x<798;x++){const i=(y*800+x)*4;if(data[i+3]>200&&Math.max(data[i],data[i+1],data[i+2])<120){if(x<lo)lo=x;if(x>hi)hi=x;}}
  if(hi-lo>200)bounds.set(index,{left:lo*IW/800,right:(hi+1)*IW/800});
 }catch{/* Fall back to a fixed crop. */}
}
function pageSvg(index){const t=document.createElement('template');t.innerHTML=pages[index]||'';return t.content.querySelector('svg')}
/* Show only the lines around one blank, with the blank highlighted. */
function crop(slot,wide){
 const spot=spots.find(s=>s.slot===slot),svg=spot&&pageSvg(spot.page);if(!svg)return null;
 const box=svg.viewBox.baseVal,W=box.width,H=box.height;
 // Hotspot x/y are the blank's centre, as percentages of the original page (see .blank-hotspot).
 const top=(spot.y/100-(wide?.2:.075))*H,bottom=(spot.y/100+(wide?.12:.045))*H;
 const ink=bounds.get(spot.page),pad=W*.02,y0=Math.max(0,top),h=Math.min(H,bottom)-y0,x0=ink?Math.max(0,ink.left-pad):W*.08,w=ink?Math.min(W,ink.right+pad)-x0:W*.84;
 svg.setAttribute('viewBox',`${x0} ${y0} ${w} ${h}`);svg.removeAttribute('width');svg.removeAttribute('height');
 svg.setAttribute('role','img');svg.setAttribute('aria-label',`問題文の空欄 (${slot+1}) のまわり`);
 const mark=document.createElementNS('http://www.w3.org/2000/svg','rect');
 const mpad=W*.006;
 mark.setAttribute('x',(spot.x-spot.w/2)/100*W-mpad);mark.setAttribute('y',(spot.y-spot.h/2)/100*H-mpad);mark.setAttribute('width',spot.w/100*W+2*mpad);mark.setAttribute('height',spot.h/100*H+2*mpad);
 mark.setAttribute('rx',W*.004);mark.setAttribute('class','step-mark');svg.append(mark);
 return svg;
}

function dots(){
 const nav=$('dots');nav.replaceChildren();
 correct.forEach((_,i)=>{const s=slots[i],b=el('button','step-dot',`(${i+1})`);b.type='button';
  b.dataset.state=s.checked?(s.ok?'ok':'ng'):s.revealed?'seen':'';if(step===i+1)b.setAttribute('aria-current','step');
  b.setAttribute('aria-label',`空欄 (${i+1})`+(s.checked?(s.ok?' 正解':' まちがい'):s.revealed?' 解説を読んだ':''));
  b.onclick=()=>go(i+1);nav.append(b)});
}
function go(n){step=n;render();window.scrollTo({top:0});$('main').focus({preventScroll:true});}

function intro(){
 const main=$('main'),story=deep.story||{};
 const card=el('section','step-card');
 card.append(el('p','step-kicker','まずは全体像'),el('h1',null,story.title||'この問題、何の話？'));
 (story.body||[]).forEach(t=>card.append(el('p',null,t)));
 if(lesson?.route?.length){const box=el('div','step-route');box.append(el('strong',null,'解く順番'));const ol=el('ol');lesson.route.forEach(r=>ol.append(el('li',null,r)));box.append(ol);card.append(box);}
 if(story.words?.length){const d=el('details','step-words');d.append(el('summary',null,'出てくる記号・ことば'));const dl=el('dl');story.words.forEach(w=>dl.append(el('dt',null,w.term),el('dd',null,w.meaning)));d.append(dl);card.append(d);}
 card.append(el('p','step-small','原本の問題文は下の「原本全体」でいつでも読めます。空欄ごとに、まわりの文章だけを切り出して表示します。'));
 main.replaceChildren(card);
 bar({hint:false,label:'(1) から始める',action:()=>go(1)});
}

function explanation(i,box){
 const part=deep.slots[i],s=slots[i];
 if(s.checked&&!s.ok){const trap=(part.trap||[]).find(t=>t.choice.split(/[・\s]/).includes(s.selected));if(trap)box.append(el("p","step-trap-mine",`あなたが選んだ (${s.selected})：${trap.why}`));}
 if(part.gist){const g=el('p','step-gist');g.append(el('strong',null,'ひとことで：'),document.createTextNode(part.gist));box.append(g);}
 const more=el('details','step-more');more.open=true;more.append(el('summary',null,`(${i+1}) をくわしく`));
 if(part.figure){const f=el('figure','step-figure');f.innerHTML=part.figure;more.append(f);}
 if(part.steps?.length){const ol=el('ol','step-steps');part.steps.forEach(st=>{const li=el('li');li.append(el('strong',null,st.title));if(st.body)li.append(el('p',null,st.body));if(st.math)li.append(el('div','step-math',st.math));ol.append(li)});more.append(ol);}
 if(part.trap?.length){const d=el('details','step-traps');d.append(el('summary',null,'ほかの選択肢が違う理由'));const ul=el('ul');part.trap.forEach(t=>{const li=el('li');li.append(el('strong',null,`(${t.choice}) `),document.createTextNode(t.why));ul.append(li)});d.append(ul);more.append(d);}
 if(part.check){const c=el('p','step-check');c.append(el('strong',null,'確かめ：'),document.createTextNode(part.check));more.append(c);}
 box.append(more);
}

function blank(i){
 const main=$('main'),part=deep.slots[i],s=slots[i],card=el('section','step-card');
 card.append(el('p','step-kicker',`空欄 (${i+1}) / ${correct.length}`));
 const figure=crop(i,s.wide);
 if(figure){const wrap=el('div','step-crop');wrap.append(figure);card.append(wrap);
  requestAnimationFrame(()=>{const spot=spots.find(x=>x.slot===i),vb=figure.viewBox.baseVal,W=pageSvg(spot.page)?.viewBox.baseVal.width||vb.width;if(wrap.scrollWidth>wrap.clientWidth)wrap.scrollLeft=(spot.x/100*W-vb.x)/vb.width*wrap.scrollWidth-wrap.clientWidth/2;});
  if(matchMedia('(max-width:700px)').matches)card.append(el('p','step-small step-swipe','拡大表示中：左右にスクロールすると前後が読めます'));
  const wide=el('button','step-text-button',s.wide?'切り出しを狭くする':'前後の文章を広く表示');wide.type='button';wide.onclick=()=>{s.wide=!s.wide;render()};card.append(wide);}
 else card.append(el('p','step-small','この空欄の位置データがないため、「原本全体」で問題文を確認してください。'));
 if(part.ask){const a=el('p','step-ask');a.append(el('strong',null,'聞かれていること：'),document.createTextNode(part.ask));card.append(a);}
 const hint=el('div','step-hint');hint.hidden=!s.hint;
 if(part.steps?.[0]){hint.append(el('strong',null,'ヒント：'+part.steps[0].title),el('p',null,part.steps[0].body||''));}
 card.append(hint);
 const group=el('div','step-choices');group.setAttribute('role','radiogroup');group.setAttribute('aria-label',`空欄 (${i+1}) の解答群`);
 (deep.choices?symbols.filter(sym=>sym in deep.choices):symbols).forEach(sym=>{const b=el('button','step-choice');b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-checked',String(s.selected===sym));
  b.append(el('span','step-sym',sym),el('span','step-formula',deep.choices?.[sym]||'（原本の解答群を参照）'));
  if(s.checked){b.disabled=true;if(sym===correct[i])b.dataset.result='correct';else if(sym===s.selected)b.dataset.result='wrong';}
  b.onclick=()=>{s.selected=sym;render()};group.append(b)});
 card.append(group);
 const feedback=el('div','step-feedback');
 if(s.checked){feedback.dataset.ok=String(s.ok);feedback.append(el('strong',null,s.ok?`正解！ (${correct[i]})`:`ちがいます。正解は (${correct[i]})`));
  const label={unaided:'自力で正解',reproduced:'解説を読んだ後に再現できた',assisted:'ヒント・解説を見て正解',retry:'要復習として記録'}[s.outcome];if(label)feedback.append(el('span','step-outcome',label));}
 card.append(feedback);
 if(!s.checked&&!s.revealed){const peek=el('button','step-text-button','わからないので先に解説を読む');peek.type='button';peek.onclick=()=>{s.revealed=true;exposeSlot(i);render()};card.append(peek);}
 if(s.checked||s.revealed){const box=el('div','step-explain');explanation(i,box);card.append(box);}
 main.replaceChildren(card);
 const last=i===correct.length-1;
 if(!s.checked)bar({hint:!s.hint&&!!part.steps?.[0],label:'答え合わせ',disabled:!s.selected,action:()=>check(i)});
 else bar({hint:false,label:last?'結果を見る':`(${i+2}) へ進む`,action:()=>go(i+2)});
}

function check(i){
 const s=slots[i];if(!s.selected)return;
 s.checked=true;s.ok=s.selected===correct[i];
 if(!s.ok||s.hint||s.revealed)exposeSlot(i);
 s.outcome=attemptSlot(i,s.ok,s.hint||s.revealed);
 render();document.querySelector('.step-feedback')?.scrollIntoView({block:'center',behavior:'smooth'});
}

function result(){
 const main=$('main'),card=el('section','step-card');
 const solved=slots.filter(s=>s.checked&&s.ok&&!s.hint&&!s.revealed).length;
 card.append(el('p','step-kicker','おつかれさま'),el('h1',null,`ヒントなしで ${solved} / ${correct.length} 問 正解`));
 const ul=el('ul','step-summary');
 slots.forEach((s,i)=>{const li=el('li');const b=el('button',null,`(${i+1})`);b.type='button';b.onclick=()=>go(i+1);
  li.append(b,el('span',null,!s.checked?(s.revealed?'解説を読んだ（未解答）':'未解答'):s.ok?(s.hint||s.revealed?'ヒント・解説を見て正解':'自力で正解'):`まちがい（選んだのは ${s.selected}、正解は ${correct[i]}）`));
  li.dataset.state=s.checked?(s.ok?'ok':'ng'):'';ul.append(li)});
 card.append(ul);
 const wrong=slots.map((s,i)=>(!s.checked||!s.ok)?i:-1).filter(i=>i>=0);
 card.append(el('p','step-small','記録は学習室と共通です。24時間以内に解き直して正解すると「再現できた」、時間をあけて正解すると「自力正解」になります。'));
 const links=el('div','step-links');
 const study=el('a',null,'学習室でこの問題を見る');study.href='denken-study.html?q='+encodeURIComponent(q.id);links.append(study);
 card.append(links);main.replaceChildren(card);
 if(wrong.length)bar({hint:false,label:'まちがえた空欄だけ解き直す',action:()=>{wrong.forEach(i=>{slots[i]={wide:false}});go(wrong[0]+1)}});
 else bar({hint:false,label:'最初から解き直す',action:()=>{slots.forEach((_,i)=>slots[i]={wide:false});go(1)}});
}

let barAction=null;
function bar({hint,label,disabled=false,action}){
 $('bar').hidden=false;$('hint').hidden=!hint;const a=$('action');a.textContent=label;a.disabled=disabled;barAction=action;
}
$('action').onclick=()=>barAction?.();
$('hint').onclick=()=>{const s=slots[step-1];if(!s)return;s.hint=true;render();document.querySelector('.step-hint')?.scrollIntoView({block:'center',behavior:'smooth'});};
$('whole').onclick=()=>{
 const box=$('whole-pages');
 if(!box.childElementCount)pages.slice(q.page,q.end+1).forEach((svg,n)=>{const d=el('div','step-whole-page');d.innerHTML=svg;const s=d.querySelector('svg');s?.removeAttribute('width');s?.removeAttribute('height');d.setAttribute('aria-label',`原本 ${n+1} ページ`);box.append(d)});
 $('whole-dialog').showModal();
};
$('whole-close').onclick=()=>$('whole-dialog').close();

function render(){dots();if(step===0)intro();else if(step>correct.length)result();else blank(step-1);}

(async()=>{try{
 const paper=qid.replace(/-\d+$/,''),number=Number(qid.match(/-(\d+)$/)?.[1]);
 const [catalog,answers,lessons,deepIndex,hotspots]=await Promise.all([json('denken-assets/catalog.json'),json('denken-assets/answers.json'),json('denken-assets/original-explanations.json?v=9'),json('denken-assets/deep/index.json?v='+Date.now().toString(36).slice(0,-4)),json('denken-assets/blank-hotspots.json?v=2')]);
 const p=catalog.find(x=>x.id===paper),i=p?.starts.findIndex(s=>s.number===number);
 if(!p||i<0)throw Error('問題が見つかりません');
 q={...p,id:qid,paper,number,page:p.starts[i].page,end:(p.starts[i+1]?.page??p.pages)-1};
 const k=`${q.year}-${q.subject}-${q.number}`;
 const year=String(q.year),deepAll=deepIndex.years?.[year]?await json('denken-assets/deep/'+year+'.json?v='+deepIndex.years[year]):{};
 correct=answers[q.year]?.[q.subject]?.[q.number];lesson=lessons[k];deep=deepAll[k];spots=hotspots[q.id]||[];
 $('title').textContent=`${q.year} ${q.subject} 問${q.number}`;document.title=`${q.year} ${q.subject} 問${q.number}｜1空欄ずつ解く（試作）`;
 $('back').href='denken-study.html?q='+encodeURIComponent(q.id);
 if(!deep||!Array.isArray(correct)||deep.slots?.length!==correct.length){$('main').replaceChildren(el('p','step-loading','この問題はまだ「1空欄ずつ解く」に対応していません。学習室の通常画面で学べます。'));return;}
 correct.forEach(()=>slots.push({wide:false}));
 render();
 pages=(await unpack(q.year))[q.paper]||[];
 await Promise.all([...new Set(spots.map(s=>s.page))].map(measure));
 render();
}catch(e){$('main').replaceChildren(el('p','step-loading','読み込めませんでした。再読み込みしてください。'));console.error(e)}})();
$('main').tabIndex=-1;
})();
