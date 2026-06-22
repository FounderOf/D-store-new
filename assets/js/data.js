/**
 * D! STORE — data.js
 * Central data layer: products, categories, banners, testimonials.
 * Persists to localStorage so admin/owner panel edits reflect site-wide.
 */

const DSTORE_KEYS = {
  PRODUCTS: 'dstore_products',
  CATEGORIES: 'dstore_categories',
  ORDERS: 'dstore_orders',
  BANNERS: 'dstore_banners',
  SETTINGS: 'dstore_settings',
  ADMIN_SESSION: 'dstore_admin_session',
  OWNER_SESSION: 'dstore_owner_session'
};

/* ---------------------------------------------------------------------- */
/* Default seed data                                                      */
/* ---------------------------------------------------------------------- */

const DEFAULT_CATEGORIES = [
  { id: 'mobile-legends', name: 'Mobile Legends', icon: 'fa-solid fa-gamepad', image: 'assets/images/cat-mlbb.svg' },
  { id: 'free-fire', name: 'Free Fire', icon: 'fa-solid fa-fire', image: 'assets/images/cat-ff.svg' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', icon: 'fa-solid fa-crosshairs', image: 'assets/images/cat-pubgm.svg' },
  { id: 'valorant', name: 'Valorant', icon: 'fa-solid fa-bullseye', image: 'assets/images/cat-valorant.svg' },
  { id: 'genshin-impact', name: 'Genshin Impact', icon: 'fa-solid fa-mountain-sun', image: 'assets/images/cat-genshin.svg' },
  { id: 'honkai-star-rail', name: 'Honkai Star Rail', icon: 'fa-solid fa-train', image: 'assets/images/cat-honkai.svg' },
  { id: 'steam-wallet', name: 'Steam Wallet', icon: 'fa-brands fa-steam', image: 'assets/images/cat-steam.svg' },
  { id: 'google-play', name: 'Google Play', icon: 'fa-brands fa-google-play', image: 'assets/images/cat-gplay.svg' },
  { id: 'garena-shell', name: 'Garena Shell', icon: 'fa-solid fa-shield-halved', image: 'assets/images/cat-garena.svg' },
  { id: 'playstation', name: 'PlayStation Gift Card', icon: 'fa-brands fa-playstation', image: 'assets/images/cat-psn.svg' }
];

function genNominals(base) {
  return base;
}

const DEFAULT_PRODUCTS = [
  {
    id: 'p-mlbb', category: 'mobile-legends', name: 'Mobile Legends: Bang Bang',
    desc: 'Top up Diamond ML cepat & otomatis, langsung masuk ke akun.',
    image: 'assets/images/cat-mlbb.svg', popular: true, sold: 18420,
    nominals: [
      { id: 'n1', label: '86 Diamonds', price: 21000, oldPrice: 23000 },
      { id: 'n2', label: '172 Diamonds', price: 41000, oldPrice: 45000 },
      { id: 'n3', label: '257 Diamonds', price: 61000, oldPrice: null, popular: true },
      { id: 'n4', label: '344 Diamonds', price: 81000, oldPrice: 88000 },
      { id: 'n5', label: '429 Diamonds', price: 101000, oldPrice: null },
      { id: 'n6', label: '514 Diamonds', price: 121000, oldPrice: 130000 },
      { id: 'n7', label: '706 Diamonds', price: 161000, oldPrice: null },
      { id: 'n8', label: 'Weekly Diamond Pass', price: 29000, oldPrice: 32000 }
    ],
    fields: [{ key: 'userId', label: 'User ID', placeholder: 'Contoh: 123456789' }, { key: 'serverId', label: 'Zone ID / Server ID', placeholder: 'Contoh: 2345' }]
  },
  {
    id: 'p-ff', category: 'free-fire', name: 'Free Fire',
    desc: 'Top up Diamond FF instan, aman, dan terpercaya.',
    image: 'assets/images/cat-ff.svg', popular: true, sold: 15230,
    nominals: [
      { id: 'n1', label: '50 Diamonds', price: 9500, oldPrice: null },
      { id: 'n2', label: '115 Diamonds', price: 19000, oldPrice: 21000 },
      { id: 'n3', label: '240 Diamonds', price: 38000, oldPrice: null, popular: true },
      { id: 'n4', label: '355 Diamonds', price: 56000, oldPrice: 60000 },
      { id: 'n5', label: '480 Diamonds', price: 75000, oldPrice: null },
      { id: 'n6', label: '610 Diamonds', price: 94000, oldPrice: 99000 },
      { id: 'n7', label: 'Member Mingguan', price: 28000, oldPrice: null },
      { id: 'n8', label: 'Member Bulanan', price: 145000, oldPrice: 155000 }
    ],
    fields: [{ key: 'userId', label: 'Player ID', placeholder: 'Contoh: 987654321' }]
  },
  {
    id: 'p-pubgm', category: 'pubg-mobile', name: 'PUBG Mobile',
    desc: 'UC PUBG Mobile, proses cepat untuk semua region.',
    image: 'assets/images/cat-pubgm.svg', popular: true, sold: 9870,
    nominals: [
      { id: 'n1', label: '60 UC', price: 15000, oldPrice: null },
      { id: 'n2', label: '325 UC', price: 75000, oldPrice: 80000, popular: true },
      { id: 'n3', label: '660 UC', price: 149000, oldPrice: null },
      { id: 'n4', label: '1800 UC', price: 379000, oldPrice: 399000 },
      { id: 'n5', label: '3850 UC', price: 749000, oldPrice: null },
      { id: 'n6', label: '8100 UC', price: 1499000, oldPrice: 1550000 }
    ],
    fields: [{ key: 'userId', label: 'Character ID', placeholder: 'Contoh: 5123456789' }]
  },
  {
    id: 'p-valorant', category: 'valorant', name: 'Valorant Points',
    desc: 'Top up VP Valorant untuk skin, battle pass, dan agent.',
    image: 'assets/images/cat-valorant.svg', popular: false, sold: 6210,
    nominals: [
      { id: 'n1', label: '420 VP', price: 59000, oldPrice: null },
      { id: 'n2', label: '700 VP', price: 95000, oldPrice: 99000 },
      { id: 'n3', label: '1375 VP', price: 179000, oldPrice: null, popular: true },
      { id: 'n4', label: '2400 VP', price: 299000, oldPrice: 315000 },
      { id: 'n5', label: '4000 VP', price: 489000, oldPrice: null }
    ],
    fields: [{ key: 'riotId', label: 'Riot ID (Nama#Tag)', placeholder: 'Contoh: Player#1234' }]
  },
  {
    id: 'p-genshin', category: 'genshin-impact', name: 'Genshin Impact',
    desc: 'Top up Genesis Crystal untuk semua server.',
    image: 'assets/images/cat-genshin.svg', popular: false, sold: 5430,
    nominals: [
      { id: 'n1', label: '60 Genesis Crystal', price: 16000, oldPrice: null },
      { id: 'n2', label: '300+30 Genesis Crystal', price: 79000, oldPrice: 85000 },
      { id: 'n3', label: '980+110 Genesis Crystal', price: 249000, oldPrice: null, popular: true },
      { id: 'n4', label: '1980+260 Genesis Crystal', price: 479000, oldPrice: 499000 },
      { id: 'n5', label: 'Blessing of the Welkin Moon', price: 79000, oldPrice: null }
    ],
    fields: [{ key: 'uid', label: 'UID Genshin Impact', placeholder: 'Contoh: 812345678' }, { key: 'server', label: 'Server', placeholder: 'Asia / America / Europe' }]
  },
  {
    id: 'p-honkai', category: 'honkai-star-rail', name: 'Honkai: Star Rail',
    desc: 'Top up Oneiric Shard untuk Warp dan item premium.',
    image: 'assets/images/cat-honkai.svg', popular: false, sold: 3120,
    nominals: [
      { id: 'n1', label: '60 Oneiric Shard', price: 16000, oldPrice: null },
      { id: 'n2', label: '300+30 Oneiric Shard', price: 79000, oldPrice: null },
      { id: 'n3', label: '980+110 Oneiric Shard', price: 249000, oldPrice: 259000, popular: true },
      { id: 'n4', label: 'Express Supply Pass', price: 79000, oldPrice: null }
    ],
    fields: [{ key: 'uid', label: 'UID Star Rail', placeholder: 'Contoh: 700123456' }]
  },
  {
    id: 'p-steam', category: 'steam-wallet', name: 'Steam Wallet Code',
    desc: 'Voucher Steam Wallet untuk top up saldo akun Steam.',
    image: 'assets/images/cat-steam.svg', popular: true, sold: 7650,
    nominals: [
      { id: 'n1', label: 'Rp 12.000', price: 13500, oldPrice: null },
      { id: 'n2', label: 'Rp 45.000', price: 47000, oldPrice: null },
      { id: 'n3', label: 'Rp 60.000', price: 62000, oldPrice: 65000, popular: true },
      { id: 'n4', label: 'Rp 120.000', price: 122000, oldPrice: null },
      { id: 'n5', label: 'Rp 250.000', price: 252000, oldPrice: 259000 },
      { id: 'n6', label: 'Rp 500.000', price: 503000, oldPrice: null }
    ],
    fields: [{ key: 'email', label: 'Email Akun Steam', placeholder: 'nama@email.com' }]
  },
  {
    id: 'p-gplay', category: 'google-play', name: 'Google Play Gift Card',
    desc: 'Voucher Google Play untuk aplikasi, game, dan langganan.',
    image: 'assets/images/cat-gplay.svg', popular: true, sold: 11200,
    nominals: [
      { id: 'n1', label: 'Rp 10.000', price: 11000, oldPrice: null },
      { id: 'n2', label: 'Rp 30.000', price: 31500, oldPrice: null },
      { id: 'n3', label: 'Rp 50.000', price: 52000, oldPrice: 55000, popular: true },
      { id: 'n4', label: 'Rp 100.000', price: 102000, oldPrice: null },
      { id: 'n5', label: 'Rp 150.000', price: 152000, oldPrice: 159000 },
      { id: 'n6', label: 'Rp 300.000', price: 302000, oldPrice: null }
    ],
    fields: [{ key: 'email', label: 'Email Akun Google', placeholder: 'nama@email.com' }]
  },
  {
    id: 'p-garena', category: 'garena-shell', name: 'Garena Shell',
    desc: 'Top up Garena Shell untuk berbagai game Garena.',
    image: 'assets/images/cat-garena.svg', popular: false, sold: 4980,
    nominals: [
      { id: 'n1', label: '60 Shell', price: 11500, oldPrice: null },
      { id: 'n2', label: '100 Shell', price: 19000, oldPrice: null },
      { id: 'n3', label: '210 Shell', price: 38000, oldPrice: 40000, popular: true },
      { id: 'n4', label: '530 Shell', price: 94000, oldPrice: null },
      { id: 'n5', label: '1080 Shell', price: 187000, oldPrice: 195000 }
    ],
    fields: [{ key: 'userId', label: 'Garena User ID', placeholder: 'Contoh: garena_user123' }]
  },
  {
    id: 'p-psn', category: 'playstation', name: 'PlayStation Gift Card',
    desc: 'PSN Gift Card untuk top up wallet PlayStation Store.',
    image: 'assets/images/cat-psn.svg', popular: false, sold: 2340,
    nominals: [
      { id: 'n1', label: 'Rp 60.000', price: 65000, oldPrice: null },
      { id: 'n2', label: 'Rp 100.000', price: 105000, oldPrice: null },
      { id: 'n3', label: 'Rp 250.000', price: 258000, oldPrice: 265000, popular: true },
      { id: 'n4', label: 'Rp 500.000', price: 512000, oldPrice: null },
      { id: 'n5', label: 'Rp 1.000.000', price: 1015000, oldPrice: null }
    ],
    fields: [{ key: 'email', label: 'Email Akun PSN', placeholder: 'nama@email.com' }, { key: 'region', label: 'Region', placeholder: 'Indonesia / Asia' }]
  }
];

const DEFAULT_BANNERS = [
  { id: 'b1', title: 'Diskon Spesial Mobile Legends', subtitle: 'Hemat hingga 15% untuk semua nominal Diamond', image: 'assets/images/banner-1.svg', active: true },
  { id: 'b2', title: 'Bonus Voucher Free Fire', subtitle: 'Top up sekarang dan dapatkan bonus diamond', image: 'assets/images/banner-2.svg', active: true },
  { id: 'b3', title: 'Steam Wallet Cashback', subtitle: 'Cashback untuk pembelian pertama bulan ini', image: 'assets/images/banner-3.svg', active: true }
];

const DEFAULT_SETTINGS = {
  storeName: 'D! STORE',
  tagline: 'Top Up Cepat, Aman, dan Terpercaya',
  whatsapp: '6281234567890',
  email: 'support@dstore.id',
  instagram: '@dstore.id',
  tiktok: '@dstore.id',
  bankAccounts: [
    { bank: 'BCA', number: '1234567890', holder: 'PT D Store Digital Indonesia' },
    { bank: 'DANA', number: '081234567890', holder: 'D Store Official' },
    { bank: 'OVO', number: '081234567890', holder: 'D Store Official' },
    { bank: 'GoPay', number: '081234567890', holder: 'D Store Official' }
  ]
};

/* ---------------------------------------------------------------------- */
/* Storage helpers                                                        */
/* ---------------------------------------------------------------------- */

function dstoreLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('dstoreLoad error', key, e);
    return fallback;
  }
}

function dstoreSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('dstoreSave error', key, e);
    return false;
  }
}

function dstoreInit() {
  if (!localStorage.getItem(DSTORE_KEYS.PRODUCTS)) dstoreSave(DSTORE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  if (!localStorage.getItem(DSTORE_KEYS.CATEGORIES)) dstoreSave(DSTORE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  if (!localStorage.getItem(DSTORE_KEYS.BANNERS)) dstoreSave(DSTORE_KEYS.BANNERS, DEFAULT_BANNERS);
  if (!localStorage.getItem(DSTORE_KEYS.SETTINGS)) dstoreSave(DSTORE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  if (!localStorage.getItem(DSTORE_KEYS.ORDERS)) dstoreSave(DSTORE_KEYS.ORDERS, []);
}
dstoreInit();

/* ---------------------------------------------------------------------- */
/* Public data API                                                        */
/* ---------------------------------------------------------------------- */

const DStoreData = {
  getProducts() { return dstoreLoad(DSTORE_KEYS.PRODUCTS, DEFAULT_PRODUCTS); },
  saveProducts(list) { return dstoreSave(DSTORE_KEYS.PRODUCTS, list); },
  getProduct(id) { return this.getProducts().find(p => p.id === id) || null; },

  getCategories() { return dstoreLoad(DSTORE_KEYS.CATEGORIES, DEFAULT_CATEGORIES); },
  saveCategories(list) { return dstoreSave(DSTORE_KEYS.CATEGORIES, list); },

  getBanners() { return dstoreLoad(DSTORE_KEYS.BANNERS, DEFAULT_BANNERS); },
  saveBanners(list) { return dstoreSave(DSTORE_KEYS.BANNERS, list); },

  getSettings() { return dstoreLoad(DSTORE_KEYS.SETTINGS, DEFAULT_SETTINGS); },
  saveSettings(obj) { return dstoreSave(DSTORE_KEYS.SETTINGS, obj); },

  getOrders() { return dstoreLoad(DSTORE_KEYS.ORDERS, []); },
  saveOrders(list) { return dstoreSave(DSTORE_KEYS.ORDERS, list); },
  getOrder(orderId) { return this.getOrders().find(o => o.orderId === orderId) || null; },

  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrderStatus(orderId, status, note) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx === -1) return false;
    orders[idx].status = status;
    if (note !== undefined) orders[idx].ownerNote = note;
    orders[idx].updatedAt = new Date().toISOString();
    if (!orders[idx].history) orders[idx].history = [];
    orders[idx].history.push({ status, at: new Date().toISOString() });
    this.saveOrders(orders);
    return orders[idx];
  },

  generateOrderId() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DST-${datePart}-${rand}`;
  },

  formatPrice(num) {
    return 'Rp' + Number(num).toLocaleString('id-ID');
  },

  formatDate(iso) {
    try {
      return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }
};

window.DStoreData = DStoreData;
window.DSTORE_KEYS = DSTORE_KEYS;
