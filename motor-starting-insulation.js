/* 始動方式別：メガーを当ててみる。
   回路のつながり（直流的な導通）から「島」を計算する教材モデルです。試験結線図・操作手順ではありません。 */
(()=>{'use strict';
const X=[120,160,200],RX=[262,298,334],PH=['R','S','T'],UVW=['U','V','W'],XYZ=['X','Y','Z'];
const PAL=['#087baf','#c2410c','#15803d','#7c3aed','#a16207','#0f766e','#be185d','#4d7c0f'];
const GREY='#8b97a4',LIVE='#dc2626',DANGER='#b45309',HIDE='#a3b1bf',INK='#1f3a4f',MUTED='#5b6b7a';
const LETTERS='ABCDEFGH';
const G={CB:{name:'ブレーカー',on:'入',off:'切'}};
const mcg=(name,svg)=>({name,svg,on:'閉',off:'開'});

/* ---------- 回路の組み立て ---------- */
function make(){const c={nodes:{},order:[],edges:[],deco:[],labels:[]};
 c.N=(id,x,y,o={})=>{c.nodes[id]={id,x,y,...o};c.order.push(id);return id;};
 c.E=(a,b,t,o={})=>{c.edges.push({a,b,t,...o});};
 c.D=s=>c.deco.push(s);
 c.L=(g,x,y,a='end')=>c.labels.push({g,x,y,a});
 return c;}
const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}"${o.c?` fill="${o.c}"`:''}${o.b?' font-weight="700"':''} style="font-size:${o.s||13}px">${s}</text>`;
const BOX=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="5 4"/>`;
const ids=p=>X.map((_,i)=>p+i);
const SHORT={name:'短絡線でまとめる',on:'あり',off:'なし'};
const short=(c,p)=>{c.E(p+0,p+1,'short',{g:'SHORT'});c.E(p+1,p+2,'short',{g:'SHORT'});};

function base(c,prim){
 X.forEach((x,i)=>{c.N('s'+i,x,14,{src:1});c.N('cbt'+i,x,36,{src:1});c.E('s'+i,'cbt'+i,'w');
  c.N('cbb'+i,x,72,{prim});c.E('cbt'+i,'cbb'+i,'sw',{g:'CB'});
  c.N('p1'+i,x,94,{prim,p:'ブレーカー二次 '+PH[i]});c.E('cbb'+i,'p1'+i,'w');});short(c,'p1');
 c.D(BOX(104,28,124,52));c.L('CB',100,52);c.D(T(100,19,'電源',{a:'end',s:12,c:MUTED}));}
function colMC(c,g,p2name,n1){
 X.forEach((x,i)=>{c.N(g+'t'+i,x,138);c.E('p1'+i,g+'t'+i,'w',{n:PH[i]+'相：'+n1,L:[x,116]});c.N(g+'b'+i,x,174);c.E(g+'t'+i,g+'b'+i,'sw',{g});
  c.N('p2'+i,x,196,{p:p2name+' '+UVW[i]});c.E(g+'b'+i,'p2'+i,'w');});short(c,'p2');
 c.D(BOX(104,130,124,52));c.L(g,100,154);}
function toMotor(c,from,yT,name,thrY=236,Ly=218){
 c.D(`<rect x="108" y="${thrY}" width="104" height="26" rx="6" fill="#e8eef3" stroke="#64748b" stroke-width="1.5"/>`);c.D(T(100,thrY+18,'THR',{a:'end'}));
 X.forEach((x,i)=>{c.N('mt'+i,x,yT,{term:1});c.E(from[i],'mt'+i,'w',{n:name.replace(/\{U\}/g,UVW[i]),L:[x,Ly]});});}
function motorY(c,yT,label='モーター'){
 const yB=yT+70,yS=yB+20;
 X.forEach((x,i)=>{c.N('mb'+i,x,yB);c.E('mt'+i,'mb'+i,'coil',{n:UVW[i]+'相巻線',brk:i===0});c.D(T(x+11,yT-4,UVW[i],{a:'start',s:12,b:1}));});
 c.N('star',160,yS);c.E('mb0','star','w',{pts:[[120,yS]],n:'スター点（モーター内部）'});c.E('mb1','star','w');c.E('mb2','star','w',{pts:[[200,yS]]});
 c.D(BOX(102,yT-12,128,yS-yT+24));c.D(T(100,yT+30,label,{a:'end'}));c.D(T(100,yT+46,'（固定Y結線）',{a:'end',s:11,c:MUTED}));}
function rightBlock(c,g,y,topTags,topTo,botTags,botTo,pre){
 RX.forEach((x,i)=>{c.N(pre+'q'+i,x,y-20);c.E(pre+'q'+i,topTo[i],'net');c.N(pre+'t'+i,x,y);c.E(pre+'q'+i,pre+'t'+i,'w');
  c.N(pre+'b'+i,x,y+36);c.E(pre+'t'+i,pre+'b'+i,'sw',{g});c.N(pre+'r'+i,x,y+56);c.E(pre+'b'+i,pre+'r'+i,'w');c.E(pre+'r'+i,botTo[i],'net');
  c.D(T(x,y-26,topTags[i],{s:12,b:1}));c.D(T(x,y+72,botTags[i],{s:12,b:1}));});
 c.D(BOX(248,y-8,112,52));c.L(g,366,y+16,'start');}

const C={
dol(){const c=make();c.groups={CB:G.CB,MC:mcg('MC'),SHORT};
 base(c,true);colMC(c,'MC','MC二次','ブレーカー二次〜MC一次の配線');
 toMotor(c,ids('p2'),290,'MC二次〜サーマル〜モーター端子');motorY(c,290);c.h=414;return c;},
rev(){const c=make();c.groups={CB:G.CB,MCF:mcg('MCF（正転）'),MCR:mcg('MCR（逆転）',['MCR','（逆転）']),SHORT};
 base(c,true);colMC(c,'MCF','MCF二次','ブレーカー二次〜MCF・MCR一次の配線');
 rightBlock(c,'MCR',138,PH,ids('p1'),['W','V','U'],['p22','p21','p20'],'r');
 toMotor(c,ids('p2'),290,'MCF・MCR二次〜サーマル〜モーター端子');motorY(c,290);c.h=414;return c;},
yd(two,v){const c=make();c.groups=Object.assign(two?{CB:G.CB,MCD:mcg('MCΔ'),MCS:mcg('MCS')}:{CB:G.CB,MCM:mcg('MCM'),MCD:mcg('MCΔ'),MCS:mcg('MCS')},{SHORT});
 base(c,!two);
 if(two)c.D(T(100,160,'（MCMなし）',{a:'end',s:12,c:MUTED}));else colMC(c,'MCM','MCM二次','ブレーカー二次〜MCM一次の配線');
 toMotor(c,ids(two?'p1':'p2'),290,two?'{U}相：ブレーカー二次〜サーマル〜{U}端子':'{U}相：MCM二次〜サーマル〜{U}端子');
 X.forEach((x,i)=>{c.N('mx'+i,x,360,{p:'モーター端子 '+XYZ[i],term:1});c.E('mt'+i,'mx'+i,'coil',{n:UVW[i]+'–'+XYZ[i]+'巻線',brk:i===0});
  c.D(T(x+11,286,UVW[i],{a:'start',s:12,b:1}));c.D(T(x+11,377,XYZ[i],{a:'start',s:12,b:1}));
  c.N('mst'+i,x,404);c.E('mx'+i,'mst'+i,'w',{n:XYZ[i]+'〜MCS・MCΔの端子',L:[x,384]});c.N('msb'+i,x,440);c.E('mst'+i,'msb'+i,'sw',{g:'MCS'});});
 short(c,'mx');c.N('js',160,460);c.E('msb0','js','w',{pts:[[120,460]],minor:1,n:'MCSの渡り線（スター点）',L:[140,460]});c.E('msb1','js','w',{minor:1});c.E('msb2','js','w',{pts:[[200,460]],minor:1});
 c.D(BOX(102,278,128,96));c.D(T(100,318,'モーター',{a:'end'}));c.D(T(100,334,'（6本口出し）',{a:'end',s:11,c:MUTED}));
 c.D(BOX(104,396,124,52));c.L('MCS',100,424);
 const fromB=v==='b'&&!two;
 rightBlock(c,'MCD',300,fromB?UVW:PH,ids(fromB?'p2':'p1'),['Z','X','Y'],['mx2','mx0','mx1'],'d');
 c.h=478;return c;},
reactor(){const c=make();c.groups={CB:G.CB,MCS:mcg('MCS（始動）'),MCRN:mcg('MCRN（運転）',['MCRN','（運転）']),SHORT};
 base(c,true);colMC(c,'MCS','MCS二次','ブレーカー二次〜MCS・MCRN一次の配線');
 X.forEach((x,i)=>{c.N('ra'+i,x,212);c.E('p2'+i,'ra'+i,'w');c.N('rz'+i,x,262);c.E('ra'+i,'rz'+i,'coil',{n:'リアクトル'});c.N('nn'+i,x,282);c.E('rz'+i,'nn'+i,'w');});
 c.D(T(100,242,'リアクトル',{a:'end'}));
 rightBlock(c,'MCRN',138,PH,ids('p1'),UVW,ids('nn'),'b');
 toMotor(c,ids('nn'),350,'MCS二次〜リアクトル〜サーマル〜モーター',298,334);motorY(c,350);c.h=474;return c;},
kondorfer(){const c=make();c.groups={CB:G.CB,MCRN:mcg('MCRN（運転）'),MCS1:mcg('MCS1'),MCS2:mcg('MCS2'),SHORT};
 base(c,true);colMC(c,'MCRN','MCRN二次','ブレーカー二次〜MCRN・MCS1一次の配線');
 toMotor(c,ids('p2'),290,'MCRN二次〜サーマル〜モーター');motorY(c,290);
 RX.forEach((x,i)=>{c.N('kq'+i,x,118);c.E('kq'+i,'p1'+i,'net');c.N('kt'+i,x,138);c.E('kq'+i,'kt'+i,'w');c.N('kb'+i,x,174);c.E('kt'+i,'kb'+i,'sw',{g:'MCS1'});
  c.N('ka'+i,x,192);c.E('kb'+i,'ka'+i,'w');c.N('kp'+i,x,240);c.E('ka'+i,'kp'+i,'coil',{n:'単巻変圧器の巻線'});c.N('kn'+i,x,288);c.E('kp'+i,'kn'+i,'coil',{n:'単巻変圧器の巻線'});
  c.N('kg'+i,x+16,240);c.E('kp'+i,'kg'+i,'w',{n:'タップ（モーター側へ）'});c.E('kg'+i,'p2'+i,'net');c.D(T(x+19,245,UVW[i],{a:'start',s:12,b:1}));
  c.N('k2t'+i,x,306);c.E('kn'+i,'k2t'+i,'w');c.N('k2b'+i,x,342);c.E('k2t'+i,'k2b'+i,'sw',{g:'MCS2'});c.D(T(x,112,PH[i],{s:12,b:1}));});
 c.N('kj',298,362);c.E('k2b0','kj','w',{pts:[[262,362]],minor:1,n:'MCS2の渡り線（中性点）',L:[280,362]});c.E('k2b1','kj','w',{minor:1});c.E('k2b2','kj','w',{pts:[[334,362]],minor:1});
 c.D(BOX(248,130,112,52));c.L('MCS1',366,154,'start');c.D(BOX(248,298,112,52));c.L('MCS2',366,322,'start');
 c.D(T(366,204,'単巻',{a:'start'}));c.D(T(366,220,'変圧器',{a:'start'}));c.h=414;return c;},
wound(){const c=make();c.groups={CB:G.CB,MCM:mcg('MCM'),SHORT};
 base(c,true);colMC(c,'MCM','MCM二次','ブレーカー二次〜MCM一次の配線');
 toMotor(c,ids('p2'),290,'MCM二次〜サーマル〜固定子');motorY(c,290,'固定子');
 c.N('rj',298,286);
 RX.forEach((x,i)=>{c.N('ra'+i,x,298);c.E('ra'+i,'rj','w',i===1?{n:'回転子のスター点'}:{pts:[[x,286]],n:'回転子のスター点',L:i===0?[280,286]:undefined});
  c.N('rb'+i,x,350);c.E('ra'+i,'rb'+i,'coil',{n:'回転子巻線'});c.N('sr'+i,x,370,{p:'スリップリング '+(i+1)});c.E('rb'+i,'sr'+i,'w');
  c.N('rr'+i,x,392);c.E('sr'+i,'rr'+i,'w',{n:'スリップリング・ブラシ'});c.N('rs'+i,x,440);c.E('rr'+i,'rs'+i,'res',{n:'二次抵抗器'});});
 c.N('rk',298,458);c.E('rs0','rk','w',{pts:[[262,458]]});c.E('rs1','rk','w');c.E('rs2','rk','w',{pts:[[334,458]]});
 c.D(BOX(246,274,116,196));c.D(T(366,326,'回転子',{a:'start'}));c.D(T(366,375,'リング',{a:'start'}));c.D(T(366,420,'抵抗器',{a:'start'}));c.h=482;return c;},
inv(){const c=make();c.groups={CB:G.CB,MC:mcg('MC'),LINK:{name:'端子',on:'接続',off:'外した'},SHORT};
 base(c,true);colMC(c,'MC','MC二次','ブレーカー二次〜MC一次の配線');
 X.forEach((x,i)=>{c.N('ia'+i,x,234);c.E('p2'+i,'ia'+i,'w',{n:UVW[i]+'相：MC二次〜インバーター入力の配線',L:[x,216]});
  c.N('ii'+i,x,254,{danger:1});c.E('ia'+i,'ii'+i,'link',{g:'LINK'});c.N('io'+i,x,306,{danger:1});
  c.N('ib'+i,x,326);c.E('io'+i,'ib'+i,'link',{g:'LINK'});c.N('ic'+i,x,344,{p:'出力側の線 '+UVW[i]});c.E('ib'+i,'ic'+i,'w');
  c.N('mt'+i,x,380,{term:1});c.E('ic'+i,'mt'+i,'w',{n:'出力ケーブル〜モーター端子',L:[x,362]});});short(c,'ic');
 c.D(`<rect x="104" y="254" width="116" height="52" rx="8" fill="#fdf2e9" stroke="${DANGER}" stroke-width="2.5"/>`);c.D(T(162,276,'インバーター等',{b:1,c:'#9a3412'}));c.D(T(162,294,'（電子回路）',{s:11,c:'#9a3412'}));
 c.L('LINK',100,248);c.L('LINK',100,322);motorY(c,380);c.h=504;return c;}
};
const METHODS=[
 {k:'dol',tab:'直入れ',build:()=>C.dol()},
 {k:'rev',tab:'正逆',build:()=>C.rev()},
 {k:'yd3',tab:'Y–Δ 3MC',build:v=>C.yd(false,v),variants:[['a','MCΔを電源側から（動画の形）'],['b','MCΔをMCM二次側から']]},
 {k:'yd2',tab:'Y–Δ 2MC',build:()=>C.yd(true)},
 {k:'reactor',tab:'リアクトル',build:()=>C.reactor()},
 {k:'kondorfer',tab:'コンドルファ',build:()=>C.kondorfer()},
 {k:'wound',tab:'巻線形',build:()=>C.wound()},
 {k:'inv',tab:'インバーター',build:()=>C.inv()}];

/* ---------- 島の計算（union-find） ---------- */
const conducts=(e,on,brk)=>e.t==='sw'||e.t==='link'||e.t==='short'?!!on[e.g]:e.brk?!brk:true;
function analyse(c,on,brk){
 const P={};c.order.forEach(id=>P[id]=id);const f=x=>P[x]===x?x:(P[x]=f(P[x]));
 c.edges.forEach(e=>{if(conducts(e,on,brk)){const a=f(e.a),b=f(e.b);if(a!==b)P[b]=a;}});
 const info={};const get=r=>info[r]||(info[r]={root:r,nodes:[],src:false,prim:false,dangerAny:false,dangerAll:true,names:[],edges:0,minorEdges:0});
 c.order.forEach(id=>{const n=c.nodes[id],k=get(f(id));k.nodes.push(id);if(n.src)k.src=true;if(n.prim)k.prim=true;if(n.danger)k.dangerAny=true;else k.dangerAll=false;});
 c.edges.forEach(e=>{if(e.t==='net'||e.t==='short'||!conducts(e,on,brk))return;const k=get(f(e.a));k.edges++;if(e.minor)k.minorEdges++;if(e.n&&!k.names.includes(e.n))k.names.push(e.n);});
 const islands=[];
 c.order.forEach(id=>{const k=info[f(id)];if(k.src||k.dangerAll||k.letter)return;k.letter=LETTERS[islands.length]||'?';k.color=PAL[islands.length%PAL.length];k.minor=k.edges>0&&k.edges===k.minorEdges;islands.push(k);});
 return {f,info,islands,live:on.CB};}

/* ---------- 描画 ---------- */
const pt=(c,id)=>c.nodes[id];
function coilPath(a,b,r,from=0,to=null){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,n=Math.max(2,Math.floor((L-8)/(2*r))),lead=(L-n*2*r)/2;
 if(to===null)to=n;const sx=a.x+ux*(lead+(from?from*2*r:0)),sy=a.y+uy*(lead+(from?from*2*r:0));
 let d=from?`M${sx} ${sy}`:`M${a.x} ${a.y} L${sx} ${sy}`;for(let k=from;k<to;k++)d+=` a${r} ${r} 0 0 1 ${ux*2*r} ${uy*2*r}`;if(to===n)d+=` L${b.x} ${b.y}`;return {d,n,lead,ux,uy};}
function resPath(a,b){const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,px=-uy,py=ux,z=7,seg=(L-16)/z;let d=`M${a.x} ${a.y} L${a.x+ux*8} ${a.y+uy*8}`;
 for(let k=1;k<z;k++){const o=k%2?7:-7;d+=` L${a.x+ux*(8+seg*k)+px*o} ${a.y+uy*(8+seg*k)+py*o}`;}return d+` L${a.x+ux*(L-8)} ${a.y+uy*(L-8)} L${b.x} ${b.y}`;}
function blade(a,b,closed){if(closed)return `M${a.x} ${a.y} L${b.x} ${b.y}`;const dx=b.x-a.x,dy=b.y-a.y,g=-0.56,cs=Math.cos(g),sn=Math.sin(g);return `M${a.x} ${a.y} l${(dx*cs-dy*sn)*.9} ${(dx*sn+dy*cs)*.9}`;}

function render(c,st,an){
 const measured=new Map();st.meas.forEach((m,i)=>{if(!m.bad&&!measured.has(m.root))measured.set(m.root,i);});
 const lastRoot=st.meas.length?st.meas[st.meas.length-1].root:null;
 const col=r=>{const k=an.info[r];if(k.src)return an.live?LIVE:GREY;if(k.dangerAll)return DANGER;if(st.practice&&!st.reveal&&!measured.has(r))return HIDE;return k.color||GREY;};
 const dash=r=>an.info[r].src?' stroke-dasharray="7 5"':'';
 const fade=r=>{const k=an.info[r];if(k.src||st.practice||!st.meas.length||measured.has(r))return '';return ' opacity=".32"';};
 const path=(d,r,w=4.5)=>`<path d="${d}" fill="none" stroke="${col(r)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash(r)}${fade(r)}/>`;
 let under='',s='',dots='';
 const deg={};c.edges.forEach(e=>{if(e.t==='net'||e.t==='short')return;deg[e.a]=(deg[e.a]||0)+1;deg[e.b]=(deg[e.b]||0)+1;});
 c.edges.forEach(e=>{if(e.t==='net'||(e.t==='short'&&!st.on.SHORT))return;const a=pt(c,e.a),b=pt(c,e.b),ra=an.f(e.a),rb=an.f(e.b);
  if(e.t==='w'){const p=[a,...(e.pts||[]).map(([x,y])=>({x,y})),b];const d='M'+p.map(q=>q.x+' '+q.y).join(' L');s+=path(d,ra);if(lastRoot===ra&&!st.practice)under+=`<path d="${d}" fill="none" stroke="${col(ra)}" stroke-width="12" stroke-linecap="round" opacity=".18"/>`;}
  else if(e.t==='coil'){if(e.brk&&st.brk){const g=coilPath(a,b,7);const h=Math.floor((g.n-1)/2);s+=path(coilPath(a,b,7,0,h).d,ra);const p2=coilPath(a,b,7,h+1,g.n);s+=path(p2.d,rb);const mx=a.x+g.ux*(g.lead+(h+.5)*14),my=a.y+g.uy*(g.lead+(h+.5)*14);s+=`<text x="${mx}" y="${my+6}" text-anchor="middle" fill="#b91c1c" font-weight="700" style="font-size:17px">×</text>`;}
   else{const d=coilPath(a,b,7).d;s+=path(d,ra);if(lastRoot===ra&&!st.practice)under+=`<path d="${d}" fill="none" stroke="${col(ra)}" stroke-width="12" opacity=".18"/>`;}}
  else if(e.t==='short'){s+=`<path d="M${a.x} ${a.y} Q${(a.x+b.x)/2} ${a.y-20} ${b.x} ${b.y}" fill="none" stroke="${col(ra)}" stroke-width="2.6" stroke-dasharray="3 3"${fade(ra)}/>`;}
  else if(e.t==='res'){s+=path(resPath(a,b),ra,3.5);}
  else if(e.t==='sw'){s+=path(blade(a,b,!!st.on[e.g]),ra,3.5);dots+=`<circle cx="${a.x}" cy="${a.y}" r="3.8" fill="${col(ra)}"${fade(ra)}/><circle cx="${b.x}" cy="${b.y}" r="3.8" fill="${col(rb)}"${fade(rb)}/>`;}
  else if(e.t==='link'){if(st.on[e.g])s+=path(`M${a.x} ${a.y} L${b.x} ${b.y}`,ra);else s+=`<text x="${a.x+12}" y="${(a.y+b.y)/2+4}" text-anchor="start" fill="${MUTED}" style="font-size:11px">外</text>`;dots+=`<circle cx="${a.x}" cy="${a.y}" r="3.8" fill="${col(ra)}"${fade(ra)}/><circle cx="${b.x}" cy="${b.y}" r="3.8" fill="${col(rb)}"${fade(rb)}/>`;}});
 c.order.forEach(id=>{const n=c.nodes[id];if((deg[id]||0)>=3||n.term)dots+=`<circle cx="${n.x}" cy="${n.y}" r="4" fill="${col(an.f(id))}"${fade(an.f(id))}/>`;});
 // 島の名前（バッジ）
 let badges='';const placed=new Set();
 c.edges.forEach(e=>{if(!e.L||e.t==='net')return;const r=an.f(e.a),k=an.info[r];if(!k.letter||placed.has(r))return;if(st.practice&&!st.reveal&&!measured.has(r))return;placed.add(r);
  badges+=`<g${fade(r)}><circle cx="${e.L[0]}" cy="${e.L[1]}" r="9.5" fill="${k.color}" stroke="#fff" stroke-width="2.5"/><text x="${e.L[0]}" y="${e.L[1]+4.5}" text-anchor="middle" fill="#fff" font-weight="700" style="font-size:12px">${k.letter}</text></g>`;});
 // 当てる点
 let probes='';c.order.forEach(id=>{const n=c.nodes[id];if(!n.p)return;const idx=st.meas.findIndex(m=>m.node===id);const on=idx>=0;
  probes+=`<g class="sim-probe" data-probe="${id}" role="button" tabindex="0" aria-label="${n.p}に当てる${on?'（'+(idx+1)+'点目）':''}"><circle cx="${n.x}" cy="${n.y}" r="16" fill="transparent"/><circle cx="${n.x}" cy="${n.y}" r="8.5" fill="${on?'#0f2a3d':'#fff'}" stroke="#0f2a3d" stroke-width="2.4"/>${on?`<text x="${n.x}" y="${n.y+4}" text-anchor="middle" fill="#fff" font-weight="700" style="font-size:11px">${idx+1}</text>`:''}</g>`;});
 let labels='';c.labels.forEach(l=>{const g=c.groups[l.g];if(!g)return;const on=!!st.on[l.g],lines=g.svg||[g.name];lines.forEach((t,j)=>{labels+=T(l.x,l.y+16*j,t,{a:l.a,s:j?12:13});});labels+=T(l.x,l.y+16*lines.length,'（'+(on?g.on:g.off)+'）',{a:l.a,s:12,c:on?(l.g==='CB'?LIVE:'#0f766e'):MUTED,b:on});});
 return `<svg viewBox="0 0 420 ${c.h}" role="group" aria-label="主回路の概念図。白い丸をタップすると、そこにLINE側を当てたときに届く範囲を表示">${c.deco.join('')}${under}${s}${dots}${badges}${labels}${probes}</svg>`;}

/* ---------- 解説 ---------- */
const TXT={
dol:{title:'直入れ（MC1個＋サーマル）',start:'MCを入れると、全電圧がそのままモーターにかかります。始動電流は定格の数倍になります。',
 measure:'MC二次側のどれか1相に当てれば、サーマルのヒーターと巻線を通って三相分に届きます。<b>マグネット二次側は1点</b>。一方、ブレーカー二次〜MC一次は負荷がつながっていないケーブルだけの区間なので、<b>相ごとに別の島（3つ）</b>。回路全体を島ごとに測るなら<b>4点</b>、短絡線で3線をまとめれば一次側は1回です。',
 miss:['一次側を1本で済ませると、残り2相の配線が測り残しになります。','巻線・配線が途中で断線していると、その先は届きません（「U相巻線：断線」で試せます）。','短絡片を外した6本口出しのモーターは、固定結線ではありません。','ブレーキ・スペースヒーター・温度検出は別の回路です。']},
rev:{title:'正逆運転（MCF・MCR）',start:'正転用MCFと逆転用MCR。MCRは2相を入れ替えて同じモーターにつなぎます。両方が同時に入らないようインターロックをかけます。',
 measure:'2台の二次側はどちらも同じモーター端子へ行くので、<b>マグネット二次側は1点</b>。一次側は2台で共通ですが、相ごとに別の島なので3つ。<b>回路全体で4点</b>です。',
 miss:['「MCが2個＝島が2つ」ではありません。数えるのは開いた接点で分かれた導体のかたまりです。','負荷が2台（交互運転など）なら別の島です。']},
yd3:{title:'スターデルタ（3コンタクタ：MCM・MCS・MCΔ）',start:'MCMとMCS（スター）で始動 → タイマーでMCSを開く → MCΔを閉じてデルタ運転。始動電流・始動トルクとも直入れの約1/3です。MCSとMCMのどちらを先に入れるかは回路によります。',
 measure:'停止中は3台とも開くので、U–X・V–Y・W–Zの巻線がそれぞれ独立した島になります。<b>マグネット二次側は3点＋スター点の渡り線</b>。一次側の3つを足すと<b>回路全体は6点＋渡り線</b>。MCΔのつなぎ方を切り替えると、MCΔの一次側がどの島に入るかが変わります（島の数は同じ）。',
 miss:['1点だけで終えると、V・W巻線が丸ごと測り残しになります。','MCSの渡り線（スター点）は、どこから当てても届きません。','「MCSを閉」にすると3つの巻線がスター点でつながり、1つの島になります。停止中の状態と取り違えないように。'],
 more:'タイマーとインターロックは主回路ではなく操作回路に描きます。動きは<a href="sequence-basics.html">リレーシーケンス教材の「スターデルタ」</a>で確認できます。'},
yd2:{title:'スターデルタ（2コンタクタ：MCMなし）',start:'MCMを省いて、MCSとMCΔだけで切り替える方式です。U・V・Wはブレーカー（とサーマル）の二次側に直結。メーカー資料では、停止中も巻線に電圧がかかるため、あまり推奨されない方式とされています。',
 measure:'U・V・W側に「マグネット二次側」がありません。<b>ブレーカーを切ってから、ブレーカー二次側のR・S・Tに1点ずつ、計3点＋渡り線</b>。一次側の区間がないので、これで回路全体です。',
 miss:['「ブレーカー：入」にしてみてください。MCが全部開いていても、巻線まで赤（充電中）になります。','島D（スター点の渡り線）は3コンタクタと同じく届きません。']},
reactor:{title:'リアクトル始動',start:'MCS（始動）でリアクトルを直列に入れて電圧を下げて始動 → 加速後、MCRN（運転）でリアクトルを短絡して全電圧運転。',
 measure:'リアクトルの巻線は直流では数Ω程度の導体です。モーターの固定結線と合わせて全部つながるので、<b>マグネット二次側は1点</b>（MCSかMCRNの二次側）。一次側の3つを足して<b>回路全体は4点</b>。値はリアクトルも含めた合成値です。',
 miss:['値が低いとき、リアクトル・ケーブル・モーターのどれが原因かは、この1回では分かりません。','一次抵抗始動も、抵抗器が導体としてつながるので考え方は同じです。']},
kondorfer:{title:'コンドルファ始動（単巻変圧器）',start:'MCS2で単巻変圧器の中性点を作り、MCS1で電源につないでタップ電圧で始動 → 加速後に中性点を開いてリアクトル状態にし、MCRNで全電圧運転へ。切替の途中で電流が切れないのが特徴です。接触器の名前と順序は機種の図面で確認します。',
 measure:'単巻変圧器のタップはモーター側に常につながっています。変圧器の巻線（電源側の端〜中性点側の端）もモーターも1つの島。<b>マグネット二次側は1点＋中性点の渡り線</b>、一次側の3つを足して<b>回路全体は4点＋渡り線</b>。',
 miss:['変圧器の巻線も含むので、モーター単体より低い値になることがあります。','中性点側の渡り線は届きません。']},
wound:{title:'巻線形モーターの二次抵抗始動',start:'MCMで固定子に全電圧をかけ、回転子側に二次抵抗を入れて始動。加速に合わせて短絡用の接触器で抵抗を順に短絡します（図では短絡用接触器を省略）。',
 measure:'固定子と回転子は磁気でつながっているだけで、電気的には別の回路です。<b>MCM二次側で1点（固定子）、スリップリング側で1点（回転子）</b>。一次側の3つを足して<b>回路全体は5点</b>。',
 miss:['MCM二次側だけで終えると、回転子回路が丸ごと測り残しになります。','回転子回路の試験電圧は、固定子とは別に銘板・取説で確認します。']},
inv:{title:'インバーター・ソフトスタータ',start:'半導体で電圧（インバーターは周波数も）を作って始動・運転します。',
 measure:'本体は島として数えず、<b>取説の指定に従って端子から外してから</b>、入力側の配線と、出力側のケーブル＋モーターを別々に測ります。外した入力側の配線は負荷がないので相ごとに別の島（3つ）、出力側はモーターでつながって1つ。「端子：接続」にして当てると、本体の端子に試験電圧がかかる警告が出ます。',
 miss:['接続したままメガーをかけると、本体の素子を傷めるおそれがあります。','制御端子・通信線にはメガー禁止の機種があります。'],
 more:'詳しくは<a href="insulation-resistance-principle.html#scope-inverter">絶縁抵抗の原理：インバーターがあるとき</a>へ。'}};

/* ---------- 画面 ---------- */
const host=document.getElementById('sim');
if(host){
 const $=id=>document.getElementById(id);
 const tabs=$('start-tabs'),fig=$('start-figure'),ctrl=$('sim-controls'),status=$('sim-status'),ans=$('start-answer'),list=$('sim-probes');
 const st={k:'dol',v:'a',on:{},brk:false,meas:[],practice:false,reveal:false,msg:''};
 let cur,an;
 const method=()=>METHODS.find(m=>m.k===st.k);
 function rebuild(){cur=method().build(st.v);recalc();}
 function recalc(){an=analyse(cur,st.on,st.brk);st.meas.forEach(m=>{m.root=an.f(m.node);});draw();}
 function reset(msg){st.meas=[];st.reveal=false;st.msg=msg||'';}
 function choose(k){st.k=k;st.v='a';st.on={};st.brk=false;reset();rebuild();
  tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.start===k)));
  const t=TXT[k];ans.innerHTML=`<h3>${t.title}</h3><p><b>始動のしかた：</b>${t.start}</p><p><b>測り方：</b>${t.measure}</p><p><b>見落としやすいところ</b></p><ul>${t.miss.map(m=>'<li>'+m+'</li>').join('')}</ul>${t.more?'<p class="note">'+t.more+'</p>':''}`;}
 function probe(id){const r=an.f(id),k=an.info[r],n=cur.nodes[id];
  if(st.meas.some(m=>m.node===id)){st.meas=st.meas.filter(m=>m.node!==id);st.msg=n.p+' の点を外しました。';draw();return;}
  if(k.src){st.msg='⚠ '+n.p+'：ブレーカーが入っていて電圧がかかっています。測定しません。ブレーカーを切ってから。';draw();return;}
  if(k.dangerAny){st.msg='⚠ '+n.p+'：インバーター本体の端子とつながっています。接続したまま試験電圧をかけない。端子から外してから測ります。';draw();return;}
  const dup=st.meas.find(m=>m.root===r);st.meas.push({node:id,root:r});
  st.msg=dup?`${st.meas.length}点目（${n.p}）：${cur.nodes[dup.node].p}と同じ島です。測定範囲は増えません。`:`${st.meas.length}点目（${n.p}）→ 島${k.letter}に届きました。`;draw();}
 function draw(){fig.innerHTML=render(cur,st,an);
  // 操作ボタン
  const m=method();let h='';
  if(m.variants)h+=`<div class="sim-row" role="group" aria-label="MCΔのつなぎ方">${m.variants.map(([v,l])=>`<button type="button" data-variant="${v}" aria-pressed="${st.v===v}">${l}</button>`).join('')}</div>`;
  h+=`<div class="sim-row" role="group" aria-label="接点の状態">${Object.entries(cur.groups).map(([g,o])=>`<button type="button" data-group="${g}" aria-pressed="${!!st.on[g]}">${o.name}：${st.on[g]?o.on:o.off}</button>`).join('')}${cur.edges.some(e=>e.brk)?`<button type="button" data-brk aria-pressed="${st.brk}">U相巻線：${st.brk?'断線':'健全'}</button>`:''}</div>`;
  h+=`<div class="sim-row" role="group" aria-label="モード"><button type="button" data-practice aria-pressed="${st.practice}">練習モード（島を隠す）：${st.practice?'ON':'OFF'}</button><button type="button" data-reset>点をリセット</button>${st.practice&&!st.reveal?'<button type="button" data-reveal>答えを見る</button>':''}${Object.keys(st.on).some(g=>st.on[g])||st.brk?'<button type="button" data-stop>停止中の状態に戻す</button>':''}</div>`;
  ctrl.innerHTML=h;
  // 状態
  const isl=an.islands,minor=isl.filter(k=>k.minor).length,sec=isl.filter(k=>!k.prim),got=new Set(st.meas.map(m=>m.root));
  const all=isl.length>0&&isl.every(k=>got.has(k.root)),show=!st.practice||st.reveal||all;
  let o='';
  if(st.on.SHORT)o+='<p class="sim-alert">短絡線あり：まとめた線どうし（相間）の絶縁は見ていません。測定後は必ず外して本数を照合（外し忘れは投入時の短絡事故）。</p>';
  if(st.on.CB)o+='<p class="sim-alert">⚠ ブレーカーが入っています。赤い破線は電圧がかかっている範囲です。この状態では測定しません。</p>';
  if(show)o+=`<p class="sim-count">この状態の島：<b>${isl.length}</b>${minor?`（うち渡り線だけ ${minor}）`:''}　／　一次側を除くと：<b>${sec.length}</b></p>`;
  else o+='<p class="sim-count">島の数は隠しています。白い丸をタップして、全部の島に届く最少の点を探してください。</p>';
  o+=`<p class="sim-msg" aria-live="polite">${st.msg||'白い丸（当てる点）をタップすると、そこにLINE側を当てたとき届く範囲が光ります。もう一度タップで外せます。'}</p>`;
  if(all&&st.meas.length)o+=`<p class="sim-done">✓ 全部の島に届きました。${st.meas.length}点${st.meas.length>isl.length?`（最少は${isl.length}点。同じ島に当てた点があります）`:'（最少）'}</p>`;
  const rows=isl.filter(k=>show||got.has(k.root)).map(k=>{const i=st.meas.findIndex(m=>m.root===k.root);
   return `<li><span class="chip" style="background:${k.color}">${k.letter}</span><span>${k.prim?'<em>一次側</em> ':''}${k.minor?'<em>渡り線だけ</em> ':''}${k.names.join('・')||'（配線のみ）'}</span><b>${i>=0?'✓ '+(i+1)+'点目':'未測定'}</b></li>`;}).join('');
  if(rows)o+=`<ul class="island-list">${rows}</ul>`;
  status.innerHTML=o;
  list.innerHTML=cur.order.filter(id=>cur.nodes[id].p).map(id=>{const i=st.meas.findIndex(m=>m.node===id);return `<button type="button" data-probe="${id}" aria-pressed="${i>=0}">${cur.nodes[id].p}${i>=0?'（'+(i+1)+'）':''}</button>`;}).join('');}
 METHODS.forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.dataset.start=m.k;b.textContent=(i+1)+'. '+m.tab;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>choose(m.k));tabs.append(b);});
 host.addEventListener('click',e=>{const t=e.target.closest('[data-probe],[data-group],[data-variant],[data-brk],[data-practice],[data-reset],[data-reveal],[data-stop]');if(!t||!host.contains(t))return;
  if(t.dataset.probe){probe(t.dataset.probe);return;}
  if(t.dataset.group){const g=t.dataset.group;st.on[g]=!st.on[g];reset(`${cur.groups[g].name}を「${st.on[g]?cur.groups[g].on:cur.groups[g].off}」にしました。つながりが変わるので、点をリセットしました。`);recalc();return;}
  if(t.dataset.variant){st.v=t.dataset.variant;reset('MCΔのつなぎ方を切り替えました。');rebuild();return;}
  if(t.hasAttribute('data-brk')){st.brk=!st.brk;reset(st.brk?'U相巻線を断線させました。島が増えます。':'断線を戻しました。');recalc();return;}
  if(t.hasAttribute('data-practice')){st.practice=!st.practice;reset(st.practice?'練習モード：島の色を隠しました。全部の島に届く最少の点を探してください。':'練習モードを終了しました。');draw();return;}
  if(t.hasAttribute('data-reset')){reset('点をリセットしました。');draw();return;}
  if(t.hasAttribute('data-reveal')){st.reveal=true;st.msg='答え：色ごとに1つの島です。';draw();return;}
  if(t.hasAttribute('data-stop')){st.on={};st.brk=false;reset('停止中（全部開・切）の状態に戻しました。');recalc();}});
 host.addEventListener('keydown',e=>{const t=e.target.closest('.sim-probe');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();probe(t.dataset.probe);}});
 document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',()=>choose(a.dataset.open)));
 const h=location.hash.replace('#m-','');choose(METHODS.some(m=>m.k===h)?h:'dol');
}

/* ---------- 1本で済む場合と、断線で島が割れる場合（静的な図） ---------- */
const one=document.getElementById('one-figure');
if(one){const W=(d,cl)=>`<path d="${d}" fill="none" stroke="${cl}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
 const coil=(x,y,n,cl)=>{let d=`M${x} ${y}`;for(let i=0;i<n;i++)d+=' a10 10 0 0 1 20 0';return W(d,cl);};
 const pin=(x,y)=>`<circle cx="${x}" cy="${y}" r="13" fill="#fff" stroke="#0f2a3d" stroke-width="3"/><text x="${x}" y="${y+6}" text-anchor="middle" font-weight="700" fill="#0f2a3d">1</text>`;
 const A=PAL[0],B=PAL[1],r=[100,160,220];let s=T(200,40,'健全なY結線',{b:1,s:16})+T(620,40,'U巻線が断線したY結線',{b:1,s:16})+'<line x1="410" y1="60" x2="410" y2="250" stroke="#ccd7df" stroke-width="2"/>';
 r.forEach((y,i)=>{s+=W(`M40 ${y} H200`,A)+coil(200,y,5,A)+W(`M300 ${y} H330`,A)+T(30,y+5,UVW[i],{a:'end',s:15,b:1})+T(450,y+5,UVW[i],{a:'end',s:15,b:1});
  if(i===0)s+=W(`M460 ${y} H620`,B)+coil(620,y,2,B)+T(670,y+7,'×',{s:24,b:1,c:'#b91c1c'})+coil(680,y,2,A)+W(`M720 ${y} H750`,A);
  else s+=W(`M460 ${y} H620`,A)+coil(620,y,5,A)+W(`M720 ${y} H750`,A);});
 s+=W('M330 100 V220',A)+W('M750 100 V220',A)+pin(110,100)+pin(530,160)+T(540,88,'島B（孤立）',{s:14,c:B,b:1})+T(560,208,'島A',{s:14,c:A,b:1})+T(670,130,'断線',{s:13,c:'#b91c1c'});
 s+=T(200,272,'U・V・Wが巻線でつながる → 1点で3相分',{s:15})+T(620,272,'Vから当てても、U端子〜断線箇所は届かない',{s:15});
 one.innerHTML=`<svg viewBox="0 0 820 295" role="img" aria-label="健全なY結線は1点で3相分。U巻線が断線すると、U端子側だけが孤立した島になる">${s}</svg>`;}

/* ---------- 島ごとの値を合成する ---------- */
const calc=document.getElementById('ir-calc');
if(calc){const out=document.getElementById('ir-result'),sel=document.getElementById('ir-class');
 const upd=()=>{const vals=[...calc.querySelectorAll('input[data-ir]')].map(i=>i.value.trim()).filter(v=>v!=='');
  const lim=Number(sel.value),nums=vals.map(v=>Number(v.replace(/[，,]/g,'.')));
  if(!vals.length){out.innerHTML='島ごとの測定値（MΩ）を入れると、回路全体の対地絶縁抵抗（並列の合成値）を計算します。';return;}
  if(nums.some(n=>!Number.isFinite(n)||n<0)){out.innerHTML='<b class="warn">0以上の数値（MΩ）を入れてください。</b>';return;}
  const zero=nums.some(n=>n===0);const R=zero?0:1/nums.reduce((a,n)=>a+1/n,0);const min=Math.min(...nums);
  const fmt=v=>v>=100?v.toFixed(0):v>=10?v.toFixed(1):v>=1?v.toFixed(2):v.toFixed(3);
  const ok=R>=lim,minOk=min>=lim;
  out.innerHTML=`<p class="ir-big">合成値 ≒ <b>${fmt(R)} MΩ</b>（${nums.length}つの島）</p><p>比べる値：<b>${lim} MΩ</b> → 合成値は <b class="${ok?'okc':'warn'}">${ok?'上回る':'下回る'}</b>。いちばん低い島は ${fmt(min)} MΩ。</p>${!ok&&minOk?'<p class="warn"><b>島ごとに見るとどれも上回るのに、合成すると下回ります。</b>運転中はこれらが1つの電路としてつながるので、合成値で考えるのが安全側です。</p>':''}<p class="note">上限超え（∞）の島は、表示上限の値を入れると安全側の計算になります。判定の扱いは保安規程・社内基準を優先してください。</p>`;};
 calc.addEventListener('input',upd);sel.addEventListener('change',upd);upd();}

if(typeof window!=='undefined')window.UkiwaMotorIslands={METHODS,analyse};
})();
