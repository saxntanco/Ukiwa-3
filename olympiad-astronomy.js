(() => {
  'use strict';
  const input = document.getElementById('distance-ratio');
  if (!input) return;
  const result = document.getElementById('brightness-result');
  const format = new Intl.NumberFormat('ja-JP', {maximumSignificantDigits: 4});
  function update() {
    const k = input.valueAsNumber;
    const valid = Number.isFinite(k) && k >= 0.1 && k <= 100;
    input.setAttribute('aria-invalid', String(!valid));
    result.classList.toggle('error', !valid);
    result.textContent = valid
      ? '届く光は元の ' + format.format(1 / (k * k)) + ' 倍（距離 ' + format.format(k) + ' 倍）'
      : '計算できません。0.1〜100の数値を入力してください。';
  }
  input.addEventListener('input', update);
  document.getElementById('brightness-model').hidden = false;
  update();
})();
