(()=>{'use strict';
const data=window.UkiwaVisualData;
const file=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
const el=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
let viewer,canvas,caption,title,scale=1;
function openImage(original,label){
 if(!viewer){
  viewer=el('dialog','uv-viewer');viewer.setAttribute('aria-label','図と写真の拡大表示');
  const toolbar=el('div','uv-toolbar');title=el('span','uv-title');toolbar.append(title);
  const action=(name,fn)=>{const b=el('button','',name);b.type='button';b.addEventListener('click',fn);toolbar.append(b);};
  action('縮小',()=>resize(-.25));action('拡大',()=>resize(.25));action('全体表示',()=>{scale=1;resize(0);});action('閉じる',()=>viewer.close());
  const scroll=el('div','uv-scroll');canvas=el('div','uv-canvas');scroll.append(canvas);caption=el('p','uv-caption');
  viewer.append(toolbar,scroll,caption);document.body.append(viewer);
  viewer.addEventListener('click',e=>{if(e.target===viewer){const r=viewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)viewer.close();}});
 }
 scale=1;canvas.replaceChildren();title.textContent=label||'図・写真を大きく見る';
 const clone=original.cloneNode(true);
 if(clone.tagName.toLowerCase()==='svg'){
  // Preserve computed diagram styling without copying scripts or interactive controls.
  const from=[original,...original.querySelectorAll('*')],to=[clone,...clone.querySelectorAll('*')];
  const props=['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','stroke-linejoin','font-family','font-size','font-weight','text-anchor','dominant-baseline','opacity'];
  from.forEach((n,i)=>{const cs=getComputedStyle(n);props.forEach(p=>to[i].style.setProperty(p,cs.getPropertyValue(p)));});
  clone.querySelectorAll('script,foreignObject').forEach(n=>n.remove());
 }
 // Give SVG definitions unique IDs while retaining marker/clip references.
 const ids=new Map();[clone,...clone.querySelectorAll('[id]')].forEach((n,i)=>{if(n.id){ids.set(n.id,`uv-copy-${i}`);n.id=`uv-copy-${i}`;}});
 [clone,...clone.querySelectorAll('*')].forEach(n=>{for(const a of [...n.attributes]){let value=a.value;ids.forEach((next,old)=>{value=value.split(`url(#${old})`).join(`url(#${next})`);if(value===`#${old}`)value=`#${next}`;});if(value!==a.value)n.setAttribute(a.name,value);}});
 clone.removeAttribute('width');clone.removeAttribute('height');clone.style.maxWidth='none';clone.style.width='100%';clone.style.height='auto';
 canvas.append(clone);caption.textContent='拡大すると上下左右へスクロールできます。元の画像にない細部は増えません。';
 resize(0);viewer.showModal();viewer.querySelector('.uv-scroll').scrollTo(0,0);
}
function resize(delta){scale=Math.min(4,Math.max(1,scale+delta));canvas.style.width=`${scale*100}%`;}
function attachZoom(n,label){
 if(n.dataset.uvZoom||n.closest('.uv-viewer,a,button,[role="button"],.uv-guide,.atlas-modal,.reader-paper'))return;
 if(n.tagName.toLowerCase()==='img'&&(!n.alt||/icon|logo|アイコン|ロゴ|うきわちゃん/i.test(n.alt)))return;
 const r=n.getBoundingClientRect();if(r.width<180||r.height<90)return;
 if(n.tagName.toLowerCase()==='svg'&&!n.hasAttribute('viewBox'))return;
 n.dataset.uvZoom='true';const b=el('button','uv-zoom-button','図・写真を拡大');b.type='button';
 b.addEventListener('click',()=>openImage(n,label||n.getAttribute('aria-label')||n.alt||'図を拡大'));
 n.insertAdjacentElement('afterend',b);
}
function installGuide(){
 const scene=data?.scenes[data.pages[file]];if(!scene)return;
 const main=document.querySelector('main')||document.querySelector('.wrap,.container,.app');if(!main)return;
 const panel=el('details','uv-guide');panel.id='visual-overview';
 panel.open=['vcb-inspection-guide.html','instrument-calibration-guide.html','field-essentials.html','relay-basics.html'].includes(file);
 const summary=el('summary','',`図でつかむ：${scene.title}`);summary.append(el('small','','全体 → 注目箇所 → 本文の説明。番号を選んで見比べる'));
 const body=el('div','uv-body'),layout=el('div','uv-layout'),figure=el('figure','uv-art');
 const art=el('div');art.innerHTML=`<svg class="uv-guide-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 430" role="img" aria-label="${scene.title}">${scene.art}</svg>`;
 const cap=el('figcaption','','形と役割を学ぶオリジナル模式図。実物写真・端子結線図ではありません。');
 const zoom=el('button','','図を大きく見る');zoom.type='button';zoom.addEventListener('click',()=>openImage(art.firstElementChild,scene.title));
 figure.append(art,zoom,cap);
 if(scene.photo){
  const ph=scene.photo,details=el('details','uv-photo'),head=el('summary','',`実物写真も見る：${ph.name}`),img=el('img');img.src=ph.url;img.alt=ph.name;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';
  const description=el('p','uv-note',ph.description),credit=el('p','uv-note'),source=el('a','',ph.credit),license=el('a','',ph.license);source.href=ph.source;license.href=ph.licenseUrl;[source,license].forEach(a=>{a.target='_blank';a.rel='noopener';});credit.append(source,' / ',license,' / 画像の改変なし');
  const photoZoom=el('button','','写真を大きく見る');photoZoom.type='button';photoZoom.addEventListener('click',()=>openImage(img,`${ph.name} — ${ph.credit} / ${ph.license}`));
  img.addEventListener('error',()=>{img.hidden=true;photoZoom.hidden=true;description.textContent='写真を読み込めませんでした。下の出典リンクから実物写真を確認できます。';});
  details.append(head,img,photoZoom,description,credit);figure.append(details);
 }
 const notes=el('div'),tabs=el('div','uv-tabs'),explain=el('div','uv-explain');explain.setAttribute('aria-live','polite');
 const select=i=>{tabs.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));art.querySelectorAll('[data-part]').forEach(g=>{g.classList.toggle('uv-selected',Number(g.dataset.part)===i+1);g.style.opacity=Number(g.dataset.part)===i+1?'1':'.55';});explain.replaceChildren(el('h3','',`${i+1}. ${scene.steps[i][0]}`),el('p','',scene.steps[i][1]));};
 scene.steps.forEach((step,i)=>{const b=el('button','',`${i+1} ${step[0]}`);b.type='button';b.addEventListener('click',()=>select(i));tabs.append(b);});
 notes.append(tabs,explain);
 if(scene.source){const p=el('p','uv-links'),a=el('a','',scene.source[0]);a.href=scene.source[1];a.target='_blank';a.rel='noopener';p.append(a);notes.append(p);}
 if(scene.related){const p=el('p','uv-links'),a=el('a','',scene.related[1]);a.href=scene.related[0];p.append(a);notes.append(p);}
 layout.append(figure,notes);body.append(layout);panel.append(summary,body);
 const hero=main.querySelector('.hero,.intro');
 if(hero&&hero.parentElement===main)hero.after(panel);else{const h1=main.querySelector('h1');if(h1){let anchor=h1;while(anchor.parentElement!==main&&anchor.parentElement)anchor=anchor.parentElement;anchor.after(panel);}else main.prepend(panel);}
 select(0);
}
function scan(){document.querySelectorAll('main img,main svg,article img,article svg,.diagram img,.diagram svg').forEach(n=>attachZoom(n));}
function boot(){installGuide();scan();let pending=false;const observer=new MutationObserver(records=>{if(!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches('.uv-zoom-button,.uv-viewer')&&!n.closest('.uv-viewer,.uv-guide'))))return;if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;scan();});}});observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('load',scan,{once:true});document.addEventListener('toggle',e=>{if(e.target.tagName==='DETAILS'&&e.target.open)scan();},true);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
