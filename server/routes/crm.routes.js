const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crm.controller');

// Định nghĩa các endpoints cho Phần 1.c
// POST /api/crm/test-drives
router.post('/test-drives', crmController.createTestDrive);

// POST /api/crm/feedback
router.post('/feedback', crmController.createFeedback);

module.exports = router;