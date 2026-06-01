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

  // ---- Custom chess-piece cursor (replaces the arrow) ----
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.documentElement.classList.add('custom-cursor-on');

    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var piece = document.createElement('div'); piece.className = 'cursor-piece'; piece.textContent = '♞'; // black knight
    document.body.appendChild(ring); document.body.appendChild(piece);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my, rot = 0;
    var interactiveSel = 'a, button, .btn, .nav-links a, input, select, textarea, .card, .event, label';

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      piece.style.opacity = '1'; ring.style.opacity = '1';
      var hot = e.target.closest(interactiveSel);
      piece.classList.toggle('hovering', !!hot);
      ring.classList.toggle('hovering', !!hot);
      // swap to queen over interactive targets, knight otherwise
      piece.textContent = hot ? '♛' : '♞';
    });
    document.addEventListener('mousedown', function () { piece.classList.add('clicking'); });
    document.addEventListener('mouseup', function () { piece.classList.remove('clicking'); });
    document.addEventListener('mouseleave', function () { piece.style.opacity = '0'; ring.style.opacity = '0'; });

    (function loop() {
      // piece snaps to pointer; ring eases for a flowing trail; slight rotation by velocity
      var prevx = rx;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      rot += ((mx - prevx) * 0.6 - rot) * 0.2;
      piece.style.left = mx + 'px'; piece.style.top = my + 'px';
      if (!piece.classList.contains('clicking')) {
        piece.style.transform = 'translate(-50%,-50%) rotate(' + Math.max(-20, Math.min(20, rot)) + 'deg)';
      }
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
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
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Floating chess pieces in hero (with parallax) ----
  var hero = document.querySelector('.hero');
  var floats = [];
  if (hero && !reduceMotion) {
    var pieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
    for (var i = 0; i < 11; i++) {
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
