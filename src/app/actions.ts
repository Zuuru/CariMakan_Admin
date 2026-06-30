'use server';

import { adminDb, admin } from '@/lib/firebaseAdmin';

export async function verifyAdminLogin(email: string, password: string) {
  try {
    const snapshot = await adminDb.collection('users')
      .where('email', '==', email)
      .where('role', '==', 'admin')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { success: false, error: 'Email admin tidak ditemukan atau role bukan admin.' };
    }

    const adminUser = snapshot.docs[0].data();
    if (adminUser.password !== password) {
      return { success: false, error: 'Password salah.' };
    }

    if (adminUser.status === 'suspend') {
      return { success: false, error: 'Akun admin ini telah di-suspend.' };
    }

    return {
      success: true,
      data: {
        uid: snapshot.docs[0].id,
        nama: adminUser.nama,
        email: adminUser.email,
        role: adminUser.role,
      }
    };
  } catch (error: any) {
    console.error('Error verifying admin login:', error);
    return { success: false, error: error.message };
  }
}

// Helper: convert semua Firestore Timestamp di sebuah object menjadi plain value
function serializeFirestoreDoc(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      // Firestore Timestamp
      result[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && '_seconds' in value && '_nanoseconds' in value) {
      // Plain object bentuk Timestamp (sudah di-destructure sebelumnya)
      result[key] = new Date(value._seconds * 1000).toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function fetchUsers() {
  try {
    const snapshot = await adminDb.collection('users').get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeFirestoreDoc(data),
      };
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
}


export async function createUser(data: any) {
  try {
    // 1. Buat akun Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.nama,
    });

    // 2. Simpan profil user di Firestore dengan UID dari Firebase Auth sebagai ID dokumen
    const { password, ...firestoreData } = data;
    await adminDb.collection('users').doc(userRecord.uid).set({
      ...firestoreData,
      password: password, // simpan juga password plaintext agar admin bisa lihat
      created_at: new Date(),
    });

    return { success: true, id: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    // 1. Sinkronisasi data ke Firebase Authentication
    const authUpdate: admin.auth.UpdateRequest = {};
    if (data.email) authUpdate.email = data.email;
    if (data.password) authUpdate.password = data.password;
    if (data.nama) authUpdate.displayName = data.nama;

    if (Object.keys(authUpdate).length > 0) {
      try {
        await admin.auth().updateUser(id, authUpdate);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          // User lama yang belum punya akun Firebase Auth — buat sekarang
          const firestoreDoc = await adminDb.collection('users').doc(id).get();
          const existing = firestoreDoc.data() || {};
          await admin.auth().createUser({
            uid: id,
            email: data.email || existing.email,
            password: data.password || existing.password,
            displayName: data.nama || existing.nama,
          });
        } else {
          throw authError;
        }
      }
    }

    // 2. Update data di Firestore
    await adminDb.collection('users').doc(id).update(data);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  try {
    // 1. Hapus dari Firebase Authentication (abaikan jika tidak ada)
    try {
      await admin.auth().deleteUser(id);
    } catch (authError: any) {
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
    }

    // 2. Hapus dokumen dari Firestore
    await adminDb.collection('users').doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchRestaurants() {
  try {
    const restosSnap = await adminDb.collection('restaurants').get();
    const usersSnap = await adminDb.collection('users').get();

    const usersMap: Record<string, any> = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data();
    });

    const restaurants = restosSnap.docs.map(doc => {
      const data = doc.data();
      const owner = usersMap[data.owner_id] || {};
      let plainLokasi = null;
      if (data.lokasi) {
        plainLokasi = {
          _latitude: data.lokasi.latitude || data.lokasi._latitude,
          _longitude: data.lokasi.longitude || data.lokasi._longitude,
        };
      }
      return {
        id: doc.id,
        ...data,
        status: data.status ? data.status.trim() : 'pending',
        lokasi: plainLokasi,
        ownerName: owner.nama || 'Unknown Owner',
        ownerEmail: owner.email || '-',
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      };
    });
    return { success: true, data: restaurants };
  } catch (error: any) {
    console.error('Error fetching restaurants:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchRestoDetail(restoId: string) {
  try {
    const [restoSnap, menusSnap, ordersSnap, restoBadgesSnap, badgesSnap, usersSnap] = await Promise.all([
      adminDb.collection('restaurants').doc(restoId).get(),
      adminDb.collection('menus').where('resto_id', '==', restoId).get(),
      adminDb.collection('orders').where('resto_id', '==', restoId).where('status', '==', 'completed').get(),
      adminDb.collection('resto_badges').where('resto_id', '==', restoId).get(),
      adminDb.collection('badges').get(),
      adminDb.collection('users').get(),
    ]);

    if (!restoSnap.exists) return { success: false, error: 'Restoran tidak ditemukan.' };

    const restoData = restoSnap.data()!;
    const usersMap: Record<string, any> = {};
    usersSnap.forEach(d => { usersMap[d.id] = d.data(); });
    const badgesMap: Record<string, any> = {};
    badgesSnap.forEach(d => { badgesMap[d.id] = d.data(); });

    // Build badges list
    const badges = restoBadgesSnap.docs.map(d => {
      const b = badgesMap[d.data().badge_id] || {};
      return { id: d.data().badge_id, nama: b.nama || '-', icon: b.icon || '' };
    });

    // Process menus
    const menus = menusSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // Process orders + aggregate profits per day
    const profitByDay: Record<string, number> = {};
    let totalProfit = 0;
    let totalRevenue = 0;
    let totalOrders = 0;
    const orderList: any[] = [];

    ordersSnap.forEach(d => {
      const o = d.data();
      const orderDate = o.created_at ? o.created_at.toDate() : new Date();
      const dayKey = orderDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const profit = o.app_profit || (o.total_price ? o.total_price * 0.07 : 0);

      if (!profitByDay[dayKey]) profitByDay[dayKey] = 0;
      profitByDay[dayKey] += profit;
      totalProfit += profit;
      totalRevenue += o.total_price || 0;
      totalOrders++;

      const customer = usersMap[o.user_id] || {};
      orderList.push({
        id: d.id,
        customerName: customer.nama || 'Pelanggan',
        tipe: o.tipe_pesanan,
        total_price: o.total_price,
        app_profit: profit,
        created_at: orderDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
    });

    // Sort and get last 14 unique days for mini chart
    const sortedDays = Object.entries(profitByDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14);

    // Gather review tag counts
    const orderIds = ordersSnap.docs.map(d => d.id);
    let reviewTagsCount: Record<string, number> = {};
    if (orderIds.length > 0) {
      // Firestore 'in' queries support up to 30 items
      const chunks = [];
      for (let i = 0; i < orderIds.length; i += 30) chunks.push(orderIds.slice(i, i + 30));

      for (const chunk of chunks) {
        const tagSnap = await adminDb.collection('order_review_tags').where('order_id', 'in', chunk).get();
        tagSnap.forEach(d => {
          const tagId = d.data().tag_id;
          reviewTagsCount[tagId] = (reviewTagsCount[tagId] || 0) + 1;
        });
      }
    }

    // Build review tag details
    const reviewTags = Object.entries(reviewTagsCount).map(([tagId, count]) => {
      const allTagsSnap = badgesMap; // reuse the fetched data
      return { tagId, count };
    });

    const formatCurrency = (val: number) => {
      if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(2).replace(/\.00$/, '')} Jt`;
      if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
      return `Rp ${val}`;
    };

    const owner = usersMap[restoData.owner_id] || {};
    let plainLokasi = null;
    if (restoData.lokasi) {
      plainLokasi = {
        lat: restoData.lokasi.latitude || restoData.lokasi._latitude || 0,
        lng: restoData.lokasi.longitude || restoData.lokasi._longitude || 0,
      };
    }

    return {
      success: true,
      data: {
        id: restoId,
        nama: restoData.nama || '-',
        status: restoData.status ? restoData.status.trim() : 'pending',
        jam_buka: restoData.jam_buka || '-',
        url_whatsapp: restoData.url_whatsapp || '-',
        avg_rating: restoData.avg_rating || 0,
        total_review: restoData.total_review || 0,
        created_at: restoData.created_at ? restoData.created_at.toDate().toLocaleDateString('id-ID') : '-',
        lokasi: plainLokasi,
        foto_uri: restoData.foto_uri || null,
        owner: { id: restoData.owner_id, nama: owner.nama || '-', email: owner.email || '-', url_whatsapp: owner.url_whatsapp || '-' },
        badges,
        menus,
        totalOrders,
        totalRevenue,
        totalProfit,
        totalProfitFormatted: formatCurrency(totalProfit),
        totalRevenueFormatted: formatCurrency(totalRevenue),
        profitChartData: sortedDays.map(([day, profit]) => ({ day, profit })),
        recentOrders: orderList.slice(0, 10),
        reviewTagCounts: reviewTagsCount,
      }
    };
  } catch (error: any) {
    console.error('Error fetching resto detail:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchPromos() {
  try {
    const snapshot = await adminDb.collection('promo_vouchers').get();
    const promos = snapshot.docs.map(doc => {
      const data = serializeFirestoreDoc(doc.data());
      return {
        id: doc.id,
        ...data,
      };
    });
    return { success: true, data: promos };
  } catch (error: any) {
    console.error('Error fetching promos:', error);
    return { success: false, error: error.message };
  }
}

// Function to fetch metrics for dashboard
export async function fetchDashboardMetrics() {
  try {
    const SUKSES_STATUS = new Set(['completed', 'paid', 'success', 'settlement']);

    const [usersSnap, restosSnap, ordersSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('restaurants').get(),
      adminDb.collection('orders').get(), // ambil semua, filter manual
    ]);

    let customersCount = 0;
    usersSnap.forEach(doc => {
      if (doc.data().role === 'customer') customersCount++;
    });

    let totalProfit = 0;
    ordersSnap.forEach(doc => {
      const data = doc.data();
      const status = (data.status || '').toLowerCase();
      if (!SUKSES_STATUS.has(status)) return; // skip order non-sukses

      const amount = data.totalPrice || data.total_price || 0;
      if (data.app_profit) {
        totalProfit += data.app_profit;
      } else if (amount) {
        totalProfit += amount * 0.10;
      }
    });

    const formatCurrency = (val: number) => {
      if (val >= 1000000) return `Rp. ${(val / 1000000).toFixed(2).replace(/\.00$/, '')} Jt`;
      if (val >= 1000) return `Rp. ${(val / 1000).toFixed(1).replace(/\.0$/, '')} Rb`;
      return `Rp. ${val}`;
    };

    return {
      success: true,
      data: {
        totalRestaurants: restosSnap.size,
        totalCustomers: customersCount,
        totalUsers: usersSnap.size,
        totalProfitFormatted: formatCurrency(totalProfit),
        rawProfit: totalProfit,
      }
    };
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchRestoProfits() {
  try {
    const SUKSES_STATUS = new Set(['completed', 'paid', 'success', 'settlement']);

    const [restosSnap, ordersSnap] = await Promise.all([
      adminDb.collection('restaurants').get(),
      adminDb.collection('orders').get(), // ambil semua, filter manual
    ]);

    const restosMap: Record<string, any> = {};
    restosSnap.forEach(doc => {
      restosMap[doc.id] = doc.data();
    });

    const profitPerResto: Record<string, number> = {};

    ordersSnap.forEach(doc => {
      const data = doc.data();
      const status = (data.status || '').toLowerCase();
      if (!SUKSES_STATUS.has(status)) return; // skip order non-sukses

      const rId = data.resto_id;
      if (!rId) return;

      let profit = 0;
      const amount = data.totalPrice || data.total_price || 0;
      if (data.app_profit) {
        profit = data.app_profit;
      } else if (amount) {
        profit = amount * 0.10;
      }

      if (!profitPerResto[rId]) profitPerResto[rId] = 0;
      profitPerResto[rId] += profit;
    });

    const formatCurrency = (val: number) => {
      if (val >= 1000000) return `Rp. ${(val / 1000000).toFixed(2).replace(/\.00$/, '')} Jt`;
      if (val >= 1000) return `Rp. ${(val / 1000).toFixed(1).replace(/\.0$/, '')} Rb`;
      return `Rp. ${val}`;
    };

    const data = Object.keys(profitPerResto).map(rId => {
      const restoData = restosMap[rId] || {};
      return {
        id: rId,
        name: restoData.nama || 'Unknown',
        genre: 'Tempat Makan', // Using a default since genre isn't in DB right now
        date: new Date().toLocaleDateString('id-ID'),
        profit: formatCurrency(profitPerResto[rId]),
        rawProfit: profitPerResto[rId],
      };
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching resto profits:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchChartData(filter: string) {
  try {
    // Ambil SEMUA order, lalu filter status sukses secara manual
    // karena Flutter app memakai status: 'paid' | 'success' | 'settlement' | 'completed'
    const ordersSnap = await adminDb.collection('orders').get();

    const SUKSES_STATUS = new Set(['completed', 'paid', 'success', 'settlement']);

    const now = new Date();

    // Determine the time boundary based on filter
    let timeBoundary = new Date();
    let numBuckets = 0;

    if (filter === '1h') {
      timeBoundary.setHours(now.getHours() - 24);
      numBuckets = 8; // Bucket every 3 hours
    } else if (filter === '7h') {
      timeBoundary.setDate(now.getDate() - 7);
      numBuckets = 7; // Bucket every 1 day
    } else if (filter === '30h') {
      timeBoundary.setDate(now.getDate() - 30);
      numBuckets = 10; // Bucket every 3 days
    } else if (filter === '3b') {
      timeBoundary.setMonth(now.getMonth() - 3);
      numBuckets = 12; // Bucket every week roughly
    } else if (filter === '1th') {
      timeBoundary.setFullYear(now.getFullYear() - 1);
      numBuckets = 12; // Bucket every month
    } else {
      timeBoundary.setDate(now.getDate() - 7);
      numBuckets = 7;
    }

    let currentTotal = 0;
    const profitBuckets = new Array(numBuckets).fill(0);
    const expenseBuckets = new Array(numBuckets).fill(0);

    const intervalMs = (now.getTime() - timeBoundary.getTime()) / numBuckets;

    ordersSnap.forEach(doc => {
      const data = doc.data();

      // Filter hanya status sukses
      const status = (data.status || '').toLowerCase();
      if (!SUKSES_STATUS.has(status)) return;

      const dateField = data.created_at || data.orderDate;
      if (!dateField) return;

      const orderDate = dateField.toDate();
      if (orderDate >= timeBoundary) {
        let profit = 0;
        const amount = data.totalPrice || data.total_price || 0;
        if (data.app_profit) {
          profit = data.app_profit;
        } else if (amount) {
          profit = amount * 0.10;
        }

        currentTotal += profit;

        const diffMs = orderDate.getTime() - timeBoundary.getTime();
        let bucketIdx = Math.floor(diffMs / intervalMs);
        if (bucketIdx >= numBuckets) bucketIdx = numBuckets - 1;
        if (bucketIdx < 0) bucketIdx = 0;

        profitBuckets[bucketIdx] += profit;
        expenseBuckets[bucketIdx] += (amount - profit); // Biaya = pendapatan resto
      }
    });

    const growth = currentTotal * 0.15;

    return {
      success: true,
      data: {
        currentTotal,
        growth,
        profitData: profitBuckets,
        expenseData: expenseBuckets,
      }
    };
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    return { success: false, error: error.message };
  }
}

export async function updateRestaurantStatus(id: string, status: 'aktif' | 'suspend' | 'pending' | 'rejected') {
  try {
    const restoDoc = await adminDb.collection('restaurants').doc(id).get();
    if (!restoDoc.exists) {
      return { success: false, error: 'Restaurant tidak ditemukan.' };
    }

    const restoData = restoDoc.data();
    const ownerId = restoData?.owner_id;

    await adminDb.collection('restaurants').doc(id).update({ status });

    // If the restaurant is approved or unsuspended, restore owner role
    if (status === 'aktif' && ownerId) {
      await adminDb.collection('users').doc(ownerId).update({ role: 'owner' });
    } else if (status === 'rejected' && ownerId) {
      // Only rejected permanently removes owner role
      await adminDb.collection('users').doc(ownerId).update({ role: 'customer' });
    }
    // Note: 'suspend' only hides the restaurant from mobile app, does NOT change owner role

    return { success: true };
  } catch (error: any) {
    console.error('Error updating restaurant status:', error);
    return { success: false, error: error.message };
  }
}

export async function createPromo(data: any) {
  try {
    const docRef = await adminDb.collection('promo_vouchers').add({
      kode: data.kode || '',
      nama: data.nama,
      deskripsi: data.deskripsi,
      nilai_diskon: Number(data.nilai_diskon),
      is_percent: data.is_percent,
      mulai: new Date(data.mulai),
      berakhir: new Date(data.berakhir),
      is_active: data.is_active !== undefined ? data.is_active : true,
      resto_id: data.resto_id || null,
      image_url: data.foto_uri || data.image_url || null,
      maks_potongan: data.maks_potongan ? Number(data.maks_potongan) : null,
      min_belanja: data.min_belanja ? Number(data.min_belanja) : 0,
      min_item: data.min_item ? Number(data.min_item) : 0,
      created_at: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating promo:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePromo(id: string, data: any) {
  try {
    const updateData = { ...data };
    if (data.mulai) updateData.mulai = new Date(data.mulai);
    if (data.berakhir) updateData.berakhir = new Date(data.berakhir);
    // Normalize foto_uri → image_url agar konsisten dengan field yang dibaca Flutter
    if ('foto_uri' in updateData) {
      updateData.image_url = updateData.foto_uri || null;
      delete updateData.foto_uri;
    }
    await adminDb.collection('promo_vouchers').doc(id).update(updateData);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating promo:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePromo(id: string) {
  try {
    await adminDb.collection('promo_vouchers').doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting promo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Kirim push notification promo ke semua customer di mobile.
 * Menulis ke koleksi `notifications` dengan userId: 'all',
 * sehingga NotificationService di Flutter akan menangkapnya dan
 * menampilkan local notification ke semua user yang sedang online.
 */
export async function sendPromoNotification({
  title,
  body,
  promoId,
  kode,
}: {
  title: string;
  body: string;
  promoId?: string;
  kode?: string;
}) {
  try {
    const notificationRef = adminDb.collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      userId: 'all',
      title,
      body,
      type: 'promo',
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: {
        ...(promoId && { promoId }),
        ...(kode && { kode }),
      },
    });

    // Ambil FCM tokens dari semua customer
    const usersSnap = await adminDb.collection('users')
      .where('role', '==', 'customer')
      .get();
      
    const tokens: string[] = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      if (data.fcm_token) {
        tokens.push(data.fcm_token);
      }
    });

    if (tokens.length > 0) {
      // Firebase sendEachForMulticast membatasi 500 token sekali kirim
      // Tapi untuk case ini asumsikan < 500 token, jika banyak, batch sendiri.
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          type: 'promo',
          promoId: promoId || '',
          kode: kode || '',
        },
        tokens: tokens.slice(0, 500), // Batas aman Firebase SDK
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent message: ${response.successCount} messages were sent successfully`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending promo notification:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// Integrasi Midtrans API Dinamis
// ==========================================
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

export async function fetchFinanceStats() {
  try {
    const ordersSnap = await adminDb.collection('orders').orderBy('orderDate', 'desc').get();
    
    const usersSnap = await adminDb.collection('users').get();
    const restosSnap = await adminDb.collection('restaurants').get();

    const usersMap: Record<string, any> = {};
    usersSnap.forEach(d => usersMap[d.id] = d.data());

    const restosMap: Record<string, any> = {};
    restosSnap.forEach(d => restosMap[d.id] = d.data());

    let totalVolume = 0;
    let totalOrders = 0;
    let successOrders = 0;
    
    // For foods
    const foodAggregator: Record<string, { name: string, resto: string, count: number, revenue: number }> = {};
    
    // For payment methods
    let gopay = 0, qris = 0, ovo = 0, bank = 0, shopeepay = 0, totalPaymentCount = 0;

    const txsList: any[] = [];

    const formatCurrency = (val: number) => {
      if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
      if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
      return `Rp ${val.toLocaleString('id-ID')}`;
    };

    // Iterate through all orders
    for (let i = 0; i < ordersSnap.docs.length; i++) {
      const doc = ordersSnap.docs[i];
      const data = doc.data();

      const amount = data.totalPrice || data.total_price || 0;
      let status = data.status || 'pending';
      let method = (data.paymentMethod || data.payment_method || 'QRIS').toUpperCase();
      const dateObj = data.orderDate ? data.orderDate.toDate() : (data.created_at ? data.created_at.toDate() : new Date());

      totalOrders++;
      if (status === 'success' || status === 'paid' || status === 'settlement' || status === 'completed') {
        successOrders++;
        totalVolume += amount;
      }

      // Aggregate payment methods
      totalPaymentCount++;
      if (method.includes('GOPAY')) gopay++;
      else if (method.includes('QRIS')) qris++;
      else if (method.includes('OVO')) ovo++;
      else if (method.includes('SHOPEEPAY') || method.includes('SHOPEE')) shopeepay++;
      else bank++;

      // Aggregate foods
      const restoId = data.resto_id;
      const restoName = restosMap[restoId]?.nama || 'Restoran';
      const items = data.items || [];
      items.forEach((item: any) => {
        const menuName = item.menuName || item.nama_menu || 'Menu';
        const qty = item.quantity || item.qty || 1;
        const price = item.unitTotalPrice || item.totalPrice || item.basePrice || 0;
        
        const key = `${restoId}_${menuName}`;
        if (!foodAggregator[key]) {
          foodAggregator[key] = { name: menuName, resto: restoName, count: 0, revenue: 0 };
        }
        foodAggregator[key].count += qty;
        foodAggregator[key].revenue += price * qty; // if price is unit price, or just price if it's already total
      });

      // Build Transaction list (only top 50 for UI performance)
      if (txsList.length < 50) {
        const customerName = data.userName || (usersMap[data.userId]?.nama || usersMap[data.user_id]?.nama) || 'Pelanggan';
        txsList.push({
          id: doc.id,
          orderId: data.id || doc.id,
          customerName: customerName,
          restoName: restoName,
          amount: amount,
          method: method.substring(0, 10),
          status: (status === 'paid' || status === 'completed' || status === 'success') ? 'success' : (status === 'cancelled' || status === 'failed' ? 'failed' : 'pending'),
          date: dateObj.toLocaleString('id-ID'),
        });
      }
    }

    // Sinkronisasi status riil ke Midtrans API untuk 50 transaksi terbaru
    await Promise.all(txsList.map(async (tx) => {
      try {
        const midtransRes = await fetch(`https://api.sandbox.midtrans.com/v2/${tx.id}/status`, {
          headers: {
            'Authorization': `Basic ${encodedServerKey}`,
            'Accept': 'application/json'
          }
        });
        if (midtransRes.ok) {
          const mData = await midtransRes.json();
          if (mData.transaction_status === 'settlement' || mData.transaction_status === 'capture') {
             tx.status = 'success';
          } else if (mData.transaction_status === 'pending') {
             tx.status = 'pending';
          } else if (mData.transaction_status === 'cancel' || mData.transaction_status === 'expire' || mData.transaction_status === 'deny') {
             tx.status = 'failed';
          }
          if (mData.payment_type) {
             const pt = mData.payment_type.toUpperCase();
             if (pt.includes('GOPAY')) tx.method = 'GOPAY';
             else if (pt.includes('QRIS')) tx.method = 'QRIS';
             else if (pt.includes('SHOPEEPAY')) tx.method = 'SHOPEEPAY';
             else if (pt.includes('BANK') || pt.includes('TRANSFER')) tx.method = 'BANK';
             else tx.method = pt.substring(0, 10);
          }
        }
      } catch (e) {
        // Abaikan error midtrans, gunakan status firestore
      }
    }));

    // Prepare Return Data
    const popularFoods = Object.values(foodAggregator)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(f => ({
        name: f.name,
        resto: f.resto,
        ordersCount: f.count,
        revenue: formatCurrency(f.revenue)
      }));

    return {
      success: true,
      data: {
        txs: txsList,
        volumeTransaksi: totalVolume,
        successRate: totalOrders > 0 ? ((successOrders / totalOrders) * 100).toFixed(1) : '0.0',
        rataRataKeranjang: successOrders > 0 ? (totalVolume / successOrders) : 0,
        popularFoods: popularFoods,
        paymentRatios: {
          gopay: totalPaymentCount > 0 ? Math.round((gopay / totalPaymentCount) * 100) : 0,
          qris: totalPaymentCount > 0 ? Math.round((qris / totalPaymentCount) * 100) : 0,
          ovo: totalPaymentCount > 0 ? Math.round(((ovo + shopeepay) / totalPaymentCount) * 100) : 0,
          bank: totalPaymentCount > 0 ? Math.round((bank / totalPaymentCount) * 100) : 0,
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching finance stats:', error);
    return { success: false, error: error.message };
  }
}


