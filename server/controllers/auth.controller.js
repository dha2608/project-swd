const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await authService.registerUser(name, email, password, role);
        
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user._id);
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};