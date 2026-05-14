// Language Toggle Module
import { translations } from './translations.js';

export function initLanguageToggle() {
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');
  const langs = ['id', 'en', 'es', 'ar', 'ja', 'ko', 'zh'];

  function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'id';
    setLanguage(savedLang);
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;

    // Update all elements with data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.getAttribute('data-lang-key');
      if (translations[lang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // Update active language button
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Save to localStorage
    localStorage.setItem('language', lang);
  }

  function toggleDropdown() {
    if (langDropdown) {
      langDropdown.classList.toggle('active');
    }
  }

  function closeDropdown() {
    if (langDropdown) {
      langDropdown.classList.remove('active');
    }
  }

  // Event listeners
  if (langToggle) {
    langToggle.addEventListener('click', toggleDropdown);
  }

  if (langDropdown) {
    langDropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('lang-option')) {
        const lang = e.target.getAttribute('data-lang');
        setLanguage(lang);
        closeDropdown();
      }
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!langToggle?.contains(e.target) && !langDropdown?.contains(e.target)) {
      closeDropdown();
    }
  });

  // Initialize
  initLanguage();
}