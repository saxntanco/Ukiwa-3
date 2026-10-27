(function(){'use strict';
const mount=document.getElementById('equipment-model');if(!mount)return;
const kind=mount.dataset.model,D=window.UkiwaModelData.models[kind],State=window.UkiwaModelState,G=window.UkiwaGeometry;
if(!D||!State||!G){mount.textContent='モデルを読み込めませんでした。再読み込みしてください。';return;}
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let st=State.initial(kind),tab='exterior',selected=null,yaw=-.55,pitch=.23,zoom=1,auto=false,diagramWide=false,runningPaused=false,faces=[],W=0,H=0,tickTime=0,last=0,drawDirty=true,pick=[];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
mount.innerHTML=`<div class="mv-card"><div class="mv-tabs" role="tablist" aria-label="モデルの表示"><button role="tab" id="mv-exterior" aria-selected="true" data-tab="exterior">外観</button><button role="tab" id="mv-principle" aria-selected="false" data-tab="principle">構造・原理</button><button role="tab" id="mv-motion" aria-selected="false" data-tab="motion">動作</button><button role="tab" id="mv-wiring" aria-selected="false" data-tab="wiring">結線</button></div><div class="mv-grid"><div class="mv-visual"><div class="mv-stage" id="mv-stage"><canvas id="mv-canvas" tabindex="0" aria-label="${esc(D.short)}の外観3D。ドラッグまたは矢印キーで回転。プラスとマイナスで拡大縮小。部品をクリックして選択。"></canvas><div class="mv-stage-note">外形図から再構成・細部は簡略</div><div class="mv-model-tag">橙＝選択部品（通電の表示ではありません）</div></div><div class="mv-views" id="mv-views" aria-label="視点と拡大"><button data-view="front">正面</button><button data-view="back">背面</button><button data-view="left">左</button><button data-view="right">右</button><button data-view="top">上</button><button data-view="bottom">下</button><button data-camera="in" aria-label="拡大">＋</button><button data-camera="out" aria-label="縮小">−</button><button data-camera="reset">全体</button><button data-camera="auto" aria-pressed="false">自動回転</button></div><div class="mv-diagram" id="mv-diagram" hidden></div></div><aside class="mv-side"><h2>部品を選ぶ</h2><div class="mv-parts">${Object.entries(D.parts).map(([k,p])=>`<button data-select="${k}" aria-pressed="false">${esc(p.name)}</button>`).join('')}</div><div class="mv-part-info" id="mv-part-info" aria-live="polite"><h3>回して、つながりを見る</h3><p>外形図で確認した部品を選べます。内部位置が不明な部品は原理図で説明します。</p><span class="mv-evidence-tag">${esc(D.dims)}</span></div></aside></div><div class="mv-controls" id="mv-controls" hidden></div><div class="mv-status" id="mv-status" role="status"></div></div><p class="mv-hint">1本指で回転・2本指で拡大縮小。ドラッグ中は部品を選択しません。内部の位置を推測した透視モデルは使用していません。</p><div class="mv-extra"><details><summary>外形の根拠と再現範囲</summary><h3>資料で確認</h3><p>${esc(D.verified)}</p><h3>簡略化した部分</h3><p>${esc(D.simplified)}</p><h3>未確認</h3><p>${esc(D.unknown)}</p><p>寸法：${esc(D.dims)}。加工・据付に使うCADではありません。</p></details><details><summary>理解のポイント・訂正内容</summary>${D.lesson.map(a=>`<h3>${esc(a[0])}</h3><p>${esc(a[1])}</p>`).join('')}</details><details class="mv-sources"><summary>メーカー資料・版・該当箇所</summary><ul>${D.sources.map(k=>{const a=window.UkiwaModelData.sources[k];return `<li><a target="_blank" rel="noopener" href="${esc(a[1])}">${esc(a[0])}</a><small>${esc(a[2])}</small></li>`;}).join('')}</ul><p>確認日：2026年10月27日。参考型式と異なる機種には、そのまま適用しないでください。</p></details><details><summary>この教材が示す範囲</summary><p>外観は指定型式の外形図を参考に再構成しています。結線・動作は機能を説明する図で、部品の実際の位置・動作時間・電界や熱を計算したものではありません。</p><p>「内部」について、確認できない構造は作らず「構造・原理」で関係を示しています。</p></details><div class="mv-safety"><b>実設備では</b> ${esc(D.safety)}</div></div>`;
const $=id=>document.getElementById(id),cv=$('mv-canvas'),ctx=cv.getContext('2d'),stage=$('mv-stage'),diagram=$('mv-diagram'),controls=$('mv-controls'),status=$('mv-status');
// Equivalent circuit is a stated lumped assumption, never a hidden numerical simulation.
if(kind==='vt'||kind==='pas'){
 const eq=document.createElement('details');
 eq.innerHTML=kind==='vt'?`<summary>V浮きで考える等価回路と仮定</summary><p>二次u–vは短絡、二次v・鉄心を接地Eとした場合の集中定数モデル例です。Uを試験器から励磁し、Vへの外部の導線はつながない条件です。</p><div class="mv-diagram"><svg viewBox="0 0 600 290" role="img" aria-label="試験器と内部インピーダンスZsからUへ。UとVの間は入力インピーダンスZinと容量CUVの並列。UとVから対地容量CUgとCVgを通して接地Eへ。"><path class="wire" d="M30 70H90 M170 70H220V100 M220 165V200H250 M330 200H530V245H30V70 M220 70H390 M470 70H530V245 M220 70H300V105 M300 165V200H220"/><rect class="component" x="90" y="50" width="80" height="40"/><text x="111" y="76">Zs</text><rect class="component" x="185" y="100" width="70" height="65"/><text x="200" y="138">Zin</text><rect class="component" x="270" y="105" width="60" height="60"/><text x="278" y="139">CUV</text><rect class="component" x="390" y="50" width="80" height="40"/><text x="402" y="76">CUg</text><rect class="component" x="250" y="180" width="80" height="40"/><text x="263" y="207">CVg</text><circle cx="30" cy="145" r="23" fill="white" stroke="#577480"/><text x="17" y="151">Vs</text><text x="207" y="52">U</text><text x="202" y="222">V</text><text x="455" y="270">接地E・帰路</text></svg></div><p>Zs：試験器の内部インピーダンス。Zin：励磁枝と二次短絡の一次換算枝を含むU–V間の入力インピーダンス。CUV：巻線端子間の容量。CUg・CVg：対地・接地された二次や鉄心への容量をまとめたもの。</p><p>定数・周波数・試験器の保護動作が未確認のため、Vの電位と巻線電流は計算しません。実物の分布容量や内部位置をそのまま再現した回路ではありません。</p>`:`<summary>試験図の前提と未接続相の等価回路</summary><p>系統から完全に切り離した機器を仮定した接続例です。受電状態・電源側接続中は取説p29注3の「切」が条件となり、「入」の図を適用しません。</p><p>VT接続相UまたはWが未接続の場合：試験HV → 接続された相 → VTの入力インピーダンス → 未接続相 → ケーブル等の対地容量・LA/ZPD等の対地枝 → 接地側・試験器帰路、と考える等価回路です。試験器の内部インピーダンスも直列に加わります。</p><p>容量・巻線インピーダンス・LAの非線形特性・試験器特性は未入力です。導通経路があることだけを説明し、端子電圧・電流・損傷時刻を計算しません。VTに接続していないV相の未接続とは区別します。</p>`;
 mount.querySelector('.mv-extra').prepend(eq);
}
// Keep inputs and their state together, above the visual on narrow screens.
const card=mount.querySelector('.mv-card'),grid=mount.querySelector('.mv-grid');
card.insertBefore(controls,grid);card.insertBefore(status,grid);
if(!ctx){const f=document.createElement('p');f.className='mv-fallback';f.textContent='3D描画が利用できません。「構造・原理」「結線」で同じ機能を確認できます。';stage.appendChild(f);}
function dispatch(a){st=State.next(st,a);runningPaused=a==='tick';tickTime=0;refresh();}
function select(id){selected=id;const p=D.parts[id];if(!p)return;document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.select===id)));
 $('mv-part-info').innerHTML=`<h3>${esc(p.name)}</h3><p>${esc(p.text)}</p><span class="mv-evidence-tag">${esc(p.evidence)}</span>`;
 if(!faces.some(f=>f.id===id)&&tab==='exterior')setTab('principle');else{renderDiagram();drawDirty=true;}
}
function setTab(t){tab=t;mount.dataset.view=t;document.querySelectorAll('[data-tab]').forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});stage.hidden=t==='principle'||t==='wiring'||(t==='motion'&&['vcb','vt','la','zct'].includes(kind));$('mv-views').hidden=stage.hidden;diagram.hidden=t==='exterior';controls.hidden=t==='exterior';renderControls();renderDiagram();resize();renderStatus();}
function renderControls(){let b='';const btn=(a,t,primary=false,pressed=null,disabled=false)=>`<button data-action="${a}" ${primary?'class="primary"':''} ${pressed===null?'':`aria-pressed="${pressed}"`} ${disabled?'disabled':''}>${t}</button>`;
 if(kind==='vcb')b=btn('play','引外しを再生',true,null,!st.closed||!st.power||st.running||st.released)+btn('tick','1段階進む',false,null,!st.running)+btn('pause',runningPaused?'再開':'一時停止',false,null,!st.running)+btn('fault',st.fault?'補助スイッチ：不追従':'補助スイッチ：正常',false,st.fault)+btn('power',st.power?'操作電源を切る':'操作電源を戻す')+btn('relay-off','67を復帰')+btn('reset','教材を初期化');
 else if(kind==='ds'||kind==='lbs'||kind==='pas'){
  b=btn('close','模型を閉じる',false,st.closed,st.fused)+btn('open','模型を開く',false,!st.closed);
  if(kind==='lbs')b+=btn('play','PF溶断の順序',true,null,st.fused||!st.closed||st.running)+btn('tick','1段階進む',false,null,!st.running)+btn('pause',runningPaused?'再開':'一時停止',false,null,!st.running)+btn('reset','教材を初期化');
  if(kind==='pas')b+=['normal','all','u','v','w'].map((m,i)=>btn('mode:'+m,['通常の接続','試験：三相同電位','試験：U未接続','試験：V未接続','試験：W未接続'][i],false,st.mode===m)).join('');
 }else if(kind==='vt')b=['normal','all','float','ground'].map((m,i)=>btn('mode:'+m,['通常使用','試験：U–V短絡','試験：V浮き','試験：V接地'][i],false,st.mode===m)).join('');
 else if(kind==='la'||kind==='zct')b=['normal','event'].map((m,i)=>btn('mode:'+m,i?(kind==='la'?'雷サージ時':'地絡の経路あり'):'通常時',false,st.mode===m)).join('');
 controls.innerHTML=b+'<small>状態と順序の教材です。再生速度は実機の時間を表しません。実設備の操作指示ではありません。'+(kind==='vcb'?' 補助スイッチの条件変更では教材を投入状態へ初期化します。':'')+'</small>';
}
function renderStatus(){const e=State.electrical(st);let title='',text='',warn=false;
 if(kind==='vcb'){
  title=`主接点 ${st.closed?'閉':'開'} ／ 52a ${e.a?'閉':'開'} ／ 52b ${e.b?'閉':'開'} ／ TC ${e.tc?'励磁':'消磁'}`;
  text=['投入状態。67は復帰、TCは消磁。','① 67接点閉 → 電源・52aを通ってTCが励磁。','② TCがキャッチを解除。以後はばねに蓄えたエネルギーで開路。','③ 主接点が開く。補助接点との切替順序は説明のために分割。',st.fault?'④ 補助スイッチが追従せず52a閉。電源・67接点が維持されるとTCへの通電が続く。熱損傷の時刻は計算しない。':'④ 52a開でTC消磁、52b閉。','⑤ 67復帰。主接点・52a開、52b閉。'][st.step];
  if(!st.power)text+=(st.released?' 解除後の電源断でも、ばねによる開路は進む。':' 解除前の電源断：キャッチは解除されず開路しない。');
  if(st.fault&&st.step>=3&&!e.tc)text+=' 現在はTCの通電条件が途切れている。';
  warn=e.tc&&st.fault;
 }else if(kind==='pas'){
  title=`PAS ${st.closed?'入（導通）':'切（主接点で分離）'} ／ 内蔵VT：負荷側U–W間`;
  text={normal:'外観の内部配置は未確認。接続関係は別の模式図で表示。',all:'一次三相を同電位にした試験の原理。巻線両端の差電圧を抑える。制御線P1・P2は各々絶縁するメーカー指定に注意。',u:'Uが未接続：WからVT一次巻線を介する経路が残る。端子電位・電流の大きさは未評価。',w:'Wが未接続：UからVT一次巻線を介する経路が残る。U未接続と同様にVT接続相の問題。',v:'Vが未接続：VはこのVTの接続相ではない。V相の試験範囲が保証されないことと、VTを介する経路を区別する。'}[st.mode];
  if(st.mode!=='normal')text+=' 系統から完全切離しの仮定。受電状態・電源側接続中は取説の「切」が条件。「入」の図を適用しない。';
  if(!st.closed)text+=' 主接点の分離だけで電源側の無電圧を保証しない。';warn=!['normal','all'].includes(st.mode);
 }else if(kind==='vt'){
  title={normal:'通常使用：一次と二次は磁気的に結合',all:'一次U–V短絡・二次側短絡接地：試験の原理',float:'V浮き：電位・巻線電圧は未確定',ground:'V接地・二次短絡：過電流のおそれ'}[st.mode];
  text={normal:'二次は負担へ接続。二次短絡を通常使用と混同しない。',all:'一次巻線の両端を同電位にする。一次と二次・鉄心・大地間の絶縁を考える図で、試験値と時間は指定しない。',float:'浮遊容量・巻線の等価回路・試験器特性が必要。「小さい電圧」「ほぼ無電流」と断定しない。',ground:'一次に差電圧が生じる。二次短絡との組合せで過電流が生じうる。実電圧は試験器の電圧降下・保護にも依存。'}[st.mode];warn=['float','ground'].includes(st.mode);
 }else if(kind==='ds'){title=`単極DS：${st.closed?'閉路':'開路'}`;text='無電圧の模型。開路では下側の支点から約90°前方へ開く。負荷電流の遮断を示すアニメーションではない。';}
 else if(kind==='lbs'){title=`LBS：${st.closed?'三相閉路':'三相開路'} ／ PF：${st.fused?'1相溶断の例':'健全の例'}`;text=st.fused?'PFの溶断 → 欠相防止機能で三相開放。溶断PFは再投入で復帰しない。教材の初期化は実機の交換手順ではない。':'上部電源側 → 開閉部 → PF → 下部負荷側。PFS-201M-Aには引外しコイルを追加していない。';warn=st.fused;}
 else if(kind==='la'){title=st.mode==='event'?'雷サージ時：接地側への経路を表示':'通常時：直列ギャップが放電していない状態';text='GL-B6Gは直列ギャップ付ZnO避雷器。図の経路は定性的な機能説明で、素子配置・雷波形の計算ではない。';}
 else if(kind==='zct'){title=st.mode==='event'?'孔の外へ戻る電流がある → 電流の和が残る':'孔を通る電流の和を検出する';text='同じ基準方向の瞬時値で iU + iV + iW = 3i₀。三相3線で電流が孔内をすべて往復する場合は和が0。定格零相200 mAは継電器の整定値ではない。';}
 if(tab==='exterior')text=D.verified;
 status.className='mv-status'+(warn?' warn':'');status.innerHTML=`<b>${esc(title)}</b><span>${esc(text)}</span>`;
 mount.dataset.stage=String(st.step);mount.dataset.tc=String(e.tc);mount.dataset.closed=String(st.closed);mount.dataset.fused=String(st.fused);mount.dataset.power=String(st.power);
}
// Functional diagrams use a common selection id but never claim physical placement.
function renderDiagram(){if(diagram.hidden)return;const e=State.electrical(st);let svg='';
 const wire=(p,on=false)=>`<path class="wire${on&&!reduced?' flow':''}" d="${p}"/>`;
 const txt=(x,y,t,small=false)=>`<text x="${x}" y="${y}" text-anchor="middle" class="${small?'small':''}">${esc(t)}</text>`;
 const node=(id,x,y,w,h,label)=>`<g data-part="${id}" tabindex="0" role="button" aria-label="${esc(D.parts[id]?.name||label)}" class="${selected===id?'selected':''}"><rect class="component" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>${txt(x+w/2,y+h/2+5,label)}</g>`;
 const earth=(x,y)=>wire(`M${x} ${y}v12 M${x-14} ${y+12}h28 M${x-9} ${y+18}h18 M${x-4} ${y+24}h8`);
 const contact=(x,y,closed,id)=>`<g data-part="${id}" tabindex="0" role="button" aria-label="${esc(D.parts[id]?.name||'接点')}：${closed?'閉':'開'}" class="${selected===id?'selected':''}"><rect class="component" x="${x-8}" y="${y-25}" width="68" height="48" rx="7" opacity=".55"/><circle cx="${x}" cy="${y}" r="4" fill="#34515f"/><circle cx="${x+45}" cy="${y}" r="4" fill="#34515f"/>${wire(`M${x} ${y}L${x+45} ${closed?y:y-20}`)}</g>`;
 if(kind==='vcb'){
  svg=txt(300,28,'主回路と引外し制御回路は別の回路');
  [100,280,460].forEach((x,i)=>{svg+=wire(`M${x-23} 50V100`)+contact(x-23,100,st.closed,'contact')+wire(`M${x+22} 100V130`)+txt(x,150,['U','V','W'][i]);});
  svg+=txt(300,185,'DC100 V／a3＝52a／外部67は制御回路の例',true);
  svg+=wire('M45 235H130 M175 235H265 M310 235H395 M470 235H550V310H45V290 M45 255V235',e.tc)+contact(130,235,st.relay,'relay')+contact(265,235,e.a,'aux')+node('tc',395,215,75,40,'TC');
  svg+=`<circle cx="45" cy="273" r="18" fill="white" stroke="#577480" stroke-width="2"/>`+txt(45,278,st.power?'DC':'切',true)+txt(45,217,'＋')+txt(45,330,'−')+txt(152,279,'67出力')+txt(287,279,'a3／52a')+txt(230,215,'K',true)+txt(505,256,'N2',true)+txt(300,354,`52b：${e.b?'閉':'開'} ／ キャッチ：${st.released?'解除':'保持'}`,true)+txt(300,385,'電源＋ → 67 → 52a → TC → 電源− の閉回路',true);
 }else if(kind==='pas'){
  ['U','V','W'].forEach((ph,i)=>{let y=70+i*85,missing=st.mode===ph.toLowerCase();svg+=txt(25,y+5,ph)+wire(`M40 ${y}H155`)+contact(155,y,st.closed,'contact')+wire(`M200 ${y}H535`);
    if(st.mode==='normal')svg+=wire(`M535 ${y}H575`);
    else if(missing)svg+=txt(552,y-9,'未接続',true);
    else svg+=wire(`M535 ${y}H575`)+`<circle cx="575" cy="${y}" r="4" fill="#34515f"/>`;
  });
  svg+=txt(90,28,'電源側')+txt(405,28,'負荷側');
  svg+=`<g data-part="zct" tabindex="0" role="button" aria-label="主接点の電源側ZCT" class="${selected==='zct'?'selected':''}"><ellipse cx="95" cy="155" rx="25" ry="103" fill="none" stroke="${selected==='zct'?'#b76b14':'#537d8d'}" stroke-width="7"/>${txt(95,285,'ZCT')}</g>`;
  svg+=wire('M245 70V149 Q259 155 245 161V234 Q259 240 245 246V310H285 M370 240V310H365')+node('vt',285,290,80,40,'VT');
  svg+=`<circle cx="245" cy="70" r="4" fill="#34515f"/><circle cx="370" cy="240" r="4" fill="#34515f"/>`+txt(325,352,'U–W接続',true);
  [430,475,520].forEach((x,i)=>{let path=`M${x} ${70+i*85}`;for(let j=i+1;j<3;j++){const y=70+j*85;path+=`V${y-6} Q${x+14} ${y} ${x} ${y+6}`;}path+='V290';svg+=wire(path)+`<circle cx="${x}" cy="${70+i*85}" r="4" fill="#34515f"/>`+node('la',x-17,290,34,40,'LA')+wire(`M${x} 330V350`);});
  svg+=wire('M430 350H520')+earth(475,350)+txt(475,401,'U・V・W各相 → LA → 接地',true);
  svg+=node('zpd',40,330,160,45,'負荷側のZPD')+txt(120,400,'三相の対地電圧を検出',true);
  if(st.mode!=='normal')svg+=wire('M575 50V240')+txt(563,40,'試験HV',true);
  svg+=txt(300,435,'●＝接続。跳び越し＝非接続。ZPDの配線と制御回路は省略。',true);
 }else if(kind==='vt'){
  const mode=st.mode;svg=txt(130,28,'一次 U・V')+txt(460,28,'二次 u・v');
  svg+=wire('M70 80H90 M120 80H125V125 M125 235V280H120 M90 280H70 M475 80H540 M475 280H540')+node('fuse',90,68,30,24,'F')+node('fuse',90,268,30,24,'F');
  svg+=node('winding',75,125,100,110,'一次巻線')+node('winding',425,125,100,110,'二次巻線');
  svg+=txt(70,65,'U')+txt(70,300,'V')+txt(540,65,'u')+txt(540,300,'v')+txt(300,165,'磁気結合')+txt(300,190,'導体はつながらない',true);
  if(mode==='normal')svg+=wire('M475 80V125 M475 235V280 M540 80H565V145 M565 215V280H540 M540 280V320')+node('secondary',540,145,50,70,'負担')+earth(540,320)+txt(300,365,'U・uは対応する極性端子。二次vの1点接地例。',true);
  else {svg+=wire('M475 80V125 M475 235V280 M540 80H565V280H540 M565 280V310')+earth(565,310)+txt(465,353,'二次短絡・接地',true);
   if(mode==='all')svg+=wire('M70 80H35V280H70')+txt(140,338,'U–V同電位',true);
   else if(mode==='float')svg+=txt(125,338,'Vの電位は未評価',true);
   else svg+=wire('M70 280V310')+earth(70,310)+txt(140,353,'V接地',true);
   svg+=txt(300,385,'U：試験器HV／鉄心：接地（図外）。F：一次ヒューズ。',true)+txt(300,415,'試験器の帰路は接地側。浮遊容量等を省略し電位は計算しない。',true);
  }
 }else if(kind==='ds'||kind==='lbs'){
  const lbs=kind==='lbs';svg=txt(300,30,lbs?'三相のうち1相を抜き出した機能図':'単極の接続（無電圧の模型）');
  svg+=txt(70,125,lbs?'上部：電源側':'端子A')+wire('M70 145H225')+contact(225,145,st.closed,'blade');
  svg+=wire(lbs?'M270 145H350 M430 145H540':'M270 145H540');
  if(lbs)svg+=node('fuse',350,120,80,50,st.fused?'PF溶断':'PF');
  svg+=txt(540,125,lbs?'下部：負荷側':'端子B');
  if(lbs)svg+=node('trip',175,230,250,60,'PF溶断 → 三相開放')+txt(300,340,'PFは「閉」にしても復帰しない',true);
  else svg+=node('insulator',175,230,250,60,'支持碍子：充電部を絶縁支持')+txt(300,340,'負荷電流の遮断には使わない',true);
 }else if(kind==='la'){
  const on=st.mode==='event';svg=txt(300,28,'GL-B6G：直列ギャップ付の機能図')+wire('M45 80H550 M300 80V125 M300 175V215 M300 265V310')+node('gap',235,125,130,50,on?'ギャップ放電':'直列ギャップ')+node('zno',235,215,130,50,'ZnO素子')+earth(300,310)+txt(85,62,'線路側')+txt(415,325,'接地系へ')+txt(300,380,'帰路：系統の対地容量・接地インピーダンス等（図外）',true)+txt(300,415,on?'放電経路が成立した状態の比較。電流値・波形は未計算。':'通常：ギャップは放電していない。',true);
 }else if(kind==='zct'){
  svg=txt(300,28,'三相3線の回路例：矢印は電流の正の基準');
  svg+=`<rect x="20" y="90" width="65" height="200" rx="10" fill="#edf4f5" stroke="#718b98"/>`+txt(52,195,'電源');
  svg+=`<rect x="465" y="90" width="85" height="200" rx="10" fill="#edf4f5" stroke="#718b98"/>`+txt(507,195,'負荷');
  [130,195,260].forEach((y,i)=>{svg+=wire(`M85 ${y}H465`)+txt(120,y-9,['U →','V →','W →'][i]);});
  svg+=`<g data-part="winding" tabindex="0" role="button" aria-label="ZCTの検出原理"><ellipse cx="280" cy="195" rx="42" ry="108" fill="none" stroke="${selected==='winding'?'#b76b14':'#537d8d'}" stroke-width="9"/></g>`+txt(280,65,'ZCT')+txt(360,105,'和を検出',true);
  if(st.mode==='event')svg+=wire('M425 260V330H65V290')+txt(275,355,'← 孔外の帰路（対地容量・接地系等を含む）',true);
  svg+=txt(300,397,'iU + iV + iW = 3i₀')+txt(300,433,'負荷の不平衡だけでは、孔内を往復する電流の和は0。',true);
 }

 diagram.innerHTML=`<h3>${tab==='wiring'?'結線の関係':'構造・動作の原理'} <small>— 実際の内部配置ではありません</small></h3><button type="button" class="mv-diagram-zoom" data-diagram-zoom>${diagramWide?'図を全体表示':'図を拡大'}</button><div class="mv-svg-scroll${diagramWide?' wide':''}"><svg viewBox="0 0 600 ${['pas','zct'].includes(kind)?460:440}" role="img" aria-label="${esc(D.short)}の機能模式図。部品を選択すると外観と説明が連動します">${svg}</svg></div><p class="mv-diagram-caption">実線＝接続関係。${kind==='vcb'?'黄色の動き＝電源から戻りまでのTC電流経路。':'電流・電圧・磁束の動画は表示していません。'}数値・熱・動作時間の計算ではありません。拡大した図は左右に動かせます。</p>`;
}
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((v,i)=>v-b[i]);
function resize(){if(stage.hidden)return;const rect=stage.getBoundingClientRect();W=rect.width;H=rect.height;if(!ctx||!W)return;const dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);drawDirty=true;}
function transformed(p){let x=p[0],y=p[1]-(kind==='pas'?300:kind==='vcb'?190:kind==='lbs'?190:kind==='zct'?67:kind==='vt'?86:kind==='ds'?140:122),z=p[2];const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw);return [xx,y*Math.cos(pitch)-zz*Math.sin(pitch),y*Math.sin(pitch)+zz*Math.cos(pitch)];}
function project(p){const d=D.size*3,scale=Math.min(W,H)*2.25*zoom/(d-p[2]);return [W/2+p[0]*scale,H*.53-p[1]*scale,p[2]];}
function draw(){if(!ctx||stage.hidden||!W)return;ctx.clearRect(0,0,W,H);pick=[];
 ctx.strokeStyle='#ccdbe2';ctx.lineWidth=.7;for(let x=-D.size;x<=D.size;x+=D.size/5){let a=project(transformed([x,0,-D.size])),b=project(transformed([x,0,D.size]));ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();a=project(transformed([-D.size,0,x]));b=project(transformed([D.size,0,x]));ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
 const items=faces.map(f=>{const ps=f.p.map(transformed),n=cross(sub(ps[1],ps[0]),sub(ps[2],ps[0]));return {f,ps,s:ps.map(project),z:ps.reduce((a,p)=>a+p[2],0)/ps.length,n};}).sort((a,b)=>a.z-b.z);
 items.forEach(o=>{const len=Math.hypot(...o.n)||1,sh=.56+.35*Math.abs((o.n[0]*.3+o.n[1]*.8+o.n[2]*.5)/len);const col=o.f.id===selected?'#e8a643':o.f.c;const c=[1,3,5].map(i=>Math.round(parseInt(col.slice(i,i+2),16)*sh));
  ctx.beginPath();ctx.moveTo(...o.s[0].slice(0,2));o.s.slice(1).forEach(p=>ctx.lineTo(...p.slice(0,2)));ctx.closePath();ctx.fillStyle=`rgb(${c.join(',')})`;ctx.fill();ctx.strokeStyle=o.f.id===selected?'#9a6518':`rgba(${c.join(',')},.7)`;ctx.lineWidth=.65;ctx.stroke();pick.push({p:o.s,id:o.f.id});
 });
}
function inside(p,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i][1]>p[1])!==(poly[j][1]>p[1])&&p[0]<(poly[j][0]-poly[i][0])*(p[1]-poly[i][1])/(poly[j][1]-poly[i][1])+poly[i][0])c=!c;return c;}
function refresh(){faces=G.build(kind,st);drawDirty=true;renderControls();renderStatus();renderDiagram();}
mount.addEventListener('click',ev=>{const b=ev.target.closest('button,[data-part]');if(!b)return;
 if(b.hasAttribute('data-diagram-zoom')){diagramWide=!diagramWide;renderDiagram();}
 else if(b.dataset.tab)setTab(b.dataset.tab);else if(b.dataset.select||b.dataset.part)select(b.dataset.select||b.dataset.part);
 else if(b.dataset.action){if(b.dataset.action==='pause'){runningPaused=!runningPaused;renderControls();}else dispatch(b.dataset.action);}
 else if(b.dataset.view){const views={front:[0,0],back:[Math.PI,0],left:[Math.PI/2,0],right:[-Math.PI/2,0],top:[0,Math.PI/2-.01],bottom:[0,-Math.PI/2+.01]};[yaw,pitch]=views[b.dataset.view];auto=false;drawDirty=true;}
 else if(b.dataset.camera){const a=b.dataset.camera;if(a==='in')zoom=Math.min(2.5,zoom*1.2);if(a==='out')zoom=Math.max(.55,zoom/1.2);if(a==='reset'){yaw=-.55;pitch=.23;zoom=1;auto=false;}if(a==='auto')auto=!auto;drawDirty=true;}
 const ab=mount.querySelector('[data-camera="auto"]');ab.setAttribute('aria-pressed',String(auto));
});
mount.addEventListener('keydown',ev=>{if(ev.target.matches('[data-part]')&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();select(ev.target.dataset.part);}if(ev.target.matches('[data-tab]')&&['ArrowLeft','ArrowRight'].includes(ev.key)){ev.preventDefault();const a=['exterior','principle','motion','wiring'],i=a.indexOf(tab),t=a[(i+(ev.key==='ArrowRight'?1:3))%4];setTab(t);$('mv-'+t).focus();}});
const pointers=new Map();let down=null,previous=null,pinch=0,moved=false;
cv.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);auto=false;cv.classList.add('drag');cv.setPointerCapture(e.pointerId);if(pointers.size===1){down=[e.clientX,e.clientY];previous=down;moved=false;}else{const p=[...pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);moved=true;}});
cv.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch&&d)zoom=Math.max(.55,Math.min(2.5,zoom*d/pinch));pinch=d;}else if(previous){yaw+=(e.clientX-previous[0])*.008;pitch=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,pitch+(e.clientY-previous[1])*.008));previous=[e.clientX,e.clientY];if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)moved=true;}drawDirty=true;});
function up(e){if(!pointers.has(e.pointerId))return;if(e.type==='pointerup'&&!moved&&pointers.size===1){const r=cv.getBoundingClientRect(),p=[e.clientX-r.left,e.clientY-r.top];for(let i=pick.length-1;i>=0;i--)if(inside(p,pick[i].p)){select(pick[i].id);break;}}pointers.delete(e.pointerId);pinch=0;previous=pointers.size?[...pointers.values()][0]:null;if(!pointers.size)cv.classList.remove('drag');}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('lostpointercapture',up);
cv.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(2.5,zoom*Math.exp(-e.deltaY*.001)));drawDirty=true;},{passive:false});
cv.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();auto=false;if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch=Math.min(1.56,pitch+.15);if(e.key==='ArrowDown')pitch=Math.max(-1.56,pitch-.15);if(e.key==='+'||e.key==='=')zoom=Math.min(2.5,zoom*1.15);if(e.key==='-')zoom=Math.max(.55,zoom/1.15);drawDirty=true;});
let visible=true;if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{rootMargin:'100px'}).observe(mount);
new ResizeObserver(resize).observe(stage);
function loop(ts){const dt=last?Math.min((ts-last)/1000,.1):0;last=ts;
 if(!document.hidden&&visible){if(auto&&!stage.hidden){yaw+=dt*.25;drawDirty=true;}if(st.running&&!runningPaused&&!reduced&&tab!=='exterior'){tickTime+=dt;if(tickTime>=1.5){tickTime=0;st=State.next(st,'tick');refresh();}}if(drawDirty){draw();drawDirty=false;}}
 requestAnimationFrame(loop);
}
refresh();setTab('exterior');requestAnimationFrame(loop);
})();
