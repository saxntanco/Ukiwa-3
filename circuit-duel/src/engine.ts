import {CARDS,CARD_IDS,type CardId} from './cards.js';
export type Side=0|1;
export interface Instance {uid:string;card:CardId}
export interface Unit extends Instance {attack:number;health:number;maxHealth:number;ready:boolean;born:number}
export interface Player {life:number;energy:number;maxEnergy:number;deck:Instance[];hand:Instance[];board:Unit[];fatigue:number;turns:number}
export interface Event {kind:'summon'|'attack'|'damage'|'destroy'|'heal'|'draw'|'spell'|'turn'|'result'|'info';text:string;ids?:string[]}
export interface State {players:[Player,Player];active:Side;first:Side;turn:number;winner:Side|'draw'|null;logs:string[];events:Event[]}
export type Target={side:Side;uid:string|'hero'};
export type Action={type:'play';uid:string;target?:Target}|{type:'attack';uid:string;target:Target}|{type:'end'};
export interface Result {state:State;ok:boolean;error?:string}
export const other=(s:Side):Side=>s===0?1:0;
const who=(s:Side)=>s===0?'あなた':'CPU';
export function seeded(seed:number):()=>number{return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function event(s:State,kind:Event['kind'],text:string,ids:string[]=[]){s.events.push({kind,text,ids});s.logs.push(text);if(s.logs.length>80)s.logs.shift()}
export function settle(s:State){
 for(const p of s.players){for(const u of p.board.filter(u=>u.health<=0))event(s,'destroy',`${CARDS[u.card].name}が破壊された。`,[u.uid]);p.board=p.board.filter(u=>u.health>0)}
 if(s.winner!==null)return;
 const dead=s.players.map(p=>p.life<=0);
 if(dead[0]||dead[1]){s.winner=dead[0]&&dead[1]?'draw':dead[0]?1:0;event(s,'result',s.winner==='draw'?'決闘は引き分け。':`${who(s.winner)}の勝利。`)}
}
function draw(s:State,side:Side){
 const p=s.players[side];const c=p.deck.pop();
 if(!c){p.life-=++p.fatigue;event(s,'damage',`${who(side)}はデッキ切れ。疲労${p.fatigue}ダメージ。`,[`hero-${side}`]);settle(s);return}
 if(p.hand.length>=8){event(s,'info',`${who(side)}の手札が上限の8枚。引いたカードは破棄。`);return}
 p.hand.push(c);event(s,'draw',`${who(side)}がカードを1枚引いた。`);
}
function startTurn(s:State){
 const p=s.players[s.active];p.turns++;p.maxEnergy=Math.min(8,p.maxEnergy+1);p.energy=p.maxEnergy;
 p.board.forEach(u=>u.ready=true);event(s,'turn',`TURN ${s.turn} · ${who(s.active)}のターン。エネルギー${p.energy}。`);
 if(s.turn!==1)draw(s,s.active);
}
export function newGame(rng:()=>number=Math.random, decks?:readonly [readonly CardId[],readonly CardId[]]):State{
 const make=(side:Side):Player=>{const cards=decks?.[side]??CARD_IDS.flatMap(card=>[card,card]);if(cards.length!==20||cards.some(c=>!CARDS[c]))throw new Error('デッキは登録カード20枚です');const deck:Instance[]=cards.map((card,n)=>({card,uid:`${side}-${card}-${n}`}));for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}return {life:20,energy:0,maxEnergy:0,deck,hand:[],board:[],fatigue:0,turns:0}};
 const first:Side=rng()<.5?0:1;const s:State={players:[make(0),make(1)],active:first,first,turn:1,winner:null,logs:[],events:[]};
 for(let n=0;n<3;n++){draw(s,0);draw(s,1)}event(s,'info',`${who(first)}が先攻。最初のターンのドローはありません。`);startTurn(s);return s;
}
export function targets(s:State,side:Side,card:CardId):Target[]{
 if(CARDS[card].type==='unit')return [];
 const sideTarget=card==='overclock'?side:other(side);
 const out:Target[]=s.players[sideTarget].board.map(u=>({side:sideTarget,uid:u.uid}));
 if(card==='lightning')out.push({side:sideTarget,uid:'hero'});return out;
}
export function attackTargets(s:State,side:Side):Target[]{const enemy=other(side),b=s.players[enemy].board,g=b.filter(u=>CARDS[u.card].guard);return g.length?g.map(u=>({side:enemy,uid:u.uid})):[...b.map(u=>({side:enemy,uid:u.uid})),{side:enemy,uid:'hero'}]}
const same=(a:Target,b:Target)=>a.side===b.side&&a.uid===b.uid;
export function playReason(s:State,side:Side,uid:string):string{
 if(s.winner!==null)return '対戦は終了しました';if(s.active!==side)return '相手のターンです';
 const p=s.players[side],c=p.hand.find(c=>c.uid===uid);if(!c)return '手札にありません';const def=CARDS[c.card];
 if(p.energy<def.cost)return `エネルギー不足（必要${def.cost}）`;
 if(def.type==='unit'&&p.board.length>=5)return '盤面上限：5体';
 if(def.type==='spell'&&!targets(s,side,c.card).length)return '対象のユニットがいません';return '';
}
export function attackReason(s:State,side:Side,uid:string):string{
 if(s.winner!==null)return '対戦は終了しました';if(s.active!==side)return '相手のターンです';
 const u=s.players[side].board.find(u=>u.uid===uid);if(!u)return '盤面にいません';
 if(!u.ready)return u.born===s.turn&&!CARDS[u.card].rush?'召喚したターンは攻撃できません':'このターンは行動済みです';return '';
}
export function legalActions(s:State,side:Side=s.active):Action[]{
 if(s.winner!==null||s.active!==side)return [];
 const out:Action[]=[];for(const c of s.players[side].hand){if(playReason(s,side,c.uid))continue;if(CARDS[c.card].type==='unit')out.push({type:'play',uid:c.uid});else for(const t of targets(s,side,c.card))out.push({type:'play',uid:c.uid,target:t})}
 for(const u of s.players[side].board){if(attackReason(s,side,u.uid))continue;for(const t of attackTargets(s,side))out.push({type:'attack',uid:u.uid,target:t})}return [...out,{type:'end'}];
}
export function apply(s:State,side:Side,a:Action):Result{
 const fail=(error:string):Result=>({state:s,ok:false,error});
 if(s.winner!==null)return fail('対戦は終了しました');if(s.active!==side)return fail('相手のターンです');
 if(a.type==='play'){
 const reason=playReason(s,side,a.uid);if(reason)return fail(reason);const c=s.players[side].hand.find(c=>c.uid===a.uid)!;
 if(CARDS[c.card].type==='spell'&&(!a.target||!targets(s,side,c.card).some(t=>same(t,a.target!))))return fail('合法な対象を選んでください');
 }else if(a.type==='attack'){
 const reason=attackReason(s,side,a.uid);if(reason)return fail(reason);if(!attackTargets(s,side).some(t=>same(t,a.target)))return fail('守護を含む攻撃対象を確認してください');
 }else if(a.type!=='end')return fail('不明な操作です');
 const n:State=structuredClone(s);n.events=[];const p=n.players[side],foe=n.players[other(side)];
 if(a.type==='end'){n.active=other(side);n.turn++;startTurn(n);return {ok:true,state:n}}
 if(a.type==='attack'){
 const u=p.board.find(u=>u.uid===a.uid)!;u.ready=false;
 event(n,'attack',`${who(side)}の${CARDS[u.card].name}が${a.target.uid==='hero'?'敵本体':CARDS[foe.board.find(v=>v.uid===a.target.uid)!.card].name}へ攻撃。`,[u.uid,a.target.uid==='hero'?`hero-${a.target.side}`:a.target.uid]);
 if(a.target.uid==='hero'){foe.life-=u.attack;event(n,'damage',`本体に${u.attack}ダメージ。`,[`hero-${a.target.side}`])}
 else{const v=foe.board.find(v=>v.uid===a.target.uid)!;const x=u.attack,y=v.attack;v.health-=x;u.health-=y;event(n,'damage',`${x}ダメージ、反撃${y}ダメージ。`,[u.uid,v.uid])}
 settle(n);return {ok:true,state:n};
 }
 const c=p.hand.find(c=>c.uid===a.uid)!,def=CARDS[c.card];p.energy-=def.cost;p.hand=p.hand.filter(v=>v.uid!==c.uid);
 if(def.type==='unit'){
 p.board.push({...c,attack:def.attack,health:def.health,maxHealth:def.health,ready:!!def.rush,born:n.turn});event(n,'summon',`${who(side)}が${def.name}を召喚。`,[c.uid]);
 if(c.card==='capacitor'){const heal=Math.min(2,20-p.life);p.life+=heal;event(n,'heal',`${who(side)}のライフを${heal}回復。`,[`hero-${side}`])}
 if(c.card==='coil')draw(n,side);
 if(c.card==='tesla'){for(const u of foe.board)u.health-=2;event(n,'damage','雷帝の雷：敵ユニットすべてに2ダメージ。',foe.board.map(u=>u.uid))}
 }else{
 const t=a.target!;event(n,'spell',`${who(side)}が${def.name}を使用。`,[t.uid==='hero'?`hero-${t.side}`:t.uid]);
 if(c.card==='overclock'){p.board.find(u=>u.uid===t.uid)!.attack+=2;event(n,'info','攻撃力が永続的に2上昇。攻撃回数は変わりません。',[t.uid])}
 else{const damage=c.card==='short'?3:4;if(t.uid==='hero')n.players[t.side].life-=damage;else n.players[t.side].board.find(u=>u.uid===t.uid)!.health-=damage;event(n,'damage',`${damage}ダメージ。`,[t.uid==='hero'?`hero-${t.side}`:t.uid])}
 }settle(n);return {ok:true,state:n};
}
