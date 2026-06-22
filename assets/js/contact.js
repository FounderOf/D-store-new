/**
 * D! STORE — contact.js
 * Validates and "sends" the contact form (stored locally as a demo since
 * there is no backend; in production this would POST to an API/WhatsApp link).
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateContactForm()) return;
    sendContactMessage();
  });
});

function validateContactForm() {
  let valid = true;

  const name = document.getElementById('cfName');
  if (!validateField(name, { required: true, minLength: 3, message: 'Nama minimal 3 karakter' })) valid = false;

  const phone = document.getElementById('cfPhone');
  if (!validateField(phone, { required: true, minLength: 9, pattern: /^[0-9+\-\s]+$/, message: 'Nomor WhatsApp tidak valid' })) valid = false;

  const email = document.getElementById('cfEmail');
  if (email.value.trim() && !validateField(email, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' })) valid = false;

  const subject = document.getElementById('cfSubject');
  if (!validateField(subject, { required: true, minLength: 1, message: 'Pilih subjek pesan' })) valid = false;

  const message = document.getElementById('cfMessage');
  if (!validateField(message, { required: true, minLength: 10, message: 'Pesan minimal 10 karakter' })) valid = false;

  return valid;
}

function sendContactMessage() {
  const btn = document.getElementById('contactSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

  setTimeout(() => {
    dstoreToast('Pesan berhasil dikirim! Tim kami akan segera merespon.', 'success');
    document.getElementById('contactForm').reset();
    document.querySelectorAll('#contactForm .is-valid, #contactForm .is-invalid').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Pesan';
  }, 800);
}
