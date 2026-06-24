/**
 * D! STORE — faq.js
 * Full FAQ dataset with category filter + live search + accordion behavior.
 */

const FAQ_DATA = [
  { cat: 'pemesanan', q: 'Bagaimana cara melakukan top up di D! STORE?', a: 'Pilih produk yang kamu inginkan di halaman Produk, masukkan User ID, pilih nominal, lalu pilih metode pembayaran dan upload bukti transfer. Pesananmu akan diproses setelah pembayaran terverifikasi.' },
  { cat: 'pemesanan', q: 'Berapa lama proses top up selesai?', a: 'Rata-rata pesanan diproses dalam 1–15 menit setelah bukti pembayaran diverifikasi oleh tim kami. Pada jam sibuk, proses bisa memakan waktu lebih lama.' },
  { cat: 'pemesanan', q: 'Bagaimana jika saya salah input User ID atau Zone ID?', a: 'Segera hubungi CS kami via WhatsApp sebelum pesanan berstatus Processing agar bisa dikoreksi. Setelah item terkirim, kesalahan data akun menjadi tanggung jawab pembeli.' },
  { cat: 'pemesanan', q: 'Apakah saya bisa membatalkan pesanan?', a: 'Pembatalan hanya bisa dilakukan selama status pesanan masih Pending. Hubungi CS kami secepatnya jika ingin membatalkan pesanan.' },
  { cat: 'pemesanan', q: 'Apa itu Order ID dan untuk apa kegunaannya?', a: 'Order ID adalah kode unik yang dibuat otomatis setiap kali kamu menyelesaikan pemesanan. Gunakan kode ini di halaman Lacak Pesanan untuk memeriksa status top up-mu.' },
  { cat: 'pembayaran', q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami menerima transfer Bank BCA, serta e-wallet seperti DANA, OVO, dan GoPay. Detail nomor rekening atau akun akan muncul otomatis setelah kamu memilih metode pembayaran saat checkout.' },
  { cat: 'pembayaran', q: 'Apakah ada biaya tambahan saat pembayaran?', a: 'Tidak ada biaya tambahan dari D! STORE. Namun, beberapa bank atau e-wallet mungkin mengenakan biaya admin sesuai kebijakan mereka masing-masing.' },
  { cat: 'pembayaran', q: 'Saya sudah transfer tapi status masih Pending, kenapa?', a: 'Tim kami memverifikasi setiap bukti pembayaran secara manual untuk menjaga keamanan transaksi. Jika sudah lebih dari 30 menit, silakan hubungi CS dengan menyertakan Order ID kamu.' },
  { cat: 'pembayaran', q: 'Apakah pembayaran di D! STORE aman?', a: 'Ya. Seluruh transaksi diverifikasi manual oleh tim kami sebelum diproses, sehingga risiko kesalahan maupun penyalahgunaan dapat diminimalkan.' },
  { cat: 'akun', q: 'Apakah data akun game saya aman?', a: 'Kami hanya menggunakan data akun (User ID/Zone ID) untuk keperluan pengiriman item top up dan tidak membagikannya ke pihak ketiga mana pun.' },
  { cat: 'akun', q: 'Apakah saya perlu membuat akun untuk top up di D! STORE?', a: 'Tidak perlu. Kamu bisa langsung melakukan pemesanan tanpa registrasi. Cukup simpan Order ID untuk melacak status pesananmu.' },
  { cat: 'akun', q: 'Bagaimana D! STORE melindungi privasi pelanggan?', a: 'Data pelanggan disimpan secara terbatas dan hanya digunakan untuk keperluan pemrosesan pesanan, sesuai dengan Kebijakan Privasi kami.' },
  { cat: 'lainnya', q: 'Apakah harga di D! STORE sudah termasuk pajak?', a: 'Harga yang tertera di setiap produk adalah harga akhir yang perlu dibayarkan, sudah termasuk biaya layanan.' },
  { cat: 'lainnya', q: 'Bagaimana cara menghubungi customer service?', a: 'Kamu bisa menghubungi tim CS kami melalui halaman Kontak atau langsung lewat tombol WhatsApp yang tersedia di seluruh halaman situs.' },
  { cat: 'lainnya', q: 'Apakah D! STORE melayani top up untuk semua region?', a: 'Sebagian besar produk kami melayani region Indonesia/Asia. Untuk produk tertentu seperti PlayStation Gift Card, mohon perhatikan region akun sebelum memesan.' }
];

let faqState = { cat: 'all', search: '' };

document.addEventListener('DOMContentLoaded', () => {
  renderFaqList();

  document.querySelectorAll('[data-faqcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      faqState.cat = btn.dataset.faqcat;
      document.querySelectorAll('[data-faqcat]').forEach(b => b.classList.toggle('active', b === btn));
      renderFaqList();
    });
  });

  document.getElementById('faqSearch').addEventListener('input', e => {
    faqState.search = e.target.value.trim().toLowerCase();
    renderFaqList();
  });
});

function renderFaqList() {
  const wrap = document.getElementById('faqAccordion');
  const empty = document.getElementById('faqEmptyState');

  let items = FAQ_DATA;
  if (faqState.cat !== 'all') items = items.filter(f => f.cat === faqState.cat);
  if (faqState.search) {
    items = items.filter(f => f.q.toLowerCase().includes(faqState.search) || f.a.toLowerCase().includes(faqState.search));
  }

  if (items.length === 0) {
    wrap.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  wrap.innerHTML = items.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q"><span>${f.q}</span><i class="fa-solid fa-plus"></i></div>
      <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
    </div>
  `).join('');

  wrap.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      wrap.querySelectorAll('.faq-item.open').forEach(el => {
        if (el !== item) { el.classList.remove('open'); el.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (isOpen) { item.classList.remove('open'); a.style.maxHeight = null; }
      else { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
}

// Inject Roblox FAQ items
const ROBLOX_FAQ = [
  { cat: 'roblox', q: 'Bagaimana cara top up Robux di D! STORE?', a: 'Pilih produk "Robux — Roblox" di halaman produk, masukkan username Roblox kamu (BUKAN password), pilih nominal, bayar, dan upload bukti transfer. Kami akan transfer Robux via marketplace atau game pass Roblox.' },
  { cat: 'roblox', q: 'Apakah saya perlu share password Roblox untuk top up?', a: 'Tidak perlu! D! STORE tidak pernah meminta password akun Roblox kamu. Kami hanya butuh username untuk proses top up. Jaga kerahasiaan passwordmu.' },
  { cat: 'roblox', q: 'Berapa lama Robux masuk setelah pembayaran?', a: 'Biasanya 15–60 menit setelah pembayaran terverifikasi. Proses lebih lama di jam sibuk. Kamu bisa lacak status via halaman Lacak Pesanan.' },
  { cat: 'roblox', q: 'Apakah akun Roblox saya aman?', a: 'Sangat aman. Kami menggunakan metode transfer yang sah melalui marketplace Roblox atau game pass, tanpa memerlukan akses ke akun kamu sama sekali.' },
  { cat: 'roblox', q: 'Apa bedanya Robux biasa dengan Roblox Premium?', a: 'Robux adalah mata uang virtual untuk beli item. Roblox Premium adalah langganan bulanan yang memberikan Robux rutin setiap bulan plus benefit tambahan seperti trading item.' }
];

// Merge into FAQ_DATA
if (typeof FAQ_DATA !== 'undefined') {
  ROBLOX_FAQ.forEach(item => FAQ_DATA.push(item));
}
