import * as pdfjs from './vendor/pdfjs/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const $=id=>document.getElementById(id);
const fields={
 thermal:{label:'熱分野',title:'熱を、理解する。',index:'energy-study-index.json',key:'ukiwa-energy-progress-v1',book:'2026年版 エネルギー管理士 熱分野',subjects:['総合管理・法規','熱・流体の基礎','燃料・燃焼','熱利用設備']},
 electric:{label:'電気分野',title:'電気を、理解する。',index:'energy-electric-index.json',key:'ukiwa-energy-electric-progress-v1',book:'2025年版 エネルギー管理士 電気分野',subjects:['総合管理・法規','電気の基礎','電気設備及び機器','電力応用']}
};
let field='thermal',KEY=fields.thermal.key,switching=false,started=false,startPending=false;
let index, pdf, current, filtered=[], qpos=0, apos=0, mode='learn', revealed=true, attempted=false, token=0, db, importing=false;
let blankPositions={};try{blankPositions=(await (await fetch('./energy-blank-positions.json')).json()).items||{};}catch{}
let activeBlank=null,focusBlank=false,restoreFocusKey=null;
let inlineOpen=false,returnPosition=null,returnButton=null,pendingOutcome=null;
let records={},last='', readerTab='answer', columns=false, draftEdited=false;
const evidence=window.UkiwaStudyEvidence;
try{mode=localStorage.getItem('ukiwa-energy-approach')==='practice'?'practice':'learn';}catch{}
function exposeCurrent(){if(!current)return;Object.assign(rec(),evidence.expose(rec()));persist();}
function closeContext(restore=true){inlineOpen=false;activeBlank=null;document.querySelectorAll('.energy-blank').forEach(b=>b.setAttribute('aria-expanded','false'));document.querySelector('.question-pane').classList.remove('context-open');document.querySelector('.answer-pane').hidden=true;if(returnPosition){$('qview').scrollLeft=returnPosition.x;$('qview').scrollTop=returnPosition.y;viewPositions.q={...returnPosition.normalized};}returnPosition=null;if(restore){restoreFocusKey=returnButton?.dataset.blank||null;render();const target=$('open-context');target.focus({preventScroll:true});}}

function openContext(trigger){if(!current)return;if(!inlineOpen)returnPosition={x:$('qview').scrollLeft,y:$('qview').scrollTop,normalized:{...viewPositions.q}};returnButton=trigger||$('open-context');inlineOpen=true;document.querySelector('.question-pane').classList.add('context-open');document.querySelector('.answer-pane').hidden=false;render();$('context-heading').focus({preventScroll:true});}
const viewPositions={q:{x:0,y:0},a:{x:0,y:0}};
function resetView(side){viewPositions[side]={x:0,y:0};const v=$(side+'view');v.scrollLeft=v.scrollTop=0;}
function readProgress(){records={};last='';try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');records=d.records&&typeof d.records==='object'?d.records:{};last=typeof d.last==='string'?d.last:'';}catch{notice('保存記録を読み込めませんでした。記録のバックアップがあれば読み込んでください。');}}

const notice=t=>$('notice').textContent=t;
const rec=()=>records[current.id]||(records[current.id]={});
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records,last:current?.id||last}));}catch{notice('記録を保存できません。記録の書き出しを利用してください。');}stats();}
function stats(){if(!index)return;const known=index.items.map(x=>records[x.id]||{}),read=known.filter(x=>x.read).length,correct=known.filter(x=>x.correct).length,retry=known.filter(x=>x.retry).length;$('stats').textContent=`${fields[field].label}・全${index.items.length}問 ／ 読了 ${read} ／ 自力で解けた ${correct} ／ 再現 ${known.filter(x=>x.reproducedAt).length} ／ 解説使用 ${known.filter(x=>x.assistedAt).length} ／ 要復習 ${retry}`;$('progress').max=index.items.length;$('progress').value=correct;}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('ukiwa-energy-library',1);r.onupgradeneeded=()=>r.result.createObjectStore('books');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function getBook(){return new Promise((resolve,reject)=>{const r=db.transaction('books').objectStore('books').get(field);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function putBook(blob){return new Promise((resolve,reject)=>{const t=db.transaction('books','readwrite');t.objectStore('books').put(blob,field);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
async function loadPDF(blob,save=false){
 if(importing)return;importing=true;$('file').disabled=true;$('field').disabled=true;$('load-state').textContent='教材を確認しています…';
 try{
  if(blob.size!==index.book.size)throw Error(`選択中は${fields[field].label}です。「${fields[field].book}」の${index.book.pages}ページPDFを選んでください。別分野の教材なら、上の分野を切り替えてください。`);
  const bytes=await blob.arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==index.book.sha256)throw Error('このPDFは対応教材と一致しません。別の版では問題の位置が変わるため、読み込みを中止しました。');
  const loaded=await pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false}).promise;
  if(loaded.numPages!==index.book.pages){await loaded.destroy();throw Error('ページ数が対応教材と異なります。');}
  const old=pdf;pdf=loaded;token++;if(old)await old.destroy();
  let saved=!save;
  if(save){try{db=db||await openDB();await putBook(blob);saved=true;navigator.storage?.persist?.().catch(()=>{});}catch{notice('教材は表示できますが、端末に保存できませんでした。次回は再選択してください。');}}
  $('load-state').textContent=saved?'教材を保存しました。次回は自動で開きます。':'この回だけ教材を開いています。';
  $('library').hidden=true;applyFilters(last);if(startPending)beginStudy();
 }catch(e){$('load-state').textContent=e.message;$('library').hidden=false;}
 finally{importing=false;$('file').disabled=switching;$('field').disabled=switching;$('file').value='';updateStart();}
}
function matches(x){const r=records[x.id]||{};return (! $('year').value||x.year===+$('year').value)&&(!$('subject').value||x.subject===+$('subject').value)&&({all:true,new:!r.read&&!r.attempted,read:r.read&&!r.attempted,retry:r.retry,saved:r.saved}[$('filter').value]);}
function applyFilters(wanted){
 filtered=index.items.filter(matches);$('question').replaceChildren(...filtered.map(x=>new Option(`${$('year').value?'':x.year+'年度 · '}問${x.number} ${x.title}${x.optional?'［選択］':''}`,x.id)));
 $('empty').hidden=filtered.length>0;$('workspace').hidden=!started||!pdf||!filtered.length;
 if(!filtered.length){token++;current=null;return;}
 const next=filtered.find(x=>x.id===wanted)||filtered[0];$('question').value=next.id;selectQuestion(next);
}
function selectQuestion(x){
 closeContext(false);pendingOutcome=null;current=x;last=x.id;qpos=0;apos=0;draftEdited=false;resetView('q');resetView('a');revealed=mode==='learn';attempted=false;token++;
 $('lesson-meta').textContent=`${x.year}年度 / 課目${['','Ⅰ','Ⅱ','Ⅲ','Ⅳ'][x.subject]}${x.optional?' / 選択問題':''}`;
 $('lesson-title').textContent=`問${x.number}　${x.title}`;$('draft').value=rec().draft||'';
 $('bookmark').setAttribute('aria-label',rec().saved?'あとで解くを解除':'あとで解くに登録');$('bookmark').setAttribute('aria-pressed',!!rec().saved);$('bookmark').textContent=rec().saved?'★':'☆';
 const n=filtered.findIndex(y=>y.id===x.id);$('prev').disabled=n===0;$('next').disabled=n===filtered.length-1;
 $('evaluation').textContent=rec().retry?'この問題は要復習です。':rec().correct?'以前、自力で解けた問題です。':rec().lastOutcome==='reproduced'?'解説を読んだ後、再現できた記録があります。':rec().lastOutcome==='assisted'?'解説を使って解けた記録があります。':rec().read?'解説を読んだ記録があります。':'';
 $('question-position').textContent=`${n+1} / ${filtered.length} 問`;help(x);persist();render();
}
async function paint(side,serial){
 const segments=side==='q'?current.question:[answerSegments()[apos]],view=$(side+'view');
 if(!view.clientWidth||!view.clientHeight)return;
 const pos={...viewPositions[side]},questionId=current.id,rendered=[];
 if(side==='q'&&view.dataset.question!==questionId){view.dataset.question=questionId;view.textContent='問題を読み込んでいます…';}
 const z=+$(side==='q'?'zoom':'azoom').value;
 const targetWidth=Math.max(80,view.clientWidth-parseFloat(getComputedStyle(view).paddingLeft)-parseFloat(getComputedStyle(view).paddingRight))*z;
 for(const seg of segments){
  if(serial!==token)return;
  const page=await pdf.getPage(seg.page);if(serial!==token)return;
  const base=page.getViewport({scale:1}),r=seg.rect,scale=targetWidth/(base.width*(r[2]-r[0]));
  const cssHeight=base.height*(r[3]-r[1])*scale;
  const dpr=Math.min(devicePixelRatio||1,3,Math.sqrt(16000000/(segments.length*targetWidth*cssHeight))),vp=page.getViewport({scale:scale*dpr});
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width*(r[2]-r[0]));canvas.height=Math.ceil(vp.height*(r[3]-r[1]));
  canvas.style.width=targetWidth+'px';canvas.style.height=canvas.height/dpr+'px';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${current.year}年度 問${current.number} ${side==='q'?'問題':'解答と解説'} 原本${seg.page}ページの該当部分`);
  await page.render({canvasContext:canvas.getContext('2d'),viewport:vp,transform:[1,0,0,1,-vp.width*r[0],-vp.height*r[1]]}).promise;
  if(serial!==token)return;rendered.push({canvas,seg});
 }
 if(serial!==token||questionId!==current.id)return;
 if(side==='q'){
  if($('tap-jump-list'))$('tap-jump-list').replaceChildren();
  view.replaceChildren(...rendered.map(({canvas,seg},i)=>{const part=document.createElement('section');part.className='question-part';part.dataset.part=i;part.style.width=targetWidth+'px';part.setAttribute('aria-label',`問題の続き ${i+1} / ${segments.length}`);part.append(canvas);decorateBlanks(part,seg,questionId);return part;}));
 }else view.replaceChildren(rendered[0].canvas);
 const first=rendered[0].canvas;view.scrollTop=pos.y*first.clientHeight;view.scrollLeft=pos.x*first.clientWidth;
 if(side==='q'){if(restoreFocusKey){view.querySelector(`[data-blank="${restoreFocusKey}"]`)?.focus({preventScroll:true});restoreFocusKey=null;}updateQuestionPosition();if(focusBlank&&activeBlank){focusBlank=false;const b=view.querySelector(`[data-blank="${activeBlank}"]`);if(b){view.scrollTop+=b.getBoundingClientRect().top-view.getBoundingClientRect().top-view.clientHeight/2;view.scrollLeft+=b.getBoundingClientRect().left-view.getBoundingClientRect().left-view.clientWidth/2;}}}
}
function decorateBlanks(part,seg,id){
 for(const [key,spots] of Object.entries(blankPositions[id]||{}))for(const spot of spots){
  const [x,y,right,bottom]=seg.rect;if(spot.page!==seg.page||spot.x<x||spot.x>right||spot.y<y||spot.y>bottom)continue;
  const b=document.createElement('button');b.className='energy-blank';b.type='button';b.textContent=`(${key})`;b.dataset.blank=key;b.style.left=((spot.x-x)/(right-x)*100)+'%';b.style.top=((spot.y-y)/(bottom-y)*100)+'%';
  b.setAttribute('aria-label',`空欄 ${key} を選び、この問題の解説を開く`);b.setAttribute('aria-expanded',String(activeBlank===key));
  b.onclick=()=>{if(current?.id!==id)return;activeBlank=key;focusBlank=true;$('context-heading').textContent=`選択中 (${key}) · この問題の解説`;openContext(b);};part.append(b);
 }
}
function updateQuestionPosition(){
 const view=$('qview'),parts=[...view.querySelectorAll('.question-part')];if(!parts.length)return;
 const top=view.getBoundingClientRect().top+36;let active=0;
 parts.forEach((part,i)=>{if(part.getBoundingClientRect().top<=top)active=i;});if(view.scrollHeight-view.clientHeight>5&&view.scrollTop>=view.scrollHeight-view.clientHeight-2)active=parts.length-1;qpos=active;
 $('qpage').textContent=`${qpos+1} / ${parts.length}`;$('qprev').disabled=qpos===0;$('qnext').disabled=qpos===parts.length-1;
}
function jumpQuestionPart(delta){
 const view=$('qview'),parts=view.querySelectorAll('.question-part'),next=Math.max(0,Math.min(parts.length-1,qpos+delta)),part=parts[next];if(!part)return;
 view.scrollTop+=part.getBoundingClientRect().top-view.getBoundingClientRect().top-5;updateQuestionPosition();
}
$('qview').addEventListener('scroll',updateQuestionPosition,{passive:true});

function render(){
 if(!started||!pdf||!current)return;const serial=++token;if(inlineOpen&&revealed&&readerTab==='answer')exposeCurrent();
 for(const [s,list,pos] of [['q',current.question,qpos],['a',answerSegments(),apos]]){$(s+'page').textContent=`${pos+1} / ${list.length}`;$(s+'prev').disabled=pos===0;$(s+'next').disabled=pos===list.length-1;}
 $('aview').hidden=!revealed;$('answer-cover').hidden=revealed;
 $('aprev').disabled=!revealed||apos===0;$('anext').disabled=!revealed||apos===answerSegments().length-1;
 $('read').disabled=!revealed;$('correct').disabled=!(mode==='practice'&&attempted&&revealed&&pendingOutcome);
 $('correct').textContent=pendingOutcome==='unaided'?'自力で解けた':pendingOutcome==='reproduced'?'再現できた':'解説を使って解けた';
 $('correct').title=$('correct').disabled?'解説を隠して解答を記入し、答え合わせしてから記録できます。':'';
 Promise.all([paint('q',serial),inlineOpen&&revealed&&readerTab==='answer'?paint('a',serial):Promise.resolve()]).catch(e=>{if(serial===token)notice('ページを表示できませんでした。教材を開き直してください。'+e.message);});
}
function setMode(m){pendingOutcome=null;try{localStorage.setItem('ukiwa-energy-approach',m);}catch{}mode=m;revealed=m==='learn';attempted=false;draftEdited=false;for(const id of ['learn','practice'])$(id).setAttribute('aria-pressed',id===m);render();}
function answerSegments(){return current.answer.flatMap(seg=>{if(!columns||seg.rect[2]-seg.rect[0]<.6)return [seg];const [x,y,r,b]=seg.rect,mid=(x+r)/2;return [{...seg,rect:[x,y,mid,b]},{...seg,rect:[mid,y,r,b]}];});}
function setLayout(layout){$('desk').dataset.layout='question';if(layout==='question')closeContext();else openContext(document.querySelector(`[data-layout="${layout}"]`));document.querySelectorAll('button[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String((layout==='question')===(b.dataset.layout==='question'))));render();}
function setTab(tab){readerTab=tab;for(const name of ['answer','note','basics']){$(name+'-panel').hidden=name!==tab;$('tab-'+name).setAttribute('aria-selected',name===tab);$('tab-'+name).tabIndex=name===tab?0:-1;}render();}
function filters(open){if(!started)open=true;$('filters-panel').hidden=!open;$('filters-toggle').setAttribute('aria-expanded',open);}
$('filters-toggle').onclick=()=>filters($('filters-panel').hidden);$('filters-close').onclick=()=>filters(false);
document.querySelectorAll('button[data-layout]').forEach(b=>b.onclick=()=>setLayout(b.dataset.layout));
for(const [i,name] of ['answer','note','basics'].entries()){$('tab-'+name).onclick=()=>setTab(name);$('tab-'+name).onkeydown=e=>{const names=['answer','note','basics'];let j;if(e.key==='ArrowRight')j=(i+1)%3;else if(e.key==='ArrowLeft')j=(i+2)%3;else if(e.key==='Home')j=0;else if(e.key==='End')j=2;else return;e.preventDefault();setTab(names[j]);$('tab-'+names[j]).focus();};}
$('write-answer').onclick=()=>{setTab('note');$('draft').focus();};
$('note-reveal').onclick=()=>{$('reveal').click();setTab('answer');};
$('column-toggle').onclick=()=>{columns=!columns;apos=0;resetView('a');$('column-toggle').setAttribute('aria-pressed',columns);$('column-toggle').textContent=columns?'ページ全体へ':'一段ずつ読む';$('answer-caption').textContent=columns?'左段→右段の順。図表が切れるときは「ページ全体へ」。':'教材原本の解答・解説';render();};
for(const [side,id] of [['q','zoom'],['a','azoom']]){
 $(id).onchange=render;
 for(const [suffix,d] of [['minus',-1],['plus',1]])$(side+suffix).onclick=()=>{const select=$(id);select.selectedIndex=Math.max(0,Math.min(select.options.length-1,select.selectedIndex+d));render();};
 const view=$(side+'view');view.addEventListener('scroll',()=>{const c=view.querySelector('canvas');if(c)viewPositions[side]={x:view.scrollLeft/c.clientWidth,y:view.scrollTop/c.clientHeight};});
 let drag=null;view.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0||e.target.closest('button,a,input,select,textarea'))return;drag={x:e.clientX,y:e.clientY,left:view.scrollLeft,top:view.scrollTop};view.setPointerCapture(e.pointerId);view.classList.add('dragging');e.preventDefault();});
 view.addEventListener('pointermove',e=>{if(!drag)return;view.scrollLeft=drag.left+drag.x-e.clientX;view.scrollTop=drag.top+drag.y-e.clientY;});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])view.addEventListener(event,()=>{drag=null;view.classList.remove('dragging');});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){filters(false);$('storage').open=false;$('settings').setAttribute('aria-expanded',false);if(pdf)$('library').hidden=true;}});
function help(x){
 const guides={1:['法規・総合管理','まず「誰が・何を・どの条件で」を分けて読みます。数字と単位をセットで確認し、法律の名称と対象年度を確かめます。','エネルギー量は電力や燃料の量そのものとは異なります。換算係数の単位が打ち消し合うかを書いて確かめましょう。'],2:['熱・流体の基礎','系の境界と、出入りする熱・仕事・質量を図に描きます。与えられた条件から、使える式を一つずつ選びます。','絶対温度 T[K]＝t[℃]＋273.15。温度差の1 Kと1 ℃は同じ大きさですが、温度の比に℃をそのまま使いません。'],3:['燃料・燃焼','何を1 molまたは1 kgの基準にするかを先に決めます。反応式をそろえ、理論量と実際の供給量を分けて計算します。','空気比は、実際の供給空気量を理論空気量で割った比です。湿り・乾きのガス量、質量・体積の基準を混ぜないようにします。'],4:['熱利用設備','機器の入口と出口を図に書き、質量収支とエネルギー収支を別々に立てます。求めるものが量なのか、単位時間あたりの量なのかを確認します。','1 W＝1 J/s。kWとkWhは別の量です。効率では、有効に得た量と投入した量が同じ単位になっているか確認します。']};
 const electricGuides={
 2:['電気の基礎','問題の回路・ブロック図に、分かっている量と求める量を書き込みます。直流と交流、実効値と最大値、線間と相の値を最初に区別します。','抵抗だけの回路は V＝RI。交流では位相差も扱うため、複素インピーダンスを使う場面があります。制御・計測は、入力・出力と測る対象を先に確認しましょう。'],
 3:['電気設備及び機器','受電点から負荷までの電力の流れを描き、変圧器・電動機・配線で生じる損失を分けます。効率の分母は入力、分子は有効な出力です。','平衡三相の有効電力は P＝√3 VI cosφ（Vは線間電圧、Iは線電流の実効値）。単相の式と混同せず、W・kWとVA・kVAを区別します。'],
 4:['電力応用','電気を何に変えて利用する機器なのかを先に捉えます。動力・加熱・化学・照明・空調では、求める量と使う法則が変わります。','1 W＝1 J/s、1 kWh＝3.6 MJ。エネルギーと電力は別の量です。照明では光束[lm]と照度[lx]、空調では効率とCOPの定義を確認します。']
 };
 const g=(field==='electric'&&x.subject!==1?electricGuides:guides)[x.subject];$('learning-help').replaceChildren();for(const [h,t] of [[g[0]+'の読み方',g[1]],['基礎の確認',g[2]],['解説を読むとき','①何を求めるか ②与えられた条件 ③式を選ぶ理由 ④単位をそろえて代入 ⑤結果の意味、の順で追ってください。分からない行は自分の解答欄にメモしておくと、次回の復習に使えます。']]){const heading=document.createElement('h4'),p=document.createElement('p');heading.textContent=h;p.textContent=t;$('learning-help').append(heading,p);}
}
for(const id of ['year','subject','filter'])$(id).addEventListener('change',()=>applyFilters(current?.id));
$('question').onchange=()=>selectQuestion(filtered.find(x=>x.id===$('question').value));
for(const [id,delta] of [['prev',-1],['next',1]])$(id).onclick=()=>{const x=filtered[filtered.findIndex(x=>x.id===current.id)+delta];if(x){$('question').value=x.id;selectQuestion(x);}};
$('qprev').onclick=()=>jumpQuestionPart(-1);$('qnext').onclick=()=>jumpQuestionPart(1);
for(const [id,d] of [['aprev',-1],['anext',1]])$(id).onclick=()=>{apos+=d;resetView('a');render();};
$('learn').onclick=()=>setMode('learn');$('practice').onclick=()=>setMode('practice');$('zoom').onchange=render;
$('draft').oninput=()=>{if(current){rec().draft=$('draft').value;draftEdited=true;persist();}};
$('reveal').onclick=()=>{attempted=draftEdited&&!!$('draft').value.trim();pendingOutcome=attempted?evidence.result(rec(),true,revealed).lastOutcome:null;revealed=true;if(attempted){rec().attempted=true;rec().lastAttempt=new Date().toISOString();persist();}$('evaluation').textContent=attempted?'原本と照合してください。正解だった場合も直近の解説閲覧を区別して記録します。':'解説を使った学習です。読むだけでも進められます。';exposeCurrent();render();};
$('bookmark').onclick=()=>{rec().saved=!rec().saved;$('bookmark').setAttribute('aria-label',rec().saved?'あとで解くを解除':'あとで解くに登録');$('bookmark').setAttribute('aria-pressed',!!rec().saved);$('bookmark').textContent=rec().saved?'★':'☆';persist();};
$('read').onclick=()=>{rec().read=true;persist();$('evaluation').textContent='読了を記録しました。次は「自力で解く」で確かめましょう。';};
$('correct').onclick=()=>{if(!(mode==='practice'&&attempted&&revealed&&pendingOutcome))return;const outcome=pendingOutcome;Object.assign(rec(),{correct:outcome==='unaided'||!!rec().correct,retry:false,read:true,attempted:true,lastOutcome:outcome,[outcome+'At']:new Date().toISOString()});pendingOutcome=null;persist();render();$('evaluation').textContent=({unaided:'自力で解けた',reproduced:'再現できた',assisted:'解説を使って解けた'}[outcome])+'記録を保存しました（自己評価）。';};
$('retry').onclick=()=>{rec().retry=true;rec().correct=false;persist();$('evaluation').textContent='要復習に登録しました。絞り込みでまとめて開けます。';};
$('resume').onclick=()=>{const x=index.items.find(x=>x.id===last);if(x){$('year').value=x.year;$('subject').value='';$('filter').value='all';applyFilters(x.id);}};
$('settings').onclick=()=>{$('storage').open=!$('storage').open;$('settings').setAttribute('aria-expanded',$('storage').open);};
$('close-library').onclick=()=>{if(pdf)$('library').hidden=true;};
$('change-book').onclick=()=>{$('library').hidden=false;$('library').scrollIntoView({behavior:'smooth'});};
$('file').onchange=()=>{if($('file').files[0])loadPDF($('file').files[0],true);};
$('remove-book').onclick=async()=>{if(importing||switching)return;if(!confirm(`${fields[field].label}の保存教材PDFを削除しますか？他分野の教材と学習記録は残ります。`))return;try{if(db){await new Promise((res,rej)=>{const t=db.transaction('books','readwrite');t.objectStore('books').delete(field);t.oncomplete=res;t.onerror=()=>rej(t.error);});}token++;if(pdf)await pdf.destroy();pdf=null;started=false;startPending=false;document.body.classList.remove('ready');filters(true);updateStart();$('workspace').hidden=true;$('library').hidden=false;$('load-state').textContent='保存教材を削除しました。記録は残っています。';}catch{notice('教材の削除に失敗しました。');}};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,book:index.book.id,records,last},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ukiwa-energy-${field}-progress.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async()=>{try{const f=$('import').files[0];if(!f)return;if(f.size>5e6)throw Error('記録ファイルが大きすぎます。');const d=JSON.parse(await f.text());if(d.version!==1||d.book!==index.book.id||!d.records||typeof d.records!=='object')throw Error('この学習室の記録ファイルではありません。');for(const x of index.items){const r=d.records[x.id];if(r&&typeof r==='object'){const clean={};for(const k of ['read','correct','retry','saved','attempted'])clean[k]=r[k]===true;for(const k of ['exposedAt','readAt','unaidedAt','reproducedAt','assistedAt'])if(typeof r[k]==='string'&&Number.isFinite(Date.parse(r[k])))clean[k]=r[k];if(['unaided','reproduced','assisted','retry'].includes(r.lastOutcome))clean.lastOutcome=r.lastOutcome;clean.draft=typeof r.draft==='string'?r.draft.slice(0,50000):'';records[x.id]=clean;}}last=index.items.some(x=>x.id===d.last)?d.last:last;persist();applyFilters(current?.id);notice('記録を読み込みました。');}catch(e){notice(e.message);}finally{$('import').value='';}};
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,200);});
async function switchField(next){
 if(switching||importing||!fields[next])return;
 switching=true;$('start').disabled=true;$('field').disabled=true;$('file').disabled=true;notice('');
 try{
  const response=await fetch('./'+fields[next].index);if(!response.ok)throw Error('索引を読み込めません。');const nextIndex=await response.json();
  token++;const old=pdf;pdf=null;current=null;$('workspace').hidden=true;if(old)await old.destroy();
  field=next;KEY=fields[field].key;index=nextIndex;readProgress();
  $('field').value=field;document.body.dataset.field=field;
  try{localStorage.setItem('ukiwa-energy-field',field);}catch{}
  const config=fields[field],years=[...new Set(index.items.map(x=>x.year))].sort((a,b)=>b-a);
  $('room-title').textContent=config.title;$('field-label').textContent=config.label;
  $('year-range').textContent=`${years.at(-1)} — ${years[0]}`;$('coverage').textContent=`${years.length}年分・${index.items.length}問（選択問題を含む）`;
  $('field-summary').textContent=`${config.label} ${years.at(-1)}〜${years[0]}年度・${index.items.length}問`;
  $('book-description').textContent=`対応する「${config.book}」の${index.book.pages}ページPDFを選ぶと、年度・課目・問題ごとに開けます。`;
  $('subject').replaceChildren(new Option('全課目',''),...config.subjects.map((s,i)=>new Option(['Ⅰ','Ⅱ','Ⅲ','Ⅳ'][i]+' '+s,i+1)));
  $('year').replaceChildren(new Option('全年度',''),...years.map(y=>new Option(y+'年度',y)));$('year').value=years[0];$('filter').value='all';
  const previous=index.items.find(x=>x.id===last);if(previous)$('year').value=previous.year;
  $('library').hidden=false;document.body.classList.remove('ready');stats();applyFilters(last);
  $('load-state').textContent=`${config.label}の教材を選ぶと、${index.items.length}問すべてを問題別に学習できます。`;
  try{db=db||await openDB();const book=await getBook();if(book)await loadPDF(book);}catch{notice('教材の保存機能を利用できません。PDFを選択して、この回だけ学習できます。');}
 }catch(e){notice('学習室の準備に失敗しました。'+e.message);$('field').value=field;}
 finally{switching=false;$('field').disabled=false;$('file').disabled=false;updateStart();if(started&&pdf)beginStudy();}
}
function updateStart(){
 $('start').disabled=switching||importing||!index;
 $('start').textContent=switching||importing?'教材を確認しています…':'学習をはじめる';
 $('start-status').textContent=pdf?'教材は登録済みです。問題のそばで、対応する解説を開けます。':'初回は、この端末で教材PDFの登録が必要です。登録済みなら次回からボタン一つで開始できます。';
}
function beginStudy(){
 if(!pdf||!current)return;
 if(!started&&matchMedia('(max-width:800px)').matches){$('zoom').value='1.6';$('azoom').value='1.6';}
 started=true;startPending=false;document.body.classList.add('ready');$('library').hidden=true;filters(false);$('storage').open=false;
 $('workspace').hidden=false;setLayout('question');setTab('answer');setMode(mode);
 $('lesson-title').setAttribute('tabindex','-1');$('lesson-title').focus({preventScroll:true});
}
$('start').onclick=()=>{
 if(!filtered.length){$('start-status').textContent='条件に合う問題がありません。絞り込みを変更してください。';return;}
 if(pdf){beginStudy();return;}
 startPending=true;$('library').hidden=false;$('load-state').textContent='この端末に教材が未登録です。PDFを選ぶと、そのまま学習画面が開きます。';$('file').click();
};
$('field').onchange=()=>switchField($('field').value);
const answerPane=document.querySelector('.answer-pane');
$('qview').after(answerPane);answerPane.hidden=true;
const contextHead=document.createElement('div');contextHead.className='context-head';contextHead.innerHTML='<strong id="context-heading" tabindex="-1">この問題の解説</strong><button id="close-context" type="button">閉じる ×</button>';
answerPane.prepend(contextHead);
const scope=document.createElement('p');scope.className='context-scope';scope.textContent='大問全体に対応する教材原本です。空欄ごとの解説対応は未整備です。';contextHead.after(scope);
const modebar=document.querySelector('.modebar');document.querySelector('.question-pane .pane-head').before(modebar);$('practice').textContent='自力で解く';
const openButton=document.createElement('button');openButton.id='open-context';openButton.textContent='この問題の解説・解答';openButton.onclick=()=>{activeBlank=null;$('context-heading').textContent='この問題の解説';openContext(openButton);};document.querySelector('.question-pane .paper-tools').append(openButton);
$('close-context').onclick=()=>closeContext();
answerPane.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeContext();}});
const hideButton=document.createElement('button');hideButton.textContent='解説を隠して解く';hideButton.onclick=()=>{setMode('practice');setTab('note');};document.querySelector('.assessment').prepend(hideButton);
document.querySelector('button[data-layout="split"]').textContent='解説も表示';document.querySelector('button[data-layout="answer"]').remove();
let initialField='thermal';try{initialField=localStorage.getItem('ukiwa-energy-field')||'thermal';}catch{}
const requestedField=new URL(location.href).searchParams.get('field');
await switchField(fields[requestedField]?requestedField:fields[initialField]?initialField:'thermal');

const focusButton=document.createElement('button');focusButton.id='reading-focus';focusButton.textContent='大きく読む';focusButton.setAttribute('aria-pressed','false');document.querySelector('.question-pane .pane-head').prepend(focusButton);focusButton.onclick=()=>{const active=document.body.classList.toggle('reading-focus');focusButton.textContent=active?'操作を戻す':'大きく読む';focusButton.setAttribute('aria-pressed',String(active));if(active&&matchMedia('(max-width:800px)').matches&&+$('zoom').value<1.6)$('zoom').value='1.6';requestAnimationFrame(()=>render());};
