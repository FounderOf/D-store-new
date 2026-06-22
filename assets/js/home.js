/**
 * D! STORE — home.js
 * Populates popular games grid, bestseller swiper, and FAQ accordion on index.html
 */

document.addEventListener('DOMContentLoaded', () => {
  renderPopularGames();
  renderBestSellers();
  initFaqAccordion();
  duplicateMarquee();
});

function renderPopularGames() {
  const grid = document.getElementById('popularGamesGrid');
  if (!grid) return;
  const categories = DStoreData.getCategories();
  const products = DStoreData.getProducts();

  grid.innerHTML = categories.map((cat, i) => {
    const prod = products.find(p => p.category === cat.id);
    const startPrice = prod ? Math.min(...prod.nominals.map(n => n.price)) : null;
    return `
      <a href="products.html?cat=${cat.id}" class="game-tile" data-aos="fade-up" data-aos-delay="${(i % 5) * 60}">
        ${prod && prod.popular ? '<span class="game-tile-badge">Populer</span>' : ''}
        <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        <div class="game-tile-overlay">
          <div class="game-tile-name">${cat.name}</div>
          <div class="game-tile-cat">${startPrice ? 'Mulai ' + DStoreData.formatPrice(startPrice) : 'Voucher Digital'}</div>
        </div>
      </a>
    `;
  }).join('');
}

function renderBestSellers() {
  const wrapper = document.getElementById('bestsellerWrapper');
  if (!wrapper) return;
  const products = DStoreData.getProducts()
    .slice()
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 8);

  wrapper.innerHTML = products.map(p => {
    const cheapest = p.nominals[0];
    return `
      <div class="swiper-slide">
        <a href="order.html?product=${p.id}" class="product-card card">
          <div class="product-thumb">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="product-thumb-badge"><i class="fa-solid fa-fire" style="font-size:0.6rem"></i> Terlaris</span>
          </div>
          <div class="product-body">
            <div class="product-cat">${p.sold.toLocaleString('id-ID')}+ terjual</div>
            <div class="product-name">${p.name}</div>
            <div class="product-desc">${p.desc}</div>
            <div class="product-foot">
              <div class="product-price">Mulai ${DStoreData.formatPrice(cheapest.price)}</div>
              <span class="product-buy-btn"><i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');

  if (window.Swiper) {
    new Swiper('#bestsellerSwiper', {
      slidesPerView: 1.2,
      spaceBetween: 16,
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        480: { slidesPerView: 2.2 },
        768: { slidesPerView: 3.2 },
        1100: { slidesPerView: 4 }
      }
    });
  }
}

function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close siblings
      item.parentElement.querySelectorAll('.faq-item.open').forEach(el => {
        if (el !== item) {
          el.classList.remove('open');
          el.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
}

function duplicateMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}
