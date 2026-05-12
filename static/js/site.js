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
})();
