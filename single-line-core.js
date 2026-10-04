(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UkiwaSingleLine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const defaults = Object.freeze({ kw: 90, pf: 0.9, kva: 150, lowVoltage: 210, ctPrimary: 20 });
  const limits = Object.freeze({ kw: [0, 300], pf: [0.5, 1], kva: [100, 500], lowVoltage: [200, 420], ctPrimary: [20, 100] });
  const labels = { kw: '負荷の有効電力', pf: '力率', kva: '変圧器容量', lowVoltage: '二次の線間電圧', ctPrimary: 'CT一次定格電流' };
  function calculate(input) {
    const values = {}, errors = {};
    for (const [key, range] of Object.entries(limits)) {
      const raw = input && input[key];
      const value = typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '') ? Number(raw) : NaN;
      if (!Number.isFinite(value) || value < range[0] || value > range[1]) {
        errors[key] = labels[key] + 'は' + range[0] + '〜' + range[1] + 'の範囲で入力してください。';
      } else values[key] = value;
    }
    if (Object.keys(errors).length) return { ok: false, errors };
    const { kw, pf, kva, lowVoltage, ctPrimary } = values;
    const highVoltage = 6600, ctSecondaryRating = 5;
    const apparentPower = kw / pf;
    const highCurrent = apparentPower * 1000 / (Math.sqrt(3) * highVoltage);
    const lowCurrent = apparentPower * 1000 / (Math.sqrt(3) * lowVoltage);
    const ctCurrent = highCurrent * ctSecondaryRating / ctPrimary;
    return {
      ok: true, ...values, highVoltage, ctSecondaryRating, apparentPower, highCurrent, lowCurrent, ctCurrent,
      highRatedCurrent: kva * 1000 / (Math.sqrt(3) * highVoltage),
      lowRatedCurrent: kva * 1000 / (Math.sqrt(3) * lowVoltage),
      loading: apparentPower / kva * 100,
      transformerOver: apparentPower > kva + 1e-9,
      ctOver: highCurrent > ctPrimary + 1e-9,
      noLoad: kw === 0
    };
  }
  return Object.freeze({ defaults, limits, calculate });
});
