(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousels = document.querySelectorAll('[data-carousel]');

  carousels.forEach(function(carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-dot]'));
    var previous = carousel.querySelector('[data-prev]');
    var next = carousel.querySelector('[data-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function() {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-dot')) || 0);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  });

  var searchInputs = document.querySelectorAll('[data-search-input]');

  searchInputs.forEach(function(input) {
    var scope = input.closest('.container') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    input.addEventListener('input', function() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  });
})();
