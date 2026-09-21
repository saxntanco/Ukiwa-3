(function(root){
'use strict';
const data=[
['momentary','モーメンタリ：押す間だけ','操作・記憶','手を離すと接点が元に戻る。','押ボタンのa接点でランプを直接操作します。押して閉、離して開。自己保持接点はありません。','押す → 離す。離した瞬間に消えることを確認。','押ボタンを離すと？','消灯する','点灯を保持する','ばねで接点が元の状態へ戻り、通電経路が切れます。'],
['alternate','オルタネイト：スイッチで保持','操作・記憶','ボタンの機械的な保持と、電気的な自己保持を区別する。','1回目に押すと接点が閉じ、そのまま保持。離しても閉のままです。2回目に押すと開きます。ここでは機械的な保持形スイッチをモデル化します。','押す → 離す → 電源OFF/ON。接点が閉のままなら再び点灯。','電源OFFでも残るのは？','スイッチの接点位置','ランプへ流れる電流','機械的な保持なので、接点位置は残ります。電源がなければランプは消灯します。'],
['impulse','押すたびON/OFF：反転記憶','操作・記憶','一つのモーメンタリ入力で、出力の記憶を反転する。','押ボタンそのものは離すと戻りますが、入力がOFFからONになった瞬間に内部の記憶を反転します。押し続けている間は再反転しません。この教材では電源断で記憶を消します。','押す → 1秒進めるを数回 → 離す → 再度押す。','押し続けていると？','出力はそのまま','毎秒反転する','反転のきっかけは立上りだけです。自己保持回路にボタンを一つ足すだけで実現するという意味ではありません。'],
['latch','セット・リセット：別々に記憶','操作・記憶','ONを覚えさせる入力と、消す入力を分ける。','SETで出力を記憶し、RESETで解除するリセット優先の論理です。SETとRESETを両方ONにした場合はOFFにします。電源断では記憶を消す教育モデルです。','SETをON/OFF → RESETをON。同時入力も確認。','SETとRESETが両方ONなら？','OFF（このモデル）','必ずON','この教材はリセット優先。実際のラッチングリレーの同時入力可否や停電保持は機種によります。'],
['on','オンディレー：遅れて入る','時間','入力が続いた時間を計る。','入力ONが3秒続いたら出力ON。3秒になる前に入力をOFFにすると計時をリセットします。出力ON後も入力OFFで即座に出力OFFです。','入力ON → 2秒進める → 入力OFF → 再びON。最初から計ることを確認。','2秒で入力を切ると？','計時をリセット','残り1秒を記憶','この非積算のオンディレーは、連続した入力時間で判断します。'],
['off','信号オフディレー：遅れて切れる','時間','入力OFFと電源OFFを区別する。','入力ONで出力はすぐON。入力をOFFにしてから3秒後に出力OFF。タイマの制御電源は継続して供給する方式です。電源自体を切るとこのモデルの出力は直ちにOFFになります。','入力ON → OFF → 2秒 → 再度ON。停止待ちが取り消される。','遅延中も必要なのは？','タイマへの制御電源','入力信号をONに保つこと','信号オフディレーは電源を残して動きます。電源オフディレーという別方式と区別します。'],
['interval','インターバル：一定時間だけ','時間','入力ONから出力する時間を制限する。','入力ONと同時に出力ON。3秒でOFFになり、入力を保持していても再開しません。この例は入力OFFで途中終了・リセットする動作です。再びONにすると最初から動きます。','入力をONに保って4秒進める。入力を一度OFFにして再投入。','入力を5秒保持したら？','3秒後から出力OFF','5秒間ずっと出力ON','本モデルの出力時間は3秒。途中の入力OFFで中止する仕様を採用しています。'],
['pulse','ワンショット：一度の合図で','時間','短い入力から一定幅の出力を作る。','入力の立上りで3秒間出力します。入力をすぐ離しても3秒まで継続。この例では出力中の再入力を無視する非再トリガ形を採用します。制御電源は必要です。','押す → すぐ離す → 1秒ずつ進める。インターバルと比べよう。','出力中にもう一度入力すると？','延長しない（この例）','必ず3秒延長する','再トリガの扱いは機種によります。ここでは無視する方式を明示しています。'],
['flicker','フリッカ：点滅を繰り返す','時間','出力ONとOFFの時間を繰り返す。','入力ONから、まず2秒OFF、その後2秒ONを繰り返します。入力OFFで出力OFF・計時リセット。これはOFFスタートのフリッカです。','入力ONから6秒まで、1秒ずつ進める。','この例の最初の2秒は？','OFF','ON','OFFスタートです。ONスタートやON/OFF時間が違うツインタイマもあります。'],
['sequence','順序始動：先に動いたら次へ','設備','先行機の運転確認を、後続機の許可条件にする。','起動でK1を運転し、K1運転確認の信号が入るとK2の始動を許可します。この例は確認が消えたらK2も停止する継続条件方式。起動時だけ確認する方式とは異なります。','起動 → 運転確認ON → 確認OFF。指令と確認は別物。','K1へ指令を出しただけで？','K2はまだ動かない','K2も動く','出力指令だけでは実際に運転した証拠になりません。ここでは別の確認信号を待ちます。'],
['reverse','正逆運転：停止して切り替える','設備','相互インターロックと自己保持を合わせる。','正転と逆転を、相手側が停止しているときだけ受け付けます。起動は押して離す一回の合図として扱います。停止すると自己保持解除。このモデルは停止後すぐ逆方向を選べますが、実機の惰性回転は再現しません。','正転起動 → 逆転起動 → 停止 → 逆転起動。','正転中に逆転起動すると？','受け付けない','すぐ逆転する','相手の動作で許可が切れます。実機は停止確認・待ち時間・機械的インターロックなども必要です。'],
['star','スターデルタ：間を空けて切替','設備','スターとデルタを同時に入れない。','起動で主接触器MとスターYをON。3秒後にYをOFFにし、1秒の切替待ちを置いてデルタDをON。ここでの時間は見やすくした教材値です。','起動 → 3秒：MだけON → さらに1秒：MとDがON。','YからDへの切替待ちは？','両方OFFにする時間','両方ONにする時間','YとDの同時投入を避けるためです。実機のタイマ値や端子結線として使用しないでください。'],
['pumps','交互運転：次はもう一台','設備','一つの出力を反転する操作とは別。','運転要求のたびにポンプA、次はBを選びます。要求OFFで停止した時点で次回担当を交代。電源断で次回をAに初期化する簡略モデルです。要求ONのまま復電するとAが再始動します。故障時の代替起動や増台は含みません。','要求ON → OFF → ON。担当がAからBへ交代する。','運転要求をONのままにすると？','同じ担当が運転を続ける','勝手に交代する','この例は一運転ごとに交代します。時間交代方式とは違います。'],
['alarm','警報記憶：復旧と確認は別','保護・操作','異常の消滅と、警報の解除を分ける。','異常が出たら警報ランプを記憶。原因が復旧してもランプは残し、復旧後のRESETで消します。異常が残る間はRESETしても消しません。この記憶は電源断で消えるモデルです。ただし異常入力が残れば、復電時に再び警報が点きます。','異常ON → RESET → 異常OFF → RESET。','原因復旧だけでランプは？','残る','消える','一時的に発生した異常の痕跡を確認するため、復旧と解除を分けています。'],
['jog','寸動：押す間だけ動かす','保護・操作','通常運転と、短く動かす操作を比較する。','通常起動は自己保持し、寸動は押している間だけ運転します。この教育モデルでは通常運転中の寸動指令を無視します。通常運転を停止してから寸動を試してください。寸動中のSTOPは、寸動を一度離すまで再始動を抑止します。寸動中に通常起動すると通常保持へ移ります。','通常起動 → 停止 → 寸動ON → OFF。','停止状態から寸動し離すと？','停止する','自己保持する','寸動では自己保持を成立させない条件を設けています。単にSTARTに別ボタンを並列追加するだけではありません。'],
['auto','手動・自動と運転許可','保護・操作','モードより上位に共通の停止条件を置く。','手動では手動指令、自動ではセンサ要求を使います。どちらでも共通の運転許可が必要です。指令は保持入力なので、許可が戻ると再始動します。復帰後の再起動防止を含まないモデルです。','手動指令ON → 許可OFF → ON。次に自動へ切替。','手動モードなら許可を無視できる？','できない','できる','手動と自動の両方に共通条件をかけています。実機の安全機能の代わりではありません。']
];
const lessons=data.map(([id,title,group,goal,copy,task,q,yes,no,why],i)=>({id,title,short:title.split('：')[0],group,goal,copy:'<p>'+copy+'</p>',task,terms:'図は動作条件を理解するための機能図です。端子結線図ではありません。入力・記憶・時間を操作し、下段の接点出力を追います。タイマ値は教材用。外部のスイッチ・信号は停電しても位置を保持し、停電中も変更できます。保持入力がONなら、復電で出力が再開する回路もあります。反転記憶とワンショットは復電そのものを立上り扱いせず、入力を一度OFF→ONにして再指令するモデルです。機器ごとの復帰・再入力・停電時の扱いは取扱説明書で確認します。',q,a:i%2?[no,yes]:[yes,no],correct:i%2?1:0,why}));
function fresh(){return {power:true,input:false,other:false,permit:true,auto:false,mem:false,t:0,age:0,remaining:0,run:false,jogBlocked:false,dir:0,next:0,assigned:0,history:[]};}
function output(id,s){if(!s.power)return Array(id==='star'?3:['sequence','reverse','pumps'].includes(id)?2:1).fill(false);switch(id){case'momentary':return[s.input];case'alternate':case'impulse':case'latch':case'alarm':return[s.mem];case'on':return[s.input&&s.age>=3];case'off':return[s.input||s.remaining>0];case'interval':return[s.input&&s.age<3];case'pulse':return[s.remaining>0];case'flicker':return[s.input&&Math.floor(s.age/2)%2===1];case'sequence':return[s.run,s.run&&s.other];case'reverse':return[s.dir===1,s.dir===2];case'star':return[s.run,s.run&&s.age<3,s.run&&s.age>=4];case'pumps':return[s.input&&s.assigned===0,s.input&&s.assigned===1];case'jog':return[s.run||(s.input&&!s.jogBlocked)];case'auto':return[s.permit&&(s.auto?s.other:s.input)];}return[false];}
function update(id,s,key){const was=s.input;
if(key==='input'){s.input=!s.input;if(id==='jog'){if(!s.input)s.jogBlocked=false;else if(s.run)s.jogBlocked=true;}if(id==='alternate'&&!was&&s.input)s.mem=!s.mem;}
if(key==='other')s.other=!s.other;if(key==='permit')s.permit=!s.permit;if(key==='auto')s.auto=!s.auto;
 if(key==='power'){s.power=!s.power;if(!s.power){s.mem=id==='alternate'?s.mem:false;s.remaining=0;s.age=0;s.run=false;s.dir=0;s.next=0;s.assigned=0;}}else if(key==='tick'){s.t++;if(s.power){if(s.input||s.run)s.age++;if(s.remaining>0)s.remaining--;}}else if(s.power){if(key==='start'&&!s.run){s.run=true;s.age=0;}if(key==='stop'){s.run=false;s.dir=0;s.age=0;if(id==='jog')s.jogBlocked=s.input;}if(key==='forward'&&s.dir===0)s.dir=1;if(key==='reverse'&&s.dir===0)s.dir=2;if(id==='alarm'&&key==='clear'&&!s.input)s.mem=false;
 
 if(id==='impulse'&&key==='input'&&!was&&s.input)s.mem=!s.mem;
 if(['on','interval','flicker'].includes(id)&&key==='input')s.age=0;
 if(id==='off'&&key==='input')s.remaining=s.input?0:3;
 if(id==='pulse'&&key==='input'&&!was&&s.input&&s.remaining===0)s.remaining=3;
 if(id==='pumps'&&key==='input'){if(s.input)s.assigned=s.next;else s.next=1-s.assigned;}
 }
 if(s.power&&id==='latch'){if(s.other)s.mem=false;else if(s.input)s.mem=true;}
 if(s.power&&id==='alarm'&&s.input)s.mem=true;
 const out=output(id,s);s.history.unshift(`${s.t}秒｜${({power:"電源切替",tick:"時間+1秒",input:"入力切替",other:"第2入力切替",permit:"許可切替",auto:"モード切替",start:"起動",stop:"停止",forward:"正転起動",reverse:"逆転起動",clear:"警報解除"})[key]||key}｜出力 ${out.map((x,i)=>(i+1)+':'+(x?'ON':'OFF')).join(' / ')}`);s.history=s.history.slice(0,6);return s;}
const names={sequence:['K1 先行','K2 後続'],reverse:['正転','逆転'],star:['主 M','スターY','デルタD'],pumps:['ポンプA','ポンプB']};
function controls(id,s){const a=[];const add=(k,label,on)=>a.push({key:k,label,on});add('power',s.power?'電源をOFF':'電源をON',s.power);
 if(['sequence','star','jog'].includes(id)){add('start','通常起動（1回）',false);add('stop','停止（1回）',false);}
 if(id==='reverse'){add('forward','正転起動（1回）',false);add('reverse','逆転起動（1回）',false);add('stop','停止（1回）',false);}
 if(!['sequence','star','reverse'].includes(id)){const label=id==='jog'?'寸動':id==='alarm'?'異常':id==='latch'?'SET':id==='pumps'?'運転要求':id==='auto'?'手動指令':'入力';add('input',label+'：'+(s.input?'ON → 離す／OFF':'OFF → 押す／ON'),s.input);}
 if(['sequence','latch','auto'].includes(id))add('other',(id==='sequence'?'運転確認':id==='latch'?'RESET':'自動要求')+'：'+(s.other?'ON → OFF':'OFF → ON'),s.other);
 if(id==='alarm')add('clear','警報RESET（1回）',false);
 if(id==='auto'){add('auto',s.auto?'自動 → 手動へ':'手動 → 自動へ',s.auto);add('permit',s.permit?'運転許可をOFF':'運転許可をON',s.permit);}
 add('tick','1秒進める',false);return a;}
function view(id,s){const out=output(id,s),labels=names[id]||['出力'];let why='';
const rules={momentary:'入力がONの間だけ閉じる',alternate:'機械保持の接点位置で決まる',impulse:'入力の立上りで記憶を反転',latch:'RESET優先の記憶',on:'入力ONが3秒続くと閉じる',off:'入力OFFから3秒後に開く',interval:'入力ONから3秒まで閉じる',pulse:'立上りから3秒だけ閉じる',flicker:'OFF 2秒 → ON 2秒を反復',sequence:'K1の運転確認がK2の条件',reverse:'相手OFFのときだけ起動受付',star:'M＋Y → Mのみ → M＋D',pumps:'要求が終わったら次回担当を交代',alarm:'異常を記憶、復旧後にRESET',jog:'通常は保持、寸動は押す間のみ',auto:'許可 AND 選択したモードの指令'};
why=!s.power?'電源OFF。出力はすべてOFF。'+(id==='alternate'?'機械的な接点位置は保持。':'内部の運転記憶・計時はリセット。外部の入力・モード・許可の位置は残ります。'):rules[id]+'。現在：'+out.map((x,i)=>labels[i]+' '+(x?'ON':'OFF')).join(' ／ ');
if(['on','interval','flicker','star'].includes(id))why+=`（経過 ${s.age}秒）`;if(['off','pulse'].includes(id))why+=`（残り ${s.remaining}秒）`;
if(id==='jog'&&s.jogBlocked)why+=' 寸動入力をいったんOFFに戻すまで、寸動の再始動を抑止しています。';
const circuits={momentary:'＋ ─ 押ボタンa ─ ランプ ─ 0V',alternate:'＋ ─ 機械保持形スイッチa ─ ランプ ─ 0V',impulse:'押ボタンa → 立上り検出 → 反転記憶 → 出力',latch:'SET／RESET → RESET優先の記憶 → 出力',on:'入力 → ON遅延T（3秒） → Tの限時a接点 → 出力',off:'常時電源＋入力 → OFF遅延T（3秒） → T接点 → 出力',interval:'入力 → 区間出力T（3秒・入力OFFで中止） → 出力',pulse:'立上り → 単発出力T（3秒・再トリガ無視） → 出力',flicker:'入力 → 反復T（OFF2秒／ON2秒） → 出力',sequence:'起動／停止 → K1の記憶\nK1運転中 AND 運転確認 → K2',reverse:'正転起動 AND 逆転停止 → 正転保持\n逆転起動 AND 正転停止 → 逆転保持\n停止 → 両方の保持解除',star:'起動 → 主M保持＋スターY\n3秒 → Y解除 → 1秒待ち → デルタD\n停止 → M・Y・D解除',pumps:'要求ON → 次回担当を選択 → AまたはB\n要求OFF → 停止＋次回担当を反転',alarm:'異常 → 警報を記憶\n異常なし AND RESET → 記憶解除',jog:'通常起動 → 運転保持\n通常停止時の寸動入力 → 保持せず運転\n停止 → 保持・寸動を解除',auto:'許可 AND（手動選択 AND 手動指令\n OR 自動選択 AND 自動要求） → 出力'};
const detail=['alternate','impulse','latch','alarm'].includes(id)?'記憶 '+(s.mem?'ON':'OFF'):['sequence','star','jog'].includes(id)?'通常運転保持 '+(s.run?'ON':'OFF'):id==='reverse'?'方向記憶 '+['停止','正転','逆転'][s.dir]:id==='pumps'?'次回担当 '+(s.next?'B':'A'):id==='auto'?'モード '+(s.auto?'自動':'手動')+' ／ 許可 '+(s.permit?'ON':'OFF'):'経過 '+s.age+'秒 ／ 残り '+s.remaining+'秒';
const rows=out.map((on,i)=>`<div class="functional-row ${on?'running':''}"><span>電源</span><b>→</b><span>出力接点<br>${(id==='alternate'?s.mem:id==='momentary'?s.input:on)?'閉':'開'}</span><b>→</b><span>${labels[i]}<br><strong>${on?'ON':'OFF'}</strong></span><b>→</b><span>戻り</span></div>`).join('');
return {why,html:`<div class="function-diagram"><p class="caption">機能図：${rules[id]}<br>内部論理を省略した出力側の模式図です。</p><pre class="circuit-recipe">${circuits[id]}</pre><div class="logic-box"><b>入力・記憶・時間</b><p>入力 ${s.input?'ON':'OFF'} ／ 第2入力 ${s.other?'ON':'OFF'}<br>${detail} ／ 模擬時刻 ${s.t}秒</p></div><p class="caption">↓ 条件を判定して出力接点を動かす</p>${rows}</div>`,history:s.history};}
root.SequenceExtra={lessons,fresh,update,output,controls,view};
})(typeof module!=='undefined'?module.exports:window);
