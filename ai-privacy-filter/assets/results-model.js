/* AI Privacy Filter — derived numbers for the results tables.
   The table totals are computed here from data/results.json instead of being
   typed into the markup. The same file runs in the browser and in
   scripts/assert-numbers.cjs, so the page and the check share one formula.
   UMD wrapper: window.AIPF_RESULTS_MODEL in the page, module.exports in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AIPF_RESULTS_MODEL = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function fmt(value, digits, locale) {
    return Number(value).toLocaleString(locale || 'en-US', {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  }
  function pct(part, whole, digits, locale) {
    return fmt((part / whole) * 100, digits, locale) + '%';
  }

  function syntheticTotals(baseline) {
    var totals = { gold: 0, caught: 0, missed: 0, predicted: 0, correct: 0 };
    Object.keys(baseline.per_type || {}).forEach(function (type) {
      var row = baseline.per_type[type];
      totals.gold += row.gold || 0;
      totals.caught += row.protected || 0;
      totals.missed += row.missed || 0;
      totals.predicted += row.predicted || 0;
      totals.correct += row.correct || 0;
    });
    return totals;
  }

  function triageTotals(perBackend) {
    var totals = { calls: 0, leaks: 0, guard_blocks: 0, expected: 0 };
    Object.keys(perBackend || {}).forEach(function (name) {
      var row = perBackend[name];
      totals.calls += row.calls || 0;
      totals.leaks += row.leaks || 0;
      totals.guard_blocks += row.guard_blocks || 0;
      totals.expected += row.expected || 0;
    });
    return totals;
  }

  return { syntheticTotals: syntheticTotals, triageTotals: triageTotals, fmt: fmt, pct: pct };
}));
