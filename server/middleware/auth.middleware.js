const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Người dùng không tồn tại' });
            }

            next();
        } catch (error) {
            console.error('Lỗi xác thực:', error.message);
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Không có token, quyền truy cập bị từ chối' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Cần đăng nhập để thực hiện thao tác này' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Quyền hạn không đủ. Cần quyền: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

module.exports = { protect, authorize };