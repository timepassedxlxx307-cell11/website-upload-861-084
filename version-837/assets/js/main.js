const SELECTORS = {
  menuToggle: '[data-menu-toggle]',
  mobileNav: '[data-mobile-nav]',
  heroCarousel: '[data-hero-carousel]',
  heroSlide: '[data-hero-slide]',
  heroDot: '[data-hero-dot]',
  filterPanel: '[data-filter-panel]',
  filterGrid: '[data-filter-grid]',
  movieCard: '[data-movie-card]',
  resultCount: '[data-result-count]',
  player: '[data-player]'
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function initMobileMenu() {
  const button = document.querySelector(SELECTORS.menuToggle);
  const nav = document.querySelector(SELECTORS.mobileNav);

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector(SELECTORS.heroCarousel);

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll(SELECTORS.heroSlide));
  const dots = Array.from(carousel.querySelectorAll(SELECTORS.heroDot));
  const previous = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let activeIndex = 0;
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      start();
    });
  });

  if (previous) {
    previous.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      start();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      start();
    });
  }

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function getCardText(card) {
  return [
    card.dataset.title,
    card.dataset.category,
    card.dataset.year,
    card.dataset.type,
    card.dataset.tags,
    card.textContent
  ].join(' ').toLowerCase();
}

function cardMatchesType(cardType, selectedType) {
  if (!selectedType) {
    return true;
  }

  if (selectedType === '剧') {
    return cardType.includes('剧');
  }

  return cardType.includes(selectedType);
}

function initFilters() {
  const panels = Array.from(document.querySelectorAll(SELECTORS.filterPanel));

  panels.forEach((panel) => {
    const grid = panel.parentElement.querySelector(SELECTORS.filterGrid) || document.querySelector(SELECTORS.filterGrid);

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll(SELECTORS.movieCard));
    const queryInput = panel.querySelector('[data-filter-query]');
    const categorySelect = panel.querySelector('[data-filter-category]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const countNode = panel.querySelector(SELECTORS.resultCount);
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function applyFilter() {
      const query = normalizeText(queryInput ? queryInput.value : '');
      const category = normalizeText(categorySelect ? categorySelect.value : '');
      const year = normalizeText(yearSelect ? yearSelect.value : '');
      const type = normalizeText(typeSelect ? typeSelect.value : '');
      let visibleCount = 0;

      cards.forEach((card) => {
        const cardText = getCardText(card);
        const cardCategory = normalizeText(card.dataset.category);
        const cardYear = normalizeText(card.dataset.year);
        const cardType = normalizeText(card.dataset.type);
        const isVisible = (!query || cardText.includes(query))
          && (!category || cardCategory === category)
          && (!year || cardYear === year)
          && cardMatchesType(cardType, type);

        card.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visibleCount);
      }
    }

    [queryInput, categorySelect, yearSelect, typeSelect].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
}

async function loadHlsModule() {
  try {
    const module = await import('./hls.js');
    return module.H;
  } catch (error) {
    return null;
  }
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll(SELECTORS.player));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-player-start]');
    const status = player.querySelector('[data-player-status]');
    const source = player.dataset.videoSrc;
    let prepared = false;

    if (!video || !source || !button) {
      return;
    }

    async function prepareVideo() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (status) {
        status.textContent = '正在加载高清播放源...';
      }

      const Hls = await loadHlsModule();

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        player.hlsInstance = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (status) {
            status.textContent = '播放源已就绪';
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal && status) {
            status.textContent = '播放源加载失败，请稍后重试';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        if (status) {
          status.textContent = '播放源已就绪';
        }
      } else {
        video.src = source;
        if (status) {
          status.textContent = '正在尝试使用浏览器播放器';
        }
      }
    }

    async function playVideo() {
      await prepareVideo();
      player.classList.add('is-playing');

      try {
        await video.play();
        if (status) {
          status.textContent = '';
        }
      } catch (error) {
        if (status) {
          status.textContent = '请再次点击播放器开始播放';
        }
      }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('play', () => {
      player.classList.add('is-playing');
    });
  });
}

function init() {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayers();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
