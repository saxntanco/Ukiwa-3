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
  }
];
