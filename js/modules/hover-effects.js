// Hover Effects Module
export function initHoverEffects() {
  document.querySelectorAll('.product-card, .card, .btn, .kirim-btn, .shopee-card, .review-card').forEach(el => {
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
}