/* Interactive controls for Team AI Allowance:
   - Default light mode + LIVECell-style circular View Transition theme wipe
   - Sliding header tab indicator + scroll spy
   - LIVECell-style staggered .reveal, hero specimen callout reveal, count-up figures, and hatched simulation bars
   - AI Privacy Filter-style drag/swipe/keyboard carousels (#overview-track, #walkthrough-track, #console-track)
   - Gesture-driven native <dialog id="media-viewer"> with wheel/pinch zoom, drag pan, double-tap, and slide cycling
   Zero network calls. */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  var root = document.documentElement;
  root.classList.add('js');
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateQuery(key, value) {
    try {
      var url = new URL(location.href);
      if (
        value === null ||
        value === '' ||
        value === 'all' ||
        (key === 'step' && value === '1') ||
        (key === 'theme' && value === 'light')
      ) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
      history.replaceState(null, '', url);
    } catch (_e) {
      /* Ignore restricted history contexts */
    }
  }

  /* ==========================================================================
     1. Default Light Mode + Circular View Transition Wipe (from livecell-audit)
     ========================================================================== */
  function currentTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  var themeButtons = Array.from(document.querySelectorAll('[data-theme-set]'));

  function syncThemeButtons() {
    var active = currentTheme();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = active === 'dark' ? '#0b0d10' : '#f7f6f2';
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.themeSet === active));
    });
  }

  syncThemeButtons();

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      var next = button.dataset.themeSet === 'dark' ? 'dark' : 'light';
      if (next === currentTheme()) return;
      var apply = function () {
        root.dataset.theme = next;
        syncThemeButtons();
        updateQuery('theme', next);
      };
      if (!document.startViewTransition || motionQuery.matches) {
        apply();
        return;
      }
      var rect = button.getBoundingClientRect();
      var x = event.clientX || rect.left + rect.width / 2;
      var y = event.clientY || rect.top + rect.height / 2;
      var radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.startViewTransition(apply).ready.then(function () {
        root.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'
            ]
          },
          {
            duration: 600,
            easing: 'cubic-bezier(.65,0,.35,1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      }).catch(function () {});
    });
  });

  /* ==========================================================================
     2. Sliding Tab Indicator + Scroll Spy (from livecell-audit)
     ========================================================================== */
  var tabNav = document.getElementById('project-tabs');
  var navLinks = Array.from(document.querySelectorAll('.nav a, .utility-rail [data-sec-link]'));
  var headerLinks = tabNav ? Array.from(tabNav.querySelectorAll('a')) : [];
  var sectionIds = ['overview', 'walkthrough', 'evidence', 'method'];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function placeTabIndicator() {
    if (!tabNav || !headerLinks.length) return;
    var selected =
      headerLinks.find(function (link) {
        return link.getAttribute('aria-current') === 'location';
      }) || headerLinks[0];
    if (!selected) return;
    tabNav.style.setProperty('--indicator-x', selected.offsetLeft + 'px');
    tabNav.style.setProperty('--indicator-w', selected.offsetWidth + 'px');
  }

  if (tabNav) {
    var tabIndicator = document.createElement('span');
    tabIndicator.className = 'tab-indicator';
    tabIndicator.setAttribute('aria-hidden', 'true');
    tabNav.appendChild(tabIndicator);
    tabNav.classList.add('has-indicator');
    window.addEventListener('resize', placeTabIndicator);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(placeTabIndicator);
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        tabNav.classList.add('is-ready');
        placeTabIndicator();
      });
    });
  }

  function markNavigation() {
    if (!sections.length) return;
    var threshold =
      (parseInt(getComputedStyle(root).getPropertyValue('--header-offset'), 10) || 64) + 64;
    var active = sections[0];
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= threshold) active = sec;
    });
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + active.id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
    placeTabIndicator();
  }

  var scrollScheduled = false;
  window.addEventListener(
    'scroll',
    function () {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(function () {
        markNavigation();
        scrollScheduled = false;
      });
    },
    { passive: true }
  );
  window.addEventListener('hashchange', markNavigation);
  markNavigation();

  /* ==========================================================================
     3. LIVECell-style Motion: Staggered .reveal, Hero Specimen, Count-Up & Bars
     ========================================================================== */
  sections.forEach(function (section) {
    Array.from(section.querySelectorAll('.reveal')).forEach(function (node, index) {
      node.style.setProperty('--i', String(index));
    });
  });

  var heroSpecimen = document.getElementById('hero-specimen');
  if (heroSpecimen) {
    if (!motionQuery.matches) {
      heroSpecimen.classList.add('will-reveal');
      var heroImg = heroSpecimen.querySelector('img');
      var ready =
        heroImg && heroImg.decode
          ? heroImg.decode().catch(function () {})
          : Promise.resolve();
      ready.then(function () {
        requestAnimationFrame(function () {
          heroSpecimen.classList.remove('will-reveal');
          heroSpecimen.classList.add('is-revealed');
        });
      });
    }
  }

  var heroOverlayToggle = document.getElementById('toggle-hero-overlay');
  var heroOverlaySvg = document.getElementById('hero-overlay');
  if (heroOverlayToggle && heroOverlaySvg) {
    heroOverlayToggle.addEventListener('change', function () {
      heroOverlaySvg.toggleAttribute('hidden', !heroOverlayToggle.checked);
    });
  }

  function formatCount(node, value) {
    var digits = Number(node.dataset.decimals || 0);
    return (
      (node.dataset.prefix || '') +
      value.toLocaleString('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      }) +
      (node.dataset.suffix || '')
    );
  }

  function countUp(node) {
    if (node.dataset.counted === 'true') return;
    node.dataset.counted = 'true';
    var target = Number(node.dataset.count);
    if (!isFinite(target)) return;
    if (motionQuery.matches) {
      node.textContent = formatCount(node, target);
      return;
    }
    var start = performance.now();
    var duration = 850;
    (function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = formatCount(node, t < 1 ? Math.round(target * eased) : target);
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  var countNodes = Array.from(document.querySelectorAll('[data-count]'));
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    countNodes.forEach(function (node) {
      countObserver.observe(node);
    });
  } else {
    countNodes.forEach(countUp);
  }

  /* Hatched simulation bars & interactive layer filter */
  var simFocusButtons = Array.from(document.querySelectorAll('[data-sim-focus]'));
  var simRows = Array.from(document.querySelectorAll('[data-sim-layer]'));
  var simBars = Array.from(document.querySelectorAll('.bar-fill[data-pct]'));

  function setSimBarsToTarget() {
    simBars.forEach(function (bar) {
      var pct = Math.max(0, Math.min(100, Number(bar.dataset.pct) || 0));
      bar.style.width = pct + '%';
    });
  }

  if ('IntersectionObserver' in window && !motionQuery.matches) {
    simBars.forEach(function (bar) {
      bar.style.width = '0%';
    });
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            requestAnimationFrame(setSimBarsToTarget);
            barObserver.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    var simContainer = document.querySelector('.sim-bars');
    if (simContainer) barObserver.observe(simContainer);
    else setSimBarsToTarget();
  } else {
    setSimBarsToTarget();
  }

  simFocusButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var focus = btn.dataset.simFocus || 'all';
      simFocusButtons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      simRows.forEach(function (row) {
        var match = focus === 'all' || row.dataset.simLayer === focus;
        row.classList.toggle('is-dimmed', !match);
        row.classList.toggle('is-focused', focus !== 'all' && match);
      });
    });
  });

  /* ==========================================================================
     4. Clone Architecture Pipeline SVG into Overview Carousel (from ai-privacy-filter)
     ========================================================================== */
  function clonePipelineSvg(prefix) {
    var source = document.getElementById('arch-pipeline-svg');
    if (!source) return null;
    var svg = source.cloneNode(true);
    var ids = {};
    svg.querySelectorAll('[id]').forEach(function (el) {
      ids[el.id] = prefix + el.id;
      el.id = ids[el.id];
    });
    if (svg.id) {
      ids[source.id] = prefix + source.id;
      svg.id = ids[source.id];
    }
    var labelledBy = svg.getAttribute('aria-labelledby');
    if (labelledBy && ids[labelledBy]) {
      svg.setAttribute('aria-labelledby', ids[labelledBy]);
    }
    svg.querySelectorAll('[marker-end]').forEach(function (el) {
      el.setAttribute(
        'marker-end',
        el.getAttribute('marker-end').replace(/url\(#([^)]+)\)/g, function (_, id) {
          return 'url(#' + (ids[id] || id) + ')';
        })
      );
    });
    svg.setAttribute('class', 'pipeline-copy');
    return svg;
  }

  var overviewArchSlot = document.getElementById('overview-arch-slot');
  if (overviewArchSlot) {
    var archThumb = clonePipelineSvg('overview-');
    if (archThumb) {
      archThumb.setAttribute('aria-hidden', 'true');
      overviewArchSlot.appendChild(archThumb);
    }
  }

  /* ==========================================================================
     5. AI Privacy Filter-style Carousels (Drag, Swipe, Keyboard, Prev/Next)
     ========================================================================== */
  function initCarousel(track, options) {
    if (!track) return null;
    options = options || {};
    var slides = Array.from(track.children);
    if (!slides.length) return null;

    var statusEl = options.statusId ? document.getElementById(options.statusId) : null;
    var prevBtns = Array.from(
      document.querySelectorAll('[data-carousel-prev="' + track.id + '"]')
    );
    var nextBtns = Array.from(
      document.querySelectorAll('[data-carousel-next="' + track.id + '"]')
    );

    function activeIndex() {
      var trackRect = track.getBoundingClientRect();
      var center = trackRect.left + trackRect.width / 2;
      var bestIdx = 0;
      var bestDist = Infinity;
      slides.forEach(function (slide, idx) {
        var r = slide.getBoundingClientRect();
        var slideCenter = r.left + r.width / 2;
        var d = Math.abs(slideCenter - center);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = idx;
        }
      });
      return bestIdx;
    }

    function scrollToSlide(index, behavior) {
      var clamped = Math.max(0, Math.min(slides.length - 1, index));
      var target = slides[clamped];
      if (!target) return;
      var left = target.offsetLeft - slides[0].offsetLeft;
      track.scrollTo({
        left: left,
        behavior: behavior || (motionQuery.matches ? 'instant' : 'smooth')
      });
      updateStatus(clamped);
    }

    function updateStatus(forcedIndex) {
      var idx = typeof forcedIndex === 'number' ? forcedIndex : activeIndex();
      if (statusEl) {
        statusEl.textContent = idx + 1 + ' / ' + slides.length;
      }
      prevBtns.forEach(function (btn) {
        btn.disabled = idx <= 0;
      });
      nextBtns.forEach(function (btn) {
        btn.disabled = idx >= slides.length - 1;
      });
      if (options.onSlideChange) {
        options.onSlideChange(idx, slides[idx]);
      }
    }

    /* Keyboard navigation inside the carousel */
    track.addEventListener('keydown', function (event) {
      var focusedSlide = document.activeElement
        ? document.activeElement.closest('#' + track.id + ' > *')
        : null;
      var current = focusedSlide ? slides.indexOf(focusedSlide) : activeIndex();
      var next;
      if (event.key === 'ArrowRight') next = Math.min(slides.length - 1, current + 1);
      else if (event.key === 'ArrowLeft') next = Math.max(0, current - 1);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = slides.length - 1;
      else return;
      event.preventDefault();
      var focusTarget = slides[next].matches('button')
        ? slides[next]
        : slides[next].querySelector('button');
      if (focusTarget) focusTarget.focus({ preventScroll: true });
      scrollToSlide(next, 'instant');
    });

    /* Mouse pointer drag with click suppression (exact AI Privacy Filter pattern) */
    var swipe = null;
    var suppressClick = false;
    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      swipe = { x: event.clientX, left: track.scrollLeft, id: event.pointerId };
      suppressClick = false;
    });
    track.addEventListener('pointermove', function (event) {
      if (!swipe) return;
      if (Math.abs(event.clientX - swipe.x) > 8) {
        suppressClick = true;
        try {
          track.setPointerCapture(swipe.id);
        } catch (_e) {}
        track.style.scrollSnapType = 'none';
        track.scrollLeft = swipe.left + swipe.x - event.clientX;
      }
    });
    function endSwipe() {
      if (!swipe) return;
      swipe = null;
      track.style.scrollSnapType = '';
      updateStatus();
    }
    track.addEventListener('pointerup', endSwipe);
    track.addEventListener('pointercancel', endSwipe);
    track.addEventListener('lostpointercapture', endSwipe);
    track.addEventListener(
      'click',
      function (event) {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      },
      true
    );

    slides.forEach(function (slide, idx) {
      var focusable = slide.matches('button') ? slide : slide.querySelector('button');
      if (focusable) {
        focusable.addEventListener('focus', function () {
          scrollToSlide(idx, 'instant');
        });
      }
    });

    prevBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        scrollToSlide(activeIndex() - 1);
      });
    });
    nextBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        scrollToSlide(activeIndex() + 1);
      });
    });

    var scrollTick = false;
    track.addEventListener(
      'scroll',
      function () {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(function () {
          updateStatus();
          scrollTick = false;
        });
      },
      { passive: true }
    );

    updateStatus(0);
    return {
      scrollToSlide: scrollToSlide,
      activeIndex: activeIndex,
      slides: slides
    };
  }

  initCarousel(document.getElementById('overview-track'), {
    statusId: 'overview-carousel-status'
  });

  initCarousel(document.getElementById('console-track'), {
    statusId: 'console-carousel-status'
  });

  /* ==========================================================================
     6. Ten-Step Walkthrough Switcher + Walkthrough Carousel Sync
     ========================================================================== */
  var STEPS = [
    {
      id: '1',
      slideKey: '1',
      filter: 'budget',
      badge: 'Allowed · 200 OK',
      badgeClass: 'chip-ok',
      title: '1. Lena works inside budget',
      meta: 'Actor: Lena (Member) · Weekly budget: USD 20.00 · Spend: USD 7.20 (36%)',
      happened:
        'Lena runs her normal AI coding CLI against the team gateway on port 14000. Because her weekly spend (USD 7.20) is well below the 80% warning mark, the gateway forwards the request with zero extra prompts.',
      notice:
        'In the manager overview, Lena shows a healthy green status bar at 36% of her USD 20.00 weekly allowance.',
      src: 'shots/step-01-lena-works.png',
      width: 1280,
      height: 1548,
      alt: 'Team AI Allowance console showing Lena at USD 7.20 of her USD 20.00 weekly budget with green status.'
    },
    {
      id: '2',
      slideKey: '2',
      filter: 'budget',
      badge: 'Soft warning · 80%',
      badgeClass: 'chip-warn',
      title: '2. Soft warning at 80%',
      meta: 'Actor: Lena (Member) · Threshold: 80% (USD 16.00) · Spend: USD 16.40 (82%)',
      happened:
        'When Lena crosses 80% of her weekly allowance (USD 16.40 of USD 20.00), the watcher records a soft-threshold alert and sends a notification to the local mail and webhook catchers without interrupting her active terminal session.',
      notice:
        'Lena remains unblocked so she can wrap up her current task, while her status badge switches to a warning state.',
      src: 'shots/step-02-lena-soft.png',
      width: 1280,
      height: 1664,
      alt: 'Console showing Lena at 82% of her weekly budget after the 80% soft warning threshold triggered.'
    },
    {
      id: '3',
      slideKey: '3',
      filter: 'budget',
      badge: 'Hard stop · HTTP 422',
      badgeClass: 'chip-stop',
      title: '3. Hard stop at USD 21.00',
      meta: 'Actor: Lena (Member) · Hard cap: USD 20.00 + 5% grace (USD 21.00)',
      happened:
        'Once Lena reaches her USD 20.00 allowance plus the 5% grace buffer (USD 21.00), the gateway blocks the next model call with HTTP 422 and prints the exact terminal command to request a top-up.',
      notice:
        'The error message names the reason (budget reached) and gives Lena the next action directly in her terminal instead of a cryptic key failure.',
      src: 'shots/step-03-lena-hard.png',
      width: 1280,
      height: 1548,
      alt: 'Console showing Lena blocked at her hard budget limit with zero remaining allowance.'
    },
    {
      id: '4',
      slideKey: '4',
      filter: 'budget',
      badge: 'Request sent · MCP / CLI',
      badgeClass: 'chip',
      title: '4. Requesting USD 5.00 in CLI',
      meta: 'Actor: Lena (Member) · Requested: +USD 5.00 until Friday 18:00 · Reason: Finish release test suite',
      happened:
        'Without opening a browser or messaging app, Lena submits an extra-allowance request for USD 5.00 through the built-in MCP tool (allowance_request_more) or npx allowance request, explaining what she is finishing.',
      notice:
        'The request appears immediately at the top of the manager queue with Lena’s current spend, requested amount, expiry, and note.',
      src: 'shots/step-04-lena-request.png',
      width: 1280,
      height: 1132,
      alt: 'Requests queue showing Lena asking for USD 5.00 extra budget to finish the release test suite.'
    },
    {
      id: '5',
      slideKey: '5',
      filter: 'budget',
      badge: 'Partial approval · +USD 3.00',
      badgeClass: 'chip-ok',
      title: '5. Priya approves USD 3.00',
      meta: 'Actor: Priya (Manager) · Approved: +USD 3.00 temporary top-up · Expires: Friday 18:00',
      happened:
        'Team manager Priya reviews Lena’s request in the web console on port 18080, adjusts the approved amount from USD 5.00 to USD 3.00 with an expiry timestamp, and clicks Approve.',
      notice:
        'The console updates the LiteLLM key budget and writes an immutable audit event recording who requested, who approved, the original USD 5.00 ask, and the USD 3.00 grant.',
      src: 'shots/step-05-priya-partly.png',
      width: 1280,
      height: 1532,
      alt: 'Manager console showing Priya partially approving USD 3.00 on Lena’s USD 5.00 budget request.'
    },
    {
      id: '6',
      slideKey: '6',
      filter: 'budget',
      badge: 'Unblocked · Works again',
      badgeClass: 'chip-ok',
      title: '6. Lena continues in terminal',
      meta: 'Actor: Lena (Member) · Effective allowance: USD 23.00 · Key rotation: None needed',
      happened:
        'Lena re-runs her prompt in the same terminal window. Because the gateway updated her existing virtual key in place, her next AI call succeeds immediately without restarting her CLI or swapping credentials.',
      notice:
        'Her member view now shows the USD 20.00 base budget plus the active USD 3.00 temporary grant.',
      src: 'shots/step-06-lena-continues.png',
      width: 1280,
      height: 1548,
      alt: 'Console showing Lena active again with her USD 3.00 temporary budget grant applied.'
    },
    {
      id: '7',
      slideKey: '7',
      filter: 'model',
      badge: 'Denied · HTTP 403',
      badgeClass: 'chip-stop',
      title: '7. Omar denied restricted model',
      meta: 'Actor: Omar (Member) & Priya (Manager) · Blocked call: HTTP 403 model policy',
      happened:
        'Omar tries to run a frontier model outside his team’s approved model list. The gateway refuses the call with HTTP 403. Omar requests temporary access, and Priya denies the request with a note to use the standard team model.',
      notice:
        'Both the blocked call and Priya’s denial reason are recorded in the request history so expectations stay clear.',
      src: 'shots/step-07-omar-denied.png',
      width: 1280,
      height: 1220,
      alt: 'Request history showing Omar’s model access request denied by manager Priya with a written reason.'
    },
    {
      id: '8',
      slideKey: '8',
      filter: 'offhours',
      badge: 'Off-hours pause · Key blocked',
      badgeClass: 'chip-warn',
      title: '8. Jonas hits off-hours cap',
      meta: 'Actor: Jonas (Member) · Rule: Off-hours cap (USD 5.00 outside Mon–Fri 08:00–19:00)',
      happened:
        'Late in the evening, Jonas’s background session crosses the USD 5.00 off-hours spending cap. The watcher pauses his key so a forgotten loop cannot run all night, and Priya later grants an off-hours override when Jonas confirms he is working live.',
      notice:
        'Comparing the paused state (8a) and unblocked state (8b) in the carousel shows how off-hours rules protect evenings and weekends without locking out genuine late-shift work.',
      src: 'shots/step-08-jonas-offhours.png',
      width: 1280,
      height: 1771,
      alt: 'Console view showing Jonas paused by the off-hours spending cap and then unblocked.'
    },
    {
      id: '9',
      slideKey: '9',
      filter: 'audit',
      badge: 'Immutable log · 69 events',
      badgeClass: 'chip',
      title: '9. Chronological team audit log',
      meta: 'View: Audit log · Filterable by actor, member, event type, and date',
      happened:
        'The audit view records every threshold crossing, automatic key pause, member request, manager approval or denial, and policy change in chronological order.',
      notice:
        'Operations leads can answer "why did spending spike?" or "who approved this override?" in seconds without digging through raw container logs.',
      src: 'shots/step-09-audit.png',
      width: 1280,
      height: 2592,
      alt: 'Audit log page listing chronological budget warnings, requests, approvals, and policy actions.'
    },
    {
      id: '10',
      slideKey: '10',
      filter: 'audit',
      badge: 'Usage export · CSV & JSON',
      badgeClass: 'chip-ok',
      title: '10. Per-member usage breakdown',
      meta: 'View: Usage & export · Grouped by team member, model, and time window',
      happened:
        'At the end of the week, Priya inspects total spend broken down by engineer and model, and exports the usage and audit records for finance review.',
      notice:
        'Every metered call is tied to a named member key rather than one shared team API key.',
      src: 'shots/step-10-usage.png',
      width: 1280,
      height: 1503,
      alt: 'Usage breakdown screen showing spend per member and model across the team.'
    }
  ];

  var stepButtons = Array.from(document.querySelectorAll('[data-step-id]'));
  var filterButtons = Array.from(document.querySelectorAll('[data-step-filter]'));
  var prevBtn = document.getElementById('step-prev');
  var nextBtn = document.getElementById('step-next');
  var liveRegion = document.getElementById('walkthrough-live');
  var walkthroughTrack = document.getElementById('walkthrough-track');
  var walkSlides = walkthroughTrack
    ? Array.from(walkthroughTrack.querySelectorAll('[data-walk-slide]'))
    : [];
  var currentFilter = 'all';
  var currentStepId = '1';
  var syncingFromStep = false;

  var walkCarousel = initCarousel(walkthroughTrack, {
    onSlideChange: function (idx, slideEl) {
      if (syncingFromStep || !slideEl) return;
      var slideKey = slideEl.dataset.walkSlide || '1';
      var mappedStepId = slideKey === '8b' ? '8' : slideKey;
      if (mappedStepId !== currentStepId) {
        renderStep(mappedStepId, false, true, false);
      }
    }
  });

  function visibleSteps() {
    return STEPS.filter(function (s) {
      return currentFilter === 'all' || s.filter === currentFilter;
    });
  }

  function renderStep(stepId, focusButton, persist, scrollCarousel) {
    var step = STEPS.find(function (s) { return s.id === stepId; }) || STEPS[0];
    currentStepId = step.id;

    stepButtons.forEach(function (btn) {
      var active = btn.dataset.stepId === currentStepId;
      btn.setAttribute('aria-selected', String(active));
      btn.tabIndex = active ? 0 : -1;
    });

    var titleEl = document.getElementById('stage-title');
    var metaEl = document.getElementById('stage-meta');
    var chipEl = document.getElementById('stage-chip');
    var happenedEl = document.getElementById('stage-happened');
    var noticeEl = document.getElementById('stage-notice');
    var captionEl = document.getElementById('stage-caption');
    var zoomBtn = document.getElementById('stage-zoom');

    if (titleEl) titleEl.textContent = step.title;
    if (metaEl) metaEl.textContent = step.meta;
    if (chipEl) {
      chipEl.textContent = step.badge;
      chipEl.className = 'chip ' + step.badgeClass;
    }
    if (happenedEl) happenedEl.textContent = step.happened;
    if (noticeEl) noticeEl.textContent = step.notice;
    if (captionEl) {
      captionEl.textContent =
        'Recorded screenshot ' + step.id + ' of 10 · ' + step.src + ' · Swipe or drag to compare';
    }
    if (zoomBtn) {
      zoomBtn.dataset.mediaSrc = step.src;
      zoomBtn.dataset.mediaTitle = step.title;
      zoomBtn.dataset.mediaAlt = step.alt;
      zoomBtn.dataset.mediaW = String(step.width);
      zoomBtn.dataset.mediaH = String(step.height);
    }

    if (scrollCarousel !== false && walkCarousel && walkSlides.length) {
      var slideIdx = walkSlides.findIndex(function (sl) {
        return sl.dataset.walkSlide === step.slideKey;
      });
      if (slideIdx !== -1) {
        syncingFromStep = true;
        walkCarousel.scrollToSlide(slideIdx, persist ? undefined : 'instant');
        setTimeout(function () {
          syncingFromStep = false;
        }, 350);
      }
    }

    var list = visibleSteps();
    var idx = list.findIndex(function (s) { return s.id === currentStepId; });
    if (prevBtn) prevBtn.disabled = idx <= 0;
    if (nextBtn) nextBtn.disabled = idx === -1 || idx >= list.length - 1;

    if (liveRegion) {
      liveRegion.textContent = 'Showing ' + step.title + '.';
    }
    if (persist) {
      updateQuery('step', currentStepId);
    }
    if (focusButton) {
      var targetBtn = stepButtons.find(function (b) {
        return b.dataset.stepId === currentStepId;
      });
      if (targetBtn) targetBtn.focus();
    }
  }

  function applyFilter(filter, persist) {
    currentFilter = filter || 'all';
    filterButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.stepFilter === currentFilter));
    });
    stepButtons.forEach(function (btn) {
      var stepObj = STEPS.find(function (s) { return s.id === btn.dataset.stepId; });
      var show = currentFilter === 'all' || (stepObj && stepObj.filter === currentFilter);
      btn.hidden = !show;
    });
    var list = visibleSteps();
    if (!list.some(function (s) { return s.id === currentStepId; }) && list.length > 0) {
      renderStep(list[0].id, false, persist, true);
    } else {
      renderStep(currentStepId, false, persist, true);
    }
    if (persist) {
      updateQuery('filter', currentFilter);
    }
  }

  stepButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      renderStep(btn.dataset.stepId, false, true, true);
    });
    btn.addEventListener('keydown', function (event) {
      var list = visibleSteps();
      var idx = list.findIndex(function (s) { return s.id === btn.dataset.stepId; });
      if (idx === -1) return;
      var nextIdx;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
        nextIdx = (idx + 1) % list.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
        nextIdx = (idx + list.length - 1) % list.length;
      if (event.key === 'Home') nextIdx = 0;
      if (event.key === 'End') nextIdx = list.length - 1;
      if (nextIdx !== undefined) {
        event.preventDefault();
        renderStep(list[nextIdx].id, true, true, true);
      }
    });
  });

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.dataset.stepFilter, true);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      var list = visibleSteps();
      var idx = list.findIndex(function (s) { return s.id === currentStepId; });
      if (idx > 0) renderStep(list[idx - 1].id, false, true, true);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      var list = visibleSteps();
      var idx = list.findIndex(function (s) { return s.id === currentStepId; });
      if (idx !== -1 && idx < list.length - 1)
        renderStep(list[idx + 1].id, false, true, true);
    });
  }

  /* ==========================================================================
     7. Console Screenshot Viewport Toggle (1280px Desktop vs 360px Mobile)
     ========================================================================== */
  var consoleToggleBtns = Array.from(document.querySelectorAll('[data-console-size]'));
  var consoleImgs = Array.from(document.querySelectorAll('[data-shot-desktop]'));

  function applyConsoleSize(size, persist) {
    var mode = size === '360' ? '360' : '1280';
    consoleToggleBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.consoleSize === mode));
    });
    consoleImgs.forEach(function (img) {
      var nextSrc = mode === '360' ? img.dataset.shotMobile : img.dataset.shotDesktop;
      var nextW = mode === '360' ? Number(img.dataset.wMobile) : Number(img.dataset.wDesktop);
      var nextH = mode === '360' ? Number(img.dataset.hMobile) : Number(img.dataset.hDesktop);
      img.src = nextSrc;
      img.width = nextW;
      img.height = nextH;
      var item = img.closest('.console-shot-item');
      if (item) {
        item.querySelectorAll('[data-media-src]').forEach(function (btn) {
          btn.dataset.mediaSrc = nextSrc;
          btn.dataset.mediaW = String(nextW);
          btn.dataset.mediaH = String(nextH);
        });
      }
    });
    if (persist) updateQuery('console_view', mode === '360' ? '360' : null);
  }

  consoleToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyConsoleSize(btn.dataset.consoleSize, true);
    });
  });

  /* ==========================================================================
     8. Gesture-Driven Zoom & Pan Media Viewer (from ai-privacy-filter)
     ========================================================================== */
  var dialog = document.getElementById('media-viewer');
  var stage = document.getElementById('media-stage');
  var canvas = document.getElementById('media-canvas');
  var titleNode = document.getElementById('media-title');
  var counterNode = document.getElementById('media-counter');
  var closeBtn = document.getElementById('media-close');
  var zoomInBtn = document.getElementById('media-zoom-in');
  var zoomOutBtn = document.getElementById('media-zoom-out');
  var zoomFitBtn = document.getElementById('media-zoom-fit');
  var mediaPrevBtn = document.getElementById('media-prev');
  var mediaNextBtn = document.getElementById('media-next');

  var opener = null;
  var activeGroup = [];
  var activeGroupIndex = 0;
  var naturalWidth = 1280;
  var naturalHeight = 900;
  var zoom = 1;
  var x = 0;
  var y = 0;
  var gesture = null;
  var lastTap = null;
  var pointers = new Map();
  var moved = false;

  function fitScale() {
    if (!stage) return 1;
    var sw = Math.max(240, stage.clientWidth - 36);
    var sh = Math.max(200, stage.clientHeight - 36);
    return Math.min(1, sw / naturalWidth, sh / naturalHeight);
  }

  function renderViewer() {
    if (!stage || !canvas) return;
    var width = naturalWidth * zoom;
    var height = naturalHeight * zoom;
    x =
      width <= stage.clientWidth - 32
        ? (stage.clientWidth - width) / 2
        : Math.max(stage.clientWidth - width - 16, Math.min(16, x));
    y =
      height <= stage.clientHeight - 32
        ? (stage.clientHeight - height) / 2
        : Math.max(stage.clientHeight - height - 16, Math.min(16, y));
    canvas.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + zoom + ')';
    stage.classList.toggle('is-zoomed', zoom > fitScale() + 0.001);
  }

  function setZoom(value, point) {
    if (!stage) return;
    point = point || { x: stage.clientWidth / 2, y: stage.clientHeight / 2 };
    var next = Math.max(fitScale(), Math.min(4, value));
    x = point.x - ((point.x - x) * next) / zoom;
    y = point.y - ((point.y - y) * next) / zoom;
    zoom = next;
    renderViewer();
  }

  function fitViewer() {
    zoom = fitScale();
    x = 0;
    y = 0;
    renderViewer();
  }

  function localPoint(event) {
    var rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function collectGroupForTrigger(btn) {
    var track = btn.closest('[data-carousel-track]');
    if (track) {
      return Array.from(
        track.querySelectorAll('.shot-open[data-media-src], .overview-preview, .stage-slide')
      );
    }
    return [btn];
  }

  function populateViewerFromButton(btn) {
    if (!dialog || !stage || !canvas) return;
    var svgId = btn.dataset.mediaSvg;
    naturalWidth = Number(btn.dataset.mediaW) || 1280;
    naturalHeight = Number(btn.dataset.mediaH) || 1548;

    if (svgId) {
      var clonedSvg = clonePipelineSvg('viewer-');
      if (clonedSvg) {
        canvas.replaceChildren(clonedSvg);
      }
    } else {
      var img = document.createElement('img');
      img.src = btn.dataset.mediaSrc || '';
      img.alt = btn.dataset.mediaAlt || '';
      img.width = naturalWidth;
      img.height = naturalHeight;
      img.draggable = false;
      canvas.replaceChildren(img);
    }

    canvas.style.width = naturalWidth + 'px';
    canvas.style.height = naturalHeight + 'px';
    if (titleNode) {
      titleNode.textContent = btn.dataset.mediaTitle || 'Screenshot preview';
    }
    if (counterNode) {
      counterNode.textContent =
        activeGroup.length > 1
          ? activeGroupIndex + 1 + ' / ' + activeGroup.length
          : '';
    }
    if (mediaPrevBtn) mediaPrevBtn.disabled = activeGroupIndex <= 0;
    if (mediaNextBtn) mediaNextBtn.disabled = activeGroupIndex >= activeGroup.length - 1;
    lastTap = null;
    moved = false;
    fitViewer();
  }

  function openMediaViewer(btn) {
    if (!dialog || !stage) return;
    opener = btn;
    activeGroup = collectGroupForTrigger(btn);
    activeGroupIndex = Math.max(0, activeGroup.indexOf(btn));
    if (!dialog.open && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
    root.classList.add('media-open');
    populateViewerFromButton(btn);
    stage.focus({ preventScroll: true });
  }

  function stepMediaViewer(delta) {
    if (activeGroup.length <= 1) return;
    var nextIdx = Math.max(0, Math.min(activeGroup.length - 1, activeGroupIndex + delta));
    if (nextIdx === activeGroupIndex) return;
    activeGroupIndex = nextIdx;
    populateViewerFromButton(activeGroup[activeGroupIndex]);
  }

  document.querySelectorAll('[data-media-src], [data-media-svg]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openMediaViewer(btn);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      if (dialog && dialog.open) dialog.close();
    });
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      setZoom(zoom * 1.4);
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      setZoom(zoom / 1.4);
    });
  }
  if (zoomFitBtn) {
    zoomFitBtn.addEventListener('click', fitViewer);
  }
  if (mediaPrevBtn) {
    mediaPrevBtn.addEventListener('click', function () {
      stepMediaViewer(-1);
    });
  }
  if (mediaNextBtn) {
    mediaNextBtn.addEventListener('click', function () {
      stepMediaViewer(1);
    });
  }

  if (dialog && stage && canvas) {
    dialog.addEventListener('close', function () {
      root.classList.remove('media-open');
      pointers.clear();
      gesture = null;
      stage.classList.remove('is-panning');
      if (opener) opener.focus({ preventScroll: true });
    });

    dialog.addEventListener('click', function (event) {
      if (moved) {
        moved = false;
        return;
      }
      var rect = canvas.getBoundingClientRect();
      var outside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (event.target === dialog || (event.target === stage && outside)) {
        dialog.close();
      }
    });

    dialog.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === '+' || event.key === '=') {
        setZoom(zoom * 1.4);
        event.preventDefault();
      } else if (event.key === '-') {
        setZoom(zoom / 1.4);
        event.preventDefault();
      } else if (event.key === '0') {
        fitViewer();
        event.preventDefault();
      } else if (event.key === 'PageUp' || event.key === '[') {
        stepMediaViewer(-1);
        event.preventDefault();
      } else if (event.key === 'PageDown' || event.key === ']') {
        stepMediaViewer(1);
        event.preventDefault();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        if (zoom <= fitScale() + 0.01 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          stepMediaViewer(event.key === 'ArrowLeft' ? -1 : 1);
        } else {
          x += event.key === 'ArrowLeft' ? 48 : event.key === 'ArrowRight' ? -48 : 0;
          y += event.key === 'ArrowUp' ? 48 : event.key === 'ArrowDown' ? -48 : 0;
          renderViewer();
        }
        event.preventDefault();
      }
    });

    stage.addEventListener(
      'wheel',
      function (event) {
        event.preventDefault();
        var delta = event.deltaY || event.deltaX;
        if (event.deltaMode === 1) delta *= 16;
        if (event.deltaMode === 2) delta *= stage.clientHeight;
        setZoom(zoom * Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.002)), localPoint(event));
      },
      { passive: false }
    );

    function startGesture() {
      var points = Array.from(pointers.values());
      if (points.length >= 2) {
        var a = points[0];
        var b = points[1];
        gesture = {
          zoom: zoom,
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          worldX: ((a.x + b.x) / 2 - x) / zoom,
          worldY: ((a.y + b.y) / 2 - y) / zoom
        };
        moved = true;
        lastTap = null;
      } else if (points.length) {
        gesture = { point: points[0], x: x, y: y };
      } else {
        gesture = null;
      }
    }

    stage.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (!pointers.size) moved = false;
      pointers.set(event.pointerId, localPoint(event));
      try {
        stage.setPointerCapture(event.pointerId);
      } catch (_e) {}
      startGesture();
    });

    stage.addEventListener('pointermove', function (event) {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, localPoint(event));
      var points = Array.from(pointers.values());
      if (points.length >= 2 && gesture && gesture.distance) {
        var a = points[0];
        var b = points[1];
        zoom = Math.max(
          fitScale(),
          Math.min(4, (gesture.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / gesture.distance)
        );
        x = (a.x + b.x) / 2 - gesture.worldX * zoom;
        y = (a.y + b.y) / 2 - gesture.worldY * zoom;
        renderViewer();
      } else if (gesture && gesture.point) {
        var dx = points[0].x - gesture.point.x;
        var dy = points[0].y - gesture.point.y;
        if (Math.hypot(dx, dy) > 5) moved = true;
        x = gesture.x + dx;
        y = gesture.y + dy;
        renderViewer();
      }
      stage.classList.toggle('is-panning', moved);
    });

    function endPointer(event) {
      if (!pointers.has(event.pointerId)) return;
      if (!moved && event.type === 'pointerup') {
        var point = localPoint(event);
        var now = Date.now();
        if (
          lastTap &&
          now - lastTap.time < 350 &&
          Math.hypot(point.x - lastTap.x, point.y - lastTap.y) < 24
        ) {
          if (zoom > fitScale() + 0.001) fitViewer();
          else setZoom(Math.max(1, zoom * 2), point);
          lastTap = null;
        } else {
          lastTap = { x: point.x, y: point.y, time: now };
        }
      }
      pointers.delete(event.pointerId);
      startGesture();
      if (!pointers.size) stage.classList.remove('is-panning');
    }

    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    stage.addEventListener('lostpointercapture', endPointer);
    window.addEventListener('resize', function () {
      if (dialog.open) fitViewer();
    });
  }

  /* ==========================================================================
     9. Initialize from URL Query Parameters
     ========================================================================== */
  var params = new URLSearchParams(location.search);
  var initialFilter = params.get('filter');
  var initialStep = params.get('step');
  var initialConsole = params.get('console_view');
  if (initialFilter && ['all', 'budget', 'model', 'offhours', 'audit'].includes(initialFilter)) {
    applyFilter(initialFilter, false);
  }
  if (initialStep && STEPS.some(function (s) { return s.id === initialStep; })) {
    renderStep(initialStep, false, false, true);
  } else {
    renderStep('1', false, false, false);
  }
  if (initialConsole === '360') {
    applyConsoleSize('360', false);
  }
})();
