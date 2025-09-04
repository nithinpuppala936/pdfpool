require('dotenv').config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'poolpdf-super-secret-jwt-key-2024',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // Firebase Configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'pdfpool-platform',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'pdfpool-platform.appspot.com',

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'poolpdf-storage',

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // File Upload Limits
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,ppt,pptx',

  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/poolpdf',

  // Security
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Feature Flags
  ENABLE_OCR: process.env.ENABLE_OCR === 'true',
  ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',

  // India Payments (Razorpay / UPI)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  MERCHANT_UPI_ID: process.env.MERCHANT_UPI_ID, // e.g. yourname@icici
  MERCHANT_NAME: process.env.MERCHANT_NAME || 'PDFPOOL'
};
