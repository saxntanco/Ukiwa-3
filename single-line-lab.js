(function () {
  'use strict';
  const core = window.UkiwaSingleLine;
  if (!core) return;
  const byId = id => document.getElementById(id);
  const keys = Object.keys(core.defaults);
  const form = byId('conditions');
  const diagram = byId('diagram');
  const format = (value, decimals = 1) => value.toLocaleString('ja-JP', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  let statusTimer;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const devices = {
    pas: ['PAS｜柱上気中開閉器', '受電点付近で高圧回路を開閉する機器です。地絡保護ではSOG制御装置などと組み合わせて働きます。', 'この図では接続状態を固定しています。PAS自体を短絡電流を遮断するVCBと同じものとして扱わないことがポイントです。', 'equipment-map.html'],
    vcb: ['VCB｜真空遮断器', '真空中でアークを消して回路を遮断します。保護継電器からの引外し信号を受けて、故障回路を切り離す役割があります。', 'CTが電流を伝え、OCRなどが異常を判定し、VCBが遮断する、という役割の分担があります。この図では保護継電器と引外し回路は省略しています。', 'relay-basics.html'],
    ct: ['CT｜変流器', '高圧側を流れる電流を、計器や保護継電器が扱える小さな電流に変換します。20/5 Aなら、一次20 Aに対して二次5 Aの比率です。', 'CT二次電流は、変圧器の低圧側電流とは別です。図のCT二次は計器を通る閉回路です。実機では一次通電中にCT二次回路を開放してはいけません。', 'ct-calculator.html'],
    transformer: ['Tr｜変圧器', 'この図では6,600 Vを低圧へ変換します。理想変圧器では一次と二次で同じ電力を伝えるので、電圧を下げると線電流が大きくなります。', '150 kVAは変圧器の定格容量です。いつも150 kVAを消費するという意味ではなく、実際の負荷電流はつながる負荷のkWと力率で決まります。', 'ct-calculator.html'],
    load: ['低圧負荷｜電力を使う側', '照明・空調・モーターなどを、三相平衡の負荷ひとつにまとめています。入力欄のkWはこの負荷が受け取る有効電力です。', '同じkWでも力率が低いと大きな電流が必要です。実際の単相負荷の偏り、モーターの効率・始動電流、高調波などはこのモデルに含めていません。', 'equipment-map.html']
  };
  function write(id, text) { byId(id).textContent = text; }
  function motion() {
    diagram.classList.toggle('paused', paused);
    byId('flow-toggle').setAttribute('aria-pressed', String(paused));
    write('flow-toggle', paused ? '動きを再開' : '動きを止める');
  }
  function render(announce = false) {
    const input = Object.fromEntries(keys.map(key => [key, byId(key).value]));
    const result = core.calculate(input);
    keys.forEach(key => byId(key).setAttribute('aria-invalid', String(!result.ok && !!result.errors[key])));
    for (const key of ['kw', 'pf']) {
      const value = Number(input[key]);
      if (input[key].trim() && Number.isFinite(value) && value >= core.limits[key][0] && value <= core.limits[key][1]) byId(key + '-range').value = value;
    }
    byId('input-error').hidden = result.ok;
    for (const id of ['transformer-warning', 'ct-warning', 'zero-note']) byId(id).hidden = true;
    document.querySelector('.lab-board').classList.remove('ct-over');
    write('ct-reading-label', 'CT二次電流 I_CT');
    diagram.classList.toggle('no-flow', !result.ok || result.noLoad);
    clearTimeout(statusTimer);
    if (!result.ok) {
      const message = Object.values(result.errors).join(' ');
      write('input-error', message);
      for (const id of ['high-current', 'low-current', 'ct-current']) write(id, '— A');
      for (const id of ['apparent-power', 'loading']) write(id, '—');
      write('transformer-label', '変圧器 — kVA');
      write('ct-label', 'CT比 — / 5 A');
      write('low-voltage-label', '線間電圧 — V');
      for (const id of ['formula-s', 'formula-high', 'formula-low', 'formula-ct', 'rated-currents']) write(id, '入力を確認してください。');
      byId('loading-bar').style.width = '0%';
      byId('loading-bar').parentElement.classList.remove('over');
      write('result-status', '入力に誤りがあるため、計算結果を消去しました。');
      return;
    }
    const r = result;
    write('high-current', format(r.highCurrent, 2) + ' A');
    write('low-current', format(r.lowCurrent, 1) + ' A');
    write('ct-current', format(r.ctCurrent, 3) + ' A');
    write('apparent-power', format(r.apparentPower, 1) + ' kVA');
    write('loading', format(r.loading, 1) + '%');
    write('transformer-label', '変圧器 ' + r.kva + ' kVA');
    write('ct-label', 'CT比 ' + r.ctPrimary + ' / 5 A');
    write('low-voltage-label', '線間電圧 ' + r.lowVoltage + ' V');
    byId('loading-bar').style.width = Math.min(r.loading, 100) + '%';
    byId('loading-bar').parentElement.classList.toggle('over', r.transformerOver);
    if (r.transformerOver) {
      byId('transformer-warning').hidden = false;
      write('transformer-warning', '変圧器の定格容量を超えています。表示は損失・温度上昇を含まない理想計算です。');
    }
    if (r.ctOver) {
      write('ct-reading-label', 'CT二次電流：定格超過');
      byId('ct-warning').hidden = false;
      write('ct-warning', 'CT一次電流が定格' + r.ctPrimary + ' Aを超え、比率計算では二次5 A超です。実際のCTの誤差・飽和や計器の許容値は再現していません。');
      document.querySelector('.lab-board').classList.add('ct-over');
    }
    byId('zero-note').hidden = !r.noLoad;
    write('formula-s', r.kw + ' ÷ ' + r.pf + ' = ' + format(r.apparentPower, 2) + ' kVA');
    write('formula-high', '(P ÷ 力率) × 1,000 ÷ (√3 × 6,600) = ' + format(r.highCurrent, 2) + ' A');
    write('formula-low', '(P ÷ 力率) × 1,000 ÷ (√3 × ' + r.lowVoltage + ') = ' + format(r.lowCurrent, 1) + ' A');
    write('formula-ct', 'I_H × 5 ÷ ' + r.ctPrimary + ' = ' + format(r.ctCurrent, 3) + ' A（丸め前のI_Hで計算）');
    write('rated-currents', '現在の' + r.kva + ' kVA・6,600/' + r.lowVoltage + ' Vの定格線電流：一次 ' + format(r.highRatedCurrent, 2) + ' A、二次 ' + format(r.lowRatedCurrent, 1) + ' A。定格容量から計算する値で、図の実負荷電流とは別です。');
    if (announce) statusTimer = setTimeout(() => write('result-status', '一次' + format(r.highCurrent, 2) + 'アンペア、二次' + format(r.lowCurrent, 1) + 'アンペア、CT二次' + format(r.ctCurrent, 3) + 'アンペア。' + (r.transformerOver ? '変圧器の定格超過。' : '') + (r.ctOver ? 'CT一次定格超過。' : '')), 350);
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', event => {
    if (event.target.id.endsWith('-range')) byId(event.target.id.replace('-range', '')).value = event.target.value;
    write('experiment-note', '図の数値は入力に合わせて更新します。一次・二次は線電流の実効値です。');
    render(true);
  });
  form.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = button.dataset.preset;
    if (preset === 'reset') { keys.forEach(key => byId(key).value = core.defaults[key]); write('experiment-note', '90kW・力率0.9・150kVAに戻しました。力率だけ変えて比べてみましょう。'); }
    if (preset === 'pf') { byId('pf').value = '0.6'; write('experiment-note', '力率だけ0.6にしました。同じkWなら、力率が低いほど必要な皮相電力と電流は大きくなります。'); }
    if (preset === 'capacity') { byId('kva').value = '300'; write('experiment-note', '変圧器容量だけ300kVAにしました。負荷電流は同じで、定格に対する割合が変わります。'); }
    if (preset === 'zero') { byId('kw').value = '0'; write('experiment-note', '負荷を0kWにしました。モデル上の負荷電流は0 Aですが、電圧はかかったままです。'); }
    render(true);
  }));
  byId('flow-toggle').addEventListener('click', () => { paused = !paused; motion(); });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change', event => { paused = event.matches; motion(); });
  const dialog = byId('device-dialog');
  function showDevice(element) {
    const [title, copy, detail, href] = devices[element.dataset.device];
    write('device-title', title); write('device-copy', copy); write('device-detail', detail);
    byId('device-link').href = href;
    dialog.showModal();
  }
  document.querySelectorAll('[data-device]').forEach(element => {
    element.addEventListener('click', () => showDevice(element));
    element.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDevice(element); } });
  });
  byId('close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  motion(); render();
})();
