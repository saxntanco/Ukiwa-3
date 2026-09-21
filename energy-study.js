import * as pdfjs from './vendor/pdfjs/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;
const $=id=>document.getElementById(id), KEY='ukiwa-energy-progress-v1';
let index, pdf, current, filtered=[], qpos=0, apos=0, mode='learn', revealed=true, attempted=false, token=0, db, importing=false;
let records={},last='';
try {const d=JSON.parse(localStorage.getItem(KEY)||'{}');records=d.records||{};last=d.last||'';} catch { $('notice').textContent='保存記録を読み込めませんでした。新しい記録で開始します。'; }
const notice=t=>$('notice').textContent=t;
const rec=()=>records[current.id]||(records[current.id]={});
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,records,last:current?.id||last}));}catch{notice('記録を保存できません。記録の書き出しを利用してください。');}stats();}
function stats(){if(!index)return;const known=index.items.map(x=>records[x.id]||{}),read=known.filter(x=>x.read).length,correct=known.filter(x=>x.correct).length,retry=known.filter(x=>x.retry).length;$('stats').textContent=`全144問 ／ 読了 ${read} ／ 自力で解けた ${correct} ／ 要復習 ${retry}`;$('progress').value=correct;}
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('ukiwa-energy-library',1);r.onupgradeneeded=()=>r.result.createObjectStore('books');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function getBook(){return new Promise((resolve,reject)=>{const r=db.transaction('books').objectStore('books').get('thermal');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function putBook(blob){return new Promise((resolve,reject)=>{const t=db.transaction('books','readwrite');t.objectStore('books').put(blob,'thermal');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
async function loadPDF(blob,save=false){
 if(importing)return;importing=true;$('file').disabled=true;$('load-state').textContent='教材を確認しています…';
 try{
  if(blob.size!==index.book.size)throw Error('対応する520ページの2026年版PDFとファイルサイズが異なります。Driveの「エネルギー管理士 熱分野 2026 完成版.pdf」を選んでください。');
  const bytes=await blob.arrayBuffer();
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!==index.book.sha256)throw Error('このPDFは対応教材と一致しません。別の版では問題の位置が変わるため、読み込みを中止しました。');
  const loaded=await pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false}).promise;
  if(loaded.numPages!==520){await loaded.destroy();throw Error('ページ数が対応教材と異なります。');}
  const old=pdf;pdf=loaded;token++;if(old)await old.destroy();
  let saved=!save;
  if(save){try{db=db||await openDB();await putBook(blob);saved=true;navigator.storage?.persist?.().catch(()=>{});}catch{notice('教材は表示できますが、端末に保存できませんでした。次回は再選択してください。');}}
  $('load-state').textContent=saved?'教材を保存しました。次回は自動で開きます。':'この回だけ教材を開いています。';
  $('library').hidden=true;document.body.classList.add('ready');applyFilters(last);
 }catch(e){$('load-state').textContent=e.message;$('library').hidden=false;}
 finally{importing=false;$('file').disabled=false;$('file').value='';}
}
function matches(x){const r=records[x.id]||{};return (! $('year').value||x.year===+$('year').value)&&(!$('subject').value||x.subject===+$('subject').value)&&({all:true,new:!r.read&&!r.attempted,read:r.read&&!r.attempted,retry:r.retry,saved:r.saved}[$('filter').value]);}
function applyFilters(wanted){
 filtered=index.items.filter(matches);$('question').replaceChildren(...filtered.map(x=>new Option(`${$('year').value?'':x.year+'年度 · '}問${x.number} ${x.title}${x.optional?'［選択］':''}`,x.id)));
 $('empty').hidden=filtered.length>0;$('workspace').hidden=!pdf||!filtered.length;
 if(!filtered.length){token++;current=null;return;}
 const next=filtered.find(x=>x.id===wanted)||filtered[0];$('question').value=next.id;selectQuestion(next);
}
function selectQuestion(x){
 current=x;last=x.id;qpos=0;apos=0;revealed=mode==='learn';attempted=false;token++;
 $('lesson-meta').textContent=`${x.year}年度 / 課目${['','Ⅰ','Ⅱ','Ⅲ','Ⅳ'][x.subject]}${x.optional?' / 選択問題':''}`;
 $('lesson-title').textContent=`問${x.number}　${x.title}`;$('draft').value=rec().draft||'';
 $('bookmark').setAttribute('aria-pressed',!!rec().saved);$('bookmark').textContent=rec().saved?'★ あとで解く':'☆ あとで解く';
 const n=filtered.findIndex(y=>y.id===x.id);$('prev').disabled=n===0;$('next').disabled=n===filtered.length-1;
 $('evaluation').textContent=rec().retry?'この問題は要復習です。':rec().correct?'以前、自力で解けた問題です。':rec().read?'解説を読んだ記録があります。':'';
 help(x);persist();render();
}
async function paint(side,serial){
 const seg=current[side==='q'?'question':'answer'][side==='q'?qpos:apos],view=$(side+'view');
 view.replaceChildren();const page=await pdf.getPage(seg.page);if(serial!==token)return;
 const z=+$('zoom').value,base=page.getViewport({scale:1}),r=seg.rect;
 const targetWidth=Math.max(240,view.clientWidth-42)*z;
 const scale=targetWidth/(base.width*(r[2]-r[0]));
 const dpr=Math.min(devicePixelRatio||1,2),vp=page.getViewport({scale:scale*dpr});
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width*(r[2]-r[0]));canvas.height=Math.ceil(vp.height*(r[3]-r[1]));
 canvas.style.width=targetWidth+'px';canvas.style.height=canvas.height/dpr+'px';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${current.year}年度 問${current.number} ${side==='q'?'問題':'解答と解説'} 原本${seg.page}ページの該当部分`);
 await page.render({canvasContext:canvas.getContext('2d'),viewport:vp,transform:[1,0,0,1,-vp.width*r[0],-vp.height*r[1]]}).promise;
 if(serial!==token)return;view.replaceChildren(canvas);view.scrollTop=0;view.scrollLeft=0;
}
function render(){
 if(!pdf||!current)return;const serial=++token;
 for(const [s,list,pos] of [['q',current.question,qpos],['a',current.answer,apos]]){$(s+'page').textContent=`${pos+1} / ${list.length}`;$(s+'prev').disabled=pos===0;$(s+'next').disabled=pos===list.length-1;}
 $('aview').hidden=!revealed;$('answer-cover').hidden=revealed;
 $('aprev').disabled=!revealed||apos===0;$('anext').disabled=!revealed||apos===current.answer.length-1;
 $('read').disabled=!revealed;$('correct').disabled=!(mode==='practice'&&attempted&&revealed);
 $('correct').title=$('correct').disabled?'解説を隠して解答を記入し、答え合わせしてから記録できます。':'';
 Promise.all([paint('q',serial),revealed?paint('a',serial):Promise.resolve()]).catch(e=>{if(serial===token)notice('ページを表示できませんでした。教材を開き直してください。'+e.message);});
}
function setMode(m){mode=m;revealed=m==='learn';attempted=false;for(const id of ['learn','practice'])$(id).setAttribute('aria-pressed',id===m);if(m==='practice'){$('draft').value='';if(current){rec().draft='';persist();}}render();}
function help(x){
 const guides={1:['法規・総合管理','まず「誰が・何を・どの条件で」を分けて読みます。数字と単位をセットで確認し、法律の名称と対象年度を確かめます。','エネルギー量は電力や燃料の量そのものとは異なります。換算係数の単位が打ち消し合うかを書いて確かめましょう。'],2:['熱・流体の基礎','系の境界と、出入りする熱・仕事・質量を図に描きます。与えられた条件から、使える式を一つずつ選びます。','絶対温度 T[K]＝t[℃]＋273.15。温度差の1 Kと1 ℃は同じ大きさですが、温度の比に℃をそのまま使いません。'],3:['燃料・燃焼','何を1 molまたは1 kgの基準にするかを先に決めます。反応式をそろえ、理論量と実際の供給量を分けて計算します。','空気比は、実際の供給空気量を理論空気量で割った比です。湿り・乾きのガス量、質量・体積の基準を混ぜないようにします。'],4:['熱利用設備','機器の入口と出口を図に書き、質量収支とエネルギー収支を別々に立てます。求めるものが量なのか、単位時間あたりの量なのかを確認します。','1 W＝1 J/s。kWとkWhは別の量です。効率では、有効に得た量と投入した量が同じ単位になっているか確認します。']};
 const g=guides[x.subject];$('learning-help').replaceChildren();for(const [h,t] of [[g[0]+'の読み方',g[1]],['基礎の確認',g[2]],['解説を読むとき','①何を求めるか ②与えられた条件 ③式を選ぶ理由 ④単位をそろえて代入 ⑤結果の意味、の順で追ってください。分からない行は自分の解答欄にメモしておくと、次回の復習に使えます。']]){const heading=document.createElement('h4'),p=document.createElement('p');heading.textContent=h;p.textContent=t;$('learning-help').append(heading,p);}
}
for(const id of ['year','subject','filter'])$(id).addEventListener('change',()=>applyFilters(current?.id));
$('question').onchange=()=>selectQuestion(filtered.find(x=>x.id===$('question').value));
for(const [id,delta] of [['prev',-1],['next',1]])$(id).onclick=()=>{const x=filtered[filtered.findIndex(x=>x.id===current.id)+delta];if(x){$('question').value=x.id;selectQuestion(x);}};
for(const [id,s,d] of [['qprev','q',-1],['qnext','q',1],['aprev','a',-1],['anext','a',1]])$(id).onclick=()=>{if(s==='q')qpos+=d;else apos+=d;render();};
$('learn').onclick=()=>setMode('learn');$('practice').onclick=()=>setMode('practice');$('zoom').onchange=render;
$('draft').oninput=()=>{if(current){rec().draft=$('draft').value;persist();}};
$('reveal').onclick=()=>{attempted=!!$('draft').value.trim();revealed=true;if(attempted){rec().attempted=true;rec().lastAttempt=new Date().toISOString();persist();}$('evaluation').textContent=attempted?'原本と照合して、下のボタンで自己評価してください。':'解説を読んでから、もう一度挑戦できます。';render();};
$('bookmark').onclick=()=>{rec().saved=!rec().saved;$('bookmark').setAttribute('aria-pressed',!!rec().saved);$('bookmark').textContent=rec().saved?'★ あとで解く':'☆ あとで解く';persist();};
$('read').onclick=()=>{rec().read=true;persist();$('evaluation').textContent='読了を記録しました。次は「自力で解く」で確かめましょう。';};
$('correct').onclick=()=>{if(!(mode==='practice'&&attempted&&revealed))return;Object.assign(rec(),{correct:true,retry:false,read:true,attempted:true});persist();$('evaluation').textContent='自力で解けた記録を保存しました。';};
$('retry').onclick=()=>{rec().retry=true;rec().correct=false;persist();$('evaluation').textContent='要復習に登録しました。絞り込みでまとめて開けます。';};
$('resume').onclick=()=>{const x=index.items.find(x=>x.id===last);if(x){$('year').value=x.year;$('subject').value='';$('filter').value='all';applyFilters(x.id);}};
$('settings').onclick=()=>{$('storage').open=!$('storage').open;$('settings').setAttribute('aria-expanded',$('storage').open);};
$('change-book').onclick=()=>{$('library').hidden=false;$('library').scrollIntoView({behavior:'smooth'});};
$('file').onchange=()=>{if($('file').files[0])loadPDF($('file').files[0],true);};
$('remove-book').onclick=async()=>{if(!confirm('このブラウザーに保存した教材PDFを削除しますか？学習記録は残ります。'))return;try{if(db){await new Promise((res,rej)=>{const t=db.transaction('books','readwrite');t.objectStore('books').delete('thermal');t.oncomplete=res;t.onerror=()=>rej(t.error);});}token++;if(pdf)await pdf.destroy();pdf=null;$('workspace').hidden=true;$('library').hidden=false;$('load-state').textContent='保存教材を削除しました。記録は残っています。';}catch{notice('教材の削除に失敗しました。');}};
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,book:index.book.id,records,last},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ukiwa-energy-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async()=>{try{const f=$('import').files[0];if(!f)return;if(f.size>5e6)throw Error('記録ファイルが大きすぎます。');const d=JSON.parse(await f.text());if(d.version!==1||d.book!==index.book.id||!d.records||typeof d.records!=='object')throw Error('この学習室の記録ファイルではありません。');for(const x of index.items){const r=d.records[x.id];if(r&&typeof r==='object'){const clean={};for(const k of ['read','correct','retry','saved','attempted'])clean[k]=r[k]===true;clean.draft=typeof r.draft==='string'?r.draft.slice(0,50000):'';records[x.id]=clean;}}last=index.items.some(x=>x.id===d.last)?d.last:last;persist();applyFilters(current?.id);notice('記録を読み込みました。');}catch(e){notice(e.message);}finally{$('import').value='';}};
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,200);});
try{
 const response=await fetch('./energy-study-index.json');if(!response.ok)throw Error('索引を読み込めません。');index=await response.json();
 $('year').replaceChildren(new Option('全年度',''),...[2025,2024,2023,2022,2021,2020,2019,2018].map(y=>new Option(y+'年度',y)));$('year').value='2025';
 const previous=index.items.find(x=>x.id===last);if(previous)$('year').value=previous.year;
 stats();applyFilters(last);$('load-state').textContent='教材を選ぶと、144問すべてを問題別に学習できます。';
 try{db=await openDB();const book=await getBook();if(book)await loadPDF(book);}catch{notice('ブラウザーの教材保存機能を利用できません。PDFを選択して、この回だけ学習できます。');}
}catch(e){$('load-state').textContent='学習室の準備に失敗しました。再読み込みしてください。'+e.message;}
