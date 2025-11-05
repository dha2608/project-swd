const crmService = require('../services/crm.service');

// Thông điệp 2: createAppointment(formData)
const createTestDrive = async (req, res) => {
    try {
        // req.body chính là "formData"
        const testDrive = await crmService.bookTestDrive(req.body);
        // Thông điệp 11 & 12: Success
        res.status(201).json(testDrive);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createFeedback = async (req, res) => {
    try {
        const feedback = await crmService.logFeedback(req.body);
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createTestDrive,
    createFeedback
};