const express = require('express');
const admin = require('firebase-admin');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

// Create a form template (metadata only for MVP)
router.post('/templates', authenticateJWT, async (req, res) => {
	try {
		const { name, fields = [], description = '' } = req.body;
		if (!name) return res.status(400).json({ error: 'name is required' });
		const ref = await admin.firestore().collection('formTemplates').add({
			userId: req.user.uid || req.user.id || req.user.email,
			name,
			description,
			fields,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
			usageCount: 0
		});
		return res.status(201).json({ message: 'Template created', id: ref.id });
	} catch (err) {
		console.error('Create template error:', err);
		return res.status(500).json({ error: 'Failed to create template' });
	}
});

// List my templates
router.get('/templates', authenticateJWT, async (req, res) => {
	try {
		const snap = await admin
			.firestore()
			.collection('formTemplates')
			.where('userId', '==', (req.user.uid || req.user.id || req.user.email))
			.orderBy('createdAt', 'desc')
			.get();
		const items = [];
		snap.forEach(d => items.push({ id: d.id, ...d.data() }));
		return res.json({ templates: items });
	} catch (err) {
		console.error('List templates error:', err);
		return res.status(500).json({ error: 'Failed to fetch templates' });
	}
});

// Fill a template (store filled record)
router.post('/fill/:templateId', authenticateJWT, async (req, res) => {
	try {
		const { templateId } = req.params;
		const { data = {} } = req.body;
		const templates = admin.firestore().collection('formTemplates');
		const t = await templates.doc(templateId).get();
		if (!t.exists) return res.status(404).json({ error: 'Template not found' });

		await admin.firestore().collection('filledForms').add({
			templateId,
			userId: req.user.uid || req.user.id || req.user.email,
			data,
			createdAt: admin.firestore.FieldValue.serverTimestamp()
		});

		await templates.doc(templateId).update({
			usageCount: admin.firestore.FieldValue.increment(1)
		});

		return res.json({ message: 'Form filled', templateId });
	} catch (err) {
		console.error('Fill template error:', err);
		return res.status(500).json({ error: 'Failed to fill template' });
	}
});

// Health
router.get('/test', authenticateJWT, (req, res) => {
	res.json({ message: 'Forms route working' });
});

module.exports = router;
