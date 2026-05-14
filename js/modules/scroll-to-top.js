// Scroll To Top Module
export function initScrollToTop() {
  let scrollTopBtn = document.querySelector('.scroll-to-top');
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.type = 'button';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border:none;border-radius:50%;background:#ff7300;color:white;font-size:1.5rem;cursor:pointer;opacity:0;transform:scale(0);transition:all 0.3s ease;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(scrollTopBtn);
  }

  window.addEventListener('scroll', function() {
    const shown = window.scrollY > 500;
    scrollTopBtn.style.opacity = shown ? '1' : '0';
    scrollTopBtn.style.transform = shown ? 'scale(1)' : 'scale(0)';
  });

  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}