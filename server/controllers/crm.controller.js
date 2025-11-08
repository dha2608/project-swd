const crmService = require('../services/crm.service');

async function bookTestDrive(req, res, next) {
    try {
        const { customerId, customerName, customerPhone, customerEmail, vehicleId, schedule, notes } = req.body;
        const dealerId = req.user.id; // Lấy từ user đã đăng nhập

        const testDrive = await crmService.bookTestDrive({ 
            customerId,
            customerName, 
            customerPhone, 
            customerEmail,
            vehicleId, 
            schedule,
            notes,
            dealerId 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Đặt lịch lái thử thành công',
            data: testDrive 
        });
    } catch (error) {
        next(error);
    }
}

async function getTestDrives(req, res, next) {
    try {
        const dealerId = req.user.id;
        const { status, customerPhone, page = 1, limit = 10 } = req.query;

        const result = await crmService.getTestDrives({
            dealerId,
            status,
            customerPhone
        }, parseInt(page), parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách lịch hẹn thành công',
            data: result.testDrives,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

async function updateTestDriveStatus(req, res, next) {
    try {
        const { testDriveId } = req.params;
        const { status } = req.body;
        const dealerId = req.user.id;

        const testDrive = await crmService.updateTestDriveStatus(testDriveId, status, dealerId);

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            data: testDrive
        });
    } catch (error) {
        next(error);
    }
}

async function logFeedback(req, res, next) {
    try {
        const { customerId, customerName, customerPhone, content, type } = req.body;
        const dealerId = req.user.id;

        const feedback = await crmService.logFeedback({ 
            customerId,
            customerName,
            customerPhone,
            content,
            type,
            dealerId 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Tạo phản hồi thành công',
            data: feedback 
        });
    } catch (error) {
        next(error);
    }
}

async function getFeedback(req, res, next) {
    try {
        const dealerId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const result = await crmService.getFeedback({
            dealerId,
            status
        }, parseInt(page), parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách phản hồi thành công',
            data: result.feedback,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
}

async function updateFeedbackStatus(req, res, next) {
    try {
        const { feedbackId } = req.params;
        const { status, resolution } = req.body;
        const dealerId = req.user.id;

        const feedback = await crmService.updateFeedbackStatus(feedbackId, status, resolution, dealerId);

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái phản hồi thành công',
            data: feedback
        });
    } catch (error) {
        next(error);
    }
}

async function getCRMStatistics(req, res, next) {
    try {
        const dealerId = req.user.id;
        const statistics = await crmService.getCRMStatistics(dealerId);

        res.status(200).json({
            success: true,
            message: 'Lấy thống kê CRM thành công',
            data: statistics
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    bookTestDrive,
    getTestDrives,
    updateTestDriveStatus,
    logFeedback,
    getFeedback,
    updateFeedbackStatus,
    getCRMStatistics,
    getCustomers
};

async function getCustomers(req, res, next) {
    try {
        const dealerId = req.user.id;
        const customers = await crmService.getCustomers(dealerId);
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách khách hàng thành công',
            data: customers
        });
    } catch (error) {
        next(error);
    }
}