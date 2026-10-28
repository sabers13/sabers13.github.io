#!/usr/bin/env node
/* Prove that every number in the four stat cards equals data/results.json.
 *
 * The cards are rendered by assets/results-model.js, the same module this
 * script uses to recompute them. The script checks the rendered text in a real
 * browser (en and de), so a hand-typed number or a stale copy fails the run.
 *
 * Usage (a static server must serve the site root):
 *   AIPF_BASE=http://127.0.0.1:8084 node ai-privacy-filter/scripts/assert-numbers.cjs
 * Requires the `playwright` package (dev-only; not shipped with the page).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const model = require('../assets/results-model.js');

const root = path.resolve(__dirname, '..');
const results = JSON.parse(fs.readFileSync(path.join(root, 'data', 'results.json'), 'utf8'));
const examples = JSON.parse(fs.readFileSync(path.join(root, 'data', 'examples.json'), 'utf8'));
const leakRate = JSON.parse(fs.readFileSync(path.join(root, 'data', 'leak_rate.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appjs = fs.readFileSync(path.join(root, 'assets', 'app.js'), 'utf8');
const base = process.env.AIPF_BASE || 'http://127.0.0.1:8084';

let failures = 0;
function check(ok, label, detail) {
  if (!ok) failures += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (detail ? ' — ' + detail : ''));
}

async function main() {
  const grid = html.match(/<div id="stats-grid"[^>]*>([\s\S]*?)<\/div>/);
  check(Boolean(grid) && grid[1].trim() === '', 'stats grid is empty in index.html (cards come from the JSON)');
  check(!JSON.stringify(results).includes('"mock"'), 'results.json carries no mock flag');
  check(!JSON.stringify(examples).includes('"mock"'), 'examples.json carries no mock flag');

  /* The leaks card shows the committed gold-based leak rate from
     results/leak_rate.json (B2), not the reply-drafting replacement count. */
  const leakB2 = leakRate.baselines.B2;
  check(JSON.stringify(results.leak) === JSON.stringify(leakRate),
    'results.leak copies data/leak_rate.json exactly');
  check(leakB2.leak_rate_pct === 1.9 && leakB2.leaked_enquiries === 3 && leakB2.records === 160 &&
    leakB2.leak_wilson_pct[0] === 0.6 && leakB2.leak_wilson_pct[1] === 5.4,
  'leak_rate B2 carries the committed 1.9% / 3 of 160 / 95% CI 0.6–5.4 figure',
  JSON.stringify(leakB2.leak_rate_pct) + '% / ' + leakB2.leaked_enquiries + ' of ' + leakB2.records);
  check(!/0 \/ 160|Mapped values\s+leaked/.test(appjs + html + JSON.stringify(results)),
    'no old "0 / 160" or "mapped values leaked" claim remains');

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (const lang of ['en', 'de']) {
      const locale = lang === 'de' ? 'de-DE' : 'en-US';
      await page.goto(base + '/ai-privacy-filter/?lang=' + lang + '&theme=light', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelectorAll('#stats-grid .stat').length === 4);
      const shown = await page.$$eval('#stats-grid .stat', (cards) => cards.map((card) => ({
        id: card.dataset.stat,
        value: card.querySelector('.stat-value').textContent.trim(),
        note: card.querySelector('.stat-note').textContent.trim()
      })));
      const expected = model.stats(results, locale);
      check(shown.length === expected.length, lang + ': four cards rendered', shown.length + ' shown');
      expected.forEach((card, index) => {
        const actual = shown[index] || {};
        check(actual.id === card.id, lang + ': card ' + card.id + ' order', actual.id);
        check(actual.value === card.value, lang + ': card ' + card.id + ' value from JSON', actual.value + ' = ' + card.value);
        check(actual.note === card.note, lang + ': card ' + card.id + ' note from JSON', actual.note + ' = ' + card.note);
      });
      const leakCard = shown.find((card) => card.id === 'leaks') || {};
      const leakValue = lang === 'de' ? '1,9%' : '1.9%';
      const leakNote = '3 / 160 · 95% CI ' + (lang === 'de' ? '0,6–5,4%' : '0.6–5.4%');
      check(leakCard.value === leakValue,
        lang + ': leaks card value is the leak_rate.json rate', leakCard.value + ' = ' + leakValue);
      check(leakCard.note === leakNote,
        lang + ': leaks card note is 3 of 160 with the 95% CI', leakCard.note + ' = ' + leakNote);
    }
  } finally {
    await browser.close();
  }

  if (failures) {
    console.error('\nassert-numbers: ' + failures + ' check(s) failed');
    process.exit(1);
  }
  console.log('\nassert-numbers: every displayed stat number equals data/results.json');
}

main().catch((error) => {
  console.error('assert-numbers: ' + error.message);
  process.exit(1);
});
