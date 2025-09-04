const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const config = require('../config/config');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return res.status(400).json({ error: 'User already exists with this email' });
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Hash password for storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      plan: 'free',
      storageUsed: 0,
      maxStorage: 100 * 1024 * 1024, // 100MB
      dailyUploads: 0,
      maxDailyUploads: 3,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: name,
        plan: 'free'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { email, password } = req.body;

    // Get user from Firestore
    const userQuery = await admin.firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await admin.firestore().collection('users').doc(userDoc.id).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: userDoc.id, email: userData.email },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        uid: userDoc.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        storageUsed: userData.storageUsed,
        maxStorage: userData.maxStorage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateJWT, async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;
