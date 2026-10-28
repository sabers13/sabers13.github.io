/* Compact overview copies share the original evidence and a native zoom dialog. */
(function () {
  'use strict';
  var dialog = document.getElementById('media-viewer');
  var stage = document.getElementById('media-stage');
  var canvas = document.getElementById('media-canvas');
  var zoomIn = document.getElementById('media-in');
  var zoomOut = document.getElementById('media-out');
  var opener, naturalWidth, naturalHeight, zoom, fitted, drag;
  var t = function (key) { return window.AIPF_I18N.t(key); };

  function pipelineCopy(prefix, vertical) {
    var svg = document.querySelector(vertical ? '#how .how-v' : '#how .how-h').cloneNode(true);
    var ids = {};
    svg.querySelectorAll('[id]').forEach(function (el) {
      ids[el.id] = prefix + el.id;
      el.id = ids[el.id];
    });
    svg.setAttribute('aria-labelledby', ids[svg.getAttribute('aria-labelledby')]);
    svg.querySelectorAll('[marker-end]').forEach(function (el) {
      el.setAttribute('marker-end', el.getAttribute('marker-end').replace(/url\(#([^)]+)\)/g, function (_, id) { return 'url(#' + ids[id] + ')'; }));
    });
    svg.setAttribute('class', 'pipeline-copy');
    return svg;
  }

  var thumbnail = pipelineCopy('overview-');
  thumbnail.setAttribute('aria-hidden', 'true');
  document.getElementById('overview-pipeline').appendChild(thumbnail);

  function fitScale() {
    return Math.min(1, Math.max(1, stage.clientWidth - 32) / naturalWidth, Math.max(1, stage.clientHeight - 32) / naturalHeight);
  }
  function setZoom(value, fit) {
    var width = canvas.getBoundingClientRect().width;
    var centerX = width ? (stage.scrollLeft + stage.clientWidth / 2) / width : 0;
    var centerY = width ? (stage.scrollTop + stage.clientHeight / 2) / width : 0;
    zoom = Math.max(fitScale(), Math.min(3, value));
    fitted = fit;
    canvas.style.width = naturalWidth * zoom + 'px';
    document.getElementById('media-scale').value = new Intl.NumberFormat(document.documentElement.lang, { style: 'percent', maximumFractionDigits: 0 }).format(zoom);
    var focused = document.activeElement;
    zoomOut.disabled = zoom <= fitScale() + .001;
    zoomIn.disabled = zoom >= 3;
    if (focused === zoomOut && zoomOut.disabled) zoomIn.focus({ preventScroll: true });
    if (focused === zoomIn && zoomIn.disabled) zoomOut.focus({ preventScroll: true });
    stage.classList.toggle('is-zoomed', zoom > fitScale() + .001);
    stage.scrollLeft = fit ? 0 : centerX * naturalWidth * zoom - stage.clientWidth / 2;
    stage.scrollTop = fit ? 0 : centerY * naturalWidth * zoom - stage.clientHeight / 2;
  }
  function fit() { setZoom(fitScale(), true); }
  function label(id, key) {
    var el = document.getElementById(id);
    el.dataset.i18n = key;
    el.textContent = t(key);
  }

  document.querySelectorAll('[data-media]').forEach(function (button) {
    button.addEventListener('click', function () {
      opener = button;
      var pipeline = button.dataset.media === 'pipeline';
      var media = pipeline ? pipelineCopy('media-', window.matchMedia('(max-width: 620px)').matches) : document.querySelector('#workflow .shot-canvas img').cloneNode(false);
      if (!pipeline) {
        media.removeAttribute('loading');
        media.draggable = false;
      }
      naturalWidth = pipeline ? media.viewBox.baseVal.width : media.width;
      naturalHeight = pipeline ? media.viewBox.baseVal.height : media.height;
      canvas.replaceChildren(media);
      label('media-title', pipeline ? 'how.title' : 'overview.workflow.title');
      label('media-caption', pipeline ? 'how.note' : 'workflow.caption');
      dialog.showModal();
      document.documentElement.classList.add('media-open');
      fit();
    });
  });
  zoomIn.addEventListener('click', function () { setZoom(zoom * 1.5, false); });
  zoomOut.addEventListener('click', function () { setZoom(zoom / 1.5, false); });
  document.getElementById('media-fit').addEventListener('click', fit);
  document.getElementById('media-original').addEventListener('click', function () { setZoom(1, false); });
  document.getElementById('media-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('media-open');
    drag = null;
    stage.classList.remove('is-panning');
    opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') {
      var controls = Array.prototype.slice.call(dialog.querySelectorAll('button:not(:disabled), [tabindex="0"]'));
      var first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === '+' || event.key === '=') setZoom(zoom * 1.5, false);
    else if (event.key === '-') setZoom(zoom / 1.5, false);
    else if (event.key === '0') fit();
    else return;
    event.preventDefault();
  });
  window.addEventListener('resize', function () {
    if (dialog.open) setZoom(fitted ? fitScale() : zoom, fitted);
  });
  stage.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || zoom <= fitScale() + .001) return;
    drag = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.focus({ preventScroll: true });
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-panning');
    event.preventDefault();
  });
  stage.addEventListener('pointermove', function (event) {
    if (!drag) return;
    stage.scrollLeft = drag.left + drag.x - event.clientX;
    stage.scrollTop = drag.top + drag.y - event.clientY;
  });
  stage.addEventListener('lostpointercapture', function () {
    drag = null;
    stage.classList.remove('is-panning');
  });
})();
