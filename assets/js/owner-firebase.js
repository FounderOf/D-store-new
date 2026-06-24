/**
 * D! STORE — owner-firebase.js
 * Owner panel: real-time orders from Firestore, approve/reject/edit,
 * proof image viewer, stats dashboard.
 */

let ownerUnsubscribe = null;
let ownerAllOrders   = [];
const ownerFilter = { search: '', status: 'all', page: 1, pageSize: 10 };

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();

  guardDashboard('owner', () => {
    initOwnerDashboard();
  });

  handleDashboardLogin('ownerLoginForm', 'owner', () => {
    guardDashboard('owner', () => initOwnerDashboard());
  });

  document.getElementById('ownerLogoutBtn')?.addEventListener('click', () => dashboardLogout());

  bindSidebarToggle('dashSidebar','dashOverlay','sidebarToggle');
  bindModalBackdrops();
});

/* ── Init ─────────────────────────────────────────────────────────────────── */
function initOwnerDashboard() {
  bindTabs();
  subscribeOrders();

  document.getElementById('orderSearchInput').addEventListener('input', e => {
    ownerFilter.search = e.target.value.trim().toLowerCase();
    ownerFilter.page = 1; renderOrdersTable();
  });
  document.getElementById('orderStatusFilter').addEventListener('change', e => {
    ownerFilter.status = e.target.value;
    ownerFilter.page = 1; renderOrdersTable();
  });
  document.getElementById('viewAllOrdersBtn')?.addEventListener('click', () => switchTab('orders'));
}

/* ── Real-time listener ──────────────────────────────────────────────────── */
function subscribeOrders() {
  if (ownerUnsubscribe) ownerUnsubscribe();
  ownerUnsubscribe = FireDB.onOrdersChange(orders => {
    ownerAllOrders = orders;
    renderStats();
    renderRecentOrders();
    renderOrdersTable();
    updatePendingBadge();
  });
}

/* ── Stats ───────────────────────────────────────────────────────────────── */
function renderStats() {
  const o = ownerAllOrders;
  const pending    = o.filter(x => x.status === 'Pending').length;
  const processing = o.filter(x => x.status === 'Processing').length;
  const completed  = o.filter(x => x.status === 'Completed').length;
  const revenue    = o.filter(x => x.status === 'Completed').reduce((s,x) => s + (x.price||0), 0);

  setText('statTotal',      o.length);
  setText('statPending',    pending);
  setText('statProcessing', processing);
  setText('statCompleted',  completed);
  setText('statRevenue',    formatPrice(revenue));
}

function updatePendingBadge() {
  const n = ownerAllOrders.filter(o => o.status === 'Pending').length;
  const el = document.getElementById('pendingCountBadge');
  if (el) { el.textContent = n; el.style.display = n > 0 ? 'inline-block' : 'none'; }
}

function renderRecentOrders() {
  const tbody = document.getElementById('recentOrdersBody');
  const recent = ownerAllOrders.slice(0, 6);
  if (!recent.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Belum ada pesanan.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(o => `
    <tr>
      <td class="mono">${o.orderId}</td>
      <td>${o.productName}</td>
      <td>${o.nominalLabel}</td>
      <td>${formatPrice(o.price)}</td>
      <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
      <td>${formatDate(o.createdAt)}</td>
    </tr>`).join('');
}

/* ── Orders table ─────────────────────────────────────────────────────────── */
function getFilteredOrders() {
  let orders = [...ownerAllOrders];
  if (ownerFilter.status !== 'all') orders = orders.filter(o => o.status === ownerFilter.status);
  if (ownerFilter.search) orders = orders.filter(o =>
    o.orderId?.toLowerCase().includes(ownerFilter.search) ||
    o.productName?.toLowerCase().includes(ownerFilter.search));
  return orders;
}

function renderOrdersTable() {
  const all        = getFilteredOrders();
  const totalPages = Math.max(1, Math.ceil(all.length / ownerFilter.pageSize));
  if (ownerFilter.page > totalPages) ownerFilter.page = totalPages;
  const items = all.slice((ownerFilter.page - 1) * ownerFilter.pageSize, ownerFilter.page * ownerFilter.pageSize);
  const tbody = document.getElementById('ordersTableBody');

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Tidak ada pesanan yang cocok.</p></div></td></tr>';
  } else {
    tbody.innerHTML = items.map(o => {
      const acctVal = Object.values(o.accountData || {})[0] || '-';
      return `
        <tr>
          <td class="mono">${o.orderId}</td>
          <td>${o.productName}<br><span style="font-size:.72rem;color:var(--text-dimmer)">${o.nominalLabel}</span></td>
          <td>${esc(acctVal)}</td>
          <td>${formatPrice(o.price)}</td>
          <td>${o.proofUrl ? `<img src="${o.proofUrl}" class="proof-thumb" data-proof-url="${o.proofUrl}" alt="Bukti">` : '-'}</td>
          <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
          <td class="cell-actions">
            <button class="icon-btn" data-detail="${o.id}" title="Detail"><i class="fa-solid fa-eye"></i></button>
            ${o.status === 'Pending' ? `
              <button class="icon-btn success" data-approve="${o.id}" title="Approve"><i class="fa-solid fa-check"></i></button>
              <button class="icon-btn danger"  data-reject="${o.id}"  title="Reject"><i class="fa-solid fa-xmark"></i></button>` : ''}
          </td>
        </tr>`;
    }).join('');
  }

  setText('paginationInfo', `Menampilkan ${items.length} dari ${all.length} pesanan`);
  renderPagination(totalPages);
  bindRowActions();
}

function renderPagination(totalPages) {
  const wrap = document.getElementById('paginationBtns');
  let html = `<button ${ownerFilter.page===1?'disabled':''} data-page="${ownerFilter.page-1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) html += `<button class="${i===ownerFilter.page?'active':''}" data-page="${i}">${i}</button>`;
  html += `<button ${ownerFilter.page===totalPages?'disabled':''} data-page="${ownerFilter.page+1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  wrap.innerHTML = html;
  wrap.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.page);
      if (p >= 1 && p <= totalPages) { ownerFilter.page = p; renderOrdersTable(); }
    });
  });
}

function bindRowActions() {
  document.querySelectorAll('[data-detail]').forEach(b   => b.addEventListener('click', () => openOrderModal(b.dataset.detail)));
  document.querySelectorAll('[data-approve]').forEach(b  => b.addEventListener('click', () => quickStatus(b.dataset.approve, 'Processing')));
  document.querySelectorAll('[data-reject]').forEach(b   => b.addEventListener('click', () => quickStatus(b.dataset.reject, 'Rejected')));
  document.querySelectorAll('[data-proof-url]').forEach(img => img.addEventListener('click', () => openProofModal(img.dataset.proofUrl)));
}

async function quickStatus(docId, status) {
  const label = status === 'Processing' ? 'approve' : 'reject';
  const ok = await dstoreConfirm({ title: `${label.charAt(0).toUpperCase()+label.slice(1)} pesanan ini?`, confirmText: `Ya, ${label}`, icon: status === 'Processing' ? 'question' : 'warning' });
  if (!ok) return;
  try {
    await FireDB.updateOrderStatus(docId, status);
    dstoreToast(`Pesanan berhasil di-${label}`, 'success');
  } catch (e) { dstoreToast('Gagal memperbarui status: ' + e.message, 'error'); }
}

/* ── Order detail modal ───────────────────────────────────────────────────── */
function openOrderModal(docId) {
  const order = ownerAllOrders.find(o => o.id === docId);
  if (!order) return;
  const box = document.getElementById('orderModalBox');

  const acctRows = Object.entries(order.accountData || {}).map(([k, v]) =>
    `<div class="detail-item"><div class="label">${k}</div><div class="value">${esc(v)}</div></div>`).join('');

  box.innerHTML = `
    <div class="modal-head">
      <h3>Detail Pesanan</h3>
      <button class="modal-close" id="closeOrderModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    ${order.proofUrl ? `<img src="${order.proofUrl}" class="modal-proof-img" alt="Bukti transfer">` : ''}
    <div class="detail-grid">
      <div class="detail-item"><div class="label">Order ID</div><div class="value">${order.orderId}</div></div>
      <div class="detail-item"><div class="label">Status</div><div class="value"><span class="badge badge-${order.status.toLowerCase()}">${order.status}</span></div></div>
      <div class="detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
      <div class="detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
      <div class="detail-item"><div class="label">Total Bayar</div><div class="value">${formatPrice(order.price)}</div></div>
      <div class="detail-item"><div class="label">Metode Bayar</div><div class="value">${order.paymentMethod}</div></div>
      <div class="detail-item"><div class="label">WhatsApp</div><div class="value">
        <a href="https://wa.me/${(order.whatsapp||'').replace(/\D/g,'')}" target="_blank" style="color:var(--success)">
          <i class="fa-brands fa-whatsapp"></i> ${order.whatsapp}
        </a>
      </div></div>
      <div class="detail-item"><div class="label">Tanggal Order</div><div class="value">${formatDate(order.createdAt)}</div></div>
      ${acctRows}
    </div>
    <div class="form-group">
      <label class="form-label">Ubah Status</label>
      <select class="form-control" id="modalStatusSelect">
        ${['Pending','Processing','Completed','Rejected'].map(s =>
          `<option value="${s}" ${order.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Catatan untuk Pembeli</label>
      <textarea class="form-control" id="modalNoteInput" rows="3" placeholder="Opsional…">${esc(order.ownerNote||'')}</textarea>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" id="cancelOrderModal">Batal</button>
      <button class="btn btn-primary" id="saveOrderModal"><i class="fa-solid fa-floppy-disk"></i> Simpan</button>
    </div>`;

  document.getElementById('orderModal').classList.add('show');
  document.getElementById('closeOrderModal').addEventListener('click',  closeOrderModal);
  document.getElementById('cancelOrderModal').addEventListener('click', closeOrderModal);
  document.getElementById('saveOrderModal').addEventListener('click', async () => {
    const status = document.getElementById('modalStatusSelect').value;
    const note   = document.getElementById('modalNoteInput').value.trim();
    try {
      await FireDB.updateOrderStatus(docId, status, note);
      dstoreToast('Status pesanan diperbarui', 'success');
      closeOrderModal();
    } catch (e) { dstoreToast('Gagal: ' + e.message, 'error'); }
  });
}

function closeOrderModal() { document.getElementById('orderModal').classList.remove('show'); }

function openProofModal(url) {
  document.getElementById('proofModalImg').src = url;
  document.getElementById('proofModal').classList.add('show');
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
function bindTabs() {
  document.querySelectorAll('.dash-nav a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.dash-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      switchTab(a.dataset.tab);
      if (a.dataset.filter) {
        ownerFilter.status = a.dataset.filter;
        const sel = document.getElementById('orderStatusFilter');
        if (sel) sel.value = a.dataset.filter;
        renderOrdersTable();
      }
      closeSidebarMobile('dashSidebar','dashOverlay');
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.dash-tab-content').forEach(c =>
    c.style.display = c.dataset.tabcontent === tab ? 'block' : 'none');
  setText('topbarTitle', tab === 'orders' ? 'Semua Pesanan' : 'Dashboard');
}

/* ── Utility ─────────────────────────────────────────────────────────────── */
function bindSidebarToggle(sidebarId, overlayId, toggleId) {
  const s = document.getElementById(sidebarId);
  const o = document.getElementById(overlayId);
  const t = document.getElementById(toggleId);
  if (!t) return;
  t.addEventListener('click', () => { s?.classList.add('open'); o?.classList.add('show'); });
  o?.addEventListener('click', () => closeSidebarMobile(sidebarId, overlayId));
}
function closeSidebarMobile(sid='dashSidebar', oid='dashOverlay') {
  document.getElementById(sid)?.classList.remove('open');
  document.getElementById(oid)?.classList.remove('show');
}
function bindModalBackdrops() {
  document.querySelectorAll('.modal-backdrop-custom').forEach(b =>
    b.addEventListener('click', e => { if (e.target === b) b.classList.remove('show'); }));
  document.getElementById('closeProofModal')?.addEventListener('click', () =>
    document.getElementById('proofModal').classList.remove('show'));
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
