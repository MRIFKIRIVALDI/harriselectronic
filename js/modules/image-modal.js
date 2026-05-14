// Image Modal Module
export function initImageModal() {
  const imageTriggers = document.querySelectorAll('.product-image, .preview-image, .review-image, #profil-image');
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="image-modal__backdrop"></div>
    <div class="image-modal__content">
      <button class="image-modal__close" aria-label="Close image preview">×</button>
      <img src="" alt="Preview" class="image-modal__preview" />
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.image-modal__backdrop');
  const closeButton = modal.querySelector('.image-modal__close');
  const preview = modal.querySelector('.image-modal__preview');

  function openModal(src, alt) {
    preview.src = src;
    preview.alt = alt || 'Preview image';
    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
  }

  imageTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      const src = trigger.dataset.previewSrc || trigger.currentSrc || trigger.src || trigger.href;
      const alt = trigger.alt || trigger.title || 'Preview image';
      if (src) openModal(src, alt);
    });
  });

  backdrop.addEventListener('click', closeModal);
  closeButton.addEventListener('click', closeModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
}