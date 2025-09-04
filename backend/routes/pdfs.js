const express = require('express');
const multer = require('multer');
const { PDFDocument, degrees } = require('pdf-lib');
const { authenticateJWT } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* ================== MULTER ================== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

/* ================== LOCAL SAVE HELPER ================== */
async function saveToLocal(fileBuffer, fileName, userId) {
  const userFolder = path.join(__dirname, "../uploads", userId.toString());
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }
  const filePath = path.join(userFolder, `${Date.now()}-${fileName}`);
  fs.writeFileSync(filePath, fileBuffer);
  return filePath;
}

/* ================== ROUTES ================== */

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'PDF routes are working correctly (local mode)!' });
});

// Merge PDFs
router.post('/merge', authenticateJWT, upload.array('pdfs', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'At least 2 PDF files are required for merging' });
    }

    const userId = req.user?.uid || req.user?.id || req.user?.email || 'anonymous';
    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const fileName = `merged-${Date.now()}.pdf`;
    const filePath = await saveToLocal(mergedPdfBytes, fileName, userId);

    res.json({
      success: true,
      message: 'PDFs merged successfully',
      fileName,
      downloadUrl: `${req.protocol}://${req.get("host")}/uploads/${userId}/${path.basename(filePath)}`
    });

  } catch (error) {
    console.error('PDF merge error:', error);
    res.status(500).json({ error: 'Failed to merge PDFs', details: error.message });
  }
});

// Split PDF
router.post('/split', authenticateJWT, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const { startPage, endPage } = req.body;
    const userId = req.user?.uid || req.user?.id || req.user?.email || 'anonymous';

    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pageCount = pdfDoc.getPageCount();

    if (!startPage || !endPage || startPage < 1 || endPage > pageCount || startPage > endPage) {
      return res.status(400).json({ error: 'Invalid page range' });
    }

    const splitPdf = await PDFDocument.create();
    const pages = await splitPdf.copyPages(pdfDoc,
      Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
    );
    pages.forEach((page) => splitPdf.addPage(page));

    const splitPdfBytes = await splitPdf.save();
    const fileName = `split-${startPage}-${endPage}-${Date.now()}.pdf`;
    const filePath = await saveToLocal(splitPdfBytes, fileName, userId);

    res.json({
      success: true,
      message: 'PDF split successfully',
      fileName,
      downloadUrl: `${req.protocol}://${req.get("host")}/uploads/${userId}/${path.basename(filePath)}`
    });

  } catch (error) {
    console.error('PDF split error:', error);
    res.status(500).json({ error: 'Failed to split PDF', details: error.message });
  }
});

// Compress PDF
router.post('/compress', authenticateJWT, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const userId = req.user?.uid || req.user?.id || req.user?.email || 'anonymous';
    const pdfDoc = await PDFDocument.load(req.file.buffer);

    // NOTE: pdf-lib doesn’t provide true compression
    const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

    const fileName = `compressed-${Date.now()}.pdf`;
    const filePath = await saveToLocal(compressedPdfBytes, fileName, userId);

    res.json({
      success: true,
      message: 'PDF compressed successfully',
      fileName,
      downloadUrl: `${req.protocol}://${req.get("host")}/uploads/${userId}/${path.basename(filePath)}`
    });

  } catch (error) {
    console.error('PDF compress error:', error);
    res.status(500).json({ error: 'Failed to compress PDF', details: error.message });
  }
});

// Rotate PDF
router.post('/rotate', authenticateJWT, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const { angle, pageNumber } = req.body;
    const userId = req.user?.uid || req.user?.id || req.user?.email || 'anonymous';

    if (!angle || ![90, 180, 270].includes(parseInt(angle))) {
      return res.status(400).json({ error: 'Valid rotation angle (90, 180, 270) required' });
    }

    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pageCount = pdfDoc.getPageCount();

    if (pageNumber && (pageNumber < 1 || pageNumber > pageCount)) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    if (pageNumber) {
      pdfDoc.getPage(pageNumber - 1).setRotation(degrees(parseInt(angle)));
    } else {
      pdfDoc.getPages().forEach(page => page.setRotation(degrees(parseInt(angle))));
    }

    const rotatedPdfBytes = await pdfDoc.save();
    const fileName = `rotated-${angle}deg-${Date.now()}.pdf`;
    const filePath = await saveToLocal(rotatedPdfBytes, fileName, userId);

    res.json({
      success: true,
      message: 'PDF rotated successfully',
      fileName,
      downloadUrl: `${req.protocol}://${req.get("host")}/uploads/${userId}/${path.basename(filePath)}`
    });

  } catch (error) {
    console.error('PDF rotate error:', error);
    res.status(500).json({ error: 'Failed to rotate PDF', details: error.message });
  }
});

// Stamp a drawn signature onto a PDF
router.post('/stamp-signature', authenticateJWT, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'PDF file is required' });

    const userId = req.user?.uid || req.user?.id || req.user?.email || 'anonymous';
    const { signatureDataUrl, page = 'last', x = 50, y = 50, width = 180 } = req.body;

    if (!signatureDataUrl || typeof signatureDataUrl !== 'string' || !signatureDataUrl.startsWith('data:image')) {
      return res.status(400).json({ error: 'signatureDataUrl (data:image/png;base64,...) is required' });
    }

    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pages = pdfDoc.getPages();
    const targetIndex = page === 'last' ? pages.length - 1 : Math.max(0, Math.min(pages.length - 1, parseInt(page) - 1));
    const targetPage = pages[targetIndex];

    // Decode base64
    const base64 = signatureDataUrl.split(',')[1];
    const sigBytes = Buffer.from(base64, 'base64');
    let sigImage;
    try {
      sigImage = await pdfDoc.embedPng(sigBytes);
    } catch {
      sigImage = await pdfDoc.embedJpg(sigBytes);
    }
    const sigDims = sigImage.scale(width / sigImage.width);

    targetPage.drawImage(sigImage, { x: Number(x), y: Number(y), width: sigDims.width, height: sigDims.height });

    const signedBytes = await pdfDoc.save();
    const fileName = `signed-${Date.now()}.pdf`;
    const filePath = await saveToLocal(signedBytes, fileName, userId);

    res.json({
      success: true,
      message: 'Signature stamped successfully',
      fileName,
      downloadUrl: `${req.protocol}://${req.get("host")}/uploads/${userId}/${path.basename(filePath)}`
    });

  } catch (error) {
    console.error('PDF stamp-signature error:', error);
    res.status(500).json({ error: 'Failed to stamp signature', details: error.message });
  }
});

module.exports = router;
