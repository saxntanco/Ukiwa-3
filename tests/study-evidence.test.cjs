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
test('deep explanations match official answers and keep figures inert',()=>{
 const root=path.resolve(__dirname,'..');
 const load=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
 const index=load('denken-assets/deep/index.json'),answers=load('denken-assets/answers.json');
 const deep=Object.assign({},...Object.keys(index.years).map(y=>load(`denken-assets/deep/${y}.json`)));
 assert.deepEqual(Object.keys(deep).sort(),[...index.keys].sort(),'index lists every explanation');
 for(const [key,entry] of Object.entries(deep)){
  const [year,subject,number]=key.split('-'),correct=answers[year]?.[subject]?.[number];
  assert.ok(correct,`${key} has official answers`);
  assert.equal(entry.slots.length,correct.length,`${key} covers every blank`);
  if(entry.choices){const keys=Object.keys(entry.choices);assert.ok(keys.every(k=>'イロハニホヘトチリヌルヲワカヨ'.includes(k)),`${key} uses answer-group symbols`);assert.ok(correct.every((c,i)=>keys.includes(c)||entry.slots[i].choices),`${key} transcribes every correct choice`);assert.ok(keys.length===15||entry.choicesPartial,`${key} transcribes all 15 choices unless marked partial`);}
  entry.slots.forEach((slot,i)=>{
   assert.ok(slot.ask&&slot.steps?.length,`${key} (${i+1}) explains the step`);
   if(slot.choices)assert.ok(correct[i] in slot.choices,`${key} (${i+1}) per-blank choices include the answer`);
   for(const trap of slot.trap||[])assert.ok(!trap.choice.split(/[・\s]/).includes(correct[i]),`${key} (${i+1}) does not list the answer as a trap`);
   if(slot.figure){assert.match(slot.figure,/^<svg[\s>]/);assert.doesNotMatch(slot.figure,/<script|\son\w+=|javascript:|<foreignObject|href=/i);}
  });
 }
});
