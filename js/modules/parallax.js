// Parallax Module
export function initParallax() {
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(element => {
      let rate = parseFloat(element.getAttribute('data-parallax-rate'));
      if (Number.isNaN(rate)) {
        rate = parseFloat(element.getAttribute('data-speed'));
      }
      if (Number.isNaN(rate)) {
        rate = 0.5;
      }
      element.style.transform = `translateY(${scrolled * rate}px)`;
    });
  });
}