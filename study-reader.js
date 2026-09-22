/* Local reading controls. Touch scrolling and browser pinch zoom remain native. */
(()=>{'use strict';
const storageKey='ukiwa-study-reader-v1';
let preferences={zoom:'width',text:18,paper:'warm'};
try{Object.assign(preferences,JSON.parse(localStorage.getItem(storageKey)||'{}'))}catch{}
let hotspotRequest;
const loadHotspots=()=>hotspotRequest||(hotspotRequest=fetch('denken-assets/blank-hotspots.json?v=2').then(r=>{if(!r.ok)throw Error('hotspots');return r.json()}).catch(()=>({})));
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(preferences))}catch{}};
window.UkiwaStudyReader={setup({paper,pane,q,spec,lesson,onReveal,onDetail}){
 let disposed=false,spots=[],popover=null,anchor=null,drag=null;
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
  shortcut.hidden=zoom.value!=='fit'&&spots.some(s=>s.page===Number(paper.dataset.page));
  const old=reader.getBoundingClientRect().width||1;
  const cx=(paper.scrollLeft+paper.clientWidth/2)/old,cy=(paper.scrollTop+paper.clientHeight/2)/old;
  const base=Math.max(740,paper.clientWidth-2);
  const width=zoom.value==='fit'?Math.min(paper.clientWidth-2,(paper.clientHeight-2)*box.width/box.height):base*(parseFloat(zoom.value)||100)/100;
  reader.style.marginInline='auto';paper.style.setProperty('--reader-width',Math.max(1,width)+'px');paper.dataset.zoom=zoom.value;
  if(preserve){paper.scrollLeft=cx*width-paper.clientWidth/2;paper.scrollTop=cy*width-paper.clientHeight/2}
  bar.querySelector('[data-size="down"]').disabled=zoom.value==='fit';bar.querySelector('[data-size="up"]').disabled=zoom.value==='250%';
 }
 zoom.onchange=()=>{preferences.zoom=zoom.value;save();resize()};
 bar.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{const i=levels.indexOf(zoom.value);zoom.value=levels[Math.max(0,Math.min(levels.length-1,i+(b.dataset.size==='up'?1:-1)))];zoom.onchange()});
 function close(restore=false){popover?.remove();popover=null;if(anchor){anchor.setAttribute('aria-expanded','false');if(restore&&anchor.isConnected)anchor.focus({preventScroll:true})}anchor=null;}
 function peek(slot,button){
  if(popover&&anchor===button){close();return}close();anchor=button;button.setAttribute('aria-expanded','true');onReveal();
  popover=document.createElement('section');popover.className='quick-answer';popover.setAttribute('role','dialog');popover.setAttribute('aria-label',`空欄 ${slot+1} の答えと解説`);popover.tabIndex=-1;popover.style.fontSize=preferences.text+'px';
  const head=document.createElement('div');head.className='quick-answer-head';
  const title=document.createElement('strong');title.textContent=`(${slot+1}) 正答 ${spec[slot].correct}${spec.length===10?' ／ 単位 '+spec[slot+5].correct:''}`;
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='閉じる ×';dismiss.onclick=()=>close(true);head.append(title,dismiss);popover.append(head);
  const body=document.createElement('div');body.className='quick-answer-body';
  const brief=window.UkiwaStudyQuickNotes.brief(q,lesson,slot);
  if(brief?.answer){const result=document.createElement('p');result.className='quick-answer-result';result.textContent=brief.answer;body.append(result)}
  const description=document.createElement('p');description.className='quick-answer-reason';description.textContent=brief?.reason||'詳しい解説は未収録です。正答記号は公式正答表で確認できます。';body.append(description);popover.append(body);
  if(lesson?.steps?.[slot]){const detail=document.createElement('button');detail.type='button';detail.className='quick-detail';detail.textContent=lesson.depth==='quick'?'解説パネルで読む':'途中式・理由を詳しく';detail.onclick=()=>{close();onDetail(slot)};popover.append(detail)}
  const note=document.createElement('small');note.textContent='答えを見た回として記録します。';popover.append(note);document.body.append(popover);
  const rect=button.getBoundingClientRect(),w=Math.min(440,window.innerWidth-24);
  popover.style.width=w+'px';popover.style.left=Math.max(12,Math.min(window.innerWidth-w-12,rect.left))+'px';
  const height=popover.getBoundingClientRect().height;
  popover.style.top=Math.max(12,Math.min(window.innerHeight-height-12,rect.bottom+8))+'px';
 }
 const shortcut=document.createElement('nav');shortcut.className='blank-shortcuts';shortcut.setAttribute('aria-label','問題を見ながら答えを確認');
 if(spec){const label=document.createElement('span');label.textContent='タップで答え';shortcut.append(label);spec.slice(0,5).forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.textContent=`(${i+1})`;b.setAttribute('aria-label',`空欄 ${i+1} の答えをその場で見る`);b.setAttribute('aria-expanded','false');b.onclick=()=>peek(i,b);shortcut.append(b)});bar.after(shortcut)}
 async function balancePage(page){
  const svg=page.querySelector('svg');if(!svg||pageFrames.has(svg))return;
  const image=svg.querySelector('image');if(!image||svg.querySelectorAll('image').length!==1)return;
  pageFrames.set(svg,null);
  try{
   const bitmap=new Image();bitmap.src=image.getAttribute('href')||image.getAttributeNS('http://www.w3.org/1999/xlink','href');await bitmap.decode();
   if(disposed||!svg.isConnected)return;
   const original=svg.viewBox.baseVal,W=original.width,H=original.height;
   if(original.x||original.y||image.hasAttribute('transform')||Number(image.getAttribute('width'))!==W||Math.abs(Number(image.getAttribute('height'))-H)>1)return;
   const canvas=document.createElement('canvas');canvas.width=800;canvas.height=Math.round(800*H/W);
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const {data}=ctx.getImageData(0,0,canvas.width,canvas.height),rows=[];
   for(let y=0;y<canvas.height;y++){let lo=800,hi=-1;for(let x=2;x<798;x++){const i=(y*800+x)*4;if(data[i+3]>200&&Math.max(data[i],data[i+1],data[i+2])<120){lo=Math.min(lo,x);hi=x}}rows.push({lo,hi});}
   let end=rows.length,groups=[];
   for(let y=0;y<rows.length;y++){if(rows[y].hi<0)continue;let start=y;while(y+1<rows.length&&rows[y+1].hi>=0)y++;groups.push([start,y+1]);}
   // Isolate only a small, detached printing footer; preserve it below the reading area.
   const merged=[];for(const group of groups){const tail=merged.at(-1);if(tail&&group[0]-tail[1]<=20)tail[1]=group[1];else merged.push([...group]);}groups=merged;
   const last=groups.at(-1),previous=groups.at(-2);
   if(last&&previous&&last[0]>rows.length*.85&&last[1]-last[0]<rows.length*.035&&last[0]-previous[1]>rows.length*.035)end=Math.floor((last[0]+previous[1])/2);
   const ink=rows.slice(0,end).filter(r=>r.hi>=0);if(!ink.length)return;
   const left=Math.min(...ink.map(r=>r.lo)),right=Math.max(...ink.map(r=>r.hi));
   if(right-left<360)return;
   const pad=18,x=(left-pad)*W/800,w=(right-left+2*pad)*W/800,cut=end*W/800;
   if(w>W*1.05)return;
   const ns='http://www.w3.org/2000/svg',body=document.createElementNS(ns,'svg');
   body.setAttribute('viewBox',`${x} 0 ${w} ${cut}`);body.setAttribute('width',w);body.setAttribute('height',cut);body.style.setProperty('width',w+'px','important');body.style.setProperty('height',cut+'px','important');body.append(image.cloneNode(true));
   let height=cut;
   svg.replaceChildren(body);
   if(end<rows.length){const footer=document.createElementNS(ns,'svg'),fh=(H-cut)*w/W;footer.setAttribute('viewBox',`0 ${cut} ${W} ${H-cut}`);footer.setAttribute('y',cut);footer.setAttribute('width',w);footer.setAttribute('height',fh);footer.style.setProperty('width',w+'px','important');footer.style.setProperty('height',fh+'px','important');footer.append(image.cloneNode(true));svg.append(footer);height+=fh;}
   svg.setAttribute('viewBox',`0 0 ${w} ${height}`);svg.setAttribute('width',w);svg.setAttribute('height',height);
   pageFrames.set(svg,{x,w,h:height,W,H});refresh();
  }catch{/* Keep the original page if analysis or image decoding fails. */}
 }
 function refresh(){
  if(disposed)return;close();resize(false);
  const page=paper.querySelector('.paper-page');if(!page)return;
  balancePage(page);const frame=pageFrames.get(page.querySelector('svg'));
  page.querySelectorAll('.blank-hotspot').forEach(el=>el.remove());
  const index=Number(paper.dataset.page);shortcut.hidden=zoom.value!=='fit'&&spots.some(s=>s.page===index);
  if(spec)spots.filter(s=>s.page===index&&s.slot<5).forEach(s=>{const b=document.createElement('button');b.type='button';b.className='blank-hotspot';b.textContent=`(${s.slot+1})`;b.style.left=(frame?(s.x/100*frame.W-frame.x)/frame.w*100:s.x)+'%';b.style.top=(frame?s.y*frame.H/frame.h:s.y)+'%';b.style.setProperty('--spot-width',(frame?s.w*frame.W/frame.w:s.w)+'%');b.setAttribute('aria-label',`本文の空欄 ${s.slot+1} の答えを見る`);b.setAttribute('aria-expanded','false');b.onclick=()=>peek(s.slot,b);page.append(b)});
 }
 loadHotspots().then(all=>{if(!disposed){spots=all[q.id]||[];refresh()}});
 const observer=new ResizeObserver(()=>resize());observer.observe(paper);
 paper.addEventListener('dragstart',e=>e.preventDefault(),{signal:signal.signal});
 paper.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,select'))return;drag={x:e.clientX,y:e.clientY,left:paper.scrollLeft,top:paper.scrollTop};paper.setPointerCapture(e.pointerId);paper.classList.add('panning')},{signal:signal.signal});
 paper.addEventListener('pointermove',e=>{if(!drag)return;paper.scrollLeft=drag.left-(e.clientX-drag.x);paper.scrollTop=drag.top-(e.clientY-drag.y)},{signal:signal.signal});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])paper.addEventListener(event,()=>{drag=null;paper.classList.remove('panning')},{signal:signal.signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popover){e.preventDefault();close(true)}},{signal:signal.signal});
 document.addEventListener('pointerdown',e=>{if(popover&&!popover.contains(e.target)&&!e.target.closest('.blank-hotspot,.blank-shortcuts'))close()},{signal:signal.signal});
 window.addEventListener('resize',()=>close(),{signal:signal.signal});
 refresh();return {refresh,close,destroy(){disposed=true;close();observer.disconnect();signal.abort();bar.remove();shortcut.remove()}};
}};
})();