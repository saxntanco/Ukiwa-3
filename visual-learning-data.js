/* Original educational illustrations. Not photographs or installation drawings. */
(()=>{'use strict';
const rect=(x,y,w,h,fill='#dae7ec',r=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="#49697d" stroke-width="3"/>`;
const line=d=>`<path class="uv-wire" d="${d}"/>`;
const text=(x,y,s,small=false)=>`<text x="${x}" y="${y}" text-anchor="middle"${small?' class="uv-small"':''}>${s}</text>`;
const circle=(x,y,r,fill='#fff')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#49697d" stroke-width="3"/>`;
const part=(n,s)=>`<g data-part="${n}">${s}</g>`;
const pin=(n,x,y)=>`<circle class="uv-marker" cx="${x}" cy="${y}" r="16"/><text class="uv-number" x="${x}" y="${y+6}" text-anchor="middle">${n}</text>`;
const meter=(x,y,label)=>rect(x,y,150,190,'#e0ebef',20)+rect(x+18,y+22,114,46,'#fff',5)+text(x+75,y+51,label)+circle(x+75,y+115,26)+line(`M${x+75} ${y+115} l15 -16`)+circle(x+40,y+165,7,'#dd7555')+circle(x+110,y+165,7,'#294452');
const earth=(x,y)=>line(`M${x} ${y} v18 m-25 0 h50 m-40 9 h30 m-22 9 h14`);
const coil=(x,y)=>line(`M${x} ${y} c0 -22 28 -22 28 0 c0 -22 28 -22 28 0 c0 -22 28 -22 28 0`);
const src={relay:['オムロン：保護継電器の原理・実物資料','https://www.fa.omron.co.jp/guide/technicalguide/65/148/'],switch:['オムロン：リレーの構造と動作','https://www.fa.omron.co.jp/guide/technicalguide/36/65/'],vcb:['三菱電機：VCBの製品写真・資料','https://fa-faq.mitsubishielectric.co.jp/fa/products/mvd/vcbvmc/items/vcb/index.html'],ppe:['ヨツギ：保護具・防具の製品写真','https://www.yotsugi.co.jp/products/'],cal:['HIOKI：校正書類の説明','https://www.hioki.com/jp-ja/support/service/document.html']};
const scenes={
vcb:{title:'VCBの「外側」と「接点」をつなげて見る',art:
part(1,rect(50,110,300,210)+[110,200,290].map(x=>rect(x-20,35,40,125,'#d5b89a')+rect(x-30,65,60,12,'#efe4d7')+rect(x-30,100,60,12,'#efe4d7')).join('')+rect(90,195,90,45,'#fff')+text(135,224,'入 / 切')+circle(260,220,25,'#e6aa45')+pin(1,75,145)+text(200,357,'三相分の主回路と操作機構'))+
part(2,rect(520,45,210,245,'#e3f2f6',60)+rect(605,28,40,100,'#95aab6',4)+rect(580,125,90,16,'#bd8152',3)+rect(580,188,90,16,'#bd8152',3)+rect(605,206,40,93,'#95aab6',4)+text(625,172,'接点間')+pin(2,530,65)+text(625,331,'真空バルブの概念断面'))+
part(3,line('M350 210 H420 V360 H625 V300')+text(430,390,'機構が可動接点を動かす',true)+pin(3,410,250)),steps:[['全体を見る','上の三つは三相分の主回路を表しています。手前の機構が開閉を担います。配置や外観はメーカー・型式で異なります。'],['接点を見る','右は一極の内部を抜き出した図。開いた二つの接点の間と、導電部から外郭までの絶縁は、調べる場所が違います。'],['試験と結びつける','接点を閉じたときの主回路抵抗、開いた接点間の確認、機構の動作を分けます。メガーの値だけで遮断性能のすべては分かりません。']],source:src.vcb},
relay:{title:'検出する・判断する・切る。別々の機器を見る',art:
part(1,line('M40 80 H390')+circle(170,80,48,'#dae7ec')+circle(170,80,25)+line('M40 80 H390 M140 125 V215 H390 M200 125 V195 H390')+text(170,160,'CT')+pin(1,80,140))+
part(2,rect(390,140,200,190,'#d6e7ec')+rect(415,165,150,45,'#fff')+text(490,195,'OCR')+[435,490,545].map(x=>circle(x,253,16)).join('')+text(490,304,'整定・動作表示',true)+pin(2,410,130))+
part(3,rect(660,35,170,140)+line('M390 80 H720 M720 80 l55 -28 M775 80 H860 M590 250 H745 V175')+text(745,138,'VCB')+text(723,287,'引外し指令',true)+pin(3,830,195)),steps:[['CTで電流を取り出す','主回路の電流を、保護継電器が扱う二次電流へ変換するのがCTです。図はOCRの代表的な役割分担を示します。'],['リレーが判断する','OCRは受け取った電流と整定条件から動作を判断します。DGR・OVGR・RPRでは見る量が違うので、本文の型式別説明へ進んでください。'],['遮断器が電路を切る','大きな主回路電流を実際に遮断するのはVCBなどです。リレーの動作確認と、遮断器までの連動確認は同じ範囲ではありません。']],source:src.relay},
ct:{title:'CTの一次側・二次側を、同じ図で見る',art:
part(1,line('M45 115 H845')+text(450,65,'主回路の導体（一次側）')+pin(1,80,80))+
part(2,circle(420,115,85,'#c8dbe3')+circle(420,115,48,'#f4f8fa')+line('M45 115 H845 M377 188 V290 H630 M463 188 V330 H630')+pin(2,320,170)+text(415,240,'CT'))+
part(3,meter(630,210,'A')+text(210,320,'二次配線 →')+pin(3,810,270)),steps:[['一次側はどこ？','負荷へ電力を送る主回路側です。図は導体がCTの窓を通る形の概念図で、巻線形など外観の違うCTもあります。'],['比率は何を表す？','例えば100/5 Aという表示は、定格一次電流100 Aに対する定格二次電流5 Aを表します。実物では銘板の比率・精度・負担も確認します。'],['二次側はどこへ？','電流計や保護継電器へつながります。一次通電中のCT二次開放は危険です。図は配線変更の手順ではありません。']],source:src.relay},
cable:{title:'ケーブルの「太さ」と「長さ」を見分ける',art:
part(1,rect(90,100,550,190,'#365267',70)+circle(650,195,96,'#365267')+circle(650,195,70,'#e3b263')+circle(650,195,42,'#ba783f')+pin(1,765,170)+text(650,335,'断面：導体と絶縁体'))+
part(2,line('M95 65 H635 M95 55 V75 M635 55 V75')+text(360, 40,'長さ L')+pin(2,70,45))+
part(3,line('M650 195 L810 275')+text(767,305,'導体断面積',true)+pin(3,810,330)),steps:[['外径と導体の太さは別','外から見える太さには絶縁体や外被も含まれます。sq（mm²）は導体の断面積で、外径そのものではありません。'],['長さも結果に効く','同じ太さでも長くなれば、電圧降下や耐圧試験時の充電電流に関係します。入力欄のmとkmにも注意します。'],['何を計算するページ？','電線選定では許容電流・電圧降下・敷設条件などを、交流耐圧では静電容量・周波数・電圧などを扱います。同じケーブルでも見ている性質が違います。']]},
insulation:{title:'機器の見た目から「測っている壁」へ',art:
part(1,meter(65,100,'MΩ')+pin(1,60,70))+
part(2,rect(480,90,300,210,'#e0e8ed')+circle(630,190,74,'#adc9d6')+circle(630,190,45,'#f7d995')+coil(588,190)+text(630,340,'巻線と金属フレーム')+pin(2,790,115))+
part(3,line('M105 265 V345 H420 V190 H588 M175 265 V380 H780 V280')+text(360,330,'導電部側',true)+text(425,405,'外郭側',true)+pin(3,440,235)),steps:[['メガーを見る','絶縁抵抗計は試験用の直流電圧を加え、流れる電流から絶縁抵抗を求めます。通常の通電電流を測るクランプメーターとは目的が違います。'],['絶縁の壁を見る','この例で知りたいのは巻線と金属フレームの間。巻線の銅線そのものの抵抗を測っているのではありません。'],['どこまでつながっている？','開いた接点の先や、切り離した回路は同じ測定に含まれないことがあります。本文の測定範囲切替で、つながりを追ってください。']],related:['insulation-resistance-principle.html#scope-demo','接点の状態で測定範囲を切り替える']},
earth:{title:'地面に挿す3本の役割を見分ける',art:
part(1,meter(50,50,'Ω')+line('M90 215 V285 H300 V370')+text(300,265,'E：測定対象')+pin(1,260,310))+
part(2,line('M150 215 V240 H530 V370')+text(530,220,'P：電位を見る')+pin(2,490,300))+
part(3,line('M185 215 V175 H770 V370')+text(770,145,'C：電流を流す')+pin(3,735,300))+rect(240,330,600,70,'#dacfb8',4)+[300,530,770].map(x=>line(`M${x} 320 V375`)).join('')+text(540,405,'地中の経路を利用する（配置・間隔は実機取説による）',true),steps:[['Eは対象の接地極','接地抵抗を知りたい対象です。メガーで絶縁の壁を測る場合とは、対象も測定原理も異なります。'],['Pは電位を見るため','対象と補助極の配置による電位分布を考えます。とりあえず近くへ3本挿せばよい、という意味ではありません。'],['Cは測定電流の経路','三極法では電流を流す経路と電位を測る役割を分けます。ET-5の内部方式や二極法との違いは、本文の図で続けて確認できます。']],related:['earth-resistance-et5.html','ET-5の原理図と二極法を見る']},
cal:{title:'基準と測定値を、並べて見る',art:
part(1,rect(70,95,250,200,'#c9dfe8')+rect(95,125,200,70,'#fff')+text(195,170,'100.0 V')+text(195,245,'参照値')+pin(1,65,65))+
part(2,meter(560, 95,'100.5')+text(635,335,'被校正計器（V）')+pin(2,765,120))+
part(3,line('M320 145 H460 V125 H560 M320 265 H465 V260 H560')+text(415,360,'差は ＋0.5 V')+pin(3,400,300)),steps:[['基準を確かめる','図の100.0 Vは参照値とした教育用の例です。校正では標準器の補正や不確かさ、使用範囲も確認します。'],['同じ条件で比べる','被校正計器が100.5 Vなら、参照値との差は+0.5 V。AC/DC、レンジ、周波数などが違う結果を一緒にしません。'],['差と合否は別','誤差が分かっただけでは判定は確定しません。許容差・不確かさ・判定ルールをそろえます。%rdgと%f.s.の違いは下の数値例で確認できます。']],source:src.cal},
tools:{title:'工具は「先端」と「相手」を組み合わせて見る',art:
part(1,rect(100,185,55,165,'#64a2b7',20)+line('M127 185 V65')+rect(116,35,23,36,'#aabcc7',2)+circle(235,65,32)+line('M217 65 H253')+pin(1,70,180)+text(160,390,'刃先とねじ溝'))+
part(2,line('M400 340 V180')+circle(400,150,43,'#aac0cc')+rect(375,125,50,50,'#fff',7)+rect(475, 95,75,100,'#b5c8d1',12)+text(472,240,'ソケット',true)+pin(2,355,270)+text(425,390,'二面幅・差込角'))+
part(3,line('M670 330 L735 150 L800 330 M735 150 L695 65 M735 150 L780 65')+circle(735,150,15,'#dba84d')+pin(3,805,180)+text(735,390,'刃・つかみ面')),steps:[['ドライバー','ねじに触れるのは先端です。柄の大きさだけで選ばず、溝に合う幅・厚さ・形状を照合します。図はマイナス形の例です。'],['ラチェットとソケット','ボルト側の二面幅と、ハンドル側の差込角は別の寸法です。「17 mm」といった記憶だけで、すべての機器に共通とは扱いません。'],['ニッパー・ペンチ','切る刃と、つかむ面では用途が違います。対応する材料・太さも確認します。柄の被覆だけでは、絶縁工具としての適合を判断できません。']]},
ppe:{title:'保護具は「形」と「守る部分」を対応させる',art:
part(1,'<path d="M100 335 V200 L75 145 Q68 125 85 120 L120 155 V72 Q120 50 138 60 L145 145 V50 Q153 33 169 48 L175 145 V65 Q185 45 199 64 L205 155 V100 Q222 83 231 105 V225 L210 335Z" fill="#edc879" stroke="#75563b" stroke-width="4"/>'+pin(1,65,265)+text(155,380,'手袋：内側と外側'))+
part(2,'<path d="M380 70 H470 V230 Q480 260 545 275 V335 H365 V280 Q380 220 380 70Z" fill="#c3d5df" stroke="#49697d" stroke-width="4"/>'+pin(2,530,170)+text(450,380,'長靴：胴部と底'))+
part(3,'<path d="M630 225 Q640  80 735 95 Q830 100 840 225Z" fill="#eed274" stroke="#80683d" stroke-width="4"/>'.replace(' 80','80')+rect(615,225,240,24,'#d9b755')+line('M700 120 V220 M770 120 V220')+pin(3,825, 80)+text(735,380,'帽体：用途区分を確認')),steps:[['手袋の内外','水を用いる試験では、内外の水を電極として扱う指定方法があります。ゴムの壁を通る経路と、縁を回り込む経路を区別します。'],['形状で治具が違う','長靴・シート・管などは形が違うので、電極や対象範囲も同じではありません。試験条件は品目と型式の資料に対応させます。'],['ヘルメットの区分','見た目が似ていても、電気用としての適合を外観だけで判断しません。表示と取説を確認します。水槽の詳しい断面図は本文で拡大できます。']],source:src.ppe},
switch:{title:'コイルの電気と、接点の動きを結びつける',art:
part(1,rect( 80,130,260,170,'#ccdde6')+[150,185,220,255].map(x=>`<ellipse cx="${x}" cy="215" rx="25" ry="70" fill="none" stroke="#b57b45" stroke-width="9"/>`).join('')+line('M90 200 H325')+pin(1,65,100)+text(210,355,'コイルと鉄心'))+
part(2,line('M345 170 L590 125 M360 170 V320')+circle(360,170,12,'#b1c7d2')+text(465, 80,'可動部')+pin(2,435,210))+
part(3,line('M595 125 H700 M700 175 H835')+circle(700,125,7,'#d6a34f')+circle(700,175,7,'#d6a34f')+text(735,250,'接点')+pin(3,795,100)+text(660,355,'電磁力による動きを概念化')),steps:[['コイルに注目','コイルへ電気を流すと磁力が生じます。コイル端子と、負荷を開閉する接点端子は役割が違います。'],['動く部分に注目','電磁力で可動部が動き、接点の状態が変わります。図は仕組みを示すもので、特定機種の内部構造ではありません。'],['接点から回路へ','a接点・b接点を、コイルの状態と組み合わせて読みます。本文のスイッチを操作して、入れる前と後を見比べてください。']],source:src.switch},
generator:{title:'燃料から電気になるまでを追う',art:
part(1,rect(55,140,270,180,'#bbd3dd')+rect(90,85,200,55,'#94b2c1')+[125,190,255].map(x=>rect(x,160,30, 80,'#ecf2f5',3)).join('')+line('M115 85 V45 H300')+pin(1,50, 70)+text(190,365,'エンジン'))+
part(2,line('M325 235 H450')+circle(500,235,85,'#ccdce4')+circle(500,235,50,'#91b2c2')+text(500,240,'G')+pin(2,390,155)+text(500,365,'回転 → 発電'))+
part(3,line('M585 235 H675')+rect(675,125,180,200,'#e0e9ee')+rect(705,155,120,55,'#fff')+text(765,190,'V・Hz')+rect(725,245,80,40,'#476a7b')+pin(3,830,100)+text(765,365,'制御盤・遮断器')),steps:[['エンジン','燃料を使って回転する部分です。冷却・潤滑・排気など、電気以外の状態も点検対象になります。'],['交流発電機','回転を電気に変える部分です。エンジンの回転状態と、発電電圧・周波数などをつなげて考えます。'],['制御と負荷','発電しただけで負荷へ送れるとは限りません。成立条件・遮断器・切替器の状態を、本文の時間図で確認してください。']]},
ground:{title:'中性点は、三つの巻線のつなぎ目',art:
part(1,'<g transform="translate(400 200)">'+[0,150,210].map(a=>'<g transform="rotate('+a+')">'+line('M0 0 H80 M164 0 H270')+coil(80,0)+'</g>').join('')+'</g>'+circle(400,200,8,'#c78937')+text(145,45,'巻線1')+text(140,365,'巻線2')+text(740,170,'巻線3')+pin(1,75,175))+
part(2,line('M400 200 V320')+text(505,280,'中性点 N')+pin(2,470,230))+
part(3,rect(365,320,70,45,'#d9c6a0')+text(560,350,'接地方式による機器',true)+earth(400,365)+pin(3,315,350)),steps:[['三相の巻線を見る','星形（Y）の結線では、三つの巻線の一端をまとめた点があります。図の中央が、その電気的なつなぎ目です。'],['中性点と外箱は別','中性点は巻線のつなぎ目で、機器の金属外箱のことではありません。どの電圧側の巻線を扱っているかも区別します。'],['どの接地の話？','PC接地では中性点と大地の間に消弧リアクトルを用います。低圧側B種接地とは話の対象が違います。本文の系統図で位置を確認してください。']],related:['pc-grounding-guide.html','PC接地とB種接地の違いを図で見る']},
workflow:{title:'現物・図面・記録を、同じ対象で結ぶ',art:
part(1,rect(50,55,220,300,'#d3e1e8')+rect(75,90,170,100,'#fff')+text(160,145,'型式 / 製番')+rect(100,235,120,60,'#567889')+pin(1,65,40)+text(160,395,'対象を特定'))+
part(2,rect(345,55,220,300,'#fff',3)+line('M380 105 H530 M380 180 H420 L465 150 M465 180 H530 M460 180 V300')+text(455,335,'配線・状態',true)+pin(2,360,40)+text(455,395,'何を確かめる？'))+
part(3,rect(640,55,220,300,'#fff',3)+[120,175,230,285].map(y=>line(`M665 ${y} H835`)).join('')+text(750,100,'条件・結果',true)+pin(3,655,40)+text(750,395,'前後を記録')),steps:[['対象をそろえる','機器名だけでなく完全型式や対象回路を照合します。同じような外観でも、端子や試験条件まで同じとは限りません。'],['図面と照合する','今の状態と、確認したい箇所を結びつけます。対象とする範囲が分からないまま、似た図の配線を実機へ当てはめません。'],['結果を結びつける','設定条件・測定値・動作したものを分けて残します。復旧後の状態も確認し、「操作した」と「目的を満たした」を区別します。']]}
};
// Licensed photographs are unmodified; diagrams are independent original works.
scenes.switch.photo={url:'https://upload.wikimedia.org/wikipedia/commons/3/3c/Contactor_DIN_IEK.jpg',name:'電磁接触器の実物例（IEK製）',description:'主回路端子・補助接点端子・コイル端子の表示を見比べるための外観例です。国内の個別機種の端子配置を示す写真ではありません。',credit:'Kae / Wikimedia Commons',source:'https://commons.wikimedia.org/wiki/File:Contactor_DIN_IEK.jpg',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'};
scenes.cal.photo={url:'https://upload.wikimedia.org/wikipedia/commons/a/aa/Multimeter_Lab.jpg',name:'アナログテスターの実物例',description:'上部の指針と目盛、中央のレンジ切替、リードを見比べます。ET-5・IR4052・DI-05Nの写真ではなく、校正値を読む計器の外観例です。',credit:'Aldestyo / Wikimedia Commons',source:'https://commons.wikimedia.org/wiki/File:Multimeter_Lab.jpg',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'};
// All illustrations are original and use no customer photographs.
window.UkiwaVisualData={scenes,pages:{
'vcb-inspection-guide.html':'vcb','instrument-calibration-guide.html':'cal','field-essentials.html':'tools','ppe-withstand-guide.html':'ppe',
'ct-calculator.html':'ct','ocr-tap-calculator.html':'relay','cable-size-simulator.html':'cable','ac-withstand-test-simulator.html':'cable',
'insulation-resistance-principle.html':'insulation','earth-resistance-et5.html':'earth','sequence-basics.html':'switch','motor-protection-relays.html':'switch',
'generator-rescue-island.html':'generator','pc-grounding-guide.html':'ground','ukiwamemo_kyounonande_b_ground_transformer.html':'ground',
'ukiwamemo_kyounonande_taiatsu_reactor_ic.html':'cable','ukiwamemo_kyounonande_shg_df3_ic_io.html':'relay',
'relay-basics.html':'relay','protective-relay.html':'relay','relay-test-reference.html':'relay','relay-quickref.html':'workflow',
'relay-wiring.html':'workflow','relay-wiring-k2ov-k2uv.html':'workflow','relay-test-flow.html':'workflow','ovgr-rpr-8steps.html':'workflow',
'cpp1-a02d2-rx4744.html':'workflow','RX4744_系統連系保護継電器_現場アンチョコ.html':'workflow','KP-PRRV-CPC_実機準拠アンチョコ_サイト.html':'workflow',
'insulation-monitoring-test.html':'insulation','near-miss.html':'workflow','measurement-principles.html':'insulation','measuring-instruments.html':'cal','test-measurement.html':'workflow'
}};
})();

