const express = require('express');
const admin = require('firebase-admin');
const { authenticateJWT } = require('../middleware/auth');
const config = require('../config/config');

const router = express.Router();

// Simple in-memory product catalog (can be moved to Firestore later)
const plans = {
	free: { id: 'free', name: 'Free', priceMonthly: 0, features: ['100MB storage', '3 uploads/day'] },
	basic: { id: 'basic', name: 'Basic', priceMonthly: 9, features: ['2GB storage', '50 uploads/day', 'Priority queue'] },
	pro: { id: 'pro', name: 'Pro', priceMonthly: 19, features: ['10GB storage', 'Unlimited uploads', 'Priority support'] }
};

// Public config for client (exposes only safe fields)
router.get('/config', authenticateJWT, (req, res) => {
	return res.json({
		success: true,
		razorpayKeyId: config.RAZORPAY_KEY_ID || null,
		merchantUpiId: config.MERCHANT_UPI_ID || null,
		merchantName: config.MERCHANT_NAME || 'PDFPOOL'
	});
});

// Get a payment session (for client to render QR etc.)
router.get('/session/:id', authenticateJWT, async (req, res) => {
	try {
		const doc = await admin.firestore().collection('paymentSessions').doc(req.params.id).get();
		if (!doc.exists) return res.status(404).json({ error: 'Not found' });
		const data = doc.data();
		if (data.userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });
		return res.json({ success: true, session: { id: doc.id, ...data } });
	} catch (err) {
		console.error('Get session error:', err);
		return res.status(500).json({ error: 'Failed to get session' });
	}
});

// Provider-agnostic checkout creation (supports mock or razorpay via provider)
router.post('/v:version/checkout', authenticateJWT, async (req, res) => {
	try {
		const { planId, billingCycle = 'monthly', provider = 'mock', method = 'auto' } = req.body;
		const { version } = req.params;

		if (!planId || !plans[planId]) {
			return res.status(400).json({ error: 'Invalid planId' });
		}

		let sessionId = `sess_${Date.now()}`;
		const multiplier = billingCycle === 'yearly' ? 12 : 1;
		const amountPaise = plans[planId].priceMonthly * 100 * multiplier;
		let checkoutUrl = `${config.FRONTEND_URL}/billing/checkout?session_id=${sessionId}&version=${version}&provider=${provider}&method=${method}`;

		// Razorpay native order (for India: card/upi/qr)
		if (provider === 'razorpay' && config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
			const Razorpay = require('razorpay');
			const instance = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });
			const order = await instance.orders.create({ amount: amountPaise, currency: 'INR', receipt: sessionId, notes: { planId, userId: req.user.uid, billingCycle } });
			sessionId = order.id;
			checkoutUrl = `${config.FRONTEND_URL}/billing/checkout?session_id=${sessionId}&version=${version}&provider=${provider}&method=${method}`;
		}

		// Persist intent for reconciliation/webhooks
		await admin.firestore().collection('paymentSessions').doc(sessionId).set({
			userId: req.user.uid,
			planId,
			billingCycle,
			provider,
			version,
			amountPaise,
			currency: provider === 'razorpay' ? 'INR' : 'USD',
			status: 'created',
			createdAt: admin.firestore.FieldValue.serverTimestamp()
		});

		return res.json({ 
			success: true, 
			checkoutUrl, 
			sessionId, 
			orderId: sessionId, 
			amountPaise, 
			currency: provider === 'razorpay' ? 'INR' : 'USD',
			razorpayKeyId: config.RAZORPAY_KEY_ID || null,
			merchantUpiId: config.MERCHANT_UPI_ID || null,
			merchantName: config.MERCHANT_NAME || 'PDFPOOL'
		});
	} catch (err) {
		console.error('Create checkout error:', err);
		return res.status(500).json({ error: 'Failed to create checkout session' });
	}
});

// Mock webhook to finalize subscription (replace/add real provider webhooks)
router.post('/v:version/webhook/mock', async (req, res) => {
	try {
		const { sessionId, status = 'paid' } = req.body;
		if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

		const sessionRef = admin.firestore().collection('paymentSessions').doc(sessionId);
		const sessionDoc = await sessionRef.get();
		if (!sessionDoc.exists) return res.status(404).json({ error: 'Session not found' });

		const session = sessionDoc.data();
		await sessionRef.update({ status, processedAt: admin.firestore.FieldValue.serverTimestamp() });

		if (status === 'paid') {
			// Update user's plan and quotas
			const plan = plans[session.planId];
			const updates = { plan: plan.id };
			if (plan.id === 'basic') {
				updates.maxStorage = 2 * 1024 * 1024 * 1024; // 2GB
				updates.maxDailyUploads = 50;
			} else if (plan.id === 'pro') {
				updates.maxStorage = 10 * 1024 * 1024 * 1024; // 10GB
				updates.maxDailyUploads = 1000; // effectively unlimited cap
			}
			await admin.firestore().collection('users').doc(session.userId).update(updates);
		}

		return res.json({ success: true });
	} catch (err) {
		console.error('Mock webhook error:', err);
		return res.status(500).json({ error: 'Webhook processing failed' });
	}
});

// Razorpay webhook (minimal) - you must configure webhook secret in Razorpay dashboard
router.post('/v:version/webhook/razorpay', async (req, res) => {
	try {
		// In production, verify signature: req.headers['x-razorpay-signature']
		const { payload } = req.body || {};
		const entity = payload?.payment?.entity || payload?.order?.entity;
		const orderId = entity?.order_id || entity?.id;
		if (!orderId) return res.status(400).json({ error: 'Missing order reference' });
		// Mark as paid and upgrade user plan by reading order notes saved earlier
		const sessionRef = admin.firestore().collection('paymentSessions').doc(orderId);
		const sessionDoc = await sessionRef.get();
		if (!sessionDoc.exists) {
			// attempt to recover by reading from Razorpay order details could be added here
			return res.status(404).json({ error: 'Session not found' });
		}
		const session = sessionDoc.data();
		await sessionRef.update({ status: 'paid', processedAt: admin.firestore.FieldValue.serverTimestamp() });
		const plan = plans[session.planId];
		const updates = { plan: plan.id };
		if (plan.id === 'basic') {
			updates.maxStorage = 2 * 1024 * 1024 * 1024; updates.maxDailyUploads = 50;
		} else if (plan.id === 'pro') {
			updates.maxStorage = 10 * 1024 * 1024 * 1024; updates.maxDailyUploads = 1000;
		}
		await admin.firestore().collection('users').doc(session.userId).update(updates);
		return res.json({ success: true });
	} catch (err) {
		console.error('Razorpay webhook error:', err);
		return res.status(500).json({ error: 'Webhook processing failed' });
	}
});

// Get available plans
router.get('/plans', authenticateJWT, (req, res) => {
	return res.json({ success: true, plans: Object.values(plans) });
});

module.exports = router;


