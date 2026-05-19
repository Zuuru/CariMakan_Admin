const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');

// GET /queues/:resto_id/status
router.get('/:resto_id/status', async (req, res) => {
  try {
    const { resto_id } = req.params;

    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const resto = restoDoc.data();
    const is_queue_open = resto.is_queue_open !== undefined ? resto.is_queue_open : true;

    // Count active waiting queues
    const waitingSnap = await db.collection('queues')
      .where('resto_id', '==', resto_id)
      .where('status', '==', 'waiting')
      .get();

    const queue_count = waitingSnap.size;
    const estimated_wait_minutes = queue_count * 5; // Estimasi 5 menit per antrian

    res.status(200).json({
      is_queue_open,
      queue_count,
      estimated_wait_minutes,
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /queues/:resto_id/take (Customer only)
router.post('/:resto_id/take', requireAuth, async (req, res) => {
  try {
    const { resto_id } = req.params;
    const { type } = req.body; // dine_in or take_away

    if (!type || !['dine_in', 'take_away'].includes(type)) {
      return res.status(400).json({ error: 'Valid queue type (dine_in or take_away) is required' });
    }

    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const resto = restoDoc.data();
    if (resto.is_queue_open === false) {
      return res.status(400).json({ error: 'Queue is currently closed' });
    }

    // Generate queue number
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySnap = await db.collection('queues')
      .where('resto_id', '==', resto_id)
      .where('created_at', '>=', admin.firestore.Timestamp.fromDate(today))
      .get();

    let nextQueueNumber = 1;
    if (!todaySnap.empty) {
      const numbers = todaySnap.docs.map(doc => doc.data().queue_number || doc.data().nomor_antrian || 0);
      nextQueueNumber = Math.max(...numbers) + 1;
    }

    const queueRef = db.collection('queues').doc();
    const newQueue = {
      resto_id,
      user_id: req.user.uid,
      queue_number: nextQueueNumber,
      type,
      status: 'waiting', // waiting, called, completed, cancelled
      created_at: admin.firestore.Timestamp.now(),
    };

    await queueRef.set(newQueue);

    res.status(201).json({
      queue_id: queueRef.id,
      queue_number: nextQueueNumber,
      type,
    });
  } catch (error) {
    console.error('Error taking queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /queues/:resto_id/call (Owner only)
router.put('/:resto_id/call', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id } = req.params;

    // Verify owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    // Get oldest waiting queue
    const oldestSnap = await db.collection('queues')
      .where('resto_id', '==', resto_id)
      .where('status', '==', 'waiting')
      .orderBy('created_at', 'asc')
      .limit(1)
      .get();

    if (oldestSnap.empty) {
      return res.status(404).json({ error: 'No active queues in the waiting list' });
    }

    const nextQueueDoc = oldestSnap.docs[0];
    
    // Update status to 'called'
    await nextQueueDoc.ref.update({ status: 'called' });

    res.status(200).json({
      message: 'Queue called successfully',
      queue_id: nextQueueDoc.id,
      queue_number: nextQueueDoc.data().queue_number,
      type: nextQueueDoc.data().type,
    });
  } catch (error) {
    console.error('Error calling queue:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /queues/:resto_id/toggle (Owner only)
router.put('/:resto_id/toggle', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id } = req.params;

    // Verify owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    const currentOpenStatus = restoDoc.data().is_queue_open !== undefined ? restoDoc.data().is_queue_open : true;
    const newOpenStatus = !currentOpenStatus;

    await db.collection('restaurants').doc(resto_id).update({
      is_queue_open: newOpenStatus,
    });

    res.status(200).json({
      success: true,
      is_queue_open: newOpenStatus,
    });
  } catch (error) {
    console.error('Error toggling queue status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
