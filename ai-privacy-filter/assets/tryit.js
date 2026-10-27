/* AI Privacy Filter — simplified in-browser demo.
   This file performs every check locally. It contains no fetch, XHR,
   WebSocket or beacon call, and it never sends the textarea anywhere.
   Checks: email, German phone, IBAN with mod-97 checksum, postcode + city,
   street + number, URL, German first names and salutation cues. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var T = function (k) { return window.AIPF_I18N ? window.AIPF_I18N.t(k) : k; };
  var TF = function (k, v) { return window.AIPF_I18N ? window.AIPF_I18N.tf(k, v) : k; };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return s.toLowerCase().replace(/\s+/g, ' ').trim(); }
  function phMarked(text) {
    return esc(text).replace(/(\[[A-Z_]+_\d+\])/g, '<mark class="ph">$1</mark>');
  }

  var NAMES_RE = null;
  try {
    if (window.AIPF_FIRST_NAMES_DE && window.AIPF_FIRST_NAMES_DE.length) {
      var names = window.AIPF_FIRST_NAMES_DE.slice().sort(function (a, b) { return b.length - a.length; });
      var alt = names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
      NAMES_RE = new RegExp('(?<![\\p{L}])(?:' + alt + ')(?:[ \\t]+[A-ZÄÖÜ][\\p{L}·\\-]+)?(?![\\p{L}])', 'gu');
    }
  } catch (e) { NAMES_RE = null; }

  var SALUTATION_RE = /\b(?:(?:Herrn?|Frau)\s+(?:(?:Dr|Prof)\.\s*){0,2}|(?:(?:Dr|Prof)\.\s*){1,2})([A-ZÄÖÜ][\p{L}\-]*(?:\s+(?:von|van|de|zu|der|den)\s+[A-ZÄÖÜ][\p{L}\-]*)?(?:\s+[A-ZÄÖÜ][\p{L}\-]*){0,2})/gu;
  var EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
  var URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi;
  var IBAN_RE = /\bDE\d{2}(?:[ ]?\d{4}){4}[ ]?\d{2}\b/g;
  var PHONE_RE = /(?:\+49|0049|\(?0)[\s\-/]?(?:\(?\d{1,5}\)?[\s\-/]?)?\d(?:[\d\s\-/]{3,}\d)/g;
  var STREET_RE = /\b[A-ZÄÖÜ][\p{L}.\-]*(?:straße|strasse|Straße|Strasse|str\.|Str\.|weg|Weg|allee|Allee|platz|Platz|gasse|Gasse|ring|Ring|damm|Damm|ufer|Ufer|graben|Graben|hof|Hof|steig|Steig|chaussee|Chaussee)[ \t]+\d+[a-zA-Z]?\b/gu;
  var CITY_RE = /\b\d{5}[ \t]+[A-ZÄÖÜ][\p{L}.\-]+(?:[ \t]+(?:am|an|der|im|in|ob|bei)[ \t]+[A-ZÄÖÜ][\p{L}.\-]+|[ \t]+[A-ZÄÖÜ][\p{L}.\-]+)?(?!\d)/gu;

  function validIBAN(raw) {
    var v = String(raw).replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return false;
    if (!/^DE\d{20}$/.test(v)) return false;
    var rearranged = v.slice(4) + v.slice(0, 4);
    var rem = 0;
    for (var i = 0; i < rearranged.length; i++) {
      var ch = rearranged.charAt(i);
      var digits = /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
      for (var j = 0; j < digits.length; j++) rem = (rem * 10 + Number(digits.charAt(j))) % 97;
    }
    return rem === 1;
  }

  function redact(text) {
    var used = new Array(text.length);
    var spans = [];
    function take(type, start, end) {
      if (start < 0 || end > text.length || end <= start) return false;
      for (var i = start; i < end; i++) if (used[i]) return false;
      for (var j = start; j < end; j++) used[j] = true;
      spans.push({ type: type, start: start, end: end });
      return true;
    }
    function sweep(re, type, validate) {
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(text)) !== null) {
        if (m[0].length === 0) { re.lastIndex++; continue; }
        var value = m[0];
        if (validate && !validate(value)) continue;
        take(type, m.index, m.index + value.length);
      }
    }

    /* URIs and codes first so emails/phones inside them are not split. */
    sweep(URL_RE, 'URL');
    /* Reserve IBAN-shaped runs even when the checksum fails, so a phone-like
       fragment inside them is never treated as a phone number. */
    IBAN_RE.lastIndex = 0;
    var ib;
    while ((ib = IBAN_RE.exec(text)) !== null) {
      if (validIBAN(ib[0])) {
        take('IBAN', ib.index, ib.index + ib[0].length);
      } else {
        for (var u = ib.index; u < ib.index + ib[0].length; u++) used[u] = true;
      }
    }
    sweep(EMAIL_RE, 'EMAIL');
    /* Phone numbers need a real boundary: not a fragment of a longer number
       or a word. */
    PHONE_RE.lastIndex = 0;
    var pm;
    while ((pm = PHONE_RE.exec(text)) !== null) {
      var pv = pm[0], ps = pm.index, pe = ps + pv.length;
      var prev = ps > 0 ? text.charAt(ps - 1) : '';
      var next = pe < text.length ? text.charAt(pe) : '';
      if (/[0-9A-Za-zÄÖÜäöüß]/.test(prev) || /[0-9]/.test(next)) continue;
      var digits = pv.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 16) continue;
      take('PHONE', ps, pe);
    }
    sweep(STREET_RE, 'ADDRESS_STREET');
    sweep(CITY_RE, 'POSTCODE_CITY');

    /* Salutation cues first, then the Faker de_DE first-name list. */
    SALUTATION_RE.lastIndex = 0;
    var s;
    while ((s = SALUTATION_RE.exec(text)) !== null) {
      var name = s[1];
      var start = s.index + s[0].length - name.length;
      take('PERSON', start, start + name.length);
    }
    if (NAMES_RE) {
      NAMES_RE.lastIndex = 0;
      var n;
      while ((n = NAMES_RE.exec(text)) !== null) {
        take('PERSON', n.index, n.index + n[0].length);
      }
    }

    spans.sort(function (a, b) { return a.start - b.start || b.end - a.end; });

    var map = Object.create(null);
    var counts = Object.create(null);
    var replaced = [];
    var out = '';
    var pos = 0;
    spans.forEach(function (span) {
      out += text.slice(pos, span.start);
      var value = text.slice(span.start, span.end);
      var key = span.type + '|' + norm(value);
      if (!map[key]) {
        counts[span.type] = (counts[span.type] || 0) + 1;
        map[key] = '[' + span.type + '_' + counts[span.type] + ']';
      }
      out += map[key];
      if (replaced.indexOf(map[key]) === -1) replaced.push(map[key]);
      pos = span.end;
    });
    out += text.slice(pos);
    return { text: out, spans: spans, replaced: replaced, map: map };
  }

  var input = $('#try-input');
  var output = $('#try-output');
  var summary = $('#try-summary');
  var legend = $('#try-legend');
  var last = null;

  var FALLBACK = 'Sehr geehrte Frau Anna Weber,\n\n' +
    'bitte senden Sie mir ein Angebot an anna.weber@example.com oder rufen Sie mich unter 030 12345678 an. ' +
    'Meine Adresse: Lindenstraße 12, 10115 Berlin.\n\n' +
    'Mit freundlichen Grüßen\nThomas Berger';

  function render() {
    if (!output) return;
    if (!last) {
      output.classList.add('is-empty');
      output.removeAttribute('data-state');
      output.textContent = T('try.empty');
      if (summary) summary.textContent = '';
      if (legend) legend.innerHTML = '';
      return;
    }
    output.classList.remove('is-empty');
    output.dataset.state = 'filled';
    output.innerHTML = phMarked(last.text);
    if (!last.replaced.length) {
      if (summary) summary.textContent = T('try.none');
      if (legend) legend.innerHTML = '';
      return;
    }
    if (summary) summary.textContent = TF('try.found', { n: last.replaced.length });
    if (legend) {
      legend.innerHTML = '<span class="chip chip-accent">' + esc(T('try.replaced')) + '</span>' +
        last.replaced.map(function (ph) {
          var type = ph.replace(/^\[|\_\d+\]$/g, '');
          return '<span class="chip" title="' + esc(T('type.' + type)) + '">' + esc(ph) + '</span>';
        }).join('');
    }
  }

  function run() {
    if (!input) return;
    last = redact(input.value || '');
    render();
  }

  function clear() {
    if (input) input.value = '';
    last = null;
    render();
  }

  function sample() {
    if (!input) return;
    input.value = window.AIPF_SAMPLE || FALLBACK;
    run();
    input.focus();
  }

  if (input) {
    input.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
    });
  }
  var runBtn = $('#try-run');
  var sampleBtn = $('#try-sample');
  var clearBtn = $('#try-clear');
  if (runBtn) runBtn.addEventListener('click', run);
  if (sampleBtn) sampleBtn.addEventListener('click', sample);
  if (clearBtn) clearBtn.addEventListener('click', clear);

  window.AIPF_TRYIT = { run: run, clear: clear, sample: sample, refresh: render, redact: redact };
  render();
})();
