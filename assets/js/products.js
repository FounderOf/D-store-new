/**
 * D! STORE — products.js
 * Handles category chips, sidebar filters, search, sorting, and grid rendering
 * on products.html. State is driven by URL ?cat= param + in-memory filters.
 */

let pState = { category: 'all', search: '', sort: 'default' };

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) pState.category = params.get('cat');

  renderCatChips();
  renderFilterCategoryList();
  renderProductGrid();

  document.getElementById('searchInput').addEventListener('input', e => {
    pState.search = e.target.value.trim().toLowerCase();
    renderProductGrid();
  });

  document.getElementById('sortSelect').addEventListener('change', e => {
    pState.sort = e.target.value;
    renderProductGrid();
  });
});

function renderCatChips() {
  const strip = document.getElementById('catChipStrip');
  const categories = DStoreData.getCategories();
  const all = [{ id: 'all', name: 'Semua', image: null }, ...categories];

  strip.innerHTML = all.map(cat => `
    <button class="cat-chip ${pState.category === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.image ? `<img src="${cat.image}" alt="">` : '<i class="fa-solid fa-grip"></i>'}
      <span>${cat.name}</span>
    </button>
  `).join('');

  strip.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      pState.category = btn.dataset.cat;
      renderCatChips();
      renderFilterCategoryList();
      renderProductGrid();
      const url = new URL(window.location);
      if (pState.category === 'all') url.searchParams.delete('cat');
      else url.searchParams.set('cat', pState.category);
      window.history.replaceState({}, '', url);
    });
  });
}

function renderFilterCategoryList() {
  const wrap = document.getElementById('filterCategoryList');
  const categories = DStoreData.getCategories();
  const products = DStoreData.getProducts();
  const all = [{ id: 'all', name: 'Semua Produk', image: null }, ...categories];

  wrap.innerHTML = all.map(cat => {
    const count = cat.id === 'all' ? products.length : products.filter(p => p.category === cat.id).length;
    return `
      <div class="filter-option ${pState.category === cat.id ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.image ? `<img src="${cat.image}" alt="">` : '<i class="fa-solid fa-grip" style="width:28px;text-align:center"></i>'}
        <span>${cat.name}</span>
        <span class="count">${count}</span>
      </div>
    `;
  }).join('');

  wrap.querySelectorAll('.filter-option').forEach(el => {
    el.addEventListener('click', () => {
      pState.category = el.dataset.cat;
      renderCatChips();
      renderFilterCategoryList();
      renderProductGrid();
    });
  });
}

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('productsCount');
  const emptyState = document.getElementById('emptyState');
  let products = DStoreData.getProducts();

  if (pState.category !== 'all') {
    products = products.filter(p => p.category === pState.category);
  }
  if (pState.search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(pState.search) ||
      p.desc.toLowerCase().includes(pState.search)
    );
  }

  if (pState.sort === 'price-asc') {
    products = products.slice().sort((a, b) => Math.min(...a.nominals.map(n => n.price)) - Math.min(...b.nominals.map(n => n.price)));
  } else if (pState.sort === 'price-desc') {
    products = products.slice().sort((a, b) => Math.min(...b.nominals.map(n => n.price)) - Math.min(...a.nominals.map(n => n.price)));
  } else if (pState.sort === 'popular') {
    products = products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0));
  }

  countEl.textContent = `Menampilkan ${products.length} produk`;

  if (products.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  grid.innerHTML = products.map(p => {
    const cheapest = p.nominals.slice().sort((a, b) => a.price - b.price)[0];
    return `
      <a href="order.html?product=${p.id}" class="product-card card">
        <div class="product-thumb">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${p.popular ? '<span class="product-thumb-badge"><i class="fa-solid fa-fire" style="font-size:0.6rem"></i> Populer</span>' : ''}
        </div>
        <div class="product-body">
          <div class="product-cat">${categoryName(p.category)}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-foot">
            <div class="product-price">${DStoreData.formatPrice(cheapest.price)}
              ${cheapest.oldPrice ? `<span class="old">${DStoreData.formatPrice(cheapest.oldPrice)}</span>` : ''}
            </div>
            <span class="product-buy-btn"><i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  if (window.AOS) AOS.refreshHard();
}

function categoryName(catId) {
  const cat = DStoreData.getCategories().find(c => c.id === catId);
  return cat ? cat.name : catId;
}
