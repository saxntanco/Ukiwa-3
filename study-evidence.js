/* Additive records: old progress fields are retained by each site's adapter. */
((root)=>{'use strict';
 const interval=24*60*60*1000;
 function recent(record,now=Date.now()) {const t=Date.parse(record?.exposedAt);return Number.isFinite(t)&&now-t<interval;}
 function expose(record={},now=Date.now()){return {...record,readAt:new Date(now).toISOString(),exposedAt:new Date(now).toISOString()};}
 function result(record={},correct,assisted=false,now=Date.now()){
  const outcome=!correct?'retry':assisted?'assisted':recent(record,now)?'reproduced':'unaided';
  const date=new Date(now).toISOString();
  return {...record,attempts:(record.attempts||0)+1,lastOutcome:outcome,lastAttemptAt:date,
   ...(correct?{[outcome+'At']:date}:{})};
 }
 const api={recent,expose,result,interval};root.UkiwaStudyEvidence=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
