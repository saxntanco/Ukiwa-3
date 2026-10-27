const test=require('node:test'),assert=require('node:assert/strict');
const {initial,next,electrical}=require('../model-state.js');
const run=(s,...acts)=>acts.reduce((s,a)=>next(s,a),s);
test('VCB normal trip: release precedes main opening, auxiliary then removes TC current',()=>{
 let s=next(initial('vcb'),'play');assert.equal(electrical(s).tc,true);assert.equal(s.released,false);
 s=next(s,'tick');assert.equal(s.released,true);assert.equal(s.closed,true);
 s=next(s,'tick');assert.equal(s.closed,false);
 s=next(s,'tick');assert.deepEqual(electrical(s),{tc:false,a:false,b:true,main:false,fuse:true});
 s=next(s,'tick');assert.equal(s.relay,false);assert.equal(s.running,false);
});
test('power interruption before release cannot mechanically trip; play does not restore power',()=>{
 let s=run(initial('vcb'),'play','power','tick','tick');
 assert.equal(s.closed,true);assert.equal(s.released,false);assert.equal(s.power,false);assert.equal(electrical(s).tc,false);
 s=next(s,'play');assert.equal(s.power,false);assert.equal(s.running,false);
});
test('power interruption after release does not prevent stored-energy opening',()=>{
 let s=run(initial('vcb'),'play','tick','power','tick','tick');
 assert.equal(s.closed,false);assert.equal(electrical(s).tc,false);assert.equal(electrical(s).b,true);
});
test('relay recovery after release cannot relatch the stored-energy mechanism',()=>{
 const s=run(initial('vcb'),'play','tick','relay-off','tick','tick');
 assert.equal(s.closed,false);assert.equal(s.released,true);assert.equal(electrical(s).tc,false);
});
test('non-following auxiliary switch sustains TC only while power and relay remain',()=>{
 let s=run(initial('vcb'),'fault','play','tick','tick','tick');assert.equal(s.closed,false);assert.equal(electrical(s).tc,true);
 for(let i=0;i<1000;i++)s=next(s,'tick');assert.equal(electrical(s).tc,true);assert.equal(s.burned,undefined);
 assert.equal(electrical(next(s,'power')).tc,false);assert.equal(electrical(next(s,'relay-off')).tc,false);
});
test('LBS fuse does not become healthy on reclose',()=>{
 let s=run(initial('lbs'),'play','tick','tick');assert.equal(s.fused,true);assert.equal(s.closed,false);
 s=next(s,'close');assert.equal(s.closed,false);assert.equal(s.fused,true);
 s=next(s,'reset');assert.equal(s.fused,false);
});
test('reset discards fault/mode/replay state',()=>{for(const k of ['vcb','pas','vt','lbs','ds','la','zct'])assert.deepEqual(next(run(initial(k),'fault','mode:ground','play','tick'),'reset'),initial(k));});
test('all exterior geometry is finite and selection ids exist in metadata',()=>{
 const {models}=require('../model-data.js'),{build}=require('../model-geometry.js');
 for(const [k,d]of Object.entries(models))for(const state of [initial(k),next(initial(k),'open')]){
  const mesh=build(k,state);assert.ok(mesh.length>10,k);for(const f of mesh){assert.ok(d.parts[f.id],k+':'+f.id);assert.ok(f.p.every(p=>p.length===3&&p.every(Number.isFinite)));}
 }
});
test('the referenced PAS and LA types retain their verified distinguishing features',()=>{
 const {models,sources}=require('../model-data.js');assert.match(models.pas.verified,/U–W/);assert.match(models.pas.lesson[1][1],/P1・P2/);assert.match(models.la.ref,/直列ギャップ/);assert.match(sources.lbsManual[2],/2024年9月/);
});
test('replay cannot relatch a VCB already released or restart the active trip',()=>{
 let s=run(initial('vcb'),'play','tick');const released={...s};
 s=next(s,'play');assert.deepEqual(s,released);
 s=run(s,'power','tick','tick');assert.equal(s.closed,false);assert.equal(s.released,true);
});
test('an LBS fault demonstration cannot implicitly close an open device',()=>{
 const s=next(initial('lbs'),'open');assert.deepEqual(next(s,'play'),s);
});
