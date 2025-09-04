# PoolPDF - Smart Document Processing Platform

A modern, cloud-based PDF automation platform that combines PDF editing, e-signatures, form automation, and PDF conversions into a unified SaaS solution.

## 🚀 Features

### Core Features
- **PDF Management**: Merge, split, compress, reorder pages
- **E-Signature System**: Legally binding signatures with signer tracking
- **PDF Conversions**: Word ↔ PDF, Excel ↔ PDF, OCR processing
- **PDF Form Automation**: Template system with variable data
- **User Management**: Secure login, dashboard, folder-sharing
- **Security**: AES 256 encryption, HTTPS, compliance setup

### Technical Features
- **Modern UI**: React.js with TailwindCSS
- **Real-time Processing**: Node.js backend with Express
- **Cloud Storage**: Firebase Firestore and Storage
- **Authentication**: JWT and Firebase Auth
- **File Processing**: PDF-lib for PDF manipulation
- **Responsive Design**: Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin** - Authentication & Database
- **PDF-lib** - PDF processing
- **Multer** - File uploads
- **JWT** - Authentication tokens

### Infrastructure
- **Firebase Firestore** - Database
- **Firebase Storage** - File storage
- **Firebase Auth** - Authentication
- **Vercel** - Frontend hosting (recommended)
- **Railway/AWS** - Backend hosting

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd poolpdf-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Configuration
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# File Upload Limits
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx
```

#### Frontend Configuration
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Storage
4. Enable Authentication (Email/Password)
5. Download service account key and place it in `backend/config/firebase-service-account.json`

### 5. Create Upload Directories
```bash
# In the backend directory
mkdir uploads
mkdir uploads/signatures
mkdir uploads/conversions
mkdir uploads/templates
```

## 🚀 Running the Application

### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both frontend (port 3000) and backend (port 5000) in development mode.

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## 📁 Project Structure

```
poolpdf-platform/
├── backend/
│   ├── config/
│   │   ├── config.js
│   │   └── firebase-service-account.json
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pdfs.js
│   │   ├── signatures.js
│   │   ├── conversions.js
│   │   ├── forms.js
│   │   ├── users.js
│   │   └── analytics.js
│   ├── uploads/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### PDF Management
- `POST /api/pdfs/upload` - Upload PDF
- `GET /api/pdfs/my-pdfs` - Get user's PDFs
- `POST /api/pdfs/merge` - Merge PDFs
- `POST /api/pdfs/split/:id` - Split PDF
- `POST /api/pdfs/compress/:id` - Compress PDF
- `DELETE /api/pdfs/:id` - Delete PDF

### E-Signatures
- `POST /api/signatures/create` - Create signature request
- `GET /api/signatures/my-requests` - Get user's requests
- `GET /api/signatures/pending` - Get pending signatures
- `POST /api/signatures/sign/:id` - Sign document

### Conversions
- `POST /api/conversions/pdf-to-word` - Convert PDF to Word
- `POST /api/conversions/word-to-pdf` - Convert Word to PDF
- `POST /api/conversions/excel-to-pdf` - Convert Excel to PDF
- `POST /api/conversions/ocr` - OCR processing

### Analytics
- `GET /api/analytics/user` - Get user analytics
- `GET /api/analytics/documents` - Get document statistics

## 🎯 Usage Examples

### Upload and Process PDF
1. Navigate to PDF Tools
2. Upload your PDF file
3. Choose operation (merge, split, compress)
4. Download processed file

### Create E-Signature Request
1. Upload document to sign
2. Add signer emails and names
3. Send signature request
4. Track signing progress

### Convert Documents
1. Go to Conversions page
2. Upload source file
3. Select target format
4. Download converted file

## 🔒 Security Features

- JWT token authentication
- Rate limiting on API endpoints
- File type validation
- File size limits
- CORS protection
- Helmet.js security headers
- Input validation and sanitization

## 📊 Analytics & Monitoring

- User activity tracking
- Storage usage monitoring
- Document processing statistics
- Performance metrics
- Error logging

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend (Railway/AWS)
1. Set up environment variables
2. Configure Firebase credentials
3. Deploy using Railway CLI or AWS CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- Basic PDF operations
- User authentication
- File management
- E-signature system

### Phase 2 (Enhancement)
- Advanced PDF editing
- Batch processing
- API integrations
- Mobile app

### Phase 3 (Enterprise)
- Team collaboration
- Advanced analytics
- White-label solutions
- Enterprise features

---

**Built with ❤️ by ComputePool Solutions**

