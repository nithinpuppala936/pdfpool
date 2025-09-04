const express = require('express');
const admin = require('firebase-admin');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    res.json({
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: userData.name,
        role: userData.role,
        plan: userData.plan,
        storageUsed: userData.storageUsed,
        maxStorage: userData.maxStorage,
        dailyUploads: userData.dailyUploads,
        maxDailyUploads: userData.maxDailyUploads,
        createdAt: userData.createdAt?.toDate().toISOString(),
        lastLogin: userData.lastLogin?.toDate().toISOString()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
  try {
    const { name, plan } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (plan) updates.plan = plan;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    await admin.firestore().collection('users').doc(req.user.uid).update(updates);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
