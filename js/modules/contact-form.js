// Contact Form Module
const WA_NUMBER = '6281563166847';
const EMAIL_ADDRESS = 'Mitraelectronicsperkasa@gmail.com';

function getFormData() {
  return {
    nama: document.querySelector('#nama')?.value.trim(),
    email: document.querySelector('#email')?.value.trim(),
    telpon: document.querySelector('#telpon')?.value.trim(),
    pesan: document.querySelector('#pesan')?.value.trim(),
  };
}

function validateForm(data, requireEmail = false) {
  if (!data.nama || !data.telpon || !data.pesan) {
    alert('Mohon lengkapi Nama, No. Telepon, dan Pesan!');
    return false;
  }
  if (requireEmail && !data.email) {
    alert('Mohon lengkapi Email!');
    return false;
  }
  return true;
}

function openWhatsApp(data) {
  const waMessage = `Halo Harris Elektronik!%0A%0A👤 *Nama:* ${encodeURIComponent(data.nama)}%0A📱 *Telepon/WA:* ${encodeURIComponent(data.telpon)}%0A📧 *Email:* ${encodeURIComponent(data.email)}%0A%0A💬 *Pesan:*%0A${encodeURIComponent(data.pesan)}%0A%0ATerima kasih! 😊`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${waMessage}`, '_blank');
}

function openEmail(data) {
  const subject = encodeURIComponent(`Pesan dari Website - ${data.nama}`);
  const body = encodeURIComponent(`Halo Harris Elektronik,%0A%0ANama: ${data.nama}%0ATelepon/WA: ${data.telpon}%0AEmail: ${data.email}%0A%0APesan:%0A${data.pesan}%0A%0ATerima kasih! 😊`);
  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_ADDRESS)}&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
}

function resetForm() {
  const form = document.querySelector('.contact-form');
  if (form) form.reset();
}

export function initContactForm() {
  const contactForm = document.querySelector('.contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Pilih tombol WhatsApp atau Email untuk mengirim pesan!');
  });

  const waButton = document.querySelector('.wa-btn');
  const emailButton = document.querySelector('.email-btn');

  if (waButton) {
    waButton.addEventListener('click', function() {
      const data = getFormData();
      if (!validateForm(data)) return;
      openWhatsApp(data);
      resetForm();
    });
  }

  if (emailButton) {
    emailButton.addEventListener('click', function() {
      const data = getFormData();
      if (!validateForm(data, true)) return;
      openEmail(data);
      resetForm();
    });
  }

  window.kirimKeWA = function() {
    const data = getFormData();
    if (!validateForm(data)) return;
    openWhatsApp(data);
    resetForm();
  };

  window.kirimKeEmail = function() {
    const data = getFormData();
    if (!validateForm(data, true)) return;
    openEmail(data);
    resetForm();
  };
}