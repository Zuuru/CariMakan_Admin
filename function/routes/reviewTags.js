const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { requireAuth, requireRole } = require('../authMiddleware');

// GET /review-tags/categories
router.get('/categories', async (req, res) => {
  try {
    const categoriesSnap = await db.collection('tag_kategori').get();
    const categories = [];
    categoriesSnap.forEach(doc => {
      const data = doc.data();
      categories.push({
        kategori_id: doc.id,
        nama: data.nama,
        icon: data.icon || '',
      });
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /review-tags
router.get('/', async (req, res) => {
  try {
    const { kategori_id } = req.query;
    
    let query = db.collection('review_tags');
    if (kategori_id) {
      query = query.where('kategori_id', '==', kategori_id);
    }

    const tagsSnap = await query.get();
    const tags = [];
    tagsSnap.forEach(doc => {
      const data = doc.data();
      tags.push({
        tag_id: doc.id,
        kategori_id: data.kategori_id,
        label: data.label,
        icon: data.icon || '',
      });
    });
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /review-tags/categories (Admin only)
router.post('/categories', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { nama, icon } = req.body;
    if (!nama) {
      return res.status(400).json({ error: 'nama is required' });
    }

    const catRef = db.collection('tag_kategori').doc();
    const newCategory = {
      nama,
      icon: icon || '',
    };
    await catRef.set(newCategory);

    res.status(201).json({
      kategori_id: catRef.id,
      ...newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /review-tags (Admin only)
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { kategori_id, label, icon } = req.body;
    if (!kategori_id || !label) {
      return res.status(400).json({ error: 'kategori_id and label are required' });
    }

    // Verify category exists
    const catDoc = await db.collection('tag_kategori').doc(kategori_id).get();
    if (!catDoc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const tagRef = db.collection('review_tags').doc();
    const newTag = {
      kategori_id,
      label,
      icon: icon || '',
    };
    await tagRef.set(newTag);

    res.status(201).json({
      tag_id: tagRef.id,
      ...newTag,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /review-tags/:tag_id (Admin only)
router.put('/:tag_id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { tag_id } = req.params;
    const { label, icon, kategori_id } = req.body;

    const tagDoc = await db.collection('review_tags').doc(tag_id).get();
    if (!tagDoc.exists) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    const updates = {};
    if (label) updates.label = label;
    if (icon !== undefined) updates.icon = icon;
    if (kategori_id) {
      const catDoc = await db.collection('tag_kategori').doc(kategori_id).get();
      if (!catDoc.exists) {
        return res.status(404).json({ error: 'Category not found' });
      }
      updates.kategori_id = kategori_id;
    }

    await db.collection('review_tags').doc(tag_id).update(updates);

    res.status(200).json({ success: true, message: 'Tag updated successfully' });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /review-tags/:tag_id (Admin only)
router.delete('/:tag_id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { tag_id } = req.params;

    const tagDoc = await db.collection('review_tags').doc(tag_id).get();
    if (!tagDoc.exists) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    await db.collection('review_tags').doc(tag_id).delete();

    // Clean up any references in order_review_tags
    const refsSnap = await db.collection('order_review_tags').where('tag_id', '==', tag_id).get();
    const batch = db.batch();
    refsSnap.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.status(200).json({ success: true, message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
