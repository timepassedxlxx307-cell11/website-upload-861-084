import { H as Hls } from './hls-vendor.js';

function setupPlayer(wrapper) {
  const video = wrapper.querySelector('[data-video]');
  const button = wrapper.querySelector('[data-play-button]');
  const stream = wrapper.getAttribute('data-stream');
  let attached = false;
  let hls = null;

  function attach() {
    if (attached || !video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      attached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      attached = true;
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      }, { once: true });
      return;
    }

    video.src = stream;
    attached = true;
  }

  async function play() {
    attach();
    video.controls = true;
    wrapper.classList.add('is-playing');
    try {
      await video.play();
    } catch (error) {
      wrapper.classList.remove('is-playing');
    }
  }

  if (button && video) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      play();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      wrapper.classList.remove('is-playing');
    });
    attach();
  }
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
