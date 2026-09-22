const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const evidence=require('../study-evidence.js');
const now=Date.parse('2026-09-22T01:00:00Z');
test('reading never grants an unaided solve, and preserves legacy fields',()=>{
 const old={saved:true,memo:'keep me',attempts:3};
 const read=evidence.expose(old,now);
 assert.equal(read.unaidedAt,undefined);assert.equal(read.saved,true);assert.equal(read.memo,old.memo);
 assert.equal(old.readAt,undefined);
});
test('immediate redo remains reproduced after JSON persistence and mode changes',()=>{
 const read=JSON.parse(JSON.stringify(evidence.expose({},now)));
 const retry=evidence.result(read,true,false,now+1000);
 assert.equal(retry.lastOutcome,'reproduced');assert.equal(retry.unaidedAt,undefined);
 assert.equal(evidence.result(retry,true,false,now+2000).lastOutcome,'reproduced');
});
test('assisted, failed, new and delayed attempts remain distinct',()=>{
 assert.equal(evidence.result({},true,true,now).lastOutcome,'assisted');
 assert.equal(evidence.result({},false,false,now).lastOutcome,'retry');
 assert.equal(evidence.result({},true,false,now).lastOutcome,'unaided');
 const read=evidence.expose({},now);
 assert.equal(evidence.result(read,true,false,now+evidence.interval-1).lastOutcome,'reproduced');
 assert.equal(evidence.result(read,true,false,now+evidence.interval).lastOutcome,'unaided');
 assert.equal(evidence.result(read,true,true,now+evidence.interval).lastOutcome,'assisted');
});
test('energy position metadata is only coordinates and maps to registered question excerpts',()=>{
 const root=path.resolve(__dirname,'..');
 const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
 const positions=load('energy-blank-positions.json').items;
 const questions=[...load('energy-study-index.json').items,...load('energy-electric-index.json').items];
 for(const [id,blanks] of Object.entries(positions)){
  const question=questions.find(q=>q.id===id);assert.ok(question,id);
  for(const spots of Object.values(blanks))for(const s of spots){
   assert.deepEqual(Object.keys(s).sort(),['page','x','y']);
   assert.ok(question.question.some(p=>p.page===s.page&&s.x>=p.rect[0]&&s.x<=p.rect[2]&&s.y>=p.rect[1]&&s.y<=p.rect[3]),`${id} ${JSON.stringify(s)}`);
  }
 }
});
