/**
 * D! STORE — admin.js
 * Full CRUD for products, categories, banners, plus store settings form.
 * All data persists through DStoreData (localStorage).
 */

let adminProductSearch = '';
let editingProductId = null;
let editingCategoryId = null;
let editingBannerId = null;
let tempNominals = [];
let tempFields = [];
let tempProductImage = '';

document.addEventListener('DOMContentLoaded', () => {
  dstoreGuardPage('admin');

  document.getElementById('adminLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('adminUsername').value.trim();
    const p = document.getElementById('adminPassword').value;
    if (dstoreLogin('admin', u, p)) {
      dstoreGuardPage('admin');
      initAdminDashboard();
    } else {
      dstoreToast('Username atau password salah', 'error');
    }
  });

  document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
    const ok = await dstoreConfirm({ title: 'Keluar dari Admin Panel?', confirmText: 'Ya, Keluar' });
    if (ok) dstoreLogout('admin');
  });

  if (dstoreCheckSession('admin')) initAdminDashboard();

  bindSidebarToggleAdmin();
  bindModalBackdrops();
});

function initAdminDashboard() {
  bindAdminTabs();
  renderProductsTable();
  renderCategoriesTable();
  renderBannersTable();
  loadSettingsForm();

  document.getElementById('productSearchInput').addEventListener('input', e => {
    adminProductSearch = e.target.value.trim().toLowerCase();
    renderProductsTable();
  });

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
  document.getElementById('addBannerBtn').addEventListener('click', () => openBannerModal());

  document.getElementById('settingsForm').addEventListener('submit', e => {
    e.preventDefault();
    saveSettings();
  });
}

/* Tabs / sidebar */
function bindAdminTabs() {
  const titles = { products: 'Produk & Voucher', categories: 'Kategori', banners: 'Banner', settings: 'Pengaturan Toko' };
  document.querySelectorAll('.dash-nav a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.dash-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.dash-tab-content').forEach(c => {
        c.style.display = c.dataset.tabcontent === a.dataset.tab ? 'block' : 'none';
      });
      document.getElementById('topbarTitle').textContent = titles[a.dataset.tab];
      closeSidebarMobileAdmin();
    });
  });
}

function bindSidebarToggleAdmin() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  const toggle = document.getElementById('sidebarToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
  overlay.addEventListener('click', closeSidebarMobileAdmin);
}
function closeSidebarMobileAdmin() {
  document.getElementById('dashSidebar') && document.getElementById('dashSidebar').classList.remove('open');
  document.getElementById('dashOverlay') && document.getElementById('dashOverlay').classList.remove('show');
}

function bindModalBackdrops() {
  document.querySelectorAll('.modal-backdrop-custom').forEach(backdrop => {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('show'); });
  });
}

/* PRODUCTS TABLE */
function renderProductsTable() {
  let products = DStoreData.getProducts();
  if (adminProductSearch) products = products.filter(p => p.name.toLowerCase().includes(adminProductSearch));

  const tbody = document.getElementById('productsTableBody');
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Belum ada produk.</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => {
    const cheapest = Math.min(...p.nominals.map(n => n.price));
    const catName = (DStoreData.getCategories().find(c => c.id === p.category) || {}).name || p.category;
    return '<tr>' +
      '<td><img src="' + p.image + '" alt="' + escAttr(p.name) + '" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid var(--border-strong)"></td>' +
      '<td>' + p.name + '</td>' +
      '<td>' + catName + '</td>' +
      '<td>' + p.nominals.length + ' nominal</td>' +
      '<td>' + DStoreData.formatPrice(cheapest) + '</td>' +
      '<td><label class="switch"><input type="checkbox" ' + (p.popular ? 'checked' : '') + ' data-toggle-popular="' + p.id + '"><span class="switch-track"></span></label></td>' +
      '<td class="cell-actions"><button class="icon-btn" data-edit-product="' + p.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
      '<button class="icon-btn danger" data-delete-product="' + p.id + '" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>' +
      '</tr>';
  }).join('');

  tbody.querySelectorAll('[data-edit-product]').forEach(btn => btn.addEventListener('click', () => openProductModal(btn.dataset.editProduct)));
  tbody.querySelectorAll('[data-delete-product]').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteProduct)));
  tbody.querySelectorAll('[data-toggle-popular]').forEach(chk => chk.addEventListener('change', () => togglePopular(chk.dataset.togglePopular, chk.checked)));
}

function togglePopular(productId, value) {
  const products = DStoreData.getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return;
  products[idx].popular = value;
  DStoreData.saveProducts(products);
  dstoreToast('Status populer diperbarui', 'success');
}

async function deleteProduct(productId) {
  const ok = await dstoreConfirm({ title: 'Hapus Produk?', text: 'Produk yang dihapus tidak dapat dikembalikan.', confirmText: 'Ya, Hapus', icon: 'warning' });
  if (!ok) return;
  DStoreData.saveProducts(DStoreData.getProducts().filter(p => p.id !== productId));
  dstoreToast('Produk berhasil dihapus', 'success');
  renderProductsTable();
}

/* PRODUCT MODAL */
function openProductModal(productId) {
  editingProductId = productId || null;
  const product = productId ? DStoreData.getProduct(productId) : null;
  tempNominals = product ? JSON.parse(JSON.stringify(product.nominals)) : [];
  tempFields = product ? JSON.parse(JSON.stringify(product.fields)) : [{ key: 'userId', label: 'User ID', placeholder: 'Masukkan User ID' }];
  tempProductImage = product ? product.image : '';

  const categories = DStoreData.getCategories();
  const box = document.getElementById('productModalBox');

  const catOptions = categories.map(c => '<option value="' + c.id + '"' + (product && product.category === c.id ? ' selected' : '') + '>' + c.name + '</option>').join('');

  box.innerHTML = [
    '<div class="modal-head"><h3>' + (product ? 'Edit Produk' : 'Tambah Produk Baru') + '</h3>',
    '<button class="modal-close" id="closeProductModal"><i class="fa-solid fa-xmark"></i></button></div>',
    '<div class="form-group"><label class="form-label">Gambar Produk</label>',
    '<div class="img-upload-box" id="productImgBox">',
    tempProductImage ? '<img src="' + tempProductImage + '" alt="Preview">' : '<i class="fa-solid fa-image" style="font-size:1.5rem"></i><span>Klik untuk upload</span>',
    '<input type="file" id="productImgInput" accept="image/*"></div></div>',
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">',
    '<div class="form-group"><label class="form-label">Nama Produk <span class="required">*</span></label>',
    '<input type="text" class="form-control" id="pfName" value="' + (product ? escAttr(product.name) : '') + '"></div>',
    '<div class="form-group"><label class="form-label">Kategori <span class="required">*</span></label>',
    '<select class="form-control" id="pfCategory">' + catOptions + '</select></div></div>',
    '<div class="form-group"><label class="form-label">Deskripsi</label>',
    '<textarea class="form-control" id="pfDesc" rows="2">' + (product ? esc(product.desc) : '') + '</textarea></div>',
    '<hr class="divider">',
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.7rem">',
    '<h4 style="font-size:var(--fs-sm)">Field Input Akun</h4>',
    '<button type="button" class="btn btn-ghost btn-sm" id="addFieldBtn"><i class="fa-solid fa-plus"></i> Tambah Field</button></div>',
    '<div id="fieldsListWrap"></div>',
    '<hr class="divider">',
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.7rem">',
    '<h4 style="font-size:var(--fs-sm)">Nominal & Harga</h4>',
    '<button type="button" class="btn btn-ghost btn-sm" id="addNominalBtn"><i class="fa-solid fa-plus"></i> Tambah Nominal</button></div>',
    '<div id="nominalsListWrap"></div>',
    '<div class="modal-foot"><button class="btn btn-outline" id="cancelProductModal">Batal</button>',
    '<button class="btn btn-primary" id="saveProductBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan Produk</button></div>'
  ].join('');

  renderFieldsList();
  renderNominalsList();

  document.getElementById('productImgBox').addEventListener('click', () => document.getElementById('productImgInput') && document.getElementById('productImgInput').click());
  document.getElementById('productImgInput').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      tempProductImage = ev.target.result;
      document.getElementById('productImgBox').innerHTML = '<img src="' + tempProductImage + '" alt="Preview"><input type="file" id="productImgInput" accept="image/*">';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('addFieldBtn').addEventListener('click', () => {
    tempFields.push({ key: 'field' + (tempFields.length + 1), label: '', placeholder: '' });
    renderFieldsList();
  });

  document.getElementById('addNominalBtn').addEventListener('click', () => {
    tempNominals.push({ id: 'n' + Date.now(), label: '', price: 0, oldPrice: null, popular: false });
    renderNominalsList();
  });

  document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
  document.getElementById('cancelProductModal').addEventListener('click', closeProductModal);
  document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

  document.getElementById('productModal').classList.add('show');
}

function renderFieldsList() {
  const wrap = document.getElementById('fieldsListWrap');
  if (!wrap) return;
  if (tempFields.length === 0) { wrap.innerHTML = '<p class="form-hint">Belum ada field.</p>'; return; }
  wrap.innerHTML = tempFields.map((f, i) =>
    '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:0.5rem;margin-bottom:0.5rem;align-items:end">' +
    '<div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:0.72rem">Label</label>' +
    '<input type="text" class="form-control" data-fl="' + i + '" value="' + escAttr(f.label) + '" placeholder="User ID"></div>' +
    '<div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:0.72rem">Placeholder</label>' +
    '<input type="text" class="form-control" data-fp="' + i + '" value="' + escAttr(f.placeholder) + '" placeholder="Contoh: 12345"></div>' +
    '<button type="button" class="icon-btn danger" data-rf="' + i + '"><i class="fa-solid fa-trash"></i></button></div>'
  ).join('');

  wrap.querySelectorAll('[data-fl]').forEach(inp => inp.addEventListener('input', e => {
    const idx = Number(inp.dataset.fl);
    tempFields[idx].label = e.target.value;
    tempFields[idx].key = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '') || ('field' + idx);
  }));
  wrap.querySelectorAll('[data-fp]').forEach(inp => inp.addEventListener('input', e => { tempFields[Number(inp.dataset.fp)].placeholder = e.target.value; }));
  wrap.querySelectorAll('[data-rf]').forEach(btn => btn.addEventListener('click', () => { tempFields.splice(Number(btn.dataset.rf), 1); renderFieldsList(); }));
}

function renderNominalsList() {
  const wrap = document.getElementById('nominalsListWrap');
  if (!wrap) return;
  if (tempNominals.length === 0) { wrap.innerHTML = '<p class="form-hint">Belum ada nominal.</p>'; return; }
  wrap.innerHTML = tempNominals.map((n, i) =>
    '<div style="display:grid;grid-template-columns:1.4fr 1fr 1fr auto auto;gap:0.5rem;margin-bottom:0.5rem;align-items:end">' +
    '<div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:0.72rem">Label</label>' +
    '<input type="text" class="form-control" data-nl="' + i + '" value="' + escAttr(n.label) + '" placeholder="86 Diamonds"></div>' +
    '<div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:0.72rem">Harga (Rp)</label>' +
    '<input type="number" class="form-control" data-np="' + i + '" value="' + n.price + '" min="0"></div>' +
    '<div class="form-group" style="margin-bottom:0"><label class="form-label" style="font-size:0.72rem">Harga Coret</label>' +
    '<input type="number" class="form-control" data-nop="' + i + '" value="' + (n.oldPrice || '') + '" min="0" placeholder="-"></div>' +
    '<label class="switch" title="Terlaris"><input type="checkbox" data-npp="' + i + '"' + (n.popular ? ' checked' : '') + '><span class="switch-track"></span></label>' +
    '<button type="button" class="icon-btn danger" data-rn="' + i + '"><i class="fa-solid fa-trash"></i></button></div>'
  ).join('');

  wrap.querySelectorAll('[data-nl]').forEach(inp => inp.addEventListener('input', e => { tempNominals[Number(inp.dataset.nl)].label = e.target.value; }));
  wrap.querySelectorAll('[data-np]').forEach(inp => inp.addEventListener('input', e => { tempNominals[Number(inp.dataset.np)].price = Number(e.target.value) || 0; }));
  wrap.querySelectorAll('[data-nop]').forEach(inp => inp.addEventListener('input', e => { tempNominals[Number(inp.dataset.nop)].oldPrice = e.target.value ? Number(e.target.value) : null; }));
  wrap.querySelectorAll('[data-npp]').forEach(chk => chk.addEventListener('change', e => { tempNominals[Number(chk.dataset.npp)].popular = e.target.checked; }));
  wrap.querySelectorAll('[data-rn]').forEach(btn => btn.addEventListener('click', () => { tempNominals.splice(Number(btn.dataset.rn), 1); renderNominalsList(); }));
}

function saveProduct() {
  const name = document.getElementById('pfName').value.trim();
  const category = document.getElementById('pfCategory').value;
  const desc = document.getElementById('pfDesc').value.trim();

  if (!name) { dstoreToast('Nama produk wajib diisi', 'error'); return; }
  if (tempNominals.length === 0) { dstoreToast('Tambahkan minimal satu nominal', 'error'); return; }
  if (tempFields.length === 0) { dstoreToast('Tambahkan minimal satu field input', 'error'); return; }
  if (tempNominals.some(n => !n.label || !n.price)) { dstoreToast('Lengkapi label dan harga setiap nominal', 'error'); return; }
  if (tempFields.some(f => !f.label)) { dstoreToast('Lengkapi label setiap field', 'error'); return; }

  const products = DStoreData.getProducts();
  if (editingProductId) {
    const idx = products.findIndex(p => p.id === editingProductId);
    products[idx] = { ...products[idx], name, category, desc, image: tempProductImage || products[idx].image, nominals: tempNominals, fields: tempFields };
  } else {
    products.push({ id: 'p-' + Date.now(), name, category, desc, image: tempProductImage || '../assets/images/cat-mlbb.svg', popular: false, sold: 0, nominals: tempNominals, fields: tempFields });
  }
  DStoreData.saveProducts(products);
  dstoreToast(editingProductId ? 'Produk berhasil diperbarui' : 'Produk baru berhasil ditambahkan', 'success');
  closeProductModal();
  renderProductsTable();
}

function closeProductModal() { document.getElementById('productModal').classList.remove('show'); }

/* CATEGORIES */
function renderCategoriesTable() {
  const categories = DStoreData.getCategories();
  const products = DStoreData.getProducts();
  const tbody = document.getElementById('categoriesTableBody');

  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>Belum ada kategori.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = categories.map(c =>
    '<tr><td><img src="' + c.image + '" alt="' + escAttr(c.name) + '" style="width:36px;height:36px;border-radius:6px;object-fit:cover"></td>' +
    '<td>' + c.name + '</td><td class="mono">' + c.id + '</td>' +
    '<td>' + products.filter(p => p.category === c.id).length + '</td>' +
    '<td class="cell-actions"><button class="icon-btn" data-edit-cat="' + c.id + '"><i class="fa-solid fa-pen"></i></button>' +
    '<button class="icon-btn danger" data-delete-cat="' + c.id + '"><i class="fa-solid fa-trash"></i></button></td></tr>'
  ).join('');

  tbody.querySelectorAll('[data-edit-cat]').forEach(btn => btn.addEventListener('click', () => openCategoryModal(btn.dataset.editCat)));
  tbody.querySelectorAll('[data-delete-cat]').forEach(btn => btn.addEventListener('click', () => deleteCategory(btn.dataset.deleteCat)));
}

function openCategoryModal(catId) {
  editingCategoryId = catId || null;
  const cat = catId ? DStoreData.getCategories().find(c => c.id === catId) : null;
  let tempCatImage = cat ? cat.image : '../assets/images/cat-mlbb.svg';
  const box = document.getElementById('categoryModalBox');

  box.innerHTML = [
    '<div class="modal-head"><h3>' + (cat ? 'Edit Kategori' : 'Tambah Kategori') + '</h3>',
    '<button class="modal-close" id="closeCatModal"><i class="fa-solid fa-xmark"></i></button></div>',
    '<div class="form-group"><label class="form-label">Nama Kategori <span class="required">*</span></label>',
    '<input type="text" class="form-control" id="cfCatName" value="' + (cat ? escAttr(cat.name) : '') + '"></div>',
    '<div class="form-group"><label class="form-label">Icon (SVG/Gambar)</label>',
    '<div class="img-upload-box" id="catImgBox" style="aspect-ratio:1;max-width:120px">',
    cat ? '<img src="' + cat.image + '" alt="Preview">' : '<i class="fa-solid fa-image"></i><span style="font-size:0.7rem">Upload</span>',
    '<input type="file" id="catImgInput" accept="image/*,.svg"></div></div>',
    '<div class="modal-foot"><button class="btn btn-outline" id="cancelCatModal">Batal</button>',
    '<button class="btn btn-primary" id="saveCatBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan</button></div>'
  ].join('');

  document.getElementById('catImgBox').addEventListener('click', () => document.getElementById('catImgInput').click());
  document.getElementById('catImgInput').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      tempCatImage = ev.target.result;
      document.getElementById('catImgBox').innerHTML = '<img src="' + tempCatImage + '" alt="Preview"><input type="file" id="catImgInput" accept="image/*,.svg">';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('closeCatModal').addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCatModal').addEventListener('click', closeCategoryModal);
  document.getElementById('saveCatBtn').addEventListener('click', () => {
    const name = document.getElementById('cfCatName').value.trim();
    if (!name) { dstoreToast('Nama kategori wajib diisi', 'error'); return; }
    const categories = DStoreData.getCategories();
    if (editingCategoryId) {
      const idx = categories.findIndex(c => c.id === editingCategoryId);
      categories[idx].name = name;
      categories[idx].image = tempCatImage;
    } else {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ('cat-' + Date.now());
      categories.push({ id: slug, name, icon: 'fa-solid fa-gamepad', image: tempCatImage });
    }
    DStoreData.saveCategories(categories);
    dstoreToast('Kategori berhasil disimpan', 'success');
    closeCategoryModal();
    renderCategoriesTable();
  });

  document.getElementById('categoryModal').classList.add('show');
}

function closeCategoryModal() { document.getElementById('categoryModal').classList.remove('show'); }

async function deleteCategory(catId) {
  const ok = await dstoreConfirm({ title: 'Hapus Kategori?', confirmText: 'Ya, Hapus' });
  if (!ok) return;
  DStoreData.saveCategories(DStoreData.getCategories().filter(c => c.id !== catId));
  dstoreToast('Kategori dihapus', 'success');
  renderCategoriesTable();
}

/* BANNERS */
function renderBannersTable() {
  const banners = DStoreData.getBanners();
  const tbody = document.getElementById('bannersTableBody');

  if (banners.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>Belum ada banner.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = banners.map(b =>
    '<tr><td><img src="' + b.image + '" alt="' + escAttr(b.title) + '" style="width:90px;height:36px;border-radius:6px;object-fit:cover;border:1px solid var(--border-strong)"></td>' +
    '<td>' + b.title + '</td><td style="color:var(--text-dim);font-size:0.8rem">' + b.subtitle + '</td>' +
    '<td><label class="switch"><input type="checkbox" ' + (b.active ? 'checked' : '') + ' data-tb="' + b.id + '"><span class="switch-track"></span></label></td>' +
    '<td class="cell-actions"><button class="icon-btn" data-edit-banner="' + b.id + '"><i class="fa-solid fa-pen"></i></button>' +
    '<button class="icon-btn danger" data-delete-banner="' + b.id + '"><i class="fa-solid fa-trash"></i></button></td></tr>'
  ).join('');

  tbody.querySelectorAll('[data-edit-banner]').forEach(btn => btn.addEventListener('click', () => openBannerModal(btn.dataset.editBanner)));
  tbody.querySelectorAll('[data-delete-banner]').forEach(btn => btn.addEventListener('click', () => deleteBanner(btn.dataset.deleteBanner)));
  tbody.querySelectorAll('[data-tb]').forEach(chk => chk.addEventListener('change', () => {
    const banners = DStoreData.getBanners();
    const idx = banners.findIndex(b => b.id === chk.dataset.tb);
    banners[idx].active = chk.checked;
    DStoreData.saveBanners(banners);
    dstoreToast('Status banner diperbarui', 'success');
  }));
}

function openBannerModal(bannerId) {
  editingBannerId = bannerId || null;
  const banner = bannerId ? DStoreData.getBanners().find(b => b.id === bannerId) : null;
  let tempBannerImage = banner ? banner.image : '../assets/images/banner-1.svg';
  const box = document.getElementById('bannerModalBox');

  box.innerHTML = [
    '<div class="modal-head"><h3>' + (banner ? 'Edit Banner' : 'Tambah Banner') + '</h3>',
    '<button class="modal-close" id="closeBannerModal"><i class="fa-solid fa-xmark"></i></button></div>',
    '<div class="form-group"><label class="form-label">Gambar Banner</label>',
    '<div class="img-upload-box" id="bannerImgBox" style="aspect-ratio:3/1">',
    banner ? '<img src="' + banner.image + '" alt="Preview">' : '<i class="fa-solid fa-image"></i><span>Upload gambar banner</span>',
    '<input type="file" id="bannerImgInput" accept="image/*,.svg"></div></div>',
    '<div class="form-group"><label class="form-label">Judul <span class="required">*</span></label>',
    '<input type="text" class="form-control" id="bfTitle" value="' + (banner ? escAttr(banner.title) : '') + '"></div>',
    '<div class="form-group"><label class="form-label">Subjudul</label>',
    '<input type="text" class="form-control" id="bfSubtitle" value="' + (banner ? escAttr(banner.subtitle) : '') + '"></div>',
    '<div class="modal-foot"><button class="btn btn-outline" id="cancelBannerModal">Batal</button>',
    '<button class="btn btn-primary" id="saveBannerBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan</button></div>'
  ].join('');

  document.getElementById('bannerImgBox').addEventListener('click', () => document.getElementById('bannerImgInput').click());
  document.getElementById('bannerImgInput').addEventListener('change', function(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      tempBannerImage = ev.target.result;
      document.getElementById('bannerImgBox').innerHTML = '<img src="' + tempBannerImage + '" alt="Preview"><input type="file" id="bannerImgInput" accept="image/*,.svg">';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('closeBannerModal').addEventListener('click', closeBannerModal);
  document.getElementById('cancelBannerModal').addEventListener('click', closeBannerModal);
  document.getElementById('saveBannerBtn').addEventListener('click', () => {
    const title = document.getElementById('bfTitle').value.trim();
    const subtitle = document.getElementById('bfSubtitle').value.trim();
    if (!title) { dstoreToast('Judul banner wajib diisi', 'error'); return; }
    const banners = DStoreData.getBanners();
    if (editingBannerId) {
      const idx = banners.findIndex(b => b.id === editingBannerId);
      banners[idx] = { ...banners[idx], title, subtitle, image: tempBannerImage };
    } else {
      banners.push({ id: 'b-' + Date.now(), title, subtitle, image: tempBannerImage, active: true });
    }
    DStoreData.saveBanners(banners);
    dstoreToast('Banner berhasil disimpan', 'success');
    closeBannerModal();
    renderBannersTable();
  });

  document.getElementById('bannerModal').classList.add('show');
}

function closeBannerModal() { document.getElementById('bannerModal').classList.remove('show'); }

async function deleteBanner(bannerId) {
  const ok = await dstoreConfirm({ title: 'Hapus Banner?', confirmText: 'Ya, Hapus' });
  if (!ok) return;
  DStoreData.saveBanners(DStoreData.getBanners().filter(b => b.id !== bannerId));
  dstoreToast('Banner dihapus', 'success');
  renderBannersTable();
}

/* SETTINGS */
function loadSettingsForm() {
  const s = DStoreData.getSettings();
  document.getElementById('setStoreName').value = s.storeName;
  document.getElementById('setTagline').value = s.tagline;
  document.getElementById('setWhatsapp').value = s.whatsapp;
  document.getElementById('setEmail').value = s.email;
  document.getElementById('setInstagram').value = s.instagram;
  document.getElementById('setTiktok').value = s.tiktok;
}

function saveSettings() {
  const s = DStoreData.getSettings();
  s.storeName = document.getElementById('setStoreName').value.trim();
  s.tagline = document.getElementById('setTagline').value.trim();
  s.whatsapp = document.getElementById('setWhatsapp').value.trim();
  s.email = document.getElementById('setEmail').value.trim();
  s.instagram = document.getElementById('setInstagram').value.trim();
  s.tiktok = document.getElementById('setTiktok').value.trim();
  DStoreData.saveSettings(s);
  dstoreToast('Pengaturan toko berhasil disimpan', 'success');
}

/* Utility */
function esc(str) {
  const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML;
}
function escAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
