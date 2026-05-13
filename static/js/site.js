/* phangbit.cool — site-wide behaviors.
   Loaded from baseof.html with `defer`, so it runs on every page after parse.
   - Scroll progress bar (#progressBar)
   - Section reveal (elements with class .sr)
   - Parallax pearls (elements with class .parallax-pearl, data-rate optional)

   Page-specific behavior (e.g. pitch form submission on /article/) lives in
   the page layout's {{ block "scripts" . }} so it doesn't load everywhere. */

(function () {
  var bar = document.getElementById('progressBar');
  if (bar) {
    var updateBar = function () {
      var s = window.scrollY;
      var t = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = t > 0 ? (s / t * 100) + '%' : '0%';
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  var els = document.querySelectorAll('.sr');
  if (els.length && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('visible'); });
  }

  var parallaxers = document.querySelectorAll('.parallax-pearl');
  if (parallaxers.length) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      parallaxers.forEach(function (el) {
        var rate = parseFloat(el.dataset.rate || '-0.15');
        el.style.transform = 'translateY(' + (y * rate) + 'px)';
      });
    }, { passive: true });
  }

  /* ── /stories/ in-page taxonomy filter ──────────────────────────────────
     Only runs on the stories section index. Term pages (e.g. /categories/
     editorial/) are server-rendered and let clicks navigate normally.

     Cards expose:
       data-categories="slug1 slug2 …"
       data-tags="slug1 slug2 …"
     Chips expose:
       data-slug="editorial"   (or empty string for the "全部" chip)

     Clicking a term chip hides every card whose data-categories/data-tags
     don't contain that slug, marks the chip active, and writes the slug
     to location.hash so the URL is shareable. Clicking the active chip
     again (or "全部") clears the filter. */
  if (document.body.dataset.kind === 'section' &&
      document.body.dataset.section === 'stories') {
    var grid = document.querySelector('.list-grid');
    var chips = document.querySelectorAll('.filter-bar a.chip');
    if (grid && chips.length) {
      var cards = grid.querySelectorAll('.story-card');

      var applyFilter = function (slug) {
        chips.forEach(function (c) {
          c.classList.toggle('active', (c.dataset.slug || '') === (slug || ''));
        });
        cards.forEach(function (card) {
          if (!slug) { card.style.display = ''; return; }
          var cats = (card.dataset.categories || '').split(/\s+/);
          var tags = (card.dataset.tags || '').split(/\s+/);
          var match = cats.indexOf(slug) !== -1 || tags.indexOf(slug) !== -1;
          card.style.display = match ? '' : 'none';
        });
      };

      /* Initial state: pick up filter from URL hash. Empty hash → show all. */
      applyFilter(decodeURIComponent(location.hash.slice(1)));

      chips.forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.preventDefault();
          var slug = chip.dataset.slug || '';
          /* Clicking the currently-active term chip toggles back to "all". */
          var alreadyActive = chip.classList.contains('active') && slug !== '';
          var next = alreadyActive ? '' : slug;
          applyFilter(next);
          var url = next ? ('#' + encodeURIComponent(next)) : location.pathname;
          history.replaceState(null, '', url);
        });
      });

      window.addEventListener('hashchange', function () {
        applyFilter(decodeURIComponent(location.hash.slice(1)));
      });
    }
  }
})();
