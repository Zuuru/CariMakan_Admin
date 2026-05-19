const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');

// Harvesine formula helper
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// GET /restaurants
router.get('/', async (req, res) => {
  try {
    const { limit, status } = req.query;
    
    let query = db.collection('restaurants');
    
    // Filter status (default to active)
    const targetStatus = status || 'aktif';
    if (targetStatus !== 'all') {
      query = query.where('status', '==', targetStatus);
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const restosSnap = await query.get();
    
    // Fetch master badges
    const badgesSnap = await db.collection('badges').get();
    const badgesMap = {};
    badgesSnap.forEach(doc => {
      badgesMap[doc.id] = doc.data().nama;
    });

    // Fetch resto badges junction
    const restoBadgesSnap = await db.collection('resto_badges').get();
    const restoBadgesMap = {};
    restoBadgesSnap.forEach(doc => {
      const data = doc.data();
      if (!restoBadgesMap[data.resto_id]) {
        restoBadgesMap[data.resto_id] = [];
      }
      if (badgesMap[data.badge_id]) {
        restoBadgesMap[data.resto_id].push(badgesMap[data.badge_id]);
      }
    });

    const restaurantsList = [];

    for (const doc of restosSnap.docs) {
      const resto = doc.data();
      const restoId = doc.id;
      
      // Query current active queues count for this resto
      const queueSnap = await db.collection('queues')
        .where('resto_id', '==', restoId)
        .where('status', '==', 'waiting')
        .get();

      restaurantsList.push({
        resto_id: restoId,
        name: resto.nama,
        rating_avg: resto.avg_rating || 0.0,
        total_review: resto.total_review || 0,
        is_queue_open: resto.is_queue_open !== undefined ? resto.is_queue_open : true,
        queue_count: queueSnap.size,
        badges: restoBadgesMap[restoId] || [],
        photo_url: resto.foto_uri || null,
        status: resto.status || 'pending',
      });
    }

    res.status(200).json(restaurantsList);
  } catch (error) {
    console.error('Error fetching restaurants list:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /restaurants/nearby
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius) || 2000; // default 2000m

    // Get all active restaurants
    const restosSnap = await db.collection('restaurants').where('status', '==', 'aktif').get();
    
    // Fetch master badges
    const badgesSnap = await db.collection('badges').get();
    const badgesMap = {};
    badgesSnap.forEach(doc => {
      badgesMap[doc.id] = doc.data().nama;
    });

    // Fetch resto badges junction
    const restoBadgesSnap = await db.collection('resto_badges').get();
    const restoBadgesMap = {};
    restoBadgesSnap.forEach(doc => {
      const data = doc.data();
      if (!restoBadgesMap[data.resto_id]) {
        restoBadgesMap[data.resto_id] = [];
      }
      if (badgesMap[data.badge_id]) {
        restoBadgesMap[data.resto_id].push(badgesMap[data.badge_id]);
      }
    });

    const nearbyRestos = [];

    for (const doc of restosSnap.docs) {
      const resto = doc.data();
      const restoId = doc.id;
      let restoLat = 0;
      let restoLng = 0;

      if (resto.lokasi && (resto.lokasi.latitude !== undefined || resto.lokasi._latitude !== undefined)) {
        restoLat = resto.lokasi.latitude || resto.lokasi._latitude;
        restoLng = resto.lokasi.longitude || resto.lokasi._longitude;
      } else {
        continue; // skip if no location
      }

      const distance = getDistance(userLat, userLng, restoLat, restoLng);

      if (distance <= searchRadius) {
        // Query current active queues count for this resto
        const queueSnap = await db.collection('queues')
          .where('resto_id', '==', restoId)
          .where('status', '==', 'waiting')
          .get();

        nearbyRestos.push({
          resto_id: restoId,
          name: resto.nama,
          distance_m: Math.round(distance),
          rating_avg: resto.avg_rating || 0.0,
          is_queue_open: resto.is_queue_open !== undefined ? resto.is_queue_open : true,
          queue_count: queueSnap.size,
          badges: restoBadgesMap[restoId] || [],
          photo_url: resto.foto_uri || null,
        });
      }
    }

    // Sort by distance ascending
    nearbyRestos.sort((a, b) => a.distance_m - b.distance_m);

    res.status(200).json(nearbyRestos);
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /restaurants/:resto_id
router.get('/:resto_id', async (req, res) => {
  try {
    const { resto_id } = req.params;
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();

    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const resto = restoDoc.data();

    // Fetch badges
    const restoBadgesSnap = await db.collection('resto_badges').where('resto_id', '==', resto_id).get();
    const badgeIds = restoBadgesSnap.docs.map(doc => doc.data().badge_id);
    
    let badges = [];
    if (badgeIds.length > 0) {
      const badgesSnap = await db.collection('badges').get();
      badgesSnap.forEach(doc => {
        if (badgeIds.includes(doc.id)) {
          badges.push({
            id: doc.id,
            nama: doc.data().nama,
            icon: doc.data().icon,
          });
        }
      });
    }

    // Check active queue count
    const queueSnap = await db.collection('queues')
      .where('resto_id', '==', resto_id)
      .where('status', '==', 'waiting')
      .get();

    res.status(200).json({
      resto_id,
      name: resto.nama,
      owner_id: resto.owner_id,
      lokasi: resto.lokasi ? { lat: resto.lokasi.latitude || resto.lokasi._latitude, lng: resto.lokasi.longitude || resto.lokasi._longitude } : null,
      jam_buka: resto.jam_buka || '',
      status: resto.status || 'pending',
      url_whatsapp: resto.url_whatsapp || '',
      rating_avg: resto.avg_rating || 0.0,
      total_review: resto.total_review || 0,
      is_queue_open: resto.is_queue_open !== undefined ? resto.is_queue_open : true,
      queue_count: queueSnap.size,
      badges,
      photo_url: resto.foto_uri || null,
      created_at: resto.created_at ? resto.created_at.toDate().toISOString() : null,
    });
  } catch (error) {
    console.error('Error fetching restaurant detail:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /restaurants (Owner only)
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { name, lat, lng, jam_buka, url_whatsapp, foto_uri, badges } = req.body;

    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Name, lat, and lng are required' });
    }

    const restoRef = db.collection('restaurants').doc();
    const newResto = {
      owner_id: req.user.uid,
      nama: name,
      lokasi: new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng)),
      foto_uri: foto_uri || null,
      jam_buka: jam_buka || '08:00-22:00',
      status: 'pending', // Awaiting admin verification
      url_whatsapp: url_whatsapp || '',
      avg_rating: 0.0,
      total_review: 0,
      is_queue_open: true,
      created_at: admin.firestore.Timestamp.now(),
    };

    await restoRef.set(newResto);

    // Save badges if provided
    if (Array.isArray(badges)) {
      const batch = db.batch();
      badges.forEach(badgeId => {
        const jRef = db.collection('resto_badges').doc();
        batch.set(jRef, {
          resto_id: restoRef.id,
          badge_id: badgeId,
        });
      });
      await batch.commit();
    }

    res.status(201).json({
      resto_id: restoRef.id,
      ...newResto,
      lokasi: { lat, lng },
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /restaurants/:resto_id (Owner only)
router.put('/:resto_id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id } = req.params;
    const { name, lat, lng, jam_buka, url_whatsapp, foto_uri, badges, is_queue_open } = req.body;

    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Verify owner
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    const updates = {};
    if (name) updates.nama = name;
    if (lat !== undefined && lng !== undefined) {
      updates.lokasi = new admin.firestore.GeoPoint(parseFloat(lat), parseFloat(lng));
    }
    if (jam_buka) updates.jam_buka = jam_buka;
    if (url_whatsapp) updates.url_whatsapp = url_whatsapp;
    if (foto_uri !== undefined) updates.foto_uri = foto_uri;
    if (is_queue_open !== undefined) updates.is_queue_open = !!is_queue_open;

    await db.collection('restaurants').doc(resto_id).update(updates);

    // Update badges if provided
    if (Array.isArray(badges)) {
      // Delete existing
      const existingBadges = await db.collection('resto_badges').where('resto_id', '==', resto_id).get();
      const deleteBatch = db.batch();
      existingBadges.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();

      // Write new
      const addBatch = db.batch();
      badges.forEach(badgeId => {
        const jRef = db.collection('resto_badges').doc();
        addBatch.set(jRef, {
          resto_id,
          badge_id: badgeId,
        });
      });
      await addBatch.commit();
    }

    res.status(200).json({ success: true, message: 'Restaurant updated successfully' });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Menu Endpoints ─────────────────────────────────────────────────────────

// GET /restaurants/:resto_id/menus
router.get('/:resto_id/menus', async (req, res) => {
  try {
    const { resto_id } = req.params;
    const menusSnap = await db.collection('menus').where('resto_id', '==', resto_id).get();
    
    const menus = [];
    menusSnap.forEach(doc => {
      const data = doc.data();
      menus.push({
        menu_id: doc.id,
        name: data.nama,
        price: data.harga,
        description: data.deskripsi || '',
        is_available: data.tersedia !== undefined ? data.tersedia : true,
        photo_url: data.foto_url || null,
        category: data.category || 'makanan', // Category of menu
      });
    });

    res.status(200).json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /restaurants/:resto_id/menus (Owner only)
router.post('/:resto_id/menus', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id } = req.params;
    const { name, price, description, is_available, photo_url, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Verify restaurant owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    const menuRef = db.collection('menus').doc();
    const newMenu = {
      resto_id,
      nama: name,
      harga: parseInt(price),
      deskripsi: description || '',
      tersedia: is_available !== undefined ? !!is_available : true,
      foto_url: photo_url || null,
      category: category || 'makanan',
    };

    await menuRef.set(newMenu);

    res.status(201).json({
      menu_id: menuRef.id,
      ...newMenu,
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /restaurants/:resto_id/menus/:menu_id (Owner only)
router.put('/:resto_id/menus/:menu_id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id, menu_id } = req.params;
    const { name, price, description, is_available, photo_url, category } = req.body;

    // Verify restaurant owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    const menuDoc = await db.collection('menus').doc(menu_id).get();
    if (!menuDoc.exists) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const updates = {};
    if (name) updates.nama = name;
    if (price !== undefined) updates.harga = parseInt(price);
    if (description !== undefined) updates.deskripsi = description;
    if (is_available !== undefined) updates.tersedia = !!is_available;
    if (photo_url !== undefined) updates.foto_url = photo_url;
    if (category) updates.category = category;

    await db.collection('menus').doc(menu_id).update(updates);

    res.status(200).json({ success: true, message: 'Menu updated successfully' });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /restaurants/:resto_id/menus/:menu_id (Owner only)
router.delete('/:resto_id/menus/:menu_id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const { resto_id, menu_id } = req.params;

    // Verify restaurant owner
    const restoDoc = await db.collection('restaurants').doc(resto_id).get();
    if (!restoDoc.exists) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    if (restoDoc.data().owner_id !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden: You do not own this restaurant' });
    }

    const menuDoc = await db.collection('menus').doc(menu_id).get();
    if (!menuDoc.exists) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await db.collection('menus').doc(menu_id).delete();

    res.status(200).json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
