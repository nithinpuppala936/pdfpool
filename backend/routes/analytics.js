const express = require('express');
const admin = require('firebase-admin');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Get user analytics
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user documents
    const documentsSnapshot = await admin.firestore()
      .collection('documents')
      .where('userId', '==', req.user.uid)
      .where('uploadedAt', '>=', startDate)
      .get();

    const documents = [];
    let totalSize = 0;
    const operations = {};

    documentsSnapshot.forEach(doc => {
      const data = doc.data();
      documents.push(data);
      totalSize += data.size || 0;
      
      if (data.operation) {
        operations[data.operation] = (operations[data.operation] || 0) + 1;
      }
    });

    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();

    res.json({
      analytics: {
        period,
        totalDocuments: documents.length,
        totalSize,
        storageUsed: userData.storageUsed,
        maxStorage: userData.maxStorage,
        dailyUploads: userData.dailyUploads,
        maxDailyUploads: userData.maxDailyUploads,
        operations,
        storagePercentage: ((userData.storageUsed / userData.maxStorage) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get document statistics
router.get('/documents', authenticateJWT, async (req, res) => {
  try {
    const documentsSnapshot = await admin.firestore()
      .collection('documents')
      .where('userId', '==', req.user.uid)
      .get();

    const stats = {
      total: 0,
      byType: {},
      byOperation: {},
      totalSize: 0,
      averageSize: 0
    };

    documentsSnapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      stats.totalSize += data.size || 0;
      
      stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
      
      if (data.operation) {
        stats.byOperation[data.operation] = (stats.byOperation[data.operation] || 0) + 1;
      }
    });

    stats.averageSize = stats.total > 0 ? Math.round(stats.totalSize / stats.total) : 0;

    res.json({ stats });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ error: 'Failed to get document statistics' });
  }
});

module.exports = router;
