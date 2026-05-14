// Review Counters Module
export function initReviewCounters() {
  const reviewSection = document.querySelector('#review');
  if (!reviewSection) return;

  const counters = Array.from(reviewSection.querySelectorAll('.stat-counter'));
  if (counters.length === 0) return;

  function animateCounters() {
    counters.forEach(counter => {
      const rawTarget = counter.getAttribute('data-target');
      const target = parseFloat(rawTarget);
      if (Number.isNaN(target)) return;

      const duration = 2000;
      const start = performance.now();
      const decimal = rawTarget.includes('.');

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = target * (1 - Math.pow(1 - progress, 3));
        counter.textContent = decimal ? value.toFixed(1) : Math.floor(value).toLocaleString('id-ID');
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  observer.observe(reviewSection);
}