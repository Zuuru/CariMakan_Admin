/**
 * CariMakan — Firestore Database Setup Script
 *
 * Fungsi script ini:
 * 1. Membuat semua koleksi dengan dokumen contoh (seed data)
 * 2. Setup Firestore Security Rules (via print ke console)
 * 3. Setup Firestore Indexes (via print ke console)
 *
 * Cara pakai:
 *   node firestore-setup.js
 *
 * Prerequisites:
 *   npm install firebase-admin
 *   Pastikan file service account key sudah ada di path yang benar.
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Ganti path sesuai lokasi file kamu

// ─── Init ────────────────────────────────────────────────────────────────────

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const now = admin.firestore.Timestamp.now();

async function seedCollection(collectionName, docs) {
  console.log(`\n📂 Seeding koleksi: ${collectionName}`);
  const batch = db.batch();

  for (const doc of docs) {
    const { id, ...data } = doc;
    const ref = db.collection(collectionName).doc(id);
    batch.set(ref, data);
    console.log(`   ✅ ${id}`);
  }

  await batch.commit();
  console.log(`   ✔  ${collectionName} selesai (${docs.length} dokumen)`);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const users = [
  {
    id: "admin_001",
    nama: "Admin CariMakan",
    email: "admin@carimakan.app",
    role: "admin",
    password: "password123",
    foto_url: null,
    poin_reward: 0,
    fcm_token: null,
    status: "aktif",
    url_whatsapp: null,
    created_at: now,
  },
  {
    id: "owner_001",
    nama: "Pak Budi",
    email: "owner@carimakan.app",
    role: "owner",
    password: "password123",
    foto_url: null,
    poin_reward: 0,
    fcm_token: null,
    status: "aktif",
    url_whatsapp: "6281234567890",
    created_at: now,
  },
  {
    id: "customer_001",
    nama: "Ani Susanti",
    email: "customer@carimakan.app",
    role: "customer",
    password: "password123",
    foto_url: null,
    poin_reward: 50,
    fcm_token: null,
    status: "aktif",
    url_whatsapp: null,
    created_at: now,
  },
];

const restaurants = [
  {
    id: "resto_001",
    owner_id: "owner_001",
    nama: "Warung Pak Budi",
    lokasi: new admin.firestore.GeoPoint(-6.9667, 110.4167), // Semarang
    foto_uri: null,
    jam_buka: "08:00-22:00",
    status: "aktif",
    url_whatsapp: "6281234567890",
    avg_rating: 0.0,
    total_review: 0,
    created_at: now,
  },
];

const menus = [
  {
    id: "menu_001",
    resto_id: "resto_001",
    nama: "Nasi Goreng Spesial",
    harga: 25000,
    foto_url: null,
    deskripsi: "Nasi goreng dengan telur, ayam, dan kerupuk",
    tersedia: true,
    category: "Makanan",
  },
  {
    id: "menu_002",
    resto_id: "resto_001",
    nama: "Mie Ayam Bakso",
    harga: 20000,
    foto_url: null,
    deskripsi: "Mie ayam dengan bakso sapi",
    tersedia: true,
    category: "Makanan",
  },
  {
    id: "menu_003",
    resto_id: "resto_001",
    nama: "Ayam Bakar Madu",
    harga: 30000,
    foto_url: null,
    deskripsi: "Ayam bakar bumbu madu gurih manis",
    tersedia: true,
    category: "Makanan",
  },
  {
    id: "menu_004",
    resto_id: "resto_001",
    nama: "Chicken Cordon Bleu",
    harga: 45000,
    foto_url: "assets/images/menu/makanan/Chicken Cordon Bleu.jpg",
    deskripsi: "Dada ayam fillet gulung isi smoke beef dan keju",
    tersedia: true,
    category: "Makanan",
  },
  {
    id: "menu_005",
    resto_id: "resto_001",
    nama: "Nasi Rendang",
    harga: 28000,
    foto_url: null,
    deskripsi: "Nasi hangat dengan rendang daging sapi khas Minang",
    tersedia: true,
    category: "Makanan",
  },
  {
    id: "menu_006",
    resto_id: "resto_001",
    nama: "Es Teh Manis",
    harga: 5000,
    foto_url: null,
    deskripsi: "Teh manis dingin segar",
    tersedia: true,
    category: "Minuman",
  },
  {
    id: "menu_007",
    resto_id: "resto_001",
    nama: "Butterscotch Sea Salt",
    harga: 37000,
    foto_url: "assets/images/menu/minuman/images.jpg",
    deskripsi: "Minuman kopi manis gurih butterscotch dengan sentuhan sea salt",
    tersedia: true,
    category: "Minuman",
  },
  {
    id: "menu_008",
    resto_id: "resto_001",
    nama: "Es Jeruk Segar",
    harga: 8000,
    foto_url: null,
    deskripsi: "Es jeruk manis peras asli",
    tersedia: true,
    category: "Minuman",
  },
  {
    id: "menu_009",
    resto_id: "resto_001",
    nama: "Kopi Susu Gula Aren",
    harga: 22000,
    foto_url: null,
    deskripsi: "Espresso dengan susu dan pemanis gula aren alami",
    tersedia: true,
    category: "Minuman",
  },
  {
    id: "menu_010",
    resto_id: "resto_001",
    nama: "Matcha Latte",
    harga: 28000,
    foto_url: null,
    deskripsi: "Teh hijau Jepang bubuk berkualitas tinggi dengan susu hangat/dingin",
    tersedia: true,
    category: "Minuman",
  },
];

const meja = [
  {
    id: "meja_001",
    resto_id: "resto_001",
    nomor_meja: 1,
    qr_code_url: null, // Di-generate saat owner klik generate QR
  },
  {
    id: "meja_002",
    resto_id: "resto_001",
    nomor_meja: 2,
    qr_code_url: null,
  },
  {
    id: "meja_003",
    resto_id: "resto_001",
    nomor_meja: 3,
    qr_code_url: null,
  },
];

const badges = [
  { id: "badge_001", nama: "WiFi", icon: "wifi" },
  { id: "badge_002", nama: "AC", icon: "ac" },
  { id: "badge_003", nama: "Area Parkir", icon: "parking" },
  { id: "badge_004", nama: "Toilet Bersih", icon: "toilet" },
  { id: "badge_005", nama: "Ramah Anak", icon: "child_friendly" },
  { id: "badge_006", nama: "Non-Smoking", icon: "no_smoking" },
];

const restoBadges = [
  { id: "rb_001", resto_id: "resto_001", badge_id: "badge_001" }, // WiFi
  { id: "rb_002", resto_id: "resto_001", badge_id: "badge_002" }, // AC
  { id: "rb_003", resto_id: "resto_001", badge_id: "badge_003" }, // Parkir
];

// ─── Tag Kategori & Review Tags (ERD baru) ────────────────────────────────────

const tagKategori = [
  { id: "kat_001", nama: "pelayanan", icon: "service" },
  { id: "kat_002", nama: "makanan", icon: "food" },
  { id: "kat_003", nama: "fasilitas", icon: "facility" },
  { id: "kat_004", nama: "suasana", icon: "ambience" },
];

const reviewTags = [
  // Pelayanan
  { id: "tag_001", kategori_id: "kat_001", label: "Pelayanan ramah", icon: "smile" },
  { id: "tag_002", kategori_id: "kat_001", label: "Antrian cepat", icon: "fast" },
  { id: "tag_003", kategori_id: "kat_001", label: "Pesanan tepat waktu", icon: "clock" },
  // Makanan
  { id: "tag_004", kategori_id: "kat_002", label: "Makanan enak", icon: "yummy" },
  { id: "tag_005", kategori_id: "kat_002", label: "Porsi besar", icon: "bowl" },
  { id: "tag_006", kategori_id: "kat_002", label: "Harga terjangkau", icon: "price" },
  // Fasilitas
  { id: "tag_007", kategori_id: "kat_003", label: "WiFi cepat", icon: "wifi" },
  { id: "tag_008", kategori_id: "kat_003", label: "Tempat bersih", icon: "clean" },
  { id: "tag_009", kategori_id: "kat_003", label: "AC sejuk", icon: "ac" },
  // Suasana
  { id: "tag_010", kategori_id: "kat_004", label: "Suasana nyaman", icon: "cozy" },
  { id: "tag_011", kategori_id: "kat_004", label: "Cocok untuk nongkrong", icon: "hangout" },
];

const promoVouchers = [
  {
    id: "promo_001",
    created_by: "admin_001",
    resto_id: null,       // null = promo global
    user_id: null,        // null = publik
    kode: "WELCOME10",
    nama: "Welcome Discount",
    deskripsi: "Diskon 10% untuk semua pengguna baru",
    nilai_diskon: 10,
    is_percent: true,
    mulai: now,
    berakhir: admin.firestore.Timestamp.fromDate(new Date("2026-12-31")),
    is_active: true,
    is_used: false,
  },
];

const orders = [];
const orderReviewTags = [];

// Generate 40 orders spanning across the last 30 days
for (let i = 1; i <= 40; i++) {
  // Random day between 0 and 30 days ago
  const daysAgo = Math.floor(Math.random() * 30);
  const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  // Random hour
  orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  
  const basePrice = Math.floor(Math.random() * 150000) + 20000;
  const platformFee = Math.floor(basePrice * 0.07);
  
  const orderId = `order_generated_${i.toString().padStart(3, '0')}`;

  orders.push({
    id: orderId,
    user_id: "customer_001",
    resto_id: "resto_001",
    tipe_pesanan: Math.random() > 0.5 ? "dine_in" : "take_away",
    status: "completed",
    total_price: basePrice + platformFee,
    app_profit: platformFee,
    created_at: admin.firestore.Timestamp.fromDate(orderDate),
  });

  // Assign 1-3 random review tags to 70% of the orders
  if (Math.random() > 0.3) {
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffledTags = [...reviewTags].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numTags; j++) {
      orderReviewTags.push({
        id: `${orderId}_tag_${j}`,
        order_id: orderId,
        tag_id: shuffledTags[j].id,
      });
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 CariMakan — Firestore Setup Script");
  console.log("=====================================\n");

  try {
    await seedCollection("users", users);
    await seedCollection("restaurants", restaurants);
    await seedCollection("menus", menus);
    await seedCollection("meja", meja);
    await seedCollection("badges", badges);
    await seedCollection("resto_badges", restoBadges);
    await seedCollection("tag_kategori", tagKategori);
    await seedCollection("review_tags", reviewTags);
    await seedCollection("promo_vouchers", promoVouchers);
    await seedCollection("orders", orders);
    await seedCollection("order_review_tags", orderReviewTags);

    // Koleksi berikut sengaja dibiarkan kosong (diisi oleh transaksi nyata):
    // order_items, payments, reward_poin
    console.log("\n⚠️  Koleksi berikut tidak di-seed (diisi oleh transaksi nyata):");
    console.log("   - order_items");
    console.log("   - payments");
    console.log("   - reward_poin");

    console.log("\n✅ Setup selesai! Semua koleksi berhasil dibuat.\n");
  } catch (err) {
    console.error("\n❌ Error saat setup:", err);
    process.exit(1);
  }
}

main();
