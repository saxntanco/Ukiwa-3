/* Local reading controls. Touch scrolling and browser pinch zoom remain native. */
(()=>{'use strict';
const storageKey='ukiwa-study-reader-v1';
let preferences={zoom:'width',text:18,paper:'warm'};
try{Object.assign(preferences,JSON.parse(localStorage.getItem(storageKey)||'{}'))}catch{}
let hotspotRequest;
const loadHotspots=()=>hotspotRequest||(hotspotRequest=fetch('denken-assets/blank-hotspots.json?v=2').then(r=>{if(!r.ok)throw Error('hotspots');return r.json()}).catch(()=>({})));
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(preferences))}catch{}};
window.UkiwaStudyReader={setup({paper,pane,q,spec,lesson,onReveal,onDetail,getMode=()=>'learn',onPractice=()=>{},onAttempt=()=>{},getRecord=()=>({})}){
 let disposed=false,spots=[],popover=null,anchor=null,drag=null,selected=-1,origin=null;
 const pageFrames=new WeakMap();
 const signal=new AbortController(),zoom=document.getElementById('zoom');
 const tools=pane.querySelector('.paper-tools');
 const bar=document.createElement('div');bar.className='reader-bar';
 bar.innerHTML='<div class="reader-zoom"><button type="button" data-size="down" aria-label="問題を縮小">−</button><button type="button" data-size="up" aria-label="問題を拡大">＋</button></div><details class="reader-settings"><summary>読みやすさ</summary><label>解説の文字<select data-text aria-label="解説の文字"><option value="18">標準</option><option value="20">大きい</option><option value="22">特大</option></select></label><label>紙の色<select data-paper aria-label="紙の色"><option value="warm">やわらかい紙色</option><option value="white">白</option></select></label></details><span class="reader-help">拡大後は指で上下左右に移動できます</span>';
 tools.after(bar);
 const textSelect=bar.querySelector('[data-text]'),paperSelect=bar.querySelector('[data-paper]');
 const applyPrefs=()=>{document.getElementById('desk').style.setProperty('--reading-text',preferences.text+'px');paper.dataset.tone=preferences.paper;};
 textSelect.value=String([18,20,22].includes(preferences.text)?preferences.text:18);paperSelect.value=preferences.paper==='white'?'white':'warm';
 preferences.text=Number(textSelect.value);preferences.paper=paperSelect.value;applyPrefs();
 textSelect.onchange=()=>{preferences.text=Number(textSelect.value);applyPrefs();save()};
 paperSelect.onchange=()=>{preferences.paper=paperSelect.value;applyPrefs();save()};
 const levels=['fit','width','125%','150%','200%','250%'];
 zoom.value=levels.includes(preferences.zoom)?preferences.zoom:'width';
 function resize(preserve=true){
  const reader=paper.querySelector('.page-reader'),svg=reader?.querySelector('svg');if(!reader||!svg)return;
  const box=svg.viewBox.baseVal;if(!box.width||!box.height)return;
  shortcut.hidden=false;
  const old=reader.getBoundingClientRect().width||1;
  const cx=(paper.scrollLeft+paper.clientWidth/2)/old,cy=(paper.scrollTop+paper.clientHeight/2)/old;
  const base=matchMedia('(max-width:680px)').matches?Math.max(620,paper.clientWidth-2):paper.clientWidth-2;
  const width=zoom.value==='fit'?Math.min(paper.clientWidth-2,(paper.clientHeight-2)*box.width/box.height):base*(parseFloat(zoom.value)||100)/100;
  reader.style.marginInline='auto';paper.style.setProperty('--reader-width',Math.max(1,width)+'px');paper.dataset.zoom=zoom.value;
  if(preserve){paper.scrollLeft=cx*width-paper.clientWidth/2;paper.scrollTop=cy*width-paper.clientHeight/2}
  bar.querySelector('[data-size="down"]').disabled=zoom.value==='fit';bar.querySelector('[data-size="up"]').disabled=zoom.value==='250%';
 }
 zoom.onchange=()=>{preferences.zoom=zoom.value;save();resize()};
 bar.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{const i=levels.indexOf(zoom.value);zoom.value=levels[Math.max(0,Math.min(levels.length-1,i+(b.dataset.size==='up'?1:-1)))];zoom.onchange()});
 const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el};
 const button=(label,action)=>{const el=text('button',label);el.type='button';el.onclick=action;return el};
 function highlight(){pane.querySelectorAll('[data-blank]').forEach(el=>{const active=Number(el.dataset.blank)===selected;el.setAttribute('aria-expanded',String(active));el.classList.toggle('blank-selected',active);});}
 function close(restore=false){
  const target=anchor,saved=origin;popover?.close();popover?.remove();popover=null;selected=-1;highlight();pane.classList.remove('context-open');
  if(saved){paper.scrollLeft=saved.x;paper.scrollTop=saved.y;window.scrollTo(saved.wx,saved.wy);}origin=null;anchor=null;
  if(restore&&target?.isConnected)target.focus({preventScroll:true});
 }
 function peek(slot,trigger,practice=getMode()==='practice'){
  if(!spec?.[slot])return;
  if(!popover)origin={x:paper.scrollLeft,y:paper.scrollTop,wx:window.scrollX,wy:window.scrollY};
  popover?.remove();anchor=trigger;selected=slot;highlight();pane.classList.add('context-open');
  popover=text('dialog','', 'quick-answer');popover.dataset.tone=preferences.paper;popover.addEventListener('cancel',e=>{e.preventDefault();close(true)});popover.setAttribute('aria-label',`空欄 ${slot+1} の学習`);popover.tabIndex=-1;
  const head=text('div','', 'quick-answer-head');head.append(text('strong',`選択中 (${slot+1})`),button('閉じる ×',()=>close(true)));popover.append(head);
  const readingArea=text('div','', 'quick-answer-reading');popover.append(readingArea);
  const context=text('details','', 'quick-answer-context');context.open=true;
  context.append(text('summary',`空欄 (${slot+1}) の問題文・図を確認`));
  const original=text('div','', 'quick-answer-original');
  for(const page of paper.querySelectorAll('.paper-page')){
   const copy=page.cloneNode(true);copy.querySelectorAll('button').forEach(b=>{
    if(Number(b.dataset.blank)===slot){const mark=text('span','','context-blank');mark.setAttribute('aria-label',`(${slot+1}) 選択中`);mark.style.cssText=b.style.cssText;b.replaceWith(mark)}else b.remove();
   });
   copy.removeAttribute('id');
   const ids=new Map();copy.querySelectorAll('[id]').forEach(el=>{const old=el.id,next=`context-${slot}-${page.dataset.page}-${old}`;ids.set(old,next);el.id=next;});
   copy.querySelectorAll('*').forEach(el=>{for(const attr of [...el.attributes]){let value=attr.value;for(const [old,next] of ids){if(value===`#${old}`)value=`#${next}`;value=value.replaceAll(`url(#${old})`,`url(#${next})`);}if(value!==attr.value)el.setAttribute(attr.name,value);}});
   copy.className='context-paper-page';original.append(copy);
  }
  context.append(original);readingArea.append(context);
  const body=text('div','', 'quick-answer-body');readingArea.append(body);
  document.body.append(popover);popover.showModal();
  const addDetails=(title,content,open=true)=>{const d=text('details','');d.open=open;d.append(text('summary',title),text('p',content));body.append(d);};
  const go=n=>peek(n,pane.querySelector(`[data-blank="${n}"]`)||trigger,false);
  function deepExplanation(deep,part){
   if(deep.story){
    const story=text('details','', 'deep-story');story.open=slot===0;story.append(text('summary',deep.story.title||'この問題、何の話？'));
    (deep.story.body||[]).forEach(v=>story.append(text('p',v)));
    if(deep.story.words?.length){const list=text('dl','', 'deep-words');deep.story.words.forEach(w=>list.append(text('dt',w.term),text('dd',w.meaning)));story.append(list);}
    body.append(story);
   }
   const box=text('section','', 'deep-slot');box.setAttribute('aria-label',`空欄 (${slot+1}) のくわしい解説`);
   box.append(text('h3',`(${slot+1}) をくわしく`));
   if(part.ask){const ask=text('p','', 'deep-ask');ask.append(text('strong','聞かれていること：'),document.createTextNode(part.ask));box.append(ask);}
   if(part.figure){const fig=text('figure','', 'deep-figure');fig.innerHTML=part.figure;box.append(fig);}
   if(part.steps?.length){const ol=text('ol','', 'deep-steps');part.steps.forEach(st=>{const li=text('li','');li.append(text('strong',st.title));if(st.body)li.append(text('p',st.body));if(st.math)li.append(text('div',st.math,'deep-math'));ol.append(li)});box.append(ol);}
   if(part.trap?.length){const d=text('details','', 'deep-trap');d.open=true;d.append(text('summary','ほかの選択肢が違う理由'));const ul=text('ul','');part.trap.forEach(t=>{const li=text('li','');li.append(text('strong',`(${t.choice}) `),document.createTextNode(t.why));ul.append(li)});d.append(ul);box.append(d);}
   if(part.check){const c=text('p','', 'deep-check');c.append(text('strong','確かめ：'),document.createTextNode(part.check));box.append(c);}
   body.append(box);
  }
  function slotNav(){
   const count=spec.length===10?5:spec.length;if(count<2)return;
   const nav=text('nav','', 'deep-nav');nav.setAttribute('aria-label','空欄を移動');
   const prev=button(slot>0?`← (${slot})`:'← 前はありません',()=>go(slot-1));prev.disabled=slot===0;
   const next=button(slot<count-1?`(${slot+2}) へ →`:'最後の空欄です',()=>go(slot+1));next.disabled=slot>=count-1;
   nav.append(prev,next);body.append(nav);
  }
  let revealedHere=false;
  function explanation(){
   const brief=window.UkiwaStudyQuickNotes.brief(q,lesson,slot);
   if(!revealedHere){onReveal(slot,!!brief);revealedHere=true;}
   body.replaceChildren();
   const deepPart=lesson?.deep?.slots?.[slot];
   body.append(text('p',`正答：${brief?.answer?`（${spec[slot].correct}）${brief.answer}`:'記号 '+spec[slot].correct+'（語句・式の短答は未収録）'}${spec.length===10?' ／ 単位の記号 '+spec[slot+5].correct:''}`,'quick-answer-result'));
   body.append(text('p',(brief?.completeStep?'この空欄の説明：':'理由：')+(brief?.reason||'この空欄の解説は未収録です。原本の選択肢と公式正答を照合してください。'),'quick-answer-reason'));
   if(deepPart)deepExplanation(lesson.deep,deepPart);
   if(brief?.answer&&lesson?.steps?.[slot]&&lesson.steps[slot]!==brief.reason)addDetails(deepPart?'別の説明（文章でまとめた版）':'考え方・途中式を開く',lesson.steps[slot],!deepPart);
   if(lesson?.basics?.length){const basics=text('details','');basics.append(text('summary','この問題に共通する公式・記号・基礎'));lesson.basics.forEach(b=>{const d=text('details','');d.append(text('summary',b.title),text('p',b.body));basics.append(d)});body.append(basics)}
   if(lesson?.pitfall)addDetails('この問題で間違えやすい点',lesson.pitfall);
   const link=text('a','問題の原本を確認 ↗');link.href=q.source;link.target='_blank';link.rel='noopener';body.append(link);
   if(!brief)body.append(button('この問題の公式解答を開く',()=>{close(true);onDetail(slot)}));
   slotNav();
   body.append(button('閉じて自分で解く',()=>{close(true);onPractice();}));
   body.append(button('このウィンドウで答えを隠して解く',()=>peek(slot,trigger,true)));
   body.append(text('small','読むだけでも大丈夫です。24時間以内の解き直しは「再現できた」と記録します。'));
  }
  if(practice){
   body.append(text('p','正答は隠しています。ここで解答するか、いつでも解説を開けます。'));
   const inputs=[],indices=spec.length===10?[slot,slot+5]:[slot];
   indices.forEach(i=>{const label=text('label',spec[i].label),select=document.createElement('select');select.setAttribute('aria-label',`その場で ${spec[i].label}`);select.append(new Option('選んでください',''),...spec[i].choices.map(c=>new Option(c,c)));label.append(select);body.append(label);inputs.push(select);});
   const feedback=text('p','');feedback.setAttribute('role','status');
   body.append(button('この空欄を採点',()=>{
    if(inputs.some(s=>!s.value)){feedback.textContent='解答を選んでください。';return;}
    const ok=inputs.every((s,i)=>s.value===spec[indices[i]].correct);
    const outcome=onAttempt(slot,ok,inputs.map(s=>s.value),revealedHere);
    explanation();body.prepend(text('p',(ok?'○ 正解':'× 要復習')+' · '+({unaided:'何も見ずに解けた',reproduced:'再現できた',assisted:'解説を使って解けた',retry:'解説を確認しよう'}[outcome]||''),'context-result'));
   }),button('解説を見る',explanation),feedback);
  }else explanation();
  const r=getRecord(slot);if(r.lastOutcome)head.firstChild.textContent+=` · ${{unaided:'自力正解',assisted:'解説を使って正解',reproduced:'再現できた',retry:'要復習'}[r.lastOutcome]||''}`;
  popover.querySelector('button').focus({preventScroll:true});
  const selectedContext=original.querySelector('.context-blank');
  if(selectedContext){const a=selectedContext.getBoundingClientRect(),v=original.getBoundingClientRect();original.scrollTop+=a.top-v.top-120;original.scrollLeft+=a.left-v.left-original.clientWidth/2;}
 }
 const shortcut=document.createElement('nav');shortcut.className='blank-shortcuts';shortcut.setAttribute('aria-label','問題を見ながら答えを確認');
 if(spec){const label=document.createElement('span');label.textContent='空欄を選ぶ';shortcut.append(label);spec.slice(0,5).forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`(${i+1})`;b.dataset.blank=i;b.setAttribute('aria-label',`空欄 ${i+1} の答えをその場で見る`);b.setAttribute('aria-expanded','false');b.onclick=()=>peek(i,b);shortcut.append(b)});bar.after(shortcut)}
 async function balancePage(page){
  const svg=page.querySelector('svg');if(!svg||pageFrames.has(svg))return;
  const image=svg.querySelector('image');if(!image||svg.querySelectorAll('image').length!==1)return;
  pageFrames.set(svg,null);
  try{
   const bitmap=new Image();bitmap.src=image.getAttribute('href')||image.getAttributeNS('http://www.w3.org/1999/xlink','href');await bitmap.decode();
   if(disposed||!svg.isConnected)return;
   const original=svg.viewBox.baseVal,W=original.width,H=original.height;
   // Some pages' viewBox is a few units smaller than the embedded image; measure in image units.
   const IW=Number(image.getAttribute('width')),IH=Number(image.getAttribute('height'));
   if(original.x||original.y||image.hasAttribute('transform')||!(Math.abs(IW-W)<=W*.01)||!(Math.abs(IH-H)<=H*.01))return;
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=Math.round(800*IH/IW);
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const {data}=ctx.getImageData(0,0,canvas.width,canvas.height),rows=[];
   for(let y=0;y<canvas.height;y++){let lo=800,hi=-1;for(let x=2;x<798;x++){const i=(y*800+x)*4;if(data[i+3]>200&&Math.max(data[i],data[i+1],data[i+2])<120){lo=Math.min(lo,x);hi=x}}rows.push({lo,hi});}
   let end=rows.length,groups=[];
   for(let y=0;y<rows.length;y++){if(rows[y].hi<0)continue;let start=y;while(y+1<rows.length&&rows[y+1].hi>=0)y++;groups.push([start,y+1]);}
   // Isolate only a small, detached printing footer; preserve it below the reading area.
   const merged=[];for(const group of groups){const tail=merged.at(-1);if(tail&&group[0]-tail[1]<=20)tail[1]=group[1];else merged.push([...group]);}groups=merged;
   const last=groups.at(-1),previous=groups.at(-2);
   if(last&&previous&&last[0]>rows.length*.85&&last[1]-last[0]<rows.length*.035&&last[0]-previous[1]>rows.length*.035)end=Math.floor((last[0]+previous[1])/2);
   // Width is measured above the page number and print code, which sit in the bottom 7% of booklet pages.
   const ink=rows.slice(0,Math.min(end,Math.floor(rows.length*.93))).filter(r=>r.hi>=0);if(!ink.length)return;
   const left=Math.min(...ink.map(r=>r.lo)),right=Math.max(...ink.map(r=>r.hi));
   if(right-left<360)return;
   const pad=18,x=(left-pad)*IW/800,w=(right-left+2*pad)*IW/800,cut=Math.min(H,end*IW/800);
   if(w>W*1.05)return;
   const ns='http://www.w3.org/2000/svg',body=document.createElementNS(ns,'svg');
   body.dataset.uvZoom='true';body.setAttribute('viewBox',`${x} 0 ${w} ${cut}`);body.setAttribute('width',w);body.setAttribute('height',cut);body.style.setProperty('width',w+'px','important');body.style.setProperty('height',cut+'px','important');body.append(image.cloneNode(true));
   let height=cut;
   svg.replaceChildren(body);
   if(end<rows.length){const footer=document.createElementNS(ns,'svg'),fh=(H-cut)*w/W;footer.dataset.uvZoom='true';footer.setAttribute('viewBox',`0 ${cut} ${W} ${H-cut}`);footer.setAttribute('y',cut);footer.setAttribute('width',w);footer.setAttribute('height',fh);footer.style.setProperty('width',w+'px','important');footer.style.setProperty('height',fh+'px','important');footer.append(image.cloneNode(true));svg.append(footer);height+=fh;}
   svg.setAttribute('viewBox',`0 0 ${w} ${height}`);svg.setAttribute('width',w);svg.setAttribute('height',height);
   pageFrames.set(svg,{x,w,h:height,W,H});refresh();
  }catch{/* Keep the original page if analysis or image decoding fails. */}
 }
 function refresh(){
  if(disposed)return;resize(false);
  shortcut.querySelectorAll('button').forEach(b=>b.disabled=!paper.querySelector('.paper-page'));
  for(const page of paper.querySelectorAll('.paper-page')){
  balancePage(page);const frame=pageFrames.get(page.querySelector('svg'));
  page.querySelectorAll('.blank-marker-layer,.blank-hotspot').forEach(el=>el.remove());
  const svg=page.querySelector('svg'),box=svg?.viewBox.baseVal;if(!box?.width||!box?.height)continue;
  const layer=document.createElement('div');layer.className='blank-marker-layer';layer.style.aspectRatio=`${box.width} / ${box.height}`;page.append(layer);
  const index=Number(page.dataset.page??paper.dataset.page);shortcut.hidden=false;
  if(spec)spots.filter(s=>s.page===index&&s.slot<5).forEach(s=>{const b=document.createElement('button');b.type='button';b.className='blank-hotspot';b.dataset.blank=s.slot;b.textContent=`(${s.slot+1})`;b.style.left=(frame?(s.x/100*frame.W-frame.x)/frame.w*100:s.x)+'%';b.style.top=(frame?s.y*frame.H/frame.h:s.y)+'%';b.style.setProperty('--spot-width',(frame?s.w*frame.W/frame.w:s.w)+'%');b.style.setProperty('--spot-height',(frame?s.h*frame.H/frame.h:s.h)+'%');b.setAttribute('aria-label',`本文の空欄 ${s.slot+1} の答えを見る`);b.setAttribute('aria-expanded','false');b.onclick=()=>peek(s.slot,b);layer.append(b)});
  }
  highlight();
 }
 loadHotspots().then(all=>{if(!disposed){spots=all[q.id]||[];refresh()}});
 const observer=new ResizeObserver(()=>resize());observer.observe(paper);
 paper.addEventListener('dragstart',e=>e.preventDefault(),{signal:signal.signal});
 paper.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,select'))return;drag={x:e.clientX,y:e.clientY,left:paper.scrollLeft,top:paper.scrollTop};paper.setPointerCapture(e.pointerId);paper.classList.add('panning')},{signal:signal.signal});
 paper.addEventListener('pointermove',e=>{if(!drag)return;paper.scrollLeft=drag.left-(e.clientX-drag.x);paper.scrollTop=drag.top-(e.clientY-drag.y)},{signal:signal.signal});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])paper.addEventListener(event,()=>{drag=null;paper.classList.remove('panning')},{signal:signal.signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popover){e.preventDefault();close(true)}},{signal:signal.signal});


 refresh();return {refresh,close,destroy(){disposed=true;close();observer.disconnect();signal.abort();bar.remove();shortcut.remove()}};
}};
})();
