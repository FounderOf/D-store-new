/**
 * D! STORE — products-firebase.js
 * Products page: category chips, filter sidebar, search, sort, grid render.
 */

let pState = { category: 'all', search: '', sort: 'default' };
let allProducts = [], allCategories = [];

document.addEventListener('DOMContentLoaded', async () => {
  initFirebase();
  const params = new URLSearchParams(window.location.search);
  if (params.get('cat')) pState.category = params.get('cat');

  try {
    [allProducts, allCategories] = await Promise.all([FireDB.getProducts(), FireDB.getCategories()]);
  } catch (e) {
    document.getElementById('productGrid').innerHTML =
      '<p class="text-dim" style="grid-column:1/-1;text-align:center">Gagal memuat produk. Periksa koneksi internet.</p>';
    return;
  }

  renderCatChips();
  renderFilterCategoryList();
  renderProductGrid();

  document.getElementById('searchInput').addEventListener('input', e => {
    pState.search = e.target.value.trim().toLowerCase();
    renderProductGrid();
  });
  document.getElementById('sortSelect').addEventListener('change', e => {
    pState.sort = e.target.value; renderProductGrid();
  });
});

function renderCatChips() {
  const strip = document.getElementById('catChipStrip');
  const all = [{ id:'all', name:'Semua', image:null }, ...allCategories];
  strip.innerHTML = all.map(cat => `
    <button class="cat-chip ${pState.category === cat.id ? 'active' : ''}" data-cat="${cat.id}">
      ${cat.image ? `<img src="${cat.image}" alt="">` : '<i class="fa-solid fa-grip"></i>'}
      <span>${cat.name}</span>
    </button>`).join('');
  strip.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      pState.category = btn.dataset.cat;
      renderCatChips(); renderFilterCategoryList(); renderProductGrid();
      const url = new URL(window.location);
      pState.category === 'all' ? url.searchParams.delete('cat') : url.searchParams.set('cat', pState.category);
      window.history.replaceState({}, '', url);
    });
  });
}

function renderFilterCategoryList() {
  const wrap = document.getElementById('filterCategoryList');
  const all = [{ id:'all', name:'Semua Produk', image:null }, ...allCategories];
  wrap.innerHTML = all.map(cat => {
    const count = cat.id === 'all' ? allProducts.length : allProducts.filter(p => p.category === cat.id).length;
    return `
      <div class="filter-option ${pState.category === cat.id ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.image ? `<img src="${cat.image}" alt="">` : '<i class="fa-solid fa-grip" style="width:28px;text-align:center"></i>'}
        <span>${cat.name}</span><span class="count">${count}</span>
      </div>`;
  }).join('');
  wrap.querySelectorAll('.filter-option').forEach(el => {
    el.addEventListener('click', () => {
      pState.category = el.dataset.cat;
      renderCatChips(); renderFilterCategoryList(); renderProductGrid();
    });
  });
}

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('productsCount');
  const emptyState = document.getElementById('emptyState');

  let products = [...allProducts];
  if (pState.category !== 'all') products = products.filter(p => p.category === pState.category);
  if (pState.search) products = products.filter(p =>
    p.name.toLowerCase().includes(pState.search) || p.desc.toLowerCase().includes(pState.search));

  if (pState.sort === 'price-asc')  products.sort((a,b) => Math.min(...a.nominals.map(n=>n.price)) - Math.min(...b.nominals.map(n=>n.price)));
  if (pState.sort === 'price-desc') products.sort((a,b) => Math.min(...b.nominals.map(n=>n.price)) - Math.min(...a.nominals.map(n=>n.price)));
  if (pState.sort === 'popular')    products.sort((a,b) => (b.sold||0) - (a.sold||0));

  countEl.textContent = `Menampilkan ${products.length} produk`;

  if (products.length === 0) {
    grid.innerHTML = ''; emptyState.style.display = 'block'; return;
  }
  emptyState.style.display = 'none';

  grid.innerHTML = products.map(p => {
    const cheapest = p.nominals.slice().sort((a,b)=>a.price-b.price)[0];
    const catName = (allCategories.find(c => c.id === p.category)||{}).name || p.category;
    return `
      <a href="order.html?product=${p.id}" class="product-card card">
        <div class="product-thumb">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${p.popular ? '<span class="product-thumb-badge"><i class="fa-solid fa-fire" style="font-size:.6rem"></i> Populer</span>' : ''}
        </div>
        <div class="product-body">
          <div class="product-cat">${catName}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-foot">
            <div class="product-price">${formatPrice(cheapest.price)}
              ${cheapest.oldPrice ? `<span class="old">${formatPrice(cheapest.oldPrice)}</span>` : ''}
            </div>
            <span class="product-buy-btn"><i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </a>`;
  }).join('');
}
