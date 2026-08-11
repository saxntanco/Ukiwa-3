/*
 * ぷかぷかうきわメモ 測定器具カタログ 国産・海外横断追加データ v4
 * 一次資料確認日: 2026-08-11
 *
 * 型式の存在と主用途をメーカー公式ページ／公式カタログで確認できたものだけを登録する。
 * 端子、個別結線、操作順、付属コード、国内での適合範囲、社内管理値は、取扱説明書と
 * 実機を確認するまで共通詳細画面で「不足」として残す。
 */
(function () {
  const checked = '2026-08-11';
  const existing = window.UKIWA_INSTRUMENT_ADDITIONS || [];
  const policy = {
    '絶縁抵抗':['無電圧、切離し、試験電圧、放電、接地を確認する。','試験電圧、PI/DAR対応、最大出力を類似機種から流用しない。'],
    '接地抵抗':['接地線切離しの影響、地電圧、補助極配置、閉ループ条件を確認する。','2極・3極・4極・クランプ法の表示値を同じ意味として扱わない。'],
    '漏れ電流':['活線条件、測定カテゴリ、離隔、クランプの完全閉鎖を確認する。','負荷電流の一線クランプと零相電流の一括クランプを混同しない。'],
    '負荷電流':['活線条件、測定カテゴリ、導体径、AC/DCを確認する。','iFlexを含むセンサ構成、真の実効値、レンジを機種間で流用しない。'],
    '電圧・導通':['入力端子、最大入力、測定カテゴリ、リードを確認する。抵抗測定は無電圧で行う。','電流端子への誤挿入と、導通ブザーを低抵抗合否とみなす誤りに注意する。'],
    '電力・電源品質':['配線方式、相対応、センサ比、クランプ方向、活線結線条件を確認する。','電力ロガーと規格対応PQAの測定目的・イベント条件を混同しない。'],
    '継電器試験':['CTT、VT回路、補助電源、トリップ回路、整定値、復旧を操作票で管理する。','一次／二次注入、相数、出力容量、IEC 61850対応を同一視しない。'],
    'CT・VT・変圧器':['CT二次開放、VT逆励磁、接地、残留電荷、試験回路分離を確認する。','変流比・変成比・極性・励磁・負担を一つの試験結果として混同しない。'],
    '低抵抗':['無電圧、放電、外部電圧、4端子接触位置を確認する。','2端子法、4端子法、測定電流、温度補正を混同しない。']
  };
  function make(r){
    const p=policy[r[3]]||['完全型式、定格、付属品、校正期限、系統状態を確認する。','類似型式の端子・仕様・操作を流用しない。'];
    return {maker:r[0],model:r[1],name:r[2],category:r[3],type:r[4]||'測定器',status:r[5]||'current',priority:r[6],main:false,
      aliases:r[7]||[],measures:r[8]||[],summary:r[9],use:r[10],specs:{'資料状態':r[11]||'メーカー公式製品ページ確認済み','端子・操作':'取扱説明書と実機で要確認'},
      compare:'同一カテゴリでも測定方式、出力、相数、レンジ、安全定格、国内仕様、付属品が異なる。完全型式の公式資料で比較する。',
      safety:p[0],mistakes:p[1],related:r[12]||[],official:r[13],catalogChecked:checked};
  }
  const rows = [
    ['Fluke','1587 FC','絶縁マルチメータ','絶縁抵抗','測定器','current',90,['1587FC'],['絶縁抵抗','DMM'], '絶縁抵抗計とデジタルマルチメータを一体化した保全向け測定器。','モーター、ケーブル、設備の絶縁と電気測定','公式製品ページ・資料導線確認済み',['1507','1555 FC'],'https://www.fluke.com/en-us/product/electrical-testing/insulation-testers/fluke-1587-fc'],
    ['Fluke','1507','絶縁抵抗計','絶縁抵抗','測定器','current',91,['Fluke1507'],['絶縁抵抗','低圧設備'], '低圧設備の保全向け携帯形絶縁抵抗計。','低圧回路・モーター・ケーブルの絶縁確認','公式製品ページ関連製品で確認',['1587 FC'],'https://www.fluke.com/en-us/product/electrical-testing/insulation-testers/fluke-1587-fc'],
    ['Fluke','1555 FC','高電圧絶縁抵抗計','絶縁抵抗','測定器','current',92,['1555FC'],['高電圧絶縁抵抗','PI/DAR'], '高電圧機器の絶縁診断向け絶縁抵抗計。','高圧ケーブル、回転機、変圧器の絶縁診断','公式製品ページ関連製品で確認',['1550C FC','1587 FC'],'https://www.fluke.com/en-us/product/electrical-testing/insulation-testers/fluke-1587-fc'],
    ['Fluke','1550C FC','高電圧絶縁抵抗計','絶縁抵抗','測定器','current',93,['1550CFC'],['高電圧絶縁抵抗','PI/DAR'], '高電圧設備の絶縁診断に用いる絶縁抵抗計。','ケーブル、回転機、変圧器の絶縁診断','公式製品ページ関連製品で確認',['1555 FC'],'https://www.fluke.com/en-us/product/electrical-testing/insulation-testers/fluke-1587-fc'],
    ['Fluke','376 FC','AC/DCクランプメータ','負荷電流','測定器','current',94,['376FC'],['AC/DC電流','iFlex','真の実効値'], '固定ジョーとフレキシブル電流プローブを使えるAC/DCクランプメータ。','配電・動力・直流設備の負荷電流確認','公式製品ページ確認済み',['369 FC'],'https://www.fluke.com/en-us/product/electrical-testing/clamp-meters/fluke-376-fc'],
    ['Fluke','369 FC','漏れ電流クランプメータ','漏れ電流','測定器','current',95,['369FC'],['漏れ電流','ロギング','真の実効値'], '設備停止せず漏れ電流を測定・記録するクランプメータ。','漏電傾向の記録と回路絞込み','公式製品ページ確認済み',['376 FC'],'https://www.fluke.com/en-us/product/electrical-testing/clamp-meters/fluke-369-fc'],
    ['Fluke','1773','三相電力品質アナライザ','電力・電源品質','測定器','current',96,['Fluke1773'],['電力品質','高調波','イベント'], '電力品質トラブルの記録・解析を行う1770シリーズ機。','電圧変動、高調波、電力、イベント調査','公式シリーズページ確認済み',['1777'],'https://www.fluke.com/en-us/product/electrical-testing/power-quality/1773-1775-1777'],
    ['Fluke','1777','三相電力品質アナライザ','電力・電源品質','測定器','current',97,['Fluke1777'],['電力品質','高調波','過渡現象'], '1770シリーズの電力品質解析器。記録能力の差はシリーズ資料で比較する。','電源品質、イベント、過渡現象の調査','公式シリーズページ確認済み',['1773'],'https://www.fluke.com/en-us/product/electrical-testing/power-quality/1773-1775-1777'],

    ['Megger','MIT525/2','5 kV絶縁抵抗計','絶縁抵抗','測定器','current',98,['MIT5252'],['5kV','PI/DAR','絶縁診断'], '5 kV級の高電圧絶縁抵抗・診断用測定器。','回転機、ケーブル、変圧器の絶縁診断','公式シリーズページ確認済み',['MIT1025/2'],'https://www.megger.com/en-us/products/advanced-5-kv-10-kv-and-15-kv-insulation-resistance-testers'],
    ['Megger','MIT1025/2','10 kV絶縁抵抗計','絶縁抵抗','測定器','current',99,['MIT10252'],['10kV','PI/DAR','絶縁診断'], '10 kV級の高電圧絶縁抵抗・診断用測定器。','高圧機器・ケーブルの絶縁診断','公式シリーズページ確認済み',['MIT525/2','MIT1525/2'],'https://www.megger.com/en-us/products/advanced-5-kv-10-kv-and-15-kv-insulation-resistance-testers'],
    ['Megger','MIT1525/2','15 kV絶縁抵抗計','絶縁抵抗','測定器','current',100,['MIT15252'],['15kV','PI/DAR','絶縁診断'], '15 kV級の高電圧絶縁抵抗・診断用測定器。','高電圧機器の絶縁診断','公式シリーズページ確認済み',['MIT1025/2'],'https://www.megger.com/en-us/products/advanced-5-kv-10-kv-and-15-kv-insulation-resistance-testers'],

    ['OMICRON','CPC 100','一次試験システム','CT・VT・変圧器','試験器','current',101,['CPC100'],['一次注入','CT/VT','変圧器','接地'], '一次注入を中心にCT・VT・変圧器・接地系などを試験する多用途システム。','変成器、変圧器、接地、ケーブル、遮断器の現地試験','公式製品ページ確認済み',['CT Analyzer','COMPANO 100'],'https://www.omicronenergy.com/en/products/cpc-100/'],
    ['OMICRON','COMPANO 100','一次・二次試験器','継電器試験','試験器','current',102,['COMPANO100'],['一次注入','二次注入','基本リレー試験'], 'バッテリー駆動で一次・二次注入と基本的な保護試験に対応する携帯器。','現地での配線、極性、一次・二次試験','公式製品ページ確認済み',['CPC 100','CMC 430'],'https://www.omicronenergy.com/en/products/compano-100/'],
    ['OMICRON','CT Analyzer','CTアナライザ','CT・VT・変圧器','試験器','current',103,['CTAnalyzer'],['CT','変流比','励磁','極性'], 'CTの特性評価と銘板データ検証を支援する専用試験器。','保護・計測用CTの現地試験と評価','公式製品ページ確認済み',['CPC 100'],'https://www.omicronenergy.com/en/products/ct-analyzer/'],
    ['OMICRON','CPOL3','極性・配線チェッカー','CT・VT・変圧器','補助器具','current',104,['CPOL3'],['極性','配線確認'], '専用試験信号を検出して配線と極性確認を支援する携帯チェッカー。','CT・VT二次配線、三相配線、端子台の確認','公式製品ページ確認済み',['CPC 100','CMC 356'],'https://www.omicronenergy.com/en/products/cpol3/'],
    ['OMICRON','CMC 356','6相保護リレー試験器','継電器試験','試験器','legacy',105,['CMC356'],['6相','二次注入','IEC 61850'], '高出力の多相二次注入で各世代の保護リレーを試験する装置。','電磁形からデジタル保護リレーまでの多相試験','公式製品ページ・後継確認済み',['CMC 500','CMC 430'],'https://www.omicronenergy.com/en/products/cmc-356/'],
    ['OMICRON','CMC 430','多相保護リレー試験器・校正器','継電器試験','試験器','current',106,['CMC430'],['多相','二次注入','IEC 61850','校正'], '可搬性と精度を重視した多相保護リレー試験器・校正器。','数値形保護リレー、計器、変換器の試験','公式製品ページ確認済み',['CMC 356','CMC 500'],'https://www.omicronenergy.com/en/products/cmc-430/'],
    ['OMICRON','CMC 500','多相保護リレー試験器','継電器試験','試験器','current',107,['CMC500'],['多相','二次注入','デジタル変電所'], '従来形からIEC 61850デジタル変電所までを対象とする新世代試験器。','保護システムの多相・通信連携試験','公式製品ページ確認済み',['CMC 356','CMC 430'],'https://www.omicronenergy.com/en/products/cmc-500/'],
    ['OMICRON','VOTANO 100','VTアナライザ','CT・VT・変圧器','試験器','current',108,['VOTANO100'],['VT/CVT','変成比','極性','校正'], '誘導形VTとCVTの性能・クラス確認を行う可搬形試験器。','保護・計測用VT/CVTの現地試験','公式製品ページ確認済み',['CPC 100'],'https://www.omicronenergy.com/en/products/votano-100/'],

    ['Metrel','MI 3210','10 kV絶縁抵抗計','絶縁抵抗','測定器','current',109,['MI3210'],['10kV','PI/DAR','絶縁診断'], '10 kV級の絶縁抵抗・診断用測定器として公式カタログ掲載。','高電圧設備・ケーブルの絶縁診断','公式総合カタログ確認済み',['MI 3201'],'https://www.metrel.si/en/downloads/'],
    ['Metrel','MI 3201','5 kV絶縁抵抗計','絶縁抵抗','測定器','current',110,['MI3201'],['5kV','PI/DAR','絶縁診断'], '5 kV級の絶縁抵抗・診断用測定器として公式カタログ掲載。','回転機、ケーブル、変圧器の絶縁診断','公式総合カタログ確認済み',['MI 3210'],'https://www.metrel.si/en/downloads/'],
    ['Metrel','MI 3290','接地アナライザ','接地抵抗','測定器','current',111,['MI3290'],['接地抵抗','接地解析'], '複数の接地測定方式を扱う接地アナライザシリーズ。','接地網・接地極の評価','公式カタログ・ショップ掲載確認済み',['MI 3295'],'https://www.metrel.si/en/downloads/'],
    ['Metrel','MI 3252','低抵抗計','低抵抗','測定器','current',112,['MI3252'],['4端子','低抵抗'], '接続部・導体の微小抵抗測定向け測定器として公式カタログ掲載。','ボンディング、接続抵抗、巻線抵抗の確認','公式総合カタログ確認済み',[],'https://www.metrel.si/en/downloads/'],
    ['Metrel','MI 2893','電力品質アナライザ','電力・電源品質','測定器','current',113,['MI2893'],['電力品質','高調波','イベント'], '三相電力品質解析器として公式カタログ掲載。','高調波、電圧イベント、電力の調査','公式総合カタログ確認済み',['MI 2892'],'https://www.metrel.si/en/downloads/'],
    ['Metrel','MI 3295','ステップ接触電圧測定システム','接地抵抗','試験器','current',114,['MI3295'],['歩幅電圧','接触電圧','接地'], '接地設備周辺の歩幅・接触電圧評価用システムとして公式カタログ掲載。','変電所等の接地安全評価','公式総合カタログ確認済み',['MI 3290'],'https://www.metrel.si/en/downloads/'],

    ['マルチ計測器','M-1141','クランプ式漏れ電流計','漏れ電流','測定器','current',115,['M1141'],['漏れ電流','負荷電流'], '漏れ電流測定用クランプ計としてメーカー公式掲載。','低圧回路の漏れ電流・負荷電流確認','公式製品ページ確認済み',['M-1141X'],'https://www.multimic.com/products/detail/2652'],
    ['マルチ計測器','M-1141X','クランプ式漏れ電流計','漏れ電流','測定器','current',116,['M1141X'],['漏れ電流','負荷電流'], 'M-1141系の漏れ電流クランプ。完全型式で仕様差を確認する。','低圧回路の漏れ電流・負荷電流確認','公式製品ページ確認済み',['M-1141'],'https://www.multimic.com/products/detail/2653'],
    ['マルチ計測器','M-140LX','クランプ式漏れ電流計','漏れ電流','測定器','current',117,['M140LX'],['漏れ電流','負荷電流'], '漏れ電流測定用クランプ計としてメーカー公式掲載。','漏電調査と負荷電流確認','公式製品ページ確認済み',['M-1141X'],'https://www.multimic.com/products/detail/2661'],
    ['マルチ計測器','RLM-10+','漏れ電流ロガー','漏れ電流','測定器','current',118,['RLM10PLUS','RLM10+'],['漏れ電流','ロギング'], '漏れ電流の時間変化を記録するロガー。','間欠漏電・漏れ電流傾向の長時間監視','公式製品ページ確認済み',['RLM-10X'],'https://www.multimic.com/products/detail/2592.html'],
    ['マルチ計測器','RLM-10X','漏れ電流ロガー','漏れ電流','測定器','current',119,['RLM10X'],['漏れ電流','ロギング'], '漏れ電流の継続監視用ロガーとしてメーカー公式掲載。','間欠漏電・漏れ電流傾向の記録','公式製品ページ確認済み',['RLM-10+'],'https://www.multimic.com/products/detail/2730.html'],
    ['マルチ計測器','MCL-1100D','AC/DCクランプメータ','負荷電流','測定器','current',120,['MCL1100D'],['AC/DC電流'], '交流・直流負荷電流用クランプメータとしてメーカー公式掲載。','配電・直流設備の負荷電流確認','公式製品ページ確認済み',[],'https://www.multimic.com/products/detail/118'],

    ['三和電気計器','HG561H','高電圧絶縁抵抗計','絶縁抵抗','測定器','current',121,['SANWAHG561H'],['高電圧絶縁抵抗'], '高電圧設備向け絶縁抵抗計として公式カテゴリ掲載。','高圧機器・ケーブルの絶縁抵抗確認','公式製品カテゴリ確認済み',['MG500'],'https://www.sanwa-meter.co.jp/japan/products/insulation-grounding/index.html'],
    ['三和電気計器','MG500','デジタル絶縁抵抗計','絶縁抵抗','測定器','current',122,['SANWAMG500'],['絶縁抵抗','低圧設備'], '低圧設備向け絶縁抵抗計として公式カテゴリ掲載。','低圧電路・機器の絶縁抵抗確認','公式製品カテゴリ確認済み',['HG561H'],'https://www.sanwa-meter.co.jp/japan/products/insulation-grounding/index.html'],
    ['三和電気計器','PDM1529S','絶縁抵抗計','絶縁抵抗','測定器','current',123,['PDM1529'],['絶縁抵抗'], '携帯形絶縁抵抗計として公式カテゴリ掲載。','低圧電路・機器の絶縁抵抗確認','公式製品カテゴリ確認済み',['PDM5219S'],'https://www.sanwa-meter.co.jp/japan/products/insulation-grounding/index.html'],
    ['三和電気計器','PDM5219S','絶縁抵抗計','絶縁抵抗','測定器','current',124,['PDM5219'],['絶縁抵抗'], '携帯形絶縁抵抗計として公式カテゴリ掲載。','低圧電路・機器の絶縁抵抗確認','公式製品カテゴリ確認済み',['PDM1529S'],'https://www.sanwa-meter.co.jp/japan/products/insulation-grounding/index.html'],
    ['三和電気計器','DM1009S','絶縁抵抗計','絶縁抵抗','測定器','current',125,['DM1009'],['絶縁抵抗'], 'アナログ絶縁抵抗計として公式カテゴリ掲載。','低圧電路・機器の絶縁抵抗確認','公式製品カテゴリ確認済み',[],'https://www.sanwa-meter.co.jp/japan/products/insulation-grounding/index.html'],
    ['三和電気計器','CD5003','デジタルマルチメータ','電圧・導通','測定器','current',126,['SANWACD5003'],['AC/DC電圧','抵抗','導通'], '電気設備の基本測定に用いるデジタルマルチメータ。','低圧回路・制御回路の電圧、抵抗、導通確認','公式製品カテゴリ確認済み',['CD771'],'https://www.sanwa-meter.co.jp/japan/products/digital_multimeters/index.html'],
    ['三和電気計器','CD771','デジタルマルチメータ','電圧・導通','測定器','current',127,['SANWACD771'],['AC/DC電圧','抵抗','導通'], '現場保全向けデジタルマルチメータとしてメーカー公式掲載。','低圧回路・制御回路の基本測定','公式製品ページ確認済み',['CD5003'],'https://www.sanwa-meter.co.jp/japan/products/digital_multimeters/cd771.html'],

    ['双興電機製作所','OCR-50CK','過電流継電器試験装置','継電器試験','試験器','current',128,['OCR50CK'],['OCR','大電流','動作時間'], 'OCRの動作電流・時間試験用装置としてメーカー公式一覧掲載。','過電流継電器の単体・連動試験','公式製品一覧確認済み',['OCR-25CVK'],'https://soukou.co.jp/product/product.php?md=all&s_menu=1'],
    ['双興電機製作所','OCR-25CVK','OCR・電圧継電器試験装置','継電器試験','試験器','current',129,['OCR25CVK'],['OCR','電圧継電器','動作時間'], '過電流・電圧要素の継電器試験装置。','OCRおよび対応電圧継電器の試験','公式製品ページ確認済み',['OCR-50CK'],'https://soukou.co.jp/product/html/0004.html'],
    ['双興電機製作所','DGR-1000KD','地絡方向継電器試験装置','継電器試験','試験器','current',130,['DGR1000KD'],['GR','DGR','位相'], 'GR・DGR試験用装置としてメーカー公式一覧掲載。','地絡・地絡方向継電器の動作値・時間試験','公式製品一覧確認済み',['DGR-5000KD'],'https://soukou.co.jp/product/product.php?md=all&s_menu=1'],
    ['双興電機製作所','DGR-5000KD','地絡方向継電器試験装置','継電器試験','試験器','current',131,['DGR5000KD'],['GR','DGR','位相'], 'DGR試験器シリーズの一型式としてメーカー公式一覧掲載。','地絡方向継電器の試験','公式製品一覧確認済み',['DGR-1000KD'],'https://soukou.co.jp/product/product.php?md=all&s_menu=1'],
    ['双興電機製作所','GER-2000KD','地絡継電器試験装置','継電器試験','試験器','current',132,['GER2000KD'],['GR','ELR','動作時間'], '地絡継電器試験装置としてメーカー公式一覧掲載。','地絡継電器・漏電リレー等の対応試験','公式製品一覧確認済み',[],'https://soukou.co.jp/product/product.php?md=all&s_menu=1'],
    ['双興電機製作所','FVT-600KD','周波数・電圧継電器試験装置','継電器試験','試験器','current',133,['FVT600KD'],['OVR/UVR','OFR/UFR','周波数'], '周波数・電圧継電器の試験装置としてメーカー公式一覧掲載。','過不足電圧・過不足周波数継電器の試験','公式製品一覧確認済み',[],'https://soukou.co.jp/product/product.php?md=all&s_menu=1'],

    ['エヌエフ回路設計ブロック','RX47022','多相保護リレー試験器','継電器試験','試験器','current',134,['RX-47022'],['多相','電圧・電流・位相','保護リレー'], '多相保護リレー試験向け装置としてメーカー公式掲載。','デジタル保護リレー・系統連系保護の多相試験','公式製品ページ確認済み',['RX4744A'],'https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/'],
    ['エヌエフ回路設計ブロック','RX4717','保護リレー試験器','継電器試験','試験器','current',135,['RX-4717','RX4717K'],['保護リレー','電圧・電流'], '保護リレー試験器シリーズとしてメーカー公式掲載。','保護継電器の動作値・時間試験','公式製品ページ確認済み',['RX47022'],'https://www.nfcorp.co.jp/pro/p-test/rx/rx4717/'],
    ['エヌエフ回路設計ブロック','RX4744A','電圧4相・電流4相 保護リレー試験器','継電器試験','試験器','current',136,['RX-4744A','RX4744AS'],['電圧4相','電流4相','位相・周波数'], 'RX4744系の現行シリーズとしてメーカー公式カテゴリ掲載。','多相・多要素デジタル保護リレー試験','公式製品カテゴリ確認済み',['RX4744','RX47022'],'https://www.nfcorp.co.jp/pro/category/p-test/rx/']
  ];
  const additions=rows.map(make);
  window.UKIWA_INSTRUMENT_ADDITIONS=existing.concat(additions);
  window.UKIWA_INSTRUMENT_CATALOG_META={version:'v4',checked,totalCount:20+window.UKIWA_INSTRUMENT_ADDITIONS.length,addedCount:window.UKIWA_INSTRUMENT_ADDITIONS.length,sourcePolicy:'メーカー公式資料で型式と用途を確認。端子・操作・社内管理値は未確認のまま表示。'};

  const methods=window.UKIWA_MEASUREMENT_METHODS||[];
  const maps={
    'insulation-low':['1587 FC','1507','MG500','PDM1529S','PDM5219S','DM1009S'],
    'insulation-high':['1555 FC','1550C FC','MIT525/2','MIT1025/2','MIT1525/2','MI 3210','MI 3201','HG561H'],
    'earth-standard':['MI 3290'],
    'leakage-current':['369 FC','M-1141','M-1141X','M-140LX','RLM-10+','RLM-10X'],
    'load-current':['376 FC','MCL-1100D'],
    'voltage-continuity':['CD5003','CD771'],
    'low-resistance':['MI 3252'],
    'power-quality':['1773','1777','MI 2893'],
    'relay-ocr':['OCR-50CK','OCR-25CVK','CMC 356','CMC 430','CMC 500','RX47022','RX4717','RX4744A'],
    'relay-dgr':['DGR-1000KD','DGR-5000KD','GER-2000KD','COMPANO 100','CMC 356','CMC 430','CMC 500','RX47022','RX4717','RX4744A'],
    'relay-voltage-frequency':['FVT-600KD','CMC 356','CMC 430','CMC 500','RX47022','RX4744A']
  };
  Object.entries(maps).forEach(([id,models])=>{const m=methods.find(x=>x.id===id);if(m)models.forEach(v=>{if(!m.instrumentModels.includes(v))m.instrumentModels.push(v);});});
  const extraMethods=[
    {id:'ct-vt-testing',title:'CT・VT・変成器の特性・極性試験',category:'CT・VT',summary:'CT・VTの変流比・変成比・極性・励磁特性・二次回路を、目的に合う専用器で確認する。',aliases:['CT試験','VT試験','変流比','変成比','極性','励磁'],instrumentModels:['CPC 100','CT Analyzer','CPOL3','VOTANO 100','COMPANO 100'],distinction:'一次注入、二次注入、無負荷特性、極性・配線確認は別の試験であり、必要な回路分離と器具が異なる。',safety:'CT二次開放、VT逆励磁、接地、残留電荷、試験回路分離を操作票と図面で確認する。',stages:['試験目的と対象変成器を特定','銘板・図面・完全型式を確認','系統状態と試験回路分離を確認','取扱説明書に従い結線','試験項目ごとに値と条件を記録','出力停止・放電・撤去','短絡片・接地・配線を復旧照合'],checklist:['CT/VT種別と銘板','一次・二次の区別','CT二次短絡管理','VT逆励磁防止','接地・回路分離','試験値と条件','全配線・短絡片の復旧']},
    {id:'relay-voltage-frequency',title:'電圧・周波数継電器試験',category:'保護継電器',summary:'OVR・UVR・OFR・UFRなどへ所定の電圧・周波数を与え、動作値・復帰値・時間を確認する。',aliases:['OVR試験','UVR試験','OFR試験','UFR試験','周波数継電器'],instrumentModels:['FVT-600KD','CMC 356','CMC 430','CMC 500','RX47022','RX4744A'],distinction:'継電器補助電源、試験入力、VT回路、遮断器トリップ回路を別回路として扱う。',safety:'VT逆励磁、外部電源との突合せ、補助電源定格、トリップ回路、整定値と復旧を確認する。',stages:['保護要素・整定・系統状態を確認','試験回路と設備回路を分離','試験器の完全型式・出力を確認','取説と図面で結線照合','動作値・復帰値・時間を測定','出力停止・試験線撤去','整定・配線・遮断器状態を復旧'],checklist:['保護要素と整定','VT回路分離','補助電源','試験出力レンジ','トリップ回路','記録値','整定・配線復旧'],learning:'./protective-relay.html'}
  ];
  extraMethods.forEach(m=>{if(!methods.some(x=>x.id===m.id))methods.push(m);});
})();
