(function() {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var stream = player.getAttribute('data-stream');
  var hls = null;

  function attachStream() {
    if (!video || !stream || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlayback() {
    attachStream();
    player.classList.add('is-playing');
    video.controls = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function() {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('pagehide', function() {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
