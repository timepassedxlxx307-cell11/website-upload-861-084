(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-site-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
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
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var form = scope.querySelector("[data-filter-form]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      if (!form || !cards.length) {
        return;
      }
      var queryInput = form.querySelector("[data-filter-query]");
      var regionSelect = form.querySelector("[data-filter-region]");
      var typeSelect = form.querySelector("[data-filter-type]");
      var yearSelect = form.querySelector("[data-filter-year]");

      function apply() {
        var query = normalize(queryInput ? queryInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")) !== region) {
            ok = false;
          }
          if (type && normalize(card.getAttribute("data-type")) !== type) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    });
  }

  function mountPlayer(source) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector("[data-player-cover]");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    var message = document.querySelector("[data-player-message]");
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || "";
      message.classList.toggle("visible", Boolean(text));
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      setMessage("");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage("网络连接不稳定，正在重新加载");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage("播放正在恢复");
            hls.recoverMediaError();
          } else {
            setMessage("当前浏览器暂时无法播放此视频");
            hls.destroy();
          }
        });
      } else {
        setMessage("当前浏览器暂时无法播放此视频");
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      loadSource();
      video.setAttribute("controls", "controls");
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", start);
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  window.MovieSite = {
    mountPlayer: mountPlayer
  };
})();
