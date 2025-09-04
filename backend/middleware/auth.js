const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const config = require('../config/config');

// JWT Authentication Middleware
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Firebase Authentication Middleware
const authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Firebase token required' });
    }

    const token = authHeader.substring(7);
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0]
    };
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
};

// Role-based Authorization Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Optional Authentication (for public routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Try JWT first
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        // Try Firebase if JWT fails
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email.split('@')[0]
          };
        } catch (firebaseError) {
          // Token is invalid, but we continue without user
          req.user = null;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateJWT,
  authenticateFirebase,
  authorizeRoles,
  optionalAuth
};
