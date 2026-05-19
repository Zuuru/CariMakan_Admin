const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');

// Apply admin role restriction to all /admin routes
router.use(requireAuth, requireRole('admin'));

// GET /admin/restaurants/pending
router.get('/restaurants/pending', async (req, res) => {
  try {
    const pendingSnap = await db.collection('restaurants').where('status', '==', 'pending').get();
    const restaurants = [];
    pendingSnap.forEach(doc => {
      const data = doc.data();
      restaurants.push({
        resto_id: doc.id,
        owner_id: data.owner_id,
        name: data.nama,
        lokasi: data.lokasi ? { lat: data.lokasi.latitude || data.lokasi._latitude, lng: data.lokasi.longitude || data.lokasi._longitude } : null,
        jam_buka: data.jam_buka,
        url_whatsapp: data.url_whatsapp || '',
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      });
    });
    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Error fetching pending restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/restaurants/:resto_id/verify
router.put('/restaurants/:resto_id/verify', async (req, res) => {
  try {
    const { resto_id } = req.params;
    const { action } = req.body; // approve or reject

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (approve or reject) is required' });
    }

    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const newStatus = action === 'approve' ? 'aktif' : 'suspend';

    await db.collection('restaurants').doc(resto_id).update({
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      message: `Restaurant has been ${action === 'approve' ? 'approved' : 'rejected'}`,
      status: newStatus,
    });
  } catch (error) {
    console.error('Error verifying restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const usersSnap = await db.collection('users').get();
    const users = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        nama: data.nama,
        email: data.email,
        role: data.role,
        poin_reward: data.poin_reward || 0,
        status: data.status || 'aktif',
        url_whatsapp: data.url_whatsapp || '',
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      });
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /admin/users/:uid/suspend
router.put('/users/:uid/suspend', async (req, res) => {
  try {
    const { uid } = req.params;
    const { suspend } = req.body; // true or false

    if (suspend === undefined) {
      return res.status(400).json({ error: 'suspend parameter (true or false) is required' });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = suspend ? 'suspend' : 'aktif';

    await db.collection('users').doc(uid).update({
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${newStatus}`,
      status: newStatus,
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [usersSnap, restosSnap, ordersSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('restaurants').get(),
      db.collection('orders').where('status', '==', 'completed').get(),
    ]);

    let activeCustomers = 0;
    usersSnap.forEach(doc => {
      if (doc.data().role === 'customer' && doc.data().status !== 'suspend') {
        activeCustomers++;
      }
    });

    let totalProfit = 0;
    const salesByResto = {};

    ordersSnap.forEach(doc => {
      const data = doc.data();
      totalProfit += data.app_profit || 0;
      
      if (data.resto_id) {
        salesByResto[data.resto_id] = (salesByResto[data.resto_id] || 0) + (data.total_price || 0);
      }
    });

    // Resolve best selling restaurants
    const bestSellingRestos = [];
    const sortedRestos = Object.entries(salesByResto).sort((a, b) => b[1] - a[1]).slice(0, 5);

    for (const [rId, sales] of sortedRestos) {
      const rDoc = await db.collection('restaurants').doc(rId).get();
      bestSellingRestos.push({
        resto_id: rId,
        name: rDoc.exists ? rDoc.data().nama : 'Unknown',
        total_sales: sales,
      });
    }

    res.status(200).json({
      total_completed_orders: ordersSnap.size,
      total_users: usersSnap.size,
      active_customers: activeCustomers,
      active_restaurants: restosSnap.size,
      total_app_profit: totalProfit,
      best_selling_restaurants: bestSellingRestos,
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /admin/promos
router.post('/promos', async (req, res) => {
  try {
    const { kode, nama, deskripsi, nilai_diskon, is_percent, mulai, berakhir } = req.body;

    if (!kode || !nama || nilai_diskon === undefined) {
      return res.status(400).json({ error: 'kode, nama, and nilai_diskon are required' });
    }

    // Check if code already exists
    const codeQuery = await db.collection('promo_vouchers').where('kode', '==', kode).limit(1).get();
    if (!codeQuery.empty) {
      return res.status(409).json({ error: 'Promo code already exists' });
    }

    const promoRef = db.collection('promo_vouchers').doc();
    const newPromo = {
      created_by: req.user.uid,
      resto_id: null, // null = promo global
      user_id: null, // null = public promo
      kode,
      nama,
      deskripsi: deskripsi || '',
      nilai_diskon: parseInt(nilai_diskon),
      is_percent: is_percent !== undefined ? !!is_percent : false,
      mulai: mulai ? admin.firestore.Timestamp.fromDate(new Date(mulai)) : admin.firestore.Timestamp.now(),
      berakhir: berakhir ? admin.firestore.Timestamp.fromDate(new Date(berakhir)) : null,
      is_active: true,
      is_used: false,
    };

    await promoRef.set(newPromo);

    res.status(201).json({
      promo_id: promoRef.id,
      ...newPromo,
      mulai: newPromo.mulai.toDate().toISOString(),
      berakhir: newPromo.berakhir ? newPromo.berakhir.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
