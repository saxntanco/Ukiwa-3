export type CardId='spark'|'resistor'|'capacitor'|'diode'|'coil'|'transistor'|'tesla'|'short'|'overclock'|'lightning';
export interface Card {id:CardId;name:string;cost:number;type:'unit'|'spell';attack:number;health:number;guard?:boolean;rush?:boolean;rule:string;flavor:string;color:string;}
export const CARDS:Readonly<Record<CardId,Readonly<Card>>>=Object.freeze(Object.fromEntries([
 {id:'spark',name:'電子のスパーク',cost:1,type:'unit',attack:1,health:1,rush:true,rule:'速攻',flavor:'一瞬のきらめきが、世界を動かす。',color:'#63e7ff'},
 {id:'resistor',name:'抵抗の番人レジスタ',cost:2,type:'unit',attack:1,health:4,guard:true,rule:'守護',flavor:'この先へは、一アンペアも通さない。',color:'#e5b867'},
 {id:'capacitor',name:'蓄電士キャパシタ',cost:2,type:'unit',attack:2,health:2,rule:'召喚時：自分のライフを2回復。',flavor:'明日のために、光をひとしずく。',color:'#8ef0ca'},
 {id:'diode',name:'整流騎士ダイオード',cost:3,type:'unit',attack:3,health:3,rule:'特殊能力なし',flavor:'迷わない。光の向かう、その先へ。',color:'#e7efff'},
 {id:'coil',name:'磁場使いコイル',cost:3,type:'unit',attack:2,health:4,rule:'召喚時：カードを1枚引く。',flavor:'見えぬ糸で、次の運命をたぐる。',color:'#c4a0ff'},
 {id:'transistor',name:'増幅竜トランジスタ',cost:5,type:'unit',attack:5,health:4,rule:'特殊能力なし',flavor:'小さな囁きが、竜の咆哮に変わる。',color:'#fd95b5'},
 {id:'tesla',name:'雷帝テスラ',cost:7,type:'unit',attack:5,health:6,rule:'召喚時：敵ユニットすべてに2ダメージ。',flavor:'空よ、我が回路となれ。',color:'#f6db7a'},
 {id:'short',name:'ショートサーキット',cost:2,type:'spell',attack:0,health:0,rule:'敵ユニット1体に3ダメージ。',flavor:'一つの綻びが、秩序を焼き切る。',color:'#fc819c'},
 {id:'overclock',name:'オーバークロック',cost:1,type:'spell',attack:0,health:0,rule:'味方ユニット1体の攻撃力を永続的に+2。',flavor:'限界は、まだ測定されていない。',color:'#a8a1ff'},
 {id:'lightning',name:'落雷',cost:4,type:'spell',attack:0,health:0,rule:'敵ユニット1体、または敵本体に4ダメージ。',flavor:'静寂の終わりを、空が告げる。',color:'#f3db79'},
].map(c=>[c.id,Object.freeze(c)]))) as Readonly<Record<CardId,Readonly<Card>>>;
export const CARD_IDS=Object.keys(CARDS) as CardId[];
