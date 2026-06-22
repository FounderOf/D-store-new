/**
 * D! STORE — common.js
 * Shared behavior across all public pages: navbar, preloader, AOS/GSAP init,
 * footer year, mobile nav, and small utility helpers.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initFooterYear();
  initAOS();
  initSmoothAnchors();
});

/* ---------------------------------------------------------------------- */
/* Preloader                                                              */
/* ---------------------------------------------------------------------- */
function initPreloader() {
  const pre = document.querySelector('.preloader');
  if (!pre) return;
  const bar = pre.querySelector('.preloader-bar span');

  if (window.gsap) {
    gsap.to(bar, { width: '100%', duration: 0.9, ease: 'power2.out' });
  } else if (bar) {
    bar.style.transition = 'width 0.9s ease';
    requestAnimationFrame(() => { bar.style.width = '100%'; });
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      pre.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      runHeroEntrance();
    }, 450);
  });

  // Fallback in case load event already fired or takes too long
  setTimeout(() => {
    if (!pre.classList.contains('hidden')) {
      pre.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      runHeroEntrance();
    }
  }, 2500);
}

/* ---------------------------------------------------------------------- */
/* Navbar: scroll state + mobile toggle                                   */
/* ---------------------------------------------------------------------- */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = links.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      const icon = toggle.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    }));
  }

  // Mark active link based on current page
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Footer year                                                            */
/* ---------------------------------------------------------------------- */
function initFooterYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------------------------------------------------------------------- */
/* AOS init                                                               */
/* ---------------------------------------------------------------------- */
function initAOS() {
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }
}

/* ---------------------------------------------------------------------- */
/* Smooth anchor scrolling (for in-page #links)                           */
/* ---------------------------------------------------------------------- */
function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector('.navbar')?.offsetHeight || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Hero entrance (GSAP) — called after preloader hides                    */
/* ---------------------------------------------------------------------- */
function runHeroEntrance() {
  if (!window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (document.querySelector('.hero-title .line')) {
    tl.from('.hero-title .line', { yPercent: 110, duration: 0.9, stagger: 0.12 });
  }
  if (document.querySelector('.hero-sub')) {
    tl.from('.hero-sub', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5');
  }
  if (document.querySelector('.hero-cta')) {
    tl.from('.hero-cta', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5');
  }
  if (document.querySelector('.hero-stats')) {
    tl.from('.hero-stats', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5');
  }
  if (document.querySelector('.hero-visual')) {
    tl.from('.hero-visual', { scale: 0.85, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.9');
  }

  animateCounters();
}

/* ---------------------------------------------------------------------- */
/* Number counter animation                                               */
/* ---------------------------------------------------------------------- */
function animateCounters() {
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const decimals = el.dataset.counter.includes('.') ? 1 : 0;
    const obj = { val: 0 };
    if (window.gsap) {
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = obj.val.toFixed(decimals).toLocaleString('id-ID'); }
      });
    } else {
      el.textContent = target.toLocaleString('id-ID');
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Toast helper (uses SweetAlert2 if present, else fallback)              */
/* ---------------------------------------------------------------------- */
function dstoreToast(message, type = 'success') {
  if (window.Swal) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
      background: '#0F172A',
      color: '#FFFFFF'
    });
    return;
  }
  // Fallback custom toast
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const item = document.createElement('div');
  item.className = 'toast-item';
  item.textContent = message;
  stack.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}
window.dstoreToast = dstoreToast;

/* ---------------------------------------------------------------------- */
/* Confirm dialog helper                                                  */
/* ---------------------------------------------------------------------- */
function dstoreConfirm(opts) {
  const { title = 'Anda yakin?', text = '', confirmText = 'Ya, lanjutkan', cancelText = 'Batal', icon = 'warning' } = opts;
  if (window.Swal) {
    return Swal.fire({
      title, text, icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#00E5FF',
      cancelButtonColor: '#374151',
      background: '#0F172A',
      color: '#FFFFFF'
    }).then(r => r.isConfirmed);
  }
  return Promise.resolve(window.confirm(`${title}\n${text}`));
}
window.dstoreConfirm = dstoreConfirm;

/* ---------------------------------------------------------------------- */
/* Simple form validation helper                                          */
/* ---------------------------------------------------------------------- */
function validateField(input, { required = true, minLength = 1, pattern = null, message = 'Wajib diisi' } = {}) {
  const wrap = input.closest('.form-group') || input.parentElement;
  let errorEl = wrap.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span></span>`;
    wrap.appendChild(errorEl);
  }
  const span = errorEl.querySelector('span');
  const value = input.value.trim();

  let valid = true;
  if (required && value.length < minLength) valid = false;
  if (valid && pattern && !pattern.test(value)) valid = false;

  if (!valid) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    span.textContent = message;
    errorEl.classList.add('show');
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    errorEl.classList.remove('show');
  }
  return valid;
}
window.validateField = validateField;

/* Currency formatter shortcut available globally even before data.js loads */
function fmtRp(num) { return 'Rp' + Number(num).toLocaleString('id-ID'); }
window.fmtRp = fmtRp;
