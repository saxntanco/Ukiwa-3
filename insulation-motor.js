(()=>{'use strict';
const host=document.getElementById('motor-circuit-figure'),answer=document.getElementById('motor-circuit-answer');if(!host||!answer)return;
const cases={joined:{title:'固定Y結線の例：巻線を通じて3相がつながる',body:'1点のLINE接続から、健全な巻線を通じて三相分へ試験電圧が届きます。途中に開放箇所がなく、巻線の導通が確保されていることが前提。見ているのは、つながった範囲をまとめた対地絶縁です。固定Δ結線でも同じく三相はつながります。'},separate:{title:'停止時に3巻線が独立するY–Δ回路の例',body:'U1–U2の巻線へは届きますが、独立したV1–V2・W1–W2へは届きません。各巻線の対地確認が必要です。「3本」というより「3つの独立回路」。図は始動器全体ではなく、すべての接触器が開き、巻線間のつながりがなくなった負荷側を抜き出しています。'},cable:{title:'先端開放のケーブル：1芯ずつ独立している',body:'負荷が外れていれば、1芯に当てても残り2芯は測れません。各芯の対地絶縁を対象にします。メーカー指定の一括対地測定を採用する場合は、各芯を個別に測る場合との違いを確認します。'}};
function render(key){const c=cases[key];let s=`<svg viewBox="0 0 620 340" role="img" aria-label="${c.title}。LINEは上段へ、EARTHは外箱へ。"><text x="24" y="32">開いた接触器の負荷側を抜き出した概念図</text>`;
for(let i=0;i<3;i++){const y=90+i*70,on=i===0||key==='joined',color=on?'#087baf':'#72818d',dash=on?'':'stroke-dasharray="6 5"';s+=`<text x="30" y="${y-12}">${key==='cable'?['芯1','芯2','芯3'][i]:['U1','V1','W1'][i]}</text><path d="M35 ${y} H200 ${key==='cable'?'H390':'l12 -12 18 24 18 -24 18 24 18 -24 18 24 12 -12 H450'}" fill="none" stroke="${color}" stroke-width="5" ${dash}/><text x="${key==='cable'?410:468}" y="${y+6}">${on?'届く':'届かない'}</text>`;if(key==='separate')s+=`<text x="400" y="${y-12}">${['U2','V2','W2'][i]}</text>`;}
if(key==='joined')s+='<path d="M450 90 V230" stroke="#087baf" stroke-width="5"/><text x="358" y="265">固定のスター点</text>';
s+='<text x="24" y="65" style="font-weight:bold">LINE →</text><path d="M25 292 H580" stroke="#65815c" stroke-width="3"/><text x="25" y="322">EARTH → 接地された外箱（導体とは絶縁）</text></svg>';
host.innerHTML=s;answer.innerHTML='<h3>'+c.title+'</h3><p>'+c.body+'</p>';document.querySelectorAll('[data-motor-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.motorCase===key)));}
document.querySelectorAll('[data-motor-case]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.motorCase)));render('joined');
})();
