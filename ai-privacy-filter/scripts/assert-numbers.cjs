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
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
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
