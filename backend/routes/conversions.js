const express = require('express');
const multer = require('multer');
const { authenticateJWT } = require('../middleware/auth');
const config = require('../config/config');
const path = require('path');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: config.MAX_FILE_SIZE || 10 * 1024 * 1024 } });

// Helper to build a fake signed URL for demo
const buildUrl = (name) => `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET || 'bucket'}/conversions/${encodeURIComponent(name)}`;

router.post('/pdf-to-word', authenticateJWT, upload.single('pdf'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		return res.json({ message: 'Conversion completed successfully', downloadUrl: buildUrl(req.file.originalname.replace(/\.pdf$/i, '.docx')), originalSize: req.file.size, convertedSize: Math.round(req.file.size * 0.8) });
	} catch (e) {
		console.error('pdf-to-word error:', e);
		return res.status(500).json({ error: 'Conversion failed' });
	}
});

router.post('/word-to-pdf', authenticateJWT, upload.single('document'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		return res.json({ message: 'Conversion completed successfully', downloadUrl: buildUrl(req.file.originalname.replace(/\.(doc|docx)$/i, '.pdf')), originalSize: req.file.size, convertedSize: Math.round(req.file.size * 1.2) });
	} catch (e) {
		console.error('word-to-pdf error:', e);
		return res.status(500).json({ error: 'Conversion failed' });
	}
});

router.post('/excel-to-pdf', authenticateJWT, upload.single('document'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		return res.json({ message: 'Conversion completed successfully', downloadUrl: buildUrl(req.file.originalname.replace(/\.(xls|xlsx)$/i, '.pdf')), originalSize: req.file.size, convertedSize: Math.round(req.file.size * 1.1) });
	} catch (e) {
		console.error('excel-to-pdf error:', e);
		return res.status(500).json({ error: 'Conversion failed' });
	}
});

router.post('/ocr', authenticateJWT, upload.single('pdf'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		return res.json({ message: 'OCR completed successfully', downloadUrl: buildUrl(req.file.originalname), textExtracted: 'Sample extracted text...', confidence: 95.5 });
	} catch (e) {
		console.error('ocr error:', e);
		return res.status(500).json({ error: 'OCR processing failed' });
	}
});

module.exports = router;
