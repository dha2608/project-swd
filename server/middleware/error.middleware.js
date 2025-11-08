const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('Error Context:', {
        method: req.method,
        url: req.originalUrl,
        user: req.user ? { id: req.user.id, role: req.user.role } : null,
        message: err.message
    });
    console.error('Error Stack:', err.stack);

    if (err.name === 'CastError') {
        const message = 'Tài nguyên không tồn tại';
        error = { message, statusCode: 404 };
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} đã tồn tại`;
        error = { message, statusCode: 400 };
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message: message.join(', '), statusCode: 400 };
    }

    if (err.name === 'JsonWebTokenError') {
        const message = 'Token không hợp lệ';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token đã hết hạn';
        error = { message, statusCode: 401 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Lỗi máy chủ nội bộ',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;