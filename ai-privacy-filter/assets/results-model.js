/* AI Privacy Filter — derived headline numbers.
   Every number shown in a stat card is computed here from data/results.json.
   Nothing is typed into the markup. The same file runs in the browser and in
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

  /* Four cards, in reading order. `value` is the large number, `note` the
     small line under it. Both are formatted strings derived from the JSON. */
  function stats(results, locale) {
    var synthetic = results.detection.synthetic;
    var syn = syntheticTotals(synthetic.baselines.B2);
    var over = synthetic.baselines.B2.over_masking;
    var germ = results.detection.germeval.baselines.B2;
    var person = germ.per_type.PERSON;
    var org = germ.per_type.ORG;
    var leak = results.leak.baselines.B2;
    var triage = triageTotals(results.triage.per_backend);

    return [
      {
        id: 'caught',
        value: pct(syn.caught, syn.gold, 1, locale),
        note: fmt(syn.caught, 0, locale) + ' / ' + fmt(syn.gold, 0, locale),
        source: { protected: syn.caught, gold: syn.gold }
      },
      {
        id: 'extra',
        value: fmt(over.character_rate_pct, 1, locale) + '%',
        note: fmt(over.extra_chars, 0, locale) + ' / ' + fmt(over.replaced_chars, 0, locale),
        source: { extra_chars: over.extra_chars, replaced_chars: over.replaced_chars }
      },
      {
        id: 'germeval',
        value: fmt(germ.micro_primary.recall_pct, 1, locale) + '%',
        note: 'PERSON ' + fmt(person.protected, 0, locale) + '/' + fmt(person.gold, 0, locale) +
          ' · ORG ' + fmt(org.protected, 0, locale) + '/' + fmt(org.gold, 0, locale),
        source: {
          person: [person.protected, person.gold],
          org: [org.protected, org.gold]
        }
      },
      {
        id: 'leaks',
        value: fmt(leak.leak_rate_pct, 1, locale) + '%',
        note: fmt(leak.leaked_enquiries, 0, locale) + ' / ' + fmt(leak.records, 0, locale) +
          ' · 95% CI ' + fmt(leak.leak_wilson_pct[0], 1, locale) + '–' +
          fmt(leak.leak_wilson_pct[1], 1, locale) + '%',
        source: {
          leaked_enquiries: leak.leaked_enquiries,
          records: leak.records,
          leak_wilson_pct: leak.leak_wilson_pct
        }
      }
    ];
  }

  return { stats: stats, syntheticTotals: syntheticTotals, triageTotals: triageTotals, fmt: fmt, pct: pct };
}));
