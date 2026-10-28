/* AI Privacy Filter — small SVG bar charts, drawn by hand.
   One chart object from data/charts/*.json becomes a figure with a title,
   a legend, grouped horizontal bars, 95% CI whiskers and a data table.
   No chart library, no CDN, no network request: plain DOM and SVG.
   Colours are the Okabe-Ito colour-blind-safe palette, with a lighter set for
   the dark theme (see --chart-1..3 in page.css). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AIPF_CHARTS = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var MIN_WIDTH = 260;
  var AXIS_H = 27;
  var RIGHT_GUTTER = 48;
  var GROUP_GAP = 10;
  var LABEL_H = 25;
  var BAR_H_SINGLE = 18;
  var BAR_H_GROUP = 11;
  var BAR_GAP = 7;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(value) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : 0;
  }
  function digits(value, digitsWanted, locale) {
    return Number(value).toLocaleString(locale || 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digitsWanted == null ? 1 : digitsWanted
    });
  }
  function pctText(value, locale) { return digits(value, 1, locale) + '%'; }
  function rangeText(low, high, locale) {
    return digits(low, 1, locale) + '–' + digits(high, 1, locale) + '%';
  }
  function countText(n, total, locale) {
    return digits(n, 0, locale) + ' / ' + digits(total, 0, locale);
  }
  function colour(index) { return 'var(--chart-' + ((index % 3) + 1) + ')'; }

  function seriesIndex(chart, key) {
    for (var i = 0; i < chart.series.length; i += 1) {
      if (chart.series[i].key === key) return i;
    }
    return 0;
  }
  function groupLabel(row, opts) {
    var text = row.label && (row.label[opts.lang] || row.label.en);
    if (!text) return '';
    /* Type codes (PERSON, ADDRESS_STREET, …) already have a localised name. */
    if (opts.t && /^[A-Z_]+$/.test(text)) {
      var translated = opts.t('type.' + text);
      if (translated && translated !== 'type.' + text) return translated;
    }
    return text;
  }
  function chartTitle(chart, opts) {
    return (chart.title && (chart.title[opts.lang] || chart.title.en)) || chart.id;
  }
  function seriesLabel(chart, key, opts) {
    for (var i = 0; i < chart.series.length; i += 1) {
      if (chart.series[i].key === key) {
        var label = chart.series[i].label;
        return (label && (label[opts.lang] || label.en)) || key;
      }
    }
    return key;
  }

  /* ---------- table ---------- */
  function tableMarkup(chart, opts) {
    var title = chartTitle(chart, opts);
    var multi = chart.series && chart.series.length > 1;
    var head = '<thead><tr>' +
      '<th scope="col">' + esc(opts.t('chart.th.group')) + '</th>' +
      '<th scope="col" class="num">' + esc(opts.t('chart.th.value')) + '</th>' +
      '<th scope="col" class="num">' + esc(opts.t('chart.th.count')) + '</th>' +
      '<th scope="col" class="num">' + esc(opts.t('chart.th.ci')) + '</th>' +
      '</tr></thead>';

    function rowMarkup(row, rowIndex, seriesKey) {
      var segment = null;
      row.segments.forEach(function (item) { if (item.series === seriesKey) segment = item; });
      if (!segment) return '';
      var ci = segment.ci95 || [];
      var text = (ci.length === 2)
        ? rangeText(ci[0], ci[1], opts.locale)
        : opts.t('common.dash');
      return '<tr data-row="' + rowIndex + '" data-series="' + esc(segment.series) + '">' +
        '<th scope="row">' + esc(groupLabel(row, opts)) + '</th>' +
        '<td class="num" data-value="' + esc(segment.value) + '">' + esc(pctText(segment.value, opts.locale)) + '</td>' +
        '<td class="num" data-n="' + esc(segment.numerator) + '" data-total="' + esc(segment.denominator) + '">' +
          esc(countText(segment.numerator, segment.denominator, opts.locale)) + '</td>' +
        '<td class="num" data-ci="' + esc(ci[0]) + '|' + esc(ci[1]) + '">' + esc(text) + '</td>' +
        '</tr>';
    }

    var body = '';
    if (multi) {
      chart.series.forEach(function (series) {
        var rows = chart.rows.map(function (row, index) {
          return rowMarkup(row, index, series.key);
        }).join('');
        if (!rows) return;
        body += '<tr class="chart-table-series"><th scope="colgroup" colspan="4">' +
          esc(seriesLabel(chart, series.key, opts)) + '</th></tr>' + rows;
      });
    } else {
      body = chart.rows.map(function (row, index) {
        return rowMarkup(row, index, row.segments[0].series);
      }).join('');
    }

    return '<div class="chart-table-wrap">' +
      '<table class="chart-table" data-chart-table="' + esc(chart.id) + '">' +
      '<caption>' + esc(opts.tf('chart.table.caption', { title: title })) + '</caption>' +
      head + '<tbody>' + body + '</tbody></table></div>';
  }

  /* ---------- svg ---------- */
  function svgMarkup(chart, opts, width) {
    var wide = width >= MIN_WIDTH ? width : MIN_WIDTH;
    var plotW = Math.max(80, wide - RIGHT_GUTTER);
    var titleId = 'chart-title-' + chart.id;
    var descId = 'chart-desc-' + chart.id;
    var cursor = AXIS_H;
    var groups = [];

    chart.rows.forEach(function (row) {
      var bars = row.segments.length;
      var heights = bars > 1 ? BAR_H_GROUP : BAR_H_SINGLE;
      var gap = bars > 1 ? BAR_GAP : 0;
      var height = LABEL_H + bars * heights + Math.max(0, bars - 1) * gap + GROUP_GAP;
      groups.push({ row: row, top: cursor, height: height, bars: bars, barH: heights, gap: gap });
      cursor += height;
    });

    var height = Math.round(cursor + 2);
    var parts = [];
    parts.push('<svg role="img" aria-labelledby="' + titleId + ' ' + descId + '" ' +
      'viewBox="0 0 ' + wide + ' ' + height + '" width="' + wide + '" height="' + height + '">');
    parts.push('<title id="' + titleId + '">' + esc(chartTitle(chart, opts)) + '</title>');
    parts.push('<desc id="' + descId + '">' + esc(opts.t('chart.desc')) + '</desc>');

    /* axis: 0, 25, 50, 75, 100 % */
    [0, 25, 50, 75, 100].forEach(function (tick) {
      var x = Math.round((tick / 100) * plotW) + 0.5;
      parts.push('<line class="ch-grid" x1="' + x + '" y1="' + (AXIS_H - 6) + '" x2="' + x + '" y2="' + (height - 2) + '"/>');
      var anchor = tick === 0 ? 'start' : (tick === 100 ? 'end' : 'middle');
      parts.push('<text class="ch-axis" x="' + x + '" y="11" text-anchor="' + anchor + '">' + tick + '%</text>');
    });

    groups.forEach(function (group) {
      var row = group.row;
      var label = groupLabel(row, opts);
      var barTop = group.top + LABEL_H;
      parts.push('<text class="ch-group" x="0" y="' + Math.round(group.top + 11) + '">' + esc(label) + '</text>');

      row.segments.forEach(function (segment, index) {
        var y = barTop + index * (group.barH + group.gap);
        var value = Math.max(0, Math.min(100, num(segment.value)));
        /* A measured 0% is an empty bar, not a stub: the CI whisker still shows. */
        var barW = value > 0 ? Math.max(1.5, (value / 100) * plotW) : 0;
        var mid = y + group.barH / 2;
        var ci = segment.ci95 || [];

        parts.push('<rect class="ch-bar" data-series="' + esc(segment.series) + '" data-value="' +
          esc(segment.value) + '" x="0" y="' + y + '" width="' + barW.toFixed(2) + '" height="' +
          group.barH + '" rx="3" fill="' + colour(seriesIndex(chart, segment.series)) + '">' +
          '<title>' + esc(label + ' — ' + seriesLabel(chart, segment.series, opts) + ': ' +
            pctText(segment.value, opts.locale) + (ci.length === 2 ? ', 95% CI ' + rangeText(ci[0], ci[1], opts.locale) : '')) +
          '</title></rect>');

        if (ci.length === 2) {
          var x1 = Math.max(0, Math.min(plotW, (num(ci[0]) / 100) * plotW));
          var x2 = Math.max(0, Math.min(plotW, (num(ci[1]) / 100) * plotW));
          var lo = Math.min(x1, x2);
          var hi = Math.max(x1, x2);
          /* One thin line with small end caps, drawn on top of the solid bar.
             No background-coloured halo: that halo cut a pale, outlined-looking
             segment out of the bar between the lower CI bound and the value. */
          var cap = Math.min(5, group.barH / 2);
          parts.push('<g class="ch-ci" data-ci="' + esc(ci[0]) + '|' + esc(ci[1]) + '">' +
            '<line class="ch-ci-line" x1="' + lo + '" y1="' + mid + '" x2="' + hi + '" y2="' + mid + '"/>' +
            '<line class="ch-ci-line" x1="' + lo + '" y1="' + (mid - cap) + '" x2="' + lo + '" y2="' + (mid + cap) + '"/>' +
            '<line class="ch-ci-line" x1="' + hi + '" y1="' + (mid - cap) + '" x2="' + hi + '" y2="' + (mid + cap) + '"/>' +
            '</g>');
        }
        parts.push('<text class="ch-value" x="' + (wide - 1) + '" y="' + (mid + 3.5) + '" text-anchor="end">' +
          esc(pctText(segment.value, opts.locale)) + '</text>');
      });
    });

    parts.push('<line class="ch-baseline" x1="0.5" y1="' + (AXIS_H - 6) + '" x2="0.5" y2="' + (height - 2) + '"/>');
    parts.push('</svg>');
    return { markup: parts.join(''), width: wide, height: height };
  }

  function legendMarkup(chart, opts) {
    if (!chart.series || chart.series.length < 2) return '';
    return '<div class="chart-legend" role="list" aria-label="' + esc(opts.t('chart.legend')) + '">' +
      chart.series.map(function (series) {
        return '<span class="chart-legend-item" role="listitem">' +
          '<span class="chart-swatch" aria-hidden="true" style="background:' + colour(seriesIndex(chart, series.key)) + '"></span>' +
          esc(seriesLabel(chart, series.key, opts)) + '</span>';
      }).join('') + '</div>';
  }

  function shellMarkup(chart, opts) {
    var title = chartTitle(chart, opts);
    return '<figcaption class="chart-head">' +
      '<h3 id="chart-heading-' + esc(chart.id) + '">' + esc(title) + '</h3>' +
      '<p class="chart-note">' + esc(opts.t('chart.note')) + '</p>' +
      '</figcaption>' +
      legendMarkup(chart, opts) +
      '<div class="chart-plot"></div>' +
      tableMarkup(chart, opts);
  }

  function mount(container, chart, opts) {
    if (!container || !chart || !chart.rows) return false;
    if (container._aipfChart && container._aipfChart.disconnect) container._aipfChart.disconnect();
    if ((' ' + container.className + ' ').indexOf(' chart-card ') === -1) {
      container.className = ('chart-card ' + container.className).trim();
    }
    container.setAttribute('data-chart', chart.id);
    container.innerHTML = shellMarkup(chart, opts);

    var plot = container.querySelector('.chart-plot');
    var lastWidth = 0;
    var draw = function () {
      var width = Math.round(plot.clientWidth || container.clientWidth || 0);
      if (width < MIN_WIDTH) width = MIN_WIDTH;
      if (width === lastWidth) return;
      lastWidth = width;
      var svg = svgMarkup(chart, opts, width);
      plot.innerHTML = svg.markup;
    };
    draw();

    var observer = null;
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(function () { draw(); });
      observer.observe(plot);
    } else {
      window.addEventListener('resize', draw);
    }
    container._aipfChart = {
      disconnect: function () {
        if (observer) observer.disconnect();
        else window.removeEventListener('resize', draw);
      }
    };
    return true;
  }

  return {
    mount: mount,
    digits: digits,
    pctText: pctText,
    rangeText: rangeText,
    countText: countText,
    /* Exposed for the assertion script, which checks the data the page uses. */
    seriesIndex: seriesIndex
  };
}));
