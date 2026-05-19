# CariMakan — API Documentation

Dokumentasi lengkap REST API platform **CariMakan**. API ini berjalan menggunakan Express server dan terhubung langsung ke Firestore Database.

## 📌 Informasi Umum

* **Local Development Base URL**: `http://localhost:3001/v1`
* **Production Base URL**: `https://api.carimakan.app/v1`
* **Format Request/Response**: JSON (`Content-Type: application/json`)
* **Autentikasi**: Header `Authorization` dengan skema Bearer JWT token.
  ```http
  Authorization: Bearer <jwt_token>
  ```

---

## 🔑 1. Autentikasi (`/auth`)

### 📝 POST `/auth/register`
Mendaftarkan akun baru (Customer, Owner, atau Admin).

* **Role Akses**: Publik
* **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "password": "password123",
    "phone": "6281234567890",
    "role": "customer" // customer / owner / admin (default: customer)
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "uid": "user_abc123",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "role": "customer"
  }
  ```
* **Response `400 Bad Request`**: `{ "error": "Name, email, and password are required" }`
* **Response `409 Conflict`**: `{ "error": "Email already registered" }`

---

### 🔑 POST `/auth/login`
Melakukan autentikasi email dan password untuk mendapatkan JWT Token.

* **Role Akses**: Publik
* **Request Body**:
  ```json
  {
    "email": "budi@email.com",
    "password": "password123"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "uid": "user_abc123",
    "role": "customer"
  }
  ```
* **Response `401 Unauthorized`**: `{ "error": "Invalid email or password" }`
* **Response `403 Forbidden`**: `{ "error": "This account is suspended" }`

---

## 🍔 2. Restoran (`/restaurants`)

### 📋 GET `/restaurants`
Mendapatkan daftar restoran aktif secara umum (tanpa filter koordinat GPS).

* **Role Akses**: Publik
* **Query Params**:
  * `limit` (number, optional): Jumlah maksimum restoran yang ingin ditampilkan.
  * `status` (string, optional): Filter status restoran (default: `aktif`). Gunakan `all` untuk menampilkan semua status.
* **Response `200 OK`**:
  ```json
  [
    {
      "resto_id": "resto_001",
      "name": "Warung Pak Budi",
      "rating_avg": 4.5,
      "total_review": 12,
      "is_queue_open": true,
      "queue_count": 3,
      "badges": ["WiFi", "AC", "Area Parkir"],
      "photo_url": "https://storage.googleapis...",
      "status": "aktif"
    }
  ]
  ```

---

### 📍 GET `/restaurants/nearby`
Mendapatkan daftar restoran aktif terdekat berdasarkan koordinat GPS dan radius pencarian.

* **Role Akses**: Publik
* **Query Params**:
  * `lat` (float, required): Latitude user.
  * `lng` (float, required): Longitude user.
  * `radius` (number, optional): Jarak pencarian dalam meter (default: `2000`).
* **Response `200 OK`**:
  ```json
  [
    {
      "resto_id": "resto_001",
      "name": "Warung Pak Budi",
      "distance_m": 350,
      "rating_avg": 4.5,
      "is_queue_open": true,
      "queue_count": 3,
      "badges": ["WiFi", "AC", "Area Parkir"],
      "photo_url": "https://storage.googleapis..."
    }
  ]
  ```

---

### ℹ️ GET `/restaurants/:resto_id`
Mendapatkan detail lengkap informasi suatu restoran.

* **Role Akses**: Publik
* **Response `200 OK`**:
  ```json
  {
    "resto_id": "resto_001",
    "name": "Warung Pak Budi",
    "owner_id": "owner_001",
    "lokasi": {
      "lat": -6.9667,
      "lng": 110.4167
    },
    "jam_buka": "08:00-22:00",
    "status": "aktif",
    "url_whatsapp": "6281234567890",
    "rating_avg": 4.5,
    "total_review": 12,
    "is_queue_open": true,
    "queue_count": 3,
    "badges": [
      { "id": "badge_001", "nama": "WiFi", "icon": "wifi" }
    ],
    "photo_url": null,
    "created_at": "2026-05-19T12:00:00.000Z"
  }
  ```

---

### 🏪 POST `/restaurants`
Mendaftarkan restoran baru. Status awal diset ke `pending` (menunggu verifikasi Admin).

* **Role Akses**: Logged In (Owner Only)
* **Request Body**:
  ```json
  {
    "name": "Sate Madura Asli",
    "lat": -6.9688,
    "lng": 110.4188,
    "jam_buka": "17:00-23:00",
    "url_whatsapp": "62899999999",
    "foto_uri": "https://storage.googleapis...",
    "badges": ["badge_001", "badge_003"]
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "resto_id": "resto_xyz123",
    "owner_id": "owner_001",
    "nama": "Sate Madura Asli",
    "lokasi": {
      "lat": -6.9688,
      "lng": 110.4188
    },
    "foto_uri": "https://storage.googleapis...",
    "jam_buka": "17:00-23:00",
    "status": "pending",
    "url_whatsapp": "62899999999",
    "avg_rating": 0,
    "total_review": 0,
    "is_queue_open": true
  }
  ```

---

### ✏️ PUT `/restaurants/:resto_id`
Memperbarui profil informasi restoran.

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran ini)
* **Request Body**:
  ```json
  {
    "name": "Warung Pak Budi Premium",
    "is_queue_open": false
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Restaurant updated successfully"
  }
  ```

---

## 🍽️ 3. Menu Restoran (`/restaurants/:resto_id/menus`)

### 📋 GET `/restaurants/:resto_id/menus`
Mendapatkan semua daftar menu yang tersedia di restoran tertentu.

* **Role Akses**: Publik
* **Response `200 OK`**:
  ```json
  [
    {
      "menu_id": "menu_001",
      "name": "Nasi Goreng Spesial",
      "price": 25000,
      "description": "Nasi goreng dengan telur, ayam, dan kerupuk",
      "is_available": true,
      "photo_url": null,
      "category": "makanan" // makanan / minuman
    }
  ]
  ```

---

### ➕ POST `/restaurants/:resto_id/menus`
Menambahkan item menu baru ke restoran.

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran)
* **Request Body**:
  ```json
  {
    "name": "Es Jeruk Manis",
    "price": 7000,
    "description": "Perasan jeruk asli segar",
    "is_available": true,
    "photo_url": null,
    "category": "minuman"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "menu_id": "menu_abc123",
    "resto_id": "resto_001",
    "nama": "Es Jeruk Manis",
    "harga": 7000,
    "deskripsi": "Perasan jeruk asli segar",
    "tersedia": true,
    "foto_url": null,
    "category": "minuman"
  }
  ```

---

### ✏️ PUT `/restaurants/:resto_id/menus/:menu_id`
Memperbarui detail item menu tertentu.

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran)
* **Request Body**:
  ```json
  {
    "price": 8000,
    "is_available": false
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Menu updated successfully"
  }
  ```

---

### 🗑️ DELETE `/restaurants/:resto_id/menus/:menu_id`
Menghapus item menu tertentu dari restoran.

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran)
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Menu deleted successfully"
  }
  ```

---

## ⏳ 4. Antrian (`/queues`)

### 📊 GET `/queues/:resto_id/status`
Melihat status antrian, jumlah pelanggan yang sedang mengantri, dan estimasi waktu tunggu.

* **Role Akses**: Publik
* **Response `200 OK`**:
  ```json
  {
    "is_queue_open": true,
    "queue_count": 5,
    "estimated_wait_minutes": 25
  }
  ```

---

### 🎫 POST `/queues/:resto_id/take`
Mengambil nomor antrian baru hari ini.

* **Role Akses**: Logged In (Customer)
* **Request Body**:
  ```json
  {
    "type": "dine_in" // dine_in / take_away
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "queue_id": "queue_xyz987",
    "queue_number": 6,
    "type": "dine_in"
  }
  ```

---

### 🔊 PUT `/queues/:resto_id/call`
Memanggil nomor antrian berikutnya (mengambil antrian tertua dengan status `waiting` lalu merubahnya ke `called`).

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran)
* **Response `200 OK`**:
  ```json
  {
    "message": "Queue called successfully",
    "queue_id": "queue_xyz987",
    "queue_number": 6,
    "type": "dine_in"
  }
  ```

---

### ⚙️ PUT `/queues/:resto_id/toggle`
Membuka atau menutup status pendaftaran antrian restoran.

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran)
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "is_queue_open": false
  }
  ```

---

## 📝 5. Pesanan (`/orders`)

### 🛒 POST `/orders`
Membuat pesanan baru. Sistem otomatis menghitung total harga asli, diskon voucher (jika ada), platform fee 7% (`app_profit`), mencatat order items snapshot, dan mengintegrasikan pembayaran Midtrans.

* **Role Akses**: Logged In (Customer)
* **Request Body**:
  ```json
  {
    "resto_id": "resto_001",
    "queue_id": "queue_xyz987", // optional
    "type": "dine_in", // dine_in / take_away
    "pickup_time": "2026-05-19T21:00:00.000Z", // optional
    "promo_code": "WELCOME10", // optional
    "items": [
      { "menu_id": "menu_001", "qty": 2, "catatan": "Pedas sedang" },
      { "menu_id": "menu_003", "qty": 1 }
    ]
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "order_id": "order_abc123",
    "total_price": 58850,
    "status": "pending",
    "payment_url": "https://checkout.sandbox.midtrans.com/v1/payment-links/..."
  }
  ```

---

### 📜 GET `/orders/history`
Mendapatkan semua riwayat pesanan/transaksi yang pernah dibuat oleh customer yang sedang login.

* **Role Akses**: Logged In (Customer)
* **Response `200 OK`**:
  ```json
  [
    {
      "order_id": "order_abc123",
      "resto_id": "resto_001",
      "resto_name": "Warung Pak Budi",
      "tipe_pesanan": "dine_in",
      "status": "completed",
      "total_price": 58850,
      "created_at": "2026-05-19T13:00:00.000Z"
    }
  ]
  ```

---

### ℹ️ GET `/orders/:order_id`
Mendapatkan informasi detail pesanan tertentu beserta daftar item makanannya.

* **Role Akses**: Logged In (Customer pembuat, Owner restoran terkait, atau Admin)
* **Response `200 OK`**:
  ```json
  {
    "order_id": "order_abc123",
    "resto_id": "resto_001",
    "resto_name": "Warung Pak Budi",
    "user_id": "customer_001",
    "queue_id": "queue_xyz987",
    "tipe_pesanan": "dine_in",
    "status": "processing",
    "total_price": 58850,
    "app_profit": 3850,
    "created_at": "2026-05-19T13:00:00.000Z",
    "pickup_time": "2026-05-19T21:00:00.000Z",
    "items": [
      {
        "menu_id": "menu_001",
        "name": "Nasi Goreng Spesial",
        "qty": 2,
        "harga_saat_order": 25000,
        "catatan": "Pedas sedang"
      }
    ]
  }
  ```

---

### ✏️ PUT `/orders/:order_id/status`
Memperbarui status pesanan. Ketika status diubah ke `completed`, customer otomatis akan mendapatkan perolehan Poin Reward (kelipatan Rp 10.000 = 1 poin).

* **Role Akses**: Logged In (Hanya Owner yang memiliki restoran terkait)
* **Request Body**:
  ```json
  {
    "status": "ready" // pending / processing / ready / completed / cancelled
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Order status updated to ready"
  }
  ```

---

## 💳 6. Pembayaran (`/payments`)

### 🔔 POST `/payments/webhook`
Callback endpoint yang dipanggil secara otomatis oleh Midtrans payment gateway untuk mengabarkan status transaksi (IPN).

* **Role Akses**: Publik (Dipanggil oleh server Midtrans)
* **Request Body (Midtrans Payload)**:
  ```json
  {
    "order_id": "order_abc123",
    "transaction_status": "settlement",
    "payment_type": "qris",
    "gross_amount": "58850.00",
    "transaction_id": "midtrans_trx_999"
  }
  ```
* **Response `200 OK`**: `OK`

---

### 🔍 GET `/payments/:order_id`
Mengecek informasi dan status pembayaran suatu transaksi.

* **Role Akses**: Logged In (Customer pembuat, Owner restoran terkait, atau Admin)
* **Response `200 OK`**:
  ```json
  {
    "payment_id": "pay_987",
    "order_id": "order_abc123",
    "gateway_token": "midtrans_trx_999",
    "method": "qris",
    "amount": 58850,
    "status": "success",
    "paid_at": "2026-05-19T13:05:00.000Z"
  }
  ```

---

## 🌟 7. Ulasan & Rating (`/reviews`)

### ✍️ POST `/reviews`
Mengirimkan ulasan berupa rating kepuasan (kategori pelayanan, makanan, fasilitas), komentar teks, dan tag label ulasan setelah order selesai. Memicu kalkulasi ulang rating rata-rata restoran secara otomatis.

* **Role Akses**: Logged In (Hanya Customer pembuat order terkait)
* **Request Body**:
  ```json
  {
    "order_id": "order_abc123",
    "rating_pelayanan": 5,
    "rating_makanan": 4,
    "rating_fasilitas": 5,
    "comment": "Nasi gorengnya enak dan pelayanannya ramah banget!",
    "tag_ids": ["tag_001", "tag_004"] // Optional
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "review_id": "rev_555",
    "message": "Review submitted successfully",
    "rating_avg": 4.67
  }
  ```

---

### 💬 GET `/reviews/:resto_id`
Mengambil semua riwayat ulasan publik yang dimiliki oleh restoran tertentu.

* **Role Akses**: Publik
* **Response `200 OK`**:
  ```json
  [
    {
      "review_id": "rev_555",
      "user_name": "Ani Susanti",
      "rating_pelayanan": 5,
      "rating_makanan": 4,
      "rating_fasilitas": 5,
      "rating_avg": 4.67,
      "comment": "Nasi gorengnya enak dan pelayanannya ramah banget!",
      "created_at": "2026-05-19T13:10:00.000Z"
    }
  ]
  ```

---

## 🏷️ 8. Tag Ulasan (`/review-tags`)

### 📂 GET `/review-tags/categories`
Mengambil seluruh daftar master data kategori tag ulasan.

* **Role Akses**: Publik
* **Response `200 OK`**:
  ```json
  [
    {
      "kategori_id": "kat_001",
      "nama": "pelayanan",
      "icon": "service"
    }
  ]
  ```

---

### 🏷️ GET `/review-tags`
Mengambil daftar tag ulasan master (opsional filter per kategori).

* **Role Akses**: Publik
* **Query Params**:
  * `kategori_id` (string, optional): Filter tag per kategori.
* **Response `200 OK`**:
  ```json
  [
    {
      "tag_id": "tag_001",
      "kategori_id": "kat_001",
      "label": "Pelayanan ramah",
      "icon": "smile"
    }
  ]
  ```

---

### 🆕 POST `/review-tags/categories`
Membuat kategori tag ulasan baru.

* **Role Akses**: Logged In (Admin Only)
* **Request Body**: `{ "nama": "kebersihan", "icon": "clean" }`
* **Response `201 Created`**:
  ```json
  {
    "kategori_id": "kat_005",
    "nama": "kebersihan",
    "icon": "clean"
  }
  ```

---

### 🆕 POST `/review-tags`
Membuat item label tag ulasan baru dalam kategori tertentu.

* **Role Akses**: Logged In (Admin Only)
* **Request Body**:
  ```json
  {
    "kategori_id": "kat_001",
    "label": "Antrian cepat",
    "icon": "fast"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "tag_id": "tag_012",
    "kategori_id": "kat_001",
    "label": "Antrian cepat",
    "icon": "fast"
  }
  ```

---

### ✏️ PUT `/review-tags/:tag_id`
Mengubah data label atau icon tag ulasan.

* **Role Akses**: Logged In (Admin Only)
* **Request Body**: `{ "label": "Pelayanan super ramah" }`
* **Response `200 OK`**: `{ "success": true, "message": "Tag updated successfully" }`

---

### 🗑️ DELETE `/review-tags/:tag_id`
Menghapus tag ulasan master serta referensi relasi junction ulasan terkait di Firestore.

* **Role Akses**: Logged In (Admin Only)
* **Response `200 OK`**: `{ "success": true, "message": "Tag deleted successfully" }`

---

## 🎁 9. Reward & Poin (`/rewards`)

### 🏆 GET `/rewards/me`
Mengecek saldo poin reward aktif dan daftar histori perolehan/pemotongan poin.

* **Role Akses**: Logged In (Customer Only)
* **Response `200 OK`**:
  ```json
  {
    "poin": 50,
    "history": [
      {
        "id": "reward_log_123",
        "order_id": "order_abc123",
        "jumlah_poin": 5,
        "created_at": "2026-05-19T13:00:00.000Z"
      }
    ]
  }
  ```

---

### 🎟️ POST `/rewards/redeem`
Menukarkan poin reward dengan voucher potongan diskon personal. (1 Poin disetarakan dengan potongan harga Rp 100).

* **Role Akses**: Logged In (Customer Only)
* **Request Body**:
  ```json
  {
    "poin": 100
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "message": "Points redeemed successfully",
    "redeemed_points": 100,
    "voucher": {
      "kode": "CM-ABC999",
      "nilai_diskon": 10000,
      "berakhir": "2026-06-18T13:20:00.000Z"
    }
  }
  ```

---

## 🎛️ 10. Admin Dashboard (`/admin`)

### ⏳ GET `/admin/restaurants/pending`
Mendapatkan daftar semua restoran yang statusnya masih `pending` menunggu verifikasi admin.

* **Role Akses**: Logged In (Admin Only)
* **Response `200 OK`**:
  ```json
  [
    {
      "resto_id": "resto_xyz123",
      "owner_id": "owner_001",
      "name": "Sate Madura Asli",
      "lokasi": { "lat": -6.9688, "lng": 110.4188 },
      "jam_buka": "17:00-23:00",
      "url_whatsapp": "62899999999",
      "created_at": "2026-05-19T13:16:00.000Z"
    }
  ]
  ```

---

### 🛡️ PUT `/admin/restaurants/:resto_id/verify`
Menerima (approve) atau menolak (reject) pendaftaran restoran baru.

* **Role Akses**: Logged In (Admin Only)
* **Request Body**:
  ```json
  {
    "action": "approve" // approve / reject
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Restaurant has been approved",
    "status": "aktif"
  }
  ```

---

### 👥 GET `/admin/users`
Mendapatkan seluruh daftar akun pengguna yang terdaftar di platform CariMakan.

* **Role Akses**: Logged In (Admin Only)
* **Response `200 OK`**:
  ```json
  [
    {
      "uid": "customer_001",
      "nama": "Ani Susanti",
      "email": "customer@carimakan.app",
      "role": "customer",
      "poin_reward": 50,
      "status": "aktif",
      "url_whatsapp": "",
      "created_at": "2026-05-19T12:00:00.000Z"
    }
  ]
  ```

---

### ⛔ PUT `/admin/users/:uid/suspend`
Membekukan (suspend) atau mengaktifkan kembali akun pengguna platform.

* **Role Akses**: Logged In (Admin Only)
* **Request Body**:
  ```json
  {
    "suspend": true // true (suspend) / false (aktif)
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "User status changed to suspend",
    "status": "suspend"
  }
  ```

---

### 📈 GET `/admin/stats`
Mendapatkan statistik platform (total transaksi, jumlah user, pelanggan aktif, restoran aktif, total profit global CariMakan, dan 5 restoran terlaris).

* **Role Akses**: Logged In (Admin Only)
* **Response `200 OK`**:
  ```json
  {
    "total_completed_orders": 40,
    "total_users": 3,
    "active_customers": 1,
    "active_restaurants": 1,
    "total_app_profit": 154000,
    "best_selling_restaurants": [
      {
        "resto_id": "resto_001",
        "name": "Warung Pak Budi",
        "total_sales": 2200000
      }
    ]
  }
  ```

---

### 🎫 POST `/admin/promos`
Membuat voucher diskon promo global baru (berlaku untuk semua restoran).

* **Role Akses**: Logged In (Admin Only)
* **Request Body**:
  ```json
  {
    "kode": "DISKONBESAR",
    "nama": "Promo Hari Raya",
    "deskripsi": "Potongan langsung Rp 15.000",
    "nilai_diskon": 15000,
    "is_percent": false,
    "mulai": "2026-05-19T00:00:00.000Z",
    "berakhir": "2026-05-25T00:00:00.000Z"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "promo_id": "promo_new_999",
    "kode": "DISKONBESAR",
    "nama": "Promo Hari Raya",
    "deskripsi": "Potongan langsung Rp 15.000",
    "nilai_diskon": 15000,
    "is_percent": false,
    "mulai": "2026-05-19T00:00:00.000Z",
    "berakhir": "2026-05-25T00:00:00.000Z",
    "is_active": true,
    "is_used": false
  }
  ```

---

## 🖨️ 11. QR Code Meja (`/table-qr`)

### 🖨️ POST `/table-qr/generate`
Mendaftarkan nomor meja makan dan mendapatkan link gambar QR Code statis yang dapat diprint langsung.

* **Role Akses**: Logged In (Owner Only)
* **Request Body**:
  ```json
  {
    "resto_id": "resto_001",
    "table_number": "A1"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "qr_id": "meja_001",
    "table_number": "A1",
    "qr_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=carimakan://resto/resto_001/table/A1"
  }
  ```
