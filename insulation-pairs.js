(()=>{'use strict';
const pairs=[
['earth','対地間','導体と大地側の間','導体','接地された外箱','導体から外箱・大地側へ漏れる経路の絶縁を見ます。','接地抵抗（接地極と大地の抵抗）を測る試験とは別です。'],
['phase','相間','異なる相の間','R相','S相','異なる相の導体同士を隔てる絶縁を見ます。','R－S、S－T、T－Rなど。接続された巻線・負荷・電子回路があると、その経路も測定値に影響します。'],
['line','線間','二本の電線の間','L線','N線','電線相互間の絶縁を見ます。相間と完全に別の試験名ではなく、R－S間なら相間でも線間でもあります。','図のL－Nは呼び方の例です。負荷がつながっていると負荷を通る経路があり、絶縁だけの値にはなりません。'],
['different','異極間','別々の極の間','R極','S極','遮断器などの別の極の主回路同士を隔てる絶縁を見ます。','「極間」が異極間を指す資料もあります。漏電遮断器などは内部の電源回路が左右極間に接続され、低い測定値になる場合があります。'],
['contact','同極の接点間','開いた接点を挟む間','R極・電源側','R極・負荷側','同じ極の開いた接点を挟む二点です。隣の相との間ではありません。','「極間」だけで判断せず、図面の測定二点を確認します。接点が閉じていれば導通するため、この二点間の絶縁を測る状態にはなりません。'],
['winding','巻線間','別々の巻線の間','一次巻線','二次巻線','電気的に分離された巻線同士の絶縁を見ます。巻線と鉄心・外箱の間は別の対象です。','同一巻線の両端は巻線で導通しています。巻線抵抗測定やターン間の短絡検査と混同しません。単巻変圧器など、一次・二次がつながる構造にはこの図を当てはめません。']
];
function drawing(key){let body='';const line=(x1,y1,x2,y2,col='#b45c17')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`;const label=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
if(key==='earth'){body='<rect x="100" y="30" width="400" height="160" rx="18" fill="none" stroke="#19839b" stroke-width="5"/>'+line(210,105,390,105)+label(300,83,'導体')+label(300,170,'接地された金属外箱');}
else if(key==='contact'){body=line(80,105,235,105)+line(365,105,520,105,'#19839b')+line(235,105,325,60)+label(150,155,'電源側')+label(445,155,'負荷側')+label(300,195,'同じR極・接点は開放');}
else if(key==='winding'){body='<rect x="85" y="30" width="430" height="170" fill="none" stroke="#a3adba" stroke-width="3"/><path d="M180 55 q-60 18 0 35 q-60 18 0 35 q-60 18 0 35" fill="none" stroke="#b45c17" stroke-width="8"/><path d="M420 55 q60 18 0 35 q60 18 0 35 q60 18 0 35" fill="none" stroke="#19839b" stroke-width="8"/>'+label(180,190,'一次巻線')+label(420,190,'二次巻線')+label(300,110,'絶縁');}
else {body=line(90,75,510,75)+line(90,155,510,155,'#19839b')+label(300,50,key==='line'?'L線':key==='different'?'R極':'R相')+label(300,192,key==='line'?'N線':key==='different'?'S極':'S相')+label(300,122,'二つの導体を隔てる絶縁');}
return `<svg class="pair-svg" viewBox="0 0 600 220" role="img" aria-label="${pairs.find(p=>p[0]===key)[1]}の測定対象を示す概念図">${body}</svg>`;}
const nav=document.querySelector('.pair-nav');nav.innerHTML=pairs.map(p=>`<button type="button" data-pair="${p[0]}" aria-pressed="false">${p[1]}<small>${p[2]}</small></button>`).join('');
function show(key){const p=pairs.find(p=>p[0]===key);document.getElementById('pair-title').textContent=p[1];document.getElementById('pair-sub').textContent=p[2];document.getElementById('pair-a').textContent=p[3];document.getElementById('pair-b').textContent=p[4];document.getElementById('pair-meaning').textContent=p[5];document.getElementById('pair-caution').textContent=p[6];document.getElementById('pair-drawing').innerHTML=drawing(key);nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pair===key)));}
nav.addEventListener('click',e=>{const b=e.target.closest('button[data-pair]');if(b)show(b.dataset.pair)});show('earth');})();
