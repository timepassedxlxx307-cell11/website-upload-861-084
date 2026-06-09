(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var navToggle = qs('[data-nav-toggle]');
  var siteNav = qs('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  qsa('[data-filter-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });

  qsa('[data-search-input]').forEach(function (input) {
    var area = input.closest('.archive-toolbar') || input.closest('.hero-search-wrap') || document;
    var root = qs('[data-search-root]', area) || qs('[data-search-root]') || document;

    input.addEventListener('input', function () {
      applyFilter(root, input.value, activeFilterValue(root));
    });
  });

  qsa('[data-filter-button]').forEach(function (button) {
    button.addEventListener('click', function () {
      var toolbar = button.closest('.archive-toolbar') || document;
      qsa('[data-filter-button]', toolbar).forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      var root = qs('[data-search-root]', toolbar.parentElement) || qs('[data-search-root]') || document;
      var input = qs('[data-search-input]', toolbar);
      applyFilter(root, input ? input.value : '', button.getAttribute('data-filter-button'));
    });
  });

  function activeFilterValue(root) {
    var toolbar = root.closest('section') ? qs('.archive-toolbar', root.closest('section')) : null;
    var active = toolbar ? qs('[data-filter-button].is-active', toolbar) : null;
    return active ? active.getAttribute('data-filter-button') : 'all';
  }

  function applyFilter(root, query, typeValue) {
    var text = normalize(query);
    var selected = normalize(typeValue || 'all');
    qsa('[data-card]', root).forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var typeMatch = selected === 'all' || normalize(card.getAttribute('data-type')) === selected;
      var textMatch = !text || haystack.indexOf(text) !== -1;
      card.classList.toggle('is-hidden', !(typeMatch && textMatch));
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  });
})();
