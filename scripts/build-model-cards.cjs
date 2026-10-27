const fs=require('node:fs'),{models}=require('../model-data.js'),{build}=require('../model-geometry.js'),S=require('../model-state.js');
const escape=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;');
const center={pas:300,vcb:190,lbs:190,zct:67,vt:86,ds:140,la:122};
for(const [k,d]of Object.entries(models)){
 const yaw=-.5,pitch=.2,tf=p=>{let x=p[0],y=p[1]-center[k],z=p[2],xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw);return[xx,y*Math.cos(pitch)-zz*Math.sin(pitch),y*Math.sin(pitch)+zz*Math.cos(pitch)]};
 const projection=p=>{let f=245*2.3/(d.size*3-p[2]);return[180+p[0]*f,136-p[1]*f]};
 const faces=build(k,S.initial(k)).map(f=>({...f,p:f.p.map(tf)})).sort((a,b)=>a.p.reduce((s,v)=>s+v[2],0)/a.p.length-b.p.reduce((s,v)=>s+v[2],0)/b.p.length);
 const polys=faces.map(f=>`<polygon points="${f.p.map(p=>projection(p).map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="${f.c}" stroke="#647983" stroke-width=".25"/>`).join('');
 fs.writeFileSync(`assets/zukan/${k}-model.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 270" role="img"><title>${escape(d.ref)}の外観モデル</title><rect width="360" height="270" fill="#eaf2f5"/><ellipse cx="180" cy="238" rx="100" ry="13" fill="#cedee5" opacity=".55"/>${polys}</svg>`);
}
const groups=[['開閉・遮断',['vcb','pas','ds','lbs']],['変成・検出・保護',['vt','zct','la']]];
const block=`<section class="zk-3d" id="models3d" aria-labelledby="models3dTitle"><div class="zk-3d-head"><h2 id="models3dTitle">🧊 360°で見る高圧機器</h2><p>外観は外形図から。内部は確認できる範囲を原理図で。</p></div>${groups.map(([label,ids])=>`<h3 style="color:inherit;margin:18px 4px 9px">${label}</h3><div class="zk-3d-grid">${ids.map(id=>{const d=models[id];return `<a class="zk-3d-card" href="${d.file}"><img src="assets/zukan/${id}-model.svg" alt="${d.ref}の外観モデル" loading="lazy"><span class="tx"><span class="tag">${d.short}${['ds','lbs','la','zct'].includes(id)?' · NEW':''}</span><b>${d.title}</b><small>${d.lead}</small><span class="go">回して見る →</span></span></a>`}).join('')}</div>`).join('')}<p class="zk-3d-note">7モデル。資料で確認した外観と、部品の位置を再現しない機能模式を別表示。<a href="model-audit-20261027.html" style="color:inherit">精査・追加の記録と未作成機器 →</a></p></section>`;
let z=fs.readFileSync('zukan.html','utf8');if(!/<section class="zk-3d"/.test(z))throw Error('model section not found');z=z.replace(/<section class="zk-3d"[\s\S]*?<\/section>/,block);fs.writeFileSync('zukan.html',z);
