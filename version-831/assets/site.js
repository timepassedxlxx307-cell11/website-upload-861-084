(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5000);
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll('.hero-search')).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    return;
                }
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
            });
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-list .movie-card'));
        if (!cards.length) {
            return;
        }
        var search = document.querySelector('.site-search');
        var year = document.querySelector('.filter-year');
        var type = document.querySelector('.filter-type');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (search && initial) {
            search.value = initial;
        }
        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var selectedType = type ? type.value : '';
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardType = card.getAttribute('data-type') || '';
                var visible = true;
                if (keyword && haystack.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    visible = false;
                }
                if (selectedType && cardType.indexOf(selectedType) === -1) {
                    visible = false;
                }
                card.classList.toggle('is-hidden', !visible);
            });
        }
        [search, year, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-start');
            if (!video) {
                return;
            }
            var node = video.querySelector('source');
            var stream = node ? node.getAttribute('src') : video.getAttribute('src');
            var attached = false;
            var hlsObject = null;
            function attachStream() {
                if (attached || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsObject = new window.Hls({ enableWorker: true });
                    hlsObject.loadSource(stream);
                    hlsObject.attachMedia(video);
                    return;
                }
                video.src = stream;
                video.load();
            }
            function startPlayback() {
                attachStream();
                box.classList.add('is-playing');
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        video.controls = true;
                    });
                }
            }
            if (button) {
                button.addEventListener('click', startPlayback);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            window.addEventListener('pagehide', function () {
                if (hlsObject) {
                    hlsObject.destroy();
                    hlsObject = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
        setupPlayers();
    });
}());
