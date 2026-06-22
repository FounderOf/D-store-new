# D! STORE — Platform Top Up Game & Voucher Digital

> Top Up Cepat, Aman, dan Terpercaya

Website e-commerce top up game dan voucher digital yang modern, premium, dan responsif — siap deploy ke GitHub Pages.

---

## Fitur Utama

- **Landing Page Premium** — Hero section dengan animasi partikel GSAP, marquee, game grid, testimonial
- **Halaman Produk** — Filter kategori, search, sort, dan grid produk dinamis
- **Sistem Pemesanan Multi-Step** — Pilih produk → User ID → Nominal → Bayar → Upload Bukti
- **Lacak Pesanan** — Cari status order by Order ID dengan timeline visual
- **Owner Panel** — Dashboard approval/reject order, lihat bukti transfer, statistik revenue
- **Admin Panel** — CRUD produk, kategori, banner, pengaturan toko
- **FAQ Interaktif** — Accordion dengan search dan filter kategori
- **Form Kontak** — Validasi lengkap, integrasi WhatsApp

---

## Stack Teknologi

| Layer | Library |
|-------|---------|
| CSS Framework | Bootstrap 5.3 |
| Animasi | GSAP 3.12, AOS 2.3 |
| Slider | Swiper 11 |
| Icons | Font Awesome 6.5 |
| Dialog | SweetAlert2 11 |
| Font | Chakra Petch, Plus Jakarta Sans, JetBrains Mono |
| Storage | localStorage (data persisten) |
| Auth | sessionStorage (session sementara) |

---

## Struktur Project

```
dstore/
├── index.html          # Landing page
├── products.html       # Daftar produk
├── order.html          # Halaman pemesanan
├── tracking.html       # Lacak pesanan
├── faq.html            # FAQ
├── contact.html        # Kontak
├── robots.txt
├── sitemap.xml
├── admin/
│   └── index.html      # Admin panel (CRUD)
├── owner-panel/
│   └── index.html      # Owner panel (approval)
└── assets/
    ├── css/
    │   ├── variables.css    # Design tokens
    │   ├── base.css         # Reset & utilities
    │   ├── components.css   # Navbar, footer
    │   ├── home.css         # Landing page
    │   ├── products.css     # Produk
    │   ├── order.css        # Checkout
    │   ├── pages.css        # Tracking, FAQ, Kontak
    │   └── dashboard.css    # Admin/Owner panel
    ├── js/
    │   ├── data.js          # Data layer (localStorage)
    │   ├── common.js        # Shared: navbar, animasi
    │   ├── particles.js     # Canvas particles hero
    │   ├── auth.js          # Session management
    │   ├── home.js
    │   ├── products.js
    │   ├── order.js
    │   ├── tracking.js
    │   ├── faq.js
    │   ├── contact.js
    │   ├── owner-panel.js
    │   └── admin.js
    └── images/
        ├── favicon.svg
        ├── cat-*.svg        # Icon kategori
        └── banner-*.svg     # Banner promosi
```

---

## Kredensial Demo

| Panel | Username | Password |
|-------|----------|----------|
| Owner Panel | `owner` | `owner123` |
| Admin Panel | `admin` | `admin123` |

---

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub
2. Upload seluruh isi folder `dstore/` ke repo
3. Aktifkan **GitHub Pages** di Settings → Pages → Branch: `main`, Folder: `/ (root)`
4. Website akan live di `https://username.github.io/repo-name`

---

## Customisasi

### Ganti Data Produk / Kategori
Edit `DEFAULT_PRODUCTS` dan `DEFAULT_CATEGORIES` di `assets/js/data.js`.
Setelah upload ke GitHub, data dikelola lewat **Admin Panel**.

### Ganti Nomor WhatsApp & Rekening Bank
Edit `DEFAULT_SETTINGS.bankAccounts` dan `whatsapp` di `assets/js/data.js`,
atau update melalui **Admin Panel → Pengaturan Toko**.

### Ganti Warna Tema
Edit CSS variables di `assets/css/variables.css`.

---

## Lisensi

© 2025 D! STORE. Seluruh hak cipta dilindungi.
