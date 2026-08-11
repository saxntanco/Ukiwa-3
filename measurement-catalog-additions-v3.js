/*
 * ぷかぷかうきわメモ 測定器具カタログ追加データ v3
 * 一次資料確認日: 2026-08-11
 *
 * ここではメーカー公式ページで存在・用途・販売状態を確認できた範囲だけを登録する。
 * 端子表、個別結線、付属コード枝番、社内管理値は、取扱説明書や実機で確認するまで
 * measuring-instruments.html 側の共通処理で「未確認」として表示する。
 */
(function () {
  const checked = '2026-08-11';
  const policies = {
    '絶縁抵抗': {
      safety: '絶縁抵抗測定は無電圧・放電・切離し範囲・試験電圧を確認し、電子機器やSPDへの影響を社内手順と取扱説明書で照合する。',
      mistakes: '測定電圧、対象設備、枝番ごとの付属リードを混同しない。高電圧出力中と測定後の残留電荷に注意する。'
    },
    '接地抵抗': {
      safety: '接地線を外す場合の設備保護への影響、地電圧、補助極配置、活線警告を確認する。',
      mistakes: '3極法、簡易2極法、クランプ法は測っている値の意味が異なる。表示値を同じ基準で扱わない。'
    },
    '漏れ電流': {
      safety: '活線作業条件、測定カテゴリ、周辺充電部との離隔、クランプ部の完全閉鎖を確認する。',
      mistakes: '零相電流測定の一括クランプと、負荷電流測定の単線クランプを混同しない。Ioだけで絶縁劣化を断定しない。'
    },
    '負荷電流': {
      safety: '活線作業条件、測定カテゴリ、導体径、周辺充電部との離隔を確認する。',
      mistakes: 'AC/DC、真の実効値／平均値、測定可能導体径、レンジを型式ごとに確認する。'
    },
    '電圧・導通': {
      safety: '最大入力、測定カテゴリ、端子、リード、レンジを確認し、抵抗・導通測定は必ず無電圧回路で行う。',
      mistakes: '電流端子への誤挿入、AC/DCレンジの誤り、導通ブザーを低抵抗の合否とみなす誤りに注意する。'
    },
    '相順確認': {
      safety: '対象電圧、測定カテゴリ、活線作業条件、クリップの装着状態と周辺充電部との離隔を確認する。',
      mistakes: '検相結果は接続した三相の順序判定であり、無電圧確認や設備側相名称まで保証しない。'
    },
    '低抵抗': {
      safety: '無電圧・放電を確認し、測定対象に外部電圧が残っていないこと、4端子プローブの接触状態を確認する。',
      mistakes: '2端子法と4端子法、リード抵抗、温度補正、測定電流を混同しない。'
    },
    'バッテリ': {
      safety: '端子短絡、逆極性、腐食、可燃性ガス、保護具、設備運用への影響を確認する。',
      mistakes: '一律の内部抵抗値で判定せず、電池形式・容量・温度・初期値・過去値をそろえて比較する。'
    },
    '電力・電源品質': {
      safety: '配線方式、測定カテゴリ、電圧コードと電流センサの方向、活線作業条件を確認する。',
      mistakes: '結線方式、電流センサ比、クランプ方向、相対応を誤ると電力・力率・ベクトルが成立しない。'
    },
    '継電器試験': {
      safety: '系統状態、CTT、補助電源、トリップ回路、遮断器状態、整定値と復旧方法を図面・操作票・取扱説明書で確認する。',
      mistakes: '一次値・二次値・試験器出力値、AC/DC補助電源、CT側・継電器側を混同しない。'
    },
    '耐圧・充電電流': {
      safety: '高電圧試験区域、接地、立入防止、非常停止、残留電荷放電、誤投入防止、復旧確認を操作票で管理する。',
      mistakes: '指定外の操作部・トランス・リアクトルを組み合わせない。容量、定格時間、一次・二次電流を混同しない。'
    }
  };

  function item({ maker, model, name, category, type = '測定器', status = 'current', priority,
    aliases = [], measures = [], summary, use, specs = {}, related = [], official }) {
    const policy = policies[category] || {};
    return {
      maker, model, name, category, type, status, priority, main: false,
      aliases, measures, summary, use, specs,
      compare: '用途・レンジ・測定方式・安全定格・付属品を、現場で使用する完全型式の公式資料と実機で比較する。',
      safety: policy.safety || '完全型式、定格、校正期限、付属コード、系統状態を取扱説明書と社内手順で確認する。',
      mistakes: policy.mistakes || '型式名だけで端子、定格、操作方法を流用しない。',
      related, official, catalogChecked: checked
    };
  }

  window.UKIWA_INSTRUMENT_ADDITIONS = [
    item({maker:'HIOKI',model:'IR4051-10',name:'5レンジ絶縁抵抗計',category:'絶縁抵抗',priority:40,aliases:['IR405110'],measures:['50/125/250/500/1000V','低抵抗','電圧'],summary:'低圧設備向け5レンジ絶縁抵抗計。-10は発注コードを含む完全型式として登録。',use:'低圧電路・機器の絶縁抵抗、低抵抗、電圧確認',specs:{'資料状態':'公式製品ページ確認済み','枝番差':'付属リード構成は公式ページで要確認'},related:['IR4051-11','IR4052-50'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/5-range/id_1267823'}),
    item({maker:'HIOKI',model:'IR4051-11',name:'5レンジ絶縁抵抗計',category:'絶縁抵抗',priority:41,aliases:['IR405111'],measures:['50/125/250/500/1000V','低抵抗','電圧'],summary:'低圧設備向け5レンジ絶縁抵抗計。-11はスイッチ付きリード構成として公式ページに掲載。',use:'低圧電路・機器の絶縁抵抗、低抵抗、電圧確認',specs:{'資料状態':'公式製品ページ確認済み','枝番差':'付属リードの完全型式は現物と公式資料で照合'},related:['IR4051-10','IR4052-51'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/5-range/id_1267823'}),
    item({maker:'HIOKI',model:'IR4052-50',name:'5レンジ絶縁抵抗計',category:'絶縁抵抗',priority:42,aliases:['IR405250'],measures:['50/125/250/500/1000V','低抵抗','電圧'],summary:'IR4052の現行系5レンジ絶縁抵抗計。枝番ごとの付属品差を分けて検索できる。',use:'低圧設備の絶縁抵抗と導通・電圧の確認',specs:{'資料状態':'公式製品ページ確認済み','枝番差':'付属品構成を要照合'},related:['IR4052-51','IR4052-52','IR4052-11'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/5-range/id_1267958'}),
    item({maker:'HIOKI',model:'IR4052-51',name:'5レンジ絶縁抵抗計',category:'絶縁抵抗',priority:43,aliases:['IR405251'],measures:['50/125/250/500/1000V','低抵抗','電圧'],summary:'IR4052の現行系5レンジ絶縁抵抗計。-51を独立した完全型式として登録。',use:'低圧設備の絶縁抵抗と導通・電圧の確認',specs:{'資料状態':'公式製品ページ確認済み','枝番差':'付属品構成を要照合'},related:['IR4052-50','IR4052-52','IR4052-11'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/5-range/id_1267958'}),
    item({maker:'HIOKI',model:'IR4052-52',name:'5レンジ絶縁抵抗計',category:'絶縁抵抗',priority:44,aliases:['IR405252'],measures:['50/125/250/500/1000V','低抵抗','電圧','無線対応構成'],summary:'IR4052の現行系5レンジ絶縁抵抗計。無線アダプタを含む構成は公式ページで確認する。',use:'低圧設備の絶縁抵抗と測定記録のデジタル管理',specs:{'資料状態':'公式製品ページ確認済み','枝番差':'無線アダプタ・付属品構成を要照合'},related:['IR4052-50','IR4052-51'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/5-range/id_1267958'}),
    item({maker:'HIOKI',model:'IR4055-11',name:'PV絶縁抵抗計',category:'絶縁抵抗',priority:45,aliases:['IR405511','PVメガー'],measures:['PV絶縁抵抗','5レンジ','低抵抗','電圧'],summary:'太陽光発電システムの測定に対応する5レンジ絶縁抵抗計。一般低圧メガーと用途を分けて登録。',use:'PVストリング・太陽光発電設備の絶縁抵抗確認',specs:{'資料状態':'公式製品ページ確認済み','用途区分':'PVシステム向け'},related:['IR4052-51'],official:'https://www.hioki.com/jp-ja/products/insulation-testers/pv-systems/id_1267920'}),
    item({maker:'共立電気計器',model:'KEW 3441',name:'アナログ絶縁抵抗計',category:'絶縁抵抗',priority:46,aliases:['KEW3441','3441'],measures:['絶縁抵抗','アナログ表示'],summary:'公式製品ページで確認できるアナログ表示の絶縁抵抗計。レンジと付属コードは完全型式資料で照合する。',use:'低圧電路・機器の絶縁抵抗確認',specs:{'資料状態':'公式製品ページ確認済み','表示方式':'アナログ'},related:['KEW 3551'],official:'https://www.kew-ltd.co.jp/products/detail/01071/'}),
    item({maker:'共立電気計器',model:'KEW 3551',name:'デジタル絶縁抵抗計',category:'絶縁抵抗',priority:47,aliases:['KEW3551','3551'],measures:['絶縁抵抗','低抵抗','電圧'],summary:'公式製品ページで確認できるデジタル絶縁抵抗計。測定電圧・枝番・付属リードを現物と照合する。',use:'低圧電路・機器の絶縁抵抗と電圧確認',specs:{'資料状態':'公式製品ページ確認済み','表示方式':'デジタル'},related:['KEW 3441','IR4052-51'],official:'https://www.kew-ltd.co.jp/products/detail/01110/'}),
    item({maker:'共立電気計器',model:'KEW 3128',name:'高圧絶縁抵抗計',category:'絶縁抵抗',priority:48,aliases:['KEW3128','3128'],measures:['高圧絶縁抵抗','診断'],summary:'高い試験電圧を用いる絶縁診断向け測定器。具体的な設定・端子・適用対象は公式取扱説明書で確認する。',use:'高圧機器・ケーブル等の絶縁抵抗と診断',specs:{'資料状態':'公式製品ページ確認済み','端子・設定':'取扱説明書で要確認'},related:['DI-11N','IR5050'],official:'https://www.kew-ltd.co.jp/products/detail/00256/'}),

    item({maker:'HIOKI',model:'FT6031-50',name:'接地抵抗計',category:'接地抵抗',priority:49,aliases:['FT603150'],measures:['3極法','簡易2極法','接地抵抗'],summary:'防じん防水性を備えた携帯形接地抵抗計。標準測定と簡易測定を区別して使う。',use:'接地極の接地抵抗測定',specs:{'資料状態':'メーカー公式シリーズページ確認済み','測定法':'3極法／簡易2極法（詳細は取説確認）'},related:['FT6041','ET-5'],official:'https://www.hioki.com/jp-ja/products/ground-testers/resistance-earth'}),
    item({maker:'HIOKI',model:'FT6041',name:'接地抵抗計',category:'接地抵抗',priority:50,aliases:['FT-6041'],measures:['4極法','3極法','2極法','クランプ併用','低抵抗'],summary:'4極・3極・2極の接地抵抗測定、クランプ併用、低抵抗測定に対応する多機能接地抵抗計。',use:'接地設備の標準測定、多重接地、土壌抵抗率、低抵抗確認',specs:{'資料状態':'公式製品ページ確認済み','測定方式':'4極／3極／2極、クランプ併用'},related:['FT6031-50','KEW 4202'],official:'https://www.hioki.com/jp-ja/products/ground-testers/resistance-earth/id_1266633'}),
    item({maker:'共立電気計器',model:'KEW 4105DL',name:'デジタル接地抵抗計',category:'接地抵抗',priority:51,aliases:['KEW4105DL','4105DL'],measures:['3極法','簡易2極法','接地抵抗'],summary:'公式製品ページで確認できるデジタル接地抵抗計。3極法と簡易2極法の値の意味を分けて扱う。',use:'接地極の3極法・簡易2極法測定',specs:{'資料状態':'公式製品ページ確認済み','測定法':'3極法／簡易2極法'},related:['ET-5','FT6031-50'],official:'https://www.kew-ltd.co.jp/products/detail/01036/'}),
    item({maker:'共立電気計器',model:'KEW 4202',name:'多重接地専用クランプメータ',category:'接地抵抗',priority:52,aliases:['KEW4202','4202'],measures:['多重接地','クランプ接地抵抗','AC電流'],summary:'多重・共用・構造体接地など閉ループが成立する接地系をクランプ測定する器具。単独接地極用ではない。',use:'多重接地系の接地抵抗と交流電流確認',specs:{'資料状態':'公式製品ページ確認済み','適用条件':'多重・共用・構造体接地など閉ループが成立する系統'},related:['FT6041','KEW 4105DL'],official:'https://www.kew-ltd.co.jp/products/detail/00261/'}),
    item({maker:'共立電気計器',model:'KEW 4106',name:'デジタル接地抵抗計',category:'接地抵抗',status:'legacy',priority:53,aliases:['KEW4106','4106'],measures:['4極法','3極法','土壌抵抗率'],summary:'メーカー公式ページで販売終了を確認した旧型接地抵抗計。後継・代替は公式情報で確認する。',use:'旧型器の識別、既存記録・現場保有器の参照',specs:{'販売状態':'販売終了品（メーカー公式表示）','後継':'公式ページの代替推奨を確認'},related:['FT6041','KEW 4105DL'],official:'https://www.kew-ltd.co.jp/products/detail/00650/'}),

    item({maker:'共立電気計器',model:'KEW 2413R',name:'リーククランプメータ',category:'漏れ電流',priority:54,aliases:['KEW2413R','2413R'],measures:['漏れ電流','負荷電流','大口径'],summary:'大口径クランプで漏れ電流から負荷電流まで測定する真の実効値方式のリーククランプ。',use:'太いケーブルや一括導体の漏れ電流・負荷電流測定',specs:{'資料状態':'公式製品ページ確認済み','方式':'真の実効値'},related:['MODEL 2433R','CM4002'],official:'https://www.kew-ltd.co.jp/products/detail/00201/'}),
    item({maker:'HIOKI',model:'CM4002',name:'ACリーククランプメータ',category:'漏れ電流',priority:55,aliases:['CM-4002'],measures:['漏れ電流','負荷電流','無線対応構成'],summary:'微小な交流漏れ電流から負荷電流まで測定し、間欠漏電の記録にも対応する現行系リーククランプ。',use:'活線漏れ電流の測定、漏電箇所の絞込み、記録',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','通信':'Z3210装着構成あり'},related:['CM4001','CM4003'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/leakage-current'}),
    item({maker:'HIOKI',model:'CM4003',name:'ACリーククランプメータ',category:'漏れ電流',priority:56,aliases:['CM-4003'],measures:['漏れ電流','負荷電流','外部出力','外部電源'],summary:'CM4002系の測定機能に加え、出力・外部電源機能を備えるリーククランプ。',use:'漏れ電流測定、長時間記録、外部記録器との連携',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','追加機能':'波形／RMS出力、外部電源'},related:['CM4002','3283'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/leakage-current'}),
    item({maker:'HIOKI',model:'3283',name:'クランプオンリークハイテスタ',category:'漏れ電流',status:'legacy',priority:57,aliases:['CM3283'],measures:['漏れ電流','外部モニタ出力'],summary:'メーカー公式ページで廃止を確認した旧型リーククランプ。現場保有器と過去記録の参照用。',use:'旧型器の識別、既存記録・外部出力構成の確認',specs:{'販売状態':'廃止（メーカー公式表示）','代替':'CM4003（公式ページ表示）'},related:['CM4003'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/leakage-current/id_5985'}),

    item({maker:'HIOKI',model:'CM4141-50',name:'ACクランプメータ',category:'負荷電流',priority:58,aliases:['CM414150'],measures:['AC電流','電圧','抵抗','周波数'],summary:'大電流の交流負荷電流とDMM機能を扱うクランプメータ。細いセンサ形状の現行枝番を登録。',use:'配電・動力回路の負荷電流、電圧、周波数確認',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','電流':'AC 60A～2000Aレンジ（公式カテゴリ表示）'},related:['CM3291','CM4373-50'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-clamp'}),
    item({maker:'HIOKI',model:'CM3291',name:'ACクランプメータ',category:'負荷電流',priority:59,aliases:['CM-3291'],measures:['AC電流','真の実効値','DMM機能'],summary:'交流負荷電流を真の実効値方式で測定するクランプメータ。',use:'低圧配電・動力回路の交流負荷電流確認',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','電流':'AC 42A～2000Aレンジ（公式カテゴリ表示）'},related:['CM4141-50','CM3289'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-clamp'}),
    item({maker:'HIOKI',model:'CM3289',name:'ACクランプメータ',category:'負荷電流',priority:60,aliases:['CM-3289'],measures:['AC電流','DMM機能'],summary:'狭い配線へクランプしやすい交流負荷電流用クランプメータ。',use:'低圧配線の交流負荷電流・電圧確認',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','電流':'42A～1000Aレンジ（公式カテゴリ表示）'},related:['CM3291','3280-10F'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-clamp'}),
    item({maker:'HIOKI',model:'3280-10F',name:'ACクランプメータ',category:'負荷電流',priority:61,aliases:['328010F'],measures:['AC電流','平均値整流','DMM機能'],summary:'小型・薄型の交流クランプメータ。真の実効値方式の機種と区別して登録。',use:'低圧配線の交流負荷電流・電圧確認',specs:{'資料状態':'メーカー公式カテゴリページ確認済み','方式':'平均値整流（MEAN）'},related:['CM3289','CM3291'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-clamp'}),
    item({maker:'HIOKI',model:'CM4371-50',name:'AC/DCクランプメータ',category:'負荷電流',priority:62,aliases:['CM437150'],measures:['AC/DC電流','電圧','突入電流'],summary:'交流・直流の電流測定とDMM機能を備えるクランプメータ。',use:'AC/DC負荷電流、電圧、突入電流の確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','電流':'AC/DC 20A／600Aレンジ（公式ページ表示）'},related:['CM4373-50','CM4375-50'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),
    item({maker:'HIOKI',model:'CM4373-50',name:'AC/DCクランプメータ',category:'負荷電流',priority:63,aliases:['CM437350'],measures:['AC/DC電流','大電流','突入電流'],summary:'交流・直流の大電流測定とDMM機能を備えるクランプメータ。',use:'配電・設備・直流回路の負荷電流と電圧確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','電流':'AC/DC 600A／2000Aレンジ（公式ページ表示）'},related:['CM4141-50','CM4375-50'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),
    item({maker:'HIOKI',model:'CM4375-50',name:'AC/DCクランプメータ',category:'負荷電流',priority:64,aliases:['CM437550'],measures:['AC/DC電流','薄型センサ','突入電流'],summary:'薄型センサで狭いケーブル間へ入りやすい交流・直流クランプメータ。',use:'狭い配線部のAC/DC負荷電流・電圧確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','電流':'AC/DC 1000Aレンジ（公式ページ表示）'},related:['CM4371-50','CM4373-50'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),

    item({maker:'HIOKI',model:'DT4261',name:'デジタルマルチメータ',category:'電圧・導通',priority:65,aliases:['DT-4261','DMM'],measures:['AC/DC電圧','電流','抵抗','導通'],summary:'現場の故障解析と記録支援に対応する汎用デジタルマルチメータ。',use:'低圧・制御回路の電圧、抵抗、導通、電流確認',specs:{'資料状態':'メーカー公式製品ページ確認済み','安全カテゴリ':'CAT III 1000V／CAT IV 600V（公式ページ表示）'},related:['DT4256','3246-60 / 3246-70'],official:'https://www.hioki.com/global/products/testers/dmm-3/id_108097'}),
    item({maker:'HIOKI',model:'DT4252',name:'デジタルマルチメータ',category:'電圧・導通',priority:66,aliases:['DT-4252'],measures:['AC/DC電圧','10A直接入力','抵抗','導通'],summary:'汎用測定と10A直接入力に対応するDT4250シリーズのデジタルマルチメータ。',use:'低圧・制御回路の電圧、抵抗、導通、電流確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','特徴':'10A直接入力、ローパスフィルタ（公式ページ表示）'},related:['DT4256','DT4261'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),
    item({maker:'HIOKI',model:'DT4253',name:'デジタルマルチメータ',category:'電圧・導通',priority:67,aliases:['DT-4253'],measures:['AC/DC電圧','微小DC電流','クランプ入力'],summary:'PV・設備管理・空調・計装用途を想定したDT4250シリーズのデジタルマルチメータ。',use:'低圧・計装回路の電圧、微小電流、抵抗、導通確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','特徴':'微小DC電流、ACクランプ入力（公式ページ表示）'},related:['DT4255','DT4261'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),
    item({maker:'HIOKI',model:'DT4255',name:'デジタルマルチメータ',category:'電圧・導通',priority:68,aliases:['DT-4255'],measures:['AC/DC電圧','抵抗','導通','クランプ入力'],summary:'電工現場向けに電圧入力部の保護を重視したDT4250シリーズのデジタルマルチメータ。',use:'低圧・制御回路の電圧、抵抗、導通確認',specs:{'資料状態':'メーカー公式対応製品ページ確認済み','特徴':'電圧入力部の限流抵抗／ヒューズ保護（公式ページ表示）'},related:['DT4256','DT4261'],official:'https://www.hioki.com/jp-ja/products/clamp-meters/ac-dc-clamp/id_1267113'}),
    item({maker:'HIOKI',model:'DT4256',name:'デジタルマルチメータ',category:'電圧・導通',priority:69,aliases:['DT-4256'],measures:['AC/DC電圧','10A直接入力','抵抗','導通'],summary:'多用途の現場保守に対応するDT4250シリーズの汎用デジタルマルチメータ。',use:'低圧・制御回路の電圧、抵抗、導通、電流確認',specs:{'資料状態':'メーカー公式製品ページ確認済み','安全カテゴリ':'CAT IV 600V／CAT III 1000V（公式ページ表示）'},related:['DT4252','DT4261'],official:'https://www.hioki.com/global/products/testers/dmm-3/id_5777'}),

    item({maker:'HIOKI',model:'PD3259-50',name:'電圧計付検相器',category:'相順確認',priority:70,aliases:['PD325950'],measures:['相順','線間電圧','周波数','非接触'],summary:'被覆電線へクリップし、三相の相順と線間電圧を同時に確認する電圧計付検相器。',use:'三相回路の正相・逆相、線間電圧、周波数確認',specs:{'資料状態':'公式製品ページ確認済み','方式':'金属非接触','対象':'三相回路（詳細条件は取説確認）'},related:['PD3259','PD3129-10','KEW 8035'],official:'https://www.hioki.com/jp-ja/products/ground-testers/phase/id_6811'}),
    item({maker:'HIOKI',model:'PD3259',name:'電圧計付検相器',category:'相順確認',status:'legacy',priority:71,aliases:['PD-3259'],measures:['相順','線間電圧','非接触'],summary:'メーカー公式ページで廃止を確認した旧型電圧計付検相器。',use:'旧型器の識別、現場保有器・過去記録の参照',specs:{'販売状態':'廃止（メーカー公式表示）','後継':'PD3259-50（メーカー公式表示）'},related:['PD3259-50'],official:'https://www.hioki.com/jp-ja/products/ground-testers/phase/id_6583'}),
    item({maker:'共立電気計器',model:'KEW 8035',name:'非接触検相器',category:'相順確認',priority:72,aliases:['KEW8035','8035'],measures:['相順','欠相','非接触'],summary:'被覆電線へクリップし、相順と欠相をLED・ブザーで確認する非接触検相器。',use:'三相回路の正相・逆相と欠相確認',specs:{'資料状態':'公式製品ページ確認済み','方式':'静電誘導による非接触検出'},related:['PD3129-10','PD3259-50'],official:'https://www.kew-ltd.co.jp/products/detail/00278/'}),

    item({maker:'HIOKI',model:'RM3548-50',name:'抵抗計',category:'低抵抗',priority:73,aliases:['RM354850','低抵抗計'],measures:['4端子法','低抵抗','温度補正'],summary:'µΩからMΩまでを扱う携帯形の高精度抵抗計。4端子法で微小な接続・巻線抵抗を測定する。',use:'接続部、ボンディング、モーター・変圧器巻線等の抵抗確認',specs:{'資料状態':'公式製品ページ確認済み','測定方式':'4端子法','範囲':'0.1µΩから3.5MΩ（公式ページ表示）'},related:['RM3548'],official:'https://www.hioki.com/jp-ja/products/resistance-meters/resistance/id_1267045'}),
    item({maker:'HIOKI',model:'RM3548',name:'抵抗計',category:'低抵抗',status:'legacy',priority:74,aliases:['RM-3548'],measures:['4端子法','低抵抗'],summary:'メーカー公式ページで廃止を確認した旧型ポータブル抵抗計。',use:'旧型器の識別、現場保有器・過去記録の参照',specs:{'販売状態':'廃止（メーカー公式表示）','後継':'RM3548-50（メーカー公式表示）'},related:['RM3548-50'],official:'https://www.hioki.com/jp-ja/products/resistance-meters/resistance/id_5827'}),
    item({maker:'HIOKI',model:'BT3554-50',name:'バッテリテスタ',category:'バッテリ',priority:75,aliases:['BT355450'],measures:['内部抵抗','端子電圧','劣化傾向'],summary:'据置用蓄電池の内部抵抗と端子電圧を測り、記録・比較を支援するBT3554現行系。',use:'UPS・非常用電源・制御用蓄電池の劣化傾向管理',specs:{'資料状態':'公式製品ページ確認済み','枝番':'-50系の付属プローブ構成は要確認'},related:['BT3554-11'],official:'https://www.hioki.com/jp-ja/products/resistance-meters/battery/id_6828'}),

    item({maker:'共立電気計器',model:'KEW 6315',name:'電源品質アナライザ',category:'電力・電源品質',priority:76,aliases:['KEW6315','6315','PQA'],measures:['電力','高調波','電源品質','波形','記録'],summary:'電圧3ch・電流4chで電力と電源品質を同時記録する電源品質アナライザ。',use:'電力使用状況、高調波、電源品質イベントの調査・記録',specs:{'資料状態':'公式製品ページ確認済み','規格':'IEC 61000-4-30 Class S（メーカー表示）','注意':'クランプセンサは測定目的に合わせて選定'},related:['KEW 2060BT','KEW 6310'],official:'https://www.kew-ltd.co.jp/products/detail/00222/'}),
    item({maker:'共立電気計器',model:'KEW 2060BT',name:'クランプパワーメータ',category:'電力・電源品質',priority:77,aliases:['KEW2060BT','2060BT'],measures:['電流','電圧','電力','高調波','検相'],summary:'電流・電圧・電力・高調波・検相を片手形クランプで確認するクランプパワーメータ。',use:'負荷電力、力率、高調波、相順の現場確認',specs:{'資料状態':'公式製品ページ確認済み','高調波':'1～30次（メーカー表示）'},related:['KEW 6315','CM3286-50'],official:'https://www.kew-ltd.co.jp/products/detail/01166/'}),
    item({maker:'共立電気計器',model:'KEW 6310',name:'電源品質アナライザ',category:'電力・電源品質',status:'legacy',priority:78,aliases:['KEW6310','6310'],measures:['電力','高調波','電源品質'],summary:'メーカー公式ページで販売終了を確認した旧型電源品質アナライザ。',use:'旧型器の識別、現場保有器・過去記録の参照',specs:{'販売状態':'販売終了品（メーカー公式表示）','代替推奨':'KEW 6315（メーカー公式表示）'},related:['KEW 6315'],official:'https://www.kew-ltd.co.jp/products/detail/00664/'}),
    item({maker:'HIOKI',model:'PW3360',name:'クランプオンパワーロガー',category:'電力・電源品質',priority:79,aliases:['PW-3360','電力ロガー'],measures:['電力','デマンド','電力量','長時間記録'],summary:'単相から三相4線までの電力・電力量をクランプセンサで記録する携帯形パワーロガー。',use:'電力使用量、デマンド、設備負荷の長時間記録',specs:{'資料状態':'メーカー公式製品ページ確認済み','注意':'本体枝番と電流センサ構成を要確認'},related:['KEW 6315'],official:'https://www.hioki.com/global/products/pqa/power-loggers/id_5822'}),

    item({maker:'ムサシインテック',model:'IP-R3000',name:'マルチリレーテスタ',category:'継電器試験',type:'試験器',priority:80,aliases:['IPR3000'],measures:['OCR','GR/DGR','OVR/UVR','OVGR','3kVA耐圧操作'],summary:'IP-Rシリーズの3kVA構成。継電器試験機能は共通でも、組み合わせる耐圧トランス容量を区別する。',use:'保護継電器試験、指定トランスを用いた3kVA耐圧試験操作',specs:{'資料状態':'公式製品ページ確認済み','耐圧容量':'3kVA','指定12kVトランス':'R-1230H'},related:['IP-R2000','IP-R5000','R-1230H'],official:'https://www.musashi-in.co.jp/item/2000/2000.html'}),
    item({maker:'ムサシインテック',model:'IP-R5000',name:'マルチリレーテスタ',category:'継電器試験',type:'試験器',priority:81,aliases:['IPR5000'],measures:['OCR','GR/DGR','OVR/UVR','OVGR','5kVA耐圧操作'],summary:'IP-Rシリーズの5kVA構成。耐圧試験では指定トランスと5kVAスライダックの条件を確認する。',use:'保護継電器試験、指定構成を用いた5kVA耐圧試験操作',specs:{'資料状態':'公式製品ページ確認済み','耐圧容量':'5kVA（指定スライダック使用時）','指定12kVトランス':'R-1250H'},related:['IP-R3000','R-1250H'],official:'https://www.musashi-in.co.jp/item/2000/2000.html'}),
    item({maker:'ムサシインテック',model:'RA-100',name:'電流ブースター',category:'継電器試験',type:'周辺機器',priority:82,aliases:['RA100'],measures:['OCR瞬時','100A出力補助'],summary:'対応する継電器試験器と組み合わせ、OCR瞬時試験の大電流出力を補助する専用ブースター。',use:'対応試験器のOCR瞬時要素試験で大電流出力が必要な場合',specs:{'資料状態':'公式製品ページ確認済み','出力':'AC 100A・1分（メーカー仕様）','組合せ':'対応機種を公式ページで確認'},related:['IP-R2000','IP-R3000','IP-R5000'],official:'https://www.musashi-in.co.jp/item/2104/2104.html'}),
    item({maker:'ムサシインテック',model:'DCU-25',name:'比率差動ユニット',category:'継電器試験',type:'周辺機器',priority:83,aliases:['DCU25'],measures:['DFR','比率差動','25A'],summary:'IP-R系などの対応試験器と組み合わせ、比率差動継電器試験を行う増設ユニット。',use:'特高設備の比率差動継電器等の試験',specs:{'資料状態':'公式製品ページ確認済み','出力':'AC 0～25A・30秒定格（メーカー仕様）','組合せ':'対応機種を公式ページで確認'},related:['IP-R2000','IP-R3000','IP-R5000'],official:'https://www.musashi-in.co.jp/item/2109/2109.html'}),

    item({maker:'ムサシインテック',model:'R-1230H',name:'耐電圧トランス 12kV・3kVA',category:'耐圧・充電電流',type:'周辺機器',priority:84,aliases:['R1230H'],measures:['交流耐圧','12kV','3kVA'],summary:'IP-R3000／IP-1230との指定組み合わせで使用する12kV・3kVA耐電圧トランス。',use:'3kVA構成の交流耐圧試験用高圧トランス',specs:{'出力電圧':'AC 0～12kV','容量':'3kVA','指定組合せ':'IP-R3000／IP-1230'},related:['IP-R3000','DR-1230MH'],official:'https://www.musashi-in.co.jp/item/3602/3602.html'}),
    item({maker:'ムサシインテック',model:'R-1250H',name:'耐電圧トランス 12kV・5kVA',category:'耐圧・充電電流',type:'周辺機器',priority:85,aliases:['R1250H'],measures:['交流耐圧','12kV','5kVA'],summary:'IP-R5000／IP-1250との指定組み合わせで使用する12kV・5kVA耐電圧トランス。',use:'5kVA構成の交流耐圧試験用高圧トランス',specs:{'出力電圧':'AC 0～12kV','容量':'5kVA','指定組合せ':'IP-R5000／IP-1250、指定スライダック条件あり'},related:['IP-R5000','DR-1250MH'],official:'https://www.musashi-in.co.jp/item/3602/3602.html'}),
    item({maker:'ムサシインテック',model:'DR-1230MH',name:'耐電圧リアクトル 3kVA',category:'耐圧・充電電流',type:'周辺機器',priority:86,aliases:['DR1230MH'],measures:['充電電流補償','3kVA'],summary:'3kVA耐圧システム向けの充電電流補償用リアクトル。指定組み合わせだけで使用する。',use:'容量性負荷の交流耐圧試験で耐圧トランス負担を補償',specs:{'資料状態':'メーカー公式シリーズページ確認済み','容量':'3kVA系','端子・組合せ':'取扱説明書で要確認'},related:['R-1230H','IP-R3000'],official:'https://www.musashi-in.co.jp/item/3700/3700.html'}),
    item({maker:'ムサシインテック',model:'R-2520K',name:'耐電圧トランス 25kV・2kVA',category:'耐圧・充電電流',type:'周辺機器',priority:87,aliases:['R2520K'],measures:['交流耐圧','25kV','2kVA'],summary:'IP-R2000／IP-1220との指定組み合わせで使用する25kV級・2kVA耐電圧トランス。',use:'25kV級の交流耐圧試験用高圧トランス',specs:{'出力電圧':'AC 0～24kV（メーカー仕様）','容量':'2kVA','指定組合せ':'IP-R2000／IP-1220'},related:['IP-R2000','R-1220K'],official:'https://www.musashi-in.co.jp/item/3602/3605.html'}),
    item({maker:'ムサシインテック',model:'R-2530K',name:'耐電圧トランス 25kV・3kVA',category:'耐圧・充電電流',type:'周辺機器',priority:88,aliases:['R2530K'],measures:['交流耐圧','25kV','3kVA'],summary:'IP-R3000／IP-1230との指定組み合わせで使用する25kV級・3kVA耐電圧トランス。',use:'25kV級の交流耐圧試験用高圧トランス',specs:{'出力電圧':'AC 0～24kV（メーカー仕様）','容量':'3kVA','指定組合せ':'IP-R3000／IP-1230'},related:['IP-R3000','R-1230H'],official:'https://www.musashi-in.co.jp/item/3602/3605.html'}),
    item({maker:'ムサシインテック',model:'R-2550K',name:'耐電圧トランス 25kV・5kVA',category:'耐圧・充電電流',type:'周辺機器',priority:89,aliases:['R2550K'],measures:['交流耐圧','25kV','5kVA'],summary:'IP-R5000／IP-1250との指定組み合わせで使用する25kV級・5kVA耐電圧トランス。',use:'25kV級の交流耐圧試験用高圧トランス',specs:{'出力電圧':'AC 0～24kV（メーカー仕様）','容量':'5kVA','指定組合せ':'IP-R5000／IP-1250、指定スライダック条件あり'},related:['IP-R5000','R-1250H'],official:'https://www.musashi-in.co.jp/item/3602/3605.html'})
  ];
  window.UKIWA_INSTRUMENT_CATALOG_META = {
    baseCount: 20,
    additionCount: window.UKIWA_INSTRUMENT_ADDITIONS.length,
    totalCount: 20 + window.UKIWA_INSTRUMENT_ADDITIONS.length,
    checked
  };

  const methods = window.UKIWA_MEASUREMENT_METHODS || [];
  const methodModels = {
    'insulation-high': ['KEW 3128'],
    'insulation-low': ['IR4051-10','IR4051-11','IR4052-50','IR4052-51','IR4052-52','IR4055-11','KEW 3441','KEW 3551'],
    'earth-3pole': ['FT6031-50','FT6041','KEW 4105DL','KEW 4106'],
    'earth-2pole': ['FT6031-50','FT6041','KEW 4105DL'],
    'relay-ocr': ['IP-R3000','IP-R5000','RA-100'],
    'relay-ground-voltage': ['IP-R3000','IP-R5000'],
    'withstand-ac': ['IP-R3000','IP-R5000','R-1230H','R-1250H','DR-1230MH','R-2520K','R-2530K','R-2550K'],
    'leakage-live': ['KEW 2413R','CM4002','CM4003','3283'],
    'phase-sequence': ['PD3259-50','PD3259','KEW 8035'],
    'voltage-continuity': ['DT4261','DT4252','DT4253','DT4255','DT4256'],
    'battery': ['BT3554-50']
  };
  Object.entries(methodModels).forEach(([id, models]) => {
    const method = methods.find(x => x.id === id);
    if (method) models.forEach(model => {
      if (!method.instrumentModels.includes(model)) method.instrumentModels.push(model);
    });
  });

  [
    {
      id:'load-current', title:'クランプによる負荷電流測定', category:'電流・電力',
      summary:'活線状態の導体をクランプし、負荷電流・突入電流などを測定する。',
      aliases:['負荷電流','クランプメータ','AC電流','DC電流'],
      instrumentModels:['CM4141-50','CM3291','CM3289','3280-10F','CM4371-50','CM4373-50','CM4375-50','KEW 2060BT'],
      distinction:'一線だけを挟む負荷電流測定と、複数導体を一括して残留電流を見る漏れ電流測定を区別する。',
      safety:'活線作業条件、測定カテゴリ、導体径、周辺充電部との離隔、クランプ部の閉鎖を確認する。',
      stages:['回路方式と測定目的を確認','器具のAC/DC・レンジ・カテゴリを確認','対象導体を一線だけ選ぶ','クランプを完全に閉じて測定','測定位置・運転状態・値を記録','安全に器具を撤去'],
      checklist:['回路方式','AC/DCとレンジ','測定カテゴリ','対象導体','クランプ部の閉鎖','運転状態と値の記録']
    },
    {
      id:'low-resistance', title:'導通・低抵抗・接続抵抗測定', category:'抵抗測定',
      summary:'4端子法などでリード・接触抵抗の影響を分離し、接続部や巻線の微小抵抗を確認する。',
      aliases:['低抵抗計','4端子法','接触抵抗','巻線抵抗','ボンディング'],
      instrumentModels:['RM3548-50','RM3548'],
      distinction:'テスタの導通ブザー、2端子抵抗測定、4端子低抵抗測定は分解能・測定電流・値の意味が異なる。',
      safety:'対象の無電圧・放電・切離しを確認し、外部電圧が測定端子へ入らない状態を確保する。',
      stages:['測定目的と管理方法を確認','無電圧・放電・切離しを確認','4端子プローブと設定を確認','電流端子・電圧端子を対象へ接触','温度・測定位置・値を記録','プローブ撤去・設備復旧'],
      checklist:['無電圧・放電','測定方式','プローブ接触位置','測定電流・レンジ','温度補正条件','測定値と位置の記録']
    },
    {
      id:'power-quality', title:'電力・高調波・電源品質測定', category:'電流・電力',
      summary:'配線方式に合う電圧・電流結線を行い、電力、高調波、電圧変動、イベントを記録する。',
      aliases:['電源品質','PQA','高調波','デマンド','電力ロガー'],
      instrumentModels:['KEW 6315','KEW 6310','PW3360','KEW 2060BT'],
      distinction:'瞬時確認、電力ロギング、規格に基づく電源品質解析では、必要な測定器・センサ・記録条件が異なる。',
      safety:'活線結線、測定カテゴリ、配線方式、電圧コード、電流センサの向き・相対応、脱落防止を確認する。',
      stages:['調査目的と配線方式を確認','本体・電圧コード・電流センサを選定','活線作業条件を確保','結線図どおりに相対応をそろえる','結線チェック・ベクトルを確認','記録条件を設定し測定','データ保存後に安全に撤去'],
      checklist:['配線方式','測定カテゴリ','電流センサ形名・比','相対応とクランプ方向','結線チェック','記録期間・同期時刻','全コード撤去']
    }
  ].forEach(method => {
    if (!methods.some(x => x.id === method.id)) methods.push(method);
  });
})();
