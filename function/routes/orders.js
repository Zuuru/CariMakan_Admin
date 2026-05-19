const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');
const midtransClient = require('midtrans-client');

// Initialize Midtrans Snap client
let snap;
try {
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-mock-key-12345',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-mock-key-12345'
  });
} catch (err) {
  console.warn('Midtrans Snap Client initialization failed. Mock mode will be used.', err.message);
}

// POST /orders (Customer only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { resto_id, queue_id, type, items, pickup_time, promo_code } = req.body;

    if (!resto_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'resto_id and non-empty items array are required' });
    }

    const orderType = type || 'take_away';
    if (!['dine_in', 'take_away'].includes(orderType)) {
      return res.status(400).json({ error: 'Invalid order type' });
    }

    // Verify restaurant exists
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Fetch menus to calculate prices
    let basePrice = 0;
    const itemsWithPrices = [];

    for (const item of items) {
      const menuDoc = await db.collection('menus').doc(item.menu_id).get();
      if (!menuDoc.exists || menuDoc.data().resto_id !== resto_id) {
        return res.status(400).json({ error: `Menu item ${item.menu_id} not found in this restaurant` });
      }
      
      const menuData = menuDoc.data();
      const itemTotal = menuData.harga * item.qty;
      basePrice += itemTotal;

      itemsWithPrices.push({
        menu_id: item.menu_id,
        nama: menuData.nama,
        qty: item.qty,
        harga_saat_order: menuData.harga,
        catatan: item.catatan || '',
      });
    }

    // Apply Promo Code if provided
    let discount = 0;
    if (promo_code) {
      const promoQuery = await db.collection('promo_vouchers')
        .where('kode', '==', promo_code)
        .where('is_active', '==', true)
        .limit(1)
        .get();

      if (!promoQuery.empty) {
        const promo = promoQuery.docs[0].data();
        const now = new Date();
        const start = promo.mulai ? promo.mulai.toDate() : null;
        const end = promo.berakhir ? promo.berakhir.toDate() : null;

        if ((!start || now >= start) && (!end || now <= end)) {
          if (promo.is_percent) {
            discount = Math.floor(basePrice * (promo.nilai_diskon / 100));
          } else {
            discount = promo.nilai_diskon;
          }
        }
      }
    }

    const discountedBasePrice = Math.max(0, basePrice - discount);
    
    // Platform Fee 7%
    const app_profit = Math.floor(discountedBasePrice * 0.07);
    const total_price = discountedBasePrice + app_profit;

    // Create Order Document
    const orderRef = db.collection('orders').doc();
    const newOrder = {
      user_id: req.user.uid,
      resto_id,
      queue_id: queue_id || null,
      tipe_pesanan: orderType,
      status: 'pending',
      total_price,
      app_profit,
      created_at: admin.firestore.Timestamp.now(),
      pickup_time: pickup_time ? admin.firestore.Timestamp.fromDate(new Date(pickup_time)) : null,
    };

    await orderRef.set(newOrder);

    // Save order items in batch
    const batch = db.batch();
    itemsWithPrices.forEach(item => {
      const itemRef = db.collection('order_items').doc();
      batch.set(itemRef, {
        order_id: orderRef.id,
        menu_id: item.menu_id,
        qty: item.qty,
        harga_saat_order: item.harga_saat_order,
        catatan: item.catatan,
      });
    });
    await batch.commit();

    // Fetch user details for Midtrans
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : { nama: 'Customer', email: 'customer@email.com' };

    // Request Midtrans Payment URL
    let payment_url = '';
    const midtransParams = {
      transaction_details: {
        order_id: orderRef.id,
        gross_amount: total_price,
      },
      customer_details: {
        first_name: userData.nama,
        email: userData.email,
      },
    };

    try {
      if (snap && process.env.MIDTRANS_SERVER_KEY && !process.env.MIDTRANS_SERVER_KEY.includes('mock-key')) {
        const transaction = await snap.createTransaction(midtransParams);
        payment_url = transaction.redirect_url;
      } else {
        payment_url = `https://checkout.sandbox.midtrans.com/v1/payment-links/mock-${orderRef.id}`;
      }
    } catch (midtransError) {
      console.warn('Midtrans creation failed, falling back to mock link:', midtransError.message);
      payment_url = `https://checkout.sandbox.midtrans.com/v1/payment-links/mock-${orderRef.id}`;
    }

    // Save payment reference
    await db.collection('payments').doc().set({
      order_id: orderRef.id,
      gateway_token: `tok_${orderRef.id}`,
      method: 'pending',
      amount: total_price,
      status: 'pending',
      paid_at: null,
    });

    res.status(201).json({
      order_id: orderRef.id,
      total_price,
      status: 'pending',
      payment_url,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /orders/history (Customer only)
router.get('/history', requireAuth, async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders')
      .where('user_id', '==', req.user.uid)
      .orderBy('created_at', 'desc')
      .get();

    const orders = [];
    for (const doc of ordersSnap.docs) {
      const data = doc.data();
      
      // Fetch restaurant name
      const restoDoc = await db.collection('restaurants').doc(data.resto_id).get();
      const restoName = restoDoc.exists ? restoDoc.data().nama : 'Restoran';

      orders.push({
        order_id: doc.id,
        resto_id: data.resto_id,
        resto_name: restoName,
        tipe_pesanan: data.tipe_pesanan,
        status: data.status,
        total_price: data.total_price,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /orders/:order_id
router.get('/:order_id', requireAuth, async (req, res) => {
  try {
    const { order_id } = req.params;
    const orderDoc = await db.collection('orders').doc(order_id).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Verify user owns order or is owner of restaurant
    if (orderData.user_id !== req.user.uid && req.user.role !== 'owner' && req.user.role !== 'admin') {
      // Check if current user is owner of the restaurant
      const restoDoc = await db.collection('restaurants').doc(orderData.resto_id).get();
      if (!restoDoc.exists || restoDoc.data().owner_id !== req.user.uid) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this order' });
      }
    }

    // Fetch order items
    const itemsSnap = await db.collection('order_items').where('order_id', '==', order_id).get();
    
    const items = [];
    for (const doc of itemsSnap.docs) {
      const data = doc.data();
      const menuDoc = await db.collection('menus').doc(data.menu_id).get();
      const menuName = menuDoc.exists ? menuDoc.data().nama : 'Menu Item';

      items.push({
        menu_id: data.menu_id,
        name: menuName,
        qty: data.qty,
        harga_saat_order: data.harga_saat_order,
        catatan: data.catatan || '',
      });
    }

    // Fetch restaurant name
    const restoDoc = await db.collection('restaurants').doc(orderData.resto_id).get();
    const restoName = restoDoc.exists ? restoDoc.data().nama : 'Restoran';

    res.status(200).json({
      order_id,
      resto_id: orderData.resto_id,
      resto_name: restoName,
      user_id: orderData.user_id,
      queue_id: orderData.queue_id,
      tipe_pesanan: orderData.tipe_pesanan,
      status: orderData.status,
      total_price: orderData.total_price,
      app_profit: orderData.app_profit,
      created_at: orderData.created_at ? orderData.created_at.toDate().toISOString() : null,
      pickup_time: orderData.pickup_time ? orderData.pickup_time.toDate().toISOString() : null,
      items,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /orders/:order_id/status (Owner only)
router.put('/:order_id/status', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const orderDoc = await db.collection('orders').doc(order_id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify restaurant owner
    const restoDoc = await db.collection('restaurants').doc(orderDoc.data().resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    await db.collection('orders').doc(order_id).update({ status });

    // logic for points reward on completion
    if (status === 'completed') {
      const orderData = orderDoc.data();
      const userRef = db.collection('users').doc(orderData.user_id);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        const currentPoints = userDoc.data().poin_reward || 0;
        // Earn 1 point per 10,000 IDR spent
        const earnedPoints = Math.floor(orderData.total_price / 10000);
        
        if (earnedPoints > 0) {
          await userRef.update({
            poin_reward: currentPoints + earnedPoints,
          });

          // Log points history
          await db.collection('reward_poin').doc().set({
            user_id: orderData.user_id,
            order_id,
            jumlah_poin: earnedPoints,
            created_at: admin.firestore.Timestamp.now(),
          });
        }
      }
    }

    res.status(200).json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
