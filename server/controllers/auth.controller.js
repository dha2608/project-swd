const authService = require('../services/auth.service');

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const user = await authService.registerUser(name, email, password, role);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Đăng nhập user
// @route   POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.loginUser(email, password);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,
    login,
};