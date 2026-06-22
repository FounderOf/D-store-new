/**
 * D! STORE — tracking.js
 * Looks up an order by Order ID and renders a status timeline.
 */

const STATUS_FLOW = ['Pending', 'Processing', 'Completed'];
const STATUS_META = {
  Pending: { icon: 'fa-clock', desc: 'Pesanan kamu sedang menunggu verifikasi pembayaran oleh tim kami.' },
  Processing: { icon: 'fa-gear', desc: 'Pembayaran terverifikasi, pesanan sedang diproses ke akun game-mu.' },
  Completed: { icon: 'fa-circle-check', desc: 'Pesanan selesai! Item / saldo sudah masuk ke akunmu.' },
  Rejected: { icon: 'fa-circle-xmark', desc: 'Pesanan ditolak. Silakan hubungi CS untuk informasi lebih lanjut.' }
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('trackForm');
  const input = document.getElementById('orderIdInput');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = input.value.trim().toUpperCase();
    if (!id) return;
    lookupOrder(id);
  });

  const params = new URLSearchParams(window.location.search);
  const presetId = params.get('id');
  if (presetId) {
    input.value = presetId;
    lookupOrder(presetId.toUpperCase());
  }
});

function lookupOrder(orderId) {
  const order = DStoreData.getOrder(orderId);
  const result = document.getElementById('trackResult');

  if (!order) {
    result.classList.add('show');
    result.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>Order ID <strong>${escapeHtml(orderId)}</strong> tidak ditemukan. Periksa kembali penulisannya.</p>
      </div>
    `;
    return;
  }

  result.classList.add('show');

  if (order.status === 'Rejected') {
    result.innerHTML = renderRejected(order);
    return;
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);

  result.innerHTML = `
    <div class="track-status-head">
      <span class="oid"><i class="fa-solid fa-receipt"></i> ${order.orderId}</span>
      <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
    </div>

    <div class="track-timeline">
      ${STATUS_FLOW.map((s, idx) => `
        <div class="track-tl-item ${idx < currentIdx ? 'done' : ''} ${idx === currentIdx ? 'current' : ''}">
          <div class="track-tl-dot">${idx <= currentIdx ? '<i class="fa-solid fa-check" style="font-size:0.55rem"></i>' : ''}</div>
          <h6>${s}</h6>
          <p>${STATUS_META[s].desc}</p>
        </div>
      `).join('')}
    </div>

    <div class="track-detail-grid">
      <div class="track-detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
      <div class="track-detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
      <div class="track-detail-item"><div class="label">Total Bayar</div><div class="value">${DStoreData.formatPrice(order.price)}</div></div>
      <div class="track-detail-item"><div class="label">Tanggal Order</div><div class="value">${DStoreData.formatDate(order.createdAt)}</div></div>
    </div>

    ${order.ownerNote ? `
      <div class="track-note-box">
        <strong>Catatan dari D! STORE</strong>
        ${escapeHtml(order.ownerNote)}
      </div>
    ` : ''}
  `;
}

function renderRejected(order) {
  return `
    <div class="track-status-head">
      <span class="oid"><i class="fa-solid fa-receipt"></i> ${order.orderId}</span>
      <span class="badge badge-rejected">Rejected</span>
    </div>
    <div class="track-note-box" style="border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05)">
      <strong style="color:var(--danger)">Pesanan Ditolak</strong>
      ${order.ownerNote ? escapeHtml(order.ownerNote) : 'Mohon hubungi customer service kami untuk informasi lebih lanjut mengenai pesanan ini.'}
    </div>
    <div class="track-detail-grid">
      <div class="track-detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
      <div class="track-detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
      <div class="track-detail-item"><div class="label">Total Bayar</div><div class="value">${DStoreData.formatPrice(order.price)}</div></div>
      <div class="track-detail-item"><div class="label">Tanggal Order</div><div class="value">${DStoreData.formatDate(order.createdAt)}</div></div>
    </div>
    <div style="margin-top:1rem;text-align:center">
      <a href="contact.html" class="btn btn-outline btn-sm"><i class="fa-brands fa-whatsapp"></i> Hubungi CS</a>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
