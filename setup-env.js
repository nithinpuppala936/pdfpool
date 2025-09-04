const fs = require('fs');
const path = require('path');

console.log('🚀 PDFPOOL Platform Environment Setup\n');

// Create backend .env file
const backendEnv = `NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=pdfpool-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRE=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx

# India Payments (Razorpay / UPI)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
MERCHANT_UPI_ID=
MERCHANT_NAME=PDFPOOL
`;

// Create frontend .env file
const frontendEnv = `REACT_APP_API_URL=http://localhost:5000
`;

try {
  // Create backend .env
  fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
  console.log('✅ Created backend/.env file');
  
  // Create frontend .env
  fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnv);
  console.log('✅ Created frontend/.env file');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Update backend/.env with your Firebase project details');
  console.log('2. Download Firebase service account key and save as backend/config/firebase-service-account.json');
  console.log('3. Run: npm run install-all');
  console.log('4. Run: npm run dev');
  console.log('\n🔧 Firebase Setup:');
  console.log('- Create project at https://console.firebase.google.com');
  console.log('- Enable Firestore Database');
  console.log('- Enable Storage');
  console.log('- Enable Authentication (Email/Password)');
  console.log('- Download service account key from Project Settings > Service Accounts');
  
} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
}
