/**
 * D! STORE — tracking-firebase.js
 * Look up order from Firestore by Order ID and render timeline.
 */

const STATUS_FLOW = ['Pending','Processing','Completed'];
const STATUS_META = {
  Pending:    { desc: 'Pesanan menunggu verifikasi pembayaran oleh tim kami.' },
  Processing: { desc: 'Pembayaran terverifikasi, pesanan sedang diproses ke akunmu.' },
  Completed:  { desc: 'Pesanan selesai! Item / saldo sudah masuk ke akunmu.' },
  Rejected:   { desc: 'Pesanan ditolak. Hubungi CS untuk info lebih lanjut.' }
};

document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  const form  = document.getElementById('trackForm');
  const input = document.getElementById('orderIdInput');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = input.value.trim().toUpperCase();
    if (id) lookupOrder(id);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('id')) { input.value = params.get('id'); lookupOrder(params.get('id').toUpperCase()); }
});

async function lookupOrder(orderId) {
  const result = document.getElementById('trackResult');
  result.classList.add('show');
  result.innerHTML = '<div style="text-align:center;padding:2rem"><i class="fa-solid fa-spinner fa-spin" style="color:var(--accent);font-size:1.5rem"></i></div>';

  try {
    const order = await FireDB.getOrder(orderId);
    if (!order) {
      result.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-box-open"></i>
          <p>Order ID <strong>${esc(orderId)}</strong> tidak ditemukan.</p>
        </div>`;
      return;
    }

    if (order.status === 'Rejected') {
      result.innerHTML = renderRejected(order); return;
    }

    const currentIdx = STATUS_FLOW.indexOf(order.status);
    result.innerHTML = `
      <div class="track-status-head">
        <span class="oid"><i class="fa-solid fa-receipt"></i> ${order.orderId}</span>
        <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
      </div>
      <div class="track-timeline">
        ${STATUS_FLOW.map((s, i) => `
          <div class="track-tl-item ${i < currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}">
            <div class="track-tl-dot">${i <= currentIdx ? '<i class="fa-solid fa-check" style="font-size:.55rem"></i>' : ''}</div>
            <h6>${s}</h6><p>${STATUS_META[s].desc}</p>
          </div>`).join('')}
      </div>
      <div class="track-detail-grid">
        <div class="track-detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
        <div class="track-detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
        <div class="track-detail-item"><div class="label">Total Bayar</div><div class="value">${formatPrice(order.price)}</div></div>
        <div class="track-detail-item"><div class="label">Tanggal Order</div><div class="value">${formatDate(order.createdAt)}</div></div>
      </div>
      ${order.ownerNote ? `<div class="track-note-box"><strong>Catatan dari D! STORE</strong>${esc(order.ownerNote)}</div>` : ''}`;
  } catch (e) {
    result.innerHTML = '<div class="empty-state"><i class="fa-solid fa-wifi"></i><p>Gagal memuat data. Periksa koneksi internetmu.</p></div>';
  }
}

function renderRejected(order) {
  return `
    <div class="track-status-head">
      <span class="oid"><i class="fa-solid fa-receipt"></i> ${order.orderId}</span>
      <span class="badge badge-rejected">Rejected</span>
    </div>
    <div class="track-note-box" style="border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.05)">
      <strong style="color:var(--danger)">Pesanan Ditolak</strong>
      ${order.ownerNote ? esc(order.ownerNote) : 'Hubungi customer service kami untuk informasi lebih lanjut.'}
    </div>
    <div class="track-detail-grid">
      <div class="track-detail-item"><div class="label">Produk</div><div class="value">${order.productName}</div></div>
      <div class="track-detail-item"><div class="label">Nominal</div><div class="value">${order.nominalLabel}</div></div>
      <div class="track-detail-item"><div class="label">Total Bayar</div><div class="value">${formatPrice(order.price)}</div></div>
      <div class="track-detail-item"><div class="label">Tanggal</div><div class="value">${formatDate(order.createdAt)}</div></div>
    </div>
    <div style="margin-top:1rem;text-align:center">
      <a href="contact.html" class="btn btn-outline btn-sm"><i class="fa-brands fa-whatsapp"></i> Hubungi CS</a>
    </div>`;
}
