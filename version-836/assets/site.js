const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
};

ready(() => {
    initMobileMenu();
    initHeroSlider();
    initImageFallbacks();
    initFilters();
    initSearchPage();
    initPlayers();
});

function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-nav]');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        menu.classList.toggle('is-open');
        toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
}

function initHeroSlider() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length < 2) {
        return;
    }

    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    const start = () => {
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            window.clearInterval(timer);
            show(dotIndex);
            start();
        });
    });

    start();
}

function initImageFallbacks() {
    const images = document.querySelectorAll('img');

    images.forEach((image) => {
        image.addEventListener('error', () => {
            const wrapper = image.closest('.poster-wrap, .hero-poster, .detail-cover');
            if (wrapper) {
                wrapper.classList.add('image-error');
            }
        }, { once: true });
    });
}

function initFilters() {
    const lists = document.querySelectorAll('[data-filter-list]');

    lists.forEach((list) => {
        const panel = list.closest('main')?.querySelector('.filter-panel');
        if (!panel) {
            return;
        }

        const keywordInput = panel.querySelector('[data-filter-input]');
        const yearSelect = panel.querySelector('[data-year-filter]');
        const genreSelect = panel.querySelector('[data-genre-filter]');
        const resetButton = panel.querySelector('[data-reset-filter]');
        const countLabel = panel.querySelector('[data-filter-count]');
        const cards = Array.from(list.querySelectorAll('.movie-card'));

        const apply = () => {
            const keyword = (keywordInput?.value || '').trim().toLowerCase();
            const year = yearSelect?.value || '';
            const genre = genreSelect?.value || '';
            let shown = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.textContent,
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.includes(keyword);
                const matchesYear = !year || card.dataset.year === year;
                const matchesGenre = !genre || (card.dataset.genre || '').includes(genre);
                const visible = matchesKeyword && matchesYear && matchesGenre;

                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (countLabel) {
                countLabel.textContent = `${shown} 部影片`;
            }
        };

        keywordInput?.addEventListener('input', apply);
        yearSelect?.addEventListener('change', apply);
        genreSelect?.addEventListener('change', apply);
        resetButton?.addEventListener('click', () => {
            if (keywordInput) keywordInput.value = '';
            if (yearSelect) yearSelect.value = '';
            if (genreSelect) genreSelect.value = '';
            apply();
        });
    });
}

async function initSearchPage() {
    const page = document.querySelector('[data-search-page]');
    if (!page) {
        return;
    }

    const input = page.querySelector('[data-search-input]');
    const results = page.querySelector('[data-search-results]');
    const status = page.querySelector('[data-search-status]');
    const dataUrl = page.dataset.dataUrl;
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
        input.value = initialQuery;
    }

    let movies = [];

    try {
        const response = await fetch(dataUrl, { cache: 'force-cache' });
        movies = await response.json();
    } catch (error) {
        if (status) {
            status.textContent = '搜索数据读取失败，请通过分类页继续浏览影片。';
        }
        return;
    }

    const render = (query) => {
        const keyword = query.trim().toLowerCase();
        const matched = keyword
            ? movies.filter((movie) => movie.searchText.includes(keyword)).slice(0, 96)
            : movies.slice(0, 24);

        if (status) {
            status.textContent = keyword
                ? `找到 ${matched.length} 条相关结果，最多展示前 96 条。`
                : '默认展示前 24 部影片，输入关键词后自动匹配影片库内容。';
        }

        if (!results) {
            return;
        }

        results.innerHTML = matched.map((movie) => movieCardTemplate(movie)).join('');
        initImageFallbacks();
    };

    input?.addEventListener('input', () => render(input.value));
    render(initialQuery);
}

function movieCardTemplate(movie) {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

    return `
        <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}" data-region="${escapeHtml(movie.region)}">
            <a href="${escapeHtml(movie.url)}" class="movie-card-link" aria-label="观看 ${escapeHtml(movie.title)}">
                <div class="poster-wrap" data-title="${escapeHtml(movie.title)}">
                    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="poster-glow"></span>
                    <span class="poster-badge">${escapeHtml(movie.category)}</span>
                    <span class="poster-duration">${escapeHtml(movie.duration)}</span>
                    <span class="poster-play">▶</span>
                </div>
                <div class="movie-card-body">
                    <div class="movie-card-meta">
                        <span>${escapeHtml(movie.year)}</span>
                        <span>${escapeHtml(movie.region)}</span>
                        <span>评分 ${escapeHtml(movie.rating)}</span>
                    </div>
                    <h3>${escapeHtml(movie.title)}</h3>
                    <p>${escapeHtml(movie.oneLine)}</p>
                    <div class="tag-row">${tags}</div>
                </div>
            </a>
        </article>
    `;
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function initPlayers() {
    const players = document.querySelectorAll('.movie-player');

    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('.player-start');
        const message = player.querySelector('.player-message');
        const source = player.dataset.videoSrc;
        let initialized = false;
        let hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        const setMessage = (text) => {
            if (message) {
                message.textContent = text;
            }
        };

        const initialize = async () => {
            if (initialized) {
                return;
            }

            initialized = true;
            setMessage('正在加载播放源...');

            try {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    const module = await import('./hls-dru42stk.js');
                    const Hls = module.H;

                    if (!Hls || !Hls.isSupported()) {
                        throw new Error('当前浏览器不支持 HLS 播放。');
                    }

                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                        setMessage('播放源加载完成');
                    });
                    hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
                        if (data?.fatal) {
                            setMessage('视频加载失败，请稍后重试。');
                        }
                    });
                }
            } catch (error) {
                initialized = false;
                setMessage(error.message || '播放器初始化失败。');
            }
        };

        const play = async () => {
            await initialize();
            try {
                await video.play();
                video.controls = true;
                player.classList.add('is-playing');
                setMessage('正在播放');
            } catch (error) {
                setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            }
        };

        button.addEventListener('click', play);
        video.addEventListener('click', () => {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('pause', () => player.classList.remove('is-playing'));
        video.addEventListener('play', () => player.classList.add('is-playing'));
        window.addEventListener('beforeunload', () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}
