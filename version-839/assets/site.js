(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        setupHero();
        setupLocalFilter();
        setupSearchPage();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener("click", function() {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        var filter = document.querySelector("[data-local-filter]");
        if (!filter) {
            return;
        }
        var input = filter.querySelector("input[name='keyword']");
        var year = filter.querySelector("select[name='year']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = yearMatch && keywordMatch ? "" : "none";
            });
        }

        filter.addEventListener("submit", function(event) {
            event.preventDefault();
            apply();
        });
        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
    }

    function setupSearchPage() {
        var target = document.querySelector("[data-search-results]");
        var form = document.querySelector("[data-search-form]");
        if (!target || !form || typeof MOVIES === "undefined") {
            return;
        }
        var input = form.querySelector("input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
        }

        function render(list) {
            if (!list.length) {
                target.innerHTML = '<div class="empty-state">没有找到匹配的影片，换个关键词试试。</div>';
                return;
            }
            target.innerHTML = list.slice(0, 240).map(function(movie) {
                return [
                    '<article class="movie-card movie-card-medium">',
                    '    <a class="poster-link" href="' + movie.url + '">',
                    '        <span class="poster-frame">',
                    '            <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '            <span class="poster-shade"></span>',
                    '            <span class="play-badge">▶</span>',
                    '            <span class="corner-label">' + escapeHtml(movie.category) + '</span>',
                    '        </span>',
                    '        <span class="card-body">',
                    '            <strong>' + escapeHtml(movie.title) + '</strong>',
                    '            <span class="card-summary">' + escapeHtml(movie.oneLine) + '</span>',
                    '            <span class="card-meta"><em>' + escapeHtml(movie.year) + '</em><em>' + escapeHtml(movie.type) + '</em><em>' + escapeHtml(movie.region) + '</em></span>',
                    '        </span>',
                    '    </a>',
                    '</article>'
                ].join("");
            }).join("");
        }

        function search() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var result = MOVIES.filter(function(movie) {
                if (!q) {
                    return true;
                }
                return [movie.title, movie.region, movie.year, movie.genre, movie.oneLine, movie.category].join(" ").toLowerCase().indexOf(q) !== -1;
            });
            render(result);
        }

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            search();
        });
        if (input) {
            input.addEventListener("input", search);
        }
        search();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.initMoviePlayer = function(source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.querySelector("[data-player-overlay]");
        var startButton = document.querySelector(".player-start");
        var hls = null;
        var attached = false;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            attached = true;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        if (startButton) {
            startButton.addEventListener("click", play);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function() {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
