# PoolPDF Platform Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies
npm run install-all
```

### 2. Environment Setup

#### Backend Configuration
Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-2024
JWT_EXPIRE=7d
FIREBASE_PROJECT_ID=pdfpool-platform
FIREBASE_STORAGE_BUCKET=pdfpool-platform.appspot.com
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx
```

#### Frontend Configuration
Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Storage
4. Enable Authentication (Email/Password)
5. Download service account key and save as `backend/config/firebase-service-account.json`

### 4. Start Development Servers
```bash
# Start both frontend and backend
npm run dev
```

## 📁 Project Structure

```
poolpdf-platform/
├── backend/                 # Node.js Express server
│   ├── config/             # Configuration files
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── uploads/           # File upload directory
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app component
│   └── package.json
└── package.json          # Root package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend in development
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔒 Security Features

- JWT authentication
- Rate limiting
- File type validation
- CORS protection
- Input validation
- Helmet.js security headers

## 📊 Features Implemented

### ✅ Completed
- User authentication (register/login)
- JWT token management
- Firebase integration
- Basic UI with TailwindCSS
- Responsive layout
- Protected routes
- File upload structure
- PDF processing routes
- E-signature routes
- Conversion routes
- Analytics routes
- User management

### 🚧 In Progress
- PDF processing implementation
- E-signature functionality
- File conversion services
- Form automation
- Advanced analytics

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change PORT in backend/.env
   - Kill existing processes

2. **Firebase connection issues**
   - Verify service account key
   - Check Firebase project settings
   - Ensure Firestore and Storage are enabled

3. **CORS errors**
   - Check FRONTEND_URL in backend/.env
   - Verify frontend is running on correct port

4. **File upload issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Check allowed file types

## 📝 Next Steps

1. Implement PDF processing with pdf-lib
2. Add e-signature functionality
3. Integrate file conversion services
4. Build form automation features
5. Add advanced analytics
6. Deploy to production

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review Firebase documentation
- Check Node.js and React documentation
