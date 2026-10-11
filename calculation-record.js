/* Text records stay on this device until the user copies or downloads them. */
(function () {
  'use strict';
  window.UkiwaRecord = {
    version: '2026.10.11',
    time: () => new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', hour12: false }) + ' JST',
    async copy(value, status, fallback) {
      if (!value) { status.textContent = '現在の条件で計算してからコピーしてください。'; return false; }
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = '条件・結果・根拠をコピーしました。';
        fallback.hidden = true;
        return true;
      } catch (_) {
        fallback.value = value;
        fallback.hidden = false;
        fallback.focus();
        fallback.select();
        status.textContent = '自動コピーできませんでした。下の記録を選択してコピーしてください。';
        return false;
      }
    }
  };
})();
