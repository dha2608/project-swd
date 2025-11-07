const { body, validationResult } = require('express-validator');

const validateTestDriveRules = [
    body('customerName')
        .trim()
        .notEmpty()
        .withMessage('Tên khách hàng là bắt buộc.'),

    body('customerPhone')
        .isMobilePhone('vi-VN')
        .withMessage('Số điện thoại không hợp lệ.'),

    body('vehicleId')
        .isMongoId()
        .withMessage('Vehicle ID không hợp lệ.'),
    

    body('schedule')
        .isISO8601()
        .toDate()
        .withMessage('Ngày hẹn không hợp lệ.')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); 
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(400).json({
        errors: extractedErrors,
    });
};

module.exports = {
    validateTestDriveRules,
    validate,
};