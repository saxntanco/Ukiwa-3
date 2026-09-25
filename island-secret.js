// 浮き輪をすばやく3回タップ（またはクリック）すると、うきわの隠れ家（hidden-menu.html）へ。
// 前のタップから 600ms 以内に続けて押すと数が進み、間があくと 0 に戻る。進み具合は輪の光で 1/3 ずつ表示する
(()=>{const ring=document.querySelector('.characterFrame');if(!ring)return;
const GAP=600,NEED=3;
ring.setAttribute('role','button');ring.setAttribute('tabindex','0');ring.setAttribute('aria-label','浮き輪をすばやく3回タップでうきわの隠れ家。キーボードではEnterを3回。');
let count=0,timer=0;
function show(){ring.style.setProperty('--secret-progress',(count/NEED*360)+'deg')}
function reset(){count=0;clearTimeout(timer);show()}
function tap(){count++;clearTimeout(timer);show();
 if(count>=NEED){count=0;setTimeout(()=>{show();(window.ukiwaNavigate||(u=>location.href=u))('hidden-menu.html')},120);return}
 timer=setTimeout(reset,GAP)}
ring.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();tap()});
ring.addEventListener('keydown',e=>{if((e.key==='Enter'||e.code==='Space')&&!e.repeat){e.preventDefault();tap()}});
ring.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',reset)})();
