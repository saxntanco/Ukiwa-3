(()=>{function ready(){
 const actions=document.querySelector('.topActions');if(!actions)return;
 const settings=document.createElement('details');settings.className='homeSettings';settings.innerHTML='<summary>島の設定</summary><div class="homeSettingsPanel"></div>';
 actions.append(settings);const panel=settings.lastElementChild;
 const clock=document.getElementById('islandClock');if(clock)actions.insertBefore(clock,settings);
 for(const selector of ['.scenePicker','.islandTimeControls','#motionToggle','#islandMusicCredits']){const node=document.querySelector(selector);if(node)panel.append(node);}
 const moveWeather=()=>{const weather=document.querySelector('.weather-open');if(weather&&!panel.contains(weather))panel.append(weather);};moveWeather();
 const observer=new MutationObserver(moveWeather);observer.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(!settings.contains(e.target))settings.open=false});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&settings.open){settings.open=false;settings.querySelector('summary').focus()}});
 const revealHash=()=>{if(['#sceneSelect','#islandMusicCredits'].includes(location.hash)){settings.open=true;if(location.hash==='#islandMusicCredits'){const credit=document.getElementById('islandMusicCredits');if(credit)credit.open=true;}}};addEventListener('hashchange',revealHash);revealHash();
}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();})();
