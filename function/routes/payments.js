const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth } = require('../authMiddleware');

// POST /payments/webhook
router.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;
    
    const order_id = notification.order_id;
    const transaction_status = notification.transaction_status;
    const payment_type = notification.payment_type;
    const fraud_status = notification.fraud_status;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    console.log(`Payment Webhook: Order ID: ${order_id}, Status: ${transaction_status}, Type: ${payment_type}`);

    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        paymentStatus = 'challenge';
      } else if (fraud_status === 'accept') {
        paymentStatus = 'success';
        orderStatus = 'processing'; // Paid successfully, now processing
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'success';
      orderStatus = 'processing';
    } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
      paymentStatus = 'failed';
      orderStatus = 'cancelled';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    }

    // Update payment document in Firestore
    const paymentsQuery = await db.collection('payments').where('order_id', '==', order_id).limit(1).get();
    
    if (!paymentsQuery.empty) {
      const paymentDoc = paymentsQuery.docs[0];
      const updates = {
        status: paymentStatus,
        method: payment_type || 'unknown',
      };
      if (paymentStatus === 'success') {
        updates.paid_at = admin.firestore.Timestamp.now();
      }
      await paymentDoc.ref.update(updates);
    } else {
      // Create payment document if not exists
      const newPayment = {
        order_id,
        gateway_token: notification.transaction_id || `tok_${order_id}`,
        method: payment_type || 'unknown',
        amount: parseFloat(notification.gross_amount || 0),
        status: paymentStatus,
        paid_at: paymentStatus === 'success' ? admin.firestore.Timestamp.now() : null,
      };
      await db.collection('payments').add(newPayment);
    }

    // Update order status if needed
    if (orderStatus !== 'pending') {
      const orderRef = db.collection('orders').doc(order_id);
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        await orderRef.update({ status: orderStatus });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /payments/:order_id
router.get('/:order_id', requireAuth, async (req, res) => {
  try {
    const { order_id } = req.params;

    const paymentsQuery = await db.collection('payments').where('order_id', '==', order_id).limit(1).get();
    
    if (paymentsQuery.empty) {
      return res.status(404).json({ error: 'Payment record not found for this order' });
    }

    const paymentData = paymentsQuery.docs[0].data();

    // Verify ownership
    const orderDoc = await db.collection('orders').doc(order_id).get();
    if (orderDoc.exists && orderDoc.data().user_id !== req.user.uid && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.status(200).json({
      payment_id: paymentsQuery.docs[0].id,
      order_id: paymentData.order_id,
      gateway_token: paymentData.gateway_token,
      method: paymentData.method,
      amount: paymentData.amount,
      status: paymentData.status,
      paid_at: paymentData.paid_at ? paymentData.paid_at.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
