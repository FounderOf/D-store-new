/**
 * D! STORE — admin-firebase.js
 * Admin panel CRUD: products (dengan Cloudinary image upload),
 * categories, banners, settings — semua ke Firestore.
 */

let adminProds = [], adminCats = [], adminBanners = [];
let editProductId = null, editCatId = null, editBannerId = null;
let tempNominals = [], tempFields = [], tempProdImg = '';
let unsubProds = null;

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();

  guardDashboard('admin', () => initAdminDashboard());

  handleDashboardLogin('adminLoginForm', 'admin', () => {
    guardDashboard('admin', () => initAdminDashboard());
  });

  document.getElementById('adminLogoutBtn')?.addEventListener('click', () => dashboardLogout());

  bindSidebarToggle();
  bindModalBackdrops();
});

function initAdminDashboard() {
  bindAdminTabs();
  loadAllData();
  loadSettingsForm();

  document.getElementById('productSearchInput').addEventListener('input', e => {
    renderProductsTable(e.target.value.trim().toLowerCase());
  });

  document.getElementById('addProductBtn').addEventListener('click',  () => openProductModal());
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
  document.getElementById('addBannerBtn').addEventListener('click',   () => openBannerModal());

  document.getElementById('settingsForm').addEventListener('submit', e => {
    e.preventDefault(); saveSettings();
  });
}

async function loadAllData() {
  try {
    [adminProds, adminCats, adminBanners] = await Promise.all([
      FireDB.getProducts(), FireDB.getCategories(), FireDB.getBanners()
    ]);
    renderProductsTable();
    renderCategoriesTable();
    renderBannersTable();
  } catch (e) {
    dstoreToast('Gagal memuat data: ' + e.message, 'error');
  }
}

/* ── Tabs / Sidebar ─────────────────────────────────────────────────────── */
function bindAdminTabs() {
  const titles = { products:'Produk & Voucher', categories:'Kategori', banners:'Banner', settings:'Pengaturan Toko' };
  document.querySelectorAll('.dash-nav a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.dash-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.dash-tab-content').forEach(c =>
        c.style.display = c.dataset.tabcontent === a.dataset.tab ? 'block' : 'none');
      setText('topbarTitle', titles[a.dataset.tab]);
      closeSidebarMobile();
    });
  });
}

function bindSidebarToggle() {
  const s = document.getElementById('dashSidebar');
  const o = document.getElementById('dashOverlay');
  const t = document.getElementById('sidebarToggle');
  if (!t) return;
  t.addEventListener('click', () => { s?.classList.add('open'); o?.classList.add('show'); });
  o?.addEventListener('click', closeSidebarMobile);
}
function closeSidebarMobile() {
  document.getElementById('dashSidebar')?.classList.remove('open');
  document.getElementById('dashOverlay')?.classList.remove('show');
}
function bindModalBackdrops() {
  document.querySelectorAll('.modal-backdrop-custom').forEach(b =>
    b.addEventListener('click', e => { if (e.target === b) b.classList.remove('show'); }));
}

/* ── PRODUCTS TABLE ─────────────────────────────────────────────────────── */
function renderProductsTable(search = '') {
  const tbody = document.getElementById('productsTableBody');
  let products = [...adminProds];
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search));

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>Belum ada produk.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = products.map(p => {
    const cheapest  = p.nominals?.length ? Math.min(...p.nominals.map(n => n.price)) : 0;
    const catName   = (adminCats.find(c => c.id === p.category)||{}).name || p.category;
    return `<tr>
      <td><img src="${p.image}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid var(--border-strong)"></td>
      <td>${p.name}</td><td>${catName}</td>
      <td>${p.nominals?.length||0} nominal</td>
      <td>${formatPrice(cheapest)}</td>
      <td><label class="switch"><input type="checkbox" ${p.popular?'checked':''} data-toggle-pop="${p.id}"><span class="switch-track"></span></label></td>
      <td class="cell-actions">
        <button class="icon-btn" data-ep="${p.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn danger" data-dp="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </td></tr>`;
  }).join('');

  tbody.querySelectorAll('[data-ep]').forEach(b    => b.addEventListener('click', () => openProductModal(b.dataset.ep)));
  tbody.querySelectorAll('[data-dp]').forEach(b    => b.addEventListener('click', () => deleteProduct(b.dataset.dp)));
  tbody.querySelectorAll('[data-toggle-pop]').forEach(chk => chk.addEventListener('change', () => togglePopular(chk.dataset.togglePop, chk.checked)));
}

async function togglePopular(id, val) {
  try {
    await FireDB.saveProduct({ popular: val }, id);
    const p = adminProds.find(x => x.id === id);
    if (p) p.popular = val;
    dstoreToast('Status populer diperbarui', 'success');
  } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
}

async function deleteProduct(id) {
  const ok = await dstoreConfirm({ title:'Hapus produk ini?', confirmText:'Ya, Hapus', icon:'warning' });
  if (!ok) return;
  try {
    await FireDB.deleteProduct(id);
    adminProds = adminProds.filter(p => p.id !== id);
    renderProductsTable(); dstoreToast('Produk dihapus', 'success');
  } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
}

/* ── PRODUCT MODAL ──────────────────────────────────────────────────────── */
function openProductModal(productId) {
  editProductId = productId || null;
  const prod    = productId ? adminProds.find(p => p.id === productId) : null;
  tempNominals  = prod ? JSON.parse(JSON.stringify(prod.nominals||[])) : [];
  tempFields    = prod ? JSON.parse(JSON.stringify(prod.fields||[])) : [{ key:'userId', label:'User ID', placeholder:'Masukkan User ID' }];
  tempProdImg   = prod ? prod.image : '';

  const box      = document.getElementById('productModalBox');
  const catOpts  = [{ id:'',name:'-- Pilih Kategori --' }, ...adminCats].map(c =>
    `<option value="${c.id}" ${prod && prod.category===c.id?'selected':''}>${c.name}</option>`).join('');

  box.innerHTML = `
    <div class="modal-head">
      <h3>${prod ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
      <button class="modal-close" id="closeProdModal"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <!-- Image upload dengan Cloudinary progress -->
    <div class="form-group">
      <label class="form-label">Gambar Produk <span style="font-size:.7rem;color:var(--text-dimmer)">(upload ke Cloudinary)</span></label>
      <div class="img-upload-box" id="prodImgBox" style="aspect-ratio:16/9;max-height:180px">
        ${tempProdImg ? `<img src="${tempProdImg}" alt="preview">` : '<i class="fa-solid fa-cloud-arrow-up" style="font-size:1.8rem;color:var(--accent)"></i><span>Klik atau drag gambar ke sini</span><span style="font-size:.7rem;color:var(--text-dimmer)">JPG/PNG/WEBP • maks 5MB</span>'}
        <input type="file" id="prodImgInput" accept="image/*">
      </div>
      <div id="prodImgProgress" style="display:none;margin-top:.5rem">
        <div style="height:4px;background:var(--border-strong);border-radius:2px;overflow:hidden">
          <div class="progress-bar" style="height:100%;background:var(--grad-accent);width:0%;transition:width .3s"></div>
        </div>
        <span style="font-size:.72rem;color:var(--text-dimmer)">Mengupload ke Cloudinary...</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
      <div class="form-group">
        <label class="form-label">Nama Produk <span class="required">*</span></label>
        <input type="text" class="form-control" id="pfName" value="${escAttr(prod?.name||'')}">
      </div>
      <div class="form-group">
        <label class="form-label">Kategori <span class="required">*</span></label>
        <select class="form-control" id="pfCategory">${catOpts}</select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Deskripsi</label>
      <textarea class="form-control" id="pfDesc" rows="2">${esc(prod?.desc||'')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Catatan Khusus <span style="font-size:.7rem;color:var(--text-dimmer)">(opsional, tampil di halaman order)</span></label>
      <input type="text" class="form-control" id="pfNotes" value="${escAttr(prod?.notes||'')}" placeholder="Contoh: Pastikan username benar sebelum order">
    </div>

    <hr class="divider">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem">
      <h4 style="font-size:var(--fs-sm)">Field Input Akun</h4>
      <button type="button" class="btn btn-ghost btn-sm" id="addFieldBtn"><i class="fa-solid fa-plus"></i> Tambah</button>
    </div>
    <div id="fieldsWrap"></div>

    <hr class="divider">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem">
      <h4 style="font-size:var(--fs-sm)">Nominal & Harga</h4>
      <button type="button" class="btn btn-ghost btn-sm" id="addNomBtn"><i class="fa-solid fa-plus"></i> Tambah</button>
    </div>
    <div id="nominalsWrap"></div>

    <div class="modal-foot">
      <button class="btn btn-outline" id="cancelProdModal">Batal</button>
      <button class="btn btn-primary" id="saveProdBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan Produk</button>
    </div>`;

  renderFieldsList(); renderNominalsList();

  // Image upload with Cloudinary
  document.getElementById('prodImgBox').addEventListener('click', () => document.getElementById('prodImgInput').click());
  document.getElementById('prodImgInput').addEventListener('change', async function(e) {
    const file = e.target.files[0]; if (!file) return;
    const prog = document.getElementById('prodImgProgress');
    prog.style.display = 'block';
    try {
      const result = await CloudinaryUpload.uploadWithProgress(file, 'products', pct => {
        prog.querySelector('.progress-bar').style.width = pct + '%';
      });
      tempProdImg = result.url;
      document.getElementById('prodImgBox').innerHTML =
        `<img src="${tempProdImg}" alt="preview"><input type="file" id="prodImgInput" accept="image/*">`;
      prog.style.display = 'none';
      dstoreToast('Gambar berhasil diupload!', 'success');
    } catch (err) {
      prog.style.display = 'none';
      dstoreToast('Upload gagal: ' + err.message, 'error');
    }
  });

  document.getElementById('addFieldBtn').addEventListener('click', () => {
    tempFields.push({ key:'field'+(tempFields.length+1), label:'', placeholder:'' });
    renderFieldsList();
  });
  document.getElementById('addNomBtn').addEventListener('click', () => {
    tempNominals.push({ id:'n'+Date.now(), label:'', price:0, oldPrice:null, popular:false });
    renderNominalsList();
  });

  document.getElementById('closeProdModal').addEventListener('click', closeProductModal);
  document.getElementById('cancelProdModal').addEventListener('click', closeProductModal);
  document.getElementById('saveProdBtn').addEventListener('click', saveProduct);

  document.getElementById('productModal').classList.add('show');
}

function renderFieldsList() {
  const wrap = document.getElementById('fieldsWrap');
  if (!wrap) return;
  if (!tempFields.length) { wrap.innerHTML = '<p class="form-hint">Tambahkan minimal satu field (contoh: User ID).</p>'; return; }
  wrap.innerHTML = tempFields.map((f,i) => `
    <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;margin-bottom:.5rem;align-items:end">
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:.72rem">Label Field</label>
        <input type="text" class="form-control" data-fl="${i}" value="${escAttr(f.label)}" placeholder="User ID">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:.72rem">Placeholder</label>
        <input type="text" class="form-control" data-fp="${i}" value="${escAttr(f.placeholder)}" placeholder="Contoh: 123456">
      </div>
      <button type="button" class="icon-btn danger" data-rf="${i}"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');

  wrap.querySelectorAll('[data-fl]').forEach(inp => inp.addEventListener('input', e => {
    tempFields[+inp.dataset.fl].label = e.target.value;
    tempFields[+inp.dataset.fl].key   = e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'') || 'field';
  }));
  wrap.querySelectorAll('[data-fp]').forEach(inp => inp.addEventListener('input', e => { tempFields[+inp.dataset.fp].placeholder = e.target.value; }));
  wrap.querySelectorAll('[data-rf]').forEach(btn => btn.addEventListener('click', () => { tempFields.splice(+btn.dataset.rf,1); renderFieldsList(); }));
}

function renderNominalsList() {
  const wrap = document.getElementById('nominalsWrap');
  if (!wrap) return;
  if (!tempNominals.length) { wrap.innerHTML = '<p class="form-hint">Tambahkan minimal satu nominal.</p>'; return; }
  wrap.innerHTML = tempNominals.map((n,i) => `
    <div style="display:grid;grid-template-columns:1.4fr 1fr 1fr auto auto;gap:.5rem;margin-bottom:.5rem;align-items:end">
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:.72rem">Label</label>
        <input type="text" class="form-control" data-nl="${i}" value="${escAttr(n.label)}" placeholder="80 Robux">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:.72rem">Harga (Rp)</label>
        <input type="number" class="form-control" data-np="${i}" value="${n.price}" min="0">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label class="form-label" style="font-size:.72rem">Harga Coret</label>
        <input type="number" class="form-control" data-nop="${i}" value="${n.oldPrice||''}" min="0" placeholder="-">
      </div>
      <label class="switch" title="Terlaris"><input type="checkbox" data-npp="${i}" ${n.popular?'checked':''}><span class="switch-track"></span></label>
      <button type="button" class="icon-btn danger" data-rn="${i}"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('');

  wrap.querySelectorAll('[data-nl]').forEach(i  => i.addEventListener('input', e => { tempNominals[+i.dataset.nl].label    = e.target.value; }));
  wrap.querySelectorAll('[data-np]').forEach(i  => i.addEventListener('input', e => { tempNominals[+i.dataset.np].price    = +e.target.value||0; }));
  wrap.querySelectorAll('[data-nop]').forEach(i => i.addEventListener('input', e => { tempNominals[+i.dataset.nop].oldPrice = e.target.value ? +e.target.value : null; }));
  wrap.querySelectorAll('[data-npp]').forEach(c => c.addEventListener('change',e => { tempNominals[+c.dataset.npp].popular  = e.target.checked; }));
  wrap.querySelectorAll('[data-rn]').forEach(b  => b.addEventListener('click', () => { tempNominals.splice(+b.dataset.rn,1); renderNominalsList(); }));
}

async function saveProduct() {
  const name     = document.getElementById('pfName').value.trim();
  const category = document.getElementById('pfCategory').value;
  const desc     = document.getElementById('pfDesc').value.trim();
  const notes    = document.getElementById('pfNotes').value.trim();

  if (!name)                  { dstoreToast('Nama produk wajib diisi', 'error'); return; }
  if (!category)              { dstoreToast('Pilih kategori', 'error'); return; }
  if (!tempNominals.length)   { dstoreToast('Tambahkan minimal satu nominal', 'error'); return; }
  if (!tempFields.length)     { dstoreToast('Tambahkan minimal satu field input', 'error'); return; }
  if (tempNominals.some(n => !n.label || !n.price)) { dstoreToast('Lengkapi label dan harga setiap nominal', 'error'); return; }
  if (tempFields.some(f => !f.label)) { dstoreToast('Lengkapi label setiap field', 'error'); return; }

  const btn = document.getElementById('saveProdBtn');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const existing = editProductId ? adminProds.find(p => p.id === editProductId) : null;
    const data = {
      name, category, desc, notes,
      image: tempProdImg || existing?.image || '',
      nominals: tempNominals, fields: tempFields,
      popular: existing?.popular || false,
      sold: existing?.sold || 0
    };
    const savedId = await FireDB.saveProduct(data, editProductId || null);

    if (editProductId) {
      const idx = adminProds.findIndex(p => p.id === editProductId);
      adminProds[idx] = { id: editProductId, ...data };
    } else {
      adminProds.unshift({ id: savedId, ...data });
    }

    dstoreToast(editProductId ? 'Produk diperbarui!' : 'Produk baru ditambahkan!', 'success');
    closeProductModal(); renderProductsTable();
  } catch (e) {
    dstoreToast('Gagal menyimpan: ' + e.message, 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Produk';
  }
}

function closeProductModal() { document.getElementById('productModal').classList.remove('show'); }

/* ── CATEGORIES ─────────────────────────────────────────────────────────── */
function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!adminCats.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>Belum ada kategori.</p></div></td></tr>'; return;
  }
  tbody.innerHTML = adminCats.map(c => `
    <tr>
      <td><img src="${c.image||''}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover;border:1px solid var(--border-strong)"></td>
      <td>${c.name}</td><td class="mono">${c.id}</td>
      <td>${adminProds.filter(p => p.category === c.id).length}</td>
      <td class="cell-actions">
        <button class="icon-btn" data-ec="${c.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn danger" data-dc="${c.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-ec]').forEach(b => b.addEventListener('click', () => openCategoryModal(b.dataset.ec)));
  tbody.querySelectorAll('[data-dc]').forEach(b => b.addEventListener('click', () => deleteCategory(b.dataset.dc)));
}

function openCategoryModal(catId) {
  editCatId = catId || null;
  const cat = catId ? adminCats.find(c => c.id === catId) : null;
  let tempCatImg = cat?.image || '';
  const box = document.getElementById('categoryModalBox');

  box.innerHTML = `
    <div class="modal-head">
      <h3>${cat ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
      <button class="modal-close" id="closeCatModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Nama Kategori <span class="required">*</span></label>
      <input type="text" class="form-control" id="cfCatName" value="${escAttr(cat?.name||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Icon / Gambar <span style="font-size:.7rem;color:var(--text-dimmer)">(upload ke Cloudinary)</span></label>
      <div class="img-upload-box" id="catImgBox" style="aspect-ratio:1;max-width:120px">
        ${tempCatImg ? `<img src="${tempCatImg}" alt="">` : '<i class="fa-solid fa-image"></i><span style="font-size:.7rem">Upload</span>'}
        <input type="file" id="catImgInput" accept="image/*,.svg">
      </div>
      <div id="catImgProg" style="display:none;margin-top:.5rem">
        <div style="height:4px;background:var(--border-strong);border-radius:2px;overflow:hidden">
          <div class="progress-bar" style="height:100%;background:var(--grad-accent);width:0%;transition:width .3s"></div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Urutan Tampil</label>
      <input type="number" class="form-control" id="cfCatOrder" value="${cat?.order||99}" min="1">
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" id="cancelCatModal">Batal</button>
      <button class="btn btn-primary" id="saveCatBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan</button>
    </div>`;

  document.getElementById('catImgBox').addEventListener('click', () => document.getElementById('catImgInput').click());
  document.getElementById('catImgInput').addEventListener('change', async function(e) {
    const file = e.target.files[0]; if (!file) return;
    const prog = document.getElementById('catImgProg');
    prog.style.display = 'block';
    try {
      const result = await CloudinaryUpload.uploadWithProgress(file, 'categories', pct => {
        prog.querySelector('.progress-bar').style.width = pct + '%';
      });
      tempCatImg = result.url;
      document.getElementById('catImgBox').innerHTML = `<img src="${tempCatImg}" alt=""><input type="file" id="catImgInput" accept="image/*,.svg">`;
      prog.style.display = 'none';
      dstoreToast('Gambar kategori diupload!', 'success');
    } catch (err) { prog.style.display = 'none'; dstoreToast('Upload gagal: ' + err.message, 'error'); }
  });

  document.getElementById('closeCatModal').addEventListener('click',  closeCategoryModal);
  document.getElementById('cancelCatModal').addEventListener('click', closeCategoryModal);
  document.getElementById('saveCatBtn').addEventListener('click', async () => {
    const name  = document.getElementById('cfCatName').value.trim();
    const order = parseInt(document.getElementById('cfCatOrder').value) || 99;
    if (!name) { dstoreToast('Nama kategori wajib diisi', 'error'); return; }

    const slug = editCatId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'') || ('cat-'+Date.now());
    try {
      await FireDB.saveCategory({ name, image: tempCatImg, icon:'fa-solid fa-gamepad', order }, slug);
      if (editCatId) {
        const idx = adminCats.findIndex(c => c.id === editCatId);
        adminCats[idx] = { id: editCatId, name, image: tempCatImg, order };
      } else {
        adminCats.push({ id: slug, name, image: tempCatImg, order });
      }
      dstoreToast('Kategori disimpan!', 'success');
      closeCategoryModal(); renderCategoriesTable();
    } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
  });

  document.getElementById('categoryModal').classList.add('show');
}

function closeCategoryModal() { document.getElementById('categoryModal').classList.remove('show'); }
async function deleteCategory(id) {
  const ok = await dstoreConfirm({ title:'Hapus kategori?', confirmText:'Ya, Hapus' });
  if (!ok) return;
  try {
    await FireDB.deleteCategory(id);
    adminCats = adminCats.filter(c => c.id !== id);
    renderCategoriesTable(); dstoreToast('Kategori dihapus', 'success');
  } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
}

/* ── BANNERS ─────────────────────────────────────────────────────────────── */
function renderBannersTable() {
  const tbody = document.getElementById('bannersTableBody');
  if (!adminBanners.length) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><p>Belum ada banner.</p></div></td></tr>'; return;
  }
  tbody.innerHTML = adminBanners.map(b => `
    <tr>
      <td><img src="${b.image}" alt="" style="width:90px;height:36px;border-radius:6px;object-fit:cover;border:1px solid var(--border-strong)"></td>
      <td>${b.title}</td>
      <td style="color:var(--text-dim);font-size:.8rem">${b.subtitle||''}</td>
      <td><label class="switch"><input type="checkbox" ${b.active?'checked':''} data-tb="${b.id}"><span class="switch-track"></span></label></td>
      <td class="cell-actions">
        <button class="icon-btn" data-eb="${b.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn danger" data-db="${b.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-eb]').forEach(b => b.addEventListener('click', () => openBannerModal(b.dataset.eb)));
  tbody.querySelectorAll('[data-db]').forEach(b => b.addEventListener('click', () => deleteBanner(b.dataset.db)));
  tbody.querySelectorAll('[data-tb]').forEach(chk => chk.addEventListener('change', async () => {
    try {
      await FireDB.saveBanner({ active: chk.checked }, chk.dataset.tb);
      const idx = adminBanners.findIndex(b => b.id === chk.dataset.tb);
      if (idx > -1) adminBanners[idx].active = chk.checked;
      dstoreToast('Status banner diperbarui', 'success');
    } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
  }));
}

function openBannerModal(bannerId) {
  editBannerId = bannerId || null;
  const banner = bannerId ? adminBanners.find(b => b.id === bannerId) : null;
  let tempBannerImg = banner?.image || '';
  const box = document.getElementById('bannerModalBox');

  box.innerHTML = `
    <div class="modal-head">
      <h3>${banner ? 'Edit Banner' : 'Tambah Banner'}</h3>
      <button class="modal-close" id="closeBannerModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="form-group">
      <label class="form-label">Gambar Banner <span style="font-size:.7rem;color:var(--text-dimmer)">(upload ke Cloudinary)</span></label>
      <div class="img-upload-box" id="bannerImgBox" style="aspect-ratio:3/1">
        ${tempBannerImg ? `<img src="${tempBannerImg}" alt="">` : '<i class="fa-solid fa-image" style="font-size:1.5rem"></i><span>Upload gambar banner</span><span style="font-size:.7rem;color:var(--text-dimmer)">Rasio 3:1 disarankan (mis. 1200×400px)</span>'}
        <input type="file" id="bannerImgInput" accept="image/*">
      </div>
      <div id="bannerImgProg" style="display:none;margin-top:.5rem">
        <div style="height:4px;background:var(--border-strong);border-radius:2px;overflow:hidden">
          <div class="progress-bar" style="height:100%;background:var(--grad-accent);width:0%;transition:width .3s"></div>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Judul <span class="required">*</span></label>
      <input type="text" class="form-control" id="bfTitle" value="${escAttr(banner?.title||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Subjudul</label>
      <input type="text" class="form-control" id="bfSubtitle" value="${escAttr(banner?.subtitle||'')}">
    </div>
    <div class="form-group">
      <label class="form-label">Link URL (opsional)</label>
      <input type="text" class="form-control" id="bfLink" value="${escAttr(banner?.link||'')}" placeholder="https://... atau products.html?cat=roblox">
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" id="cancelBannerModal">Batal</button>
      <button class="btn btn-primary" id="saveBannerBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan</button>
    </div>`;

  document.getElementById('bannerImgBox').addEventListener('click', () => document.getElementById('bannerImgInput').click());
  document.getElementById('bannerImgInput').addEventListener('change', async function(e) {
    const file = e.target.files[0]; if (!file) return;
    const prog = document.getElementById('bannerImgProg');
    prog.style.display = 'block';
    try {
      const result = await CloudinaryUpload.uploadWithProgress(file, 'banners', pct => {
        prog.querySelector('.progress-bar').style.width = pct + '%';
      });
      tempBannerImg = result.url;
      document.getElementById('bannerImgBox').innerHTML = `<img src="${tempBannerImg}" alt=""><input type="file" id="bannerImgInput" accept="image/*">`;
      prog.style.display = 'none';
      dstoreToast('Gambar banner diupload!', 'success');
    } catch (err) { prog.style.display = 'none'; dstoreToast('Upload gagal: ' + err.message, 'error'); }
  });

  document.getElementById('closeBannerModal').addEventListener('click',  closeBannerModal);
  document.getElementById('cancelBannerModal').addEventListener('click', closeBannerModal);
  document.getElementById('saveBannerBtn').addEventListener('click', async () => {
    const title    = document.getElementById('bfTitle').value.trim();
    const subtitle = document.getElementById('bfSubtitle').value.trim();
    const link     = document.getElementById('bfLink').value.trim();
    if (!title) { dstoreToast('Judul banner wajib diisi', 'error'); return; }
    try {
      const data = { title, subtitle, link, image: tempBannerImg, active: banner?.active ?? true, order: banner?.order ?? 99 };
      const savedId = await FireDB.saveBanner(data, editBannerId || null);
      if (editBannerId) {
        const idx = adminBanners.findIndex(b => b.id === editBannerId);
        adminBanners[idx] = { id: editBannerId, ...data };
      } else {
        adminBanners.push({ id: savedId, ...data });
      }
      dstoreToast('Banner disimpan!', 'success');
      closeBannerModal(); renderBannersTable();
    } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
  });

  document.getElementById('bannerModal').classList.add('show');
}

function closeBannerModal() { document.getElementById('bannerModal').classList.remove('show'); }
async function deleteBanner(id) {
  const ok = await dstoreConfirm({ title:'Hapus banner?', confirmText:'Ya, Hapus' });
  if (!ok) return;
  try {
    await FireDB.deleteBanner(id);
    adminBanners = adminBanners.filter(b => b.id !== id);
    renderBannersTable(); dstoreToast('Banner dihapus', 'success');
  } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
}

/* ── SETTINGS ────────────────────────────────────────────────────────────── */
async function loadSettingsForm() {
  try {
    const s = await FireDB.getSettings();
    setValue('setStoreName', s.storeName);
    setValue('setTagline', s.tagline);
    setValue('setWhatsapp', s.whatsapp);
    setValue('setEmail', s.email);
    setValue('setInstagram', s.instagram);
    setValue('setTiktok', s.tiktok);
  } catch (e) { dstoreToast('Gagal memuat pengaturan', 'error'); }
}

async function saveSettings() {
  const s = {
    storeName:  getValue('setStoreName'),
    tagline:    getValue('setTagline'),
    whatsapp:   getValue('setWhatsapp'),
    email:      getValue('setEmail'),
    instagram:  getValue('setInstagram'),
    tiktok:     getValue('setTiktok')
  };
  try {
    await FireDB.saveSettings(s);
    dstoreToast('Pengaturan disimpan!', 'success');
  } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
}

/* ── DOM helpers ─────────────────────────────────────────────────────────── */
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function getValue(id) { return (document.getElementById(id)?.value || '').trim(); }
function setValue(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }
