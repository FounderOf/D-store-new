/**
 * D! STORE — order.js
 * Multi-step order flow: pick product -> pick nominal -> account details ->
 * payment method -> upload proof -> submit. Persists order to localStorage.
 */

const oState = {
  step: 1,
  product: null,
  nominal: null,
  accountData: {},
  whatsapp: '',
  paymentMethod: null,
  proofDataUrl: null,
  proofFileName: null
};

const PAYMENT_METHODS = [
  { id: 'bca', name: 'Transfer BCA', sub: 'Bank Transfer', icon: 'fa-solid fa-building-columns' },
  { id: 'dana', name: 'DANA', sub: 'E-Wallet', icon: 'fa-solid fa-wallet' },
  { id: 'ovo', name: 'OVO', sub: 'E-Wallet', icon: 'fa-solid fa-wallet' },
  { id: 'gopay', name: 'GoPay', sub: 'E-Wallet', icon: 'fa-solid fa-wallet' }
];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const presetProductId = params.get('product');

  renderProductPickGrid(presetProductId);
  renderPayMethodGrid();
  bindNavButtons();
  bindFileUpload();

  if (presetProductId) {
    selectProduct(presetProductId);
  }
});

/* ---------------------------------------------------------------------- */
/* STEP 1: Product + Nominal selection                                    */
/* ---------------------------------------------------------------------- */

function renderProductPickGrid(presetId) {
  const grid = document.getElementById('productPickGrid');
  const products = DStoreData.getProducts();
  grid.innerHTML = products.map(p => `
    <div class="pick-tile ${presetId === p.id ? 'selected' : ''}" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}">
      <div class="pick-tile-name">${p.name}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.pick-tile').forEach(tile => {
    tile.addEventListener('click', () => selectProduct(tile.dataset.id));
  });
}

function selectProduct(productId) {
  const product = DStoreData.getProduct(productId);
  if (!product) return;
  oState.product = product;
  oState.nominal = null;

  document.querySelectorAll('#productPickGrid .pick-tile').forEach(t => {
    t.classList.toggle('selected', t.dataset.id === productId);
  });

  renderNominalGrid();
  document.getElementById('nominalSection').style.display = 'block';
  updateStep1Button();
  updateSummary();
}

function renderNominalGrid() {
  const grid = document.getElementById('nominalGrid');
  if (!oState.product) { grid.innerHTML = ''; return; }

  grid.innerHTML = oState.product.nominals.map(n => `
    <div class="nominal-tile" data-id="${n.id}">
      ${n.popular ? '<span class="nominal-tile-popular">Terlaris</span>' : ''}
      <div class="nominal-amount">${n.label}</div>
      <div class="nominal-price">${DStoreData.formatPrice(n.price)}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.nominal-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      oState.nominal = oState.product.nominals.find(n => n.id === tile.dataset.id);
      grid.querySelectorAll('.nominal-tile').forEach(t => t.classList.toggle('selected', t === tile));
      updateStep1Button();
      updateSummary();
    });
  });
}

function updateStep1Button() {
  document.getElementById('toStep2Btn').disabled = !(oState.product && oState.nominal);
}

/* ---------------------------------------------------------------------- */
/* STEP 2: Account details (dynamic fields per product)                   */
/* ---------------------------------------------------------------------- */

function renderAccountForm() {
  const form = document.getElementById('accountForm');
  if (!oState.product) { form.innerHTML = ''; return; }

  form.innerHTML = oState.product.fields.map(f => `
    <div class="form-group">
      <label class="form-label">${f.label} <span class="required">*</span></label>
      <input type="text" class="form-control" data-field="${f.key}" placeholder="${f.placeholder}" value="${oState.accountData[f.key] || ''}">
    </div>
  `).join('');

  if (oState.whatsapp) document.getElementById('whatsappInput').value = oState.whatsapp;
}

/* ---------------------------------------------------------------------- */
/* STEP 3: Payment method                                                 */
/* ---------------------------------------------------------------------- */

function renderPayMethodGrid() {
  const grid = document.getElementById('payMethodGrid');
  grid.innerHTML = PAYMENT_METHODS.map(m => `
    <div class="pay-method" data-id="${m.id}">
      <div class="pay-method-icon"><i class="${m.icon}"></i></div>
      <div>
        <div class="pay-method-name">${m.name}</div>
        <div class="pay-method-sub">${m.sub}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      oState.paymentMethod = PAYMENT_METHODS.find(m => m.id === el.dataset.id);
      grid.querySelectorAll('.pay-method').forEach(p => p.classList.toggle('selected', p === el));
      renderTransferBox();
      updateSummary();
    });
  });
}

function renderTransferBox() {
  const box = document.getElementById('transferBox');
  const settings = DStoreData.getSettings();
  if (!oState.paymentMethod) { box.classList.remove('show'); return; }

  const account = settings.bankAccounts.find(a => a.bank.toLowerCase() === oState.paymentMethod.name.toLowerCase())
    || settings.bankAccounts.find(a => oState.paymentMethod.id === 'bca' ? a.bank === 'BCA' : a.bank.toLowerCase().includes(oState.paymentMethod.id))
    || settings.bankAccounts[0];

  box.innerHTML = `
    <div class="transfer-row"><span class="label">Metode</span><span class="value">${oState.paymentMethod.name}</span></div>
    <div class="transfer-row"><span class="label">Nomor / Rekening</span><span class="value">${account.number} <button type="button" class="copy-btn" id="copyAccBtn"><i class="fa-solid fa-copy"></i></button></span></div>
    <div class="transfer-row"><span class="label">Atas Nama</span><span class="value">${account.holder}</span></div>
    <div class="transfer-row"><span class="label">Total Transfer</span><span class="value text-accent">${oState.nominal ? DStoreData.formatPrice(oState.nominal.price) : '-'}</span></div>
  `;
  box.classList.add('show');

  document.getElementById('copyAccBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(account.number).then(() => dstoreToast('Nomor rekening disalin', 'success'));
  });
}

/* ---------------------------------------------------------------------- */
/* File upload (proof)                                                    */
/* ---------------------------------------------------------------------- */

function bindFileUpload() {
  const drop = document.getElementById('fileDrop');
  const input = document.getElementById('proofInput');
  const preview = document.getElementById('filePreview');
  const previewImg = document.getElementById('previewImg');

  input.addEventListener('change', () => handleFile(input.files[0]));

  ['dragover', 'dragenter'].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(evt => drop.addEventListener(evt, e => { e.preventDefault(); drop.classList.remove('dragover'); }));
  drop.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { dstoreToast('File harus berupa gambar (JPG/PNG)', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { dstoreToast('Ukuran file maksimal 5MB', 'error'); return; }

    const reader = new FileReader();
    reader.onload = e => {
      oState.proofDataUrl = e.target.result;
      oState.proofFileName = file.name;
      previewImg.src = e.target.result;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
  }
}

/* ---------------------------------------------------------------------- */
/* Navigation between steps                                               */
/* ---------------------------------------------------------------------- */

function bindNavButtons() {
  document.getElementById('toStep2Btn').addEventListener('click', () => {
    if (!oState.product || !oState.nominal) return;
    goToStep(2);
    renderAccountForm();
  });

  document.getElementById('back1Btn').addEventListener('click', () => goToStep(1));

  document.getElementById('toStep3Btn').addEventListener('click', () => {
    if (validateStep2()) goToStep(3);
  });

  document.getElementById('back2Btn').addEventListener('click', () => goToStep(2));

  document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);
}

function goToStep(step) {
  oState.step = step;
  document.querySelectorAll('.order-step-content').forEach(c => {
    c.style.display = Number(c.dataset.content) === step ? 'block' : 'none';
  });
  document.querySelectorAll('.order-step').forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.toggle('active', n === step);
    s.classList.toggle('done', n < step);
  });
  document.querySelectorAll('.order-step-line').forEach((line, idx) => {
    line.classList.toggle('done', idx + 1 < step);
  });
  window.scrollTo({ top: document.getElementById('orderPanel').offsetTop - 100, behavior: 'smooth' });
}

function validateStep2() {
  let valid = true;
  document.querySelectorAll('#accountForm input[data-field]').forEach(input => {
    const ok = validateField(input, { required: true, minLength: 2, message: 'Wajib diisi' });
    if (!ok) valid = false;
    else oState.accountData[input.dataset.field] = input.value.trim();
  });

  const wa = document.getElementById('whatsappInput');
  const waOk = validateField(wa, { required: true, minLength: 9, pattern: /^[0-9+\-\s]+$/, message: 'Nomor WhatsApp tidak valid' });
  if (!waOk) valid = false;
  else oState.whatsapp = wa.value.trim();

  if (!valid) dstoreToast('Mohon lengkapi data dengan benar', 'error');
  return valid;
}

/* ---------------------------------------------------------------------- */
/* Summary sidebar                                                        */
/* ---------------------------------------------------------------------- */

function updateSummary() {
  const body = document.getElementById('summaryBody');
  if (!oState.product) {
    body.innerHTML = '<div class="summary-empty">Pilih produk untuk melihat ringkasan pesanan.</div>';
    return;
  }

  let html = `
    <div class="summary-row"><span class="label">Produk</span><span class="value">${oState.product.name}</span></div>
  `;
  if (oState.nominal) {
    html += `<div class="summary-row"><span class="label">Nominal</span><span class="value">${oState.nominal.label}</span></div>`;
  }
  if (oState.paymentMethod) {
    html += `<div class="summary-row"><span class="label">Pembayaran</span><span class="value">${oState.paymentMethod.name}</span></div>`;
  }
  html += `
    <div class="summary-total">
      <span class="label">Total Bayar</span>
      <span class="value">${oState.nominal ? DStoreData.formatPrice(oState.nominal.price) : '-'}</span>
    </div>
  `;
  body.innerHTML = html;
}

/* ---------------------------------------------------------------------- */
/* Submit order                                                           */
/* ---------------------------------------------------------------------- */

function submitOrder() {
  if (!oState.paymentMethod) { dstoreToast('Pilih metode pembayaran terlebih dahulu', 'error'); return; }
  if (!oState.proofDataUrl) { dstoreToast('Mohon upload bukti transfer', 'error'); return; }

  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

  const orderId = DStoreData.generateOrderId();
  const now = new Date().toISOString();

  const order = {
    orderId,
    productId: oState.product.id,
    productName: oState.product.name,
    productImage: oState.product.image,
    category: oState.product.category,
    nominalLabel: oState.nominal.label,
    price: oState.nominal.price,
    accountData: oState.accountData,
    whatsapp: oState.whatsapp,
    paymentMethod: oState.paymentMethod.name,
    proofDataUrl: oState.proofDataUrl,
    proofFileName: oState.proofFileName,
    status: 'Pending',
    ownerNote: '',
    createdAt: now,
    updatedAt: now,
    history: [{ status: 'Pending', at: now }]
  };

  setTimeout(() => {
    DStoreData.addOrder(order);
    document.getElementById('successOrderId').innerHTML = `<i class="fa-solid fa-receipt"></i> ${orderId}`;
    document.getElementById('trackOrderLink').href = `tracking.html?id=${orderId}`;
    goToStep(4);
    btn.disabled = false;
    btn.innerHTML = 'Submit Pesanan <i class="fa-solid fa-paper-plane"></i>';
  }, 700);
}
