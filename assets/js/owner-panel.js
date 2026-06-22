/**
 * D! STORE — owner-panel.js
 * Owner dashboard: stats, order table with search/filter/pagination,
 * approve/reject/edit-status modal, proof image viewer.
 */

const ownerState = { search: '', status: 'all', page: 1, pageSize: 8 };

document.addEventListener('DOMContentLoaded', () => {
  dstoreGuardPage('owner');

  document.getElementById('ownerLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('ownerUsername').value.trim();
    const p = document.getElementById('ownerPassword').value;
    if (dstoreLogin('owner', u, p)) {
      dstoreGuardPage('owner');
      initOwnerDashboard();
    } else {
      dstoreToast('Username atau password salah', 'error');
    }
  });

  document.getElementById('ownerLogoutBtn').addEventListener('click', async () => {
    const ok = await dstoreConfirm({ title: 'Keluar dari Owner Panel?', text: 'Anda perlu login kembali untuk mengakses dashboard.', confirmText: 'Ya, Keluar' });
    if (ok) dstoreLogout('owner');
  });

  if (dstoreCheckSession('owner')) initOwnerDashboard();

  bindSidebarToggle();
  bindModals();
});

function initOwnerDashboard() {
  bindTabs();
  renderStats();
  renderRecentOrders();
  renderOrdersTable();
  updatePendingBadge();

  document.getElementById('orderSearchInput').addEventListener('input', e => {
    ownerState.search = e.target.value.trim().toLowerCase();
    ownerState.page = 1;
    renderOrdersTable();
  });

  document.getElementById('orderStatusFilter').addEventListener('change', e => {
    ownerState.status = e.target.value;
    ownerState.page = 1;
    renderOrdersTable();
  });

  document.getElementById('viewAllOrdersBtn').addEventListener('click', () => switchTab('orders'));
}

/* ---------------------------------------------------------------------- */
/* Tabs / Sidebar nav                                                     */
/* ---------------------------------------------------------------------- */

function bindTabs() {
  document.querySelectorAll('.dash-nav a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.dash-nav a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      switchTab(a.dataset.tab);
      if (a.dataset.filter) {
        ownerState.status = a.dataset.filter;
        document.getElementById('orderStatusFilter').value = a.dataset.filter;
        renderOrdersTable();
      }
      closeSidebarMobile();
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.dash-tab-content').forEach(c => {
    c.style.display = c.dataset.tabcontent === tab ? 'block' : 'none';
  });
  document.getElementById('topbarTitle').textContent = tab === 'orders' ? 'Semua Pesanan' : 'Dashboard';
}

function bindSidebarToggle() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  const toggle = document.getElementById('sidebarToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
  overlay.addEventListener('click', closeSidebarMobile);
}
function closeSidebarMobile() {
  document.getElementById('dashSidebar')?.classList.remove('open');
  document.getElementById('dashOverlay')?.classList.remove('show');
}

/* ---------------------------------------------------------------------- */
/* Stats                                                                  */
/* ---------------------------------------------------------------------- */

function renderStats() {
  const orders = DStoreData.getOrders();
  const pending = orders.filter(o => o.status === 'Pending').length;
  const processing = orders.filter(o => o.status === 'Processing').length;
  const completed = orders.filter(o => o.status === 'Completed').length;
  const revenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.price, 0);

  document.getElementById('statTotal').textContent = orders.length;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statProcessing').textContent = processing;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statRevenue').textContent = DStoreData.formatPrice(revenue);
}

function updatePendingBadge() {
  const pending = DStoreData.getOrders().filter(o => o.status === 'Pending').length;
  const badge = document.getElementById('pendingCountBadge');
  badge.textContent = pending;
  badge.style.display = pending > 0 ? 'inline-block' : 'none';
}

function renderRecentOrders() {
  const orders = DStoreData.getOrders().slice(0, 6);
  const tbody = document.getElementById('recentOrdersBody');

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Belum ada pesanan masuk.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td class="mono">${o.orderId}</td>
      <td>${o.productName}</td>
      <td>${o.nominalLabel}</td>
      <td>${DStoreData.formatPrice(o.price)}</td>
      <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
      <td>${DStoreData.formatDate(o.createdAt)}</td>
    </tr>
  `).join('');
}

/* ---------------------------------------------------------------------- */
/* Orders table (search, filter, pagination)                              */
/* ---------------------------------------------------------------------- */

function getFilteredOrders() {
  let orders = DStoreData.getOrders();
  if (ownerState.status !== 'all') orders = orders.filter(o => o.status === ownerState.status);
  if (ownerState.search) {
    orders = orders.filter(o =>
      o.orderId.toLowerCase().includes(ownerState.search) ||
      o.productName.toLowerCase().includes(ownerState.search)
    );
  }
  return orders;
}

function renderOrdersTable() {
  const all = getFilteredOrders();
  const totalPages = Math.max(1, Math.ceil(all.length / ownerState.pageSize));
  if (ownerState.page > totalPages) ownerState.page = totalPages;
  const start = (ownerState.page - 1) * ownerState.pageSize;
  const pageItems = all.slice(start, start + ownerState.pageSize);

  const tbody = document.getElementById('ordersTableBody');

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Tidak ada pesanan yang cocok.</p></div></td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map(o => {
      const accountValue = Object.values(o.accountData || {})[0] || '-';
      return `
        <tr>
          <td class="mono">${o.orderId}</td>
          <td>${o.productName}<br><span style="font-size:0.72rem;color:var(--text-dimmer)">${o.nominalLabel}</span></td>
          <td>${escapeHtmlOwner(accountValue)}</td>
          <td>${DStoreData.formatPrice(o.price)}</td>
          <td>${o.proofDataUrl ? `<img src="${o.proofDataUrl}" class="proof-thumb" data-proof="${o.orderId}" alt="Bukti">` : '-'}</td>
          <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
          <td class="cell-actions">
            <button class="icon-btn" data-detail="${o.orderId}" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>
            ${o.status === 'Pending' ? `
              <button class="icon-btn success" data-approve="${o.orderId}" title="Approve"><i class="fa-solid fa-check"></i></button>
              <button class="icon-btn danger" data-reject="${o.orderId}" title="Reject"><i class="fa-solid fa-xmark"></i></button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('paginationInfo').textContent = `Menampilkan ${pageItems.length} dari ${all.length} pesanan`;
  renderPaginationButtons(totalPages);
  bindRowActions();
}

function renderPaginationButtons(totalPages) {
  const wrap = document.getElementById('paginationBtns');
  let html = `<button ${ownerState.page === 1 ? 'disabled' : ''} data-page="${ownerState.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === ownerState.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${ownerState.page === totalPages ? 'disabled' : ''} data-page="${ownerState.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
  wrap.innerHTML = html;
  wrap.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = Number(btn.dataset.page);
      if (p >= 1 && p <= totalPages) { ownerState.page = p; renderOrdersTable(); }
    });
  });
}

function bindRowActions() {
  document.querySelectorAll('[data-detail]').forEach(btn => {
    btn.addEventListener('click', () => openOrderModal(btn.dataset.detail));
  });
  document.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', () => quickUpdateStatus(btn.dataset.approve, 'Processing'));
  });
  document.querySelectorAll('[data-reject]').forEach(btn => {
    btn.addEventListener('click', () => quickUpdateStatus(btn.dataset.reject, 'Rejected'));
  });
  document.querySelectorAll('[data-proof]').forEach(img => {
    img.addEventListener('click', () => openProofModal(img.dataset.proof));
  });
}

async function quickUpdateStatus(orderId, status) {
  const label = status === 'Processing' ? 'menyetujui' : 'menolak';
  const ok = await dstoreConfirm({
    title: `${status === 'Processing' ? 'Approve' : 'Reject'} Pesanan?`,
    text: `Anda akan ${label} pesanan ${orderId}.`,
    confirmText: status === 'Processing' ? 'Ya, Approve' : 'Ya, Reject',
    icon: status === 'Processing' ? 'question' : 'warning'
  });
  if (!ok) return;
  DStoreData.updateOrderStatus(orderId, status);
  dstoreToast(`Pesanan ${orderId} berhasil di-${status === 'Processing' ? 'approve' : 'reject'}`, 'success');
  refreshAll();
}

function refreshAll() {
  renderStats();
  renderRecentOrders();
  renderOrdersTable();
  updatePendingBadge();
}

/* ---------------------------------------------------------------------- */
/* Order detail / approval modal                                          */
/* ---------------------------------------------------------------------- */

function openOrderModal(orderId) {
  const order = DStoreData.getOrder(orderId);
  if (!order) return;
  const box = document.getElementById('orderModalBox');

  const accountRows = Object.entries(order.accountData || {}).map(([k, v]) => `
    <div class="detail-item"><div class="label">${k}</div><div class="value">${escapeHtmlOwner(v)}</div></div>
  `).join('');

  box.innerHTML = `
    <div class="modal-head">
      <h3>Detail Pesanan</h3>
      <button class="modal-close" id="closeOrderModal"><i class="fa-solid fa-xmark"></i></button>
    </div>

    ${order.proofDataUrl ? `<img src="${order.proofDataUrl}" class="modal-proof-img" alt="Bukti transfer">` : ''}

    <div class="detail-grid">
      <div class="detail-item"><div class="label">Order ID</div><div class="value">${order.orderId}</div></div>
      <div class="detail-item"><div class="label">Status</div><div class="value"><span class="badge badge-${order.status.toLowerCase()}">${order.status}</span></div></div>
      <div class="detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
      <div class="detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
      <div class="detail-item"><div class="label">Total Bayar</div><div class="value">${DStoreData.formatPrice(order.price)}</div></div>
      <div class="detail-item"><div class="label">Metode Bayar</div><div class="value">${order.paymentMethod}</div></div>
      <div class="detail-item"><div class="label">WhatsApp</div><div class="value">${order.whatsapp}</div></div>
      <div class="detail-item"><div class="label">Tanggal Order</div><div class="value">${DStoreData.formatDate(order.createdAt)}</div></div>
      ${accountRows}
    </div>

    <div class="form-group">
      <label class="form-label">Ubah Status</label>
      <select class="form-control" id="modalStatusSelect">
        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="Rejected" ${order.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Catatan untuk Pembeli</label>
      <textarea class="form-control" id="modalNoteInput" rows="3" placeholder="Opsional, akan tampil di halaman lacak pesanan">${order.ownerNote || ''}</textarea>
    </div>

    <div class="modal-foot">
      <button class="btn btn-outline" id="cancelModalBtn">Batal</button>
      <button class="btn btn-primary" id="saveModalBtn"><i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan</button>
    </div>
  `;

  document.getElementById('orderModal').classList.add('show');
  document.getElementById('closeOrderModal').addEventListener('click', closeOrderModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeOrderModal);
  document.getElementById('saveModalBtn').addEventListener('click', () => {
    const status = document.getElementById('modalStatusSelect').value;
    const note = document.getElementById('modalNoteInput').value.trim();
    DStoreData.updateOrderStatus(order.orderId, status, note);
    dstoreToast('Status pesanan diperbarui', 'success');
    closeOrderModal();
    refreshAll();
  });
}

function closeOrderModal() { document.getElementById('orderModal').classList.remove('show'); }

function openProofModal(orderId) {
  const order = DStoreData.getOrder(orderId);
  if (!order || !order.proofDataUrl) return;
  document.getElementById('proofModalImg').src = order.proofDataUrl;
  document.getElementById('proofModal').classList.add('show');
}

function bindModals() {
  document.getElementById('closeProofModal')?.addEventListener('click', () => {
    document.getElementById('proofModal').classList.remove('show');
  });
  document.querySelectorAll('.modal-backdrop-custom').forEach(backdrop => {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('show'); });
  });
}

function escapeHtmlOwner(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
