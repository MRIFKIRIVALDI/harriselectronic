// Banner Carousel Module
import { loadBannersFromSheet } from './banner-loader.js';

export function initBannerCarousel() {
  let bannerCarouselInterval = null;

  function initCarousel() {
    const bannerSlides = document.querySelector('.banner-slides');
    const bannerDots = document.querySelector('.banner-dots');
    const prevBtn = document.querySelector('.banner-prev');
    const nextBtn = document.querySelector('.banner-next');

    if (!bannerSlides || !bannerDots) return;

    const slides = bannerSlides.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;

    console.log('=== INIT CAROUSEL DENGAN ' + slides.length + ' SLIDE ===');

    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateCarousel() {
      bannerSlides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      document.querySelectorAll('.banner-dot').forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', function() {
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      updateCarousel();
    });

    if (nextBtn) nextBtn.addEventListener('click', function() {
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      updateCarousel();
    });

    document.querySelectorAll('.banner-dot').forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        currentSlide = i;
        updateCarousel();
      });
    });

    // Touch swipe support for mobile
    let startX = 0;
    let endX = 0;

    bannerSlides.addEventListener('touchstart', function(e) {
      stopAutoPlay();
      startX = e.touches[0].clientX;
    });

    bannerSlides.addEventListener('touchend', function(e) {
      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      const minSwipe = 50; // Minimum swipe distance

      if (Math.abs(diffX) > minSwipe) {
        if (diffX > 0) {
          // Swipe left - next slide
          currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        } else {
          // Swipe right - prev slide
          currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        }
        updateCarousel();
      }
    });

    console.log('Banner: Manual mode (no auto-slide, arrows/dots/swipe OK!)');
  }

  function stopAutoPlay() {
    if (bannerCarouselInterval) {
      clearInterval(bannerCarouselInterval);
      bannerCarouselInterval = null;
    }
  }

  return {
    init: initCarousel,
    stopAutoPlay: stopAutoPlay
  };
}

// Init Sistem Banner
export async function initBannerSystem() {
  await loadBannersFromSheet();
  setTimeout(() => initBannerCarousel().init(), 1000);
}