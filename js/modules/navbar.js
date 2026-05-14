// Navbar Module
export function initNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  function toggleNavMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleNavMenu);
  }

  // Close menu on nav link click (mobile)
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}