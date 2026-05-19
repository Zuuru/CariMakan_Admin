const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { db, admin } = require('../firebase');
const { JWT_SECRET } = require('../authMiddleware');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const assignedRole = role || 'customer';
    if (!['customer', 'owner', 'admin'].includes(assignedRole)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if email already exists
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!userQuery.empty) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user document
    const userRef = db.collection('users').doc();
    const newUser = {
      nama: name,
      email: email,
      role: assignedRole,
      password: password, // For development plain-text, as in firestore-setup
      foto_url: null,
      poin_reward: 0,
      fcm_token: null,
      status: 'aktif',
      url_whatsapp: phone || null,
      created_at: admin.firestore.Timestamp.now(),
    };

    await userRef.set(newUser);

    // Generate JWT
    const token = jwt.sign({ uid: userRef.id, role: assignedRole }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      uid: userRef.id,
      token,
      role: assignedRole,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userQuery.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspend') {
      return res.status(403).json({ error: 'This account is suspended' });
    }

    // Generate JWT
    const token = jwt.sign({ uid: userDoc.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      uid: userDoc.id,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
