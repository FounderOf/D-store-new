/**
 * D! STORE — firebase-config.js
 * 
 * ⚠️  GANTI NILAI DI BAWAH INI DENGAN CONFIG FIREBASE PROJECT KAMU ⚠️
 * 
 * Cara mendapatkan config:
 * 1. Buka https://console.firebase.google.com
 * 2. Buat project baru → "D! STORE"
 * 3. Tambahkan Web App → copy firebaseConfig
 * 4. Aktifkan Firestore Database (mode: production)
 * 5. Aktifkan Authentication → Email/Password
 */

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Cloudinary Config
 * 1. Daftar di https://cloudinary.com (gratis)
 * 2. Dashboard → Settings → Upload → Add upload preset
 * 3. Set preset mode: "Unsigned"
 * 4. Isi CLOUD_NAME dan UPLOAD_PRESET di bawah
 */
const CLOUDINARY_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UPLOAD_PRESET",
  folder: "dstore"
};

/**
 * App Settings
 */
const APP_CONFIG = {
  storeName: "D! STORE",
  tagline: "Top Up Cepat, Aman, dan Terpercaya",
  whatsappNumber: "6281234567890", // ganti dengan nomor WA owner
  currency: "IDR",
  locale: "id-ID"
};

window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.CLOUDINARY_CONFIG = CLOUDINARY_CONFIG;
window.APP_CONFIG = APP_CONFIG;
