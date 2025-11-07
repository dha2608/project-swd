const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

/**
 * Logic đăng ký
 */
async function registerUser(name, email, password, role) {
    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('Email đã được đăng ký');
    }

    // 2. Tạo user mới (Mật khẩu sẽ tự động được mã hóa bởi 'pre-save' hook)
    const user = await User.create({
        name,
        email,
        password,
        role 
    });

    // 3. Trả về thông tin user (không bao gồm mật khẩu)
    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Dữ liệu người dùng không hợp lệ');
    }
}

/**
 * Logic đăng nhập
 */
async function loginUser(email, password) {
    // 1. Tìm user bằng email
    const user = await User.findOne({ email });

    // 2. Nếu tìm thấy user VÀ mật khẩu khớp (dùng hàm matchPassword)
    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Email hoặc Mật khẩu không đúng');
    }
}

module.exports = {
    registerUser,
    loginUser,
};