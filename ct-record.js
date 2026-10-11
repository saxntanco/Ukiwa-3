(function () {
  'use strict';
  const el = id => document.getElementById(id);
  const fmt = n => Number.isFinite(n) ? n.toLocaleString('ja-JP', { maximumFractionDigits: 6 }) : '未確認';
  let snapshot = null;
  function clear() {
    snapshot = null;
    el('ctCopy').disabled = true;
    el('ctRecordText').textContent = '現在の条件で計算すると記録を作成できます。';
    el('ctCopyStatus').textContent = '';
    el('ctRecordFallback').value = '';
    el('ctRecordFallback').hidden = true;
  }
  function capture(load, candidate, error = '') {
    const inputs = Object.fromEntries(['v','s','t','pair','rs','st','tr','margin','sec','source','series','ref'].map(id => [id, el(id).value]));
    snapshot = { load, candidate, error, inputs, calculatedAt: UkiwaRecord.time() };
    el('ctCopy').disabled = false;
    el('ctRecordText').textContent = record();
  }
  function record() {
    if (!snapshot) return '';
    const { load: r, candidate: c, error, inputs: v, calculatedAt } = snapshot;
    const out = [
      `うきわメモ CT候補の計算記録／記録形式 ${UkiwaRecord.version}`,
      `計算時刻：${calculatedAt}`,
      '区分：容量・電流による候補比較。実機適合・承認済みCT比を示すものではありません。',
      `受電線間電圧：${v.v} V`,
      ...(v.pair === 'split' ? [`単相：RS ${v.rs} kVA／ST ${v.st} kVA／TR ${v.tr} kVA`] : [`単相：${v.s} kVA／接続相間 ${v.pair}`]),
      `平衡三相：${v.t} kVA`,
      '試算条件：全台定格容量・共通力率角・平衡電圧。入力例や初期値を使った項目も実設備の条件と照合してください。',
      ...r.individual.map(x => `${x.phase === 'single' ? '単相 ' + x.connection : '三相'} ${fmt(x.capacity)} kVA → 定格一次電流 ${fmt(x.rated)} A`),
      `受電一次電流：R ${fmt(r.lines[0])} A／S ${fmt(r.lines[1])} A／T ${fmt(r.lines[2])} A`,
      `最大相電流：${fmt(r.max)} A`,
      `候補比較の入力：余裕 ${v.margin} 倍／CT二次定格 ${v.sec} A`,
      `候補一覧の出典：${v.source === 'catalog' ? '登録資料（三菱 CD-10ANB / CD-10CNB）' : '利用者入力（メーカー確認済みとは扱いません）：' + v.ref}`
    ];
    if (c) {
      out.push(`比較電流：${fmt(r.max)} × ${fmt(c.margin)} = ${fmt(c.target)} A`,
        `比較した一次定格：${c.series.map(fmt).join(' / ')} A`,
        c.first == null ? '結果：登録一覧に条件を満たす候補なし。' : `電流定格による最小候補：${fmt(c.first)} / ${fmt(c.secondary)} A`,
        c.first == null ? '負荷時の二次電流：候補なしのため未算出。' : `この候補での最大二次電流：${fmt(r.max * c.secondary / c.first)} A（定格二次電流とは別）`);
    } else out.push(`候補は保留：${error}`, `利用者入力の一次定格一覧：${v.series || '未入力'}`);
    out.push('計算式：単相 I=S×1000/V、平衡三相 I=S×1000/(√3V)。相別に位相を含めて合成し、最大相電流×余裕倍率以上の登録定格を比較。',
      '二次換算：I二次 = I一次 × CT定格二次 / CT定格一次。',
      '未判定：二次負担・確度・事故電流・耐電流・引外し方式・保護協調・実需要と増設条件。',
      'モデル対象外：V結線・スコット結線・単相器の三相バンク、損失・励磁電流・高調波・コンデンサ・逆潮流。');
    if (v.source === 'catalog') out.push('候補の根拠：三菱 Y-0550U（2018年9月）冊子42–43頁／PDF44–45頁。旧版の登録値です。現行仕様・供給可否は未確認。サイト記載の資料確認日：2026-09-18。', UkiwaCT.catalog.source);
    out.push('参考：三菱 CT選定時の注意（余裕倍率の一般的な目安）', 'https://www.mitsubishielectric.co.jp/fa/ssl/learn/el/eln/course/fa_0220/cha_2/02030001.html',
      '再確認するページ：https://saxntanco.github.io/Ukiwa-3/ct-calculator.html');
    return out.join('\n');
  }
  window.UkiwaCTRecord = { clear, capture };
  el('ctCopy').addEventListener('click', () => UkiwaRecord.copy(record(), el('ctCopyStatus'), el('ctRecordFallback')));
  clear();
})();
