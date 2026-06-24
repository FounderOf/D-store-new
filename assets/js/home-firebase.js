/**
 * D! STORE — home-firebase.js
 * Landing page: render categories grid, bestseller swiper, FAQ accordion,
 * dan marquee dari Firestore.
 */

document.addEventListener('DOMContentLoaded', async () => {
  initFirebase();
  duplicateMarquee();
  initFaqAccordion();
  await Promise.all([renderPopularGames(), renderBestSellers()]);
});

async function renderPopularGames() {
  const grid = document.getElementById('popularGamesGrid');
  if (!grid) return;
  grid.innerHTML = Array(5).fill('<div class="game-tile skeleton" style="aspect-ratio:3/4"></div>').join('');

  try {
    const [categories, products] = await Promise.all([
      FireDB.getCategories(), FireDB.getProducts()
    ]);
    grid.innerHTML = categories.map((cat, i) => {
      const prod = products.find(p => p.category === cat.id);
      const startPrice = prod ? Math.min(...prod.nominals.map(n => n.price)) : null;
      return `
        <a href="products.html?cat=${cat.id}" class="game-tile" data-aos="fade-up" data-aos-delay="${(i % 5) * 60}">
          ${prod && prod.popular ? '<span class="game-tile-badge">Populer</span>' : ''}
          <img src="${cat.image}" alt="${cat.name}" loading="lazy">
          <div class="game-tile-overlay">
            <div class="game-tile-name">${cat.name}</div>
            <div class="game-tile-cat">${startPrice ? 'Mulai ' + formatPrice(startPrice) : 'Voucher Digital'}</div>
          </div>
        </a>`;
    }).join('');
    if (window.AOS) AOS.refresh();
  } catch (e) {
    grid.innerHTML = '<p class="text-dim" style="text-align:center;grid-column:1/-1">Gagal memuat kategori.</p>';
  }
}

async function renderBestSellers() {
  const wrapper = document.getElementById('bestsellerWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = Array(4).fill('<div class="swiper-slide"><div class="product-card card skeleton" style="height:280px"></div></div>').join('');

  try {
    const products = (await FireDB.getProducts())
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 8);

    wrapper.innerHTML = products.map(p => {
      const cheapest = p.nominals.slice().sort((a, b) => a.price - b.price)[0];
      return `
        <div class="swiper-slide">
          <a href="order.html?product=${p.id}" class="product-card card">
            <div class="product-thumb">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
              <span class="product-thumb-badge"><i class="fa-solid fa-fire" style="font-size:.6rem"></i> Terlaris</span>
            </div>
            <div class="product-body">
              <div class="product-cat">${(p.sold || 0).toLocaleString('id-ID')}+ terjual</div>
              <div class="product-name">${p.name}</div>
              <div class="product-desc">${p.desc}</div>
              <div class="product-foot">
                <div class="product-price">Mulai ${formatPrice(cheapest.price)}</div>
                <span class="product-buy-btn"><i class="fa-solid fa-arrow-right"></i></span>
              </div>
            </div>
          </a>
        </div>`;
    }).join('');

    if (window.Swiper) {
      new Swiper('#bestsellerSwiper', {
        slidesPerView: 1.2, spaceBetween: 16,
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: { 480:{slidesPerView:2.2}, 768:{slidesPerView:3.2}, 1100:{slidesPerView:4} }
      });
    }
  } catch (e) {
    wrapper.innerHTML = '';
  }
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-accordion').querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open'); el.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        item.querySelector('.faq-a').style.maxHeight = item.querySelector('.faq-a').scrollHeight + 'px';
      }
    });
  });
}

function duplicateMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;
}
