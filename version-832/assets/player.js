(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      function load() {
        if (!video || !stream || loaded) {
          return;
        }

        loaded = true;
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function play() {
        load();

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        if (video && video.play) {
          var result = video.play();

          if (result && result.catch) {
            result.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });

        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
