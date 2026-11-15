/* 組作業カレンダー（うきわの隠れ家版）
   予定表は、この端末のブラウザの中だけで読みます。外部への通信はページの CSP（connect-src 'none'）で止めています。 */
(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var files=[], seq=0, book={};
var CLAUDE_URL='https://claude.ai/artifact/2WRQzoGQTFxQioXBsh3jhn';
var EXAMPLE=[
  {date:'2026-12-13',start:'08:30',end:'14:00',customer:'（例）○○工業 △△工場',addr:'（例）群馬県太田市○○町1-2',info:[{label:'受電容量',value:'300kVA'},{label:'事前確認品',value:'鍵・立会者の連絡先'}],names:['周東','金井','大和','大谷'],leader:'増田',work:'試験業務',on:true,ex:true},
  {date:'2026-12-18',start:'23:00',end:'05:00',customer:'（例）□□放送所',names:['大谷','大川'],leader:'伊藤',work:'試験業務',on:true,ex:true}
];

/* ---------- 小道具 ---------- */
function norm(s){return String(s==null?'':s).normalize('NFKC').replace(/[\s　]+/g,'').toLowerCase();}
function query(){return norm($('q').value);}
function cleanName(n){ return String(n||'').normalize('NFKC').replace(/[\s\u3000]+/g,'').trim(); }
function workers(r){ var seen={},out=[], ld=cleanName(r.leader); (r.names||[]).forEach(function(n){ var c=cleanName(n); if(c&&c!==ld&&!seen[c]){ seen[c]=1; out.push(c); } }); return out; }
function pad(n){return (n<10?'0':'')+n;}
function toHM(v){
  if(v==null||v==='') return '';
  if(typeof v==='number'){ if(v<0) return ''; var f=v-Math.floor(v); if(v>=1&&f===0) return ''; var m=Math.round(f*1440); if(m>=1440) m=0; return pad(Math.floor(m/60))+':'+pad(m%60); }
  var s=String(v).normalize('NFKC').trim(); var mm=s.match(/^(\d{1,2})\s*[:時]\s*(\d{1,2})?/);
  if(!mm) return ''; var h=+mm[1], mi=+(mm[2]||0); if(h>24||mi>59) return ''; if(h===24) h=0; return pad(h)+':'+pad(mi);
}
function dateStr(y,m,d){ if(!y||!m||!d) return ''; return y+'-'+pad(m)+'-'+pad(d); }
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ymFromText(s){ var m=String(s||'').normalize('NFKC').match(/(20\d{2})\s*年\s*(\d{1,2})\s*月/); return m?{y:+m[1],m:+m[2]}:null; }
function rowMatches(r,q){
  if(!q) return true;
  if(norm(r.leader).indexOf(q)>=0) return true;
  if(r.names){ for(var i=0;i<r.names.length;i++) if(norm(r.names[i]).indexOf(q)>=0) return true; }
  return !!r.match && norm(r.match).indexOf(q)>=0;
}
function matchedText(r,q){
  if(!q) return '';
  if(r.names){ var hit=r.names.filter(function(n){return norm(n).indexOf(q)>=0;}); if(hit.length) return hit[0]; }
  if(r.match&&norm(r.match).indexOf(q)>=0) return r.match;
  if(norm(r.leader).indexOf(q)>=0) return '担当者';
  return '';
}

/* ---------- Excel を端末内で読む ---------- */
function parseSheet(aoa,sheetName,fileName){
  var hr=-1,c={},R=Math.min(aoa.length,25);
  for(var r=0;r<R&&hr<0;r++){ var row=aoa[r]||[],s=-1,e=-1;
    for(var k=0;k<row.length;k++){ var t=norm(row[k]); if(t==='開始'||t==='開始時間'||t==='開始時刻') s=k; if(t==='終了'||t==='終了時間'||t==='終了時刻') e=k; }
    if(s>=0&&e>=0){ hr=r; c.start=s; c.end=e; } }
  if(hr<0) return null;
  for(var r2=Math.max(0,hr-2);r2<=Math.min(aoa.length-1,hr+1);r2++){ var hrow=aoa[r2]||[];
    for(var k2=0;k2<hrow.length;k2++){ var t2=norm(hrow[k2]); if(!t2) continue;
      if(c.day==null&&(t2==='日'||t2==='日付'||t2==='月日')) c.day=k2;
      if(c.no==null&&/お客(さま|様)番号|需要家番号/.test(t2)) c.no=k2;
      if(c.cust==null&&/お客(さま|様)名|需要家名|客先|現場名|事業場名/.test(t2)) c.cust=k2;
      if(c.dept==null&&/担当部(所|署)/.test(t2)) c.dept=k2;
      if(c.leader==null&&/担当者|作業責任者/.test(t2)) c.leader=k2;
      if(c.work==null&&/業務名|作業名|作業内容/.test(t2)) c.work=k2;
      if(c.addr==null&&/住所|所在地/.test(t2)) c.addr=k2;
    } }
  if(c.day==null) c.day=Math.max(0,c.start-2);
  if(c.cust==null) c.cust=c.end+2;
  var nameFrom=Math.max(c.work==null?c.cust:c.work, c.leader==null?0:c.leader)+1;
  /* 見出しのある列のうち、決まった列以外を「補足」として拾う（kVA・事前確認品・備考など） */
  var known={}; ['day','no','cust','dept','leader','work','addr','start','end'].forEach(function(k){ if(c[k]!=null) known[c[k]]=1; });
  var labels={}, width=0; for(var rw=Math.max(0,hr-2);rw<=hr;rw++) width=Math.max(width,(aoa[rw]||[]).length);
  for(var kc=0;kc<width;kc++){ if(known[kc]) continue; var parts=[];
    for(var rw2=Math.max(0,hr-2);rw2<=hr;rw2++){ var hv=String((aoa[rw2]||[])[kc]==null?'':(aoa[rw2]||[])[kc]).replace(/\s+/g,' ').trim(); if(hv&&parts.indexOf(hv)<0) parts.push(hv); }
    var lab=parts.join(' ');
    if(!lab||/^[\d\s]+$/.test(lab)||/曜|日付|^日$|人数|割振|割当|総員|乗車|乗組|^\d課|外注|作業予定時間|担当者|作業責任者/.test(lab.normalize('NFKC'))) continue;
    labels[kc]=lab; }
  var INFO_V=/kva|kw|kvar|容量|受電|台|電圧/i;
  var ym=null;
  for(var r3=0;r3<Math.min(aoa.length,hr+1)&&!ym;r3++){ var tr=aoa[r3]||[]; for(var k3=0;k3<tr.length&&!ym;k3++) ym=ymFromText(tr[k3]); }
  if(!ym) ym=ymFromText(sheetName)||ymFromText(fileName);
  var rows=[],prev=null,lastDay=null;
  for(var r4=hr+1;r4<aoa.length;r4++){ var d=aoa[r4]||[]; var dv=d[c.day], day=null, full=null;
    if(typeof dv==='number'){ if(dv>=1&&dv<=31&&Math.floor(dv)===dv) day=dv; else if(dv>30000){ var o=XLSX.SSF.parse_date_code(dv); if(o){ day=o.d; full={y:o.y,m:o.m}; } } }
    else if(dv!=null&&dv!==''){ var ds=String(dv).normalize('NFKC'); var dm=ds.match(/(\d{1,2})\s*日?$/); var fm=ds.match(/(20\d{2})[\/年.-](\d{1,2})[\/月.-](\d{1,2})/); if(fm){ day=+fm[3]; full={y:+fm[1],m:+fm[2]}; } else if(dm&&+dm[1]>=1&&+dm[1]<=31) day=+dm[1]; }
    if(full&&!ym) ym=full;
    var st=toHM(d[c.start]), cust=String(d[c.cust]==null?'':d[c.cust]).trim();
    var names=[], info=[];
    for(var k4=nameFrom;k4<d.length;k4++){ if(labels[k4]) continue; var v=d[k4]; if(typeof v!=='string') continue; var tv=v.trim(); if(!tv) continue;
      if(/kva|kw\b|kvar/i.test(tv.normalize('NFKC'))) info.push({label:'',value:tv});
      else if(!/\d/.test(tv.normalize('NFKC'))&&tv.length<=8) names.push(tv); }
    for(var kl in labels){ var lv=d[kl]; if(lv==null||lv==='') continue; var ls=(typeof lv==='number'&&lv>30000&&/日|期限/.test(labels[kl]))?(function(o){return o?o.m+'/'+o.d:String(lv);})(XLSX.SSF.parse_date_code(lv)):String(lv).trim();
      if(!ls||ls==='0') continue; if(/^[\d.]+$/.test(ls)&&!INFO_V.test(labels[kl])) continue; info.push({label:labels[kl],value:ls}); }
    var hasJob=st&&cust&&cust!=='0';
    if(hasJob){ if(day!=null) lastDay=day;
      prev={day:day!=null?day:lastDay,start:st,end:toHM(d[c.end]),no:String(c.no!=null&&d[c.no]!=null?d[c.no]:'').trim(),customer:cust,
        dept:String(c.dept!=null&&d[c.dept]!=null?d[c.dept]:'').trim(),leader:String(c.leader!=null&&d[c.leader]!=null?d[c.leader]:'').trim().replace(/^\d+\s*/,''),
        work:String(c.work!=null&&d[c.work]!=null?d[c.work]:'').trim(),addr:String(c.addr!=null&&d[c.addr]!=null?d[c.addr]:'').trim(),names:names,info:info};
      rows.push(prev);
    } else if((names.length||info.length)&&prev&&(day==null||day===prev.day)){ prev.names=prev.names.concat(names); prev.info=prev.info.concat(info); }
    else { if(day!=null){ lastDay=day; prev=null; } }
  }
  return {ym:ym,rows:rows};
}
function readExcel(f,buf){
  var wb=XLSX.read(buf,{type:'array'}), out=[], ym=null, failed=[];
  wb.SheetNames.forEach(function(sn){ var ws=wb.Sheets[sn]; if(!ws||!ws['!ref']) return;
    var aoa=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
    var p=parseSheet(aoa,sn,f.name);
    if(!p){ if(aoa.length>3) failed.push({name:sn,aoa:aoa}); return; }
    p.rows.forEach(function(r){ r.ym=p.ym; r.sheet=sn; out.push(r); });
    if(!ym&&p.ym) ym=p.ym; });
  return {rows:out,ym:ym,failed:failed};
}

/* ---------- 文字入りPDF：文字の位置から表を組み立てる（端末内） ---------- */
function pdfLines(items){
  var its=items.filter(function(i){return i.str&&i.str.trim();}).map(function(i){ var w=i.width||0; return {x:i.transform[4],w:w,c:i.transform[4]+w/2,y:i.transform[5],s:i.str.trim()}; });
  its.sort(function(a,b){return b.y-a.y||a.x-b.x;});
  var lines=[],cur=null; its.forEach(function(i){ if(!cur||Math.abs(cur.y-i.y)>3){ cur={y:i.y,c:[]}; lines.push(cur); } cur.c.push(i); });
  /* 同じ行で、すき間なく続く文字は1つにつなぐ（「担当者」「(」「作業責任者」→「担当者(作業責任者」） */
  lines.forEach(function(l){ l.c.sort(function(a,b){return a.x-b.x;}); var m=[];
    l.c.forEach(function(x){ var p=m[m.length-1]; if(p&&x.x-(p.x+p.w)<1.2&&x.x>=p.x){ p.s+=x.s; p.w=Math.max(p.w,x.x+x.w-p.x); p.c=p.x+p.w/2; } else m.push({x:x.x,w:x.w,c:x.c,y:x.y,s:x.s}); });
    l.c=m; });
  return lines;
}
function aoaFromPdfLines(lines){
  var hi=-1;
  for(var i=0;i<lines.length&&hi<0;i++){ var t=lines[i].c.map(function(x){return norm(x.s);}); if(t.indexOf('開始')>=0&&t.indexOf('終了')>=0) hi=i; }
  if(hi<0) return null;
  var top=hi; while(top>0&&lines[top-1].y-lines[hi].y<34) top--;
  /* 見出しの文字の左端を列の始まりにする。上の段の「作業予定時間」のように、下の段の見出しを2つ以上またぐ見出しは列にしない */
  var low=lines[hi].c.filter(function(x){ return !/^[()（）\s・:：]+$/.test(x.s); }), starts=[];
  for(var h=top;h<=hi;h++) lines[h].c.forEach(function(x){
    if(/^[()（）\s・:：]+$/.test(x.s)) return;
    if(h<hi&&low.filter(function(y){ return y.c>=x.x-1&&y.c<=x.x+x.w+1; }).length>=2) return;
    starts.push(x.x); });
  starts.sort(function(a,b){return a-b;});
  var cols=[]; starts.forEach(function(a){ if(!cols.length||a-cols[cols.length-1]>6) cols.push(a); });
  function place(l){ var row=[]; l.c.forEach(function(x){ var best=0;
      for(var k=0;k<cols.length;k++){ if(cols[k]-4<=x.c) best=k; else break; }
      row[best]=row[best]?row[best]+' '+x.s:x.s; });
    for(var k3=0;k3<row.length;k3++) if(row[k3]==null) row[k3]=''; return row; }
  var aoa=[]; for(var j=0;j<top;j++) aoa.push([lines[j].c.map(function(x){return x.s;}).join(' ')]);
  for(var j2=top;j2<lines.length;j2++) aoa.push(place(lines[j2]));
  return aoa;
}
async function readPdf(f,buf){
  var pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf),isEvalSupported:false,disableFontFace:true}).promise, rows=[], ym=null, image=0;
  for(var p=1;p<=pdf.numPages;p++){
    var page=await pdf.getPage(p), items=[];
    try{ items=(await page.getTextContent()).items; }catch(e){ items=[]; }
    var lines=pdfLines(items), jp=lines.reduce(function(n,l){ return n+l.c.reduce(function(m,x){ return m+(x.s.match(/[぀-ヿ一-鿿]/g)||[]).length; },0); },0);
    if(jp<40){ image++; continue; }
    var aoa=aoaFromPdfLines(lines), got=aoa&&parseSheet(aoa,'',f.file.name);
    if(got){ if(!ym&&got.ym) ym=got.ym; got.rows.forEach(function(r){ r.ym=got.ym; rows.push(r); }); }
  }
  return {rows:rows,ym:ym,image:image,pages:pdf.numPages};
}

/* ---------- 住所録：この端末のブラウザだけに保存 ---------- */
var BOOK_KEY='kumi.book.v1';
function hash(s){ var h=5381; for(var i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); }
function bookKey(r){ var n=norm(r.no).replace(/[^0-9a-z-]/g,''); return n?'n-'+n:(r.customer?'c-'+hash(norm(r.customer)):''); }
function loadBook(){ try{ var raw=localStorage.getItem(BOOK_KEY); var b=raw?JSON.parse(raw):{}; book=(b&&typeof b==='object')?b:{}; }catch(e){ book={}; } bookNote(); }
function storeBook(){ try{ localStorage.setItem(BOOK_KEY,JSON.stringify(book)); }catch(e){} bookNote(); }
function bookNote(){ var n=Object.keys(book).length; $('bookNote').textContent='この端末に覚えている住所：'+n+' 件'; $('bookClear').disabled=$('bookExport').disabled=!n; }
function saveAddr(r){
  var k=bookKey(r); if(!k) return; var a=String(r.addr||'').trim().slice(0,200);
  if(a) book[k]={no:String(r.no||'').slice(0,40),customer:String(r.customer||'').slice(0,120),addr:a}; else delete book[k];
  storeBook(); allRows().forEach(function(o){ if(o!==r&&bookKey(o)===k) o.addr=a; });
}
function fillAddr(f){ f.rows.forEach(function(r){ var k=bookKey(r); if(!k) return; if(r.addr){ if(!book[k]) saveAddr(r); } else if(book[k]) r.addr=book[k].addr; }); }

/* ---------- ファイルの受け取り ---------- */
function kindOf(file,head){
  var n=file.name.toLowerCase();
  if(head[0]===0x25&&head[1]===0x50&&head[2]===0x44&&head[3]===0x46) return 'pdf';
  if(head[0]===0x50&&head[1]===0x4b) return 'xlsx';
  if(head[0]===0xd0&&head[1]===0xcf) return 'xlsx';
  if((head[0]===0xff&&head[1]===0xd8)||(head[0]===0x89&&head[1]===0x50)||/\.(jpe?g|png|webp|heic)$/.test(n)) return 'img';
  return '';
}
var MAX_BYTES=25*1024*1024;
function setStatus(f,msg,cls,link){ f.msg=msg; f.cls=cls||''; f.link=!!link; renderFiles(); }
function applyYm(f){ f.rows.forEach(function(r){ var ym=f.ymUser||r.ym||f.ym; r.date=(ym&&r.day)?dateStr(ym.y,ym.m,r.day):''; }); }
async function process(f){
  f.busy=true; f.rows=[]; setStatus(f,'読み込み中…',''); render();
  try{
    if(f.file.size>MAX_BYTES){ f.busy=false; setStatus(f,'25MBより大きいファイルは読みません。','bad'); render(); return; }
    var buf=await f.file.arrayBuffer(), kind=kindOf(f.file,new Uint8Array(buf.slice(0,4))), how='';
    if(kind==='xlsx'){
      var ex=readExcel(f,buf); f.rows=ex.rows; f.ym=ex.ym; how='Excel';
      if(!ex.rows.length&&ex.failed.length){ f.busy=false; setStatus(f,'表の形が読めませんでした（「開始」「終了」の見出しが見つかりません）。','bad'); render(); return; }
    } else if(kind==='pdf'){
      var pr=await readPdf(f,buf); f.rows=pr.rows; f.ym=pr.ym; how='文字入りPDF';
      if(!pr.rows.length&&pr.image===pr.pages){ f.busy=false; setStatus(f,'スキャンした画像のPDFなので、この端末だけでは読めません。','warn',true); render(); return; }
      if(!pr.rows.length){ f.busy=false; setStatus(f,'文字は入っていますが、表の形が読めませんでした（「開始」「終了」の見出しが見つからないか、表が複数ページに分かれています）。','warn',true); render(); return; }
    } else if(kind==='img'){ f.busy=false; setStatus(f,'写真は、この端末だけでは読めません。','warn',true); render(); return; }
    else { f.busy=false; setStatus(f,'ExcelでもPDFでもないファイルです。','bad'); render(); return; }
    f.ym=f.ym||ymFromText(f.file.name); applyYm(f); fillAddr(f);
    var q=query(); f.rows.forEach(function(r){ r.on=rowMatches(r,q); });
    f.busy=false;
    if(!f.rows.length) setStatus(f,how+'：作業の行が見つかりませんでした。','warn');
    else statusCount(f,how);
  }catch(e){ f.busy=false; setStatus(f,'このファイルは読めませんでした。壊れているか、パスワードが付いている可能性があります。','bad'); }
  render();
}
function statusCount(f,how){
  var q=query(), hit=f.rows.filter(function(r){return rowMatches(r,q);}).length;
  setStatus(f,how+'：作業 '+f.rows.length+' 件'+(q?'、うち「'+$('q').value.trim()+'」は '+hit+' 件':'')+(f.ym?'':'。年月が読めなかったので、右の欄で選んでください'),f.ym?'ok':'warn');
  f.how=how;
}
function addFiles(list){
  Array.prototype.forEach.call(list,function(file){ var f={id:++seq,file:file,rows:[],msg:'',cls:'',ym:null,ymUser:null}; files.push(f); process(f); });
  renderFiles();
}

/* ---------- 画面 ---------- */
function renderFiles(){
  var ul=$('files'); ul.textContent='';
  files.forEach(function(f){
    var li=document.createElement('li'), ym=f.ymUser||f.ym, v=ym?(ym.y+'-'+pad(ym.m)):'';
    var nm=document.createElement('span'); nm.className='nm'; nm.textContent=f.file.name;
    var ctl=document.createElement('span'); ctl.className='ctl';
    ctl.innerHTML='<label class="hint" for="ym'+f.id+'">年月</label><input type="month" id="ym'+f.id+'" value="'+v+'"><button type="button" data-rm="'+f.id+'">外す</button>';
    var st=document.createElement('span'); st.className='st '+f.cls; st.textContent=f.msg;
    if(f.link){ var a=document.createElement('a'); a.href=CLAUDE_URL; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent='Claude版で読む →'; st.appendChild(document.createTextNode(' ')); st.appendChild(a); }
    li.appendChild(nm); li.appendChild(ctl); li.appendChild(st); ul.appendChild(li);
    li.querySelector('input[type=month]').addEventListener('change',function(ev){ var m=ev.target.value.match(/^(\d{4})-(\d{2})$/); f.ymUser=m?{y:+m[1],m:+m[2]}:null; applyYm(f); render(); });
  });
}
function allRows(){ var a=[]; files.forEach(function(f){ f.rows.forEach(function(r){ r._f=f; a.push(r); }); }); return a; }
function markDups(){
  var kept=[];
  allRows().forEach(function(r){
    var was=r.dup; r.dup=false; if(!r.date||!r.start) return;
    var d=kept.filter(function(k){ if(k._f===r._f||k.date!==r.date||k.start!==r.start) return false;
      var n1=norm(k.no),n2=norm(r.no),c1=norm(k.customer),c2=norm(r.customer);
      return (n1&&n2&&n1===n2)||c1.indexOf(c2.slice(0,5))>=0||c2.indexOf(c1.slice(0,5))>=0; })[0];
    if(d){ r.dup=true; if(!was) r.on=false; } else kept.push(r);
  });
}
function td(cls){ var e=document.createElement('td'); if(cls) e.className=cls; return e; }
function inp(type,val,label,cls,dis){ var e=document.createElement('input'); e.type=type; e.value=val||''; e.setAttribute('aria-label',label); if(cls) e.className=cls; if(dis) e.disabled=true; return e; }
function line(parent,text,cls){ var s=document.createElement('span'); s.className=cls||'ln'; s.textContent=text; parent.appendChild(s); return s; }
function render(){
  markDups();
  var q=query(), rows=allRows(), ex=!files.length, tb=$('tb'), showAll=$('showAll').checked;
  if(ex) rows=EXAMPLE;
  rows=rows.slice().sort(function(a,b){ return (a.date||'9999').localeCompare(b.date||'9999')||(a.start||'').localeCompare(b.start||''); });
  var shown=rows.filter(function(r){ return ex||showAll||rowMatches(r,q)||r.on; });
  tb.textContent='';
  if(!shown.length){ var tr0=document.createElement('tr'), c0=td(); c0.colSpan=6;
    c0.textContent=files.some(function(f){return f.busy;})?'読み込み中です…':(rows.length?'「'+$('q').value.trim()+'」が入っている作業は見つかりませんでした。「名前が入っていない作業も表示する」にチェックすると、全部の作業が出ます。':'作業が見つかりませんでした。');
    tr0.appendChild(c0); tb.appendChild(tr0); }
  shown.forEach(function(r){
    var tr=document.createElement('tr'), hit=!ex&&q&&rowMatches(r,q);
    tr.className=(hit?'hit ':'')+(r.on?'':'off');
    var c1=td(); if(ex){ line(c1,'例','tag ex'); } else { var cb=inp('checkbox','','この作業を入れる'); cb.checked=!!r.on; c1.appendChild(cb); cb.addEventListener('change',function(){ r.on=cb.checked; tr.classList.toggle('off',!r.on); summary(); }); }
    var c2=td(), di=inp('date',r.date,'日付','',ex); c2.appendChild(di); di.addEventListener('change',function(){ r.date=di.value; summary(); });
    var c3=td(), si=inp('time',r.start,'開始','',ex); c3.appendChild(si); si.addEventListener('change',function(){ r.start=si.value; summary(); });
    var c4=td(), ei=inp('time',r.end,'終了','',ex); c4.appendChild(ei); ei.addEventListener('change',function(){ r.end=ei.value; });
    var c5=td('place'), ci=inp('text',r.customer,'お客さま名','cust',ex), ai=inp('text',r.addr,'住所','addr',ex); ai.placeholder='住所（入れると次から自動で入ります）'; ai.maxLength=200;
    c5.appendChild(ci); c5.appendChild(ai);
    ci.addEventListener('change',function(){ r.customer=ci.value; });
    ai.addEventListener('change',function(){ r.addr=ai.value.trim(); saveAddr(r); render(); });
    var c6=td('who');
    if(r.leader) line(c6,'責任者 '+r.leader);
    var w=workers(r);
    if(w.length){ var det=document.createElement('details'), sm=document.createElement('summary'); sm.textContent='作業員 '+w.length+'名'; det.appendChild(sm);
      var wk=document.createElement('div'); wk.className='wk'; w.forEach(function(n,i){ if(i) wk.appendChild(document.createTextNode('、')); if(q&&norm(n).indexOf(q)>=0){ var b=document.createElement('b'); b.textContent=n; wk.appendChild(b); } else wk.appendChild(document.createTextNode(n)); });
      det.appendChild(wk); c6.appendChild(det); }
    if(r.dept||r.work) line(c6,[r.dept,r.work].filter(Boolean).join(' ／ '));
    (r.info||[]).forEach(function(o){ line(c6,(o.label?o.label+'：':'')+o.value,'inf'); });
    if(r.dup) line(c6,'別のファイルと同じ作業','tag');
    [c1,c2,c3,c4,c5,c6].forEach(function(c){ tr.appendChild(c); });
    tb.appendChild(tr);
  });
  summary();
}
function picked(){ return allRows().filter(function(r){return r.on;}); }
function summary(){
  var s=$('sum');
  if(!files.length){ s.textContent='まだファイルが入っていません。下は見本です。'; $('save').disabled=true; $('copy').disabled=true; return; }
  var p=picked(), bad=p.filter(function(r){return !r.date||!r.start;}).length, busy=files.some(function(f){return f.busy;}), nd=allRows().filter(function(r){return r.dup&&!r.on;}).length;
  s.textContent=(busy?'読み込み中… ':'')+'カレンダーに入れる作業：'+p.length+' 件'+(bad?'（うち '+bad+' 件は日付か開始時刻が空なので、入れてください）':'')+(nd?'。別のファイルと同じ作業 '+nd+' 件は、二重にならないよう外してあります':'');
  $('save').disabled=$('copy').disabled=!p.length||busy;
}

/* ---------- CSV ---------- */
function ampm(hm){ var h=+hm.slice(0,2), m=hm.slice(3,5), ap=h<12?'AM':'PM', h12=h%12; if(h12===0) h12=12; return h12+':'+m+' '+ap; }
function mdy(d){ return d.slice(5,7)+'/'+d.slice(8,10)+'/'+d.slice(0,4); }
function addDay(d){ var t=new Date(Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10)+1)); return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate()); }
/* 表計算ソフトで開いたときに式として動かないよう、= + - @ で始まる値は先頭に ' を付ける */
function cell(s){ s=String(s==null?'':s); if(/^[=+\-@\t\r]/.test(s)) s="'"+s; return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
function buildCsv(rows){
  var out=[['Subject','Start Date','Start Time','End Date','End Time','All Day Event','Description','Location'].join(',')];
  rows.forEach(function(r){
    var st=r.start, en=r.end, ed=r.date;
    if(!en){ var mins=(+st.slice(0,2))*60+(+st.slice(3,5))+60; if(mins>=1440){ mins-=1440; ed=addDay(ed); } en=pad(Math.floor(mins/60))+':'+pad(mins%60); }
    else if(en<=st) ed=addDay(ed);
    var eq=[],pre=[],etc=[];
    (r.info||[]).forEach(function(o){ var t=(o.label?o.label+'：':'')+o.value, k=(o.label+' '+o.value).normalize('NFKC');
      if(/事前|確認|持参|持ち物|持物|準備|必要|鍵|立会|連絡/.test(k)) pre.push('・'+t);
      else if(/kva|kw|kvar|容量|受電|変圧器|設備|電圧|台数|キュービクル|発電/i.test(k)) eq.push('・'+t);
      else etc.push('・'+t); });
    var blocks=[];
    blocks.push(['■ 作業',(r.work?'業務：'+r.work:''),(r.leader?'作業責任者：'+r.leader+(r.dept?'（'+r.dept+'）':''):(r.dept?'担当部所：'+r.dept:'')),(r.no?'お客さま番号：'+r.no:'')].filter(Boolean).join('\n'));
    var wl=workers(r); if(wl.length) blocks.push('■ 作業員（'+wl.length+'名）\n'+wl.join('、'));
    if(eq.length) blocks.push('■ 設備\n'+eq.join('\n'));
    if(pre.length) blocks.push('■ 事前確認・持ち物\n'+pre.join('\n'));
    if(etc.length) blocks.push('■ その他\n'+etc.join('\n'));
    blocks.push((r.addr?'住所：'+r.addr+'\n':'')+'元の予定表：'+r._f.file.name);
    out.push([cell('【組作業】'+r.customer),mdy(r.date),ampm(st),mdy(ed),ampm(en),'False',cell(blocks.join('\n\n')),cell(r.addr||r.customer)].join(','));
  });
  return out.join('\r\n')+'\r\n';
}
function ready(){
  var p=picked().filter(function(r){return r.date&&r.start;}), skipped=picked().length-p.length;
  p.sort(function(a,b){return a.date.localeCompare(b.date)||a.start.localeCompare(b.start);});
  return {rows:p,skipped:skipped};
}
function say(t,cls){ var m=$('msg'); m.textContent=t; m.className='msg '+(cls||''); }
function saveText(name,text,type){
  var url=URL.createObjectURL(new Blob([text],{type:type})), a=document.createElement('a');
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); },2000);
}
$('save').addEventListener('click',function(){
  var r=ready(); if(!r.rows.length){ say('日付と開始時刻が入っている作業がありません。','bad'); return; }
  var nm=($('q').value.trim()||'全員').replace(/[\\\/:*?"<>|]/g,'');
  saveText('組作業_'+nm+'_'+r.rows[0].date.slice(0,7)+'.csv',buildCsv(r.rows),'text/csv;charset=utf-8');
  say(r.rows.length+' 件をCSVに保存しました。'+(r.skipped?'日付か開始時刻が空の '+r.skipped+' 件は入れていません。':''),'ok');
});
$('copy').addEventListener('click',function(){
  var r=ready(); if(!r.rows.length){ say('日付と開始時刻が入っている作業がありません。','bad'); return; }
  var csv=buildCsv(r.rows);
  (navigator.clipboard?navigator.clipboard.writeText(csv):Promise.reject()).then(function(){ say(r.rows.length+' 件ぶんのCSVをコピーしました。','ok'); },function(){ say('コピーできませんでした。「CSVを保存」を使ってください。','bad'); });
});

/* ---------- 住所録の書き出し・読み込み・消去 ---------- */
$('bookExport').addEventListener('click',function(){ saveText('組作業_住所録.json',JSON.stringify(book,null,1),'application/json'); });
$('bookImport').addEventListener('click',function(){ $('bookFile').click(); });
$('bookFile').addEventListener('change',function(){
  var file=this.files[0]; this.value=''; if(!file) return;
  if(file.size>1024*1024){ say('住所録のファイルが大きすぎます。','bad'); return; }
  file.text().then(function(t){ var o=JSON.parse(t), n=0;
    Object.keys(o).forEach(function(k){ var v=o[k]; if(/^[nc]-[0-9a-z-]{1,40}$/.test(k)&&v&&typeof v.addr==='string'&&v.addr.trim()){ book[k]={no:String(v.no||'').slice(0,40),customer:String(v.customer||'').slice(0,120),addr:v.addr.trim().slice(0,200)}; n++; } });
    storeBook(); files.forEach(fillAddr); render(); say('住所録から '+n+' 件を読み込みました。','ok');
  }).catch(function(){ say('住所録のファイルが読めませんでした。','bad'); });
});
$('bookClear').addEventListener('click',function(){
  var b=$('bookClear');
  if(b.dataset.armed!=='1'){ b.dataset.armed='1'; b.textContent='本当に消す（もう一度押す）'; setTimeout(function(){ b.dataset.armed=''; b.textContent='この端末の住所録を消す'; },4000); return; }
  b.dataset.armed=''; b.textContent='この端末の住所録を消す';
  book={}; try{ localStorage.removeItem(BOOK_KEY); }catch(e){} bookNote(); say('この端末の住所録を消しました。','ok');
});

/* ---------- 操作 ---------- */
function applyName(){
  try{ localStorage.setItem('kumi.name',$('q').value.slice(0,40)); }catch(e){}
  var q=query();
  files.forEach(function(f){ if(f.busy) return; f.rows.forEach(function(r){ r.on=rowMatches(r,q); }); if(f.rows.length&&f.how) statusCount(f,f.how); });
  render();
}
$('apply').addEventListener('click',applyName);
$('q').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); applyName(); } });
$('showAll').addEventListener('change',render);
var drop=$('drop'), pick=$('pick');
drop.addEventListener('click',function(){ pick.click(); });
drop.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick.click(); } });
pick.addEventListener('change',function(){ if(pick.files.length) addFiles(pick.files); pick.value=''; });
['dragenter','dragover'].forEach(function(n){ document.addEventListener(n,function(e){ e.preventDefault(); drop.classList.add('over'); }); });
['dragleave','drop'].forEach(function(n){ document.addEventListener(n,function(e){ e.preventDefault(); drop.classList.remove('over'); }); });
document.addEventListener('drop',function(e){ if(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
$('files').addEventListener('click',function(e){
  var b=e.target.closest('button[data-rm]'); if(!b) return;
  var id=+b.getAttribute('data-rm'); files=files.filter(function(x){return x.id!==id;}); renderFiles(); render();
});
$('claudeLink').href=CLAUDE_URL;
try{ var saved=localStorage.getItem('kumi.name'); if(saved!=null) $('q').value=saved; }catch(e){}
pdfjsLib.GlobalWorkerOptions.workerSrc='assets/kumi/pdf.worker.min.js';
loadBook(); render();
window.__kumi={files:function(){return files;},buildCsv:buildCsv};
})();
