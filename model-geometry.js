/* Millimetre geometry. Only exterior geometry is placed in the product envelope.
   Do not add conjectural internal parts here; use the separate functional diagram. */
(function(root){'use strict';
const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,k)=>a.map(v=>v*k),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/(Math.hypot(...a)||1));
const C={metal:'#b6c3cc',dark:'#303e48',iron:'#596874',ceramic:'#d9e5e9',mold:'#824d37',copper:'#b89a61',black:'#26333d',red:'#b54e43',blue:'#417aa2'};
function build(kind,s){
const faces=[];
function face(p,c,id){faces.push({p,c,id});}
function box(x,y,z,w,h,d,c,id){const a=x-w/2,b=x+w/2,u=y-h/2,v=y+h/2,l=z-d/2,r=z+d/2;
 [[[a,u,r],[b,u,r],[b,v,r],[a,v,r]],[[b,u,l],[a,u,l],[a,v,l],[b,v,l]],[[a,v,r],[b,v,r],[b,v,l],[a,v,l]],[[a,u,l],[b,u,l],[b,u,r],[a,u,r]],[[b,u,r],[b,u,l],[b,v,l],[b,v,r]],[[a,u,l],[a,u,r],[a,v,r],[a,v,l]]].forEach(p=>face(p,c,id));}
function rod(a,b,r,c,id,n=16){const axis=unit(sub(b,a)),u=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);const pa=[],pb=[];
 for(let i=0;i<n;i++){let o=add(mul(u,r*Math.cos(i*2*Math.PI/n)),mul(v,r*Math.sin(i*2*Math.PI/n)));pa.push(add(a,o));pb.push(add(b,o));}
 for(let i=0;i<n;i++) face([pa[i],pa[(i+1)%n],pb[(i+1)%n],pb[i]],c,id);
 face(pa.slice().reverse(),c,id);face(pb,c,id);
}
function profile(points,c,id,n=36){for(let j=0;j<points.length-1;j++)for(let i=0;i<n;i++){const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n,[r0,y0]=points[j],[r1,y1]=points[j+1];face([[r0*Math.cos(a),y0,r0*Math.sin(a)],[r0*Math.cos(b),y0,r0*Math.sin(b)],[r1*Math.cos(b),y1,r1*Math.sin(b)],[r1*Math.cos(a),y1,r1*Math.sin(a)]],c,id);}}
function tube(x,y,z,outer,inner,depth,c,id,n=48){for(let i=0;i<n;i++){
 const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n,P=(r,t,d)=>[x+r*Math.cos(t),y+r*Math.sin(t),z+d];
 face([P(outer,a,depth/2),P(outer,b,depth/2),P(inner,b,depth/2),P(inner,a,depth/2)],c,id);
 face([P(outer,b,-depth/2),P(outer,a,-depth/2),P(inner,a,-depth/2),P(inner,b,-depth/2)],c,id);
 face([P(outer,a,-depth/2),P(outer,b,-depth/2),P(outer,b,depth/2),P(outer,a,depth/2)],c,id);
 face([P(inner,b,-depth/2),P(inner,a,-depth/2),P(inner,a,depth/2),P(inner,b,depth/2)],c,id);
}}
function ins(a,b,r,c,id,ribs=6){rod(a,b,r*.7,c,id);for(let i=1;i<=ribs;i++){let f=i/(ribs+1),d=sub(b,a);rod(add(a,mul(d,f-.016)),add(a,mul(d,f+.016)),r,c,id,20);}}
function bolt(x,y,z,id,r=5){rod([x,y,z],[x,y,z+8],r,C.metal,id,6);}
if(kind==='ds'){
 box(0,137.5,-110,60,135,10,C.metal,'base');
 ins([0,173,-105],[0,225,0],23,C.ceramic,'insulator');
 ins([0,102,-105],[0,50,0],23,C.ceramic,'insulator');
 box(0,242,1,30,65,6,C.copper,'contact'); box(0,26,0,30,50,7,C.copper,'hinge');
 box(0,225,8,44,18,25,C.metal,'contact');rod([-25,50,8],[25,50,8],7,C.metal,'hinge');
 const a=s.closed?0:Math.PI/2;
 const end=[0,50+175*Math.cos(a),8+175*Math.sin(a)];
 [-12,12].forEach(x=>rod([x,50,8],[x,end[1],end[2]],5,C.copper,'blade',6));
 tube(0,50+120*Math.cos(a),8+120*Math.sin(a)+7,17,11,6,C.metal,'blade',24);
 bolt(0,262,5,'contact');bolt(0,7,5,'hinge');
}else if(kind==='lbs'){
 box(0,160,-120,460,12,15,C.metal,'base');box(0,50,-120,460,12,15,C.metal,'base');
 [-230,230].forEach(x=>box(x,150,-120,25,230,10,C.metal,'base'));
 [-150,0,150].forEach(x=>{
  ins([x,210,-110],[x,285,-5],25,C.mold,'insulator');ins([x,78,-110],[x,140,55],25,C.mold,'insulator');
  box(x,318,-5,35,108,12,C.copper,'blade'); box(x,290,0,42,64,40,C.dark,'blade');
  const z=s.closed?5:45;
  rod([x,150,50],[x,280,z],8,C.copper,'blade',6);
  rod([x,150,50],[x+30,160,52],8,C.copper,'fuse',6);
  rod([x+30,160,52],[x+30,24,-50],15,'#e3dfd0','fuse',20);
  rod([x+30,160,52],[x+30,145,41],19,C.metal,'fuse');rod([x+30,24,-50],[x+30,39,-39],19,C.metal,'fuse');
  box(x+30,12,-50,32,28,8,C.copper,'fuse');
 });
 rod([-240,80,-115],[260,80,-115],7,C.metal,'handle');
 box(255,205,-90,12,180,20,C.metal,'handle');tube(255,280,-80,20,12,8,C.metal,'handle');tube(255,155,-80,20,12,8,C.metal,'handle');
 box(-75,175,-110,60,27,3,'#dfdfd4','base');
}else if(kind==='la'){
 rod([0,30,0],[0,203,0],24,C.ceramic,'body',36);
 [44,69,94,119,144,169,192].forEach(y=>rod([0,y-3,0],[0,y+3,0],36,C.ceramic,'body',36));
 profile([[41,196],[41,207],[19,229],[15,233],[0,233]],C.black,'terminal');rod([0,233,0],[0,245,0],7,C.metal,'terminal');
 rod([0,10,0],[0,30,0],12,C.metal,'earth');rod([0,0,0],[0,10,0],6,C.metal,'earth');
 rod([0,38,0],[0,48,0],28,C.metal,'band');box(0,43,-35,55,10,25,C.metal,'band');
}else if(kind==='zct'){
 tube(-15,76.5,0,57.5,34,36,C.black,'body');
 box(42.5,76,0,45,49,36,C.black,'terminal');
 box(0,10,0,155,12,36,C.black,'base');box(0,2,0,182,3,60,C.metal,'base');
 [64,87].forEach(y=>[-8,8].forEach(z=>rod([62,y,z],[73,y,z],3.7,C.metal,'terminal',6)));
 [[-15,110.5,0],[-44.4,59.5,0],[14.4,59.5,0]].forEach(p=>rod([-15,76.5,0],p,2.5,'#87939b','hole',6));
}else if(kind==='vt'){
 [-45,45].forEach(x=>box(x,2,0,20,4,160,C.metal,'body'));
 box(0,53,0,100,95,105,C.mold,'mold');
 for(let y=49;y<111;y+=3)box(0,y,0,155,2,110,y%2?C.iron:C.metal,'body');
 box(0,80,57,80,47,2,'#deded2','body');
 box(0,125,0,155,14,195,C.mold,'mold');
 [-72,0,72].forEach(x=>box(x,151,0,7,44,192,C.mold,'mold'));
 [-45,45].forEach(x=>{
  rod([x,147,-65],[x,147,65],8,'#e3e2d8','fuse');
  rod([x,147,64],[x,147,73],12,C.metal,'terminal');
  bolt(x,147,73,'terminal',5);box(x,141,-70,20,24,6,C.metal,'fuse');
 });
 box(0,26,58,48,23,8,C.mold,'secondary');[-14,14].forEach(x=>bolt(x,26,64,'secondary',6));
}else if(kind==='vcb'){
 box(0,31,0,490,12,410,C.metal,'wheel');
 box(0,202,145,460,371,101,C.dark,'body');
 [-214,214].forEach(x=>{box(x,205,-130,10,335,15,C.metal,'body');box(x,368,-23,10,10,230,C.metal,'body');box(x,45,-23,10,10,230,C.metal,'body');});
 box(0,368,-130,438,10,15,C.metal,'body');
 [-120,0,120].forEach(x=>{
  box(x,220,-145,64,290,25,C.mold,'terminal');
  [185,329].forEach(y=>{ins([x,y,-145],[x,y,-190],28,C.mold,'terminal',3);rod([x,y,-190],[x,y,-201],17,C.copper,'terminal',12);});
 });
 [-208,208].forEach(x=>[-155,175].forEach(z=>rod([x-8,22,z],[x+8,22,z],22,C.dark,'wheel',20)));
 box(128,115,201,62,46,12,C.black,'plug');
 box(-121,255,201,18,14,5,s.closed?C.red:C.blue,'body');
 box(78,270,201,76,34,4,'#c6cfc9','body');
 [-90,48].forEach(x=>{bolt(x,157,202,'body',7);rod([x,157,207],[x,185,218],4,C.metal,'body');});
 box(-30,63,202,65,12,7,C.metal,'body');
}else if(kind==='pas'){
 // x = incoming/outgoing axis, z = phase direction. Standard-region drawing.
 box(0,220,0,305,440,370,C.metal,'body');
 box(0,455,0,305,50,370,'#9eafb9','body');
 for(const side of [-1,1]) [-120,0,120].forEach(z=>{
  const y=z===0?340:315;
  ins([side*154,y,z],[side*255,y,z],22,C.ceramic,'terminal',6);
  rod([side*255,y,z],[side*300,y,z],11,C.black,'terminal');
  rod([side*300,y,z],[side*320,y-35,z],11,C.black,'terminal');
  rod([side*320,y-35,z],[side*320,y-135,z],11,C.black,'terminal');
  rod([side*320,y-135,z],[side*320,y-160,z],5,C.copper,'terminal');
 });
 [-60,60].forEach(x=>[-140,140].forEach(z=>{rod([x,480,z],[x,615,z],6,C.metal,'body');box(x,625,z,30,8,35,C.metal,'body');}));
 const sign=s.closed?1:-1;
 rod([-95,260-sign*90,200],[95,260+sign*90,200],12,C.metal,'handle');
 rod([115,70,205],[150,70,205],5,C.copper,'earth');
 rod([157,275,-167],[185,230,-167],10,C.black,'control');
 rod([185,230,-167],[185,45,-167],10,C.black,'control');
 box(0,85,189,100,55,3,'#e1e6dc','body');
}
return faces;
}
root.UkiwaGeometry={build};if(typeof module==='object'&&module.exports)module.exports=root.UkiwaGeometry;
})(typeof window!=='undefined'?window:globalThis);
