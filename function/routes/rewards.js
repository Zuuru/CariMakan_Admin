const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth } = require('../authMiddleware');

// GET /rewards/me (Customer only)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const poin = userData.poin_reward || 0;

    // Fetch history
    const historySnap = await db.collection('reward_poin')
      .where('user_id', '==', req.user.uid)
      .orderBy('created_at', 'desc')
      .get();

    const history = [];
    historySnap.forEach(doc => {
      const data = doc.data();
      history.push({
        id: doc.id,
        order_id: data.order_id || null,
        jumlah_poin: data.jumlah_poin,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      });
    });

    res.status(200).json({
      poin,
      history,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /rewards/redeem (Customer only)
router.post('/redeem', requireAuth, async (req, res) => {
  try {
    const { poin } = req.body;
    
    if (!poin || parseInt(poin) <= 0) {
      return res.status(400).json({ error: 'Valid points count is required' });
    }

    const pointsToRedeem = parseInt(poin);

    const userRef = db.collection('users').doc(req.user.uid);
    let generatedVoucher = null;

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const currentPoints = userDoc.data().poin_reward || 0;
      if (currentPoints < pointsToRedeem) {
        throw new Error('Insufficient points');
      }

      // Deduct points
      transaction.update(userRef, {
        poin_reward: currentPoints - pointsToRedeem,
      });

      // Log points deduction
      const rewardLogRef = db.collection('reward_poin').doc();
      transaction.set(rewardLogRef, {
        user_id: req.user.uid,
        jumlah_poin: -pointsToRedeem,
        created_at: admin.firestore.Timestamp.now(),
      });

      // Generate voucher: e.g., 100 points = 10,000 IDR discount
      const discountValue = pointsToRedeem * 100; // 1 point = 100 IDR
      const voucherCode = `CM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const promoRef = db.collection('promo_vouchers').doc();
      generatedVoucher = {
        id: promoRef.id,
        created_by: 'system',
        resto_id: null, // global discount
        user_id: req.user.uid, // specific user
        kode: voucherCode,
        nama: `Redeem Voucher ${discountValue} IDR`,
        deskripsi: `Voucher diskon hasil redeem ${pointsToRedeem} poin`,
        nilai_diskon: discountValue,
        is_percent: false,
        mulai: admin.firestore.Timestamp.now(),
        berakhir: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
        is_active: true,
        is_used: false,
      };

      transaction.set(promoRef, generatedVoucher);
    });

    res.status(200).json({
      message: 'Points redeemed successfully',
      redeemed_points: pointsToRedeem,
      voucher: {
        kode: generatedVoucher.kode,
        nilai_diskon: generatedVoucher.nilai_diskon,
        berakhir: generatedVoucher.berakhir.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error redeeming rewards:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
