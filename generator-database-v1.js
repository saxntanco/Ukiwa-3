/* ぷかぷかうきわメモ｜非常用発電機データベース v1
 * 型式固有情報は公式公開ページで存在を確認できた範囲だけを登録。
 * 端子・設定値・試験方法は、型式別取扱説明書未確認のまま流用しない。
 */
(function(){
  'use strict';

  const checked = '2026-08-11';
  const sources = {
    yanmar:{label:'ヤンマー｜非常用発電システム',url:'https://www.yanmar.com/jp/energy/emergency_generator/products/'},
    yanmarCub:{label:'ヤンマー｜キュービクル型発電システム',url:'https://www.yanmar.com/jp/energy/emergency_generator/cubicle/products/'},
    denyoBosai:{label:'デンヨー｜防災用発電設備',url:'https://www.denyo.co.jp/products/generator/emergency/bosai/'},
    denyoIppan:{label:'デンヨー｜一般停電用予備発電装置',url:'https://www.denyo.co.jp/products/generator/emergency/ippan/'},
    denyoLp:{label:'デンヨー｜LPガス一般停電用予備発電機',url:'https://www.denyo.co.jp/products/generator/emergency/lpgas/'},
    denyoV:{label:'デンヨー｜縦型一般停電用予備発電機',url:'https://www.denyo.co.jp/products/generator/emergency/vtype1/'},
    tokyo:{label:'東京電機｜製品情報',url:'https://www.tokyodenki.co.jp/product/'},
    nishihatsu:{label:'ニシハツ｜製品情報',url:'https://nishihatsu.co.jp/product'},
    meidensha:{label:'明電舎｜非常用発電装置',url:'https://www.meidensha.co.jp/products/energy/prod_04/prod_04_04/'},
    mhi:{label:'三菱重工｜MGS-R発表',url:'https://www.mhi.com/jp/news/22032401.html'},
    airman:{label:'AIRMAN｜エンジン発電機',url:'https://www.airman.co.jp/product/category-4/'},
    cat:{label:'Caterpillar｜Diesel Generator Sets',url:'https://www.cat.com/en_US/by-industry/electric-power/product-solutions/diesel-generator-sets.html'},
    cummins:{label:'Cummins｜Diesel Generators',url:'https://www.cummins.com/generators/diesel'},
    dse:{label:'Deep Sea Electronics｜Genset controls',url:'https://www.deepseaelectronics.com/genset'},
    comap:{label:'ComAp｜InteliLite',url:'https://www.comap-control.com/products/controllers/single-gen-set-controllers/intelilite/'},
    deif:{label:'DEIF｜AGC 150 series',url:'https://www.deif.com/land-power/the-agc-150-series/'},
    woodward:{label:'Woodward｜easYgen-3000XT',url:'https://www.woodward.com/products/industrial/easygen-3000xt/'}
  };

  const gensetDefaults = {
    kind:'発電装置', status:'現行/掲載中', confidence:'公式製品ページ確認済み', checked,
    summary:'非常時または予備電源として用いる発電装置。構成・制御盤・端子・定格は個別仕様書で確認する。',
    first:'銘板の型式・周波数・定格、制御盤型式、単線結線図を先に確認。',
    danger:'シリーズ名が同じでも盤仕様や端子は異なる。別機種の手順を流用しない。',
    relatedTests:['auto-sequence','manual-start','no-load','load-test','insulation','battery','alarm-history'],
    relatedProtections:['overspeed','low-oil','high-water','overcurrent','overvoltage','emergency-stop'],
    relatedComponents:['engine','alternator','avr','starter','battery','breaker-52g','controller'],
    missing:['型式別取扱説明書','制御盤端子図','現地設定値','実機銘板写真']
  };
  function model(id,maker,model,name,source,extra={}){
    return Object.assign({id,maker,model,name,source},gensetDefaults,extra);
  }

  const models = [
    model('ya-ap25-130','ヤンマー','AP25C～130F','AutoPack APシリーズ（低圧）',sources.yanmarCub,{fuel:'ディーゼル',category:'キュービクル型'}),
    model('ya-ap155-500','ヤンマー','AP155F～500E','AutoPack APシリーズ（低圧）',sources.yanmarCub,{fuel:'ディーゼル',category:'キュービクル型'}),
    model('ya-ay20l','ヤンマー','AY20L','非常用ディーゼル発電ユニット',sources.yanmar,{fuel:'ディーゼル',category:'大型発電装置'}),
    model('ya-ay40l','ヤンマー','AY40L','非常用ディーゼル発電ユニット',sources.yanmar,{fuel:'ディーゼル',category:'大型発電装置'}),
    model('ya-ey33','ヤンマー','6EY33LW / 8EY33LW','6,8EY33シリーズ',sources.yanmar,{fuel:'ディーゼル',category:'大型発電装置'}),
    model('ya-atg250','ヤンマー','ATG250～ATG500','非常用ガスタービン',sources.yanmar,{fuel:'ガスタービン',category:'ガスタービン'}),
    model('ya-atg625','ヤンマー','ATG625～ATG1500','非常用ガスタービン',sources.yanmar,{fuel:'ガスタービン',category:'ガスタービン'}),
    model('ya-atg1750','ヤンマー','ATG1750～ATG3000','非常用ガスタービン',sources.yanmar,{fuel:'ガスタービン',category:'ガスタービン'}),
    model('ya-yapj','ヤンマー','YAP-J','単相発電装置シリーズ',sources.yanmarCub,{fuel:'ディーゼル',category:'単相発電装置'}),
    model('ya-gy175','ヤンマー','GY175シリーズ','大容量非常用発電機', {label:'ヤンマー｜GY175シリーズ発表',url:'https://www.yanmar.com/jp/energy/news/2025/10/08/157276.html'},{fuel:'ディーゼル',category:'大型発電装置'}),

    ...['TLG-5XF(2W)','TLG-10XF(2W)','TLG-5XF(3W)','TLG-10XF(3W)','TLG-15XF(3W)','TLG-82F','DCA-25F','DCA-37F','DCA-50F','DCA-65F','DCA-95F','DCA-115F','DCA-150F','DCA-185F','DCA-225F','DCA-260F','DCA-280F','DCA-330F','DCA-400F'].map((x,i)=>model('de-b-'+i,'デンヨー',x,'防災用発電設備',sources.denyoBosai,{fuel:'ディーゼル',category:'防災用'})),
    ...['DCA-25LSKE-D2T','DCA-45LSKE-D2T','DCA-60LSKE-D2T','DCA-100LSIE-DT','DCA-13LSKT','DCA-13LSYET','DCA-25USIET','DCA-45USKET'].map((x,i)=>model('de-i-'+i,'デンヨー',x,'一般停電用予備発電装置',sources.denyoIppan,{fuel:'ディーゼル',category:'一般停電用'})),
    ...['LEG-9.9USXT','LEG-12UST','LEG-31USXT2','LEG-54UST2'].map((x,i)=>model('de-lp-'+i,'デンヨー',x,'LPガス一般停電用予備発電機',sources.denyoLp,{fuel:'LPガス',category:'一般停電用'})),
    ...['DA-3000SST','TLG-5000SST（24時間仕様）','TLG-5000SST（72時間仕様）'].map((x,i)=>model('de-v-'+i,'デンヨー',x,'縦型一般停電用予備発電機',sources.denyoV,{fuel:'ディーゼル',category:'縦型発電装置'})),

    model('td-cubicle','東京電機','キュービクルタイプ（シリーズ）','全自動自家発電装置',sources.tokyo,{category:'キュービクル型',confidence:'公式製品カテゴリ確認済み',missing:['個別型式一覧','型式別取扱説明書','端子図','実機写真']}),
    model('td-compact','東京電機','コンパクトジェネレータ（シリーズ）','コンパクトジェネレータ',sources.tokyo,{category:'コンパクト型',confidence:'公式製品カテゴリ確認済み',missing:['個別型式一覧','型式別取扱説明書','TESTボタン仕様','実機写真']}),
    model('nh-three','ニシハツ','三相非常用（シリーズ）','三相非常用自家発電装置',sources.nishihatsu,{category:'三相非常用',confidence:'公式製品カテゴリ確認済み'}),
    model('nh-single','ニシハツ','単相非常用（シリーズ）','単相非常用自家発電装置',sources.nishihatsu,{category:'単相非常用',confidence:'公式製品カテゴリ確認済み'}),
    model('nh-cvcf','ニシハツ','CVCFタンデム（シリーズ）','CVCFタンデム非常用自家発電装置',sources.nishihatsu,{category:'CVCF',confidence:'公式製品カテゴリ確認済み'}),
    model('nh-bcp','ニシハツ','BCP（シリーズ）','BCP発電装置',sources.nishihatsu,{category:'BCP',confidence:'公式製品カテゴリ確認済み'}),
    model('me-zx','明電舎','ZXシリーズ','パッケージ型非常用ディーゼル発電装置',sources.meidensha,{fuel:'ディーゼル',category:'パッケージ型'}),
    model('mhi-r','三菱重工エンジン＆ターボチャージャ','MGS-R','高出力非常用発電セット',sources.mhi,{fuel:'ディーゼル',category:'大型発電装置'}),
    model('mhi-b','三菱重工エンジン＆ターボチャージャ','MGS-B','ディーゼル発電セット（旧シリーズ）',sources.mhi,{fuel:'ディーゼル',category:'大型発電装置',status:'旧シリーズ',confidence:'公式ニュースで旧系列確認済み'}),
    ...[['SDG-LX','大容量燃料タンク搭載リークガード'],['SDG-LA','リークガード エイブルジェネレータ'],['SDG-LAX','三相4線・単相3線同時出力'],['SDG-Z/AS','極超低騒音仕様']].map((x,i)=>model('air-'+i,'AIRMAN（北越工業）',x[0],x[1],sources.airman,{fuel:'ディーゼル',category:'可搬形'})),

    model('cat-c9','Caterpillar','C9（60 Hz）','ディーゼル発電装置', {label:'Cat｜C9 generator set',url:'https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/1000028951.html'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cat-3512b','Caterpillar','3512B','ディーゼル発電装置', {label:'Cat｜3512B generator set',url:'https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/15969797.html'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cat-c32b','Caterpillar','C32B（50 Hz）','ディーゼル発電装置', {label:'Cat｜C32B generator set',url:'https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/18332039.html'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cat-c175','Caterpillar','C175-20（60 Hz）','ディーゼル発電装置', {label:'Cat｜C175-20 generator set',url:'https://www.cat.com/en_US/products/new/power-systems/electric-power/diesel-generator-sets/1000028913.html'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cu-qsl9','Cummins','QSL9 Q-Range','商用発電装置', {label:'Cummins｜QSL9 Q-Range',url:'https://www.cummins.com/generators/products/qsl9-q-range'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cu-6bta','Cummins','6BTA5.9','Integrated Power Generator', {label:'Cummins｜6BTA5.9',url:'https://www.cummins.com/generators/6bta59'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cu-dfej','Cummins','DFEJ','ディーゼル発電装置', {label:'Cummins｜DFEJ',url:'https://www.cummins.com/generators/dfej'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),
    model('cu-dqgaf','Cummins','DQGAF系列','ディーゼル発電装置', {label:'Cummins｜DQGAF',url:'https://www.cummins.com/generators/dqgaf-0'},{category:'海外発電装置',confidence:'海外公式製品ページ確認済み'}),

    model('dse7310','Deep Sea Electronics','DSE7310 MKII','Auto Start Control Module',sources.dse,{kind:'制御装置',category:'自動始動制御',fuel:'—',summary:'単独発電装置向け自動始動制御モジュール。実機設定ファイルとI/O割付を確認する。'}),
    model('dse7320','Deep Sea Electronics','DSE7320 MKII','Auto Mains Failure Control Module',{label:'DSE｜DSE7320 MKII',url:'https://www.deepseaelectronics.com/genset/auto-mains-utility-failure-control-modules/dse7320-mkii'},{kind:'制御装置',category:'商用停電制御',fuel:'—',summary:'商用電源と発電装置を監視するAMF制御モジュール。I/Oは構成設定に依存する。'}),
    model('comap-il4-25','ComAp','InteliLite 4 AMF 25','Single gen-set controller',{label:'ComAp｜InteliLite 4 AMF 25',url:'https://www.comap-control.com/products/controllers/single-gen-set-controllers/intelilite/intelilite-4-amf-25/'},{kind:'制御装置',category:'商用停電制御',fuel:'—'}),
    model('comap-il4-20','ComAp','InteliLite 4 AMF 20','Single gen-set controller',sources.comap,{kind:'制御装置',category:'商用停電制御',fuel:'—'}),
    model('comap-il4-9','ComAp','InteliLite 4 AMF 9','Single gen-set controller',sources.comap,{kind:'制御装置',category:'商用停電制御',fuel:'—'}),
    model('comap-old25','ComAp','InteliLite AMF 25','Single gen-set controller', {label:'ComAp｜InteliLite AMF 25',url:'https://www.comap-control.com/products/controllers/single-gen-set-controllers/intelilite/intelilite-amf-25/'},{kind:'制御装置',category:'商用停電制御',fuel:'—',status:'生産終了',confidence:'海外公式ページで生産終了確認済み'}),
    model('deif-agc150','DEIF','AGC 150 Generator','Advanced Genset Controller',sources.deif,{kind:'制御装置',category:'発電機制御',fuel:'—'}),
    model('deif-hybrid','DEIF','AGC 150 Hybrid','Hybrid Genset Controller',{label:'DEIF｜AGC 150 Hybrid',url:'https://www.deif.com/products/agc-150-hybrid-advanced-genset-controller/'},{kind:'制御装置',category:'ハイブリッド制御',fuel:'—'}),
    model('wood-3400','Woodward','easYgen-3400XT','Genset Control',sources.woodward,{kind:'制御装置',category:'並列・電力管理',fuel:'—'}),
    model('wood-3500','Woodward','easYgen-3500XT','Genset Control',sources.woodward,{kind:'制御装置',category:'並列・電力管理',fuel:'—'})
  ];

  const testSeed = [
    ['auto-sequence','自動始動・停止シーケンス','停電検出から始動、電圧確立、負荷切替、復電、冷却運転、停止までの順序と時間を確認。'],
    ['manual-start','手動始動・停止','手動モードで始動性、計器、異音・漏れ、停止を確認。'],
    ['no-load','無負荷運転','遮断器を投入せず、回転・電圧・周波数・各部状態を確認。'],
    ['load-test','負荷運転','実負荷または負荷試験装置で負荷追従、温度、電圧・周波数を確認。'],
    ['black-start','停電模擬','商用停電信号に対する自動始動・切替を確認。実停電操作とは分離して計画する。'],
    ['restore-test','復電模擬','商用復帰後の再切替、冷却運転、停止、待機復帰を確認。'],
    ['insulation','絶縁抵抗測定','対象回路を切り離し、電子機器・サージ機器への印加可否を確認して測定。'],
    ['battery','始動用蓄電池点検','開放電圧だけでなく始動時電圧降下、端子、充電器、セル状態を確認。'],
    ['charger','充電器点検','浮動・均等充電設定、出力、警報、ヒューズ、交流入力を確認。'],
    ['fuel','燃料系統点検','量・漏れ・弁・フィルタ・エア噛み・劣化・戻り系統を確認。'],
    ['lube','潤滑油系統点検','油量、漏れ、圧力、フィルタ、始動後の立上がりを確認。'],
    ['cooling','冷却系統点検','液量、漏れ、ヒータ、ベルト、ラジエータ・換気を確認。'],
    ['exhaust','排気系統点検','漏れ、支持、断熱、背圧要因、排気色を確認。'],
    ['starter','始動装置点検','スタータ、マグネット、配線、クランキング回数・休止時間を確認。'],
    ['governor','速度調整・周波数確認','無負荷・負荷時の回転数/周波数と過渡変動を確認。設定変更は承認後。'],
    ['avr-test','AVR・電圧確認','無負荷・負荷時の電圧、相間差、過渡変動を確認。'],
    ['phase','相回転・相順確認','切替盤・発電機側の相順を測定し、記録図面と照合。'],
    ['breaker','52G遮断器動作確認','投入・引外し、補助接点、インターロック、ばね蓄勢を確認。'],
    ['ats','ATS/切替器連動','商用・発電機の切替条件、機械・電気インターロック、表示を確認。'],
    ['alarm-history','警報履歴確認','現在警報、履歴、発生順、時刻、リセット後状態を保存。'],
    ['emergency','非常停止試験','承認された方法で非常停止入力と停止・遮断・警報を確認。'],
    ['protection-sim','保護入力模擬','TEST、独立接点、指定COM等の方式を図面で確認して模擬。'],
    ['remote','遠方始動・停止','遠方接点、通信、選択スイッチ条件、失敗時警報を確認。'],
    ['earth','接地・ボンディング確認','発電機中性点方式、保護接地、盤間ボンディングを図面と測定で確認。'],
    ['harmonic','波形・高調波測定','非線形負荷時の電圧波形、高調波、周波数変動を記録。'],
    ['thermo','サーモグラフィ点検','負荷運転中の端子、遮断器、母線、排気・冷却部を比較観察。']
  ];
  const tests = testSeed.map((x,i)=>({id:x[0],title:x[1],kind:'試験方法',category:i<6?'運転・シーケンス':i<19?'機能・設備点検':'警報・診断',summary:x[2],confidence:'一般原理による説明',first:'現場責任者・社内手順・操作票・系統状態・対象機取扱説明書を確認。',procedure:['試験範囲と停止影響を合意','AUTO→MANUAL等、現場手順で要求される待機解除を確認','図面と実機銘板を照合','試験前状態を記録','承認された方法で実施','表示・接点・52G・停止動作を記録','試験治具を撤去し設定を復旧','AUTO・遠方始動許可・無警報を確認'],danger:'この一般手順だけで実設備を操作しない。端子・設定・短絡/開放条件は型式別資料で確定する。',missing:['型式別正式手順','現場管理値','操作票番号'],checked}));

  const protectionSeed = [
    ['overspeed','過速度','回転速度が設定域を超えた状態。'],['low-oil','潤滑油圧低下（63Q等）','潤滑油圧が始動後も成立しない/低下した状態。'],['high-water','冷却水温上昇（26W等）','冷却水温度が設定域を超えた状態。'],['overload','過負荷','発電装置が許容負荷を超えた状態。'],['overcurrent','過電流','発電機出力電流が設定域を超えた状態。'],['short-circuit','短絡','出力回路に大電流を生じる故障。'],['earth-fault','地絡','出力回路から大地へ異常電流が流れる故障。'],['overvoltage','過電圧','発電機電圧が設定上限を超えた状態。'],['undervoltage','不足電圧','発電機電圧が設定下限を下回る状態。'],['overfrequency','周波数上昇','周波数が設定上限を超えた状態。'],['underfrequency','周波数低下','周波数が設定下限を下回る状態。'],['reverse-power','逆電力','並列運転時に発電機が電動機方向へ電力を受ける状態。'],['loss-excitation','界磁喪失','同期発電機の励磁が失われる状態。'],['unbalance','電流/電圧不平衡','相間の不平衡が大きい状態。'],['phase-sequence','逆相・相順異常','相順または相の対応が不正な状態。'],['start-fail','始動失敗','規定のクランキング後も運転成立しない状態。'],['stop-fail','停止失敗','停止指令後も回転が継続する状態。'],['crank-over','過度クランキング','始動操作が規定回数/時間を超えた状態。'],['battery-low','蓄電池電圧低下','始動・制御用電源が不足する状態。'],['charger-fail','充電器異常','蓄電池充電器の交流入力または直流出力異常。'],['fuel-low','燃料油面低下','燃料量が管理下限を下回る状態。'],['fuel-leak','燃料漏れ','燃料系統から漏えいを検出した状態。'],['coolant-low','冷却水面低下','冷却水量が管理下限を下回る状態。'],['heater-fail','冷却水ヒータ異常','待機時の保温が成立しない状態。'],['emergency-stop','非常停止','人為または外部入力で緊急停止させる機能。'],['room-temp','室温上昇','発電機室の温度が管理上限を超えた状態。'],['vent-fail','換気ファン異常','給排気・換気設備が所定状態にならない状態。'],['breaker-trip','52Gトリップ','発電機遮断器が引外された状態。'],['sync-fail','同期失敗','並列条件が所定時間内に成立しない状態。'],['comm-fail','通信異常','ECU・PLC・遠隔監視間の通信が失われた状態。']
  ];
  const protections = protectionSeed.map((x,i)=>({id:x[0],code:x[1].match(/（(.+?)）/)?.[1]||'—',title:x[1],kind:'警報・保護',category:i<15?'電気・機械保護':i<25?'始動・補機警報':'連動・監視',summary:x[2],normal:'通常状態・接点論理は機種ごとの展開接続図、I/Oリストで確認。',simulation:['専用TEST機能','指定独立接点','指定COM＋入力','センサ模擬器/校正器','ECU/PLC診断機能','その他・資料未確認'],danger:'PEや機体をCOMと決めつけない。入力へ電圧を印加/短絡する前に回路種別と許容定格を確認。',recovery:['試験クリップ・ジャンパ撤去','DIP/設定復旧','TEST解除','故障リセット','52G・選択スイッチ状態確認','AUTO/遠方許可復帰','警報なしを確認'],confidence:'一般原理による説明',checked}));

  const componentSeed = [
    ['engine','ディーゼル/ガスエンジン','発電機を回す原動機。'],['alternator','交流発電機','機械エネルギーを交流電力へ変換。'],['avr','AVR','界磁を制御し端子電圧を調整。'],['governor-unit','ガバナ','燃料量を調整し回転数/周波数を制御。'],['starter','スタータモータ','始動時にエンジンをクランキング。'],['starter-solenoid','スタータマグネット','大電流回路を投入してスタータを駆動。'],['battery','始動用蓄電池','始動・制御に直流電源を供給。'],['charger-unit','蓄電池充電器','待機中の蓄電池を充電。'],['stop-solenoid','停止ソレノイド','燃料遮断等でエンジンを停止。'],['fuel-tank','燃料タンク','運転用燃料を貯蔵。'],['fuel-pump','燃料ポンプ','燃料をエンジンへ供給。'],['fuel-filter','燃料フィルタ','燃料中の異物・水分を分離。'],['lube-pump','潤滑油ポンプ','摺動部へ潤滑油を供給。'],['oil-switch','油圧スイッチ/センサ','潤滑油圧を監視。'],['radiator','ラジエータ','冷却水の熱を放出。'],['water-pump','冷却水ポンプ','冷却水を循環。'],['water-heater','冷却水ヒータ','待機中の機関を保温。'],['temp-sensor','温度スイッチ/センサ','冷却水・油・巻線等の温度を監視。'],['exhaust','排気管・消音器','排気ガスを安全に排出し騒音を低減。'],['air-cleaner','エアクリーナ','吸気中の異物を除去。'],['coupling','軸継手','エンジン軸と発電機軸を結合。'],['bearing','軸受','回転軸を支持。'],['breaker-52g','発電機遮断器 52G','発電機出力を母線へ接続/遮断。'],['ats-unit','ATS/切替器','商用電源と発電機電源を切り替え。'],['controller','自動始動制御盤','停電検出、始動、保護、停止を統括。'],['ct','CT','電流計測・保護用に出力電流を変成。'],['vt','VT/PT','電圧計測・保護用に電圧を変成。'],['space-heater','盤内スペースヒータ','結露を抑制。'],['vent-fan','換気ファン/ダンパ','燃焼空気と室内放熱を確保。'],['load-bank','負荷試験装置','実負荷を使わず発電機へ試験負荷を与える。']
  ];
  const components = componentSeed.map(x=>({id:x[0],title:x[1],kind:'部品・補機',category:['avr','governor-unit','controller','ct','vt'].includes(x[0])?'制御・計測':['battery','charger-unit','starter','starter-solenoid'].includes(x[0])?'始動・直流':['breaker-52g','ats-unit','load-bank'].includes(x[0])?'電力回路':'機関・補機',summary:x[2],inspection:'外観、固定、漏れ/発熱/異音、配線、表示、設定、履歴を型式別手順で確認。',danger:'運転中の回転部・高温部・充電部に接近しない。隔離と無電圧確認を行う。',confidence:'一般原理による説明',checked}));

  const db = {version:'1.0.0',updated:checked,sources,models,tests,protections,components};
  window.UKIWA_GENERATOR_DB = db;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function norm(v){return String(v??'').normalize('NFKC').toLowerCase().replace(/[\s・／/_()（）-]/g,'');}
  function init(){
    const root=document.getElementById('generatorDbApp'); if(!root) return;
    const search=document.getElementById('gdbSearch'), cards=document.getElementById('gdbCards'), count=document.getElementById('gdbCount');
    const maker=document.getElementById('gdbMaker'), category=document.getElementById('gdbCategory');
    const dialog=document.getElementById('gdbDialog'), detail=document.getElementById('gdbDetail');
    let tab='models';
    const fav=new Set(JSON.parse(localStorage.getItem('ukiwa-generator-favorites')||'[]'));
    let recent=JSON.parse(localStorage.getItem('ukiwa-generator-recent')||'[]');
    const sets={models,tests,protections,components};
    const labels={models:'型式・シリーズ',tests:'試験方法',protections:'警報・保護',components:'部品・補機'};
    function current(){return sets[tab]||models;}
    function searchable(x){return norm(Object.values(x).flat(Infinity).map(v=>typeof v==='object'?Object.values(v||{}).join(' '):v).join(' '));}
    function options(){
      const ms=[...new Set(current().map(x=>x.maker).filter(Boolean))].sort();
      const cs=[...new Set(current().map(x=>x.category).filter(Boolean))].sort();
      maker.innerHTML='<option value="">メーカーすべて</option>'+ms.map(x=>`<option>${esc(x)}</option>`).join('');
      category.innerHTML='<option value="">分類すべて</option>'+cs.map(x=>`<option>${esc(x)}</option>`).join('');
    }
    function render(){
      const q=norm(search.value), mk=maker.value, cat=category.value;
      const rows=current().filter(x=>(!q||searchable(x).includes(q))&&(!mk||x.maker===mk)&&(!cat||x.category===cat));
      count.textContent=`${labels[tab]} ${rows.length}件 / DB総数 ${models.length+tests.length+protections.length+components.length}件`;
      cards.innerHTML=rows.map(x=>{
        const title=x.model||x.title, makerLine=x.maker?`<span>${esc(x.maker)}</span>`:'';
        return `<article class="gdbCard"><div class="gdbMeta">${makerLine}<span>${esc(x.category||x.kind)}</span></div><h3>${esc(title)}</h3>${x.name?`<b class="gdbName">${esc(x.name)}</b>`:''}<p>${esc(x.summary)}</p><div class="gdbBadges"><span>${esc(x.status||x.confidence)}</span><span>${esc(x.confidence)}</span></div><div class="gdbActions"><button data-open="${esc(x.id)}">アンチョコを見る</button><button class="gdbFav ${fav.has(x.id)?'on':''}" data-fav="${esc(x.id)}" aria-label="お気に入り">★</button></div></article>`;
      }).join('')||'<div class="gdbEmpty">一致する項目がありません。表記を短くして検索してください。</div>';
    }
    function find(id){for(const [key,list] of Object.entries(sets)){const item=list.find(x=>x.id===id);if(item)return {key,item};}return null;}
    function listBlock(title,value){const a=Array.isArray(value)?value:(value?[value]:[]);return a.length?`<section><h4>${esc(title)}</h4><ul>${a.map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section>`:'';}
    function linkBlock(title,items){return items.length?`<section><h4>${esc(title)}</h4><div class="gdbRelated">${items.slice(0,18).map(v=>`<button data-open="${esc(v.id)}">${esc(v.model||v.title)}</button>`).join('')}</div></section>`:'';}
    function openItem(id){
      const hit=find(id); if(!hit)return; const x=hit.item;
      recent=[id,...recent.filter(v=>v!==id)].slice(0,8); localStorage.setItem('ukiwa-generator-recent',JSON.stringify(recent));
      const inverseModels=hit.key==='tests'?models.filter(m=>m.relatedTests?.includes(id)):hit.key==='protections'?models.filter(m=>m.relatedProtections?.includes(id)):hit.key==='components'?models.filter(m=>m.relatedComponents?.includes(id)):[];
      detail.innerHTML=`<div class="gdbDetailHead"><small>${esc(x.kind)}｜${esc(x.category||'')}</small><h2>${esc(x.model||x.title)}</h2>${x.maker?`<p><b>${esc(x.maker)}</b>｜${esc(x.name||'')}</p>`:''}</div><div class="gdbThree"><div><b>何をする？</b><span>${esc(x.summary)}</span></div><div><b>最初に確認</b><span>${esc(x.first||'銘板・図面・対象・試験範囲を確認。')}</span></div><div class="danger"><b>危険・間違えやすい</b><span>${esc(x.danger)}</span></div></div><div class="gdbDetailGrid">${listBlock('操作・確認の流れ',x.procedure)}${listBlock('試験後の復旧',x.recovery)}${linkBlock('関連する試験',(x.relatedTests||[]).map(v=>tests.find(t=>t.id===v)).filter(Boolean))}${linkBlock('関連する警報・保護',(x.relatedProtections||[]).map(v=>protections.find(t=>t.id===v)).filter(Boolean))}${linkBlock('関連する部品',(x.relatedComponents||[]).map(v=>components.find(t=>t.id===v)).filter(Boolean))}${linkBlock('この項目に関連する型式・シリーズ',inverseModels)}${listBlock('異常模擬方式の候補（要図面確認）',x.simulation)}${listBlock('不足資料',x.missing)}</div><div class="gdbTrust"><b>信頼度：</b>${esc(x.confidence)}　<b>最終確認：</b>${esc(x.checked||checked)}${x.source?`<br><a href="${esc(x.source.url)}" target="_blank" rel="noopener">${esc(x.source.label)} ↗</a>`:''}<p>関連表示は一般的な設備構成からの逆引きです。その型式での正式な対応・端子・設定を保証しません。型式別取扱説明書と現地図面で確定してください。</p></div>`;
      if(!dialog.open){if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}
    }
    root.addEventListener('click',e=>{
      const t=e.target.closest('button'); if(!t)return;
      if(t.dataset.tab){tab=t.dataset.tab; root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));options();render();}
      if(t.dataset.open)openItem(t.dataset.open);
      if(t.dataset.fav){fav.has(t.dataset.fav)?fav.delete(t.dataset.fav):fav.add(t.dataset.fav);localStorage.setItem('ukiwa-generator-favorites',JSON.stringify([...fav]));render();}
    });
    dialog.addEventListener('click',e=>{const t=e.target.closest('[data-open]');if(t)openItem(t.dataset.open);});
    [search,maker,category].forEach(x=>x.addEventListener(x===search?'input':'change',render));
    document.getElementById('gdbClear').addEventListener('click',()=>{search.value='';maker.value='';category.value='';render();});
    document.getElementById('gdbDialogClose').addEventListener('click',()=>dialog.close());
    document.getElementById('gdbShowFav').addEventListener('click',()=>{search.value='';const ids=[...fav];cards.innerHTML=ids.map(id=>{const h=find(id);return h?`<button class="gdbSaved" data-open="${esc(id)}">★ ${esc(h.item.model||h.item.title)}</button>`:''}).join('')||'<div class="gdbEmpty">お気に入りはまだありません。</div>';count.textContent=`お気に入り ${ids.length}件`;});
    document.getElementById('gdbShowRecent').addEventListener('click',()=>{cards.innerHTML=recent.map(id=>{const h=find(id);return h?`<button class="gdbSaved" data-open="${esc(id)}">↻ ${esc(h.item.model||h.item.title)}</button>`:''}).join('')||'<div class="gdbEmpty">最近見た項目はまだありません。</div>';count.textContent=`最近見た項目 ${recent.length}件`;});
    options(); render();
  }
  if(typeof document!=='undefined') document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
