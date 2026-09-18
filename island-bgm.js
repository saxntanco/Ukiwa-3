/* Kevin MacLeod recordings, CC BY 4.0. See the visible music credits. */
(()=>{
if(window.parent!==window && window.parent.ukiwaMusicHost)return;
window.ukiwaMusicHost=true;
const button=document.getElementById('bgmToggle');if(!button)return;
const tracks={light:{title:'Luminous Rain',file:'Luminous Rain.mp3',id:'USUAN1100169'},sunset:{title:'Dream Culture',file:'Dream Culture.mp3',id:'USUAN1300046'},dark:{title:'Evening Fall (Piano)',file:'Evening Fall - Piano.mp3',id:'USUAN1100235'}};
const audio=new Audio();audio.id='islandAudio';audio.hidden=true;document.body.append(audio);audio.preload='none';audio.loop=true;audio.volume=.3;
let wanted=false,request=0,loaded='';
const credit=document.createElement('details');credit.id='islandMusicCredits';credit.style.cssText='max-width:1100px;margin:8px auto;padding:0 16px;font-size:12px;color:var(--text);position:relative;z-index:2';
credit.innerHTML='<summary style="cursor:pointer">♫ BGM・音量・クレジット</summary><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:6px"><p id="islandTrackName" aria-live="polite"></p><label>音量 <input id="islandVolume" type="range" min="0" max="100" value="30" aria-label="BGMの音量"></label><p>Music by <a href="https://incompetech.com/" target="_blank" rel="noopener">Kevin MacLeod (incompetech.com)</a><br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">Creative Commons Attribution 4.0</a> — 音源の編集なし。再生時に音量調整・繰り返し再生。音声は再生ボタンを押したときに配信元から読み込みます。</p><ul>'+Object.entries(tracks).map(([key,t])=>'<li>'+({light:'昼の島',sunset:'夕焼け',dark:'月夜'})[key]+'：<a href="https://incompetech.com/music/royalty-free/index.html?isrc='+t.id+'" target="_blank" rel="noopener">'+t.title+'</a></li>').join('')+'</ul></div>';
document.querySelector('header').after(credit);
const label=credit.querySelector('#islandTrackName');credit.querySelector('#islandVolume').addEventListener('input',e=>{audio.volume=Number(e.target.value)/100});
function current(){return tracks[document.documentElement.dataset.theme]||tracks.light}
function display(state){const t=current();button.setAttribute('aria-pressed',String(wanted));button.setAttribute('aria-label',wanted?'島のBGMを停止':'島のBGMを再生');button.innerHTML=(wanted?'⏸':'♫')+' <span>BGM</span>';button.title=t.title;label.textContent=state+'：'+t.title+' — Kevin MacLeod'}
function stop(){wanted=false;request++;audio.pause();display('停止中')}
async function play(){const token=++request,t=current();wanted=true;display('読み込み中');if(loaded!==t.file){audio.src='https://incompetech.com/music/royalty-free/mp3-royaltyfree/'+encodeURIComponent(t.file);loaded=t.file}try{await audio.play();if(token!==request)return;display('再生中')}catch{if(token!==request)return;stop();label.textContent='音源を読み込めませんでした。再生ボタンから再試行できます。'}}
button.addEventListener('click',()=>{if(wanted)stop();else play()});
document.getElementById('sceneSelect')?.addEventListener('change',()=>{if(wanted){audio.pause();play()}else display('停止中')});
audio.addEventListener('error',()=>{if(wanted){stop();label.textContent='音源の読み込みに失敗しました。配信元リンクからも確認できます。'}});
addEventListener('pagehide',stop);display('停止中');
const home=new URL('index.html',location.href),base=new URL('.',home);
let frame=null,dock=null;
function leave(){frame?.remove();dock?.remove();frame=dock=null;document.body.style.overflow='';document.title=originalTitle;}
const originalTitle=document.title;
function openPage(url,push=true){
 if(url.pathname===home.pathname||url.pathname===base.pathname){leave();if(push)history.pushState({},'',url);return}
 if(!frame){
  frame=document.createElement('iframe');frame.title='うきわメモのページ';frame.style.cssText='position:fixed;inset:0 0 62px;width:100%;height:calc(100dvh - 62px);border:0;background:#fff;z-index:10000';
  dock=document.createElement('div');dock.style.cssText='position:fixed;bottom:0;left:0;right:0;height:62px;box-sizing:border-box;display:flex;gap:12px;align-items:center;padding:10px 16px;background:#102936;color:#fff;z-index:10001;font-size:12px';
  dock.innerHTML='<button type="button" data-home>⌂ ホーム</button><button type="button" data-play>⏸ 停止</button><label>音量 <input type="range" min="0" max="100" aria-label="BGM音量" style="width:75px"></label><a href="https://incompetech.com/music/royalty-free/" target="_blank" rel="noopener" style="color:#c9efff;max-width:145px;font-size:10px">音楽・Kevin MacLeod / CC BY 4.0</a>';
  dock.querySelector('[data-home]').onclick=()=>openPage(home);
  dock.querySelector('[data-play]').onclick=()=>{button.click();syncDock()};
  dock.querySelector('input').value=audio.volume*100;dock.querySelector('input').oninput=e=>{audio.volume=e.target.value/100;credit.querySelector('input').value=e.target.value};
  document.body.append(frame,dock);document.body.style.overflow='hidden';
  frame.addEventListener('load',()=>{try{const u=new URL(frame.contentWindow.location.href);if(u.origin!==location.origin)return;if(u.pathname===home.pathname||u.pathname===base.pathname){openPage(home);return}document.title=frame.contentDocument.title||originalTitle;frame.contentDocument.addEventListener('click',intercept);if(location.href!==u.href)history.replaceState({musicPage:u.href},'',u);syncDock()}catch{}});
 }
 frame.src=url.href;if(push)history.pushState({musicPage:url.href},'',url);syncDock();
}
window.ukiwaNavigate=path=>{if(wanted||frame)openPage(new URL(path,home));else location.href=path};
function syncDock(){if(dock)dock.querySelector('[data-play]').textContent=wanted?'⏸ 停止':'♫ 再生'}
function intercept(e){const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;const u=new URL(a.href);if(u.origin!==home.origin||!u.pathname.startsWith(base.pathname)||!(/\.html$/.test(u.pathname)||u.pathname===base.pathname))return;const source=new URL(a.ownerDocument.URL);if(u.pathname===source.pathname&&u.hash)return;if(!wanted&&!frame)return;e.preventDefault();openPage(u)}
document.addEventListener('click',intercept);
addEventListener('popstate',e=>{if(e.state?.musicPage)openPage(new URL(e.state.musicPage),false);else leave()});

})();
