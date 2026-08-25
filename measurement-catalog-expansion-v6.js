/*
 * ぷかぷかうきわメモ 測定器具カタログ 設備診断・耐圧・記録計拡張 v6
 * 一次資料確認: 2026-08-25
 *
 * メーカー公式製品ページおよび公式取扱説明書一覧で確認できた範囲のみ登録する。
 * 端子番号、コード色、操作手順、判定値、社内管理値は推測しない。
 */
(function () {
  'use strict';

  const checked = '2026-08-25';
  const musashiManualHub = 'https://www.musashi-in.co.jp/dl-manual.html';
  const existing = window.UKIWA_INSTRUMENT_ADDITIONS || [];
  const previousMeta = window.UKIWA_INSTRUMENT_CATALOG_META || {};
  const countBefore = existing.length;

  function record(data) {
    return Object.assign({
      status: 'current',
      priority: 160,
      main: false,
      aliases: [],
      measures: [],
      specs: {
        '資料状態': 'メーカー公式資料で型式・用途を確認',
        '詳細仕様': '完全型式の最新取扱説明書で確認'
      },
      compare: '測定対象、方式、定格、測定カテゴリ、必要センサ・付属品を完全型式の公式資料で比較する。',
      safety: '対象設備、電圧階級、停電・活線条件、測定カテゴリ、接地、放電、誤投入防止、試験後の復旧を社内手順と最新取扱説明書で確認する。',
      mistakes: '似た型式やシリーズ名だけで定格・付属品・接続方法を判断しない。表示値の意味と試験条件を記録する。',
      related: [],
      catalogChecked: checked
    }, data);
  }

  const additions = [
    record({
      maker: 'ムサシインテック', model: 'IP-701G', name: '直流耐電圧試験器', category: '耐圧・充電電流', type: '試験器', priority: 38, main: true,
      aliases: ['IP701G', '直流耐圧', 'G接地'], measures: ['直流耐圧', 'DC -0.5～-37kV', 'G接地', '絶縁劣化診断'],
      summary: '高圧・特高ケーブルや電力用コンデンサ等の直流耐圧試験と、G接地方式によるケーブル絶縁劣化診断に対応する可搬形試験器。',
      use: '大静電容量設備の直流絶縁耐力試験、ケーブル絶縁劣化診断',
      specs: {'出力電圧':'DC -0.5～-37kV（負極性）','出力電流':'DC 0～200μA（短絡電流 DC 1mA）','使用電源':'内蔵充電池 / DC12～14V / AC90～240V','タイマ':'30秒～10分','寸法・質量':'345×240×260mm・約8kg'},
      compare: 'IP-1110はAC 11kV・1kVAの交流耐圧器。IP-701Gは負極性DC出力とG接地診断を扱うため、試験目的と判定根拠を混同しない。',
      mistakes: '直流耐圧、交流耐圧、絶縁抵抗測定は印加波形・目的・判定が異なる。G接地方式の成立条件も取扱説明書で確認する。',
      related: ['IP-020D','DI-11N','IP-1110'], official: 'https://www.musashi-in.co.jp/item/3802/3802.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'IP-020D', name: '直流耐電圧試験器', category: '耐圧・充電電流', type: '試験器', priority: 39,
      aliases: ['IP020D'], measures: ['直流耐圧'],
      summary: 'ムサシインテックの現行取扱説明書一覧に掲載されている直流耐電圧試験器。出力定格と適用対象は完全型式の最新取扱説明書で確認する。',
      use: 'メーカー指定対象の直流絶縁耐力試験',
      specs: {'公式取扱説明書掲載':'2023/05','出力・定格':'取扱説明書で確認'},
      related: ['IP-701G'], official: musashiManualHub, manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'IP-55R', name: '絶縁油耐電圧試験器（アナログ）', category: '遮断器・絶縁油', type: '試験器', priority: 40,
      aliases: ['IP55R', '絶縁油試験'], measures: ['絶縁油耐圧', 'アナログ'],
      summary: '遮断器・変圧器等の絶縁油を対象とするアナログ形耐電圧試験器。試料採取・電極条件・判定は適用規格と取扱説明書を優先する。',
      use: '絶縁油の絶縁破壊電圧確認',
      specs: {'方式':'アナログタイプ','公式取扱説明書掲載':'2019/11'},
      related: ['IP-55D'], official: musashiManualHub, manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'IP-55D', name: 'オート絶縁油耐電圧試験器', category: '遮断器・絶縁油', type: '試験器', priority: 41, main: true,
      aliases: ['IP55D', '絶縁油試験'], measures: ['絶縁油耐圧', 'AC 50kV', '自動試験'],
      summary: 'OCB・変圧器の絶縁油劣化診断向けデジタル試験器。5データ記録と平均値演算を備える。',
      use: '絶縁油の絶縁破壊電圧測定と複数回データ管理',
      specs: {'出力電圧':'AC 0～50kV（自動） / 0～25kV（手動）','定格容量':'500VA・30分','データ':'5データ記録、NO.2～5の平均値演算','使用電源':'AC100V ±10V 単相 50/60Hz','寸法・質量':'285×265×430mm・約34kg'},
      mistakes: '本体表示の平均値と、適用規格・社内基準が求める試験回数や統計処理を同一視しない。油採取、静置、電極間隔等の条件を記録する。',
      related: ['IP-55R'], official: 'https://www.musashi-in.co.jp/item/3811/3811.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'VCB-5S', name: 'VCB真空度テスタ', category: '遮断器・絶縁油', type: '試験器', priority: 42, main: true,
      aliases: ['VCB5S', '真空遮断器テスタ', '真空度試験'], measures: ['VCB真空度', 'AC 11/22kV', '漏れ電流判定'],
      summary: '真空遮断器・真空開閉器の真空度良否判定に用いる専用試験器。1 / 2 / 4.6mAの高速遮断回路とタイマを備える。',
      use: 'VCB・真空開閉器の真空バルブ状態確認',
      specs: {'出力電圧':'AC 0～11kV（U-N/V-N）・AC 0～22kV（U-V）','定格電流':'5mA・30分','遮断感度':'1 / 2 / 4.6mA','機能':'試験時間設定タイマ'},
      mistakes: '一般の交流耐圧試験器と同じ用途として扱わない。VCBの結線・開閉状態・相間試験条件は対象機器と試験器の取扱説明書で照合する。',
      related: ['IP-1110'], official: 'https://www.musashi-in.co.jp/item/3831/3831.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'IP-11005', name: '高圧検電器耐電圧試験器', category: '検電・活線確認', type: '試験器', priority: 43,
      aliases: ['IP11005', '検電器耐圧'], measures: ['高圧検電器', '耐電圧', '動作確認'],
      summary: '高圧検電器を収納部内で試験し、耐電圧と検出動作を確認する専用試験器。',
      use: '高圧検電器の使用前・定期試験',
      specs: {'最大試験電圧':'AC 11kV','漏れ電流遮断':'1 / 2 / 5mA','公式取扱説明書掲載':'2018/06'},
      related: ['HSS-6B1','HSN-6A1','HSF-7'], official: 'https://www.musashi-in.co.jp/item/3841/3841.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'IPK-25P', name: '絶縁用保護具耐電圧試験器', category: '耐圧・充電電流', type: '試験器', priority: 44,
      aliases: ['IPK25P', '保護具耐圧'], measures: ['絶縁用保護具', '耐電圧'],
      summary: '絶縁用保護具の耐電圧試験に用いる専用器。メーカーは専用水槽の使用を推奨している。',
      use: '絶縁手袋等の絶縁用保護具のメーカー指定試験',
      specs: {'公式取扱説明書掲載':'2013/09','推奨構成':'専用水槽（対象保護具と試験条件は取説確認）'},
      related: ['IP-11005'], official: musashiManualHub, manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'DI-28P', name: 'ハンディ絶縁抵抗計', category: '絶縁抵抗', type: '測定器', priority: 45,
      aliases: ['DI28P'], measures: ['DC 125V', 'DC 250V', 'AC電圧'],
      summary: '125V・250Vの絶縁抵抗測定と交流電圧確認に対応する小型ハンディメガー。標準コード長60cm。',
      use: '制御回路・低圧機器の絶縁抵抗と交流電圧確認',
      specs: {'絶縁抵抗':'125V / 20MΩ、250V / 50MΩ','交流電圧':'15～650V','標準コード長':'60cm'},
      related: ['DI-28PL','IR4052-11'], official: 'https://www.musashi-in.co.jp/item/1203/1203.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'DI-28PL', name: 'ハンディ絶縁抵抗計（ロングコード）', category: '絶縁抵抗', type: '測定器', priority: 46,
      aliases: ['DI28PL'], measures: ['DC 125V', 'DC 250V', 'AC電圧'],
      summary: 'DI-28Pと同じ測定機能を持ち、標準コード長を100cmとしたロングコード仕様。',
      use: '制御回路・低圧機器の絶縁抵抗と交流電圧確認',
      specs: {'絶縁抵抗':'125V / 20MΩ、250V / 50MΩ','交流電圧':'15～650V','標準コード長':'100cm'},
      mistakes: 'DI-28Pとの主な公開差分はコード長。型式末尾Lを見落とさず、保有コードの現物も照合する。',
      related: ['DI-28P','IR4052-11'], official: 'https://www.musashi-in.co.jp/item/1203/1203.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'MR-101', name: 'アナログ1ペンレコーダ', category: '記録・ロガー', type: '記録計', priority: 47,
      aliases: ['MR101', '1ペンレコーダ'], measures: ['絶縁診断記録', '電圧・電流記録', 'キック現象'],
      summary: 'DI-11N・IP-701G等の電圧・漏れ電流の時間変化をチャートへ記録するアナログ1ペンレコーダ。',
      use: '高圧絶縁診断の時間変化・キック現象の記録',
      specs: {'記録方式':'アナログ1ペン','記録速度':'12段階','電源':'ACまたは電池','組合せ':'DI-11N / IP-701G等（取説照合）'},
      mistakes: '記録計入力の種類・レンジ・極性を、試験器側出力と照合する。記録紙の時間軸・ゼロ位置・ペンスケールも記録条件に残す。',
      related: ['DI-11N','IP-701G'], official: 'https://www.musashi-in.co.jp/item/4306/4306.html', manual: musashiManualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'HSS-6B1', name: '伸縮形高低圧検電器', category: '検電・活線確認', type: '検電器', priority: 48,
      aliases: ['HSS6B1'], measures: ['AC検電', '80V～7kV', '伸縮形'],
      summary: '低圧から高圧までの交流電路を対象とする伸縮形検電器。',
      use: '交流80V～7kV電路の充電有無確認',
      specs: {'対象':'交流','検知電圧範囲':'AC 80V～7kV','構造':'伸縮形'},
      related: ['HSN-6A1','HSF-7','IP-11005'], official: 'https://www.musashi-in.co.jp/item/7216/7216.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'HSN-6A1', name: '交流・直流高低圧検電器', category: '検電・活線確認', type: '検電器', priority: 49,
      aliases: ['HSN6A1'], measures: ['AC検電', 'DC検電', '接地線式'],
      summary: '交流と接地式直流電路の低圧・高圧検電に対応する接地線付き検電器。',
      use: 'AC 100V～7kVおよび接地式DC 50V～7kVの充電有無確認',
      specs: {'交流':'AC 100V～7kV','直流':'DC 50V～7kV（接地線使用）','制約':'非接地式直流電路は検電不可'},
      mistakes: '直流対応でも非接地式直流電路は検電できない。接地条件、極性、対象電圧を取扱説明書で確認する。',
      related: ['HSS-6B1','HSF-7','IP-11005'], official: 'https://www.musashi-in.co.jp/item/7217/7217.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'HSF-7', name: '高低圧検電器', category: '検電・活線確認', type: '検電器', priority: 50,
      aliases: ['HSF7'], measures: ['AC検電', '80V～7kV'],
      summary: '交流80～7000Vの低圧・高圧電路に対応する検電器。',
      use: '交流低圧・高圧電路の充電有無確認',
      specs: {'対象':'交流','検知電圧範囲':'AC 80～7000V'},
      related: ['HSS-6B1','HSN-6A1','IP-11005'], official: 'https://www.musashi-in.co.jp/item/7212/7212.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'HT-700D / HT-700DL', name: '低圧交流・直流検電器', category: '検電・活線確認', type: '検電器', priority: 51,
      aliases: ['HT700D','HT700DL'], measures: ['AC検電', 'DC検電', '裸導体'],
      summary: '低圧の交流・接地式直流裸導体を対象とする検電器。D / DLの型式差は公式資料で照合する。',
      use: '低圧裸導体の交流・直流検電',
      specs: {'交流':'AC 50～600V','直流':'DC 12～750V','制約':'非接地式直流電路は検電不可'},
      related: ['HTE-610L'], official: 'https://www.musashi-in.co.jp/item/7201/7201.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'HTE-610L', name: '低圧交流検電器', category: '検電・活線確認', type: '検電器', priority: 52,
      aliases: ['HTE610L'], measures: ['AC検電', '被覆・裸導体', 'LEDライト'],
      summary: '被覆・裸導体の交流50～600Vに対応し、LEDライトを備える低圧検電器。',
      use: '低圧交流回路の充電有無確認',
      specs: {'対象':'交流・被覆/裸導体','検知電圧範囲':'AC 50～600V','補助機能':'LEDライト'},
      related: ['HT-700D / HT-700DL'], official: 'https://www.musashi-in.co.jp/item/7202/7202.html'
    }),
    record({
      maker: 'HIOKI', model: 'FT6380-50', name: 'クランプ接地抵抗計', category: '接地抵抗', type: '測定器', priority: 53, main: true,
      aliases: ['FT638050','FT6380'], measures: ['クランプ接地抵抗', '多重接地', 'AC電流'],
      summary: '多重接地系の接地抵抗を接地線へクランプして測定し、交流電流測定にも対応する接地抵抗計。',
      use: '多重接地された接地線のループ抵抗確認',
      specs: {'測定方式':'クランプ式・多重接地系','電流測定':'AC・真の実効値','通信':'Z3210セット品でワイヤレス転送'},
      mistakes: '単独接地極の3極法を置き換える器具ではない。クランプ法が成立する並列帰路の有無を確認する。',
      related: ['ET-5','FT6031-50','KEW 4202'], official: 'https://www.hioki.com/jp-ja/products/result.html'
    }),
    record({
      maker: 'HIOKI', model: 'CM3286-50', name: 'ACクランプパワーメータ', category: '電力・電源品質', type: '測定器', priority: 54,
      aliases: ['CM328650','CM3286'], measures: ['電力', '位相差', '相順', '簡易積算'],
      summary: 'クランプ電流と電圧入力から電力・位相差を確認する携帯形パワーメータ。単相および条件を満たす三相回路に対応する。',
      use: '負荷の電力・力率・位相・相順のスポット確認',
      specs: {'対象回路':'単相 / 三相（平衡・歪みなしの条件）','最小表示例':'電力5W、電流60mAから','機能':'簡易積算電力量・相順','通信':'Z3210セット品でワイヤレス転送'},
      mistakes: '三相測定の成立条件を確認せず、不平衡負荷や歪み波形へ簡易演算を適用しない。電圧結線とクランプ方向を記録する。',
      related: ['PW3360','PW3365-10','KEW 2060BT'], official: 'https://www.hioki.com/jp-ja/products/clamp-meters/clamp-power'
    }),
    record({
      maker: 'HIOKI', model: 'PQ3198', name: '電源品質アナライザ', category: '電力・電源品質', type: '測定器', priority: 55, main: true,
      aliases: ['PQ-3198'], measures: ['電源品質', '高調波', '過渡電圧', 'Class A'],
      summary: '電圧・電流・電力・高調波・イベント・過渡現象を同時監視する電源品質アナライザ。IEC 61000-4-30 Ed.3 Class A対応。',
      use: '受電点・負荷設備の電圧イベント、高調波、瞬停・過渡現象調査',
      specs: {'規格':'IEC 61000-4-30 Ed.3 Class A','結線':'単相2線～三相4線','周波数':'DC / 50 / 60 / 400Hz','過渡電圧':'最大6000V peak','電流':'センサ構成により最大AC 6000A'},
      mistakes: '電流センサの型式・レンジ・方向、電圧結線、結線方式、時刻同期を記録する。本体だけで測れる範囲とセンサ依存範囲を分ける。',
      related: ['PQ3100','PW3360','PW3365-10'], official: 'https://www.hioki.com/jp-ja/products/pqa/power-quality/id_6735'
    }),
    record({
      maker: 'HIOKI', model: 'PQ3100', name: '電源品質アナライザ', category: '電力・電源品質', type: '測定器', priority: 56,
      aliases: ['PQ-3100'], measures: ['電源品質', '高調波', 'イベント', 'Class S'],
      summary: '電圧・電流・電力・高調波・フリッカを同時記録し、電源トラブル調査を支援する電源品質アナライザ。',
      use: '電圧変動、高調波、瞬停、突入・イベントの記録調査',
      specs: {'規格区分':'IEC 61000-4-30 Class S','電流':'センサ構成により最大AC 6000A','主な機能':'イベント検出・クイックセット・高調波・フリッカ'},
      related: ['PQ3198','PW3360','PW3365-10'], official: 'https://www.hioki.com/jp-ja/products/pqa/power-quality/id_6619'
    }),
    record({
      maker: 'HIOKI', model: 'PW3365-10', name: '非接触電圧式クランプオンパワーロガー', category: '電力・電源品質', type: '測定器', priority: 57,
      aliases: ['PW336510','PW3365'], measures: ['電力ロギング', '非接触電圧', '高調波'],
      summary: '被覆電線の上から電圧を検出し、単相から三相4線までの電力を長期記録するパワーロガー。',
      use: 'キュービクル内の電力・電力量・高調波の長期記録',
      specs: {'結線':'単相2線3回路 / 単相3線・三相3線・三相4線1回路','電圧有効範囲':'90～520V','高調波':'基本波～13次','保存':'SDカード','注意':'本体のみでは電流・電力測定不可。目的に合う電流センサが必要'},
      mistakes: '本体だけでは電流・電力を測れない。結線方式により追加電圧センサが必要なため、購入構成と現物センサを照合する。',
      related: ['PW3360','PQ3198','CM3286-50'], official: 'https://www.hioki.com/jp-ja/products/pqa/power-loggers/id_5798'
    }),
    record({
      maker: 'HIOKI', model: 'CT6280', name: 'ACフレキシブルカレントセンサ', category: '負荷電流', type: 'センサ', priority: 58,
      aliases: ['CT-6280'], measures: ['AC大電流', 'フレキシブル', '4200A'],
      summary: '太い配線・ダブル配線・狭い隙間で大電流を測る、対応クランプメータ用フレキシブルセンサ。',
      use: 'CM3291/CM3289/3280-10F等と組み合わせた交流大電流測定',
      specs: {'最大入力':'AC 4200A連続（50/60Hz）','導体径':'φ130mm','安全定格':'CAT IV 300V / CAT III 600V','適用例':'CM3291 / CM3289 / 3280-10F'},
      mistakes: '漏れ電流等の微小電流測定には向かない。対応本体、変換比、レンジ、周波数を確認する。',
      related: ['CM3291','CM3289','3280-10F'], official: 'https://www.hioki.com/jp-ja/products/clamp-meters/ac-current-options/id_6769'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 3125B', name: '高圧絶縁抵抗計', category: '絶縁抵抗', type: '測定器', priority: 59, main: true,
      aliases: ['KEW3125B','3125B'], measures: ['DC 250V～5kV', '最大1TΩ', 'PI/DAR'],
      summary: '250V～5000Vの試験電圧、最大1TΩ、PI・DAR自動演算、G端子測定に対応する高圧絶縁抵抗計。',
      use: '高圧機器・ケーブル・回転機の絶縁抵抗と時間特性診断',
      specs: {'試験電圧':'DC 250 / 500 / 1000 / 2500 / 5000V','最大測定':'1TΩ','診断':'PI・DAR自動計算','電圧計':'AC 30～600V / DC ±30～±600V','安全定格':'CAT IV 300V / CAT III 600V'},
      mistakes: '試験電圧を設備定格だけで決めず、接続機器・ケーブル・社内基準を確認する。LINE・EARTH・GUARDの役割を混同しない。',
      related: ['DI-05N','IR5050','KEW 3128'], official: 'https://www.kew-ltd.co.jp/products/detail/01342/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 5050', name: 'Ior漏電監視ロガー', category: '漏れ電流', type: '測定器', priority: 60, main: true,
      aliases: ['KEW5050','5050'], measures: ['Ior', '漏れ電流', '4系統ロギング', '活線絶縁'],
      summary: '最大4系統のIo・Iorを同時記録し、活線状態で対地絶縁抵抗の演算にも対応する漏電監視ロガー。',
      use: '間欠漏電、複数回路のIor比較、活線絶縁劣化の長時間調査',
      specs: {'同時測定':'最大4系統','対応結線':'単相2線・単相3線・三相3線・三相4線（機能制約あり）','Ior記録間隔':'最短200ms','機能':'Io / Ior / 活線絶縁抵抗演算'},
      mistakes: '結線方式によりIor演算の可否が異なる。専用電圧センサ・クランプセンサの型式、方向、回路対応を記録する。',
      related: ['GCT-34','Rio-21','KEW 5020'], official: 'https://www.kew-ltd.co.jp/products/detail/01072/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 5020', name: '電流・電圧用データロガー', category: '記録・ロガー', type: '測定器', priority: 61,
      aliases: ['KEW5020','5020'], measures: ['漏れ電流', '負荷電流', '電圧', '3chロギング'],
      summary: '3チャンネルでリーク電流・負荷電流・電圧を記録し、電源品質の傾向把握にも使えるデータロガー。',
      use: '間欠漏電、負荷変動、電圧変動の長期記録',
      specs: {'入力':'3ch（対応センサ使用）','記録容量':'60,000件','機能':'ローパスフィルタ、ワンタイム/エンドレス、リコール','ソフト':'KEW LOG Soft 2'},
      mistakes: '本体の入力値は接続センサに依存する。センサ型式・変換比・レンジ・チャンネル対応を測定記録へ残す。',
      related: ['KEW 5010','KEW 5050'], official: 'https://www.kew-ltd.co.jp/products/detail/00203/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 5010', name: '電流用データロガー', category: '記録・ロガー', type: '測定器', status: 'legacy', priority: 62,
      aliases: ['KEW5010','5010'], measures: ['漏れ電流', '負荷電流', '3chロギング'],
      summary: '3チャンネルの電流記録に対応する旧型データロガー。メーカーはKEW 5020を代替推奨製品として案内している。',
      use: '既設保有器による漏れ電流・負荷電流の長期記録',
      specs: {'状態':'販売終了品','記録容量':'60,000件','後継・代替':'KEW 5020','ソフト':'KEW LOG Soft 2'},
      related: ['KEW 5020'], official: 'https://www.kew-ltd.co.jp/products/detail/00202/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 6514BT', name: 'マルチファンクションテスタ', category: '多機能設備試験', type: '測定器', priority: 63,
      aliases: ['KEW6514BT','6514BT'], measures: ['絶縁抵抗', '接地抵抗', 'RCD', '検相', 'SPD'],
      summary: '竣工検査・保守向けに、絶縁・接地・電圧・導通・漏電遮断器・検相・SPD等をまとめた多機能試験器。',
      use: '低圧設備・EV普通充電設備の複数試験を一台で実施する構成検討',
      specs: {'主な機能':'絶縁抵抗 / 接地抵抗 / 電圧・周波数 / 導通 / RCD / 検相 / SPD / 活線Eチェック','通信':'Bluetooth対応','EVSE':'KEW 8601との組合せで専用試験'},
      mistakes: '一台に複数機能があっても、各試験の停電・活線条件と端子・コードは別。選択ファンクションと接続状態を都度照合する。',
      related: ['ET-5','IR4052-11','KEW 8601'], official: 'https://www.kew-ltd.co.jp/products/detail/01351/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 2500', name: 'DCミリアンペアクランプメータ', category: '計装・微小電流', type: '測定器', priority: 64,
      aliases: ['KEW2500','2500'], measures: ['DC 4-20mA', '非接触', '0.01～120mA'],
      summary: '4–20mA計装ループを回路切断せず測定できる高感度DCクランプメータ。',
      use: 'プロセス計装・ビル計装の4–20mA信号確認',
      specs: {'測定範囲':'DC 0.01～120mA','分解能':'0.01mA','基本確度':'±0.2%','導体径':'φ6mm','表示':'4mA=0%、20mA=100%換算'},
      mistakes: '制御出力・入力のどちらを測るか、ループ電源、クランプ方向、ゼロ調整を確認する。一般の負荷電流クランプとレンジを混同しない。',
      related: ['KEW 2510'], official: 'https://www.kew-ltd.co.jp/products/detail/00178/'
    }),
    record({
      maker: '共立電気計器', model: 'KEW 2510', name: 'DCミリアンペアクランプロガー', category: '計装・微小電流', type: '測定器', priority: 65,
      aliases: ['KEW2510','2510'], measures: ['DC 4-20mA', 'ロギング', 'Bluetooth'],
      summary: '4–20mA計装ループを切断せず測定し、最大192,000件の記録とBluetooth転送に対応するDCクランプロガー。',
      use: '間欠的な計装信号異常・制御出力変動の長時間記録',
      specs: {'測定範囲':'DC 0.01～120mA','分解能':'0.01mA','記録容量':'192,000件','通信':'Bluetooth','外部出力':'アナログ出力'},
      related: ['KEW 2500'], official: 'https://www.kew-ltd.co.jp/products/detail/01006/'
    })
  ];

  const known = new Set(existing.map(item => item.model));
  const newlyAdded = [];
  additions.forEach(item => {
    if (!known.has(item.model)) {
      existing.push(item);
      newlyAdded.push(item);
      known.add(item.model);
    }
  });
  window.UKIWA_INSTRUMENT_ADDITIONS = existing;

  const methods = window.UKIWA_MEASUREMENT_METHODS || [];
  function attach(methodId, models) {
    const method = methods.find(item => item.id === methodId);
    if (!method) return;
    if (!Array.isArray(method.instrumentModels)) method.instrumentModels = [];
    models.forEach(model => {
      if (!method.instrumentModels.includes(model)) method.instrumentModels.push(model);
    });
  }
  function addMethod(method) {
    if (!methods.some(item => item.id === method.id)) methods.push(method);
  }

  attach('withstand-ac', ['IP-1110']);
  attach('insulation-high', ['KEW 3125B']);
  attach('insulation-low', ['DI-28P','DI-28PL','KEW 6514BT']);
  attach('earth-3pole', ['KEW 6514BT']);
  attach('earth-2pole', ['KEW 6514BT']);
  attach('leakage-live', ['KEW 5050','KEW 5020','KEW 5010']);
  attach('load-current', ['CT6280']);
  attach('power-quality', ['CM3286-50','PQ3198','PQ3100','PW3365-10']);

  addMethod({
    id: 'withstand-dc', title: '直流耐電圧・直流絶縁診断', category: '耐圧・充電電流',
    summary: 'メーカー指定の直流試験電圧を印加し、絶縁耐力または漏れ電流の時間変化を確認する。',
    aliases: ['直流耐圧','DC耐圧','G接地診断'], instrumentModels: ['IP-701G','IP-020D'],
    distinction: '交流耐圧・直流耐圧・絶縁抵抗測定では、波形、電圧、時間、評価対象が異なる。設備と規格に適用できる試験か先に確定する。',
    safety: '試験区域、停電、無電圧、接地、残留電荷、放電時間、誤投入防止、監視体制を操作票とメーカー取扱説明書で確認する。',
    stages: ['対象設備と試験根拠を確認','完全型式・出力定格・付属コードを照合','停電・無電圧・接地・放電条件を確認','メーカー指定結線を実設備図面と照合','指定条件で測定し時間変化を記録','出力停止後に放電・無電圧を確認','全コード・接地・切離し箇所を復旧'],
    checklist: ['試験根拠と適用可否','完全型式と校正期限','試験電圧・極性・時間','接地方式','残留電荷と放電','試験コード撤去','設備状態の復旧']
  });
  addMethod({
    id: 'insulating-oil', title: '絶縁油の絶縁破壊電圧試験', category: '遮断器・絶縁油',
    summary: '採取した絶縁油へ規定条件で電圧を加え、絶縁破壊電圧を測定・記録する。',
    aliases: ['絶縁油試験','油耐圧','OCB油試験'], instrumentModels: ['IP-55R','IP-55D'],
    distinction: '本体の出力仕様と、試料採取・静置・電極形状・電極間隔・試験回数・判定方法を分けて確認する。',
    safety: '高電圧部、試験カップ、油の取扱い、火気、清掃、放電を取扱説明書・適用規格・社内手順で管理する。',
    stages: ['対象油と適用規格を確認','試料採取・容器・電極条件を確認','器具・カップ・電極を点検','メーカー指定手順で測定','各回の値と条件を記録','放電・清掃・試料処理','器具を復旧し結果を基準と照合'],
    checklist: ['油の採取箇所・日時','温度・静置条件','電極・間隔・清浄度','試験回数','個別値と平均値','適用規格・社内基準','清掃・放電・復旧']
  });
  addMethod({
    id: 'vcb-vacuum', title: 'VCB真空バルブ状態試験', category: '遮断器・絶縁油',
    summary: '真空遮断器・真空開閉器へメーカー指定条件を与え、真空バルブの状態を確認する。',
    aliases: ['VCB真空度','真空遮断器試験','真空バルブ試験'], instrumentModels: ['VCB-5S'],
    distinction: '設備の一般交流耐圧試験と、VCB専用器による真空度良否判定を混同しない。',
    safety: 'VCBの開閉・引出位置、主回路無電圧、接地、制御電源、相間・対地の接続、放電を操作票と双方の取扱説明書で確認する。',
    stages: ['VCB完全型式とメーカー試験条件を確認','主回路・制御回路を安全状態へ','試験器定格と判定レンジを確認','指定接続を図面・実機で照合','指定条件で測定し結果を記録','出力停止・放電・無電圧確認','配線・VCB位置・制御回路を復旧'],
    checklist: ['VCB完全型式','開閉・引出位置','試験器レンジ','相間/対地の接続','漏れ電流判定条件','放電・無電圧','VCBと制御回路の復旧']
  });
  addMethod({
    id: 'voltage-detector-check', title: '検電器の使用前確認・定期試験', category: '検電・活線確認',
    summary: '対象電圧・AC/DC・接地方式に合う検電器を選び、使用前確認と定期試験の状態を確認する。',
    aliases: ['検電器試験','検電器チェック','高圧検電器耐圧'], instrumentModels: ['IP-11005','HSS-6B1','HSN-6A1','HSF-7','HT-700D / HT-700DL','HTE-610L'],
    distinction: '検電器の使用前動作確認、定期耐電圧試験、実設備での検電は別の確認。直流は接地方式による制約も確認する。',
    safety: '検電器の外観、電池、自己診断、対象電圧、AC/DC、接地方式、保護具、既知電源での前後確認を社内手順と取扱説明書で確認する。',
    stages: ['検電器完全型式と対象電路を確認','外観・電池・表示・有効期限を確認','メーカー指定の使用前確認を実施','設備側の検電条件を確認','社内手順に従い検電','使用後の動作確認と外観確認','清掃・保管・記録'],
    checklist: ['完全型式','AC/DC・電圧範囲','接地式/非接地式','外観・電池','使用前後の動作確認','定期試験期限','清掃・保管']
  });
  addMethod({
    id: 'protective-equipment-withstand', title: '絶縁用保護具の耐電圧試験', category: '耐圧・充電電流',
    summary: '絶縁用保護具を対象に、適用法令・規格・メーカー指定条件に従って耐電圧と外観を確認する。',
    aliases: ['保護具耐圧','絶縁手袋試験','活線防具試験'], instrumentModels: ['IPK-25P'],
    distinction: '保護具の種類・電圧区分・試験周期・電極/水槽条件で試験条件が変わる。一般設備の耐圧条件を流用しない。',
    safety: '高電圧試験区域、水槽、接地、漏れ電流、乾燥、損傷、試験後の識別管理を法令・社内手順・取扱説明書で確認する。',
    stages: ['保護具種別・電圧区分・試験根拠を確認','外観と識別番号を記録','試験器・水槽・電極条件を照合','指定条件で試験','結果と異常を記録','放電・乾燥・再外観確認','合否識別と保管状態を復旧'],
    checklist: ['保護具種別・識別番号','試験期限','外観・ピンホール','電極/水槽条件','試験条件の根拠','放電・乾燥','合否表示・保管']
  });
  addMethod({
    id: 'earth-clamp', title: 'クランプ式接地抵抗測定', category: '接地抵抗',
    summary: '多重接地系の接地線をクランプし、並列帰路を利用したループ抵抗を確認する。',
    aliases: ['クランプ接地','多重接地','FT6380'], instrumentModels: ['FT6380-50','KEW 4202'],
    distinction: '単独接地極を補助極で測る3極法とは原理が異なり、並列帰路がない接地系では成立しない。',
    safety: '対象接地線、並列帰路、クランプ部の閉鎖、周辺充電部、流れる電流、測定カテゴリを確認する。',
    stages: ['接地系統図と並列帰路を確認','器具・クランプ部・電池を点検','対象接地線と流れる電流を確認','クランプを確実に閉じて測定','測定位置・値・系統条件を記録','必要に応じ別位置と比較','器具を撤去し記録を整理'],
    checklist: ['多重接地系か','並列帰路','対象接地線','クランプ完全閉鎖','流れる電流','測定位置','3極法との区別']
  });
  addMethod({
    id: 'instrument-loop-dc', title: '4–20mA計装ループ電流測定', category: '計装・微小電流',
    summary: '計装ループを開放せずに微小直流電流を測定・記録し、指令値と実電流の対応を確認する。',
    aliases: ['4-20mA','ループ電流','DCミリアンペア'], instrumentModels: ['KEW 2500','KEW 2510'],
    distinction: 'プロセス値、指令百分率、実電流、ループ電源、入力・出力側を分けて記録する。',
    safety: '制御対象への影響、誤操作防止、クランプ方向、導体1本のみの測定、周辺回路への接触を確認する。',
    stages: ['ループ図と測定目的を確認','入力側・出力側・電源を識別','器具のゼロ・レンジ・方向を確認','対象導体1本をクランプ','電流・百分率・設備状態を記録','必要に応じ時間変化を記録','器具を撤去し制御状態を確認'],
    checklist: ['ループ図','信号方向','クランプ方向','ゼロ調整','4mA/20mAの意味','設備への影響','撤去後の制御状態']
  });
  addMethod({
    id: 'multifunction-installation', title: '低圧設備の多機能竣工・保守試験', category: '多機能設備試験',
    summary: '絶縁・接地・導通・電圧・RCD・検相等を、試験ごとに条件を切り替えて確認する。',
    aliases: ['マルチファンクションテスタ','竣工検査','EVSE試験'], instrumentModels: ['KEW 6514BT'],
    distinction: '一台の機器でも、停電試験・活線試験・電流注入試験では端子、コード、設備状態が異なる。',
    safety: '試験ファンクション、接続端子、停電/活線状態、RCD動作影響、EVSEアダプタ、試験後復旧を試験ごとに確認する。',
    stages: ['設備と必要試験を一覧化','完全型式・付属品・ファームを確認','試験ごとの停電/活線条件を整理','選択機能と接続を都度照合','各試験を個別に測定・記録','動作させた保護装置を復帰','全コード撤去・設備状態を復旧'],
    checklist: ['必要試験一覧','試験ファンクション','停電/活線条件','端子・コード','RCD/EVSEへの影響','測定値の区分','保護装置・設備の復旧']
  });

  const details = window.UKIWA_INSTRUMENT_DETAILS || {};
  details['IP-1110'] = Object.assign({}, details['IP-1110'] || {}, {
    priority: 0,
    main: true,
    manual: musashiManualHub,
    confidence: '完全型式の公式取扱説明書確認済み',
    checked,
    fieldThree: [
      'AC 0～11kV・1kVAの高圧変圧器と操作部を一体化した、小容量機器向け交流耐電圧試験器。',
      '最初に使用電源、被試験物の静電容量・充電電流、接地、試験区域、直結/リアクトル併用構成を確認。',
      '定格91mAを超える被試験物へ無条件に使えない。高圧出力、接地、リアクトル端子、入力電源を混同しない。'
    ],
    completion: {
      level: 3,
      verified: ['完全型式と公式製品仕様','公式取扱説明書 6104-001ST004','主要接続部の役割','直結/指定リアクトル併用構成','交流耐圧試験との相互リンク'],
      missing: ['ユーザー保有実機の銘板・製造番号','端子部と付属コードの現物写真','校正期限','実設備固有の試験条件・社内判定値']
    },
    terminals: [
      ['高圧出力端子', 'AC高圧出力', '被試験物の高圧側', '出力零・電源断・接地・放電を確認してから接続状態を変更'],
      ['E端子', '保護接地・高圧帰路', '取扱説明書指定の接地点', '接地を最初に接続し最後に外す原則と、設備側接地構成を社内手順で確認'],
      ['リアクトル L側', '指定リアクトル接続', 'リアクトルの指定端子', '直結構成とリアクトル併用構成を混在させない'],
      ['リアクトル E側', 'リアクトル帰路', '取扱説明書指定の接地側', '本体E端子・被試験物・リアクトルの関係を図面で照合'],
      ['電源入力部', '本体使用電源', 'AC100V電源', '入力電源と試験用高圧出力を混同しない']
    ],
    methodIds: ['withstand-ac'],
    principles: '内部の可変交流電源と高圧変圧器で0～11kVを発生する。容量性負荷では被試験物へ充電電流が流れるため、定格容量を超えないか事前に確認し、必要時はメーカー指定リアクトルで試験トランス負担を補償する。',
    sources: [
      ['IP-1110 公式製品ページ', 'https://www.musashi-in.co.jp/item/3805/3805.html', checked],
      ['IP-1110 取扱説明書 6104-001ST004', musashiManualHub, 'メーカー公式取扱説明書一覧・2021/01掲載を' + checked + '確認']
    ]
  });

  const methodIdsByModel = {};
  methods.forEach(method => (method.instrumentModels || []).forEach(model => {
    if (!methodIdsByModel[model]) methodIdsByModel[model] = [];
    if (!methodIdsByModel[model].includes(method.id)) methodIdsByModel[model].push(method.id);
  }));

  additions.forEach(item => {
    if (details[item.model]) return;
    const sourceRows = [];
    if (item.official) sourceRows.push(['メーカー公式資料', item.official, checked]);
    if (item.manual && item.manual !== item.official) sourceRows.push(['メーカー公式取扱説明書一覧', item.manual, checked]);
    details[item.model] = {
      confidence: 'メーカー公式資料で型式・用途確認済み',
      checked,
      fieldThree: [item.summary, '完全型式、定格、必要センサ・付属品、校正期限、対象設備との適合を確認。', item.mistakes],
      completion: {
        level: 2,
        verified: ['完全型式','メーカー公式用途','公開仕様','公式資料導線'],
        missing: ['実機写真・銘板照合','端子・コード現物照合','型式別の操作手順','社内管理値・現場判定値']
      },
      terminals: [],
      methodIds: methodIdsByModel[item.model] || [],
      principles: item.summary,
      sources: sourceRows
    };
  });
  window.UKIWA_INSTRUMENT_DETAILS = details;
  window.UKIWA_MEASUREMENT_METHODS = methods;

  const previousTotal = Number(previousMeta.totalCount) || (20 + countBefore);
  window.UKIWA_INSTRUMENT_CATALOG_META = Object.assign({}, previousMeta, {
    version: 'v6',
    checked,
    totalCount: previousTotal + newlyAdded.length,
    addedCount: existing.length,
    v6AddedCount: newlyAdded.length,
    sourcePolicy: 'メーカー公式製品ページ・公式取扱説明書一覧で型式・用途・公開仕様を確認。取扱説明書PDFは転載せず公式導線を表示し、端子番号・コード色・操作・判定値・社内管理値は推測しない。'
  });
})();
