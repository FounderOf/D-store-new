/**
 * D! STORE — firebase-app.js
 * Firebase initialization + Firestore + Auth service layer
 * Replaces localStorage data.js entirely for production use.
 */

// ─── Firebase SDK (loaded via CDN in HTML) ───────────────────────────────────
let db, auth, currentUser = null;

function initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db   = firebase.firestore();
    auth = firebase.auth();

    // Enable offline persistence so the app works even with flaky connection
    db.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code === 'failed-precondition') console.warn('Firestore persistence: multiple tabs open');
      else if (err.code === 'unimplemented') console.warn('Firestore persistence not available in this browser');
    });

    auth.onAuthStateChanged(user => {
      currentUser = user;
      window.dispatchEvent(new CustomEvent('dstore:authchange', { detail: user }));
    });

    window.db   = db;
    window.auth = auth;
    console.log('[D! STORE] Firebase initialized ✓');
    return true;
  } catch (e) {
    console.error('[D! STORE] Firebase init failed:', e);
    return false;
  }
}

// ─── Firestore Collections ────────────────────────────────────────────────────
const COLLECTIONS = {
  PRODUCTS:   'products',
  CATEGORIES: 'categories',
  ORDERS:     'orders',
  BANNERS:    'banners',
  SETTINGS:   'settings',
  USERS:      'users'
};

// ─── Firestore helpers ────────────────────────────────────────────────────────
const FireDB = {

  // ── Products ──────────────────────────────────────────────────────────────
  async getProducts(filters = {}) {
    let ref = db.collection(COLLECTIONS.PRODUCTS).orderBy('createdAt', 'desc');
    if (filters.category) ref = ref.where('category', '==', filters.category);
    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getProduct(id) {
    const doc = await db.collection(COLLECTIONS.PRODUCTS).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async saveProduct(data, id = null) {
    const ref = id
      ? db.collection(COLLECTIONS.PRODUCTS).doc(id)
      : db.collection(COLLECTIONS.PRODUCTS).doc();
    const payload = {
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (!id) payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(payload, { merge: true });
    return ref.id;
  },

  async deleteProduct(id) {
    await db.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
  },

  // ── Categories ────────────────────────────────────────────────────────────
  async getCategories() {
    const snap = await db.collection(COLLECTIONS.CATEGORIES).orderBy('order', 'asc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async saveCategory(data, id = null) {
    const ref = id
      ? db.collection(COLLECTIONS.CATEGORIES).doc(id)
      : db.collection(COLLECTIONS.CATEGORIES).doc();
    await ref.set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return ref.id;
  },

  async deleteCategory(id) {
    await db.collection(COLLECTIONS.CATEGORIES).doc(id).delete();
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  async getOrders(filters = {}, limitN = 100) {
    let ref = db.collection(COLLECTIONS.ORDERS).orderBy('createdAt', 'desc').limit(limitN);
    if (filters.status && filters.status !== 'all') ref = ref.where('status', '==', filters.status);
    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getOrder(orderId) {
    // Search by orderId field (not doc id)
    const snap = await db.collection(COLLECTIONS.ORDERS)
      .where('orderId', '==', orderId).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  async createOrder(data) {
    const ref = db.collection(COLLECTIONS.ORDERS).doc();
    const payload = {
      ...data,
      status: 'Pending',
      ownerNote: '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      history: [{ status: 'Pending', at: new Date().toISOString() }]
    };
    await ref.set(payload);
    return { id: ref.id, ...payload };
  },

  async updateOrderStatus(docId, status, note = '') {
    const ref = db.collection(COLLECTIONS.ORDERS).doc(docId);
    const doc = await ref.get();
    if (!doc.exists) return false;
    const history = doc.data().history || [];
    history.push({ status, at: new Date().toISOString() });
    await ref.update({
      status,
      ownerNote: note,
      history,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  async getBanners() {
    const snap = await db.collection(COLLECTIONS.BANNERS).orderBy('order', 'asc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async saveBanner(data, id = null) {
    const ref = id
      ? db.collection(COLLECTIONS.BANNERS).doc(id)
      : db.collection(COLLECTIONS.BANNERS).doc();
    await ref.set({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return ref.id;
  },

  async deleteBanner(id) {
    await db.collection(COLLECTIONS.BANNERS).doc(id).delete();
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  async getSettings() {
    const doc = await db.collection(COLLECTIONS.SETTINGS).doc('main').get();
    return doc.exists ? doc.data() : DEFAULT_SETTINGS;
  },

  async saveSettings(data) {
    await db.collection(COLLECTIONS.SETTINGS).doc('main').set(data, { merge: true });
  },

  // ── Real-time listeners ───────────────────────────────────────────────────
  onOrdersChange(callback, filters = {}) {
    let ref = db.collection(COLLECTIONS.ORDERS).orderBy('createdAt', 'desc').limit(200);
    if (filters.status && filters.status !== 'all') ref = ref.where('status', '==', filters.status);
    return ref.onSnapshot(snap => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(orders);
    });
  },

  onProductsChange(callback) {
    return db.collection(COLLECTIONS.PRODUCTS)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(products);
      });
  }
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const FireAuth = {
  async loginWithEmail(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    // Fetch user role from Firestore
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(cred.user.uid).get();
    const role = userDoc.exists ? userDoc.data().role : null;
    return { user: cred.user, role };
  },

  async logout() {
    await auth.signOut();
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
  },

  async getUserRole(uid) {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? doc.data().role : null;
  }
};

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
const CloudinaryUpload = {
  async upload(file, folder = 'products') {
    if (!file) throw new Error('No file provided');

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) throw new Error('Ukuran file maksimal 5MB');
    if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${folder}`);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    const response = await fetch(url, { method: 'POST', body: formData });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Upload gagal');
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format
    };
  },

  // Upload with progress callback
  async uploadWithProgress(file, folder = 'products', onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${folder}`);

      xhr.upload.onprogress = e => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format
          });
        } else {
          reject(new Error('Upload gagal: ' + xhr.status));
        }
      };

      xhr.onerror = () => reject(new Error('Network error saat upload'));
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
      xhr.send(formData);
    });
  },

  // Get optimized URL variants
  getUrl(publicId, opts = {}) {
    const { width = 800, height, quality = 'auto', format = 'auto' } = opts;
    const transforms = [`q_${quality}`, `f_${format}`, `w_${width}`];
    if (height) transforms.push(`h_${height}`);
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transforms.join(',')}/${publicId}`;
  }
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function generateOrderId() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const datePart = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DST-${datePart}-${rand}`;
}

function formatPrice(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

function formatDate(val) {
  try {
    const d = val?.toDate ? val.toDate() : new Date(val);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return '-'; }
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function escAttr(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Default settings fallback
const DEFAULT_SETTINGS = {
  storeName: 'D! STORE',
  tagline: 'Top Up Cepat, Aman, dan Terpercaya',
  whatsapp: '6281234567890',
  email: 'support@dstore.id',
  instagram: '@dstore.id',
  tiktok: '@dstore.id',
  bankAccounts: [
    { bank: 'BCA', number: '1234567890', holder: 'PT D Store Digital' },
    { bank: 'DANA', number: '081234567890', holder: 'D Store Official' },
    { bank: 'OVO', number: '081234567890', holder: 'D Store Official' },
    { bank: 'GoPay', number: '081234567890', holder: 'D Store Official' }
  ]
};

// Expose globals
window.FireDB = FireDB;
window.FireAuth = FireAuth;
window.CloudinaryUpload = CloudinaryUpload;
window.generateOrderId = generateOrderId;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.esc = esc;
window.escAttr = escAttr;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.COLLECTIONS = COLLECTIONS;
window.initFirebase = initFirebase;
