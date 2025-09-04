const express = require('express');
const admin = require('firebase-admin');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Create a signature request
router.post('/create', authenticateJWT, async (req, res) => {
	try {
		const { documentId, signers = [], message = '' } = req.body;
		if (!documentId || !Array.isArray(signers) || signers.length === 0) {
			return res.status(400).json({ error: 'documentId and at least one signer are required' });
		}

		const request = {
			documentId,
			createdBy: req.user.uid || req.user.id || req.user.userId || req.user.email,
			signers: signers.map(e => ({ email: e, status: 'pending', signedAt: null })),
			message,
			status: 'pending',
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			completedAt: null
		};

		const ref = await admin.firestore().collection('signatureRequests').add(request);
		return res.status(201).json({ message: 'Signature request created', id: ref.id });
	} catch (err) {
		console.error('Signature create error:', err);
		return res.status(500).json({ error: 'Failed to create signature request' });
	}
});

// List my created requests
router.get('/my-requests', authenticateJWT, async (req, res) => {
	try {
		const createdBy = req.user.uid || req.user.id || req.user.userId || req.user.email;
		const snap = await admin
			.firestore()
			.collection('signatureRequests')
			.where('createdBy', '==', createdBy)
			.orderBy('createdAt', 'desc')
			.get();
		const items = [];
		snap.forEach(d => items.push({ id: d.id, ...d.data() }));
		return res.json({ requests: items });
	} catch (err) {
		console.error('Signature list error:', err);
		return res.status(500).json({ error: 'Failed to fetch signature requests' });
	}
});

// Sign a request (marks signer as signed)
router.post('/sign/:id', authenticateJWT, async (req, res) => {
	try {
		const { id } = req.params;
		const email = req.user.email;
		if (!email) return res.status(400).json({ error: 'Email not available on token' });

		const docRef = admin.firestore().collection('signatureRequests').doc(id);
		const doc = await docRef.get();
		if (!doc.exists) return res.status(404).json({ error: 'Request not found' });

		const data = doc.data();
		const idx = data.signers.findIndex(s => s.email === email);
		if (idx === -1) return res.status(403).json({ error: 'You are not a signer on this request' });
		if (data.signers[idx].status === 'signed') {
			return res.status(400).json({ error: 'Already signed' });
		}

		data.signers[idx].status = 'signed';
		data.signers[idx].signedAt = admin.firestore.FieldValue.serverTimestamp();
		const allSigned = data.signers.every(s => s.status === 'signed');
		if (allSigned) {
			data.status = 'completed';
			data.completedAt = admin.firestore.FieldValue.serverTimestamp();
		}

		await docRef.update(data);
		return res.json({ message: 'Signed successfully', status: data.status });
	} catch (err) {
		console.error('Signature sign error:', err);
		return res.status(500).json({ error: 'Failed to sign' });
	}
});

// Health
router.get('/test', authenticateJWT, (req, res) => {
	res.json({ message: 'Signatures route working' });
});

module.exports = router;
