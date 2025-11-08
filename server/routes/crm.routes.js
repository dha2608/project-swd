const express = require('express');
const { 
    bookTestDrive, 
    getTestDrives, 
    updateTestDriveStatus,
    logFeedback, 
    getFeedback, 
    updateFeedbackStatus,
    getCRMStatistics,
    getCustomers,
    getBookedSlots
} = require('../controllers/crm.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    validateTestDriveRules,
    validateFeedbackRules,
    validate,
    validateUpdateFeedbackStatusRules,
    validateUpdateTestDriveStatusRules
} = require('../middleware/validation.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'));

router.post('/test-drives', validateTestDriveRules, validate, bookTestDrive);
router.get('/test-drives', getTestDrives);
router.put('/test-drives/:testDriveId/status', validateUpdateTestDriveStatusRules, validate, updateTestDriveStatus);
router.get('/test-drives/booked-slots', getBookedSlots);

router.post('/feedback', validateFeedbackRules, validate, logFeedback);
router.get('/feedback', getFeedback);
router.put('/feedback/:feedbackId/status', validateUpdateFeedbackStatusRules, validate, updateFeedbackStatus);

router.get('/statistics', getCRMStatistics);

router.get('/customers', getCustomers);

module.exports = router;