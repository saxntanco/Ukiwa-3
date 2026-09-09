/* Ukiwa CT 1.0.0: pure calculation, no equipment control. */
(function(root){
'use strict';
const catalog=Object.freeze({models:'三菱 CD-10ANB / CD-10CNB',primary:Object.freeze([20,30,40,50,60,75,80,100,150,200]),secondary:5,maxCircuitVoltage:6600,edition:'Y-0550U・2018年9月',page:'冊子42–43頁（PDF44–45頁）',checked:'2026-09-09',source:'https://www.mitsubishielectric.co.jp/dl/fa/document/catalog/pmd/ym-c-y-0550/y0550u1809.pdf#page=44'});
function number(value,label,{zero=false,max=1e12,integer=false}={}){
 const s=String(value??'').trim();if(!s)throw Error(label+'を入力してください。');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))throw Error(label+'は数値で入力してください。');
 const n=Number(s);if(!Number.isFinite(n)||n>max||(zero?n<0:n<=0)||(integer&&!Number.isSafeInteger(n)))throw Error(label+'は'+(zero?'0以上':'0より大きい')+(integer?'整数':'数値')+'で入力してください（上限 '+max+'）。');return n;
}
function finite(n){if(!Number.isFinite(n))throw Error('計算できる数値の範囲を超えました。入力を確認してください。');return n;}
function secondary(v){const s=number(v,'定格二次電流');if(s!==1&&s!==5)throw Error('定格二次電流は5Aまたは1Aを選んでください。');return s;}
function convert({primary,secondary:sec,direction,current}){
 const p=number(primary,'定格一次電流'),s=secondary(sec),i=number(current,'換算する電流',{zero:true});
 if(!['toSecondary','toPrimary'].includes(direction))throw Error('換算方向を選んでください。');
 const ratio=p/s,result=finite(direction==='toSecondary'?i/ratio:i*ratio);
 return {primary:p,secondary:s,ratio,input:i,result,direction,overRated:direction==='toSecondary'?i>p:i>s};
}
const polar=(m,a)=>[m*Math.cos(a),m*Math.sin(a)],deg=a=>a*Math.PI/180;
function rowCurrent(row,v,mode){
 if(!['single','three'].includes(row.phase))throw Error('単相／三相を選んでください。');
 const capacity=number(row.capacity,'1台の容量[kVA]'),count=number(row.count,'台数',{integer:true,max:10000});
 const rated=finite(capacity*1000/(v*(row.phase==='three'?Math.sqrt(3):1)));
 const base={phase:row.phase,connection:row.connection,capacity,count,rated};
 let rate=100,pf=1,angle=0;
 if(mode==='detailed')try{
  rate=number(row.rate,'負荷率[%]',{zero:true,max:100});pf=number(row.pf,'力率',{max:1});
  if(!['lag','lead'].includes(row.pfDirection))throw Error('力率の遅れ／進みを選んでください。');
  angle=Math.acos(pf)*(row.pfDirection==='lag'?1:-1);
 }catch(e){return {...base,total:null,missing:e.message};}
 const total=finite(rated*count*rate/100);let currents=[[0,0],[0,0],[0,0]],missing=null;
 if(row.phase==='three')currents=[polar(total,-angle),polar(total,deg(-120)-angle),polar(total,deg(120)-angle)];
 else{const pair={RS:[0,1,30],ST:[1,2,-90],TR:[2,0,150]}[row.connection];if(!pair)missing='単相変圧器の高圧側接続相を確認してください。';else{const q=polar(total,deg(pair[2])-angle);currents[pair[0]]=q;currents[pair[1]]=[-q[0],-q[1]];}}
 return {...base,total,rate,pf,pfDirection:row.pfDirection,currents,missing};
}
function load({voltage,mode,rows}){
 const v=number(voltage,'受電電圧[V]');if(!['rated','detailed','unknown'].includes(mode))throw Error('計算の前提を選んでください。');
 if(!Array.isArray(rows)||!rows.length)throw Error('変圧器を1行以上追加してください。');
 const individual=rows.map((r,index)=>{try{return {index,...rowCurrent(r,v,mode)};}catch(e){return {index,error:e.message};}});
 const errors=individual.filter(r=>r.error).map(r=>'変圧器'+(r.index+1)+'：'+r.error),missing=individual.filter(r=>r.missing).map(r=>'変圧器'+(r.index+1)+'：'+r.missing);
 if(mode==='unknown')missing.push('負荷条件が不明のため、個別の定格電流まで表示します。');
 if(errors.length||missing.length)return {voltage:v,mode,individual,errors,missing,lines:null,max:null};
 const phasors=individual.reduce((sum,r)=>sum.map((q,j)=>[q[0]+r.currents[j][0],q[1]+r.currents[j][1]]),[[0,0],[0,0],[0,0]]);
 const lines=phasors.map(q=>finite(Math.hypot(...q)));return {voltage:v,mode,individual,errors,missing,phasors,lines,max:Math.max(...lines)};
}
function parseSeries(raw){const s=String(raw??'').trim();if(!s)throw Error('資料で確認した定格候補を入力してください。');const items=s.split(/[,、\s]+/);if(items.length>100)throw Error('定格候補は100個以内にしてください。');return [...new Set(items.map(x=>number(x,'定格候補')))].sort((a,b)=>a-b);}
function candidates({current,margin,secondary:sec,voltage,source='catalog',customSeries,customReference}){
 const i=number(current,'基準電流',{zero:true}),m=number(margin,'余裕倍率',{max:10}),s=secondary(sec),v=number(voltage,'受電電圧');
 if(m<1)throw Error('余裕倍率は1以上にしてください。');if(i===0)throw Error('基準電流が0Aのため、CT候補は提示しません。');let series;
 if(source==='catalog'){if(s!==5)throw Error('登録品は5A二次です。1A二次品は候補の資料を「手入力」に切り替えてください。');if(v>6600)throw Error('登録品は6,600V以下の回路向けです。この電圧では別型式の資料を確認してください。');series=catalog.primary;}
 else if(source==='custom'){if(!String(customReference??'').trim())throw Error('メーカー・型式・根拠資料を入力してください。');series=parseSeries(customSeries);}
 else throw Error('候補の資料を選んでください。');
 const target=finite(i*m),tolerance=16*Number.EPSILON*Math.max(1,target),eligible=series.filter(p=>p>=target-tolerance);
 return {current:i,margin:m,secondary:s,target,series:[...series],eligible,first:eligible[0]??null,source,comparison:eligible.slice(0,3).map(p=>({primary:p,secondary:s,ratio:p/s,currentSecondary:i*s/p}))};
}
const api=Object.freeze({catalog,number,convert,load,candidates,parseSeries});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.UkiwaCT=api;
})(typeof globalThis!=='undefined'?globalThis:this);
