/* Kevin MacLeod recordings, CC BY 4.0. See the visible music credits. */
(()=>{
const button=document.getElementById('bgmToggle');if(!button)return;
const tracks={light:{title:'Luminous Rain',file:'Luminous Rain.mp3',id:'USUAN1100169'},sunset:{title:'Dream Culture',file:'Dream Culture.mp3',id:'USUAN1300046'},dark:{title:'Evening Fall (Piano)',file:'Evening Fall - Piano.mp3',id:'USUAN1100235'}};
const audio=new Audio();audio.preload='none';audio.loop=true;audio.volume=.3;
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
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});addEventListener('pagehide',stop);display('停止中');
})();
