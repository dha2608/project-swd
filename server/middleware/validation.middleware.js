const { body, validationResult, oneOf } = require('express-validator');
const rules = require('../config/businessRules');

const validateRegisterRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Tên là bắt buộc')
        .isLength({ min: 2, max: 50 })
        .withMessage('Tên phải từ 2-50 ký tự'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email là bắt buộc')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),

    body('role')
        .optional()
        .isIn(['DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'])
        .withMessage('Vai trò không hợp lệ')
];

const validateLoginRules = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email là bắt buộc')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc')
];

const validateCustomerRules = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Tên khách hàng là bắt buộc')
        .isLength({ min: 2, max: 50 })
        .withMessage('Tên phải từ 2-50 ký tự'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Số điện thoại là bắt buộc')
        .matches(rules.PHONE_REGEX)
        .withMessage('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10–11 số)'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
];

const validateFeedbackRules = [
    oneOf([
        [
            body('customerId')
                .exists()
                .withMessage('Vui lòng chọn khách hàng hiện có hoặc nhập thông tin mới')
                .bail()
                .isMongoId()
                .withMessage('ID khách hàng không hợp lệ')
        ],
        [
            body('customerName')
                .trim()
                .notEmpty()
                .withMessage('Tên khách hàng là bắt buộc')
                .isLength({ min: 2, max: 50 })
                .withMessage('Tên phải từ 2-50 ký tự'),
            body('customerPhone')
                .matches(rules.PHONE_REGEX)
                .withMessage('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10–11 số)')
        ]
    ], 'Vui lòng chọn khách hàng hoặc nhập thông tin khách hàng'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Nội dung phản hồi là bắt buộc')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Nội dung phải từ 10-1000 ký tự'),

    body('type')
        .optional()
        .isIn(rules.FEEDBACK_TYPES)
        .withMessage('Phân loại phản hồi không hợp lệ')
        .bail()
        .custom((value, { req }) => {
            if (value === 'COMPLAINT') {
                const subject = (req.body.subject || '').trim();
                const severity = (req.body.severity || '').trim();
                if (!subject || subject.length < 3) {
                    throw new Error('Chủ đề bắt buộc cho khiếu nại (tối thiểu 3 ký tự)');
                }
                if (!rules.FEEDBACK_SEVERITY.includes(severity)) {
                    throw new Error('Mức độ nghiêm trọng không hợp lệ (LOW, MEDIUM, HIGH)');
                }
            }
            return true;
        }),

    body('subject')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Chủ đề phải từ 3-100 ký tự'),

    body('severity')
        .optional()
        .isIn(rules.FEEDBACK_SEVERITY)
        .withMessage('Mức độ nghiêm trọng không hợp lệ (LOW, MEDIUM, HIGH)'),

    body('channel')
        .optional()
        .isIn(rules.FEEDBACK_CHANNELS)
        .withMessage('Kênh ghi nhận không hợp lệ (IN_PERSON, PHONE, EMAIL)'),

    body('vehicleId')
        .optional()
        .isMongoId()
        .withMessage('Vehicle ID không hợp lệ')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); 
    }

    const extractedErrors = [];
    errors.array().forEach(err => {
        extractedErrors.push({
            field: err.path,
            message: err.msg
        });
    });

    return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: extractedErrors
    });
};

const validateVehicleRules = [
    body('model')
        .trim()
        .notEmpty()
        .withMessage('Tên mẫu xe là bắt buộc')
        .isLength({ min: 1, max: 100 })
        .withMessage('Tên mẫu xe phải từ 1-100 ký tự'),

    body('brand')
        .trim()
        .notEmpty()
        .withMessage('Hãng xe là bắt buộc')
        .isLength({ min: 1, max: 50 })
        .withMessage('Hãng xe phải từ 1-50 ký tự'),

    body('year')
        .isInt({ min: 2020, max: new Date().getFullYear() + 1 })
        .withMessage('Năm sản xuất phải từ 2020 đến năm sau'),

    body('vin')
        .trim()
        .notEmpty()
        .withMessage('Số khung là bắt buộc')
        .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
        .withMessage('Số khung phải có 17 ký tự hợp lệ'),

    body('color')
        .trim()
        .notEmpty()
        .withMessage('Màu xe là bắt buộc'),

    body('price')
        .isFloat({ min: 0 })
        .withMessage('Giá xe phải là số dương'),

    body('batteryCapacity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Dung lượng pin phải là số dương'),

    body('range')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Tầm hoạt động phải là số dương'),

    body('chargingTime')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Thời gian sạc phải là số dương'),

    body('status')
        .optional()
        .isIn(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE'])
        .withMessage('Trạng thái xe không hợp lệ')
];

const validateTestDriveRules = [
    oneOf([
        [
            body('customerId')
                .exists()
                .withMessage('Vui lòng chọn khách hàng hiện có hoặc nhập thông tin mới')
                .bail()
                .isMongoId()
                .withMessage('ID khách hàng không hợp lệ')
                .bail()
                .custom(async (value) => {
                    const Customer = require('../models/customer.model');
                    const exists = await Customer.findById(value);
                    if (!exists) {
                        throw new Error('Khách hàng không tồn tại. Vui lòng nhập tên và số điện thoại.');
                    }
                    return true;
                })
        ],
        [
            body('customerName')
                .trim()
                .notEmpty()
                .withMessage('Tên khách hàng là bắt buộc')
                .isLength({ min: 2, max: 50 })
                .withMessage('Tên phải từ 2-50 ký tự'),
            body('customerPhone')
                .isMobilePhone('vi-VN')
                .withMessage('Số điện thoại không hợp lệ')
        ]
    ], 'Vui lòng chọn khách hàng hoặc nhập thông tin khách hàng'),

    body('vehicleId')
        .isMongoId()
        .withMessage('Vehicle ID không hợp lệ'),

    body('schedule')
        .isISO8601()
        .toDate()
        .withMessage('Ngày hẹn không hợp lệ')
        .custom((value) => {
            // Yêu cầu đặt lịch tối thiểu vào ngày hôm sau (không cùng ngày)
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const startOfSelected = new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
            if (startOfSelected.getTime() === startOfToday.getTime()) {
                throw new Error('Đăng ký lái thử trước ít nhất 1 ngày (lái thử vào ngày hôm sau)');
            }
            if (value <= new Date()) {
                throw new Error('Ngày hẹn phải là ngày trong tương lai');
            }
            return true;
        })
        .custom((value) => {
            const hour = value.getHours();
            if (hour < rules.BUSINESS_HOURS_START || hour >= rules.BUSINESS_HOURS_END) {
                throw new Error('Lịch hẹn chỉ trong khung giờ 08:00-18:00');
            }
            return true;
        })
        .custom((value) => {
            // chỉ nhận lịch theo giờ tròn, loại bỏ phút (00)
            if (value.getMinutes() !== 0) {
                throw new Error('Lịch hẹn phải bắt đầu vào đầu giờ (phút = 00)');
            }
            return true;
        })
        .custom((value) => {
            const day = value.getDay();
            if (rules.CLOSED_WEEKDAYS.includes(day)) {
                throw new Error('Không nhận lịch hẹn vào Chủ nhật');
            }
            return true;
        }),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Ghi chú tối đa 500 ký tự')
];

const validateUpdateFeedbackStatusRules = [
    body('status')
        .exists()
        .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
        .withMessage('Trạng thái phản hồi không hợp lệ'),
    body('resolution')
        .optional({ nullable: true })
        .custom((value, { req }) => {
            const status = req.body.status;
            if ((status === 'RESOLVED' || status === 'CLOSED')) {
                if (!value || typeof value !== 'string' || value.trim().length < 10) {
                    throw new Error('Phương án xử lý tối thiểu 10 ký tự khi chuyển sang Đã xử lý/Đóng');
                }
            }
            return true;
        })
];

const validateUpdateTestDriveStatusRules = [
    body('status')
        .exists()
        .isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])
        .withMessage('Trạng thái lịch hẹn không hợp lệ')
];

module.exports = {
    validateRegisterRules,
    validateLoginRules,
    validateCustomerRules,
    validateFeedbackRules,
    validateVehicleRules,
    validateTestDriveRules,
    validateUpdateFeedbackStatusRules,
    validateUpdateTestDriveStatusRules,
    validate
};