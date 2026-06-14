/* ============================================================================
   Princeton Chess Club — behaviour script (loaded by every page)
   ----------------------------------------------------------------------------
   Plain-English tour of what this file does, in order:

     1. Mobile nav toggle  — the ☰ button opens/closes the menu on phones.
     2. Photo fallback      — if any <img class="photo"> fails to load, we replace
                              it with a tidy chess-piece placeholder so the page
                              never shows a broken-image icon.
     3. reduceMotion        — respects the visitor's "reduce motion" setting; when
                              on, we skip animations and the custom cursor.
     4. DOMContentLoaded     — everything below runs once the page has loaded:
          a. Custom cursor   — hides the arrow and draws a chess piece that follows
                               the mouse (knight normally, queen over clickable things).
          b. Scroll reveal   — elements fade/slide in as they scroll into view.
          c. Floating pieces  — drifting chess pieces in the hero, with mouse parallax.
          d. Stat counters    — numbers count up when scrolled into view (if present).
          e. 3D tilt          — officer cards tilt toward the mouse.
          f. Magnetic buttons — buttons lean slightly toward the cursor.
          g. Hero scroll fade — the hero gently fades as you scroll past it.

   You normally won't need to touch this file to edit content — text and photos
   live in the .html files, and colours/sizing live in styles.css.
   ============================================================================ */

// ---- Mobile nav toggle ----
document.addEventListener('click', function (e) {
  if (e.target.closest('.nav-toggle')) {
    document.querySelector('.nav-links').classList.toggle('open');
  }
});

// ---- Join form (demo — no backend) ----
document.addEventListener('submit', function (e) {
  if (e.target.id === 'joinForm') {
    e.preventDefault();
    var note = document.querySelector('.form-note');
    var name = (e.target.querySelector('[name=name]') || {}).value || 'friend';
    if (note) {
      note.textContent = 'Thanks, ' + name + '! You’re on the list. We’ll email you about the next meetup.';
      note.style.display = 'block';
    }
    e.target.reset();
  }
});

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Graceful photo fallback: if an image fails, show a styled placeholder ----
document.addEventListener('error', function (e) {
  var img = e.target;
  if (img.tagName === 'IMG' && img.classList.contains('photo')) {
    var label = img.getAttribute('data-label') || 'Photo coming soon';
    var fb = document.createElement('div');
    fb.className = 'photo-fallback';
    fb.innerHTML = '<span class="pc">♞</span><span class="lbl">' + label + '</span>';
    if (img.parentNode) img.parentNode.replaceChild(fb, img);
  }
}, true);

document.addEventListener('DOMContentLoaded', function () {

  // ---- Custom pawn cursor (replaces the arrow; no ring) ----
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.documentElement.classList.add('custom-cursor-on');

    var piece = document.createElement('div'); piece.className = 'cursor-piece'; piece.textContent = '♟'; // pawn
    document.body.appendChild(piece);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var interactiveSel = 'a, button, .btn, .nav-links a, input, select, textarea, .card, .event, label';

    // Returns true if any sampled point across the pawn's footprint sits on a clickable
    function overInteractive(x, y) {
      var r = 15; // half the pawn's size — samples its edges/corners, not just the tip
      var pts = [[0,0],[0,-r],[0,r],[-r,0],[r,0],[-r,-r],[r,-r],[-r,r],[r,r]];
      for (var i = 0; i < pts.length; i++) {
        var el = document.elementFromPoint(x + pts[i][0], y + pts[i][1]);
        if (el && el.closest && el.closest(interactiveSel)) return true;
      }
      return false;
    }

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      piece.style.opacity = '1';
      piece.classList.toggle('hovering', overInteractive(mx, my));
    });
    document.addEventListener('mousedown', function () { piece.classList.add('clicking'); });
    document.addEventListener('mouseup', function () { piece.classList.remove('clicking'); });
    document.addEventListener('mouseleave', function () { piece.style.opacity = '0'; });

    (function loop() {
      piece.style.left = mx + 'px'; piece.style.top = my + 'px';
      requestAnimationFrame(loop);
    })();
  }

  // ---- Scroll reveal ----
  var targets = document.querySelectorAll('.card, .event, .section-title, .section-sub, .form-wrap, table.ratings, .split > div');
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) {
      // Reveal anything already on-screen at load so it never sits as a blank box.
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Floating chess pieces in hero (with parallax) ----
  var hero = document.querySelector('.hero');
  var floats = [];
  if (hero && !reduceMotion) {
    var pieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    for (var i = 0; i < 24; i++) {
      var p = document.createElement('span');
      p.className = 'float-piece';
      p.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      p.style.left = Math.random() * 100 + '%';
      p.style.fontSize = (2.2 + Math.random() * 3.5) + 'rem';
      p.style.animationDuration = (9 + Math.random() * 11) + 's';
      p.style.animationDelay = (-Math.random() * 14) + 's';
      p.dataset.depth = (0.15 + Math.random() * 0.5).toFixed(2);
      hero.appendChild(p);
      floats.push(p);
    }
    // parallax on mouse move
    hero.addEventListener('mousemove', function (e) {
      var cx = (e.clientX / window.innerWidth - 0.5);
      var cy = (e.clientY / hero.offsetHeight - 0.5);
      floats.forEach(function (f) {
        var d = parseFloat(f.dataset.depth);
        f.style.marginLeft = (cx * d * 60) + 'px';
        f.style.marginTop = (cy * d * 40) + 'px';
      });
    });
  }

  // ---- Rotating tagline ----
  var rot = document.getElementById('rotator');
  if (rot) {
    var phrases = ['Learn the game.', 'Sharpen your endgame.', 'Earn your rating.', 'Find your people.', 'Checkmate awaits.'];
    var ri = 0;
    function showPhrase() {
      rot.innerHTML = '<span class="word">' + phrases[ri] + '</span>';
      ri = (ri + 1) % phrases.length;
    }
    showPhrase();
    if (!reduceMotion) setInterval(showPhrase, 2600);
  }

  // ---- Animated stat counters ----
  var nums = document.querySelectorAll('.num[data-count]');
  function runCount(el) {
    var target = parseInt(el.dataset.count, 10), start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var prog = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (prog < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && nums.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { cio.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = parseInt(n.dataset.count, 10).toLocaleString(); });
  }

  // ---- 3D tilt on team cards ----
  if (!reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 14) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    // ---- Magnetic buttons ----
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.3) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.4 - 3) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ---- Curvy "spine" path that snakes through the subheaders ----
  (function () {
    var svg = document.querySelector('.spine');
    var path = svg && svg.querySelector('.spine-path');
    var main = document.querySelector('main');
    if (!svg || !path || !main) return;

    // The headers the curve should weave through, in vertical (DOM) order.
    var heads = Array.prototype.slice.call(
      main.querySelectorAll('.eyebrow, .section-title, .year-heading')
    );
    if (!heads.length) return;
    heads.forEach(function (h) { h.classList.add('spine-target'); });

    // Anchor points the curve threads through — works across all pages:
    // home uses .section-title + .member-stack; events uses .year-heading +
    // .event-entry; archive uses .year-heading + .card.member.
    var anchorEls = Array.prototype.slice.call(
      main.querySelectorAll('.section-title, .member-stack, .year-heading, .event-entry, .card.member')
    );

    var pts = [];
    var headY = [];  // vertical centre of each header, for the bolden-on-pass effect

    function layout() {
      var mainRect = main.getBoundingClientRect();
      var W = main.clientWidth;
      var H = main.scrollHeight;
      // Bigger lateral weave now that the curve also winds through the bios.
      var amp = Math.min(70, W * 0.06);

      // 1) Keep headers in their natural position (left-aligned, vertically
      //    lined up) so titles stack vertically; the curve still weaves through
      //    the content centres below each title.
      heads.forEach(function (h) { h.style.transform = 'none'; });

      // 2) Record header centres (for the bolden-on-pass effect).
      headY = [];
      heads.forEach(function (h) {
        var r = h.getBoundingClientRect();
        headY.push(r.top - mainRect.top + r.height / 2);
      });

      // 3) Build anchor points through headers + member cards (their real centres,
      //    which fan across the 3-column grid and make the curve nice and wavy).
      pts = anchorEls.map(function (el) {
        var r = el.getBoundingClientRect();
        return {
          x: r.left - mainRect.left + r.width / 2,
          y: r.top - mainRect.top + r.height / 2
        };
      });
      // For subtle-spine pages (events/archive), extend the path up behind the
      // navbar; otherwise start just above the first anchor on the home page.
      var nav = document.querySelector('.nav');
      var navH = nav ? nav.offsetHeight : 60;
      var startY;
      if (svg.classList.contains('spine-subtle')) {
        startY = -navH;                      // events/archive: start behind top bar
      } else {
        // Home page: extend up behind the hero banner
        var heroEl = document.querySelector('.hero');
        var heroH = heroEl ? heroEl.offsetHeight : 0;
        startY = -(navH + heroH);
      }
      pts.unshift({ x: pts[0].x, y: startY });

      // Helper: one Catmull-Rom -> cubic Bézier segment from pts[i] to pts[i+1].
      function seg(i) {
        var p0 = pts[i - 1] || pts[i];
        var p1 = pts[i];
        var p2 = pts[i + 1];
        var p3 = pts[i + 2] || p2;
        var c1x = p1.x + (p2.x - p0.x) / 6;
        var c1y = p1.y + (p2.y - p0.y) / 6;
        var c2x = p2.x - (p3.x - p1.x) / 6;
        var c2y = p2.y - (p3.y - p1.y) / 6;
        return ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) +
               ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) +
               ', ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
      }

      // Is the etched scene present & visible? If so, the line will burst into
      // a jagged "kapow" explosion around it before running down to When & where.
      var burst = null;
      var etch = document.querySelector('.etch-scene');
      if (etch && etch.offsetWidth > 0) {
        // Comic-burst frame around the ENTIRE sketch (kept full-size).
        var er = etch.getBoundingClientRect();
        burst = {
          cx: er.left - mainRect.left + er.width / 2 + 4,
          cy: er.top - mainRect.top + er.height / 2,
          rx: er.width / 2 + 46,
          ry: er.height / 2 + 30
        };
      }

      // 3) Build the path. Start at the first point.
      var d = 'M ' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);

      for (var i = 0; i < pts.length - 1; i++) d += seg(i);
      d += ' L ' + pts[pts.length - 1].x.toFixed(1) + ' ' + (H + 220).toFixed(1);

      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      path.setAttribute('d', d);

      // Prep the "draw on scroll" animation — keep transition OFF until first scroll.
      var len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;       // fully hidden, no animation
      drawOnScroll(len);
    }

    function drawOnScroll(len) {
      if (typeof len !== 'number') len = path.getTotalLength();
      var mainRect = main.getBoundingClientRect();
      var vh = window.innerHeight;
      // Keep the line completely hidden until the user actually scrolls down.
      var frac = 0;
      if (window.scrollY > 4) {
        // Trigger point set between centre (0.5) and 3/4 (0.75) of the screen,
        // with a moderate speed multiplier — an in-between of the last two tries.
        frac = ((vh * 0.625 - mainRect.top) / mainRect.height) * 1.15;
      }
      frac = Math.max(0, Math.min(1, frac));
      path.style.strokeDashoffset = len * (1 - frac);

      // Bolden each header once the drawn path has reached it.
      var drawnY = frac * main.scrollHeight;
      heads.forEach(function (h, i) {
        h.classList.toggle('spine-lit', headY[i] <= drawnY);
      });
    }

    var lastLen = 0;
    layout();
    lastLen = path.getTotalLength();

    var scrolled = false;
    window.addEventListener('scroll', function () {
      if (!scrolled) {
        scrolled = true;
        path.style.transition = '';  // enable transition only on first scroll
      }
      drawOnScroll(lastLen);
    }, { passive: true });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { layout(); lastLen = path.getTotalLength(); }, 150);
    });
    // Re-measure once late-loading images (sponsors, officer photo) settle.
    window.addEventListener('load', function () { layout(); lastLen = path.getTotalLength(); });
  })();

  // ---- Hero fade on scroll ----
  if (hero && !reduceMotion) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < hero.offsetHeight) {
        hero.style.backgroundPositionY = (y * 0.4) + 'px';
        var content = hero.querySelectorAll('h1, .rotator, p, .btn, .eyebrow');
        content.forEach(function (c) { c.style.opacity = Math.max(0, 1 - y / (hero.offsetHeight * 0.7)); });
      }
    }, { passive: true });
  }
});
