/* 始動方式別：停止時の「島」と絶縁抵抗の測定点。回路原理の概念図で、試験結線図・操作手順ではありません。 */
(()=>{'use strict';
const fig=document.getElementById('start-figure'),ans=document.getElementById('start-answer');
const K={A:'#087baf',B:'#c2410c',C:'#15803d',D:'#7c3aed',up:'#8b97a4',note:'#5b6b7a'};
const UP='7 6';
const W=(d,c,o={})=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${o.w||5}" stroke-linecap="round" stroke-linejoin="round"${c===K.up||o.dash?` stroke-dasharray="${o.dash||UP}"`:''}/>`;
const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}"${o.c?` fill="${o.c}"`:''}${o.b?' font-weight="700"':''}${o.s?` style="font-size:${o.s}px"`:''}>${s}</text>`;
const sw=(x,y,l,r)=>`<circle cx="${x}" cy="${y}" r="5" fill="${l}"/><circle cx="${x+40}" cy="${y}" r="5" fill="${r}"/><path d="M${x} ${y} L${x+35} ${y-17}" stroke="${l}" stroke-width="4" stroke-linecap="round"/>`;
const coil=(x,y,n,c)=>{let d=`M${x} ${y}`;for(let i=0;i<n;i++)d+=' a10 10 0 0 1 20 0';return W(d,c);};
const res=(x,y,c)=>W(`M${x} ${y} l6 -9 12 18 12 -18 12 18 12 -18 12 18 6 -9`,c,{w:4});
const dot=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="5.5" fill="${c}"/>`;
const pin=(x,y,n)=>`<circle cx="${x}" cy="${y}" r="14" fill="#fff" stroke="#0f2a3d" stroke-width="3"/><text x="${x}" y="${y+6}" text-anchor="middle" font-weight="700" fill="#0f2a3d">${n}</text>`;
const box=(x,y,w,h,label,ly)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>`+(label?T(x+w/2,ly??y-10,label,{s:15,c:K.note}):'');
const thr=(x,y1,y2)=>`<rect x="${x}" y="${y1}" width="50" height="${y2-y1}" rx="8" fill="#e8eef3" stroke="#64748b" stroke-width="2"/>`+T(x+25,y2+20,'THR',{s:14,c:K.note});
const foot=(y,summary)=>T(410,y,summary,{s:15,b:1})+T(410,y+24,'EARTH側は外箱・接地端子へ（帰路は省略）。灰色の破線＝この測定から外れる上流側。',{s:14,c:K.note});
const ph=['U','V','W'],ph2=['X','Y','Z'],tag=['島A','島B','島C'],col=[K.A,K.B,K.C];
const svg=(h,label,body)=>`<svg viewBox="0 0 820 ${h}" role="img" aria-label="${label}">${T(20,34,'停止中・すべての接触器が開いた状態',{a:'start',s:15,c:K.note})}${body}</svg>`;

function dol(){const r=[120,200,280];let s=box(86,88,68,214,'MC（開）',78)+thr(220,96,304)+box(440,88,250,214,'モーター（固定のY結線の例）',78);
r.forEach((y,i)=>{s+=W(`M30 ${y} H100`,K.up)+W(`M140 ${y} H480`,K.A)+coil(480,y,6,K.A)+W(`M600 ${y} H650`,K.A)+sw(100,y,K.up,K.A)+T(462,y-10,ph[i],{s:15,b:1});});
s+=W('M650 120 V280',K.A)+T(735,196,'固定の',{s:14})+T(735,214,'スター点',{s:14})+pin(185,120,'①')+T(345,108,'島A',{c:K.A,b:1});
return svg(400,'直入れ：MC二次側から巻線を通じて3相が1つの島',s+foot(350,'島A：MC二次側〜サーマル〜巻線〜スター点まで、3相が1つにつながる'));}

function rev(){const r=[140,220,300];let s=box(84,118,72,218)+box(174,118,72,218)+thr(300,126,324)+box(440,118,250,218,'モーター',108);
r.forEach((y,i)=>{s+=W(`M30 ${y} H100`,K.up)+W(`M60 ${y} V${y-30} H190 V${y}`,K.up)+W(`M140 ${y} V${y+24} H270 V${y}`,K.A)+W(`M230 ${y} H480`,K.A)+coil(480,y,6,K.A)+W(`M600 ${y} H650`,K.A)+sw(100,y,K.up,K.A)+sw(190,y,K.up,K.A)+dot(270,y,K.A)+dot(60,y,K.up)+T(462,y-10,ph[i],{s:15,b:1});});
s+=W('M650 140 V300',K.A)+T(120,358,'MCF（正転）開',{s:14,c:K.note})+T(222,380,'MCR（逆転）開',{s:14,c:K.note})+pin(400,140,'①')+T(735,216,'固定の',{s:14})+T(735,234,'スター点',{s:14});
return svg(445,'正逆運転：2台のMCの二次側は同じモーターへ。島は1つ',s+T(560,380,'MCRは2相を入れ替えて接続（図では省略）',{s:14,c:K.note})+foot(408,'島A：MCF・MCRどちらの二次側も同じモーター端子へ。島は1つ'));}

function yd(two){const r=[120,200,280];let s=box(86,88,68,214,two?'ブレーカー（切）':'MCM（開）',78)+thr(200,96,304)+box(430,88,160,214,'モーター（6本口出し）',78);
r.forEach((y,i)=>{const c=col[i];s+=W(`M30 ${y} H100`,K.up)+W(`M140 ${y} H450`,c)+coil(450,y,6,c)+W(`M570 ${y} H680`,c)+W(`M610 ${y} V${y+34} H620`,c)+W(`M660 ${y+34} H690`,K.up)+W(`M720 ${y} H745`,K.D)+sw(100,y,K.up,c)+sw(680,y,c,K.D)+sw(620,y+34,c,K.up)+dot(610,y,c)+T(715,y+40,'電源',{s:14,c:K.note})+T(443,y-10,ph[i],{a:'start',s:15,b:1})+T(582,y-10,ph2[i],{a:'end',s:15,b:1})+T(340,y-10,tag[i],{c,b:1})+pin(172,y,'①②③'[i]);});
s+=W('M745 120 V280',K.D)+T(700,78,'MCS（開）',{s:15,c:K.note})+T(640,352,'MCΔ（開）',{s:15,c:K.note})+T(783,206,'島D',{c:K.D,b:1});
return svg(420,two?'スターデルタ2コンタクタ：ブレーカー二次側から3つの島':'スターデルタ3コンタクタ：MCM二次側から3つの島',s+foot(382,'島A・B・C：巻線ごとに独立（U–X／V–Y／W–Z）　島D：スター点の渡り線だけ'));}

function reactor(){const r=[140,220,300];let s=thr(430,118,322)+box(545,118,180,204,'モーター',108);
r.forEach((y,i)=>{s+=W(`M30 ${y} H100`,K.up)+W(`M60 ${y} V${y-34} H300`,K.up)+W(`M340 ${y-34} H400 V${y}`,K.A)+W(`M140 ${y} H190`,K.A)+coil(190,y,6,K.A)+W(`M310 ${y} H570`,K.A)+coil(570,y,5,K.A)+W(`M670 ${y} H700`,K.A)+sw(100,y,K.up,K.A)+sw(300,y-34,K.up,K.A)+dot(400,y,K.A)+dot(60,y,K.up)+T(555,y-10,ph[i],{a:'start',s:15,b:1});});
s+=W('M700 140 V300',K.A)+T(120,80,'MCS（始動・開）',{s:15,c:K.note})+T(330,80,'MCRN（運転・開）',{s:15,c:K.note})+T(250,342,'リアクトル',{s:14,c:K.note})+pin(165,140,'①')+T(490,108,'島A',{c:K.A,b:1});
return svg(418,'リアクトル始動：リアクトルとモーターが1つの島',s+foot(372,'島A：リアクトルの巻線も直流では導線と同じ。モーターまで1つの島'));}

function kondorfer(){const r=[130,235,340];let s=box(605,105,185,250,'モーター（固定結線）',95);
r.forEach((y,i)=>{const a=y+35;s+=W(`M60 ${y} H330`,K.up)+W(`M370 ${y} H620`,K.A)+coil(620,y,5,K.A)+W(`M720 ${y} H755`,K.A)+W(`M40 ${a} H70`,K.D)+W(`M110 ${a} H380`,K.A)+coil(380,a,5,K.A)+W(`M480 ${a} H500`,K.A)+W(`M540 ${a} H565`,K.up)+W(`M440 ${a} V${y}`,K.A)+sw(330,y,K.up,K.A)+sw(70,a,K.D,K.A)+sw(500,a,K.A,K.up)+dot(440,y,K.A)+dot(440,a,K.A)+T(585,a+5,'電源',{s:14,c:K.note})+T(60,y-10,'電源',{a:'start',s:13,c:K.note})+T(612,y-10,ph[i],{a:'start',s:15,b:1});});
s+=W('M755 130 V340',K.A)+W('M40 165 V375',K.D)+T(350,100,'MCRN（運転・開）',{s:15,c:K.note})+T(430,205,'単巻変圧器',{s:14,c:K.note})+T(95,405,'MCS2（中性点・開）',{s:14,c:K.note})+T(520,405,'MCS1（電源側・開）',{s:14,c:K.note})+T(18,276,'島D',{s:14,c:K.D,b:1})+pin(400,130,'①')+T(400,322,'島A',{c:K.A,b:1});
return svg(470,'コンドルファ始動：単巻変圧器の巻線とモーターが1つの島',s+foot(432,'島A：タップでつながる単巻変圧器とモーター　島D：中性点側の渡り線'));}

function wound(){const r=[110,170,230],q=[310,350,390];let s=box(86,85,68,170,'MCM（開）',75)+thr(200,88,252)+box(450,85,190,170,'固定子',75)+box(450,285,340,125,'回転子回路',278);
r.forEach((y,i)=>{s+=W(`M30 ${y} H100`,K.up)+W(`M140 ${y} H470`,K.A)+coil(470,y,5,K.A)+W(`M570 ${y} H610`,K.A)+sw(100,y,K.up,K.A);});
q.forEach(y=>{s+=W(`M470 ${y} H490`,K.B)+coil(490,y,3,K.B)+W(`M550 ${y} H600`,K.B)+`<circle cx="608" cy="${y}" r="8" fill="#fff" stroke="${K.B}" stroke-width="4"/>`+W(`M616 ${y} H650`,K.B)+res(650,y,K.B)+W(`M722 ${y} H750`,K.B);});
s+=W('M610 110 V230',K.A)+W('M470 310 V390',K.B)+W('M750 310 V390',K.B)+pin(172,110,'①')+pin(633,310,'②')+T(330,98,'島A',{c:K.A,b:1})+T(420,356,'島B',{c:K.B,b:1})+T(598,430,'スリップリング',{s:14,c:K.note})+T(712,430,'二次抵抗器',{s:14,c:K.note});
return svg(500,'巻線形の二次抵抗始動：固定子と回転子回路は別の島',s+foot(462,'島A：固定子　島B：回転子＋スリップリング＋二次抵抗器（電気的に別）'));}

function inv(){const r=[120,200,280];let s=box(86,88,68,214,'MC（開）',78)+`<rect x="270" y="96" width="130" height="208" rx="12" fill="#fdf2e9" stroke="#b45309" stroke-width="3"/>`+T(335,170,'インバーター',{s:15,b:1,c:'#9a3412'})+T(335,192,'ソフトスタータ',{s:15,b:1,c:'#9a3412'})+T(335,232,'試験電圧を',{s:14,c:'#9a3412'})+T(335,252,'入れない',{s:14,c:'#9a3412'})+box(490,88,170,214,'モーター',78);
r.forEach(y=>{s+=W(`M30 ${y} H100`,K.up)+W(`M140 ${y} H230`,K.A)+W(`M255 ${y} H270`,K.up)+W(`M400 ${y} H415`,K.up)+W(`M445 ${y} H510`,K.B)+coil(510,y,5,K.B)+W(`M610 ${y} H640`,K.B)+sw(100,y,K.up,K.A);});
s+=W('M640 120 V280',K.B)+pin(185,120,'①')+pin(465,120,'②')+T(243,325,'外す',{s:14,c:K.note})+T(430,325,'外す',{s:14,c:K.note})+T(185,350,'島A：入力側の配線',{s:14,c:K.A,b:1})+T(575,350,'島B：ケーブル＋モーター',{s:14,c:K.B,b:1});
return svg(420,'インバーター・ソフトスタータ：本体を切り離して入力側と出力側を分ける',s+foot(382,'本体は島に数えない。取説の指定で切り離し、外部配線とモーターを区分する'));}

const cases={
dol:{tab:'直入れ',title:'直入れ（MC1個＋サーマル）',islands:'島 1つ',points:'1点',fig:dol,
start:'MCを入れると、全電圧がそのままモーターにかかります。始動電流は大きく、定格の数倍になります。',
measure:'MC二次側のどれか1相に当てれば、サーマルのヒーターと巻線を通って三相分がつながるので、<b>巻線と配線の対地絶縁をまとめて</b>見られます。値は三相分が並列になった合成値です。',
miss:['巻線や配線が途中で断線していると、その先は届きません。不安なら先にテスターでU–V・V–W・W–Uの導通を確認。','端子箱の短絡片を外した6本口出しのモーターは、固定結線ではありません（スターデルタと同じく分けて考える）。','ブレーキ・スペースヒーター・温度検出など、別の回路は別の島です。']},
rev:{tab:'正逆',title:'正逆運転（MC2個）',islands:'島 1つ',points:'1点',fig:rev,
start:'正転用MCFと逆転用MCR。MCRは3相のうち2相を入れ替えて、同じモーターにつなぎます。両方が同時に入らないようインターロックをかけます。',
measure:'2台のMCの二次側は、どちらも同じモーター端子へ行きます。<b>どちらかの二次側で1点</b>当てれば、もう片方の二次側配線まで同じ島として入ります。',
miss:['「MCが2個＝島が2つ」ではありません。数えるのはMCの数ではなく、開いた接点で分かれた導体のかたまりです。','負荷が2台（交互運転など）なら別の島。負荷の台数は図面で確認します。']},
yd3:{tab:'Y–Δ 3MC',title:'スターデルタ（3コンタクタ：MCM・MCS・MCΔ）',islands:'島 3つ＋渡り線',points:'3点',fig:()=>yd(false),
start:'MCMとMCS（スター）で始動 → タイマーでMCSを開く → MCΔ（デルタ）を閉じて運転。始動電流・始動トルクとも直入れの約1/3です。MCSとMCMのどちらを先に入れるかは回路によります。',
measure:'停止中は3台とも開くので、巻線U–X・V–Y・W–Zがそれぞれ独立した島になります。<b>MCM二次側のU・V・Wに1点ずつ、計3点。</b>Uから当てると、U巻線と、X側の配線（MCS・MCΔの端子まで）が測れます。',
miss:['1点だけで終えると、V・W巻線が丸ごと測り残しになります。','MCSのスター点側の渡り線（島D）は、どこから当てても届きません。盤内の短い配線ですが、範囲外として意識しておきます。','MCΔの電源側端子は、MCMの一次側（上流）の島です。マグネット二次側の測定には入りません。'],
more:'タイマーとインターロックは主回路ではなく操作回路に描きます。動きは<a href="sequence-basics.html">リレーシーケンス教材の「スターデルタ」</a>で確認できます。'},
yd2:{tab:'Y–Δ 2MC',title:'スターデルタ（2コンタクタ：MCMなし）',islands:'島 3つ＋渡り線',points:'3点',fig:()=>yd(true),
start:'MCMを省いて、MCSとMCΔだけで切り替える方式です。U・V・Wはブレーカー（とサーマル）の二次側に直結。メーカー資料では、停止中も巻線に電圧がかかるため、あまり推奨されない方式とされています。',
measure:'U・V・W側に「マグネット二次側」がありません。<b>ブレーカーを開放してから、ブレーカー二次側のU・V・Wに1点ずつ、計3点。</b>島の分かれ方は3コンタクタと同じです。',
miss:['「MCが開いているから止まっている」は、無電圧の意味ではありません。ブレーカーが入っていれば巻線は充電されています。','島D（スター点の渡り線）は3コンタクタと同じく届きません。']},
reactor:{tab:'リアクトル',title:'リアクトル始動',islands:'島 1つ',points:'1点',fig:reactor,
start:'MCS（始動）でリアクトルを直列に入れて電圧を下げて始動 → 加速後、MCRN（運転）でリアクトルを短絡して全電圧運転。',
measure:'リアクトルの巻線は、直流では数Ω程度の導体です。モーターの固定結線と合わせて全部つながるので、<b>MCSかMCRNの二次側で1点</b>。値はリアクトルも含めた合成値です。',
miss:['値が低いとき、リアクトル・ケーブル・モーターのどれが原因かは、この1回では分かりません。切り離して区分します。','一次抵抗始動も、抵抗器が導体としてつながるので考え方は同じです。']},
kondorfer:{tab:'コンドルファ',title:'コンドルファ始動（単巻変圧器）',islands:'島 1つ＋渡り線',points:'1点',fig:kondorfer,
start:'MCS2で単巻変圧器の中性点を作り、MCS1で電源につないでタップ電圧で始動 → 加速後に中性点を開いてリアクトル状態にし、MCRNで全電圧運転へ。切替の途中で電流が切れないのが特徴です。接触器の名前と順序は、機種の図面で確認します。',
measure:'単巻変圧器のタップは、モーター端子に常につながっています。変圧器の巻線（電源側の端〜中性点側の端）もモーターも1つの島。<b>MCRNの二次側（モーター側）で1点</b>。',
miss:['変圧器の巻線も含むので、モーター単体より低い値になることがあります。','中性点側の渡り線（島D）は届きません。','単巻変圧器のタップ変更・点検で配線を外したままだと、つながり方が変わります。']},
wound:{tab:'巻線形',title:'巻線形モーターの二次抵抗始動',islands:'島 2つ',points:'2点',fig:wound,
start:'MCMで固定子に全電圧をかけ、回転子側に二次抵抗を入れて始動。加速に合わせて短絡用の接触器で抵抗を順に短絡します（図では短絡用接触器を省略）。',
measure:'固定子と回転子は磁気でつながっているだけで、電気的には別の回路です。<b>MCM二次側で1点（固定子）、スリップリングか二次抵抗器側で1点（回転子）</b>。',
miss:['MCM二次側だけで終えると、回転子回路が丸ごと測り残しになります。','回転子回路の試験電圧は、固定子とは別に銘板・取説で確認します。']},
inv:{tab:'インバーター',title:'インバーター・ソフトスタータ',islands:'本体は数えない',points:'区分して測る',fig:inv,
start:'半導体で電圧（インバーターは周波数も）を作って始動・運転します。ソフトスタータは始動後にバイパス接触器へ切り替えるものがあります。',
measure:'本体を導線のように扱いません。<b>取説の指定に従って切り離してから</b>、出力側のケーブル＋モーター（固定結線なら1点）と、入力側の配線を別々に測ります。本体の試験は機種ごとの方法で。',
miss:['接続したままメガーをかけると、本体の素子を傷めるおそれがあります。','制御端子・通信線にはメガー禁止の機種があります。']}
};
const order=['dol','rev','yd3','yd2','reactor','kondorfer','wound','inv'];
if(fig&&ans){
 const nav=document.getElementById('start-tabs');
 order.forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.dataset.start=k;b.textContent=(i+1)+'. '+cases[k].tab;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>show(k));nav.append(b);});
 function show(k){const c=cases[k];fig.innerHTML=c.fig();
  ans.innerHTML=`<h3>${c.title}</h3><p class="badges"><span class="badge">停止時：${c.islands}</span><span class="badge strong">当てる点：${c.points}</span></p><p><b>始動のしかた：</b>${c.start}</p><p><b>測り方：</b>${c.measure}</p><p><b>見落としやすいところ</b></p><ul>${c.miss.map(m=>'<li>'+m+'</li>').join('')}</ul>${c.more?'<p class="note">'+c.more+'</p>':''}`;
  nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.start===k)));}
 document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',()=>show(a.dataset.open)));
 const h=location.hash.replace('#m-','');show(cases[h]?h:'dol');
}

/* 1本で済む場合と、断線で島が割れる場合 */
const one=document.getElementById('one-figure');
if(one){const r=[100,160,220];let s=T(200,40,'健全なY結線',{b:1})+T(620,40,'U巻線が断線したY結線',{b:1})+`<line x1="410" y1="60" x2="410" y2="250" stroke="#ccd7df" stroke-width="2"/>`;
 r.forEach((y,i)=>{s+=W(`M40 ${y} H200`,K.A)+coil(200,y,5,K.A)+W(`M300 ${y} H330`,K.A)+T(30,y+5,ph[i],{a:'end',s:15,b:1})+T(450,y+5,ph[i],{a:'end',s:15,b:1});
  if(i===0)s+=W(`M460 ${y} H620`,K.B)+coil(620,y,2,K.B)+T(670,y+6,'×',{s:24,b:1,c:'#b91c1c'})+coil(680,y,2,K.A)+W(`M720 ${y} H750`,K.A);
  else s+=W(`M460 ${y} H620`,K.A)+coil(620,y,5,K.A)+W(`M720 ${y} H750`,K.A);});
 s+=W('M330 100 V220',K.A)+W('M750 100 V220',K.A)+pin(110,100,'①')+pin(530,160,'①')+T(540,88,'島B（孤立）',{s:14,c:K.B,b:1})+T(560,208,'島A',{s:14,c:K.A,b:1})+T(670,128,'断線',{s:14,c:'#b91c1c'});
 s+=T(200,272,'U・V・Wが巻線でつながる → 1点で3相分',{s:15})+T(620,272,'Vから当てても、U端子〜断線箇所は届かない',{s:15});
 one.innerHTML=`<svg viewBox="0 0 820 295" role="img" aria-label="健全なY結線は1点で3相分。U巻線が断線すると、U端子側だけが孤立した島になる">${s}</svg>`;}
})();
