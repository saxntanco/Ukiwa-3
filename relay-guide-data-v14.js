/* ぷかぷかうきわメモ 保護継電器アンチョコ構造化データ v14
 * 公式資料・ユーザー提供取扱説明書で確認できた範囲だけを登録する。
 * unknown / gray は未確認であり、値を推測して補完しない。
 */
const RELAY_GUIDE_DATA={
  "K2DG-AV1":{
    maker:"オムロン",
    series:"K2DG",
    element:"DGR",
    ansi:"67G",
    overall:"green",
    templateId:"OMRON-K2DG-AV1-DGR-01",
    templateScope:"K2DG-AV1形式固有",
    checkedAt:"2026-08-10",
    verification:{
      model:"green",appearance:"yellow",terminal:"green",installed:"green",
      testWiring:"green",contact:"green",testCondition:"green",
      managementValue:"red",fieldPhoto:"gray"
    },
    sources:[
      {title:"K2DG 形式/種類",kind:"メーカー公式Web",docNo:"Web技術情報",issued:"ページ上で確認できず",revised:"ページ上で確認できず",pages:"形式/種類",scope:"形式固有",url:"https://www.fa.omron.co.jp/products/family/3661/lineup/"},
      {title:"K2DG 定格/性能",kind:"メーカー公式Web",docNo:"Web技術情報",issued:"ページ上で確認できず",revised:"ページ上で確認できず",pages:"定格・性能",scope:"形式固有",url:"https://www.fa.omron.co.jp/products/family/3661/specification/"},
      {title:"K2DG ご使用の前に",kind:"メーカー公式Web",docNo:"Web技術情報",issued:"ページ上で確認できず",revised:"ページ上で確認できず",pages:"試験スイッチ、試験配線、接点動作",scope:"形式固有",url:"https://www.fa.omron.co.jp/products/family/3661/preuse/"}
    ]
  },
  "K2OV-AVN":{maker:"オムロン",series:"K2OV/K2UV",element:"OVR",overall:"yellow",templateId:"OMRON-K2OV-K2UV-01",templateScope:"シリーズ共通図＋形式別差分",checkedAt:"2026-08-10",verification:{model:"green",appearance:"yellow",terminal:"green",installed:"yellow",testWiring:"yellow",contact:"yellow",testCondition:"green",managementValue:"red",fieldPhoto:"gray"}},
  "K2UV-AVN":{maker:"オムロン",series:"K2OV/K2UV",element:"UVR",overall:"yellow",templateId:"OMRON-K2OV-K2UV-01",templateScope:"シリーズ共通図＋形式別差分",checkedAt:"2026-08-10",verification:{model:"green",appearance:"yellow",terminal:"green",installed:"yellow",testWiring:"yellow",contact:"yellow",testCondition:"green",managementValue:"red",fieldPhoto:"gray"}},
  "K2UV-AV2":{maker:"オムロン",series:"K2OV/K2UV",element:"UVR",overall:"yellow",templateId:"OMRON-K2OV-K2UV-01",templateScope:"シリーズ共通図＋形式別差分",checkedAt:"2026-08-10",verification:{model:"green",appearance:"yellow",terminal:"green",installed:"yellow",testWiring:"yellow",contact:"yellow",testCondition:"green",managementValue:"red",fieldPhoto:"gray"}},
  "K2UV-AV3":{maker:"オムロン",series:"K2OV/K2UV",element:"UVR",overall:"yellow",templateId:"OMRON-K2OV-K2UV-01",templateScope:"シリーズ共通図＋形式別差分",checkedAt:"2026-08-10",verification:{model:"green",appearance:"yellow",terminal:"green",installed:"yellow",testWiring:"yellow",contact:"yellow",testCondition:"green",managementValue:"red",fieldPhoto:"gray"}}
};

const RELAY_TERMINAL_INDEX=[
  {symbol:"P1",model:"K2DG-AV1",scope:"継電器本体",role:"P1-P2間の定格制御電源 AC110V",source:"K2DG 定格/性能・ご使用の前に"},
  {symbol:"P2",model:"K2DG-AV1",scope:"継電器本体",role:"P1-P2間の定格制御電源 AC110V",source:"K2DG 定格/性能・ご使用の前に"},
  {symbol:"Y1",model:"K2DG-AV1",scope:"継電器本体",role:"ZPD組合せのK3P-Mからの零相電圧入力",source:"K2DG 公式試験配線図"},
  {symbol:"Y2",model:"K2DG-AV1",scope:"継電器本体",role:"ZPD組合せのK3P-Mからの零相電圧入力",source:"K2DG 公式試験配線図"},
  {symbol:"Z1",model:"K2DG-AV1",scope:"継電器本体",role:"ZCT k側からの零相電流入力",source:"K2DG・OTG-D公式説明"},
  {symbol:"Z2",model:"K2DG-AV1",scope:"継電器本体",role:"ZCT ℓ側からの零相電流入力",source:"K2DG・OTG-D公式説明"},
  {symbol:"a1",model:"K2DG-AV1",scope:"継電器本体",role:"接点1のa側。継電器動作時にc1-a1導通",source:"K2DG 試験スイッチ公式説明"},
  {symbol:"b1",model:"K2DG-AV1",scope:"継電器本体",role:"接点1のb側。継電器非動作時にc1-b1導通",source:"K2DG 試験スイッチ公式説明"},
  {symbol:"c1",model:"K2DG-AV1",scope:"継電器本体",role:"接点1の共通端子",source:"K2DG 試験スイッチ公式説明"},
  {symbol:"a2",model:"K2DG-AV1",scope:"継電器本体",role:"接点2のa側。公式動作時間試験例でc2-a2を監視",source:"K2DG 公式動作時間試験図"},
  {symbol:"b2",model:"K2DG-AV1",scope:"継電器本体",role:"接点2のb側。実盤で用途確認",source:"K2DG 端子図"},
  {symbol:"c2",model:"K2DG-AV1",scope:"継電器本体",role:"接点2の共通端子。公式動作時間試験例で使用",source:"K2DG 公式動作時間試験図"},
  {symbol:"kt",model:"K2DG-AV1",scope:"組合せZCT",role:"ZCT試験回路の試験端子。k端子と同一視しない",source:"K2DG 公式試験配線図"},
  {symbol:"lt",model:"K2DG-AV1",scope:"組合せZCT",role:"ZCT試験回路の試験端子。ℓ端子と同一視しない",source:"K2DG 公式試験配線図"},
  {symbol:"k",model:"K2DG-AV1",scope:"組合せZCT",role:"ZCT二次側。K2DG Z1へ接続する公式例",source:"K2DG・OTG-D公式説明"},
  {symbol:"ℓ",model:"K2DG-AV1",scope:"組合せZCT",role:"ZCT二次側。K2DG Z2へ接続する公式例",source:"K2DG・OTG-D公式説明"}
];

const RELAY_TESTER_PROFILES=[
  {
    maker:"ムサシインテック",model:"IP-R2000",status:"yellow",
    targets:["OCR","GR","DGR","OVR","UVR","OVGR","絶縁耐力試験（別売耐圧トランス）"],
    currentOutput:"最大50A",voltageOutput:"最大750V",phaseOutput:"位相反転スイッチ（詳細範囲は取説確認）",
    contactInput:"接点動作自動判定",auxPower:"AC100V / DC24V / DC48V / DC110V",
    terminals:"電流・電圧・DGR・トリップ・補助電源など用途別コード。機器側接続は試験対象の取説で照合",
    colors:"取説は接続部コネクタの色分けを記載。個々の全コード色はプロファイルで一括断定しない",
    source:"ユーザー提供 IP-R2000取扱説明書",docNo:"4104-000ST026",sourceDate:"PDF作成情報 2014-03-25",publicUrl:""
  },
  {
    maker:"ムサシインテック",model:"GCR-mini",status:"green",
    targets:["GR","DGR（ZPDタイプ）"],currentOutput:"最大2.5A",voltageOutput:"最大1000V",phaseOutput:"電流・電圧位相 ±180°リニア可変",
    contactInput:"接点動作自動判定",auxPower:"AC100V",
    terminals:"総合端子コード：Vo、E、Kt、Lt、TRIP、P1、P2",
    colors:"赤 Vo、白 E、青 Kt、白 Lt、黄 TRIP、赤 P1、黒 P2（第17版の総合端子コード図で確認）",
    source:"ユーザー提供 GCR-mini取扱説明書 第17版",docNo:"5208-000ST009",sourceDate:"発行年月は表紙で確認できず",publicUrl:""
  },
  {
    maker:"ムサシインテック",model:"GCR-miniVS",status:"green",
    targets:["GR","DGR（ZPD/EVT・GPT）","OVR","UVR","OVGR","RPR"],currentOutput:"最大5A",voltageOutput:"最大1200V",phaseOutput:"電流・電圧位相 ±180°リニア可変",
    contactInput:"接点動作自動判定",auxPower:"AC100V / DC24V / DC48V / DC110V",
    terminals:"電流出力、電圧出力、トリップ、補助電源。総合端子コードは別売形式あり",
    colors:"電流 赤、電圧 青、トリップ 黄、補助電源 黒、アース 緑、電源 灰（取説付属コード表）",
    source:"ユーザー提供 GCR-miniVS取扱説明書 Ver1.07対応",docNo:"5209-000ST013",sourceDate:"PDF作成情報 2022-02-23",publicUrl:""
  },
  {
    maker:"ムサシインテック",model:"ET-5",status:"green",
    targets:["A・B・C・D種接地抵抗（3極法）","B・D種簡易接地抵抗（2極法）","交流電圧"],currentOutput:"接地抵抗測定用内部出力（外部試験電流出力器ではない）",voltageOutput:"交流電圧測定機能 15/150/300Vレンジ",phaseOutput:"なし",
    contactInput:"なし",auxPower:"単1形乾電池4本（公称DC6V）",terminals:"E：被接地極、P：電圧用補助極、C：電流用補助極",
    colors:"EMコード 赤 約6m、黄 約10m、青 約20m。端子への割付は取説図と現物表示で照合",
    source:"ユーザー提供 ET-5取扱説明書",docNo:"2102-000ST004",sourceDate:"PDF作成情報 2013-04-01",publicUrl:""
  },
  {
    maker:"ムサシインテック",model:"IP-1110",status:"green",
    targets:["交流耐電圧試験"],currentOutput:"高圧変圧器二次定格91mA、表示はリアクトル併用時500mA計測対応",voltageOutput:"AC0～11kV・片側接地式",phaseOutput:"なし",
    contactInput:"なし",auxPower:"なし",terminals:"高圧出力、接地E、リアクトルL・E",
    colors:"付属コードの色は抽出箇所で確認できず。役割名で表示",
    source:"ユーザー提供 IP-1110取扱説明書",docNo:"6104-001ST004",sourceDate:"PDF作成情報 2018-03-26",publicUrl:""
  },
  {
    maker:"ムサシインテック",model:"WPS-22",status:"green",
    aliases:["WPS22"],
    targets:["2E","3E","モータ保護"],
    currentOutput:"三相 AC0～5/35A max。R・S・T各相単独／バランス設定",
    voltageOutput:"三相 AC110/220/440V、定格の40～110%可変",
    phaseOutput:"欠相・反相制御、不平衡率演算",
    contactInput:"動作時間計 0.00～999.99秒",
    auxPower:"使用電源 AC100V 単相 50/60Hz",
    terminals:"試験コード一式。対象リレー側の端子・主回路貫通方法は両方の取扱説明書で照合",
    colors:"公式公開ページでは全コード色と接続先の組合せを確認できないため、役割名で表示",
    source:"ムサシインテック WPS-22公式製品ページ・公式取扱説明書一覧",
    docNo:"公開ページ上で確認できず",sourceDate:"2026-08-13確認",
    publicUrl:"https://www.musashi-in.co.jp/item/2305/2305.html",
    manualUrl:"https://www.musashi-in.co.jp/dl-manual.html",
    note:"2E・3E専用。1E・2E・3E区分、外部CT、主回路貫通方向、反相検出方式、復帰方式は対象リレーごとに確認"
  },
  {
    maker:"エヌエフ回路設計ブロック",model:"RX47022",status:"green",
    aliases:["I2V2","I2 V2","V2I2"],
    targets:["OCR","OCGR","DGR","OVGR","RPR","OVR","UVR","OFR","UFR","DSR","UPR","比率差動","欠相・反相"],
    currentOutput:"電流2相、1相あたり最大31A。構成により最大62A",
    voltageOutput:"電圧2相、1相あたり最大300V。単相最大600V、V結線三相出力対応",
    phaseOutput:"振幅・位相・周波数をディジタル設定。20mA微小電流レンジあり",
    contactInput:"トリップ入力、動作時間・復帰時間計測",
    auxPower:"AC/DC補助電源出力",
    terminals:"I1・I2、V1・V2、トリップ入力等。対象リレーとの具体的対応は取扱説明書で照合",
    colors:"電流・電圧ケーブルは複数色を選択できるため、色だけで出力相や接続先を決めない",
    source:"エヌエフ回路設計ブロック RX47022公式製品ページ・取扱説明書",
    docNo:"RX47022 Instruction Manual",sourceDate:"2026-08-13確認",
    publicUrl:"https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html",
    manualUrl:"https://www.nfcorp.co.jp/files/RX47022_InstructionManual_Jp.pdf",
    note:"I2V2は現場での検索用呼称。メーカー正式型式はRX47022。電圧2相・電流2相を三相独立出力と同一視しない"
  }
];

/*
 * 保護要素共通の試験アンチョコ。
 * 端子番号・整定値・許容値は持たせず、完全型式の資料で確定する前段だけを整理する。
 */
const RELAY_TEST_COMMON_RESTORE=[
  "試験器の出力を零にし、停止状態を確認",
  "試験コード、仮設短絡、仮設接地を撤去",
  "CTT・VTT・試験スイッチ・短絡片を操作票どおりに復帰",
  "制御電源、補助電源、トリップ回路、CB状態を確認",
  "試験前後の整定値、時限、復帰方式を照合",
  "警報表示、ターゲット、外部自己保持を復帰",
  "端子カバー、盤扉、工具・コード残置なしを確認",
  "現場責任者と復旧状態を照合して記録"
];

const RELAY_TEST_METHODS={
  OCR:{
    label:"OCR 過電流継電器",ansi:"50 / 51",
    detects:"CT二次電流を監視し、整定電流・時限特性を超える過電流を検出する。",
    signal:["主回路電流","CT・CTT","OCR電流入力","限時／瞬時判定","出力接点","トリップ回路・遮断器"],
    prechecks:[["完全型式","末尾記号と引外し方式まで確認"],["CT比","一次値・二次値・試験器出力値を分離"],["整定","限時電流、時限曲線、瞬時要素を記録"],["CT回路","CT二次開放防止とCTT状態を確認"],["接点監視","a/b接点と基準状態を回路図で確認"],["連動範囲","単体試験かCB連動かを操作票で確定"]],
    tests:[["最小動作電流","整定値との関係を測定"],["限時動作時間","メーカー指定倍率と曲線で測定"],["瞬時要素","搭載形式のみ動作値・時間を確認"],["復帰・表示","入力低下後の接点・表示状態を確認"],["CB連動","許可された範囲だけでトリップ時間を確認"]],
    sequence:["完全型式・CT比・整定・引外し方式を記録","メーカー図で電流入力点と接点監視点を確定","試験器出力零とCT二次開放防止を確認","承認された方法で電流を上昇し最小動作を記録","指定倍率へ急変して動作時間を記録","瞬時要素・復帰・CB連動は適用時のみ確認","試験器停止後にCTT・整定・トリップ回路を復旧"],
    mistakes:["一次電流値とCT二次入力値を同じ欄へ記録する","電流引外し・電圧引外し・コンデンサ引外しを取り違える","瞬時要素を限時要素と同じ上げ方で試験する","CTTのCT側と継電器側を取り違える"],
    testers:["IP-R2000","RX47022"],
    sourceLinks:[["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"],["オムロン K2OC公式情報","https://www.fa.omron.co.jp/products/family/3660/preuse/"]]
  },
  GR:{
    label:"GR・OCGR 地絡過電流継電器",ansi:"50G / 51G",
    detects:"ZCT等からの零相電流Ioを監視し、地絡電流が整定条件を超えたことを検出する。",
    signal:["主回路の零相電流","ZCT","GR・OCGR電流入力","Io整定・時限判定","出力接点","警報・遮断回路"],
    prechecks:[["完全型式","GR・OCGR・SOGの区分を確認"],["ZCT","形式、一次試験端子、k・l極性を確認"],["Io表示","一次側A・二次mA等の基準を確認"],["試験経路","ZCT一次試験かリレー直接入力かを区別"],["接点","警報・トリップ・自己保持の割付を確認"],["時限","整定値とメーカー指定試験倍率を記録"]],
    tests:[["最小動作電流 Io","指定経路で動作値を測定"],["動作時間","指定倍率・入力点で測定"],["復帰","接点・表示・手動復帰を確認"],["外部連動","SOG・CB連動は設備条件を確認して実施"]],
    sequence:["完全型式とZCT組合せを照合","一次試験／直接入力と表示基準を確定","接点監視点と復帰方式を確認","出力零からIoを上昇して最小動作を記録","指定条件へ急変して動作時間を記録","表示・接点・連動・復帰を必要範囲で確認","ZCT試験端子、短絡片、警報回路を復旧"],
    mistakes:["kt・ltとk・lを同じ端子と考える","ZCT一次値とリレー二次入力値を混同する","GRへVoを必要とするDGR手順を流用する","試験スイッチだけでZCT・外部配線も健全と判断する"],
    testers:["IP-R2000","GCR-mini","GCR-miniVS","RX47022"],
    sourceLinks:[["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"],["オムロン K2GR公式情報","https://www.fa.omron.co.jp/products/family/3662/preuse/"]]
  },
  DGR:{
    label:"DGR 地絡方向継電器",ansi:"67G",
    detects:"零相電流Io、零相電圧Voと両者の位相関係から地絡方向を判定する。",
    signal:["ZCTからIo","ZPD・ZVT等からVo","Io・Vo入力","位相方向判定","出力接点","警報・遮断回路"],
    prechecks:[["完全型式","ZPD形・ZVT/EVT/GPT形を確認"],["組合せ機器","指定ZCT・ZPDと極性を照合"],["Io・Vo整定","一次表示・二次入力・%表示を分離"],["位相基準","最大感度角と動作方向を取説で確認"],["端子","M/N、T/E等を記号だけで推定しない"],["接点","通常時基準と監視端子を確認"]],
    tests:[["最小動作電流 Io","Vo・位相を固定して測定"],["最小動作電圧 Vo","Io・位相を固定して測定"],["位相特性","動作域・不動作域・方向を確認"],["動作時間","指定Io・Vo・位相で測定"],["復帰・連動","表示、接点、CB連動を適用時確認"]],
    sequence:["完全型式、ZCT、ZPD/ZVT方式を照合","Io・Voの試験入力点と極性をメーカー図で確定","接点監視と補助電源を確認","指定Vo・位相でIo最小動作を測定","指定Io・位相でVo最小動作を測定","位相境界と指定条件の動作時間を記録","試験線、極性、短絡片、整定、警報回路を復旧"],
    mistakes:["Io・Voどちらか一方だけで方向要素を判定する","試験器表示角とメーカーの基準ベクトルを同一視する","ZPD一次3810V基準と二次出力を混同する","コード色だけでIo・Vo・共通線を決める"],
    testers:["IP-R2000","GCR-mini","GCR-miniVS","RX47022"],
    sourceLinks:[["オムロン K2DG試験情報","https://www.fa.omron.co.jp/products/family/3661/preuse/"],["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  OVGR:{
    label:"OVGR 地絡過電圧継電器",ansi:"64",
    detects:"ZPD・ZVT・EVT・GPT等からの零相電圧Voを監視し、整定値・時限条件を超えた地絡過電圧を検出する。",
    signal:["系統零相電圧","ZPD・ZVT・EVT・GPT","OVGR電圧入力","Vo整定・時限判定","出力接点","警報・遮断回路"],
    prechecks:[["完全型式","入力方式と組合せ機器を確認"],["Vo基準","一次V・二次V・完全地絡100%を区別"],["入力点","一次側と継電器入力側を区別"],["時限","整定と試験倍率を記録"],["復帰方式","手動・自動と接点割付を確認"],["外部回路","警報か遮断かを設備図で確認"]],
    tests:[["最小動作電圧 Vo","メーカー指定入力点で測定"],["動作時間","指定倍率・急変条件で測定"],["復帰","復帰値・接点・表示を必要時確認"],["外部連動","操作票で許可された回路のみ確認"]],
    sequence:["完全型式と零相電圧検出方式を照合","Vo整定の基準と試験器出力値を別々に記録","入力点、補助電源、接点監視点を確定","出力零からVoを上昇して最小動作を記録","指定倍率へ急変して動作時間を記録","手動／自動復帰と接点割付を確認","短絡線、試験端子、整定、警報回路を復旧"],
    mistakes:["ZPD一次側へ継電器入力用電圧を誤印加する","完全地絡電圧を100%とする表示とV値を混同する","OVRとOVGRを同じ入力回路として扱う","手動復帰接点と自動復帰接点を取り違える"],
    testers:["IP-R2000","GCR-miniVS","RX47022"],
    sourceLinks:[["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"],["オムロン KP-PRRV-CPC公式情報","https://socialsolution.omron.com/jp/ja/products_service/energy/product/close/kp-prrv.html"]]
  },
  RPR:{
    label:"RPR 逆電力継電器",ansi:"67P",
    detects:"電圧・電流の大きさと位相から有効電力の方向を判定し、逆電力条件を検出する。",
    signal:["VT等の電圧","CT等の電流","電圧・電流入力","有効電力方向判定","出力接点","PCS抑制・警報・遮断"],
    prechecks:[["完全型式","単相・三相、入力方式を確認"],["CT・VT比","一次電力・二次W・試験電流を分離"],["電力整定","%・W・一次換算の定義を確認"],["位相・極性","正方向・逆方向と基準角を確認"],["用途","逆潮流防止かモータリング保護か確認"],["接点・通信","接点出力とPCS通信制御を区別"]],
    tests:[["最小動作電力","メーカー定義の電圧・位相で測定"],["位相特性","最大感度点と動作境界を確認"],["動作時間","指定電力・位相条件で測定"],["方向確認","正方向で不動作、逆方向で動作を確認"],["外部連動","PCS・警報・遮断への影響を設備図で確認"]],
    sequence:["完全型式、CT/VT比、用途、整定を記録","電圧・電流入力点と極性をメーカー図で確定","接点監視、通信・外部回路の試験範囲を確認","基準電圧・位相で動作電力を測定","位相境界と指定条件の動作時間を記録","正逆方向、復帰、外部連動を必要範囲で確認","極性、短絡線、整定、PCS・トリップ回路を復旧"],
    mistakes:["逆電力方向と試験器の位相表示0°/180°を固定対応させる","三相整定電力と一相試験電流を同じ値として扱う","CT極性を反転した試験と実設備の正方向を混同する","通信連動と接点連動を同じ復帰動作と考える"],
    testers:["GCR-miniVS","RX47022"],
    sourceLinks:[["オムロン KP-PRRV-CPC公式情報","https://socialsolution.omron.com/jp/ja/products_service/energy/product/close/kp-prrv.html"],["RX47022公式製品情報","https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html"]]
  },
  OVR:{
    label:"OVR 過電圧継電器",ansi:"59",
    detects:"VT等からの相電圧・線間電圧が整定値を超えた状態を検出する。",
    signal:["系統電圧","VT・VTT","OVR電圧入力","過電圧・時限判定","出力接点","警報・遮断回路"],
    prechecks:[["完全型式","単相・三相と制御電源を確認"],["VT比","一次V・二次V・試験器出力を分離"],["入力方式","相電圧・線間電圧を確認"],["整定・時限","現状値と試験倍率を記録"],["接点","通常時基準と監視点を確認"],["復帰","自動・手動と復帰値を確認"]],
    tests:[["最小動作電圧","電圧上昇で動作値を測定"],["動作時間","指定過電圧へ急変して測定"],["復帰電圧","必要な形式で下降時を確認"],["相別・連動","多相入力と外部回路を適用時確認"]],
    sequence:["完全型式、VT比、入力方式、整定を記録","電圧入力点・補助電源・接点監視点を確定","出力零から電圧を上昇して最小動作を記録","指定電圧へ急変して動作時間を記録","復帰値、相別入力、外部連動を必要時確認","VTT、整定、接点・警報回路を復旧"],
    mistakes:["OVRとOVGRの入力元を混同する","一次定格電圧と継電器入力電圧を混同する","補助電源端子へ試験電圧を印加する","三相入力形式へ単相試験値を無条件で流用する"],
    testers:["IP-R2000","GCR-miniVS","RX47022"],
    sourceLinks:[["オムロン K2OV/K2UV公式情報","https://www.fa.omron.co.jp/products/family/3663/preuse/"],["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  UVR:{
    label:"UVR 不足電圧継電器",ansi:"27",
    detects:"VT等からの相電圧・線間電圧が整定値を下回った状態を検出する。",
    signal:["系統電圧","VT・VTT","UVR電圧入力","不足電圧・時限判定","出力接点","警報・遮断・始動阻止"],
    prechecks:[["完全型式","AVN・AV2・AV3等の差分を確認"],["基準状態","制御電源印加・定格入力時の接点を確認"],["VT比","一次V・二次V・試験器出力を分離"],["入力方式","単相・三相、相電圧・線間電圧を確認"],["整定・時限","低下試験の開始値と整定を記録"],["外部回路","停電時の接点動作と用途を確認"]],
    tests:[["最小動作電圧","定格側から電圧低下して測定"],["動作時間","指定不足電圧へ急変して測定"],["復帰電圧","電圧上昇時の復帰を必要時確認"],["停電・相別","適用形式のみ外部影響を確認"]],
    sequence:["完全型式、VT比、基準状態、整定を記録","定格入力を与える前の接点・外部回路影響を確認","電圧入力点・補助電源・接点監視点を確定","定格側から電圧を低下して動作値を記録","指定不足電圧へ急変して動作時間を記録","復帰値、停電時動作、相別入力を必要時確認","VTT、整定、制御電源、外部回路を復旧"],
    mistakes:["出力零から上昇してOVRと同じ手順にする","無電圧状態の接点と正常監視状態の接点を混同する","制御電源断と電圧入力低下を同一試験にする","AVN・AV2・AV3の端子や動作を共通扱いする"],
    testers:["IP-R2000","GCR-miniVS","RX47022"],
    sourceLinks:[["オムロン K2OV/K2UV公式情報","https://www.fa.omron.co.jp/products/family/3663/preuse/"],["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  OFR:{
    label:"OFR 過周波数継電器",ansi:"81O",
    detects:"入力電圧の周波数が整定値を超えた状態を検出する。",
    signal:["系統電圧波形","VT・VTT","周波数入力","過周波数・時限判定","出力接点","警報・遮断"],
    prechecks:[["完全型式","OFR/UFR複合、入力電圧を確認"],["定格周波数","50Hz・60Hz設定を確認"],["電圧条件","周波数判定に必要な入力電圧を確認"],["整定・時限","Hz・時限を記録"],["変化方法","連続変化か急変かを資料で確認"],["接点","OFR出力の割付を確認"]],
    tests:[["最小動作周波数","周波数上昇で測定"],["動作時間","指定周波数へ急変して測定"],["復帰周波数","必要な形式で下降時を確認"],["電圧依存","メーカー指定電圧条件で確認"]],
    sequence:["完全型式、50/60Hz、入力電圧、整定を記録","周波数可変電圧入力と接点監視を確定","定格周波数から上昇して動作値を記録","指定周波数へ急変して動作時間を記録","復帰・電圧条件・外部連動を必要時確認","周波数設定、電圧入力、整定、接点回路を復旧"],
    mistakes:["50Hz設備と60Hz設備の整定を取り違える","周波数だけ設定して必要入力電圧を確認しない","OFR出力とUFR出力を取り違える","試験器の周波数表示を別計器確認なしで社内標準値扱いする"],
    testers:["RX47022"],
    sourceLinks:[["RX47022公式製品情報","https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html"],["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  UFR:{
    label:"UFR 不足周波数継電器",ansi:"81U",
    detects:"入力電圧の周波数が整定値を下回った状態を検出する。",
    signal:["系統電圧波形","VT・VTT","周波数入力","不足周波数・時限判定","出力接点","負荷遮断・警報"],
    prechecks:[["完全型式","UFR/OFR複合、入力電圧を確認"],["定格周波数","50Hz・60Hz設定を確認"],["電圧条件","不足電圧との競合条件を確認"],["整定・時限","Hz・時限を記録"],["変化方法","連続低下か急変かを資料で確認"],["接点","段別負荷遮断等の割付を確認"]],
    tests:[["最小動作周波数","周波数低下で測定"],["動作時間","指定周波数へ急変して測定"],["復帰周波数","必要な形式で上昇時を確認"],["電圧依存","不足電圧ロック等を適用時確認"]],
    sequence:["完全型式、50/60Hz、入力電圧、整定を記録","周波数可変電圧入力と接点監視を確定","定格周波数から低下して動作値を記録","指定周波数へ急変して動作時間を記録","復帰・不足電圧ロック・外部連動を必要時確認","周波数設定、電圧入力、整定、接点回路を復旧"],
    mistakes:["周波数低下と入力電圧喪失を同じ現象として扱う","50Hz設備と60Hz設備の整定を取り違える","段別UFR接点をまとめて監視する","負荷遮断への実連動を系統状態確認なしで行う"],
    testers:["RX47022"],
    sourceLinks:[["RX47022公式製品情報","https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html"],["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  SOG:{
    label:"SOG制御装置 地絡保護試験",ansi:"51G / 67G系",
    detects:"PAS等と組み合わせ、地絡電流・方向条件を判定して区分開閉器へトリップ信号を出す。",
    signal:["ZCT・零相電圧検出","SOG制御装置入力","地絡・方向判定","制御装置出力","PASトリップ回路","区分開閉器"],
    prechecks:[["完全型式","制御装置とPASの組合せを確認"],["方式","無方向・方向性、VT内蔵等を確認"],["試験端子","メーカー指定試験コードと端子を確認"],["制御電源","開閉器側電源と逆送を確認"],["トリップ回路","PAS状態と連動可否を確認"],["復帰","表示・ロック・自己保持を確認"]],
    tests:[["地絡動作値","メーカー指定試験端子で確認"],["方向・位相","方向性形式のみ確認"],["動作時間","指定Io・Vo・位相で測定"],["PAS連動","現場責任者が許可した条件のみ実施"],["表示・復帰","制御装置と開閉器の状態を確認"]],
    sequence:["制御装置・PAS・ZCT等の完全型式を照合","停電範囲、PAS状態、トリップ禁止条件を確認","メーカー指定試験端子と接点監視を確定","地絡動作値、方向、時間を適用要素ごとに測定","PAS連動は操作票で許可された場合だけ確認","試験コード、制御電源、ロック、表示、PAS状態を復旧"],
    mistakes:["制御装置単体型式だけでPAS組合せを決める","DGR一般配線をSOG専用端子へそのまま流用する","PAS開放・投入状態を確認せず連動試験する","試験ボタンだけでZCT・トリップ回路まで健全と判断する"],
    testers:["IP-R2000","GCR-mini","GCR-miniVS","RX47022"],
    sourceLinks:[["JEMA JEM-TR 156案内","https://www.jema-net.or.jp/engineering/JEM_JEM-TR/JEMTR156.html"]]
  },
  MOTOR:{
    label:"1E・2E・3E モータ保護リレー",ansi:"モータ保護",
    detects:"過負荷・拘束、欠相、反相を製品の保護モードと検出方式に応じて判定する。",
    signal:["三相主回路電流・相順","内蔵検出／外部CT","モータ保護リレー","1E・2E・3E判定","出力接点","電磁接触器・停止回路"],
    prechecks:[["完全型式","電流レンジ・制御電源まで確認"],["E区分","1E・2E・3Eの選択状態を確認"],["検出方式","貫通・外部CT・電流/電圧反相を確認"],["主回路方向","貫通方向と相順を確認"],["出力接点","接触器コイル・PLC・自己保持を確認"],["復帰方式","手動・自動・電源再投入を確認"]],
    tests:[["過負荷動作","整定電流と時間特性を確認"],["動作時間","メーカー指定倍率で測定"],["欠相動作","2E・3Eかつ指定方式のみ確認"],["反相動作","3Eかつ指定検出方式のみ確認"],["接点・接触器連動","誤始動防止後に必要範囲で確認"],["復帰","原因除去・冷却・手動/自動を確認"]],
    sequence:["完全型式、E区分、電流レンジ、復帰方式を記録","モータ停止、無電圧、誤始動防止を確認","主回路貫通／外部CTと接点監視方法を確定","指定三相電流で過負荷動作・時間を測定","欠相・反相は選択要素とメーカー指定方法だけ確認","接触器連動・表示・復帰を許可範囲で確認","相順、貫通方向、整定、復帰方式、誤始動防止を復旧"],
    mistakes:["Eの数字を電流検出素子数や貫通相数と同一視する","3素子欠相保護形を3Eと決めつける","活線主回路で相入替えや欠相を作る","自動復帰のまま原因が残り再始動する危険を見落とす","二次側反相を検出しない形式へ同じ試験を流用する"],
    testers:["WPS-22","RX47022"],
    sourceLinks:[["WPS-22公式製品情報","https://www.musashi-in.co.jp/item/2305/2305.html"],["RX47022公式製品情報","https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html"],["オムロン K2CM公式情報","https://www.fa.omron.co.jp/products/family/841/lineup/"]]
  }
};
