const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');

// POST /table-qr/generate (Owner only)
router.post('/generate', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id, table_number } = req.body;

    if (!resto_id || !table_number) {
      return res.status(400).json({ error: 'resto_id and table_number are required' });
    }

    // Verify restaurant owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    // Check if table already exists for this restaurant
    const tableQuery = await db.collection('meja')
      .where('resto_id', '==', resto_id)
      .where('nomor_meja', '==', table_number)
      .limit(1)
      .get();

    let qr_id = '';
    let qr_url = '';

    if (!tableQuery.empty) {
      const tableDoc = tableQuery.docs[0];
      qr_id = tableDoc.id;
      qr_url = tableDoc.data().qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=carimakan://resto/${resto_id}/table/${table_number}`;
      
      // Update with qr_url if it was missing
      if (!tableDoc.data().qr_code_url) {
        await tableDoc.ref.update({ qr_code_url: qr_url });
      }
    } else {
      // Create new table QR Code
      const tableRef = db.collection('meja').doc();
      qr_id = tableRef.id;
      qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=carimakan://resto/${resto_id}/table/${table_number}`;

      await tableRef.set({
        resto_id,
        nomor_meja: table_number,
        qr_code_url: qr_url,
      });
    }

    res.status(201).json({
      qr_id,
      table_number,
      qr_url,
    });
  } catch (error) {
    console.error('Error generating table QR Code:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
