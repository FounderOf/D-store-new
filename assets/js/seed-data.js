/**
 * D! STORE — seed-data.js
 * Default product/category/banner data untuk di-seed ke Firestore.
 * Jalankan fungsi seedFirestore() sekali dari browser console setelah login admin.
 *
 * Usage (dari browser console di admin/index.html):
 *   await seedFirestore()
 */

const SEED_CATEGORIES = [
  { id: 'mobile-legends', name: 'Mobile Legends', icon: 'fa-solid fa-gamepad', order: 1,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'free-fire',      name: 'Free Fire',      icon: 'fa-solid fa-fire',    order: 2,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'pubg-mobile',    name: 'PUBG Mobile',    icon: 'fa-solid fa-crosshairs', order: 3,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'valorant',       name: 'Valorant',       icon: 'fa-solid fa-bullseye', order: 4,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'genshin-impact', name: 'Genshin Impact', icon: 'fa-solid fa-mountain-sun', order: 5,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'honkai-star-rail', name: 'Honkai Star Rail', icon: 'fa-solid fa-train', order: 6,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'roblox',         name: 'Roblox',         icon: 'fa-solid fa-cube',    order: 7,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'steam-wallet',   name: 'Steam Wallet',   icon: 'fa-brands fa-steam',  order: 8,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'google-play',    name: 'Google Play',    icon: 'fa-brands fa-google-play', order: 9,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'garena-shell',   name: 'Garena Shell',   icon: 'fa-solid fa-shield-halved', order: 10,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' },
  { id: 'playstation',    name: 'PlayStation Gift Card', icon: 'fa-brands fa-playstation', order: 11,
    image: 'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat.jpg' }
];

const SEED_PRODUCTS = [
  {
    id: 'mlbb', category: 'mobile-legends', name: 'Mobile Legends: Bang Bang',
    desc: 'Top up Diamond ML cepat & langsung masuk ke akun.', popular: true, sold: 18420,
    image: 'https://placehold.co/400x250/0F172A/00E5FF?text=Mobile+Legends',
    nominals: [
      { id:'n1', label:'86 Diamonds',           price:21000, oldPrice:23000,  popular:false },
      { id:'n2', label:'172 Diamonds',          price:41000, oldPrice:45000,  popular:false },
      { id:'n3', label:'257 Diamonds',          price:61000, oldPrice:null,   popular:true  },
      { id:'n4', label:'344 Diamonds',          price:81000, oldPrice:88000,  popular:false },
      { id:'n5', label:'429 Diamonds',          price:101000,oldPrice:null,   popular:false },
      { id:'n6', label:'514 Diamonds',          price:121000,oldPrice:130000, popular:false },
      { id:'n7', label:'706 Diamonds',          price:161000,oldPrice:null,   popular:false },
      { id:'n8', label:'Weekly Diamond Pass',   price:29000, oldPrice:32000,  popular:false }
    ],
    fields: [
      { key:'userId',   label:'User ID',        placeholder:'Contoh: 123456789'  },
      { key:'serverId', label:'Zone ID / Server',placeholder:'Contoh: 2345'      }
    ]
  },
  {
    id: 'ff', category: 'free-fire', name: 'Free Fire',
    desc: 'Top up Diamond FF instan, aman, dan terpercaya.', popular: true, sold: 15230,
    image: 'https://placehold.co/400x250/0F172A/F59E0B?text=Free+Fire',
    nominals: [
      { id:'n1', label:'50 Diamonds',      price:9500,  oldPrice:null,   popular:false },
      { id:'n2', label:'115 Diamonds',     price:19000, oldPrice:21000,  popular:false },
      { id:'n3', label:'240 Diamonds',     price:38000, oldPrice:null,   popular:true  },
      { id:'n4', label:'355 Diamonds',     price:56000, oldPrice:60000,  popular:false },
      { id:'n5', label:'480 Diamonds',     price:75000, oldPrice:null,   popular:false },
      { id:'n6', label:'610 Diamonds',     price:94000, oldPrice:99000,  popular:false },
      { id:'n7', label:'Member Mingguan',  price:28000, oldPrice:null,   popular:false },
      { id:'n8', label:'Member Bulanan',   price:145000,oldPrice:155000, popular:false }
    ],
    fields: [{ key:'userId', label:'Player ID', placeholder:'Contoh: 987654321' }]
  },
  {
    id: 'pubgm', category: 'pubg-mobile', name: 'PUBG Mobile',
    desc: 'UC PUBG Mobile, proses cepat untuk semua region.', popular: true, sold: 9870,
    image: 'https://placehold.co/400x250/0F172A/10B981?text=PUBG+Mobile',
    nominals: [
      { id:'n1', label:'60 UC',    price:15000,  oldPrice:null,   popular:false },
      { id:'n2', label:'325 UC',   price:75000,  oldPrice:80000,  popular:true  },
      { id:'n3', label:'660 UC',   price:149000, oldPrice:null,   popular:false },
      { id:'n4', label:'1800 UC',  price:379000, oldPrice:399000, popular:false },
      { id:'n5', label:'3850 UC',  price:749000, oldPrice:null,   popular:false },
      { id:'n6', label:'8100 UC',  price:1499000,oldPrice:null,   popular:false }
    ],
    fields: [{ key:'userId', label:'Character ID', placeholder:'Contoh: 5123456789' }]
  },
  {
    id: 'valorant', category: 'valorant', name: 'Valorant Points',
    desc: 'Top up VP Valorant untuk skin, battle pass, dan agent.', popular: false, sold: 6210,
    image: 'https://placehold.co/400x250/0F172A/EF4444?text=Valorant',
    nominals: [
      { id:'n1', label:'420 VP',   price:59000,  oldPrice:null,   popular:false },
      { id:'n2', label:'700 VP',   price:95000,  oldPrice:99000,  popular:false },
      { id:'n3', label:'1375 VP',  price:179000, oldPrice:null,   popular:true  },
      { id:'n4', label:'2400 VP',  price:299000, oldPrice:315000, popular:false },
      { id:'n5', label:'4000 VP',  price:489000, oldPrice:null,   popular:false }
    ],
    fields: [{ key:'riotId', label:'Riot ID (Nama#Tag)', placeholder:'Contoh: Player#1234' }]
  },
  {
    id: 'genshin', category: 'genshin-impact', name: 'Genshin Impact',
    desc: 'Top up Genesis Crystal untuk semua server.', popular: false, sold: 5430,
    image: 'https://placehold.co/400x250/0F172A/6366F1?text=Genshin+Impact',
    nominals: [
      { id:'n1', label:'60 Genesis Crystal',          price:16000,  oldPrice:null,   popular:false },
      { id:'n2', label:'300+30 Genesis Crystal',      price:79000,  oldPrice:85000,  popular:false },
      { id:'n3', label:'980+110 Genesis Crystal',     price:249000, oldPrice:null,   popular:true  },
      { id:'n4', label:'1980+260 Genesis Crystal',    price:479000, oldPrice:499000, popular:false },
      { id:'n5', label:'Blessing of the Welkin Moon', price:79000,  oldPrice:null,   popular:false }
    ],
    fields: [
      { key:'uid',    label:'UID Genshin Impact', placeholder:'Contoh: 812345678' },
      { key:'server', label:'Server',             placeholder:'Asia / America / Europe' }
    ]
  },
  {
    id: 'honkai', category: 'honkai-star-rail', name: 'Honkai: Star Rail',
    desc: 'Top up Oneiric Shard untuk Warp dan item premium.', popular: false, sold: 3120,
    image: 'https://placehold.co/400x250/0F172A/818CF8?text=Honkai+Star+Rail',
    nominals: [
      { id:'n1', label:'60 Oneiric Shard',       price:16000,  oldPrice:null,   popular:false },
      { id:'n2', label:'300+30 Oneiric Shard',   price:79000,  oldPrice:null,   popular:false },
      { id:'n3', label:'980+110 Oneiric Shard',  price:249000, oldPrice:259000, popular:true  },
      { id:'n4', label:'Express Supply Pass',    price:79000,  oldPrice:null,   popular:false }
    ],
    fields: [{ key:'uid', label:'UID Star Rail', placeholder:'Contoh: 700123456' }]
  },
  // ── ROBLOX (baru) ─────────────────────────────────────────────────────────
  {
    id: 'roblox', category: 'roblox', name: 'Robux — Roblox',
    desc: 'Top up Robux Roblox untuk semua platform: PC, mobile, Xbox. Proses cepat tanpa perlu share password.',
    popular: true, sold: 7800,
    image: 'https://placehold.co/400x250/0F172A/00E5FF?text=Robux+Roblox',
    nominals: [
      { id:'n1',  label:'80 Robux',           price:14000,  oldPrice:null,   popular:false },
      { id:'n2',  label:'160 Robux',          price:27000,  oldPrice:29000,  popular:false },
      { id:'n3',  label:'240 Robux',          price:39000,  oldPrice:null,   popular:false },
      { id:'n4',  label:'320 Robux',          price:52000,  oldPrice:55000,  popular:false },
      { id:'n5',  label:'400 Robux',          price:64000,  oldPrice:null,   popular:false },
      { id:'n6',  label:'800 Robux',          price:124000, oldPrice:130000, popular:true  },
      { id:'n7',  label:'1700 Robux',         price:249000, oldPrice:265000, popular:false },
      { id:'n8',  label:'4500 Robux',         price:649000, oldPrice:689000, popular:false },
      { id:'n9',  label:'10000 Robux',        price:1399000,oldPrice:null,   popular:false },
      { id:'n10', label:'Roblox Premium 450', price:69000,  oldPrice:75000,  popular:false },
      { id:'n11', label:'Roblox Premium 1000',price:139000, oldPrice:149000, popular:false },
      { id:'n12', label:'Roblox Premium 2200',price:279000, oldPrice:299000, popular:false }
    ],
    fields: [
      { key:'username', label:'Username Roblox', placeholder:'Contoh: CoolPlayer123' }
    ],
    notes: 'Proses: kami akan transfer Robux melalui marketplace atau game pass. Pastikan akun Roblox kamu aktif dan username benar.'
  },
  // ── Voucher Digital ───────────────────────────────────────────────────────
  {
    id: 'steam', category: 'steam-wallet', name: 'Steam Wallet Code',
    desc: 'Voucher Steam Wallet untuk top up saldo akun Steam kamu.', popular: true, sold: 7650,
    image: 'https://placehold.co/400x250/0F172A/94A3B8?text=Steam+Wallet',
    nominals: [
      { id:'n1', label:'Rp 12.000',  price:13500,  oldPrice:null,   popular:false },
      { id:'n2', label:'Rp 45.000',  price:47000,  oldPrice:null,   popular:false },
      { id:'n3', label:'Rp 60.000',  price:62000,  oldPrice:65000,  popular:true  },
      { id:'n4', label:'Rp 120.000', price:122000, oldPrice:null,   popular:false },
      { id:'n5', label:'Rp 250.000', price:252000, oldPrice:259000, popular:false },
      { id:'n6', label:'Rp 500.000', price:503000, oldPrice:null,   popular:false }
    ],
    fields: [{ key:'email', label:'Email Akun Steam', placeholder:'nama@email.com' }]
  },
  {
    id: 'gplay', category: 'google-play', name: 'Google Play Gift Card',
    desc: 'Voucher Google Play untuk aplikasi, game, dan langganan.', popular: true, sold: 11200,
    image: 'https://placehold.co/400x250/0F172A/10B981?text=Google+Play',
    nominals: [
      { id:'n1', label:'Rp 10.000',  price:11000,  oldPrice:null,   popular:false },
      { id:'n2', label:'Rp 30.000',  price:31500,  oldPrice:null,   popular:false },
      { id:'n3', label:'Rp 50.000',  price:52000,  oldPrice:55000,  popular:true  },
      { id:'n4', label:'Rp 100.000', price:102000, oldPrice:null,   popular:false },
      { id:'n5', label:'Rp 150.000', price:152000, oldPrice:159000, popular:false },
      { id:'n6', label:'Rp 300.000', price:302000, oldPrice:null,   popular:false }
    ],
    fields: [{ key:'email', label:'Email Akun Google', placeholder:'nama@email.com' }]
  },
  {
    id: 'garena', category: 'garena-shell', name: 'Garena Shell',
    desc: 'Top up Garena Shell untuk berbagai game Garena.', popular: false, sold: 4980,
    image: 'https://placehold.co/400x250/0F172A/EF4444?text=Garena+Shell',
    nominals: [
      { id:'n1', label:'60 Shell',   price:11500,  oldPrice:null,   popular:false },
      { id:'n2', label:'100 Shell',  price:19000,  oldPrice:null,   popular:false },
      { id:'n3', label:'210 Shell',  price:38000,  oldPrice:40000,  popular:true  },
      { id:'n4', label:'530 Shell',  price:94000,  oldPrice:null,   popular:false },
      { id:'n5', label:'1080 Shell', price:187000, oldPrice:195000, popular:false }
    ],
    fields: [{ key:'userId', label:'Garena User ID', placeholder:'Contoh: garena_user123' }]
  },
  {
    id: 'psn', category: 'playstation', name: 'PlayStation Gift Card',
    desc: 'PSN Gift Card untuk top up wallet PlayStation Store.', popular: false, sold: 2340,
    image: 'https://placehold.co/400x250/0F172A/6366F1?text=PlayStation',
    nominals: [
      { id:'n1', label:'Rp 60.000',   price:65000,   oldPrice:null,   popular:false },
      { id:'n2', label:'Rp 100.000',  price:105000,  oldPrice:null,   popular:false },
      { id:'n3', label:'Rp 250.000',  price:258000,  oldPrice:265000, popular:true  },
      { id:'n4', label:'Rp 500.000',  price:512000,  oldPrice:null,   popular:false },
      { id:'n5', label:'Rp 1.000.000',price:1015000, oldPrice:null,   popular:false }
    ],
    fields: [
      { key:'email',  label:'Email Akun PSN', placeholder:'nama@email.com' },
      { key:'region', label:'Region',         placeholder:'Indonesia / Asia' }
    ]
  }
];

const SEED_BANNERS = [
  { id:'b1', title:'Diskon Diamond Mobile Legends', subtitle:'Hemat hingga 15% untuk semua nominal Diamond', active:true, order:1,
    image:'https://placehold.co/1200x400/0F172A/00E5FF?text=D!+STORE+x+Mobile+Legends' },
  { id:'b2', title:'Robux Roblox — Promo Launching', subtitle:'Top up Robux sekarang, harga terbaik se-Indonesia!', active:true, order:2,
    image:'https://placehold.co/1200x400/0F172A/00E5FF?text=Robux+Roblox+Promo' },
  { id:'b3', title:'Steam Wallet Cashback', subtitle:'Cashback untuk pembelian pertama bulan ini', active:true, order:3,
    image:'https://placehold.co/1200x400/0F172A/94A3B8?text=Steam+Wallet+Cashback' }
];

/**
 * Seed semua data ke Firestore.
 * Panggil dari browser console: await seedFirestore()
 */
async function seedFirestore() {
  if (!window.db) { console.error('Firebase belum diinisialisasi'); return; }

  console.log('[SEED] Mulai seed data ke Firestore...');

  // Categories
  for (const cat of SEED_CATEGORIES) {
    const { id, ...data } = cat;
    await db.collection('categories').doc(id).set({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    console.log(`[SEED] Category: ${cat.name}`);
  }

  // Products
  for (const prod of SEED_PRODUCTS) {
    const { id, ...data } = prod;
    await db.collection('products').doc(id).set({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    console.log(`[SEED] Product: ${prod.name}`);
  }

  // Banners
  for (const banner of SEED_BANNERS) {
    const { id, ...data } = banner;
    await db.collection('banners').doc(id).set({ ...data, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    console.log(`[SEED] Banner: ${banner.title}`);
  }

  // Settings
  await db.collection('settings').doc('main').set({
    storeName: 'D! STORE',
    tagline: 'Top Up Cepat, Aman, dan Terpercaya',
    whatsapp: '6281234567890',
    email: 'support@dstore.id',
    instagram: '@dstore.id',
    tiktok: '@dstore.id',
    bankAccounts: [
      { bank:'BCA',   number:'1234567890',  holder:'PT D Store Digital Indonesia' },
      { bank:'DANA',  number:'081234567890', holder:'D Store Official'             },
      { bank:'OVO',   number:'081234567890', holder:'D Store Official'             },
      { bank:'GoPay', number:'081234567890', holder:'D Store Official'             }
    ],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  console.log('[SEED] ✅ Selesai! Semua data berhasil di-seed ke Firestore.');
  alert('Seed data selesai! Refresh halaman admin.');
}

/**
 * Buat akun admin/owner di Firebase Auth.
 * Panggil dari console: await createAdminUser('admin@dstore.id', 'password123', 'admin')
 */
async function createAdminUser(email, password, role = 'admin') {
  if (!window.auth || !window.db) { console.error('Firebase belum diinisialisasi'); return; }
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(cred.user.uid).set({
      email, role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`[CREATE USER] ✅ User ${email} dengan role ${role} berhasil dibuat.`);
    return cred.user;
  } catch (e) {
    console.error('[CREATE USER] Error:', e.message);
  }
}

window.seedFirestore = seedFirestore;
window.createAdminUser = createAdminUser;
