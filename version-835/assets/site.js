(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupSearchPage();
    setupPlayers();
  });

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-search-list]");
    if (!input || !list) {
      return;
    }
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search-item]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function filter() {
      var query = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = item.textContent.toLowerCase() + " " + (item.getAttribute("data-title") || "").toLowerCase() + " " + (item.getAttribute("data-tags") || "").toLowerCase() + " " + (item.getAttribute("data-year") || "").toLowerCase() + " " + (item.getAttribute("data-genre") || "").toLowerCase();
        item.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener("input", filter);
    filter();
  }

  function setupPlayers() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    blocks.forEach(function (block) {
      var video = block.querySelector("[data-video]");
      var button = block.querySelector("[data-play-button]");
      var source = block.getAttribute("data-source");
      var hls = null;
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function initialize() {
        if (initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        initialize();
        if (button) {
          button.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove("hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("hidden");
        }
      });

      video.addEventListener("click", function () {
        if (!initialized || video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }
})();
