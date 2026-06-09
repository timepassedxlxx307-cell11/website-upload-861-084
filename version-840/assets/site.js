(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
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
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            hero.querySelectorAll("[data-hero-prev]").forEach(function (button) {
                button.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            });
            hero.querySelectorAll("[data-hero-next]").forEach(function (button) {
                button.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            });
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });
            show(0);
            start();
        }

        var filterRoot = document.querySelector("[data-filter-root]");
        if (filterRoot) {
            var keyword = filterRoot.querySelector("[data-filter-keyword]");
            var category = filterRoot.querySelector("[data-filter-category]");
            var year = filterRoot.querySelector("[data-filter-year]");
            var type = filterRoot.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-card]"));
            var empty = filterRoot.querySelector("[data-empty]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (keyword && initialQuery) {
                keyword.value = initialQuery;
            }
            function normalize(value) {
                return (value || "").toString().toLowerCase().trim();
            }
            function applyFilter() {
                var q = normalize(keyword ? keyword.value : "");
                var c = normalize(category ? category.value : "");
                var y = normalize(year ? year.value : "");
                var t = normalize(type ? type.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region"));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (c && normalize(card.getAttribute("data-category")) !== c) {
                        ok = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        ok = false;
                    }
                    if (t && normalize(card.getAttribute("data-type")) !== t) {
                        ok = false;
                    }
                    card.style.display = ok ? "block" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            [keyword, category, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            applyFilter();
        }
    });

    window.initMoviePlayer = function (playUrl) {
        var video = document.getElementById("movie-video");
        var cover = document.getElementById("player-cover");
        if (!video || !playUrl) {
            return;
        }
        var prepared = false;
        var hls = null;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(playUrl);
                hls.attachMedia(video);
            } else {
                video.src = playUrl;
            }
        }
        function play() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
