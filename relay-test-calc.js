/* K2OC DS_J_2_4 (June 2026), p.21 test criterion; not p.2 product accuracy. */
(function (root) {
  'use strict';
  const taps = Object.freeze([3, 3.5, 4, 4.5, 5, 6]);
  function pickupRange(model, value) {
    if (!['K2OC-AVN', 'K2OC-ACN'].includes(model)) return null;
    const tap = Number(value);
    if (!taps.includes(tap)) return null;
    return { tap, low: tap * 9 / 10, high: tap * 11 / 10, unit: 'CT二次A' };
  }
  const api = Object.freeze({ taps, pickupRange });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.UkiwaRelayTest = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
