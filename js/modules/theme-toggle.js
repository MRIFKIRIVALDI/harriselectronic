// Theme Toggle Module
export function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  function syncThemeUI(isDark) {
    if (!themeToggle) return;
    if (isDark) body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');

    // class ini dipakai di css/dark-mode.css untuk styling tombol
    themeToggle.classList.toggle('dark-mode', isDark);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.classList.add('dark-mode');
    }
  }

  function toggleTheme() {
    body.classList.toggle('dark-mode');
    themeToggle.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    initTheme();
  }
}