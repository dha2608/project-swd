const crmService = require('../services/crm.service');

// Xử lý logic cho "Tạo Lịch hẹn"
const createTestDrive = async (req, res) => {
    try {
        // req.body là "formData" (Msg 2 trong Sơ đồ Tuần tự)
        const testDrive = await crmService.bookTestDrive(req.body);
        // Trả về "Success" (Msg 12)
        res.status(201).json(testDrive);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xử lý logic cho "Ghi nhận Khiếu nại"
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