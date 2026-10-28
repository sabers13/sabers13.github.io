#!/usr/bin/env node
/* Prove that every KPI and every charted value on the page equals its JSON.
 *
 *   - data/kpis.json: every KPI entry is internally consistent (value,
 *     numerator/denominator, 95% CI) and the four cards in the KPI row render
 *     exactly its value, n / N, label and interval.
 *   - data/charts/*.json: every charted segment is internally consistent and
 *     every bar, whisker and table cell for the three drawn charts renders the
 *     same number, in English and German.
 *   - the page draws the charts itself: the containers are empty in the markup,
 *     charts.js makes no network call and no CDN or chart library is loaded.
 *
 * Usage (a static server must serve the site root):
 *   AIPF_BASE=http://127.0.0.1:8084 node ai-privacy-filter/scripts/assert-numbers.cjs
 * Requires the `playwright` package (dev-only; not shipped with the page).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const results = read('data/results.json');
const examples = read('data/examples.json');
const leakRate = read('data/leak_rate.json');
const kpisFile = read('data/kpis.json');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appjs = fs.readFileSync(path.join(root, 'assets', 'app.js'), 'utf8');
const chartsjs = fs.readFileSync(path.join(root, 'assets', 'charts.js'), 'utf8');

const CHART_FILES = [
  'germeval-recall-by-detector',
  'leak-rate-by-detector',
  'synthetic-recall-by-type',
  'triage-accuracy-by-backend',
  'triage-latency-by-backend'
];
const CHART_JSON = {};
for (const name of CHART_FILES) CHART_JSON[name] = read('data/charts/' + name + '.json');

const KPI_ROW = [
  { id: 'synthetic_recall_b2', value: 99.5, numerator: 1069, denominator: 1074, ci: [98.9, 99.8] },
  { id: 'leak_rate_b2', value: 1.9, numerator: 3, denominator: 160, ci: [0.6, 5.4] },
  { id: 'over_masking_b2', value: 0, numerator: 0, denominator: 160, ci: [0, 2.3] },
  { id: 'germeval_combined_recall_b2', value: 78.4, numerator: 2186, denominator: 2789, ci: [76.8, 79.9] }
];
const DRAWN = [
  { id: 'leak-rate-by-detector', slot: 'chart-slot-leak-rate', section: 'numbers', inside: null },
  { id: 'synthetic-recall-by-type', slot: 'chart-slot-recall-by-type', section: 'results', inside: null },
  { id: 'triage-accuracy-by-backend', slot: 'chart-slot-triage-accuracy', section: 'results', inside: 'triage-card' }
];
const base = process.env.AIPF_BASE || 'http://127.0.0.1:8084';
const types = new Set(['PERSON', 'ORG', 'EMAIL', 'PHONE', 'IBAN', 'ADDRESS_STREET', 'POSTCODE_CITY', 'URL', 'VAT_ID', 'DATE_OF_BIRTH']);

let failures = 0;
function check(ok, label, detail) {
  if (!ok) failures += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (detail ? ' — ' + detail : ''));
}
function near(actual, expected, tolerance) {
  return Math.abs(Number(actual) - Number(expected)) <= (tolerance == null ? 0.05 : tolerance);
}
function round1(value) { return Math.round(Number(value) * 10) / 10; }
function digits(value, places, locale) {
  return Number(value).toLocaleString(locale || 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: places == null ? 1 : places
  });
}
const pctText = (value, locale) => digits(value, 1, locale) + '%';
const countText = (n, total, locale) => digits(n, 0, locale) + ' / ' + digits(total, 0, locale);
const rangeText = (low, high, locale) => digits(low, 1, locale) + '–' + digits(high, 1, locale) + '%';

function groupLabel(row, lang, pageLabels) {
  const text = (row.label && (row.label[lang] || row.label.en)) || '';
  if (types.has(text) && pageLabels[text]) return pageLabels[text];
  return text;
}

/* ---------- data checks ---------- */
function checkKpis() {
  const list = kpisFile.kpis || [];
  check(list.length === 24, 'kpis.json carries 24 KPI entries', String(list.length));
  const seen = new Set();
  list.forEach((kpi) => {
    check(!seen.has(kpi.id), 'KPI id is unique: ' + kpi.id);
    seen.add(kpi.id);
    check(Boolean(kpi.label && kpi.label.en && kpi.label.de), 'KPI has EN and DE labels: ' + kpi.id);
    check(Number.isFinite(kpi.value), 'KPI value is a number: ' + kpi.id, String(kpi.value));
    if (kpi.unit === 'percent') {
      check(kpi.value >= 0 && kpi.value <= 100, 'KPI percent is in 0..100: ' + kpi.id, String(kpi.value));
    }
    if (Number.isFinite(kpi.numerator) && Number.isFinite(kpi.denominator)) {
      check(kpi.numerator >= 0 && kpi.numerator <= kpi.denominator,
        'KPI numerator <= denominator: ' + kpi.id, kpi.numerator + ' / ' + kpi.denominator);
      if (kpi.unit === 'percent') {
        const expected = round1((kpi.numerator / kpi.denominator) * 100);
        check(near(kpi.value, expected), 'KPI value = n / N: ' + kpi.id, kpi.value + ' vs ' + expected);
      }
    }
    if (kpi.ci95) {
      check(kpi.ci95.length === 2 && kpi.ci95[0] <= kpi.ci95[1], 'KPI CI is ordered: ' + kpi.id,
        JSON.stringify(kpi.ci95));
      check(kpi.ci95[0] <= kpi.value && kpi.value <= kpi.ci95[1],
        'KPI value lies inside its 95% CI: ' + kpi.id, kpi.value + ' in ' + JSON.stringify(kpi.ci95));
      check(kpi.unit !== 'percent' || (kpi.ci95[0] >= 0 && kpi.ci95[1] <= 100),
        'KPI CI is in 0..100: ' + kpi.id, JSON.stringify(kpi.ci95));
    }
  });

  KPI_ROW.forEach((want) => {
    const kpi = list.find((item) => item.id === want.id);
    check(Boolean(kpi), 'KPI row entry exists: ' + want.id);
    if (!kpi) return;
    check(kpi.value === want.value, 'KPI row value is ' + want.value + '%: ' + want.id, String(kpi.value));
    check(kpi.numerator === want.numerator && kpi.denominator === want.denominator,
      'KPI row counts are ' + want.numerator + ' / ' + want.denominator + ': ' + want.id,
      kpi.numerator + ' / ' + kpi.denominator);
    check(JSON.stringify(kpi.ci95) === JSON.stringify(want.ci),
      'KPI row CI is ' + want.ci.join('–') + ': ' + want.id, JSON.stringify(kpi.ci95));
  });

  /* The row must agree with the page's own result blocks, not just itself. */
  const synth = results.detection.synthetic.baselines.B2;
  const synTotals = { protected: 0, gold: 0 };
  Object.keys(synth.per_type).forEach((type) => {
    synTotals.protected += synth.per_type[type].protected;
    synTotals.gold += synth.per_type[type].gold;
  });
  check(synTotals.protected === 1069 && synTotals.gold === 1074,
    'results.json synthetic B2 totals are 1,069 / 1,074', JSON.stringify(synTotals));
  check(leakRate.baselines.B2.leak_rate_pct === 1.9 && leakRate.baselines.B2.leaked_enquiries === 3 &&
    leakRate.baselines.B2.records === 160, 'leak_rate.json B2 is 1.9% / 3 of 160');
  check(synth.over_masking.enquiries_with_extra === 0 && synth.over_masking.records === 160 &&
    JSON.stringify(synth.over_masking.enquiry_wilson_pct) === JSON.stringify([0, 2.3]),
    'results.json over-masking B2 is 0 of 160, CI 0–2.3', JSON.stringify(synth.over_masking.enquiry_wilson_pct));
  const germ = results.detection.germeval.baselines.B2.micro_primary;
  check(germ.protected === 2186 && germ.gold === 2789 && germ.recall_pct === 78.4 &&
    JSON.stringify(germ.recall_wilson_pct) === JSON.stringify([76.8, 79.9]),
    'results.json GermEval B2 is 78.4%, 2,186 / 2,789, CI 76.8–79.9');
  check(JSON.stringify(results.leak) === JSON.stringify(leakRate),
    'results.leak copies data/leak_rate.json exactly');
}

function checkCharts() {
  CHART_FILES.forEach((file) => {
    const chart = CHART_JSON[file];
    check(chart.id === file, 'chart id matches its file: ' + file, chart.id);
    check(chart.schema_version === 1, 'chart schema_version is 1: ' + file, String(chart.schema_version));
    check(Boolean(chart.title && chart.title.en && chart.title.de), 'chart has EN and DE title: ' + file);
    check(chart.series.length > 0, 'chart has at least one series: ' + file);
    const keys = new Set();
    chart.series.forEach((series) => {
      check(!keys.has(series.key), 'chart series key is unique: ' + file + '/' + series.key);
      keys.add(series.key);
      check(Boolean(series.label && series.label.en && series.label.de),
        'chart series has EN and DE labels: ' + file + '/' + series.key);
    });
    check(chart.rows.length > 1, 'chart has rows: ' + file, String(chart.rows.length));
    chart.rows.forEach((row, rowIndex) => {
      check(Boolean(row.label && row.label.en && row.label.de),
        'chart row ' + rowIndex + ' has EN and DE labels: ' + file);
      check(Array.isArray(row.segments) && row.segments.length === chart.series.length,
        'chart row ' + rowIndex + ' carries one segment per series: ' + file,
        String((row.segments || []).length));
      row.segments.forEach((segment) => {
        const where = file + ' row ' + rowIndex + ' ' + segment.series;
        check(keys.has(segment.series), 'segment series exists: ' + where);
        check(Number.isFinite(segment.value), 'segment value is a number: ' + where, String(segment.value));
        if (chart.unit === 'milliseconds') {
          check(segment.value > 0, 'segment latency is positive: ' + where, String(segment.value));
        }
        if (segment.numerator != null || segment.denominator != null) {
          check(Number.isFinite(segment.numerator) && Number.isFinite(segment.denominator) &&
            segment.numerator <= segment.denominator, 'segment n <= N: ' + where,
            segment.numerator + ' / ' + segment.denominator);
          if (chart.unit === 'percent') {
            const expected = round1((segment.numerator / segment.denominator) * 100);
            check(near(segment.value, expected), 'segment value = n / N: ' + where, segment.value + ' vs ' + expected);
          }
        }
        if (segment.ci95) {
          check(segment.ci95.length === 2 && segment.ci95[0] <= segment.ci95[1],
            'segment CI is ordered: ' + where, JSON.stringify(segment.ci95));
          check(segment.ci95[0] <= segment.value && segment.value <= segment.ci95[1],
            'segment value lies inside its CI: ' + where, segment.value + ' in ' + JSON.stringify(segment.ci95));
        }
      });
    });
  });

  /* The drawn charts repeat headline numbers that also have a KPI. */
  const kpi = (id) => (kpisFile.kpis || []).find((item) => item.id === id) || {};
  const leak = CHART_JSON['leak-rate-by-detector'];
  const leakB2 = leak.rows.find((row) => /B2/.test(row.label.en)).segments[0];
  check(leakB2.value === kpi('leak_rate_b2').value &&
    JSON.stringify(leakB2.ci95) === JSON.stringify(kpi('leak_rate_b2').ci95),
    'leak chart B2 equals the leak KPI', leakB2.value + '%');

  const recall = CHART_JSON['synthetic-recall-by-type'];
  const b2 = { protected: 0, gold: 0 };
  recall.rows.forEach((row) => {
    const segment = row.segments.find((item) => item.series === 'B2');
    b2.protected += segment.numerator;
    b2.gold += segment.denominator;
  });
  check(b2.protected === 1069 && b2.gold === 1074,
    'recall chart B2 totals equal the caught KPI (1,069 / 1,074)', JSON.stringify(b2));

  const triage = CHART_JSON['triage-accuracy-by-backend'];
  const backendKey = { 'Claude (CLI)': 'claude-cli', 'Codex (CLI)': 'codex-cli', 'BYOK (OpenCode Go)': 'byok', 'Ollama (local)': 'ollama' };
  triage.rows.forEach((row) => {
    const key = backendKey[row.label.en];
    row.segments.forEach((segment) => {
      const id = 'triage_' + segment.series + '_' + key;
      const expected = kpi(id);
      check(expected.id === id && expected.value === segment.value &&
        expected.numerator === segment.numerator && expected.denominator === segment.denominator &&
        JSON.stringify(expected.ci95) === JSON.stringify(segment.ci95),
        'triage chart value equals KPI ' + id, segment.value + '%');
    });
  });
}

/* ---------- markup checks ---------- */
function checkMarkup() {
  const grid = html.match(/<div id="kpi-grid"[^>]*>([\s\S]*?)<\/div>/);
  check(Boolean(grid) && grid[1].trim() === '', 'KPI grid is empty in index.html (cards come from the JSON)');
  DRAWN.forEach((item) => {
    const slot = html.match(new RegExp('<div class="[^"]*"[^>]*id="' + item.slot + '"[^>]*>([\\s\\S]*?)</div>'));
    check(Boolean(slot) && slot[1].trim() === '', 'chart container is empty in index.html: ' + item.id);
  });
  check(!/<script[^>]+src="https?:/.test(html), 'index.html loads no script from a CDN');
  check(!/\b(fetch|XMLHttpRequest|import\()/.test(chartsjs), 'charts.js makes no network call');
  check(!/https?:\/\//.test(chartsjs), 'charts.js references no external URL');
  check(!/chart\.js|d3|echarts|plotly|recharts/i.test(html + chartsjs), 'no chart library is referenced');
  check(!/0 \/ 160|Mapped values\s+leaked/.test(appjs + html + JSON.stringify(results)),
    'no old "0 / 160" or "mapped values leaked" claim remains');
}

/* ---------- rendered checks ---------- */
async function checkPage(browser, lang) {
  const locale = lang === 'de' ? 'de-DE' : 'en-US';
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
  page.on('request', (req) => requests.push(req.url()));
  await page.goto(base + '/ai-privacy-filter/?lang=' + lang + '&theme=light', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('#kpi-grid .kpi').length === 4, null, { timeout: 15000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-chart] svg').length === 3, null, { timeout: 15000 });

  check(requests.every((url) => url.startsWith(base)), lang + ': every request stays on the site origin',
    requests.filter((url) => !url.startsWith(base)).join(', ') || requests.length + ' requests');

  const pageLabels = await page.evaluate(() => {
    const out = {};
    ['PERSON', 'ORG', 'EMAIL', 'PHONE', 'IBAN', 'ADDRESS_STREET', 'POSTCODE_CITY', 'URL', 'VAT_ID', 'DATE_OF_BIRTH']
      .forEach((type) => { out[type] = window.AIPF_I18N.t('type.' + type); });
    return out;
  });
  const ciText = (kpi) => (lang === 'de' ? '95%-KI ' : '95% CI ') + rangeText(kpi.ci95[0], kpi.ci95[1], locale);

  const shown = await page.$$eval('#kpi-grid .kpi', (cards) => cards.map((card) => ({
    id: card.dataset.kpi,
    value: card.dataset.value,
    heading: card.querySelector('.kpi-value').textContent.trim(),
    count: card.querySelector('.kpi-count').textContent.trim(),
    label: card.querySelector('.kpi-label').textContent.trim(),
    ci: card.querySelector('.kpi-ci').textContent.trim(),
    describedBy: card.querySelector('.kpi-ci-btn').getAttribute('aria-describedby'),
    ciId: card.querySelector('.kpi-ci').id
  })));
  check(shown.length === 4, lang + ': KPI row has four cards', String(shown.length));
  KPI_ROW.forEach((want, index) => {
    const kpi = kpisFile.kpis.find((item) => item.id === want.id);
    const card = shown[index] || {};
    check(card.id === want.id, lang + ': KPI card ' + (index + 1) + ' is ' + want.id, card.id);
    check(Number(card.value) === kpi.value, lang + ': ' + want.id + ' data-value is the JSON value', card.value);
    check(card.heading === pctText(kpi.value, locale), lang + ': ' + want.id + ' shows the JSON value',
      card.heading + ' = ' + pctText(kpi.value, locale));
    check(card.count === countText(kpi.numerator, kpi.denominator, locale),
      lang + ': ' + want.id + ' shows n / N', card.count + ' = ' + countText(kpi.numerator, kpi.denominator, locale));
    check(card.label === (kpi.label[lang] || kpi.label.en), lang + ': ' + want.id + ' shows the JSON label', card.label);
    check(card.ci === ciText(kpi), lang + ': ' + want.id + ' shows the JSON 95% CI', card.ci + ' = ' + ciText(kpi));
    check(card.describedBy === card.ciId, lang + ': ' + want.id + ' CI is wired via aria-describedby', card.describedBy);
  });

  /* CI appears on hover and on keyboard focus. */
  const firstCard = page.locator('#kpi-grid .kpi').first();
  await firstCard.hover();
  await page.waitForTimeout(250);
  const hoverVisibility = await firstCard.locator('.kpi-ci').evaluate((el) => getComputedStyle(el).visibility);
  check(hoverVisibility === 'visible', lang + ': KPI CI appears on hover', hoverVisibility);
  await page.mouse.move(0, 0);
  const lastButton = page.locator('#kpi-grid .kpi').last().locator('.kpi-ci-btn');
  await lastButton.focus();
  await page.waitForTimeout(250);
  const focusVisibility = await page.locator('#kpi-grid .kpi').last().locator('.kpi-ci')
    .evaluate((el) => getComputedStyle(el).visibility);
  check(focusVisibility === 'visible', lang + ': KPI CI appears on focus', focusVisibility);

  /* Placement: (a) Measured results, (b) Results and limits, (d) Reply drafting. */
  for (const item of DRAWN) {
    const placed = await page.evaluate(([slot, section, inside]) => {
      const container = document.getElementById(slot);
      if (!container) return { found: false };
      const sec = container.closest('section');
      const inner = inside ? container.closest('#' + inside) : true;
      return {
        found: true,
        section: sec ? sec.id : null,
        inside: Boolean(inner),
        charts: container.hasAttribute('data-chart') ? 1 : 0
      };
    }, [item.slot, item.section, item.inside]);
    check(placed.found && placed.section === item.section && placed.inside && placed.charts === 1,
      lang + ': ' + item.id + ' sits in ' + item.section + (item.inside ? '/' + item.inside : ''),
      JSON.stringify(placed));
  }

  for (const item of DRAWN) {
    const chart = CHART_JSON[item.id];
    const expected = [];
    chart.rows.forEach((row, rowIndex) => {
      row.segments.forEach((segment) => {
        expected.push({ rowIndex, row, segment });
      });
    });

    const figure = await page.evaluate((id) => {
      const el = document.querySelector('[data-chart="' + id + '"]');
      if (!el) return null;
      return {
        title: el.querySelector('.chart-head h3').textContent.trim(),
        legend: Array.from(el.querySelectorAll('.chart-legend-item')).map((node) => node.textContent.trim()),
        rects: Array.from(el.querySelectorAll('rect.ch-bar')).map((node) => ({
          series: node.getAttribute('data-series'),
          value: node.getAttribute('data-value')
        })),
        whiskers: Array.from(el.querySelectorAll('g.ch-ci')).map((node) => node.getAttribute('data-ci')),
        tableRows: Array.from(el.querySelectorAll('.chart-table tbody tr[data-row]')).map((tr) => ({
          row: tr.getAttribute('data-row'),
          series: tr.getAttribute('data-series'),
          label: tr.querySelector('th[scope="row"]').textContent.trim(),
          value: tr.querySelector('td[data-value]').textContent.trim(),
          count: tr.querySelector('td[data-n]').textContent.trim(),
          ci: tr.querySelector('td[data-ci]').textContent.trim(),
          rawValue: tr.querySelector('td[data-value]').getAttribute('data-value'),
          rawCi: tr.querySelector('td[data-ci]').getAttribute('data-ci')
        })),
        caption: el.querySelector('.chart-table caption').textContent.trim()
      };
    }, item.id);

    check(Boolean(figure), lang + ': ' + item.id + ' is drawn');
    if (!figure) continue;
    check(figure.title === (chart.title[lang] || chart.title.en),
      lang + ': ' + item.id + ' title comes from its JSON', figure.title);
    if (chart.series.length > 1) {
      const wantLegend = chart.series.map((series) => series.label[lang] || series.label.en);
      check(JSON.stringify(figure.legend) === JSON.stringify(wantLegend),
        lang + ': ' + item.id + ' legend uses the JSON series labels', JSON.stringify(figure.legend));
    }
    check(figure.rects.length === expected.length,
      lang + ': ' + item.id + ' draws one bar per charted value',
      figure.rects.length + ' of ' + expected.length);
    check(figure.whiskers.length === expected.length,
      lang + ': ' + item.id + ' draws a 95% CI whisker per bar',
      figure.whiskers.length + ' of ' + expected.length);

    expected.forEach((want, index) => {
      const bar = figure.rects[index] || {};
      const whisker = figure.whiskers[index] || '';
      check(bar.series === want.segment.series && Number(bar.value) === want.segment.value,
        lang + ': ' + item.id + ' bar ' + (index + 1) + ' is ' + want.segment.value + '%',
        bar.series + ' ' + bar.value);
      check(whisker === want.segment.ci95[0] + '|' + want.segment.ci95[1],
        lang + ': ' + item.id + ' whisker ' + (index + 1) + ' is its JSON CI', whisker);
    });

    /* Table rows are grouped by series when there is more than one. */
    const tableOrder = [];
    if (chart.series.length > 1) {
      chart.series.forEach((series) => {
        chart.rows.forEach((row, rowIndex) => {
          const segment = row.segments.find((candidate) => candidate.series === series.key);
          if (segment) tableOrder.push({ rowIndex, row, segment });
        });
      });
    } else {
      chart.rows.forEach((row, rowIndex) => tableOrder.push({ rowIndex, row, segment: row.segments[0] }));
    }
    check(figure.tableRows.length === tableOrder.length,
      lang + ': ' + item.id + ' table lists every charted value',
      figure.tableRows.length + ' of ' + tableOrder.length);
    tableOrder.forEach((want, index) => {
      const got = figure.tableRows[index] || {};
      const ci = want.segment.ci95;
      check(got.row === String(want.rowIndex) && got.series === want.segment.series,
        lang + ': ' + item.id + ' table row ' + (index + 1) + ' is the right segment',
        got.row + '/' + got.series);
      check(got.label === groupLabel(want.row, lang, pageLabels),
        lang + ': ' + item.id + ' table row ' + (index + 1) + ' label', got.label);
      check(got.value === pctText(want.segment.value, locale) && Number(got.rawValue) === want.segment.value,
        lang + ': ' + item.id + ' table value ' + (index + 1), got.value);
      check(got.count === countText(want.segment.numerator, want.segment.denominator, locale),
        lang + ': ' + item.id + ' table n / N ' + (index + 1), got.count);
      check(got.ci === rangeText(ci[0], ci[1], locale) && got.rawCi === ci[0] + '|' + ci[1],
        lang + ': ' + item.id + ' table CI ' + (index + 1), got.ci);
    });
    check(figure.caption.indexOf(chart.title[lang] || chart.title.en) !== -1,
      lang + ': ' + item.id + ' table caption names the chart', figure.caption);
  }

  check(errors.length === 0, lang + ': no console or page errors', errors.join(' | ').slice(0, 300));
  await context.close();
}

async function main() {
  checkKpis();
  checkCharts();
  checkMarkup();

  const browser = await chromium.launch();
  try {
    for (const lang of ['en', 'de']) await checkPage(browser, lang);
  } finally {
    await browser.close();
  }

  check(!JSON.stringify(results).includes('"mock"'), 'results.json carries no mock flag');
  check(!JSON.stringify(examples).includes('"mock"'), 'examples.json carries no mock flag');

  if (failures) {
    console.error('\nassert-numbers: ' + failures + ' check(s) failed');
    process.exit(1);
  }
  console.log('\nassert-numbers: every KPI and every charted value equals its JSON');
}

main().catch((error) => {
  console.error('assert-numbers: ' + error.message);
  process.exit(1);
});
