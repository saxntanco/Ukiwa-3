/*
 * ぷかぷかうきわメモ 測定器具カタログ 現場試験器拡張 v5
 * 一次資料確認: 2026-08-13
 *
 * 型式・用途・公開仕様をメーカー公式ページで確認できた範囲だけを登録する。
 * 端子、コード色、試験操作、判定値は完全型式の取扱説明書と実機を優先する。
 */
(function () {
  const checked = '2026-08-13';
  const manualHub = 'https://www.musashi-in.co.jp/dl-manual.html';
  const existing = window.UKIWA_INSTRUMENT_ADDITIONS || [];

  function record(data) {
    return Object.assign({
      status: 'current',
      priority: 140,
      main: false,
      aliases: [],
      measures: [],
      specs: { '資料状態': 'メーカー公式資料確認済み', '端子・操作': '完全型式の取扱説明書と実機で要確認' },
      compare: '対象要素、出力相数、最大出力、補助電源、接点入力、付属コードを完全型式の公式資料で比較する。',
      safety: '試験対象回路、CT・VT回路、補助電源、トリップ回路、試験器出力零、試験後の原状復帰を操作票と社内手順で確認する。',
      mistakes: '試験器の入力電源、試験出力、補助電源、接点入力を混同しない。コード色だけで接続先を判断しない。',
      related: [],
      catalogChecked: checked
    }, data);
  }

  const additions = [
    record({
      maker: 'ムサシインテック', model: 'WPS-22', name: '2E・3Eリレーテスタ', category: '継電器試験', type: '試験器', priority: 18, main: true,
      aliases: ['WPS22', '2E3Eテスタ', '2Eリレー試験', '3Eリレー試験', 'モータ保護リレー試験'],
      measures: ['2E', '3E', '過負荷', '欠相', '反相'],
      summary: '単相AC100Vから三相電流・三相電圧を出力し、モータ保護用2E・3Eリレーの負荷、欠相、反相を試験する専用器。',
      use: '電子式モータ保護リレーの過負荷・欠相・反相・不平衡率・動作時間試験',
      specs: {
        '使用電源': 'AC100V 単相 50/60Hz',
        '三相電流出力': 'AC 0～5/35A max、R・S・T各相単独／バランス設定',
        '三相電圧出力': 'AC 110/220/440V、10VA、定格の40～110%可変',
        '時間計': '0.00～999.99秒',
        '不平衡率': '0～100%',
        '寸法・質量': '420(W)×230(D)×320(H)mm、約21kg以下',
        '取扱説明書': 'メーカー公式ダウンロード一覧に掲載'
      },
      compare: 'RX47022も欠相・反相を含む多要素試験に対応するが、WPS-22は2E・3Eの三相電流・三相電圧試験へ特化する。',
      safety: 'モータ停止、無電圧、誤始動防止、主回路と制御回路の分離、保護接点と電磁接触器回路、試験後の相順・整定・復帰状態を確認する。',
      mistakes: '2E・3Eの区分、主回路貫通方向、外部CT、反相検出方式、手動／自動復帰はリレーごとに異なる。三相電源入力が必要な器具と混同しない。',
      related: ['RX47022', 'MDAC-5A', 'MVF-1'],
      official: 'https://www.musashi-in.co.jp/item/2305/2305.html',
      learning: './protective-relay.html?q=3E'
    }),
    record({
      maker: 'ムサシインテック', model: 'MVF-1', name: '電圧・周波数リレーテスタ', category: '継電器試験', type: '試験器', priority: 19,
      aliases: ['MVF1', '電圧周波数試験器'], measures: ['OVR/UVR', 'OFR/UFR', 'OVGR', '三相電圧'],
      summary: '単相AC100Vから単相2線・単相3線・三相3線の電圧と可変周波数を出力するリレーテスタ。',
      use: '過不足電圧、過不足周波数、地絡過電圧継電器の試験',
      specs: { '使用電源': 'AC100V 単相 50/60Hz', '電圧出力': 'AC 0～300V、各相25VA', '出力形態': '単相2線／単相3線／三相3線', '周波数': '40.00～70.00Hz', '補助電源': 'AC100V、DC24/48/110V' },
      related: ['WPS-22', 'FVT-600KD', 'RX47022'], official: 'https://www.musashi-in.co.jp/item/2310/2310.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'MDAC-5A', name: '三相交流発生器', category: '試験用電源', type: '試験器', priority: 20,
      aliases: ['MDAC5A', '三相信号発生器'], measures: ['三相電圧', '三相電流', '位相', '周波数'],
      summary: '単相100/200V電源から平衡三相の電圧・電流を発生し、位相と周波数も独立設定できる試験用電源。',
      use: '受電盤、電力変換器、保護・計測機器の三相信号入力試験',
      specs: { '使用電源': 'AC100/200V 単相2線', '三相電圧': 'AC 0～220V、200VA', '三相電流': 'AC 0～20A、40VA', '周波数': '40.00～69.99Hz', 'V-I位相': 'LAG180°～LEAD180°' },
      related: ['WPS-22', 'RX47022', 'RX4713', 'RX4718'], official: 'https://www.musashi-in.co.jp/item/6605/6605.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'IP-R1500', name: 'マルチリレーテスタ', category: '継電器試験', type: '試験器', priority: 21,
      aliases: ['IPR1500'], measures: ['OCR', 'GR/DGR', 'OVR/UVR', 'OVGR', 'DFR'],
      summary: 'OCR・GR・電圧要素・簡易DGR・比率差動に対応し、指定トランスとの組合せで1.5kVA耐圧試験にも使える小型マルチ試験器。',
      use: '高圧受電設備の保護継電器試験と小容量耐圧システム',
      related: ['IP-R2000', 'ORT-50MP', 'R-1115K', 'RA-100', 'DCU-25'], official: 'https://www.musashi-in.co.jp/item/2001/2001.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'ORT-50MP', name: 'OCR・GCRリレーテスタ', category: '継電器試験', type: '試験器', priority: 22,
      aliases: ['ORT50MP'], measures: ['OCR', 'GR', 'DFR', '耐圧'],
      summary: '50AまでのOCR・GR試験を一体形で行い、オプションで100A試験・比率差動・1.5kVA耐圧へ拡張できる試験器。',
      use: 'OCR・GRの動作電流・時間・CB連動と、指定構成での耐圧試験',
      related: ['ORT-50S', 'ORT-50SV', 'IP-R1500', 'RA-100', 'R-1115K'], official: 'https://www.musashi-in.co.jp/item/2013/2013.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'ORT-50SV', name: 'マルチリレーテスタ', category: '継電器試験', type: '試験器', priority: 23,
      aliases: ['ORT50SV'], measures: ['OCR', 'GR', 'OVR/UVR', 'OVGR', 'DGR反転'],
      summary: '小型発電機でのOCR試験と電流引外し式CB連動を考慮し、電圧要素とDGR反転試験も備えた試験器。',
      use: 'OCR・GR・電圧継電器・DGR簡易試験と遮断器連動',
      specs: { '使用電源': 'AC100V 単相', '電流出力': 'AC 0～50A', '電圧出力': 'AC 10～1100V', '注意': 'RA-100との組合せ不可' },
      related: ['ORT-50S', 'ORT-50MP', 'IP-R1500'], official: 'https://www.musashi-in.co.jp/item/2012/2012.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'ORT-50S', name: 'OCR・GCRリレーテスタ', category: '継電器試験', type: '試験器', priority: 24,
      aliases: ['ORT50S'], measures: ['OCR', 'GR', '動作時間'],
      summary: 'OCR・GRの基本試験と動作時間測定を行う一体形リレーテスタ。',
      use: '過電流・地絡過電流継電器の単体試験と連動確認',
      related: ['ORT-50MP', 'ORT-50SV'], official: manualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'OGC-1V', name: '簡易リレーテスタ', category: '継電器試験', type: '試験器', priority: 25,
      aliases: ['OGC1V'], measures: ['OCR', 'GR', 'DGR', '動作確認'],
      summary: '停電制約のある現場でOCR・GR・DGRの簡易動作確認とCB連動確認を行う小型器。動作値・動作時間の本試験用ではない。',
      use: '年次点検等での簡易リレー動作チェック',
      mistakes: '動作確認用であり、動作値・動作時間試験器として扱わない。適用リレーと接続は取扱説明書で確認する。',
      related: ['ORT-50S', 'GCR-mini'], official: 'https://www.musashi-in.co.jp/item/2006/2006.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'RDF-2A', name: 'GR・DGRリレーテスタ', category: '継電器試験', type: '試験器', priority: 26,
      aliases: ['RDF2A'], measures: ['GR', 'DGR', '位相'], summary: 'GR・DGR試験向けのアナログ操作形リレーテスタ。',
      use: 'SOG制御装置、GR・DGRの動作値・位相・時間試験', related: ['RDF-5A', 'GCR-mini'], official: manualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'RDF-5A', name: 'GR・DGRリレーテスタ', category: '継電器試験', type: '試験器', priority: 27,
      aliases: ['RDF5A'], measures: ['GR', 'DGR', '最大5A'], summary: '5A級出力を備えるGR・DGR試験向けアナログ操作形リレーテスタ。',
      use: 'SOG制御装置、GR・DGRの動作値・位相・時間試験', related: ['RDF-2A', 'GCR-miniVS'], official: manualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'GCR-8', name: 'GR・DGRオートリレーテスタ', category: '継電器試験', type: '試験器', priority: 28,
      aliases: ['GCR8'], measures: ['GR', 'DGR', '自動試験'], summary: 'GR・DGRの試験を対象とするオートリレーテスタ。',
      use: '地絡・地絡方向継電器の自動化された試験', related: ['GCR-mini', 'RDF-2A'], official: manualHub
    }),
    record({
      maker: 'ムサシインテック', model: 'G・TRIP', name: 'リレー試験専用衝撃検出センサ', category: '継電器試験', type: '補助器具', priority: 29,
      aliases: ['GTRIP', 'G･TRIP', 'G-TRIP'], measures: ['CB連動', '衝撃検出', 'a接点'],
      summary: 'CB連動動作時の盤面の衝撃を検出し、A接点信号としてリレーテスタへ伝える補助センサ。',
      use: '遮断器端子へ直接接続しないCB連動時間検出',
      specs: { '接点出力時間': '200ms以下', '入力許容電圧': 'AC/DC 200V以内', '電源': 'CR2032（表示のみ）', '注意': 'リレー単体動作は検知不可' },
      related: ['IP-R1500', 'IP-R2000', 'ORT-50MP'], official: 'https://www.musashi-in.co.jp/item/2700/2700.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'R-1115K', name: '耐電圧トランス 11kV・1.5kVA', category: '耐圧・充電電流', type: '周辺機器', priority: 30,
      aliases: ['R1115K'], measures: ['AC 11kV', '1.5kVA'],
      summary: 'IP-R1500またはORT-50MPと指定構成で組み合わせる乾式1.5kVA耐電圧トランス。',
      use: '小容量高圧機器・ケーブルの交流耐圧試験',
      specs: { '入力': 'AC 0～110V', '出力': 'AC 0～11000V', '変圧比': '1:100', '容量': '1.5kVA、136mA、10分定格' },
      related: ['IP-R1500', 'ORT-50MP', 'DR-1115MH'], official: 'https://www.musashi-in.co.jp/item/3600/3600.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'DR-1115MH', name: '耐電圧リアクトル 1.5kVA系', category: '耐圧・充電電流', type: '周辺機器', priority: 31,
      aliases: ['DR1115MH'], measures: ['リアクトル補償', '交流耐圧'],
      summary: 'R-1115Kを用いる交流耐圧試験で、被試験物の容量性電流を補償する高圧リアクトル。',
      use: 'IP-R1500・ORT-50MP系耐圧試験の容量補償',
      related: ['R-1115K', 'DR-1220MH', 'CC-50MN'], official: manualHub
    }),
    record({
      maker: 'エヌエフ回路設計ブロック', model: 'RX4713', name: '電流三相保護リレー試験器', category: '継電器試験', type: '試験器', priority: 32,
      aliases: ['RX-4713', 'I3', '電流3相'], measures: ['電流三相', '位相', '周波数'],
      summary: '電流三相出力で三相電流要素を持つ保護リレーを試験する専用器。',
      use: '三相過電流、差動、電流不平衡等の保護リレー試験', related: ['RX47022', 'RX4718', 'RX4744A'], official: 'https://www.nfcorp.co.jp/pro/p-test/rx/rx4713/'
    }),
    record({
      maker: 'エヌエフ回路設計ブロック', model: 'RX4718', name: '電圧三相保護リレー試験器', category: '継電器試験', type: '試験器', priority: 33,
      aliases: ['RX-4718', 'V3', '電圧3相'], measures: ['電圧三相', '位相', '周波数'],
      summary: '電圧三相出力で三相電圧要素を持つ保護リレーを試験する専用器。',
      use: '三相過不足電圧、周波数、電圧不平衡等の保護リレー試験', related: ['RX47022', 'RX4713', 'RX4744A'], official: 'https://www.nfcorp.co.jp/pro/p-test/rx/rx4718/'
    }),
    record({
      maker: 'ムサシインテック', model: 'GCT-34', name: '活線絶縁抵抗計', category: '漏れ電流', type: '測定器', priority: 34,
      aliases: ['GCT34'], measures: ['活線絶縁', 'Io', 'Ior', '絶縁抵抗演算'], summary: 'Ioから容量性・高調波成分を分離し、Iorと活線絶縁抵抗の調査に用いるクランプ方式測定器。',
      use: '単相2線・3線、三相3線・4線の活線絶縁管理と間欠漏電調査',
      specs: { '対象電路': '単相2線／単相3線／三相3線／三相4線', '電圧入力': 'AC 85～260V', '零相電流入力': 'AC 0～2200mA', '主な演算': 'Io／Ior／活線絶縁抵抗' },
      related: ['Rio-21', 'MODEL 2433R'], official: 'https://www.musashi-in.co.jp/item/1312/1312.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'Rio-21', name: 'リークマスタ', category: '漏れ電流', type: '測定器', priority: 35,
      aliases: ['RIO21', 'Rio21'], measures: ['Io', 'Ior', '漏れ電流', '絶縁抵抗演算'], summary: '活線状態で電圧、合成漏れ電流、対地抵抗成分電流、対地絶縁抵抗の演算値を確認するIor測定器。',
      use: '単相2線・3線、三相3線設備の漏電・絶縁劣化の切り分け', related: ['GCT-34', 'MODEL 2433R'], official: 'https://www.musashi-in.co.jp/item/1313/1313.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'MMC-2', name: '多機能校正チェッカ', category: '標準・校正', type: '校正器', priority: 36,
      aliases: ['MMC2'], measures: ['校正確認', '絶縁抵抗計', '接地抵抗計', '検相器', 'クランプ'], summary: '検電器、回路計、クランプ、絶縁抵抗計、接地抵抗計、検相器の使用前・定期チェックに対応する校正器。',
      use: '現場常用測定器の使用前点検・定期管理・組込み校正',
      specs: { '交流電圧': '単相／三相 AC 0～330V', '交流電流': '0.1mA～100A（レンジ・線輪使用）', '低抵抗': '0／10／100／500／1000Ω', '高抵抗': '0.1MΩ～2000MΩ' },
      related: ['ET-5', 'IR4052-11', 'MODEL 2433R'], official: 'https://www.musashi-in.co.jp/item/6508/6508.html'
    }),
    record({
      maker: 'ムサシインテック', model: 'PF-33', name: '位相・周波数計', category: '標準・校正', type: '測定器', priority: 37,
      aliases: ['PF33'], measures: ['位相', '周波数', '校正標準'], summary: '交流電圧・電流信号の位相差と周波数を高分解能で測る校正・現場測定用の標準器。',
      use: 'リレーテスタや信号発生器の位相・周波数確認',
      specs: { '位相': '0.0～359.9°、分解能0.1°', '周波数': '40.00～70.00Hz、分解能0.01Hz', '入力': '電圧0.1～450V／電流1mA～15A' },
      related: ['MDAC-5A', 'RX47022'], official: 'https://www.musashi-in.co.jp/item/2308/2308.html'
    })
  ];

  const known = new Set(existing.map(item => item.model));
  additions.forEach(item => { if (!known.has(item.model)) existing.push(item); });

  const rx47022 = existing.find(item => item.model === 'RX47022');
  if (rx47022) {
    Object.assign(rx47022, {
      name: '電圧2相・電流2相 保護リレー試験器',
      priority: 17,
      main: true,
      aliases: Array.from(new Set([...(rx47022.aliases || []), 'I2V2', 'I2 V2', 'V2I2', 'V2 I2', '電圧2相電流2相', '2V2I'])),
      measures: ['電圧2相', '電流2相', 'I2V2', '位相・周波数', '微小電流'],
      summary: '電圧2相・電流2相を一筐体から出力し、高圧受電設備やコージェネ設備の多様な保護リレー試験へ対応する試験器。現場呼称「I2V2」でも検索できる。',
      use: 'OCR・DGR・OVGR・RPR・OVR/UVR・周波数・比率差動・欠相反相等の試験',
      specs: {
        '出力構成': '電圧2相／電流2相',
        '電圧': '1相あたり最大300V、単相最大600V',
        '電流': '1相あたり最大31A、構成により最大62A',
        '微小電流': '20mAレンジ、分解能0.001mA',
        '記録': '本体メモリ／USBメモリ',
        '寸法・質量': '400(W)×250(D)×350(H)mm、16kg'
      },
      compare: 'WPS-22は2E・3E専用の三相出力器。RX47022は電圧2相・電流2相を組み合わせ、多種類の保護要素とV結線三相出力を扱う。',
      mistakes: 'I2V2は検索用の現場呼称で、メーカー正式型式はRX47022。2相出力と三相独立出力を同一視せず、V結線・直列接続・最大出力条件を取扱説明書で確認する。',
      related: Array.from(new Set([...(rx47022.related || []), 'WPS-22', 'RX4713', 'RX4718', 'RX4744A'])),
      official: 'https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html',
      catalogChecked: checked
    });
  }

  window.UKIWA_INSTRUMENT_ADDITIONS = existing;

  const methods = window.UKIWA_MEASUREMENT_METHODS || [];
  function attach(methodId, models) {
    const method = methods.find(item => item.id === methodId);
    if (!method) return;
    models.forEach(model => { if (!method.instrumentModels.includes(model)) method.instrumentModels.push(model); });
  }
  attach('relay-ocr', ['IP-R1500', 'ORT-50MP', 'ORT-50SV', 'ORT-50S', 'OGC-1V', 'RX47022']);
  attach('relay-ground-voltage', ['MVF-1', 'IP-R1500', 'ORT-50SV', 'RDF-2A', 'RDF-5A', 'GCR-8', 'RX47022']);
  attach('relay-rpr', ['RX47022']);
  attach('relay-voltage-frequency', ['MVF-1', 'RX47022', 'RX4718']);
  attach('withstand-ac', ['IP-R1500', 'ORT-50MP', 'R-1115K', 'DR-1115MH']);
  attach('leakage-live', ['GCT-34', 'Rio-21']);

  if (!methods.some(item => item.id === 'relay-motor-2e3e')) {
    methods.push({
      id: 'relay-motor-2e3e',
      title: '2E・3Eモータ保護リレー試験',
      category: '保護継電器',
      summary: '三相電流・電圧条件を与え、過負荷・欠相・反相・不平衡・動作時間・復帰を要素ごとに確認する。',
      aliases: ['2E試験', '3E試験', 'モータリレー試験', '欠相試験', '反相試験'],
      instrumentModels: ['WPS-22', 'RX47022'],
      distinction: 'WPS-22は三相出力の専用器、RX47022は電圧2相・電流2相を組み合わせる多用途器。試験対象リレーの検出方式と必要相数を先に確認する。',
      safety: 'モータ停止、完全型式、主回路・制御回路の無電圧、誤始動防止、電磁接触器、外部CT、復帰方式、相順と試験後の復旧を確認する。',
      stages: ['リレー完全型式と1E・2E・3E区分を確認', '主回路・制御回路と停止状態を確認', '試験器と試験要素を選定', '取扱説明書と回路図で結線照合', '過負荷・欠相・反相を個別に測定', '接点・電磁接触器連動・復帰を確認', '出力停止・コード撤去・整定と相順を復旧'],
      checklist: ['完全型式と保護要素', '電流レンジ・外部CT・貫通方向', '電圧と相順', '復帰方式', '出力接点と電磁接触器', '試験器出力零', '整定・配線・相順・誤始動防止の復旧'],
      learning: './protective-relay.html?q=3E'
    });
  }

  const details = window.UKIWA_INSTRUMENT_DETAILS || {};
  details['WPS-22'] = {
    confidence: '完全型式の公式資料確認済み', checked,
    fieldThree: ['2E・3Eモータ保護リレーへ三相電流・三相電圧を与える専用試験器。', '最初にリレー完全型式、保護要素、電流レンジ、外部CT・貫通方式、復帰方式を確認。', '欠相・反相の作り方とコード接続は対象リレー・試験器双方の取扱説明書で照合する。'],
    completion: { level: 3, verified: ['メーカー公式製品仕様', '2E・3E対象要素', '出力レンジ', '取扱説明書公開導線'], missing: ['ユーザー保有実機写真', '付属コードの現物照合', '対象リレー別結線', '社内判定値'] },
    terminals: [
      ['R・S・T電流出力系', '三相試験電流', 'モータ保護リレーの電流検出系', '端子とコードは実機・取扱説明書で照合'],
      ['三相電圧出力系', '110/220/440V制御用三相電圧', '電圧・相順検出系', '対象リレーの定格と検出方式を確認'],
      ['トリップ入力系', '接点動作時間検出', '保護出力接点', 'a/b接点と基準状態を確認'],
      ['接地', '保護接地', '指定接地点', '電流共通線と保護接地を混同しない']
    ],
    methodIds: ['relay-motor-2e3e'],
    principles: '三相の試験電流と必要な三相電圧を生成し、過負荷、欠相、不平衡、反相条件を模擬する。保護接点が切り替わるまでの時間と復帰状態を確認する。',
    sources: [
      ['WPS-22 公式製品ページ', 'https://www.musashi-in.co.jp/item/2305/2305.html', checked],
      ['ムサシインテック取扱説明書ダウンロード', manualHub, 'WPS-22掲載を' + checked + '確認']
    ]
  };
  details['RX47022'] = {
    confidence: '完全型式の公式資料確認済み', checked,
    fieldThree: ['メーカー正式型式はRX47022。電圧2相・電流2相のため「I2V2」でも検索可能。', '最初に必要な相数、V結線、出力レンジ、補助電源、トリップ入力、対象保護要素を確認。', '2相出力を三相独立出力と誤解せず、直列・V結線・最大出力条件を取扱説明書で照合する。'],
    completion: { level: 3, verified: ['メーカー公式製品仕様', '電圧2相・電流2相構成', '対応保護要素', '取扱説明書公開導線'], missing: ['ユーザー保有実機写真', '保有ケーブル構成', '対象リレー別試験設定', '社内判定値'] },
    terminals: [
      ['V1・V2出力系', '電圧2相出力', '保護リレー電圧入力', 'V結線・直列・共通端子を取扱説明書で確認'],
      ['I1・I2出力系', '電流2相出力', '保護リレー電流入力', 'レンジ・直列接続・負荷条件を確認'],
      ['補助電源出力', 'AC/DC補助電源', '継電器制御電源', 'AC/DC・定格・極性を確認'],
      ['トリップ入力', '接点・電圧信号の時間計測', '継電器接点／CB回路', '入力条件と基準状態を確認']
    ],
    methodIds: ['relay-ocr', 'relay-ground-voltage', 'relay-rpr', 'relay-voltage-frequency', 'relay-motor-2e3e'],
    principles: '2つの電圧源と2つの電流源の振幅・位相・周波数を設定し、単相、V結線三相、二相不平衡、微小零相入力などを模擬して保護リレーの動作を確認する。',
    sources: [
      ['RX47022 公式製品ページ', 'https://www.nfcorp.co.jp/pro/p-test/rx/rx47022/index.html', checked],
      ['RX47022 公式ダウンロード', 'https://www.nfcorp.co.jp/support/download/rx47022/', '取扱説明書公開を' + checked + '確認']
    ]
  };
  window.UKIWA_INSTRUMENT_DETAILS = details;

  window.UKIWA_INSTRUMENT_CATALOG_META = {
    version: 'v5',
    checked,
    totalCount: 20 + existing.length,
    addedCount: existing.length,
    sourcePolicy: 'メーカー公式製品ページ・取扱説明書一覧で型式と用途を確認。端子・操作・コード色・管理値は実機未確認のまま推測しない。'
  };
})();
