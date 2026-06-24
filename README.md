# D! STORE v2 — Firebase Production Ready

> Top Up Cepat, Aman, dan Terpercaya  
> **Stack:** Firebase Firestore + Firebase Auth + Cloudinary + Vanilla JS

---

## 🚀 Setup Awal (Wajib Dilakukan Sekali)

### Step 1 — Firebase Project

1. Buka [https://console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru → nama: **D! STORE**
3. Tambahkan **Web App** → copy `firebaseConfig`
4. Aktifkan **Firestore Database** → Start in production mode
5. Aktifkan **Authentication** → Email/Password

### Step 2 — Firestore Security Rules

Pergi ke Firestore → Rules → paste ini:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read untuk produk, kategori, banner
    match /products/{doc} { allow read: if true; allow write: if isAdminOrOwner(); }
    match /categories/{doc} { allow read: if true; allow write: if isAdminOrOwner(); }
    match /banners/{doc} { allow read: if true; allow write: if isAdminOrOwner(); }
    match /settings/{doc} { allow read: if true; allow write: if isAdminOrOwner(); }

    // Orders: siapapun bisa buat, hanya admin/owner yang bisa baca & update
    match /orders/{doc} {
      allow create: if true;
      allow read, update: if isAdminOrOwner();
    }

    // Users collection: hanya admin/owner
    match /users/{doc} { allow read, write: if isAdminOrOwner(); }

    function isAdminOrOwner() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner', 'superadmin'];
    }
  }
}
```

### Step 3 — Cloudinary

1. Daftar di [https://cloudinary.com](https://cloudinary.com) (gratis)
2. Dashboard → Settings → Upload Presets → **Add upload preset**
3. Set mode: **Unsigned**
4. Catat **Cloud Name** dan **Upload Preset name**

### Step 4 — Isi Config

Edit file `assets/js/firebase-config.js`:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",           // dari Firebase Console
  authDomain: "dstore-xxx.firebaseapp.com",
  projectId: "dstore-xxx",
  storageBucket: "dstore-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};

const CLOUDINARY_CONFIG = {
  cloudName: "dcloud123",        // dari Cloudinary Dashboard
  uploadPreset: "dstore_upload", // preset yang kamu buat
  folder: "dstore"
};

const APP_CONFIG = {
  whatsappNumber: "6281234567890", // nomor WA owner (tanpa +)
};
```

### Step 5 — Buat Akun Admin & Owner

Buka `admin/index.html`, **jangan login dulu**, buka DevTools Console (F12), paste:

```javascript
// Buat akun admin
await createAdminUser('admin@dstore.id', 'passwordkamu123', 'admin')

// Buat akun owner  
await createAdminUser('owner@dstore.id', 'passwordkamu456', 'owner')
```

### Step 6 — Seed Data Produk

Setelah login sebagai admin:
1. Klik menu **"Seed Data Awal"** di sidebar
2. Atau dari console: `await seedFirestore()`

Data yang di-seed:
- ✅ 11 Kategori (termasuk Roblox)
- ✅ 11 Produk (termasuk Robux dengan 12 nominal)
- ✅ 3 Banner promosi
- ✅ Settings toko default

---

## 📁 Struktur File

```
dstore-v2/
├── index.html              # Landing page
├── products.html           # Daftar produk
├── order.html              # Checkout (Cloudinary upload)
├── tracking.html           # Lacak pesanan (real-time Firestore)
├── faq.html                # FAQ (dengan kategori Roblox)
├── contact.html            # Form kontak
├── robots.txt
├── sitemap.xml
├── admin/
│   └── index.html          # Admin CRUD + Seed Data button
├── owner-panel/
│   └── index.html          # Owner panel (real-time orders)
└── assets/
    ├── css/                # 8 CSS files (sama seperti v1)
    ├── images/             # SVG assets + favicon
    └── js/
        ├── firebase-config.js   ⭐ ISI INI DULU
        ├── firebase-app.js      # Firestore + Cloudinary service layer
        ├── auth-firebase.js     # Firebase Auth guard
        ├── seed-data.js         # Seed 11 produk + Roblox ke Firestore
        ├── home-firebase.js
        ├── products-firebase.js
        ├── order-firebase.js    # Upload bukti → Cloudinary
        ├── tracking-firebase.js
        ├── owner-firebase.js    # Real-time listener
        ├── admin-firebase.js    # CRUD + Cloudinary image upload
        ├── common.js            # Navbar, GSAP, AOS, utils
        ├── particles.js         # Canvas particle hero
        ├── faq.js               # FAQ + Roblox FAQ
        └── contact.js
```

---

## 🎮 Produk Tersedia

| Game / Platform | Jenis | Jumlah Nominal |
|----------------|-------|----------------|
| Mobile Legends | Diamond | 8 |
| Free Fire | Diamond | 8 |
| PUBG Mobile | UC | 6 |
| Valorant | VP | 5 |
| Genshin Impact | Genesis Crystal | 5 |
| Honkai Star Rail | Oneiric Shard | 4 |
| **Roblox** | **Robux + Premium** | **12** |
| Steam Wallet | Voucher IDR | 6 |
| Google Play | Gift Card IDR | 6 |
| Garena Shell | Shell | 5 |
| PlayStation | Gift Card IDR | 5 |

---

## 🔐 Akses Panel

| Panel | URL | Role Firebase |
|-------|-----|---------------|
| Owner | `/owner-panel/` | `owner` atau `superadmin` |
| Admin | `/admin/` | `admin` atau `superadmin` |

---

## 📤 Cara Upload Gambar (Cloudinary)

Semua upload gambar di Admin Panel langsung ke Cloudinary dengan progress bar:
- **Gambar produk** → folder: `dstore/products/`
- **Icon kategori** → folder: `dstore/categories/`
- **Gambar banner** → folder: `dstore/banners/`
- **Bukti transfer** → folder: `dstore/proofs/`

---

## 🌐 Deploy ke GitHub Pages

1. Upload seluruh isi folder `dstore-v2/` ke repo GitHub
2. Settings → Pages → Branch: `main`, Folder: `/(root)`
3. Ganti `canonical` URL di semua HTML sesuai domain kamu
4. Live di `https://username.github.io/nama-repo`

**Atau hosting custom domain:**
- Vercel / Netlify: drag-drop folder, auto-deploy
- cPanel: upload via File Manager

---

## ⚠️ Perbedaan v1 (localStorage) vs v2 (Firebase)

| Fitur | v1 Demo | v2 Firebase |
|-------|---------|-------------|
| Database | localStorage (1 browser) | Firestore (cloud, multi-device) |
| Auth | Hardcoded JS | Firebase Auth (JWT secure) |
| Gambar | Base64 localStorage | Cloudinary CDN |
| Real-time | ❌ | ✅ Owner panel auto-update |
| Multi-device | ❌ | ✅ |
| Data hilang? | Ya (clear cache) | Tidak (cloud) |

© 2025 D! STORE. Seluruh hak cipta dilindungi.
