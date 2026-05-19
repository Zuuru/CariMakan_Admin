const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth } = require('../authMiddleware');

// POST /reviews (Customer only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { order_id, rating_pelayanan, rating_makanan, rating_fasilitas, comment, tag_ids } = req.body;

    if (!order_id || rating_pelayanan === undefined || rating_makanan === undefined || rating_fasilitas === undefined) {
      return res.status(400).json({ error: 'order_id, rating_pelayanan, rating_makanan, and rating_fasilitas are required' });
    }

    const orderDoc = await db.collection('orders').doc(order_id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();
    if (orderData.user_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You did not place this order' });
    }

    if (orderData.status !== 'completed') {
      return res.status(400).json({ error: 'You can only review completed orders' });
    }

    // Check if review already exists for this order
    const reviewQuery = await db.collection('reviews').where('order_id', '==', order_id).limit(1).get();
    if (!reviewQuery.empty) {
      return res.status(409).json({ error: 'You have already reviewed this order' });
    }

    const restoId = orderData.resto_id;
    const avgRatingForThisReview = (parseFloat(rating_pelayanan) + parseFloat(rating_makanan) + parseFloat(rating_fasilitas)) / 3;

    // Save to reviews collection
    const reviewRef = db.collection('reviews').doc();
    const newReview = {
      user_id: req.user.uid,
      resto_id: restoId,
      order_id,
      rating_pelayanan: parseFloat(rating_pelayanan),
      rating_makanan: parseFloat(rating_makanan),
      rating_fasilitas: parseFloat(rating_fasilitas),
      rating_avg: parseFloat(avgRatingForThisReview.toFixed(2)),
      comment: comment || '',
      created_at: admin.firestore.Timestamp.now(),
    };

    await reviewRef.set(newReview);

    // Save review tags in batch
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      const batch = db.batch();
      tag_ids.forEach((tagId, index) => {
        const trRef = db.collection('order_review_tags').doc(`${order_id}_tag_${index}`);
        batch.set(trRef, {
          order_id,
          tag_id: tagId,
        });
      });
      await batch.commit();
    }

    // Update restaurant average rating cache
    const restoRef = db.collection('restaurants').doc(restoId);
    await db.runTransaction(async (transaction) => {
      const restoDoc = await transaction.get(restoRef);
      if (restoDoc.exists) {
        const data = restoDoc.data();
        const oldTotal = data.total_review || 0;
        const oldAvg = data.avg_rating || 0.0;
        
        const newTotal = oldTotal + 1;
        const newAvg = ((oldAvg * oldTotal) + avgRatingForThisReview) / newTotal;

        transaction.update(restoRef, {
          total_review: newTotal,
          avg_rating: parseFloat(newAvg.toFixed(2)),
        });
      }
    });

    res.status(201).json({
      review_id: reviewRef.id,
      message: 'Review submitted successfully',
      rating_avg: newReview.rating_avg,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /reviews/:resto_id (Public reviews)
router.get('/:resto_id', async (req, res) => {
  try {
    const { resto_id } = req.params;

    const reviewsSnap = await db.collection('reviews')
      .where('resto_id', '==', resto_id)
      .orderBy('created_at', 'desc')
      .get();

    const reviews = [];
    
    // Resolve user names
    const usersSnap = await db.collection('users').get();
    const usersMap = {};
    usersSnap.forEach(doc => {
      usersMap[doc.id] = doc.data().nama;
    });

    reviewsSnap.forEach(doc => {
      const data = doc.data();
      reviews.push({
        review_id: doc.id,
        user_name: usersMap[data.user_id] || 'Pelanggan',
        rating_pelayanan: data.rating_pelayanan,
        rating_makanan: data.rating_makanan,
        rating_fasilitas: data.rating_fasilitas,
        rating_avg: data.rating_avg,
        comment: data.comment,
        created_at: data.created_at ? data.created_at.toDate().toISOString() : null,
      });
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
