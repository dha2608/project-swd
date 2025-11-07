const express = require('express');
const router = express.Router();
const { createTestDrive, createFeedback } = require('../controllers/crm.controller');

// API cho Phần 1.c

// POST /api/crm/test-drives
router.post('/test-drives', createTestDrive);

// POST /api/crm/feedback
router.post('/feedback', createFeedback);

module.exports = router;