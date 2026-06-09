(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot') || 0));
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var searchInput = document.querySelector('[data-site-search]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-search-empty]');

    function applySearch() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || text.indexOf(region.toLowerCase()) !== -1;
        var matchType = !type || text.indexOf(type.toLowerCase()) !== -1;
        var showCard = matchKeyword && matchRegion && matchType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput || regionSelect || typeSelect) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');

      if (initial && searchInput) {
        searchInput.value = initial;
      }

      if (searchInput) {
        searchInput.addEventListener('input', applySearch);
      }

      if (regionSelect) {
        regionSelect.addEventListener('change', applySearch);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', applySearch);
      }

      applySearch();
    }
  });
})();
