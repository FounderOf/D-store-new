/**
 * D! STORE — order-firebase.js
 * Multi-step checkout: pick product/nominal → account info → payment method
 * → upload proof (Cloudinary) → submit order to Firestore.
 */

const oState = {
  step: 1, product: null, nominal: null,
  accountData: {}, whatsapp: '',
  paymentMethod: null,
  proofUrl: null, proofPublicId: null,
  settings: null
};

const PAYMENT_METHODS = [
  { id:'bca',   name:'Transfer BCA', sub:'Bank Transfer', icon:'fa-solid fa-building-columns' },
  { id:'dana',  name:'DANA',         sub:'E-Wallet',      icon:'fa-solid fa-wallet' },
  { id:'ovo',   name:'OVO',          sub:'E-Wallet',      icon:'fa-solid fa-wallet' },
  { id:'gopay', name:'GoPay',        sub:'E-Wallet',      icon:'fa-solid fa-wallet' }
];

document.addEventListener('DOMContentLoaded', async () => {
  initFirebase();
  const params = new URLSearchParams(window.location.search);
  const presetId = params.get('product');

  oState.settings = await FireDB.getSettings().catch(() => DEFAULT_SETTINGS);

  await renderProductPickGrid(presetId);
  renderPayMethodGrid();
  bindNavButtons();
  bindFileUpload();

  if (presetId) selectProduct(presetId);
});

/* ── Step 1: Product + Nominal ─────────────────────────────────────────────── */
async function renderProductPickGrid(presetId) {
  const grid = document.getElementById('productPickGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent)"></i> Memuat produk...</div>';
  const products = await FireDB.getProducts();

  grid.innerHTML = products.map(p => `
    <div class="pick-tile ${presetId === p.id ? 'selected' : ''}" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="pick-tile-name">${p.name}</div>
    </div>`).join('');

  grid.querySelectorAll('.pick-tile').forEach(t =>
    t.addEventListener('click', () => selectProduct(t.dataset.id, products)));
}

async function selectProduct(productId, products) {
  const allProds = products || await FireDB.getProducts();
  const product  = allProds.find(p => p.id === productId);
  if (!product) return;
  oState.product = product; oState.nominal = null;

  document.querySelectorAll('#productPickGrid .pick-tile').forEach(t =>
    t.classList.toggle('selected', t.dataset.id === productId));

  renderNominalGrid();
  document.getElementById('nominalSection').style.display = 'block';
  updateStep1Button(); updateSummary();
}

function renderNominalGrid() {
  const grid = document.getElementById('nominalGrid');
  if (!oState.product) { grid.innerHTML = ''; return; }
  grid.innerHTML = oState.product.nominals.map(n => `
    <div class="nominal-tile" data-id="${n.id}">
      ${n.popular ? '<span class="nominal-tile-popular">Terlaris</span>' : ''}
      <div class="nominal-amount">${n.label}</div>
      <div class="nominal-price">${formatPrice(n.price)}</div>
    </div>`).join('');

  grid.querySelectorAll('.nominal-tile').forEach(t => {
    t.addEventListener('click', () => {
      oState.nominal = oState.product.nominals.find(n => n.id === t.dataset.id);
      grid.querySelectorAll('.nominal-tile').forEach(x => x.classList.toggle('selected', x === t));
      updateStep1Button(); updateSummary();
    });
  });
}

function updateStep1Button() {
  document.getElementById('toStep2Btn').disabled = !(oState.product && oState.nominal);
}

/* ── Step 2: Account details ────────────────────────────────────────────────── */
function renderAccountForm() {
  const form = document.getElementById('accountForm');
  if (!oState.product) { form.innerHTML = ''; return; }
  form.innerHTML = oState.product.fields.map(f => `
    <div class="form-group">
      <label class="form-label">${f.label} <span class="required">*</span></label>
      <input type="text" class="form-control" data-field="${f.key}" placeholder="${f.placeholder}" value="${oState.accountData[f.key] || ''}">
    </div>`).join('');

  // Roblox special note
  if (oState.product.notes) {
    form.innerHTML += `<div class="track-note-box"><strong>Catatan Penting</strong>${oState.product.notes}</div>`;
  }

  if (oState.whatsapp) document.getElementById('whatsappInput').value = oState.whatsapp;
}

/* ── Step 3: Payment + Cloudinary upload ────────────────────────────────────── */
function renderPayMethodGrid() {
  const grid = document.getElementById('payMethodGrid');
  grid.innerHTML = PAYMENT_METHODS.map(m => `
    <div class="pay-method" data-id="${m.id}">
      <div class="pay-method-icon"><i class="${m.icon}"></i></div>
      <div><div class="pay-method-name">${m.name}</div><div class="pay-method-sub">${m.sub}</div></div>
    </div>`).join('');

  grid.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      oState.paymentMethod = PAYMENT_METHODS.find(m => m.id === el.dataset.id);
      grid.querySelectorAll('.pay-method').forEach(p => p.classList.toggle('selected', p === el));
      renderTransferBox(); updateSummary();
    });
  });
}

function renderTransferBox() {
  const box = document.getElementById('transferBox');
  const s   = oState.settings || DEFAULT_SETTINGS;
  if (!oState.paymentMethod) { box.classList.remove('show'); return; }

  const idLower = oState.paymentMethod.id;
  const account = s.bankAccounts.find(a => a.bank.toLowerCase() === idLower)
    || s.bankAccounts.find(a => a.bank === 'BCA') || s.bankAccounts[0];

  box.innerHTML = `
    <div class="transfer-row"><span class="label">Metode</span><span class="value">${oState.paymentMethod.name}</span></div>
    <div class="transfer-row"><span class="label">Nomor / Rekening</span>
      <span class="value">${account.number}
        <button type="button" class="copy-btn" id="copyAccBtn"><i class="fa-solid fa-copy"></i></button>
      </span>
    </div>
    <div class="transfer-row"><span class="label">Atas Nama</span><span class="value">${account.holder}</span></div>
    <div class="transfer-row"><span class="label">Jumlah Transfer</span>
      <span class="value text-accent">${oState.nominal ? formatPrice(oState.nominal.price) : '-'}</span>
    </div>`;
  box.classList.add('show');

  document.getElementById('copyAccBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(account.number)
      .then(() => dstoreToast('Nomor disalin!', 'success'));
  });
}

/* ── Cloudinary file upload with progress ───────────────────────────────────── */
function bindFileUpload() {
  const drop    = document.getElementById('fileDrop');
  const input   = document.getElementById('proofInput');
  const preview = document.getElementById('filePreview');
  const img     = document.getElementById('previewImg');
  const prog    = document.getElementById('uploadProgress');

  input.addEventListener('change', () => handleFile(input.files[0]));
  ['dragover','dragenter'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add('dragover'); }));
  ['dragleave','drop'].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove('dragover'); }));
  drop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { dstoreToast('File harus berupa gambar (JPG/PNG)', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { dstoreToast('Ukuran file maksimal 5MB', 'error'); return; }

    // Local preview first
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; preview.classList.add('show'); };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    if (prog) { prog.style.display = 'block'; prog.querySelector('.progress-bar').style.width = '0%'; }
    dstoreToast('Mengupload bukti transfer...', 'info');

    try {
      const result = await CloudinaryUpload.uploadWithProgress(file, 'proofs', pct => {
        if (prog) prog.querySelector('.progress-bar').style.width = pct + '%';
      });
      oState.proofUrl = result.url;
      oState.proofPublicId = result.publicId;
      if (prog) prog.style.display = 'none';
      dstoreToast('Bukti transfer berhasil diupload!', 'success');
    } catch (err) {
      if (prog) prog.style.display = 'none';
      dstoreToast('Upload gagal: ' + err.message, 'error');
      oState.proofUrl = null;
    }
  }
}

/* ── Navigation ─────────────────────────────────────────────────────────────── */
function bindNavButtons() {
  document.getElementById('toStep2Btn').addEventListener('click', () => {
    if (!oState.product || !oState.nominal) return;
    goToStep(2); renderAccountForm();
  });
  document.getElementById('back1Btn').addEventListener('click', () => goToStep(1));
  document.getElementById('toStep3Btn').addEventListener('click', () => { if (validateStep2()) goToStep(3); });
  document.getElementById('back2Btn').addEventListener('click', () => goToStep(2));
  document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);
}

function goToStep(step) {
  oState.step = step;
  document.querySelectorAll('.order-step-content').forEach(c =>
    c.style.display = Number(c.dataset.content) === step ? 'block' : 'none');
  document.querySelectorAll('.order-step').forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });
  document.querySelectorAll('.order-step-line').forEach((line, i) => line.classList.toggle('done', i + 1 < step));
  window.scrollTo({ top: document.getElementById('orderPanel').offsetTop - 100, behavior: 'smooth' });
}

function validateStep2() {
  let valid = true;
  document.querySelectorAll('#accountForm input[data-field]').forEach(input => {
    const ok = validateField(input, { required: true, minLength: 2, message: 'Wajib diisi' });
    if (!ok) valid = false; else oState.accountData[input.dataset.field] = input.value.trim();
  });
  const wa = document.getElementById('whatsappInput');
  const waOk = validateField(wa, { required: true, minLength: 9, pattern: /^[0-9+\-\s]+$/, message: 'Nomor WhatsApp tidak valid' });
  if (!waOk) valid = false; else oState.whatsapp = wa.value.trim();
  if (!valid) dstoreToast('Mohon lengkapi data dengan benar', 'error');
  return valid;
}

function updateSummary() {
  const body = document.getElementById('summaryBody');
  if (!oState.product) {
    body.innerHTML = '<div class="summary-empty">Pilih produk untuk melihat ringkasan.</div>'; return;
  }
  body.innerHTML = `
    <div class="summary-row"><span class="label">Produk</span><span class="value">${oState.product.name}</span></div>
    ${oState.nominal ? `<div class="summary-row"><span class="label">Nominal</span><span class="value">${oState.nominal.label}</span></div>` : ''}
    ${oState.paymentMethod ? `<div class="summary-row"><span class="label">Pembayaran</span><span class="value">${oState.paymentMethod.name}</span></div>` : ''}
    <div class="summary-total">
      <span class="label">Total Bayar</span>
      <span class="value">${oState.nominal ? formatPrice(oState.nominal.price) : '-'}</span>
    </div>`;
}

/* ── Submit to Firestore ────────────────────────────────────────────────────── */
async function submitOrder() {
  if (!oState.paymentMethod)          { dstoreToast('Pilih metode pembayaran', 'error'); return; }
  if (!oState.proofUrl)               { dstoreToast('Mohon upload bukti transfer terlebih dahulu', 'error'); return; }

  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

  try {
    const orderId = generateOrderId();
    const order = await FireDB.createOrder({
      orderId,
      productId:      oState.product.id,
      productName:    oState.product.name,
      productImage:   oState.product.image,
      category:       oState.product.category,
      nominalLabel:   oState.nominal.label,
      price:          oState.nominal.price,
      accountData:    oState.accountData,
      whatsapp:       oState.whatsapp,
      paymentMethod:  oState.paymentMethod.name,
      proofUrl:       oState.proofUrl,
      proofPublicId:  oState.proofPublicId
    });

    // WhatsApp notification to owner
    const settings = oState.settings || DEFAULT_SETTINGS;
    const waMsg = encodeURIComponent(
      `*[D! STORE] Pesanan Baru!*\n` +
      `Order ID: *${orderId}*\n` +
      `Produk: ${oState.product.name}\n` +
      `Nominal: ${oState.nominal.label}\n` +
      `Total: ${formatPrice(oState.nominal.price)}\n` +
      `WhatsApp pembeli: ${oState.whatsapp}\n` +
      `Cek bukti: ${oState.proofUrl}`
    );
    const waLink = `https://wa.me/${settings.whatsapp}?text=${waMsg}`;

    document.getElementById('successOrderId').innerHTML = `<i class="fa-solid fa-receipt"></i> ${orderId}`;
    document.getElementById('trackOrderLink').href = `tracking.html?id=${orderId}`;
    document.getElementById('waOwnerLink').href = waLink;
    goToStep(4);
  } catch (e) {
    dstoreToast('Gagal membuat pesanan: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Submit Pesanan <i class="fa-solid fa-paper-plane"></i>';
  }
}
