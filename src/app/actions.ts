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
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        mulai: data.mulai ? data.mulai.toDate().toISOString() : null,
        berakhir: data.berakhir ? data.berakhir.toDate().toISOString() : null,
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
    const [usersSnap, restosSnap, ordersSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('restaurants').get(),
      adminDb.collection('orders').where('status', '==', 'completed').get(),
    ]);

    let customersCount = 0;
    usersSnap.forEach(doc => {
      if (doc.data().role === 'customer') customersCount++;
    });

    let totalProfit = 0;
    ordersSnap.forEach(doc => {
      const data = doc.data();
      // Assume app_profit field exists, else fallback to 7% of total_price
      if (data.app_profit) {
        totalProfit += data.app_profit;
      } else if (data.total_price) {
        totalProfit += data.total_price * 0.07;
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
    const [restosSnap, ordersSnap] = await Promise.all([
      adminDb.collection('restaurants').get(),
      adminDb.collection('orders').where('status', '==', 'completed').get(),
    ]);

    const restosMap: Record<string, any> = {};
    restosSnap.forEach(doc => {
      restosMap[doc.id] = doc.data();
    });

    const profitPerResto: Record<string, number> = {};

    ordersSnap.forEach(doc => {
      const data = doc.data();
      const rId = data.resto_id;
      if (!rId) return;

      let profit = 0;
      if (data.app_profit) {
        profit = data.app_profit;
      } else if (data.total_price) {
        profit = data.total_price * 0.07;
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
    const ordersSnap = await adminDb.collection('orders').where('status', '==', 'completed').get();

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
      if (!data.created_at) return;

      const orderDate = data.created_at.toDate();
      if (orderDate >= timeBoundary) {
        let profit = 0;
        if (data.app_profit) {
          profit = data.app_profit;
        } else if (data.total_price) {
          profit = data.total_price * 0.07;
        }

        currentTotal += profit;

        const diffMs = orderDate.getTime() - timeBoundary.getTime();
        let bucketIdx = Math.floor(diffMs / intervalMs);
        if (bucketIdx >= numBuckets) bucketIdx = numBuckets - 1;
        if (bucketIdx < 0) bucketIdx = 0;

        profitBuckets[bucketIdx] += profit;
        expenseBuckets[bucketIdx] += profit * (0.5 + Math.random() * 0.3); // Mock expense
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

    // If the restaurant is approved, set the user's role to owner
    if (status === 'aktif' && ownerId) {
      await adminDb.collection('users').doc(ownerId).update({ role: 'owner' });
    } else if ((status === 'rejected' || status === 'suspend') && ownerId) {
      await adminDb.collection('users').doc(ownerId).update({ role: 'customer' });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating restaurant status:', error);
    return { success: false, error: error.message };
  }
}

export async function createPromo(data: any) {
  try {
    const docRef = await adminDb.collection('promo_vouchers').add({
      kode: data.kode,
      nama: data.nama,
      deskripsi: data.deskripsi,
      nilai_diskon: Number(data.nilai_diskon),
      is_percent: data.is_percent,
      mulai: new Date(data.mulai),
      berakhir: new Date(data.berakhir),
      is_active: data.is_active !== undefined ? data.is_active : true,
      resto_id: data.resto_id || null,
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
