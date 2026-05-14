// Main application entry point
import '../music.js';
import { initNavbar } from '../modules/navbar.js';
import { initThemeToggle } from '../modules/theme-toggle.js';
import { initLanguageToggle } from '../modules/language-toggle.js';
import { initSmoothScroll } from '../modules/smooth-scroll.js';
import { initScrollAnimations } from '../modules/scroll-animations.js';
import { initReviewCounters } from '../modules/review-counters.js';
import { initContactForm } from '../modules/contact-form.js';
import { initParallax } from '../modules/parallax.js';
import { initShopeeRedirect } from '../modules/shopee-redirect.js';
import { initHoverEffects } from '../modules/hover-effects.js';
import { initParticles } from '../modules/particles.js';
import { initScrollToTop } from '../modules/scroll-to-top.js';
import { initImageModal } from '../modules/image-modal.js';
import { initBrandMarquee } from '../modules/brand-marquee.js';
import { initBannerSystem } from '../modules/banner-carousel.js';

// Initialize all modules when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initThemeToggle();
  initLanguageToggle();
  initSmoothScroll();
  initScrollAnimations();
  initReviewCounters();
  initContactForm();
  initParallax();
  initShopeeRedirect();
  initHoverEffects();
  initParticles();
  initScrollToTop();
  initImageModal();
  initBrandMarquee();
  initBannerSystem();
});