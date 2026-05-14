// Smooth Scroll Module
export function initSmoothScroll() {
  document.querySelectorAll('a[href^=\"#\"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}