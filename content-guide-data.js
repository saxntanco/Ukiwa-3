/* Curated page purposes; not equipment operating instructions. */
window.UkiwaContents = [
  {
    "path": "single-line-lab.html",
    "title": "動く単線結線図",
    "category": "機器・動作",
    "description": "負荷・力率を変え、変圧器の一次・二次とCT二次の電流を図で比較。",
    "tags": "三相平衡 単線結線図 PAS VCB CT 変圧器 kW kVA 力率 線間電圧 線電流",
    "related": [
      "ct-calculator.html",
      "equipment-map.html",
      "relay-basics.html"
    ]
  },
  {
    "path": "ac-withstand-test-simulator.html",
    "title": "充電電流とリアクトルを比べる",
    "category": "計算",
    "description": "ケーブル条件から、根拠別の充電電流・リアクトル台数・トランス負担を比較。",
    "tags": "耐圧 CV 静電容量 Ic IL R-1220K DR-1220MH",
    "related": [
      "ukiwamemo_kyounonande_taiatsu_reactor_ic.html",
      "ppe-withstand-guide.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "ocr-tap-calculator.html",
    "title": "OCRの限時・瞬時・ダイヤル",
    "category": "計算",
    "description": "CT比と負荷条件を入力し、整定候補と時間協調の考え方を確認。",
    "tags": "過電流 51 50 タップ 整定 K2OC",
    "related": [
      "ct-calculator.html",
      "relay-basics.html",
      "relay-quickref.html"
    ]
  },
  {
    "path": "ct-calculator.html",
    "title": "CT比と変圧器の相別電流",
    "category": "計算",
    "description": "変圧器容量・接続相からCT候補を比較し、一次・二次電流を換算。",
    "tags": "変流器 kVA アンペア 単相 三相 RS ST TR",
    "related": [
      "ocr-tap-calculator.html",
      "ukiwamemo_kyounonande_b_ground_transformer.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "cable-size-simulator.html",
    "title": "電線の太さを比べる",
    "category": "計算",
    "description": "電流・距離・敷設条件から、許容電流と電圧変化をサイズ別に比較。",
    "tags": "ケーブル CV CVD CVT sq mm2 単相3線 中性線 電圧降下",
    "related": [
      "ct-calculator.html",
      "ac-withstand-test-simulator.html",
      "insulation-resistance-principle.html"
    ]
  },
  {
    "path": "protective-relay.html",
    "title": "保護継電器・絶縁監視の型式検索",
    "category": "保護・配線",
    "description": "メーカー・型式から、試験教材と公式資料の入口を探す。",
    "tags": "リレー OCR DGR SOG OVGR RPR OVR UVR ELR Igr Ior",
    "related": [
      "relay-basics.html",
      "relay-test-reference.html",
      "relay-quickref.html"
    ]
  },
  {
    "path": "relay-basics.html",
    "title": "OCR・DGR・OVGR・RPRの違い",
    "category": "保護・配線",
    "description": "何を検出し、どんな異常から設備を守るかを4種類で整理。",
    "tags": "過電流 地絡 逆電力 零相 電圧 はじめて 基礎",
    "related": [
      "protective-relay.html",
      "sequence-basics.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "relay-quickref.html",
    "title": "継電器の試験方法アンチョコ",
    "category": "保護・配線",
    "description": "保護要素から、試験入力・動作・復旧時に見る項目を探す。",
    "tags": "OCR DGR GR OVGR RPR 整定 動作値 動作時間",
    "related": [
      "protective-relay.html",
      "relay-test-reference.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "relay-test-reference.html",
    "title": "型式別の試験早見表",
    "category": "保護・配線",
    "description": "10型式の確認項目・基準・困ったとき・更新情報を一覧で読む。",
    "tags": "戸上 オムロン 三菱 基準値 取説",
    "related": [
      "protective-relay.html",
      "relay-quickref.html",
      "relay-wiring.html"
    ]
  },
  {
    "path": "relay-wiring.html",
    "title": "K2DG-AV1の配線と動作",
    "category": "保護・配線",
    "description": "ZCT・ZPD・電源・出力接点から、試験入力と故障影響を追う。",
    "tags": "DGR 地絡方向 Io Vo 位相 Z1 Z2 T E",
    "related": [
      "relay-basics.html",
      "sequence-basics.html",
      "protective-relay.html"
    ]
  },
  {
    "path": "relay-wiring-k2ov-k2uv.html",
    "title": "K2OV・K2UVの配線と試験",
    "category": "保護・配線",
    "description": "過電圧・不足電圧の入力、型式差分、接点の変化を確認。",
    "tags": "OVR UVR 59 27 電圧 オムロン",
    "related": [
      "relay-basics.html",
      "sequence-basics.html",
      "protective-relay.html"
    ]
  },
  {
    "path": "relay-test-flow.html",
    "title": "OVGR・RPRの試験フロー",
    "category": "保護・配線",
    "description": "試験の準備から動作・復旧までを教材の流れで追う。",
    "tags": "零相過電圧 逆電力 OVGR RPR",
    "related": [
      "ovgr-rpr-8steps.html",
      "pukapuka-ukiwa-memo-standalone.html",
      "protective-relay.html"
    ]
  },
  {
    "path": "ovgr-rpr-8steps.html",
    "title": "OVGR・RPR試験の確認順序",
    "category": "保護・配線",
    "description": "試験前・動作確認・復旧の各段階で照合する事項を読む。",
    "tags": "OVGR RPR 手順 トリップ 復帰",
    "related": [
      "relay-test-flow.html",
      "pukapuka-ukiwa-memo-standalone.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "pukapuka-ukiwa-memo-standalone.html",
    "title": "OVGR・RPRの学習ノート",
    "category": "保護・配線",
    "description": "零相過電圧と逆電力の入力・意味・試験での区別を学ぶ。",
    "tags": "OVGR RPR 基礎 逆潮流",
    "related": [
      "relay-basics.html",
      "relay-test-flow.html",
      "protective-relay.html"
    ]
  },
  {
    "path": "KP-PRRV-CPC_実機準拠アンチョコ_サイト.html",
    "title": "KP-PRRV-CPCの現場アンチョコ",
    "category": "保護・配線",
    "description": "対象型式の端子・OVGR/RPR・試験条件を照合するための教材。",
    "tags": "戸上 KP PRRV CPC 零相 逆電力",
    "related": [
      "protective-relay.html",
      "relay-test-reference.html",
      "relay-test-flow.html"
    ]
  },
  {
    "path": "RX4744_系統連系保護継電器_現場アンチョコ.html",
    "title": "RX4744の試験器アンチョコ",
    "category": "保護・配線",
    "description": "系統連系保護の試験器機能と、試験項目の対応を読む。",
    "tags": "NF RX4744 位相 周波数",
    "related": [
      "cpp1-a02d2-rx4744.html",
      "measuring-instruments.html",
      "relay-quickref.html"
    ]
  },
  {
    "path": "cpp1-a02d2-rx4744.html",
    "title": "CPP1-A02D2 × RX4744",
    "category": "保護・配線",
    "description": "継電器と試験器の組合せで、入力・端子・確認項目を整理。",
    "tags": "三菱 MELPRO DASH DSL DSH UV UF OF RP 位相",
    "related": [
      "RX4744_系統連系保護継電器_現場アンチョコ.html",
      "protective-relay.html",
      "sequence-basics.html"
    ]
  },
  {
    "path": "motor-protection-relays.html",
    "title": "1E・2E・3Eのモータ保護",
    "category": "保護・配線",
    "description": "Eの数字、保護機能、主回路と制御回路、接点動作を区別。",
    "tags": "モーター 電動機 欠相 逆相 過負荷 THR EMPR",
    "related": [
      "protective-relay.html",
      "sequence-basics.html",
      "insulation-resistance-principle.html"
    ]
  },
  {
    "path": "insulation-monitoring-test.html",
    "title": "集合形絶縁監視の試験教材",
    "category": "保護・配線",
    "description": "Io・Ior・Igrと、監視装置の検出・警報・試験の関係を学ぶ。",
    "tags": "漏電 ELR LSIG ベクトル 絶縁監視",
    "related": [
      "protective-relay.html",
      "insulation-resistance-principle.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "test-measurement.html",
    "title": "試験名から方法と器具を探す",
    "category": "測定・点検",
    "description": "試験の目的から、器具候補・確認工程・測定値の意味へ進む。",
    "tags": "試験方法 工程 復旧 OCR 接地 絶縁 油",
    "related": [
      "measuring-instruments.html",
      "measurement-principles.html",
      "relay-quickref.html"
    ]
  },
  {
    "path": "measuring-instruments.html",
    "title": "測定器・試験器の型式検索",
    "category": "測定・点検",
    "description": "器具型式から用途・測定範囲・関連試験・公式取説を探す。",
    "tags": "IP-1110 DI-05N DI-11N ET-5 GCR-mini メガー テスター",
    "related": [
      "test-measurement.html",
      "measurement-principles.html",
      "instrument-calibration-guide.html"
    ]
  },
  {
    "path": "measurement-principles.html",
    "title": "測定器の原理から学ぶ",
    "category": "測定・点検",
    "description": "絶縁抵抗・接地抵抗を、何を測る器具かから選んで学ぶ。",
    "tags": "めがー アーステスター 原理 入門",
    "related": [
      "insulation-resistance-principle.html",
      "earth-resistance-et5.html",
      "measuring-instruments.html"
    ]
  },
  {
    "path": "insulation-resistance-principle.html",
    "title": "絶縁抵抗：測る二点と範囲",
    "category": "測定・点検",
    "description": "対地・相間・開極間と、接点の開閉で変わる測定範囲を図で確認。",
    "tags": "メガー めがー MΩ ゼロ インバーター マグネット 二次側",
    "related": [
      "vcb-inspection-guide.html",
      "motor-starting-insulation.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "motor-starting-insulation.html",
    "title": "始動方式別：絶縁抵抗は何本当てる？",
    "category": "測定・点検",
    "description": "停止中につながる「島」を数えて当てる点を決める。端子をタップして確かめるシミュレーター付き。",
    "tags": "メガー モーター 電動機 スターデルタ Y-Δ コンドルファ リアクトル 正逆 巻線形 二次抵抗 マグネット 二次側 何本 1本 3本 始動方式 シミュレーター 合成 58条 短絡",
    "related": [
      "insulation-resistance-principle.html",
      "motor-protection-relays.html",
      "sequence-basics.html"
    ]
  },
  {
    "path": "earth-resistance-et5.html",
    "title": "ET-5：接地抵抗と三極法",
    "category": "測定・点検",
    "description": "E・P・Cの役割、三極法と二極法、ET-5の読み方を学ぶ。",
    "tags": "接地杭 補助極 アーステスター 2極 3極 ゼロチェック",
    "related": [
      "measurement-principles.html",
      "measuring-instruments.html",
      "pc-grounding-guide.html"
    ]
  },
  {
    "path": "vcb-inspection-guide.html",
    "title": "VCBの絶縁・接点・動作点検",
    "category": "測定・点検",
    "description": "対地・相間と開いた接点間、主回路抵抗、動作・連動を図で区別。",
    "tags": "真空遮断器 メガー 真空度 開極間 同極 異極",
    "related": [
      "insulation-resistance-principle.html",
      "sequence-basics.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "instrument-calibration-guide.html",
    "title": "計器校正と誤差の意味",
    "category": "測定・点検",
    "description": "標準と指示値の比較、補正値、不確かさ、CT・VTを含む範囲を確認。",
    "tags": "テスター 電圧計 電流計 誤差 rdg fs 標準器",
    "related": [
      "measuring-instruments.html",
      "ct-calculator.html",
      "measurement-principles.html"
    ]
  },
  {
    "path": "ppe-withstand-guide.html",
    "title": "手袋・長靴・防具の耐圧",
    "category": "測定・点検",
    "description": "品目ごとに、絶縁の壁を挟む電極・試験条件・判定・記録を学ぶ。",
    "tags": "保護具 ゴム ヘルメット シート カバー 操作棒 水",
    "related": [
      "ac-withstand-test-simulator.html",
      "test-measurement.html",
      "instrument-calibration-guide.html"
    ]
  },
  {
    "path": "equipment-map.html",
    "title": "図から受変電機器を探す",
    "category": "機器・動作",
    "description": "キュービクルの絵から21機器の役割と点検教材を開く。",
    "tags": "GIS PAS AS VCB LBS DS PF CT VT SC SR LA ZCT ZPD",
    "related": [
      "relay-basics.html",
      "measurement-principles.html",
      "sequence-basics.html"
    ]
  },
  {
    "path": "sequence-basics.html",
    "title": "接点・コイル・時間のシーケンス",
    "category": "機器・動作",
    "description": "22教材を操作し、接点・自己保持・タイマ・設備動作を順に理解。",
    "tags": "リレー a接点 b接点 励磁 消磁 スターデルタ インターロック",
    "related": [
      "motor-protection-relays.html",
      "generator-rescue-island.html",
      "relay-basics.html"
    ]
  },
  {
    "path": "generator-rescue-island.html",
    "title": "非常用発電機の試験としくみ",
    "category": "機器・動作",
    "description": "自動始動・停止、保護、負荷、温度、蓄電池を目的別に探す。",
    "tags": "発電機 63Q 26W ソレノイド ガバナ AVR 始動 負荷",
    "related": [
      "sequence-basics.html",
      "test-measurement.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "pc-grounding-guide.html",
    "title": "PC接地とペテルゼンコイル",
    "category": "現場の疑問",
    "description": "地絡電流の帰路と、接地方式・コイル・SOGの関係を図で読む。",
    "tags": "消弧リアクトル 中性点 接地用コンデンサ B付き",
    "related": [
      "ukiwamemo_kyounonande_shg_df3_ic_io.html",
      "earth-resistance-et5.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "ukiwamemo_kyounonande_b_ground_transformer.html",
    "title": "B種接地線と変圧器容量",
    "category": "現場の疑問",
    "description": "二次定格電流と1相分容量を区別し、接地線の考え方を確認。",
    "tags": "38sq 22sq 0.052 単相 三相 接地線",
    "related": [
      "ct-calculator.html",
      "earth-resistance-et5.html",
      "equipment-map.html"
    ]
  },
  {
    "path": "ukiwamemo_kyounonande_shg_df3_ic_io.html",
    "title": "SHG-DF3：DGRなのに電流＋電流？",
    "category": "現場の疑問",
    "description": "Ic・IoとVo・Io、非接地とPC接地の違いを原理から読む。",
    "tags": "地絡方向 ZCT Ic Io Vo PC接地",
    "related": [
      "pc-grounding-guide.html",
      "relay-wiring.html",
      "relay-basics.html"
    ]
  },
  {
    "path": "ukiwamemo_kyounonande_taiatsu_reactor_ic.html",
    "title": "耐圧試験の電流はどこへ戻る？",
    "category": "現場の疑問",
    "description": "ケーブルとリアクトルの帰路、A1/A2、0端子と接地端子を図で追う。",
    "tags": "R-1220K DR-1220MH Ic IL A1 A2 リアクトルなし",
    "related": [
      "ac-withstand-test-simulator.html",
      "ppe-withstand-guide.html",
      "measurement-principles.html"
    ]
  },
  {
    "path": "why-today.html",
    "title": "今日の「なんで？」記事一覧",
    "category": "現場の疑問",
    "description": "現場の疑問から、接地・変圧器・耐圧電流の記事を選ぶ。",
    "tags": "なぜ 理由 なんで 疑問",
    "related": [
      "equipment-map.html",
      "measurement-principles.html",
      "relay-basics.html"
    ]
  },
  {
    "path": "near-miss.html",
    "title": "やらかし・ヒヤリから振り返る",
    "category": "記録・島",
    "description": "絶縁監視の離線・PASの最終状態・CTD接続などの振り返り。",
    "tags": "失敗 ヒヤリ 復旧 離線 PAS CTD",
    "related": [
      "field-essentials.html",
      "pukapuka-diary.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "field-essentials.html",
    "title": "現場の持ち物メモ",
    "category": "記録・島",
    "description": "普段の持ち物・機器用工具・あると便利な候補を整理。",
    "tags": "準備 工具 持ち物 チェック",
    "related": [
      "near-miss.html",
      "measuring-instruments.html",
      "test-measurement.html"
    ]
  },
  {
    "path": "pukapuka-diary.html",
    "title": "ぷかぷか日誌",
    "category": "記録・島",
    "description": "仕事・勉強・サイトづくりの記録を日付から読む。",
    "tags": "日記 記録 PAS 耐圧 竣工",
    "related": [
      "near-miss.html",
      "why-today.html",
      "about.html"
    ]
  },
  {
    "path": "zukan.html",
    "title": "うきわちゃんと島の図鑑",
    "category": "記録・島",
    "description": "キャラクター・カード・用語・機器を楽しみながら眺める。",
    "tags": "浮き輪 キャラクター 図鑑 カード",
    "related": [
      "equipment-map.html",
      "about.html",
      "index.html"
    ]
  },
  {
    "path": "about.html",
    "title": "うきわメモについて",
    "category": "記録・島",
    "description": "このサイトの目的と、使い方の考え方を読む。",
    "tags": "サイト 目的 電気保安",
    "related": [
      "index.html",
      "why-today.html",
      "zukan.html"
    ]
  },
  {
    "path": "index.html",
    "title": "うきわメモのホーム",
    "category": "記録・島",
    "description": "計算・試験・原理・機器の主な入口を島から選ぶ。",
    "tags": "トップ ホーム 全体",
    "related": [
      "equipment-map.html",
      "measurement-principles.html",
      "why-today.html"
    ]
  },
  {
    "path": "analytics-info.html",
    "title": "アクセス解析について",
    "category": "記録・島",
    "description": "アクセス解析の利用目的・同意・保存される情報を確認。",
    "tags": "プライバシー Cookie 設定",
    "related": [
      "about.html",
      "index.html",
      "zukan.html"
    ]
  }
];
