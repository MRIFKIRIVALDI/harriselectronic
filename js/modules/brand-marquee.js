// Brand Marquee Module
export function initBrandMarquee() {
  const brandTrack = document.querySelector('.brand-track');
  if (!brandTrack) return;

  const originalLogos = Array.from(brandTrack.querySelectorAll('a.brand-logo'));
  if (originalLogos.length === 0) return;

  originalLogos.forEach(logo => {
    const clone = logo.cloneNode(true);
    brandTrack.appendChild(clone);
  });

  brandTrack.querySelectorAll('a.brand-logo').forEach((link, index) => {
    const label = link.getAttribute('aria-label') || `Brand logo ${index + 1}`;
    link.setAttribute('aria-label', label);
    link.setAttribute('tabindex', '0');

    link.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
}