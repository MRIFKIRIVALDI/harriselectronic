 // Music autoplay (best-effort; browser policies may require user gesture)
(() => {
  const MUSIC_SRC = 'jingle_harris.mpeg';

  function createPlayer() {
    const audio = document.createElement('audio');
    audio.id = 'harrisMusic';
    audio.src = MUSIC_SRC;
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.35; // jangan terlalu keras
    audio.playsInline = true;
    audio.style.display = 'none';

    // Some browsers block autoplay; we try on user interaction fallback.
    return audio;
  }

  async function tryPlay(audio) {
    try {
      await audio.play();
      return true;
    } catch (e) {
      return false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const audio = createPlayer();
    document.body.appendChild(audio);

    // Attempt 1: immediate (may work on some setups)
    tryPlay(audio);

    // Attempt 2: after first user interaction
    const onFirstGesture = async () => {
      await tryPlay(audio);
      window.removeEventListener('click', onFirstGesture);
      window.removeEventListener('touchstart', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };

    window.addEventListener('click', onFirstGesture, { once: true });
    window.addEventListener('touchstart', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });
  });
})();

