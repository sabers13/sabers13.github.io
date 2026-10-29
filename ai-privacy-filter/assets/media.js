/* Image-only overview carousel and a gesture-driven native image viewer. */
(function () {
  'use strict';
  var dialog = document.getElementById('media-viewer');
  var stage = document.getElementById('media-stage');
  var canvas = document.getElementById('media-canvas');
  var track = document.querySelector('.media-track');
  var slides = Array.from(track.querySelectorAll('[data-media]'));
  var opener, naturalWidth, naturalHeight, zoom, x, y, gesture, lastTap;
  var pointers = new Map();
  var moved = false;
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

  // Native touch/trackpad scrolling, with mouse dragging and keyboard equivalents.
  var swipe, suppressClick = false;
  track.addEventListener('keydown', function (event) {
    var current = slides.indexOf(document.activeElement), next;
    if (event.key === 'ArrowRight') next = Math.min(slides.length - 1, current + 1);
    else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = slides.length - 1;
    else return;
    event.preventDefault();
    slides[next].focus({ preventScroll: true });
    track.scrollTo({ left: slides[next].offsetLeft - slides[0].offsetLeft, behavior: 'instant' });
  });
  track.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    swipe = { x: event.clientX, left: track.scrollLeft, id: event.pointerId };
    suppressClick = false;
  });
  track.addEventListener('pointermove', function (event) {
    if (!swipe) return;
    if (Math.abs(event.clientX - swipe.x) > 8) {
      suppressClick = true;
      track.setPointerCapture(swipe.id);
      track.style.scrollSnapType = 'none';
      track.scrollLeft = swipe.left + swipe.x - event.clientX;
    }
  });
  function endSwipe() {
    if (!swipe) return;
    swipe = null;
    track.style.scrollSnapType = '';
  }
  track.addEventListener('pointerup', endSwipe);
  track.addEventListener('pointercancel', endSwipe);
  track.addEventListener('lostpointercapture', endSwipe);
  // Capture phase prevents opening a slide at the end of a mouse drag.
  track.addEventListener('click', function (event) {
    if (!suppressClick) return;
    event.preventDefault(); event.stopPropagation(); suppressClick = false;
  }, true);
  slides.forEach(function (slide) {
    slide.addEventListener('focus', function () {
      track.scrollTo({ left: slide.offsetLeft - slides[0].offsetLeft, behavior: 'instant' });
    });
  });

  function fitScale() {
    return Math.min(1, (stage.clientWidth - 32) / naturalWidth, (stage.clientHeight - 32) / naturalHeight);
  }
  function render() {
    var width = naturalWidth * zoom, height = naturalHeight * zoom;
    x = width <= stage.clientWidth - 32 ? (stage.clientWidth - width) / 2 : Math.max(stage.clientWidth - width - 16, Math.min(16, x));
    y = height <= stage.clientHeight - 32 ? (stage.clientHeight - height) / 2 : Math.max(stage.clientHeight - height - 16, Math.min(16, y));
    canvas.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + zoom + ')';
    stage.classList.toggle('is-zoomed', zoom > fitScale() + .001);
  }
  function setZoom(value, point) {
    point = point || { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
    var next = Math.max(fitScale(), Math.min(3, value));
    x = point.x - (point.x - x) * next / zoom;
    y = point.y - (point.y - y) * next / zoom;
    zoom = next;
    render();
  }
  function fit() { zoom = fitScale(); x = y = 0; render(); }
  function localPoint(event) {
    var rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  document.querySelectorAll('[data-media]').forEach(function (button) {
    button.addEventListener('click', function () {
      opener = button;
      var pipeline = button.dataset.media === 'pipeline';
      var media = pipeline ? pipelineCopy('media-', window.matchMedia('(max-width: 620px)').matches) : document.querySelector('#workflow .shot-canvas img').cloneNode(false);
      if (!pipeline) { media.removeAttribute('loading'); media.draggable = false; }
      naturalWidth = pipeline ? media.viewBox.baseVal.width : media.width;
      naturalHeight = pipeline ? media.viewBox.baseVal.height : media.height;
      canvas.replaceChildren(media);
      canvas.style.width = naturalWidth + 'px'; canvas.style.height = naturalHeight + 'px';
      var title = document.getElementById('media-title');
      title.dataset.i18n = pipeline ? 'how.title' : 'overview.workflow.title';
      title.textContent = t(title.dataset.i18n);
      dialog.showModal();
      document.documentElement.classList.add('media-open');
      lastTap = null; moved = false; fit(); stage.focus({ preventScroll: true });
    });
  });
  document.getElementById('media-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('media-open');
    pointers.clear(); gesture = null; stage.classList.remove('is-panning');
    opener.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', function (event) {
    if (moved) { moved = false; return; }
    var rect = canvas.getBoundingClientRect();
    var outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (event.target === dialog || (event.target === stage && outside)) dialog.close();
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      (document.activeElement === stage ? document.getElementById('media-close') : stage).focus();
    } else if (event.key === '+' || event.key === '=') { setZoom(zoom * 1.5); event.preventDefault(); }
    else if (event.key === '-') { setZoom(zoom / 1.5); event.preventDefault(); }
    else if (event.key === '0') { fit(); event.preventDefault(); }
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      x += event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0;
      y += event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0;
      render(); event.preventDefault();
    }
  });
  stage.addEventListener('wheel', function (event) {
    event.preventDefault();
    var delta = event.deltaY || event.deltaX;
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= stage.clientHeight;
    setZoom(zoom * Math.exp(-delta * (event.ctrlKey ? .01 : .002)), localPoint(event));
  }, { passive: false });
  function startGesture() {
    var points = Array.from(pointers.values());
    if (points.length >= 2) {
      var a = points[0], b = points[1];
      gesture = { zoom: zoom, distance: Math.hypot(a.x - b.x, a.y - b.y), worldX: ((a.x + b.x) / 2 - x) / zoom, worldY: ((a.y + b.y) / 2 - y) / zoom };
      moved = true; lastTap = null;
    } else if (points.length) gesture = { point: points[0], x: x, y: y };
    else gesture = null;
  }
  stage.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!pointers.size) moved = false;
    pointers.set(event.pointerId, localPoint(event));
    stage.setPointerCapture(event.pointerId);
    startGesture();
  });
  stage.addEventListener('pointermove', function (event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, localPoint(event));
    var points = Array.from(pointers.values());
    if (points.length >= 2 && gesture.distance) {
      var a = points[0], b = points[1];
      zoom = Math.max(fitScale(), Math.min(3, gesture.zoom * Math.hypot(a.x - b.x, a.y - b.y) / gesture.distance));
      x = (a.x + b.x) / 2 - gesture.worldX * zoom;
      y = (a.y + b.y) / 2 - gesture.worldY * zoom;
      render();
    } else if (gesture && gesture.point) {
      var dx = points[0].x - gesture.point.x, dy = points[0].y - gesture.point.y;
      if (Math.hypot(dx, dy) > 5) moved = true;
      x = gesture.x + dx; y = gesture.y + dy; render();
    }
    stage.classList.toggle('is-panning', moved);
  });
  function endPointer(event) {
    if (!pointers.has(event.pointerId)) return;
    if (!moved && event.type === 'pointerup') {
      var point = localPoint(event), now = Date.now();
      if (lastTap && now - lastTap.time < 350 && Math.hypot(point.x - lastTap.x, point.y - lastTap.y) < 24) {
        if (zoom > fitScale() + .001) fit(); else setZoom(Math.max(1, zoom * 2), point);
        lastTap = null;
      } else lastTap = { x: point.x, y: point.y, time: now };
    }
    pointers.delete(event.pointerId); startGesture();
    if (!pointers.size) stage.classList.remove('is-panning');
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('lostpointercapture', endPointer);
  window.addEventListener('resize', function () { if (dialog.open) fit(); });
})();
