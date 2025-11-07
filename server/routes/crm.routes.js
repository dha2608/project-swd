const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crm.controller');

const { validateTestDriveRules, validate } = require('../middleware/validator');

router.post(
    '/test-drives', 
    validateTestDriveRules, 
    validate,              
    crmController.createTestDrive 
);


router.post('/feedback', crmController.createFeedback);

module.exports = router;